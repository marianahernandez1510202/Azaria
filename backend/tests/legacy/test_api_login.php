<?php
/**
 * Test que simula exactamente lo que hace el API de login
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Simular datos como los enviaría el frontend
$testCases = [
    ['email' => 'paciente1@test.com', 'credential' => '123456'],
    ['email' => 'paciente1@test.com', 'password' => '123456'],
];

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
use App\Utils\Validator;

$results = [];

foreach ($testCases as $index => $data) {
    $results["test_$index"] = [
        'input' => $data,
    ];

    // Probar validador
    $validator = new \App\Utils\Validator($data);
    $validator->required(['email', 'credential']);

    $results["test_$index"]['validator_passes'] = $validator->passes();
    $results["test_$index"]['validator_errors'] = $validator->errors();
}

// Mostrar qué campos acepta el frontend típicamente
$results['hint'] = 'El validator requiere "credential", pero el frontend podría enviar "password"';

echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
