<?php
require_once __DIR__ . '/../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

use App\Services\DatabaseService;

$db = DatabaseService::getInstance();
$db->query("DELETE FROM mensajes WHERE created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)");
echo "✓ Mensajes antiguos eliminados\n";
