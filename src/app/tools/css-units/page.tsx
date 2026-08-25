import type { Metadata } from 'next'
import CssUnitConverter from '@/components/tools/CssUnitConverter'
import PixCoffee from '@/components/PixCoffee'

export const metadata: Metadata = {
  title: 'CSS Unit & Fluid Typography Converter — PX, REM, clamp() & Tailwind',
  description:
    'Free & private online CSS Unit converter and Fluid Typography clamp() generator. Convert px to rem, calculate responsive clamp formulas, and copy Tailwind CSS arbitrary classes.',
  keywords: [
    'css unit converter',
    'px to rem',
    'rem to px',
    'fluid typography calculator',
    'css clamp generator',
    'responsive typography clamp',
    'tailwind clamp',
    'viewport units vw vh',
  ],
  openGraph: {
    title: 'CSS Unit & Fluid Typography Converter — PX, REM, clamp()',
    description:
      'Convert PX to REM and generate responsive CSS clamp() formulas with live viewport simulation and Tailwind classes.',
    url: 'https://pdv-to-json.vercel.app/tools/css-units',
    siteName: 'dev-kit.tech',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CSS Unit & Fluid Typography clamp() Generator',
    description:
      'Convert PX to REM and generate responsive CSS clamp() formulas with live viewport simulation.',
    images: ['/og-image.svg'],
  },
}

export default function CssUnitsPage() {
  return (
    <div className="py-8">
      <CssUnitConverter />
      <PixCoffee />
    </div>
  )
}
