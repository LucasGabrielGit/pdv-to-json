import type { Metadata } from 'next'
import AiRegexTool from '@/components/tools/AiRegexTool'
import PixCoffee from '@/components/PixCoffee'

export const metadata: Metadata = {
  title: 'AI Regex Explainer & Builder — Natural Language Regular Expressions',
  description:
    'Free AI Regex generator and explainer. Convert plain English or Portuguese prompts into bulletproof Regular Expressions, or explain cryptic regex patterns token by token with ReDoS security checks.',
  keywords: [
    'ai regex generator',
    'ai regex explainer',
    'natural language to regex',
    'regular expression visualizer',
    'regex tester with ai',
    'redos checker',
    'regex cheat sheet',
  ],
  openGraph: {
    title: 'AI Regex Explainer & Builder — Free AI Regex Tool',
    description:
      'Generate bulletproof Regular Expressions from plain text descriptions or break down complex patterns token by token.',
    url: 'https://pdv-to-json.vercel.app/tools/ai-regex',
    siteName: 'dev-kit.tech',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Regex Explainer & Builder',
    description:
      'Generate Regular Expressions from plain text prompts or explain complex patterns with AI.',
    images: ['/og-image.svg'],
  },
}

export default function AiRegexPage() {
  return (
    <div className="py-8">
      <AiRegexTool />
      <PixCoffee />
    </div>
  )
}
