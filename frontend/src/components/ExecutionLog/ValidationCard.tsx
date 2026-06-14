import type { ValidationResultEvent } from '../../types/skill'

interface ValidationCardProps {
  event: ValidationResultEvent
}

export function ValidationCard({ event }: ValidationCardProps) {
  const passed = event.status === 'passed'

  return (
    <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 8, padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1c1917' }}>Validation</span>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
          background: passed ? '#dcfce7' : '#fee2e2',
          color: passed ? '#15803d' : '#b91c1c',
          textTransform: 'uppercase' as const,
          letterSpacing: '.06em',
        }}>
          {passed ? 'PASSED' : 'FAILED'}
        </span>
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {event.checks.map((check, i) => {
          const ok = check.status === 'passed'
          return (
            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 11 }}>
              <span style={{ color: ok ? '#15803d' : '#b91c1c', flexShrink: 0 }}>{ok ? '✓' : '✗'}</span>
              <span style={{ color: '#57534e' }}>{check.name}</span>
              {check.detail && (
                <span style={{ color: '#a8a29e', fontSize: 10 }}>— {check.detail}</span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
