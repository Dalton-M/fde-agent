# SkillForge Frontend Redesign

**Date:** 2026-06-14
**Context:** Demo / pitch — must communicate "real product" in ~3 seconds to investors and stakeholders.
**Register:** Crisp enterprise SaaS — white/light, confident, airy. Not dark-mode infrastructure tooling.
**Palette direction:** Warm + Amber — avoids the tech-blue default, gives SkillForge a memorable brand identity.
**Layout approach:** Restructure (B) — redesign the app shell, give the approval card visual prominence, fix scroll architecture.

---

## Token System

### Colors

| Name | Hex | Usage |
|---|---|---|
| `bg-base` | `#fffdf7` | Root background, header background |
| `bg-surface` | `#ffffff` | Cards, step cards, approval card |
| `bg-panel` | `#fef9ee` | Stats sidebar background |
| `bg-panel-card` | `#ffffff` | Skill selector card inside panel |
| `border-default` | `#e7e5e4` | Default card/section borders |
| `border-accent` | `#fde68a` | Approval card border, dividers in panel |
| `accent` | `#b45309` | Brand mark, progress fill, left border on approval card, primary button |
| `accent-hover` | `#d97706` | Active step pip border, button hover |
| `accent-glow` | `rgba(217,119,6,.15)` | Active step pip glow ring |
| `text-primary` | `#1c1917` | Headings, card titles, metric values |
| `text-secondary` | `#57534e` | Body text, descriptions |
| `text-muted` | `#a8a29e` | Labels, timestamps, sublabels |
| `text-link` | `#b45309` | Completed step labels |
| `success` | `#15803d` | Guardrail checkmarks, positive metric values |
| `success-bg` | `#dcfce7` | Step card done icon background |
| `danger` | `#b91c1c` | Reject button text |
| `danger-border` | `#fca5a5` | Reject button border |
| `text-medium` | `#78716c` | Step card subtitles, status badges — between secondary and muted |
| `bg-track` | `#f0ece4` | Progress bar track, pending step connectors |
| `border-header-sub` | `#f5f0e8` | Subtle separator between brand row and timeline row |
| `text-mono-muted` | `#c8c0b8` | Match ID in header status area |

### Typography

Three font roles loaded from Google Fonts. Add to `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

| Role | Family | Weights | Used for |
|---|---|---|---|
| Display | DM Serif Display | 400 (regular and italic) | Brand name in header, approval card headline ("Awaiting your decision"), metric numbers in stats panel |
| Body / UI | DM Sans | 400, 500, 600, 700 | All labels, descriptions, button text, sublabels, progress labels |
| Mono | JetBrains Mono | 400, 500 | Match IDs, file paths, elapsed times |

DM Serif Display and DM Sans are the same type family, so they pair without friction — the contrast between the display serif and the clean sans carries the design's personality.

### Scale

The UI should render at 125% of baseline sizing. Implement as follows in `index.css`:

```css
#root {
  zoom: 1.25;
}
```

Because `zoom` scales the element's rendered size without shrinking the CSS box model, `h-screen` inside `#root` would produce a layout taller than the viewport. Compensate by using `calc(100vh / 1.25)` instead of `100vh` on the app shell:

```tsx
// In App.tsx, replace h-screen with an inline style or a CSS custom property:
<div style={{ height: 'calc(100vh / 1.25)' }} className="flex flex-col overflow-hidden ...">
```

This keeps the layout exactly filling the visible viewport at the zoomed size.

---

## Layout Architecture

The key structural rule: **only the execution log scrolls**. The root must never scroll.

```
div#root  (zoom: 1.25)
└── div.app-shell  (h-screen, overflow: hidden, flex, flex-direction: column)
    ├── div.app-header  (flex-shrink: 0, position: sticky, top: 0, z-index: 10)
    │   ├── div.brand-row      ← breadcrumb + status
    │   └── div.timeline-row   ← progress bar + step nodes
    └── div.app-body  (flex: 1, overflow: hidden, display: flex)
        ├── div.exec-log   (flex: 1, overflow-y: auto)  ← ONLY this scrolls
        └── div.stats-panel  (width: 200px, flex-shrink: 0)
```

**Never** add `overflow-y: auto` or `overflow-y: scroll` to `.app-shell` or `.app-body`. Doing so would break sticky header behavior at any viewport height.

### CSS architecture

Remove all the Tailwind class overrides from `index.css` (the `.bg-slate-900 { background-color: #f8fafc !important }` pattern). Instead:

1. Add a Tailwind custom theme in `tailwind.config.js` with the amber token set, or
2. Replace slate-class usage in components with direct inline styles / custom CSS classes that use the token values above.

The current approach of overriding dark Tailwind classes with light values via `!important` is fragile. New components added with standard Tailwind classes will silently pick up wrong colors.

---

## Component Specifications

### App Header

Two sub-rows, no vertical padding between them — they read as a unified header block.

**Brand row** (top sub-row, `padding: 14px 28px 10px`, bottom border `#f5f0e8`):

- Brand mark: 28×28px amber (`#b45309`) rounded square (border-radius 7px), letter "S" in Fraunces 13px white — left edge
- Brand name: "SkillForge" in Fraunces 17px weight-600 `#1c1917`, letter-spacing -0.02em
- Separator: "/" in `#d6d3d1`, padding 0 2px
- Skill name: "Daily Cash Reconciliation" in DM Serif Display 16px `#57534e` — matches the brand name's serif register
- Status (right-aligned, `margin-left: auto`):
  - 7×7px dot: green `#22c55e` with `box-shadow: 0 0 0 3px rgba(34,197,94,.2)` when streaming; amber when active; slate when idle
  - Status label: Inter 11px `#a8a29e` ("streaming" / "done" / "connecting")
  - Match ID: JetBrains Mono 10px `#c8c0b8`

**Timeline row** (`padding: 14px 28px 12px`):

- Progress sub-row: "Step N / 7" label (Inter 11px muted) — 4px track (`#f0ece4`) — current step label (Inter 11px muted)
  - Fill: `linear-gradient(to right, #b45309, #d97706)`, width = `(completedCount / total) * 100%`
- Step nodes sub-row: 7 nodes connected by 2px lines
  - Node pip: 24×24px circle
    - Done: amber fill `#b45309`, white checkmark
    - Active: white fill, amber border `#d97706`, glow ring `rgba(217,119,6,.15)`, "▶" in amber
    - Pending: white fill, `#e7e5e4` border, step number in muted
  - Node label: 9px Inter below each pip — done=`#b45309`, active=`#57534e` semibold, pending=muted
  - Connector: `flex: 1`, 2px height, `margin-top: 11px`
    - Done→done: `#b45309`
    - Done→active: `linear-gradient(to right, #b45309, #f0ece4)`
    - Pending: `#f0ece4`

---

### Execution Log Step Cards

White card, 1px `#e7e5e4` border, 8px border-radius, `padding: 10px 14px`, flex row with `gap: 10px`.

- **Icon** (20×20px circle, `flex-shrink: 0`, `margin-top: 1px`):
  - Done: `#dcfce7` fill, green checkmark "✓" at 10px
  - Active: `#fef9ee` fill, `1.5px #d97706` border, amber "▶", pulsing `box-shadow` animation
- **Body** (`flex: 1`):
  - Title: Inter 12px weight-600 `#1c1917`
  - Subtitle: Inter 11px `#78716c`, margin-top 2px
- **Elapsed** (`flex-shrink: 0`): JetBrains Mono 10px `#a8a29e`

---

### Approval Card (Signature Element)

This is the hero moment of the demo — the card where human judgement enters the loop. It should carry visual weight.

```
border: 1px solid #fde68a
border-left: 4px solid #b45309   ← amber left accent
border-radius: 8px
padding: 18px 18px 16px
background: #ffffff
display: flex; flex-direction: column; gap: 12px
```

**Headline:** "Awaiting your decision" — Fraunces 18px weight-600 `#1c1917`, letter-spacing -0.02em.

**Description:** Inter 12px `#57534e`, line-height 1.5. Plain prose: what matched, what will happen.

**Stat grid** (`display: flex; gap: 20px`): each stat is a `flex-column` pair:
- Value: Fraunces 20px weight-700 `#1c1917` (exceptions in amber `#b45309`)
- Label: Inter 10px muted, uppercase, letter-spacing 0.08em ("MATCHED", "EXCEPTIONS", "NET VALUE")

**Guardrail checklist**: each item `flex; gap: 6px; align-items: center`
- Checkmark: `#15803d`, 11px, `flex-shrink: 0`
- Text: Inter 11px `#57534e`

**Actions row** (`display: flex; gap: 8px; align-items: center`):
- "Approve & Run": amber fill (`#b45309`), white text, Inter 12px weight-600, `padding: 8px 18px`, border-radius 6px
- "Edit Preview": transparent, `#78716c` text, `1px #e7e5e4` border, same padding
- "Reject": `margin-left: auto` (right-aligned), transparent, `#b91c1c` text, `1px #fca5a5` border

**Decided state** (after approve/reject): collapse to a single row showing the decision, actor, and timestamp. Dim to `opacity: 0.75`.

---

### Stats Panel

```
width: 200px
background: #fef9ee
border-left: 1px solid #e7e5e4
padding: 16px
display: flex; flex-direction: column; gap: 14px
```

- **Section label**: "SKILLOPS" — Inter 10px weight-600 `#a8a29e`, letter-spacing 0.12em, uppercase
- **Skill selector card**: white fill, `1px #fde68a` border, 7px radius, `10px 12px` padding
  - Skill name: Inter 12px weight-600 `#1c1917`
  - Status badge: Inter 10px `#78716c` (e.g. "● Active · v3")
- **Amber divider**: `border-top: 1px solid #fde68a`
- **Metric cards**: for each metric (Time Elapsed, Run Rate, Reject Rate, Success Rate):
  - Label: Inter 10px muted, uppercase, letter-spacing 0.07em
  - Value: Fraunces 22px weight-700 `#1c1917` (positive rates → `#15803d`)
  - Unit: Inter 13px `#78716c` inline with value

The collapsed state (36px strip) remains — update its background to `#fef9ee` and dot colors to use amber/success tokens.

---

## What to Remove

- All `!important` overrides in `index.css` that remap dark Tailwind classes to light values. These must be replaced with proper light-theme class usage or a custom Tailwind config.
- The `font-family: Helvetica, Arial, sans-serif` global — replaced by Inter via Google Fonts.
- The `pre` block override (`background: #f1f5f9`) — rewrite using proper token values.

---

## Constraints

- Root must be `height: 100vh; overflow: hidden` — preserved from current `h-screen overflow-hidden` Tailwind classes. Do not change this.
- `overflow-y: auto` appears exactly once in the layout: on the execution log div.
- Stats panel may have its own `overflow-y: auto` if content exceeds viewport height, but this is secondary.
- `zoom: 1.25` on `#root` — this is the only place scale is applied.
- No animations beyond: active step pip pulse, progress bar `transition: width 500ms`, and any existing SSE-driven state transitions.
