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
    const { prompt, dialect = 'postgresql', customApiKey } = body

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Prompt description is required.' },
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
            'No Gemini API Key provided. Please enter your Gemini API Key in the tool settings or set GEMINI_API_KEY on the server.',
        },
        { status: 401 }
      )
    }

    const ai = new GoogleGenAI({ apiKey })

    const systemPrompt = `You are a world-class principal database architect and SQL performance expert.
Target SQL Dialect: ${dialect}

Generate the most optimal, production-grade SQL query based on the user's natural language request.
Also provide:
1. Step-by-step technical explanation of the logic and joins.
2. Recommended database indexes to make this query run at sub-millisecond latency.
3. Performance caveats (if any).

CRITICAL INSTRUCTIONS FOR JSON ESCAPING:
- You must output valid, parseable JSON ONLY.
- Inside string properties (like query, explanation, indexSuggestions), escape all backslashes and double quotes properly.

Respond strictly in valid JSON format matching this schema:
{
  "query": "-- Clean, formatted SQL query here",
  "explanation": "Detailed explanation of the query structure...",
  "indexSuggestions": ["CREATE INDEX idx_users_email ON users(email);"],
  "performanceTips": ["Tip 1", "Tip 2"]
}`

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${systemPrompt}\n\nUser Request:\n${prompt}`,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    })

    const responseText = response.text || '{}'
    const resultJson = safeParseLlmJson(responseText, {
      query: '-- SQL query generated',
      explanation: 'Explanation generated',
      indexSuggestions: ['-- Index suggestions'],
      performanceTips: ['Use proper indexing on foreign keys.'],
    })

    // Deduct credit only upon successful generation
    await deductServerCreditPostSuccess(
      supabase,
      creditCheck,
      'AI SQL Generator'
    )

    return NextResponse.json({
      success: true,
      data: resultJson,
    })
  } catch (err) {
    console.error('AI SQL Generator API Error:', err)
    return NextResponse.json(
      { error: (err as Error).message || 'Failed to generate SQL query.' },
      { status: 500 }
    )
  }
}
