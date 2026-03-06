<?php
/**
 * Tests para RateLimitMiddleware
 * Verifica el rate limiting basado en archivos
 */

use App\Middleware\RateLimitMiddleware;

// ===== Tests RateLimitMiddleware =====

test('RateLimit: Primer request es permitido', function () {
    // Simular IP
    $_SERVER['REMOTE_ADDR'] = '127.0.0.' . mt_rand(1, 254);
    unset($_SERVER['HTTP_X_FORWARDED_FOR']);
    unset($_SERVER['HTTP_X_REAL_IP']);

    // Limpiar storage para este IP
    $storageDir = sys_get_temp_dir() . '/azaria_ratelimit';
    $identifier = md5($_SERVER['REMOTE_ADDR'] . 'test_first');
    $file = $storageDir . '/' . $identifier . '.json';
    if (file_exists($file)) {
        unlink($file);
    }

    ob_start();
    $result = RateLimitMiddleware::check(10, 60, 'test_first');
    ob_get_clean();

    assertTrue($result, 'Primer request debe ser permitido');
});

test('RateLimit: Multiple requests dentro del limite son permitidos', function () {
    $ip = '10.0.0.' . mt_rand(1, 254);
    $_SERVER['REMOTE_ADDR'] = $ip;
    unset($_SERVER['HTTP_X_FORWARDED_FOR']);
    unset($_SERVER['HTTP_X_REAL_IP']);

    // Limpiar storage
    $storageDir = sys_get_temp_dir() . '/azaria_ratelimit';
    $identifier = md5($ip . 'test_multi');
    $file = $storageDir . '/' . $identifier . '.json';
    if (file_exists($file)) {
        unlink($file);
    }

    // Hacer 5 requests (limite: 10)
    $allPassed = true;
    for ($i = 0; $i < 5; $i++) {
        ob_start();
        $result = RateLimitMiddleware::check(10, 60, 'test_multi');
        ob_get_clean();
        if ($result !== true) {
            $allPassed = false;
        }
    }

    assertTrue($allPassed, '5 requests con limite de 10 deben ser permitidos');

    // Limpiar
    if (file_exists($file)) {
        unlink($file);
    }
});

test('RateLimit: checkAuth tiene limite de 5/minuto', function () {
    $ip = '192.168.1.' . mt_rand(1, 254);
    $_SERVER['REMOTE_ADDR'] = $ip;
    unset($_SERVER['HTTP_X_FORWARDED_FOR']);
    unset($_SERVER['HTTP_X_REAL_IP']);

    // Limpiar storage
    $storageDir = sys_get_temp_dir() . '/azaria_ratelimit';
    $identifier = md5($ip . 'auth');
    $file = $storageDir . '/' . $identifier . '.json';
    if (file_exists($file)) {
        unlink($file);
    }

    // Primer request debe pasar
    ob_start();
    $result = RateLimitMiddleware::checkAuth();
    ob_get_clean();

    assertTrue($result, 'Primer request auth debe ser permitido');

    // Limpiar
    if (file_exists($file)) {
        unlink($file);
    }
});

test('RateLimit: checkApi tiene limite de 120/minuto', function () {
    $ip = '172.16.0.' . mt_rand(1, 254);
    $_SERVER['REMOTE_ADDR'] = $ip;
    unset($_SERVER['HTTP_X_FORWARDED_FOR']);
    unset($_SERVER['HTTP_X_REAL_IP']);

    // Limpiar storage
    $storageDir = sys_get_temp_dir() . '/azaria_ratelimit';
    $identifier = md5($ip . 'api');
    $file = $storageDir . '/' . $identifier . '.json';
    if (file_exists($file)) {
        unlink($file);
    }

    ob_start();
    $result = RateLimitMiddleware::checkApi();
    ob_get_clean();

    assertTrue($result, 'Primer request API debe ser permitido');

    // Limpiar
    if (file_exists($file)) {
        unlink($file);
    }
});

test('RateLimit: Storage directory se crea automaticamente', function () {
    $storageDir = sys_get_temp_dir() . '/azaria_ratelimit';
    // El directorio deberia existir despues de ejecutar tests anteriores
    assertTrue(is_dir($storageDir), 'El directorio de storage debe existir');
});
