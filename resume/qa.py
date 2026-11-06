"""Structural + PDF QA for the resume pipeline (stdlib + optional pymupdf).

QA never modifies content. It reports pass/warn/error and returns a
non-zero-worthy status for the CLI.
"""
from __future__ import annotations

import re
from pathlib import Path

FORBIDDEN_RENDERED = ("undefined", "[object Object]", ">None<", ">null<")

# Families that indicate an embedded CJK-capable face (name-matched).
CJK_FONT_RE = re.compile(
    r"(CJK|Source Han|SourceHan|Noto Sans SC|NotoSansSC|Noto Serif CJK|"
    r"WenQuanYi|YaHei|SimSun|SimHei|PingFang|Heiti|Hiragino|Droid Sans Fallback|"
    r"Noto Sans SC)",
    re.IGNORECASE,
)

# A zh PDF with an embedded CJK face is hundreds of KB; without one (tofu) it
# stays small (Latin-only subset). Used as a name-independent fallback because
# Chrome/PyMuPDF report CJK faces (esp. OpenType/CFF Noto) inconsistently.
CJK_MIN_PDF_KB = 150


def collect_font_names(doc, pages: int) -> list[str]:
    """All font names seen in the doc: font descriptors + rendered text spans.

    PyMuPDF's ``get_page_fonts`` basefont field is unreliable for CID/Type0
    CJK faces, so we also read the per-span font name from the text layer.
    """
    names: set[str] = set()
    for i in range(pages):
        for entry in doc.get_page_fonts(i, full=True):
            if isinstance(entry, (list, tuple)):
                for field in entry:
                    if isinstance(field, str) and field.strip():
                        names.add(field.strip())
        try:
            text_dict = doc[i].get_text("dict")
        except Exception:
            text_dict = {}
        for block in text_dict.get("blocks", []):
            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    font = span.get("font")
                    if font:
                        names.add(str(font).strip())
    return sorted(names)


def _count_links(html_out: str) -> tuple[int, list[str]]:
    hrefs = re.findall(r'href="([^"]+)"', html_out)
    return len(hrefs), hrefs


def _unsafe_hrefs(hrefs: list[str]) -> list[str]:
    bad = []
    for h in hrefs:
        hl = h.strip().lower()
        if re.match(r"^(javascript|data|vbscript|file|blob):", hl):
            bad.append(h)
    return bad


def run_structural_qa(model: dict, html_out: str) -> dict:
    checks: list[tuple[str, str, str]] = []  # (status, name, detail)
    errors = warnings = 0

    def add(status: str, name: str, detail: str = ""):
        nonlocal errors, warnings
        checks.append((status, name, detail))
        if status == "ERROR":
            errors += 1
        elif status == "WARN":
            warnings += 1

    # Required fields
    if model.get("name", "").strip():
        add("PASS", "name", model["name"])
    else:
        add("ERROR", "name", "missing")
    c = model["counts"]
    add("PASS" if c["sections"] else "ERROR", "sections", str(c["sections"]))
    add("PASS" if c["entries"] else "ERROR", "entries", str(c["entries"]))
    for key, s in model["sections"].items():
        if not s["entries"] and not s["skills"] and not s["paras"] and not s["bullets"]:
            add("WARN", "empty-section", key)

    # Links
    n_links, hrefs = _count_links(html_out)
    bad = _unsafe_hrefs(hrefs)
    add("PASS" if not bad else "ERROR", "unsafe-links",
        f"{len(bad)} unsafe" if bad else f"{n_links} links, 0 unsafe")
    if not n_links:
        add("WARN", "no-links", "resume has no hyperlinks")

    # Forbidden literals
    for lit in FORBIDDEN_RENDERED:
        if lit in html_out:
            add("ERROR", "forbidden-literal", lit)
    else:
        add("PASS", "no-forbidden-literals", "")

    # No-drop: every entry title, skill label, contact email and DOI
    # must survive rendering, whatever structure the template uses.
    required: list[str] = []
    for s in model["sections"].values():
        for e in s["entries"]:
            head = (e["title_text"] or "").split("|")[0].strip()
            if head:
                required.append(head)
        for sk in s["skills"]:
            if sk["label"].strip():
                required.append(sk["label"].strip())
    for ct in model["contact"]:
        if ct["raw_href"].startswith("mailto:"):
            required.append(ct["raw_href"][len("mailto:"):])
    for s in model["sections"].values():
        for e in s["entries"]:
            for lk in e["links"]:
                if "doi.org" in (lk["raw_href"] or ""):
                    required.append(lk["raw_href"].split("doi.org/")[-1])
    missing = [r for r in required
               if r and r not in html_out
               and __import__("html").escape(r) not in html_out
               and r[:12] not in html_out
               and __import__("html").escape(r[:12]) not in html_out]
    if missing:
        add("ERROR", "content-loss", "; ".join(missing[:3]))
    else:
        add("PASS", "content-present",
            f"{c['entries']} entries / {c['entry_bullets']} bullet groups")

    return {"checks": checks, "errors": errors, "warnings": warnings,
            "links": n_links, "hrefs": hrefs}


def run_pdf_qa(pdf_path: Path, max_pages: int = 2,
               lang: str | None = None) -> dict:
    checks: list[tuple[str, str, str]] = []
    errors = warnings = 0

    def add(status: str, name: str, detail: str = ""):
        nonlocal errors, warnings
        checks.append((status, name, detail))
        if status == "ERROR":
            errors += 1
        elif status == "WARN":
            warnings += 1

    if not pdf_path.exists():
        add("ERROR", "pdf-exists", str(pdf_path))
        return {"checks": checks, "errors": errors, "warnings": warnings,
                "pages": 0}
    try:
        size_kb = pdf_path.stat().st_size / 1024
    except OSError:
        size_kb = 0
    add("PASS", "pdf-exists", f"{size_kb:.0f} KB")
    try:
        import pymupdf
    except ImportError:
        add("WARN", "page-count", "pymupdf missing, skipped")
        return {"checks": checks, "errors": errors, "warnings": warnings,
                "pages": -1}
    d = pymupdf.open(str(pdf_path))
    n = len(d)
    if n <= max_pages:
        add("PASS", "page-count", f"{n} pages (max {max_pages})")
    else:
        add("ERROR", "page-count", f"{n} pages; maximum is {max_pages}")
    # Density heuristic: warn when the last page holds <15% of all text.
    try:
        lens = [len(p.get_text().strip()) for p in d]
        total = sum(lens)
        if n > 1 and total > 0 and lens[-1] / total < 0.15:
            add("WARN", "density",
                f"last page holds {lens[-1]/total:.0%} of text; "
                "consider grouping")
        else:
            add("PASS", "density", f"{n} page(s), last-page share ok")
    except Exception as exc:  # never fail QA on heuristics
        add("WARN", "density", f"skipped ({exc})")

    # CJK coverage: a zh PDF must actually include a CJK-capable face. A
    # missing system CJK font makes Chromium render tofu without embedding one,
    # and the text layer alone would not reveal it.
    if lang == "zh":
        try:
            names = collect_font_names(d, n)
            cjk = [x for x in names if CJK_FONT_RE.search(x)]
            if cjk:
                add("PASS", "cjk-font", cjk[0])
            elif names and size_kb >= CJK_MIN_PDF_KB:
                # Font program is clearly embedded (size), but the face name
                # was not recognized (e.g. Noto CJK via CID/Type0).
                add("PASS", "cjk-font",
                    f"embedded (~{size_kb:.0f} KB; name: {names[0]})")
            else:
                add("ERROR", "cjk-font",
                    "no CJK font embedded; install fonts-noto-cjk "
                    f"(Chinese text would render as tofu; {size_kb:.0f} KB, "
                    f"names: {', '.join(names[:3]) or 'none'})")
        except Exception as exc:  # never fail QA on font introspection
            add("WARN", "cjk-font", f"skipped ({exc})")
    return {"checks": checks, "errors": errors, "warnings": warnings,
            "pages": n}


def print_report(struct: dict, pdf: dict) -> None:
    print("\nResume QA\n")
    print("Content:")
    for st, name, detail in struct["checks"]:
        mark = {"PASS": "[PASS]", "WARN": "[WARN]", "ERROR": "[ERROR]"}[st]
        print(f"  {mark} {name}" + (f" -- {detail}" if detail else ""))
    print("\nPDF:")
    for st, name, detail in pdf["checks"]:
        mark = {"PASS": "[PASS]", "WARN": "[WARN]", "ERROR": "[ERROR]"}[st]
        print(f"  {mark} {name}" + (f" -- {detail}" if detail else ""))
    print(f"\nQA: {struct['errors'] + pdf['errors']} errors, "
          f"{struct['warnings'] + pdf['warnings']} warnings")
