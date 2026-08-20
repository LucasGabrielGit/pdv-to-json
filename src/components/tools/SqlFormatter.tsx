'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Database,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Minimize2,
  Maximize2,
  Code2,
} from 'lucide-react'
import { formatSql, minifySql, type SqlFormatterOptions } from '@/utils/sqlFormatter'
import { ToolHeader } from '@/components/converter/ToolHeader'
import { PrivacyBanner } from '@/components/converter/PrivacyBanner'
import CodeEditor from '@/components/CodeEditor'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const SAMPLE_SQL = `select u.id, u.email, count(o.id) as total_orders, sum(o.amount) as revenue from users u left join orders o on u.id = o.user_id where u.created_at >= '2026-01-01' and u.status in ('active', 'verified') group by u.id, u.email having sum(o.amount) > 500 order by revenue desc limit 50;`

export default function SqlFormatter() {
  const [inputSql, setInputSql] = useState(SAMPLE_SQL)
  const [formattedSql, setFormattedSql] = useState('')
  const [uppercaseKeywords, setUppercaseKeywords] = useState(true)
  const [indentSpaces, setIndentSpaces] = useState('2')
  const [dialect, setDialect] = useState<SqlFormatterOptions['dialect']>('postgresql')
  const [copied, setCopied] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        setInputSql(content)
        toast.success(`Loaded ${file.name}`)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }


  useEffect(() => {
    const res = formatSql(inputSql, {
      uppercaseKeywords,
      indentSpaces: parseInt(indentSpaces, 10) || 2,
      dialect,
    })
    setFormattedSql(res)
  }, [inputSql, uppercaseKeywords, indentSpaces, dialect])

  const handleCopy = () => {
    if (!formattedSql) return
    navigator.clipboard.writeText(formattedSql)
    setCopied(true)
    toast.success('Formatted SQL copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleMinify = () => {
    const min = minifySql(inputSql)
    setFormattedSql(min)
    toast.info('SQL Minified to single line.')
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <ToolHeader
        title="SQL Formatter & Beautifier"
        description="Format, indent, and beautify messy SQL queries for PostgreSQL, MySQL, SQLite, T-SQL, and BigQuery with uppercase keyword alignment."
        category="utilities"
      />

      <PrivacyBanner />

      {/* Toolbar */}
      <Card className="border border-purple-500/20 bg-[#16213e]/60 backdrop-blur-md">
        <CardContent className="p-4 md:p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Dialect */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Dialect:</span>
              <Select
                value={dialect}
                onValueChange={(v) => {
                  if (v) setDialect(v as typeof dialect)
                }}
              >
                <SelectTrigger className="h-8 w-36 text-xs bg-black/40 border-purple-500/30 text-white font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#16213e] border-purple-500/30 text-white">
                  <SelectItem value="postgresql">PostgreSQL</SelectItem>
                  <SelectItem value="mysql">MySQL / MariaDB</SelectItem>
                  <SelectItem value="sqlite">SQLite</SelectItem>
                  <SelectItem value="tsql">T-SQL / SQL Server</SelectItem>
                  <SelectItem value="bigquery">Google BigQuery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Indent */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Indentation:</span>
              <Select
                value={indentSpaces}
                onValueChange={(v) => {
                  if (v) setIndentSpaces(v)
                }}
              >
                <SelectTrigger className="h-8 w-28 text-xs bg-black/40 border-purple-500/30 text-white font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#16213e] border-purple-500/30 text-white">
                  <SelectItem value="2">2 Spaces</SelectItem>
                  <SelectItem value="4">4 Spaces</SelectItem>
                </SelectContent>
              </Select>
            </div>


            {/* Uppercase Toggle */}
            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={uppercaseKeywords}
                onChange={(e) => setUppercaseKeywords(e.target.checked)}
                className="rounded border-purple-500/30 accent-purple-500"
              />
              <span>UPPERCASE Keywords</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".sql,text/plain"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs border-purple-500/30 text-cyan-300 hover:bg-cyan-500/10 gap-1.5"
            >
              <Database className="size-3.5" /> Upload .sql
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputSql(SAMPLE_SQL)}
              className="text-xs border-purple-500/20 text-slate-300 hover:bg-purple-500/10 gap-1.5"
            >
              <RotateCcw className="size-3.5" /> Sample
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleMinify}
              className="text-xs border-purple-500/20 text-cyan-300 hover:bg-cyan-500/10 gap-1.5"
            >
              <Minimize2 className="size-3.5" /> Minify
            </Button>
            <Button
              size="sm"
              onClick={handleCopy}
              disabled={!formattedSql}
              className="text-xs bg-purple-600 hover:bg-purple-500 text-white font-semibold gap-1.5"
            >
              {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
              {copied ? 'Copied!' : 'Copy SQL'}
            </Button>
          </div>

        </CardContent>
      </Card>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Code2 className="size-4 text-purple-400" /> Raw SQL Query
            </span>
            <span className="text-slate-500 font-mono">{inputSql.length} chars</span>
          </div>
          <div className="rounded-2xl border border-purple-500/30 overflow-hidden bg-black/40 shadow-inner">
            <CodeEditor
              value={inputSql}
              onChange={(val) => setInputSql(val || '')}
              language="sql"
              placeholder="Paste raw SQL query here..."
              height="380px"
            />
          </div>

        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="size-4 text-cyan-400" /> Formatted &amp; Beautified SQL
            </span>
            <span className="text-slate-500 font-mono">{formattedSql.split('\n').length} lines</span>
          </div>
          <div className="rounded-2xl border border-purple-500/30 overflow-hidden bg-black/40 shadow-inner">
            <CodeEditor
              value={formattedSql}
              language="sql"
              readOnly
              height="380px"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
