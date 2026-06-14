import type { StepCompletedEvent, StepStartedEvent } from '../../types/skill'

interface StepCardProps {
  event: StepStartedEvent | StepCompletedEvent
  isActive?: boolean
}

function formatElapsed(ms: number): string {
  if (ms < 1000) return `${ms} ms`
  return `${(ms / 1000).toFixed(1)} sec`
}

function rawString(raw: Record<string, unknown> | undefined, key: string): string {
  const value = raw?.[key]
  return typeof value === 'string' ? value : ''
}

function rawNumber(raw: Record<string, unknown> | undefined, key: string): number | null {
  const value = raw?.[key]
  return typeof value === 'number' ? value : null
}

function rawStringList(raw: Record<string, unknown> | undefined, key: string): string[] {
  const value = raw?.[key]
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function fileName(path: string): string {
  return path.split(/[\\/]/).pop() ?? path
}

export function StepCard({ event, isActive = false }: StepCardProps) {
  const completed = event.type === 'step_completed' ? event : null
  const workbookCreated = rawString(completed?.raw, 'workbook_created')
  const changedSheets = rawStringList(completed?.raw, 'changed_sheets')
  const cellsWritten = rawNumber(completed?.raw, 'cells_written')
  const rowsAdded = rawNumber(completed?.raw, 'rows_added')
  const summarySheet = rawString(completed?.raw, 'summary_sheet')
  const hasOutputProof = Boolean(workbookCreated)

  return (
    <article className={`workflow-card ${isActive ? 'active' : 'complete'}`}>
      <div className="card-status">
        <span className="status-marker" />
        <span>{isActive ? 'Rendering' : 'Complete'}</span>
      </div>
      <div className="card-body">
        <div className="card-title-row">
          <h3>{event.label}</h3>
          <span className="step-time">
            {completed ? formatElapsed(completed.elapsed_ms) : new Date(event.timestamp).toLocaleTimeString()}
          </span>
        </div>
        {completed?.summary ? (
          <p className="step-summary">{completed.summary}</p>
        ) : (
          <p className="step-summary muted">Generating this part of the workflow.</p>
        )}

        {hasOutputProof && (
          <div className="output-proof">
            <div>
              <span>Generated file</span>
              <strong>{fileName(workbookCreated)}</strong>
              <small>{workbookCreated}</small>
            </div>
            <div className="output-proof-grid">
              {rowsAdded !== null && (
                <div>
                  <strong>{rowsAdded}</strong>
                  <span>rows written</span>
                </div>
              )}
              {cellsWritten !== null && cellsWritten > 0 && (
                <div>
                  <strong>{cellsWritten}</strong>
                  <span>cells changed</span>
                </div>
              )}
              {changedSheets.length > 0 && (
                <div>
                  <strong>{changedSheets.length}</strong>
                  <span>sheet updates</span>
                </div>
              )}
            </div>
            {changedSheets.length > 0 && (
              <div className="sheet-list">
                {changedSheets.map(sheet => (
                  <span key={sheet}>{sheet}</span>
                ))}
              </div>
            )}
            {summarySheet && <p className="proof-note">The generated spreadsheet includes a visible "{summarySheet}" sheet with the run summary.</p>}
          </div>
        )}
      </div>
    </article>
  )
}
