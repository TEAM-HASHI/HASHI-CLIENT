#!/usr/bin/env python3
"""Inject a short HASHI project primer at Codex session start."""

from __future__ import annotations

import json
import sys
from pathlib import Path


PRIMER = """HASHI Client project context:
- Use pnpm only. Do not use npm, yarn, or bun in this repository.
- Before editing, classify the work from AGENTS.md and read only the task-relevant docs.
- Check git status with `git status --short --branch --untracked-files=all` before changes.
- docs/ is the human-readable source of truth. .agents/ contains agent-facing checklists, recipes, skills, and scripts that operationalize docs/.
- If docs/ and .agents/ conflict, follow docs/ first and align .agents/ afterward.
- For page, shared component, hook, API query/mutation, or HDS work, check whether a nearby *.spec.md is required.
- Keep HDS packages product-agnostic: no app route, API, query, mutation, tracking, product copy, or domain data in packages/hds-ui or packages/hds-icons.
- Before final response, report docs impact and verification commands/results."""


def read_payload() -> dict:
    try:
        return json.load(sys.stdin)
    except json.JSONDecodeError:
        return {}


def is_relative_to(path: Path, parent: Path) -> bool:
    try:
        path.relative_to(parent)
    except ValueError:
        return False
    return True


def main() -> int:
    payload = read_payload()
    repo_root = Path(__file__).resolve().parents[2]
    cwd = Path(payload.get("cwd") or repo_root).resolve()

    if not is_relative_to(cwd, repo_root):
        return 0

    print(
        json.dumps(
            {
                "hookSpecificOutput": {
                    "hookEventName": "SessionStart",
                    "additionalContext": PRIMER,
                }
            },
            ensure_ascii=False,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
