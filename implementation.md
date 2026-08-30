# Smart Beneficiary Mapping System (SBMS)
## Complete Implementation Documentation

---

## 📌 Project Overview

The **Smart Beneficiary Mapping System (SBMS)** is an AI-powered full-stack web application built to help Indian citizens — especially from rural and underserved communities — discover, match, and apply for government welfare schemes (Yojanas). The platform leverages modern AI techniques such as **Retrieval-Augmented Generation (RAG)**, **semantic vector search**, and **LLM-powered chatbots** to deliver personalized scheme recommendations based on each user's profile.

---

## 🎯 Project Objective

> Bridge the gap between government welfare schemes and eligible beneficiaries using smart, AI-driven eligibility matching, multilingual assistance, and a simple, accessible digital interface.

### Key Problems Solved
- Citizens are unaware of schemes they qualify for
- Application processes are complex and not user-friendly
- Language barriers prevent access for rural users
- Lack of a central grievance system for welfare scheme queries

---

## 🧰 Technology Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.1.6 | Full-stack React framework (App Router) |
| React | 19.2.3 | UI component library |
| TailwindCSS | ^4 | Utility-first CSS styling |
| Framer Motion | ^12 | Animations and page transitions |
| Recharts | ^3 | Data visualization (admin dashboard) |
| Lucide React | ^0.577 | Icon library |
| React Hot Toast | ^2 | Toast notifications |
| canvas-confetti | ^1.9 | Confetti on successful application |

### Backend / API
| Technology | Version | Purpose |
|---|---|---|
| Next.js API Routes | 16.1.6 | Serverless API endpoints |
| Prisma ORM | ^7.4.2 | Database schema, queries, migrations |
| NextAuth.js (v5 beta) | ^5.0.0-beta.30 | Authentication & session management |
| bcryptjs | ^3 | Password hashing |
| Nodemailer | ^8 | Email delivery |
| web-push | ^3 | Web push notifications |
| rate-limiter-flexible | ^9 | API rate limiting |

### AI / Machine Learning
| Technology | Purpose |
|---|---|
| Groq SDK (LLaMA 3.3-70B / 3.1-8B) | LLM chatbot backbone |
| Google Gemini API (gemini-embedding-001) | 768-dimensional text embeddings |
| Google Gemini Vision (gemini-1.5-flash) | OCR document data extraction |
| AI SDK (Vercel AI SDK) | Streaming AI responses |
| pgvector (PostgreSQL extension) | Vector similarity search |

### Database
| Technology | Purpose |
|---|---|
| PostgreSQL (via Neon serverless) | Primary relational database |
| pgvector extension | Cosine similarity vector search for RAG |
| Prisma | ORM for schema management, migrations, seeding |
| @neondatabase/serverless | Low-latency Neon DB driver |

### DevOps / Deployment
| Technology | Purpose |
|---|---|
| Vercel | Hosting platform (serverless Next.js) |
| Neon DB | Serverless PostgreSQL in the cloud |
| @ducanh2912/next-pwa | Progressive Web App (PWA) support |
| IndexedDB (idb) | Browser-side offline data caching |

---

## 🗂️ Complete Project Structure

```
Smart_Beneficiary_Mapping_System/
│
├── 📄 package.json               # npm dependencies & scripts
├── 📄 next.config.ts             # Next.js config (PWA, images, etc.)
├── 📄 tsconfig.json              # TypeScript configuration
├── 📄 eslint.config.mjs          # ESLint configuration
├── 📄 postcss.config.mjs         # PostCSS / TailwindCSS config
├── 📄 prisma.config.ts           # Prisma database connection config
├── 📄 .env                       # Environment variables (actual secrets)
├── 📄 .env.example               # Template of required env variables
├── 📄 .gitignore                 # Files ignored by Git
├── 📄 schema.sql                 # Raw PostgreSQL schema export
├── 📄 CLAUDE.md                  # AI agent context document
│
├── 📁 prisma/
│   ├── schema.prisma             # Database schema (all models, enums, relations)
│   └── seed.ts                   # Database seed file (pre-loads schemes, categories)
│
├── 📁 scripts/
│   ├── embed-schemes.ts          # Script to generate scheme vector embeddings
│   ├── push-schema.ts            # Script to push schema to Neon DB
│   ├── reset-pass.ts             # Admin utility to reset user passwords
│   ├── test_push.ts              # Push notification testing script
│   └── download_icons.mjs        # PWA icons downloader
│
├── 📁 public/
│   ├── manifest.json             # PWA web app manifest
│   ├── sw.js                     # Service Worker for offline support
│   ├── icon-192.png              # PWA icon (192×192)
│   ├── icon-512.png              # PWA icon (512×512)
│   └── *.svg                     # Static vector assets
│
└── 📁 src/
    ├── 📄 auth.ts                # NextAuth configuration (providers, callbacks)
    ├── 📄 middleware.ts           # Route-level auth & RBAC middleware
    │
    ├── 📁 types/
    │   ├── index.ts              # Shared TypeScript type definitions
    │   └── next-auth.d.ts        # NextAuth session type augmentation
    │
    ├── 📁 lib/                   # Server-side utility libraries
    │   ├── prisma.ts             # Prisma client singleton
    │   ├── eligibility.ts        # Rule-based eligibility scoring engine
    │   ├── embeddings.ts         # Google Gemini embedding generation
    │   ├── rag.ts                # pgvector similarity search (RAG pipeline)
    │   ├── groq.ts               # Groq LLM chat API with RAG context injection
    │   ├── vision.ts             # Gemini OCR for document scanning
    │   ├── digilocker.ts         # DigiLocker OAuth2 integration (placeholder)
    │   ├── email.ts              # Email notifications (Nodemailer)
    │   ├── push.ts               # Web push notifications (web-push / VAPID)
    │   ├── notifications.ts      # In-app notification helpers
    │   ├── rateLimit.ts          # In-memory API rate limiter
    │   ├── exportCSV.ts          # CSV export utility for admin
    │   └── indexedDB.ts          # Client-side offline caching (IndexedDB)
    │
    ├── 📁 app/                   # Next.js App Router
    │   ├── layout.tsx            # Root layout (fonts, providers, PWA)
    │   ├── page.tsx              # Public landing page
    │   ├── globals.css           # Global CSS + Tailwind base styles
    │   │
    │   ├── 📁 (auth)/            # Auth route group (no sidebar layout)
    │   │   ├── login/page.tsx    # Login page
    │   │   └── register/page.tsx # Registration page
    │   │
    │   ├── 📁 (app)/             # Authenticated app route group (with sidebar)
    │   │   ├── layout.tsx        # App shell (sidebar + mobile header)
    │   │   ├── dashboard/        # User dashboard (my schemes, stats)
    │   │   ├── schemes/          # Browse all government schemes
    │   │   ├── eligibility/      # AI eligibility checker page
    │   │   ├── ai-finder/        # AI-powered scheme finder
    │   │   ├── applications/     # My applications tracker
    │   │   ├── grievances/       # Grievance filing & tracker
    │   │   ├── documents/        # Document vault (upload & manage)
    │   │   ├── profile/          # User profile editor
    │   │   ├── announcements/    # Scheme announcements feed
    │   │   ├── offline-sync/     # Offline sync management page
    │   │   └── admin/            # Admin-only section
    │   │       ├── stats/        # Analytics & platform statistics
    │   │       ├── users/        # User management
    │   │       ├── schemes/      # Scheme CRUD management
    │   │       ├── applications/ # All applications review
    │   │       ├── grievances/   # All grievances management
    │   │       └── announcements/# Announcement management
    │   │
    │   ├── 📁 api/               # REST API endpoints (Next.js Route Handlers)
    │   │   ├── auth/             # NextAuth.js auth routes
    │   │   ├── chat/             # AI chatbot endpoint (RAG + Groq)
    │   │   ├── schemes/          # Schemes CRUD API
    │   │   ├── applications/     # Applications API
    │   │   ├── eligibility/      # Eligibility check API
    │   │   ├── ai-finder/        # AI scheme finder API
    │   │   ├── grievances/       # Grievances CRUD API
    │   │   ├── documents/        # Document upload/manage API
    │   │   ├── profile/          # User profile API
    │   │   ├── family/           # Family members API
    │   │   ├── notifications/    # Notifications API
    │   │   ├── push/             # Web push subscription API
    │   │   ├── announcements/    # Announcements API
    │   │   ├── admin/            # Admin-only APIs
    │   │   ├── agent/            # AI agent API
    │   │   └── cron/             # Scheduled cron jobs
    │   │
    │   ├── 📁 mock-portal/       # Simulated government portal (for demo)
    │   └── 📁 offline/           # Offline fallback page
    │
    └── 📁 components/            # Reusable React components
        ├── Providers.tsx         # React context providers wrapper
        ├── 📁 layout/
        │   ├── Sidebar.tsx       # Main navigation sidebar
        │   └── MobileHeader.tsx  # Mobile-responsive header
        ├── 📁 ui/
        │   ├── Badge.tsx         # Status badge component
        │   ├── Modal.tsx         # Generic modal dialog
        │   ├── Skeleton.tsx      # Loading skeleton screens
        │   ├── StatCard.tsx      # Statistics card component
        │   ├── EligibilityRing.tsx  # Circular eligibility score indicator
        │   ├── NotificationBell.tsx # Bell icon + dropdown for notifications
        │   ├── ConfettiEffect.tsx   # Celebration animation
        │   ├── PageAnimations.tsx   # Route transition animations
        │   ├── PageTransition.tsx   # Framer Motion page wrapper
        │   └── PasswordStrength.tsx # Real-time password strength meter
        ├── 📁 schemes/
        │   ├── SchemeCard.tsx    # Individual scheme display card
        │   └── EligibilityBadge.tsx # Eligibility status badge
        ├── 📁 chat/
        │   ├── ChatWidget.tsx    # Full AI chatbot interface widget
        │   ├── ChatBubble.tsx    # Chat message bubble
        │   ├── ChatWindow.tsx    # Chat window container
        │   └── TypingIndicator.tsx # "..." typing animation
        ├── 📁 admin/
        │   ├── StatsClient.tsx   # Admin statistics dashboard charts
        │   ├── AnalyticsCharts.tsx  # Recharts analytics visualization
        │   └── UsersTable.tsx    # Users data table with actions
        ├── 📁 applications/      # Application-related components
        ├── 📁 forms/             # Reusable form components
        ├── 📁 landing/           # Landing page sections
        ├── 📁 providers/         # Context provider components
        └── 📁 vault/
            └── DocumentPreviewModal.tsx  # Document preview overlay
```

---

## 🧠 Core Concepts Used

### 1. Retrieval-Augmented Generation (RAG)
**File:** `src/lib/rag.ts`, `src/lib/embeddings.ts`, `src/lib/groq.ts`

RAG is a technique that enhances LLM responses by first retrieving relevant context from a knowledge base before generating an answer.

**Pipeline:**
```
User Query
    ↓
Embed query (Gemini embedding-001 → 768-dim vector)
    ↓
Search pgvector (cosine similarity) → Top-N matching schemes
    ↓
Inject scheme context into Groq LLM prompt
    ↓
LLM generates grounded, scheme-specific response
    ↓
User receives accurate, hallucination-free answer
```

**Why used:** Prevents the AI from hallucinating fake scheme details by grounding it in real scheme data stored in the database.

---

### 2. Vector Embeddings & Semantic Search
**File:** `src/lib/embeddings.ts`, `prisma/schema.prisma` (SchemeEmbedding model)

Each scheme's text (title + description + benefits + eligibility) is converted into a **768-dimensional floating-point vector** using Google's `gemini-embedding-001` model. These vectors are stored in PostgreSQL using the `pgvector` extension.

**Similarity search uses cosine distance:**
```sql
1 - (se.vector <=> queryVector::vector) AS similarity
```

**Why used:** Traditional keyword search misses synonyms and intent. Vector search understands meaning — "financial aid for farmers" finds "PM-KISAN" even without exact keyword matches.

---

### 3. Rule-Based Eligibility Matching
**File:** `src/lib/eligibility.ts`

A deterministic eligibility engine evaluates whether a user qualifies for a scheme based on structured criteria:

| Criterion | Check |
|---|---|
| Age | `minAge ≤ userAge ≤ maxAge` |
| Gender | Exact match or ALL |
| Income | `userIncome ≤ scheme.maxIncome` |
| State | User's state in scheme's allowed states list |

Returns a **match score (0–100%)** based on how many criteria are met out of total applicable criteria. Handles incomplete profiles gracefully.

---

### 4. Large Language Models (LLMs)
**File:** `src/lib/groq.ts`

Uses **Groq's inference API** with **LLaMA 3.3-70B Versatile** (primary) and **LLaMA 3.1-8B Instant** (fallback for rate limits) to power:
- The AI chatbot (with RAG context)
- Multilingual responses (English, Hindi, Marathi)
- Personalized recommendations based on user profile

**Fallback logic:** Automatically switches to a lighter model when rate-limit errors (HTTP 429) are encountered.

---

### 5. AI Vision / OCR (Optical Character Recognition)
**File:** `src/lib/vision.ts`

Uses **Google Gemini 1.5 Flash** (multimodal model) to extract structured data from uploaded documents:
- **Aadhaar Card** → name, DOB, Aadhaar number
- **Income Certificate** → name, annual income
- **Other documents** → name, summary

Users upload a document image, and the AI auto-fills their profile fields.

---

### 6. Role-Based Access Control (RBAC)
**File:** `src/middleware.ts`, `src/auth.ts`

Two roles: `USER` and `ADMIN`

| Route | Access |
|---|---|
| `/`, `/login`, `/register` | Public |
| `/dashboard`, `/schemes`, etc. | Authenticated users |
| `/admin/*` | Admins only |
| `/api/admin/*` | Admins only (server-side check) |

Middleware runs on every request using NextAuth's JWT session.

---

### 7. JWT Authentication
**File:** `src/auth.ts`

Uses **NextAuth.js v5** with two auth providers:
- **Google OAuth 2.0** — One-click sign in with Google
- **Credentials (Email + Password)** — Traditional login with bcrypt-hashed passwords

JWT tokens carry `id` and `role` for fast, stateless auth checks.

---

### 8. Progressive Web App (PWA)
**Files:** `public/manifest.json`, `public/sw.js`, `next.config.ts`

The app is installable as a PWA:
- Offline fallback page via Service Worker
- App icons (192×192, 512×512)
- `manifest.json` with theme color and display mode
- IndexedDB client-side caching for offline-accessible data (`src/lib/indexedDB.ts`)

---

### 9. Web Push Notifications
**File:** `src/lib/push.ts`

Uses **VAPID (Voluntary Application Server Identification)** protocol via the `web-push` library to send browser push notifications to users even when the app is closed.

Events that trigger push notifications:
- Application status update (approved/rejected)
- New matching scheme discovered
- Grievance response received

---

### 10. Rate Limiting
**File:** `src/lib/rateLimit.ts`

In-memory rate limiter using `rate-limiter-flexible`:

| Endpoint | Limit |
|---|---|
| Login | 10 attempts / 10 minutes / IP |
| Register | 5 requests / 15 minutes / IP |
| Chat | 30 messages / hour / user |
| AI Finder | 20 searches / hour / user |
| General API | 100 requests / minute / IP |

---

### 11. DigiLocker Integration (Planned)
**File:** `src/lib/digilocker.ts`

Architecture placeholder for integrating **India's DigiLocker** government document API via OAuth 2.0. Users would authorize SBMS to access their stored documents (Aadhaar, income cert, etc.) directly.

---

### 12. Email Notifications
**File:** `src/lib/email.ts`

Transactional emails via **Nodemailer** for:
- Welcome emails on registration
- Application status updates
- Grievance resolution notifications

---

## 📦 Database Schema (Prisma Models)

```
User              — Core user profile with Aadhaar, income, state, gender, DOB
Account           — OAuth provider accounts (Google)
Session           — NextAuth sessions
VerificationToken — Email verification tokens

Category          — Scheme categories (Education, Health, Agriculture, etc.)
Scheme            — Government welfare scheme details
SchemeEmbedding   — pgvector embedding for each scheme (for RAG)

Application       — User's scheme applications with status tracking
Grievance         — User-filed grievances/complaints
Announcement      — Admin-posted scheme announcements
ChatMessage       — Persisted AI chat history per user
Notification      — In-app notification queue
FamilyMember      — Family member data for household eligibility
Document          — Uploaded document vault (Aadhaar, certs, etc.)
PushSubscription  — Browser push subscription endpoints
```

**Enum Types:**
- `Role`: `USER | ADMIN`
- `Gender`: `MALE | FEMALE | OTHER | PREFER_NOT_TO_SAY`
- `ApplicationStatus`: `PENDING | APPROVED | REJECTED | UNDER_REVIEW`
- `GrievanceStatus`: `OPEN | IN_PROGRESS | RESOLVED | CLOSED`

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/...` | NextAuth authentication routes |
| GET/POST | `/api/schemes` | List or create schemes |
| GET | `/api/eligibility` | Check eligibility for all schemes |
| POST | `/api/ai-finder` | AI-powered scheme search (RAG) |
| POST | `/api/chat` | AI chatbot conversation |
| GET/POST | `/api/applications` | User applications CRUD |
| GET/POST | `/api/grievances` | Grievances CRUD |
| GET/POST | `/api/documents` | Document vault CRUD |
| GET/PUT | `/api/profile` | User profile management |
| GET/POST | `/api/family` | Family members management |
| GET/POST | `/api/notifications` | In-app notifications |
| POST | `/api/push` | Push subscription management |
| GET/POST | `/api/announcements` | Announcements feed |
| GET | `/api/admin/stats` | Platform-wide statistics |
| GET | `/api/admin/users` | Admin user management |
| POST | `/api/agent` | AI agent endpoint |
| GET | `/api/cron` | Scheduled job triggers |

---

## 🔑 Environment Variables Required

```env
# PostgreSQL (Neon Serverless)
DATABASE_URL=postgresql://...          # Connection pooler URL
DIRECT_URL=postgresql://...            # Direct connection (for migrations)

# NextAuth.js
NEXTAUTH_SECRET=...                    # Random 32-byte secret
NEXTAUTH_URL=http://localhost:3000     # App base URL

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# AI APIs
GEMINI_API_KEY=...                     # Google Gemini (embeddings + vision)
GROQ_API_KEY=...                       # Groq (LLaMA LLM)

# Web Push
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...

# Email (optional)
EMAIL_HOST=...
EMAIL_USER=...
EMAIL_PASS=...

# DigiLocker (optional - planned)
DIGILOCKER_CLIENT_ID=...
DIGILOCKER_CLIENT_SECRET=...
DIGILOCKER_REDIRECT_URI=...
```

---

## 🚀 Setup & Run Commands

```bash
# Install dependencies
npm install

# Setup database (generate Prisma client)
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database (load initial schemes & categories)
npm run db:seed

# Generate scheme vector embeddings for RAG
npx tsx scripts/embed-schemes.ts

# Run development server
npm run dev

# Build for production
npm run build

# Open Prisma Studio (visual DB browser)
npm run db:studio
```

---

## 👥 User Roles & Features

### Regular User (Citizen)
- ✅ Register / Login (Email or Google)
- ✅ Complete profile (DOB, income, gender, state, Aadhaar)
- ✅ Add family members for household eligibility
- ✅ Browse all government schemes by category
- ✅ AI Eligibility Checker — automated rule-based match scoring
- ✅ AI Scheme Finder — semantic chatbot to discover schemes by natural language query
- ✅ Apply for schemes (track status: Pending → Approved/Rejected)
- ✅ Upload documents to Document Vault (Aadhaar, income cert, caste cert, etc.)
- ✅ AI OCR — scan documents to auto-fill profile
- ✅ File grievances and track resolution
- ✅ Receive push notifications & in-app notifications
- ✅ View announcements and scheme updates
- ✅ Offline mode (PWA with cached data)

### Admin
- ✅ All user features
- ✅ Platform statistics dashboard (total users, applications, scheme match rates)
- ✅ Manage all government schemes (Create, Edit, Delete)
- ✅ Review and update all user applications
- ✅ Manage and respond to all grievances
- ✅ Create and publish announcements
- ✅ Export data as CSV
- ✅ View analytics charts (Recharts)

---

## 🧩 Key Design Patterns

| Pattern | Usage |
|---|---|
| **Route Groups** | `(app)` and `(auth)` isolate layout concerns in Next.js App Router |
| **Server Components** | Data-fetching pages are React Server Components (no client-side fetch overhead) |
| **Client Components** | Marked with `"use client"` for interactive UI (chat, forms, modals) |
| **Middleware RBAC** | Auth + role checks happen at the edge before page loads |
| **Singleton Prisma** | `lib/prisma.ts` exports a single Prisma client instance to avoid connection leaks |
| **Fallback Models** | Groq LLM falls back to a smaller model on rate limits |
| **Match Score** | Every eligibility check returns a 0–100% score, not just a boolean |
| **Graceful Incomplete Profiles** | Missing profile data doesn't disqualify — users see what data is needed |

---

## 📊 Academic Concepts Demonstrated

| Concept | Implementation |
|---|---|
| Natural Language Processing (NLP) | LLM chatbot, multilingual support |
| Information Retrieval | pgvector cosine similarity search |
| Vector Space Model | 768-dim embeddings (Gemini) representing schemes |
| Knowledge Base / RAG | Scheme database as the grounding context for LLM |
| Supervised Rules Engine | Deterministic eligibility matching with weighted scoring |
| Computer Vision / OCR | Gemini 1.5 Flash extracting data from document images |
| OAuth 2.0 | Google login + DigiLocker architecture |
| JWT (JSON Web Tokens) | Stateless session auth across serverless functions |
| RESTful API Design | 16 API routes following REST conventions |
| Database Normalization | Relational schema with proper foreign keys and enums |
| Serverless Architecture | Vercel + Neon serverless — no fixed server instances |
| PWA / Service Worker | Offline-first capability, installable on mobile |
| Web Push API | VAPID-based server-to-browser push notifications |
| Rate Limiting | Token bucket algorithm to protect API endpoints |
| Role-Based Access Control (RBAC) | Admin vs. User permission system |

---

## 📁 Notable Files Quick Reference

| File | What It Does |
|---|---|
| `prisma/schema.prisma` | Entire database schema |
| `prisma/seed.ts` | Pre-loads schemes & categories |
| `scripts/embed-schemes.ts` | Generates pgvector embeddings for RAG |
| `src/auth.ts` | NextAuth providers + JWT callbacks |
| `src/middleware.ts` | Route protection (RBAC) |
| `src/lib/eligibility.ts` | Rule-based eligibility engine |
| `src/lib/rag.ts` | pgvector semantic search |
| `src/lib/embeddings.ts` | Gemini embedding generation |
| `src/lib/groq.ts` | Groq LLM with RAG context injection |
| `src/lib/vision.ts` | Gemini OCR document scanner |
| `src/lib/push.ts` | Web push notification sender |
| `src/lib/rateLimit.ts` | In-memory rate limiter |
| `src/lib/digilocker.ts` | DigiLocker OAuth2 integration stub |
| `public/sw.js` | Service Worker for offline/PWA |
| `public/manifest.json` | PWA manifest (icons, colors, name) |

---

*Generated: March 2026 | Smart Beneficiary Mapping System — Year 2 Academic Project*
