import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_INSTRUCTION =
  'You are a Lead AI Systems Architect for Sovereign Operations. The user will provide a manual business task. Output a concise, 3-step autonomous agent blueprint to automate it. Format as strict terminal output. Do not use markdown blocks. Keep it extremely brief and highly technical. Use EXACTLY this format:\n\n> ANALYZING_TASK: [2-5 words]\n> BOTTLENECK_IDENTIFIED: [2-8 words]\n> DEPLOYING_AGENT_STACK:\n  [TOOL 1] -> [TOOL 2] -> [TOOL 3]\n> LOGIC_GATE: [1 short sentence explaining integration]\n> STATUS: AUTONOMY_READY'

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    )
  }

  const { task } = await request.json()
  if (!task || typeof task !== 'string') {
    return NextResponse.json(
      { error: 'No task provided' },
      { status: 400 }
    )
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`

  const delays = [1000, 2000, 4000, 8000, 16000]
  for (let i = 0; i < 5; i++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: task }] }],
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        '> ERROR: UNKNOWN_RESPONSE'

      return NextResponse.json({ text })
    } catch {
      if (i === 4) {
        return NextResponse.json(
          { error: 'Failed after retries' },
          { status: 502 }
        )
      }
      await new Promise((r) => setTimeout(r, delays[i]))
    }
  }
}
