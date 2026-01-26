<?php
/**
 * Test de endpoint de Perfil
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

use App\Controllers\PerfilController;
use App\Services\DatabaseService;

echo "=== TEST PERFIL ===\n\n";

$db = DatabaseService::getInstance();

// Obtener un usuario de prueba
$user = $db->query("SELECT id FROM usuarios WHERE rol_id = 3 LIMIT 1")->fetch();
$userId = $user['id'];

echo "Probando con usuario ID: $userId\n\n";

$controller = new PerfilController();

echo "Llamando getPerfil($userId)...\n";
ob_start();
$controller->getPerfil($userId);
$output = ob_get_clean();

echo "Respuesta:\n$output\n";

$data = json_decode($output, true);
if ($data && $data['success']) {
    echo "\n=== DATOS DEL PERFIL ===\n";
    echo "Nombre: " . ($data['data']['nombre_completo'] ?? 'NO DEFINIDO') . "\n";
    echo "Email: " . ($data['data']['email'] ?? 'NO DEFINIDO') . "\n";
    echo "Rol: " . ($data['data']['rol'] ?? 'NO DEFINIDO') . "\n";
    echo "Paciente ID: " . ($data['data']['paciente_id'] ?? 'NO DEFINIDO') . "\n";
    echo "Fase Actual: " . ($data['data']['fase_actual'] ?? 'NO DEFINIDO') . "\n";
    echo "Progreso: " . ($data['data']['progreso_general'] ?? 'NO DEFINIDO') . "\n";
} else {
    echo "\nERROR: El perfil no se pudo cargar\n";
}
