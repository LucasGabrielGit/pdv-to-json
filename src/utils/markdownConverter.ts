import { marked } from 'marked'
import TurndownService from 'turndown'

export interface MarkdownOptions {
  gfm?: boolean
  fullDocument?: boolean
}

export interface MarkdownConversionResult {
  output: string
  lineCount: number
  charCount: number
  renderedHtml?: string
}

// Initialize Turndown service with GitHub Flavored Markdown style rules
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emDelimiter: '_',
  strongDelimiter: '**',
})

/**
 * Converts Markdown string to HTML string
 */
export function markdownToHtml(
  markdownText: string,
  options: MarkdownOptions = {}
): MarkdownConversionResult {
  const { gfm = true, fullDocument = false } = options

  if (!markdownText.trim()) {
    return { output: '', lineCount: 0, charCount: 0, renderedHtml: '' }
  }

  // Configure marked options
  marked.setOptions({
    gfm,
    breaks: true,
  })

  let rawHtml = marked.parse(markdownText) as string

  if (fullDocument) {
    rawHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Converted Document</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #333; }
    code { background: #f4f4f5; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
    pre { background: #18181b; color: #f4f4f5; padding: 16px; border-radius: 8px; overflow-x: auto; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 4px solid #7c3aed; margin: 0; padding-left: 16px; color: #666; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { border: 1px solid #e4e4e7; padding: 8px 12px; text-align: left; }
    th { background: #f4f4f5; }
  </style>
</head>
<body>
${rawHtml}
</body>
</html>`
  }

  return {
    output: rawHtml,
    lineCount: rawHtml.trim().split('\n').length,
    charCount: rawHtml.length,
    renderedHtml: marked.parse(markdownText) as string,
  }
}

/**
 * Converts HTML string to Markdown string
 */
export function htmlToMarkdown(htmlText: string): MarkdownConversionResult {
  if (!htmlText.trim()) {
    return { output: '', lineCount: 0, charCount: 0, renderedHtml: '' }
  }

  let markdownOutput = ''
  try {
    markdownOutput = turndownService.turndown(htmlText)
  } catch (err) {
    throw new Error(`Invalid HTML input: ${(err as Error).message}`)
  }

  return {
    output: markdownOutput,
    lineCount: markdownOutput.trim().split('\n').length,
    charCount: markdownOutput.length,
    renderedHtml: htmlText,
  }
}
