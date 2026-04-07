#!/usr/bin/env python3
"""
repurpose_content.py — Transform one piece of long-form content into multiple platforms.

Usage:
  python tools/repurpose_content.py --source .tmp/content_queue/youtube/2026-04-07_video.json
  python tools/repurpose_content.py --source .tmp/content_queue/blog/2026-04-07_post.json
  python tools/repurpose_content.py --source-text "Long article text here" --title "Article Title"
  python tools/repurpose_content.py --dry-run --source article.json

Takes a YouTube script or blog post and generates:
  - Tweet thread (.tmp/content_queue/tweets/)
  - LinkedIn post (.tmp/content_queue/linkedin/)
  - TikTok short scripts (.tmp/content_queue/tiktok/)
  - Blog post from video script or vice versa
  - Email newsletter content (.tmp/content_queue/email/)

Requires ANTHROPIC_API_KEY in .env for AI-powered repurposing.
Falls back to extraction-based repurposing without API key.
"""

import json
import os
import re
import sys
from datetime import datetime
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
ANTHROPIC_MODEL = "claude-sonnet-4-20250514"

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
# AI repurposing
# ---------------------------------------------------------------------------

def call_claude(api_key, system_prompt, user_content):
    """Call Claude API for content transformation."""
    payload = json.dumps({
        "model": ANTHROPIC_MODEL,
        "max_tokens": 4096,
        "system": system_prompt,
        "messages": [{"role": "user", "content": user_content}],
    }).encode("utf-8")

    req = Request(ANTHROPIC_API_URL, data=payload, method="POST")
    req.add_header("x-api-key", api_key)
    req.add_header("anthropic-version", "2023-06-01")
    req.add_header("Content-Type", "application/json")

    with urlopen(req, timeout=60) as resp:
        result = json.loads(resp.read().decode("utf-8"))
        text = result["content"][0]["text"]
        json_match = re.search(r'\{[\s\S]*\}', text)
        if json_match:
            return json.loads(json_match.group())
        return {"raw_text": text}

def repurpose_to_tweets(api_key, source_text, title):
    """Extract key points into a tweet thread."""
    if api_key:
        system = """Extract the key insights from this content and create a Twitter/X thread.
Rules: 4-7 tweets, each under 280 chars. First tweet is a hook. Last tweet has CTA to mindsparkstack.com.
Output: JSON with "tweets" (array of strings)."""
        result = call_claude(api_key, system, f"Title: {title}\n\nContent:\n{source_text[:3000]}")
        return result
    # Fallback: extract sentences
    sentences = [s.strip() for s in source_text.split('.') if len(s.strip()) > 30][:5]
    tweets = [f"Thread: {title}"] + sentences[:4] + ["Full breakdown at mindsparkstack.com"]
    return {"tweets": [t[:280] for t in tweets]}

def repurpose_to_linkedin(api_key, source_text, title):
    """Create a LinkedIn post from long-form content."""
    if api_key:
        system = """Transform this content into a LinkedIn post (150-300 words).
Start with a bold statement. Use short paragraphs. End with an engagement question.
Output: JSON with "post" (string)."""
        return call_claude(api_key, system, f"Title: {title}\n\nContent:\n{source_text[:3000]}")
    return {"post": f"I just published: {title}\n\nKey takeaways:\n\n[Extracted from content]\n\nWhat's your take? Let me know in the comments.\n\nmindsparkstack.com"}

def repurpose_to_tiktok(api_key, source_text, title):
    """Create 2-3 short-form video scripts from long-form content."""
    if api_key:
        system = """Extract 2-3 standalone 30-60 second video script ideas from this content.
Each script should have a hook, body, and CTA. Format for TikTok (conversational, energetic).
Output: JSON with "scripts" (array of objects with "hook", "script", "caption", "hashtags")."""
        return call_claude(api_key, system, f"Title: {title}\n\nContent:\n{source_text[:3000]}")
    return {"scripts": [{"hook": f"Did you know this about {title}?", "script": "...", "caption": title, "hashtags": ["#AI", "#productivity"]}]}

def repurpose_to_email(api_key, source_text, title):
    """Create a newsletter email from long-form content."""
    if api_key:
        system = """Create a newsletter email summarizing this content.
Subject under 50 chars. 200-300 word body. Personal tone from Aiden.
Output: JSON with "subject", "preview_text", "body_html"."""
        return call_claude(api_key, system, f"Title: {title}\n\nContent:\n{source_text[:3000]}")
    return {
        "subject": f"New: {title[:40]}",
        "preview_text": f"This week's breakdown on {title[:50]}",
        "body_html": f"<p>Hey,</p><p>Just published a new piece on {title}. Here are the key takeaways...</p><p>Read more at mindsparkstack.com</p><p>— Aiden</p>"
    }

# ---------------------------------------------------------------------------
# Save outputs
# ---------------------------------------------------------------------------

def save_content(project_root, platform, content, title):
    date_str = datetime.now().strftime("%Y-%m-%d")
    slug = re.sub(r'[^a-z0-9]+', '-', title.lower())[:40].strip('-')
    filename = f"{date_str}_{slug}_repurposed.json"
    queue_dir = os.path.join(project_root, ".tmp", "content_queue", platform)
    os.makedirs(queue_dir, exist_ok=True)
    filepath = os.path.join(queue_dir, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(content, f, indent=2, ensure_ascii=False)
    print(f"  [OK] Saved to {os.path.relpath(filepath, project_root)}")

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    env = load_env(os.path.join(project_root, ".env"))
    api_key = env.get("ANTHROPIC_API_KEY", "")

    args = sys.argv[1:]
    dry_run = "--dry-run" in args
    if dry_run:
        args.remove("--dry-run")

    source_path = None
    source_text = None
    title = "Untitled"

    i = 0
    while i < len(args):
        if args[i] == "--source" and i + 1 < len(args):
            source_path = args[i + 1]
            i += 2
        elif args[i] == "--source-text" and i + 1 < len(args):
            source_text = args[i + 1]
            i += 2
        elif args[i] == "--title" and i + 1 < len(args):
            title = args[i + 1]
            i += 2
        else:
            i += 1

    if not source_path and not source_text:
        print("Usage: python tools/repurpose_content.py --source <json_file>")
        print("       python tools/repurpose_content.py --source-text \"Text\" --title \"Title\"")
        sys.exit(1)

    # Load source content
    if source_path:
        if not os.path.isabs(source_path):
            source_path = os.path.join(project_root, source_path)
        with open(source_path, "r", encoding="utf-8") as f:
            source_data = json.load(f)
        # Extract text from different source formats
        if "script" in source_data:
            source_text = source_data["script"]
            title = source_data.get("title", title)
        elif "html_content" in source_data:
            source_text = source_data["html_content"]
            title = source_data.get("title", title)
        elif "post" in source_data:
            source_text = source_data["post"]
        elif "raw_text" in source_data:
            source_text = source_data["raw_text"]
        else:
            source_text = json.dumps(source_data)

    if not source_text:
        print("[ERROR] Could not extract text from source.")
        sys.exit(1)

    print(f"[INFO] Repurposing: \"{title}\" ({len(source_text)} chars)")
    print(f"[INFO] AI-powered: {'Yes' if api_key else 'No (template fallback)'}")

    if dry_run:
        print(f"[DRY-RUN] Would generate: tweets, linkedin, tiktok, email from this content")
        return

    # Generate all derivative content
    targets = [
        ("tweets", repurpose_to_tweets),
        ("linkedin", repurpose_to_linkedin),
        ("tiktok", repurpose_to_tiktok),
        ("email", repurpose_to_email),
    ]

    for platform, func in targets:
        print(f"\n--- Generating {platform} content ---")
        try:
            content = func(api_key, source_text, title)
            if content:
                save_content(project_root, platform, content, title)
            else:
                print(f"  [WARN] No content generated for {platform}")
        except Exception as e:
            print(f"  [ERROR] Failed to generate {platform}: {e}")

    print(f"\n[DONE] Repurposing complete for \"{title}\"")

if __name__ == "__main__":
    main()
