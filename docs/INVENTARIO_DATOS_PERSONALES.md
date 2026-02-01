# INVENTARIO DE DATOS PERSONALES

## Sistema Vitalia v2.0 - Plataforma de Rehabilitación para Pacientes Amputados

**Versión:** 1.0
**Fecha de elaboración:** Enero 2026
**Base de datos:** vitalia_db (MySQL 8.0)
**Responsable del inventario:** [COMPLETAR]

---

## ÍNDICE

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Categorización de Datos](#2-categorización-de-datos)
3. [Inventario por Tabla](#3-inventario-por-tabla)
4. [Flujos de Datos](#4-flujos-de-datos)
5. [Transferencias](#5-transferencias)
6. [Conservación y Eliminación](#6-conservación-y-eliminación)

---

## 1. RESUMEN EJECUTIVO

### 1.1 Estadísticas Generales

| Métrica | Valor |
|---------|-------|
| Total de tablas en BD | 56 |
| Tablas con datos personales | 12 |
| Tablas con datos sensibles | 7 |
| Campos de datos personales | 45+ |
| Titulares potenciales | Pacientes, cuidadores, administradores |

### 1.2 Tipos de Datos Tratados

| Tipo de Dato | Presente | Tablas |
|--------------|----------|--------|
| Datos de identificación | ✅ | usuarios, pacientes |
| Datos de contacto | ✅ | usuarios, contactos_emergencia |
| Datos de salud | ✅ | bitácoras, historial_clinico |
| Datos biométricos | ✅ | usuarios (foto) |
| Datos financieros | ❌ | N/A |
| Datos de menores | ❌ | N/A (población 60-80 años) |

---

## 2. CATEGORIZACIÓN DE DATOS

### 2.1 Clasificación por Sensibilidad

```
┌─────────────────────────────────────────────────────────────┐
│  CRÍTICO (Requiere máxima protección)                       │
│  - Contraseñas (hash bcrypt)                                │
│  - Tokens de sesión                                         │
│  - Claves de encriptación                                   │
├─────────────────────────────────────────────────────────────┤
│  SENSIBLE (Datos de salud - Protección especial)            │
│  - Diagnósticos médicos                                     │
│  - Bitácoras de glucosa, presión, dolor                     │
│  - Antecedentes médicos                                     │
│  - Medicamentos                                             │
│  - Tipo de amputación                                       │
├─────────────────────────────────────────────────────────────┤
│  ALTO (Datos identificativos)                               │
│  - Nombre completo                                          │
│  - CURP, RFC                                                │
│  - Fecha de nacimiento                                      │
│  - Fotografía de perfil                                     │
├─────────────────────────────────────────────────────────────┤
│  MEDIO (Datos de contacto)                                  │
│  - Correo electrónico                                       │
│  - Teléfono                                                 │
│  - Dirección                                                │
├─────────────────────────────────────────────────────────────┤
│  BAJO (Datos operativos)                                    │
│  - Preferencias de interfaz                                 │
│  - Configuraciones                                          │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Base Legal del Tratamiento

| Finalidad | Base Legal | Artículo |
|-----------|------------|----------|
| Gestión de rehabilitación | Consentimiento expreso | Art. 22 LGPDPPSO |
| Citas médicas | Relación de servicio | Art. 22 LGPDPPSO |
| Bitácoras de salud | Consentimiento expreso | Art. 22 LGPDPPSO |
| Comunicaciones | Consentimiento | Art. 22 LGPDPPSO |
| Estadísticas anónimas | Interés legítimo | Art. 22 LGPDPPSO |

---

## 3. INVENTARIO POR TABLA

### 3.1 TABLA: `usuarios`

**Descripción:** Almacena información de todos los usuarios del sistema
**Finalidad:** Autenticación y gestión de acceso
**Titulares:** Pacientes, cuidadores, administradores

| Campo | Tipo SQL | Dato Personal | Categoría | Encriptado | Obligatorio |
|-------|----------|---------------|-----------|------------|-------------|
| id | INT | No | - | No | Sí |
| nombre | VARCHAR(100) | Sí | Identificación | No | Sí |
| apellido_paterno | VARCHAR(100) | Sí | Identificación | No | Sí |
| apellido_materno | VARCHAR(100) | Sí | Identificación | No | No |
| email | VARCHAR(255) | Sí | Contacto | No | Sí |
| password | VARCHAR(255) | Sí | Credenciales | Hash bcrypt | Sí |
| telefono | VARCHAR(20) | Sí | Contacto | No | No |
| foto_perfil | VARCHAR(500) | Sí | Biométrico | No | No |
| fecha_nacimiento | DATE | Sí | Identificación | No | No |
| genero | ENUM | Sí | Identificación | No | No |
| rol | ENUM | No | - | No | Sí |
| activo | BOOLEAN | No | - | No | Sí |
| created_at | TIMESTAMP | No | - | No | Sí |
| updated_at | TIMESTAMP | No | - | No | Sí |

**Medidas de protección:**
- Contraseñas hasheadas con bcrypt (cost 12)
- Acceso restringido por rol
- Logs de auditoría en cambios

---

### 3.2 TABLA: `pacientes`

**Descripción:** Información extendida de pacientes
**Finalidad:** Gestión clínica de rehabilitación
**Titulares:** Pacientes del programa

| Campo | Tipo SQL | Dato Personal | Categoría | Encriptado | Obligatorio |
|-------|----------|---------------|-----------|------------|-------------|
| id | INT | No | - | No | Sí |
| usuario_id | INT | No | - | No | Sí |
| tipo_amputacion | VARCHAR(100) | Sí | **Sensible** | **Sí (AES-256)** | Sí |
| fecha_amputacion | DATE | Sí | **Sensible** | No | No |
| causa_amputacion | TEXT | Sí | **Sensible** | **Sí (AES-256)** | No |
| diagnostico | TEXT | Sí | **Sensible** | **Sí (AES-256)** | No |
| antecedentes_medicos | TEXT | Sí | **Sensible** | **Sí (AES-256)** | No |
| medicamentos_actuales | TEXT | Sí | **Sensible** | **Sí (AES-256)** | No |
| alergias | TEXT | Sí | **Sensible** | **Sí (AES-256)** | No |
| fase_rehabilitacion | INT | No | - | No | Sí |
| peso | DECIMAL | Sí | Salud | No | No |
| altura | DECIMAL | Sí | Salud | No | No |

**Medidas de protección:**
- Campos sensibles encriptados con AES-256-GCM
- Acceso solo a cuidadores asignados y administradores
- Auditoría completa de accesos

---

### 3.3 TABLA: `bitacora_glucosa`

**Descripción:** Registro de mediciones de glucosa
**Finalidad:** Seguimiento de salud del paciente
**Titulares:** Pacientes

| Campo | Tipo SQL | Dato Personal | Categoría | Encriptado | Obligatorio |
|-------|----------|---------------|-----------|------------|-------------|
| id | INT | No | - | No | Sí |
| paciente_id | INT | No | - | No | Sí |
| valor_glucosa | DECIMAL | Sí | **Sensible** | **Sí (AES-256)** | Sí |
| unidad | VARCHAR(10) | No | - | No | Sí |
| momento_medicion | ENUM | No | - | No | Sí |
| notas | TEXT | Sí | **Sensible** | **Sí (AES-256)** | No |
| fecha_registro | DATETIME | No | - | No | Sí |

---

### 3.4 TABLA: `bitacora_presion`

**Descripción:** Registro de mediciones de presión arterial
**Finalidad:** Seguimiento de salud cardiovascular
**Titulares:** Pacientes

| Campo | Tipo SQL | Dato Personal | Categoría | Encriptado | Obligatorio |
|-------|----------|---------------|-----------|------------|-------------|
| id | INT | No | - | No | Sí |
| paciente_id | INT | No | - | No | Sí |
| sistolica | INT | Sí | **Sensible** | **Sí (AES-256)** | Sí |
| diastolica | INT | Sí | **Sensible** | **Sí (AES-256)** | Sí |
| pulso | INT | Sí | **Sensible** | **Sí (AES-256)** | No |
| notas | TEXT | Sí | **Sensible** | **Sí (AES-256)** | No |
| fecha_registro | DATETIME | No | - | No | Sí |

---

### 3.5 TABLA: `bitacora_dolor`

**Descripción:** Registro de niveles de dolor
**Finalidad:** Seguimiento de recuperación
**Titulares:** Pacientes

| Campo | Tipo SQL | Dato Personal | Categoría | Encriptado | Obligatorio |
|-------|----------|---------------|-----------|------------|-------------|
| id | INT | No | - | No | Sí |
| paciente_id | INT | No | - | No | Sí |
| nivel_dolor | INT | Sí | **Sensible** | **Sí (AES-256)** | Sí |
| ubicacion | VARCHAR(100) | Sí | **Sensible** | **Sí (AES-256)** | Sí |
| tipo_dolor | ENUM | No | - | No | No |
| descripcion | TEXT | Sí | **Sensible** | **Sí (AES-256)** | No |
| fecha_registro | DATETIME | No | - | No | Sí |

---

### 3.6 TABLA: `registro_animo`

**Descripción:** Registro de estado emocional
**Finalidad:** Seguimiento psicológico
**Titulares:** Pacientes

| Campo | Tipo SQL | Dato Personal | Categoría | Encriptado | Obligatorio |
|-------|----------|---------------|-----------|------------|-------------|
| id | INT | No | - | No | Sí |
| paciente_id | INT | No | - | No | Sí |
| estado_animo | VARCHAR(50) | Sí | **Sensible** | **Sí (AES-256)** | Sí |
| nivel | INT | No | - | No | No |
| notas | TEXT | Sí | **Sensible** | **Sí (AES-256)** | No |
| fecha_registro | DATETIME | No | - | No | Sí |

---

### 3.7 TABLA: `contactos_emergencia`

**Descripción:** Contactos de emergencia de pacientes
**Finalidad:** Comunicación en emergencias
**Titulares:** Familiares/contactos de pacientes

| Campo | Tipo SQL | Dato Personal | Categoría | Encriptado | Obligatorio |
|-------|----------|---------------|-----------|------------|-------------|
| id | INT | No | - | No | Sí |
| paciente_id | INT | No | - | No | Sí |
| nombre | VARCHAR(200) | Sí | Identificación | No | Sí |
| relacion | VARCHAR(50) | No | - | No | Sí |
| telefono | VARCHAR(20) | Sí | Contacto | No | Sí |
| email | VARCHAR(255) | Sí | Contacto | No | No |

---

### 3.8 TABLA: `citas_medicas`

**Descripción:** Programación de citas
**Finalidad:** Gestión de agenda médica
**Titulares:** Pacientes

| Campo | Tipo SQL | Dato Personal | Categoría | Encriptado | Obligatorio |
|-------|----------|---------------|-----------|------------|-------------|
| id | INT | No | - | No | Sí |
| paciente_id | INT | No | - | No | Sí |
| titulo | VARCHAR(200) | No | - | No | Sí |
| motivo | TEXT | Sí | **Sensible** | **Sí (AES-256)** | No |
| notas | TEXT | Sí | **Sensible** | **Sí (AES-256)** | No |
| fecha_hora | DATETIME | No | - | No | Sí |
| estado | ENUM | No | - | No | Sí |

---

### 3.9 TABLA: `historial_clinico`

**Descripción:** Historial clínico del paciente
**Finalidad:** Registro médico longitudinal
**Titulares:** Pacientes

| Campo | Tipo SQL | Dato Personal | Categoría | Encriptado | Obligatorio |
|-------|----------|---------------|-----------|------------|-------------|
| id | INT | No | - | No | Sí |
| paciente_id | INT | No | - | No | Sí |
| tipo_registro | VARCHAR(50) | No | - | No | Sí |
| descripcion | TEXT | Sí | **Sensible** | **Sí (AES-256)** | Sí |
| observaciones | TEXT | Sí | **Sensible** | **Sí (AES-256)** | No |
| profesional_id | INT | No | - | No | No |
| fecha_registro | DATETIME | No | - | No | Sí |

---

### 3.10 TABLA: `sesiones`

**Descripción:** Control de sesiones activas
**Finalidad:** Seguridad y autenticación
**Titulares:** Todos los usuarios

| Campo | Tipo SQL | Dato Personal | Categoría | Encriptado | Obligatorio |
|-------|----------|---------------|-----------|------------|-------------|
| id | INT | No | - | No | Sí |
| usuario_id | INT | No | - | No | Sí |
| token | VARCHAR(500) | Sí | Crítico | No | Sí |
| ip_address | VARCHAR(45) | Sí | Técnico | No | No |
| user_agent | TEXT | Sí | Técnico | No | No |
| expires_at | DATETIME | No | - | No | Sí |

---

### 3.11 TABLA: `logs_auditoria`

**Descripción:** Bitácora de auditoría del sistema
**Finalidad:** Trazabilidad y seguridad
**Titulares:** Todos los usuarios

| Campo | Tipo SQL | Dato Personal | Categoría | Encriptado | Obligatorio |
|-------|----------|---------------|-----------|------------|-------------|
| id | INT | No | - | No | Sí |
| usuario_id | INT | No | - | No | No |
| accion | VARCHAR(100) | No | - | No | Sí |
| tabla_afectada | VARCHAR(100) | No | - | No | No |
| registro_id | INT | No | - | No | No |
| datos_anteriores | JSON | Sí | Variable | No | No |
| datos_nuevos | JSON | Sí | Variable | No | No |
| ip_address | VARCHAR(45) | Sí | Técnico | No | No |
| created_at | TIMESTAMP | No | - | No | Sí |

---

### 3.12 TABLA: `comunidad_publicaciones`

**Descripción:** Publicaciones del foro comunitario
**Finalidad:** Apoyo entre pacientes
**Titulares:** Pacientes

| Campo | Tipo SQL | Dato Personal | Categoría | Encriptado | Obligatorio |
|-------|----------|---------------|-----------|------------|-------------|
| id | INT | No | - | No | Sí |
| usuario_id | INT | No | - | No | Sí |
| contenido | TEXT | Sí* | Bajo* | No | Sí |
| es_anonimo | BOOLEAN | No | - | No | Sí |
| created_at | TIMESTAMP | No | - | No | Sí |

*El contenido puede contener datos personales voluntariamente compartidos

---

## 4. FLUJOS DE DATOS

### 4.1 Diagrama de Flujo Principal

```
┌──────────────┐     HTTPS      ┌──────────────┐     SQL      ┌──────────────┐
│   Usuario    │ ─────────────► │   Backend    │ ───────────► │   MySQL DB   │
│  (Browser)   │                │   (PHP API)  │              │  (vitalia_db)│
└──────────────┘                └──────────────┘              └──────────────┘
       │                               │                             │
       │ Datos ingresados:             │ Procesamiento:              │ Almacenamiento:
       │ - Login (email, pass)         │ - Validación                │ - Encriptación AES
       │ - Bitácoras médicas           │ - Autenticación JWT         │ - Índices
       │ - Citas                       │ - Encriptación              │ - Backups
       │ - Perfil                      │ - RBAC                      │
       ▼                               ▼                             ▼
```

### 4.2 Puntos de Entrada de Datos

| Punto | Datos Recolectados | Validación |
|-------|-------------------|------------|
| Registro de usuario | Nombre, email, contraseña | Email único, contraseña fuerte |
| Perfil de paciente | Datos médicos, foto | Tipo de archivo, tamaño |
| Bitácoras | Valores de salud | Rangos válidos |
| Citas | Fechas, motivos | Disponibilidad |
| Comunidad | Publicaciones | Moderación de contenido |

### 4.3 Puntos de Salida de Datos

| Punto | Datos Expuestos | Control |
|-------|-----------------|---------|
| API REST | JSON con datos solicitados | JWT + RBAC |
| Exportación | Reportes en PDF/Excel | Solo administradores |
| Logs | Eventos del sistema | Acceso restringido |

---

## 5. TRANSFERENCIAS

### 5.1 Transferencias Internas

| Origen | Destino | Datos | Finalidad | Base Legal |
|--------|---------|-------|-----------|------------|
| Frontend | Backend | Todos | Funcionamiento | Necesidad técnica |
| Backend | BD | Todos | Persistencia | Necesidad técnica |
| BD | Backups | Todos | Continuidad | Obligación legal |

### 5.2 Transferencias a Terceros

| Tercero | Datos | Finalidad | Base Legal | Contrato |
|---------|-------|-----------|------------|----------|
| Google Calendar (opcional) | Citas | Sincronización | Consentimiento | API Terms |
| Servidor SMTP | Email | Notificaciones | Consentimiento | SLA |

**Nota:** Actualmente NO hay transferencias de datos personales de salud a terceros fuera de UNAM.

### 5.3 Transferencias Internacionales

| Estado | Descripción |
|--------|-------------|
| **No aplica** | Todos los datos se almacenan en servidores UNAM en México |

---

## 6. CONSERVACIÓN Y ELIMINACIÓN

### 6.1 Períodos de Conservación

| Categoría de Datos | Período | Justificación |
|-------------------|---------|---------------|
| Datos de cuenta | Mientras activa + 1 año | Operativo |
| Datos médicos | 5 años desde última consulta | NOM-004-SSA3-2012 |
| Logs de auditoría | 3 años | Cumplimiento normativo |
| Sesiones expiradas | 30 días | Seguridad |
| Backups | 1 año | Continuidad |

### 6.2 Procedimiento de Eliminación

1. **Solicitud de cancelación (ARCO)**
   - Usuario solicita eliminación
   - Verificación de identidad
   - Evaluación de obligaciones legales de conservación

2. **Eliminación técnica**
   - Datos encriptados: Eliminación de clave
   - Datos en texto: Sobrescritura segura
   - Backups: Rotación natural según política

3. **Registro de eliminación**
   - Documentar fecha y alcance
   - Mantener registro de la solicitud (sin datos eliminados)

### 6.3 Excepciones a la Eliminación

- Datos requeridos por normativa médica (5 años)
- Datos necesarios para defensa legal
- Logs de auditoría (3 años mínimo)
- Datos anonimizados para estadísticas

---

## CONTROL DE VERSIONES

| Versión | Fecha | Cambios | Autor |
|---------|-------|---------|-------|
| 1.0 | Enero 2026 | Versión inicial | [AUTOR] |

---

## APROBACIONES

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| Responsable de BD | [COMPLETAR] | _________ | _________ |
| Oficial de Privacidad | [COMPLETAR] | _________ | _________ |
| Director del Proyecto | [COMPLETAR] | _________ | _________ |

---

**Documento parte del Sistema de Gestión de Seguridad de Datos Personales (SGSDP)**
**Sistema Vitalia v2.0 - UNAM**
