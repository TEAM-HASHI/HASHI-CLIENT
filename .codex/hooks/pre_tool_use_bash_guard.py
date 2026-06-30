#!/usr/bin/env python3
"""Block risky Bash commands before Codex runs them."""

from __future__ import annotations

import json
import os
import re
import shlex
import sys
from dataclasses import dataclass


BLOCKED_PACKAGE_MANAGERS = {"npm", "npx", "yarn", "bun", "bunx"}
COMMAND_SEPARATORS = {"&&", "||", ";", "|", "(", ")"}
PNPM_SCOPE_FLAGS = {"--filter", "-F", "-w", "--workspace-root"}
GIT_OPTIONS_WITH_VALUE = {
    "-C",
    "-c",
    "--git-dir",
    "--work-tree",
    "--namespace",
    "--exec-path",
    "--config-env",
}


@dataclass(frozen=True)
class BlockDecision:
    reason: str


def read_payload() -> dict:
    try:
        return json.load(sys.stdin)
    except json.JSONDecodeError:
        return {}


def command_from_payload(payload: dict) -> str:
    tool_input = payload.get("tool_input")
    if not isinstance(tool_input, dict):
        return ""
    command = tool_input.get("command") or tool_input.get("cmd") or ""
    return command if isinstance(command, str) else ""


def tokenize(command: str) -> list[str]:
    lexer = shlex.shlex(command, posix=True, punctuation_chars=True)
    lexer.whitespace_split = True
    try:
        return list(lexer)
    except ValueError:
        try:
            return shlex.split(command, posix=True)
        except ValueError:
            return command.split()


def command_segments(tokens: list[str]) -> list[list[str]]:
    segments: list[list[str]] = []
    current: list[str] = []

    for token in tokens:
        if token in COMMAND_SEPARATORS:
            if current:
                segments.append(current)
                current = []
            continue
        current.append(token)

    if current:
        segments.append(current)

    return segments


def binary_name(token: str) -> str:
    return os.path.basename(token)


def is_assignment(token: str) -> bool:
    return re.match(r"^[A-Za-z_][A-Za-z0-9_]*=", token) is not None


def command_index(segment: list[str]) -> int | None:
    index = 0
    while index < len(segment) and is_assignment(segment[index]):
        index += 1

    if index >= len(segment):
        return None

    if binary_name(segment[index]) == "env":
        index += 1
        while index < len(segment) and (is_assignment(segment[index]) or segment[index].startswith("-")):
            index += 1

    return index if index < len(segment) else None


def effective_command(segment: list[str]) -> tuple[str, list[str]] | None:
    index = command_index(segment)
    if index is None:
        return None

    command = binary_name(segment[index])
    args = segment[index + 1 :]

    if command == "corepack" and args:
        return binary_name(args[0]), args[1:]

    return command, args


def git_command(args: list[str]) -> tuple[str, list[str]] | None:
    index = 0
    while index < len(args):
        token = args[index]
        if token == "--":
            return None
        if not token.startswith("-"):
            return token, args[index + 1 :]
        if token in GIT_OPTIONS_WITH_VALUE:
            index += 2
            continue
        if any(token.startswith(f"{option}=") for option in GIT_OPTIONS_WITH_VALUE):
            index += 1
            continue
        index += 1
    return None


def has_git_clean_force_directory(args: list[str]) -> bool:
    if any(token in {"-n", "--dry-run"} for token in args):
        return False

    option_chars = ""
    long_force = False
    long_directory = False

    for token in args:
        if token.startswith("--"):
            long_force = long_force or token == "--force"
            long_directory = long_directory or token == "--directory"
            continue
        if token.startswith("-"):
            option_chars += token.lstrip("-")

    return ("f" in option_chars or long_force) and ("d" in option_chars or long_directory)


def has_rm_force_recursive(args: list[str]) -> bool:
    option_chars = ""
    long_force = False
    long_recursive = False

    for token in args:
        if token.startswith("--"):
            long_force = long_force or token == "--force"
            long_recursive = long_recursive or token in {"--recursive", "--dir"}
            continue
        if token.startswith("-"):
            option_chars += token.lstrip("-")

    return ("f" in option_chars or long_force) and ("r" in option_chars or "R" in option_chars or long_recursive)


def has_pnpm_workspace_scope(args: list[str]) -> bool:
    for token in args:
        if token in PNPM_SCOPE_FLAGS:
            return True
        if token.startswith("--filter="):
            return True
    return False


def is_force_push_token(token: str) -> bool:
    return token in {"--force", "--force-with-lease", "-f"} or token.startswith("--force-with-lease=")


def check_git(args: list[str]) -> BlockDecision | None:
    parsed = git_command(args)
    if parsed is None:
        return None

    subcommand, sub_args = parsed

    if subcommand == "reset" and "--hard" in sub_args:
        return BlockDecision("Destructive git command blocked: git reset --hard.")

    if subcommand == "checkout" and "--" in sub_args:
        return BlockDecision("Destructive git command blocked: git checkout -- can discard local changes.")

    if subcommand == "clean" and has_git_clean_force_directory(sub_args):
        return BlockDecision("Destructive git command blocked: git clean with force and directory flags.")

    if subcommand == "push" and any(is_force_push_token(token) for token in sub_args):
        return BlockDecision("Destructive git command blocked: force push requires explicit human intent.")

    return None


def check_segment(segment: list[str]) -> BlockDecision | None:
    command_info = effective_command(segment)
    if command_info is None:
        return None

    command, args = command_info

    if command in BLOCKED_PACKAGE_MANAGERS:
        return BlockDecision("Use pnpm in this repository instead of npm, npx, yarn, bun, or bunx.")

    if command == "git":
        return check_git(args)

    if command == "rm" and has_rm_force_recursive(args):
        return BlockDecision("Destructive shell command blocked: rm with recursive and force flags.")

    if command == "pnpm" and "add" in args and not has_pnpm_workspace_scope(args):
        return BlockDecision("Use `pnpm --filter <workspace> add ...` or `pnpm add -w ...` when adding dependencies.")

    return None


def deny(reason: str) -> None:
    print(
        json.dumps(
            {
                "hookSpecificOutput": {
                    "hookEventName": "PreToolUse",
                    "permissionDecision": "deny",
                    "permissionDecisionReason": reason,
                }
            },
            ensure_ascii=False,
        )
    )


def main() -> int:
    command = command_from_payload(read_payload()).strip()
    if not command:
        return 0

    for segment in command_segments(tokenize(command)):
        decision = check_segment(segment)
        if decision is not None:
            deny(decision.reason)
            return 0

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
