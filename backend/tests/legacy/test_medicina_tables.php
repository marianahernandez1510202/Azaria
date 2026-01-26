<?php
/**
 * Test script para verificar tablas de medicina
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

try {
    $db = DatabaseService::getInstance();

    echo "=== VERIFICACIÓN DE TABLAS DE MEDICINA ===\n\n";

    // Verificar tablas
    $tables = ['bitacora_glucosa', 'bitacora_presion', 'bitacora_dolor',
               'momentos_medicion', 'ubicaciones_dolor', 'tipos_dolor'];

    foreach ($tables as $table) {
        try {
            $columns = $db->query("DESCRIBE $table")->fetchAll();
            echo "Tabla '$table': EXISTE\n";
            echo "  Columnas: ";
            $cols = array_map(function($c) { return $c['Field']; }, $columns);
            echo implode(', ', $cols) . "\n";
        } catch (Exception $e) {
            echo "Tabla '$table': NO EXISTE\n";
        }
    }

    echo "\n=== DATOS DE PRUEBA ===\n";

    // Verificar pacientes
    $pacientes = $db->query("SELECT id, usuario_id FROM pacientes LIMIT 3")->fetchAll();
    echo "Pacientes: " . count($pacientes) . "\n";
    foreach ($pacientes as $p) {
        echo "  - ID: {$p['id']}, Usuario ID: {$p['usuario_id']}\n";
    }

    // Verificar datos en bitácoras
    foreach (['bitacora_glucosa', 'bitacora_presion', 'bitacora_dolor'] as $table) {
        try {
            $count = $db->query("SELECT COUNT(*) as total FROM $table")->fetch();
            echo "\nRegistros en $table: " . $count['total'] . "\n";
        } catch (Exception $e) {
            echo "\nTabla $table no accesible\n";
        }
    }

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
