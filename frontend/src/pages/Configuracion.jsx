import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import VoiceHelper from '../components/VoiceHelper';
import '../styles/Configuracion.css';

const Configuracion = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('notificaciones');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Configuración de tema y accesibilidad
  const [tema, setTema] = useState(() => localStorage.getItem('vitalia-theme') || 'dark');
  const [tamanoTexto, setTamanoTexto] = useState(() => localStorage.getItem('vitalia-font-size') || 'normal');
  const [altoContraste, setAltoContraste] = useState(() => localStorage.getItem('vitalia-high-contrast') === 'true');
  const [vozActiva, setVozActiva] = useState(() => localStorage.getItem('vitalia-voice') !== 'false');

  // Configuración de notificaciones
  const [notificaciones, setNotificaciones] = useState({
    recordatorios_medicamentos: true,
    recordatorios_ejercicios: true,
    recordatorios_citas: true,
    mensajes_chat: true,
    actualizaciones_blog: false,
    comunidad: false,
    sonido: true,
    vibracion: true
  });

  // Configuración de privacidad
  const [privacidad, setPrivacidad] = useState({
    perfil_visible_comunidad: true,
    mostrar_nombre_real: true,
    permitir_mensajes_pacientes: false
  });

  // Dispositivos de confianza
  const [dispositivos, setDispositivos] = useState([]);

  // Aplicar tema guardado al cargar
  useEffect(() => {
    const savedTheme = localStorage.getItem('vitalia-theme') || 'dark';
    const savedFontSize = localStorage.getItem('vitalia-font-size') || 'normal';

    document.documentElement.setAttribute('data-theme', savedTheme);
    if (savedFontSize === 'large') {
      document.documentElement.setAttribute('data-font-size', 'large');
    }
  }, []);

  useEffect(() => {
    cargarConfiguracion();
  }, [activeSection]);

  const cargarConfiguracion = async () => {
    setLoading(true);
    try {
      if (activeSection === 'dispositivos') {
        const response = await api.get('/auth/devices');
        setDispositivos(response.data || []);
      }
    } catch (err) {
      console.error('Error al cargar configuración:', err);
    } finally {
      setLoading(false);
    }
  };

  const guardarNotificaciones = async () => {
    try {
      await api.put('/configuracion/notificaciones', notificaciones);
      setMensaje({ tipo: 'success', texto: 'Preferencias de notificaciones guardadas' });
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error al guardar preferencias' });
    }
  };

  const guardarPrivacidad = async () => {
    try {
      await api.put('/configuracion/privacidad', privacidad);
      setMensaje({ tipo: 'success', texto: 'Preferencias de privacidad guardadas' });
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error al guardar preferencias' });
    }
  };

  const cerrarSesionDispositivo = async (dispositivoId) => {
    if (!window.confirm('¿Cerrar sesión en este dispositivo?')) return;

    try {
      await api.delete(`/auth/devices/${dispositivoId}`);
      setDispositivos(prev => prev.filter(d => d.id !== dispositivoId));
      setMensaje({ tipo: 'success', texto: 'Sesión cerrada en el dispositivo' });
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error al cerrar sesión' });
    }
  };

  const cerrarTodasLasSesiones = async () => {
    if (!window.confirm('¿Cerrar sesión en todos los dispositivos excepto este?')) return;

    try {
      await api.post('/auth/logout-all');
      setDispositivos(prev => prev.filter(d => d.actual));
      setMensaje({ tipo: 'success', texto: 'Sesiones cerradas en todos los dispositivos' });
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error al cerrar sesiones' });
    }
  };

  const formatearFechaDispositivo = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getIconoDispositivo = (tipo) => {
    const iconos = {
      'mobile': '📱',
      'tablet': '📱',
      'desktop': '💻',
      'unknown': '🖥️'
    };
    return iconos[tipo] || iconos['unknown'];
  };

  return (
    <div className="configuracion-page">
      {vozActiva && <VoiceHelper currentModule="config" />}

      <header className="page-header">
        <h1>⚙️ Configuración</h1>
        <p>Personaliza tu experiencia en Azaria</p>
      </header>

      {mensaje.texto && (
        <div className={`alert alert-${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      <div className="config-container">
        {/* Menú lateral */}
        <nav className="config-nav">
          <button
            className={`nav-item ${activeSection === 'notificaciones' ? 'active' : ''}`}
            onClick={() => setActiveSection('notificaciones')}
          >
            🔔 Notificaciones
          </button>
          <button
            className={`nav-item ${activeSection === 'privacidad' ? 'active' : ''}`}
            onClick={() => setActiveSection('privacidad')}
          >
            🔒 Privacidad
          </button>
          <button
            className={`nav-item ${activeSection === 'dispositivos' ? 'active' : ''}`}
            onClick={() => setActiveSection('dispositivos')}
          >
            📱 Dispositivos
          </button>
          <button
            className={`nav-item ${activeSection === 'seguridad' ? 'active' : ''}`}
            onClick={() => setActiveSection('seguridad')}
          >
            🛡️ Seguridad
          </button>
          <button
            className={`nav-item ${activeSection === 'accesibilidad' ? 'active' : ''}`}
            onClick={() => setActiveSection('accesibilidad')}
          >
            ♿ Accesibilidad
          </button>
          <button
            className={`nav-item ${activeSection === 'acerca' ? 'active' : ''}`}
            onClick={() => setActiveSection('acerca')}
          >
            ℹ️ Acerca de
          </button>
        </nav>

        {/* Contenido */}
        <div className="config-content">
          {activeSection === 'notificaciones' && (
            <div className="config-section">
              <h2>Notificaciones</h2>
              <p className="section-desc">Controla qué notificaciones deseas recibir</p>

              <div className="config-group">
                <h3>Recordatorios</h3>
                <label className="config-toggle">
                  <span>Medicamentos</span>
                  <input
                    type="checkbox"
                    checked={notificaciones.recordatorios_medicamentos}
                    onChange={e => setNotificaciones({...notificaciones, recordatorios_medicamentos: e.target.checked})}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <label className="config-toggle">
                  <span>Ejercicios</span>
                  <input
                    type="checkbox"
                    checked={notificaciones.recordatorios_ejercicios}
                    onChange={e => setNotificaciones({...notificaciones, recordatorios_ejercicios: e.target.checked})}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <label className="config-toggle">
                  <span>Citas médicas</span>
                  <input
                    type="checkbox"
                    checked={notificaciones.recordatorios_citas}
                    onChange={e => setNotificaciones({...notificaciones, recordatorios_citas: e.target.checked})}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="config-group">
                <h3>Comunicación</h3>
                <label className="config-toggle">
                  <span>Mensajes del chat</span>
                  <input
                    type="checkbox"
                    checked={notificaciones.mensajes_chat}
                    onChange={e => setNotificaciones({...notificaciones, mensajes_chat: e.target.checked})}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <label className="config-toggle">
                  <span>Actualizaciones del blog</span>
                  <input
                    type="checkbox"
                    checked={notificaciones.actualizaciones_blog}
                    onChange={e => setNotificaciones({...notificaciones, actualizaciones_blog: e.target.checked})}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <label className="config-toggle">
                  <span>Actividad en comunidad</span>
                  <input
                    type="checkbox"
                    checked={notificaciones.comunidad}
                    onChange={e => setNotificaciones({...notificaciones, comunidad: e.target.checked})}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="config-group">
                <h3>Preferencias</h3>
                <label className="config-toggle">
                  <span>Sonido</span>
                  <input
                    type="checkbox"
                    checked={notificaciones.sonido}
                    onChange={e => setNotificaciones({...notificaciones, sonido: e.target.checked})}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <label className="config-toggle">
                  <span>Vibración</span>
                  <input
                    type="checkbox"
                    checked={notificaciones.vibracion}
                    onChange={e => setNotificaciones({...notificaciones, vibracion: e.target.checked})}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <button className="btn btn-primary" onClick={guardarNotificaciones}>
                Guardar cambios
              </button>
            </div>
          )}

          {activeSection === 'privacidad' && (
            <div className="config-section">
              <h2>Privacidad</h2>
              <p className="section-desc">Controla quién puede ver tu información</p>

              <div className="config-group">
                <h3>Comunidad</h3>
                <label className="config-toggle">
                  <span>Perfil visible en comunidad</span>
                  <input
                    type="checkbox"
                    checked={privacidad.perfil_visible_comunidad}
                    onChange={e => setPrivacidad({...privacidad, perfil_visible_comunidad: e.target.checked})}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <label className="config-toggle">
                  <span>Mostrar nombre real</span>
                  <input
                    type="checkbox"
                    checked={privacidad.mostrar_nombre_real}
                    onChange={e => setPrivacidad({...privacidad, mostrar_nombre_real: e.target.checked})}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <button className="btn btn-primary" onClick={guardarPrivacidad}>
                Guardar cambios
              </button>
            </div>
          )}

          {activeSection === 'dispositivos' && (
            <div className="config-section">
              <h2>Dispositivos de Confianza</h2>
              <p className="section-desc">Administra los dispositivos donde has iniciado sesión</p>

              {loading ? (
                <div className="loading-small">
                  <div className="spinner-small"></div>
                </div>
              ) : (
                <>
                  <div className="dispositivos-list">
                    {dispositivos.length > 0 ? dispositivos.map(dispositivo => (
                      <div key={dispositivo.id} className={`dispositivo-item ${dispositivo.actual ? 'actual' : ''}`}>
                        <span className="dispositivo-icon">{getIconoDispositivo(dispositivo.tipo)}</span>
                        <div className="dispositivo-info">
                          <span className="dispositivo-nombre">
                            {dispositivo.nombre}
                            {dispositivo.actual && <span className="badge-actual">Este dispositivo</span>}
                          </span>
                          <span className="dispositivo-detalles">
                            {dispositivo.navegador} • {dispositivo.ubicacion}
                          </span>
                          <span className="dispositivo-fecha">
                            Último acceso: {formatearFechaDispositivo(dispositivo.ultimo_acceso)}
                          </span>
                        </div>
                        {!dispositivo.actual && (
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => cerrarSesionDispositivo(dispositivo.id)}
                          >
                            Cerrar sesión
                          </button>
                        )}
                      </div>
                    )) : (
                      <p className="no-dispositivos">No hay otros dispositivos conectados</p>
                    )}
                  </div>

                  {dispositivos.length > 1 && (
                    <button className="btn btn-danger" onClick={cerrarTodasLasSesiones}>
                      Cerrar sesión en todos los dispositivos
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {activeSection === 'seguridad' && (
            <div className="config-section">
              <h2>Seguridad</h2>
              <p className="section-desc">Administra la seguridad de tu cuenta</p>

              <div className="seguridad-opciones">
                <a href="/cambiar-pin" className="seguridad-btn">
                  <span className="icon">🔢</span>
                  <div>
                    <h4>Cambiar PIN</h4>
                    <p>Actualiza tu PIN de acceso rápido</p>
                  </div>
                </a>

                <a href="/cambiar-password" className="seguridad-btn">
                  <span className="icon">🔑</span>
                  <div>
                    <h4>Cambiar Contraseña</h4>
                    <p>Actualiza tu contraseña de acceso</p>
                  </div>
                </a>
              </div>
            </div>
          )}

          {activeSection === 'accesibilidad' && (
            <div className="config-section">
              <h2>Accesibilidad</h2>
              <p className="section-desc">Opciones para mejorar tu experiencia visual y auditiva</p>

              {/* Selector de Tema */}
              <div className="config-group">
                <h3>🎨 Tema de Colores</h3>
                <p className="group-desc">Elige el modo que prefieras para ver la aplicación</p>
                <div className="theme-options">
                  <button
                    className={`theme-btn ${tema === 'dark' ? 'active' : ''}`}
                    onClick={() => {
                      setTema('dark');
                      document.documentElement.setAttribute('data-theme', 'dark');
                      localStorage.setItem('vitalia-theme', 'dark');
                    }}
                  >
                    <span className="theme-icon">🌙</span>
                    <span className="theme-name">Oscuro</span>
                    <span className="theme-desc">Ideal para la noche</span>
                  </button>
                  <button
                    className={`theme-btn ${tema === 'light' ? 'active' : ''}`}
                    onClick={() => {
                      setTema('light');
                      document.documentElement.setAttribute('data-theme', 'light');
                      localStorage.setItem('vitalia-theme', 'light');
                    }}
                  >
                    <span className="theme-icon">☀️</span>
                    <span className="theme-name">Claro</span>
                    <span className="theme-desc">Ideal para el día</span>
                  </button>
                  <button
                    className={`theme-btn ${tema === 'high-contrast' ? 'active' : ''}`}
                    onClick={() => {
                      setTema('high-contrast');
                      document.documentElement.setAttribute('data-theme', 'high-contrast');
                      localStorage.setItem('vitalia-theme', 'high-contrast');
                    }}
                  >
                    <span className="theme-icon">👁️</span>
                    <span className="theme-name">Alto Contraste</span>
                    <span className="theme-desc">Máxima visibilidad</span>
                  </button>
                </div>
              </div>

              {/* Tamaño de texto */}
              <div className="config-group">
                <h3>🔤 Tamaño de Texto</h3>
                <p className="group-desc">Ajusta el tamaño de las letras</p>
                <div className="font-size-options">
                  <button
                    className={`font-btn ${tamanoTexto === 'small' ? 'active' : ''}`}
                    onClick={() => {
                      setTamanoTexto('small');
                      document.documentElement.removeAttribute('data-font-size');
                      localStorage.setItem('vitalia-font-size', 'small');
                    }}
                  >
                    <span className="font-preview small">A</span>
                    <span>Normal</span>
                  </button>
                  <button
                    className={`font-btn ${tamanoTexto === 'normal' ? 'active' : ''}`}
                    onClick={() => {
                      setTamanoTexto('normal');
                      document.documentElement.removeAttribute('data-font-size');
                      localStorage.setItem('vitalia-font-size', 'normal');
                    }}
                  >
                    <span className="font-preview medium">A</span>
                    <span>Grande</span>
                  </button>
                  <button
                    className={`font-btn ${tamanoTexto === 'large' ? 'active' : ''}`}
                    onClick={() => {
                      setTamanoTexto('large');
                      document.documentElement.setAttribute('data-font-size', 'large');
                      localStorage.setItem('vitalia-font-size', 'large');
                    }}
                  >
                    <span className="font-preview large">A</span>
                    <span>Muy Grande</span>
                  </button>
                </div>
              </div>

              {/* Ayuda por Voz */}
              <div className="config-group">
                <h3>🔊 Ayuda por Voz</h3>
                <p className="group-desc">Activa o desactiva las explicaciones de audio</p>
                <label className="config-toggle">
                  <span>Mostrar botón de voz</span>
                  <input
                    type="checkbox"
                    checked={vozActiva}
                    onChange={(e) => {
                      setVozActiva(e.target.checked);
                      localStorage.setItem('vitalia-voice', e.target.checked);
                    }}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <p className="toggle-help">
                  Cuando está activo, verás un botón 🔊 en cada pantalla para escuchar explicaciones
                </p>
              </div>

              {/* Preview */}
              <div className="accessibility-preview">
                <h4>Vista previa</h4>
                <div className="preview-card">
                  <p>Este es un ejemplo de cómo se ve el texto con tus configuraciones actuales.</p>
                  <button className="btn btn-primary">Botón de Ejemplo</button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'acerca' && (
            <div className="config-section">
              <h2>Acerca de Azaria</h2>

              <div className="acerca-info">
                <div className="app-version">
                  <h3>Azaria 2.0</h3>
                  <p>Sistema de Adherencia Terapéutica</p>
                  <p className="version">Versión 2.0.0</p>
                </div>

                <div className="contacto-info">
                  <h4>Contacto</h4>
                  <p>📞 442-XXX-XXXX</p>
                  <p>✉️ soporte@azaria.app</p>
                  <p>🏥 ENES Juriquilla, UNAM</p>
                </div>

                <div className="legal-links">
                  <a href="/terminos">Términos y Condiciones</a>
                  <a href="/privacidad">Política de Privacidad</a>
                  <a href="/aviso-medico">Aviso Médico</a>
                </div>

                <p className="copyright">
                  © 2024 UIOyP - ENES Juriquilla, UNAM. Todos los derechos reservados.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="logout-section">
        <button className="btn btn-danger btn-lg" onClick={logout}>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Configuracion;
