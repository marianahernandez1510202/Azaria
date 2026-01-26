<?php

namespace App\Controllers;

use App\Models\User;
use App\Services\DatabaseService;
use App\Utils\Response;
use App\Utils\Validator;

class PerfilController
{
    public function getPerfil($userId)
    {
        $user = User::getWithRol($userId);

        if (!$user) {
            return Response::error('Usuario no encontrado', 404);
        }

        // Remover datos sensibles
        unset($user['password_hash']);
        unset($user['pin_hash']);

        $perfil = [
            'id' => $user['id'],
            'email' => $user['email'],
            'nombre_completo' => $user['nombre_completo'],
            'fecha_nacimiento' => $user['fecha_nacimiento'],
            'rol' => $user['rol_nombre'] ?? 'paciente',
            'rol_id' => $user['rol_id'],
            'area_medica' => $user['area_nombre'] ?? null,
            'activo' => $user['activo'],
            'ultimo_acceso' => $user['ultimo_acceso'],
            'created_at' => $user['created_at']
        ];

        // Si es paciente, obtener datos adicionales
        if ($user['rol_id'] == 3) {
            $db = DatabaseService::getInstance();
            $paciente = $db->query(
                "SELECT p.*, ft.nombre as fase_nombre
                 FROM pacientes p
                 LEFT JOIN fases_tratamiento ft ON p.fase_actual_id = ft.id
                 WHERE p.usuario_id = ?",
                [$userId]
            )->fetch();

            if ($paciente) {
                $perfil['paciente_id'] = $paciente['id'];
                $perfil['fase_actual'] = $paciente['fase_nombre'];
                $perfil['progreso_general'] = $paciente['progreso_general'];
            }
        }

        return Response::success($perfil);
    }

    public function updatePerfil($userId, $data)
    {
        // Solo permitir actualizar ciertos campos
        $allowedFields = ['nombre_completo', 'fecha_nacimiento', 'telefono'];
        $updateData = [];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updateData[$field] = $data[$field];
            }
        }

        if (empty($updateData)) {
            return Response::error('No hay datos para actualizar', 400);
        }

        $result = User::update($userId, $updateData);

        if ($result) {
            return Response::success(null, 'Perfil actualizado exitosamente');
        }

        return Response::error('Error al actualizar perfil', 500);
    }

    public function getEspecialistasAsignados($pacienteId)
    {
        $db = DatabaseService::getInstance();

        $especialistas = $db->query(
            "SELECT u.id, u.nombre_completo, u.email, am.nombre as area_medica, ae.fecha_asignacion
             FROM asignaciones_especialista ae
             JOIN usuarios u ON ae.especialista_id = u.id
             JOIN areas_medicas am ON ae.area_medica_id = am.id
             WHERE ae.paciente_id = ? AND ae.activo = 1
             ORDER BY am.nombre",
            [$pacienteId]
        )->fetchAll();

        return Response::success($especialistas);
    }
}
