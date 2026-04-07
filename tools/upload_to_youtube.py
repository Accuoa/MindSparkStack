#!/usr/bin/env python3
"""
upload_to_youtube.py — Upload videos to YouTube via Data API v3.

Usage:
  python tools/upload_to_youtube.py <video_file> --title "Title" --description "Desc"
  python tools/upload_to_youtube.py <video_file> --short --title "Short title"
  python tools/upload_to_youtube.py --dry-run <video_file> --title "Test"
  python tools/upload_to_youtube.py --auth  (first-time OAuth setup)

Options:
  --title TEXT        Video title (required)
  --description TEXT  Video description
  --tags TAG1,TAG2    Comma-separated tags
  --privacy STATUS    public, unlisted, or private (default: public)
  --short             Mark as YouTube Short (adds #Shorts to title)
  --category ID       YouTube category ID (default: 27 = Education)
  --dry-run           Validate inputs without uploading
  --auth              Run OAuth2 authorization flow to get refresh token

Reads YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN from .env.
Requires: google-api-python-client google-auth-oauthlib (pip install google-api-python-client google-auth-oauthlib)

Quota: 10,000 units/day. Video upload = 1,600 units (~6 uploads/day max).
"""

import json
import os
import sys
from datetime import datetime

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
# OAuth2 setup (first-time only)
# ---------------------------------------------------------------------------

def run_auth_flow(client_id, client_secret, project_root):
    """Run OAuth2 consent flow and save refresh token."""
    try:
        from google_auth_oauthlib.flow import InstalledAppFlow
    except ImportError:
        print("[ERROR] Missing dependency: pip install google-auth-oauthlib")
        sys.exit(1)

    client_config = {
        "installed": {
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uris": ["http://localhost"],
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
        }
    }

    flow = InstalledAppFlow.from_client_config(
        client_config,
        scopes=["https://www.googleapis.com/auth/youtube.upload"],
    )
    credentials = flow.run_local_server(port=8080)
    refresh_token = credentials.refresh_token

    print(f"\n[OK] Authorization successful!")
    print(f"Add this to your .env file:")
    print(f"YOUTUBE_REFRESH_TOKEN={refresh_token}")
    return refresh_token

# ---------------------------------------------------------------------------
# YouTube upload
# ---------------------------------------------------------------------------

def get_youtube_service(client_id, client_secret, refresh_token):
    """Build authenticated YouTube API service."""
    try:
        from google.oauth2.credentials import Credentials
        from googleapiclient.discovery import build
    except ImportError:
        print("[ERROR] Missing dependencies: pip install google-api-python-client google-auth-oauthlib")
        sys.exit(1)

    credentials = Credentials(
        token=None,
        refresh_token=refresh_token,
        client_id=client_id,
        client_secret=client_secret,
        token_uri="https://oauth2.googleapis.com/token",
    )
    return build("youtube", "v3", credentials=credentials)

def upload_video(service, file_path, title, description="", tags=None, privacy="public", category="27", is_short=False, dry_run=False):
    """Upload a video to YouTube. Returns video ID."""
    if is_short and "#Shorts" not in title:
        title = f"{title} #Shorts"

    file_size_mb = os.path.getsize(file_path) / (1024 * 1024)

    if dry_run:
        print(f"[DRY-RUN] Would upload to YouTube:")
        print(f"  File: {file_path} ({file_size_mb:.1f} MB)")
        print(f"  Title: {title}")
        print(f"  Description: {description[:100]}{'...' if len(description) > 100 else ''}")
        print(f"  Tags: {tags or []}")
        print(f"  Privacy: {privacy}")
        print(f"  Category: {category} (Education)")
        print(f"  Short: {is_short}")
        print(f"  Quota cost: 1,600 units")
        return "dry-run-video-id"

    try:
        from googleapiclient.http import MediaFileUpload
    except ImportError:
        print("[ERROR] Missing dependency: pip install google-api-python-client")
        sys.exit(1)

    body = {
        "snippet": {
            "title": title,
            "description": description,
            "tags": tags or [],
            "categoryId": category,
        },
        "status": {
            "privacyStatus": privacy,
            "selfDeclaredMadeForKids": False,
        },
    }

    media = MediaFileUpload(file_path, mimetype="video/mp4", resumable=True)

    print(f"[INFO] Uploading {file_path} ({file_size_mb:.1f} MB)...")
    request = service.videos().insert(
        part="snippet,status",
        body=body,
        media_body=media,
    )

    response = None
    while response is None:
        status, response = request.next_chunk()
        if status:
            progress = int(status.progress() * 100)
            print(f"  Upload progress: {progress}%")

    video_id = response["id"]
    print(f"[OK] Video uploaded (id: {video_id})")
    print(f"  URL: https://youtube.com/watch?v={video_id}")
    return video_id

# ---------------------------------------------------------------------------
# Quota tracking
# ---------------------------------------------------------------------------

def log_quota_usage(project_root, units_used, action):
    """Log API quota usage to track daily consumption."""
    log_path = os.path.join(project_root, ".tmp", "youtube_quota.log")
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(log_path, "a", encoding="utf-8") as f:
        f.write(f"{timestamp} | {action} | {units_used} units\n")
    print(f"[INFO] Quota logged: {units_used} units for {action}")

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    env = load_env(os.path.join(project_root, ".env"))

    client_id = env.get("YOUTUBE_CLIENT_ID", "")
    client_secret = env.get("YOUTUBE_CLIENT_SECRET", "")
    refresh_token = env.get("YOUTUBE_REFRESH_TOKEN", "")

    args = sys.argv[1:]
    dry_run = "--dry-run" in args
    if dry_run:
        args.remove("--dry-run")

    # Auth mode
    if "--auth" in args:
        if not client_id or not client_secret:
            print("[ERROR] Missing YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET in .env")
            sys.exit(1)
        run_auth_flow(client_id, client_secret, project_root)
        return

    if not all([client_id, client_secret, refresh_token]):
        print("[ERROR] Missing YouTube credentials in .env")
        print("Required: YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN")
        print("Run: python tools/upload_to_youtube.py --auth  (to set up OAuth)")
        sys.exit(1)

    # Parse arguments
    file_path = None
    title = None
    description = ""
    tags = []
    privacy = "public"
    category = "27"
    is_short = "--short" in args
    if is_short:
        args.remove("--short")

    i = 0
    while i < len(args):
        if args[i] == "--title" and i + 1 < len(args):
            title = args[i + 1]
            i += 2
        elif args[i] == "--description" and i + 1 < len(args):
            description = args[i + 1]
            i += 2
        elif args[i] == "--tags" and i + 1 < len(args):
            tags = [t.strip() for t in args[i + 1].split(",")]
            i += 2
        elif args[i] == "--privacy" and i + 1 < len(args):
            privacy = args[i + 1]
            i += 2
        elif args[i] == "--category" and i + 1 < len(args):
            category = args[i + 1]
            i += 2
        elif not args[i].startswith("--"):
            file_path = args[i]
            i += 1
        else:
            i += 1

    if not file_path or not title:
        print("Usage: python tools/upload_to_youtube.py <video_file> --title \"Title\" [options]")
        print("       python tools/upload_to_youtube.py --auth")
        sys.exit(1)

    if not os.path.isabs(file_path):
        file_path = os.path.join(project_root, file_path)

    if not os.path.isfile(file_path):
        print(f"[ERROR] Video file not found: {file_path}")
        sys.exit(1)

    if not dry_run:
        service = get_youtube_service(client_id, client_secret, refresh_token)
    else:
        service = None

    video_id = upload_video(service, file_path, title, description, tags, privacy, category, is_short, dry_run)

    if video_id and not dry_run:
        log_quota_usage(project_root, 1600, f"upload {'short' if is_short else 'video'}: {title}")

    sys.exit(0 if video_id else 1)

if __name__ == "__main__":
    main()
