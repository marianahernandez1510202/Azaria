-- =====================================================
-- TABLAS PARA INTEGRACIÓN CON MICROSOFT OUTLOOK
-- Ejecutar en MySQL Workbench
-- =====================================================

-- Tabla para almacenar estados OAuth (prevenir CSRF)
CREATE TABLE IF NOT EXISTS oauth_states (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    state VARCHAR(64) NOT NULL,
    provider ENUM('microsoft', 'google') NOT NULL DEFAULT 'microsoft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    UNIQUE KEY unique_user_provider (user_id, provider),
    INDEX idx_state (state),
    INDEX idx_expires (expires_at)
);

-- Tabla para almacenar tokens OAuth de usuarios
CREATE TABLE IF NOT EXISTS user_oauth_tokens (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    provider ENUM('microsoft', 'google') NOT NULL DEFAULT 'microsoft',
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP NOT NULL,
    microsoft_email VARCHAR(255),
    connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_provider (user_id, provider),
    INDEX idx_user (user_id),
    INDEX idx_expires (expires_at)
);

-- Agregar columnas a la tabla citas para sincronización con Outlook
-- (Solo ejecutar si la tabla citas ya existe)

-- Verificar si la columna outlook_event_id existe, si no, agregarla
SET @dbname = DATABASE();
SET @tablename = 'citas';
SET @columnname = 'outlook_event_id';
SET @preparedStatement = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
    'SELECT 1',
    'ALTER TABLE citas ADD COLUMN outlook_event_id VARCHAR(255) DEFAULT NULL'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Agregar columna outlook_synced_at si no existe
SET @columnname = 'outlook_synced_at';
SET @preparedStatement = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
    'SELECT 1',
    'ALTER TABLE citas ADD COLUMN outlook_synced_at TIMESTAMP NULL DEFAULT NULL'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Agregar índice para outlook_event_id
-- ALTER TABLE citas ADD INDEX idx_outlook_event (outlook_event_id);

-- Limpiar estados OAuth expirados (ejecutar periódicamente)
-- DELETE FROM oauth_states WHERE expires_at < NOW();

-- Ver tablas creadas
SELECT 'Tablas para integración con Outlook creadas correctamente' as mensaje;
SHOW TABLES LIKE '%oauth%';
