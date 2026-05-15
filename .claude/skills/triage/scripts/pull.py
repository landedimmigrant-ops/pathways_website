#!/usr/bin/env python3
"""Pull the triage sheet tabs and report open items.

Reads config.local.json (one directory up) for the tab CSV URLs, fetches each
tab, filters to open rows (status new / triage / In Progress / blank), and
prints a report grouped by tab and ordered by severity. Stdlib only.

Usage:
    python3 pull.py            report open items only
    python3 pull.py --all      include closed rows too
"""
import csv
import io
import json
import subprocess
import sys
from pathlib import Path

CONFIG = Path(__file__).resolve().parent.parent / "config.local.json"
OPEN_STATUSES = {"", "new", "triage", "in progress"}
SEV_ORDER = {"high": 0, "medium": 1, "low": 2, "": 3}


def load_config():
    if not CONFIG.exists():
        sys.exit(f"Missing {CONFIG}\nCopy config.local.example.json to "
                 f"config.local.json and fill in the real values.")
    return json.loads(CONFIG.read_text())


def fetch_csv(url):
    # Shell out to curl — its CA store works reliably across machines where
    # Python's default SSL context can't find the system certificates.
    out = subprocess.run(["curl", "-sL", "--fail", url],
                         capture_output=True, text=True, timeout=30)
    if out.returncode != 0:
        raise RuntimeError(f"curl exited {out.returncode}: "
                           f"{out.stderr.strip() or 'request failed'}")
    return list(csv.reader(io.StringIO(out.stdout)))


def col(headers, *names):
    """Index of the first matching header (case/space-insensitive), or -1."""
    low = [h.strip().lower() for h in headers]
    for name in names:
        if name in low:
            return low.index(name)
    return -1


def cell(row, idx):
    return row[idx].strip() if 0 <= idx < len(row) else ""


def main():
    show_all = "--all" in sys.argv
    cfg = load_config()
    grand_total = 0

    for prefix, tab in cfg["tabs"].items():
        try:
            rows = fetch_csv(tab["csv"])
        except Exception as exc:  # noqa: BLE001
            print(f"\n=== {tab['name']} ({prefix}-) — FETCH FAILED: {exc} ===")
            continue
        if not rows:
            continue

        headers = rows[0]
        c_id = col(headers, "id")
        c_status = col(headers, "status")
        c_sum = col(headers, "bug/ issue", "bug/ issue / feedback",
                    "bug/issue", "content to consider")
        c_sev = col(headers, "severity")

        items = []
        for row in rows[1:]:
            if not any(c.strip() for c in row):
                continue
            summary = cell(row, c_sum)
            if not summary:
                # Placeholder row — has an id but no actual content. Skip.
                continue
            status = cell(row, c_status)
            if not show_all and status.lower() not in OPEN_STATUSES:
                continue
            items.append({
                "id": cell(row, c_id),
                "status": status or "new",
                "summary": summary,
                "severity": cell(row, c_sev),
            })

        items.sort(key=lambda x: (SEV_ORDER.get(x["severity"].lower(), 3),
                                  x["id"]))
        grand_total += len(items)
        label = "rows" if show_all else "open"
        print(f"\n=== {tab['name']} ({prefix}-) — {len(items)} {label} ===")
        for x in items:
            sev = f"[{x['severity']}]" if x["severity"] else "[--]"
            ident = x["id"] or "(no id)"
            print(f"  {ident:9} {sev:9} {x['status']:13} {x['summary'][:68]}")

    print(f"\nTotal: {grand_total} "
          f"{'rows' if show_all else 'open items'}\n")


if __name__ == "__main__":
    main()
