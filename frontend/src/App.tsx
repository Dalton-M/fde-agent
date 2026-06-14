import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import FlowTimeline from './components/FlowTimeline/FlowTimeline'
import { ExecutionLog } from './components/ExecutionLog/ExecutionLog'
import StatsPanel from './components/StatsPanel/StatsPanel'
import { useSkillStream } from './hooks/useSkillStream'
import { listMatches, approveMatch, rejectMatch } from './api/skillops'
import { POST_APPROVAL_EVENTS } from './mocks/handlers'
import type { SkillStep, ExecutionEvent } from './types/skill'

// The 7 steps of the Daily Cash Reconciliation Skill (from skill.yaml)
const SKILL_STEPS: SkillStep[] = [
  { id: 'trigger', type: 'email_trigger', label: 'Trigger', sublabel: 'email_received' },
  { id: 'parse_bank_transactions', type: 'parse_xlsx_attachment', label: 'Parse', sublabel: 'xlsx_attachment' },
  { id: 'build_reconciliation_preview', type: 'preview_reconciliation_update', label: 'Preview', sublabel: 'recon_update' },
  { id: 'require_approval', type: 'require_human_approval', label: 'Approval', sublabel: 'human_review' },
  { id: 'write_workbook_update', type: 'write_xlsx_update', label: 'Execute', sublabel: 'write_xlsx' },
  { id: 'validate', type: 'validate', label: 'Validate', sublabel: '7 checks' },
  { id: 'write_audit_log', type: 'write_audit_log', label: 'Audit', sublabel: 'audit_log' },
]

export default function App() {
  const [selectedSkillId, setSelectedSkillId] = useState('daily_cash_reconciliation')
  const [decision, setDecision] = useState<{ decision: 'approved' | 'rejected'; actor?: string; timestamp: string } | null>(null)
  const [extraEvents, setExtraEvents] = useState<ExecutionEvent[]>([])
  const [executionStartedAt] = useState(() => new Date().toISOString())

  // Load pending matches
  const { data: matches } = useQuery({
    queryKey: ['matches'],
    queryFn: listMatches,
  })

  const matchId = matches?.[0]?.match_id ?? null

  // SSE stream
  const { events: streamEvents, activeStepIndex, status } = useSkillStream(matchId)

  // Merge SSE events + post-approval events
  const allEvents: ExecutionEvent[] = [...streamEvents, ...extraEvents]

  // Compute completed step count from unique step_completed events
  const completedStepIds = new Set(
    allEvents.filter(e => e.type === 'step_completed').map(e => (e as { step_id: string }).step_id)
  )
  const completedCount = completedStepIds.size

  // Compute elapsed per step
  const elapsedPerStep: Record<string, number> = {}
  for (const e of allEvents) {
    if (e.type === 'step_completed') {
      const ev = e as { step_id: string; elapsed_ms: number }
      elapsedPerStep[ev.step_id] = ev.elapsed_ms
    }
  }

  // Current step label for progress bar
  const hasApprovalPending = allEvents.some(e => e.type === 'approval_required') && !decision
  const currentStepLabel = status === 'done'
    ? '✓ Complete'
    : hasApprovalPending
    ? '⏳ Awaiting Approval'
    : status === 'connecting'
    ? 'Connecting…'
    : SKILL_STEPS[activeStepIndex]?.label ?? ''

  // After approval: stream POST_APPROVAL_EVENTS with delays
  function streamPostApprovalEvents() {
    ;(POST_APPROVAL_EVENTS as unknown as ExecutionEvent[]).forEach((event, i) => {
      setTimeout(() => {
        setExtraEvents(prev => [...prev, event])
      }, (i + 1) * 1500)
    })
  }

  async function handleApprove() {
    if (!matchId) return
    try {
      await approveMatch(matchId)
    } catch {
      // MSW mock — ignore errors
    }
    setDecision({ decision: 'approved', actor: 'analyst_1', timestamp: new Date().toISOString() })
    streamPostApprovalEvents()
  }

  async function handleReject() {
    if (!matchId) return
    try {
      await rejectMatch(matchId)
    } catch {
      // MSW mock — ignore errors
    }
    setDecision({ decision: 'rejected', actor: 'analyst_1', timestamp: new Date().toISOString() })
  }

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
}
