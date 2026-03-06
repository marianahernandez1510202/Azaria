import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import InstitutionalHeader from '../components/layouts/InstitutionalHeader';
import InstitutionalFooter from '../components/layouts/InstitutionalFooter';
import '../components/layouts/institutional.css';
import '../styles/SubirDocumentos.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const CATEGORIAS = [
  {
    key: 'laboratorios',
    title: 'Laboratorios',
    desc: 'Resultados de análisis clínicos recientes (hemoglobina, glucosa, etc.)',
    icon: '🔬'
  },
  {
    key: 'radiografias',
    title: 'Radiografías',
    desc: 'Imágenes radiográficas del miembro afectado',
    icon: '🦴'
  },
  {
    key: 'comprobante_domicilio',
    title: 'Comprobante de Domicilio',
    desc: 'Recibo de luz, agua, teléfono o estado de cuenta (no mayor a 3 meses)',
    icon: '🏠'
  }
];

const SubirDocumentos = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [solicitud, setSolicitud] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [docsOficiales, setDocsOficiales] = useState([]);
  const [uploading, setUploading] = useState({});
  const [msg, setMsg] = useState(null);
  const [enviado, setEnviado] = useState(false);
  const fileInputRefs = useRef({});

  useEffect(() => {
    cargarDatos();
  }, [token]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [docsRes, oficialesRes] = await Promise.all([
        fetch(`${API_URL}/admisiones/documentos/${token}`).then(r => r.json()),
        fetch(`${API_URL}/admisiones/documentos-oficiales`).then(r => r.json())
      ]);

      if (!docsRes.success) {
        setError('expirado');
        return;
      }

      setSolicitud(docsRes.data.solicitud);
      setDocumentos(docsRes.data.documentos || []);
      setDocsOficiales(oficialesRes.data || []);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('conexion');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (categoria, file) => {
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'jpg', 'jpeg', 'png'].includes(ext)) {
      setMsg({ type: 'error', text: 'Tipo de archivo no permitido. Usa PDF, JPG o PNG.' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMsg({ type: 'error', text: 'El archivo excede el tamaño máximo de 10MB.' });
      return;
    }

    setUploading(prev => ({ ...prev, [categoria]: true }));
    setMsg(null);

    try {
      const formData = new FormData();
      formData.append('archivo', file);
      formData.append('categoria', categoria);

      const response = await fetch(`${API_URL}/admisiones/documentos/${token}`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setMsg({ type: 'success', text: 'Documento subido correctamente.' });
        cargarDatos();
      } else {
        setMsg({ type: 'error', text: result.message || 'Error al subir el documento.' });
      }
    } catch (err) {
      console.error('Error subiendo:', err);
      setMsg({ type: 'error', text: 'Error de conexión al subir el documento.' });
    } finally {
      setUploading(prev => ({ ...prev, [categoria]: false }));
    }
  };

  const getDocsPorCategoria = (categoria) => {
    return documentos.filter(d => d.categoria === categoria);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatExpira = (fecha) => {
    if (!fecha) return '';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getTipoLabel = (tipo) => {
    const labels = { reglamento: 'Reglamento', aviso_privacidad: 'Aviso de Privacidad', consentimiento: 'Consentimiento Informado' };
    return labels[tipo] || tipo;
  };

  if (loading) {
    return (
      <div className="subir-docs-page">
        <InstitutionalHeader />
        <main className="subir-docs-content">
          <div className="subir-docs-loading">
            <div className="subir-docs-spinner" />
            <p>Cargando...</p>
          </div>
        </main>
        <InstitutionalFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="subir-docs-page">
        <InstitutionalHeader />
        <main className="subir-docs-content">
          <div className="subir-docs-error">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <h2>{error === 'expirado' ? 'Enlace Expirado' : 'Error de Conexión'}</h2>
            <p>
              {error === 'expirado'
                ? 'Este enlace ha expirado o no es válido. Contacta al equipo de admisiones para obtener un nuevo enlace.'
                : 'No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.'}
            </p>
          </div>
        </main>
        <InstitutionalFooter />
      </div>
    );
  }

  return (
    <div className="subir-docs-page">
      <InstitutionalHeader />
      <main className="subir-docs-content">
        <div className="subir-docs-header">
          <h1>Subir Documentos</h1>
          <p>Sube los documentos requeridos para completar tu solicitud de admisión.</p>
          {solicitud && (
            <>
              <div className="subir-docs-info">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                Solicitante: {solicitud.nombre}
              </div>
              {solicitud.expira_en && (
                <div className="subir-docs-expira">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Enlace válido hasta: {formatExpira(solicitud.expira_en)}
                </div>
              )}
            </>
          )}
        </div>

        {msg && (
          <div className={`upload-msg ${msg.type}`}>{msg.text}</div>
        )}

        {/* Categorías de documentos */}
        <div className="docs-categorias">
          {CATEGORIAS.map(cat => {
            const docs = getDocsPorCategoria(cat.key);
            const tieneArchivo = docs.length > 0;
            return (
              <div key={cat.key} className={`doc-categoria-card ${tieneArchivo ? 'tiene-archivo' : ''}`}>
                <div className="doc-categoria-header">
                  <div className="doc-categoria-title">
                    <div className="doc-categoria-icon">{cat.icon}</div>
                    <h3>{cat.title}</h3>
                  </div>
                  {tieneArchivo && (
                    <div className="doc-categoria-check">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  )}
                </div>
                <p className="doc-categoria-desc">{cat.desc}</p>

                {/* Upload zone */}
                <div
                  className={`doc-upload-zone ${uploading[cat.key] ? 'uploading' : ''}`}
                  onClick={() => fileInputRefs.current[cat.key]?.click()}
                >
                  {uploading[cat.key] ? (
                    <>
                      <div className="subir-docs-spinner" />
                      <p>Subiendo...</p>
                    </>
                  ) : (
                    <>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      <p>{tieneArchivo ? 'Subir otro archivo' : 'Seleccionar archivo'}</p>
                      <span>PDF, JPG o PNG (máx. 10MB)</span>
                    </>
                  )}
                  <input
                    ref={el => fileInputRefs.current[cat.key] = el}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => {
                      handleUpload(cat.key, e.target.files[0]);
                      e.target.value = '';
                    }}
                  />
                </div>

                {/* Archivos ya subidos */}
                {docs.length > 0 && (
                  <div className="doc-archivos-lista">
                    {docs.map(doc => (
                      <div key={doc.id} className="doc-archivo-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        <span className="doc-archivo-nombre">{doc.nombre_original}</span>
                        <span className="doc-archivo-tamano">{formatSize(doc.tamano)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Resumen y botón enviar */}
        {documentos.length > 0 && !enviado && (
          <div className="docs-enviar-section">
            <div className="docs-resumen">
              <h3>Resumen de documentos</h3>
              <div className="docs-resumen-checks">
                {CATEGORIAS.map(cat => {
                  const tiene = getDocsPorCategoria(cat.key).length > 0;
                  return (
                    <div key={cat.key} className={`resumen-check-item ${tiene ? 'ok' : 'falta'}`}>
                      {tiene ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>
                      )}
                      <span>{cat.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <button
              className="btn-enviar-docs"
              onClick={() => {
                setEnviado(true);
                setMsg({ type: 'success', text: 'Tus documentos han sido enviados correctamente. El equipo de admisiones los revisará pronto.' });
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              Enviar Documentos
            </button>
          </div>
        )}

        {enviado && (
          <div className="docs-enviado-confirmacion">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2ea043" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <h3>Documentos Enviados</h3>
            <p>Tus documentos han sido recibidos. El equipo de admisiones los revisará y te contactaremos para los siguientes pasos.</p>
          </div>
        )}

        {/* Documentos oficiales */}
        {docsOficiales.length > 0 && (
          <div className="docs-oficiales-section">
            <h2>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Documentos Oficiales
            </h2>
            {docsOficiales.map(doc => (
              <div key={doc.id} className="doc-oficial-item">
                <div className="doc-oficial-info">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span className="doc-oficial-nombre">{getTipoLabel(doc.tipo)}</span>
                </div>
                <a
                  href={`${API_URL}/admisiones/documentos-oficiales/${doc.id}/descargar`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="doc-oficial-ver"
                >
                  Ver / Descargar
                </a>
              </div>
            ))}
          </div>
        )}
      </main>
      <InstitutionalFooter />
    </div>
  );
};

export default SubirDocumentos;
