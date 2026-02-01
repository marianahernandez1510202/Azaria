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

  // Plan nutricional asignado
  const [planAsignado, setPlanAsignado] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  // Recetas (legacy)
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

  // Cargar el plan al inicio para sincronizar con el Diario
  useEffect(() => {
    cargarPlanNutricional();
  }, [pacienteId]);

  useEffect(() => {
    cargarDatosDia();
  }, [selectedDate]);

  // Sincronizar objetivos cuando se carga el plan
  useEffect(() => {
    // Verificar si hay calorías en cualquiera de los campos posibles
    const tieneCaloriasPlan = planAsignado?.tiene_plan && (
      planAsignado.calorias_diarias > 0 ||
      planAsignado.contenido?.totales?.calorias > 0
    );

    if (tieneCaloriasPlan) {
      sincronizarObjetivosConPlan();
    }
  }, [planAsignado]);

  const cargarDatosDia = async () => {
    setLoading(true);
    const fechaStr = selectedDate.toISOString().split('T')[0];

    try {
      // Cargar resumen del día
      const response = await api.get(`/nutricion/resumen/${pacienteId}/${fechaStr}`);
      if (response.data) {
        // Mantener los objetivos del plan si existen
        const objetivoActual = resumenDia.calorias.objetivo;
        const nuevosMacros = response.data.macros || resumenDia;

        // Si ya tenemos objetivos del plan, mantenerlos
        if (planAsignado?.tiene_plan && objetivoActual !== 1800) {
          nuevosMacros.calorias.objetivo = objetivoActual;
          nuevosMacros.proteinas.objetivo = resumenDia.proteinas.objetivo;
          nuevosMacros.carbohidratos.objetivo = resumenDia.carbohidratos.objetivo;
          nuevosMacros.grasas.objetivo = resumenDia.grasas.objetivo;
        }

        setResumenDia(nuevosMacros);
        setComidas(response.data.comidas || comidas);
        setAgua(response.data.agua || agua);
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      // Usar datos de ejemplo pero mantener objetivos del plan si existen
      const ejemplos = getDatosEjemplo();
      if (planAsignado?.tiene_plan) {
        ejemplos.macros.calorias.objetivo = resumenDia.calorias.objetivo;
        ejemplos.macros.proteinas.objetivo = resumenDia.proteinas.objetivo;
        ejemplos.macros.carbohidratos.objetivo = resumenDia.carbohidratos.objetivo;
        ejemplos.macros.grasas.objetivo = resumenDia.grasas.objetivo;
      }
      setResumenDia(ejemplos.macros);
      setComidas(ejemplos.comidas);
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

  // Sincronizar los objetivos del Diario con el plan nutricional
  const sincronizarObjetivosConPlan = (plan = planAsignado) => {
    if (!plan?.tiene_plan) return;

    // Obtener calorías del plan (priorizar campo directo, luego contenido JSON)
    const caloriasDirectas = Number(plan.calorias_diarias) || 0;
    const caloriasContenido = Number(plan.contenido?.totales?.calorias) || 0;

    console.log('Sincronizando plan:', {
      calorias_diarias: caloriasDirectas,
      contenido_totales_calorias: caloriasContenido
    });

    const caloriasTotales = caloriasDirectas > 0 ? caloriasDirectas : (caloriasContenido > 0 ? caloriasContenido : 1800);
    const proteinasTotales = Number(plan.proteinas_g) || Number(plan.contenido?.totales?.proteinas) || 93;
    const carbosTotales = Number(plan.carbohidratos_g) || Number(plan.contenido?.totales?.carbohidratos) || 167;
    const grasasTotales = Number(plan.grasas_g) || Number(plan.contenido?.totales?.grasas) || 49;

    // Calcular distribución de calorías por comida basado en el plan
    let objetivosPorComida = {
      desayuno: Math.round(caloriasTotales * 0.30),  // 30%
      almuerzo: Math.round(caloriasTotales * 0.35),  // 35%
      cena: Math.round(caloriasTotales * 0.25),      // 25%
      snacks: Math.round(caloriasTotales * 0.10)     // 10%
    };

    // Si el plan tiene comidas con calorías específicas, usar esas
    if (plan.contenido?.comidas?.length > 0) {
      const comidasPlan = plan.contenido.comidas;
      const distribucion = { desayuno: 0, almuerzo: 0, cena: 0, snacks: 0 };

      comidasPlan.forEach(comida => {
        const tipo = comida.tipo_comida?.toLowerCase();
        if (tipo === 'desayuno') {
          distribucion.desayuno += comida.calorias || 0;
        } else if (tipo === 'almuerzo' || tipo === 'comida') {
          distribucion.almuerzo += comida.calorias || 0;
        } else if (tipo === 'cena') {
          distribucion.cena += comida.calorias || 0;
        } else if (tipo === 'snack' || tipo === 'merienda' || tipo === 'colacion') {
          distribucion.snacks += comida.calorias || 0;
        }
      });

      // Si hay calorías específicas en el plan, usarlas
      if (distribucion.desayuno > 0 || distribucion.almuerzo > 0 || distribucion.cena > 0) {
        objetivosPorComida = {
          desayuno: distribucion.desayuno || objetivosPorComida.desayuno,
          almuerzo: distribucion.almuerzo || objetivosPorComida.almuerzo,
          cena: distribucion.cena || objetivosPorComida.cena,
          snacks: distribucion.snacks || objetivosPorComida.snacks
        };
      }
    }

    // Actualizar el resumen del día con los objetivos del plan
    setResumenDia(prev => ({
      ...prev,
      calorias: { ...prev.calorias, objetivo: caloriasTotales },
      proteinas: { ...prev.proteinas, objetivo: Math.round(proteinasTotales) },
      carbohidratos: { ...prev.carbohidratos, objetivo: Math.round(carbosTotales) },
      grasas: { ...prev.grasas, objetivo: Math.round(grasasTotales) }
    }));

    // Actualizar los objetivos de cada comida
    setComidas(prev => ({
      ...prev,
      desayuno: { ...prev.desayuno, objetivo: objetivosPorComida.desayuno },
      almuerzo: { ...prev.almuerzo, objetivo: objetivosPorComida.almuerzo },
      cena: { ...prev.cena, objetivo: objetivosPorComida.cena },
      snacks: { ...prev.snacks, objetivo: objetivosPorComida.snacks }
    }));
  };

  const cargarPlanNutricional = async () => {
    if (!pacienteId) return;

    setLoadingPlan(true);
    try {
      const response = await api.get(`/nutricion/plan-paciente/${pacienteId}`);
      // Manejar estructura de respuesta (puede venir en response.data o response.data.data)
      let data = response?.data?.data || response?.data || response;

      console.log('Plan nutricional cargado:', data);

      if (data && data.tiene_plan) {
        // Asegurar que las calorías estén disponibles
        if (!data.calorias_diarias && data.contenido?.totales?.calorias) {
          data.calorias_diarias = data.contenido.totales.calorias;
        }
        if (!data.proteinas_g && data.contenido?.totales?.proteinas) {
          data.proteinas_g = data.contenido.totales.proteinas;
        }
        if (!data.carbohidratos_g && data.contenido?.totales?.carbohidratos) {
          data.carbohidratos_g = data.contenido.totales.carbohidratos;
        }
        if (!data.grasas_g && data.contenido?.totales?.grasas) {
          data.grasas_g = data.contenido.totales.grasas;
        }

        setPlanAsignado(data);
        if (data.contenido?.comidas) {
          setRecetas(data.contenido.comidas);
        }
        // Sincronizar inmediatamente con los datos cargados
        sincronizarObjetivosConPlan(data);
      } else {
        setPlanAsignado(data);
      }
    } catch (err) {
      console.error('Error al cargar plan:', err);
      setPlanAsignado(null);
      setRecetas([]);
    } finally {
      setLoadingPlan(false);
    }
  };

  const cargarRecetas = async () => {
    // Ya cargado por cargarPlanNutricional
    if (!planAsignado) {
      await cargarPlanNutricional();
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

  // Obtener alimentos del plan nutricional como opciones rápidas
  const getAlimentosDelPlan = () => {
    if (!planAsignado?.contenido?.comidas) return [];

    const alimentosPlan = [];
    let idCounter = 1000;

    planAsignado.contenido.comidas.forEach(comida => {
      if (comida.opciones && comida.opciones.length > 0) {
        comida.opciones.forEach(opcion => {
          // Verificar si este alimento es relevante para el tipo de comida actual
          const tipoComidaOpcion = comida.tipo_comida?.toLowerCase();
          const esRelevante =
            (tipoComidaActual === 'desayuno' && tipoComidaOpcion === 'desayuno') ||
            (tipoComidaActual === 'almuerzo' && (tipoComidaOpcion === 'almuerzo' || tipoComidaOpcion === 'comida')) ||
            (tipoComidaActual === 'cena' && tipoComidaOpcion === 'cena') ||
            (tipoComidaActual === 'snacks' && (tipoComidaOpcion === 'snack' || tipoComidaOpcion === 'merienda' || tipoComidaOpcion === 'colacion'));

          alimentosPlan.push({
            id: idCounter++,
            nombre: opcion.nombre,
            descripcion: opcion.descripcion,
            calorias: opcion.calorias_estimadas || 0,
            carbohidratos: opcion.carbohidratos_estimados || 0,
            proteinas: opcion.proteinas_estimadas || 0,
            grasas: opcion.grasas_estimadas || 0,
            esDelPlan: true,
            esRelevante: esRelevante,
            tipoComida: comida.tipo_comida
          });
        });
      }
    });

    return alimentosPlan;
  };

  const getAlimentosFiltrados = () => {
    const alimentosPlan = getAlimentosDelPlan();

    // Si no hay búsqueda, mostrar primero los del plan relevantes, luego todos
    if (!alimentosBusqueda.trim()) {
      // Ordenar: primero los relevantes del plan, luego otros del plan, luego predefinidos
      const relevantes = alimentosPlan.filter(a => a.esRelevante);
      const otrosDelPlan = alimentosPlan.filter(a => !a.esRelevante);
      return [...relevantes, ...otrosDelPlan, ...alimentosPredefinidos];
    }

    // Filtrar por búsqueda
    const busqueda = alimentosBusqueda.toLowerCase();
    const planFiltrados = alimentosPlan.filter(a =>
      a.nombre.toLowerCase().includes(busqueda) ||
      (a.descripcion && a.descripcion.toLowerCase().includes(busqueda))
    );
    const predefinidosFiltrados = alimentosPredefinidos.filter(a =>
      a.nombre.toLowerCase().includes(busqueda)
    );

    return [...planFiltrados, ...predefinidosFiltrados];
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
            {/* Indicador de sincronización con plan */}
            {planAsignado?.tiene_plan && (
              <div className="synced-with-plan">
                Objetivos sincronizados con tu plan: <strong>{planAsignado.nombre}</strong>
              </div>
            )}

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

            {loadingPlan ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Cargando tu plan nutricional...</p>
              </div>
            ) : planAsignado?.tiene_plan ? (
              <>
                {/* Info del plan */}
                <section className="plan-info-section">
                  <div className="plan-header-info">
                    <h3>📋 {planAsignado.nombre}</h3>
                    <span className="plan-badge-activo">Activo</span>
                  </div>
                  {planAsignado.descripcion && (
                    <p className="plan-descripcion">{planAsignado.descripcion}</p>
                  )}
                  <p className="plan-especialista">
                    Asignado por: <strong>{planAsignado.especialista_nombre}</strong>
                  </p>

                  {/* Objetivo si existe */}
                  {planAsignado.contenido?.objetivo && (
                    <div className="plan-objetivo-paciente">
                      <strong>🎯 Objetivo:</strong> {planAsignado.contenido.objetivo}
                    </div>
                  )}

                  {/* Macros del plan */}
                  <div className="plan-macros-resumen">
                    <div className="macro-item calorias">
                      <span className="macro-icon">🔥</span>
                      <span className="macro-value">{planAsignado.calorias_diarias || planAsignado.contenido?.totales?.calorias || 0}</span>
                      <span className="macro-label">kcal/día</span>
                    </div>
                    <div className="macro-item proteinas">
                      <span className="macro-icon">🥩</span>
                      <span className="macro-value">{Number(planAsignado.proteinas_g || planAsignado.contenido?.totales?.proteinas || 0).toFixed(0)}g</span>
                      <span className="macro-label">Proteínas</span>
                    </div>
                    <div className="macro-item carbos">
                      <span className="macro-icon">🍞</span>
                      <span className="macro-value">{Number(planAsignado.carbohidratos_g || planAsignado.contenido?.totales?.carbohidratos || 0).toFixed(0)}g</span>
                      <span className="macro-label">Carbos</span>
                    </div>
                    <div className="macro-item grasas">
                      <span className="macro-icon">🥑</span>
                      <span className="macro-value">{Number(planAsignado.grasas_g || planAsignado.contenido?.totales?.grasas || 0).toFixed(0)}g</span>
                      <span className="macro-label">Grasas</span>
                    </div>
                  </div>
                </section>

                {/* Comidas del plan - Diseño mejorado */}
                <section className="recetas-list-section">
                  <h3>🍽️ Tu Menú del Día</h3>
                  {planAsignado.contenido?.comidas?.length > 0 ? (
                    <div className="comidas-timeline-paciente">
                      {planAsignado.contenido.comidas.map((comida, idx) => {
                        const tipoLabels = {
                          desayuno: { icon: '🌅', label: 'Desayuno' },
                          almuerzo: { icon: '🍽️', label: 'Almuerzo' },
                          cena: { icon: '🌙', label: 'Cena' },
                          snack: { icon: '🥜', label: 'Snack' },
                          merienda: { icon: '🍪', label: 'Merienda' }
                        };
                        const tipoInfo = tipoLabels[comida.tipo_comida] || { icon: '🍴', label: comida.nombre_original || comida.tipo_comida };

                        return (
                          <div key={idx} className="comida-card-paciente">
                            <div className="comida-card-header">
                              <div className="comida-tipo-info">
                                <span className="comida-icono">{tipoInfo.icon}</span>
                                <div className="comida-tipo-text">
                                  <span className="comida-tipo-label">{tipoInfo.label}</span>
                                  {comida.horario && <span className="comida-hora">⏰ {comida.horario}</span>}
                                </div>
                              </div>
                              {comida.calorias > 0 && (
                                <span className="comida-kcal-pill">~{comida.calorias} kcal</span>
                              )}
                            </div>

                            {/* Opciones de la comida */}
                            {comida.opciones && comida.opciones.length > 0 ? (
                              <div className="opciones-grid-paciente">
                                <div className="opciones-titulo">
                                  <span className="opciones-count">{comida.opciones.length} {comida.opciones.length === 1 ? 'opción' : 'opciones'} para elegir:</span>
                                </div>
                                {comida.opciones.map((opcion, opIdx) => (
                                  <div key={opIdx} className="opcion-card-paciente">
                                    <div className="opcion-card-top">
                                      <span className="opcion-num">#{opcion.numero || opIdx + 1}</span>
                                      {opcion.calorias_estimadas > 0 && (
                                        <span className="opcion-kcal-badge">~{opcion.calorias_estimadas} kcal</span>
                                      )}
                                    </div>
                                    <h5 className="opcion-nombre-paciente">{opcion.nombre}</h5>
                                    <p className="opcion-desc-paciente">
                                      {opcion.descripcion?.length > 180
                                        ? opcion.descripcion.substring(0, 180) + '...'
                                        : opcion.descripcion || 'Ver receta'}
                                    </p>
                                    {opcion.calorias_estimadas > 0 && (
                                      <div className="opcion-macros-paciente">
                                        <span className="macro proteinas">🥩 {opcion.proteinas_estimadas}g</span>
                                        <span className="macro carbos">🍞 {opcion.carbohidratos_estimados}g</span>
                                        <span className="macro grasas">🥑 {opcion.grasas_estimadas}g</span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="comida-simple">
                                <p>{comida.nombre_plato || 'Sin opciones detalladas'}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <span className="empty-icon">📋</span>
                      <p>El plan no tiene comidas estructuradas</p>
                      <p className="help-text">Consulta con tu nutriólogo para más detalles</p>
                    </div>
                  )}
                </section>

                {/* Indicaciones generales */}
                {planAsignado.contenido?.indicaciones_generales?.length > 0 && (
                  <section className="indicaciones-section">
                    <h3>📝 Indicaciones Generales</h3>
                    <ul className="indicaciones-list-paciente">
                      {planAsignado.contenido.indicaciones_generales.map((ind, idx) => (
                        <li key={idx}>{ind}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Recomendaciones */}
                {planAsignado.contenido?.recomendaciones?.length > 0 && (
                  <section className="recomendaciones-section">
                    <h3>💡 Recomendaciones</h3>
                    <ul className="recomendaciones-list">
                      {planAsignado.contenido.recomendaciones.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Gráficas e imágenes informativas */}
                {(planAsignado.contenido?.graficas?.length > 0 || planAsignado.contenido?.imagenes?.length > 0) && (
                  <section className="graficas-section-paciente">
                    <h3>📊 Material Informativo</h3>
                    <div className="graficas-scroll">
                      {(planAsignado.contenido.graficas || planAsignado.contenido.imagenes || []).map((item, idx) => {
                        const imagen = item.imagen || item;
                        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
                        const imagePath = imagen.path || imagen;

                        return (
                          <div key={idx} className="grafica-card-paciente">
                            <img
                              src={`${apiUrl}${imagePath}`}
                              alt={item.titulo || `Gráfica ${idx + 1}`}
                              className="grafica-img-paciente"
                              onClick={() => window.open(`${apiUrl}${imagePath}`, '_blank')}
                            />
                            <div className="grafica-overlay">
                              <span className="grafica-title">{item.titulo || `Gráfica ${idx + 1}`}</span>
                              <span className="grafica-tap">Toca para ampliar</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </>
            ) : (
              <section className="recetas-list-section">
                <h3>Recetas recomendadas</h3>
                <div className="empty-state">
                  <span className="empty-icon">📋</span>
                  <p>No tienes recetas asignadas aún</p>
                  <p className="help-text">Tu nutriólogo te asignará recetas personalizadas</p>
                </div>
              </section>
            )}
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
              {/* Sección de alimentos del plan */}
              {planAsignado?.tiene_plan && getAlimentosDelPlan().filter(a => a.esRelevante).length > 0 && (
                <div className="plan-foods-section">
                  <h4>📋 De tu plan nutricional</h4>
                  <div className="food-list plan-foods">
                    {getAlimentosDelPlan().filter(a => a.esRelevante).slice(0, alimentosBusqueda ? undefined : 5).map((alimento) => (
                      <div key={alimento.id} className="food-suggestion-item plan-food">
                        <div className="food-info">
                          <span className="food-name">
                            {alimento.nombre}
                            <span className="plan-badge">Del plan</span>
                          </span>
                          <span className="food-macros">
                            {alimento.calorias} kcal · C:{alimento.carbohidratos}g · P:{alimento.proteinas}g · G:{alimento.grasas}g
                          </span>
                          {alimento.descripcion && (
                            <span className="food-description">{alimento.descripcion.substring(0, 80)}...</span>
                          )}
                        </div>
                        <button
                          className="add-food-btn plan-add-btn"
                          onClick={() => registrarAlimento(alimento)}
                          disabled={registrando}
                        >
                          {registrando ? '...' : '+'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sección de otros alimentos */}
              <h4>🍴 Otros alimentos</h4>
              <div className="food-list">
                {getAlimentosFiltrados().filter(a => !a.esDelPlan || !a.esRelevante).map((alimento) => (
                  <div key={alimento.id} className={`food-suggestion-item ${alimento.esDelPlan ? 'from-plan' : ''}`}>
                    <div className="food-info">
                      <span className="food-name">
                        {alimento.nombre}
                        {alimento.esDelPlan && <span className="plan-badge small">Plan</span>}
                      </span>
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
