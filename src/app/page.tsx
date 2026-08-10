import Link from 'next/link'
import { ShieldCheck, Zap, Globe } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { categories, getToolsByCategory, type Tool } from '@/lib/tools-registry'

export default function HomePage() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12">
      {/* ── Hero Section ── */}
      <section className="text-center mb-16">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
          <Badge
            variant="outline"
            className="gap-1.5 border-purple-500/40 bg-purple-500/10 text-purple-400 font-medium py-1 px-3"
          >
            <Zap className="size-3.5" />
            Free & Open Source
          </Badge>
          <Badge
            variant="outline"
            className="gap-1.5 border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-medium py-1 px-3"
          >
            <ShieldCheck className="size-3.5" />
            100% Client-Side Privacy
          </Badge>
          <Badge
            variant="outline"
            className="gap-1.5 border-cyan-500/40 bg-cyan-500/10 text-cyan-400 font-medium py-1 px-3"
          >
            <Globe className="size-3.5" />
            No Sign-up Required
          </Badge>
        </div>

        <h1
          className="text-5xl md:text-7xl font-black mb-4 tracking-tight"
          style={{
            background:
              'linear-gradient(135deg, #f1f5f9 0%, #7c3aed 50%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Developer Tools
        </h1>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-2">
          A suite of free, fast, and private tools built for developers. Every
          tool runs{' '}
          <span className="text-emerald-400 font-semibold">
            entirely in your browser
          </span>{' '}
          — your data never touches a server.
        </p>
        <p className="text-sm text-muted-foreground">
          Convert, analyze, generate — all in one place.
        </p>
      </section>

      {/* ── Tools Grid by Category ── */}
      {categories.map((cat) => {
        const catTools = getToolsByCategory(cat.id)
        if (catTools.length === 0) return null

        return (
          <section key={cat.id} className="mb-12">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="text-xl">{cat.emoji}</span>
              {cat.label}
              <span className="text-xs text-muted-foreground font-normal">
                ({catTools.length})
              </span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {catTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>

            <Separator className="mt-10 bg-border/30" />
          </section>
        )
      })}
    </div>
  )
}

/* ── Tool Card ── */
function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon
  const isComingSoon = tool.status === 'coming-soon'

  const card = (
    <Card
      className={`group relative overflow-hidden border transition-all duration-300 ${
        isComingSoon
          ? 'border-border/30 bg-card/30 opacity-60'
          : 'border-[rgba(124,58,237,0.25)] bg-card/60 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 cursor-pointer'
      }`}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div
            className={`flex size-10 items-center justify-center rounded-xl transition-colors ${
              isComingSoon
                ? 'bg-muted/30 text-muted-foreground/50'
                : 'bg-primary/10 text-primary group-hover:bg-primary/20'
            }`}
          >
            <Icon className="size-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3
                className={`font-semibold text-sm ${
                  isComingSoon
                    ? 'text-muted-foreground/60'
                    : 'text-foreground group-hover:text-primary'
                }`}
              >
                {tool.name}
              </h3>
              {isComingSoon && (
                <Badge
                  variant="outline"
                  className="text-[9px] px-1.5 py-0 border-muted-foreground/30 text-muted-foreground/50"
                >
                  Soon
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {tool.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (isComingSoon) return card

  return <Link href={tool.href}>{card}</Link>
}
