"""
Narrative CV guide — structural edits a find/replace cannot express.
Called by aem-review-kit/build.py after src/corrections.json has been applied.
"""
import re

BUILDER_URL = 'https://www.concordia.ca/research/pathways-to-impact/learn/tools/narrative-cv-builder.html'

# filled in by apply() from the kit, so these functions read like ordinary code
next_block = block_end = None


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


def apply(html, kit, guide):
    global next_block, block_end
    next_block, block_end = kit.next_block, kit.block_end
    html = cards_three_up(html)          # I-6
    html = note_after_table(html)        # P-8b, P-30
    html = closing_block(html)           # P-5, P-14, P-15
    # L-1 (Q-1): "narrative CV" in lower case in running text, as the agencies write it
    html, lowered = kit.recase_running_text(html, "Narrative CV", "narrative CV", "L-1")
    if lowered != 12:
        raise SystemExit(f"[L-1] expected 12 mid-sentence 'Narrative CV', found {lowered}")
    return html
