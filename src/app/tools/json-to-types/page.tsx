import { Metadata } from 'next'
import JsonToTypesConverter from '@/components/tools/JsonToTypesConverter'

export const metadata: Metadata = {
  title: 'JSON to TypeScript, Zod, Pydantic & Go Structs | DevKit',
  description:
    'Free client-side tool to convert JSON objects & REST API responses into TypeScript Interfaces, Zod Validation Schemas, Python Pydantic Models, and Go Structs.',
  keywords: [
    'json to typescript',
    'json to zod',
    'json to pydantic',
    'json to go struct',
    'json to interface',
    'generate zod schema from json',
    'developer tools',
  ],
  openGraph: {
    title: 'JSON to TypeScript, Zod, Pydantic & Go Structs | DevKit',
    description:
      'Transform arbitrary JSON payloads into strongly typed TypeScript Interfaces, Zod schemas, Python Pydantic models, and Go structs in seconds.',
    type: 'website',
  },
}

export default function JsonToTypesPage() {
  return <JsonToTypesConverter />
}
