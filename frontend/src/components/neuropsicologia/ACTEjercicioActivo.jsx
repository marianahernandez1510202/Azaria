import React, { useState } from 'react';
import LucideIcon from '../LucideIcon';

const ACTEjercicioActivo = ({ herramienta, categoria, onComplete, onCancel }) => {
  const [pasoActual, setPasoActual] = useState(0);
  const [notas, setNotas] = useState({});

  const paso = herramienta.pasos[pasoActual];
  const totalPasos = herramienta.pasos.length;
  const progreso = ((pasoActual + 1) / totalPasos) * 100;

  const handleNotaChange = (key, value) => {
    setNotas(prev => ({ ...prev, [key]: value }));
  };

  const handleSiguiente = () => {
    if (pasoActual < totalPasos - 1) {
      setPasoActual(prev => prev + 1);
    } else {
      // Consolidar notas de escritura
      const notasTexto = Object.values(notas).filter(n => n.trim()).join('\n---\n');
      onComplete(notasTexto);
    }
  };

  const handleAnterior = () => {
    if (pasoActual > 0) {
      setPasoActual(prev => prev - 1);
    }
  };

  const renderInput = () => {
    if (!paso.tipoInput) return null;

    const key = `paso_${pasoActual}`;

    if (paso.tipoInput === 'textarea') {
      return (
        <textarea
          className="act-textarea"
          value={notas[key] || ''}
          onChange={e => handleNotaChange(key, e.target.value)}
          placeholder={paso.placeholder || 'Escribe aquí...'}
          rows={5}
        />
      );
    }

    if (paso.tipoInput === 'texto') {
      return (
        <input
          type="text"
          className="act-input"
          value={notas[key] || ''}
          onChange={e => handleNotaChange(key, e.target.value)}
          placeholder={paso.placeholder || 'Escribe aquí...'}
        />
      );
    }

    if (paso.tipoInput === 'tres_campos') {
      return (
        <div className="act-tres-campos">
          {(paso.placeholders || ['Campo 1', 'Campo 2', 'Campo 3']).map((ph, i) => (
            <input
              key={i}
              type="text"
              className="act-input"
              value={notas[`${key}_${i}`] || ''}
              onChange={e => handleNotaChange(`${key}_${i}`, e.target.value)}
              placeholder={ph}
            />
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="act-ejercicio-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="act-header" style={{ '--cat-color': categoria.color }}>
          <button className="ca-close" onClick={onCancel}>✕</button>
          <span className="act-cat-emoji"><LucideIcon name={categoria.icon} size={20} /></span>
          <h2>{herramienta.nombre}</h2>
          <span className="act-cat-nombre">{categoria.nombre}</span>
        </div>

        {/* Progreso */}
        <div className="ca-progreso">
          <div className="ca-progreso-bar" style={{ width: `${progreso}%`, background: categoria.color }} />
          <span className="ca-progreso-text">Paso {pasoActual + 1} de {totalPasos}</span>
        </div>

        {/* Contenido del paso */}
        <div className="act-paso-contenido">
          <p className="act-paso-texto">{paso.texto}</p>
          {renderInput()}
        </div>

        {/* Navegación */}
        <div className="ca-nav">
          <button
            className="btn btn-secondary"
            onClick={handleAnterior}
            disabled={pasoActual === 0}
          >
            Anterior
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSiguiente}
            style={{ background: categoria.color }}
          >
            {pasoActual === totalPasos - 1 ? 'Finalizar' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ACTEjercicioActivo;
