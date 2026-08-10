import {
  FileJson,
  FileCode,
  Binary,
  Image,
  Hash,
  Key,
  Regex,
  Clock,
  Diff,
  Fingerprint,
  Palette,
  Calendar,
  FileText,
  BrainCircuit,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'

export type ToolCategory = 'converters' | 'utilities' | 'ai'
export type ToolStatus = 'active' | 'coming-soon'

export interface Tool {
  id: string
  name: string
  description: string
  href: string
  icon: LucideIcon
  category: ToolCategory
  status: ToolStatus
  keywords: string[]
}

export interface ToolCategoryInfo {
  id: ToolCategory
  label: string
  emoji: string
}

export const categories: ToolCategoryInfo[] = [
  { id: 'converters', label: 'Converters', emoji: '🔄' },
  { id: 'utilities', label: 'Utilities', emoji: '🛠️' },
  { id: 'ai', label: 'AI-Powered', emoji: '⚡' },
]

export const tools: Tool[] = [
  // ── Converters ──
  {
    id: 'json-csv',
    name: 'JSON ↔ CSV',
    description: 'Convert JSON to CSV or CSV to JSON instantly with nested object flattening.',
    href: '/tools/json-csv',
    icon: FileJson,
    category: 'converters',
    status: 'active',
    keywords: ['json', 'csv', 'converter', 'spreadsheet', 'excel'],
  },
  {
    id: 'json-yaml',
    name: 'JSON ↔ YAML',
    description: 'Convert between JSON and YAML formats with proper indentation.',
    href: '/tools/json-yaml',
    icon: FileCode,
    category: 'converters',
    status: 'coming-soon',
    keywords: ['json', 'yaml', 'yml', 'converter', 'config'],
  },
  {
    id: 'base64',
    name: 'Base64 Encode/Decode',
    description: 'Encode or decode Base64 strings instantly in your browser.',
    href: '/tools/base64',
    icon: Binary,
    category: 'converters',
    status: 'coming-soon',
    keywords: ['base64', 'encode', 'decode', 'binary'],
  },
  {
    id: 'image-converter',
    name: 'Image Converter',
    description: 'Convert between PNG, JPEG, and WebP formats client-side.',
    href: '/tools/image-converter',
    icon: Image,
    category: 'converters',
    status: 'coming-soon',
    keywords: ['png', 'jpeg', 'webp', 'image', 'converter'],
  },
  {
    id: 'markdown-html',
    name: 'Markdown ↔ HTML',
    description: 'Convert Markdown to HTML or HTML to Markdown with live preview.',
    href: '/tools/markdown-html',
    icon: FileText,
    category: 'converters',
    status: 'coming-soon',
    keywords: ['markdown', 'html', 'converter', 'preview'],
  },

  // ── Utilities ──
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Validate, format, and minify JSON with syntax highlighting.',
    href: '/tools/json-formatter',
    icon: FileJson,
    category: 'utilities',
    status: 'coming-soon',
    keywords: ['json', 'format', 'validate', 'minify', 'prettify'],
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    description: 'Test regular expressions with real-time highlighting and capture groups.',
    href: '/tools/regex-tester',
    icon: Regex,
    category: 'utilities',
    status: 'coming-soon',
    keywords: ['regex', 'regular expression', 'test', 'match', 'pattern'],
  },
  {
    id: 'jwt-decoder',
    name: 'JWT Decoder',
    description: 'Decode JWT tokens and inspect header, payload, and expiration.',
    href: '/tools/jwt-decoder',
    icon: Key,
    category: 'utilities',
    status: 'coming-soon',
    keywords: ['jwt', 'token', 'decode', 'auth', 'bearer'],
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    description: 'Generate MD5, SHA-1, SHA-256, SHA-512 hashes from text or files.',
    href: '/tools/hash-generator',
    icon: Hash,
    category: 'utilities',
    status: 'coming-soon',
    keywords: ['hash', 'md5', 'sha', 'sha256', 'checksum'],
  },
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Generate UUID v4/v7 and ULID identifiers with one click.',
    href: '/tools/uuid-generator',
    icon: Fingerprint,
    category: 'utilities',
    status: 'coming-soon',
    keywords: ['uuid', 'ulid', 'generate', 'unique id'],
  },
  {
    id: 'diff-viewer',
    name: 'Diff Viewer',
    description: 'Compare two texts or code snippets side by side with highlighting.',
    href: '/tools/diff-viewer',
    icon: Diff,
    category: 'utilities',
    status: 'coming-soon',
    keywords: ['diff', 'compare', 'text', 'code', 'merge'],
  },
  {
    id: 'timestamp-converter',
    name: 'Timestamp Converter',
    description: 'Convert between Unix timestamps, ISO 8601, and relative dates.',
    href: '/tools/timestamp-converter',
    icon: Clock,
    category: 'utilities',
    status: 'coming-soon',
    keywords: ['timestamp', 'unix', 'epoch', 'iso', 'date'],
  },
  {
    id: 'color-palette',
    name: 'Color Palette',
    description: 'Generate harmonious palettes and convert between HEX, RGB, HSL, Oklch.',
    href: '/tools/color-palette',
    icon: Palette,
    category: 'utilities',
    status: 'coming-soon',
    keywords: ['color', 'palette', 'hex', 'rgb', 'hsl', 'oklch'],
  },
  {
    id: 'cron-builder',
    name: 'Cron Builder',
    description: 'Build cron expressions visually with preview of next executions.',
    href: '/tools/cron-builder',
    icon: Calendar,
    category: 'utilities',
    status: 'coming-soon',
    keywords: ['cron', 'schedule', 'job', 'expression', 'crontab'],
  },

  // ── AI-Powered ──
  {
    id: 'code-analyzer',
    name: 'Code Analyzer',
    description: 'Paste code and get AI-powered quality analysis, suggestions, and security tips.',
    href: '/tools/code-analyzer',
    icon: BrainCircuit,
    category: 'ai',
    status: 'coming-soon',
    keywords: ['code', 'analyze', 'ai', 'lint', 'review', 'quality'],
  },
  {
    id: 'code-generator',
    name: 'Code Generator',
    description: 'Describe what you need and get AI-generated code with explanations.',
    href: '/tools/code-generator',
    icon: Sparkles,
    category: 'ai',
    status: 'coming-soon',
    keywords: ['code', 'generate', 'ai', 'prompt', 'create'],
  },
]

/** Get tools filtered by category */
export function getToolsByCategory(category: ToolCategory): Tool[] {
  return tools.filter((t) => t.category === category)
}

/** Get only active tools */
export function getActiveTools(): Tool[] {
  return tools.filter((t) => t.status === 'active')
}

/** Search tools by keyword */
export function searchTools(query: string): Tool[] {
  const q = query.toLowerCase().trim()
  if (!q) return tools
  return tools.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.keywords.some((k) => k.includes(q))
  )
}
