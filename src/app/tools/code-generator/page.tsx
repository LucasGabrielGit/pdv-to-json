import type { Metadata } from 'next'
import CodeGenerator from '@/components/tools/CodeGenerator'
import PixCoffee from '@/components/PixCoffee'

export const metadata: Metadata = {
  title: 'AI Code & SQL Generator — Fast, Production-Ready Code from Prompts',
  description:
    'Free online AI Code and SQL Generator. Describe what you need in plain English to generate production-ready functions, SQL queries, TypeScript interfaces, or Regex patterns.',
  keywords: [
    'ai code generator',
    'ai sql generator',
    'prompt to code online',
    'typescript interface generator ai',
    'regex generator ai',
    'gemini code generator',
  ],
  openGraph: {
    title: 'AI Code & SQL Generator — Fast, Production-Ready Code from Prompts',
    description:
      'Describe what you need in plain English and let AI generate clean, production-ready code and SQL queries.',
    url: 'https://dev-kit.tech/tools/code-generator',
    siteName: 'dev-kit.tech',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Code & SQL Generator — Fast, Production-Ready Code from Prompts',
    description:
      'Describe what you need in plain English and let AI generate clean, production-ready code and SQL queries.',
    images: ['/og-image.svg'],
  },
}

export default function CodeGeneratorPage() {
  return (
    <div className="py-8">
      <CodeGenerator />
      <PixCoffee />
    </div>
  )
}
