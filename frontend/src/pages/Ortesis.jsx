import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import AccessibilityPanel, { AccessibilityFAB } from '../components/accessibility/AccessibilityPanel';
import api from '../services/api';
import '../styles/Ortesis.css';

const Ortesis = () => {
  const { user } = useAuth();
  const { settings } = useAccessibility();
  const [activeTab, setActiveTab] = useState('dispositivo');
  const [dispositivo, setDispositivo] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [problemas, setProblemas] = useState([]);
  const [guias, setGuias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');

  // Formulario de problema
  const [problemaForm, setProblemaForm] = useState({
    tipo: '',
    descripcion: '',
    urgencia: 'media',
    foto: null
  });

  const tiposProblema = [
    { id: 'dolor', nombre: 'Dolor o molestia', icon: '🔴' },
    { id: 'ajuste', nombre: 'Problema de ajuste', icon: '🔧' },
    { id: 'piel', nombre: 'Irritación en la piel', icon: '🩹' },
    { id: 'mecanico', nombre: 'Falla mecánica', icon: '⚙️' },
    { id: 'limpieza', nombre: 'Necesita limpieza', icon: '🧼' },
    { id: 'otro', nombre: 'Otro problema', icon: '❓' }
  ];

  useEffect(() => {
    cargarDatos();
  }, [activeTab]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dispositivo') {
        const response = await api.get(`/ortesis/dispositivo/${user.paciente_id}`);
        setDispositivo(response.data);
      } else if (activeTab === 'checklist') {
        const today = new Date().toISOString().split('T')[0];
        const response = await api.get(`/ortesis/checklist/${user.paciente_id}/${today}`);
        setChecklist(response.data || getDefaultChecklist());
      } else if (activeTab === 'problemas') {
        const response = await api.get(`/ortesis/problemas/${user.paciente_id}`);
        setProblemas(response.data || []);
      } else if (activeTab === 'guias') {
        const response = await api.get('/ortesis/guias');
        setGuias(response.data || getDefaultGuias());
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      if (activeTab === 'checklist') setChecklist(getDefaultChecklist());
      if (activeTab === 'guias') setGuias(getDefaultGuias());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultChecklist = () => [
    { id: 1, categoria: 'Antes de colocar', items: [
      { id: 'c1', nombre: 'Revisar el muñón (sin heridas, irritación)', completado: false },
      { id: 'c2', nombre: 'Limpiar y secar bien la piel', completado: false },
      { id: 'c3', nombre: 'Aplicar crema hidratante (si aplica)', completado: false },
      { id: 'c4', nombre: 'Verificar estado del liner/calcetín', completado: false }
    ]},
    { id: 2, categoria: 'Colocación', items: [
      { id: 'c5', nombre: 'Colocar liner correctamente sin arrugas', completado: false },
      { id: 'c6', nombre: 'Insertar en el socket con cuidado', completado: false },
      { id: 'c7', nombre: 'Verificar que el pin esté bien conectado', completado: false },
      { id: 'c8', nombre: 'Ajustar correas/sistema de suspensión', completado: false }
    ]},
    { id: 3, categoria: 'Verificación', items: [
      { id: 'c9', nombre: 'Dar unos pasos para verificar ajuste', completado: false },
      { id: 'c10', nombre: 'Confirmar que no hay dolor ni presión excesiva', completado: false },
      { id: 'c11', nombre: 'Revisar alineación visual', completado: false }
    ]}
  ];

  const getDefaultGuias = () => [
    {
      id: 1,
      titulo: 'Cuidado diario del muñón',
      contenido: 'El cuidado adecuado del muñón es fundamental para prevenir problemas...',
      pasos: [
        'Lavar diariamente con jabón neutro y agua tibia',
        'Secar completamente, especialmente entre pliegues',
        'Inspeccionar en busca de enrojecimiento o heridas',
        'Aplicar crema hidratante por la noche (nunca antes de colocar la prótesis)',
        'Masajear suavemente para mejorar la circulación'
      ]
    },
    {
      id: 2,
      titulo: 'Limpieza de la prótesis',
      contenido: 'Mantener tu prótesis limpia prolonga su vida útil...',
      pasos: [
        'Limpiar el socket diariamente con paño húmedo',
        'Usar jabón antibacterial una vez por semana',
        'Secar completamente antes de guardar',
        'Revisar y limpiar el sistema de suspensión',
        'No sumergir en agua componentes electrónicos'
      ]
    },
    {
      id: 3,
      titulo: 'Señales de alerta',
      contenido: 'Contacta a tu especialista si presentas:',
      pasos: [
        'Dolor persistente que no mejora al ajustar',
        'Heridas o ampollas que no sanan',
        'Cambios en el volumen del muñón',
        'Ruidos o movimiento anormal de la prótesis',
        'Enrojecimiento o inflamación excesiva'
      ]
    }
  ];

  const handleChecklistChange = async (categoriaId, itemId) => {
    const updatedChecklist = checklist.map(cat => {
      if (cat.id === categoriaId) {
        return {
          ...cat,
          items: cat.items.map(item =>
            item.id === itemId ? { ...item, completado: !item.completado } : item
          )
        };
      }
      return cat;
    });
    setChecklist(updatedChecklist);

    try {
      await api.post('/ortesis/checklist', {
        paciente_id: user.paciente_id,
        fecha: new Date().toISOString().split('T')[0],
        checklist: updatedChecklist
      });
    } catch (err) {
      console.error('Error al guardar checklist:', err);
    }
  };

  const calcularProgresoChecklist = () => {
    const totalItems = checklist.reduce((acc, cat) => acc + cat.items.length, 0);
    const completados = checklist.reduce((acc, cat) =>
      acc + cat.items.filter(item => item.completado).length, 0);
    return totalItems > 0 ? Math.round((completados / totalItems) * 100) : 0;
  };

  const handleReportarProblema = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('paciente_id', user.paciente_id);
      formData.append('tipo', problemaForm.tipo);
      formData.append('descripcion', problemaForm.descripcion);
      formData.append('urgencia', problemaForm.urgencia);
      if (problemaForm.foto) {
        formData.append('foto', problemaForm.foto);
      }

      await api.post('/ortesis/problemas', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setShowModal(false);
      setProblemaForm({ tipo: '', descripcion: '', urgencia: 'media', foto: null });
      cargarDatos();
    } catch (err) {
      console.error('Error al reportar problema:', err);
    }
  };

  return (
    <div className="ortesis-page">
      <header className="page-header">
        <h1>Órtesis y Prótesis</h1>
        <p className="subtitle">Cuidado y mantenimiento de tu dispositivo</p>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'dispositivo' ? 'active' : ''}`}
          onClick={() => setActiveTab('dispositivo')}
        >
          Mi Dispositivo
        </button>
        <button
          className={`tab ${activeTab === 'checklist' ? 'active' : ''}`}
          onClick={() => setActiveTab('checklist')}
        >
          Checklist Diario
        </button>
        <button
          className={`tab ${activeTab === 'problemas' ? 'active' : ''}`}
          onClick={() => setActiveTab('problemas')}
        >
          Reportar Problema
        </button>
        <button
          className={`tab ${activeTab === 'guias' ? 'active' : ''}`}
          onClick={() => setActiveTab('guias')}
        >
          Guías de Cuidado
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando...</p>
        </div>
      ) : (
        <div className="tab-content">
          {activeTab === 'dispositivo' && (
            <div className="dispositivo-section">
              {dispositivo ? (
                <div className="dispositivo-card">
                  <div className="dispositivo-header">
                    <h2>{dispositivo.tipo}</h2>
                    <span className={`estado-badge ${dispositivo.estado}`}>
                      {dispositivo.estado}
                    </span>
                  </div>

                  <div className="dispositivo-info">
                    <div className="info-row">
                      <span className="info-label">Modelo:</span>
                      <span className="info-value">{dispositivo.modelo || 'No especificado'}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Fecha de entrega:</span>
                      <span className="info-value">
                        {dispositivo.fecha_entrega ? new Date(dispositivo.fecha_entrega).toLocaleDateString() : 'No especificada'}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Último mantenimiento:</span>
                      <span className="info-value">
                        {dispositivo.ultimo_mantenimiento ? new Date(dispositivo.ultimo_mantenimiento).toLocaleDateString() : 'No registrado'}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Próximo mantenimiento:</span>
                      <span className="info-value proximo">
                        {dispositivo.proximo_mantenimiento ? new Date(dispositivo.proximo_mantenimiento).toLocaleDateString() : 'Por programar'}
                      </span>
                    </div>
                  </div>

                  {dispositivo.notas && (
                    <div className="dispositivo-notas">
                      <h4>Notas del especialista:</h4>
                      <p>{dispositivo.notas}</p>
                    </div>
                  )}

                  <div className="dispositivo-acciones">
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setModalType('problema');
                        setShowModal(true);
                      }}
                    >
                      Reportar Problema
                    </button>
                    <button className="btn btn-secondary">
                      Solicitar Mantenimiento
                    </button>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <p>No hay dispositivo registrado</p>
                  <p className="help-text">Tu especialista registrará tu dispositivo</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="checklist-section">
              <div className="progreso-checklist">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${calcularProgresoChecklist()}%` }}
                  ></div>
                </div>
                <span className="progress-text">{calcularProgresoChecklist()}% completado</span>
              </div>

              {checklist.map(categoria => (
                <div key={categoria.id} className="categoria-checklist">
                  <h3>{categoria.categoria}</h3>
                  <div className="items-list">
                    {categoria.items.map(item => (
                      <label key={item.id} className="checklist-item">
                        <input
                          type="checkbox"
                          checked={item.completado}
                          onChange={() => handleChecklistChange(categoria.id, item.id)}
                        />
                        <span className={item.completado ? 'completed' : ''}>
                          {item.nombre}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'problemas' && (
            <div className="problemas-section">
              <button
                className="btn btn-primary btn-lg btn-block"
                onClick={() => {
                  setModalType('problema');
                  setShowModal(true);
                }}
              >
                + Reportar Nuevo Problema
              </button>

              <h3>Historial de problemas</h3>
              {problemas.length > 0 ? (
                <div className="problemas-list">
                  {problemas.map(problema => (
                    <div key={problema.id} className={`problema-card urgencia-${problema.urgencia}`}>
                      <div className="problema-header">
                        <span className="problema-tipo">
                          {tiposProblema.find(t => t.id === problema.tipo)?.icon} {tiposProblema.find(t => t.id === problema.tipo)?.nombre}
                        </span>
                        <span className={`urgencia-badge ${problema.urgencia}`}>
                          {problema.urgencia}
                        </span>
                      </div>
                      <p className="problema-descripcion">{problema.descripcion}</p>
                      <div className="problema-footer">
                        <span className="problema-fecha">
                          {new Date(problema.created_at).toLocaleDateString()}
                        </span>
                        <span className={`problema-estado ${problema.estado}`}>
                          {problema.estado || 'Pendiente'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No hay problemas reportados</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'guias' && (
            <div className="guias-section">
              {guias.map(guia => (
                <div key={guia.id} className="guia-card">
                  <h3>{guia.titulo}</h3>
                  <p className="guia-intro">{guia.contenido}</p>
                  <ol className="guia-pasos">
                    {guia.pasos.map((paso, index) => (
                      <li key={index}>{paso}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal para reportar problema */}
      {showModal && modalType === 'problema' && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Reportar Problema</h2>
            <form onSubmit={handleReportarProblema}>
              <div className="form-group">
                <label>Tipo de problema</label>
                <div className="tipo-problema-grid">
                  {tiposProblema.map(tipo => (
                    <button
                      key={tipo.id}
                      type="button"
                      className={`tipo-btn ${problemaForm.tipo === tipo.id ? 'selected' : ''}`}
                      onClick={() => setProblemaForm({...problemaForm, tipo: tipo.id})}
                    >
                      <span className="tipo-icon">{tipo.icon}</span>
                      <span className="tipo-nombre">{tipo.nombre}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Describe el problema</label>
                <textarea
                  value={problemaForm.descripcion}
                  onChange={e => setProblemaForm({...problemaForm, descripcion: e.target.value})}
                  className="form-control"
                  rows="4"
                  placeholder="Describe con detalle qué está pasando..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Urgencia</label>
                <select
                  value={problemaForm.urgencia}
                  onChange={e => setProblemaForm({...problemaForm, urgencia: e.target.value})}
                  className="form-control"
                >
                  <option value="baja">Baja - Puede esperar</option>
                  <option value="media">Media - Necesito atención pronto</option>
                  <option value="alta">Alta - Necesito atención urgente</option>
                </select>
              </div>

              <div className="form-group">
                <label>Foto del problema (opcional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setProblemaForm({...problemaForm, foto: e.target.files[0]})}
                  className="form-control"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!problemaForm.tipo || !problemaForm.descripcion}
                >
                  Enviar Reporte
                </button>
              </div>
            </form>
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

export default Ortesis;
