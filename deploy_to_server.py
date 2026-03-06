#!/usr/bin/env python3
"""Deploy Azaria to dtai.uteq.edu.mx"""
import paramiko
import os
import posixpath
import sys

HOST = 'dtai.uteq.edu.mx'
USER = 'azaria'
SSH_PASS = 'Azhar1aa_2026*'
DB_PASS = '12345'
DB_NAME = 'azaria'

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def create_ssh():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=SSH_PASS, timeout=30)
    return ssh

def run_cmd(ssh, cmd):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=120)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    code = stdout.channel.recv_exit_status()
    return out, err, code

def sftp_mkdir_p(sftp, remote_dir):
    """Create remote directory recursively using posixpath"""
    dirs_to_create = []
    d = remote_dir
    while d and d != '/':
        try:
            sftp.stat(d)
            break
        except (FileNotFoundError, IOError):
            dirs_to_create.append(d)
            d = posixpath.dirname(d)
    for d in reversed(dirs_to_create):
        try:
            sftp.mkdir(d)
        except Exception:
            pass

def upload_dir(sftp, local_dir, remote_dir, label=''):
    """Upload a directory recursively via SFTP"""
    all_files = []
    for root, dirs, files in os.walk(local_dir):
        rel = os.path.relpath(root, local_dir).replace('\\', '/')
        if rel == '.':
            remote_root = remote_dir
        else:
            remote_root = remote_dir + '/' + rel
        sftp_mkdir_p(sftp, remote_root)
        for f in files:
            local_f = os.path.join(root, f)
            remote_f = remote_root + '/' + f
            all_files.append((local_f, remote_f))

    total = len(all_files)
    errors = 0
    for i, (local_f, remote_f) in enumerate(all_files):
        if (i + 1) % 25 == 0 or (i + 1) == total:
            print(f'  [{label}] {i+1}/{total}...')
        try:
            sftp.put(local_f, remote_f)
        except Exception as e:
            errors += 1
            if errors <= 3:
                print(f'  ERROR: {os.path.basename(remote_f)}: {e}')
    if errors > 3:
        print(f'  ... y {errors - 3} errores mas')
    if errors == 0:
        print(f'  [{label}] {total} archivos OK')
    else:
        print(f'  [{label}] {total - errors}/{total} archivos OK')

def main():
    print('=' * 50)
    print('DEPLOY AZARIA -> dtai.uteq.edu.mx')
    print('=' * 50)

    print('\n[1/5] Conectando...')
    try:
        ssh = create_ssh()
        sftp = ssh.open_sftp()
        print('  OK')
    except Exception as e:
        print(f'  ERROR: {e}')
        sys.exit(1)

    print('\n[2/5] Estructura del servidor:')
    out, _, _ = run_cmd(ssh, 'ls ~/public_html/')
    print(f'  public_html/: {out.strip()}')

    # 3. Frontend
    print('\n[3/5] Subiendo frontend...')
    build_dir = os.path.join(BASE_DIR, 'frontend', 'build')
    if os.path.exists(build_dir):
        upload_dir(sftp, build_dir, '/home/aazaria/public_html', 'frontend')
    else:
        print('  ERROR: ejecuta npm run build primero')

    # 4. Backend
    print('\n[4/5] Subiendo backend...')
    backend_dir = os.path.join(BASE_DIR, 'backend')
    remote_be = '/home/aazaria/backend'
    sftp_mkdir_p(sftp, remote_be + '/uploads')
    for subdir in ['src', 'config', 'public']:
        local_sub = os.path.join(backend_dir, subdir)
        if os.path.exists(local_sub):
            upload_dir(sftp, local_sub, f'{remote_be}/{subdir}', f'be/{subdir}')

    # 5. Migraciones
    print('\n[5/5] Migraciones...')
    mig_dir = os.path.join(BASE_DIR, 'database', 'migrations')
    sftp_mkdir_p(sftp, '/home/aazaria/database/migrations')
    if os.path.exists(mig_dir):
        mig_files = sorted(f for f in os.listdir(mig_dir) if f.endswith('.sql'))
        for mf in mig_files:
            local_mf = os.path.join(mig_dir, mf)
            remote_mf = f'/home/aazaria/database/migrations/{mf}'
            try:
                sftp.put(local_mf, remote_mf)
            except Exception as e:
                print(f'  ERROR subiendo {mf}: {e}')
                continue
            print(f'  {mf}', end=' -> ')
            out, err, code = run_cmd(ssh, f"mysql -u {USER} -p'{DB_PASS}' {DB_NAME} < '{remote_mf}' 2>&1")
            r = (out + err).strip()
            print('OK' if code == 0 else f'AVISO: {r[:150]}')

    sftp.close()
    ssh.close()
    print('\n' + '=' * 50)
    print('DEPLOY COMPLETADO')
    print('https://dtai.uteq.edu.mx/~azaria/')
    print('=' * 50)

if __name__ == '__main__':
    main()