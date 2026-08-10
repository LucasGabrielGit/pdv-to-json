import type { Metadata } from 'next'
import Converter from '@/components/Converter'
import PixCoffee from '@/components/PixCoffee'

export const metadata: Metadata = {
  title: 'JSON ↔ CSV Converter Online — Fast, 100% Client-Side & Private',
  description:
    'Free & 100% private online JSON ↔ CSV converter. Convert JSON to CSV or CSV to JSON instantly in your browser with zero server uploads. Supports nested object flattening, type casting, and instant download.',
  keywords: [
    'json to csv',
    'csv to json',
    'convert json to csv free',
    'convert large json to csv',
    'json to excel online',
    'client-side json converter',
    'nested json to csv',
    'private csv converter',
  ],
  openGraph: {
    title: 'JSON ↔ CSV Converter — Fast, 100% Client-Side & Private',
    description:
      'Convert JSON to CSV or CSV to JSON instantly in your browser. 100% private — your data never leaves your device. Features nested object flattening and smart type casting.',
    url: 'https://pdv-to-json.vercel.app/tools/json-csv',
    siteName: 'devkit.io',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JSON ↔ CSV Converter — Fast, 100% Client-Side & Private',
    description:
      'Convert JSON to CSV or CSV to JSON instantly in your browser. 100% private — your data never leaves your device.',
    images: ['/og-image.svg'],
  },
}

export default function JsonCsvPage() {
  return (
    <div className="py-8">
      <Converter />
      <PixCoffee />
    </div>
  )
}
