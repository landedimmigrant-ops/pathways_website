#!/usr/bin/env python3
"""
Generate content/workshops.json from markdown files in content/workshops/.

Behavior:
- Adds any new .md files automatically.
- Keeps existing manifest metadata when available.
- Allows optional front matter overrides in markdown files.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
WORKSHOPS_DIR = ROOT / "content" / "workshops"
MANIFEST_PATH = ROOT / "content" / "workshops.json"


def parse_scalar(value: str) -> Any:
    stripped = value.strip()
    if stripped.startswith('"') and stripped.endswith('"'):
        return stripped[1:-1]
    if stripped.startswith("'") and stripped.endswith("'"):
        return stripped[1:-1]
    lowered = stripped.lower()
    if lowered == "true":
        return True
    if lowered == "false":
        return False
    return stripped


def parse_list(value: str) -> list[str]:
    inner = value.strip()[1:-1].strip()
    if not inner:
        return []
    return [parse_scalar(part.strip()) for part in inner.split(",")]


def parse_front_matter(markdown: str) -> dict[str, Any]:
    text = markdown.replace("\r\n", "\n")
    if not text.startswith("---\n"):
        return {}
    end = text.find("\n---\n", 4)
    if end == -1:
        return {}

    front_lines = text[4:end].split("\n")
    front_matter: dict[str, Any] = {}
    for line in front_lines:
        if ":" not in line:
            continue
        key, raw_value = line.split(":", 1)
        key = key.strip()
        value = raw_value.strip()
        if not key:
            continue
        if value.startswith("[") and value.endswith("]"):
            front_matter[key] = parse_list(value)
        else:
            front_matter[key] = parse_scalar(value)
    return front_matter


def first_heading(markdown: str) -> str:
    for line in markdown.replace("\r\n", "\n").split("\n"):
        stripped = line.strip()
        if stripped.startswith("# "):
            return stripped[2:].strip()
    return ""


def title_from_slug(slug: str) -> str:
    return " ".join(part.capitalize() for part in slug.replace("_", "-").split("-") if part)


def to_list(value: Any, fallback: list[str]) -> list[str]:
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    return fallback


def to_bool(value: Any, fallback: bool) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        lowered = value.strip().lower()
        if lowered == "true":
            return True
        if lowered == "false":
            return False
    return fallback


def load_existing_manifest() -> list[dict[str, Any]]:
    if not MANIFEST_PATH.exists():
        return []
    with MANIFEST_PATH.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
        if isinstance(data, list):
            return [item for item in data if isinstance(item, dict)]
    return []


def generate_manifest() -> list[dict[str, Any]]:
    existing = load_existing_manifest()
    by_file = {str(item.get("file", "")): item for item in existing}
    by_slug = {str(item.get("slug", "")): item for item in existing}
    by_id = {str(item.get("id", "")): item for item in existing}

    entries: list[dict[str, Any]] = []
    for markdown_path in sorted(WORKSHOPS_DIR.glob("*.md")):
        relative_file = markdown_path.relative_to(ROOT).as_posix()
        markdown = markdown_path.read_text(encoding="utf-8")
        front = parse_front_matter(markdown)

        default_slug = markdown_path.stem
        existing_item = (
            by_file.get(relative_file)
            or by_slug.get(str(front.get("slug", default_slug)))
            or by_id.get(str(front.get("id", default_slug)))
            or {}
        )

        slug = str(front.get("slug") or existing_item.get("slug") or default_slug)
        item_id = str(front.get("id") or existing_item.get("id") or slug)
        title = str(
            front.get("title")
            or existing_item.get("title")
            or first_heading(markdown)
            or title_from_slug(slug)
        )

        entry = {
            "id": item_id,
            "slug": slug,
            "title": title,
            "format": str(front.get("format") or existing_item.get("format") or "Workshop"),
            "time": str(front.get("time") or existing_item.get("time") or ""),
            "pathways": to_list(front.get("pathways"), to_list(existing_item.get("pathways"), [])),
            "stages": to_list(front.get("stages"), to_list(existing_item.get("stages"), [])),
            "tags": to_list(front.get("tags"), to_list(existing_item.get("tags"), [])),
            "featuredHome": to_bool(front.get("featuredHome"), bool(existing_item.get("featuredHome", False))),
            "file": relative_file,
            "libcalUrl": str(front.get("libcalUrl") or existing_item.get("libcalUrl") or ""),
        }

        entries.append(entry)

    return entries


def main() -> None:
    if not WORKSHOPS_DIR.exists():
        raise SystemExit(f"Missing workshops folder: {WORKSHOPS_DIR}")

    entries = generate_manifest()
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    with MANIFEST_PATH.open("w", encoding="utf-8") as handle:
        json.dump(entries, handle, indent=2, ensure_ascii=True)
        handle.write("\n")

    print(f"Wrote {len(entries)} workshops to {MANIFEST_PATH}")


if __name__ == "__main__":
    main()
