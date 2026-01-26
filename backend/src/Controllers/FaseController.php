<?php

namespace App\Controllers;

use App\Models\Fase;
use App\Models\Paciente;
use App\Utils\Response;
use App\Utils\Validator;

class FaseController
{
    public function getFaseActual($pacienteId)
    {
        $fase = Fase::getCurrentFase($pacienteId);

        if (!$fase) {
            return Response::error('No se encontró fase activa', 404);
        }

        return Response::success($fase);
    }

    public function getProgreso($pacienteId)
    {
        $progreso = Fase::getProgreso($pacienteId);
        return Response::success($progreso);
    }

    public function cambiarFase($pacienteId, $data)
    {
        $validator = new Validator($data);
        $validator->required(['nueva_fase', 'motivo'])
                  ->in('nueva_fase', [FASE_PREOPERATORIA, FASE_POSTOPERATORIA, FASE_PREPROTESICA, FASE_PROTESICA]);

        if (!$validator->passes()) {
            return Response::error($validator->errors(), 422);
        }

        $result = Fase::cambiarFase($pacienteId, $data['nueva_fase'], $data['motivo']);

        if ($result) {
            return Response::success(null, 'Fase actualizada exitosamente');
        }

        return Response::error('Error al cambiar fase', 500);
    }

    public function getHistorialFases($pacienteId)
    {
        $historial = Fase::getHistorial($pacienteId);
        return Response::success($historial);
    }

    public function getDashboard($pacienteId)
    {
        $dashboard = [
            'fase_actual' => Fase::getCurrentFase($pacienteId),
            'progreso' => Fase::getProgreso($pacienteId),
            'estadisticas' => Fase::getEstadisticas($pacienteId)
        ];

        return Response::success($dashboard);
    }
}
