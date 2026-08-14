import type { Metadata } from 'next'
import JsonFormatter from '@/components/tools/JsonFormatter'
import PixCoffee from '@/components/PixCoffee'

export const metadata: Metadata = {
  title: 'JSON Formatter & Validator Online — Fast, 100% Client-Side & Private',
  description:
    'Free & 100% private online JSON Formatter and Validator. Format, pretty print, minify, and fix JSON syntax errors with line & column diagnostic error checking. Zero server uploads.',
  keywords: [
    'json formatter',
    'json validator',
    'minify json',
    'pretty print json',
    'json lint online',
    'fix json syntax error',
    'client-side json formatter',
    'private json validator',
  ],
  openGraph: {
    title: 'JSON Formatter & Validator — Fast, 100% Client-Side & Private',
    description:
      'Format, validate, minify, and fix JSON syntax errors instantly in your browser. 100% private — your data never leaves your device.',
    url: 'https://dev-kit.tech/tools/json-formatter',
    siteName: 'dev-kit.tech',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JSON Formatter & Validator — Fast, 100% Client-Side & Private',
    description:
      'Format, validate, minify, and fix JSON syntax errors instantly in your browser. 100% private — your data never leaves your device.',
    images: ['/og-image.svg'],
  },
}

export default function JsonFormatterPage() {
  return (
    <div className="py-8">
      <JsonFormatter />
      <PixCoffee />
    </div>
  )
}
