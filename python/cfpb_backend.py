"""Formats CFEngine policy read from stdin, writing the result to stdout.

Spawned once per Format click. Same contract as `black --stdin`: text in, text
out, errors on stderr with a non-zero exit.

Calls cfengine_cli in-process because `cfengine format` only rewrites files in
place and reports errors as prose. Import cfengine_cli.format, never
cfengine_cli.main — that one pulls in cf_remote and ~27 MB of libcloud.
"""

from __future__ import annotations

import sys

from cfengine_cli.format import format_policy_fin_fout
from cfengine_cli.lint import PolicySyntaxError

LINE_LENGTH = 80


def main() -> int:
    # Windows would otherwise decode stdio with the ANSI code page.
    for stream in (sys.stdin, sys.stdout):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8")

    try:
        format_policy_fin_fout(sys.stdin, sys.stdout, LINE_LENGTH, False)
    except PolicySyntaxError as error:
        # Expected: the editor holds a live buffer, so invalid policy is normal.
        # Upstream's message names a "<stdin>" file, meaningless in a textarea.
        print(f"Syntax error at line {error.line}, column {error.column}", file=sys.stderr)
        return 1
    except Exception as error:
        # Anything else is a sidecar or packaging fault, not the user's policy.
        # Keep it to one line: the renderer shows stderr verbatim, and a
        # traceback full of site-packages paths helps nobody there.
        print(f"Formatting backend failed: {type(error).__name__}: {error}", file=sys.stderr)
        return 2

    return 0


if __name__ == "__main__":
    sys.exit(main())
