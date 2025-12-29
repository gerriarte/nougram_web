#!/usr/bin/env python3
"""
Utility script to remove duplicated file contents.

Many files currently contain two concatenated copies of the same source.
This script keeps the first copy and discards the repeated suffix.
"""

from __future__ import annotations

from pathlib import Path
from typing import Iterable


ROOTS: tuple[Path, ...] = (
    Path("backend/app"),
    Path("frontend/src"),
    Path("docs"),
)

SUFFIXES: set[str] = {".py", ".ts", ".tsx", ".js", ".jsx", ".md"}


def candidate_paths() -> Iterable[Path]:
    for root in ROOTS:
        if not root.exists():
            continue
        for path in root.rglob("*"):
            if not path.is_file():
                continue
            if path.suffix.lower() not in SUFFIXES:
                continue
            yield path


def normalize_whitespace_block(text: str) -> str:
    """Collapse whitespace at the end for safer comparisons."""
    return text.rstrip()


def find_duplicate_line_start(text: str) -> int | None:
    """Detect duplication by comparing line sequences."""
    lines = text.splitlines(keepends=True)
    total = len(lines)
    if total < 4:
        return None
    max_gap = min(100, total)
    cumulative_lengths = [0]
    for line in lines:
        cumulative_lengths.append(cumulative_lengths[-1] + len(line))

    for gap in range(max_gap + 1):
        remaining = total - gap
        if remaining <= 0 or remaining % 2 != 0:
            continue
        half = remaining // 2
        start_second = half + gap
        end_second = start_second + half
        if end_second > total:
            continue
        if lines[:half] == lines[start_second:end_second]:
            return cumulative_lengths[start_second]
    return None


def find_duplicate_start(text: str) -> int | None:
    """Return the index where a repeated copy starts, if any."""
    line_idx = find_duplicate_line_start(text)
    if line_idx is not None:
        return line_idx

    stripped_text = text.rstrip()
    n = len(stripped_text)
    if n < 200:
        return None

    half = n // 2
    second_start = half
    while second_start < n and stripped_text[second_start] in "\r\n\t ":
        second_start += 1

    first_half = normalize_whitespace_block(stripped_text[:half])
    second_half = normalize_whitespace_block(stripped_text[second_start:])
    if first_half and first_half == second_half[: len(first_half)] and len(second_half) >= len(first_half):
        if stripped_text[: len(second_half)] == stripped_text[second_start: second_start + len(second_half)]:
            return second_start

    max_chunk = min(20000, half)
    chunk_len = max_chunk
    while chunk_len >= 1000:
        chunk = stripped_text[:chunk_len]
        idx = stripped_text.find(chunk, chunk_len)
        if idx != -1:
            remainder = stripped_text[idx:]
            prefix = stripped_text[: len(remainder)]
            if prefix == remainder:
                return idx
        chunk_len -= 500

    return None


def main() -> None:
    modified = 0
    for path in candidate_paths():
        text = path.read_text(encoding="utf-8")
        idx = find_duplicate_start(text)
        if idx is None:
            continue
        new_text = text[:idx].rstrip() + "\n"
        if new_text == text:
            continue
        backup_path = path.with_suffix(path.suffix + ".dup.bak")
        backup_path.write_text(text, encoding="utf-8")
        path.write_text(new_text, encoding="utf-8")
        modified += 1
        print(f"Trimmed duplicate copy in {path}")

    print(f"Completed. Modified {modified} files.")


if __name__ == "__main__":
    main()

