<?php
/**
 * Verificar tabla recordatorios
 */

header('Content-Type: text/plain; charset=utf-8');

// Autoload
spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $baseDir = __DIR__ . '/../src/';
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }
    $relativeClass = substr($class, $len);
    $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';
    if (file_exists($file)) {
        require $file;
    }
});

require_once __DIR__ . '/../config/constants.php';

use App\Services\DatabaseService;

$db = DatabaseService::getInstance();

echo "DESCRIBE recordatorios:\n";
$columns = $db->query("DESCRIBE recordatorios")->fetchAll();
foreach ($columns as $col) {
    echo "  - {$col['Field']} ({$col['Type']})\n";
}

echo "\n\nDATOS en recordatorios (sample):\n";
$data = $db->query("SELECT * FROM recordatorios LIMIT 3")->fetchAll();
print_r($data);
