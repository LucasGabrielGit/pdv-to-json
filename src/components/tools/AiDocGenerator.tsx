'use client'

import React, { useState } from 'react'
import {
  BookOpen,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Key,
  Download,
  FileCode,
  Layers,
  Code2,
  FileText,
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

const SAMPLE_API = `// POST /api/v1/users/register
export async function POST(req: Request) {
  const body = await req.json();
  const { email, password, fullName } = body;

  if (!email || !password) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const user = await db.user.create({
    data: { email, passwordHash: await hash(password), fullName }
  });

  return Response.json({ success: true, user: { id: user.id, email: user.email } }, { status: 201 });
}`

interface DocResult {
  openapiYaml: string
  openapiJson: string
  markdownDocs: string
  jsdocComments: string
  summary: string
}

export default function AiDocGenerator() {
  const [apiCode, setApiCode] = useState(SAMPLE_API)
  const [customApiKey, setCustomApiKey] = useState('')
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<DocResult | null>(null)
  const [activeOutputTab, setActiveOutputTab] = useState<'yaml' | 'json' | 'markdown' | 'jsdoc'>('yaml')
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!apiCode.trim()) {
      toast.error('Please enter API route code or types.')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/ai/doc-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiCode: apiCode.trim(),
          customApiKey: customApiKey.trim() || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to generate API docs.')
      }

      setResult(data.data)
      toast.success('API Documentation & OpenAPI specs generated!')
    } catch (e) {
      toast.error('Doc Generation Error', {
        description: (e as Error).message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentCode = () => {
    if (!result) return ''
    switch (activeOutputTab) {
      case 'yaml':
        return result.openapiYaml
      case 'json':
        return result.openapiJson
      case 'markdown':
        return result.markdownDocs
      case 'jsdoc':
        return result.jsdocComments
      default:
        return ''
    }
  }

  const getLanguage = () => {
    switch (activeOutputTab) {
      case 'yaml':
        return 'yaml'
      case 'json':
        return 'json'
      case 'markdown':
        return 'markdown'
      case 'jsdoc':
        return 'typescript'
      default:
        return 'yaml'
    }
  }

  const handleCopy = async () => {
    const code = getCurrentCode()
    if (!code) return
    await navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success(`Copied ${activeOutputTab.toUpperCase()} documentation!`)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const code = getCurrentCode()
    if (!code) return
    const extensions: Record<string, string> = {
      yaml: 'openapi.yaml',
      json: 'openapi.json',
      markdown: 'API_DOCUMENTATION.md',
      jsdoc: 'documented_routes.ts',
    }
    const filename = extensions[activeOutputTab] || 'api_docs.txt'
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Downloaded ${filename}`)
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <ToolHeader
        title="AI API Docs & OpenAPI Spec Generator"
        description="Generate Swagger / OpenAPI 3.0 specs (YAML & JSON), developer portal Markdown guides, and typed JSDoc/TSDoc comments from route handlers in seconds."
        badgeText="AI Technical Writer & OpenAPI Architect"
        toolId="ai-docs"
      />

      <PrivacyBanner />

      {/* Toolbar */}
      <Card className="border border-purple-500/25 bg-[#16213e] shadow-xl">
        <CardContent className="p-4 md:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <Button
              size="xs"
              variant="outline"
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              className="h-8 text-xs border-purple-500/30 text-purple-300 hover:bg-purple-500/10 gap-1.5"
            >
              <Key className="size-3" />
              {customApiKey ? 'Custom Key Set' : 'BYOK Key (Optional)'}
            </Button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button
              size="xs"
              variant="outline"
              onClick={() => setApiCode(SAMPLE_API)}
              className="bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20 text-xs"
            >
              <Sparkles className="size-3 mr-1 text-purple-400" /> Sample API Route
            </Button>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => setApiCode('')}
              className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs"
            >
              <RotateCcw className="size-3 mr-1" /> Clear
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold text-xs px-6 h-8 gap-1.5 shadow-md cursor-pointer"
            >
              {isLoading ? (
                <span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <BookOpen className="size-3.5" />
              )}
              {isLoading ? 'Documenting API...' : 'Generate API Specs'}
            </Button>
          </div>
        </CardContent>

        {showApiKeyInput && (
          <div className="p-4 border-t border-purple-500/20 bg-black/40 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex-1 min-w-[260px] space-y-1">
              <Label className="text-slate-300 flex items-center gap-1.5">
                <Key className="size-3 text-purple-400" /> Bring Your Own Key (Unlimited Free Usage)
              </Label>
              <Input
                type="password"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="bg-black/60 border-purple-500/30 h-8 font-mono text-xs text-white"
              />
            </div>
            <p className="text-[11px] text-slate-400 max-w-sm leading-relaxed">
              Your key is kept only in client memory and is never logged or persisted.
            </p>
          </div>
        )}
      </Card>

      {/* Side-by-Side Editors (500px) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input API Code */}
        <div className="space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <FileCode className="size-3.5 text-purple-400" /> API Route Handler / Endpoint Code
            </Label>
            <Badge variant="outline" className="text-[10px] border-white/10 text-slate-400 font-mono">
              {apiCode.length} chars
            </Badge>
          </div>

          <CodeEditor
            value={apiCode}
            onChange={(v) => setApiCode(v || '')}
            language="typescript"
            placeholder="Paste Next.js route handler, Express endpoint, or FastAPI function..."
            height="500px"
          />
        </div>

        {/* Right: Generated Docs & OpenAPI Specs */}
        <div className="space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <Tabs
              value={activeOutputTab}
              onValueChange={(v) => setActiveOutputTab(v as typeof activeOutputTab)}
            >
              <TabsList className="bg-black/40 border border-white/5 p-0.5 h-7">
                <TabsTrigger
                  value="yaml"
                  className="text-[10px] px-2.5 h-6 data-[state=active]:bg-purple-600 data-[state=active]:text-white font-semibold"
                >
                  OpenAPI YAML
                </TabsTrigger>
                <TabsTrigger
                  value="json"
                  className="text-[10px] px-2.5 h-6 data-[state=active]:bg-purple-600 data-[state=active]:text-white font-semibold"
                >
                  OpenAPI JSON
                </TabsTrigger>
                <TabsTrigger
                  value="markdown"
                  className="text-[10px] px-2.5 h-6 data-[state=active]:bg-purple-600 data-[state=active]:text-white font-semibold"
                >
                  Markdown Guide
                </TabsTrigger>
                <TabsTrigger
                  value="jsdoc"
                  className="text-[10px] px-2.5 h-6 data-[state=active]:bg-purple-600 data-[state=active]:text-white font-semibold"
                >
                  JSDoc Comments
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {result && (
              <div className="flex items-center gap-1.5">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={handleCopy}
                  className="h-6 text-xs border-purple-500/30 text-slate-200 hover:text-white"
                >
                  {copied ? <Check className="size-3 mr-1 text-emerald-400" /> : <Copy className="size-3 mr-1" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button
                  size="xs"
                  onClick={handleDownload}
                  className="h-6 text-xs bg-purple-600 hover:bg-purple-500 text-white font-semibold"
                >
                  <Download className="size-3 mr-1" />
                  Download
                </Button>
              </div>
            )}
          </div>

          <CodeEditor
            value={getCurrentCode() || '// Click "Generate API Specs" to produce OpenAPI and Markdown documentation...'}
            language={getLanguage()}
            readOnly
            height="500px"
          />
        </div>
      </div>
    </div>
  )
}
