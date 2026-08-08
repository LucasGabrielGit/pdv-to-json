import React from 'react'

interface StatsBarProps {
  rowCount: number
  columnCount: number
  headers: string[]
}

const StatsBar: React.FC<StatsBarProps> = ({ rowCount, columnCount, headers }) => {
  return (
    <div className="flex flex-wrap gap-3 mt-4 p-4 rounded-xl border"
      style={{ background: 'rgba(124,58,237,0.08)', borderColor: 'var(--border-color)' }}>
      <StatChip label="Rows" value={rowCount} color="var(--accent-primary)" />
      <StatChip label="Columns" value={columnCount} color="var(--accent-secondary)" />
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Headers:
        </span>
        <div className="flex flex-wrap gap-1">
          {headers.slice(0, 8).map((h) => (
            <span
              key={h}
              className="text-xs px-2 py-0.5 rounded-full font-mono truncate max-w-[120px]"
              style={{ background: 'rgba(6,182,212,0.15)', color: 'var(--accent-secondary)', border: '1px solid rgba(6,182,212,0.3)' }}
              title={h}
            >
              {h}
            </span>
          ))}
          {headers.length > 8 && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: 'var(--text-muted)', background: 'rgba(148,163,184,0.1)' }}>
              +{headers.length - 8} more
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

const StatChip: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
    style={{ background: `${color}18`, border: `1px solid ${color}40` }}>
    <span className="text-lg font-bold" style={{ color }}>{value}</span>
    <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</span>
  </div>
)

export default StatsBar
