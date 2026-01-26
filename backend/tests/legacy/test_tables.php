<?php
/**
 * Verificar tablas de la base de datos
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

echo "=== TABLAS EN LA BASE DE DATOS ===\n\n";

$db = DatabaseService::getInstance();

$tables = $db->query("SHOW TABLES")->fetchAll(\PDO::FETCH_COLUMN);

echo "Tablas encontradas: " . count($tables) . "\n\n";
foreach ($tables as $table) {
    echo "- $table\n";
}

echo "\n=== VERIFICANDO TABLAS CRÍTICAS ===\n";

$criticalTables = ['fases', 'pacientes', 'usuarios', 'roles', 'areas_medicas'];

foreach ($criticalTables as $table) {
    try {
        $columns = $db->query("DESCRIBE $table")->fetchAll();
        echo "\n$table: EXISTE (" . count($columns) . " columnas)\n";
    } catch (Exception $e) {
        echo "\n$table: NO EXISTE - Necesita ser creada\n";
    }
}
