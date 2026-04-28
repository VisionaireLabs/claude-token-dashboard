# Notice

This project is a fork of [token-dashboard](https://github.com/nateherkai/token-dashboard) by Nate Herkai, used and extended under the terms of the MIT License (see `LICENSE`).

## Visionaire Labs additions

- **Cowork session scanner** (`token_dashboard/cowork.py`): Walks Claude desktop's local Cowork session storage at `~/Library/Application Support/Claude/local-agent-mode-sessions/` and ingests the same JSONL records the upstream scanner reads from `~/.claude/projects/`.
- **DB schema**: Added a `source` column to `messages` and `tool_calls` (`claude_code` / `cowork`), with a one-time migration that backfills existing rows to `claude_code`.
- **CLI flags**: `--cowork-dir`, `--cowork-only`, `--code-only`, plus the `CLAUDE_COWORK_DIR` env var.
- **Topbar source toggle**: Filter the entire dashboard by source (all / code / cowork). Persisted in localStorage.
- **Visual redesign** per the Impeccable design system (see `PRODUCT.md` and `DESIGN.md`): light theme, OKLCH tinted-neutral palette, no chromatic accent, KPI strip in place of the upstream KPI-card grid, grayscale chart palette.

## Design system

Built using [Impeccable](https://github.com/VisionaireLabs/impeccable), Visionaire Labs' fork of Anthropic's frontend-design skill. PRODUCT.md and DESIGN.md at the project root drive design decisions and are loaded by the `/impeccable` commands.

## Upstream

- Source: https://github.com/nateherkai/token-dashboard
- License: MIT (preserved here as `LICENSE`)
