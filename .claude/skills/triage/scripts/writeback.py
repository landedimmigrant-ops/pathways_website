#!/usr/bin/env python3
"""Write status (and optionally commit SHA) back to the triage sheet.

Reads config.local.json (one directory up) for the webhook URL + secret.
POSTs the updates to the Apps Script webhook, then VERIFIES by re-pulling the
affected tab CSVs — the POST response itself is unreliable (302 redirect chain
that bare HTTP clients can't complete), so verification is the source of
truth. Stdlib only.

Usage:
    python3 writeback.py B-06=done
    python3 writeback.py B-07=done B-08=done N-02=done
    python3 writeback.py B-06=done=abc1234        (id=status=commit SHA)

Exit code 0 = every update verified; 1 = at least one mismatch.
"""
import csv
import io
import json
import subprocess
import sys
import time
from pathlib import Path

CONFIG = Path(__file__).resolve().parent.parent / "config.local.json"
SETTLE_SECONDS = 6


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


def parse_args(args):
    """Each arg is ID=status or ID=status=commit."""
    updates = []
    for arg in args:
        parts = arg.split("=")
        if len(parts) < 2 or not parts[0]:
            sys.exit(f"Bad argument '{arg}' — expected ID=status[=commit]")
        update = {"id": parts[0].strip(), "status": parts[1].strip()}
        if len(parts) > 2 and parts[2].strip():
            update["commit"] = parts[2].strip()
        updates.append(update)
    return updates


def post(cfg, updates):
    payload = json.dumps({"secret": cfg["secret"], "updates": updates})
    out = subprocess.run(
        ["curl", "-sL", "-X", "POST",
         "-H", "Content-Type: application/json",
         "-d", payload, cfg["webhook_url"]],
        capture_output=True, text=True, timeout=30)
    body = out.stdout or ""
    # The 302 redirect chain serves an HTML page rather than the script's
    # JSON — expected, and not an error. The one real failure worth surfacing
    # is a data-validation rejection; verification below confirms either way.
    if "violates the data validation" in body:
        print("WARNING: the sheet rejected a value (data validation). "
              "The verification below will show which row failed.")


def verify(cfg, updates):
    by_prefix = {}
    for u in updates:
        by_prefix.setdefault(u["id"].split("-")[0], []).append(u)

    all_ok = True
    for prefix, ups in by_prefix.items():
        tab = cfg["tabs"].get(prefix)
        if not tab:
            print(f"  ?         {prefix}-* : no tab mapped in config — "
                  f"cannot verify")
            all_ok = False
            continue
        rows = fetch_csv(tab["csv"])
        headers = [h.strip().lower() for h in rows[0]]
        c_id = headers.index("id")
        c_status = headers.index("status")
        index = {r[c_id].strip(): r for r in rows[1:] if len(r) > c_id}
        for u in ups:
            row = index.get(u["id"])
            got = (row[c_status].strip()
                   if row and len(row) > c_status else "(row not found)")
            ok = got.lower() == u["status"].lower()
            all_ok = all_ok and ok
            print(f"  {'OK' if ok else 'MISMATCH':9} {u['id']:8} "
                  f"status={got!r} (wanted {u['status']!r})")
    return all_ok


def main():
    args = [a for a in sys.argv[1:] if a]
    if not args:
        sys.exit(__doc__)
    cfg = load_config()
    updates = parse_args(args)

    print(f"Posting {len(updates)} update(s): "
          + ", ".join(f"{u['id']}={u['status']}" for u in updates))
    post(cfg, updates)
    print(f"Waiting {SETTLE_SECONDS}s for the sheet to settle, then verifying "
          f"via CSV re-pull...")
    time.sleep(SETTLE_SECONDS)
    ok = verify(cfg, updates)
    print("\nAll updates verified." if ok
          else "\nSome updates did NOT land — see MISMATCH rows above.")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
