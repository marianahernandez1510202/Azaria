<?php

namespace App\Models;

use App\Services\DatabaseService;

class Especialista
{
    private static $table = 'especialistas';

    public static function find($id)
    {
        $db = DatabaseService::getInstance();
        return $db->query("SELECT * FROM " . self::$table . " WHERE id = ?", [$id])->fetch();
    }

    public static function findByUserId($userId)
    {
        $db = DatabaseService::getInstance();
        return $db->query("SELECT e.*, u.* FROM " . self::$table . " e
                          JOIN users u ON e.user_id = u.id
                          WHERE e.user_id = ?", [$userId])->fetch();
    }

    public static function create($data)
    {
        $db = DatabaseService::getInstance();

        $query = "INSERT INTO " . self::$table . "
                  (user_id, especialidad, cedula_profesional, horario_disponibilidad, created_at)
                  VALUES (?, ?, ?, ?, NOW())";

        $db->query($query, [
            $data['user_id'],
            $data['especialidad'],
            $data['cedula_profesional'] ?? null,
            json_encode($data['horario_disponibilidad'] ?? [])
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
                if ($key === 'horario_disponibilidad') {
                    $fields[] = "$key = ?";
                    $values[] = json_encode($value);
                } else {
                    $fields[] = "$key = ?";
                    $values[] = $value;
                }
            }
        }

        $values[] = $id;

        $query = "UPDATE " . self::$table . " SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE id = ?";

        return $db->query($query, $values);
    }

    public static function getPacientesAsignados($especialistaId)
    {
        $db = DatabaseService::getInstance();
        return $db->query(
            "SELECT p.*, u.nombre_completo, u.email, u.fecha_nacimiento, pe.especialidad
             FROM paciente_especialista pe
             JOIN pacientes p ON pe.paciente_id = p.id
             JOIN users u ON p.user_id = u.id
             WHERE pe.especialista_id = ?
             ORDER BY u.nombre_completo",
            [$especialistaId]
        )->fetchAll();
    }

    public static function getByEspecialidad($especialidad)
    {
        $db = DatabaseService::getInstance();
        return $db->query(
            "SELECT e.*, u.nombre_completo, u.email
             FROM " . self::$table . " e
             JOIN users u ON e.user_id = u.id
             WHERE e.especialidad = ?",
            [$especialidad]
        )->fetchAll();
    }
}
