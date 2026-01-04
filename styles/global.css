/* ============================================================
   ArcheoHub — All-in-one Global CSS (Dark, Modern, Chat UI)
   - Drop this into styles/global.css and import it in your app
   - Designed to cover sidebar, chat, actions, history, buttons,
     avatars, typing, animations, utilities, and responsive behavior
   - Author: ChatGPT (styling guidance)
   ============================================================ */

/* =========================
   THEME VARIABLES
   ========================= */
:root{
  /* Core palette */
  --bg-main: #060607;            /* page background (nearly-black) */
  --bg-panel: #0f0f12;           /* panels / cards */
  --bg-elevated: #141418;        /* chat bubble base */
  --bg-muted: #0b0b0d;
  --fg: #ffffff;                 /* primary text */
  --muted: #9aa0a6;              /* secondary text */
  --muted-2: #6f757b;            /* tertiary text */
  --accent: #7cc4ff;             /* primary accent (cool blue) */
  --accent-2: #7ef0c7;           /* secondary accent (teal) */
  --danger: #ff6b6b;             /* error / delete */
  --glass: rgba(255,255,255,0.03);
  --glass-2: rgba(138,180,248,0.06);

  /* borders & shadows */
  --border-1: rgba(255,255,255,0.04);
  --border-2: rgba(255,255,255,0.02);
  --shadow-soft: 0 6px 22px rgba(0,0,0,0.5);
  --shadow-strong: 0 18px 60px rgba(0,0,0,0.7);

  /* spacing scale */
  --gap-xs: 6px;
  --gap-sm: 10px;
  --gap-md: 16px;
  --gap-lg: 24px;
  --gap-xl: 36px;

  /* radii */
  --r-xs: 8px;
  --r-sm: 12px;
  --r-md: 16px;
  --r-lg: 20px;
  --r-pill: 999px;

  /* typography */
  --font-sans: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  --base-size: 15px;

  /* sizes */
  --sidebar-w: 300px;
  --right-w: 280px;
  --max-width: 1200px;

  /* transitions */
  --fast: 125ms;
  --med: 200ms;
  --slow: 360ms;
}

/* =========================
   RESET / BASE
   ========================= */
*,
*::before,
*::after { box-sizing: border-box; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

html, body, #__next {
  height: 100%;
  margin: 0;
  background: linear-gradient(180deg, var(--bg-main), #040405 120%);
  color: var(--fg);
  font-family: var(--font-sans);
  font-size: var(--base-size);
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
}

/* sensible defaults */
a { color: var(--accent); text-decoration: none; transition: color var(--fast); user-select: text; }
a:hover { color: #aee8ff; text-decoration: underline; }

img { display: block; max-width: 100%; height: auto; }

/* default container */
.container {
  max-width: var(--max-width);
  margin: 28px auto;
  padding: 18px;
  display: grid;
  grid-template-columns: var(--sidebar-w) 1fr var(--right-w);
  gap: var(--gap-lg);
  align-items: start;
  min-height: calc(100vh - 56px);
}

/* small screens adjust */
@media (max-width: 1100px){
  .container { grid-template-columns: 260px 1fr; grid-template-rows: auto 1fr; }
  .actions { display: none; }
}
@media (max-width: 760px){
  .container { grid-template-columns: 1fr; gap: var(--gap-md); padding: 12px; }
  .sidebar { order: 2; width: 100%; }
  .chat-shell { order: 1; width: 100%; }
}

/* panels / cards */
.panel {
  background: linear-gradient(180deg, var(--bg-panel), rgba(255,255,255,0.01));
  border-radius: var(--r-lg);
  border: 1px solid var(--border-1);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* =========================
   SIDEBAR: Past Chats & Controls
   ========================= */
.sidebar {
  width: var(--sidebar-w);
  min-height: 520px;
  display: flex;
  flex-direction: column;
  gap: var(--gap-md);
}

/* Top profile + controls row */
.sidebar .top {
  display: flex;
  gap: var(--gap-md);
  align-items: center;
  padding: 14px;
}
.brand {
  display: flex;
  gap: 12px;
  align-items: center;
}
.brand .logo {
  width:44px; height:44px; border-radius: 10px;
  display: grid; place-items: center; font-weight:700; font-size:18px;
  background: linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
  border: 1px solid var(--border-1);
  color: var(--fg);
}
.brand .title {
  font-size: 18px; font-weight: 700; line-height: 1;
}
.brand .subtitle {
  font-size: 12px; color: var(--muted);
}

/* top-right mini controls */
.sidebar .controls {
  margin-left: auto;
  display:flex; gap:8px; align-items:center;
}

/* new chat button (prominent) */
.btn-new {
  display:inline-flex; align-items:center; gap:8px;
  padding:8px 12px; border-radius: 12px; cursor:pointer;
  background: linear-gradient(90deg, var(--accent), #8ff0ff 140%);
  color: #061016; font-weight:700; border: none; box-shadow: 0 6px 20px rgba(124,196,255,0.12);
}
.btn-new svg { opacity: 0.95; transform: translateY(0); transition: transform var(--fast); }
.btn-new:hover { transform: translateY(-2px); }
.btn-ghost {
  background: transparent; border: 1px solid var(--border-1); color: var(--muted); padding:8px 10px; border-radius:10px;
}

/* search in sidebar */
.sidebar .search {
  padding: 12px 14px;
  display:flex; gap:10px; align-items:center;
  border-top: 1px solid var(--border-2); border-bottom: 1px solid var(--border-2);
  background: linear-gradient(180deg, rgba(255,255,255,0.01), transparent);
}
.sidebar .search input {
  flex:1; background: transparent; border: none; outline:none; color:var(--fg);
  font-size: 13px; padding: 6px 0;
}
.sidebar .search .icon { color: var(--muted); }

/* list sections: pinned / recent */
.chat-list {
  padding: 12px; display:flex; flex-direction: column; gap: 10px; overflow-y:auto;
}
.chat-section-title {
  font-size: 10px; letter-spacing: .12em; color: var(--muted); text-transform: uppercase; margin-bottom: 6px;
}

/* chat item */
.chat-item {
  display:flex; gap: 10px; align-items:center; padding:10px; border-radius:12px; cursor:pointer;
  transition: background var(--fast), transform var(--fast), box-shadow var(--fast);
  border: 1px solid transparent;
  background: transparent;
}
.chat-item .meta { display:flex; flex-direction:column; min-width:0; }
.chat-item .meta .title { font-size: 14px; font-weight:600; color:var(--fg); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.chat-item .meta .snippet { font-size: 12px; color: var(--muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.chat-item .avatar {
  width:40px; height:40px; border-radius:10px; display:grid; place-items:center; font-weight:700; color:#071018;
  background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)); border:1px solid var(--border-1);
}

/* hovered or active item */
.chat-item:hover { background: rgba(255,255,255,0.02); transform: translateY(-1px); }
.chat-item.active { background: linear-gradient(90deg, rgba(124,196,255,0.08), rgba(126,240,199,0.03)); border-color: rgba(124,196,255,0.12); box-shadow: 0 8px 30px rgba(124,196,255,0.06); }

/* item actions (rename/delete) */
.chat-item .actions { margin-left:auto; display:flex; gap:6px; align-items:center; opacity:0.9; }
.icon-btn { display:inline-grid; place-items:center; width:34px; height:34px; border-radius:8px; border:1px solid transparent; background:transparent; color:var(--muted); cursor:pointer; transition: background var(--fast), color var(--fast); }
.icon-btn:hover { background: rgba(255,255,255,0.03); color:var(--fg); }

/* pinned badge */
.badge { font-size: 11px; padding:4px 8px; border-radius: 999px; background: rgba(255,255,255,0.03); color:var(--muted); border: 1px solid var(--border-2); }

/* =========================
   CHAT: main conversation area
   ========================= */
.chat-shell {
  min-height: 520px;
  display:flex;
  flex-direction:column;
  gap:0;
}

/* chat header (title + controls) */
.chat-header {
  padding: 14px 18px;
  display:flex; align-items:center; gap:12px; justify-content: space-between;
  border-bottom: 1px solid var(--border-2);
  background: linear-gradient(180deg, rgba(255,255,255,0.01), transparent);
}
.chat-header .title { font-size:18px; font-weight:700; }
.chat-header .sub { font-size:12px; color:var(--muted); }

/* header controls */
.chat-header .ctrls { display:flex; gap:8px; align-items:center; }
.chat-header .ctrls .btn { font-size:13px; padding:8px 12px; border-radius:12px; }

/* message area (scrollable) */
.chat-messages {
  padding: 20px;
  overflow-y: auto;
  display:flex; flex-direction:column; gap: 14px;
  background:
    radial-gradient(600px 200px at 10% 10%, rgba(124,196,255,0.02), transparent 8%),
    linear-gradient(180deg, rgba(255,255,255,0.01), transparent);
}

/* message row - left or right alignment */
.msg-row {
  display:flex; gap: 12px; align-items:flex-end;
}
/* assistant left, user right */
.msg-row.assistant { justify-content:flex-start; }
.msg-row.user { justify-content:flex-end; }

/* avatar */
.msg-row .avatar {
  width: 44px; height:44px; border-radius:10px; display:grid; place-items:center;
  font-weight:700; font-size:14px; color:#071018;
  background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
  border:1px solid var(--border-1);
  flex-shrink:0;
}

/* bubble base */
.bubble {
  max-width: 76%;
  padding: 14px 18px;
  border-radius: var(--r-lg);
  color: var(--fg);
  font-size: 15px;
  line-height:1.5;
  border: 1px solid var(--border-2);
  box-shadow: 0 6px 20px rgba(0,0,0,0.6);
  transition: transform var(--fast), box-shadow var(--fast), background var(--fast);
  position: relative;
  word-break: break-word;
}

/* assistant bubble */
.bubble.assistant {
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  border-color: rgba(255,255,255,0.03);
}

/* user bubble: more distinct */
.bubble.user {
  background: linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  border-color: rgba(124,196,255,0.12);
  color: #ffffff;
  box-shadow: 0 12px 36px rgba(8,16,25,0.65);
}

/* bubble accent stripe (left) */
.bubble::before {
  content: "";
  position:absolute;
  left: -8px;
  top: 8px;
  bottom: 8px;
  width: 4px;
  border-radius: 4px;
  background: linear-gradient(180deg, rgba(138,180,248,0.9), rgba(126,240,199,0.55));
  opacity: 0.0;
  transition: opacity var(--fast);
}
.msg-row.assistant .bubble::before { opacity: 0.14; }
.msg-row.user .bubble::before { opacity: 0.18; }

/* timestamps and meta */
.bubble .meta {
  display:flex; gap:8px; align-items:center; margin-top:8px; color:var(--muted); font-size:12px;
}
.bubble .meta .time { color: var(--muted-2); }

/* message actions (copy/regenerate) - appear on hover */
.bubble .m-actions {
  position: absolute; right: 8px; top: 8px; display:flex; gap:6px; opacity:0; transform: translateY(-4px);
  transition: opacity var(--fast), transform var(--fast);
}
.bubble:hover .m-actions { opacity:1; transform: translateY(0); }
.action-small {
  min-width:34px; height:34px; border-radius:8px; display:grid; place-items:center; cursor:pointer;
  background: rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.02); color:var(--muted);
}
.action-small:hover { background: rgba(255,255,255,0.035); color:var(--fg); }

/* quoted / source links area inside bubble */
.bubble .sources {
  margin-top:10px; padding-top:8px; border-top:1px dashed rgba(255,255,255,0.02); font-size:13px; color:var(--muted-2);
}
.bubble .sources a { color: var(--accent); font-weight:600; }

/* code block inside message */
.bubble pre, .bubble code {
  background: rgba(0,0,0,0.35); padding:10px; border-radius:10px; overflow:auto; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace;
  color: #dbeafe; border: 1px solid rgba(255,255,255,0.02);
}

/* link preview card */
.link-card {
  display:flex; gap:12px; align-items:center; padding:12px; border-radius:12px; background: rgba(255,255,255,0.02);
  border:1px solid rgba(255,255,255,0.02);
}
.link-card .thumb { width:80px; height:56px; border-radius:8px; background:linear-gradient(180deg, #00000055, #00000022); flex-shrink:0; }
.link-card .info .title { font-weight:600; color:var(--fg); }
.link-card .info .desc { font-size:13px; color:var(--muted); }

/* =========================
   TYPING INDICATOR (animated)
   ========================= */
.typing {
  display:inline-flex; gap:6px; align-items:center; padding:8px 12px; border-radius: 999px; background: rgba(255,255,255,0.02);
}
.typing .dot {
  width:8px; height:8px; border-radius:50%; background:var(--muted); opacity:0.9; transform: translateY(0);
  animation: typing-bounce 1s infinite linear;
}
.typing .dot:nth-child(2){ animation-delay: 0.12s; }
.typing .dot:nth-child(3){ animation-delay: 0.24s; }
@keyframes typing-bounce {
  0% { transform: translateY(0); opacity:0.85; }
  30% { transform: translateY(-5px); opacity:1; }
  60% { transform: translateY(0); opacity:0.85; }
  100% { transform: translateY(0); opacity:0.85; }
}

/* =========================
   INPUT BAR (send message)
   ========================= */
.input-bar {
  padding: 14px 18px;
  display:flex; gap:12px; align-items:center; border-top: 1px solid var(--border-2);
  background: linear-gradient(180deg, transparent, rgba(255,255,255,0.012));
}
.input {
  flex: 1;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.02);
  color: var(--fg);
  outline: none;
  font-size: 15px;
  transition: box-shadow var(--fast), border-color var(--fast);
}
.input::placeholder { color: rgba(255,255,255,0.38); }
.input:focus { box-shadow: 0 6px 24px rgba(124,196,255,0.06); border-color: rgba(124,196,255,0.18); }

.btn {
  padding: 10px 14px; border-radius: 12px; cursor: pointer; font-weight:700; border: none;
  background: var(--accent); color: #071018; transition: transform var(--fast), box-shadow var(--fast);
  box-shadow: 0 10px 28px rgba(124,196,255,0.08);
}
.btn:hover { transform: translateY(-2px); box-shadow: var(--shadow-strong); }
.btn.secondary {
  background: transparent; border: 1px solid var(--border-1); color: var(--muted);
}

/* small disabled state */
.btn[disabled] { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }

/* quick actions under input */
.input-actions { margin-top:8px; display:flex; gap:8px; align-items:center; color:var(--muted); font-size:13px; }
.input-actions .pill { padding:6px 10px; border-radius:999px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.02); cursor:pointer; }
.input-actions .pill:hover { background: rgba(255,255,255,0.03); color:var(--fg); }

/* =========================
   RIGHT PANEL: actions, settings, details
   ========================= */
.actions {
  width: var(--right-w);
  min-height: 520px;
  display:flex; flex-direction:column; gap:12px;
  padding: 12px;
}
.actions .section { padding:12px; border-radius:12px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.02); }
.actions .section .title { font-weight:600; color:var(--fg); margin-bottom:6px; }
.actions .grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.actions .big { padding:14px 12px; }

/* =========================
   TOASTS / NOTIFICATIONS
   ========================= */
.toast-wrapper { position: fixed; right: 24px; bottom: 24px; display:flex; flex-direction:column; gap:8px; z-index: 9999; }
.toast {
  min-width: 220px; padding:10px 14px; border-radius:10px; background: rgba(0,0,0,0.6);
  border: 1px solid rgba(255,255,255,0.03); color:var(--fg); box-shadow: var(--shadow-strong); font-size:13px;
}

/* =========================
   MODALS (basic)
   ========================= */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.55); display:grid; place-items:center; z-index: 10000; }
.modal {
  width: min(720px, calc(100% - 40px)); background: var(--bg-panel); border-radius:12px; padding:18px; border:1px solid var(--border-1);
  box-shadow: var(--shadow-strong);
}

/* =========================
   UTILITIES (reusable helpers)
   ========================= */
.row { display:flex; align-items:center; gap:12px; }
.col { display:flex; flex-direction:column; gap:12px; }
.center { display:grid; place-items:center; }
.hidden { display:none !important; }
.small { font-size:13px; }
.muted { color:var(--muted); }
.h-full { height:100%; }
.v-scroll { overflow-y:auto; }

/* text truncation */
.ellipsify { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

/* borders and separators */
.sep { height:1px; background: linear-gradient(90deg, rgba(255,255,255,0.02), transparent); margin:8px 0; }

/* neon accent helper */
.neon { box-shadow: 0 4px 18px rgba(124,196,255,0.12), 0 0 48px rgba(124,196,255,0.04) }

/* =========================
   SCROLLBAR STYLING (webkit modern)
   ========================= */
.chat-messages::-webkit-scrollbar,
.chat-list::-webkit-scrollbar,
.sidebar .chat-list::-webkit-scrollbar,
.actions::-webkit-scrollbar { width: 10px; height:10px; }
.chat-messages::-webkit-scrollbar-thumb,
.chat-list::-webkit-scrollbar-thumb,
.actions::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.03); border-radius: 999px; border: 2px solid transparent; background-clip: padding-box;
}
.chat-messages::-webkit-scrollbar-track,
.chat-list::-webkit-scrollbar-track { background: transparent; }

/* =========================
   ACCESSIBILITY + KEYBOARD FOCUS
   ========================= */
:focus { outline: none; }
a:focus, button:focus, input:focus, .icon-btn:focus { box-shadow: 0 0 0 4px rgba(124,196,255,0.08); border-radius: 8px; }

/* =========================
   RESPONSIVE / ADAPTIVE TWEAKS
   ========================= */
@media (max-width: 1100px){
  :root { --sidebar-w: 260px; --right-w: 220px; }
  .chat-messages { padding: 16px; }
}
@media (max-width: 760px){
  .container { grid-template-columns: 1fr; }
  .sidebar { order: 2; width:100%; min-height: 200px; }
  .chat-shell { order: 1; min-height: 60vh; }
  .actions { display:none; }
  .chat-item .snippet { display:none; }
}

/* =========================
   EXTRA POLISH: subtle animations + micro-interactions
   ========================= */
/* subtle float-in for new chat items */
@keyframes floatIn {
  from { transform: translateY(8px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.chat-item { animation: floatIn var(--slow) ease both; }

/* ripple effect utility (used by JS, but safe to include) */
.ripple { position: relative; overflow: hidden; }
.ripple::after { content: ""; position: absolute; border-radius: 50%; transform: scale(0); background: rgba(255,255,255,0.06); opacity:0; pointer-events:none; transition: transform 500ms, opacity 500ms; }
.ripple:active::after { transform: scale(6); opacity:1; transition: transform 350ms, opacity 350ms; left: 50%; top: 50%; width: 100%; height: 100%; }

/* shimmer skeleton for loading messages / placeholders */
.skeleton {
  background: linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.035), rgba(255,255,255,0.02));
  background-size: 200% 100%; animation: shimmer 1.2s linear infinite;
  border-radius: 12px;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* =========================
   DEBUG / DEV UTILITIES (turn off in prod)
   ========================= */
/* Show bounding boxes for layout debugging */
.debug-outline * { outline: 1px dashed rgba(255,255,255,0.02) !important; }

/* =========================
   EXTRA: message reactions + hover menu
   ========================= */
.reaction-bar { display:flex; gap:6px; align-items:center; padding:6px; background: rgba(255,255,255,0.02); border-radius: 999px; border:1px solid rgba(255,255,255,0.02); }
.reaction { padding:6px; border-radius:8px; cursor:pointer; transition: transform 120ms; }
.reaction:hover { transform: translateY(-3px); }

/* =========================
   PRINT STYLES (just in case)
   ========================= */
@media print {
  .container, .panel, .chat-shell, .sidebar, .actions { background: #fff !important; color: #000 !important; box-shadow: none !important; border: none !important; }
  .chat-messages { overflow: visible !important; }
}

/* =========================
   LEGEND / USAGE NOTES:
   - Use the following structure in HTML/JSX to match this CSS:
     <div class="container">
       <aside class="sidebar panel"> ... .top, .search, .chat-list (.chat-item) ... </aside>
       <main class="chat-shell panel">
         <div class="chat-header"> ... </div>
         <div class="chat-messages"> <div class="msg-row assistant"><div class="avatar">A</div><div class="bubble assistant">...</div></div> ... </div>
         <div class="input-bar"> <input class="input" /><button class="btn">Send</button> </div>
       </main>
       <aside class="actions panel"> ... </aside>
     </div>
   - This CSS is intentionally comprehensive; you can comment out sections you don't need.
   - For interactive features (rename/delete/pin/copy), small JS helpers are needed:
     copy-to-clipboard, toggle classes (active), and loading states (add .skeleton). These are 20-60 lines JS typically.
   ========================= */
