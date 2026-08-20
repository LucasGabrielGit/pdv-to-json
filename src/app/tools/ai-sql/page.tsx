import type { Metadata } from 'next'
import AiSqlGenerator from '@/components/tools/AiSqlGenerator'

export const metadata: Metadata = {
  title: 'AI SQL Query Generator & Optimizer (PostgreSQL, MySQL, SQLite, T-SQL)',
  description:
    'Generate complex SQL queries, analytical joins, aggregations, and subqueries with index optimization recommendations using Google Gemini AI.',
  alternates: {
    canonical: 'https://dev-kit.tech/tools/ai-sql',
  },
}

export default function AiSqlPage() {
  return <AiSqlGenerator />
}
