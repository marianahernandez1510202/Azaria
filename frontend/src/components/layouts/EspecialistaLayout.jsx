import React from 'react';
import BaseLayout from './BaseLayout';

/**
 * EspecialistaLayout - Layout para el rol Especialista
 * Acceso a: pacientes asignados, citas, chat, reportes
 */

const ESPECIALISTA_NAV_ITEMS = [
  { path: '/especialista', icon: '🏠', label: 'Inicio' },
  { path: '/especialista/pacientes', icon: '👥', label: 'Mis Pacientes' },
  { path: '/especialista/citas', icon: '📅', label: 'Mis Citas' },
  { path: '/especialista/agenda', icon: '📆', label: 'Agenda' },
  { path: '/especialista/chat', icon: '💬', label: 'Mensajes' },
  { path: '/especialista/seguimientos', icon: '📋', label: 'Seguimientos' },
  { path: '/especialista/reportes', icon: '📊', label: 'Reportes' },
  { path: '/especialista/recursos', icon: '📚', label: 'Recursos' },
  { path: '/perfil', icon: '👤', label: 'Mi Perfil' },
  { path: '/configuracion', icon: '⚙️', label: 'Configuración' },
];

const EspecialistaLayout = ({
  children,
  title = 'Portal Especialista',
  subtitle,
  showBackButton = false,
  backPath = '/especialista',
  headerActions,
  pendingTasks,
}) => {
  const sidebarContent = pendingTasks && pendingTasks.length > 0 ? (
    <div className="sidebar-tasks">
      <h3 className="tasks-title">Tareas Pendientes</h3>
      <ul className="tasks-list">
        {pendingTasks.slice(0, 5).map((task, index) => (
          <li key={index} className={`task-item priority-${task.priority || 'normal'}`}>
            <span className="task-icon" aria-hidden="true">
              {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'}
            </span>
            <div className="task-content">
              <span className="task-title">{task.title}</span>
              <span className="task-patient">{task.patient}</span>
            </div>
            <span className="task-time">{task.time}</span>
          </li>
        ))}
      </ul>
      {pendingTasks.length > 5 && (
        <p className="tasks-more">+{pendingTasks.length - 5} tareas más</p>
      )}
    </div>
  ) : null;

  return (
    <BaseLayout
      title={title}
      subtitle={subtitle}
      showBackButton={showBackButton}
      backPath={backPath}
      headerActions={headerActions}
      navItems={ESPECIALISTA_NAV_ITEMS}
      sidebarContent={sidebarContent}
      role="especialista"
      className="especialista-layout"
    >
      {children}
    </BaseLayout>
  );
};

export default EspecialistaLayout;
