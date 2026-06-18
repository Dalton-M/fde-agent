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
