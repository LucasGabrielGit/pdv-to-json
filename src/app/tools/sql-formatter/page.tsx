import type { Metadata } from 'next'
import SqlFormatter from '@/components/tools/SqlFormatter'

export const metadata: Metadata = {
  title: 'SQL Formatter & Beautifier',
  description:
    'Format, beautify, and minify SQL queries for PostgreSQL, MySQL, SQLite, T-SQL, and BigQuery with uppercase keyword formatting, 100% in your browser.',
  alternates: {
    canonical: 'https://dev-kit.tech/tools/sql-formatter',
  },
}

export default function SqlFormatterPage() {
  return <SqlFormatter />
}
