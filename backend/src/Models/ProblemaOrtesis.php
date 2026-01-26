<?php
namespace App\Models;
use App\Services\DatabaseService;

class ProblemaOrtesis {
    private static $table = 'problemas_ortesis';

    public static function find($id) {
        $db = DatabaseService::getInstance();
        return $db->query("SELECT * FROM " . self::$table . " WHERE id = ?", [$id])->fetch();
    }

    public static function getAll() {
        $db = DatabaseService::getInstance();
        return $db->query("SELECT * FROM " . self::$table . " ORDER BY created_at DESC")->fetchAll();
    }

    public static function getByPaciente($pacienteId, $estado = null) {
        $db = DatabaseService::getInstance();

        $query = "SELECT * FROM " . self::$table . " WHERE paciente_id = ?";
        $params = [$pacienteId];

        if ($estado) {
            $query .= " AND estado = ?";
            $params[] = $estado;
        }

        $query .= " ORDER BY created_at DESC";

        return $db->query($query, $params)->fetchAll();
    }

    public static function create($data) {
        $db = DatabaseService::getInstance();

        $db->query(
            "INSERT INTO " . self::$table . "
             (paciente_id, tipo_problema, descripcion, urgencia, estado, created_at)
             VALUES (?, ?, ?, ?, 'pendiente', NOW())",
            [
                $data['paciente_id'],
                $data['tipo_problema'],
                $data['descripcion'],
                $data['urgencia'] ?? 'normal'
            ]
        );

        $id = $db->lastInsertId();
        return ['id' => $id];
    }

    public static function update($id, $data) {
        $db = DatabaseService::getInstance();

        $fields = [];
        $values = [];

        $allowedFields = ['tipo_problema', 'descripcion', 'urgencia', 'estado', 'notas_resolucion'];

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

    public static function updateEstado($id, $estado, $notas = null) {
        $db = DatabaseService::getInstance();

        $db->query(
            "UPDATE " . self::$table . " SET estado = ?, notas_resolucion = ?, updated_at = NOW() WHERE id = ?",
            [$estado, $notas, $id]
        );

        return true;
    }

    public static function delete($id) {
        $db = DatabaseService::getInstance();
        return $db->query("DELETE FROM " . self::$table . " WHERE id = ?", [$id]);
    }
}
