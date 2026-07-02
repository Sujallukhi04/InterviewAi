# InterviewAI — AI Mock Interview Platform

A full-stack AI-powered mock interview platform where candidates have a real, dynamic voice conversation with an AI interviewer. Not a static question list. Not a chatbot. The AI listens, responds to what the candidate actually said, asks follow-ups, pushes back, and adapts in real time.

---

## Live Demo

**Deployed URL:** [your-app.vercel.app](https://your-app.vercel.app)  
**Loom Walkthrough:** [loom.com/share/your-link](https://loom.com/share/your-link)

---

## Local Setup (5 commands)

### Prerequisites
- Node.js 18+
- pnpm (`npm install -g pnpm`)
- PostgreSQL database (or a free [Neon](https://neon.tech) account)
- [Vapi](https://vapi.ai) account (free tier)
- [Groq](https://console.groq.com) account (free tier)
- [Google OAuth](https://console.cloud.google.com) credentials
- Local tunneling service (e.g., [localtunnel](https://github.com/localtunnel/localtunnel) or [ngrok](https://ngrok.com))

### Steps

**1. Clone and install**
```bash
git clone https://github.com/your-username/mock-interview-platform.git
cd mock-interview-platform && pnpm install
```

**2. Configure environment variables**
```bash
cp .env.example .env
```
Fill in all values in `.env` (see Environment Variables section below).

**3. Run database migrations**
```bash
npx prisma db push
```

**4. Start the development server**
```bash
pnpm dev
```

**5. Expose local server for Vapi webhook (new terminal)**
If using **localtunnel**:
```bash
npx localtunnel --port 3000 --subdomain your-chosen-subdomain
```
If using **ngrok**:
```bash
ngrok http 3000
```
Then set the `APP_URL` in `.env` to match your tunnel URL.

App is now running at `http://localhost:3000`

---

## Environment Variables

Create a `.env` file in the root with these values:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://..."

# Auth (NextAuth + Google OAuth)
AUTH_SECRET="your-random-secret-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Vapi (Voice AI)
NEXT_PUBLIC_VAPI_PUBLIC_KEY="your-vapi-public-key"
VAPI_PRIVATE_KEY="your-vapi-private-key"

# Groq (LLM for conversation engine)
GROQ_API_KEY="your-groq-api-key"
GROQ_MODEL="llama-3.3-70b-versatile"

# App
APP_URL="http://localhost:3000"
```

### Where to get each key

| Variable | Where to get it |
|---|---|
| DATABASE_URL | [neon.tech](https://neon.tech) → New Project → Connection String |
| AUTH_SECRET | Run `openssl rand -base64 32` in terminal |
| GOOGLE_CLIENT_ID/SECRET | [console.cloud.google.com](https://console.cloud.google.com) → APIs → Credentials → OAuth 2.0 |
| NEXT_PUBLIC_VAPI_PUBLIC_KEY | [vapi.ai](https://vapi.ai) → Dashboard → API Keys |
| VAPI_PRIVATE_KEY | Same as above |
| GROQ_API_KEY | [console.groq.com](https://console.groq.com) → API Keys |

---

## Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project
3. Enable the **Google People API**
4. Go to Credentials → Create OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (local development)
   - `https://your-app.vercel.app/api/auth/callback/google` (production)

---

## Vapi Setup

1. Sign up at [vapi.ai](https://vapi.ai)
2. Create a new Assistant in the dashboard
3. Under **Voice**, pick any voice (Elliot or similar)
4. Copy your Public and Private API keys to `.env`

> [!NOTE]
> **Dynamic Webhook Overrides**: Our application code automatically sends dynamic assistant overrides (including the Custom LLM endpoint URL `APP_URL/api/vapi/chat` and first messages) when starting a call. You do not need to manually configure the Custom LLM URL in the Vapi dashboard assistant configuration.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | PostgreSQL (Neon) + Prisma ORM |
| Auth | Google OAuth via NextAuth.js (v5) |
| Voice AI | Vapi (STT + TTS orchestration) |
| LLM | Groq / Llama 3.3 70B (conversation engine) |
| Deployment | Vercel |

---

## Features

### Core
- **Real dynamic voice interviews** — AI listens, responds to what you actually said, asks follow-ups, probes weak answers, acknowledges strong ones
- **4 interview types** — Behavioral, Technical, System Design, HR / Culture Fit — each with a different AI persona and question strategy
- **Post-session feedback report** — overall score + breakdown by Communication, Depth, Structure, Confidence with specific examples from your transcript
- **Google OAuth** — one-click sign in

### Dashboard
- Interview history table with date filter, type filter, status filter
- Pagination (10 sessions per page)
- Performance over time line chart
- Session stats (total, average score, last interview)
- Bulk delete sessions

### Session Features
- Live transcript during the call
- Real-time message persistence
- Keyboard shortcuts (Space to mute, Esc to end)
- Automatic session expiry detection for interrupted sessions
- Retry failed/expired sessions

### Post-Session
- Detailed feedback report with score breakdown
- Full conversation transcript viewer
- Interview Coach — AI chat that answers questions about your specific performance based on your actual transcript
- Share-ready report page

### Profile
- Edit name, target role, experience level
- Stats overview (total interviews, average score, completed count)

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login, signup pages (no navbar)
│   ├── (app)/            # Authenticated pages (with navbar)
│   │   ├── dashboard/    # Main dashboard
│   │   ├── interview/    # Session pages, report, transcript, coach
│   │   ├── onboarding/   # Profile setup
│   │   └── profile/      # User profile management
│   └── api/
│       ├── auth/         # NextAuth handlers
│       ├── vapi/chat/    # Conversation engine webhook (CORE)
│       ├── sessions/     # Session management routes
│       └── user/         # Profile update routes
├── components/
│   ├── ui/               # shadcn/ui primitives
│   ├── interview/        # VoiceSession, session components
│   ├── dashboard/        # Table, chart, stats components
│   ├── coach/            # Interview coach chat
│   └── layout/           # Navbar, providers
├── services/             # Business logic layer
│   ├── conversationEngine.ts  # CORE: LLM prompt + response logic
│   ├── feedbackService.ts     # Post-session feedback generation
│   ├── coachService.ts        # Interview coach responses
│   ├── vapiService.ts         # Vapi assistant config builder
│   ├── sessionService.ts      # Session CRUD
│   └── dashboardService.ts    # Dashboard data queries
├── actions/              # Next.js Server Actions
├── validators/           # Zod schemas
├── hooks/                # Custom React hooks
└── lib/
    ├── prisma.ts          # Prisma singleton
    ├── groq.ts            # Groq client singleton
    └── auth.ts            # NextAuth config + helpers
prisma/
└── schema.prisma          # Database schema
```

---

## How the Voice Loop Works

```
Candidate speaks
      ↓
Vapi STT (speech → text)
      ↓
POST /api/vapi/chat
  → fetch session context from DB (type, candidate profile)
  → build dynamic system prompt based on interview type
  → call Groq (Llama 3.3 70B) with full conversation history
  → detect [END_INTERVIEW] signal
  → return OpenAI-compatible response
      ↓
Vapi TTS (text → speech)
      ↓
Candidate hears the response
      ↓
(repeat until [END_INTERVIEW])
      ↓
Feedback generation (full transcript → Groq → structured report)
```

The key architectural decision: **Vapi handles STT + TTS, your backend handles all intelligence.** Every single interviewer response is generated fresh from the full conversation history — no hardcoded questions, no fixed scripts.

---

## Cost Analysis

| Service | Free Tier | Estimated Cost per Interview |
|---|---|---|
| Vapi | 10 free minutes/month | ~$0.05/min after free tier |
| Groq | 14,400 requests/day free | $0.00 on free tier |
| Neon | 0.5 GB storage free | $0.00 for development |
| Vercel | Hobby tier free | $0.00 |

**Estimated cost for a 10-minute interview session:**
- Vapi: ~$0.50 (10 min × $0.05/min, after free tier)
- Groq: $0.00 (well within free tier)
- Total per session: ~$0.50 at scale

For a startup MVP / demo: effectively free within Vapi's monthly free minutes. Production cost is dominated by Vapi voice minutes.

---

## Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript type checker
pnpm prisma studio        # Open Prisma database GUI
pnpm prisma migrate dev   # Run database migrations
pnpm prisma generate      # Regenerate Prisma client
```

---

## Deployment (Vercel)

1. Push to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.example`
4. Change `AUTH_SECRET` and `APP_URL` to your Vercel domain
5. Deploy
6. Update Google OAuth redirect URI to include Vercel domain
7. Update Vapi Custom LLM URL if using static settings (or rely on dynamic overrides)

---

## Known Limitations

- Voice requires microphone permission in browser
- Vapi free tier has limited monthly minutes (upgrade for production)
- Interview coach chat history is not persisted across page refreshes (in-memory only, by design for simplicity)
- Resume upload not yet implemented (planned feature)
