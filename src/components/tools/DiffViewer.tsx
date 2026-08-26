'use client'

import React, { useState, useMemo } from 'react'
import { toast } from 'sonner'
import {
  Diff as Copy,
  Download,
  Trash2,
  Check,
  Sparkles,
  Columns,
  List,
  Clock,
  PlusCircle,
  MinusCircle,
  } from 'lucide-react'
import AdSense from '@/components/AdSense'
import { ADS_CONFIG } from '@/config/ads'

import {
  computeTextDiff,
  SAMPLE_ORIGINAL_CODE,
  SAMPLE_MODIFIED_CODE,
  type DiffMode,
  type DiffResult,
} from '@/utils/diffViewer'
import { ToolHeader } from '@/components/converter/ToolHeader'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import CodeEditor from '@/components/CodeEditor'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { PrivacyBanner } from '@/components/converter/PrivacyBanner'


type ViewStyle = 'split' | 'unified'

export default function DiffViewer() {
  const [originalText, setOriginalText] = useState(SAMPLE_ORIGINAL_CODE)
  const [modifiedText, setModifiedText] = useState(SAMPLE_MODIFIED_CODE)
  const [diffMode, setDiffMode] = useState<DiffMode>('lines')
  const [viewStyle, setViewStyle] = useState<ViewStyle>('split')
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false)
  const [ignoreCase, setIgnoreCase] = useState(false)
  const [copied, setCopied] = useState(false)

  // Compute diff live
  const result: DiffResult = useMemo(() => {
    return computeTextDiff(originalText, modifiedText, {
      mode: diffMode,
      ignoreWhitespace,
      ignoreCase,
    })
  }, [originalText, modifiedText, diffMode, ignoreWhitespace, ignoreCase])

  const handleLoadSample = () => {
    setOriginalText(SAMPLE_ORIGINAL_CODE)
    setModifiedText(SAMPLE_MODIFIED_CODE)
    toast.success('Loaded sample code diff')
  }

  const handleCopyUnified = async () => {
    if (!result.lines.length) return
    const text = result.lines
      .map((l) => {
        const prefix = l.added ? '+' : l.removed ? '-' : ' '
        return `${prefix} ${l.value}`
      })
      .join('\n')

    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied diff to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadPatch = () => {
    if (!result.lines.length) return
    const text = result.lines
      .map((l) => {
        const prefix = l.added ? '+' : l.removed ? '-' : ' '
        return `${prefix} ${l.value}`
      })
      .join('\n')

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'changes.patch'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded changes.patch!')
  }

  const handleClear = () => {
    setOriginalText('')
    setModifiedText('')
    toast.info('Cleared inputs')
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* ── Header ── */}
      <ToolHeader
        title="Diff Viewer & Text Comparator"
        description="Compare two text or code snippets side-by-side with line, word, and JSON difference highlighting."
        badgeText="Real-time Diff"
      />

      {/* ── Privacy Banner ── */}
      <PrivacyBanner />

      {/* ── Main Card ── */}
      <Card
        className="rounded-3xl shadow-2xl overflow-hidden border border-[rgba(124,58,237,0.25)] bg-[#16213e]"
        style={{
          boxShadow: '0 25px 60px rgba(0,0,0,0.4), 0 0 60px rgba(124,58,237,0.04)',
        }}
      >
        <CardContent className="p-6 md:p-8 space-y-6">
          {/* Controls & Options Bar */}
          <div className="p-4 rounded-2xl bg-black/25 border border-white/5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
              {/* Diff Mode Selector */}
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                <Button
                  size="xs"
                  variant={diffMode === 'lines' ? 'default' : 'ghost'}
                  onClick={() => setDiffMode('lines')}
                  className={`h-7 text-xs ${diffMode === 'lines' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
                >
                  Line Diff
                </Button>
                <Button
                  size="xs"
                  variant={diffMode === 'words' ? 'default' : 'ghost'}
                  onClick={() => setDiffMode('words')}
                  className={`h-7 text-xs ${diffMode === 'words' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
                >
                  Word Diff
                </Button>
                <Button
                  size="xs"
                  variant={diffMode === 'json' ? 'default' : 'ghost'}
                  onClick={() => setDiffMode('json')}
                  className={`h-7 text-xs ${diffMode === 'json' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
                >
                  JSON Diff
                </Button>
              </div>

              {/* View Layout Selector */}
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                <Button
                  size="xs"
                  variant={viewStyle === 'split' ? 'default' : 'ghost'}
                  onClick={() => setViewStyle('split')}
                  className={`h-7 text-xs gap-1.5 ${viewStyle === 'split' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
                >
                  <Columns className="size-3" />
                  Split View
                </Button>
                <Button
                  size="xs"
                  variant={viewStyle === 'unified' ? 'default' : 'ghost'}
                  onClick={() => setViewStyle('unified')}
                  className={`h-7 text-xs gap-1.5 ${viewStyle === 'unified' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
                >
                  <List className="size-3" />
                  Unified View
                </Button>
              </div>

              {/* Toggles */}
              <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={ignoreWhitespace}
                  onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                  className="rounded border-purple-500/30 bg-black/40 text-purple-600 focus:ring-purple-500"
                />
                <span>Ignore Whitespace</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={ignoreCase}
                  onChange={(e) => setIgnoreCase(e.target.checked)}
                  className="rounded border-purple-500/30 bg-black/40 text-purple-600 focus:ring-purple-500"
                />
                <span>Ignore Case</span>
              </label>
            </div>


            <div className="flex items-center gap-2 ml-auto">
              <Button
                size="xs"
                variant="outline"
                onClick={handleLoadSample}
                className="bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20 transition-all text-xs"
              >
                <Sparkles className="size-3 mr-1 text-purple-400" />
                Load Sample Code
              </Button>

              <Button
                size="xs"
                variant="ghost"
                onClick={handleClear}
                disabled={!originalText && !modifiedText}
                className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs"
              >
                <Trash2 className="size-3.5 mr-1" />
                Clear
              </Button>
            </div>
          </div>

          {/* Text Input Areas (Original vs Modified) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <MinusCircle className="size-3.5" />
                Original Text / Code
              </Label>
              <CodeEditor
                value={originalText}
                onChange={(val) => setOriginalText(val || '')}
                language="typescript"
                placeholder="Paste original text here..."
                height="240px"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <PlusCircle className="size-3.5" />
                Modified Text / Code
              </Label>
              <CodeEditor
                value={modifiedText}
                onChange={(val) => setModifiedText(val || '')}
                language="typescript"
                placeholder="Paste modified text here..."
                height="240px"
              />
            </div>
          </div>

          {/* Stats Bar & Export Row */}
          {result.lines.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-3 text-xs">
                <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-mono gap-1">
                  <PlusCircle className="size-3" />
                  +{result.additionsCount} Additions
                </Badge>

                <Badge variant="outline" className="border-rose-500/40 bg-rose-500/10 text-rose-300 font-mono gap-1">
                  <MinusCircle className="size-3" />
                  -{result.deletionsCount} Deletions
                </Badge>

                <Badge variant="outline" className="border-cyan-500/30 text-cyan-300 font-mono gap-1">
                  <Clock className="size-3" />
                  {result.executionTimeMs} ms
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={handleCopyUnified}
                  className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 text-xs gap-1.5"
                >
                  {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                  {copied ? 'Copied' : 'Copy Patch'}
                </Button>

                <Button
                  size="xs"
                  onClick={handleDownloadPatch}
                  className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold gap-1.5"
                >
                  <Download className="size-3" />
                  Download .patch
                </Button>
              </div>
            </div>
          )}

          {/* Diff Result View */}
          {result.lines.length > 0 && (
            <div className="rounded-2xl overflow-hidden border border-[rgba(124,58,237,0.25)] bg-black/45 max-h-96 overflow-y-auto">
              {viewStyle === 'unified' ? (
                /* UNIFIED VIEW */
                <div className="font-mono text-xs leading-relaxed divide-y divide-white/5">
                  {result.lines.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center px-4 py-1.5 ${
                        item.added
                          ? 'bg-emerald-500/15 text-emerald-300 border-l-4 border-emerald-500'
                          : item.removed
                          ? 'bg-rose-500/15 text-rose-300 border-l-4 border-rose-500'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <span className="w-12 text-slate-500 text-right pr-3 select-none text-[11px]">
                        {item.leftLineNum ?? ''}
                      </span>
                      <span className="w-12 text-slate-500 text-right pr-4 select-none text-[11px]">
                        {item.rightLineNum ?? ''}
                      </span>
                      <span className="w-6 font-bold select-none text-slate-400">
                        {item.added ? '+' : item.removed ? '-' : ' '}
                      </span>
                      <span className="break-all whitespace-pre-wrap">{item.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                /* SPLIT / SIDE-BY-SIDE VIEW */
                <div className="font-mono text-xs leading-relaxed divide-y divide-white/5">
                  {result.lines.map((item, idx) => (
                    <div
                      key={idx}
                      className={`grid grid-cols-2 divide-x divide-white/5 ${
                        item.added
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : item.removed
                          ? 'bg-rose-500/15 text-rose-300'
                          : 'text-slate-300'
                      }`}
                    >
                      {/* Left Side (Original) */}
                      <div className="flex items-center px-3 py-1.5 min-w-0">
                        <span className="w-8 text-slate-500 text-right pr-2 shrink-0 select-none text-[11px]">
                          {item.removed || (!item.added && !item.removed) ? item.leftLineNum : ''}
                        </span>
                        <span className="break-all whitespace-pre-wrap truncate">
                          {item.removed || (!item.added && !item.removed) ? item.value : ''}
                        </span>
                      </div>

                      {/* Right Side (Modified) */}
                      <div className="flex items-center px-3 py-1.5 min-w-0">
                        <span className="w-8 text-slate-500 text-right pr-2 shrink-0 select-none text-[11px]">
                          {item.added || (!item.added && !item.removed) ? item.rightLineNum : ''}
                        </span>
                        <span className="break-all whitespace-pre-wrap truncate">
                          {item.added || (!item.added && !item.removed) ? item.value : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
