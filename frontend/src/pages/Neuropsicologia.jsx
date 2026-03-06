import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import AccessibilityPanel, { AccessibilityFAB } from '../components/accessibility/AccessibilityPanel';
import CuestionarioActivo from '../components/neuropsicologia/CuestionarioActivo';
import CuestionarioResultado from '../components/neuropsicologia/CuestionarioResultado';
import ACTEjercicioActivo from '../components/neuropsicologia/ACTEjercicioActivo';
import { CUESTIONARIOS, ACT_CATEGORIAS, getHerramientasByCategoria, getCuestionarioById, calcularPuntuacion } from '../data/neuropsicologiaData';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler, Title, Tooltip, Legend } from 'chart.js';
import api from '../services/api';
import LucideIcon from '../components/LucideIcon';
import '../styles/Neuropsicologia.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler, Title, Tooltip, Legend);

const Neuropsicologia = () => {
  const { user } = useAuth();
  const { settings } = useAccessibility();
  const [activeTab, setActiveTab] = useState('animo');
  const [estadosAnimo, setEstadosAnimo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Estado de ánimo
  const [emocionSeleccionada, setEmocionSeleccionada] = useState(null);
  const [notasAnimo, setNotasAnimo] = useState('');

  // ACT Ejercicios
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [herramientaActiva, setHerramientaActiva] = useState(null);
  const [historialACT, setHistorialACT] = useState([]);

  // Cuestionarios
  const [cuestionarioActivo, setCuestionarioActivo] = useState(null);
  const [resultadoActivo, setResultadoActivo] = useState(null);
  const [cuestionarioResultado, setCuestionarioResultado] = useState(null);
  const [historialCuestionarios, setHistorialCuestionarios] = useState([]);

  // Perfil neuropsicológico
  const [evaluacion, setEvaluacion] = useState(null);
  const [historialEval, setHistorialEval] = useState([]);
  const [showModalEval, setShowModalEval] = useState(false);
  const [evalForm, setEvalForm] = useState({});
  const [evalNotas, setEvalNotas] = useState('');
  const [savingEval, setSavingEval] = useState(false);

  const emociones = [
    { id: 'feliz', nombre: 'Feliz', icon: 'smile', color: '#2E7D32' },
    { id: 'tranquilo', nombre: 'Tranquilo', icon: 'smile', color: '#1976D2' },
    { id: 'neutral', nombre: 'Neutral', icon: 'meh', color: '#9E9E9E' },
    { id: 'ansioso', nombre: 'Ansioso', icon: 'frown', color: '#E65100' },
    { id: 'triste', nombre: 'Triste', icon: 'frown', color: '#283593' },
    { id: 'enojado', nombre: 'Enojado', icon: 'angry', color: '#C62828' },
    { id: 'frustrado', nombre: 'Frustrado', icon: 'angry', color: '#AD1457' },
    { id: 'agradecido', nombre: 'Agradecido', icon: 'heart-handshake', color: '#558B2F' }
  ];

  const FUNCIONES_COGNITIVAS = [
    { key: 'atencion_visual', label: 'Atención Visual' },
    { key: 'atencion_auditiva', label: 'Atención Auditiva' },
    { key: 'memoria_visual', label: 'Memoria Visual' },
    { key: 'memoria_auditiva', label: 'Memoria Auditiva' },
    { key: 'memoria_trabajo', label: 'Mem. Trabajo' },
    { key: 'funciones_ejecutivas', label: 'F. Ejecutivas' },
    { key: 'velocidad_procesamiento', label: 'Vel. Proceso' },
    { key: 'orientacion', label: 'Orientación' },
    { key: 'lenguaje', label: 'Lenguaje' },
    { key: 'razonamiento', label: 'Razonamiento' },
    { key: 'flexibilidad_cognitiva', label: 'Flex. Cognitiva' },
    { key: 'planificacion', label: 'Planificación' },
    { key: 'control_inhibitorio', label: 'Ctrl. Inhibitorio' },
    { key: 'praxias', label: 'Praxias' },
    { key: 'gnosias', label: 'Gnosias' },
    { key: 'calculo', label: 'Cálculo' },
    { key: 'comprension_verbal', label: 'Comp. Verbal' },
    { key: 'habilidades_visuoespaciales', label: 'Visuoespacial' },
  ];

  const getColorSemaforo = (valor) => {
    if (valor === null || valor === undefined) return '#6E7681';
    if (valor <= 3) return '#C62828';
    if (valor <= 6) return '#E65100';
    return '#2E7D32';
  };

  const getNivelSemaforo = (valor) => {
    if (valor === null || valor === undefined) return 'Sin evaluar';
    if (valor <= 3) return 'Oportunidad';
    if (valor <= 6) return 'Promedio';
    return 'Fortaleza';
  };

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
        try {
          const response = await api.get(`/neuropsicologia/act/historial/${user.paciente_id}`);
          setHistorialACT(response.data || []);
        } catch (e) { /* historial no disponible aún */ }
      } else if (activeTab === 'cuestionarios') {
        try {
          const response = await api.get(`/neuropsicologia/cuestionarios/historial/${user.paciente_id}`);
          setHistorialCuestionarios(response.data || []);
        } catch (e) { /* historial no disponible aún */ }
      } else if (activeTab === 'perfil') {
        const pacId = user.paciente_id || user.id;
        try {
          const [evalRes, histRes] = await Promise.all([
            api.get(`/neuropsicologia/evaluacion/${pacId}`).catch(() => ({ data: null })),
            api.get(`/neuropsicologia/evaluacion/historial/${pacId}`).catch(() => ({ data: [] }))
          ]);
          setEvaluacion(evalRes.data || evalRes?.data);
          setHistorialEval(histRes.data || []);
        } catch (e) { /* no hay evaluaciones aún */ }
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

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
    return emociones.find(e => e.id === emocionId) || { icon: 'circle-help', nombre: emocionId, color: '#9E9E9E' };
  };

  const mapNivelToEmocion = (nivel) => {
    const map = { 1: 'enojado', 2: 'triste', 3: 'neutral', 4: 'tranquilo', 5: 'feliz' };
    return map[nivel] || 'neutral';
  };

  const mapBackendEmocion = (emocionBackend) => {
    if (!emocionBackend) return null;
    const map = {
      'alegria': 'feliz', 'calma': 'tranquilo', 'gratitud': 'agradecido',
      'confusion': 'neutral', 'ansiedad': 'ansioso', 'tristeza': 'triste',
      'frustracion': 'frustrado', 'enojo': 'enojado', 'esperanza': 'feliz',
      'miedo': 'ansioso', 'motivacion': 'feliz', 'soledad': 'triste'
    };
    return map[emocionBackend.toLowerCase()] || emocionBackend;
  };

  const calcularEstadisticas = () => {
    if (estadosAnimo.length === 0) return null;
    const conteo = {};
    estadosAnimo.forEach(estado => {
      const emocion = estado.emocion || mapBackendEmocion(estado.emociones_nombres) || mapNivelToEmocion(estado.nivel_animo);
      if (emocion) conteo[emocion] = (conteo[emocion] || 0) + 1;
    });
    const emocionMasComun = Object.entries(conteo).sort((a, b) => b[1] - a[1])[0];
    return { total: estadosAnimo.length, emocionMasComun: emocionMasComun ? emocionMasComun[0] : null, conteo };
  };

  // --- ACT handlers ---
  const handleIniciarHerramienta = (herramienta) => {
    setHerramientaActiva(herramienta);
  };

  const handleCompletarHerramienta = async (notasTexto) => {
    try {
      await api.post('/neuropsicologia/act/sesion', {
        paciente_id: user.paciente_id,
        categoria: herramientaActiva.categoriaId,
        herramienta: herramientaActiva.nombre,
        notas_usuario: notasTexto || null
      });
    } catch (e) {
      console.error('Error guardando sesión ACT:', e);
    }
    setHerramientaActiva(null);
    cargarDatos();
  };

  // --- Cuestionario handlers ---
  const handleIniciarCuestionario = (cuestionarioId) => {
    const c = getCuestionarioById(cuestionarioId);
    if (c) setCuestionarioActivo(c);
  };

  const handleCompletarCuestionario = async (respuestas) => {
    const resultado = calcularPuntuacion(cuestionarioActivo, respuestas);
    try {
      await api.post('/neuropsicologia/cuestionarios/resultado', {
        paciente_id: user.paciente_id,
        tipo_cuestionario: cuestionarioActivo.id,
        puntuacion_total: resultado.total,
        puntuacion_detalle: { respuestas, ...resultado },
        interpretacion: resultado.nivel
      });
    } catch (e) {
      console.error('Error guardando resultado:', e);
    }
    setCuestionarioResultado(cuestionarioActivo);
    setResultadoActivo(resultado);
    setCuestionarioActivo(null);
  };

  // --- Evaluación neuropsicológica handlers ---
  const handleGuardarEvaluacion = async () => {
    setSavingEval(true);
    try {
      await api.post('/neuropsicologia/evaluacion', {
        paciente_id: user.paciente_id || user.id,
        especialista_id: user.especialista_id || user.id,
        fecha: new Date().toISOString().split('T')[0],
        notas: evalNotas,
        ...evalForm
      });
      setShowModalEval(false);
      setEvalForm({});
      setEvalNotas('');
      cargarDatos();
    } catch (e) {
      console.error('Error guardando evaluación:', e);
    } finally {
      setSavingEval(false);
    }
  };

  const buildChartData = (evalData) => {
    if (!evalData) return null;
    const labels = [];
    const values = [];
    const colors = [];

    FUNCIONES_COGNITIVAS.forEach(fc => {
      const val = evalData[fc.key];
      if (val !== null && val !== undefined) {
        labels.push(fc.label);
        values.push(parseFloat(val));
        colors.push(getColorSemaforo(parseFloat(val)));
      }
    });

    if (values.length === 0) return null;

    return {
      labels,
      datasets: [{
        label: 'Puntaje',
        data: values,
        backgroundColor: colors,
        borderColor: colors.map(c => c),
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 28,
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    scales: {
      x: {
        min: 0,
        max: 10,
        ticks: {
          stepSize: 1,
          color: '#6B6B6B',
          font: { size: 13 }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.08)',
        }
      },
      y: {
        ticks: {
          color: '#1A1A1A',
          font: { size: 14, weight: '500' }
        },
        grid: { display: false }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#FFFFFF',
        titleColor: '#1A1A1A',
        bodyColor: '#1A1A1A',
        borderColor: '#E0E0E0',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (ctx) => {
            const val = ctx.parsed.x;
            return `${val}/10 - ${getNivelSemaforo(val)}`;
          }
        }
      }
    }
  };

  const stats = calcularEstadisticas();

  return (
    <div className="neuropsicologia-page">
      <header className="page-header">
        <h1>Neuropsicología</h1>
        <p className="subtitle">Cuida tu bienestar emocional y mental</p>
      </header>

      <div className="tabs">
        <button className={`tab ${activeTab === 'animo' ? 'active' : ''}`} onClick={() => setActiveTab('animo')}>
          Estado de Ánimo
        </button>
        <button className={`tab ${activeTab === 'ejercicios' ? 'active' : ''}`} onClick={() => setActiveTab('ejercicios')}>
          Herramientas ACT
        </button>
        <button className={`tab ${activeTab === 'cuestionarios' ? 'active' : ''}`} onClick={() => setActiveTab('cuestionarios')}>
          Cuestionarios
        </button>
        <button className={`tab ${activeTab === 'perfil' ? 'active' : ''}`} onClick={() => setActiveTab('perfil')}>
          Perfil Cognitivo
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando...</p>
        </div>
      ) : (
        <div className="tab-content">
          {/* ===== TAB: ESTADO DE ÁNIMO ===== */}
          {activeTab === 'animo' && (
            <div className="animo-section">
              <button className="btn btn-primary btn-lg btn-block" onClick={() => setShowModal(true)}>
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
                        <span className="stat-emoji"><LucideIcon name={getEmocionInfo(stats.emocionMasComun).icon} size={24} /></span>
                        <span className="stat-label">Más frecuente</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Gráficas de Estado de Ánimo */}
              {estadosAnimo.length >= 3 && (
                <div className="animo-charts">
                  {/* Gráfica de tendencia de ánimo */}
                  <div className="animo-chart-card">
                    <h3>Tendencia de ánimo</h3>
                    <div className="animo-chart-wrapper">
                      <Line
                        data={{
                          labels: [...estadosAnimo].reverse().slice(-14).map(e => {
                            const f = new Date(e.fecha_hora || e.fecha);
                            return `${f.getDate()}/${f.getMonth() + 1}`;
                          }),
                          datasets: [{
                            label: 'Nivel de ánimo',
                            data: [...estadosAnimo].reverse().slice(-14).map(e => e.nivel_animo || 3),
                            borderColor: '#9C27B0',
                            backgroundColor: 'rgba(156, 39, 176, 0.1)',
                            pointBackgroundColor: [...estadosAnimo].reverse().slice(-14).map(e => {
                              const emocionId = e.emocion || mapBackendEmocion(e.emociones_nombres) || mapNivelToEmocion(e.nivel_animo);
                              return getEmocionInfo(emocionId).color;
                            }),
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointRadius: 6,
                            pointHoverRadius: 8,
                            tension: 0.3,
                            fill: true,
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              min: 0.5,
                              max: 5.5,
                              ticks: {
                                stepSize: 1,
                                callback: (val) => {
                                  const labels = { 1: 'Muy Mal', 2: 'Mal', 3: 'Neutral', 4: 'Bien', 5: 'Muy Bien' };
                                  return labels[val] || '';
                                },
                                color: 'var(--text-secondary, #6B6B6B)',
                                font: { size: 11 }
                              },
                              grid: { color: 'rgba(0,0,0,0.06)' }
                            },
                            x: {
                              ticks: {
                                color: 'var(--text-secondary, #6B6B6B)',
                                font: { size: 11 }
                              },
                              grid: { display: false }
                            }
                          },
                          plugins: {
                            legend: { display: false },
                            tooltip: {
                              backgroundColor: 'rgba(0,0,0,0.8)',
                              padding: 10,
                              callbacks: {
                                label: (ctx) => {
                                  const labels = { 1: 'Muy Mal', 2: 'Mal', 3: 'Neutral', 4: 'Bien', 5: 'Muy Bien' };
                                  return labels[ctx.raw] || `Nivel ${ctx.raw}`;
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Gráfica de frecuencia de emociones */}
                  {stats?.conteo && Object.keys(stats.conteo).length > 0 && (
                    <div className="animo-chart-card">
                      <h3>Frecuencia de emociones</h3>
                      <div className="animo-chart-wrapper">
                        <Bar
                          data={{
                            labels: Object.keys(stats.conteo).map(e => {
                              const info = getEmocionInfo(e);
                              return info.nombre;
                            }),
                            datasets: [{
                              label: 'Veces registrado',
                              data: Object.values(stats.conteo),
                              backgroundColor: Object.keys(stats.conteo).map(e => getEmocionInfo(e).color + 'CC'),
                              borderColor: Object.keys(stats.conteo).map(e => getEmocionInfo(e).color),
                              borderWidth: 1,
                              borderRadius: 6,
                              barThickness: 28,
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            indexAxis: 'y',
                            scales: {
                              x: {
                                beginAtZero: true,
                                ticks: {
                                  stepSize: 1,
                                  color: 'var(--text-secondary, #6B6B6B)',
                                  font: { size: 11 }
                                },
                                grid: { color: 'rgba(0,0,0,0.06)' }
                              },
                              y: {
                                ticks: {
                                  color: 'var(--text-primary, #1A1A1A)',
                                  font: { size: 13, weight: '500' }
                                },
                                grid: { display: false }
                              }
                            },
                            plugins: {
                              legend: { display: false },
                              tooltip: {
                                backgroundColor: 'rgba(0,0,0,0.8)',
                                padding: 10,
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <h3>Historial reciente</h3>
              <div className="historial-animo">
                {estadosAnimo.length > 0 ? estadosAnimo.slice(0, 10).map(estado => {
                  const emocionId = estado.emocion || mapBackendEmocion(estado.emociones_nombres) || mapNivelToEmocion(estado.nivel_animo);
                  const emocion = getEmocionInfo(emocionId);
                  const fechaStr = estado.fecha_hora || `${estado.fecha} ${estado.created_at?.split(' ')[1] || '00:00:00'}`;
                  return (
                    <div key={estado.id} className="estado-card" style={{ borderLeftColor: emocion.color }}>
                      <div className="estado-header">
                        <span className="estado-emoji"><LucideIcon name={emocion.icon} size={20} /></span>
                        <span className="estado-nombre">{emocion.nombre}</span>
                        <span className="estado-fecha">
                          {new Date(fechaStr).toLocaleString('es-MX', { weekday: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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

          {/* ===== TAB: HERRAMIENTAS ACT ===== */}
          {activeTab === 'ejercicios' && (
            <div className="ejercicios-section">
              {!categoriaSeleccionada ? (
                <>
                  <p className="intro-text">
                    Herramientas de Terapia de Aceptación y Compromiso (ACT) basadas en Steven C. Hayes.
                    Elige una categoría para explorar.
                  </p>
                  <div className="act-categorias-grid">
                    {ACT_CATEGORIAS.map(cat => (
                      <div
                        key={cat.id}
                        className="act-categoria-card"
                        style={{ '--cat-color': cat.color }}
                        onClick={() => setCategoriaSeleccionada(cat)}
                      >
                        <span className="act-cat-emoji"><LucideIcon name={cat.icon} size={24} /></span>
                        <h3>{cat.nombre}</h3>
                        <p>{cat.descripcion}</p>
                        <span className="act-cat-count">3 herramientas</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <button className="btn-back" onClick={() => setCategoriaSeleccionada(null)}>
                    ← Volver a categorías
                  </button>
                  <div className="act-categoria-header" style={{ '--cat-color': categoriaSeleccionada.color }}>
                    <span className="act-cat-emoji-lg"><LucideIcon name={categoriaSeleccionada.icon} size={32} /></span>
                    <h2>{categoriaSeleccionada.nombre}</h2>
                    <p>{categoriaSeleccionada.descripcion}</p>
                  </div>
                  <div className="act-herramientas-list">
                    {getHerramientasByCategoria(categoriaSeleccionada.id).map(h => (
                      <div key={h.id} className="act-herramienta-card" style={{ '--cat-color': categoriaSeleccionada.color }}>
                        <div className="act-h-info">
                          <h3>{h.nombre}</h3>
                          <p>{h.descripcion}</p>
                          <div className="act-h-meta">
                            <span className="act-h-duracion"><LucideIcon name="alarm-clock" size={14} /> {h.duracion} min</span>
                            {h.tieneEscritura && <span className="act-h-tag"><LucideIcon name="pencil" size={14} /> Escritura</span>}
                          </div>
                        </div>
                        <button
                          className="btn btn-primary"
                          style={{ background: categoriaSeleccionada.color }}
                          onClick={() => handleIniciarHerramienta(h)}
                        >
                          Comenzar
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {historialACT.length > 0 && !categoriaSeleccionada && (
                <div className="historial-act">
                  <h3>Sesiones recientes</h3>
                  {historialACT.slice(0, 5).map(s => {
                    const cat = ACT_CATEGORIAS.find(c => c.id === s.categoria);
                    return (
                      <div key={s.id} className="act-sesion-item">
                        <span className="act-sesion-emoji"><LucideIcon name={cat?.icon || 'brain'} size={20} /></span>
                        <div className="act-sesion-info">
                          <span className="act-sesion-nombre">{s.herramienta}</span>
                          <span className="act-sesion-fecha">{new Date(s.fecha).toLocaleDateString('es-MX')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="recursos-adicionales">
                <h3>Recursos adicionales</h3>
                <ul>
                  <li>
                    <a href="tel:8009112000" className="recurso-link">
                      <LucideIcon name="phone" size={16} /> Línea de la Vida: 800 911 2000
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

          {/* ===== TAB: CUESTIONARIOS ===== */}
          {activeTab === 'cuestionarios' && (
            <div className="cuestionarios-section">
              <p className="intro-text">
                Cuestionarios validados de flexibilidad psicológica y valores. Tus respuestas son confidenciales y ayudan a personalizar tu tratamiento.
              </p>

              <div className="cuestionarios-list">
                {CUESTIONARIOS.map(c => (
                  <div key={c.id} className="cuestionario-card">
                    <div className="cuestionario-card-header">
                      <h3>{c.nombre}</h3>
                      {c.tiempo && <span className="cuestionario-tiempo"><LucideIcon name="alarm-clock" size={14} /> {c.tiempo} min</span>}
                    </div>
                    <p className="cuestionario-nombre-completo">{c.nombreCompleto}</p>
                    <p>{c.descripcion}</p>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleIniciarCuestionario(c.id)}
                    >
                      Comenzar
                    </button>
                  </div>
                ))}
              </div>

              {historialCuestionarios.length > 0 && (
                <div className="historial-cuestionarios">
                  <h3>Cuestionarios completados</h3>
                  {historialCuestionarios.map(c => (
                    <div key={c.id} className="cuestionario-completado">
                      <span className="cuestionario-nombre">{c.tipo_cuestionario}</span>
                      <span className="cuestionario-fecha">
                        {new Date(c.fecha).toLocaleDateString('es-MX')}
                      </span>
                      <span className="cuestionario-resultado">
                        Puntuación: {c.puntuacion_total}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== TAB: PERFIL COGNITIVO ===== */}
          {activeTab === 'perfil' && (
            <div className="perfil-section">
              <p className="intro-text">
                Perfil neuropsicológico basado en la evaluación de funciones cognitivas.
                Los colores indican el nivel de desempeño en cada área.
              </p>

              {/* Leyenda del semáforo */}
              <div className="semaforo-leyenda">
                <div className="leyenda-item">
                  <span className="leyenda-color" style={{ background: '#C62828' }}></span>
                  <span className="leyenda-texto">Oportunidad (0-3)</span>
                </div>
                <div className="leyenda-item">
                  <span className="leyenda-color" style={{ background: '#E65100' }}></span>
                  <span className="leyenda-texto">Promedio (4-6)</span>
                </div>
                <div className="leyenda-item">
                  <span className="leyenda-color" style={{ background: '#2E7D32' }}></span>
                  <span className="leyenda-texto">Fortaleza (7-10)</span>
                </div>
              </div>

              {evaluacion ? (
                <>
                  {/* Info de la evaluación */}
                  <div className="eval-info-card">
                    <div className="eval-info-row">
                      <span className="eval-info-label">Evaluado por:</span>
                      <span className="eval-info-value">{evaluacion.especialista_nombre || 'Especialista'}</span>
                    </div>
                    <div className="eval-info-row">
                      <span className="eval-info-label">Fecha:</span>
                      <span className="eval-info-value">
                        {new Date(evaluacion.fecha).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    {evaluacion.notas && (
                      <div className="eval-info-row">
                        <span className="eval-info-label">Notas:</span>
                        <span className="eval-info-value">{evaluacion.notas}</span>
                      </div>
                    )}
                  </div>

                  {/* Gráfico de barras */}
                  {buildChartData(evaluacion) && (
                    <div className="perfil-chart-container">
                      <h3>Perfil Neuropsicológico</h3>
                      <div className="perfil-chart-wrapper">
                        <Bar data={buildChartData(evaluacion)} options={chartOptions} />
                      </div>
                    </div>
                  )}

                  {/* Tabla de datos */}
                  <div className="perfil-tabla-container">
                    <h3>Detalle por función</h3>
                    <div className="perfil-tabla">
                      <div className="perfil-tabla-header">
                        <span>Función</span>
                        <span>Puntaje</span>
                        <span>Nivel</span>
                      </div>
                      {FUNCIONES_COGNITIVAS.map(fc => {
                        const val = evaluacion[fc.key];
                        if (val === null || val === undefined) return null;
                        const numVal = parseFloat(val);
                        return (
                          <div key={fc.key} className="perfil-tabla-row">
                            <span className="perfil-func-nombre">{fc.label}</span>
                            <span className="perfil-func-puntaje" style={{ color: getColorSemaforo(numVal) }}>
                              {numVal.toFixed(1)}
                            </span>
                            <span className="perfil-func-nivel" style={{ color: getColorSemaforo(numVal) }}>
                              {getNivelSemaforo(numVal)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Resumen por categoría */}
                  <div className="perfil-resumen">
                    <h3>Resumen</h3>
                    <div className="perfil-resumen-grid">
                      {['Fortaleza', 'Promedio', 'Oportunidad'].map(nivel => {
                        const funciones = FUNCIONES_COGNITIVAS.filter(fc => {
                          const val = evaluacion[fc.key];
                          return val !== null && val !== undefined && getNivelSemaforo(parseFloat(val)) === nivel;
                        });
                        const color = nivel === 'Fortaleza' ? '#2E7D32' : nivel === 'Promedio' ? '#E65100' : '#C62828';
                        return (
                          <div key={nivel} className="perfil-resumen-card" style={{ '--nivel-color': color }}>
                            <span className="resumen-count">{funciones.length}</span>
                            <span className="resumen-nivel" style={{ color }}>{nivel}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Historial de evaluaciones */}
                  {historialEval.length > 1 && (
                    <div className="historial-evaluaciones">
                      <h3>Evaluaciones anteriores</h3>
                      {historialEval.slice(1).map(ev => (
                        <div key={ev.id} className="eval-historial-item">
                          <span className="eval-hist-fecha">
                            {new Date(ev.fecha).toLocaleDateString('es-MX')}
                          </span>
                          <span className="eval-hist-especialista">
                            {ev.especialista_nombre || 'Especialista'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon"><LucideIcon name="brain" size={32} /></div>
                  <p>Aún no tienes una evaluación neuropsicológica</p>
                  <p className="help-text">Tu especialista realizará tu evaluación cognitiva durante tu consulta</p>
                </div>
              )}

              {/* Botón para especialista */}
              {(user?.rol === 'especialista' || user?.role === 'especialista') && (
                <button
                  className="btn btn-primary btn-lg btn-block eval-nueva-btn"
                  onClick={() => setShowModalEval(true)}
                >
                  Nueva Evaluación
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal de estado de ánimo */}
      {showModal && (
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
                  <span className="emocion-emoji"><LucideIcon name={emocion.icon} size={24} /></span>
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
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={registrarEstadoAnimo} disabled={!emocionSeleccionada}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cuestionario activo */}
      {cuestionarioActivo && (
        <CuestionarioActivo
          cuestionario={cuestionarioActivo}
          onComplete={handleCompletarCuestionario}
          onCancel={() => setCuestionarioActivo(null)}
        />
      )}

      {/* Modal: Resultado de cuestionario */}
      {resultadoActivo && cuestionarioResultado && (
        <CuestionarioResultado
          cuestionario={cuestionarioResultado}
          resultado={resultadoActivo}
          onClose={() => {
            setResultadoActivo(null);
            setCuestionarioResultado(null);
            cargarDatos();
          }}
        />
      )}

      {/* Modal: Ejercicio ACT activo */}
      {herramientaActiva && (
        <ACTEjercicioActivo
          herramienta={herramientaActiva}
          categoria={ACT_CATEGORIAS.find(c => c.id === herramientaActiva.categoriaId)}
          onComplete={handleCompletarHerramienta}
          onCancel={() => setHerramientaActiva(null)}
        />
      )}

      {/* Modal: Evaluación neuropsicológica (especialista) */}
      {showModalEval && (
        <div className="modal-overlay" onClick={() => setShowModalEval(false)}>
          <div className="modal-content eval-modal" onClick={e => e.stopPropagation()}>
            <h2>Nueva Evaluación Neuropsicológica</h2>
            <p className="modal-subtitle">Ingresa los puntajes de cada función cognitiva (0-10)</p>

            <div className="eval-form-grid">
              {FUNCIONES_COGNITIVAS.map(fc => (
                <div key={fc.key} className="eval-form-item">
                  <label>{fc.label}</label>
                  <div className="eval-input-wrapper">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={evalForm[fc.key] ?? ''}
                      onChange={e => setEvalForm(prev => ({ ...prev, [fc.key]: e.target.value }))}
                      className="eval-input"
                      placeholder="—"
                    />
                    {evalForm[fc.key] !== undefined && evalForm[fc.key] !== '' && (
                      <span
                        className="eval-input-indicator"
                        style={{ background: getColorSemaforo(parseFloat(evalForm[fc.key])) }}
                      ></span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="form-group">
              <label>Notas de la evaluación (opcional)</label>
              <textarea
                value={evalNotas}
                onChange={e => setEvalNotas(e.target.value)}
                className="form-control"
                rows="3"
                placeholder="Observaciones generales de la evaluación..."
              />
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModalEval(false)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleGuardarEvaluacion}
                disabled={savingEval || Object.keys(evalForm).filter(k => evalForm[k] !== '').length === 0}
              >
                {savingEval ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <AccessibilityPanel />
      <AccessibilityFAB />
    </div>
  );
};

export default Neuropsicologia;
