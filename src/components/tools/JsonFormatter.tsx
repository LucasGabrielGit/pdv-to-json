"use client";

import React, { useState, useRef } from "react";
import { toast } from "sonner";
import {
  FileJson,
  Copy,
  Download,
  Trash2,
  Check,
  Settings2,
  CheckCircle2,
  AlertTriangle,
  Wand2,
  Minimize2,
  Maximize2,
} from "lucide-react";
import AdSense from "@/components/AdSense";
import { ADS_CONFIG } from "@/config/ads";
import FileDropZone from "@/components/FileDropZone";
import CodeEditor from "@/components/CodeEditor";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import {
  formatJson,
  repairJsonSyntax,
  formatBytes,
  type JsonFormattingResult,
} from "@/utils/jsonFormatter";
import { ToolHeader } from "@/components/converter/ToolHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PrivacyBanner } from "@/components/converter/PrivacyBanner";

type ActionMode = "format" | "minify";
type InputMode = "text" | "file";

const SAMPLE_CLEAN_JSON = `{
  "app": "dev-kit.tech",
  "version": "1.0.0",
  "privacy": {
    "clientSideOnly": true,
    "serverUploads": false
  },
  "features": ["json-csv", "json-yaml", "base64", "image-converter"],
  "stats": {
    "totalTools": 5,
    "activeUsers": 1250
  }
}`;

const SAMPLE_INVALID_JSON = `{
  "name": "devkit",
  "active": true,
  "tools": ["json", "yaml", "base64",],
  "author": 'Lucas',
}`;

export default function JsonFormatter() {
  const [actionMode, setActionMode] = useState<ActionMode>("format");
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [inputText, setInputText] = useState("");
  const [indentSpaces, setIndentSpaces] = useState<number | "\t">(2);
  const [fixTrailingCommas, setFixTrailingCommas] = useState(false);
  const [liveMode, setLiveMode] = useState(true);
  const [result, setResult] = useState<JsonFormattingResult | null>(null);
  const [copied, setCopied] = useState(false);

  const isFormat = actionMode === "format";

  const outputRef = useRef<HTMLDivElement>(null);

  const processJson = (
    text: string,
    mode: ActionMode = actionMode,
    indent: number | "\t" = indentSpaces,
    autoFix: boolean = fixTrailingCommas,
  ) => {
    if (!text.trim()) {
      setResult(null);
      return;
    }

    const res = formatJson(text, {
      indent,
      minify: mode === "minify",
      fixTrailingCommas: autoFix,
    });

    setResult(res);
  };

  const handleInputChange = (val: string) => {
    setInputText(val);
    if (liveMode) {
      processJson(val);
    }
  };

  const handleActionModeChange = (newMode: ActionMode) => {
    setActionMode(newMode);
    if (inputText) {
      processJson(inputText, newMode);
    }
  };

  const handleModeToggle = handleActionModeChange;

  const handleRunAction = () => {
    if (!inputText.trim()) {
      toast.error("Input is empty", {
        description: "Please paste or upload JSON content.",
      });
      return;
    }
    processJson(inputText);
    if (result?.isValid) {
      toast.success(
        `JSON ${actionMode === "minify" ? "minified" : "formatted"} successfully!`,
      );
      setTimeout(() => {
        outputRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } else {
      toast.error("JSON has syntax errors", {
        description: result?.error?.message,
      });
    }
  };

  const handleAutoRepair = () => {
    const repaired = repairJsonSyntax(inputText);
    setInputText(repaired);
    processJson(repaired, actionMode, indentSpaces, false);
    toast.success("Auto-repaired trailing commas and quotes!");
  };

  const handleFileContent = (content: string, filename: string) => {
    setInputText(content);
    setInputMode("text");
    processJson(content, actionMode);
    toast.success(`Uploaded ${filename}`);
  };

  const handleLoadSample = (sampleType: "valid" | "invalid") => {
    const sample =
      sampleType === "valid" ? SAMPLE_CLEAN_JSON : SAMPLE_INVALID_JSON;
    setInputText(sample);
    processJson(sample);
    toast.success(
      `Loaded ${sampleType === "valid" ? "Clean" : "Invalid"} sample`,
    );
  };

  const handleCopy = async () => {
    if (!result?.output) return;
    await navigator.clipboard.writeText(result.output);
    setCopied(true);
    toast.success("Copied output to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result?.output) return;
    const blob = new Blob([result.output], {
      type: "application/json;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      actionMode === "minify" ? "formatted.min.json" : "formatted.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded formatted JSON!");
  };

  const handleClear = () => {
    setInputText("");
    setResult(null);
    toast.info("Cleared");
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* ── Header ── */}
      <ToolHeader
        title="JSON Formatter, Validator & Minifier"
        description="Format, prettify, repair syntax errors, and compress JSON data instantly in your browser with real-time linting."
        badgeText="100% Client-Side"
      />

      {/* ── Privacy Banner ── */}
      <PrivacyBanner />

      {/* ── Action Mode Toggle & Controls Bar ── */}
      <Card className="rounded-3xl shadow-xl border border-purple-500/25 bg-[#16213e] mb-6">
        <CardContent className="p-4 md:p-5 flex flex-wrap items-center justify-between gap-4">
          {/* Format / Minify Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={isFormat ? "default" : "outline"}
              size="sm"
              onClick={() => handleModeToggle("format")}
              className={`gap-1.5 text-xs font-semibold transition-all ${
                isFormat
                  ? "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/25"
                  : "border-purple-500/30 text-slate-300 hover:text-white"
              }`}
            >
              <Maximize2 className="size-3.5" />
              Prettify &amp; Format
            </Button>

            <Button
              variant={!isFormat ? "default" : "outline"}
              size="sm"
              onClick={() => handleModeToggle("minify")}
              className={`gap-1.5 text-xs font-semibold transition-all ${
                !isFormat
                  ? "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/25"
                  : "border-purple-500/30 text-slate-300 hover:text-white"
              }`}
            >
              <Minimize2 className="size-3.5" />
              Minify (Compress)
            </Button>
          </div>

          {/* Options */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
            {isFormat && (
              <div className="flex items-center gap-1.5">
                <Settings2 className="size-3.5 text-purple-400" />
                <span className="text-slate-400">Indent:</span>
                <Select
                  value={String(indentSpaces)}
                  onValueChange={(val) => {
                    const newIndent = val === "tab" ? "\t" : Number(val);
                    setIndentSpaces(newIndent);
                    if (liveMode && inputText)
                      processJson(inputText, actionMode, newIndent);
                  }}
                >
                  <SelectTrigger className="w-20 h-7 text-xs bg-black/40 border-purple-500/30 text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#16213e] border-purple-500/30 text-white text-xs">
                    <SelectItem value="2">2 spaces</SelectItem>
                    <SelectItem value="4">4 spaces</SelectItem>
                    <SelectItem value="tab">Tab</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer hover:text-slate-200 transition-colors">
              <input
                type="checkbox"
                checked={fixTrailingCommas}
                onChange={(e) => {
                  setFixTrailingCommas(e.target.checked);
                  if (liveMode && inputText)
                    processJson(
                      inputText,
                      actionMode,
                      indentSpaces,
                      e.target.checked,
                    );
                }}
                className="rounded border-purple-500/30 bg-black/40 text-purple-600 focus:ring-purple-500 size-3.5"
              />
              <span>Auto-fix syntax</span>
            </label>

            <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer hover:text-slate-200 transition-colors">
              <input
                type="checkbox"
                checked={liveMode}
                onChange={(e) => setLiveMode(e.target.checked)}
                className="rounded border-purple-500/30 bg-black/40 text-purple-600 focus:ring-purple-500 size-3.5"
              />
              <span>Live validation</span>
            </label>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 ml-auto">
            <Button
              size="xs"
              variant="outline"
              onClick={() => handleLoadSample("valid")}
              className="bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20 text-xs"
            >
              Clean Sample
            </Button>

            <Button
              variant="ghost"
              size="xs"
              onClick={handleClear}
              disabled={!inputText && !result}
              className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs"
            >
              <Trash2 className="size-3 mr-1" /> Clear
            </Button>

            {!liveMode && (
              <Button
                size="sm"
                onClick={handleRunAction}
                className="bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs px-4"
              >
                Execute
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Validation Status Indicator */}
      {result && inputText.trim() && (
        <div className="mb-6">
          {result.isValid ? (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 text-emerald-400 text-xs font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span>Valid JSON Syntax</span>
              </div>

              <div className="flex items-center gap-3 text-slate-300 font-mono">
                <span>{result.keyCount} Keys</span>
                <span>·</span>
                <span>Depth: {result.maxDepth}</span>
                <span>·</span>
                <span>{formatBytes(result.byteSize)}</span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 text-rose-300 text-xs">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="size-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-rose-400">Syntax Error</p>
                  <p className="text-rose-300/90 mt-0.5">
                    {result.error?.message}
                  </p>
                  {result.error?.line && (
                    <p className="text-slate-400 font-mono mt-1 text-[11px]">
                      Location: Line {result.error.line}
                      {result.error.column && `, Column ${result.error.column}`}
                    </p>
                  )}
                </div>
              </div>

              <Button
                size="xs"
                onClick={handleAutoRepair}
                className="gap-1.5 bg-rose-600 hover:bg-rose-500 text-white shrink-0 font-medium self-end md:self-auto"
              >
                <Wand2 className="size-3.5" />
                Auto-Fix Trailing Commas &amp; Quotes
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── Side-by-Side Input & Output Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Editor */}
        <div className="space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <FileJson className="size-3.5 text-purple-400" />
                Raw JSON Input
              </Label>
              <Badge
                variant="outline"
                className="text-[10px] border-white/10 text-slate-400 font-mono"
              >
                {inputText.length} chars
              </Badge>
            </div>

            <div className="flex items-center gap-1">
              <Button
                size="xs"
                variant={inputMode === "text" ? "secondary" : "ghost"}
                onClick={() => setInputMode("text")}
                className="text-[11px] h-6 px-2"
              >
                Editor
              </Button>
              <Button
                size="xs"
                variant={inputMode === "file" ? "secondary" : "ghost"}
                onClick={() => setInputMode("file")}
                className="text-[11px] h-6 px-2"
              >
                Upload File
              </Button>
            </div>
          </div>

          {inputMode === "text" ? (
            <CodeEditor
              value={inputText}
              onChange={(val) => handleInputChange(val || "")}
              language="json"
              placeholder={
                '{\n  "name": "dev-kit",\n  "version": "1.0.0",\n  "active": true\n}'
              }
              height="500px"
            />
          ) : (
            <div className="h-125 rounded-2xl border border-purple-500/30 bg-black/40 p-4 flex flex-col justify-center">
              <FileDropZone
                fileType="json"
                readAsDataURL={false}
                onFileContent={handleFileContent}
              />
            </div>
          )}
        </div>

        {/* Right: Output Result */}
        <div className="space-y-3 flex flex-col" ref={outputRef}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Check className="size-3.5 text-emerald-400" />
                {isFormat ? "Formatted JSON Output" : "Minified Output"}
              </Label>
              {result?.isValid && (
                <Badge
                  variant="outline"
                  className="text-[10px] border-emerald-500/30 text-emerald-300 font-mono"
                >
                  {result.lineCount} lines • {result.charCount.toLocaleString()}{" "}
                  chars
                </Badge>
              )}
            </div>

            {result?.isValid && result.output && (
              <div className="flex items-center gap-1.5">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={handleCopy}
                  className="h-6 text-xs border-purple-500/30 text-slate-200 hover:text-white"
                >
                  {copied ? (
                    <Check className="size-3 mr-1 text-emerald-400" />
                  ) : (
                    <Copy className="size-3 mr-1" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button
                  size="xs"
                  onClick={handleDownload}
                  className="h-6 text-xs bg-purple-600 hover:bg-purple-500 text-white font-semibold"
                >
                  <Download className="size-3 mr-1" />
                  Download
                </Button>
              </div>
            )}
          </div>

          <CodeEditor
            value={result?.output ?? ""}
            language="json"
            readOnly
            height="500px"
          />
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <AdSense slot={ADS_CONFIG.slots.betweenIO} format="horizontal" />
      </div>
    </div>
  );
}
