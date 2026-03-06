import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './OutlookConnect.css';

const OutlookConnect = ({ onConnectionChange }) => {
  const [status, setStatus] = useState({
    configured: false,
    enabled: false,
    connected: false,
    email: null,
    loading: true
  });
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkStatus();

    // Verificar si venimos del callback de OAuth
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('outlook_connected') === 'true') {
      // Limpiar URL
      window.history.replaceState({}, document.title, window.location.pathname);
      checkStatus();
    } else if (urlParams.get('outlook_error')) {
      setError('Error al conectar con Outlook: ' + urlParams.get('outlook_error'));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const checkStatus = async () => {
    try {
      // Verificar configuración del sistema
      const configResponse = await api.get('/outlook/status');

      // Verificar si el usuario tiene Outlook conectado
      const connectedResponse = await api.get('/outlook/connected');

      setStatus({
        configured: configResponse.data?.configured || false,
        enabled: configResponse.data?.enabled || false,
        connected: connectedResponse.data?.connected || false,
        email: connectedResponse.data?.email || null,
        connectedAt: connectedResponse.data?.connected_at || null,
        loading: false
      });

      if (onConnectionChange) {
        onConnectionChange(connectedResponse.data?.connected || false);
      }
    } catch (err) {
      console.error('Error checking Outlook status:', err);
      setStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const handleConnect = async () => {
    try {
      setError(null);
      const response = await api.get('/outlook/auth');

      if (response.data?.auth_url) {
        // Redirigir a Microsoft para autorización
        window.location.href = response.data.auth_url;
      } else {
        setError('No se pudo obtener la URL de autorización');
      }
    } catch (err) {
      console.error('Error starting OAuth:', err);
      setError('Error al iniciar conexión con Outlook');
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('¿Estás seguro de desconectar tu cuenta de Outlook?')) {
      return;
    }

    try {
      await api.delete('/outlook/disconnect');
      setStatus(prev => ({
        ...prev,
        connected: false,
        email: null,
        connectedAt: null
      }));
      if (onConnectionChange) {
        onConnectionChange(false);
      }
    } catch (err) {
      console.error('Error disconnecting:', err);
      setError('Error al desconectar Outlook');
    }
  };

  const syncCita = async (citaId) => {
    try {
      setSyncing(true);
      setError(null);
      const response = await api.post(`/outlook/sync/${citaId}`);
      return response.data;
    } catch (err) {
      console.error('Error syncing cita:', err);
      setError('Error al sincronizar con Outlook');
      return null;
    } finally {
      setSyncing(false);
    }
  };

  if (status.loading) {
    return (
      <div className="outlook-connect loading">
        <div className="spinner-small"></div>
        <span>Verificando conexión...</span>
      </div>
    );
  }

  if (!status.configured || !status.enabled) {
    return (
      <div className="outlook-connect disabled">
        <div className="outlook-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.31.77.1.43.1.88zM24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h6.5V2.55q0-.44.3-.75.3-.3.75-.3h12.9q.44 0 .75.3.3.31.3.75V12zm-6-8.25v3h3v-3zm0 4.5v3h3v-3zm0 4.5v1.83l3.05-1.83zm-5.25-9v3h3.75v-3zm0 4.5v3h3.75v-3zm0 4.5v2.03l2.41 1.5 1.34-.8v-2.73zM9 3.75V6h2l.13.01.12.04v-2.3zM5.98 15.98q.9 0 1.6-.3.7-.32 1.19-.86.48-.55.73-1.28.25-.74.25-1.61 0-.83-.25-1.55-.24-.71-.71-1.24t-1.15-.83q-.68-.3-1.55-.3-.92 0-1.64.3-.71.3-1.2.85-.5.54-.75 1.3-.25.74-.25 1.63 0 .85.26 1.56.26.72.74 1.23.48.52 1.17.81.69.3 1.56.3zM7.5 21h12.39L12 16.08V17q0 .41-.3.7-.29.3-.7.3H7.5zm15-.13v-7.24l-5.9 3.54Z"/>
          </svg>
        </div>
        <div className="outlook-info">
          <span className="outlook-title">Outlook Calendar</span>
          <span className="outlook-status disabled">No configurado</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`outlook-connect ${status.connected ? 'connected' : ''}`}>
      <div className="outlook-icon">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.31.77.1.43.1.88zM24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h6.5V2.55q0-.44.3-.75.3-.3.75-.3h12.9q.44 0 .75.3.3.31.3.75V12zm-6-8.25v3h3v-3zm0 4.5v3h3v-3zm0 4.5v1.83l3.05-1.83zm-5.25-9v3h3.75v-3zm0 4.5v3h3.75v-3zm0 4.5v2.03l2.41 1.5 1.34-.8v-2.73zM9 3.75V6h2l.13.01.12.04v-2.3zM5.98 15.98q.9 0 1.6-.3.7-.32 1.19-.86.48-.55.73-1.28.25-.74.25-1.61 0-.83-.25-1.55-.24-.71-.71-1.24t-1.15-.83q-.68-.3-1.55-.3-.92 0-1.64.3-.71.3-1.2.85-.5.54-.75 1.3-.25.74-.25 1.63 0 .85.26 1.56.26.72.74 1.23.48.52 1.17.81.69.3 1.56.3zM7.5 21h12.39L12 16.08V17q0 .41-.3.7-.29.3-.7.3H7.5zm15-.13v-7.24l-5.9 3.54Z"/>
        </svg>
      </div>

      <div className="outlook-info">
        <span className="outlook-title">Outlook Calendar</span>
        {status.connected ? (
          <>
            <span className="outlook-status connected">Conectado</span>
            <span className="outlook-email">{status.email}</span>
          </>
        ) : (
          <span className="outlook-status">No conectado</span>
        )}
      </div>

      <div className="outlook-actions">
        {status.connected ? (
          <button
            className="btn-outlook disconnect"
            onClick={handleDisconnect}
            title="Desconectar Outlook"
          >
            Desconectar
          </button>
        ) : (
          <>
            <button
              className="btn-outlook connect"
              onClick={handleConnect}
              title="Usa una cuenta personal (outlook.com, hotmail.com, live.com)"
            >
              Conectar
            </button>
            <span className="outlook-hint">Solo cuentas personales (outlook.com, hotmail.com, live.com)</span>
          </>
        )}
      </div>

      {error && (
        <div className="outlook-error">
          {error}
          <button onClick={() => setError(null)}>x</button>
        </div>
      )}
    </div>
  );
};

// Componente para sincronizar una cita individual
export const OutlookSyncButton = ({ citaId, outlookEventId, onSync }) => {
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(!!outlookEventId);

  const handleSync = async () => {
    try {
      setSyncing(true);
      const response = await api.post(`/outlook/sync/${citaId}`);
      if (response.data) {
        setSynced(true);
        if (onSync) onSync(response.data);
      }
    } catch (err) {
      console.error('Error syncing:', err);
      alert('Error al sincronizar con Outlook');
    } finally {
      setSyncing(false);
    }
  };

  const handleUnsync = async () => {
    try {
      setSyncing(true);
      await api.delete(`/outlook/sync/${citaId}`);
      setSynced(false);
      if (onSync) onSync(null);
    } catch (err) {
      console.error('Error removing sync:', err);
    } finally {
      setSyncing(false);
    }
  };

  if (syncing) {
    return <span className="outlook-sync-btn syncing">Sincronizando...</span>;
  }

  if (synced) {
    return (
      <button
        className="outlook-sync-btn synced"
        onClick={handleUnsync}
        title="Quitar de Outlook"
      >
        En Outlook
      </button>
    );
  }

  return (
    <button
      className="outlook-sync-btn"
      onClick={handleSync}
      title="Agregar a Outlook"
    >
      + Outlook
    </button>
  );
};

export default OutlookConnect;
