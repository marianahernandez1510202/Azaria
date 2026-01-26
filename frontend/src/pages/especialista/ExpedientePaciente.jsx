import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import AccessibilityPanel, { AccessibilityFAB } from '../../components/accessibility/AccessibilityPanel';
import api from '../../services/api';
import './ExpedientePaciente.css';

const ExpedientePaciente = () => {
  const { pacienteId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useAccessibility();

  const [isLoading, setIsLoading] = useState(true);
  const [paciente, setPaciente] = useState(null);
  const [citas, setCitas] = useState([]);
  const [asignacion, setAsignacion] = useState(null);
  const [notas, setNotas] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    loadPacienteData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pacienteId]);

  const loadPacienteData = async () => {
    setIsLoading(true);
    try {
      const especialistaId = user?.id;
      const response = await api.get(`/especialistas/${especialistaId}/pacientes/${pacienteId}`);

      if (response.success && response.data) {
        setPaciente(response.data.paciente);
        setCitas(response.data.citas || []);
        setAsignacion(response.data.asignacion);
        setNotas(response.data.asignacion?.notas || '');
      }
    } catch (error) {
      console.error('Error cargando datos del paciente:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotas = async () => {
    setIsSaving(true);
    try {
      const especialistaId = user?.id;
      await api.put(`/especialistas/${especialistaId}/pacientes/${pacienteId}/seguimiento`, {
        notas
      });
      alert('Notas guardadas correctamente');
    } catch (error) {
      console.error('Error guardando notas:', error);
      alert('Error al guardar las notas');
    } finally {
      setIsSaving(false);
    }
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return 'N/A';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="expediente-loading" data-age-mode={settings.ageMode}>
        <div className="loading-spinner"></div>
        <p>Cargando expediente...</p>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="expediente-error" data-age-mode={settings.ageMode}>
        <h2>Paciente no encontrado</h2>
        <p>No tienes acceso a este paciente o no existe.</p>
        <button onClick={() => navigate('/especialista')} className="btn-primary">
          Volver al Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="expediente-paciente" data-age-mode={settings.ageMode}>
      {/* Header */}
      <header className="expediente-header">
        <button
          className="btn-back"
          onClick={() => navigate('/especialista')}
          aria-label="Volver al dashboard"
        >
          <span aria-hidden="true">←</span> Volver
        </button>
        <h1>Expediente del Paciente</h1>
      </header>

      {/* Información del paciente */}
      <section className="paciente-info-card">
        <div className="paciente-avatar">
          {paciente.nombre_completo?.charAt(0) || 'P'}
        </div>
        <div className="paciente-datos">
          <h2>{paciente.nombre_completo}</h2>
          <div className="paciente-meta">
            <span className="meta-item">
              <strong>Edad:</strong> {calcularEdad(paciente.fecha_nacimiento)} años
            </span>
            <span className="meta-item">
              <strong>Email:</strong> {paciente.email}
            </span>
            <span className="meta-item">
              <strong>Fase:</strong>
              <span className="fase-badge">{paciente.fase_actual || 'Sin asignar'}</span>
            </span>
            <span className="meta-item">
              <strong>Registro:</strong> {formatFecha(paciente.fecha_registro)}
            </span>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <nav className="expediente-tabs">
        <button
          className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          Información General
        </button>
        <button
          className={`tab-btn ${activeTab === 'citas' ? 'active' : ''}`}
          onClick={() => setActiveTab('citas')}
        >
          Historial de Citas
        </button>
        <button
          className={`tab-btn ${activeTab === 'notas' ? 'active' : ''}`}
          onClick={() => setActiveTab('notas')}
        >
          Notas de Seguimiento
        </button>
      </nav>

      {/* Contenido según tab */}
      <main className="expediente-content">
        {activeTab === 'general' && (
          <div className="tab-content general-content">
            <div className="info-grid">
              <div className="info-card">
                <h3>Datos de Asignación</h3>
                <div className="info-list">
                  <div className="info-item">
                    <span className="info-label">Fecha de asignación:</span>
                    <span className="info-value">{formatFecha(asignacion?.fecha_asignacion)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Estado:</span>
                    <span className={`status-badge ${asignacion?.activo ? 'active' : 'inactive'}`}>
                      {asignacion?.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="info-card">
                <h3>Resumen de Citas</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-value">{citas.length}</span>
                    <span className="stat-label">Total citas</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">
                      {citas.filter(c => c.estado === 'completada').length}
                    </span>
                    <span className="stat-label">Completadas</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">
                      {citas.filter(c => c.estado === 'programada' || c.estado === 'confirmada').length}
                    </span>
                    <span className="stat-label">Pendientes</span>
                  </div>
                </div>
              </div>

              <div className="info-card full-width">
                <h3>Acciones Rápidas</h3>
                <div className="quick-actions">
                  <Link to={`/chat/${pacienteId}`} className="action-btn">
                    <span className="action-icon">💬</span>
                    Enviar Mensaje
                  </Link>
                  <button className="action-btn" onClick={() => setActiveTab('notas')}>
                    <span className="action-icon">📝</span>
                    Agregar Nota
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'citas' && (
          <div className="tab-content citas-content">
            <h3>Historial de Citas</h3>
            {citas.length === 0 ? (
              <div className="empty-state">
                <p>No hay citas registradas con este paciente.</p>
              </div>
            ) : (
              <div className="citas-list">
                {citas.map((cita) => (
                  <div key={cita.id} className={`cita-card ${cita.estado}`}>
                    <div className="cita-fecha">
                      <span className="cita-dia">{formatFecha(cita.fecha)}</span>
                      <span className="cita-hora">{cita.hora}</span>
                    </div>
                    <div className="cita-info">
                      <span className="cita-tipo">{cita.tipo}</span>
                      <span className={`cita-estado estado-${cita.estado}`}>
                        {cita.estado}
                      </span>
                    </div>
                    {cita.notas && (
                      <div className="cita-notas">
                        <strong>Notas:</strong> {cita.notas}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notas' && (
          <div className="tab-content notas-content">
            <h3>Notas de Seguimiento</h3>
            <p className="notas-description">
              Registra observaciones importantes sobre el progreso del paciente.
            </p>
            <textarea
              className="notas-textarea"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Escribe tus notas sobre el paciente..."
              rows={10}
            />
            <div className="notas-actions">
              <button
                className="btn-primary"
                onClick={handleSaveNotas}
                disabled={isSaving}
              >
                {isSaving ? 'Guardando...' : 'Guardar Notas'}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Panel de Accesibilidad */}
      <AccessibilityPanel />

      {/* FAB de Accesibilidad */}
      <AccessibilityFAB />
    </div>
  );
};

export default ExpedientePaciente;
