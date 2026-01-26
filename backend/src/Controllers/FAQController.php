<?php

namespace App\Controllers;

use App\Models\FAQ;
use App\Utils\Response;
use App\Utils\Validator;

class FAQController
{
    // OBTENER FAQs
    public function getFAQs($area = null, $busqueda = null)
    {
        $faqs = FAQ::getAll($area, $busqueda);
        return Response::success($faqs);
    }

    // OBTENER FAQ POR ID
    public function getFAQ($id)
    {
        $faq = FAQ::find($id);

        if (!$faq) {
            return Response::error('FAQ no encontrada', 404);
        }

        // Incrementar contador de vistas
        FAQ::incrementViews($id);

        return Response::success($faq);
    }

    // CREAR FAQ
    public function crearFAQ($data)
    {
        $validator = new Validator($data);
        $validator->required(['pregunta', 'respuesta', 'area', 'creado_por']);

        if (!$validator->passes()) {
            return Response::error($validator->errors(), 422);
        }

        $result = FAQ::create($data);

        if ($result) {
            return Response::success($result, 'FAQ creada exitosamente', 201);
        }

        return Response::error('Error al crear FAQ', 500);
    }

    // ACTUALIZAR FAQ
    public function actualizarFAQ($id, $data)
    {
        $result = FAQ::update($id, $data);

        if ($result) {
            return Response::success(null, 'FAQ actualizada exitosamente');
        }

        return Response::error('Error al actualizar FAQ', 500);
    }

    // ELIMINAR FAQ
    public function eliminarFAQ($id)
    {
        $result = FAQ::delete($id);

        if ($result) {
            return Response::success(null, 'FAQ eliminada exitosamente');
        }

        return Response::error('Error al eliminar FAQ', 500);
    }

    // VOTAR (útil/no útil)
    public function votar($id, $data)
    {
        $validator = new Validator($data);
        $validator->required(['usuario_id', 'voto'])->in('voto', ['util', 'no_util']);

        if (!$validator->passes()) {
            return Response::error($validator->errors(), 422);
        }

        $result = FAQ::vote($id, $data['usuario_id'], $data['voto']);

        if ($result) {
            return Response::success(null, 'Voto registrado');
        }

        return Response::error('Error al registrar voto', 500);
    }

    // FAQs POR ÁREA
    public function getPorArea($area)
    {
        $faqs = FAQ::getByArea($area);
        return Response::success($faqs);
    }

    // FAQs MÁS POPULARES
    public function getMasPopulares($limit = 10)
    {
        $faqs = FAQ::getMostViewed($limit);
        return Response::success($faqs);
    }

    // FAQs MÁS ÚTILES
    public function getMasUtiles($limit = 10)
    {
        $faqs = FAQ::getMostHelpful($limit);
        return Response::success($faqs);
    }

    // BUSCAR FAQs
    public function buscar($query)
    {
        $faqs = FAQ::search($query);
        return Response::success($faqs);
    }
}
