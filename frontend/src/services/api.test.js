/**
 * Tests para api.js - Axios instance y configuracion
 */
import api from './api';

describe('API Service', () => {
  test('debe tener baseURL configurada', () => {
    expect(api.defaults.baseURL).toBeDefined();
    expect(api.defaults.baseURL).toContain('/api');
  });

  test('debe tener Content-Type application/json', () => {
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });

  test('debe tener header X-Requested-With para proteccion CSRF', () => {
    expect(api.defaults.headers['X-Requested-With']).toBe('XMLHttpRequest');
  });

  test('debe tener interceptores de request configurados', () => {
    // Axios interceptors tiene un handlers array
    expect(api.interceptors.request.handlers.length).toBeGreaterThan(0);
  });

  test('debe tener interceptores de response configurados', () => {
    expect(api.interceptors.response.handlers.length).toBeGreaterThan(0);
  });

  test('interceptor de request agrega token si existe', () => {
    // Simular token en localStorage
    localStorage.setItem('token', 'test-token-123');

    const config = { headers: {} };
    // Obtener el interceptor de request (primer handler)
    const requestInterceptor = api.interceptors.request.handlers[0];
    const result = requestInterceptor.fulfilled(config);

    expect(result.headers.Authorization).toBe('Bearer test-token-123');

    // Limpiar
    localStorage.removeItem('token');
  });

  test('interceptor de request no agrega token si no existe', () => {
    localStorage.removeItem('token');

    const config = { headers: {} };
    const requestInterceptor = api.interceptors.request.handlers[0];
    const result = requestInterceptor.fulfilled(config);

    expect(result.headers.Authorization).toBeUndefined();
  });
});
