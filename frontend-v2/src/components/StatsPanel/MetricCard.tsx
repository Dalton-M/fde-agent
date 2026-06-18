interface MetricCardProps {
  label: string
  value: string | number
  unit?: string
  colorCode?: boolean
  rawValue?: number
}

export default function MetricCard({ label, value, unit, colorCode, rawValue }: MetricCardProps) {
  const numericRaw = rawValue ?? (typeof value === 'number' ? value : undefined)

  let valueColor = '#1c1917'
  if (colorCode && numericRaw !== undefined) {
    if (numericRaw >= 0.9) valueColor = '#15803d'
    else if (numericRaw <= 0.2) valueColor = '#b91c1c'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ fontSize: 10, color: '#a8a29e', textTransform: 'uppercase' as const, letterSpacing: '.07em' }}>
        {label}
      </div>
      <div style={{ fontSize: 22, color: valueColor, fontFamily: "'DM Serif Display', serif", lineHeight: 1.1 }}>
        {value}
        {unit && (
          <span style={{ fontSize: 13, color: '#78716c', fontFamily: "'DM Sans', sans-serif" }}>{unit}</span>
        )}
      </div>
    </div>
  )
}
