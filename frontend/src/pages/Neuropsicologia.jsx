import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import AccessibilityPanel, { AccessibilityFAB } from '../components/accessibility/AccessibilityPanel';
import api from '../services/api';
import '../styles/Neuropsicologia.css';

const Neuropsicologia = () => {
  const { user } = useAuth();
  const { settings } = useAccessibility();
  const [activeTab, setActiveTab] = useState('animo');
  const [estadosAnimo, setEstadosAnimo] = useState([]);
  const [ejercicios, setEjercicios] = useState([]);
  const [cuestionarios, setCuestionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');

  // Estado de ánimo
  const [emocionSeleccionada, setEmocionSeleccionada] = useState(null);
  const [notasAnimo, setNotasAnimo] = useState('');

  // Emociones disponibles con iconos y colores
  const emociones = [
    { id: 'feliz', nombre: 'Feliz', emoji: '😊', color: '#4CAF50' },
    { id: 'tranquilo', nombre: 'Tranquilo', emoji: '😌', color: '#2196F3' },
    { id: 'neutral', nombre: 'Neutral', emoji: '😐', color: '#9E9E9E' },
    { id: 'ansioso', nombre: 'Ansioso', emoji: '😰', color: '#FF9800' },
    { id: 'triste', nombre: 'Triste', emoji: '😢', color: '#3F51B5' },
    { id: 'enojado', nombre: 'Enojado', emoji: '😠', color: '#f44336' },
    { id: 'frustrado', nombre: 'Frustrado', emoji: '😤', color: '#E91E63' },
    { id: 'agradecido', nombre: 'Agradecido', emoji: '🙏', color: '#8BC34A' }
  ];

  useEffect(() => {
    cargarDatos();
  }, [activeTab]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      if (activeTab === 'animo') {
        const response = await api.get(`/neuropsicologia/estados-animo/${user.paciente_id}`);
        setEstadosAnimo(response.data || []);
      } else if (activeTab === 'ejercicios') {
        const response = await api.get('/neuropsicologia/ejercicios');
        setEjercicios(response.data || getEjerciciosDefault());
      } else if (activeTab === 'cuestionarios') {
        const response = await api.get(`/neuropsicologia/cuestionarios/${user.paciente_id}`);
        setCuestionarios(response.data || []);
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      if (activeTab === 'ejercicios') {
        setEjercicios(getEjerciciosDefault());
      }
    } finally {
      setLoading(false);
    }
  };

  const getEjerciciosDefault = () => [
    {
      id: 1,
      nombre: 'Respiración 4-7-8',
      descripcion: 'Técnica de respiración para reducir ansiedad',
      duracion: 5,
      tipo: 'respiracion',
      instrucciones: 'Inhala por 4 segundos, mantén por 7, exhala por 8. Repite 4 veces.'
    },
    {
      id: 2,
      nombre: 'Mindfulness de 5 sentidos',
      descripcion: 'Ejercicio de atención plena para conectar con el presente',
      duracion: 10,
      tipo: 'mindfulness',
      instrucciones: 'Identifica: 5 cosas que ves, 4 que tocas, 3 que escuchas, 2 que hueles, 1 que saboreas.'
    },
    {
      id: 3,
      nombre: 'Relajación muscular progresiva',
      descripcion: 'Reduce la tensión física y mental',
      duracion: 15,
      tipo: 'relajacion',
      instrucciones: 'Tensa cada grupo muscular por 5 segundos, luego relaja por 10 segundos.'
    },
    {
      id: 4,
      nombre: 'Visualización positiva',
      descripcion: 'Imagina tu recuperación exitosa',
      duracion: 10,
      tipo: 'visualizacion',
      instrucciones: 'Cierra los ojos e imagina detalladamente un día después de tu recuperación completa.'
    }
  ];

  const registrarEstadoAnimo = async () => {
    if (!emocionSeleccionada) return;

    try {
      await api.post('/neuropsicologia/estados-animo', {
        paciente_id: user.paciente_id,
        emocion: emocionSeleccionada,
        notas: notasAnimo,
        fecha_hora: new Date().toISOString()
      });

      setShowModal(false);
      setEmocionSeleccionada(null);
      setNotasAnimo('');
      cargarDatos();
    } catch (err) {
      console.error('Error al registrar estado de ánimo:', err);
    }
  };

  const getEmocionInfo = (emocionId) => {
    return emociones.find(e => e.id === emocionId) || { emoji: '❓', nombre: emocionId, color: '#9E9E9E' };
  };

  const calcularEstadisticas = () => {
    if (estadosAnimo.length === 0) return null;

    const conteo = {};
    estadosAnimo.forEach(estado => {
      // Soportar tanto 'emocion' como 'emociones_nombres' del backend
      const emocion = estado.emocion || estado.emociones_nombres || mapNivelToEmocion(estado.nivel_animo);
      if (emocion) {
        conteo[emocion] = (conteo[emocion] || 0) + 1;
      }
    });

    const emocionMasComun = Object.entries(conteo).sort((a, b) => b[1] - a[1])[0];

    return {
      total: estadosAnimo.length,
      emocionMasComun: emocionMasComun ? emocionMasComun[0] : null,
      conteo
    };
  };

  // Mapear nivel de ánimo numérico a emoción
  const mapNivelToEmocion = (nivel) => {
    const map = {
      1: 'enojado',
      2: 'triste',
      3: 'neutral',
      4: 'tranquilo',
      5: 'feliz'
    };
    return map[nivel] || 'neutral';
  };

  // Mapear emociones del backend al formato del frontend
  const mapBackendEmocion = (emocionBackend) => {
    if (!emocionBackend) return null;
    const map = {
      'alegria': 'feliz',
      'calma': 'tranquilo',
      'gratitud': 'agradecido',
      'confusion': 'neutral',
      'ansiedad': 'ansioso',
      'tristeza': 'triste',
      'frustracion': 'frustrado',
      'enojo': 'enojado',
      'esperanza': 'feliz',
      'miedo': 'ansioso',
      'motivacion': 'feliz',
      'soledad': 'triste'
    };
    return map[emocionBackend.toLowerCase()] || emocionBackend;
  };

  const stats = calcularEstadisticas();

  return (
    <div className="neuropsicologia-page">
      <header className="page-header">
        <h1>Neuropsicología</h1>
        <p className="subtitle">Cuida tu bienestar emocional y mental</p>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'animo' ? 'active' : ''}`}
          onClick={() => setActiveTab('animo')}
        >
          Estado de Ánimo
        </button>
        <button
          className={`tab ${activeTab === 'ejercicios' ? 'active' : ''}`}
          onClick={() => setActiveTab('ejercicios')}
        >
          Ejercicios
        </button>
        <button
          className={`tab ${activeTab === 'cuestionarios' ? 'active' : ''}`}
          onClick={() => setActiveTab('cuestionarios')}
        >
          Cuestionarios
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando...</p>
        </div>
      ) : (
        <div className="tab-content">
          {activeTab === 'animo' && (
            <div className="animo-section">
              <button
                className="btn btn-primary btn-lg btn-block"
                onClick={() => setShowModal(true)}
              >
                ¿Cómo te sientes ahora?
              </button>

              {stats && (
                <div className="stats-animo">
                  <h3>Resumen de esta semana</h3>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <span className="stat-value">{stats.total}</span>
                      <span className="stat-label">Registros</span>
                    </div>
                    {stats.emocionMasComun && (
                      <div className="stat-card">
                        <span className="stat-emoji">{getEmocionInfo(stats.emocionMasComun).emoji}</span>
                        <span className="stat-label">Más frecuente</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <h3>Historial reciente</h3>
              <div className="historial-animo">
                {estadosAnimo.length > 0 ? estadosAnimo.slice(0, 10).map(estado => {
                  // Obtener la emoción: puede venir como 'emocion', 'emociones_nombres' o derivarse del nivel
                  const emocionId = estado.emocion || mapBackendEmocion(estado.emociones_nombres) || mapNivelToEmocion(estado.nivel_animo);
                  const emocion = getEmocionInfo(emocionId);
                  // Fecha puede venir como fecha_hora o como fecha + created_at
                  const fechaStr = estado.fecha_hora || `${estado.fecha} ${estado.created_at?.split(' ')[1] || '00:00:00'}`;
                  return (
                    <div key={estado.id} className="estado-card" style={{ borderLeftColor: emocion.color }}>
                      <div className="estado-header">
                        <span className="estado-emoji">{emocion.emoji}</span>
                        <span className="estado-nombre">{emocion.nombre}</span>
                        <span className="estado-fecha">
                          {new Date(fechaStr).toLocaleString('es-MX', {
                            weekday: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {estado.notas && <p className="estado-notas">{estado.notas}</p>}
                    </div>
                  );
                }) : (
                  <div className="empty-state">
                    <p>No hay registros de estado de ánimo</p>
                    <p className="help-text">Registra cómo te sientes para entender mejor tu proceso</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'ejercicios' && (
            <div className="ejercicios-section">
              <p className="intro-text">
                Estos ejercicios te ayudarán a manejar el estrés y la ansiedad durante tu recuperación.
              </p>

              <div className="ejercicios-grid">
                {ejercicios.map(ejercicio => (
                  <div key={ejercicio.id} className="ejercicio-card-np">
                    <div className="ejercicio-icon">
                      {ejercicio.tipo === 'respiracion' && '🌬️'}
                      {ejercicio.tipo === 'mindfulness' && '🧘'}
                      {ejercicio.tipo === 'relajacion' && '💆'}
                      {ejercicio.tipo === 'visualizacion' && '✨'}
                    </div>
                    <h3>{ejercicio.nombre}</h3>
                    <p className="ejercicio-descripcion">{ejercicio.descripcion}</p>
                    <span className="ejercicio-duracion">⏱️ {ejercicio.duracion} min</span>
                    <button
                      className="btn btn-primary btn-block"
                      onClick={() => {
                        setModalType('ejercicio');
                        setShowModal(true);
                      }}
                    >
                      Comenzar
                    </button>
                  </div>
                ))}
              </div>

              <div className="recursos-adicionales">
                <h3>Recursos adicionales</h3>
                <ul>
                  <li>
                    <a href="tel:8009112000" className="recurso-link">
                      📞 Línea de la Vida: 800 911 2000
                    </a>
                  </li>
                  <li>
                    <span className="recurso-text">
                      Si sientes que necesitas apoyo profesional, no dudes en contactar a tu especialista
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'cuestionarios' && (
            <div className="cuestionarios-section">
              <p className="intro-text">
                Estos cuestionarios nos ayudan a evaluar tu bienestar emocional y ajustar tu tratamiento.
              </p>

              <div className="cuestionarios-list">
                <div className="cuestionario-card">
                  <h3>Cuestionario de Bienestar (PHQ-9)</h3>
                  <p>Evaluación rápida del estado de ánimo</p>
                  <span className="cuestionario-tiempo">⏱️ 5 minutos</span>
                  <button className="btn btn-primary">
                    Comenzar
                  </button>
                </div>

                <div className="cuestionario-card">
                  <h3>Escala de Ansiedad (GAD-7)</h3>
                  <p>Mide niveles de ansiedad</p>
                  <span className="cuestionario-tiempo">⏱️ 3 minutos</span>
                  <button className="btn btn-primary">
                    Comenzar
                  </button>
                </div>

                <div className="cuestionario-card">
                  <h3>Calidad de Vida (SF-12)</h3>
                  <p>Evaluación general de bienestar</p>
                  <span className="cuestionario-tiempo">⏱️ 10 minutos</span>
                  <button className="btn btn-primary">
                    Comenzar
                  </button>
                </div>
              </div>

              {cuestionarios.length > 0 && (
                <div className="historial-cuestionarios">
                  <h3>Cuestionarios completados</h3>
                  {cuestionarios.map(c => (
                    <div key={c.id} className="cuestionario-completado">
                      <span className="cuestionario-nombre">{c.tipo}</span>
                      <span className="cuestionario-fecha">
                        {new Date(c.fecha).toLocaleDateString()}
                      </span>
                      <span className="cuestionario-resultado">
                        Puntuación: {c.puntuacion}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal de estado de ánimo */}
      {showModal && !modalType && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>¿Cómo te sientes?</h2>
            <p className="modal-subtitle">Selecciona la emoción que mejor describe cómo te sientes ahora</p>

            <div className="emociones-grid">
              {emociones.map(emocion => (
                <button
                  key={emocion.id}
                  className={`emocion-btn ${emocionSeleccionada === emocion.id ? 'selected' : ''}`}
                  onClick={() => setEmocionSeleccionada(emocion.id)}
                  style={{
                    '--emocion-color': emocion.color,
                    borderColor: emocionSeleccionada === emocion.id ? emocion.color : 'transparent'
                  }}
                >
                  <span className="emocion-emoji">{emocion.emoji}</span>
                  <span className="emocion-nombre">{emocion.nombre}</span>
                </button>
              ))}
            </div>

            <div className="form-group">
              <label>¿Quieres agregar una nota? (opcional)</label>
              <textarea
                value={notasAnimo}
                onChange={e => setNotasAnimo(e.target.value)}
                className="form-control"
                rows="3"
                placeholder="¿Qué está pasando? ¿Qué lo provocó?"
              />
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={registrarEstadoAnimo}
                disabled={!emocionSeleccionada}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panel de Accesibilidad */}
      <AccessibilityPanel />

      {/* FAB de Accesibilidad */}
      <AccessibilityFAB />
    </div>
  );
};

export default Neuropsicologia;
