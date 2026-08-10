import type { Metadata } from 'next'
import JsonYamlConverter from '@/components/tools/JsonYamlConverter'
import PixCoffee from '@/components/PixCoffee'

export const metadata: Metadata = {
  title: 'JSON ↔ YAML Converter Online — Fast, 100% Client-Side & Private',
  description:
    'Free & 100% private online JSON ↔ YAML converter. Convert JSON to YAML or YAML to JSON instantly in your browser. Supports custom indentation and key sorting with zero server uploads.',
  keywords: [
    'json to yaml',
    'yaml to json',
    'convert json to yaml free',
    'json to yaml online',
    'yaml converter client-side',
    'yaml to json online',
    'format yaml online',
    'private yaml converter',
  ],
  openGraph: {
    title: 'JSON ↔ YAML Converter — Fast, 100% Client-Side & Private',
    description:
      'Convert JSON to YAML or YAML to JSON instantly in your browser. 100% private — your data never leaves your device.',
    url: 'https://pdv-to-json.vercel.app/tools/json-yaml',
    siteName: 'dev-kit.tech',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JSON ↔ YAML Converter — Fast, 100% Client-Side & Private',
    description:
      'Convert JSON to YAML or YAML to JSON instantly in your browser. 100% private — your data never leaves your device.',
    images: ['/og-image.svg'],
  },
}

export default function JsonYamlPage() {
  return (
    <div className="py-8">
      <JsonYamlConverter />
      <PixCoffee />
    </div>
  )
}
