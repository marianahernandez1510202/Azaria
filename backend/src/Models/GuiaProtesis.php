<?php
namespace App\Models;
use App\Services\DatabaseService;

class GuiaProtesis {
    private static $table = 'guias_cuidado';

    public static function find($id) {
        $db = DatabaseService::getInstance();
        return $db->query(
            "SELECT * FROM " . self::$table . " WHERE id = ?",
            [$id]
        )->fetch();
    }

    public static function getAll($tipo = null) {
        $db = DatabaseService::getInstance();

        $query = "SELECT * FROM " . self::$table . " WHERE publicado = 1";
        $params = [];

        if ($tipo) {
            $query .= " AND tipo = ?";
            $params[] = $tipo;
        }

        $query .= " ORDER BY orden, created_at DESC";

        return $db->query($query, $params)->fetchAll();
    }

    public static function create($data) {
        $db = DatabaseService::getInstance();

        $db->query(
            "INSERT INTO " . self::$table . "
             (titulo, tipo, contenido, imagen_url, orden, creado_por, publicado, created_at)
             VALUES (?, ?, ?, ?, ?, ?, 1, NOW())",
            [
                $data['titulo'],
                $data['tipo'] ?? 'otro',
                $data['contenido'],
                $data['imagen_url'] ?? null,
                $data['orden'] ?? 0,
                $data['creado_por'] ?? null
            ]
        );

        return $db->lastInsertId();
    }

    public static function update($id, $data) {
        $db = DatabaseService::getInstance();

        $fields = [];
        $values = [];

        $allowedFields = ['titulo', 'tipo', 'contenido', 'imagen_url', 'orden', 'publicado'];

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

    public static function getByTipo($tipo) {
        $db = DatabaseService::getInstance();
        return $db->query(
            "SELECT * FROM " . self::$table . " WHERE tipo = ? AND publicado = 1 ORDER BY orden",
            [$tipo]
        )->fetchAll();
    }
}
