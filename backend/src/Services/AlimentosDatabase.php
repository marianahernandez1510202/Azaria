<?php

namespace App\Services;

/**
 * Base de datos de alimentos comunes con información nutricional
 * Valores por porción estándar (100g o unidad indicada)
 */
class AlimentosDatabase
{
    /**
     * Base de datos de alimentos con calorías y macros
     * Formato: 'alimento' => [calorias, proteinas_g, carbohidratos_g, grasas_g, porcion_estandar]
     */
    private static $alimentos = [
        // ===== CEREALES Y GRANOS =====
        'avena' => [389, 16.9, 66.3, 6.9, '100g'],
        'avena cocida' => [71, 2.5, 12, 1.5, '100g'],
        'arroz' => [130, 2.7, 28, 0.3, '100g'],
        'arroz integral' => [111, 2.6, 23, 0.9, '100g'],
        'tortilla de maiz' => [52, 1.4, 10.7, 0.7, '1 pieza'],
        'tortilla' => [52, 1.4, 10.7, 0.7, '1 pieza'],
        'pan' => [265, 9, 49, 3.2, '100g'],
        'pan integral' => [247, 13, 41, 4.2, '100g'],
        'tostada' => [45, 1.2, 8, 1.2, '1 pieza'],
        'galleta maria' => [30, 0.5, 5, 1, '1 pieza'],
        'pasta' => [131, 5, 25, 1.1, '100g'],

        // ===== PROTEINAS ANIMALES =====
        'pollo' => [165, 31, 0, 3.6, '100g'],
        'pechuga de pollo' => [165, 31, 0, 3.6, '100g'],
        'pechuga' => [165, 31, 0, 3.6, '100g'],
        'carne de res' => [250, 26, 0, 15, '100g'],
        'bistec' => [271, 26, 0, 18, '100g'],
        'carne asada' => [250, 26, 0, 15, '100g'],
        'salmon' => [208, 20, 0, 13, '100g'],
        'filete de salmon' => [208, 20, 0, 13, '100g'],
        'atun' => [132, 28, 0, 1, '100g'],
        'atun en agua' => [116, 26, 0, 0.8, '1 lata'],
        'huevo' => [78, 6, 0.6, 5, '1 pieza'],
        'jamon' => [145, 21, 1.5, 6, '100g'],
        'jamon de pavo' => [104, 17, 4, 2, '100g'],

        // ===== LACTEOS =====
        'leche' => [42, 3.4, 5, 1, '100ml'],
        'yogurt' => [59, 10, 3.6, 0.4, '100g'],
        'yogurth' => [59, 10, 3.6, 0.4, '100g'],
        'yogurt natural' => [59, 10, 3.6, 0.4, '100g'],
        'queso oaxaca' => [316, 21, 1.6, 25, '100g'],
        'queso panela' => [206, 20, 3, 13, '100g'],
        'queso fresco' => [206, 20, 3, 13, '100g'],
        'queso' => [316, 21, 1.6, 25, '100g'],

        // ===== LEGUMINOSAS =====
        'frijoles' => [127, 9, 23, 0.5, '100g'],
        'frijoles enteros' => [127, 9, 23, 0.5, '100g'],
        'frijoles machacados' => [127, 9, 23, 0.5, '100g'],
        'garbanzo' => [164, 9, 27, 2.6, '100g'],
        'garbanzos' => [164, 9, 27, 2.6, '100g'],
        'lentejas' => [116, 9, 20, 0.4, '100g'],

        // ===== VERDURAS =====
        'nopal' => [16, 1.3, 3.3, 0.1, '100g'],
        'nopales' => [16, 1.3, 3.3, 0.1, '100g'],
        'calabaza' => [26, 1, 6.5, 0.1, '100g'],
        'calabacita' => [17, 1.2, 3.1, 0.3, '100g'],
        'papa' => [77, 2, 17, 0.1, '100g'],
        'papas' => [77, 2, 17, 0.1, '100g'],
        'pure de papa' => [83, 2, 17, 1.2, '100g'],
        'jitomate' => [18, 0.9, 3.9, 0.2, '100g'],
        'tomate' => [18, 0.9, 3.9, 0.2, '100g'],
        'lechuga' => [15, 1.4, 2.9, 0.2, '100g'],
        'espinaca' => [23, 2.9, 3.6, 0.4, '100g'],
        'brocoli' => [34, 2.8, 7, 0.4, '100g'],
        'zanahoria' => [41, 0.9, 10, 0.2, '100g'],
        'pepino' => [15, 0.7, 3.6, 0.1, '100g'],
        'cebolla' => [40, 1.1, 9.3, 0.1, '100g'],
        'esparragos' => [20, 2.2, 3.9, 0.1, '100g'],
        'ejote' => [31, 1.8, 7, 0.1, '100g'],
        'jicama' => [38, 0.7, 9, 0.1, '100g'],
        'aguacate' => [160, 2, 8.5, 15, '100g'],
        'guacamole' => [150, 2, 8, 13, '100g'],

        // ===== FRUTAS =====
        'manzana' => [52, 0.3, 14, 0.2, '1 pieza'],
        'pera' => [57, 0.4, 15, 0.1, '1 pieza'],
        'platano' => [89, 1.1, 23, 0.3, '1 pieza'],
        'naranja' => [47, 0.9, 12, 0.1, '1 pieza'],
        'papaya' => [43, 0.5, 11, 0.3, '100g'],
        'mango' => [60, 0.8, 15, 0.4, '100g'],
        'fresa' => [32, 0.7, 7.7, 0.3, '100g'],
        'fresas' => [32, 0.7, 7.7, 0.3, '100g'],
        'frutos rojos' => [43, 1, 10, 0.3, '100g'],

        // ===== FRUTOS SECOS Y SEMILLAS =====
        'almendras' => [579, 21, 22, 50, '100g'],
        'almendra' => [7, 0.3, 0.3, 0.6, '1 pieza'],
        'nueces' => [654, 15, 14, 65, '100g'],
        'nuez' => [26, 0.6, 0.5, 2.6, '1 pieza'],
        'cacahuates' => [567, 26, 16, 49, '100g'],
        'cacahuate' => [9, 0.4, 0.3, 0.8, '1 pieza'],

        // ===== GRASAS Y ACEITES =====
        'aceite de oliva' => [44, 0, 0, 5, '1 cucharadita'],
        'aceite' => [44, 0, 0, 5, '1 cucharadita'],

        // ===== SNACKS =====
        'palomitas' => [31, 1, 6.2, 0.4, '1 taza'],
        'palomitas naturales' => [31, 1, 6.2, 0.4, '1 taza'],

        // ===== OTROS =====
        'miel' => [64, 0.1, 17, 0, '1 cucharada'],
        'azucar' => [49, 0, 12.6, 0, '1 cucharada'],
    ];

    /**
     * Patrones para detectar cantidades en texto
     */
    private static $patronesCantidad = [
        '/(\d+)\s*(?:tazas?|tzas?)/i' => 'taza',
        '/(\d+)\s*(?:piezas?|pzas?)/i' => 'pieza',
        '/(\d+)\s*(?:cucharadas?|cdas?)/i' => 'cucharada',
        '/(\d+)\s*(?:cucharaditas?)/i' => 'cucharadita',
        '/(\d+)\s*(?:rebanadas?)/i' => 'rebanada',
        '/(\d+)\s*(?:filetes?)/i' => 'filete',
        '/(\d+)\s*(?:sobres?)/i' => 'sobre',
        '/(\d+)\s*g(?:ramos?)?/i' => 'gramos',
        '/(\d+)\s*ml/i' => 'ml',
        '/([¼½¾]|\d+\/\d+)/i' => 'fraccion',
    ];

    /**
     * Multiplicadores de porción
     */
    private static $multiplicadoresPorcion = [
        'taza' => 1.0,
        'pieza' => 1.0,
        'cucharada' => 0.15,
        'cucharadita' => 0.05,
        'rebanada' => 0.3,
        'filete' => 1.5,
        'sobre' => 1.0,
        'gramos' => 0.01,  // Se multiplica por la cantidad de gramos
        'ml' => 0.01,
    ];

    /**
     * Obtener información nutricional de un alimento
     */
    public static function getAlimento($nombre)
    {
        $nombreLower = mb_strtolower(trim($nombre));

        // Buscar coincidencia exacta
        if (isset(self::$alimentos[$nombreLower])) {
            return self::formatearAlimento($nombreLower, self::$alimentos[$nombreLower]);
        }

        // Buscar coincidencia parcial
        foreach (self::$alimentos as $key => $valor) {
            if (strpos($nombreLower, $key) !== false || strpos($key, $nombreLower) !== false) {
                return self::formatearAlimento($key, $valor);
            }
        }

        return null;
    }

    /**
     * Formatear datos de alimento
     */
    private static function formatearAlimento($nombre, $datos)
    {
        return [
            'nombre' => $nombre,
            'calorias' => $datos[0],
            'proteinas' => $datos[1],
            'carbohidratos' => $datos[2],
            'grasas' => $datos[3],
            'porcion' => $datos[4]
        ];
    }

    /**
     * Calcular calorías estimadas de una descripción de platillo
     * Versión mejorada con detección más precisa y porciones realistas
     */
    public static function calcularCaloriasPlatillo($descripcion)
    {
        $resultado = [
            'calorias' => 0,
            'proteinas' => 0,
            'carbohidratos' => 0,
            'grasas' => 0,
            'ingredientes_detectados' => [],
            'confianza' => 'baja'
        ];

        $descripcionLower = mb_strtolower($descripcion);
        $ingredientesEncontrados = 0;
        $alimentosYaEncontrados = [];

        // Ordenar alimentos por longitud descendente para priorizar coincidencias más específicas
        // Ej: "avena cocida" antes que "avena"
        $alimentosOrdenados = self::$alimentos;
        uksort($alimentosOrdenados, function($a, $b) {
            return strlen($b) - strlen($a);
        });

        // Buscar cada alimento en la descripción
        foreach ($alimentosOrdenados as $alimento => $valores) {
            // Verificar que no hayamos encontrado una versión más específica
            $yaEncontrado = false;
            foreach ($alimentosYaEncontrados as $encontrado) {
                if (strpos($encontrado, $alimento) !== false || strpos($alimento, $encontrado) !== false) {
                    $yaEncontrado = true;
                    break;
                }
            }
            if ($yaEncontrado) continue;

            // Buscar el alimento con límites de palabra (más estricto)
            $patron = '/\b' . preg_quote($alimento, '/') . '(?:s|es)?\b/iu';
            if (preg_match($patron, $descripcionLower)) {
                // Detectar cantidad
                $cantidad = self::detectarCantidad($descripcion, $alimento);
                $multiplicador = $cantidad['multiplicador'];

                // Si no se detectó cantidad específica, usar un multiplicador conservador
                // basado en el tipo de alimento (porción típica de un plato)
                if ($cantidad['texto'] === '1 porción') {
                    // Usar multiplicadores más pequeños por defecto (porción típica de un plato)
                    $multiplicador = self::getMultiplicadorPorDefecto($alimento);
                }

                // Aplicar límites razonables al multiplicador
                $multiplicador = min($multiplicador, 2.0); // Máximo 2 porciones
                $multiplicador = max($multiplicador, 0.1); // Mínimo 0.1 porción

                $calorias = $valores[0] * $multiplicador;
                $proteinas = $valores[1] * $multiplicador;
                $carbos = $valores[2] * $multiplicador;
                $grasas = $valores[3] * $multiplicador;

                $resultado['calorias'] += $calorias;
                $resultado['proteinas'] += $proteinas;
                $resultado['carbohidratos'] += $carbos;
                $resultado['grasas'] += $grasas;

                $resultado['ingredientes_detectados'][] = [
                    'nombre' => $alimento,
                    'cantidad' => $cantidad['texto'],
                    'calorias' => round($calorias),
                    'proteinas' => round($proteinas, 1),
                    'carbohidratos' => round($carbos, 1),
                    'grasas' => round($grasas, 1)
                ];

                $alimentosYaEncontrados[] = $alimento;
                $ingredientesEncontrados++;

                // Limitar a máximo 5 ingredientes principales por platillo
                if ($ingredientesEncontrados >= 5) {
                    break;
                }
            }
        }

        // Determinar nivel de confianza
        if ($ingredientesEncontrados >= 3) {
            $resultado['confianza'] = 'alta';
        } elseif ($ingredientesEncontrados >= 1) {
            $resultado['confianza'] = 'media';
        }

        // Aplicar límite máximo de calorías por platillo (sanity check)
        // Un platillo normal no debería exceder 800 kcal aproximadamente
        if ($resultado['calorias'] > 800) {
            $factor = 800 / $resultado['calorias'];
            $resultado['calorias'] = 800;
            $resultado['proteinas'] = round($resultado['proteinas'] * $factor, 1);
            $resultado['carbohidratos'] = round($resultado['carbohidratos'] * $factor, 1);
            $resultado['grasas'] = round($resultado['grasas'] * $factor, 1);
            $resultado['ajustado'] = true;
        }

        // Redondear totales
        $resultado['calorias'] = round($resultado['calorias']);
        $resultado['proteinas'] = round($resultado['proteinas'], 1);
        $resultado['carbohidratos'] = round($resultado['carbohidratos'], 1);
        $resultado['grasas'] = round($resultado['grasas'], 1);

        return $resultado;
    }

    /**
     * Obtener multiplicador por defecto según el tipo de alimento
     * Representa una porción típica en un platillo
     */
    private static function getMultiplicadorPorDefecto($alimento)
    {
        // Alimentos que típicamente se consumen en cantidades pequeñas
        $pequeñas = ['aceite', 'miel', 'azucar', 'almendra', 'nuez', 'cacahuate'];
        foreach ($pequeñas as $p) {
            if (strpos($alimento, $p) !== false) {
                return 0.5; // Media porción
            }
        }

        // Alimentos que son complementos (no el ingrediente principal)
        $complementos = ['cebolla', 'jitomate', 'tomate', 'lechuga', 'pepino', 'zanahoria'];
        foreach ($complementos as $c) {
            if (strpos($alimento, $c) !== false) {
                return 0.3; // Un tercio de porción
            }
        }

        // Cereales y granos (porción típica ~1 taza = 1 porción)
        $cereales = ['avena', 'arroz', 'pasta', 'pan'];
        foreach ($cereales as $c) {
            if (strpos($alimento, $c) !== false) {
                return 0.75; // Tres cuartos de porción
            }
        }

        // Proteínas (porción típica ~100g)
        $proteinas = ['pollo', 'carne', 'salmon', 'atun', 'huevo', 'bistec'];
        foreach ($proteinas as $p) {
            if (strpos($alimento, $p) !== false) {
                return 1.0; // Una porción completa
            }
        }

        // Lácteos
        $lacteos = ['leche', 'yogurt', 'queso'];
        foreach ($lacteos as $l) {
            if (strpos($alimento, $l) !== false) {
                return 0.5; // Media porción típica
            }
        }

        // Frutas (típicamente 1 pieza o media taza)
        $frutas = ['manzana', 'pera', 'platano', 'naranja', 'fresa', 'mango', 'papaya'];
        foreach ($frutas as $f) {
            if (strpos($alimento, $f) !== false) {
                return 0.75;
            }
        }

        // Por defecto, usar media porción
        return 0.5;
    }

    /**
     * Detectar cantidad de un ingrediente en el texto
     */
    private static function detectarCantidad($texto, $alimento)
    {
        $resultado = [
            'multiplicador' => 1.0,
            'texto' => '1 porción'
        ];

        // Buscar patrones de cantidad cerca del alimento
        $textoLower = mb_strtolower($texto);
        $posAlimento = strpos($textoLower, $alimento);

        if ($posAlimento !== false) {
            // Extraer contexto alrededor del alimento (50 caracteres antes)
            $inicio = max(0, $posAlimento - 50);
            $contexto = substr($texto, $inicio, 60);

            // Buscar fracciones primero
            if (preg_match('/([¼½¾])\s*(?:tazas?|piezas?|cucharadas?)?/u', $contexto, $match)) {
                $fracciones = ['¼' => 0.25, '½' => 0.5, '¾' => 0.75];
                $resultado['multiplicador'] = $fracciones[$match[1]] ?? 1;
                $resultado['texto'] = $match[0];
                return $resultado;
            }

            // Buscar números con unidades
            if (preg_match('/(\d+)\s*(tazas?|piezas?|cucharadas?|cucharaditas?|rebanadas?|filetes?|sobres?|g|gr|ml)/i', $contexto, $match)) {
                $cantidad = (int)$match[1];
                $unidad = mb_strtolower($match[2]);

                // Normalizar unidad
                if (preg_match('/taza/i', $unidad)) $unidad = 'taza';
                elseif (preg_match('/pieza/i', $unidad)) $unidad = 'pieza';
                elseif (preg_match('/cucharadita/i', $unidad)) $unidad = 'cucharadita';
                elseif (preg_match('/cucharada/i', $unidad)) $unidad = 'cucharada';
                elseif (preg_match('/rebanada/i', $unidad)) $unidad = 'rebanada';
                elseif (preg_match('/filete/i', $unidad)) $unidad = 'filete';
                elseif (preg_match('/sobre/i', $unidad)) $unidad = 'sobre';
                elseif (preg_match('/g|gr/i', $unidad)) {
                    $resultado['multiplicador'] = $cantidad / 100; // Convertir a porción de 100g
                    $resultado['texto'] = $match[0];
                    return $resultado;
                }
                elseif (preg_match('/ml/i', $unidad)) {
                    $resultado['multiplicador'] = $cantidad / 100;
                    $resultado['texto'] = $match[0];
                    return $resultado;
                }

                $multiplicadorBase = self::$multiplicadoresPorcion[$unidad] ?? 1;
                $resultado['multiplicador'] = $cantidad * $multiplicadorBase;
                $resultado['texto'] = $match[0];
            }
        }

        return $resultado;
    }

    /**
     * Obtener todos los alimentos disponibles
     */
    public static function getTodosAlimentos()
    {
        $lista = [];
        foreach (self::$alimentos as $nombre => $datos) {
            $lista[] = self::formatearAlimento($nombre, $datos);
        }
        return $lista;
    }

    /**
     * Buscar alimentos por nombre (para autocompletado)
     */
    public static function buscarAlimentos($termino, $limite = 10)
    {
        $resultados = [];
        $terminoLower = mb_strtolower(trim($termino));

        foreach (self::$alimentos as $nombre => $datos) {
            if (strpos($nombre, $terminoLower) !== false) {
                $resultados[] = self::formatearAlimento($nombre, $datos);
                if (count($resultados) >= $limite) {
                    break;
                }
            }
        }

        return $resultados;
    }
}
