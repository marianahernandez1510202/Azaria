<?php

namespace App\Controllers;

use App\Models\Articulo;
use App\Models\ComentarioArticulo;
use App\Services\FileUploadService;
use App\Utils\Response;
use App\Utils\Validator;

class BlogController
{
    private $fileUploadService;

    public function __construct()
    {
        $this->fileUploadService = new FileUploadService();
    }

    // OBTENER ARTÍCULOS
    public function getArticulos($filters = [])
    {
        $articulos = Articulo::getAll($filters);
        return Response::success($articulos);
    }

    // OBTENER ARTÍCULO
    public function getArticulo($id)
    {
        $articulo = Articulo::find($id);

        if (!$articulo) {
            return Response::error('Artículo no encontrado', 404);
        }

        // Incrementar vistas
        Articulo::incrementViews($id);

        // Obtener artículos relacionados
        $relacionados = Articulo::getRelacionados($id);

        return Response::success([
            'articulo' => $articulo,
            'relacionados' => $relacionados
        ]);
    }

    // CREAR ARTÍCULO
    public function crearArticulo($data)
    {
        $validator = new Validator($data);
        $validator->required(['titulo', 'contenido', 'autor_id', 'categoria']);

        if (!$validator->passes()) {
            return Response::error($validator->errors(), 422);
        }

        // Subir imagen destacada
        if (isset($_FILES['imagen_destacada'])) {
            $imagePath = $this->fileUploadService->upload($_FILES['imagen_destacada'], 'blog');
            $data['imagen_destacada'] = $imagePath;
        }

        $result = Articulo::create($data);

        if ($result) {
            return Response::success($result, 'Artículo creado exitosamente', 201);
        }

        return Response::error('Error al crear artículo', 500);
    }

    // ACTUALIZAR ARTÍCULO
    public function actualizarArticulo($id, $data)
    {
        if (isset($_FILES['imagen_destacada'])) {
            $imagePath = $this->fileUploadService->upload($_FILES['imagen_destacada'], 'blog');
            $data['imagen_destacada'] = $imagePath;
        }

        $result = Articulo::update($id, $data);

        if ($result) {
            return Response::success(null, 'Artículo actualizado exitosamente');
        }

        return Response::error('Error al actualizar artículo', 500);
    }

    // ELIMINAR ARTÍCULO
    public function eliminarArticulo($id)
    {
        $result = Articulo::delete($id);

        if ($result) {
            return Response::success(null, 'Artículo eliminado exitosamente');
        }

        return Response::error('Error al eliminar artículo', 500);
    }

    // COMENTARIOS
    public function getComentarios($articuloId)
    {
        $comentarios = ComentarioArticulo::getByArticulo($articuloId);
        return Response::success($comentarios);
    }

    public function crearComentario($data)
    {
        $validator = new Validator($data);
        $validator->required(['articulo_id', 'usuario_id', 'contenido']);

        if (!$validator->passes()) {
            return Response::error($validator->errors(), 422);
        }

        $result = ComentarioArticulo::create($data);

        if ($result) {
            return Response::success($result, 'Comentario agregado', 201);
        }

        return Response::error('Error al agregar comentario', 500);
    }

    public function eliminarComentario($id)
    {
        $result = ComentarioArticulo::delete($id);

        if ($result) {
            return Response::success(null, 'Comentario eliminado');
        }

        return Response::error('Error al eliminar comentario', 500);
    }

    // ARTÍCULOS POR CATEGORÍA
    public function getPorCategoria($categoria)
    {
        $articulos = Articulo::getByCategoria($categoria);
        return Response::success($articulos);
    }

    // ARTÍCULOS MÁS LEÍDOS
    public function getMasLeidos($limit = 10)
    {
        $articulos = Articulo::getMostViewed($limit);
        return Response::success($articulos);
    }

    // MIS ARTÍCULOS (para especialistas)
    public function getMisArticulos($autorId)
    {
        $articulos = Articulo::getByAutor($autorId);
        return Response::success($articulos);
    }

    // DAR/QUITAR LIKE
    public function toggleLike($articuloId, $usuarioId)
    {
        $result = Articulo::toggleLike($articuloId, $usuarioId);
        $likeCount = Articulo::getLikeCount($articuloId);

        return Response::success([
            'liked' => $result['liked'],
            'likes' => $likeCount
        ]);
    }
}
