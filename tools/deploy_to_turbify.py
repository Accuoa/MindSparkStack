#!/usr/bin/env python3
"""
deploy_to_turbify.py — Upload files/folders to Turbify via FTP.

Usage:
  python tools/deploy_to_turbify.py <local_path> [remote_path]
  python tools/deploy_to_turbify.py --dry-run <local_path> [remote_path]
  python tools/deploy_to_turbify.py --list [remote_path]

Examples:
  # Upload a single file
  python tools/deploy_to_turbify.py course/verify.html course/verify.html

  # Upload entire course folder
  python tools/deploy_to_turbify.py course/ course/

  # Preview what would be uploaded
  python tools/deploy_to_turbify.py --dry-run course/ course/

  # List remote directory contents
  python tools/deploy_to_turbify.py --list course/shared/

Reads credentials from .env in the project root.
Zero external dependencies — uses only Python standard library.
"""

import ftplib
import os
import sys

# ---------------------------------------------------------------------------
# .env loader (no external deps)
# ---------------------------------------------------------------------------

def load_env(env_path):
    """Parse a .env file into a dict. Handles quotes and comments."""
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
            key = key.strip()
            value = value.strip().strip("'\"")
            env[key] = value
    return env

# ---------------------------------------------------------------------------
# FTP helpers
# ---------------------------------------------------------------------------

SKIP_NAMES = {".git", "node_modules", ".env", ".tmp", "__pycache__", ".DS_Store"}

def ftp_connect(host, user, passwd):
    """Connect and login via explicit FTPS, return the FTP object."""
    # Try explicit FTPS first, fall back to plain FTP
    try:
        ftp = ftplib.FTP_TLS()
        ftp.connect(host, 21, timeout=30)
        ftp.login(user, passwd)
        ftp.prot_p()  # Switch to secure data connection
        print(f"[OK] Connected to {host} as {user} (FTPS)")
    except Exception:
        ftp = ftplib.FTP()
        ftp.connect(host, 21, timeout=30)
        ftp.login(user, passwd)
        print(f"[OK] Connected to {host} as {user} (FTP)")
    ftp.encoding = "utf-8"
    return ftp

def ftp_ensure_dir(ftp, remote_dir):
    """Recursively create remote directories if they don't exist."""
    if not remote_dir or remote_dir == "/":
        return
    parts = remote_dir.replace("\\", "/").strip("/").split("/")
    path = ""
    for part in parts:
        path = path + "/" + part
        try:
            ftp.cwd(path)
        except ftplib.error_perm:
            ftp.mkd(path)
            ftp.cwd(path)

def ftp_upload_file(ftp, local_path, remote_path, dry_run=False):
    """Upload a single file."""
    remote_path = remote_path.replace("\\", "/")
    remote_dir = "/".join(remote_path.split("/")[:-1])
    if remote_dir:
        if not dry_run:
            ftp_ensure_dir(ftp, remote_dir)
    if dry_run:
        size = os.path.getsize(local_path)
        print(f"  [DRY-RUN] {local_path} -> {remote_path} ({size:,} bytes)")
        return
    with open(local_path, "rb") as f:
        ftp.storbinary(f"STOR {remote_path}", f)
    size = os.path.getsize(local_path)
    print(f"  [UPLOADED] {local_path} -> {remote_path} ({size:,} bytes)")

def ftp_upload_tree(ftp, local_dir, remote_base, dry_run=False):
    """Recursively upload a directory tree."""
    local_dir = local_dir.rstrip("/\\")
    count = 0
    for root, dirs, files in os.walk(local_dir):
        # Filter out skip dirs in-place
        dirs[:] = [d for d in dirs if d not in SKIP_NAMES]
        for fname in files:
            if fname in SKIP_NAMES:
                continue
            local_path = os.path.join(root, fname)
            # Build remote path: replace local_dir prefix with remote_base
            rel = os.path.relpath(local_path, local_dir).replace("\\", "/")
            remote_path = remote_base.rstrip("/") + "/" + rel
            ftp_upload_file(ftp, local_path, remote_path, dry_run)
            count += 1
    return count

def ftp_list_dir(ftp, remote_path):
    """List contents of a remote directory."""
    full_path = remote_path.replace("\\", "/").strip("/")
    if full_path:
        full_path = "/" + full_path
    else:
        full_path = "/"
    try:
        ftp.cwd(full_path)
    except ftplib.error_perm as e:
        print(f"[ERROR] Cannot access {full_path}: {e}")
        return
    print(f"\nContents of {full_path}/:")
    print("-" * 60)
    ftp.retrlines("LIST")
    print("-" * 60)

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    # Locate project root (where .env lives)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    env_path = os.path.join(project_root, ".env")
    env = load_env(env_path)

    host = env.get("TURBIFY_FTP_HOST")
    user = env.get("TURBIFY_FTP_USER")
    passwd = env.get("TURBIFY_FTP_PASS")
    ftp_root = env.get("TURBIFY_FTP_ROOT", "public_html")

    if not all([host, user, passwd]):
        print("[ERROR] Missing FTP credentials in .env")
        print("Required: TURBIFY_FTP_HOST, TURBIFY_FTP_USER, TURBIFY_FTP_PASS")
        sys.exit(1)

    args = sys.argv[1:]
    dry_run = False
    list_mode = False

    if "--dry-run" in args:
        dry_run = True
        args.remove("--dry-run")

    if "--list" in args:
        list_mode = True
        args.remove("--list")

    # --- List mode ---
    if list_mode:
        remote_path = ftp_root
        if args:
            remote_path = ftp_root + "/" + args[0].strip("/")
        ftp = ftp_connect(host, user, passwd)
        ftp_list_dir(ftp, remote_path)
        ftp.quit()
        return

    # --- Upload mode ---
    if len(args) < 1:
        print("Usage: python tools/deploy_to_turbify.py [--dry-run] <local_path> [remote_path]")
        print("       python tools/deploy_to_turbify.py --list [remote_path]")
        sys.exit(1)

    local_path = args[0]
    # Default remote_path = same as local_path
    remote_rel = args[1] if len(args) > 1 else local_path
    remote_path = ftp_root + "/" + remote_rel.replace("\\", "/").strip("/")

    # Resolve local path relative to project root
    if not os.path.isabs(local_path):
        local_path = os.path.join(project_root, local_path)

    if not os.path.exists(local_path):
        print(f"[ERROR] Local path not found: {local_path}")
        sys.exit(1)

    ftp = None
    if not dry_run:
        ftp = ftp_connect(host, user, passwd)

    if dry_run:
        print(f"\n[DRY-RUN] Would upload to {host}:{remote_path}")
        print("-" * 60)

    if os.path.isfile(local_path):
        ftp_upload_file(ftp, local_path, remote_path, dry_run)
        count = 1
    else:
        count = ftp_upload_tree(ftp, local_path, remote_path, dry_run)

    if dry_run:
        print("-" * 60)
        print(f"[DRY-RUN] {count} file(s) would be uploaded.")
    else:
        print(f"\n[DONE] {count} file(s) uploaded successfully.")
        ftp.quit()

if __name__ == "__main__":
    main()
