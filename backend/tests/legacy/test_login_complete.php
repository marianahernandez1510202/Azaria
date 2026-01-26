<?php
/**
 * Test completo del login con paciente_id
 */

header('Content-Type: application/json; charset=utf-8');

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

use App\Services\AuthService;
use App\Services\SessionService;

$authService = new AuthService();

// Intentar login con paciente de prueba
$email = 'paciente1@test.com';
$password = '123456';

echo json_encode([
    'test' => 'Login completo',
    'email' => $email,
    'step' => 'Ejecutando login...'
], JSON_PRETTY_PRINT);

$result = $authService->login($email, $password, false);

echo "\n\n=== RESULTADO LOGIN ===\n";
echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

if ($result['success']) {
    echo "\n\n=== VERIFICACIÓN ===\n";
    echo "User ID: " . ($result['user']['id'] ?? 'NO DEFINIDO') . "\n";
    echo "Paciente ID: " . ($result['user']['paciente_id'] ?? 'NO DEFINIDO') . "\n";
    echo "Nombre: " . ($result['user']['nombre_completo'] ?? 'NO DEFINIDO') . "\n";
    echo "Rol ID: " . ($result['user']['rol_id'] ?? 'NO DEFINIDO') . "\n";

    // Crear token de sesión
    $sessionService = new SessionService();
    $token = $sessionService->createSession($result['user'], false, []);

    echo "\n=== TOKEN GENERADO ===\n";
    echo "Token: " . substr($token, 0, 50) . "...\n";

    // Verificar token
    $decoded = $sessionService->validateToken($token);
    echo "\n=== TOKEN DECODED ===\n";
    echo json_encode($decoded, JSON_PRETTY_PRINT);
}
