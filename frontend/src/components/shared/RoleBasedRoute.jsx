import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';

/**
 * RoleBasedRoute - Componente para proteger rutas basadas en roles
 *
 * @param {React.ReactNode} children - Componente a renderizar si tiene acceso
 * @param {string[]} allowedRoles - Array de roles permitidos
 * @param {string} redirectTo - Ruta de redirección si no tiene acceso
 */
const RoleBasedRoute = ({
  children,
  allowedRoles = [],
  redirectTo = '/'
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return (
      <div className="loading-screen" role="status" aria-live="polite">
        <div className="loading-spinner"></div>
        <p>Verificando acceso...</p>
      </div>
    );
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si no se especifican roles, permitir acceso a cualquier usuario autenticado
  if (allowedRoles.length === 0) {
    return children;
  }

  // Verificar si el usuario tiene uno de los roles permitidos
  const userRole = user?.rol || user?.role;
  const hasAccess = allowedRoles.includes(userRole);

  if (!hasAccess) {
    // Redirigir según el rol del usuario
    const roleRedirects = {
      [ROLES.ADMIN]: '/admin',
      [ROLES.ESPECIALISTA]: '/especialista',
      [ROLES.PACIENTE]: '/',
    };

    const defaultRedirect = roleRedirects[userRole] || redirectTo;
    return <Navigate to={defaultRedirect} replace />;
  }

  return children;
};

/**
 * AdminRoute - Ruta exclusiva para administradores
 */
export const AdminRoute = ({ children }) => (
  <RoleBasedRoute allowedRoles={[ROLES.ADMIN]} redirectTo="/">
    {children}
  </RoleBasedRoute>
);

/**
 * EspecialistaRoute - Ruta para especialistas y administradores
 */
export const EspecialistaRoute = ({ children }) => (
  <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.ESPECIALISTA]} redirectTo="/">
    {children}
  </RoleBasedRoute>
);

/**
 * PacienteRoute - Ruta para pacientes (también accesible por admin y especialistas)
 */
export const PacienteRoute = ({ children }) => (
  <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.ESPECIALISTA, ROLES.PACIENTE]} redirectTo="/login">
    {children}
  </RoleBasedRoute>
);

/**
 * Hook para verificar el rol del usuario actual
 */
export const useRole = () => {
  const { user } = useAuth();
  const role = user?.rol || user?.role;

  return {
    role,
    isAdmin: role === ROLES.ADMIN,
    isEspecialista: role === ROLES.ESPECIALISTA,
    isPaciente: role === ROLES.PACIENTE,
    hasRole: (allowedRoles) => allowedRoles.includes(role),
  };
};

/**
 * Componente que renderiza diferentes contenidos según el rol
 */
export const RoleSwitch = ({ admin, especialista, paciente, fallback = null }) => {
  const { isAdmin, isEspecialista, isPaciente } = useRole();

  if (isAdmin && admin) return admin;
  if (isEspecialista && especialista) return especialista;
  if (isPaciente && paciente) return paciente;

  return fallback;
};

export default RoleBasedRoute;
