"use client";

import React, { useState, useMemo } from "react";
import {
  Regex,
  Sparkles,
  Search,
  Copy,
  Check,
  Key,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { ToolHeader } from "@/components/converter/ToolHeader";
import { PrivacyBanner } from "@/components/converter/PrivacyBanner";
import { AiLoadingState } from "@/components/ai/AiLoadingState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";

interface RegexResult {
  pattern: string;
  flags: string;
  explanation: string;
  tokens: { token: string; description: string }[];
  validExamples: string[];
  invalidExamples: string[];
  jsSnippet: string;
  pythonSnippet: string;
  reDosRisk: string;
}

const SAMPLE_PROMPT =
  "Validar CPF brasileiro com ou sem pontuação (ex: 123.456.789-00 ou 12345678900)";
const SAMPLE_REGEX =
  "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";

export default function AiRegexTool() {
  const [activeTab, setActiveTab] = useState<"generate" | "explain">(
    "generate",
  );
  const [prompt, setPrompt] = useState(SAMPLE_PROMPT);
  const [regexInput, setRegexInput] = useState(SAMPLE_REGEX);
  const [flags, setFlags] = useState("gm");
  const [language, setLanguage] = useState<"en" | "pt">("en");
  const [customApiKey, setCustomApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RegexResult | null>(null);
  const [testString, setTestString] = useState(
    "123.456.789-00\n99999999999\ninvalid-cpf",
  );
  const [copied, setCopied] = useState<string | null>(null);

  const handleAction = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/regex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: activeTab,
          prompt: prompt.trim(),
          regex: regexInput.trim(),
          flags,
          language,
          customApiKey: customApiKey.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to process regex.");
      }

      setResult(data.data);
      toast.success(
        activeTab === "generate"
          ? "Regex generated successfully!"
          : "Regex explained successfully!",
      );
    } catch (e) {
      toast.error("AI Error", {
        description: (e as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Live test string matching
  const testMatches = useMemo(() => {
    const pattern = result
      ? result.pattern
      : activeTab === "explain"
        ? regexInput
        : "";
    const activeFlags = result ? result.flags : flags;
    if (!pattern || !testString) return [];

    try {
      const re = new RegExp(pattern, activeFlags);
      const matches: string[] = [];
      const lines = testString.split("\n");
      lines.forEach((line) => {
        if (re.test(line)) {
          matches.push(line);
        }
      });
      return matches;
    } catch {
      return [];
    }
  }, [result, regexInput, flags, testString, activeTab]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopied(null), 2000);
  };

  useKeyboardShortcut({
    onExecute: handleAction,
    onCopy: () => {
      if (result) handleCopy(`/${result.pattern}/${result.flags}`, "Regex");
    },
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <ToolHeader
        title="AI Regex Explainer & Builder"
        description="Generate, explain token-by-token, optimize, and test regular expressions in real-time with comprehensive AI analysis."
        badgeText="AI Regular Expression Engineer"
        toolId="ai-regex"
      />

      <PrivacyBanner />

      {/* Toolbar Mode Selector */}
      <Card className="border border-purple-500/25 bg-[#16213e] shadow-xl">
        <CardContent className="p-4 md:p-5 flex flex-wrap items-center justify-between gap-4">
          <Tabs
            value={activeTab}
            onValueChange={(v) => {
              setActiveTab(v as typeof activeTab);
              setResult(null);
            }}
          >
            <TabsList className="bg-black/40 border border-white/5 p-1 h-9">
              <TabsTrigger
                value="generate"
                className="text-xs px-3 gap-1.5 data-[state=active]:bg-purple-600 data-[state=active]:text-white font-semibold cursor-pointer"
              >
                <Sparkles className="size-3.5" /> Prompt ➔ Regex
              </TabsTrigger>
              <TabsTrigger
                value="explain"
                className="text-xs px-3 gap-1.5 data-[state=active]:bg-purple-600 data-[state=active]:text-white font-semibold cursor-pointer"
              >
                <Search className="size-3.5" /> Explain Existing Regex
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as "en" | "pt")}
              className="h-8 px-2.5 rounded-md bg-black/40 border border-purple-500/30 text-slate-200 text-xs font-mono outline-none"
            >
              <option value="en">English</option>
              <option value="pt">Português</option>
            </select>

            <Button
              size="xs"
              variant="outline"
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              className="h-8 text-xs border-purple-500/30 text-purple-300 hover:bg-purple-500/10 gap-1.5"
            >
              <Key className="size-3" />
              {customApiKey ? "Custom Key Set" : "BYOK Key (Optional)"}
            </Button>
          </div>
        </CardContent>

        {showApiKeyInput && (
          <div className="p-4 border-t border-purple-500/20 bg-black/40 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex-1 min-w-65 space-y-1">
              <Label
                htmlFor="ai-regex-key"
                className="text-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Key className="size-3 text-purple-400" /> Bring Your Own Key
                (Unlimited Free Usage)
              </Label>
              <Input
                id="ai-regex-key"
                type="password"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                placeholder="Paste your Gemini API key (AI Studio)..."
                className="bg-black/60 border-purple-500/30 text-xs font-mono text-white"
              />
            </div>

            <p className="text-[11px] text-slate-400 max-w-sm leading-relaxed">
              Your key is kept only in client memory and is never logged or
              persisted.
            </p>
          </div>
        )}
      </Card>

      {/* Input / Execution Card */}
      <Card className="border border-purple-500/30 bg-[#0d1527] shadow-xl">
        <CardContent className="p-5 space-y-4">
          {activeTab === "generate" ? (
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span>Describe the pattern you want to match</span>
                <span className="text-purple-400 font-normal text-[11px]">
                  Natural Language
                </span>
              </Label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Match international phone numbers with optional + country code..."
                className="w-full h-20 p-3 rounded-xl bg-black/50 border font-sans text-xs text-slate-200 focus:outline-none focus:border-purple-400/80 resize-none leading-relaxed"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span>Paste Regex Pattern to Analyze</span>
                <span className="text-cyan-400 font-normal text-[11px]">
                  Pattern Breakdown
                </span>
              </Label>
              <Input
                value={regexInput}
                onChange={(e) => setRegexInput(e.target.value)}
                placeholder="e.g. ^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
                className="bg-black/50 border border-purple-500/30 text-xs font-mono text-cyan-300 h-10"
              />
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs">
              <Label className="text-slate-400">Regex Flags:</Label>
              <Input
                value={flags}
                onChange={(e) =>
                  setFlags(e.target.value.replace(/[^gimsuy]/g, ""))
                }
                placeholder="gm"
                className="h-8 w-20 bg-black/40 border-purple-500/30 text-xs font-mono text-cyan-300"
              />
              <span className="text-[11px] text-slate-500 font-mono">
                g (global), m (multiline), i (ignoreCase)
              </span>
            </div>

            <Button
              onClick={handleAction}
              disabled={isLoading}
              className="bg-linear-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold text-xs px-6 h-9 gap-1.5 shadow-md cursor-pointer"
            >
              {isLoading ? (
                <span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Sparkles className="size-3.5" />
              )}
              <span>
                {isLoading
                  ? "Processing with AI..."
                  : activeTab === "generate"
                    ? "Generate Regex Pattern"
                    : "Explain & Breakdown Regex"}
              </span>
              <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 rounded bg-black/30 border border-white/20 font-mono text-[9px] text-white/80">
                Ctrl ↵
              </kbd>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <AiLoadingState
          title="Analyzing & Building Regex Pattern..."
          subtitle="Compiling token patterns, boundary conditions & ReDoS security checks"
        />
      )}

      {/* Results Section */}
      {result && !isLoading && (
        <div className="space-y-6">
          {/* Main Pattern Output Card */}
          <div className="p-5 rounded-2xl border border-purple-500/30 bg-[#0d1527] shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                <Regex className="size-4 text-purple-400" /> Generated Regular
                Expression
              </span>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-[10px] border-cyan-500/30 text-cyan-300 font-mono"
                >
                  Flags: /{result.flags}/
                </Badge>
                <Button
                  size="xs"
                  onClick={() =>
                    handleCopy(`/${result.pattern}/${result.flags}`, "Regex")
                  }
                  className="h-6 text-xs bg-purple-600 hover:bg-purple-500 text-white gap-1"
                >
                  {copied === "Regex" ? (
                    <Check className="size-3" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                  {copied === "Regex" ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-black/60 font-mono text-sm text-cyan-300 break-all select-all border border-purple-500/20 font-bold">
              /{result.pattern}/{result.flags}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              {result.explanation}
            </p>
          </div>

          {/* Token Breakdown Table & Security Audit */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="border border-purple-500/20 bg-[#0d1527] shadow-xl h-full">
                <CardContent className="p-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                    <Layers className="size-4" /> Token-by-Token Breakdown
                  </h4>
                  <div className="overflow-x-auto max-h-75 overflow-y-auto">
                    <table className="w-full text-xs font-mono text-left border-collapse">
                      <thead>
                        <tr className="border-b border-purple-500/20 text-slate-400 text-[10px] uppercase">
                          <th className="py-2 px-3">Token</th>
                          <th className="py-2 px-3 font-sans">
                            Meaning / Function
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {result.tokens.map((t, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-white/5 transition-colors"
                          >
                            <td className="py-2 px-3 text-cyan-300 font-bold">
                              {t.token}
                            </td>
                            <td className="py-2 px-3 text-slate-200 font-sans">
                              {t.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ReDoS & Validation Examples */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-emerald-500/30 bg-[#0d1527] shadow-xl space-y-2">
                <div className="flex items-center justify-between text-xs text-emerald-400 font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5" /> ReDoS Security Audit
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono">
                  {result.reDosRisk ||
                    "Low / Safe (No catastrophic backtracking)"}
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-purple-500/30 bg-[#0d1527] shadow-xl space-y-2">
                <div className="text-xs text-purple-300 font-bold uppercase tracking-wider">
                  Sample Valid Matches
                </div>
                <div className="space-y-1">
                  {result.validExamples.map((ex, idx) => (
                    <div
                      key={idx}
                      className="p-1.5 rounded-lg bg-black/40 font-mono text-xs text-emerald-300 border border-emerald-500/20"
                    >
                      ✓ {ex}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Live Matcher Playground */}
          <Card className="border border-cyan-500/30 bg-[#0d1527] shadow-xl">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                  <Search className="size-4" /> Live Test Bench &amp; Matching
                  Simulator
                </Label>
                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 font-mono text-xs">
                  {testMatches.length} Matches Found
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-400">
                    Test Input (1 per line)
                  </Label>
                  <textarea
                    value={testString}
                    onChange={(e) => setTestString(e.target.value)}
                    className="w-full h-32 p-3 rounded-xl bg-black/50 border font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-400 resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-400">
                    Matched Lines
                  </Label>
                  <div className="w-full h-32 p-3 rounded-xl bg-black/50 border border-white/10 font-mono text-xs overflow-y-auto space-y-1">
                    {testMatches.length === 0 ? (
                      <div className="text-slate-500 italic text-xs">
                        No lines matched the pattern.
                      </div>
                    ) : (
                      testMatches.map((m, idx) => (
                        <div
                          key={idx}
                          className="p-1 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-500/20 select-all"
                        >
                          ✓ {m}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
