# Known Limitations

None of these block the dashboard from being useful — they're rough edges you'll notice if you look hard.

## Cowork audit-log schema is undocumented

Anthropic doesn't publish the schema for `~/Library/Application Support/Claude/local-agent-mode-sessions/<workspace>/<account>/local_<session>/audit.jsonl`. The scanner reverse-engineers what's there: snake_case top-level fields (`session_id`, `parent_uuid`), `message.usage.{input_tokens, output_tokens, cache_read_input_tokens, cache_creation_input_tokens}`, plus `_audit_timestamp` and `_audit_hmac` extras. Assistant rows often lack a top-level `timestamp`, so the scanner backfills from `_audit_timestamp`.

If Anthropic changes any of those, ingestion breaks. The scanner is small (`token_dashboard/cowork.py`, ~190 lines) and updates are localized.

## No per-Cowork-workspace drilldown

Cowork sessions are slugged as `cowork:<workspace-uuid>` and rendered as `Cowork · <short-uuid>` in the UI. All sessions inside one Cowork workspace aggregate under that one project label — you can't yet split by individual session topic. The Cowork audit logs do contain `ai-title` records that could power this; not wired up yet.

## Skills token counts are partial

The Skills route shows every skill Claude Code invoked, how many times, across how many sessions, and when. The **tokens-per-call** column is populated only for skills whose `SKILL.md` lives under `~/.claude/skills/`, `~/.claude/scheduled-tasks/`, or `~/.claude/plugins/`. Skills registered elsewhere (project-local `.claude/skills/`, or invocations that go through the `Task` tool with a skill-shaped `subagent_type`) show invocation counts but leave the token column blank. Cowork skills are not currently in the catalog scan at all.

## Pricing math is API-equivalent under the hood

Subscription plans (Pro / Max / Max-20x) flip the cost-card lead so the flat monthly fee is primary and API-equivalent + value multiple is the subline. The math underneath is still pay-per-token rates from `pricing.json`. Anthropic doesn't publish per-plan rate limits as machine-readable JSON, so we don't model "you've hit the cap" effects.

## Non-standard model names get tier-fallback pricing

If a transcript references a model ID not in `pricing.json` (e.g. a future snapshot that isn't in the table yet, or a local model like `qwen3-coder:30b`), cost is estimated from the tier substring (`opus` / `sonnet` / `haiku`) in the name. The UI marks these as `estimated: true`. If the model name contains none of those substrings, cost is reported as null.

## First Cowork scan is slow

The Cowork session tree is large — typically 1–3 GB of audit logs and snapshots, with 500+ `audit.jsonl` files on heavy users. First scan takes 60–120 seconds. Subsequent scans are incremental (mtime + byte-offset tracking in the `files` table).

## Running two dashboards against the same DB

Both will fight over the SQLite file and you'll see inconsistent numbers and occasional `database is locked` errors. Only run one at a time. If you want to view the dashboard from a second device, use `HOST=0.0.0.0` on the one running machine and point the second device's browser at it. Don't do this on networks you don't fully control.

## Source filter doesn't apply to Settings

The topbar source toggle (`all` / `code` / `cowork`) filters every page that queries source-specific data. Settings is just plan picker + pricing table — no source dimension applies, so all three states render identically. By design.
