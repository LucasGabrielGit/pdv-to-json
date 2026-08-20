import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck, Lock, Eye, Database, Globe, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Learn how dev-kit.tech protects your privacy with 100% client-side data processing and transparent data practices.',
  alternates: {
    canonical: 'https://dev-kit.tech/privacy',
  },
}

export default function PrivacyPage() {
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <ShieldCheck className="size-3.5" />
          <span>100% Client-Side Privacy Guarantee</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-400">
          Last Updated: <span className="text-slate-200">{lastUpdated}</span>
        </p>
      </div>

      {/* Key Highlight Banner */}
      <Card className="border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-md">
        <CardContent className="p-6 space-y-2">
          <h2 className="text-base font-bold text-emerald-300 flex items-center gap-2">
            <Lock className="size-4" /> Zero Server Storage for Your Data &amp; Files
          </h2>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            At <strong>dev-kit.tech</strong>, your code, JSON files, CSV datasets, cryptographic keys, JWT tokens, and images are processed <strong>100% locally in your browser</strong> using client-side JavaScript. We never upload, inspect, log, or store the contents of what you convert or debug.
          </p>
        </CardContent>
      </Card>

      {/* Main Content Sections */}
      <div className="space-y-8 text-sm text-slate-300 leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Eye className="size-4 text-purple-400" /> 1. Information We Collect
          </h2>
          <p>
            We adhere to strict data minimization principles:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li>
              <strong className="text-white">Account Information (Optional):</strong> If you choose to authenticate via Google, GitHub, or Magic Link, we collect your email address and profile avatar URL via Supabase Auth solely to manage your account session and cloud credits.
            </li>
            <li>
              <strong className="text-white">Local Storage Data:</strong> We store user preferences, custom Gemini API keys (BYOK), and local credit counts on your device's browser <code>localStorage</code>.
            </li>
            <li>
              <strong className="text-white">Anonymous Telemetry:</strong> Standard non-identifiable web traffic metrics (e.g., page views, approximate country) via Vercel Web Analytics to ensure service reliability.
            </li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Database className="size-4 text-cyan-400" /> 2. AI Services &amp; Third-Party Processing
          </h2>
          <p>
            When utilizing AI-assisted utilities (such as the <em>AI Code Reviewer</em> or <em>AI Code Generator</em>):
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li>
              Code snippets or prompts you explicitly submit for AI analysis are transmitted directly to the <strong>Google Gemini API</strong> for processing in real time.
            </li>
            <li>
              Your snippets are not retained by dev-kit.tech after the API response is generated.
            </li>
            <li>
              If you provide your own Gemini API Key (Bring Your Own Key), it is stored only in your local browser and sent directly in the header of your requests.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Globe className="size-4 text-amber-400" /> 3. Advertising &amp; Cookies (Google AdSense)
          </h2>
          <p>
            We use Google AdSense to serve advertisements on dev-kit.tech to keep our developer tools 100% free.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li>
              Third-party vendors, including Google, use cookies to serve ads based on prior visits to our website or other websites.
            </li>
            <li>
              You may opt out of personalized advertising by visiting{' '}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noreferrer"
                className="text-purple-400 hover:underline font-semibold"
              >
                Google Ads Settings
              </a>
              .
            </li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">4. Your Rights (GDPR / CCPA / LGPD)</h2>
          <p>
            You have the right to request deletion of your account and associated authentication profile data at any time. Since conversion files never hit our servers, there is no file data retention to delete.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">5. Contact Us</h2>
          <p>
            If you have questions regarding this Privacy Policy or data protection, please contact us at:
          </p>
          <p className="font-mono text-purple-300 bg-black/40 p-3 rounded-xl border border-purple-500/20 w-fit">
            support@dev-kit.tech
          </p>
        </section>
      </div>
    </div>
  )
}
