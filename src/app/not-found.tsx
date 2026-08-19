import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function NotFound() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-24 text-center space-y-6">
      <div className="inline-flex size-20 items-center justify-center rounded-3xl bg-purple-500/10 border border-purple-500/30 text-purple-400 font-mono text-3xl font-extrabold shadow-2xl shadow-purple-900/30 mb-2">
        404
      </div>

      <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
        Tool or Page Not Found
      </h1>

      <p className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
        The tool or page you are looking for does not exist or has been moved.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: 'default' }),
            'bg-purple-600 hover:bg-purple-500 text-white font-semibold gap-2 rounded-xl px-5 py-2.5 h-auto'
          )}
        >
          <ArrowLeft className="size-4" />
          Back to Home
        </Link>

        <Link
          href="/search"
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'border-purple-500/30 text-purple-300 hover:bg-purple-500/10 gap-2 rounded-xl px-5 py-2.5 h-auto'
          )}
        >
          <Search className="size-4" />
          Search All Tools
        </Link>
      </div>
    </div>
  )
}
