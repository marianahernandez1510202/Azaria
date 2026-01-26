<?php

namespace App\Middleware;

use App\Services\SessionService;
use App\Utils\Response;

class AuthMiddleware
{
    private $sessionService;

    public function __construct()
    {
        $this->sessionService = new SessionService();
    }

    public function handle()
    {
        $user = $this->sessionService->getCurrentUser();

        if (!$user) {
            Response::error('No autorizado', 401);
        }

        // Guardar usuario en variable global para acceso
        $GLOBALS['current_user'] = $user;

        return true;
    }

    public static function getCurrentUser()
    {
        return $GLOBALS['current_user'] ?? null;
    }
}
