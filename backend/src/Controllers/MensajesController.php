<?php

namespace App\Controllers;

use App\Services\DatabaseService;
use App\Utils\Response;

class MensajesController
{
    private $db;

    public function __construct()
    {
        $this->db = DatabaseService::getInstance();
    }

    /**
     * Obtener conversaciones de un usuario
     * La tabla conversaciones tiene paciente_id y especialista_id
     */
    public function getConversaciones($usuarioId)
    {
        // Primero obtener el rol del usuario
        $usuario = $this->db->query(
            "SELECT id, rol_id FROM usuarios WHERE id = ?",
            [$usuarioId]
        )->fetch();

        if (!$usuario) {
            return Response::error('Usuario no encontrado', 404);
        }

        // Si es paciente (rol 3), obtener su paciente_id
        $conversaciones = [];

        if ($usuario['rol_id'] == 3) {
            // Es paciente - buscar por paciente_id
            $paciente = $this->db->query(
                "SELECT id FROM pacientes WHERE usuario_id = ?",
                [$usuarioId]
            )->fetch();

            if ($paciente) {
                $conversaciones = $this->db->query(
                    "SELECT
                        c.id,
                        c.created_at,
                        c.especialista_id as otro_usuario_id,
                        u.nombre_completo as otro_usuario_nombre,
                        u.rol_id as otro_usuario_rol,
                        (SELECT contenido FROM mensajes_chat m WHERE m.conversacion_id = c.id ORDER BY m.created_at DESC LIMIT 1) as ultimo_mensaje,
                        (SELECT created_at FROM mensajes_chat m WHERE m.conversacion_id = c.id ORDER BY m.created_at DESC LIMIT 1) as ultimo_mensaje_fecha,
                        (SELECT COUNT(*) FROM mensajes_chat m WHERE m.conversacion_id = c.id AND m.remitente_id != ? AND m.leido = 0) as no_leidos
                     FROM conversaciones c
                     INNER JOIN usuarios u ON u.id = c.especialista_id
                     WHERE c.paciente_id = ?
                     ORDER BY ultimo_mensaje_fecha DESC",
                    [$usuarioId, $paciente['id']]
                )->fetchAll();
            }
        } else {
            // Es especialista - buscar por especialista_id
            $conversaciones = $this->db->query(
                "SELECT
                    c.id,
                    c.created_at,
                    p.usuario_id as otro_usuario_id,
                    u.nombre_completo as otro_usuario_nombre,
                    u.rol_id as otro_usuario_rol,
                    (SELECT contenido FROM mensajes_chat m WHERE m.conversacion_id = c.id ORDER BY m.created_at DESC LIMIT 1) as ultimo_mensaje,
                    (SELECT created_at FROM mensajes_chat m WHERE m.conversacion_id = c.id ORDER BY m.created_at DESC LIMIT 1) as ultimo_mensaje_fecha,
                    (SELECT COUNT(*) FROM mensajes_chat m WHERE m.conversacion_id = c.id AND m.remitente_id != ? AND m.leido = 0) as no_leidos
                 FROM conversaciones c
                 INNER JOIN pacientes p ON p.id = c.paciente_id
                 INNER JOIN usuarios u ON u.id = p.usuario_id
                 WHERE c.especialista_id = ?
                 ORDER BY ultimo_mensaje_fecha DESC",
                [$usuarioId, $usuarioId]
            )->fetchAll();
        }

        return Response::success(['conversaciones' => $conversaciones]);
    }

    /**
     * Obtener mensajes de una conversación
     */
    public function getMensajes($conversacionId, $usuarioId)
    {
        // Verificar que el usuario pertenece a la conversación
        $usuario = $this->db->query(
            "SELECT id, rol_id FROM usuarios WHERE id = ?",
            [$usuarioId]
        )->fetch();

        $conversacion = null;

        if ($usuario['rol_id'] == 3) {
            // Es paciente
            $paciente = $this->db->query(
                "SELECT id FROM pacientes WHERE usuario_id = ?",
                [$usuarioId]
            )->fetch();

            if ($paciente) {
                $conversacion = $this->db->query(
                    "SELECT c.*, p.usuario_id as paciente_usuario_id
                     FROM conversaciones c
                     INNER JOIN pacientes p ON p.id = c.paciente_id
                     WHERE c.id = ? AND c.paciente_id = ?",
                    [$conversacionId, $paciente['id']]
                )->fetch();
            }
        } else {
            // Es especialista
            $conversacion = $this->db->query(
                "SELECT c.*, p.usuario_id as paciente_usuario_id
                 FROM conversaciones c
                 INNER JOIN pacientes p ON p.id = c.paciente_id
                 WHERE c.id = ? AND c.especialista_id = ?",
                [$conversacionId, $usuarioId]
            )->fetch();
        }

        if (!$conversacion) {
            return Response::error('No tienes acceso a esta conversación', 403);
        }

        // Marcar mensajes como leídos
        $this->db->query(
            "UPDATE mensajes_chat SET leido = 1, leido_at = NOW() WHERE conversacion_id = ? AND remitente_id != ?",
            [$conversacionId, $usuarioId]
        );

        // Obtener mensajes
        $mensajes = $this->db->query(
            "SELECT m.id, m.remitente_id as emisor_id, m.contenido as mensaje, m.leido, m.created_at,
                    u.nombre_completo as emisor_nombre
             FROM mensajes_chat m
             INNER JOIN usuarios u ON m.remitente_id = u.id
             WHERE m.conversacion_id = ?
             ORDER BY m.created_at ASC",
            [$conversacionId]
        )->fetchAll();

        // Obtener info del otro usuario
        if ($usuario['rol_id'] == 3) {
            // Paciente viendo conversación con especialista
            $otroUsuario = $this->db->query(
                "SELECT id, nombre_completo, rol_id FROM usuarios WHERE id = ?",
                [$conversacion['especialista_id']]
            )->fetch();
        } else {
            // Especialista viendo conversación con paciente
            $otroUsuario = $this->db->query(
                "SELECT id, nombre_completo, rol_id FROM usuarios WHERE id = ?",
                [$conversacion['paciente_usuario_id']]
            )->fetch();
        }

        return Response::success([
            'conversacion' => $conversacion,
            'mensajes' => $mensajes,
            'otro_usuario' => $otroUsuario
        ]);
    }

    /**
     * Enviar mensaje
     */
    public function enviarMensaje($data)
    {
        if (empty($data['receptor_id']) || empty($data['mensaje']) || empty($data['emisor_id'])) {
            return Response::error('Faltan datos requeridos', 422);
        }

        $emisorId = $data['emisor_id'];
        $receptorId = $data['receptor_id'];
        $mensaje = $data['mensaje'];

        // Determinar quién es el paciente y quién el especialista
        $emisor = $this->db->query(
            "SELECT id, rol_id FROM usuarios WHERE id = ?",
            [$emisorId]
        )->fetch();

        $receptor = $this->db->query(
            "SELECT id, rol_id FROM usuarios WHERE id = ?",
            [$receptorId]
        )->fetch();

        if (!$emisor || !$receptor) {
            return Response::error('Usuario no encontrado', 404);
        }

        // Determinar paciente_id y especialista_id
        $pacienteId = null;
        $especialistaId = null;

        if ($emisor['rol_id'] == 3) {
            // Emisor es paciente
            $paciente = $this->db->query(
                "SELECT id FROM pacientes WHERE usuario_id = ?",
                [$emisorId]
            )->fetch();
            $pacienteId = $paciente['id'];
            $especialistaId = $receptorId;
        } else {
            // Emisor es especialista
            $paciente = $this->db->query(
                "SELECT id FROM pacientes WHERE usuario_id = ?",
                [$receptorId]
            )->fetch();
            $pacienteId = $paciente['id'];
            $especialistaId = $emisorId;
        }

        if (!$pacienteId) {
            return Response::error('No se pudo determinar el paciente', 422);
        }

        // Buscar o crear conversación
        $conversacion = $this->db->query(
            "SELECT id FROM conversaciones WHERE paciente_id = ? AND especialista_id = ?",
            [$pacienteId, $especialistaId]
        )->fetch();

        if (!$conversacion) {
            // Crear nueva conversación
            $this->db->query(
                "INSERT INTO conversaciones (paciente_id, especialista_id, created_at) VALUES (?, ?, NOW())",
                [$pacienteId, $especialistaId]
            );
            $conversacionId = $this->db->lastInsertId();
        } else {
            $conversacionId = $conversacion['id'];
        }

        // Calcular expiración (24 horas por defecto)
        $expiraEn = date('Y-m-d H:i:s', strtotime('+24 hours'));

        // Insertar mensaje
        $this->db->query(
            "INSERT INTO mensajes_chat (conversacion_id, remitente_id, contenido, leido, expira_en, created_at)
             VALUES (?, ?, ?, 0, ?, NOW())",
            [$conversacionId, $emisorId, $mensaje, $expiraEn]
        );

        $mensajeId = $this->db->lastInsertId();

        // Actualizar último mensaje de conversación
        $this->db->query(
            "UPDATE conversaciones SET ultimo_mensaje_at = NOW() WHERE id = ?",
            [$conversacionId]
        );

        return Response::success([
            'id' => $mensajeId,
            'conversacion_id' => $conversacionId
        ], 'Mensaje enviado', 201);
    }

    /**
     * Obtener conteo de mensajes no leídos
     */
    public function getNoLeidos($usuarioId)
    {
        $result = $this->db->query(
            "SELECT COUNT(*) as total FROM mensajes_chat WHERE remitente_id != ? AND leido = 0
             AND conversacion_id IN (
                SELECT c.id FROM conversaciones c
                INNER JOIN pacientes p ON p.id = c.paciente_id
                WHERE c.especialista_id = ? OR p.usuario_id = ?
             )",
            [$usuarioId, $usuarioId, $usuarioId]
        )->fetch();

        return Response::success(['total' => (int)($result['total'] ?? 0)]);
    }

    /**
     * Iniciar conversación con un usuario (obtener o crear)
     */
    public function iniciarConversacion($usuarioId, $otroUsuarioId)
    {
        // Verificar que el otro usuario existe
        $otroUsuario = $this->db->query(
            "SELECT id, nombre_completo, rol_id FROM usuarios WHERE id = ?",
            [$otroUsuarioId]
        )->fetch();

        if (!$otroUsuario) {
            return Response::error('Usuario no encontrado', 404);
        }

        // Determinar quién es paciente y quién especialista
        $usuario = $this->db->query(
            "SELECT id, rol_id FROM usuarios WHERE id = ?",
            [$usuarioId]
        )->fetch();

        if (!$usuario) {
            return Response::error('Usuario actual no encontrado', 404);
        }

        $pacienteId = null;
        $especialistaId = null;

        // Verificar si el usuario actual es paciente (rol_id = 3)
        if ($usuario['rol_id'] == 3) {
            // Usuario actual es paciente
            $paciente = $this->db->query(
                "SELECT id FROM pacientes WHERE usuario_id = ?",
                [$usuarioId]
            )->fetch();

            if ($paciente) {
                $pacienteId = $paciente['id'];
                $especialistaId = $otroUsuarioId;
            }
        } else {
            // Usuario actual es especialista, buscar paciente del otro usuario
            $paciente = $this->db->query(
                "SELECT id FROM pacientes WHERE usuario_id = ?",
                [$otroUsuarioId]
            )->fetch();

            if ($paciente) {
                $pacienteId = $paciente['id'];
                $especialistaId = $usuarioId;
            } else {
                // El otro usuario tampoco es paciente, verificar si tiene paciente_id directo
                // Esto puede pasar si el otro usuario es un paciente pero no tiene registro en tabla pacientes
                // Intentar buscar por el ID directamente
                $pacienteDirecto = $this->db->query(
                    "SELECT id FROM pacientes WHERE id = ?",
                    [$otroUsuarioId]
                )->fetch();

                if ($pacienteDirecto) {
                    $pacienteId = $pacienteDirecto['id'];
                    $especialistaId = $usuarioId;
                }
            }
        }

        if (!$pacienteId) {
            // Último intento: si estamos pasando el paciente.id directamente (no usuario_id)
            $pacienteDirecto = $this->db->query(
                "SELECT id, usuario_id FROM pacientes WHERE id = ?",
                [$otroUsuarioId]
            )->fetch();

            if ($pacienteDirecto) {
                $pacienteId = $pacienteDirecto['id'];
                $especialistaId = $usuarioId;

                // Actualizar otroUsuario con info del paciente
                $otroUsuario = $this->db->query(
                    "SELECT id, nombre_completo, rol_id FROM usuarios WHERE id = ?",
                    [$pacienteDirecto['usuario_id']]
                )->fetch() ?: $otroUsuario;
            }
        }

        if (!$pacienteId) {
            return Response::error('No se pudo determinar el paciente. Verifica que el usuario sea un paciente registrado.', 422);
        }

        // Buscar conversación existente
        $conversacion = $this->db->query(
            "SELECT id FROM conversaciones WHERE paciente_id = ? AND especialista_id = ?",
            [$pacienteId, $especialistaId]
        )->fetch();

        if (!$conversacion) {
            // Crear nueva conversación
            $this->db->query(
                "INSERT INTO conversaciones (paciente_id, especialista_id, created_at) VALUES (?, ?, NOW())",
                [$pacienteId, $especialistaId]
            );
            $conversacionId = $this->db->lastInsertId();
        } else {
            $conversacionId = $conversacion['id'];
        }

        return Response::success([
            'conversacion_id' => $conversacionId,
            'otro_usuario' => $otroUsuario
        ]);
    }
}
