"use client";

import React, { useState } from "react";
import {
  Wand2,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Key,
  Download,
  FileCode,
  Zap,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { ToolHeader } from "@/components/converter/ToolHeader";
import { PrivacyBanner } from "@/components/converter/PrivacyBanner";
import { AiLoadingState } from "@/components/ai/AiLoadingState";
import { ProGateModal } from "@/components/pro/ProGateModal";
import { ProBadge } from "@/components/pro/ProBadge";
import { useProStatus } from "@/hooks/useProStatus";
import CodeEditor from "@/components/CodeEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";

const SAMPLE_CODE = `function findDuplicates(arr1, arr2) {
  var result = [];
  for (var i = 0; i < arr1.length; i++) {
    for (var j = 0; j < arr2.length; j++) {
      if (arr1[i] == arr2[j]) {
        var found = false;
        for (var k = 0; k < result.length; k++) {
          if (result[k] == arr1[i]) found = true;
        }
        if (!found) result.push(arr1[i]);
      }
    }
  }
  return result;
}`;

interface RefactorResult {
  refactoredCode: string;
  summary: string;
  improvements: { title: string; description: string }[];
  timeComplexity: string;
  spaceComplexity: string;
}

export default function AiCodeRefactor() {
  const [sourceCode, setSourceCode] = useState(SAMPLE_CODE);
  const [language, setLanguage] = useState<
    "typescript" | "javascript" | "python" | "go"
  >("typescript");
  const [goal, setGoal] = useState<
    | "optimize-performance"
    | "convert-to-ts"
    | "modernize-react19"
    | "clean-solid"
  >("optimize-performance");
  const [aiMode, setAiMode] = useState<"turbo" | "deep">("turbo");
  const [customApiKey, setCustomApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RefactorResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRefactor = async () => {
    if (!sourceCode.trim()) {
      toast.error("Please enter source code to refactor.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/code-refactor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: sourceCode.trim(),
          language,
          goal,
          aiMode,
          customApiKey: customApiKey.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to refactor code.");
      }

      setResult(data.data);
      toast.success("Code refactored and optimized!");
    } catch (e) {
      toast.error("Refactoring Error", {
        description: (e as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.refactoredCode) return;
    await navigator.clipboard.writeText(result.refactoredCode);
    setCopied(true);
    toast.success("Copied refactored code!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result?.refactoredCode) return;
    const blob = new Blob([result.refactoredCode], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `refactored-code.${language === "python" ? "py" : language === "go" ? "go" : "ts"}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded refactored file");
  };

  const {
    requirePro,
    isProModalOpen,
    setIsProModalOpen,
    proModalFeature,
    isProOrByok,
  } = useProStatus();

  useKeyboardShortcut({
    onExecute: handleRefactor,
    onCopy: handleCopy,
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <ProGateModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        featureName={proModalFeature}
      />
      <ToolHeader
        title="AI Code Modernizer & Refactoring Engine"
        description="Transform legacy code, optimize performance, modernize into React 19 / TypeScript, and enforce Clean Architecture principles."
        badgeText="AI Code Architect"
        toolId="ai-refactor"
      />

      <PrivacyBanner />

      {/* Toolbar */}
      <Card className="border border-purple-500/25 bg-[#16213e] shadow-xl">
        <CardContent className="p-4 md:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as typeof language)}
              className="h-8 px-2.5 rounded-md bg-black/40 border border-purple-500/30 text-slate-200 text-xs font-mono outline-none"
            >
              <option value="typescript">TypeScript</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="go">Go</option>
            </select>

            <Tabs
              value={goal}
              onValueChange={(v) => setGoal(v as typeof goal)}
            >
              <TabsList className="bg-black/40 border border-white/5 p-1 h-9">
                <TabsTrigger
                  value="modernize-react19"
                  className="text-xs px-2.5 data-[state=active]:bg-purple-600 data-[state=active]:text-white font-medium cursor-pointer"
                >
                  ⚡ React 19
                </TabsTrigger>
                <TabsTrigger
                  value="optimize-performance"
                  className="text-xs px-2.5 data-[state=active]:bg-purple-600 data-[state=active]:text-white font-medium cursor-pointer"
                >
                  🚀 Performance
                </TabsTrigger>
                <TabsTrigger
                  value="convert-to-ts"
                  className="text-xs px-2.5 data-[state=active]:bg-purple-600 data-[state=active]:text-white font-medium cursor-pointer"
                >
                  🔷 TypeScript
                </TabsTrigger>
                <TabsTrigger
                  value="clean-solid"
                  className="text-xs px-2.5 data-[state=active]:bg-purple-600 data-[state=active]:text-white font-medium cursor-pointer"
                >
                  🏛️ Clean Code
                </TabsTrigger>
              </TabsList>
            </Tabs>

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
                  requirePro("Deep Reasoning AI Engine", () =>
                    setAiMode("deep")
                  )
                }
                className={`px-2.5 py-1 rounded-md transition-all font-semibold flex items-center gap-1.5 text-[11px] cursor-pointer ${
                  aiMode === "deep"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Deep chain-of-thought analysis (~3.5s)"
              >
                <Sparkles className="size-3 text-cyan-400" />
                <span>Deep (~3.5s)</span>
                {!isProOrByok && <ProBadge />}
              </button>
            </div>

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

          <div className="flex items-center gap-2 ml-auto">
            <Button
              size="xs"
              variant="outline"
              onClick={() => setSourceCode(SAMPLE_CODE)}
              className="bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20 text-xs"
            >
              <Sparkles className="size-3 mr-1 text-purple-400" /> Sample Code
            </Button>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => setSourceCode("")}
              className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs"
            >
              <RotateCcw className="size-3 mr-1" /> Clear
            </Button>
            <Button
              onClick={handleRefactor}
              disabled={isLoading}
              className="bg-linear-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold text-xs px-6 h-8 gap-1.5 shadow-md cursor-pointer"
            >
              {isLoading ? (
                <span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Wand2 className="size-3.5" />
              )}
              <span>{isLoading ? "Refactoring Code..." : "Refactor & Optimize"}</span>
              <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 rounded bg-black/30 border border-white/20 font-mono text-[9px] text-white/80">
                Ctrl ↵
              </kbd>
            </Button>
          </div>
        </CardContent>

        {showApiKeyInput && (
          <div className="p-4 border-t border-purple-500/20 bg-black/40 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex-1 min-w-65 space-y-1">
              <Label
                htmlFor="ai-refactor-key"
                className="text-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Key className="size-3 text-purple-400" /> Bring Your Own Key
                (Unlimited Free Usage)
              </Label>
              <Input
                id="ai-refactor-key"
                type="password"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="bg-black/60 border-purple-500/30 h-8 font-mono text-xs text-white"
              />
            </div>

            <p className="text-[11px] text-slate-400 max-w-sm leading-relaxed">
              Your key is kept only in client memory and is never logged or
              persisted.
            </p>
          </div>
        )}
      </Card>

      {/* Side-by-Side Editors (500px) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: Input Code */}
        <div className="space-y-2.5 flex flex-col">
          <div className="flex items-center justify-between h-9 min-h-9">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <FileCode className="size-3.5 text-purple-400" /> Original Code
            </Label>
            <Badge
              variant="outline"
              className="text-[10px] border-white/10 text-slate-400 font-mono"
            >
              {sourceCode.length} chars
            </Badge>
          </div>

          <CodeEditor
            value={sourceCode}
            onChange={(v) => setSourceCode(v || "")}
            language={language}
            placeholder="Paste code to optimize or modernize here..."
            height="500px"
          />
        </div>

        {/* Right: Refactored Code */}
        <div className="space-y-2.5 flex flex-col">
          <div className="flex items-center justify-between h-9 min-h-9">
            <Label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-cyan-400" /> Refactored &amp;
              Optimized Code
            </Label>

            {result ? (
              <div className="flex items-center gap-1.5">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={handleCopy}
                  className="h-7 text-xs border-purple-500/30 text-slate-200 hover:text-white"
                >
                  {copied ? (
                    <Check className="size-3 mr-1 text-emerald-400" />
                  ) : (
                    <Copy className="size-3 mr-1" />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <Button
                  size="xs"
                  onClick={handleDownload}
                  className="h-7 text-xs bg-purple-600 hover:bg-purple-500 text-white font-semibold"
                >
                  <Download className="size-3 mr-1" />
                  Download
                </Button>
              </div>
            ) : (
              <Badge
                variant="outline"
                className="text-[10px] border-white/10 text-slate-400 font-mono"
              >
                Output
              </Badge>
            )}
          </div>

          {isLoading ? (
            <AiLoadingState
              title="Refactoring & Modernizing Code..."
              subtitle="Applying AST transformations, Clean Code principles & strict typing"
            />
          ) : (
            <CodeEditor
              value={
                result?.refactoredCode ||
                '// Click "Refactor & Optimize" to view improved code...'
              }
              language={language}
              readOnly
              height="500px"
            />
          )}
        </div>
      </div>

      {/* Improvements Metric Cards */}
      {result && (
        <Card className="border border-purple-500/20 bg-[#0d1527] shadow-xl">
          <CardContent className="p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                <Zap className="size-4 text-purple-400" /> Summary of
                Optimizations &amp; Architectural Changes
              </h4>
              <div className="flex items-center gap-3 text-xs font-mono">
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                  Time: {result.timeComplexity}
                </Badge>
                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                  Space: {result.spaceComplexity}
                </Badge>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {result.summary}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5">
              {result.improvements.map((imp, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1"
                >
                  <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <TrendingUp className="size-3.5 text-cyan-400" />{" "}
                    {imp.title}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {imp.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
