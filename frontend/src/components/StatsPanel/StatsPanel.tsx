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
    if (!executionStartedAt) {
      const id = setTimeout(() => setElapsed(null), 0)
      return () => clearTimeout(id)
    }
    const startMs = new Date(executionStartedAt).getTime()
    const tick = () => setElapsed(Math.floor((Date.now() - startMs) / 1000))
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
