'use client'

import React, { useCallback, useRef, useState } from 'react'

export type DropZoneFileType =
  | 'image'
  | 'code'
  | 'svg'
  | 'sql'
  | 'json'
  | 'csv'
  | 'yaml'
  | 'markdown'
  | 'checksum'
  | 'any'

export interface FileDropZoneProps {
  onFileContent: (content: string, filename: string, file: File) => void
  fileType?: DropZoneFileType
  customLabel?: string
  customAccept?: string
  readAsDataURL?: boolean
  className?: string
}

const FILE_TYPE_CONFIG: Record<
  DropZoneFileType,
  { accept: string; label: string; icon: string }
> = {
  image: {
    accept: 'image/png,image/jpeg,image/webp,image/svg+xml,image/gif,.png,.jpg,.jpeg,.webp,.svg,.gif',
    label: 'Image (.png, .jpg, .webp, .svg, .gif)',
    icon: '🖼️',
  },
  code: {
    accept:
      '.ts,.tsx,.js,.jsx,.py,.sql,.json,.html,.css,.go,.rs,.java,.cs,.cpp,.c,.php,.yaml,.yml,.sh,.md',
    label: 'Code file (.ts, .tsx, .js, .py, .sql, etc.)',
    icon: '💻',
  },
  svg: {
    accept: '.svg,image/svg+xml',
    label: 'SVG file (.svg)',
    icon: '⚛️',
  },
  sql: {
    accept: '.sql',
    label: 'SQL query script (.sql)',
    icon: '🗄️',
  },
  json: {
    accept: '.json,application/json',
    label: 'JSON file (.json)',
    icon: '📂',
  },
  csv: {
    accept: '.csv,text/csv',
    label: 'CSV spreadsheet (.csv)',
    icon: '📊',
  },
  yaml: {
    accept: '.yaml,.yml,text/yaml,application/x-yaml',
    label: 'YAML file (.yaml, .yml)',
    icon: '📜',
  },
  markdown: {
    accept: '.md,.markdown,text/markdown',
    label: 'Markdown file (.md)',
    icon: '📝',
  },
  checksum: {
    accept: '*/*',
    label: 'any file to compute checksum',
    icon: '🔒',
  },
  any: {
    accept: '*/*',
    label: 'file',
    icon: '📁',
  },
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({
  onFileContent,
  fileType = 'json',
  customLabel,
  customAccept,
  readAsDataURL = false,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const config = FILE_TYPE_CONFIG[fileType] || FILE_TYPE_CONFIG.any
  const accept = customAccept || config.accept
  const label = customLabel || config.label
  const icon = config.icon

  const handleFile = useCallback(
    (file: File) => {
      // Validate image if image type
      if (fileType === 'image' && !file.type.startsWith('image/')) {
        alert('Please upload a valid image file (.png, .jpg, .webp, .svg, .gif).')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setFileName(file.name)
        onFileContent(content, file.name, file)
      }

      if (readAsDataURL || fileType === 'image') {
        reader.readAsDataURL(file)
      } else {
        reader.readAsText(file)
      }
    },
    [fileType, readAsDataURL, onFileContent]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div
      id="file-drop-zone"
      className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 p-8 ${
        isDragging
          ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20 scale-[1.01]'
          : 'border-[rgba(124,58,237,0.25)] bg-[#16213e]/50 hover:border-purple-500/50 hover:bg-[#16213e]/80'
      } ${className}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        id="file-input"
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleInputChange}
      />

      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-purple-500/15 shadow-inner">
        {icon}
      </div>

      {fileName ? (
        <div className="text-center">
          <p className="font-semibold text-purple-400 truncate max-w-xs">
            {fileName}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Click or drag another file to replace
          </p>
        </div>
      ) : (
        <div className="text-center">
          <p className="font-semibold text-slate-100 text-sm">
            Drop <span className="text-cyan-400">{label}</span> here
          </p>
          <p className="text-xs text-slate-400 mt-1">
            or click to browse from your device
          </p>
        </div>
      )}
    </div>
  )
}

export default FileDropZone
