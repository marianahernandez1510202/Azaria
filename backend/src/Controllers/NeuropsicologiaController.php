<?php

namespace App\Controllers;

use App\Models\EstadoAnimo;
use App\Models\CuestionarioBienestar;
use App\Utils\Response;
use App\Utils\Validator;

class NeuropsicologiaController
{
    // Mapeo de emociones textuales a nivel numérico
    private $emocionesMap = [
        'feliz' => ANIMO_MUY_BIEN,
        'tranquilo' => ANIMO_BIEN,
        'agradecido' => ANIMO_BIEN,
        'neutral' => ANIMO_NEUTRAL,
        'ansioso' => ANIMO_MAL,
        'triste' => ANIMO_MAL,
        'frustrado' => ANIMO_MAL,
        'enojado' => ANIMO_MUY_MAL
    ];

    // REGISTRO DE ESTADO DE ÁNIMO
    public function getEstadosAnimo($pacienteId, $filters = [])
    {
        $estados = EstadoAnimo::getByPaciente($pacienteId, $filters);
        return Response::success($estados);
    }

    public function registrarEstadoAnimo($data)
    {
        // Si viene 'emocion' en lugar de 'nivel_animo', convertir
        if (isset($data['emocion']) && !isset($data['nivel_animo'])) {
            $emocion = strtolower($data['emocion']);
            $data['nivel_animo'] = $this->emocionesMap[$emocion] ?? ANIMO_NEUTRAL;
        }

        $validator = new Validator($data);
        $validator->required(['paciente_id', 'nivel_animo'])
                  ->in('nivel_animo', [ANIMO_MUY_MAL, ANIMO_MAL, ANIMO_NEUTRAL, ANIMO_BIEN, ANIMO_MUY_BIEN]);

        if (!$validator->passes()) {
            return Response::error($validator->errors(), 422);
        }

        $result = EstadoAnimo::create($data);

        if ($result) {
            // Verificar si requiere alerta psicológica
            $this->checkAlertaPsicologica($data['paciente_id'], $data['nivel_animo']);

            return Response::success($result, 'Estado de ánimo registrado', 201);
        }

        return Response::error('Error al registrar estado de ánimo', 500);
    }

    // EJERCICIOS DE NEUROPSICOLOGÍA
    public function getEjercicios()
    {
        // Ejercicios predefinidos para bienestar mental
        $ejercicios = [
            [
                'id' => 1,
                'nombre' => 'Respiración 4-7-8',
                'descripcion' => 'Técnica de respiración para reducir ansiedad',
                'duracion' => 5,
                'tipo' => 'respiracion',
                'instrucciones' => 'Inhala por 4 segundos, mantén por 7, exhala por 8. Repite 4 veces.'
            ],
            [
                'id' => 2,
                'nombre' => 'Mindfulness de 5 sentidos',
                'descripcion' => 'Ejercicio de atención plena para conectar con el presente',
                'duracion' => 10,
                'tipo' => 'mindfulness',
                'instrucciones' => 'Identifica: 5 cosas que ves, 4 que tocas, 3 que escuchas, 2 que hueles, 1 que saboreas.'
            ],
            [
                'id' => 3,
                'nombre' => 'Relajación muscular progresiva',
                'descripcion' => 'Reduce la tensión física y mental',
                'duracion' => 15,
                'tipo' => 'relajacion',
                'instrucciones' => 'Tensa cada grupo muscular por 5 segundos, luego relaja por 10 segundos.'
            ],
            [
                'id' => 4,
                'nombre' => 'Visualización positiva',
                'descripcion' => 'Imagina tu recuperación exitosa',
                'duracion' => 10,
                'tipo' => 'visualizacion',
                'instrucciones' => 'Cierra los ojos e imagina detalladamente un día después de tu recuperación completa.'
            ]
        ];

        return Response::success($ejercicios);
    }

    // CUESTIONARIOS DE BIENESTAR
    public function getCuestionarios($pacienteId)
    {
        $cuestionarios = CuestionarioBienestar::getByPaciente($pacienteId);
        return Response::success($cuestionarios);
    }

    public function guardarCuestionario($data)
    {
        $validator = new Validator($data);
        $validator->required(['paciente_id', 'respuestas']);

        if (!$validator->passes()) {
            return Response::error($validator->errors(), 422);
        }

        $result = CuestionarioBienestar::save($data);

        if ($result) {
            // Calcular puntuación y verificar alertas
            $puntuacion = CuestionarioBienestar::calcularPuntuacion($result['id']);
            $this->checkAlertaPuntuacion($data['paciente_id'], $puntuacion);

            return Response::success($result, 'Cuestionario guardado exitosamente', 201);
        }

        return Response::error('Error al guardar cuestionario', 500);
    }

    // TENDENCIAS Y ANÁLISIS
    public function getTendencias($pacienteId, $periodo = '30d')
    {
        $tendencias = [
            'estados_animo' => EstadoAnimo::getTendencias($pacienteId, $periodo),
            'emociones_frecuentes' => EstadoAnimo::getEmocionesFrecuentes($pacienteId, $periodo),
            'puntuaciones' => CuestionarioBienestar::getTendenciasPuntuacion($pacienteId, $periodo)
        ];

        return Response::success($tendencias);
    }

    public function getNubeEmociones($pacienteId, $periodo = '30d')
    {
        $nube = EstadoAnimo::getNubeEmociones($pacienteId, $periodo);
        return Response::success($nube);
    }

    // ALERTAS PSICOLÓGICAS
    public function getAlertas($especialistaId = null)
    {
        $alertas = EstadoAnimo::getAlertas($especialistaId);
        return Response::success($alertas);
    }

    private function checkAlertaPsicologica($pacienteId, $nivelAnimo)
    {
        // Verificar si hay 3 registros consecutivos con nivel bajo
        $registrosRecientes = EstadoAnimo::getRecientes($pacienteId, 3);

        $todosNegativos = true;
        foreach ($registrosRecientes as $registro) {
            if ($registro['nivel_animo'] >= ANIMO_NEUTRAL) {
                $todosNegativos = false;
                break;
            }
        }

        if ($todosNegativos && count($registrosRecientes) >= 3) {
            EstadoAnimo::crearAlerta($pacienteId);
        }
    }

    private function checkAlertaPuntuacion($pacienteId, $puntuacion)
    {
        // Si la puntuación es menor a cierto umbral, crear alerta
        if ($puntuacion < 50) {
            CuestionarioBienestar::crearAlerta($pacienteId, $puntuacion);
        }
    }

    public function marcarAlertaAtendida($alertaId)
    {
        $result = EstadoAnimo::marcarAlertaAtendida($alertaId);

        if ($result) {
            return Response::success(null, 'Alerta marcada como atendida');
        }

        return Response::error('Error al actualizar alerta', 500);
    }
}
