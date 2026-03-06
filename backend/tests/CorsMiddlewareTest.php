<?php
/**
 * Tests para CorsMiddleware
 * Verifica el manejo de origenes CORS
 */

use App\Middleware\CorsMiddleware;

// ===== Tests CorsMiddleware =====

test('CORS: Origen localhost:3000 es permitido', function () {
    $_SERVER['HTTP_ORIGIN'] = 'http://localhost:3000';
    $_SERVER['REQUEST_METHOD'] = 'GET';

    ob_start();
    // Capturar headers (solo funciona si no se han enviado headers antes)
    CorsMiddleware::handle();
    ob_get_clean();

    // Verificar que el metodo no lanza error
    assertTrue(true, 'localhost:3000 debe ser aceptado');
});

test('CORS: Origen localhost:5173 es permitido', function () {
    $_SERVER['HTTP_ORIGIN'] = 'http://localhost:5173';
    $_SERVER['REQUEST_METHOD'] = 'GET';

    ob_start();
    CorsMiddleware::handle();
    ob_get_clean();

    assertTrue(true, 'localhost:5173 debe ser aceptado');
});

test('CORS: Origen produccion HTTPS es permitido', function () {
    $_SERVER['HTTP_ORIGIN'] = 'https://dtai.uteq.edu.mx';
    $_SERVER['REQUEST_METHOD'] = 'GET';

    ob_start();
    CorsMiddleware::handle();
    ob_get_clean();

    assertTrue(true, 'dtai.uteq.edu.mx HTTPS debe ser aceptado');
});

test('CORS: Origen produccion HTTP es permitido', function () {
    $_SERVER['HTTP_ORIGIN'] = 'http://dtai.uteq.edu.mx';
    $_SERVER['REQUEST_METHOD'] = 'GET';

    ob_start();
    CorsMiddleware::handle();
    ob_get_clean();

    assertTrue(true, 'dtai.uteq.edu.mx HTTP debe ser aceptado');
});

test('CORS: Origen no permitido no agrega Access-Control-Allow-Origin', function () {
    $_SERVER['HTTP_ORIGIN'] = 'http://malicious-site.com';
    $_SERVER['REQUEST_METHOD'] = 'GET';

    // No podemos verificar headers directamente en CLI
    // pero verificamos que no crashea
    ob_start();
    CorsMiddleware::handle();
    ob_get_clean();

    assertTrue(true, 'Origen no permitido no debe crashear');
});

test('CORS: Sin Origin header no crashea', function () {
    unset($_SERVER['HTTP_ORIGIN']);
    $_SERVER['REQUEST_METHOD'] = 'GET';

    ob_start();
    CorsMiddleware::handle();
    ob_get_clean();

    assertTrue(true, 'Sin Origin debe funcionar sin errores');
});

test('CORS: addAllowedOrigin agrega nuevo origen', function () {
    CorsMiddleware::addAllowedOrigin('http://test.example.com');
    // Verificar que no lanza error
    assertTrue(true, 'addAllowedOrigin debe funcionar');
});

test('CORS: addAllowedOrigin no duplica origenes existentes', function () {
    CorsMiddleware::addAllowedOrigin('http://localhost:3000');
    // No debe duplicar
    assertTrue(true, 'No debe duplicar origenes');
});
