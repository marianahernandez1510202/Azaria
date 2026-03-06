<?php

namespace App\Controllers;

use App\Services\DatabaseService;
use App\Models\User;
use App\Utils\Response;
use App\Middleware\AuthMiddleware;

class ConfiguracionController
{
    private $db;

    public function __construct()
    {
        $this->db = DatabaseService::getInstance();
    }

    /**
     * Obtener toda la configuracion del usuario
     */
    public function getConfiguracion()
    {
        $user = AuthMiddleware::getCurrentUser();
        if (!$user) {
            return Response::error('No autorizado', 401);
        }

        $config = $this->db->query(
            "SELECT * FROM configuracion_usuario WHERE usuario_id = ?",
            [$user['id']]
        )->fetch();

        // Si no existe, crear con defaults
        if (!$config) {
            $this->db->query(
                "INSERT INTO configuracion_usuario (usuario_id) VALUES (?)",
                [$user['id']]
            );
            $config = $this->db->query(
                "SELECT * FROM configuracion_usuario WHERE usuario_id = ?",
                [$user['id']]
            )->fetch();
        }

        // Formatear para el frontend
        $resultado = [
            'notificaciones' => [
                'recordatorios_medicamentos' => (bool)$config['notif_recordatorios_medicamentos'],
                'recordatorios_ejercicios' => (bool)$config['notif_recordatorios_ejercicios'],
                'recordatorios_citas' => (bool)$config['notif_recordatorios_citas'],
                'mensajes_chat' => (bool)$config['notif_mensajes_chat'],
                'actualizaciones_blog' => (bool)$config['notif_actualizaciones_blog'],
                'comunidad' => (bool)$config['notif_comunidad'],
                'sonido' => (bool)$config['notif_sonido'],
                'vibracion' => (bool)$config['notif_vibracion'],
            ],
            'privacidad' => [
                'perfil_visible_comunidad' => (bool)$config['perfil_visible_comunidad'],
                'mostrar_nombre_real' => (bool)$config['mostrar_nombre_real'],
                'permitir_mensajes_pacientes' => (bool)$config['permitir_mensajes_pacientes'],
            ]
        ];

        return Response::success($resultado);
    }

    /**
     * Guardar preferencias de notificaciones
     */
    public function guardarNotificaciones($data)
    {
        $user = AuthMiddleware::getCurrentUser();
        if (!$user) {
            return Response::error('No autorizado', 401);
        }

        // Asegurar que existe el registro
        $exists = $this->db->query(
            "SELECT id FROM configuracion_usuario WHERE usuario_id = ?",
            [$user['id']]
        )->fetch();

        if (!$exists) {
            $this->db->query(
                "INSERT INTO configuracion_usuario (usuario_id) VALUES (?)",
                [$user['id']]
            );
        }

        $this->db->query(
            "UPDATE configuracion_usuario SET
                notif_recordatorios_medicamentos = ?,
                notif_recordatorios_ejercicios = ?,
                notif_recordatorios_citas = ?,
                notif_mensajes_chat = ?,
                notif_actualizaciones_blog = ?,
                notif_comunidad = ?,
                notif_sonido = ?,
                notif_vibracion = ?
             WHERE usuario_id = ?",
            [
                (int)($data['recordatorios_medicamentos'] ?? 1),
                (int)($data['recordatorios_ejercicios'] ?? 1),
                (int)($data['recordatorios_citas'] ?? 1),
                (int)($data['mensajes_chat'] ?? 1),
                (int)($data['actualizaciones_blog'] ?? 0),
                (int)($data['comunidad'] ?? 0),
                (int)($data['sonido'] ?? 1),
                (int)($data['vibracion'] ?? 1),
                $user['id']
            ]
        );

        return Response::success(null, 'Preferencias de notificaciones guardadas');
    }

    /**
     * Guardar preferencias de privacidad
     */
    public function guardarPrivacidad($data)
    {
        $user = AuthMiddleware::getCurrentUser();
        if (!$user) {
            return Response::error('No autorizado', 401);
        }

        $exists = $this->db->query(
            "SELECT id FROM configuracion_usuario WHERE usuario_id = ?",
            [$user['id']]
        )->fetch();

        if (!$exists) {
            $this->db->query(
                "INSERT INTO configuracion_usuario (usuario_id) VALUES (?)",
                [$user['id']]
            );
        }

        $this->db->query(
            "UPDATE configuracion_usuario SET
                perfil_visible_comunidad = ?,
                mostrar_nombre_real = ?,
                permitir_mensajes_pacientes = ?
             WHERE usuario_id = ?",
            [
                (int)($data['perfil_visible_comunidad'] ?? 1),
                (int)($data['mostrar_nombre_real'] ?? 1),
                (int)($data['permitir_mensajes_pacientes'] ?? 0),
                $user['id']
            ]
        );

        return Response::success(null, 'Preferencias de privacidad guardadas');
    }

    /**
     * Cambiar contraseña
     */
    public function cambiarPassword($data)
    {
        $user = AuthMiddleware::getCurrentUser();
        if (!$user) {
            return Response::error('No autorizado', 401);
        }

        if (empty($data['password_actual']) || empty($data['password_nueva'])) {
            return Response::error('Debes proporcionar la contraseña actual y la nueva', 422);
        }

        if (strlen($data['password_nueva']) < 6) {
            return Response::error('La nueva contraseña debe tener al menos 6 caracteres', 422);
        }

        // Verificar contraseña actual
        $userData = $this->db->query(
            "SELECT password_hash FROM usuarios WHERE id = ?",
            [$user['id']]
        )->fetch();

        if (!$userData || !password_verify($data['password_actual'], $userData['password_hash'])) {
            return Response::error('La contraseña actual es incorrecta', 403);
        }

        // Actualizar
        User::updatePassword($user['id'], $data['password_nueva']);

        return Response::success(null, 'Contraseña actualizada correctamente');
    }

    /**
     * Cambiar PIN
     */
    public function cambiarPIN($data)
    {
        $user = AuthMiddleware::getCurrentUser();
        if (!$user) {
            return Response::error('No autorizado', 401);
        }

        if (empty($data['pin_nuevo'])) {
            return Response::error('Debes proporcionar el nuevo PIN', 422);
        }

        if (!preg_match('/^\d{4,6}$/', $data['pin_nuevo'])) {
            return Response::error('El PIN debe ser de 4 a 6 dígitos', 422);
        }

        User::updatePIN($user['id'], $data['pin_nuevo']);

        return Response::success(null, 'PIN actualizado correctamente');
    }

    /**
     * Eliminar un dispositivo/sesión específica
     */
    public function eliminarDispositivo($dispositivoId)
    {
        $user = AuthMiddleware::getCurrentUser();
        if (!$user) {
            return Response::error('No autorizado', 401);
        }

        $this->db->query(
            "DELETE FROM sesiones_activas WHERE id = ? AND usuario_id = ?",
            [$dispositivoId, $user['id']]
        );

        return Response::success(null, 'Sesión cerrada en el dispositivo');
    }

    /**
     * Cerrar todas las sesiones excepto la actual
     */
    public function cerrarTodasSesiones()
    {
        $user = AuthMiddleware::getCurrentUser();
        if (!$user) {
            return Response::error('No autorizado', 401);
        }

        // Obtener el token actual para no borrarlo
        $headers = getallheaders();
        $currentToken = str_replace('Bearer ', '', $headers['Authorization'] ?? '');
        $currentHash = hash('sha256', $currentToken);

        $this->db->query(
            "DELETE FROM sesiones_activas WHERE usuario_id = ? AND token_hash != ?",
            [$user['id'], $currentHash]
        );

        return Response::success(null, 'Sesiones cerradas en todos los dispositivos');
    }
}
