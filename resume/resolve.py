"""Shared-fact resolver: base catalog + variant overlay -> full resume JSON.

The resume data is bilingual: a translatable leaf is either a plain string
(language-neutral, e.g. a tech name or a date) or ``{"en": ..., "zh": ...}``.

    resume/data/base.json          the single fact catalog; entries carry
                                   stable ``id``s (e.g. ``work.4s``).
    resume/data/variants/*.json    overlay: ``extends`` plus per-section
                                   composition. A section is a list where each
                                   item is a ref string, ``{"ref": ..., ...}``
                                   (ref + field overrides) or an inline entry.

Everything downstream (schema / normalize / renderer and the website sync)
consumes the *localized* result, so it only ever sees plain strings.
"""
from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path

LANGS = ("en", "zh")
SECTION_KEYS = ("skills", "work", "projects", "education", "publications")


class ResolveError(ValueError):
    pass


def is_localized(value) -> bool:
    """True for a ``{"en": str, "zh": str}`` leaf (at least one string)."""
    if not isinstance(value, dict) or not value:
        return False
    if not set(value).issubset(LANGS):
        return False
    return any(isinstance(value.get(k), str) for k in LANGS)


def pick(value, lang: str):
    """Resolve a localized leaf to ``lang`` (falling back to the other)."""
    if is_localized(value):
        return value.get(lang) or value.get("en") or value.get("zh") or ""
    return value


def localize(value, lang: str):
    """Recursively collapse every localized leaf to the chosen language.

    Catalog bullets are authored as ``{"id": ..., "text": {"en", "zh"}}`` so
    each one has a stable id for editing/translation. Downstream (schema,
    normalize, renderer) consumes plain strings, so the id wrapper is dropped
    here and the localized ``text`` is returned in its place.
    """
    if is_localized(value):
        return pick(value, lang)
    if isinstance(value, dict):
        if set(value) == {"id", "text"}:
            return localize(value["text"], lang)
        return {k: localize(v, lang) for k, v in value.items()}
    if isinstance(value, list):
        return [localize(v, lang) for v in value]
    return value


def _by_id(items) -> dict:
    out: dict = {}
    for e in items or []:
        if isinstance(e, dict) and isinstance(e.get("id"), str):
            out[e["id"]] = e
    return out


def _resolve_item(item, catalog: dict, path: str) -> dict:
    if isinstance(item, str):
        if item not in catalog:
            raise ResolveError(f"{path}: unknown ref '{item}'")
        return deepcopy(catalog[item])
    if isinstance(item, dict):
        ref = item.get("ref")
        if ref is None:
            return deepcopy(item)  # inline full entry
        if ref not in catalog:
            raise ResolveError(f"{path}: unknown ref '{ref}'")
        merged = deepcopy(catalog[ref])
        for key, value in item.items():
            if key != "ref":
                merged[key] = deepcopy(value)
        return merged
    raise ResolveError(f"{path}: expected ref or inline entry, "
                       f"got {type(item).__name__}")


def resolve(base: dict, overlay: dict, variant_name: str = "") -> dict:
    """Apply an overlay to the base catalog, returning a full resume dict."""
    resolved = deepcopy(base)
    for key in ("basics", "meta"):
        if isinstance(overlay.get(key), dict):
            resolved[key] = {**resolved.get(key, {}), **overlay[key]}
    for key in SECTION_KEYS:
        if key not in overlay:
            continue
        spec = overlay[key]
        if not isinstance(spec, list):
            raise ResolveError(f"{variant_name}: '{key}' must be a list")
        catalog = _by_id(base.get(key, []))
        resolved[key] = [
            _resolve_item(it, catalog, f"{variant_name}.{key}[{i}]")
            for i, it in enumerate(spec)
        ]
    return resolved


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def resolve_source(src_path: Path, lang: str | None = None) -> dict:
    """Load ``src_path`` (base or variant overlay); optionally localize.

    ``lang=None`` keeps the bilingual structure (used by the website sync).
    """
    raw = load_json(src_path)
    extends = raw.get("extends")
    if extends:
        base = load_json((src_path.parent / extends).resolve())
        resolved = resolve(base, raw, src_path.stem)
    else:
        resolved = raw
    return resolved if lang is None else localize(resolved, lang)
