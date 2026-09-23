// aem-review-kit/apps-script/review.gs
// Comment + "done in AEM" storage for review pages, in the project Google Sheet.
// Live since 2026-09-22 in the sheet "pathways website_bug reprot" (the one /triage uses).
//
// To set up in a sheet's bound Apps Script:
//   1. Paste this whole file at the end of Code.gs.
//   2. In the existing doPost(e), directly after the line that parses the body, add
//        if (body.action === "review_comment") return reviewComment_(body);
//      before the secret check (the review page is public, so this action carries no secret;
//      it can only append to the "Guide review" tab).
//   3. If the script has no doGet, this file provides one. If it has one, add the review_list branch.
//   4. Deploy -> Manage deployments -> pencil -> Version: NEW VERSION -> Deploy.
//      Saving alone changes nothing: the /exec URL serves the deployed version.
//   5. Check: <exec URL>?action=review_list&page=<page key>  returns {"rows":[...]}.
//
// One tab holds every guide; the `page` column separates them. Rows are append-only:
// a reply is a row with `parent`, a resolve is kind=status, a "done in AEM" mark is kind=aem
// with parent "chg:<change id>" and the text fingerprint in `quote`.

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
