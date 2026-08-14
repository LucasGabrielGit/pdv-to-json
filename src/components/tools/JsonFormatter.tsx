'use client'

import React, { useState, useRef } from 'react'
import { toast } from 'sonner'
import {
  FileJson,
  Copy,
  Download,
  Trash2,
  Check,
  Sparkles,
  Zap,
  ShieldCheck,
  Settings2,
  CheckCircle2,
  AlertTriangle,
  Wand2,
  Minimize2,
  Maximize2,
} from 'lucide-react'
import AdSense from '@/components/AdSense'
import { ADS_CONFIG } from '@/config/ads'

import {
  formatJson,
  repairJsonSyntax,
  formatBytes,
  type JsonFormattingResult,
} from '@/utils/jsonFormatter'
import FileDropZone from '@/components/FileDropZone'
import { ToolHeader } from '@/components/converter/ToolHeader'

import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PrivacyBanner } from '@/components/converter/PrivacyBanner'

type ActionMode = 'format' | 'minify'
type InputMode = 'text' | 'file'

const SAMPLE_CLEAN_JSON = `{
  "app": "dev-kit.tech",
  "version": "1.0.0",
  "privacy": {
    "clientSideOnly": true,
    "serverUploads": false
  },
  "features": ["json-csv", "json-yaml", "base64", "image-converter"],
  "stats": {
    "totalTools": 5,
    "activeUsers": 1250
  }
}`

const SAMPLE_INVALID_JSON = `{
  "name": "devkit",
  "active": true,
  "tools": ["json", "yaml", "base64",],
  "author": 'Lucas',
}`

export default function JsonFormatter() {
  const [actionMode, setActionMode] = useState<ActionMode>('format')
  const [inputMode, setInputMode] = useState<InputMode>('text')
  const [inputText, setInputText] = useState('')
  const [indentSpaces, setIndentSpaces] = useState<number | '\t'>(2)
  const [fixTrailingCommas, setFixTrailingCommas] = useState(false)
  const [liveMode, setLiveMode] = useState(true)
  const [result, setResult] = useState<JsonFormattingResult | null>(null)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text')

  const outputRef = useRef<HTMLDivElement>(null)

  const processJson = (
    text: string,
    mode: ActionMode = actionMode,
    indent: number | '\t' = indentSpaces,
    autoFix: boolean = fixTrailingCommas
  ) => {
    if (!text.trim()) {
      setResult(null)
      return
    }

    const res = formatJson(text, {
      indent,
      minify: mode === 'minify',
      fixTrailingCommas: autoFix,
    })

    setResult(res)
  }

  const handleInputChange = (val: string) => {
    setInputText(val)
    if (liveMode) {
      processJson(val)
    }
  }

  const handleActionModeChange = (newMode: ActionMode) => {
    setActionMode(newMode)
    if (inputText) {
      processJson(inputText, newMode)
    }
  }

  const handleRunAction = () => {
    if (!inputText.trim()) {
      toast.error('Input is empty', {
        description: 'Please paste or upload JSON content.',
      })
      return
    }
    processJson(inputText)
    if (result?.isValid) {
      toast.success(`JSON ${actionMode === 'minify' ? 'minified' : 'formatted'} successfully!`)
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } else {
      toast.error('JSON has syntax errors', {
        description: result?.error?.message,
      })
    }
  }

  const handleAutoRepair = () => {
    const repaired = repairJsonSyntax(inputText)
    setInputText(repaired)
    processJson(repaired, actionMode, indentSpaces, false)
    toast.success('Auto-repaired trailing commas and quotes!')
  }

  const handleFileContent = (content: string, filename: string) => {
    setInputText(content)
    setInputMode('text')
    processJson(content, actionMode)
    toast.success(`Uploaded ${filename}`)
  }

  const handleLoadSample = (sampleType: 'valid' | 'invalid') => {
    const sample = sampleType === 'valid' ? SAMPLE_CLEAN_JSON : SAMPLE_INVALID_JSON
    setInputText(sample)
    processJson(sample)
    toast.success(`Loaded ${sampleType === 'valid' ? 'Clean' : 'Invalid'} sample`)
  }

  const handleCopy = async () => {
    if (!result?.output) return
    await navigator.clipboard.writeText(result.output)
    setCopied(true)
    toast.success('Copied output to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!result?.output) return
    const blob = new Blob([result.output], { type: 'application/json;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = actionMode === 'minify' ? 'formatted.min.json' : 'formatted.json'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded formatted JSON!')
  }

  const handleClear = () => {
    setInputText('')
    setResult(null)
    toast.info('Cleared')
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* ── Header ── */}
      <ToolHeader
        title="JSON Formatter & Validator"
        description="Format, validate, minify, and fix JSON syntax errors in real-time with line & column diagnostic error checking."
        badgeText="Real-time Formatter"
      />

      {/* ── Privacy Banner ── */}
      <PrivacyBanner />

      {/* ── Action Mode Toggle ── */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <Button
          variant={actionMode === 'format' ? 'default' : 'outline'}
          onClick={() => handleActionModeChange('format')}
          className={`gap-2 font-medium transition-all ${
            actionMode === 'format'
              ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/25'
              : 'border-purple-500/30 text-slate-300 hover:text-white hover:border-purple-500/60'
          }`}
        >
          <Maximize2 className="size-4" />
          Format (Pretty Print)
        </Button>

        <Button
          variant={actionMode === 'minify' ? 'default' : 'outline'}
          onClick={() => handleActionModeChange('minify')}
          className={`gap-2 font-medium transition-all ${
            actionMode === 'minify'
              ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/25'
              : 'border-purple-500/30 text-slate-300 hover:text-white hover:border-purple-500/60'
          }`}
        >
          <Minimize2 className="size-4" />
          Minify (Compress)
        </Button>
      </div>

      {/* ── Main Card ── */}
      <Card
        className="rounded-3xl shadow-2xl overflow-hidden border border-[rgba(124,58,237,0.25)] bg-[#16213e]"
        style={{
          boxShadow: '0 25px 60px rgba(0,0,0,0.4), 0 0 60px rgba(124,58,237,0.04)',
        }}
      >
        <CardContent className="p-6 md:p-8">
          {/* Input Mode Tabs */}
          <Tabs
            value={inputMode}
            onValueChange={(v) => setInputMode(v as InputMode)}
            className="mb-5"
          >
            <TabsList className="h-auto gap-1 p-1 rounded-xl bg-black/30 border border-white/5">
              <TabsTrigger
                value="text"
                className={`px-5 py-2 rounded-lg transition-all ${
                  activeTab === 'text'
                    ? 'bg-white text-zinc-900 font-semibold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                onClick={() => setActiveTab('text')}
              >
                ✏️ Paste Text
              </TabsTrigger>
              <TabsTrigger
                value="file"
                className={`px-5 py-2 rounded-lg transition-all ${
                  activeTab === 'file'
                    ? 'bg-white text-zinc-900 font-semibold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                onClick={() => setActiveTab('file')}
              >
                📁 Upload JSON File
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Input Area */}
          {inputMode === 'text' ? (
            <div className="space-y-2">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  JSON Input
                </Label>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 mr-1 hidden sm:inline">Samples:</span>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => handleLoadSample('valid')}
                    className="bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20 transition-all text-[11px]"
                  >
                    📄 Clean JSON
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => handleLoadSample('invalid')}
                    className="bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20 transition-all text-[11px]"
                  >
                    ⚠️ Invalid JSON (Test Error)
                  </Button>
                </div>
              </div>

              <Textarea
                value={inputText}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={'{\n  "name": "devkit",\n  "version": "1.0.0"\n}'}
                className="h-56 font-mono text-sm resize-y leading-relaxed bg-black/35 text-slate-100 border border-[rgba(124,58,237,0.25)]"
                spellCheck={false}
              />
            </div>
          ) : (
            <FileDropZone
              fileType="json"
              readAsDataURL={false}
              onFileContent={handleFileContent}
            />
          )}

          {/* Options & Action Controls Bar */}
          <div className="my-6 p-4 rounded-2xl bg-black/25 border border-white/5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
              {actionMode === 'format' && (
                <div className="flex items-center gap-2">
                  <Settings2 className="size-4 text-purple-400" />
                  <Label className="text-xs text-slate-400">Indentation:</Label>
                  <Select
                    value={String(indentSpaces)}
                    onValueChange={(val) => {
                      const newIndent = val === 'tab' ? '\t' : Number(val)
                      setIndentSpaces(newIndent)
                      if (liveMode && inputText) processJson(inputText, actionMode, newIndent)
                    }}
                  >
                    <SelectTrigger className="w-28 h-8 bg-black/40 border-purple-500/30 text-slate-200 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 spaces</SelectItem>
                      <SelectItem value="4">4 spaces</SelectItem>
                      <SelectItem value="tab">Tab</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={fixTrailingCommas}
                  onChange={(e) => {
                    setFixTrailingCommas(e.target.checked)
                    if (liveMode && inputText) processJson(inputText, actionMode, indentSpaces, e.target.checked)
                  }}
                  className="rounded border-purple-500/30 bg-black/40 text-purple-600 focus:ring-purple-500"
                />
                <span>Auto-fix trailing commas & quotes</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={liveMode}
                  onChange={(e) => setLiveMode(e.target.checked)}
                  className="rounded border-purple-500/30 bg-black/40 text-purple-600 focus:ring-purple-500"
                />
                <span>Real-time validation</span>
              </label>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={!inputText && !result}
                className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="size-4 mr-1.5" />
                Clear
              </Button>

              {!liveMode && (
                <Button
                  onClick={handleRunAction}
                  className="bg-linear-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold shadow-lg shadow-purple-600/20 px-6"
                >
                  <Sparkles className="size-4 mr-2" />
                  {actionMode === 'minify' ? 'Minify' : 'Format'}
                </Button>
              )}
            </div>
          </div>

          {/* Validation Status Indicator */}
          {result && inputText.trim() && (
            <div className="mb-4">
              {result.isValid ? (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 text-emerald-400 text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                    <span>Valid JSON Syntax</span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-300 font-mono">
                    <span>{result.keyCount} Keys</span>
                    <span>·</span>
                    <span>Depth: {result.maxDepth}</span>
                    <span>·</span>
                    <span>{formatBytes(result.byteSize)}</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 text-rose-300 text-xs">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="size-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-rose-400">Syntax Error</p>
                      <p className="text-rose-300/90 mt-0.5">{result.error?.message}</p>
                      {result.error?.line && (
                        <p className="text-slate-400 font-mono mt-1 text-[11px]">
                          Location: Line {result.error.line}
                          {result.error.column && `, Column ${result.error.column}`}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    size="xs"
                    onClick={handleAutoRepair}
                    className="gap-1.5 bg-rose-600 hover:bg-rose-500 text-white shrink-0 font-medium self-end md:self-auto"
                  >
                    <Wand2 className="size-3.5" />
                    Auto-Fix Trailing Commas
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Output Section */}
          {result?.isValid && result.output && (
            <div ref={outputRef} className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {actionMode === 'minify' ? 'Minified Output' : 'Formatted Output'}
                </Label>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-300 font-mono">
                    {result.lineCount} lines
                  </Badge>
                  <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-300 font-mono">
                    {result.charCount.toLocaleString()} chars
                  </Badge>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-[rgba(124,58,237,0.25)] bg-black/45">
                <Textarea
                  readOnly
                  value={result.output}
                  className="h-64 font-mono text-sm resize-y leading-relaxed text-emerald-300 bg-transparent border-0 focus-visible:ring-0"
                  spellCheck={false}
                />

                <div className="absolute top-3 right-3 flex items-center gap-2 bg-[#16213e]/90 p-1.5 rounded-xl border border-white/10 backdrop-blur-md">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopy}
                    className="h-8 text-xs text-slate-300 hover:text-white hover:bg-white/10"
                  >
                    {copied ? (
                      <Check className="size-3.5 mr-1 text-emerald-400" />
                    ) : (
                      <Copy className="size-3.5 mr-1" />
                    )}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>

                  <Button
                    size="sm"
                    onClick={handleDownload}
                    className="h-8 text-xs bg-purple-600 hover:bg-purple-500 text-white font-semibold"
                  >
                    <Download className="size-3.5 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator className="my-8 bg-[rgba(124,58,237,0.25)]" />

      {/* AdSense Placement */}
      <AdSense
        slot={ADS_CONFIG.slots.betweenIO}
        format="auto"
        className="rounded-xl overflow-hidden mb-4"
      />
    </div>
  )
}
