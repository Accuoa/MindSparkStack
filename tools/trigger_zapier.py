#!/usr/bin/env python3
"""
trigger_zapier.py — Send JSON payloads to Zapier webhook URLs.

Usage:
  python tools/trigger_zapier.py <webhook_url> <json_payload>
  python tools/trigger_zapier.py --dry-run <webhook_url> <json_payload>

Examples:
  python tools/trigger_zapier.py "https://hooks.zapier.com/hooks/catch/123/abc/" '{"text":"Hello LinkedIn"}'
  python tools/trigger_zapier.py --dry-run "https://hooks.zapier.com/hooks/catch/123/abc/" '{"text":"Test"}'

Can also be imported and used as a library:
  from trigger_zapier import trigger_zap
  trigger_zap("https://hooks.zapier.com/...", {"text": "Hello"})

Zero external dependencies — uses only Python standard library.
"""

import json
import os
import sys
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

# ---------------------------------------------------------------------------
# Core function
# ---------------------------------------------------------------------------

def trigger_zap(webhook_url, payload, dry_run=False):
    """Send a JSON payload to a Zapier webhook URL.

    Args:
        webhook_url: The Zapier webhook URL
        payload: Dict to send as JSON body
        dry_run: If True, print what would be sent without actually sending

    Returns:
        True if successful, False otherwise
    """
    if dry_run:
        print(f"[DRY-RUN] Would trigger Zapier webhook:")
        print(f"  URL: {webhook_url}")
        print(f"  Payload: {json.dumps(payload, indent=2)}")
        return True

    data = json.dumps(payload).encode("utf-8")
    req = Request(webhook_url, data=data, method="POST")
    req.add_header("Content-Type", "application/json")

    for attempt in range(3):
        try:
            with urlopen(req, timeout=15) as resp:
                status = resp.getcode()
                body = resp.read().decode("utf-8")
                print(f"[OK] Zapier webhook triggered (HTTP {status})")
                return True
        except HTTPError as e:
            print(f"[WARN] Attempt {attempt+1}/3 failed: HTTP {e.code}")
        except URLError as e:
            print(f"[WARN] Attempt {attempt+1}/3 failed: {e.reason}")

    print("[ERROR] All 3 attempts to trigger Zapier webhook failed.")
    return False

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    args = sys.argv[1:]
    dry_run = False
    if "--dry-run" in args:
        dry_run = True
        args.remove("--dry-run")

    if len(args) < 2:
        print("Usage: python tools/trigger_zapier.py [--dry-run] <webhook_url> <json_payload>")
        print('Example: python tools/trigger_zapier.py "https://hooks.zapier.com/..." \'{"text":"Hello"}\'')
        sys.exit(1)

    webhook_url = args[0]
    try:
        payload = json.loads(args[1])
    except json.JSONDecodeError as e:
        print(f"[ERROR] Invalid JSON payload: {e}")
        sys.exit(1)

    success = trigger_zap(webhook_url, payload, dry_run)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
