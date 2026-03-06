/**
 * Tests para ProtectedRoute
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Mock del AuthContext
const mockUseAuth = jest.fn();
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));

describe('ProtectedRoute', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('muestra loading cuando esta cargando', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Contenido protegido</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Cargando...')).toBeInTheDocument();
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
  });

  test('redirige a login si no hay usuario', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });

    render(
      <MemoryRouter initialEntries={['/protegido']}>
        <ProtectedRoute>
          <div>Contenido protegido</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    // Navigate no renderiza nada visible
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
  });

  test('renderiza children si el usuario esta autenticado', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, nombre: 'Test', rol: 'paciente' },
      loading: false
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Contenido protegido</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });

  test('renderiza children si el usuario tiene el rol correcto', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, nombre: 'Admin', rol: 'administrador' },
      loading: false
    });

    render(
      <MemoryRouter>
        <ProtectedRoute roles={['administrador']}>
          <div>Panel Admin</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Panel Admin')).toBeInTheDocument();
  });

  test('redirige si el usuario no tiene el rol requerido', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, nombre: 'Paciente', rol: 'paciente' },
      loading: false
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <ProtectedRoute roles={['administrador']}>
          <div>Panel Admin</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText('Panel Admin')).not.toBeInTheDocument();
  });

  test('permite acceso sin restriccion de roles', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, nombre: 'Cualquier', rol: 'especialista' },
      loading: false
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Pagina general</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Pagina general')).toBeInTheDocument();
  });
});
