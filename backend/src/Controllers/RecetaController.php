<?php

namespace App\Controllers;

use App\Services\DatabaseService;
use App\Middleware\AuthMiddleware;
use App\Utils\Response;

class RecetaController
{
    private $db;

    public function __construct()
    {
        $this->db = DatabaseService::getInstance();
    }

    /**
     * Listar recetas del catálogo con filtros opcionales
     * GET /api/nutricion/recetas/catalogo?tipo_comida_id=X&search=text
     */
    public function getRecetas()
    {
        $user = AuthMiddleware::getCurrentUser();
        $tipoComidaId = $_GET['tipo_comida_id'] ?? null;
        $search = $_GET['search'] ?? null;

        $sql = "SELECT r.*, tc.nombre AS tipo_comida_nombre, u.nombre_completo AS creador_nombre
                FROM recetas r
                LEFT JOIN tipos_comida tc ON r.tipo_comida_id = tc.id
                LEFT JOIN usuarios u ON r.creado_por = u.id
                WHERE r.publicada = 1";
        $params = [];

        if ($tipoComidaId) {
            $sql .= " AND r.tipo_comida_id = ?";
            $params[] = (int)$tipoComidaId;
        }

        if ($search) {
            $sql .= " AND (r.titulo LIKE ? OR r.descripcion LIKE ?)";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
        }

        $sql .= " ORDER BY r.updated_at DESC";

        $recetas = $this->db->query($sql, $params)->fetchAll();

        // Decodificar JSON fields
        foreach ($recetas as &$receta) {
            $receta['ingredientes'] = json_decode($receta['ingredientes'], true) ?: [];
            $receta['instrucciones'] = json_decode($receta['instrucciones'], true) ?: [];
            $receta['tags'] = json_decode($receta['tags'], true) ?: [];
        }

        Response::success(['recetas' => $recetas]);
    }

    /**
     * Obtener una receta por ID
     * GET /api/nutricion/recetas/catalogo/{id}
     */
    public function getReceta($id)
    {
        $receta = $this->db->query(
            "SELECT r.*, tc.nombre AS tipo_comida_nombre, u.nombre_completo AS creador_nombre
             FROM recetas r
             LEFT JOIN tipos_comida tc ON r.tipo_comida_id = tc.id
             LEFT JOIN usuarios u ON r.creado_por = u.id
             WHERE r.id = ?",
            [(int)$id]
        )->fetch();

        if (!$receta) {
            Response::error('Receta no encontrada', 404);
            return;
        }

        $receta['ingredientes'] = json_decode($receta['ingredientes'], true) ?: [];
        $receta['instrucciones'] = json_decode($receta['instrucciones'], true) ?: [];
        $receta['tags'] = json_decode($receta['tags'], true) ?: [];

        Response::success($receta);
    }

    /**
     * Crear receta con multipart/form-data (imagen opcional)
     * POST /api/nutricion/recetas/catalogo
     */
    public function crearReceta()
    {
        $user = AuthMiddleware::getCurrentUser();

        // Leer datos del form o JSON
        $data = $_POST;
        if (empty($data)) {
            $data = json_decode(file_get_contents('php://input'), true) ?: [];
        }

        $titulo = trim($data['titulo'] ?? '');
        if (empty($titulo)) {
            Response::error('El título es requerido', 400);
            return;
        }

        // Parsear ingredientes e instrucciones si vienen como string JSON
        $ingredientes = $data['ingredientes'] ?? '[]';
        if (is_string($ingredientes)) {
            $ingredientes = json_decode($ingredientes, true) ?: [];
        }
        $instrucciones = $data['instrucciones'] ?? '[]';
        if (is_string($instrucciones)) {
            $instrucciones = json_decode($instrucciones, true) ?: [];
        }
        $tags = $data['tags'] ?? '[]';
        if (is_string($tags)) {
            $tags = json_decode($tags, true) ?: [];
        }

        // Manejar imagen
        $imagenUrl = null;
        if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
            $imagenUrl = $this->uploadImagen($_FILES['imagen']);
            if (!$imagenUrl) {
                Response::error('Error al subir la imagen', 500);
                return;
            }
        }

        $this->db->query(
            "INSERT INTO recetas (titulo, descripcion, ingredientes, instrucciones, tiempo_preparacion, porciones,
                calorias, proteinas, carbohidratos, grasas, fibra, tags, imagen_url, tipo_comida_id, creado_por)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                $titulo,
                $data['descripcion'] ?? null,
                json_encode($ingredientes),
                json_encode($instrucciones),
                $data['tiempo_preparacion'] ?? null,
                $data['porciones'] ?? 1,
                $data['calorias'] ?? null,
                $data['proteinas'] ?? null,
                $data['carbohidratos'] ?? null,
                $data['grasas'] ?? null,
                $data['fibra'] ?? null,
                json_encode($tags),
                $imagenUrl,
                $data['tipo_comida_id'] ?? null,
                $user['id']
            ]
        );

        $recetaId = $this->db->lastInsertId();

        Response::success([
            'id' => $recetaId,
            'message' => 'Receta creada exitosamente'
        ]);
    }

    /**
     * Actualizar receta existente
     * PUT /api/nutricion/recetas/catalogo/{id}
     */
    public function actualizarReceta($id)
    {
        $user = AuthMiddleware::getCurrentUser();

        $receta = $this->db->query("SELECT * FROM recetas WHERE id = ?", [(int)$id])->fetch();
        if (!$receta) {
            Response::error('Receta no encontrada', 404);
            return;
        }

        $data = $_POST;
        if (empty($data)) {
            $data = json_decode(file_get_contents('php://input'), true) ?: [];
        }

        $ingredientes = $data['ingredientes'] ?? $receta['ingredientes'];
        if (is_string($ingredientes)) {
            $ingredientes = json_decode($ingredientes, true) ?: [];
        }
        $instrucciones = $data['instrucciones'] ?? $receta['instrucciones'];
        if (is_string($instrucciones)) {
            $instrucciones = json_decode($instrucciones, true) ?: [];
        }
        $tags = $data['tags'] ?? $receta['tags'];
        if (is_string($tags)) {
            $tags = json_decode($tags, true) ?: [];
        }

        // Manejar nueva imagen
        $imagenUrl = $receta['imagen_url'];
        if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
            $nuevaImagen = $this->uploadImagen($_FILES['imagen']);
            if ($nuevaImagen) {
                $imagenUrl = $nuevaImagen;
            }
        }

        $this->db->query(
            "UPDATE recetas SET titulo = ?, descripcion = ?, ingredientes = ?, instrucciones = ?,
                tiempo_preparacion = ?, porciones = ?, calorias = ?, proteinas = ?, carbohidratos = ?,
                grasas = ?, fibra = ?, tags = ?, imagen_url = ?, tipo_comida_id = ?
             WHERE id = ?",
            [
                $data['titulo'] ?? $receta['titulo'],
                $data['descripcion'] ?? $receta['descripcion'],
                json_encode($ingredientes),
                json_encode($instrucciones),
                $data['tiempo_preparacion'] ?? $receta['tiempo_preparacion'],
                $data['porciones'] ?? $receta['porciones'],
                $data['calorias'] ?? $receta['calorias'],
                $data['proteinas'] ?? $receta['proteinas'],
                $data['carbohidratos'] ?? $receta['carbohidratos'],
                $data['grasas'] ?? $receta['grasas'],
                $data['fibra'] ?? $receta['fibra'],
                json_encode($tags),
                $imagenUrl,
                $data['tipo_comida_id'] ?? $receta['tipo_comida_id'],
                (int)$id
            ]
        );

        Response::success(['message' => 'Receta actualizada exitosamente']);
    }

    /**
     * Eliminar receta (solo si no está en un plan activo)
     * DELETE /api/nutricion/recetas/catalogo/{id}
     */
    public function eliminarReceta($id)
    {
        $receta = $this->db->query("SELECT * FROM recetas WHERE id = ?", [(int)$id])->fetch();
        if (!$receta) {
            Response::error('Receta no encontrada', 404);
            return;
        }

        // Verificar si está en algún plan activo
        $enPlan = $this->db->query(
            "SELECT COUNT(*) as total FROM plan_comidas pc
             JOIN planes_nutricionales pn ON pc.plan_id = pn.id
             WHERE pc.receta_id = ? AND pn.estado = 'activo'",
            [(int)$id]
        )->fetch();

        if ($enPlan && $enPlan['total'] > 0) {
            Response::error('No se puede eliminar: la receta está siendo usada en un plan activo', 400);
            return;
        }

        $this->db->query("DELETE FROM recetas WHERE id = ?", [(int)$id]);
        Response::success(['message' => 'Receta eliminada exitosamente']);
    }

    /**
     * Obtener recetas agrupadas por tipo de comida (para el wizard)
     * GET /api/nutricion/recetas/por-tipo
     */
    public function getRecetasPorTipo()
    {
        $tipos = $this->db->query("SELECT * FROM tipos_comida ORDER BY orden")->fetchAll();

        $resultado = [];
        foreach ($tipos as $tipo) {
            $recetas = $this->db->query(
                "SELECT r.*, u.nombre_completo AS creador_nombre
                 FROM recetas r
                 LEFT JOIN usuarios u ON r.creado_por = u.id
                 WHERE r.tipo_comida_id = ? AND r.publicada = 1
                 ORDER BY r.titulo",
                [$tipo['id']]
            )->fetchAll();

            foreach ($recetas as &$receta) {
                $receta['ingredientes'] = json_decode($receta['ingredientes'], true) ?: [];
                $receta['instrucciones'] = json_decode($receta['instrucciones'], true) ?: [];
                $receta['tags'] = json_decode($receta['tags'], true) ?: [];
            }

            $resultado[] = [
                'tipo_comida_id' => $tipo['id'],
                'nombre' => $tipo['nombre'],
                'hora_sugerida' => $tipo['hora_sugerida'],
                'recetas' => $recetas
            ];
        }

        Response::success(['tipos' => $resultado]);
    }

    /**
     * Subir imagen de receta
     */
    private function uploadImagen($file)
    {
        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!in_array($file['type'], $allowedTypes)) {
            return null;
        }

        $uploadDir = __DIR__ . '/../../uploads/recetas_imagenes/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid('receta_') . '.' . $extension;
        $filepath = $uploadDir . $filename;

        if (move_uploaded_file($file['tmp_name'], $filepath)) {
            return '/uploads/recetas_imagenes/' . $filename;
        }

        return null;
    }
}
