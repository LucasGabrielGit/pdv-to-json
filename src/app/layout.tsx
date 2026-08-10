import type { Metadata } from 'next'
import { AppShell } from '@/components/layout/AppShell'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://pdv-to-json.vercel.app'),
  title: {
    default: 'devkit.io — Free Developer Tools, 100% Client-Side & Private',
    template: '%s | devkit.io',
  },
  description:
    'Free, browser-based developer tools. Convert JSON to CSV, YAML, Base64, test Regex, decode JWT, and more — all 100% client-side. Your data never leaves your device.',
  keywords: [
    'developer tools',
    'json converter',
    'csv converter',
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
    siteName: 'devkit.io',
    title: 'devkit.io — Free Developer Tools, 100% Client-Side & Private',
    description:
      'Free, browser-based developer tools. Convert JSON to CSV, test Regex, decode JWT — all processed locally in your browser.',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'devkit.io — Free Developer Tools',
    description:
      'Free, browser-based developer tools. 100% client-side. Your data never leaves your device.',
    images: ['/og-image.svg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <AppShell>{children}</AppShell>

        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6240733470750177"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        {/* Structured Data */}
        <Script
          id="schema-org"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'devkit.io',
              url: 'https://devkit.io',
              description:
                'Free, browser-based developer tools platform with JSON/CSV conversion, regex testing, JWT decoding and more — all 100% client-side.',
              applicationCategory: 'DeveloperApplication',
              operatingSystem: 'All',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              featureList: [
                'Bidirectional JSON to CSV & CSV to JSON conversion',
                '100% Client-side local data processing',
                'Nested object dot-notation flattening',
                'Type casting and custom delimiters',
                'One-click CSV & JSON file downloads',
              ],
            }),
          }}
        />
      </body>
    </html>
  )
}
