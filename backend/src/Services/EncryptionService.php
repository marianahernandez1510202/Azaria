<?php
namespace App\Services;

/**
 * Servicio de Encriptación AES-256-GCM para datos sensibles
 *
 * Cumplimiento normativo:
 * - Normas Complementarias UNAM sobre Medidas de Seguridad (Art. 26-28)
 * - Lineamientos de Resguardo de Información Electrónica UNAM
 * - Ley Federal de Protección de Datos Personales
 *
 * Implementa encriptación en reposo para datos médicos sensibles:
 * - Bitácoras de glucosa, presión arterial, dolor
 * - Información clínica de pacientes
 * - Datos personales identificables
 */
class EncryptionService {

    private const CIPHER_METHOD = 'aes-256-gcm';
    private const TAG_LENGTH = 16;

    private string $encryptionKey;

    public function __construct() {
        $this->encryptionKey = $this->getEncryptionKey();
    }

    /**
     * Encripta datos sensibles usando AES-256-GCM
     * GCM proporciona autenticación integrada (AEAD)
     */
    public function encrypt(string $plaintext): string {
        if (empty($plaintext)) {
            return '';
        }

        $iv = random_bytes(12); // 96 bits para GCM
        $tag = '';

        $ciphertext = openssl_encrypt(
            $plaintext,
            self::CIPHER_METHOD,
            $this->encryptionKey,
            OPENSSL_RAW_DATA,
            $iv,
            $tag,
            '',
            self::TAG_LENGTH
        );

        if ($ciphertext === false) {
            throw new \RuntimeException('Error en encriptación: ' . openssl_error_string());
        }

        // Formato: base64(iv + tag + ciphertext)
        return base64_encode($iv . $tag . $ciphertext);
    }

    /**
     * Desencripta datos previamente encriptados
     */
    public function decrypt(string $encryptedData): string {
        if (empty($encryptedData)) {
            return '';
        }

        $decoded = base64_decode($encryptedData, true);
        if ($decoded === false) {
            throw new \RuntimeException('Datos encriptados inválidos');
        }

        // Extraer componentes: iv (12) + tag (16) + ciphertext
        $iv = substr($decoded, 0, 12);
        $tag = substr($decoded, 12, self::TAG_LENGTH);
        $ciphertext = substr($decoded, 12 + self::TAG_LENGTH);

        if (strlen($iv) !== 12 || strlen($tag) !== self::TAG_LENGTH) {
            throw new \RuntimeException('Formato de datos encriptados corrupto');
        }

        $plaintext = openssl_decrypt(
            $ciphertext,
            self::CIPHER_METHOD,
            $this->encryptionKey,
            OPENSSL_RAW_DATA,
            $iv,
            $tag
        );

        if ($plaintext === false) {
            throw new \RuntimeException('Error en desencriptación: autenticación fallida');
        }

        return $plaintext;
    }

    /**
     * Encripta un array de datos sensibles (ej: registro médico completo)
     */
    public function encryptArray(array $data, array $sensitiveFields): array {
        foreach ($sensitiveFields as $field) {
            if (isset($data[$field]) && !empty($data[$field])) {
                $data[$field] = $this->encrypt((string)$data[$field]);
            }
        }
        return $data;
    }

    /**
     * Desencripta campos específicos de un array
     */
    public function decryptArray(array $data, array $encryptedFields): array {
        foreach ($encryptedFields as $field) {
            if (isset($data[$field]) && !empty($data[$field])) {
                try {
                    $data[$field] = $this->decrypt($data[$field]);
                } catch (\RuntimeException $e) {
                    // Si falla la desencriptación, puede ser dato no encriptado (migración)
                    // Registrar para auditoría pero no fallar
                    error_log("Campo {$field} no pudo desencriptarse: " . $e->getMessage());
                }
            }
        }
        return $data;
    }

    /**
     * Hash seguro para datos que no necesitan ser reversibles (ej: búsquedas)
     */
    public function secureHash(string $data): string {
        return hash_hmac('sha256', $data, $this->encryptionKey);
    }

    /**
     * Verifica si un valor coincide con un hash
     */
    public function verifyHash(string $data, string $hash): bool {
        return hash_equals($this->secureHash($data), $hash);
    }

    /**
     * Obtiene la clave de encriptación desde las variables de entorno
     */
    private function getEncryptionKey(): string {
        $key = $_ENV['ENCRYPTION_KEY'] ?? getenv('ENCRYPTION_KEY');

        if (empty($key)) {
            // En desarrollo, usar clave derivada del JWT_SECRET
            // IMPORTANTE: En producción, debe configurarse ENCRYPTION_KEY separada
            $jwtSecret = $_ENV['JWT_SECRET'] ?? getenv('JWT_SECRET') ?? '';
            if (empty($jwtSecret)) {
                throw new \RuntimeException(
                    'ENCRYPTION_KEY o JWT_SECRET deben estar configurados'
                );
            }
            // Derivar clave de 256 bits usando HKDF
            $key = hash_hkdf('sha256', $jwtSecret, 32, 'vitalia_encryption_key');
        } else {
            // Decodificar clave base64
            $key = base64_decode($key, true);
            if ($key === false || strlen($key) !== 32) {
                throw new \RuntimeException(
                    'ENCRYPTION_KEY debe ser 32 bytes codificados en base64'
                );
            }
        }

        return $key;
    }

    /**
     * Genera una nueva clave de encriptación (para configuración inicial)
     */
    public static function generateKey(): string {
        return base64_encode(random_bytes(32));
    }

    /**
     * Lista de campos sensibles por tabla que requieren encriptación
     */
    public static function getSensitiveFields(): array {
        return [
            'bitacora_glucosa' => ['valor_glucosa', 'notas'],
            'bitacora_presion' => ['sistolica', 'diastolica', 'pulso', 'notas'],
            'bitacora_dolor' => ['nivel_dolor', 'ubicacion', 'descripcion'],
            'registro_animo' => ['estado_animo', 'notas'],
            'pacientes' => ['diagnostico', 'antecedentes_medicos', 'medicamentos_actuales'],
            'historial_clinico' => ['descripcion', 'observaciones'],
            'citas_medicas' => ['motivo', 'notas'],
        ];
    }
}
