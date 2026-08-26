'use client'

import React, { useState } from 'react'
import {
  ShieldCheck,
  KeyRound,
  Lock,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  Sliders,
  Eye,
  EyeOff,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import { ToolHeader } from '@/components/converter/ToolHeader'
import { PrivacyBanner } from '@/components/converter/PrivacyBanner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  generateBcryptHash,
  verifyBcryptHash,
  inspectBcryptHash,
  type BcryptGenerateResult,
  type BcryptVerifyResult,
} from '@/utils/bcryptTool'

const SAMPLE_HASH = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'

export default function BcryptGenerator() {
  const [activeTab, setActiveTab] = useState<'generate' | 'verify'>('generate')

  // Generate tab state
  const [plainPassword, setPlainPassword] = useState('SuperSecretP@ssw0rd!')
  const [showPassword, setShowPassword] = useState(false)
  const [rounds, setRounds] = useState(10)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateResult, setGenerateResult] = useState<BcryptGenerateResult | null>(null)

  // Verify tab state
  const [verifyPassword, setVerifyPassword] = useState('SuperSecretP@ssw0rd!')
  const [verifyHashInput, setVerifyHashInput] = useState(SAMPLE_HASH)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verifyResult, setVerifyResult] = useState<BcryptVerifyResult | null>(null)

  const [copied, setCopied] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!plainPassword) {
      toast.error('Please enter a password to hash.')
      return
    }

    setIsGenerating(true)
    try {
      const res = await generateBcryptHash(plainPassword, rounds)
      setGenerateResult(res)
      toast.success(`Generated Bcrypt hash in ${res.durationMs}ms!`)
    } catch (e) {
      toast.error('Hash generation error', {
        description: (e as Error).message,
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleVerify = async () => {
    if (!verifyPassword || !verifyHashInput.trim()) {
      toast.error('Please enter both the password and the hash.')
      return
    }

    setIsVerifying(true)
    try {
      const res = await verifyBcryptHash(verifyPassword, verifyHashInput.trim())
      setVerifyResult(res)
      if (res.isMatch) {
        toast.success('Password MATCHES the hash! ✅')
      } else {
        toast.error('Password does NOT match the hash ❌')
      }
    } catch (e) {
      toast.error('Verification error', {
        description: (e as Error).message,
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    toast.success(`Copied ${label} to clipboard!`)
    setTimeout(() => setCopied(null), 2000)
  }

  const inspected = generateResult
    ? inspectBcryptHash(generateResult.hash)
    : inspectBcryptHash(verifyHashInput)

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <ToolHeader
        title="Bcrypt Hash Generator & Verifier"
        description="Generate secure Bcrypt password hashes with customizable salt rounds and verify password matches 100% locally in your browser."
        badgeText="Client-Side Bcrypt Sandbox"
        toolId="bcrypt-generator"
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
                value="generate"
                className="gap-2 text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white font-medium"
              >
                <Lock className="size-3.5" /> Generate Bcrypt Hash
              </TabsTrigger>
              <TabsTrigger
                value="verify"
                className="gap-2 text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white font-medium"
              >
                <ShieldCheck className="size-3.5" /> Verify &amp; Test Match
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Badge variant="outline" className="border-emerald-500/30 text-emerald-300 text-xs font-mono">
            Zero Server Uploads • Pure Web Crypto
          </Badge>
        </CardContent>
      </Card>

      {/* ── Mode 1: Hash Generator ── */}
      {activeTab === 'generate' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Input Form */}
          <Card className="border border-purple-500/30 bg-[#0d1527] shadow-xl">
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>Plaintext Password / String</span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-purple-300 flex items-center gap-1 text-[11px] font-normal"
                  >
                    {showPassword ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </Label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={plainPassword}
                  onChange={(e) => setPlainPassword(e.target.value)}
                  placeholder="Enter password to hash..."
                  className="h-10 bg-black/40 border-purple-500/30 text-sm font-mono text-white"
                />
              </div>

              {/* Salt Rounds Slider */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <Label className="text-slate-300 flex items-center gap-1.5">
                    <Sliders className="size-3.5 text-purple-400" /> Salt Rounds (Cost Factor):
                  </Label>
                  <span className="text-purple-400 font-mono font-bold">{rounds} rounds</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="14"
                  value={rounds}
                  onChange={(e) => setRounds(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-black/50 rounded-lg appearance-none cursor-pointer accent-purple-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>4 (Fast / Dev)</span>
                  <span>10 (Industry Standard)</span>
                  <span>14 (Very Slow / Strong)</span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold text-xs h-10 gap-2 shadow-md cursor-pointer"
                >
                  {isGenerating ? (
                    <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Lock className="size-4" />
                  )}
                  {isGenerating ? 'Hashing Password...' : 'Generate Bcrypt Hash'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right Column: Generated Hash Result */}
          <div className="space-y-4 flex flex-col justify-between">
            {generateResult ? (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl border border-purple-500/30 bg-[#0d1527] shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                      <Lock className="size-3.5 text-purple-400" /> Generated Bcrypt Hash
                    </span>
                    <Button
                      size="xs"
                      onClick={() => handleCopy(generateResult.hash, 'Bcrypt Hash')}
                      className="h-6 text-xs bg-purple-600 hover:bg-purple-500 text-white gap-1"
                    >
                      {copied === 'Bcrypt Hash' ? <Check className="size-3" /> : <Copy className="size-3" />}
                      {copied === 'Bcrypt Hash' ? 'Copied' : 'Copy'}
                    </Button>
                  </div>

                  <div className="p-3 rounded-xl bg-black/60 font-mono text-xs text-emerald-300 break-all select-all border border-emerald-500/20 leading-relaxed">
                    {generateResult.hash}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1 text-cyan-300">
                      <Clock className="size-3" /> {generateResult.durationMs}ms
                    </span>
                    <span>•</span>
                    <span>Cost: {generateResult.rounds}</span>
                    <span>•</span>
                    <span>Length: {generateResult.hash.length} chars</span>
                  </div>
                </div>

                {/* Hash Anatomy Breakdown */}
                {inspected && (
                  <Card className="border border-purple-500/20 bg-[#0d1527] shadow-xl">
                    <CardContent className="p-5 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                        <Layers className="size-4" /> Bcrypt Hash Format Breakdown
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                          <div className="text-[10px] text-slate-500 uppercase">Algorithm Version</div>
                          <div className="text-purple-300 font-bold">{inspected.version}</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                          <div className="text-[10px] text-slate-500 uppercase">Cost Factor (Rounds)</div>
                          <div className="text-cyan-300 font-bold">{inspected.rounds}</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-0.5 col-span-2">
                          <div className="text-[10px] text-slate-500 uppercase">Salt (22 chars)</div>
                          <div className="text-amber-300 font-bold truncate">{inspected.salt}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-purple-500/30 bg-[#0d1527] p-8 h-full min-h-[300px] flex flex-col items-center justify-center text-center space-y-3 text-slate-400">
                <div className="size-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <KeyRound className="size-6" />
                </div>
                <h4 className="font-semibold text-slate-200 text-sm">Ready to Generate</h4>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  Enter your password on the left, adjust salt rounds if needed, and click Generate.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── Mode 2: Hash Verifier & Matcher ── */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-purple-500/30 bg-[#0d1527] shadow-xl">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Candidate Password to Test
                </Label>
                <Input
                  value={verifyPassword}
                  onChange={(e) => setVerifyPassword(e.target.value)}
                  placeholder="Enter plain password to verify..."
                  className="h-10 bg-black/40 border-purple-500/30 text-sm font-mono text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Bcrypt Hash String ($2a$, $2b$, or $2y$)
                </Label>
                <textarea
                  value={verifyHashInput}
                  onChange={(e) => setVerifyHashInput(e.target.value)}
                  placeholder="$2a$10$..."
                  className="w-full h-24 p-3 rounded-xl bg-black/50 border border-purple-500/30 font-mono text-xs text-slate-200 focus:outline-none focus:border-purple-400/80 resize-none leading-relaxed"
                />
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold text-xs h-10 gap-2 shadow-md cursor-pointer"
                >
                  {isVerifying ? (
                    <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <ShieldCheck className="size-4" />
                  )}
                  {isVerifying ? 'Testing Hash Match...' : 'Verify Password Match'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Verification Result Card */}
          <div className="space-y-4 flex flex-col justify-between">
            {verifyResult ? (
              <div className="space-y-4">
                <div
                  className={`p-6 rounded-2xl border shadow-xl flex flex-col items-center justify-center text-center space-y-3 ${
                    verifyResult.isMatch
                      ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                      : 'border-rose-500/40 bg-rose-950/20 text-rose-300'
                  }`}
                >
                  {verifyResult.isMatch ? (
                    <CheckCircle2 className="size-12 text-emerald-400" />
                  ) : (
                    <XCircle className="size-12 text-rose-400" />
                  )}
                  <h3 className="text-lg font-bold">
                    {verifyResult.isMatch ? 'Password Matches Hash! ✅' : 'Password Does NOT Match ❌'}
                  </h3>
                  <p className="text-xs font-mono opacity-80">
                    Verification took {verifyResult.durationMs}ms
                  </p>
                </div>

                {verifyResult.hashDetails && (
                  <Card className="border border-purple-500/20 bg-[#0d1527] shadow-xl">
                    <CardContent className="p-5 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                        <Layers className="size-4" /> Target Hash Details
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                          <div className="text-[10px] text-slate-500 uppercase">Version</div>
                          <div className="text-purple-300 font-bold">{verifyResult.hashDetails.version}</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                          <div className="text-[10px] text-slate-500 uppercase">Rounds</div>
                          <div className="text-cyan-300 font-bold">{verifyResult.hashDetails.rounds}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-purple-500/30 bg-[#0d1527] p-8 h-full min-h-[300px] flex flex-col items-center justify-center text-center space-y-3 text-slate-400">
                <div className="size-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <ShieldCheck className="size-6" />
                </div>
                <h4 className="font-semibold text-slate-200 text-sm">Verify Password</h4>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  Enter candidate plaintext and the target Bcrypt hash to verify whether they match.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
