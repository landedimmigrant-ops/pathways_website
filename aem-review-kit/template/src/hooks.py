"""
Structural edits for this guide that a find/replace in corrections.json cannot express:
moving blocks, inserting a new accordion or a closing block, a page-wide recasing pass.
Called by aem-review-kit/build.py after corrections.json. Delete this file if unused.

Helpers on `kit`: kit.next_block(text, cls, after) -> (start, end),
kit.block_end(text, start), kit.recase_running_text(html, phrase, lowered, marker_id).
Mark every change with <!--rv:ID--> and give each ID an entry in guide.json "changes".
See ncv-guide-review/src/hooks.py for a worked example.
"""


def apply(html, kit, guide):
    return html
