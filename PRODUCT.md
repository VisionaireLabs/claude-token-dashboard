# Token Dashboard — Visionaire Labs

## Product purpose

A local dashboard that turns Claude Code and Cowork session JSONLs into a quiet, daytime check-in: per-prompt cost, where the tokens go, and whether your subscription pays for itself. Forked from Nate Herkai's [token-dashboard](https://github.com/nateherkai/token-dashboard) and extended with Cowork visibility.

## Users

A founder or engineer who runs Claude on personal or team plans and wants honest numbers without leaving their machine. Probably already heavy on Claude Code or Cowork. Glances at this midday between sessions, not at 2am during incidents.

Not for: enterprise observability teams, SRE alerting, anyone who needs Slack notifications or PagerDuty.

## Register

product

## Brand

Visionaire Labs is an AI research lab. The voice is direct, technical, minimal hand-holding. Numbers earn the page. Nothing is decorative.

## Anti-references

- Datadog. Vercel Analytics. New Relic.
- Linear's card-of-cards aesthetic.
- Any "observability dashboard" that's dark blue with neon accents.
- Hero-metric templates: big number, small label, gradient sparkline.

## Strategic principles

1. **Light beats dark.** Daytime tool. Refusing the observability-cliche reflex is the design choice that signals craft.
2. **Restrained color.** Tinted neutrals only. No accent. Emphasis through typographic weight and tabular density.
3. **Numbers carry the page.** JetBrains Mono with `tabular-nums`. Charts use grayscale ramps. No color tells the story.
4. **Hairlines, not cards.** The upstream KPI-card grid is the hero-metric template Impeccable bans. Replace with a tabular strip and lots of negative space.
5. **Cowork is a peer source, not a footnote.** Source toggle in the topbar (Code / Cowork / Both). Both sources share the same schema and DB.

## Surface

Single-page web app at `127.0.0.1:8080`. Hash router, seven routes: overview, prompts, sessions, projects, skills, tips, settings. Self-contained — no CDN, no build step, vendored ECharts.
