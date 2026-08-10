'use client'

import React, { useCallback, useRef, useState } from 'react'

export interface FileDropZoneProps {
  onFileContent: (content: string, filename: string, file: File) => void
  fileType?: 'json' | 'csv' | 'yaml' | 'any'
  readAsDataURL?: boolean
}

const FileDropZone: React.FC<FileDropZoneProps> = ({
  onFileContent,
  fileType = 'json',
  readAsDataURL = false,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  let accept = '.json,application/json'
  let label = '.json'
  let icon = '📂'

  if (fileType === 'csv') {
    accept = '.csv,text/csv'
    label = '.csv'
    icon = '📊'
  } else if (fileType === 'yaml') {
    accept = '.yaml,.yml,text/yaml,application/x-yaml'
    label = '.yaml / .yml'
    icon = '📜'
  } else if (fileType === 'any') {
    accept = '*/*'
    label = 'any file (Image, PDF, JSON, etc.)'
    icon = '📁'
  }

  const handleFile = useCallback(
    (file: File) => {
      const isValidJson = file.name.endsWith('.json') || file.type === 'application/json'
      const isValidCsv = file.name.endsWith('.csv') || file.type === 'text/csv'
      const isValidYaml = file.name.endsWith('.yaml') || file.name.endsWith('.yml')

      if (fileType === 'json' && !isValidJson) {
        alert('Please upload a .json file.')
        return
      }
      if (fileType === 'csv' && !isValidCsv) {
        alert('Please upload a .csv file.')
        return
      }
      if (fileType === 'yaml' && !isValidYaml) {
        alert('Please upload a .yaml or .yml file.')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setFileName(file.name)
        onFileContent(content, file.name, file)
      }

      if (readAsDataURL || fileType === 'any') {
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
          ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
          : 'border-[rgba(124,58,237,0.25)] bg-[#16213e]/50 hover:border-purple-500/50 hover:bg-[#16213e]/80'
      }`}
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
          <p className="text-sm text-slate-400">
            Click or drag to replace
          </p>
        </div>
      ) : (
        <div className="text-center">
          <p className="font-semibold text-slate-100">
            Drop <span className="text-cyan-400">{label}</span> here
          </p>
          <p className="text-sm text-slate-400">
            or click to browse
          </p>
        </div>
      )}
    </div>
  )
}

export default FileDropZone
