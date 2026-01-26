import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import AccessibilityPanel, { AccessibilityFAB } from '../components/accessibility/AccessibilityPanel';
import api from '../services/api';
import '../styles/Comunidad.css';

const Comunidad = () => {
  const { user } = useAuth();
  const { settings } = useAccessibility();
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPublicacion, setSelectedPublicacion] = useState(null);

  // Nueva publicación
  const [nuevaPublicacion, setNuevaPublicacion] = useState({
    contenido: '',
    imagen: null
  });

  // Nuevo comentario
  const [nuevoComentario, setNuevoComentario] = useState('');

  useEffect(() => {
    cargarPublicaciones();
  }, []);

  const cargarPublicaciones = async () => {
    setLoading(true);
    try {
      const response = await api.get('/comunidad/feed');
      setPublicaciones(response.data || getPublicacionesDefault());
    } catch (err) {
      console.error('Error al cargar publicaciones:', err);
      setPublicaciones(getPublicacionesDefault());
    } finally {
      setLoading(false);
    }
  };

  const getPublicacionesDefault = () => [
    {
      id: 1,
      usuario: {
        id: 1,
        nombre: 'María García',
        avatar: null
      },
      contenido: '¡Hoy logré caminar 500 metros con mi prótesis sin descansar! Hace 3 meses apenas podía dar 10 pasos. No se rindan, el esfuerzo vale la pena.',
      imagen: null,
      likes: 24,
      liked: false,
      comentarios: [
        {
          id: 1,
          usuario: 'Juan López',
          texto: '¡Felicidades María! Es un gran logro.',
          fecha: '2024-01-15T10:30:00'
        },
        {
          id: 2,
          usuario: 'Ana Martínez',
          texto: 'Eres una inspiración para todos nosotros',
          fecha: '2024-01-15T11:00:00'
        }
      ],
      fecha: '2024-01-15T09:00:00'
    },
    {
      id: 2,
      usuario: {
        id: 2,
        nombre: 'Roberto Sánchez',
        avatar: null
      },
      contenido: 'Alguien tiene tips para el dolor fantasma en las noches? A veces me despierta y no sé qué hacer.',
      imagen: null,
      likes: 8,
      liked: false,
      comentarios: [
        {
          id: 3,
          usuario: 'Carlos Pérez',
          texto: 'A mí me ayuda mucho la técnica de la caja espejo, pregúntale a tu fisioterapeuta.',
          fecha: '2024-01-14T16:00:00'
        }
      ],
      fecha: '2024-01-14T15:30:00'
    },
    {
      id: 3,
      usuario: {
        id: 3,
        nombre: 'Luisa Fernández',
        avatar: null
      },
      contenido: 'Gracias a todos en este grupo. Cuando me dijeron que necesitaba una prótesis, pensé que mi vida había terminado. Ahora, 6 meses después, me doy cuenta de que apenas está comenzando una nueva etapa.',
      imagen: null,
      likes: 45,
      liked: false,
      comentarios: [],
      fecha: '2024-01-13T20:00:00'
    }
  ];

  const handlePublicar = async (e) => {
    e.preventDefault();
    if (!nuevaPublicacion.contenido.trim()) return;

    try {
      const formData = new FormData();
      formData.append('usuario_id', user.id);
      formData.append('contenido', nuevaPublicacion.contenido);
      if (nuevaPublicacion.imagen) {
        formData.append('imagen', nuevaPublicacion.imagen);
      }

      await api.post('/comunidad/publicaciones', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Agregar localmente
      const nuevaPost = {
        id: Date.now(),
        usuario: {
          id: user.id,
          nombre: user.nombre_completo,
          avatar: user.avatar
        },
        contenido: nuevaPublicacion.contenido,
        imagen: nuevaPublicacion.imagen ? URL.createObjectURL(nuevaPublicacion.imagen) : null,
        likes: 0,
        liked: false,
        comentarios: [],
        fecha: new Date().toISOString()
      };

      setPublicaciones([nuevaPost, ...publicaciones]);
      setShowModal(false);
      setNuevaPublicacion({ contenido: '', imagen: null });
    } catch (err) {
      console.error('Error al publicar:', err);
    }
  };

  const handleLike = async (publicacionId) => {
    try {
      await api.post(`/comunidad/publicaciones/${publicacionId}/like`);

      setPublicaciones(prev => prev.map(p => {
        if (p.id === publicacionId) {
          return {
            ...p,
            likes: p.liked ? p.likes - 1 : p.likes + 1,
            liked: !p.liked
          };
        }
        return p;
      }));

      if (selectedPublicacion?.id === publicacionId) {
        setSelectedPublicacion(prev => ({
          ...prev,
          likes: prev.liked ? prev.likes - 1 : prev.likes + 1,
          liked: !prev.liked
        }));
      }
    } catch (err) {
      console.error('Error al dar like:', err);
    }
  };

  const handleComentar = async (e) => {
    e.preventDefault();
    if (!nuevoComentario.trim() || !selectedPublicacion) return;

    try {
      await api.post(`/comunidad/publicaciones/${selectedPublicacion.id}/comentarios`, {
        usuario_id: user.id,
        texto: nuevoComentario
      });

      const comentario = {
        id: Date.now(),
        usuario: user.nombre_completo,
        texto: nuevoComentario,
        fecha: new Date().toISOString()
      };

      setSelectedPublicacion(prev => ({
        ...prev,
        comentarios: [...(prev.comentarios || []), comentario]
      }));

      setPublicaciones(prev => prev.map(p => {
        if (p.id === selectedPublicacion.id) {
          return {
            ...p,
            comentarios: [...(p.comentarios || []), comentario]
          };
        }
        return p;
      }));

      setNuevoComentario('');
    } catch (err) {
      console.error('Error al comentar:', err);
    }
  };

  const formatearFecha = (fecha) => {
    const ahora = new Date();
    const fechaPost = new Date(fecha);
    const diferencia = ahora - fechaPost;

    const minutos = Math.floor(diferencia / 60000);
    const horas = Math.floor(diferencia / 3600000);
    const dias = Math.floor(diferencia / 86400000);

    if (minutos < 1) return 'Ahora mismo';
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas}h`;
    if (dias < 7) return `Hace ${dias} días`;

    return fechaPost.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="comunidad-page">
      <header className="page-header">
        <h1>Comunidad</h1>
        <p className="subtitle">Comparte tu experiencia y conecta con otros</p>
      </header>

      {/* Crear publicación */}
      <div className="crear-post-card" onClick={() => setShowModal(true)}>
        <div className="crear-post-avatar">
          {user?.avatar ? (
            <img src={user.avatar} alt="" />
          ) : (
            <span>{user?.nombre_completo?.charAt(0) || 'U'}</span>
          )}
        </div>
        <div className="crear-post-input">
          <span>¿Qué quieres compartir hoy?</span>
        </div>
      </div>

      {/* Normas de la comunidad */}
      <div className="normas-banner">
        <span className="normas-icon">📋</span>
        <span>Recuerda mantener un ambiente respetuoso y de apoyo mutuo</span>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando publicaciones...</p>
        </div>
      ) : (
        <div className="feed">
          {publicaciones.length > 0 ? publicaciones.map(post => (
            <article key={post.id} className="publicacion-card">
              <div className="publicacion-header">
                <div className="publicacion-avatar">
                  {post.usuario.avatar ? (
                    <img src={post.usuario.avatar} alt="" />
                  ) : (
                    <span>{post.usuario.nombre?.charAt(0) || 'U'}</span>
                  )}
                </div>
                <div className="publicacion-info">
                  <span className="publicacion-nombre">{post.usuario.nombre}</span>
                  <span className="publicacion-fecha">{formatearFecha(post.fecha)}</span>
                </div>
              </div>

              <div className="publicacion-contenido">
                <p>{post.contenido}</p>
                {post.imagen && (
                  <img src={post.imagen} alt="" className="publicacion-imagen" />
                )}
              </div>

              <div className="publicacion-stats">
                <span>{post.likes} me gusta</span>
                <span>{post.comentarios?.length || 0} comentarios</span>
              </div>

              <div className="publicacion-acciones">
                <button
                  className={`btn-accion ${post.liked ? 'liked' : ''}`}
                  onClick={() => handleLike(post.id)}
                >
                  {post.liked ? '❤️' : '🤍'} Me gusta
                </button>
                <button
                  className="btn-accion"
                  onClick={() => setSelectedPublicacion(post)}
                >
                  💬 Comentar
                </button>
              </div>

              {/* Preview de comentarios */}
              {post.comentarios?.length > 0 && (
                <div className="comentarios-preview">
                  {post.comentarios.slice(0, 2).map(comentario => (
                    <div key={comentario.id} className="comentario-preview">
                      <span className="comentario-usuario">{comentario.usuario}</span>
                      <span className="comentario-texto">{comentario.texto}</span>
                    </div>
                  ))}
                  {post.comentarios.length > 2 && (
                    <button
                      className="ver-mas-comentarios"
                      onClick={() => setSelectedPublicacion(post)}
                    >
                      Ver los {post.comentarios.length} comentarios
                    </button>
                  )}
                </div>
              )}
            </article>
          )) : (
            <div className="empty-state">
              <p>No hay publicaciones aún</p>
              <p className="help-text">Sé el primero en compartir tu experiencia</p>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                Crear publicación
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal crear publicación */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Crear publicación</h2>
            <form onSubmit={handlePublicar}>
              <div className="form-group">
                <textarea
                  value={nuevaPublicacion.contenido}
                  onChange={e => setNuevaPublicacion({...nuevaPublicacion, contenido: e.target.value})}
                  placeholder="¿Qué quieres compartir?"
                  rows="5"
                  className="form-control"
                  maxLength={1000}
                  required
                />
                <span className="char-count">{nuevaPublicacion.contenido.length}/1000</span>
              </div>

              <div className="form-group">
                <label className="btn btn-outline btn-block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setNuevaPublicacion({...nuevaPublicacion, imagen: e.target.files[0]})}
                    hidden
                  />
                  📷 Agregar foto
                </label>
                {nuevaPublicacion.imagen && (
                  <div className="imagen-preview">
                    <img src={URL.createObjectURL(nuevaPublicacion.imagen)} alt="Preview" />
                    <button
                      type="button"
                      className="btn-remove-img"
                      onClick={() => setNuevaPublicacion({...nuevaPublicacion, imagen: null})}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!nuevaPublicacion.contenido.trim()}
                >
                  Publicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal ver publicación completa */}
      {selectedPublicacion && (
        <div className="modal-overlay" onClick={() => setSelectedPublicacion(null)}>
          <div className="modal-content modal-publicacion" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedPublicacion(null)}>×</button>

            <article className="publicacion-completa">
              <div className="publicacion-header">
                <div className="publicacion-avatar">
                  {selectedPublicacion.usuario.avatar ? (
                    <img src={selectedPublicacion.usuario.avatar} alt="" />
                  ) : (
                    <span>{selectedPublicacion.usuario.nombre?.charAt(0) || 'U'}</span>
                  )}
                </div>
                <div className="publicacion-info">
                  <span className="publicacion-nombre">{selectedPublicacion.usuario.nombre}</span>
                  <span className="publicacion-fecha">{formatearFecha(selectedPublicacion.fecha)}</span>
                </div>
              </div>

              <div className="publicacion-contenido">
                <p>{selectedPublicacion.contenido}</p>
                {selectedPublicacion.imagen && (
                  <img src={selectedPublicacion.imagen} alt="" className="publicacion-imagen" />
                )}
              </div>

              <div className="publicacion-acciones">
                <button
                  className={`btn-accion ${selectedPublicacion.liked ? 'liked' : ''}`}
                  onClick={() => handleLike(selectedPublicacion.id)}
                >
                  {selectedPublicacion.liked ? '❤️' : '🤍'} {selectedPublicacion.likes}
                </button>
              </div>

              <div className="comentarios-section">
                <h3>Comentarios</h3>

                <form className="comentario-form" onSubmit={handleComentar}>
                  <input
                    type="text"
                    value={nuevoComentario}
                    onChange={e => setNuevoComentario(e.target.value)}
                    placeholder="Escribe un comentario..."
                    className="form-control"
                  />
                  <button type="submit" className="btn btn-primary" disabled={!nuevoComentario.trim()}>
                    Enviar
                  </button>
                </form>

                <div className="comentarios-list">
                  {selectedPublicacion.comentarios?.map(comentario => (
                    <div key={comentario.id} className="comentario">
                      <div className="comentario-header">
                        <span className="comentario-usuario">{comentario.usuario}</span>
                        <span className="comentario-fecha">{formatearFecha(comentario.fecha)}</span>
                      </div>
                      <p className="comentario-texto">{comentario.texto}</p>
                    </div>
                  ))}

                  {(!selectedPublicacion.comentarios || selectedPublicacion.comentarios.length === 0) && (
                    <p className="no-comentarios">No hay comentarios aún. ¡Sé el primero!</p>
                  )}
                </div>
              </div>
            </article>
          </div>
        </div>
      )}

      {/* Panel de Accesibilidad */}
      <AccessibilityPanel />

      {/* FAB de Accesibilidad */}
      <AccessibilityFAB />
    </div>
  );
};

export default Comunidad;
