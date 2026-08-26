import type { Metadata } from 'next'
import AiSchemaMapper from '@/components/tools/AiSchemaMapper'
import PixCoffee from '@/components/PixCoffee'

export const metadata: Metadata = {
  title: 'AI Database Schema Mapper — SQL to Prisma, Drizzle, TypeORM & Zod',
  description:
    'Free AI Database Schema Mapper. Convert PostgreSQL, MySQL, and SQLite DDL queries or JSON models into Prisma Schemas, Drizzle ORM, TypeORM Entities, and Zod validation schemas.',
  keywords: [
    'sql to prisma',
    'sql to drizzle',
    'sql to typeorm',
    'database schema generator',
    'ai orm mapper',
    'create table to prisma schema',
    'sql to zod schema',
  ],
  openGraph: {
    title: 'AI Database Schema Mapper — SQL to Prisma, Drizzle, TypeORM',
    description:
      'Convert SQL DDL queries and database schemas into Prisma, Drizzle, TypeORM, and Zod in seconds.',
    url: 'https://pdv-to-json.vercel.app/tools/ai-schema',
    siteName: 'dev-kit.tech',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Database Schema Mapper',
    description:
      'Convert SQL DDL into Prisma, Drizzle, TypeORM, and Zod schemas.',
    images: ['/og-image.svg'],
  },
}

export default function AiSchemaPage() {
  return (
    <div className="py-8">
      <AiSchemaMapper />
      <PixCoffee />
    </div>
  )
}
