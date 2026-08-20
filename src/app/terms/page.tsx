import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Terms and conditions for utilizing dev-kit.tech free developer utilities and AI tools.',
  alternates: {
    canonical: 'https://dev-kit.tech/terms',
  },
}

export default function TermsPage() {
  const lastUpdated = 'August 20, 2026'

  return (
    <div className="min-h-screen py-10 px-4 md:px-8 max-w-4xl mx-auto space-y-8">
      {/* Breadcrumb & Navigation */}
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
          <FileText className="size-3.5" />
          <span>User Agreement</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
          Terms of Service
        </h1>
        <p className="text-sm text-slate-400">
          Last Updated: <span className="text-slate-200">{lastUpdated}</span>
        </p>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-8 text-sm text-slate-300 leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="size-4 text-purple-400" /> 1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using <strong>dev-kit.tech</strong>, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="size-4 text-cyan-400" /> 2. Use of Services &amp; Intellectual Property
          </h2>
          <p>
            dev-kit.tech provides browser-based developer utilities including formatters, converters, analyzers, and generators.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li>
              <strong className="text-white">Your Content:</strong> You retain 100% full ownership of any code, data, JSON, CSV, or text inputs you format or convert using our tools.
            </li>
            <li>
              <strong className="text-white">Fair Usage:</strong> You agree not to misuse our platform through automated scraping or denial-of-service attempts.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertCircle className="size-4 text-amber-400" /> 3. Disclaimer of Warranties
          </h2>
          <p>
            The services and all tools on dev-kit.tech are provided on an <strong>&ldquo;AS IS&rdquo;</strong> and <strong>&ldquo;AS AVAILABLE&rdquo;</strong> basis without warranties of any kind, either express or implied.
          </p>
          <p>
            While we strive for 100% accuracy in our syntax parsers, converters, and algorithms, dev-kit.tech is not liable for data loss, code discrepancies, or system failures resulting from the use of generated outputs.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">4. Bring Your Own Key (BYOK)</h2>
          <p>
            When entering your own Google Gemini API Key in AI-powered tools, you are responsible for maintaining the confidentiality of your key and any associated API costs incurred under your Google Cloud billing account.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">5. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms of Service at any time. Changes will take effect immediately upon posting to this page.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">6. Contact Information</h2>
          <p>
            For questions regarding these Terms, contact us at:
          </p>
          <p className="font-mono text-purple-300 bg-black/40 p-3 rounded-xl border border-purple-500/20 w-fit">
            support@dev-kit.tech
          </p>
        </section>
      </div>
    </div>
  )
}
