#!/usr/bin/env python3
"""
post_to_twitter.py — Post tweets and threads via X/Twitter API v2.

Usage:
  python tools/post_to_twitter.py "Your tweet text here"
  python tools/post_to_twitter.py --thread tweets.json
  python tools/post_to_twitter.py --dry-run "Test tweet"

Thread JSON format (tweets.json):
  ["First tweet in thread", "Second tweet", "Third tweet"]

Reads Twitter API credentials from .env:
  TWITTER_API_KEY, TWITTER_API_SECRET,
  TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET

Requires: requests_oauthlib (pip install requests-oauthlib)
"""

import json
import os
import sys
import time
import hmac
import hashlib
import base64
from datetime import datetime
from urllib.parse import quote
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
import uuid

TWITTER_API_URL = "https://api.x.com/2/tweets"
CHAR_LIMIT = 280

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
# OAuth 1.0a signing (no external deps)
# ---------------------------------------------------------------------------

def percent_encode(s):
    return quote(str(s), safe="")

def generate_oauth_signature(method, url, params, consumer_secret, token_secret):
    sorted_params = "&".join(
        f"{percent_encode(k)}={percent_encode(v)}"
        for k, v in sorted(params.items())
    )
    base_string = f"{method}&{percent_encode(url)}&{percent_encode(sorted_params)}"
    signing_key = f"{percent_encode(consumer_secret)}&{percent_encode(token_secret)}"
    signature = hmac.new(
        signing_key.encode("utf-8"),
        base_string.encode("utf-8"),
        hashlib.sha1,
    ).digest()
    return base64.b64encode(signature).decode("utf-8")

def build_oauth_header(method, url, consumer_key, consumer_secret, access_token, token_secret):
    oauth_params = {
        "oauth_consumer_key": consumer_key,
        "oauth_nonce": uuid.uuid4().hex,
        "oauth_signature_method": "HMAC-SHA1",
        "oauth_timestamp": str(int(time.time())),
        "oauth_token": access_token,
        "oauth_version": "1.0",
    }
    signature = generate_oauth_signature(
        method, url, oauth_params, consumer_secret, token_secret
    )
    oauth_params["oauth_signature"] = signature
    auth_header = "OAuth " + ", ".join(
        f'{percent_encode(k)}="{percent_encode(v)}"'
        for k, v in sorted(oauth_params.items())
    )
    return auth_header

# ---------------------------------------------------------------------------
# Twitter API functions
# ---------------------------------------------------------------------------

def post_tweet(text, credentials, reply_to=None, dry_run=False):
    """Post a single tweet. Returns tweet ID on success."""
    if len(text) > CHAR_LIMIT:
        print(f"[WARN] Tweet exceeds {CHAR_LIMIT} chars ({len(text)}). Will be truncated by API.")

    if dry_run:
        print(f"[DRY-RUN] Would post tweet ({len(text)} chars):")
        print(f"  {text[:200]}{'...' if len(text) > 200 else ''}")
        if reply_to:
            print(f"  (reply to: {reply_to})")
        return "dry-run-id"

    payload = {"text": text}
    if reply_to:
        payload["reply"] = {"in_reply_to_tweet_id": reply_to}

    data = json.dumps(payload).encode("utf-8")
    auth_header = build_oauth_header(
        "POST", TWITTER_API_URL,
        credentials["api_key"], credentials["api_secret"],
        credentials["access_token"], credentials["access_token_secret"],
    )

    req = Request(TWITTER_API_URL, data=data, method="POST")
    req.add_header("Authorization", auth_header)
    req.add_header("Content-Type", "application/json")

    for attempt in range(3):
        try:
            with urlopen(req, timeout=15) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                tweet_id = result["data"]["id"]
                print(f"[OK] Tweet posted (id: {tweet_id})")
                return tweet_id
        except HTTPError as e:
            error_body = e.read().decode("utf-8")
            print(f"[WARN] Attempt {attempt+1}/3 failed: HTTP {e.code} — {error_body}")
            if e.code == 429:
                print("[WARN] Rate limited. Waiting 60 seconds...")
                time.sleep(60)
        except URLError as e:
            print(f"[WARN] Attempt {attempt+1}/3 failed: {e.reason}")

    print("[ERROR] All 3 attempts to post tweet failed.")
    return None

def post_thread(tweets, credentials, dry_run=False):
    """Post a thread (list of tweet texts). Returns list of tweet IDs."""
    print(f"[INFO] Posting thread with {len(tweets)} tweets...")
    tweet_ids = []
    reply_to = None

    for i, text in enumerate(tweets):
        print(f"\n--- Tweet {i+1}/{len(tweets)} ---")
        tweet_id = post_tweet(text, credentials, reply_to=reply_to, dry_run=dry_run)
        if tweet_id is None:
            print(f"[ERROR] Thread broken at tweet {i+1}. Stopping.")
            return tweet_ids
        tweet_ids.append(tweet_id)
        reply_to = tweet_id
        if not dry_run and i < len(tweets) - 1:
            time.sleep(2)

    print(f"\n[OK] Thread posted successfully ({len(tweet_ids)} tweets)")
    return tweet_ids

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    env = load_env(os.path.join(project_root, ".env"))

    credentials = {
        "api_key": env.get("TWITTER_API_KEY", ""),
        "api_secret": env.get("TWITTER_API_SECRET", ""),
        "access_token": env.get("TWITTER_ACCESS_TOKEN", ""),
        "access_token_secret": env.get("TWITTER_ACCESS_TOKEN_SECRET", ""),
    }

    args = sys.argv[1:]
    dry_run = False
    thread_mode = False

    if "--dry-run" in args:
        dry_run = True
        args.remove("--dry-run")

    if not dry_run and not all(credentials.values()):
        print("[ERROR] Missing Twitter API credentials in .env")
        print("Required: TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET")
        sys.exit(1)

    if "--thread" in args:
        thread_mode = True
        args.remove("--thread")

    if len(args) < 1:
        print("Usage: python tools/post_to_twitter.py [--dry-run] \"Tweet text\"")
        print("       python tools/post_to_twitter.py [--dry-run] --thread tweets.json")
        sys.exit(1)

    if thread_mode:
        json_path = args[0]
        if not os.path.isabs(json_path):
            json_path = os.path.join(project_root, json_path)
        with open(json_path, "r", encoding="utf-8") as f:
            tweets = json.load(f)
        if not isinstance(tweets, list):
            print("[ERROR] Thread JSON must be an array of strings.")
            sys.exit(1)
        result = post_thread(tweets, credentials, dry_run)
        sys.exit(0 if result else 1)
    else:
        text = args[0]
        result = post_tweet(text, credentials, dry_run=dry_run)
        sys.exit(0 if result else 1)

if __name__ == "__main__":
    main()
