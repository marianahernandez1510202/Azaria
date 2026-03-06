import React, { useState, useEffect } from 'react';
import LucideIcon from '../LucideIcon';
import api from '../../services/api';
import './NeuropsicologiaEsp.css';

const EMOCIONES_CONFIG = {
  feliz: { icon: 'smile', color: '#4CAF50', label: 'Feliz' },
  tranquilo: { icon: 'cloud', color: '#2196F3', label: 'Tranquilo' },
  neutral: { icon: 'minus-circle', color: '#9E9E9E', label: 'Neutral' },
  ansioso: { icon: 'alert-triangle', color: '#FF9800', label: 'Ansioso' },
  triste: { icon: 'frown', color: '#5C6BC0', label: 'Triste' },
  enojado: { icon: 'flame', color: '#F44336', label: 'Enojado' },
  frustrado: { icon: 'x-circle', color: '#E91E63', label: 'Frustrado' },
  agradecido: { icon: 'heart', color: '#2E7D32', label: 'Agradecido' },
  // Backend emotion names
  alegria: { icon: 'smile', color: '#4CAF50', label: 'Alegría' },
  calma: { icon: 'cloud', color: '#2196F3', label: 'Calma' },
  ansiedad: { icon: 'alert-triangle', color: '#FF9800', label: 'Ansiedad' },
  tristeza: { icon: 'frown', color: '#5C6BC0', label: 'Tristeza' },
  frustracion: { icon: 'x-circle', color: '#E91E63', label: 'Frustración' },
  esperanza: { icon: 'sun', color: '#FFC107', label: 'Esperanza' },
  miedo: { icon: 'shield-alert', color: '#795548', label: 'Miedo' },
  enojo: { icon: 'flame', color: '#F44336', label: 'Enojo' },
  gratitud: { icon: 'heart', color: '#2E7D32', label: 'Gratitud' },
  confusion: { icon: 'help-circle', color: '#607D8B', label: 'Confusión' },
  motivacion: { icon: 'zap', color: '#FF5722', label: 'Motivación' },
  soledad: { icon: 'user-minus', color: '#9C27B0', label: 'Soledad' },
};

const NIVEL_LABELS = {
  1: 'Muy mal',
  2: 'Mal',
  3: 'Regular',
  4: 'Bien',
  5: 'Muy bien',
};

const EstadoEmocionalPaciente = ({ pacienteId, onBack }) => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { cargarEstados(); }, [pacienteId]);

  const cargarEstados = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/neuropsicologia/estados-animo/${pacienteId}`);
      const raw = res?.data ?? res;
      setRegistros(Array.isArray(raw) ? raw : []);
    } catch (error) {
      console.error('Error cargando estados de ánimo:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary
  const totalRegistros = registros.length;
  const promedioNivel = totalRegistros > 0
    ? (registros.reduce((sum, r) => sum + (r.nivel_animo || 3), 0) / totalRegistros).toFixed(1)
    : 0;

  // Parse emociones from backend (emociones_nombres is comma-separated string)
  const parseEmociones = (reg) => {
    if (reg.emociones_nombres) {
      return reg.emociones_nombres.split(',').map(e => e.trim()).filter(Boolean);
    }
    if (Array.isArray(reg.emociones)) return reg.emociones;
    return [];
  };

  // Find most frequent emotion
  const emocionesFrecuencia = {};
  registros.forEach(r => {
    const emociones = parseEmociones(r);
    emociones.forEach(nombre => {
      if (nombre) {
        emocionesFrecuencia[nombre] = (emocionesFrecuencia[nombre] || 0) + 1;
      }
    });
  });

  const emocionMasFrecuente = Object.entries(emocionesFrecuencia)
    .sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="neuro-esp-module">
      <div className="neuro-esp-header">
        <button className="neuro-back-btn" onClick={onBack}>
          <LucideIcon name="arrow-left" size={18} /> Cambiar paciente
        </button>
        <h2><LucideIcon name="heart" size={22} /> Estado Emocional</h2>
      </div>

      {loading ? (
        <div className="neuro-loading">
          <div className="loading-spinner"></div>
          <p>Cargando registros...</p>
        </div>
      ) : registros.length === 0 ? (
        <div className="neuro-empty">
          <LucideIcon name="heart" size={40} />
          <p>No hay registros de estado emocional</p>
          <p className="neuro-empty-sub">El paciente aún no ha registrado su estado de ánimo.</p>
        </div>
      ) : (
        <>
          {/* Resumen */}
          <div className="neuro-resumen-cards">
            <div className="neuro-resumen-card morado">
              <span className="resumen-num">{totalRegistros}</span>
              <span className="resumen-label">Registros</span>
            </div>
            <div className="neuro-resumen-card azul">
              <span className="resumen-num">{promedioNivel}</span>
              <span className="resumen-label">Nivel Promedio</span>
            </div>
            {emocionMasFrecuente && (
              <div className="neuro-resumen-card" style={{ borderColor: EMOCIONES_CONFIG[emocionMasFrecuente[0]]?.color || '#9C27B0' }}>
                <span className="resumen-num">
                  <LucideIcon name={EMOCIONES_CONFIG[emocionMasFrecuente[0]]?.icon || 'heart'} size={22} />
                </span>
                <span className="resumen-label">{EMOCIONES_CONFIG[emocionMasFrecuente[0]]?.label || emocionMasFrecuente[0]}</span>
              </div>
            )}
          </div>

          {/* Lista de registros */}
          <div className="neuro-animo-lista">
            {registros.map((reg, idx) => {
              const emociones = parseEmociones(reg);
              const emocionPrincipal = emociones[0] || null;
              const config = EMOCIONES_CONFIG[emocionPrincipal] || { icon: 'circle', color: '#9E9E9E', label: emocionPrincipal || 'Sin emoción' };

              return (
                <div key={reg.id || idx} className="neuro-animo-item">
                  <div className="neuro-animo-icon" style={{ background: config.color + '22', color: config.color }}>
                    <LucideIcon name={config.icon} size={22} />
                  </div>
                  <div className="neuro-animo-info">
                    <span className="neuro-animo-emocion">{config.label}</span>
                    <span className="neuro-animo-nivel">
                      Nivel: {NIVEL_LABELS[reg.nivel_animo] || reg.nivel_animo || '-'}
                    </span>
                    {reg.notas && <p className="neuro-animo-notas">{reg.notas}</p>}
                    <div className="neuro-animo-emociones-extra">
                      {emociones.slice(0, 4).map((nombre, i) => {
                        const eConfig = EMOCIONES_CONFIG[nombre] || {};
                        return (
                          <span key={i} className="neuro-emocion-chip" style={{ borderColor: eConfig.color || '#666' }}>
                            {eConfig.label || nombre}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <span className="neuro-animo-fecha">
                    {reg.fecha ? new Date(reg.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : ''}
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

export default EstadoEmocionalPaciente;
