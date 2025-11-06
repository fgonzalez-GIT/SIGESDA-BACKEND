/**
 * Script de prueba para endpoints de Relaciones Familiares
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
let personaSocioId: number | null = null;
let personaFamiliarId: number | null = null;
let relacionTestId: number | null = null;

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
  log('🚀 Iniciando pruebas de API - Relaciones Familiares', 'info');
  logSeparator();

  // ======================================================================
  // SETUP: Crear personas para las pruebas
  // ======================================================================
  logSeparator();
  log('SETUP: Creando personas de prueba', 'info');

  // Crear SOCIO principal
  const createSocioResult = await makeRequest('/personas', 'POST', {
    nombre: 'Pedro',
    apellido: 'López',
    dni: '20304050',
    email: 'pedro.lopez@example.com',
    tipos: [
      {
        tipoPersonaCodigo: 'SOCIO',
        categoriaId: 1,
        fechaIngreso: new Date().toISOString()
      }
    ]
  });

  if (createSocioResult.success && createSocioResult.response?.data?.id) {
    personaSocioId = createSocioResult.response.data.id;
    log(`Socio creado con ID: ${personaSocioId}`, 'success');
  }

  // Crear familiar (hijo)
  const createFamiliarResult = await makeRequest('/personas', 'POST', {
    nombre: 'Lucía',
    apellido: 'López',
    dni: '45678901',
    fechaNacimiento: '2010-05-20T00:00:00.000Z',
    tipos: [
      {
        tipoPersonaCodigo: 'NO_SOCIO'
      }
    ]
  });

  if (createFamiliarResult.success && createFamiliarResult.response?.data?.id) {
    personaFamiliarId = createFamiliarResult.response.data.id;
    log(`Familiar creado con ID: ${personaFamiliarId}`, 'success');
  }

  if (!personaSocioId || !personaFamiliarId) {
    log('No se pudieron crear las personas de prueba. Abortando tests.', 'error');
    return;
  }

  // ======================================================================
  // TEST 1: POST /api/familiares - Crear relación familiar (PADRE-HIJA)
  // ======================================================================
  logSeparator();
  log('TEST 1: Crear relación familiar PADRE → HIJA', 'info');
  const createRelacionResult = await makeRequest('/familiares', 'POST', {
    socioId: personaSocioId,
    familiarId: personaFamiliarId,
    parentesco: 'PADRE',
    descripcion: 'Relación padre-hija',
    permisoResponsableFinanciero: true,
    permisoContactoEmergencia: true,
    permisoAutorizadoRetiro: true,
    descuento: 20,
    activo: true
  });

  if (createRelacionResult.success && createRelacionResult.response?.data?.id) {
    relacionTestId = createRelacionResult.response.data.id;
    log(`Relación creada con ID: ${relacionTestId}`, 'success');
  }

  // ======================================================================
  // TEST 2: GET /api/familiares - Listar todas las relaciones
  // ======================================================================
  logSeparator();
  log('TEST 2: Listar todas las relaciones familiares', 'info');
  await makeRequest('/familiares?page=1&limit=10', 'GET');

  // ======================================================================
  // TEST 3: GET /api/familiares/:id - Obtener relación por ID
  // ======================================================================
  if (relacionTestId) {
    logSeparator();
    log('TEST 3: Obtener relación familiar por ID', 'info');
    await makeRequest(`/familiares/${relacionTestId}`, 'GET');
  }

  // ======================================================================
  // TEST 4: GET /api/familiares/socio/:socioId - Obtener familiares de un socio
  // ======================================================================
  logSeparator();
  log('TEST 4: Obtener familiares de un socio específico', 'info');
  await makeRequest(`/familiares/socio/${personaSocioId}`, 'GET');

  // ======================================================================
  // TEST 5: GET /api/familiares/tipos/parentesco - Listar tipos de parentesco
  // ======================================================================
  logSeparator();
  log('TEST 5: Listar tipos de parentesco disponibles', 'info');
  await makeRequest('/familiares/tipos/parentesco', 'GET');

  // ======================================================================
  // TEST 6: GET /api/familiares/verify/:socioId/:familiarId - Verificar si existe relación
  // ======================================================================
  logSeparator();
  log('TEST 6: Verificar si existe relación entre dos personas', 'info');
  await makeRequest(`/familiares/verify/${personaSocioId}/${personaFamiliarId}`, 'GET');

  // ======================================================================
  // TEST 7: PUT /api/familiares/:id - Actualizar relación familiar
  // ======================================================================
  if (relacionTestId) {
    logSeparator();
    log('TEST 7: Actualizar relación familiar', 'info');
    await makeRequest(`/familiares/${relacionTestId}`, 'PUT', {
      descuento: 30,
      descripcion: 'Relación padre-hija actualizada',
      permisoContactoEmergencia: false
    });
  }

  // ======================================================================
  // TEST 8: GET /api/familiares/socio/:socioId/tree - Obtener árbol familiar
  // ======================================================================
  logSeparator();
  log('TEST 8: Obtener árbol familiar completo de un socio', 'info');
  await makeRequest(`/familiares/socio/${personaSocioId}/tree`, 'GET');

  // ======================================================================
  // TEST 9: POST /api/familiares - Error: Relación duplicada
  // ======================================================================
  logSeparator();
  log('TEST 9: Error - Crear relación duplicada', 'info');
  await makeRequest('/familiares', 'POST', {
    socioId: personaSocioId,
    familiarId: personaFamiliarId,
    parentesco: 'PADRE'
  });

  // ======================================================================
  // TEST 10: POST /api/familiares - Error: Persona como su propio familiar
  // ======================================================================
  logSeparator();
  log('TEST 10: Error - Persona como su propio familiar', 'info');
  await makeRequest('/familiares', 'POST', {
    socioId: personaSocioId,
    familiarId: personaSocioId,
    parentesco: 'HERMANO'
  });

  // ======================================================================
  // TEST 11: POST /api/familiares - Error: Descuento inválido
  // ======================================================================
  logSeparator();
  log('TEST 11: Error - Descuento mayor a 100%', 'info');

  // Crear otra persona para esta prueba
  const createPersona3Result = await makeRequest('/personas', 'POST', {
    nombre: 'Ana',
    apellido: 'López',
    dni: '11223355',
    tipos: [{ tipoPersonaCodigo: 'NO_SOCIO' }]
  });

  let persona3Id = null;
  if (createPersona3Result.success && createPersona3Result.response?.data?.id) {
    persona3Id = createPersona3Result.response.data.id;
  }

  if (persona3Id) {
    await makeRequest('/familiares', 'POST', {
      socioId: personaSocioId,
      familiarId: persona3Id,
      parentesco: 'MADRE',
      descuento: 150
    });
  }

  // ======================================================================
  // TEST 12: POST /api/familiares - Error: Validación de campos
  // ======================================================================
  logSeparator();
  log('TEST 12: Error - Campos requeridos faltantes', 'info');
  await makeRequest('/familiares', 'POST', {
    socioId: personaSocioId
    // Falta familiarId y parentesco
  });

  // ======================================================================
  // TEST 13: GET /api/familiares/:id - Error: ID inexistente
  // ======================================================================
  logSeparator();
  log('TEST 13: Error - Obtener relación con ID inexistente', 'info');
  await makeRequest('/familiares/999999', 'GET');

  // ======================================================================
  // TEST 14: DELETE /api/familiares/:id - Eliminar relación (bidireccional)
  // ======================================================================
  if (relacionTestId) {
    logSeparator();
    log('TEST 14: Eliminar relación familiar (sincronización bidireccional)', 'info');
    await makeRequest(`/familiares/${relacionTestId}`, 'DELETE');
  }

  // ======================================================================
  // TEST 15: Verificar sincronización bidireccional
  // ======================================================================
  logSeparator();
  log('TEST 15: Verificar que la relación complementaria también fue eliminada', 'info');
  await makeRequest(`/familiares/verify/${personaSocioId}/${personaFamiliarId}`, 'GET');

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
  const resultsPath = path.join(__dirname, 'test-results-familiares.json');

  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  log(`Resultados guardados en: ${resultsPath}`, 'success');
}

// Ejecutar tests
runTests().catch(error => {
  console.error('Error fatal en tests:', error);
  process.exit(1);
});
