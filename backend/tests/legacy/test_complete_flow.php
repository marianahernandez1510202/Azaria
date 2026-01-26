<?php
/**
 * Test del flujo completo de login incluyendo AuthController
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

use App\Controllers\AuthController;

try {
    $controller = new AuthController();

    $data = [
        'email' => 'paciente1@test.com',
        'credential' => '123456',
        'remember' => true,
        'device_info' => []
    ];

    // Capturar output
    ob_start();
    $result = $controller->login($data);
    $output = ob_get_clean();

    echo json_encode([
        'controller_returned' => $result,
        'any_output' => $output
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode([
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ], JSON_PRETTY_PRINT);
}
