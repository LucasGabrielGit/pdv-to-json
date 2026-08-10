import React from 'react'
import { ToolHeader } from './ToolHeader'

interface ConverterHeaderProps {
  isJsonToCsv: boolean
}

export const ConverterHeader: React.FC<ConverterHeaderProps> = ({ isJsonToCsv }) => {
  return (
    <ToolHeader
      title={isJsonToCsv ? 'JSON → CSV Converter' : 'CSV → JSON Converter'}
      description={
        isJsonToCsv
          ? 'Convert JSON files or text to clean CSV instantly with automatic nested object flattening.'
          : 'Convert CSV spreadsheets back to structured JSON with smart type casting and nesting.'
      }
      badgeText="Instant & Free Online Converter"
    />
  )
}
