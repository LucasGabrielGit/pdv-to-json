'use client'

import React, { useState, useMemo } from 'react'
import { toast } from 'sonner'
import {
  Regex as RegexIcon,
  Copy,
  Download,
  Trash2,
  Check,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Replace,
  Clock,
  Layers,
  Search,
  BookOpen,
} from 'lucide-react'
import AdSense from '@/components/AdSense'
import { ADS_CONFIG } from '@/config/ads'

import {
  testRegex,
  REGEX_PRESETS,
  type RegexPreset,
  type RegexTestResult,
} from '@/utils/regexTester'
import { ToolHeader } from '@/components/converter/ToolHeader'

import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { PrivacyBanner } from '@/components/converter/PrivacyBanner'

const AVAILABLE_FLAGS = [
  { flag: 'g', label: 'global', desc: 'Find all matches rather than stopping after first' },
  { flag: 'i', label: 'case insensitive', desc: 'Ignore uppercase/lowercase distinctions' },
  { flag: 'm', label: 'multiline', desc: '^ and $ match start/end of each line' },
  { flag: 's', label: 'dotAll', desc: '. matches newlines as well' },
  { flag: 'u', label: 'unicode', desc: 'Enable full unicode support' },
]

export default function RegexTester() {
  const [pattern, setPattern] = useState('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}')
  const [flags, setFlags] = useState('g')
  const [testText, setTestText] = useState(
    'Contact our team at support@dev-kit.tech or sales@example.com for help.'
  )
  const [replaceText, setReplaceText] = useState('[REDACTED EMAIL]')
  const [activeTab, setActiveTab] = useState<'matches' | 'replace' | 'highlight'>('matches')
  const [copied, setCopied] = useState(false)

  // Compute test result live
  const result: RegexTestResult = useMemo(() => {
    return testRegex(pattern, flags, testText, replaceText)
  }, [pattern, flags, testText, replaceText])

  const toggleFlag = (flagChar: string) => {
    if (flags.includes(flagChar)) {
      setFlags(flags.replace(flagChar, ''))
    } else {
      setFlags(flags + flagChar)
    }
  }

  const handleApplyPreset = (preset: RegexPreset) => {
    setPattern(preset.pattern)
    setFlags(preset.flags)
    setTestText(preset.sampleText)
    toast.success(`Applied ${preset.name} pattern`)
  }

  const handleCopyMatches = async () => {
    if (!result.matches.length) return
    await navigator.clipboard.writeText(JSON.stringify(result.matches, null, 2))
    setCopied(true)
    toast.success('Copied matches JSON to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyReplaced = async () => {
    if (!result.replacedOutput) return
    await navigator.clipboard.writeText(result.replacedOutput)
    setCopied(true)
    toast.success('Copied replaced text!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    setPattern('')
    setTestText('')
    setReplaceText('')
    toast.info('Cleared inputs')
  }

  // Highlighted text builder
  const highlightedParts = useMemo(() => {
    if (!result.isValid || !result.matches.length || !testText) {
      return [{ text: testText, isMatch: false }]
    }

    const parts: Array<{ text: string; isMatch: boolean; index?: number }> = []
    let lastIndex = 0

    result.matches.forEach((m, idx) => {
      if (m.start > lastIndex) {
        parts.push({ text: testText.substring(lastIndex, m.start), isMatch: false })
      }
      parts.push({ text: m.match, isMatch: true, index: idx })
      lastIndex = m.end
    })

    if (lastIndex < testText.length) {
      parts.push({ text: testText.substring(lastIndex), isMatch: false })
    }

    return parts
  }, [result, testText])

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* ── Header ── */}
      <ToolHeader
        title="Regex Tester & Debugger"
        description="Test, debug, and replace regular expressions in real-time with match highlighting, capture group inspection, and cheat sheet templates."
        badgeText="Real-time Debugger"
      />

      {/* ── Privacy Banner ── */}
      <PrivacyBanner />

      {/* ── Presets Quick Bar ── */}
      <div className="mb-6 p-4 rounded-2xl bg-[#16213e]/80 border border-purple-500/20 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400 mb-2.5">
          <BookOpen className="size-4" />
          <span>Regex Presets & Templates</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {REGEX_PRESETS.map((preset) => (
            <Button
              key={preset.name}
              size="xs"
              variant="outline"
              onClick={() => handleApplyPreset(preset)}
              className="bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/25 hover:text-white transition-all text-xs"
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      {/* ── Main Card ── */}
      <Card
        className="rounded-3xl shadow-2xl overflow-hidden border border-[rgba(124,58,237,0.25)] bg-[#16213e]"
        style={{
          boxShadow: '0 25px 60px rgba(0,0,0,0.4), 0 0 60px rgba(124,58,237,0.04)',
        }}
      >
        <CardContent className="p-6 md:p-8 space-y-6">
          {/* Pattern Input & Flag Selector */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Regular Expression Pattern
              </Label>
              {result.isValid && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-300 font-mono gap-1">
                    <Clock className="size-3" />
                    {result.executionTimeMs} ms
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-xs font-mono ${
                      result.totalMatches > 0
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                        : 'border-slate-500/30 text-slate-400'
                    }`}
                  >
                    {result.totalMatches} {result.totalMatches === 1 ? 'match' : 'matches'}
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex items-center rounded-2xl bg-black/40 border border-purple-500/30 overflow-hidden p-1.5 focus-within:border-purple-500 transition-all">
              <span className="text-purple-400 font-mono text-lg font-bold px-3 select-none">/</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="[a-zA-Z0-9]+"
                className="w-full bg-transparent font-mono text-base text-purple-200 placeholder:text-slate-600 focus:outline-none"
                spellCheck={false}
              />
              <span className="text-purple-400 font-mono text-lg font-bold px-2 select-none">/</span>

              {/* Flags Selector Pills */}
              <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/5 shrink-0">
                {AVAILABLE_FLAGS.map((f) => {
                  const isActive = flags.includes(f.flag)
                  return (
                    <button
                      key={f.flag}
                      onClick={() => toggleFlag(f.flag)}
                      title={`${f.label} (${f.flag}): ${f.desc}`}
                      className={`size-7 rounded-lg font-mono text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      {f.flag}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Validation Status Error Box */}
          {!result.isValid && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
              <AlertTriangle className="size-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-400">Invalid Regular Expression</p>
                <p className="text-rose-300/90 mt-0.5 font-mono">{result.error}</p>
              </div>
            </div>
          )}

          {/* Test String Input */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Test String
            </Label>
            <Textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Paste text here to test your regular expression..."
              className="h-36 font-mono text-sm resize-y leading-relaxed bg-black/35 text-slate-100 border border-[rgba(124,58,237,0.25)]"
              spellCheck={false}
            />
          </div>

          {/* Output Results Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as typeof activeTab)}
            className="pt-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <TabsList className="h-auto gap-1 p-1 rounded-xl bg-black/30 border border-white/5">
                <TabsTrigger
                  value="matches"
                  className="px-4 py-1.5 rounded-lg text-xs font-medium"
                >
                  <Search className="size-3.5 mr-1.5" />
                  Matches ({result.totalMatches})
                </TabsTrigger>
                <TabsTrigger
                  value="highlight"
                  className="px-4 py-1.5 rounded-lg text-xs font-medium"
                >
                  <Layers className="size-3.5 mr-1.5" />
                  Highlighted Text
                </TabsTrigger>
                <TabsTrigger
                  value="replace"
                  className="px-4 py-1.5 rounded-lg text-xs font-medium"
                >
                  <Replace className="size-3.5 mr-1.5" />
                  Substitution
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={handleClear}
                  className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs"
                >
                  <Trash2 className="size-3.5 mr-1" />
                  Clear
                </Button>

                {activeTab === 'matches' && result.matches.length > 0 && (
                  <Button
                    size="xs"
                    onClick={handleCopyMatches}
                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold gap-1"
                  >
                    {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                    {copied ? 'Copied' : 'Copy Matches JSON'}
                  </Button>
                )}
              </div>
            </div>

            {/* TAB 1: MATCHES LIST */}
            <TabsContent value="matches" className="space-y-3 mt-0">
              {result.matches.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-black/30 border border-white/5 text-slate-400 text-xs">
                  No regex matches found in test string.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {result.matches.map((m, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-black/40 border border-purple-500/20 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 font-mono text-[11px]">
                          Match #{i + 1}
                        </Badge>
                        <span className="font-mono text-emerald-300 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {m.match}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                        <span>Range: [{m.start} - {m.end}]</span>
                        {m.groups.length > 0 && (
                          <Badge variant="outline" className="border-cyan-500/30 text-cyan-300 text-[10px]">
                            {m.groups.length} Capture {m.groups.length === 1 ? 'Group' : 'Groups'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* TAB 2: HIGHLIGHTED TEXT PREVIEW */}
            <TabsContent value="highlight" className="mt-0">
              <div className="p-4 rounded-2xl bg-black/40 border border-purple-500/20 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words max-h-80 overflow-y-auto text-slate-300">
                {highlightedParts.map((part, i) =>
                  part.isMatch ? (
                    <mark
                      key={i}
                      className="bg-purple-500/30 text-purple-200 border-b-2 border-purple-400 px-1 py-0.5 rounded font-semibold"
                    >
                      {part.text}
                    </mark>
                  ) : (
                    <span key={i}>{part.text}</span>
                  )
                )}
              </div>
            </TabsContent>

            {/* TAB 3: SUBSTITUTION / REPLACE */}
            <TabsContent value="replace" className="space-y-3 mt-0">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-400">Replacement String (supports $1, $2):</Label>
                <Input
                  type="text"
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  placeholder="[REDACTED]"
                  className="font-mono text-sm bg-black/40 border-purple-500/30 text-slate-100"
                />
              </div>

              {result.replacedOutput !== undefined && (
                <div className="relative rounded-2xl overflow-hidden border border-purple-500/30 bg-black/40">
                  <Textarea
                    readOnly
                    value={result.replacedOutput}
                    className="h-36 font-mono text-sm resize-y leading-relaxed text-cyan-300 bg-transparent border-0 focus-visible:ring-0"
                  />
                  <div className="absolute top-3 right-3">
                    <Button
                      size="xs"
                      onClick={handleCopyReplaced}
                      className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold gap-1"
                    >
                      {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                      {copied ? 'Copied' : 'Copy Replaced'}
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
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
