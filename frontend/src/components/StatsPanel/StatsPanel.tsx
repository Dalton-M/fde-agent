import { useSkillList, useSkillOps } from '../../hooks/useSkillOps'
import MetricCard from './MetricCard'

interface RunStats {
  total: number
  matched: number
  exceptions: number
  outputFile: string
}

interface StatsPanelProps {
  skillId: string
  runStats: RunStats | null
  status: 'idle' | 'connecting' | 'streaming' | 'paused' | 'done' | 'error'
}

function percent(value: number | undefined): string {
  if (value === undefined) return '0%'
  const bounded = Math.max(0, Math.min(1, value))
  return `${Math.round(bounded * 100)}%`
}

function fileName(path: string): string {
  return path.split(/[\\/]/).pop() ?? path
}

function statusLabel(status: StatsPanelProps['status']): string {
  switch (status) {
    case 'paused':
      return 'Ready to review'
    case 'done':
      return 'Complete'
    case 'streaming':
      return 'Generating'
    case 'connecting':
      return 'Connecting'
    case 'error':
      return 'Needs attention'
    default:
      return 'Ready'
  }
}

export default function StatsPanel({ skillId, runStats, status }: StatsPanelProps) {
  const { data: metrics } = useSkillOps(skillId)
  const { data: skills } = useSkillList()
  const activeSkills = skills?.filter(skill => skill.status !== 'disabled').length ?? 0

  return (
    <aside className="stats-panel">
      <div>
        <p className="eyebrow">Current run</p>
        <h2>{statusLabel(status)}</h2>
      </div>

      <div className="metric-stack">
        <MetricCard label="Records found" value={runStats?.total ?? '--'} detail="Items in the repeated workflow" />
        <MetricCard label="Can automate" value={runStats?.matched ?? '--'} detail="Steps the agent can handle" tone="good" />
        <MetricCard label="Needs review" value={runStats?.exceptions ?? '--'} detail="Items left for a person" tone={runStats?.exceptions ? 'warn' : 'good'} />
      </div>

      {runStats?.outputFile && (
        <div className="output-card">
          <span>Created file</span>
          <strong>{fileName(runStats.outputFile)}</strong>
        </div>
      )}

      <div className="panel-divider" />

      <div>
        <p className="eyebrow">Automation history</p>
        <div className="metric-stack compact">
          <MetricCard label="Generated skills" value={activeSkills} />
          <MetricCard label="Patterns found" value={metrics?.matches ?? 0} />
          <MetricCard label="Approved runs" value={metrics?.runs ?? 0} />
          <MetricCard label="Successful runs" value={percent(metrics?.success_rate)} tone={(metrics?.success_rate ?? 0) >= 0.9 ? 'good' : 'neutral'} />
        </div>
      </div>
    </aside>
  )
}
