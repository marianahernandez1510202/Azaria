import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/Blog.css';

const Blog = () => {
  const { user } = useAuth();
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [areaSeleccionada, setAreaSeleccionada] = useState('todas');
  const [articuloActivo, setArticuloActivo] = useState(null);
  const [nuevoComentario, setNuevoComentario] = useState('');

  const areas = [
    { id: 'todas', nombre: 'Todos', icon: '📰' },
    { id: 'fisioterapia', nombre: 'Fisioterapia', icon: '🏃' },
    { id: 'nutricion', nombre: 'Nutrición', icon: '🥗' },
    { id: 'medicina', nombre: 'Medicina', icon: '💊' },
    { id: 'neuropsicologia', nombre: 'Neuropsicología', icon: '🧠' },
    { id: 'ortesis', nombre: 'Órtesis', icon: '🦿' }
  ];

  useEffect(() => {
    cargarArticulos();
  }, [areaSeleccionada]);

  const cargarArticulos = async () => {
    setLoading(true);
    try {
      const params = areaSeleccionada !== 'todas' ? `?area=${areaSeleccionada}` : '';
      const response = await api.get(`/blog/articulos${params}`);
      setArticulos(response.data || getArticulosDefault());
    } catch (err) {
      console.error('Error al cargar artículos:', err);
      setArticulos(getArticulosDefault());
    } finally {
      setLoading(false);
    }
  };

  const getArticulosDefault = () => [
    {
      id: 1,
      titulo: '5 ejercicios esenciales para fortalecer el muñón',
      extracto: 'Descubre los ejercicios fundamentales que te ayudarán a preparar tu muñón para el uso de la prótesis.',
      contenido: `El fortalecimiento del muñón es crucial para el éxito en el uso de una prótesis. Aquí te presentamos 5 ejercicios que puedes realizar en casa:

1. **Contracciones isométricas**: Aprieta los músculos del muñón durante 5 segundos, relaja por 5 segundos. Repite 10 veces.

2. **Elevaciones laterales**: Acostado de lado, eleva el muñón hacia el techo. 3 series de 10 repeticiones.

3. **Extensiones de cadera**: En posición boca abajo, eleva el muñón hacia atrás. Mantén 3 segundos. 3 series de 10.

4. **Círculos con el muñón**: Realiza círculos pequeños en el aire. 10 en cada dirección.

5. **Resistencia con banda elástica**: Coloca una banda alrededor del muñón y realiza movimientos de extensión.

**Importante**: Realiza estos ejercicios solo después de que tu herida haya sanado completamente y con la aprobación de tu fisioterapeuta.`,
      area: 'fisioterapia',
      autor: 'Dra. María González',
      fecha: '2024-01-15',
      imagen: null,
      likes: 45,
      comentarios: [
        { id: 1, usuario: 'Juan P.', texto: 'Muy útiles estos ejercicios, gracias!', fecha: '2024-01-16' }
      ]
    },
    {
      id: 2,
      titulo: 'Alimentación para una mejor cicatrización',
      extracto: 'Conoce los nutrientes esenciales que aceleran la recuperación y fortalecen tu sistema inmune.',
      contenido: `Una buena alimentación es fundamental para una recuperación exitosa. Estos son los nutrientes que debes priorizar:

**Proteínas**: Fundamentales para la regeneración de tejidos.
- Pollo, pescado, huevos
- Legumbres (frijoles, lentejas)
- Lácteos bajos en grasa

**Vitamina C**: Esencial para la síntesis de colágeno.
- Cítricos (naranja, limón)
- Guayaba, kiwi
- Pimientos

**Zinc**: Acelera la cicatrización.
- Carnes rojas magras
- Semillas de calabaza
- Garbanzos

**Vitamina A**: Protege contra infecciones.
- Zanahoria, calabaza
- Espinacas
- Hígado

**Hidratación**: Bebe al menos 8 vasos de agua al día.

**Evita**:
- Azúcares refinados
- Alimentos procesados
- Alcohol`,
      area: 'nutricion',
      autor: 'Lic. Carlos Ramírez',
      fecha: '2024-01-10',
      imagen: null,
      likes: 62,
      comentarios: []
    },
    {
      id: 3,
      titulo: 'Manejando la ansiedad post-operatoria',
      extracto: 'Estrategias prácticas para sobrellevar los momentos difíciles durante tu proceso de recuperación.',
      contenido: `Es completamente normal sentir ansiedad después de una amputación o durante el proceso de adaptación a una prótesis. Aquí te compartimos estrategias que pueden ayudarte:

**Técnicas de respiración**
La respiración 4-7-8 es muy efectiva: inhala por 4 segundos, mantén por 7, exhala por 8.

**Mindfulness**
Practica estar en el presente. Cuando notes que tu mente divaga hacia preocupaciones, gentilmente regresa tu atención al momento actual.

**Grupos de apoyo**
Conectar con personas que han pasado por experiencias similares puede ser muy reconfortante.

**Comunicación abierta**
Habla con tus seres queridos sobre cómo te sientes. No tienes que enfrentar esto solo.

**Actividad física**
El ejercicio, dentro de tus posibilidades, libera endorfinas que mejoran el estado de ánimo.

**Busca ayuda profesional**
Si la ansiedad persiste o interfiere con tu vida diaria, no dudes en contactar a un profesional de salud mental.

Recuerda: pedir ayuda es una señal de fortaleza, no de debilidad.`,
      area: 'neuropsicologia',
      autor: 'Psic. Ana Martínez',
      fecha: '2024-01-08',
      imagen: null,
      likes: 89,
      comentarios: []
    },
    {
      id: 4,
      titulo: 'Cuidados básicos de tu prótesis',
      extracto: 'Guía completa para mantener tu prótesis en óptimas condiciones y prolongar su vida útil.',
      contenido: `El cuidado adecuado de tu prótesis es esencial para su funcionamiento y durabilidad.

**Limpieza diaria del socket**
- Limpia el interior con un paño húmedo cada noche
- Usa jabón suave una vez por semana
- Deja secar completamente antes de guardar

**Cuidado del liner**
- Lava a mano con agua tibia y jabón neutro
- Enjuaga bien para eliminar residuos de jabón
- Seca con toalla limpia, nunca uses secadora
- Revisa regularmente por desgaste o grietas

**Almacenamiento**
- Guarda en un lugar seco y fresco
- Evita la exposición directa al sol
- No dejes en el auto en días calurosos

**Señales de alerta**
Contacta a tu técnico si notas:
- Ruidos inusuales
- Holgura o ajuste inadecuado
- Partes dañadas o desgastadas
- Cambios en la alineación

**Mantenimiento profesional**
Programa revisiones cada 6 meses o según indique tu especialista.`,
      area: 'ortesis',
      autor: 'Téc. Roberto Sánchez',
      fecha: '2024-01-05',
      imagen: null,
      likes: 73,
      comentarios: []
    }
  ];

  const handleLike = async (articuloId) => {
    try {
      await api.post(`/blog/articulos/${articuloId}/like`);
      setArticulos(prev => prev.map(a =>
        a.id === articuloId ? { ...a, likes: a.likes + 1 } : a
      ));
      if (articuloActivo?.id === articuloId) {
        setArticuloActivo(prev => ({ ...prev, likes: prev.likes + 1 }));
      }
    } catch (err) {
      console.error('Error al dar like:', err);
    }
  };

  const handleComentar = async (e) => {
    e.preventDefault();
    if (!nuevoComentario.trim() || !articuloActivo) return;

    try {
      await api.post(`/blog/articulos/${articuloActivo.id}/comentarios`, {
        usuario_id: user.id,
        texto: nuevoComentario
      });

      const nuevoComentarioObj = {
        id: Date.now(),
        usuario: user.nombre_completo,
        texto: nuevoComentario,
        fecha: new Date().toISOString()
      };

      setArticuloActivo(prev => ({
        ...prev,
        comentarios: [...(prev.comentarios || []), nuevoComentarioObj]
      }));

      setNuevoComentario('');
    } catch (err) {
      console.error('Error al comentar:', err);
    }
  };

  const getAreaInfo = (areaId) => {
    return areas.find(a => a.id === areaId) || areas[0];
  };

  return (
    <div className="blog-page">
      <header className="page-header">
        <h1>Blog de Salud</h1>
        <p className="subtitle">Artículos educativos de nuestros especialistas</p>
      </header>

      {/* Filtro por área */}
      <div className="areas-filter">
        {areas.map(area => (
          <button
            key={area.id}
            className={`area-btn ${areaSeleccionada === area.id ? 'active' : ''}`}
            onClick={() => setAreaSeleccionada(area.id)}
          >
            <span className="area-icon">{area.icon}</span>
            <span className="area-nombre">{area.nombre}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando artículos...</p>
        </div>
      ) : (
        <div className="articulos-grid">
          {articulos.length > 0 ? articulos.map(articulo => {
            const area = getAreaInfo(articulo.area);
            return (
              <article
                key={articulo.id}
                className="articulo-card"
                onClick={() => setArticuloActivo(articulo)}
              >
                {articulo.imagen && (
                  <div className="articulo-imagen">
                    <img src={articulo.imagen} alt={articulo.titulo} />
                  </div>
                )}
                <div className="articulo-content">
                  <span className="articulo-area">
                    {area.icon} {area.nombre}
                  </span>
                  <h2>{articulo.titulo}</h2>
                  <p className="articulo-extracto">{articulo.extracto}</p>
                  <div className="articulo-meta">
                    <span className="articulo-autor">{articulo.autor}</span>
                    <span className="articulo-fecha">
                      {new Date(articulo.fecha).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="articulo-stats">
                    <span className="stat-likes">❤️ {articulo.likes}</span>
                    <span className="stat-comments">💬 {articulo.comentarios?.length || 0}</span>
                  </div>
                </div>
              </article>
            );
          }) : (
            <div className="empty-state">
              <p>No hay artículos disponibles</p>
            </div>
          )}
        </div>
      )}

      {/* Modal de artículo */}
      {articuloActivo && (
        <div className="modal-overlay" onClick={() => setArticuloActivo(null)}>
          <div className="modal-content modal-articulo" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setArticuloActivo(null)}>×</button>

            <article className="articulo-completo">
              <header className="articulo-header">
                <span className="articulo-area">
                  {getAreaInfo(articuloActivo.area).icon} {getAreaInfo(articuloActivo.area).nombre}
                </span>
                <h1>{articuloActivo.titulo}</h1>
                <div className="articulo-meta">
                  <span className="articulo-autor">Por {articuloActivo.autor}</span>
                  <span className="articulo-fecha">
                    {new Date(articuloActivo.fecha).toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </header>

              {articuloActivo.imagen && (
                <img src={articuloActivo.imagen} alt="" className="articulo-imagen-principal" />
              )}

              <div className="articulo-body">
                {articuloActivo.contenido.split('\n').map((parrafo, i) => (
                  <p key={i}>{parrafo}</p>
                ))}
              </div>

              <div className="articulo-acciones">
                <button
                  className="btn btn-like"
                  onClick={() => handleLike(articuloActivo.id)}
                >
                  ❤️ Me gusta ({articuloActivo.likes})
                </button>
              </div>

              <div className="comentarios-section">
                <h3>Comentarios ({articuloActivo.comentarios?.length || 0})</h3>

                <form className="comentario-form" onSubmit={handleComentar}>
                  <textarea
                    value={nuevoComentario}
                    onChange={e => setNuevoComentario(e.target.value)}
                    placeholder="Escribe un comentario..."
                    rows="2"
                  />
                  <button type="submit" className="btn btn-primary" disabled={!nuevoComentario.trim()}>
                    Comentar
                  </button>
                </form>

                <div className="comentarios-list">
                  {articuloActivo.comentarios?.map(comentario => (
                    <div key={comentario.id} className="comentario">
                      <div className="comentario-header">
                        <span className="comentario-usuario">{comentario.usuario}</span>
                        <span className="comentario-fecha">
                          {new Date(comentario.fecha).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="comentario-texto">{comentario.texto}</p>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;
