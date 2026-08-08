import React from 'react'
import { ArrowLeftRight, FileJson, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type Direction = 'json-to-csv' | 'csv-to-json'

interface DirectionToggleProps {
  direction: Direction
  onToggle: (newDir: Direction) => void
  onSwap: () => void
}

export const DirectionToggle: React.FC<DirectionToggleProps> = ({
  direction,
  onToggle,
  onSwap,
}) => {
  const isJsonToCsv = direction === 'json-to-csv'

  return (
    <div className="flex justify-center items-center gap-3 mb-8">
      <Button
        id="btn-direction-json-to-csv"
        onClick={() => onToggle('json-to-csv')}
        size="lg"
        variant={isJsonToCsv ? 'default' : 'outline'}
        className={`gap-2 transition-all duration-300 font-semibold cursor-pointer ${
          isJsonToCsv
            ? 'bg-linear-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-600/35 border-transparent hover:from-purple-500 hover:to-purple-600'
            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
        }`}
      >
        <FileJson className="size-4" />
        JSON → CSV
      </Button>

      <Button
        id="btn-swap-direction"
        size="icon"
        variant="outline"
        onClick={onSwap}
        title="Swap direction"
        className="rounded-full bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-transform hover:rotate-180 duration-300 shrink-0 cursor-pointer"
      >
        <ArrowLeftRight className="size-4" />
      </Button>

      <Button
        id="btn-direction-csv-to-json"
        onClick={() => onToggle('csv-to-json')}
        size="lg"
        variant={!isJsonToCsv ? 'default' : 'outline'}
        className={`gap-2 transition-all duration-300 font-semibold cursor-pointer ${
          !isJsonToCsv
            ? 'bg-linear-to-r from-cyan-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/25 border-transparent hover:from-cyan-500 hover:to-cyan-400'
            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
        }`}
      >
        <FileSpreadsheet className="size-4" />
        CSV → JSON
      </Button>
    </div>
  )
}
