"""HTML renderer: ResumeModel + Theme -> HTML fragments (stdlib only).

No markdown parsing here, no content guessing, no color decisions.
All text is HTML-escaped; only sanitized hrefs become links.
"""
from __future__ import annotations

import html


def render_nodes(nodes: list[dict]) -> str:
    out = []
    for nd in nodes:
        t = nd.get("t", "text")
        if t == "text":
            out.append(html.escape(str(nd.get("v", ""))))
        elif t == "strong":
            out.append(f"<strong>{html.escape(str(nd.get('v', '')))}</strong>")
        elif t == "hl":
            out.append(f"<mark>{html.escape(str(nd.get('v', '')))}</mark>")
        elif t == "code":
            out.append(f"<code>{html.escape(str(nd.get('v', '')))}</code>")
        elif t == "link":
            href = nd.get("href")
            inner = render_nodes(nd.get("text", []))
            if href:
                out.append(f'<a href="{html.escape(href, quote=True)}">{inner}</a>')
            else:
                out.append(inner)  # unsafe href: keep text, drop link
        else:
            out.append(html.escape(str(nd.get("v", ""))))
    return "".join(out)


def render_contact_item(c: dict) -> str:
    inner = render_nodes(c["nodes"])
    if c.get("href"):
        return f'<a href="{html.escape(c["href"], quote=True)}">{inner}</a>'
    return inner


def render_header(model: dict) -> tuple[str, str, str]:
    parts = [html.escape(p) for p in model.get("name_parts", [model.get("name", "")])]
    name_html = f' <span class="sep">|</span> '.join(parts)
    role_html = render_nodes(model.get("role_nodes", []))
    contact_html = " &nbsp;|&nbsp; ".join(
        render_contact_item(c) for c in model.get("contact", []))
    return name_html, role_html, contact_html


def render_entry_title(entry: dict) -> str:
    inner = render_nodes(entry["title_nodes"])
    if entry.get("url"):
        return (f'<a class="title-link" '
                f'href="{html.escape(entry["url"], quote=True)}">{inner}</a>')
    return inner


def render_entry_links(links: list[dict]) -> str:
    parts = []
    for lk in links:
        inner = render_nodes(lk["nodes"])
        if lk.get("href"):
            parts.append(f'<a href="{html.escape(lk["href"], quote=True)}">{inner}</a>')
        else:
            parts.append(inner)
    return " &nbsp;·&nbsp; ".join(parts)


def render_entry(entry: dict) -> str:
    parts = ['      <article class="entry">']
    date = (f"<time>{html.escape(entry['date'])}</time>"
            if entry.get("date") else "")
    parts.append(f'        <div class="row"><h3>{render_entry_title(entry)}</h3>{date}</div>')
    if entry.get("has_stack"):
        parts.append(f'        <p class="stack">{render_nodes(entry["stack_nodes"])}</p>')
    for sk in entry.get("skills", []):
        parts.append(f'        <p class="stack"><strong>{html.escape(sk["label"])}:</strong> '
                     f'{render_nodes(sk["nodes"])}</p>')
    for para in entry.get("paras", []):
        parts.append(f"        <p>{render_nodes(para)}</p>")
    if entry.get("bullets"):
        lis = "\n".join(f"          <li>{render_nodes(b)}</li>" for b in entry["bullets"])
        parts.append(f"        <ul class=\"bullets\">\n{lis}\n        </ul>")
    if entry.get("links"):
        parts.append(f'        <p class="links">{render_entry_links(entry["links"])}</p>')
    parts.append("      </article>")
    return "\n".join(parts)


def render_section(sec: dict, title_en: str | None = None,
                   title_cn: str | None = None) -> str:
    en = title_en if title_en is not None else sec.get("en", "")
    cn = title_cn if title_cn is not None else sec.get("cn", "")
    cn_html = (f' <span class="cn">{html.escape(cn)}</span>'
               if cn else "")
    parts = [f'    <section class="sec-{sec["type"]}" aria-label="{html.escape(en)}">',
             f"      <h2>{html.escape(en)}{cn_html}</h2>"]
    skills = [f'        <li><strong>{html.escape(sk["label"])}:</strong> '
              f'{render_nodes(sk["nodes"])}</li>'
              for sk in sec.get("skills", [])]
    for para in sec.get("paras", []):
        parts.append(f"      <p>{render_nodes(para)}</p>")
    if sec.get("bullets"):
        lis = "\n".join(f"        <li>{render_nodes(b)}</li>" for b in sec["bullets"])
        parts.append(f"      <ul class=\"bullets\">\n{lis}\n      </ul>")
    for entry in sec.get("entries", []):
        parts.append(render_entry(entry))
    if skills:
        parts.append('      <ul class="skills">\n' + "\n".join(skills) + "\n      </ul>")
    parts.append("    </section>")
    return "\n".join(parts)


def render_sections(sections: list[dict]) -> str:
    return "\n\n".join(render_section(s) for s in sections)


def render_placed(ordered: dict[str, list[dict]], model: dict,
                  lang: str = "en") -> dict[str, list[dict]]:
    """Execute a validated placement.

    Returns slot name -> list of SlotItems. Each item carries the
    pre-rendered section HTML *and* the raw normalized section, so a
    template may use {{ s.html }} or build custom markup from
    s.section (timeline, grid, rails) with the inline() helper.

    Section titles are per-output-language: placement ships ``{en, cn}``;
    ``en`` renders the English title only, ``zh`` the Chinese one only.
    """
    out: dict[str, list[dict]] = {}
    for name, assignments in ordered.items():
        items = []
        for a in assignments:
            if lang == "en":
                title_en, title_cn = a["title_en"], ""
            else:
                title_en, title_cn = (a["title_cn"] or a["title_en"]), ""
            sec = model["sections"][a["source"]]
            items.append({
                "source": a["source"],
                "title_en": title_en,
                "title_cn": title_cn,
                "presentation": a["presentation"],
                "render": a.get("render", "section"),
                "html": render_section(sec, title_en, title_cn),
                "section": sec,
            })
        out[name] = items
    return out
