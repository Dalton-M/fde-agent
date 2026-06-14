import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ExecutionLog } from './components/ExecutionLog/ExecutionLog'
import StatsPanel from './components/StatsPanel/StatsPanel'
import { useSkillStream } from './hooks/useSkillStream'
import { listMatches, approveMatch, rejectMatch } from './api/skillops'
import type { ApprovalRequiredEvent, ExecutionCompleteEvent, ExecutionEvent } from './types/skill'

function latestApproval(events: ExecutionEvent[]): ApprovalRequiredEvent | null {
  for (let i = events.length - 1; i >= 0; i -= 1) {
    const event = events[i]
    if (event.type === 'approval_required') return event
  }
  return null
}

function latestCompletion(events: ExecutionEvent[]): ExecutionCompleteEvent | null {
  for (let i = events.length - 1; i >= 0; i -= 1) {
    const event = events[i]
    if (event.type === 'execution_complete') return event
  }
  return null
}

function latestOutputRaw(events: ExecutionEvent[]): Record<string, unknown> | null {
  for (let i = events.length - 1; i >= 0; i -= 1) {
    const event = events[i]
    if (event.type === 'step_completed' && event.step_id === 'create_reconciled_spreadsheet') {
      return event.raw ?? null
    }
  }
  return null
}

function numberFrom(raw: Record<string, unknown> | null, key: string): number | null {
  const value = raw?.[key]
  return typeof value === 'number' ? value : null
}

function stringFrom(raw: Record<string, unknown> | null, key: string): string | null {
  const value = raw?.[key]
  return typeof value === 'string' ? value : null
}

function progressLabel(status: ReturnType<typeof useSkillStream>['status']): string {
  if (status === 'done') return 'Complete'
  if (status === 'paused') return 'Review stage'
  if (status === 'connecting') return 'Connecting'
  if (status === 'error') return 'Needs attention'
  if (status === 'streaming') return 'Generating'
  return 'Ready'
}

export default function App() {
  const queryClient = useQueryClient()
  const [localDecision, setLocalDecision] = useState<{ decision: 'approved' | 'rejected'; actor?: string; timestamp: string } | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: matches, isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: listMatches,
    refetchInterval: 10_000,
  })

  const match = matches?.[0] ?? null
  const matchId = match?.match_id ?? null
  const { events, status, error } = useSkillStream(matchId)

  const approvalEvent = latestApproval(events)
  const completionEvent = latestCompletion(events)
  const outputRaw = latestOutputRaw(events)
  const decision = localDecision ?? completionEvent
  const currentStepLabel = progressLabel(status)

  const runStats = useMemo(() => {
    const stats = approvalEvent?.proposed_changes.stats
    if (!stats) return null
    return {
      total: numberFrom(outputRaw, 'rows_added') ?? Number(stats.total ?? 0),
      matched: numberFrom(outputRaw, 'matched_count') ?? Number(stats.matched ?? 0),
      exceptions: numberFrom(outputRaw, 'exception_count') ?? Number(stats.exceptions ?? 0),
      outputFile: stringFrom(outputRaw, 'workbook_created') ?? approvalEvent.proposed_changes.files_to_create[0] ?? '',
    }
  }, [approvalEvent, outputRaw])

  async function handleApprove() {
    if (!matchId) return
    setActionError(null)
    try {
      await approveMatch(matchId)
      setLocalDecision({ decision: 'approved', actor: 'analyst_1', timestamp: new Date().toISOString() })
      await queryClient.invalidateQueries({ queryKey: ['matches'] })
      await queryClient.invalidateQueries({ queryKey: ['skillops'] })
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'The run could not be approved.')
    }
  }

  async function handleReject() {
    if (!matchId) return
    setActionError(null)
    try {
      await rejectMatch(matchId)
      setLocalDecision({ decision: 'rejected', actor: 'analyst_1', timestamp: new Date().toISOString() })
      await queryClient.invalidateQueries({ queryKey: ['matches'] })
      await queryClient.invalidateQueries({ queryKey: ['skillops'] })
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'The run could not be rejected.')
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Pattern to automation</p>
          <h1>Auto-skill generator</h1>
          <p className="header-subtitle">
            Detects repeated user behavior, drafts a reusable workflow, and asks before running it.
          </p>
        </div>
        <div className={`status-pill status-${status}`}>
          <span className="status-dot" />
          <span>{currentStepLabel}</span>
        </div>
      </header>

      <main className="main-layout">
        <section className="execution-region">
          {isLoading || !matchId ? (
            <div className="empty-state">Loading the latest detected pattern.</div>
          ) : (
            <ExecutionLog
              events={events}
              onApprove={handleApprove}
              onReject={handleReject}
              decision={decision}
              status={status}
              error={error}
              actionError={actionError}
            />
          )}
        </section>

        <StatsPanel
          skillId={match?.skill_id ?? 'daily_cash_reconciliation'}
          runStats={runStats}
          status={status}
        />
      </main>
    </div>
  )
}
