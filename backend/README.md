# Backend API - Sistema Vitalia

API REST desarrollada en PHP para el sistema de rehabilitación Vitalia.

## Estructura

- `config/` - Archivos de configuración
- `public/` - Punto de entrada y archivos públicos
- `src/` - Código fuente
  - `Controllers/` - 14 controladores de módulos
  - `Models/` - Modelos de datos
  - `Services/` - Servicios de negocio
  - `Middleware/` - Middleware de autenticación y autorización
  - `Utils/` - Utilidades
  - `Routes/` - Definición de rutas
- `database/` - Migraciones y seeds
- `storage/` - Logs y archivos temporales
- `cron/` - Tareas programadas

## Instalación

```bash
composer install
cp .env.example .env
php database/migrate.php
```

## Rutas API

Ver documentación completa en `/docs/api/`

- POST `/api/auth/login` - Iniciar sesión
- GET `/api/perfil` - Obtener perfil usuario
- GET `/api/citas` - Listar citas
- ... (ver api.php)
