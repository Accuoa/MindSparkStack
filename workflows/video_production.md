# Video Production Workflow

**Owner:** SCRIBE Agent | **Last Updated:** 2026-04-07

## Objective
Produce professional AI avatar videos via HeyGen, upload to YouTube, and repurpose into short-form content for TikTok and YouTube Shorts.

---

## Pipeline Overview

```
Script → HeyGen Video → YouTube Upload → Repurpose → Shorts + Social Posts
```

### Step 1: Script Generation
- Tool: `tools/generate_content.py --platform youtube --topic "..."`
- Output: `.tmp/content_queue/scripts/<date>_<slug>.json`
- Contains: title, description, tags, full script text
- Review: Scripts over 2 min require Aiden's approval

### Step 2: Video Generation (HeyGen)
- Tool: `tools/generate_heygen_video.py`
- Long-form: `--aspect 16:9 --script-file <path>`
- Short-form: `--aspect 9:16 --script-file <path>`
- Output: `.tmp/videos/<date>_<title>_<aspect>.mp4`
- Credits: Track usage in AGENT_MEMORY.md

### Step 3: YouTube Upload
- Tool: `tools/upload_to_youtube.py`
- Long-form: `<file> --title "Title" --description "..." --tags "AI,productivity"`
- Shorts: `<file> --short --title "Title #Shorts"`
- Quota: 1,600 units per upload, 10,000/day max
- Log: `.tmp/youtube_quota.log`

### Step 4: Repurpose
- Tool: `tools/repurpose_content.py --source <youtube_json>`
- Creates: tweet thread, LinkedIn post, TikTok scripts, email content
- All outputs land in `.tmp/content_queue/<platform>/`

### Step 5: Cross-Post
- Shorts uploaded to YouTube via `upload_to_youtube.py --short`
- TikTok: manually upload from `.tmp/videos/` (9:16 format)
- Tweet notification via Zapier webhook (YouTube Upload Notify Zap)

---

## Weekly Video Schedule

| Day | Content Type | Aspect | Platform |
|-----|-------------|--------|----------|
| Wednesday | 1 Long-form video (8-12 min) | 16:9 | YouTube |
| Thursday | 2 Shorts (from Wed video) | 9:16 | YouTube Shorts + TikTok |
| Mon/Tue/Sat | 1 Short each (standalone topics) | 9:16 | YouTube Shorts + TikTok |

**Monthly totals:** ~4 long-form + ~20 shorts

---

## HeyGen Configuration

Add to `.env`:
```
HEYGEN_API_KEY=<your key>
HEYGEN_DEFAULT_AVATAR=<avatar_id>
HEYGEN_DEFAULT_VOICE=<voice_id>
```

To find your avatar/voice IDs:
```
python tools/generate_heygen_video.py --list-avatars
```

**Credit management:**
- Creator plan: limited minutes/month
- Long-form (10 min) uses ~10 min of credits
- Short (1 min) uses ~1 min of credits
- Budget: ~4 long + 20 shorts = ~60 min/month
- If credits run low: reduce shorts frequency first

---

## Video Style Guide

**Long-form (YouTube):**
- Hook in first 10 seconds
- Clear sections with timestamps
- Professional tone, educational
- [B-ROLL] markers for visual variety
- End screen: subscribe + mindsparkstack.com
- Category: Education (27)

**Short-form (Shorts/TikTok):**
- Hook in first 2 seconds
- One takeaway per video
- Fast pace, high energy
- Caption: short + 3-5 hashtags
- CTA: "Follow for more AI tips"

---

## First-Time Setup

1. Get HeyGen API key (Creator plan $24/mo)
2. Run `--list-avatars` to choose your avatar
3. Set HEYGEN_DEFAULT_AVATAR and HEYGEN_DEFAULT_VOICE in .env
4. Test with: `python tools/generate_heygen_video.py --dry-run --script "Hello world" --aspect 9:16`
5. Set up YouTube OAuth: `python tools/upload_to_youtube.py --auth`
