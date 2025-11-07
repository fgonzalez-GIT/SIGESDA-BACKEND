module.exports = {
  // Preset para TypeScript
  preset: 'ts-jest',

  // Entorno de ejecución
  testEnvironment: 'node',

  // Raíz del proyecto
  rootDir: './',

  // Directorios de tests
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/tests/**/*.spec.ts'
  ],

  // Archivos a ignorar
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],

  // Cobertura de código
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/types/**',
    '!src/**/index.ts'
  ],

  // Directorio de reportes de cobertura
  coverageDirectory: 'coverage',

  // Formato de reportes
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov'
  ],

  // Umbrales de cobertura
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60
    }
  },

  // Setup global antes de tests
  globalSetup: '<rootDir>/tests/setup.ts',

  // Timeout para tests (2 minutos)
  testTimeout: 120000,

  // Variables de entorno
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.ts'],

  // Transformar archivos TS
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        module: 'commonjs',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true
      }
    }]
  },

  // Módulos a transformar
  transformIgnorePatterns: [
    'node_modules/(?!(@prisma)/)'
  ],

  // Mapeo de módulos (para tsconfig paths)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@repositories/(.*)$': '<rootDir>/src/repositories/$1',
    '^@dto/(.*)$': '<rootDir>/src/dto/$1',
    '^@middleware/(.*)$': '<rootDir>/src/middleware/$1',
    '^@routes/(.*)$': '<rootDir>/src/routes/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1'
  },

  // Extensiones de archivo
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Mostrar logs en tests
  verbose: true,

  // Detectar memoria leaks
  detectOpenHandles: true,

  // Forzar salida después de tests
  forceExit: true,

  // Limpiar mocks después de cada test
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
