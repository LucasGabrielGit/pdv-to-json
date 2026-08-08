import React from 'react'
import { Clipboard, ClipboardCheck, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import StatsBar from '../StatsBar'
import type { ConversionResult } from '../../utils/jsonToCsv'
import type { CsvConversionResult } from '../../utils/csvToJson'

interface OutputSectionProps {
  outputRef: React.RefObject<HTMLDivElement | null>
  isJsonToCsv: boolean
  result: ConversionResult | CsvConversionResult | null
  outputText: string
  copied: boolean
  onCopy: () => void
  onDownload: () => void
  rowCount: number
  columnCount: number
  headers: string[]
}

export const OutputSection: React.FC<OutputSectionProps> = ({
  outputRef,
  isJsonToCsv,
  result,
  outputText,
  copied,
  onCopy,
  onDownload,
  rowCount,
  columnCount,
  headers,
}) => {
  if (!result) return null

  if (result && !outputText) {
    return (
      <div className="mt-5 p-4 rounded-xl flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 text-amber-400">
        <span>⚠️</span>
        <p className="text-sm font-medium">
          The input was valid but contained no rows to convert.
        </p>
      </div>
    )
  }

  return (
    <div ref={outputRef} className="space-y-2 mt-6 pt-6 border-t border-[rgba(124,58,237,0.25)] scroll-mt-6">
      <div className="flex justify-between items-center my-3">
        <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {isJsonToCsv ? 'CSV' : 'JSON'} Output
        </Label>
        <div className="flex gap-2">
          <Button
            id="btn-copy"
            size="xs"
            variant="outline"
            onClick={onCopy}
            className={`gap-1.5 transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25 hover:text-emerald-300'
                : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20 hover:text-cyan-300'
            }`}
          >
            {copied ? (
              <>
                <ClipboardCheck className="size-3" /> Copied!
              </>
            ) : (
              <>
                <Clipboard className="size-3" /> Copy
              </>
            )}
          </Button>
          <Button
            id="btn-download"
            size="xs"
            variant="outline"
            onClick={onDownload}
            className="gap-1.5 bg-purple-500/10 text-purple-400 border-purple-500/25 hover:bg-purple-500/20 hover:text-purple-300 transition-all cursor-pointer"
          >
            <Download className="size-3" />
            Download .{isJsonToCsv ? 'csv' : 'json'}
          </Button>
        </div>
      </div>

      <Textarea
        id="output-area"
        readOnly
        value={outputText}
        className={`h-52 font-mono text-sm resize-y leading-relaxed bg-black/35 ${
          isJsonToCsv ? 'text-cyan-400 border border-cyan-500/20' : 'text-lime-400 border border-lime-500/20'
        }`}
      />

      <StatsBar rowCount={rowCount} columnCount={columnCount} headers={headers} />
    </div>
  )
}
