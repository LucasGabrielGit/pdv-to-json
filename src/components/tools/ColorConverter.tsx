'use client'

import React, { useState, useMemo } from 'react'
import { toast } from 'sonner'
import {
  Palette,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  Sliders,
  Layers,
  Wand2,
} from 'lucide-react'
import AdSense from '@/components/AdSense'
import { ADS_CONFIG } from '@/config/ads'

import {
  parseAndConvertColor,
  type ColorConversionResult,
} from '@/utils/colorConverter'
import { ToolHeader } from '@/components/converter/ToolHeader'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { PrivacyBanner } from '@/components/converter/PrivacyBanner'

const COLOR_PRESETS = [
  { name: 'Purple Accent', hex: '#7c3aed' },
  { name: 'Cyan Glow', hex: '#06b6d4' },
  { name: 'Emerald Success', hex: '#10b981' },
  { name: 'Rose Alert', hex: '#f43f5e' },
  { name: 'Amber Warmth', hex: '#f59e0b' },
  { name: 'Indigo Deep', hex: '#6366f1' },
]

export default function ColorConverter() {
  const [colorInput, setColorInput] = useState('#7c3aed')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // Compute conversion result live
  const result: ColorConversionResult = useMemo(() => {
    return parseAndConvertColor(colorInput)
  }, [colorInput])

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColorInput(e.target.value)
  }

  const handleCopyValue = async (key: string, value: string) => {
    await navigator.clipboard.writeText(value)
    setCopiedKey(key)
    toast.success(`Copied ${key.toUpperCase()} to clipboard!`)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleApplyPreset = (hex: string) => {
    setColorInput(hex)
    toast.success(`Selected color ${hex}`)
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* ── Header ── */}
      <ToolHeader
        title="Color Code Converter & Palette Generator"
        description="Convert colors between HEX, RGB, HSL, and CSS variables with WCAG contrast accessibility checking, shade generation, and swatch palettes."
        badgeText="Color Utilities"
      />

      {/* ── Privacy Banner ── */}
      <PrivacyBanner />

      {/* ── Presets Quick Bar ── */}
      <div className="mb-6 p-4 rounded-2xl bg-[#16213e]/80 border border-purple-500/20 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400 mb-2.5">
          <Palette className="size-4" />
          <span>Preset Brand Colors</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.hex}
              onClick={() => handleApplyPreset(preset.hex)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/5 hover:border-white/20 transition-all text-xs text-slate-200"
            >
              <span
                className="size-3.5 rounded-full shadow-md shrink-0"
                style={{ backgroundColor: preset.hex }}
              ></span>
              <span>{preset.name}</span>
            </button>
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
          {/* Main Color Picker & Input Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Color Swatch Preview Box */}
            <div
              className="relative h-44 rounded-2xl border border-white/10 shadow-2xl flex flex-col justify-between p-4 overflow-hidden transition-all duration-300"
              style={{ backgroundColor: result.hex }}
            >
              <div className="flex justify-between items-center">
                <Badge className="bg-black/60 text-white border-0 backdrop-blur-md text-xs font-mono">
                  {result.hex.toUpperCase()}
                </Badge>

                {/* Native Color Picker trigger */}
                <label className="cursor-pointer bg-white/20 hover:bg-white/30 backdrop-blur-md text-white p-2 rounded-xl border border-white/20 transition-all flex items-center gap-1.5 text-xs font-semibold">
                  <Wand2 className="size-3.5" />
                  <span>Pick Color</span>
                  <input
                    type="color"
                    value={result.hex}
                    onChange={handleColorPickerChange}
                    className="opacity-0 absolute size-0 overflow-hidden"
                  />
                </label>
              </div>

              {/* Text Sample Contrast Overlay */}
              <div className="space-y-1 bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10">
                <p className="text-white text-xs font-semibold">Sample Text (White)</p>
                <p className="text-black text-xs font-semibold">Sample Text (Black)</p>
              </div>
            </div>

            {/* Color Input Controls */}
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Enter Color Code (HEX, RGB, or HSL)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    placeholder="#7c3aed or rgb(124, 58, 237)"
                    className="font-mono text-sm bg-black/40 border-purple-500/30 text-slate-100 h-11"
                  />
                </div>
              </div>

              {/* WCAG Contrast Accessibility Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    result.isWcagWhiteAa
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {result.isWcagWhiteAa ? (
                      <CheckCircle2 className="size-4 text-emerald-400" />
                    ) : (
                      <XCircle className="size-4 text-rose-400" />
                    )}
                    <span>White Text Contrast</span>
                  </div>
                  <span className="font-mono font-bold">{result.contrastRatioWhite}:1</span>
                </div>

                <div
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    result.isWcagBlackAa
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {result.isWcagBlackAa ? (
                      <CheckCircle2 className="size-4 text-emerald-400" />
                    ) : (
                      <XCircle className="size-4 text-rose-400" />
                    )}
                    <span>Black Text Contrast</span>
                  </div>
                  <span className="font-mono font-bold">{result.contrastRatioBlack}:1</span>
                </div>
              </div>
            </div>
          </div>

          {/* Color Formats Conversion Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            {/* HEX */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-purple-500/30 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider block">HEX</span>
                <span className="font-mono text-sm text-slate-100 font-semibold truncate block">
                  {result.hex}
                </span>
              </div>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => handleCopyValue('hex', result.hex)}
                className="h-8 text-slate-300 hover:text-white hover:bg-white/10 shrink-0"
              >
                {copiedKey === 'hex' ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
              </Button>
            </div>

            {/* RGB */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-cyan-500/30 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider block">RGB</span>
                <span className="font-mono text-sm text-slate-100 font-semibold truncate block">
                  {result.rgb}
                </span>
              </div>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => handleCopyValue('rgb', result.rgb)}
                className="h-8 text-slate-300 hover:text-white hover:bg-white/10 shrink-0"
              >
                {copiedKey === 'rgb' ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
              </Button>
            </div>

            {/* HSL */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-amber-500/30 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">HSL</span>
                <span className="font-mono text-sm text-slate-100 font-semibold truncate block">
                  {result.hsl}
                </span>
              </div>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => handleCopyValue('hsl', result.hsl)}
                className="h-8 text-slate-300 hover:text-white hover:bg-white/10 shrink-0"
              >
                {copiedKey === 'hsl' ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
              </Button>
            </div>

            {/* CSS Var */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-500/30 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">CSS Var</span>
                <span className="font-mono text-xs text-slate-100 font-semibold truncate block">
                  {result.cssVar}
                </span>
              </div>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => handleCopyValue('cssVar', result.cssVar)}
                className="h-8 text-slate-300 hover:text-white hover:bg-white/10 shrink-0"
              >
                {copiedKey === 'cssVar' ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
              </Button>
            </div>
          </div>

          {/* Color Palette Swatches (Shades & Tints) */}
          {result.shades.length > 0 && (
            <div className="space-y-4 pt-2">
              {/* Tints (Lighter) */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Tints (Lighter Variations)
                </Label>
                <div className="grid grid-cols-5 gap-2">
                  {result.tints.map((hexVal, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleCopyValue(`tint-${idx}`, hexVal)}
                      className="p-3 rounded-xl border border-white/10 flex flex-col items-center justify-between h-20 transition-all hover:scale-105 shadow-md"
                      style={{ backgroundColor: hexVal }}
                    >
                      <span className="font-mono text-[11px] font-bold text-zinc-900 bg-white/80 px-1.5 py-0.5 rounded shadow">
                        {hexVal}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Shades (Darker) */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Shades (Darker Variations)
                </Label>
                <div className="grid grid-cols-5 gap-2">
                  {result.shades.map((hexVal, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleCopyValue(`shade-${idx}`, hexVal)}
                      className="p-3 rounded-xl border border-white/10 flex flex-col items-center justify-between h-20 transition-all hover:scale-105 shadow-md"
                      style={{ backgroundColor: hexVal }}
                    >
                      <span className="font-mono text-[11px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded shadow">
                        {hexVal}
                      </span>
                    </button>
                  ))}
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
