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
