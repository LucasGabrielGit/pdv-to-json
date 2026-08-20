'use client'

import React, { useState, useEffect, useRef } from 'react'

import { toast } from 'sonner'
import {
  Code2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Download,
  Eye,
  Sliders,
  Settings2,
  Layers,
} from 'lucide-react'
import { convertSvgToJsx, type SvgToJsxOptions } from '@/utils/svgToJsx'
import { ToolHeader } from '@/components/converter/ToolHeader'
import { PrivacyBanner } from '@/components/converter/PrivacyBanner'
import CodeEditor from '@/components/CodeEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
</svg>`

export default function SvgToJsxConverter() {
  const [svgInput, setSvgInput] = useState(SAMPLE_SVG)
  const [componentName, setComponentName] = useState('DollarSignIcon')
  const [isTypeScript, setIsTypeScript] = useState(true)
  const [isMemo, setIsMemo] = useState(false)
  const [isForwardRef, setIsForwardRef] = useState(false)
  const [replaceColors, setReplaceColors] = useState(false)
  const [addPropsSpread, setAddPropsSpread] = useState(true)

  const [jsxOutput, setJsxOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const baseName = file.name.replace(/\.svg$/i, '')
    const cleanCompName =
      baseName
        .split(/[^a-zA-Z0-9]/)
        .filter(Boolean)
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join('') || 'SvgIcon'

    setComponentName(cleanCompName)

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        setSvgInput(content)
        toast.success(`Loaded ${file.name}`)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }


  // Live Conversion
  useEffect(() => {
    const res = convertSvgToJsx(svgInput, {
      componentName: componentName.trim() || 'SvgIcon',
      isTypeScript,
      isMemo,
      isForwardRef,
      replaceColorsWithCurrentColor: replaceColors,
      addPropsSpread,
    })

    if (res.error) {
      setError(res.error)
      setJsxOutput('')
    } else {
      setError(null)
      setJsxOutput(res.jsx)
    }
  }, [svgInput, componentName, isTypeScript, isMemo, isForwardRef, replaceColors, addPropsSpread])

  const handleCopy = () => {
    if (!jsxOutput) return
    navigator.clipboard.writeText(jsxOutput)
    setCopied(true)
    toast.success('React JSX component copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!jsxOutput) return
    const filename = `${componentName || 'SvgIcon'}.${isTypeScript ? 'tsx' : 'jsx'}`
    const blob = new Blob([jsxOutput], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
    toast.success(`Downloaded ${filename}`)
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <ToolHeader
        title="SVG to JSX / React Component"
        description="Transform raw SVG code or files into clean, production-ready React (JSX / TSX) components with props forwarding and color tokens."
        category="converters"
      />

      <PrivacyBanner />

      {/* Configuration Toolbar */}
      <Card className="border border-purple-500/20 bg-[#16213e]/60 backdrop-blur-md">
        <CardContent className="p-4 md:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="space-y-1">
                <Label htmlFor="comp-name" className="text-xs text-slate-400">
                  Component Name
                </Label>
                <Input
                  id="comp-name"
                  value={componentName}
                  onChange={(e) => setComponentName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  placeholder="IconName"
                  className="h-8 w-44 bg-black/40 border-purple-500/30 text-xs font-mono text-white"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-3 pt-4">
                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isTypeScript}
                    onChange={(e) => setIsTypeScript(e.target.checked)}
                    className="rounded border-purple-500/30 accent-purple-500"
                  />
                  <span>TypeScript</span>
                </label>

                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isForwardRef}
                    onChange={(e) => setIsForwardRef(e.target.checked)}
                    className="rounded border-purple-500/30 accent-purple-500"
                  />
                  <span>forwardRef</span>
                </label>

                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isMemo}
                    onChange={(e) => setIsMemo(e.target.checked)}
                    className="rounded border-purple-500/30 accent-purple-500"
                  />
                  <span>React.memo</span>
                </label>

                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={replaceColors}
                    onChange={(e) => setReplaceColors(e.target.checked)}
                    className="rounded border-purple-500/30 accent-purple-500"
                  />
                  <span>fill=&quot;currentColor&quot;</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".svg,image/svg+xml"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs border-purple-500/30 text-cyan-300 hover:bg-cyan-500/10 gap-1.5"
              >
                <Code2 className="size-3.5" /> Upload .svg
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSvgInput(SAMPLE_SVG)}
                className="text-xs border-purple-500/20 text-slate-300 hover:bg-purple-500/10 gap-1.5"
              >
                <RotateCcw className="size-3.5" /> Sample
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={!jsxOutput}
                className="text-xs border-purple-500/30 text-purple-300 hover:bg-purple-500/10 gap-1.5"
              >
                <Download className="size-3.5" /> Download .{isTypeScript ? 'tsx' : 'jsx'}
              </Button>
              <Button
                size="sm"
                onClick={handleCopy}
                disabled={!jsxOutput}
                className="text-xs bg-purple-600 hover:bg-purple-500 text-white font-semibold gap-1.5"
              >
                {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                {copied ? 'Copied!' : 'Copy Component'}
              </Button>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Editor & Preview Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input SVG + Live Visual Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Code2 className="size-4 text-purple-400" /> Raw SVG Input
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {svgInput.length} chars
            </span>
          </div>

          <div className="rounded-2xl border border-purple-500/30 overflow-hidden bg-black/40 shadow-inner">
            <CodeEditor
              value={svgInput}
              onChange={(val) => setSvgInput(val || '')}
              language="html"
              placeholder="Paste <svg>...</svg> code here..."
              height="340px"
            />
          </div>


          {/* Live SVG Visual Preview */}
          <div className="p-4 rounded-2xl border border-purple-500/20 bg-[#16213e]/40 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Eye className="size-4 text-cyan-400" /> Live Icon Render:
            </div>
            <div
              className="size-12 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center p-2 text-white shadow-inner [&>svg]:size-full"
              dangerouslySetInnerHTML={{ __html: svgInput.includes('<svg') ? svgInput : '' }}
            />
          </div>
        </div>

        {/* Right: Generated React Component */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Sparkles className="size-4 text-cyan-400" /> Generated React Component ({isTypeScript ? 'TSX' : 'JSX'})
            </h3>
            <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-300 border-purple-500/30 font-mono">
              Ready to Import
            </Badge>
          </div>

          <div className="rounded-2xl border border-purple-500/30 overflow-hidden bg-black/40 shadow-inner">
            <CodeEditor
              value={jsxOutput}
              language="typescript"
              readOnly
              height="415px"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-400 font-mono bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
