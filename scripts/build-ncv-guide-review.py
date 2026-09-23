#!/usr/bin/env python3
"""
Builds the Narrative CV guide review copy (ncv-guide-review/).

Kept so the familiar command still works. The engine now lives in the reusable kit:

    python3 aem-review-kit/build.py ncv-guide-review

Guide-specific pieces: ncv-guide-review/src/ (guide.json, corrections.json,
seed-comments.json, hooks.py). See aem-review-kit/README.md.
"""
import runpy
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.argv = [str(ROOT / "aem-review-kit" / "build.py"), str(ROOT / "ncv-guide-review")]
runpy.run_path(sys.argv[0], run_name="__main__")
