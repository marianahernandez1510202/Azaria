import React from 'react';

const CuestionarioResultado = ({ cuestionario, resultado, onClose }) => {
  const esVLQ = cuestionario.tipo === 'vlq';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="resultado-modal" onClick={e => e.stopPropagation()}>
        <button className="ca-close" onClick={onClose}>✕</button>

        <h2>Resultado: {cuestionario.nombre}</h2>
        <p className="resultado-nombre-completo">{cuestionario.nombreCompleto}</p>

        {/* Score circular */}
        <div className="resultado-score" style={{ '--score-color': resultado.color }}>
          <div className="score-circulo">
            <span className="score-numero">{resultado.total}</span>
            <span className="score-label">{esVLQ ? 'Promedio' : 'Puntuación'}</span>
          </div>
        </div>

        {/* Nivel */}
        <div className="resultado-nivel" style={{ color: resultado.color }}>
          {resultado.nivel.charAt(0).toUpperCase() + resultado.nivel.slice(1)}
        </div>

        {/* Interpretación */}
        <div className="resultado-interpretacion">
          <p>{resultado.texto}</p>
        </div>

        {/* Nota */}
        {resultado.nota && (
          <div className="resultado-nota">
            <p>{resultado.nota}</p>
          </div>
        )}

        {/* Desglose VLQ */}
        {esVLQ && resultado.detalleAreas && (
          <div className="vlq-desglose">
            <h3>Desglose por áreas</h3>
            <div className="vlq-tabla">
              <div className="vlq-tabla-header">
                <span>Área</span>
                <span>Importancia</span>
                <span>Consistencia</span>
                <span>Compuesta</span>
              </div>
              {resultado.detalleAreas.map(area => (
                <div
                  key={area.id}
                  className={`vlq-tabla-row ${area.importancia >= 9 && area.consistencia <= 6 ? 'problema' : ''}`}
                >
                  <span className="vlq-area-nombre">{area.nombre}</span>
                  <span>{area.importancia}</span>
                  <span>{area.consistencia}</span>
                  <span className="vlq-compuesta">{area.compuesta}</span>
                </div>
              ))}
            </div>

            {resultado.areasProblema.length > 0 && (
              <div className="vlq-problemas">
                <h4>Áreas prioritarias para trabajar</h4>
                <p>Estas áreas tienen alta importancia pero baja consistencia:</p>
                <ul>
                  {resultado.areasProblema.map(area => (
                    <li key={area.id}>
                      <strong>{area.nombre}</strong>: Importancia {area.importancia}, Consistencia {area.consistencia}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <button className="btn btn-primary btn-block" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default CuestionarioResultado;
