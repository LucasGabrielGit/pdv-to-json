'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Sparkles,
  Copy,
  Check,
  Zap,
  Key,
  CreditCard,
  Code2,
  BookOpen,
  Play,
  RotateCcw,
  Wand2,
} from 'lucide-react'
import AdSense from '@/components/AdSense'
import { ADS_CONFIG } from '@/config/ads'

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

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { PrivacyBanner } from '@/components/converter/PrivacyBanner'
import { PricingModal } from '@/components/pricing/PricingModal'
import CodeEditor from '@/components/CodeEditor'


const TYPES = [
  { id: 'full', label: 'Full Module / Function' },
  { id: 'sql', label: 'SQL Query / Schema' },
  { id: 'interface', label: 'TypeScript Interface' },
  { id: 'regex', label: 'Regex Pattern' },
]

const LANGUAGES = [
  'typescript',
  'sql',
  'python',
  'javascript',
  'html',
  'rust',
  'go',
]

const SAMPLE_PROMPT = 'Create a TypeScript function to validate Brazilian CPF and CNPJ document numbers with checksum digit verification.'

export default function CodeGenerator() {
  const [prompt, setPrompt] = useState(SAMPLE_PROMPT)
  const [type, setType] = useState('full')
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
  const [generatorResult, setGeneratorResult] = useState<{
    generatedCode: string
    explanation: string
    usageExample: string
  } | null>(null)

  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const creds = getUserCredits()
    setUserCredits(creds)
    if (creds.userCustomApiKey) {
      setCustomKeyInput(creds.userCustomApiKey)
    }

    // Sync with cloud if authenticated
    syncUserCreditsWithCloud(supabase).then((synced) => {
      setUserCredits(synced)
      if (synced.userCustomApiKey) {
        setCustomKeyInput(synced.userCustomApiKey)
      }
    })
  }, [])


  const handleSaveApiKey = () => {
    setCustomApiKey(customKeyInput)
    const updated = getUserCredits()
    setUserCredits(updated)
    setShowKeyModal(false)
    toast.success('Custom Gemini API Key saved! Unlimited access enabled.')
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe what code you want to generate.')
      return
    }

    const check = canConsumeCredit()
    if (!check.allowed) {
      setShowCreditsModal(true)
      toast.error('Daily credit limit reached.', { description: check.reason })
      return
    }

    setIsLoading(true)
    setGeneratorResult(null)

    try {
      const res = await fetch('/api/ai/code-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          language,
          type,
          customApiKey: userCredits.userCustomApiKey || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate code.')
      }

      setGeneratorResult(data.data)
      const updatedCreds = consumeCredit()
      setUserCredits(updatedCreds)
      toast.success('AI Code Generation Complete!')
    } catch (err) {
      toast.error('Generation Error', { description: (err as Error).message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyText = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedKey(key)
    toast.success(`Copied ${key} to clipboard!`)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* ── Header ── */}
      <ToolHeader
        title="AI Code & SQL Generator"
        description="Describe what you want in plain English and let AI generate clean, production-ready code, SQL queries, TypeScript interfaces, or Regex patterns."
        badgeText="AI Generator"
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
          {/* Generation Type & Language Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Generation Type
              </Label>
              <div className="flex flex-wrap gap-2">
                {TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setType(t.id)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      type === t.id
                        ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                        : 'bg-black/30 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Target Language
              </Label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-mono capitalize transition-all ${
                      language === lang
                        ? 'bg-cyan-600 text-white border-cyan-500 font-semibold shadow-md'
                        : 'bg-black/30 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Prompt Input Textarea */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Describe What You Want to Build
              </Label>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => setPrompt(SAMPLE_PROMPT)}
                className="text-purple-300 hover:bg-purple-500/10 text-xs"
              >
                <Sparkles className="size-3 mr-1 text-purple-400" />
                Load Sample Prompt
              </Button>
            </div>

            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Write a SQL query to get monthly revenue per customer in 2026..."
              className="h-36 font-sans text-sm resize-y leading-relaxed bg-black/40 text-slate-100 border border-purple-500/30"
            />
          </div>

          {/* Action Submit Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              className="bg-linear-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold text-sm px-8 py-2.5 rounded-xl shadow-lg shadow-purple-600/25 gap-2"
            >
              {isLoading ? (
                <RotateCcw className="size-4 animate-spin" />
              ) : (
                <Wand2 className="size-4" />
              )}
              {isLoading ? 'Generating Code with AI...' : 'Generate Code with AI'}
            </Button>
          </div>

          {/* ── AI Generator Output Dashboard ── */}
          {generatorResult && (
            <div className="space-y-6 pt-4 border-t border-purple-500/20">
              {/* Generated Code Box */}
              <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Code2 className="size-4" />
                    AI Generated Code
                  </span>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => handleCopyText('generated', generatorResult.generatedCode)}
                    className="h-7 text-xs text-emerald-300 hover:bg-emerald-500/10"
                  >
                    {copiedKey === 'generated' ? (
                      <Check className="size-3 mr-1 text-emerald-400" />
                    ) : (
                      <Copy className="size-3 mr-1" />
                    )}
                    {copiedKey === 'generated' ? 'Copied' : 'Copy Code'}
                  </Button>
                </div>
                <CodeEditor
                  value={generatorResult.generatedCode}
                  language={language}
                  height="220px"
                  readOnly
                />
              </div>

              {/* Explanation Card */}
              {generatorResult.explanation && (
                <div className="p-4 rounded-2xl bg-black/40 border border-cyan-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                    <BookOpen className="size-4" />
                    <span>How It Works & Logic</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {generatorResult.explanation}
                  </p>
                </div>
              )}

              {/* Usage Example */}
              {generatorResult.usageExample && (
                <div className="p-4 rounded-2xl bg-black/40 border border-purple-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                      <Play className="size-4" />
                      Usage Example
                    </span>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleCopyText('usage', generatorResult.usageExample)}
                      className="h-7 text-xs text-purple-300 hover:bg-purple-500/10"
                    >
                      {copiedKey === 'usage' ? (
                        <Check className="size-3 mr-1 text-emerald-400" />
                      ) : (
                        <Copy className="size-3 mr-1" />
                      )}
                      {copiedKey === 'usage' ? 'Copied' : 'Copy Usage'}
                    </Button>
                  </div>
                  <CodeEditor
                    value={generatorResult.usageExample}
                    language={language}
                    height="180px"
                    readOnly
                  />
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
              Enter your Google Gemini API Key for 100% unlimited free AI generation. Your API key is stored locally in your browser and never sent to our servers.
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

      {/* ── Pricing & Credit Purchase Modal ── */}
      <PricingModal
        isOpen={showCreditsModal}
        onClose={() => setShowCreditsModal(false)}
      />



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
