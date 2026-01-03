# Deploying ArcheoHub backend to Vercel

This document explains how to deploy the backend API (server-side) to Vercel and configure environment variables and CORS.

1) Connect the repo to Vercel
- Go to https://vercel.com/new
- Choose "Import Git Repository" and select your GitHub repository (smartshortypants/CISAROBOTICS1).
- Vercel auto-detects Next.js apps. Continue with the default settings.

2) Set environment variables (Vercel dashboard)
- In the Vercel project → Settings → Environment Variables add:
  - OPENAI_API_KEY = sk-...
  - OPENAI_MODEL = gpt-3.5-turbo (or gpt-4 / gpt-4o if you have access)
  - BING_API_KEY = (optional) <your Bing Search key> — when present web results are included
  - FRONTEND_ORIGIN = https://<your-frontend-host> (optional; sets allowed CORS origin)
    - If you use GitHub Pages, set FRONTEND_ORIGIN to your GitHub Pages URL: e.g. `https://your-username.github.io`
    - If you do not set FRONTEND_ORIGIN, the server will default to `*` (open CORS).

3) Deploy
- After setting env vars, trigger a deploy (Vercel will build and deploy).
- Once deployed the API endpoints will be:
  - https://<your-vercel-domain>/api/chat
  - https://<your-vercel-domain>/api/health

4) Client-side usage (frontend)
- If your frontend is hosted separately (GitHub Pages or another host), call the Vercel API using the full absolute URL:
  - Example: POST https://<your-vercel-domain>/api/chat with JSON body: { "query": "..." }
- If your frontend is a Next.js app in the same repo and hosted on Vercel, you can call relative `/api/chat` directly.

5) Testing
- Use curl or Postman to test:
  - curl -X POST https://<your-vercel-domain>/api/chat -H "Content-Type: application/json" -d '{"query":"Who built the pyramids?"}'
- If you deployed with FRONTEND_ORIGIN set to a specific domain, ensure your frontend's requests come from that exact origin.

6) Notes
- Keep your OPENAI_API_KEY secret. Do not expose it in client code.
- If you want to restrict CORS more tightly, set FRONTEND_ORIGIN to your exact frontend URL.
- Logging: Vercel provides logs in the dashboard for debugging failed requests.

If you'd like, I can:
- Create a branch with these changes and open a PR in your repo.
- Walk you through adding environment variables in the Vercel UI step-by-step.
- Provide an optional GitHub Actions workflow to automatically deploy frontend to GitHub Pages and set NEXT_PUBLIC_API_URL.
