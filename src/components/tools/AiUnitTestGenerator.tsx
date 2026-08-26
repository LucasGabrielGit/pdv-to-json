"use client";

import React, { useState } from "react";
import {
  FlaskConical,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Key,
  Download,
  FileCode,
  Layers,
  Terminal,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { ToolHeader } from "@/components/converter/ToolHeader";
import { PrivacyBanner } from "@/components/converter/PrivacyBanner";
import CodeEditor from "@/components/CodeEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SAMPLE_CODE = `export function calculateDiscount(price: number, couponCode?: string): number {
  if (price < 0) {
    throw new Error('Price cannot be negative');
  }
  if (!couponCode) return price;

  const code = couponCode.toUpperCase().trim();
  if (code === 'SAVE10') return Number((price * 0.9).toFixed(2));
  if (code === 'VIP50') return Number((price * 0.5).toFixed(2));
  
  return price;
}`;

interface TestResult {
  testCode: string;
  runCommand: string;
  testCases: { name: string; category: string }[];
  mockExplanation: string;
}

export default function AiUnitTestGenerator() {
  const [sourceCode, setSourceCode] = useState(SAMPLE_CODE);
  const [language, setLanguage] = useState<
    "typescript" | "javascript" | "python" | "go"
  >("typescript");
  const [framework, setFramework] = useState("vitest");
  const [coverageFocus, setCoverageFocus] = useState("comprehensive");
  const [customApiKey, setCustomApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!sourceCode.trim()) {
      toast.error("Please enter source code to generate unit tests.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/unit-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: sourceCode.trim(),
          language,
          framework,
          coverageFocus,
          customApiKey: customApiKey.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to generate unit tests.");
      }

      setResult(data.data);
      toast.success("Unit tests generated successfully!");
    } catch (e) {
      toast.error("Generation Error", {
        description: (e as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.testCode) return;
    await navigator.clipboard.writeText(result.testCode);
    setCopied(true);
    toast.success("Copied unit test file to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result?.testCode) return;
    const ext =
      language === "python"
        ? "test_module.py"
        : language === "go"
          ? "main_test.go"
          : "module.test.ts";
    const blob = new Blob([result.testCode], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ext;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${ext}`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <ToolHeader
        title="AI Unit Test Generator"
        description="Generate comprehensive unit test suites with mocks, edge-case assertions, and fixtures in Vitest, Jest, Pytest, or Go."
        badgeText="AI QA & Test Architect"
        toolId="ai-unit-tests"
      />

      <PrivacyBanner />

      {/* Toolbar */}
      <Card className="border border-purple-500/25 bg-[#16213e] shadow-xl">
        <CardContent className="p-4 md:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            {/* Language */}
            <div className="flex items-center gap-2">
              <Label className="text-slate-400">Language:</Label>
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
            </div>

            {/* Framework */}
            <div className="flex items-center gap-2">
              <Label className="text-slate-400">Framework:</Label>
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                className="h-8 px-2.5 rounded-md bg-black/40 border border-purple-500/30 text-slate-200 text-xs font-mono outline-none"
              >
                <option value="vitest">Vitest</option>
                <option value="jest">Jest / RTL</option>
                <option value="pytest">Pytest</option>
                <option value="gotest">Go testing</option>
              </select>
            </div>

            {/* Coverage Focus */}
            <div className="flex items-center gap-2">
              <Label className="text-slate-400">Focus:</Label>
              <select
                value={coverageFocus}
                onChange={(e) => setCoverageFocus(e.target.value)}
                className="h-8 px-2.5 rounded-md bg-black/40 border border-purple-500/30 text-slate-200 text-xs font-mono outline-none"
              >
                <option value="comprehensive">Comprehensive</option>
                <option value="edge-cases">Edge Cases &amp; Errors</option>
                <option value="happy-path">Happy Path</option>
                <option value="integration-mocks">With Mocks</option>
              </select>
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
              onClick={handleGenerate}
              disabled={isLoading}
              className="bg-linear-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold text-xs px-6 h-8 gap-1.5 shadow-md cursor-pointer"
            >
              {isLoading ? (
                <span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FlaskConical className="size-3.5" />
              )}
              {isLoading ? "Generating Tests..." : "Generate Test Suite"}
            </Button>
          </div>
        </CardContent>

        {showApiKeyInput && (
          <div className="p-4 border-t border-purple-500/20 bg-black/40 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex-1 min-w-65 space-y-1">
              <Label
                htmlFor="ai-unit-tests-key"
                className="text-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Key className="size-3 text-purple-400" /> Bring Your Own Key
                (Unlimited Free Usage)
              </Label>
              <Input
                id="ai-unit-tests-key"
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
              <FileCode className="size-3.5 text-purple-400" /> Source Code to
              Test
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
            placeholder="Paste function, class, or component here..."
            height="500px"
          />
        </div>

        {/* Right: Generated Unit Tests */}
        <div className="space-y-2.5 flex flex-col">
          <div className="flex items-center justify-between h-9 min-h-9">
            <Label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <FlaskConical className="size-3.5 text-cyan-400" /> Generated Test
              Suite ({framework})
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

          <CodeEditor
            value={
              result?.testCode ||
              '// Click "Generate Test Suite" to create unit tests...'
            }
            language={language}
            readOnly
            height="500px"
          />
        </div>
      </div>

      {/* Test Cases Checklist */}
      {result && result.testCases.length > 0 && (
        <Card className="border border-purple-500/20 bg-[#0d1527] shadow-xl">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                <Layers className="size-4" /> Covered Test Scenarios (
                {result.testCases.length} Cases)
              </h4>
              <div className="flex items-center gap-2 font-mono text-xs text-cyan-300 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5">
                <Terminal className="size-3" />
                <span>{result.runCommand}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {result.testCases.map((tc, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2 text-xs"
                >
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-200 font-medium">{tc.name}</span>
                  <Badge
                    variant="outline"
                    className="ml-auto text-[9px] border-purple-500/30 text-purple-300"
                  >
                    {tc.category}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
