'use client'

import React, { useState, useMemo } from 'react'
import { toast } from 'sonner'
import {
  Copy,
  Trash2,
  Check,
  AlertTriangle,
  Clock,
  BookOpen,
  } from 'lucide-react'
import AdSense from '@/components/AdSense'
import { ADS_CONFIG } from '@/config/ads'

import {
  parseCronExpression,
  CRON_PRESETS,
  type CronPreset,
  type CronParseResult,
} from '@/utils/cronBuilder'
import { ToolHeader } from '@/components/converter/ToolHeader'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { PrivacyBanner } from '@/components/converter/PrivacyBanner'


export default function CronBuilder() {
  const [expression, setExpression] = useState('*/5 * * * *')
  const [copiedExpr, setCopiedExpr] = useState(false)

  // Compute cron parse result live
  const result: CronParseResult = useMemo(() => {
    return parseCronExpression(expression)
  }, [expression])

  const handleApplyPreset = (preset: CronPreset) => {
    setExpression(preset.expression)
    toast.success(`Applied ${preset.name} (${preset.expression})`)
  }

  const handleFieldChange = (index: number, value: string) => {
    const parts = expression.trim().split(/\s+/)
    while (parts.length < 5) parts.push('*')
    parts[index] = value.trim() || '*'
    setExpression(parts.join(' '))
  }

  const handleCopyExpression = async () => {
    if (!expression) return
    await navigator.clipboard.writeText(expression)
    setCopiedExpr(true)
    toast.success('Copied Cron expression to clipboard!')
    setTimeout(() => setCopiedExpr(false), 2000)
  }

  const handleClear = () => {
    setExpression('* * * * *')
    toast.info('Reset cron expression')
  }

  const currentFields = useMemo(() => {
    const parts = expression.trim().split(/\s+/)
    return [
      parts[0] ?? '*',
      parts[1] ?? '*',
      parts[2] ?? '*',
      parts[3] ?? '*',
      parts[4] ?? '*',
    ]
  }, [expression])

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* ── Header ── */}
      <ToolHeader
        title="Cron Expression Generator & Parser"
        description="Build, validate, and convert 5-field crontab expressions with human-readable schedule explanations and next execution previews."
        badgeText="Crontab Builder"
      />

      {/* ── Privacy Banner ── */}
      <PrivacyBanner />

      {/* ── Presets Quick Bar ── */}
      <div className="mb-6 p-4 rounded-2xl bg-[#16213e]/80 border border-purple-500/20 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400 mb-2.5">
          <BookOpen className="size-4" />
          <span>Cron Schedule Presets</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {CRON_PRESETS.map((preset) => (
            <Button
              key={preset.name}
              size="xs"
              variant="outline"
              onClick={() => handleApplyPreset(preset)}
              className="bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/25 hover:text-white transition-all text-xs"
            >
              {preset.name} ({preset.expression})
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
          {/* Main Cron Expression Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Cron Expression (5 Fields)
              </Label>

              <div className="flex items-center gap-2">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={handleCopyExpression}
                  className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 text-xs gap-1.5"
                >
                  {copiedExpr ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                  {copiedExpr ? 'Copied' : 'Copy Expression'}
                </Button>

                <Button
                  size="xs"
                  variant="ghost"
                  onClick={handleClear}
                  className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs"
                >
                  <Trash2 className="size-3.5 mr-1" />
                  Reset
                </Button>
              </div>
            </div>

            <div className="flex items-center rounded-2xl bg-black/40 border border-purple-500/30 overflow-hidden p-2 transition-all">
              <input
                type="text"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="*/5 * * * *"
                className="w-full bg-transparent font-mono text-xl text-purple-300 focus:outline-none px-3"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Validation Status & Human Description Alert */}
          {!result.isValid ? (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
              <AlertTriangle className="size-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-400">Invalid Cron Expression</p>
                <p className="text-rose-300/90 mt-0.5">{result.error}</p>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                Human-Readable Schedule
              </span>
              <p className="text-base font-semibold text-purple-200">
                {result.humanDescription}
              </p>
            </div>
          )}

          {/* Individual 5-Field Interactive Editors */}
          {result.isValid && (
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Interactive 5-Field Editor
              </Label>
              <div className="grid grid-cols-5 gap-3">
                {result.fields.map((f, i) => (
                  <div
                    key={f.name}
                    className="p-3 rounded-2xl bg-black/40 border border-purple-500/20 text-center space-y-1.5"
                  >
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">
                      {f.name}
                    </span>
                    <Input
                      type="text"
                      value={currentFields[i]}
                      onChange={(e) => handleFieldChange(i, e.target.value)}
                      className="font-mono text-center text-sm font-bold bg-black/50 border-purple-500/30 text-purple-300 h-9"
                    />
                    <span className="text-[10px] text-slate-500 block truncate" title={f.description}>
                      {f.description.split(':')[1]?.trim() ?? ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next 5 Upcoming Execution Previews */}
          {result.isValid && result.nextExecutions.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-cyan-400" />
                <Label className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                  Next Scheduled Executions
                </Label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
                {result.nextExecutions.map((dateObj, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-black/40 border border-cyan-500/20 text-xs space-y-0.5"
                  >
                    <span className="text-[10px] font-bold text-cyan-400 block">
                      #{idx + 1} Execution
                    </span>
                    <p className="font-mono font-semibold text-slate-200 text-[11px]">
                      {dateObj.toLocaleTimeString()}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {dateObj.toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
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
