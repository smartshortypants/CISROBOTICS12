import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

/**
 * ArcheoHub — Enhanced Chat (original style, expanded, color update)
 *
 * This file is a developed version of your original component. It keeps the
 * same structural approach (React + styled-jsx) while:
 * - Switching to a clean dark-blue & white aesthetic
 * - Making assistant-result parsing robust (handles empty `{role:'assistant',text:'',sources:[]}`)
 * - Adding retry/backoff, streaming fallback, persistent storage, import/export
 * - Adding message edit/delete/pin/search capabilities
 *
 * NOTE: Drop this component into a Next.js page. It expects axios + next/router.
 */

// -----------------------------
// Types and Utilities
// -----------------------------

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
  pinned?: boolean;
  edited?: boolean;
};

const ASSISTANT_AVATAR = "🤖";
const USER_AVATAR = "🧑";

function uid(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 11);
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

// Minimal HTML-escape for our small markdown -> HTML helper
function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function simpleMarkdownToHtml(md: string) {
  const lines = md.split("\n");
  const out: string[] = [];
  let inCode = false;
  let codeLang = "";
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("```")) {
      inCode = !inCode;
      if (inCode) {
        codeLang = line.slice(3).trim();
        out.push(`<pre class=\"code-block\"><code data-lang=\"${escapeHtml(codeLang)}\">`);
      } else {
        out.push("</code></pre>");
      }
      continue;
    }
    if (inCode) {
      out.push(escapeHtml(line) + "\n");
      continue;
    }
    const h = line.match(/^(#{1,4})\s*(.+)$/);
    if (h) {
      const level = Math.min(4, h[1].length);
      out.push(`<h${level}>${escapeHtml(h[2])}</h${level}>`);
      continue;
    }
    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(`<li>${escapeHtml(lines[i].replace(/^\s*[-*+]\s+/, ""))}</li>`);
        i++;
      }
      i--;
      out.push(`<ul>${items.join("")}</ul>`);
      continue;
    }
    let inline = escapeHtml(line)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, "<code>$1</code>")
      .replace(/\[(.+?)\]\((.+?)\)/g, (m: string, p1: string, p2: string) => `<a href=\"${escapeHtml(p2)}\" target=\"_blank\">${escapeHtml(p1)}</a>`);
    out.push(`<p>${inline}</p>`);
  }
  return out.join("\n");
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
      raw.match(/^([A-Za-z ]{3,40})\s*[:\-–—]\s*$/) || raw.match(/^([A-Za-z ]{3,40})\s*[:\-–—]\s*(.*)$/);
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
  if (extraContext && extraContext.trim()) base.push(`Context for this session: ${extraContext}`);
  base.push(`If the user requests sources, include an array of sources with URL, title, and a one-line excerpt where possible.`);
  base.push(`Always prefer accuracy over inventing details; if uncertain, clearly state uncertainty and suggest next steps for research.`);
  return base.join(" ");
}

// -----------------------------
// Persistence helpers (localStorage)
// -----------------------------

const LS_KEY = "archeohub_v3_conversations";

function saveConversationToStorage(id: string, payload: { messages: Message[]; meta?: any }) {
  try {
    const idxRaw = localStorage.getItem(LS_KEY);
    const idx = idxRaw ? JSON.parse(idxRaw) : {};
    idx[id] = { id, title: payload.messages?.[0]?.text?.slice(0, 60) || "Conversation", updated: nowISO() };
    localStorage.setItem(LS_KEY, JSON.stringify(idx));
    localStorage.setItem(`archeohub_conv_${id}`, JSON.stringify(payload));
  } catch (e) {
    console.warn("Failed to save convo", e);
  }
}

function loadConversationFromStorage(id: string) {
  try {
    const raw = localStorage.getItem(`archeohub_conv_${id}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// -----------------------------
// Network helpers
// -----------------------------

async function postChat(apiUrl: string, payload: any, timeout = 120000) {
  return axios.post(apiUrl, payload, { timeout });
}

function startSSE(url: string, onMessage: (data: any) => void, onDone?: () => void, onError?: (err: any) => void) {
  const es = new EventSource(url);
  es.onmessage = (ev) => {
    try {
      const data = JSON.parse(ev.data);
      onMessage(data);
    } catch (e) {
      onMessage(ev.data);
    }
  };
  es.onerror = (err) => {
    es.close();
    onError?.(err);
    onDone?.();
  };
  return () => es.close();
}

async function retryWithBackoff<T>(fn: () => Promise<T>, attempts = 3, baseDelay = 500) {
  let lastErr: any = null;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      const wait = baseDelay * Math.pow(2, i);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw lastErr;
}

// -----------------------------
// Component
// -----------------------------

export default function ChatPage(): JSX.Element {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>(() => []);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [persona, setPersona] = useState<"Field Archaeologist" | "Museum Curator" | "Archaeological Theorist">("Field Archaeologist");
  const [depth, setDepth] = useState<number>(4);
  const [tone, setTone] = useState<"Formal" | "Accessible">("Formal");
  const [includeSources, setIncludeSources] = useState<boolean>(true);
  const [extraContext, setExtraContext] = useState<string>("");
  const [useStreaming, setUseStreaming] = useState<boolean>(false);
  const [streamingText, setStreamingText] = useState<string>("");

  const messagesRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streamingText]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const EXAMPLES = [
    "What can the pottery styles at a Bronze Age site tell us about trade networks?",
    "Explain the likely sequence of activity at a burial mound with stratified layers.",
    "How do archaeologists use soil chemistry to detect ancient habitation?",
  ];

  function handleEmptyAssistantResult(placeholderId: string) {
    const assistantMsg: Message = {
      id: uid("a_"),
      role: "assistant",
      text: "The assistant returned no text. You can retry the request or inspect the raw payload.",
      ts: nowISO(),
      error: true,
    };
    setMessages((prev) => prev.filter((p) => p.id !== placeholderId).concat(assistantMsg));
    setErrorMsg("Assistant returned empty response. Try re-sending or switch to non-streaming mode.");
  }

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
      const payload = { query: text, options: { systemPrompt, depth, tone, includeSources } };

      if (useStreaming) {
        try {
          setStreamingText("");
          const sseUrl = (API_BASE ? `${API_BASE}/api/stream` : "/api/stream") + `?q=${encodeURIComponent(text)}`;
          const cancel = startSSE(
            sseUrl,
            (data) => {
              if (typeof data === "string") {
                setStreamingText((s) => s + data);
              } else if (data?.chunk) {
                setStreamingText((s) => s + data.chunk);
              } else if (data?.final) {
                const assistantPayload = data.final;
                const assistantText = assistantPayload?.text || "";
                const assistantSources = Array.isArray(assistantPayload?.sources) ? assistantPayload.sources : [];
                const structured = parseStructuredSections(assistantText) || undefined;
                const assistantMsg: Message = { id: uid("a_"), role: "assistant", text: assistantText, structured, sources: assistantSources, ts: nowISO() };
                setMessages((prev) => prev.filter((p) => p.id !== placeholderMsg.id).concat(assistantMsg));
                setStreamingText("");
                setLoading(false);
              }
            },
            () => { setLoading(false); },
            (err) => { console.warn("SSE error, falling back to POST", err); }
          );
          setTimeout(() => cancel(), 110000);
          return;
        } catch (sseErr) {
          console.warn("Streaming failed, falling back to regular POST", sseErr);
        }
      }

      const res = await retryWithBackoff(() => postChat(url, payload), 3, 500);
      const assistantPayload = res.data;

      let assistantText = "";
      let assistantSources: Source[] = [];

      if (!assistantPayload) {
        handleEmptyAssistantResult(placeholderMsg.id);
        setLoading(false);
        return;
      }

      if (typeof assistantPayload === "string") {
        assistantText = assistantPayload;
      } else if (assistantPayload?.text) {
        assistantText = assistantPayload.text;
        if (Array.isArray(assistantPayload.sources)) assistantSources = assistantPayload.sources;
      } else if (assistantPayload?.choices && Array.isArray(assistantPayload.choices)) {
        assistantText = assistantPayload.choices.map((c: any) => c.text || c.message?.content || "").join("\n");
        if (assistantPayload?.sources) assistantSources = assistantPayload.sources;
      } else {
        assistantText = JSON.stringify(assistantPayload, null, 2);
      }

      if (!assistantText || assistantText.trim().length === 0) {
        handleEmptyAssistantResult(placeholderMsg.id);
        return;
      }

      const structured = parseStructuredSections(assistantText) || undefined;
      const assistantMsg: Message = { id: uid("a_"), role: "assistant", text: assistantText, structured, sources: assistantSources, ts: nowISO() };
      setMessages((prev) => prev.filter((p) => p.id !== placeholderMsg.id).concat(assistantMsg));
    } catch (err: any) {
      console.error("Chat error:", err);
      const serverMsg = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Sorry — an unexpected error occurred.";
      const assistantMsg: Message = { id: uid("a_"), role: "assistant", text: String(serverMsg), sources: [], ts: nowISO(), error: true };
      setMessages((prev) => prev.filter((p) => p.id !== placeholderMsg.id).concat(assistantMsg));
      setErrorMsg(typeof serverMsg === "string" ? serverMsg : "Request failed");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [API_BASE, depth, extraContext, includeSources, loading, persona, query, tone, useStreaming]);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading) send();
    }
  }

  async function exportConversationTxt() {
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

  async function exportConversationJson() {
    const payload = { messages, meta: { persona, depth, tone, exportedAt: nowISO() } };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `archeohub-conversation-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function importConversationJson(file: File) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(String(ev.target?.result || ""));
        if (Array.isArray(data.messages)) setMessages(data.messages);
      } catch (e) {
        alert("Failed to import file: invalid JSON");
      }
    };
    reader.readAsText(file);
  }

  function editMessage(id: string, newText: string) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, text: newText, edited: true } : m)));
  }
  function deleteMessage(id: string) {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }
  function togglePinMessage(id: string) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, pinned: !m.pinned } : m)));
  }

  const [searchTerm, setSearchTerm] = useState("");
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);

  const visibleMessages = messages.filter((m) => {
    if (showPinnedOnly && !m.pinned) return false;
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (m.text || "").toLowerCase().includes(s) || (m.sources || []).some((src) => (src.title || "").toLowerCase().includes(s) || (src.url || "").toLowerCase().includes(s));
  });

  function retryLast() {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (lastUser) {
      setQuery(lastUser.text);
      setTimeout(() => send(), 80);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div className="left">
          <button className="back" onClick={() => router.push("/")}>← Back</button>
          <h1>ArcheoHub — Archaeologist Chat (Enhanced)</h1>
          <p className="muted">Improved robustness and UX — dark blue & white palette.</p>
        </div>

        <div className="controls" aria-hidden>
          <label className="control-row">
            <span>Persona</span>
            <select value={persona} onChange={(e) => setPersona(e.target.value as any)}>
              <option>Field Archaeologist</option>
              <option>Museum Curator</option>
              <option>Archaeological Theorist</option>
            </select>
          </label>

          <label className="control-row">
            <span>Depth</span>
            <input type="range" min={1} max={5} value={depth} onChange={(e) => setDepth(Number(e.target.value))} />
            <span className="small muted"> {depth}</span>
          </label>

          <label className="control-row">
            <span>Tone</span>
            <select value={tone} onChange={(e) => setTone(e.target.value as any)}>
              <option>Formal</option>
              <option>Accessible</option>
            </select>
          </label>

          <label className="control-row"><input id="srcToggle" type="checkbox" checked={includeSources} onChange={() => setIncludeSources((s) => !s)} /><span>Include sources</span></label>
          <label className="control-row"><input id="streamToggle" type="checkbox" checked={useStreaming} onChange={() => setUseStreaming((s) => !s)} /><span>Use streaming (SSE)</span></label>

          <button className="small-btn" onClick={() => { setExtraContext("User is a late medieval ceramicist seeking technical interpretation of glazes."); alert("Advanced context set to an example. Edit as needed."); }}>Quick context example</button>

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button className="small-btn" onClick={exportConversationTxt}>Export txt</button>
            <button className="small-btn" onClick={exportConversationJson}>Export json</button>
          </div>
        </div>
      </header>

      <main className="chat-area" role="region" aria-label="ArcheoHub chat">
        <aside className="sidebar">
          <section className="examples">
            <h3>Examples</h3>
            <ul>
              {EXAMPLES.map((ex, i) => (
                <li key={i}><button className="example" onClick={() => { setQuery(ex); inputRef.current?.focus(); }}>{ex}</button></li>
              ))}
            </ul>

            <h4 className="muted">Advanced context</h4>
            <textarea value={extraContext} onChange={(e) => setExtraContext(e.target.value)} placeholder="Optional: give the assistant background (site, period, dataset)" rows={4} />

            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input placeholder="Search messages" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <button onClick={() => { setSearchTerm(''); setShowPinnedOnly(false); }}>Clear</button>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}><input type="checkbox" checked={showPinnedOnly} onChange={() => setShowPinnedOnly((s) => !s)} /><span>Show pinned only</span></label>
            </div>

            <div style={{ marginTop: 12 }}>
              <h4 className="muted">Import</h4>
              <input type="file" accept="application/json" onChange={(e) => { if (e.target.files?.[0]) importConversationJson(e.target.files[0]); }} />
            </div>
          </section>
        </aside>

        <section className="chat-shell">
          <div className="messages" ref={messagesRef}>
            {messages.length === 0 && (
              <div className="welcome"><h2>Welcome — ArcheoHub</h2><p className="muted">Ask an archaeological question or pick an example on the left. Increase depth for longer, more technical answers.</p></div>
            )}

            {visibleMessages.map((m) => {
              const isUser = m.role === "user";
              return (
                <article key={m.id} className={`msg ${isUser ? "user" : "assistant"} ${m.error ? "error" : ""}`}>
                  {!isUser && <div className="avatar" aria-hidden>{ASSISTANT_AVATAR}</div>}
                  <div className="msg-body">
                    <div className="msg-header"><strong>{isUser ? "You" : "Archaeologist"}</strong><span className="time">{formatTime(m.ts)}</span></div>

                    {m.structured ? (
                      <div className="sections">
                        {Object.entries(m.structured).map(([k, v]) => (
                          <div key={k} className="section"><div className="section-title">{k}</div><div className="section-body" dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(v) }} /></div>
                        ))}
                      </div>
                    ) : (
                      <div className="text" style={{ whiteSpace: "pre-wrap" }} dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(m.text || "") }} />
                    )}

                    {m.sources && m.sources.length > 0 && (
                      <div className="sources"><div className="sources-title">Sources</div><ul>
                        {m.sources.map((s, idx) => (
                          <li key={idx} className="source"><div className="source-left"><div className="domain">{getDomain(s.url)}</div><a href={s.url} target="_blank" rel="noreferrer" className="link">{s.title || s.url}</a>{s.excerpt && <div className="excerpt">{s.excerpt}</div>}</div><div className="source-actions"><button className="tiny" onClick={() => window.open(s.url, "_blank", "noopener")}>🔗</button><button className="tiny" onClick={async () => { const ok = await copyToClipboard(s.url); alert(ok ? "Copied link" : "Copy failed"); }}>📋</button></div></li>
                        ))}
                      </ul></div>
                    )}

                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button onClick={() => { editMessage(m.id, prompt('Edit message', m.text || '') || m.text || ''); }} className="tiny">Edit</button>
                      <button onClick={() => deleteMessage(m.id)} className="tiny">Delete</button>
                      <button onClick={() => togglePinMessage(m.id)} className="tiny">{m.pinned ? 'Unpin' : 'Pin'}</button>
                      <button onClick={async () => { const ok = await copyToClipboard(m.text || ''); alert(ok ? 'Copied' : 'Copy failed'); }} className="tiny">Copy</button>
                    </div>
                  </div>
                  {isUser && <div className="avatar" aria-hidden>{USER_AVATAR}</div>}
                </article>
              );
            })}

            {streamingText && (
              <article className={`msg assistant`}><div className="avatar">{ASSISTANT_AVATAR}</div><div className="msg-body"><div className="msg-header"><strong>Archaeologist (streaming)</strong><span className="time">{formatTime(nowISO())}</span></div><div className="text" style={{ whiteSpace: 'pre-wrap' }}>{streamingText}</div></div></article>
            )}
          </div>

          <div className="input-bar">
            <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={onKeyDown} placeholder="Ask an archaeological question (e.g. 'What does pottery X indicate about chronology?')" aria-label="Ask ArcheoHub" disabled={loading} />
            <button className="send" onClick={() => send()} disabled={loading || !query.trim()}>{loading ? '…' : 'Send'}</button>
          </div>
        </section>
      </main>

      <style jsx>{`
        :root {
          --bg: #071627; /* deep twilight navy */
          --panel: #0b2c46; /* cool navy panel */
          --muted: #9fbfd9; /* soft blue */
          --border: #15445f;
          --accent: #ffffff; /* clean white text */
          --cta: #63b3ed; /* soft blue CTA */
          --cta-2: #ffd66b; /* warm highlight */
        }

        .page {
          background: linear-gradient(180deg, var(--bg), #02121a 80%);
          color: var(--accent);
          min-height: 100vh;
          font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
          padding: 1rem;
        }

        .page-header { display:flex; justify-content:space-between; gap:1rem; max-width:1200px; margin:0 auto 1rem; align-items:flex-start }
        .left { flex:1 }
        .back { background:transparent; border:none; color:var(--muted); cursor:pointer; margin-right:0.6rem }
        h1 { margin:0 0 6px 0; font-size:1.25rem }
        .muted { color:var(--muted); font-size:0.95rem }

        .controls { width:340px; display:flex; flex-direction:column; gap:0.6rem; align-items:stretch }
        .control-row { display:flex; align-items:center; gap:0.6rem; justify-content:space-between }
        select, input[type="range"], textarea { background:transparent; color:var(--accent); border:1px solid var(--border); padding:6px 8px; border-radius:8px }
        .small-btn { background:transparent; color:var(--accent); border:1px solid var(--border); padding:8px; border-radius:8px; cursor:pointer }

        .chat-area { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:340px 1fr; gap:1rem }
        .sidebar { background:transparent }
        .examples h3 { margin:0 0 6px 0 }
        .examples ul { list-style:none; padding:0; margin:0 0 8px 0; display:flex; flex-direction:column; gap:8px }
        .example { background:#061e2e; color:var(--accent); border:1px solid var(--border); padding:10px; border-radius:8px; text-align:left; cursor:pointer }

        .chat-shell { background:var(--panel); border-radius:12px; border:1px solid var(--border); display:flex; flex-direction:column; height:74vh; min-height:520px; overflow:hidden }
        .messages { padding:18px; overflow:auto; flex:1; display:flex; flex-direction:column; gap:12px }

        .welcome { text-align:center; color:var(--muted) }
        .msg { display:flex; gap:12px; align-items:flex-start }
        .msg.user { justify-content:flex-end }
        .avatar { width:44px; height:44px; border-radius:10px; background:#033c57; display:grid; place-items:center; font-size:18px; border:1px solid var(--border) }

        .msg-body { max-width:78%; background:#0a3b5a; border:1px solid var(--border); padding:14px; border-radius:12px }
        .msg.user .msg-body { background:var(--accent); color:#04202a; border-color:rgba(0,0,0,0.06) }
        .msg-header { display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:8px }
        .time { color:var(--muted); font-size:12px }

        .sections { display:flex; flex-direction:column; gap:8px }
        .section { background:#083a52; padding:10px; border-radius:10px; border:1px solid rgba(255,255,255,0.02) }
        .section-title { font-weight:700; margin-bottom:6px; color:var(--cta-2) }
        .section-body { color:var(--accent); white-space:pre-wrap }

        .text { white-space:pre-wrap; color:var(--accent) }

        .sources { margin-top:12px; border-top:1px dashed var(--border); padding-top:10px }
        .sources-title { font-weight:700; margin-bottom:6px; color:var(--accent) }
        .source { display:flex; justify-content:space-between; gap:12px; padding:8px 0; border-bottom:1px dashed rgba(255,255,255,0.02) }
        .source:last-child { border-bottom:none }
        .domain { color:var(--muted); font-size:12px }
        .link { color:var(--cta); font-weight:600; text-decoration:none }
        .excerpt { color:var(--muted); font-size:13px; margin-top:4px }

        .source-actions { display:flex; gap:8px }
        .tiny { background:transparent; color:var(--accent); border:1px solid var(--border); padding:6px; border-radius:6px; cursor:pointer }

        .input-bar { display:flex; gap:8px; padding:14px; border-top:1px solid var(--border); background:linear-gradient(180deg, rgba(255,255,255,0.01), transparent) }
        input[placeholder], textarea[placeholder] { color:rgba(255,255,255,0.6) }

        input[type="text"], input[type="search"], input[type="email"], input[type="url"] { background:#07121a; border:1px solid var(--border); color:var(--accent); padding:12px 14px; border-radius:10px; flex:1 }
        .send { min-width:110px; background:var(--cta); color:#04202a; border:none; padding:11px 14px; border-radius:10px; cursor:pointer; font-weight:700 }
        .send:disabled { opacity:0.5; cursor:not-allowed }

        .code-block { background:#021b2a; padding:12px; border-radius:8px; overflow:auto }
        .code-block code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace; color:#bfefff }

        @media (max-width:980px) {
          .chat-area { grid-template-columns: 1fr }
          .controls { width:100%; order:2; display:flex; gap:8px; flex-wrap:wrap }
          .sidebar { order:1 }
        }
      `}</style>
    </div>
  );
}

