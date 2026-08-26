"use client";

import React, { useState } from "react";
import {
  GitCommit,
  GitPullRequest,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Key,
  FileCode,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SAMPLE_DIFF = `diff --git a/src/auth/session.ts b/src/auth/session.ts
index 83a12bc..94b23cd 100644
--- a/src/auth/session.ts
+++ b/src/auth/session.ts
@@ -12,6 +12,12 @@ export async function verifySession(token: string) {
+  if (!token || token.trim() === '') {
+    throw new AuthError('Missing session token', 401);
+  }
+  const session = await decodeAndVerifyJwt(token);
+  await logAuditTrail({ userId: session.sub, action: 'SESSION_VERIFIED' });
+  return session;
 }`;

interface CommitResult {
  commitTitle: string;
  gitmojiTitle: string;
  commitBody: string;
  fullCommitMessage: string;
  prTitle: string;
  prDescription: string;
  breakingChanges?: string;
}

export default function GitCommitGenerator() {
  const [diffInput, setDiffInput] = useState(SAMPLE_DIFF);
  const [scope, setScope] = useState("auth");
  const [outputLanguage, setOutputLanguage] = useState<"en" | "pt">("en");
  const [customApiKey, setCustomApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CommitResult | null>(null);
  const [activeOutputTab, setActiveOutputTab] = useState<
    "conventional" | "gitmoji" | "pr"
  >("conventional");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!diffInput.trim()) {
      toast.error("Diff input is empty", {
        description:
          "Please paste your git diff, staged changes, or bullet points.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/git-commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diff: diffInput,
          scope: scope.trim(),
          language: outputLanguage,
          customApiKey: customApiKey.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to generate commit message.");
      }

      setResult(data.data);
      toast.success("Commit & PR message generated!");
    } catch (e) {
      toast.error("Generation failed", {
        description: (e as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`Copied ${field} to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <ToolHeader
        title="AI Git Commit & PR Generator"
        description="Generate Conventional Commits messages, Gitmojis, and full Pull Request templates from your git diffs in seconds."
        badgeText="AI-Powered Git Assistant"
        toolId="git-commit"
      />

      <PrivacyBanner />

      {/* Configuration Bar */}
      <Card className="border border-purple-500/25 bg-[#16213e] shadow-xl">
        <CardContent className="p-4 md:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            {/* Scope Input */}
            <div className="flex items-center gap-2">
              <Label className="text-slate-400">Optional Scope:</Label>
              <Input
                value={scope}
                onChange={(e) =>
                  setScope(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))
                }
                placeholder="auth, api, ui"
                className="h-8 w-28 bg-black/40 border-purple-500/30 text-xs font-mono text-white"
              />
            </div>

            {/* Language */}
            <div className="flex items-center gap-2">
              <Label className="text-slate-400">Language:</Label>
              <select
                value={outputLanguage}
                onChange={(e) =>
                  setOutputLanguage(e.target.value as "en" | "pt")
                }
                className="h-8 px-2 rounded-md bg-black/40 border border-purple-500/30 text-slate-200 text-xs font-mono outline-none"
              >
                <option value="en">English (Conventional)</option>
                <option value="pt">Português (Brasil)</option>
              </select>
            </div>

            {/* Custom API Key Button */}
            <Button
              size="xs"
              variant="outline"
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              className="h-8 text-xs border-purple-500/30 text-purple-300 hover:bg-purple-500/10 gap-1.5"
            >
              <Key className="size-3" />
              {customApiKey ? "Custom Key Set" : "Custom Gemini Key (Optional)"}
            </Button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button
              size="xs"
              variant="outline"
              onClick={() => setDiffInput(SAMPLE_DIFF)}
              className="bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20 text-xs"
            >
              <Sparkles className="size-3 mr-1 text-purple-400" /> Sample Diff
            </Button>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => setDiffInput("")}
              className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs"
            >
              <RotateCcw className="size-3 mr-1" /> Clear
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              className="bg-linear-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold text-xs px-5 h-8 gap-1.5 shadow-md"
            >
              {isLoading ? (
                <span className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <GitCommit className="size-3.5" />
              )}
              {isLoading ? "Analyzing Diff..." : "Generate Commit & PR"}
            </Button>
          </div>
        </CardContent>

        {/* Custom API Key drawer */}
        {showApiKeyInput && (
          <div className="p-4 border-t border-purple-500/20 bg-black/40 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex-1 min-w-65 space-y-1">
              <Label
                htmlFor="git-commit-key"
                className="text-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Key className="size-3 text-purple-400" /> Bring Your Own Key
                (Unlimited Free Usage)
              </Label>
              <Input
                id="git-commit-key"
                type="password"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="bg-black/60 border-purple-500/30 h-8 font-mono text-xs text-white"
              />
            </div>

            <p className="text-[11px] text-slate-400 max-w-sm leading-relaxed">
              Your key stays locally in your browser memory and is never stored
              on our database.
            </p>
          </div>
        )}
      </Card>

      {/* Side-by-Side Editor & Output Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Diff Input */}
        <div className="space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <FileCode className="size-3.5 text-purple-400" /> Git Diff /
              Changes Input
            </Label>
            <Badge
              variant="outline"
              className="text-[10px] border-white/10 text-slate-400 font-mono"
            >
              {diffInput.length} chars
            </Badge>
          </div>

          <CodeEditor
            value={diffInput}
            onChange={(v) => setDiffInput(v || "")}
            language="diff"
            placeholder="Paste output of `git diff`, `git status`, or list of changes here..."
            height="500px"
          />
        </div>

        {/* Right: Generated Commit & PR Templates */}
        <div className="space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <GitPullRequest className="size-3.5 text-cyan-400" /> Generated
              Output
            </Label>

            {result && (
              <Tabs
                value={activeOutputTab}
                onValueChange={(v) =>
                  setActiveOutputTab(v as typeof activeOutputTab)
                }
              >
                <TabsList className="bg-black/40 border border-white/5 p-0.5 h-7">
                  <TabsTrigger
                    value="conventional"
                    className="text-[10px] px-2.5 h-6 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                  >
                    Conventional
                  </TabsTrigger>
                  <TabsTrigger
                    value="gitmoji"
                    className="text-[10px] px-2.5 h-6 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                  >
                    Gitmoji
                  </TabsTrigger>
                  <TabsTrigger
                    value="pr"
                    className="text-[10px] px-2.5 h-6 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                  >
                    PR Template
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>

          {result ? (
            <div className="space-y-4 max-h-125 overflow-y-auto pr-1">
              {activeOutputTab === "conventional" && (
                <div className="space-y-3">
                  {/* Single Line Commit Title */}
                  <div className="p-4 rounded-2xl border border-purple-500/30 bg-[#0d1527] shadow-xl space-y-2">
                    <div className="flex items-center justify-between text-xs text-purple-300 font-bold uppercase tracking-wider">
                      <span>Commit Title (One-Liner)</span>
                      <Button
                        size="xs"
                        onClick={() =>
                          handleCopy(result.commitTitle, "Commit Title")
                        }
                        className="h-6 text-xs bg-purple-600 hover:bg-purple-500 text-white gap-1"
                      >
                        {copiedField === "Commit Title" ? (
                          <Check className="size-3" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                        {copiedField === "Commit Title" ? "Copied" : "Copy"}
                      </Button>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/50 font-mono text-xs text-emerald-300 select-all border border-emerald-500/20">
                      git commit -m &quot;{result.commitTitle}&quot;
                    </div>
                  </div>

                  {/* Full Multi-line Commit Message */}
                  <div className="p-4 rounded-2xl border border-purple-500/30 bg-[#0d1527] shadow-xl space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-300 font-bold uppercase tracking-wider">
                      <span>Full Commit Message (Title + Body)</span>
                      <Button
                        size="xs"
                        onClick={() =>
                          handleCopy(
                            result.fullCommitMessage,
                            "Full Commit Message",
                          )
                        }
                        className="h-6 text-xs border-purple-500/30 text-purple-300 hover:bg-purple-500/10 gap-1"
                      >
                        {copiedField === "Full Commit Message" ? (
                          <Check className="size-3" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                        {copiedField === "Full Commit Message"
                          ? "Copied"
                          : "Copy Full"}
                      </Button>
                    </div>
                    <pre className="p-3 rounded-xl bg-black/50 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed border border-white/5 select-all">
                      {result.fullCommitMessage}
                    </pre>
                  </div>
                </div>
              )}

              {activeOutputTab === "gitmoji" && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl border border-purple-500/30 bg-[#0d1527] shadow-xl space-y-2">
                    <div className="flex items-center justify-between text-xs text-purple-300 font-bold uppercase tracking-wider">
                      <span>Gitmoji Commit</span>
                      <Button
                        size="xs"
                        onClick={() =>
                          handleCopy(result.gitmojiTitle, "Gitmoji Commit")
                        }
                        className="h-6 text-xs bg-purple-600 hover:bg-purple-500 text-white gap-1"
                      >
                        {copiedField === "Gitmoji Commit" ? (
                          <Check className="size-3" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                        {copiedField === "Gitmoji Commit" ? "Copied" : "Copy"}
                      </Button>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/50 font-mono text-xs text-emerald-300 select-all border border-emerald-500/20">
                      git commit -m &quot;{result.gitmojiTitle}&quot;
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-purple-500/30 bg-[#0d1527] shadow-xl space-y-2">
                    <div className="text-xs text-slate-300 font-bold uppercase tracking-wider">
                      <span>Bullet Points</span>
                    </div>
                    <pre className="p-3 rounded-xl bg-black/50 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed border border-white/5 select-all">
                      {result.commitBody}
                    </pre>
                  </div>
                </div>
              )}

              {activeOutputTab === "pr" && (
                <div className="space-y-3">
                  {/* PR Title */}
                  <div className="p-4 rounded-2xl border border-cyan-500/30 bg-[#0d1527] shadow-xl space-y-2">
                    <div className="flex items-center justify-between text-xs text-cyan-300 font-bold uppercase tracking-wider">
                      <span>Pull Request Title</span>
                      <Button
                        size="xs"
                        onClick={() => handleCopy(result.prTitle, "PR Title")}
                        className="h-6 text-xs bg-cyan-600 hover:bg-cyan-500 text-white gap-1"
                      >
                        {copiedField === "PR Title" ? (
                          <Check className="size-3" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                        {copiedField === "PR Title" ? "Copied" : "Copy"}
                      </Button>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/50 font-mono text-xs text-cyan-300 select-all border border-cyan-500/20">
                      {result.prTitle}
                    </div>
                  </div>

                  {/* PR Markdown Body */}
                  <div className="p-4 rounded-2xl border border-purple-500/30 bg-[#0d1527] shadow-xl space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-300 font-bold uppercase tracking-wider">
                      <span>Pull Request Description (Markdown)</span>
                      <Button
                        size="xs"
                        onClick={() =>
                          handleCopy(result.prDescription, "PR Description")
                        }
                        className="h-6 text-xs bg-purple-600 hover:bg-purple-500 text-white gap-1"
                      >
                        {copiedField === "PR Description" ? (
                          <Check className="size-3" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                        {copiedField === "PR Description"
                          ? "Copied"
                          : "Copy Markdown"}
                      </Button>
                    </div>
                    <pre className="p-3 rounded-xl bg-black/50 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed border border-white/5 select-all">
                      {result.prDescription}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-purple-500/30 bg-[#0d1527] p-8 h-125 flex flex-col items-center justify-center text-center space-y-3 text-slate-400">
              <div className="size-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <GitCommit className="size-6" />
              </div>
              <h4 className="font-semibold text-slate-200 text-sm">
                No Commit Generated Yet
              </h4>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Paste your git diff or change notes on the left and click{" "}
                <strong>&quot;Generate Commit &amp; PR&quot;</strong>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
