import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'

const ASSISTANT_AVATAR = '🤖'
const USER_AVATAR = '🧑'

export default function Chat() {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const messagesRef = useRef<HTMLDivElement | null>(null)

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  async function send() {
    const text = query.trim()
    if (!text) return
    const userMsg = { role: 'user', text }
    setMessages((m) => [...m, userMsg])
    setQuery('')
    setLoading(true)
    try {
      const url = API_BASE ? `${API_BASE}/api/chat` : '/api/chat'
      const res = await axios.post(url, { query: text })
      setMessages((m) => [...m, res.data])
    } catch (err: any) {
      console.error('Chat send error:', err)
      const serverMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Sorry — an unexpected error occurred.'
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: serverMsg, sources: [] }
      ])
    } finally {
      setLoading(false)
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!loading) send()
    }
  }

  return (
    <div className="container">
      <h1 style={{ margin: 0, marginBottom: 8 }}>ArcheoHub</h1>
      <p style={{ marginTop: 0, color: '#666666' }}>Monochrome demo — answers with optional live web sources.</p>

      <div className="chat-shell" role="region" aria-label="Chat">
        <div className="messages" ref={messagesRef}>
          {messages.map((m, i) => {
            const isUser = m.role === 'user'
            return (
              <div key={i} className={`msg-row ${isUser ? 'user' : 'assistant'}`}>
                {!isUser && <div className="avatar" aria-hidden>{ASSISTANT_AVATAR}</div>}
                <div className="bubble">
                  <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                  {m.sources && m.sources.length > 0 && (
                    <div className="sources">
                      <div style={{ fontWeight: 700, marginBottom: 6, color: '#000' }}>Sources</div>
                      <ul style={{ paddingLeft: 18, margin: 0 }}>
                        {m.sources.map((s: any, idx: number) => (
                          <li key={idx} style={{ marginBottom: 6 }}>
                            <a href={s.url} target="_blank" rel="noreferrer">{s.title || s.url}</a>
                            <div style={{ color: '#666666', fontSize: 13 }}>{s.excerpt}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {isUser && <div className="avatar" aria-hidden>{USER_AVATAR}</div>}
              </div>
            )
          })}
        </div>

        <div className="input-bar">
          <input
            className="input"
            placeholder="Ask ArcheoHub..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={loading}
            aria-label="Ask ArcheoHub"
          />
          <button
            className="btn"
            onClick={send}
            disabled={loading || !query.trim()}
            aria-label="Send"
          >
            {loading ? '…' : 'Send'}
          </button>
        </div>
      </div>

      <div style={{ marginTop: 10, fontSize: 13, color: '#666' }}>
        Tip: If you see errors, open DevTools → Network and check the POST to <code>/api/chat</code> for the response body.
      </div>
    </div>
  )
}
