# Changelog — Execution Trail

All tool modifications, workflow updates, and major system actions are logged here in reverse-chronological order.

---

## 2026-04-08

- **Reduced pricing** for launch strategy — Masterclass $97→$27, VIP $297→$97
  - Created new Stripe prices (`price_1TJnYpR75FvuQy4yaeSkHb6f` @ $27, `price_1TJnYpR75FvuQy4ygaiOV0zI` @ $97)
  - Created new Stripe payment links (`plink_1TJnYtR75FvuQy4yHdAvLBDi` Masterclass, `plink_1TJnYuR75FvuQy4yg122ds5B` VIP)
  - Updated all price references in homepage (buttons, pricing cards, meta tags, JSON-LD, CTA, countdown text)
- **Fixed footer 404s** — copied source pages to expected filenames:
  - `blog-source.html` → `blog.html`, `affiliates-source.html` → `affiliates.html`, `contact-source.html` → `contact.html`
  - `privacy-source.html` → `privacy-policy.html`, `terms-source.html` → `terms.html`, `refund-source.html` → `refund-policy.html`
  - Changed "About" footer link to `/contact.html` (no about page exists)
- **Synced** `index.html` with updated `homepage-source.html`

## 2026-04-07

- **Deployed** full site to Turbify (mindsparkstack.com) via FTP:
  - Redesigned homepage (`index.html`) — live at https://mindsparkstack.com/
  - 11 static pages (blog, contact, affiliates, privacy, terms, refund, thank-you, footer)
  - Complete course platform (52 files): 33 lessons across 7 modules, dashboard, login, certificate, cheatsheets, shared assets
  - Created `deploy@mindsparkstack.com` FTP account via cPanel for automated deployments
  - Fixed FTP_ROOT config for chrooted deploy account (changed from `public_html` to empty)
  - Verified: homepage renders correctly, course login page loads, all assets served via CDN
- **Built** full autonomous social media posting system (8 new Python tools):
  - `tools/post_to_twitter.py` — X API v2 posting (tweets + threads, OAuth 1.0a, dry-run)
  - `tools/upload_to_youtube.py` — YouTube Data API v3 uploads (long-form + Shorts, OAuth2, quota tracking)
  - `tools/generate_heygen_video.py` — HeyGen AI avatar video generation (9:16 + 16:9, polling, download)
  - `tools/generate_content.py` — SCRIBE agent content engine (Claude API or template fallback, 6 platforms)
  - `tools/repurpose_content.py` — 1-to-many content atomizer (long-form → tweets, LinkedIn, TikTok, email)
  - `tools/send_newsletter.py` — Email newsletter via Resend (Supabase subscriber list integration)
  - `tools/trigger_zapier.py` — Generic Zapier webhook bridge (3x retry, JSON payloads)
  - `tools/alert.py` — Error alerting via Resend + docs/ERROR_LOG.md logging
  - `tools/content_scheduler.py` — Orchestrator (reads queue, dispatches to tools/Zapier, archives posted)
- **Created** 3 new workflow SOPs:
  - `workflows/social_media_posting.md` — Master SOP for all platforms, schedules, approval rules
  - `workflows/video_production.md` — HeyGen → YouTube → repurpose pipeline
  - `workflows/content_calendar.md` — Weekly template, monthly targets, content pillars
- **Created** content queue directory structure in `.tmp/content_queue/` (tweets, linkedin, youtube, tiktok, blog, email, scripts)
- **Updated** `AGENT_MEMORY.md` with social media accounts, tools inventory, and API setup tasks
- All tools verified with `--dry-run` (exit code 0)
- **Pending:** Aiden to create X Developer App, YouTube OAuth, HeyGen API key, upgrade Zapier

## 2026-04-06

- **Enhanced** certificate system with verifiable certificate numbers + public share links:
  - `course/certificate.html`: generates unique `MSA-YYYY-XXXXX` certificate number, persists to DB on first view, adds "Copy Share Link" button
  - `course/verify.html` (NEW): public verification page — anyone can verify a certificate by ID without logging in
  - `supabase/schema.sql`: added `recipient_name` and `recipient_email` columns to certificates table, consolidated RLS policy for public reads
- **Fixed** welcome email login link (`/login` → `/course/login.html`) in `supabase/functions/stripe-webhook/index.ts`
- **Added** "Student Login" link to main site navigation (desktop nav, mobile menu, footer) in `homepage-source.html`
- **Created** deployment plan for course platform go-live (Phase 1-5 in `plans/unified-bubbling-tome.md`)
- **Completed** full 33-lesson course curriculum — all 7 modules now have complete content:
  - Module 1: Added lesson-1 "The Copy-Paste Trap" (course intro) and lesson-5 "Your First AI Win" (hands-on capstone)
  - Module 2: Rewrote lesson-1 "What Is RCC and Why It Works" (was placeholder), added lesson-5 "RCC in Practice: 5 Scenarios"
  - Module 3: Added lesson-3 "The Decision Matrix Builder", lesson-4 "The Content Multiplier", lesson-5 "The Automation Chain"
  - Module 5: Added lesson-4 "Meeting Prep and Follow-Ups", lesson-5 "Data Analysis with AI"
  - Module 6: Added lesson-4 "Idea to Prototype in an Afternoon"
  - Module 7: Created entire module — lesson-1 "What Are AI Agents", lesson-2 "Your First Agent Workflow", lesson-3 "Multi-Step Automations", lesson-4 "The Future of AI"
- **Cleaned up** junk files: removed test.txt, gen_lessons.py, test.html from course module directories
- **Verified** all 33 lesson slugs match course-nav.js COURSE_STRUCTURE definitions
- **Status**: Course is 100% content-complete and ready for customer delivery

---

## 2026-04-05

- **Created** course delivery system: dashboard, login, certificate, 33 lesson pages (in progress), prompt library, tool comparison guide, 7 cheat sheets
- **Created** Supabase schema (`supabase/schema.sql`) — profiles, progress, subscriptions, certificates tables with RLS
- **Created** Stripe webhook Edge Function (`supabase/functions/stripe-webhook/index.ts`) — handles checkout.session.completed, creates user + sends welcome email via Resend
- **Created** shared course assets: styles.css, supabase-config.js, auth-guard.js, progress.js, course-nav.js
- **Created** course design spec (`docs/superpowers/specs/2026-04-05-course-delivery-system-design.md`)
- **Created** course implementation plan (`docs/superpowers/plans/2026-04-05-course-platform-plan.md`)
