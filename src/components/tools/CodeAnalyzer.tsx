'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  BrainCircuit,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Zap,
  Lock,
  Key,
  CreditCard,
  Code2,
  Bug,
  Lightbulb,
  FileCode,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import AdSense from '@/components/AdSense'
import { ADS_CONFIG } from '@/config/ads'

import {
  getUserCredits,
  setCustomApiKey,
  consumeCredit,
  canConsumeCredit,
  type UserCredits,
} from '@/utils/creditsManager'
import { ToolHeader } from '@/components/converter/ToolHeader'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { PrivacyBanner } from '@/components/converter/PrivacyBanner'

const LANGUAGES = [
  'typescript',
  'javascript',
  'python',
  'sql',
  'html',
  'java',
  'csharp',
  'rust',
  'go',
]

const SAMPLE_CODE = `async function getUserData(userId) {
  const res = await fetch('/api/users?id=' + userId);
  const data = await res.json();
  if (data) {
    console.log("Found user:", data);
    return data;
  }
  return null;
}`

export default function CodeAnalyzer() {
  const [code, setCode] = useState(SAMPLE_CODE)
  const [language, setLanguage] = useState('typescript')
  const [userCredits, setUserCredits] = useState<UserCredits>({
    freeCreditsRemaining: 5,
    purchasedCredits: 0,
    isProSubscriber: false,
    lastDailyResetDate: '',
  })
  const [customKeyInput, setCustomKeyInput] = useState('')
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [showCreditsModal, setShowCreditsModal] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<{
    score: number
    summary: string
    securityTips: string[]
    performanceTips: string[]
    refactoredCode: string
    unitTestCode: string
  } | null>(null)

  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  useEffect(() => {
    const creds = getUserCredits()
    setUserCredits(creds)
    if (creds.userCustomApiKey) {
      setCustomKeyInput(creds.userCustomApiKey)
    }
  }, [])

  const handleSaveApiKey = () => {
    setCustomApiKey(customKeyInput)
    const updated = getUserCredits()
    setUserCredits(updated)
    setShowKeyModal(false)
    toast.success('Custom Gemini API Key saved! You now have unlimited free access.')
  }

  const handleAnalyze = async () => {
    if (!code.trim()) {
      toast.error('Please enter code to analyze.')
      return
    }

    const check = canConsumeCredit()
    if (!check.allowed) {
      setShowCreditsModal(true)
      toast.error('Daily credit limit reached.', { description: check.reason })
      return
    }

    setIsLoading(true)
    setAnalysisResult(null)

    try {
      const res = await fetch('/api/ai/code-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          customApiKey: userCredits.userCustomApiKey || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze code.')
      }

      setAnalysisResult(data.data)
      const updatedCreds = consumeCredit()
      setUserCredits(updatedCreds)
      toast.success('AI Code Analysis Complete!')
    } catch (err) {
      toast.error('Analysis Error', { description: (err as Error).message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyText = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedKey(key)
    toast.success(`Copied ${key} code to clipboard!`)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* ── Header ── */}
      <ToolHeader
        title="AI Code Reviewer & Architect"
        description="Paste code to receive instant AI security vulnerability audits (OWASP), performance optimization tips, refactored clean code, and automated unit tests."
        badgeText="AI Powered"
      />

      {/* ── Privacy Banner ── */}
      <PrivacyBanner />

      {/* ── Credits & Settings Top Banner ── */}
      <div className="mb-6 p-4 rounded-2xl bg-[#16213e]/90 border border-purple-500/30 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shrink-0">
            <Zap className="size-4 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                AI Generation Credits
              </span>
              {userCredits.userCustomApiKey ? (
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                  BYOK Unlimited 🔑
                </Badge>
              ) : (
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px]">
                  {userCredits.freeCreditsRemaining}/5 Free Today
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {userCredits.userCustomApiKey
                ? 'Using your custom Gemini API key for unlimited requests.'
                : `${userCredits.freeCreditsRemaining} free credits left today. Reset daily.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="xs"
            variant="outline"
            onClick={() => setShowKeyModal(true)}
            className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20 text-xs gap-1.5"
          >
            <Key className="size-3.5" />
            {userCredits.userCustomApiKey ? 'Edit API Key' : 'Add Custom API Key'}
          </Button>

          <Button
            size="xs"
            onClick={() => setShowCreditsModal(true)}
            className="bg-linear-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold text-xs gap-1.5 shadow-md"
          >
            <CreditCard className="size-3.5" />
            Buy Credit Pack
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
          {/* Language Selector Pills */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Programming Language
            </Label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-mono capitalize transition-all ${
                    language === lang
                      ? 'bg-purple-600 text-white border-purple-500 font-semibold shadow-md'
                      : 'bg-black/30 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Code Input Textarea */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Code Snippet to Review
              </Label>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => setCode(SAMPLE_CODE)}
                className="text-purple-300 hover:bg-purple-500/10 text-xs"
              >
                <Sparkles className="size-3 mr-1 text-purple-400" />
                Load Sample Code
              </Button>
            </div>

            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste code snippet here for AI review..."
              className="h-52 font-mono text-sm resize-y leading-relaxed bg-black/40 text-slate-100 border border-purple-500/30"
              spellCheck={false}
            />
          </div>

          {/* Action Submit Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="bg-linear-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold text-sm px-8 py-2.5 rounded-xl shadow-lg shadow-purple-600/25 gap-2"
            >
              {isLoading ? (
                <RotateCcw className="size-4 animate-spin" />
              ) : (
                <BrainCircuit className="size-4" />
              )}
              {isLoading ? 'Analyzing Code with AI...' : 'Run AI Code Audit'}
            </Button>
          </div>

          {/* ── AI Analysis Output Dashboard ── */}
          {analysisResult && (
            <div className="space-y-6 pt-4 border-t border-purple-500/20">
              {/* Score Header Card */}
              <div className="p-5 rounded-2xl bg-black/40 border border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`size-16 rounded-2xl flex items-center justify-center font-mono text-2xl font-extrabold border shadow-lg ${
                      analysisResult.score >= 80
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : analysisResult.score >= 50
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {analysisResult.score}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-base">Code Health Score</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{analysisResult.summary}</p>
                  </div>
                </div>
              </div>

              {/* Security & Performance Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Security Tips */}
                <div className="p-4 rounded-2xl bg-black/40 border border-rose-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
                    <Bug className="size-4" />
                    <span>Security & Vulnerabilities</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                    {analysisResult.securityTips.map((tip, i) => (
                      <li key={i} className="leading-relaxed">{tip}</li>
                    ))}
                  </ul>
                </div>

                {/* Performance Tips */}
                <div className="p-4 rounded-2xl bg-black/40 border border-cyan-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                    <Lightbulb className="size-4" />
                    <span>Performance Optimizations</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                    {analysisResult.performanceTips.map((tip, i) => (
                      <li key={i} className="leading-relaxed">{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Refactored Clean Code */}
              {analysisResult.refactoredCode && (
                <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Code2 className="size-4" />
                      Refactored Production Code
                    </span>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleCopyText('refactored', analysisResult.refactoredCode)}
                      className="h-7 text-xs text-emerald-300 hover:bg-emerald-500/10"
                    >
                      {copiedKey === 'refactored' ? (
                        <Check className="size-3 mr-1 text-emerald-400" />
                      ) : (
                        <Copy className="size-3 mr-1" />
                      )}
                      {copiedKey === 'refactored' ? 'Copied' : 'Copy Code'}
                    </Button>
                  </div>
                  <pre className="p-3.5 rounded-xl bg-black/60 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed border border-white/5">
                    {analysisResult.refactoredCode}
                  </pre>
                </div>
              )}

              {/* Unit Test Code */}
              {analysisResult.unitTestCode && (
                <div className="p-4 rounded-2xl bg-black/40 border border-purple-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                      <FileCode className="size-4" />
                      Recommended Unit Tests
                    </span>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleCopyText('unitTest', analysisResult.unitTestCode)}
                      className="h-7 text-xs text-purple-300 hover:bg-purple-500/10"
                    >
                      {copiedKey === 'unitTest' ? (
                        <Check className="size-3 mr-1 text-emerald-400" />
                      ) : (
                        <Copy className="size-3 mr-1" />
                      )}
                      {copiedKey === 'unitTest' ? 'Copied' : 'Copy Tests'}
                    </Button>
                  </div>
                  <pre className="p-3.5 rounded-xl bg-black/60 font-mono text-xs text-purple-300 overflow-x-auto leading-relaxed border border-white/5">
                    {analysisResult.unitTestCode}
                  </pre>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Custom API Key Modal ── */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16213e] border border-purple-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Key className="size-4 text-purple-400" />
                Custom Gemini API Key
              </h3>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Enter your Google Gemini API Key for 100% unlimited free AI code reviews. Your API key is stored locally in your browser and never sent to our servers.
            </p>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400">Gemini API Key:</Label>
              <Input
                type="password"
                value={customKeyInput}
                onChange={(e) => setCustomKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="font-mono text-xs bg-black/40 border-purple-500/30 text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowKeyModal(false)}
                className="text-slate-300 hover:text-white"
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveApiKey} className="bg-purple-600 hover:bg-purple-500 text-white font-semibold">
                Save Key
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Buy Credits Modal ── */}
      {showCreditsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16213e] border border-purple-500/40 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <CreditCard className="size-4 text-purple-400" />
                Buy Credits or Go Pro
              </h3>
              <button
                onClick={() => setShowCreditsModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Starter Pack */}
              <div className="p-4 rounded-2xl bg-black/40 border border-purple-500/30 space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-purple-300">Starter Pack</h4>
                  <p className="font-mono text-xl font-bold text-white mt-1">R$ 14,90</p>
                  <p className="text-xs text-slate-400 mt-1">50 AI Code Credits (Never expire)</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    toast.info('Redirecting to Stripe / Pix Checkout...')
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs"
                >
                  Buy 50 Credits
                </Button>
              </div>

              {/* Pro Pack */}
              <div className="p-4 rounded-2xl bg-black/40 border border-cyan-500/30 space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-cyan-300">Pro Pack</h4>
                  <p className="font-mono text-xl font-bold text-white mt-1">R$ 34,90</p>
                  <p className="text-xs text-slate-400 mt-1">150 AI Code Credits (Never expire)</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    toast.info('Redirecting to Stripe / Pix Checkout...')
                  }}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs"
                >
                  Buy 150 Credits
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
