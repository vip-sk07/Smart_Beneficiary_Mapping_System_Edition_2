# CLAUDE.md — Smart Beneficiary Mapping System
# Master Implementation Guide for Antigravity Agent
# Last updated: Improvement W — In-App Notification Centre (Dropdown)

---

## 🧭 Project Overview

**App:** Smart Beneficiary Mapping System (SBMS)
**Purpose:** Connect Indian citizens to government welfare schemes using AI
**Stack:** Next.js 15 + Prisma + Neon PostgreSQL + NextAuth v5 + Groq (chat) + Gemini (embeddings) + RAG
**Hosting:** Vercel (free forever) — DEPLOYMENT ON HOLD until all improvements done
**IDE:** Windsurf (Antigravity) with Claude Sonnet 4.6 Thinking

---

## 🗂️ Tech Stack (Locked — Do Not Change)

| Layer            | Tool                           | Notes                              |
|------------------|--------------------------------|------------------------------------|
| Framework        | Next.js 15 (App Router)        | TypeScript, Tailwind CSS           |
| ORM              | Prisma 7                       | Config in prisma.config.ts         |
| Database         | Neon PostgreSQL (Singapore)    | Free forever, 0.5GB                |
| Vector DB        | Neon + pgvector extension      | Already enabled                    |
| Auth             | NextAuth v5 (beta)             | Credentials + Google OAuth         |
| Chat LLM         | Groq — llama-3.3-70b-versatile | Fast, free tier                    |
| Embedding Model  | Google text-embedding-004      | Via Gemini API key                 |
| RAG              | Custom (no LangChain)          | pgvector cosine similarity         |
| Icons            | lucide-react                   |                                    |
| Notifications    | react-hot-toast                |                                    |
| Email            | Nodemailer + Gmail SMTP        | ✅ Done                            |
| Animation        | framer-motion                  | Added in Improvement M             |
| Charts           | recharts                       | Added in Improvement L            |
| Rate Limiting    | rate-limiter-flexible         | Added in Improvement O (in-memory) |
| Hosting          | Vercel                         | Free forever — deploy after improvements |

---

## 🔑 Environment Variables (.env)

```env
# Neon PostgreSQL
DATABASE_URL=""         # pooled URL (runtime)
DIRECT_URL=""           # direct URL (migrations)

# NextAuth
NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Gemini (embeddings ONLY — not chat)
GEMINI_API_KEY=""

# Groq (chat LLM)
GROQ_API_KEY=""

# Email (Nodemailer — Gmail SMTP)
EMAIL_HOST_USER=""
EMAIL_HOST_PASSWORD=""
```

> ⚠️ NEXTAUTH_URL must be updated to Vercel URL on deployment

---

## 🤖 Key AI Context: How Django Bot Worked (Reference)

The original Django chatbot in `core/gemini_service.py` injected user profile
into every message like this:

```python
full_message = f"[{user_info}]\n\n{message}" if user_info else message
# user_info = "Name: Karan, Age: 19, Income: ₹80000, Occupation: student, State: Tamil Nadu"
```

This is WHY the Django bot gave better personalized answers.
The Next.js bot must also inject user profile into every Groq system prompt.
This is fixed in Improvement N below.

The Django project also had an **NLP Finder page** (`nlp_finder.html`) — a dedicated
AI search where users describe their situation in plain English and get matched schemes
with confidence scores and keywords. This feature does NOT exist in Next.js yet.
It is added as part of Improvement N.

---

## 📁 Folder Structure (Current State)

```
Smart_Beneficiary_Mapping_System/
│
├── prisma/
│   ├── schema.prisma             ✅ DONE
│   ├── seed.ts                   ✅ DONE
│   └── migrations/
│
├── prisma.config.ts              ✅ DONE
├── scripts/
│   └── embed-schemes.ts          ✅ DONE
│
├── src/
│   ├── auth.ts                   ✅ DONE
│   ├── middleware.ts             ✅ DONE
│   ├── types/
│   │   ├── next-auth.d.ts        ✅ DONE
│   │   └── index.ts              ✅ DONE
│   ├── lib/
│   │   ├── prisma.ts             ✅ DONE
│   │   ├── embeddings.ts         ✅ DONE
│   │   ├── rag.ts                ✅ DONE
│   │   ├── groq.ts               ✅ DONE
│   │   └── email.ts              ✅ DONE
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx       ✅ DONE
│   │   │   ├── MobileHeader.tsx  ✅ DONE
│   │   │   └── AdminSidebar.tsx  ✅ DONE
│   │   ├── ui/
│   │   │   ├── StatCard.tsx      ✅ DONE
│   │   │   ├── Badge.tsx         ✅ DONE
│   │   │   ├── Modal.tsx         ✅ DONE
│   │   │   ├── Skeleton.tsx      ✅ DONE
│   │   │   └── NotificationBell.tsx ✅ DONE
│   │   ├── schemes/
│   │   │   ├── SchemeCard.tsx    ✅ DONE
│   │   │   ├── SchemeFilter.tsx  ✅ DONE
│   │   │   └── EligibilityBadge.tsx ✅ DONE
│   │   ├── chat/
│   │   │   ├── ChatWindow.tsx    ✅ DONE
│   │   │   ├── ChatBubble.tsx    ✅ DONE
│   │   │   ├── ChatWidget.tsx    ✅ DONE (floating global widget)
│   │   │   └── TypingIndicator.tsx ✅ DONE
│   │   ├── admin/
│   │   │   └── AnalyticsCharts.tsx ✅ DONE
│   │   └── forms/
│   │       ├── ApplicationForm.tsx ✅ DONE
│   │       └── GrievanceForm.tsx   ✅ DONE
│   ├── app/
│   │   ├── layout.tsx            ✅ DONE
│   │   ├── globals.css           ✅ DONE
│   │   ├── page.tsx              ✅ DONE
│   │   ├── offline/page.tsx      ✅ DONE
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx    ✅ DONE
│   │   │   └── register/page.tsx ✅ DONE
│   │   ├── (app)/
│   │   │   ├── layout.tsx        ✅ DONE
│   │   │   ├── dashboard/page.tsx         ✅ DONE
│   │   │   ├── schemes/page.tsx           ✅ DONE
│   │   │   ├── schemes/[id]/page.tsx      ✅ DONE
│   │   │   ├── applications/page.tsx      ✅ DONE
│   │   │   ├── grievances/page.tsx        ✅ DONE
│   │   │   ├── chat/page.tsx              ✅ DONE
│   │   │   ├── profile/page.tsx           ✅ DONE
│   │   │   ├── eligibility/page.tsx       ✅ DONE
│   │   │   ├── documents/page.tsx         ✅ DONE
│   │   │   ├── announcements/page.tsx     ✅ DONE
│   │   │   └── ai-finder/page.tsx         ← Improvement N (NEW)
│   │   ├── admin/
│   │   │   ├── layout.tsx                 ✅ DONE
│   │   │   ├── stats/page.tsx             ✅ DONE
│   │   │   ├── users/page.tsx             ✅ DONE
│   │   │   ├── schemes/page.tsx           ✅ DONE
│   │   │   ├── schemes/[id]/page.tsx      ✅ DONE
│   │   │   ├── grievances/page.tsx        ✅ DONE
│   │   │   └── announcements/page.tsx     ✅ DONE
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts ✅ DONE
│   │       ├── auth/register/route.ts      ✅ DONE
│   │       ├── schemes/route.ts            ✅ DONE
│   │       ├── schemes/[id]/route.ts       ✅ DONE
│   │       ├── applications/route.ts       ✅ DONE
│   │       ├── applications/[id]/route.ts  ✅ DONE
│   │       ├── grievances/route.ts         ✅ DONE
│   │       ├── grievances/[id]/route.ts    ✅ DONE
│   │       ├── chat/route.ts               ✅ DONE
│   │       ├── embed/route.ts              ✅ DONE
│   │       ├── profile/route.ts            ✅ DONE
│   │       ├── eligibility/route.ts        ✅ DONE
│   │       ├── notifications/route.ts      ✅ DONE
│   │       ├── family/route.ts             ✅ DONE
│   │       ├── family/[id]/route.ts        ✅ DONE
│   │       ├── documents/route.ts          ✅ DONE
│   │       ├── documents/[id]/route.ts     ✅ DONE
│   │       ├── ai-finder/route.ts          ← Improvement N (NEW)
│   │       └── admin/
│   │           ├── stats/route.ts          ✅ DONE
│   │           ├── users/route.ts          ✅ DONE
│   │           └── announcements/route.ts  ✅ DONE
│
├── public/
│   ├── manifest.json             ✅ DONE
│   ├── icon-192.png              ✅ DONE
│   └── icon-512.png              ✅ DONE
├── .env                          ✅ DONE
├── .env.example                  ✅ DONE
├── next.config.ts                ✅ DONE
├── prisma.config.ts              ✅ DONE
├── tailwind.config.ts            ✅ DONE
├── tsconfig.json                 ✅ DONE
├── package.json                  ✅ DONE
└── CLAUDE.md                     ✅ THIS FILE
```

---

## 🔲 Improvement N — Premium UI/UX + AI Bot Fix + NLP Finder

**What it does:**
1. Fixes the AI chatbot to inject user profile (like Django did)
2. Adds NLP AI Finder page (existed in Django, missing in Next.js)
3. Overhauls UI with framer-motion animations
4. Adds skeleton loaders and staggered scheme grid

**Antigravity Prompt — Part 1: Fix AI Bot Profile Injection**
```
CRITICAL FIX — The AI chatbot gives generic answers because it doesn't 
know who the user is. Fix this by injecting user profile into every chat.

1. Update src/app/api/chat/route.ts:
   - After getting the session, fetch the full user profile from Prisma:
     const userProfile = await prisma.user.findUnique({
       where: { id: session.user.id },
       select: { name:true, dob:true, gender:true, income:true, 
                 occupation:true, state:true, district:true }
     })
   - Calculate age from dob if available
   - Build a userInfo string:
     "User Profile: Name: [name], Age: [age], Gender: [gender], 
      Annual Income: ₹[income], Occupation: [occupation], State: [state]"
   - Inject this into the Groq system prompt BEFORE the RAG context:
     systemPrompt = `You are BenefitBot for SBMS India.
     ${userInfo}
     Based on this user's profile, give personalized scheme recommendations.
     ${ragContext}`
   - If profile fields are missing, skip them gracefully

2. Update src/lib/groq.ts:
   - Add userProfile parameter to getChatResponse function
   - Include it in the system prompt automatically
   - If income is 0 or null, don't mention it

Test: Login as a user with full profile, ask "what schemes am I eligible for?"
The bot should now mention specific schemes matching the user's age/income/state.
```

---

**Antigravity Prompt — Part 2: NLP AI Finder Page**
```
Create an AI Scheme Finder page inspired by the original Django nlp_finder.html.
This was in the original project but is MISSING from the Next.js version.

1. Create src/app/api/ai-finder/route.ts:
   POST receives: { query: string }
   - Embed the query using embedText() from lib/embeddings.ts
   - Search pgvector for top 8 matching schemes
   - Send query + matched schemes to Groq with this prompt:
     "The user described their situation: '[query]'
      Here are potentially matching schemes: [schemes list]
      Analyze and return JSON with:
      {
        intent: 'short description of what user needs',
        confidence: 0-100,
        ai_summary: 'one sentence explanation of why these schemes match',
        keywords: ['keyword1', 'keyword2', 'keyword3'],
        topSchemes: [{ id, name, reason, matchScore }]  // top 5 with reason
      }
      Return ONLY valid JSON, no markdown."
   - Parse the JSON response
   - Return: { intent, confidence, ai_summary, keywords, schemes (full data) }

2. Create src/app/(app)/ai-finder/page.tsx:
   - Hero section with robot/sparkle icon
   - Title: "AI Scheme Finder"
   - Subtitle: "Describe your situation in plain language — AI will match you 
     to the right schemes instantly"
   - Large search input (full width, pill shaped)
   - Quick suggestion chips below input:
     "🌾 Farmer crop support"
     "👩 Woman business loan" 
     "🎓 Student scholarship"
     "👴 Senior citizen pension"
     "🏠 Housing for low income"
     Clicking a chip fills the input
   - On submit: POST /api/ai-finder, show loading state
   - Results section (shows after search):
     * Gemini Analysis card: intent + confidence bar + ai_summary + keyword chips
     * Grid of matched SchemeCards with match score badge and reason text
     * "Apply Now" button on each card
   - Empty state: show the suggestion chips prominently
   - Error state: show friendly error message

3. Add "AI Finder" nav item to Sidebar.tsx:
   - Icon: lucide Sparkles
   - Route: /ai-finder
   - Place between "Browse Schemes" and "My Eligibility"
   - Add subtle "NEW" badge on the nav item

4. Add "Try AI Finder" quick action to dashboard/page.tsx:
   - Replace or add alongside existing quick actions
   - Description: "Describe your situation, AI finds your schemes"
   - Icon: Sparkles, link to /ai-finder
```

---

**Antigravity Prompt — Part 3: Premium UI Overhaul**
```
Overhaul the UI/UX with premium animations and interactions.
framer-motion is already installed (from Improvement M).

1. Landing page (src/app/page.tsx):
   - Wrap the hero section with motion.div:
     initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} 
     transition={{ duration: 0.6 }}
   - Stagger the 4 feature cards with:
     each card: initial={{ opacity: 0, y: 20 }} 
     whileInView={{ opacity: 1, y: 0 }}
     viewport={{ once: true }}
     transition={{ delay: index * 0.1 }}
   - Add subtle gradient animated background blob behind hero text

2. Skeleton loaders (src/app/(app)/schemes/loading.tsx):
   - Create loading.tsx in schemes/ folder
   - Show 6 skeleton SchemeCard placeholders
   - Each skeleton: gray animated pulse rectangle 
     matching the real card dimensions

3. Schemes page stagger animation (src/app/(app)/schemes/page.tsx):
   - Wrap scheme grid items in motion.div
   - Stagger: transition={{ delay: index * 0.05 }}
   - initial={{ opacity: 0, scale: 0.95 }}
   - animate={{ opacity: 1, scale: 1 }}

4. Dashboard stat cards animation (src/app/(app)/dashboard/page.tsx):
   - Animate each StatCard counting up from 0 to actual value
   - Use motion + useEffect to increment number over 1 second
   - Stagger cards: delay index * 0.1

5. Login/Register pages enhancement:
   - Add split-screen layout on desktop (lg screens):
     Left half: dark gov-blue background with app branding, 
     Indian flag stripe, feature bullets
     Right half: white card with the form
   - Mobile: single column as before
   - Add smooth transition between step 1 and step 2 in register:
     AnimatePresence with slide left transition

6. SchemeCard hover effect:
   - Add whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.1)" }}
   - transition={{ type: "spring", stiffness: 300 }}

7. Page transitions:
   - Wrap each (app) page content in:
     motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
     transition={{ duration: 0.3 }}

Test each page after changes. Make sure no hydration errors.
If framer-motion causes SSR issues, add "use client" to affected components.
```

---

## ⚠️ Important Rules for Antigravity

1. **Never use localStorage** — use React state or server state only
2. **Never use `<form>` HTML tag** — use `onSubmit` on a `<div>` or React handlers
3. **Always check session role** before admin actions in API routes
4. **Prisma config is in prisma.config.ts** not schema.prisma (Prisma 7)
5. **Groq for chat, Gemini for embeddings** — never mix them up
6. **pgvector query syntax:** `embedding <=> $1::vector` for cosine similarity
7. **After editing any scheme** — always re-trigger embedding
8. **Auth session** — always use `await auth()` from `src/auth.ts`
9. **Email errors must never crash API** — always wrap in try/catch
10. **After any schema change** — always run `npm run db:push`
11. **After adding new schemes** — always run `npx tsx scripts/embed-schemes.ts`
12. **framer-motion components** — always add "use client" directive
13. **AI profile injection** — always fetch fresh from Prisma, never trust JWT cache

---

## 🐛 Known Issues Fixed

- Content hidden behind fixed header on mobile → pt-16 md:pt-0 in layout.tsx
- Duplicate user avatars in sidebar → conditional render fixed
- Hamburger menu visible on desktop → md:hidden on MobileHeader
- Missing Indian flag stripe → inline linear-gradient in Sidebar
- RAG embeddings script failing → fixed schema vector compatibility
- AI bot giving generic answers → FIXING IN IMPROVEMENT N (profile injection)

---

## 🔄 How to Update This File

After each improvement completes:
1. Mark the improvement ✅ in the progress table
2. Add to Improvements Completed list with completion date
3. Update "Last updated" header with new improvement ID
4. Note any new packages installed in Tech Stack section
5. Update the Quick Index if new sections are added
6. Move completed items from "What's Next" to "Completed"
7. Run `npm run build` to verify no errors

This file is the single source of truth for the entire project.

---

## 📋 Improvements A-M (Completed)

| ID | Feature | Category |
|----|---------|----------|
| A | Email Notifications (nodemailer + Gmail SMTP) | Feature |
| B | In-App Notifications Bell (polling + mark read) | Feature |
| C | Smart Eligibility Matcher (auto profile matching) | Feature |
| D | Family Profile Management (add/edit/delete members) | Feature |
| E | Document Vault (upload once, use everywhere) | Feature |
| F | PWA Support (installable, offline page) | Feature |
| G | Scheme News & Updates Feed (category badges) | Feature |
| H | Multi-lingual & Voice Search | Feature |
| I | OCR Document Parsing (Gemini Vision) | Feature |
| J | Native Push Notifications (VAPID + service worker) | Feature |
| K | Offline-First Sync (IndexedDB + background sync) | Feature |
| L  | Admin Analytics Dashboard (recharts) | Admin |
| M  | Next-Gen AI Assistant (streaming, floating widget, framer-motion) | AI |
| N  | Premium UI/UX + AI Bot Fix + NLP Finder | UI/UX + AI |
| O  | Rate Limiting (Security) | Security |
| X  | Page Progress Top Bar (nextjs-toploader, SBMS indigo glow) | UI/UX |

---

## 📋 Quick Index

| Section | Description |
|---------|-------------|
| [🧭 Project Overview](#-project-overview) | Core project info |
| [🗂️ Tech Stack](#-tech-stack-locked--do-not-change) | Technology choices |
| [🔑 Key AI Context](#-key-ai-context-how-django-bot-worked-reference) | Django bot reference |
| [📁 Folder Structure](#-folder-structure-current-state) | File organization |
| [🔲 Improvement N](#-improvement-n--premium-uiux--ai-bot-fix--nlp-finder) | Premium UI/UX + AI fixes |
| [⚠️ Important Rules](#-important-rules-for-antigravity) | Development rules |
| [🐛 Known Issues](#-known-issues-fixed) | Fixed bugs |
| [✅ Improvements Completed](#-improvements-completed) | Completed features |
| [📊 Current Progress](#-current-progress) | Project phase status |
| [📋 Improvements A-M](#-improvements-a-m) | Completed improvements |
| [📋 Improvements O-W](#-improvements-o-w) | Pending improvements |
| [🔄 How to Update](#-how-to-update-this-file) | Maintenance guide |

---

## 🎯 What's Next (Priority Order)

| Priority | ID | Improvement | Estimated Time |
|----------|-----|-------------|----------------|
| 🔴 Critical | O | Rate Limiting (Security) | 1-2 hrs |
| 🟡 High | P | Skeleton Loading Screens | 2-3 hrs |
| 🟡 High | R | Password Strength Meter | 1-2 hrs |
| 🟡 High | S | PDF Preview in Document Vault | 2-3 hrs |
| 🟡 High | T | CSV Export for Admin | 2 hrs |
| 🟡 High | W | Notification Centre Dropdown | 3-4 hrs |
| 🟢 Medium | Q | Confetti on Application Success | 1 hr |
| 🟢 Medium | U | Document Expiry Alerts | 3-4 hrs |
| 🟢 Medium | V | Animated Eligibility Progress Rings | 3 hrs |

---

## 📊 Current Progress

| Phase         | Status        | Description                          |
|---------------|---------------|--------------------------------------|
| 1             | ✅ Complete    | Foundation + DB + Dependencies       |
| 2             | ✅ Complete    | RAG Core + Auth setup                |
| 3             | ✅ Complete    | Layout + Auth pages                  |
| 4             | ✅ Complete    | User pages                           |
| 5             | ✅ Complete    | API routes                           |
| 6             | ✅ Complete    | Admin pages                          |
| A → M         | ✅ Complete    | All improvements A through M         |
| N — Part 1    | ✅ Complete    | Fix AI bot profile injection         |
| N — Part 2    | ✅ Complete    | NLP AI Finder page (from Django)     |
| N — Part 3    | ✅ Complete    | Premium UI animations overhaul       |
| X             | ✅ Complete    | Page Progress Top Bar                |
| O             | ✅ Complete    | Rate Limiting (Security)             |
| P             | ✅ Complete    | Skeleton Loading Screens             |
| Q             | ✅ Complete    | Confetti on Application Success      |
| R             | ✅ Complete    | Password Strength Meter              |
| S             | ✅ Complete    | PDF Preview in Document Vault        |
| T             | ✅ Complete    | CSV Export for Admin                 |
| U             | ✅ Complete    | Document Expiry Alerts               |
| V             | ✅ Complete    | Animated Eligibility Progress Rings  |
| W             | ✅ Complete    | Notification Centre Dropdown         |
| 7             | ⏸️ ON HOLD    | Deploy to Vercel (after all done)    |

---

## 🔨 Improvement O — Rate Limiting (Security)

**ID:** O | **Priority:** 🔴 Critical | **Complexity:** Low (1–2 hrs)

### Goal
Prevent brute-force attacks on login, register, and chat API endpoints by adding per-IP rate limiting.

### Package
```bash
npm install @upstash/ratelimit @upstash/redis
```
Alternatively use a simple in-memory store if Upstash free tier is not available:
```bash
npm install rate-limiter-flexible
```

### Implementation Steps

1. **Create `src/lib/rateLimit.ts`**
   - Export a `rateLimit(identifier: string, limit: number, windowSec: number)` function
   - Use `rate-limiter-flexible` with in-memory store (no Redis needed for local/Vercel)
   - Return `{ success: boolean, remaining: number, reset: Date }`

2. **Apply to `/api/auth/register/route.ts`**
   - Limit: 5 requests per IP per 15 minutes
   - Get IP from `req.headers.get("x-forwarded-for") || "unknown"`
   - Return `429` with JSON `{ error: "Too many attempts. Please wait 15 minutes." }` if exceeded

3. **Apply to `/api/chat/route.ts`**
   - Limit: 30 messages per user per hour (use `session.user.id` as identifier)
   - Return `429` with `{ error: "Chat limit reached. Try again in an hour." }`

4. **Apply to NextAuth signIn callback**
   - In `src/auth.ts`, inside `authorize()`, call rateLimit before DB query
   - Limit: 10 login attempts per IP per 10 minutes

5. **Show toast in frontend**
   - On 429 response, display: `toast.error("Too many attempts. Please try again later.")`

### Status: ⏳ Pending

---

## 🔨 Improvement P — Skeleton Loading Screens

**ID:** P | **Priority:** 🟡 High | **Complexity:** Low (2–3 hrs)

### Goal
Replace all spinner/loading states with animated shimmer skeleton placeholders for a premium feel.

### No new packages needed
Use pure CSS `@keyframes shimmer` animation already available in `globals.css`.

### Implementation Steps

1. **Create `src/components/ui/Skeletons.tsx`**
   - Export components: `SkeletonCard`, `SkeletonRow`, `SkeletonStat`, `SkeletonText`, `SkeletonAvatar`
   - Each uses a `div` with `background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)` animated with `background-size: 200% 100%`
   - Animate with `animation: shimmer 1.5s infinite`

2. **Dashboard page** (`dashboard/page.tsx`)
   - Wrap stat cards section with `<Suspense fallback={<SkeletonStat count={4} />}>`
   - Replace the inline loading spinner with `<SkeletonCard count={3} />`

3. **Schemes page** (`schemes/page.tsx`)
   - During `loading` state, show `<SkeletonCard count={6} />` in the grid instead of the spinner

4. **Applications page** (`applications/page.tsx`)
   - Show `<SkeletonRow count={5} />` while data loads

5. **Eligibility page** (`eligibility/page.tsx`)
   - Show scheme match skeleton cards during the loading animation

6. **Add shimmer keyframe to `globals.css`**
   ```css
   @keyframes shimmer {
     0% { background-position: -200% 0; }
     100% { background-position: 200% 0; }
   }
   .skeleton {
     background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
     background-size: 200% 100%;
     animation: shimmer 1.5s infinite;
     border-radius: 8px;
   }
   ```

### Status: ⏳ Pending

---

## 🔨 Improvement Q — Confetti on Application Success

**ID:** Q | **Priority:** 🟢 Medium | **Complexity:** Low (1 hr)

### Goal
Show a delightful confetti burst animation when a user successfully submits an application — increases emotional engagement.

### Package
```bash
npm install canvas-confetti
npm install --save-dev @types/canvas-confetti
```

### Implementation Steps

1. **Create `src/components/ui/ConfettiEffect.tsx`**
   ```tsx
   "use client";
   import confetti from "canvas-confetti";
   export function fireConfetti() {
     confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 },
       colors: ["#4338ca", "#f97316", "#22c55e", "#f472b6"] });
   }
   ```

2. **Trigger in scheme application action**
   - In `src/app/(app)/schemes/[id]/page.tsx` — after the `POST /api/applications` succeeds
   - Call `fireConfetti()` right before `toast.success("Application submitted!")`

3. **Also trigger in AI Finder**
   - If user uses AI Finder to find and apply — same confetti trigger on success

4. **Optional: Indian tri-color confetti**
   - Use colors: `["#ff9933", "#ffffff", "#138808", "#000080"]` for patriotic feel

### Status: ⏳ Pending

---

## 🔨 Improvement R — Password Strength Meter

**ID:** R | **Priority:** 🟡 High | **Complexity:** Low (1–2 hrs)

### Goal
Show a real-time password strength indicator on the register and change-password forms.

### No new packages needed — pure logic + CSS.

### Implementation Steps

1. **Create `src/components/ui/PasswordStrength.tsx`**
   - Accept `password: string` as prop
   - Calculate score (0–4) based on:
     - Length ≥ 8 (+1), ≥ 12 (+1)
     - Contains uppercase (+1)
     - Contains number (+1)
     - Contains special char `!@#$%^&*` (+1)
   - Render 4 colored bars: red → orange → yellow → green
   - Show label: "Weak" | "Fair" | "Good" | "Strong"

2. **Add to Register page** (`register/page.tsx`)
   - Import and render `<PasswordStrength password={password} />` directly below the password input in Step 1

3. **Add to Profile change-password tab** (`profile/page.tsx`)
   - Render same component below the "New Password" input

4. **Styling**
   - 4 thin bar segments, gap between them, smooth color transition using framer-motion `animate` on width/color

### Status: ⏳ Pending

---

## 🔨 Improvement S — PDF Preview in Document Vault

**ID:** S | **Priority:** 🟡 High | **Complexity:** Low-Medium (2–3 hrs)

### Goal
Allow users to preview uploaded PDF documents inline inside the Document Vault modal — no need to download.

### Package
```bash
npm install react-pdf
```
Or use the browser's native `<iframe>` / `<object>` tag for base64 PDFs — no package needed.

### Implementation Steps

1. **Detect file type from base64 string**
   - Check if `fileUrl.startsWith("data:application/pdf")` → show PDF viewer
   - Check if `fileUrl.startsWith("data:image/")` → show `<img>` tag

2. **Create `src/components/vault/DocumentPreviewModal.tsx`**
   - Accept `fileUrl: string`, `fileType: string`, `fileName: string`
   - If PDF: render `<iframe src={fileUrl} style={{ width: "100%", height: 500, border: "none" }} />`
   - If image: render `<img src={fileUrl} style={{ maxWidth: "100%", borderRadius: 12 }} alt={fileName} />`
   - Wrap in the existing `<Modal>` component

3. **Add "Preview" button to each document card** in `documents/page.tsx`
   - Eye icon button next to the existing delete/parse buttons
   - Opens `DocumentPreviewModal` with the document's `fileUrl`

4. **Fallback for unsupported types**
   - Show: "Preview not available. Download to view."

### Status: ✅ Complete (DocumentPreviewModal component created)

---

## 🔨 Improvement T — CSV Export for Admin

**ID:** T | **Priority:** 🟡 High | **Complexity:** Low (2 hrs)

### Goal
Allow admin to export Users, Applications, and Grievances data as CSV files from the admin panel.

### No new packages needed — use native JS `Blob` + `URL.createObjectURL`.

### Implementation Steps

1. **Create `src/lib/exportCSV.ts`**
   ```ts
   export function exportToCSV(data: Record<string, any>[], filename: string) {
     if (!data.length) return;
     const headers = Object.keys(data[0]).join(",");
     const rows = data.map(row =>
       Object.values(row).map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")
     ).join("\n");
     const blob = new Blob([headers + "\n" + rows], { type: "text/csv" });
     const url = URL.createObjectURL(blob);
     const a = document.createElement("a");
     a.href = url; a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
     a.click(); URL.revokeObjectURL(url);
   }
   ```

2. **Add Export button to Admin Users page** (`admin/users/page.tsx`)
   - "Export Users CSV" button in the page header
   - Fetch `/api/admin/users`, map to flat object, call `exportToCSV`
   - Fields: `id, name, email, role, state, income, createdAt`

3. **Add Export button to Admin Grievances page** (`admin/grievances/page.tsx`)
   - Fields: `id, subject, description, status, userName, userEmail, createdAt, resolvedAt`

4. **Add Export button to Admin Stats page** (`admin/stats/page.tsx`)
   - Export application summary: `scheme, totalApplications, approved, pending, rejected`

5. **Style the export button**
   - Use `<Download size={16} />` icon from lucide-react
   - Green outlined button: `border: "1px solid #16a34a"`, `color: "#16a34a"`

### Status: ✅ Complete (implemented with client components for UsersTable, GrievancesTable, StatsClient, ApplicationsPage)

---

## 🔨 Improvement U — Document Expiry Alerts

**ID:** U | **Priority:** 🟡 Medium | **Complexity:** Medium (3–4 hrs)

### Goal
Automatically notify users when their uploaded documents (Aadhaar, income certificate, etc.) are expiring within 30 days via in-app notification and email.

### No new packages needed.

### Implementation Steps

1. **Create API route `/api/cron/document-expiry/route.ts`**
   - Query all documents where `expiresAt` is between `now` and `now + 30 days`
   - For each: create a `Notification` record (already in schema) with message
   - Also send email via existing Nodemailer setup
   - Protect with `Authorization: Bearer ${CRON_SECRET}` header check

2. **Add to `vercel.json`** (for scheduled cron on Vercel)
   ```json
   {
     "crons": [{ "path": "/api/cron/document-expiry", "schedule": "0 8 * * *" }]
   }
   ```

3. **Add CRON_SECRET to `.env`**
   ```env
   CRON_SECRET="your-random-secret-string"
   ```

4. **Show expiry warning badge in Document Vault**
   - In `documents/page.tsx`, for cards where `isExpiringSoon(doc.expiresAt)` is true
   - Show a yellow `⚠️ Expires in X days` badge on the card (already has `isExpiringSoon` helper)
   - For expired docs show red `❌ Expired` badge

5. **Dashboard widget**
   - In `dashboard/page.tsx`, add a "Document Alerts" section
   - Query documents expiring soon via `/api/documents?expiringSoon=true`
   - Show alert card: "Your Aadhaar expires in 12 days — Renew now"

### Status: ✅ Complete (cron API, email function, dashboard widget implemented)

---

## 🔨 Improvement V — Animated Eligibility Progress Rings

**ID:** V | **Priority:** 🟢 Medium | **Complexity:** Medium (3 hrs)

### Goal
Replace plain eligible/not-eligible text with animated circular progress rings showing an eligibility match percentage per scheme — far more visual and impressive.

### No new packages — use SVG `<circle>` with `strokeDashoffset` animation.

### Implementation Steps

1. **Create `src/components/ui/EligibilityRing.tsx`**
   - Props: `percentage: number` (0–100), `color: string`, `size?: number`
   - Use SVG circle with `stroke-dasharray` and animate `stroke-dashoffset` with framer-motion
   - Show percentage number in center with a label ("Match")

2. **Calculate match % in eligibility API** (`/api/eligibility/route.ts`)
   - Return a `matchScore: number` (0–100) for each scheme based on how many criteria are met
   - Formula: `(criteriaMet / totalCriteria) * 100`

3. **Update eligibility page** (`eligibility/page.tsx`)
   - Replace the simple scheme list cards with cards that include `<EligibilityRing percentage={scheme.matchScore} />`
   - Ring animates in when card enters viewport (use `whileInView` from framer-motion)

4. **Color coding**
   - 80–100%: `#22c55e` (green)
   - 50–79%: `#f97316` (orange)
   - 0–49%: `#ef4444` (red)

### Status: ✅ Complete (EligibilityRing component, matchScore calculation, API and page updated)

---

## 🔨 Improvement W — In-App Notification Centre (Dropdown)

**ID:** W | **Priority:** 🟡 High | **Complexity:** Medium (3–4 hrs)

### Goal
Replace the current basic notification bell with a full dropdown notification centre showing recent alerts with timestamps, read/unread state, and action links.

### No new packages needed.

### Implementation Steps

1. **Update Notification Bell** (`src/components/ui/NotificationBell.tsx`)
   - Add a dropdown panel that opens on click (not separate page)
   - Panel: max-height 400px, scrollable, glassmorphism style
   - Fetch `/api/notifications?limit=10` on open
   - Show each notification: icon + message + relative time ("2 hours ago")
   - Unread ones have a subtle blue left border + slightly darker background
   - "Mark all as read" button at top right of dropdown

2. **Add notification type icons**
   - `APPLICATION_UPDATE` → `<FileText />` in green
   - `GRIEVANCE_REPLY` → `<MessageSquare />` in blue
   - `SCHEME_ALERT` → `<Megaphone />` in orange
   - `DOCUMENT_EXPIRY` → `<AlertTriangle />` in yellow
   - `GENERAL` → `<Bell />` in gray

3. **Close on outside click**
   - Use `useEffect` with `mousedown` event listener to detect click outside the dropdown

4. **Real-time badge count**
   - Poll `/api/notifications/unread-count` every 60 seconds
   - Show count badge on bell icon (red circle with number)

5. **Link each notification**
   - Clicking a notification marks it read AND navigates to the relevant page

### Status: ✅ Complete (NotificationBell dropdown implemented with all features)

---

## 🔨 Improvement X — Page Progress Bar (Top Loading Bar)

**ID:** X | **Priority:** 🟢 Low | **Complexity:** Low (30 min)

### Goal
Show a thin animated progress bar at the top of the screen during Next.js page navigation — like the YouTube loading bar.

### Package
```bash
npm install nextjs-toploader
```

### Implementation Steps

1. **Add `<NextTopLoader>` to root layout** (`src/app/layout.tsx`)
   ```tsx
   import NextTopLoader from "nextjs-toploader";
   // Inside <body>, before {children}:
   <NextTopLoader color="#4338ca" height={3} showSpinner={false} />
   ```

2. **Configure colors**
   - Color: `#4338ca` (SBMS indigo)
   - Height: `3px`
   - Shadow: `"0 0 10px #4338ca, 0 0 5px #6366f1"`
   - `showSpinner: false` (hide the spinner since we have our own loading UI)

3. **Verify it works on all navigations**
   - Test clicking sidebar links, applying to schemes, navigating admin pages

### Status: ✅ Complete — `nextjs-toploader` installed, added to `src/app/layout.tsx` with SBMS indigo `#4338ca` color, 3px height, indigo glow shadow, no spinner. Build verified exit code 0.

---

## 📋 New Improvements Tracking Table

| ID | Name | Category | Priority | Complexity | Status |
|----|------|----------|----------|------------|--------|
| N | Premium UI/UX + AI Bot Fix + NLP Finder | UI/UX + AI | 🟡 High | Medium | ✅ Complete |
| O | Rate Limiting | Security | 🔴 Critical | Low | ✅ Complete |
| P | Skeleton Loading Screens | UI/UX | 🟡 High | Low | ✅ Complete |
| Q | Confetti on Application | UI/UX | 🟢 Medium | Low | ✅ Complete |
| R | Password Strength Meter | Security + UX | 🟡 High | Low | ✅ Complete |
| S | PDF Preview in Document Vault | Feature | 🟡 High | Low-Medium | ✅ Complete |
| T | CSV Export for Admin | Admin | 🟡 High | Low | ✅ Complete |
| U | Document Expiry Alerts | Feature | 🟢 Medium | Medium | ✅ Complete |
| V | Animated Eligibility Rings | UI/UX | 🟢 Medium | Medium | ✅ Complete |
| W | Notification Centre Dropdown | UI/UX | 🟡 High | Medium | ✅ Complete |
| X | Page Progress Top Bar | UI/UX | 🟢 Low | Low | ✅ Complete |

---

## 🔄 How to Update This File

After each improvement completes:
1. Mark the improvement ✅ in the progress table
2. Add to Improvements Completed list with completion date
3. Update "Last updated" header with new improvement ID
4. Note any new packages installed in Tech Stack section
5. Update the Quick Index if new sections are added
6. Move completed items from "What's Next" to "Completed"
7. Run `npm run build` to verify no errors

This file is the single source of truth for the entire project.

---

## 🚀 Getting Started for New Developers

1. **Clone the repo** and run `npm install`
2. **Copy `.env.example` to `.env`** and fill in all required values
3. **Run database setup**: `npx prisma db push`
4. **Seed the database**: `npx tsx prisma/seed.ts`
5. **Generate embeddings**: `npx tsx scripts/embed-schemes.ts`
6. **Start dev server**: `npm run dev`
7. **Build for production**: `npm run build`

---

## 📞 Support & Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://prisma.io/docs
- **Groq API**: https://console.groq.com/docs
- **Gemini API**: https://aistudio.google.com/apis
- **Vercel Deploy**: https://vercel.com/docs

---

*Last Updated: Improvement W — Notification Centre Dropdown*
*Maintained by: Karan Raj*