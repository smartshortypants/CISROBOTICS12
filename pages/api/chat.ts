import type { NextApiRequest, NextApiResponse } from "next";

type Source = { url: string; title?: string; excerpt?: string };
type BotResp = { role: "assistant"; text: string; sources: Source[] };

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const BING_API_KEY = process.env.BING_API_KEY;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";
const OPENAI_TIMEOUT_MS = 30_000; // 30s

async function callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    // In production we surface an error; in development return a mock response so the front-end is usable.
    if (process.env.NODE_ENV === "development") {
      console.warn("OPENAI_API_KEY missing — returning development mock response.");
      return `Mock response (development). Received prompt: ${userPrompt.slice(0, 500)}`;
    }
    throw new Error("Missing OPENAI_API_KEY");
  }

  // Build request body with correct parameter name (max_tokens)
  const body = {
    model: OPENAI_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.2,
    max_tokens: 800,
  };

  // Timeout using AbortController
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(id);

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`OpenAI error: ${res.status} ${txt}`);
    }

    const data = await res.json();

    // Robust extraction: some responses have choices[0].message.content, others might have choices[0].text
    const assistant =
      data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? data?.choices?.[0]?.output?.[0]?.content ?? "";

    return typeof assistant === "string" ? assistant : JSON.stringify(assistant);
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw new Error("OpenAI request timed out");
    }
    throw err;
  }
}

async function callBing(q: string): Promise<Source[]> {
  if (!BING_API_KEY) return [];
  try {
    const params = new URLSearchParams({ q, count: "4" });
    const res = await fetch(`https://api.bing.microsoft.com/v7.0/search?${params.toString()}`, {
      headers: { "Ocp-Apim-Subscription-Key": BING_API_KEY },
    });
    if (!res.ok) return [];
    const j = await res.json();
    const pages = (j.webPages && j.webPages.value) || [];
    return pages.slice(0, 4).map((p: any) => ({
      url: p.url,
      title: p.name,
      excerpt: p.snippet || "",
    }));
  } catch (err) {
    console.error("Bing error", err);
    return [];
  }
}

function setCors(res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", FRONTEND_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    setCors(res);
    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const { query } = req.body || {};
    if (!query || typeof query !== "string") {
      res.status(400).json({ error: "Missing query" });
      return;
    }

    // Optional live web search (if BING_API_KEY provided)
    const webResults = await callBing(query);

    const systemPrompt =
      "You are ArcheoHub, a helpful assistant. When given web search results, use them to answer and explicitly cite which URLs you used. Keep answers concise and factual.";

    let userPrompt: string = query;

    if (webResults.length > 0) {
      const formatted = webResults
        .map((w: Source, i: number) => {
          return `Result ${i + 1}:\nTitle: ${w.title}\nURL: ${w.url}\nSnippet: ${w.excerpt}`;
        })
        .join("\n\n");
      userPrompt = `Use the following web search results to answer the question and cite sources from them where relevant:\n\n${formatted}\n\nQuestion: ${query}`;
    }

    const assistantText = await callOpenAI(systemPrompt, userPrompt);
    const botResp: BotResp = {
      role: "assistant",
      text: assistantText,
      sources: webResults,
    };
    res.status(200).json(botResp);
  } catch (err: any) {
    console.error("API error", err);
    try {
      setCors(res);
    } catch {}
    const message = err?.message || "internal error";
    res.status(500).json({ error: message });
  }
}
