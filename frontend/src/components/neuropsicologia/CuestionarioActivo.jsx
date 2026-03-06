import React, { useState } from 'react';

const CuestionarioActivo = ({ cuestionario, onComplete, onCancel }) => {
  const esVLQ = cuestionario.tipo === 'vlq';

  // Para VLQ: fase 0 = importancia, fase 1 = consistencia
  const [faseVLQ, setFaseVLQ] = useState(0);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState({});

  const totalPreguntas = esVLQ ? cuestionario.areas.length : cuestionario.preguntas.length;

  // Texto de la pregunta actual
  const getPreguntaTexto = () => {
    if (esVLQ) {
      const area = cuestionario.areas[preguntaActual];
      if (faseVLQ === 0) {
        return `¿Qué tan importante es para ti el área de "${area.nombre}"?\n${area.descripcion}`;
      }
      return `¿Qué tan consistentes han sido tus acciones con tus valores en "${area.nombre}"?\n${area.descripcion}`;
    }
    return cuestionario.preguntas[preguntaActual];
  };

  // Key para guardar respuesta
  const getRespuestaKey = () => {
    if (esVLQ) {
      const area = cuestionario.areas[preguntaActual];
      return faseVLQ === 0 ? `importancia_${area.id}` : `consistencia_${area.id}`;
    }
    return `p${preguntaActual}`;
  };

  const respuestaActual = respuestas[getRespuestaKey()] || null;

  const handleSeleccion = (valor) => {
    setRespuestas(prev => ({ ...prev, [getRespuestaKey()]: valor }));
  };

  const handleSiguiente = () => {
    if (preguntaActual < totalPreguntas - 1) {
      setPreguntaActual(prev => prev + 1);
    } else if (esVLQ && faseVLQ === 0) {
      // Pasar a fase de consistencia
      setFaseVLQ(1);
      setPreguntaActual(0);
    } else {
      // Finalizar
      onComplete(respuestas);
    }
  };

  const handleAnterior = () => {
    if (preguntaActual > 0) {
      setPreguntaActual(prev => prev - 1);
    } else if (esVLQ && faseVLQ === 1) {
      setFaseVLQ(0);
      setPreguntaActual(totalPreguntas - 1);
    }
  };

  // Calcular progreso
  const totalSteps = esVLQ ? totalPreguntas * 2 : totalPreguntas;
  const currentStep = esVLQ ? (faseVLQ * totalPreguntas + preguntaActual + 1) : (preguntaActual + 1);
  const progreso = (currentStep / totalSteps) * 100;

  // Escala
  const escalaMin = esVLQ ? 1 : cuestionario.escalaMin;
  const escalaMax = esVLQ ? 10 : cuestionario.escalaMax;
  const etiquetas = esVLQ ? null : cuestionario.etiquetas;

  const esUltimaFase = esVLQ ? faseVLQ === 1 : true;
  const esUltimaPregunta = preguntaActual === totalPreguntas - 1 && esUltimaFase;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="cuestionario-activo-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="ca-header">
          <button className="ca-close" onClick={onCancel}>✕</button>
          <h2>{cuestionario.nombre}</h2>
          {esVLQ && (
            <span className="ca-fase-label">
              {faseVLQ === 0 ? 'Parte 1: Importancia' : 'Parte 2: Consistencia'}
            </span>
          )}
        </div>

        {/* Barra de progreso */}
        <div className="ca-progreso">
          <div className="ca-progreso-bar" style={{ width: `${progreso}%` }} />
          <span className="ca-progreso-text">Pregunta {currentStep} de {totalSteps}</span>
        </div>

        {/* Pregunta */}
        <div className="ca-pregunta">
          <p className="ca-pregunta-texto">{getPreguntaTexto()}</p>
          {!esVLQ && cuestionario.instrucciones && preguntaActual === 0 && (
            <p className="ca-instrucciones">{cuestionario.instrucciones}</p>
          )}
        </div>

        {/* Escala Likert */}
        <div className="ca-escala">
          <div className="ca-escala-labels">
            <span>{esVLQ ? 'Nada' : cuestionario.etiquetaMin}</span>
            <span>{esVLQ ? 'Extremadamente' : cuestionario.etiquetaMax}</span>
          </div>
          <div className="ca-escala-botones">
            {Array.from({ length: escalaMax - escalaMin + 1 }, (_, i) => {
              const valor = escalaMin + i;
              return (
                <button
                  key={valor}
                  className={`ca-escala-btn ${respuestaActual === valor ? 'selected' : ''}`}
                  onClick={() => handleSeleccion(valor)}
                  title={etiquetas ? etiquetas[i] : `${valor}`}
                >
                  {valor}
                </button>
              );
            })}
          </div>
          {etiquetas && respuestaActual && (
            <p className="ca-escala-descripcion">{etiquetas[respuestaActual - escalaMin]}</p>
          )}
        </div>

        {/* Navegación */}
        <div className="ca-nav">
          <button
            className="btn btn-secondary"
            onClick={handleAnterior}
            disabled={preguntaActual === 0 && (!esVLQ || faseVLQ === 0)}
          >
            Anterior
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSiguiente}
            disabled={respuestaActual === null}
          >
            {esUltimaPregunta ? 'Finalizar' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CuestionarioActivo;
