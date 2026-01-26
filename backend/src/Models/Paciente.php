<?php

namespace App\Models;

use App\Services\DatabaseService;

class Paciente
{
    private static $table = 'pacientes';

    public static function find($id)
    {
        $db = DatabaseService::getInstance();
        return $db->query("SELECT * FROM " . self::$table . " WHERE id = ?", [$id])->fetch();
    }

    public static function findByUserId($userId)
    {
        $db = DatabaseService::getInstance();
        return $db->query("SELECT p.*, u.* FROM " . self::$table . " p
                          JOIN users u ON p.user_id = u.id
                          WHERE p.user_id = ?", [$userId])->fetch();
    }

    public static function create($data)
    {
        $db = DatabaseService::getInstance();

        $query = "INSERT INTO " . self::$table . "
                  (user_id, fase_actual, fecha_amputacion, tipo_amputacion, causa_amputacion,
                   enfermedades_cronicas, alergias, medicamentos_actuales, created_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";

        $db->query($query, [
            $data['user_id'],
            $data['fase_actual'] ?? FASE_PREOPERATORIA,
            $data['fecha_amputacion'] ?? null,
            $data['tipo_amputacion'] ?? null,
            $data['causa_amputacion'] ?? null,
            $data['enfermedades_cronicas'] ?? null,
            $data['alergias'] ?? null,
            $data['medicamentos_actuales'] ?? null
        ]);

        return self::findByUserId($data['user_id']);
    }

    public static function update($id, $data)
    {
        $db = DatabaseService::getInstance();

        $fields = [];
        $values = [];

        foreach ($data as $key => $value) {
            if ($key !== 'id' && $key !== 'user_id') {
                $fields[] = "$key = ?";
                $values[] = $value;
            }
        }

        $values[] = $id;

        $query = "UPDATE " . self::$table . " SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE id = ?";

        return $db->query($query, $values);
    }

    public static function getAll()
    {
        $db = DatabaseService::getInstance();
        return $db->query("SELECT p.*, u.nombre_completo, u.email
                          FROM " . self::$table . " p
                          JOIN users u ON p.user_id = u.id
                          ORDER BY p.created_at DESC")->fetchAll();
    }

    public static function getEspecialistasAsignados($pacienteId)
    {
        $db = DatabaseService::getInstance();
        return $db->query(
            "SELECT e.*, u.nombre_completo, u.email, pe.especialidad
             FROM paciente_especialista pe
             JOIN especialistas e ON pe.especialista_id = e.id
             JOIN users u ON e.user_id = u.id
             WHERE pe.paciente_id = ?",
            [$pacienteId]
        )->fetchAll();
    }

    public static function assignEspecialista($pacienteId, $especialistaId, $especialidad)
    {
        $db = DatabaseService::getInstance();
        return $db->query(
            "INSERT INTO paciente_especialista (paciente_id, especialista_id, especialidad, created_at)
             VALUES (?, ?, ?, NOW())
             ON DUPLICATE KEY UPDATE updated_at = NOW()",
            [$pacienteId, $especialistaId, $especialidad]
        );
    }

    public static function removeEspecialista($pacienteId, $especialistaId)
    {
        $db = DatabaseService::getInstance();
        return $db->query(
            "DELETE FROM paciente_especialista WHERE paciente_id = ? AND especialista_id = ?",
            [$pacienteId, $especialistaId]
        );
    }
}
