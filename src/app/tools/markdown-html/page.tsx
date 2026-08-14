import type { Metadata } from 'next'
import MarkdownHtmlConverter from '@/components/tools/MarkdownHtmlConverter'
import PixCoffee from '@/components/PixCoffee'

export const metadata: Metadata = {
  title: 'Markdown ↔ HTML Converter Online — Fast, 100% Client-Side & Private',
  description:
    'Free & 100% private online Markdown ↔ HTML converter. Convert Markdown to HTML or HTML to Markdown instantly in your browser with live visual preview and zero server uploads.',
  keywords: [
    'markdown to html',
    'html to markdown',
    'convert markdown to html free',
    'markdown html converter online',
    'gfm to html',
    'turndown html to markdown',
    'client-side markdown converter',
    'private markdown converter',
  ],
  openGraph: {
    title: 'Markdown ↔ HTML Converter — Fast, 100% Client-Side & Private',
    description:
      'Convert Markdown to HTML or HTML to Markdown instantly in your browser. 100% private — your data never leaves your device.',
    url: 'https://dev-kit.tech/tools/markdown-html',
    siteName: 'dev-kit.tech',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Markdown ↔ HTML Converter — Fast, 100% Client-Side & Private',
    description:
      'Convert Markdown to HTML or HTML to Markdown instantly in your browser. 100% private — your data never leaves your device.',
    images: ['/og-image.svg'],
  },
}

export default function MarkdownHtmlPage() {
  return (
    <div className="py-8">
      <MarkdownHtmlConverter />
      <PixCoffee />
    </div>
  )
}
