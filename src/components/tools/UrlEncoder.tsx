'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Link2,
  Copy,
  Check,
  RotateCcw,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Sparkles,
} from 'lucide-react'
import {
  encodeUrlString,
  decodeUrlString,
  parseUrlDetails,
  buildUrlFromParams,
  type QueryParam,
} from '@/utils/urlEncoder'
import { ToolHeader } from '@/components/converter/ToolHeader'
import { PrivacyBanner } from '@/components/converter/PrivacyBanner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const SAMPLE_URL = 'https://dev-kit.tech/search?q=json+converter&category=utilities&sort=popular&page=1&ref=developer_tools#results'

export default function UrlEncoder() {
  const [mode, setMode] = useState<'parser' | 'encode' | 'decode'>('parser')
  const [urlInput, setUrlInput] = useState(SAMPLE_URL)
  const [params, setParams] = useState<QueryParam[]>([])
  const [baseUrlPart, setBaseUrlPart] = useState('')
  const [encodeInput, setEncodeInput] = useState('Hello World! Developer & Tools / 2026')
  const [encodedOutput, setEncodedOutput] = useState('')
  const [copied, setCopied] = useState(false)

  // Sync params when urlInput changes in parser mode
  useEffect(() => {
    if (mode === 'parser') {
      const parsed = parseUrlDetails(urlInput)
      setParams(parsed.params)
      setBaseUrlPart(urlInput.split('?')[0])
    }
  }, [urlInput, mode])

  // Handle Quick Encode/Decode
  useEffect(() => {
    if (mode === 'encode') {
      setEncodedOutput(encodeUrlString(encodeInput, 'component'))
    } else if (mode === 'decode') {
      setEncodedOutput(decodeUrlString(encodeInput))
    }
  }, [encodeInput, mode])

  const handleParamChange = (index: number, field: 'key' | 'value' | 'enabled', val: string | boolean) => {
    const updated = [...params]
    updated[index] = { ...updated[index], [field]: val }
    setParams(updated)
    const newUrl = buildUrlFromParams(baseUrlPart, updated)
    setUrlInput(newUrl)
  }

  const handleAddParam = () => {
    const updated = [...params, { key: 'new_param', value: 'value', enabled: true }]
    setParams(updated)
    const newUrl = buildUrlFromParams(baseUrlPart, updated)
    setUrlInput(newUrl)
  }

  const handleRemoveParam = (index: number) => {
    const updated = params.filter((_, i) => i !== index)
    setParams(updated)
    const newUrl = buildUrlFromParams(baseUrlPart, updated)
    setUrlInput(newUrl)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <ToolHeader
        title="URL Encoder / Decoder & Query Param Parser"
        description="Inspect, decode, and build URLs with an interactive query parameter table or quickly URL-encode special characters."
        category="utilities"
      />

      <PrivacyBanner />

      {/* Mode Selector */}
      <div className="flex justify-center">
        <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
          <TabsList className="bg-[#16213e] border border-purple-500/30 p-1">
            <TabsTrigger value="parser" className="text-xs gap-1.5">
              <Link2 className="size-3.5" /> Interactive URL &amp; Params
            </TabsTrigger>
            <TabsTrigger value="encode" className="text-xs gap-1.5">
              <Lock className="size-3.5" /> URL Encode
            </TabsTrigger>
            <TabsTrigger value="decode" className="text-xs gap-1.5">
              <Unlock className="size-3.5" /> URL Decode
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {mode === 'parser' ? (
        <div className="space-y-6">
          {/* Full URL Bar */}
          <Card className="border border-purple-500/20 bg-[#16213e]/60 backdrop-blur-md">
            <CardContent className="p-4 md:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="full-url" className="text-xs font-semibold text-slate-300">
                  Target URL
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUrlInput(SAMPLE_URL)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    <RotateCcw className="size-3" /> Reset Sample
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleCopy(urlInput)}
                    className="text-xs bg-purple-600 hover:bg-purple-500 text-white font-semibold gap-1.5"
                  >
                    {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                    Copy URL
                  </Button>
                </div>
              </div>
              <Input
                id="full-url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="bg-black/40 border-purple-500/30 font-mono text-xs text-white"
              />
            </CardContent>
          </Card>

          {/* Interactive Query Parameters Table */}
          <Card className="border border-purple-500/20 bg-[#16213e]/60 backdrop-blur-md">
            <CardContent className="p-4 md:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="size-4 text-cyan-400" /> Query String Parameters ({params.length})
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddParam}
                  className="text-xs border-purple-500/30 text-purple-300 hover:bg-purple-500/10 gap-1.5"
                >
                  <Plus className="size-3.5" /> Add Param
                </Button>
              </div>

              {params.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-white/10 rounded-xl">
                  No query parameters found in the URL. Click &ldquo;Add Param&rdquo; to attach parameters.
                </div>
              ) : (
                <div className="space-y-2">
                  {params.map((param, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-black/30 border border-white/5"
                    >
                      <input
                        type="checkbox"
                        checked={param.enabled}
                        onChange={(e) => handleParamChange(index, 'enabled', e.target.checked)}
                        className="rounded border-purple-500/30 accent-purple-500 size-4"
                        title="Enable/Disable param in URL"
                      />
                      <Input
                        value={param.key}
                        onChange={(e) => handleParamChange(index, 'key', e.target.value)}
                        placeholder="Key (e.g. utm_source)"
                        className="h-8 flex-1 bg-black/40 border-purple-500/20 font-mono text-xs text-purple-300"
                      />
                      <span className="text-slate-500 font-bold">=</span>
                      <Input
                        value={param.value}
                        onChange={(e) => handleParamChange(index, 'value', e.target.value)}
                        placeholder="Value"
                        className="h-8 flex-1 bg-black/40 border-purple-500/20 font-mono text-xs text-cyan-300"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveParam(index)}
                        className="size-8 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Quick Encode/Decode Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-300">
              {mode === 'encode' ? 'Raw Text to URL-Encode' : 'URL-Encoded String to Decode'}
            </Label>
            <textarea
              value={encodeInput}
              onChange={(e) => setEncodeInput(e.target.value)}
              className="w-full h-64 p-3.5 rounded-2xl bg-black/40 border border-purple-500/30 font-mono text-xs text-white resize-y"
              placeholder="Enter text..."
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-300">
                {mode === 'encode' ? 'URL Encoded Result' : 'Decoded Text Result'}
              </Label>
              <Button
                size="sm"
                onClick={() => handleCopy(encodedOutput)}
                className="text-xs bg-purple-600 hover:bg-purple-500 text-white font-semibold gap-1.5"
              >
                {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                Copy Output
              </Button>
            </div>
            <textarea
              value={encodedOutput}
              readOnly
              className="w-full h-64 p-3.5 rounded-2xl bg-black/40 border border-purple-500/30 font-mono text-xs text-cyan-300 resize-y"
            />
          </div>
        </div>
      )}
    </div>
  )
}
