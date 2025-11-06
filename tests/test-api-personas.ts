/**
 * Script de prueba para endpoints de Personas
 * Tests para documentación API Frontend
 */

const BASE_URL = 'http://localhost:8000/api';

interface TestResult {
  endpoint: string;
  method: string;
  success: boolean;
  statusCode?: number;
  request?: any;
  response?: any;
  error?: string;
}

const results: TestResult[] = [];
let personaTestId: number | null = null;

// Utilidad para logging
function log(message: string, type: 'info' | 'success' | 'error' = 'info') {
  const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  console.log(`${emoji} ${message}`);
}

function logSeparator() {
  console.log('\n' + '='.repeat(80) + '\n');
}

// Utilidad para requests
async function makeRequest(
  endpoint: string,
  method: string,
  body?: any
): Promise<TestResult> {
  const url = `${BASE_URL}${endpoint}`;
  const result: TestResult = {
    endpoint,
    method,
    success: false
  };

  try {
    log(`Testing ${method} ${endpoint}`, 'info');

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
      result.request = body;
    }

    const response = await fetch(url, options);
    result.statusCode = response.status;

    const data = await response.json();
    result.response = data;

    result.success = response.ok;

    if (response.ok) {
      log(`SUCCESS: ${response.status}`, 'success');
    } else {
      log(`FAILED: ${response.status} - ${data.error || 'Unknown error'}`, 'error');
      result.error = data.error || 'Unknown error';
    }

  } catch (error: any) {
    result.error = error.message;
    log(`ERROR: ${error.message}`, 'error');
  }

  results.push(result);
  return result;
}

// Tests
async function runTests() {
  console.clear();
  log('🚀 Iniciando pruebas de API - Personas', 'info');
  logSeparator();

  // ======================================================================
  // TEST 1: POST /api/personas - Crear persona NO_SOCIO
  // ======================================================================
  logSeparator();
  log('TEST 1: Crear persona NO_SOCIO', 'info');
  const createNoSocioResult = await makeRequest('/personas', 'POST', {
    nombre: 'Juan',
    apellido: 'Pérez',
    dni: '12345678',
    email: 'juan.perez@example.com',
    telefono: '1234567890',
    direccion: 'Calle Falsa 123',
    fechaNacimiento: '1990-01-15T00:00:00.000Z',
    tipos: [
      {
        tipoPersonaCodigo: 'NO_SOCIO'
      }
    ]
  });

  if (createNoSocioResult.success && createNoSocioResult.response?.data?.id) {
    personaTestId = createNoSocioResult.response.data.id;
    log(`Persona creada con ID: ${personaTestId}`, 'success');
  }

  // ======================================================================
  // TEST 2: POST /api/personas - Crear SOCIO
  // ======================================================================
  logSeparator();
  log('TEST 2: Crear persona SOCIO', 'info');
  await makeRequest('/personas', 'POST', {
    nombre: 'María',
    apellido: 'González',
    dni: '87654321',
    email: 'maria.gonzalez@example.com',
    telefono: '0987654321',
    tipos: [
      {
        tipoPersonaCodigo: 'SOCIO',
        categoriaId: 1,
        fechaIngreso: new Date().toISOString()
      }
    ]
  });

  // ======================================================================
  // TEST 3: POST /api/personas - Crear DOCENTE
  // ======================================================================
  logSeparator();
  log('TEST 3: Crear persona DOCENTE', 'info');
  await makeRequest('/personas', 'POST', {
    nombre: 'Carlos',
    apellido: 'Rodríguez',
    dni: '11223344',
    email: 'carlos.rodriguez@example.com',
    tipos: [
      {
        tipoPersonaCodigo: 'DOCENTE',
        especialidadId: 1,
        honorariosPorHora: 500
      }
    ]
  });

  // ======================================================================
  // TEST 4: GET /api/personas - Listar todas las personas
  // ======================================================================
  logSeparator();
  log('TEST 4: Listar todas las personas (paginación)', 'info');
  await makeRequest('/personas?page=1&limit=10&includeTipos=true', 'GET');

  // ======================================================================
  // TEST 5: GET /api/personas/:id - Obtener persona por ID
  // ======================================================================
  if (personaTestId) {
    logSeparator();
    log('TEST 5: Obtener persona por ID', 'info');
    await makeRequest(`/personas/${personaTestId}`, 'GET');
  }

  // ======================================================================
  // TEST 6: GET /api/personas/search - Búsqueda por texto
  // ======================================================================
  logSeparator();
  log('TEST 6: Búsqueda de personas por texto', 'info');
  await makeRequest('/personas/search?search=Juan&page=1&limit=10', 'GET');

  // ======================================================================
  // TEST 7: GET /api/personas/socios - Listar solo socios
  // ======================================================================
  logSeparator();
  log('TEST 7: Listar solo socios', 'info');
  await makeRequest('/personas/socios?page=1&limit=10', 'GET');

  // ======================================================================
  // TEST 8: GET /api/personas/docentes - Listar solo docentes
  // ======================================================================
  logSeparator();
  log('TEST 8: Listar solo docentes', 'info');
  await makeRequest('/personas/docentes?page=1&limit=10', 'GET');

  // ======================================================================
  // TEST 9: PUT /api/personas/:id - Actualizar persona
  // ======================================================================
  if (personaTestId) {
    logSeparator();
    log('TEST 9: Actualizar datos de persona', 'info');
    await makeRequest(`/personas/${personaTestId}`, 'PUT', {
      telefono: '1111222233',
      direccion: 'Nueva Dirección 456'
    });
  }

  // ======================================================================
  // TEST 10: GET /api/personas/dni/:dni/check - Verificar DNI
  // ======================================================================
  logSeparator();
  log('TEST 10: Verificar si DNI existe', 'info');
  await makeRequest('/personas/dni/12345678/check', 'GET');

  // ======================================================================
  // TEST 11: POST /api/personas - Error: DNI duplicado
  // ======================================================================
  logSeparator();
  log('TEST 11: Error - Crear persona con DNI duplicado', 'info');
  await makeRequest('/personas', 'POST', {
    nombre: 'Test',
    apellido: 'Duplicado',
    dni: '12345678',
    tipos: [{ tipoPersonaCodigo: 'NO_SOCIO' }]
  });

  // ======================================================================
  // TEST 12: POST /api/personas - Error: SOCIO sin categoría
  // ======================================================================
  logSeparator();
  log('TEST 12: Error - Crear SOCIO sin categoría', 'info');
  await makeRequest('/personas', 'POST', {
    nombre: 'Error',
    apellido: 'Sin Categoría',
    dni: '99999999',
    tipos: [{ tipoPersonaCodigo: 'SOCIO' }]
  });

  // ======================================================================
  // TEST 13: POST /api/personas - Error: Validación de campos
  // ======================================================================
  logSeparator();
  log('TEST 13: Error - Validación de campos requeridos', 'info');
  await makeRequest('/personas', 'POST', {
    nombre: 'Sin',
    // Falta apellido y DNI
    tipos: [{ tipoPersonaCodigo: 'NO_SOCIO' }]
  });

  // ======================================================================
  // TEST 14: GET /api/personas/:id - Error: ID inexistente
  // ======================================================================
  logSeparator();
  log('TEST 14: Error - Obtener persona con ID inexistente', 'info');
  await makeRequest('/personas/999999', 'GET');

  // ======================================================================
  // TEST 15: DELETE /api/personas/:id - Eliminar persona (soft delete)
  // ======================================================================
  if (personaTestId) {
    logSeparator();
    log('TEST 15: Eliminar persona (soft delete)', 'info');
    await makeRequest(`/personas/${personaTestId}`, 'DELETE');
  }

  // ======================================================================
  // RESUMEN
  // ======================================================================
  logSeparator();
  log('📊 RESUMEN DE PRUEBAS', 'info');
  logSeparator();

  const total = results.length;
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`Total de pruebas: ${total}`);
  console.log(`✅ Exitosas: ${successful}`);
  console.log(`❌ Fallidas: ${failed}`);

  logSeparator();
  log('📄 RESULTADOS DETALLADOS', 'info');
  logSeparator();

  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.method} ${result.endpoint}`);
    console.log(`   Status: ${result.statusCode || 'N/A'}`);
    console.log(`   Success: ${result.success ? '✅' : '❌'}`);

    if (result.request) {
      console.log(`   Request:`, JSON.stringify(result.request, null, 2));
    }

    if (result.response) {
      console.log(`   Response:`, JSON.stringify(result.response, null, 2));
    }

    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  logSeparator();

  // Guardar resultados en archivo JSON
  const fs = require('fs');
  const path = require('path');
  const resultsPath = path.join(__dirname, 'test-results-personas.json');

  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  log(`Resultados guardados en: ${resultsPath}`, 'success');
}

// Ejecutar tests
runTests().catch(error => {
  console.error('Error fatal en tests:', error);
  process.exit(1);
});
