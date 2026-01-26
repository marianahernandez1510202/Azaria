<?php
/**
 * Simular exactamente lo que pasa con una petición real
 */

header('Content-Type: application/json');

// Simular el JSON que envía el frontend
$rawInput = '{"email":"paciente1@test.com","credential":"123456","remember":true,"device_info":{"name":"Win32","browser":"Mozilla/5.0","os":"Win32"}}';

// Parsear como lo hace la ruta
$data = json_decode($rawInput, true);

echo "=== DATOS PARSEADOS ===\n";
var_dump($data);

echo "\n=== VERIFICACIÓN ===\n";
echo "email existe: " . (isset($data['email']) ? 'SÍ' : 'NO') . "\n";
echo "credential existe: " . (isset($data['credential']) ? 'SÍ' : 'NO') . "\n";
echo "email vacío: " . (empty($data['email']) ? 'SÍ' : 'NO') . "\n";
echo "credential vacío: " . (empty($data['credential']) ? 'SÍ' : 'NO') . "\n";

// Ahora probar con autoload
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

use App\Utils\Validator;

echo "\n=== VALIDATOR ===\n";
$validator = new Validator($data);
$validator->required(['email', 'credential']);
echo "Pasa validación: " . ($validator->passes() ? 'SÍ' : 'NO') . "\n";
echo "Errores: " . json_encode($validator->errors()) . "\n";
