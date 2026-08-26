'use client'

import React, { useState, useRef } from 'react'
import { toast } from 'sonner'
import {
  ArrowLeftRight,
  Copy,
  Download,
  Trash2,
  Check,
  Binary,
  Sparkles,
  Settings2,
  Image as ImageIcon,
  FileText,
  Music,
  ExternalLink,
  Code2,
  Eye,
} from 'lucide-react'
import AdSense from '@/components/AdSense'
import { ADS_CONFIG } from '@/config/ads'

import {
  encodeBase64,
  decodeBase64,
  type Base64Result,
} from '@/utils/base64Converter'
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

type Mode = 'encode' | 'decode'
type InputMode = 'text' | 'file'
type OutputFormat = 'raw' | 'data-uri' | 'img-tag' | 'css-url'

// Presets
const SAMPLE_TEXT = 'Hello devkit.io! 🚀 Free 100% private developer tools.'
const SAMPLE_BASE64_TEXT =
  'SGVsbG8gZGV2a2l0LmlvISDwn5qAIEZyZWUgMTAwJSBwcml2YXRlIGRldmVsb3BlciB0b29scy4='
// 1x1 Red PNG dot Data URI
const SAMPLE_IMAGE_DATA_URI =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
// Minimal valid PDF Data URI
const SAMPLE_PDF_DATA_URI =
  'data:application/pdf;base64,JVBERi0xLjAKMSAwIG9iago8PAo+PgplbmRvYmoKdHJhaWxlcgo8PAovUm9vdCAxIDAgUgo+PgolJUVPRg=='

export default function Base64Converter() {
  const [mode, setMode] = useState<Mode>('encode')
  const [inputMode, setInputMode] = useState<InputMode>('text')
  const [inputText, setInputText] = useState('')
  const [urlSafe, setUrlSafe] = useState(false)
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('raw')
  const [liveMode, setLiveMode] = useState(true)
  const [result, setResult] = useState<Base64Result | null>(null)
  const [copied, setCopied] = useState(false)
  const [showRawCode, setShowRawCode] = useState(false)
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text')

  const outputRef = useRef<HTMLDivElement>(null)

  const isEncode = mode === 'encode'

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode)
    setInputText('')
    setResult(null)
    setInputMode('text')
    setActiveTab('text')
    setShowRawCode(false)
  }

  const convert = (
    text: string,
    currentMode: Mode = mode,
    isUrlSafe: boolean = urlSafe,
    fmt: OutputFormat = outputFormat
  ) => {
    if (!text.trim()) {
      setResult(null)
      return
    }

    try {
      if (currentMode === 'encode') {
        const res = encodeBase64(text, { urlSafe: isUrlSafe, outputFormat: fmt })
        setResult(res)
      } else {
        const res = decodeBase64(text, { urlSafe: isUrlSafe })
        setResult(res)
      }
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
        description: `Please enter content to ${isEncode ? 'encode' : 'decode'}.`,
      })
      return
    }
    convert(inputText)
    toast.success(`${isEncode ? 'Encoded' : 'Decoded'} successfully!`)
    setTimeout(() => {
      outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const handleFileContent = (dataUrlOrText: string, filename: string) => {
    setInputText(dataUrlOrText)
    setInputMode('text')
    convert(dataUrlOrText, mode)
    toast.success(`Uploaded ${filename}`)
  }

  const handleLoadPreset = (presetType: 'text' | 'image' | 'pdf') => {
    let sample = ''
    if (isEncode) {
      if (presetType === 'text') sample = SAMPLE_TEXT
      else if (presetType === 'image') sample = SAMPLE_IMAGE_DATA_URI
      else if (presetType === 'pdf') sample = SAMPLE_PDF_DATA_URI
    } else {
      if (presetType === 'text') sample = SAMPLE_BASE64_TEXT
      else if (presetType === 'image') sample = SAMPLE_IMAGE_DATA_URI
      else if (presetType === 'pdf') sample = SAMPLE_PDF_DATA_URI
    }
    setInputText(sample)
    convert(sample)
    toast.success(`Loaded ${presetType.toUpperCase()} sample`)
  }

  const handleCopy = async (customText?: string) => {
    const textToCopy = customText || result?.output
    if (!textToCopy) return
    await navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!result?.output) return

    // If output is a Data URI or binary file, download as actual binary file
    const dataUri = result.dataUri || (result.output.startsWith('data:') ? result.output : null)

    if (dataUri) {
      const match = dataUri.match(/^data:(.*?);base64,/)
      const mime = match ? match[1] : 'application/octet-stream'
      let ext = mime.split('/')[1] || 'bin'
      if (ext.includes('+')) ext = ext.split('+')[0]
      if (ext === 'svg+xml') ext = 'svg'

      const a = document.createElement('a')
      a.href = dataUri
      a.download = `file.${ext}`
      a.click()
      toast.success(`Downloaded file.${ext}`)
      return
    }

    const ext = isEncode ? 'b64' : 'txt'
    const blob = new Blob([result.output], { type: 'text/plain;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `output.${ext}`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Downloaded output.${ext}`)
  }

  const handleOpenNewWindow = () => {
    const dataUri = result?.dataUri || (result?.output.startsWith('data:') ? result.output : null)
    if (!dataUri) return
    const win = window.open()
    if (win) {
      win.document.write(
        `<iframe src="${dataUri}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
      )
    }
  }

  const handleClear = () => {
    setInputText('')
    setResult(null)
    toast.info('Cleared')
  }

  const handleSwap = () => {
    const next: Mode = isEncode ? 'decode' : 'encode'
    handleModeChange(next)
    toast.info(`Switched to Base64 ${next === 'encode' ? 'Encode' : 'Decode'}`)
  }

  const isImage = result?.fileCategory === 'image' || result?.output?.startsWith('data:image/')
  const isPdf = result?.fileCategory === 'pdf' || result?.output?.startsWith('data:application/pdf')
  const isAudio = result?.fileCategory === 'audio' || result?.output?.startsWith('data:audio/')
  const isBinaryOutput = result?.isBinary || isImage || isPdf || isAudio

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* ── Header ── */}
      <ToolHeader
        title={isEncode ? 'Base64 Encoder' : 'Base64 Decoder'}
        description={
          isEncode
            ? 'Encode text, images, PDFs, or binary files into Base64 format with live preview & multiple output formats.'
            : 'Decode Base64 strings or Data URIs back to clean text, images, or files with instant preview.'
        }
        badgeText="Real-time Base64 Tool"
      />

      {/* ── Privacy Banner ── */}
      <PrivacyBanner />

      {/* ── Mode Toggle Buttons ── */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <Button
          variant={isEncode ? 'default' : 'outline'}
          onClick={() => handleModeChange('encode')}
          className={`gap-2 font-medium transition-all ${
            isEncode
              ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/25'
              : 'border-purple-500/30 text-slate-300 hover:text-white hover:border-purple-500/60'
          }`}
        >
          <Binary className="size-4" />
          Encode to Base64
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleSwap}
          title="Swap mode"
          className="size-10 border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 transition-all rounded-full"
        >
          <ArrowLeftRight className="size-4" />
        </Button>

        <Button
          variant={!isEncode ? 'default' : 'outline'}
          onClick={() => handleModeChange('decode')}
          className={`gap-2 font-medium transition-all ${
            !isEncode
              ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/25'
              : 'border-purple-500/30 text-slate-300 hover:text-white hover:border-purple-500/60'
          }`}
        >
          <Binary className="size-4" />
          Decode from Base64
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
                ✏️ Paste Text / Base64
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
                📁 Upload File (Image, PDF, etc.)
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Input Area */}
          {inputMode === 'text' ? (
            <div className="space-y-2">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {isEncode ? 'Plain Text / Input String' : 'Base64 String / Data URI Input'}
                </Label>

                {/* Sample Preset Buttons */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 mr-1 hidden sm:inline">Samples:</span>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => handleLoadPreset('text')}
                    className="bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20 transition-all text-[11px]"
                  >
                    📝 Text
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => handleLoadPreset('image')}
                    className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20 hover:bg-cyan-500/20 transition-all text-[11px]"
                  >
                    🖼️ Image
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => handleLoadPreset('pdf')}
                    className="bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20 transition-all text-[11px]"
                  >
                    📄 PDF
                  </Button>
                </div>
              </div>
              <Textarea
                value={inputText}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={
                  isEncode
                    ? 'Enter text or paste Data URI to encode into Base64...'
                    : 'Paste Base64 string or data:image/... Data URI to decode...'
                }
                className="h-48 font-mono text-sm resize-y leading-relaxed bg-black/35 text-slate-100 border border-[rgba(124,58,237,0.25)]"
                spellCheck={false}
              />
            </div>
          ) : (
            <FileDropZone
              fileType="any"
              customLabel="any document, image, or file to encode into Base64"
              readAsDataURL={true}
              onFileContent={handleFileContent}
            />
          )}


          {/* Options & Format Bar */}
          <div className="my-6 p-4 rounded-2xl bg-black/25 border border-white/5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
              {isEncode && (
                <div className="flex items-center gap-2">
                  <Settings2 className="size-4 text-purple-400" />
                  <Label className="text-xs text-slate-400">Output Format:</Label>
                  <Select
                    value={outputFormat}
                    onValueChange={(val) => {
                      const fmt = val as OutputFormat
                      setOutputFormat(fmt)
                      if (liveMode && inputText) convert(inputText, mode, urlSafe, fmt)
                    }}
                  >
                    <SelectTrigger className="w-44 h-8 bg-black/40 border-purple-500/30 text-slate-200 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="raw">Raw Base64</SelectItem>
                      <SelectItem value="data-uri">Data URI (data:...)</SelectItem>
                      <SelectItem value="img-tag">HTML &lt;img&gt; tag</SelectItem>
                      <SelectItem value="css-url">CSS url(&quot;...&quot;)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={urlSafe}
                  onChange={(e) => {
                    setUrlSafe(e.target.checked)
                    if (liveMode && inputText) convert(inputText, mode, e.target.checked, outputFormat)
                  }}
                  className="rounded border-purple-500/30 bg-black/40 text-purple-600 focus:ring-purple-500"
                />
                <span>URL-Safe Base64 (- and _ )</span>
              </label>

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
                  {isEncode ? 'Encode' : 'Decode'}
                </Button>
              )}
            </div>
          </div>

          {/* ── Output Section ── */}
          <div ref={outputRef} className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {isEncode ? 'Base64 Result' : 'Decoded Output'}
              </Label>

              {result && (
                <div className="flex items-center gap-2">
                  {result.mimeType && (
                    <Badge
                      variant="outline"
                      className="text-xs border-purple-500/40 text-purple-300 bg-purple-500/10 font-mono"
                    >
                      {result.mimeType}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-300">
                    {result.charCount.toLocaleString()} chars
                  </Badge>
                  <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-300">
                    {result.byteSize.toLocaleString()} bytes
                  </Badge>

                  {/* Toggle code view for binary output */}
                  {isBinaryOutput && (
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => setShowRawCode(!showRawCode)}
                      className="text-[11px] gap-1 border-white/10 text-slate-300 hover:text-white"
                    >
                      {showRawCode ? <Eye className="size-3" /> : <Code2 className="size-3" />}
                      <span>{showRawCode ? 'Hide Code' : 'Show Code'}</span>
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* ── 1. Text Output (Shown for plain text or when showRawCode is enabled) ── */}
            {(!isBinaryOutput || showRawCode) && (
              <div className="relative rounded-2xl overflow-hidden border border-[rgba(124,58,237,0.25)] bg-black/45">
                <Textarea
                  readOnly
                  value={result?.output ?? ''}
                  placeholder={
                    result
                      ? ''
                      : `Base64 ${isEncode ? 'encoded' : 'decoded'} output will appear here...`
                  }
                  className="h-48 font-mono text-sm resize-y leading-relaxed text-emerald-300 bg-transparent border-0 focus-visible:ring-0"
                  spellCheck={false}
                />

                {result?.output && (
                  <div className="absolute top-3 right-3 flex items-center gap-2 bg-[#16213e]/90 p-1.5 rounded-xl border border-white/10 backdrop-blur-md">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy()}
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
            )}

            {/* ── 2. Rich Media Output / Previews (Shown for Images, PDFs, Audio) ── */}

            {/* Image Preview Card */}
            {isImage && (
              <div className="p-5 rounded-2xl bg-black/40 border border-purple-500/30 flex flex-col items-center gap-4">
                <div className="flex flex-wrap items-center justify-between w-full gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
                    <ImageIcon className="size-4" />
                    <span>Decoded Image Preview</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => handleCopy(result?.dataUri || result?.output)}
                      className="gap-1.5 border-purple-500/30 text-purple-300 hover:bg-purple-500/10 text-xs"
                    >
                      <Copy className="size-3" />
                      Copy Data URI
                    </Button>

                    <Button
                      size="xs"
                      variant="outline"
                      onClick={handleOpenNewWindow}
                      className="gap-1.5 border-purple-500/30 text-purple-300 hover:bg-purple-500/10 text-xs"
                    >
                      <ExternalLink className="size-3" />
                      Open Image in New Tab
                    </Button>

                    <Button
                      size="xs"
                      onClick={handleDownload}
                      className="gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs"
                    >
                      <Download className="size-3" />
                      Download Image
                    </Button>
                  </div>
                </div>

                <div className="relative group max-w-full flex items-center justify-center p-3 rounded-2xl bg-black/60 border border-white/10 shadow-2xl">
                  <img
                    src={result?.dataUri || result?.output}
                    alt="Decoded Base64 Preview"
                    className="max-h-80 max-w-full rounded-xl object-contain shadow-2xl"
                  />
                </div>
              </div>
            )}

            {/* PDF Preview Card */}
            {isPdf && (
              <div className="p-5 rounded-2xl bg-black/40 border border-purple-500/30 flex flex-col items-center gap-4">
                <div className="flex flex-wrap items-center justify-between w-full gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
                    <FileText className="size-4" />
                    <span>Decoded PDF Document Preview</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={handleOpenNewWindow}
                      className="gap-1.5 border-purple-500/30 text-purple-300 hover:bg-purple-500/10 text-xs"
                    >
                      <ExternalLink className="size-3" />
                      Open PDF in New Tab
                    </Button>

                    <Button
                      size="xs"
                      onClick={handleDownload}
                      className="gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs"
                    >
                      <Download className="size-3" />
                      Download PDF File
                    </Button>
                  </div>
                </div>

                <div className="w-full h-80 rounded-xl overflow-hidden border border-white/10 bg-black/50">
                  <iframe
                    src={result?.dataUri || result?.output}
                    title="PDF Document Preview"
                    className="w-full h-full border-0"
                  />
                </div>
              </div>
            )}

            {/* Audio Preview Card */}
            {isAudio && (
              <div className="p-5 rounded-2xl bg-black/40 border border-purple-500/30 flex flex-col items-center gap-4">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
                    <Music className="size-4" />
                    <span>Audio Player</span>
                  </div>

                  <Button
                    size="xs"
                    onClick={handleDownload}
                    className="gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs"
                  >
                    <Download className="size-3" />
                    Download Audio
                  </Button>
                </div>

                <audio
                  controls
                  src={result?.dataUri || result?.output}
                  className="w-full max-w-md"
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
