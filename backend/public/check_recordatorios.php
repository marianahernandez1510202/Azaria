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

// Check recordatorios
try {
    $cols = $db->query("DESCRIBE recordatorios")->fetchAll();
    echo "recordatorios EXISTE:\n";
    foreach($cols as $c) echo "  - {$c['Field']} ({$c['Type']}) {$c['Null']}\n";
} catch(Exception $e) {
    echo "recordatorios: " . $e->getMessage() . "\n";
}

// Check tipos_recordatorio
echo "\n";
try {
    $tipos = $db->query("SELECT * FROM tipos_recordatorio")->fetchAll();
    echo "tipos_recordatorio (" . count($tipos) . " registros):\n";
    foreach($tipos as $t) echo "  {$t['id']}: {$t['nombre']}\n";
} catch(Exception $e) {
    echo "tipos_recordatorio: " . $e->getMessage() . "\n";
}

// Check videos_ejercicios
echo "\n";
try {
    $cols = $db->query("DESCRIBE videos_ejercicios")->fetchAll();
    echo "videos_ejercicios EXISTE:\n";
    foreach($cols as $c) echo "  - {$c['Field']}\n";
} catch(Exception $e) {
    echo "videos_ejercicios: " . $e->getMessage() . "\n";
}

// Check guias_cuidado
echo "\n";
try {
    $cols = $db->query("DESCRIBE guias_cuidado")->fetchAll();
    echo "guias_cuidado EXISTE:\n";
    foreach($cols as $c) echo "  - {$c['Field']}\n";
} catch(Exception $e) {
    echo "guias_cuidado: " . $e->getMessage() . "\n";
}
