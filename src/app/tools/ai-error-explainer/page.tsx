import type { Metadata } from 'next'
import AiErrorExplainer from '@/components/tools/AiErrorExplainer'

export const metadata: Metadata = {
  title: 'AI Error & Stack Trace Explainer — Root Cause & Instant Code Fix',
  description:
    'Paste any compiler error, runtime exception, or stack trace. Get instant root cause breakdown in Portuguese, copyable code fixes, and prevention tips powered by AI.',
  alternates: {
    canonical: 'https://dev-kit.tech/tools/ai-error-explainer',
  },
}

export default function AiErrorExplainerPage() {
  return <AiErrorExplainer />
}
