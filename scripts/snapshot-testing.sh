#!/usr/bin/env bash
# Snapshot the current dev site into /testing/ so it can be served as the
# frozen user-testing version at landedimmigrant-ops.github.io/pathways_website/testing/.
#
# Run from the repo root:
#   ./scripts/snapshot-testing.sh
#
# After it finishes:
#   git add testing/ content/data/
#   git commit -m "Refresh testing snapshot (YYYY-MM-DD)"
#   git push   # GH Pages picks it up within ~1 min
#
# The /testing/ copy:
#   - Reads content from baked JSON snapshots (SHEETS.mode = "baked"),
#     so coordinator sheet edits don't leak into the test version.
#   - Banner reads "User testing version (frozen snapshot)" instead of
#     "Beta — development / prototype version".
#   - Asset cache-bust query strings are stamped with the snapshot date
#     so browsers fetch the new version after each refresh.

set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: node is required to run scripts/bake.js" >&2
  exit 1
fi

TIMESTAMP=$(date -u +"%Y-%m-%d")
SNAPSHOT_TAG="frozen-${TIMESTAMP}"

echo "[1/5] Refreshing baked snapshots from live Google Sheet..."
node scripts/bake.js

echo "[2/5] Wiping and recreating /testing/..."
rm -rf testing
mkdir -p testing

echo "[3/5] Copying SPA assets and content..."
cp index.html app.js data.js styles.css pathways_to_impact.md testing/
cp -R content testing/
cp -R resources testing/

echo "[4/5] Patching /testing/app.js (mode -> baked)..."
# Flip SHEETS.mode from "live" to "baked" so the test version reads from
# the JSON snapshots in /testing/content/data/ instead of the live sheet.
sed -i.bak 's/mode: "live"/mode: "baked"/' testing/app.js
rm testing/app.js.bak

echo "[5/5] Patching /testing/index.html (banner + cache-bust)..."
# Distinct banner so testers immediately know which version they're on.
sed -i.bak 's|Beta — development / prototype version|User testing version (frozen snapshot)|' testing/index.html
# Stamp asset cache-bust with the snapshot date so each refresh invalidates
# the previous /testing/* cache cleanly.
sed -i.bak -E "s/(\.(js|css))\?v=[^\"']+/\1?v=${SNAPSHOT_TAG}/g" testing/index.html
rm testing/index.html.bak

echo
echo "Snapshot complete: testing/ refreshed at ${TIMESTAMP} (UTC)"
echo "Mode: baked  |  Banner: User testing version (frozen snapshot)  |  Cache-bust: v=${SNAPSHOT_TAG}"
echo
echo "Preview locally: http://localhost:8000/testing/"
echo "Live URL (after push): https://landedimmigrant-ops.github.io/pathways_website/testing/"
echo
echo "Next: git add testing/ content/data/ && git commit && git push"
