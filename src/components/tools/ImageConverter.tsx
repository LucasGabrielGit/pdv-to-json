'use client'

import React, { useState, useRef } from 'react'
import { toast } from 'sonner'
import {
  Image as ImageIcon,
  Download,
  Copy,
  Trash2,
  Check,
  Sparkles,
  Sliders,
  ArrowRight,
  TrendingDown,
  ExternalLink,
  Layers,
} from 'lucide-react'
import AdSense from '@/components/AdSense'
import { ADS_CONFIG } from '@/config/ads'

import {
  convertImage,
  formatBytes,
  type TargetImageFormat,
  type ImageConversionResult,
} from '@/utils/imageConverter'
import FileDropZone from '@/components/FileDropZone'
import { ToolHeader } from '@/components/converter/ToolHeader'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
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

export default function ImageConverter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [targetFormat, setTargetFormat] = useState<TargetImageFormat>('image/webp')
  const [quality, setQuality] = useState<number>(90) // 90%
  const [scale, setScale] = useState<number>(1.0)
  const [isConverting, setIsConverting] = useState(false)
  const [result, setResult] = useState<ImageConversionResult | null>(null)
  const [copied, setCopied] = useState(false)

  const outputRef = useRef<HTMLDivElement>(null)

  const handleFileSelect = (content: string, filename: string, file: File) => {
    setSelectedFile(file)
    setResult(null)
    setPreviewUrl(URL.createObjectURL(file))
    toast.success(`Selected ${file.name}`)
  }

  const handleConvert = async () => {
    if (!selectedFile) {
      toast.error('No image selected', {
        description: 'Please upload an image to convert.',
      })
      return
    }

    setIsConverting(true)
    try {
      const res = await convertImage(selectedFile, {
        format: targetFormat,
        quality: quality / 100,
        scale,
      })

      setResult(res)
      toast.success('Image converted successfully!', {
        description: `${formatBytes(res.originalSize)} → ${formatBytes(res.convertedSize)} (${res.savingsPercent > 0 ? `Saved ${res.savingsPercent}%` : 'New format'})`,
      })

      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch (err) {
      toast.error('Conversion failed', {
        description: (err as Error).message,
      })
    } finally {
      setIsConverting(false)
    }
  }

  const handleCopyDataUrl = async () => {
    if (!result?.dataUrl) return
    await navigator.clipboard.writeText(result.dataUrl)
    setCopied(true)
    toast.success('Copied Data URI to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!result) return
    const a = document.createElement('a')
    a.href = result.dataUrl
    a.download = result.filename
    a.click()
    toast.success(`Downloaded ${result.filename}`)
  }

  const handleOpenNewWindow = () => {
    if (!result?.dataUrl) return
    const win = window.open()
    if (win) {
      win.document.write(
        `<img src="${result.dataUrl}" style="max-width:100%; height:auto; margin: auto; display: block;" />`
      )
    }
  }

  const handleClear = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setResult(null)
    toast.info('Cleared')
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* ── Header ── */}
      <ToolHeader
        title="Image Converter (PNG, JPEG, WebP)"
        description="Convert PNG, JPEG, WebP, SVG, or GIF images 100% client-side with quality compression and resolution scaling."
        badgeText="HTML5 Canvas Engine"
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
        <CardContent className="p-6 md:p-8">
          {/* Upload Area */}
          {!selectedFile ? (
            <FileDropZone
              fileType="image"
              readAsDataURL={true}
              onFileContent={handleFileSelect}
            />
          ) : (

            <div className="p-4 rounded-2xl bg-black/40 border border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                {previewUrl && (
                  <div className="size-16 rounded-xl overflow-hidden bg-black/50 border border-white/10 shrink-0 flex items-center justify-center p-1">
                    <img
                      src={previewUrl}
                      alt="Source preview"
                      className="max-h-full max-w-full object-contain rounded"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Original Size: <span className="text-purple-300 font-mono">{formatBytes(selectedFile.size)}</span>
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 shrink-0"
              >
                <Trash2 className="size-4 mr-1.5" />
                Change Image
              </Button>
            </div>
          )}

          {/* Settings & Action Controls */}
          {selectedFile && (
            <div className="my-6 p-5 rounded-2xl bg-black/25 border border-white/5 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400">
                <Sliders className="size-4" />
                <span>Conversion Settings</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-slate-300">
                {/* Target Format */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-400">Convert to Format:</Label>
                  <Select
                    value={targetFormat}
                    onValueChange={(v) => setTargetFormat(v as TargetImageFormat)}
                  >
                    <SelectTrigger className="w-full bg-black/40 border-purple-500/30 text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image/webp">WEBP (Recommended)</SelectItem>
                      <SelectItem value="image/png">PNG (Lossless)</SelectItem>
                      <SelectItem value="image/jpeg">JPEG (Compact)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Quality Slider (for JPEG & WebP) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <Label>Quality / Compression:</Label>
                    <span className="font-mono text-purple-300 font-semibold">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    disabled={targetFormat === 'image/png'}
                    className="w-full accent-purple-500 cursor-pointer disabled:opacity-30"
                  />
                </div>

                {/* Resolution Scaling */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-400">Resolution Scale:</Label>
                  <Select
                    value={String(scale)}
                    onValueChange={(v) => setScale(Number(v))}
                  >
                    <SelectTrigger className="w-full bg-black/40 border-purple-500/30 text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">100% (Original Size)</SelectItem>
                      <SelectItem value="0.75">75% Scale</SelectItem>
                      <SelectItem value="0.5">50% Scale</SelectItem>
                      <SelectItem value="0.25">25% Scale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleConvert}
                  disabled={isConverting}
                  className="bg-linear-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold shadow-lg shadow-purple-600/20 px-8"
                >
                  <Sparkles className="size-4 mr-2" />
                  {isConverting ? 'Converting Image...' : 'Convert Image'}
                </Button>
              </div>
            </div>
          )}

          {/* Result Output & Side-by-side Preview */}
          {result && (
            <div ref={outputRef} className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Converted Result
                </Label>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-300 font-mono">
                    {result.width} × {result.height} px
                  </Badge>
                  <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-300 font-mono">
                    {formatBytes(result.convertedSize)}
                  </Badge>
                  {result.savingsPercent > 0 && (
                    <Badge variant="outline" className="text-xs border-emerald-500/40 bg-emerald-500/10 text-emerald-400 gap-1 font-semibold">
                      <TrendingDown className="size-3" />
                      Saved {result.savingsPercent}%
                    </Badge>
                  )}
                </div>
              </div>

              {/* Preview Card */}
              <div className="p-6 rounded-2xl bg-black/40 border border-purple-500/30 flex flex-col items-center gap-4">
                <div className="flex flex-wrap items-center justify-between w-full gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
                    <ImageIcon className="size-4" />
                    <span>{result.filename}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={handleCopyDataUrl}
                      className="gap-1.5 border-purple-500/30 text-purple-300 hover:bg-purple-500/10 text-xs"
                    >
                      {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                      {copied ? 'Copied' : 'Copy Data URI'}
                    </Button>

                    <Button
                      size="xs"
                      variant="outline"
                      onClick={handleOpenNewWindow}
                      className="gap-1.5 border-purple-500/30 text-purple-300 hover:bg-purple-500/10 text-xs"
                    >
                      <ExternalLink className="size-3" />
                      Open Image
                    </Button>

                    <Button
                      size="xs"
                      onClick={handleDownload}
                      className="gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
                    >
                      <Download className="size-3" />
                      Download {targetFormat.split('/')[1].toUpperCase()}
                    </Button>
                  </div>
                </div>

                <div className="relative group max-w-full flex items-center justify-center p-3 rounded-2xl bg-black/60 border border-white/10 shadow-2xl">
                  <img
                    src={result.dataUrl}
                    alt={result.filename}
                    className="max-h-80 max-w-full rounded-xl object-contain shadow-2xl"
                  />
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
