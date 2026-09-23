# Narrative CV guide: review copy

A copy of the Narrative CV guide as it stands on Concordia's AEM dev site, with the corrections
from `ncv-guide-aem-review-2026-09-21.md` applied, and a highlight-and-comment layer so reviewers
can mark errors and questions in place.

Live (once pushed): `https://landedimmigrant-ops.github.io/pathways_website/ncv-guide-review/`

## Source of truth

Since 2026-09-22 this page is the source of truth for the guide's content; the AEM page is corrected
from it by hand, using the tags and Copy text. Staff comment on the page. Comments are processed in
batches: pull the Guide review tab, propose fixes, apply the approved ones in `src/corrections.json`
(or the build script for structural blocks), rebuild, then close each thread with a reply saying what
was done and a resolve. Only threads waiting on a person stay open.

## What reviewers see

**Default (reviewers).** The corrected page and the comment tools, with no change tracking on show.
Questions already placed on the page are yellow highlights. Select any text and choose **Comment on
this**; click a highlight to open its comment, or click a comment to go to its passage. The panel
opens on the open threads.

**AEM copy mode (whoever pastes into AEM).** The **AEM copy mode** switch at the right of the top
bar. Every corrected block shows its tag (`I-1`, `P-9`…) and a blue edge; click a tag for what
changed and **Copy text** / **Copy HTML**. Any other block shows a **Copy** handle on hover. The panel
becomes the checklist of changes, each with **Go to** and **Copy**. Comment highlights go plain and
the comment button stays away. The switch remembers each viewer's choice; a link ending in
`?aem=1` opens straight into copy mode (send that one to the web editor), `?aem=0` forces it off.

The Concordia chrome (header, breadcrumb, footer) is a static snapshot; its links point at
www.concordia.ca.

## Files

Built with the reusable kit in `aem-review-kit/` (see its README; the process is in the
`aem-guide-review` skill). This folder holds only what is specific to this guide.

| Path | What |
|---|---|
| `index.html`, `aem.css`, `review.js`, `review.css` | **Built.** Do not edit here; the layer's source is `aem-review-kit/layer/`. |
| `src/guide.json` | Title, head links, link rewiring, CSS patches, and change entries for structural edits. |
| `src/corrections.json` | Every text edit, keyed by the review ID. Edit this to change what the page says. |
| `src/hooks.py` | Structural edits: three-up cards, the formatting accordion, the closing block, the lower-case pass. |
| `src/seed-comments.json` | Questions placed on the page, storage settings, hidden test rows. |
| `src/aem-*.html`, `src/aem-used.css`, `src/assets/` | The AEM snapshot (2026-09-22). |

## Rebuild

```bash
python3 aem-review-kit/build.py ncv-guide-review
```

(`python3 scripts/build-ncv-guide-review.py` does the same.) The build fails if a correction's `find`
text is not on the page exactly the expected number of times, so a fresh snapshot of the AEM page
surfaces every edit that no longer applies. To re-snapshot, follow "Start a new guide review", step 2,
in `aem-review-kit/README.md`, pointing `split.py` at this folder.

## Fonts

The AEM page uses Adobe Fonts (Typekit kit `ewy3egs`: Gill Sans Nova and Gill Sans Nova
Condensed) plus Inter and Material Symbols from Google Fonts. The Typekit link is kept; the kit
served the fonts on localhost, and if it refuses the GitHub Pages domain the headings fall back to
Cabin Condensed from Google Fonts, the closest free face. Check the headings after the first push.

## Where comments go

**Live since 2026-09-22.** Comments append to the **Guide review** tab of the project sheet
(`pathways website_bug reprot`, the one `/triage` uses) through its Apps Script webhook, and the
page reads them back from the same script. Everyone sees everyone's comments.

Settings live in `src/seed-comments.json` → `storage`; `backend` is `sheet`. Set it back to
`local` to take the page offline (comments then stay in each reviewer's browser).

Rows are append-only, matching the sheet hygiene rule: a reply is a row with `parent`, a resolve or
reopen is a row with `kind = status`. The page derives each thread's state from its rows. Never
edit a row's text by hand; delete a row only to remove a test or spam entry.

**The webhook URL is in the built page, so it is public once pushed.** It carries no secret: the
`review_comment` action can only append to the Guide review tab, and the Bugs / NCV / Features
tabs stay behind `SHARED_SECRET`. The exposure is that anyone who finds the URL could append a
junk row. Acceptable for a short review window; say the word and I will add a page token.

### How the sheet backend was set up (for reference, or to redo it)

1. Open the project sheet → Extensions → Apps Script. Paste the block below into the script.
2. In the existing `doPost(e)`, right after `var data = JSON.parse(e.postData.contents);`, add:
   `if (data.action === 'review_comment') return reviewComment_(data);`
   before the secret check. This action carries no secret because the review page is public; the
   existing `updates` / `append` / `list_tabs` actions keep theirs.
3. If the script has no `doGet`, add the one below; if it has one, add the `review_list` branch.
4. Deploy → Manage deployments → edit → **New version** → Deploy. The `/exec` URL stays the same.
5. In `src/seed-comments.json` set `backend` to `"sheet"`, `writeUrl` to the `/exec` URL, and
   `readUrl` to the same URL followed by `?action=review_list&page=ncv-guide`. Rebuild, push.
6. Open the page: the bar should read "Comments save to the review sheet". Post a test comment and
   check the tab.

```javascript
// ---- Guide review comments (public page, no secret) ----
var REVIEW_TAB = 'Guide review';
var REVIEW_COLS = ['id', 'ts', 'page', 'kind', 'type', 'author', 'text', 'quote', 'prefix', 'suffix', 'section', 'parent', 'status'];

function reviewSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(REVIEW_TAB);
  if (!sh) { sh = ss.insertSheet(REVIEW_TAB); sh.appendRow(REVIEW_COLS); sh.setFrozenRows(1); }
  return sh;
}

function reviewComment_(data) {
  var row = data.row || {};
  reviewSheet_().appendRow(REVIEW_COLS.map(function (k) {
    var v = k === 'page' ? (row.page || data.page || '') : row[k];
    return v == null ? '' : String(v).slice(0, 5000);
  }));
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}

function reviewList_(page) {
  var values = reviewSheet_().getDataRange().getValues();
  var head = values.shift();
  var rows = values.filter(function (r) { return r[0]; }).map(function (r) {
    var o = {};
    head.forEach(function (h, i) { o[h] = r[i] instanceof Date ? r[i].toISOString() : String(r[i]); });
    return o;
  }).filter(function (o) { return !page || o.page === page; });
  return ContentService.createTextOutput(JSON.stringify({ rows: rows })).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.action === 'review_list') return reviewList_(p.page || '');
  return ContentService.createTextOutput('ok');
}
```

### Reading the comments from here

`curl -sL "<exec URL>?action=review_list&page=ncv-guide"` returns every row as JSON; the exec URL is
in `src/seed-comments.json`. A POST returns 405 after Google's redirect even when the write
succeeded, so verify writes by reading back, never by the POST response. Reviewers can also use
**Copy all as Markdown** in the panel.

## Privacy

The page is public on GitHub Pages, as the prototype is. Comments in the sheet backend are
readable by anyone who has the `/exec` URL and the page name. Do not put anything confidential in a
comment; real CVs never go here.
