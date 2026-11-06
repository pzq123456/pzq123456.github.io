"""Resume rendering pipeline (orchestrator, stdlib + Jinja2).

Pipeline:
    resume.json / variant overlay -> resolve (base + overlay) -> localize(lang)
                -> validate (schema) -> normalize (ResumeModel)
                -> placement spec (WHERE) -> Jinja template (HOW)
                -> HTML -> Chromium -> PDF -> preview PNG -> QA

The fact source is bilingual: translatable leaves are ``{"en": ..., "zh": ...}``.
``base.json`` is the single catalog (entries carry stable ids); each
``data/variants/*.json`` is an overlay listing only composition + overrides.
Everything renders per language (``--lang en|zh``) into
``<variant>-<lang>.pdf`` plus one stacked ``preview_<variant>-<lang>.png``.

Only Schema, Template, Renderer, QA are deterministic. Content-to-slot
mapping lives in resume/placement.json (hand-written today, agent-written
tomorrow) and is validator-checked: refs must resolve, required sources
covered exactly once, no rewrites.

Usage (from repo root):
    python resume/render.py resume/data/base.json dist/cv --lang en
    python resume/render.py resume/data/variants/fullstack.json dist/cv --lang zh
    python resume/render.py --selftest
"""
from __future__ import annotations

import argparse
import html
import json
import os
import re
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).parent
ROOT = HERE.parent  # repo root (resume/ -> root)
DEFAULT_SRC = HERE / "data" / "base.json"
DEFAULT_PLACEMENT = HERE / "placement.json"

if __package__ in (None, ""):  # script mode: python src/resume/render.py
    sys.path.insert(0, str(HERE))
    from normalize import normalize_resume
    from placement import (PlacementError, load_spec, parse_slots,
                           validate_spec)
    from qa import print_report, run_pdf_qa, run_structural_qa
    from renderer import render_header, render_nodes, render_placed
    from resolve import ResolveError, LANGS, localize, resolve_source
    from schema import ResumeValidationError, validate_raw
    from theme import THEMES, get_theme
else:  # package mode: python -m resume
    from .normalize import normalize_resume
    from .placement import (PlacementError, load_spec, parse_slots,
                            validate_spec)
    from .qa import print_report, run_pdf_qa, run_structural_qa
    from .renderer import render_header, render_nodes, render_placed
    from .resolve import ResolveError, LANGS, localize, resolve_source
    from .schema import ResumeValidationError, validate_raw
    from .theme import THEMES, get_theme

import jinja2
from markupsafe import Markup

THEME_SMOKE_ACCENTS = ("#B14E2E", "#58758A", "#657A70", "#756F82", "#805F63")


# ---------------- PDF backend ----------------
def find_edge():
    env = os.environ.get("CV_EDGE_BIN")
    if env and Path(env).exists():
        return env
    import shutil
    for cmd in ("google-chrome", "google-chrome-stable", "chromium",
                "chromium-browser", "msedge", "chrome"):
        found = shutil.which(cmd)
        if found:
            return found
    for p in (r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
              r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
              r"C:\Program Files\Google\Chrome\Application\chrome.exe",
              "/usr/bin/google-chrome",
              "/usr/bin/chromium",
              "/usr/bin/chromium-browser"):
        if Path(p).exists():
            return p
    return None


def build_pdf(html_path: Path, pdf_path: Path) -> bool:
    edge = find_edge()
    if not edge:
        print("WARN: no Edge/Chrome found (set CV_EDGE_BIN); skipped PDF")
        return False
    cmd = [edge, "--headless=new", "--disable-gpu", "--no-sandbox",
           "--no-pdf-header-footer", f"--print-to-pdf={pdf_path}",
           html_path.as_uri()]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if not pdf_path.exists():
        print("WARN: print-to-pdf produced nothing")
        print(r.stdout[-2000:] + r.stderr[-2000:])
        return False
    print(f"wrote {pdf_path} ({pdf_path.stat().st_size/1024:.0f} KB)")
    return True


def build_preview(pdf_path: Path, png_path: Path) -> None:
    """Write one deterministic preview image for the whole PDF.

    Every page is rendered full-width (real page margins preserved) with only
    its trailing blank rows trimmed, then stacked vertically. Applying the same
    rule to single- and multi-page PDFs keeps EN and ZH previews consistent.
    Exactly one file is written so the frontend can link
    ``preview_<variant>-<lang>.png`` without knowing the page count.
    """
    try:
        import pymupdf
    except ImportError:
        print("pymupdf missing, skipped preview")
        return
    d = pymupdf.open(str(pdf_path))
    if len(d) == 0:
        return
    pixmaps = [d[i].get_pixmap(dpi=110) for i in range(len(d))]
    try:
        from PIL import Image, ImageChops
    except ImportError:
        pixmaps[0].save(str(png_path))
        return
    slices = []
    for p in pixmaps:
        im = Image.frombytes("RGB", (p.width, p.height), p.samples)
        # Keep x/left/right/top margins intact; drop only the blank bottom band
        # so a mostly-empty last page does not leave a huge white gap.
        diff = ImageChops.difference(im, Image.new("RGB", im.size, "white"))
        bbox = diff.convert("L").point(lambda x: 255 if x > 12 else 0).getbbox()
        bottom = bbox[3] if bbox is not None else 0
        if bottom <= 0:
            continue  # fully blank page
        slices.append(im.crop((0, 0, im.width, bottom)))
    if not slices:
        pixmaps[0].save(str(png_path))
        return
    width = max(im.width for im in slices)
    height = sum(im.height for im in slices)
    canvas = Image.new("RGB", (width, height), "white")
    y = 0
    for im in slices:
        canvas.paste(im, (0, y))
        y += im.height
    canvas.save(str(png_path))


# ---------------- pipeline ----------------
def render_html(model: dict, theme: dict, template_text: str,
                ordered: dict, lang: str = "en") -> str:
    """Execute template with full model context.

    Templates receive: title, theme, name/role/contact (safe HTML),
    slots (per-slot lists of SlotItems with .html + .section),
    model (full normalized ResumeModel), ordered (validated spec),
    and the inline(nodes) helper for custom markup.
    """
    env = jinja2.Environment(autoescape=True)
    env.globals["inline"] = lambda nodes: Markup(render_nodes(nodes or []))
    tpl = env.from_string(template_text)
    name_html, role_html, contact_html = render_header(model)
    return tpl.render(
        title=f"{model['name']} — {model['role']}",
        theme=theme,
        name=name_html,
        role=role_html,
        contact=contact_html,
        slots=render_placed(ordered, model, lang),
        model=model,
        ordered=ordered,
    )


def selftest() -> int:
    """Fixture regression + variant overlay + theme smoke + placement checks."""
    template_text = (HERE / "template.html").read_text(encoding="utf-8")
    placement = load_spec(DEFAULT_PLACEMENT)
    slots = parse_slots(template_text)

    def model_for(src: Path, lang: str) -> dict:
        # Localize first: schema/normalize only ever see plain strings, so a
        # leaked localized leaf fails validation instead of reaching the PDF.
        localized = resolve_source(src, lang)
        validate_raw(localized)
        return normalize_resume(localized)

    # base.json is the single bilingual fact catalog.
    model_en = model_for(DEFAULT_SRC, "en")
    model_zh = model_for(DEFAULT_SRC, "zh")
    c = model_en["counts"]
    assert c["sections"] == 5, f"sections {c['sections']} != 5"
    assert c["entries"] == 12, f"entries {c['entries']} != 12"
    assert c["skill_groups"] == 4, f"skill groups {c['skill_groups']} != 4"
    assert model_en["name"] == "Pan Zhiqing", model_en["name"]
    assert model_zh["name"] == "潘志清", model_zh["name"]

    ordered = validate_spec(placement, model_en, slots)
    base_html = render_html(model_en, get_theme("editorial", model_en["accent"]),
                            template_text, ordered, lang="en")
    for needle in ("Pan Zhiqing", "Experience", "2026.04", "3.9 / 4.3",
                   "10.1016/j.ufug.2025.129095"):
        assert needle in base_html, f"fixture missing {needle!r}"
    for lit in ("undefined", "[object Object]", ">None<"):
        assert lit not in base_html, f"forbidden literal {lit!r}"
    n_links = len(re.findall(r'href="', base_html))
    assert n_links == 12, f"links {n_links} != 12"
    for accent in THEME_SMOKE_ACCENTS:
        h = render_html(model_en, get_theme("editorial", accent),
                        template_text, ordered, lang="en")
        assert accent in h and "[object Object]" not in h
    for theme_name in THEMES:
        h = render_html(model_zh, get_theme(theme_name, model_zh["accent"]),
                        template_text, ordered, lang="zh")
        assert "潘志清" in h

    # Every variant overlay resolves and renders in both languages.
    variants = sorted((HERE / "data" / "variants").glob("*.json"))
    assert variants, "no variants found"
    for vf in variants:
        for lang in LANGS:
            model = model_for(vf, lang)
            v_html = render_html(model, get_theme("editorial", model["accent"]),
                                 template_text,
                                 validate_spec(placement, model, slots), lang=lang)
            for lit in ("undefined", "[object Object]", ">None<"):
                assert lit not in v_html, f"{vf.stem}:{lang} leaked {lit!r}"

    # Placement validator negative cases.
    bad_ref = {"slots": {"main": [
        {"source": "nope", "title": {"en": "X"}, "presentation": "full"}]}}
    for bad in (bad_ref,
                {"slots": {"main": [
                    {"source": "work", "title": {"en": "W"},
                     "presentation": "full"}]}},  # missing coverage
                {"slots": {"nope": [
                    {"source": "work", "title": {"en": "W"},
                     "presentation": "full"}]}}):  # unknown slot
        try:
            validate_spec(bad, model_en, ["main"])
            raise AssertionError(f"placement accepted invalid spec {bad}")
        except PlacementError:
            pass
    print(f"selftest PASS: 5 sections / 12 entries / 12 links / "
          f"{len(variants)} variants x {len(LANGS)} langs / "
          f"{len(THEME_SMOKE_ACCENTS)} accents x {len(THEMES)} themes / "
          f"placement validator")
    return 0


def parse_args(argv=None):
    p = argparse.ArgumentParser(description="Resume JSON -> HTML -> PDF pipeline")
    p.add_argument("src", nargs="?", default=str(DEFAULT_SRC))
    p.add_argument("out", nargs="?", default=str(ROOT / "output"))
    p.add_argument("--theme", default="editorial", choices=list(THEMES))
    p.add_argument("--template", default=None,
                   help="theme-owned template.html (default: src/resume/template.html)")
    p.add_argument("--placement", default=str(DEFAULT_PLACEMENT))
    p.add_argument("--accent", default=None, help="override accent, e.g. #58758A")
    p.add_argument("--lang", default="en", choices=list(LANGS),
                   help="output language (localizes the shared fact file)")
    p.add_argument("--max-pages", type=int, default=2)
    p.add_argument("--selftest", action="store_true")
    return p.parse_args(argv)


def main(argv=None) -> int:
    args = parse_args(argv)
    if args.selftest:
        return selftest()
    src = Path(args.src).resolve()
    out_dir = Path(args.out).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    try:
        raw = resolve_source(src, args.lang)
        validate_raw(raw)
    except (ResumeValidationError, ResolveError, json.JSONDecodeError, OSError) as exc:
        print(f"ResumeValidationError: {exc}")
        return 2
    if args.accent:
        raw = dict(raw, meta=dict(raw.get("meta", {}), accent=args.accent))
        try:
            validate_raw(raw)
        except ResumeValidationError as exc:
            print(f"ResumeValidationError: {exc}")
            return 2

    try:
        template_path = Path(args.template).resolve() if args.template else HERE / "template.html"
        template_text = template_path.read_text(encoding="utf-8")
        model = normalize_resume(raw)
        ordered = validate_spec(load_spec(Path(args.placement).resolve()),
                                model, parse_slots(template_text))
    except (PlacementError, OSError) as exc:
        print(f"PlacementError: {exc}")
        return 2

    theme = get_theme(args.theme, model["accent"])
    html_out = render_html(model, theme, template_text, ordered, lang=args.lang)

    stem = f"{src.stem}-{args.lang}"
    html_path = out_dir / f"{stem}.html"
    html_path.write_text(html_out, encoding="utf-8")
    print("wrote", html_path)

    pdf_path = out_dir / f"{stem}.pdf"
    if build_pdf(html_path, pdf_path):
        build_preview(pdf_path, out_dir / f"preview_{stem}.png")

    print("\nPlacement:")
    for name, assignments in ordered.items():
        srcs = ", ".join(f"{a['source']}({a['presentation']})" for a in assignments)
        print(f"  [PASS] slot '{name}' <- {srcs}")
    struct = run_structural_qa(model, html_out)
    pdfqa = run_pdf_qa(pdf_path, max_pages=args.max_pages, lang=args.lang)
    print_report(struct, pdfqa)
    if struct["errors"] + pdfqa["errors"]:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
