import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useVoice, Speakable } from '../components/VoiceHelper';
import AccessibilityPanel, { AccessibilityFAB } from '../components/accessibility/AccessibilityPanel';
import api from '../services/api';
import '../styles/Medicina.css';

/**
 * Medicina - Módulo de control de salud
 * Diseño accesible para usuarios de 10 a 80 años
 */
const Medicina = () => {
  const { user } = useAuth();
  const { settings, togglePanel } = useAccessibility();
  const { speak, isSpeaking, stop, speakModule } = useVoice();
  const mainContentRef = useRef(null);

  const [activeTab, setActiveTab] = useState('glucosa');
  const [registros, setRegistros] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [saving, setSaving] = useState(false);

  // Obtener paciente_id con fallback al user.id
  const pacienteId = user?.paciente_id || user?.id;

  // Estados para los formularios
  const [glucosaForm, setGlucosaForm] = useState({
    nivel_glucosa: '',
    momento: 'ayunas',
    notas: ''
  });

  const [presionForm, setPresionForm] = useState({
    sistolica: '',
    diastolica: '',
    pulso: '',
    notas: ''
  });

  const [dolorForm, setDolorForm] = useState({
    nivel_dolor: 5,
    ubicacion: '',
    tipo_dolor: 'agudo',
    notas: ''
  });

  useEffect(() => {
    cargarDatos();
  }, [activeTab]);

  // Bienvenida por voz al entrar al módulo
  useEffect(() => {
    if (settings.voiceNavigation) {
      speak('Bienvenido al módulo de Control de Salud. Aquí puedes registrar tus niveles de glucosa, presión arterial y dolor.');
    }
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const endpoint = `/medicina/${activeTab}/${pacienteId}`;
      const response = await api.get(endpoint);
      setRegistros(response.data || []);

      // Cargar estadísticas
      const statsResponse = await api.get(`/medicina/resumen/${pacienteId}`);
      setEstadisticas(statsResponse.data);
    } catch (err) {
      console.error('Error al cargar datos médicos:', err);
      // Datos de ejemplo para desarrollo
      setEstadisticas({
        glucosa: { ultimo: 105, promedio: 110 },
        presion: { ultima_sistolica: 120, ultima_diastolica: 80 },
        dolor: { promedio: 3.5, total_registros: 5 }
      });
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (tipo) => {
    setModalType(tipo);
    setShowModal(true);

    // Anunciar por voz
    if (settings.voiceNavigation) {
      const nombres = {
        glucosa: 'glucosa',
        presion: 'presión arterial',
        dolor: 'dolor'
      };
      speak(`Formulario para registrar ${nombres[tipo]}`);
    }
  };

  const handleSubmitGlucosa = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/medicina/glucosa', {
        paciente_id: pacienteId,
        nivel_glucosa: glucosaForm.nivel_glucosa,
        momento: glucosaForm.momento,
        notas: glucosaForm.notas,
        fecha_hora: new Date().toISOString()
      });
      setShowModal(false);
      setGlucosaForm({ nivel_glucosa: '', momento: 'ayunas', notas: '' });

      if (settings.voiceNavigation) {
        speak('Registro de glucosa guardado correctamente.');
      }
      cargarDatos();
    } catch (err) {
      console.error('Error al registrar glucosa:', err);
      if (settings.voiceNavigation) {
        speak('Error al guardar el registro. Intenta de nuevo.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitPresion = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/medicina/presion', {
        paciente_id: pacienteId,
        sistolica: presionForm.sistolica,
        diastolica: presionForm.diastolica,
        pulso: presionForm.pulso,
        notas: presionForm.notas,
        fecha_hora: new Date().toISOString()
      });
      setShowModal(false);
      setPresionForm({ sistolica: '', diastolica: '', pulso: '', notas: '' });

      if (settings.voiceNavigation) {
        speak('Registro de presión arterial guardado correctamente.');
      }
      cargarDatos();
    } catch (err) {
      console.error('Error al registrar presión:', err);
      if (settings.voiceNavigation) {
        speak('Error al guardar el registro. Intenta de nuevo.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitDolor = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/medicina/dolor', {
        paciente_id: pacienteId,
        nivel_dolor: dolorForm.nivel_dolor,
        ubicacion: dolorForm.ubicacion,
        tipo_dolor: dolorForm.tipo_dolor,
        notas: dolorForm.notas,
        fecha_hora: new Date().toISOString()
      });
      setShowModal(false);
      setDolorForm({ nivel_dolor: 5, ubicacion: '', tipo_dolor: 'agudo', notas: '' });

      if (settings.voiceNavigation) {
        speak('Registro de dolor guardado correctamente.');
      }
      cargarDatos();
    } catch (err) {
      console.error('Error al registrar dolor:', err);
      if (settings.voiceNavigation) {
        speak('Error al guardar el registro. Intenta de nuevo.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    if (settings.voiceNavigation) {
      const nombres = {
        glucosa: 'Glucosa',
        presion: 'Presión arterial',
        dolor: 'Dolor'
      };
      speak(`Mostrando registros de ${nombres[tab]}`);
    }
  };

  const getNivelGlucosaColor = (nivel) => {
    if (nivel < 70) return 'bajo';
    if (nivel > 140) return 'alto';
    return 'normal';
  };

  const getNivelGlucosaTexto = (nivel) => {
    if (nivel < 70) return 'Bajo';
    if (nivel > 140) return 'Alto';
    return 'Normal';
  };

  const getPresionColor = (sistolica, diastolica) => {
    if (sistolica >= 140 || diastolica >= 90) return 'alto';
    if (sistolica < 90 || diastolica < 60) return 'bajo';
    return 'normal';
  };

  const getPresionTexto = (sistolica, diastolica) => {
    if (sistolica >= 140 || diastolica >= 90) return 'Elevada';
    if (sistolica < 90 || diastolica < 60) return 'Baja';
    return 'Normal';
  };

  const getDolorEmoji = (nivel) => {
    if (nivel <= 2) return '😊';
    if (nivel <= 4) return '😐';
    if (nivel <= 6) return '😣';
    if (nivel <= 8) return '😖';
    return '😫';
  };

  const getDolorColor = (nivel) => {
    if (nivel <= 3) return '#4CAF50';
    if (nivel <= 6) return '#FF9800';
    return '#f44336';
  };

  const formatFechaRelativa = (fecha) => {
    const ahora = new Date();
    const fechaRegistro = new Date(fecha);
    const diffMs = ahora - fechaRegistro;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHoras < 24) return `Hace ${diffHoras}h`;
    if (diffDias === 1) return 'Ayer';
    if (diffDias < 7) return `Hace ${diffDias} días`;
    return fechaRegistro.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  };

  const speakRegistro = (registro, tipo) => {
    let texto = '';
    if (tipo === 'glucosa') {
      texto = `Glucosa ${registro.nivel_glucosa} miligramos por decilitro, nivel ${getNivelGlucosaTexto(registro.nivel_glucosa)}, momento ${registro.momento?.replace('_', ' ')}. ${registro.notas || ''}`;
    } else if (tipo === 'presion') {
      texto = `Presión ${registro.sistolica} sobre ${registro.diastolica} milímetros de mercurio, pulso ${registro.pulso} latidos por minuto, nivel ${getPresionTexto(registro.sistolica, registro.diastolica)}. ${registro.notas || ''}`;
    } else if (tipo === 'dolor') {
      texto = `Dolor nivel ${registro.nivel_dolor} de 10, ubicación ${registro.ubicacion}, tipo ${registro.tipo_dolor}. ${registro.notas || ''}`;
    }
    speak(texto);
  };

  const tabInfo = {
    glucosa: { icon: '🩸', label: 'Glucosa', color: '#2196F3' },
    presion: { icon: '💓', label: 'Presión', color: '#E91E63' },
    dolor: { icon: '🩹', label: 'Dolor', color: '#FF9800' }
  };

  return (
    <div
      className="medicina-page"
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
      <a href="#registros-list" className="skip-link">
        Saltar a los registros
      </a>

      {/* Header mejorado */}
      <header className="medicina-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon" aria-hidden="true">💊</div>
            <div className="header-text">
              <h1 id="page-title">Control de Salud</h1>
              <p className="subtitle">Monitorea tus signos vitales</p>
            </div>
          </div>

          <div className="header-controls">
            {/* Botón de voz */}
            <button
              className={`control-btn voice-btn ${isSpeaking ? 'speaking' : ''}`}
              onClick={() => isSpeaking ? stop() : speakModule('medicina')}
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

      {/* Tarjetas de resumen mejoradas */}
      <section className="stats-section" aria-labelledby="stats-title">
        <h2 id="stats-title" className="sr-only">Resumen de signos vitales</h2>
        <div className="stats-grid">
          <Speakable text={`Glucosa: ${estadisticas?.glucosa?.ultimo || 'sin datos'} miligramos por decilitro. ${estadisticas?.glucosa?.ultimo ? getNivelGlucosaTexto(estadisticas.glucosa.ultimo) : ''}`}>
            <button
              className={`stat-card-new glucosa ${estadisticas?.glucosa?.ultimo ? getNivelGlucosaColor(estadisticas.glucosa.ultimo) : ''}`}
              onClick={() => handleTabChange('glucosa')}
              aria-label={`Ver registros de glucosa. Último valor: ${estadisticas?.glucosa?.ultimo || 'sin datos'} mg/dL`}
            >
              <div className="stat-icon" aria-hidden="true">🩸</div>
              <div className="stat-content">
                <span className="stat-label">Glucosa</span>
                <span className="stat-value-big">
                  {estadisticas?.glucosa?.ultimo || '--'}
                  <small>mg/dL</small>
                </span>
                {estadisticas?.glucosa?.ultimo && (
                  <span className={`stat-status ${getNivelGlucosaColor(estadisticas.glucosa.ultimo)}`}>
                    {getNivelGlucosaTexto(estadisticas.glucosa.ultimo)}
                  </span>
                )}
              </div>
            </button>
          </Speakable>

          <Speakable text={`Presión arterial: ${estadisticas?.presion?.ultima_sistolica || 'sin datos'} sobre ${estadisticas?.presion?.ultima_diastolica || 'sin datos'} milímetros de mercurio. ${estadisticas?.presion?.ultima_sistolica ? getPresionTexto(estadisticas.presion.ultima_sistolica, estadisticas.presion.ultima_diastolica) : ''}`}>
            <button
              className={`stat-card-new presion ${estadisticas?.presion?.ultima_sistolica ? getPresionColor(estadisticas.presion.ultima_sistolica, estadisticas.presion.ultima_diastolica) : ''}`}
              onClick={() => handleTabChange('presion')}
              aria-label={`Ver registros de presión. Último valor: ${estadisticas?.presion?.ultima_sistolica || 'sin datos'}/${estadisticas?.presion?.ultima_diastolica || 'sin datos'} mmHg`}
            >
              <div className="stat-icon" aria-hidden="true">💓</div>
              <div className="stat-content">
                <span className="stat-label">Presión Arterial</span>
                <span className="stat-value-big">
                  {estadisticas?.presion?.ultima_sistolica || '--'}/{estadisticas?.presion?.ultima_diastolica || '--'}
                  <small>mmHg</small>
                </span>
                {estadisticas?.presion?.ultima_sistolica && (
                  <span className={`stat-status ${getPresionColor(estadisticas.presion.ultima_sistolica, estadisticas.presion.ultima_diastolica)}`}>
                    {getPresionTexto(estadisticas.presion.ultima_sistolica, estadisticas.presion.ultima_diastolica)}
                  </span>
                )}
              </div>
            </button>
          </Speakable>

          <Speakable text={`Dolor promedio: ${estadisticas?.dolor?.promedio ? Number(estadisticas.dolor.promedio).toFixed(1) : 'sin datos'} de 10. ${estadisticas?.dolor?.total_registros || 0} registros.`}>
            <button
              className="stat-card-new dolor"
              onClick={() => handleTabChange('dolor')}
              aria-label={`Ver registros de dolor. Promedio: ${estadisticas?.dolor?.promedio ? Number(estadisticas.dolor.promedio).toFixed(1) : 'sin datos'} de 10`}
            >
              <div className="stat-icon" aria-hidden="true">
                {estadisticas?.dolor?.promedio ? getDolorEmoji(estadisticas.dolor.promedio) : '🩹'}
              </div>
              <div className="stat-content">
                <span className="stat-label">Dolor Promedio</span>
                <span className="stat-value-big">
                  {estadisticas?.dolor?.promedio ? Number(estadisticas.dolor.promedio).toFixed(1) : '--'}
                  <small>/10</small>
                </span>
                {estadisticas?.dolor?.total_registros > 0 && (
                  <span className="stat-status neutral">
                    {estadisticas.dolor.total_registros} registros
                  </span>
                )}
              </div>
            </button>
          </Speakable>
        </div>
      </section>

      {/* Tabs mejorados */}
      <nav className="tabs-container" role="tablist" aria-label="Tipos de registro médico">
        <div className="tabs-new">
          {Object.entries(tabInfo).map(([key, info]) => (
            <button
              key={key}
              role="tab"
              id={`tab-${key}`}
              aria-selected={activeTab === key}
              aria-controls={`panel-${key}`}
              className={`tab-new ${activeTab === key ? 'active' : ''}`}
              onClick={() => handleTabChange(key)}
              onFocus={() => settings.autoSpeak && speak(info.label)}
              style={activeTab === key ? { '--tab-color': info.color } : {}}
            >
              <span className="tab-icon" aria-hidden="true">{info.icon}</span>
              <span className="tab-label">{info.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Botón de nuevo registro flotante */}
      <button
        className="fab-button"
        onClick={() => abrirModal(activeTab)}
        style={{ '--fab-color': tabInfo[activeTab].color }}
        aria-label={`Agregar nuevo registro de ${tabInfo[activeTab].label}`}
      >
        <span className="fab-icon" aria-hidden="true">+</span>
        <span className="fab-text">Nuevo registro</span>
      </button>

      {/* Contenido principal */}
      <main id="main-content" ref={mainContentRef} tabIndex="-1">
        {loading ? (
          <div className="loading-container" role="status" aria-live="polite">
            <div className="spinner" aria-hidden="true"></div>
            <p>Cargando registros...</p>
          </div>
        ) : (
          <div className="registros-container">
            {activeTab === 'glucosa' && (
              <div
                role="tabpanel"
                id="panel-glucosa"
                aria-labelledby="tab-glucosa"
                className="registros-list"
              >
                {registros.length > 0 ? registros.map(registro => (
                  <article
                    key={registro.id}
                    className={`registro-card-new ${getNivelGlucosaColor(registro.nivel_glucosa)}`}
                    aria-label={`Glucosa ${registro.nivel_glucosa} mg/dL, nivel ${getNivelGlucosaTexto(registro.nivel_glucosa)}`}
                  >
                    <div className="registro-left">
                      <div className="registro-icon-circle glucosa" aria-hidden="true">
                        🩸
                      </div>
                    </div>
                    <div className="registro-center">
                      <div className="registro-main-value">
                        <span className="big-number">{registro.nivel_glucosa}</span>
                        <span className="unit">mg/dL</span>
                      </div>
                      <div className="registro-meta">
                        <span className={`status-badge ${getNivelGlucosaColor(registro.nivel_glucosa)}`}>
                          {getNivelGlucosaTexto(registro.nivel_glucosa)}
                        </span>
                        <span className="momento-badge">{registro.momento?.replace('_', ' ')}</span>
                      </div>
                      {registro.notas && <p className="registro-notas">{registro.notas}</p>}
                    </div>
                    <div className="registro-right">
                      <span className="tiempo-relativo">{formatFechaRelativa(registro.fecha_hora)}</span>
                      <button
                        className="btn-voice-small"
                        onClick={() => speakRegistro(registro, 'glucosa')}
                        aria-label="Escuchar registro"
                      >
                        🔊
                      </button>
                    </div>
                  </article>
                )) : (
                  <div className="empty-state-new" role="status">
                    <div className="empty-icon" aria-hidden="true">🩸</div>
                    <h3>Sin registros de glucosa</h3>
                    <p>Registra tu nivel de glucosa para llevar un control de tu salud</p>
                    <button
                      className="btn-empty"
                      onClick={() => abrirModal('glucosa')}
                      aria-label="Registrar glucosa ahora"
                    >
                      Registrar ahora
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'presion' && (
              <div
                role="tabpanel"
                id="panel-presion"
                aria-labelledby="tab-presion"
                className="registros-list"
              >
                {registros.length > 0 ? registros.map(registro => (
                  <article
                    key={registro.id}
                    className={`registro-card-new ${getPresionColor(registro.sistolica, registro.diastolica)}`}
                    aria-label={`Presión ${registro.sistolica}/${registro.diastolica} mmHg, ${getPresionTexto(registro.sistolica, registro.diastolica)}`}
                  >
                    <div className="registro-left">
                      <div className="registro-icon-circle presion" aria-hidden="true">
                        💓
                      </div>
                    </div>
                    <div className="registro-center">
                      <div className="registro-main-value presion-display">
                        <div className="presion-numbers">
                          <span className="big-number">{registro.sistolica}</span>
                          <span className="presion-separator" aria-hidden="true">/</span>
                          <span className="big-number">{registro.diastolica}</span>
                          <span className="unit">mmHg</span>
                        </div>
                        <div className="pulso-badge">
                          <span className="pulso-heart" aria-hidden="true">❤️</span>
                          <span>{registro.pulso} bpm</span>
                        </div>
                      </div>
                      <div className="registro-meta">
                        <span className={`status-badge ${getPresionColor(registro.sistolica, registro.diastolica)}`}>
                          {getPresionTexto(registro.sistolica, registro.diastolica)}
                        </span>
                      </div>
                      {registro.notas && <p className="registro-notas">{registro.notas}</p>}
                    </div>
                    <div className="registro-right">
                      <span className="tiempo-relativo">{formatFechaRelativa(registro.fecha_hora)}</span>
                      <button
                        className="btn-voice-small"
                        onClick={() => speakRegistro(registro, 'presion')}
                        aria-label="Escuchar registro"
                      >
                        🔊
                      </button>
                    </div>
                  </article>
                )) : (
                  <div className="empty-state-new" role="status">
                    <div className="empty-icon" aria-hidden="true">💓</div>
                    <h3>Sin registros de presión</h3>
                    <p>Monitorea tu presión arterial regularmente</p>
                    <button
                      className="btn-empty"
                      onClick={() => abrirModal('presion')}
                      aria-label="Registrar presión ahora"
                    >
                      Registrar ahora
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'dolor' && (
              <div
                role="tabpanel"
                id="panel-dolor"
                aria-labelledby="tab-dolor"
                className="registros-list"
              >
                {registros.length > 0 ? registros.map(registro => (
                  <article
                    key={registro.id}
                    className="registro-card-new dolor"
                    aria-label={`Dolor nivel ${registro.nivel_dolor} de 10, ubicación ${registro.ubicacion}`}
                  >
                    <div className="registro-left">
                      <div className="registro-icon-circle dolor" style={{ fontSize: '1.5rem' }} aria-hidden="true">
                        {getDolorEmoji(registro.nivel_dolor)}
                      </div>
                    </div>
                    <div className="registro-center">
                      <div className="dolor-visual-new">
                        <div
                          className="dolor-bar-container"
                          role="progressbar"
                          aria-valuenow={registro.nivel_dolor}
                          aria-valuemin="0"
                          aria-valuemax="10"
                          aria-label={`Nivel de dolor: ${registro.nivel_dolor} de 10`}
                        >
                          <div
                            className="dolor-bar-fill"
                            style={{
                              width: `${registro.nivel_dolor * 10}%`,
                              background: getDolorColor(registro.nivel_dolor)
                            }}
                          ></div>
                        </div>
                        <span className="dolor-value" style={{ color: getDolorColor(registro.nivel_dolor) }}>
                          {registro.nivel_dolor}/10
                        </span>
                      </div>
                      <div className="registro-meta">
                        <span className="ubicacion-badge">
                          <span aria-hidden="true">📍</span> {registro.ubicacion}
                        </span>
                        <span className="tipo-badge">{registro.tipo_dolor}</span>
                      </div>
                      {registro.notas && <p className="registro-notas">{registro.notas}</p>}
                    </div>
                    <div className="registro-right">
                      <span className="tiempo-relativo">{formatFechaRelativa(registro.fecha_hora)}</span>
                      <button
                        className="btn-voice-small"
                        onClick={() => speakRegistro(registro, 'dolor')}
                        aria-label="Escuchar registro"
                      >
                        🔊
                      </button>
                    </div>
                  </article>
                )) : (
                  <div className="empty-state-new" role="status">
                    <div className="empty-icon" aria-hidden="true">🩹</div>
                    <h3>Sin registros de dolor</h3>
                    <p>Lleva un diario de dolor para ayudar a tu médico</p>
                    <button
                      className="btn-empty"
                      onClick={() => abrirModal('dolor')}
                      aria-label="Registrar dolor ahora"
                    >
                      Registrar ahora
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal mejorado */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="modal-content-new" onClick={e => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowModal(false)}
              aria-label="Cerrar formulario"
            >
              ×
            </button>

            {modalType === 'glucosa' && (
              <>
                <div className="modal-header">
                  <div className="modal-icon glucosa" aria-hidden="true">🩸</div>
                  <h2 id="modal-title">Registrar Glucosa</h2>
                </div>
                <form onSubmit={handleSubmitGlucosa}>
                  <div className="form-group-new">
                    <label htmlFor="nivel-glucosa">Nivel de Glucosa</label>
                    <div className="input-with-unit">
                      <input
                        type="number"
                        id="nivel-glucosa"
                        value={glucosaForm.nivel_glucosa}
                        onChange={e => setGlucosaForm({...glucosaForm, nivel_glucosa: e.target.value})}
                        className="input-large"
                        placeholder="100"
                        min="20"
                        max="600"
                        required
                        aria-describedby="glucosa-helper"
                      />
                      <span className="input-unit" aria-hidden="true">mg/dL</span>
                    </div>
                    <div id="glucosa-helper" className="input-helper">
                      <span className="helper-item normal">70-100: Normal en ayunas</span>
                    </div>
                  </div>
                  <div className="form-group-new">
                    <label id="momento-label">Momento de la medición</label>
                    <div className="pill-selector" role="radiogroup" aria-labelledby="momento-label">
                      {[
                        { value: 'ayunas', label: 'En ayunas', icon: '🌅' },
                        { value: 'antes_comida', label: 'Antes de comer', icon: '🍽️' },
                        { value: 'despues_comida', label: 'Después de comer', icon: '⏰' },
                        { value: 'antes_dormir', label: 'Antes de dormir', icon: '🌙' }
                      ].map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          role="radio"
                          aria-checked={glucosaForm.momento === opt.value}
                          className={`pill ${glucosaForm.momento === opt.value ? 'active' : ''}`}
                          onClick={() => setGlucosaForm({...glucosaForm, momento: opt.value})}
                        >
                          <span aria-hidden="true">{opt.icon}</span> {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group-new">
                    <label htmlFor="glucosa-notas">Notas (opcional)</label>
                    <textarea
                      id="glucosa-notas"
                      value={glucosaForm.notas}
                      onChange={e => setGlucosaForm({...glucosaForm, notas: e.target.value})}
                      className="textarea-new"
                      rows="2"
                      placeholder="¿Algo que quieras anotar?"
                    />
                  </div>
                  <div className="modal-actions-new">
                    <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn-submit glucosa" disabled={saving}>
                      {saving ? 'Guardando...' : 'Guardar registro'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {modalType === 'presion' && (
              <>
                <div className="modal-header">
                  <div className="modal-icon presion" aria-hidden="true">💓</div>
                  <h2 id="modal-title">Registrar Presión Arterial</h2>
                </div>
                <form onSubmit={handleSubmitPresion}>
                  <div className="form-row-new">
                    <div className="form-group-new">
                      <label htmlFor="sistolica">Sistólica (alta)</label>
                      <div className="input-with-unit">
                        <input
                          type="number"
                          id="sistolica"
                          value={presionForm.sistolica}
                          onChange={e => setPresionForm({...presionForm, sistolica: e.target.value})}
                          className="input-medium"
                          placeholder="120"
                          min="60"
                          max="250"
                          required
                        />
                        <span className="input-unit" aria-hidden="true">mmHg</span>
                      </div>
                    </div>
                    <div className="form-group-new">
                      <label htmlFor="diastolica">Diastólica (baja)</label>
                      <div className="input-with-unit">
                        <input
                          type="number"
                          id="diastolica"
                          value={presionForm.diastolica}
                          onChange={e => setPresionForm({...presionForm, diastolica: e.target.value})}
                          className="input-medium"
                          placeholder="80"
                          min="40"
                          max="150"
                          required
                        />
                        <span className="input-unit" aria-hidden="true">mmHg</span>
                      </div>
                    </div>
                  </div>
                  <div className="input-helper centered">
                    <span className="helper-item normal">Normal: 120/80 mmHg</span>
                  </div>
                  <div className="form-group-new">
                    <label htmlFor="pulso">Pulso cardíaco</label>
                    <div className="input-with-unit">
                      <input
                        type="number"
                        id="pulso"
                        value={presionForm.pulso}
                        onChange={e => setPresionForm({...presionForm, pulso: e.target.value})}
                        className="input-medium"
                        placeholder="70"
                        min="30"
                        max="200"
                        required
                      />
                      <span className="input-unit"><span aria-hidden="true">❤️</span> bpm</span>
                    </div>
                  </div>
                  <div className="form-group-new">
                    <label htmlFor="presion-notas">Notas (opcional)</label>
                    <textarea
                      id="presion-notas"
                      value={presionForm.notas}
                      onChange={e => setPresionForm({...presionForm, notas: e.target.value})}
                      className="textarea-new"
                      rows="2"
                      placeholder="¿Cómo te sentías?"
                    />
                  </div>
                  <div className="modal-actions-new">
                    <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn-submit presion" disabled={saving}>
                      {saving ? 'Guardando...' : 'Guardar registro'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {modalType === 'dolor' && (
              <>
                <div className="modal-header">
                  <div className="modal-icon dolor" aria-hidden="true">{getDolorEmoji(dolorForm.nivel_dolor)}</div>
                  <h2 id="modal-title">Registrar Dolor</h2>
                </div>
                <form onSubmit={handleSubmitDolor}>
                  <div className="form-group-new">
                    <label htmlFor="dolor-slider">¿Cuánto dolor sientes?</label>
                    <div className="dolor-slider-container">
                      <input
                        type="range"
                        id="dolor-slider"
                        min="0"
                        max="10"
                        value={dolorForm.nivel_dolor}
                        onChange={e => setDolorForm({...dolorForm, nivel_dolor: parseInt(e.target.value)})}
                        className="dolor-slider-new"
                        aria-valuetext={`${dolorForm.nivel_dolor} de 10`}
                        style={{
                          background: `linear-gradient(90deg, #4CAF50 0%, #FFEB3B 50%, #f44336 100%)`
                        }}
                      />
                      <div className="dolor-value-display" style={{ color: getDolorColor(dolorForm.nivel_dolor) }}>
                        <span className="dolor-emoji" aria-hidden="true">{getDolorEmoji(dolorForm.nivel_dolor)}</span>
                        <span className="dolor-number">{dolorForm.nivel_dolor}</span>
                      </div>
                    </div>
                    <div className="dolor-scale-labels" aria-hidden="true">
                      <span>Sin dolor</span>
                      <span>Dolor extremo</span>
                    </div>
                  </div>
                  <div className="form-group-new">
                    <label htmlFor="ubicacion">¿Dónde te duele?</label>
                    <input
                      type="text"
                      id="ubicacion"
                      value={dolorForm.ubicacion}
                      onChange={e => setDolorForm({...dolorForm, ubicacion: e.target.value})}
                      className="input-full"
                      placeholder="Ej: Rodilla derecha, muñón, espalda..."
                      required
                    />
                  </div>
                  <div className="form-group-new">
                    <label id="tipo-dolor-label">Tipo de dolor</label>
                    <div className="pill-selector wrap" role="radiogroup" aria-labelledby="tipo-dolor-label">
                      {[
                        { value: 'agudo', label: 'Punzante', icon: '⚡' },
                        { value: 'sordo', label: 'Constante', icon: '〰️' },
                        { value: 'pulsante', label: 'Pulsante', icon: '💫' },
                        { value: 'quemante', label: 'Quemante', icon: '🔥' },
                        { value: 'hormigueo', label: 'Hormigueo', icon: '✨' },
                        { value: 'fantasma', label: 'Fantasma', icon: '👻' }
                      ].map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          role="radio"
                          aria-checked={dolorForm.tipo_dolor === opt.value}
                          className={`pill small ${dolorForm.tipo_dolor === opt.value ? 'active' : ''}`}
                          onClick={() => setDolorForm({...dolorForm, tipo_dolor: opt.value})}
                        >
                          <span aria-hidden="true">{opt.icon}</span> {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group-new">
                    <label htmlFor="dolor-notas">Notas (opcional)</label>
                    <textarea
                      id="dolor-notas"
                      value={dolorForm.notas}
                      onChange={e => setDolorForm({...dolorForm, notas: e.target.value})}
                      className="textarea-new"
                      rows="2"
                      placeholder="¿Qué lo desencadenó? ¿Qué lo alivia?"
                    />
                  </div>
                  <div className="modal-actions-new">
                    <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn-submit dolor" disabled={saving}>
                      {saving ? 'Guardando...' : 'Guardar registro'}
                    </button>
                  </div>
                </form>
              </>
            )}
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

export default Medicina;
