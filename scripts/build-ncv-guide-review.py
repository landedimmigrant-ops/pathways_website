#!/usr/bin/env python3
"""
build-ncv-guide-review.py
------------------------------------------------------------------
Builds ncv-guide-review/index.html: a review copy of the Narrative CV guide as it
stands on Concordia's AEM dev site, with the corrections from
ncv-guide-aem-review-2026-09-21.md applied, plus a highlight-and-comment layer.

Inputs (ncv-guide-review/src/):
  aem-main.html, aem-header.html, aem-footer.html   DOM snapshot of the AEM page
  aem-used.css                                       the AEM stylesheet rules that page uses
  corrections.json                                   every text edit, keyed by review ID
  seed-comments.json                                 questions pre-placed on the page
  assets/                                            logos and the SVG sprite

Output: ncv-guide-review/index.html + aem.css (review.css / review.js are hand-written).

The build fails loudly if a correction's `find` text is not present exactly the
expected number of times, so a re-snapshot of the AEM page surfaces every edit
that no longer applies.

  python3 scripts/build-ncv-guide-review.py
"""
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "ncv-guide-review" / "src"
OUT_DIR = ROOT / "ncv-guide-review"

BUILDER_URL = "https://www.concordia.ca/research/pathways-to-impact/learn/tools/narrative-cv-builder.html"
META_DESCRIPTION = ("An orientation to the narrative CV for Concordia researchers: the three sections, "
                    "what reviewers look for and how the Tri-agency CV differs from the CV-FRQ.")


def read(name):
    return (SRC / name).read_text(encoding="utf-8")


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


# ---------------------------------------------------------------- block helpers

def block_end(text, start):
    """Index just past the </div> that closes the <div ...> opening at `start`."""
    depth = 0
    for m in re.finditer(r"<div\b|</div>", text[start:]):
        depth += 1 if m.group(0) == "<div" else -1
        if depth == 0:
            return start + m.end()
    raise SystemExit("unbalanced div")


def next_block(text, cls, after):
    i = text.index(f'<div class="{cls}', after)
    return i, block_end(text, i)


def cards_three_up(text):
    """I-6: the three section cards in one row, then both accordions."""
    s2 = text.index('<a id="three">')
    s3 = text.index('<a id="compare">')
    region = text[s2:s3]
    r1s, r1e = next_block(region, "container-fluid px-0", 0)
    sepA_s, sepA_e = next_block(region, "c-separator section", r1e)
    accA_s, accA_e = next_block(region, "c-accordion section", sepA_e)
    sepB_s, sepB_e = next_block(region, "c-separator section", accA_e)
    r2s, r2e = next_block(region, "container-fluid px-0", sepB_e)
    sepC_s, sepC_e = next_block(region, "c-separator section", r2e)
    accB_s, _ = next_block(region, "c-accordion section", sepC_e)

    cards = []
    for rs, rend in ((r1s, r1e), (r2s, r2e)):
        pos = rs
        while True:
            try:
                cs, ce = next_block(region[:rend], "c-box box section", pos)
            except ValueError:
                break
            cards.append(region[cs:ce])
            pos = ce
    if len(cards) != 3:
        raise SystemExit(f"[I-6] expected 3 section cards, found {len(cards)}")
    cards = [re.sub(r'class="bloc p-4[^"]*"', 'class="bloc p-4 mb-4 mb-lg-0 box-text-black box-link-black"', c, count=1) for c in cards]
    cols = "".join(
        f'<div class="parsys_column cq-colctrl-lt1-c{i} col-md-4 col-sm-12 col-12">{c}</div>' for i, c in enumerate(cards)
    )
    new_row = f'<div class="container-fluid px-0"><!--rv:I-6--><div class="row parsys_column cq-colctrl-lt1 flex">{cols}</div></div>'
    new_region = region[:r1s] + new_row + region[sepA_s:sepA_e] + region[accA_s:accA_e] + region[sepB_s:sepB_e] + region[accB_s:]
    return text[:s2] + new_region + text[s3:]


def note_after_table(text):
    """P-8b: the overflow rule as a text block under the first table."""
    marker = ' data-rv-after="P-8b"'
    i = text.index(marker)
    text = text.replace(marker, "", 1)
    t_end = text.index("</table>", i) + len("</table>")
    # close the two wrapper divs of the c-table component
    j = t_end
    for _ in range(2):
        j = text.index("</div>", j) + len("</div>")
    note = ('\n<div class="c-wysiwyg wysiwyg section"><div class="rte "><p><!--rv:P-8--><span class="footnote">'
            "The Tri-agency CV must not exceed its page limit. Any pages over the limit are removed with no further "
            "notification. Formatting also differs between the three Tri-agency partners: SSHRC and CIHR require "
            "12-point Arial, and NSERC requires 12-point Times New Roman. See the formatting note below before you "
            "start.</span></p></div></div>")
    return text[:j] + note + FORMATTING_ACCORDION + text[j:]


FORMATTING_ACCORDION = """
<div class="c-accordion section">
  <div class="accordion mt-4">
    <div class="accordion-item border-default">
      <h3 class="accordion-header xlarge">
        <button class="accordion-button focus-custom--outline-offset-0 collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#rv_formatting_panel" aria-expanded="false" aria-controls="rv_formatting_panel">
          <div class="title"><span><!--rv:P-30-->What font and formatting do I use?</span></div>
        </button>
      </h3>
      <div id="rv_formatting_panel" class="accordion-collapse collapse">
        <div class="accordion-body">
          <div class="c-wysiwyg wysiwyg section"><div class="rte ">
            <p><span class="xlarge-text">The three Tri-agency partners do not use the same formatting rules, so the agency you are applying to decides the format of your TCV.</span></p>
            <ul>
              <li><span class="xlarge-text"><b>SSHRC and CIHR</b> require 12-point Arial in black type. You can use different fonts and sizes in tables, figures and legends, as long as the text is readable when the page is viewed at 100%.</span></li>
              <li><span class="xlarge-text"><b>NSERC</b> requires 12-point Times New Roman for all text, including references and tables. The exception for tables, figures and legends does not apply to an NSERC application.</span></li>
              <li><span class="xlarge-text">The <b>CV-FRQ</b> requires 12-point Times New Roman, with margins of at least 2 cm, your name in the header and the document title in the footer.</span></li>
            </ul>
            <p><span class="xlarge-text">None of them accept condensed fonts, and all of them require you to use the agency's own template.</span></p>
            <p><span class="footnote">If you are preparing one CV for more than one agency, 12-point Times New Roman throughout meets the strictest of these rules.</span></p>
          </div></div>
        </div>
      </div>
    </div>
  </div>
</div>"""


def lowercase_running_text(html):
    """L-1 (Q-1): "narrative CV" in lower case in running text, as the agencies write it.
    A capital stays only where the phrase opens a heading, a table cell or a sentence."""
    changed = 0
    out = []
    in_cite = 0  # a cited title keeps its own capitals
    for part in re.split(r"(<[^>]+>)", html):
        if part.startswith("<"):
            if re.match(r"<cite\b", part): in_cite += 1
            elif part.startswith("</cite"): in_cite -= 1
            out.append(part)
            continue
        if in_cite or "Narrative CV" not in part:
            out.append(part)
            continue
        def fix(m, part=part):
            nonlocal changed
            before = part[: m.start()]
            if not before.strip() or re.search(r"[.!?:]\s*$", before):
                return m.group(0)
            changed += 1
            return "<!--rv:L-1-->narrative CV"
        out.append(re.sub(r"Narrative CV", fix, part))
    return "".join(out), changed


def closing_block(text):
    """P-5, P-14, P-15: a closing call to action, the contact line and the status line."""
    anchor = "</section>\n</div>"
    i = text.rindex(anchor) + len(anchor)
    block = f'''
<div class="c-grid-container grid-container section">
  <section class="border-bottom picturefill-container margin-top-desktop-0 margin-bottom-desktop-0 margin-top-mobile-0 margin-bottom-mobile-0" style="background-color: transparent;">
    <div class="container width940 mx-auto padding-top-desktop-40px padding-bottom-desktop-40px padding-top-mobile-20px padding-bottom-mobile-20px">
      <div class="grid-container-parsys parsys">
        <div class="c-anchor-link section"><a id="next"></a></div>
        <div class="c-box box section">
          <div class="bloc p-4 mb-4 box-text-black box-link-black" style="background-color: #F0F0F0 !important;">
            <div class="parsys">
              <div class="c-wysiwyg wysiwyg section"><div class="rte ">
                <h3><!--rv:P-5-->Ready to start drafting?</h3>
                <p><span class="xlarge-text">The Narrative CV builder helps you develop a draft outline with guided prompts and examples. You can expect to spend 60 to 90 minutes on it.</span></p>
              </div></div>
              <div class="c-button section"><div class="text-left"><a href="{BUILDER_URL}" target="_self" class="btn btn-ghost-filled btn-bg-912338"><span>Open the Narrative CV builder</span></a></div></div>
            </div>
          </div>
        </div>
        <div class="c-wysiwyg wysiwyg section"><div class="rte ">
          <p><!--rv:P-14--><span class="xlarge-text">If you have questions about your Narrative CV, please contact the Pathways to Impact team at <a href="mailto:impact@concordia.ca">impact@concordia.ca</a>.</span></p>
          <p><!--rv:P-15--><span class="footnote">Last reviewed: September 2026. This guide gives Concordia's advice and is not an official position of the Tri-agency or the Fonds de recherche du Québec. The instructions for your funding opportunity take precedence.</span></p>
        </div></div>
      </div>
    </div>
  </section>
</div>'''
    return text[:i] + block + text[i:]


# ---------------------------------------------------------------- assets and links

SPRITE_SYMBOLS = ["ci-chevron-up", "ci-close", "ci-close-flat", "ci-hamburger", "ci-hub-menu-icon", "ci-search"]


def inline_sprite():
    sprite = (SRC / "assets" / "svg-sprites.svg").read_text(encoding="utf-8")
    symbols = []
    for sym in SPRITE_SYMBOLS:
        m = re.search(rf'<symbol[^>]*\bid="{sym}"[^>]*>.*?</symbol>', sprite, re.S)
        if not m:
            raise SystemExit(f"sprite symbol missing: {sym}")
        symbols.append(m.group(0))
    return ('<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">'
            + "".join(symbols) + "</svg>")


def rewire(html):
    html = re.sub(r"<script\b[^>]*>.*?</script>", "", html, flags=re.S)
    html = re.sub(r"<noscript\b[^>]*>.*?</noscript>", "", html, flags=re.S)
    html = re.sub(r'(href|xlink:href)="/etc/designs/concordia/clientlibs/img/svg-sprites\.svg#', r'\1="#', html)
    html = html.replace('src="/etc/designs/concordia/clientlibs/img/', 'src="src/assets/')
    html = re.sub(r'href="/content/concordia/en/([^"]*)"', r'href="https://www.concordia.ca/\1"', html)
    html = re.sub(r'href="/content/concordia/fr/([^"]*)"', r'href="https://www.concordia.ca/fr/\1"', html)
    html = re.sub(r'href="/content/concordia/([^"]*)"', r'href="https://www.concordia.ca/\1"', html)
    html = re.sub(r'href="/([a-z][^"]*)"', r'href="https://www.concordia.ca/\1"', html)
    return html


def patch_css(css):
    css = css.replace('background-image: url("clientlibs/img/sprites.png");', "")
    css = css.replace("--cds-font-family-brand-condensed: 'gill-sans-nova-condensed',sans-serif",
                      "--cds-font-family-brand-condensed: 'gill-sans-nova-condensed','Gill Sans Nova Cond','Gill Sans MT Condensed','Cabin Condensed',sans-serif")
    css = css.replace("--cds-font-family-brand: 'gill-sans-nova',sans-serif",
                      "--cds-font-family-brand: 'gill-sans-nova','Gill Sans Nova','Gill Sans','Gill Sans MT','Cabin',sans-serif")
    return css


# ---------------------------------------------------------------- assemble

def main():
    corrections = json.loads(read("corrections.json"))
    seeds = json.loads(read("seed-comments.json"))
    main_html = read("aem-main.html")

    for edit in corrections["edits"]:
        main_html = apply_edit(main_html, edit)
    main_html = cards_three_up(main_html)
    main_html = note_after_table(main_html)
    main_html = closing_block(main_html)
    main_html, lowered = lowercase_running_text(main_html)
    if lowered != 12:
        raise SystemExit(f"[L-1] expected 12 mid-sentence 'Narrative CV', found {lowered}")

    changes = {e["id"].rstrip("abcde"): {"title": e["title"], "group": e["group"], "note": e.get("note", "")}
               for e in corrections["edits"]}
    changes.update({
        "I-6": {"title": "Section cards: three in one row, accordions after", "group": "A", "note": "In AEM: a three-column layout container for the cards; both accordions follow it."},
        "P-5": {"title": "Closing call to action restored", "group": "A", "note": "In AEM: a Box with a Text and a Button, after the last accordion."},
        "P-14": {"title": "Contact line (F-12)", "group": "B", "note": ""},
        "P-15": {"title": "Reviewed date and status line", "group": "B", "note": ""},
        "P-8": {"title": "Page limits and the overflow rule (F-3)", "group": "B", "note": "Verified at SSHRC and the CIHR FAQ on 2026-09-21."},
        "L-1": {"title": "Lower-case 'narrative CV' in running text, as the agencies write it (Q-1)", "group": "C", "note": "Prem, 2026-09-22: go with what the agencies use. 14 places; the page title and the table column header keep their capital."},
        "P-33": {"title": "Funder list: Wellcome Trust removed (F-17)", "group": "B", "note": "Prem, 2026-09-22."},
        "P-34": {"title": "Specificity example: neutral and marked as illustrative (F-19)", "group": "C", "note": "Prem, 2026-09-22."},
        "P-28": {"title": "First person: your role is the requirement; Concordia recommends 'I' (F-1)", "group": "B", "note": "Approved by Eli, 2026-09-22."},
        "P-29": {"title": "The change is rhetorical: make your own role visible (F-9)", "group": "B", "note": "Approved by Eli, 2026-09-22."},
        "P-35": {"title": "TCV rollout: gradual, no year, no list of competitions (F-5)", "group": "B", "note": "Eli, 2026-09-22. No primary source gives a year."},
        "P-36": {"title": "What reviewers look for: the agencies' own wording in place of a scoring claim (F-10)", "group": "B", "note": "Quotes the SSHRC and CIHR instructions."},
        "P-37": {"title": "Ownership: evidence from Fasoli et al. 2025 (F-10)", "group": "B", "note": "Source sent by Eli, 2026-09-22. In AEM: a second paragraph in the Ownership accordion."},
        "P-32": {"title": "CV-FRQ language: French or English, with the ministry-partnership exception (F-2)", "group": "B", "note": "FRQ presentation standards and CV-FRQ instructions (July 2026); confirmed and extended by Holly, 2026-09-22."},
        "P-31": {"title": "TCV hyperlinks: the exception is conditional, and reviewers may not open links (F-21)", "group": "B", "note": "Source: 'Guidelines for reviewing the tri-agency CV', section 5, at CIHR and NSERC. Read 2026-09-22."},
        "P-30": {"title": "Fonts differ by agency: Arial at SSHRC and CIHR, Times New Roman at NSERC (F-22)", "group": "B", "note": "In AEM: a new accordion under the comparison table. Stated as instructions (Prem, 2026-09-22). Fonts verified at SSHRC, NSERC and the FRQ the same day."},
        "P-9": {"title": "Official section names (F-15)", "group": "B", "note": "Verified at SSHRC, CIHR and the FRQ on 2026-09-21."},
        "P-10": {"title": "Selection criterion: contributions that relate to the application (F-16, F-6)", "group": "B", "note": ""},
        "P-27": {"title": "Drop 'actually'; register (L-16)", "group": "C", "note": ""},
        "L-19": {"title": "Heading: drop the stray article", "group": "A", "note": ""},
        "P-7": {"title": "Meta description", "group": "A", "note": "In the page head; see the page properties in AEM."},
    })

    header = rewire(read("aem-header.html"))
    footer = rewire(read("aem-footer.html"))
    main_html = rewire(main_html)

    config = {
        "changes": changes,
        "seeds": seeds["comments"],
        "storage": seeds.get("storage", {"backend": "local"}),
        "snapshot": seeds.get("snapshot", ""),
        "hidden": seeds.get("hidden", []),  # sheet rows the page ignores (test comments)
    }

    aem_css = patch_css(read("aem-used.css"))
    # content hashes on every asset link: a changed file always reaches reviewers, never a cached copy
    ver = lambda text: hashlib.md5(text.encode("utf-8")).hexdigest()[:10]

    page = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Narrative CV | Pathways to Impact — review copy</title>
<meta name="description" content="{META_DESCRIPTION}">
<meta name="robots" content="noindex,nofollow">
<link rel="stylesheet" href="https://use.typekit.net/ewy3egs.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Cabin+Condensed:wght@400;500;600;700&family=Cabin:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20,300,0..1,-25">
<link rel="stylesheet" href="aem.css?v={ver(aem_css)}">
<link rel="stylesheet" href="review.css?v={ver((OUT_DIR / "review.css").read_text(encoding="utf-8"))}">
</head>
<body class="concordia page basicpage">
<div id="rv-bar" class="rv-bar" role="region" aria-label="Review tools"></div>
<div id="boot">
<div class="rv-chrome">
{header}
</div>
{main_html}
<div class="rv-chrome">
{footer}
</div>
</div>
{inline_sprite()}
<script>window.RV_CONFIG = {json.dumps(config, ensure_ascii=False)};</script>
<script src="review.js?v={ver((OUT_DIR / "review.js").read_text(encoding="utf-8"))}"></script>
</body>
</html>
'''
    (OUT_DIR / "index.html").write_text(page, encoding="utf-8")
    (OUT_DIR / "aem.css").write_text(aem_css, encoding="utf-8")

    markers = sorted(set(re.findall(r"<!--rv:([A-Z]-\d+)-->", main_html)))
    missing = [m for m in markers if m not in changes]
    if missing:
        raise SystemExit(f"markers without a change entry: {missing}")
    print(f"built ncv-guide-review/index.html: {len(corrections['edits'])} edits, {len(markers)} change markers, {len(seeds['comments'])} seeded comments")


if __name__ == "__main__":
    main()
