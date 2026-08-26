'use client'

import React, { useState } from 'react'
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Key,
  Crown,
  X,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PricingModal } from '@/components/pricing/PricingModal'
import { setCustomApiKey } from '@/utils/creditsManager'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ProGateModalProps {
  isOpen: boolean
  onClose: () => void
  featureName?: string
  onUnlocked?: () => void
}

export function ProGateModal({
  isOpen,
  onClose,
  featureName = 'Deep Reasoning AI Engine',
  onUnlocked,
}: ProGateModalProps) {
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [showByokInput, setShowByokInput] = useState(false)
  const [byokKey, setByokKey] = useState('')

  if (!isOpen) return null

  const handleSaveByok = () => {
    if (!byokKey.trim()) {
      toast.error('Please enter a valid API key.')
      return
    }
    setCustomApiKey(byokKey.trim())
    toast.success('Custom API Key saved! Pro features unlocked for free.')
    if (onUnlocked) onUnlocked()
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-[#0f172a] border-2 border-purple-500/40 rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-6 shadow-2xl relative overflow-hidden text-slate-100">
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 size-48 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 size-48 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="size-5" />
          </button>

          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 gap-1 text-xs">
                <Crown className="size-3.5 text-amber-400" />
                Pro Exclusive Feature
              </Badge>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Unlock {featureName}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              This advanced capability is powered by deep reasoning models and dedicated high-speed pipelines. Choose how you would like to access it:
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="space-y-2.5 bg-black/40 border border-white/10 rounded-2xl p-4 text-xs">
            <div className="flex items-start gap-2.5">
              <Zap className="size-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Dedicated High-Speed Pipeline:</strong>
                <p className="text-slate-400 text-[11px]">Instant ~1.0s response latency with zero shared queue wait.</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Sparkles className="size-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Deep Reasoning & Architecture:</strong>
                <p className="text-slate-400 text-[11px]">Full AST analysis, complexity reduction and production validation.</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="size-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">100% Ad-Free & Unlimited:</strong>
                <p className="text-slate-400 text-[11px]">Zero daily limits and complete distraction-free workspace.</p>
              </div>
            </div>
          </div>

          {/* BYOK Drawer (if open) */}
          {showByokInput && (
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-3">
              <div className="space-y-1">
                <Label htmlFor="progate-byok" className="text-xs text-purple-200 font-semibold flex items-center gap-1.5 cursor-pointer">
                  <Key className="size-3.5 text-purple-400" /> Enter Your Custom Gemini API Key (Free)
                </Label>
                <Input
                  id="progate-byok"
                  type="password"
                  value={byokKey}
                  onChange={(e) => setByokKey(e.target.value)}
                  placeholder="Paste your AI Studio API key (AIzaSy...)"
                  className="bg-black/50 border-purple-500/30 text-xs font-mono text-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => setShowByokInput(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="xs"
                  onClick={handleSaveByok}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs"
                >
                  Save &amp; Unlock
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <Button
              onClick={() => setShowPricingModal(true)}
              className="w-full bg-linear-to-r from-purple-600 via-purple-500 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-bold text-xs h-10 shadow-lg shadow-purple-600/30 gap-2 cursor-pointer"
            >
              <Crown className="size-4 text-amber-300" />
              <span>Upgrade to Pro Membership ($5.99 / mo)</span>
              <ArrowRight className="size-3.5 ml-auto" />
            </Button>

            {!showByokInput && (
              <Button
                variant="outline"
                onClick={() => setShowByokInput(true)}
                className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-500/10 text-xs font-semibold h-9 gap-1.5"
              >
                <Key className="size-3.5" />
                Or Bring Your Own API Key for 100% Free Access
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Modal trigger */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
      />
    </>
  )
}
