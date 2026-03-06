import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import AccessibilityPanel, { AccessibilityFAB } from '../components/accessibility/AccessibilityPanel';
import { perfilService } from '../services/perfilService';
import LucideIcon from '../components/LucideIcon';
import '../styles/Perfil.css';

const Perfil = () => {
  const { user, logout } = useAuth();
  const { settings } = useAccessibility();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      const response = await perfilService.getPerfil();
      setPerfil(response.data);
      setFormData(response.data);
    } catch (err) {
      setError('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await perfilService.updatePerfil(formData);
      setPerfil(formData);
      setEditing(false);
      setSuccess('Perfil actualizado correctamente');
    } catch (err) {
      setError('Error al actualizar el perfil');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const response = await perfilService.updateAvatar(file);
        setPerfil(prev => ({ ...prev, avatar: response.data.avatar }));
        setSuccess('Avatar actualizado correctamente');
      } catch (err) {
        setError('Error al actualizar el avatar');
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="perfil-page">
      <header className="page-header">
        <h1>Mi Perfil</h1>
        <button
          className="btn btn-secondary"
          onClick={() => setEditing(!editing)}
        >
          {editing ? 'Cancelar' : 'Editar'}
        </button>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="perfil-content">
        <div className="avatar-section">
          <div className="avatar-container">
            {perfil?.avatar ? (
              <img src={perfil.avatar} alt="Avatar" className="avatar-img" />
            ) : (
              <div className="avatar-placeholder">
                {perfil?.nombre_completo?.charAt(0) || 'U'}
              </div>
            )}
            {editing && (
              <label className="avatar-edit-btn">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  hidden
                />
                <LucideIcon name="camera" size={16} /> Cambiar foto
              </label>
            )}
          </div>
          <h2>{perfil?.nombre_completo}</h2>
          <p className="user-role">{perfil?.rol}</p>
        </div>

        <form className="perfil-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Información Personal</h3>

            <div className="form-group">
              <label>Nombre Completo</label>
              <input
                type="text"
                name="nombre_completo"
                value={formData.nombre_completo || ''}
                onChange={handleChange}
                disabled={!editing}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Correo Electrónico</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                disabled={true}
                className="form-control"
              />
              <small className="help-text">El correo no se puede modificar</small>
            </div>

            <div className="form-group">
              <label>Teléfono</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono || ''}
                onChange={handleChange}
                disabled={!editing}
                className="form-control"
                placeholder="10 dígitos"
              />
            </div>

            <div className="form-group">
              <label>Fecha de Nacimiento</label>
              <input
                type="date"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento || ''}
                onChange={handleChange}
                disabled={!editing}
                className="form-control"
              />
            </div>
          </div>

          {perfil?.rol === 'paciente' && (
            <div className="form-section">
              <h3>Información Médica</h3>

              <div className="form-group">
                <label>Peso (kg)</label>
                <input
                  type="number"
                  name="peso"
                  value={formData.peso || ''}
                  onChange={handleChange}
                  disabled={!editing}
                  className="form-control"
                  step="0.1"
                />
              </div>

              <div className="form-group">
                <label>Estatura (cm)</label>
                <input
                  type="number"
                  name="estatura"
                  value={formData.estatura || ''}
                  onChange={handleChange}
                  disabled={!editing}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Tipo de Sangre</label>
                <select
                  name="tipo_sangre"
                  value={formData.tipo_sangre || ''}
                  onChange={handleChange}
                  disabled={!editing}
                  className="form-control"
                >
                  <option value="">Seleccionar</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div className="form-group">
                <label>Alergias</label>
                <textarea
                  name="alergias"
                  value={formData.alergias || ''}
                  onChange={handleChange}
                  disabled={!editing}
                  className="form-control"
                  rows="3"
                  placeholder="Describe tus alergias conocidas"
                />
              </div>
            </div>
          )}

          <div className="form-section">
            <h3>Contacto de Emergencia</h3>

            <div className="form-group">
              <label>Nombre del Contacto</label>
              <input
                type="text"
                name="contacto_emergencia_nombre"
                value={formData.contacto_emergencia_nombre || ''}
                onChange={handleChange}
                disabled={!editing}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Teléfono de Emergencia</label>
              <input
                type="tel"
                name="contacto_emergencia_telefono"
                value={formData.contacto_emergencia_telefono || ''}
                onChange={handleChange}
                disabled={!editing}
                className="form-control"
              />
            </div>
          </div>

          {editing && (
            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-lg">
                Guardar Cambios
              </button>
            </div>
          )}
        </form>

        <div className="security-section">
          <h3>Seguridad</h3>
          <div className="security-actions">
            <button
              className="btn btn-outline"
              onClick={() => window.location.href = '/cambiar-pin'}
            >
              Cambiar PIN
            </button>
            <button
              className="btn btn-outline"
              onClick={() => window.location.href = '/cambiar-password'}
            >
              Cambiar Contraseña
            </button>
            <button
              className="btn btn-outline"
              onClick={() => window.location.href = '/dispositivos'}
            >
              Administrar Dispositivos
            </button>
          </div>
        </div>

        <div className="logout-section">
          <button className="btn btn-danger btn-lg" onClick={logout}>
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Panel de Accesibilidad */}
      <AccessibilityPanel />

      {/* FAB de Accesibilidad */}
      <AccessibilityFAB />
    </div>
  );
};

export default Perfil;
