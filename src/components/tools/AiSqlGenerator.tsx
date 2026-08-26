'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import {
  Database,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Zap,
  Key,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react'
import {
  getUserCredits,
  setCustomApiKey,
  consumeCredit,
  canConsumeCredit,
  syncUserCreditsWithCloud,
  type UserCredits,
} from '@/utils/creditsManager'
import { createClient } from '@/lib/supabase/client'
import { ToolHeader } from '@/components/converter/ToolHeader'
import { PrivacyBanner } from '@/components/converter/PrivacyBanner'
import { PricingModal } from '@/components/pricing/PricingModal'
import CodeEditor from '@/components/CodeEditor'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const SAMPLE_PROMPT = 'Find the top 5 customers with the highest total purchase amount in 2026 who have made at least 3 distinct orders. Include their full name, email, total spent, and average order value.'

export default function AiSqlGenerator() {
  const [prompt, setPrompt] = useState(SAMPLE_PROMPT)
  const [dialect, setDialect] = useState('postgresql')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    query: string
    explanation: string
    indexSuggestions: string[]
    performanceTips: string[]
  } | null>(null)

  const [userCredits, setUserCredits] = useState<UserCredits>({
    freeCreditsRemaining: 5,
    purchasedCredits: 0,
    isProSubscriber: false,
    lastDailyResetDate: '',
  })
  const [customKeyInput, setCustomKeyInput] = useState('')
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [copied, setCopied] = useState(false)


  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const creds = getUserCredits()
    setUserCredits(creds)
    if (creds.userCustomApiKey) {
      setCustomKeyInput(creds.userCustomApiKey)
    }

    syncUserCreditsWithCloud(supabase).then((synced) => {
      setUserCredits(synced)
      if (synced.userCustomApiKey) {
        setCustomKeyInput(synced.userCustomApiKey)
      }
    })
  }, [supabase])

  const handleSaveApiKey = () => {
    setCustomApiKey(customKeyInput)
    const updated = getUserCredits()
    setUserCredits(updated)
    setShowKeyModal(false)
    toast.success('Custom Gemini API Key saved! Unlimited access enabled.')
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe your SQL query requirement.')
      return
    }

    const check = canConsumeCredit()
    if (!check.allowed) {
      setShowKeyModal(true)
      toast.error('Daily credit limit reached.', { description: check.reason })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/ai/sql-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          dialect,
          customApiKey: userCredits.userCustomApiKey || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate SQL query.')
      }

      setResult(data.data)
      const updatedCreds = consumeCredit()
      setUserCredits(updatedCreds)
      toast.success('SQL Query Generated Successfully!')
    } catch (err) {
      toast.error('Generation Error', { description: (err as Error).message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('SQL copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <ToolHeader
        title="AI SQL Query Generator & Optimizer"
        description="Generate complex SQL queries, analytical aggregations, subqueries, and index recommendations from natural language descriptions."
        category="ai"
      />

      <PrivacyBanner />

      {/* Credit Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 px-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs">
        <div className="flex items-center gap-2 text-purple-300">
          <Zap className="size-4 text-purple-400" />
          <span>
            {userCredits.isProSubscriber
              ? '👑 Pro Member: Unlimited Generations'
              : userCredits.userCustomApiKey
              ? '🔑 Custom Key: Unlimited Access'
              : `AI Credits Remaining: ${userCredits.freeCreditsRemaining + userCredits.purchasedCredits}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowKeyModal(true)}
            className="h-7 text-xs border-purple-500/30 text-purple-300 hover:bg-purple-500/20 gap-1.5"
          >
            <Key className="size-3" />
            {userCredits.userCustomApiKey ? 'Change Gemini Key' : 'Add Own Key (Free)'}
          </Button>

          <Button
            size="sm"
            onClick={() => setShowPricingModal(true)}
            className="h-7 text-xs bg-linear-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold gap-1.5 shadow-xs"
          >
            <Sparkles className="size-3" />
            Buy Credits / Upgrade
          </Button>
        </div>
      </div>


      {/* Main Form Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input */}
        <div className="space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <Label htmlFor="sql-prompt" className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Database className="size-3.5 text-purple-400" />
              Describe What You Want to Query
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-semibold">Dialect:</span>
              <Select
                value={dialect}
                onValueChange={(v) => {
                  if (v) setDialect(v)
                }}
              >
                <SelectTrigger className="h-7 w-32 text-xs bg-black/40 border-purple-500/30 text-white font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#16213e] border-purple-500/30 text-white">
                  <SelectItem value="postgresql">PostgreSQL</SelectItem>
                  <SelectItem value="mysql">MySQL</SelectItem>
                  <SelectItem value="sqlite">SQLite</SelectItem>
                  <SelectItem value="tsql">T-SQL (SQL Server)</SelectItem>
                  <SelectItem value="bigquery">BigQuery</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex-1 rounded-2xl overflow-hidden shadow-xl border border-purple-500/30 bg-[#0d1527] flex flex-col">
            <Textarea
              id="sql-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Find users who have registered in the past 30 days and have made at least 3 distinct orders, calculate average order value and sort by highest spender..."
              className="w-full h-110 font-sans text-sm leading-relaxed p-4 bg-transparent text-slate-100 border-0 resize-none focus-visible:ring-0"
              spellCheck={false}
            />

            <div className="p-3 border-t border-purple-500/20 bg-black/40 flex items-center justify-between">
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setPrompt(SAMPLE_PROMPT)}
                className="text-xs text-purple-300 hover:bg-purple-500/10 gap-1.5"
              >
                <RotateCcw className="size-3" /> Sample Prompt
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={isLoading}
                className="bg-linear-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold text-xs px-5 py-2 rounded-xl shadow-lg shadow-purple-600/25 gap-2"
              >
                {isLoading ? (
                  <span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Sparkles className="size-3.5" />
                )}
                {isLoading ? 'Generating SQL...' : 'Generate SQL Query'}
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div className="space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Database className="size-3.5 text-cyan-400" />
              Generated SQL &amp; Optimization
            </Label>
            {result && (
              <Button
                size="xs"
                onClick={() => handleCopy(result.query)}
                className="h-6 text-xs bg-purple-600 hover:bg-purple-500 text-white font-semibold gap-1"
              >
                {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                Copy SQL
              </Button>
            )}
          </div>

          {result ? (
            <div className="space-y-4 max-h-125 overflow-y-auto pr-1">
              <div className="rounded-2xl border border-purple-500/30 overflow-hidden bg-black/40 shadow-inner">
                <CodeEditor
                  value={result.query}
                  language="sql"
                  readOnly
                  height="280px"
                />
              </div>

              {/* Explanation & Performance */}
              <Card className="border border-purple-500/20 bg-[#16213e]/60 backdrop-blur-md">
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Lightbulb className="size-3.5 text-amber-400" /> Query Logic &amp; Joins:
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed pl-5">
                      {result.explanation}
                    </p>
                  </div>

                  {result.indexSuggestions && result.indexSuggestions.length > 0 && (
                    <div className="space-y-1 pt-2 border-t border-white/10">
                      <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-emerald-400" /> Recommended Indexes:
                      </h4>
                      <div className="space-y-1 pl-5">
                        {result.indexSuggestions.map((idx, i) => (
                          <code key={i} className="block text-[11px] font-mono text-cyan-300 bg-black/40 p-1.5 rounded-lg">
                            {idx}
                          </code>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-125 flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-purple-500/20 bg-[#16213e]/30 space-y-3">
              <Database className="size-10 text-cyan-400/60 animate-pulse" />
              <p className="text-sm font-semibold text-slate-200">Generated Query Canvas</p>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Describe your query requirement on the left and click <strong>&quot;Generate SQL Query&quot;</strong> to get optimized SQL, execution explanations, and index recommendations.
              </p>
            </div>
          )}
        </div>
      </div>


      {/* BYOK Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-purple-500/40 bg-[#16213e] p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="size-4 text-purple-400" /> Custom Gemini API Key (BYOK)
            </h3>
            <p className="text-xs text-slate-300">
              Get your free key from{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 underline font-semibold"
              >
                Google AI Studio
              </a>
              . Your key is stored exclusively in your browser.
            </p>
            <Input
              id="custom-byok-sql-input"
              aria-label="Custom Gemini API Key"
              value={customKeyInput}
              onChange={(e) => setCustomKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="bg-black/40 border-purple-500/30 text-xs font-mono text-white"
            />

            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowKeyModal(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveApiKey} className="bg-purple-600 hover:bg-purple-500 text-white">
                Save Key
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
      />
    </div>
  )
}


