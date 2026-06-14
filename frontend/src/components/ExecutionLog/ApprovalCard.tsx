import type { ApprovalRequiredEvent } from '../../types/skill'

interface ApprovalCardProps {
  event: ApprovalRequiredEvent
  matchId: string
  onApprove: () => void
  onReject: () => void
  decided?: { decision: 'approved' | 'rejected'; actor?: string; timestamp: string } | null
}

export function ApprovalCard({ event, onApprove, onReject, decided }: ApprovalCardProps) {
  if (decided) {
    const isApproved = decided.decision === 'approved'
    return (
      <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 8, padding: '10px 14px', opacity: 0.75, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, color: isApproved ? '#15803d' : '#b91c1c' }}>
          {isApproved ? '✓' : '✗'} {isApproved ? 'Approved' : 'Rejected'}
          {decided.actor ? ` by ${decided.actor}` : ''}
        </span>
        <span style={{ fontSize: 11, color: '#a8a29e', fontFamily: "'JetBrains Mono', monospace" }}>
          {new Date(decided.timestamp).toLocaleTimeString()}
        </span>
      </div>
    )
  }

  const { proposed_changes, guardrails, reply_draft } = event
  const stats = proposed_changes.stats

  return (
    <div style={{ background: '#fff', border: '1px solid #fde68a', borderLeft: '4px solid #b45309', borderRadius: 8, padding: '18px 18px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: '#1c1917' }}>
        Awaiting your decision
      </div>

      <div style={{ fontSize: 12, color: '#57534e', lineHeight: 1.6 }}>
        {proposed_changes.description}
      </div>

      {/* Stat grid */}
      <div style={{ display: 'flex', gap: 20 }}>
        {Object.entries(stats).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span style={{ fontSize: 22, color: '#1c1917', fontFamily: "'DM Serif Display', serif" }}>{v}</span>
            <span style={{ fontSize: 10, color: '#a8a29e', textTransform: 'uppercase' as const, letterSpacing: '.08em' }}>{k}</span>
          </div>
        ))}
      </div>

      {/* Files to modify */}
      {proposed_changes.files_to_modify.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {proposed_changes.files_to_modify.map(f => (
            <li key={f} style={{ fontSize: 11, color: '#78716c', fontFamily: "'JetBrains Mono', monospace" }}>{f}</li>
          ))}
        </ul>
      )}

      {/* Reply draft */}
      {reply_draft && (
        <div style={{ border: '1px solid #e7e5e4', borderRadius: 6, padding: '10px 12px' }}>
          <div style={{ fontSize: 10, color: '#a8a29e', marginBottom: 4 }}>Reply draft</div>
          <div style={{ fontSize: 11, color: '#57534e', fontStyle: 'italic' }}>{reply_draft}</div>
        </div>
      )}

      {/* Guardrails */}
      {guardrails.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {guardrails.map((g, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#15803d', flexShrink: 0, fontSize: 11 }}>✓</span>
              <span style={{ fontSize: 11, color: '#57534e' }}>{g}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          onClick={onApprove}
          style={{ background: '#b45309', color: '#fffdf7', fontSize: 12, fontWeight: 600, padding: '8px 18px', borderRadius: 6, border: 'none', cursor: 'pointer' }}
        >
          Approve &amp; Run
        </button>
        <button
          style={{ background: 'transparent', color: '#78716c', fontSize: 12, padding: '8px 14px', borderRadius: 6, border: '1px solid #e7e5e4', cursor: 'pointer' }}
        >
          Edit Preview
        </button>
        <button
          onClick={onReject}
          style={{ background: 'transparent', color: '#b91c1c', fontSize: 12, padding: '8px 14px', borderRadius: 6, border: '1px solid #fca5a5', marginLeft: 'auto', cursor: 'pointer' }}
        >
          Reject
        </button>
      </div>
    </div>
  )
}
