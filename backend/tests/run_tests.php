<?php
/**
 * Azaria Backend Test Runner
 * Ejecuta tests unitarios sin dependencia de PHPUnit
 *
 * Uso: php backend/tests/run_tests.php
 */

// Configurar autoloader
spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $baseDir = __DIR__ . '/../src/';

    if (strncmp($prefix, $class, strlen($prefix)) !== 0) {
        return;
    }

    $relativeClass = substr($class, strlen($prefix));
    $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';

    if (file_exists($file)) {
        require $file;
    }
});

// ===== Test Framework Mini =====
$tests = [];
$passed = 0;
$failed = 0;
$errors = [];

function test(string $name, callable $fn): void {
    global $tests;
    $tests[] = ['name' => $name, 'fn' => $fn];
}

function assertEqual($expected, $actual, string $msg = ''): void {
    if ($expected !== $actual) {
        $detail = $msg ?: "Expected " . var_export($expected, true) . ", got " . var_export($actual, true);
        throw new \Exception("FAIL: $detail");
    }
}

function assertTrue($value, string $msg = ''): void {
    if ($value !== true) {
        throw new \Exception("FAIL: " . ($msg ?: "Expected true, got " . var_export($value, true)));
    }
}

function assertFalse($value, string $msg = ''): void {
    if ($value !== false) {
        throw new \Exception("FAIL: " . ($msg ?: "Expected false, got " . var_export($value, true)));
    }
}

function assertContains(string $needle, string $haystack, string $msg = ''): void {
    if (strpos($haystack, $needle) === false) {
        throw new \Exception("FAIL: " . ($msg ?: "'$needle' not found in '$haystack'"));
    }
}

function assertNotNull($value, string $msg = ''): void {
    if ($value === null) {
        throw new \Exception("FAIL: " . ($msg ?: "Expected non-null value"));
    }
}

function assertNull($value, string $msg = ''): void {
    if ($value !== null) {
        throw new \Exception("FAIL: " . ($msg ?: "Expected null, got " . var_export($value, true)));
    }
}

function assertCount(int $expected, $array, string $msg = ''): void {
    $actual = is_array($array) ? count($array) : 0;
    if ($actual !== $expected) {
        throw new \Exception("FAIL: " . ($msg ?: "Expected count $expected, got $actual"));
    }
}

// Cargar archivos de test
foreach (glob(__DIR__ . '/*Test.php') as $testFile) {
    require $testFile;
}

// ===== Ejecutar Tests =====
echo "\n";
echo "╔══════════════════════════════════════════╗\n";
echo "║     AZARIA - Backend Test Suite          ║\n";
echo "╚══════════════════════════════════════════╝\n\n";

foreach ($tests as $test) {
    try {
        $test['fn']();
        $passed++;
        echo "  ✓ {$test['name']}\n";
    } catch (\Exception $e) {
        $failed++;
        $errors[] = ['name' => $test['name'], 'error' => $e->getMessage()];
        echo "  ✗ {$test['name']}\n";
        echo "    → {$e->getMessage()}\n";
    }
}

echo "\n──────────────────────────────────────────\n";
echo "  Total: " . ($passed + $failed) . " | Passed: $passed | Failed: $failed\n";
echo "──────────────────────────────────────────\n\n";

if ($failed > 0) {
    echo "ERRORES:\n";
    foreach ($errors as $err) {
        echo "  [{$err['name']}] {$err['error']}\n";
    }
    echo "\n";
    exit(1);
}

echo "Todos los tests pasaron.\n\n";
exit(0);
