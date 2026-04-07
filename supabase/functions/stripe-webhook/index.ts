import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PRICE_TO_TIER: Record<string, string> = {
  price_1TIPRfR75FvuQy4yxgvr4vnf: "masterclass",
  price_1TIPRgR75FvuQy4yeNrs6znH: "vip",
  price_1THF6wR75FvuQy4yaeeg0dZn: "core",
  price_1THFRkR75FvuQy4yeAugFZKH: "hive",
  price_1THFSuR75FvuQy4yxDMB3WoT: "vanguard",
};

const AMOUNT_TO_TIER: Record<number, string> = {
  9700: "masterclass",
  29700: "vip",
  4900: "core",
  14900: "hive",
  49900: "vanguard",
};

const TIER_RANK: Record<string, number> = {
  free: 0,
  core: 1,
  hive: 2,
  masterclass: 3,
  vip: 4,
  vanguard: 5,
};

// Recurring tiers — these create a subscriptions row
const RECURRING_TIERS = new Set(["core", "hive", "vanguard"]);

// Safe charset: no ambiguous chars (0/O, 1/l/I)
const PASSWORD_CHARSET =
  "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$%^&*";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generatePassword(length = 12): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => PASSWORD_CHARSET[b % PASSWORD_CHARSET.length])
    .join("");
}

function tierFromSession(session: {
  line_items?: { data?: Array<{ price?: { id?: string } }> };
  amount_total?: number | null;
}): string {
  // Try price ID from line items first
  const priceId = session.line_items?.data?.[0]?.price?.id;
  if (priceId && PRICE_TO_TIER[priceId]) {
    return PRICE_TO_TIER[priceId];
  }
  // Fallback: amount_total
  if (session.amount_total != null && AMOUNT_TO_TIER[session.amount_total]) {
    return AMOUNT_TO_TIER[session.amount_total];
  }
  return "free";
}

// ---------------------------------------------------------------------------
// Stripe signature verification (HMAC-SHA256)
// ---------------------------------------------------------------------------

async function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string
): Promise<boolean> {
  // sigHeader format: t=<timestamp>,v1=<sig>[,v1=<sig>...]
  const parts = sigHeader.split(",");
  const tPart = parts.find((p) => p.startsWith("t="));
  const v1Parts = parts.filter((p) => p.startsWith("v1="));

  if (!tPart || v1Parts.length === 0) return false;

  const timestamp = tPart.slice(2);
  const signedPayload = `${timestamp}.${payload}`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedPayload)
  );

  const computedHex = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Constant-time comparison against all v1 signatures provided
  return v1Parts.some((v1) => v1.slice(3) === computedHex);
}

// ---------------------------------------------------------------------------
// Email sender via Resend
// ---------------------------------------------------------------------------

async function sendWelcomeEmail(opts: {
  to: string;
  fullName: string;
  password: string;
  tier: string;
  resendApiKey: string;
}): Promise<void> {
  const { to, fullName, password, tier, resendApiKey } = opts;
  const firstName = fullName.split(" ")[0] || fullName;

  const isOneTime = ["masterclass", "vip"].includes(tier);
  const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);

  const accessLine = isOneTime
    ? `Your <strong style="color:#7C3AED">${tierLabel}</strong> course access is now active.`
    : `Your <strong style="color:#7C3AED">${tierLabel}</strong> membership is now active.`;

  const accessDescription = isOneTime
    ? "Log in to access your course materials, lessons, and resources."
    : "Log in to access your membership portal, community, and exclusive resources.";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to MindSparkAI</title>
</head>
<body style="margin:0;padding:0;background-color:#1E1E2E;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1E1E2E;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#2A2A3E;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#7C3AED 0%,#06B6D4 100%);padding:40px 40px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">MindSparkAI</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">Ignite your potential</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#7C3AED;font-size:22px;font-weight:600;">
                Welcome aboard, ${firstName}!
              </h2>
              <p style="margin:0 0 24px;color:#e2e8f0;font-size:16px;line-height:1.6;">
                ${accessLine}
              </p>
              <p style="margin:0 0 32px;color:#94a3b8;font-size:15px;line-height:1.6;">
                ${accessDescription}
              </p>

              <!-- Credentials box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1E1E2E;border-radius:8px;border:1px solid #3f3f5a;margin-bottom:32px;">
                <tr>
                  <td style="padding:24px;">
                    <p style="margin:0 0 6px;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">Your Login Credentials</p>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #2d2d45;">
                          <span style="color:#64748b;font-size:13px;">Email</span>
                          <span style="float:right;color:#e2e8f0;font-size:14px;font-weight:500;">${to}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;">
                          <span style="color:#64748b;font-size:13px;">Password</span>
                          <span style="float:right;color:#06B6D4;font-size:14px;font-weight:600;font-family:monospace;">${password}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center">
                    <a href="https://mindsparkstack.com/course/login.html"
                       style="display:inline-block;background:linear-gradient(135deg,#7C3AED,#06B6D4);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:16px;font-weight:600;letter-spacing:0.3px;">
                      Log In to Your Account
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Discord -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1E1E2E;border-radius:8px;border:1px solid #3f3f5a;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 6px;color:#e2e8f0;font-size:15px;font-weight:600;">Join the Community</p>
                    <p style="margin:0 0 12px;color:#94a3b8;font-size:14px;line-height:1.5;">
                      Connect with fellow members, get support, and access exclusive discussions.
                    </p>
                    <a href="https://discord.gg/mindsparkstack"
                       style="color:#06B6D4;font-size:14px;font-weight:500;text-decoration:none;">
                      Join Discord &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #2d2d45;text-align:center;">
              <p style="margin:0;color:#475569;font-size:13px;line-height:1.6;">
                If you have any questions, reply to this email or reach us at
                <a href="mailto:support@mindsparkstack.com" style="color:#7C3AED;text-decoration:none;">support@mindsparkstack.com</a>
              </p>
              <p style="margin:8px 0 0;color:#334155;font-size:12px;">
                &copy; ${new Date().getFullYear()} MindSparkAI. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "MindSparkAI <welcome@mindsparkstack.com>",
      to: [to],
      subject: `Welcome to MindSparkAI — Your ${tierLabel} access is ready`,
      html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend API error ${response.status}: ${body}`);
  }
}

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

async function handleCheckoutCompleted(
  session: Record<string, unknown>,
  supabase: ReturnType<typeof createClient>,
  resendApiKey: string
): Promise<void> {
  const email = (session.customer_details as Record<string, unknown>)
    ?.email as string | undefined;
  const customerName = (
    (session.customer_details as Record<string, unknown>)?.name as
      | string
      | undefined
  ) ?? "";
  const stripeCustomerId = session.customer as string | undefined;

  if (!email) {
    console.error("checkout.session.completed: no email found, skipping");
    return;
  }

  const tier = tierFromSession(
    session as {
      line_items?: { data?: Array<{ price?: { id?: string } }> };
      amount_total?: number | null;
    }
  );

  console.log(`Processing checkout: email=${email} tier=${tier}`);

  // ---- Look up existing user ----
  const { data: existingUsers, error: lookupError } =
    await supabase.auth.admin.listUsers();

  if (lookupError) {
    throw new Error(`Failed to list users: ${lookupError.message}`);
  }

  const existingUser = existingUsers?.users?.find((u) => u.email === email);

  let userId: string;
  let plainPassword: string | null = null;

  if (existingUser) {
    userId = existingUser.id;
    console.log(`User already exists: ${userId}, checking tier upgrade`);

    // Fetch current tier from profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("tier")
      .eq("id", userId)
      .single();

    const currentTier = (profile?.tier as string) ?? "free";
    const currentRank = TIER_RANK[currentTier] ?? 0;
    const newRank = TIER_RANK[tier] ?? 0;

    if (newRank > currentRank) {
      await supabase
        .from("profiles")
        .update({ tier, stripe_customer_id: stripeCustomerId })
        .eq("id", userId);
      console.log(`Upgraded tier from ${currentTier} to ${tier}`);
    } else {
      console.log(
        `No tier upgrade needed (current: ${currentTier}, new: ${tier})`
      );
    }
  } else {
    // ---- Create new user ----
    plainPassword = generatePassword(12);

    const { data: newUser, error: createError } =
      await supabase.auth.admin.createUser({
        email,
        password: plainPassword,
        email_confirm: true,
        user_metadata: { full_name: customerName },
      });

    if (createError) {
      throw new Error(`Failed to create user: ${createError.message}`);
    }

    userId = newUser.user.id;
    console.log(`Created new user: ${userId}`);

    // Upsert profile
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      email,
      full_name: customerName,
      tier,
      stripe_customer_id: stripeCustomerId,
    });

    if (profileError) {
      console.error(`Failed to upsert profile: ${profileError.message}`);
    }
  }

  // ---- Handle subscription record for recurring products ----
  if (RECURRING_TIERS.has(tier)) {
    const subscriptionId = session.subscription as string | undefined;
    if (subscriptionId) {
      const { error: subError } = await supabase
        .from("subscriptions")
        .upsert({
          user_id: userId,
          stripe_subscription_id: subscriptionId,
          status: "active",
          current_period_end: null, // Will be updated by subscription.updated event
        });

      if (subError) {
        console.error(
          `Failed to upsert subscription: ${subError.message}`
        );
      }
    }
  }

  // ---- Send welcome email (only for new users) ----
  if (plainPassword) {
    try {
      await sendWelcomeEmail({
        to: email,
        fullName: customerName,
        password: plainPassword,
        tier,
        resendApiKey,
      });
      console.log(`Welcome email sent to ${email}`);
    } catch (err) {
      // Don't fail the webhook if email fails — user was already created
      console.error(`Failed to send welcome email: ${err}`);
    }
  }
}

async function handleSubscriptionUpdated(
  subscription: Record<string, unknown>,
  supabase: ReturnType<typeof createClient>
): Promise<void> {
  const stripeSubId = subscription.id as string;
  const status = subscription.status as string;
  const currentPeriodEnd = subscription.current_period_end as number | null;

  console.log(`Updating subscription ${stripeSubId} status=${status}`);

  const { data: sub, error: findError } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", stripeSubId)
    .single();

  if (findError || !sub) {
    console.error(
      `Subscription record not found for ${stripeSubId}: ${findError?.message}`
    );
    return;
  }

  await supabase
    .from("subscriptions")
    .update({
      status,
      current_period_end: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000).toISOString()
        : null,
    })
    .eq("stripe_subscription_id", stripeSubId);

  // Downgrade to free if canceled or unpaid
  if (status === "canceled" || status === "unpaid") {
    await supabase
      .from("profiles")
      .update({ tier: "free" })
      .eq("id", sub.user_id);
    console.log(`Downgraded user ${sub.user_id} to free tier`);
  }
}

async function handleSubscriptionDeleted(
  subscription: Record<string, unknown>,
  supabase: ReturnType<typeof createClient>
): Promise<void> {
  const stripeSubId = subscription.id as string;
  console.log(`Deleting subscription ${stripeSubId}`);

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", stripeSubId)
    .single();

  await supabase
    .from("subscriptions")
    .update({ status: "canceled" })
    .eq("stripe_subscription_id", stripeSubId);

  if (sub?.user_id) {
    await supabase
      .from("profiles")
      .update({ tier: "free" })
      .eq("id", sub.user_id);
    console.log(`Downgraded user ${sub.user_id} to free tier`);
  }
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

serve(async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // ---- Environment variables ----
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");

  if (!webhookSecret || !supabaseUrl || !supabaseServiceKey || !resendApiKey) {
    console.error("Missing required environment variables");
    return new Response("Internal Server Error", { status: 500 });
  }

  // ---- Read raw body ----
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  // ---- Verify signature ----
  const isValid = await verifyStripeSignature(body, signature, webhookSecret);
  if (!isValid) {
    console.error("Invalid Stripe signature");
    return new Response("Unauthorized", { status: 401 });
  }

  // ---- Parse event ----
  let event: { type: string; data: { object: Record<string, unknown> } };
  try {
    event = JSON.parse(body);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  // ---- Supabase client (service role — bypasses RLS) ----
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  // ---- Route event ----
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object,
          supabase,
          resendApiKey
        );
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object, supabase);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object, supabase);
        break;

      default:
        console.log(`Ignoring event type: ${event.type}`);
    }
  } catch (err) {
    console.error(`Error handling event ${event.type}:`, err);
    return new Response("Internal Server Error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
