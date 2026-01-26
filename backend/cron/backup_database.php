<?php
$backupFile = __DIR__ . '/../storage/backups/backup_' . date('Y-m-d') . '.sql';
$dbName = $_ENV['DB_NAME'] ?? 'vitalia_v2';
$command = "mysqldump -u root -p $dbName > $backupFile";
exec($command);
echo "✓ Backup creado: $backupFile\n";
