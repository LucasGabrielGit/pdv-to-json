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
      prompt,
      language = 'typescript',
      type = 'full',
      aiMode = 'turbo',
      customApiKey,
    } = body

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Prompt instruction is required.' },
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

    const systemPrompt = `You are an expert AI code generator.
Generate high-quality, production-ready ${language} code based on the user request.
Request Type: ${type}

CRITICAL INSTRUCTIONS FOR JSON ESCAPING:
- You must output valid, parseable JSON ONLY.
- Inside string properties (like generatedCode and usageExample), escape all backslashes and double quotes properly.

Respond strictly in valid JSON format matching this schema:
{
  "generatedCode": "// Clean, commented production-ready code here",
  "explanation": "Detailed step-by-step explanation of how the code works...",
  "usageExample": "// How to call/use this code in an application"
}`

    const selectedModel = aiMode === 'deep' ? 'gemini-2.5-pro' : 'gemini-2.5-flash'

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: `${systemPrompt}\n\nUser Prompt:\n${prompt}`,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    })

    const responseText = response.text || '{}'
    const resultJson = safeParseLlmJson(responseText, {
      generatedCode: '// Code generated',
      explanation: 'Explanation generated',
      usageExample: '// Usage example',
    })

    // Deduct credit only upon successful generation
    await deductServerCreditPostSuccess(
      supabase,
      creditCheck,
      'AI Code Generator'
    )

    return NextResponse.json({
      success: true,
      data: resultJson,
    })
  } catch (err) {
    console.error('Code Generator API Error:', err)
    return NextResponse.json(
      { error: (err as Error).message || 'Failed to generate code.' },
      { status: 500 }
    )
  }
}

