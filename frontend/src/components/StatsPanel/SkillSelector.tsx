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
