import React, { useState } from "react";
import { useRouter } from "next/router";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toBase64(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    // limit size for prototype
    if (f.size > 200_000) {
      setError("Image too large (max 200KB). Please resize and try again.");
      return;
    }
    setError(null);
    const data = await toBase64(f);
    setImageBase64(data);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const url = `/api/auth/${mode}`;
      const body: any = { email, password };
      if (mode === "signup") {
        body.name = name || undefined;
        if (imageBase64) body.imageBase64 = imageBase64;
      }
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await res.json();
      if (!res.ok) {
        setError(j?.error || "Request failed");
        setLoading(false);
        return;
      }
      // success: session cookie set by server. redirect to chat
      router.push("/chat");
    } catch (err: any) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ width: 420, background: "#0b0b0d", color: "#fff", padding: 20, borderRadius: 10 }}>
        <h2 style={{ marginTop: 0 }}>{mode === "signup" ? "Sign up" : "Sign in"}</h2>

        <div style={{ marginBottom: 12 }}>
          <button onClick={() => setMode("signup")} style={{ marginRight: 8, padding: 6 }}>
            Sign up
          </button>
          <button onClick={() => setMode("login")} style={{ padding: 6 }}>
            Sign in
          </button>
        </div>

        <form onSubmit={submit}>
          {mode === "signup" && (
            <>
              <label style={{ display: "block", marginBottom: 8 }}>
                Name
                <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%" }} />
              </label>

              <label style={{ display: "block", marginBottom: 8 }}>
                Profile picture (optional)
                <input type="file" accept="image/*" onChange={handleUpload} />
                {imageBase64 && <img src={imageBase64} alt="preview" style={{ width: 64, marginTop: 8, borderRadius: 8 }} />}
              </label>
            </>
          )}

          <label style={{ display: "block", marginBottom: 8 }}>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%" }} />
          </label>

          <label style={{ display: "block", marginBottom: 12 }}>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%" }} />
          </label>

          {error && <div style={{ color: "#ffb4b4", marginBottom: 8 }}>{error}</div>}

          <button type="submit" disabled={loading} style={{ padding: "8px 12px", fontWeight: 600 }}>
            {loading ? "…" : mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
