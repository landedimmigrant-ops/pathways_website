#!/usr/bin/env python3
"""
aem-review-kit/build.py
------------------------------------------------------------------
Builds a review copy of an AEM page: the page as captured from AEM, with every
correction applied and tagged, plus the review layer (comments, AEM copy mode,
To do / Done tracking).

    python3 aem-review-kit/build.py <guide-folder>
    python3 aem-review-kit/build.py ncv-guide-review

A guide folder holds:
  src/guide.json            title, head links, link rewiring, CSS patches, extra change entries
  src/aem-main.html         DOM snapshot of <main>   (snapshot/split.py writes these four)
  src/aem-header.html       ... <header>
  src/aem-footer.html       ... <footer>
  src/aem-used.css          the stylesheet rules that page uses
  src/assets/               logos and the SVG sprite from the AEM clientlibs
  src/corrections.json      every text edit, keyed by a review ID
  src/seed-comments.json    questions placed on the page, storage settings, hidden rows
  src/hooks.py              optional: structural edits a find/replace cannot express

Output (in the guide folder): index.html, aem.css, review.js, review.css.
review.js and review.css are copied from aem-review-kit/layer/ — edit them there.

The build fails loudly when a correction's `find` text is not on the page the
expected number of times, so a fresh AEM snapshot surfaces every edit that no
longer applies.
"""
import hashlib
import importlib.util
import json
import re
import shutil
import sys
from pathlib import Path

KIT = Path(__file__).resolve().parent
LAYER = KIT / "layer"

# ---------------------------------------------------------------- matching


def find_regex(find):
    """A regex that matches `find` while ignoring whitespace differences between
    tags and inside text (the snapshot is pretty-printed)."""
    pieces = []
    for part in re.split(r"(<[^>]+>)", find):
        if not part:
            continue
        if part.startswith("<"):
            pieces.append(re.escape(part))
        else:
            txt = part.strip()
            if txt:
                pieces.append(r"\s+".join(re.escape(w) for w in re.split(r"\s+", txt)))
    return re.compile(r"\s*".join(pieces))


def apply_edit(text, edit):
    rx = find_regex(edit["find"])
    matches = list(rx.finditer(text))
    expected = edit.get("count", 1)
    if len(matches) != expected:
        raise SystemExit(f"[{edit['id']}] expected {expected} match(es), found {len(matches)}: {edit['find'][:80]}")
    occ = edit.get("occurrence", 1)
    targets = matches if occ == "all" else [matches[occ - 1]]
    for m in reversed(targets):
        text = text[: m.start()] + edit["replace"] + text[m.end():]
    return text


# ---------------------------------------------------------------- helpers for hooks


def block_end(text, start):
    """Index just past the </div> that closes the <div ...> opening at `start`."""
    depth = 0
    for m in re.finditer(r"<div\b|</div>", text[start:]):
        depth += 1 if m.group(0) == "<div" else -1
        if depth == 0:
            return start + m.end()
    raise SystemExit("unbalanced div")


def next_block(text, cls, after):
    """(start, end) of the next <div class="cls..."> block after `after`."""
    i = text.index(f'<div class="{cls}', after)
    return i, block_end(text, i)


def recase_running_text(html, phrase, lowered, marker_id, skip_tags=("cite",)):
    """Replace `phrase` with `lowered` wherever it runs mid-sentence. A capital stays where the
    phrase opens a heading, a table cell or a sentence, and inside skip_tags (a cited title).
    Returns (html, count). Each change is marked <!--rv:marker_id-->."""
    changed = 0
    out = []
    depth = 0
    open_rx = re.compile(r"<(%s)\b" % "|".join(skip_tags))
    close_rx = re.compile(r"</(%s)\b" % "|".join(skip_tags))
    for part in re.split(r"(<[^>]+>)", html):
        if part.startswith("<"):
            if open_rx.match(part):
                depth += 1
            elif close_rx.match(part):
                depth -= 1
            out.append(part)
            continue
        if depth or phrase not in part:
            out.append(part)
            continue

        def fix(m, part=part):
            nonlocal changed
            before = part[: m.start()]
            if not before.strip() or re.search(r"[.!?:]\s*$", before):
                return m.group(0)
            changed += 1
            return f"<!--rv:{marker_id}-->{lowered}"

        out.append(re.sub(re.escape(phrase), fix, part))
    return "".join(out), changed


# ---------------------------------------------------------------- assets and links


def inline_sprite(src, *html_parts):
    """Inline only the sprite symbols the page actually uses."""
    sprite_file = src / "assets" / "svg-sprites.svg"
    used = sorted(set(re.findall(r'svg-sprites\.svg#([a-zA-Z0-9_-]+)', "".join(html_parts))))
    if not used:
        return ""
    sprite = sprite_file.read_text(encoding="utf-8")
    symbols = []
    for sym in used:
        m = re.search(rf'<symbol[^>]*\bid="{re.escape(sym)}"[^>]*>.*?</symbol>', sprite, re.S)
        if not m:
            raise SystemExit(f"sprite symbol missing: {sym}")
        symbols.append(m.group(0))
    return ('<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">'
            + "".join(symbols) + "</svg>")


def rewire(html, guide):
    """Strip scripts, point sprite and image references at local copies, and make site links absolute."""
    origin = guide.get("site_origin", "https://www.concordia.ca")
    img_prefix = guide.get("aem_image_prefix", "/etc/designs/concordia/clientlibs/img/")
    html = re.sub(r"<script\b[^>]*>.*?</script>", "", html, flags=re.S)
    html = re.sub(r"<noscript\b[^>]*>.*?</noscript>", "", html, flags=re.S)
    html = re.sub(r'(href|xlink:href)="' + re.escape(img_prefix) + r'svg-sprites\.svg#', r'\1="#', html)
    html = html.replace('src="' + img_prefix, 'src="src/assets/')
    for root, target in guide.get("content_roots", [["/content/concordia/en/", "/"], ["/content/concordia/fr/", "/fr/"], ["/content/concordia/", "/"]]):
        html = re.sub(r'href="' + re.escape(root) + r'([^"]*)"', lambda m, t=target: f'href="{origin}{t}{m.group(1)}"', html)
    html = re.sub(r'href="/([a-z][^"]*)"', lambda m: f'href="{origin}/{m.group(1)}"', html)
    return html


def patch_css(css, guide):
    for old, new in guide.get("css_patches", []):
        css = css.replace(old, new)
    return css


# ---------------------------------------------------------------- assemble


def load_hooks(src):
    sys.dont_write_bytecode = True  # no __pycache__ in guide folders (they are published as-is)
    path = src / "hooks.py"
    if not path.exists():
        return None
    spec = importlib.util.spec_from_file_location("guide_hooks", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def build(guide_dir):
    out = Path(guide_dir).resolve()
    src = out / "src"
    read = lambda name: (src / name).read_text(encoding="utf-8")
    guide = json.loads(read("guide.json"))
    corrections = json.loads(read("corrections.json"))
    seeds = json.loads(read("seed-comments.json"))
    main_html = read("aem-main.html")

    for edit in corrections["edits"]:
        main_html = apply_edit(main_html, edit)

    hooks = load_hooks(src)
    if hooks and hasattr(hooks, "apply"):
        main_html = hooks.apply(main_html, sys.modules[__name__], guide)

    # sub-ids (P-9a, P-9b…) share one tag and one checklist entry
    changes = {e["id"].rstrip("abcde"): {"title": e["title"], "group": e["group"], "note": e.get("note", "")}
               for e in corrections["edits"]}
    changes.update(guide.get("changes", {}))

    header = rewire(read("aem-header.html"), guide)
    footer = rewire(read("aem-footer.html"), guide)
    main_html = rewire(main_html, guide)

    config = {
        "changes": changes,
        "seeds": seeds.get("comments", []),
        "storage": seeds.get("storage", {"backend": "local"}),
        "snapshot": seeds.get("snapshot", ""),
        "hidden": seeds.get("hidden", []),  # sheet rows the page ignores (test comments)
        "title": guide.get("title", ""),
        "groups": guide.get("groups", {"A": "Build error", "B": "Factual, verified", "C": "Copy"}),
    }

    # the review layer is copied in, so the guide folder is self-contained on any static host
    for name in ("review.js", "review.css"):
        shutil.copyfile(LAYER / name, out / name)

    aem_css = patch_css(read("aem-used.css"), guide)
    # content hashes on every asset link: a changed file always reaches reviewers, never a cached copy
    ver = lambda text: hashlib.md5(text.encode("utf-8")).hexdigest()[:10]
    head_links = "\n".join(f'<link rel="stylesheet" href="{u}">' for u in guide.get("head_links", []))
    wrapper = guide.get("wrapper_id", "boot")

    page = f'''<!DOCTYPE html>
<html lang="{guide.get("lang", "en")}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{guide.get("page_title", "Review copy")}</title>
<meta name="description" content="{guide.get("meta_description", "")}">
<meta name="robots" content="noindex,nofollow">
{head_links}
<link rel="stylesheet" href="aem.css?v={ver(aem_css)}">
<link rel="stylesheet" href="review.css?v={ver((out / "review.css").read_text(encoding="utf-8"))}">
</head>
<body class="{guide.get("body_class", "")}">
<div id="rv-bar" class="rv-bar" role="region" aria-label="Review tools"></div>
<div id="{wrapper}">
<div class="rv-chrome">
{header}
</div>
{main_html}
<div class="rv-chrome">
{footer}
</div>
</div>
{inline_sprite(src, read("aem-header.html"), read("aem-main.html"), read("aem-footer.html"))}
<script>window.RV_CONFIG = {json.dumps(config, ensure_ascii=False)};</script>
<script src="review.js?v={ver((out / "review.js").read_text(encoding="utf-8"))}"></script>
</body>
</html>
'''
    (out / "index.html").write_text(page, encoding="utf-8")
    (out / "aem.css").write_text(aem_css, encoding="utf-8")

    markers = sorted(set(re.findall(r"<!--rv:([A-Z]-\d+)-->", main_html)))
    missing = [m for m in markers if m not in changes]
    if missing:
        raise SystemExit(f"markers without a change entry: {missing}")
    print(f"built {out.name}/index.html: {len(corrections['edits'])} edits, {len(markers)} change markers, "
          f"{len(config['seeds'])} seeded comments")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("usage: python3 aem-review-kit/build.py <guide-folder>")
    build(sys.argv[1])
