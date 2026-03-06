#!/usr/bin/env python3
"""Deploy script for Azaria - uploads frontend build and backend to server."""

import paramiko
import os
import sys

SERVER = "dtai.uteq.edu.mx"
USER = "azaria"
PASSWORD = "Azhar1aa_2026*"
REMOTE_PUBLIC = "/home/aazaria/public_html"
REMOTE_API = "/home/aazaria/public_html/api"
REMOTE_BACKEND = "/home/aazaria/backend"

def create_ssh_client():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print(f"Connecting to {SERVER}...")
    ssh.connect(SERVER, username=USER, password=PASSWORD, timeout=30)
    print("Connected!")
    return ssh

def ensure_remote_dir(sftp, path):
    parts = path.split("/")
    current = ""
    for part in parts:
        if not part:
            current = "/"
            continue
        current = current + "/" + part if current != "/" else "/" + part
        try:
            sftp.stat(current)
        except FileNotFoundError:
            try:
                sftp.mkdir(current)
                print(f"  Created: {current}")
            except:
                pass

def upload_directory(sftp, local_dir, remote_dir, label=""):
    count = 0
    for item in os.listdir(local_dir):
        local_path = os.path.join(local_dir, item)
        remote_path = remote_dir + "/" + item

        if os.path.isfile(local_path):
            try:
                sftp.put(local_path, remote_path)
                count += 1
            except Exception as e:
                print(f"  ERROR uploading {item}: {e}")
        elif os.path.isdir(local_path):
            ensure_remote_dir(sftp, remote_path)
            count += upload_directory(sftp, local_path, remote_path, label)

    return count

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_build = os.path.join(base_dir, "frontend", "build")
    backend_dir = os.path.join(base_dir, "backend")

    if not os.path.exists(frontend_build):
        print("ERROR: frontend/build not found.")
        sys.exit(1)

    ssh = create_ssh_client()
    sftp = ssh.open_sftp()

    try:
        # =============================================
        # 1. FRONTEND BUILD -> ~/public_html/
        # =============================================
        print(f"\n{'='*50}")
        print(f"1/3 - Uploading FRONTEND to {REMOTE_PUBLIC}/")
        print(f"{'='*50}")
        count = upload_directory(sftp, frontend_build, REMOTE_PUBLIC)
        print(f"  -> {count} frontend files uploaded")

        # =============================================
        # 2. BACKEND -> ~/public_html/api/ (served by Apache)
        # =============================================
        print(f"\n{'='*50}")
        print(f"2/3 - Uploading BACKEND to {REMOTE_API}/")
        print(f"{'='*50}")

        # Upload src/
        api_count = 0
        for subdir in ["src", "config"]:
            local_sub = os.path.join(backend_dir, subdir)
            if os.path.exists(local_sub):
                remote_sub = REMOTE_API + "/" + subdir
                ensure_remote_dir(sftp, remote_sub)
                n = upload_directory(sftp, local_sub, remote_sub)
                api_count += n
                print(f"  -> {subdir}/: {n} files")

        # Upload public/index.php as api/index.php
        index_path = os.path.join(backend_dir, "public", "index.php")
        if os.path.exists(index_path):
            sftp.put(index_path, REMOTE_API + "/index.php")
            api_count += 1
            print(f"  -> index.php: uploaded")

        # Upload .htaccess for Apache URL rewriting
        htaccess_path = os.path.join(backend_dir, "public", ".htaccess")
        if os.path.exists(htaccess_path):
            sftp.put(htaccess_path, REMOTE_API + "/.htaccess")
            api_count += 1
            print(f"  -> .htaccess: uploaded")

        # Upload production .env
        env_prod_path = os.path.join(backend_dir, ".env.production")
        if os.path.exists(env_prod_path):
            sftp.put(env_prod_path, REMOTE_API + "/.env")
            api_count += 1
            print(f"  -> .env (production): uploaded")

        print(f"  -> {api_count} total API files uploaded")

        # =============================================
        # 3. BACKEND COPY -> ~/backend/ (mirror)
        # =============================================
        print(f"\n{'='*50}")
        print(f"3/3 - Uploading BACKEND COPY to {REMOTE_BACKEND}/")
        print(f"{'='*50}")

        backend_count = 0
        for subdir in ["src", "config", "public"]:
            local_sub = os.path.join(backend_dir, subdir)
            if os.path.exists(local_sub):
                remote_sub = REMOTE_BACKEND + "/" + subdir
                ensure_remote_dir(sftp, remote_sub)
                n = upload_directory(sftp, local_sub, remote_sub)
                backend_count += n
                print(f"  -> {subdir}/: {n} files")

        # Ensure uploads dirs exist
        for d in ["uploads", "uploads/planes_nutricionales", "uploads/perfiles", "uploads/expedientes"]:
            ensure_remote_dir(sftp, REMOTE_BACKEND + "/" + d)
        for d in ["storage", "storage/planes_nutricionales"]:
            ensure_remote_dir(sftp, REMOTE_API + "/" + d)

        print(f"  -> {backend_count} total backend files uploaded")

        # =============================================
        # DONE
        # =============================================
        total = count + api_count + backend_count
        print(f"\n{'='*50}")
        print(f"DEPLOY COMPLETE - {total} files total")
        print(f"{'='*50}")
        print(f"URL: https://dtai.uteq.edu.mx/~azaria/")

    finally:
        sftp.close()
        ssh.close()

if __name__ == "__main__":
    main()
