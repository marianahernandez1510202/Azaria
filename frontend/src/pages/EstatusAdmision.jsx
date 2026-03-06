import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import InstitutionalHeader from '../components/layouts/InstitutionalHeader';
import InstitutionalFooter from '../components/layouts/InstitutionalFooter';
import LucideIcon from '../components/LucideIcon';
import '../components/layouts/institutional.css';
import '../styles/EstatusAdmision.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const ESTADO_INFO = {
  solicitud_recibida: { label: 'Solicitud Recibida', color: '#58a6ff', icon: 'inbox', desc: 'Tu solicitud ha sido recibida. Estamos revisando tus datos.' },
  screening_aprobado: { label: 'Pre-evaluación Aprobada', color: '#2ea043', icon: 'check-circle', desc: 'Tu pre-evaluación fue aprobada. Pronto recibirás un enlace para subir tus documentos.' },
  screening_rechazado: { label: 'No Admitido en Pre-evaluación', color: '#f85149', icon: 'x-circle', desc: 'Lamentablemente no cumples con los criterios de admisión en este momento.' },
  documentos_pendientes: { label: 'Documentos Pendientes', color: '#d29922', icon: 'file-up', desc: 'Necesitamos que subas tus documentos. Usa el enlace que aparece abajo.' },
  documentos_recibidos: { label: 'Documentos Recibidos', color: '#2ea043', icon: 'file-check', desc: 'Tus documentos han sido recibidos. Estamos revisándolos.' },
  pago_pendiente: { label: 'Pago Pendiente', color: '#d29922', icon: 'credit-card', desc: 'Realiza tu pago con la referencia proporcionada y espera confirmación.' },
  pago_confirmado: { label: 'Pago Confirmado', color: '#2ea043', icon: 'badge-check', desc: 'Tu pago ha sido confirmado. Pronto te contactaremos para agendar tu preconsulta.' },
  preconsulta_programada: { label: 'Preconsulta Programada', color: '#a371f7', icon: 'calendar-check', desc: 'Tu preconsulta ha sido agendada. Revisa la fecha y hora abajo.' },
  preconsulta_completada: { label: 'Preconsulta Completada', color: '#2ea043', icon: 'stethoscope', desc: 'Tu preconsulta fue realizada. Estamos evaluando tu caso.' },
  admitido: { label: 'Admitido', color: '#2ea043', icon: 'user-check', desc: '¡Felicidades! Has sido admitido. Te contactaremos con los datos de acceso a la plataforma.' },
  rechazado: { label: 'No Admitido', color: '#f85149', icon: 'user-x', desc: 'Lamentablemente no fue posible tu admisión en este momento.' }
};

const PIPELINE_STEPS = [
  { key: 'solicitud_recibida', label: 'Solicitud' },
  { key: 'screening', label: 'Pre-evaluación' },
  { key: 'documentos', label: 'Documentos' },
  { key: 'pago', label: 'Pago' },
  { key: 'preconsulta', label: 'Preconsulta' },
  { key: 'decision', label: 'Decisión' }
];

function getStepStatus(stepKey, estado) {
  const order = {
    solicitud_recibida: 1,
    screening_aprobado: 2, screening_rechazado: 2,
    documentos_pendientes: 3, documentos_recibidos: 3,
    pago_pendiente: 4, pago_confirmado: 4,
    preconsulta_programada: 5, preconsulta_completada: 5,
    admitido: 6, rechazado: 6
  };
  const stepOrder = { solicitud_recibida: 1, screening: 2, documentos: 3, pago: 4, preconsulta: 5, decision: 6 };
  const currentOrder = order[estado] || 1;
  const thisStep = stepOrder[stepKey] || 1;

  if (thisStep < currentOrder) return 'completed';
  if (thisStep === currentOrder) return 'active';
  return 'pending';
}

const EstatusAdmision = () => {
  const [folio, setFolio] = useState('');
  const [contacto, setContacto] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState(null);

  const handleConsultar = async (e) => {
    e.preventDefault();
    if (!folio.trim() || !contacto.trim()) {
      setError('Ingresa tu folio y correo o teléfono');
      return;
    }

    setLoading(true);
    setError('');
    setResultado(null);

    try {
      const response = await fetch(`${API_URL}/admisiones/estatus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folio: folio.trim().toUpperCase(), contacto: contacto.trim() })
      });

      const data = await response.json();

      if (data.success) {
        setResultado(data.data);
      } else {
        setError(data.message || 'No se encontró una solicitud con esos datos.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const estadoInfo = resultado ? (ESTADO_INFO[resultado.estado] || ESTADO_INFO.solicitud_recibida) : null;

  return (
    <div className="solicitud-page">
      <InstitutionalHeader />
      <main className="solicitud-content">

        {!resultado ? (
          <>
            <div className="solicitud-intro">
              <h1>Consultar Estatus de Solicitud</h1>
              <p>Ingresa tu número de folio y el correo o teléfono con el que te registraste.</p>
            </div>

            <div className="solicitud-form-card">
              {error && (
                <div className="solicitud-error">
                  <LucideIcon name="alert-triangle" size={18} /> {error}
                </div>
              )}

              <form onSubmit={handleConsultar}>
                <div className="solicitud-form-group">
                  <label htmlFor="folio">Número de Folio</label>
                  <input
                    type="text"
                    id="folio"
                    value={folio}
                    onChange={e => { setFolio(e.target.value.toUpperCase()); setError(''); }}
                    placeholder="SOL-00001"
                    autoFocus
                    required
                  />
                </div>

                <div className="solicitud-form-group">
                  <label htmlFor="contacto">Correo Electrónico o Teléfono</label>
                  <input
                    type="text"
                    id="contacto"
                    value={contacto}
                    onChange={e => { setContacto(e.target.value); setError(''); }}
                    placeholder="correo@ejemplo.com o 4421234567"
                    required
                  />
                </div>

                <div className="solicitud-actions">
                  <Link to="/solicitud" className="solicitud-btn solicitud-btn-secondary">
                    <LucideIcon name="arrow-left" size={18} /> Nueva Solicitud
                  </Link>
                  <button type="submit" className="solicitud-btn solicitud-btn-primary" disabled={loading}>
                    {loading ? 'Consultando...' : 'Consultar Estatus'}
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <>
            <div className="solicitud-intro">
              <h1>Estatus de tu Solicitud</h1>
              <p>Folio: <strong>{resultado.folio}</strong> · {resultado.nombre}</p>
            </div>

            <div className="solicitud-form-card">
              {/* Estado actual */}
              <div className="estatus-estado-actual" style={{ borderColor: estadoInfo.color }}>
                <div className="estatus-icon-badge" style={{ background: `${estadoInfo.color}20`, color: estadoInfo.color }}>
                  <LucideIcon name={estadoInfo.icon} size={28} />
                </div>
                <div className="estatus-info">
                  <h2 style={{ color: estadoInfo.color }}>{estadoInfo.label}</h2>
                  <p>{estadoInfo.desc}</p>
                </div>
              </div>

              {/* Pipeline visual */}
              <div className="estatus-pipeline">
                {PIPELINE_STEPS.map((step, idx) => {
                  const status = getStepStatus(step.key, resultado.estado);
                  return (
                    <React.Fragment key={step.key}>
                      {idx > 0 && <div className={`estatus-pipe-line ${status === 'pending' ? '' : 'completed'}`} />}
                      <div className={`estatus-pipe-step ${status}`}>
                        <div className="estatus-pipe-circle">
                          {status === 'completed' ? <LucideIcon name="check" size={14} /> : idx + 1}
                        </div>
                        <span className="estatus-pipe-label">{step.label}</span>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Link para subir documentos */}
              {resultado.token_documentos && (
                <div className="estatus-accion-card">
                  <LucideIcon name="file-up" size={24} />
                  <div>
                    <h3>Sube tus Documentos</h3>
                    <p>Ya puedes subir tus laboratorios, radiografías y comprobante de domicilio.</p>
                  </div>
                  <Link
                    to={`/admisiones/documentos/${resultado.token_documentos}`}
                    className="solicitud-btn solicitud-btn-primary"
                  >
                    Subir Documentos
                  </Link>
                </div>
              )}

              {/* Preconsulta agendada */}
              {resultado.fecha_preconsulta && (
                <div className="estatus-accion-card">
                  <LucideIcon name="calendar" size={24} />
                  <div>
                    <h3>Preconsulta Programada</h3>
                    <p>
                      Fecha: <strong>{new Date(resultado.fecha_preconsulta).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                      {resultado.hora_preconsulta && <> · Hora: <strong>{resultado.hora_preconsulta.slice(0, 5)}</strong></>}
                    </p>
                  </div>
                </div>
              )}

              {/* Documentos subidos */}
              {resultado.documentos?.length > 0 && (
                <div className="estatus-docs-section">
                  <h3><LucideIcon name="files" size={18} /> Documentos Subidos</h3>
                  <div className="estatus-docs-list">
                    {resultado.documentos.map((doc, i) => (
                      <div key={i} className="estatus-doc-item">
                        <LucideIcon name="file-check" size={16} />
                        <span className="doc-cat">{doc.categoria}</span>
                        <span className="doc-name">{doc.nombre_original}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="solicitud-actions" style={{ marginTop: 24 }}>
                <button className="solicitud-btn solicitud-btn-secondary" onClick={() => setResultado(null)}>
                  <LucideIcon name="search" size={18} /> Otra Consulta
                </button>
                <Link to="/" className="solicitud-btn solicitud-btn-primary">
                  Volver al Inicio
                </Link>
              </div>
            </div>
          </>
        )}
      </main>
      <InstitutionalFooter />
    </div>
  );
};

export default EstatusAdmision;
