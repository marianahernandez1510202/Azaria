<?php
/**
 * Verificar estructura de historial_fases
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

echo "DESCRIBE historial_fases:\n";
$columns = $db->query("DESCRIBE historial_fases")->fetchAll();
foreach ($columns as $col) {
    echo "  - {$col['Field']} ({$col['Type']})\n";
}

echo "\n\nDATOS en historial_fases:\n";
$data = $db->query("SELECT * FROM historial_fases")->fetchAll();
print_r($data);
