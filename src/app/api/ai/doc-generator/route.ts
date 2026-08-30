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
      apiCode = '',
      customApiKey,
    } = body

    if (!apiCode || !apiCode.trim()) {
      return NextResponse.json(
        { error: 'API route handler code or interface is required.' },
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

    const systemPrompt = `You are a Principal API Architect and Technical Writer.
Generate comprehensive, professional API documentation and OpenAPI 3.0 specifications for the provided API routes, types, or endpoints.

Generate documentation in ALL 4 formats:
1. openapiYaml: Valid OpenAPI 3.0.3 specification in clean YAML.
2. openapiJson: Valid OpenAPI 3.0.3 specification in JSON string.
3. markdownDocs: Polished developer portal documentation formatted in Markdown with request/response examples and status codes.
4. jsdocComments: Code with typed JSDoc/TSDoc comments with @param, @returns, and @throws annotations.

CRITICAL: Return strictly valid parseable JSON matching this schema:
{
  "openapiYaml": "openapi: 3.0.3\\ninfo:\\n  title: API Title\\n  version: 1.0.0...",
  "openapiJson": "{\\n  \\"openapi\\": \\"3.0.3\\"...\\n}",
  "markdownDocs": "# API Endpoint Documentation\\n\\n### POST /api/users...",
  "jsdocComments": "/**\\n * Endpoint description\\n */",
  "summary": "Brief summary of endpoints and data models detected."
}`

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${systemPrompt}\n\nAPI Code / Types:\n${apiCode.slice(0, 15000)}`,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    })

    const responseText = response.text || '{}'
    const resultJson = safeParseLlmJson(responseText, {
      openapiYaml: '# OpenAPI YAML Spec',
      openapiJson: '{}',
      markdownDocs: '# API Documentation',
      jsdocComments: '/**',
      summary: 'Documentation generated.',
    })

    // Deduct credit only upon successful generation
    await deductServerCreditPostSuccess(
      supabase,
      creditCheck,
      'AI API Documentation Generator'
    )

    return NextResponse.json({
      success: true,
      data: resultJson,
    })
  } catch (err) {
    console.error('AI Doc Generator API Error:', err)
    return NextResponse.json(
      { error: (err as Error).message || 'Failed to generate API documentation.' },
      { status: 500 }
    )
  }
}
