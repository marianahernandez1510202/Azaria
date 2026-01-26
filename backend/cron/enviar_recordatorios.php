<?php
require_once __DIR__ . '/../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

use App\Models\Recordatorio;
use App\Services\RecordatorioService;

$service = new RecordatorioService();
$recordatorios = Recordatorio::getAll();
echo "✓ Recordatorios procesados\n";
