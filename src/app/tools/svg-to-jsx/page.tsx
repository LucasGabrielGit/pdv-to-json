import type { Metadata } from 'next'
import SvgToJsxConverter from '@/components/tools/SvgToJsxConverter'

export const metadata: Metadata = {
  title: 'SVG to JSX / React Component Converter',
  description:
    'Convert raw SVG code or icons into clean, TypeScript React (TSX/JSX) components with props forwarding, fill/stroke color control, and zero dependencies.',
  alternates: {
    canonical: 'https://dev-kit.tech/tools/svg-to-jsx',
  },
}

export default function SvgToJsxPage() {
  return <SvgToJsxConverter />
}
