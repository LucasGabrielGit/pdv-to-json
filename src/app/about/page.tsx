import type { Metadata } from 'next'
import Link from 'next/link'
import { Code2, ShieldCheck, Zap, Globe, Heart, ArrowLeft, Mail } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'About Us — DevKit Professional Developer Suite',
  description:
    'Learn about DevKit (dev-kit.tech), our mission to build fast, private, client-first developer utilities and AI code generation tools.',
  alternates: {
    canonical: 'https://dev-kit.tech/about',
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen py-10 px-4 md:px-8 max-w-4xl mx-auto space-y-8">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Back to Tools
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <Code2 className="size-3.5" />
          <span>About DevKit</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
          Empowering Developers with Fast, Private &amp; Modern Tools
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          DevKit was built by software engineers, for software engineers. Our goal is to eliminate bloated, ad-ridden developer utility websites by providing an ultra-fast, privacy-first, 100% client-side toolsuite powered by modern web technologies and state-of-the-art AI.
        </p>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-purple-500/20 bg-[#16213e]/80">
          <CardContent className="p-5 space-y-2.5">
            <div className="size-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <ShieldCheck className="size-5" />
            </div>
            <h2 className="text-sm font-bold text-white">100% Client-Side Privacy</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your JSON data, passwords, JWT tokens, and sensitive code never leave your browser for offline tools. Zero server logs or tracking.
            </p>
          </CardContent>
        </Card>

        <Card className="border border-purple-500/20 bg-[#16213e]/80">
          <CardContent className="p-5 space-y-2.5">
            <div className="size-9 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Zap className="size-5" />
            </div>
            <h2 className="text-sm font-bold text-white">Zero Latency Performance</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Engineered with Next.js 15, Web Workers, and WebAssembly for instantaneous feedback with offline PWA support.
            </p>
          </CardContent>
        </Card>

        <Card className="border border-purple-500/20 bg-[#16213e]/80">
          <CardContent className="p-5 space-y-2.5">
            <div className="size-9 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Globe className="size-5" />
            </div>
            <h2 className="text-sm font-bold text-white">Open Developer Platform</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Over 30+ tools spanning JSON converters, cryptography, networking, regex, AST auditing, and multi-ORM schema mappers.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Team & Contact Section */}
      <Card className="border border-white/10 bg-[#16213e]/60">
        <CardContent className="p-6 md:p-8 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Heart className="size-4 text-rose-400" /> Made for the Global Developer Community
          </h2>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            We continuously maintain, benchmark, and update DevKit. If you have feature requests, tool ideas, or security questions, feel free to contact us:
          </p>
          <div className="flex items-center gap-3 pt-2">
            <a
              href="mailto:contact@dev-kit.tech"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors shadow-md"
            >
              <Mail className="size-3.5" />
              <span>contact@dev-kit.tech</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
