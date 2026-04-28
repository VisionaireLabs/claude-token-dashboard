# Design — Token Dashboard, Visionaire Labs

## Color strategy

Restrained. Tinted neutrals only. No chromatic accent.

All neutrals share hue 80° (soft warm). Chroma capped at 0.008 — perceptually monochrome, but never #000 or #fff. The warm cast removes the sterile white-page feel without becoming "warm theme."

| Token | OKLCH | Use |
|---|---|---|
| `--bg` | `oklch(99% 0.003 80)` | Page background |
| `--surface` | `oklch(97% 0.004 80)` | Subtle panel fill |
| `--border` | `oklch(92% 0.005 80)` | Hairlines, table rules |
| `--border-strong` | `oklch(86% 0.006 80)` | Active tab, focus |
| `--text` | `oklch(18% 0.008 80)` | Primary text, numbers |
| `--text-muted` | `oklch(45% 0.006 80)` | Labels, axes |
| `--text-faint` | `oklch(65% 0.005 80)` | Tertiary, separators |

**Charts**: grayscale ramp from `--text` (darkest) through `--text-muted` to `--text-faint`. Series differentiated by weight or position, never hue.

**Model badges**: weight + spacing, no fill. `OPUS` heavier and tighter than `SONNET`.

**Status**: errors and warnings get an underline or a leading glyph, not a colored fill. The dashboard is descriptive, not alerting.

## Typography

- **Body / UI**: Inter, 13px, 1.55 line-height. `font-feature-settings: 'cv11', 'ss01'`.
- **Numbers**: JetBrains Mono with `font-variant-numeric: tabular-nums`. Cost figures use `font-feature-settings: 'tnum', 'lnum'`.
- **Labels**: 10px, all-caps, `letter-spacing: 0.08em`, `--text-muted`.
- **Hierarchy**: 10 / 13 / 16 / 22 / 30. 1.25× ratio, no flat scales.
- **Weight contrast**: 400 body, 500 numbers, 600 headings. Hierarchy through weight before size.

## Layout

- **No KPI cards.** The overview top row is a horizontal tabular strip: 6 columns, hairline dividers between, no card chrome. Each cell is a label (small-caps) above a value (mono, 22px). The whole strip sits on the page background, not a panel.
- **Charts breathe.** No box around the plot area. Axis labels in `--text-faint`. Gridlines hairline `--border`. Title sits flush-left above with a margin, not centered in a card header.
- **Tables.** No vertical rules. Horizontal rules in `--border`, hover row in `--surface`. More vertical padding than upstream (12px instead of 9px).
- **Spacing**: 4 / 8 / 12 / 20 / 32 / 56. Cards (where retained) use 20px padding minimum.
- **Max content width**: 1280px, centered with 32px gutters.

## Topbar

Wordmark left: `Token Dashboard` in 14px 600, followed by `Visionaire Labs` in 11px 400 `--text-faint` on the same baseline, separated by a 12px gap and a 1px hairline divider. No glyph, no logo mark.

Right side: source toggle (Code / Cowork / Both), plan pill, blur hint. All as text pills with `--surface` fill and `--border` outline. Active state is `--border-strong` outline + `--text` color.

## Motion

- Hover transitions: 120ms ease-out-quart on color, background, border.
- Tab switches: instant (no fade). Hash-router defaults.
- Live SSE refresh: no animation on data update — values just change. Animating numeric changes is performative.

## Bans (project-specific extensions of Impeccable's universal bans)

- No gradient anything.
- No glassmorphism / backdrop blur on panels.
- No icon-as-decoration. Icons earn their place by replacing words.
- No nested cards. The overview never has a card containing cards.
- No colored "danger" / "success" backgrounds. Status through weight or a leading character.

## Charts (ECharts config defaults)

```js
{
  backgroundColor: 'transparent',
  textStyle: { fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 11 },
  color: ['#2D2A24', '#5C564B', '#8B847A', '#B5AEA3'], // grayscale ramp from --text
  xAxis: { axisLine: { lineStyle: { color: 'oklch(86% 0.006 80)' } }, splitLine: false },
  yAxis: { axisLine: false, splitLine: { lineStyle: { color: 'oklch(92% 0.005 80)' } } },
  grid:  { left: 8, right: 8, top: 24, bottom: 24, containLabel: true },
  tooltip: { backgroundColor: 'oklch(97% 0.004 80)', borderColor: 'oklch(86% 0.006 80)', textStyle: { color: 'oklch(18% 0.008 80)' } }
}
```

## Source attribution

Every record carries a `source` field (`claude_code` | `cowork`). The topbar source toggle filters the entire app via a query param. Project lists prefix Cowork projects with `cowork:` so they're identifiable in the projects view.
