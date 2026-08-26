'use client'

import React, { useState, useMemo } from 'react'
import {
  Network,
  Copy,
  Check,
  Server,
  Globe,
  Radio,
  Binary,
  Layers,
  Info,
} from 'lucide-react'
import { toast } from 'sonner'
import { ToolHeader } from '@/components/converter/ToolHeader'
import { PrivacyBanner } from '@/components/converter/PrivacyBanner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { calculateSubnet } from '@/utils/cidrCalculator'


export default function CidrCalculator() {
  const [ipInput, setIpInput] = useState('192.168.1.100')
  const [cidr, setCidr] = useState(24)
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    toast.success(`Copied ${label} to clipboard!`)
    setTimeout(() => setCopied(null), 2000)
  }

  const { result, error } = useMemo(() => {
    try {
      const res = calculateSubnet(ipInput, cidr)
      return { result: res, error: null }
    } catch (e) {
      return { result: null, error: (e as Error).message }
    }
  }, [ipInput, cidr])

  const handlePreset = (ip: string, prefix: number) => {
    setIpInput(ip)
    setCidr(prefix)
    toast.success(`Loaded preset ${ip}/${prefix}`)
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <ToolHeader
        title="CIDR & Subnet IP Calculator"
        description="Calculate IPv4 subnet masks, usable host ranges, broadcast addresses, wildcard masks, and binary network breakdowns."
        badgeText="100% Client-Side Network Tool"
        toolId="cidr-calculator"
      />

      <PrivacyBanner />

      {/* Input Controls Card */}
      <Card className="border border-purple-500/30 bg-[#0d1527] shadow-xl">
        <CardContent className="p-5 md:p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* IP Address */}
            <div className="md:col-span-5 space-y-2">
              <Label htmlFor="cidr-ip-input" className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 cursor-pointer">
                <Globe className="size-3.5 text-purple-400" /> IP Address (IPv4)
              </Label>
              <Input
                id="cidr-ip-input"
                value={ipInput}
                onChange={(e) => setIpInput(e.target.value)}
                placeholder="192.168.1.1 or 10.0.0.0/24"
                className="h-10 bg-black/40 border-purple-500/30 font-mono text-sm text-white"
              />
            </div>

            {/* CIDR Prefix */}
            <div className="md:col-span-4 space-y-2">
              <Label htmlFor="cidr-range-input" className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-1.5">
                  <Network className="size-3.5 text-cyan-400" /> CIDR Subnet Mask
                </span>
                <span className="text-cyan-400 font-mono font-bold">/{cidr} ({result?.netmask})</span>
              </Label>
              <div className="flex items-center gap-3">
                <input
                  id="cidr-range-input"
                  type="range"
                  min="0"
                  max="32"
                  value={cidr}
                  onChange={(e) => setCidr(parseInt(e.target.value, 10))}

                  className="w-full h-2 bg-black/50 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <span className="text-sm font-mono text-cyan-300 w-8 text-right font-bold">
                  /{cidr}
                </span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="md:col-span-3 flex flex-wrap items-center gap-1.5 justify-end">
              <Button
                size="xs"
                variant="outline"
                onClick={() => handlePreset('192.168.1.1', 24)}
                className="h-7 text-[11px] border-white/10 text-slate-300"
              >
                /24 Home
              </Button>
              <Button
                size="xs"
                variant="outline"
                onClick={() => handlePreset('10.0.0.0', 16)}
                className="h-7 text-[11px] border-white/10 text-slate-300"
              >
                /16 VPC
              </Button>
              <Button
                size="xs"
                variant="outline"
                onClick={() => handlePreset('172.16.0.0', 28)}
                className="h-7 text-[11px] border-white/10 text-slate-300"
              >
                /28 Subnet
              </Button>
              <Button
                size="xs"
                variant="outline"
                onClick={() => handlePreset('10.0.0.1', 30)}
                className="h-7 text-[11px] border-white/10 text-slate-300"
              >
                /30 P2P
              </Button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-400 font-mono bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
              ⚠️ {error}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Subnet Results */}
      {result && (
        <div className="space-y-6">
          {/* Main Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Network Address */}
            <div className="p-4 rounded-2xl bg-[#0d1527] border border-purple-500/30 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider font-semibold">
                <span className="flex items-center gap-1.5">
                  <Server className="size-3.5 text-purple-400" /> Network Address
                </span>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => handleCopy(result.networkAddress, 'Network Address')}
                  className="h-6 text-[10px] text-purple-300"
                >
                  {copied === 'Network Address' ? <Check className="size-3" /> : <Copy className="size-3" />}
                </Button>
              </div>
              <div className="text-xl font-bold text-white font-mono mt-2">
                {result.networkAddress}
                <span className="text-xs text-purple-400 font-normal ml-1">/{result.cidr}</span>
              </div>
            </div>

            {/* Broadcast Address */}
            <div className="p-4 rounded-2xl bg-[#0d1527] border border-purple-500/30 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider font-semibold">
                <span className="flex items-center gap-1.5">
                  <Radio className="size-3.5 text-cyan-400" /> Broadcast Address
                </span>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => handleCopy(result.broadcastAddress, 'Broadcast Address')}
                  className="h-6 text-[10px] text-cyan-300"
                >
                  {copied === 'Broadcast Address' ? <Check className="size-3" /> : <Copy className="size-3" />}
                </Button>
              </div>
              <div className="text-xl font-bold text-white font-mono mt-2">
                {result.broadcastAddress}
              </div>
            </div>

            {/* Usable Hosts */}
            <div className="p-4 rounded-2xl bg-[#0d1527] border border-emerald-500/30 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider font-semibold">
                <span className="flex items-center gap-1.5">
                  <Layers className="size-3.5 text-emerald-400" /> Usable Hosts
                </span>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-mono">
                  {result.usableHosts.toLocaleString()}
                </Badge>
              </div>
              <div className="text-xl font-bold text-emerald-300 font-mono mt-2">
                {result.usableHosts.toLocaleString()}
                <span className="text-xs text-slate-400 font-normal ml-1.5">
                  / {result.totalHosts.toLocaleString()} total
                </span>
              </div>
            </div>

            {/* Class & Scope */}
            <div className="p-4 rounded-2xl bg-[#0d1527] border border-amber-500/30 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider font-semibold">
                <span className="flex items-center gap-1.5">
                  <Info className="size-3.5 text-amber-400" /> Class &amp; Scope
                </span>
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">
                  Class {result.ipClass}
                </Badge>
              </div>
              <div className="text-sm font-bold text-amber-300 font-mono mt-2 truncate">
                {result.ipScope}
              </div>
            </div>
          </div>

          {/* Usable Range & Subnet Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border border-purple-500/30 bg-[#0d1527] shadow-xl">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                  <Network className="size-4" /> Usable Host Range &amp; Masks
                </h3>

                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-400">First Usable Host:</span>
                    <span className="text-emerald-400 font-bold select-all">{result.firstUsableHost}</span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-400">Last Usable Host:</span>
                    <span className="text-emerald-400 font-bold select-all">{result.lastUsableHost}</span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-400">Subnet Mask:</span>
                    <span className="text-purple-300 font-bold select-all">{result.netmask}</span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-400">Wildcard (Inverse) Mask:</span>
                    <span className="text-cyan-300 font-bold select-all">{result.wildcard}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 32-Bit Binary Breakdown */}
            <Card className="border border-cyan-500/30 bg-[#0d1527] shadow-xl">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                    <Binary className="size-4" /> 32-Bit Binary Representation
                  </h3>
                  <Badge variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-300 font-mono">
                    Prefix: {result.cidr} Network Bits
                  </Badge>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">IP Address (Binary)</div>
                    <div className="text-purple-300 font-bold tracking-widest text-[11px] select-all">
                      {result.binary.ip}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Subnet Mask (Binary)</div>
                    <div className="text-cyan-300 font-bold tracking-widest text-[11px] select-all">
                      {result.binary.netmask}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Network Address (Binary)</div>
                    <div className="text-emerald-300 font-bold tracking-widest text-[11px] select-all">
                      {result.binary.network}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
