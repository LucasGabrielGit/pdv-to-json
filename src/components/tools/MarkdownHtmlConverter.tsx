'use client'

import React, { useState, useRef } from 'react'
import { toast } from 'sonner'
import {
  ArrowLeftRight,
  Copy,
  Download,
  Trash2,
  Check,
  FileText,
  Sparkles,
  Zap,
  ShieldCheck,
  Settings2,
  Eye,
  Code2,
} from 'lucide-react'
import AdSense from '@/components/AdSense'
import { ADS_CONFIG } from '@/config/ads'

import {
  markdownToHtml,
  htmlToMarkdown,
  type MarkdownConversionResult,
} from '@/utils/markdownConverter'
import FileDropZone from '@/components/FileDropZone'
import { ToolHeader } from '@/components/converter/ToolHeader'

import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { PrivacyBanner } from '@/components/converter/PrivacyBanner'

type Direction = 'md-to-html' | 'html-to-md'
type InputMode = 'text' | 'file'

const SAMPLE_MARKDOWN = `# ⚡ dev-kit.tech

Welcome to **dev-kit.tech** — the 100% private developer tools platform.

## Features
- 🔄 **JSON ↔ CSV**: Fast nested object flattening
- 📜 **JSON ↔ YAML**: Clean configuration converter
- 🔑 **Base64**: Live encoding & decoding

### Code Example
\`\`\`typescript
const greeting = "Hello dev-kit.tech!";
console.log(greeting);
\`\`\`

> All processing is done locally in your browser memory!
`

const SAMPLE_HTML = `<h1>⚡ dev-kit.tech</h1>
<p>Welcome to <strong>dev-kit.tech</strong> — the 100% private developer tools platform.</p>
<h2>Features</h2>
<ul>
  <li><strong>JSON ↔ CSV</strong>: Fast nested object flattening</li>
  <li><strong>JSON ↔ YAML</strong>: Clean configuration converter</li>
</ul>
<blockquote>All processing is done locally in your browser memory!</blockquote>`

export default function MarkdownHtmlConverter() {
  const [direction, setDirection] = useState<Direction>('md-to-html')
  const [inputMode, setInputMode] = useState<InputMode>('text')
  const [inputText, setInputText] = useState('')
  const [fullDocument, setFullDocument] = useState(false)
  const [liveMode, setLiveMode] = useState(true)
  const [result, setResult] = useState<MarkdownConversionResult | null>(null)
  const [copied, setCopied] = useState(false)
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('code')
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text')

  const outputRef = useRef<HTMLDivElement>(null)

  const isMdToHtml = direction === 'md-to-html'

  const handleDirectionToggle = (newDir: Direction) => {
    setDirection(newDir)
    setInputText('')
    setResult(null)
    setInputMode('text')
    setActiveTab('text')
  }

  const convert = (
    text: string,
    dir: Direction = direction,
    fullDoc: boolean = fullDocument
  ) => {
    if (!text.trim()) {
      setResult(null)
      return
    }

    try {
      const res =
        dir === 'md-to-html'
          ? markdownToHtml(text, { fullDocument: fullDoc })
          : htmlToMarkdown(text)

      setResult(res)
    } catch (e) {
      if (!liveMode) {
        toast.error('Conversion failed', {
          description: (e as Error).message,
        })
      }
      setResult(null)
    }
  }

  const handleInputChange = (val: string) => {
    setInputText(val)
    if (liveMode) {
      convert(val)
    }
  }

  const handleConvert = () => {
    if (!inputText.trim()) {
      toast.error('Input is empty', {
        description: `Please enter some ${isMdToHtml ? 'Markdown' : 'HTML'} content.`,
      })
      return
    }
    convert(inputText)
    toast.success('Converted successfully!')
    setTimeout(() => {
      outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const handleFileContent = (content: string, filename: string) => {
    setInputText(content)
    setInputMode('text')
    convert(content, direction)
    toast.success(`Uploaded ${filename}`)
  }

  const handleLoadExample = () => {
    const example = isMdToHtml ? SAMPLE_MARKDOWN : SAMPLE_HTML
    setInputText(example)
    convert(example)
    toast.success('Sample loaded!')
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
    const ext = isMdToHtml ? 'html' : 'md'
    const mime = isMdToHtml ? 'text/html;charset=utf-8;' : 'text/markdown;charset=utf-8;'
    const blob = new Blob([result.output], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `document.${ext}`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Downloaded document.${ext}`)
  }

  const handleClear = () => {
    setInputText('')
    setResult(null)
    toast.info('Cleared')
  }

  const handleSwap = () => {
    const next: Direction = isMdToHtml ? 'html-to-md' : 'md-to-html'
    handleDirectionToggle(next)
    toast.info(`Switched to ${next === 'md-to-html' ? 'Markdown → HTML' : 'HTML → Markdown'}`)
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* ── Header ── */}
      <ToolHeader
        title={isMdToHtml ? 'Markdown → HTML Converter' : 'HTML → Markdown Converter'}
        description={
          isMdToHtml
            ? 'Convert GitHub Flavored Markdown to formatted HTML code with live visual preview.'
            : 'Convert raw HTML web code back to clean, structured Markdown syntax.'
        }
        badgeText="Real-time Converter"
      />

      {/* ── Privacy Banner ── */}
      <PrivacyBanner />

      {/* ── Direction Toggle ── */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <Button
          variant={isMdToHtml ? 'default' : 'outline'}
          onClick={() => handleDirectionToggle('md-to-html')}
          className={`gap-2 font-medium transition-all ${
            isMdToHtml
              ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/25'
              : 'border-purple-500/30 text-slate-300 hover:text-white hover:border-purple-500/60'
          }`}
        >
          <FileText className="size-4" />
          Markdown → HTML
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
          variant={!isMdToHtml ? 'default' : 'outline'}
          onClick={() => handleDirectionToggle('html-to-md')}
          className={`gap-2 font-medium transition-all ${
            !isMdToHtml
              ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/25'
              : 'border-purple-500/30 text-slate-300 hover:text-white hover:border-purple-500/60'
          }`}
        >
          <FileText className="size-4" />
          HTML → Markdown
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
                📁 Upload File (.md / .html)
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Input Area */}
          {inputMode === 'text' ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {isMdToHtml ? 'Markdown Input' : 'HTML Input'}
                </Label>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={handleLoadExample}
                  className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20 hover:text-cyan-300 transition-all"
                >
                  Load Sample
                </Button>
              </div>
              <Textarea
                value={inputText}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={
                  isMdToHtml
                    ? '# Hello World\n\nWrite your **Markdown** here...'
                    : '<h1>Hello World</h1>\n<p>Write your HTML here...</p>'
                }
                className="h-56 font-mono text-sm resize-y leading-relaxed bg-black/35 text-slate-100 border border-[rgba(124,58,237,0.25)]"
                spellCheck={false}
              />
            </div>
          ) : (
            <FileDropZone
              fileType={isMdToHtml ? 'markdown' : 'code'}
              customAccept={isMdToHtml ? '.md,.markdown,text/markdown' : '.html,text/html'}
              customLabel={isMdToHtml ? 'Markdown file (.md)' : 'HTML file (.html)'}
              readAsDataURL={false}
              onFileContent={handleFileContent}
            />
          )}


          {/* Options & Action Row */}
          <div className="my-6 p-4 rounded-2xl bg-black/25 border border-white/5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-5 text-sm text-slate-300">
              {isMdToHtml && (
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={fullDocument}
                    onChange={(e) => {
                      setFullDocument(e.target.checked)
                      if (liveMode && inputText) convert(inputText, direction, e.target.checked)
                    }}
                    className="rounded border-purple-500/30 bg-black/40 text-purple-600 focus:ring-purple-500"
                  />
                  <Settings2 className="size-3.5 text-purple-400" />
                  <span>Full HTML Document Wrapper (&lt;!DOCTYPE html&gt;...)</span>
                </label>
              )}

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={liveMode}
                  onChange={(e) => setLiveMode(e.target.checked)}
                  className="rounded border-purple-500/30 bg-black/40 text-purple-600 focus:ring-purple-500"
                />
                <span>Real-time conversion</span>
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
                  onClick={handleConvert}
                  className="bg-linear-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold shadow-lg shadow-purple-600/20 px-6"
                >
                  <Sparkles className="size-4 mr-2" />
                  Convert
                </Button>
              )}
            </div>
          </div>

          {/* Output Section */}
          <div ref={outputRef} className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {isMdToHtml ? 'HTML Output' : 'Markdown Output'}
                </Label>

                {/* Code vs Live Rendered View Toggle (for HTML) */}
                {isMdToHtml && result?.renderedHtml && (
                  <div className="flex items-center gap-1 bg-black/30 p-1 rounded-lg border border-white/5">
                    <Button
                      size="xs"
                      variant={viewMode === 'code' ? 'default' : 'ghost'}
                      onClick={() => setViewMode('code')}
                      className={`h-6 text-[11px] gap-1 px-2 ${
                        viewMode === 'code' ? 'bg-purple-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      <Code2 className="size-3" />
                      Code
                    </Button>
                    <Button
                      size="xs"
                      variant={viewMode === 'preview' ? 'default' : 'ghost'}
                      onClick={() => setViewMode('preview')}
                      className={`h-6 text-[11px] gap-1 px-2 ${
                        viewMode === 'preview' ? 'bg-purple-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      <Eye className="size-3" />
                      Visual Preview
                    </Button>
                  </div>
                )}
              </div>

              {result && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-300 font-mono">
                    {result.lineCount} lines
                  </Badge>
                  <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-300 font-mono">
                    {result.charCount.toLocaleString()} chars
                  </Badge>
                </div>
              )}
            </div>

            {/* Output View Box */}
            {viewMode === 'code' || !isMdToHtml ? (
              <div className="relative rounded-2xl overflow-hidden border border-[rgba(124,58,237,0.25)] bg-black/45">
                <Textarea
                  readOnly
                  value={result?.output ?? ''}
                  placeholder={
                    result
                      ? ''
                      : `Converted ${isMdToHtml ? 'HTML' : 'Markdown'} output will appear here...`
                  }
                  className="h-56 font-mono text-sm resize-y leading-relaxed text-emerald-300 bg-transparent border-0 focus-visible:ring-0"
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
            ) : (
              /* Live Rendered Visual Preview */
              <div className="p-6 rounded-2xl bg-black/40 border border-purple-500/30 text-slate-100 space-y-4 max-h-96 overflow-y-auto">
                <div
                  className="prose prose-invert max-w-none text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: result?.renderedHtml || '' }}
                />
              </div>
            )}
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
