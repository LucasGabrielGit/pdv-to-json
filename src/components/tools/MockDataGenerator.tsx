"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Plus,
  Trash2,
  Download,
  FileJson,
  FileSpreadsheet,
  Database,
  Code2,
} from "lucide-react";
import {
  generateMockDataset,
  exportToSqlInserts,
  type MockField,
  type MockFieldType,
} from "@/utils/mockDataGenerator";
import { jsonToCsv } from "@/utils/jsonToCsv";
import { ToolHeader } from "@/components/converter/ToolHeader";
import { PrivacyBanner } from "@/components/converter/PrivacyBanner";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DEFAULT_FIELDS: MockField[] = [
  { name: "id", type: "uuid" },
  { name: "fullName", type: "fullName" },
  { name: "email", type: "email" },
  { name: "company", type: "company" },
  { name: "city", type: "city" },
  { name: "status", type: "status" },
];

export default function MockDataGenerator() {
  const [fields, setFields] = useState<MockField[]>(DEFAULT_FIELDS);
  const [rowCount, setRowCount] = useState(10);
  const [format, setFormat] = useState<"json" | "csv" | "sql">("json");
  const [outputCode, setOutputCode] = useState("");
  const [copied, setCopied] = useState(false);

  // Generate output whenever fields, count or format change
  const handleRegenerate = () => {
    const data = generateMockDataset(fields, rowCount);
    if (format === "json") {
      setOutputCode(JSON.stringify(data, null, 2));
    } else if (format === "csv") {
      const csvRes = jsonToCsv(JSON.stringify(data), ",");
      setOutputCode(csvRes.csv);
    } else if (format === "sql") {
      setOutputCode(exportToSqlInserts("users", data));
    }
  };

  useEffect(() => {
    handleRegenerate();
  }, [fields, rowCount, format]);

  const handleAddField = () => {
    setFields([
      ...fields,
      { name: `field_${fields.length + 1}`, type: "firstName" },
    ]);
  };

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleFieldChange = (
    index: number,
    key: "name" | "type",
    val: string,
  ) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], [key]: val };
    setFields(updated);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputCode);
    setCopied(true);
    toast.success("Mock data copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = format === "json" ? "json" : format === "csv" ? "csv" : "sql";
    const blob = new Blob([outputCode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mock_data_${rowCount}_rows.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded mock_data.${ext}`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <ToolHeader
        title="Mock Data & Schema Generator"
        description="Generate realistic mock datasets (Names, Emails, UUIDs, Addresses, Companies) exported instantly to JSON, CSV, or SQL INSERTs."
        category="utilities"
      />

      <PrivacyBanner />

      {/* Schema Builder & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column: Field Builder */}
        <Card className="border border-purple-500/20 bg-[#16213e]/60 backdrop-blur-md lg:col-span-1">
          <CardContent className="p-4 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Code2 className="size-4 text-purple-400" /> Schema Fields (
                {fields.length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddField}
                className="text-xs border-purple-500/30 text-purple-300 hover:bg-purple-500/10 gap-1.5"
              >
                <Plus className="size-3.5" /> Add Field
              </Button>
            </div>

            <div className="space-y-2.5 max-h-95 overflow-y-auto pr-1">
              {fields.map((f, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 rounded-xl bg-black/30 border border-white/5"
                >
                  <Input
                    value={f.name}
                    onChange={(e) =>
                      handleFieldChange(index, "name", e.target.value)
                    }
                    placeholder="Field name"
                    className="h-8 flex-1 bg-black/40 border-purple-500/20 text-xs font-mono text-white"
                  />
                  <Select
                    value={f.type}
                    onValueChange={(v) => {
                      if (v)
                        handleFieldChange(index, "type", v as MockFieldType);
                    }}
                  >
                    <SelectTrigger className="h-8 w-32 bg-black/40 border-purple-500/20 text-xs text-cyan-300 font-mono">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent className="bg-[#16213e] border-purple-500/30 text-white">
                      <SelectItem value="uuid">UUID v4</SelectItem>
                      <SelectItem value="id">Auto ID (1,2..)</SelectItem>
                      <SelectItem value="fullName">Full Name</SelectItem>
                      <SelectItem value="firstName">First Name</SelectItem>
                      <SelectItem value="lastName">Last Name</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="company">Company</SelectItem>
                      <SelectItem value="jobTitle">Job Title</SelectItem>
                      <SelectItem value="city">City</SelectItem>
                      <SelectItem value="country">Country</SelectItem>
                      <SelectItem value="price">Price ($)</SelectItem>
                      <SelectItem value="date">Date (ISO)</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveField(index)}
                    disabled={fields.length <= 1}
                    className="size-8 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Row Count Slider */}
            <div className="pt-2 space-y-1.5 border-t border-white/10">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Row Count:</span>
                <span className="font-mono font-bold text-purple-300">
                  {rowCount} rows
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={rowCount}
                onChange={(e) => setRowCount(parseInt(e.target.value, 10))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Export Format & Code Output */}
        <div className="space-y-4 lg:col-span-2">
          {/* Format selector toolbar */}
          <Card className="border border-purple-500/20 bg-[#16213e]/60 backdrop-blur-md">
            <CardContent className="p-3 md:p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Export As:</span>
                <Tabs
                  value={format}
                  onValueChange={(v) => setFormat(v as typeof format)}
                >
                  <TabsList className="bg-black/40 border border-purple-500/30 p-1">
                    <TabsTrigger value="json" className="text-xs gap-1.5">
                      <FileJson className="size-3.5" /> JSON
                    </TabsTrigger>
                    <TabsTrigger value="csv" className="text-xs gap-1.5">
                      <FileSpreadsheet className="size-3.5" /> CSV
                    </TabsTrigger>
                    <TabsTrigger value="sql" className="text-xs gap-1.5">
                      <Database className="size-3.5" /> SQL INSERT
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerate}
                  className="text-xs border-purple-500/20 text-slate-300 hover:bg-purple-500/10 gap-1.5"
                >
                  <RotateCcw className="size-3.5" /> Re-shuffle
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="text-xs border-purple-500/30 text-purple-300 hover:bg-purple-500/10 gap-1.5"
                >
                  <Download className="size-3.5" /> Download
                </Button>
                <Button
                  size="sm"
                  onClick={handleCopy}
                  className="text-xs bg-purple-600 hover:bg-purple-500 text-white font-semibold gap-1.5"
                >
                  {copied ? (
                    <Check className="size-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  Copy Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Generated Code Output */}
          <CodeEditor
            value={outputCode}
            language={
              format === "sql" ? "sql" : format === "json" ? "json" : "html"
            }
            readOnly
            height="500px"
          />
        </div>
      </div>
    </div>
  );
}
