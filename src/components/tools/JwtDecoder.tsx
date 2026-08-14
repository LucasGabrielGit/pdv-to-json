'use client'

import React, { useState, useMemo } from 'react'
import { toast } from 'sonner'
import {
  Key,
  Copy,
  Download,
  Trash2,
  Check,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Building,
  Calendar,
  Lock,
} from 'lucide-react'
import AdSense from '@/components/AdSense'
import { ADS_CONFIG } from '@/config/ads'

import {
  decodeJwt,
  SAMPLE_JWT,
  type JwtDecodeResult,
} from '@/utils/jwtDecoder'
import { ToolHeader } from '@/components/converter/ToolHeader'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { PrivacyBanner } from '@/components/converter/PrivacyBanner'

export default function JwtDecoder() {
  const [tokenInput, setTokenInput] = useState(SAMPLE_JWT)
  const [copiedHeader, setCopiedHeader] = useState(false)
  const [copiedPayload, setCopiedPayload] = useState(false)

  // Compute JWT decode result live
  const result: JwtDecodeResult = useMemo(() => {
    return decodeJwt(tokenInput)
  }, [tokenInput])

  const handleLoadSample = () => {
    setTokenInput(SAMPLE_JWT)
    toast.success('Loaded sample JWT token')
  }

  const handleCopyHeader = async () => {
    if (!result.formattedHeader) return
    await navigator.clipboard.writeText(result.formattedHeader)
    setCopiedHeader(true)
    toast.success('Copied JWT Header to clipboard!')
    setTimeout(() => setCopiedHeader(false), 2000)
  }

  const handleCopyPayload = async () => {
    if (!result.formattedPayload) return
    await navigator.clipboard.writeText(result.formattedPayload)
    setCopiedPayload(true)
    toast.success('Copied JWT Payload to clipboard!')
    setTimeout(() => setCopiedPayload(false), 2000)
  }

  const handleClear = () => {
    setTokenInput('')
    toast.info('Cleared input')
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* ── Header ── */}
      <ToolHeader
        title="JWT Decoder & Inspector"
        description="Decode JSON Web Tokens (JWT) in real-time. Inspect headers, payloads, algorithms, signature structures, and expiration timestamps with zero server calls."
        badgeText="Real-time Inspector"
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
          {/* JWT Input Area */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Encoded JWT Token Input
              </Label>

              <div className="flex items-center gap-2">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={handleLoadSample}
                  className="bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20 transition-all text-xs"
                >
                  <Sparkles className="size-3 mr-1 text-purple-400" />
                  Load Sample Token
                </Button>

                <Button
                  size="xs"
                  variant="ghost"
                  onClick={handleClear}
                  disabled={!tokenInput}
                  className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs"
                >
                  <Trash2 className="size-3.5 mr-1" />
                  Clear
                </Button>
              </div>
            </div>

            <Textarea
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Paste your JWT token here (eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
              className="h-32 font-mono text-sm resize-y leading-relaxed bg-black/35 text-slate-100 border border-[rgba(124,58,237,0.25)] break-all"
              spellCheck={false}
            />
          </div>

          {/* Validation & Expiration Status Alert */}
          {tokenInput.trim() && (
            <div>
              {!result.isValid ? (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
                  <AlertTriangle className="size-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-rose-400">Invalid JWT Token</p>
                    <p className="text-rose-300/90 mt-0.5">{result.error}</p>
                  </div>
                </div>
              ) : (
                <div
                  className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs ${
                    result.expiration.isExpired
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {result.expiration.isExpired ? (
                      <AlertTriangle className="size-4 text-rose-400 shrink-0" />
                    ) : (
                      <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                    )}

                    <div>
                      <p className="font-semibold text-sm">
                        {result.expiration.isExpired
                          ? 'Token Expired'
                          : result.expiration.expiresAt
                          ? 'Token Active & Valid'
                          : 'Token Decoded'}
                      </p>
                      {result.expiration.timeRemainingOrPast && (
                        <p className="text-xs opacity-90 mt-0.5">
                          {result.expiration.isExpired ? 'Expired ' : 'Expires '}
                          <span className="font-mono font-bold">{result.expiration.timeRemainingOrPast}</span>
                          {result.expiration.expiresAt && ` (${result.expiration.expiresAt.toLocaleString()})`}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {result.header.alg && (
                      <Badge variant="outline" className="border-purple-500/40 bg-purple-500/10 text-purple-300 font-mono text-xs">
                        Alg: {String(result.header.alg)}
                      </Badge>
                    )}
                    {result.header.typ && (
                      <Badge variant="outline" className="border-cyan-500/40 bg-cyan-500/10 text-cyan-300 font-mono text-xs">
                        Type: {String(result.header.typ)}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Standard Claims Summary Cards */}
          {result.isValid && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-purple-400 font-medium">
                  <User className="size-3.5" />
                  <span>Subject (sub)</span>
                </div>
                <p className="font-mono text-slate-200 truncate">
                  {result.payload.sub ? String(result.payload.sub) : '—'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-400 font-medium">
                  <Building className="size-3.5" />
                  <span>Issuer (iss)</span>
                </div>
                <p className="font-mono text-slate-200 truncate">
                  {result.payload.iss ? String(result.payload.iss) : '—'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                  <Calendar className="size-3.5" />
                  <span>Issued At (iat)</span>
                </div>
                <p className="font-mono text-slate-200 truncate">
                  {result.expiration.issuedAt ? result.expiration.issuedAt.toLocaleString() : '—'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <Clock className="size-3.5" />
                  <span>Expiration (exp)</span>
                </div>
                <p className="font-mono text-slate-200 truncate">
                  {result.expiration.expiresAt ? result.expiration.expiresAt.toLocaleString() : '—'}
                </p>
              </div>
            </div>
          )}

          {/* Interactive Decoded Sections (Header, Payload, Signature) */}
          {result.isValid && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* HEADER SECTION */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-400">
                    <span className="size-2 rounded-full bg-rose-500"></span>
                    <span>Header (Algorithm & Token Type)</span>
                  </div>

                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={handleCopyHeader}
                    className="h-7 text-xs text-rose-300 hover:bg-rose-500/10"
                  >
                    {copiedHeader ? <Check className="size-3 mr-1 text-emerald-400" /> : <Copy className="size-3 mr-1" />}
                    {copiedHeader ? 'Copied' : 'Copy Header'}
                  </Button>
                </div>

                <div className="rounded-2xl overflow-hidden border border-rose-500/30 bg-black/40">
                  <Textarea
                    readOnly
                    value={result.formattedHeader}
                    className="h-52 font-mono text-sm leading-relaxed text-rose-300 bg-transparent border-0 focus-visible:ring-0 resize-y"
                    spellCheck={false}
                  />
                </div>
              </div>

              {/* PAYLOAD SECTION */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400">
                    <span className="size-2 rounded-full bg-purple-500"></span>
                    <span>Payload (Data & Claims)</span>
                  </div>

                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={handleCopyPayload}
                    className="h-7 text-xs text-purple-300 hover:bg-purple-500/10"
                  >
                    {copiedPayload ? <Check className="size-3 mr-1 text-emerald-400" /> : <Copy className="size-3 mr-1" />}
                    {copiedPayload ? 'Copied' : 'Copy Payload'}
                  </Button>
                </div>

                <div className="rounded-2xl overflow-hidden border border-purple-500/30 bg-black/40">
                  <Textarea
                    readOnly
                    value={result.formattedPayload}
                    className="h-52 font-mono text-sm leading-relaxed text-purple-300 bg-transparent border-0 focus-visible:ring-0 resize-y"
                    spellCheck={false}
                  />
                </div>
              </div>
            </div>
          )}

          {/* SIGNATURE SECTION */}
          {result.isValid && result.signature && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
                <Lock className="size-3.5" />
                <span>Signature</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/40 border border-cyan-500/30 font-mono text-xs text-cyan-300 break-all leading-relaxed">
                {result.signature}
              </div>
              <p className="text-[11px] text-slate-400">
                🔒 Client-side JWT decoding parses token claims without verifying secret key signatures on backend servers.
              </p>
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
