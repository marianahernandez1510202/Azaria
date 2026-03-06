// ============================================================
// Datos de Cuestionarios Psicométricos y Herramientas ACT
// Basado en Steven C. Hayes - "Una Mente Liberada" / "A Liberated Mind"
// ============================================================

// ===================== CUESTIONARIOS =====================

export const CUESTIONARIOS = [
  {
    id: 'AAQ2',
    nombre: 'AAQ-2',
    nombreCompleto: 'Cuestionario de Aceptación y Acción (AAQ-2)',
    descripcion: 'Mide tu flexibilidad psicológica general. Es el instrumento más utilizado en la investigación de flexibilidad psicológica.',
    instrucciones: 'Califica qué tan verdadera es cada afirmación para ti seleccionando un número.',
    tiempo: 5,
    escalaMin: 1,
    escalaMax: 7,
    etiquetaMin: 'Nunca verdadero',
    etiquetaMax: 'Siempre verdadero',
    etiquetas: ['Nunca verdadero', 'Muy rara vez', 'Rara vez', 'A veces', 'Frecuentemente', 'Casi siempre', 'Siempre verdadero'],
    tipo: 'sum',
    interpretacion: {
      rangos: [
        { min: 7, max: 23, nivel: 'normal', color: '#2E7D32', texto: 'Tu puntuación sugiere buena flexibilidad psicológica. Continúa practicando las habilidades de aceptación y compromiso.' },
        { min: 24, max: 28, nivel: 'elevado', color: '#F57F17', texto: 'Tu puntuación está en un rango que se asocia con síntomas de depresión o ansiedad. Considera profundizar en las herramientas ACT.' },
        { min: 29, max: 49, nivel: 'clinico', color: '#C62828', texto: 'Tu puntuación es elevada. Te recomendamos hablar con tu especialista sobre estrategias adicionales de apoyo.' }
      ],
      nota: 'Puntuaciones más altas indican menor flexibilidad. No te desanimes si tu puntuación es alta: estás en un proceso de cambio.'
    },
    preguntas: [
      'Mis experiencias y recuerdos dolorosos hacen que me sea difícil vivir la vida que querría.',
      'Tengo miedo de mis sentimientos.',
      'Me preocupa no ser capaz de controlar mis preocupaciones y sentimientos.',
      'Mis recuerdos dolorosos me impiden llevar una vida plena.',
      'Las emociones me causan problemas en mi vida.',
      'Parece que la mayoría de las personas manejan su vida mejor que yo.',
      'Mis preocupaciones interfieren en el camino de mi éxito.'
    ]
  },
  {
    id: 'AADQ',
    nombre: 'AADQ',
    nombreCompleto: 'Cuestionario de Aceptación y Acción en Diabetes (AADQ)',
    descripcion: 'Evalúa la aceptación y flexibilidad psicológica relacionada con el manejo de la diabetes.',
    instrucciones: 'Califica cada afirmación según qué tan frecuentemente te ocurre.',
    tiempo: 3,
    escalaMin: 1,
    escalaMax: 5,
    etiquetaMin: 'Nunca',
    etiquetaMax: 'Siempre',
    etiquetas: ['Nunca', 'Rara vez', 'A veces', 'Frecuentemente', 'Siempre'],
    tipo: 'sum',
    interpretacion: {
      rangos: [
        { min: 6, max: 14, nivel: 'bajo', color: '#2E7D32', texto: 'Buena aceptación de tu condición. Continúa con tus habilidades de manejo.' },
        { min: 15, max: 22, nivel: 'moderado', color: '#F57F17', texto: 'Nivel moderado de no-aceptación. Las herramientas ACT pueden ayudarte a mejorar tu relación con la diabetes.' },
        { min: 23, max: 30, nivel: 'alto', color: '#C62828', texto: 'Alto nivel de no-aceptación. Es importante trabajar en la aceptación para mejorar tu autocuidado.' }
      ],
      nota: 'Puntuaciones más altas indican mayor no-aceptación de la diabetes.'
    },
    preguntas: [
      'Trato de evitar los recordatorios de que tengo diabetes.',
      'No me cuido la diabetes porque me recuerda que la tengo.',
      'Cuando tengo un sentimiento o pensamiento perturbador sobre mi diabetes, trato de deshacerme de él.',
      'Evito tomar u olvido tomar mis medicamentos porque me recuerdan que tengo diabetes.',
      'A menudo me niego a mí mismo lo que la diabetes puede hacerle a mi cuerpo.',
      'Evito pensar en lo que la diabetes puede hacerme.'
    ]
  },
  {
    id: 'CANCER_AAQ',
    nombre: 'Cancer AAQ',
    nombreCompleto: 'Cuestionario de Aceptación y Acción para Cáncer',
    descripcion: 'Evalúa la flexibilidad psicológica relacionada con la experiencia del cáncer.',
    instrucciones: 'Califica qué tan verdadera es cada afirmación para ti.',
    tiempo: 10,
    escalaMin: 1,
    escalaMax: 7,
    etiquetaMin: 'Nunca verdadero',
    etiquetaMax: 'Siempre verdadero',
    etiquetas: ['Nunca verdadero', 'Muy rara vez', 'Rara vez', 'A veces', 'Frecuentemente', 'Casi siempre', 'Siempre verdadero'],
    tipo: 'sum',
    interpretacion: {
      rangos: [
        { min: 18, max: 53, nivel: 'bajo', color: '#2E7D32', texto: 'Buen nivel de aceptación y flexibilidad respecto a tu experiencia con el cáncer.' },
        { min: 54, max: 89, nivel: 'moderado', color: '#F57F17', texto: 'Nivel moderado de inflexibilidad. Las herramientas ACT pueden ayudarte.' },
        { min: 90, max: 126, nivel: 'alto', color: '#C62828', texto: 'Alto nivel de inflexibilidad. Te recomendamos hablar con tu especialista.' }
      ],
      nota: 'Puntuaciones más altas indican mayor inflexibilidad psicológica respecto al cáncer.'
    },
    preguntas: [
      'Mis recuerdos y experiencias dolorosas con el cáncer dificultan que viva una vida que valoro.',
      'Tengo miedo de mis sentimientos sobre el cáncer.',
      'Me preocupa no ser capaz de controlar mis preocupaciones y sentimientos sobre el cáncer.',
      'Mis recuerdos dolorosos del cáncer me impiden llevar una vida plena.',
      'Las emociones sobre el cáncer causan problemas en mi vida.',
      'Parece que la mayoría de los sobrevivientes de cáncer manejan su vida mejor que yo.',
      'Las preocupaciones sobre el cáncer interfieren en mi éxito.',
      'Trato de evitar los recordatorios de mi cáncer.',
      'Tengo pensamientos y sentimientos sobre el cáncer que me causan angustia.',
      'Cuando tengo un sentimiento o pensamiento perturbador sobre mi cáncer, trato de deshacerme de él.',
      'Evito pensar en lo que el cáncer puede hacerme.',
      'No hago ejercicio regularmente porque me recuerda que tuve/tengo cáncer.',
      'Evito pensar en el cáncer porque alguien que conocía murió de cáncer.',
      'Evito pensar en el cáncer porque temo que regrese.',
      'Evito las citas médicas y pruebas relacionadas con el cáncer porque no quiero pensar en ello.',
      'Cuando me siento deprimido o ansioso por el cáncer, no puedo hacerme cargo de mis responsabilidades.',
      'Si pudiera eliminar mágicamente todas mis experiencias dolorosas del cáncer, lo haría.',
      'Evito tomar u olvido tomar mis medicamentos contra el cáncer porque me recuerdan que tengo cáncer.'
    ]
  },
  {
    id: 'VLQ',
    nombre: 'VLQ',
    nombreCompleto: 'Cuestionario de Valores de Vida (VLQ)',
    descripcion: 'Evalúa qué tan importante es cada área de tu vida y qué tan consistentes han sido tus acciones con tus valores.',
    instrucciones: 'Primero calificarás la importancia de cada área, luego la consistencia de tus acciones.',
    tiempo: 10,
    escalaMin: 1,
    escalaMax: 10,
    etiquetaMin: '1',
    etiquetaMax: '10',
    tipo: 'vlq',
    areas: [
      { id: 'familia', nombre: 'Familia', descripcion: 'Relaciones familiares (aparte de pareja e hijos)' },
      { id: 'pareja', nombre: 'Pareja', descripcion: 'Matrimonio, relación de pareja, relaciones íntimas' },
      { id: 'crianza', nombre: 'Crianza', descripcion: 'Ser padre/madre' },
      { id: 'social', nombre: 'Vida social', descripcion: 'Amistades y vida social' },
      { id: 'trabajo', nombre: 'Trabajo', descripcion: 'Empleo y carrera profesional' },
      { id: 'educacion', nombre: 'Educación', descripcion: 'Formación y aprendizaje' },
      { id: 'ocio', nombre: 'Ocio', descripcion: 'Recreación y diversión' },
      { id: 'espiritualidad', nombre: 'Espiritualidad', descripcion: 'Vida espiritual o religiosa' },
      { id: 'ciudadania', nombre: 'Participación ciudadana', descripcion: 'Comunidad y vida cívica' },
      { id: 'cuidado_fisico', nombre: 'Cuidado físico', descripcion: 'Dieta, ejercicio y sueño' },
      { id: 'medio_ambiente', nombre: 'Medio ambiente', descripcion: 'Cuidado del medio ambiente' },
      { id: 'arte', nombre: 'Arte y creatividad', descripcion: 'Expresión artística y estética' }
    ],
    interpretacion: {
      promedioPublico: 61,
      nota: 'Las áreas con alta importancia (9-10) y baja consistencia (6 o menos) son áreas prioritarias para trabajar. El promedio público es 61.'
    }
  }
];

// ===================== CATEGORÍAS ACT =====================

export const ACT_CATEGORIAS = [
  {
    id: 'yo',
    nombre: 'Yo (Self)',
    descripcion: 'Ejercicios para conectar con tu yo trascendente y observar tus historias personales desde una perspectiva más amplia.',
    icon: 'brain',
    color: '#6A1B9A'
  },
  {
    id: 'valores',
    nombre: 'Valores',
    descripcion: 'Herramientas para identificar, clarificar y actuar en línea con tus valores auténticos.',
    icon: 'compass',
    color: '#AD1457'
  },
  {
    id: 'defusion',
    nombre: 'Defusión',
    descripcion: 'Técnicas para crear distancia de pensamientos difíciles y verlos como lo que son: solo pensamientos.',
    icon: 'music',
    color: '#F57F17'
  },
  {
    id: 'presencia',
    nombre: 'Presencia',
    descripcion: 'Ejercicios de atención plena para estar más presente en el momento actual.',
    icon: 'eye',
    color: '#2E7D32'
  },
  {
    id: 'compromiso',
    nombre: 'Compromiso',
    descripcion: 'Herramientas para actuar de manera comprometida con tus valores, paso a paso.',
    icon: 'handshake',
    color: '#1976D2'
  },
  {
    id: 'aceptacion',
    nombre: 'Aceptación',
    descripcion: 'Ejercicios para abrirte a las experiencias difíciles sin luchar contra ellas.',
    icon: 'heart-handshake',
    color: '#00838F'
  }
];

// ===================== HERRAMIENTAS ACT =====================

export const ACT_HERRAMIENTAS = [
  // --- YO (SELF) ---
  {
    id: 'yo_atrapar_conciencia',
    categoriaId: 'yo',
    nombre: 'Atrapar al vuelo la conciencia',
    descripcion: 'Conecta con tu "yo, aquí, ahora" a través de una pregunta simple pero poderosa.',
    duracion: 5,
    tieneEscritura: false,
    pasos: [
      { texto: 'A lo largo de tu día, plantéate esta pregunta: "¿Quién se ha dado cuenta de eso?"', duracion: 15 },
      { texto: 'No dejes que la pregunta te lleve a una larga reflexión mental. Solo observa la experiencia y conecta con la conciencia durante un segundo.', duracion: 30 },
      { texto: 'Si tu mente empieza a contarte una historia sobre quién eres, usa la defusión: imagina que es un profesor pomposo dando cátedra.', duracion: 30 },
      { texto: 'El propósito es conectar con tu "yo, aquí, ahora" aunque solo sea un milisegundo. Con el tiempo, esta conexión se fortalecerá.', duracion: 20 },
      { texto: 'Programa recordatorios en tu móvil o establece una regla: cada vez que toques el teléfono, las llaves o la cartera, hazte la pregunta.', duracion: 15 }
    ]
  },
  {
    id: 'yo_reescribir_historia',
    categoriaId: 'yo',
    nombre: 'Reescribir la historia',
    descripcion: 'Escribe una historia sobre una dificultad y descubre que siempre hay múltiples versiones posibles.',
    duracion: 15,
    tieneEscritura: true,
    pasos: [
      { texto: 'Escribe unas 200 palabras sobre alguna dificultad psicológica actual. Describe parte de la historia y cómo interfiere contigo.', duracion: 300, tipoInput: 'textarea', placeholder: 'Escribe tu historia aquí...' },
      { texto: 'Ahora lee lo que escribiste. Identifica mentalmente las REACCIONES (pensamientos, emociones, recuerdos, sensaciones, impulsos) y los HECHOS EXTERNOS (situaciones, eventos).', duracion: 60 },
      { texto: 'El reto: reescribe la misma historia incluyendo las mismas reacciones y hechos, pero con un tema, significado o dirección completamente distinta. No tiene que ser mejor ni más feliz, solo diferente.', duracion: 300, tipoInput: 'textarea', placeholder: 'Reescribe tu historia con un significado diferente...' },
      { texto: 'Reflexiona: ¿Y si no hay una única historia verdadera? ¿Qué historia te ayudará a avanzar hacia donde quieres ir? ¿Quién prefieres que determine tu historia: tu Dictador Interior o tu yo trascendente?', duracion: 60 }
    ]
  },
  {
    id: 'yo_soy_no_soy',
    categoriaId: 'yo',
    nombre: 'Soy / No soy',
    descripcion: 'Explora tu identidad más allá de las etiquetas y conecta con un "yo" más profundo.',
    duracion: 10,
    tieneEscritura: true,
    pasos: [
      { texto: 'Completa estas frases con atributos psicológicos personales:\n1. "Soy ___" (cualidad positiva)\n2. "Soy ___" (cualidad positiva)\n3. "Soy ___" (atributo que temes o consideras negativo)', duracion: 120, tipoInput: 'tres_campos', placeholders: ['Soy... (positivo)', 'Soy... (positivo)', 'Soy... (negativo)'] },
      { texto: 'Para cada afirmación positiva pregúntate: ¿Eres así SIEMPRE? ¿En todas partes? ¿Con todo el mundo? ¿Sin excepción?', duracion: 60 },
      { texto: 'Para la afirmación negativa: ¿Es absolutamente cierta en todas las circunstancias? ¿Diría lo mismo alguien que te observara 24/7?', duracion: 60 },
      { texto: 'Ahora añade "o no" al final de cada frase. Por ejemplo: "Soy inteligente, o no". Lee cada frase lentamente y observa qué sucede. ¿Sientes que algo se abre?', duracion: 90 },
      { texto: 'Tacha mentalmente todo lo que escribiste después de "Soy". ¿Quién serías sin ese contenido? La palabra que aparece tres veces —"soy"— es quizá lo más cercano a tu yo profundo. Limitarte a SER.', duracion: 60 }
    ]
  },

  // --- VALORES ---
  {
    id: 'valores_secreto',
    categoriaId: 'valores',
    nombre: 'Tengo un secreto',
    descripcion: 'Realiza una acción basada en valores en el más absoluto secreto.',
    duracion: 15,
    tieneEscritura: true,
    pasos: [
      { texto: 'Elige un valor importante para ti. Piensa en una acción que manifieste ese valor.', duracion: 60 },
      { texto: 'Ingéniate una manera de llevar a cabo esa acción en el más absoluto secreto. Por ejemplo: hazle un favor a alguien sin que sepa que fuiste tú, haz una donación anónima, o muestra compasión por un desconocido.', duracion: 120 },
      { texto: 'Escribe durante 10 minutos sobre tus valores y cómo ha sido esta experiencia para ti. ¿Qué te sugiere sobre cómo incluir más acciones basadas en valores en tu vida cotidiana?', duracion: 600, tipoInput: 'textarea', placeholder: 'Escribe sobre tu experiencia con este ejercicio...' },
      { texto: 'Recuerda: no le cuentes a nadie lo que aprendiste. Se trata de hacer cosas importantes para ti SOLO porque son importantes para ti.', duracion: 30 }
    ]
  },
  {
    id: 'valores_por_escrito',
    categoriaId: 'valores',
    nombre: 'Poner los valores por escrito',
    descripcion: 'Escribe sobre tus valores auténticos respondiendo preguntas guía.',
    duracion: 15,
    tieneEscritura: true,
    pasos: [
      { texto: 'Elige un área de tu vida que sea importante para ti (familia, trabajo, salud, relaciones, creatividad, etc.).', duracion: 30 },
      { texto: 'Escribe durante 10 minutos respondiendo estas preguntas:\n\n• ¿Qué es lo que más me importa en esta área?\n• ¿Qué quiero hacer que refleje lo importante que es para mí?\n• ¿Cuándo ha sido este valor importante en mi vida?\n• ¿Qué he visto cuando otros han aplicado o no este valor?\n• ¿Qué puedo hacer para manifestar más este valor?\n• ¿Cuándo he violado este valor y he pagado un precio por ello?', duracion: 600, tipoInput: 'textarea', placeholder: 'Escribe libremente sobre tus valores...' },
      { texto: 'Relee lo que escribiste. Destila 2-3 acciones concretas que quieras realizar en esta área. Busca las cualidades que quieres que manifiesten tus acciones: genuina, afectuosa, compasiva, curiosa, honesta...', duracion: 120 }
    ]
  },
  {
    id: 'valores_escribir_historia',
    categoriaId: 'valores',
    nombre: 'Escribir tu historia',
    descripcion: 'Imagina y escribe sobre quién quieres ser en el próximo año.',
    duracion: 15,
    tieneEscritura: true,
    pasos: [
      { texto: 'Imagina que el próximo año será un momento clave que definirá quién eres.', duracion: 30 },
      { texto: 'Reflexiona: Si fueras a convertirte más plenamente en ti mismo durante este año, ¿cómo sería eso? ¿En qué aspectos querrías crecer? ¿Qué tipo de persona anhelas ser?', duracion: 60 },
      { texto: 'Si fueras a escribir el siguiente capítulo de tu vida, ¿cuál sería el tema?', duracion: 30 },
      { texto: 'Escribe durante 10 minutos sobre el próximo año y en quién esperas convertirte.', duracion: 600, tipoInput: 'textarea', placeholder: 'Escribe sobre tu próximo capítulo...' }
    ]
  },

  // --- DEFUSIÓN ---
  {
    id: 'defusion_cantalo',
    categoriaId: 'defusion',
    nombre: 'Cántalo',
    descripcion: 'Transforma un pensamiento difícil cantándolo con una melodía conocida.',
    duracion: 5,
    tieneEscritura: false,
    pasos: [
      { texto: 'Piensa en un pensamiento que te resulte molesto ahora mismo. Transfórmalo en una frase corta.', duracion: 30 },
      { texto: 'Elige una melodía conocida: "Cumpleaños feliz", una canción infantil, o cualquiera que te guste.', duracion: 15 },
      { texto: 'Ahora canta ese pensamiento al ritmo de la melodía. Hazlo en voz alta si estás solo, o mentalmente si hay gente cerca. Canta rápido. Canta despacio.', duracion: 90 },
      { texto: 'Prueba con distintas melodías. El "éxito" no es que el pensamiento desaparezca, sino que puedas verlo como lo que es: un pensamiento, cada vez con más claridad.', duracion: 60 }
    ]
  },
  {
    id: 'defusion_llevalo_contigo',
    categoriaId: 'defusion',
    nombre: 'Llévalo contigo',
    descripcion: 'Escribe un pensamiento difícil en un papel y llévalo contigo como compañero de viaje.',
    duracion: 5,
    tieneEscritura: true,
    pasos: [
      { texto: 'Piensa en un pensamiento doloroso o difícil que te acompaña frecuentemente.', duracion: 30 },
      { texto: 'Escríbelo en un pequeño trozo de papel (o aquí abajo).', duracion: 60, tipoInput: 'textarea', placeholder: 'Escribe tu pensamiento difícil...' },
      { texto: 'Sostenlo en alto y míralo como mirarías una página preciosa y frágil de un manuscrito antiguo. Esas palabras son un eco de tu historia.', duracion: 30 },
      { texto: 'Pregúntate: ¿Estás dispuesto a honrar esa historia decidiendo llevar ese pedazo de papel contigo? Si puedes decir que sí, guárdalo cuidadosamente en tu cartera o bolsillo.', duracion: 30 },
      { texto: 'Durante los próximos días, toca de vez en cuando el lugar donde lo guardas. Reconoce que te acompaña en tu viaje y transmítele que es bienvenido.', duracion: 30 }
    ]
  },
  {
    id: 'defusion_nombre_mente',
    categoriaId: 'defusion',
    nombre: 'Ponle nombre a tu mente',
    descripcion: 'Al darle nombre a tu mente, creas distancia entre tú y tus pensamientos.',
    duracion: 5,
    tieneEscritura: true,
    pasos: [
      { texto: 'Si tu mente tiene nombre, entonces es distinta a "ti". Cuando escuchas a alguien, puedes decidir si estás de acuerdo o no. La misma postura puedes adoptar con tu voz interior.', duracion: 30 },
      { texto: 'Elige un nombre para tu mente. Puede ser cualquiera: "George", "Señor Mente", "Doña Preocupación"... ¡el que quieras!', duracion: 60, tipoInput: 'texto', placeholder: '¿Cómo se llama tu mente?' },
      { texto: 'Ahora saluda a tu mente llamándola por su nuevo nombre, como si te la acabaran de presentar en una fiesta. Si hay gente cerca, hazlo mentalmente.', duracion: 30 },
      { texto: 'A partir de ahora, cuando notes un pensamiento crítico o difícil, puedes decir: "Gracias, [nombre], por compartir eso conmigo". Así creas distancia sin pelear con tu mente.', duracion: 30 }
    ]
  },

  // --- PRESENCIA ---
  {
    id: 'presencia_dentro_fuera',
    categoriaId: 'presencia',
    nombre: 'Dentro / Fuera',
    descripcion: 'Desarrolla la capacidad de ser consciente de tus experiencias internas mientras atiendes tareas externas.',
    duracion: 10,
    tieneEscritura: false,
    pasos: [
      { texto: 'Elige una tarea que estés realizando o que vayas a realizar (cuidar el jardín, lavar platos, caminar...).', duracion: 15 },
      { texto: 'Mientras realizas la tarea, dirige parte de tu atención a lo que sucede en el interior de tu cuerpo. ¿Dónde sientes sensaciones? Fíjate en los bordes.', duracion: 90 },
      { texto: '¿Cuál es la cualidad de esa sensación? ¿Fría/caliente? ¿Tensa/serena? ¿Pulsátil/constante? ¿Apretada/suelta? Recuerda seguir atendiendo a la tarea.', duracion: 90 },
      { texto: 'Ahora céntrate más en la tarea, sin dejar de ser consciente de la sensación. ¿Cómo se relacionan? ¿Cómo son tus emociones respecto a la tarea?', duracion: 90 },
      { texto: 'Permite que la conciencia de estas interconexiones surja espontáneamente. No intentes "diagnosticar". Es un ejercicio de foco atencional para estar más plenamente presente.', duracion: 60 }
    ]
  },
  {
    id: 'presencia_meditacion',
    categoriaId: 'presencia',
    nombre: 'Meditación sencilla',
    descripcion: 'La forma más sencilla de meditar: siéntate, respira, y devuelve la atención cuando divague.',
    duracion: 5,
    tieneEscritura: false,
    pasos: [
      { texto: 'Siéntate con la espalda erguida. Si estás incómodo en el suelo, usa una silla con los pies bien apoyados.', duracion: 15 },
      { texto: 'Entrecierra los ojos e inclina la mirada unos 45 grados. Desenfoca la vista, no fijes tu atención visual en ningún punto concreto.', duracion: 15 },
      { texto: 'Deja que tu mente se centre en tu respiración. Siente el aire entrando y saliendo.', duracion: 120 },
      { texto: 'Cada vez que detectes que tu mente divaga, libérala de la cadena de pensamientos y devuélvela suavemente a la respiración. Esto es normal y esperado.', duracion: 120 },
      { texto: 'Continúa durante unos minutos más. Cada vez que detectas la divagación y regresas, refuerzas tu musculatura atencional.', duracion: 120 }
    ]
  },
  {
    id: 'presencia_camara_lenta',
    categoriaId: 'presencia',
    nombre: 'Moverse en cámara lenta',
    descripcion: 'Realiza una actividad cotidiana a media velocidad para reconectar con el presente.',
    duracion: 5,
    tieneEscritura: false,
    pasos: [
      { texto: 'Elige una actividad cotidiana: ducharte, vestirte, desayunar, caminar, lavarte las manos...', duracion: 15 },
      { texto: 'Comienza la actividad a MEDIA VELOCIDAD. Muévete como en cámara lenta. Presta atención a cada movimiento.', duracion: 60 },
      { texto: 'Nota las sensaciones físicas con mayor riqueza. La textura, la temperatura, el peso de los objetos. Eres como un bebé descubriendo el mundo.', duracion: 60 },
      { texto: 'Notarás el impulso de moverte más rápido y quizá pensamientos como "Esto es tonto". Está bien. Cuando notas estos impulsos y continúas en cámara lenta, estás practicando aceptación y defusión.', duracion: 60 },
      { texto: 'Desafíate: 30 segundos en cámara lenta, luego 1 minuto, luego 3 minutos. Siempre que te quedes atrapado en tu cabeza, vuelve al aquí y ahora.', duracion: 30 }
    ]
  },

  // --- COMPROMISO ---
  {
    id: 'compromiso_porque_si',
    categoriaId: 'compromiso',
    nombre: 'Practica "Porque sí"',
    descripcion: 'Comprométete con acciones "solo porque sí", sin otra explicación.',
    duracion: 5,
    tieneEscritura: true,
    pasos: [
      { texto: 'A veces, la mente transforma un valor en otro garrote con el que golpearnos. Este ejercicio interrumpe esa tendencia.', duracion: 20 },
      { texto: 'Elige una acción pequeña para hacer "solo porque sí". Ejemplos:\n• No comer tu comida favorita durante una semana\n• Acostarte una hora antes\n• Llevar algo ligeramente inadecuado un día\n• Levantarte temprano sin razón', duracion: 60 },
      { texto: 'Escribe tu compromiso "porque sí":', duracion: 120, tipoInput: 'textarea', placeholder: 'Mi compromiso "porque sí" es...' },
      { texto: 'Cuando notes que tu mente dice "Debo cumplir porque soy buena persona" o "Si no cumplo, soy un fracaso", reconoce que esos son los sospechosos habituales: culpa, vergüenza, autocrítica. Tu compromiso es solo "porque sí".', duracion: 30 }
    ]
  },
  {
    id: 'compromiso_pequenos_cambios',
    categoriaId: 'compromiso',
    nombre: 'Pequeños cambios',
    descripcion: 'Da un paso pequeño pero significativo en la dirección que quieres.',
    duracion: 5,
    tieneEscritura: true,
    pasos: [
      { texto: 'Piensa en un área de tu vida donde quieras hacer un cambio. No tiene que ser enorme.', duracion: 30 },
      { texto: 'Elige el cambio más pequeño posible en esa dirección. Si quieres leer más, empieza con 15 minutos. Si quieres hacer ejercicio, empieza con 5 minutos de caminata.', duracion: 60 },
      { texto: 'Escribe tu pequeño cambio:', duracion: 120, tipoInput: 'textarea', placeholder: 'Mi pequeño cambio será...' },
      { texto: 'Da igual lo pequeño que sea el paso. Estás avanzando. Las vidas caen en patrones y pequeños cambios de dirección, al sumarse, dan lugar a un cambio importante a lo largo del tiempo.', duracion: 30 }
    ]
  },
  {
    id: 'compromiso_habitos_rutinas',
    categoriaId: 'compromiso',
    nombre: 'Hábitos en rutinas',
    descripcion: 'Incluye hábitos nuevos en actividades que ya practicas con regularidad.',
    duracion: 5,
    tieneEscritura: true,
    pasos: [
      { texto: 'Es mucho más fácil combinar hábitos que sustituirlos de golpe. Piensa en una rutina que ya practiques: tomar café por la mañana, ir al trabajo, cepillarte los dientes...', duracion: 30 },
      { texto: 'Ahora piensa en un hábito nuevo que quieras incorporar: comer más fruta, meditar, leer, hacer ejercicio...', duracion: 30 },
      { texto: 'Conecta el hábito nuevo con la rutina existente. Ejemplo: "Mientras preparo el café, comeré una manzana" o "Después de cepillarme los dientes, meditaré 2 minutos".', duracion: 60 },
      { texto: 'Escribe tu combinación de hábitos:', duracion: 120, tipoInput: 'textarea', placeholder: 'Cuando yo [rutina existente], haré [hábito nuevo]...' }
    ]
  },

  // --- ACEPTACIÓN ---
  {
    id: 'aceptacion_di_que_si',
    categoriaId: 'aceptacion',
    nombre: 'Di que "sí"',
    descripcion: 'Practica adoptar una postura de aceptación versus resistencia ante lo que te rodea.',
    duracion: 10,
    tieneEscritura: false,
    pasos: [
      { texto: 'Mira a tu alrededor. Elige un objeto y adopta mentalmente una postura de "NO": "Eso no está bien. Ha de cambiar. Es inaceptable." Hazlo con varios objetos durante un par de minutos.', duracion: 120 },
      { texto: 'Ahora repite el proceso, pero desde una postura de "SÍ": "Está bien. Es así y no tiene por qué cambiar. Puedo dejar que siga siendo así." Hazlo durante un par de minutos.', duracion: 120 },
      { texto: 'Detente y percibe lo distinto que parece el mundo desde un "sí" y desde un "no".', duracion: 30 },
      { texto: 'Para subir el nivel: con el "SÍ", adopta una postura abierta (erguido, palmas hacia arriba, brazos extendidos, cabeza alzada). Con el "NO", postura cerrada (brazos bajados, cabeza inclinada, puños tensos).', duracion: 120 },
      { texto: 'Con el tiempo, notarás que a lo largo del día adoptas posturas de "no" sin proponértelo. Identificar esos momentos te ayudará a elegir deliberadamente el "sí".', duracion: 30 }
    ]
  },
  {
    id: 'aceptacion_juego_imposible',
    categoriaId: 'aceptacion',
    nombre: 'El juego imposible',
    descripcion: 'Cuando notes resistencia interna, desafíate a hacer lo "imposible".',
    duracion: 5,
    tieneEscritura: false,
    pasos: [
      { texto: 'En el momento en que notes una resistencia interna para realizar una acción útil, ¡comienza el juego!', duracion: 15 },
      { texto: 'Ejemplos del juego:\n• Suena el despertador y quieres seguir durmiendo → Levántate lo más rápido posible\n• Quieres el muffin de chocolate → Pide una manzana\n• Quieres Netflix → Lee 5 páginas de un libro\n• La ducha está caliente y no quieres salir → Ponla fría', duracion: 60 },
      { texto: 'Permítete sentir la incomodidad, escucha tu diálogo interno negativo, y actúa de todos modos. Estás haciendo lo que tu mente dice que no puedes: ¡lo imposible!', duracion: 60 },
      { texto: 'Recuerda: es un JUEGO, no algo SERIO. Mantenlo voluntario y divertido. No dejes que tu Dictador Interior lo convierta en una obligación. ¿Listo para jugar?', duracion: 30 }
    ]
  },
  {
    id: 'aceptacion_practica_opuestos',
    categoriaId: 'aceptacion',
    nombre: 'Practica los opuestos',
    descripcion: 'Ve directamente adonde tu mente dice que no puedes ir.',
    duracion: 5,
    tieneEscritura: false,
    pasos: [
      { texto: 'Pregúntate: ¿Adónde te dice tu mente que no puedes ir? ¿Qué te dice que no puedes hacer?', duracion: 30 },
      { texto: 'Siempre es tu elección, nunca lo fuerces. Si algo te resulta demasiado difícil, elige una alternativa más sencilla y deja lo más difícil para después.', duracion: 20 },
      { texto: 'Con actitud juguetona, dirígete directamente hacia lo que tu mente evita. Es como lanzarte en tirolesa: una vez que te lanzas, el miedo suele desaparecer dando paso a alegría y expansión vital.', duracion: 60 },
      { texto: 'Cada vez que haces lo opuesto a lo que tu mente ordena, recuperas terreno que habías cedido. No subestimes este ejercicio: personas han recuperado años de terreno perdido con él.', duracion: 30 }
    ]
  }
];

// ===================== HELPERS =====================

export const getHerramientasByCategoria = (categoriaId) => {
  return ACT_HERRAMIENTAS.filter(h => h.categoriaId === categoriaId);
};

export const getCuestionarioById = (id) => {
  return CUESTIONARIOS.find(c => c.id === id);
};

export const calcularPuntuacion = (cuestionario, respuestas) => {
  if (cuestionario.tipo === 'vlq') {
    return calcularVLQ(cuestionario, respuestas);
  }
  // Sum type
  const total = Object.values(respuestas).reduce((sum, val) => sum + val, 0);
  const rango = cuestionario.interpretacion.rangos.find(r => total >= r.min && total <= r.max);
  return {
    total,
    nivel: rango?.nivel || 'desconocido',
    color: rango?.color || '#9E9E9E',
    texto: rango?.texto || '',
    nota: cuestionario.interpretacion.nota
  };
};

const calcularVLQ = (cuestionario, respuestas) => {
  const areas = cuestionario.areas;
  let sumaCompuesta = 0;
  const detalleAreas = [];
  const areasProblema = [];

  areas.forEach(area => {
    const importancia = respuestas[`importancia_${area.id}`] || 0;
    const consistencia = respuestas[`consistencia_${area.id}`] || 0;
    const compuesta = importancia * consistencia;
    sumaCompuesta += compuesta;

    const areaDetalle = {
      id: area.id,
      nombre: area.nombre,
      importancia,
      consistencia,
      compuesta
    };
    detalleAreas.push(areaDetalle);

    if (importancia >= 9 && consistencia <= 6) {
      areasProblema.push(areaDetalle);
    }
  });

  const promedio = sumaCompuesta / areas.length;
  const promedioPublico = cuestionario.interpretacion.promedioPublico;

  let nivel, color, texto;
  if (promedio >= promedioPublico) {
    nivel = 'bueno';
    color = '#2E7D32';
    texto = `Tu puntuación compuesta (${Math.round(promedio)}) está por encima del promedio público (${promedioPublico}). Tus acciones son bastante consistentes con tus valores.`;
  } else if (promedio >= promedioPublico * 0.7) {
    nivel = 'moderado';
    color = '#F57F17';
    texto = `Tu puntuación compuesta (${Math.round(promedio)}) está por debajo del promedio público (${promedioPublico}). Hay oportunidades para alinear más tus acciones con tus valores.`;
  } else {
    nivel = 'bajo';
    color = '#C62828';
    texto = `Tu puntuación compuesta (${Math.round(promedio)}) está significativamente por debajo del promedio (${promedioPublico}). Te recomendamos trabajar activamente en alinear tus acciones con tus valores.`;
  }

  return {
    total: Math.round(promedio),
    nivel,
    color,
    texto,
    nota: cuestionario.interpretacion.nota,
    detalleAreas,
    areasProblema
  };
};
