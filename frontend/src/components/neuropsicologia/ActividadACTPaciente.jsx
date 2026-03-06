import React, { useState, useEffect } from 'react';
import LucideIcon from '../LucideIcon';
import api from '../../services/api';
import './NeuropsicologiaEsp.css';

const ACT_CATEGORIAS = {
  yo: { label: 'Yo (Self)', color: '#6A1B9A', icon: 'user' },
  valores: { label: 'Valores', color: '#AD1457', icon: 'heart' },
  defusion: { label: 'Defusión', color: '#F57F17', icon: 'cloud' },
  presencia: { label: 'Presencia', color: '#2E7D32', icon: 'eye' },
  compromiso: { label: 'Compromiso', color: '#1976D2', icon: 'check-circle' },
  aceptacion: { label: 'Aceptación', color: '#00838F', icon: 'shield' },
};

const ActividadACTPaciente = ({ pacienteId, onBack }) => {
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { cargarSesiones(); }, [pacienteId]);

  const cargarSesiones = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/neuropsicologia/act/historial/${pacienteId}`);
      const raw = res?.data ?? res;
      setSesiones(Array.isArray(raw) ? raw : []);
    } catch (error) {
      console.error('Error cargando sesiones ACT:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary
  const totalSesiones = sesiones.length;
  const categoriasCount = {};
  sesiones.forEach(s => {
    const cat = s.categoria?.toLowerCase() || 'otro';
    categoriasCount[cat] = (categoriasCount[cat] || 0) + 1;
  });

  const categoriasOrdenadas = Object.entries(categoriasCount)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="neuro-esp-module">
      <div className="neuro-esp-header">
        <button className="neuro-back-btn" onClick={onBack}>
          <LucideIcon name="arrow-left" size={18} /> Cambiar paciente
        </button>
        <h2><LucideIcon name="sparkles" size={22} /> Herramientas ACT</h2>
      </div>

      {loading ? (
        <div className="neuro-loading">
          <div className="loading-spinner"></div>
          <p>Cargando sesiones...</p>
        </div>
      ) : sesiones.length === 0 ? (
        <div className="neuro-empty">
          <LucideIcon name="sparkles" size={40} />
          <p>No hay sesiones ACT registradas</p>
          <p className="neuro-empty-sub">El paciente aún no ha completado herramientas ACT.</p>
        </div>
      ) : (
        <>
          {/* Resumen */}
          <div className="neuro-resumen-cards">
            <div className="neuro-resumen-card morado">
              <span className="resumen-num">{totalSesiones}</span>
              <span className="resumen-label">Sesiones</span>
            </div>
            <div className="neuro-resumen-card azul">
              <span className="resumen-num">{Object.keys(categoriasCount).length}</span>
              <span className="resumen-label">Categorías</span>
            </div>
          </div>

          {/* Categorías más practicadas */}
          {categoriasOrdenadas.length > 0 && (
            <div className="neuro-act-categorias">
              <h3>Categorías más practicadas</h3>
              <div className="neuro-act-barras">
                {categoriasOrdenadas.map(([cat, count]) => {
                  const config = ACT_CATEGORIAS[cat] || { label: cat, color: '#9C27B0', icon: 'circle' };
                  const pct = (count / totalSesiones) * 100;
                  return (
                    <div key={cat} className="neuro-act-barra-item">
                      <div className="neuro-act-barra-label">
                        <LucideIcon name={config.icon} size={16} />
                        <span>{config.label}</span>
                        <span className="neuro-act-count">{count}</span>
                      </div>
                      <div className="neuro-barra-track">
                        <div className="neuro-barra-fill" style={{ width: `${pct}%`, background: config.color }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Lista de sesiones */}
          <div className="neuro-sesiones-lista">
            <h3>Historial de sesiones</h3>
            {sesiones.map((sesion, idx) => {
              const cat = sesion.categoria?.toLowerCase() || 'otro';
              const config = ACT_CATEGORIAS[cat] || { label: cat, color: '#9C27B0', icon: 'circle' };
              return (
                <div key={sesion.id || idx} className="neuro-sesion-item">
                  <div className="neuro-sesion-icon" style={{ background: config.color + '22', color: config.color }}>
                    <LucideIcon name={config.icon} size={20} />
                  </div>
                  <div className="neuro-sesion-info">
                    <span className="neuro-sesion-herramienta">{sesion.herramienta || 'Herramienta ACT'}</span>
                    <span className="neuro-sesion-categoria" style={{ color: config.color }}>{config.label}</span>
                    {sesion.notas_usuario && <p className="neuro-sesion-notas">{sesion.notas_usuario}</p>}
                  </div>
                  <span className="neuro-sesion-fecha">
                    {sesion.fecha ? new Date(sesion.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default ActividadACTPaciente;
