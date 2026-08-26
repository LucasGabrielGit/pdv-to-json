'use client'

import React, { useState, useMemo } from 'react'
import { toast } from 'sonner'
import {
  Copy,
  Download,
  Check,
  RefreshCw,
  Settings2,
  } from 'lucide-react'
import AdSense from '@/components/AdSense'
import { ADS_CONFIG } from '@/config/ads'

import {
  generateIds,
  type IdType,
  type ExportFormat,
  type UuidGeneratorResult,
} from '@/utils/uuidGenerator'
import { ToolHeader } from '@/components/converter/ToolHeader'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import CodeEditor from '@/components/CodeEditor'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PrivacyBanner } from '@/components/converter/PrivacyBanner'

export default function UuidGenerator() {
  const [idType, setIdType] = useState<IdType>('uuidv4')
  const [quantity, setQuantity] = useState<number>(5)
  const [uppercase, setUppercase] = useState(false)
  const [noHyphens, setNoHyphens] = useState(false)
  const [braces, setBraces] = useState(false)
  const [exportFormat, setExportFormat] = useState<ExportFormat>('plain')
  const [tableName, setTableName] = useState('users')
  const [seed, setSeed] = useState(0)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)

  // Compute generated IDs live
  const result: UuidGeneratorResult = useMemo(() => {
    void seed;
    return generateIds(
      {
        type: idType,
        quantity,
        uppercase,
        noHyphens,
        braces,
        tableName,
      },
      exportFormat
    )
  }, [idType, quantity, uppercase, noHyphens, braces, exportFormat, tableName, seed])


  const handleRefresh = () => {
    setSeed((s) => s + 1)
    toast.success(`Generated ${quantity} new ${idType.toUpperCase()} IDs!`)
  }

  const handleCopySingle = async (idVal: string) => {
    await navigator.clipboard.writeText(idVal)
    setCopiedId(idVal)
    toast.success('Copied ID to clipboard!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleCopyAll = async () => {
    if (!result.formattedOutput) return
    await navigator.clipboard.writeText(result.formattedOutput)
    setCopiedAll(true)
    toast.success(`Copied all ${result.totalCount} IDs to clipboard!`)
    setTimeout(() => setCopiedAll(false), 2000)
  }

  const handleDownload = () => {
    if (!result.formattedOutput) return
    let ext = 'txt'
    let mime = 'text/plain;charset=utf-8;'
    if (exportFormat === 'json') {
      ext = 'json'
      mime = 'application/json;charset=utf-8;'
    } else if (exportFormat === 'csv') {
      ext = 'csv'
      mime = 'text/csv;charset=utf-8;'
    } else if (exportFormat === 'sql') {
      ext = 'sql'
      mime = 'text/plain;charset=utf-8;'
    }

    const blob = new Blob([result.formattedOutput], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `identifiers.${ext}`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Downloaded identifiers.${ext}`)
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* ── Header ── */}
      <ToolHeader
        title="UUID & ULID Generator"
        description="Generate UUID v4 (random), UUID v7 (time-ordered), and ULID (Base32) unique identifiers in bulk with custom formatting and export options."
        badgeText="Web Crypto API"
      />

      {/* ── Privacy Banner ── */}
      <PrivacyBanner />

      {/* ── Identifier Version Type Pills ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <button
          onClick={() => setIdType('uuidv4')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            idType === 'uuidv4'
              ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-600/20'
              : 'bg-black/30 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-sm text-purple-300">UUID v4</span>
            <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-300">
              Random
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            Standard 128-bit cryptographically random UUID. Best for general API IDs.
          </p>
        </button>

        <button
          onClick={() => setIdType('uuidv7')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            idType === 'uuidv7'
              ? 'bg-cyan-600/20 border-cyan-500 text-white shadow-lg shadow-cyan-600/20'
              : 'bg-black/30 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-sm text-cyan-300">UUID v7</span>
            <Badge variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-300">
              Time-Ordered
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            Unix timestamp prefix + random bits. Ideal for database primary keys & B-tree indexes.
          </p>
        </button>

        <button
          onClick={() => setIdType('ulid')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            idType === 'ulid'
              ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg shadow-emerald-600/20'
              : 'bg-black/30 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-sm text-emerald-300">ULID</span>
            <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-300">
              Base32
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            26-character Base32 sortable ID. URL-friendly and human readable.
          </p>
        </button>
      </div>

      {/* ── Main Card ── */}
      <Card
        className="rounded-3xl shadow-2xl overflow-hidden border border-[rgba(124,58,237,0.25)] bg-[#16213e]"
        style={{
          boxShadow: '0 25px 60px rgba(0,0,0,0.4), 0 0 60px rgba(124,58,237,0.04)',
        }}
      >
        <CardContent className="p-6 md:p-8 space-y-6">
          {/* Controls Bar */}
          <div className="p-5 rounded-2xl bg-black/25 border border-white/5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400">
              <Settings2 className="size-4" />
              <span>Generation Controls & Format</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-slate-300">
              {/* Quantity Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <Label>Quantity to Generate:</Label>
                  <span className="font-mono text-purple-300 font-semibold">{quantity} IDs</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              {/* Export Format Dropdown */}
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-400">Export Format:</Label>
                <Select
                  value={exportFormat}
                  onValueChange={(val) => setExportFormat(val as ExportFormat)}
                >
                  <SelectTrigger className="w-full bg-black/40 border-purple-500/30 text-slate-200 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plain">Plain List (Line by line)</SelectItem>
                    <SelectItem value="json">JSON Array</SelectItem>
                    <SelectItem value="csv">CSV Format</SelectItem>
                    <SelectItem value="sql">SQL Insert Statements</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* SQL Table Name Input (if SQL mode selected) */}
              {exportFormat === 'sql' ? (
                <div className="space-y-1.5">
                  <Label htmlFor="uuid-sql-table-name" className="text-xs text-slate-400 cursor-pointer">SQL Table Name:</Label>
                  <Input
                    id="uuid-sql-table-name"
                    type="text"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    placeholder="users"
                    className="font-mono text-xs bg-black/40 border-purple-500/30 text-slate-200"
                  />
                </div>
              ) : (

                /* Checkbox Toggles */
                <div className="flex flex-col gap-2 pt-3 text-xs text-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={uppercase}
                      onChange={(e) => setUppercase(e.target.checked)}
                      className="rounded border-purple-500/30 bg-black/40 text-purple-600 focus:ring-purple-500"
                    />
                    <span>UPPERCASE</span>
                  </label>
                  {idType !== 'ulid' && (
                    <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                      <input
                        type="checkbox"
                        checked={noHyphens}
                        onChange={(e) => setNoHyphens(e.target.checked)}
                        className="rounded border-purple-500/30 bg-black/40 text-purple-600 focus:ring-purple-500"
                      />
                      <span>Remove Hyphens (-)</span>
                    </label>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={braces}
                      onChange={(e) => setBraces(e.target.checked)}
                      className="rounded border-purple-500/30 bg-black/40 text-purple-600 focus:ring-purple-500"
                    />
                    <span>Enclose in braces {`{...}`}</span>
                  </label>
                </div>
              )}
            </div>



            <div className="flex justify-end pt-2">
              <Button
                onClick={handleRefresh}
                className="bg-linear-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold shadow-lg shadow-purple-600/20 px-6 gap-2"
              >
                <RefreshCw className="size-4" />
                Generate New Batch
              </Button>
            </div>
          </div>

          {/* Generated IDs Output View */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Generated {idType.toUpperCase()} Identifiers
                </Label>
                <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-300 font-mono">
                  {result.totalCount} total
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={handleCopyAll}
                  className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 text-xs gap-1.5"
                >
                  {copiedAll ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                  {copiedAll ? 'Copied All' : 'Copy All'}
                </Button>

                <Button
                  size="xs"
                  onClick={handleDownload}
                  className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold gap-1.5"
                >
                  <Download className="size-3" />
                  Download
                </Button>
              </div>
            </div>

            {/* Code Output Textarea / Interactive List */}
            {exportFormat !== 'plain' ? (
              <CodeEditor
                value={result.formattedOutput}
                language={exportFormat === 'json' ? 'json' : 'typescript'}
                readOnly
                height="320px"
              />
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {result.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-black/40 border border-purple-500/20 flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="font-mono text-emerald-300 font-semibold select-all">
                      {item.id}
                    </span>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleCopySingle(item.id)}
                      className="h-7 text-xs text-slate-400 hover:text-white hover:bg-white/10 shrink-0"
                    >
                      {copiedId === item.id ? (
                        <Check className="size-3 text-emerald-400" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
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
