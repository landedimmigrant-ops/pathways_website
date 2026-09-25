# aem-guide-review — reference

## Who answers what (Pathways, September 2026)

| Question | Person |
|---|---|
| Narrative CV content, workshops, what reviewers value | **Eli Friedland** |
| FRQ rules and practice (language, portal, program exceptions) | **Holly** (in touch with the FRQ) |
| NSERC formatting rules | NSERC directly (Prem) |
| House style, capitalisation, what goes live | **Prem** |
| AEM build, layout, components | the web team (**Andrei**) |
| Staff review | Brett Cox and others, on the page |

## A question for an expert (format that got fast answers)
Short, numbered, each item quoting the page and offering text to approve:

> 1. First person. The guide answers "Is it OK to say 'I' throughout?" with "…". The SSHRC and CIHR
>    instructions ask for "…". Proposed replacement: "…". Are you comfortable with that?

End with a date that leaves working days before launch. Link the review copy so they can answer on
the page instead of by email.

## Closing a thread
Reply first, then resolve. The reply records who decided and what changed:
`Eli approved by email, 2026-09-22. Applied (P-28).`
`Holly, by email 2026-09-22: … Added to the cell (P-32). This question is closed.`

## Sheet row schema (tab "Guide review", one tab for every guide)
`id, ts, page, kind, type, author, text, quote, prefix, suffix, section, parent, status`
- comment: `kind=comment`, anchor in `quote/prefix/suffix`, `section` = nearest h2
- reply: `kind=reply`, `parent=<thread id>`
- resolve/reopen: `kind=status`, `parent=<thread id>`, `status=resolved|open`
- AEM progress: `kind=aem`, `parent=chg:<change id>`, `status=done|open`, `quote=v:<fingerprint>`
Rows are append-only. Test rows go in `seed-comments.json → hidden`.

## Reading and writing rows from here
```bash
URL=$(python3 -c "import json;print(json.load(open('.claude/skills/triage/config.local.json'))['webhook_url'])")
curl -s -L "$URL?action=review_list&page=ncv-guide"
```
Writes: POST `{"action":"review_comment","page":"<key>","row":{…}}` with `Content-Type: text/plain`.
The POST answers 405 after Google's redirect even when it worked; read back to confirm.

## Facts we verified that another guide may reuse (check dates before relying on them)
- TCV: 5 pages EN / 6 FR; overflow pages removed without notice (CIHR FAQ).
- SSHRC: 12-pt Arial, exception for tables/figures/legends. CIHR: 12-pt Times New Roman (Eli,
  2026-09-25). NSERC: 12-pt Times New Roman; smaller legible fonts in tables/figures except those
  listing references (Eli, 2026-09-25, correcting what NSERC told Prem). CV-FRQ: TNR 12.
- Over the page limit: can make an application ineligible; FRQ especially strict (Eli).
- TCV hyperlinks: reviewer guidelines §5, audio/visual exception only where the opportunity allows,
  "no guarantee that hyperlinks will be accessed". NSERC Research Portal bans hyperlinks outright.
- CV-FRQ language: form in French, CV French or English (also on the new portal), except some
  programs run with Quebec ministries (Holly).
- One FRQ since 2024-06-01, three sectors.
- Sources index: `ncv-genre-sources.md`.
