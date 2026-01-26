import React from 'react';
import '../styles/ModuleIcon.css';

/**
 * ModuleIcon - Iconos visuales grandes para cada módulo
 * Diseñado para adultos mayores con iconos claros y descriptivos
 *
 * Usa Flaticon UIcons o emojis como fallback
 * Para usar Flaticon UIcons, agregar en index.html:
 * <link rel='stylesheet' href='https://cdn-uicons.flaticon.com/uicons-regular-rounded/css/uicons-regular-rounded.css'>
 */

// Mapeo de módulos a iconos
const MODULE_ICONS = {
  dashboard: {
    flaticon: 'fi-rr-home',
    emoji: '🏠',
    label: 'Inicio',
    color: '#2196F3'
  },
  nutricion: {
    flaticon: 'fi-rr-salad',
    emoji: '🥗',
    label: 'Nutrición',
    color: '#4CAF50'
  },
  fisioterapia: {
    flaticon: 'fi-rr-gym',
    emoji: '🏃',
    label: 'Ejercicios',
    color: '#FF9800'
  },
  medicina: {
    flaticon: 'fi-rr-medicine',
    emoji: '💊',
    label: 'Medicina',
    color: '#F44336'
  },
  neuropsicologia: {
    flaticon: 'fi-rr-brain',
    emoji: '🧠',
    label: 'Mente',
    color: '#9C27B0'
  },
  ortesis: {
    flaticon: 'fi-rr-band-aid',
    emoji: '🦿',
    label: 'Prótesis',
    color: '#00BCD4'
  },
  comunidad: {
    flaticon: 'fi-rr-users',
    emoji: '👥',
    label: 'Comunidad',
    color: '#E91E63'
  },
  citas: {
    flaticon: 'fi-rr-calendar',
    emoji: '📅',
    label: 'Citas',
    color: '#009688'
  },
  recordatorios: {
    flaticon: 'fi-rr-alarm-clock',
    emoji: '⏰',
    label: 'Recordatorios',
    color: '#FFC107'
  },
  blog: {
    flaticon: 'fi-rr-book-open-cover',
    emoji: '📚',
    label: 'Artículos',
    color: '#3F51B5'
  },
  perfil: {
    flaticon: 'fi-rr-user',
    emoji: '👤',
    label: 'Perfil',
    color: '#607D8B'
  },
  agua: {
    flaticon: 'fi-rr-glass',
    emoji: '💧',
    label: 'Agua',
    color: '#03A9F4'
  },
  peso: {
    flaticon: 'fi-rr-scale',
    emoji: '⚖️',
    label: 'Peso',
    color: '#795548'
  },
  glucosa: {
    flaticon: 'fi-rr-chart-line-up',
    emoji: '📊',
    label: 'Glucosa',
    color: '#F44336'
  },
  presion: {
    flaticon: 'fi-rr-heart',
    emoji: '❤️',
    label: 'Presión',
    color: '#E91E63'
  },
  chat: {
    flaticon: 'fi-rr-comment',
    emoji: '💬',
    label: 'Chat',
    color: '#00BCD4'
  },
  ayuda: {
    flaticon: 'fi-rr-interrogation',
    emoji: '❓',
    label: 'Ayuda',
    color: '#FF9800'
  },
  config: {
    flaticon: 'fi-rr-settings',
    emoji: '⚙️',
    label: 'Ajustes',
    color: '#607D8B'
  },
  notificacion: {
    flaticon: 'fi-rr-bell',
    emoji: '🔔',
    label: 'Alertas',
    color: '#FFC107'
  },
  exito: {
    flaticon: 'fi-rr-check-circle',
    emoji: '✅',
    label: 'Éxito',
    color: '#4CAF50'
  },
  error: {
    flaticon: 'fi-rr-cross-circle',
    emoji: '❌',
    label: 'Error',
    color: '#F44336'
  }
};

const ModuleIcon = ({
  module,
  size = 'md',
  showLabel = false,
  useEmoji = false,
  onClick,
  className = '',
  style = {}
}) => {
  const iconData = MODULE_ICONS[module] || MODULE_ICONS.dashboard;

  const sizeClasses = {
    sm: 'icon-sm',
    md: 'icon-md',
    lg: 'icon-lg',
    xl: 'icon-xl'
  };

  const handleClick = () => {
    if (onClick) onClick();
  };

  return (
    <div
      className={`module-icon-wrapper ${sizeClasses[size]} ${className} ${onClick ? 'clickable' : ''}`}
      style={{
        '--icon-color': iconData.color,
        '--icon-color-light': `${iconData.color}22`,
        ...style
      }}
      onClick={handleClick}
      role={onClick ? 'button' : 'img'}
      aria-label={iconData.label}
      tabIndex={onClick ? 0 : -1}
    >
      <div className="module-icon-circle">
        {useEmoji ? (
          <span className="module-icon-emoji">{iconData.emoji}</span>
        ) : (
          <>
            <i className={`fi ${iconData.flaticon} module-icon-flaticon`}></i>
            <span className="module-icon-emoji-fallback">{iconData.emoji}</span>
          </>
        )}
      </div>
      {showLabel && (
        <span className="module-icon-label">{iconData.label}</span>
      )}
    </div>
  );
};

// Componente para grid de módulos
export const ModuleGrid = ({ modules, onModuleClick, columns = 3 }) => {
  return (
    <div className={`module-grid module-grid-${columns}`}>
      {modules.map((mod) => (
        <div
          key={mod.id}
          className="module-grid-item"
          onClick={() => onModuleClick && onModuleClick(mod)}
        >
          <ModuleIcon
            module={mod.id}
            size="lg"
            showLabel={true}
            onClick={() => onModuleClick && onModuleClick(mod)}
          />
          {mod.badge && (
            <span className="module-badge">{mod.badge}</span>
          )}
        </div>
      ))}
    </div>
  );
};

// Componente de tarjeta de módulo completa
export const ModuleCard = ({
  module,
  title,
  description,
  onClick,
  badge,
  progress
}) => {
  const iconData = MODULE_ICONS[module] || MODULE_ICONS.dashboard;

  return (
    <div
      className="module-card-full"
      style={{ '--card-color': iconData.color }}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div className="module-card-header">
        <ModuleIcon module={module} size="lg" />
        {badge && <span className="module-card-badge">{badge}</span>}
      </div>

      <div className="module-card-content">
        <h3 className="module-card-title">{title || iconData.label}</h3>
        {description && (
          <p className="module-card-description">{description}</p>
        )}
      </div>

      {progress !== undefined && (
        <div className="module-card-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="progress-text">{progress}%</span>
        </div>
      )}

      <div className="module-card-arrow">→</div>
    </div>
  );
};

export default ModuleIcon;
