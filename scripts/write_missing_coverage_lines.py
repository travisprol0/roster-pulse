#!/usr/bin/env python3
"""
Write a Markdown file listing uncovered line numbers per application source file.

Requires a prior coverage run (e.g. ./test.sh or pytest). Reads .coverage from the
current directory, respects .coveragerc, and writes coverage/missing_python_coverage_lines.md
by default.
"""

import argparse
import glob
import os
import sys

SOURCE_PREFIXES = ("config/", "leagues/", "espn/", "engine/")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Write missing coverage lines to a Markdown file (requires prior coverage run)."
    )
    parser.add_argument(
        "--output",
        default="coverage/missing_python_coverage_lines.md",
        metavar="PATH",
        help="Output Markdown file path (default: coverage/missing_python_coverage_lines.md).",
    )
    args = parser.parse_args()

    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(root)

    try:
        import coverage
    except ImportError:
        print("coverage package not installed.", file=sys.stderr)
        return 2

    if not os.path.isfile(".coverage"):
        if glob.glob(".coverage.*"):
            cov = coverage.Coverage()
            cov.combine()
        else:
            print(
                "No .coverage file found. Run tests with coverage first, e.g.: ./test.sh",
                file=sys.stderr,
            )
            return 2

    cov = coverage.Coverage()
    cov.load()

    file_missing: list[tuple[str, list[int]]] = []
    for filepath in cov.get_data().measured_files():
        try:
            rel = os.path.relpath(filepath, root)
        except ValueError:
            rel = filepath
        if not rel.startswith(SOURCE_PREFIXES):
            continue
        try:
            analysis = cov.analysis2(filepath)
        except Exception:
            continue
        missing = analysis[3]
        if not missing:
            continue
        file_missing.append((rel, sorted(missing)))

    file_missing.sort(key=lambda x: x[0])

    outpath = os.path.join(root, args.output)
    os.makedirs(os.path.dirname(outpath) or ".", exist_ok=True)

    with open(outpath, "w", encoding="utf-8") as f:
        f.write("# Missing Python coverage lines\n\n")
        f.write("Lines below were not covered by the last pytest coverage run.\n\n")
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
