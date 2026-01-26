<?php
namespace App\Middleware;
class RateLimitMiddleware {
    public static function check($maxRequests = 60, $perMinutes = 1) {
        // Implementar rate limiting
        return true;
    }
}
