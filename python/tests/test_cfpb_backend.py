"""Tests for the formatter's stdin/stdout contract."""

from __future__ import annotations

import io

import pytest

from cfpb_backend import main

UNFORMATTED = 'bundle agent main\n{\n  reports:\n  "hello"    ;\n}\n'
FORMATTED = 'bundle agent main\n{\n  reports:\n    "hello";\n}\n'


def _run(policy: str, monkeypatch: pytest.MonkeyPatch) -> tuple[int, str, str]:
    """Run the formatter over `policy`, returning (exit code, stdout, stderr)."""
    stdout, stderr = io.StringIO(), io.StringIO()
    monkeypatch.setattr("sys.stdin", io.StringIO(policy))
    monkeypatch.setattr("sys.stdout", stdout)
    monkeypatch.setattr("sys.stderr", stderr)

    return main(), stdout.getvalue(), stderr.getvalue()


def test_formats_policy(monkeypatch: pytest.MonkeyPatch):
    code, stdout, stderr = _run(UNFORMATTED, monkeypatch)

    assert code == 0
    assert stdout == FORMATTED
    assert stderr == ""


def test_leaves_formatted_policy_alone(monkeypatch: pytest.MonkeyPatch):
    code, stdout, _ = _run(FORMATTED, monkeypatch)

    assert code == 0
    assert stdout == FORMATTED


def test_reports_a_syntax_error_on_stderr(monkeypatch: pytest.MonkeyPatch):
    code, stdout, stderr = _run("bundle agent {{{ broken\n", monkeypatch)

    assert code == 1
    # Nothing on stdout, so a failure can never be mistaken for formatted policy.
    assert stdout == ""
    assert "Syntax error at line 1, column 1" in stderr


def test_accepts_empty_input(monkeypatch: pytest.MonkeyPatch):
    code, _, stderr = _run("", monkeypatch)

    assert code == 0
    assert stderr == ""


def test_unexpected_errors_become_one_line_on_stderr(monkeypatch: pytest.MonkeyPatch):
    """A sidecar fault must not leak a traceback: stderr is shown verbatim in the UI."""

    def explode(*_args):
        raise RuntimeError("tree-sitter went sideways")

    monkeypatch.setattr("cfpb_backend.format_policy_fin_fout", explode)
    code, stdout, stderr = _run(FORMATTED, monkeypatch)

    assert code == 2
    assert stdout == ""
    assert stderr == "Formatting backend failed: RuntimeError: tree-sitter went sideways\n"
