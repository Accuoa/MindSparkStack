#!/usr/bin/env python3
"""
content_scheduler.py — Orchestrator that dispatches queued content to platforms.

Usage:
  python tools/content_scheduler.py              # Post all due content
  python tools/content_scheduler.py --dry-run    # Preview what would be posted
  python tools/content_scheduler.py --status     # Show queue status
  python tools/content_scheduler.py --platform twitter  # Only post Twitter content

Reads content from .tmp/content_queue/<platform>/ and dispatches to:
  - Twitter: via tools/post_to_twitter.py (direct API)
  - YouTube: via tools/upload_to_youtube.py (direct API)
  - LinkedIn: via tools/trigger_zapier.py (Zapier webhook)
  - TikTok: flags for manual posting (no automated API)
  - Blog: via tools/deploy_to_turbify.py (FTP)
  - Email: via tools/send_newsletter.py (Resend API)

After posting, moves content to .tmp/content_archive/<platform>/.
Designed to run hourly via Windows Task Scheduler (8AM-8PM).

Reads webhook URLs from .env:
  ZAPIER_LINKEDIN_WEBHOOK, ZAPIER_BLOG_DEPLOY_WEBHOOK
"""

import json
import os
import shutil
import subprocess
import sys
from datetime import datetime
from glob import glob

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
# Queue helpers
# ---------------------------------------------------------------------------

def get_queue_files(queue_dir, platform):
    """Get all queued content files for a platform, sorted by date."""
    platform_dir = os.path.join(queue_dir, platform)
    if not os.path.isdir(platform_dir):
        return []
    files = glob(os.path.join(platform_dir, "*.json"))
    files.sort()
    return files

def archive_file(file_path, archive_dir, platform):
    """Move a posted file to the archive."""
    dest_dir = os.path.join(archive_dir, platform)
    os.makedirs(dest_dir, exist_ok=True)
    dest = os.path.join(dest_dir, os.path.basename(file_path))
    shutil.move(file_path, dest)
    return dest

def run_tool(project_root, tool_name, args, dry_run=False):
    """Run a Python tool from the tools/ directory."""
    tool_path = os.path.join(project_root, "tools", tool_name)
    cmd = [sys.executable, tool_path] + (["--dry-run"] if dry_run else []) + args
    print(f"  > {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True, cwd=project_root)
    if result.stdout:
        for line in result.stdout.strip().split('\n'):
            print(f"    {line}")
    if result.returncode != 0 and result.stderr:
        print(f"    [STDERR] {result.stderr.strip()[:300]}")
    return result.returncode == 0

# ---------------------------------------------------------------------------
# Platform dispatchers
# ---------------------------------------------------------------------------

def dispatch_twitter(project_root, content_file, dry_run=False):
    """Post tweet or thread from queue file."""
    with open(content_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    if data.get("type") == "thread" or "tweets" in data:
        tweets = data.get("tweets") or data.get("content", [])
        if isinstance(tweets, list):
            # Write temp thread file
            thread_path = os.path.join(project_root, ".tmp", "_thread_temp.json")
            with open(thread_path, "w") as f:
                json.dump(tweets, f)
            success = run_tool(project_root, "post_to_twitter.py", ["--thread", thread_path], dry_run)
            if os.path.exists(thread_path) and not dry_run:
                os.remove(thread_path)
            return success
    else:
        text = data.get("content") or data.get("text") or data.get("tweet", "")
        if text:
            return run_tool(project_root, "post_to_twitter.py", [text], dry_run)

    print(f"  [WARN] Could not extract tweet content from {content_file}")
    return False

def dispatch_linkedin(project_root, content_file, env, dry_run=False):
    """Post LinkedIn content via Zapier webhook."""
    webhook_url = env.get("ZAPIER_LINKEDIN_WEBHOOK", "")
    if not webhook_url:
        print("  [SKIP] No ZAPIER_LINKEDIN_WEBHOOK in .env")
        return False

    with open(content_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    post_text = data.get("post", "")
    if not post_text:
        print(f"  [WARN] No 'post' field in {content_file}")
        return False

    payload = json.dumps({"text": post_text})
    return run_tool(project_root, "trigger_zapier.py", [webhook_url, payload], dry_run)

def dispatch_youtube(project_root, content_file, dry_run=False):
    """Upload video to YouTube."""
    with open(content_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    video_path = data.get("video_path", "")
    title = data.get("title", "Untitled")
    description = data.get("description", "")
    tags = data.get("tags", [])
    is_short = data.get("is_short", False)

    if not video_path:
        print(f"  [WARN] No video_path in {content_file}")
        return False

    if not os.path.isabs(video_path):
        video_path = os.path.join(project_root, video_path)

    if not os.path.isfile(video_path) and not dry_run:
        print(f"  [ERROR] Video file not found: {video_path}")
        return False

    args = [video_path, "--title", title, "--description", description]
    if tags:
        args.extend(["--tags", ",".join(tags)])
    if is_short:
        args.append("--short")

    return run_tool(project_root, "upload_to_youtube.py", args, dry_run)

def dispatch_tiktok(project_root, content_file, dry_run=False):
    """Flag TikTok content for manual posting."""
    with open(content_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    caption = data.get("caption", "")
    video_path = data.get("video_path", "")

    print(f"  [MANUAL] TikTok post requires manual upload:")
    print(f"    Caption: {caption[:100]}")
    if video_path:
        print(f"    Video: {video_path}")
    print(f"    Open TikTok app and upload from: {content_file}")
    return True  # Mark as "dispatched" even though it's manual

def dispatch_blog(project_root, content_file, env, dry_run=False):
    """Deploy blog post to Turbify."""
    with open(content_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    html_content = data.get("html_content", "")
    slug = data.get("slug", "post")

    if not html_content:
        print(f"  [WARN] No html_content in {content_file}")
        return False

    # Write HTML file to deploy
    html_path = os.path.join(project_root, ".tmp", f"blog_{slug}.html")
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html_content)

    remote_path = f"blog/{slug}.html"
    return run_tool(project_root, "deploy_to_turbify.py", [html_path, remote_path], dry_run)

def dispatch_email(project_root, content_file, dry_run=False):
    """Send newsletter via Resend."""
    with open(content_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    subject = data.get("subject", "MindSparkAI Newsletter")
    body_html = data.get("body_html", "")

    if not body_html:
        print(f"  [WARN] No body_html in {content_file}")
        return False

    # Write HTML to temp file
    html_path = os.path.join(project_root, ".tmp", "_newsletter_temp.html")
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(body_html)

    return run_tool(project_root, "send_newsletter.py", ["--subject", subject, "--body-file", html_path], dry_run)

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

DISPATCHERS = {
    "tweets": ("twitter", dispatch_twitter),
    "linkedin": ("linkedin", None),  # needs env
    "youtube": ("youtube", dispatch_youtube),
    "tiktok": ("tiktok", dispatch_tiktok),
    "blog": ("blog", None),  # needs env
    "email": ("email", dispatch_email),
}

def show_status(queue_dir):
    """Show current queue status."""
    print("\nContent Queue Status")
    print("=" * 50)
    total = 0
    for platform in ["tweets", "linkedin", "youtube", "tiktok", "blog", "email", "scripts"]:
        files = get_queue_files(queue_dir, platform)
        count = len(files)
        total += count
        status = f"  {platform:12s}: {count} item(s)"
        if count > 0:
            status += f"  (oldest: {os.path.basename(files[0])})"
        print(status)
    print(f"\n  Total: {total} items in queue")

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    env = load_env(os.path.join(project_root, ".env"))

    queue_dir = os.path.join(project_root, ".tmp", "content_queue")
    archive_dir = os.path.join(project_root, ".tmp", "content_archive")

    args = sys.argv[1:]
    dry_run = "--dry-run" in args
    if dry_run:
        args.remove("--dry-run")

    if "--status" in args:
        show_status(queue_dir)
        return

    target_platform = None
    if "--platform" in args:
        idx = args.index("--platform")
        if idx + 1 < len(args):
            target_platform = args[idx + 1]

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    print(f"\n{'='*60}")
    print(f"Content Scheduler — {timestamp}")
    print(f"{'='*60}")
    if dry_run:
        print("[DRY-RUN MODE]")

    posted = 0
    failed = 0

    platforms_to_process = [target_platform] if target_platform else ["tweets", "linkedin", "youtube", "tiktok", "blog", "email"]

    for platform in platforms_to_process:
        files = get_queue_files(queue_dir, platform)
        if not files:
            continue

        print(f"\n--- {platform.upper()} ({len(files)} items) ---")

        for content_file in files:
            print(f"\n  Processing: {os.path.basename(content_file)}")
            success = False

            if platform == "tweets":
                success = dispatch_twitter(project_root, content_file, dry_run)
            elif platform == "linkedin":
                success = dispatch_linkedin(project_root, content_file, env, dry_run)
            elif platform == "youtube":
                success = dispatch_youtube(project_root, content_file, dry_run)
            elif platform == "tiktok":
                success = dispatch_tiktok(project_root, content_file, dry_run)
            elif platform == "blog":
                success = dispatch_blog(project_root, content_file, env, dry_run)
            elif platform == "email":
                success = dispatch_email(project_root, content_file, dry_run)

            if success:
                posted += 1
                if not dry_run:
                    archived = archive_file(content_file, archive_dir, platform)
                    print(f"  [ARCHIVED] {os.path.basename(archived)}")
            else:
                failed += 1

    print(f"\n{'='*60}")
    print(f"Summary: {posted} posted, {failed} failed")
    if dry_run:
        print("[DRY-RUN] No content was actually posted or archived.")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
