import React from 'react'
import { Badge } from '@/components/ui/badge'

interface StatsBarProps {
  rowCount: number
  columnCount: number
  headers: string[]
}

const StatsBar: React.FC<StatsBarProps> = ({ rowCount, columnCount, headers }) => {
  return (
    <div className="flex flex-wrap gap-3 mt-4 p-4 rounded-xl border border-[rgba(124,58,237,0.25)] bg-purple-500/8">
      <StatChip label="Rows" value={rowCount} colorClass="text-purple-400 border-purple-500/30 bg-purple-500/10" />
      <StatChip label="Columns" value={columnCount} colorClass="text-cyan-400 border-cyan-500/30 bg-cyan-500/10" />
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Headers:
        </span>
        <div className="flex flex-wrap gap-1">
          {headers.slice(0, 8).map((h) => (
            <Badge
              key={h}
              variant="outline"
              className="text-xs font-mono truncate max-w-30 bg-cyan-500/15 text-cyan-400 border-cyan-500/30 font-normal py-0.5 px-2"
              title={h}
            >
              {h}
            </Badge>
          ))}
          {headers.length > 8 && (
            <Badge
              variant="outline"
              className="text-xs text-slate-400 bg-white/5 border-white/10 font-normal py-0.5 px-2"
            >
              +{headers.length - 8} more
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}

const StatChip: React.FC<{ label: string; value: number; colorClass: string }> = ({ label, value, colorClass }) => (
  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${colorClass}`}>
    <span className="text-lg font-bold">{value}</span>
    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
  </div>
)

export default StatsBar
