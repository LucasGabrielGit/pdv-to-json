import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { safeParseLlmJson } from '@/utils/safeJsonParse'
import { createClient } from '@/lib/supabase/server'
import {
  verifyServerCredits,
  deductServerCreditPostSuccess,
} from '@/lib/serverCreditGuard'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      schemaInput = '',
      dialect = 'postgres',
      aiMode = 'turbo',
      customApiKey,
    } = body

    if (!schemaInput || !schemaInput.trim()) {
      return NextResponse.json(
        { error: 'SQL DDL or database model input is required.' },
        { status: 400 }
      )
    }

    // Pre-check credits
    const supabase = await createClient()
    const creditCheck = await verifyServerCredits(supabase, customApiKey)
    if (!creditCheck.allowed && creditCheck.errorResponse) {
      return NextResponse.json(
        { error: creditCheck.errorResponse.error },
        { status: creditCheck.errorResponse.status }
      )
    }

    const apiKey = (
      customApiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      ''
    ).trim()

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'No Gemini API Key configured. Please enter your custom Gemini API key or set GEMINI_API_KEY.',
        },
        { status: 401 }
      )
    }

    const ai = new GoogleGenAI({ apiKey })

    const systemPrompt = `You are a Principal Database Architect and ORM Expert.
Convert the provided SQL DDL, JSON data model, or description into modern, production-grade ORM schemas.
Target Database Dialect: ${dialect}.

Generate schemas for ALL 4 target formats:
1. Prisma Schema (schema.prisma) with proper @id, @default(autoincrement()/uuid()), @updatedAt, relations, and @@index.
2. Drizzle ORM (TypeScript pgTable/mysqlTable/sqliteTable with drizzle-orm imports).
3. TypeORM Entity (TypeScript class with @Entity(), @PrimaryGeneratedColumn(), @Column(), @ManyToOne(), @OneToMany()).
4. Zod Validation Schemas (TypeScript with z.object() covering create and update validation).

CRITICAL: Return strictly valid parseable JSON matching this schema:
{
  "prisma": "// Prisma schema models here",
  "drizzle": "// Drizzle ORM schema here",
  "typeorm": "// TypeORM entity classes here",
  "zod": "// Zod validation schemas here",
  "migrationSql": "-- Clean standard SQL migration\\nCREATE TABLE ...",
  "summary": "Brief architectural summary of the tables, primary keys, and foreign relations detected."
}`

    const selectedModel = aiMode === 'deep' ? 'gemini-2.5-pro' : 'gemini-2.5-flash'

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: `${systemPrompt}\n\nInput Schema:\n${schemaInput.slice(0, 15000)}`,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    })

    const responseText = response.text || '{}'
    const resultJson = safeParseLlmJson(responseText, {
      prisma: '// Prisma schema',
      drizzle: '// Drizzle ORM schema',
      typeorm: '// TypeORM schema',
      zod: '// Zod schema',
      migrationSql: '-- SQL migration',
      summary: 'Schema parsed successfully.',
    })

    // Deduct credit only upon successful generation
    await deductServerCreditPostSuccess(
      supabase,
      creditCheck,
      'AI Database Schema Mapper'
    )

    return NextResponse.json({
      success: true,
      data: resultJson,
    })
  } catch (err) {
    console.error('AI Schema Mapper API Error:', err)
    return NextResponse.json(
      { error: (err as Error).message || 'Failed to map database schema.' },
      { status: 500 }
    )
  }
}
