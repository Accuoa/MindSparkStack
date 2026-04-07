#!/usr/bin/env python3
"""
generate_heygen_video.py — Generate AI avatar videos via HeyGen API v2.

Usage:
  python tools/generate_heygen_video.py --script "Your script text" --aspect 9:16
  python tools/generate_heygen_video.py --script-file .tmp/content_queue/scripts/script.md --aspect 16:9
  python tools/generate_heygen_video.py --dry-run --script "Test script"
  python tools/generate_heygen_video.py --list-avatars

Options:
  --script TEXT       Script text to use directly
  --script-file PATH  Read script from a file
  --aspect RATIO      9:16 (Shorts/TikTok) or 16:9 (YouTube long-form). Default: 9:16
  --avatar ID         Avatar ID to use. Defaults to HEYGEN_DEFAULT_AVATAR from .env
  --voice ID          Voice ID to use. Defaults to HEYGEN_DEFAULT_VOICE from .env
  --title NAME        Title for the video (used in filename). Default: auto-generated
  --dry-run           Validate inputs without generating (saves credits)
  --list-avatars      List available avatars from your HeyGen account
  --poll-interval SEC Seconds between status polls. Default: 10

Reads HEYGEN_API_KEY from .env.
Output: Downloads MP4 to .tmp/videos/<date>_<title>_<aspect>.mp4
Zero external dependencies — uses only Python standard library.
"""

import json
import os
import sys
import time
from datetime import datetime
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

HEYGEN_BASE_URL = "https://api.heygen.com"

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
# HeyGen API helpers
# ---------------------------------------------------------------------------

def heygen_request(api_key, method, path, body=None):
    """Make a request to the HeyGen API."""
    url = f"{HEYGEN_BASE_URL}{path}"
    data = json.dumps(body).encode("utf-8") if body else None
    req = Request(url, data=data, method=method)
    req.add_header("X-Api-Key", api_key)
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json")

    with urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))

def list_avatars(api_key):
    """List available avatars."""
    result = heygen_request(api_key, "GET", "/v2/avatars")
    avatars = result.get("data", {}).get("avatars", [])
    print(f"\nAvailable Avatars ({len(avatars)}):")
    print("-" * 60)
    for av in avatars[:20]:
        print(f"  ID: {av.get('avatar_id', 'N/A')}")
        print(f"  Name: {av.get('avatar_name', 'N/A')}")
        print(f"  Gender: {av.get('gender', 'N/A')}")
        print()
    if len(avatars) > 20:
        print(f"  ... and {len(avatars) - 20} more")

def generate_video(api_key, script, avatar_id, voice_id, aspect_ratio="9:16", dry_run=False):
    """Generate a video via HeyGen API. Returns video_id."""
    dimension = {"9:16": {"width": 1080, "height": 1920}, "16:9": {"width": 1920, "height": 1080}}
    dims = dimension.get(aspect_ratio, dimension["9:16"])

    payload = {
        "video_inputs": [{
            "character": {
                "type": "avatar",
                "avatar_id": avatar_id,
                "avatar_style": "normal",
            },
            "voice": {
                "type": "text",
                "input_text": script,
                "voice_id": voice_id,
            },
        }],
        "dimension": dims,
    }

    if dry_run:
        print("[DRY-RUN] Would generate HeyGen video:")
        print(f"  Avatar: {avatar_id}")
        print(f"  Voice: {voice_id}")
        print(f"  Aspect: {aspect_ratio} ({dims['width']}x{dims['height']})")
        print(f"  Script length: {len(script)} chars")
        print(f"  Script preview: {script[:200]}{'...' if len(script) > 200 else ''}")
        return "dry-run-video-id"

    print(f"[INFO] Generating video ({aspect_ratio}, {len(script)} chars)...")
    result = heygen_request(api_key, "POST", "/v2/video/generate", payload)

    if result.get("error"):
        print(f"[ERROR] HeyGen API error: {result['error']}")
        return None

    video_id = result.get("data", {}).get("video_id")
    if not video_id:
        print(f"[ERROR] No video_id in response: {json.dumps(result, indent=2)}")
        return None

    print(f"[OK] Video generation started (id: {video_id})")
    return video_id

def poll_video_status(api_key, video_id, poll_interval=10, max_wait=600):
    """Poll HeyGen until video is ready. Returns video URL or None."""
    print(f"[INFO] Polling for video completion (max {max_wait}s)...")
    start = time.time()

    while time.time() - start < max_wait:
        result = heygen_request(api_key, "GET", f"/v1/video_status.get?video_id={video_id}")
        data = result.get("data", {})
        status = data.get("status", "unknown")
        print(f"  Status: {status} ({int(time.time() - start)}s elapsed)")

        if status == "completed":
            video_url = data.get("video_url")
            print(f"[OK] Video ready: {video_url}")
            return video_url
        elif status == "failed":
            error = data.get("error", "Unknown error")
            print(f"[ERROR] Video generation failed: {error}")
            return None

        time.sleep(poll_interval)

    print(f"[ERROR] Timed out after {max_wait}s waiting for video.")
    return None

def download_video(video_url, output_path):
    """Download video from URL to local file."""
    print(f"[INFO] Downloading video to {output_path}...")
    req = Request(video_url)
    with urlopen(req, timeout=120) as resp:
        with open(output_path, "wb") as f:
            while True:
                chunk = resp.read(8192)
                if not chunk:
                    break
                f.write(chunk)
    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"[OK] Video downloaded ({size_mb:.1f} MB)")
    return output_path

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    env = load_env(os.path.join(project_root, ".env"))

    api_key = env.get("HEYGEN_API_KEY")
    if not api_key:
        print("[ERROR] Missing HEYGEN_API_KEY in .env")
        sys.exit(1)

    args = sys.argv[1:]
    dry_run = "--dry-run" in args
    if dry_run:
        args.remove("--dry-run")

    # List avatars mode
    if "--list-avatars" in args:
        list_avatars(api_key)
        return

    # Parse arguments
    script = None
    aspect = "9:16"
    avatar_id = env.get("HEYGEN_DEFAULT_AVATAR", "")
    voice_id = env.get("HEYGEN_DEFAULT_VOICE", "")
    title = None
    poll_interval = 10

    i = 0
    while i < len(args):
        if args[i] == "--script" and i + 1 < len(args):
            script = args[i + 1]
            i += 2
        elif args[i] == "--script-file" and i + 1 < len(args):
            path = args[i + 1]
            if not os.path.isabs(path):
                path = os.path.join(project_root, path)
            with open(path, "r", encoding="utf-8") as f:
                script = f.read().strip()
            i += 2
        elif args[i] == "--aspect" and i + 1 < len(args):
            aspect = args[i + 1]
            i += 2
        elif args[i] == "--avatar" and i + 1 < len(args):
            avatar_id = args[i + 1]
            i += 2
        elif args[i] == "--voice" and i + 1 < len(args):
            voice_id = args[i + 1]
            i += 2
        elif args[i] == "--title" and i + 1 < len(args):
            title = args[i + 1]
            i += 2
        elif args[i] == "--poll-interval" and i + 1 < len(args):
            poll_interval = int(args[i + 1])
            i += 2
        else:
            i += 1

    if not script:
        print("Usage: python tools/generate_heygen_video.py --script \"Text\" [--aspect 9:16|16:9]")
        print("       python tools/generate_heygen_video.py --script-file path/to/script.md")
        print("       python tools/generate_heygen_video.py --list-avatars")
        sys.exit(1)

    if not avatar_id:
        print("[ERROR] No avatar ID. Use --avatar or set HEYGEN_DEFAULT_AVATAR in .env")
        sys.exit(1)
    if not voice_id:
        print("[ERROR] No voice ID. Use --voice or set HEYGEN_DEFAULT_VOICE in .env")
        sys.exit(1)

    if aspect not in ("9:16", "16:9"):
        print(f"[ERROR] Invalid aspect ratio: {aspect}. Use 9:16 or 16:9")
        sys.exit(1)

    # Generate
    video_id = generate_video(api_key, script, avatar_id, voice_id, aspect, dry_run)
    if not video_id:
        sys.exit(1)

    if dry_run:
        return

    # Poll and download
    video_url = poll_video_status(api_key, video_id, poll_interval)
    if not video_url:
        sys.exit(1)

    # Save to .tmp/videos/
    date_str = datetime.now().strftime("%Y-%m-%d")
    safe_title = (title or "video").replace(" ", "_")[:50]
    aspect_str = aspect.replace(":", "x")
    filename = f"{date_str}_{safe_title}_{aspect_str}.mp4"
    output_dir = os.path.join(project_root, ".tmp", "videos")
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, filename)

    download_video(video_url, output_path)
    print(f"\n[DONE] Video saved: {output_path}")

if __name__ == "__main__":
    main()
