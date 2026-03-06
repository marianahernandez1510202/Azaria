<?php
/**
 * Tests para RoleMiddleware
 * Verifica la verificacion de roles de usuario
 */

use App\Middleware\RoleMiddleware;
use App\Middleware\AuthMiddleware;

// ===== Tests RoleMiddleware =====

test('RoleMiddleware: Usuario admin tiene acceso a ruta admin', function () {
    $GLOBALS['current_user'] = ['id' => 1, 'rol' => 'administrador', 'email' => 'admin@test.com'];
    $result = RoleMiddleware::check(['administrador']);
    assertTrue($result, 'Admin debe tener acceso');
});

test('RoleMiddleware: Usuario especialista tiene acceso a ruta especialista', function () {
    $GLOBALS['current_user'] = ['id' => 2, 'rol' => 'especialista', 'email' => 'esp@test.com'];
    $result = RoleMiddleware::check(['especialista']);
    assertTrue($result, 'Especialista debe tener acceso');
});

test('RoleMiddleware: Usuario con rol multiple tiene acceso', function () {
    $GLOBALS['current_user'] = ['id' => 3, 'rol' => 'paciente', 'email' => 'pac@test.com'];
    $result = RoleMiddleware::check(['paciente', 'especialista']);
    assertTrue($result, 'Paciente debe tener acceso cuando esta en la lista de roles permitidos');
});

test('RoleMiddleware: check acepta string como parametro', function () {
    $GLOBALS['current_user'] = ['id' => 1, 'rol' => 'administrador', 'email' => 'admin@test.com'];
    $result = RoleMiddleware::check('administrador');
    assertTrue($result, 'Debe aceptar string como parametro');
});

test('AuthMiddleware: getCurrentUser retorna usuario global', function () {
    $GLOBALS['current_user'] = ['id' => 5, 'rol' => 'paciente', 'nombre' => 'Test'];
    $user = AuthMiddleware::getCurrentUser();
    assertEqual(5, $user['id'], 'Debe retornar el usuario del GLOBALS');
    assertEqual('paciente', $user['rol'], 'Debe retornar el rol correcto');
});

test('AuthMiddleware: getCurrentUser retorna null sin usuario', function () {
    unset($GLOBALS['current_user']);
    $user = AuthMiddleware::getCurrentUser();
    assertNull($user, 'Debe retornar null cuando no hay usuario');
});
