<?php
namespace App\Models;
use App\Services\DatabaseService;

class Articulo {
    private static $table = 'articulos';

    public static function find($id) {
        $db = DatabaseService::getInstance();
        $articulo = $db->query(
            "SELECT a.*, u.nombre_completo as autor_nombre, am.nombre as categoria
             FROM " . self::$table . " a
             LEFT JOIN usuarios u ON a.autor_id = u.id
             LEFT JOIN areas_medicas am ON a.area_medica_id = am.id
             WHERE a.id = ?",
            [$id]
        )->fetch();

        if ($articulo) {
            // Obtener likes de la tabla likes_articulo
            $likes = $db->query(
                "SELECT COUNT(*) as total FROM likes_articulo WHERE articulo_id = ?",
                [$id]
            )->fetch();
            $articulo['like_count'] = $likes['total'] ?? 0;
        }

        return $articulo;
    }

    public static function getAll($filters = []) {
        $db = DatabaseService::getInstance();

        $query = "SELECT a.*, u.nombre_completo as autor_nombre, am.nombre as categoria,
                         (SELECT COUNT(*) FROM likes_articulo WHERE articulo_id = a.id) as like_count
                  FROM " . self::$table . " a
                  LEFT JOIN usuarios u ON a.autor_id = u.id
                  LEFT JOIN areas_medicas am ON a.area_medica_id = am.id
                  WHERE a.publicado = 1";
        $params = [];

        if (!empty($filters['area_medica_id'])) {
            $query .= " AND a.area_medica_id = ?";
            $params[] = $filters['area_medica_id'];
        }

        $query .= " ORDER BY a.fecha_publicacion DESC, a.created_at DESC LIMIT 50";

        return $db->query($query, $params)->fetchAll();
    }

    public static function create($data) {
        $db = DatabaseService::getInstance();

        $db->query(
            "INSERT INTO " . self::$table . "
             (titulo, contenido, resumen, imagen_portada_url, area_medica_id, autor_id, publicado, fecha_publicacion, created_at)
             VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())",
            [
                $data['titulo'],
                $data['contenido'],
                $data['resumen'] ?? substr(strip_tags($data['contenido']), 0, 200),
                $data['imagen_portada_url'] ?? $data['imagen_destacada'] ?? null,
                $data['area_medica_id'] ?? $data['categoria'] ?? 1,
                $data['autor_id']
            ]
        );

        return $db->lastInsertId();
    }

    public static function update($id, $data) {
        $db = DatabaseService::getInstance();

        $fields = [];
        $values = [];

        $allowedFields = ['titulo', 'contenido', 'resumen', 'imagen_portada_url', 'area_medica_id', 'publicado'];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = ?";
                $values[] = $data[$field];
            }
        }

        if (empty($fields)) return false;

        $values[] = $id;
        $query = "UPDATE " . self::$table . " SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE id = ?";

        return $db->query($query, $values);
    }

    public static function delete($id) {
        $db = DatabaseService::getInstance();
        return $db->query("DELETE FROM " . self::$table . " WHERE id = ?", [$id]);
    }

    public static function incrementViews($id) {
        $db = DatabaseService::getInstance();
        $db->query("UPDATE " . self::$table . " SET vistas = vistas + 1 WHERE id = ?", [$id]);
    }

    public static function getRelacionados($id, $limit = 3) {
        $db = DatabaseService::getInstance();

        $articulo = self::find($id);
        if (!$articulo) return [];

        return $db->query(
            "SELECT a.*, u.nombre_completo as autor_nombre, am.nombre as categoria
             FROM " . self::$table . " a
             LEFT JOIN usuarios u ON a.autor_id = u.id
             LEFT JOIN areas_medicas am ON a.area_medica_id = am.id
             WHERE a.id != ? AND a.area_medica_id = ? AND a.publicado = 1
             ORDER BY a.created_at DESC
             LIMIT ?",
            [$id, $articulo['area_medica_id'], $limit]
        )->fetchAll();
    }

    public static function getByCategoria($categoria) {
        $db = DatabaseService::getInstance();

        return $db->query(
            "SELECT a.*, u.nombre_completo as autor_nombre, am.nombre as categoria_nombre
             FROM " . self::$table . " a
             LEFT JOIN usuarios u ON a.autor_id = u.id
             LEFT JOIN areas_medicas am ON a.area_medica_id = am.id
             WHERE a.area_medica_id = ? AND a.publicado = 1
             ORDER BY a.created_at DESC",
            [$categoria]
        )->fetchAll();
    }

    public static function getMostViewed($limit = 10) {
        $db = DatabaseService::getInstance();

        return $db->query(
            "SELECT a.*, u.nombre_completo as autor_nombre, am.nombre as categoria
             FROM " . self::$table . " a
             LEFT JOIN usuarios u ON a.autor_id = u.id
             LEFT JOIN areas_medicas am ON a.area_medica_id = am.id
             WHERE a.publicado = 1
             ORDER BY a.vistas DESC
             LIMIT ?",
            [$limit]
        )->fetchAll();
    }

    public static function getByAutor($autorId) {
        $db = DatabaseService::getInstance();

        return $db->query(
            "SELECT * FROM " . self::$table . " WHERE autor_id = ? ORDER BY created_at DESC",
            [$autorId]
        )->fetchAll();
    }

    public static function toggleLike($articuloId, $usuarioId) {
        $db = DatabaseService::getInstance();

        // Verificar si ya existe el like
        $existing = $db->query(
            "SELECT id FROM likes_articulo WHERE articulo_id = ? AND usuario_id = ?",
            [$articuloId, $usuarioId]
        )->fetch();

        if ($existing) {
            // Quitar like
            $db->query(
                "DELETE FROM likes_articulo WHERE articulo_id = ? AND usuario_id = ?",
                [$articuloId, $usuarioId]
            );
            // Actualizar contador en tabla articulos
            $db->query(
                "UPDATE " . self::$table . " SET likes = GREATEST(0, likes - 1) WHERE id = ?",
                [$articuloId]
            );
            return ['liked' => false];
        } else {
            // Agregar like
            $db->query(
                "INSERT INTO likes_articulo (articulo_id, usuario_id, created_at) VALUES (?, ?, NOW())",
                [$articuloId, $usuarioId]
            );
            // Actualizar contador en tabla articulos
            $db->query(
                "UPDATE " . self::$table . " SET likes = likes + 1 WHERE id = ?",
                [$articuloId]
            );
            return ['liked' => true];
        }
    }

    public static function getLikeCount($articuloId) {
        $db = DatabaseService::getInstance();

        $result = $db->query(
            "SELECT COUNT(*) as total FROM likes_articulo WHERE articulo_id = ?",
            [$articuloId]
        )->fetch();

        return $result['total'] ?? 0;
    }

    public static function hasUserLiked($articuloId, $usuarioId) {
        $db = DatabaseService::getInstance();

        $result = $db->query(
            "SELECT id FROM likes_articulo WHERE articulo_id = ? AND usuario_id = ?",
            [$articuloId, $usuarioId]
        )->fetch();

        return $result !== false;
    }
}
