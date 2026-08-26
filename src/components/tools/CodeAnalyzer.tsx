'use client'

import AdSense from '@/components/AdSense'
import { ADS_CONFIG } from '@/config/ads'
import {
  BrainCircuit,
  Bug,
  Check,
  Code2,
  Copy,
  CreditCard,
  FileCode,
  Key,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Zap,
  FileUp,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { toast } from 'sonner'

import { ToolHeader } from '@/components/converter/ToolHeader'
import {
  canConsumeCredit,
  consumeCredit,
  getUserCredits,
  setCustomApiKey,
  syncUserCreditsWithCloud,
  type UserCredits,
} from '@/utils/creditsManager'
import { createClient } from '@/lib/supabase/client'

import { PrivacyBanner } from '@/components/converter/PrivacyBanner'
import { PricingModal } from '@/components/pricing/PricingModal'
import CodeEditor from '@/components/CodeEditor'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

const LANGUAGES = [
  'typescript',
  'javascript',
  'python',
  'sql',
  'html',
  'css',
  'go',
  'rust',
  'java',
  'csharp',
  'php',
  'yaml',
]

const EXTENSION_MAP: Record<string, string> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  py: 'python',
  sql: 'sql',
  html: 'html',
  css: 'css',
  go: 'go',
  rs: 'rust',
  java: 'java',
  cs: 'csharp',
  php: 'php',
  yaml: 'yaml',
  yml: 'yaml',
  json: 'json',
  sh: 'bash',
  md: 'markdown',
}


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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = useMemo(() => createClient(), [])

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
  }, [supabase])


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    const detected = EXTENSION_MAP[ext]

    if (detected && LANGUAGES.includes(detected)) {
      setLanguage(detected)
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        setCode(content)
        toast.success(`Loaded ${file.name}${detected ? ` (${detected})` : ''}`)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }



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
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
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

      {/* ── Top Options & Action Controls Bar ── */}
      <Card className="rounded-3xl shadow-xl border border-purple-500/25 bg-[#16213e] mb-6">
        <CardContent className="p-4 md:p-5 flex flex-wrap items-center justify-between gap-4">
          {/* Language Selector Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mr-1">Language:</span>
            {LANGUAGES.slice(0, 8).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2.5 py-1 rounded-lg border text-xs font-mono capitalize transition-all ${
                  language === lang
                    ? 'bg-purple-600 text-white border-purple-500 font-semibold shadow-md'
                    : 'bg-black/30 border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Quick Actions & Audit Submit */}
          <div className="flex items-center gap-2 ml-auto">
            <input
              ref={fileInputRef}
              type="file"
              accept=".ts,.tsx,.js,.jsx,.py,.sql,.html,.css,.go,.rs,.java,.cs,.cpp,.c,.php,.yaml,.yml,.sh,.md"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              size="xs"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="border-purple-500/30 text-cyan-300 hover:bg-cyan-500/10 text-xs gap-1.5"
            >
              <FileUp className="size-3.5" />
              Upload File
            </Button>

            <Button
              size="xs"
              variant="ghost"
              onClick={() => setCode(SAMPLE_CODE)}
              className="text-purple-300 hover:bg-purple-500/10 text-xs"
            >
              <Sparkles className="size-3 mr-1 text-purple-400" />
              Sample
            </Button>

            <Button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="bg-linear-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold text-xs px-5 py-2 rounded-xl shadow-lg shadow-purple-600/25 gap-2"
            >
              {isLoading ? (
                <RotateCcw className="size-3.5 animate-spin" />
              ) : (
                <BrainCircuit className="size-3.5" />
              )}
              {isLoading ? 'Analyzing...' : 'Run AI Code Audit'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Side-by-Side Editor & AI Audit Results ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Source Code Input */}
        <div className="space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Code2 className="size-3.5 text-purple-400" />
              Source Code ({language})
            </Label>
            <Badge variant="outline" className="text-[10px] border-white/10 text-slate-400 font-mono">
              {code.length} chars
            </Badge>
          </div>

          <CodeEditor
            value={code}
            onChange={(v) => setCode(v || '')}
            language={language}
            height="500px"
          />
        </div>

        {/* Right: AI Audit Output & Refactored Code */}
        <div className="space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-cyan-400" />
              AI Code Review &amp; Suggestions
            </Label>
            {analysisResult && (
              <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-300 font-mono">
                Audit Completed
              </Badge>
            )}
          </div>

          {analysisResult ? (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {/* Score Header Card */}
              <div className="p-4 rounded-2xl bg-black/40 border border-purple-500/30 flex items-center gap-4">
                <div
                  className={`size-14 rounded-xl flex items-center justify-center font-mono text-xl font-extrabold border shadow-lg shrink-0 ${
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
                  <h3 className="font-bold text-slate-100 text-sm">Code Health Score</h3>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{analysisResult.summary}</p>
                </div>
              </div>

              {/* Security & Performance Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Security Tips */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-rose-500/30 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-400">
                    <Bug className="size-3.5" />
                    <span>Security Audits</span>
                  </div>
                  <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                    {analysisResult.securityTips.map((tip, i) => (
                      <li key={i} className="leading-relaxed">{tip}</li>
                    ))}
                  </ul>
                </div>

                {/* Performance Tips */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-cyan-500/30 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400">
                    <Lightbulb className="size-3.5" />
                    <span>Optimizations</span>
                  </div>
                  <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                    {analysisResult.performanceTips.map((tip, i) => (
                      <li key={i} className="leading-relaxed">{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Refactored Clean Code */}
              {analysisResult.refactoredCode && (
                <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Code2 className="size-3.5" />
                      Refactored Production Code
                    </span>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleCopyText('refactored', analysisResult.refactoredCode)}
                      className="h-6 text-xs text-emerald-300 hover:bg-emerald-500/10"
                    >
                      {copiedKey === 'refactored' ? (
                        <Check className="size-3 mr-1 text-emerald-400" />
                      ) : (
                        <Copy className="size-3 mr-1" />
                      )}
                      {copiedKey === 'refactored' ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                  <CodeEditor
                    value={analysisResult.refactoredCode}
                    language={language}
                    height="220px"
                    readOnly
                  />
                </div>
              )}

              {/* Unit Test Code */}
              {analysisResult.unitTestCode && (
                <div className="p-3.5 rounded-2xl bg-black/40 border border-purple-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                      <FileCode className="size-3.5" />
                      Automated Unit Tests
                    </span>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleCopyText('unitTest', analysisResult.unitTestCode)}
                      className="h-6 text-xs text-purple-300 hover:bg-purple-500/10"
                    >
                      {copiedKey === 'unitTest' ? (
                        <Check className="size-3 mr-1 text-emerald-400" />
                      ) : (
                        <Copy className="size-3 mr-1" />
                      )}
                      {copiedKey === 'unitTest' ? 'Copied' : 'Copy Tests'}
                    </Button>
                  </div>
                  <CodeEditor
                    value={analysisResult.unitTestCode}
                    language={language}
                    height="220px"
                    readOnly
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="h-[540px] flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-purple-500/20 bg-[#16213e]/30 space-y-3">
              <BrainCircuit className="size-10 text-purple-400/60 animate-pulse" />
              <p className="text-sm font-semibold text-slate-200">AI Code Audit Dashboard</p>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Paste your code on the left and click <strong>&quot;Run AI Code Audit&quot;</strong> to inspect OWASP vulnerabilities, performance bottlenecks, and generate production refactoring.
              </p>
            </div>
          )}
        </div>
      </div>


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
              <Label htmlFor="custom-gemini-key-codeanalyzer" className="text-xs text-slate-400 cursor-pointer">Gemini API Key:</Label>
              <Input
                id="custom-gemini-key-codeanalyzer"
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
