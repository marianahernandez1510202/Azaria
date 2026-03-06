<?php

namespace App\Controllers;

use App\Services\DatabaseService;
use App\Middleware\AuthMiddleware;
use App\Utils\Response;

class GeneradorPlanController
{
    private $db;

    public function __construct()
    {
        $this->db = DatabaseService::getInstance();
    }

    /**
     * Crear plan desde el wizard con selección de recetas
     * POST /api/nutricion/planes/generar
     */
    public function crearPlanDesdeRecetas()
    {
        $user = AuthMiddleware::getCurrentUser();
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data)) {
            Response::error('Datos inválidos', 400);
            return;
        }

        $nombre = trim($data['nombre'] ?? '');
        if (empty($nombre)) {
            Response::error('El nombre del plan es requerido', 400);
            return;
        }

        $especialistaId = $data['especialista_id'] ?? $user['id'];

        // Construir contenido_json con toda la info
        $contenidoJson = [
            'generado_con_catalogo' => true,
            'indicaciones_generales' => $data['indicaciones_generales'] ?? [],
            'totales' => [
                'calorias' => (float)($data['calorias_diarias'] ?? 0),
                'proteinas' => (float)($data['proteinas_g'] ?? 0),
                'carbohidratos' => (float)($data['carbohidratos_g'] ?? 0),
                'grasas' => (float)($data['grasas_g'] ?? 0),
            ],
            'comidas' => []
        ];

        // Insertar plan principal
        $this->db->query(
            "INSERT INTO planes_nutricionales (nombre, descripcion, especialista_id, contenido_json,
                calorias_diarias, proteinas_g, carbohidratos_g, grasas_g, estado)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'activo')",
            [
                $nombre,
                $data['descripcion'] ?? null,
                (int)$especialistaId,
                json_encode($contenidoJson),
                $data['calorias_diarias'] ?? null,
                $data['proteinas_g'] ?? null,
                $data['carbohidratos_g'] ?? null,
                $data['grasas_g'] ?? null,
            ]
        );

        $planId = $this->db->lastInsertId();

        // Insertar comidas del plan (recetas seleccionadas)
        $comidas = $data['comidas'] ?? [];
        $comidasContenido = [];

        foreach ($comidas as $comida) {
            $tipoComida = $comida['tipo_comida'] ?? 'desayuno';
            $opciones = $comida['opciones'] ?? [];

            $opcionesContenido = [];

            foreach ($opciones as $opIdx => $opcion) {
                $recetaId = $opcion['receta_id'] ?? null;
                $opcionNumero = $opIdx + 1;

                // Obtener datos de la receta si existe
                $recetaData = null;
                if ($recetaId) {
                    $recetaData = $this->db->query(
                        "SELECT * FROM recetas WHERE id = ?",
                        [(int)$recetaId]
                    )->fetch();
                }

                $nombrePlato = $opcion['nombre'] ?? ($recetaData['titulo'] ?? 'Sin nombre');
                $descripcion = $opcion['descripcion'] ?? ($recetaData['descripcion'] ?? null);
                $ingredientes = $opcion['ingredientes'] ?? null;
                $instrucciones = $opcion['instrucciones'] ?? null;
                $imagenUrl = $opcion['imagen_url'] ?? ($recetaData['imagen_url'] ?? null);
                $calorias = $opcion['calorias'] ?? ($recetaData['calorias'] ?? null);
                $proteinasG = $opcion['proteinas'] ?? ($recetaData['proteinas'] ?? null);
                $carbosG = $opcion['carbohidratos'] ?? ($recetaData['carbohidratos'] ?? null);
                $grasasG = $opcion['grasas'] ?? ($recetaData['grasas'] ?? null);

                if ($recetaData) {
                    if (!$ingredientes) {
                        $ingredientes = json_decode($recetaData['ingredientes'], true) ?: [];
                    }
                    if (!$instrucciones) {
                        $instrucciones = json_decode($recetaData['instrucciones'], true) ?: [];
                    }
                }

                if (is_string($ingredientes)) {
                    $ingredientes = json_decode($ingredientes, true) ?: [];
                }
                if (is_string($instrucciones)) {
                    $instrucciones = json_decode($instrucciones, true) ?: [];
                }

                // Insertar en plan_comidas
                $this->db->query(
                    "INSERT INTO plan_comidas (plan_id, dia_semana, tipo_comida, nombre_plato, descripcion,
                        ingredientes, calorias, proteinas_g, carbohidratos_g, grasas_g, orden, opcion_numero,
                        receta_id, imagen_url, instrucciones_json)
                     VALUES (?, 'lunes', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [
                        $planId,
                        $tipoComida,
                        $nombrePlato,
                        $descripcion,
                        json_encode($ingredientes),
                        $calorias,
                        $proteinasG,
                        $carbosG,
                        $grasasG,
                        array_search($tipoComida, ['desayuno', 'media_manana', 'almuerzo', 'merienda', 'cena']) ?: 0,
                        $opcionNumero,
                        $recetaId,
                        $imagenUrl,
                        json_encode($instrucciones)
                    ]
                );

                $opcionesContenido[] = [
                    'numero' => $opcionNumero,
                    'nombre' => $nombrePlato,
                    'descripcion' => $descripcion,
                    'ingredientes' => $ingredientes,
                    'instrucciones' => $instrucciones,
                    'imagen_url' => $imagenUrl,
                    'receta_id' => $recetaId,
                    'calorias' => $calorias,
                    'proteinas' => $proteinasG,
                    'carbohidratos' => $carbosG,
                    'grasas' => $grasasG,
                ];
            }

            $comidasContenido[] = [
                'tipo_comida' => $tipoComida,
                'opciones' => $opcionesContenido
            ];
        }

        // Actualizar contenido_json con las comidas completas
        $contenidoJson['comidas'] = $comidasContenido;
        $this->db->query(
            "UPDATE planes_nutricionales SET contenido_json = ? WHERE id = ?",
            [json_encode($contenidoJson), $planId]
        );

        Response::success([
            'plan_id' => $planId,
            'message' => 'Plan generado exitosamente'
        ]);
    }

    /**
     * Obtener plan generado con recetas expandidas
     * GET /api/nutricion/planes/generado/{id}
     */
    public function getPlanGenerado($planId)
    {
        $plan = $this->db->query(
            "SELECT pn.*, u.nombre_completo AS especialista_nombre
             FROM planes_nutricionales pn
             LEFT JOIN usuarios u ON pn.especialista_id = u.id
             WHERE pn.id = ?",
            [(int)$planId]
        )->fetch();

        if (!$plan) {
            Response::error('Plan no encontrado', 404);
            return;
        }

        $plan['contenido'] = json_decode($plan['contenido_json'], true) ?: [];

        // Obtener comidas con recetas expandidas
        $comidas = $this->db->query(
            "SELECT pc.*, r.titulo AS receta_titulo, r.imagen_url AS receta_imagen,
                    r.ingredientes AS receta_ingredientes, r.instrucciones AS receta_instrucciones,
                    r.tiempo_preparacion AS receta_tiempo
             FROM plan_comidas pc
             LEFT JOIN recetas r ON pc.receta_id = r.id
             WHERE pc.plan_id = ?
             ORDER BY pc.orden, pc.opcion_numero",
            [(int)$planId]
        )->fetchAll();

        foreach ($comidas as &$comida) {
            $comida['ingredientes'] = json_decode($comida['ingredientes'], true) ?: [];
            $comida['instrucciones_json'] = json_decode($comida['instrucciones_json'], true) ?: [];
            if ($comida['receta_ingredientes']) {
                $comida['receta_ingredientes'] = json_decode($comida['receta_ingredientes'], true) ?: [];
            }
            if ($comida['receta_instrucciones']) {
                $comida['receta_instrucciones'] = json_decode($comida['receta_instrucciones'], true) ?: [];
            }
        }

        $plan['comidas_expandidas'] = $comidas;

        // Pacientes asignados
        $plan['pacientes_asignados'] = $this->db->query(
            "SELECT pnp.*, p.nombre_completo
             FROM planes_nutricionales_paciente pnp
             JOIN pacientes p ON pnp.paciente_id = p.id
             WHERE pnp.plan_id = ? AND pnp.activo = 1",
            [(int)$planId]
        )->fetchAll();

        Response::success($plan);
    }

    /**
     * Actualizar plan generado (re-armar con nuevas recetas)
     * PUT /api/nutricion/planes/generado/{id}
     */
    public function actualizarPlanGenerado($planId)
    {
        $plan = $this->db->query("SELECT * FROM planes_nutricionales WHERE id = ?", [(int)$planId])->fetch();
        if (!$plan) {
            Response::error('Plan no encontrado', 404);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        // Actualizar datos básicos
        $this->db->query(
            "UPDATE planes_nutricionales SET nombre = ?, descripcion = ?, calorias_diarias = ?,
                proteinas_g = ?, carbohidratos_g = ?, grasas_g = ?
             WHERE id = ?",
            [
                $data['nombre'] ?? $plan['nombre'],
                $data['descripcion'] ?? $plan['descripcion'],
                $data['calorias_diarias'] ?? $plan['calorias_diarias'],
                $data['proteinas_g'] ?? $plan['proteinas_g'],
                $data['carbohidratos_g'] ?? $plan['carbohidratos_g'],
                $data['grasas_g'] ?? $plan['grasas_g'],
                (int)$planId
            ]
        );

        // Si se envían comidas, reconstruir
        if (isset($data['comidas'])) {
            // Eliminar comidas anteriores
            $this->db->query("DELETE FROM plan_comidas WHERE plan_id = ?", [(int)$planId]);

            $comidasContenido = [];
            foreach ($data['comidas'] as $comida) {
                $tipoComida = $comida['tipo_comida'];
                $opciones = $comida['opciones'] ?? [];
                $opcionesContenido = [];

                foreach ($opciones as $opIdx => $opcion) {
                    $recetaId = $opcion['receta_id'] ?? null;
                    $opcionNumero = $opIdx + 1;

                    $recetaData = null;
                    if ($recetaId) {
                        $recetaData = $this->db->query("SELECT * FROM recetas WHERE id = ?", [(int)$recetaId])->fetch();
                    }

                    $nombrePlato = $opcion['nombre'] ?? ($recetaData['titulo'] ?? 'Sin nombre');
                    $ingredientes = $opcion['ingredientes'] ?? ($recetaData ? json_decode($recetaData['ingredientes'], true) : []);
                    $instrucciones = $opcion['instrucciones'] ?? ($recetaData ? json_decode($recetaData['instrucciones'], true) : []);
                    $imagenUrl = $opcion['imagen_url'] ?? ($recetaData['imagen_url'] ?? null);

                    if (is_string($ingredientes)) $ingredientes = json_decode($ingredientes, true) ?: [];
                    if (is_string($instrucciones)) $instrucciones = json_decode($instrucciones, true) ?: [];

                    $this->db->query(
                        "INSERT INTO plan_comidas (plan_id, dia_semana, tipo_comida, nombre_plato, descripcion,
                            ingredientes, calorias, proteinas_g, carbohidratos_g, grasas_g, orden, opcion_numero,
                            receta_id, imagen_url, instrucciones_json)
                         VALUES (?, 'lunes', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        [
                            $planId,
                            $tipoComida,
                            $nombrePlato,
                            $opcion['descripcion'] ?? ($recetaData['descripcion'] ?? null),
                            json_encode($ingredientes),
                            $opcion['calorias'] ?? ($recetaData['calorias'] ?? null),
                            $opcion['proteinas'] ?? ($recetaData['proteinas'] ?? null),
                            $opcion['carbohidratos'] ?? ($recetaData['carbohidratos'] ?? null),
                            $opcion['grasas'] ?? ($recetaData['grasas'] ?? null),
                            array_search($tipoComida, ['desayuno', 'media_manana', 'almuerzo', 'merienda', 'cena']) ?: 0,
                            $opcionNumero,
                            $recetaId,
                            $imagenUrl,
                            json_encode($instrucciones)
                        ]
                    );

                    $opcionesContenido[] = [
                        'numero' => $opcionNumero,
                        'nombre' => $nombrePlato,
                        'descripcion' => $opcion['descripcion'] ?? ($recetaData['descripcion'] ?? null),
                        'ingredientes' => $ingredientes,
                        'instrucciones' => $instrucciones,
                        'imagen_url' => $imagenUrl,
                        'receta_id' => $recetaId,
                        'calorias' => $opcion['calorias'] ?? ($recetaData['calorias'] ?? null),
                        'proteinas' => $opcion['proteinas'] ?? ($recetaData['proteinas'] ?? null),
                        'carbohidratos' => $opcion['carbohidratos'] ?? ($recetaData['carbohidratos'] ?? null),
                        'grasas' => $opcion['grasas'] ?? ($recetaData['grasas'] ?? null),
                    ];
                }

                $comidasContenido[] = [
                    'tipo_comida' => $tipoComida,
                    'opciones' => $opcionesContenido
                ];
            }

            // Actualizar contenido_json
            $contenidoJson = json_decode($plan['contenido_json'], true) ?: [];
            $contenidoJson['comidas'] = $comidasContenido;
            $contenidoJson['indicaciones_generales'] = $data['indicaciones_generales'] ?? ($contenidoJson['indicaciones_generales'] ?? []);
            $contenidoJson['totales'] = [
                'calorias' => (float)($data['calorias_diarias'] ?? $plan['calorias_diarias'] ?? 0),
                'proteinas' => (float)($data['proteinas_g'] ?? $plan['proteinas_g'] ?? 0),
                'carbohidratos' => (float)($data['carbohidratos_g'] ?? $plan['carbohidratos_g'] ?? 0),
                'grasas' => (float)($data['grasas_g'] ?? $plan['grasas_g'] ?? 0),
            ];

            $this->db->query(
                "UPDATE planes_nutricionales SET contenido_json = ? WHERE id = ?",
                [json_encode($contenidoJson), (int)$planId]
            );
        }

        Response::success(['message' => 'Plan actualizado exitosamente']);
    }
}
