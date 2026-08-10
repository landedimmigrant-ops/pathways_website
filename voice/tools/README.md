# Reproducing the construction study

The two scripts behind `voice/construction-study.md`. Run them to re-measure after the sources change,
or to check a number you don't believe.

```bash
cd voice/tools
python3 harvest.py            # all four sources -> corpus/<site>/*.txt
python3 analyze.py            # prints the comparison table
```

`harvest.py <site>` runs one source at a time (`concordia`, `sshrc`, `cihr`, `nserc`). It skips pages
already on disk, so a re-run resumes rather than re-fetching.

**How it works.** One-hop link discovery from each site's researcher-facing entry points → `curl`
fetch (this machine's Python has no working SSL CA bundle, hence curl) → main-content extraction
(`<main>` or `role="main"`, chrome/scripts/nav stripped) → block-level parse preserving
`h1–h4 / p / li`, one `tag<TAB>text` line per block. `analyze.py` computes per-1,000-word rates over
paragraph and list text only.

**Be polite.** There's a 0.6s delay between fetches and a page cap per source. Don't remove either.

**Known limits** — these are real and are documented in `construction-study.md` §7:

- Heading classification is heuristic; the question/not-question split is reliable, the
  imperative/noun split is approximate.
- NSERC's headings don't survive extraction (n=12) — that row is unmeasured, not zero.
- Imperative-sentence detection undercounts imperatives opening with an adverb or a prepositional
  phrase. The 3–8% band is a floor.
- Sites move. SSHRC needs `.aspx` paths; CIHR uses bare relative links. Both are handled, but a site
  redesign will break discovery before it breaks parsing — check the page counts first.
