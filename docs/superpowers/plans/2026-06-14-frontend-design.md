# SkillForge Frontend Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the SkillForge frontend with a warm amber palette, DM Serif Display + DM Sans type system, and a layout restructure that makes the approval card the visual hero of the demo.

**Architecture:** All changes are styling-only — no logic, types, or API surface changes. Each component is rewritten to use direct inline styles with token hex values, removing the current `!important` Tailwind class overrides in `index.css`. The layout is restructured so the brand row sits above the flow timeline, both sticky at the top, and only the execution log scrolls.

**Tech Stack:** React 18, TypeScript, Tailwind CSS (layout utilities only after this PR), Vite, Google Fonts (DM Serif Display, DM Sans, JetBrains Mono)

**Spec:** `docs/superpowers/specs/2026-06-14-frontend-design.md`

---

## File Map

| File | Action | What changes |
|---|---|---|
| `index.html` | Modify | Add Google Fonts `<link>` tags |
| `src/index.css` | Modify | Remove all `!important` overrides; add `zoom: 1.25` on `#root`; add `skillforge-pulse` keyframe |
| `src/App.tsx` | Modify | Reorder header (brand row above timeline); new brand row markup; swap `h-screen` for `calc(100vh/1.25)` inline style; remove old breadcrumb div |
| `src/components/FlowTimeline/FlowTimeline.tsx` | Modify | Amber progress bar gradient; updated connector colors; remove old border/bg Tailwind classes |
| `src/components/FlowTimeline/StepNode.tsx` | Modify | Amber done/active/pending pip styles; remove `animate-ping`; update label colors |
| `src/components/ExecutionLog/StepCard.tsx` | Modify | New card layout with icon circle, JetBrains Mono elapsed; remove old dark-theme classes |
| `src/components/ExecutionLog/ApprovalCard.tsx` | Modify | Hero redesign: amber left border, DM Serif Display headline, stat grid, guardrail checklist |
| `src/components/ExecutionLog/ValidationCard.tsx` | Modify | Warm theme: white card, amber-tinted pass/fail badge |
| `src/components/StatsPanel/StatsPanel.tsx` | Modify | Warm cream panel (`#fef9ee`), amber divider, updated collapse strip |
| `src/components/StatsPanel/MetricCard.tsx` | Modify | DM Serif Display numbers, no card wrapper (flat metric rows) |
| `src/components/StatsPanel/SkillSelector.tsx` | Modify | Styled `<select>` with amber border |

---

## Task 1: Fonts and CSS foundation

**Files:**
- Modify: `index.html`
- Modify: `src/index.css`

- [ ] **Step 1: Add Google Fonts to `index.html`**

Replace the contents of `index.html` with:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SkillForge</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Rewrite `src/index.css`**

Replace the entire file:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

*, *::before, *::after {
  box-sizing: border-box;
}

#root {
  zoom: 1.25;
}

body {
  font-family: 'DM Sans', sans-serif;
  background: #fffdf7;
  color: #1c1917;
  -webkit-font-smoothing: antialiased;
}

button {
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
}

pre {
  background: #f0ece4;
  color: #1c1917;
  border: 1px solid #e7e5e4;
  border-radius: 4px;
  padding: 8px;
  font-size: 11px;
  overflow-x: auto;
  font-family: 'JetBrains Mono', monospace;
}

@keyframes skillforge-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.3); }
  50%       { box-shadow: 0 0 0 4px rgba(217, 119, 6, 0.1); }
}
```

- [ ] **Step 3: Start dev server and verify fonts load**

```bash
npm run dev
```

Open http://localhost:5173. Open DevTools → Network → filter "fonts.gstatic.com". You should see DM Sans, DM Serif Display, and JetBrains Mono requests. The page body text should be DM Sans (check in DevTools → Elements → Computed → font-family).

- [ ] **Step 4: Verify TypeScript and lint**

```bash
npm run build && npm run lint
```

Expected: build succeeds, no lint errors.

- [ ] **Step 5: Commit**

```bash
git add index.html src/index.css
git commit -m "feat: add DM font stack and reset CSS foundation"
```

---

## Task 2: App shell and brand row

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Rewrite the App shell and header**

Replace the `return` block in `src/App.tsx`. Keep all state/hooks/logic above the `return` unchanged — only the JSX changes:

```tsx
return (
  <div
    className="flex flex-col overflow-hidden"
    style={{ height: 'calc(100vh / 1.25)', background: '#fffdf7', color: '#1c1917' }}
  >
    {/* Sticky header: brand row + FlowTimeline */}
    <div className="shrink-0" style={{ position: 'sticky', top: 0, zIndex: 10, background: '#fffdf7', borderBottom: '1px solid #e7e5e4' }}>

      {/* Brand row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 28px 10px', borderBottom: '1px solid #f5f0e8' }}>
        {/* Brand mark */}
        <div style={{ width: 28, height: 28, background: '#b45309', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fffdf7', fontSize: 14, fontFamily: "'DM Serif Display', serif", flexShrink: 0 }}>
          S
        </div>
        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: '#1c1917', letterSpacing: '-0.01em' }}>
          SkillForge
        </span>
        <span style={{ color: '#d6d3d1', fontSize: 16, padding: '0 3px' }}>/</span>
        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: '#57534e', letterSpacing: '-0.01em' }}>
          Daily Cash Reconciliation
        </span>
        {/* Status */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: status === 'streaming' ? '#22c55e' : status === 'done' ? '#b45309' : '#a8a29e',
            boxShadow: status === 'streaming' ? '0 0 0 3px rgba(34,197,94,.2)' : undefined,
          }} />
          <span style={{ fontSize: 11, color: '#a8a29e' }}>{status}</span>
          {matchId && (
            <span style={{ marginLeft: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#c8c0b8' }}>
              {matchId}
            </span>
          )}
        </div>
      </div>

      {/* Flow timeline */}
      <FlowTimeline
        steps={SKILL_STEPS}
        activeStepIndex={activeStepIndex}
        completedCount={completedCount}
        currentStepLabel={currentStepLabel}
        elapsedPerStep={elapsedPerStep}
      />
    </div>

    {/* Main row: execution log + stats panel */}
    <div className="flex flex-1 overflow-hidden">
      <div className="flex-1 overflow-y-auto" style={{ padding: '20px 24px' }}>
        {!matchId ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 128, color: '#a8a29e', fontSize: 14 }}>
            Loading skill match…
          </div>
        ) : (
          <ExecutionLog
            events={allEvents}
            matchId={matchId}
            onApprove={handleApprove}
            onReject={handleReject}
            decision={decision}
            status={status}
          />
        )}
      </div>

      <StatsPanel
        selectedSkillId={selectedSkillId}
        onSkillChange={setSelectedSkillId}
        executionStartedAt={executionStartedAt}
      />
    </div>
  </div>
)
```

- [ ] **Step 2: Verify in browser**

With `npm run dev` running, open http://localhost:5173. Check:
- Page background is warm cream (`#fffdf7`), not white or dark
- Header shows: amber square "S" → "SkillForge" (serif) → "/" → "Daily Cash Reconciliation" (serif, muted)
- Status dot is visible top-right of header
- Match ID appears in monospace when available
- Layout fills the viewport without a scrollbar on the outer page

- [ ] **Step 3: Verify TypeScript and lint**

```bash
npm run build && npm run lint
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: redesign app shell with brand row above timeline"
```

---

## Task 3: FlowTimeline and StepNode

**Files:**
- Modify: `src/components/FlowTimeline/FlowTimeline.tsx`
- Modify: `src/components/FlowTimeline/StepNode.tsx`

- [ ] **Step 1: Rewrite `FlowTimeline.tsx`**

```tsx
import type { SkillStep } from '../../types/skill'
import StepNode from './StepNode'

interface FlowTimelineProps {
  steps: SkillStep[]
  activeStepIndex: number
  completedCount: number
  currentStepLabel?: string
  elapsedPerStep?: Record<string, number>
}

function getConnectorStyle(
  leftIndex: number,
  completedCount: number,
  activeStepIndex: number,
): React.CSSProperties {
  const leftDone = leftIndex < completedCount
  const rightIndex = leftIndex + 1
  const rightActive = rightIndex === activeStepIndex
  const rightDone = rightIndex < completedCount

  if (leftDone && (rightActive || (!rightDone && rightIndex > completedCount))) {
    return {
      background: 'linear-gradient(to right, #b45309, #f0ece4)',
      height: 2, flex: 1, alignSelf: 'flex-start', marginTop: 11, flexShrink: 0,
    }
  }
  if (leftDone && rightDone) {
    return { background: '#b45309', height: 2, flex: 1, alignSelf: 'flex-start', marginTop: 11, flexShrink: 0 }
  }
  return { background: '#f0ece4', height: 2, flex: 1, alignSelf: 'flex-start', marginTop: 11, flexShrink: 0 }
}

function getStatus(
  index: number,
  completedCount: number,
  activeStepIndex: number,
): 'done' | 'active' | 'pending' {
  if (index < completedCount) return 'done'
  if (index === activeStepIndex) return 'active'
  return 'pending'
}

export default function FlowTimeline({
  steps,
  activeStepIndex,
  completedCount,
  currentStepLabel,
  elapsedPerStep = {},
}: FlowTimelineProps) {
  const progressPct = steps.length > 0 ? (completedCount / steps.length) * 100 : 0

  return (
    <div style={{ background: '#fffdf7', padding: '14px 28px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Progress bar row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 11, color: '#a8a29e', whiteSpace: 'nowrap', flexShrink: 0 }}>
          Step {completedCount} / {steps.length}
        </span>
        <div style={{ flex: 1, height: 4, background: '#f0ece4', borderRadius: 2, overflow: 'hidden' }}>
          <div
            style={{
              width: `${progressPct}%`,
              height: '100%',
              background: 'linear-gradient(to right, #b45309, #d97706)',
              borderRadius: 2,
              transition: 'width 500ms ease',
            }}
          />
        </div>
        {currentStepLabel && (
          <span style={{ fontSize: 11, color: '#a8a29e', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {currentStepLabel}
          </span>
        )}
      </div>

      {/* Step nodes row */}
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {steps.map((step, i) => (
          <div key={step.id} style={{ display: 'flex', alignItems: 'flex-start', flex: i < steps.length - 1 ? 1 : undefined }}>
            <StepNode
              step={step}
              status={getStatus(i, completedCount, activeStepIndex)}
              elapsed={elapsedPerStep[step.id]}
            />
            {i < steps.length - 1 && (
              <div style={getConnectorStyle(i, completedCount, activeStepIndex)} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Rewrite `StepNode.tsx`**

```tsx
import type { SkillStep } from '../../types/skill'

interface StepNodeProps {
  step: SkillStep
  status: 'done' | 'active' | 'pending'
  elapsed?: number
}

function formatElapsed(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export default function StepNode({ step, status, elapsed }: StepNodeProps) {
  const isDone = status === 'done'
  const isActive = status === 'active'
  const isPending = status === 'pending'

  const pipStyle: React.CSSProperties = {
    width: 24, height: 24, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 9, fontWeight: 700,
    ...(isDone && { background: '#b45309', border: '2px solid #b45309', color: '#fff' }),
    ...(isActive && { background: '#fff', border: '2px solid #d97706', boxShadow: '0 0 0 3px rgba(217,119,6,.15)', color: '#d97706' }),
    ...(isPending && { background: '#fff', border: '2px solid #e7e5e4', color: '#a8a29e' }),
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
      <div style={pipStyle}>
        {isDone && <span>✓</span>}
        {isActive && <span>▶</span>}
        {isPending && <span>{/* empty */}</span>}
      </div>

      <span style={{
        fontSize: 9, whiteSpace: 'nowrap',
        fontWeight: isActive ? 600 : 500,
        color: isDone ? '#b45309' : isActive ? '#57534e' : '#a8a29e',
      }}>
        {step.label}
      </span>

      {isDone && elapsed !== undefined && (
        <span style={{ fontSize: 9, color: '#a8a29e', fontFamily: "'JetBrains Mono', monospace" }}>
          {formatElapsed(elapsed)}
        </span>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verify in browser**

With `npm run dev` running, check:
- Timeline shows amber-filled circles for done steps, amber-bordered for active, gray for pending
- Connectors between done steps are solid amber `#b45309`
- Connector between last done and active step is amber-to-cream gradient
- Progress bar fills with amber gradient from left
- Step labels are amber (done), dark (active), muted gray (pending)

- [ ] **Step 4: Verify TypeScript and lint**

```bash
npm run build && npm run lint
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/FlowTimeline/FlowTimeline.tsx src/components/FlowTimeline/StepNode.tsx
git commit -m "feat: redesign FlowTimeline with amber palette"
```

---

## Task 4: StepCard

**Files:**
- Modify: `src/components/ExecutionLog/StepCard.tsx`

- [ ] **Step 1: Rewrite `StepCard.tsx`**

```tsx
import { useState } from 'react'
import type { StepStartedEvent, StepCompletedEvent } from '../../types/skill'

interface StepCardProps {
  event: StepStartedEvent | StepCompletedEvent
  isActive?: boolean
}

export function StepCard({ event, isActive = false }: StepCardProps) {
  const [showRaw, setShowRaw] = useState(false)
  const completed = event.type === 'step_completed' ? event : null
  const hasRaw = completed?.raw != null

  return (
    <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      {/* Status icon */}
      <div style={{
        width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10,
        ...(isActive
          ? { background: '#fef9ee', border: '1.5px solid #d97706', color: '#d97706', animation: 'skillforge-pulse 1.5s ease-in-out infinite' }
          : { background: '#dcfce7', color: '#15803d' }
        ),
      }}>
        {isActive ? '▶' : '✓'}
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#1c1917' }}>
          {event.label}
        </div>
        {completed?.summary && (
          <div style={{ fontSize: 11, color: '#78716c', marginTop: 2 }}>
            {completed.summary}
          </div>
        )}
        {hasRaw && (
          <div style={{ marginTop: 8 }}>
            <button
              onClick={() => setShowRaw(v => !v)}
              style={{ fontSize: 11, color: '#b45309', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              {showRaw ? 'Hide raw output' : 'Show raw output'}
            </button>
            {showRaw && (
              <pre style={{ marginTop: 8, maxHeight: 256, overflow: 'auto' }}>
                {JSON.stringify(completed!.raw, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>

      {/* Elapsed */}
      <div style={{ fontSize: 10, color: '#a8a29e', fontFamily: "'JetBrains Mono', monospace", flexShrink: 0, marginTop: 2 }}>
        {completed ? `${completed.elapsed_ms}ms` : '—'}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Trigger a skill run. Check:
- Completed step cards: white card, green circle icon `✓`, dark title, muted summary, amber "Show raw output" link if raw data present
- Active step card: amber-bordered circle icon with `▶`, pulsing glow, elapsed shows `—`
- Elapsed times appear in monospace at right

- [ ] **Step 3: Verify TypeScript and lint**

```bash
npm run build && npm run lint
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ExecutionLog/StepCard.tsx
git commit -m "feat: redesign StepCard with warm amber theme"
```

---

## Task 5: ApprovalCard

**Files:**
- Modify: `src/components/ExecutionLog/ApprovalCard.tsx`

- [ ] **Step 1: Rewrite `ApprovalCard.tsx`**

```tsx
import type { ApprovalRequiredEvent } from '../../types/skill'

interface ApprovalCardProps {
  event: ApprovalRequiredEvent
  matchId: string
  onApprove: () => void
  onReject: () => void
  decided?: { decision: 'approved' | 'rejected'; actor?: string; timestamp: string } | null
}

export function ApprovalCard({ event, onApprove, onReject, decided }: ApprovalCardProps) {
  if (decided) {
    const isApproved = decided.decision === 'approved'
    return (
      <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 8, padding: '10px 14px', opacity: 0.75, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, color: isApproved ? '#15803d' : '#b91c1c' }}>
          {isApproved ? '✓' : '✗'} {isApproved ? 'Approved' : 'Rejected'}
          {decided.actor ? ` by ${decided.actor}` : ''}
        </span>
        <span style={{ fontSize: 11, color: '#a8a29e', fontFamily: "'JetBrains Mono', monospace" }}>
          {new Date(decided.timestamp).toLocaleTimeString()}
        </span>
      </div>
    )
  }

  const { proposed_changes, guardrails, reply_draft } = event
  const stats = proposed_changes.stats

  return (
    <div style={{ background: '#fff', border: '1px solid #fde68a', borderLeft: '4px solid #b45309', borderRadius: 8, padding: '18px 18px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: '#1c1917' }}>
        Awaiting your decision
      </div>

      <div style={{ fontSize: 12, color: '#57534e', lineHeight: 1.6 }}>
        {proposed_changes.description}
      </div>

      {/* Stat grid */}
      <div style={{ display: 'flex', gap: 20 }}>
        {Object.entries(stats).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span style={{ fontSize: 22, color: '#1c1917', fontFamily: "'DM Serif Display', serif" }}>{v}</span>
            <span style={{ fontSize: 10, color: '#a8a29e', textTransform: 'uppercase' as const, letterSpacing: '.08em' }}>{k}</span>
          </div>
        ))}
      </div>

      {/* Files to modify */}
      {proposed_changes.files_to_modify.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {proposed_changes.files_to_modify.map(f => (
            <li key={f} style={{ fontSize: 11, color: '#78716c', fontFamily: "'JetBrains Mono', monospace" }}>{f}</li>
          ))}
        </ul>
      )}

      {/* Reply draft */}
      {reply_draft && (
        <div style={{ border: '1px solid #e7e5e4', borderRadius: 6, padding: '10px 12px' }}>
          <div style={{ fontSize: 10, color: '#a8a29e', marginBottom: 4 }}>Reply draft</div>
          <div style={{ fontSize: 11, color: '#57534e', fontStyle: 'italic' }}>{reply_draft}</div>
        </div>
      )}

      {/* Guardrails */}
      {guardrails.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {guardrails.map((g, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#15803d', flexShrink: 0, fontSize: 11 }}>✓</span>
              <span style={{ fontSize: 11, color: '#57534e' }}>{g}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          onClick={onApprove}
          style={{ background: '#b45309', color: '#fffdf7', fontSize: 12, fontWeight: 600, padding: '8px 18px', borderRadius: 6, border: 'none' }}
        >
          Approve &amp; Run
        </button>
        <button
          style={{ background: 'transparent', color: '#78716c', fontSize: 12, padding: '8px 14px', borderRadius: 6, border: '1px solid #e7e5e4' }}
        >
          Edit Preview
        </button>
        <button
          onClick={onReject}
          style={{ background: 'transparent', color: '#b91c1c', fontSize: 12, padding: '8px 14px', borderRadius: 6, border: '1px solid #fca5a5', marginLeft: 'auto' }}
        >
          Reject
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Wait for the approval card to appear in the execution log. Check:
- Card has a 4px amber left border
- Headline "Awaiting your decision" in DM Serif Display (serif, larger)
- Stats render as large serif numbers with muted uppercase labels below
- File paths are monospace
- Guardrail items have green `✓` with text
- "Approve & Run" is amber fill; "Reject" is right-aligned with red border
- After clicking Approve or Reject, card collapses to a single dimmed row

- [ ] **Step 3: Verify TypeScript and lint**

```bash
npm run build && npm run lint
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ExecutionLog/ApprovalCard.tsx
git commit -m "feat: redesign ApprovalCard as hero moment with amber theme"
```

---

## Task 6: ValidationCard

**Files:**
- Modify: `src/components/ExecutionLog/ValidationCard.tsx`

- [ ] **Step 1: Rewrite `ValidationCard.tsx`**

```tsx
import type { ValidationResultEvent } from '../../types/skill'

interface ValidationCardProps {
  event: ValidationResultEvent
}

export function ValidationCard({ event }: ValidationCardProps) {
  const passed = event.status === 'passed'

  return (
    <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 8, padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1c1917' }}>Validation</span>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
          background: passed ? '#dcfce7' : '#fee2e2',
          color: passed ? '#15803d' : '#b91c1c',
          textTransform: 'uppercase' as const,
          letterSpacing: '.06em',
        }}>
          {passed ? 'PASSED' : 'FAILED'}
        </span>
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {event.checks.map((check, i) => {
          const ok = check.status === 'passed'
          return (
            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 11 }}>
              <span style={{ color: ok ? '#15803d' : '#b91c1c', flexShrink: 0 }}>{ok ? '✓' : '✗'}</span>
              <span style={{ color: '#57534e' }}>{check.name}</span>
              {check.detail && (
                <span style={{ color: '#a8a29e', fontSize: 10 }}>— {check.detail}</span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript and lint**

```bash
npm run build && npm run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ExecutionLog/ValidationCard.tsx
git commit -m "feat: update ValidationCard to warm amber theme"
```

---

## Task 7: StatsPanel, MetricCard, SkillSelector

**Files:**
- Modify: `src/components/StatsPanel/StatsPanel.tsx`
- Modify: `src/components/StatsPanel/MetricCard.tsx`
- Modify: `src/components/StatsPanel/SkillSelector.tsx`

- [ ] **Step 1: Rewrite `MetricCard.tsx`**

```tsx
interface MetricCardProps {
  label: string
  value: string | number
  unit?: string
  colorCode?: boolean
  rawValue?: number
}

export default function MetricCard({ label, value, unit, colorCode, rawValue }: MetricCardProps) {
  const numericRaw = rawValue ?? (typeof value === 'number' ? value : undefined)

  let valueColor = '#1c1917'
  if (colorCode && numericRaw !== undefined) {
    if (numericRaw >= 0.9) valueColor = '#15803d'
    else if (numericRaw <= 0.2) valueColor = '#b91c1c'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ fontSize: 10, color: '#a8a29e', textTransform: 'uppercase' as const, letterSpacing: '.07em' }}>
        {label}
      </div>
      <div style={{ fontSize: 22, color: valueColor, fontFamily: "'DM Serif Display', serif", lineHeight: 1.1 }}>
        {value}
        {unit && (
          <span style={{ fontSize: 13, color: '#78716c', fontFamily: "'DM Sans', sans-serif" }}>{unit}</span>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Rewrite `SkillSelector.tsx`**

```tsx
import type { SkillSummary } from '../../types/skill'

interface SkillSelectorProps {
  skills: SkillSummary[]
  selectedId: string
  onChange: (skillId: string) => void
}

function statusLabel(status: SkillSummary['status']): string {
  switch (status) {
    case 'team_standard': return 'Team Standard'
    case 'beta': return 'Beta'
    case 'needs_refinement': return 'Needs Refinement'
    case 'active': return 'Active'
    case 'disabled': return 'Disabled'
    default: return status
  }
}

export default function SkillSelector({ skills, selectedId, onChange }: SkillSelectorProps) {
  return (
    <select
      value={selectedId}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: '#fff',
        border: '1px solid #fde68a',
        color: '#1c1917',
        borderRadius: 7,
        padding: '8px 10px',
        fontSize: 12,
        fontWeight: 600,
        fontFamily: "'DM Sans', sans-serif",
        width: '100%',
        cursor: 'pointer',
      }}
    >
      {skills.map((skill) => (
        <option key={skill.skill_id} value={skill.skill_id}>
          {skill.skill_name} · {statusLabel(skill.status)}
        </option>
      ))}
    </select>
  )
}
```

- [ ] **Step 3: Rewrite `StatsPanel.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { useSkillOps, useSkillList } from '../../hooks/useSkillOps'
import SkillSelector from './SkillSelector'
import MetricCard from './MetricCard'

interface StatsPanelProps {
  selectedSkillId: string
  onSkillChange: (skillId: string) => void
  executionStartedAt?: string | null
}

function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

const PANEL_WIDTH = 200

export default function StatsPanel({ selectedSkillId, onSkillChange, executionStartedAt }: StatsPanelProps) {
  const { data: metrics } = useSkillOps(selectedSkillId)
  const { data: skills } = useSkillList()
  const [collapsed, setCollapsed] = useState(false)
  const [elapsed, setElapsed] = useState<number | null>(null)

  useEffect(() => {
    if (!executionStartedAt) { setElapsed(null); return }
    const startMs = new Date(executionStartedAt).getTime()
    const tick = () => setElapsed(Math.floor((Date.now() - startMs) / 1000))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [executionStartedAt])

  const elapsedStr = elapsed !== null ? formatElapsed(elapsed) : '—'

  if (collapsed) {
    return (
      <div style={{ width: 36, background: '#fef9ee', borderLeft: '1px solid #e7e5e4', display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, overflow: 'hidden' }}>
        <button
          onClick={() => setCollapsed(false)}
          title="Expand SkillOps panel"
          style={{ marginTop: 12, width: 28, height: 28, borderRadius: 6, border: '1px solid #e7e5e4', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#78716c', flexShrink: 0 }}
        >
          ‹
        </button>
        <div style={{ marginTop: 16, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: '#a8a29e', writingMode: 'vertical-rl', transform: 'rotate(180deg)', userSelect: 'none' }}>
          SkillOps
        </div>
        <div style={{ marginTop: 'auto', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
          {metrics && (
            <>
              <div title={`Run Rate: ${Math.round(metrics.run_rate * 100)}%`}
                style={{ width: 8, height: 8, borderRadius: '50%', background: metrics.run_rate >= 0.9 ? '#15803d' : '#b45309' }} />
              <div title={`Reject Rate: ${Math.round(metrics.reject_rate * 100)}%`}
                style={{ width: 8, height: 8, borderRadius: '50%', background: metrics.reject_rate <= 0.1 ? '#15803d' : '#b91c1c' }} />
              <div title={`Success Rate: ${Math.round(metrics.success_rate * 100)}%`}
                style={{ width: 8, height: 8, borderRadius: '50%', background: metrics.success_rate >= 0.9 ? '#15803d' : '#d97706' }} />
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: PANEL_WIDTH, background: '#fef9ee', borderLeft: '1px solid #e7e5e4', padding: 16, display: 'flex', flexDirection: 'column', gap: 14, flexShrink: 0, overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: '#a8a29e', letterSpacing: '.12em', textTransform: 'uppercase' as const }}>SkillOps</div>
        <button
          onClick={() => setCollapsed(true)}
          title="Collapse panel"
          style={{ width: 24, height: 24, borderRadius: 5, border: '1px solid #e7e5e4', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#a8a29e', fontSize: 14, lineHeight: 1, flexShrink: 0 }}
        >
          ›
        </button>
      </div>

      <SkillSelector
        skills={skills ?? []}
        selectedId={selectedSkillId}
        onChange={onSkillChange}
      />

      <div style={{ borderTop: '1px solid #fde68a' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <MetricCard label="Time Elapsed" value={elapsedStr} />
        <MetricCard label="Tokens Used" value="—" />
        <MetricCard
          label="Run Rate"
          value={metrics ? `${Math.round(metrics.run_rate * 100)}` : '—'}
          unit={metrics ? '%' : undefined}
          colorCode={!!metrics}
          rawValue={metrics?.run_rate}
        />
        <MetricCard
          label="Reject Rate"
          value={metrics ? `${Math.round(metrics.reject_rate * 100)}` : '—'}
          unit={metrics ? '%' : undefined}
          colorCode={!!metrics}
          rawValue={metrics ? 1 - metrics.reject_rate : undefined}
        />
        <MetricCard
          label="Success Rate"
          value={metrics ? `${Math.round(metrics.success_rate * 100)}` : '—'}
          unit={metrics ? '%' : undefined}
          colorCode={!!metrics}
          rawValue={metrics?.success_rate}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify in browser**

Check the stats panel:
- Background is warm cream `#fef9ee`, not white or gray
- Skill selector has amber border
- Divider between selector and metrics is amber (`#fde68a`)
- Metric numbers are large DM Serif Display with muted DM Sans unit suffix
- Green values for high run/success rates
- Collapse button folds panel to 36px strip; expand button restores it
- Collapsed strip: cream background, mini colored dots

- [ ] **Step 5: Verify TypeScript and lint**

```bash
npm run build && npm run lint
```

Expected: no errors.

- [ ] **Step 6: Final visual pass**

With the dev server running, do a full end-to-end check:
- Page uses warm cream background throughout, no dark areas remain
- Brand row (serif "SkillForge / Daily Cash Reconciliation") sits above the timeline
- Timeline: amber progress, amber done-pips, gradient connectors
- Execution log cards: white, clean, amber active state
- Approval card: hero moment with amber left border + serif headline
- Stats panel: warm cream, large serif numbers
- Sticky header stays pinned while scrolling the execution log
- UI renders at 125% zoom (check: UI should feel slightly larger than standard)

- [ ] **Step 7: Commit**

```bash
git add src/components/StatsPanel/StatsPanel.tsx src/components/StatsPanel/MetricCard.tsx src/components/StatsPanel/SkillSelector.tsx
git commit -m "feat: redesign StatsPanel with warm cream and DM Serif Display metrics"
```
