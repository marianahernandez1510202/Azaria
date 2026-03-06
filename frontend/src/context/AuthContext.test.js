/**
 * Tests para AuthContext
 */
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

// Mock de authService
jest.mock('../services/authService', () => ({
  authService: {
    checkSession: jest.fn().mockResolvedValue({ success: false }),
    login: jest.fn(),
    logout: jest.fn().mockResolvedValue({}),
    setupPIN: jest.fn(),
  }
}));

// Componente helper para acceder al contexto
const TestConsumer = () => {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="authenticated">{String(auth.isAuthenticated)}</span>
      <span data-testid="loading">{String(auth.loading)}</span>
      <span data-testid="user">{auth.user ? auth.user.nombre : 'null'}</span>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('debe proveer estado inicial de no autenticado', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('null');
  });

  test('debe terminar de cargar despues del checkSession', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });

    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });

  test('useAuth lanza error fuera de AuthProvider', () => {
    // Silenciar el error esperado en consola
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestConsumer />);
    }).toThrow('useAuth debe ser usado dentro de un AuthProvider');

    consoleSpy.mockRestore();
  });

  test('logout limpia token de localStorage', async () => {
    localStorage.setItem('token', 'test-token');

    let authContext;
    const Wrapper = () => {
      authContext = useAuth();
      return null;
    };

    await act(async () => {
      render(
        <AuthProvider>
          <Wrapper />
        </AuthProvider>
      );
    });

    await act(async () => {
      await authContext.logout();
    });

    expect(localStorage.getItem('token')).toBeNull();
  });
});
