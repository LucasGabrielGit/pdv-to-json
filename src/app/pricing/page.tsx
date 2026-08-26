"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Check,
  Sparkles,
  Crown,
  Loader2,
  HelpCircle,
  ArrowLeft,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { STRIPE_PLANS, type PlanKey } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/client";
import { syncUserCreditsWithCloud } from "@/utils/creditsManager";
import { useTranslation } from "@/contexts/I18nContext";
import { AuthModal } from "@/components/auth/AuthModal";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

function PricingContent() {
  const searchParams = useSearchParams();
  const { t, locale } = useTranslation();
  const [currency, setCurrency] = useState<"usd" | "brl">(
    locale === "pt" ? "brl" : "usd",
  );
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isPro, setIsPro] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const supabase = useMemo(() => createClient(), []);


  useEffect(() => {
    if (locale === "pt") {
      setCurrency("brl");
    } else {
      setCurrency("usd");
    }
  }, [locale]);

  const isSuccess = searchParams.get("success") === "true";
  const sessionId = searchParams.get("session_id");
  const isCanceled = searchParams.get("canceled") === "true";

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        supabase
          .from("profiles")
          .select("is_pro")
          .eq("id", data.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile?.is_pro) setIsPro(true);
          });
      }
    });
  }, [supabase]);

  useEffect(() => {
    if (isSuccess && sessionId) {
      // Call verify-session to immediately apply credits/Pro to user
      fetch(`/api/checkout/verify-session?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            toast.success(
              data.message ||
                "Payment verified! Your credits have been credited.",
              { duration: 6000 },
            );
            // Trigger a quick reload of user session/profile and sync credits
            syncUserCreditsWithCloud(supabase).then(() => {
              window.dispatchEvent(new Event("devkit_credits_updated"));
            });
            supabase.auth.getUser().then(({ data: u }) => {
              setUser(u.user);
              if (data.isPro) setIsPro(true);
            });
          } else {
            console.warn("Session verify note:", data.error);
          }
        })
        .catch((err) => {
          console.error("Failed to verify session:", err);
        });
    } else if (isSuccess) {
      syncUserCreditsWithCloud(supabase).then(() => {
        window.dispatchEvent(new Event("devkit_credits_updated"));
      });
      toast.success("Payment received! Your profile has been updated.", {
        duration: 6000,
      });
    } else if (isCanceled) {
      toast.info("Checkout was cancelled.");
    }
  }, [isSuccess, sessionId, isCanceled, supabase]);


  const handleCheckout = async (planKey: PlanKey) => {
    if (!user) {
      setShowAuthModal(true);
      toast.info("Please sign in or create an account to continue.");
      return;
    }

    setLoadingPlan(planKey);

    try {
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: planKey,
          currency,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to initialize checkout.");
      }

      window.location.href = data.url;
    } catch (err) {
      toast.error("Checkout Error", { description: (err as Error).message });
      setLoadingPlan(null);
    }
  };

  const handleOpenCustomerPortal = async () => {
    setIsLoadingPortal(true);
    try {
      const res = await fetch("/api/checkout/customer-portal", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to open billing portal.");
      }
      window.location.href = data.url;
    } catch (err) {
      toast.error("Billing Portal Error", {
        description: (err as Error).message,
      });
      setIsLoadingPortal(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 md:px-8 max-w-7xl mx-auto space-y-12">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link href="/">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> {t.common.backToTools}
          </Button>
        </Link>
        {isPro && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenCustomerPortal}
            disabled={isLoadingPortal}
            className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 text-xs font-semibold gap-2"
          >
            {isLoadingPortal ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Crown className="size-3.5" />
            )}
            {t.header.manageSubscription}
          </Button>
        )}
      </div>

      {/* Success Notification Banner */}
      {isSuccess && (
        <Card className="border border-emerald-500/40 bg-emerald-500/10 backdrop-blur-md">
          <CardContent className="p-6 flex items-center gap-4">
            <div className=" rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-emerald-300">
                Payment Received &amp; Verified!
              </h2>
              <p className="text-xs md:text-sm text-slate-300 mt-0.5">
                Thank you for supporting dev-kit.tech! Your credits or Pro
                membership are now active in your profile.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 px-3 py-1 text-xs gap-1.5 font-semibold">
          <Sparkles className="size-3.5 text-purple-400" />
          <span>{t.pricing.badge}</span>
        </Badge>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white">
          {t.pricing.heroTitle}
        </h1>
        <p className="text-base text-slate-300 leading-relaxed">
          {t.pricing.heroDesc}
        </p>

        {/* Currency Switcher */}
        <div className="flex justify-center pt-4">
          <Tabs
            value={currency}
            onValueChange={(v) => setCurrency(v as "usd" | "brl")}
          >
            <TabsList className="bg-[#16213e] border border-purple-500/30 p-1">
              <TabsTrigger value="usd" className="text-xs font-semibold px-4">
                {t.pricing.usdTab}
              </TabsTrigger>
              <TabsTrigger value="brl" className="text-xs font-semibold px-4">
                {t.pricing.brlTab}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Tier 1: Free Tier */}
        <div className="rounded-3xl border border-white/10 bg-[#16213e]/40 p-6 flex flex-col justify-between space-y-6 hover:border-white/20 transition-all">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-lg text-white">
                {t.pricing.freeDeveloper}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {t.pricing.freeDesc}
              </p>
            </div>
            <div className="text-3xl font-black text-white">
              $0
              <span className="text-xs text-slate-400 font-normal ml-1">
                {t.pricing.forever}
              </span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-white/5">
              <li className="flex items-center gap-2">
                <Check className="size-3.5 text-emerald-400 shrink-0" />
                <span>All 20+ Client-side Converters</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-3.5 text-emerald-400 shrink-0" />
                <span>5 Free Daily AI Credits</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-3.5 text-emerald-400 shrink-0" />
                <span>Bring Your Own Key (BYOK)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-3.5 text-emerald-400 shrink-0" />
                <span>100% Client-Side Privacy</span>
              </li>
            </ul>
          </div>

          <Link href="/" className="w-full">
            <Button
              variant="outline"
              className="w-full border-white/20 text-slate-200 hover:bg-white/10 text-xs font-semibold"
            >
              {t.pricing.getStartedFree}
            </Button>
          </Link>
        </div>

        {/* Tier 2: Starter Pack */}
        <div className="rounded-3xl border border-purple-500/30 bg-[#16213e]/60 p-6 flex flex-col justify-between space-y-6 hover:border-purple-500/50 transition-all">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-lg text-white">
                {t.pricing.starterName}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {t.pricing.starterDesc}
              </p>
            </div>
            <div className="text-3xl font-black text-purple-300">
              {currency === "brl"
                ? STRIPE_PLANS.starter.brl.formatted
                : STRIPE_PLANS.starter.usd.formatted}
              <span className="text-xs text-slate-400 font-normal ml-1.5">
                one-time
              </span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-white/5">
              {STRIPE_PLANS.starter.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="size-3.5 text-purple-400 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button
            variant="outline"
            onClick={() => handleCheckout("starter")}
            disabled={loadingPlan === "starter"}
            className="w-full border-purple-500/30 text-white hover:bg-purple-500/20 text-xs font-semibold"
          >
            {loadingPlan === "starter" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              t.pricing.buyStarter
            )}
          </Button>
        </div>

        {/* Tier 3: Power Pack (Most Popular) */}
        <div className="rounded-3xl border-2 border-purple-500 bg-linear-to-b from-purple-500/20 via-[#16213e]/80 to-black/60 p-6 flex flex-col justify-between space-y-6 relative shadow-2xl shadow-purple-500/20">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-purple-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-1">
            <Flame className="size-3.5" /> Most Popular
          </div>

          <div className="space-y-4 pt-1">
            <div>
              <h3 className="font-bold text-lg text-white">
                {t.pricing.powerName}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {t.pricing.powerDesc}
              </p>
            </div>
            <div className="text-3xl font-black text-purple-300">
              {currency === "brl"
                ? STRIPE_PLANS.power.brl.formatted
                : STRIPE_PLANS.power.usd.formatted}
              <span className="text-xs text-slate-400 font-normal ml-1.5">
                one-time
              </span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-200 pt-2 border-t border-white/10">
              {STRIPE_PLANS.power.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="size-3.5 text-cyan-400 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button
            onClick={() => handleCheckout("power")}
            disabled={loadingPlan === "power"}
            className="w-full bg-linear-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs py-2.5 shadow-lg shadow-purple-600/30"
          >
            {loadingPlan === "power" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              t.pricing.buyPower
            )}
          </Button>
        </div>

        {/* Tier 4: Pro Subscription */}
        <div className="rounded-3xl border border-cyan-500/50 bg-linear-to-b from-cyan-500/15 via-[#16213e]/80 to-black/60 p-6 flex flex-col justify-between space-y-6 hover:border-cyan-400 transition-all shadow-xl shadow-cyan-500/10">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-white">
                {t.pricing.proMembershipName}
              </h3>
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-[10px]">
                👑 {t.common.unlimited}
              </Badge>
            </div>
            <p className="text-xs text-slate-300">
              {t.pricing.proMembershipDesc}
            </p>
            <div className="text-3xl font-black text-cyan-300">
              {currency === "brl"
                ? STRIPE_PLANS.pro_subscription.brl.formatted
                : STRIPE_PLANS.pro_subscription.usd.formatted}
            </div>
            <ul className="space-y-2.5 text-xs text-slate-200 pt-2 border-t border-white/10">
              {STRIPE_PLANS.pro_subscription.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="size-3.5 text-emerald-400 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button
            onClick={() => handleCheckout("pro_subscription")}
            disabled={loadingPlan === "pro_subscription"}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs py-2.5 shadow-lg shadow-cyan-600/30"
          >
            {loadingPlan === "pro_subscription" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              t.pricing.joinPro
            )}
          </Button>
        </div>
      </div>

      {/* Pro Pack Banner (Large Volume) */}
      <Card className="border border-purple-500/30 bg-[#16213e]/70 backdrop-blur-md">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {t.pricing.heavyUsersAgency}
            </div>
            <h2 className="text-2xl font-black text-white">
              {t.pricing.needMassiveVolume}
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-xl">
              {t.pricing.proPackDesc}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <div className="text-3xl font-black text-purple-300">
              {currency === "brl"
                ? STRIPE_PLANS.pro_pack.brl.formatted
                : STRIPE_PLANS.pro_pack.usd.formatted}
            </div>
            <Button
              onClick={() => handleCheckout("pro_pack")}
              disabled={loadingPlan === "pro_pack"}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-6 py-2.5"
            >
              {loadingPlan === "pro_pack" ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                t.pricing.buyProPack
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <div className="space-y-6 pt-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-white text-center flex items-center justify-center gap-2">
          <HelpCircle className="size-5 text-purple-400" /> {t.pricing.faqTitle}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border border-white/5 bg-black/30">
            <CardContent className="p-5 space-y-2">
              <h3 className="text-sm font-bold text-white">
                {t.pricing.faq1Q}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t.pricing.faq1A}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-white/5 bg-black/30">
            <CardContent className="p-5 space-y-2">
              <h3 className="text-sm font-bold text-white">
                {t.pricing.faq2Q}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t.pricing.faq2A}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-white/5 bg-black/30">
            <CardContent className="p-5 space-y-2">
              <h3 className="text-sm font-bold text-white">
                {t.pricing.faq3Q}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t.pricing.faq3A}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-white/5 bg-black/30">
            <CardContent className="p-5 space-y-2">
              <h3 className="text-sm font-bold text-white">
                {t.pricing.faq4Q}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t.pricing.faq4A}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400">
          Loading Pricing...
        </div>
      }
    >
      <PricingContent />
    </Suspense>
  );
}
