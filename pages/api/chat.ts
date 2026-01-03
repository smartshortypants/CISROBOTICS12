import type { NextApiRequest, NextApiResponse } from 'next'

type Source = { url: string; title?: string; excerpt?: string }
type BotResp = { role: 'assistant'; text: string; sources: Source[] }

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
const BING_API_KEY = process.env.BING_API_KEY
// FRONTEND_ORIGIN can be set to your GitHub Pages or Vercel frontend origin to restrict CORS.
// If not set, '*' will be used (open CORS).
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '*'

async function callOpenAI(systemPrompt: string, userPrompt: string) {
  if (!OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY in environment')
  }

  const body = {
    model: OPENAI_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.2,
    max_tokens: 800
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify(body),
    // Vercel uses Node 18+ which provides global fetch
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`OpenAI error: ${res.status} ${txt}`)
  }

  const data = await res.json()
  const assistant = data.choices?.[0]?.message?.content ?? ''
  return assistant
}

async function callBing(q: string) {
  if (!BING_API_KEY) return []
  try {
    const params = new URLSearchParams({ q, count: '4' })
    const res = await fetch(`https://api.bing.microsoft.com/v7.0/search?${params.toString()}`, {
      headers: { 'Ocp-Apim-Subscription-Key': BING_API_KEY }
    })
    if (!res.ok) return []
    const j = await res.json()
    const pages = (j.webPages && j.webPages.value) || []
    return pages.slice(0, 4).map((p: any) => ({
      url: p.url,
      title: p.name,
      excerpt: p.snippet || ''
    }))
  } catch (err) {
    console.error('Bing search error', err)
    return []
  }
}

function setCorsHeaders(res: NextApiResponse) {
  // Allow either the configured frontend origin or all origins if FRONTEND_ORIGIN='*'
  res.setHeader('Access-Control-Allow-Origin', FRONTEND_ORIGIN)
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  // Optional: allow credentials if you set FRONTEND_ORIGIN exactly and need cookies
  // res.setHeader('Access-Control-Allow-Credentials', 'true')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Always set CORS headers for every response
    setCorsHeaders(res)

    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.status(200).end()
      return
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' })
      return
    }

    const { query } = req.body || {}
    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Missing query' })
      return
    }

    // 1) Optional: fetch web results (Bing) and include them in the user prompt
    const webResults = await callBing(query)

    // 2) Build prompts
    let systemPrompt =
      'You are ArcheoHub, a helpful assistant. When given web search results, use them to answer and explicitly cite which URLs you used. Keep answers concise and factual. If results are available, include a short Sources list at the end.'
    let userPrompt = query

    if (webResults.length > 0) {
      const formatted = webResults
        .map(
          (w, i) =>
            `Result ${i + 1}:
Title: ${w.title}
URL: ${w.url}
Snippet: ${w.excerpt}
`
        )
        .join('\n')
      userPrompt = `Use the following web search results to answer the question and cite sources from them where relevant:\n\n${formatted}\nQuestion: ${query}`
    }

    // 3) Call OpenAI
    const assistantText = await callOpenAI(systemPrompt, userPrompt)

    // 4) Return structured response (assistant text + structured webResults)
    const botResp: BotResp = {
      role: 'assistant',
      text: assistantText,
      sources: webResults
    }
    res.status(200).json(botResp)
  } catch (err: any) {
    console.error('API error', err)
    // Ensure CORS headers exist even on error responses
    try { setCorsHeaders(res) } catch {}
    res.status(500).json({ error: err?.message || 'internal error' })
  }
}
