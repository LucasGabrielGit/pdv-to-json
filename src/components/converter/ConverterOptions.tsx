import React from 'react'
import { Eraser, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ConverterOptionsProps {
  isJsonToCsv: boolean
  delimiter: string
  setDelimiter: (val: string) => void
  expandNested: boolean
  setExpandNested: (val: boolean) => void
  castTypes: boolean
  setCastTypes: (val: boolean) => void
  inputTextLength: number
  isConverting: boolean
  onClear: () => void
  onConvert: () => void
}

export const ConverterOptions: React.FC<ConverterOptionsProps> = ({
  isJsonToCsv,
  delimiter,
  setDelimiter,
  expandNested,
  setExpandNested,
  castTypes,
  setCastTypes,
  inputTextLength,
  isConverting,
  onClear,
  onConvert,
}) => {
  return (
    <div className="flex flex-wrap gap-4 mt-5 items-center justify-between">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Label htmlFor="delimiter-select" className="text-sm text-slate-400 font-normal">
            Delimiter
          </Label>
          <Select
            value={delimiter}
            onValueChange={(v) => {
              if (v !== null) setDelimiter(v)
            }}
          >
            <SelectTrigger
              id="delimiter-select"
              className="w-36 text-sm text-slate-200 bg-black/30 border-white/10"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a2e] border-[rgba(124,58,237,0.3)] text-slate-200">
              <SelectItem value=",">, (comma)</SelectItem>
              <SelectItem value=";">; (semicolon)</SelectItem>
              <SelectItem value={'\t'}>⇥ (tab)</SelectItem>
              <SelectItem value="|">| (pipe)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!isJsonToCsv && (
          <div className="flex gap-4 items-center">
            <label
              id="toggle-nested"
              className={`flex items-center gap-2 cursor-pointer select-none text-sm transition-colors ${
                expandNested ? 'text-cyan-400 font-medium' : 'text-slate-400'
              }`}
            >
              <input
                type="checkbox"
                checked={expandNested}
                onChange={(e) => setExpandNested(e.target.checked)}
                className="accent-cyan-400 rounded size-4"
              />
              Expand nested
            </label>
            <label
              id="toggle-cast"
              className={`flex items-center gap-2 cursor-pointer select-none text-sm transition-colors ${
                castTypes ? 'text-cyan-400 font-medium' : 'text-slate-400'
              }`}
            >
              <input
                type="checkbox"
                checked={castTypes}
                onChange={(e) => setCastTypes(e.target.checked)}
                className="accent-cyan-400 rounded size-4"
              />
              Cast types
            </label>
          </div>
        )}
      </div>

      <div className="flex gap-2 ml-auto">
        <Button
          id="btn-clear"
          size="sm"
          variant="outline"
          onClick={onClear}
          disabled={inputTextLength === 0}
          className="gap-1.5 border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all cursor-pointer"
        >
          <Eraser className="size-3.5" />
          Clear
        </Button>
        <Button
          id="btn-convert"
          size="sm"
          disabled={isConverting}
          onClick={onConvert}
          className={`gap-2 font-bold shadow-md transition-all cursor-pointer ${
            isConverting
              ? 'opacity-60 cursor-not-allowed bg-purple-600/40 text-white'
              : isJsonToCsv
              ? 'bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-purple-600/35 border-none'
              : 'bg-linear-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white shadow-cyan-500/25 border-none'
          }`}
        >
          {isConverting ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Converting…
            </>
          ) : (
            <>
              <Zap className="size-3.5" />
              Convert
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
