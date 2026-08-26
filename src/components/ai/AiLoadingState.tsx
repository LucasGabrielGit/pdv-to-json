'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, BrainCircuit, Zap, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface AiLoadingStateProps {
  title?: string
  subtitle?: string
  steps?: string[]
  isPro?: boolean
}

const DEFAULT_STEPS = [
  'Parsing input structure & AST...',
  'Processing with Gemini AI model...',
  'Optimizing code & validating schema...',
  'Formatting final response...',
]

export function AiLoadingState({
  title = 'AI is Processing Your Request...',
  subtitle = 'Deep architectural analysis in progress (average 3-5 seconds)',
  steps = DEFAULT_STEPS,
  isPro = false,
}: AiLoadingStateProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    // Step rotation every 1.4s
    const stepTimer = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % steps.length)
    }, 1400)

    // Elapsed counter
    const elapsedTimer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)

    return () => {
      clearInterval(stepTimer)
      clearInterval(elapsedTimer)
    }
  }, [steps.length])

  return (
    <div className="w-full h-full min-h-125 rounded-2xl border border-purple-500/40 bg-[#0d1527]/90 backdrop-blur-md p-8 flex flex-col items-center justify-center text-center space-y-6 shadow-2xl relative overflow-hidden animate-in fade-in duration-200">
      {/* Background ambient glow */}
      <div className="absolute -top-24 -left-24 size-48 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 size-48 rounded-full bg-cyan-600/15 blur-3xl pointer-events-none" />

      {/* Central animated icon */}
      <div className="relative">
        <div className="size-16 rounded-2xl bg-linear-to-tr from-purple-600/30 to-cyan-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-lg shadow-purple-950/50">
          <BrainCircuit className="size-8 text-cyan-400 animate-pulse" />
        </div>
        <span className="absolute -top-1 -right-1 flex size-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full size-4 bg-cyan-500 text-[9px] text-black font-black items-center justify-center">
            ✦
          </span>
        </span>
      </div>

      {/* Title & Timing info */}
      <div className="space-y-1.5 max-w-md">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center justify-center gap-2">
          <span>{title}</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">{subtitle}</p>
      </div>

      {/* Step progression display */}
      <div className="w-full max-w-sm bg-black/50 border border-purple-500/20 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-purple-300 font-semibold flex items-center gap-1.5">
            <Sparkles className="size-3 text-cyan-400" />
            {steps[currentStepIndex]}
          </span>
          <span className="text-slate-400 font-mono">{elapsedSeconds}s elapsed</span>
        </div>

        {/* Pulsing progress bar */}
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden relative">
          <div className="h-full bg-linear-to-r from-purple-500 via-cyan-400 to-purple-500 rounded-full animate-pulse w-full" />
        </div>
      </div>

      {/* Badges / Plan transparency */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
        {isPro ? (
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 gap-1 text-[10px]">
            👑 Pro Priority Processing Active
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="border-white/10 text-slate-400 bg-white/5 gap-1 text-[10px]"
          >
            <ShieldCheck className="size-3 text-emerald-400" />
            100% Client-Side Privacy
          </Badge>
        )}

        <Badge
          variant="outline"
          className="border-cyan-500/30 text-cyan-300 bg-cyan-500/10 gap-1 text-[10px]"
        >
          <Zap className="size-3" />
          Powered by Gemini 2.5 Flash
        </Badge>
      </div>
    </div>
  )
}
