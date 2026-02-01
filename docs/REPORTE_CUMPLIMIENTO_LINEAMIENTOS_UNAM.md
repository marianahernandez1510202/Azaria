# REPORTE DE EVALUACIÓN DE CUMPLIMIENTO
## Sistema Vitalia v2.0 vs Lineamientos de Seguridad UNAM

---

**Universidad Nacional Autónoma de México**
**Unidad de Investigación en Órtesis y Prótesis (UIOyP)**

---

| Campo | Valor |
|-------|-------|
| **Sistema Evaluado** | Sistema Vitalia v2.0 - Rehabilitación para pacientes con amputación |
| **Fecha de Evaluación** | 22 de enero de 2026 |
| **Versión del Reporte** | 1.0 |
| **Clasificación** | Aplicación Web Clínica con datos médicos sensibles |
| **Responsable de Evaluación** | Área de Desarrollo TIC |

---

## ÍNDICE

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Alcance de la Evaluación](#2-alcance-de-la-evaluación)
3. [Documentos Normativos Evaluados](#3-documentos-normativos-evaluados)
4. [Descripción del Sistema](#4-descripción-del-sistema)
5. [Resultados de la Evaluación](#5-resultados-de-la-evaluación)
   - 5.1 Lineamientos de Seguridad en Sitios Web
   - 5.2 Lineamientos de Almacenamiento e Información Compartida
   - 5.3 Lineamientos de Resguardo de Información Electrónica
   - 5.4 Normas Complementarias de Protección de Datos Personales
   - 5.5 Lineamientos para Sitios Web Institucionales
6. [Resumen Estadístico de Cumplimiento](#6-resumen-estadístico-de-cumplimiento)
7. [Hallazgos Críticos](#7-hallazgos-críticos)
8. [Plan de Remediación](#8-plan-de-remediación)
9. [Conclusiones](#9-conclusiones)
10. [Anexos](#10-anexos)

---

## 1. RESUMEN EJECUTIVO

### 1.1 Propósito

El presente documento tiene como objetivo evaluar el grado de cumplimiento del Sistema Vitalia v2.0 con respecto a los lineamientos de seguridad de la información establecidos por la Universidad Nacional Autónoma de México (UNAM), con el fin de identificar brechas de seguridad y establecer un plan de remediación previo a la puesta en producción del sistema.

### 1.2 Resultado General

| Indicador | Valor |
|-----------|-------|
| **Porcentaje de Cumplimiento Global** | **26%** |
| **Controles que Cumplen** | 70 |
| **Controles Parciales** | 53 |
| **Controles que No Cumplen** | 150 |
| **Total de Controles Evaluados** | 273 |

### 1.3 Calificación de Riesgo

| Nivel de Riesgo | Clasificación |
|-----------------|---------------|
| **ALTO** | El sistema presenta deficiencias significativas que impiden su puesta en producción |

### 1.4 Recomendación Principal

**El Sistema Vitalia v2.0 NO debe ponerse en producción** hasta que se implementen, como mínimo, las correcciones de Prioridad 1 identificadas en este reporte, especialmente:

- Implementación de HTTPS/TLS para cifrado de comunicaciones
- Encriptación de datos médicos sensibles en base de datos
- Elaboración del Documento de Seguridad obligatorio
- Implementación del Aviso de Privacidad

---

## 2. ALCANCE DE LA EVALUACIÓN

### 2.1 Componentes Evaluados

| Componente | Tecnología | Versión |
|------------|------------|---------|
| Backend API | PHP | 8.1+ |
| Base de Datos | MySQL | 8.0+ |
| Frontend | React | 18+ |
| Servidor Web | Apache | 2.4+ |

### 2.2 Aspectos Evaluados

- Seguridad del sistema operativo del servidor
- Seguridad del servidor web
- Administración y configuración del servidor
- Protección de datos personales y sensibles
- Mecanismos de autenticación y autorización
- Políticas de respaldo y recuperación
- Cumplimiento de imagen institucional
- Accesibilidad y usabilidad

### 2.3 Aspectos Fuera del Alcance

- Evaluación de infraestructura física
- Pruebas de penetración (pentesting)
- Auditoría de código línea por línea
- Evaluación de proveedores externos

---

## 3. DOCUMENTOS NORMATIVOS EVALUADOS

| # | Documento | Emisor | Fecha | Carácter |
|---|-----------|--------|-------|----------|
| 1 | Lineamientos de Seguridad de la Información en Sitios Web de la UNAM | DGTIC | Dic 2022 | **Obligatorio** |
| 2 | Lineamientos generales y políticas sobre almacenamiento e información compartida entre los sistemas existentes | Red TIC | Jun 2023 | **Obligatorio** |
| 3 | Lineamientos y recomendaciones para el resguardo de información electrónica | DGTIC | Jun 2023 | Recomendado |
| 4 | Normas Complementarias sobre Medidas de Seguridad Técnicas, Administrativas y Físicas para la Protección de Datos Personales | Comité de Transparencia | Ene 2020 | **Obligatorio** |
| 5 | Lineamientos para Sitios Web institucionales de la UNAM | CATIC | Oct 2016 | **Obligatorio** |

---

## 4. DESCRIPCIÓN DEL SISTEMA

### 4.1 Información General

**Sistema Vitalia v2.0** es una aplicación web integral de rehabilitación diseñada para pacientes con amputación de miembro inferior, desarrollada para la Unidad de Investigación en Órtesis y Prótesis (UIOyP) de la UNAM.

### 4.2 Usuarios Objetivo

- **Población principal**: Adultos mayores (60-80 años)
- **Roles del sistema**: Administrador, Especialista, Paciente

### 4.3 Módulos Funcionales (14 módulos)

| # | Módulo | Descripción |
|---|--------|-------------|
| 1 | Autenticación | Login simplificado con PIN de 6 dígitos |
| 2 | Perfil | Gestión de información personal |
| 3 | Fases de Tratamiento | 4 fases: pre-op, post-op, pre-protésica, protésica |
| 4 | Nutrición | Recetas, historial de comidas, checklists |
| 5 | Medicina | Bitácoras de glucosa, presión, dolor |
| 6 | Fisioterapia | Videos de ejercicios, guías de cuidado |
| 7 | Neuropsicología | Estado de ánimo, cuestionarios de bienestar |
| 8 | Órtesis y Prótesis | Gestión de dispositivos, ajustes, problemas |
| 9 | Citas | Integración con Google Calendar |
| 10 | Chat | Comunicación temporal con especialistas (24h) |
| 11 | Recordatorios | Notificaciones personalizadas |
| 12 | FAQs | Preguntas frecuentes por área |
| 13 | Blog | Artículos educativos de salud |
| 14 | Comunidad | Espacio de interacción entre pacientes |

### 4.4 Datos Personales y Sensibles Tratados

#### Nivel Crítico (Datos de Salud)
- Antecedentes médicos y causa de amputación
- Bitácoras clínicas (glucosa, presión arterial, dolor)
- Historial de medicamentos
- Estado emocional y bienestar psicológico
- Información de dispositivos protésicos

#### Nivel Alto (Datos Personales)
- Nombre completo
- Fecha de nacimiento
- Correo electrónico
- Número telefónico
- Historial de citas médicas

### 4.5 Arquitectura Técnica

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React 18+)                    │
│                    Puerto: 3000 (desarrollo)                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP (⚠️ Sin HTTPS)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND (PHP 8.1+)                      │
│                    Puerto: 8000 (desarrollo)                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Controllers │  │  Services   │  │     Middleware      │  │
│  │    (14)     │  │    (11)     │  │ Auth, CORS, Role    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ PDO (Queries parametrizados)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS (MySQL 8.0+)                │
│                    56 tablas - 1,668 líneas SQL              │
│                    ⚠️ Datos sin encriptar                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. RESULTADOS DE LA EVALUACIÓN

### 5.1 Lineamientos de Seguridad en Sitios Web (Dic 2022)

**Cumplimiento: 21%**

#### 5.1.1 Capítulo II - Seguridad en el Sistema Operativo del Servidor

| # | Lineamiento | Estado | Observaciones |
|---|-------------|--------|---------------|
| I | SO actualizado para corregir vulnerabilidades | ⚠️ Parcial | Sin política de actualizaciones documentada |
| II | Servidor en redes protegidas con medidas perimetrales | ❌ No cumple | Sin configuración de firewall documentada |
| III | Eliminar servicios y aplicaciones no utilizados | ⚠️ Parcial | No verificable sin acceso al servidor |
| IV | Instalación mínima del SO | ⚠️ Parcial | No documentado |
| V | Eliminar grupos/cuentas predeterminadas no requeridas | ⚠️ Parcial | No documentado |
| VI | Cambiar nombres y contraseñas predeterminadas | ❌ No cumple | **BD usa root/12345** |
| VII | Política de contraseñas seguras | ⚠️ Parcial | PIN valida patrones, sin política completa |
| VIII | Tecnologías de encriptación (SSL/TLS, SSH, VPN) | ❌ No cumple | **Sin HTTPS configurado** |
| IX | Privilegios mínimos para archivos y directorios | ⚠️ Parcial | Implementado en código, no en servidor |
| X | Control de acceso lectura/escritura/ejecución | ✅ Cumple | RBAC implementado con 3 roles |
| XI | Antimalware, antivirus, detectores de rootkit | ❌ No cumple | No documentado |
| XII | Firewalls configurados | ❌ No cumple | No documentado |
| XIII | Software de integridad de archivos críticos | ❌ No cumple | No implementado |
| XIV | Software de monitoreo de recursos | ❌ No cumple | No implementado |

#### 5.1.2 Capítulo III - Seguridad en el Servidor Web

| # | Lineamiento | Estado | Observaciones |
|---|-------------|--------|---------------|
| I | Parches y actualizaciones instalados | ⚠️ Parcial | Sin política documentada |
| II | Partición dedicada para contenido web | ⚠️ Parcial | No documentado |
| III | Separar contenido web de aplicación | ✅ Cumple | /backend/public es el DocumentRoot |
| IV | Eliminar servicios no requeridos del servidor web | ⚠️ Parcial | No verificable |
| V | Eliminar cuentas predeterminadas | ⚠️ Parcial | No verificable |
| VI | Eliminar documentación del fabricante | ⚠️ Parcial | No verificable |
| VII | Eliminar archivos de ejemplo/prueba | ❌ No cumple | **20 archivos test_*.php en /public** |
| VIII | Reconfigurar banner HTTP | ❌ No cumple | No configurado |
| IX | Nombres/ubicaciones no estándar | ✅ Cumple | Estructura personalizada |
| X | Controlar acceso a archivos de configuración | ⚠️ Parcial | .env existe sin protección extra |
| XI | Procesos con privilegios limitados | ⚠️ Parcial | No verificable en servidor |
| XII | Control de carga de archivos | ✅ Cumple | FileUploadService.php implementado |
| XIII | Límite de espacio para cargas | ✅ Cumple | MAX_FILE_SIZE: 5MB |
| XIV | Partición específica para uploads | ✅ Cumple | /public/uploads/ separado |
| XV | Limitar tamaño de archivos | ✅ Cumple | 5MB máximo |
| XVI | Revisión de archivos antes de uso | ❌ No cumple | Sin escaneo antimalware |
| XVII | Bitácoras con espacio y rotación | ⚠️ Parcial | Logs existen, sin rotación automática |
| XVIII | Límite de procesos y conexiones | ❌ No cumple | No configurado |
| XIX | Limitar acceso a recursos | ⚠️ Parcial | **CORS muy abierto (*)** |

#### 5.1.3 Capítulo IV - Administración del Servidor Web

| # | Lineamiento | Estado | Observaciones |
|---|-------------|--------|---------------|
| I | Privilegios mínimos, deshabilitar innecesarios | ✅ Cumple | RBAC implementado |
| II | Cambiar usuarios/contraseñas por defecto | ❌ No cumple | **root/12345 en BD** |
| III | Política de contraseñas seguras | ⚠️ Parcial | bcrypt implementado, política no documentada |
| IV | Permisos mínimos para aplicación web | ✅ Cumple | Middleware de autorización |
| V | Límite de entrada de datos | ✅ Cumple | Validator.php implementado |
| VI | Actualizar herramientas libres de vulnerabilidades | ⚠️ Parcial | Sin política de actualizaciones |
| VII | Descargar de sitios oficiales | ⚠️ Parcial | Composer/npm usados |
| VIII | Código fuente simple | ✅ Cumple | Arquitectura MVC limpia |
| IX | Restringir acciones en código fuente | ✅ Cumple | Git con .gitignore |
| X | Restringir interacción de programas | ✅ Cumple | Servicios encapsulados |
| XI | Lista de caracteres permitidos en formularios | ✅ Cumple | Sanitizer.php implementado |
| XII | Confidencialidad y protección de datos personales | ⚠️ Parcial | **Sin encriptación en BD** |
| XIII | Regulaciones de datos personales UNAM | ⚠️ Parcial | **Sin aviso de privacidad visible** |
| XIV-XX | Bitácoras configuradas | ✅ Cumple | 3 logs: app.log, error.log, auth.log |
| XXI | Política de respaldos documentada | ⚠️ Parcial | Script existe, sin política formal |
| XXII | Respaldos en entorno seguro y distinto | ❌ No cumple | **Solo local en /storage/backups/** |
| XXIII | Procedimientos de respaldo documentados | ❌ No cumple | Sin documentación de restauración |

---

### 5.2 Lineamientos de Almacenamiento e Información Compartida (Jun 2023)

**Cumplimiento: 27%**

#### 5.2.1 Capítulo I - Disposiciones Generales

| Sección | Lineamiento | Estado | Observaciones |
|---------|-------------|--------|---------------|
| 1.1 | Atributos de calidad de información | ⚠️ Parcial | Implementación técnica parcial |
| 1.2 | Disponibilidad con medidas de seguridad | ⚠️ Parcial | Sin alta disponibilidad |
| 1.6 | Protección de información transmitida | ❌ No cumple | **Sin HTTPS** |
| 2.4 | Cartas de confidencialidad del personal | ❌ No cumple | No implementado |
| 2.5 | SGSDP implementado | ❌ No cumple | **Sin Sistema de Gestión formal** |
| 2.6 | Notificación de vulneraciones | ❌ No cumple | **Sin procedimiento documentado** |
| 6.2 | Encriptación en BD para datos sensibles | ❌ No cumple | **Datos en texto plano** |
| 6.3 | HTTPS/TLS en conexiones | ❌ No cumple | **Solo HTTP** |
| 6.5 | Pruebas de vulnerabilidad cada 6 meses | ❌ No cumple | Sin plan de pruebas |
| 6.7 | Avisos de Privacidad en sistemas | ❌ No cumple | **Sin aviso de privacidad** |
| 9.2 | Planes de continuidad y recuperación | ❌ No cumple | **Sin DRP documentado** |
| 9.5 | Revisión anual de riesgos | ❌ No cumple | Sin análisis de riesgos |
| 9.6 | VPN para datos sensibles | ❌ No cumple | Sin VPN configurada |
| 9.7 | Hash de 512 bits para integridad | ❌ No cumple | Usa HMAC-SHA256 (256 bits) |

#### 5.2.2 Capítulo II - Políticas de Compartición

| Requisito | Estado | Observaciones |
|-----------|--------|---------------|
| Solicitud formal para intercambio | ❌ No cumple | Sin procedimiento |
| Cartas de confidencialidad | ❌ No cumple | No implementado |
| Mecanismos de compartición (APIs) | ✅ Cumple | REST API |
| Transmisión cifrada (SSL/TLS) | ❌ No cumple | **Sin HTTPS** |

#### 5.2.3 Capítulo III - Políticas de Almacenamiento

| Requisito | Estado | Observaciones |
|-----------|--------|---------------|
| Respaldos en UNAM/territorio nacional | ✅ Cumple | Local |
| Regla 3-2-1 | ❌ No cumple | **Solo 1 copia local** |
| Cifrado de respaldos | ❌ No cumple | **Sin cifrado** |
| Eliminación segura | ❌ No cumple | Sin procedimiento |

---

### 5.3 Lineamientos de Resguardo de Información Electrónica (Jun 2023)

**Cumplimiento: 13%**

#### 5.3.1 Información de la Universidad

| Requisito | Estado | Observaciones |
|-----------|--------|---------------|
| Procedimientos de respaldo formales | ❌ No cumple | Script existe pero sin política formal |
| RPO definido por base de datos | ❌ No cumple | **Sin RPO documentado** |
| RTO definido por base de datos | ❌ No cumple | **Sin RTO documentado** |
| Registro de control de respaldos | ❌ No cumple | Sin registro formal |
| Clasificación de información | ⚠️ Parcial | Implícita en código, no documentada |
| Procedimientos de recuperación | ❌ No cumple | Sin documentación |
| Procedimientos de eliminación | ❌ No cumple | Sin procedimiento |

#### 5.3.2 Plan de Continuidad

| Requisito | Estado | Observaciones |
|-----------|--------|---------------|
| Plan de continuidad documentado | ❌ No cumple | **No existe** |
| DRP (Disaster Recovery Plan) | ❌ No cumple | **No existe** |
| Identificación de recursos críticos | ❌ No cumple | No documentado |
| Pruebas regulares del plan | ❌ No cumple | Sin pruebas |
| Capacitación del personal | ❌ No cumple | Sin programa |

#### 5.3.3 Respaldos y Recuperación

| Requisito | Estado | Observaciones |
|-----------|--------|---------------|
| Frecuencia definida | ✅ Cumple | Diario a las 3 AM |
| Retención definida | ❌ No cumple | Sin política de retención |
| Tipo de respaldo | ⚠️ Parcial | Solo completo, sin incremental |
| Regla 3-2-1 | ❌ No cumple | **Solo 1 copia local** |
| Compresión de respaldos | ❌ No cumple | Sin compresión |
| Cifrado de respaldos | ❌ No cumple | **Sin cifrado** |
| Pruebas de restauración | ❌ No cumple | **Sin pruebas** |

---

### 5.4 Normas Complementarias de Protección de Datos Personales (Ene 2020)

**Cumplimiento: 24%**

#### 5.4.1 Capítulo I - Disposiciones Generales

| Artículo | Requisito | Estado | Observaciones |
|----------|-----------|--------|---------------|
| Art. 5 | Documento de seguridad elaborado | ❌ No cumple | **NO EXISTE** |
| Art. 5 | Roles y cadena de cuentas documentados | ❌ No cumple | No documentado |
| Art. 6 | Inventario de datos personales | ❌ No cumple | **NO EXISTE** |
| Art. 6.III | Catálogo de tipos de datos (sensibles o no) | ❌ No cumple | **No clasificado formalmente** |
| Art. 7 | Ciclo de vida de datos documentado | ❌ No cumple | No existe |
| Art. 8 | Análisis de riesgos realizado | ❌ No cumple | **NO EXISTE** |
| Art. 9 | EIDP para tratamiento intensivo | ❌ No cumple | **NO EXISTE** |
| Art. 11 | Análisis de brecha de seguridad | ❌ No cumple | No existe |
| Art. 14 | SGSDP implementado | ❌ No cumple | **NO EXISTE** |

#### 5.4.2 Capítulo II - Medidas de Seguridad Técnicas

| Artículo | Requisito | Estado | Observaciones |
|----------|-----------|--------|---------------|
| Art. 15 | Control de acceso (identificar, autenticar, autorizar) | ✅ Cumple | Implementado correctamente |
| Art. 16 | Administración de cuentas y bitácoras | ✅ Cumple | log_accesos, logs de app |
| Art. 18.I.g | Certificados SSL vigentes | ❌ No cumple | **Sin HTTPS** |
| Art. 18.II.a | Sincronización NTP UNAM | ❌ No cumple | Sin configuración |
| Art. 18.II.b | Antimalware actualizado | ❌ No cumple | No configurado |
| Art. 19.I.c | Respaldos con control y protección | ❌ No cumple | **Sin cifrado ni control** |
| Art. 19.IV.a | Transmisión por canal cifrado | ❌ No cumple | **Sin HTTPS** |
| Art. 19.IV.b | Controles de seguridad en red | ❌ No cumple | **CORS abierto (*)** |
| Art. 20 | Borrado seguro implementado | ❌ No cumple | Sin procedimiento |
| Art. 21 | Nube pública solo para respaldos cifrados | ✅ Cumple | No usa nube pública |

#### 5.4.3 Capítulo III - Medidas de Seguridad Administrativas

| Artículo | Requisito | Estado | Observaciones |
|----------|-----------|--------|---------------|
| Art. 22 | Notificación de vulneraciones en 72 hrs | ❌ No cumple | **Sin procedimiento** |
| Art. 25 | Formato ARCO implementado | ❌ No cumple | **Sin funcionalidad ARCO** |
| Art. 26 | Programas de capacitación | ❌ No cumple | No existe |
| Art. 27 | Confidencialidad como obligación | ❌ No cumple | Sin cartas de confidencialidad |

---

### 5.5 Lineamientos para Sitios Web Institucionales (Oct 2016)

**Cumplimiento: 37%**

#### 5.5.1 Facilidad de Uso y Navegación

| Requisito | Estado | Observaciones |
|-----------|--------|---------------|
| Ubicación del usuario visible (breadcrumb) | ❌ No cumple | No implementado |
| Enlace a página principal identificado | ✅ Cumple | Logo en header |
| Mapa del sitio HTML | ❌ No cumple | No existe |
| Buscador implementado | ❌ No cumple | No implementado |
| Máximo 4 niveles de navegación | ✅ Cumple | Estructura plana |

#### 5.5.2 Accesibilidad (WAI/W3C)

| Requisito | Estado | Observaciones |
|-----------|--------|---------------|
| Atributos alt en imágenes | ⚠️ Parcial | Por verificar |
| Subtítulos en videos | ❌ No cumple | Videos sin subtítulos |
| Transcripciones de audio | ❌ No cumple | No existe |
| Tipografía accesible | ✅ Cumple | Diseño para adultos mayores |

#### 5.5.3 Imagen Institucional UNAM

| Requisito | Estado | Observaciones |
|-----------|--------|---------------|
| Encabezado con escudo UNAM | ❌ No cumple | **Sin imagen institucional** |
| Nombre completo de la Universidad | ❌ No cumple | No presente |
| Pie de página con leyenda legal | ❌ No cumple | **Sin pie institucional** |
| Copyright | ❌ No cumple | No presente |
| "Sitio administrado por..." | ❌ No cumple | No presente |
| Dominio unam.mx | ⚠️ Parcial | Configurado para localhost |

#### 5.5.4 Elementos Obligatorios (30 elementos)

| Categoría | Cumple | No Cumple |
|-----------|--------|-----------|
| Identidad | 1/3 | 2/3 |
| Visibilidad | 5/13 | 8/13 |
| Usabilidad | 6/14 | 8/14 |
| **Total** | **12/30** | **18/30** |

---

## 6. RESUMEN ESTADÍSTICO DE CUMPLIMIENTO

### 6.1 Por Documento Normativo

| # | Documento | ✅ Cumple | ⚠️ Parcial | ❌ No Cumple | % |
|---|-----------|-----------|------------|--------------|---|
| 1 | Seguridad Sitios Web (Dic 2022) | 12 | 18 | 26 | **21%** |
| 2 | Almacenamiento e Info Compartida (Jun 2023) | 14 | 10 | 28 | **27%** |
| 3 | Resguardo Info Electrónica (Jun 2023) | 4 | 3 | 23 | **13%** |
| 4 | Normas Datos Personales (Ene 2020) | 18 | 12 | 45 | **24%** |
| 5 | Sitios Web Institucionales (Oct 2016) | 22 | 10 | 28 | **37%** |
| | **TOTAL** | **70** | **53** | **150** | **26%** |

### 6.2 Por Categoría de Control

| Categoría | Cumplimiento |
|-----------|--------------|
| Autenticación y Control de Acceso | 75% |
| Validación de Entrada | 80% |
| Arquitectura de Código | 85% |
| Cifrado de Comunicaciones | 0% |
| Cifrado de Datos en Reposo | 0% |
| Gestión de Respaldos | 15% |
| Documentación de Seguridad | 5% |
| Imagen Institucional | 10% |
| Cumplimiento ARCO | 0% |

### 6.3 Gráfico de Cumplimiento

```
Cumplimiento por Documento Normativo
=====================================

Seguridad Sitios Web    ████░░░░░░░░░░░░░░░░ 21%
Almacenamiento          █████░░░░░░░░░░░░░░░ 27%
Resguardo Info          ███░░░░░░░░░░░░░░░░░ 13%
Normas Datos Personales █████░░░░░░░░░░░░░░░ 24%
Sitios Web Institucional███████░░░░░░░░░░░░░ 37%
────────────────────────────────────────────
PROMEDIO GENERAL        █████░░░░░░░░░░░░░░░ 26%

Leyenda: █ = 5%
```

---

## 7. HALLAZGOS CRÍTICOS

### 7.1 Hallazgos de Seguridad Técnica

| # | Hallazgo | Severidad | Riesgo | Ubicación |
|---|----------|-----------|--------|-----------|
| H-01 | **Sin HTTPS/TLS configurado** | CRÍTICA | Datos médicos transmitidos en texto plano, susceptibles a intercepción | Todo el sistema |
| H-02 | **Credenciales de BD débiles** | CRÍTICA | root/12345 permite acceso no autorizado a toda la información | backend/.env |
| H-03 | **CORS completamente abierto** | CRÍTICA | Access-Control-Allow-Origin: * permite requests maliciosos desde cualquier origen | CorsMiddleware.php |
| H-04 | **20 archivos de prueba en producción** | ALTA | test_*.php exponen información del sistema y posibles vulnerabilidades | backend/public/ |
| H-05 | **Datos médicos sin encriptar** | CRÍTICA | Bitácoras de glucosa, presión, dolor en texto plano violan confidencialidad | Tablas de bitácoras |
| H-06 | **JWT_SECRET débil** | ALTA | "vitalia_secret_key_2024_desarrollo" permite forjar tokens | backend/.env |
| H-07 | **Sin rate limiting global** | MEDIA | Sistema vulnerable a ataques de fuerza bruta y DoS | RateLimitMiddleware.php |

### 7.2 Hallazgos de Cumplimiento Normativo

| # | Hallazgo | Severidad | Norma Incumplida |
|---|----------|-----------|------------------|
| H-08 | **No existe Documento de Seguridad** | CRÍTICA | Art. 5 Normas Complementarias - OBLIGATORIO |
| H-09 | **No existe Inventario de Datos Personales** | CRÍTICA | Art. 6 Normas Complementarias - OBLIGATORIO |
| H-10 | **No existe Análisis de Riesgos** | ALTA | Art. 8 Normas Complementarias |
| H-11 | **No existe EIDP** | ALTA | Art. 9 Normas Complementarias |
| H-12 | **No existe SGSDP** | ALTA | Art. 14 Normas Complementarias |
| H-13 | **Sin Aviso de Privacidad** | CRÍTICA | Art. 6.7 Lineamientos Almacenamiento - OBLIGATORIO |
| H-14 | **Sin funcionalidad ARCO** | ALTA | Art. 25 Normas Complementarias |
| H-15 | **Sin procedimiento de notificación de vulneraciones** | ALTA | Art. 22 Normas Complementarias (72 hrs) |

### 7.3 Hallazgos de Respaldos y Continuidad

| # | Hallazgo | Severidad | Riesgo |
|---|----------|-----------|--------|
| H-16 | **Solo 1 copia local de respaldo** | CRÍTICA | Pérdida total de información ante desastre |
| H-17 | **Respaldos sin cifrado** | ALTA | Exposición de datos si se compromete el medio |
| H-18 | **Sin pruebas de restauración** | ALTA | Respaldos pueden ser inútiles |
| H-19 | **Sin RPO/RTO definidos** | MEDIA | Sin objetivos claros de recuperación |
| H-20 | **Sin Plan de Recuperación de Desastres** | ALTA | Sin procedimiento ante contingencias |

### 7.4 Hallazgos de Imagen Institucional

| # | Hallazgo | Severidad | Observación |
|---|----------|-----------|-------------|
| H-21 | **Sin encabezado institucional UNAM** | MEDIA | Falta escudo y nombre de la Universidad |
| H-22 | **Sin pie de página institucional** | MEDIA | Falta copyright y leyenda legal |
| H-23 | **Sin versión en inglés** | BAJA | Requerido para páginas con público extranjero |

---

## 8. PLAN DE REMEDIACIÓN

### 8.1 Prioridad 1 - Crítico (Implementar antes de producción)

| # | Acción | Responsable | Esfuerzo | Plazo Sugerido |
|---|--------|-------------|----------|----------------|
| R-01 | Implementar HTTPS con certificado SSL/TLS | Infraestructura | Medio | 1 semana |
| R-02 | Cambiar credenciales de BD por seguras | Desarrollo | Bajo | 1 día |
| R-03 | Restringir CORS a dominios autorizados | Desarrollo | Bajo | 1 día |
| R-04 | Eliminar archivos test_*.php de /public | Desarrollo | Bajo | 1 día |
| R-05 | Encriptar datos sensibles en BD (AES-256) | Desarrollo | Alto | 2 semanas |
| R-06 | Generar JWT_SECRET aleatorio fuerte | Desarrollo | Bajo | 1 día |
| R-07 | Crear Documento de Seguridad | Seguridad TIC | Medio | 1 semana |
| R-08 | Crear Inventario de Datos Personales | Seguridad TIC | Medio | 1 semana |
| R-09 | Implementar Aviso de Privacidad | Legal/Desarrollo | Bajo | 3 días |

### 8.2 Prioridad 2 - Alta (Implementar en fase inicial)

| # | Acción | Responsable | Esfuerzo | Plazo Sugerido |
|---|--------|-------------|----------|----------------|
| R-10 | Realizar Análisis de Riesgos formal | Seguridad TIC | Alto | 2 semanas |
| R-11 | Crear EIDP (Evaluación de Impacto) | Seguridad TIC | Alto | 2 semanas |
| R-12 | Implementar regla 3-2-1 de respaldos | Infraestructura | Medio | 1 semana |
| R-13 | Cifrar respaldos con AES-128+ | Desarrollo | Bajo | 3 días |
| R-14 | Documentar procedimiento de vulneraciones | Seguridad TIC | Medio | 1 semana |
| R-15 | Implementar funcionalidad ARCO | Desarrollo | Alto | 2 semanas |
| R-16 | Agregar imagen institucional UNAM | Diseño | Bajo | 3 días |
| R-17 | Crear pie de página con copyright | Desarrollo | Bajo | 1 día |
| R-18 | Implementar rate limiting completo | Desarrollo | Medio | 1 semana |

### 8.3 Prioridad 3 - Media (Implementar para cumplimiento completo)

| # | Acción | Responsable | Esfuerzo |
|---|--------|-------------|----------|
| R-19 | Implementar SGSDP completo | Seguridad TIC | Alto |
| R-20 | Crear programa de capacitación | RRHH/TIC | Medio |
| R-21 | Documentar DRP (Plan de Recuperación) | Seguridad TIC | Alto |
| R-22 | Implementar Google Analytics | Desarrollo | Bajo |
| R-23 | Crear mapa del sitio y sitemap.xml | Desarrollo | Bajo |
| R-24 | Agregar versión en inglés | Desarrollo | Alto |
| R-25 | Implementar breadcrumbs | Desarrollo | Bajo |
| R-26 | Agregar subtítulos a videos | Contenido | Alto |
| R-27 | Configurar sincronización NTP UNAM | Infraestructura | Bajo |
| R-28 | Implementar cartas de confidencialidad | RRHH | Medio |

### 8.4 Cronograma Sugerido

```
Semana 1-2: Prioridad 1 (Crítico)
├── S1: HTTPS, credenciales, CORS, test files, JWT
└── S2: Encriptación BD, Documento Seguridad, Inventario, Aviso Privacidad

Semana 3-4: Prioridad 2 (Alta)
├── S3: Análisis Riesgos, EIDP, Respaldos 3-2-1
└── S4: Funcionalidad ARCO, Imagen institucional, Rate limiting

Semana 5-8: Prioridad 3 (Media)
├── S5-6: SGSDP, DRP, Capacitación
└── S7-8: Analytics, Sitemap, Inglés, Accesibilidad
```

---

## 9. CONCLUSIONES

### 9.1 Estado Actual

El Sistema Vitalia v2.0 presenta una **arquitectura técnica sólida** con buenas prácticas de desarrollo implementadas:

**Fortalezas identificadas:**
- Arquitectura MVC limpia y modular
- Control de acceso RBAC funcional
- Validación y sanitización de entrada
- Queries parametrizados contra SQL Injection
- Hashing seguro de contraseñas (bcrypt)
- Sistema de logs de auditoría

Sin embargo, el sistema tiene **deficiencias significativas en cumplimiento normativo** que impiden su puesta en producción:

**Debilidades críticas:**
- Ausencia de cifrado en comunicaciones (HTTPS)
- Datos médicos sensibles sin encriptar
- Documentación de seguridad inexistente
- Respaldos insuficientes y sin protección
- Imagen institucional UNAM ausente

### 9.2 Calificación Final

| Aspecto | Calificación |
|---------|--------------|
| Arquitectura de Código | ✅ Aprobado |
| Seguridad en Desarrollo | ⚠️ Parcial |
| Seguridad en Infraestructura | ❌ No Aprobado |
| Cumplimiento Normativo | ❌ No Aprobado |
| Protección de Datos | ❌ No Aprobado |
| **EVALUACIÓN GLOBAL** | **❌ NO APROBADO** |

### 9.3 Recomendación Final

**El Sistema Vitalia v2.0 NO está listo para producción.**

Se requiere implementar, como mínimo, las 9 acciones de Prioridad 1 antes de considerar el despliegue del sistema. Dado que el sistema maneja **datos médicos sensibles de pacientes**, el incumplimiento de estas medidas representa un riesgo legal y ético significativo.

Se recomienda:

1. **Detener cualquier plan de producción** hasta completar Prioridad 1
2. **Asignar recursos dedicados** para remediación de seguridad
3. **Realizar una nueva evaluación** tras implementar las correcciones
4. **Considerar auditoría externa** antes del lanzamiento

---

## 10. ANEXOS

### Anexo A - Archivos Críticos Identificados

```
backend/.env                    # Credenciales sensibles
backend/config/database.php     # Configuración BD
backend/config/app.php          # JWT_SECRET
backend/storage/backups/        # Respaldos de BD
backend/storage/logs/           # Logs de auditoría
database/vitalia_db.sql         # Esquema completo
```

### Anexo B - Archivos de Prueba a Eliminar

```
backend/public/test_*.php       # 20 archivos de prueba
```

### Anexo C - Datos Sensibles en Base de Datos

| Tabla | Tipo de Dato | Clasificación |
|-------|--------------|---------------|
| usuarios | email, password_hash, pin_hash | Alto |
| pacientes | antecedentes_medicos, alergias | Crítico |
| bitacora_glucosa | valores de glucosa | Crítico |
| bitacora_presion | presión arterial | Crítico |
| bitacora_dolor | intensidad, ubicación | Crítico |
| registro_animo | estado emocional | Crítico |
| mensajes_chat | comunicaciones médicas | Alto |
| citas | información de consultas | Alto |

### Anexo D - Referencias Normativas

1. Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados
2. Lineamientos para la Protección de Datos Personales en Posesión de la UNAM
3. Normas Complementarias sobre Medidas de Seguridad (Comité de Transparencia, 2020)
4. Lineamientos de Seguridad de la Información en Sitios Web (DGTIC, 2022)
5. Lineamientos para Sitios Web institucionales (CATIC, 2016)

---

**Fin del Reporte**

---

| Campo | Valor |
|-------|-------|
| Elaborado por | Área de Desarrollo TIC |
| Fecha de elaboración | 22 de enero de 2026 |
| Versión | 1.0 |
| Clasificación | Uso Interno |
| Próxima revisión | Tras implementación de Prioridad 1 |
