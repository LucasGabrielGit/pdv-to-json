import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { safeParseLlmJson } from '@/utils/safeJsonParse'
import { createClient } from '@/lib/supabase/server'

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

    // Check Supabase authentication
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If user is authenticated and not using BYOK, verify and deduct credit
    if (user && !customApiKey) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('free_credits_remaining, purchased_credits, is_pro')
        .eq('id', user.id)
        .single()

      if (profile && !profile.is_pro) {
        const total =
          (profile.free_credits_remaining || 0) +
          (profile.purchased_credits || 0)

        if (total <= 0) {
          return NextResponse.json(
            {
              error:
                'You have reached your daily credit limit. Please enter a custom Gemini API Key or upgrade.',
            },
            { status: 403 }
          )
        }

        // Deduct 1 credit
        if (profile.free_credits_remaining > 0) {
          await supabase
            .from('profiles')
            .update({
              free_credits_remaining: profile.free_credits_remaining - 1,
            })
            .eq('id', user.id)
        } else if (profile.purchased_credits > 0) {
          await supabase
            .from('profiles')
            .update({
              purchased_credits: profile.purchased_credits - 1,
            })
            .eq('id', user.id)
        }
      }
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
      model: 'gemini-2.0-flash',
      contents: `${systemPrompt}\n\nUser Request:\n${prompt}`,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    })

    const responseText = response.text || '{}'
    const resultJson = safeParseLlmJson(responseText, {
      query: '-- SQL query generated',
      explanation: 'Explanation generated',
      indexSuggestions: ['-- Index suggestions'],
      performanceTips: ['Use proper indexing on foreign keys.'],
    })

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
