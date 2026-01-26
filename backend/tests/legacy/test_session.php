<?php
/**
 * Test del SessionService
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

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

use App\Services\SessionService;
use App\Services\DatabaseService;

try {
    $results = [];

    // 1. Verificar que la tabla sesiones_activas existe
    $db = DatabaseService::getInstance();

    try {
        $tableCheck = $db->query("SHOW TABLES LIKE 'sesiones_activas'")->fetch();
        $results['1_table_exists'] = $tableCheck ? true : false;
    } catch (Exception $e) {
        $results['1_table_error'] = $e->getMessage();
    }

    // 2. Si no existe, crearla
    if (!($results['1_table_exists'] ?? false)) {
        $db->query("
            CREATE TABLE sesiones_activas (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario_id INT NOT NULL,
                token_hash VARCHAR(64) NOT NULL,
                dispositivo VARCHAR(100),
                navegador VARCHAR(255),
                ip_address VARCHAR(45),
                expira_en DATETIME NOT NULL,
                ultimo_acceso DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_token_hash (token_hash),
                INDEX idx_usuario_id (usuario_id)
            )
        ");
        $results['2_table_created'] = true;
    }

    // 3. Probar crear sesión
    $sessionService = new SessionService();

    $fakeUser = [
        'id' => 7,
        'email' => 'paciente1@test.com'
    ];

    $session = $sessionService->createSession($fakeUser, true, []);
    $results['3_session_created'] = $session;

    // 4. Verificar token
    if (isset($session['token'])) {
        $validated = $sessionService->validateToken($session['token']);
        $results['4_token_validated'] = $validated ? true : false;
        $results['4_token_data'] = $validated;
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
