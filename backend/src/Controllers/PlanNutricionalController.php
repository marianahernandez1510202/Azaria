<?php

namespace App\Controllers;

use App\Services\DatabaseService;
use App\Services\AlimentosDatabase;
use App\Utils\Response;
use App\Middleware\AuthMiddleware;

class PlanNutricionalController
{
    private $db;
    private $uploadDir;

    public function __construct()
    {
        $this->db = DatabaseService::getInstance();
        $this->uploadDir = __DIR__ . '/../../uploads/planes_nutricionales/';

        // Crear directorio si no existe
        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }

    /**
     * Subir PDF y crear plan nutricional
     */
    public function uploadPlan($especialistaId)
    {
        try {
            // Verificar que se subió un archivo
            if (!isset($_FILES['pdf']) || $_FILES['pdf']['error'] !== UPLOAD_ERR_OK) {
                return Response::error('No se recibió el archivo PDF', 400);
            }

            $file = $_FILES['pdf'];

            // Validar tipo de archivo (PDF o DOCX)
            $allowedTypes = [
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
                'application/msword', // DOC antiguo
                'application/zip' // A veces DOCX se detecta como ZIP
            ];
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $file['tmp_name']);
            finfo_close($finfo);

            // Verificar también la extensión para DOCX
            $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $isDocx = in_array($extension, ['docx', 'doc']);
            $isPdf = $extension === 'pdf';

            if (!in_array($mimeType, $allowedTypes) && !$isDocx && !$isPdf) {
                return Response::error('Solo se permiten archivos PDF o DOCX', 400);
            }

            // Validar tamaño (máx 10MB)
            if ($file['size'] > 10 * 1024 * 1024) {
                return Response::error('El archivo no puede superar 10MB', 400);
            }

            // Generar nombre único
            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $nombreArchivo = 'plan_' . $especialistaId . '_' . time() . '_' . uniqid() . '.' . $extension;
            $rutaArchivo = $this->uploadDir . $nombreArchivo;

            // Mover archivo
            if (!move_uploaded_file($file['tmp_name'], $rutaArchivo)) {
                return Response::error('Error al guardar el archivo', 500);
            }

            // Extraer texto según el tipo de archivo
            if ($isDocx || $extension === 'docx' || $extension === 'doc') {
                $textoExtraido = $this->extractTextFromDOCX($rutaArchivo);
            } else {
                $textoExtraido = $this->extractTextFromPDF($rutaArchivo);
            }

            // Sanitizar texto a UTF-8 válido
            $textoExtraido = $this->sanitizeUtf8($textoExtraido);

            // Procesar el texto y convertir a JSON estructurado
            $contenidoJSON = $this->procesarTextoAJSON($textoExtraido);

            // Obtener datos del formulario
            $nombre = $_POST['nombre'] ?? 'Plan Nutricional ' . date('d/m/Y');
            $descripcion = $_POST['descripcion'] ?? null;

            // Asegurar que el JSON sea válido
            // Primero, sanitizar recursivamente el array para asegurar UTF-8
            $contenidoJSON = $this->sanitizeArrayUtf8($contenidoJSON);

            $jsonString = json_encode($contenidoJSON, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
            if ($jsonString === false) {
                error_log('Error json_encode: ' . json_last_error_msg());
                // Si falla, crear un JSON mínimo válido con el texto sanitizado
                $textoLimpio = mb_convert_encoding($textoExtraido, 'UTF-8', 'UTF-8');
                $textoLimpio = preg_replace('/[^\x20-\x7E\xA0-\xFF\n\r\t]/u', '', $textoLimpio);

                $jsonString = json_encode([
                    'titulo' => $nombre,
                    'descripcion' => 'Plan importado desde PDF',
                    'totales' => ['calorias' => 0, 'proteinas' => 0, 'carbohidratos' => 0, 'grasas' => 0],
                    'comidas' => $contenidoJSON['comidas'] ?? [],
                    'recomendaciones' => [],
                    'restricciones' => [],
                    'texto_original' => substr($textoLimpio, 0, 10000) ?: 'Texto extraído no disponible'
                ], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
            }

            // Insertar en base de datos (primero sin imágenes para obtener el ID)
            $this->db->query(
                "INSERT INTO planes_nutricionales
                 (nombre, descripcion, especialista_id, archivo_pdf, archivo_nombre, contenido_json,
                  calorias_diarias, proteinas_g, carbohidratos_g, grasas_g, estado)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'borrador')",
                [
                    $nombre,
                    $descripcion,
                    $especialistaId,
                    $nombreArchivo,
                    $file['name'],
                    $jsonString,
                    $contenidoJSON['totales']['calorias'] ?? null,
                    $contenidoJSON['totales']['proteinas'] ?? null,
                    $contenidoJSON['totales']['carbohidratos'] ?? null,
                    $contenidoJSON['totales']['grasas'] ?? null
                ]
            );

            $planId = $this->db->lastInsertId();

            // Extraer imágenes del DOCX (si aplica)
            $imagenes = [];
            if ($isDocx || $extension === 'docx') {
                $imagenes = $this->extractImagesFromDOCX($rutaArchivo, $planId);

                // Si se encontraron imágenes, actualizar el contenido JSON
                if (!empty($imagenes)) {
                    $contenidoJSON['imagenes'] = $imagenes;
                    $contenidoJSON['graficas'] = $this->clasificarImagenes($imagenes, $textoExtraido);

                    // Actualizar el JSON en la base de datos con las imágenes
                    $jsonStringActualizado = json_encode($contenidoJSON, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
                    $this->db->query(
                        "UPDATE planes_nutricionales SET contenido_json = ? WHERE id = ?",
                        [$jsonStringActualizado, $planId]
                    );
                }
            }

            // Insertar las comidas individuales si existen
            if (!empty($contenidoJSON['comidas'])) {
                $this->insertarComidasPlan($planId, $contenidoJSON['comidas']);
            }

            return Response::success([
                'plan_id' => $planId,
                'nombre' => $nombre,
                'contenido' => $contenidoJSON,
                'imagenes' => $imagenes,
                'texto_extraido' => $textoExtraido
            ], 'Plan nutricional creado exitosamente', 201);

        } catch (\Exception $e) {
            error_log('Error en uploadPlan: ' . $e->getMessage());
            return Response::error('Error al procesar el plan: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Extraer texto de un PDF
     */
    private function extractTextFromPDF($rutaPDF)
    {
        $texto = '';

        // Intentar con pdftotext si está disponible (Linux/Mac)
        if ($this->commandExists('pdftotext')) {
            $tempFile = tempnam(sys_get_temp_dir(), 'pdf_');
            exec("pdftotext -layout " . escapeshellarg($rutaPDF) . " " . escapeshellarg($tempFile) . " 2>&1", $output, $returnCode);

            if ($returnCode === 0 && file_exists($tempFile)) {
                $texto = file_get_contents($tempFile);
                unlink($tempFile);
            }
        }

        // Si no funcionó, intentar con PHP nativo (básico)
        if (empty($texto)) {
            $texto = $this->extractTextPHPNative($rutaPDF);
        }

        return $texto;
    }

    /**
     * Extracción básica de texto de PDF con PHP
     */
    private function extractTextPHPNative($rutaPDF)
    {
        $content = file_get_contents($rutaPDF);
        $texto = '';

        // Buscar streams de texto en el PDF
        if (preg_match_all('/stream\s*(.*?)\s*endstream/s', $content, $matches)) {
            foreach ($matches[1] as $stream) {
                // Intentar descomprimir si está comprimido con zlib
                $decompressed = @gzuncompress($stream);
                if ($decompressed !== false) {
                    $stream = $decompressed;
                }

                // Extraer texto de operadores Tj y TJ
                if (preg_match_all('/\[(.*?)\]\s*TJ/s', $stream, $textMatches)) {
                    foreach ($textMatches[1] as $text) {
                        // Limpiar y extraer strings
                        if (preg_match_all('/\((.*?)\)/s', $text, $stringMatches)) {
                            $texto .= implode('', $stringMatches[1]) . ' ';
                        }
                    }
                }
                if (preg_match_all('/\((.*?)\)\s*Tj/s', $stream, $textMatches)) {
                    $texto .= implode(' ', $textMatches[1]) . ' ';
                }
            }
        }

        return trim($texto);
    }

    /**
     * Extraer texto de un archivo DOCX
     * Los archivos DOCX son ZIP que contienen XML
     */
    private function extractTextFromDOCX($rutaDOCX)
    {
        $texto = '';

        try {
            // DOCX es un archivo ZIP
            $zip = new \ZipArchive();

            if ($zip->open($rutaDOCX) === true) {
                // El contenido principal está en word/document.xml
                $xmlContent = $zip->getFromName('word/document.xml');

                if ($xmlContent !== false) {
                    // Parsear el XML
                    $dom = new \DOMDocument();
                    $dom->loadXML($xmlContent, LIBXML_NOERROR | LIBXML_NOWARNING);

                    // Extraer todos los nodos de texto (w:t)
                    $xpath = new \DOMXPath($dom);
                    $xpath->registerNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main');

                    // Buscar todos los elementos de texto
                    $textNodes = $xpath->query('//w:t');

                    $currentParagraph = '';
                    $lastParent = null;

                    foreach ($textNodes as $node) {
                        // Detectar saltos de párrafo
                        $parent = $node->parentNode;
                        while ($parent && $parent->nodeName !== 'w:p') {
                            $parent = $parent->parentNode;
                        }

                        if ($lastParent !== null && $parent !== $lastParent) {
                            // Nuevo párrafo
                            $texto .= $currentParagraph . "\n";
                            $currentParagraph = '';
                        }

                        $currentParagraph .= $node->nodeValue;
                        $lastParent = $parent;
                    }

                    // Agregar último párrafo
                    if (!empty($currentParagraph)) {
                        $texto .= $currentParagraph;
                    }
                }

                $zip->close();
            }

        } catch (\Exception $e) {
            error_log('Error extrayendo texto de DOCX: ' . $e->getMessage());
        }

        // Si no se pudo extraer, intentar método alternativo
        if (empty($texto)) {
            $texto = $this->extractTextFromDOCXSimple($rutaDOCX);
        }

        return trim($texto);
    }

    /**
     * Extraer imágenes de un archivo DOCX
     * Retorna array con rutas de las imágenes guardadas
     */
    private function extractImagesFromDOCX($rutaDOCX, $planId)
    {
        $imagenes = [];
        $imageDir = __DIR__ . '/../../uploads/planes_imagenes/' . $planId . '/';

        // Crear directorio si no existe
        if (!is_dir($imageDir)) {
            mkdir($imageDir, 0755, true);
        }

        try {
            $zip = new \ZipArchive();

            if ($zip->open($rutaDOCX) === true) {
                // Buscar imágenes en word/media/
                for ($i = 0; $i < $zip->numFiles; $i++) {
                    $filename = $zip->getNameIndex($i);

                    // Verificar si es una imagen en word/media/
                    if (preg_match('/^word\/media\/(image\d+\.(png|jpg|jpeg|gif|bmp|wmf|emf))$/i', $filename, $matches)) {
                        $imageContent = $zip->getFromIndex($i);

                        if ($imageContent !== false) {
                            // Generar nombre único para la imagen
                            $extension = strtolower(pathinfo($matches[1], PATHINFO_EXTENSION));
                            // Convertir wmf/emf a png si es necesario (estos formatos no son soportados en web)
                            if (in_array($extension, ['wmf', 'emf'])) {
                                continue; // Saltar formatos no soportados en web
                            }

                            $newFilename = 'img_' . $i . '_' . time() . '.' . $extension;
                            $savePath = $imageDir . $newFilename;

                            if (file_put_contents($savePath, $imageContent)) {
                                // Intentar detectar el título/descripción de la imagen del documento
                                $titulo = $this->detectarTituloImagen($rutaDOCX, $matches[1]);

                                $imagenes[] = [
                                    'filename' => $newFilename,
                                    'path' => '/uploads/planes_imagenes/' . $planId . '/' . $newFilename,
                                    'original_name' => $matches[1],
                                    'titulo' => $titulo,
                                    'size' => strlen($imageContent)
                                ];
                            }
                        }
                    }
                }

                $zip->close();
            }

        } catch (\Exception $e) {
            error_log('Error extrayendo imágenes de DOCX: ' . $e->getMessage());
        }

        return $imagenes;
    }

    /**
     * Detectar título de una imagen basándose en el texto cercano
     */
    private function detectarTituloImagen($rutaDOCX, $imageName)
    {
        $titulo = '';

        try {
            $zip = new \ZipArchive();

            if ($zip->open($rutaDOCX) === true) {
                $xmlContent = $zip->getFromName('word/document.xml');
                $zip->close();

                if ($xmlContent !== false) {
                    // Buscar referencias a la imagen y texto cercano
                    // Buscar patrones como "Gráfica de..." antes de la imagen
                    if (preg_match('/Gr[aá]fica\s+de\s+[^<]+/iu', $xmlContent, $matches)) {
                        $titulo = trim($matches[0]);
                    }
                }
            }
        } catch (\Exception $e) {
            // Ignorar errores al detectar título
        }

        return $titulo;
    }

    /**
     * Clasificar imágenes basándose en el texto del documento
     */
    private function clasificarImagenes($imagenes, $textoDocumento)
    {
        $graficas = [];
        $textoLower = mb_strtolower($textoDocumento);

        // Detectar si hay referencias a gráficas específicas en el texto
        $tiposGrafica = [
            'indice_glucemico' => ['índice glucémico', 'indice glucemico', 'glucémico'],
            'grupos_alimentos' => ['grupos de alimentos', 'grupo de alimentos'],
            'plato_buen_comer' => ['plato del buen comer', 'plato buen comer'],
            'piramide_alimenticia' => ['pirámide alimenticia', 'piramide alimenticia', 'pirámide nutricional']
        ];

        $tiposDetectados = [];
        foreach ($tiposGrafica as $tipo => $palabras) {
            foreach ($palabras as $palabra) {
                if (mb_strpos($textoLower, $palabra) !== false) {
                    $tiposDetectados[] = $tipo;
                    break;
                }
            }
        }

        // Asignar tipos a las imágenes encontradas
        foreach ($imagenes as $idx => $imagen) {
            $grafica = [
                'imagen' => $imagen,
                'tipo' => 'general',
                'titulo' => 'Gráfica informativa ' . ($idx + 1)
            ];

            // Intentar asignar un tipo específico si se detectó
            if (isset($tiposDetectados[$idx])) {
                $grafica['tipo'] = $tiposDetectados[$idx];
                switch ($tiposDetectados[$idx]) {
                    case 'indice_glucemico':
                        $grafica['titulo'] = 'Índice Glucémico en los Alimentos';
                        $grafica['descripcion'] = 'Clasificación de alimentos según su índice glucémico: bajo, medio y alto.';
                        break;
                    case 'grupos_alimentos':
                        $grafica['titulo'] = 'Grupos de Alimentos';
                        $grafica['descripcion'] = 'Clasificación de los diferentes grupos alimenticios.';
                        break;
                    case 'plato_buen_comer':
                        $grafica['titulo'] = 'El Plato del Buen Comer';
                        $grafica['descripcion'] = 'Guía visual para una alimentación balanceada.';
                        break;
                    case 'piramide_alimenticia':
                        $grafica['titulo'] = 'Pirámide Alimenticia';
                        $grafica['descripcion'] = 'Distribución recomendada de alimentos.';
                        break;
                }
            } else {
                // Asignar basándose en el nombre del archivo si está disponible
                if (!empty($imagen['titulo'])) {
                    $grafica['titulo'] = $imagen['titulo'];
                }
            }

            $graficas[] = $grafica;
        }

        return $graficas;
    }

    /**
     * Método alternativo simple para extraer texto de DOCX
     */
    private function extractTextFromDOCXSimple($rutaDOCX)
    {
        $texto = '';

        try {
            $zip = new \ZipArchive();

            if ($zip->open($rutaDOCX) === true) {
                $xmlContent = $zip->getFromName('word/document.xml');
                $zip->close();

                if ($xmlContent !== false) {
                    // Método simple: strip tags y limpiar
                    $texto = strip_tags($xmlContent);
                    // Limpiar espacios múltiples
                    $texto = preg_replace('/\s+/', ' ', $texto);
                    // Intentar restaurar saltos de línea donde había párrafos
                    $texto = preg_replace('/<\/w:p>/i', "\n", $xmlContent);
                    $texto = strip_tags($texto);
                    $texto = preg_replace('/\s+/', ' ', $texto);
                    $texto = preg_replace('/ +/', ' ', $texto);
                }
            }
        } catch (\Exception $e) {
            error_log('Error en extractTextFromDOCXSimple: ' . $e->getMessage());
        }

        return trim($texto);
    }

    /**
     * Procesar texto extraído y convertir a JSON estructurado
     * Optimizado para formato UIOyP y otros formatos comunes de planes nutricionales
     */
    private function procesarTextoAJSON($texto)
    {
        $resultado = [
            'titulo' => '',
            'descripcion' => '',
            'paciente' => '',
            'fecha' => '',
            'siguiente_cita' => '',
            'elaboro' => '',
            'objetivo' => '',
            'indicaciones_generales' => [],
            'totales' => [
                'calorias' => 0,
                'proteinas' => 0,
                'carbohidratos' => 0,
                'grasas' => 0,
                'fibra' => 0
            ],
            'comidas' => [],
            'recomendaciones' => [],
            'restricciones' => [],
            'texto_original' => $texto
        ];

        // Si el texto está vacío, retornar estructura básica
        if (empty($texto)) {
            return $resultado;
        }

        try {

        // Extraer información del encabezado
        if (preg_match('/PLAN DE ALIMENTACI[OÓ]N PARA[:\s]*(.+?)(?=Fecha|$)/isu', $texto, $matches)) {
            $resultado['paciente'] = trim($matches[1]);
        }
        if (preg_match('/Fecha de hoy[:\s]*([^\n]+)/i', $texto, $matches)) {
            $resultado['fecha'] = trim($matches[1]);
        }
        if (preg_match('/Siguiente cita[:\s]*([^\n]+)/i', $texto, $matches)) {
            $resultado['siguiente_cita'] = trim($matches[1]);
        }
        if (preg_match('/Elabor[oó][:\s]*([^\n]+)/i', $texto, $matches)) {
            $resultado['elaboro'] = trim($matches[1]);
        }
        if (preg_match('/Objetivo[:\s]*([^\n]+)/i', $texto, $matches)) {
            $resultado['objetivo'] = trim($matches[1]);
        }

        // Extraer indicaciones generales
        if (preg_match('/Indicaciones generales[:\s]*(.+?)(?=Men[uú]:|Desayuno|$)/isu', $texto, $matches)) {
            $indicaciones = preg_split('/(?=Seguir|Recuerde|Tomar|Respetar|Ingerir|En el caso)/i', $matches[1]);
            foreach ($indicaciones as $ind) {
                $ind = trim($ind);
                if (strlen($ind) > 10) {
                    $resultado['indicaciones_generales'][] = $ind;
                }
            }
        }

        // Dividir el texto por secciones de comida
        // Patrón para detectar: "Desayuno Horario: 7:30", "Almuerzo Horario: 12:00", etc.
        $patronSeccionComida = '/(Desayuno|Almuerzo|Comida|Cena|Colaci[oó]n\s*\d*|Merienda)\s+Horario[:\s]*(\d{1,2}:\d{2})/iu';

        // Encontrar todas las secciones de comida
        preg_match_all($patronSeccionComida, $texto, $seccionesMatches, PREG_OFFSET_CAPTURE);

        if (!empty($seccionesMatches[0])) {
            $tiposComidaNormalizados = [
                'desayuno' => 'desayuno',
                'almuerzo' => 'almuerzo',
                'comida' => 'cena',
                'cena' => 'cena',
                'colacion' => 'snack',
                'colación' => 'snack',
                'merienda' => 'merienda'
            ];

            for ($i = 0; $i < count($seccionesMatches[0]); $i++) {
                $tipoRaw = $seccionesMatches[1][$i][0];
                $horario = $seccionesMatches[2][$i][0];
                $posInicio = $seccionesMatches[0][$i][1];

                // Encontrar el final de esta sección (inicio de la siguiente o fin de menú)
                $posFin = isset($seccionesMatches[0][$i + 1])
                    ? $seccionesMatches[0][$i + 1][1]
                    : strpos($texto, 'Recomendaciones:');

                if ($posFin === false) {
                    $posFin = strlen($texto);
                }

                $contenidoSeccion = substr($texto, $posInicio, $posFin - $posInicio);

                // Normalizar tipo de comida
                $tipoNormalizado = mb_strtolower(preg_replace('/\s*\d+$/', '', trim($tipoRaw)));
                $tipoNormalizado = str_replace(['á', 'é', 'í', 'ó', 'ú'], ['a', 'e', 'i', 'o', 'u'], $tipoNormalizado);
                $tipoComida = $tiposComidaNormalizados[$tipoNormalizado] ?? 'snack';

                // Extraer opciones de platillos
                // Formato: "Nombre del platillo: Descripción detallada..."
                $opciones = $this->extraerOpcionesPlatillos($contenidoSeccion);

                $comida = [
                    'dia_semana' => 'lunes',
                    'tipo_comida' => $tipoComida,
                    'nombre_original' => $tipoRaw,
                    'horario' => $horario,
                    'nombre_plato' => ucfirst($tipoNormalizado) . ' - ' . count($opciones) . ' opciones',
                    'descripcion' => '',
                    'opciones' => $opciones,
                    'ingredientes' => [],
                    'calorias' => 0,
                    'proteinas_g' => 0,
                    'carbohidratos_g' => 0,
                    'grasas_g' => 0
                ];

                $resultado['comidas'][] = $comida;
            }

            // Calcular totales estimados basándose en las opciones promedio de cada comida
            $totalCalorias = 0;
            $totalProteinas = 0;
            $totalCarbos = 0;
            $totalGrasas = 0;

            foreach ($resultado['comidas'] as &$comida) {
                // Calcular promedio de calorías de las opciones de esta comida
                $caloriasComida = 0;
                $proteinasComida = 0;
                $carbosComida = 0;
                $grasasComida = 0;
                $numOpciones = count($comida['opciones']);

                if ($numOpciones > 0) {
                    foreach ($comida['opciones'] as $opcion) {
                        $caloriasComida += $opcion['calorias_estimadas'] ?? 0;
                        $proteinasComida += $opcion['proteinas_estimadas'] ?? 0;
                        $carbosComida += $opcion['carbohidratos_estimados'] ?? 0;
                        $grasasComida += $opcion['grasas_estimadas'] ?? 0;
                    }

                    // Usar promedio de las opciones para esta comida
                    $comida['calorias'] = round($caloriasComida / $numOpciones);
                    $comida['proteinas_g'] = round($proteinasComida / $numOpciones, 1);
                    $comida['carbohidratos_g'] = round($carbosComida / $numOpciones, 1);
                    $comida['grasas_g'] = round($grasasComida / $numOpciones, 1);

                    // Sumar al total diario
                    $totalCalorias += $comida['calorias'];
                    $totalProteinas += $comida['proteinas_g'];
                    $totalCarbos += $comida['carbohidratos_g'];
                    $totalGrasas += $comida['grasas_g'];
                }
            }

            // Solo actualizar totales si se calcularon calorías
            if ($totalCalorias > 0) {
                $resultado['totales']['calorias'] = $totalCalorias;
                $resultado['totales']['proteinas'] = $totalProteinas;
                $resultado['totales']['carbohidratos'] = $totalCarbos;
                $resultado['totales']['grasas'] = $totalGrasas;
                $resultado['totales']['estimado'] = true;
            }
        }

        // Extraer recomendaciones
        if (preg_match('/Recomendaciones[:\s]*(Generales)?(.+?)(?=Gr[aá]fica|UNIDAD DE INVESTIGACI|$)/isu', $texto, $matches)) {
            $textoRecomendaciones = $matches[2];
            $recomendaciones = preg_split('/(?=Dormir|Limitar|Comer|Cuidar|Evita|Opta)/i', $textoRecomendaciones);
            foreach ($recomendaciones as $rec) {
                $rec = trim($rec);
                if (strlen($rec) > 10 && !preg_match('/^(UNIDAD|Servicio)/i', $rec)) {
                    $resultado['recomendaciones'][] = $rec;
                }
            }
        }

        // Extraer restricciones/cosas a evitar
        preg_match_all('/Evitar[:\s]*([^\.]+\.)/i', $texto, $restriccionesMatches);
        if (!empty($restriccionesMatches[1])) {
            foreach ($restriccionesMatches[1] as $restriccion) {
                $restriccion = trim($restriccion);
                if (strlen($restriccion) > 5) {
                    $resultado['restricciones'][] = 'Evitar ' . $restriccion;
                }
            }
        }

        // Buscar calorías si las hay en el documento
        if (preg_match('/(\d{4})\s*(kcal|cal|calorías)/i', $texto, $matches)) {
            $resultado['totales']['calorias'] = (int)$matches[1];
        }

        // Buscar macros si los hay
        if (preg_match('/prote[ií]nas?[:\s]*(\d+(?:[,\.]\d+)?)\s*g/i', $texto, $matches)) {
            $resultado['totales']['proteinas'] = (float)str_replace(',', '.', $matches[1]);
        }
        if (preg_match('/carbohidratos?[:\s]*(\d+(?:[,\.]\d+)?)\s*g/i', $texto, $matches)) {
            $resultado['totales']['carbohidratos'] = (float)str_replace(',', '.', $matches[1]);
        }
        if (preg_match('/grasas?[:\s]*(\d+(?:[,\.]\d+)?)\s*g/i', $texto, $matches)) {
            $resultado['totales']['grasas'] = (float)str_replace(',', '.', $matches[1]);
        }

        } catch (\Exception $e) {
            error_log('Error en procesarTextoAJSON: ' . $e->getMessage());
            // Retornar estructura básica con el texto original
            $resultado['descripcion'] = 'Error al procesar el plan: ' . $e->getMessage();
        }

        return $resultado;
    }

    /**
     * Extraer opciones de platillos de una sección de comida
     * Método robusto que detecta todos los platillos del documento
     */
    private function extraerOpcionesPlatillos($textoSeccion)
    {
        $opciones = [];
        $opcionesEncontradas = []; // Para evitar duplicados

        try {
            // Remover el encabezado de la sección (Desayuno Horario: X:XX Opciones:)
            $textoLimpio = preg_replace('/^.+?Opciones[:\s]*/isu', '', $textoSeccion);

            if (empty($textoLimpio)) {
                $textoLimpio = $textoSeccion;
            }

            // MÉTODO PRINCIPAL: Buscar patrón "Nombre del platillo: descripción..."
            // Este patrón captura nombres que empiezan con mayúscula seguidos de : y descripción
            // hasta encontrar otro nombre con mayúscula y : o fin de texto

            // Primero, normalizar el texto para facilitar la detección
            $textoNormalizado = preg_replace('/\s+/', ' ', $textoLimpio);

            // Patrón mejorado: captura "Nombre platillo:" seguido de descripción
            // El nombre puede contener letras, espacios, tildes y algunos caracteres especiales
            $patron = '/([A-ZÁÉÍÓÚÑ][a-záéíóúñA-ZÁÉÍÓÚÑ\s]{2,50}?):\s*(.+?)(?=(?:[A-ZÁÉÍÓÚÑ][a-záéíóúñA-ZÁÉÍÓÚÑ\s]{2,50}:)|$)/su';

            if (preg_match_all($patron, $textoNormalizado, $matches, PREG_SET_ORDER)) {
                foreach ($matches as $match) {
                    $nombre = trim($match[1]);
                    $descripcion = trim($match[2]);

                    // Filtrar encabezados y palabras clave del sistema
                    $palabrasExcluidas = [
                        'UNIDAD', 'Servicio', 'Horario', 'Opciones', 'Macro', 'Función',
                        'Objetivo', 'Indicaciones', 'Recomendaciones', 'Elaboró', 'Fecha',
                        'Siguiente', 'Plan', 'Menú', 'Desayuno', 'Almuerzo', 'Comida',
                        'Cena', 'Colación', 'Merienda', 'Snack', 'Gráfica'
                    ];

                    $esExcluido = false;
                    foreach ($palabrasExcluidas as $excluida) {
                        if (stripos($nombre, $excluida) === 0) {
                            $esExcluido = true;
                            break;
                        }
                    }

                    if ($esExcluido) continue;

                    // Validar que el nombre sea razonable (al menos 3 caracteres)
                    if (mb_strlen($nombre) < 3) continue;

                    // Validar que no sea solo números o caracteres especiales
                    if (!preg_match('/[a-záéíóúñA-ZÁÉÍÓÚÑ]{2,}/u', $nombre)) continue;

                    // Limpiar descripción
                    $descripcion = preg_replace('/\s+/', ' ', $descripcion);
                    $descripcion = trim($descripcion);

                    // Evitar duplicados (usando nombre normalizado)
                    $nombreKey = mb_strtolower($nombre);
                    if (isset($opcionesEncontradas[$nombreKey])) continue;
                    $opcionesEncontradas[$nombreKey] = true;

                    // Si la descripción está vacía, usar el nombre como descripción
                    if (empty($descripcion) || mb_strlen($descripcion) < 5) {
                        $descripcion = $nombre;
                    }

                    // Calcular calorías estimadas
                    $textoParaCalorias = $descripcion;
                    $nutricion = AlimentosDatabase::calcularCaloriasPlatillo($textoParaCalorias);

                    $opciones[] = [
                        'numero' => count($opciones) + 1,
                        'nombre' => $nombre,
                        'descripcion' => mb_substr($descripcion, 0, 300),
                        'items' => $this->extraerIngredientes($descripcion),
                        'calorias_estimadas' => $nutricion['calorias'],
                        'proteinas_estimadas' => $nutricion['proteinas'],
                        'carbohidratos_estimados' => $nutricion['carbohidratos'],
                        'grasas_estimadas' => $nutricion['grasas'],
                        'confianza' => $nutricion['confianza'],
                        'ingredientes_detectados' => $nutricion['ingredientes_detectados']
                    ];
                }
            }

            // MÉTODO ALTERNATIVO: Si no se encontraron opciones, buscar por líneas
            if (empty($opciones)) {
                $lineas = preg_split('/\r?\n/', $textoLimpio);
                foreach ($lineas as $linea) {
                    $linea = trim($linea);
                    if (empty($linea) || mb_strlen($linea) < 10) continue;

                    // Buscar patrón "Nombre: descripción" en cada línea
                    if (preg_match('/^([A-Za-zÁÉÍÓÚÑáéíóúñ][^:]{2,45}):\s*(.+)/', $linea, $match)) {
                        $nombre = trim($match[1]);
                        $descripcion = trim($match[2]);

                        // Filtrar encabezados
                        if (preg_match('/^(UNIDAD|Servicio|Horario|Opciones|Macro|Función|Objetivo)/i', $nombre)) {
                            continue;
                        }

                        // Evitar duplicados
                        $nombreKey = mb_strtolower($nombre);
                        if (isset($opcionesEncontradas[$nombreKey])) continue;
                        $opcionesEncontradas[$nombreKey] = true;

                        // Calcular calorías estimadas
                        $nutricion = AlimentosDatabase::calcularCaloriasPlatillo($descripcion);

                        $opciones[] = [
                            'numero' => count($opciones) + 1,
                            'nombre' => $nombre,
                            'descripcion' => $descripcion,
                            'items' => $this->extraerIngredientes($descripcion),
                            'calorias_estimadas' => $nutricion['calorias'],
                            'proteinas_estimadas' => $nutricion['proteinas'],
                            'carbohidratos_estimados' => $nutricion['carbohidratos'],
                            'grasas_estimadas' => $nutricion['grasas'],
                            'confianza' => $nutricion['confianza'],
                            'ingredientes_detectados' => $nutricion['ingredientes_detectados']
                        ];
                    }
                }
            }

        } catch (\Exception $e) {
            error_log('Error en extraerOpcionesPlatillos: ' . $e->getMessage());
        }

        return $opciones;
    }

    /**
     * Extraer ingredientes de una descripción de platillo
     */
    private function extraerIngredientes($descripcion)
    {
        $ingredientes = [];

        // Buscar patrones de ingredientes con cantidades
        // Ejemplos: "1 taza", "½ cucharadita", "2 piezas", "100g"
        $patronIngrediente = '/(\d+(?:\/\d+)?|½|¼|¾)\s*(tazas?|piezas?|cucharadas?|cucharaditas?|g|gr|ml|rebanadas?|sobres?|filetes?)\s+(?:de\s+)?([^,\.]+)/i';

        if (preg_match_all($patronIngrediente, $descripcion, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $match) {
                $ingredientes[] = trim($match[0]);
            }
        }

        return $ingredientes;
    }

    /**
     * Verificar si una línea parece un item de comida
     */
    private function esItemComida($linea)
    {
        // Patrones que indican un item de comida
        $patronesComida = [
            '/^\d+\s*(g|gr|gramos|ml|oz|cdas?|cucharadas?|tazas?|piezas?|rebanadas?|porciones?)/i',
            '/^\*\s/',
            '/^-\s/',
            '/^•\s/',
            '/^\d+\/\d+/',  // Fracciones como 1/2
            '/^(leche|pan|huevo|fruta|verdura|carne|pollo|pescado|arroz|frijol|tortilla)/i',
        ];

        foreach ($patronesComida as $patron) {
            if (preg_match($patron, $linea)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Verificar si una línea es un encabezado (versión mejorada)
     */
    private function esEncabezadoMejorado($linea)
    {
        $encabezados = [
            'desayuno', 'almuerzo', 'cena', 'merienda', 'snack', 'colacion', 'comida',
            'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo',
            'horario', 'opcion', 'opción'
        ];

        foreach ($encabezados as $enc) {
            if (strpos($linea, $enc) !== false && strlen($linea) < 50) {
                return true;
            }
        }

        // También es encabezado si empieza con "Opción X:"
        if (preg_match('/^opci[oó]n\s*\d+/i', $linea)) {
            return true;
        }

        return false;
    }

    /**
     * Verificar si una línea es un encabezado (legacy)
     */
    private function esEncabezado($linea)
    {
        return $this->esEncabezadoMejorado($linea);
    }

    /**
     * Insertar comidas del plan en la tabla
     */
    private function insertarComidasPlan($planId, $comidas)
    {
        $orden = 0;
        foreach ($comidas as $comida) {
            $this->db->query(
                "INSERT INTO plan_comidas
                 (plan_id, dia_semana, tipo_comida, nombre_plato, descripcion, ingredientes,
                  calorias, proteinas_g, carbohidratos_g, grasas_g, orden)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    $planId,
                    $comida['dia_semana'] ?? 'lunes',
                    $comida['tipo_comida'] ?? 'almuerzo',
                    $comida['nombre_plato'] ?? 'Comida',
                    $comida['descripcion'] ?? '',
                    json_encode($comida['ingredientes'] ?? []),
                    $comida['calorias'] ?? 0,
                    $comida['proteinas_g'] ?? 0,
                    $comida['carbohidratos_g'] ?? 0,
                    $comida['grasas_g'] ?? 0,
                    $orden++
                ]
            );
        }
    }

    /**
     * Actualizar contenido JSON del plan manualmente
     */
    public function updatePlanContent($planId)
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data || !isset($data['contenido'])) {
            return Response::error('Contenido requerido', 400);
        }

        // Actualizar plan
        $this->db->query(
            "UPDATE planes_nutricionales SET
             contenido_json = ?,
             calorias_diarias = ?,
             proteinas_g = ?,
             carbohidratos_g = ?,
             grasas_g = ?,
             updated_at = NOW()
             WHERE id = ?",
            [
                json_encode($data['contenido']),
                $data['contenido']['totales']['calorias'] ?? null,
                $data['contenido']['totales']['proteinas'] ?? null,
                $data['contenido']['totales']['carbohidratos'] ?? null,
                $data['contenido']['totales']['grasas'] ?? null,
                $planId
            ]
        );

        // Eliminar comidas anteriores y reinsertar
        $this->db->query("DELETE FROM plan_comidas WHERE plan_id = ?", [$planId]);

        if (!empty($data['contenido']['comidas'])) {
            $this->insertarComidasPlan($planId, $data['contenido']['comidas']);
        }

        return Response::success(null, 'Plan actualizado exitosamente');
    }

    /**
     * Obtener planes del especialista
     */
    public function getPlanesEspecialista($especialistaId)
    {
        $planes = $this->db->query(
            "SELECT pn.*,
                    (SELECT COUNT(*) FROM planes_nutricionales_paciente WHERE plan_id = pn.id AND activo = 1) as pacientes_asignados
             FROM planes_nutricionales pn
             WHERE pn.especialista_id = ?
             ORDER BY pn.created_at DESC",
            [$especialistaId]
        )->fetchAll();

        // Decodificar JSON
        foreach ($planes as &$plan) {
            $plan['contenido'] = json_decode($plan['contenido_json'], true);
            unset($plan['contenido_json']);
        }

        return Response::success(['planes' => $planes]);
    }

    /**
     * Obtener detalle de un plan
     */
    public function getPlan($planId)
    {
        $plan = $this->db->query(
            "SELECT * FROM planes_nutricionales WHERE id = ?",
            [$planId]
        )->fetch();

        if (!$plan) {
            return Response::error('Plan no encontrado', 404);
        }

        // Obtener comidas
        $comidas = $this->db->query(
            "SELECT * FROM plan_comidas WHERE plan_id = ? ORDER BY
             FIELD(dia_semana, 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'),
             FIELD(tipo_comida, 'desayuno', 'media_manana', 'almuerzo', 'merienda', 'cena', 'snack'),
             orden",
            [$planId]
        )->fetchAll();

        // Obtener pacientes asignados
        $pacientes = $this->db->query(
            "SELECT pnp.*, u.nombre_completo, u.email
             FROM planes_nutricionales_paciente pnp
             INNER JOIN pacientes p ON pnp.paciente_id = p.id
             INNER JOIN usuarios u ON p.usuario_id = u.id
             WHERE pnp.plan_id = ?",
            [$planId]
        )->fetchAll();

        $plan['contenido'] = json_decode($plan['contenido_json'], true);
        unset($plan['contenido_json']);
        $plan['comidas'] = $comidas;
        $plan['pacientes_asignados'] = $pacientes;

        return Response::success($plan);
    }

    /**
     * Asignar plan a paciente
     */
    public function asignarPlan($planId)
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['paciente_id']) || !isset($data['especialista_id'])) {
            return Response::error('Paciente y especialista requeridos', 400);
        }

        // Desactivar planes anteriores del paciente
        $this->db->query(
            "UPDATE planes_nutricionales_paciente SET activo = 0 WHERE paciente_id = ?",
            [$data['paciente_id']]
        );

        // Asignar nuevo plan
        $this->db->query(
            "INSERT INTO planes_nutricionales_paciente
             (plan_id, paciente_id, especialista_id, notas_personalizadas, fecha_inicio, activo)
             VALUES (?, ?, ?, ?, ?, 1)",
            [
                $planId,
                $data['paciente_id'],
                $data['especialista_id'],
                $data['notas'] ?? null,
                $data['fecha_inicio'] ?? date('Y-m-d')
            ]
        );

        $asignacionId = $this->db->lastInsertId();

        // Activar el plan si estaba en borrador
        $this->db->query(
            "UPDATE planes_nutricionales SET estado = 'activo' WHERE id = ? AND estado = 'borrador'",
            [$planId]
        );

        return Response::success(['asignacion_id' => $asignacionId], 'Plan asignado exitosamente');
    }

    /**
     * Obtener plan activo del paciente
     */
    public function getPlanPaciente($pacienteId)
    {
        $asignacion = $this->db->query(
            "SELECT pnp.*, pn.nombre, pn.descripcion, pn.contenido_json, pn.calorias_diarias,
                    pn.proteinas_g, pn.carbohidratos_g, pn.grasas_g,
                    u.nombre_completo as especialista_nombre
             FROM planes_nutricionales_paciente pnp
             INNER JOIN planes_nutricionales pn ON pnp.plan_id = pn.id
             INNER JOIN usuarios u ON pnp.especialista_id = u.id
             WHERE pnp.paciente_id = ? AND pnp.activo = 1
             LIMIT 1",
            [$pacienteId]
        )->fetch();

        if (!$asignacion) {
            return Response::success([
                'tiene_plan' => false,
                'mensaje' => 'No tienes un plan nutricional asignado aún'
            ]);
        }

        // Obtener comidas del plan
        $comidas = $this->db->query(
            "SELECT * FROM plan_comidas WHERE plan_id = ? ORDER BY
             FIELD(dia_semana, 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'),
             FIELD(tipo_comida, 'desayuno', 'media_manana', 'almuerzo', 'merienda', 'cena', 'snack'),
             orden",
            [$asignacion['plan_id']]
        )->fetchAll();

        // Obtener seguimiento del día actual
        $hoy = date('Y-m-d');
        $seguimiento = $this->db->query(
            "SELECT * FROM seguimiento_plan_nutricional
             WHERE asignacion_id = ? AND fecha = ?",
            [$asignacion['id'], $hoy]
        )->fetchAll();

        $asignacion['contenido'] = json_decode($asignacion['contenido_json'], true);
        unset($asignacion['contenido_json']);
        $asignacion['comidas'] = $comidas;
        $asignacion['seguimiento_hoy'] = $seguimiento;
        $asignacion['tiene_plan'] = true;

        return Response::success($asignacion);
    }

    /**
     * Registrar seguimiento de comida
     */
    public function registrarSeguimiento($pacienteId)
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['asignacion_id']) || !isset($data['tipo_comida'])) {
            return Response::error('Datos requeridos', 400);
        }

        $this->db->query(
            "INSERT INTO seguimiento_plan_nutricional
             (asignacion_id, paciente_id, fecha, comida_id, tipo_comida, cumplido, notas)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE cumplido = ?, notas = ?",
            [
                $data['asignacion_id'],
                $pacienteId,
                $data['fecha'] ?? date('Y-m-d'),
                $data['comida_id'] ?? null,
                $data['tipo_comida'],
                $data['cumplido'] ? 1 : 0,
                $data['notas'] ?? null,
                $data['cumplido'] ? 1 : 0,
                $data['notas'] ?? null
            ]
        );

        return Response::success(null, 'Seguimiento registrado');
    }

    /**
     * Eliminar plan
     */
    public function deletePlan($planId)
    {
        // Verificar que no tenga pacientes activos
        $activos = $this->db->query(
            "SELECT COUNT(*) as total FROM planes_nutricionales_paciente WHERE plan_id = ? AND activo = 1",
            [$planId]
        )->fetch();

        if ($activos['total'] > 0) {
            return Response::error('No se puede eliminar un plan con pacientes activos', 400);
        }

        $this->db->query("DELETE FROM planes_nutricionales WHERE id = ?", [$planId]);

        return Response::success(null, 'Plan eliminado');
    }

    /**
     * Verificar si un comando existe en el sistema
     */
    private function commandExists($cmd)
    {
        // Detectar sistema operativo
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            // Windows: usar where
            $return = shell_exec(sprintf("where %s 2>NUL", escapeshellarg($cmd)));
        } else {
            // Unix/Linux/Mac: usar which
            $return = shell_exec(sprintf("which %s 2>/dev/null", escapeshellarg($cmd)));
        }
        return !empty($return);
    }

    /**
     * Sanitizar array recursivamente para asegurar UTF-8 válido
     */
    private function sanitizeArrayUtf8($data)
    {
        if (is_array($data)) {
            $result = [];
            foreach ($data as $key => $value) {
                $cleanKey = is_string($key) ? $this->sanitizeUtf8($key) : $key;
                $result[$cleanKey] = $this->sanitizeArrayUtf8($value);
            }
            return $result;
        } elseif (is_string($data)) {
            return $this->sanitizeUtf8($data);
        }
        return $data;
    }

    /**
     * Sanitizar texto a UTF-8 válido
     */
    private function sanitizeUtf8($text)
    {
        if (empty($text)) {
            return '';
        }

        // Intentar detectar y convertir encoding
        $encoding = mb_detect_encoding($text, ['UTF-8', 'ISO-8859-1', 'Windows-1252', 'ASCII'], true);

        if ($encoding && $encoding !== 'UTF-8') {
            $text = mb_convert_encoding($text, 'UTF-8', $encoding);
        }

        // Eliminar caracteres no válidos de UTF-8
        $text = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $text);

        // Asegurar UTF-8 válido
        $text = mb_convert_encoding($text, 'UTF-8', 'UTF-8');

        // Si aún hay problemas, forzar limpieza
        if (!mb_check_encoding($text, 'UTF-8')) {
            $text = iconv('UTF-8', 'UTF-8//IGNORE', $text);
        }

        return $text ?: '';
    }
}