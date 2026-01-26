<?php

namespace App\Controllers;

use App\Services\AuthService;
use App\Services\SessionService;
use App\Services\PINService;
use App\Services\EmailService;
use App\Utils\Response;
use App\Utils\Validator;

class AuthController
{
    private $authService;
    private $sessionService;
    private $pinService;
    private $emailService;

    public function __construct()
    {
        $this->authService = new AuthService();
        $this->sessionService = new SessionService();
        $this->pinService = new PINService();
        $this->emailService = new EmailService();
    }

    // RF-001: Registro de Usuarios (solo admin)
    public function register($data)
    {
        $validator = new Validator($data);
        $validator->required(['email', 'nombre_completo', 'rol'])
                  ->email('email')
                  ->unique('users', 'email');

        if (!$validator->passes()) {
            return Response::error($validator->errors(), 422);
        }

        $result = $this->authService->registerUser($data);

        if ($result['success']) {
            // Enviar email de bienvenida
            $this->emailService->sendWelcomeEmail($result['user'], $result['credentials']);

            return Response::success([
                'user' => $result['user'],
                'printable_credentials' => $result['credentials']
            ], 'Usuario registrado exitosamente', 201);
        }

        return Response::error('Error al registrar usuario', 500);
    }

    // Inicio de sesión (email/password o email/PIN)
    public function login($data)
    {
        $validator = new Validator($data);
        $validator->required(['email', 'credential']); // credential puede ser password o PIN

        if (!$validator->passes()) {
            return Response::error($validator->errors(), 422);
        }

        // Verificar intentos fallidos
        if ($this->authService->isLocked($data['email'])) {
            $remainingTime = $this->authService->getLockoutTime($data['email']);
            return Response::error("Cuenta bloqueada. Intenta en $remainingTime minutos.", 429);
        }

        $result = $this->authService->login($data['email'], $data['credential'], $data['remember'] ?? false);

        if ($result['success']) {
            // RF-002: Crear sesión persistente si se solicitó
            $session = $this->sessionService->createSession(
                $result['user'],
                $data['remember'] ?? false,
                $data['device_info'] ?? []
            );

            return Response::success([
                'user' => $result['user'],
                'token' => $session['token'],
                'first_login' => $result['user']['first_login']
            ], 'Login exitoso');
        }

        // Registrar intento fallido
        $this->authService->recordFailedAttempt($data['email']);
        $attemptsLeft = $this->authService->getAttemptsLeft($data['email']);

        if ($attemptsLeft <= 2 && $attemptsLeft > 0) {
            return Response::error("Credenciales incorrectas. Te quedan $attemptsLeft intentos.", 401);
        }

        return Response::error('Credenciales incorrectas', 401);
    }

    // RF-003: Configurar PIN
    public function setupPIN($data)
    {
        $validator = new Validator($data);
        $validator->required(['user_id', 'pin', 'pin_confirmation'])
                  ->length('pin', 6, 6)
                  ->numeric('pin')
                  ->match('pin', 'pin_confirmation');

        if (!$validator->passes()) {
            return Response::error($validator->errors(), 422);
        }

        // Validar que no sea secuencia obvia
        if (!$this->pinService->isValidPIN($data['pin'])) {
            return Response::error('El PIN no puede ser una secuencia obvia (123456, 111111, etc.)', 422);
        }

        $result = $this->pinService->setPIN($data['user_id'], $data['pin']);

        if ($result) {
            return Response::success(null, 'PIN configurado exitosamente');
        }

        return Response::error('Error al configurar PIN', 500);
    }

    // RF-006: Recuperación de contraseña/PIN
    public function forgotPassword($data)
    {
        $validator = new Validator($data);
        $validator->required(['email'])->email('email');

        if (!$validator->passes()) {
            return Response::error($validator->errors(), 422);
        }

        // Verificar rate limit
        if ($this->authService->hasExceededRecoveryLimit($data['email'])) {
            return Response::error('Demasiadas solicitudes. Intenta más tarde.', 429);
        }

        $result = $this->authService->sendRecoveryCode($data['email']);

        if ($result) {
            return Response::success(null, 'Código de recuperación enviado a tu correo');
        }

        return Response::error('Email no encontrado', 404);
    }

    // Verificar código de recuperación
    public function verifyRecoveryCode($data)
    {
        $validator = new Validator($data);
        $validator->required(['email', 'code'])->length('code', 6, 6);

        if (!$validator->passes()) {
            return Response::error($validator->errors(), 422);
        }

        $result = $this->authService->verifyRecoveryCode($data['email'], $data['code']);

        if ($result['valid']) {
            return Response::success([
                'reset_token' => $result['reset_token']
            ], 'Código válido');
        }

        return Response::error('Código inválido o expirado', 401);
    }

    // Resetear contraseña/PIN
    public function resetPassword($data)
    {
        $validator = new Validator($data);
        $validator->required(['reset_token', 'new_credential', 'credential_confirmation'])
                  ->match('new_credential', 'credential_confirmation');

        if (!$validator->passes()) {
            return Response::error($validator->errors(), 422);
        }

        $result = $this->authService->resetCredential($data['reset_token'], $data['new_credential']);

        if ($result) {
            return Response::success(null, 'Credencial actualizada exitosamente');
        }

        return Response::error('Token inválido o expirado', 401);
    }

    // RF-008: Gestión de dispositivos de confianza
    public function getTrustedDevices($userId)
    {
        $devices = $this->sessionService->getUserDevices($userId);
        return Response::success($devices);
    }

    // Cerrar sesión en un dispositivo específico
    public function logoutDevice($userId, $deviceId)
    {
        $result = $this->sessionService->removeDevice($userId, $deviceId);

        if ($result) {
            return Response::success(null, 'Sesión cerrada en el dispositivo');
        }

        return Response::error('Error al cerrar sesión', 500);
    }

    // Cerrar todas las sesiones
    public function logoutAllDevices($userId)
    {
        $result = $this->sessionService->removeAllDevices($userId);

        if ($result) {
            return Response::success(null, 'Todas las sesiones han sido cerradas');
        }

        return Response::error('Error al cerrar sesiones', 500);
    }

    // Cerrar sesión actual
    public function logout()
    {
        $this->sessionService->destroyCurrentSession();
        return Response::success(null, 'Sesión cerrada exitosamente');
    }

    // RF-009: Completar onboarding
    public function completeOnboarding($userId)
    {
        $result = $this->authService->markOnboardingComplete($userId);

        if ($result) {
            return Response::success(null, 'Onboarding completado');
        }

        return Response::error('Error al completar onboarding', 500);
    }

    // Verificar sesión actual
    public function checkSession()
    {
        $user = $this->sessionService->getCurrentUser();

        if ($user) {
            return Response::success($user);
        }

        return Response::error('Sesión inválida', 401);
    }
}
