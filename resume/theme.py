"""Design tokens: the only place colors/spacing/typography live (stdlib only).

CSS receives tokens; content components never hardcode colors.
Accent layers are computed explicitly in Python (no CSS color-mix),
so print/PDF output is stable across Chromium versions.
"""
from __future__ import annotations


def _hex_to_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def _rgb_to_hex(r: int, g: int, b: int) -> str:
    return f"#{r:02X}{g:02X}{b:02X}"


def mix(hex_a: str, hex_b: str, pct_a: float) -> str:
    """Mix two hex colors; pct_a = share of color A (0..1)."""
    ar, ag, ab = _hex_to_rgb(hex_a)
    br, bg, bb = _hex_to_rgb(hex_b)
    m = lambda a, b: round(pct_a * a + (1 - pct_a) * b)
    return _rgb_to_hex(m(ar, br), m(ag, bg), m(ab, bb))


def mix_white(hex_color: str, pct: float) -> str:
    return mix(hex_color, "#FFFFFF", pct)


EDITORIAL_DEFAULTS = {
    "ink": "#20242A",
    "ink_soft": "#3F454D",
    "muted": "#747B84",
    "faint": "#9AA1A9",
    "hairline": "#E2E5E8",
    "paper": "#FFFFFF",
    "screen": "#EEF0F2",
}

THEMES = ("editorial", "minimal", "compact")


def get_theme(name: str = "editorial", accent: str = "#B14E2E") -> dict:
    """Return explicit design tokens for a theme + accent."""
    if name not in THEMES:
        raise ValueError(f"unknown theme '{name}'; expected one of {THEMES}")
    accent = accent.strip()
    base = dict(EDITORIAL_DEFAULTS)
    if name == "compact":
        body, small = "9.0pt", "8.0pt"
        section_gap, entry_gap = "8pt", "5pt"
    elif name == "minimal":
        body, small = "9.25pt", "8.15pt"
        section_gap, entry_gap = "9pt", "6pt"
    else:  # editorial
        body, small = "9.25pt", "8.25pt"
        section_gap, entry_gap = "9pt", "6pt"
    return {
        "name": name,
        "accent": accent,
        "accent_soft": mix(accent, base["ink"], 0.72),
        "accent_wash": mix_white(accent, 0.10),
        "accent_pale": mix_white(accent, 0.09),
        "colors": base,
        "typography": {"body": body, "small": small,
                       "name": "21pt", "role": "9.8pt"},
        "spacing": {"section": section_gap, "entry": entry_gap,
                    "para": "2pt"},
        "page": {"top": "13mm", "right": "14mm",
                 "bottom": "12mm", "left": "14mm"},
    }
