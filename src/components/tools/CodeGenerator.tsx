"use client";

import React, { useState, useEffect, useMemo } from "react";

import { toast } from "sonner";
import {
  Sparkles,
  Copy,
  Check,
  Zap,
  Code2,
  BookOpen,
  Play,
  RotateCcw,
  Wand2,
} from "lucide-react";
import AdSense from "@/components/AdSense";
import { ADS_CONFIG } from "@/config/ads";

import {
  getUserCredits,
  consumeCredit,
  canConsumeCredit,
  syncUserCreditsWithCloud,
  type UserCredits,
} from "@/utils/creditsManager";
import { createClient } from "@/lib/supabase/client";
import { ToolHeader } from "@/components/converter/ToolHeader";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { PrivacyBanner } from "@/components/converter/PrivacyBanner";
import { ByokBadge } from "@/components/ai/ByokBadge";
import { AiQuotaIndicator } from "@/components/ai/AiQuotaIndicator";
import { AiLoadingState } from "@/components/ai/AiLoadingState";
import { ProGateModal } from "@/components/pro/ProGateModal";
import { useProStatus } from "@/hooks/useProStatus";
import CodeEditor from "@/components/CodeEditor";

const TYPES = [
  { id: "full", label: "Full Module / Function" },
  { id: "sql", label: "SQL Query / Schema" },
  { id: "interface", label: "TypeScript Interface" },
  { id: "regex", label: "Regex Pattern" },
];

const LANGUAGES = [
  "typescript",
  "sql",
  "python",
  "javascript",
  "html",
  "rust",
  "go",
];

const SAMPLE_PROMPT =
  "Create a TypeScript function to validate Brazilian CPF and CNPJ document numbers with checksum digit verification.";

export default function CodeGenerator() {
  const [prompt, setPrompt] = useState(SAMPLE_PROMPT);
  const [type, setType] = useState("full");
  const [language, setLanguage] = useState("typescript");
  const [userCredits, setUserCredits] = useState<UserCredits>(() => getUserCredits());
  const [aiMode, setAiMode] = useState<"turbo" | "deep">("turbo");

  const [isLoading, setIsLoading] = useState(false);
  const [generatorResult, setGeneratorResult] = useState<{
    generatedCode: string;
    explanation: string;
    usageExample: string;
  } | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const handleUpdate = () => {
      setUserCredits(getUserCredits());
    };
    handleUpdate();
    syncUserCreditsWithCloud(supabase).then(setUserCredits);

    window.addEventListener("devkit_credits_updated", handleUpdate);
    return () => window.removeEventListener("devkit_credits_updated", handleUpdate);
  }, [supabase]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please describe what code you want to generate.");
      return;
    }

    const check = canConsumeCredit();
    if (!check.allowed) {
      setIsProModalOpen(true);
      toast.error("Cota diária gratuita atingida.", { description: check.reason });
      return;
    }

    setIsLoading(true);
    setGeneratorResult(null);

    try {
      const res = await fetch("/api/ai/code-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          language,
          type,
          aiMode,
          customApiKey: userCredits.userCustomApiKey || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 403) {
          setIsProModalOpen(true);
        }
        throw new Error(data.error || "Failed to generate code.");
      }

      setGeneratorResult(data.data);
      const updatedCreds = consumeCredit();
      setUserCredits(updatedCreds);
      toast.success("AI Code Generation Complete!");
    } catch (err) {
      toast.error("Generation Error", { description: (err as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied ${key} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const {
    requirePro,
    isProModalOpen,
    setIsProModalOpen,
    proModalFeature,
    isProOrByok,
  } = useProStatus();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-6">
      <ProGateModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        featureName={proModalFeature}
      />
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <ToolHeader
          title="AI Code Generator & Architect"
          description="Describe any function, API handler, SQL schema, or algorithm in plain English or Portuguese and get production-ready code with explanations."
          badgeText="AI Code Architect"
        />
        <div className="shrink-0 self-start sm:self-center">
          <AiQuotaIndicator />
        </div>
      </div>

      {/* ── Privacy Banner ── */}
      <PrivacyBanner />

      {/* ── Top Controls & Options Bar ── */}
      <Card className="rounded-3xl shadow-xl border border-purple-500/25 bg-[#16213e] mb-6">
        <CardContent className="p-4 md:p-5 flex flex-wrap items-center justify-between gap-4">
          {/* Type Pills & Language Selector */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mr-1">
                Type:
              </span>
              {TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
                    type === t.id
                      ? "bg-purple-600 text-white border-purple-500 shadow-md"
                      : "bg-black/30 border-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-white/10 hidden md:block" />

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mr-1">
                Language:
              </span>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-mono capitalize transition-all ${
                    language === lang
                      ? "bg-cyan-600 text-white border-cyan-500 font-semibold shadow-md"
                      : "bg-black/30 border-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions & Generate Submit */}
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center bg-black/40 border border-purple-500/30 rounded-lg p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setAiMode("turbo")}
                className={`px-2.5 py-1 rounded-md transition-all font-semibold flex items-center gap-1 text-[11px] cursor-pointer ${
                  aiMode === "turbo"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Ultra-fast generation (~1.2s)"
              >
                <Zap className="size-3 text-amber-400" /> Turbo (~1.2s)
              </button>
              <button
                type="button"
                onClick={() =>
                  requirePro("Deep Code Generation Engine", () =>
                    setAiMode("deep")
                  )
                }
                className={`px-2.5 py-1 rounded-md transition-all font-semibold flex items-center gap-1.5 text-[11px] cursor-pointer ${
                  aiMode === "deep"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Deep code synthesis & optimization (~3.5s)"
              >
                <Sparkles className="size-3 text-cyan-400" />
                <span>Deep (~3.5s)</span>
                {!isProOrByok && <ByokBadge />}
              </button>
            </div>

            <Button
              size="xs"
              variant="ghost"
              onClick={() => setPrompt(SAMPLE_PROMPT)}
              className="text-purple-300 hover:bg-purple-500/10 text-xs"
            >
              <Sparkles className="size-3 mr-1 text-purple-400" />
              Sample Prompt
            </Button>

            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              className="bg-linear-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold text-xs px-5 py-2 rounded-xl shadow-lg shadow-purple-600/25 gap-2"
            >
              {isLoading ? (
                <RotateCcw className="size-3.5 animate-spin" />
              ) : (
                <Wand2 className="size-3.5" />
              )}
              {isLoading ? "Generating..." : "Generate Code with AI"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Side-by-Side Prompt & Output Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Prompt & Requirements Input */}
        <div className="space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Code2 className="size-3.5 text-purple-400" />
              Describe What You Want to Build
            </Label>
            <Badge
              variant="outline"
              className="text-[10px] border-white/10 text-slate-400 font-mono"
            >
              {prompt.length} chars
            </Badge>
          </div>

          <div className="flex-1 rounded-2xl overflow-hidden shadow-xl border border-purple-500/30 bg-[#0d1527] flex flex-col">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Write a TypeScript function with clean error handling to validate email addresses and detect disposable domains..."
              className="w-full h-125 font-sans text-sm leading-relaxed p-4 bg-transparent text-slate-100 border-0 resize-none focus-visible:ring-0"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right: AI Generated Code & Explanations */}
        <div className="space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-cyan-400" />
              AI Generated Output ({language})
            </Label>
            {generatorResult && (
              <Badge
                variant="outline"
                className="text-[10px] border-emerald-500/30 text-emerald-300 font-mono"
              >
                Generated
              </Badge>
            )}
          </div>

          {isLoading ? (
            <AiLoadingState
              title="Generating Code with AI..."
              subtitle="Writing production-ready code with type safety, documentation & clean patterns"
            />
          ) : generatorResult ? (
            <div className="space-y-4 max-h-130 overflow-y-auto pr-1">
              {/* Generated Code Box */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Code2 className="size-3.5" />
                    Production Code
                  </span>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() =>
                      handleCopyText("generated", generatorResult.generatedCode)
                    }
                    className="h-6 text-xs text-emerald-300 hover:bg-emerald-500/10"
                  >
                    {copiedKey === "generated" ? (
                      <Check className="size-3 mr-1 text-emerald-400" />
                    ) : (
                      <Copy className="size-3 mr-1" />
                    )}
                    {copiedKey === "generated" ? "Copied" : "Copy Code"}
                  </Button>
                </div>
                <CodeEditor
                  value={generatorResult.generatedCode}
                  language={language}
                  height="260px"
                  readOnly
                />
              </div>

              {/* Explanation Card */}
              {generatorResult.explanation && (
                <div className="p-3.5 rounded-2xl bg-black/40 border border-cyan-500/30 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400">
                    <BookOpen className="size-3.5" />
                    <span>How It Works &amp; Architecture</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {generatorResult.explanation}
                  </p>
                </div>
              )}

              {/* Usage Example */}
              {generatorResult.usageExample && (
                <div className="p-3.5 rounded-2xl bg-black/40 border border-purple-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                      <Play className="size-3.5" />
                      Usage Example
                    </span>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() =>
                        handleCopyText("usage", generatorResult.usageExample)
                      }
                      className="h-6 text-xs text-purple-300 hover:bg-purple-500/10"
                    >
                      {copiedKey === "usage" ? (
                        <Check className="size-3 mr-1 text-emerald-400" />
                      ) : (
                        <Copy className="size-3 mr-1" />
                      )}
                      {copiedKey === "usage" ? "Copied" : "Copy Usage"}
                    </Button>
                  </div>
                  <CodeEditor
                    value={generatorResult.usageExample}
                    language={language}
                    height="180px"
                    readOnly
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="h-130 flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-purple-500/20 bg-[#16213e]/30 space-y-3">
              <Wand2 className="size-10 text-cyan-400/60 animate-pulse" />
              <p className="text-sm font-semibold text-slate-200">
                Generated Code Canvas
              </p>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Describe the functionality you want on the left and click{" "}
                <strong>&quot;Generate Code with AI&quot;</strong> to get fully
                typed, documented code and usage examples.
              </p>
            </div>
          )}
        </div>
      </div>



      <Separator className="my-8 bg-[rgba(124,58,237,0.25)]" />

      {/* AdSense Placement */}
      <AdSense
        slot={ADS_CONFIG.slots.betweenIO}
        format="auto"
        className="rounded-xl overflow-hidden mb-4"
      />
    </div>
  );
}
