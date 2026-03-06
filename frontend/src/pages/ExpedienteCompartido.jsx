import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import InstitutionalHeader from '../components/layouts/InstitutionalHeader';
import InstitutionalFooter from '../components/layouts/InstitutionalFooter';
import '../components/layouts/institutional.css';
import LucideIcon from '../components/LucideIcon';
import '../styles/Expediente.css';

const ExpedienteCompartido = () => {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadExpediente();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadExpediente = async () => {
    try {
      const res = await api.get(`/expediente/compartido/${token}`);
      if (res?.data) {
        setData(res.data);
      } else {
        setError('expired');
      }
    } catch (err) {
      setError('expired');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="expediente-loading">
        <div className="loading-spinner"></div>
        <p>Cargando expediente...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shared-expired">
        <div>
          <span className="shared-expired-icon"><LucideIcon name="lock" size={40} /></span>
          <h2>Enlace no disponible</h2>
          <p>Este enlace ha expirado o no es valido.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="expediente-shared">
      <InstitutionalHeader />
      <div className="shared-banner">
        <h1>Expediente Medico Compartido</h1>
        <p>
          {data.paciente?.nombre_completo} | Expira: {formatDate(data.expira_en)}
        </p>
      </div>

      <div className="shared-content">
        {/* Health Summary */}
        <section className="health-summary">
          <h2>Resumen de Salud</h2>
          <div className="health-cards-scroll">
            <div className="health-card glucosa">
              <div className="health-card-icon">🩸</div>
              <span className="health-card-label">Glucosa</span>
              {data.glucosa ? (
                <>
                  <span className="health-card-value">{data.glucosa.valor} mg/dL</span>
                  <span className="health-card-date">{formatDate(data.glucosa.fecha)}</span>
                </>
              ) : (
                <span className="health-card-empty">Sin registro</span>
              )}
            </div>

            <div className="health-card presion">
              <div className="health-card-icon"><LucideIcon name="heart" size={24} /></div>
              <span className="health-card-label">Presion</span>
              {data.presion ? (
                <>
                  <span className="health-card-value">
                    {data.presion.sistolica}/{data.presion.diastolica}
                  </span>
                  <span className="health-card-date">Pulso: {data.presion.pulso || '-'}</span>
                </>
              ) : (
                <span className="health-card-empty">Sin registro</span>
              )}
            </div>

            <div className="health-card animo">
              <div className="health-card-icon"><LucideIcon name="brain" size={24} /></div>
              <span className="health-card-label">Estado de Animo</span>
              {data.animo ? (
                <>
                  <span className="health-card-value">{data.animo.emocion}</span>
                  <span className="health-card-date">Nivel: {data.animo.nivel}/10</span>
                </>
              ) : (
                <span className="health-card-empty">Sin registro</span>
              )}
            </div>

            <div className="health-card dolor">
              <div className="health-card-icon"><LucideIcon name="zap" size={24} /></div>
              <span className="health-card-label">Dolor</span>
              {data.dolor ? (
                <>
                  <span className="health-card-value">{data.dolor.intensidad}/10</span>
                  <span className="health-card-date">{formatDate(data.dolor.fecha)}</span>
                </>
              ) : (
                <span className="health-card-empty">Sin registro</span>
              )}
            </div>
          </div>
        </section>

        {/* Medicamentos activos */}
        {data.medicamentos && data.medicamentos.length > 0 && (
          <section className="documentos-section">
            <div className="documentos-header">
              <h2><LucideIcon name="pill" size={20} /> Medicamentos Activos ({data.medicamentos.length})</h2>
            </div>
            <div className="archivos-list">
              {data.medicamentos.map((med, idx) => (
                <div key={idx} className="archivo-card">
                  <div className="archivo-icon pdf" style={{ background: '#F44336' }}>
                    <LucideIcon name="pill" size={18} color="#fff" />
                  </div>
                  <div className="archivo-info">
                    <span className="archivo-nombre">
                      {med.nombre_comercial}
                      {med.nombre_generico ? ` (${med.nombre_generico})` : ''}
                    </span>
                    <div className="archivo-meta">
                      <span>{med.dosis}</span>
                      <span>{med.frecuencia}</span>
                      <span>{med.via_administracion}</span>
                      <span>Desde: {formatDate(med.fecha_inicio)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Archivos */}
        <section className="documentos-section">
          <div className="documentos-header">
            <h2>Documentos ({data.archivos?.length || 0})</h2>
          </div>

          {data.archivos && data.archivos.length > 0 ? (
            <div className="archivos-list">
              {data.archivos.map((archivo) => (
                <div key={archivo.id} className="archivo-card">
                  <div className={`archivo-icon ${archivo.tipo_archivo === 'pdf' ? 'pdf' : 'docx'}`}>
                    {archivo.tipo_archivo === 'pdf' ? 'PDF' : 'DOC'}
                  </div>
                  <div className="archivo-info">
                    <span className="archivo-nombre">{archivo.nombre_original}</span>
                    <div className="archivo-meta">
                      <span>{archivo.categoria}</span>
                      <span>{formatFileSize(archivo.tamano)}</span>
                      <span>{formatDate(archivo.fecha_estudio || archivo.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-archivos">
              <span><LucideIcon name="file-text" size={24} /></span>
              <p>No hay documentos en el expediente.</p>
            </div>
          )}
        </section>
      </div>
      <InstitutionalFooter />
    </div>
  );
};

export default ExpedienteCompartido;
