import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { safeParseLlmJson } from '@/utils/safeJsonParse'
import { createClient } from '@/lib/supabase/server'

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
