import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './MiPlanNutricional.css';

const MiPlanNutricional = ({ pacienteId }) => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [diaActual, setDiaActual] = useState('');
  const [seguimientoHoy, setSeguimientoHoy] = useState({});

  useEffect(() => {
    // Obtener día actual en español
    const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    setDiaActual(dias[new Date().getDay()]);

    loadPlan();
  }, [pacienteId]);

  const loadPlan = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/nutricion/plan-paciente/${pacienteId}`);
      setPlan(response.data);

      // Cargar seguimiento de hoy
      if (response.data?.seguimiento_hoy) {
        const seguimiento = {};
        response.data.seguimiento_hoy.forEach(s => {
          seguimiento[s.tipo_comida] = s.cumplido;
        });
        setSeguimientoHoy(seguimiento);
      }
    } catch (error) {
      console.error('Error cargando plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarComida = async (tipoComida, cumplido) => {
    try {
      await api.post(`/nutricion/plan-paciente/${pacienteId}/seguimiento`, {
        asignacion_id: plan.id,
        tipo_comida: tipoComida,
        cumplido: cumplido,
        fecha: new Date().toISOString().split('T')[0]
      });

      setSeguimientoHoy(prev => ({
        ...prev,
        [tipoComida]: cumplido
      }));
    } catch (error) {
      console.error('Error registrando seguimiento:', error);
    }
  };

  const tiposComidaConfig = {
    desayuno: { label: 'Desayuno', icon: '🌅', hora: '7:00 - 9:00' },
    media_manana: { label: 'Media Mañana', icon: '🍎', hora: '10:00 - 11:00' },
    almuerzo: { label: 'Almuerzo', icon: '🍽️', hora: '13:00 - 14:00' },
    merienda: { label: 'Merienda', icon: '🍪', hora: '16:00 - 17:00' },
    cena: { label: 'Cena', icon: '🌙', hora: '19:00 - 21:00' },
    snack: { label: 'Snack', icon: '🥜', hora: 'Cualquier hora' }
  };

  const tiposOrden = ['desayuno', 'media_manana', 'almuerzo', 'merienda', 'cena', 'snack'];

  if (loading) {
    return (
      <div className="mi-plan-loading">
        <div className="loading-spinner"></div>
        <p>Cargando tu plan nutricional...</p>
      </div>
    );
  }

  if (!plan || !plan.tiene_plan) {
    return (
      <div className="mi-plan-empty">
        <span className="empty-icon">🥗</span>
        <h3>Sin Plan Asignado</h3>
        <p>Aún no tienes un plan nutricional asignado.</p>
        <p>Tu especialista en nutrición te asignará uno pronto.</p>
      </div>
    );
  }

  // Obtener comidas del día actual
  const comidasHoy = (plan.comidas || []).filter(c => c.dia_semana === diaActual);

  // Calcular progreso del día
  const comidasCompletadas = Object.values(seguimientoHoy).filter(v => v).length;
  const totalComidas = comidasHoy.length || 1;
  const progresoPorcentaje = Math.round((comidasCompletadas / totalComidas) * 100);

  return (
    <div className="mi-plan-nutricional">
      {/* Header del plan */}
      <div className="plan-header-card">
        <div className="plan-info">
          <h2>{plan.nombre}</h2>
          {plan.descripcion && <p className="plan-desc">{plan.descripcion}</p>}
          <p className="plan-especialista">
            Asignado por: <strong>{plan.especialista_nombre}</strong>
          </p>
        </div>

        <div className="plan-macros">
          <div className="macro-item">
            <span className="macro-icon">🔥</span>
            <span className="macro-value">{plan.calorias_diarias || 0}</span>
            <span className="macro-label">kcal/día</span>
          </div>
          <div className="macro-item">
            <span className="macro-icon">🥩</span>
            <span className="macro-value">{plan.proteinas_g || 0}g</span>
            <span className="macro-label">Proteínas</span>
          </div>
          <div className="macro-item">
            <span className="macro-icon">🍞</span>
            <span className="macro-value">{plan.carbohidratos_g || 0}g</span>
            <span className="macro-label">Carbos</span>
          </div>
          <div className="macro-item">
            <span className="macro-icon">🥑</span>
            <span className="macro-value">{plan.grasas_g || 0}g</span>
            <span className="macro-label">Grasas</span>
          </div>
        </div>
      </div>

      {/* Progreso del día */}
      <div className="progreso-dia">
        <div className="progreso-header">
          <h3>📅 Progreso de Hoy - {diaActual.charAt(0).toUpperCase() + diaActual.slice(1)}</h3>
          <span className="progreso-porcentaje">{progresoPorcentaje}%</span>
        </div>
        <div className="progreso-bar">
          <div
            className="progreso-fill"
            style={{ width: `${progresoPorcentaje}%` }}
          ></div>
        </div>
        <p className="progreso-texto">
          {comidasCompletadas} de {totalComidas} comidas completadas
        </p>
      </div>

      {/* Comidas del día */}
      <div className="comidas-hoy">
        <h3>🍽️ Tu Menú de Hoy</h3>

        {comidasHoy.length === 0 ? (
          <div className="no-comidas-hoy">
            <p>No hay comidas específicas para hoy en tu plan.</p>
            <p>Consulta con tu nutricionista.</p>
          </div>
        ) : (
          <div className="comidas-lista">
            {tiposOrden.map(tipo => {
              const comida = comidasHoy.find(c => c.tipo_comida === tipo);
              if (!comida) return null;

              const config = tiposComidaConfig[tipo];
              const completada = seguimientoHoy[tipo];

              return (
                <div
                  key={tipo}
                  className={`comida-card ${completada ? 'completada' : ''}`}
                >
                  <div className="comida-check">
                    <button
                      className={`check-btn ${completada ? 'checked' : ''}`}
                      onClick={() => handleMarcarComida(tipo, !completada)}
                      aria-label={completada ? 'Marcar como no completada' : 'Marcar como completada'}
                    >
                      {completada ? '✓' : ''}
                    </button>
                  </div>

                  <div className="comida-main">
                    <div className="comida-tipo-header">
                      <span className="comida-icon">{config.icon}</span>
                      <span className="comida-tipo-label">{config.label}</span>
                      <span className="comida-hora">{config.hora}</span>
                    </div>

                    <h4 className="comida-nombre">{comida.nombre_plato}</h4>

                    {comida.descripcion && (
                      <p className="comida-descripcion">{comida.descripcion}</p>
                    )}

                    {comida.calorias > 0 && (
                      <div className="comida-macros-mini">
                        <span>🔥 {comida.calorias} kcal</span>
                        {comida.proteinas_g > 0 && <span>🥩 {comida.proteinas_g}g</span>}
                        {comida.carbohidratos_g > 0 && <span>🍞 {comida.carbohidratos_g}g</span>}
                        {comida.grasas_g > 0 && <span>🥑 {comida.grasas_g}g</span>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Contenido adicional del plan */}
      {plan.contenido?.recomendaciones?.length > 0 && (
        <div className="plan-section recomendaciones">
          <h3>💡 Recomendaciones</h3>
          <ul>
            {plan.contenido.recomendaciones.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {plan.contenido?.restricciones?.length > 0 && (
        <div className="plan-section restricciones">
          <h3>⚠️ Alimentos a Evitar</h3>
          <ul>
            {plan.contenido.restricciones.map((res, idx) => (
              <li key={idx}>{res}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Notas personalizadas del especialista */}
      {plan.notas_personalizadas && (
        <div className="plan-section notas">
          <h3>📝 Notas de tu Nutricionista</h3>
          <p>{plan.notas_personalizadas}</p>
        </div>
      )}

      {/* Ver plan completo de la semana */}
      <details className="plan-semana-completo">
        <summary>📅 Ver plan completo de la semana</summary>
        <div className="semana-content">
          {['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'].map(dia => {
            const comidasDia = (plan.comidas || []).filter(c => c.dia_semana === dia);
            if (comidasDia.length === 0) return null;

            return (
              <div key={dia} className={`dia-resumen ${dia === diaActual ? 'dia-actual' : ''}`}>
                <h4>
                  {dia.charAt(0).toUpperCase() + dia.slice(1)}
                  {dia === diaActual && <span className="badge-hoy">Hoy</span>}
                </h4>
                <div className="dia-comidas">
                  {comidasDia.map((comida, idx) => (
                    <div key={idx} className="comida-mini">
                      <span className="comida-mini-tipo">
                        {tiposComidaConfig[comida.tipo_comida]?.icon} {tiposComidaConfig[comida.tipo_comida]?.label}
                      </span>
                      <span className="comida-mini-nombre">{comida.nombre_plato}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </details>
    </div>
  );
};

export default MiPlanNutricional;