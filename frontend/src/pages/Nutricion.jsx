import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import AccessibilityPanel, { AccessibilityFAB } from '../components/accessibility/AccessibilityPanel';
import api from '../services/api';
import VoiceHelper from '../components/VoiceHelper';
import '../styles/Nutricion.css';

const Nutricion = () => {
  const { user } = useAuth();
  const { settings } = useAccessibility();
  const [activeTab, setActiveTab] = useState('diario');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(true);

  // Obtener paciente_id con fallback al user.id
  const pacienteId = user?.paciente_id || user?.id;

  // Datos del día
  const [resumenDia, setResumenDia] = useState({
    calorias: { consumidas: 0, objetivo: 1800 },
    carbohidratos: { consumidas: 0, objetivo: 167 },
    proteinas: { consumidas: 0, objetivo: 93 },
    grasas: { consumidas: 0, objetivo: 49 }
  });

  // Agua
  const [agua, setAgua] = useState({
    consumida: 0,
    objetivo: 2.0,
    vasos: Array(8).fill(false)
  });

  // Comidas del día
  const [comidas, setComidas] = useState({
    desayuno: { items: [], calorias: 0, objetivo: 450 },
    almuerzo: { items: [], calorias: 0, objetivo: 550 },
    cena: { items: [], calorias: 0, objetivo: 450 },
    snacks: { items: [], calorias: 0, objetivo: 200 }
  });

  // Historial
  const [historialDias, setHistorialDias] = useState({});

  // Recetas
  const [recetas, setRecetas] = useState([]);

  // Modales
  const [showAddFood, setShowAddFood] = useState(false);
  const [tipoComidaActual, setTipoComidaActual] = useState('desayuno');
  const [showRecetaDetail, setShowRecetaDetail] = useState(null);
  const [alimentosBusqueda, setAlimentosBusqueda] = useState('');
  const [registrando, setRegistrando] = useState(false);

  // Alimentos predefinidos para la dieta de pacientes con prótesis/órtesis
  const alimentosPredefinidos = [
    { id: 1, nombre: 'Avena con frutas', calorias: 250, carbohidratos: 45, proteinas: 8, grasas: 5 },
    { id: 2, nombre: 'Huevos revueltos', calorias: 180, carbohidratos: 2, proteinas: 14, grasas: 12 },
    { id: 3, nombre: 'Pan integral con aguacate', calorias: 220, carbohidratos: 25, proteinas: 5, grasas: 12 },
    { id: 4, nombre: 'Yogurt natural con granola', calorias: 200, carbohidratos: 30, proteinas: 10, grasas: 5 },
    { id: 5, nombre: 'Fruta picada (manzana, plátano)', calorias: 120, carbohidratos: 30, proteinas: 1, grasas: 0 },
    { id: 6, nombre: 'Pollo a la plancha', calorias: 165, carbohidratos: 0, proteinas: 31, grasas: 4 },
    { id: 7, nombre: 'Arroz integral', calorias: 130, carbohidratos: 28, proteinas: 3, grasas: 1 },
    { id: 8, nombre: 'Ensalada verde', calorias: 50, carbohidratos: 10, proteinas: 2, grasas: 0 },
    { id: 9, nombre: 'Sopa de verduras', calorias: 80, carbohidratos: 15, proteinas: 3, grasas: 1 },
    { id: 10, nombre: 'Pescado al horno', calorias: 200, carbohidratos: 0, proteinas: 25, grasas: 10 },
    { id: 11, nombre: 'Lentejas guisadas', calorias: 180, carbohidratos: 30, proteinas: 12, grasas: 1 },
    { id: 12, nombre: 'Verduras al vapor', calorias: 60, carbohidratos: 12, proteinas: 3, grasas: 0 },
    { id: 13, nombre: 'Tortilla de maíz (2 pzas)', calorias: 100, carbohidratos: 20, proteinas: 3, grasas: 1 },
    { id: 14, nombre: 'Frijoles de olla', calorias: 140, carbohidratos: 25, proteinas: 9, grasas: 1 },
    { id: 15, nombre: 'Manzana', calorias: 58, carbohidratos: 14, proteinas: 0, grasas: 0 },
    { id: 16, nombre: 'Plátano', calorias: 89, carbohidratos: 23, proteinas: 1, grasas: 0 },
    { id: 17, nombre: 'Almendras (puño)', calorias: 160, carbohidratos: 6, proteinas: 6, grasas: 14 },
    { id: 18, nombre: 'Leche descremada', calorias: 90, carbohidratos: 12, proteinas: 8, grasas: 0 },
    { id: 19, nombre: 'Queso panela', calorias: 80, carbohidratos: 1, proteinas: 10, grasas: 4 },
    { id: 20, nombre: 'Atún en agua', calorias: 100, carbohidratos: 0, proteinas: 22, grasas: 1 }
  ];

  useEffect(() => {
    cargarDatosDia();
  }, [selectedDate]);

  useEffect(() => {
    if (activeTab === 'recetas') {
      cargarRecetas();
    }
  }, [activeTab]);

  const cargarDatosDia = async () => {
    setLoading(true);
    const fechaStr = selectedDate.toISOString().split('T')[0];

    try {
      // Cargar resumen del día
      const response = await api.get(`/nutricion/resumen/${pacienteId}/${fechaStr}`);
      if (response.data) {
        setResumenDia(response.data.macros || resumenDia);
        setComidas(response.data.comidas || comidas);
        setAgua(response.data.agua || agua);
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      // Usar datos de ejemplo
      setResumenDia(getDatosEjemplo().macros);
      setComidas(getDatosEjemplo().comidas);
    } finally {
      setLoading(false);
    }
  };

  const getDatosEjemplo = () => ({
    macros: {
      calorias: { consumidas: 308, objetivo: 1518 },
      carbohidratos: { consumidas: 28, objetivo: 167 },
      proteinas: { consumidas: 20, objetivo: 93 },
      grasas: { consumidas: 12, objetivo: 49 }
    },
    comidas: {
      desayuno: {
        items: [
          { id: 1, nombre: 'Avena con frutas', calorias: 250, carbohidratos: 45, proteinas: 8, grasas: 5 }
        ],
        calorias: 250,
        objetivo: 450
      },
      almuerzo: { items: [], calorias: 0, objetivo: 550 },
      cena: { items: [], calorias: 0, objetivo: 450 },
      snacks: {
        items: [
          { id: 2, nombre: 'Manzana', calorias: 58, carbohidratos: 14, proteinas: 0, grasas: 0 }
        ],
        calorias: 58,
        objetivo: 200
      }
    }
  });

  const cargarRecetas = async () => {
    try {
      const response = await api.get('/nutricion/recetas');
      setRecetas(response.data || []);
    } catch (err) {
      console.error('Error al cargar recetas:', err);
      setRecetas([]);
    }
  };

  const agregarVasoAgua = () => {
    const nuevosVasos = [...agua.vasos];
    const indexVacio = nuevosVasos.findIndex(v => !v);
    if (indexVacio !== -1) {
      nuevosVasos[indexVacio] = true;
      const nuevaConsumida = nuevosVasos.filter(v => v).length * 0.25;
      setAgua({ ...agua, vasos: nuevosVasos, consumida: nuevaConsumida });

      // Guardar en backend
      api.post('/nutricion/agua', {
        paciente_id: pacienteId,
        fecha: selectedDate.toISOString().split('T')[0],
        cantidad: nuevaConsumida
      }).catch(console.error);
    }
  };

  const quitarVasoAgua = () => {
    const nuevosVasos = [...agua.vasos];
    const indexLleno = nuevosVasos.map((v, i) => v ? i : -1).filter(i => i !== -1).pop();
    if (indexLleno !== undefined) {
      nuevosVasos[indexLleno] = false;
      const nuevaConsumida = nuevosVasos.filter(v => v).length * 0.25;
      setAgua({ ...agua, vasos: nuevosVasos, consumida: nuevaConsumida });
    }
  };

  const abrirAgregarComida = (tipo) => {
    setTipoComidaActual(tipo);
    setAlimentosBusqueda('');
    setShowAddFood(true);
  };

  const registrarAlimento = async (alimento) => {
    setRegistrando(true);
    try {
      // Agregar al estado local
      const nuevasComidas = { ...comidas };
      nuevasComidas[tipoComidaActual].items.push(alimento);
      nuevasComidas[tipoComidaActual].calorias += alimento.calorias;
      setComidas(nuevasComidas);

      // Actualizar resumen de macros
      setResumenDia(prev => ({
        ...prev,
        calorias: {
          ...prev.calorias,
          consumidas: prev.calorias.consumidas + alimento.calorias
        },
        carbohidratos: {
          ...prev.carbohidratos,
          consumidas: prev.carbohidratos.consumidas + alimento.carbohidratos
        },
        proteinas: {
          ...prev.proteinas,
          consumidas: prev.proteinas.consumidas + alimento.proteinas
        },
        grasas: {
          ...prev.grasas,
          consumidas: prev.grasas.consumidas + alimento.grasas
        }
      }));

      // Enviar al backend
      await api.post('/nutricion/alimento', {
        paciente_id: pacienteId,
        fecha: selectedDate.toISOString().split('T')[0],
        tipo_comida: tipoComidaActual,
        alimento_nombre: alimento.nombre,
        calorias: alimento.calorias,
        carbohidratos: alimento.carbohidratos,
        proteinas: alimento.proteinas,
        grasas: alimento.grasas
      });

      setShowAddFood(false);
    } catch (err) {
      console.error('Error al registrar alimento:', err);
    } finally {
      setRegistrando(false);
    }
  };

  const getAlimentosFiltrados = () => {
    if (!alimentosBusqueda.trim()) {
      return alimentosPredefinidos;
    }
    return alimentosPredefinidos.filter(a =>
      a.nombre.toLowerCase().includes(alimentosBusqueda.toLowerCase())
    );
  };

  const formatearFecha = (fecha) => {
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    if (fecha.toDateString() === hoy.toDateString()) {
      return fecha.toLocaleDateString('es-MX', { weekday: 'short' });
    } else if (fecha.toDateString() === ayer.toDateString()) {
      return 'Ayer';
    }
    return fecha.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'numeric' });
  };

  const cambiarDia = (dias) => {
    const nuevaFecha = new Date(selectedDate);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    if (nuevaFecha <= new Date()) {
      setSelectedDate(nuevaFecha);
    }
  };

  const getSemanaDelMes = () => {
    const primerDiaMes = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const diasTranscurridos = Math.ceil((selectedDate - primerDiaMes) / (1000 * 60 * 60 * 24));
    return Math.ceil((diasTranscurridos + primerDiaMes.getDay()) / 7);
  };

  const renderCalendario = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const primerDia = new Date(year, month, 1);
    const ultimoDia = new Date(year, month + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const primerDiaSemana = primerDia.getDay();

    const dias = [];
    for (let i = 0; i < primerDiaSemana; i++) {
      dias.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fecha = new Date(year, month, dia);
      const esHoy = fecha.toDateString() === new Date().toDateString();
      const esSeleccionado = fecha.toDateString() === selectedDate.toDateString();
      const tieneDatos = historialDias[fecha.toISOString().split('T')[0]];
      const esFuturo = fecha > new Date();

      dias.push(
        <div
          key={dia}
          className={`calendar-day ${esHoy ? 'today' : ''} ${esSeleccionado ? 'selected' : ''} ${tieneDatos ? 'has-data' : ''} ${esFuturo ? 'future' : ''}`}
          onClick={() => !esFuturo && setSelectedDate(fecha)}
        >
          <span className="day-number">{dia}</span>
          {tieneDatos && <span className="day-indicator"></span>}
        </div>
      );
    }

    return dias;
  };

  const renderMacroCircle = () => {
    const { calorias } = resumenDia;
    const porcentaje = Math.min((calorias.consumidas / calorias.objetivo) * 100, 100);
    const circunferencia = 2 * Math.PI * 45;
    const offset = circunferencia - (porcentaje / 100) * circunferencia;

    return (
      <div className="macro-circle-container">
        <svg className="macro-circle" viewBox="0 0 100 100">
          <circle
            className="macro-circle-bg"
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#2d3748"
            strokeWidth="8"
          />
          <circle
            className="macro-circle-progress"
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circunferencia}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00d4aa" />
              <stop offset="100%" stopColor="#00bcd4" />
            </linearGradient>
          </defs>
        </svg>
        <div className="macro-circle-content">
          <span className="macro-value">{calorias.objetivo - calorias.consumidas}</span>
          <span className="macro-label">Restantes</span>
        </div>
      </div>
    );
  };

  return (
    <div className="nutricion-page dark-theme">
      {/* Ayuda por voz */}
      <VoiceHelper currentModule="nutricion" />

      {/* Header con fecha */}
      <header className="nutricion-header">
        <div className="date-nav">
          <button className="date-arrow" onClick={() => cambiarDia(-1)}>‹</button>
          <div className="date-display" onClick={() => setShowCalendar(true)}>
            <span className="date-text">{formatearFecha(selectedDate)}</span>
            {selectedDate.toDateString() !== new Date().toDateString() && (
              <span className="date-full">, {selectedDate.getDate()}/{selectedDate.getMonth() + 1}</span>
            )}
          </div>
          <button
            className="date-arrow"
            onClick={() => cambiarDia(1)}
            disabled={selectedDate.toDateString() === new Date().toDateString()}
          >
            ›
          </button>
        </div>
        <div className="header-stats">
          <button className="calendar-btn" onClick={() => setShowCalendar(true)}>📅</button>
        </div>
      </header>

      {/* Semana */}
      <div className="week-indicator">Semana {getSemanaDelMes()}</div>

      {/* Tabs */}
      <div className="nutricion-tabs">
        <button
          className={`nutricion-tab ${activeTab === 'diario' ? 'active' : ''}`}
          onClick={() => setActiveTab('diario')}
        >
          Diario
        </button>
        <button
          className={`nutricion-tab ${activeTab === 'recetas' ? 'active' : ''}`}
          onClick={() => setActiveTab('recetas')}
        >
          Recetas
        </button>
      </div>

      {/* Contenido */}
      <div className="nutricion-content">
        {activeTab === 'diario' && (
          <>
            {/* Resumen de macros */}
            <section className="section-card resumen-section">
              <div className="section-header">
                <h2>Resumen</h2>
              </div>

              <div className="macros-display">
                <div className="macro-stat">
                  <span className="macro-number">{resumenDia.calorias.consumidas}</span>
                  <span className="macro-name">Consumidas</span>
                </div>

                {renderMacroCircle()}

                <div className="macro-stat">
                  <span className="macro-number">0</span>
                  <span className="macro-name">Quemadas</span>
                </div>
              </div>

              <div className="macros-bars">
                <div className="macro-bar-item">
                  <span className="macro-bar-dot carbos"></span>
                  <span className="macro-bar-label">Carbohidratos</span>
                  <div className="macro-bar-track">
                    <div
                      className="macro-bar-fill carbos"
                      style={{ width: `${Math.min((resumenDia.carbohidratos.consumidas / resumenDia.carbohidratos.objetivo) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="macro-bar-value">{resumenDia.carbohidratos.consumidas} / {resumenDia.carbohidratos.objetivo} g</span>
                </div>

                <div className="macro-bar-item">
                  <span className="macro-bar-dot proteinas"></span>
                  <span className="macro-bar-label">Proteínas</span>
                  <div className="macro-bar-track">
                    <div
                      className="macro-bar-fill proteinas"
                      style={{ width: `${Math.min((resumenDia.proteinas.consumidas / resumenDia.proteinas.objetivo) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="macro-bar-value">{resumenDia.proteinas.consumidas} / {resumenDia.proteinas.objetivo} g</span>
                </div>

                <div className="macro-bar-item">
                  <span className="macro-bar-dot grasas"></span>
                  <span className="macro-bar-label">Grasas</span>
                  <div className="macro-bar-track">
                    <div
                      className="macro-bar-fill grasas"
                      style={{ width: `${Math.min((resumenDia.grasas.consumidas / resumenDia.grasas.objetivo) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="macro-bar-value">{resumenDia.grasas.consumidas} / {resumenDia.grasas.objetivo} g</span>
                </div>
              </div>

            </section>

            {/* Alimentación */}
            <section className="section-card alimentacion-section">
              <div className="section-header">
                <h2>Alimentación</h2>
              </div>

              <div className="meals-list">
                {[
                  { key: 'desayuno', nombre: 'Desayuno', icon: '☕', data: comidas.desayuno },
                  { key: 'almuerzo', nombre: 'Almuerzo', icon: '🍱', data: comidas.almuerzo },
                  { key: 'cena', nombre: 'Cena', icon: '🥗', data: comidas.cena },
                  { key: 'snacks', nombre: 'Snacks', icon: '⏳', data: comidas.snacks }
                ].map(meal => (
                  <div key={meal.key} className="meal-item">
                    <div className="meal-icon">{meal.icon}</div>
                    <div className="meal-info">
                      <span className="meal-name">{meal.nombre} →</span>
                      <span className="meal-calories">{meal.data.calorias} / {meal.data.objetivo} kcal</span>
                      {meal.data.items.length > 0 && (
                        <span className="meal-items-preview">
                          {meal.data.items.map(i => i.nombre).join(', ')}
                        </span>
                      )}
                    </div>
                    <button
                      className="meal-add-btn"
                      onClick={() => abrirAgregarComida(meal.key)}
                    >
                      +
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Registro de agua */}
            <section className="section-card agua-section">
              <h2>Registro de agua</h2>

              <div className="agua-display">
                <h3>Agua</h3>
                <p className="agua-objetivo">Objetivo: {agua.objetivo.toFixed(2)} litros</p>
                <p className="agua-consumida">{agua.consumida.toFixed(2)} L</p>

                <div className="agua-vasos">
                  <button className="vaso-btn add" onClick={agregarVasoAgua}>
                    <span className="vaso-icon empty">🥛</span>
                    <span className="plus">+</span>
                  </button>
                  {agua.vasos.map((lleno, i) => (
                    <button
                      key={i}
                      className={`vaso-btn ${lleno ? 'filled' : ''}`}
                      onClick={lleno ? quitarVasoAgua : agregarVasoAgua}
                    >
                      <span className="vaso-icon">{lleno ? '💧' : '🥛'}</span>
                    </button>
                  ))}
                </div>

                <p className="agua-alimentos">+ Agua de los alimentos: 0 mL</p>
              </div>
            </section>

          </>
        )}

        {activeTab === 'recetas' && (
          <>
            {/* Introducción */}
            <div className="recetas-intro">
              <p className="intro-text">
                Aquí encontrarás las recetas recomendadas por tu nutriólogo para apoyar tu recuperación.
              </p>
            </div>

            {/* Recetas asignadas */}
            <section className="recetas-list-section">
              <h3>Recetas recomendadas</h3>
              {recetas.length > 0 ? (
                <div className="recetas-grid">
                  {recetas.map(receta => (
                    <div
                      key={receta.id}
                      className="receta-card-new"
                      onClick={() => setShowRecetaDetail(receta)}
                    >
                      <div className="receta-image">
                        {receta.imagen ? (
                          <img src={receta.imagen} alt={receta.titulo} />
                        ) : (
                          <div className="receta-placeholder">
                            <span>🍽️</span>
                          </div>
                        )}
                      </div>
                      <div className="receta-info-new">
                        <h4>{receta.titulo}</h4>
                        <div className="receta-meta-new">
                          <span>⏱️ {receta.tiempo} min</span>
                          <span>🔥 {receta.calorias} kcal</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <span className="empty-icon">📋</span>
                  <p>No tienes recetas asignadas aún</p>
                  <p className="help-text">Tu nutriólogo te asignará recetas personalizadas</p>
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* Modal Calendario */}
      {showCalendar && (
        <div className="modal-overlay" onClick={() => setShowCalendar(false)}>
          <div className="modal-content calendar-modal" onClick={e => e.stopPropagation()}>
            <div className="calendar-header">
              <button className="modal-close" onClick={() => setShowCalendar(false)}>×</button>
              <h2>{selectedDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</h2>
              <button className="calendar-icon-btn">📅</button>
            </div>

            <div className="calendar-nav">
              <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}>‹</button>
              <span>{selectedDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}</span>
              <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}>›</button>
            </div>

            <div className="calendar-grid">
              <div className="calendar-weekdays">
                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
                  <span key={i}>{d}</span>
                ))}
              </div>
              <div className="calendar-days">
                {renderCalendario()}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Modal Agregar Comida */}
      {showAddFood && (
        <div className="modal-overlay" onClick={() => setShowAddFood(false)}>
          <div className="modal-content add-food-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAddFood(false)}>×</button>
            <h2>Agregar a {tipoComidaActual.charAt(0).toUpperCase() + tipoComidaActual.slice(1)}</h2>

            <div className="search-food">
              <input
                type="text"
                placeholder="Buscar alimento..."
                className="search-input"
                value={alimentosBusqueda}
                onChange={(e) => setAlimentosBusqueda(e.target.value)}
              />
            </div>

            <div className="food-suggestions">
              <h4>Alimentos disponibles</h4>
              <div className="food-list">
                {getAlimentosFiltrados().map((alimento) => (
                  <div key={alimento.id} className="food-suggestion-item">
                    <div className="food-info">
                      <span className="food-name">{alimento.nombre}</span>
                      <span className="food-macros">
                        {alimento.calorias} kcal · C:{alimento.carbohidratos}g · P:{alimento.proteinas}g · G:{alimento.grasas}g
                      </span>
                    </div>
                    <button
                      className="add-food-btn"
                      onClick={() => registrarAlimento(alimento)}
                      disabled={registrando}
                    >
                      {registrando ? '...' : '+'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle Receta */}
      {showRecetaDetail && (
        <div className="modal-overlay" onClick={() => setShowRecetaDetail(null)}>
          <div className="modal-content receta-detail-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowRecetaDetail(null)}>×</button>

            <div className="receta-detail-header">
              {showRecetaDetail.imagen ? (
                <img src={showRecetaDetail.imagen} alt={showRecetaDetail.titulo} />
              ) : (
                <div className="receta-detail-placeholder">🍽️</div>
              )}
            </div>

            <div className="receta-detail-content">
              <h2>{showRecetaDetail.titulo}</h2>

              <div className="receta-detail-meta">
                <span>⏱️ {showRecetaDetail.tiempo} min</span>
                <span>🔥 {showRecetaDetail.calorias} kcal</span>
              </div>

              <div className="receta-detail-section">
                <h3>Ingredientes</h3>
                <ul>
                  {showRecetaDetail.ingredientes?.map((ing, i) => (
                    <li key={i}>{ing}</li>
                  ))}
                </ul>
              </div>

              <div className="receta-detail-section">
                <h3>Preparación</h3>
                <p>{showRecetaDetail.preparacion}</p>
              </div>

              <button className="btn btn-primary btn-block">Agregar al diario</button>
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

export default Nutricion;
