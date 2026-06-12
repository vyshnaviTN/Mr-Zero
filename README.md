# Project Zero — Mr. Zero's Accountability Companion

> **An AI-powered, gamified accountability app that builds personalized learning roadmaps, tracks daily habits, and keeps you consistent — all through Mr. Zero, your animated AI mascot.**

---

## ✨ Features

- 🤖 **Mr. Zero** — Interactive SVG mascot with cursor eye-tracking, moods, speech, and sparkle animations
- 🗺️ **AI Roadmap Generator** — Weakness-weighted, personalized learning plans powered by Groq (Llama 3.3)
- ✅ **Daily Pillar Tracker** — 4 focus pillars, one-tap completion, streak protection
- 🔥 **Streak Heatmap** — 91-day Github-style activity calendar
- 🏆 **Badge System** — Auto-unlocking achievements (7, 15, 30, 60, 100 day streaks)
- 💬 **Mr. Zero Chat** — In-app AI chat with roadmap context awareness
- 🔊 **Voice Synthesis** — Mr. Zero speaks to you using the Web Speech API
- 📊 **Adaptive Roadmap** — Rebalances your plan if you miss days or finish early

---

## 🚀 Local Setup

### Prerequisites

- **Node.js 18+** (or [Bun](https://bun.sh) for faster installs)
- A [Supabase](https://supabase.com) project (free tier works)
- A [Groq](https://console.groq.com) API key (free tier with generous limits)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd mr-zero-builder

# With Bun (recommended — faster)
bun install

# Or with npm
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Then fill in your `.env`:

| Variable | Where to get it |
|---|---|
| `SUPABASE_URL` | Supabase Dashboard → Project Settings → API |
| `SUPABASE_PUBLISHABLE_KEY` | Same page — the `anon` key |
| `GROQ_API_KEY` | [console.groq.com/keys](https://console.groq.com/keys) |

### 3. Run Locally

```bash
# With Bun
bun run dev

# With npm
npm run dev
```

App starts at: **http://localhost:3000**

### 4. Build for Production

```bash
bun run build
# or
npm run build
```

---

## 🗄️ Supabase Setup

Project Zero uses Supabase **only for authentication** (email/password). No database tables are required for the core features — user data (roadmaps, streaks, daily logs) is stored in `localStorage` namespaced by user ID.

**To enable auth:**
1. Go to your Supabase project → Authentication → Settings
2. Enable "Email" provider
3. Set your site URL to `http://localhost:3000` for local dev

---

## 🧠 AI Models Used

| Feature | Provider | Model |
|---|---|---|
| Roadmap Generation | Groq | `llama-3.3-70b-versatile` |
| Mr. Zero Chat | Groq | `llama-3.3-70b-versatile` |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TanStack Start (SSR) |
| Routing | TanStack Router (file-based) |
| Styling | Tailwind CSS v4 + OKLCH colors |
| Animations | Framer Motion |
| Auth / Backend | Supabase |
| AI | Groq API |
| Voice | Web Speech API (browser-native) |
| Build | Vite + Vinxi |

---

## 📁 Project Structure

```
src/
├── routes/           # File-based routing (TanStack Router)
│   ├── __root.tsx   # HTML shell, providers, meta tags
│   ├── _app.tsx     # Auth-protected layout wrapper
│   ├── auth.tsx     # Sign in / Sign up
│   ├── welcome.tsx  # Onboarding intro
│   ├── discovery.tsx# Goal & pillar setup wizard
│   ├── generating.tsx# AI roadmap generation loading screen
│   └── _app.*.tsx   # Dashboard pages
├── components/
│   ├── MrZero.tsx   # Animated mascot (SVG + Framer Motion)
│   ├── MrZeroChat.tsx # Floating AI chat window
│   ├── SpeechBubble.tsx # Speech UI + Web Speech API
│   ├── StreakHeatmap.tsx # 91-day activity grid
│   └── Sidebar.tsx  # Navigation sidebar
├── lib/
│   ├── pstore.ts    # Namespaced localStorage (per-user)
│   ├── p0-state.ts  # Global state hook
│   ├── streaks.ts   # Streak math + badge definitions
│   ├── roadmap.functions.ts # AI roadmap server function
│   └── chat.functions.ts    # AI chat server function
└── integrations/
    └── supabase/    # Auth client & middleware
```

---

## 🔮 Planned Improvements

- [ ] **Cloud sync** — Migrate `localStorage` state to Supabase tables
- [ ] **Voice customization** — Let users pick Mr. Zero's voice from device list
- [ ] **Dark mode** — Add dark theme toggle
- [ ] **PWA / Offline** — Service worker for offline pillar tracking
- [ ] **Roadmap viewer** — Full week-by-week roadmap visualization
- [ ] **Push notifications** — Remind users of daily tasks
- [ ] **Analytics dashboard** — Progress charts with Recharts

---

## 📄 License

MIT
