<?php

namespace App\Controllers;

use App\Models\DispositivoOrtesis;
use App\Models\AjusteOrtesis;
use App\Models\ProblemaOrtesis;
use App\Utils\Response;
use App\Utils\Validator;

class OrtesisController
{
    // INFORMACIÓN DEL DISPOSITIVO
    public function getDispositivo($pacienteId)
    {
        $dispositivo = DispositivoOrtesis::getByPaciente($pacienteId);

        if (!$dispositivo) {
            return Response::error('No se encontró información del dispositivo', 404);
        }

        return Response::success($dispositivo);
    }

    public function actualizarDispositivo($pacienteId, $data)
    {
        $validator = new Validator($data);
        $validator->required(['tipo', 'marca', 'modelo']);

        if (!$validator->passes()) {
            return Response::error($validator->errors(), 422);
        }

        $result = DispositivoOrtesis::update($pacienteId, $data);

        if ($result) {
            return Response::success(null, 'Información actualizada exitosamente');
        }

        return Response::error('Error al actualizar información', 500);
    }

    // HISTORIAL DE AJUSTES
    public function getAjustes($pacienteId)
    {
        $ajustes = AjusteOrtesis::getByPaciente($pacienteId);
        return Response::success($ajustes);
    }

    public function registrarAjuste($data)
    {
        $validator = new Validator($data);
        $validator->required(['paciente_id', 'tipo_ajuste', 'descripcion', 'realizado_por']);

        if (!$validator->passes()) {
            return Response::error($validator->errors(), 422);
        }

        $result = AjusteOrtesis::create($data);

        if ($result) {
            return Response::success($result, 'Ajuste registrado exitosamente', 201);
        }

        return Response::error('Error al registrar ajuste', 500);
    }

    // REPORTAR PROBLEMAS
    public function getProblemas($pacienteId, $estado = null)
    {
        $problemas = ProblemaOrtesis::getByPaciente($pacienteId, $estado);
        return Response::success($problemas);
    }

    public function reportarProblema($data)
    {
        $validator = new Validator($data);
        $validator->required(['paciente_id', 'tipo_problema', 'descripcion']);

        if (!$validator->passes()) {
            return Response::error($validator->errors(), 422);
        }

        $result = ProblemaOrtesis::create($data);

        if ($result) {
            // Notificar a especialistas asignados
            $this->notificarEspecialistas($data['paciente_id'], $result['id']);

            return Response::success($result, 'Problema reportado exitosamente', 201);
        }

        return Response::error('Error al reportar problema', 500);
    }

    public function actualizarEstadoProblema($id, $data)
    {
        $validator = new Validator($data);
        $validator->required(['estado'])->in('estado', ['pendiente', 'en_revision', 'resuelto']);

        if (!$validator->passes()) {
            return Response::error($validator->errors(), 422);
        }

        $result = ProblemaOrtesis::updateEstado($id, $data['estado'], $data['notas'] ?? null);

        if ($result) {
            return Response::success(null, 'Estado actualizado exitosamente');
        }

        return Response::error('Error al actualizar estado', 500);
    }

    // GUÍAS DE USO
    public function getGuias()
    {
        $guias = DispositivoOrtesis::getGuias();
        return Response::success($guias);
    }

    private function notificarEspecialistas($pacienteId, $problemaId)
    {
        // Implementar notificación a especialistas de órtesis
        $especialistas = DispositivoOrtesis::getEspecialistasAsignados($pacienteId);

        foreach ($especialistas as $especialista) {
            // Enviar notificación
        }
    }
}
