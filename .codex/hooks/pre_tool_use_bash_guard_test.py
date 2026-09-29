#!/usr/bin/env python3
"""Tests for pre_tool_use_bash_guard."""

from __future__ import annotations

import unittest
from unittest.mock import patch

import pre_tool_use_bash_guard as guard


class BashGuardGitPushTest(unittest.TestCase):
    def test_blocks_force_push(self) -> None:
        decision = guard.check_git(["push", "--force", "origin", "feat/HASHI-1"])

        self.assertIsNotNone(decision)
        self.assertIn("--force-with-lease", decision.reason)

    def test_blocks_short_force_push(self) -> None:
        decision = guard.check_git(["push", "-f", "origin", "feat/HASHI-1"])

        self.assertIsNotNone(decision)
        self.assertIn("--force-with-lease", decision.reason)

    def test_allows_force_with_lease_for_work_branch(self) -> None:
        decision = guard.check_git(
            ["push", "--force-with-lease", "origin", "refactor/HASHI-1-demo"]
        )

        self.assertIsNone(decision)

    def test_blocks_force_with_lease_for_protected_branch(self) -> None:
        decision = guard.check_git(["push", "--force-with-lease", "origin", "develop"])

        self.assertIsNotNone(decision)
        self.assertIn("protected branch", decision.reason)

    def test_blocks_force_with_lease_option_for_protected_branch(self) -> None:
        with patch.object(guard, "current_branch", return_value="refactor/HASHI-1-demo"):
            decision = guard.check_git(["push", "--force-with-lease=develop"])

        self.assertIsNotNone(decision)
        self.assertIn("protected branch", decision.reason)

    def test_allows_force_with_lease_without_refspec_on_work_branch(self) -> None:
        with patch.object(guard, "current_branch", return_value="docs/HASHI-1-demo"):
            decision = guard.check_git(["push", "--force-with-lease"])

        self.assertIsNone(decision)

    def test_blocks_force_with_lease_without_refspec_on_protected_branch(self) -> None:
        with patch.object(guard, "current_branch", return_value="develop"):
            decision = guard.check_git(["push", "--force-with-lease"])

        self.assertIsNotNone(decision)
        self.assertIn("protected branch", decision.reason)


if __name__ == "__main__":
    unittest.main()
