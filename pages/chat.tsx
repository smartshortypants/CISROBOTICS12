import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

/**
 * ArcheoHub Chat page — archaeologist persona, deeper answers, structured rendering
 * (Same logic as before — only color theme changed to dark blue)
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
  const [persona, setPersona] = useState<
    "Field Archaeologist" | "Museum Curator" | "Archaeological Theorist"
  >("Field Archaeologist");
  const [depth, setDepth] = useState<number>(4); // 1..5
  const [tone, setTone] = useState<"Formal" | "Accessible">("Formal");
  const [includeSources, setIncludeSources] = useState<boolean>(true);
  const [extraContext, setExtraContext] = useState<string>(""); // advanced context

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

  const send = useCallback(
    async () => {
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
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "Sorry — an unexpected error occurred.";

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
    },
    [API_BASE, depth, extraContext, includeSources, loading, persona, query, tone]
  );

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
    <div className="page">
      <header className="page-header">
        <div className="left">
          <button className="back" onClick={() => router.push("/")}>
            ← Back
          </button>
          <h1>ArcheoHub — Archaeologist Chat</h1>
          <p className="muted">Ask questions; get in-depth, structured archaeological answers.</p>
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

          <label className="control-row">
            <input id="srcToggle" type="checkbox" checked={includeSources} onChange={() => setIncludeSources((s) => !s)} />
            <span>Include sources</span>
          </label>

          <button
            className="small-btn"
            onClick={() => {
              setExtraContext("User is a late medieval ceramicist seeking technical interpretation of glazes.");
              alert("Advanced context set to an example. Edit as needed.");
            }}
          >
            Quick context example
          </button>

          <button className="small-btn" onClick={exportConversation}>
            Export convo
          </button>
        </div>
      </header>

      <main className="chat-area" role="region" aria-label="ArcheoHub chat">
        <aside className="sidebar">
          <section className="examples">
            <h3>Examples</h3>
            <ul>
              {EXAMPLES.map((ex, i) => (
                <li key={i}>
                  <button
                    className="example"
                    onClick={() => {
                      setQuery(ex);
                      inputRef.current?.focus();
                    }}
                  >
                    {ex}
                  </button>
                </li>
              ))}
            </ul>
            <h4 className="muted">Advanced context</h4>
            <textarea
              value={extraContext}
              onChange={(e) => setExtraContext(e.target.value)}
              placeholder="Optional: give the assistant background (site, period, dataset)"
              rows={4}
            />
          </section>
        </aside>

        <section className="chat-shell">
          <div className="messages" ref={messagesRef}>
            {messages.length === 0 && (
              <div className="welcome">
                <h2>Welcome — ArcheoHub</h2>
                <p className="muted">
                  Ask an archaeological question or pick an example on the left. Increase depth for longer, more technical answers.
                </p>
              </div>
            )}

            {messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <article key={m.id} className={`msg ${isUser ? "user" : "assistant"} ${m.error ? "error" : ""}`}>
                  {!isUser && <div className="avatar" aria-hidden>{ASSISTANT_AVATAR}</div>}

                  <div className="msg-body">
                    <div className="msg-header">
                      <strong>{isUser ? "You" : "Archaeologist"}</strong>
                      <span className="time">{formatTime(m.ts)}</span>
                    </div>

                    {m.structured ? (
                      <div className="sections">
                        {Object.entries(m.structured).map(([k, v]) => (
                          <div key={k} className="section">
                            <div className="section-title">{k}</div>
                            <div className="section-body">{v}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text" style={{ whiteSpace: "pre-wrap" }}>
                        {m.text}
                      </div>
                    )}

                    {m.sources && m.sources.length > 0 && (
                      <div className="sources">
                        <div className="sources-title">Sources</div>
                        <ul>
                          {m.sources.map((s, idx) => (
                            <li key={idx} className="source">
                              <div className="source-left">
                                <div className="domain">{getDomain(s.url)}</div>
                                <a href={s.url} target="_blank" rel="noreferrer" className="link">
                                  {s.title || s.url}
                                </a>
                                {s.excerpt && <div className="excerpt">{s.excerpt}</div>}
                              </div>
                              <div className="source-actions">
                                <button
                                  className="tiny"
                                  onClick={() => window.open(s.url, "_blank", "noopener")}
                                >
                                  🔗
                                </button>
                                <button
                                  className="tiny"
                                  onClick={async () => {
                                    const ok = await copyToClipboard(s.url);
                                    alert(ok ? "Copied link" : "Copy failed");
                                  }}
                                >
                                  📋
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {isUser && <div className="avatar" aria-hidden>{USER_AVATAR}</div>}
                </article>
              );
            })}
          </div>

          <div className="input-bar">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask an archaeological question (e.g. 'What does pottery X indicate about chronology?')"
              aria-label="Ask ArcheoHub"
              disabled={loading}
            />
            <button className="send" onClick={() => send()} disabled={loading || !query.trim()}>
              {loading ? "…" : "Send"}
            </button>
          </div>
        </section>
      </main>

      <style jsx>{`
        :root {
          --bg: #0b1a2a;
          --panel: #112b44;
          --muted: #80a0c0;
          --border: #1a3a5a;
          --accent: #88c0ff;
          --btn: #3399ff;
          --btn-hover: #66b2ff;
        }
        .page {
          background: var(--bg);
          color: var(--accent);
          min-height: 100vh;
          font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
          padding: 1rem;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          max-width: 1100px;
          margin: 0 auto 1rem;
          align-items: flex-start;
        }

        .left {
          flex: 1;
        }
        .back {
          background: transparent;
          border: none;
          color: var(--muted);
          cursor: pointer;
          margin-right: 0.6rem;
        }
        h1 {
          margin: 0 0 6px 0;
          font-size: 1.2rem;
        }
        .muted {
          color: var(--muted);
          font-size: 0.95rem;
        }

        .controls {
          width: 320px;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          align-items: stretch;
        }

        .control-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          justify-content: space-between;
        }
        select,
        input[type="range"],
        textarea {
          background: #0e2a48;
          color: var(--accent);
          border: 1px solid var(--border);
          padding: 6px 8px;
          border-radius: 8px;
        }
        .small-btn {
          background: #0f3a66;
          color: var(--accent);
          border: 1px solid var(--border);
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
        }

        .chat-area {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 1rem;
        }

        .sidebar {
          background: transparent;
        }
        .examples h3 {
          margin: 0 0 6px 0;
        }
        .examples ul {
          list-style: none;
          padding: 0;
          margin: 0 0 8px 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .example {
          background: #0f0f10;
          color: var(--accent);
          border: 1px solid var(--border);
          padding: 8px;
          border-radius: 8px;
          text-align: left;
          cursor: pointer;
        }

        .chat-shell {
          background: var(--panel);
          border-radius: 12px;
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          height: 72vh;
          min-height: 500px;
          overflow: hidden;
        }

        .messages {
          padding: 16px;
          overflow: auto;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .welcome {
          text-align: center;
          color: var(--muted);
        }

        .msg {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .msg.user {
          justify-content: flex-end;
        }
        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: #0c2b50;
          display: grid;
          place-items: center;
          font-size: 18px;
          border: 1px solid var(--border);
        }

        .msg-body {
          max-width: 78%;
          background: #0c345b;
          border: 1px solid var(--border);
          padding: 12px;
          border-radius: 10px;
        }
        .msg-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }
        .time {
          color: var(--muted);
          font-size: 12px;
        }

        .sections {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .section {
          background: #0a2743;
          padding: 8px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.02);
        }
        .section-title {
          font-weight: 700;
          margin-bottom: 6px;
          color: var(--accent);
        }
        .section-body {
          color: var(--accent);
          white-space: pre-wrap;
        }

        .text {
          white-space: pre-wrap;
          color: var(--accent);
        }

        .sources {
          margin-top: 10px;
          border-top: 1px dashed var(--border);
          padding-top: 10px;
        }
        .sources-title {
          font-weight: 700;
          margin-bottom: 6px;
          color: var(--accent);
        }
        .source {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 8px 0;
          border-bottom: 1px dashed rgba(255, 255, 255, 0.02);
        }
        .source:last-child {
          border-bottom: none;
        }
        .domain {
          color: var(--muted);
          font-size: 12px;
        }
        .link {
          color: var(--btn);
          font-weight: 600;
          text-decoration: none;
        }
        .excerpt {
          color: var(--muted);
          font-size: 13px;
          margin-top: 4px;
        }

        .source-actions {
          display: flex;
          gap: 8px;
        }
        .tiny {
          background: transparent;
          color: var(--accent);
          border: 1px solid var(--border);
          padding: 6px;
          border-radius: 6px;
          cursor: pointer;
        }

        .input-bar {
          display: flex;
          gap: 8px;
          padding: 12px;
          border-top: 1px solid var(--border);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.01), transparent);
        }
        input[placeholder],
        textarea[placeholder] {
          color: rgba(255, 255, 255, 0.6);
        }

        input[type="text"],
        input[type="search"],
        input[type="email"],
        input[type="url"] {
          background: #0d0d0e;
          border: 1px solid var(--border);
          color: var(--accent);
          padding: 10px 12px;
          border-radius: 8px;
          flex: 1;
        }
        .send {
          min-width: 96px;
          background: var(--btn);
          color: #0b0b0d;
          border: none;
          padding: 10px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
        }
        .send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .muted {
          color: var(--muted);
        }
        .small {
          font-size: 12px;
        }

        @media (max-width: 980px) {
          .chat-area {
            grid-template-columns: 1fr;
          }
          .controls {
            width: 100%;
            order: 2;
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }
          .sidebar {
            order: 1;
          }
        }
      `}</style>
    </div>
  );
}
