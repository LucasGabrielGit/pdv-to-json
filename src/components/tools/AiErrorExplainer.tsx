'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
import {
  Bug,
  Sparkles,
  Zap,
  RotateCcw,
  Copy,
  Check,
  Trash2,
  Terminal,
  ShieldCheck,
  AlertOctagon,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react'
import { ToolHeader } from '@/components/converter/ToolHeader'
import { PrivacyBanner } from '@/components/converter/PrivacyBanner'
import { ProBadge } from '@/components/pro/ProBadge'
import { ProGateModal } from '@/components/pro/ProGateModal'
import { useProStatus } from '@/hooks/useProStatus'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const ERROR_SAMPLES = [
  {
    name: 'React Hydration Mismatch',
    text: `Error: Hydration failed because the initial UI does not match what was rendered on the server.
Warning: Expected server HTML to contain a matching <span> in <div>.
See more info here: https://nextjs.org/docs/messages/react-hydration-error
    at HomePage (src/app/page.tsx:42:15)
    at div
    at AppShell (src/components/layout/AppShell.tsx:28:10)`,
    lang: 'React / Next.js',
  },
  {
    name: 'Python NoneType Traceback',
    text: `Traceback (most recent call last):
  File "app/services/payment.py", line 87, in process_transaction
    user_wallet = user.get_wallet()
  File "app/models/user.py", line 45, in get_wallet
    return self.wallets['default']
TypeError: 'NoneType' object is not subscriptable`,
    lang: 'Python',
  },
  {
    name: 'TypeScript Type Error',
    text: `src/components/UserProfile.tsx:34:12 - error TS2322: Type 'string | undefined' is not assignable to type 'string'.
  Type 'undefined' is not assignable to type 'string'.

34   fullName: user.profile?.name,
               ~~~~~~~~~~~~~~~~~~`,
    lang: 'TypeScript',
  },
  {
    name: 'Docker Build Exit 1',
    text: `Step 6/12 : COPY --from=builder /app/dist ./dist
ERROR: failed to solve: failed to compute cache key: failed to calculate checksum of ref 4f828a: "/app/dist": not found
The command '/bin/sh -c npm run build' returned a non-zero code: 1`,
    lang: 'Docker',
  },
]

interface ErrorAnalysisResult {
  errorType: string
  languageOrFramework: string
  summary: string
  rootCause: string
  solutionCode: string
  explanation: string
  preventionTips: string[]
}

export default function AiErrorExplainer() {
  const [errorInput, setErrorInput] = useState(ERROR_SAMPLES[0].text)
  const [selectedLang, setSelectedLang] = useState('auto')
  const [aiMode, setAiMode] = useState<'turbo' | 'deep'>('turbo')
  const [isLoading, setIsLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<ErrorAnalysisResult | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const {
    requirePro,
    isProModalOpen,
    setIsProModalOpen,
    proModalFeature,
    isProOrByok,
    userCredits,
  } = useProStatus()

  const handleAnalyze = async () => {
    if (!errorInput.trim()) {
      toast.error('Please paste an error log or stack trace.')
      return
    }

    setIsLoading(true)
    setAnalysisResult(null)

    try {
      const res = await fetch('/api/ai/error-explainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorText: errorInput,
          language: selectedLang,
          aiMode,
          customApiKey: userCredits.userCustomApiKey || undefined,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Failed to explain error.')
      }

      setAnalysisResult(json.data)
      toast.success('Error analyzed and solution generated!')
    } catch (err) {
      toast.error((err as Error).message || 'Analysis failed.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedKey(label)
    toast.success(`Copied ${label} to clipboard!`)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-6">
      <ProGateModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        featureName={proModalFeature}
      />

      {/* ── Header ── */}
      <ToolHeader
        title="AI Error & Stack Trace Explainer"
        description="Paste any runtime exception, traceback, compiler error, or Docker build failure. Get root cause analysis, clear Portuguese explanations, and verified solution code."
        badgeText="AI Debugging Engine"
      />

      {/* ── Privacy Banner ── */}
      <PrivacyBanner />

      {/* ── Main Workspace ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input & Config (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border border-purple-500/20 bg-[#16213e]/80 backdrop-blur-md">
            <CardContent className="p-4 space-y-4">
              {/* Presets Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-purple-400" />
                    <span>Sample Errors:</span>
                  </span>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => {
                      setErrorInput('')
                      setAnalysisResult(null)
                    }}
                    className="text-xs text-rose-300 hover:text-white hover:bg-rose-500/10 h-6"
                  >
                    <Trash2 className="size-3 mr-1" />
                    Clear
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {ERROR_SAMPLES.map((sample) => (
                    <button
                      key={sample.name}
                      onClick={() => setErrorInput(sample.text)}
                      className="px-2.5 py-1 rounded-lg bg-black/40 hover:bg-purple-600/30 border border-purple-500/20 text-slate-300 hover:text-white text-xs transition-colors cursor-pointer"
                    >
                      {sample.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stack Hint */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Technology / Stack Hint</label>
                <div className="flex flex-wrap gap-1.5">
                  {['auto', 'TypeScript', 'React', 'Python', 'Docker', 'SQL', 'Go', 'Java'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLang(lang)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer border ${
                        selectedLang === lang
                          ? 'bg-purple-600 text-white border-purple-500 shadow-xs'
                          : 'bg-black/30 border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {lang === 'auto' ? 'Auto-Detect' : lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Input Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Paste Stack Trace or Compiler Log</label>
                <textarea
                  value={errorInput}
                  onChange={(e) => setErrorInput(e.target.value)}
                  placeholder="Paste error traceback, console logs, build errors, or exception messages..."
                  aria-label="Error stack trace input"
                  className="w-full h-64 font-mono text-xs p-3 rounded-xl bg-black/50 border border-white/10 text-slate-200 focus:outline-hidden focus:border-purple-500/50 resize-y leading-relaxed"
                  spellCheck={false}
                />
              </div>

              {/* Toolbar: Speed Mode + Submit */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                {/* Speed Mode Selector */}
                <div className="flex items-center bg-black/40 border border-purple-500/30 rounded-lg p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setAiMode('turbo')}
                    className={`px-2.5 py-1 rounded-md transition-all font-semibold flex items-center gap-1 text-[11px] cursor-pointer ${
                      aiMode === 'turbo'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Fast debugging (~1.2s)"
                  >
                    <Zap className="size-3 text-amber-400" /> Turbo (~1.2s)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      requirePro('Deep Error Debugging Engine', () => setAiMode('deep'))
                    }
                    className={`px-2.5 py-1 rounded-md transition-all font-semibold flex items-center gap-1.5 text-[11px] cursor-pointer ${
                      aiMode === 'deep'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Deep AST & Concurrency analysis (~3.5s)"
                  >
                    <Sparkles className="size-3 text-cyan-400" />
                    <span>Deep (~3.5s)</span>
                    {!isProOrByok && <ProBadge />}
                  </button>
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="bg-linear-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold text-xs px-5 py-2 rounded-xl shadow-lg shadow-purple-600/25 gap-2"
                >
                  {isLoading ? <RotateCcw className="size-3.5 animate-spin" /> : <Bug className="size-3.5" />}
                  {isLoading ? 'Debugging...' : 'Explain & Fix Error'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Structured Solution (7 cols) */}
        <div className="lg:col-span-7">
          {analysisResult ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Header Badges & Executive Summary */}
              <Card className="border border-purple-500/30 bg-[#16213e]/90 backdrop-blur-md">
                <CardContent className="p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-xs font-bold flex items-center gap-1">
                        <AlertOctagon className="size-3" />
                        {analysisResult.errorType}
                      </Badge>
                      <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs font-medium">
                        {analysisResult.languageOrFramework}
                      </Badge>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-slate-400 border-white/10">
                      Mode: {aiMode === 'deep' ? '🧠 Deep Reasoning' : '⚡ Turbo'}
                    </Badge>
                  </div>

                  {/* Summary Callout in PT-BR */}
                  <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1">
                    <div className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                      Resumo do Problema
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed font-medium">
                      {analysisResult.summary}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Technical Root Cause */}
              <Card className="border border-purple-500/20 bg-[#16213e]/80 backdrop-blur-md">
                <CardContent className="p-5 space-y-2">
                  <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb className="size-4" />
                    <span>Causa Raiz Técnica</span>
                  </div>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                    {analysisResult.rootCause}
                  </p>
                </CardContent>
              </Card>

              {/* Recommended Solution Code / Command */}
              <Card className="border border-emerald-500/30 bg-[#16213e]/90 backdrop-blur-md">
                <div className="p-4 border-b border-emerald-500/20 flex items-center justify-between">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="size-4" />
                    <span>Solução Recomendada / Código Corrigido</span>
                  </div>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => handleCopy(analysisResult.solutionCode, 'Solution Code')}
                    className="text-xs border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 gap-1.5"
                  >
                    {copiedKey === 'Solution Code' ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    {copiedKey === 'Solution Code' ? 'Copied' : 'Copy Solution'}
                  </Button>
                </div>
                <CardContent className="p-4 space-y-3">
                  <textarea
                    readOnly
                    value={analysisResult.solutionCode}
                    aria-label="Solution code"
                    className="w-full h-44 font-mono text-xs p-3 rounded-xl bg-black/60 border border-emerald-500/20 text-emerald-300 focus:outline-hidden resize-y leading-relaxed"
                    spellCheck={false}
                  />
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {analysisResult.explanation}
                  </p>
                </CardContent>
              </Card>

              {/* Prevention Tips */}
              {analysisResult.preventionTips && analysisResult.preventionTips.length > 0 && (
                <Card className="border border-purple-500/20 bg-[#16213e]/80 backdrop-blur-md">
                  <CardContent className="p-4 space-y-2.5">
                    <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="size-4" />
                      <span>Como Prevenir no Futuro</span>
                    </div>
                    <div className="space-y-1.5">
                      {analysisResult.preventionTips.map((tip, idx) => (
                        <div key={`tip-${idx}`} className="text-xs text-slate-300 flex items-start gap-2">
                          <CheckCircle2 className="size-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card className="border border-purple-500/10 bg-[#16213e]/40 backdrop-blur-md flex items-center justify-center p-12 text-center h-full min-h-[420px]">
              <div className="space-y-3 max-w-sm">
                <div className="size-12 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
                  <Bug className="size-6" />
                </div>
                <h3 className="text-sm font-bold text-white">Pronto para Depurar</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cole o traceback ou erro ao lado e clique em &quot;Explain &amp; Fix Error&quot; para receber a causa raiz e o código corrigido.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
