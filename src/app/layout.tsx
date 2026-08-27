import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { AppShell } from '@/components/layout/AppShell'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { AdSenseScript } from '@/components/AdSenseScript'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://dev-kit.tech'),
  title: {
    default: 'dev-kit.tech — Free Developer Tools, 100% Client-Side & Private',
    template: '%s | dev-kit.tech',
  },
  description:
    'Free, browser-based developer tools. Convert JSON to CSV, YAML, Base64, Images, test Regex, decode JWT, and more — all 100% client-side. Your data never leaves your device.',
  keywords: [
    'developer tools',
    'json converter',
    'csv converter',
    'yaml converter',
    'image converter',
    'base64',
    'regex tester',
    'jwt decoder',
    'client-side',
    'privacy',
    'free online tools',
  ],
  authors: [{ name: 'Lucas Gabriel' }],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    siteName: 'dev-kit.tech',
    title: 'dev-kit.tech — Free Developer Tools, 100% Client-Side & Private',
    description:
      'Free, browser-based developer tools. Convert JSON to CSV, test Regex, decode JWT — all processed locally in your browser.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'dev-kit.tech — Free Developer Tools',
    description:
      'Free, browser-based developer tools. 100% client-side. Your data never leaves your device.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <AdSenseScript />
      </head>
      <body>
        {/* Structured Data (Schema.org WebSite & Organization) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'dev-kit.tech',
              url: 'https://dev-kit.tech',
              description:
                'Free & 100% private client-side developer tools platform.',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://dev-kit.tech/search?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />

        <AppShell>{children}</AppShell>
        <SpeedInsights />
      </body>
    </html>
  )
}

