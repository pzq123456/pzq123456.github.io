"""Schema validation for resume JSON, JSON-Resume-aligned shape (stdlib only).

Answers: what is the data, and what constraints hold between fields.
It does NOT describe layout — that lives in the placement spec.

Sections: basics / skills / work / projects / education / publications.
"""
from __future__ import annotations

import re

HEX_COLOR = re.compile(r"^#[0-9a-fA-F]{6}$")
DATE_RE = re.compile(r"^\d{4}\.\d{2}$")

SECTION_KEYS = ("skills", "work", "projects", "education", "publications")


class ResumeValidationError(ValueError):
    pass


def _err(path: str, msg: str) -> ResumeValidationError:
    return ResumeValidationError(f"{path}: {msg}")


def _req_str(obj: dict, key: str, path: str) -> str:
    if key not in obj:
        raise _err(path, f"missing required key '{key}'")
    v = obj[key]
    if not isinstance(v, str) or not v.strip():
        raise _err(path, f"'{key}' expected non-empty string")
    return v


def _opt_str(obj: dict, key: str, path: str, default: str = "") -> str:
    v = obj.get(key, default)
    if v is None:
        return default
    if not isinstance(v, str):
        raise _err(path, f"'{key}' expected string, received {type(v).__name__}")
    return v


def _opt_list(obj: dict, key: str, path: str) -> list:
    v = obj.get(key, [])
    if v is None:
        return []
    if not isinstance(v, list):
        raise _err(path, f"'{key}' expected list, received {type(v).__name__}")
    return v


def _date(obj: dict, key: str, path: str) -> str:
    v = _opt_str(obj, key, path, "")
    if v and not DATE_RE.match(v):
        raise _err(path, f"'{key}' expected 'YYYY.MM', received '{v}'")
    return v


def _nonempty_str_list(items: list, path: str, what: str) -> None:
    for i, s in enumerate(items):
        if not isinstance(s, str) or not s.strip():
            raise _err(f"{path}[{i}]", f"{what} expected non-empty string")


def _links(items: list, path: str) -> None:
    for i, lk in enumerate(items):
        p = f"{path}[{i}]"
        if not isinstance(lk, dict):
            raise _err(p, "link expected object")
        _req_str(lk, "text", p)
        _req_str(lk, "href", p)


def validate_basics(b: dict) -> None:
    if not isinstance(b, dict):
        raise ResumeValidationError("basics: expected object")
    _req_str(b, "name", "basics")
    _opt_str(b, "label", "basics", "")
    _opt_str(b, "location", "basics", "")
    _opt_str(b, "email", "basics", "")
    _opt_str(b, "phone", "basics", "")
    _opt_str(b, "url", "basics", "")
    for i, pr in enumerate(_opt_list(b, "profiles", "basics")):
        if not isinstance(pr, dict):
            raise _err(f"basics.profiles[{i}]", "profile expected object")
        _opt_str(pr, "network", f"basics.profiles[{i}]", "")
        _opt_str(pr, "url", f"basics.profiles[{i}]", "")


def validate_raw(data: dict) -> dict:
    """Validate resume JSON. Returns the same dict on success."""
    if not isinstance(data, dict):
        raise ResumeValidationError(f"root: expected object, received {type(data).__name__}")
    if "basics" not in data or not isinstance(data["basics"], dict):
        raise ResumeValidationError("basics: expected object")
    validate_basics(data["basics"])

    for i, sk in enumerate(_opt_list(data, "skills", "root")):
        p = f"skills[{i}]"
        if not isinstance(sk, dict):
            raise _err(p, "skill group expected object")
        _req_str(sk, "name", p)
        kws = _opt_list(sk, "keywords", p)
        _nonempty_str_list(kws, f"{p}.keywords", "keyword")

    for i, w in enumerate(_opt_list(data, "work", "root")):
        p = f"work[{i}]"
        if not isinstance(w, dict):
            raise _err(p, "work entry expected object")
        _req_str(w, "position", p)
        _opt_str(w, "company", p, "")
        _opt_str(w, "location", p, "")
        _date(w, "startDate", p)
        _date(w, "endDate", p)
        _nonempty_str_list(_opt_list(w, "highlights", p), f"{p}.highlights", "highlight")
        _opt_str(w, "url", p, "")

    for i, pr in enumerate(_opt_list(data, "projects", "root")):
        p = f"projects[{i}]"
        if not isinstance(pr, dict):
            raise _err(p, "project expected object")
        _req_str(pr, "name", p)
        _opt_str(pr, "url", p, "")
        _nonempty_str_list(_opt_list(pr, "stack", p), f"{p}.stack", "stack item")
        _nonempty_str_list(_opt_list(pr, "highlights", p), f"{p}.highlights", "highlight")

    for i, e in enumerate(_opt_list(data, "education", "root")):
        p = f"education[{i}]"
        if not isinstance(e, dict):
            raise _err(p, "education entry expected object")
        _req_str(e, "institution", p)
        _opt_str(e, "institutionCn", p, "")
        _date(e, "startDate", p)
        _date(e, "endDate", p)
        _opt_str(e, "summary", p, "")

    for i, pub in enumerate(_opt_list(data, "publications", "root")):
        p = f"publications[{i}]"
        if not isinstance(pub, dict):
            raise _err(p, "publication expected object")
        _req_str(pub, "name", p)
        _opt_str(pub, "releaseDate", p, "")
        _opt_str(pub, "summary", p, "")
        _links(_opt_list(pub, "links", p), f"{p}.links")

    meta = data.get("meta", {})
    if meta is not None:
        if not isinstance(meta, dict):
            raise ResumeValidationError("meta: expected object")
        accent = meta.get("accent", "#B14E2E")
        if not isinstance(accent, str) or not HEX_COLOR.match(accent.strip()):
            raise ResumeValidationError("meta.accent: expected hex color like '#B14E2E'")

    if not any(data.get(k) for k in SECTION_KEYS):
        raise ResumeValidationError("sections: at least one of skills/work/projects/education/publications required")
    return data
