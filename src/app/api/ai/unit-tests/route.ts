import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { safeParseLlmJson } from '@/utils/safeJsonParse'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      code = '',
      language = 'typescript',
      framework = 'vitest',
      coverageFocus = 'comprehensive',
      aiMode = 'turbo',
      customApiKey,
    } = body

    if (!code || !code.trim()) {
      return NextResponse.json(
        { error: 'Source code is required to generate unit tests.' },
        { status: 400 }
      )
    }

    // Check Supabase authentication
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

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
                'You have reached your daily credit limit. Please enter a custom Gemini API Key or upgrade to Pro.',
            },
            { status: 403 }
          )
        }

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
            'No Gemini API Key configured. Please enter your custom Gemini API key or set GEMINI_API_KEY.',
        },
        { status: 401 }
      )
    }

    const ai = new GoogleGenAI({ apiKey })

    const systemPrompt = `You are a Principal Software Quality Assurance & Testing Architect.
Generate an exhaustive, production-grade unit test suite for the provided code.
Language: ${language}
Testing Framework: ${framework}
Coverage Focus: ${coverageFocus}

Guidelines:
1. Write 100% runnable, isolated tests with all necessary imports and mock data.
2. Group tests logically using describe() and test()/it() blocks.
3. Test Happy Path scenarios, Boundary/Edge Cases (null, undefined, empty arrays, extreme numbers), and Error/Exception throwing.
4. Include mock fixtures where external dependencies or API calls exist.

CRITICAL: Return strictly valid parseable JSON matching this schema:
{
  "testCode": "// Complete runnable test file code here",
  "runCommand": "npx vitest run my-file.test.ts",
  "testCases": [
    { "name": "should calculate total amount correctly", "category": "Happy Path" },
    { "name": "should throw ValidationError on negative input", "category": "Error Handling" }
  ],
  "mockExplanation": "Explanation of mocks and fixtures created."
}`

    const selectedModel = aiMode === 'deep' ? 'gemini-2.5-pro' : 'gemini-2.5-flash'

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: `${systemPrompt}\n\nSource Code:\n${code.slice(0, 15000)}`,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    })

    const responseText = response.text || '{}'
    const resultJson = safeParseLlmJson(responseText, {
      testCode: '// Generated unit tests',
      runCommand: 'npm test',
      testCases: [],
      mockExplanation: 'Tests generated.',
    })

    return NextResponse.json({
      success: true,
      data: resultJson,
    })
  } catch (err) {
    console.error('AI Unit Test Generator API Error:', err)
    return NextResponse.json(
      { error: (err as Error).message || 'Failed to generate unit tests.' },
      { status: 500 }
    )
  }
}
