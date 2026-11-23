import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { safeParseLlmJson } from '@/utils/safeJsonParse'
import { createClient } from '@/lib/supabase/server'
import {
  verifyServerCredits,
  deductServerCreditPostSuccess,
  resolveGeminiModel,
} from '@/lib/serverCreditGuard'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      code = '',
      language = 'typescript',
      goal = 'modernize-react19',
      aiMode = 'turbo',
      customApiKey,
    } = body

    if (!code || !code.trim()) {
      return NextResponse.json(
        { error: 'Source code is required for refactoring.' },
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

    const systemPrompt = `You are a Principal Software Architect and Code Optimization Specialist.
Refactor and optimize the provided code according to the chosen objective: "${goal}".
Language: ${language}

Objectives:
- 'modernize-react19': Update to latest React 19 hooks, Server Actions, modern ES2024 features, immutable updates, and clean state management.
- 'optimize-performance': Minimize Big-O time and space complexity, eliminate redundant re-renders/allocations, and optimize hot paths.
- 'convert-to-ts': Convert plain JavaScript into strictly-typed TypeScript with interfaces, generics, and zero 'any'.
- 'clean-solid': Refactor for Clean Code, Single Responsibility, Separation of Concerns, and DRY principles.

CRITICAL: Return strictly valid parseable JSON matching this schema:
{
  "refactoredCode": "// Complete modernized and refactored code here",
  "summary": "Executive summary of the refactoring...",
  "improvements": [
    { "title": "Reduced Big-O Complexity", "description": "Replaced O(N^2) nested loop with O(N) Map lookup." },
    { "title": "Type Safety", "description": "Added strict TypeScript discriminated union interfaces." }
  ],
  "timeComplexity": "O(N) (was O(N^2))",
  "spaceComplexity": "O(N)"
}`

    const selectedModel = resolveGeminiModel(aiMode, customApiKey)

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: `${systemPrompt}\n\nCode to Refactor:\n${code.slice(0, 15000)}`,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    })

    const responseText = response.text || '{}'
    const resultJson = safeParseLlmJson(responseText, {
      refactoredCode: '// Refactored code',
      summary: 'Code refactored successfully.',
      improvements: [],
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
    })

    // Deduct credit only upon successful generation
    await deductServerCreditPostSuccess(
      supabase,
      creditCheck,
      'AI Code Modernizer & Refactor'
    )

    return NextResponse.json({
      success: true,
      data: resultJson,
    })
  } catch (err) {
    console.error('AI Code Refactor API Error:', err)
    return NextResponse.json(
      { error: (err as Error).message || 'Failed to refactor code.' },
      { status: 500 }
    )
  }
}
