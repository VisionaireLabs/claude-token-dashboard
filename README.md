# Token Dashboard — Visionaire Labs

Local Claude usage dashboard. Reads the JSONL transcripts Claude Code writes to `~/.claude/projects/` and the Cowork session logs Claude desktop writes to `~/Library/Application Support/Claude/local-agent-mode-sessions/`, and turns both into per-prompt cost analytics, tool/file heatmaps, project comparisons, and cache analytics.

**Everything runs locally.** No data leaves your machine. No telemetry. No login.

Forked from [`nateherkai/token-dashboard`](https://github.com/nateherkai/token-dashboard) and extended with Cowork visibility and a quieter, light-theme redesign per the [Impeccable](https://github.com/VisionaireLabs/impeccable) design system.

## What's different

| | Upstream | Visionaire fork |
|---|---|---|
| Sources | Claude Code only | Claude Code + Cowork |
| DB | `messages`, `tool_calls` | Same, plus a `source` column |
| Theme | Dark observability template | Light, tinted-neutral OKLCH palette |
| Color strategy | Multi-hue accent palette | Restrained, no chromatic accent |
| Topbar | Brand + tabs | Brand + tabs + source toggle |
| KPI display | Card grid | Hairline strip (`hero-metric-template` is an Impeccable absolute ban) |

## Prerequisites

- Python 3.8 or newer (already on macOS).
- Claude Code, or Claude desktop with Cowork mode used at least once.
- A modern browser.

No `pip install`. No Node. No build step.

## Quickstart

```bash
git clone https://github.com/VisionaireLabs/claude-token-dashboard.git
cd claude-token-dashboard
python3 cli.py dashboard
```

Scans both `~/.claude/projects/` and `~/Library/Application Support/Claude/local-agent-mode-sessions/`, starts a local server at http://127.0.0.1:8080, and opens your browser. Stops with `Ctrl+C`.

The Cowork tree is large (typically 1–3 GB of audit logs and snapshots). The first scan walks 500+ JSONLs and may take 60–120 seconds on a heavy user's machine. Subsequent scans are incremental.

## CLI

```bash
python3 cli.py scan                  # rescan both sources
python3 cli.py scan --code-only      # only ~/.claude/projects/
python3 cli.py scan --cowork-only    # only Cowork
python3 cli.py today                 # today's totals
python3 cli.py stats                 # all-time totals
python3 cli.py tips                  # active suggestions
python3 cli.py dashboard             # scan + serve at :8080
```

### Environment variables

| Var | Default | Purpose |
|---|---|---|
| `CLAUDE_PROJECTS_DIR` | `~/.claude/projects` | Claude Code JSONL root |
| `CLAUDE_COWORK_DIR` | `~/Library/Application Support/Claude/local-agent-mode-sessions` | Cowork session root |
| `TOKEN_DASHBOARD_DB` | `~/.claude/token-dashboard.db` | SQLite cache |
| `PORT` | `8080` | Server port |
| `HOST` | `127.0.0.1` | Bind address. Don't set `0.0.0.0` on networks you don't fully control. |

## Source toggle

The topbar has a three-way source filter (`all` / `code` / `cowork`). The selection is persisted in localStorage and applied across every tab. Cowork projects are prefixed `cowork:<workspace-id>` so they sort separately in Projects.

## Design system

This project uses Visionaire Labs' [Impeccable](https://github.com/VisionaireLabs/impeccable) skill. The visual identity is documented in:

- `PRODUCT.md` — register, users, brand, anti-references, strategic principles
- `DESIGN.md` — color tokens, typography, layout rules, chart conventions, project-specific bans

Edit those files (and run `/impeccable document` to regenerate from code if the system drifts) before changing the visual layer.

## Privacy

Nothing leaves your machine. The dashboard fetches its JSON from `127.0.0.1`; CSS and ECharts are vendored. `Cmd/Ctrl+B` blurs prompt text and other sensitive content for screenshots.

## Tech stack

Python 3 (stdlib only) for the CLI, scanners, and HTTP server. SQLite for the local cache. Vanilla JS + ECharts for the UI, no build step.

Data flow: `cli.py` → `scanner.py` (Claude Code) and `cowork.py` (Cowork) → SQLite DB; `server.py` exposes `/api/*` JSON routes and serves `web/`.

## Limitations

- Skill token-per-call is partial when skills live outside `~/.claude/skills/`. Inherited from upstream.
- Cost on Pro/Max/Max-20x is shown as API-equivalent (what the same usage would cost pay-per-token).
- Non-standard model names get tier-fallback pricing.

## Contributing

`python3 -m unittest discover tests` before opening a PR. Keep it stdlib-only.

## License

MIT, inherited from upstream. See `LICENSE` and `NOTICE.md` for attribution.
