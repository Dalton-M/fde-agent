import type { SkillGeneratedEvent, SkillTriggerCondition } from '../../types/skill'

interface GeneratedSkillCardProps {
  event: SkillGeneratedEvent
}

function valueText(condition: SkillTriggerCondition): string {
  if (condition.value === undefined || condition.value === '') return condition.operator ?? condition.type ?? ''
  if (typeof condition.value === 'object') return JSON.stringify(condition.value)
  return String(condition.value)
}

function fileName(path: string): string {
  return path.split(/[\\/]/).pop() ?? path
}

export function GeneratedSkillCard({ event }: GeneratedSkillCardProps) {
  return (
    <article className="generated-skill-card">
      <div className="insight-header">
        <div>
          <p className="eyebrow">Skill generated</p>
          <h3>{event.title}</h3>
        </div>
        <span className="generated-badge">Reusable</span>
      </div>

      <p className="insight-summary">{event.summary}</p>

      <section className="skill-content-section primary-skill-section">
        <h4>Trigger</h4>
        <div className="trigger-list">
          {event.triggers.map((condition, index) => (
            <div className="trigger-row" key={`${condition.label ?? condition.field ?? 'trigger'}-${index}`}>
              <span>{condition.label ?? condition.field ?? condition.type ?? `Condition ${index + 1}`}</span>
              {valueText(condition) && <strong>{valueText(condition)}</strong>}
            </div>
          ))}
        </div>
      </section>

      {event.issues.length > 0 && (
        <section className="skill-content-section safety-section">
          <h4>Issues addressed</h4>
          <div className="issue-list">
            {event.issues.map(issue => (
              <span key={issue}>{issue}</span>
            ))}
          </div>
        </section>
      )}

      <section className="skill-steps-section">
        <h4>Step workflow</h4>
        <div className="skill-step-list">
          {event.steps.map(step => (
            <div className="skill-step-row" key={step.order}>
              <span>{step.order}</span>
              <div>
                <strong>{step.title}</strong>
                <p>{step.summary}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="skill-content-section outcome-section">
        <h4>Final expected outcome</h4>
        <p>{event.expected_outcome.summary || 'The skill creates the reviewed output and records the run.'}</p>
        {event.expected_outcome.files_created.length > 0 && (
          <div className="output-list">
            {event.expected_outcome.files_created.map(path => (
              <span key={path}>{fileName(path)}</span>
            ))}
          </div>
        )}
      </section>
    </article>
  )
}
