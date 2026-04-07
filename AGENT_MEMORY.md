# AGENT_MEMORY.md — MindSparkAI Shared Agent Memory
**Last Updated:** 2026-04-05 (Session #4 — Day 1 WAT cleanup complete) | **Managed by:** ORACLE

---

## Current State
- **MRR:** $0 (pre-revenue — Stripe verified, payments live, no traffic yet)
- **Active Subscribers:** 0
- **Total Customers:** 0
- **Stripe Balance:** $0 available / $0 pending (confirmed live pull 2026-04-05)
- **Payment Intents:** 0 (no transactions yet)
- **Top Acquisition Channel:** Not yet determined — no traffic data yet
- **Current Month vs. Plan:** On track — Month 1, Day 2 (plan projects $0 for Month 1)
- **Active Experiment:** Organic content launch + $100 paid ads
- **Critical Blocker:** None — all blockers cleared
- **Project Home:** `c:\MindSparkStack` (WAT framework — Claude Code)

## ✅ Verified Live in Stripe (April 5, 2026)
- Stripe live mode account: `acct_1THAwlR75FvuQy4y` (MindSparkLab) — identity verified ✅
- Balance: $0 available, $0 pending
- Active products: 5 (Masterclass, VIP, Core Stack, Hive Protocol, Vanguard)
- Duplicate products archived: 7 (3x Starter, 2x Pro, 2x Enterprise) ✅ 2026-04-05
- Stripe custom domain DNS: ⚠️ FAILED — needs fix (see Pending Actions)

## Products & Pricing (Live in Stripe — Clean Set)
| Product | Price | Type | Payment Link |
|---|---|---|---|
| MindSparkAI Masterclass | $97 | One-time | https://buy.stripe.com/6oU8wRbjZ46I3IyeIscV206 |
| MindSparkAI VIP Experience | $297 | One-time | https://buy.stripe.com/7sY00l9bRgTu5QGbwgcV207 |
| Core Stack License | $49/mo | Subscription | https://buy.stripe.com/fZu9AV9bR5aM92S9o8cV203 |
| The Hive Protocol | $149/mo | Subscription | https://buy.stripe.com/bJe28tewb9r2cf40RCcV204 |
| Vanguard Architect | $499/mo | Subscription | https://buy.stripe.com/00w6oJbjZeLm1AqdEocV205 |
| Starter (SaaS tier) | TBD | Subscription | prod_UGBsy37iMC8Bvq |
| Pro (SaaS tier) | TBD | Subscription | prod_UGBsLBx54WVtPl |
| Enterprise (SaaS tier) | Custom | Subscription | prod_UGBsaV3v41dBi4 |

## Business Intelligence
- **AI SaaS Market:** $71.54B, growing 38.28% CAGR — strong tailwind
- **Target audience:** Knowledge workers, developers, entrepreneurs who want to use AI productively
- **Primary products (Phase 1):** Courses ($97/$297) — low friction, proven demand
- **Website:** mindsparkstack.com (Turbify hosting — staying on Turbify long-term)
- **cPanel:** cpanel381.turbify.biz:2083 | **DNS:** dcp.turbify.com
- **Hosting decision:** Turbify confirmed (Hostinger account exists but domain NOT being moved)

## What's Working
- Website live: 7 pages (homepage, about, blog, thank-you, privacy, terms, refund)
- Stripe infrastructure clean: 5 active products, payment links embedded and functional
- Stripe identity verified — payment links fully unblocked ✅
- Daily agent loop: ORACLE runs 9AM daily
- Launch content ready: `.tmp/content_queue/content_2026-04-04.md`
- WAT framework operational: workflows/, tools/, .tmp/ all set up

## What's Not Working
- **Stripe custom domain DNS failed** → customer receipts not sending from mindsparkstack.com
- **Email:** `aiden@mindsparkstack.com` not yet activated (Turbify invite pending)
- **Website email** still shows `hello@mindsparkstack.com` → needs update to `aiden@mindsparkstack.com`
- Zero traffic/awareness — Day 2, no customers yet
- Social media automation system built (8 tools, 3 workflows) — awaiting API keys
- No email list / Web3Forms key not configured
- Website source files now local (HTML files in project root)
- 9 Python tools in `tools/` (deploy, twitter, youtube, heygen, content gen, repurpose, newsletter, zapier, alert, scheduler)

## Pending Human Actions (for Aiden)
- **[🔴 TODAY] Activate `aiden@mindsparkstack.com`** — Turbify invite in inbox, go to mail.turbify.com
- **[🔴 TODAY] Share website HTML files** — log into cpanel381.turbify.biz:2083 → File Manager → download all .html files and drop in chat
- **[🔴 TODAY] Fix Stripe DNS** — go to Stripe Dashboard → Settings → Customer emails → copy the TXT + CNAME records shown → add them in dcp.turbify.com DNS panel
- **[HIGH] Post Reddit content** — copy-paste from `.tmp/content_queue/content_2026-04-04.md` to r/productivity
- **[HIGH] Set up Reddit ads** — $70 budget, full instructions in `workflows/marketing_launch.md`
- **[HIGH] Set up Twitter/X promoted post** — $30 budget, copy in `workflows/marketing_launch.md`
- **[HIGH] Set up X/Twitter Developer App** — developer.x.com, get API keys, add to .env
- **[HIGH] Set up Google Cloud + YouTube API** — console.cloud.google.com, enable YouTube Data API v3, OAuth
- **[HIGH] Get HeyGen API Key** — app.heygen.com > Settings > API (Creator plan $24/mo)
- **[HIGH] Upgrade Zapier to Starter** — $20/mo, 20 Zaps, 750 tasks/month
- **[HIGH] Add ZAPIER_LINKEDIN_WEBHOOK to .env** — create LinkedIn Post Zap in Zapier, copy webhook URL
- **[MEDIUM] Activate Web3Forms** — get free key at web3forms.com, I'll add it to the site

## Website Pages (All Live on Turbify)
| Page | URL | Status |
|---|---|---|
| Homepage | mindsparkstack.com/ | ✅ Live |
| About | mindsparkstack.com/about.html | ✅ Live |
| Blog | mindsparkstack.com/blog.html | ✅ Live (1 article) |
| Thank-You | mindsparkstack.com/thank-you.html | ✅ Live |
| Privacy Policy | mindsparkstack.com/privacy-policy.html | ✅ Live |
| Terms | mindsparkstack.com/terms.html | ✅ Live |
| Refund Policy | mindsparkstack.com/refund-policy.html | ✅ Live |

## Email Setup
- **Active business email:** `aiden@mindsparkstack.com` (Turbify/Yahoo — invite pending activation)
- **Forwarding fallback:** hello@mindsparkstack.com → aidenbolin09@gmail.com (ForwardEmail.net)
- **Gmail connected:** aidenbolin09@gmail.com (MCP: read + draft)
- **Turbify mail server:** imap.mail.yahoo.com:993 / smtp.bizmail.yahoo.com:465

## Social Media Accounts
| Platform | Handle | Status | Posting Method |
|----------|--------|--------|----------------|
| X/Twitter | @AccuoaAgent | Active, awaiting API keys | `tools/post_to_twitter.py` (direct API) |
| YouTube | @Accuoa | Active, awaiting OAuth setup | `tools/upload_to_youtube.py` (direct API) |
| TikTok | @accuoa | Active | Manual upload (API restricted) |
| LinkedIn | aiden-bolin-90813435b | Active, awaiting Zapier webhook | `tools/trigger_zapier.py` (Zapier) |
| Email | Resend API | Connected | `tools/send_newsletter.py` |
| Blog | mindsparkstack.com/blog | Live | `tools/deploy_to_turbify.py` |
| Instagram | N/A | Not using | -- |

## Social Media Tools (Built 2026-04-07)
- `tools/post_to_twitter.py` — X API v2 posting (tweets + threads)
- `tools/upload_to_youtube.py` — YouTube Data API v3 uploads
- `tools/generate_heygen_video.py` — HeyGen AI avatar video generation
- `tools/generate_content.py` — SCRIBE content generation engine
- `tools/repurpose_content.py` — 1-to-many content atomizer
- `tools/send_newsletter.py` — Resend email newsletter
- `tools/trigger_zapier.py` — Zapier webhook bridge
- `tools/alert.py` — Error alerting via email
- `tools/content_scheduler.py` — Orchestrator (dispatches queue to platforms)

## Budget Status
- Starting budget: $100
- Allocated: $70 Reddit ads + $30 Twitter/X (not yet spent — pending Aiden setup)
- Bank floor: $500 minimum (never go below)
- Reinvestment: 100% of revenue above $500 floor goes back to ads
- Current Stripe balance: $0

## Revenue Target & Pace
- Goal: $1,000,000 cumulative
- Projected timeline: Month 17–18 (per master plan)
- Current pace: $0/day (Day 2 — on track, plan projects $0 Month 1)
- Break-even on first $100 ad spend: 2 Masterclass sales ($194)

## Content Schedule (SCRIBE — Mon–Fri)
- **Monday:** LinkedIn post (AI productivity insight)
- **Tuesday:** Twitter/X thread (AI workflow topic)
- **Wednesday:** Reddit post (value-first, subtle brand mention)
- **Thursday:** Email newsletter draft
- **Friday:** "Weekend reads" social post with 3 AI tips
- **Last generated:** content_2026-04-04.md (launch day)
- **Next:** Monday 2026-04-06 (LinkedIn post)

## Decisions Made
- Strategy: Triple Helix (SaaS + Content Flywheel + Digital Products)
- Phase 1 focus: Course sales ($97/$297) via organic + paid social
- Primary audience: Knowledge workers wanting practical AI skills
- Content pillars: AI workflows, prompting mistakes, personal AI stack, productivity wins
- Hosting: Staying on Turbify (Hostinger account exists but not being used)

## Reinforcement Learning Log
| Date | Observation | Decision |
|---|---|---|
| 2026-04-04 | Turbify cPanel doesn't have email forwarders | Used ForwardEmail.net via DNS MX+TXT — no account needed |
| 2026-04-04 | Turbify DNS editable via dcp.turbify.com (not cPanel) | Use dcp.turbify.com for all future DNS changes |
| 2026-04-04 | Post-purchase delivery page was missing | thank-you.html created and wired to Stripe |
| 2026-04-05 | Stripe identity verified | Payment links fully functional |
| 2026-04-05 | Migrated to c:\MindSparkStack WAT framework | Operating via Claude Code — tools/, workflows/, .tmp/ |
| 2026-04-05 | Found 9 duplicate Stripe products (3x Starter/Pro/Enterprise) | Archived 7 duplicates — kept 1 of each type |
| 2026-04-05 | Stripe custom email domain DNS failed verification | Aiden must add DNS records from Stripe Dashboard → Settings → Customer emails |
| 2026-04-05 | Turbify provisioned aiden@mindsparkstack.com (not hello@) | aiden@ is the canonical business email — activate and update all website references |
| 2026-04-05 | Hostinger account exists but domain not pointed there | Decision: stay on Turbify. Hostinger account dormant. |

## Purge Log
- 2026-04-05: Removed "Complete Stripe identity verification" from pending actions — done
- 2026-04-05: Removed "Clean up duplicate Stripe products" — done (7 archived)
- 2026-04-05: Removed stale ForwardEmail propagation note — 24h has passed

---
*Auto-updated by ORACLE. Next scheduled update: 2026-04-06 09:00*
