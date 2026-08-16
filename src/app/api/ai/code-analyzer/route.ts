import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { code, language = 'javascript', customApiKey } = body

    if (!code || typeof code !== 'string' || !code.trim()) {
      return NextResponse.json(
        { error: 'Code content is required.' },
        { status: 400 }
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

    const systemPrompt = `You are a world-class senior software architect, code reviewer, and security specialist.
Analyze the following ${language} code for:
1. Overall Quality Score (1 to 100)
2. Executive Summary of what the code does and its overall health.
3. Security & OWASP Vulnerabilities (if any).
4. Performance & Refactoring Suggestions.
5. Improved & Clean Refactored Code.
6. Recommended Unit Test Code.

Respond strictly in valid JSON format matching this schema:
{
  "score": 85,
  "summary": "High-level review summary...",
  "securityTips": ["Tip 1", "Tip 2"],
  "performanceTips": ["Tip 1", "Tip 2"],
  "refactoredCode": "// Cleaned up code here",
  "unitTestCode": "// Unit test sample here"
}`

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${systemPrompt}\n\nHere is the code to analyze:\n\`\`\`${language}\n${code}\n\`\`\``,
      config: {
        responseMimeType: 'application/json',
      },
    })

    const responseText = response.text || '{}'
    const resultJson = JSON.parse(responseText)

    return NextResponse.json({
      success: true,
      data: resultJson,
    })
  } catch (err) {
    console.error('Code Analyzer API Error:', err)
    return NextResponse.json(
      { error: (err as Error).message || 'Failed to analyze code.' },
      { status: 500 }
    )
  }
}
