'use client'

import React, { useState, useMemo } from 'react'
import { toast } from 'sonner'
import {
  GitBranch,
  Copy,
  Download,
  Sparkles,
  Check,
  Search,
  Bot,
  Container,
  FileCode,
  Layers,
  Plus,
} from 'lucide-react'
import { ToolHeader } from '@/components/converter/ToolHeader'
import { PrivacyBanner } from '@/components/converter/PrivacyBanner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  GITIGNORE_TEMPLATES,
  POPULAR_PRESETS,
  generateGitignore,
  generateRobotsTxt,
  generateDockerConfig,
  type DockerStack,
} from '@/utils/gitignoreGenerator'

export default function GitignoreGenerator() {
  const [activeMainTab, setActiveMainTab] = useState<'gitignore' | 'robots' | 'docker'>('gitignore')

  // .gitignore State
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([
    'node',
    'nextjs',
    'macos',
    'windows',
    'vscode',
  ])
  const [searchQuery, setSearchQuery] = useState('')
  const [customRules, setCustomRules] = useState('')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // robots.txt State
  const [robotsAllowAll, setRobotsAllowAll] = useState(true)
  const [robotsDisallowInput, setRobotsDisallowInput] = useState('/api/, /admin/, /private/')
  const [robotsSitemap, setRobotsSitemap] = useState('https://dev-kit.tech/sitemap.xml')
  const [robotsCrawlDelay, setRobotsCrawlDelay] = useState<string>('')

  // Docker State
  const [dockerStack, setDockerStack] = useState<DockerStack>('nextjs')

  // Generated outputs
  const gitignoreOutput = useMemo(() => {
    return generateGitignore(selectedTemplates, customRules)
  }, [selectedTemplates, customRules])

  const robotsOutput = useMemo(() => {
    const disallows = robotsDisallowInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    return generateRobotsTxt({
      allowAll: robotsAllowAll,
      disallowPaths: disallows,
      sitemapUrl: robotsSitemap,
      crawlDelay: robotsCrawlDelay ? parseInt(robotsCrawlDelay, 10) : undefined,
    })
  }, [robotsAllowAll, robotsDisallowInput, robotsSitemap, robotsCrawlDelay])

  const dockerOutput = useMemo(() => {
    return generateDockerConfig(dockerStack)
  }, [dockerStack])

  // Handlers
  const handleToggleTemplate = (id: string) => {
    if (selectedTemplates.includes(id)) {
      setSelectedTemplates(selectedTemplates.filter((t) => t !== id))
    } else {
      setSelectedTemplates([...selectedTemplates, id])
    }
  }

  const handleApplyPreset = (templateIds: string[], presetName: string) => {
    setSelectedTemplates(templateIds)
    toast.success(`Applied ${presetName} template preset`)
  }

  const handleCopy = async (text: string, label: string) => {
    if (!text.trim()) return
    await navigator.clipboard.writeText(text)
    setCopiedKey(label)
    toast.success(`Copied ${label} to clipboard!`)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleDownload = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success(`Downloaded ${filename}`)
  }

  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return GITIGNORE_TEMPLATES
    const q = searchQuery.toLowerCase()
    return GITIGNORE_TEMPLATES.filter(
      (t) => t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)
    )
  }, [searchQuery])

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* ── Header ── */}
      <ToolHeader
        title="Config & .gitignore Generator"
        description="Generate production-ready .gitignore files for any stack, robots.txt SEO configurations, and multi-stage Docker starter templates."
        badgeText="100% Client-Side"
      />

      {/* ── Privacy Banner ── */}
      <PrivacyBanner />

      {/* ── Main Navigation Tabs ── */}
      <Tabs
        value={activeMainTab}
        onValueChange={(val) => setActiveMainTab(val as 'gitignore' | 'robots' | 'docker')}
        className="w-full space-y-6"
      >
        <TabsList className="bg-[#16213e]/80 border border-purple-500/20 p-1 rounded-xl">
          <TabsTrigger value="gitignore" className="gap-2 text-xs md:text-sm">
            <GitBranch className="size-4 text-purple-400" />
            <span>.gitignore Generator</span>
          </TabsTrigger>
          <TabsTrigger value="robots" className="gap-2 text-xs md:text-sm">
            <Bot className="size-4 text-cyan-400" />
            <span>robots.txt Generator</span>
          </TabsTrigger>
          <TabsTrigger value="docker" className="gap-2 text-xs md:text-sm">
            <Container className="size-4 text-emerald-400" />
            <span>Dockerfile &amp; Compose</span>
          </TabsTrigger>
        </TabsList>

        {/* ══════════════════════════════════════════════
            TAB 1: .gitignore Generator
        ══════════════════════════════════════════════ */}
        <TabsContent value="gitignore" className="space-y-6 m-0">
          {/* Quick Presets Bar */}
          <div className="flex flex-wrap items-center gap-2 p-3.5 rounded-xl bg-[#16213e]/70 border border-purple-500/20 backdrop-blur-md">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5 shrink-0">
              <Sparkles className="size-3.5" />
              Presets:
            </span>
            {POPULAR_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset.templateIds, preset.name)}
                className="px-2.5 py-1 rounded-lg bg-black/40 hover:bg-purple-600/30 border border-purple-500/30 text-slate-300 hover:text-white text-xs transition-colors cursor-pointer"
              >
                {preset.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Template Selector & Custom Rules (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="border border-purple-500/20 bg-[#16213e]/80 backdrop-blur-md">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <Layers className="size-4 text-purple-400" />
                      <span>Select Stacks &amp; OS</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-300 border-purple-500/20">
                      {selectedTemplates.length} selected
                    </Badge>
                  </div>

                  {/* Search filter */}
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 size-3.5 text-slate-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter stacks (e.g. Next.js, Python, macOS)..."
                      aria-label="Filter templates"
                      className="pl-8 text-xs bg-black/40 border-white/10 text-slate-200"
                    />
                  </div>

                  {/* Template Chips */}
                  <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pr-1">
                    {filteredTemplates.map((template) => {
                      const isSelected = selectedTemplates.includes(template.id)
                      return (
                        <button
                          key={template.id}
                          onClick={() => handleToggleTemplate(template.id)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer border ${
                            isSelected
                              ? 'bg-purple-600 text-white border-purple-500 shadow-xs'
                              : 'bg-black/30 border-white/5 text-slate-300 hover:text-white hover:border-white/20'
                          }`}
                        >
                          {isSelected ? <Check className="size-3" /> : <Plus className="size-3 text-slate-500" />}
                          <span>{template.name}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Selected badges summary */}
                  {selectedTemplates.length > 0 && (
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Included in output</span>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => setSelectedTemplates([])}
                        className="text-[11px] text-rose-300 hover:text-white hover:bg-rose-500/10 h-6"
                      >
                        Clear all
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Custom rules input */}
              <Card className="border border-purple-500/20 bg-[#16213e]/80 backdrop-blur-md">
                <CardContent className="p-4 space-y-2">
                  <div className="text-xs font-bold text-white flex items-center justify-between">
                    <span>Custom Rules (Optional)</span>
                    <span className="text-[10px] text-slate-400">Appended at bottom</span>
                  </div>
                  <textarea
                    value={customRules}
                    onChange={(e) => setCustomRules(e.target.value)}
                    placeholder="my-secret-dir/&#10;*.private.json"
                    aria-label="Custom .gitignore rules"
                    className="w-full h-24 font-mono text-xs p-2.5 rounded-xl bg-black/40 border border-white/10 text-slate-200 focus:outline-hidden focus:border-purple-500/50 resize-y"
                    spellCheck={false}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right: Output Preview (7 cols) */}
            <div className="lg:col-span-7">
              <Card className="border border-purple-500/20 bg-[#16213e]/80 backdrop-blur-md flex flex-col h-full">
                <div className="p-4 border-b border-purple-500/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="size-4 text-emerald-400" />
                    <span className="text-sm font-bold text-white">Generated .gitignore</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => handleCopy(gitignoreOutput, '.gitignore')}
                      className="text-xs border-purple-500/30 text-purple-300 hover:bg-purple-500/10 gap-1.5"
                    >
                      {copiedKey === '.gitignore' ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                      {copiedKey === '.gitignore' ? 'Copied' : 'Copy'}
                    </Button>
                    <Button
                      size="xs"
                      onClick={() => handleDownload(gitignoreOutput, '.gitignore')}
                      className="text-xs bg-purple-600 hover:bg-purple-500 text-white font-semibold gap-1.5 shadow-md"
                    >
                      <Download className="size-3.5" />
                      Download .gitignore
                    </Button>
                  </div>
                </div>

                <CardContent className="p-4 flex-1 flex flex-col">
                  <textarea
                    readOnly
                    value={gitignoreOutput}
                    aria-label=".gitignore output"
                    className="w-full flex-1 min-h-[420px] font-mono text-xs p-3.5 rounded-xl bg-black/50 border border-emerald-500/20 text-emerald-300 focus:outline-hidden resize-y leading-relaxed"
                    spellCheck={false}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ══════════════════════════════════════════════
            TAB 2: robots.txt Generator
        ══════════════════════════════════════════════ */}
        <TabsContent value="robots" className="space-y-6 m-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Configuration options */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="border border-purple-500/20 bg-[#16213e]/80 backdrop-blur-md">
                <CardContent className="p-5 space-y-4">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <Bot className="size-4 text-cyan-400" />
                    <span>robots.txt Rules</span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Default Crawler Policy</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setRobotsAllowAll(true)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                          robotsAllowAll
                            ? 'bg-cyan-600 text-white border-cyan-500'
                            : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        Allow All (Public Site)
                      </button>
                      <button
                        onClick={() => setRobotsAllowAll(false)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                          !robotsAllowAll
                            ? 'bg-rose-600 text-white border-rose-500'
                            : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        Block All (Staging/Dev)
                      </button>
                    </div>
                  </div>

                  {robotsAllowAll && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">Disallow Paths (comma separated)</label>
                      <Input
                        value={robotsDisallowInput}
                        onChange={(e) => setRobotsDisallowInput(e.target.value)}
                        placeholder="/api/, /admin/, /private/"
                        aria-label="Disallow paths"
                        className="text-xs bg-black/40 border-white/10 text-slate-200"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Sitemap URL</label>
                    <Input
                      value={robotsSitemap}
                      onChange={(e) => setRobotsSitemap(e.target.value)}
                      placeholder="https://dev-kit.tech/sitemap.xml"
                      aria-label="Sitemap URL"
                      className="text-xs bg-black/40 border-white/10 text-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Crawl Delay (Seconds, optional)</label>
                    <Input
                      type="number"
                      min="0"
                      value={robotsCrawlDelay}
                      onChange={(e) => setRobotsCrawlDelay(e.target.value)}
                      placeholder="10"
                      aria-label="Crawl delay seconds"
                      className="text-xs bg-black/40 border-white/10 text-slate-200"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: robots.txt Output */}
            <div className="lg:col-span-7">
              <Card className="border border-purple-500/20 bg-[#16213e]/80 backdrop-blur-md flex flex-col h-full">
                <div className="p-4 border-b border-purple-500/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="size-4 text-cyan-400" />
                    <span className="text-sm font-bold text-white">Generated robots.txt</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => handleCopy(robotsOutput, 'robots.txt')}
                      className="text-xs border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 gap-1.5"
                    >
                      {copiedKey === 'robots.txt' ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                      {copiedKey === 'robots.txt' ? 'Copied' : 'Copy'}
                    </Button>
                    <Button
                      size="xs"
                      onClick={() => handleDownload(robotsOutput, 'robots.txt')}
                      className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-semibold gap-1.5 shadow-md"
                    >
                      <Download className="size-3.5" />
                      Download robots.txt
                    </Button>
                  </div>
                </div>

                <CardContent className="p-4 flex-1 flex flex-col">
                  <textarea
                    readOnly
                    value={robotsOutput}
                    aria-label="robots.txt output"
                    className="w-full flex-1 min-h-[380px] font-mono text-xs p-3.5 rounded-xl bg-black/50 border border-cyan-500/20 text-cyan-300 focus:outline-hidden resize-y leading-relaxed"
                    spellCheck={false}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ══════════════════════════════════════════════
            TAB 3: Dockerfile & Compose Starter
        ══════════════════════════════════════════════ */}
        <TabsContent value="docker" className="space-y-6 m-0">
          {/* Stack Selector Chips */}
          <div className="flex flex-wrap items-center gap-2 p-3.5 rounded-xl bg-[#16213e]/70 border border-purple-500/20 backdrop-blur-md">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5 shrink-0">
              <Container className="size-3.5" />
              Stack:
            </span>
            {(
              [
                { id: 'nextjs', name: 'Next.js 15 Standalone' },
                { id: 'python-fastapi', name: 'Python FastAPI' },
                { id: 'golang', name: 'Golang 1.23 Alpine' },
                { id: 'rust', name: 'Rust Slim' },
                { id: 'node-express', name: 'Node.js Express' },
              ] as const
            ).map((st) => (
              <button
                key={st.id}
                onClick={() => setDockerStack(st.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                  dockerStack === st.id
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                    : 'bg-black/30 border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {st.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dockerfile */}
            <Card className="border border-purple-500/20 bg-[#16213e]/80 backdrop-blur-md flex flex-col">
              <div className="p-4 border-b border-purple-500/10 flex items-center justify-between">
                <span className="text-sm font-bold text-white">Dockerfile (Multi-Stage)</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => handleCopy(dockerOutput.dockerfile, 'Dockerfile')}
                    className="text-xs border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 gap-1.5"
                  >
                    {copiedKey === 'Dockerfile' ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    {copiedKey === 'Dockerfile' ? 'Copied' : 'Copy'}
                  </Button>
                  <Button
                    size="xs"
                    onClick={() => handleDownload(dockerOutput.dockerfile, 'Dockerfile')}
                    className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold gap-1.5 shadow-md"
                  >
                    <Download className="size-3.5" />
                    Download
                  </Button>
                </div>
              </div>
              <CardContent className="p-4 flex-1">
                <textarea
                  readOnly
                  value={dockerOutput.dockerfile}
                  aria-label="Dockerfile output"
                  className="w-full h-96 font-mono text-xs p-3.5 rounded-xl bg-black/50 border border-emerald-500/20 text-emerald-300 focus:outline-hidden resize-y leading-relaxed"
                  spellCheck={false}
                />
              </CardContent>
            </Card>

            {/* docker-compose.yml */}
            <Card className="border border-purple-500/20 bg-[#16213e]/80 backdrop-blur-md flex flex-col">
              <div className="p-4 border-b border-purple-500/10 flex items-center justify-between">
                <span className="text-sm font-bold text-white">docker-compose.yml</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => handleCopy(dockerOutput.compose, 'docker-compose.yml')}
                    className="text-xs border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 gap-1.5"
                  >
                    {copiedKey === 'docker-compose.yml' ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    {copiedKey === 'docker-compose.yml' ? 'Copied' : 'Copy'}
                  </Button>
                  <Button
                    size="xs"
                    onClick={() => handleDownload(dockerOutput.compose, 'docker-compose.yml')}
                    className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-semibold gap-1.5 shadow-md"
                  >
                    <Download className="size-3.5" />
                    Download
                  </Button>
                </div>
              </div>
              <CardContent className="p-4 flex-1">
                <textarea
                  readOnly
                  value={dockerOutput.compose}
                  aria-label="docker-compose.yml output"
                  className="w-full h-96 font-mono text-xs p-3.5 rounded-xl bg-black/50 border border-cyan-500/20 text-cyan-300 focus:outline-hidden resize-y leading-relaxed"
                  spellCheck={false}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
