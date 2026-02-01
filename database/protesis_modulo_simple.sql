-- =====================================================
-- MÓDULO DE PRÓTESIS - VERSIÓN SIMPLE PARA PHPMYADMIN
-- Ejecutar en orden: primero estructura, luego datos
-- =====================================================

-- =====================================================
-- PARTE 1: CREAR NUEVAS TABLAS
-- =====================================================

CREATE TABLE IF NOT EXISTS niveles_k (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nivel VARCHAR(5) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    caracteristicas JSON,
    actividades_permitidas JSON,
    tipo_protesis_recomendada JSON,
    imagen_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS faq_protesis (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pregunta VARCHAR(300) NOT NULL,
    respuesta TEXT NOT NULL,
    categoria ENUM('general', 'cuidados', 'ajustes', 'dolor', 'actividades', 'mantenimiento') NOT NULL,
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS videos_educativos_protesis (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    categoria ENUM('colocacion', 'cuidados', 'ejercicios', 'mantenimiento', 'testimonios', 'general') NOT NULL,
    url_video VARCHAR(255) NOT NULL,
    duracion_minutos INT,
    nivel_k_aplicable JSON,
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PARTE 2: AGREGAR COLUMNAS A TABLAS EXISTENTES
-- (Ignorar errores si ya existen)
-- =====================================================

ALTER TABLE tipos_dispositivo ADD COLUMN componentes JSON DEFAULT NULL;
ALTER TABLE tipos_dispositivo ADD COLUMN nivel_k_minimo VARCHAR(5) DEFAULT NULL;
ALTER TABLE tipos_dispositivo ADD COLUMN ventajas JSON DEFAULT NULL;
ALTER TABLE tipos_dispositivo ADD COLUMN desventajas JSON DEFAULT NULL;
ALTER TABLE tipos_dispositivo ADD COLUMN cuidados_especificos JSON DEFAULT NULL;
ALTER TABLE tipos_dispositivo ADD COLUMN imagen_url VARCHAR(255) DEFAULT NULL;

ALTER TABLE guias_cuidado ADD COLUMN pasos JSON DEFAULT NULL;
ALTER TABLE guias_cuidado ADD COLUMN tips JSON DEFAULT NULL;
ALTER TABLE guias_cuidado ADD COLUMN advertencias JSON DEFAULT NULL;
ALTER TABLE guias_cuidado ADD COLUMN video_url VARCHAR(255) DEFAULT NULL;
ALTER TABLE guias_cuidado ADD COLUMN nivel_k_aplicable JSON DEFAULT NULL;
ALTER TABLE guias_cuidado ADD COLUMN orden INT DEFAULT 0;

ALTER TABLE dispositivos_paciente ADD COLUMN nivel_k VARCHAR(5) DEFAULT NULL;
ALTER TABLE dispositivos_paciente ADD COLUMN fecha_evaluacion_k DATE DEFAULT NULL;
ALTER TABLE dispositivos_paciente ADD COLUMN objetivos_rehabilitacion TEXT DEFAULT NULL;

-- =====================================================
-- PARTE 3: INSERTAR NIVELES K
-- =====================================================

INSERT INTO niveles_k (nivel, nombre, descripcion, caracteristicas, actividades_permitidas, tipo_protesis_recomendada, imagen_url) VALUES

('K0', 'No Ambulatorio',
'El paciente no tiene la capacidad o el potencial para deambular o transferirse de manera segura con o sin asistencia.',
'["No puede caminar ni con asistencia", "Usa silla de ruedas permanentemente", "Puede necesitar prótesis cosmética", "Enfoque en transferencias seguras"]',
'["Transferencias asistidas", "Actividades sedentarias", "Terapia ocupacional adaptada"]',
'["Prótesis cosmética (opcional)", "No se recomienda prótesis funcional"]',
'/images/niveles/k0.png'),

('K1', 'Ambulador de Interiores',
'El paciente tiene la capacidad o potencial de usar una prótesis para transferencias o para deambulación en superficies planas a un ritmo fijo.',
'["Camina en superficies planas y uniformes", "Velocidad de marcha fija y lenta", "Principalmente en interiores", "Puede necesitar ayudas como bastón o andadera"]',
'["Caminar en casa", "Transferencias independientes", "Actividades de la vida diaria en el hogar", "Caminatas cortas en exteriores controlados"]',
'["Pie SACH (Solid Ankle Cushion Heel)", "Pie de eje simple", "Rodilla con bloqueo manual (transfemoral)", "Socket de contacto total"]',
'/images/niveles/k1.png'),

('K2', 'Ambulador Comunitario Limitado',
'El paciente tiene la capacidad o potencial para deambular con la habilidad de atravesar barreras ambientales de bajo nivel.',
'["Camina en exteriores con precaución", "Puede subir escaleras con baranda", "Supera obstáculos pequeños", "Velocidad variable limitada"]',
'["Caminatas en la comunidad", "Subir y bajar escaleras", "Caminar en superficies irregulares", "Compras y mandados"]',
'["Pie de respuesta dinámica básica", "Pie multiaxial", "Rodilla policéntrica", "Sistema de suspensión con pin o vacío"]',
'/images/niveles/k2.png'),

('K3', 'Ambulador Comunitario Ilimitado',
'El paciente tiene la capacidad o potencial para deambulación con cadencia variable. Caminador comunitario típico.',
'["Camina a diferentes velocidades", "Supera la mayoría de obstáculos", "Puede correr distancias cortas", "Participa en actividades recreativas"]',
'["Caminatas largas", "Deportes recreativos", "Ciclismo", "Natación", "Trabajo activo", "Senderismo ligero"]',
'["Pie de respuesta dinámica avanzada", "Pie de fibra de carbono", "Rodilla con microprocesador (opcional)", "Rodilla hidráulica"]',
'/images/niveles/k3.png'),

('K4', 'Ambulador de Alta Actividad',
'El paciente tiene la capacidad o potencial para la deambulación protésica que excede las habilidades básicas. Atleta o muy activo.',
'["Atleta o muy activo físicamente", "Corre y salta", "Practica deportes de impacto", "Niños activos", "Trabajos de alta demanda física"]',
'["Correr y trotar", "Deportes de impacto", "Baloncesto, fútbol, tenis", "Escalada", "Esquí", "Competencias deportivas"]',
'["Pie de carrera/running", "Pie de alto rendimiento deportivo", "Rodilla con microprocesador", "Rodilla deportiva especializada"]',
'/images/niveles/k4.png');

-- =====================================================
-- PARTE 4: INSERTAR TIPOS DE PRÓTESIS
-- =====================================================

INSERT INTO tipos_dispositivo (nombre, descripcion, categoria, componentes, nivel_k_minimo, ventajas, desventajas, cuidados_especificos) VALUES

('Prótesis Transtibial con Pie SACH',
'Prótesis básica con pie de talón amortiguado sin articulación. Ideal para usuarios K1.',
'protesis',
'["Socket PTB o TSB", "Liner suave", "Suspensión con correa supracondílea", "Pie SACH"]',
'K0',
'["Muy estable", "Bajo mantenimiento", "Económica", "Durable", "Ideal para principiantes"]',
'["Sin respuesta dinámica", "Marcha menos natural", "No apta para terrenos irregulares"]',
'["Revisar talón del pie por desgaste", "Limpiar socket semanalmente", "Verificar correas de suspensión"]'),

('Prótesis Transtibial con Pie de Fibra de Carbono',
'Prótesis de alto rendimiento con pie que almacena y devuelve energía. Ideal para usuarios activos K3-K4.',
'protesis',
'["Socket de fibra de carbono", "Liner con matriz de gel", "Sistema de vacío elevado", "Pie de respuesta dinámica"]',
'K3',
'["Excelente retorno de energía", "Muy ligera", "Ideal para correr", "Marcha natural y eficiente"]',
'["Costo elevado", "Requiere buen control del muñón", "No recomendada para K1-K2"]',
'["Inspeccionar fibra de carbono por delaminación", "Mantener sistema de vacío", "Revisar adaptadores"]'),

('Prótesis Transfemoral con Rodilla Mecánica',
'Prótesis para amputaciones por encima de la rodilla con sistema de rodilla mecánico.',
'protesis',
'["Socket cuadrilateral o MAS", "Liner transfemoral", "Sistema de suspensión", "Rodilla policéntrica o de fricción", "Pilón", "Pie protésico"]',
'K1',
'["Más económica que rodilla computarizada", "Mecánicamente simple", "Fácil mantenimiento", "Buena estabilidad"]',
'["Marcha menos natural", "Mayor gasto energético", "Control limitado de velocidad"]',
'["Lubricar rodilla cada 3 meses", "Revisar bloqueo de seguridad diariamente", "Inspeccionar sistema de suspensión"]'),

('Prótesis Transfemoral con Rodilla Microprocesador',
'Prótesis avanzada con rodilla controlada por microprocesador que ajusta automáticamente la resistencia.',
'protesis',
'["Socket de contención isquiática", "Liner con pin o vacío", "Rodilla con microprocesador", "Adaptadores de titanio", "Pie de respuesta dinámica", "Batería recargable"]',
'K2',
'["Marcha muy natural", "Seguridad en escaleras y rampas", "Menor gasto energético", "Reducción de caídas"]',
'["Costo muy elevado", "Requiere carga de batería", "Mantenimiento especializado", "No sumergible en agua"]',
'["Cargar batería diariamente", "Actualizaciones de software periódicas", "No exponer a agua", "Revisión técnica cada 6 meses"]'),

('Prótesis Transfemoral Deportiva',
'Prótesis especializada para actividades deportivas y de alto impacto.',
'protesis',
'["Socket deportivo de fibra de carbono", "Liner de alto rendimiento", "Rodilla deportiva", "Pie de carrera (blade runner)"]',
'K4',
'["Máximo rendimiento deportivo", "Muy ligera", "Alta respuesta de energía", "Diseñada para impacto"]',
'["Solo para deporte (no uso diario)", "Costo muy elevado", "Requiere entrenamiento específico"]',
'["Inspeccionar blade por grietas después de cada uso", "No usar en superficies abrasivas", "Almacenar en lugar seco"]'),

('Prótesis de Desarticulación de Rodilla',
'Prótesis para amputaciones a nivel de la articulación de la rodilla.',
'protesis',
'["Socket de contacto terminal", "Sistema de suspensión por contorno", "Rodilla externa especializada", "Pilón", "Pie protésico"]',
'K1',
'["Apoyo terminal completo", "Excelente propiocepción", "Suspensión natural por forma del muñón"]',
'["Centro de rodilla más bajo que pierna sana", "Apariencia cosmética comprometida cuando sentado"]',
'["Cuidado especial de la piel del extremo del muñón", "Revisar ajuste del socket frecuentemente"]'),

('Prótesis de Pie Parcial',
'Prótesis para amputaciones parciales del pie a nivel de Chopart o Lisfranc.',
'protesis',
'["Socket tipo zapatilla", "Relleno de silicona", "Placa de fibra de carbono (opcional)", "Cubierta cosmética"]',
'K1',
'["Conserva tobillo natural", "Marcha más natural", "Menor gasto energético", "Fácil de ocultar"]',
'["Control de tobillo limitado", "Puede causar contractura del tendón de Aquiles"]',
'["Usar calzado con buen soporte", "Estirar tendón de Aquiles diariamente", "Revisar piel por presión"]');

-- =====================================================
-- PARTE 5: INSERTAR GUÍAS DE CUIDADO
-- =====================================================

INSERT INTO guias_cuidado (titulo, contenido, tipo_dispositivo_id, categoria, pasos, tips, advertencias, nivel_k_aplicable, orden) VALUES

('Cuidado Diario del Muñón',
'El cuidado adecuado del muñón es la base para un uso exitoso de la prótesis.',
NULL, 'limpieza',
'["Lavar el muñón cada noche con agua tibia y jabón neutro", "Enjuagar completamente", "Secar con palmaditas suaves", "Inspeccionar en busca de enrojecimiento o heridas", "Aplicar crema hidratante por la noche", "Masajear suavemente para mejorar circulación"]',
'["El mejor momento para hidratar es después del baño nocturno", "Usa un espejo para ver todas las áreas del muñón"]',
'["Nunca apliques crema antes de colocar la prótesis", "Las heridas abiertas son contraindicación para usar la prótesis"]',
'["K0", "K1", "K2", "K3", "K4"]', 1),

('Limpieza del Liner',
'El liner está en contacto directo con tu piel y debe limpiarse diariamente.',
NULL, 'limpieza',
'["Retira el liner volteándolo del revés", "Lava con agua tibia y jabón neutro", "Frota suavemente toda la superficie", "Enjuaga completamente", "Deja secar al aire en lugar ventilado"]',
'["Ten dos liners para alternar mientras uno seca", "El liner debe estar 100% seco antes de usarlo"]',
'["Un liner húmedo causa hongos e irritación", "No uses alcohol ni blanqueador", "No lo seques con calor"]',
'["K1", "K2", "K3", "K4"]', 2),

('Limpieza del Socket',
'El socket debe mantenerse limpio para prevenir irritación de la piel.',
NULL, 'limpieza',
'["Limpia el interior diariamente con un paño húmedo", "Usa jabón antibacterial una vez por semana", "Seca completamente", "Inspecciona por grietas o bordes ásperos"]',
'["Limpia el socket por la noche para que seque", "El vinagre diluido ayuda a eliminar olores"]',
'["No uses químicos abrasivos", "Reporta cualquier grieta a tu protesista"]',
'["K1", "K2", "K3", "K4"]', 3),

('Mantenimiento de Componentes Mecánicos',
'Los componentes mecánicos requieren mantenimiento regular.',
NULL, 'mantenimiento',
'["Inspecciona visualmente todos los componentes semanalmente", "Verifica que los tornillos estén apretados", "Lubrica las partes móviles según indicaciones", "Programa revisiones cada 3-6 meses"]',
'["Usa solo los lubricantes recomendados por el fabricante", "Mantén un kit básico de herramientas Allen"]',
'["No intentes reparaciones complejas tú mismo", "Los ruidos nuevos requieren revisión profesional"]',
'["K1", "K2", "K3", "K4"]', 4),

('Colocación de Prótesis Transtibial',
'Una colocación correcta es fundamental para la comodidad y seguridad.',
NULL, 'uso',
'["Siéntate en una superficie estable", "Coloca el liner desenrollándolo sobre el muñón", "Asegúrate de que no haya arrugas", "Verifica que el pin esté alineado", "Inserta el muñón en el socket", "Escucha los clicks del pin enganchándose"]',
'["Practica la colocación sentado antes de hacerlo de pie", "Cuenta los clicks del pin para verificar profundidad"]',
'["Un liner con arrugas causa ampollas", "Si el pin no engancha, retira y vuelve a intentar"]',
'["K1", "K2", "K3", "K4"]', 5),

('Señales de Alerta',
'Reconocer los signos de problemas te permite actuar rápidamente.',
NULL, 'revision',
'["Observa tu muñón diariamente en busca de cambios", "Documenta con fotos cualquier problema", "No ignores el dolor", "Mantén comunicación con tu equipo de rehabilitación"]',
'["Un diario de síntomas ayuda a identificar patrones", "Las fotos son útiles para consultas remotas"]',
'["El dolor persistente NO es normal - siempre consulta", "Los cambios de color son emergencias"]',
'["K0", "K1", "K2", "K3", "K4"]', 6),

('Ejercicios de Fortalecimiento',
'Mantener la fuerza muscular mejora el control de la prótesis.',
NULL, 'ejercicios',
'["Extensiones de cadera - 3 series de 10", "Abducciones de cadera - 3 series de 10", "Elevaciones de pierna recta - 3 series de 10", "Ejercicios de equilibrio con apoyo"]',
'["Empieza suave y aumenta gradualmente", "La consistencia es más importante que la intensidad"]',
'["El dolor agudo indica que debes parar", "No hagas ejercicio si el muñón tiene heridas"]',
'["K1", "K2", "K3", "K4"]', 7);

-- =====================================================
-- PARTE 6: INSERTAR FAQs
-- =====================================================

INSERT INTO faq_protesis (pregunta, respuesta, categoria, orden) VALUES

('¿Cuántas horas al día debo usar mi prótesis?',
'Al inicio, usa la prótesis por períodos cortos (1-2 horas) y aumenta gradualmente. Con el tiempo, la mayoría de usuarios la usan 10-16 horas. Siempre retírala para dormir.',
'general', 1),

('¿Puedo bañarme o nadar con mi prótesis?',
'Depende del tipo. Las prótesis mecánicas básicas pueden mojarse pero deben secarse. Las de microprocesador NO deben sumergirse. Existen prótesis especiales para natación.',
'general', 2),

('¿Con qué frecuencia debo reemplazar mi prótesis?',
'Los liners duran 6-12 meses, los sockets 2-3 años, y los componentes mecánicos 3-5 años. Cambios en tu peso o condición pueden requerir ajustes antes.',
'mantenimiento', 3),

('¿Es normal sentir dolor con la prótesis?',
'Las molestias leves durante la adaptación inicial son normales, pero el dolor persistente NO es normal. Consulta con tu protesista para ajustes.',
'dolor', 4),

('¿Qué hago si mi muñón cambia de tamaño?',
'Es normal durante el día. Usa calcetines protésicos para ajustar. Si el cambio es persistente, puede indicar problemas médicos. Consulta tu médico.',
'ajustes', 5),

('¿Puedo hacer ejercicio o deporte con mi prótesis?',
'¡Sí! Con la prótesis adecuada y entrenamiento apropiado puedes hacer muchas actividades. Tu nivel K determina qué actividades son seguras.',
'actividades', 6),

('¿Qué hago si aparece una ampolla o herida?',
'Detén el uso de la prótesis inmediatamente. Limpia la herida, aplica ungüento antibiótico y cubre con gasa. No uses la prótesis hasta que sane.',
'cuidados', 7),

('¿Cómo sé si mi prótesis necesita ajuste?',
'Señales: dolor nuevo, enrojecimiento persistente, socket muy flojo o apretado, cambio en el patrón de marcha, ruidos nuevos.',
'ajustes', 8),

('¿Puedo conducir con mi prótesis?',
'Muchas personas con prótesis conducen exitosamente. Si afecta tu pierna derecha, puede necesitar adaptaciones. Consulta las regulaciones locales.',
'actividades', 9),

('¿Qué es el nivel K y por qué es importante?',
'El nivel K (K0-K4) clasifica tu potencial de movilidad. Determina qué componentes protésicos son apropiados. Va desde K0 (no ambulatorio) hasta K4 (atleta).',
'general', 10);

-- =====================================================
-- PARTE 7: INSERTAR VIDEOS EDUCATIVOS
-- =====================================================

INSERT INTO videos_educativos_protesis (titulo, descripcion, categoria, url_video, duracion_minutos, nivel_k_aplicable, orden) VALUES

('Cómo colocar tu prótesis transtibial',
'Video paso a paso de colocación del liner y socket.',
'colocacion', 'https://www.youtube.com/embed/example1', 8,
'["K1", "K2", "K3", "K4"]', 1),

('Cuidado diario del muñón',
'Rutina completa de limpieza, inspección e hidratación.',
'cuidados', 'https://www.youtube.com/embed/example2', 6,
'["K1", "K2", "K3", "K4"]', 2),

('Ejercicios de fortalecimiento',
'Serie de ejercicios para fortalecer los músculos del muñón.',
'ejercicios', 'https://www.youtube.com/embed/example3', 15,
'["K1", "K2", "K3", "K4"]', 3),

('Mantenimiento básico de tu prótesis',
'Cómo limpiar, inspeccionar y mantener tu prótesis.',
'mantenimiento', 'https://www.youtube.com/embed/example4', 10,
'["K1", "K2", "K3", "K4"]', 4),

('Historias de éxito',
'Testimonios inspiradores de pacientes que han recuperado su movilidad.',
'testimonios', 'https://www.youtube.com/embed/example5', 20,
'["K0", "K1", "K2", "K3", "K4"]', 5);
