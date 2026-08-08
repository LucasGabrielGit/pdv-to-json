import React, { useCallback, useRef, useState } from 'react'

interface FileDropZoneProps {
  onFileContent: (content: string, filename: string) => void
  fileType?: 'json' | 'csv'
}

const FileDropZone: React.FC<FileDropZoneProps> = ({ onFileContent, fileType = 'json' }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const accept = fileType === 'csv' ? '.csv,text/csv' : '.json,application/json'
  const label = fileType === 'csv' ? '.csv' : '.json'
  const icon = fileType === 'csv' ? '📊' : '📂'

  const handleFile = useCallback(
    (file: File) => {
      const isValidJson = file.name.endsWith('.json') || file.type === 'application/json'
      const isValidCsv = file.name.endsWith('.csv') || file.type === 'text/csv'
      if (fileType === 'json' && !isValidJson) {
        alert('Please upload a .json file.')
        return
      }
      if (fileType === 'csv' && !isValidCsv) {
        alert('Please upload a .csv file.')
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setFileName(file.name)
        onFileContent(content, file.name)
      }
      reader.readAsText(file)
    },
    [fileType, onFileContent]
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
          <p className="font-semibold text-purple-400">
            {fileName}
          </p>
          <p className="text-sm text-slate-400">
            Click or drag to replace
          </p>
        </div>
      ) : (
        <div className="text-center">
          <p className="font-semibold text-slate-100">
            Drop your <span className="text-cyan-400">{label}</span> file here
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
