'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
import {
  Check,
  Sparkles,
  ShieldCheck,
  Loader2,
  } from 'lucide-react'
import { STRIPE_PLANS, type PlanKey } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/client'
import { AuthModal } from '@/components/auth/AuthModal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PricingModalProps {
  isOpen: boolean
  onClose: () => void
  defaultPlan?: PlanKey
}

export function PricingModal({ isOpen, onClose, defaultPlan: _defaultPlan = 'power' }: PricingModalProps) {

  const [currency, setCurrency] = useState<'usd' | 'brl'>('usd')
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const supabase = createClient()

  const handleCheckout = async (planKey: PlanKey) => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      setShowAuthModal(true)
      toast.info('Please sign in or create a free account to continue.')
      return
    }

    setLoadingPlan(planKey)

    try {
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: planKey,
          currency,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to initialize checkout.')
      }

      // Redirect to Stripe Checkout page
      window.location.href = data.url
    } catch (err) {
      toast.error('Checkout Error', { description: (err as Error).message })
      setLoadingPlan(null)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl bg-[#121226] border border-purple-500/30 text-white p-6 md:p-8 rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader className="text-center space-y-2">
            <div className="flex justify-center">
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 px-3 py-1 text-xs gap-1.5">
                <Sparkles className="size-3.5 text-purple-400" />
                <span>Instant Top-Ups &amp; Pro Access</span>
              </Badge>
            </div>
            <DialogTitle className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Upgrade Your Developer Experience
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm text-slate-300 max-w-lg mx-auto">
              Choose pay-as-you-go credit packs that never expire, or join the Pro Membership for unlimited AI models with zero limits.
            </DialogDescription>
          </DialogHeader>

          {/* Currency Switcher */}
          <div className="flex justify-center my-4">
            <Tabs value={currency} onValueChange={(v) => setCurrency(v as 'usd' | 'brl')}>
              <TabsList className="bg-black/50 border border-purple-500/30 p-1">
                <TabsTrigger value="usd" className="text-xs font-semibold">
                  🇺🇸 USD ($)
                </TabsTrigger>
                <TabsTrigger value="brl" className="text-xs font-semibold">
                  🇧🇷 BRL (R$)
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Grid of Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            {/* Starter */}
            <div className="rounded-2xl border border-white/10 bg-black/30 p-5 flex flex-col justify-between space-y-4 hover:border-purple-500/40 transition-all">
              <div className="space-y-2">
                <h3 className="font-bold text-base text-white">{STRIPE_PLANS.starter.name}</h3>
                <p className="text-xs text-slate-400 min-h-8">
                  {STRIPE_PLANS.starter.description}
                </p>
                <div className="text-2xl font-black text-white pt-2">
                  {currency === 'brl' ? STRIPE_PLANS.starter.brl.formatted : STRIPE_PLANS.starter.usd.formatted}
                  <span className="text-xs text-slate-400 font-normal ml-1.5">one-time</span>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-slate-300">
                {STRIPE_PLANS.starter.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="size-3.5 text-purple-400 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant="outline"
                onClick={() => handleCheckout('starter')}
                disabled={loadingPlan === 'starter'}
                className="w-full border-purple-500/30 text-white hover:bg-purple-500/20 text-xs font-semibold"
              >
                {loadingPlan === 'starter' ? <Loader2 className="size-3.5 animate-spin" /> : 'Buy 50 Credits'}
              </Button>
            </div>

            {/* Power Pack (Highlighted) */}
            <div className="rounded-2xl border-2 border-purple-500 bg-linear-to-b from-purple-500/15 to-black/40 p-5 flex flex-col justify-between space-y-4 relative shadow-xl shadow-purple-500/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-purple-600 text-white font-bold text-[10px] uppercase tracking-wider shadow-md">
                ⭐ Most Popular
              </div>

              <div className="space-y-2 pt-1">
                <h3 className="font-bold text-base text-white">{STRIPE_PLANS.power.name}</h3>
                <p className="text-xs text-slate-300 min-h-8">
                  {STRIPE_PLANS.power.description}
                </p>
                <div className="text-2xl font-black text-purple-300 pt-2">
                  {currency === 'brl' ? STRIPE_PLANS.power.brl.formatted : STRIPE_PLANS.power.usd.formatted}
                  <span className="text-xs text-slate-400 font-normal ml-1.5">one-time</span>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-slate-200">
                {STRIPE_PLANS.power.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="size-3.5 text-cyan-400 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleCheckout('power')}
                disabled={loadingPlan === 'power'}
                className="w-full bg-linear-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30"
              >
                {loadingPlan === 'power' ? <Loader2 className="size-3.5 animate-spin" /> : 'Buy 250 Credits'}
              </Button>
            </div>

            {/* Pro Membership */}
            <div className="rounded-2xl border border-cyan-500/40 bg-linear-to-b from-cyan-500/10 to-black/40 p-5 flex flex-col justify-between space-y-4 hover:border-cyan-500/70 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-white">{STRIPE_PLANS.pro_subscription.name}</h3>
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[10px]">
                    👑 Unlimited
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 min-h-8">
                  {STRIPE_PLANS.pro_subscription.description}
                </p>
                <div className="text-2xl font-black text-cyan-300 pt-2">
                  {currency === 'brl' ? STRIPE_PLANS.pro_subscription.brl.formatted : STRIPE_PLANS.pro_subscription.usd.formatted}
                </div>
              </div>

              <ul className="space-y-2 text-xs text-slate-200">
                {STRIPE_PLANS.pro_subscription.features.slice(0, 5).map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="size-3.5 text-emerald-400 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleCheckout('pro_subscription')}
                disabled={loadingPlan === 'pro_subscription'}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
              >
                {loadingPlan === 'pro_subscription' ? <Loader2 className="size-3.5 animate-spin" /> : 'Subscribe Pro'}
              </Button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="size-4" />
              <span>Encrypted 256-bit Stripe Checkout</span>
            </div>
            <span>No hidden fees • Cancel anytime</span>
          </div>
        </DialogContent>
      </Dialog>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </>
  )
}

