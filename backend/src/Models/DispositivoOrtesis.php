<?php
namespace App\Models;
use App\Services\DatabaseService;

class DispositivoOrtesis {
    private static $table = 'dispositivos_ortesis';

    public static function find($id) {
        $db = DatabaseService::getInstance();
        return $db->query("SELECT * FROM " . self::$table . " WHERE id = ?", [$id])->fetch();
    }

    public static function getAll() {
        $db = DatabaseService::getInstance();
        return $db->query("SELECT * FROM " . self::$table . " ORDER BY created_at DESC")->fetchAll();
    }

    public static function getByPaciente($pacienteId) {
        $db = DatabaseService::getInstance();

        $dispositivo = $db->query(
            "SELECT * FROM " . self::$table . " WHERE paciente_id = ?",
            [$pacienteId]
        )->fetch();

        if (!$dispositivo) {
            // Retornar información por defecto si no existe
            return [
                'paciente_id' => $pacienteId,
                'tipo' => 'No registrado',
                'marca' => '',
                'modelo' => '',
                'fecha_adquisicion' => null,
                'notas' => 'No se ha registrado información del dispositivo'
            ];
        }

        return $dispositivo;
    }

    public static function create($data) {
        $db = DatabaseService::getInstance();

        $db->query(
            "INSERT INTO " . self::$table . "
             (paciente_id, tipo, marca, modelo, fecha_adquisicion, notas, created_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW())",
            [
                $data['paciente_id'],
                $data['tipo'],
                $data['marca'] ?? null,
                $data['modelo'] ?? null,
                $data['fecha_adquisicion'] ?? null,
                $data['notas'] ?? null
            ]
        );

        return $db->lastInsertId();
    }

    public static function update($pacienteId, $data) {
        $db = DatabaseService::getInstance();

        $fields = [];
        $values = [];

        $allowedFields = ['tipo', 'marca', 'modelo', 'fecha_adquisicion', 'notas'];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = ?";
                $values[] = $data[$field];
            }
        }

        if (empty($fields)) return false;

        $values[] = $pacienteId;
        $query = "UPDATE " . self::$table . " SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE paciente_id = ?";

        return $db->query($query, $values);
    }

    public static function delete($id) {
        $db = DatabaseService::getInstance();
        return $db->query("DELETE FROM " . self::$table . " WHERE id = ?", [$id]);
    }

    public static function getGuias() {
        $db = DatabaseService::getInstance();

        // Intentar obtener guías desde guias_cuidado para órtesis
        try {
            $guias = $db->query(
                "SELECT * FROM guias_cuidado WHERE tipo = 'ortesis' AND publicado = 1 ORDER BY orden"
            )->fetchAll();

            if (!empty($guias)) {
                return $guias;
            }
        } catch (\Exception $e) {
            // Si falla, devolver guías por defecto
        }

        // Guías por defecto
        return [
            [
                'id' => 1,
                'titulo' => 'Limpieza diaria del dispositivo',
                'tipo' => 'ortesis',
                'contenido' => 'Limpie su dispositivo diariamente con un paño húmedo y jabón neutro. Séquelo completamente antes de usarlo.',
                'orden' => 1
            ],
            [
                'id' => 2,
                'titulo' => 'Cuidado de la piel',
                'tipo' => 'ortesis',
                'contenido' => 'Revise su piel diariamente en busca de enrojecimiento, ampollas o irritación. Mantenga la piel limpia y seca.',
                'orden' => 2
            ],
            [
                'id' => 3,
                'titulo' => 'Ajuste y comodidad',
                'tipo' => 'ortesis',
                'contenido' => 'Si siente incomodidad o el dispositivo se afloja, contacte a su especialista. No intente ajustarlo usted mismo.',
                'orden' => 3
            ],
            [
                'id' => 4,
                'titulo' => 'Almacenamiento',
                'tipo' => 'ortesis',
                'contenido' => 'Cuando no use su dispositivo, guárdelo en un lugar seco y alejado de fuentes de calor directo.',
                'orden' => 4
            ]
        ];
    }

    public static function getEspecialistasAsignados($pacienteId) {
        $db = DatabaseService::getInstance();

        try {
            return $db->query(
                "SELECT u.nombre_completo, u.email, am.nombre as area
                 FROM asignaciones_especialista ae
                 JOIN usuarios u ON ae.especialista_id = u.id
                 LEFT JOIN areas_medicas am ON ae.area_medica_id = am.id
                 WHERE ae.paciente_id = ? AND am.nombre LIKE '%ortesis%'",
                [$pacienteId]
            )->fetchAll();
        } catch (\Exception $e) {
            return [];
        }
    }
}
