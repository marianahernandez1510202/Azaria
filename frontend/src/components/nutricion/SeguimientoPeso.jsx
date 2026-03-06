import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import LucideIcon from '../LucideIcon';
import api from '../../services/api';
import './SeguimientoPeso.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const SeguimientoPeso = ({ pacienteId, onBack }) => {
  const [mediciones, setMediciones] = useState([]);
  const [evolucion, setEvolucion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    peso: '', talla: '', circunferencia_cintura: '', circunferencia_cadera: '',
    fecha_medicion: new Date().toISOString().split('T')[0], notas: ''
  });

  useEffect(() => { cargarDatos(); }, [pacienteId]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [medRes, pesoRes] = await Promise.all([
        api.get(`/nutricion/antropometria/${pacienteId}`),
        api.get(`/nutricion/antropometria/${pacienteId}/peso`)
      ]);
      setMediciones(medRes.data?.mediciones || []);
      setEvolucion(pesoRes.data?.evolucion || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.peso || !formData.talla) {
      alert('El peso y la talla son obligatorios.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        peso: parseFloat(formData.peso),
        talla: parseFloat(formData.talla),
        fecha_medicion: formData.fecha_medicion,
        notas: formData.notas || null
      };
      if (formData.circunferencia_cintura) payload.circunferencia_cintura = parseFloat(formData.circunferencia_cintura);
      if (formData.circunferencia_cadera) payload.circunferencia_cadera = parseFloat(formData.circunferencia_cadera);

      await api.post(`/nutricion/antropometria/${pacienteId}`, payload);
      setFormData({ peso: '', talla: '', circunferencia_cintura: '', circunferencia_cadera: '', fecha_medicion: new Date().toISOString().split('T')[0], notas: '' });
      setShowForm(false);
      await cargarDatos();
    } catch (error) {
      console.error('Error registrando medicion:', error);
      alert('Error al registrar la medicion.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta medicion?')) return;
    try {
      await api.delete(`/nutricion/antropometria/medicion/${id}`);
      await cargarDatos();
    } catch (error) {
      console.error('Error eliminando:', error);
      alert('Error al eliminar.');
    }
  };

  const pesoActual = mediciones.length > 0 ? mediciones[0].peso : null;
  const pesoInicial = mediciones.length > 0 ? mediciones[mediciones.length - 1].peso : null;
  const variacion = pesoActual && pesoInicial ? (pesoActual - pesoInicial).toFixed(1) : null;
  const imcActual = mediciones.length > 0 ? mediciones[0].imc : null;

  const chartData = {
    labels: evolucion.map(e => new Date(e.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })),
    datasets: [{
      label: 'Peso (kg)',
      data: evolucion.map(e => e.peso),
      borderColor: '#4CAF50',
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      fill: true, tension: 0.3, pointRadius: 4, pointBackgroundColor: '#4CAF50',
    }]
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { mode: 'index' } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8B949E' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8B949E' } }
    }
  };

  if (loading) {
    return (
      <div className="seg-peso-loading">
        <div className="seg-peso-spinner"></div>
        <p>Cargando datos de peso...</p>
      </div>
    );
  }

  return (
    <div className="seg-peso-container">
      <div className="seg-peso-header">
        <div className="seg-peso-header-top">
          <button className="seg-peso-back-btn" onClick={onBack}><LucideIcon name="arrow-left" size={22} /></button>
          <div className="seg-peso-header-title">
            <LucideIcon name="chart-line" size={24} />
            <h2>Seguimiento de Peso</h2>
          </div>
        </div>
      </div>

      {/* Grafico */}
      {evolucion.length > 1 ? (
        <div className="seg-peso-chart-container">
          <h3 className="seg-peso-section-title"><LucideIcon name="trending-up" size={20} /> Evolucion del Peso</h3>
          <div className="seg-peso-chart-wrapper"><Line data={chartData} options={chartOptions} /></div>
        </div>
      ) : (
        <div className="seg-peso-chart-empty">
          <LucideIcon name="chart-line" size={40} />
          <p>Se necesitan al menos 2 mediciones para mostrar la grafica.</p>
        </div>
      )}

      {/* Stats */}
      <div className="seg-peso-stats">
        <div className="seg-peso-stat-card">
          <div className="seg-peso-stat-icon"><LucideIcon name="scale" size={22} /></div>
          <div className="seg-peso-stat-value">{pesoActual ? `${pesoActual} kg` : '--'}</div>
          <div className="seg-peso-stat-label">Peso actual</div>
        </div>
        <div className="seg-peso-stat-card">
          <div className="seg-peso-stat-icon"><LucideIcon name="target" size={22} /></div>
          <div className="seg-peso-stat-value">{pesoInicial ? `${pesoInicial} kg` : '--'}</div>
          <div className="seg-peso-stat-label">Peso inicial</div>
        </div>
        <div className="seg-peso-stat-card">
          <div className="seg-peso-stat-icon"><LucideIcon name="trending-up" size={22} /></div>
          <div className={`seg-peso-stat-value ${variacion > 0 ? 'positivo' : variacion < 0 ? 'negativo' : ''}`}>
            {variacion !== null ? `${variacion > 0 ? '+' : ''}${variacion} kg` : '--'}
          </div>
          <div className="seg-peso-stat-label">Variacion</div>
        </div>
        <div className="seg-peso-stat-card">
          <div className="seg-peso-stat-icon"><LucideIcon name="activity" size={22} /></div>
          <div className="seg-peso-stat-value">{imcActual ? parseFloat(imcActual).toFixed(1) : '--'}</div>
          <div className="seg-peso-stat-label">IMC actual</div>
        </div>
      </div>

      {/* Toggle form */}
      <div className="seg-peso-form-toggle">
        <button className="seg-peso-toggle-btn" onClick={() => setShowForm(!showForm)}>
          <LucideIcon name={showForm ? 'chevron-up' : 'plus'} size={20} />
          {showForm ? 'Ocultar formulario' : 'Registrar Medicion'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="seg-peso-form-card">
          <h3 className="seg-peso-section-title"><LucideIcon name="pencil" size={20} /> Registrar Medicion</h3>
          <form onSubmit={handleSubmit} className="seg-peso-form">
            <div className="seg-peso-form-row">
              <div className="seg-peso-form-group">
                <label>Peso (kg) <span className="required">*</span></label>
                <input type="number" name="peso" value={formData.peso} onChange={handleChange} placeholder="72.5" step="0.1" min="20" max="300" required />
              </div>
              <div className="seg-peso-form-group">
                <label>Talla (cm) <span className="required">*</span></label>
                <input type="number" name="talla" value={formData.talla} onChange={handleChange} placeholder="165" step="0.1" min="50" max="250" required />
              </div>
            </div>
            <div className="seg-peso-form-row">
              <div className="seg-peso-form-group">
                <label>Circ. cintura (cm)</label>
                <input type="number" name="circunferencia_cintura" value={formData.circunferencia_cintura} onChange={handleChange} placeholder="Opcional" step="0.1" />
              </div>
              <div className="seg-peso-form-group">
                <label>Circ. cadera (cm)</label>
                <input type="number" name="circunferencia_cadera" value={formData.circunferencia_cadera} onChange={handleChange} placeholder="Opcional" step="0.1" />
              </div>
            </div>
            <div className="seg-peso-form-row">
              <div className="seg-peso-form-group">
                <label>Fecha</label>
                <input type="date" name="fecha_medicion" value={formData.fecha_medicion} onChange={handleChange} max={new Date().toISOString().split('T')[0]} />
              </div>
            </div>
            <div className="seg-peso-form-group">
              <label>Notas</label>
              <textarea name="notas" value={formData.notas} onChange={handleChange} placeholder="Observaciones opcionales..." rows={3} />
            </div>
            <div className="seg-peso-form-actions">
              <button type="button" className="seg-peso-btn-cancel" onClick={() => setShowForm(false)}>Cancelar</button>
              <button type="submit" className="seg-peso-btn-submit" disabled={submitting}>
                {submitting ? 'Registrando...' : <><LucideIcon name="check" size={18} /> Registrar</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="seg-peso-historial">
        <h3 className="seg-peso-section-title"><LucideIcon name="clipboard" size={20} /> Historial de Mediciones</h3>
        {mediciones.length === 0 ? (
          <div className="seg-peso-empty-table">
            <LucideIcon name="scale" size={36} />
            <p>No hay mediciones registradas aun.</p>
          </div>
        ) : (
          <div className="seg-peso-table-wrapper">
            <table className="seg-peso-table">
              <thead>
                <tr><th>Fecha</th><th>Peso</th><th>Talla</th><th>IMC</th><th>Cintura</th><th>Cadera</th><th></th></tr>
              </thead>
              <tbody>
                {mediciones.map(m => (
                  <tr key={m.id}>
                    <td data-label="Fecha">{new Date(m.fecha_medicion).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td data-label="Peso">{m.peso} kg</td>
                    <td data-label="Talla">{m.talla} cm</td>
                    <td data-label="IMC">{m.imc ? parseFloat(m.imc).toFixed(1) : '--'}</td>
                    <td data-label="Cintura">{m.circunferencia_cintura ? `${m.circunferencia_cintura} cm` : '--'}</td>
                    <td data-label="Cadera">{m.circunferencia_cadera ? `${m.circunferencia_cadera} cm` : '--'}</td>
                    <td>
                      <button className="seg-peso-delete-btn" onClick={() => handleDelete(m.id)} title="Eliminar">
                        <LucideIcon name="trash" size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeguimientoPeso;
