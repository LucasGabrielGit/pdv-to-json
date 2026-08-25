'use client'

import React, { useState, useEffect, useId } from 'react'
import { toast } from 'sonner'
import {
  KeyRound,
  ShieldCheck,
  Copy,
  Check,
  RefreshCw,
  Download,
  Terminal,
  Sparkles,
  Lock,
  Sliders,
  FileCode,
} from 'lucide-react'
import {
  generateSecurePassword,
  calculatePasswordStrength,
  generateApiTokens,
  type PasswordOptions,
  type ApiTokenOptions,
} from '@/utils/tokenGenerator'
import { ToolHeader } from '@/components/converter/ToolHeader'
import { PrivacyBanner } from '@/components/converter/PrivacyBanner'
import CodeEditor from '@/components/CodeEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function TokenGenerator() {
  const [activeTab, setActiveTab] = useState<'password' | 'api-keys'>('password')

  // Password State
  const [pwdOptions, setPwdOptions] = useState<PasswordOptions>({
    length: 24,
    includeUpper: true,
    includeLower: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeAmbiguous: false,
  })
  const [password, setPassword] = useState('')
  const [copiedPwd, setCopiedPwd] = useState(false)

  // API Token State
  const [tokenOptions, setTokenOptions] = useState<ApiTokenOptions>({
    prefix: 'sk_live_',
    length: 32,
    format: 'base64url',
    count: 5,
  })
  const [generatedTokens, setGeneratedTokens] = useState<string[]>([])
  const [copiedTokens, setCopiedTokens] = useState(false)

  // Regenerate Password on Options Change
  const handleRegeneratePassword = () => {
    const pwd = generateSecurePassword(pwdOptions)
    setPassword(pwd)
  }

  useEffect(() => {
    handleRegeneratePassword()
  }, [pwdOptions])

  // Regenerate API Tokens on Options Change
  const handleRegenerateTokens = () => {
    const tokens = generateApiTokens(tokenOptions)
    setGeneratedTokens(tokens)
  }

  useEffect(() => {
    handleRegenerateTokens()
  }, [tokenOptions])

  const strength = calculatePasswordStrength(password)

  const handleCopyPassword = () => {
    if (!password) return
    navigator.clipboard.writeText(password)
    setCopiedPwd(true)
    toast.success('Secure password copied to clipboard!')
    setTimeout(() => setCopiedPwd(false), 2000)
  }

  const handleCopyAllTokens = () => {
    if (generatedTokens.length === 0) return
    navigator.clipboard.writeText(generatedTokens.join('\n'))
    setCopiedTokens(true)
    toast.success(`${generatedTokens.length} tokens copied to clipboard!`)
    setTimeout(() => setCopiedTokens(false), 2000)
  }

  const handleDownloadTokens = () => {
    if (generatedTokens.length === 0) return
    const blob = new Blob([generatedTokens.join('\n')], { type: 'text/plain;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `api_tokens_${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded tokens text file!')
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <ToolHeader
        title="Secure Password & API Key Generator"
        description="Generate cryptographically secure high-entropy passwords, API keys, webhook secrets, and authentication tokens using the browser Web Crypto API."
        badgeText="100% Client-Side Web Crypto"
      />

      <PrivacyBanner />

      {/* ── Mode Tabs ── */}
      <div className="flex items-center justify-center">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="bg-[#16213e] border border-purple-500/30 p-1 rounded-2xl">
            <TabsTrigger value="password" className="text-xs md:text-sm gap-2 px-5 py-2">
              <Lock className="size-4 text-purple-400" />
              Password Generator
            </TabsTrigger>
            <TabsTrigger value="api-keys" className="text-xs md:text-sm gap-2 px-5 py-2">
              <KeyRound className="size-4 text-cyan-400" />
              API Keys &amp; Secrets
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* ── TAB 1: PASSWORD GENERATOR ── */}
      {activeTab === 'password' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Password Display & Strength Card (Left 7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="rounded-3xl border border-purple-500/25 bg-[#16213e] shadow-2xl p-6 md:p-8 space-y-6">
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                  Generated Password
                </Label>
                <div className="relative flex items-center">
                  <Input
                    readOnly
                    value={password}
                    className="h-16 pr-28 text-lg md:text-xl font-mono text-emerald-300 bg-black/50 border-purple-500/30 rounded-2xl shadow-inner tracking-wider"
                  />
                  <div className="absolute right-2 flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleRegeneratePassword}
                      className="size-10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
                      title="Regenerate"
                    >
                      <RefreshCw className="size-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleCopyPassword}
                      className="h-10 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold gap-1.5 shadow-lg shadow-purple-600/25"
                    >
                      {copiedPwd ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
                      {copiedPwd ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Entropy & Strength Meter */}
              <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Password Strength:</span>
                  <span className={`font-bold ${strength.color}`}>{strength.label} ({strength.entropy} bits)</span>
                </div>

                {/* Progress Bar */}
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1">
                  {[0, 1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`h-full flex-1 rounded-full transition-all duration-300 ${
                        step <= strength.score
                          ? strength.score === 0
                            ? 'bg-rose-500'
                            : strength.score === 1
                            ? 'bg-amber-500'
                            : strength.score === 2
                            ? 'bg-yellow-400'
                            : strength.score === 3
                            ? 'bg-emerald-400'
                            : 'bg-cyan-400'
                          : 'bg-slate-700/50'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Estimated crack time:</span>
                  <span className="text-slate-200">{strength.crackTime}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Configuration Controls (Right 5 cols) */}
          <div className="lg:col-span-5">
            <Card className="rounded-3xl border border-purple-500/25 bg-[#16213e] shadow-xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="size-4 text-purple-400" />
                  Password Rules
                </h3>
                <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-300 font-mono">
                  {pwdOptions.length} chars
                </Badge>
              </div>

              {/* Length Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Length</span>
                  <span className="font-mono font-bold text-purple-400">{pwdOptions.length}</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="64"
                  value={pwdOptions.length}
                  onChange={(e) => setPwdOptions({ ...pwdOptions, length: Number(e.target.value) })}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              {/* Character Checkboxes */}
              <div className="space-y-3 pt-2 border-t border-white/5 text-xs text-slate-300">
                <label className="flex items-center justify-between cursor-pointer hover:text-white transition-colors">
                  <span>Uppercase Letters (A-Z)</span>
                  <input
                    type="checkbox"
                    checked={pwdOptions.includeUpper}
                    onChange={(e) => setPwdOptions({ ...pwdOptions, includeUpper: e.target.checked })}
                    className="rounded border-purple-500/30 bg-black/40 text-purple-600 focus:ring-purple-500 size-4"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer hover:text-white transition-colors">
                  <span>Lowercase Letters (a-z)</span>
                  <input
                    type="checkbox"
                    checked={pwdOptions.includeLower}
                    onChange={(e) => setPwdOptions({ ...pwdOptions, includeLower: e.target.checked })}
                    className="rounded border-purple-500/30 bg-black/40 text-purple-600 focus:ring-purple-500 size-4"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer hover:text-white transition-colors">
                  <span>Numbers (0-9)</span>
                  <input
                    type="checkbox"
                    checked={pwdOptions.includeNumbers}
                    onChange={(e) => setPwdOptions({ ...pwdOptions, includeNumbers: e.target.checked })}
                    className="rounded border-purple-500/30 bg-black/40 text-purple-600 focus:ring-purple-500 size-4"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer hover:text-white transition-colors">
                  <span>Symbols (!@#$%^&amp;*...)</span>
                  <input
                    type="checkbox"
                    checked={pwdOptions.includeSymbols}
                    onChange={(e) => setPwdOptions({ ...pwdOptions, includeSymbols: e.target.checked })}
                    className="rounded border-purple-500/30 bg-black/40 text-purple-600 focus:ring-purple-500 size-4"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer hover:text-white transition-colors">
                  <span>Exclude Ambiguous (0, O, 1, l, I)</span>
                  <input
                    type="checkbox"
                    checked={pwdOptions.excludeAmbiguous}
                    onChange={(e) => setPwdOptions({ ...pwdOptions, excludeAmbiguous: e.target.checked })}
                    className="rounded border-purple-500/30 bg-black/40 text-purple-600 focus:ring-purple-500 size-4"
                  />
                </label>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── TAB 2: API KEYS & SECRETS GENERATOR ── */}
      {activeTab === 'api-keys' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Configuration Card (Left 4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="rounded-3xl border border-purple-500/25 bg-[#16213e] shadow-xl p-6 space-y-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <KeyRound className="size-4 text-cyan-400" />
                Token Parameters
              </h3>

              {/* Prefix */}
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-400">Key Prefix (e.g. sk_live_, whsec_):</Label>
                <Input
                  value={tokenOptions.prefix}
                  onChange={(e) => setTokenOptions({ ...tokenOptions, prefix: e.target.value })}
                  placeholder="sk_live_"
                  className="h-8 bg-black/40 border-purple-500/30 text-xs font-mono text-white"
                />
              </div>

              {/* Format */}
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-400">Encoding Format:</Label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {(['base64url', 'hex', 'alphanumeric', 'base64'] as const).map((fmt) => (
                    <Button
                      key={fmt}
                      size="xs"
                      variant={tokenOptions.format === fmt ? 'default' : 'outline'}
                      onClick={() => setTokenOptions({ ...tokenOptions, format: fmt })}
                      className={`text-[11px] h-7 ${
                        tokenOptions.format === fmt
                          ? 'bg-purple-600 text-white'
                          : 'border-purple-500/20 text-slate-400'
                      }`}
                    >
                      {fmt}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Length */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Secret Length</span>
                  <span className="font-mono font-bold text-cyan-400">{tokenOptions.length}</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="64"
                  value={tokenOptions.length}
                  onChange={(e) => setTokenOptions({ ...tokenOptions, length: Number(e.target.value) })}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Count */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Batch Count</span>
                  <span className="font-mono font-bold text-purple-400">{tokenOptions.count}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={tokenOptions.count}
                  onChange={(e) => setTokenOptions({ ...tokenOptions, count: Number(e.target.value) })}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              <Button
                onClick={handleRegenerateTokens}
                className="w-full bg-linear-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold text-xs h-9 gap-1.5 shadow-lg shadow-purple-600/25"
              >
                <RefreshCw className="size-3.5" />
                Generate New Batch
              </Button>
            </Card>
          </div>

          {/* Tokens Output Display (Right 8 cols) */}
          <div className="lg:col-span-8 space-y-3 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Terminal className="size-3.5 text-cyan-400" />
                  Generated Cryptographic Secrets
                </Label>
                <Badge variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-300 font-mono">
                  {generatedTokens.length} {generatedTokens.length === 1 ? 'Secret' : 'Secrets'}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={handleCopyAllTokens}
                  className="h-7 text-xs border-purple-500/30 text-slate-200 hover:text-white"
                >
                  {copiedTokens ? <Check className="size-3 mr-1 text-emerald-400" /> : <Copy className="size-3 mr-1" />}
                  {copiedTokens ? 'Copied All' : 'Copy All'}
                </Button>
                <Button
                  size="xs"
                  onClick={handleDownloadTokens}
                  className="h-7 text-xs bg-purple-600 hover:bg-purple-500 text-white font-semibold"
                >
                  <Download className="size-3 mr-1" />
                  Save .txt
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-purple-500/30 overflow-hidden bg-[#0d1527] shadow-xl flex-1">
              <CodeEditor
                value={generatedTokens.join('\n')}
                language="bash"
                readOnly
                height="480px"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
