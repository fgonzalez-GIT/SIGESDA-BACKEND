/**
 * ============================================================================
 * JEST SETUP - Ejecutado después de cada suite de tests
 * ============================================================================
 * Configuración del entorno para cada archivo de test
 * ============================================================================
 */

// Timeout global para tests individuales
jest.setTimeout(30000);

// Variables de entorno para tests
process.env.NODE_ENV = 'test';

// Suprimir logs durante tests (opcional)
if (process.env.SILENT_TESTS === 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn()
  };
}

// Hook global para cada test
beforeEach(() => {
  // Limpiar todos los mocks antes de cada test
  jest.clearAllMocks();
});

afterEach(() => {
  // Restaurar mocks después de cada test
  jest.restoreAllMocks();
});
