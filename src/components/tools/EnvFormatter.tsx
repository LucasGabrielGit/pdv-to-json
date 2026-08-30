'use client'

import React, { useState, useMemo } from 'react'
import { toast } from 'sonner'
import {
  FileCode,
  Copy,
  Download,
  Trash2,
  Sparkles,
  Check,
  AlertTriangle,
  ArrowDownAZ,
  AlignLeft,
  ShieldAlert,
  ShieldCheck,
  FileCheck,
  Upload,
} from 'lucide-react'
import { ToolHeader } from '@/components/converter/ToolHeader'
import { PrivacyBanner } from '@/components/converter/PrivacyBanner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  parseEnv,
  formatEnv,
  generateEnvExample,
  type EnvParseResult,
} from '@/utils/envFormatter'

const SAMPLE_ENV = `# Application Configuration
PORT=3000
NODE_ENV=production
APP_URL="https://myapp.example.com"

# Database & Cache
DATABASE_URL="postgresql://postgres:secretpassword@localhost:5432/production_db"
DATABASE_POOL_MAX=20
REDIS_HOST=localhost
REDIS_PORT=6379

# Security & Authentication
JWT_SECRET="super-secret-jwt-signing-key-32chars"
SESSION_EXPIRY_HOURS=24
API_RATE_LIMIT=100

# Third-party Integrations
STRIPE_PUBLIC_KEY="pk_live_51AbcDefGhiJklMnoPqr"
AWS_REGION=us-east-1
S3_BUCKET_NAME=my-production-assets
`

export default function EnvFormatter() {
  const [inputEnv, setInputEnv] = useState(SAMPLE_ENV)
  const [sortKeys, setSortKeys] = useState(false)
  const [alignEquals, setAlignEquals] = useState(true)
  const [placeholderStyle, setPlaceholderStyle] = useState<'empty' | 'placeholder' | 'prefix'>('placeholder')
  const [activeTab, setActiveTab] = useState<'formatted' | 'example' | 'json'>('formatted')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // Parse .env live
  const parseResult: EnvParseResult = useMemo(() => {
    return parseEnv(inputEnv)
  }, [inputEnv])

  // Formatted output
  const formattedOutput = useMemo(() => {
    return formatEnv(inputEnv, { sortKeys, alignEquals })
  }, [inputEnv, sortKeys, alignEquals])

  // .env.example output
  const exampleOutput = useMemo(() => {
    return generateEnvExample(inputEnv, { placeholderStyle })
  }, [inputEnv, placeholderStyle])

  // JSON output
  const jsonOutput = useMemo(() => {
    return JSON.stringify(parseResult.variables, null, 2)
  }, [parseResult.variables])

  const handleCopy = async (text: string, label: string) => {
    if (!text.trim()) {
      toast.error('Nothing to copy.')
      return
    }
    await navigator.clipboard.writeText(text)
    setCopiedKey(label)
    toast.success(`Copied ${label} to clipboard!`)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleDownload = (text: string, filename: string) => {
    if (!text.trim()) {
      toast.error('No content to download.')
      return
    }
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success(`Downloaded ${filename}`)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        setInputEnv(content)
        toast.success(`Loaded ${file.name}`)
      }
    }
    reader.readAsText(file)
  }

  const hasErrors = parseResult.issues.some((i) => i.type === 'error')
  const hasWarnings = parseResult.issues.some((i) => i.type === 'warning')

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* ── Header ── */}
      <ToolHeader
        title=".env Formatter & .env.example Generator"
        description="Format, lint, and align environment variables. Automatically generate secure, sanitised .env.example templates for your repository in 1 click."
        badgeText="100% Client-Side"
      />

      {/* ── Privacy Banner ── */}
      <PrivacyBanner />

      {/* ── Top Summary & Status Bar ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-purple-500/20 bg-[#16213e]/70 backdrop-blur-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <FileCode className="size-4" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Variables Detected</div>
              <div className="text-lg font-bold text-white">{parseResult.totalVariables}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-purple-500/20 bg-[#16213e]/70 backdrop-blur-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`size-9 rounded-xl flex items-center justify-center ${
              hasErrors
                ? 'bg-rose-500/20 border border-rose-500/30 text-rose-400'
                : hasWarnings
                ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
                : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
            }`}>
              {hasErrors ? (
                <AlertTriangle className="size-4" />
              ) : hasWarnings ? (
                <AlertTriangle className="size-4" />
              ) : (
                <FileCheck className="size-4" />
              )}
            </div>
            <div>
              <div className="text-xs text-slate-400">Syntax Health</div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                {hasErrors ? (
                  <span className="text-rose-400">Syntax Errors Found</span>
                ) : hasWarnings ? (
                  <span className="text-amber-400">{parseResult.issues.length} Warning(s)</span>
                ) : (
                  <span className="text-emerald-400">100% Valid Syntax</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-purple-500/20 bg-[#16213e]/70 backdrop-blur-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-9 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Git Secret Safety</div>
              <div className="text-sm font-bold text-white">
                {parseResult.secretsDetected.length > 0 ? (
                  <span className="text-amber-300 font-semibold">{parseResult.secretsDetected.length} Potential Secret(s)</span>
                ) : (
                  <span className="text-slate-200">Safe for Local Dev</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Issues & Warnings Alert Box ── */}
      {parseResult.issues.length > 0 && (
        <Card className="border border-amber-500/30 bg-amber-500/10 backdrop-blur-md">
          <CardContent className="p-4 space-y-2">
            <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldAlert className="size-4" />
              <span>Linting Alerts &amp; Suggestions ({parseResult.issues.length})</span>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-2">
              {parseResult.issues.map((issue, idx) => (
                <div
                  key={`issue-${idx}`}
                  className="text-xs flex items-start gap-2 bg-black/30 p-2 rounded-lg border border-amber-500/20"
                >
                  <Badge
                    className={`text-[10px] uppercase font-bold shrink-0 ${
                      issue.type === 'error'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    Line {issue.line}
                  </Badge>
                  <span className="text-slate-200">{issue.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Main Dual Panel Editor ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Raw Input */}
        <Card className="border border-purple-500/20 bg-[#16213e]/80 backdrop-blur-md flex flex-col">
          <div className="p-4 border-b border-purple-500/10 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Input .env</span>
              <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-300 border-purple-500/20">
                Raw Content
              </Badge>
            </div>

            <div className="flex items-center gap-1.5">
              <label className="inline-flex items-center justify-center rounded-md px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-purple-500/10 cursor-pointer transition-colors">
                <Upload className="size-3 mr-1" />
                <span>Upload File</span>
                <input
                  type="file"
                  accept=".env,.env.*,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <Button
                size="xs"
                variant="ghost"
                onClick={() => setInputEnv(SAMPLE_ENV)}
                className="text-xs text-purple-300 hover:text-white hover:bg-purple-500/10"
              >
                <Sparkles className="size-3 mr-1 text-purple-400" />
                Sample
              </Button>

              <Button
                size="xs"
                variant="ghost"
                onClick={() => setInputEnv('')}
                className="text-xs text-rose-300 hover:text-white hover:bg-rose-500/10"
              >
                <Trash2 className="size-3 mr-1" />
                Clear
              </Button>
            </div>
          </div>

          <CardContent className="p-4 flex-1 flex flex-col">
            <textarea
              value={inputEnv}
              onChange={(e) => setInputEnv(e.target.value)}
              placeholder="Paste your .env file content here..."
              aria-label="Raw .env input editor"
              className="w-full flex-1 min-h-[380px] font-mono text-xs p-3 rounded-xl bg-black/50 border border-white/10 text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-purple-500/50 resize-y leading-relaxed"
              spellCheck={false}
            />
          </CardContent>
        </Card>

        {/* Right Panel: Formatted / Example Tabs */}
        <Card className="border border-purple-500/20 bg-[#16213e]/80 backdrop-blur-md flex flex-col">
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as 'formatted' | 'example' | 'json')}
            className="w-full flex flex-col flex-1"
          >
            <div className="p-4 border-b border-purple-500/10 flex flex-wrap items-center justify-between gap-2">
              <TabsList className="bg-black/40 border border-purple-500/20">
                <TabsTrigger value="formatted" className="text-xs">
                  Formatted .env
                </TabsTrigger>
                <TabsTrigger value="example" className="text-xs">
                  .env.example
                </TabsTrigger>
                <TabsTrigger value="json" className="text-xs">
                  JSON Map
                </TabsTrigger>
              </TabsList>

              {/* Formatting Controls */}
              {activeTab === 'formatted' && (
                <div className="flex items-center gap-1.5">
                  <Button
                    size="xs"
                    variant={alignEquals ? 'secondary' : 'ghost'}
                    onClick={() => setAlignEquals(!alignEquals)}
                    className={`text-xs ${alignEquals ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
                    title="Align = signs"
                  >
                    <AlignLeft className="size-3 mr-1" />
                    Align =
                  </Button>
                  <Button
                    size="xs"
                    variant={sortKeys ? 'secondary' : 'ghost'}
                    onClick={() => setSortKeys(!sortKeys)}
                    className={`text-xs ${sortKeys ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
                    title="Sort Keys A-Z"
                  >
                    <ArrowDownAZ className="size-3 mr-1" />
                    Sort A-Z
                  </Button>
                </div>
              )}

              {/* Example Placeholder Controls */}
              {activeTab === 'example' && (
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-purple-500/20 text-xs">
                  <button
                    onClick={() => setPlaceholderStyle('placeholder')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      placeholderStyle === 'placeholder' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    &lt;your_key&gt;
                  </button>
                  <button
                    onClick={() => setPlaceholderStyle('empty')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      placeholderStyle === 'empty' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Empty &quot;&quot;
                  </button>
                </div>
              )}
            </div>

            {/* Tab 1: Formatted .env */}
            <TabsContent value="formatted" className="p-4 flex-1 flex flex-col m-0 space-y-3">
              <textarea
                readOnly
                value={formattedOutput}
                aria-label="Formatted .env output"
                className="w-full flex-1 min-h-[380px] font-mono text-xs p-3 rounded-xl bg-black/50 border border-purple-500/20 text-emerald-300 focus:outline-hidden resize-y leading-relaxed"
                spellCheck={false}
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(formattedOutput, 'Formatted .env')}
                  className="text-xs border-purple-500/30 text-purple-300 hover:bg-purple-500/10 gap-1.5"
                >
                  {copiedKey === 'Formatted .env' ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copiedKey === 'Formatted .env' ? 'Copied' : 'Copy Formatted'}
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleDownload(formattedOutput, '.env')}
                  className="text-xs bg-purple-600 hover:bg-purple-500 text-white font-semibold gap-1.5 shadow-md"
                >
                  <Download className="size-3.5" />
                  Download .env
                </Button>
              </div>
            </TabsContent>

            {/* Tab 2: .env.example */}
            <TabsContent value="example" className="p-4 flex-1 flex flex-col m-0 space-y-3">
              <textarea
                readOnly
                value={exampleOutput}
                aria-label=".env.example output"
                className="w-full flex-1 min-h-[380px] font-mono text-xs p-3 rounded-xl bg-black/50 border border-cyan-500/20 text-cyan-300 focus:outline-hidden resize-y leading-relaxed"
                spellCheck={false}
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(exampleOutput, '.env.example')}
                  className="text-xs border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 gap-1.5"
                >
                  {copiedKey === '.env.example' ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copiedKey === '.env.example' ? 'Copied' : 'Copy .env.example'}
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleDownload(exampleOutput, '.env.example')}
                  className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-semibold gap-1.5 shadow-md"
                >
                  <Download className="size-3.5" />
                  Download .env.example
                </Button>
              </div>
            </TabsContent>

            {/* Tab 3: JSON Map */}
            <TabsContent value="json" className="p-4 flex-1 flex flex-col m-0 space-y-3">
              <textarea
                readOnly
                value={jsonOutput}
                aria-label="JSON representation of variables"
                className="w-full flex-1 min-h-[380px] font-mono text-xs p-3 rounded-xl bg-black/50 border border-white/10 text-amber-300 focus:outline-hidden resize-y leading-relaxed"
                spellCheck={false}
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(jsonOutput, 'JSON Object')}
                  className="text-xs border-white/20 text-slate-300 hover:bg-white/10 gap-1.5"
                >
                  {copiedKey === 'JSON Object' ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copiedKey === 'JSON Object' ? 'Copied' : 'Copy JSON'}
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleDownload(jsonOutput, 'env.json')}
                  className="text-xs bg-amber-600 hover:bg-amber-500 text-white font-semibold gap-1.5 shadow-md"
                >
                  <Download className="size-3.5" />
                  Download JSON
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
