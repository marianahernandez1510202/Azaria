<?php
/**
 * Test completo de API de Medicina
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

use App\Controllers\MedicinaController;
use App\Services\DatabaseService;

echo "=== TEST API MEDICINA ===\n\n";

$db = DatabaseService::getInstance();
$controller = new MedicinaController();

// Obtener un paciente de prueba
$paciente = $db->query("SELECT id FROM pacientes LIMIT 1")->fetch();
$pacienteId = $paciente['id'];

echo "Usando paciente_id: $pacienteId\n\n";

// Test 1: getGlucosa
echo "1. TEST getGlucosa($pacienteId)\n";
echo "-----------------------------------\n";
ob_start();
$controller->getGlucosa($pacienteId);
$output = ob_get_clean();
$data = json_decode($output, true);
echo "Respuesta success: " . ($data['success'] ? 'SI' : 'NO') . "\n";
echo "Registros: " . count($data['data'] ?? []) . "\n";
if (!empty($data['data'])) {
    echo "Primer registro: " . json_encode($data['data'][0]) . "\n";
}
echo "\n";

// Test 2: getPresion
echo "2. TEST getPresion($pacienteId)\n";
echo "-----------------------------------\n";
ob_start();
$controller->getPresion($pacienteId);
$output = ob_get_clean();
$data = json_decode($output, true);
echo "Respuesta success: " . ($data['success'] ? 'SI' : 'NO') . "\n";
echo "Registros: " . count($data['data'] ?? []) . "\n";
if (!empty($data['data'])) {
    echo "Primer registro: " . json_encode($data['data'][0]) . "\n";
}
echo "\n";

// Test 3: getDolor
echo "3. TEST getDolor($pacienteId)\n";
echo "-----------------------------------\n";
ob_start();
$controller->getDolor($pacienteId);
$output = ob_get_clean();
$data = json_decode($output, true);
echo "Respuesta success: " . ($data['success'] ? 'SI' : 'NO') . "\n";
echo "Registros: " . count($data['data'] ?? []) . "\n";
if (!empty($data['data'])) {
    echo "Primer registro: " . json_encode($data['data'][0]) . "\n";
}
echo "\n";

// Test 4: getResumen
echo "4. TEST getResumen($pacienteId)\n";
echo "-----------------------------------\n";
ob_start();
$controller->getResumen($pacienteId);
$output = ob_get_clean();
$data = json_decode($output, true);
echo "Respuesta success: " . ($data['success'] ? 'SI' : 'NO') . "\n";
echo "Resumen: " . json_encode($data['data']) . "\n";
echo "\n";

echo "=== TESTS COMPLETADOS ===\n";
