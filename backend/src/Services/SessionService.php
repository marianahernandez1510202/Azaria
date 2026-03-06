<?php

namespace App\Services;

use App\Models\User;

/**
 * Servicio de Sesiones simplificado
 * Usa tokens simples basados en hash en lugar de JWT
 */
class SessionService
{
    private $tokenSecret;
    private $sessionLifetime;

    public function __construct()
    {
        $this->tokenSecret = getenv('JWT_SECRET') ?: 'vitalia_secret_key_2024';
        $this->sessionLifetime = 30 * 24 * 60 * 60; // 30 días
    }

    public function createSession($user, $remember = false, $deviceInfo = [])
    {
        $expirationTime = $remember ? time() + $this->sessionLifetime : time() + 86400;

        // Crear token simple pero seguro
        $tokenData = [
            'user_id' => $user['id'],
            'email' => $user['email'],
            'exp' => $expirationTime,
            'iat' => time(),
            'rand' => bin2hex(random_bytes(16))
        ];

        // Codificar datos en base64
        $payload = base64_encode(json_encode($tokenData));

        // Crear firma
        $signature = hash_hmac('sha256', $payload, $this->tokenSecret);

        // Token final: payload.signature
        $token = $payload . '.' . $signature;

        // Guardar sesión en base de datos
        $this->saveSession($user['id'], $token, $expirationTime, $deviceInfo);

        return [
            'token' => $token,
            'expires_at' => $expirationTime
        ];
    }

    public function validateToken($token)
    {
        if (empty($token)) {
            return null;
        }

        $parts = explode('.', $token);
        if (count($parts) !== 2) {
            return null;
        }

        list($payload, $signature) = $parts;

        // Verificar firma
        $expectedSignature = hash_hmac('sha256', $payload, $this->tokenSecret);
        if (!hash_equals($expectedSignature, $signature)) {
            return null;
        }

        // Decodificar payload
        $data = json_decode(base64_decode($payload), true);
        if (!$data) {
            return null;
        }

        // Verificar expiración
        if (isset($data['exp']) && $data['exp'] < time()) {
            return null;
        }

        // Verificar que la sesión existe en BD
        if (!$this->sessionExists($token)) {
            return null;
        }

        return $data;
    }

    public function getCurrentUser()
    {
        $headers = getallheaders();
        $token = $headers['Authorization'] ?? null;

        // Fallback: aceptar token desde query parameter (para preview de archivos en nueva pestaña)
        if (!$token && isset($_GET['token'])) {
            $token = $_GET['token'];
        }

        if (!$token) {
            return null;
        }

        // Remover "Bearer " si existe
        $token = str_replace('Bearer ', '', $token);

        $payload = $this->validateToken($token);

        if (!$payload) {
            return null;
        }

        $user = User::find($payload['user_id']);

        if (!$user) {
            return null;
        }

        // Sanitizar: remover campos sensibles y agregar nombre del rol
        unset($user['password_hash']);
        unset($user['pin_hash']);
        unset($user['password']);
        unset($user['pin']);

        // Obtener nombre del rol
        $db = DatabaseService::getInstance();
        $rol = $db->query(
            "SELECT nombre FROM roles WHERE id = ?",
            [$user['rol_id']]
        )->fetch();
        $user['rol'] = $rol ? $rol['nombre'] : 'paciente';

        // Si es paciente, obtener paciente_id
        if ($user['rol_id'] == 3) {
            $paciente = $db->query(
                "SELECT id FROM pacientes WHERE usuario_id = ?",
                [$user['id']]
            )->fetch();
            $user['paciente_id'] = $paciente ? $paciente['id'] : null;
        }

        // Si es especialista, agregar área
        if ($user['rol_id'] == 2 && $user['area_medica_id']) {
            $area = $db->query(
                "SELECT nombre, color, icono FROM areas_medicas WHERE id = ?",
                [$user['area_medica_id']]
            )->fetch();
            // area_medica es el código usado por el frontend (fisioterapia, nutricion, medicina, etc.)
            $user['area_medica'] = $area ? $area['nombre'] : 'medicina';
            $user['area_nombre'] = $area ? ucfirst($area['nombre']) : 'Medicina General';
            $user['area_color'] = $area ? $area['color'] : '#F44336';
            $user['area_icono'] = $area ? $area['icono'] : 'medical_services';
            // También guardar el id del especialista para uso en el dashboard
            $user['especialista_id'] = $user['id'];
        }

        return $user;
    }

    public function destroyCurrentSession()
    {
        $headers = getallheaders();
        $token = $headers['Authorization'] ?? null;

        if ($token) {
            $token = str_replace('Bearer ', '', $token);
            $this->deleteSession($token);
        }

        return true;
    }

    public function getUserDevices($userId)
    {
        $db = DatabaseService::getInstance();
        return $db->query(
            "SELECT * FROM sesiones_activas WHERE usuario_id = ? ORDER BY ultimo_acceso DESC",
            [$userId]
        )->fetchAll();
    }

    public function removeDevice($userId, $sessionId)
    {
        $db = DatabaseService::getInstance();
        return $db->query(
            "DELETE FROM sesiones_activas WHERE usuario_id = ? AND id = ?",
            [$userId, $sessionId]
        );
    }

    public function removeAllDevices($userId)
    {
        $db = DatabaseService::getInstance();
        return $db->query(
            "DELETE FROM sesiones_activas WHERE usuario_id = ?",
            [$userId]
        );
    }

    private function saveSession($userId, $token, $expiresAt, $deviceInfo = [])
    {
        $db = DatabaseService::getInstance();

        // Limpiar sesiones expiradas del usuario
        $db->query(
            "DELETE FROM sesiones_activas WHERE usuario_id = ? AND expira_en < NOW()",
            [$userId]
        );

        // Guardar nueva sesión
        $tokenHash = hash('sha256', $token);

        $db->query(
            "INSERT INTO sesiones_activas
             (usuario_id, token_hash, dispositivo, navegador, ip_address, expira_en, ultimo_acceso)
             VALUES (?, ?, ?, ?, ?, FROM_UNIXTIME(?), NOW())",
            [
                $userId,
                $tokenHash,
                $deviceInfo['name'] ?? 'Navegador Web',
                $deviceInfo['browser'] ?? ($_SERVER['HTTP_USER_AGENT'] ?? 'Desconocido'),
                $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
                $expiresAt
            ]
        );
    }

    private function sessionExists($token)
    {
        $db = DatabaseService::getInstance();
        $tokenHash = hash('sha256', $token);

        $result = $db->query(
            "SELECT id FROM sesiones_activas WHERE token_hash = ? AND expira_en > NOW()",
            [$tokenHash]
        )->fetch();

        if ($result) {
            // Actualizar último acceso
            $db->query(
                "UPDATE sesiones_activas SET ultimo_acceso = NOW() WHERE token_hash = ?",
                [$tokenHash]
            );
            return true;
        }

        return false;
    }

    private function deleteSession($token)
    {
        $db = DatabaseService::getInstance();
        $tokenHash = hash('sha256', $token);

        $db->query(
            "DELETE FROM sesiones_activas WHERE token_hash = ?",
            [$tokenHash]
        );
    }
}
