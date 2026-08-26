'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Copy,
  Trash2,
  Check,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  FileCode,
  } from 'lucide-react'
import AdSense from '@/components/AdSense'
import { ADS_CONFIG } from '@/config/ads'

import {
  generateTextHashes,
  generateFileHashes,
  type GeneratedHashes,
} from '@/utils/hashGenerator'
import FileDropZone from '@/components/FileDropZone'
import { ToolHeader } from '@/components/converter/ToolHeader'

import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { PrivacyBanner } from '@/components/converter/PrivacyBanner'

type InputMode = 'text' | 'file'

const SAMPLE_TEXT = 'dev-kit.tech'

export default function HashGenerator() {
  const [inputMode, setInputMode] = useState<InputMode>('text')
  const [inputText, setInputText] = useState(SAMPLE_TEXT)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUppercase, setIsUppercase] = useState(false)
  const [expectedHash, setExpectedHash] = useState('')
  const [isComputing, setIsComputing] = useState(false)
  const [hashes, setHashes] = useState<GeneratedHashes | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // Compute text hashes
  useEffect(() => {
    if (inputMode === 'text') {
      if (!inputText) {
        setHashes(null)
        return
      }
      generateTextHashes(inputText).then(setHashes)
    }
  }, [inputText, inputMode])

  // Compute file hashes
  const handleFileSelect = async (content: string, filename: string, file: File) => {
    setSelectedFile(file)
    setInputMode('file')
    setIsComputing(true)
    try {
      const res = await generateFileHashes(file)
      setHashes(res)
      toast.success(`Calculated checksums for ${file.name}`)
    } catch (err) {
      toast.error('Failed to hash file', { description: (err as Error).message })
    } finally {
      setIsComputing(false)
    }
  }

  const handleCopyHash = async (key: string, value: string) => {
    if (!value) return
    const finalVal = isUppercase ? value.toUpperCase() : value.toLowerCase()
    await navigator.clipboard.writeText(finalVal)
    setCopiedKey(key)
    toast.success(`Copied ${key.toUpperCase()} hash!`)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleLoadSample = () => {
    setInputText(SAMPLE_TEXT)
    setSelectedFile(null)
    setInputMode('text')
    toast.success('Loaded sample text')
  }


  const handleClear = () => {
    setInputText('')
    setSelectedFile(null)
    setHashes(null)
    setExpectedHash('')
    toast.info('Cleared input')
  }

  // Check if expected hash matches any generated hash
  const matchResult = React.useMemo(() => {
    if (!expectedHash.trim() || !hashes) return null
    const cleanExpected = expectedHash.trim().toLowerCase()
    if (hashes.sha256 === cleanExpected) return { match: true, algo: 'SHA-256' }
    if (hashes.sha512 === cleanExpected) return { match: true, algo: 'SHA-512' }
    if (hashes.sha384 === cleanExpected) return { match: true, algo: 'SHA-384' }
    if (hashes.sha1 === cleanExpected) return { match: true, algo: 'SHA-1' }
    if (hashes.md5 === cleanExpected) return { match: true, algo: 'MD5' }
    return { match: false, algo: '' }
  }, [expectedHash, hashes])

  const formatHashValue = (val: string) => {
    if (!val) return ''
    return isUppercase ? val.toUpperCase() : val.toLowerCase()
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* ── Header ── */}
      <ToolHeader
        title="Hash Generator & Checksum Verifier"
        description="Generate SHA-256, SHA-512, SHA-384, SHA-1, and MD5 cryptographic hashes for text and binary files with checksum verification."
        badgeText="Web Crypto API"
      />

      {/* ── Privacy Banner ── */}
      <PrivacyBanner />

      {/* ── Main Card ── */}
      <Card
        className="rounded-3xl shadow-2xl overflow-hidden border border-[rgba(124,58,237,0.25)] bg-[#16213e]"
        style={{
          boxShadow: '0 25px 60px rgba(0,0,0,0.4), 0 0 60px rgba(124,58,237,0.04)',
        }}
      >
        <CardContent className="p-6 md:p-8 space-y-6">
          {/* Input Mode Tabs */}
          <Tabs
            value={inputMode}
            onValueChange={(v) => setInputMode(v as InputMode)}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <TabsList className="h-auto gap-1 p-1 rounded-xl bg-black/30 border border-white/5">
                <TabsTrigger
                  value="text"
                  className={`px-5 py-2 rounded-lg transition-all ${
                    inputMode === 'text'
                      ? 'bg-white text-zinc-900 font-semibold shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ✏️ Text Hashing
                </TabsTrigger>
                <TabsTrigger
                  value="file"
                  className={`px-5 py-2 rounded-lg transition-all ${
                    inputMode === 'file'
                      ? 'bg-white text-zinc-900 font-semibold shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📁 File Checksum Hashing
                </TabsTrigger>
              </TabsList>


              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={isUppercase}
                    onChange={(e) => setIsUppercase(e.target.checked)}
                    className="rounded border-purple-500/30 bg-black/40 text-purple-600 focus:ring-purple-500"
                  />
                  <span>UPPERCASE Output</span>
                </label>

                <Button
                  size="xs"
                  variant="ghost"
                  onClick={handleClear}
                  disabled={!inputText && !selectedFile}
                  className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs"
                >
                  <Trash2 className="size-3.5 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
          </Tabs>

          {/* Text Input Area */}
          {inputMode === 'text' ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Text Input
                </Label>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={handleLoadSample}
                  className="bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20 transition-all text-xs"
                >
                  <Sparkles className="size-3 mr-1 text-purple-400" />
                  Load Sample Text
                </Button>
              </div>

              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to generate cryptographic hashes..."
                className="h-32 font-mono text-sm resize-y leading-relaxed bg-black/35 text-slate-100 border border-[rgba(124,58,237,0.25)]"
                spellCheck={false}
              />
            </div>
          ) : (
            /* File Drop Zone */
            <div className="space-y-3">
              <FileDropZone
                fileType="checksum"
                customLabel="any file (ZIP, PDF, EXE, ISO, etc.) to compute checksum"
                readAsDataURL={false}
                onFileContent={handleFileSelect}
              />

              {isComputing && (
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center gap-2 text-xs text-purple-300">
                  <span className="size-3.5 border-2 border-purple-300/30 border-t-purple-300 rounded-full animate-spin" />
                  <span>Computing cryptographic checksums...</span>
                </div>
              )}

              {selectedFile && (
                <div className="p-3.5 rounded-xl bg-black/40 border border-purple-500/30 flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileCode className="size-4 text-purple-400 shrink-0" />
                    <span className="font-semibold truncate">{selectedFile.name}</span>
                    <span className="text-slate-500">
                      ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  {hashes && (
                    <Badge variant="outline" className="border-cyan-500/30 text-cyan-300 font-mono text-[11px] gap-1">
                      <Clock className="size-3" />
                      {hashes.executionTimeMs} ms
                    </Badge>
                  )}
                </div>
              )}
            </div>

          )}

          {/* Checksum Verifier Matcher */}
          {hashes && (
            <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Verify / Compare Checksum
              </Label>
              <Input
                type="text"
                value={expectedHash}
                onChange={(e) => setExpectedHash(e.target.value)}
                placeholder="Paste expected SHA-256 or MD5 hash to verify match..."
                className="font-mono text-xs bg-black/40 border-purple-500/30 text-slate-200"
              />

              {matchResult && (
                <div
                  className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-medium ${
                    matchResult.match
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {matchResult.match ? (
                    <>
                      <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                      <span>Checksum Match Confirmed! Matches <strong>{matchResult.algo}</strong> hash.</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="size-4 text-rose-400 shrink-0" />
                      <span>Checksum Mismatch. Expected hash does not match any generated algorithm.</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Computed Hashes Results List */}
          {hashes && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Cryptographic Hashes
                </Label>
                {hashes.executionTimeMs > 0 && inputMode === 'text' && (
                  <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-300 font-mono gap-1">
                    <Clock className="size-3" />
                    {hashes.executionTimeMs} ms
                  </Badge>
                )}
              </div>

              <div className="space-y-3">
                {/* SHA-256 */}
                <div className="p-4 rounded-2xl bg-black/40 border border-purple-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                      SHA-256 (Recommended)
                    </span>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleCopyHash('sha256', hashes.sha256)}
                      className="h-7 text-xs text-purple-300 hover:bg-purple-500/10"
                    >
                      {copiedKey === 'sha256' ? <Check className="size-3 mr-1 text-emerald-400" /> : <Copy className="size-3 mr-1" />}
                      {copiedKey === 'sha256' ? 'Copied' : 'Copy SHA-256'}
                    </Button>
                  </div>
                  <div className="font-mono text-xs text-purple-200 break-all leading-relaxed bg-black/50 p-2.5 rounded-xl border border-white/5 select-all">
                    {formatHashValue(hashes.sha256)}
                  </div>
                </div>

                {/* SHA-512 */}
                <div className="p-4 rounded-2xl bg-black/40 border border-cyan-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                      SHA-512
                    </span>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleCopyHash('sha512', hashes.sha512)}
                      className="h-7 text-xs text-cyan-300 hover:bg-cyan-500/10"
                    >
                      {copiedKey === 'sha512' ? <Check className="size-3 mr-1 text-emerald-400" /> : <Copy className="size-3 mr-1" />}
                      {copiedKey === 'sha512' ? 'Copied' : 'Copy SHA-512'}
                    </Button>
                  </div>
                  <div className="font-mono text-xs text-cyan-200 break-all leading-relaxed bg-black/50 p-2.5 rounded-xl border border-white/5 select-all">
                    {formatHashValue(hashes.sha512)}
                  </div>
                </div>

                {/* SHA-384 */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      SHA-384
                    </span>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleCopyHash('sha384', hashes.sha384)}
                      className="h-7 text-xs text-slate-300 hover:bg-white/10"
                    >
                      {copiedKey === 'sha384' ? <Check className="size-3 mr-1 text-emerald-400" /> : <Copy className="size-3 mr-1" />}
                      {copiedKey === 'sha384' ? 'Copied' : 'Copy SHA-384'}
                    </Button>
                  </div>
                  <div className="font-mono text-xs text-slate-300 break-all leading-relaxed bg-black/50 p-2.5 rounded-xl border border-white/5 select-all">
                    {formatHashValue(hashes.sha384)}
                  </div>
                </div>

                {/* SHA-1 */}
                <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      SHA-1
                    </span>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleCopyHash('sha1', hashes.sha1)}
                      className="h-7 text-xs text-amber-300 hover:bg-amber-500/10"
                    >
                      {copiedKey === 'sha1' ? <Check className="size-3 mr-1 text-emerald-400" /> : <Copy className="size-3 mr-1" />}
                      {copiedKey === 'sha1' ? 'Copied' : 'Copy SHA-1'}
                    </Button>
                  </div>
                  <div className="font-mono text-xs text-amber-200 break-all leading-relaxed bg-black/50 p-2.5 rounded-xl border border-white/5 select-all">
                    {formatHashValue(hashes.sha1)}
                  </div>
                </div>

                {/* MD5 */}
                <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      MD5
                    </span>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleCopyHash('md5', hashes.md5)}
                      className="h-7 text-xs text-emerald-300 hover:bg-emerald-500/10"
                    >
                      {copiedKey === 'md5' ? <Check className="size-3 mr-1 text-emerald-400" /> : <Copy className="size-3 mr-1" />}
                      {copiedKey === 'md5' ? 'Copied' : 'Copy MD5'}
                    </Button>
                  </div>
                  <div className="font-mono text-xs text-emerald-200 break-all leading-relaxed bg-black/50 p-2.5 rounded-xl border border-white/5 select-all">
                    {formatHashValue(hashes.md5)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
