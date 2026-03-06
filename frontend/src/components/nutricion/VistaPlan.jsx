import React from 'react';
import LucideIcon from '../LucideIcon';
import './VistaPlan.css';

const COMIDA_CONFIG = {
  desayuno: { label: 'Desayuno', icon: 'sunrise', color: '#E91E63' },
  media_manana: { label: 'Colación 1', icon: 'apple', color: '#9C27B0' },
  almuerzo: { label: 'Comida', icon: 'utensils', color: '#5C6BC0' },
  merienda: { label: 'Colación 2', icon: 'cookie', color: '#FF7043' },
  cena: { label: 'Cena', icon: 'moon', color: '#FF9800' },
};

const COMIDA_ORDER = ['desayuno', 'media_manana', 'almuerzo', 'merienda', 'cena'];

const VistaPlan = ({ plan, contenido, compact = false }) => {
  if (!plan && !contenido) return null;

  const planData = plan || {};
  const content = contenido || planData.contenido || {};
  const comidas = content.comidas || [];
  const indicaciones = content.indicaciones_generales || [];
  const totales = content.totales || {};

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // Sort comidas by COMIDA_ORDER
  const comidasOrdenadas = [...comidas].sort((a, b) => {
    const idxA = COMIDA_ORDER.indexOf(a.tipo_comida);
    const idxB = COMIDA_ORDER.indexOf(b.tipo_comida);
    return idxA - idxB;
  });

  return (
    <div className={`vista-plan ${compact ? 'vista-plan--compact' : ''}`}>
      {/* Header del plan */}
      <div className="vp-header">
        <div className="vp-header-info">
          <h2 className="vp-titulo">{planData.nombre || 'Plan Nutricional'}</h2>
          {planData.descripcion && <p className="vp-descripcion">{planData.descripcion}</p>}
          {planData.especialista_nombre && (
            <p className="vp-especialista">
              <LucideIcon name="user" size={14} /> {planData.especialista_nombre}
            </p>
          )}
          {planData.created_at && (
            <p className="vp-fecha">
              <LucideIcon name="calendar" size={14} /> {new Date(planData.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>

        {/* Macros totales */}
        <div className="vp-macros-totales">
          <div className="vp-macro cal">
            <LucideIcon name="flame" size={18} />
            <span className="vp-macro-value">{Math.round(planData.calorias_diarias || totales.calorias || 0)}</span>
            <span className="vp-macro-label">kcal/día</span>
          </div>
          <div className="vp-macro prot">
            <LucideIcon name="beef" size={18} />
            <span className="vp-macro-value">{Number(planData.proteinas_g || totales.proteinas || 0).toFixed(0)}g</span>
            <span className="vp-macro-label">Proteínas</span>
          </div>
          <div className="vp-macro carb">
            <LucideIcon name="wheat" size={18} />
            <span className="vp-macro-value">{Number(planData.carbohidratos_g || totales.carbohidratos || 0).toFixed(0)}g</span>
            <span className="vp-macro-label">Carbos</span>
          </div>
          <div className="vp-macro fat">
            <LucideIcon name="droplet" size={18} />
            <span className="vp-macro-value">{Number(planData.grasas_g || totales.grasas || 0).toFixed(0)}g</span>
            <span className="vp-macro-label">Grasas</span>
          </div>
        </div>
      </div>

      {/* Indicaciones Generales */}
      {indicaciones.length > 0 && (
        <div className="vp-indicaciones">
          <div className="vp-indicaciones-header">
            <LucideIcon name="info" size={18} />
            <h3>Indicaciones Generales</h3>
          </div>
          <ul className="vp-indicaciones-list">
            {indicaciones.map((ind, idx) => (
              <li key={idx}>
                <span className="vp-bullet">•</span>
                {ind}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Secciones de comidas */}
      <div className="vp-comidas">
        {comidasOrdenadas.map((comida, idx) => {
          const config = COMIDA_CONFIG[comida.tipo_comida] || { label: comida.tipo_comida, icon: 'utensils', color: '#78909C' };
          const opciones = comida.opciones || [];

          return (
            <div key={idx} className="vp-comida-section">
              {/* Header de tipo de comida con color */}
              <div className="vp-comida-header" style={{ background: config.color }}>
                <LucideIcon name={config.icon} size={20} />
                <h3>{config.label}</h3>
                {opciones.length > 1 && (
                  <span className="vp-opciones-count">{opciones.length} opciones</span>
                )}
              </div>

              {/* Tarjetas de receta (opciones) */}
              <div className="vp-opciones">
                {opciones.map((opcion, opIdx) => (
                  <div key={opIdx} className="vp-receta-card">
                    {opciones.length > 1 && (
                      <div className="vp-opcion-badge" style={{ background: config.color }}>
                        Opción {opcion.numero || opIdx + 1}
                      </div>
                    )}

                    <div className="vp-receta-content">
                      {/* Imagen a la izquierda */}
                      {opcion.imagen_url && (
                        <div className="vp-receta-img">
                          <img src={`${apiUrl}${opcion.imagen_url}`} alt={opcion.nombre} />
                        </div>
                      )}

                      {/* Info a la derecha */}
                      <div className="vp-receta-info">
                        <h4 className="vp-receta-nombre">{opcion.nombre}</h4>

                        {opcion.descripcion && (
                          <p className="vp-receta-desc">{opcion.descripcion}</p>
                        )}

                        {/* Macros de la receta */}
                        {(opcion.calorias > 0 || opcion.proteinas > 0) && (
                          <div className="vp-receta-macros">
                            {opcion.calorias > 0 && (
                              <span className="vp-macro-badge cal">
                                <LucideIcon name="flame" size={12} /> {Math.round(opcion.calorias)} kcal
                              </span>
                            )}
                            {opcion.proteinas > 0 && (
                              <span className="vp-macro-badge prot">
                                <LucideIcon name="beef" size={12} /> {opcion.proteinas}g
                              </span>
                            )}
                            {opcion.carbohidratos > 0 && (
                              <span className="vp-macro-badge carb">
                                <LucideIcon name="wheat" size={12} /> {opcion.carbohidratos}g
                              </span>
                            )}
                            {opcion.grasas > 0 && (
                              <span className="vp-macro-badge fat">
                                <LucideIcon name="droplet" size={12} /> {opcion.grasas}g
                              </span>
                            )}
                          </div>
                        )}

                        {/* Ingredientes */}
                        {opcion.ingredientes?.length > 0 && (
                          <details className="vp-ingredientes-toggle">
                            <summary>
                              <LucideIcon name="list" size={14} /> Ingredientes ({opcion.ingredientes.length})
                            </summary>
                            <ul className="vp-ingredientes-list">
                              {opcion.ingredientes.map((ing, i) => (
                                <li key={i}>
                                  {typeof ing === 'string' ? ing : (
                                    <><strong>{ing.cantidad} {ing.unidad}</strong> {ing.nombre}</>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </details>
                        )}

                        {/* Instrucciones */}
                        {opcion.instrucciones?.length > 0 && (
                          <details className="vp-instrucciones-toggle">
                            <summary>
                              <LucideIcon name="chef-hat" size={14} /> Preparación ({opcion.instrucciones.length} pasos)
                            </summary>
                            <ol className="vp-instrucciones-list">
                              {opcion.instrucciones.map((paso, i) => (
                                <li key={i}>{typeof paso === 'string' ? paso : (paso.paso || paso.descripcion || '')}</li>
                              ))}
                            </ol>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Si no hay comidas */}
      {comidasOrdenadas.length === 0 && (
        <div className="vp-empty">
          <LucideIcon name="utensils" size={40} />
          <p>No hay comidas configuradas en este plan.</p>
        </div>
      )}
    </div>
  );
};

export default VistaPlan;
