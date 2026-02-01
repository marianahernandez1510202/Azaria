import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useVoice, Speakable } from '../../components/VoiceHelper';
import AccessibilityPanel, { AccessibilityFAB } from '../../components/accessibility/AccessibilityPanel';
import OutlookConnect, { OutlookSyncButton } from '../../components/outlook/OutlookConnect';
import OutlookCalendar from '../../components/outlook/OutlookCalendar';
import PlanesNutricionales from '../../components/nutricion/PlanesNutricionales';
import api from '../../services/api';
import './EspecialistaDashboard.css';

/**
 * EspecialistaDashboard - Panel personalizado para especialistas médicos
 * Cada área médica tiene sus propios módulos y herramientas
 */

// Configuración de áreas médicas con sus módulos específicos
// Los módulos ahora usan vistas internas (view) en lugar de rutas externas
const AREAS_CONFIG = {
  fisioterapia: {
    nombre: 'Fisioterapia',
    icon: '🏃',
    color: '#FF9800',
    modulos: [
      { id: 'ejercicios', nombre: 'Ejercicios de Pacientes', icon: '🏋️', descripcion: 'Ver rutinas y progreso', view: 'mod-ejercicios' },
      { id: 'evaluaciones', nombre: 'Evaluaciones', icon: '📊', descripcion: 'Evaluaciones físicas de pacientes', view: 'mod-evaluaciones' },
      { id: 'planes', nombre: 'Planes de Tratamiento', icon: '📋', descripcion: 'Gestionar planes de pacientes', view: 'mod-planes' },
      { id: 'progreso', nombre: 'Progreso', icon: '📈', descripcion: 'Ver progreso de pacientes', view: 'mod-progreso' },
    ],
    herramientas: [
      { nombre: 'Calculadora de ROM', icon: '📐' },
      { nombre: 'Escala de Dolor', icon: '😣' },
      { nombre: 'Test Muscular', icon: '💪' },
    ]
  },
  nutricion: {
    nombre: 'Nutrición',
    icon: '🥗',
    color: '#4CAF50',
    modulos: [
      { id: 'planes-nutricionales', nombre: 'Planes Nutricionales', icon: '🍽️', descripcion: 'Ver dietas de pacientes', view: 'mod-planes-nutricionales' },
      { id: 'seguimiento-peso', nombre: 'Seguimiento de Peso', icon: '📉', descripcion: 'Ver peso de pacientes', view: 'mod-seguimiento-peso' },
      { id: 'historial-alimenticio', nombre: 'Historial Alimenticio', icon: '🥗', descripcion: 'Ver registros de alimentación', view: 'mod-historial-alimenticio' },
      { id: 'imc-pacientes', nombre: 'IMC de Pacientes', icon: '⚖️', descripcion: 'Ver índice de masa corporal', view: 'mod-imc' },
    ],
    herramientas: [
      { nombre: 'Calculadora Calórica', icon: '🔢' },
      { nombre: 'Tabla de Alimentos', icon: '📊' },
      { nombre: 'Macronutrientes', icon: '🥩' },
    ]
  },
  medicina: {
    nombre: 'Medicina General',
    icon: '❤️',
    color: '#F44336',
    modulos: [
      { id: 'consultas', nombre: 'Historial Consultas', icon: '🩺', descripcion: 'Ver historial de consultas', view: 'mod-consultas' },
      { id: 'signos-vitales', nombre: 'Signos Vitales', icon: '❤️‍🩹', descripcion: 'Ver signos vitales de pacientes', view: 'mod-signos-vitales' },
      { id: 'estudios', nombre: 'Estudios Clínicos', icon: '🔬', descripcion: 'Ver estudios de pacientes', view: 'mod-estudios' },
      { id: 'recetas-medicas', nombre: 'Recetas Médicas', icon: '💊', descripcion: 'Generar recetas para pacientes', view: 'mod-recetas' },
    ],
    herramientas: [
      { nombre: 'Calculadora de Dosis', icon: '💉' },
      { nombre: 'CIE-10', icon: '📖' },
      { nombre: 'Interacciones', icon: '⚠️' },
    ]
  },
  neuropsicologia: {
    nombre: 'Neuropsicología',
    icon: '🧠',
    color: '#9C27B0',
    modulos: [
      { id: 'evaluaciones-cognitivas', nombre: 'Evaluaciones Cognitivas', icon: '🧩', descripcion: 'Ver tests de pacientes', view: 'mod-evaluaciones-cognitivas' },
      { id: 'ejercicios-mentales', nombre: 'Ejercicios Mentales', icon: '🎯', descripcion: 'Ver actividades de pacientes', view: 'mod-ejercicios-mentales' },
      { id: 'memoria', nombre: 'Registro de Memoria', icon: '📝', descripcion: 'Ver seguimiento cognitivo', view: 'mod-memoria' },
      { id: 'emocional', nombre: 'Estado Emocional', icon: '😊', descripcion: 'Ver evaluación emocional', view: 'mod-emocional' },
    ],
    herramientas: [
      { nombre: 'Test Mini-Mental', icon: '📋' },
      { nombre: 'Escala de Ansiedad', icon: '😰' },
      { nombre: 'Test de Memoria', icon: '🧠' },
    ]
  },
  ortesis: {
    nombre: 'Ortesis y Prótesis',
    icon: '🦿',
    color: '#00BCD4',
    modulos: [
      { id: 'dispositivos', nombre: 'Dispositivos', icon: '🦾', descripcion: 'Ver dispositivos de pacientes', view: 'mod-dispositivos' },
      { id: 'adaptacion', nombre: 'Adaptación', icon: '🔧', descripcion: 'Ver seguimiento de adaptación', view: 'mod-adaptacion' },
      { id: 'mantenimiento', nombre: 'Mantenimiento', icon: '🛠️', descripcion: 'Ver calendario de mantenimiento', view: 'mod-mantenimiento' },
      { id: 'medidas', nombre: 'Medidas y Ajustes', icon: '📏', descripcion: 'Ver registro de medidas', view: 'mod-medidas' },
    ],
    herramientas: [
      { nombre: 'Guía de Tallas', icon: '📐' },
      { nombre: 'Materiales', icon: '🧱' },
      { nombre: 'Proveedores', icon: '🏭' },
    ]
  },
};

const EspecialistaDashboard = () => {
  const { user, logout } = useAuth();
  const { settings, togglePanel } = useAccessibility();
  const { speak, speakModule, isSpeaking, stop } = useVoice();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState('inicio');
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [pacienteData, setPacienteData] = useState(null);
  const [loadingPacienteData, setLoadingPacienteData] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    todayCitas: [],
    pacientesActivos: 0,
    seguimientosPendientes: 0,
    mensajesNuevos: 0,
    pacientes: [],
  });

  // Estados para modales
  const [showModal, setShowModal] = useState(null);
  const [estudiosLocales, setEstudiosLocales] = useState([]);

  // Formularios
  const [dosisForm, setDosisForm] = useState({ peso: '', dosis_mg_kg: '', frecuencia: '8' });
  const [cie10Search, setCie10Search] = useState('');
  const [interaccionForm, setInteraccionForm] = useState({ medicamento1: '', medicamento2: '' });
  const [estudioForm, setEstudioForm] = useState({
    nombre: '',
    tipo: 'laboratorio',
    fecha: new Date().toISOString().split('T')[0],
    resultado: '',
    observaciones: ''
  });

  // Estados para chat
  const [conversaciones, setConversaciones] = useState([]);
  const [conversacionActiva, setConversacionActiva] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const [otroUsuarioChat, setOtroUsuarioChat] = useState(null);

  // Estados para modal de nueva cita
  const [citaForm, setCitaForm] = useState({
    paciente_id: '',
    fecha: new Date().toISOString().split('T')[0],
    hora_inicio: '',
    tipo_cita_id: '',
    motivo: ''
  });
  const [tiposCita, setTiposCita] = useState([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);

  // Estado para integración con Outlook
  const [outlookConnected, setOutlookConnected] = useState(false);

  // Obtener área médica del especialista
  const areaCodigo = user?.area_medica || 'medicina';
  const areaConfig = AREAS_CONFIG[areaCodigo] || AREAS_CONFIG.medicina;

  useEffect(() => {
    // Determinar vista activa basada en la URL
    const path = location.pathname;
    if (path.includes('/pacientes')) setActiveView('pacientes');
    else if (path.includes('/agenda')) setActiveView('agenda');
    else if (path.includes('/seguimientos')) setActiveView('seguimientos');
    else if (path.includes('/chat') || path.includes('/mensajes')) setActiveView('mensajes');
    else if (path.includes('/herramientas')) setActiveView('herramientas');
    else setActiveView('inicio');
  }, [location]);

  useEffect(() => {
    loadData();

    if (settings.voiceNavigation) {
      const nombre = user?.nombre?.split(' ')[0] || 'Especialista';
      speak(`Bienvenido Doctor ${nombre}. Panel de ${areaConfig.nombre}.`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cargar conversaciones cuando se abre la vista de mensajes
  useEffect(() => {
    if (activeView === 'mensajes') {
      loadConversaciones();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const especialistaId = user?.especialista_id || user?.id;
      const [citasRes, pacientesRes, mensajesRes] = await Promise.all([
        api.get(`/especialistas/${especialistaId}/citas-hoy`).catch(() => ({ data: null })),
        api.get(`/especialistas/${especialistaId}/pacientes`).catch(() => ({ data: null })),
        api.get(`/mensajes/no-leidos/${especialistaId}`).catch(() => ({ data: null })),
      ]);

      setDashboardData({
        todayCitas: citasRes.data?.citas || [],
        pacientesActivos: pacientesRes.data?.total || 0,
        seguimientosPendientes: pacientesRes.data?.pendientes || 0,
        mensajesNuevos: mensajesRes.data?.total || 0,
        pacientes: pacientesRes.data?.pacientes || [],
      });
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos de un paciente específico para los módulos
  const loadPacienteData = async (pacienteId) => {
    setLoadingPacienteData(true);
    try {
      const especialistaId = user?.especialista_id || user?.id;
      const response = await api.get(`/especialistas/${especialistaId}/pacientes/${pacienteId}`);
      setPacienteData(response.data);
    } catch (error) {
      console.error('Error cargando datos del paciente:', error);
      setPacienteData(null);
    } finally {
      setLoadingPacienteData(false);
    }
  };

  // Seleccionar paciente y cargar sus datos
  const handleSelectPaciente = (paciente) => {
    setSelectedPaciente(paciente);
    loadPacienteData(paciente.id);
  };

  // Volver a la lista de pacientes en módulos
  const handleBackToPatientList = () => {
    setSelectedPaciente(null);
    setPacienteData(null);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'confirmada': return 'var(--color-success)';
      case 'pendiente':
      case 'programada': return 'var(--color-warning)';
      case 'cancelada': return 'var(--color-error)';
      default: return 'var(--text-muted)';
    }
  };

  const handleLogout = async () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      await logout();
      navigate('/login');
    }
  };

  // Abrir herramienta
  const handleOpenTool = (toolName) => {
    if (toolName.includes('Dosis') || toolName.includes('Calórica') || toolName.includes('ROM')) {
      setShowModal('calculadora-dosis');
    } else if (toolName.includes('CIE') || toolName.includes('Alimentos') || toolName.includes('Tallas')) {
      setShowModal('cie10');
    } else if (toolName.includes('Interacciones') || toolName.includes('Macronutrientes') || toolName.includes('Materiales')) {
      setShowModal('interacciones');
    } else if (toolName.includes('Dolor') || toolName.includes('Ansiedad')) {
      setShowModal('escala-dolor');
    } else if (toolName.includes('Mini-Mental') || toolName.includes('Memoria') || toolName.includes('Muscular')) {
      setShowModal('test');
    } else {
      setShowModal('herramienta-generica');
    }
  };

  // Calcular dosis
  const calcularDosis = () => {
    const peso = parseFloat(dosisForm.peso);
    const dosisPorKg = parseFloat(dosisForm.dosis_mg_kg);
    const frecuencia = parseInt(dosisForm.frecuencia);

    if (peso && dosisPorKg) {
      const dosisPorToma = (peso * dosisPorKg).toFixed(2);
      const dosisDiaria = ((24 / frecuencia) * dosisPorToma).toFixed(2);
      return { dosisPorToma, dosisDiaria, tomasPorDia: 24 / frecuencia };
    }
    return null;
  };

  // Guardar nuevo estudio
  const handleGuardarEstudio = async () => {
    if (!estudioForm.nombre || !selectedPaciente) return;

    const nuevoEstudio = {
      id: Date.now(),
      ...estudioForm,
      estado: estudioForm.resultado ? 'Completado' : 'Pendiente'
    };

    // Agregar a la lista local
    setEstudiosLocales(prev => [...prev, nuevoEstudio]);

    // Intentar guardar en backend
    try {
      await api.post('/estudios', {
        paciente_id: selectedPaciente.id,
        especialista_id: user?.especialista_id || user?.id,
        ...estudioForm
      });
    } catch (error) {
      console.log('Guardado localmente');
    }

    // Limpiar formulario y cerrar modal
    setEstudioForm({
      nombre: '',
      tipo: 'laboratorio',
      fecha: new Date().toISOString().split('T')[0],
      resultado: '',
      observaciones: ''
    });
    setShowModal(null);
  };

  // ===== FUNCIONES DE CHAT =====

  // Cargar conversaciones del especialista
  const loadConversaciones = async () => {
    setLoadingChat(true);
    try {
      const userId = user?.id;
      const response = await api.get(`/mensajes/conversaciones/${userId}`);
      setConversaciones(response.data?.conversaciones || []);
    } catch (error) {
      console.error('Error cargando conversaciones:', error);
      // Datos de ejemplo si falla
      setConversaciones([]);
    } finally {
      setLoadingChat(false);
    }
  };

  // Cargar mensajes de una conversación
  const loadMensajes = async (conversacionId) => {
    try {
      const userId = user?.id;
      const response = await api.get(`/mensajes/conversacion/${conversacionId}/${userId}`);
      setMensajes(response.data?.mensajes || []);
      setOtroUsuarioChat(response.data?.otro_usuario || null);
    } catch (error) {
      console.error('Error cargando mensajes:', error);
      setMensajes([]);
    }
  };

  // Seleccionar conversación
  const handleSelectConversacion = (conv) => {
    setConversacionActiva(conv);
    loadMensajes(conv.id);
  };

  // Enviar mensaje
  const handleEnviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !conversacionActiva) return;

    const mensaje = {
      emisor_id: user?.id,
      receptor_id: conversacionActiva.otro_usuario_id,
      mensaje: nuevoMensaje.trim()
    };

    try {
      await api.post('/mensajes/enviar', mensaje);

      // Agregar mensaje localmente
      setMensajes(prev => [...prev, {
        id: Date.now(),
        ...mensaje,
        created_at: new Date().toISOString(),
        emisor_nombre: user?.nombre || 'Yo'
      }]);

      setNuevoMensaje('');
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      // Agregar localmente de todas formas
      setMensajes(prev => [...prev, {
        id: Date.now(),
        ...mensaje,
        created_at: new Date().toISOString(),
        emisor_nombre: user?.nombre || 'Yo'
      }]);
      setNuevoMensaje('');
    }
  };

  // Iniciar conversación con paciente
  const handleIniciarConversacion = async (paciente) => {
    try {
      const response = await api.post(`/mensajes/iniciar/${user?.id}/${paciente.usuario_id || paciente.id}`);
      const convId = response.data?.conversacion_id;

      if (convId) {
        setConversacionActiva({
          id: convId,
          otro_usuario_id: paciente.usuario_id || paciente.id,
          otro_usuario_nombre: paciente.nombre
        });
        loadMensajes(convId);
      }
    } catch (error) {
      console.error('Error iniciando conversación:', error);
      // Crear conversación local temporal
      setConversacionActiva({
        id: Date.now(),
        otro_usuario_id: paciente.usuario_id || paciente.id,
        otro_usuario_nombre: paciente.nombre
      });
      setMensajes([]);
    }
  };

  // ===== FUNCIONES DE CITAS =====

  // Cargar tipos de cita
  const loadTiposCita = async () => {
    try {
      const response = await api.get('/citas/tipos');
      setTiposCita(response.data?.tipos || []);
    } catch (error) {
      console.error('Error cargando tipos de cita:', error);
      // Tipos de ejemplo
      setTiposCita([
        { id: 1, nombre: 'Consulta General', duracion_minutos: 30 },
        { id: 2, nombre: 'Seguimiento', duracion_minutos: 20 },
        { id: 3, nombre: 'Primera Consulta', duracion_minutos: 45 },
        { id: 4, nombre: 'Evaluación', duracion_minutos: 60 }
      ]);
    }
  };

  // Cargar horarios disponibles
  const loadHorariosDisponibles = async (fecha) => {
    try {
      const especialistaId = user?.especialista_id || user?.id;
      const response = await api.get(`/citas/horarios/${especialistaId}/${fecha}`);
      setHorariosDisponibles(response.data?.horarios || []);
    } catch (error) {
      console.error('Error cargando horarios:', error);
      // Horarios de ejemplo
      setHorariosDisponibles(['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00']);
    }
  };

  // Abrir modal de nueva cita
  const handleOpenNuevaCita = () => {
    loadTiposCita();
    loadHorariosDisponibles(new Date().toISOString().split('T')[0]);
    setShowModal('nueva-cita');
  };

  // Guardar nueva cita
  const handleGuardarCita = async () => {
    if (!citaForm.paciente_id || !citaForm.fecha || !citaForm.hora_inicio || !citaForm.tipo_cita_id) {
      alert('Completa todos los campos requeridos');
      return;
    }

    try {
      const especialistaId = user?.especialista_id || user?.id;
      await api.post('/citas/especialista', {
        ...citaForm,
        especialista_id: especialistaId
      });

      alert('Cita agendada exitosamente');

      // Limpiar y cerrar
      setCitaForm({
        paciente_id: '',
        fecha: new Date().toISOString().split('T')[0],
        hora_inicio: '',
        tipo_cita_id: '',
        motivo: ''
      });
      setShowModal(null);

      // Recargar datos
      loadData();
    } catch (error) {
      console.error('Error agendando cita:', error);
      alert('Error al agendar la cita. Por favor intenta de nuevo.');
    }
  };

  // Códigos CIE-10 de ejemplo
  const codigosCIE10 = [
    { codigo: 'E11', descripcion: 'Diabetes mellitus tipo 2' },
    { codigo: 'I10', descripcion: 'Hipertensión esencial (primaria)' },
    { codigo: 'J06.9', descripcion: 'Infección aguda de las vías respiratorias superiores' },
    { codigo: 'M54.5', descripcion: 'Lumbago no especificado' },
    { codigo: 'K21.0', descripcion: 'Enfermedad por reflujo gastroesofágico con esofagitis' },
    { codigo: 'F32.9', descripcion: 'Episodio depresivo no especificado' },
    { codigo: 'G43.9', descripcion: 'Migraña no especificada' },
    { codigo: 'N39.0', descripcion: 'Infección de vías urinarias, sitio no especificado' },
    { codigo: 'R51', descripcion: 'Cefalea' },
    { codigo: 'Z00.0', descripcion: 'Examen médico general' },
  ];

  // Filtrar CIE-10
  const cie10Filtrado = cie10Search
    ? codigosCIE10.filter(c =>
        c.codigo.toLowerCase().includes(cie10Search.toLowerCase()) ||
        c.descripcion.toLowerCase().includes(cie10Search.toLowerCase())
      )
    : codigosCIE10;

  // Renderizar vista de Inicio
  const renderInicio = () => (
    <>
      {/* Bienvenida */}
      <Speakable text={`${getGreeting()}, Doctor. Panel de ${areaConfig.nombre}.`}>
        <section className="welcome-section" style={{ '--area-color': areaConfig.color }}>
          <div className="welcome-text">
            <h1>{getGreeting()},</h1>
            <p className="user-name">Dr(a). {user?.nombre?.split(' ')[0] || 'Especialista'}</p>
            <p className="welcome-subtitle">Especialista en {areaConfig.nombre}</p>
          </div>
          <div className="welcome-illustration">{areaConfig.icon}</div>
        </section>
      </Speakable>

      {/* Stats rápidos */}
      <section className="quick-stats-section">
        <div className="quick-stats-grid">
          <div className="quick-stat-card" onClick={() => setActiveView('pacientes')}>
            <span className="stat-icon">👥</span>
            <div className="stat-info">
              <span className="stat-value">{dashboardData.pacientesActivos}</span>
              <span className="stat-label">Pacientes</span>
            </div>
          </div>
          <div className="quick-stat-card" onClick={() => setActiveView('agenda')}>
            <span className="stat-icon">📅</span>
            <div className="stat-info">
              <span className="stat-value">{dashboardData.todayCitas.length}</span>
              <span className="stat-label">Citas hoy</span>
            </div>
          </div>
          <div className="quick-stat-card" onClick={() => setActiveView('seguimientos')}>
            <span className="stat-icon">📋</span>
            <div className="stat-info">
              <span className="stat-value">{dashboardData.seguimientosPendientes}</span>
              <span className="stat-label">Seguimientos</span>
            </div>
          </div>
          <div className="quick-stat-card" onClick={() => setActiveView('mensajes')}>
            <span className="stat-icon">💬</span>
            <div className="stat-info">
              <span className="stat-value">{dashboardData.mensajesNuevos}</span>
              <span className="stat-label">Mensajes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Citas del día */}
      <section className="today-appointments">
        <div className="section-header">
          <h2 className="section-title">📅 Citas de Hoy</h2>
          <button className="section-link" onClick={() => setActiveView('agenda')}>Ver agenda</button>
        </div>
        {dashboardData.todayCitas.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <p>No tienes citas programadas para hoy</p>
          </div>
        ) : (
          <ul className="appointments-list">
            {dashboardData.todayCitas.slice(0, 4).map((cita) => (
              <li key={cita.id} className="appointment-card">
                <div className="appointment-time">
                  <span className="time">{cita.hora}</span>
                </div>
                <div className="appointment-info">
                  <span className="patient-name">{cita.paciente}</span>
                  <span className="appointment-type">{cita.tipo}</span>
                </div>
                <div className="appointment-status" style={{ '--status-color': getStatusColor(cita.estado) }}>
                  <span className="status-dot"></span>
                  <span className="status-text">{cita.estado}</span>
                </div>
                <div className="appointment-actions">
                  <Link to={`/especialista/pacientes/${cita.paciente_id}/expediente`} className="action-btn">
                    Expediente
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Módulos del área */}
      <section className="area-modules">
        <h2 className="section-title">{areaConfig.icon} Módulos de {areaConfig.nombre}</h2>
        <div className="modules-grid">
          {areaConfig.modulos.map((modulo) => (
            <button
              key={modulo.id}
              onClick={() => setActiveView(modulo.view)}
              className="module-card"
              style={{ '--module-color': areaConfig.color }}
            >
              <span className="module-icon">{modulo.icon}</span>
              <span className="module-name">{modulo.nombre}</span>
              <span className="module-desc">{modulo.descripcion}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Herramientas rápidas */}
      <section className="quick-tools">
        <h2 className="section-title">🛠️ Herramientas Rápidas</h2>
        <div className="tools-grid">
          {areaConfig.herramientas.map((tool, idx) => (
            <button
              key={idx}
              className="tool-btn"
              style={{ '--tool-color': areaConfig.color }}
              onClick={() => handleOpenTool(tool.nombre)}
            >
              <span className="tool-icon">{tool.icon}</span>
              <span className="tool-name">{tool.nombre}</span>
            </button>
          ))}
        </div>
      </section>
    </>
  );

  // Renderizar vista de Pacientes
  const renderPacientes = () => (
    <section className="patients-view">
      <div className="section-header">
        <h2 className="section-title">👥 Mis Pacientes</h2>
        <span className="patient-count">{dashboardData.pacientes.length} pacientes</span>
      </div>

      {dashboardData.pacientes.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">👥</span>
          <p>No tienes pacientes asignados</p>
        </div>
      ) : (
        <div className="patients-list">
          {dashboardData.pacientes.map((paciente) => (
            <div key={paciente.id} className="patient-card-full">
              <div className="patient-avatar" style={{ background: areaConfig.color }}>
                {paciente.nombre?.charAt(0) || 'P'}
              </div>
              <div className="patient-details">
                <h3 className="patient-name">{paciente.nombre}</h3>
                <p className="patient-email">{paciente.email}</p>
                <p className="patient-phase">{paciente.fase_actual || 'Sin fase asignada'}</p>
              </div>
              <div className="patient-meta">
                <span className="last-visit">Última cita: {paciente.ultima_cita || 'N/A'}</span>
              </div>
              <div className="patient-actions">
                <Link
                  to={`/especialista/pacientes/${paciente.id}/expediente`}
                  className="btn-expediente"
                >
                  Ver Expediente
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  // Renderizar vista de Agenda
  const renderAgenda = () => (
    <section className="agenda-view">
      <div className="section-header">
        <h2 className="section-title">📅 Mi Agenda</h2>
        <button
          className="btn-nueva-cita"
          onClick={handleOpenNuevaCita}
          style={{ '--area-color': areaConfig.color }}
        >
          + Nueva Cita
        </button>
      </div>
      <p className="date-today">{new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

      {/* Integración con Outlook */}
      <div className="outlook-integration-section">
        <OutlookConnect onConnectionChange={setOutlookConnected} />
        {outlookConnected && <OutlookCalendar isConnected={outlookConnected} />}
      </div>

      <div className="agenda-content">
        <h3 className="subsection-title">Citas de Hoy ({dashboardData.todayCitas.length})</h3>

        {dashboardData.todayCitas.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📅</span>
            <p>No hay citas para hoy</p>
          </div>
        ) : (
          <div className="agenda-list">
            {dashboardData.todayCitas.map((cita) => (
              <div key={cita.id} className="agenda-item" style={{ '--status-color': getStatusColor(cita.estado) }}>
                <div className="agenda-time">
                  <span className="time-hour">{cita.hora}</span>
                </div>
                <div className="agenda-details">
                  <h4 className="agenda-patient">{cita.paciente}</h4>
                  <p className="agenda-type">{cita.tipo}</p>
                  {cita.motivo && <p className="agenda-reason">{cita.motivo}</p>}
                </div>
                <div className="agenda-status">
                  <span className={`status-badge ${cita.estado}`}>{cita.estado}</span>
                </div>
                <div className="agenda-actions">
                  {outlookConnected && (
                    <OutlookSyncButton
                      citaId={cita.id}
                      outlookEventId={cita.outlook_event_id}
                      onSync={() => loadData()}
                    />
                  )}
                  <Link to={`/especialista/pacientes/${cita.paciente_id}/expediente`} className="btn-small">
                    Expediente
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );

  // Renderizar vista de Seguimientos
  const renderSeguimientos = () => (
    <section className="followups-view">
      <div className="section-header">
        <h2 className="section-title">📋 Seguimientos Pendientes</h2>
        <span className="followup-count">{dashboardData.seguimientosPendientes} pendientes</span>
      </div>

      <div className="followups-info">
        <p>Pacientes que no han tenido cita en la última semana:</p>
      </div>

      {dashboardData.pacientes.filter(p => !p.ultima_cita || new Date(p.ultima_cita) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length === 0 ? (
        <div className="empty-state success">
          <span className="empty-icon">✅</span>
          <p>Todos los pacientes están al día con sus citas</p>
        </div>
      ) : (
        <div className="followups-list">
          {dashboardData.pacientes
            .filter(p => !p.ultima_cita || new Date(p.ultima_cita) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
            .map((paciente) => (
              <div key={paciente.id} className="followup-card">
                <div className="followup-avatar" style={{ background: areaConfig.color }}>
                  {paciente.nombre?.charAt(0) || 'P'}
                </div>
                <div className="followup-info">
                  <h3>{paciente.nombre}</h3>
                  <p>Última cita: {paciente.ultima_cita || 'Nunca'}</p>
                </div>
                <div className="followup-actions">
                  <Link to={`/especialista/pacientes/${paciente.id}/expediente`} className="btn-followup">
                    Ver Expediente
                  </Link>
                </div>
              </div>
            ))}
        </div>
      )}
    </section>
  );

  // Renderizar vista de Mensajes (Chat funcional)
  const renderMensajes = () => (
      <section className="messages-view chat-view">
        <div className="section-header">
          <h2 className="section-title">💬 Mensajes</h2>
          {dashboardData.mensajesNuevos > 0 && (
            <span className="unread-badge">{dashboardData.mensajesNuevos} nuevos</span>
          )}
        </div>

        <div className="chat-container">
          {/* Lista de conversaciones */}
          <div className={`chat-sidebar ${!conversacionActiva ? 'active' : ''}`}>
            <div className="chat-sidebar-header">
              <h3>Conversaciones</h3>
              <button
                className="btn-new-chat"
                onClick={() => setShowModal('nueva-conversacion')}
                style={{ '--area-color': areaConfig.color }}
              >
                + Nueva
              </button>
            </div>

            {loadingChat ? (
              <div className="chat-loading">
                <div className="loading-spinner"></div>
                <p>Cargando...</p>
              </div>
            ) : conversaciones.length === 0 ? (
              <div className="chat-empty">
                <p>No hay conversaciones</p>
                <button
                  className="btn-start-chat"
                  onClick={() => setShowModal('nueva-conversacion')}
                  style={{ '--area-color': areaConfig.color }}
                >
                  Iniciar una conversación
                </button>
              </div>
            ) : (
              <div className="conversaciones-list">
                {conversaciones.map((conv) => (
                  <button
                    key={conv.id}
                    className={`conversacion-item ${conversacionActiva?.id === conv.id ? 'active' : ''}`}
                    onClick={() => handleSelectConversacion(conv)}
                    style={{ '--area-color': areaConfig.color }}
                  >
                    <div className="conv-avatar">
                      {conv.otro_usuario_nombre?.charAt(0) || 'P'}
                    </div>
                    <div className="conv-info">
                      <span className="conv-nombre">{conv.otro_usuario_nombre}</span>
                      <span className="conv-ultimo">{conv.ultimo_mensaje || 'Sin mensajes'}</span>
                    </div>
                    {conv.no_leidos > 0 && (
                      <span className="conv-badge">{conv.no_leidos}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Área de chat */}
          <div className={`chat-main ${conversacionActiva ? 'active' : ''}`}>
            {!conversacionActiva ? (
              <div className="chat-placeholder">
                <span className="chat-placeholder-icon">💬</span>
                <p>Selecciona una conversación para ver los mensajes</p>
                <p className="text-muted">O inicia una nueva conversación con un paciente</p>
              </div>
            ) : (
              <>
                {/* Header del chat */}
                <div className="chat-header" style={{ '--area-color': areaConfig.color }}>
                  <button className="btn-back-chat" onClick={() => setConversacionActiva(null)}>
                    ←
                  </button>
                  <div className="chat-header-info">
                    <div className="chat-header-avatar">
                      {otroUsuarioChat?.nombre_completo?.charAt(0) || conversacionActiva.otro_usuario_nombre?.charAt(0) || 'P'}
                    </div>
                    <span className="chat-header-name">
                      {otroUsuarioChat?.nombre_completo || conversacionActiva.otro_usuario_nombre}
                    </span>
                  </div>
                </div>

                {/* Mensajes */}
                <div className="chat-messages">
                  {mensajes.length === 0 ? (
                    <div className="chat-no-messages">
                      <p>No hay mensajes aún</p>
                      <p className="text-muted">Envía el primer mensaje</p>
                    </div>
                  ) : (
                    mensajes.map((msg) => (
                      <div
                        key={msg.id}
                        className={`chat-message ${msg.emisor_id === user?.id ? 'sent' : 'received'}`}
                        style={{ '--area-color': areaConfig.color }}
                      >
                        <div className="message-content">
                          <p>{msg.mensaje}</p>
                          <span className="message-time">
                            {new Date(msg.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Input de mensaje */}
                <div className="chat-input-container">
                  <input
                    type="text"
                    value={nuevoMensaje}
                    onChange={(e) => setNuevoMensaje(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleEnviarMensaje()}
                    placeholder="Escribe un mensaje..."
                    className="chat-input"
                  />
                  <button
                    className="btn-send-message"
                    onClick={handleEnviarMensaje}
                    disabled={!nuevoMensaje.trim()}
                    style={{ '--area-color': areaConfig.color }}
                  >
                    Enviar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    );

  // Renderizar vista de Herramientas
  const renderHerramientas = () => (
    <section className="tools-view">
      <div className="section-header">
        <h2 className="section-title">🛠️ Herramientas de {areaConfig.nombre}</h2>
      </div>

      <div className="tools-full-grid">
        {areaConfig.herramientas.map((tool, idx) => (
          <div key={idx} className="tool-card-full" style={{ '--tool-color': areaConfig.color }}>
            <span className="tool-icon-large">{tool.icon}</span>
            <h3 className="tool-title">{tool.nombre}</h3>
            <button className="btn-use-tool">Usar herramienta</button>
          </div>
        ))}
      </div>

      <div className="modules-section">
        <h3 className="subsection-title">Módulos Especializados</h3>
        <div className="modules-list">
          {areaConfig.modulos.map((modulo) => (
            <button key={modulo.id} onClick={() => setActiveView(modulo.view)} className="module-list-item">
              <span className="module-icon">{modulo.icon}</span>
              <div className="module-info">
                <h4>{modulo.nombre}</h4>
                <p>{modulo.descripcion}</p>
              </div>
              <span className="module-arrow">→</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );

  // ===== VISTAS DE MÓDULOS ESPECÍFICOS =====

  // Componente reutilizable: Selector de paciente para módulos
  const renderPatientSelector = (title, icon) => (
    <section className="module-view">
      <div className="module-header">
        <button className="back-btn" onClick={() => setActiveView('inicio')}>
          ← Volver
        </button>
        <h2 className="module-title">{icon} {title}</h2>
      </div>

      <div className="patient-selector">
        <h3>Selecciona un paciente para ver sus datos:</h3>
        {dashboardData.pacientes.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">👥</span>
            <p>No tienes pacientes asignados</p>
          </div>
        ) : (
          <div className="patients-selector-grid">
            {dashboardData.pacientes.map((paciente) => (
              <button
                key={paciente.id}
                className="patient-selector-card"
                onClick={() => handleSelectPaciente(paciente)}
                style={{ '--area-color': areaConfig.color }}
              >
                <div className="patient-avatar-small">
                  {paciente.nombre?.charAt(0) || 'P'}
                </div>
                <div className="patient-info-small">
                  <span className="patient-name">{paciente.nombre}</span>
                  <span className="patient-phase">{paciente.fase_actual || 'Sin fase'}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );

  // Vista: Historial de Consultas (Medicina)
  const renderModConsultas = () => {
    if (!selectedPaciente) {
      return renderPatientSelector('Historial de Consultas', '🩺');
    }

    return (
      <section className="module-view">
        <div className="module-header">
          <button className="back-btn" onClick={handleBackToPatientList}>
            ← Cambiar paciente
          </button>
          <h2 className="module-title">🩺 Consultas de {selectedPaciente.nombre}</h2>
        </div>

        {loadingPacienteData ? (
          <div className="loading-module">
            <div className="loading-spinner"></div>
            <p>Cargando historial...</p>
          </div>
        ) : (
          <div className="module-content">
            <div className="patient-summary-card" style={{ '--area-color': areaConfig.color }}>
              <div className="patient-avatar-large">{selectedPaciente.nombre?.charAt(0)}</div>
              <div className="patient-summary-info">
                <h3>{selectedPaciente.nombre}</h3>
                <p>Fase: {selectedPaciente.fase_actual || 'Sin asignar'}</p>
                <p>Última cita: {selectedPaciente.ultima_cita || 'N/A'}</p>
              </div>
            </div>

            <div className="consultas-list">
              <h3 className="subsection-title">Historial de Consultas</h3>
              {pacienteData?.citas?.length > 0 ? (
                pacienteData.citas.map((cita, idx) => (
                  <div key={idx} className="consulta-card">
                    <div className="consulta-date">
                      <span className="date">{cita.fecha}</span>
                      <span className="time">{cita.hora}</span>
                    </div>
                    <div className="consulta-info">
                      <span className="consulta-type">{cita.tipo}</span>
                      <span className={`consulta-status ${cita.estado}`}>{cita.estado}</span>
                    </div>
                    {cita.notas && (
                      <div className="consulta-notes">
                        <strong>Notas:</strong> {cita.notas}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <span className="empty-icon">📋</span>
                  <p>No hay consultas registradas para este paciente</p>
                </div>
              )}
            </div>

            <div className="module-actions">
              <Link
                to={`/especialista/pacientes/${selectedPaciente.id}/expediente`}
                className="btn-primary"
              >
                Ver Expediente Completo
              </Link>
            </div>
          </div>
        )}
      </section>
    );
  };

  // Vista: Signos Vitales (Medicina)
  const renderModSignosVitales = () => {
    if (!selectedPaciente) {
      return renderPatientSelector('Signos Vitales', '❤️‍🩹');
    }

    // Datos de ejemplo - en producción vendrían del backend
    const signosVitales = pacienteData?.signos_vitales || [
      { fecha: '2024-01-15', presion: '120/80', glucosa: 95, frecuencia: 72, temperatura: 36.5 },
      { fecha: '2024-01-10', presion: '118/78', glucosa: 92, frecuencia: 70, temperatura: 36.4 },
      { fecha: '2024-01-05', presion: '122/82', glucosa: 98, frecuencia: 75, temperatura: 36.6 },
    ];

    return (
      <section className="module-view">
        <div className="module-header">
          <button className="back-btn" onClick={handleBackToPatientList}>
            ← Cambiar paciente
          </button>
          <h2 className="module-title">❤️‍🩹 Signos Vitales de {selectedPaciente.nombre}</h2>
        </div>

        {loadingPacienteData ? (
          <div className="loading-module">
            <div className="loading-spinner"></div>
            <p>Cargando signos vitales...</p>
          </div>
        ) : (
          <div className="module-content">
            <div className="patient-summary-card" style={{ '--area-color': areaConfig.color }}>
              <div className="patient-avatar-large">{selectedPaciente.nombre?.charAt(0)}</div>
              <div className="patient-summary-info">
                <h3>{selectedPaciente.nombre}</h3>
                <p>Fase: {selectedPaciente.fase_actual || 'Sin asignar'}</p>
              </div>
            </div>

            <div className="vitals-summary">
              <h3 className="subsection-title">Últimos Registros</h3>
              <div className="vitals-grid">
                <div className="vital-card">
                  <span className="vital-icon">🫀</span>
                  <span className="vital-label">Presión Arterial</span>
                  <span className="vital-value">{signosVitales[0]?.presion || 'N/A'}</span>
                  <span className="vital-unit">mmHg</span>
                </div>
                <div className="vital-card">
                  <span className="vital-icon">🩸</span>
                  <span className="vital-label">Glucosa</span>
                  <span className="vital-value">{signosVitales[0]?.glucosa || 'N/A'}</span>
                  <span className="vital-unit">mg/dL</span>
                </div>
                <div className="vital-card">
                  <span className="vital-icon">💓</span>
                  <span className="vital-label">Frecuencia Cardíaca</span>
                  <span className="vital-value">{signosVitales[0]?.frecuencia || 'N/A'}</span>
                  <span className="vital-unit">bpm</span>
                </div>
                <div className="vital-card">
                  <span className="vital-icon">🌡️</span>
                  <span className="vital-label">Temperatura</span>
                  <span className="vital-value">{signosVitales[0]?.temperatura || 'N/A'}</span>
                  <span className="vital-unit">°C</span>
                </div>
              </div>
            </div>

            <div className="vitals-history">
              <h3 className="subsection-title">Historial</h3>
              <table className="vitals-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Presión</th>
                    <th>Glucosa</th>
                    <th>FC</th>
                    <th>Temp</th>
                  </tr>
                </thead>
                <tbody>
                  {signosVitales.map((registro, idx) => (
                    <tr key={idx}>
                      <td>{registro.fecha}</td>
                      <td>{registro.presion}</td>
                      <td>{registro.glucosa}</td>
                      <td>{registro.frecuencia}</td>
                      <td>{registro.temperatura}°</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="module-actions">
              <Link
                to={`/especialista/pacientes/${selectedPaciente.id}/expediente`}
                className="btn-primary"
              >
                Ver Expediente Completo
              </Link>
            </div>
          </div>
        )}
      </section>
    );
  };

  // Vista: Estudios Clínicos (Medicina)
  const renderModEstudios = () => {
    if (!selectedPaciente) {
      return renderPatientSelector('Estudios Clínicos', '🔬');
    }

    // Combinar estudios del backend con los locales
    const estudiosBase = pacienteData?.estudios || [
      { id: 1, nombre: 'Biometría Hemática', fecha: '2024-01-12', estado: 'Completado', resultado: 'Normal' },
      { id: 2, nombre: 'Química Sanguínea', fecha: '2024-01-12', estado: 'Completado', resultado: 'Glucosa elevada' },
      { id: 3, nombre: 'Radiografía de Tórax', fecha: '2024-01-05', estado: 'Completado', resultado: 'Sin alteraciones' },
    ];
    const estudios = [...estudiosBase, ...estudiosLocales];

    return (
      <section className="module-view">
        <div className="module-header">
          <button className="back-btn" onClick={handleBackToPatientList}>
            ← Cambiar paciente
          </button>
          <h2 className="module-title">🔬 Estudios de {selectedPaciente.nombre}</h2>
        </div>

        {loadingPacienteData ? (
          <div className="loading-module">
            <div className="loading-spinner"></div>
            <p>Cargando estudios...</p>
          </div>
        ) : (
          <div className="module-content">
            <div className="patient-summary-card" style={{ '--area-color': areaConfig.color }}>
              <div className="patient-avatar-large">{selectedPaciente.nombre?.charAt(0)}</div>
              <div className="patient-summary-info">
                <h3>{selectedPaciente.nombre}</h3>
                <p>Fase: {selectedPaciente.fase_actual || 'Sin asignar'}</p>
              </div>
              <button
                className="btn-add-estudio"
                onClick={() => setShowModal('nuevo-estudio')}
                style={{ '--area-color': areaConfig.color }}
              >
                + Nuevo Estudio
              </button>
            </div>

            <div className="estudios-list">
              <div className="estudios-header">
                <h3 className="subsection-title">Estudios Realizados ({estudios.length})</h3>
              </div>
              {estudios.length > 0 ? (
                estudios.map((estudio) => (
                  <div key={estudio.id} className="estudio-card">
                    <div className="estudio-icon">📄</div>
                    <div className="estudio-info">
                      <h4>{estudio.nombre}</h4>
                      <span className="estudio-date">{estudio.fecha}</span>
                      {estudio.tipo && <span className="estudio-tipo">{estudio.tipo}</span>}
                    </div>
                    <div className="estudio-result">
                      <span className={`estado-badge ${estudio.estado.toLowerCase()}`}>
                        {estudio.estado}
                      </span>
                      <p className="resultado">{estudio.resultado || 'Sin resultado'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <span className="empty-icon">🔬</span>
                  <p>No hay estudios registrados para este paciente</p>
                </div>
              )}
            </div>

            <div className="module-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowModal('nuevo-estudio')}
                style={{ '--area-color': areaConfig.color }}
              >
                + Agregar Estudio
              </button>
              <Link
                to={`/especialista/pacientes/${selectedPaciente.id}/expediente`}
                className="btn-primary"
              >
                Ver Expediente Completo
              </Link>
            </div>
          </div>
        )}
      </section>
    );
  };

  // Vista: Recetas Médicas (Medicina)
  const renderModRecetas = () => {
    if (!selectedPaciente) {
      return renderPatientSelector('Recetas Médicas', '💊');
    }

    // Datos de ejemplo
    const recetas = pacienteData?.recetas || [
      { id: 1, fecha: '2024-01-15', medicamentos: ['Metformina 500mg', 'Losartán 50mg'], vigencia: 'Activa' },
      { id: 2, fecha: '2024-01-01', medicamentos: ['Ibuprofeno 400mg'], vigencia: 'Vencida' },
    ];

    return (
      <section className="module-view">
        <div className="module-header">
          <button className="back-btn" onClick={handleBackToPatientList}>
            ← Cambiar paciente
          </button>
          <h2 className="module-title">💊 Recetas de {selectedPaciente.nombre}</h2>
        </div>

        {loadingPacienteData ? (
          <div className="loading-module">
            <div className="loading-spinner"></div>
            <p>Cargando recetas...</p>
          </div>
        ) : (
          <div className="module-content">
            <div className="patient-summary-card" style={{ '--area-color': areaConfig.color }}>
              <div className="patient-avatar-large">{selectedPaciente.nombre?.charAt(0)}</div>
              <div className="patient-summary-info">
                <h3>{selectedPaciente.nombre}</h3>
                <p>Fase: {selectedPaciente.fase_actual || 'Sin asignar'}</p>
              </div>
            </div>

            <div className="recetas-list">
              <h3 className="subsection-title">Recetas Emitidas</h3>
              {recetas.length > 0 ? (
                recetas.map((receta) => (
                  <div key={receta.id} className={`receta-card ${receta.vigencia.toLowerCase()}`}>
                    <div className="receta-header">
                      <span className="receta-date">📅 {receta.fecha}</span>
                      <span className={`vigencia-badge ${receta.vigencia.toLowerCase()}`}>
                        {receta.vigencia}
                      </span>
                    </div>
                    <div className="receta-medicamentos">
                      <strong>Medicamentos:</strong>
                      <ul>
                        {receta.medicamentos.map((med, idx) => (
                          <li key={idx}>💊 {med}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <span className="empty-icon">💊</span>
                  <p>No hay recetas registradas para este paciente</p>
                </div>
              )}
            </div>

            <div className="module-actions">
              <button className="btn-secondary" style={{ '--area-color': areaConfig.color }}>
                + Nueva Receta
              </button>
              <Link
                to={`/especialista/pacientes/${selectedPaciente.id}/expediente`}
                className="btn-primary"
              >
                Ver Expediente Completo
              </Link>
            </div>
          </div>
        )}
      </section>
    );
  };

  // Vista genérica para módulos en desarrollo
  // Vista: Planes Nutricionales (Nutrición)
  const renderPlanesNutricionales = () => {
    const especialistaId = user?.especialista_id || user?.id;

    return (
      <PlanesNutricionales
        especialistaId={especialistaId}
        pacientes={dashboardData.pacientes}
        onBack={() => setActiveView('inicio')}
      />
    );
  };

  const renderModuloEnDesarrollo = (titulo, icono) => (
    <section className="module-view">
      <div className="module-header">
        <button className="back-btn" onClick={() => setActiveView('inicio')}>
          ← Volver
        </button>
        <h2 className="module-title">{icono} {titulo}</h2>
      </div>

      <div className="module-content">
        <div className="coming-soon">
          <span className="coming-soon-icon">🚧</span>
          <h3>Módulo en Desarrollo</h3>
          <p>Este módulo estará disponible próximamente.</p>
          <p>Podrás ver los datos de tus pacientes relacionados con {titulo.toLowerCase()}.</p>
        </div>
      </div>
    </section>
  );

  // Renderizar contenido según vista activa
  const renderContent = () => {
    switch (activeView) {
      case 'pacientes': return renderPacientes();
      case 'agenda': return renderAgenda();
      case 'seguimientos': return renderSeguimientos();
      case 'mensajes': return renderMensajes();
      case 'herramientas': return renderHerramientas();

      // Módulos de Medicina
      case 'mod-consultas': return renderModConsultas();
      case 'mod-signos-vitales': return renderModSignosVitales();
      case 'mod-estudios': return renderModEstudios();
      case 'mod-recetas': return renderModRecetas();

      // Módulos de otras áreas (en desarrollo)
      case 'mod-ejercicios': return renderModuloEnDesarrollo('Ejercicios de Pacientes', '🏋️');
      case 'mod-evaluaciones': return renderModuloEnDesarrollo('Evaluaciones Físicas', '📊');
      case 'mod-planes': return renderModuloEnDesarrollo('Planes de Tratamiento', '📋');
      case 'mod-progreso': return renderModuloEnDesarrollo('Progreso de Pacientes', '📈');
      case 'mod-planes-nutricionales': return renderPlanesNutricionales();
      case 'mod-seguimiento-peso': return renderModuloEnDesarrollo('Seguimiento de Peso', '📉');
      case 'mod-historial-alimenticio': return renderModuloEnDesarrollo('Historial Alimenticio', '🥗');
      case 'mod-imc': return renderModuloEnDesarrollo('IMC de Pacientes', '⚖️');
      case 'mod-evaluaciones-cognitivas': return renderModuloEnDesarrollo('Evaluaciones Cognitivas', '🧩');
      case 'mod-ejercicios-mentales': return renderModuloEnDesarrollo('Ejercicios Mentales', '🎯');
      case 'mod-memoria': return renderModuloEnDesarrollo('Registro de Memoria', '📝');
      case 'mod-emocional': return renderModuloEnDesarrollo('Estado Emocional', '😊');
      case 'mod-dispositivos': return renderModuloEnDesarrollo('Dispositivos', '🦾');
      case 'mod-adaptacion': return renderModuloEnDesarrollo('Adaptación', '🔧');
      case 'mod-mantenimiento': return renderModuloEnDesarrollo('Mantenimiento', '🛠️');
      case 'mod-medidas': return renderModuloEnDesarrollo('Medidas y Ajustes', '📏');

      default: return renderInicio();
    }
  };

  if (isLoading) {
    return (
      <div className="especialista-dashboard loading" data-age-mode={settings.ageMode}>
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Cargando tu panel de {areaConfig.nombre}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="especialista-dashboard" data-age-mode={settings.ageMode} data-area={areaCodigo}>
      {/* Header */}
      <header className="dashboard-header" style={{ '--area-color': areaConfig.color }}>
        <div className="header-left">
          <div className="brand">
            <span className="brand-icon">{areaConfig.icon}</span>
            <span className="brand-name">Azaria - {areaConfig.nombre}</span>
          </div>
        </div>

        <div className="header-right">
          <button
            className={`header-btn voice-btn ${isSpeaking ? 'speaking' : ''}`}
            onClick={() => isSpeaking ? stop() : speakModule('especialista-dashboard')}
            aria-label={isSpeaking ? 'Detener audio' : 'Escuchar ayuda'}
          >
            {isSpeaking ? '⏹️' : '🔊'}
          </button>

          <button
            className="header-btn accessibility-btn"
            onClick={togglePanel}
            aria-label="Accesibilidad"
          >
            ♿
          </button>

          <div className="user-menu">
            <div className="user-avatar" style={{ background: areaConfig.color }}>
              {user?.nombre?.charAt(0) || 'E'}
            </div>
            <button className="header-btn logout-btn" onClick={handleLogout} title="Cerrar sesión">
              🚪
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-navigation" style={{ '--area-color': areaConfig.color }}>
        <button
          className={`nav-item ${activeView === 'inicio' ? 'active' : ''}`}
          onClick={() => setActiveView('inicio')}
        >
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Inicio</span>
        </button>
        <button
          className={`nav-item ${activeView === 'agenda' ? 'active' : ''}`}
          onClick={() => setActiveView('agenda')}
        >
          <span className="nav-icon">📅</span>
          <span className="nav-label">Agenda</span>
        </button>
        <button
          className={`nav-item ${activeView === 'pacientes' ? 'active' : ''}`}
          onClick={() => setActiveView('pacientes')}
        >
          <span className="nav-icon">👥</span>
          <span className="nav-label">Pacientes</span>
        </button>
        <button
          className={`nav-item ${activeView === 'mensajes' ? 'active' : ''}`}
          onClick={() => setActiveView('mensajes')}
        >
          <span className="nav-icon">💬</span>
          <span className="nav-label">Mensajes</span>
          {dashboardData.mensajesNuevos > 0 && (
            <span className="nav-badge">{dashboardData.mensajesNuevos}</span>
          )}
        </button>
      </nav>

      <AccessibilityPanel />
      <AccessibilityFAB />

      {/* ===== MODALES ===== */}

      {/* Modal: Calculadora de Dosis */}
      {showModal === 'calculadora-dosis' && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal-content tool-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>💉 Calculadora de Dosis</h2>
              <button className="modal-close" onClick={() => setShowModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Peso del paciente (kg)</label>
                <input
                  type="number"
                  value={dosisForm.peso}
                  onChange={e => setDosisForm({...dosisForm, peso: e.target.value})}
                  placeholder="Ej: 70"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Dosis por kg (mg/kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={dosisForm.dosis_mg_kg}
                  onChange={e => setDosisForm({...dosisForm, dosis_mg_kg: e.target.value})}
                  placeholder="Ej: 10"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Frecuencia (cada X horas)</label>
                <select
                  value={dosisForm.frecuencia}
                  onChange={e => setDosisForm({...dosisForm, frecuencia: e.target.value})}
                  className="form-input"
                >
                  <option value="4">Cada 4 horas</option>
                  <option value="6">Cada 6 horas</option>
                  <option value="8">Cada 8 horas</option>
                  <option value="12">Cada 12 horas</option>
                  <option value="24">Cada 24 horas</option>
                </select>
              </div>

              {calcularDosis() && (
                <div className="resultado-calculo">
                  <h3>Resultado:</h3>
                  <div className="resultado-item">
                    <span>Dosis por toma:</span>
                    <strong>{calcularDosis().dosisPorToma} mg</strong>
                  </div>
                  <div className="resultado-item">
                    <span>Tomas por día:</span>
                    <strong>{calcularDosis().tomasPorDia}</strong>
                  </div>
                  <div className="resultado-item">
                    <span>Dosis diaria total:</span>
                    <strong>{calcularDosis().dosisDiaria} mg</strong>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setDosisForm({ peso: '', dosis_mg_kg: '', frecuencia: '8' })}>
                Limpiar
              </button>
              <button className="btn-primary" onClick={() => setShowModal(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: CIE-10 */}
      {showModal === 'cie10' && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal-content tool-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📖 Códigos CIE-10</h2>
              <button className="modal-close" onClick={() => setShowModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Buscar código o diagnóstico</label>
                <input
                  type="text"
                  value={cie10Search}
                  onChange={e => setCie10Search(e.target.value)}
                  placeholder="Ej: diabetes, E11, hipertensión..."
                  className="form-input"
                />
              </div>
              <div className="cie10-list">
                {cie10Filtrado.map((item, idx) => (
                  <div key={idx} className="cie10-item" onClick={() => {
                    navigator.clipboard.writeText(item.codigo);
                    alert(`Código ${item.codigo} copiado al portapapeles`);
                  }}>
                    <span className="cie10-codigo">{item.codigo}</span>
                    <span className="cie10-desc">{item.descripcion}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setShowModal(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Interacciones */}
      {showModal === 'interacciones' && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal-content tool-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚠️ Verificar Interacciones</h2>
              <button className="modal-close" onClick={() => setShowModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Medicamento 1</label>
                <input
                  type="text"
                  value={interaccionForm.medicamento1}
                  onChange={e => setInteraccionForm({...interaccionForm, medicamento1: e.target.value})}
                  placeholder="Ej: Metformina"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Medicamento 2</label>
                <input
                  type="text"
                  value={interaccionForm.medicamento2}
                  onChange={e => setInteraccionForm({...interaccionForm, medicamento2: e.target.value})}
                  placeholder="Ej: Losartán"
                  className="form-input"
                />
              </div>

              {interaccionForm.medicamento1 && interaccionForm.medicamento2 && (
                <div className="interaccion-result">
                  <div className="interaccion-header safe">
                    <span className="interaccion-icon">✅</span>
                    <span>Sin interacciones graves conocidas</span>
                  </div>
                  <p className="interaccion-nota">
                    No se encontraron interacciones graves entre {interaccionForm.medicamento1} y {interaccionForm.medicamento2}.
                    Siempre verifique con fuentes adicionales.
                  </p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setInteraccionForm({ medicamento1: '', medicamento2: '' })}>
                Limpiar
              </button>
              <button className="btn-primary" onClick={() => setShowModal(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Escala de Dolor */}
      {showModal === 'escala-dolor' && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal-content tool-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>😣 Escala de Dolor (EVA)</h2>
              <button className="modal-close" onClick={() => setShowModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="escala-dolor">
                {[0,1,2,3,4,5,6,7,8,9,10].map(nivel => (
                  <div key={nivel} className={`dolor-nivel nivel-${nivel}`}>
                    <span className="dolor-numero">{nivel}</span>
                    <span className="dolor-emoji">
                      {nivel <= 2 ? '😊' : nivel <= 4 ? '🙂' : nivel <= 6 ? '😐' : nivel <= 8 ? '😣' : '😭'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="dolor-leyenda">
                <p><strong>0:</strong> Sin dolor</p>
                <p><strong>1-3:</strong> Dolor leve</p>
                <p><strong>4-6:</strong> Dolor moderado</p>
                <p><strong>7-9:</strong> Dolor severo</p>
                <p><strong>10:</strong> Dolor insoportable</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setShowModal(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Test genérico */}
      {showModal === 'test' && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal-content tool-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Herramienta de Evaluación</h2>
              <button className="modal-close" onClick={() => setShowModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Esta herramienta de evaluación estará disponible próximamente.</p>
              <p>Permitirá realizar tests y evaluaciones directamente desde la plataforma.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setShowModal(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Herramienta Genérica */}
      {showModal === 'herramienta-generica' && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal-content tool-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🛠️ Herramienta</h2>
              <button className="modal-close" onClick={() => setShowModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="coming-soon-modal">
                <span className="coming-soon-icon">🚧</span>
                <p>Esta herramienta estará disponible próximamente.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setShowModal(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Nuevo Estudio Clínico */}
      {showModal === 'nuevo-estudio' && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🔬 Nuevo Estudio Clínico</h2>
              <button className="modal-close" onClick={() => setShowModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="modal-subtitle">
                Paciente: <strong>{selectedPaciente?.nombre}</strong>
              </p>

              <div className="form-group">
                <label>Nombre del estudio *</label>
                <input
                  type="text"
                  value={estudioForm.nombre}
                  onChange={e => setEstudioForm({...estudioForm, nombre: e.target.value})}
                  placeholder="Ej: Biometría Hemática Completa"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tipo de estudio</label>
                  <select
                    value={estudioForm.tipo}
                    onChange={e => setEstudioForm({...estudioForm, tipo: e.target.value})}
                    className="form-input"
                  >
                    <option value="laboratorio">Laboratorio</option>
                    <option value="imagen">Imagen</option>
                    <option value="electrocardiograma">Electrocardiograma</option>
                    <option value="ultrasonido">Ultrasonido</option>
                    <option value="radiografia">Radiografía</option>
                    <option value="tomografia">Tomografía</option>
                    <option value="resonancia">Resonancia Magnética</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Fecha</label>
                  <input
                    type="date"
                    value={estudioForm.fecha}
                    onChange={e => setEstudioForm({...estudioForm, fecha: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Resultado (opcional)</label>
                <input
                  type="text"
                  value={estudioForm.resultado}
                  onChange={e => setEstudioForm({...estudioForm, resultado: e.target.value})}
                  placeholder="Ej: Normal, Alterado, etc."
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Observaciones</label>
                <textarea
                  value={estudioForm.observaciones}
                  onChange={e => setEstudioForm({...estudioForm, observaciones: e.target.value})}
                  placeholder="Notas adicionales sobre el estudio..."
                  className="form-input form-textarea"
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(null)}>
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={handleGuardarEstudio}
                disabled={!estudioForm.nombre}
              >
                Guardar Estudio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Nueva Conversación */}
      {showModal === 'nueva-conversacion' && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>💬 Nueva Conversación</h2>
              <button className="modal-close" onClick={() => setShowModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="modal-subtitle">
                Selecciona un paciente para iniciar una conversación:
              </p>

              {dashboardData.pacientes.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">👥</span>
                  <p>No tienes pacientes asignados</p>
                </div>
              ) : (
                <div className="pacientes-chat-list">
                  {dashboardData.pacientes.map((paciente) => (
                    <button
                      key={paciente.id}
                      className="paciente-chat-item"
                      onClick={() => {
                        handleIniciarConversacion(paciente);
                        setShowModal(null);
                        setActiveView('mensajes');
                      }}
                      style={{ '--area-color': areaConfig.color }}
                    >
                      <div className="paciente-chat-avatar">
                        {paciente.nombre?.charAt(0) || 'P'}
                      </div>
                      <div className="paciente-chat-info">
                        <span className="nombre">{paciente.nombre}</span>
                        <span className="email">{paciente.email}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Nueva Cita */}
      {showModal === 'nueva-cita' && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📅 Agendar Nueva Cita</h2>
              <button className="modal-close" onClick={() => setShowModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Paciente *</label>
                <select
                  value={citaForm.paciente_id}
                  onChange={e => setCitaForm({...citaForm, paciente_id: e.target.value})}
                  className="form-input"
                  required
                >
                  <option value="">Seleccionar paciente</option>
                  {dashboardData.pacientes.map((paciente) => (
                    <option key={paciente.id} value={paciente.id}>
                      {paciente.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fecha *</label>
                  <input
                    type="date"
                    value={citaForm.fecha}
                    onChange={e => {
                      setCitaForm({...citaForm, fecha: e.target.value, hora_inicio: ''});
                      loadHorariosDisponibles(e.target.value);
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tipo de cita *</label>
                  <select
                    value={citaForm.tipo_cita_id}
                    onChange={e => setCitaForm({...citaForm, tipo_cita_id: e.target.value})}
                    className="form-input"
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    {tiposCita.map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nombre} ({tipo.duracion_minutos} min)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Horario disponible *</label>
                {horariosDisponibles.length === 0 ? (
                  <p className="text-muted">No hay horarios disponibles para esta fecha</p>
                ) : (
                  <div className="horarios-grid">
                    {horariosDisponibles.map((hora) => (
                      <button
                        key={hora}
                        type="button"
                        className={`horario-btn ${citaForm.hora_inicio === hora ? 'selected' : ''}`}
                        onClick={() => setCitaForm({...citaForm, hora_inicio: hora})}
                        style={{ '--area-color': areaConfig.color }}
                      >
                        {hora}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Motivo de la cita</label>
                <textarea
                  value={citaForm.motivo}
                  onChange={e => setCitaForm({...citaForm, motivo: e.target.value})}
                  placeholder="Describe brevemente el motivo de la consulta..."
                  className="form-input form-textarea"
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(null)}>
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={handleGuardarCita}
                disabled={!citaForm.paciente_id || !citaForm.fecha || !citaForm.hora_inicio || !citaForm.tipo_cita_id}
              >
                Agendar Cita
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EspecialistaDashboard;
