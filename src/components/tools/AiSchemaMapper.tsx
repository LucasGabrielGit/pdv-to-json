"use client";

import React, { useState } from "react";
import {
  Database,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Key,
  Download,
  Table,
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
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";

const SAMPLE_SQL = `CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_amount NUMERIC(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`;

interface SchemaResult {
  prisma: string;
  drizzle: string;
  typeorm: string;
  zod: string;
  migrationSql: string;
  summary: string;
}

export default function AiSchemaMapper() {
  const [schemaInput, setSchemaInput] = useState(SAMPLE_SQL);
  const [dialect, setDialect] = useState<"postgres" | "mysql" | "sqlite">(
    "postgres",
  );
  const [customApiKey, setCustomApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SchemaResult | null>(null);
  const [activeOutputTab, setActiveOutputTab] = useState<
    "prisma" | "drizzle" | "typeorm" | "zod"
  >("prisma");
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!schemaInput.trim()) {
      toast.error("Please paste SQL DDL or a database schema.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/schema-mapper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schemaInput: schemaInput.trim(),
          dialect,
          customApiKey: customApiKey.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to map schema.");
      }

      setResult(data.data);
      toast.success("Database schema mapped to all ORMs!");
    } catch (e) {
      toast.error("Mapping Error", {
        description: (e as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentCode = () => {
    if (!result) return "";
    switch (activeOutputTab) {
      case "prisma":
        return result.prisma;
      case "drizzle":
        return result.drizzle;
      case "typeorm":
        return result.typeorm;
      case "zod":
        return result.zod;
      default:
        return "";
    }
  };

  const getLanguage = () => {
    return activeOutputTab === "prisma" ? "graphql" : "typescript";
  };

  const handleCopy = async () => {
    const code = getCurrentCode();
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(`Copied ${activeOutputTab.toUpperCase()} schema!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const code = getCurrentCode();
    if (!code) return;
    const extensions: Record<string, string> = {
      prisma: "schema.prisma",
      drizzle: "schema.ts",
      typeorm: "entities.ts",
      zod: "validators.ts",
    };
    const filename = extensions[activeOutputTab] || "schema.txt";
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  useKeyboardShortcut({
    onExecute: handleGenerate,
    onCopy: handleCopy,
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <ToolHeader
        title="AI Database Schema Mapper"
        description="Convert SQL DDL queries, JSON models, or natural language into Prisma Schemas, Drizzle ORM, TypeORM Entities, and Zod Schemas."
        badgeText="AI Database Architect"
        toolId="ai-schema"
      />

      <PrivacyBanner />

      {/* Toolbar */}
      <Card className="border border-purple-500/25 bg-[#16213e] shadow-xl">
        <CardContent className="p-4 md:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Label className="text-slate-400">Database Dialect:</Label>
              <select
                value={dialect}
                onChange={(e) => setDialect(e.target.value as typeof dialect)}
                className="h-8 px-2.5 rounded-md bg-black/40 border border-purple-500/30 text-slate-200 text-xs font-mono outline-none"
              >
                <option value="postgres">PostgreSQL</option>
                <option value="mysql">MySQL / MariaDB</option>
                <option value="sqlite">SQLite</option>
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
              onClick={() => setSchemaInput(SAMPLE_SQL)}
              className="bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20 text-xs"
            >
              <Sparkles className="size-3 mr-1 text-purple-400" /> Sample SQL
            </Button>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => setSchemaInput("")}
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
                <Database className="size-3.5" />
              )}
              <span>{isLoading ? "Converting Schema..." : "Map to All ORMs"}</span>
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
                htmlFor="ai-schema-key"
                className="text-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Key className="size-3 text-purple-400" /> Bring Your Own Key
                (Unlimited Free Usage)
              </Label>
              <Input
                id="ai-schema-key"
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
        {/* Left: Input SQL / Schema */}
        <div className="space-y-2.5 flex flex-col">
          <div className="flex items-center justify-between h-9 min-h-9">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Table className="size-3.5 text-purple-400" /> SQL DDL / Schema
              Input
            </Label>
            <Badge
              variant="outline"
              className="text-[10px] border-white/10 text-slate-400 font-mono"
            >
              {schemaInput.length} chars
            </Badge>
          </div>

          <CodeEditor
            value={schemaInput}
            onChange={(v) => setSchemaInput(v || "")}
            language="sql"
            placeholder="Paste CREATE TABLE statements or JSON models here..."
            height="500px"
          />
        </div>

        {/* Right: Generated ORM Schema Output */}
        <div className="space-y-2.5 flex flex-col">
          <div className="flex items-center justify-between h-9 min-h-9">
            <Tabs
              value={activeOutputTab}
              onValueChange={(v) =>
                setActiveOutputTab(v as typeof activeOutputTab)
              }
            >
              <TabsList className="bg-black/40 border border-white/5 p-0.5 h-8">
                <TabsTrigger
                  value="prisma"
                  className="text-[10px] px-2.5 h-7 data-[state=active]:bg-purple-600 data-[state=active]:text-white font-semibold"
                >
                  Prisma
                </TabsTrigger>
                <TabsTrigger
                  value="drizzle"
                  className="text-[10px] px-2.5 h-7 data-[state=active]:bg-purple-600 data-[state=active]:text-white font-semibold"
                >
                  Drizzle ORM
                </TabsTrigger>
                <TabsTrigger
                  value="typeorm"
                  className="text-[10px] px-2.5 h-7 data-[state=active]:bg-purple-600 data-[state=active]:text-white font-semibold"
                >
                  TypeORM
                </TabsTrigger>
                <TabsTrigger
                  value="zod"
                  className="text-[10px] px-2.5 h-7 data-[state=active]:bg-purple-600 data-[state=active]:text-white font-semibold"
                >
                  Zod Schemas
                </TabsTrigger>
              </TabsList>
            </Tabs>

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
              getCurrentCode() ||
              '// Click "Map to All ORMs" to generate schemas...'
            }
            language={getLanguage()}
            readOnly
            height="500px"
          />
        </div>
      </div>
    </div>
  );
}
