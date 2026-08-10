'use client'

import React, { useState, useRef } from 'react'
import { toast } from 'sonner'
import AdSense from '@/components/AdSense'
import { ADS_CONFIG } from '@/config/ads'

import { jsonToCsv, type ConversionResult } from '../utils/jsonToCsv'
import { csvToJson, type CsvConversionResult } from '../utils/csvToJson'
import FileDropZone from './FileDropZone'

import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import { ConverterHeader } from './converter/ConverterHeader'
import { DirectionToggle, type Direction } from './converter/DirectionToggle'
import { ConverterOptions } from './converter/ConverterOptions'
import { OutputSection } from './converter/OutputSection'
import { FeatureBadges } from './converter/FeatureBadges'

type InputMode = 'text' | 'file'

const EXAMPLE_JSON = `[
  {
    "id": 1,
    "name": "Alice",
    "role": "Engineer",
    "address": {
      "city": "São Paulo",
      "country": "Brazil"
    }
  },
  {
    "id": 2,
    "name": "Bob",
    "role": "Designer",
    "address": {
      "city": "Rio de Janeiro",
      "country": "Brazil"
    }
  }
]`

const EXAMPLE_CSV = `id,name,role,address.city,address.country
1,Alice,Engineer,São Paulo,Brazil
2,Bob,Designer,Rio de Janeiro,Brazil`

const Converter: React.FC = () => {
  const [direction, setDirection] = useState<Direction>('json-to-csv')
  const [inputMode, setInputMode] = useState<InputMode>('text')
  const [inputText, setInputText] = useState('')
  const [delimiter, setDelimiter] = useState(',')
  const [expandNested, setExpandNested] = useState(true)
  const [castTypes, setCastTypes] = useState(true)
  const [result, setResult] = useState<ConversionResult | CsvConversionResult | null>(null)
  const [copied, setCopied] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text')

  const outputRef = useRef<HTMLDivElement>(null)

  const isJsonToCsv = direction === 'json-to-csv'

  const outputText = result
    ? isJsonToCsv
      ? (result as ConversionResult).csv
      : (result as CsvConversionResult).json
    : ''

  const rowCount = result ? result.rowCount : 0
  const columnCount = result ? result.columnCount : 0
  const headers = result ? result.headers ?? [] : []

  const handleDirectionToggle = (newDir: Direction) => {
    setDirection(newDir)
    setInputText('')
    setResult(null)
    setInputMode('text')
    setActiveTab('text')
  }

  const convert = (text: string, dir: Direction = direction) => {
    setResult(null)
    setIsConverting(true)

    setTimeout(() => {
      try {
        const res = dir === 'json-to-csv'
          ? jsonToCsv(text, delimiter)
          : csvToJson(text, { delimiter, expandNested, castTypes })

        setResult(res)
        toast.success('Conversion successful', {
          description: `${res.rowCount} rows · ${res.columnCount} columns`,
        })

        setTimeout(() => {
          outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      } catch (e) {
        toast.error('Conversion failed', {
          description: (e as Error).message,
          duration: 6000,
        })
      } finally {
        setIsConverting(false)
      }
    }, 50)
  }

  const handleConvert = () => {
    if (!inputText.trim()) {
      toast.error('Input is empty', {
        description: `Please enter or paste some ${isJsonToCsv ? 'JSON' : 'CSV'}.`,
      })
      return
    }
    convert(inputText)
  }

  const handleFileContent = (content: string) => {
    setInputText(content)
    setInputMode('text')
    convert(content, direction)
  }

  const handleLoadExample = () => {
    setInputText(isJsonToCsv ? EXAMPLE_JSON : EXAMPLE_CSV)
    setResult(null)
    toast.success('Example loaded', { description: 'Press Convert to see the output.' })
  }

  const handleCopy = async () => {
    if (!outputText) return
    await navigator.clipboard.writeText(outputText)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!outputText) return
    const ext = isJsonToCsv ? 'csv' : 'json'
    const mime = isJsonToCsv ? 'text/csv;charset=utf-8;' : 'application/json'
    const blob = new Blob([outputText], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `output.${ext}`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Downloaded output.${ext}`)
  }

  const handleClear = () => {
    setInputText('')
    setResult(null)
    toast.info('Cleared')
  }

  const handleSwap = () => {
    const next: Direction = isJsonToCsv ? 'csv-to-json' : 'json-to-csv'
    handleDirectionToggle(next)
    toast.info(`Switched to ${next === 'json-to-csv' ? 'JSON → CSV' : 'CSV → JSON'}`)
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">

      <ConverterHeader isJsonToCsv={isJsonToCsv} />

      <DirectionToggle
        direction={direction}
        onToggle={handleDirectionToggle}
        onSwap={handleSwap}
      />

      <Card
        className="rounded-3xl shadow-2xl overflow-hidden border border-[rgba(124,58,237,0.25)] bg-[#16213e]"
        style={{
          boxShadow: '0 25px 60px rgba(0,0,0,0.4), 0 0 60px rgba(124,58,237,0.04)',
        }}
      >
        <CardContent className="p-6 md:p-8">

          <Tabs
            value={inputMode}
            onValueChange={(v) => setInputMode(v as InputMode)}
            className="mb-5"
          >
            <TabsList className="h-auto gap-1 p-1 rounded-xl bg-black/30 border border-white/5">
              <TabsTrigger
                id="tab-text"
                value="text"
                className={`px-5 py-2 rounded-full transition-all ${activeTab === 'text'
                  ? 'text-zinc-900 font-semibold shadow-md'
                  : 'text-slate-400 hover:text-white'
                  }`}
                onClick={() => setActiveTab('text')}
              >
                ✏️ Paste Text
              </TabsTrigger>
              <TabsTrigger
                id="tab-file"
                value="file"
                className={`px-5 py-2 rounded-lg transition-all ${activeTab === 'file'
                  ? 'bg-white text-zinc-900 font-semibold shadow-md'
                  : 'text-slate-400 hover:text-white'
                  }`}
                onClick={() => setActiveTab('file')}
              >
                📁 Upload File
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {inputMode === 'text' ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {isJsonToCsv ? 'JSON' : 'CSV'} Input
                </Label>
                <Button
                  id="btn-example"
                  size="xs"
                  variant="outline"
                  onClick={handleLoadExample}
                  className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20 hover:text-cyan-300 transition-all"
                >
                  Load Example
                </Button>
              </div>
              <Textarea
                id="input-area"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isJsonToCsv
                    ? '[\n  { "name": "Alice", "age": 30 },\n  { "name": "Bob", "age": 25 }\n]'
                    : 'name,age,city\nAlice,30,São Paulo\nBob,25,Rio de Janeiro'
                }
                className="h-64 font-mono text-sm resize-y leading-relaxed bg-black/35 text-slate-100 border border-[rgba(124,58,237,0.25)]"
                spellCheck={false}
              />
            </div>
          ) : (
            <FileDropZone
              onFileContent={handleFileContent}
              fileType={isJsonToCsv ? 'json' : 'csv'}
            />
          )}


          <ConverterOptions
            isJsonToCsv={isJsonToCsv}
            delimiter={delimiter}
            setDelimiter={setDelimiter}
            expandNested={expandNested}
            setExpandNested={setExpandNested}
            castTypes={castTypes}
            setCastTypes={setCastTypes}
            inputTextLength={inputText.length}
            isConverting={isConverting}
            onClear={handleClear}
            onConvert={handleConvert}
          />


          <OutputSection
            outputRef={outputRef}
            isJsonToCsv={isJsonToCsv}
            result={result}
            outputText={outputText}
            copied={copied}
            onCopy={handleCopy}
            onDownload={handleDownload}
            rowCount={rowCount}
            columnCount={columnCount}
            headers={headers}
          />
        </CardContent>
      </Card>


      <FeatureBadges />

      <Separator className="my-6 bg-[rgba(124,58,237,0.25)]" />


      <AdSense
        slot={ADS_CONFIG.slots.betweenIO}
        format="auto"
        className="rounded-xl overflow-hidden mb-4"
      />
    </div>
  )
}

export default Converter
