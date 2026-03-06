import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LucideIcon from '../LucideIcon';
import './CatalogoRecetas.css';

const TIPOS_COMIDA = [
  { id: 1, nombre: 'desayuno', label: 'Desayuno', icon: 'sunrise', color: '#E91E63' },
  { id: 2, nombre: 'colacion_matutina', label: 'Colación 1', icon: 'apple', color: '#9C27B0' },
  { id: 3, nombre: 'comida', label: 'Comida', icon: 'utensils', color: '#5C6BC0' },
  { id: 4, nombre: 'colacion_vespertina', label: 'Colación 2', icon: 'cookie', color: '#FF7043' },
  { id: 5, nombre: 'cena', label: 'Cena', icon: 'moon', color: '#FF9800' },
];

const CatalogoRecetas = ({ onBack, onSelectReceta, selectionMode = false }) => {
  const [recetas, setRecetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingReceta, setEditingReceta] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(null);

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    tipo_comida_id: '',
    tiempo_preparacion: '',
    porciones: 1,
    calorias: '',
    proteinas: '',
    carbohidratos: '',
    grasas: '',
    fibra: '',
    ingredientes: [{ nombre: '', cantidad: '', unidad: '' }],
    instrucciones: [''],
    imagen: null,
    imagenPreview: null,
  });

  useEffect(() => {
    loadRecetas();
  }, [filtroTipo]);

  const loadRecetas = async () => {
    setLoading(true);
    try {
      let url = '/nutricion/recetas/catalogo';
      const params = [];
      if (filtroTipo) params.push(`tipo_comida_id=${filtroTipo}`);
      if (busqueda) params.push(`search=${encodeURIComponent(busqueda)}`);
      if (params.length) url += '?' + params.join('&');

      const res = await api.get(url);
      setRecetas(res.data?.recetas || []);
    } catch (err) {
      console.error('Error cargando recetas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadRecetas();
  };

  const resetForm = () => {
    setForm({
      titulo: '', descripcion: '', tipo_comida_id: '', tiempo_preparacion: '',
      porciones: 1, calorias: '', proteinas: '', carbohidratos: '', grasas: '', fibra: '',
      ingredientes: [{ nombre: '', cantidad: '', unidad: '' }],
      instrucciones: [''],
      imagen: null, imagenPreview: null,
    });
    setEditingReceta(null);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (receta) => {
    setEditingReceta(receta);
    setForm({
      titulo: receta.titulo || '',
      descripcion: receta.descripcion || '',
      tipo_comida_id: receta.tipo_comida_id || '',
      tiempo_preparacion: receta.tiempo_preparacion || '',
      porciones: receta.porciones || 1,
      calorias: receta.calorias || '',
      proteinas: receta.proteinas || '',
      carbohidratos: receta.carbohidratos || '',
      grasas: receta.grasas || '',
      fibra: receta.fibra || '',
      ingredientes: receta.ingredientes?.length > 0
        ? receta.ingredientes.map(i => typeof i === 'string' ? { nombre: i, cantidad: '', unidad: '' } : i)
        : [{ nombre: '', cantidad: '', unidad: '' }],
      instrucciones: receta.instrucciones?.length > 0
        ? receta.instrucciones
        : [''],
      imagen: null,
      imagenPreview: receta.imagen_url || null,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.titulo.trim()) {
      alert('El título es requerido');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('titulo', form.titulo);
      formData.append('descripcion', form.descripcion);
      formData.append('tipo_comida_id', form.tipo_comida_id);
      formData.append('tiempo_preparacion', form.tiempo_preparacion);
      formData.append('porciones', form.porciones);
      formData.append('calorias', form.calorias);
      formData.append('proteinas', form.proteinas);
      formData.append('carbohidratos', form.carbohidratos);
      formData.append('grasas', form.grasas);
      formData.append('fibra', form.fibra);
      formData.append('ingredientes', JSON.stringify(form.ingredientes
        .map(i => typeof i === 'string' ? { nombre: i, cantidad: '', unidad: '' } : i)
        .filter(i => i.nombre?.trim())));
      formData.append('instrucciones', JSON.stringify(form.instrucciones.filter(i => i.trim())));

      if (form.imagen) {
        formData.append('imagen', form.imagen);
      }

      if (editingReceta) {
        await api.post(`/nutricion/recetas/catalogo/${editingReceta.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data', 'X-HTTP-Method-Override': 'PUT' }
        });
      } else {
        await api.post('/nutricion/recetas/catalogo', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setShowModal(false);
      resetForm();
      loadRecetas();
    } catch (err) {
      console.error('Error guardando receta:', err);
      alert('Error al guardar la receta');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta receta del catálogo?')) return;
    try {
      await api.delete(`/nutricion/recetas/catalogo/${id}`);
      loadRecetas();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, imagen: file, imagenPreview: URL.createObjectURL(file) });
    }
  };

  // Ingredientes dinámicos
  const addIngrediente = () => {
    setForm({ ...form, ingredientes: [...form.ingredientes, { nombre: '', cantidad: '', unidad: '' }] });
  };
  const removeIngrediente = (idx) => {
    setForm({ ...form, ingredientes: form.ingredientes.filter((_, i) => i !== idx) });
  };
  const updateIngrediente = (idx, field, value) => {
    const updated = [...form.ingredientes];
    // Normalizar si es string
    if (typeof updated[idx] === 'string') {
      updated[idx] = { nombre: updated[idx], cantidad: '', unidad: '' };
    }
    updated[idx][field] = value;
    setForm({ ...form, ingredientes: updated });
  };

  // Instrucciones dinámicas
  const addInstruccion = () => {
    setForm({ ...form, instrucciones: [...form.instrucciones, ''] });
  };
  const removeInstruccion = (idx) => {
    setForm({ ...form, instrucciones: form.instrucciones.filter((_, i) => i !== idx) });
  };
  const updateInstruccion = (idx, value) => {
    const updated = [...form.instrucciones];
    updated[idx] = value;
    setForm({ ...form, instrucciones: updated });
  };

  const getTipoInfo = (tipoComidaId) => {
    return TIPOS_COMIDA.find(t => t.id === Number(tipoComidaId)) || { label: 'General', icon: 'utensils', color: '#78909C' };
  };

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  return (
    <div className="cat-recetas">
      {/* Header */}
      <div className="cat-recetas-header">
        <button className="back-btn" onClick={onBack}>← Volver</button>
        <h2><LucideIcon name="book-open" size={22} /> Catálogo de Recetas</h2>
        {!selectionMode && (
          <button className="btn-nueva-receta" onClick={openCreate}>
            <LucideIcon name="plus" size={16} /> Nueva Receta
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="cat-recetas-filtros">
        <div className="tipo-chips">
          <button
            className={`chip ${!filtroTipo ? 'active' : ''}`}
            onClick={() => setFiltroTipo(null)}
          >
            Todas
          </button>
          {TIPOS_COMIDA.map(tipo => (
            <button
              key={tipo.id}
              className={`chip ${filtroTipo === tipo.id ? 'active' : ''}`}
              style={filtroTipo === tipo.id ? { background: tipo.color, borderColor: tipo.color } : {}}
              onClick={() => setFiltroTipo(tipo.id)}
            >
              <LucideIcon name={tipo.icon} size={14} /> {tipo.label}
            </button>
          ))}
        </div>
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Buscar receta..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <button type="submit"><LucideIcon name="search" size={16} /></button>
        </form>
      </div>

      {/* Grid de recetas */}
      {loading ? (
        <div className="cat-recetas-loading">
          <div className="loading-spinner"></div>
          <p>Cargando catálogo...</p>
        </div>
      ) : recetas.length === 0 ? (
        <div className="cat-recetas-empty">
          <LucideIcon name="book-open" size={48} />
          <h3>Sin recetas en el catálogo</h3>
          <p>Agrega recetas para usarlas en tus planes nutricionales.</p>
          <button className="btn-primary" onClick={openCreate}>
            <LucideIcon name="plus" size={16} /> Crear Primera Receta
          </button>
        </div>
      ) : (
        <div className="cat-recetas-grid">
          {recetas.map(receta => {
            const tipoInfo = getTipoInfo(receta.tipo_comida_id);
            return (
              <div
                key={receta.id}
                className={`receta-card ${selectionMode ? 'selectable' : ''}`}
                onClick={selectionMode ? () => onSelectReceta(receta) : undefined}
              >
                <div className="receta-card-img">
                  {receta.imagen_url ? (
                    <img src={`${apiUrl}${receta.imagen_url}`} alt={receta.titulo} />
                  ) : (
                    <div className="receta-card-placeholder" style={{ background: tipoInfo.color + '20' }}>
                      <LucideIcon name={tipoInfo.icon} size={32} />
                    </div>
                  )}
                  <span className="tipo-badge" style={{ background: tipoInfo.color }}>
                    {tipoInfo.label}
                  </span>
                </div>
                <div className="receta-card-body">
                  <h3>{receta.titulo}</h3>
                  {receta.descripcion && (
                    <p className="receta-desc">{receta.descripcion.length > 80 ? receta.descripcion.substring(0, 80) + '...' : receta.descripcion}</p>
                  )}
                  <div className="receta-macros">
                    {receta.calorias > 0 && <span className="macro cal"><LucideIcon name="flame" size={12} /> {Math.round(receta.calorias)} kcal</span>}
                    {receta.proteinas > 0 && <span className="macro prot"><LucideIcon name="beef" size={12} /> {receta.proteinas}g</span>}
                    {receta.carbohidratos > 0 && <span className="macro carb"><LucideIcon name="wheat" size={12} /> {receta.carbohidratos}g</span>}
                    {receta.grasas > 0 && <span className="macro fat"><LucideIcon name="droplet" size={12} /> {receta.grasas}g</span>}
                  </div>
                  {receta.tiempo_preparacion > 0 && (
                    <span className="receta-tiempo"><LucideIcon name="clock" size={12} /> {receta.tiempo_preparacion} min</span>
                  )}
                </div>
                {!selectionMode && (
                  <div className="receta-card-actions">
                    <button className="btn-icon" onClick={() => setShowDetailModal(receta)} title="Ver detalle">
                      <LucideIcon name="eye" size={16} />
                    </button>
                    <button className="btn-icon" onClick={() => openEdit(receta)} title="Editar">
                      <LucideIcon name="pen-line" size={16} />
                    </button>
                    <button className="btn-icon delete" onClick={() => handleDelete(receta.id)} title="Eliminar">
                      <LucideIcon name="trash" size={16} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de detalle */}
      {showDetailModal && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(null)}>
          <div className="modal-content receta-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{showDetailModal.titulo}</h2>
              <button className="modal-close" onClick={() => setShowDetailModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              {showDetailModal.imagen_url && (
                <img
                  src={`${apiUrl}${showDetailModal.imagen_url}`}
                  alt={showDetailModal.titulo}
                  className="detail-image"
                />
              )}
              {showDetailModal.descripcion && <p className="detail-desc">{showDetailModal.descripcion}</p>}

              <div className="detail-macros-grid">
                <div className="detail-macro"><LucideIcon name="flame" size={16} /><span>{Math.round(showDetailModal.calorias || 0)}</span><small>kcal</small></div>
                <div className="detail-macro"><LucideIcon name="beef" size={16} /><span>{showDetailModal.proteinas || 0}g</span><small>Prot</small></div>
                <div className="detail-macro"><LucideIcon name="wheat" size={16} /><span>{showDetailModal.carbohidratos || 0}g</span><small>Carbs</small></div>
                <div className="detail-macro"><LucideIcon name="droplet" size={16} /><span>{showDetailModal.grasas || 0}g</span><small>Grasas</small></div>
              </div>

              {showDetailModal.ingredientes?.length > 0 && (
                <div className="detail-section">
                  <h3><LucideIcon name="list" size={18} /> Ingredientes</h3>
                  <ul className="detail-ingredients">
                    {showDetailModal.ingredientes.map((ing, i) => (
                      <li key={i}>
                        <span className="ing-qty">{ing.cantidad} {ing.unidad}</span>
                        <span className="ing-name">{ing.nombre}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {showDetailModal.instrucciones?.length > 0 && (
                <div className="detail-section">
                  <h3><LucideIcon name="chef-hat" size={18} /> Preparación</h3>
                  <ol className="detail-steps">
                    {showDetailModal.instrucciones.map((step, i) => (
                      <li key={i}>{typeof step === 'string' ? step : step.paso || step.descripcion || ''}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDetailModal(null)}>Cerrar</button>
              <button className="btn-primary" onClick={() => { openEdit(showDetailModal); setShowDetailModal(null); }}>
                <LucideIcon name="pen-line" size={14} /> Editar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal crear/editar */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content receta-form-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingReceta ? 'Editar Receta' : 'Nueva Receta'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {/* Info básica */}
              <div className="form-row">
                <div className="form-group flex-2">
                  <label>Nombre de la receta *</label>
                  <input
                    type="text" className="form-input"
                    value={form.titulo}
                    onChange={e => setForm({ ...form, titulo: e.target.value })}
                    placeholder="Ej: Avena con frutos rojos"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Tipo de comida</label>
                  <select className="form-input" value={form.tipo_comida_id} onChange={e => setForm({ ...form, tipo_comida_id: e.target.value })}>
                    <option value="">Seleccionar</option>
                    {TIPOS_COMIDA.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  className="form-input form-textarea" rows="2"
                  value={form.descripcion}
                  onChange={e => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Descripción breve de la receta..."
                />
              </div>

              {/* Imagen */}
              <div className="form-group">
                <label>Foto de la receta</label>
                <div className="img-upload-area">
                  {form.imagenPreview ? (
                    <div className="img-preview">
                      <img src={form.imagenPreview} alt="preview" />
                      <button className="btn-remove-img" onClick={() => setForm({ ...form, imagen: null, imagenPreview: null })}>✕</button>
                    </div>
                  ) : (
                    <label className="img-upload-label" htmlFor="receta-img-input">
                      <LucideIcon name="camera" size={24} />
                      <span>Agregar foto</span>
                    </label>
                  )}
                  <input
                    type="file" id="receta-img-input" accept="image/*"
                    onChange={handleImageChange} style={{ display: 'none' }}
                  />
                </div>
              </div>

              {/* Macros */}
              <div className="form-section-title">Información Nutricional (por porción)</div>
              <div className="macros-grid">
                <div className="form-group">
                  <label>Calorías</label>
                  <input type="number" className="form-input" value={form.calorias} onChange={e => setForm({ ...form, calorias: e.target.value })} placeholder="kcal" />
                </div>
                <div className="form-group">
                  <label>Proteínas (g)</label>
                  <input type="number" className="form-input" value={form.proteinas} onChange={e => setForm({ ...form, proteinas: e.target.value })} placeholder="g" />
                </div>
                <div className="form-group">
                  <label>Carbohidratos (g)</label>
                  <input type="number" className="form-input" value={form.carbohidratos} onChange={e => setForm({ ...form, carbohidratos: e.target.value })} placeholder="g" />
                </div>
                <div className="form-group">
                  <label>Grasas (g)</label>
                  <input type="number" className="form-input" value={form.grasas} onChange={e => setForm({ ...form, grasas: e.target.value })} placeholder="g" />
                </div>
                <div className="form-group">
                  <label>Fibra (g)</label>
                  <input type="number" className="form-input" value={form.fibra} onChange={e => setForm({ ...form, fibra: e.target.value })} placeholder="g" />
                </div>
                <div className="form-group">
                  <label>Tiempo (min)</label>
                  <input type="number" className="form-input" value={form.tiempo_preparacion} onChange={e => setForm({ ...form, tiempo_preparacion: e.target.value })} placeholder="min" />
                </div>
              </div>

              {/* Ingredientes */}
              <div className="form-section-title">
                Ingredientes
                <button className="btn-add-inline" onClick={addIngrediente}><LucideIcon name="plus" size={14} /> Agregar</button>
              </div>
              <div className="ingredientes-form-list">
                {form.ingredientes.map((ing, idx) => (
                  <div key={idx} className="ingrediente-row">
                    <input
                      type="text" className="form-input" placeholder="Ingrediente"
                      value={ing.nombre}
                      onChange={e => updateIngrediente(idx, 'nombre', e.target.value)}
                    />
                    <input
                      type="text" className="form-input small" placeholder="Cant"
                      value={ing.cantidad}
                      onChange={e => updateIngrediente(idx, 'cantidad', e.target.value)}
                    />
                    <input
                      type="text" className="form-input small" placeholder="Unidad"
                      value={ing.unidad}
                      onChange={e => updateIngrediente(idx, 'unidad', e.target.value)}
                    />
                    {form.ingredientes.length > 1 && (
                      <button className="btn-remove-row" onClick={() => removeIngrediente(idx)}>✕</button>
                    )}
                  </div>
                ))}
              </div>

              {/* Instrucciones */}
              <div className="form-section-title">
                Preparación
                <button className="btn-add-inline" onClick={addInstruccion}><LucideIcon name="plus" size={14} /> Agregar paso</button>
              </div>
              <div className="instrucciones-form-list">
                {form.instrucciones.map((paso, idx) => (
                  <div key={idx} className="instruccion-row">
                    <span className="paso-num">{idx + 1}.</span>
                    <textarea
                      className="form-input form-textarea" rows="2"
                      placeholder={`Paso ${idx + 1}...`}
                      value={typeof paso === 'string' ? paso : paso.descripcion || ''}
                      onChange={e => updateInstruccion(idx, e.target.value)}
                    />
                    {form.instrucciones.length > 1 && (
                      <button className="btn-remove-row" onClick={() => removeInstruccion(idx)}>✕</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleSave}>
                {editingReceta ? 'Guardar Cambios' : 'Crear Receta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogoRecetas;
