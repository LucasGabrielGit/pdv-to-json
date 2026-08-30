import type { Metadata } from 'next'
import GitignoreGenerator from '@/components/tools/GitignoreGenerator'

export const metadata: Metadata = {
  title: 'Config & .gitignore Generator — Multi-Stack, robots.txt & Dockerfile',
  description:
    'Generate tailored .gitignore files for Next.js, Node, Python, Go, Rust, macOS, and VSCode. Includes instant robots.txt and multi-stage Dockerfile starters.',
  alternates: {
    canonical: 'https://dev-kit.tech/tools/gitignore-generator',
  },
}

export default function GitignoreGeneratorPage() {
  return <GitignoreGenerator />
}
