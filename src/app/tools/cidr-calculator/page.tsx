import type { Metadata } from 'next'
import CidrCalculator from '@/components/tools/CidrCalculator'
import PixCoffee from '@/components/PixCoffee'

export const metadata: Metadata = {
  title: 'CIDR & Subnet IP Calculator — IPv4 Network, Usable Hosts & Masks',
  description:
    'Free & private online CIDR Subnet Calculator. Calculate IPv4 subnet masks, usable host ranges, broadcast addresses, wildcard masks, and binary network breakdowns.',
  keywords: [
    'cidr calculator',
    'ip subnet calculator',
    'ipv4 subnetting',
    'subnet mask calculator',
    'cidr to ip range',
    'network broadcast address',
    'wildcard mask calculator',
    'usable hosts calculator',
  ],
  openGraph: {
    title: 'CIDR & Subnet IP Calculator — Fast & Private Network Tool',
    description:
      'Calculate IPv4 subnet masks, usable host IP ranges, broadcast addresses, wildcard masks, and binary network representations.',
    url: 'https://pdv-to-json.vercel.app/tools/cidr-calculator',
    siteName: 'dev-kit.tech',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CIDR & Subnet IP Calculator',
    description:
      'Calculate IPv4 subnet masks, usable host IP ranges, broadcast addresses, and binary network representations.',
    images: ['/og-image.svg'],
  },
}

export default function CidrCalculatorPage() {
  return (
    <div className="py-8">
      <CidrCalculator />
      <PixCoffee />
    </div>
  )
}
