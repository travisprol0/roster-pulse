#!/usr/bin/env python3
"""
Write a Markdown file listing uncovered line numbers per mobile source file.

Requires a prior Jest coverage run (e.g. cd mobile && npm test). Reads
mobile/coverage/coverage-final.json and writes
coverage/missing_js_coverage_lines.md by default.
"""

import argparse
import json
import os
import sys


def missing_lines(file_cov: dict) -> list[int]:
    line_hits = file_cov.get("l")
    if isinstance(line_hits, dict) and line_hits:
        return sorted(
            int(line_no)
            for line_no, hits in line_hits.items()
            if int(hits or 0) == 0
        )

    statement_map = file_cov.get("statementMap") or {}
    statement_hits = file_cov.get("s") or {}
    lines: set[int] = set()
    for stmt_id, hits in statement_hits.items():
        if int(hits or 0) != 0:
            continue
        loc = statement_map.get(stmt_id) or statement_map.get(str(stmt_id))
        if not loc:
            continue
        start = loc.get("start") or {}
        line = start.get("line")
        if line is not None:
            lines.add(int(line))
    return sorted(lines)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Write missing JS coverage lines to Markdown (requires prior Jest run)."
    )
    parser.add_argument(
        "--input",
        default="mobile/coverage/coverage-final.json",
        metavar="PATH",
        help="Jest coverage-final.json path (default: mobile/coverage/coverage-final.json).",
    )
    parser.add_argument(
        "--output",
        default="coverage/missing_js_coverage_lines.md",
        metavar="PATH",
        help="Output Markdown file path (default: coverage/missing_js_coverage_lines.md).",
    )
    args = parser.parse_args()

    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(root)

    inpath = os.path.join(root, args.input)
    if not os.path.isfile(inpath):
        print(
            "No Jest coverage-final.json found. Run frontend tests first, e.g.: ./test.sh frontend",
            file=sys.stderr,
        )
        return 2

    with open(inpath, encoding="utf-8") as f:
        data = json.load(f)

    file_missing: list[tuple[str, list[int]]] = []
    for filepath, file_cov in data.items():
        try:
            rel = os.path.relpath(filepath, root)
        except ValueError:
            rel = filepath
        if "/__tests__/" in rel.replace("\\", "/"):
            continue
        if not rel.startswith("mobile/"):
            continue
        missing = missing_lines(file_cov)
        if not missing:
            continue
        file_missing.append((rel, missing))

    file_missing.sort(key=lambda x: x[0])

    outpath = os.path.join(root, args.output)
    os.makedirs(os.path.dirname(outpath) or ".", exist_ok=True)

    with open(outpath, "w", encoding="utf-8") as f:
        f.write("# Missing JavaScript coverage lines\n\n")
        f.write("Lines below were not covered by the last Jest coverage run.\n\n")
        f.write(f"{len(file_missing)} file(s) with missing lines.\n\n")
        for rel, lines in file_missing:
            f.write(f"## {rel}\n")
            for line_no in lines:
                f.write(f"- {line_no}\n")
            f.write("\n")

    print(f"Wrote {outpath}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
