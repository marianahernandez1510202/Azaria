# Próximos Pasos - Guía de Implementación

## Inicio Rápido (30 minutos)

### 1. Instalar Dependencias

```bash
# Backend
cd backend
composer install

# Frontend
cd ../frontend
npm install
```

### 2. Configurar Base de Datos

```bash
# Crear base de datos
mysql -u root -p
CREATE DATABASE vitalia_v2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;

# Copiar y configurar .env
cd backend
cp .env.example .env
# Editar .env con tus credenciales
```

### 3. Generar Claves de Seguridad

```bash
# JWT_SECRET
php -r "echo 'JWT_SECRET=' . bin2hex(random_bytes(32)) . PHP_EOL;"

# ENCRYPTION_KEY
php -r "echo 'ENCRYPTION_KEY=' . bin2hex(random_bytes(32)) . PHP_EOL;"

# Copiar las claves generadas en backend/.env
```

### 4. Iniciar en Modo Desarrollo

```bash
# Terminal 1 - Backend
cd backend/public
php -S localhost:8000

# Terminal 2 - Frontend
cd frontend
npm start
```

Acceder a: http://localhost:3000

---

## Fase 1: Base de Datos (2-3 horas)

### Crear Migraciones SQL

Crear estos archivos en `backend/database/migrations/`:

#### 001_create_users_table.sql
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'especialista', 'paciente') NOT NULL,
    fecha_nacimiento DATE,
    first_login BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_rol (rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 002_create_user_pins_table.sql
```sql
CREATE TABLE user_pins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    pin_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_pin (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 003_create_trusted_devices_table.sql
```sql
CREATE TABLE trusted_devices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    device_fingerprint VARCHAR(255) NOT NULL,
    device_name VARCHAR(255),
    browser VARCHAR(255),
    os VARCHAR(255),
    ip_address VARCHAR(45),
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_device (user_id, device_fingerprint)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 004_create_failed_login_attempts_table.sql
```sql
CREATE TABLE failed_login_attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email_time (email, attempted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 005_create_password_recovery_table.sql
```sql
CREATE TABLE password_recovery (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    code VARCHAR(6) NOT NULL,
    reset_token VARCHAR(255),
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_code (code),
    INDEX idx_token (reset_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 006_create_blacklisted_tokens_table.sql
```sql
CREATE TABLE blacklisted_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    token TEXT NOT NULL,
    blacklisted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Continuar con las otras 10+ tablas para los demás módulos...**

### Script de Migración

Crear `backend/database/migrate.php`:

```php
<?php

require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

$config = require __DIR__ . '/../config/database.php';

try {
    $pdo = new PDO(
        "mysql:host={$config['host']};port={$config['port']};dbname={$config['database']}",
        $config['username'],
        $config['password']
    );

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $migrationsPath = __DIR__ . '/migrations/';
    $files = glob($migrationsPath . '*.sql');
    sort($files);

    foreach ($files as $file) {
        echo "Ejecutando: " . basename($file) . "\n";
        $sql = file_get_contents($file);
        $pdo->exec($sql);
        echo "✓ Completado\n";
    }

    echo "\n✅ Todas las migraciones ejecutadas exitosamente\n";
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
```

Ejecutar:
```bash
php backend/database/migrate.php
```

---

## Fase 2: Modelos PHP (2-4 horas)

Crear modelos siguiendo el patrón de `User.php`:

### Ejemplo: Paciente.php

```php
<?php

namespace App\Models;

use App\Services\DatabaseService;

class Paciente
{
    private static $table = 'pacientes';

    public static function find($id)
    {
        $db = DatabaseService::getInstance();
        return $db->query("SELECT * FROM " . self::$table . " WHERE id = ?", [$id])->fetch();
    }

    public static function findByUserId($userId)
    {
        $db = DatabaseService::getInstance();
        return $db->query("SELECT * FROM " . self::$table . " WHERE user_id = ?", [$userId])->fetch();
    }

    public static function create($data)
    {
        $db = DatabaseService::getInstance();
        // Implementar INSERT
    }

    public static function update($id, $data)
    {
        $db = DatabaseService::getInstance();
        // Implementar UPDATE
    }

    public static function getEspecialistasAsignados($pacienteId)
    {
        $db = DatabaseService::getInstance();
        // Implementar query con JOIN
    }
}
```

Crear los 27 modelos restantes listados en `backend/src/Models/_MODELS_README.txt`

---

## Fase 3: Componentes Frontend Críticos (4-6 horas)

### 1. Navbar y Sidebar

**frontend/src/components/shared/Navbar.jsx**
```jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>Vitalia</h1>
      </div>
      <div className="navbar-user">
        <span>{user?.nombre_completo}</span>
        <button onClick={logout} className="btn btn-secondary">
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
```

### 2. Onboarding (Primer Acceso)

**frontend/src/components/auth/Onboarding.jsx**
```jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ConfigurarPIN from './ConfigurarPIN';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate('/');
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <h1>Bienvenido a Vitalia, {user?.nombre_completo}</h1>

        {step === 1 && (
          <div>
            <p>Vamos a configurar tu cuenta en 2 simples pasos.</p>
            <button onClick={() => setStep(2)} className="btn btn-primary btn-lg">
              Comenzar
            </button>
          </div>
        )}

        {step === 2 && (
          <ConfigurarPIN onComplete={handleComplete} />
        )}
      </div>
    </div>
  );
};

export default Onboarding;
```

### 3. Crear Páginas Stub

Para cada página en `frontend/src/pages/`, crear un stub básico:

```jsx
import React from 'react';

const Nutricion = () => {
  return (
    <div className="page-container">
      <h1>Nutrición</h1>
      <p>Página en construcción...</p>
    </div>
  );
};

export default Nutricion;
```

---

## Fase 4: Testing Inicial (1-2 horas)

### 1. Crear Usuario de Prueba

```bash
cd backend
php -r "
require 'vendor/autoload.php';
\$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
\$dotenv->load();

use App\Models\User;
use App\Services\DatabaseService;

\$db = DatabaseService::getInstance();
User::create([
    'email' => 'paciente@vitalia.app',
    'password' => 'Test123!',
    'nombre_completo' => 'Juan Pérez',
    'rol' => 'paciente',
    'fecha_nacimiento' => '1960-05-15'
]);

echo 'Usuario creado exitosamente\n';
"
```

### 2. Probar Flujo Completo

1. Acceder a http://localhost:3000/login
2. Iniciar sesión con paciente@vitalia.app / Test123!
3. Configurar PIN de 6 dígitos
4. Navegar por las páginas disponibles
5. Cerrar sesión
6. Iniciar sesión nuevamente con PIN

---

## Checklist de Tareas

### Backend ✅ Completado
- [x] Configuración
- [x] 14 Controladores
- [x] Servicios principales
- [x] Middleware
- [x] Utilidades
- [x] Rutas API

### Backend 📝 Pendiente
- [ ] 27 Modelos
- [ ] 16 Migraciones SQL
- [ ] Seeds de prueba
- [ ] 6 Archivos cron
- [ ] Servicios adicionales (Google Calendar, Notifications, etc.)

### Frontend ✅ Completado
- [x] Configuración React
- [x] AuthContext
- [x] API Service
- [x] Login completo con PIN
- [x] Teclado virtual
- [x] ProtectedRoute
- [x] Páginas básicas

### Frontend 📝 Pendiente
- [ ] Navbar y Sidebar
- [ ] Onboarding completo
- [ ] 13 páginas funcionales
- [ ] ~140 componentes de módulos
- [ ] Hooks personalizados
- [ ] NotificationContext
- [ ] ThemeContext
- [ ] ChatContext

### Integración 📝 Pendiente
- [ ] Google Calendar setup
- [ ] SendGrid/SMTP setup
- [ ] Configurar cron jobs
- [ ] SSL/HTTPS en producción
- [ ] Backup automático

---

## Recursos Útiles

### Documentación
- [Requerimientos Funcionales](docs/requerimientos/)
- [Diagramas del Sistema](docs/diagramas/)
- [API Documentation](docs/api/)

### Comandos Útiles

```bash
# Ver logs backend
tail -f backend/storage/logs/app.log

# Limpiar caché
rm -rf frontend/node_modules/.cache

# Rebuild frontend
cd frontend && npm run build

# Backup base de datos
mysqldump -u root -p vitalia_v2 > backup.sql
```

### Contacto

Si necesitas ayuda:
- 📞 442-XXX-XXXX
- ✉️ soporte-tecnico@vitalia.app
- 📚 Documentación: /docs

---

## Estimación de Tiempo Total

- **MVP Funcional**: 20-30 horas
- **Sistema Completo**: 60-80 horas
- **Testing y Optimización**: 10-15 horas

**Total**: 90-125 horas de desarrollo

---

¡Buena suerte con el desarrollo! 🚀

**Última actualización**: 15 de Enero de 2026
