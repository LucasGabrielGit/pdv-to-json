'use client'

import React, { useState, useMemo } from 'react'
import {
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Type,
  Maximize2,
  Code2,
} from 'lucide-react'
import { toast } from 'sonner'
import { ToolHeader } from '@/components/converter/ToolHeader'
import { PrivacyBanner } from '@/components/converter/PrivacyBanner'
import CodeEditor from '@/components/CodeEditor'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  calculateFluidClamp,
  convertUnits,
  type FluidClampParams,
} from '@/utils/cssUnits'

export default function CssUnitConverter() {
  const [activeTab, setActiveTab] = useState<'clamp' | 'units'>('clamp')

  // Fluid Clamp State
  const [clampParams, setClampParams] = useState<FluidClampParams>({
    minFontSize: 18,
    maxFontSize: 42,
    minViewport: 375,
    maxViewport: 1440,
    rootFontSize: 16,
    unit: 'rem',
  })

  // Simulated Viewport Slider (for live visual preview)
  const [previewViewport, setPreviewViewport] = useState(768)

  // Single Unit Conversion State
  const [unitValue, setUnitValue] = useState(24)
  const [fromUnit, setFromUnit] = useState<'px' | 'rem' | 'em' | 'vw' | 'vh' | 'pt'>('px')
  const [rootSize, setRootSize] = useState(16)

  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    toast.success(`Copied ${label} to clipboard!`)
    setTimeout(() => setCopied(null), 2000)
  }

  // Calculate Fluid Clamp result
  const clampResult = useMemo(() => {
    return calculateFluidClamp(clampParams)
  }, [clampParams])

  // Calculate dynamic simulated font size in px for preview
  const simulatedSizePx = useMemo(() => {
    const { minFontSize, maxFontSize, minViewport, maxViewport } = clampParams
    if (previewViewport <= minViewport) return minFontSize
    if (previewViewport >= maxViewport) return maxFontSize
    const ratio = (previewViewport - minViewport) / (maxViewport - minViewport)
    return Number((minFontSize + ratio * (maxFontSize - minFontSize)).toFixed(1))
  }, [clampParams, previewViewport])

  // Unit matrix conversions
  const conversions = useMemo(() => {
    return convertUnits(unitValue, fromUnit, rootSize)
  }, [unitValue, fromUnit, rootSize])

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <ToolHeader
        title="CSS Units & Fluid Clamp Converter"
        description="Convert PX, REM, EM, VW, and calculate responsive fluid typography formulas with clamp() and Tailwind CSS classes."
        badgeText="100% Client-Side Responsive Tool"
        toolId="css-units"
      />

      <PrivacyBanner />

      {/* Main Mode Navigation */}
      <Card className="border border-purple-500/20 bg-[#16213e]/60 backdrop-blur-md">
        <CardContent className="p-3 md:p-4 flex flex-wrap items-center justify-between gap-4">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as typeof activeTab)}
          >
            <TabsList className="bg-black/40 border border-white/5 p-1 h-9">
              <TabsTrigger
                value="clamp"
                className="gap-2 text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white font-medium"
              >
                <Type className="size-3.5" /> Fluid Typography clamp()
              </TabsTrigger>
              <TabsTrigger
                value="units"
                className="gap-2 text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white font-medium"
              >
                <Sliders className="size-3.5" /> CSS Unit Matrix (PX ↔ REM)
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2 ml-auto">
            {activeTab === 'clamp' && (
              <Button
                variant="outline"
                size="xs"
                onClick={() =>
                  setClampParams({
                    minFontSize: 18,
                    maxFontSize: 42,
                    minViewport: 375,
                    maxViewport: 1440,
                    rootFontSize: 16,
                    unit: 'rem',
                  })
                }
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 text-xs gap-1.5"
              >
                <RotateCcw className="size-3" /> Reset Defaults
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Mode 1: Fluid Typography Clamp() ── */}
      {activeTab === 'clamp' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Parameters & Live Viewport Simulator */}
          <div className="space-y-4 flex flex-col">
            <Card className="border border-purple-500/30 bg-[#0d1527] shadow-xl">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                    <Sliders className="size-3.5" /> Typography & Viewport Boundaries
                  </h3>
                  <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-300 font-mono">
                    Base: {clampParams.rootFontSize}px
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Min Font Size */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300 flex justify-between">
                      <span>Min Font Size</span>
                      <span className="text-purple-400 font-mono font-semibold">
                        {clampParams.minFontSize}px ({clampResult.minRem}rem)
                      </span>
                    </Label>
                    <Input
                      type="number"
                      value={clampParams.minFontSize}
                      onChange={(e) =>
                        setClampParams({
                          ...clampParams,
                          minFontSize: parseFloat(e.target.value) || 12,
                        })
                      }
                      className="bg-black/40 border-purple-500/30 h-8 text-xs font-mono"
                    />
                  </div>

                  {/* Max Font Size */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300 flex justify-between">
                      <span>Max Font Size</span>
                      <span className="text-cyan-400 font-mono font-semibold">
                        {clampParams.maxFontSize}px ({clampResult.maxRem}rem)
                      </span>
                    </Label>
                    <Input
                      type="number"
                      value={clampParams.maxFontSize}
                      onChange={(e) =>
                        setClampParams({
                          ...clampParams,
                          maxFontSize: parseFloat(e.target.value) || 24,
                        })
                      }
                      className="bg-black/40 border-purple-500/30 h-8 text-xs font-mono"
                    />
                  </div>

                  {/* Min Viewport */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300 flex justify-between">
                      <span>Min Viewport (Mobile)</span>
                      <span className="text-slate-400 font-mono">{clampParams.minViewport}px</span>
                    </Label>
                    <Input
                      type="number"
                      value={clampParams.minViewport}
                      onChange={(e) =>
                        setClampParams({
                          ...clampParams,
                          minViewport: parseFloat(e.target.value) || 320,
                        })
                      }
                      className="bg-black/40 border-purple-500/30 h-8 text-xs font-mono"
                    />
                  </div>

                  {/* Max Viewport */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300 flex justify-between">
                      <span>Max Viewport (Desktop)</span>
                      <span className="text-slate-400 font-mono">{clampParams.maxViewport}px</span>
                    </Label>
                    <Input
                      type="number"
                      value={clampParams.maxViewport}
                      onChange={(e) =>
                        setClampParams({
                          ...clampParams,
                          maxViewport: parseFloat(e.target.value) || 1440,
                        })
                      }
                      className="bg-black/40 border-purple-500/30 h-8 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/5">
                  <span className="text-[11px] text-slate-400 mr-1">Presets:</span>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() =>
                      setClampParams({
                        ...clampParams,
                        minFontSize: 16,
                        maxFontSize: 24,
                      })
                    }
                    className="h-6 text-[10px] border-white/10 text-slate-300"
                  >
                    Body Text (16px → 24px)
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() =>
                      setClampParams({
                        ...clampParams,
                        minFontSize: 24,
                        maxFontSize: 48,
                      })
                    }
                    className="h-6 text-[10px] border-white/10 text-slate-300"
                  >
                    Subheading (24px → 48px)
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() =>
                      setClampParams({
                        ...clampParams,
                        minFontSize: 32,
                        maxFontSize: 72,
                      })
                    }
                    className="h-6 text-[10px] border-white/10 text-slate-300"
                  >
                    Hero Heading (32px → 72px)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Live Interactive Viewport Resizer */}
            <Card className="border border-cyan-500/30 bg-[#0d1527] shadow-xl flex-1 flex flex-col">
              <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                      <Maximize2 className="size-3.5" /> Interactive Viewport Simulator
                    </Label>
                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 font-mono text-xs">
                      Width: {previewViewport}px • Size: {simulatedSizePx}px
                    </Badge>
                  </div>

                  <input
                    type="range"
                    min="320"
                    max="1920"
                    step="10"
                    value={previewViewport}
                    onChange={(e) => setPreviewViewport(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-black/50 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>320px (Mobile)</span>
                    <span>768px (Tablet)</span>
                    <span>1440px (Desktop)</span>
                    <span>1920px (4K)</span>
                  </div>
                </div>

                {/* Visual Preview Box */}
                <div className="p-6 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center min-h-[140px] text-center overflow-hidden">
                  <p
                    style={{ fontSize: `${simulatedSizePx}px`, lineHeight: 1.15 }}
                    className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-cyan-300 transition-all duration-75"
                  >
                    Fluid Heading Text
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Generated Code Output */}
          <div className="space-y-4 flex flex-col">
            <div className="space-y-3">
              {/* Quick Copy Formula Cards */}
              <div className="p-4 rounded-2xl border border-purple-500/30 bg-[#0d1527] shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                    CSS clamp() Value
                  </span>
                  <Button
                    size="xs"
                    onClick={() => handleCopy(clampResult.clampCss, 'CSS clamp()')}
                    className="h-6 text-xs bg-purple-600 hover:bg-purple-500 text-white gap-1"
                  >
                    {copied === 'CSS clamp()' ? <Check className="size-3" /> : <Copy className="size-3" />}
                    {copied === 'CSS clamp()' ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <div className="p-2.5 rounded-xl bg-black/50 font-mono text-xs text-purple-300 border border-purple-500/20 select-all overflow-x-auto">
                  {clampResult.clampCss}
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-cyan-500/30 bg-[#0d1527] shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                    Tailwind CSS Arbitrary Class
                  </span>
                  <Button
                    size="xs"
                    onClick={() => handleCopy(clampResult.tailwindClass, 'Tailwind Class')}
                    className="h-6 text-xs bg-cyan-600 hover:bg-cyan-500 text-white gap-1"
                  >
                    {copied === 'Tailwind Class' ? <Check className="size-3" /> : <Copy className="size-3" />}
                    {copied === 'Tailwind Class' ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <div className="p-2.5 rounded-xl bg-black/50 font-mono text-xs text-cyan-300 border border-cyan-500/20 select-all overflow-x-auto">
                  {clampResult.tailwindClass}
                </div>
              </div>
            </div>

            {/* Full CSS Code Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Code2 className="size-4 text-purple-400" /> Full CSS Rule &amp; Media Query Fallbacks
                </span>
                <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-300 font-mono">
                  Ready to paste
                </Badge>
              </div>
              <CodeEditor
                value={clampResult.cssRule}
                language="css"
                readOnly
                height="260px"
              />
            </div>
          </div>
        </div>
      ) : (
        /* ── Mode 2: Unit Matrix Converter ── */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-purple-500/30 bg-[#0d1527] shadow-xl">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="size-4 text-purple-400" /> Unit Input &amp; Root Configuration
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">Value to Convert</Label>
                  <Input
                    type="number"
                    value={unitValue}
                    onChange={(e) => setUnitValue(parseFloat(e.target.value) || 0)}
                    className="bg-black/40 border-purple-500/30 h-10 text-sm font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">Source Unit</Label>
                  <select
                    value={fromUnit}
                    onChange={(e) => setFromUnit(e.target.value as typeof fromUnit)}
                    className="w-full h-10 px-3 rounded-md bg-black/40 border border-purple-500/30 text-slate-200 text-sm font-mono outline-none"
                  >
                    <option value="px">Pixels (px)</option>
                    <option value="rem">Root EM (rem)</option>
                    <option value="em">Relative EM (em)</option>
                    <option value="vw">Viewport Width (vw)</option>
                    <option value="vh">Viewport Height (vh)</option>
                    <option value="pt">Points (pt)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <Label className="text-xs text-slate-300 flex justify-between">
                  <span>Root Base Font Size (1rem = N px)</span>
                  <span className="text-purple-400 font-mono font-semibold">{rootSize}px</span>
                </Label>
                <Input
                  type="number"
                  value={rootSize}
                  onChange={(e) => setRootSize(parseFloat(e.target.value) || 16)}
                  className="bg-black/40 border-purple-500/30 h-9 text-xs font-mono w-32"
                />
              </div>
            </CardContent>
          </Card>

          {/* Result Matrix Grid */}
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(conversions).map(([unit, val]) => (
              <div
                key={unit}
                className="p-4 rounded-2xl bg-[#0d1527] border border-purple-500/30 shadow-xl flex flex-col justify-between hover:border-purple-400/60 transition-colors"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  <span>{unit.toUpperCase()}</span>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => handleCopy(`${val}${unit === 'percentage' ? '%' : unit}`, unit)}
                    className="h-6 text-[10px] text-purple-300 hover:text-white"
                  >
                    {copied === unit ? <Check className="size-3" /> : <Copy className="size-3" />}
                  </Button>
                </div>
                <div className="text-2xl font-black text-white font-mono mt-2">
                  {val}
                  <span className="text-xs font-normal text-purple-400 ml-1">
                    {unit === 'percentage' ? '%' : unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
