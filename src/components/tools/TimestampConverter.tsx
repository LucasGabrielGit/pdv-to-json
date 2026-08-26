'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import {
  Clock,
  Copy,
  Trash2,
  Check,
  Sparkles,
  Globe,
  Play,
  Pause,
  } from 'lucide-react'
import AdSense from '@/components/AdSense'
import { ADS_CONFIG } from '@/config/ads'

import {
  convertTimestamp,
  type TimestampConversionResult,
} from '@/utils/timestampConverter'
import { ToolHeader } from '@/components/converter/ToolHeader'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { PrivacyBanner } from '@/components/converter/PrivacyBanner'

export default function TimestampConverter() {
  const [currentNow, setCurrentNow] = useState<number>(Date.now())
  const [isClockRunning, setIsClockRunning] = useState(true)
  const [inputVal, setInputVal] = useState<string>('')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // Live ticking clock interval
  useEffect(() => {
    if (!isClockRunning) return
    const timer = setInterval(() => {
      setCurrentNow(Date.now())
    }, 1000)
    return () => clearInterval(timer)
  }, [isClockRunning])

  // Compute conversion result live based on input or current time
  const result: TimestampConversionResult = useMemo(() => {
    if (!inputVal.trim()) {
      return convertTimestamp(currentNow)
    }
    return convertTimestamp(inputVal)
  }, [inputVal, currentNow])

  const handleUseCurrentTime = () => {
    setInputVal(String(Math.floor(Date.now() / 1000)))
    toast.success('Loaded current Unix timestamp')
  }

  const handleDateTimePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return
    const parsed = Date.parse(e.target.value)
    if (!isNaN(parsed)) {
      setInputVal(String(Math.floor(parsed / 1000)))
      toast.success('Timestamp updated from date picker')
    }
  }

  const handleCopyValue = async (key: string, value: string | number) => {
    const valStr = String(value)
    if (!valStr) return
    await navigator.clipboard.writeText(valStr)
    setCopiedKey(key)
    toast.success(`Copied ${key.toUpperCase()} to clipboard!`)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleClear = () => {
    setInputVal('')
    toast.info('Cleared input')
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* ── Header ── */}
      <ToolHeader
        title="Unix Timestamp & Epoch Converter"
        description="Convert between Unix timestamps (seconds & milliseconds), ISO 8601, UTC, local timezones, and human relative dates in real-time."
        badgeText="Real-time Clock"
      />

      {/* ── Privacy Banner ── */}
      <PrivacyBanner />

      {/* ── Live Real-Time Ticking Clock Banner ── */}
      <div className="mb-6 p-5 rounded-2xl bg-[#16213e]/90 border border-purple-500/30 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shrink-0">
            <Clock className="size-5 text-purple-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Live Current Unix Timestamp
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Ticking
              </span>
            </div>
            <p className="font-mono text-xl font-bold text-white mt-0.5">
              {Math.floor(currentNow / 1000)}
              <span className="text-xs text-slate-400 font-normal ml-2">
                ({currentNow} ms)
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsClockRunning(!isClockRunning)}
            className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20 text-xs gap-1.5"
          >
            {isClockRunning ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            {isClockRunning ? 'Pause Clock' : 'Resume Clock'}
          </Button>

          <Button
            size="sm"
            onClick={handleUseCurrentTime}
            className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs gap-1.5"
          >
            <Sparkles className="size-3.5" />
            Use Current Time
          </Button>
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
          {/* Input Controls Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Enter Timestamp (Seconds / Milliseconds) or Date String
              </Label>
              <Input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={`e.g. ${Math.floor(Date.now() / 1000)} or 2026-02-12T15:00:00.000Z`}
                className="font-mono text-sm bg-black/40 border-purple-500/30 text-slate-100 h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Or Select Date & Time Visually
              </Label>
              <Input
                type="datetime-local"
                onChange={handleDateTimePickerChange}
                className="font-mono text-xs bg-black/40 border-purple-500/30 text-slate-200 h-11 cursor-pointer"
              />
            </div>
          </div>

          {!result.isValid && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {result.error}
            </div>
          )}

          {/* Formatted Output Cards Grid */}
          {result.isValid && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Converted Date & Timestamp Formats
                </Label>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-300 font-mono gap-1">
                    <Globe className="size-3" />
                    {result.timezoneName} ({result.timezoneOffset})
                  </Badge>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={handleClear}
                    disabled={!inputVal}
                    className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs"
                  >
                    <Trash2 className="size-3.5 mr-1" />
                    Clear
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Seconds Timestamp */}
                <div className="p-4 rounded-2xl bg-black/40 border border-purple-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                      Unix Timestamp (Seconds)
                    </span>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleCopyValue('seconds', result.timestampSeconds)}
                      className="h-7 text-xs text-purple-300 hover:bg-purple-500/10"
                    >
                      {copiedKey === 'seconds' ? <Check className="size-3 mr-1 text-emerald-400" /> : <Copy className="size-3 mr-1" />}
                      {copiedKey === 'seconds' ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                  <p className="font-mono text-base font-bold text-slate-100 select-all">
                    {result.timestampSeconds}
                  </p>
                </div>

                {/* Milliseconds Timestamp */}
                <div className="p-4 rounded-2xl bg-black/40 border border-purple-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                      Unix Timestamp (Milliseconds)
                    </span>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleCopyValue('ms', result.timestampMs)}
                      className="h-7 text-xs text-purple-300 hover:bg-purple-500/10"
                    >
                      {copiedKey === 'ms' ? <Check className="size-3 mr-1 text-emerald-400" /> : <Copy className="size-3 mr-1" />}
                      {copiedKey === 'ms' ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                  <p className="font-mono text-base font-bold text-slate-100 select-all">
                    {result.timestampMs}
                  </p>
                </div>

                {/* ISO 8601 UTC */}
                <div className="p-4 rounded-2xl bg-black/40 border border-cyan-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                      ISO 8601 (UTC)
                    </span>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleCopyValue('iso', result.isoUtc)}
                      className="h-7 text-xs text-cyan-300 hover:bg-cyan-500/10"
                    >
                      {copiedKey === 'iso' ? <Check className="size-3 mr-1 text-emerald-400" /> : <Copy className="size-3 mr-1" />}
                      {copiedKey === 'iso' ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                  <p className="font-mono text-sm font-semibold text-slate-100 select-all break-all">
                    {result.isoUtc}
                  </p>
                </div>

                {/* Local Date & Time */}
                <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Local Date & Time ({result.timezoneOffset})
                    </span>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleCopyValue('local', result.localDateTime)}
                      className="h-7 text-xs text-emerald-300 hover:bg-emerald-500/10"
                    >
                      {copiedKey === 'local' ? <Check className="size-3 mr-1 text-emerald-400" /> : <Copy className="size-3 mr-1" />}
                      {copiedKey === 'local' ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                  <p className="font-mono text-sm font-semibold text-slate-100 select-all">
                    {result.localDateTime}
                  </p>
                </div>

                {/* UTC String */}
                <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      UTC GMT Format
                    </span>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleCopyValue('utcStr', result.utcString)}
                      className="h-7 text-xs text-amber-300 hover:bg-amber-500/10"
                    >
                      {copiedKey === 'utcStr' ? <Check className="size-3 mr-1 text-emerald-400" /> : <Copy className="size-3 mr-1" />}
                      {copiedKey === 'utcStr' ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                  <p className="font-mono text-sm font-semibold text-slate-100 select-all">
                    {result.utcString}
                  </p>
                </div>

                {/* Relative Time */}
                <div className="p-4 rounded-2xl bg-black/40 border border-rose-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                      Relative Time
                    </span>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleCopyValue('relative', result.relativeTime)}
                      className="h-7 text-xs text-rose-300 hover:bg-rose-500/10"
                    >
                      {copiedKey === 'relative' ? <Check className="size-3 mr-1 text-emerald-400" /> : <Copy className="size-3 mr-1" />}
                      {copiedKey === 'relative' ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                  <p className="font-mono text-sm font-semibold text-slate-100 select-all">
                    {result.relativeTime}
                  </p>
                </div>
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
