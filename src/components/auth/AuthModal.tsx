"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Mail, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { GoogleIcon } from "@/assets/google-icon";
import { GithubIcon } from "@/assets/github-icon";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const supabase = createClient();
  const configured = isSupabaseConfigured();

  const handleOAuthLogin = async (provider: "google" | "github") => {
    if (!configured) {
      toast.info("Supabase Configuration Needed", {
        description:
          "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
        },
      });
      if (error) throw error;
    } catch (err) {
      toast.error("Sign in failed", {
        description: (err as Error).message || "Could not authenticate.",
      });
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) {
      toast.info("Supabase Configuration Needed", {
        description:
          "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.",
      });
      return;
    }

    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;

      setEmailSent(true);
      toast.success("Magic link sent!", {
        description: "Check your email inbox to sign in instantly.",
      });
    } catch (err) {
      toast.error("Failed to send magic link", {
        description:
          (err as Error).message || "Please check your email address.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-purple-500/40 bg-[#16213e] p-6 md:p-8 space-y-5">
        {/* Header */}
        <DialogHeader className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 w-fit">
            <Sparkles className="size-3" />
            <span>dev-kit.tech Account</span>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-white">
            Sign In or Create Account
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Sync your AI generation credits and unlock Pro capabilities.
          </DialogDescription>
        </DialogHeader>

        {emailSent ? (
          <div className="py-6 text-center space-y-4">
            <div className="size-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center mx-auto">
              <Mail className="size-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                Check your email
              </h3>
              <p className="text-xs text-slate-300">
                We sent a secure login link to{" "}
                <span className="font-semibold text-purple-300">{email}</span>.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEmailSent(false)}
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 text-xs"
            >
              Use a different email or provider
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* OAuth Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleOAuthLogin("google")}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <button
                type="button"
                onClick={() => handleOAuthLogin("github")}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                <GithubIcon />
                Continue with GitHub
              </button>
            </div>

            <div className="relative flex items-center justify-center my-4">
              <div className="w-full border-t border-white/10" />
              <span className="bg-[#16213e] px-4 text-[11px] uppercase tracking-wider text-slate-500 font-mono">
                or
              </span>
              <div className="w-full border-t border-white/10" />
            </div>

            {/* Email Magic Link Form */}
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="auth-email" className="text-xs text-slate-400">
                  Email Address
                </Label>
                <Input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@example.com"
                  className="bg-black/40 border-purple-500/30 text-white placeholder:text-slate-500 text-xs rounded-xl"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs py-2.5 rounded-xl shadow-md gap-2"
              >
                {isLoading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <ArrowRight className="size-3.5" />
                )}
                {isLoading ? "Sending Link..." : "Send Magic Login Link"}
              </Button>
            </form>
          </div>
        )}

        {/* Privacy Note */}
        <div className="pt-2 border-t border-purple-500/20 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="size-3.5 text-emerald-400 shrink-0" />
          <span>
            100% Client-Side Privacy: Your code and files are never stored.
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
