<?php
require_once __DIR__ . '/../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

use App\Services\DatabaseService;

$db = DatabaseService::getInstance();
$db->query("DELETE FROM password_recovery WHERE expires_at < NOW()");
$db->query("DELETE FROM blacklisted_tokens WHERE blacklisted_at < DATE_SUB(NOW(), INTERVAL 30 DAY)");
echo "✓ Tokens expirados eliminados\n";
