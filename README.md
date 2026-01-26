# Sistema Vitalia v2.0

Sistema de rehabilitación para pacientes con amputación de miembro inferior desarrollado para la Unidad de Investigación en Órtesis y Prótesis (UIOyP).

## Descripción

Vitalia es un sistema web integral diseñado específicamente para adultos mayores (60-80 años) que están en proceso de rehabilitación tras una amputación de miembro inferior. El sistema proporciona seguimiento médico, nutricional, físico y psicológico durante las 4 fases del proceso de rehabilitación.

## Características Principales

### 14 Módulos Funcionales

1. **Autenticación Simplificada** - PIN de 6 dígitos, sesiones persistentes
2. **Perfil de Usuario** - Información personal y médica
3. **Gestión de Fases** - Seguimiento del progreso en 4 fases
4. **Nutrición** - Recetas, historial de comidas, checklists
5. **Medicina** - Bitácoras de glucosa, presión y dolor
6. **Fisioterapia** - Videos de ejercicios y guías de prótesis
7. **Neuropsicología** - Estado de ánimo y bienestar emocional
8. **Órtesis y Prótesis** - Información y mantenimiento de dispositivos
9. **Citas** - Agendamiento con integración a Google Calendar
10. **Chat Temporal** - Comunicación con especialistas
11. **Recordatorios** - Notificaciones personalizadas
12. **FAQs** - Preguntas frecuentes por área
13. **Blog Educativo** - Artículos de salud
14. **Comunidad** - Espacio de interacción entre pacientes

## Tecnologías

### Backend
- PHP 8.1+
- MySQL 8.0+
- Composer

### Frontend
- React 18+
- React Router
- Axios
- CSS3

### Integraciones
- Google Calendar API
- SendGrid/SMTP para emails

## Instalación

### Requisitos Previos
- PHP 8.1 o superior
- MySQL 8.0 o superior
- Node.js 18+ y npm
- Composer

### Configuración

1. Clonar el repositorio
```bash
git clone <repository-url>
cd vitalia
```

2. Instalar dependencias
```bash
npm run setup
```

3. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

4. Configurar base de datos
```bash
npm run backend:migrate
npm run backend:seed
```

5. Iniciar en modo desarrollo
```bash
npm run dev
```

## Estructura del Proyecto

```
vitalia-v2/
├── backend/          # API PHP
├── frontend/         # Aplicación React
├── docs/            # Documentación
├── tests/           # Pruebas
└── scripts/         # Scripts de utilidad
```

## Accesibilidad

El sistema está diseñado específicamente para adultos mayores con las siguientes características:

- Textos grandes y legibles
- Alto contraste
- Botones amplios
- Navegación simplificada
- PIN numérico en lugar de contraseñas complejas
- Teclado virtual en pantalla
- Sesiones persistentes de 30 días
- Ayuda contextual siempre visible

## Seguridad

- Autenticación basada en JWT
- Sesiones cifradas
- Límite de intentos de login
- Bloqueo temporal tras fallos
- Validación de entrada en todos los formularios
- Protección contra XSS, SQL Injection y CSRF

## Contribución

Este es un proyecto desarrollado para la UIOyP. Para contribuir:

1. Crear un fork del proyecto
2. Crear una rama para tu feature
3. Hacer commit de tus cambios
4. Push a la rama
5. Crear un Pull Request

## Licencia

Copyright © 2026 UIOyP. Todos los derechos reservados.

## Soporte

Para soporte técnico, contactar a:
- Email: ayuda@vitalia.app
- Teléfono: 442-XXX-XXXX
- Horario: Lunes a Viernes, 9:00 - 18:00

## Autores

- Desarrollado para la Unidad de Investigación en Órtesis y Prótesis (UIOyP)
- Universidad Autónoma de Querétaro
