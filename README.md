# InterviewAI — AI-Powered Voice Mock Interview Platform

InterviewAI is a full-stack mock interview platform designed for software engineers. It simulates realistic, real-time voice interviews with an AI interviewer. The agent speaks naturally, actively listens to your responses, asks follow-up questions, probes weak points, and wraps up sessions dynamically. It then generates feedback reports and score progress trends.

## Tech Stack
- **Frontend & Backend**: Next.js (App Router, Turbopack, Tailwind CSS, shadcn/ui)
- **Database**: PostgreSQL (Prisma ORM)
- **Auth**: Auth.js (NextAuth v5 JWT strategy with Google OAuth)
- **Voice Integration**: Vapi.ai Web SDK
- **AI Core**: Groq AI SDK (`llama-3.3-70b-versatile`)

---

## Local Setup (Under 5 Commands)

To run the application locally, follow these 4 simple steps:

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Prepare the Database Schema
Ensure PostgreSQL is running locally, then initialize and sync the database schema:
```bash
npx prisma db push
```

### 3. Expose Your Local Server (For Vapi Webhook Callbacks)
Vapi requires a public URL to trigger webhook custom LLM callbacks. Run localtunnel to expose port 3000:
```bash
npx localtunnel --port 3000 --subdomain your-chosen-subdomain
```

### 4. Start the Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to access the landing page.

---

## Environment Variables (.env)

Ensure you create a `.env` file in the root directory with the following variables configured:

```env
# PostgreSQL database URI
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/<db_name>?schema=public"

# NextAuth v5 configs (Google OAuth for authentication)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
AUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Vapi integration keys
NEXT_PUBLIC_VAPI_PUBLIC_KEY="your-vapi-public-key"
VAPI_PRIVATE_KEY="your-vapi-private-key"

# Custom LLM API Key (Groq Llama 3)
GROQ_API_KEY="your-groq-api-key"
GROQ_MODEL="llama-3.3-70b-versatile"

# Public Localtunnel URL (must match the subdomain selected in Step 3)
APP_URL="https://your-chosen-subdomain.loca.lt"
```
