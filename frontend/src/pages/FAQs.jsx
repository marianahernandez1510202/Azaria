import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import AccessibilityPanel, { AccessibilityFAB } from '../components/accessibility/AccessibilityPanel';
import api from '../services/api';
import LucideIcon from '../components/LucideIcon';
import '../styles/FAQs.css';

const FAQs = () => {
  const { settings } = useAccessibility();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [areaSeleccionada, setAreaSeleccionada] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [faqExpandida, setFaqExpandida] = useState(null);

  const areas = [
    { id: 'todas', nombre: 'Todas las areas', icon: 'clipboard' },
    { id: 'general', nombre: 'General', icon: 'circle-help' },
    { id: 'fisioterapia', nombre: 'Fisioterapia', icon: 'dumbbell' },
    { id: 'nutricion', nombre: 'Nutricion', icon: 'salad' },
    { id: 'medicina', nombre: 'Medicina', icon: 'pill' },
    { id: 'neuropsicologia', nombre: 'Neuropsicologia', icon: 'brain' },
    { id: 'ortesis', nombre: 'Ortesis/Protesis', icon: 'accessibility' }
  ];

  useEffect(() => {
    cargarFAQs();
  }, [areaSeleccionada]);

  const cargarFAQs = async () => {
    setLoading(true);
    try {
      const params = areaSeleccionada !== 'todas' ? `?area=${areaSeleccionada}` : '';
      const response = await api.get(`/faqs${params}`);
      setFaqs(response.data || getFAQsDefault());
    } catch (err) {
      console.error('Error al cargar FAQs:', err);
      setFaqs(getFAQsDefault());
    } finally {
      setLoading(false);
    }
  };

  const getFAQsDefault = () => [
    // General
    {
      id: 1,
      area: 'general',
      pregunta: '¿Cómo puedo cambiar mi PIN de acceso?',
      respuesta: 'Puedes cambiar tu PIN desde la sección de Perfil > Seguridad > Cambiar PIN. Necesitarás ingresar tu PIN actual antes de establecer uno nuevo.'
    },
    {
      id: 2,
      area: 'general',
      pregunta: '¿Qué hago si olvido mi PIN o contraseña?',
      respuesta: 'En la pantalla de inicio de sesión, haz clic en "¿Olvidaste tu contraseña o PIN?". Se enviará un código de verificación a tu correo electrónico para restablecer tus credenciales.'
    },
    {
      id: 3,
      area: 'general',
      pregunta: '¿Cada cuánto debo actualizar mi información de salud?',
      respuesta: 'Te recomendamos actualizar tu peso semanalmente y registrar tus signos vitales según las indicaciones de tu especialista, generalmente diario para glucosa y presión.'
    },
    // Fisioterapia
    {
      id: 4,
      area: 'fisioterapia',
      pregunta: '¿Qué hago si siento dolor durante los ejercicios?',
      respuesta: 'Detén el ejercicio inmediatamente. Un dolor leve es normal, pero si sientes dolor agudo, punzante o que persiste, no continúes y contacta a tu fisioterapeuta. Registra el dolor en tu bitácora.'
    },
    {
      id: 5,
      area: 'fisioterapia',
      pregunta: '¿Puedo hacer los ejercicios más de una vez al día?',
      respuesta: 'Sigue las indicaciones de tu especialista. En general, no se recomienda hacer más repeticiones de las indicadas ya que puede causar fatiga muscular y retrasar tu recuperación.'
    },
    // Nutrición
    {
      id: 6,
      area: 'nutricion',
      pregunta: '¿Por qué es importante mantener una dieta especial?',
      respuesta: 'Una nutrición adecuada acelera la cicatrización, fortalece los tejidos, mantiene estables los niveles de glucosa y proporciona la energía necesaria para la rehabilitación.'
    },
    {
      id: 7,
      area: 'nutricion',
      pregunta: '¿Puedo sustituir alimentos en las recetas?',
      respuesta: 'Sí, pero consulta primero con tu nutriólogo. Algunas sustituciones son seguras, pero otras pueden afectar el balance nutricional necesario para tu recuperación.'
    },
    // Medicina
    {
      id: 8,
      area: 'medicina',
      pregunta: '¿A qué hora debo medir mi glucosa?',
      respuesta: 'Lo más común es medir en ayunas (al despertar) y 2 horas después de las comidas principales. Tu médico puede indicarte horarios específicos según tu caso.'
    },
    {
      id: 9,
      area: 'medicina',
      pregunta: '¿Qué valores de presión arterial son normales?',
      respuesta: 'El valor normal es menor a 120/80 mmHg. Valores entre 120-129/menos de 80 se consideran elevados. Si tu presión es 130/80 o mayor de forma consistente, consulta a tu médico.'
    },
    // Neuropsicología
    {
      id: 10,
      area: 'neuropsicologia',
      pregunta: '¿Es normal sentir ansiedad o tristeza durante mi recuperación?',
      respuesta: 'Sí, es completamente normal. La adaptación a una prótesis u órtesis es un proceso que involucra cambios emocionales. No dudes en registrar cómo te sientes y comunicarte con tu especialista si necesitas apoyo.'
    },
    {
      id: 11,
      area: 'neuropsicologia',
      pregunta: '¿Los ejercicios de respiración realmente ayudan?',
      respuesta: 'Sí, están científicamente comprobados para reducir la ansiedad, bajar la presión arterial, mejorar el sueño y ayudar a manejar el dolor. Practica las técnicas regularmente para mejores resultados.'
    },
    // Órtesis
    {
      id: 12,
      area: 'ortesis',
      pregunta: '¿Cuántas horas al día debo usar mi prótesis?',
      respuesta: 'Inicialmente, el uso debe ser gradual: empieza con 1-2 horas y aumenta progresivamente según las indicaciones de tu especialista. Con el tiempo podrás usarla durante todo el día.'
    },
    {
      id: 13,
      area: 'ortesis',
      pregunta: '¿Qué hago si mi prótesis causa rozaduras?',
      respuesta: 'Deja de usarla, limpia y seca bien el área afectada, y contacta a tu especialista. Las rozaduras pueden indicar que el socket necesita ajuste o que el liner necesita reemplazo.'
    },
    {
      id: 14,
      area: 'ortesis',
      pregunta: '¿Puedo bañarme con mi prótesis?',
      respuesta: 'Depende del tipo de prótesis. Muchas prótesis no son resistentes al agua y pueden dañarse. Consulta las especificaciones de tu dispositivo con tu técnico ortopédico.'
    }
  ];

  const faqsFiltradas = faqs.filter(faq => {
    const coincideBusqueda = !busqueda ||
      faq.pregunta.toLowerCase().includes(busqueda.toLowerCase()) ||
      faq.respuesta.toLowerCase().includes(busqueda.toLowerCase());

    const coincideArea = areaSeleccionada === 'todas' || faq.area === areaSeleccionada;

    return coincideBusqueda && coincideArea;
  });

  const faqsPorArea = faqsFiltradas.reduce((acc, faq) => {
    if (!acc[faq.area]) {
      acc[faq.area] = [];
    }
    acc[faq.area].push(faq);
    return acc;
  }, {});

  return (
    <div className="faqs-page">
      <header className="page-header">
        <h1>Preguntas Frecuentes</h1>
        <p className="subtitle">Encuentra respuestas a las dudas más comunes</p>
      </header>

      {/* Buscador */}
      <div className="busqueda-container">
        <input
          type="text"
          placeholder="Buscar pregunta..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="busqueda-input"
        />
        {busqueda && (
          <button className="busqueda-clear" onClick={() => setBusqueda('')}>×</button>
        )}
      </div>

      {/* Filtro por área */}
      <div className="areas-filter">
        {areas.map(area => (
          <button
            key={area.id}
            className={`area-btn ${areaSeleccionada === area.id ? 'active' : ''}`}
            onClick={() => setAreaSeleccionada(area.id)}
          >
            <span className="area-icon"><LucideIcon name={area.icon} size={18} /></span>
            <span className="area-nombre">{area.nombre}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando preguntas...</p>
        </div>
      ) : (
        <div className="faqs-container">
          {areaSeleccionada === 'todas' ? (
            // Mostrar agrupado por área
            Object.entries(faqsPorArea).map(([area, preguntas]) => {
              const areaInfo = areas.find(a => a.id === area);
              return (
                <div key={area} className="faq-section">
                  <h2 className="section-title">
                    <span className="section-icon"><LucideIcon name={areaInfo?.icon || 'circle-help'} size={20} /></span>
                    {areaInfo?.nombre || area}
                  </h2>
                  <div className="faqs-list">
                    {preguntas.map(faq => (
                      <div
                        key={faq.id}
                        className={`faq-item ${faqExpandida === faq.id ? 'expanded' : ''}`}
                      >
                        <button
                          className="faq-pregunta"
                          onClick={() => setFaqExpandida(faqExpandida === faq.id ? null : faq.id)}
                        >
                          <span>{faq.pregunta}</span>
                          <span className="faq-toggle">{faqExpandida === faq.id ? '−' : '+'}</span>
                        </button>
                        {faqExpandida === faq.id && (
                          <div className="faq-respuesta">
                            <p>{faq.respuesta}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            // Mostrar solo el área seleccionada
            <div className="faqs-list">
              {faqsFiltradas.map(faq => (
                <div
                  key={faq.id}
                  className={`faq-item ${faqExpandida === faq.id ? 'expanded' : ''}`}
                >
                  <button
                    className="faq-pregunta"
                    onClick={() => setFaqExpandida(faqExpandida === faq.id ? null : faq.id)}
                  >
                    <span>{faq.pregunta}</span>
                    <span className="faq-toggle">{faqExpandida === faq.id ? '−' : '+'}</span>
                  </button>
                  {faqExpandida === faq.id && (
                    <div className="faq-respuesta">
                      <p>{faq.respuesta}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {faqsFiltradas.length === 0 && (
            <div className="empty-state">
              <p>No se encontraron preguntas</p>
              <p className="help-text">Intenta con otros términos de búsqueda</p>
            </div>
          )}
        </div>
      )}

      <div className="contacto-section">
        <h3>¿No encontraste lo que buscabas?</h3>
        <p>Contacta a tu especialista a través del chat o agenda una cita</p>
        <div className="contacto-btns">
          <a href="/chat" className="btn btn-primary">Ir al Chat</a>
          <a href="/citas" className="btn btn-secondary">Agendar Cita</a>
        </div>
      </div>

      {/* Panel de Accesibilidad */}
      <AccessibilityPanel />

      {/* FAB de Accesibilidad */}
      <AccessibilityFAB />
    </div>
  );
};

export default FAQs;
