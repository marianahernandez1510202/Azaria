<?php
header('Content-Type: text/plain');
spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $baseDir = __DIR__ . '/../src/';
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) return;
    $relativeClass = substr($class, $len);
    $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';
    if (file_exists($file)) require $file;
});
require_once __DIR__ . '/../config/constants.php';

use App\Services\DatabaseService;
$db = DatabaseService::getInstance();

// Check checklist_comidas
try {
    $cols = $db->query("DESCRIBE checklist_comidas")->fetchAll();
    echo "checklist_comidas EXISTE:\n";
    foreach($cols as $c) echo "  - {$c['Field']}\n";
} catch(Exception $e) {
    echo "checklist_comidas NO EXISTE - creando...\n";
    $db->query("CREATE TABLE checklist_comidas (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        paciente_id INT UNSIGNED NOT NULL,
        fecha DATE NOT NULL,
        items JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_paciente_fecha (paciente_id, fecha)
    )");
    echo "TABLA CREADA\n";
}

// Check registro_comidas
try {
    $cols = $db->query("DESCRIBE registro_comidas")->fetchAll();
    echo "\nregistro_comidas EXISTE:\n";
    foreach($cols as $c) echo "  - {$c['Field']}\n";
} catch(Exception $e) {
    echo "\nregistro_comidas NO EXISTE\n";
}

// Check tipos_comida
try {
    $tipos = $db->query("SELECT * FROM tipos_comida")->fetchAll();
    echo "\ntipos_comida (" . count($tipos) . " registros):\n";
    foreach($tipos as $t) echo "  {$t['id']}: {$t['nombre']}\n";
} catch(Exception $e) {
    echo "\ntipos_comida: " . $e->getMessage() . "\n";
}
