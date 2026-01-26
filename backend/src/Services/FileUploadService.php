<?php

namespace App\Services;

class FileUploadService
{
    private $uploadPath;
    private $allowedTypes;
    private $maxFileSize;

    public function __construct()
    {
        $config = require __DIR__ . '/../../config/app.php';
        $this->uploadPath = $config['upload']['upload_path'];
        $this->allowedTypes = $config['upload']['allowed_image_types'];
        $this->maxFileSize = $config['upload']['max_file_size'];
    }

    public function upload($file, $folder = '')
    {
        // Validar archivo
        if (!$this->validateFile($file)) {
            throw new \Exception('Archivo inválido');
        }

        // Generar nombre único
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $fileName = uniqid() . '_' . time() . '.' . $extension;

        // Crear carpeta si no existe
        $targetPath = $this->uploadPath . $folder;
        if (!is_dir($targetPath)) {
            mkdir($targetPath, 0755, true);
        }

        // Mover archivo
        $targetFile = $targetPath . '/' . $fileName;
        if (move_uploaded_file($file['tmp_name'], $targetFile)) {
            return $folder . '/' . $fileName;
        }

        throw new \Exception('Error al subir archivo');
    }

    private function validateFile($file)
    {
        // Verificar errores
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return false;
        }

        // Verificar tamaño
        if ($file['size'] > $this->maxFileSize) {
            return false;
        }

        // Verificar tipo
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($extension, $this->allowedTypes)) {
            return false;
        }

        return true;
    }

    public function delete($filePath)
    {
        $fullPath = $this->uploadPath . $filePath;
        if (file_exists($fullPath)) {
            return unlink($fullPath);
        }

        return false;
    }
}
