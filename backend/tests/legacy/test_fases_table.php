<?php
/**
 * Verificar estructura de tablas de fases
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

echo "=== ESTRUCTURA DE TABLAS DE FASES ===\n\n";

$db = DatabaseService::getInstance();

// Verificar fases_tratamiento
echo "DESCRIBE fases_tratamiento:\n";
$columns = $db->query("DESCRIBE fases_tratamiento")->fetchAll();
foreach ($columns as $col) {
    echo "  - {$col['Field']} ({$col['Type']})\n";
}

echo "\n\nDATOS en fases_tratamiento:\n";
$fases = $db->query("SELECT * FROM fases_tratamiento")->fetchAll();
foreach ($fases as $fase) {
    echo "  ID: {$fase['id']} - Nombre: {$fase['nombre']}\n";
}

echo "\n\nDESCRIBE pacientes:\n";
$columns = $db->query("DESCRIBE pacientes")->fetchAll();
foreach ($columns as $col) {
    echo "  - {$col['Field']} ({$col['Type']})\n";
}

echo "\n\nDATOS pacientes:\n";
$pacientes = $db->query("SELECT * FROM pacientes LIMIT 3")->fetchAll();
print_r($pacientes);
