# MindSparkAI Course Delivery System — Design Spec

**Date:** 2026-04-05
**Status:** Draft — awaiting approval

---

## Overview

Build a full web-based course portal on mindsparkstack.com so that paying customers receive everything the website promises: 7 course modules (33 lessons), prompt library, tool comparison guide, cheat sheets, certificates, and community access. Content is AI-generated. Auth and data powered by Supabase (free tier). Payments already handled by Stripe.

---

## System Architecture

```
Customer Journey:
Website → Stripe Checkout → Stripe Webhook → Supabase Edge Function
→ Create user account + set tier → Welcome email with login credentials
→ Customer logs in → Dashboard → Tier-gated course content
```

**Stack:**
- **Payments:** Stripe (already configured — 5 active products)
- **Auth + Database:** Supabase (free tier — 50k MAU, 500MB DB)
- **Frontend:** Static HTML/CSS/JS on Turbify (existing hosting)
- **Community:** Discord (free)
- **Email:** Supabase Edge Function triggers welcome email
- **Content:** AI-generated lessons, PDFs, cheat sheets

**Integration flow:**
1. Customer buys on Stripe via payment link
2. Stripe fires `checkout.session.completed` webhook
3. Supabase Edge Function receives webhook, creates user in `auth.users` with auto-generated password, creates `profiles` row with tier
4. Edge Function sends welcome email with login URL + credentials
5. Customer logs in at `/login.html` → redirected to `/dashboard.html`
6. Dashboard shows content unlocked for their tier
7. Supabase Row Level Security enforces access rules

---

## Database Schema (Supabase / PostgreSQL)

### `profiles`
| Column | Type | Purpose |
|--------|------|---------|
| id | uuid (FK → auth.users) | Links to Supabase auth |
| email | text | Customer email |
| full_name | text | From Stripe checkout |
| tier | text | `masterclass`, `vip`, `core`, `hive`, `vanguard` |
| stripe_customer_id | text | For managing subscriptions |
| created_at | timestamptz | Account creation |

### `progress`
| Column | Type | Purpose |
|--------|------|---------|
| id | uuid (PK) | Primary key |
| user_id | uuid (FK → profiles) | Who |
| lesson_slug | text | e.g., `module-1/lesson-2` |
| completed | boolean | Done or not |
| completed_at | timestamptz | When they finished |

### `subscriptions`
| Column | Type | Purpose |
|--------|------|---------|
| id | uuid (PK) | Primary key |
| user_id | uuid (FK → profiles) | Who |
| stripe_subscription_id | text | Stripe sub ID |
| status | text | `active`, `canceled`, `past_due` |
| current_period_end | timestamptz | When billing renews |

### `certificates`
| Column | Type | Purpose |
|--------|------|---------|
| id | uuid (PK) | Primary key |
| user_id | uuid (FK → profiles) | Who |
| issued_at | timestamptz | When generated |
| certificate_url | text | Link to their certificate |

---

## Content Access Rules by Tier

| Content | masterclass | vip | core | hive | vanguard |
|---------|:-----------:|:---:|:----:|:----:|:--------:|
| 7 course modules (33 lessons) | Y | Y | - | - | Y |
| Module cheat sheets (7 PDFs) | Y | Y | - | - | Y |
| Prompt library (50+) | Y | Y | Y | Y | Y |
| AI Tool Comparison Guide 2026 | Y | Y | Y | Y | Y |
| Certificate of completion | Y | Y | - | - | Y |
| Discord community | Y | Y | Y | Y | Y |
| VIP monthly Q&A calls | - | Y | - | - | Y |
| 1:1 onboarding session | - | Y | - | - | Y |
| Priority support (1hr response) | - | Y | - | - | Y |
| Weekly live sessions | - | - | - | Y | Y |
| Early access to new content | - | Y | - | Y | Y |
| Commercial usage rights | - | - | - | - | Y |

---

## Course Content Structure

**7 Modules, 33 Lessons.** Each lesson: ~1,000-1,500 words, practical, actionable, with examples and exercises.

**Threading philosophy:** "AI is a force multiplier, not a replacement. Build systems that make you faster and better at what you already do — don't outsource your thinking."

### Module 1: Why Most People Use AI Wrong (and the Fix)
1. The Copy-Paste Trap: Why Asking AI Like Google Fails
2. How AI Actually Thinks (Mental Model for Non-Technical People)
3. The Input-Output Principle: Better Inputs = Better Outputs
4. The 3 Mistakes That Make AI Useless (and How to Avoid Them)
5. Your First AI Win: A 10-Minute Exercise That Changes Everything

### Module 2: The Role-Context-Constraints Framework
1. What Is RCC and Why It Works
2. Role: Telling AI Who To Be (With Examples)
3. Context: Giving AI the Background It Needs
4. Constraints: Setting Boundaries That Improve Output
5. Putting It Together: RCC in Practice Across 5 Scenarios

### Module 3: The 5 Workflow Patterns
1. Pattern 1: The Research Synthesizer
2. Pattern 2: The Draft-Refine Loop
3. Pattern 3: The Decision Matrix Builder
4. Pattern 4: The Content Multiplier
5. Pattern 5: The Automation Chain

### Module 4: Building Your Personal AI Stack
1. The AI Tool Landscape in 2026: What Actually Matters
2. Choosing Your Core AI Tool (ChatGPT vs Claude vs Gemini vs Others)
3. Specialist Tools: Writing, Image, Code, Research
4. Building Your Daily AI Workflow (Morning to Evening)
5. The $0 Stack vs The Power Stack: What's Worth Paying For

### Module 5: Real Use Cases
1. Emails That Write Themselves (But Sound Like You)
2. Reports and Summaries in Minutes, Not Hours
3. Research: From Zero to Expert on Any Topic in 20 Minutes
4. Meeting Prep, Notes, and Follow-Ups on Autopilot
5. Data Analysis and Spreadsheets with AI

### Module 6: Coding & Technical Work with AI
1. AI-Assisted Coding: The Right Way to Use Copilots
2. Debugging with AI: Faster Fixes, Better Understanding
3. Building Automations Without Being a Developer
4. From Idea to Prototype in One Afternoon

### Module 7: Advanced Automation and Agent Workflows
1. What Are AI Agents and Why Should You Care
2. Building Your First Agent Workflow (Step by Step)
3. Multi-Step Automations: Connecting AI to Your Real Tools
4. The Future: Where This Is All Going and How to Stay Ahead

### Bonus Content
- **Prompt Library PDF** — 50+ prompts organized by category (email, research, writing, coding, analysis, creative)
- **AI Tool Comparison Guide 2026** — 15+ tools compared head-to-head with ratings, pricing, best-for
- **7 Module Cheat Sheets** — One-page PDF per module with key frameworks and action items
- **Certificate of Completion** — Styled PDF with student name, date, course title

---

## Website Pages to Build

| Page | Purpose |
|------|---------|
| `/login.html` | Email/password login + "forgot password" |
| `/dashboard.html` | User's tier, progress bar, module links, downloads |
| `/course/module-1/lesson-1.html` through `/course/module-7/lesson-4.html` | 33 lesson pages |
| `/prompts.html` | Browsable prompt library + PDF download |
| `/tools.html` | AI Tool Comparison Guide (web page + PDF) |
| `/certificate.html` | View/generate certificate on course completion |

**Lesson page layout:**
- Navigation sidebar (module list with completion checkmarks)
- Lesson content area (~1,000-1,500 words)
- "Mark as Complete" button at bottom
- Next/previous lesson navigation
- Progress bar at top

**Dashboard layout:**
- Welcome message with user's name and tier badge
- Overall progress bar (X of 33 lessons complete)
- Module cards showing completion percentage
- Quick links to prompt library, tool guide, cheat sheet downloads
- VIP section (if applicable): onboarding call booking, Q&A schedule

---

## Discord Community Structure

**Channels:**
- `#welcome` — Rules and getting started guide
- `#introductions` — New members introduce themselves
- `#general` — Open discussion
- `#prompt-sharing` — Share and discuss prompts
- `#wins` — Show what you've built with AI
- `#questions` — Ask for help
- `#vip-lounge` — VIP + Vanguard only (role-gated)
- `#live-sessions` — Hive + Vanguard only (session links + recordings)

**Roles:** `Student`, `VIP`, `Core`, `Hive`, `Vanguard` (mapped from Supabase tier)

---

## Welcome Email

**Triggered by:** Stripe webhook → Supabase Edge Function
**From:** aiden@mindsparkstack.com
**Subject:** "Welcome to MindSparkAI — here's your login"

**Body includes:**
- Login URL (mindsparkstack.com/login.html)
- Their email (username)
- Auto-generated temporary password
- "Start with Module 1" call to action
- Discord invite link
- Support email for questions

---

## What This Does NOT Include (Out of Scope)

- Video content (text-based lessons first; video layered in later)
- Payment plan / installment options
- Mobile app
- Live chat support
- Automated email drip sequences beyond the welcome email
- Affiliate tracking integration (exists separately)
