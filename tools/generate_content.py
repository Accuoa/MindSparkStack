#!/usr/bin/env python3
"""
generate_content.py — SCRIBE agent's content generation engine.

Usage:
  python tools/generate_content.py --platform twitter --topic "AI productivity tips"
  python tools/generate_content.py --platform youtube --topic "How to build an AI agent"
  python tools/generate_content.py --platform linkedin --topic "The future of AI at work"
  python tools/generate_content.py --platform blog --topic "5 ChatGPT mistakes"
  python tools/generate_content.py --platform all --topic "AI automation for businesses"
  python tools/generate_content.py --dry-run --platform twitter --topic "Test"

Options:
  --platform PLATFORM  twitter, youtube, linkedin, blog, email, tiktok, or all
  --topic TEXT         The topic/angle for content generation
  --pillar PILLAR      Content pillar: prompts, workflows, tools, agents, mindset (default: auto)
  --dry-run            Show what would be generated without calling AI

Outputs content to .tmp/content_queue/<platform>/<date>_<slug>.json or .md

IMPORTANT: Requires ANTHROPIC_API_KEY in .env for AI content generation.
If no API key, generates template-based content instead.
Zero external dependencies beyond standard library (uses urllib for Anthropic API).
"""

import json
import os
import sys
import re
from datetime import datetime
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
ANTHROPIC_MODEL = "claude-sonnet-4-20250514"

# Content pillars for MindSparkAI
CONTENT_PILLARS = {
    "prompts": "AI prompt engineering — how to write better prompts, prompt frameworks, common mistakes",
    "workflows": "AI-powered workflows — automating tasks, building systems, productivity hacks",
    "tools": "AI tool reviews and comparisons — which tools to use for what, setup guides",
    "agents": "AI agents — building autonomous systems, agent frameworks, real-world use cases",
    "mindset": "AI mindset and career — adapting to AI, future-proofing skills, AI ethics",
}

# Platform-specific system prompts
PLATFORM_PROMPTS = {
    "twitter": """You are a content writer for MindSparkAI (@AccuoaAgent on X/Twitter).
Write engaging tweets about AI productivity and automation.
Rules:
- Max 280 characters per tweet
- For threads, write 4-7 tweets as a JSON array of strings
- Use a hook in the first tweet that stops the scroll
- End with a CTA pointing to mindsparkstack.com
- Tone: knowledgeable but approachable, no jargon
- No emojis except sparingly
Output format: JSON object with "type" (tweet or thread) and "content" (string or array)""",

    "youtube": """You are a scriptwriter for MindSparkAI YouTube channel (@Accuoa).
Write a YouTube video script about AI productivity and automation.
Rules:
- 8-12 minute target length (roughly 1200-1800 words)
- Start with a strong hook (first 10 seconds)
- Include clear sections with timestamps
- End with a CTA: subscribe + check mindsparkstack.com
- Tone: professional, educational, like a knowledgeable friend
- Include [B-ROLL] and [SCREEN SHARE] markers where visuals would help
Output format: JSON object with "title", "description", "tags" (array), and "script" (the full script text)""",

    "tiktok": """You are a short-form video scriptwriter for MindSparkAI (@accuoa on TikTok).
Write a 30-60 second video script about AI tips.
Rules:
- Hook in the first 2 seconds (question, bold claim, or pattern interrupt)
- One clear takeaway per video
- Conversational, energetic tone
- End with "Follow for more AI tips" or similar
- Include [VISUAL] markers for on-screen text/graphics
Output format: JSON object with "hook", "script", "caption", and "hashtags" (array)""",

    "linkedin": """You are a thought leadership writer for MindSparkAI on LinkedIn.
Write a LinkedIn post about AI in the workplace.
Rules:
- 150-300 words
- Professional but not corporate — thoughtful and opinionated
- Start with a bold statement or contrarian take
- Use short paragraphs and line breaks
- End with a question to drive engagement
- Include a subtle mention of mindsparkstack.com
Output format: JSON object with "post" (the full text)""",

    "blog": """You are an SEO content writer for mindsparkstack.com/blog.
Write a blog post about AI productivity.
Rules:
- 800-1500 words
- SEO-optimized title (include target keyword)
- Include meta description (150-160 chars)
- Use H2 and H3 subheadings
- Actionable, practical advice with examples
- Include a CTA section at the end linking to the MindSparkAI Masterclass
- Write in HTML format matching the existing blog style
Output format: JSON object with "title", "meta_description", "html_content", and "slug" """,

    "email": """You are an email copywriter for MindSparkAI's newsletter.
Write a newsletter email about AI tips and updates.
Rules:
- Subject line under 50 chars (high open rate style)
- Preview text under 90 chars
- 200-400 word body
- One main tip or insight
- Personal tone, written from Aiden
- CTA: link to latest blog post or mindsparkstack.com
Output format: JSON object with "subject", "preview_text", and "body_html" """,
}

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
# AI content generation via Anthropic API
# ---------------------------------------------------------------------------

def generate_with_claude(api_key, system_prompt, user_prompt):
    """Call Claude API to generate content. Returns parsed JSON."""
    payload = json.dumps({
        "model": ANTHROPIC_MODEL,
        "max_tokens": 4096,
        "system": system_prompt,
        "messages": [{"role": "user", "content": user_prompt}],
    }).encode("utf-8")

    req = Request(ANTHROPIC_API_URL, data=payload, method="POST")
    req.add_header("x-api-key", api_key)
    req.add_header("anthropic-version", "2023-06-01")
    req.add_header("Content-Type", "application/json")

    for attempt in range(3):
        try:
            with urlopen(req, timeout=60) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                text = result["content"][0]["text"]
                # Try to parse as JSON (Claude should return JSON per our prompts)
                json_match = re.search(r'\{[\s\S]*\}', text)
                if json_match:
                    return json.loads(json_match.group())
                return {"raw_text": text}
        except HTTPError as e:
            print(f"[WARN] Attempt {attempt+1}/3: HTTP {e.code} — {e.read().decode()[:200]}")
        except URLError as e:
            print(f"[WARN] Attempt {attempt+1}/3: {e.reason}")
        except json.JSONDecodeError:
            return {"raw_text": text}

    print("[ERROR] All 3 attempts to generate content failed.")
    return None

# ---------------------------------------------------------------------------
# Template-based fallback (no API key needed)
# ---------------------------------------------------------------------------

def generate_template_content(platform, topic, pillar):
    """Generate basic template content when no AI API key is available."""
    templates = {
        "twitter": {
            "type": "tweet",
            "content": f"Most people don't realize how much AI can help with {topic}.\n\nHere's what I've learned after months of testing:\n\n[Thread on {topic} — fill in specifics]\n\nmindsparkstack.com"
        },
        "youtube": {
            "title": f"How to Use AI for {topic.title()}",
            "description": f"In this video, I break down {topic} and show you exactly how to get started.\n\nGet the full course: mindsparkstack.com",
            "tags": ["AI", "productivity", topic.replace(" ", "")],
            "script": f"[HOOK] What if I told you that {topic} could save you 10 hours this week?\n\n[INTRO] Hey, I'm Aiden from MindSparkAI...\n\n[SECTION 1] First, let's talk about why {topic} matters...\n\n[SECTION 2] Here's the step-by-step process...\n\n[CTA] If you found this helpful, subscribe and check out mindsparkstack.com"
        },
        "linkedin": {
            "post": f"Hot take: Most professionals are sleeping on {topic}.\n\nI've been testing this for weeks and the results speak for themselves.\n\nHere's what changed:\n\n1. [Specific result]\n2. [Specific result]\n3. [Specific result]\n\nThe tools exist. The frameworks are proven. What's missing is the system to tie it all together.\n\nThat's exactly what we built at mindsparkstack.com\n\nWhat's your experience with {topic}?"
        },
        "blog": {
            "title": f"The Complete Guide to {topic.title()}",
            "meta_description": f"Learn how to leverage AI for {topic}. Practical tips, real examples, and step-by-step instructions.",
            "slug": topic.lower().replace(" ", "-")[:50],
            "html_content": f"<h2>Why {topic.title()} Matters</h2>\n<p>[Content about {topic}]</p>\n<h2>Step-by-Step Guide</h2>\n<p>[Detailed steps]</p>"
        },
        "tiktok": {
            "hook": f"Did you know AI can handle {topic} automatically?",
            "script": f"[Hook] Most people waste hours on {topic}. Here's the 30-second fix.\n[Body] Step 1... Step 2... Step 3...\n[CTA] Follow for more AI tips!",
            "caption": f"AI hack for {topic} #AI #productivity #automation",
            "hashtags": ["#AI", "#productivity", "#automation", "#chatgpt"]
        },
        "email": {
            "subject": f"This AI trick changed my {topic.split()[0]} game",
            "preview_text": f"A quick tip on {topic} that actually works.",
            "body_html": f"<p>Hey,</p><p>Quick tip on {topic}...</p><p>— Aiden</p>"
        },
    }
    return templates.get(platform, {"error": f"No template for platform: {platform}"})

# ---------------------------------------------------------------------------
# Save content to queue
# ---------------------------------------------------------------------------

def save_to_queue(project_root, platform, content, topic):
    """Save generated content to the content queue."""
    date_str = datetime.now().strftime("%Y-%m-%d")
    slug = re.sub(r'[^a-z0-9]+', '-', topic.lower())[:40].strip('-')
    filename = f"{date_str}_{slug}.json"

    queue_dir = os.path.join(project_root, ".tmp", "content_queue", platform)
    os.makedirs(queue_dir, exist_ok=True)

    filepath = os.path.join(queue_dir, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(content, f, indent=2, ensure_ascii=False)

    print(f"[OK] Content saved to {os.path.relpath(filepath, project_root)}")
    return filepath

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

    # Parse arguments
    platform = None
    topic = None
    pillar = "auto"

    i = 0
    while i < len(args):
        if args[i] == "--platform" and i + 1 < len(args):
            platform = args[i + 1].lower()
            i += 2
        elif args[i] == "--topic" and i + 1 < len(args):
            topic = args[i + 1]
            i += 2
        elif args[i] == "--pillar" and i + 1 < len(args):
            pillar = args[i + 1].lower()
            i += 2
        else:
            i += 1

    if not platform or not topic:
        print("Usage: python tools/generate_content.py --platform <platform> --topic \"Topic\"")
        print("Platforms: twitter, youtube, linkedin, blog, tiktok, email, all")
        sys.exit(1)

    platforms = list(PLATFORM_PROMPTS.keys()) if platform == "all" else [platform]

    for plat in platforms:
        if plat not in PLATFORM_PROMPTS:
            print(f"[WARN] Unknown platform: {plat}. Skipping.")
            continue

        print(f"\n{'='*60}")
        print(f"Generating {plat} content: \"{topic}\"")
        print(f"{'='*60}")

        if dry_run:
            print(f"[DRY-RUN] Would generate {plat} content for topic: {topic}")
            print(f"  System prompt: {PLATFORM_PROMPTS[plat][:100]}...")
            continue

        pillar_context = ""
        if pillar != "auto" and pillar in CONTENT_PILLARS:
            pillar_context = f"\nContent pillar: {CONTENT_PILLARS[pillar]}"

        user_prompt = f"Create content about: {topic}{pillar_context}\n\nRemember to output valid JSON."

        if api_key:
            content = generate_with_claude(api_key, PLATFORM_PROMPTS[plat], user_prompt)
        else:
            print("[INFO] No ANTHROPIC_API_KEY found. Using template-based generation.")
            content = generate_template_content(plat, topic, pillar)

        if content:
            save_to_queue(project_root, plat, content, topic)
        else:
            print(f"[ERROR] Failed to generate content for {plat}")

    if not dry_run:
        print(f"\n[DONE] Content generation complete.")

if __name__ == "__main__":
    main()
