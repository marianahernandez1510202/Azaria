import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useVoice, Speakable } from '../components/VoiceHelper';
import AccessibilityPanel, { AccessibilityFAB } from '../components/accessibility/AccessibilityPanel';
import api from '../services/api';
import '../styles/Fisioterapia.css';

/**
 * Fisioterapia - Módulo de ejercicios y rehabilitación
 * Diseño accesible para usuarios de 10 a 80 años
 */
const Fisioterapia = () => {
  const { user } = useAuth();
  const { settings, togglePanel } = useAccessibility();
  const { speak, isSpeaking, stop, speakModule } = useVoice();
  const mainContentRef = useRef(null);

  const [activeTab, setActiveTab] = useState('rutina');
  const [videos, setVideos] = useState([]);
  const [rutinaDiaria, setRutinaDiaria] = useState([]);
  const [progreso, setProgreso] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, [activeTab]);

  // Bienvenida por voz al entrar al módulo
  useEffect(() => {
    if (settings.voiceNavigation) {
      speak('Bienvenido al módulo de Fisioterapia. Aquí encontrarás tu rutina de ejercicios, videos explicativos y tu progreso.');
    }
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      if (activeTab === 'rutina') {
        const response = await api.get(`/fisioterapia/rutina/${user.paciente_id}`);
        setRutinaDiaria(response.data || []);
      } else if (activeTab === 'videos') {
        const response = await api.get('/fisioterapia/videos');
        setVideos(response.data || []);
      } else if (activeTab === 'progreso') {
        const response = await api.get(`/fisioterapia/progreso/${user.paciente_id}`);
        setProgreso(response.data || []);
      }
    } catch (err) {
      console.error('Error al cargar datos de fisioterapia:', err);
      // Datos de ejemplo para desarrollo
      if (activeTab === 'rutina') {
        setRutinaDiaria([
          { id: 1, nombre: 'Estiramiento de pierna', descripcion: 'Estira la pierna hacia arriba manteniéndola recta', repeticiones: 10, series: 3, duracion: 5, completado: false },
          { id: 2, nombre: 'Flexión de rodilla', descripcion: 'Dobla la rodilla llevando el talón hacia el glúteo', repeticiones: 15, series: 2, duracion: 3, completado: true },
          { id: 3, nombre: 'Elevación de cadera', descripcion: 'Acostado boca arriba, eleva la cadera del suelo', repeticiones: 12, series: 3, duracion: 4, completado: false },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const marcarEjercicioCompletado = async (ejercicioId) => {
    try {
      await api.post('/fisioterapia/ejercicio/completar', {
        paciente_id: user.paciente_id,
        ejercicio_id: ejercicioId,
        fecha: new Date().toISOString().split('T')[0]
      });

      setRutinaDiaria(prev => prev.map(ej =>
        ej.id === ejercicioId ? { ...ej, completado: true } : ej
      ));

      // Feedback por voz
      if (settings.voiceNavigation) {
        speak('¡Excelente! Ejercicio completado.');
      }
    } catch (err) {
      console.error('Error al marcar ejercicio:', err);
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : '';
  };

  const calcularProgresoRutina = () => {
    if (rutinaDiaria.length === 0) return 0;
    const completados = rutinaDiaria.filter(ej => ej.completado).length;
    return Math.round((completados / rutinaDiaria.length) * 100);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    // Anunciar cambio de pestaña por voz
    if (settings.voiceNavigation) {
      const tabNames = {
        rutina: 'Mi Rutina de ejercicios',
        videos: 'Videos explicativos',
        progreso: 'Mi Progreso'
      };
      speak(`Mostrando ${tabNames[tab]}`);
    }
  };

  const speakEjercicio = (ejercicio) => {
    const texto = `${ejercicio.nombre}. ${ejercicio.descripcion}. ${ejercicio.repeticiones} repeticiones, ${ejercicio.series} series${ejercicio.duracion ? `, duración ${ejercicio.duracion} minutos` : ''}. ${ejercicio.completado ? 'Ya completado.' : 'Pendiente.'}`;
    speak(texto);
  };

  return (
    <div
      className="fisioterapia-page"
      data-theme={settings.theme}
      data-font-scale={settings.fontScale}
      data-contrast={settings.contrast}
      data-age-mode={settings.ageMode}
      data-reduced-motion={settings.reducedMotion}
    >
      {/* Skip Links */}
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>
      <a href="#ejercicios-list" className="skip-link">
        Saltar a la lista de ejercicios
      </a>

      <header className="page-header">
        <div className="header-content">
          <div className="header-left">
            <h1 id="page-title">Fisioterapia</h1>
            <p className="subtitle">Ejercicios y rehabilitación para tu recuperación</p>
          </div>

          <div className="header-controls">
            {/* Botón de voz */}
            <button
              className={`control-btn voice-btn ${isSpeaking ? 'speaking' : ''}`}
              onClick={() => isSpeaking ? stop() : speakModule('fisioterapia')}
              aria-label={isSpeaking ? 'Detener audio' : 'Escuchar ayuda del módulo'}
              aria-pressed={isSpeaking}
            >
              {isSpeaking ? '⏹️' : '🔊'}
            </button>

            {/* Botón de accesibilidad */}
            <button
              className="control-btn accessibility-btn"
              onClick={togglePanel}
              aria-label="Abrir configuración de accesibilidad"
            >
              ♿
            </button>
          </div>
        </div>
      </header>

      {/* Progreso del día */}
      <Speakable text={`Progreso de hoy: ${calcularProgresoRutina()} por ciento. ${rutinaDiaria.filter(e => e.completado).length} de ${rutinaDiaria.length} ejercicios completados.`}>
        <section className="progreso-header" aria-labelledby="progreso-title">
          <h2 id="progreso-title" className="sr-only">Progreso del día</h2>
          <div
            className="progreso-circle"
            role="progressbar"
            aria-valuenow={calcularProgresoRutina()}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label={`Progreso de hoy: ${calcularProgresoRutina()}%`}
          >
            <svg viewBox="0 0 36 36" aria-hidden="true">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--border-color, #eee)"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--color-success, #4CAF50)"
                strokeWidth="3"
                strokeDasharray={`${calcularProgresoRutina()}, 100`}
              />
            </svg>
            <span className="progreso-text" aria-hidden="true">{calcularProgresoRutina()}%</span>
          </div>
          <div className="progreso-info">
            <h3>Progreso de hoy</h3>
            <p>{rutinaDiaria.filter(e => e.completado).length} de {rutinaDiaria.length} ejercicios</p>
          </div>
        </section>
      </Speakable>

      {/* Navegación por pestañas */}
      <nav className="tabs" role="tablist" aria-label="Secciones de fisioterapia">
        <button
          role="tab"
          id="tab-rutina"
          aria-selected={activeTab === 'rutina'}
          aria-controls="panel-rutina"
          className={`tab ${activeTab === 'rutina' ? 'active' : ''}`}
          onClick={() => handleTabChange('rutina')}
          onFocus={() => settings.autoSpeak && speak('Mi Rutina')}
        >
          <span className="tab-icon" aria-hidden="true">🏃</span>
          <span className="tab-text">Mi Rutina</span>
        </button>
        <button
          role="tab"
          id="tab-videos"
          aria-selected={activeTab === 'videos'}
          aria-controls="panel-videos"
          className={`tab ${activeTab === 'videos' ? 'active' : ''}`}
          onClick={() => handleTabChange('videos')}
          onFocus={() => settings.autoSpeak && speak('Videos')}
        >
          <span className="tab-icon" aria-hidden="true">🎬</span>
          <span className="tab-text">Videos</span>
        </button>
        <button
          role="tab"
          id="tab-progreso"
          aria-selected={activeTab === 'progreso'}
          aria-controls="panel-progreso"
          className={`tab ${activeTab === 'progreso' ? 'active' : ''}`}
          onClick={() => handleTabChange('progreso')}
          onFocus={() => settings.autoSpeak && speak('Mi Progreso')}
        >
          <span className="tab-icon" aria-hidden="true">📊</span>
          <span className="tab-text">Mi Progreso</span>
        </button>
      </nav>

      {/* Contenido principal */}
      <main id="main-content" ref={mainContentRef} tabIndex="-1">
        {loading ? (
          <div className="loading-container" role="status" aria-live="polite">
            <div className="spinner" aria-hidden="true"></div>
            <p>Cargando información...</p>
          </div>
        ) : (
          <div className="tab-content">
            {/* Panel de Rutina */}
            {activeTab === 'rutina' && (
              <div
                role="tabpanel"
                id="panel-rutina"
                aria-labelledby="tab-rutina"
                className="rutina-section"
              >
                {rutinaDiaria.length > 0 ? (
                  <div id="ejercicios-list" className="ejercicios-list" role="list" aria-label="Lista de ejercicios">
                    {rutinaDiaria.map((ejercicio, index) => (
                      <article
                        key={ejercicio.id}
                        className={`ejercicio-card ${ejercicio.completado ? 'completado' : ''}`}
                        role="listitem"
                        aria-label={`Ejercicio ${index + 1}: ${ejercicio.nombre}${ejercicio.completado ? ', completado' : ', pendiente'}`}
                      >
                        <div className="ejercicio-number" aria-hidden="true">{index + 1}</div>
                        <div className="ejercicio-content">
                          <h3>{ejercicio.nombre}</h3>
                          <p className="ejercicio-descripcion">{ejercicio.descripcion}</p>
                          <div className="ejercicio-detalles" aria-label="Detalles del ejercicio">
                            <span aria-label={`${ejercicio.repeticiones} repeticiones`}>
                              <span aria-hidden="true">🔄</span> {ejercicio.repeticiones} repeticiones
                            </span>
                            <span aria-label={`${ejercicio.series} series`}>
                              <span aria-hidden="true">📊</span> {ejercicio.series} series
                            </span>
                            {ejercicio.duracion && (
                              <span aria-label={`Duración ${ejercicio.duracion} minutos`}>
                                <span aria-hidden="true">⏱️</span> {ejercicio.duracion} min
                              </span>
                            )}
                          </div>
                          <div className="ejercicio-actions">
                            {ejercicio.video_url && (
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() => setSelectedVideo(ejercicio)}
                                aria-label={`Ver video explicativo de ${ejercicio.nombre}`}
                              >
                                <span aria-hidden="true">▶️</span> Ver video
                              </button>
                            )}
                            <button
                              className="btn btn-voice btn-sm"
                              onClick={() => speakEjercicio(ejercicio)}
                              aria-label={`Escuchar descripción de ${ejercicio.nombre}`}
                            >
                              <span aria-hidden="true">🔊</span>
                            </button>
                          </div>
                        </div>
                        <button
                          className={`btn-check ${ejercicio.completado ? 'checked' : ''}`}
                          onClick={() => !ejercicio.completado && marcarEjercicioCompletado(ejercicio.id)}
                          disabled={ejercicio.completado}
                          aria-label={ejercicio.completado ? `${ejercicio.nombre} ya completado` : `Marcar ${ejercicio.nombre} como completado`}
                          aria-pressed={ejercicio.completado}
                        >
                          <span className="check-icon" aria-hidden="true">
                            {ejercicio.completado ? '✓' : '○'}
                          </span>
                          <span className="sr-only">
                            {ejercicio.completado ? 'Completado' : 'Marcar como completado'}
                          </span>
                        </button>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state" role="status">
                    <span className="empty-icon" aria-hidden="true">📋</span>
                    <p>No tienes ejercicios asignados para hoy</p>
                    <p className="help-text">Tu especialista te asignará una rutina personalizada</p>
                  </div>
                )}

                <aside className="tips-section" aria-labelledby="tips-title">
                  <h4 id="tips-title">
                    <span aria-hidden="true">💡</span> Recomendaciones
                  </h4>
                  <ul className="tips-list">
                    <li>Realiza los ejercicios en un lugar seguro y con espacio</li>
                    <li>Si sientes dolor intenso, detente y consulta a tu especialista</li>
                    <li>Mantente hidratado durante la rutina</li>
                    <li>Calienta antes de comenzar los ejercicios</li>
                  </ul>
                </aside>
              </div>
            )}

            {/* Panel de Videos */}
            {activeTab === 'videos' && (
              <div
                role="tabpanel"
                id="panel-videos"
                aria-labelledby="tab-videos"
                className="videos-section"
              >
                <div className="videos-grid" role="list" aria-label="Lista de videos de ejercicios">
                  {videos.length > 0 ? videos.map(video => (
                    <article
                      key={video.id}
                      className="video-card"
                      role="listitem"
                      onClick={() => setSelectedVideo(video)}
                      onKeyDown={(e) => e.key === 'Enter' && setSelectedVideo(video)}
                      tabIndex="0"
                      aria-label={`Video: ${video.titulo}. Fase ${video.fase}. Duración ${video.duracion} minutos.`}
                    >
                      <div className="video-thumbnail">
                        <img
                          src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                          alt=""
                          aria-hidden="true"
                        />
                        <div className="play-icon" aria-hidden="true">▶</div>
                      </div>
                      <div className="video-info">
                        <h3>{video.titulo}</h3>
                        <p className="video-descripcion">{video.descripcion}</p>
                        <div className="video-meta">
                          <span className="video-fase">Fase: {video.fase}</span>
                          <span className="video-duracion">
                            <span aria-hidden="true">⏱️</span> {video.duracion} min
                          </span>
                        </div>
                      </div>
                    </article>
                  )) : (
                    <div className="empty-state" role="status">
                      <span className="empty-icon" aria-hidden="true">🎬</span>
                      <p>No hay videos disponibles</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Panel de Progreso */}
            {activeTab === 'progreso' && (
              <div
                role="tabpanel"
                id="panel-progreso"
                aria-labelledby="tab-progreso"
                className="progreso-section"
              >
                <div className="calendario-progreso" aria-labelledby="calendario-title">
                  <h3 id="calendario-title">Últimos 7 días</h3>
                  <div className="dias-semana" role="list" aria-label="Progreso de los últimos 7 días">
                    {(progreso.length > 0 ? progreso.slice(-7) : generateDummyProgress()).map((dia, index) => (
                      <div
                        key={index}
                        className="dia-progreso"
                        role="listitem"
                        aria-label={`${new Date(dia.fecha).toLocaleDateString('es-MX', { weekday: 'long' })}: ${dia.porcentaje}% completado`}
                      >
                        <span className="dia-nombre">
                          {new Date(dia.fecha).toLocaleDateString('es-MX', { weekday: 'short' })}
                        </span>
                        <div
                          className={`dia-indicador ${dia.porcentaje >= 100 ? 'completo' : dia.porcentaje > 0 ? 'parcial' : 'vacio'}`}
                          aria-hidden="true"
                        >
                          {dia.porcentaje >= 100 ? '✓' : `${dia.porcentaje}%`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="estadisticas-progreso" role="region" aria-labelledby="stats-title">
                  <h3 id="stats-title" className="sr-only">Estadísticas</h3>
                  <Speakable text={`Ejercicios completados esta semana: ${progreso.reduce((acc, d) => acc + (d.ejercicios_completados || 0), 0)}. Racha actual: ${calcularRacha(progreso)} días. Promedio semanal: ${calcularPromedioSemanal(progreso)}%.`}>
                    <div className="stats-grid">
                      <div className="stat-item">
                        <span className="stat-icon" aria-hidden="true">💪</span>
                        <span className="stat-value">{progreso.reduce((acc, d) => acc + (d.ejercicios_completados || 0), 0)}</span>
                        <span className="stat-label">Ejercicios esta semana</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-icon" aria-hidden="true">🔥</span>
                        <span className="stat-value">{calcularRacha(progreso)} días</span>
                        <span className="stat-label">Racha actual</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-icon" aria-hidden="true">📈</span>
                        <span className="stat-value">{calcularPromedioSemanal(progreso)}%</span>
                        <span className="stat-label">Promedio semanal</span>
                      </div>
                    </div>
                  </Speakable>
                </div>

                {progreso.length === 0 && (
                  <div className="empty-state" role="status">
                    <span className="empty-icon" aria-hidden="true">📊</span>
                    <p>Aún no hay historial de progreso</p>
                    <p className="help-text">Completa tu primera rutina para comenzar a ver tu progreso</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal de video */}
      {selectedVideo && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedVideo(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="modal-content modal-video" onClick={e => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedVideo(null)}
              aria-label="Cerrar video"
            >
              ×
            </button>
            <h2 id="modal-title">{selectedVideo.titulo || selectedVideo.nombre}</h2>
            <div className="video-container">
              <iframe
                src={getYouTubeEmbedUrl(selectedVideo.video_url || selectedVideo.url)}
                title={selectedVideo.titulo || selectedVideo.nombre}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="video-details">
              <p>{selectedVideo.descripcion}</p>
              {selectedVideo.instrucciones && (
                <div className="instrucciones">
                  <h4>Instrucciones:</h4>
                  <p>{selectedVideo.instrucciones}</p>
                </div>
              )}
              <button
                className="btn btn-voice"
                onClick={() => speak(`${selectedVideo.titulo || selectedVideo.nombre}. ${selectedVideo.descripcion}. ${selectedVideo.instrucciones || ''}`)}
                aria-label="Escuchar descripción del video"
              >
                <span aria-hidden="true">🔊</span> Escuchar descripción
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

// Funciones auxiliares
const calcularRacha = (progreso) => {
  if (!progreso || progreso.length === 0) return 0;
  let racha = 0;
  const ordenado = [...progreso].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  for (const dia of ordenado) {
    if (dia.porcentaje >= 100) {
      racha++;
    } else {
      break;
    }
  }
  return racha;
};

const calcularPromedioSemanal = (progreso) => {
  if (!progreso || progreso.length === 0) return 0;
  const ultimos7 = progreso.slice(-7);
  const suma = ultimos7.reduce((acc, d) => acc + (d.porcentaje || 0), 0);
  return Math.round(suma / ultimos7.length);
};

// Generar datos de ejemplo para desarrollo
const generateDummyProgress = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push({
      fecha: date.toISOString(),
      porcentaje: Math.floor(Math.random() * 101),
      ejercicios_completados: Math.floor(Math.random() * 5)
    });
  }
  return days;
};

export default Fisioterapia;
