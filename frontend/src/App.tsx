import { useCallback, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ExecutionLog } from './components/ExecutionLog/ExecutionLog'
import { SkillDashboard } from './components/SkillDashboard/SkillDashboard'
import StatsPanel from './components/StatsPanel/StatsPanel'
import { useSkillStream } from './hooks/useSkillStream'
import { listMatches, approveMatch, previewMatch, rejectMatch } from './api/skillops'
import type { RunInputs } from './api/skillops'
import type { ApprovalRequiredEvent, ExecutionCompleteEvent, ExecutionEvent, ReviewedWorkflow } from './types/skill'

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
  const [dashboardError, setDashboardError] = useState<string | null>(null)
  const [reviewedWorkflow, setReviewedWorkflow] = useState<ReviewedWorkflow | null>(null)
  const [skillCreated, setSkillCreated] = useState(false)
  const [streamRunKey, setStreamRunKey] = useState(0)

  const { data: matches, isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: listMatches,
    refetchInterval: 10_000,
  })

  const match = matches?.[0] ?? null
  const matchId = match?.match_id ?? null
  const { events, status, error } = useSkillStream(matchId, streamRunKey)

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

  const handleWorkflowChange = useCallback((workflow: ReviewedWorkflow) => {
    setReviewedWorkflow(workflow)
  }, [])

  const handleGenerateSkill = useCallback((workflow: ReviewedWorkflow) => {
    setReviewedWorkflow(workflow)
    setSkillCreated(true)
  }, [])

  async function handleApprove() {
    if (!matchId) return
    setActionError(null)
    try {
      await approveMatch(matchId, reviewedWorkflow)
      setLocalDecision({ decision: 'approved', actor: 'analyst_1', timestamp: new Date().toISOString() })
      await queryClient.invalidateQueries({ queryKey: ['matches'] })
      await queryClient.invalidateQueries({ queryKey: ['skillops'] })
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'The run could not be approved.')
    }
  }

  async function handleRunSkill(skillId: string, inputs: RunInputs) {
    const selectedMatch = matches?.find(item => item.skill_id === skillId) ?? match
    if (!selectedMatch) {
      setDashboardError('No local workflow match is available to run.')
      return
    }
    setDashboardError(null)
    setActionError(null)
    setLocalDecision(null)
    setReviewedWorkflow(null)
    setSkillCreated(false)
    try {
      await previewMatch(selectedMatch.match_id, inputs)
      await queryClient.invalidateQueries({ queryKey: ['matches'] })
      setStreamRunKey(value => value + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setDashboardError(err instanceof Error ? err.message : 'The workflow could not be started.')
    }
  }

  function scrollToDashboard() {
    document.getElementById('workflow-dashboard')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
          <p className="eyebrow">In-house FDE</p>
          <h1>FDE-in-house</h1>
          <p className="header-subtitle">
            Watches repeated operating work, explains the pattern, drafts the FDE workflow, and asks before acting.
          </p>
        </div>
        <div className="header-actions">
          <div className={`status-pill status-${status}`}>
            <span className="status-dot" />
            <span>{currentStepLabel}</span>
          </div>
          <button className="flow-jump-button" type="button" onClick={scrollToDashboard}>
            <span className="flow-jump-icon" />
            View workflow dashboard
          </button>
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
              onWorkflowChange={handleWorkflowChange}
              onGenerateSkill={handleGenerateSkill}
              onRunGeneratedSkill={handleApprove}
              skillCreated={skillCreated}
            />
          )}
        </section>

        <StatsPanel
          runStats={runStats}
          status={status}
        />
      </main>

      <SkillDashboard activeSkillId={match?.skill_id} onRunSkill={handleRunSkill} runError={dashboardError} />
    </div>
  )
}
