"""Content normalization: resume JSON -> semantic ResumeModel (stdlib only).

Renderer must never guess markdown syntax, dates, links, or section
semantics. Everything is resolved here into semantic nodes.

Inline syntax supported in content strings:
    `code`  ==highlight==  **strong**  [text](href)
"""
from __future__ import annotations

import re
from urllib.parse import urlparse

SAFE_SCHEMES = {"http", "https", "mailto"}

SECTION_KEYS = ("skills", "work", "projects", "education", "publications")

_CODE_RE = re.compile(r"`([^`]+)`")
_HL_RE = re.compile(r"==(.+?)==")
_STRONG_RE = re.compile(r"\*\*(.+?)\*\*")


def _match_link(s: str, pos: int) -> tuple[int, int, str, str] | None:
    """Find the next [text](href) from pos, honoring nested parens."""
    i = s.find("[", pos)
    while i != -1:
        j = s.find("](", i)
        if j == -1:
            return None
        text = s[i + 1:j]
        if not text:
            i = s.find("[", i + 1)
            continue
        k, depth = j + 2, 1
        while k < len(s) and depth > 0:
            ch = s[k]
            if ch == "(":
                depth += 1
            elif ch == ")":
                depth -= 1
            elif ch in (" ", "\t", "\n") and depth == 1:
                break
            k += 1
        if depth == 0:
            href = s[j + 2:k - 1]
            if href and not re.search(r"\s", href):
                return (i, k, text, href)
        i = s.find("[", i + 1)
    return None


def sanitize_href(href: str) -> str | None:
    """Return a safe href, or None if the URL must not become a link."""
    if not isinstance(href, str):
        return None
    h = href.strip()
    if not h:
        return None
    if re.match(r"(?i)^(javascript|data|vbscript|file|blob):", h):
        return None
    try:
        parts = urlparse(h)
    except Exception:
        return None
    if not parts.scheme:
        if re.match(r"^[\w.-]+\.[a-zA-Z]{2,}(/.*)?$", h):
            return "https://" + h
        return None
    if parts.scheme.lower() not in SAFE_SCHEMES:
        return None
    if parts.scheme.lower() in ("http", "https") and not parts.netloc:
        return None
    return h


def display_url(url: str) -> str:
    """Human display text for a URL: strip scheme and trailing slash."""
    u = (url or "").strip()
    u = re.sub(r"^https?://", "", u)
    return u.rstrip("/") or u


def parse_inline(s: str) -> list[dict]:
    """Parse a content string into semantic inline nodes."""
    if not isinstance(s, str):
        s = str(s)
    nodes: list[dict] = []
    pos, n = 0, len(s)
    while pos < n:
        candidates = []
        for kind, rx in (("code", _CODE_RE), ("hl", _HL_RE),
                         ("strong", _STRONG_RE)):
            m = rx.search(s, pos)
            if m:
                candidates.append((m.start(), m.end(), kind, m))
        link = _match_link(s, pos)
        if link:
            candidates.append((link[0], link[1], "link", link))
        if not candidates:
            nodes.append({"t": "text", "v": s[pos:]})
            break
        candidates.sort(key=lambda c: (c[0], c[1]))
        start, end, kind, m = candidates[0]
        if start > pos:
            nodes.append({"t": "text", "v": s[pos:start]})
        if kind == "code":
            nodes.append({"t": "code", "v": m.group(1)})
        elif kind == "hl":
            nodes.append({"t": "hl", "v": m.group(1)})
        elif kind == "strong":
            nodes.append({"t": "strong", "v": m.group(1)})
        elif kind == "link":
            _, _, text, href = m
            safe = sanitize_href(href)
            label = parse_inline(text) if text != href else [{"t": "text", "v": text}]
            nodes.append({"t": "link", "text": label, "href": safe,
                          "raw_text": text, "raw_href": href})
        pos = end
    merged: list[dict] = []
    for nd in nodes:
        if nd["t"] == "text" and merged and merged[-1]["t"] == "text":
            merged[-1]["v"] += nd["v"]
        else:
            merged.append(nd)
    return [nd for nd in merged if not (nd["t"] == "text" and nd["v"] == "")]


def _contact_item(text: str, href: str = "") -> dict:
    return {"nodes": parse_inline(text),
            "href": sanitize_href(href) if href else None,
            "raw_href": href or "", "is_link": bool(href)}


def normalize_contact(basics: dict) -> list[dict]:
    contact = []
    if basics.get("location", "").strip():
        contact.append(_contact_item(basics["location"].strip()))
    if basics.get("email", "").strip():
        email = basics["email"].strip()
        contact.append(_contact_item(email, f"mailto:{email}"))
    if basics.get("phone", "").strip():
        contact.append(_contact_item(basics["phone"].strip()))
    if basics.get("url", "").strip():
        url = basics["url"].strip()
        contact.append(_contact_item(display_url(url), url))
    for pr in basics.get("profiles", []) or []:
        url = (pr.get("url", "") or "").strip()
        if url:
            contact.append(_contact_item(display_url(url), url))
    return contact


def _date_range(start: str, end: str) -> str:
    start, end = (start or "").strip(), (end or "").strip()
    if start and end:
        return f"{start} – {end}"
    return start or end


def _link(text: str, href: str) -> dict:
    return {"nodes": parse_inline(text), "href": sanitize_href(href),
            "raw_href": href}


def normalize_entry(kind: str, raw: dict) -> dict:
    if kind == "work":
        head = raw.get("position", "")
        if raw.get("company", "").strip():
            head += f" | {raw['company'].strip()}"
        if raw.get("location", "").strip():
            head += f" · {raw['location'].strip()}"
        return {
            "title_nodes": parse_inline(head), "title_text": head,
            "url": sanitize_href(raw.get("url", "") or ""),
            "raw_url": raw.get("url", "") or "",
            "date": _date_range(raw.get("startDate", ""), raw.get("endDate", "")),
            "stack_nodes": [], "has_stack": False,
            "bullets": [parse_inline(h) for h in (raw.get("highlights", []) or [])],
            "paras": [], "links": [], "skills": [],
        }
    if kind == "projects":
        stack = " · ".join(raw.get("stack", []) or [])
        return {
            "title_nodes": parse_inline(raw.get("name", "")),
            "title_text": raw.get("name", ""),
            "url": sanitize_href(raw.get("url", "") or ""),
            "raw_url": raw.get("url", "") or "",
            "date": "",
            "stack_nodes": parse_inline(stack), "has_stack": bool(stack),
            "bullets": [parse_inline(h) for h in (raw.get("highlights", []) or [])],
            "paras": [], "links": [], "skills": [],
        }
    if kind == "education":
        head = raw.get("institution", "")
        if raw.get("institutionCn", "").strip():
            head += f" | {raw['institutionCn'].strip()}"
        paras = [parse_inline(raw["summary"])] if raw.get("summary", "").strip() else []
        return {
            "title_nodes": parse_inline(head), "title_text": head,
            "url": None, "raw_url": "",
            "date": _date_range(raw.get("startDate", ""), raw.get("endDate", "")),
            "stack_nodes": [], "has_stack": False,
            "bullets": [], "paras": paras,
            "links": [], "skills": [],
        }
    if kind == "publications":
        paras = [parse_inline(raw["summary"])] if raw.get("summary", "").strip() else []
        return {
            "title_nodes": parse_inline(raw.get("name", "")),
            "title_text": raw.get("name", ""),
            "url": None, "raw_url": "",
            "date": (raw.get("releaseDate", "") or "").strip(),
            "stack_nodes": [], "has_stack": False,
            "bullets": [], "paras": paras,
            "links": [_link(lk.get("text", ""), lk.get("href", ""))
                      for lk in (raw.get("links", []) or [])],
            "skills": [],
        }
    raise ValueError(f"unknown entry kind '{kind}'")


def normalize_section(key: str, items: list) -> dict:
    if key == "skills":
        return {
            "key": key, "type": key,
            "skills": [{"label": g.get("name", ""),
                        "nodes": parse_inline(" · ".join(g.get("keywords", []) or []))}
                       for g in items],
            "paras": [], "bullets": [],
            "entries": [],
        }
    return {
        "key": key, "type": key,
        "skills": [], "paras": [], "bullets": [],
        "entries": [normalize_entry(key, e) for e in items],
    }


def normalize_resume(raw: dict) -> dict:
    """Validated resume JSON -> semantic ResumeModel (sections keyed by source)."""
    basics = raw.get("basics", {})
    name = str(basics.get("name", ""))
    parts = [p.strip() for p in name.split("|", 1)] if "|" in name else [name]
    contact = normalize_contact(basics)
    sections = {}
    for key in SECTION_KEYS:
        items = raw.get(key, []) or []
        if items:
            sections[key] = normalize_section(key, items)
    contact_links = sum(1 for c in contact if c["is_link"])
    entry_urls = sum(1 for s in sections.values() for e in s["entries"] if e["url"])
    entry_link_rows = sum(len(e["links"]) for s in sections.values() for e in s["entries"])
    return {
        "name": name,
        "name_parts": parts,
        "role": str(basics.get("label", "") or ""),
        "role_nodes": parse_inline(str(basics.get("label", "") or "")),
        "accent": str((raw.get("meta", {}) or {}).get("accent", "#B14E2E")),
        "contact": contact,
        "sections": sections,
        "counts": {
            "sections": len(sections),
            "entries": sum(len(s["entries"]) for s in sections.values()),
            "entry_bullets": sum(len(e["bullets"]) for s in sections.values()
                                 for e in s["entries"]),
            "skill_groups": len(sections.get("skills", {}).get("skills", [])),
            "contact_links": contact_links,
            "entry_urls": entry_urls,
            "entry_link_rows": entry_link_rows,
        },
    }
