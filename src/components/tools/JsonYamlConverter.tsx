'use client'

import React, { useState, useRef } from 'react'
import { toast } from 'sonner'
import {
  ArrowLeftRight,
  Copy,
  Download,
  Trash2,
  Check,
  FileCode,
  Sparkles,
  Zap,
  ShieldCheck,
  Settings2,
} from 'lucide-react'
import AdSense from '@/components/AdSense'
import { ADS_CONFIG } from '@/config/ads'

import {
  jsonToYaml,
  yamlToJson,
  type YamlConversionResult,
} from '@/utils/yamlConverter'
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

type Direction = 'json-to-yaml' | 'yaml-to-json'
type InputMode = 'text' | 'file'

const EXAMPLE_JSON = `{
  "server": {
    "host": "localhost",
    "port": 8080,
    "ssl": true
  },
  "database": {
    "provider": "postgresql",
    "connection": {
      "host": "db.internal",
      "port": 5432,
      "user": "postgres"
    }
  },
  "features": ["auth", "analytics", "cache"],
  "environment": "production"
}`

const EXAMPLE_YAML = `server:
  host: localhost
  port: 8080
  ssl: true
database:
  provider: postgresql
  connection:
    host: db.internal
    port: 5432
    user: postgres
features:
  - auth
  - analytics
  - cache
environment: production`

export default function JsonYamlConverter() {
  const [direction, setDirection] = useState<Direction>('json-to-yaml')
  const [inputMode, setInputMode] = useState<InputMode>('text')
  const [inputText, setInputText] = useState('')
  const [indentSpaces, setIndentSpaces] = useState<number>(2)
  const [sortKeys, setSortKeys] = useState<boolean>(false)
  const [result, setResult] = useState<YamlConversionResult | null>(null)
  const [copied, setCopied] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text')

  const outputRef = useRef<HTMLDivElement>(null)

  const isJsonToYaml = direction === 'json-to-yaml'

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
        const res =
          dir === 'json-to-yaml'
            ? jsonToYaml(text, { indent: indentSpaces, sortKeys })
            : yamlToJson(text, { indent: indentSpaces })

        setResult(res)
        toast.success('Conversion successful', {
          description: `${res.lineCount} lines · ${res.charCount} characters`,
        })

        setTimeout(() => {
          outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
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
      toast.error('Input is empty', {
        description: `Please enter or paste some ${isJsonToYaml ? 'JSON' : 'YAML'}.`,
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
    setInputText(isJsonToYaml ? EXAMPLE_JSON : EXAMPLE_YAML)
    setResult(null)
    toast.success('Example loaded', { description: 'Click Convert to see the output.' })
  }

  const handleCopy = async () => {
    if (!result?.output) return
    await navigator.clipboard.writeText(result.output)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!result?.output) return
    const ext = isJsonToYaml ? 'yaml' : 'json'
    const mime = isJsonToYaml ? 'text/yaml;charset=utf-8;' : 'application/json'
    const blob = new Blob([result.output], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `converted.${ext}`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Downloaded converted.${ext}`)
  }

  const handleClear = () => {
    setInputText('')
    setResult(null)
    toast.info('Cleared')
  }

  const handleSwap = () => {
    const next: Direction = isJsonToYaml ? 'yaml-to-json' : 'json-to-yaml'
    handleDirectionToggle(next)
    toast.info(`Switched to ${next === 'json-to-yaml' ? 'JSON → YAML' : 'YAML → JSON'}`)
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* ── Header ── */}
      <ToolHeader
        title={isJsonToYaml ? 'JSON → YAML Converter' : 'YAML → JSON Converter'}
        description={
          isJsonToYaml
            ? 'Convert JSON data or config files to clean, formatted YAML instantly in your browser.'
            : 'Convert YAML configuration files back to structured JSON with instant formatting.'
        }
        badgeText="Instant Online Converter"
      />

      {/* ── Privacy Banner ── */}
      <PrivacyBanner />

      {/* ── Direction Toggle ── */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <Button
          variant={isJsonToYaml ? 'default' : 'outline'}
          onClick={() => handleDirectionToggle('json-to-yaml')}
          className={`gap-2 font-medium transition-all ${isJsonToYaml
              ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/25'
              : 'border-purple-500/30 text-slate-300 hover:text-white hover:border-purple-500/60'
            }`}
        >
          <FileCode className="size-4" />
          JSON → YAML
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleSwap}
          title="Swap conversion direction"
          className="size-10 border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 transition-all rounded-full"
        >
          <ArrowLeftRight className="size-4" />
        </Button>

        <Button
          variant={!isJsonToYaml ? 'default' : 'outline'}
          onClick={() => handleDirectionToggle('yaml-to-json')}
          className={`gap-2 font-medium transition-all ${!isJsonToYaml
              ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/25'
              : 'border-purple-500/30 text-slate-300 hover:text-white hover:border-purple-500/60'
            }`}
        >
          <FileCode className="size-4" />
          YAML → JSON
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
                className={`px-5 py-2 rounded-lg transition-all ${activeTab === 'text'
                    ? 'bg-white text-zinc-900 font-semibold shadow-md'
                    : 'text-slate-400 hover:text-white'
                  }`}
                onClick={() => setActiveTab('text')}
              >
                ✏️ Paste Text
              </TabsTrigger>
              <TabsTrigger
                value="file"
                className={`px-5 py-2 rounded-lg transition-all ${activeTab === 'file'
                    ? 'bg-white text-zinc-900 font-semibold shadow-md'
                    : 'text-slate-400 hover:text-white'
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
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {isJsonToYaml ? 'JSON' : 'YAML'} Input
                </Label>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={handleLoadExample}
                  className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20 hover:text-cyan-300 transition-all"
                >
                  Load Example
                </Button>
              </div>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isJsonToYaml
                    ? '{\n  "name": "devkit",\n  "version": "1.0.0"\n}'
                    : 'name: devkit\nversion: 1.0.0'
                }
                className="h-64 font-mono text-sm resize-y leading-relaxed bg-black/35 text-slate-100 border border-[rgba(124,58,237,0.25)]"
                spellCheck={false}
              />
            </div>
          ) : (
            <FileDropZone
              onFileContent={handleFileContent}
              fileType={isJsonToYaml ? 'json' : 'yaml'}
            />
          )}


          {/* Options & Action Row */}
          <div className="my-6 p-4 rounded-2xl bg-black/25 border border-white/5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <Settings2 className="size-4 text-purple-400" />
                <Label className="text-xs text-slate-400">Indent Spaces:</Label>
                <Select
                  value={String(indentSpaces)}
                  onValueChange={(val) => setIndentSpaces(Number(val))}
                >
                  <SelectTrigger className="w-24 h-8 bg-black/40 border-purple-500/30 text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 spaces</SelectItem>
                    <SelectItem value="4">4 spaces</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isJsonToYaml && (
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-slate-200 transition-colors">
                  <input
                    type="checkbox"
                    checked={sortKeys}
                    onChange={(e) => setSortKeys(e.target.checked)}
                    className="rounded border-purple-500/30 bg-black/40 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Alphabetize keys</span>
                </label>
              )}
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

              <Button
                onClick={handleConvert}
                disabled={isConverting}
                className="bg-linear-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold shadow-lg shadow-purple-600/20 px-6"
              >
                <Sparkles className="size-4 mr-2" />
                {isConverting ? 'Converting...' : 'Convert'}
              </Button>
            </div>
          </div>

          {/* Output Section */}
          <div ref={outputRef} className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {isJsonToYaml ? 'YAML' : 'JSON'} Output
              </Label>

              {result && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-300">
                    {result.lineCount} lines
                  </Badge>
                  <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-300">
                    {result.charCount} chars
                  </Badge>
                </div>
              )}
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-[rgba(124,58,237,0.25)] bg-black/45">
              <Textarea
                readOnly
                value={result?.output ?? ''}
                placeholder={
                  result
                    ? ''
                    : `Converted ${isJsonToYaml ? 'YAML' : 'JSON'} output will appear here...`
                }
                className="h-64 font-mono text-sm resize-y leading-relaxed text-emerald-300 bg-transparent border-0 focus-visible:ring-0"
                spellCheck={false}
              />

              {result?.output && (
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
                    className="h-8 text-xs bg-purple-600 hover:bg-purple-500 text-white"
                  >
                    <Download className="size-3.5 mr-1" />
                    Download
                  </Button>
                </div>
              )}
            </div>
          </div>
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
