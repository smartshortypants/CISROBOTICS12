import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

/**
 * ArcheoHub — Refreshed Chat (React + Tailwind)
 * - Dark navy / white aesthetic
 * - Clean layout, accessible controls, nicer message bubbles
 * - Requires TailwindCSS in your project
 */

type Role = "user" | "assistant";
type Source = { url: string; title?: string; excerpt?: string };
type Message = {
  id: string;
  role: Role;
  text: string;
  structured?: Record<string, string>;
  sources?: Source[];
  ts?: string;
  error?: boolean;
};

const ASSISTANT_AVATAR = "🤖";
const USER_AVATAR = "🧑";

function uid(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 9);
}
function nowISO() {
  return new Date().toISOString();
}
function formatTime(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function getDomain(url: string) {
  try {
    const u = new URL(url);
    return u.hostname.replace("www.", "");
  } catch {
    return url;
  }
}
async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function parseStructuredSections(text: string) {
  const lines = text.split("\n");
  const sections: Record<string, string> = {};
  let current: string | null = null;
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim();
    const headingMatch = raw.match(/^#{1,3}\s*(.+)/);
    if (headingMatch) {
      current = headingMatch[1].trim();
      sections[current] = "";
      continue;
    }
    const colonHeading =
      raw.match(/^([A-Za-z ]{3,40})\s*[:\-–—]\s*$/) ||
      raw.match(/^([A-Za-z ]{3,40})\s*[:\-–—]\s*(.*)$/);
    if (colonHeading) {
      const key = colonHeading[1].trim();
      current = key;
      sections[current] = (colonHeading[2] || "").trim();
      continue;
    }
    if (current) {
      sections[current] += (sections[current].length ? "\n" : "") + lines[i];
    }
  }
  return Object.keys(sections).length ? sections : null;
}

function buildSystemPrompt(persona: string, depth: number, tone: string, extraContext?: string) {
  const base = [
    `You are an expert archaeologist and historian (persona: ${persona}).`,
    `Respond with academic rigor, observational clarity, and accessible explanation.`,
    `Structure long answers with labeled sections where appropriate (e.g. Summary, Context, Methods, Interpretation, Sources).`,
    `When possible, provide concise citations/sources and short excerpts from sources.`,
    `Depth level: ${depth} (1 = short answer, 5 = deep multi-paragraph analysis).`,
    `Tone: ${tone}.`,
  ];
  if (extraContext && extraContext.trim()) {
    base.push(`Context for this session: ${extraContext}`);
  }
  base.push(`If the user requests sources, include an array of sources with URL, title, and a one-line excerpt where possible.`);
  base.push(`Always prefer accuracy over inventing details; if uncertain, clearly state uncertainty and suggest next steps for research.`);
  return base.join(" ");
}

export default function ChatPage(): JSX.Element {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // UI controls
  const [persona, setPersona] = useState<"Field Archaeologist" | "Museum Curator" | "Archaeological Theorist">(
    "Field Archaeologist"
  );
  const [depth, setDepth] = useState<number>(4);
  const [tone, setTone] = useState<"Formal" | "Accessible">("Formal");
  const [includeSources, setIncludeSources] = useState<boolean>(true);
  const [extraContext, setExtraContext] = useState<string>("");

  const messagesRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const EXAMPLES = [
    "What can the pottery styles at a Bronze Age site tell us about trade networks?",
    "Explain the likely sequence of activity at a burial mound with stratified layers.",
    "How do archaeologists use soil chemistry to detect ancient habitation?",
  ];

  const send = useCallback(async () => {
    const text = query.trim();
    if (!text || loading) return;
    setErrorMsg(null);

    const userMsg: Message = { id: uid("u_"), role: "user", text, ts: nowISO() };
    const placeholderMsg: Message = { id: uid("a_"), role: "assistant", text: "…", ts: nowISO() };

    setMessages((m) => [...m, userMsg, placeholderMsg]);
    setQuery("");
    setLoading(true);

    try {
      const systemPrompt = buildSystemPrompt(persona, depth, tone, extraContext);
      const url = API_BASE ? `${API_BASE}/api/chat` : "/api/chat";

      const payload = {
        query: text,
        options: {
          systemPrompt,
          depth,
          tone,
          includeSources,
        },
      };

      const res = await axios.post(url, payload, { timeout: 120000 });

      const assistantPayload = res.data;
      let assistantText = "";
      let assistantSources: Source[] = [];

      if (typeof assistantPayload === "string") {
        assistantText = assistantPayload;
      } else if (assistantPayload?.text) {
        assistantText = assistantPayload.text;
        if (Array.isArray(assistantPayload.sources)) assistantSources = assistantPayload.sources;
      } else {
        assistantText = JSON.stringify(assistantPayload);
      }

      const structured = parseStructuredSections(assistantText) || undefined;

      const assistantMsg: Message = {
        id: uid("a_"),
        role: "assistant",
        text: assistantText,
        structured,
        sources: assistantSources,
        ts: nowISO(),
      };

      setMessages((prev) => prev.filter((p) => p.id !== placeholderMsg.id).concat(assistantMsg));
    } catch (err: any) {
      console.error("Chat error:", err);
      const serverMsg =
        err?.response?.data?.error || err?.response?.data?.message || err?.message || "Sorry — an unexpected error occurred.";

      const assistantMsg: Message = {
        id: uid("a_"),
        role: "assistant",
        text: String(serverMsg),
        sources: [],
        ts: nowISO(),
        error: true,
      };

      setMessages((prev) => prev.filter((p) => p.id !== placeholderMsg.id).concat(assistantMsg));
      setErrorMsg(typeof serverMsg === "string" ? serverMsg : "Request failed");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [API_BASE, depth, extraContext, includeSources, loading, persona, query, tone]);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading) send();
    }
  }

  async function exportConversation() {
    const lines: string[] = [];
    for (const m of messages) {
      const who = m.role === "user" ? "User" : "ArcheoHub (Assistant)";
      lines.push(`${who} [${formatTime(m.ts)}]:`);
      lines.push(m.text);
      lines.push("");
      if (m.sources?.length) {
        lines.push("Sources:");
        for (const s of m.sources) lines.push(`- ${s.title || s.url} — ${s.url}`);
        lines.push("");
      }
    }
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `archeohub-conversation-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        <header className="flex items-start justify-between gap-6 mb-6">
          <div className="flex-1">
            <button
              aria-label="Back"
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 text-slate-300 hover:text-white"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-semibold mt-2">ArcheoHub — Archaeologist Chat</h1>
            <p className="text-slate-300 mt-1">Ask questions; get in-depth, structured archaeological answers.</p>
          </div>

          <div className="w-80 bg-white/6 backdrop-blur-md rounded-xl p-4 border border-white/6">
            <div className="flex flex-col gap-3">
              <label className="flex flex-col text-sm">
                <span className="text-slate-300">Persona</span>
                <select
                  value={persona}
                  onChange={(e) => setPersona(e.target.value as any)}
                  className="mt-2 bg-transparent border border-white/10 rounded-md px-3 py-2 text-white"
                >
                  <option>Field Archaeologist</option>
                  <option>Museum Curator</option>
                  <option>Archaeological Theorist</option>
                </select>
              </label>

              <label className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Depth</span>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={depth}
                    onChange={(e) => setDepth(Number(e.target.value))}
                    className="w-36"
                  />
                  <span className="text-white/80 w-6 text-right">{depth}</span>
                </div>
              </label>

              <label className="flex flex-col text-sm">
                <span className="text-slate-300">Tone</span>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as any)}
                  className="mt-2 bg-transparent border border-white/10 rounded-md px-3 py-2 text-white"
                >
                  <option>Formal</option>
                  <option>Accessible</option>
                </select>
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  id="srcToggle"
                  type="checkbox"
                  checked={includeSources}
                  onChange={() => setIncludeSources((s) => !s)}
                  className="rounded bg-white/10"
                />
                <span className="text-slate-300">Include sources</span>
              </label>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setExtraContext("User is a late medieval ceramicist seeking technical interpretation of glazes.");
                    // small UX hint
                    setTimeout(() => alert("Advanced context set to an example. Edit as needed."), 80);
                  }}
                  className="flex-1 rounded-md bg-white/8 border border-white/6 px-3 py-2 text-sm hover:bg-white/10"
                >
                  Quick context example
                </button>
                <button
                  onClick={exportConversation}
                  className="rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-900 hover:opacity-95"
                >
                  Export
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6">
          <aside className="col-span-3">
            <div className="rounded-xl bg-white/5 p-4 border border-white/6">
              <h3 className="text-white text-lg font-medium">Examples</h3>
              <ul className="mt-3 space-y-3">
                {EXAMPLES.map((ex, i) => (
                  <li key={i}>
                    <button
                      className="w-full text-left rounded-md px-3 py-2 bg-white/6 hover:bg-white/10"
                      onClick={() => {
                        setQuery(ex);
                        inputRef.current?.focus();
                      }}
                    >
                      <span className="text-white/90">{ex}</span>
                    </button>
                  </li>
                ))}
              </ul>

              <h4 className="text-slate-300 mt-4">Advanced context</h4>
              <textarea
                value={extraContext}
                onChange={(e) => setExtraContext(e.target.value)}
                placeholder="Optional: give the assistant background (site, period, dataset)"
                rows={5}
                className="mt-2 w-full rounded-md bg-transparent border border-white/8 px-3 py-2 text-white placeholder:text-slate-400"
              />
            </div>
          </aside>

          <main className="col-span-9 flex flex-col">
            <div className="flex-1 overflow-hidden rounded-xl bg-gradient-to-b from-white/5 via-white/3 to-transparent border border-white/6 p-4">
              <div ref={messagesRef} className="h-full overflow-auto space-y-4 pr-2">
                {messages.length === 0 && (
                  <div className="text-center py-10 text-slate-300">
                    <h2 className="text-xl font-semibold text-white">Welcome — ArcheoHub</h2>
                    <p className="mt-2">Ask an archaeological question or pick an example on the left. Increase depth for longer, more technical answers.</p>
                  </div>
                )}

                {messages.map((m) => {
                  const isUser = m.role === "user";
                  return (
                    <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] ${isUser ? 'text-right' : 'text-left'}`}>
                        <div className={`inline-flex items-center gap-3 mb-1 ${isUser ? 'flex-row-reverse' : ''}`}>
                          <div className="text-sm text-slate-300 font-semibold">{isUser ? 'You' : 'Archaeologist'}</div>
                          <div className="text-xs text-slate-400">{formatTime(m.ts)}</div>
                        </div>

                        <div
                          className={`rounded-xl p-4 shadow-sm leading-relaxed whitespace-pre-wrap ${
                            isUser
                              ? 'bg-white text-slate-900 border border-white/8 rounded-br-2xl'
                              : 'bg-blue-900/95 text-white border border-white/6 rounded-bl-2xl'
                          } ${m.error ? 'ring-2 ring-rose-500' : ''}`}
                        >
                          {m.structured ? (
                            <div className="space-y-3">
                              {Object.entries(m.structured).map(([k, v]) => (
                                <div key={k}>
                                  <div className="text-sm font-semibold text-amber-200">{k}</div>
                                  <div className="mt-1 text-sm text-white/90">{v}</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm">{m.text}</div>
                          )}

                          {m.sources && m.sources.length > 0 && (
                            <div className="mt-3 border-t border-white/6 pt-3">
                              <div className="text-xs font-semibold text-slate-300">Sources</div>
                              <ul className="mt-2 space-y-2">
                                {m.sources.map((s, idx) => (
                                  <li key={idx} className="flex items-start justify-between gap-3">
                                    <div>
                                      <div className="text-xs text-slate-400">{getDomain(s.url)}</div>
                                      <a href={s.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-emerald-200">
                                        {s.title || s.url}
                                      </a>
                                      {s.excerpt && <div className="text-xs text-slate-300 mt-1">{s.excerpt}</div>}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                      <button
                                        onClick={() => window.open(s.url, "_blank", "noopener")}
                                        className="text-xs bg-white/6 rounded px-2 py-1"
                                      >
                                        Open
                                      </button>
                                      <button
                                        onClick={async () => {
                                          const ok = await copyToClipboard(s.url);
                                          alert(ok ? "Copied link" : "Copy failed");
                                        }}
                                        className="text-xs bg-white/6 rounded px-2 py-1"
                                      >
                                        Copy
                                      </button>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4">
                {errorMsg && <div className="text-rose-400 text-sm mb-2">{errorMsg}</div>}

                <div className="flex gap-3 items-center">
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Ask an archaeological question — e.g. 'What does pottery X indicate about chronology?'"
                    aria-label="Ask ArcheoHub"
                    disabled={loading}
                    className="flex-1 rounded-lg px-4 py-3 bg-white/6 text-white placeholder:text-slate-400 border border-white/8 focus:ring-2 focus:ring-blue-500"
                  />

                  <button
                    onClick={() => send()}
                    disabled={loading || !query.trim()}
                    className={`rounded-lg px-5 py-3 font-semibold ${loading || !query.trim() ? 'bg-white/10 text-white/60 cursor-not-allowed' : 'bg-amber-200 text-slate-900 hover:opacity-95'}`}
                  >
                    {loading ? '…' : 'Send'}
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>

        <footer className="mt-6 text-center text-xs text-slate-400">Made with ❤ • ArcheoHub UI refresh</footer>
      </div>
    </div>
  );
}
