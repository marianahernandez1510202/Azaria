<?php

namespace App\Middleware;

use App\Utils\Response;

class RoleMiddleware
{
    public static function check($allowedRoles)
    {
        $user = AuthMiddleware::getCurrentUser();

        if (!$user) {
            Response::error('No autorizado', 401);
        }

        $allowedRoles = is_array($allowedRoles) ? $allowedRoles : [$allowedRoles];

        if (!in_array($user['rol'], $allowedRoles)) {
            Response::error('No tienes permisos para realizar esta acción', 403);
        }

        return true;
    }
}
