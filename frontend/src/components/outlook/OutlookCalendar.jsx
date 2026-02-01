import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './OutlookCalendar.css';

const OutlookCalendar = ({ isConnected }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (isConnected) {
      loadEvents();
    }
  }, [isConnected, selectedDate]);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      // Obtener eventos de la semana actual
      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(selectedDate);
      endDate.setDate(endDate.getDate() + 7);
      endDate.setHours(23, 59, 59, 999);

      const response = await api.get('/outlook/events', {
        params: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        }
      });

      setEvents(response.data || []);
    } catch (err) {
      console.error('Error loading Outlook events:', err);
      setError('Error al cargar eventos de Outlook');
    } finally {
      setLoading(false);
    }
  };

  const formatEventTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  };

  const formatEventDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const groupEventsByDate = (events) => {
    const grouped = {};
    events.forEach(event => {
      // El backend devuelve 'inicio' en español
      const eventStart = event.inicio || event.start?.dateTime || event.start;
      if (!eventStart) return;

      const date = new Date(eventStart).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(event);
    });
    return grouped;
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setSelectedDate(newDate);
  };

  if (!isConnected) {
    return null;
  }

  const groupedEvents = groupEventsByDate(events);

  return (
    <div className="outlook-calendar">
      <div className="outlook-calendar-header">
        <h3>Calendario de Outlook</h3>
        <div className="calendar-navigation">
          <button onClick={() => navigateWeek(-1)} className="nav-btn">
            &lt; Anterior
          </button>
          <span className="current-week">
            {selectedDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => navigateWeek(1)} className="nav-btn">
            Siguiente &gt;
          </button>
        </div>
        <button onClick={loadEvents} className="refresh-btn" disabled={loading}>
          {loading ? 'Cargando...' : 'Actualizar'}
        </button>
      </div>

      {error && (
        <div className="outlook-calendar-error">
          {error}
          <button onClick={loadEvents}>Reintentar</button>
        </div>
      )}

      {loading ? (
        <div className="outlook-calendar-loading">
          <div className="spinner-small"></div>
          <span>Cargando eventos...</span>
        </div>
      ) : events.length === 0 ? (
        <div className="outlook-calendar-empty">
          <span className="empty-icon">📅</span>
          <p>No hay eventos en esta semana</p>
        </div>
      ) : (
        <div className="outlook-events-list">
          {Object.entries(groupedEvents).map(([date, dayEvents]) => (
            <div key={date} className="events-day-group">
              <div className="events-day-header">
                {formatEventDate(date)}
              </div>
              <div className="events-day-items">
                {dayEvents.map((event, idx) => {
                  // Manejar campos en español del backend
                  const eventStart = event.inicio || event.start?.dateTime || event.start;
                  const eventEnd = event.fin || event.end?.dateTime || event.end;
                  const eventTitle = event.titulo || event.subject || 'Sin título';
                  const eventLocation = event.ubicacion || event.location?.displayName;
                  const isOnline = event.es_virtual || event.isOnlineMeeting;
                  const joinUrl = event.link_reunion || event.onlineMeeting?.joinUrl;

                  return (
                    <div key={event.id || idx} className="outlook-event-item">
                      <div className="event-time">
                        {event.isAllDay ? (
                          <span className="all-day">Todo el día</span>
                        ) : (
                          <>
                            <span>{formatEventTime(eventStart)}</span>
                            <span className="time-separator">-</span>
                            <span>{formatEventTime(eventEnd)}</span>
                          </>
                        )}
                      </div>
                      <div className="event-details">
                        <h4 className="event-subject">{eventTitle}</h4>
                        {eventLocation && (
                          <p className="event-location">
                            <span className="location-icon">📍</span>
                            {eventLocation}
                          </p>
                        )}
                        {isOnline && (
                          <span className="online-meeting-badge">
                            💻 Reunión en línea
                          </span>
                        )}
                      </div>
                      {joinUrl && (
                        <a
                          href={joinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="join-meeting-btn"
                        >
                          Unirse
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OutlookCalendar;
