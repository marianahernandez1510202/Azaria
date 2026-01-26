<?php

namespace App\Controllers;

use App\Models\Video;
use App\Models\GuiaProtesis;
use App\Models\ChecklistProtesis;
use App\Services\FileUploadService;
use App\Utils\Response;
use App\Utils\Validator;

class FisioterapiaController
{
    private $fileUploadService;

    public function __construct()
    {
        $this->fileUploadService = new FileUploadService();
    }

    // VIDEOS DE EJERCICIOS
    public function getVideos($fase = null)
    {
        $videos = Video::getAll($fase);
        return Response::success($videos);
    }

    public function getVideo($id)
    {
        $video = Video::find($id);

        if (!$video) {
            return Response::error('Video no encontrado', 404);
        }

        return Response::success($video);
    }

    public function crearVideo($data)
    {
        $validator = new Validator($data);
        $validator->required(['titulo', 'descripcion', 'url', 'fase']);

        if (!$validator->passes()) {
            return Response::error($validator->errors(), 422);
        }

        $result = Video::create($data);

        if ($result) {
            return Response::success($result, 'Video creado exitosamente', 201);
        }

        return Response::error('Error al crear video', 500);
    }

    public function getVideosAsignados($pacienteId)
    {
        $videos = Video::getAsignados($pacienteId);
        return Response::success($videos);
    }

    public function asignarVideo($pacienteId, $videoId)
    {
        $result = Video::assign($pacienteId, $videoId);

        if ($result) {
            return Response::success(null, 'Video asignado exitosamente');
        }

        return Response::error('Error al asignar video', 500);
    }

    // GUÍAS DE CUIDADO DE PRÓTESIS
    public function getGuias($fase = null)
    {
        $guias = GuiaProtesis::getAll($fase);
        return Response::success($guias);
    }

    public function getGuia($id)
    {
        $guia = GuiaProtesis::find($id);

        if (!$guia) {
            return Response::error('Guía no encontrada', 404);
        }

        return Response::success($guia);
    }

    public function crearGuia($data)
    {
        $validator = new Validator($data);
        $validator->required(['titulo', 'contenido', 'fase']);

        if (!$validator->passes()) {
            return Response::error($validator->errors(), 422);
        }

        $result = GuiaProtesis::create($data);

        if ($result) {
            return Response::success($result, 'Guía creada exitosamente', 201);
        }

        return Response::error('Error al crear guía', 500);
    }

    // CHECKLIST DE INSPECCIÓN
    public function getChecklist($pacienteId, $fecha = null)
    {
        $checklist = ChecklistProtesis::getByPaciente($pacienteId, $fecha);
        return Response::success($checklist);
    }

    public function guardarChecklist($data)
    {
        $validator = new Validator($data);
        $validator->required(['paciente_id', 'items']);

        if (!$validator->passes()) {
            return Response::error($validator->errors(), 422);
        }

        if (isset($_FILES['foto'])) {
            $fotoPath = $this->fileUploadService->upload($_FILES['foto'], 'protesis');
            $data['foto'] = $fotoPath;
        }

        $result = ChecklistProtesis::save($data);

        if ($result) {
            return Response::success($result, 'Checklist guardado exitosamente', 201);
        }

        return Response::error('Error al guardar checklist', 500);
    }

    public function getHistorialChecklist($pacienteId, $filters = [])
    {
        $historial = ChecklistProtesis::getHistorial($pacienteId, $filters);
        return Response::success($historial);
    }
}
