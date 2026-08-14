import type { Metadata } from 'next'
import RegexTester from '@/components/tools/RegexTester'
import PixCoffee from '@/components/PixCoffee'

export const metadata: Metadata = {
  title: 'Regex Tester & Debugger Online — Fast, 100% Client-Side & Private',
  description:
    'Free & 100% private online Regex Tester & Debugger. Test, debug, and replace regular expressions with match highlighting, capture group extraction, and preset cheat sheets. Zero server uploads.',
  keywords: [
    'regex tester',
    'regex debugger',
    'regular expression tester',
    'test regex online',
    'regex highlight matches',
    'regex cheat sheet',
    'client-side regex tester',
    'private regex debugger',
  ],
  openGraph: {
    title: 'Regex Tester & Debugger — Fast, 100% Client-Side & Private',
    description:
      'Test, debug, and replace regular expressions instantly in your browser. 100% private — your data never leaves your device.',
    url: 'https://dev-kit.tech/tools/regex-tester',
    siteName: 'dev-kit.tech',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Regex Tester & Debugger — Fast, 100% Client-Side & Private',
    description:
      'Test, debug, and replace regular expressions instantly in your browser. 100% private — your data never leaves your device.',
    images: ['/og-image.svg'],
  },
}

export default function RegexTesterPage() {
  return (
    <div className="py-8">
      <RegexTester />
      <PixCoffee />
    </div>
  )
}
