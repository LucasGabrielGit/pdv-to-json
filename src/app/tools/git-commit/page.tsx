import type { Metadata } from 'next'
import GitCommitGenerator from '@/components/tools/GitCommitGenerator'
import PixCoffee from '@/components/PixCoffee'

export const metadata: Metadata = {
  title: 'AI Git Commit & PR Generator — Conventional Commits & Gitmoji',
  description:
    'Free AI Git Commit and Pull Request description generator. Paste your git diff or change notes and generate Conventional Commits (feat, fix, refactor) and PR templates in seconds.',
  keywords: [
    'ai git commit generator',
    'conventional commits generator',
    'git diff to commit message',
    'pull request description generator',
    'gitmoji generator',
    'ai developer tools',
    'git commit message writer',
  ],
  openGraph: {
    title: 'AI Git Commit & PR Generator — Fast & Automated',
    description:
      'Generate Conventional Commits messages and Pull Request markdown descriptions from git diffs in seconds.',
    url: 'https://pdv-to-json.vercel.app/tools/git-commit',
    siteName: 'dev-kit.tech',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Git Commit & PR Generator',
    description:
      'Generate Conventional Commits messages and Pull Request descriptions from git diffs.',
    images: ['/og-image.svg'],
  },
}

export default function GitCommitPage() {
  return (
    <div className="py-8">
      <GitCommitGenerator />
      <PixCoffee />
    </div>
  )
}
