# cfpb-backend

Python sidecar hosting the CFEngine toolchain. Electron spawns it once per
action: policy in on stdin, formatted policy out on stdout, errors on stderr
with a non-zero exit.

Managed with [uv](https://docs.astral.sh/uv/), which also fetches the
interpreter pinned in `.python-version`.

```sh
uv sync                                                    # .venv + deps
uv run pytest
uv run black .                                             # no linter here
uv run pyinstaller --clean --noconfirm cfpb-backend.spec   # → dist/cfpb-backend/
```

Also available from the repo root as `npm run backend:*`, which is what CI and
the packaging scripts use.

**Import `cfengine_cli.format`, never `cfengine_cli.main`** — the latter pulls in
`cf_remote` and ~27 MB of libcloud drivers. `cfpb-backend.spec` excludes them.
