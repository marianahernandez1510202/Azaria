<?php
/**
 * Verificar tablas de fisioterapia
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

echo "=== TABLAS DE FISIOTERAPIA ===\n\n";

$tables = ['videos_ejercicios', 'videos_asignados', 'guias_cuidado', 'checklist_protesis'];

foreach ($tables as $table) {
    try {
        $columns = $db->query("DESCRIBE $table")->fetchAll();
        echo "TABLA: $table\n";
        foreach ($columns as $col) {
            echo "  - {$col['Field']} ({$col['Type']})\n";
        }

        $count = $db->query("SELECT COUNT(*) as total FROM $table")->fetch();
        echo "  Registros: {$count['total']}\n\n";
    } catch (Exception $e) {
        echo "TABLA: $table - NO EXISTE\n\n";
    }
}
