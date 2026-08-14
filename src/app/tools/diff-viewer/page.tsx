import type { Metadata } from 'next'
import DiffViewer from '@/components/tools/DiffViewer'
import PixCoffee from '@/components/PixCoffee'

export const metadata: Metadata = {
  title: 'Diff Viewer & Text Comparator Online — Fast, 100% Client-Side & Private',
  description:
    'Free & 100% private online Diff Viewer. Compare two text or code snippets side-by-side with line, word, and JSON difference highlighting. Download patch files with zero server uploads.',
  keywords: [
    'diff viewer',
    'text comparator online',
    'code diff checker',
    'split view diff tool',
    'compare json diff free',
    'download patch file online',
    'client-side diff viewer',
    'private text diff tool',
  ],
  openGraph: {
    title: 'Diff Viewer & Text Comparator — Fast, 100% Client-Side & Private',
    description:
      'Compare two text or code snippets side-by-side instantly in your browser. 100% private — your data never leaves your device.',
    url: 'https://dev-kit.tech/tools/diff-viewer',
    siteName: 'dev-kit.tech',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Diff Viewer & Text Comparator — Fast, 100% Client-Side & Private',
    description:
      'Compare two text or code snippets side-by-side instantly in your browser. 100% private — your data never leaves your device.',
    images: ['/og-image.svg'],
  },
}

export default function DiffViewerPage() {
  return (
    <div className="py-8">
      <DiffViewer />
      <PixCoffee />
    </div>
  )
}
