import React, { useState } from 'react'
import { toast } from 'sonner'
import { ArrowLeftRight, Clipboard, ClipboardCheck, Download, Eraser, Zap, FileJson, FileSpreadsheet } from 'lucide-react'
import AdSense from '@/components/AdSense'
import { ADS_CONFIG } from '@/config/ads'

import { jsonToCsv, type ConversionResult } from '../utils/jsonToCsv'
import { csvToJson, type CsvConversionResult } from '../utils/csvToJson'
import FileDropZone from './FileDropZone'
import StatsBar from './StatsBar'

import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type InputMode = 'text' | 'file'
type Direction = 'json-to-csv' | 'csv-to-json'

const EXAMPLE_JSON = `[
  {
    "id": 1,
    "name": "Alice",
    "role": "Engineer",
    "address": {
      "city": "São Paulo",
      "country": "Brazil"
    }
  },
  {
    "id": 2,
    "name": "Bob",
    "role": "Designer",
    "address": {
      "city": "Rio de Janeiro",
      "country": "Brazil"
    }
  }
]`

const EXAMPLE_CSV = `id,name,role,address.city,address.country
1,Alice,Engineer,São Paulo,Brazil
2,Bob,Designer,Rio de Janeiro,Brazil`

const Converter: React.FC = () => {
  const [direction, setDirection] = useState<Direction>('json-to-csv')
  const [inputMode, setInputMode] = useState<InputMode>('text')
  const [inputText, setInputText] = useState('')
  const [delimiter, setDelimiter] = useState(',')
  const [expandNested, setExpandNested] = useState(true)
  const [castTypes, setCastTypes] = useState(true)
  const [result, setResult] = useState<ConversionResult | CsvConversionResult | null>(null)
  const [copied, setCopied] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text')

  const isJsonToCsv = direction === 'json-to-csv'

  const outputText = result
    ? isJsonToCsv
      ? (result as ConversionResult).csv
      : (result as CsvConversionResult).json
    : ''

  const rowCount = result ? result.rowCount : 0
  const columnCount = result ? result.columnCount : 0
  const headers = result ? result.headers ?? [] : []

  const handleDirectionToggle = (newDir: Direction) => {
    setDirection(newDir)
    setInputText('')
    setResult(null)
    setInputMode('text')
    setActiveTab('text')
  }

  const convert = (text: string, dir: Direction = direction) => {
    setResult(null)
    setIsConverting(true)

    setTimeout(() => {
      try {
        const res = dir === 'json-to-csv'
          ? jsonToCsv(text, delimiter)
          : csvToJson(text, { delimiter, expandNested, castTypes })

        setResult(res)
        toast.success('Conversion successful', {
          description: `${res.rowCount} rows · ${res.columnCount} columns`,
        })
      } catch (e) {
        toast.error('Conversion failed', {
          description: (e as Error).message,
          duration: 6000,
        })
      } finally {
        setIsConverting(false)
      }
    }, 50)
  }

  const handleConvert = () => {
    if (!inputText.trim()) {
      toast.warning('Input is empty', {
        description: `Please enter or paste some ${isJsonToCsv ? 'JSON' : 'CSV'}.`,
      })
      return
    }
    convert(inputText)
  }

  const handleFileContent = (content: string) => {
    setInputText(content)
    setInputMode('text')
    convert(content, direction)
  }

  const handleLoadExample = () => {
    setInputText(isJsonToCsv ? EXAMPLE_JSON : EXAMPLE_CSV)
    setResult(null)
    toast.info('Example loaded', { description: 'Press Convert to see the output.' })
  }

  const handleCopy = async () => {
    if (!outputText) return
    await navigator.clipboard.writeText(outputText)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!outputText) return
    const ext = isJsonToCsv ? 'csv' : 'json'
    const mime = isJsonToCsv ? 'text/csv;charset=utf-8;' : 'application/json'
    const blob = new Blob([outputText], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `output.${ext}`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Downloaded output.${ext}`)
  }

  const handleClear = () => {
    setInputText('')
    setResult(null)
    toast.info('Cleared')
  }

  const handleSwap = () => {
    const next: Direction = isJsonToCsv ? 'csv-to-json' : 'json-to-csv'
    handleDirectionToggle(next)
    toast.info(`Switched to ${next === 'json-to-csv' ? 'JSON → CSV' : 'CSV → JSON'}`)
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">

      {/* ── Header ── */}
      <div className="text-center mb-10">
        <Badge
          variant="outline"
          className="mb-4 gap-1.5 border-purple-500/40 bg-purple-500/10 text-purple-400"
        >
          <Zap className="size-3" />
          Instant Conversion
        </Badge>

        <h1
          className="text-5xl font-black mb-3 tracking-tight"
          style={{
            background: 'linear-gradient(135deg, #f1f5f9 0%, #7c3aed 50%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {isJsonToCsv ? 'JSON → CSV' : 'CSV → JSON'}
        </h1>
        <p className="text-base max-w-md mx-auto" style={{ color: 'var(--app-muted)' }}>
          {isJsonToCsv
            ? 'Convert JSON to clean CSV — with nested object flattening.'
            : 'Convert CSV back to structured JSON — with type casting and nesting.'}
        </p>
      </div>

      {/* ── Direction Toggle ── */}
      <div className="flex justify-center items-center gap-3 mb-8">
        <Button
          id="btn-direction-json-to-csv"
          onClick={() => handleDirectionToggle('json-to-csv')}
          size="lg"
          className="gap-2 transition-all duration-300"
          style={{
            background: isJsonToCsv
              ? 'linear-gradient(135deg, #7c3aed, #9333ea)'
              : 'rgba(255,255,255,0.05)',
            color: isJsonToCsv ? '#fff' : 'var(--app-muted)',
            border: isJsonToCsv ? 'none' : '1px solid rgba(255,255,255,0.1)',
            boxShadow: isJsonToCsv ? '0 4px 20px rgba(124,58,237,0.35)' : 'none',
          }}
        >
          <FileJson className="size-4" />
          JSON → CSV
        </Button>

        <Button
          id="btn-swap-direction"
          size="icon"
          onClick={handleSwap}
          title="Swap direction"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--app-muted)',
          }}
          className="rounded-full transition-transform hover:rotate-180 duration-300"
        >
          <ArrowLeftRight className="size-4" />
        </Button>

        <Button
          id="btn-direction-csv-to-json"
          onClick={() => handleDirectionToggle('csv-to-json')}
          size="lg"
          className="gap-2 transition-all duration-300"
          style={{
            background: !isJsonToCsv
              ? 'linear-gradient(135deg, #0891b2, #06b6d4)'
              : 'rgba(255,255,255,0.05)',
            color: !isJsonToCsv ? '#fff' : 'var(--app-muted)',
            border: !isJsonToCsv ? 'none' : '1px solid rgba(255,255,255,0.1)',
            boxShadow: !isJsonToCsv ? '0 4px 20px rgba(6,182,212,0.3)' : 'none',
          }}
        >
          <FileSpreadsheet className="size-4" />
          CSV → JSON
        </Button>
      </div>

      {/* ── Main Card ── */}
      <div
        className="rounded-3xl p-6 md:p-8 shadow-2xl"
        style={{
          background: 'var(--app-bg-card)',
          border: '1px solid var(--app-border)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.4), 0 0 60px rgba(124,58,237,0.04)',
        }}
      >
        {/* Input Mode Tabs */}
        <Tabs
          value={inputMode}
          onValueChange={(v) => setInputMode(v as InputMode)}
          className="mb-5"
        >
          <TabsList
            className="h-auto gap-1 p-1 rounded-xl"
            style={{ background: 'rgba(0,0,0,0.3)' }}
          >
            <TabsTrigger
              id="tab-text"
              value="text"
              className={`px-5 py-2 rounded-lg data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-md ${activeTab === 'text' ? 'bg-violet-600' : ''
                }`}
              onClick={() => setActiveTab('text')}
            >
              ✏️ Paste Text
            </TabsTrigger>
            <TabsTrigger
              id="tab-file"
              value="file"
              className={`px-5 py-2 rounded-lg data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-md ${activeTab === 'file' ? 'bg-violet-900 text-white' : 'text-muted'
                }`}
              onClick={() => setActiveTab('file')}
            >
              📁 Upload File
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Input Area */}
        {inputMode === 'text' ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--app-muted)' }}>
                {isJsonToCsv ? 'JSON' : 'CSV'} Input
              </Label>
              <Button
                id="btn-example"
                size="xs"
                onClick={handleLoadExample}
                style={{
                  background: 'rgba(6,182,212,0.1)',
                  color: 'var(--app-cyan)',
                  border: '1px solid rgba(6,182,212,0.2)',
                }}
              >
                Load Example
              </Button>
            </div>
            <Textarea
              id="input-area"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isJsonToCsv
                  ? '[\n  { "name": "Alice", "age": 30 },\n  { "name": "Bob", "age": 25 }\n]'
                  : 'name,age,city\nAlice,30,São Paulo\nBob,25,Rio de Janeiro'
              }
              className="h-64 font-mono text-sm resize-y leading-relaxed"
              style={{
                background: 'rgba(0,0,0,0.35)',
                color: 'var(--app-text)',
                border: '1px solid var(--app-border)',
              }}
              spellCheck={false}
            />
          </div>
        ) : (
          <FileDropZone
            onFileContent={handleFileContent}
            fileType={isJsonToCsv ? 'json' : 'csv'}
          />
        )}

        {/* Options Row */}
        <div className="flex flex-wrap gap-4 mt-5 items-center">
          <div className="flex items-center gap-2">
            <Label htmlFor="delimiter-select" style={{ color: 'var(--app-muted)' }}>
              Delimiter
            </Label>
            <Select value={delimiter} onValueChange={(v) => { if (v !== null) setDelimiter(v) }}>
              <SelectTrigger
                id="delimiter-select"
                className="w-36 text-sm text-zinc-50 bg-[#0f0f1a]/80"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='text-slate-200 bg-[#0f0f1a]/80'>
                <SelectItem value="," > , (comma)</SelectItem>
                <SelectItem value=";">; (semicolon)</SelectItem>
                <SelectItem value={'\t'}>⇥ (tab)</SelectItem>
                <SelectItem value="|">| (pipe)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* CSV→JSON options */}
          {!isJsonToCsv && (
            <div className="flex gap-4 items-center">
              <label
                id="toggle-nested"
                className="flex items-center gap-2 cursor-pointer select-none text-sm"
                style={{ color: expandNested ? 'var(--app-cyan)' : 'var(--app-muted)' }}
              >
                <input
                  type="checkbox"
                  checked={expandNested}
                  onChange={(e) => setExpandNested(e.target.checked)}
                  className="accent-cyan-400"
                />
                Expand nested
              </label>
              <label
                id="toggle-cast"
                className="flex items-center gap-2 cursor-pointer select-none text-sm"
                style={{ color: castTypes ? 'var(--app-cyan)' : 'var(--app-muted)' }}
              >
                <input
                  type="checkbox"
                  checked={castTypes}
                  onChange={(e) => setCastTypes(e.target.checked)}
                  className="accent-cyan-400"
                />
                Cast types
              </label>
            </div>
          )}

          <div className="flex gap-2 ml-auto">
            <Button
              id="btn-clear"
              size="sm"
              onClick={handleClear}
              disabled={inputText.length === 0}
              style={{
                background: 'rgba(239,68,68,0.08)',
                color: 'var(--app-error)',
                border: '1px solid rgba(239,68,68,0.2)',
              }}
            >
              <Eraser className="size-3.5" />
              Clear
            </Button>
            <Button
              id="btn-convert"
              size="sm"
              disabled={isConverting}
              onClick={handleConvert}
              className="gap-2 font-bold"
              style={{
                background: isConverting
                  ? 'rgba(124,58,237,0.4)'
                  : isJsonToCsv
                    ? 'linear-gradient(135deg, #7c3aed, #9333ea)'
                    : 'linear-gradient(135deg, #0891b2, #06b6d4)',
                color: '#fff',
                boxShadow: isConverting
                  ? 'none'
                  : isJsonToCsv
                    ? '0 4px 20px rgba(124,58,237,0.35)'
                    : '0 4px 20px rgba(6,182,212,0.3)',
                cursor: isConverting ? 'not-allowed' : 'pointer',
              }}
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

        {/* ── Output ── */}
        {result && outputText && (
          <>
            <Separator className="my-6" style={{ background: 'var(--app-border)' }} />

            {/* ── AdSense: between input and output ── */}
            <AdSense
              slot={ADS_CONFIG.slots.betweenIO}
              format="auto"
              className="rounded-xl overflow-hidden mb-4"
            />

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--app-muted)' }}>
                  {isJsonToCsv ? 'CSV' : 'JSON'} Output
                </Label>
                <div className="flex gap-2">
                  <Button
                    id="btn-copy"
                    size="xs"
                    onClick={handleCopy}
                    style={{
                      background: copied ? 'rgba(16,185,129,0.12)' : 'rgba(6,182,212,0.1)',
                      color: copied ? 'var(--app-success)' : 'var(--app-cyan)',
                      border: `1px solid ${copied ? 'rgba(16,185,129,0.25)' : 'rgba(6,182,212,0.2)'}`,
                    }}
                  >
                    {copied ? (
                      <><ClipboardCheck className="size-3" /> Copied!</>
                    ) : (
                      <><Clipboard className="size-3" /> Copy</>
                    )}
                  </Button>
                  <Button
                    id="btn-download"
                    size="xs"
                    onClick={handleDownload}
                    style={{
                      background: 'rgba(124,58,237,0.12)',
                      color: 'var(--app-accent)',
                      border: '1px solid rgba(124,58,237,0.25)',
                    }}
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
                className="h-52 font-mono text-sm resize-y leading-relaxed"
                style={{
                  background: 'rgba(0,0,0,0.35)',
                  color: isJsonToCsv ? 'var(--app-cyan)' : '#a3e635',
                  border: `1px solid ${isJsonToCsv ? 'rgba(6,182,212,0.2)' : 'rgba(163,230,53,0.2)'}`,
                }}
              />

              <StatsBar rowCount={rowCount} columnCount={columnCount} headers={headers} />
            </div>
          </>
        )}

        {result && !outputText && (
          <div
            className="mt-5 p-4 rounded-xl flex items-center gap-3"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)' }}
          >
            <span>⚠️</span>
            <p className="text-sm" style={{ color: 'var(--app-warning)' }}>
              The input was valid but contained no rows to convert.
            </p>
          </div>
        )}
      </div>

      {/* ── Feature pills ── */}
      <div className="flex flex-wrap justify-center gap-2 mt-8">
        {[
          '🔄 Bidirectional',
          '🗂️ Nested objects',
          '🔢 Type casting',
          '📁 File & text',
          '🔧 Custom delimiter',
          '⬇️ One-click download',
          '🔒 100% client-side',
        ].map((f) => (
          <Badge
            key={f}
            variant="outline"
            className="text-xs"
            style={{
              background: 'rgba(255,255,255,0.03)',
              color: 'var(--app-muted)',
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            {f}
          </Badge>
        ))}
      </div>
    </div>
  )
}

export default Converter
