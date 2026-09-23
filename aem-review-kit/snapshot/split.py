#!/usr/bin/env python3
"""
aem-review-kit/snapshot/split.py
Turns the bundle posted by extract.js into a guide's src/ files and fetches its assets.

    python3 aem-review-kit/snapshot/split.py /tmp/aem-snapshot/bundle.txt <guide-folder>

Writes src/aem-used.css, src/aem-header.html, src/aem-footer.html, src/aem-main.html
(pretty-printed, so corrections.json can be written against readable markup) and downloads
the images and SVG sprite the page references from the AEM host into src/assets/.
Prints the body class and the external stylesheet links for src/guide.json.
"""
import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import urljoin

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}


def pretty(html):
    out, depth = [], 0
    for t in re.split(r"(<[^>]+>)", html):
        if not t.strip():
            continue
        if t.startswith("<"):
            m = re.match(r"<(/?)([a-zA-Z][a-zA-Z0-9-]*)", t)
            if not m:
                out.append("  " * depth + t.strip())
                continue
            close, tag = m.group(1), m.group(2).lower()
            if close:
                depth = max(0, depth - 1)
                out.append("  " * depth + t.strip())
            else:
                out.append("  " * depth + t.strip())
                if tag not in VOID and not t.rstrip().endswith("/>"):
                    depth += 1
        else:
            out.append("  " * depth + re.sub(r"\s+", " ", t).strip())
    return "\n".join(out)


def main(bundle_path, guide_dir):
    raw = Path(bundle_path).read_bytes().decode("utf-8", "replace").replace("\r\n", "\n")
    raw = raw[raw.find("=====SPLIT:"):]
    parts = dict(zip(*[iter(re.split(r"\n?=====SPLIT:([a-z0-9.\-]+)=====\n", "\n" + raw)[1:])] * 2))
    src = Path(guide_dir) / "src"
    (src / "assets").mkdir(parents=True, exist_ok=True)
    (src / "aem-used.css").write_text(parts["used.css"], encoding="utf-8")
    (src / "aem-header.html").write_text(parts["header.html"], encoding="utf-8")
    (src / "aem-footer.html").write_text(parts["footer.html"], encoding="utf-8")
    (src / "aem-main.html").write_text(pretty(parts["main.html"]), encoding="utf-8")
    page_url = parts.get("page-url.txt", "").strip()
    refs = set(re.findall(r'src="(/[^"]+\.(?:png|svg|jpe?g|gif|webp))"', parts["header.html"] + parts["main.html"] + parts["footer.html"]))
    refs |= {m.split("#")[0] for m in re.findall(r'href="(/[^"]*svg-sprites\.svg)#', parts["header.html"] + parts["main.html"] + parts["footer.html"])}
    for ref in sorted(refs):
        target = src / "assets" / Path(ref).name
        subprocess.run(["curl", "-s", "-L", "--max-time", "30", "-o", str(target), urljoin(page_url, ref)], check=False)
        print(f"asset  {target.stat().st_size if target.exists() else 0:>8} bytes  {Path(ref).name}")
    print("\nfor src/guide.json:")
    print("  source_url :", page_url)
    print("  body_class :", parts.get("body-class.txt", "").strip())
    print("  head_links :", [l for l in parts.get("stylesheet-links.txt", "").split("\n") if l])
    print(f"\nwrote {src}/aem-*.html and aem-used.css ({len(parts['used.css'])} chars of CSS)")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("usage: python3 aem-review-kit/snapshot/split.py <bundle.txt> <guide-folder>")
    main(sys.argv[1], sys.argv[2])
