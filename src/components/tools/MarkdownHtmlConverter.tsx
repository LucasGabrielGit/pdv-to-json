"use client";

import {
  ArrowLeftRight,
  Check,
  Code2,
  Copy,
  Download,
  Eye,
  FileCode,
  FileText,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import AdSense from "@/components/AdSense";
import { ADS_CONFIG } from "@/config/ads";

import FileDropZone from "@/components/FileDropZone";
import { ToolHeader } from "@/components/converter/ToolHeader";
import {
  htmlToMarkdown,
  markdownToHtml,
  type MarkdownConversionResult,
} from "@/utils/markdownConverter";

import { PrivacyBanner } from "@/components/converter/PrivacyBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import CodeEditor from "@/components/CodeEditor";

type Direction = "md-to-html" | "html-to-md";
type InputMode = "text" | "file";

const SAMPLE_MARKDOWN = `# ⚡ dev-kit.tech

Welcome to **dev-kit.tech** — the 100% private developer tools platform.

## Features
- 🔄 **JSON ↔ CSV**: Fast nested object flattening
- 📜 **JSON ↔ YAML**: Clean configuration converter
- 🔑 **Base64**: Live encoding & decoding

### Code Example
\`\`\`typescript
const greeting = "Hello dev-kit.tech!";
console.log(greeting);
\`\`\`

> All processing is done locally in your browser memory!
`;

const SAMPLE_HTML = `<h1>⚡ dev-kit.tech</h1>
<p>Welcome to <strong>dev-kit.tech</strong> — the 100% private developer tools platform.</p>
<h2>Features</h2>
<ul>
  <li><strong>JSON ↔ CSV</strong>: Fast nested object flattening</li>
  <li><strong>JSON ↔ YAML</strong>: Clean configuration converter</li>
</ul>
<blockquote>All processing is done locally in your browser memory!</blockquote>`;

export default function MarkdownHtmlConverter() {
  const [direction, setDirection] = useState<Direction>("md-to-html");
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [inputText, setInputText] = useState("");
  const [fullDocument, setFullDocument] = useState(false);
  const [liveMode, setLiveMode] = useState(true);
  const [result, setResult] = useState<MarkdownConversionResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"code" | "preview">("code");
  const [activeTab, setActiveTab] = useState<"text" | "file">("text");

  const outputRef = useRef<HTMLDivElement>(null);

  const isMdToHtml = direction === "md-to-html";

  const handleDirectionToggle = (newDir: Direction) => {
    setDirection(newDir);
    setInputText("");
    setResult(null);
    setInputMode("text");
    setActiveTab("text");
  };

  const convert = (
    text: string,
    dir: Direction = direction,
    fullDoc: boolean = fullDocument,
  ) => {
    if (!text.trim()) {
      setResult(null);
      return;
    }

    try {
      const res =
        dir === "md-to-html"
          ? markdownToHtml(text, { fullDocument: fullDoc })
          : htmlToMarkdown(text);

      setResult(res);
    } catch (e) {
      if (!liveMode) {
        toast.error("Conversion failed", {
          description: (e as Error).message,
        });
      }
      setResult(null);
    }
  };

  const handleInputChange = (val: string) => {
    setInputText(val);
    if (liveMode) {
      convert(val);
    }
  };

  const handleConvert = () => {
    if (!inputText.trim()) {
      toast.error("Input is empty", {
        description: `Please enter some ${isMdToHtml ? "Markdown" : "HTML"} content.`,
      });
      return;
    }
    convert(inputText);
    toast.success("Converted successfully!");
    setTimeout(() => {
      outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleFileContent = (content: string, filename: string) => {
    setInputText(content);
    setInputMode("text");
    convert(content, direction);
    toast.success(`Uploaded ${filename}`);
  };

  const handleLoadExample = () => {
    const example = isMdToHtml ? SAMPLE_MARKDOWN : SAMPLE_HTML;
    setInputText(example);
    convert(example);
    toast.success("Sample loaded!");
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
    const ext = isMdToHtml ? "html" : "md";
    const mime = isMdToHtml
      ? "text/html;charset=utf-8;"
      : "text/markdown;charset=utf-8;";
    const blob = new Blob([result.output], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `document.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded document.${ext}`);
  };

  const handleClear = () => {
    setInputText("");
    setResult(null);
    toast.info("Cleared");
  };

  const handleSwap = () => {
    const next: Direction = isMdToHtml ? "html-to-md" : "md-to-html";
    handleDirectionToggle(next);
    toast.info(
      `Switched to ${next === "md-to-html" ? "Markdown → HTML" : "HTML → Markdown"}`,
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* ── Header ── */}
      <ToolHeader
        title={
          isMdToHtml ? "Markdown → HTML Converter" : "HTML → Markdown Converter"
        }
        description={
          isMdToHtml
            ? "Convert GitHub Flavored Markdown to formatted HTML code with live visual preview."
            : "Convert raw HTML web code back to clean, structured Markdown syntax."
        }
        badgeText="Real-time Converter"
      />

      {/* ── Privacy Banner ── */}
      <PrivacyBanner />

      {/* ── Direction & Options Controls Bar ── */}
      <Card className="rounded-3xl shadow-xl border border-purple-500/25 bg-[#16213e] mb-6">
        <CardContent className="p-4 md:p-5 flex flex-wrap items-center justify-between gap-4">
          {/* Direction Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant={isMdToHtml ? "default" : "outline"}
              size="sm"
              onClick={() => handleDirectionToggle("md-to-html")}
              className={`gap-1.5 text-xs font-semibold transition-all ${
                isMdToHtml
                  ? "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/25"
                  : "border-purple-500/30 text-slate-300 hover:text-white"
              }`}
            >
              <FileText className="size-3.5" />
              Markdown → HTML
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleSwap}
              title="Swap conversion direction"
              className="size-8 border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 transition-all rounded-full"
            >
              <ArrowLeftRight className="size-3.5" />
            </Button>

            <Button
              variant={!isMdToHtml ? "default" : "outline"}
              size="sm"
              onClick={() => handleDirectionToggle("html-to-md")}
              className={`gap-1.5 text-xs font-semibold transition-all ${
                !isMdToHtml
                  ? "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/25"
                  : "border-purple-500/30 text-slate-300 hover:text-white"
              }`}
            >
              <FileCode className="size-3.5" />
              HTML → Markdown
            </Button>
          </div>

          {/* Options */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
            {isMdToHtml && (
              <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer hover:text-slate-200 transition-colors">
                <input
                  type="checkbox"
                  checked={fullDocument}
                  onChange={(e) => {
                    setFullDocument(e.target.checked);
                    if (liveMode && inputText)
                      convert(inputText, direction, e.target.checked);
                  }}
                  className="rounded border-purple-500/30 bg-black/40 text-purple-600 focus:ring-purple-500 size-3.5"
                />
                <span>Full HTML wrapper</span>
              </label>
            )}

            <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer hover:text-slate-200 transition-colors">
              <input
                type="checkbox"
                checked={liveMode}
                onChange={(e) => setLiveMode(e.target.checked)}
                className="rounded border-purple-500/30 bg-black/40 text-purple-600 focus:ring-purple-500 size-3.5"
              />
              <span>Live conversion</span>
            </label>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 ml-auto">
            <Button
              size="xs"
              variant="outline"
              onClick={handleLoadExample}
              className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20 text-xs"
            >
              <Sparkles className="size-3 mr-1" /> Example
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
                onClick={handleConvert}
                className="bg-linear-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold text-xs px-4 h-8 gap-1.5 shadow-md"
              >
                <Sparkles className="size-3.5" />
                Convert
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Side-by-Side Editor & Output/Preview Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Editor */}
        <div className="space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <FileText className="size-3.5 text-purple-400" />
                {isMdToHtml ? "Markdown Source" : "HTML Source"}
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
              language={isMdToHtml ? "markdown" : "html"}
              placeholder={
                isMdToHtml
                  ? '# Markdown Title\n\n- Feature 1\n- Feature 2\n\n```js\nconsole.log("Hello");\n```'
                  : "<h1>HTML Title</h1>\n<ul>\n  <li>Feature 1</li>\n</ul>"
              }
              height="500px"
            />
          ) : (
            <div className="h-[500px] rounded-2xl border border-purple-500/30 bg-black/40 p-4 flex flex-col justify-center">
              <FileDropZone
                fileType={isMdToHtml ? "markdown" : "code"}
                customAccept={
                  isMdToHtml ? ".md,.markdown,text/markdown" : ".html,text/html"
                }
                customLabel={
                  isMdToHtml ? "Markdown file (.md)" : "HTML file (.html)"
                }
                readAsDataURL={false}
                onFileContent={handleFileContent}
              />
            </div>
          )}
        </div>

        {/* Right: Output & Visual Preview */}
        <div className="space-y-3 flex flex-col" ref={outputRef}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Check className="size-3.5 text-emerald-400" />
                {isMdToHtml ? "HTML Output" : "Markdown Output"}
              </Label>
              {result && (
                <Badge
                  variant="outline"
                  className="text-[10px] border-emerald-500/30 text-emerald-300 font-mono"
                >
                  {result.lineCount} lines • {result.charCount.toLocaleString()}{" "}
                  chars
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {isMdToHtml && (
                <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/5 mr-1">
                  <Button
                    size="xs"
                    variant={viewMode === "code" ? "default" : "ghost"}
                    onClick={() => setViewMode("code")}
                    className={`h-6 text-[10px] px-2 ${viewMode === "code" ? "bg-purple-600 text-white" : "text-slate-400"}`}
                  >
                    <Code2 className="size-3 mr-1" /> Code
                  </Button>
                  <Button
                    size="xs"
                    variant={viewMode === "preview" ? "default" : "ghost"}
                    onClick={() => setViewMode("preview")}
                    className={`h-6 text-[10px] px-2 ${viewMode === "preview" ? "bg-purple-600 text-white" : "text-slate-400"}`}
                  >
                    <Eye className="size-3 mr-1" /> Preview
                  </Button>
                </div>
              )}

              {result?.output && (
                <>
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
                </>
              )}
            </div>
          </div>

          {viewMode === "code" || !isMdToHtml ? (
            <CodeEditor
              value={result?.output ?? ""}
              language={isMdToHtml ? "html" : "markdown"}
              readOnly
              height="500px"
            />
          ) : (
            <div
              className="w-full h-[500px] overflow-y-auto p-6 rounded-2xl border border-purple-500/30 bg-[#0d1527] text-slate-100 markdown-preview shadow-xl"
              dangerouslySetInnerHTML={{
                __html:
                  result?.renderedHtml ||
                  '<p class="text-slate-500 italic">No content to render preview.</p>',
              }}
            />
          )}
        </div>
      </div>

      <Separator className="my-8 bg-purple-500/20" />

      {/* AdSense Placement */}
      <AdSense
        slot={ADS_CONFIG.slots.betweenIO}
        format="auto"
        className="rounded-xl overflow-hidden mb-4"
      />
    </div>
  );
}
