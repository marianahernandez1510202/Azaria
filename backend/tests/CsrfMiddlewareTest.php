<?php
/**
 * Tests para CsrfMiddleware
 * Verifica la proteccion CSRF por Origin/Referer/X-Requested-With
 */

use App\Middleware\CsrfMiddleware;

// Helper: simular $_SERVER para tests de CSRF
function setupCsrfServer(string $method, array $headers = []): void {
    $_SERVER['REQUEST_METHOD'] = $method;
    unset($_SERVER['HTTP_X_REQUESTED_WITH']);
    unset($_SERVER['HTTP_ORIGIN']);
    unset($_SERVER['HTTP_REFERER']);

    foreach ($headers as $key => $value) {
        $_SERVER[$key] = $value;
    }
}

// ===== Tests CSRF: Metodos GET no verifican =====
test('CSRF: GET requests no son verificados', function () {
    setupCsrfServer('GET');
    // handle() no debe lanzar error (no verifica GET)
    // Capturamos el output y verificamos que no se llama Response::error
    ob_start();
    CsrfMiddleware::handle();
    $output = ob_get_clean();
    assertEqual('', $output, 'GET request no debe producir output');
});

test('CSRF: OPTIONS requests no son verificados', function () {
    setupCsrfServer('OPTIONS');
    ob_start();
    CsrfMiddleware::handle();
    $output = ob_get_clean();
    assertEqual('', $output, 'OPTIONS request no debe producir output');
});

// ===== Tests CSRF: X-Requested-With header =====
test('CSRF: POST con X-Requested-With XMLHttpRequest es permitido', function () {
    setupCsrfServer('POST', ['HTTP_X_REQUESTED_WITH' => 'XMLHttpRequest']);
    ob_start();
    CsrfMiddleware::handle();
    $output = ob_get_clean();
    assertEqual('', $output, 'POST con XMLHttpRequest debe ser permitido');
});

test('CSRF: POST con X-Requested-With en minusculas es permitido', function () {
    setupCsrfServer('POST', ['HTTP_X_REQUESTED_WITH' => 'xmlhttprequest']);
    ob_start();
    CsrfMiddleware::handle();
    $output = ob_get_clean();
    assertEqual('', $output, 'POST con xmlhttprequest debe ser permitido');
});

// ===== Tests CSRF: Origin header =====
test('CSRF: POST con Origin localhost:3000 es permitido', function () {
    setupCsrfServer('POST', ['HTTP_ORIGIN' => 'http://localhost:3000']);
    ob_start();
    CsrfMiddleware::handle();
    $output = ob_get_clean();
    assertEqual('', $output, 'POST con Origin localhost:3000 debe ser permitido');
});

test('CSRF: POST con Origin produccion (https) es permitido', function () {
    setupCsrfServer('POST', ['HTTP_ORIGIN' => 'https://dtai.uteq.edu.mx']);
    ob_start();
    CsrfMiddleware::handle();
    $output = ob_get_clean();
    assertEqual('', $output, 'POST con Origin dtai.uteq.edu.mx debe ser permitido');
});

// ===== Tests CSRF: Referer fallback =====
test('CSRF: POST con Referer de origen permitido es aceptado', function () {
    setupCsrfServer('POST', ['HTTP_REFERER' => 'http://localhost:3000/some/page']);
    ob_start();
    CsrfMiddleware::handle();
    $output = ob_get_clean();
    assertEqual('', $output, 'POST con Referer localhost:3000 debe ser permitido');
});

// ===== Tests CSRF: Sin headers (permitido para tools/mismo servidor) =====
test('CSRF: POST sin Origin ni Referer ni XHR es permitido (server-to-server)', function () {
    setupCsrfServer('POST');
    ob_start();
    CsrfMiddleware::handle();
    $output = ob_get_clean();
    assertEqual('', $output, 'POST sin headers de origen debe ser permitido');
});

// ===== Tests CSRF: DELETE tambien es verificado =====
test('CSRF: DELETE con X-Requested-With es permitido', function () {
    setupCsrfServer('DELETE', ['HTTP_X_REQUESTED_WITH' => 'XMLHttpRequest']);
    ob_start();
    CsrfMiddleware::handle();
    $output = ob_get_clean();
    assertEqual('', $output, 'DELETE con XMLHttpRequest debe ser permitido');
});

// ===== Tests CSRF: PUT tambien es verificado =====
test('CSRF: PUT con Origin valido es permitido', function () {
    setupCsrfServer('PUT', ['HTTP_ORIGIN' => 'http://localhost:5173']);
    ob_start();
    CsrfMiddleware::handle();
    $output = ob_get_clean();
    assertEqual('', $output, 'PUT con Origin localhost:5173 debe ser permitido');
});
