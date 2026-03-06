import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import LucideIcon from '../LucideIcon';
import api from '../../services/api';
import './NeuropsicologiaEsp.css';

const FUNCIONES_COGNITIVAS = [
  { key: 'atencion_visual', label: 'Atención Visual', grupo: 'Atención' },
  { key: 'atencion_auditiva', label: 'Atención Auditiva', grupo: 'Atención' },
  { key: 'memoria_visual', label: 'Memoria Visual', grupo: 'Memoria' },
  { key: 'memoria_auditiva', label: 'Memoria Auditiva', grupo: 'Memoria' },
  { key: 'memoria_trabajo', label: 'Memoria de Trabajo', grupo: 'Memoria' },
  { key: 'funciones_ejecutivas', label: 'Funciones Ejecutivas', grupo: 'Ejecutivas' },
  { key: 'velocidad_procesamiento', label: 'Velocidad de Procesamiento', grupo: 'Ejecutivas' },
  { key: 'orientacion', label: 'Orientación', grupo: 'General' },
  { key: 'lenguaje', label: 'Lenguaje', grupo: 'Comunicación' },
  { key: 'razonamiento', label: 'Razonamiento', grupo: 'Ejecutivas' },
  { key: 'flexibilidad_cognitiva', label: 'Flexibilidad Cognitiva', grupo: 'Ejecutivas' },
  { key: 'planificacion', label: 'Planificación', grupo: 'Ejecutivas' },
  { key: 'control_inhibitorio', label: 'Control Inhibitorio', grupo: 'Ejecutivas' },
  { key: 'praxias', label: 'Praxias', grupo: 'Motor' },
  { key: 'gnosias', label: 'Gnosias', grupo: 'Percepción' },
  { key: 'calculo', label: 'Cálculo', grupo: 'Comunicación' },
  { key: 'comprension_verbal', label: 'Comprensión Verbal', grupo: 'Comunicación' },
  { key: 'habilidades_visuoespaciales', label: 'Habilidades Visuoespaciales', grupo: 'Percepción' },
];

const EMPTY_FORM = FUNCIONES_COGNITIVAS.reduce((acc, f) => {
  acc[f.key] = '';
  return acc;
}, { fecha: new Date().toISOString().split('T')[0], notas: '' });

const getNivel = (val) => {
  if (val === null || val === undefined || val === '') return { label: '-', color: '#6E7681', clase: '' };
  const n = parseFloat(val);
  if (n <= 3) return { label: 'Oportunidad', color: '#F44336', clase: 'nivel-bajo' };
  if (n <= 6) return { label: 'Promedio', color: '#FF9800', clase: 'nivel-medio' };
  return { label: 'Fortaleza', color: '#4CAF50', clase: 'nivel-alto' };
};

const EvaluacionesCognitivas = ({ pacienteId, onBack }) => {
  const { user } = useAuth();
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState('lista');
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [detalleEval, setDetalleEval] = useState(null);

  useEffect(() => { cargarEvaluaciones(); }, [pacienteId]);

  const cargarEvaluaciones = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/neuropsicologia/evaluacion/historial/${pacienteId}`);
      const raw = res?.data ?? res;
      setEvaluaciones(Array.isArray(raw) ? raw : []);
    } catch (error) {
      console.error('Error cargando evaluaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const nuevaEvaluacion = () => {
    setFormData({ ...EMPTY_FORM });
    setVista('form');
  };

  const verDetalle = (eval_) => {
    setDetalleEval(eval_);
    setVista('detalle');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        paciente_id: pacienteId,
        especialista_id: user?.especialista_id || user?.id,
        fecha: formData.fecha,
        notas: formData.notas || null,
      };
      FUNCIONES_COGNITIVAS.forEach(f => {
        if (formData[f.key] !== '' && formData[f.key] !== null) {
          payload[f.key] = parseFloat(formData[f.key]);
        }
      });
      await api.post('/neuropsicologia/evaluacion', payload);
      await cargarEvaluaciones();
      setVista('lista');
    } catch (error) {
      console.error('Error guardando evaluación:', error);
      alert('Error al guardar la evaluación');
    } finally {
      setSubmitting(false);
    }
  };

  const getResumen = (eval_) => {
    let fortalezas = 0, promedio = 0, oportunidades = 0;
    FUNCIONES_COGNITIVAS.forEach(f => {
      const val = parseFloat(eval_[f.key]);
      if (isNaN(val)) return;
      if (val <= 3) oportunidades++;
      else if (val <= 6) promedio++;
      else fortalezas++;
    });
    return { fortalezas, promedio, oportunidades };
  };

  // === VISTA LISTA ===
  if (vista === 'lista') {
    return (
      <div className="neuro-esp-module">
        <div className="neuro-esp-header">
          <button className="neuro-back-btn" onClick={onBack}>
            <LucideIcon name="arrow-left" size={18} /> Cambiar paciente
          </button>
          <h2><LucideIcon name="brain" size={22} /> Evaluaciones Cognitivas</h2>
        </div>

        <div className="neuro-esp-actions">
          <button className="neuro-btn-primary" onClick={nuevaEvaluacion}>
            <LucideIcon name="plus" size={18} /> Nueva Evaluación
          </button>
        </div>

        {loading ? (
          <div className="neuro-loading">
            <div className="loading-spinner"></div>
            <p>Cargando evaluaciones...</p>
          </div>
        ) : evaluaciones.length === 0 ? (
          <div className="neuro-empty">
            <LucideIcon name="clipboard" size={40} />
            <p>No hay evaluaciones registradas</p>
            <p className="neuro-empty-sub">Crea la primera evaluación cognitiva para este paciente.</p>
          </div>
        ) : (
          <div className="neuro-eval-list">
            {evaluaciones.map((eval_, idx) => {
              const resumen = getResumen(eval_);
              return (
                <button key={eval_.id || idx} className="neuro-eval-card" onClick={() => verDetalle(eval_)}>
                  <div className="neuro-eval-card-top">
                    <span className="neuro-eval-fecha">
                      <LucideIcon name="calendar" size={14} />
                      {new Date(eval_.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    {eval_.especialista_nombre && (
                      <span className="neuro-eval-evaluador">
                        <LucideIcon name="user" size={14} /> {eval_.especialista_nombre}
                      </span>
                    )}
                  </div>
                  <div className="neuro-eval-badges">
                    {resumen.fortalezas > 0 && <span className="neuro-badge verde">{resumen.fortalezas} Fortalezas</span>}
                    {resumen.promedio > 0 && <span className="neuro-badge naranja">{resumen.promedio} Promedio</span>}
                    {resumen.oportunidades > 0 && <span className="neuro-badge rojo">{resumen.oportunidades} Oportunidades</span>}
                  </div>
                  <span className="neuro-eval-arrow"><LucideIcon name="chevron-right" size={18} /></span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // === VISTA FORMULARIO ===
  if (vista === 'form') {
    const grupos = {};
    FUNCIONES_COGNITIVAS.forEach(f => {
      if (!grupos[f.grupo]) grupos[f.grupo] = [];
      grupos[f.grupo].push(f);
    });

    return (
      <div className="neuro-esp-module">
        <div className="neuro-esp-header">
          <button className="neuro-back-btn" onClick={() => setVista('lista')}>
            <LucideIcon name="arrow-left" size={18} /> Volver
          </button>
          <h2><LucideIcon name="plus-circle" size={22} /> Nueva Evaluación</h2>
        </div>

        <form onSubmit={handleSubmit} className="neuro-eval-form">
          <div className="neuro-form-field">
            <label>Fecha de evaluación</label>
            <input type="date" value={formData.fecha} onChange={e => handleChange('fecha', e.target.value)} required />
          </div>

          <div className="neuro-semaforo-legend">
            <span className="legend-item"><span className="dot rojo"></span> 0-3 Oportunidad</span>
            <span className="legend-item"><span className="dot naranja"></span> 4-6 Promedio</span>
            <span className="legend-item"><span className="dot verde"></span> 7-10 Fortaleza</span>
          </div>

          {Object.entries(grupos).map(([grupo, funciones]) => (
            <div key={grupo} className="neuro-form-grupo">
              <h3 className="neuro-grupo-titulo">{grupo}</h3>
              <div className="neuro-form-grid">
                {funciones.map(f => {
                  const nivel = getNivel(formData[f.key]);
                  return (
                    <div key={f.key} className={`neuro-form-campo ${nivel.clase}`}>
                      <label>{f.label}</label>
                      <div className="neuro-input-wrapper">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.5"
                          value={formData[f.key]}
                          onChange={e => handleChange(f.key, e.target.value)}
                          placeholder="0-10"
                        />
                        {formData[f.key] !== '' && (
                          <span className="neuro-nivel-dot" style={{ background: nivel.color }}></span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="neuro-form-field">
            <label>Notas / Observaciones</label>
            <textarea
              value={formData.notas}
              onChange={e => handleChange('notas', e.target.value)}
              placeholder="Observaciones de la evaluación..."
              rows={4}
            />
          </div>

          <div className="neuro-form-actions">
            <button type="button" className="neuro-btn-secondary" onClick={() => setVista('lista')}>Cancelar</button>
            <button type="submit" className="neuro-btn-primary" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Guardar Evaluación'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // === VISTA DETALLE ===
  if (vista === 'detalle' && detalleEval) {
    const resumen = getResumen(detalleEval);
    const funcionesEvaluadas = FUNCIONES_COGNITIVAS.filter(f =>
      detalleEval[f.key] !== null && detalleEval[f.key] !== undefined
    );

    return (
      <div className="neuro-esp-module">
        <div className="neuro-esp-header">
          <button className="neuro-back-btn" onClick={() => setVista('lista')}>
            <LucideIcon name="arrow-left" size={18} /> Volver
          </button>
          <h2><LucideIcon name="bar-chart" size={22} /> Detalle de Evaluación</h2>
        </div>

        <div className="neuro-detalle-info">
          <span><LucideIcon name="calendar" size={16} /> {new Date(detalleEval.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          {detalleEval.especialista_nombre && (
            <span><LucideIcon name="user" size={16} /> {detalleEval.especialista_nombre}</span>
          )}
        </div>

        {detalleEval.notas && (
          <div className="neuro-detalle-notas">
            <LucideIcon name="file-text" size={16} /> {detalleEval.notas}
          </div>
        )}

        <div className="neuro-resumen-cards">
          <div className="neuro-resumen-card verde">
            <span className="resumen-num">{resumen.fortalezas}</span>
            <span className="resumen-label">Fortalezas</span>
          </div>
          <div className="neuro-resumen-card naranja">
            <span className="resumen-num">{resumen.promedio}</span>
            <span className="resumen-label">Promedio</span>
          </div>
          <div className="neuro-resumen-card rojo">
            <span className="resumen-num">{resumen.oportunidades}</span>
            <span className="resumen-label">Oportunidades</span>
          </div>
        </div>

        <div className="neuro-barras-container">
          {funcionesEvaluadas.map(f => {
            const val = parseFloat(detalleEval[f.key]);
            const nivel = getNivel(val);
            return (
              <div key={f.key} className="neuro-barra-item">
                <span className="neuro-barra-label">{f.label}</span>
                <div className="neuro-barra-track">
                  <div
                    className="neuro-barra-fill"
                    style={{ width: `${(val / 10) * 100}%`, background: nivel.color }}
                  ></div>
                </div>
                <span className="neuro-barra-valor" style={{ color: nivel.color }}>{val}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
};

export default EvaluacionesCognitivas;
