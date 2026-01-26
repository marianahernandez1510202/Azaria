<?php
/**
 * Test completo del flujo de login
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Cargar autoload
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
use App\Models\User;

try {
    $email = 'paciente1@test.com';
    $password = '123456';

    $results = [];

    // 1. Verificar usuario existe
    $user = User::findByEmail($email);
    $results['1_user_exists'] = $user ? true : false;
    $results['1_user_data'] = $user ? [
        'id' => $user['id'],
        'email' => $user['email'],
        'activo' => $user['activo'],
        'intentos_fallidos' => $user['intentos_fallidos'] ?? 0,
        'bloqueado_hasta' => $user['bloqueado_hasta'] ?? null
    ] : null;

    // 2. Verificar contraseña directamente
    if ($user) {
        $results['2_password_verify'] = password_verify($password, $user['password_hash']);
    }

    // 3. Crear AuthService y probar isLocked
    $authService = new AuthService();
    $results['3_is_locked'] = $authService->isLocked($email);
    $results['3_failed_attempts'] = $authService->getFailedAttempts($email);

    // 4. Si está bloqueado, desbloquear
    if ($results['3_is_locked'] || $results['3_failed_attempts'] >= 5) {
        $authService->resetFailedAttempts($email);
        $results['4_reset_attempts'] = 'Intentos reseteados';
        $results['4_new_failed_attempts'] = $authService->getFailedAttempts($email);
        $results['4_is_locked_now'] = $authService->isLocked($email);
    }

    // 5. Probar login completo
    $loginResult = $authService->login($email, $password, false);
    $results['5_login_result'] = $loginResult;

    // 6. Si login exitoso, verificar SessionService
    if ($loginResult['success']) {
        $results['6_login_success'] = true;
        $results['6_user_returned'] = array_keys($loginResult['user']);
    } else {
        $results['6_login_failed'] = 'Login falló incluso con credenciales correctas';
    }

    echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ], JSON_PRETTY_PRINT);
}
