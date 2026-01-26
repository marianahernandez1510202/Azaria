<?php

namespace App\Services;

class PINService
{
    private $db;

    public function __construct()
    {
        $this->db = DatabaseService::getInstance();
    }

    public function setPIN($userId, $pin)
    {
        // Hashear el PIN
        $hashedPIN = password_hash($pin, PASSWORD_BCRYPT);

        $this->db->query(
            "INSERT INTO user_pins (user_id, pin_hash, created_at)
             VALUES (?, ?, NOW())
             ON DUPLICATE KEY UPDATE pin_hash = ?, updated_at = NOW()",
            [$userId, $hashedPIN, $hashedPIN]
        );

        return true;
    }

    public function verifyPIN($userId, $pin)
    {
        $result = $this->db->query(
            "SELECT pin_hash FROM user_pins WHERE user_id = ?",
            [$userId]
        )->fetch();

        if (!$result) {
            return false;
        }

        return password_verify($pin, $result['pin_hash']);
    }

    public function isValidPIN($pin)
    {
        // Verificar que no sea una secuencia obvia
        $obviousPatterns = [
            '000000', '111111', '222222', '333333', '444444',
            '555555', '666666', '777777', '888888', '999999',
            '123456', '654321', '012345', '543210',
            '111222', '222333', '333444', '444555',
            '555666', '666777', '777888', '888999'
        ];

        if (in_array($pin, $obviousPatterns)) {
            return false;
        }

        // Verificar patrones repetitivos
        if ($this->isRepetitivePattern($pin)) {
            return false;
        }

        return true;
    }

    private function isRepetitivePattern($pin)
    {
        // Verificar si todos los dígitos son iguales
        if (count(array_unique(str_split($pin))) === 1) {
            return true;
        }

        // Verificar secuencias ascendentes/descendentes
        $ascending = true;
        $descending = true;

        for ($i = 0; $i < strlen($pin) - 1; $i++) {
            if ($pin[$i] + 1 !== (int)$pin[$i + 1]) {
                $ascending = false;
            }
            if ($pin[$i] - 1 !== (int)$pin[$i + 1]) {
                $descending = false;
            }
        }

        return $ascending || $descending;
    }

    public function hasPIN($userId)
    {
        $result = $this->db->query(
            "SELECT COUNT(*) as count FROM user_pins WHERE user_id = ?",
            [$userId]
        )->fetch();

        return $result['count'] > 0;
    }

    public function deletePIN($userId)
    {
        return $this->db->query(
            "DELETE FROM user_pins WHERE user_id = ?",
            [$userId]
        );
    }
}
