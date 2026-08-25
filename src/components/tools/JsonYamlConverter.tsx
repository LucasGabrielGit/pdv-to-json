'use client'

import AdSense from '@/components/AdSense'
import { ADS_CONFIG } from '@/config/ads'
import {
  ArrowLeftRight,
  Check,
  Copy,
  Download,
  FileCode,
  Settings2,
  Sparkles,
  Trash2
} from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

import FileDropZone from '@/components/FileDropZone'
import { ToolHeader } from '@/components/converter/ToolHeader'
import {
  jsonToYaml,
  yamlToJson,
  type YamlConversionResult,
} from '@/utils/yamlConverter'

import { PrivacyBanner } from '@/components/converter/PrivacyBanner'
import CodeEditor from '@/components/CodeEditor'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'


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
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
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

      {/* ── Top Controls & Options Bar ── */}
      <Card className="rounded-3xl shadow-xl border border-purple-500/25 bg-[#16213e] mb-6">
        <CardContent className="p-4 md:p-5 flex flex-wrap items-center justify-between gap-4">
          {/* Direction Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant={isJsonToYaml ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleDirectionToggle('json-to-yaml')}
              className={`gap-1.5 text-xs font-semibold transition-all ${
                isJsonToYaml
                  ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/25'
                  : 'border-purple-500/30 text-slate-300 hover:text-white'
              }`}
            >
              <FileCode className="size-3.5" />
              JSON → YAML
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleSwap}
              title="Swap conversion direction"
              className="size-8 border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 transition-all rounded-full"
            >
              <ArrowLeftRight className="size-3.5" />
            </Button>

            <Button
              variant={!isJsonToYaml ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleDirectionToggle('yaml-to-json')}
              className={`gap-1.5 text-xs font-semibold transition-all ${
                !isJsonToYaml
                  ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/25'
                  : 'border-purple-500/30 text-slate-300 hover:text-white'
              }`}
            >
              <FileCode className="size-3.5" />
              YAML → JSON
            </Button>
          </div>

          {/* Options */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <Settings2 className="size-3.5 text-purple-400" />
              <span className="text-slate-400">Indent:</span>
              <Select
                value={String(indentSpaces)}
                onValueChange={(val) => setIndentSpaces(Number(val))}
              >
                <SelectTrigger className="w-20 h-7 text-xs bg-black/40 border-purple-500/30 text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#16213e] border-purple-500/30 text-white text-xs">
                  <SelectItem value="2">2 spaces</SelectItem>
                  <SelectItem value="4">4 spaces</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isJsonToYaml && (
              <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer hover:text-slate-200 transition-colors">
                <input
                  type="checkbox"
                  checked={sortKeys}
                  onChange={(e) => setSortKeys(e.target.checked)}
                  className="rounded border-purple-500/30 bg-black/40 text-purple-600 focus:ring-purple-500 size-3.5"
                />
                <span>Sort keys</span>
              </label>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 ml-auto">
            <Button
              size="xs"
              variant="outline"
              onClick={handleLoadExample}
              className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20 text-xs"
            >
              <Sparkles className="size-3 mr-1" /> Example
            </Button>

            <Button
              variant="ghost"
              size="xs"
              onClick={handleClear}
              disabled={!inputText && !result}
              className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs"
            >
              <Trash2 className="size-3 mr-1" /> Clear
            </Button>

            <Button
              size="sm"
              onClick={handleConvert}
              disabled={isConverting}
              className="bg-linear-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold text-xs px-4 h-8 gap-1.5 shadow-md shadow-purple-600/25"
            >
              <Sparkles className="size-3.5" />
              {isConverting ? 'Converting...' : 'Convert'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Side-by-Side Editor & Output Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Editor */}
        <div className="space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <FileCode className="size-3.5 text-purple-400" />
                {isJsonToYaml ? 'JSON Input' : 'YAML Input'}
              </Label>
              <Badge variant="outline" className="text-[10px] border-white/10 text-slate-400 font-mono">
                {inputText.length} chars
              </Badge>
            </div>

            <div className="flex items-center gap-1">
              <Button
                size="xs"
                variant={inputMode === 'text' ? 'secondary' : 'ghost'}
                onClick={() => setInputMode('text')}
                className="text-[11px] h-6 px-2"
              >
                Editor
              </Button>
              <Button
                size="xs"
                variant={inputMode === 'file' ? 'secondary' : 'ghost'}
                onClick={() => setInputMode('file')}
                className="text-[11px] h-6 px-2"
              >
                Upload File
              </Button>
            </div>
          </div>

          {inputMode === 'text' ? (
            <CodeEditor
              value={inputText}
              onChange={(val) => setInputText(val || '')}
              language={isJsonToYaml ? 'json' : 'yaml'}
              placeholder={
                isJsonToYaml
                  ? '{\n  "name": "dev-kit",\n  "version": "1.0.0",\n  "active": true\n}'
                  : 'name: dev-kit\nversion: 1.0.0\nactive: true'
              }
              height="500px"
            />
          ) : (
            <div className="h-[500px] rounded-2xl border border-purple-500/30 bg-black/40 p-4 flex flex-col justify-center">
              <FileDropZone
                onFileContent={handleFileContent}
                fileType={isJsonToYaml ? 'json' : 'yaml'}
              />
            </div>
          )}
        </div>

        {/* Right: Output Converted Result */}
        <div className="space-y-3 flex flex-col" ref={outputRef}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Check className="size-3.5 text-emerald-400" />
                {isJsonToYaml ? 'YAML Output' : 'JSON Output'}
              </Label>
              {result && (
                <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-300 font-mono">
                  {result.lineCount} lines • {result.charCount} chars
                </Badge>
              )}
            </div>

            {result?.output && (
              <div className="flex items-center gap-1.5">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={handleCopy}
                  className="h-6 text-xs border-purple-500/30 text-slate-200 hover:text-white"
                >
                  {copied ? <Check className="size-3 mr-1 text-emerald-400" /> : <Copy className="size-3 mr-1" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
                <Button
                  size="xs"
                  onClick={handleDownload}
                  className="h-6 text-xs bg-purple-600 hover:bg-purple-500 text-white font-semibold"
                >
                  <Download className="size-3 mr-1" />
                  Download
                </Button>
              </div>
            )}
          </div>

          <CodeEditor
            value={result?.output ?? ''}
            language={isJsonToYaml ? 'yaml' : 'json'}
            readOnly
            height="500px"
          />
        </div>
      </div>

      <Separator className="my-8 bg-purple-500/20" />

      {/* AdSense Placement */}
      <AdSense
        slot={ADS_CONFIG.slots.betweenIO}
        format="auto"
        className="rounded-xl overflow-hidden mb-4"
      />
    </div>
  )
}

