/**
 * Tests para constantes de la aplicacion
 */
import { ROLES, FASES, ESPECIALIDADES, API_URL } from './constants';

describe('Constantes - ROLES', () => {
  test('debe definir rol ADMIN', () => {
    expect(ROLES.ADMIN).toBe('administrador');
  });

  test('debe definir rol ESPECIALISTA', () => {
    expect(ROLES.ESPECIALISTA).toBe('especialista');
  });

  test('debe definir rol PACIENTE', () => {
    expect(ROLES.PACIENTE).toBe('paciente');
  });

  test('debe tener exactamente 3 roles', () => {
    expect(Object.keys(ROLES)).toHaveLength(3);
  });
});

describe('Constantes - FASES', () => {
  test('debe definir 4 fases de rehabilitacion', () => {
    expect(Object.keys(FASES)).toHaveLength(4);
  });

  test('PREOPERATORIA debe ser 1', () => {
    expect(FASES.PREOPERATORIA).toBe(1);
  });

  test('POSTOPERATORIA debe ser 2', () => {
    expect(FASES.POSTOPERATORIA).toBe(2);
  });

  test('PREPROTESICA debe ser 3', () => {
    expect(FASES.PREPROTESICA).toBe(3);
  });

  test('PROTESICA debe ser 4', () => {
    expect(FASES.PROTESICA).toBe(4);
  });

  test('las fases deben ser consecutivas del 1 al 4', () => {
    const valores = Object.values(FASES).sort();
    expect(valores).toEqual([1, 2, 3, 4]);
  });
});

describe('Constantes - ESPECIALIDADES', () => {
  test('debe definir 5 especialidades', () => {
    expect(Object.keys(ESPECIALIDADES)).toHaveLength(5);
  });

  test('debe incluir nutricion', () => {
    expect(ESPECIALIDADES.NUTRICION).toBe('nutricion');
  });

  test('debe incluir medicina', () => {
    expect(ESPECIALIDADES.MEDICINA).toBe('medicina');
  });

  test('debe incluir fisioterapia', () => {
    expect(ESPECIALIDADES.FISIOTERAPIA).toBe('fisioterapia');
  });

  test('debe incluir neuropsicologia', () => {
    expect(ESPECIALIDADES.NEUROPSICOLOGIA).toBe('neuropsicologia');
  });

  test('debe incluir ortesis', () => {
    expect(ESPECIALIDADES.ORTESIS).toBe('ortesis');
  });
});

describe('Constantes - API_URL', () => {
  test('debe tener un valor por defecto', () => {
    expect(API_URL).toBeDefined();
    expect(typeof API_URL).toBe('string');
  });

  test('debe terminar en /api', () => {
    expect(API_URL).toMatch(/\/api$/);
  });
});
