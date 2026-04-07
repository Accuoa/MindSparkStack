# Content Calendar

**Owner:** SCRIBE Agent | **Last Updated:** 2026-04-07

## Weekly Template

| Day | Long-form | Short-form Video | Text Posts | Email |
|-----|-----------|-----------------|------------|-------|
| Mon | -- | 1 TikTok/Short | 1 Tweet + 1 LinkedIn | -- |
| Tue | -- | 1 TikTok/Short | 2 Tweets | -- |
| Wed | 1 YouTube video | -- | 1 Tweet (video promo) | -- |
| Thu | -- | 2 Shorts (from Wed video) | 1 Tweet + 1 LinkedIn | -- |
| Fri | 1 Blog post | 1 TikTok/Short | 1 Tweet thread | Newsletter |
| Sat | -- | 1 TikTok/Short | 1 Tweet | -- |
| Sun | -- | -- | Rest / batch plan | -- |

## Monthly Volume Targets

| Content Type | Monthly Target | Tool |
|-------------|---------------|------|
| YouTube long-form videos | 4 | generate_heygen_video.py (16:9) |
| YouTube Shorts | 16-20 | generate_heygen_video.py (9:16) |
| TikTok videos | 20-24 | Same 9:16 videos, manual upload |
| Tweets | 100-120 | post_to_twitter.py |
| Tweet threads | 8-12 | post_to_twitter.py --thread |
| LinkedIn posts | 40 | trigger_zapier.py (LinkedIn webhook) |
| Blog posts | 4 | deploy_to_turbify.py |
| Email newsletters | 4 | send_newsletter.py |
| **Total** | **~200 pieces** | |

## Content Pillars

Rotate through these 5 pillars to keep content varied:

1. **Prompts** -- Prompt engineering, frameworks, common mistakes, copy-paste templates
2. **Workflows** -- AI-powered productivity systems, automation, time-saving hacks
3. **Tools** -- AI tool reviews, comparisons, setup guides, stack recommendations
4. **Agents** -- Building AI agents, autonomous systems, agent frameworks, use cases
5. **Mindset** -- Adapting to AI, career future-proofing, ethical AI use, industry trends

**Rotation:** Each weekday focuses on a different pillar (Mon=Prompts, Tue=Workflows, Wed=Tools, Thu=Agents, Fri=Mindset). Weekends are flexible.

## Content Queue Structure

```
.tmp/content_queue/
  tweets/     -- JSON files with tweet text or thread arrays
  linkedin/   -- JSON files with LinkedIn post text
  youtube/    -- JSON with title, description, tags, video_path
  tiktok/     -- JSON with caption, video_path, hashtags
  blog/       -- JSON with title, slug, html_content
  email/      -- JSON with subject, preview_text, body_html
  scripts/    -- Raw video scripts for HeyGen
```

## 1-to-Many Repurposing Flow

Every Wednesday YouTube video produces:
- 2-3 YouTube Shorts (Thursday)
- 2-3 TikTok videos (Thursday-Saturday)
- 1 Tweet thread (Thursday)
- 1 LinkedIn post (Thursday)

Every Friday blog post produces:
- 1 Tweet thread (Friday)
- 1 LinkedIn post (Friday)
- Newsletter content (Friday)

## Execution

The content scheduler runs hourly (8AM-8PM ET):
```
python tools/content_scheduler.py
```

Check queue status:
```
python tools/content_scheduler.py --status
```

Generate content for a specific platform:
```
python tools/generate_content.py --platform twitter --topic "5 ChatGPT prompts for email"
```

Repurpose long-form content:
```
python tools/repurpose_content.py --source .tmp/content_queue/youtube/2026-04-09_video.json
```
