#!/usr/bin/env python3
"""
send_newsletter.py — Send email newsletters via Resend API.

Usage:
  python tools/send_newsletter.py --subject "Subject" --body-file .tmp/content_queue/email/newsletter.html
  python tools/send_newsletter.py --subject "Subject" --body "Plain text body"
  python tools/send_newsletter.py --dry-run --subject "Test" --body "Test body"
  python tools/send_newsletter.py --test --subject "Test" --body-file newsletter.html

Options:
  --subject TEXT     Email subject line (required)
  --body TEXT        Plain text body
  --body-file PATH   HTML body from file
  --dry-run          Print what would be sent, don't actually send
  --test             Send only to Aiden's email (aidenbolin09@gmail.com)
  --from-name NAME   Sender name (default: MindSparkAI)

Reads RESEND_API_KEY and SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY from .env.
Fetches subscriber emails from Supabase profiles table.
Zero external dependencies — uses only Python standard library.
"""

import json
import os
import sys
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

RESEND_API_URL = "https://api.resend.com/emails"
FROM_EMAIL_TEMPLATE = "{name} <onboarding@resend.dev>"
AIDEN_EMAIL = "aidenbolin09@gmail.com"

# ---------------------------------------------------------------------------
# .env loader
# ---------------------------------------------------------------------------

def load_env(env_path):
    env = {}
    if not os.path.isfile(env_path):
        return env
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" not in line:
                continue
            key, value = line.split("=", 1)
            env[key.strip()] = value.strip().strip("'\"")
    return env

# ---------------------------------------------------------------------------
# Subscriber list from Supabase
# ---------------------------------------------------------------------------

def fetch_subscribers(supabase_url, service_role_key):
    """Fetch email list from Supabase profiles table."""
    url = f"{supabase_url}/rest/v1/profiles?select=email&tier=neq.free"
    req = Request(url)
    req.add_header("apikey", service_role_key)
    req.add_header("Authorization", f"Bearer {service_role_key}")
    req.add_header("Content-Type", "application/json")

    try:
        with urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            emails = [row["email"] for row in data if row.get("email")]
            return emails
    except (HTTPError, URLError) as e:
        print(f"[WARN] Could not fetch subscribers from Supabase: {e}")
        return []

# ---------------------------------------------------------------------------
# Send email
# ---------------------------------------------------------------------------

def send_email(api_key, from_email, to_emails, subject, body_html=None, body_text=None, dry_run=False):
    """Send an email via Resend API. Returns success count."""
    if dry_run:
        print(f"[DRY-RUN] Would send newsletter:")
        print(f"  From: {from_email}")
        print(f"  To: {len(to_emails)} recipients")
        for email in to_emails[:5]:
            print(f"    - {email}")
        if len(to_emails) > 5:
            print(f"    ... and {len(to_emails) - 5} more")
        print(f"  Subject: {subject}")
        if body_html:
            print(f"  Body: HTML ({len(body_html)} chars)")
        else:
            print(f"  Body: {body_text[:200]}...")
        return len(to_emails)

    success_count = 0
    # Resend free tier: send individually (batch API requires paid plan)
    for email in to_emails:
        payload = {
            "from": from_email,
            "to": [email],
            "subject": subject,
        }
        if body_html:
            payload["html"] = body_html
        else:
            payload["text"] = body_text or ""

        data = json.dumps(payload).encode("utf-8")
        req = Request(RESEND_API_URL, data=data, method="POST")
        req.add_header("Authorization", f"Bearer {api_key}")
        req.add_header("Content-Type", "application/json")

        try:
            with urlopen(req, timeout=15) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                print(f"  [OK] Sent to {email} (id: {result.get('id', '?')})")
                success_count += 1
        except HTTPError as e:
            print(f"  [FAIL] {email}: HTTP {e.code} — {e.read().decode()}")
        except URLError as e:
            print(f"  [FAIL] {email}: {e.reason}")

    return success_count

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    env = load_env(os.path.join(project_root, ".env"))

    api_key = env.get("RESEND_API_KEY")
    if not api_key:
        print("[ERROR] Missing RESEND_API_KEY in .env")
        sys.exit(1)

    args = sys.argv[1:]
    dry_run = "--dry-run" in args
    test_mode = "--test" in args
    if dry_run:
        args.remove("--dry-run")
    if test_mode:
        args.remove("--test")

    # Parse arguments
    subject = None
    body_text = None
    body_html = None
    from_name = "MindSparkAI"

    i = 0
    while i < len(args):
        if args[i] == "--subject" and i + 1 < len(args):
            subject = args[i + 1]
            i += 2
        elif args[i] == "--body" and i + 1 < len(args):
            body_text = args[i + 1]
            i += 2
        elif args[i] == "--body-file" and i + 1 < len(args):
            path = args[i + 1]
            if not os.path.isabs(path):
                path = os.path.join(project_root, path)
            with open(path, "r", encoding="utf-8") as f:
                body_html = f.read()
            i += 2
        elif args[i] == "--from-name" and i + 1 < len(args):
            from_name = args[i + 1]
            i += 2
        else:
            i += 1

    if not subject:
        print("Usage: python tools/send_newsletter.py --subject \"Subject\" --body \"Text\"")
        print("       python tools/send_newsletter.py --subject \"Subject\" --body-file path/to/file.html")
        sys.exit(1)

    if not body_text and not body_html:
        print("[ERROR] Provide either --body or --body-file")
        sys.exit(1)

    from_email = FROM_EMAIL_TEMPLATE.format(name=from_name)

    # Get recipients
    if test_mode:
        to_emails = [AIDEN_EMAIL]
        print(f"[TEST MODE] Sending only to {AIDEN_EMAIL}")
    else:
        supabase_url = env.get("SUPABASE_URL", "")
        service_role_key = env.get("SUPABASE_SERVICE_ROLE_KEY", "")
        if supabase_url and service_role_key:
            to_emails = fetch_subscribers(supabase_url, service_role_key)
        else:
            to_emails = []

        if not to_emails:
            print("[WARN] No subscribers found. Sending to Aiden only.")
            to_emails = [AIDEN_EMAIL]

    print(f"\n[INFO] Sending newsletter to {len(to_emails)} recipients...")
    count = send_email(api_key, from_email, to_emails, subject, body_html, body_text, dry_run)
    print(f"\n[DONE] {count}/{len(to_emails)} emails sent successfully.")

if __name__ == "__main__":
    main()
