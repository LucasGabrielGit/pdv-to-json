"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  User as UserIcon,
  LogOut,
  Zap,
  ShieldCheck,
  Crown,
  Key,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

import { AuthModal } from "./AuthModal";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PricingModal } from "@/components/pricing/PricingModal";
import { useTranslation } from "@/contexts/I18nContext";
import Link from "next/link";

interface ProfileData {
  free_credits_remaining: number;
  purchased_credits: number;
  is_pro: boolean;
  user_custom_api_key?: string;
}

export function UserMenu() {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();


  // Fetch user and profile
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    async function loadUser() {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        setUser(currentUser);

        if (currentUser) {
          const { data: prof } = await supabase
            .from("profiles")
            .select(
              "free_credits_remaining, purchased_credits, is_pro, user_custom_api_key",
            )
            .eq("id", currentUser.id)
            .single();

          if (prof) {
            setProfile(prof);
          }
        }
      } catch {
        // Ignore auth error in offline or unconfigured env
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser) {
        const { data: prof } = await supabase
          .from("profiles")
          .select(
            "free_credits_remaining, purchased_credits, is_pro, user_custom_api_key",
          )
          .eq("id", sessionUser.id)
          .single();

        if (prof) setProfile(prof);
      } else {
        setProfile(null);
      }
    });

    const handleCreditsUpdated = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        const { data: prof } = await supabase
          .from("profiles")
          .select(
            "free_credits_remaining, purchased_credits, is_pro, user_custom_api_key",
          )
          .eq("id", currentUser.id)
          .single();
        if (prof) setProfile(prof);
      }
    };

    window.addEventListener('devkit_credits_updated', handleCreditsUpdated);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('devkit_credits_updated', handleCreditsUpdated);
    };
  }, []);


  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setMenuOpen(false);
    toast.success("Signed out successfully.");
  };

  const totalCredits =
    (profile?.free_credits_remaining ?? 5) + (profile?.purchased_credits ?? 0);
  const isPro = profile?.is_pro ?? false;

  return (
    <>
      <div ref={menuRef} className="relative">
        {!user ? (
          <button
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center h-8.5 gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 px-3 text-xs font-semibold text-purple-300 hover:text-purple-200 transition-all shadow-xs cursor-pointer"
          >
            <UserIcon className="size-3.5 text-purple-400" />
            <span>{t.common.signIn}</span>
          </button>
        ) : (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center h-8.5 gap-2 rounded-full border border-purple-500/30 bg-[#16213e] hover:border-purple-500/50 pl-1.5 pr-2.5 transition-all cursor-pointer shadow-xs"
          >
            {/* Avatar */}
            <Avatar size="sm" className="size-6">
              <AvatarImage src={user.user_metadata.avatar_url} />
              <AvatarFallback className="uppercase text-[10px]">
                {user.email ? user.email[0] : "U"}
              </AvatarFallback>
            </Avatar>

            {/* Credit chip */}
            <div className="flex items-center gap-1 text-[11px] font-semibold text-purple-300">
              {isPro ? (
                <span className="flex items-center gap-1 text-amber-300 font-bold">
                  <Crown className="size-3 text-amber-400" /> Pro
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Zap className="size-3 text-purple-400" /> {totalCredits}{" "}
                  {t.common.credits}
                </span>
              )}
            </div>

            <ChevronDown className="size-3 text-slate-400 shrink-0" />
          </button>
        )}

        {/* Dropdown Menu */}
        {menuOpen && user && (
          <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-purple-500/30 bg-[#16213e] p-3 shadow-2xl shadow-purple-950/60 space-y-3 z-50 animate-in fade-in zoom-in-95 duration-100">
            {/* User Info */}
            <div className="px-2 py-1 space-y-1">
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                {user.email}
              </p>
            </div>

            <div className="border-t border-purple-500/20" />

            {/* Credits Overview */}
            <div className="rounded-xl bg-black/40 p-3 border border-purple-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Zap className="size-3.5 text-purple-400" /> {t.common.credits}
                </span>
                <span className="font-mono font-bold text-white">
                  {isPro ? t.common.unlimited : `${totalCredits}`}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Crown className="size-3.5 text-amber-400" /> Plan
                </span>
                <Badge
                  variant="outline"
                  className={
                    isPro
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]"
                      : "bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px]"
                  }
                >
                  {isPro ? t.common.proMember : t.common.freeTier}
                </Badge>
              </div>
            </div>

            {/* Upgrade / Pricing Action */}
            <div className="space-y-1.5 pt-1">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setPricingModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 p-2 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
              >
                <Sparkles className="size-3.5" />
                {isPro ? t.common.buyCredits : t.common.upgradeToPro}
              </button>

              <Link
                href="/pricing"
                onClick={() => setMenuOpen(false)}
                className="block text-center text-[11px] text-slate-400 hover:text-white py-1 transition-colors"
              >
                {t.common.viewAllPricing}
              </Link>
            </div>

            <div className="border-t border-purple-500/20" />

            {/* Sign out button */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="size-3.5" />
              {t.common.signOut}
            </button>
          </div>
        )}

      </div>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      <PricingModal
        isOpen={pricingModalOpen}
        onClose={() => setPricingModalOpen(false)}
      />
    </>
  );
}
