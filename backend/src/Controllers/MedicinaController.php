<?php

namespace App\Controllers;

use App\Services\DatabaseService;
use App\Utils\Response;
use App\Utils\Validator;

class MedicinaController
{
    private $db;

    public function __construct()
    {
        $this->db = DatabaseService::getInstance();
    }

    // BITÁCORA DE GLUCOSA
    public function getGlucosa($pacienteId)
    {
        $registros = $this->db->query(
            "SELECT bg.*, m.nombre as momento_nombre
             FROM bitacora_glucosa bg
             LEFT JOIN momentos_medicion m ON bg.momento_id = m.id
             WHERE bg.paciente_id = ?
             ORDER BY bg.fecha DESC, bg.hora DESC
             LIMIT 50",
            [$pacienteId]
        )->fetchAll();

        // Formatear para el frontend
        $formateados = array_map(function($r) {
            return [
                'id' => $r['id'],
                'nivel_glucosa' => $r['valor'],
                'momento' => $r['momento_nombre'] ?? 'No especificado',
                'fecha_hora' => $r['fecha'] . ' ' . $r['hora'],
                'notas' => $r['notas']
            ];
        }, $registros);

        return Response::success($formateados);
    }

    public function registrarGlucosa($data)
    {
        // Aceptar tanto 'valor' como 'nivel_glucosa'
        $valor = $data['valor'] ?? $data['nivel_glucosa'] ?? null;

        if (empty($data['paciente_id']) || empty($valor)) {
            return Response::error('paciente_id y valor/nivel_glucosa son requeridos', 422);
        }

        // Obtener momento_id basado en el texto
        $momentoId = $this->getMomentoId($data['momento'] ?? 'ayunas');

        $this->db->query(
            "INSERT INTO bitacora_glucosa (paciente_id, valor, momento_id, notas, fecha, hora)
             VALUES (?, ?, ?, ?, CURDATE(), CURTIME())",
            [
                $data['paciente_id'],
                $valor,
                $momentoId,
                $data['notas'] ?? null
            ]
        );

        return Response::success(null, 'Nivel de glucosa registrado', 201);
    }

    // BITÁCORA DE PRESIÓN
    public function getPresion($pacienteId)
    {
        $registros = $this->db->query(
            "SELECT * FROM bitacora_presion
             WHERE paciente_id = ?
             ORDER BY fecha DESC, hora DESC
             LIMIT 50",
            [$pacienteId]
        )->fetchAll();

        $formateados = array_map(function($r) {
            return [
                'id' => $r['id'],
                'sistolica' => $r['sistolica'],
                'diastolica' => $r['diastolica'],
                'pulso' => $r['pulso'],
                'fecha_hora' => $r['fecha'] . ' ' . $r['hora'],
                'notas' => $r['notas']
            ];
        }, $registros);

        return Response::success($formateados);
    }

    public function registrarPresion($data)
    {
        $validator = new Validator($data);
        $validator->required(['paciente_id', 'sistolica', 'diastolica']);

        if (!$validator->passes()) {
            return Response::error($validator->errors(), 422);
        }

        $this->db->query(
            "INSERT INTO bitacora_presion (paciente_id, sistolica, diastolica, pulso, notas, fecha, hora)
             VALUES (?, ?, ?, ?, ?, CURDATE(), CURTIME())",
            [
                $data['paciente_id'],
                $data['sistolica'],
                $data['diastolica'],
                $data['pulso'] ?? null,
                $data['notas'] ?? null
            ]
        );

        return Response::success(null, 'Presión arterial registrada', 201);
    }

    // BITÁCORA DE DOLOR
    public function getDolor($pacienteId)
    {
        $registros = $this->db->query(
            "SELECT bd.*, u.nombre as ubicacion_nombre, t.nombre as tipo_nombre
             FROM bitacora_dolor bd
             LEFT JOIN ubicaciones_dolor u ON bd.ubicacion_id = u.id
             LEFT JOIN tipos_dolor t ON bd.tipo_dolor_id = t.id
             WHERE bd.paciente_id = ?
             ORDER BY bd.fecha DESC, bd.hora DESC
             LIMIT 50",
            [$pacienteId]
        )->fetchAll();

        $formateados = array_map(function($r) {
            return [
                'id' => $r['id'],
                'nivel_dolor' => $r['intensidad'],
                'ubicacion' => $r['ubicacion_nombre'] ?? 'No especificado',
                'tipo_dolor' => $r['tipo_nombre'] ?? 'No especificado',
                'fecha_hora' => $r['fecha'] . ' ' . $r['hora'],
                'notas' => $r['notas']
            ];
        }, $registros);

        return Response::success($formateados);
    }

    public function registrarDolor($data)
    {
        $validator = new Validator($data);
        $validator->required(['paciente_id', 'nivel_dolor', 'ubicacion']);

        if (!$validator->passes()) {
            return Response::error($validator->errors(), 422);
        }

        $this->db->query(
            "INSERT INTO bitacora_dolor (paciente_id, intensidad, ubicacion_id, tipo_dolor_id, notas, fecha, hora)
             VALUES (?, ?, ?, ?, ?, CURDATE(), CURTIME())",
            [
                $data['paciente_id'],
                $data['nivel_dolor'],
                $this->getUbicacionId($data['ubicacion']),
                $this->getTipoDolorId($data['tipo_dolor'] ?? 'agudo'),
                $data['notas'] ?? null
            ]
        );

        return Response::success(null, 'Dolor registrado', 201);
    }

    // RESUMEN Y ESTADÍSTICAS
    public function getResumen($pacienteId)
    {
        // Última glucosa
        $glucosa = $this->db->query(
            "SELECT valor as ultimo FROM bitacora_glucosa
             WHERE paciente_id = ? ORDER BY fecha DESC, hora DESC LIMIT 1",
            [$pacienteId]
        )->fetch();

        // Última presión
        $presion = $this->db->query(
            "SELECT sistolica as ultima_sistolica, diastolica as ultima_diastolica
             FROM bitacora_presion
             WHERE paciente_id = ? ORDER BY fecha DESC, hora DESC LIMIT 1",
            [$pacienteId]
        )->fetch();

        // Promedio dolor última semana
        $dolor = $this->db->query(
            "SELECT AVG(intensidad) as promedio FROM bitacora_dolor
             WHERE paciente_id = ? AND fecha >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)",
            [$pacienteId]
        )->fetch();

        return Response::success([
            'glucosa' => $glucosa ?: ['ultimo' => null],
            'presion' => $presion ?: ['ultima_sistolica' => null, 'ultima_diastolica' => null],
            'dolor' => ['promedio' => $dolor['promedio'] ?? null]
        ]);
    }

    private function getMomentoId($momento)
    {
        $momentos = [
            'ayunas' => 1, 'ayuno' => 1,
            'post_desayuno' => 2, 'despues_desayuno' => 2,
            'pre_comida' => 3, 'antes_comida' => 3,
            'post_comida' => 4, 'despues_comida' => 4,
            'pre_cena' => 5, 'antes_cena' => 5,
            'post_cena' => 6, 'despues_cena' => 6,
            'antes_dormir' => 7
        ];
        return $momentos[strtolower($momento)] ?? 1;
    }

    private function getUbicacionId($ubicacion)
    {
        // Buscar o crear ubicación
        $result = $this->db->query(
            "SELECT id FROM ubicaciones_dolor WHERE nombre LIKE ?",
            ['%' . $ubicacion . '%']
        )->fetch();

        if ($result) {
            return $result['id'];
        }

        // Por defecto retornar 1 (muñón)
        return 1;
    }

    private function getTipoDolorId($tipo)
    {
        $tipos = [
            'punzante' => 1, 'agudo' => 1,
            'sordo' => 2, 'constante' => 2,
            'quemante' => 3,
            'pulsatil' => 4, 'pulsante' => 4,
            'hormigueo' => 5,
            'calambres' => 6, 'fantasma' => 5
        ];
        return $tipos[strtolower($tipo)] ?? 1;
    }
}
