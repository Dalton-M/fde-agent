import { useEffect, useRef } from 'react'
import type { ExecutionEvent, StepCompletedEvent, StepStartedEvent } from '../../types/skill'
import { StepCard } from './StepCard'
import { ApprovalCard } from './ApprovalCard'
import { ValidationCard } from './ValidationCard'
import { PatternCard } from './PatternCard'
import { GeneratedSkillCard } from './GeneratedSkillCard'

interface ExecutionLogProps {
  events: ExecutionEvent[]
  onApprove: () => void
  onReject: () => void
  decision?: { decision: 'approved' | 'rejected'; actor?: string; timestamp: string } | null
  status?: 'idle' | 'connecting' | 'streaming' | 'paused' | 'done' | 'error'
  error?: string
  actionError?: string | null
}

type RenderItem =
  | { kind: 'step'; stepId: string }
  | { kind: 'pattern'; event: ExecutionEvent }
  | { kind: 'skill'; event: ExecutionEvent }
  | { kind: 'approval'; event: ExecutionEvent }
  | { kind: 'validation'; event: ExecutionEvent }

export function ExecutionLog({ events, onApprove, onReject, decision, status, error, actionError }: ExecutionLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [events])

  const stepMap = new Map<string, { started?: StepStartedEvent; completed?: StepCompletedEvent; index: number }>()
  const renderOrder: RenderItem[] = []

  for (const event of events) {
    if (event.type === 'step_started') {
      if (!stepMap.has(event.step_id)) renderOrder.push({ kind: 'step', stepId: event.step_id })
      const entry = stepMap.get(event.step_id) ?? { index: event.step_index }
      stepMap.set(event.step_id, { ...entry, started: event })
    } else if (event.type === 'step_completed') {
      if (!stepMap.has(event.step_id)) renderOrder.push({ kind: 'step', stepId: event.step_id })
      const entry = stepMap.get(event.step_id) ?? { index: event.step_index }
      stepMap.set(event.step_id, { ...entry, completed: event })
    } else if (event.type === 'pattern_detected') {
      renderOrder.push({ kind: 'pattern', event })
    } else if (event.type === 'skill_generated') {
      renderOrder.push({ kind: 'skill', event })
    } else if (event.type === 'approval_required') {
      renderOrder.push({ kind: 'approval', event })
    } else if (event.type === 'validation_result') {
      renderOrder.push({ kind: 'validation', event })
    }
  }

  const awaitingApproval = events.some(event => event.type === 'approval_required') && !decision
  const isRunning = (status === 'connecting' || status === 'streaming') && !awaitingApproval

  return (
    <div className="execution-log">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Live workflow</p>
          <h2>Skill generation run</h2>
          <p className="section-subtitle">
            The agent is turning the detected pattern into a reusable automation.
          </p>
        </div>
      </div>

      {renderOrder.map((item, index) => {
        if (item.kind === 'step') {
          const entry = stepMap.get(item.stepId)
          const event = entry?.completed ?? entry?.started
          if (!event) return null
          return <StepCard key={item.stepId} event={event} isActive={!entry?.completed} />
        }

        if (item.kind === 'approval' && item.event.type === 'approval_required') {
          return (
            <ApprovalCard
              key={`approval-${index}`}
              event={item.event}
              onApprove={onApprove}
              onReject={onReject}
              decided={decision}
            />
          )
        }

        if (item.kind === 'pattern' && item.event.type === 'pattern_detected') {
          return <PatternCard key={`pattern-${index}`} event={item.event} />
        }

        if (item.kind === 'skill' && item.event.type === 'skill_generated') {
          return <GeneratedSkillCard key={`skill-${index}`} event={item.event} />
        }

        if (item.kind === 'validation' && item.event.type === 'validation_result') {
          return <ValidationCard key={`validation-${index}`} event={item.event} />
        }

        return null
      })}

      {isRunning && (
        <div className="running-row">
          <span className="spinner" />
          <span>{status === 'connecting' ? 'Connecting to the local runner.' : 'Generating the next step.'}</span>
        </div>
      )}

      {status === 'error' && (
        <div className="error-box">
          The live run stopped updating. {error ? error : 'Restart the local runner and refresh the page.'}
        </div>
      )}

      {actionError && (
        <div className="error-box">
          The runner could not apply the decision. {actionError}
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
