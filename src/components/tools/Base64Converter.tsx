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
  Zap,
  ShieldCheck,
  Settings2,
  FileCode,
  Image as ImageIcon,
  FileText,
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
import { PrivacyBanner } from '@/components/converter/PrivacyBanner'

type Mode = 'encode' | 'decode'
type InputMode = 'text' | 'file'

const EXAMPLE_TEXT = 'Hello devkit.io! 🚀 Free 100% private developer tools.'
const EXAMPLE_BASE64 = 'SGVsbG8gZGV2a2l0LmlvISDwn5qAIEZyZWUgMTAwJSBwcml2YXRlIGRldmVsb3BlciB0b29scy4='

export default function Base64Converter() {
  const [mode, setMode] = useState<Mode>('encode')
  const [inputMode, setInputMode] = useState<InputMode>('text')
  const [inputText, setInputText] = useState('')
  const [urlSafe, setUrlSafe] = useState(false)
  const [includeDataPrefix, setIncludeDataPrefix] = useState(true)
  const [liveMode, setLiveMode] = useState(true)
  const [result, setResult] = useState<Base64Result | null>(null)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text')

  const outputRef = useRef<HTMLDivElement>(null)

  const isEncode = mode === 'encode'

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode)
    setInputText('')
    setResult(null)
    setInputMode('text')
    setActiveTab('text')
  }

  const convert = (
    text: string,
    currentMode: Mode = mode,
    isUrlSafe: boolean = urlSafe,
    withDataPrefix: boolean = includeDataPrefix
  ) => {
    if (!text.trim()) {
      setResult(null)
      return
    }

    try {
      if (currentMode === 'encode') {
        let textToEncode = text
        let prefix = ''

        // Check if text is a Data URL uploaded from FileDropZone
        if (text.startsWith('data:')) {
          if (withDataPrefix) {
            setResult({
              output: text,
              charCount: text.length,
              byteSize: Math.round((text.length * 3) / 4),
            })
            return
          } else {
            // Strip data URI prefix
            const commaIdx = text.indexOf(',')
            if (commaIdx !== -1) {
              const rawB64 = text.substring(commaIdx + 1)
              setResult({
                output: rawB64,
                charCount: rawB64.length,
                byteSize: Math.round((rawB64.length * 3) / 4),
              })
              return
            }
          }
        }

        const res = encodeBase64(textToEncode, { urlSafe: isUrlSafe })
        setResult(res)
      } else {
        // Decode mode
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
        description: `Please enter text to ${isEncode ? 'encode' : 'decode'}.`,
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

  const handleLoadExample = () => {
    const example = isEncode ? EXAMPLE_TEXT : EXAMPLE_BASE64
    setInputText(example)
    convert(example)
    toast.success('Example loaded')
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

    // If output is a Data URI (like Image, PDF, etc.), download as actual binary file
    if (result.output.startsWith('data:')) {
      const match = result.output.match(/^data:(.*?);base64,/)
      const mime = match ? match[1] : 'application/octet-stream'
      let ext = mime.split('/')[1] || 'bin'
      if (ext.includes('+')) ext = ext.split('+')[0]
      if (ext === 'svg+xml') ext = 'svg'

      const a = document.createElement('a')
      a.href = result.output
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

  const isImageDataUri = result?.output?.startsWith('data:image/')
  const isPdfDataUri = result?.output?.startsWith('data:application/pdf')

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* ── Header ── */}
      <ToolHeader
        title={isEncode ? 'Base64 Encoder' : 'Base64 Decoder'}
        description={
          isEncode
            ? 'Encode text, images, PDFs, or binary files into Base64 format instantly with UTF-8 & URL-safe support.'
            : 'Decode Base64 strings or Data URIs back to clean text, images, or files with live preview.'
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
          className={`gap-2 font-medium transition-all ${isEncode
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
          className={`gap-2 font-medium transition-all ${!isEncode
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
                📁 Upload Any File (Image, PDF, etc.)
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Input Area */}
          {inputMode === 'text' ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {isEncode ? 'Plain Text / String Input' : 'Base64 String / Data URI Input'}
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
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={
                  isEncode
                    ? 'Enter text to encode into Base64...'
                    : 'Paste Base64 string or data:image/... Data URI to decode...'
                }
                className="h-56 font-mono text-sm resize-y leading-relaxed bg-black/35 text-slate-100 border border-[rgba(124,58,237,0.25)]"
                spellCheck={false}
              />
            </div>
          ) : (
            <FileDropZone
              fileType="any"
              readAsDataURL={true}
              onFileContent={handleFileContent}
            />
          )}

          {/* Options & Action Row */}
          <div className="my-6 p-4 rounded-2xl bg-black/25 border border-white/5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-5 text-sm text-slate-300">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={urlSafe}
                  onChange={(e) => {
                    setUrlSafe(e.target.checked)
                    if (liveMode && inputText) convert(inputText, mode, e.target.checked)
                  }}
                  className="rounded border-purple-500/30 bg-black/40 text-purple-600 focus:ring-purple-500"
                />
                <Settings2 className="size-3.5 text-purple-400" />
                <span>URL-Safe Base64 (replace + / with - _)</span>
              </label>

              {isEncode && (
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={includeDataPrefix}
                    onChange={(e) => {
                      setIncludeDataPrefix(e.target.checked)
                      if (liveMode && inputText) convert(inputText, mode, urlSafe, e.target.checked)
                    }}
                    className="rounded border-purple-500/30 bg-black/40 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Include Data URI prefix (data:*/*;base64,...)</span>
                </label>
              )}

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={liveMode}
                  onChange={(e) => setLiveMode(e.target.checked)}
                  className="rounded border-purple-500/30 bg-black/40 text-purple-600 focus:ring-purple-500"
                />
                <span>Real-time live conversion</span>
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

          {/* Output Section */}
          <div ref={outputRef} className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {isEncode ? 'Base64 Result' : 'Decoded Output'}
              </Label>

              {result && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-300">
                    {result.charCount} chars
                  </Badge>
                  <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-300">
                    {result.byteSize} bytes
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
                    : `Base64 ${isEncode ? 'encoded' : 'decoded'} output will appear here in real-time...`
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

            {/* Live Image Preview (if output is an Image Data URI) */}
            {isImageDataUri && (
              <div className="mt-4 p-4 rounded-2xl bg-black/40 border border-purple-500/30 flex flex-col items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 uppercase tracking-wider">
                  <ImageIcon className="size-4" />
                  <span>Image Preview</span>
                </div>
                <img
                  src={result?.output}
                  alt="Base64 Preview"
                  className="max-h-64 max-w-full rounded-xl object-contain border border-white/10 shadow-xl bg-black/50 p-1"
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
