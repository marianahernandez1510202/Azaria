<?php
/**
 * Test de Fase
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

use App\Models\Fase;

echo "=== TEST FASE MODEL ===\n\n";

$pacienteId = 1;

echo "1. getCurrentFase($pacienteId):\n";
$faseActual = Fase::getCurrentFase($pacienteId);
print_r($faseActual);

echo "\n\n2. getProgreso($pacienteId):\n";
$progreso = Fase::getProgreso($pacienteId);
print_r($progreso);

echo "\n\n3. getEstadisticas($pacienteId):\n";
$stats = Fase::getEstadisticas($pacienteId);
print_r($stats);

echo "\n\n4. getAllFases():\n";
$fases = Fase::getAllFases();
print_r($fases);

echo "\n\n=== TESTS COMPLETADOS ===\n";
