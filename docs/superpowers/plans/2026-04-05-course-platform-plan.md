# MindSparkAI Course Delivery Platform — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete course delivery platform so paying customers get everything the website promises — login, dashboard, 33 lessons, prompt library, tool guide, cheat sheets, and certificates.

**Architecture:** Static HTML/CSS/JS frontend on Turbify. Supabase for auth + database + Edge Functions. Stripe webhooks create user accounts on purchase. Client-side Supabase JS SDK handles auth guards and progress tracking. All course content is AI-generated text-based lessons.

**Tech Stack:** HTML/CSS/JS (vanilla, no framework), Supabase (auth, PostgreSQL, Edge Functions, Deno), Stripe webhooks, Resend (free tier email), Inter font, dark theme matching existing site.

**Note on innerHTML usage:** This project uses innerHTML for rendering trusted, hardcoded content (course navigation, lesson structure). All data inserted is either static strings defined in our own JS files or sanitized user profile data (names displayed via textContent). No user-generated HTML is ever rendered. This is an acceptable security posture for this static site.

**Phases:**
- Phase 1 (Tasks 1-5): Infrastructure — Supabase, webhook, shared styles/auth, login, dashboard
- Phase 2 (Tasks 6-12): Course content — All 33 lessons across 7 modules
- Phase 3 (Tasks 13-16): Bonus content — Prompt library, tool guide, cheat sheets, certificates
- Phase 4 (Task 17): Discord community setup

**File Structure:**
```
course/
  login.html                  # Login/signup page
  dashboard.html              # User dashboard with progress
  prompts.html                # Prompt library page
  tools.html                  # AI Tool Comparison Guide
  certificate.html            # Certificate generator
  cheatsheets/
    module-1.html ... module-7.html  # Print-optimized cheat sheets
  shared/
    supabase-config.js        # Supabase client init
    auth-guard.js             # Auth check, redirects to login if not logged in
    course-nav.js             # Sidebar navigation component
    progress.js               # Mark complete, fetch progress
    styles.css                # Shared course portal styles
  module-1/
    lesson-1.html ... lesson-5.html
  module-2/
    lesson-1.html ... lesson-5.html
  module-3/
    lesson-1.html ... lesson-5.html
  module-4/
    lesson-1.html ... lesson-5.html
  module-5/
    lesson-1.html ... lesson-5.html
  module-6/
    lesson-1.html ... lesson-4.html
  module-7/
    lesson-1.html ... lesson-4.html
supabase/
  schema.sql                  # Database schema (run in Supabase SQL Editor)
  functions/
    stripe-webhook/
      index.ts                # Edge Function: handles Stripe webhook + welcome email
```

---

## Phase 1: Infrastructure

### Task 1: Supabase Project Setup + Database Schema

**Files:**
- Create: `supabase/schema.sql` (reference — run via Supabase dashboard SQL editor)

- [ ] **Step 1: Create Supabase project**

Go to https://supabase.com/dashboard and create a new project:
- Project name: `mindsparkai`
- Database password: (generate and save to `.env` as `SUPABASE_DB_PASSWORD`)
- Region: US East (closest to target audience)

Save these values to `.env`:
```
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<anon-public-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

- [ ] **Step 2: Create database schema**

Create `supabase/schema.sql` with this content, then run it in the Supabase SQL Editor:

```sql
-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT DEFAULT '',
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'masterclass', 'vip', 'core', 'hive', 'vanguard')),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Progress table (tracks lesson completion)
CREATE TABLE public.progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  lesson_slug TEXT NOT NULL,
  completed BOOLEAN DEFAULT TRUE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_slug)
);

-- Subscriptions table (recurring billing status)
CREATE TABLE public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
  current_period_end TIMESTAMPTZ
);

-- Certificates table
CREATE TABLE public.certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  certificate_number TEXT UNIQUE NOT NULL
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only read/write their own data
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can read own progress" ON public.progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can read own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read own certificates" ON public.certificates
  FOR SELECT USING (auth.uid() = user_id);

-- Service role policies (for Edge Functions to create profiles on webhook)
CREATE POLICY "Service role can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can insert subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update subscriptions" ON public.subscriptions
  FOR UPDATE USING (true);

CREATE POLICY "Service role can insert certificates" ON public.certificates
  FOR INSERT WITH CHECK (true);

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

- [ ] **Step 3: Verify tables exist**

In Supabase dashboard, go to Table Editor and confirm these tables exist: `profiles`, `progress`, `subscriptions`, `certificates`.

- [ ] **Step 4: Commit**

```bash
git add supabase/schema.sql
git commit -m "feat: add Supabase database schema for course platform"
```

---

### Task 2: Stripe Webhook Edge Function

**Files:**
- Create: `supabase/functions/stripe-webhook/index.ts`

- [ ] **Step 1: Create the Edge Function**

Create `supabase/functions/stripe-webhook/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Map Stripe price IDs to tiers
const PRICE_TO_TIER: Record<string, string> = {
  "price_1TIPRfR75FvuQy4yxgvr4vnf": "masterclass",
  "price_1TIPRgR75FvuQy4yeNrs6znH": "vip",
  "price_1THF6wR75FvuQy4yaeeg0dZn": "core",
  "price_1THFRkR75FvuQy4yeAugFZKH": "hive",
  "price_1THFSuR75FvuQy4yxDMB3WoT": "vanguard",
};

// Tier hierarchy for upgrades
const TIER_RANK: Record<string, number> = {
  free: 0, core: 1, hive: 2, masterclass: 3, vip: 4, vanguard: 5,
};

async function verifyStripeSignature(
  body: string,
  signature: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const parts = signature.split(",").reduce(
    (acc: Record<string, string>, part: string) => {
      const [key, value] = part.split("=");
      acc[key] = value;
      return acc;
    },
    {}
  );

  const timestamp = parts["t"];
  const expectedSig = parts["v1"];
  const payload = `${timestamp}.${body}`;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(STRIPE_WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const computedSig = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computedSig === expectedSig;
}

function generatePassword(length = 12): string {
  const chars =
    "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => chars[b % chars.length]).join("");
}

async function sendWelcomeEmail(
  email: string,
  password: string,
  tier: string,
  name: string
) {
  const tierLabel: Record<string, string> = {
    masterclass: "Masterclass",
    vip: "VIP Experience",
    core: "Core Stack License",
    hive: "The Hive Protocol",
    vanguard: "Vanguard Architect",
  };

  const showCourse = ["masterclass", "vip", "vanguard"].includes(tier);
  const courseSection = showCourse
    ? "<h3>Your Course Awaits</h3><p>Head to your dashboard and start with <strong>Module 1: Why Most People Use AI Wrong</strong>. Most students see a difference in their very first work session.</p>"
    : "<h3>Your Membership Is Active</h3><p>Head to your dashboard to access your prompt library, tool comparison guides, and community resources.</p>";

  const tierName = tierLabel[tier] || tier;
  const greeting = name || "there";

  const html = [
    '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#1E1E2E;color:#e2e8f0;padding:40px;border-radius:12px;">',
    '<h1 style="color:#7C3AED;">Welcome to MindSparkAI!</h1>',
    `<p>Hey ${greeting},</p>`,
    `<p>You're officially in. Your <strong>${tierName}</strong> access is ready.</p>`,
    "<h3>Your Login Credentials</h3>",
    '<p><strong>Login page:</strong> <a href="https://mindsparkstack.com/course/login.html" style="color:#06B6D4;">mindsparkstack.com/course/login.html</a></p>',
    `<p><strong>Email:</strong> ${email}</p>`,
    `<p><strong>Temporary password:</strong> ${password}</p>`,
    '<p style="font-size:0.85em;color:#94a3b8;">Please change your password after your first login.</p>',
    courseSection,
    "<h3>Join the Community</h3>",
    '<p><a href="https://discord.gg/YOUR_INVITE_LINK" style="color:#06B6D4;">Join our Discord server</a> to connect with other members, share wins, and get help.</p>',
    '<hr style="border-color:rgba(255,255,255,0.1);margin:24px 0;">',
    '<p style="font-size:0.85em;color:#64748b;">Questions? Reply to this email or reach us at aiden@mindsparkstack.com</p>',
    "</div>",
  ].join("\n");

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "MindSparkAI <welcome@mindsparkstack.com>",
      to: [email],
      subject: "Welcome to MindSparkAI \u2014 here's your login",
      html,
    }),
  });
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !(await verifyStripeSignature(body, signature))) {
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(body);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const email = session.customer_details?.email;
    const name = session.customer_details?.name || "";
    const stripeCustomerId = session.customer;

    if (!email) {
      return new Response("No email in session", { status: 400 });
    }

    // Determine tier from line items or amount
    const priceId =
      session.line_items?.data?.[0]?.price?.id ||
      session.metadata?.price_id ||
      "";
    let tier = PRICE_TO_TIER[priceId] || "free";
    if (tier === "free" && session.amount_total) {
      const amount = session.amount_total;
      if (amount === 9700) tier = "masterclass";
      else if (amount === 29700) tier = "vip";
      else if (amount === 4900) tier = "core";
      else if (amount === 14900) tier = "hive";
      else if (amount === 49900) tier = "vanguard";
    }

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u: any) => u.email === email
    );

    if (existingUser) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("tier")
        .eq("id", existingUser.id)
        .single();

      const currentRank = TIER_RANK[profile?.tier || "free"] || 0;
      const newRank = TIER_RANK[tier] || 0;

      if (newRank > currentRank) {
        await supabase
          .from("profiles")
          .update({ tier, stripe_customer_id: stripeCustomerId })
          .eq("id", existingUser.id);
      }

      if (session.subscription) {
        await supabase.from("subscriptions").upsert({
          user_id: existingUser.id,
          stripe_subscription_id: session.subscription,
          status: "active",
        });
      }

      return new Response(
        JSON.stringify({ status: "upgraded", tier }),
        { status: 200 }
      );
    }

    // Create new user
    const password = generatePassword();
    const { data: newUser, error: createError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: name },
      });

    if (createError || !newUser.user) {
      console.error("Error creating user:", createError);
      return new Response("Error creating user", { status: 500 });
    }

    await supabase
      .from("profiles")
      .update({
        tier,
        stripe_customer_id: stripeCustomerId,
        full_name: name,
      })
      .eq("id", newUser.user.id);

    if (session.subscription) {
      await supabase.from("subscriptions").insert({
        user_id: newUser.user.id,
        stripe_subscription_id: session.subscription,
        status: "active",
      });
    }

    await sendWelcomeEmail(email, password, tier, name);

    return new Response(
      JSON.stringify({ status: "created", tier }),
      { status: 200 }
    );
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object;
    const status =
      subscription.status === "active"
        ? "active"
        : subscription.status === "canceled"
        ? "canceled"
        : subscription.status === "past_due"
        ? "past_due"
        : "unpaid";

    await supabase
      .from("subscriptions")
      .update({
        status,
        current_period_end: new Date(
          subscription.current_period_end * 1000
        ).toISOString(),
      })
      .eq("stripe_subscription_id", subscription.id);

    if (status === "canceled") {
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("user_id")
        .eq("stripe_subscription_id", subscription.id)
        .single();

      if (sub) {
        await supabase
          .from("profiles")
          .update({ tier: "free" })
          .eq("id", sub.user_id);
      }
    }

    return new Response(
      JSON.stringify({ status: "updated" }),
      { status: 200 }
    );
  }

  return new Response(
    JSON.stringify({ status: "ignored" }),
    { status: 200 }
  );
});
```

- [ ] **Step 2: Deploy the Edge Function**

```bash
npm install -g supabase
supabase login
supabase link --project-ref <your-project-ref>

supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
supabase secrets set RESEND_API_KEY=re_xxx
supabase secrets set SUPABASE_URL=https://xxx.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=xxx

supabase functions deploy stripe-webhook --no-verify-jwt
```

- [ ] **Step 3: Configure Stripe webhook**

In Stripe Dashboard go to Developers then Webhooks then Add endpoint:
- URL: `https://<project-ref>.supabase.co/functions/v1/stripe-webhook`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Copy the webhook signing secret and save as `STRIPE_WEBHOOK_SECRET`

- [ ] **Step 4: Sign up for Resend**

Go to https://resend.com, create free account (100 emails/day).
- Add domain `mindsparkstack.com` and verify DNS records
- Copy API key and save as `RESEND_API_KEY` in `.env` and Supabase secrets

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/stripe-webhook/index.ts
git commit -m "feat: add Stripe webhook Edge Function for user creation and welcome email"
```

---

### Task 3: Shared Course Styles + Auth Guard

**Files:**
- Create: `course/shared/styles.css`
- Create: `course/shared/supabase-config.js`
- Create: `course/shared/auth-guard.js`
- Create: `course/shared/progress.js`
- Create: `course/shared/course-nav.js`

- [ ] **Step 1: Create shared CSS**

Create `course/shared/styles.css` — full course portal stylesheet matching the existing site's dark theme with Inter font, violet (#7C3AED) and cyan (#06B6D4) accents, glass-effect cards.

Key components to style:
- `.course-layout` — CSS Grid with 280px sidebar + fluid main area, collapses to single column on mobile
- `.sidebar` — sticky, dark bg, module/lesson links with completion checkmarks
- `.main-content` — lesson content area with typography for h1-h3, p, ul, ol, blockquote, code, pre
- `.callout` variants — `.callout-tip` (cyan), `.callout-warning` (yellow), `.callout-exercise` (violet)
- `.progress-bar` + `.progress-fill` — gradient fill bar
- `.btn` variants — `.btn-primary` (gradient), `.btn-secondary` (glass), `.btn-complete` (cyan)
- `.card` + `.card-grid` — dashboard module cards
- `.tier-badge` variants — colored badges per tier
- `.auth-container` + `.auth-box` — centered login form
- `.lesson-nav` — prev/next navigation at bottom of lessons
- `.download-list` — styled list for PDF downloads
- `.mobile-menu-btn` — floating button to toggle sidebar on mobile
- Print styles for cheat sheets and certificates

See the full CSS in the spec document's Task 3. The CSS should be approximately 300 lines covering all the above components.

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

:root {
  --violet: #7C3AED;
  --cyan: #06B6D4;
  --bg: #0a0a0f;
  --bg2: #13131a;
  --bg3: #1a1a24;
  --text: #e2e8f0;
  --text-muted: #94a3b8;
  --text-dim: #64748b;
  --border: rgba(255,255,255,0.08);
  --glass: rgba(255,255,255,0.03);
  --gradient: linear-gradient(135deg, var(--violet), var(--cyan));
  --radius: 12px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.7;
  min-height: 100vh;
}
a { color: var(--violet); text-decoration: none; }
a:hover { text-decoration: underline; }

.course-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 100vh;
}
@media (max-width: 768px) {
  .course-layout { grid-template-columns: 1fr; }
  .sidebar { display: none; }
  .sidebar.open { display: block; position: fixed; inset: 0; z-index: 100; }
}

.sidebar {
  background: var(--bg2);
  border-right: 1px solid var(--border);
  padding: 24px 0;
  overflow-y: auto;
  position: sticky;
  top: 0;
  height: 100vh;
}
.sidebar-logo {
  padding: 0 20px 24px;
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--violet);
  border-bottom: 1px solid var(--border);
  margin-bottom: 16px;
}
.sidebar-module {
  padding: 8px 20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 16px;
}
.sidebar-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  color: var(--text-muted);
  font-size: 0.88rem;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}
.sidebar-link:hover {
  background: var(--glass);
  color: var(--text);
  text-decoration: none;
}
.sidebar-link.active {
  background: rgba(124,58,237,0.1);
  color: var(--violet);
  border-left-color: var(--violet);
}
.sidebar-link.completed .check { color: var(--cyan); }
.check { width: 18px; text-align: center; font-size: 0.8rem; }

.main-content {
  padding: 48px 64px;
  max-width: 900px;
}
@media (max-width: 768px) {
  .main-content { padding: 24px 16px; }
}
.main-content h1 {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 8px;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.main-content h2 {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 32px 0 16px;
  color: var(--text);
}
.main-content h3 {
  font-size: 1.15rem;
  font-weight: 600;
  margin: 24px 0 12px;
  color: #c4b5fd;
}
.main-content p { margin-bottom: 16px; color: var(--text-muted); }
.main-content ul, .main-content ol {
  margin: 0 0 16px 24px;
  color: var(--text-muted);
}
.main-content li { margin-bottom: 8px; }
.main-content strong { color: var(--text); }
.main-content blockquote {
  border-left: 3px solid var(--violet);
  padding: 16px 20px;
  background: var(--glass);
  border-radius: 0 var(--radius) var(--radius) 0;
  margin: 24px 0;
  color: var(--text-muted);
  font-style: italic;
}
.main-content code {
  background: rgba(124,58,237,0.15);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  color: #c4b5fd;
}
.main-content pre {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  overflow-x: auto;
  margin: 16px 0;
}
.main-content pre code { background: none; padding: 0; }

.callout {
  padding: 20px;
  border-radius: var(--radius);
  margin: 24px 0;
  border: 1px solid var(--border);
}
.callout-tip { background: rgba(6,182,212,0.08); border-color: rgba(6,182,212,0.3); }
.callout-warning { background: rgba(234,179,8,0.08); border-color: rgba(234,179,8,0.3); }
.callout-exercise { background: rgba(124,58,237,0.08); border-color: rgba(124,58,237,0.3); }
.callout h4 { font-size: 0.9rem; font-weight: 700; margin-bottom: 8px; }
.callout-tip h4 { color: var(--cyan); }
.callout-warning h4 { color: #eab308; }
.callout-exercise h4 { color: #c4b5fd; }

.progress-bar {
  width: 100%;
  height: 6px;
  background: var(--bg3);
  border-radius: 3px;
  overflow: hidden;
  margin: 8px 0;
}
.progress-fill {
  height: 100%;
  background: var(--gradient);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  border: none;
  transition: all 0.3s;
  text-decoration: none;
  font-family: inherit;
}
.btn:hover { text-decoration: none; transform: translateY(-1px); }
.btn-primary {
  background: var(--gradient);
  color: #fff;
  box-shadow: 0 4px 15px rgba(124,58,237,0.3);
}
.btn-secondary {
  background: var(--glass);
  color: var(--text);
  border: 1px solid var(--border);
}
.btn-complete {
  background: rgba(6,182,212,0.15);
  color: var(--cyan);
  border: 1px solid rgba(6,182,212,0.3);
}
.btn-complete.done { background: rgba(6,182,212,0.25); }

.lesson-nav {
  display: flex;
  justify-content: space-between;
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}
.lesson-nav a {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  font-weight: 500;
}
.lesson-nav a:hover { color: var(--violet); }

.card {
  background: var(--glass);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
}
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin: 24px 0;
}
.card h3 { font-size: 1rem; font-weight: 600; margin-bottom: 12px; }
.card .meta { font-size: 0.85rem; color: var(--text-dim); }

.tier-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.tier-masterclass { background: rgba(124,58,237,0.2); color: #c4b5fd; }
.tier-vip { background: rgba(234,179,8,0.2); color: #fbbf24; }
.tier-core { background: rgba(6,182,212,0.2); color: #22d3ee; }
.tier-hive { background: rgba(16,185,129,0.2); color: #34d399; }
.tier-vanguard { background: rgba(239,68,68,0.2); color: #f87171; }

.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.auth-box {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 48px;
  width: 100%;
  max-width: 420px;
}
.auth-box h1 {
  font-size: 1.8rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 8px;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.auth-box .subtitle {
  text-align: center;
  color: var(--text-muted);
  margin-bottom: 32px;
  font-size: 0.95rem;
}
.form-group { margin-bottom: 20px; }
.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 6px;
  color: var(--text-muted);
}
.form-group input {
  width: 100%;
  padding: 12px 16px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text);
  font-size: 0.95rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}
.form-group input:focus { border-color: var(--violet); }
.form-error {
  color: #f87171;
  font-size: 0.85rem;
  margin-top: 8px;
  display: none;
}
.form-error.visible { display: block; }
.auth-link {
  text-align: center;
  margin-top: 20px;
  font-size: 0.9rem;
  color: var(--text-dim);
}
.auth-link a { color: var(--violet); font-weight: 500; }

.mobile-menu-btn {
  display: none;
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--gradient);
  color: #fff;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  z-index: 101;
  box-shadow: 0 4px 15px rgba(124,58,237,0.4);
  align-items: center;
  justify-content: center;
}
@media (max-width: 768px) {
  .mobile-menu-btn { display: flex; }
}

.download-list { list-style: none; padding: 0; margin: 16px 0; }
.download-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--glass);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin-bottom: 8px;
}
.download-list a { color: var(--cyan); font-weight: 500; }

@media print {
  .sidebar, .mobile-menu-btn, .lesson-nav, .btn-complete { display: none !important; }
  .course-layout { grid-template-columns: 1fr; }
  .main-content { padding: 0; max-width: 100%; }
  body { background: #fff; color: #000; }
  .main-content h1 { background: none; -webkit-text-fill-color: #000; color: #000; }
  .main-content h2, .main-content h3 { color: #333; }
  .main-content p, .main-content li { color: #444; }
}
```

- [ ] **Step 2: Create Supabase config**

Create `course/shared/supabase-config.js`:

```javascript
// Supabase client configuration
// Replace these with your actual Supabase project values
var SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co';
var SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

// Initialize Supabase client (supabase-js loaded via CDN before this file)
var sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

Note: Every page must include this script tag before supabase-config.js:
`<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>`

- [ ] **Step 3: Create auth guard**

Create `course/shared/auth-guard.js`:

```javascript
// Auth guard - include on every protected page
// Redirects to login if not authenticated
// Exposes: currentUser, userProfile

var currentUser = null;
var userProfile = null;

async function initAuth() {
  var sessionResult = await sb.auth.getSession();
  var session = sessionResult.data.session;

  if (!session) {
    window.location.href = '/course/login.html';
    return;
  }

  currentUser = session.user;

  var profileResult = await sb
    .from('profiles')
    .select('*')
    .eq('id', currentUser.id)
    .single();

  userProfile = profileResult.data;

  // Check subscription status for recurring tiers
  if (userProfile && ['core', 'hive', 'vanguard'].indexOf(userProfile.tier) !== -1) {
    var subResult = await sb
      .from('subscriptions')
      .select('status')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subResult.data && subResult.data.status !== 'active') {
      userProfile.tier = 'free';
    }
  }

  // Fire callback if page defines onAuthReady
  if (typeof onAuthReady === 'function') {
    onAuthReady(currentUser, userProfile);
  }
}

function canAccess(requiredTiers) {
  if (!userProfile) return false;
  return requiredTiers.indexOf(userProfile.tier) !== -1;
}

function hasCourseTier() {
  return canAccess(['masterclass', 'vip', 'vanguard']);
}

function hasSubscriptionTier() {
  return canAccess(['core', 'hive', 'vanguard']);
}

async function logout() {
  await sb.auth.signOut();
  window.location.href = '/course/login.html';
}

initAuth();
```

- [ ] **Step 4: Create progress tracker**

Create `course/shared/progress.js`:

```javascript
// Progress tracking - mark lessons complete, fetch progress

var TOTAL_LESSONS = 33;

async function markComplete(lessonSlug) {
  if (!currentUser) return;

  var result = await sb
    .from('progress')
    .upsert({
      user_id: currentUser.id,
      lesson_slug: lessonSlug,
      completed: true,
      completed_at: new Date().toISOString(),
    }, { onConflict: 'user_id,lesson_slug' });

  if (!result.error) {
    var btn = document.getElementById('complete-btn');
    if (btn) {
      btn.textContent = 'Completed';
      btn.classList.add('done');
      btn.disabled = true;
    }
    // Update sidebar checkmark
    var link = document.querySelector('[data-slug="' + lessonSlug + '"]');
    if (link) {
      link.classList.add('completed');
      var check = link.querySelector('.check');
      if (check) check.textContent = '\u2713';
    }
  }
}

async function getProgress() {
  if (!currentUser) return [];

  var result = await sb
    .from('progress')
    .select('lesson_slug, completed_at')
    .eq('user_id', currentUser.id)
    .eq('completed', true);

  return result.data || [];
}

async function getProgressPercent() {
  var completed = await getProgress();
  return Math.round((completed.length / TOTAL_LESSONS) * 100);
}

async function isLessonComplete(lessonSlug) {
  var progress = await getProgress();
  return progress.some(function(p) { return p.lesson_slug === lessonSlug; });
}
```

- [ ] **Step 5: Create course navigation component**

Create `course/shared/course-nav.js`:

```javascript
// Course navigation sidebar - generates module/lesson links

var COURSE_STRUCTURE = [
  {
    title: 'Module 1: Why Most People Use AI Wrong',
    lessons: [
      { slug: 'module-1/lesson-1', title: 'The Copy-Paste Trap' },
      { slug: 'module-1/lesson-2', title: 'How AI Actually Thinks' },
      { slug: 'module-1/lesson-3', title: 'The Input-Output Principle' },
      { slug: 'module-1/lesson-4', title: 'The 3 Mistakes That Make AI Useless' },
      { slug: 'module-1/lesson-5', title: 'Your First AI Win' },
    ]
  },
  {
    title: 'Module 2: Role-Context-Constraints',
    lessons: [
      { slug: 'module-2/lesson-1', title: 'What Is RCC and Why It Works' },
      { slug: 'module-2/lesson-2', title: 'Role: Telling AI Who To Be' },
      { slug: 'module-2/lesson-3', title: 'Context: The Background AI Needs' },
      { slug: 'module-2/lesson-4', title: 'Constraints That Improve Output' },
      { slug: 'module-2/lesson-5', title: 'RCC in Practice: 5 Scenarios' },
    ]
  },
  {
    title: 'Module 3: The 5 Workflow Patterns',
    lessons: [
      { slug: 'module-3/lesson-1', title: 'The Research Synthesizer' },
      { slug: 'module-3/lesson-2', title: 'The Draft-Refine Loop' },
      { slug: 'module-3/lesson-3', title: 'The Decision Matrix Builder' },
      { slug: 'module-3/lesson-4', title: 'The Content Multiplier' },
      { slug: 'module-3/lesson-5', title: 'The Automation Chain' },
    ]
  },
  {
    title: 'Module 4: Your Personal AI Stack',
    lessons: [
      { slug: 'module-4/lesson-1', title: 'The AI Tool Landscape in 2026' },
      { slug: 'module-4/lesson-2', title: 'Choosing Your Core AI Tool' },
      { slug: 'module-4/lesson-3', title: 'Specialist Tools' },
      { slug: 'module-4/lesson-4', title: 'Building Your Daily AI Workflow' },
      { slug: 'module-4/lesson-5', title: 'The $0 Stack vs The Power Stack' },
    ]
  },
  {
    title: 'Module 5: Real Use Cases',
    lessons: [
      { slug: 'module-5/lesson-1', title: 'Emails That Write Themselves' },
      { slug: 'module-5/lesson-2', title: 'Reports and Summaries' },
      { slug: 'module-5/lesson-3', title: 'Zero to Expert in 20 Min' },
      { slug: 'module-5/lesson-4', title: 'Meeting Prep and Follow-Ups' },
      { slug: 'module-5/lesson-5', title: 'Data Analysis with AI' },
    ]
  },
  {
    title: 'Module 6: Coding & Technical Work',
    lessons: [
      { slug: 'module-6/lesson-1', title: 'AI-Assisted Coding' },
      { slug: 'module-6/lesson-2', title: 'Debugging with AI' },
      { slug: 'module-6/lesson-3', title: 'Automations Without Code' },
      { slug: 'module-6/lesson-4', title: 'Idea to Prototype in an Afternoon' },
    ]
  },
  {
    title: 'Module 7: Agents & Automation',
    lessons: [
      { slug: 'module-7/lesson-1', title: 'What Are AI Agents' },
      { slug: 'module-7/lesson-2', title: 'Your First Agent Workflow' },
      { slug: 'module-7/lesson-3', title: 'Multi-Step Automations' },
      { slug: 'module-7/lesson-4', title: 'The Future of AI' },
    ]
  },
];

async function renderSidebar(containerId, currentSlug) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var progress = await getProgress();
  var completedSlugs = {};
  progress.forEach(function(p) { completedSlugs[p.lesson_slug] = true; });

  var parts = [];
  parts.push('<div class="sidebar-logo">MindSparkAI</div>');
  parts.push('<a class="sidebar-link ' + (!currentSlug ? 'active' : '') + '" href="/course/dashboard.html">');
  parts.push('<span class="check">\u2302</span> Dashboard</a>');

  COURSE_STRUCTURE.forEach(function(mod) {
    parts.push('<div class="sidebar-module">' + mod.title + '</div>');
    mod.lessons.forEach(function(lesson) {
      var isActive = currentSlug === lesson.slug;
      var isComplete = completedSlugs[lesson.slug];
      parts.push('<a class="sidebar-link');
      if (isActive) parts.push(' active');
      if (isComplete) parts.push(' completed');
      parts.push('" href="/course/' + lesson.slug + '.html" data-slug="' + lesson.slug + '">');
      parts.push('<span class="check">' + (isComplete ? '\u2713' : '\u25CB') + '</span>');
      parts.push(lesson.title + '</a>');
    });
  });

  parts.push('<div class="sidebar-module">Resources</div>');
  parts.push('<a class="sidebar-link' + (currentSlug === 'prompts' ? ' active' : '') + '" href="/course/prompts.html">');
  parts.push('<span class="check">\uD83D\uDCCB</span> Prompt Library</a>');
  parts.push('<a class="sidebar-link' + (currentSlug === 'tools' ? ' active' : '') + '" href="/course/tools.html">');
  parts.push('<span class="check">\uD83D\uDEE0\uFE0F</span> Tool Comparison</a>');
  parts.push('<a class="sidebar-link" href="#" onclick="logout(); return false;">');
  parts.push('<span class="check">\u2192</span> Log Out</a>');

  container.innerHTML = parts.join('');
}

function getLessonNav(currentSlug) {
  var allLessons = [];
  COURSE_STRUCTURE.forEach(function(m) {
    m.lessons.forEach(function(l) { allLessons.push(l); });
  });
  var idx = -1;
  for (var i = 0; i < allLessons.length; i++) {
    if (allLessons[i].slug === currentSlug) { idx = i; break; }
  }
  var prev = idx > 0 ? allLessons[idx - 1] : null;
  var next = idx < allLessons.length - 1 ? allLessons[idx + 1] : null;

  var parts = ['<div class="lesson-nav">'];
  if (prev) {
    parts.push('<a href="/course/' + prev.slug + '.html">\u2190 ' + prev.title + '</a>');
  } else {
    parts.push('<span></span>');
  }
  if (next) {
    parts.push('<a href="/course/' + next.slug + '.html">' + next.title + ' \u2192</a>');
  } else {
    parts.push('<a href="/course/dashboard.html">Back to Dashboard \u2192</a>');
  }
  parts.push('</div>');
  return parts.join('');
}
```

- [ ] **Step 6: Commit**

```bash
git add course/shared/
git commit -m "feat: add shared course portal styles, auth guard, progress tracker, and navigation"
```

---

### Task 4: Login Page

**Files:**
- Create: `course/login.html`

- [ ] **Step 1: Create the login page**

Create `course/login.html` with a centered auth form supporting:
- Sign in (email + password)
- Sign up (name + email + password) — toggled via link
- Forgot password (sends reset email via Supabase)
- Password reset flow (when redirected back with `?reset=1`)
- Auto-redirect to dashboard if already logged in

The page uses the `.auth-container` and `.auth-box` styles from the shared CSS. All form interactions use the Supabase JS SDK (`sb.auth.signInWithPassword`, `sb.auth.signUp`, `sb.auth.resetPasswordForEmail`, `sb.auth.updateUser`).

Include these scripts in order:
1. `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>`
2. `<script src="/course/shared/supabase-config.js"></script>`

Full HTML is approximately 120 lines. See the login page code in the spec's Task 4.

- [ ] **Step 2: Commit**

```bash
git add course/login.html
git commit -m "feat: add login page with sign in, sign up, and password reset"
```

---

### Task 5: Dashboard Page

**Files:**
- Create: `course/dashboard.html`

- [ ] **Step 1: Create the dashboard page**

Create `course/dashboard.html` with:
- Sidebar navigation (via `renderSidebar`)
- Welcome message with user's name and tier badge
- Overall progress bar (X of 33 lessons complete)
- Module cards grid showing per-module completion percentage with Start/Continue/Review buttons
- Resources section (Prompt Library, Tool Comparison Guide, Cheat Sheets links)
- VIP section (visible for vip/vanguard tiers): onboarding call booking, Q&A schedule, priority support
- Community section with Discord invite link
- Certificate section (visible when all 33 lessons complete)
- Mobile menu toggle button

The page uses the `onAuthReady(user, profile)` callback pattern from auth-guard.js. All tier-gating is done by checking `profile.tier` and showing/hiding sections.

Include these scripts in order:
1. `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>`
2. `<script src="/course/shared/supabase-config.js"></script>`
3. `<script src="/course/shared/auth-guard.js"></script>`
4. `<script src="/course/shared/progress.js"></script>`
5. `<script src="/course/shared/course-nav.js"></script>`

Full HTML is approximately 150 lines. See the dashboard code in the spec's Task 5.

- [ ] **Step 2: Commit**

```bash
git add course/dashboard.html
git commit -m "feat: add dashboard with progress tracking, tier-gated sections, and module cards"
```

---

## Phase 2: Course Content (33 Lessons)

### Lesson Page Template

Every lesson file uses this structure. Replace the uppercase placeholders per lesson.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LESSON_TITLE - MindSparkAI</title>
  <meta name="robots" content="noindex, nofollow">
  <link rel="stylesheet" href="/course/shared/styles.css">
</head>
<body>
  <div class="course-layout">
    <nav class="sidebar" id="sidebar"></nav>
    <main class="main-content">
      <p style="font-size:0.85rem;color:var(--text-dim);margin-bottom:4px">MODULE_LABEL</p>
      <h1>LESSON_TITLE</h1>

      <!-- 1000-1500 WORDS OF LESSON CONTENT HERE -->
      <!-- Use: h2, h3, p, ul, ol, blockquote, code, pre -->
      <!-- Use: div.callout.callout-tip, div.callout.callout-exercise, div.callout.callout-warning -->
      <!-- Each lesson ends with a practical exercise in a callout-exercise box -->

      <div style="margin-top:40px">
        <button class="btn btn-complete" id="complete-btn" onclick="markComplete('LESSON_SLUG')">
          Mark as Complete
        </button>
      </div>

      <div id="lesson-nav"></div>
    </main>
  </div>

  <button class="mobile-menu-btn" onclick="document.getElementById('sidebar').classList.toggle('open')">=</button>

  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="/course/shared/supabase-config.js"></script>
  <script src="/course/shared/auth-guard.js"></script>
  <script src="/course/shared/progress.js"></script>
  <script src="/course/shared/course-nav.js"></script>
  <script>
    var LESSON_SLUG = 'LESSON_SLUG_VALUE';

    async function onAuthReady(user, profile) {
      if (['masterclass', 'vip', 'vanguard'].indexOf(profile.tier) === -1) {
        window.location.href = '/course/dashboard.html';
        return;
      }
      await renderSidebar('sidebar', LESSON_SLUG);
      document.getElementById('lesson-nav').innerHTML = getLessonNav(LESSON_SLUG);
      var complete = await isLessonComplete(LESSON_SLUG);
      if (complete) {
        var btn = document.getElementById('complete-btn');
        btn.textContent = 'Completed';
        btn.classList.add('done');
        btn.disabled = true;
      }
    }
  </script>
</body>
</html>
```

---

### Task 6: Module 1 - Why Most People Use AI Wrong (5 lessons)

**Files:**
- Create: `course/module-1/lesson-1.html`
- Create: `course/module-1/lesson-2.html`
- Create: `course/module-1/lesson-3.html`
- Create: `course/module-1/lesson-4.html`
- Create: `course/module-1/lesson-5.html`

- [ ] **Step 1: Create lesson 1 - The Copy-Paste Trap: Why Asking AI Like Google Fails**

Use the lesson template. LESSON_SLUG: `module-1/lesson-1`. Content (~1,200 words):
- Most people treat AI like a search engine: type a question, get an answer
- Why this fails: AI generates responses based on patterns, not retrieval of facts
- The difference between "searching for information" and "directing a reasoning engine"
- Real example: asking "What's the best project management tool?" vs giving AI context about your team size, workflow, budget, and having it reason through options
- The mindset shift: from consumer to director
- Exercise: Take something you Googled this week and re-ask it to AI with context about WHY you need the answer and WHAT you will do with it. Compare the results.

- [ ] **Step 2: Create lesson 2 - How AI Actually Thinks**

LESSON_SLUG: `module-1/lesson-2`. Content (~1,200 words):
- The "next token prediction" mental model explained without jargon
- Why AI is confident even when wrong (it is always generating the most likely next word)
- What AI is good at: pattern matching, synthesis, transformation, drafting
- What AI is bad at: math, real-time facts, being consistent across conversations
- The "smart intern" analogy: brilliant, fast, eager to please, but has no judgment unless you provide it
- Exercise: Ask AI something you know the answer to in your field. Evaluate where it is right and wrong.

- [ ] **Step 3: Create lesson 3 - The Input-Output Principle**

LESSON_SLUG: `module-1/lesson-3`. Content (~1,200 words):
- The number one rule: the quality of what you get out is directly proportional to what you put in
- Demonstration: the same task with a vague prompt vs a detailed prompt (side by side)
- The 5 components of a good input: task, context, format, tone, constraints
- Why "write me a blog post" produces garbage and "write a 500-word blog post for [audience] about [topic] in [tone] covering [points]" produces gold
- Exercise: Take an AI output you were disappointed with. Rewrite the prompt using the 5 components.

- [ ] **Step 4: Create lesson 4 - The 3 Mistakes That Make AI Useless**

LESSON_SLUG: `module-1/lesson-4`. Content (~1,200 words):
- Mistake 1: One-shot prompting (asking once and accepting the first result)
- Mistake 2: No context (AI does not know your situation, role, or goals)
- Mistake 3: Wrong tool for the job (using ChatGPT for real-time data, using AI for simple lookups)
- For each mistake: what it looks like, why people do it, and the fix
- The iteration mindset: AI conversations are dialogues, not transactions

- [ ] **Step 5: Create lesson 5 - Your First AI Win: A 10-Minute Exercise**

LESSON_SLUG: `module-1/lesson-5`. Content (~1,200 words):
- A guided 10-minute exercise the student does right now
- Step 1: Pick one task you do regularly that takes 30+ minutes
- Step 2: Write out exactly what that task involves (inputs, output, who reads it, what tone)
- Step 3: Craft an AI prompt using everything from this module
- Step 4: Run it and compare to your usual output
- Step 5: Iterate once and tell the AI what to fix
- Expected result: something 80% as good in 10% of the time

- [ ] **Step 6: Commit**

```bash
git add course/module-1/
git commit -m "feat: add Module 1 - Why Most People Use AI Wrong (5 lessons)"
```

---

### Task 7: Module 2 - The Role-Context-Constraints Framework (5 lessons)

**Files:**
- Create: `course/module-2/lesson-1.html` through `course/module-2/lesson-5.html`

- [ ] **Step 1: Create lesson 1 - What Is RCC and Why It Works**

LESSON_SLUG: `module-2/lesson-1`. Content (~1,200 words):
- The RCC Framework: Role + Context + Constraints = consistently great AI output
- Why frameworks matter: removes guesswork, makes results repeatable
- Quick demo: same task without RCC vs with RCC (dramatic quality difference)
- When to use RCC: anything more complex than a simple lookup

- [ ] **Step 2: Create lesson 2 - Role: Telling AI Who To Be**

LESSON_SLUG: `module-2/lesson-2`. Content (~1,200 words):
- Why role matters: it sets the lens AI uses to approach the problem
- The difference between "help me write an email" and providing a specific role
- 10 powerful roles with examples: editor, strategist, analyst, coach, copywriter, developer, researcher, teacher, critic, advisor
- Exercise: Write 3 roles relevant to your work

- [ ] **Step 3: Create lesson 3 - Context: Giving AI the Background It Needs**

LESSON_SLUG: `module-2/lesson-3`. Content (~1,200 words):
- AI has zero context about you unless you provide it
- The 4 types of context: situational, audience, historical, constraints
- Template for providing context efficiently
- Exercise: Create a "context template" for your most common AI task

- [ ] **Step 4: Create lesson 4 - Constraints: Setting Boundaries That Improve Output**

LESSON_SLUG: `module-2/lesson-4`. Content (~1,200 words):
- Counterintuitive truth: constraints make AI output better, not worse
- Types: length, format, tone, inclusions, exclusions, structure
- The "NOT" technique: telling AI what to avoid
- Exercise: Take a prompt and add 3 constraints. Compare output quality.

- [ ] **Step 5: Create lesson 5 - RCC in Practice Across 5 Scenarios**

LESSON_SLUG: `module-2/lesson-5`. Content (~1,200 words):
- Full RCC prompts for: weekly team update, job interview prep, project plan, customer feedback analysis, LinkedIn post
- Each shows the full prompt and explains why each component matters
- Exercise: Build a complete RCC prompt for something you need to do this week

- [ ] **Step 6: Commit**

```bash
git add course/module-2/
git commit -m "feat: add Module 2 - The Role-Context-Constraints Framework (5 lessons)"
```

---

### Task 8: Module 3 - The 5 Workflow Patterns (5 lessons)

**Files:**
- Create: `course/module-3/lesson-1.html` through `course/module-3/lesson-5.html`

Each lesson covers one workflow pattern with: what it is, when to use it, step-by-step walkthrough, exact prompts, common pitfalls, and an exercise.

- [ ] **Step 1: Lesson 1 - The Research Synthesizer** (SLUG: `module-3/lesson-1`)

Turn AI into a research assistant. Feed multiple sources/perspectives, synthesize into a brief. Use case: market research, competitive analysis, learning a new topic.

- [ ] **Step 2: Lesson 2 - The Draft-Refine Loop** (SLUG: `module-3/lesson-2`)

Never accept the first draft. Prompt, review, give specific feedback, get improved draft. The key is specific feedback. Use case: any writing task.

- [ ] **Step 3: Lesson 3 - The Decision Matrix Builder** (SLUG: `module-3/lesson-3`)

Give AI your options, criteria, and constraints. Have it build a weighted comparison. Then challenge its reasoning. Use case: vendor selection, tool evaluation.

- [ ] **Step 4: Lesson 4 - The Content Multiplier** (SLUG: `module-3/lesson-4`)

One piece of content transformed into many formats. Blog post to Twitter thread to LinkedIn post to email newsletter. Use case: content marketing.

- [ ] **Step 5: Lesson 5 - The Automation Chain** (SLUG: `module-3/lesson-5`)

String multiple AI steps where output becomes input. Meeting notes to summary to action items to follow-up emails. Use case: repetitive multi-step workflows.

- [ ] **Step 6: Commit**

```bash
git add course/module-3/
git commit -m "feat: add Module 3 - The 5 Workflow Patterns (5 lessons)"
```

---

### Task 9: Module 4 - Building Your Personal AI Stack (5 lessons)

**Files:**
- Create: `course/module-4/lesson-1.html` through `course/module-4/lesson-5.html`

- [ ] **Step 1: Lesson 1 - The AI Tool Landscape in 2026** (SLUG: `module-4/lesson-1`)

Overview of major AI tools by category. What actually matters when choosing.

- [ ] **Step 2: Lesson 2 - Choosing Your Core AI Tool** (SLUG: `module-4/lesson-2`)

ChatGPT vs Claude vs Gemini and others. Strengths, weaknesses, decision framework.

- [ ] **Step 3: Lesson 3 - Specialist Tools** (SLUG: `module-4/lesson-3`)

Writing, image, code, research specialist tools. When a specialist beats a generalist.

- [ ] **Step 4: Lesson 4 - Building Your Daily AI Workflow** (SLUG: `module-4/lesson-4`)

Morning routine, work sessions, end of day. Making AI habitual.

- [ ] **Step 5: Lesson 5 - The $0 Stack vs The Power Stack** (SLUG: `module-4/lesson-5`)

Free tools only vs paid tools. ROI calculation. Recommended stacks at each price point.

- [ ] **Step 6: Commit**

```bash
git add course/module-4/
git commit -m "feat: add Module 4 - Building Your Personal AI Stack (5 lessons)"
```

---

### Task 10: Module 5 - Real Use Cases (5 lessons)

**Files:**
- Create: `course/module-5/lesson-1.html` through `course/module-5/lesson-5.html`

Each lesson is a hands-on walkthrough with exact prompts students can copy and use immediately.

- [ ] **Step 1: Lesson 1 - Emails That Write Themselves** (SLUG: `module-5/lesson-1`)

3-step email workflow. Templates for cold outreach, follow-ups, difficult conversations. The "sound like me" technique.

- [ ] **Step 2: Lesson 2 - Reports and Summaries** (SLUG: `module-5/lesson-2`)

Raw data/notes to polished reports. Structured summary prompt. Weekly report automation.

- [ ] **Step 3: Lesson 3 - Research: Zero to Expert in 20 Minutes** (SLUG: `module-5/lesson-3`)

5-prompt research framework. How to verify AI research claims.

- [ ] **Step 4: Lesson 4 - Meeting Prep, Notes, and Follow-Ups** (SLUG: `module-5/lesson-4`)

Pre-meeting research, real-time structuring, post-meeting action items and emails.

- [ ] **Step 5: Lesson 5 - Data Analysis and Spreadsheets** (SLUG: `module-5/lesson-5`)

AI for CSV/spreadsheet analysis. Generating formulas. Finding patterns. The "explain this data" prompt.

- [ ] **Step 6: Commit**

```bash
git add course/module-5/
git commit -m "feat: add Module 5 - Real Use Cases (5 lessons)"
```

---

### Task 11: Module 6 - Coding and Technical Work (4 lessons)

**Files:**
- Create: `course/module-6/lesson-1.html` through `course/module-6/lesson-4.html`

- [ ] **Step 1: Lesson 1 - AI-Assisted Coding** (SLUG: `module-6/lesson-1`)

How to use Copilot/Cursor/Claude Code. Comment-first approach. When to trust AI code.

- [ ] **Step 2: Lesson 2 - Debugging with AI** (SLUG: `module-6/lesson-2`)

Debugging prompt template. Using AI to explain unfamiliar code. Rubber duck debugging.

- [ ] **Step 3: Lesson 3 - Building Automations Without Being a Developer** (SLUG: `module-6/lesson-3`)

No-code automation with AI. Zapier/Make workflows. Google Sheets scripts. Simple Python scripts.

- [ ] **Step 4: Lesson 4 - From Idea to Prototype in One Afternoon** (SLUG: `module-6/lesson-4`)

Rapid prototyping workflow. AI-generated HTML/CSS/JS. Free deployment. Real example.

- [ ] **Step 5: Commit**

```bash
git add course/module-6/
git commit -m "feat: add Module 6 - Coding and Technical Work with AI (4 lessons)"
```

---

### Task 12: Module 7 - Advanced Automation and Agent Workflows (4 lessons)

**Files:**
- Create: `course/module-7/lesson-1.html` through `course/module-7/lesson-4.html`

- [ ] **Step 1: Lesson 1 - What Are AI Agents and Why Should You Care** (SLUG: `module-7/lesson-1`)

Difference between AI tools and AI agents. Real-world examples. Why this changes knowledge work.

- [ ] **Step 2: Lesson 2 - Building Your First Agent Workflow** (SLUG: `module-7/lesson-2`)

Step-by-step guide. Tools: Claude Code, custom GPTs, open-source. Example: inbox monitoring agent.

- [ ] **Step 3: Lesson 3 - Multi-Step Automations** (SLUG: `module-7/lesson-3`)

Chaining AI with real tools. The orchestration pattern. Error handling. Client onboarding example.

- [ ] **Step 4: Lesson 4 - The Future: Where This Is All Going** (SLUG: `module-7/lesson-4`)

AI capabilities trajectory. Skills that become more valuable. How to stay ahead. Final motivation.

- [ ] **Step 5: Commit**

```bash
git add course/module-7/
git commit -m "feat: add Module 7 - Advanced Automation and Agent Workflows (4 lessons)"
```

---

## Phase 3: Bonus Content

### Task 13: Prompt Library Page

**Files:**
- Create: `course/prompts.html`

- [ ] **Step 1: Create the prompt library page**

Create `course/prompts.html` with auth guard (accessible to ALL paid tiers). Include sidebar navigation. Organize 50+ prompts into these categories:
- Email (8 prompts): cold outreach, follow-up, difficult conversation, status update, introduction, thank you, apology, request
- Writing (8 prompts): blog post, social media, presentation outline, report, proposal, job description, bio, case study
- Research (7 prompts): topic overview, competitive analysis, market research, literature review, trend analysis, SWOT, fact-check
- Coding (7 prompts): code review, debugging, refactoring, documentation, API design, testing, explanation
- Analysis (7 prompts): data summary, survey results, financial analysis, customer feedback, risk assessment, process improvement, KPI dashboard
- Creative (6 prompts): brainstorm, name generator, tagline creator, story outline, metaphor generator, problem reframing
- Productivity (7 prompts): meeting agenda, daily planning, decision matrix, project plan, delegation brief, review prep, goal setting

Each prompt shows: title, category tag, the full prompt text in a code block with a copy button, and usage notes. Include category filter buttons at the top.

- [ ] **Step 2: Commit**

```bash
git add course/prompts.html
git commit -m "feat: add prompt library page with 50+ categorized prompts"
```

---

### Task 14: AI Tool Comparison Guide Page

**Files:**
- Create: `course/tools.html`

- [ ] **Step 1: Create the tool comparison page**

Create `course/tools.html` with auth guard (all paid tiers). Include sidebar. Compare 15+ AI tools:

General Purpose: ChatGPT, Claude, Gemini, Perplexity
Writing: Jasper, Copy.ai, Grammarly, Writesonic
Image: Midjourney, DALL-E 3, Flux, Ideogram
Code: GitHub Copilot, Cursor, Claude Code
Automation: Zapier AI, Make, n8n

For each tool: name, category, pricing, best for, rating (1-5 stars), key strengths, key weaknesses. Add recommendation badges: "Best Free Option", "Best Value", "Most Powerful", "Easiest to Learn".

- [ ] **Step 2: Commit**

```bash
git add course/tools.html
git commit -m "feat: add AI tool comparison guide with 15+ tools"
```

---

### Task 15: Module Cheat Sheets

**Files:**
- Create: `course/cheatsheets/module-1.html` through `course/cheatsheets/module-7.html`

- [ ] **Step 1: Create 7 cheat sheets**

Each cheat sheet is a print-optimized HTML page. Content per sheet:
- Module title and one-line summary
- 3-5 key takeaways as bold statements
- The core framework/template from the module (visual, structured)
- Quick-reference action checklist (5-7 items)
- One copy-paste prompt that encapsulates the module

Style for printing: white background, dark text, clean layout, fits on one printed page. Uses `@media print` styles.

Auth guard: course tiers only (masterclass, vip, vanguard).

- [ ] **Step 2: Commit**

```bash
git add course/cheatsheets/
git commit -m "feat: add 7 module cheat sheets as print-optimized HTML"
```

---

### Task 16: Certificate Generator

**Files:**
- Create: `course/certificate.html`

- [ ] **Step 1: Create certificate page**

Create `course/certificate.html` with auth guard (course tiers only). Logic:
- Fetch progress. If less than 33 lessons complete: show progress and list remaining lessons
- If all 33 complete: check if certificate exists in DB. If not, create one with a unique certificate number (format: `MSA-2026-XXXXX` where X is random alphanumeric)
- Display styled certificate with: heading "Certificate of Completion", student full name, "MindSparkAI Masterclass", completion date, certificate number, MindSparkAI branding
- Print button that triggers `window.print()`
- Print-optimized styles: white background, centered, elegant typography

- [ ] **Step 2: Commit**

```bash
git add course/certificate.html
git commit -m "feat: add certificate of completion generator"
```

---

## Phase 4: Community

### Task 17: Discord Server Setup + Link Integration

- [ ] **Step 1: Create Discord server**

Create a new Discord server named "MindSparkAI Community". Set server icon and description.

- [ ] **Step 2: Create channels**

- `#welcome` (read-only): Rules, getting started guide, course links
- `#introductions`: New members introduce themselves
- `#general`: Open discussion
- `#prompt-sharing`: Share and discuss AI prompts
- `#wins`: Share accomplishments
- `#questions`: Ask for help
- `#vip-lounge`: VIP + Vanguard only (role-gated)
- `#live-sessions`: Hive + Vanguard only (role-gated)

- [ ] **Step 3: Create roles**

`Student`, `VIP`, `Core Member`, `Hive Member`, `Vanguard`. Set channel permissions for role-gated channels.

- [ ] **Step 4: Write welcome message**

Post in `#welcome`: server rules, how to get started, where to get help, course portal link.

- [ ] **Step 5: Generate permanent invite link and update code**

Replace `YOUR_INVITE_LINK` in `course/dashboard.html` and `supabase/functions/stripe-webhook/index.ts`.

- [ ] **Step 6: Commit**

```bash
git add course/dashboard.html supabase/functions/stripe-webhook/index.ts
git commit -m "feat: add Discord invite links to dashboard and welcome email"
```

---

## Post-Launch Checklist

- [ ] Verify end-to-end: test Stripe checkout, webhook, user creation, welcome email, login, dashboard, lessons, progress, certificate
- [ ] Update `thankyou-source.html` to show login instructions
- [ ] Add Resend DNS records to mindsparkstack.com domain
- [ ] Replace `YOUR_PROJECT_REF` and `YOUR_ANON_KEY` in `supabase-config.js` with actual values
