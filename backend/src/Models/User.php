<?php

namespace App\Models;

use App\Services\DatabaseService;

class User
{
    private static $table = 'usuarios';

    public static function find($id)
    {
        $db = DatabaseService::getInstance();
        $user = $db->query(
            "SELECT u.*, r.nombre as rol_nombre, p.id as paciente_id
             FROM " . self::$table . " u
             LEFT JOIN roles r ON u.rol_id = r.id
             LEFT JOIN pacientes p ON p.usuario_id = u.id
             WHERE u.id = ?",
            [$id]
        )->fetch();

        // No devolver el password_hash ni pin_hash al frontend
        if ($user) {
            unset($user['password_hash']);
            unset($user['pin_hash']);
        }

        return $user;
    }

    public static function findByEmail($email)
    {
        $db = DatabaseService::getInstance();
        return $db->query("SELECT * FROM " . self::$table . " WHERE email = ?", [$email])->fetch();
    }

    public static function create($data)
    {
        $db = DatabaseService::getInstance();

        // Obtener rol_id basado en el nombre del rol
        $rolId = self::getRolId($data['rol'] ?? 'paciente');

        $query = "INSERT INTO " . self::$table . "
                  (email, password_hash, nombre_completo, rol_id, fecha_nacimiento, primer_acceso, activo, email_verificado, created_at)
                  VALUES (?, ?, ?, ?, ?, 1, 1, 0, NOW())";

        $db->query($query, [
            $data['email'],
            password_hash($data['password'], PASSWORD_BCRYPT),
            $data['nombre_completo'],
            $rolId,
            $data['fecha_nacimiento'] ?? null
        ]);

        return self::findByEmail($data['email']);
    }

    public static function update($id, $data)
    {
        $db = DatabaseService::getInstance();

        $fields = [];
        $values = [];

        foreach ($data as $key => $value) {
            if (!in_array($key, ['password', 'password_hash', 'id', 'pin', 'pin_hash'])) {
                $fields[] = "$key = ?";
                $values[] = $value;
            }
        }

        $values[] = $id;

        $query = "UPDATE " . self::$table . " SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE id = ?";

        return $db->query($query, $values);
    }

    public static function updatePassword($id, $newPassword)
    {
        $db = DatabaseService::getInstance();
        return $db->query(
            "UPDATE " . self::$table . " SET password_hash = ?, updated_at = NOW() WHERE id = ?",
            [password_hash($newPassword, PASSWORD_BCRYPT), $id]
        );
    }

    public static function updatePIN($id, $newPIN)
    {
        $db = DatabaseService::getInstance();
        return $db->query(
            "UPDATE " . self::$table . " SET pin_hash = ?, usar_pin = 1, updated_at = NOW() WHERE id = ?",
            [password_hash($newPIN, PASSWORD_BCRYPT), $id]
        );
    }

    public static function verifyPassword($email, $password)
    {
        $user = self::findByEmail($email);

        if (!$user) {
            return false;
        }

        return password_verify($password, $user['password_hash']) ? $user : false;
    }

    public static function markFirstLoginComplete($id)
    {
        $db = DatabaseService::getInstance();
        return $db->query("UPDATE " . self::$table . " SET primer_acceso = 0 WHERE id = ?", [$id]);
    }

    public static function getAll($rolId = null)
    {
        $db = DatabaseService::getInstance();

        if ($rolId) {
            return $db->query(
                "SELECT u.*, r.nombre as rol_nombre
                 FROM " . self::$table . " u
                 LEFT JOIN roles r ON u.rol_id = r.id
                 WHERE u.rol_id = ?
                 ORDER BY u.created_at DESC",
                [$rolId]
            )->fetchAll();
        }

        return $db->query(
            "SELECT u.*, r.nombre as rol_nombre
             FROM " . self::$table . " u
             LEFT JOIN roles r ON u.rol_id = r.id
             ORDER BY u.created_at DESC"
        )->fetchAll();
    }

    public static function delete($id)
    {
        $db = DatabaseService::getInstance();
        return $db->query("DELETE FROM " . self::$table . " WHERE id = ?", [$id]);
    }

    public static function getPacientes()
    {
        return self::getAll(3); // rol_id 3 = paciente
    }

    public static function getEspecialistas()
    {
        return self::getAll(2); // rol_id 2 = especialista
    }

    public static function getByArea($areaMedicaId)
    {
        $db = DatabaseService::getInstance();
        return $db->query(
            "SELECT * FROM " . self::$table . " WHERE area_medica_id = ? AND activo = 1",
            [$areaMedicaId]
        )->fetchAll();
    }

    private static function getRolId($rolNombre)
    {
        $roles = [
            'administrador' => 1,
            'admin' => 1,
            'especialista' => 2,
            'paciente' => 3
        ];

        return $roles[strtolower($rolNombre)] ?? 3;
    }

    public static function getWithRol($id)
    {
        $db = DatabaseService::getInstance();
        return $db->query(
            "SELECT u.*, r.nombre as rol_nombre, am.nombre as area_nombre
             FROM " . self::$table . " u
             LEFT JOIN roles r ON u.rol_id = r.id
             LEFT JOIN areas_medicas am ON u.area_medica_id = am.id
             WHERE u.id = ?",
            [$id]
        )->fetch();
    }
}
