import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '../context/AccessibilityContext';
import LucideIcon from '../components/LucideIcon';
import '../styles/RecuperarPassword.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const RecuperarPassword = () => {
  const { settings } = useAccessibility();
  const navigate = useNavigate();

  const [paso, setPaso] = useState(1); // 1=email, 2=código, 3=nueva contraseña
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [completado, setCompletado] = useState(false);
  const [reenviarTimer, setReenviarTimer] = useState(0);

  const startReenviarTimer = () => {
    setReenviarTimer(60);
    const interval = setInterval(() => {
      setReenviarTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSolicitarCodigo = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Ingresa tu correo electrónico');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (result.success) {
        setPaso(2);
        setSuccess('Se envió un código de 6 dígitos a tu correo electrónico.');
        startReenviarTimer();
      } else {
        setError(result.message || 'No se encontró una cuenta con ese correo.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificarCodigo = async (e) => {
    e.preventDefault();
    if (codigo.length !== 6) {
      setError('El código debe ser de 6 dígitos');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: codigo })
      });

      const result = await response.json();

      if (result.success) {
        setResetToken(result.data?.reset_token || '');
        setPaso(3);
        setSuccess('Código verificado. Ahora establece tu nueva contraseña.');
      } else {
        setError(result.message || 'Código inválido o expirado.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reset_token: resetToken,
          new_credential: newPassword,
          credential_confirmation: confirmPassword
        })
      });

      const result = await response.json();

      if (result.success) {
        setCompletado(true);
      } else {
        setError(result.message || 'Error al actualizar la contraseña.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleReenviar = async () => {
    if (reenviarTimer > 0) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Se envió un nuevo código a tu correo.');
        setCodigo('');
        startReenviarTimer();
      } else {
        setError(result.message || 'Error al reenviar. Intenta más tarde.');
      }
    } catch (err) {
      setError('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  if (completado) {
    return (
      <div className="recuperar-container" data-theme={settings.theme}>
        <div className="recuperar-card">
          <div className="recuperar-exito">
            <div className="exito-icon">
              <LucideIcon name="check-circle" size={36} />
            </div>
            <h2>Contraseña Actualizada</h2>
            <p>Tu contraseña ha sido cambiada exitosamente.</p>
            <p>Ya puedes iniciar sesión con tu nueva contraseña.</p>
            <div className="recuperar-actions" style={{ marginTop: '24px' }}>
              <button className="recuperar-btn recuperar-btn-primary" onClick={() => navigate('/login')}>
                <LucideIcon name="log-in" size={20} /> Ir a Iniciar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="recuperar-container" data-theme={settings.theme}>
      <div className="recuperar-card">
        {/* Header */}
        <div className="recuperar-header">
          <div className="header-icon">
            <LucideIcon name={paso === 1 ? 'mail' : paso === 2 ? 'key-round' : 'lock'} size={28} />
          </div>
          <h1>Recuperar Contraseña</h1>
          <p>
            {paso === 1 && 'Ingresa tu correo electrónico para recibir un código de verificación.'}
            {paso === 2 && 'Ingresa el código de 6 dígitos que enviamos a tu correo.'}
            {paso === 3 && 'Establece tu nueva contraseña.'}
          </p>
        </div>

        {/* Stepper */}
        <div className="recuperar-stepper">
          <div className={`recuperar-step-circle ${paso > 1 ? 'completed' : paso === 1 ? 'active' : ''}`}>
            {paso > 1 ? '✓' : '1'}
          </div>
          <div className={`recuperar-step-line ${paso > 1 ? 'completed' : ''}`} />
          <div className={`recuperar-step-circle ${paso > 2 ? 'completed' : paso === 2 ? 'active' : ''}`}>
            {paso > 2 ? '✓' : '2'}
          </div>
          <div className={`recuperar-step-line ${paso > 2 ? 'completed' : ''}`} />
          <div className={`recuperar-step-circle ${paso === 3 ? 'active' : ''}`}>3</div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="recuperar-alert recuperar-alert-error">
            <LucideIcon name="alert-triangle" size={18} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="recuperar-alert recuperar-alert-success">
            <LucideIcon name="check-circle" size={18} />
            <span>{success}</span>
          </div>
        )}

        {/* Paso 1: Email */}
        {paso === 1 && (
          <form onSubmit={handleSolicitarCodigo}>
            <div className="recuperar-form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="ejemplo@correo.com"
                autoFocus
                required
              />
            </div>
            <div className="recuperar-actions">
              <button type="submit" className="recuperar-btn recuperar-btn-primary" disabled={loading}>
                {loading ? <><span className="recuperar-spinner" /> Enviando...</> : 'Enviar Código'}
              </button>
              <button type="button" className="recuperar-btn recuperar-btn-link" onClick={() => navigate('/login')}>
                Volver al inicio de sesión
              </button>
            </div>
          </form>
        )}

        {/* Paso 2: Código */}
        {paso === 2 && (
          <form onSubmit={handleVerificarCodigo}>
            <div className="recuperar-form-group">
              <label htmlFor="codigo">Código de Verificación</label>
              <input
                type="text"
                id="codigo"
                className="recuperar-code-input"
                value={codigo}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setCodigo(val);
                  setError('');
                }}
                placeholder="000000"
                maxLength={6}
                autoFocus
                inputMode="numeric"
                autoComplete="one-time-code"
              />
            </div>
            <div className="recuperar-reenviar">
              ¿No recibiste el código?{' '}
              <button type="button" onClick={handleReenviar} disabled={reenviarTimer > 0 || loading}>
                {reenviarTimer > 0 ? `Reenviar en ${reenviarTimer}s` : 'Reenviar código'}
              </button>
            </div>
            <div className="recuperar-actions">
              <button type="submit" className="recuperar-btn recuperar-btn-primary" disabled={loading || codigo.length !== 6}>
                {loading ? <><span className="recuperar-spinner" /> Verificando...</> : 'Verificar Código'}
              </button>
              <button type="button" className="recuperar-btn recuperar-btn-link" onClick={() => { setPaso(1); setError(''); setSuccess(''); setCodigo(''); }}>
                Cambiar correo electrónico
              </button>
            </div>
          </form>
        )}

        {/* Paso 3: Nueva contraseña */}
        {paso === 3 && (
          <form onSubmit={handleResetPassword}>
            <div className="recuperar-form-group">
              <label htmlFor="newPassword">Nueva Contraseña</label>
              <div className="recuperar-password-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="newPassword"
                  value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); setError(''); }}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  autoFocus
                  required
                />
                <button
                  type="button"
                  className="recuperar-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <LucideIcon name={showPassword ? 'eye-off' : 'eye'} size={20} />
                </button>
              </div>
            </div>
            <div className="recuperar-form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <div className="recuperar-password-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                  placeholder="Repite tu contraseña"
                  minLength={6}
                  required
                />
              </div>
            </div>
            <div className="recuperar-actions">
              <button type="submit" className="recuperar-btn recuperar-btn-primary" disabled={loading}>
                {loading ? <><span className="recuperar-spinner" /> Guardando...</> : 'Guardar Nueva Contraseña'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RecuperarPassword;
