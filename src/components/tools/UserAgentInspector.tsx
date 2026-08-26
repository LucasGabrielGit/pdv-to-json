'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Laptop,
  Smartphone,
  Tablet,
  Bot,
  Globe,
  Cpu,
  Monitor,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  ShieldCheck,
  Search,
} from 'lucide-react'
import { toast } from 'sonner'
import { ToolHeader } from '@/components/converter/ToolHeader'
import { PrivacyBanner } from '@/components/converter/PrivacyBanner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { parseUserAgent, type ParsedUserAgent } from '@/utils/userAgentParser'

const PRESET_UAS = [
  {
    name: 'Current Browser (You)',
    ua: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  },
  {
    name: 'Chrome 125 (Windows 11)',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  },
  {
    name: 'Safari 17.5 (iPhone 15 Pro)',
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  },
  {
    name: 'Safari 17 (macOS Sonoma M3)',
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
  },
  {
    name: 'Googlebot Smartphone',
    ua: 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.154 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  },
  {
    name: 'ChatGPT / GPTBot Crawler',
    ua: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.0; +https://openai.com/gptbot)',
  },
  {
    name: 'cURL HTTP Client',
    ua: 'curl/8.4.0',
  },
]

export default function UserAgentInspector() {
  const [uaInput, setUaInput] = useState('')
  const [screenInfo, setScreenInfo] = useState({
    width: 0,
    height: 0,
    pixelRatio: 1,
    colorDepth: 24,
    language: 'en-US',
  })
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUaInput(navigator.userAgent)
      setScreenInfo({
        width: window.screen.width,
        height: window.screen.height,
        pixelRatio: window.devicePixelRatio || 1,
        colorDepth: window.screen.colorDepth || 24,
        language: navigator.language || 'en-US',
      })
    }
  }, [])

  const parsed: ParsedUserAgent = useMemo(() => {
    return parseUserAgent(uaInput || (typeof navigator !== 'undefined' ? navigator.userAgent : ''))
  }, [uaInput])

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    toast.success(`Copied ${label} to clipboard!`)
    setTimeout(() => setCopied(null), 2000)
  }

  const getDeviceIcon = () => {
    if (parsed.isBot) return <Bot className="size-6 text-purple-400" />
    if (parsed.device.type === 'Mobile') return <Smartphone className="size-6 text-cyan-400" />
    if (parsed.device.type === 'Tablet') return <Tablet className="size-6 text-emerald-400" />
    return <Laptop className="size-6 text-purple-400" />
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <ToolHeader
        title="User-Agent & Device Inspector"
        description="Decode any User-Agent string to inspect browser engine, operating system, device hardware, bot crawling signatures, and client screen details."
        badgeText="100% Client-Side UA Parser"
        toolId="user-agent"
      />

      <PrivacyBanner />

      {/* Input / Presets Card */}
      <Card className="border border-purple-500/30 bg-[#0d1527] shadow-xl">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Globe className="size-3.5 text-purple-400" /> User-Agent String
            </Label>
            <Button
              size="xs"
              variant="outline"
              onClick={() => {
                if (typeof navigator !== 'undefined') {
                  setUaInput(navigator.userAgent)
                  toast.success('Detected current browser User-Agent!')
                }
              }}
              className="h-6 text-[11px] border-purple-500/30 text-purple-300 hover:bg-purple-500/10 gap-1"
            >
              <Sparkles className="size-3" /> Detect My Device
            </Button>
          </div>

          <textarea
            value={uaInput}
            onChange={(e) => setUaInput(e.target.value)}
            placeholder="Paste User-Agent string here..."
            className="w-full h-20 p-3 rounded-xl bg-black/50 border border-purple-500/30 font-mono text-xs text-slate-200 focus:outline-none focus:border-purple-400/80 resize-none leading-relaxed"
          />

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400 mr-1">Presets:</span>
            {PRESET_UAS.filter((p) => p.ua).map((preset, idx) => (
              <Button
                key={idx}
                size="xs"
                variant="outline"
                onClick={() => setUaInput(preset.ua)}
                className="h-6 text-[10px] border-white/10 text-slate-300 hover:text-white"
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Browser Card */}
        <div className="p-5 rounded-2xl bg-[#0d1527] border border-purple-500/30 shadow-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Globe className="size-4" />
              </div>
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Browser</span>
            </div>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => handleCopy(parsed.browser.name, 'Browser')}
              className="h-6 text-[10px] text-purple-300"
            >
              {copied === 'Browser' ? <Check className="size-3" /> : <Copy className="size-3" />}
            </Button>
          </div>
          <div>
            <div className="text-lg font-bold text-white truncate">{parsed.browser.name}</div>
            <div className="text-xs font-mono text-purple-400 mt-0.5">
              Version: {parsed.browser.version}
            </div>
          </div>
        </div>

        {/* Operating System Card */}
        <div className="p-5 rounded-2xl bg-[#0d1527] border border-cyan-500/30 shadow-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Monitor className="size-4" />
              </div>
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Operating System</span>
            </div>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => handleCopy(parsed.os.name, 'OS')}
              className="h-6 text-[10px] text-cyan-300"
            >
              {copied === 'OS' ? <Check className="size-3" /> : <Copy className="size-3" />}
            </Button>
          </div>
          <div>
            <div className="text-lg font-bold text-white truncate">{parsed.os.name}</div>
            <div className="text-xs font-mono text-cyan-400 mt-0.5">
              Version: {parsed.os.version || 'Standard'}
            </div>
          </div>
        </div>

        {/* Device & Engine Card */}
        <div className="p-5 rounded-2xl bg-[#0d1527] border border-emerald-500/30 shadow-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                {getDeviceIcon()}
              </div>
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Device Type</span>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
              {parsed.device.type}
            </Badge>
          </div>
          <div>
            <div className="text-lg font-bold text-white truncate">
              {parsed.device.vendor} {parsed.device.model}
            </div>
            <div className="text-xs font-mono text-emerald-400 mt-0.5">
              Engine: {parsed.engine.name} ({parsed.engine.version || 'latest'})
            </div>
          </div>
        </div>

        {/* CPU & Bot Status */}
        <div className="p-5 rounded-2xl bg-[#0d1527] border border-amber-500/30 shadow-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Cpu className="size-4" />
              </div>
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">CPU Architecture</span>
            </div>
            {parsed.isBot && (
              <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-[10px]">
                Bot / Crawler
              </Badge>
            )}
          </div>
          <div>
            <div className="text-sm font-bold text-white font-mono truncate">{parsed.cpu.architecture}</div>
            <div className="text-xs font-mono text-amber-400 mt-0.5">
              {parsed.isBot ? `Crawler: ${parsed.botName}` : 'Human User-Agent'}
            </div>
          </div>
        </div>
      </div>

      {/* Screen & Client Environment Details */}
      <Card className="border border-purple-500/20 bg-[#0d1527] shadow-xl">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
            <Layers className="size-4" /> Client Device Environment &amp; Display Metrics
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase">Screen Size</div>
              <div className="text-white font-bold">{screenInfo.width} × {screenInfo.height} px</div>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase">Device Pixel Ratio</div>
              <div className="text-cyan-300 font-bold">{screenInfo.pixelRatio}x (Retina)</div>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase">Color Depth</div>
              <div className="text-purple-300 font-bold">{screenInfo.colorDepth}-bit</div>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase">Language</div>
              <div className="text-emerald-300 font-bold">{screenInfo.language}</div>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase">Cookies Enabled</div>
              <div className="text-amber-300 font-bold">
                {typeof navigator !== 'undefined' && navigator.cookieEnabled ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
