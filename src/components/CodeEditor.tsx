'use client'

import React from 'react'
import Editor from '@monaco-editor/react'
import { Loader2 } from 'lucide-react'

interface CodeEditorProps {
  value: string
  onChange?: (value: string | undefined) => void
  language?: string
  height?: string
  readOnly?: boolean
  className?: string
  placeholder?: string
}


export default function CodeEditor({
  value,
  onChange,
  language = 'typescript',
  height = '240px',
  readOnly = false,
  className = '',
}: CodeEditorProps) {
  const normalizedLanguage = useMemoLanguage(language)

  return (
    <div
      className={`rounded-2xl overflow-hidden border border-purple-500/30 bg-[#0d1527] shadow-xl ${className}`}
    >
      <Editor
        height={height}
        language={normalizedLanguage}
        value={value}
        onChange={onChange}
        theme="vs-dark"
        loading={
          <div className="flex items-center justify-center h-full text-slate-400 gap-2 text-xs">
            <Loader2 className="size-4 animate-spin text-purple-400" />
            <span>Loading Code Editor...</span>
          </div>
        }
        options={{
          readOnly,
          fontSize: 13,
          fontFamily: "'Fira Code', 'JetBrains Mono', Menlo, Monaco, Consolas, monospace",
          fontLigatures: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          padding: { top: 12, bottom: 12 },
          renderLineHighlight: 'all',
          cursorBlinking: 'smooth',
          smoothScrolling: true,
        }}
      />
    </div>
  )
}

function useMemoLanguage(lang: string): string {
  const lower = (lang || '').toLowerCase()
  if (lower === 'csharp' || lower === 'c#') return 'csharp'
  if (lower === 'js') return 'javascript'
  if (lower === 'ts') return 'typescript'
  if (lower === 'py') return 'python'
  return lower
}
