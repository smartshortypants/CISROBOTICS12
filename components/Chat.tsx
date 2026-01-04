import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

type Role = "user" | "assistant";

type Source = {
  url: string;
  title?: string;
  excerpt?: string;
};

type Message = {
  id: string;
  role: Role;
  text: string;
  sources?: Source[];
  ts?: string; // ISO timestamp
  error?: boolean;
};

const ASSISTANT_AVATAR = "🤖";
const USER_AVATAR = "🧑";

function uid(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 9);
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

export default function Chat(): JSX.Element {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const send = useCallback(async () => {
    const text = query.trim();
    if (!text || loading) return;
    setErrorMsg(null);

    // create user message
    const userMsg: Message = {
      id: uid("u_"),
      role: "user",
      text,
      ts: new Date().toISOString(),
    };

    // optimistic assistant placeholder
    const placeholderMsg: Message = {
      id: uid("a_"),
      role: "assistant",
      text: "…",
      ts: new Date().toISOString(),
    };

    setMessages((m) => [...m, userMsg, placeholderMsg]);
    setQuery("");
    setLoading(true);

    try {
      const url = API_BASE ? `${API_BASE}/api/chat` : "/api/chat";
      const res = await axios.post(url, { query: text });

      // expected shape: { role: 'assistant', text: '...', sources: [...] }
      const assistantPayload = res.data;
      const assistantMsg: Message = {
        id: uid("a_"),
        role: "assistant",
        text:
          typeof assistantPayload === "string"
            ? assistantPayload
            : assistantPayload?.text ?? "No response text.",
        sources: Array.isArray(assistantPayload?.sources)
          ? assistantPayload.sources
          : [],
        ts: new Date().toISOString(),
      };

      // replace last placeholder with real assistant message
      setMessages((prev) => {
        // drop last placeholder (the one with text "…")
        const withoutPlaceholder = prev.filter((p) => p.id !== placeholderMsg.id);
        return [...withoutPlaceholder, assistantMsg];
      });
    } catch (err: any) {
      console.error("Chat send error:", err);
      const serverMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Sorry — an unexpected error occurred.";

      const assistantMsg: Message = {
        id: uid("a_"),
        role: "assistant",
        text: serverMsg,
        sources: [],
        ts: new Date().toISOString(),
        error: true,
      };

      setMessages((prev) => {
        const withoutPlaceholder = prev.filter((p) => p.id !== placeholderMsg.id);
        return [...withoutPlaceholder, assistantMsg];
      });

      setErrorMsg(typeof serverMsg === "string" ? serverMsg : "Request failed");
    } finally {
      setLoading(false);
      // ensure input focus returns for convenience
      inputRef.current?.focus();
    }
  }, [API_BASE, loading, query]);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading) send();
    }
  }

  return (
    <div className="container">
      <header className="header" role="banner">
        <div>
          <h1 className="title">ArcheoHub</h1>
          <p className="subtitle">Monochrome demo — answers may include live web sources.</p>
        </div>
      </header>

      <main className="chat-shell" role="region" aria-label="ArcheoHub chat">
        <div className="messages" ref={messagesRef}>
          {messages.length === 0 && (
            <div className="empty">
              <div className="empty-title">Welcome to ArcheoHub</div>
              <div className="empty-sub">Ask about artifacts, excavations, or history.</div>
            </div>
          )}

          {messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <article
                key={m.id}
                className={`msg-row ${isUser ? "user" : "assistant"} ${m.error ? "error" : ""}`}
                aria-live={isUser ? "polite" : "assertive"}
              >
                {!isUser && <div className="avatar" aria-hidden>{ASSISTANT_AVATAR}</div>}

                <div className="bubble-wrap">
                  <div className="bubble">
                    <div className="bubble-top">
                      <div className="bubble-text" style={{ whiteSpace: "pre-wrap" }}>
                        {m.text}
                      </div>
                      <div className="meta">
                        <span className="time">{formatTime(m.ts)}</span>
                        {m.error && <span className="err-tag">error</span>}
                      </div>
                    </div>

                    {m.sources && m.sources.length > 0 && (
                      <div className="sources" role="group" aria-label="Sources">
                        <div className="sources-title">Sources</div>
                        <ul className="sources-list">
                          {m.sources.map((s, idx) => (
                            <li key={idx} className="source-item">
                              <div className="source-left">
                                <div className="source-domain">{getDomain(s.url)}</div>
                                <a
                                  className="source-link"
                                  href={s.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  title={s.title || s.url}
                                >
                                  {s.title || s.url}
                                </a>
                                {s.excerpt && <div className="source-excerpt">{s.excerpt}</div>}
                              </div>

                              <div className="source-actions">
                                <button
                                  className="action"
                                  aria-label={`Open ${getDomain(s.url)}`}
                                  onClick={() => window.open(s.url, "_blank", "noopener")}
                                  title="Open link"
                                >
                                  🔗
                                </button>
                                <button
                                  className="action"
                                  aria-label={`Copy link ${s.url}`}
                                  onClick={async () => {
                                    const ok = await copyToClipboard(s.url);
                                    if (ok) {
                                      // quick visual feedback
                                      (document.activeElement as HTMLElement | null)?.blur();
                                      alert("Copied source link to clipboard");
                                    } else {
                                      alert("Failed to copy — try manually");
                                    }
                                  }}
                                  title="Copy link"
                                >
                                  📋
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                        <div className="sources-actions">
                          <button
                            className="small-btn"
                            onClick={() => {
                              // open all
                              m.sources?.forEach((s) => window.open(s.url, "_blank", "noopener"));
                            }}
                          >
                            Open all
                          </button>
                          <button
                            className="small-btn"
                            onClick={async () => {
                              const text = (m.sources || []).map((s) => `${s.title || s.url} — ${s.url}`).join("\n");
                              const ok = await copyToClipboard(text);
                              alert(ok ? "Copied all sources" : "Failed to copy sources");
                            }}
                          >
                            Copy all
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {isUser && <div className="avatar" aria-hidden>{USER_AVATAR}</div>}
              </article>
            );
          })}
        </div>

        <div className="input-bar">
          <input
            ref={inputRef}
            className="input"
            placeholder="Ask ArcheoHub..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={loading}
            aria-label="Ask ArcheoHub"
            spellCheck={false}
          />
          <button
            className="btn"
            onClick={() => send()}
            disabled={loading || !query.trim()}
            aria-label="Send"
          >
            {loading ? "… " : "Send"}
          </button>
        </div>
      </main>

      <div className="footer-note" role="status" aria-live="polite">
        {errorMsg ? <span className="error-note">Error: {errorMsg}</span> : null}
        <span className="tip">Tip: check DevTools Network tab if requests fail.</span>
      </div>

      <style jsx>{`
        .container {
          max-width: 980px;
          margin: 1.4rem auto;
          padding: 1rem;
          font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
          color: #fff;
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.6rem;
        }

        .title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .subtitle {
          margin: 0.15rem 0 0;
          color: #9a9aa0;
          font-size: 0.9rem;
        }

        .chat-shell {
          background: #0b0b0d;
          border-radius: 12px;
          border: 1px solid #222227;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 12px;
          height: 72vh;
          min-height: 420px;
        }

        .messages {
          padding: 16px;
          overflow: auto;
          flex: 1;
        }

        .empty {
          text-align: center;
          color: #9a9aa0;
          margin-top: 40px;
        }

        .empty-title {
          font-weight: 600;
          margin-bottom: 6px;
        }

        .msg-row {
          display: flex;
          gap: 12px;
          align-items: flex-end;
          margin-bottom: 12px;
        }

        .msg-row.assistant {
          justify-content: flex-start;
        }
        .msg-row.user {
          justify-content: flex-end;
        }

        .avatar {
          width: 36px;
          height: 36px;
          display: inline-grid;
          place-items: center;
          background: #111;
          border: 1px solid #1f1f23;
          border-radius: 10px;
          font-size: 18px;
        }

        .bubble-wrap {
          max-width: 75%;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .bubble {
          background: #111214;
          border: 1px solid #222227;
          padding: 12px 14px;
          border-radius: 12px;
          color: #e9e9ea;
          box-shadow: 0 1px 0 rgba(255, 255, 255, 0.02) inset;
        }

        .bubble-top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: start;
        }

        .bubble-text {
          white-space: pre-wrap;
          word-break: break-word;
          font-size: 0.98rem;
          color: #eaeaea;
        }

        .meta {
          font-size: 11px;
          color: #9a9aa0;
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .time {
          color: #8f8f95;
        }

        .err-tag {
          background: #2f1111;
          color: #ffb5b5;
          padding: 2px 6px;
          border-radius: 8px;
          font-size: 11px;
        }

        .sources {
          margin-top: 10px;
          background: #0f0f10;
          border: 1px solid #1b1b1e;
          padding: 10px;
          border-radius: 10px;
        }

        .sources-title {
          font-weight: 700;
          color: #eaeaea;
          margin-bottom: 8px;
        }

        .sources-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .source-item {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          border-top: 1px dashed #19191b;
          padding-top: 8px;
        }

        .source-item:first-child {
          border-top: none;
          padding-top: 0;
        }

        .source-left {
          flex: 1;
          min-width: 0;
        }

        .source-domain {
          font-size: 12px;
          color: #9a9aa0;
          margin-bottom: 4px;
        }

        .source-link {
          display: block;
          color: #eaeaea;
          text-decoration: none;
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 560px;
        }

        .source-excerpt {
          margin-top: 6px;
          color: #9a9aa0;
          font-size: 13px;
        }

        .source-actions {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .action {
          background: transparent;
          border: 1px solid #222227;
          color: #eaeaea;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          cursor: pointer;
          display: inline-grid;
          place-items: center;
        }

        .action:hover {
          transform: translateY(-2px);
        }

        .sources-actions {
          display: flex;
          gap: 8px;
          margin-top: 10px;
        }

        .small-btn {
          background: #111;
          color: #eaeaea;
          border: 1px solid #202023;
          padding: 6px 10px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
        }

        .input-bar {
          display: flex;
          gap: 8px;
          padding: 12px;
          border-top: 1px solid #17171a;
          background: linear-gradient(180deg, rgba(255,255,255,0.01), transparent);
        }

        .input {
          flex: 1;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid #1f1f23;
          background: #0d0d0e;
          color: #ffffff;
          outline: none;
        }

        .input:disabled {
          opacity: 0.6;
        }

        .btn {
          min-width: 84px;
          padding: 10px 12px;
          border-radius: 10px;
          border: 0;
          background: #e9e9ea;
          color: #060607;
          font-weight: 600;
          cursor: pointer;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .footer-note {
          margin-top: 8px;
          color: #9a9aa0;
          font-size: 13px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
        }

        .error-note {
          color: #ffb5b5;
        }

        @media (max-width: 640px) {
          .container {
            margin: 0.6rem;
            padding: 0.6rem;
          }
          .chat-shell {
            height: 72vh;
          }
          .bubble-wrap {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

