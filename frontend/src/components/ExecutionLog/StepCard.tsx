import { useState } from 'react'
import type { StepStartedEvent, StepCompletedEvent } from '../../types/skill'

interface StepCardProps {
  event: StepStartedEvent | StepCompletedEvent
  isActive?: boolean
}

export function StepCard({ event, isActive = false }: StepCardProps) {
  const [showRaw, setShowRaw] = useState(false)
  const completed = event.type === 'step_completed' ? event : null
  const hasRaw = completed?.raw != null

  return (
    <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      {/* Status icon */}
      <div style={{
        width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10,
        ...(isActive
          ? { background: '#fef9ee', border: '1.5px solid #d97706', color: '#d97706', animation: 'skillforge-pulse 1.5s ease-in-out infinite' }
          : { background: '#dcfce7', color: '#15803d' }
        ),
      }}>
        {isActive ? '▶' : '✓'}
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#1c1917' }}>
          {event.label}
        </div>
        {completed?.summary && (
          <div style={{ fontSize: 11, color: '#78716c', marginTop: 2 }}>
            {completed.summary}
          </div>
        )}
        {hasRaw && (
          <div style={{ marginTop: 8 }}>
            <button
              onClick={() => setShowRaw(v => !v)}
              style={{ fontSize: 11, color: '#b45309', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              {showRaw ? 'Hide raw output' : 'Show raw output'}
            </button>
            {showRaw && (
              <pre style={{ marginTop: 8, maxHeight: 256, overflow: 'auto' }}>
                {JSON.stringify(completed!.raw, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>

      {/* Elapsed */}
      <div style={{ fontSize: 10, color: '#a8a29e', fontFamily: "'JetBrains Mono', monospace", flexShrink: 0, marginTop: 2 }}>
        {completed ? `${completed.elapsed_ms}ms` : '—'}
      </div>
    </div>
  )
}
