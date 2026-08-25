'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Code2,
  Copy,
  Check,
  Download,
  RotateCcw,
  Sparkles,
  Layers,
  FileCode,
  CheckCircle2,
  Settings2,
} from 'lucide-react'
import {
  convertJsonToTypes,
  type TargetTypeLanguage,
  type TypeConversionResult,
} from '@/utils/jsonToTypes'
import { ToolHeader } from '@/components/converter/ToolHeader'
import { PrivacyBanner } from '@/components/converter/PrivacyBanner'
import CodeEditor from '@/components/CodeEditor'
import FileDropZone from '@/components/FileDropZone'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const SAMPLE_API_JSON = `{
  "id": "usr_991823",
  "name": "Lucas Gabriel",
  "email": "lucas@example.com",
  "is_active": true,
  "role": "admin",
  "credits": 250,
  "profile": {
    "avatar_url": "https://dev-kit.tech/avatar.jpg",
    "bio": "Full-Stack Software Engineer",
    "skills": ["TypeScript", "Next.js", "Python", "Go", "PostgreSQL"]
  },
  "settings": {
    "theme": "dark",
    "notifications_enabled": true,
    "api_rate_limit": 1000
  },
  "created_at": "2026-08-24T10:00:00Z"
}`

export default function JsonToTypesConverter() {
  const [jsonInput, setJsonInput] = useState(SAMPLE_API_JSON)
  const [targetLang, setTargetLang] = useState<TargetTypeLanguage>('typescript')
  const [rootName, setRootName] = useState('UserResponse')
  const [readOnly, setReadOnly] = useState(false)
  const [inputMode, setInputMode] = useState<'text' | 'file'>('text')

  const [result, setResult] = useState<TypeConversionResult>({
    code: '',
    language: 'typescript',
    typeCount: 0,
  })
  const [copied, setCopied] = useState(false)

  // Live Conversion
  useEffect(() => {
    const res = convertJsonToTypes(jsonInput, targetLang, {
      rootName,
      readOnly,
    })
    setResult(res)
  }, [jsonInput, targetLang, rootName, readOnly])

  const handleCopy = () => {
    if (!result.code) return
    navigator.clipboard.writeText(result.code)
    setCopied(true)
    toast.success(`${targetLang.toUpperCase()} models copied to clipboard!`)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!result.code) return
    const extensions: Record<TargetTypeLanguage, string> = {
      typescript: 'ts',
      zod: 'ts',
      pydantic: 'py',
      go: 'go',
    }
    const ext = extensions[targetLang] || 'ts'
    const blob = new Blob([result.code], { type: 'text/plain;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${rootName.toLowerCase()}_types.${ext}`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Downloaded ${rootName.toLowerCase()}_types.${ext}!`)
  }

  const handleFileContent = (content: string, filename: string) => {
    setJsonInput(content)
    setInputMode('text')
    toast.success(`Loaded ${filename}`)
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <ToolHeader
        title="JSON to TypeScript, Zod, Pydantic & Go"
        description="Transform raw JSON payloads and API responses into strongly typed TypeScript Interfaces, Zod Validation Schemas, Python Pydantic Models, and Go Structs."
        badgeText="100% Client-Side"
      />

      <PrivacyBanner />

      {/* ── Top Controls & Language Selector Bar ── */}
      <Card className="rounded-3xl shadow-xl border border-purple-500/25 bg-[#16213e]">
        <CardContent className="p-4 md:p-5 flex flex-wrap items-center justify-between gap-4">
          {/* Target Language Tabs */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Output Model:</span>
            <Tabs value={targetLang} onValueChange={(v) => setTargetLang(v as TargetTypeLanguage)}>
              <TabsList className="bg-black/40 border border-purple-500/30 p-1">
                <TabsTrigger value="typescript" className="text-xs gap-1.5">
                  <Code2 className="size-3.5" /> TypeScript
                </TabsTrigger>
                <TabsTrigger value="zod" className="text-xs gap-1.5">
                  <CheckCircle2 className="size-3.5 text-cyan-400" /> Zod Schema
                </TabsTrigger>
                <TabsTrigger value="pydantic" className="text-xs gap-1.5">
                  <Layers className="size-3.5 text-amber-400" /> Python (Pydantic)
                </TabsTrigger>
                <TabsTrigger value="go" className="text-xs gap-1.5">
                  <FileCode className="size-3.5 text-emerald-400" /> Go Structs
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Type Options */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Settings2 className="size-3.5 text-purple-400" />
              <Label className="text-xs text-slate-400">Root Type Name:</Label>
              <Input
                value={rootName}
                onChange={(e) => setRootName(e.target.value)}
                placeholder="RootName"
                className="h-7 w-32 bg-black/40 border-purple-500/30 text-xs font-mono text-white"
              />
            </div>

            {targetLang === 'typescript' && (
              <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer hover:text-slate-200 transition-colors">
                <input
                  type="checkbox"
                  checked={readOnly}
                  onChange={(e) => setReadOnly(e.target.checked)}
                  className="rounded border-purple-500/30 bg-black/40 text-purple-600 focus:ring-purple-500 size-3.5"
                />
                <span>readonly props</span>
              </label>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 ml-auto">
            <Button
              size="xs"
              variant="outline"
              onClick={() => setJsonInput(SAMPLE_API_JSON)}
              className="bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20 text-xs"
            >
              <Sparkles className="size-3 mr-1 text-purple-400" /> Load Sample JSON
            </Button>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => setJsonInput('')}
              className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs"
            >
              <RotateCcw className="size-3 mr-1" /> Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Side-by-Side Editor & Generated Types Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: JSON Input */}
        <div className="space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <FileCode className="size-3.5 text-purple-400" />
                Raw JSON Payload / API Response
              </Label>
              <Badge variant="outline" className="text-[10px] border-white/10 text-slate-400 font-mono">
                {jsonInput.length} chars
              </Badge>
            </div>

            <div className="flex items-center gap-1">
              <Button
                size="xs"
                variant={inputMode === 'text' ? 'secondary' : 'ghost'}
                onClick={() => setInputMode('text')}
                className="text-[11px] h-6 px-2"
              >
                Editor
              </Button>
              <Button
                size="xs"
                variant={inputMode === 'file' ? 'secondary' : 'ghost'}
                onClick={() => setInputMode('file')}
                className="text-[11px] h-6 px-2"
              >
                Upload .json
              </Button>
            </div>
          </div>

          {inputMode === 'text' ? (
            <CodeEditor
              value={jsonInput}
              onChange={(val) => setJsonInput(val || '')}
              language="json"
              placeholder="Paste JSON object or array here..."
              height="500px"
            />
          ) : (
            <div className="h-[500px] rounded-2xl border border-purple-500/30 bg-black/40 p-4 flex flex-col justify-center">
              <FileDropZone
                fileType="json"
                readAsDataURL={false}
                onFileContent={handleFileContent}
              />
            </div>
          )}
        </div>

        {/* Right: Generated Types & Schema */}
        <div className="space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-cyan-400" />
                Generated {targetLang === 'typescript' ? 'TypeScript Interfaces' : targetLang === 'zod' ? 'Zod Schema & Types' : targetLang === 'pydantic' ? 'Python Pydantic Models' : 'Go Structs'}
              </Label>
              {result.typeCount > 0 && (
                <Badge variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-300 font-mono">
                  {result.typeCount} {result.typeCount === 1 ? 'Model' : 'Models'} Generated
                </Badge>
              )}
            </div>

            {result.code && (
              <div className="flex items-center gap-1.5">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={handleCopy}
                  className="h-6 text-xs border-purple-500/30 text-slate-200 hover:text-white"
                >
                  {copied ? <Check className="size-3 mr-1 text-emerald-400" /> : <Copy className="size-3 mr-1" />}
                  {copied ? 'Copied!' : 'Copy Code'}
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
            value={result.code}
            language={result.language}
            readOnly
            height="500px"
          />

          {result.error && (
            <p className="text-xs text-rose-400 font-mono bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
              {result.error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
