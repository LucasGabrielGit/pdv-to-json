'use client'

import React, { useState, useMemo } from 'react'
import {
  Code2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ArrowLeftRight,
  Download,
  FileCode,
  Layers,
} from 'lucide-react'
import { toast } from 'sonner'
import { ToolHeader } from '@/components/converter/ToolHeader'
import { PrivacyBanner } from '@/components/converter/PrivacyBanner'
import CodeEditor from '@/components/CodeEditor'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  encodeHtmlEntities,
  decodeHtmlEntities,
  escapeJsonString,
  unescapeJsonString,
  escapeJsString,
  unescapeJsString,
  inspectUnicodeChars,
  type EscapeMode,
  type EntityFormat,
} from '@/utils/htmlEntities'

const SAMPLE_TEXT = `<div class="container" id="user-card">
  <h1>Welcome & "Hello, World!"</h1>
  <p>Price: 100€ & 50£ • Status: Active ✅</p>
  <script>alert("XSS payload: <script>");</script>
</div>`

export default function HtmlEntityConverter() {
  const [inputText, setInputText] = useState(SAMPLE_TEXT)
  const [mode, setMode] = useState<EscapeMode>('html-encode')
  const [format, setFormat] = useState<EntityFormat>('named')
  const [encodeAllNonAscii, setEncodeAllNonAscii] = useState(false)
  const [copied, setCopied] = useState(false)

  // Live Conversion
  const outputText = useMemo(() => {
    if (!inputText) return ''
    switch (mode) {
      case 'html-encode':
        return encodeHtmlEntities(inputText, format, encodeAllNonAscii)
      case 'html-decode':
        return decodeHtmlEntities(inputText)
      case 'json-escape':
        return escapeJsonString(inputText)
      case 'json-unescape':
        return unescapeJsonString(inputText)
      case 'js-escape':
        return escapeJsString(inputText)
      case 'js-unescape':
        return unescapeJsString(inputText)
      default:
        return inputText
    }
  }, [inputText, mode, format, encodeAllNonAscii])

  // Unicode inspection
  const unicodeList = useMemo(() => {
    return inspectUnicodeChars(inputText)
  }, [inputText])

  const handleCopy = async () => {
    if (!outputText) return
    await navigator.clipboard.writeText(outputText)
    setCopied(true)
    toast.success('Copied output to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!outputText) return
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `escaped-output.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded output file')
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <ToolHeader
        title="HTML Entities & String Escaper"
        description="Encode & decode HTML named entities, decimal codes, hexadecimal values, and escape JSON/JavaScript strings in real-time."
        badgeText="100% Client-Side Escaper"
        toolId="html-entities"
      />

      <PrivacyBanner />

      {/* Toolbar Controls */}
      <Card className="border border-purple-500/25 bg-[#16213e] shadow-xl">
        <CardContent className="p-4 md:p-5 flex flex-wrap items-center justify-between gap-4">
          {/* Modes */}
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              size="xs"
              variant={mode === 'html-encode' ? 'default' : 'outline'}
              onClick={() => setMode('html-encode')}
              className={`text-xs font-semibold ${
                mode === 'html-encode'
                  ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md'
                  : 'border-purple-500/30 text-slate-300'
              }`}
            >
              HTML Encode
            </Button>
            <Button
              size="xs"
              variant={mode === 'html-decode' ? 'default' : 'outline'}
              onClick={() => setMode('html-decode')}
              className={`text-xs font-semibold ${
                mode === 'html-decode'
                  ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md'
                  : 'border-purple-500/30 text-slate-300'
              }`}
            >
              HTML Decode
            </Button>
            <Button
              size="xs"
              variant={mode === 'json-escape' ? 'default' : 'outline'}
              onClick={() => setMode('json-escape')}
              className={`text-xs font-semibold ${
                mode === 'json-escape'
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md'
                  : 'border-purple-500/30 text-slate-300'
              }`}
            >
              JSON Escape
            </Button>
            <Button
              size="xs"
              variant={mode === 'json-unescape' ? 'default' : 'outline'}
              onClick={() => setMode('json-unescape')}
              className={`text-xs font-semibold ${
                mode === 'json-unescape'
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md'
                  : 'border-purple-500/30 text-slate-300'
              }`}
            >
              JSON Unescape
            </Button>
            <Button
              size="xs"
              variant={mode === 'js-escape' ? 'default' : 'outline'}
              onClick={() => setMode('js-escape')}
              className={`text-xs font-semibold ${
                mode === 'js-escape'
                  ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md'
                  : 'border-purple-500/30 text-slate-300'
              }`}
            >
              JS String Escape
            </Button>
          </div>

          {/* Options for HTML encode */}
          {mode === 'html-encode' && (
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Format:</span>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as EntityFormat)}
                  className="h-7 px-2 rounded-md bg-black/40 border border-purple-500/30 text-slate-200 text-xs font-mono outline-none"
                >
                  <option value="named">Named (&amp;amp;, &amp;lt;)</option>
                  <option value="decimal">Decimal (&amp;#38;, &amp;#60;)</option>
                  <option value="hex">Hex (&amp;#x26;, &amp;#x3C;)</option>
                </select>
              </div>

              <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer hover:text-slate-200">
                <input
                  type="checkbox"
                  checked={encodeAllNonAscii}
                  onChange={(e) => setEncodeAllNonAscii(e.target.checked)}
                  className="rounded border-purple-500/30 bg-black/40 text-purple-600 focus:ring-purple-500 size-3.5"
                />
                <span>Encode all non-ASCII &amp; Unicode</span>
              </label>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex items-center gap-2 ml-auto">
            <Button
              size="xs"
              variant="outline"
              onClick={() => setInputText(SAMPLE_TEXT)}
              className="bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20 text-xs"
            >
              <Sparkles className="size-3 mr-1 text-purple-400" /> Sample
            </Button>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => setInputText('')}
              className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs"
            >
              <RotateCcw className="size-3 mr-1" /> Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Side-by-Side Editors (500px) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Raw Input */}
        <div className="space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <FileCode className="size-3.5 text-purple-400" /> Raw Input Text
            </Label>
            <Badge variant="outline" className="text-[10px] border-white/10 text-slate-400 font-mono">
              {inputText.length} chars
            </Badge>
          </div>

          <CodeEditor
            value={inputText}
            onChange={(v) => setInputText(v || '')}
            language="html"
            placeholder="Paste text, HTML, or code here..."
            height="500px"
          />
        </div>

        {/* Right: Escaped / Decoded Output */}
        <div className="space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Check className="size-3.5 text-cyan-400" /> Result Output ({mode.replace('-', ' ')})
            </Label>

            {outputText && (
              <div className="flex items-center gap-1.5">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={handleCopy}
                  className="h-6 text-xs border-purple-500/30 text-slate-200 hover:text-white"
                >
                  {copied ? <Check className="size-3 mr-1 text-emerald-400" /> : <Copy className="size-3 mr-1" />}
                  {copied ? 'Copied!' : 'Copy'}
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
            value={outputText}
            language="html"
            readOnly
            height="500px"
          />
        </div>
      </div>

      {/* Unicode Character Inspector Table */}
      {unicodeList.length > 0 && (
        <Card className="border border-purple-500/20 bg-[#0d1527] shadow-xl">
          <CardContent className="p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
              <Layers className="size-4" /> Unicode Character &amp; Entity Inspection (First {unicodeList.length} chars)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left border-collapse">
                <thead>
                  <tr className="border-b border-purple-500/20 text-slate-400 text-[10px] uppercase">
                    <th className="py-2 px-3">Char</th>
                    <th className="py-2 px-3">Code Point</th>
                    <th className="py-2 px-3">Decimal Code</th>
                    <th className="py-2 px-3">Hex Entity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {unicodeList.map((item, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="py-1.5 px-3 font-sans text-base font-bold text-white">
                        {item.char === ' ' ? <span className="text-slate-500 text-xs italic">Space</span> : item.char}
                      </td>
                      <td className="py-1.5 px-3 text-cyan-300 font-semibold">{item.codePoint}</td>
                      <td className="py-1.5 px-3 text-purple-300">{item.htmlEntity}</td>
                      <td className="py-1.5 px-3 text-emerald-300">{item.hex}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
