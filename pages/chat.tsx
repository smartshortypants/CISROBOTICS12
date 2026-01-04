import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

type Role = "user" | "assistant";

type Message = {
  id: string;
  role: Role;
  text: string;
  ts?: string;
  error?: boolean;
};

type Settings = {
  dark: boolean;
  accent: string; // hex
  avatarMode: "emoji" | "initials" | "image";
  assistantImage?: string;
  userImage?: string;
};

const DEFAULT_SETTINGS: Settings = {
  dark: true,
  accent: "#0ea5a4", // default branding-ish teal — change via color picker
  avatarMode: "emoji",
  assistantImage: "",
  userImage: "",
};

const AVATAR_ASSISTANT = "🤖";
const AVATAR_USER = "🧑";

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
        out.push(
          `<pre class="code-block" role="region" aria-label="code"><code data-lang="${escapeHtml(
            codeLang
          )}">`
        );
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
    if (/^>\s+/.test(line)) {
      out.push(`<blockquote>${escapeHtml(line.replace(/^>\s+/, ""))}</blockquote>`);
      continue;
    }
    if (/^\s*[-*+]\s+/.test(line)) {
      out.push(`<li>${escapeHtml(line.replace(/^\s*[-*+]\s+/, ""))}</li>`);
      continue;
    }
    let html = escapeHtml(line)
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    out.push(`<p>${html}</p>`);
  }
  return out.join("\n");
}

// simple color lighten/darken helper
function adjustColor(hex: string, percent: number) {
  try {
    const sanitized = hex.replace("#", "");
    const num = parseInt(sanitized, 16);
    let r = (num >> 16) + Math.round(255 * percent);
    let g = ((num >> 8) & 0x00ff) + Math.round(255 * percent);
    let b = (num & 0x0000ff) + Math.round(255 * percent);
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
  } catch {
    return hex;
  }
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const raw = localStorage.getItem("chat_messages_v1");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const raw = localStorage.getItem("chat_settings_v1");
      return raw ? JSON.parse(raw) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("chat_messages_v1", JSON.stringify(messages));
    } catch {}
    if (listRef.current) {
      listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem("chat_settings_v1", JSON.stringify(settings));
    } catch {}
  }, [settings]);

  const send = useCallback(
    async (maybeText?: string) => {
      const text = (maybeText ?? input).trim();
      if (!text) return;
      const userMsg: Message = {
        id: uid("m_"),
        role: "user",
        text,
        ts: nowISO(),
      };
      setMessages((s) => [...s, userMsg]);
      setInput("");
      setLoading(true);
      try {
        const res = await axios.post("/api/chat", { prompt: userMsg.text });
        const assistantText = res.data?.text ?? "(no response)";
        const assistantMsg: Message = {
          id: uid("m_"),
          role: "assistant",
          text: assistantText,
          ts: nowISO(),
        };
        setMessages((s) => [...s, assistantMsg]);
      } catch (err) {
        const assistantMsg: Message = {
          id: uid("m_"),
          role: "assistant",
          text: "Sorry — could not reach the assistant. Try again later.",
          ts: nowISO(),
          error: true,
        };
        setMessages((s) => [...s, assistantMsg]);
      } finally {
        setLoading(false);
      }
    },
    [input]
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const clear = () => {
    setMessages([]);
    try {
      localStorage.removeItem("chat_messages_v1");
    } catch {}
  };

  function updateSetting<K extends keyof Settings>(k: K, v: Settings[K]) {
    setSettings((s) => ({ ...s, [k]: v }));
  }

  function renderAvatar(role: Role) {
    const mode = settings.avatarMode;
    if (mode === "emoji") {
      return <div className="avatar-emoji">{role === "assistant" ? AVATAR_ASSISTANT : AVATAR_USER}</div>;
    }
    if (mode === "initials") {
      const label = role === "assistant" ? "A" : "Y";
      return <div className="avatar-initials">{label}</div>;
    }
    // image mode
    const url = role === "assistant" ? settings.assistantImage : settings.userImage;
    if (url) {
      return <img className="avatar-img" src={url} alt={`${role} avatar`} onError={(e) => {
        // fallback to emoji if image fails
        (e.target as HTMLImageElement).style.display = "none";
      }} />;
    }
    // fallback to emoji
    return <div className="avatar-emoji">{role === "assistant" ? AVATAR_ASSISTANT : AVATAR_USER}</div>;
  }

  const accentStrong = adjustColor(settings.accent, -0.18);

  // inline CSS variables via style prop so color inputs update live
  const cssVars = {
    // cast to any to allow custom properties
    ["--accent" as any]: settings.accent,
    ["--accent-strong" as any]: accentStrong,
    ["--white" as any]: settings.dark ? "#ffffff" : "#081022",
    ["--bg" as any]: settings.dark ? "#06070a" : "#f7fafc",
    ["--panel" as any]: settings.dark ? "#0b0f14" : "#ffffff",
    ["--muted" as any]: settings.dark ? "#9aa6b2" : "#6b7280",
    ["--bubble-user" as any]: settings.dark ? "#0e1622" : "#eef2ff",
    ["--bubble-assistant" as any]: settings.dark ? "#0b1220" : "#f1f5f9",
  } as React.CSSProperties;

  return (
    <div className={`page-root ${settings.dark ? "theme-dark" : "theme-light"}`} style={cssVars}>
      <div className="header">
        <div className="title">Chat</div>

        <div className="actions">
          <button className="btn ghost" onClick={() => router.push("/")}>
            Home
          </button>

          <button
            className="btn ghost"
            title="Settings"
            onClick={() => setSettingsOpen((s) => !s)}
            aria-pressed={settingsOpen}
          >
            ⚙️
          </button>

          <button className="btn" onClick={clear}>
            New
          </button>
        </div>
      </div>

      {settingsOpen && (
        <section className="settings-panel" role="region" aria-label="Chat settings">
          <div className="settings-row">
            <label>Accent color</label>
            <input
              type="color"
              value={settings.accent}
              onChange={(e) => updateSetting("accent", e.target.value)}
              aria-label="Accent color"
            />
            <input
              type="text"
              value={settings.accent}
              onChange={(e) => updateSetting("accent", e.target.value)}
              className="hex-input"
            />
          </div>

          <div className="settings-row">
            <label>Theme</label>
            <div className="switches">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.dark}
                  onChange={(e) => updateSetting("dark", e.target.checked)}
                />
                <span>Dark mode</span>
              </label>
            </div>
          </div>

          <div className="settings-row">
            <label>Avatars</label>
            <select
              value={settings.avatarMode}
              onChange={(e) => updateSetting("avatarMode", e.target.value as any)}
            >
              <option value="emoji">Emoji</option>
              <option value="initials">Initials</option>
              <option value="image">Image (URL)</option>
            </select>
          </div>

          {settings.avatarMode === "image" && (
            <>
              <div className="settings-row">
                <label>Assistant image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={settings.assistantImage}
                  onChange={(e) => updateSetting("assistantImage", e.target.value)}
                />
              </div>
              <div className="settings-row">
                <label>Your image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={settings.userImage}
                  onChange={(e) => updateSetting("userImage", e.target.value)}
                />
              </div>
            </>
          )}
        </section>
      )}

      <main className="chat-area" role="main" aria-labelledby="chat-title">
        <div className="messages" ref={listRef} role="log" aria-live="polite">
          {messages.length === 0 && <div className="empty">No messages yet — say hello 👋</div>}

          {messages.map((m) => (
            <article key={m.id} className={`message ${m.role}`} aria-label={`${m.role} message`}>
              <div className="avatar" aria-hidden>
                {renderAvatar(m.role)}
              </div>

              <div className="bubble">
                <div className="meta">
                  <span className="role">{m.role === "assistant" ? "Assistant" : "You"}</span>
                  <span className="ts">{formatTime(m.ts)}</span>
                </div>

                <div
                  className="text"
                  dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(m.text || "") }}
                />

                {m.error && <div className="error">Error sending message</div>}
              </div>
            </article>
          ))}
        </div>

        <div className="composer" role="region" aria-label="Message composer">
          <textarea
            placeholder={loading ? "Sending..." : "Type a message and press Enter"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={2}
            disabled={loading}
            aria-label="Message input"
          />
          <div className="composer-actions">
            <button
              className="btn ghost"
              onClick={() => {
                setInput("");
              }}
              type="button"
            >
              Clear
            </button>
            <button
              className="btn primary"
              onClick={() => send()}
              disabled={loading}
              type="button"
              aria-disabled={loading}
            >
              {loading ? "…" : "Send"}
            </button>
          </div>
        </div>
      </main>

      <style jsx>{`
        :root {
          --bg: #06070a;
          --panel: #0b0f14;
          --muted: #9aa6b2;
          --accent: #0ea5a4;
          --accent-strong: #0b8f85;
          --bubble-user: #0e1622;
          --bubble-assistant: #0b1220;
          --white: #ffffff;
        }

        .page-root {
          min-height: 100vh;
          background: var(--bg);
          color: var(--white);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          box-sizing: border-box;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
            "Helvetica Neue", Arial;
        }

        .header {
          width: 100%;
          max-width: 960px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .title {
          font-size: 20px;
          font-weight: 600;
        }

        .actions {
          display: flex;
          gap: 8px;
        }

        .settings-panel {
          width: 100%;
          max-width: 960px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent);
          border: 1px solid rgba(255, 255, 255, 0.04);
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .settings-row {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .settings-row label {
          min-width: 140px;
          color: var(--muted);
        }

        .hex-input {
          width: 88px;
          padding: 6px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.04);
          background: rgba(255, 255, 255, 0.02);
          color: var(--white);
        }

        .chat-area {
          width: 100%;
          max-width: 960px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.01), transparent);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.6);
        }

        .messages {
          padding: 18px;
          height: 62vh;
          min-height: 320px;
          overflow: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .empty {
          color: var(--muted);
          text-align: center;
          margin-top: 28px;
        }

        .message {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .avatar {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .avatar-emoji {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01));
          border-radius: 8px;
          color: var(--white);
        }

        .avatar-initials {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          background: var(--accent);
          color: #041025;
          border-radius: 8px;
        }

        .avatar-img {
          width: 44px;
          height: 44px;
          object-fit: cover;
          border-radius: 8px;
          display: block;
        }

        .bubble {
          background: var(--panel);
          padding: 12px 14px;
          border-radius: 10px;
          max-width: 78%;
          color: var(--white);
          box-shadow: 0 1px 0 rgba(255, 255, 255, 0.02) inset;
          border: 1px solid rgba(255, 255, 255, 0.03);
        }

        .message.user {
          justify-content: flex-end;
        }

        .message.user .bubble {
          background: var(--bubble-user);
          margin-left: auto;
        }

        .message.assistant .bubble {
          background: var(--bubble-assistant);
          margin-right: auto;
        }

        .meta {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-bottom: 6px;
          color: var(--muted);
          font-size: 12px;
        }

        .role {
          color: var(--muted);
          text-transform: capitalize;
        }

        .ts {
          margin-left: 6px;
        }

        .text p {
          margin: 0 0 8px 0;
          color: var(--white);
          line-height: 1.45;
        }

        .text a {
          color: var(--accent);
          text-decoration: underline;
        }

        .text h1,
        .text h2,
        .text h3,
        .text h4 {
          color: var(--white);
          margin: 8px 0;
        }

        .text blockquote {
          margin: 0 0 8px 0;
          padding-left: 12px;
          border-left: 3px solid rgba(255, 255, 255, 0.06);
          color: var(--muted);
        }

        .text pre.code-block {
          background: rgba(0, 0, 0, 0.55);
          padding: 12px;
          border-radius: 8px;
          overflow: auto;
          color: #e6eef6;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Segoe UI Mono",
            monospace;
          font-size: 13px;
        }

        .error {
          color: #ff6b6b;
          margin-top: 8px;
          font-size: 13px;
        }

        .composer {
          display: flex;
          gap: 12px;
          padding: 12px;
          align-items: flex-end;
          border-top: 1px solid rgba(255, 255, 255, 0.02);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.005), transparent);
        }

        textarea {
          flex: 1;
          resize: none;
          min-height: 52px;
          max-height: 220px;
          padding: 12px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.02);
          color: var(--white);
          border: 1px solid rgba(255, 255, 255, 0.04);
          outline: none;
          font-size: 14px;
        }

        textarea::placeholder {
          color: rgba(255, 255, 255, 0.45);
        }

        textarea:focus {
          box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.14);
          border-color: var(--accent);
        }

        .composer-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .btn {
          padding: 8px 12px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.02);
          color: var(--white);
          border: 1px solid rgba(255, 255, 255, 0.04);
          cursor: pointer;
          font-weight: 600;
        }

        .btn.primary {
          background: linear-gradient(180deg, var(--accent), var(--accent-strong));
          color: #041025;
          border: none;
        }

        .btn.ghost {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.03);
        }

        .btn:disabled,
        .btn[aria-disabled="true"] {
          opacity: 0.5;
          cursor: default;
        }

        /* light theme overrides */
        .theme-light {
          --bg: #f7fafc;
          --panel: #ffffff;
          --muted: #6b7280;
          --white: #081022;
          --bubble-user: #eef2ff;
          --bubble-assistant: #f1f5f9;
        }

        @media (max-width: 640px) {
          .page-root {
            padding: 12px;
          }
          .chat-area {
            border-radius: 10px;
          }
          .avatar {
            width: 40px;
            height: 40px;
          }
          textarea {
            min-height: 48px;
          }
        }
      `}</style>
    </div>
  );
}
