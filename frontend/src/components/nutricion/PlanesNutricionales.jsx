import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './PlanesNutricionales.css';

const PlanesNutricionales = ({ especialistaId, pacientes, onBack }) => {
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPlanDetail, setShowPlanDetail] = useState(null);
  const [showAsignarModal, setShowAsignarModal] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Formulario de upload
  const [uploadForm, setUploadForm] = useState({
    nombre: '',
    descripcion: '',
    file: null
  });

  // Formulario de asignación
  const [asignarForm, setAsignarForm] = useState({
    paciente_id: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    notas: ''
  });

  useEffect(() => {
    loadPlanes();
  }, [especialistaId]);

  const loadPlanes = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/nutricion/planes/especialista/${especialistaId}`);
      setPlanes(response.data?.planes || []);
    } catch (error) {
      console.error('Error cargando planes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    const allowedExtensions = ['.pdf', '.docx', '.doc'];
    const fileExtension = file?.name?.toLowerCase().slice(file.name.lastIndexOf('.'));

    if (file && (allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension))) {
      setUploadForm({ ...uploadForm, file });
    } else {
      alert('Solo se permiten archivos PDF o Word (.docx, .doc)');
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.file) {
      alert('Selecciona un archivo PDF');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('pdf', uploadForm.file);
      formData.append('nombre', uploadForm.nombre || `Plan Nutricional ${new Date().toLocaleDateString()}`);
      formData.append('descripcion', uploadForm.descripcion);

      const response = await api.post(`/nutricion/planes/upload/${especialistaId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      if (response.data) {
        alert('Plan creado exitosamente');
        setShowUploadModal(false);
        setUploadForm({ nombre: '', descripcion: '', file: null });
        loadPlanes();

        // Mostrar el plan recién creado para edición
        if (response.data.plan_id) {
          loadPlanDetail(response.data.plan_id);
        }
      }
    } catch (error) {
      console.error('Error subiendo plan:', error);
      alert('Error al subir el plan: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const loadPlanDetail = async (planId) => {
    try {
      const response = await api.get(`/nutricion/planes/${planId}`);
      setShowPlanDetail(response.data);
    } catch (error) {
      console.error('Error cargando detalle:', error);
    }
  };

  const handleAsignar = async () => {
    if (!asignarForm.paciente_id) {
      alert('Selecciona un paciente');
      return;
    }

    try {
      await api.post(`/nutricion/planes/${showAsignarModal.id}/asignar`, {
        paciente_id: asignarForm.paciente_id,
        especialista_id: especialistaId,
        fecha_inicio: asignarForm.fecha_inicio,
        notas: asignarForm.notas
      });

      alert('Plan asignado exitosamente');
      setShowAsignarModal(null);
      setAsignarForm({ paciente_id: '', fecha_inicio: new Date().toISOString().split('T')[0], notas: '' });
      loadPlanes();
    } catch (error) {
      console.error('Error asignando plan:', error);
      alert('Error al asignar el plan');
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('¿Estás seguro de eliminar este plan?')) return;

    try {
      await api.delete(`/nutricion/planes/${planId}`);
      alert('Plan eliminado');
      loadPlanes();
    } catch (error) {
      console.error('Error eliminando plan:', error);
      alert(error.response?.data?.message || 'Error al eliminar el plan');
    }
  };

  const getDiaSemanaActual = () => {
    const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    return dias[new Date().getDay()];
  };

  const renderUploadModal = () => (
    <div className="modal-overlay" onClick={() => !uploading && setShowUploadModal(false)}>
      <div className="modal-content plan-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📄 Subir Plan Nutricional (PDF)</h2>
          {!uploading && (
            <button className="modal-close" onClick={() => setShowUploadModal(false)}>✕</button>
          )}
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Nombre del plan</label>
            <input
              type="text"
              value={uploadForm.nombre}
              onChange={(e) => setUploadForm({ ...uploadForm, nombre: e.target.value })}
              placeholder="Ej: Plan de pérdida de peso"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Descripción (opcional)</label>
            <textarea
              value={uploadForm.descripcion}
              onChange={(e) => setUploadForm({ ...uploadForm, descripcion: e.target.value })}
              placeholder="Descripción del plan..."
              className="form-input form-textarea"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Archivo del Plan (PDF o Word) *</label>
            <div className="file-upload-area">
              <input
                type="file"
                accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                id="pdf-upload"
                className="file-input"
              />
              <label htmlFor="pdf-upload" className="file-label">
                {uploadForm.file ? (
                  <>
                    <span className="file-icon">{uploadForm.file.name.endsWith('.docx') || uploadForm.file.name.endsWith('.doc') ? '📝' : '📄'}</span>
                    <span className="file-name">{uploadForm.file.name}</span>
                    <span className="file-size">({(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </>
                ) : (
                  <>
                    <span className="upload-icon">📤</span>
                    <span>Haz clic o arrastra un archivo PDF o Word (.docx)</span>
                    <span className="file-hint">Máximo 10MB - Se recomienda DOCX para mejor extracción</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {uploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <span className="progress-text">
                {uploadProgress < 100 ? `Subiendo... ${uploadProgress}%` : 'Procesando PDF...'}
              </span>
            </div>
          )}

          <div className="upload-info">
            <h4>ℹ️ Información</h4>
            <p>El sistema procesará automáticamente el PDF para extraer:</p>
            <ul>
              <li>Comidas y horarios</li>
              <li>Información nutricional (calorías, proteínas, etc.)</li>
              <li>Recomendaciones y restricciones</li>
            </ul>
            <p>Podrás editar y ajustar el contenido después de la carga.</p>
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={() => setShowUploadModal(false)}
            disabled={uploading}
          >
            Cancelar
          </button>
          <button
            className="btn-primary"
            onClick={handleUpload}
            disabled={!uploadForm.file || uploading}
          >
            {uploading ? 'Procesando...' : 'Subir y Procesar'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderPlanDetailModal = () => {
    if (!showPlanDetail) return null;

    const plan = showPlanDetail;
    const contenido = plan.contenido || {};
    // Usar las comidas del contenido JSON (que tiene las opciones) en lugar de plan.comidas
    const comidasContenido = contenido.comidas || [];

    const tiposComidaLabels = {
      desayuno: { icon: '🌅', label: 'Desayuno' },
      almuerzo: { icon: '🍽️', label: 'Almuerzo' },
      cena: { icon: '🌙', label: 'Cena' },
      snack: { icon: '🥜', label: 'Snack' },
      merienda: { icon: '🍪', label: 'Merienda' },
      media_manana: { icon: '🍎', label: 'Media Mañana' }
    };

    return (
      <div className="modal-overlay" onClick={() => setShowPlanDetail(null)}>
        <div className="modal-content plan-detail-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>📋 {plan.nombre}</h2>
            <button className="modal-close" onClick={() => setShowPlanDetail(null)}>✕</button>
          </div>
          <div className="modal-body">
            {/* Información del paciente si existe */}
            {contenido.paciente && (
              <div className="plan-paciente-info">
                <span className="paciente-badge">👤 {contenido.paciente}</span>
                {contenido.fecha && <span className="fecha-badge">📅 {contenido.fecha}</span>}
              </div>
            )}

            {plan.descripcion && (
              <p className="plan-descripcion">{plan.descripcion}</p>
            )}

            {/* Objetivo del plan */}
            {contenido.objetivo && (
              <div className="plan-objetivo">
                <strong>🎯 Objetivo:</strong> {contenido.objetivo}
              </div>
            )}

            {/* Macros totales */}
            <div className="plan-totales">
              {contenido.totales?.estimado && (
                <div className="estimado-badge">
                  <span>📊 Valores estimados basados en ingredientes detectados</span>
                </div>
              )}
              <div className="totales-grid">
                <div className="total-item calorias">
                  <span className="total-icon">🔥</span>
                  <span className="total-value">{Math.round(Number(plan.calorias_diarias || contenido.totales?.calorias || 0))}</span>
                  <span className="total-label">kcal/día</span>
                </div>
                <div className="total-item proteinas">
                  <span className="total-icon">🥩</span>
                  <span className="total-value">{Number(plan.proteinas_g || contenido.totales?.proteinas || 0).toFixed(0)}g</span>
                  <span className="total-label">Proteínas</span>
                </div>
                <div className="total-item carbos">
                  <span className="total-icon">🍞</span>
                  <span className="total-value">{Number(plan.carbohidratos_g || contenido.totales?.carbohidratos || 0).toFixed(0)}g</span>
                  <span className="total-label">Carbohidratos</span>
                </div>
                <div className="total-item grasas">
                  <span className="total-icon">🥑</span>
                  <span className="total-value">{Number(plan.grasas_g || contenido.totales?.grasas || 0).toFixed(0)}g</span>
                  <span className="total-label">Grasas</span>
                </div>
              </div>
            </div>

            {/* Indicaciones generales */}
            {contenido.indicaciones_generales?.length > 0 && (
              <div className="plan-indicaciones">
                <h3>📝 Indicaciones Generales</h3>
                <ul className="indicaciones-list">
                  {contenido.indicaciones_generales.map((ind, idx) => (
                    <li key={idx}>{ind}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* COMIDAS DEL PLAN - Diseño mejorado */}
            <div className="plan-comidas-section">
              <h3>🍽️ Menú del Día</h3>

              {comidasContenido.length > 0 ? (
                <div className="comidas-timeline">
                  {comidasContenido.map((comida, idx) => {
                    const tipoInfo = tiposComidaLabels[comida.tipo_comida] || { icon: '🍴', label: comida.nombre_original || comida.tipo_comida };

                    return (
                      <div key={idx} className="comida-timeline-item">
                        {/* Header de la comida */}
                        <div className="comida-timeline-header">
                          <div className="comida-time-badge">
                            <span className="comida-icon">{tipoInfo.icon}</span>
                            <div className="comida-time-info">
                              <span className="comida-tipo-label">{tipoInfo.label}</span>
                              {comida.horario && <span className="comida-horario">⏰ {comida.horario}</span>}
                            </div>
                          </div>
                          {comida.calorias > 0 && (
                            <span className="comida-kcal-badge">~{comida.calorias} kcal</span>
                          )}
                        </div>

                        {/* Opciones de la comida */}
                        {comida.opciones && comida.opciones.length > 0 ? (
                          <div className="opciones-container">
                            <div className="opciones-header">
                              <span className="opciones-count">{comida.opciones.length} {comida.opciones.length === 1 ? 'opción' : 'opciones'} disponibles</span>
                            </div>
                            <div className="opciones-grid">
                              {comida.opciones.map((opcion, opIdx) => (
                                <div key={opIdx} className="opcion-card-new">
                                  <div className="opcion-card-header">
                                    <span className="opcion-numero">Opción {opcion.numero || opIdx + 1}</span>
                                    {opcion.calorias_estimadas > 0 && (
                                      <span className="opcion-kcal-badge">~{opcion.calorias_estimadas} kcal</span>
                                    )}
                                  </div>
                                  <h4 className="opcion-nombre-new">{opcion.nombre}</h4>
                                  <p className="opcion-descripcion-new">
                                    {opcion.descripcion?.length > 200
                                      ? opcion.descripcion.substring(0, 200) + '...'
                                      : opcion.descripcion || 'Ver receta'}
                                  </p>
                                  {opcion.calorias_estimadas > 0 && (
                                    <div className="opcion-macros-new">
                                      <div className="macro-mini proteinas">
                                        <span className="macro-icon">🥩</span>
                                        <span className="macro-value">{opcion.proteinas_estimadas}g</span>
                                      </div>
                                      <div className="macro-mini carbos">
                                        <span className="macro-icon">🍞</span>
                                        <span className="macro-value">{opcion.carbohidratos_estimados}g</span>
                                      </div>
                                      <div className="macro-mini grasas">
                                        <span className="macro-icon">🥑</span>
                                        <span className="macro-value">{opcion.grasas_estimadas}g</span>
                                      </div>
                                    </div>
                                  )}
                                  {/* Ingredientes detectados */}
                                  {opcion.ingredientes_detectados?.length > 0 && (
                                    <details className="ingredientes-toggle">
                                      <summary>Ver ingredientes detectados ({opcion.ingredientes_detectados.length})</summary>
                                      <ul className="ingredientes-list">
                                        {opcion.ingredientes_detectados.map((ing, i) => (
                                          <li key={i}>
                                            <span className="ing-nombre">{ing.nombre}</span>
                                            <span className="ing-calorias">{ing.calorias} kcal</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </details>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="comida-sin-opciones">
                            <p>{comida.nombre_plato || 'Sin opciones detalladas'}</p>
                            {comida.descripcion && <p className="comida-desc-small">{comida.descripcion}</p>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-comidas">
                  <span className="empty-icon">📋</span>
                  <p>No se detectaron comidas estructuradas en el documento.</p>
                  <p className="help-text">Revisa el texto extraído abajo para ver el contenido original.</p>
                </div>
              )}
            </div>

            {contenido.recomendaciones?.length > 0 && (
              <div className="plan-section">
                <h3>💡 Recomendaciones</h3>
                <ul>
                  {contenido.recomendaciones.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {contenido.restricciones?.length > 0 && (
              <div className="plan-section">
                <h3>⚠️ Restricciones</h3>
                <ul>
                  {contenido.restricciones.map((res, idx) => (
                    <li key={idx}>{res}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Gráficas e imágenes del plan */}
            {(contenido.graficas?.length > 0 || contenido.imagenes?.length > 0) && (
              <div className="plan-graficas-section">
                <h3>📊 Material Visual</h3>
                <div className="graficas-grid">
                  {(contenido.graficas || contenido.imagenes || []).map((item, idx) => {
                    const imagen = item.imagen || item;
                    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
                    const imagePath = imagen.path || imagen;

                    return (
                      <div key={idx} className="grafica-card">
                        <div className="grafica-image-container">
                          <img
                            src={`${apiUrl}${imagePath}`}
                            alt={item.titulo || `Gráfica ${idx + 1}`}
                            className="grafica-image"
                            onClick={() => window.open(`${apiUrl}${imagePath}`, '_blank')}
                          />
                        </div>
                        <div className="grafica-info">
                          <h4 className="grafica-titulo">{item.titulo || `Gráfica informativa ${idx + 1}`}</h4>
                          {item.descripcion && (
                            <p className="grafica-descripcion">{item.descripcion}</p>
                          )}
                          {item.tipo && item.tipo !== 'general' && (
                            <span className="grafica-tipo-badge">{item.tipo.replace('_', ' ')}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {plan.pacientes_asignados?.length > 0 && (
              <div className="plan-section">
                <h3>👥 Pacientes Asignados ({plan.pacientes_asignados.length})</h3>
                <div className="pacientes-asignados-list">
                  {plan.pacientes_asignados.map((p) => (
                    <div key={p.id} className="paciente-asignado">
                      <span className="paciente-nombre">{p.nombre_completo}</span>
                      <span className="paciente-fecha">Desde: {new Date(p.fecha_inicio).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {contenido.texto_original && (
              <details className="texto-original-section">
                <summary>📝 Ver texto extraído del PDF</summary>
                <pre className="texto-original">{contenido.texto_original}</pre>
              </details>
            )}
          </div>
          <div className="modal-footer">
            <button
              className="btn-secondary"
              onClick={() => setShowPlanDetail(null)}
            >
              Cerrar
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                setShowAsignarModal(plan);
                setShowPlanDetail(null);
              }}
            >
              Asignar a Paciente
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderAsignarModal = () => {
    if (!showAsignarModal) return null;

    return (
      <div className="modal-overlay" onClick={() => setShowAsignarModal(null)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>👤 Asignar Plan a Paciente</h2>
            <button className="modal-close" onClick={() => setShowAsignarModal(null)}>✕</button>
          </div>
          <div className="modal-body">
            <p className="modal-subtitle">
              Plan: <strong>{showAsignarModal.nombre}</strong>
            </p>

            <div className="form-group">
              <label>Seleccionar Paciente *</label>
              <select
                value={asignarForm.paciente_id}
                onChange={(e) => setAsignarForm({ ...asignarForm, paciente_id: e.target.value })}
                className="form-input"
              >
                <option value="">-- Seleccionar --</option>
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Fecha de Inicio</label>
              <input
                type="date"
                value={asignarForm.fecha_inicio}
                onChange={(e) => setAsignarForm({ ...asignarForm, fecha_inicio: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Notas personalizadas (opcional)</label>
              <textarea
                value={asignarForm.notas}
                onChange={(e) => setAsignarForm({ ...asignarForm, notas: e.target.value })}
                placeholder="Ajustes específicos para este paciente..."
                className="form-input form-textarea"
                rows="3"
              />
            </div>

            <div className="asignar-warning">
              <p>⚠️ Si el paciente ya tiene un plan activo, será reemplazado por este nuevo plan.</p>
            </div>
          </div>
          <div className="modal-footer">
            <button
              className="btn-secondary"
              onClick={() => setShowAsignarModal(null)}
            >
              Cancelar
            </button>
            <button
              className="btn-primary"
              onClick={handleAsignar}
              disabled={!asignarForm.paciente_id}
            >
              Asignar Plan
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="planes-loading">
        <div className="loading-spinner"></div>
        <p>Cargando planes nutricionales...</p>
      </div>
    );
  }

  return (
    <div className="planes-nutricionales-container">
      <div className="planes-header">
        <button className="back-btn" onClick={onBack}>
          ← Volver
        </button>
        <h2>🍽️ Planes Nutricionales</h2>
        <button className="btn-nuevo-plan" onClick={() => setShowUploadModal(true)}>
          + Subir PDF
        </button>
      </div>

      {planes.length === 0 ? (
        <div className="empty-planes">
          <span className="empty-icon">📋</span>
          <h3>No tienes planes nutricionales</h3>
          <p>Sube un PDF con un plan nutricional para comenzar</p>
          <button className="btn-primary" onClick={() => setShowUploadModal(true)}>
            📤 Subir Primer Plan
          </button>
        </div>
      ) : (
        <div className="planes-grid">
          {planes.map((plan) => (
            <div key={plan.id} className={`plan-card ${plan.estado}`}>
              <div className="plan-card-header">
                <h3>{plan.nombre}</h3>
                <span className={`plan-estado ${plan.estado}`}>{plan.estado}</span>
              </div>

              {plan.descripcion && (
                <p className="plan-card-desc">{plan.descripcion}</p>
              )}

              <div className="plan-card-stats">
                {plan.calorias_diarias && (
                  <span className="stat">🔥 {plan.calorias_diarias} kcal</span>
                )}
                <span className="stat">👥 {plan.pacientes_asignados || 0} pacientes</span>
              </div>

              <div className="plan-card-date">
                Creado: {new Date(plan.created_at).toLocaleDateString()}
              </div>

              <div className="plan-card-actions">
                <button
                  className="btn-ver"
                  onClick={() => loadPlanDetail(plan.id)}
                >
                  Ver Detalle
                </button>
                <button
                  className="btn-asignar"
                  onClick={() => setShowAsignarModal(plan)}
                >
                  Asignar
                </button>
                <button
                  className="btn-eliminar"
                  onClick={() => handleDeletePlan(plan.id)}
                  title="Eliminar plan"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUploadModal && renderUploadModal()}
      {showPlanDetail && renderPlanDetailModal()}
      {showAsignarModal && renderAsignarModal()}
    </div>
  );
};

export default PlanesNutricionales;