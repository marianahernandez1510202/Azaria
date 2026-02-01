# DOCUMENTO DE SEGURIDAD

## Sistema Vitalia v2.0 - Plataforma de Rehabilitación para Pacientes Amputados

**Versión:** 1.0
**Fecha de elaboración:** Enero 2026
**Fecha de última actualización:** [COMPLETAR]
**Responsable:** [NOMBRE DEL RESPONSABLE]
**Cargo:** [CARGO]
**Entidad:** Universidad Nacional Autónoma de México

---

## ÍNDICE

1. [Introducción](#1-introducción)
2. [Marco Normativo](#2-marco-normativo)
3. [Ámbito de Aplicación](#3-ámbito-de-aplicación)
4. [Inventario de Datos Personales](#4-inventario-de-datos-personales)
5. [Funciones y Obligaciones del Personal](#5-funciones-y-obligaciones-del-personal)
6. [Análisis de Riesgos](#6-análisis-de-riesgos)
7. [Medidas de Seguridad](#7-medidas-de-seguridad)
8. [Procedimientos de Respuesta a Incidentes](#8-procedimientos-de-respuesta-a-incidentes)
9. [Plan de Continuidad](#9-plan-de-continuidad)
10. [Capacitación](#10-capacitación)
11. [Auditorías](#11-auditorías)
12. [Actualizaciones del Documento](#12-actualizaciones-del-documento)

---

## 1. INTRODUCCIÓN

### 1.1 Propósito

El presente Documento de Seguridad tiene como propósito establecer las medidas de seguridad administrativas, físicas y técnicas para la protección de los datos personales tratados en el Sistema Vitalia v2.0, en cumplimiento con:

- Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados (LGPDPPSO)
- Lineamientos Generales de Protección de Datos Personales para el Sector Público
- Normas Complementarias sobre Medidas de Seguridad de la UNAM
- Lineamientos de Seguridad de la Información en Sitios Web de la UNAM

### 1.2 Descripción del Sistema

**Sistema Vitalia v2.0** es una plataforma web de rehabilitación médica diseñada para pacientes adultos mayores (60-80 años) que han sufrido amputaciones. El sistema gestiona:

- Información personal de pacientes y familiares
- Datos clínicos y médicos (glucosa, presión arterial, dolor)
- Planes de rehabilitación y fisioterapia
- Citas médicas y recordatorios
- Comunidad de apoyo entre pacientes

### 1.3 Clasificación de Datos

| Categoría | Tipo | Nivel de Sensibilidad |
|-----------|------|----------------------|
| Datos de identificación | Nombre, CURP, RFC | Alto |
| Datos de contacto | Teléfono, email, dirección | Medio |
| Datos de salud | Diagnósticos, medicamentos, bitácoras médicas | **Sensible** |
| Datos biométricos | Fotografías de perfil | Alto |
| Datos de acceso | Contraseñas, tokens | Crítico |

---

## 2. MARCO NORMATIVO

### 2.1 Legislación Aplicable

1. **Constitución Política de los Estados Unidos Mexicanos** - Artículos 6 y 16
2. **Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados**
3. **Ley General de Transparencia y Acceso a la Información Pública**
4. **Lineamientos Generales de Protección de Datos Personales para el Sector Público**

### 2.2 Normatividad Interna UNAM

1. Reglamento de Transparencia y Acceso a la Información Pública de la UNAM
2. Lineamientos de Seguridad de la Información en Sitios Web de la UNAM
3. Normas Complementarias sobre Medidas de Seguridad Técnicas, Administrativas y Físicas
4. Lineamientos para el Almacenamiento e Información Compartida UNAM
5. Lineamientos para el Resguardo de Información Electrónica UNAM

---

## 3. ÁMBITO DE APLICACIÓN

### 3.1 Alcance

Este documento aplica a:

- Todo el personal que tenga acceso al Sistema Vitalia
- Administradores de sistemas y bases de datos
- Personal médico y de rehabilitación
- Desarrolladores y personal de TI
- Terceros que tengan acceso autorizado

### 3.2 Sistemas Cubiertos

| Componente | Tecnología | Ubicación |
|------------|------------|-----------|
| Frontend | React 18 | Servidor web UNAM |
| Backend API | PHP 8.1 | Servidor aplicaciones UNAM |
| Base de datos | MySQL 8.0 | Servidor BD UNAM |
| Almacenamiento archivos | Sistema de archivos | Servidor UNAM |

---

## 4. INVENTARIO DE DATOS PERSONALES

> **Nota:** El inventario detallado se encuentra en el documento complementario: `INVENTARIO_DATOS_PERSONALES.md`

### 4.1 Resumen de Tratamientos

| Base de Datos | Tablas con Datos Personales | Registros Estimados |
|---------------|----------------------------|---------------------|
| vitalia_db | 12 tablas | [COMPLETAR] |

### 4.2 Finalidades del Tratamiento

1. **Finalidad primaria:** Gestión de rehabilitación médica de pacientes amputados
2. **Finalidad secundaria:** Estadísticas anónimas para mejora del servicio
3. **Finalidad terciaria:** Comunicación de citas y recordatorios médicos

---

## 5. FUNCIONES Y OBLIGACIONES DEL PERSONAL

### 5.1 Roles Definidos en el Sistema

| Rol | Permisos | Responsabilidades |
|-----|----------|-------------------|
| **Administrador** | Acceso total | Gestión de usuarios, configuración, auditoría |
| **Cuidador** | Lectura/escritura pacientes asignados | Registro de bitácoras, seguimiento |
| **Paciente** | Lectura/escritura datos propios | Consulta de información personal |

### 5.2 Obligaciones Generales

Todo el personal con acceso al sistema debe:

1. Firmar carta de confidencialidad
2. Completar capacitación en protección de datos
3. Reportar incidentes de seguridad inmediatamente
4. No compartir credenciales de acceso
5. Cerrar sesión al terminar su jornada
6. No extraer datos sin autorización

### 5.3 Responsable del Tratamiento

**Nombre:** [COMPLETAR]
**Cargo:** [COMPLETAR]
**Correo:** [COMPLETAR]@unam.mx
**Teléfono:** [COMPLETAR]

### 5.4 Encargado de Seguridad

**Nombre:** [COMPLETAR]
**Cargo:** [COMPLETAR]
**Correo:** [COMPLETAR]@unam.mx

---

## 6. ANÁLISIS DE RIESGOS

### 6.1 Metodología

Se utiliza la metodología de análisis de riesgos basada en:
- Probabilidad de ocurrencia (1-5)
- Impacto (1-5)
- Riesgo = Probabilidad × Impacto

### 6.2 Riesgos Identificados

| ID | Riesgo | Probabilidad | Impacto | Nivel | Mitigación |
|----|--------|--------------|---------|-------|------------|
| R1 | Acceso no autorizado a BD | 2 | 5 | Alto | Encriptación, control de acceso |
| R2 | Fuga de datos médicos | 2 | 5 | Alto | Encriptación AES-256, logs |
| R3 | Pérdida de datos | 2 | 4 | Medio | Backups automáticos |
| R4 | Ataque de fuerza bruta | 3 | 3 | Medio | Rate limiting, bloqueo |
| R5 | Inyección SQL | 2 | 5 | Alto | Prepared statements |
| R6 | XSS | 2 | 3 | Medio | Sanitización, CSP |
| R7 | Suplantación de identidad | 2 | 4 | Medio | 2FA, verificación |
| R8 | Desastre físico | 1 | 5 | Medio | Backups offsite, DRP |

### 6.3 Evaluación de Impacto (EIDP)

> **Estado:** [PENDIENTE/EN PROCESO/COMPLETADA]
> **Fecha de última evaluación:** [COMPLETAR]

Se requiere EIDP debido al tratamiento de:
- Datos de salud (categoría sensible)
- Población vulnerable (adultos mayores)
- Tratamiento a gran escala potencial

---

## 7. MEDIDAS DE SEGURIDAD

### 7.1 Medidas Administrativas

| Control | Descripción | Estado |
|---------|-------------|--------|
| Políticas de seguridad | Documento normativo aprobado | Implementado |
| Capacitación | Programa anual de formación | [PENDIENTE] |
| Carta confidencialidad | Firma obligatoria para acceso | [PENDIENTE] |
| Procedimiento ARCO | Mecanismo de ejercicio de derechos | [PENDIENTE] |
| Auditorías | Revisiones periódicas | [PENDIENTE] |

### 7.2 Medidas Físicas

| Control | Descripción | Estado |
|---------|-------------|--------|
| Control de acceso físico | Acceso restringido a servidores | [VERIFICAR] |
| Protección equipos | UPS, clima controlado | [VERIFICAR] |
| Bitácora de acceso | Registro de entrada a instalaciones | [VERIFICAR] |
| Destrucción segura | Procedimiento para medios físicos | [PENDIENTE] |

### 7.3 Medidas Técnicas

| Control | Descripción | Estado |
|---------|-------------|--------|
| **Autenticación** | | |
| Contraseñas seguras | bcrypt con cost 12 | ✅ Implementado |
| JWT con expiración | Tokens de 24 horas | ✅ Implementado |
| Control de sesiones | Invalidación de sesiones | ✅ Implementado |
| **Cifrado** | | |
| HTTPS/TLS | Cifrado en tránsito | [CONFIGURAR] |
| AES-256-GCM | Cifrado en reposo | ✅ Implementado |
| **Control de Acceso** | | |
| RBAC | 3 roles definidos | ✅ Implementado |
| Principio mínimo privilegio | Permisos por rol | ✅ Implementado |
| **Integridad** | | |
| Logs de auditoría | Registro de operaciones | ✅ Implementado |
| Validación de entrada | Sanitización de datos | ✅ Implementado |
| **Disponibilidad** | | |
| Backups automáticos | Respaldo diario | [CONFIGURAR] |
| Plan de recuperación | DRP documentado | [PENDIENTE] |

---

## 8. PROCEDIMIENTOS DE RESPUESTA A INCIDENTES

### 8.1 Clasificación de Incidentes

| Nivel | Descripción | Tiempo de Respuesta |
|-------|-------------|---------------------|
| Crítico | Fuga de datos masiva, ransomware | Inmediato (< 1 hora) |
| Alto | Acceso no autorizado detectado | < 4 horas |
| Medio | Intentos de intrusión fallidos | < 24 horas |
| Bajo | Anomalías menores | < 72 horas |

### 8.2 Procedimiento de Respuesta

1. **Detección y Registro**
   - Identificar el incidente
   - Registrar en bitácora de incidentes
   - Clasificar según severidad

2. **Contención**
   - Aislar sistemas afectados
   - Preservar evidencia
   - Notificar al responsable de seguridad

3. **Erradicación**
   - Eliminar causa raíz
   - Aplicar parches/correcciones
   - Verificar integridad

4. **Recuperación**
   - Restaurar servicios
   - Monitorear funcionamiento
   - Documentar acciones

5. **Notificación**
   - Notificar a titulares afectados (si aplica)
   - Notificar al INAI (vulneraciones significativas)
   - Informe a autoridades UNAM

### 8.3 Contactos de Emergencia

| Rol | Nombre | Teléfono | Correo |
|-----|--------|----------|--------|
| Responsable seguridad | [COMPLETAR] | [COMPLETAR] | [COMPLETAR] |
| Soporte TI | [COMPLETAR] | [COMPLETAR] | [COMPLETAR] |
| DGTIC UNAM | --- | 55 5622 8544 | soporte@unam.mx |

---

## 9. PLAN DE CONTINUIDAD

### 9.1 Objetivos de Recuperación

| Métrica | Valor Objetivo | Actual |
|---------|----------------|--------|
| RPO (Recovery Point Objective) | 24 horas | [VERIFICAR] |
| RTO (Recovery Time Objective) | 4 horas | [VERIFICAR] |

### 9.2 Estrategia de Respaldos

| Tipo | Frecuencia | Retención | Ubicación |
|------|------------|-----------|-----------|
| Completo | Semanal (domingo) | 4 semanas | [DEFINIR] |
| Incremental | Diario | 7 días | [DEFINIR] |
| Logs transaccionales | Cada hora | 48 horas | [DEFINIR] |

### 9.3 Procedimiento de Restauración

1. Identificar punto de restauración
2. Verificar integridad del respaldo
3. Preparar ambiente de recuperación
4. Ejecutar restauración
5. Verificar integridad de datos
6. Validar funcionalidad
7. Documentar el proceso

---

## 10. CAPACITACIÓN

### 10.1 Programa de Capacitación

| Curso | Audiencia | Frecuencia | Duración |
|-------|-----------|------------|----------|
| Introducción a protección de datos | Todo el personal | Anual | 2 horas |
| Seguridad para desarrolladores | Equipo de desarrollo | Semestral | 4 horas |
| Manejo de incidentes | Personal de TI | Anual | 4 horas |
| Derechos ARCO | Personal de atención | Anual | 2 horas |

### 10.2 Registro de Capacitaciones

| Fecha | Curso | Participantes | Instructor |
|-------|-------|---------------|------------|
| [COMPLETAR] | [COMPLETAR] | [COMPLETAR] | [COMPLETAR] |

---

## 11. AUDITORÍAS

### 11.1 Programa de Auditorías

| Tipo | Frecuencia | Alcance |
|------|------------|---------|
| Interna | Semestral | Cumplimiento del documento |
| Externa | Anual | Auditoría integral |
| Técnica | Trimestral | Vulnerabilidades técnicas |

### 11.2 Registro de Auditorías

| Fecha | Tipo | Hallazgos | Estado Correcciones |
|-------|------|-----------|---------------------|
| [COMPLETAR] | [COMPLETAR] | [COMPLETAR] | [COMPLETAR] |

---

## 12. ACTUALIZACIONES DEL DOCUMENTO

### 12.1 Control de Cambios

| Versión | Fecha | Descripción | Autor |
|---------|-------|-------------|-------|
| 1.0 | Enero 2026 | Versión inicial | [AUTOR] |

### 12.2 Revisión y Aprobación

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| Elaboró | [COMPLETAR] | _________ | _________ |
| Revisó | [COMPLETAR] | _________ | _________ |
| Aprobó | [COMPLETAR] | _________ | _________ |

---

## ANEXOS

### Anexo A: Glosario de Términos

- **ARCO:** Derechos de Acceso, Rectificación, Cancelación y Oposición
- **EIDP:** Evaluación de Impacto en la Protección de Datos
- **LGPDPPSO:** Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados
- **RPO:** Recovery Point Objective (Punto de recuperación objetivo)
- **RTO:** Recovery Time Objective (Tiempo de recuperación objetivo)
- **SGSDP:** Sistema de Gestión de Seguridad de Datos Personales

### Anexo B: Documentos Relacionados

1. `INVENTARIO_DATOS_PERSONALES.md` - Inventario detallado de datos
2. `AVISO_DE_PRIVACIDAD.md` - Aviso de privacidad del sistema
3. `REPORTE_CUMPLIMIENTO_LINEAMIENTOS_UNAM.md` - Evaluación de cumplimiento

### Anexo C: Formato de Carta de Confidencialidad

[Se incluye formato estándar para firma del personal]

---

**Documento generado como parte del Sistema de Gestión de Seguridad de Datos Personales (SGSDP)**
**Sistema Vitalia v2.0 - UNAM**
