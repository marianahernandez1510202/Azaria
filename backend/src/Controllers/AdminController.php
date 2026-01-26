<?php

namespace App\Controllers;

use App\Services\DatabaseService;
use App\Utils\Response;

class AdminController
{
    private $db;

    public function __construct()
    {
        $this->db = DatabaseService::getInstance();
    }

    // ===== MÉTRICAS GENERALES =====
    public function getMetricas()
    {
        // Total usuarios
        $totalUsuarios = $this->db->query(
            "SELECT COUNT(*) as total FROM usuarios"
        )->fetch();

        // Pacientes activos
        $pacientesActivos = $this->db->query(
            "SELECT COUNT(*) as total FROM usuarios WHERE rol_id = 3 AND activo = 1"
        )->fetch();

        // Total especialistas
        $totalEspecialistas = $this->db->query(
            "SELECT COUNT(*) as total FROM usuarios WHERE rol_id = 2"
        )->fetch();

        // Citas de hoy
        $citasHoy = $this->db->query(
            "SELECT COUNT(*) as total FROM citas WHERE fecha = CURDATE()"
        )->fetch();

        // Nuevos usuarios este mes
        $nuevosEsteMes = $this->db->query(
            "SELECT COUNT(*) as total FROM usuarios
             WHERE MONTH(created_at) = MONTH(CURDATE())
             AND YEAR(created_at) = YEAR(CURDATE())"
        )->fetch();

        // Especialistas por área
        $especialistasPorArea = $this->db->query(
            "SELECT am.id, am.nombre, am.icono, am.color, COUNT(u.id) as total
             FROM areas_medicas am
             LEFT JOIN usuarios u ON u.area_medica_id = am.id AND u.rol_id = 2
             GROUP BY am.id, am.nombre, am.icono, am.color"
        )->fetchAll();

        return Response::success([
            'total_usuarios' => (int)($totalUsuarios['total'] ?? 0),
            'pacientes_activos' => (int)($pacientesActivos['total'] ?? 0),
            'total_especialistas' => (int)($totalEspecialistas['total'] ?? 0),
            'citas_hoy' => (int)($citasHoy['total'] ?? 0),
            'nuevos_mes' => (int)($nuevosEsteMes['total'] ?? 0),
            'especialistas_por_area' => $especialistasPorArea
        ]);
    }

    // ===== USUARIOS =====
    public function getUsuarios()
    {
        $usuarios = $this->db->query(
            "SELECT u.id, u.email, u.nombre_completo as nombre, u.fecha_nacimiento,
                    u.rol_id, r.nombre as rol, u.activo, u.ultimo_acceso,
                    DATE(u.created_at) as fecha_registro,
                    am.nombre as area_medica
             FROM usuarios u
             INNER JOIN roles r ON u.rol_id = r.id
             LEFT JOIN areas_medicas am ON u.area_medica_id = am.id
             ORDER BY u.created_at DESC"
        )->fetchAll();

        return Response::success(['usuarios' => $usuarios]);
    }

    public function createUsuario($data)
    {
        // Validar datos requeridos
        if (empty($data['email']) || empty($data['nombre_completo']) || empty($data['rol_id'])) {
            return Response::error('Faltan datos requeridos', 422);
        }

        // Verificar que el email no exista
        $exists = $this->db->query(
            "SELECT id FROM usuarios WHERE email = ?",
            [$data['email']]
        )->fetch();

        if ($exists) {
            return Response::error('El email ya está registrado', 422);
        }

        // Generar contraseña temporal
        $tempPassword = 'Azaria' . rand(1000, 9999);
        $passwordHash = password_hash($tempPassword, PASSWORD_DEFAULT);

        $this->db->query(
            "INSERT INTO usuarios (email, password_hash, nombre_completo, fecha_nacimiento, rol_id, area_medica_id, activo, created_at)
             VALUES (?, ?, ?, ?, ?, ?, 1, NOW())",
            [
                $data['email'],
                $passwordHash,
                $data['nombre_completo'],
                $data['fecha_nacimiento'] ?? null,
                $data['rol_id'],
                $data['area_medica_id'] ?? null
            ]
        );

        $userId = $this->db->lastInsertId();

        // Si es paciente, crear registro en tabla pacientes
        if ($data['rol_id'] == 3) {
            $this->db->query(
                "INSERT INTO pacientes (usuario_id, fase_actual_id, created_at) VALUES (?, 1, NOW())",
                [$userId]
            );
        }

        return Response::success([
            'id' => $userId,
            'password_temporal' => $tempPassword
        ], 'Usuario creado exitosamente', 201);
    }

    public function updateUsuario($id, $data)
    {
        // Construir query dinámicamente
        $fields = [];
        $values = [];

        if (isset($data['nombre_completo'])) {
            $fields[] = 'nombre_completo = ?';
            $values[] = $data['nombre_completo'];
        }
        if (isset($data['email'])) {
            $fields[] = 'email = ?';
            $values[] = $data['email'];
        }
        if (isset($data['fecha_nacimiento'])) {
            $fields[] = 'fecha_nacimiento = ?';
            $values[] = $data['fecha_nacimiento'];
        }
        if (isset($data['activo'])) {
            $fields[] = 'activo = ?';
            $values[] = $data['activo'] ? 1 : 0;
        }
        if (isset($data['rol_id'])) {
            $fields[] = 'rol_id = ?';
            $values[] = $data['rol_id'];
        }
        if (isset($data['area_medica_id'])) {
            $fields[] = 'area_medica_id = ?';
            $values[] = $data['area_medica_id'];
        }

        if (empty($fields)) {
            return Response::error('No hay datos para actualizar', 422);
        }

        $values[] = $id;
        $sql = "UPDATE usuarios SET " . implode(', ', $fields) . " WHERE id = ?";

        $this->db->query($sql, $values);

        return Response::success(null, 'Usuario actualizado exitosamente');
    }

    public function deleteUsuario($id)
    {
        // No permitir eliminar al admin principal (id = 1)
        if ($id == 1) {
            return Response::error('No se puede eliminar al administrador principal', 403);
        }

        $this->db->query("DELETE FROM usuarios WHERE id = ?", [$id]);

        return Response::success(null, 'Usuario eliminado exitosamente');
    }

    public function toggleUsuarioActivo($id)
    {
        $this->db->query(
            "UPDATE usuarios SET activo = NOT activo WHERE id = ?",
            [$id]
        );

        return Response::success(null, 'Estado del usuario actualizado');
    }

    // ===== ESPECIALISTAS =====
    public function getEspecialistas()
    {
        $especialistas = $this->db->query(
            "SELECT u.id, u.email, u.nombre_completo as nombre, u.activo, u.ultimo_acceso,
                    am.id as area_medica_id, am.nombre as area_medica, am.color as area_color,
                    (SELECT COUNT(*) FROM asignaciones_especialista ae
                     WHERE ae.especialista_id = u.id AND ae.activo = 1) as pacientes
             FROM usuarios u
             INNER JOIN areas_medicas am ON u.area_medica_id = am.id
             WHERE u.rol_id = 2
             ORDER BY am.nombre, u.nombre_completo"
        )->fetchAll();

        return Response::success(['especialistas' => $especialistas]);
    }

    // ===== MÉTRICAS DE BLOG/COMUNIDAD =====
    public function getBlogMetricas()
    {
        // Total artículos
        $totalArticulos = $this->db->query(
            "SELECT COUNT(*) as total FROM articulos WHERE publicado = 1"
        )->fetch();

        // Total vistas
        $totalVistas = $this->db->query(
            "SELECT COALESCE(SUM(vistas), 0) as total FROM articulos"
        )->fetch();

        // Total likes
        $totalLikes = $this->db->query(
            "SELECT COUNT(*) as total FROM likes_articulo"
        )->fetch();

        // Publicaciones de comunidad
        $totalPublicaciones = $this->db->query(
            "SELECT COUNT(*) as total FROM publicaciones_comunidad WHERE estado = 'aprobada'"
        )->fetch();

        // Artículos más populares
        $articulosPopulares = $this->db->query(
            "SELECT a.id, a.titulo, a.vistas, a.likes, u.nombre_completo as autor,
                    DATE(a.created_at) as fecha
             FROM articulos a
             INNER JOIN usuarios u ON a.autor_id = u.id
             WHERE a.publicado = 1
             ORDER BY a.vistas DESC
             LIMIT 5"
        )->fetchAll();

        // Engagement rate (reacciones + comentarios / publicaciones)
        $totalReacciones = $this->db->query(
            "SELECT COUNT(*) as total FROM reacciones_publicacion"
        )->fetch();
        $totalComentarios = $this->db->query(
            "SELECT COUNT(*) as total FROM comentarios_comunidad"
        )->fetch();

        $engagementRate = 0;
        if ($totalPublicaciones['total'] > 0) {
            $engagementRate = round(
                (($totalReacciones['total'] + $totalComentarios['total']) / $totalPublicaciones['total']) * 100,
                1
            );
        }

        return Response::success([
            'total_articulos' => (int)($totalArticulos['total'] ?? 0),
            'visitas_blog' => (int)($totalVistas['total'] ?? 0),
            'total_posts' => (int)($totalArticulos['total'] ?? 0),
            'total_likes' => (int)($totalLikes['total'] ?? 0),
            'total_publicaciones' => (int)($totalPublicaciones['total'] ?? 0),
            'engagement' => $engagementRate,
            'blogs' => $articulosPopulares
        ]);
    }

    // ===== FAQs =====
    public function getFAQs()
    {
        $faqs = $this->db->query(
            "SELECT f.id, f.pregunta, f.respuesta, f.publicada as activo, f.vistas,
                    am.nombre as categoria, am.id as area_medica_id
             FROM faqs f
             LEFT JOIN areas_medicas am ON f.area_medica_id = am.id
             ORDER BY f.orden, f.id"
        )->fetchAll();

        return Response::success(['faqs' => $faqs]);
    }

    public function createFAQ($data)
    {
        if (empty($data['pregunta']) || empty($data['respuesta'])) {
            return Response::error('Pregunta y respuesta son requeridos', 422);
        }

        $this->db->query(
            "INSERT INTO faqs (pregunta, respuesta, area_medica_id, publicada, creado_por, created_at)
             VALUES (?, ?, ?, ?, ?, NOW())",
            [
                $data['pregunta'],
                $data['respuesta'],
                $data['area_medica_id'] ?? null,
                $data['publicada'] ?? 1,
                $data['creado_por'] ?? 1
            ]
        );

        return Response::success(['id' => $this->db->lastInsertId()], 'FAQ creada exitosamente', 201);
    }

    public function updateFAQ($id, $data)
    {
        $fields = [];
        $values = [];

        if (isset($data['pregunta'])) {
            $fields[] = 'pregunta = ?';
            $values[] = $data['pregunta'];
        }
        if (isset($data['respuesta'])) {
            $fields[] = 'respuesta = ?';
            $values[] = $data['respuesta'];
        }
        if (isset($data['area_medica_id'])) {
            $fields[] = 'area_medica_id = ?';
            $values[] = $data['area_medica_id'];
        }
        if (isset($data['publicada'])) {
            $fields[] = 'publicada = ?';
            $values[] = $data['publicada'] ? 1 : 0;
        }

        if (empty($fields)) {
            return Response::error('No hay datos para actualizar', 422);
        }

        $values[] = $id;
        $sql = "UPDATE faqs SET " . implode(', ', $fields) . " WHERE id = ?";

        $this->db->query($sql, $values);

        return Response::success(null, 'FAQ actualizada exitosamente');
    }

    public function deleteFAQ($id)
    {
        $this->db->query("DELETE FROM faqs WHERE id = ?", [$id]);
        return Response::success(null, 'FAQ eliminada exitosamente');
    }
}
