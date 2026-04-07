# Deploy to Turbify

## Objective
Upload local files to the Turbify web server via FTP so changes go live on mindsparkstack.com.

## When to Use
- Any time course files, homepage, or static assets need updating on the live site
- After modifying any file in `course/`, `homepage-source.html`, or other web-facing content

## Required Inputs
- **Local path**: file or folder to upload (relative to project root)
- **Remote path**: destination on Turbify (relative to `public_html/`)

## Tool
`tools/deploy_to_turbify.py`

## Credentials
Stored in `.env`:
- `TURBIFY_FTP_HOST`
- `TURBIFY_FTP_USER`
- `TURBIFY_FTP_PASS`
- `TURBIFY_FTP_ROOT` (default: `public_html`)

## Commands

```bash
# Upload a single file
python tools/deploy_to_turbify.py course/verify.html course/verify.html

# Upload entire course folder
python tools/deploy_to_turbify.py course/ course/

# Preview without uploading
python tools/deploy_to_turbify.py --dry-run course/ course/

# List remote directory contents
python tools/deploy_to_turbify.py --list course/shared/
```

## Skipped Files
The script automatically skips: `.git/`, `node_modules/`, `.env`, `.tmp/`, `__pycache__/`, `.DS_Store`

## Edge Cases
- If a remote directory doesn't exist, the script creates it automatically
- If uploading fails mid-batch, re-run the same command — FTP overwrites existing files
- For the homepage, the remote path is just the filename: `python tools/deploy_to_turbify.py homepage-source.html homepage-source.html`
