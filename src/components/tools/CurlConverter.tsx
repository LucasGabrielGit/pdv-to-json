'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Terminal,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Code2,
  Globe,
} from 'lucide-react'
import { parseCurl, generateCodeFromCurl } from '@/utils/curlConverter'
import { ToolHeader } from '@/components/converter/ToolHeader'
import { PrivacyBanner } from '@/components/converter/PrivacyBanner'
import CodeEditor from '@/components/CodeEditor'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

const SAMPLE_CURL = `curl -X POST https://api.dev-kit.tech/v1/auth/token \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer devkit_sec_991823" \\
  -d '{"grant_type":"client_credentials","scope":"read:write"}'`

type Language = 'fetch' | 'axios' | 'python' | 'go' | 'php' | 'rust'

export default function CurlConverter() {
  const [curlInput, setCurlInput] = useState(SAMPLE_CURL)
  const [selectedLang, setSelectedLang] = useState<Language>('fetch')
  const [generatedCode, setGeneratedCode] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const parsed = parseCurl(curlInput)
    const code = generateCodeFromCurl(parsed, selectedLang)
    setGeneratedCode(code)
  }, [curlInput, selectedLang])

  const handleCopy = () => {
    if (!generatedCode) return
    navigator.clipboard.writeText(generatedCode)
    setCopied(true)
    toast.success(`${selectedLang.toUpperCase()} code copied to clipboard!`)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <ToolHeader
        title="cURL to Code Converter"
        description="Convert raw cURL commands from Postman, Chrome DevTools, or API docs into clean executable code in Fetch, Axios, Python, Go, PHP, and Rust."
        category="converters"
      />

      <PrivacyBanner />

      {/* Language Tabs Toolbar */}
      <Card className="border border-purple-500/20 bg-[#16213e]/60 backdrop-blur-md">
        <CardContent className="p-4 md:p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Target Language:</span>
            <Tabs value={selectedLang} onValueChange={(v) => setSelectedLang(v as Language)}>
              <TabsList className="bg-black/40 border border-purple-500/30 p-1">
                <TabsTrigger value="fetch" className="text-xs">JS (Fetch)</TabsTrigger>
                <TabsTrigger value="axios" className="text-xs">Axios</TabsTrigger>
                <TabsTrigger value="python" className="text-xs">Python</TabsTrigger>
                <TabsTrigger value="go" className="text-xs">Go</TabsTrigger>
                <TabsTrigger value="php" className="text-xs">PHP</TabsTrigger>
                <TabsTrigger value="rust" className="text-xs">Rust</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurlInput(SAMPLE_CURL)}
              className="text-xs border-purple-500/20 text-slate-300 hover:bg-purple-500/10 gap-1.5"
            >
              <RotateCcw className="size-3.5" /> Sample cURL
            </Button>
            <Button
              size="sm"
              onClick={handleCopy}
              disabled={!generatedCode}
              className="text-xs bg-purple-600 hover:bg-purple-500 text-white font-semibold gap-1.5"
            >
              {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Terminal className="size-4 text-purple-400" /> cURL Command Input
            </span>
            <span className="text-slate-500 font-mono">{curlInput.length} chars</span>
          </div>
          <CodeEditor
            value={curlInput}
            onChange={(val) => setCurlInput(val || '')}
            language="bash"
            placeholder="Paste curl command here (e.g. curl https://api.example.com -H 'Auth...')..."
            height="500px"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Code2 className="size-4 text-cyan-400" /> Generated {selectedLang.toUpperCase()} Code
            </span>
            <Badge variant="outline" className="text-[10px] bg-cyan-500/10 text-cyan-300 border-cyan-500/30 font-mono">
              Ready to Execute
            </Badge>
          </div>
          <CodeEditor
            value={generatedCode}
            language={selectedLang === 'python' ? 'python' : selectedLang === 'go' ? 'go' : selectedLang === 'rust' ? 'rust' : 'typescript'}
            readOnly
            height="500px"
          />
        </div>
      </div>
    </div>
  )
}
