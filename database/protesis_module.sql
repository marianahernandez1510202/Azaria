-- =====================================================
-- MÓDULO DE PRÓTESIS COMPLETO - AZARIA
-- Incluye: Niveles K, Tipos de Prótesis, Cuidados, Guías
-- =====================================================

-- Tabla de Niveles K (Clasificación Funcional)
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

-- Tabla de Tipos de Prótesis
CREATE TABLE IF NOT EXISTS tipos_protesis (
    id INT PRIMARY KEY AUTO_INCREMENT,
    categoria ENUM('transtibial', 'transfemoral', 'desarticulacion_rodilla', 'desarticulacion_cadera', 'parcial_pie', 'miembro_superior') NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    componentes JSON,
    nivel_k_minimo VARCHAR(5),
    ventajas JSON,
    desventajas JSON,
    cuidados_especificos JSON,
    imagen_url VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Componentes de Prótesis
CREATE TABLE IF NOT EXISTS componentes_protesis (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tipo_protesis_id INT,
    nombre VARCHAR(100) NOT NULL,
    categoria ENUM('socket', 'liner', 'sistema_suspension', 'rodilla', 'pie', 'adaptador', 'cosmesis', 'otro') NOT NULL,
    descripcion TEXT,
    cuidados TEXT,
    vida_util_meses INT,
    senales_desgaste JSON,
    imagen_url VARCHAR(255),
    FOREIGN KEY (tipo_protesis_id) REFERENCES tipos_protesis(id)
);

-- Tabla de Guías de Cuidado
CREATE TABLE IF NOT EXISTS guias_cuidado_protesis (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(200) NOT NULL,
    categoria ENUM('cuidado_munon', 'limpieza_protesis', 'colocacion', 'uso_diario', 'mantenimiento', 'emergencias', 'ejercicios', 'general') NOT NULL,
    contenido TEXT NOT NULL,
    pasos JSON,
    tips JSON,
    advertencias JSON,
    video_url VARCHAR(255),
    nivel_k_aplicable JSON,
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Videos Educativos de Prótesis
CREATE TABLE IF NOT EXISTS videos_educativos_protesis (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    categoria ENUM('colocacion', 'cuidados', 'ejercicios', 'mantenimiento', 'testimonios', 'general') NOT NULL,
    url_video VARCHAR(255) NOT NULL,
    duracion_minutos INT,
    nivel_k_aplicable JSON,
    tipo_protesis_id INT,
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tipo_protesis_id) REFERENCES tipos_protesis(id)
);

-- Tabla de Preguntas Frecuentes de Prótesis
CREATE TABLE IF NOT EXISTS faq_protesis (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pregunta VARCHAR(300) NOT NULL,
    respuesta TEXT NOT NULL,
    categoria ENUM('general', 'cuidados', 'ajustes', 'dolor', 'actividades', 'mantenimiento') NOT NULL,
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Actualizar tabla de dispositivos_paciente si no tiene nivel_k
ALTER TABLE dispositivos_paciente
ADD COLUMN IF NOT EXISTS nivel_k VARCHAR(5) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS tipo_protesis_id INT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS componentes_actuales JSON DEFAULT NULL,
ADD COLUMN IF NOT EXISTS fecha_evaluacion_k DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS objetivos_rehabilitacion TEXT DEFAULT NULL;

-- =====================================================
-- INSERTAR DATOS: NIVELES K
-- =====================================================

INSERT INTO niveles_k (nivel, nombre, descripcion, caracteristicas, actividades_permitidas, tipo_protesis_recomendada, imagen_url) VALUES

('K0', 'No Ambulatorio',
'El paciente no tiene la capacidad o el potencial para deambular o transferirse de manera segura con o sin asistencia. Una prótesis no mejora la calidad de vida o la movilidad.',
'["No puede caminar ni con asistencia", "Usa silla de ruedas permanentemente", "Puede necesitar prótesis cosmética", "Enfoque en transferencias seguras"]',
'["Transferencias asistidas", "Actividades sedentarias", "Terapia ocupacional adaptada"]',
'["Prótesis cosmética (opcional)", "No se recomienda prótesis funcional"]',
'/images/niveles/k0.png'),

('K1', 'Ambulador de Interiores',
'El paciente tiene la capacidad o potencial de usar una prótesis para transferencias o para deambulación en superficies planas a un ritmo fijo. Es un caminador ilimitado en el hogar o ambulador limitado en la comunidad.',
'["Camina en superficies planas y uniformes", "Velocidad de marcha fija y lenta", "Principalmente en interiores", "Puede necesitar ayudas como bastón o andadera", "Buen candidato para rehabilitación básica"]',
'["Caminar en casa", "Transferencias independientes", "Actividades de la vida diaria en el hogar", "Caminatas cortas en exteriores controlados"]',
'["Pie SACH (Solid Ankle Cushion Heel)", "Pie de eje simple", "Rodilla con bloqueo manual (transfemoral)", "Socket de contacto total"]',
'/images/niveles/k1.png'),

('K2', 'Ambulador Comunitario Limitado',
'El paciente tiene la capacidad o potencial para deambular con la habilidad de atravesar barreras ambientales de bajo nivel como bordillos, escaleras o superficies irregulares.',
'["Camina en exteriores con precaución", "Puede subir escaleras con baranda", "Supera obstáculos pequeños", "Velocidad variable limitada", "Camina distancias moderadas"]',
'["Caminatas en la comunidad", "Subir y bajar escaleras", "Caminar en superficies irregulares", "Compras y mandados", "Trabajo sedentario o de pie limitado"]',
'["Pie de respuesta dinámica básica", "Pie multiaxial", "Rodilla policéntrica", "Rodilla con control de fricción", "Sistema de suspensión con pin o vacío"]',
'/images/niveles/k2.png'),

('K3', 'Ambulador Comunitario Ilimitado',
'El paciente tiene la capacidad o potencial para deambulación con cadencia variable. Es un caminador comunitario típico con la habilidad de atravesar la mayoría de las barreras ambientales y puede tener actividad vocacional, terapéutica o de ejercicio.',
'["Camina a diferentes velocidades", "Supera la mayoría de obstáculos", "Puede correr distancias cortas", "Participa en actividades recreativas", "Alta demanda de la prótesis"]',
'["Caminatas largas", "Deportes recreativos", "Ciclismo", "Natación", "Trabajo activo", "Senderismo ligero", "Golf, boliche"]',
'["Pie de respuesta dinámica avanzada", "Pie de fibra de carbono", "Rodilla con microprocesador (opcional)", "Rodilla hidráulica", "Rodilla con control de fase de apoyo y balanceo"]',
'/images/niveles/k3.png'),

('K4', 'Ambulador de Alta Actividad',
'El paciente tiene la capacidad o potencial para la deambulación protésica que excede las habilidades de ambulación básica, exhibiendo alta demanda de impacto, estrés o niveles de energía. Típico de las demandas protésicas del niño activo, adulto atlético o trabajador muy activo.',
'["Atleta o muy activo físicamente", "Corre y salta", "Practica deportes de impacto", "Niños activos", "Trabajos de alta demanda física"]',
'["Correr y trotar", "Deportes de impacto", "Baloncesto, fútbol, tenis", "Escalada", "Esquí", "Trabajo físicamente demandante", "Competencias deportivas"]',
'["Pie de carrera/running", "Pie de alto rendimiento deportivo", "Rodilla con microprocesador", "Rodilla deportiva especializada", "Componentes de titanio o fibra de carbono"]',
'/images/niveles/k4.png');

-- =====================================================
-- INSERTAR DATOS: TIPOS DE PRÓTESIS
-- =====================================================

INSERT INTO tipos_protesis (categoria, nombre, descripcion, componentes, nivel_k_minimo, ventajas, desventajas, cuidados_especificos) VALUES

-- PRÓTESIS TRANSTIBIADES (Debajo de la rodilla)
('transtibial', 'Prótesis Transtibial Endoesquelética',
'Prótesis para amputaciones debajo de la rodilla con estructura interna tubular cubierta por espuma cosmética. Es el tipo más común y versátil.',
'["Socket de contacto total", "Liner de silicona o gel", "Sistema de suspensión (pin, vacío o correa)", "Pilón/tubo", "Pie protésico", "Cubierta cosmética"]',
'K1',
'["Más ligera que exoesquelética", "Fácil de ajustar", "Apariencia natural", "Múltiples opciones de pie", "Buena para todas las actividades"]',
'["La cubierta cosmética puede dañarse", "Requiere mantenimiento del liner", "Costo moderado a alto"]',
'["Limpiar el liner diariamente con alcohol isopropílico", "Revisar el pin de suspensión semanalmente", "Inspeccionar el socket por grietas", "Cambiar liner cada 6-12 meses"]'),

('transtibial', 'Prótesis Transtibial con Pie SACH',
'Prótesis básica con pie de talón amortiguado sin articulación. Ideal para usuarios K1 que necesitan estabilidad máxima.',
'["Socket PTB o TSB", "Liner suave", "Suspensión con correa supracondílea", "Pie SACH"]',
'K0',
'["Muy estable", "Bajo mantenimiento", "Económica", "Durable", "Ideal para principiantes"]',
'["Sin respuesta dinámica", "Marcha menos natural", "No apta para terrenos irregulares"]',
'["Revisar talón del pie por desgaste", "Limpiar socket semanalmente", "Verificar correas de suspensión"]'),

('transtibial', 'Prótesis Transtibial con Pie de Fibra de Carbono',
'Prótesis de alto rendimiento con pie que almacena y devuelve energía. Ideal para usuarios activos K3-K4.',
'["Socket de fibra de carbono", "Liner con matriz de gel", "Sistema de vacío elevado", "Pie de respuesta dinámica", "Adaptador de titanio"]',
'K3',
'["Excelente retorno de energía", "Muy ligera", "Ideal para correr", "Marcha natural y eficiente", "Durable"]',
'["Costo elevado", "Requiere buen control del muñón", "No recomendada para K1-K2"]',
'["Inspeccionar fibra de carbono por delaminación", "Mantener sistema de vacío", "Revisar adaptadores por desgaste"]'),

-- PRÓTESIS TRANSFEMORALES (Arriba de la rodilla)
('transfemoral', 'Prótesis Transfemoral con Rodilla Mecánica',
'Prótesis para amputaciones por encima de la rodilla con sistema de rodilla mecánico de fricción o policéntrico.',
'["Socket cuadrilateral o MAS", "Liner transfemoral", "Sistema de suspensión (cinturón silesiano o vacío)", "Rodilla policéntrica o de fricción", "Pilón", "Pie protésico"]',
'K1',
'["Más económica que rodilla computarizada", "Mecánicamente simple", "Fácil mantenimiento", "Buena estabilidad"]',
'["Marcha menos natural", "Mayor gasto energético", "Control limitado de velocidad", "Riesgo de caídas en pendientes"]',
'["Lubricar rodilla cada 3 meses", "Revisar bloqueo de seguridad diariamente", "Inspeccionar sistema de suspensión", "Limpiar eje de rodilla"]'),

('transfemoral', 'Prótesis Transfemoral con Rodilla Microprocesador',
'Prótesis avanzada con rodilla controlada por microprocesador que ajusta automáticamente la resistencia según la velocidad y terreno.',
'["Socket de contención isquiática", "Liner con pin o vacío", "Rodilla con microprocesador (C-Leg, Genium, Rheo)", "Adaptadores de titanio", "Pie de respuesta dinámica", "Batería recargable"]',
'K2',
'["Marcha muy natural", "Seguridad en escaleras y rampas", "Menor gasto energético", "Ajuste automático de velocidad", "Reducción de caídas"]',
'["Costo muy elevado", "Requiere carga de batería", "Mantenimiento especializado", "No sumergible en agua"]',
'["Cargar batería diariamente", "Actualizaciones de software periódicas", "No exponer a agua", "Revisión técnica cada 6 meses"]'),

('transfemoral', 'Prótesis Transfemoral Deportiva',
'Prótesis especializada para actividades deportivas y de alto impacto con componentes de alto rendimiento.',
'["Socket deportivo de fibra de carbono", "Liner de alto rendimiento", "Rodilla deportiva o running", "Pie de carrera (blade runner)", "Sistema de vacío activo"]',
'K4',
'["Máximo rendimiento deportivo", "Muy ligera", "Alta respuesta de energía", "Diseñada para impacto"]',
'["Solo para deporte (no uso diario)", "Costo muy elevado", "Requiere entrenamiento específico"]',
'["Inspeccionar blade por grietas después de cada uso", "No usar en superficies abrasivas", "Almacenar en lugar seco"]'),

-- DESARTICULACIÓN DE RODILLA
('desarticulacion_rodilla', 'Prótesis de Desarticulación de Rodilla',
'Prótesis para amputaciones a nivel de la articulación de la rodilla. Permite apoyo directo en el extremo del muñón.',
'["Socket de contacto terminal", "Sistema de suspensión por contorno", "Rodilla externa especializada", "Pilón", "Pie protésico"]',
'K1',
'["Apoyo terminal completo", "Excelente propiocepción", "Suspensión natural por forma del muñón", "Menor atrofia muscular"]',
'["Centro de rodilla más bajo que pierna sana", "Apariencia cosmética comprometida cuando sentado", "Opciones de rodilla limitadas"]',
'["Cuidado especial de la piel del extremo del muñón", "Revisar ajuste del socket frecuentemente", "Proteger rodilla de golpes"]'),

-- PIE PARCIAL
('parcial_pie', 'Prótesis de Pie Parcial (Chopart/Lisfranc)',
'Prótesis para amputaciones parciales del pie a nivel de las articulaciones de Chopart o Lisfranc.',
'["Socket tipo zapatilla", "Relleno de silicona", "Placa de fibra de carbono (opcional)", "Cubierta cosmética"]',
'K1',
'["Conserva tobillo natural", "Marcha más natural", "Menor gasto energético", "Fácil de ocultar"]',
'["Control de tobillo limitado", "Puede causar contractura del tendón de Aquiles", "Requiere calzado especial"]',
'["Usar calzado con buen soporte", "Estirar tendón de Aquiles diariamente", "Revisar piel por presión"]');

-- =====================================================
-- INSERTAR DATOS: COMPONENTES DE PRÓTESIS
-- =====================================================

INSERT INTO componentes_protesis (tipo_protesis_id, nombre, categoria, descripcion, cuidados, vida_util_meses, senales_desgaste) VALUES

-- Componentes generales
(1, 'Liner de Silicona', 'liner',
'Funda de silicona que se coloca directamente sobre el muñón, proporcionando amortiguación y suspensión.',
'Lavar diariamente con jabón neutro y agua tibia. Secar completamente al aire. No usar secadora. Aplicar talco libre de perfume si es necesario. Voltear al revés para secar.',
12,
'["Pérdida de elasticidad", "Grietas o rasgaduras", "Olor persistente después de lavar", "Adelgazamiento del material", "Pin flojo o dañado"]'),

(1, 'Socket de Contacto Total', 'socket',
'Receptáculo rígido o semirrígido que aloja el muñón y conecta con el resto de la prótesis.',
'Limpiar interior con paño húmedo y jabón antibacterial semanalmente. Secar completamente. Inspeccionar por grietas o bordes ásperos. Reportar cualquier punto de presión.',
36,
'["Grietas visibles", "Bordes ásperos o astillados", "Cambio en el ajuste", "Decoloración", "Olor persistente"]'),

(1, 'Sistema de Pin/Lanzadera', 'sistema_suspension',
'Mecanismo de suspensión que usa un pin en el extremo del liner que se engancha en el socket.',
'Lubricar mecanismo de bloqueo mensualmente. Verificar que el pin esté recto y sin daños. Probar mecanismo de liberación diariamente. Limpiar con paño seco.',
24,
'["Pin doblado o desgastado", "Mecanismo de liberación difícil", "Ruido al caminar", "Pin no engancha bien"]'),

(1, 'Pie SACH', 'pie',
'Pie de talón amortiguado con tobillo sólido. Simple, duradero y de bajo mantenimiento.',
'Inspeccionar talón por desgaste cada mes. Verificar que la cubierta cosmética no tenga roturas. Evitar exposición prolongada al calor.',
24,
'["Talón muy comprimido", "Cubierta agrietada", "Pie rígido al flexionar", "Ruidos al caminar"]'),

(3, 'Pie de Fibra de Carbono', 'pie',
'Pie de alto rendimiento que almacena y devuelve energía con cada paso, fabricado en fibra de carbono.',
'Inspeccionar por delaminación o grietas después de actividad intensa. Limpiar con paño húmedo. No exponer a químicos fuertes. Verificar adaptador.',
36,
'["Delaminación de capas", "Grietas en la quilla", "Pérdida de respuesta", "Ruidos crujientes", "Deformación visible"]'),

(4, 'Rodilla Policéntrica', 'rodilla',
'Rodilla mecánica con múltiples ejes de rotación que proporciona estabilidad inherente.',
'Lubricar ejes cada 2-3 meses. Verificar tornillos de ajuste. Limpiar con paño seco. Ajustar fricción según indicación del protesista.',
48,
'["Ruidos excesivos", "Movimiento errático", "Dificultad para flexionar", "Tornillos flojos"]'),

(5, 'Rodilla con Microprocesador', 'rodilla',
'Rodilla computarizada que ajusta automáticamente la resistencia mediante sensores y actuadores.',
'Cargar batería cada noche. No sumergir en agua. Actualizar software según indicaciones. Revisión técnica cada 6 meses obligatoria.',
60,
'["Batería no mantiene carga", "Mensajes de error", "Movimiento no responde", "Ruidos electrónicos anormales"]');

-- =====================================================
-- INSERTAR DATOS: GUÍAS DE CUIDADO
-- =====================================================

INSERT INTO guias_cuidado_protesis (titulo, categoria, contenido, pasos, tips, advertencias, nivel_k_aplicable, orden) VALUES

-- CUIDADO DEL MUÑÓN
('Cuidado Diario del Muñón', 'cuidado_munon',
'El cuidado adecuado del muñón es la base para un uso exitoso de la prótesis. Un muñón sano permite mayor comodidad y mejor ajuste del socket.',
'["Lavar el muñón cada noche con agua tibia y jabón neutro", "Enjuagar completamente para eliminar residuos de jabón", "Secar con palmaditas suaves, nunca frotar", "Inspeccionar toda la superficie en busca de enrojecimiento, ampollas o heridas", "Aplicar crema hidratante sin fragancia por la noche (nunca en la mañana)", "Permitir que la piel respire durante la noche sin vendajes apretados", "Masajear suavemente para mejorar la circulación"]',
'["El mejor momento para hidratar es después del baño nocturno", "Usa un espejo para ver todas las áreas del muñón", "Mantén las uñas de los dedos cortas para evitar rasguños", "El muñón puede cambiar de volumen durante el día - es normal"]',
'["Nunca apliques crema antes de colocar la prótesis - reduce la suspensión", "No uses productos con alcohol que resequen la piel", "Si notas cambios de color persistentes, consulta a tu médico", "Las heridas abiertas son contraindicación para usar la prótesis"]',
'["K0", "K1", "K2", "K3", "K4"]',
1),

('Manejo del Volumen del Muñón', 'cuidado_munon',
'El volumen del muñón fluctúa naturalmente durante el día y con cambios en el peso corporal. Aprender a manejarlo es clave para un buen ajuste.',
'["Usa calcetines protésicos para ajustar el volumen", "Añade calcetines si el socket se siente flojo", "Quita calcetines si hay demasiada presión", "Lleva registro de cuántos calcetines usas normalmente", "Notifica a tu protesista si el patrón cambia significativamente"]',
'["El muñón suele estar más hinchado en la mañana", "El calor aumenta el volumen, el frío lo reduce", "El ejercicio puede reducir temporalmente el volumen", "Mantén calcetines de diferentes grosores disponibles"]',
'["Un ajuste muy apretado puede causar problemas circulatorios", "Un ajuste muy flojo causa inestabilidad y ampollas", "Cambios drásticos de volumen pueden indicar problemas médicos"]',
'["K1", "K2", "K3", "K4"]',
2),

('Preparación del Muñón para la Prótesis', 'cuidado_munon',
'Una correcta preparación matutina asegura comodidad durante todo el día y previene problemas de piel.',
'["Levántate y permite que el muñón se estabilice 10-15 minutos", "Limpia el muñón con un paño húmedo si es necesario", "Seca completamente - la humedad causa irritación", "Inspecciona la piel en busca de problemas", "Aplica talco sin fragancia si tu piel es muy húmeda", "Coloca el liner con cuidado, eliminando arrugas", "Verifica que no haya pliegues de piel atrapados"]',
'["Prepara todo lo necesario la noche anterior", "Establece una rutina consistente cada mañana", "Si usas antitranspirante, aplícalo 30 minutos antes del liner"]',
'["Nunca uses la prótesis sobre piel mojada", "Las arrugas en el liner causan ampollas", "Si hay una herida abierta, no uses la prótesis sin consultar"]',
'["K1", "K2", "K3", "K4"]',
3),

-- LIMPIEZA DE LA PRÓTESIS
('Limpieza del Liner', 'limpieza_protesis',
'El liner está en contacto directo con tu piel y acumula sudor, células muertas y bacterias. Limpiarlo diariamente es esencial.',
'["Retira el liner volteándolo del revés", "Lava con agua tibia y jabón neutro o solución especial para liner", "Frota suavemente toda la superficie interior y exterior", "Enjuaga completamente hasta que no quede jabón", "Sacude el exceso de agua", "Deja secar al aire, volteado, en un lugar ventilado", "No uses secadora ni expongas al sol directo", "Voltea al derecho solo cuando esté completamente seco"]',
'["Ten dos liners para alternar mientras uno seca", "El jabón para bebé es una buena opción económica", "Existen sprays antibacteriales específicos para liners", "El liner debe estar 100% seco antes de usarlo"]',
'["Un liner húmedo causa hongos e irritación severa", "No uses alcohol, blanqueador o solventes", "No lo seques con calor - daña el material", "Reemplaza el liner si el olor persiste después de lavar"]',
'["K1", "K2", "K3", "K4"]',
4),

('Limpieza del Socket', 'limpieza_protesis',
'El socket debe mantenerse limpio para prevenir irritación de la piel y malos olores.',
'["Limpia el interior del socket diariamente con un paño húmedo", "Usa jabón antibacterial una vez por semana", "Seca completamente con un paño limpio", "Inspecciona por grietas, bordes ásperos o daños", "Limpia el exterior con paño húmedo según necesidad", "No sumerjas el socket en agua si tiene componentes electrónicos"]',
'["Limpia el socket por la noche para que seque durante la noche", "El vinagre diluido ayuda a eliminar olores", "Un cepillo de dientes suave ayuda a limpiar rincones"]',
'["No uses químicos abrasivos que dañen el material", "Reporta cualquier grieta o daño a tu protesista", "La humedad atrapada causa crecimiento bacteriano"]',
'["K1", "K2", "K3", "K4"]',
5),

('Mantenimiento de Componentes Mecánicos', 'mantenimiento',
'Los componentes mecánicos de la prótesis requieren mantenimiento regular para funcionar correctamente.',
'["Inspecciona visualmente todos los componentes semanalmente", "Verifica que los tornillos estén apretados", "Lubrica las partes móviles según las indicaciones del fabricante", "Limpia el polvo y suciedad de las articulaciones", "Revisa el desgaste de las cubiertas cosméticas", "Programa revisiones con tu protesista cada 3-6 meses"]',
'["Usa solo los lubricantes recomendados por el fabricante", "Mantén un kit básico de herramientas Allen", "Lleva un registro de mantenimiento"]',
'["No intentes reparaciones complejas tú mismo", "Los ruidos nuevos o inusuales requieren revisión profesional", "Los componentes electrónicos requieren técnicos certificados"]',
'["K1", "K2", "K3", "K4"]',
6),

-- COLOCACIÓN
('Colocación Correcta de Prótesis Transtibial', 'colocacion',
'Una colocación correcta es fundamental para la comodidad, función y seguridad durante el día.',
'["Siéntate en una superficie estable con el muñón relajado", "Coloca el liner desenrollándolo suavemente sobre el muñón", "Asegúrate de que no haya arrugas ni burbujas de aire", "Verifica que el pin esté alineado con el centro", "Inserta el muñón en el socket empujando hacia abajo", "Escucha los clicks del pin enganchándose", "Ponte de pie y verifica el ajuste", "Da unos pasos para confirmar que todo está correcto"]',
'["Practica la colocación sentado antes de hacerlo de pie", "Algunos usuarios prefieren aplicar talco al liner", "Cuenta los clicks del pin para verificar profundidad"]',
'["Un liner con arrugas causa ampollas", "No fuerces la inserción si hay resistencia anormal", "Si el pin no engancha, retira y vuelve a intentar"]',
'["K1", "K2", "K3", "K4"]',
7),

('Colocación de Prótesis Transfemoral', 'colocacion',
'La colocación de una prótesis arriba de la rodilla requiere técnica adicional por el peso y tamaño.',
'["Siéntate en una silla estable o al borde de la cama", "Coloca el liner hasta cubrir completamente el muñón", "Elimina el aire del liner usando la válvula o técnica de expulsión", "Con la rodilla protésica bloqueada, inserta el muñón", "Usa técnica de empuje o método de succión según tu sistema", "Activa el sistema de vacío si aplica", "Desbloquea la rodilla y ponte de pie con apoyo", "Verifica estabilidad antes de soltar el apoyo"]',
'["Practica primero con supervisión de tu protesista", "El método pull-sock facilita la inserción inicial", "Mantén la rodilla bloqueada hasta estar de pie seguro"]',
'["Nunca camines con aire atrapado en el socket", "Verifica siempre que el sistema de suspensión esté activo", "La pérdida de suspensión durante la marcha es peligrosa"]',
'["K1", "K2", "K3", "K4"]',
8),

-- SEÑALES DE ALERTA
('Señales de Alerta y Cuándo Consultar', 'emergencias',
'Reconocer los signos de problemas te permite actuar rápidamente y prevenir complicaciones mayores.',
'["Observa tu muñón diariamente en busca de cambios", "Documenta con fotos cualquier problema para mostrar a tu médico", "No ignores el dolor - siempre tiene una causa", "Mantén comunicación regular con tu equipo de rehabilitación", "Conoce los números de emergencia de tu clínica protésica"]',
'["Un diario de síntomas ayuda a identificar patrones", "Las fotos con buena luz son útiles para consultas remotas", "Muchos problemas tienen solución simple si se detectan temprano"]',
'["El dolor persistente NO es normal - siempre consulta", "Las heridas que no sanan en 1 semana requieren atención médica", "Los cambios de color (azul, negro, blanco) son emergencias"]',
'["K0", "K1", "K2", "K3", "K4"]',
9),

-- EJERCICIOS
('Ejercicios de Fortalecimiento del Muñón', 'ejercicios',
'Mantener la fuerza muscular del muñón mejora el control de la prótesis y reduce la fatiga.',
'["Extensiones de cadera acostado boca arriba - 3 series de 10", "Abducciones de cadera acostado de lado - 3 series de 10", "Elevaciones de pierna recta - 3 series de 10", "Apretones isométricos contra resistencia - mantener 10 segundos", "Caminar con la prótesis en diferentes superficies", "Ejercicios de equilibrio en un solo pie (con apoyo)"]',
'["Empieza suave y aumenta gradualmente", "La consistencia es más importante que la intensidad", "Consulta con tu fisioterapeuta para un programa personalizado"]',
'["El dolor agudo durante el ejercicio indica que debes parar", "No hagas ejercicio si el muñón tiene heridas abiertas", "El exceso de ejercicio puede causar inflamación"]',
'["K1", "K2", "K3", "K4"]',
10),

('Ejercicios de Equilibrio y Propiocepción', 'ejercicios',
'El equilibrio es fundamental para caminar con seguridad y prevenir caídas.',
'["De pie con apoyo, transfiere peso de una pierna a otra", "Reduce gradualmente el apoyo de manos", "Practica pararte solo sobre la pierna protésica (con apoyo cerca)", "Camina en línea recta imaginaria", "Practica girar en ambas direcciones", "Camina hacia atrás con supervisión", "Practica subir y bajar un escalón"]',
'["Siempre ten un punto de apoyo cerca al inicio", "Practica descalzo de la pierna sana para mayor feedback", "El espejo ayuda a corregir la postura"]',
'["Las caídas son comunes al inicio - no te desanimes", "Nunca practiques solo actividades nuevas de alto riesgo", "Detente si sientes mareo o inestabilidad excesiva"]',
'["K1", "K2", "K3", "K4"]',
11);

-- =====================================================
-- INSERTAR DATOS: PREGUNTAS FRECUENTES
-- =====================================================

INSERT INTO faq_protesis (pregunta, respuesta, categoria, orden) VALUES

('¿Cuántas horas al día debo usar mi prótesis?',
'Al inicio, usa la prótesis por períodos cortos (1-2 horas) y aumenta gradualmente. Con el tiempo, la mayoría de usuarios la usan durante todas las horas de vigilia (10-16 horas). Siempre retírala para dormir para permitir que la piel del muñón descanse y respire.',
'general', 1),

('¿Puedo bañarme o nadar con mi prótesis?',
'Depende del tipo de prótesis. Las prótesis mecánicas básicas pueden mojarse pero deben secarse completamente. Las prótesis con componentes electrónicos (rodillas con microprocesador) NO deben sumergirse en agua. Existen prótesis especiales para natación. Consulta con tu protesista.',
'general', 2),

('¿Con qué frecuencia debo reemplazar mi prótesis?',
'La vida útil varía según el componente: los liners duran 6-12 meses, los sockets 2-3 años, y los componentes mecánicos 3-5 años. Sin embargo, cualquier cambio significativo en tu peso, condición del muñón o nivel de actividad puede requerir ajustes o reemplazos antes.',
'mantenimiento', 3),

('¿Es normal sentir dolor con la prótesis?',
'Las molestias leves durante la adaptación inicial son normales, pero el dolor persistente NO es normal. El dolor indica un problema con el ajuste, la alineación o la condición del muñón. No ignores el dolor - consulta con tu protesista para hacer los ajustes necesarios.',
'dolor', 4),

('¿Qué hago si mi muñón se hincha o cambia de tamaño?',
'Los cambios de volumen son normales durante el día. Usa calcetines protésicos para ajustar. Si el cambio es persistente o significativo, puede indicar cambio de peso, retención de líquidos o problemas médicos. Consulta con tu médico si los cambios son drásticos.',
'ajustes', 5),

('¿Puedo hacer ejercicio o deporte con mi prótesis?',
'¡Sí! Con la prótesis adecuada y entrenamiento apropiado, puedes hacer muchas actividades. Tu nivel K determina qué actividades son seguras. Algunas actividades requieren prótesis especializadas. Consulta con tu equipo de rehabilitación sobre tus metas deportivas.',
'actividades', 6),

('¿Qué hago si aparece una ampolla o herida en el muñón?',
'Detén el uso de la prótesis inmediatamente. Limpia la herida suavemente, aplica ungüento antibiótico y cubre con gasa. No uses la prótesis hasta que la herida haya sanado por completo. Si la herida no mejora en 2-3 días o muestra signos de infección, consulta a tu médico.',
'cuidados', 7),

('¿Cómo sé si mi prótesis necesita ajuste?',
'Señales de que necesitas ajuste: dolor nuevo o diferente, enrojecimiento persistente, sensación de que el socket está muy flojo o muy apretado, cambio en el patrón de marcha, ruidos nuevos, o necesitas usar muchos más/menos calcetines que antes.',
'ajustes', 8),

('¿Puedo conducir con mi prótesis?',
'Muchas personas con prótesis conducen exitosamente. Si la amputación afecta tu pierna derecha, puede ser necesario adaptar el vehículo con controles manuales o modificaciones. Consulta las regulaciones locales y considera clases de manejo especializadas.',
'actividades', 9),

('¿Qué diferencia hay entre una prótesis básica y una computarizada?',
'Las prótesis básicas (mecánicas) usan sistemas de fricción o hidráulicos pasivos. Las computarizadas tienen microprocesadores que ajustan automáticamente la resistencia según la velocidad y el terreno, ofreciendo una marcha más natural y mayor seguridad, especialmente en escaleras y pendientes.',
'general', 10),

('¿Cuánto tiempo toma adaptarse a una nueva prótesis?',
'La adaptación inicial toma generalmente 3-6 meses para usuarios nuevos. Los cambios de prótesis existentes pueden tomar semanas. La rehabilitación incluye fortalecimiento, entrenamiento de marcha y adaptación progresiva. La paciencia y consistencia son clave.',
'general', 11),

('¿Qué es el nivel K y por qué es importante?',
'El nivel K (K0-K4) es una clasificación de tu potencial funcional de movilidad. Determina qué tipo de componentes protésicos son apropiados para ti y están cubiertos por seguros. Va desde K0 (no ambulatorio) hasta K4 (atleta/muy activo). Tu nivel puede cambiar con rehabilitación.',
'general', 12);

-- =====================================================
-- INSERTAR VIDEOS EDUCATIVOS
-- =====================================================

INSERT INTO videos_educativos_protesis (titulo, descripcion, categoria, url_video, duracion_minutos, nivel_k_aplicable, orden) VALUES

('Cómo colocar correctamente tu prótesis transtibial',
'Video paso a paso mostrando la técnica correcta de colocación del liner y socket para prótesis debajo de la rodilla.',
'colocacion', 'https://www.youtube.com/embed/example1', 8,
'["K1", "K2", "K3", "K4"]', 1),

('Cuidado diario del muñón',
'Rutina completa de limpieza, inspección e hidratación del muñón para prevenir problemas de piel.',
'cuidados', 'https://www.youtube.com/embed/example2', 6,
'["K1", "K2", "K3", "K4"]', 2),

('Ejercicios de fortalecimiento para amputados',
'Serie de ejercicios para fortalecer los músculos del muñón y mejorar el control de la prótesis.',
'ejercicios', 'https://www.youtube.com/embed/example3', 15,
'["K1", "K2", "K3", "K4"]', 3),

('Mantenimiento básico de tu prótesis',
'Cómo limpiar, inspeccionar y mantener tu prótesis para prolongar su vida útil.',
'mantenimiento', 'https://www.youtube.com/embed/example4', 10,
'["K1", "K2", "K3", "K4"]', 4),

('Entrenamiento de marcha con prótesis transfemoral',
'Técnicas para mejorar tu patrón de marcha con prótesis arriba de la rodilla.',
'ejercicios', 'https://www.youtube.com/embed/example5', 12,
'["K1", "K2", "K3", "K4"]', 5),

('Historias de éxito: Volviendo a caminar',
'Testimonios inspiradores de pacientes que han recuperado su movilidad con prótesis.',
'testimonios', 'https://www.youtube.com/embed/example6', 20,
'["K0", "K1", "K2", "K3", "K4"]', 6);

-- =====================================================
-- ÍNDICES PARA MEJOR RENDIMIENTO
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_tipos_protesis_categoria ON tipos_protesis(categoria);
CREATE INDEX IF NOT EXISTS idx_guias_categoria ON guias_cuidado_protesis(categoria);
CREATE INDEX IF NOT EXISTS idx_faq_categoria ON faq_protesis(categoria);
CREATE INDEX IF NOT EXISTS idx_videos_categoria ON videos_educativos_protesis(categoria);