"""Placement spec: WHERE content goes (agent-writable, validator-checked).

The agent (or human) decides slot assignment, order, titles, and
presentation — never facts. The deterministic renderer executes it.

Spec shape:
    {"template": "editorial",
     "slots": {"main": [
        {"source": "work",
         "title": {"en": "Experience", "cn": "工作经历"},
         "presentation": "full"}]}}

Rules (v1):
- every template data-slot must be filled; no unknown slots
- every model section covered exactly once (no omit, no dup yet)
- every source ref must resolve; presentation from a closed set
"""
from __future__ import annotations

import json
import re
from pathlib import Path

KNOWN_PRESENTATIONS = ("full",)


class PlacementError(ValueError):
    pass


def parse_slots(template_html: str) -> list[str]:
    """Template-declared slot ids (data-slot attributes)."""
    return re.findall(r'data-slot="([\w-]+)"', template_html)


def load_spec(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except OSError as exc:
        raise PlacementError(f"placement: cannot read {path}: {exc}")
    except json.JSONDecodeError as exc:
        raise PlacementError(f"placement: invalid JSON: {exc}")


def validate_spec(spec: dict, model: dict, template_slots: list[str]) -> dict:
    if not isinstance(spec, dict):
        raise PlacementError("placement: expected object")
    slots = spec.get("slots", None)
    if not isinstance(slots, dict) or not slots:
        raise PlacementError("placement.slots: expected non-empty object")

    for name in slots:
        if name not in template_slots:
            raise PlacementError(
                f"placement.slots.{name}: unknown slot "
                f"(template offers {template_slots})")
    for name in template_slots:
        if name not in slots:
            raise PlacementError(f"placement: template slot '{name}' is unfilled")

    seen: dict[str, str] = {}
    ordered: dict[str, list[dict]] = {}
    available = set(model["sections"])
    for name, assignments in slots.items():
        if not isinstance(assignments, list) or not assignments:
            raise PlacementError(f"placement.slots.{name}: expected non-empty list")
        ordered[name] = []
        for i, a in enumerate(assignments):
            p = f"placement.slots.{name}[{i}]"
            if not isinstance(a, dict):
                raise PlacementError(f"{p}: expected object")
            src = a.get("source", "")
            if src not in available:
                raise PlacementError(
                    f"{p}.source: '{src}' does not resolve "
                    f"(available {sorted(available)})")
            if src in seen:
                raise PlacementError(
                    f"{p}.source: '{src}' already placed in '{seen[src]}' (no dup)")
            seen[src] = name
            title = a.get("title", {})
            if not isinstance(title, dict) or not str(title.get("en", "")).strip():
                raise PlacementError(f"{p}.title.en: expected non-empty string")
            pres = a.get("presentation", "full")
            if pres not in KNOWN_PRESENTATIONS:
                raise PlacementError(
                    f"{p}.presentation: '{pres}' not in {list(KNOWN_PRESENTATIONS)}")
            render_mode = a.get("render", "section")
            if render_mode not in ("section", "raw"):
                raise PlacementError(
                    f"{p}.render: '{render_mode}' not in ['section', 'raw']")
            ordered[name].append({
                "source": src,
                "title_en": str(title["en"]).strip(),
                "title_cn": str(title.get("cn", "") or "").strip(),
                "presentation": pres,
                "render": render_mode,
            })
    missing = [s for s in model["sections"] if s not in seen]
    if missing:
        raise PlacementError(
            f"placement: sources uncovered (no omit in v1): {missing}")
    return ordered
