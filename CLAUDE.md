# CLAUDE.md

Guidance for Claude Code (and other AI tools) when working in this repository.

## Project overview

**Claude Token Dashboard** — a local dashboard for tracking token usage, costs, and session history across both Claude Code (terminal CLI) and Cowork (Claude desktop app's agent mode). Reads JSONL transcripts from `~/.claude/projects/` and audit logs from `~/Library/Application Support/Claude/local-agent-mode-sessions/`, and surfaces per-prompt cost analytics, tool/file heatmaps, project comparisons, cache analytics, and a rule-based tips engine.

Forked from [`nateherkai/token-dashboard`](https://github.com/nateherkai/token-dashboard) (MIT). The fork's value is Cowork visibility, a topbar source toggle (`all` / `code` / `cowork`), a plan-cost flip on subscription plans, and a redesign per [Impeccable](https://github.com/VisionaireLabs/impeccable).

## Status

Working codebase. 71 unit tests (`python3 -m unittest discover tests`). Seven UI tabs (Overview, Prompts, Sessions, Projects, Skills, Tips, Settings). Runs on macOS; Linux and Windows untested but should work.

## Architecture

- `cli.py` → `token_dashboard/scanner.py` (Claude Code) and `token_dashboard/cowork.py` (Cowork) → `~/.claude/token-dashboard.db` (SQLite)
- `token_dashboard/server.py` exposes JSON APIs (`/api/*`) + SSE stream (`/api/stream`) + static frontend (`web/`)
- `web/` is vanilla JS, no build step — hash router + ECharts (vendored)

## Data sources

| Surface | Path | File pattern |
|---|---|---|
| Claude Code | `~/.claude/projects/<project-slug>/` | `<session-id>.jsonl` |
| Cowork | `~/Library/Application Support/Claude/local-agent-mode-sessions/<workspace>/<account>/local_<session>/` | `audit.jsonl` |

Both formats share the same `message.usage.*` schema. Cowork uses snake_case top-level fields and adds `_audit_timestamp` / `_audit_hmac`. The Cowork scanner normalizes records to the upstream's camelCase shape and feeds them through the shared `parse_record`. Source is tagged on every row (`messages.source`, `tool_calls.source`).

## Schema

`messages` table holds one row per parsed JSONL record. `tool_calls` holds individual tool invocations and their result sizes. `files` tracks scan high-water marks (mtime + byte offset) for incremental rescans. `plan` stores the user's selected pricing plan. `dismissed_tips` tracks which tips the user has hidden.

## Source filter

Every query function in `db.py` accepts an optional `source` arg (`None` / `"all"` / `"claude_code"` / `"cowork"`) and applies `AND source = ?` via `_source_clause`. The HTTP handlers parse `?source=` from the query string. The frontend `api()` helper auto-appends `?source=` to GET requests when `state.source` is set, persisted in localStorage.

## Streaming-snapshot dedup

Claude Code (and Cowork) write each assistant response 2–3 times as it streams — the same `message.id` appears on multiple records with different top-level `uuid` values. `_evict_prior_snapshots` deletes earlier snapshots so only the final tally per `(session_id, message.id)` survives. This applies to both sources.

## Design system

This project uses [Impeccable](https://github.com/VisionaireLabs/impeccable) — a fork of Anthropic's frontend-design skill. Visual identity is documented in `PRODUCT.md` (register, users, anti-references) and `DESIGN.md` (color tokens, type, layout, charts).

Before changing visual code, load and apply those docs. Skip-to-CSS-and-pray will produce drift. Notable rules:

- Restrained color: tinted-neutral OKLCH palette, no chromatic accent.
- No `#000` / `#fff` for neutrals — every neutral is tinted (chroma 0.005–0.008, hue 80°).
- No card grid for KPIs (Impeccable absolute ban: "hero-metric template").
- Charts use a grayscale ramp; series are differentiated by position/weight, not hue.
- Cost figures get weight, not color.
- No gradients, no glassmorphism, no nested cards.

## Conventions

- Stdlib only on the Python side. No `pip install`.
- Vanilla JS on the frontend. No build step. ECharts is vendored.
- Keep `pricing.json` as the single source of truth for model rates.
- All new query functions take a `source` arg and apply `_source_clause`.
- Test fixtures are synthetic (`sess-1`, `msg-1`, mock usage). Never commit real session data.
