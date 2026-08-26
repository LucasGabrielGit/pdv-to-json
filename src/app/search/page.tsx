import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Search, ArrowRight } from 'lucide-react'
import { tools, searchTools, type Tool } from '@/lib/tools-registry'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Search Developer Tools',
  description: 'Search across 15+ free, private developer tools on dev-kit.tech.',
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q || ''

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-10">
      <Suspense fallback={<div className="text-center py-12 text-muted-foreground">Loading search...</div>}>
        <SearchResults query={query} />
      </Suspense>
    </div>
  )
}

function SearchResults({ query }: { query: string }) {
  const filtered = query.trim() ? searchTools(query) : tools

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-4">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
          Search Tools
        </h1>
        <p className="text-sm text-muted-foreground">
          Find fast, client-side tools for conversion, formatting, cryptography, and AI code analysis.
        </p>

        {/* Search input form */}
        <form method="GET" action="/search" className="relative flex items-center">
          <Search className="absolute left-3.5 size-4 text-purple-400 pointer-events-none" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by name, format (json, csv, jwt), or keywords..."
            className="w-full rounded-2xl border border-purple-500/30 bg-black/40 py-3 pl-10 pr-24 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-lg"
          />
          <button
            type="submit"
            className="absolute right-2 rounded-xl bg-purple-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-purple-500 transition-colors shadow-md"
          >
            Search
          </button>
        </form>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <h2 className="text-sm font-semibold text-slate-300">
          {query ? (
            <>
              Results for &quot;<span className="text-purple-400">{query}</span>&quot;{' '}
              <span className="text-xs text-muted-foreground font-normal">
                ({filtered.length} found)
              </span>
            </>
          ) : (
            <>
              All Developer Tools{' '}
              <span className="text-xs text-muted-foreground font-normal">
                ({tools.length} available)
              </span>
            </>
          )}
        </h2>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-base font-semibold text-slate-300">No tools found matching &quot;{query}&quot;</p>
          <p className="text-xs text-muted-foreground">Try searching for &quot;json&quot;, &quot;csv&quot;, &quot;base64&quot;, &quot;regex&quot;, or &quot;hash&quot;.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold pt-2"
          >
            View all tools <ArrowRight className="size-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tool) => (
            <ToolResultCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  )
}

function ToolResultCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon
  const isComingSoon = tool.status === 'coming-soon'

  const card = (
    <Card
      className={`group relative overflow-hidden border transition-all duration-300 h-full ${
        isComingSoon
          ? 'border-border/30 bg-card/30 opacity-60'
          : 'border-[rgba(124,58,237,0.25)] bg-[#16213e]/70 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-950/20 hover:-translate-y-0.5 cursor-pointer'
      }`}
    >
      <CardContent className="p-5 flex flex-col justify-between h-full">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div
              className={`flex size-10 items-center justify-center rounded-xl transition-colors ${
                isComingSoon
                  ? 'bg-muted/30 text-muted-foreground/50'
                  : 'bg-primary/10 text-primary group-hover:bg-primary/20'
              }`}
            >
              <Icon className="size-5" />
            </div>
            <Badge
              variant="outline"
              className="text-[9px] px-1.5 py-0 uppercase tracking-wider font-mono border-white/10 text-muted-foreground"
            >
              {tool.category}
            </Badge>
          </div>

          <div>
            <h3
              className={`font-semibold text-sm mb-1 ${
                isComingSoon
                  ? 'text-muted-foreground/60'
                  : 'text-foreground group-hover:text-primary'
              }`}
            >
              {tool.name}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {tool.description}
            </p>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between text-xs font-semibold text-purple-400 group-hover:text-purple-300">
          <span>Open Tool</span>
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
        </div>
      </CardContent>
    </Card>
  )

  if (isComingSoon) return card
  return <Link href={tool.href}>{card}</Link>
}
