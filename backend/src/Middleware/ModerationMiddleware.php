<?php
namespace App\Middleware;
class ModerationMiddleware {
    public static function check() {
        $user = AuthMiddleware::getCurrentUser();
        if (!$user || $user['rol'] !== 'moderador') {
            \App\Utils\Response::error('No autorizado', 403);
        }
        return true;
    }
}
