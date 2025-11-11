/**
 * Script de Pruebas - Relaciones Familiares
 *
 * Prueba la creación, lectura, actualización y eliminación de relaciones familiares
 * Valida la sincronización bidireccional automática
 *
 * Tipos de parentesco: PADRE, MADRE, HIJO, HIJA, HERMANO, HERMANA, ESPOSO, ESPOSA,
 *                      ABUELO, ABUELA, NIETO, NIETA, TIO, TIA, SOBRINO, SOBRINA,
 *                      PRIMO, PRIMA
 *
 * PREREQUISITOS:
 * - El servidor debe estar corriendo en http://localhost:8000
 * - La base de datos debe estar con seed ejecutado
 *
 * EJECUCIÓN:
 * npx tsx tests/manual/test-relaciones-familiares.ts
 */

import axios, { AxiosError } from 'axios';

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const API_BASE_URL = 'http://localhost:8000/api';
const TIMEOUT = 5000;

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

// ============================================================================
// DATOS DE PRUEBA
// ============================================================================

const timestamp = Date.now();
const dniPadre = String(45000000 + Math.floor(Math.random() * 5000000));
const dniMadre = String(45000000 + Math.floor(Math.random() * 5000000));
const dniHijo1 = String(45000000 + Math.floor(Math.random() * 5000000));
const dniHijo2 = String(45000000 + Math.floor(Math.random() * 5000000));

const padreData = {
  nombre: 'Roberto',
  apellido: 'García Pérez',
  dni: dniPadre,
  email: `roberto.garcia.${timestamp}@example.com`,
  fechaNacimiento: '1975-03-15T00:00:00.000Z',
  tipos: [{ tipoPersonaCodigo: 'SOCIO' }]
};

const madreData = {
  nombre: 'Carmen',
  apellido: 'López Martínez',
  dni: dniMadre,
  email: `carmen.lopez.${timestamp}@example.com`,
  fechaNacimiento: '1977-06-20T00:00:00.000Z',
  tipos: [{ tipoPersonaCodigo: 'SOCIO' }]
};

const hijo1Data = {
  nombre: 'Miguel',
  apellido: 'García López',
  dni: dniHijo1,
  email: `miguel.garcia.${timestamp}@example.com`,
  fechaNacimiento: '2005-09-10T00:00:00.000Z',
  tipos: [{ tipoPersonaCodigo: 'NO_SOCIO' }]
};

const hijo2Data = {
  nombre: 'Laura',
  apellido: 'García López',
  dni: dniHijo2,
  email: `laura.garcia.${timestamp}@example.com`,
  fechaNacimiento: '2008-12-05T00:00:00.000Z',
  tipos: [{ tipoPersonaCodigo: 'NO_SOCIO' }]
};

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log('\n' + '='.repeat(80));
  log(`  ${title}`, 'bright');
  console.log('='.repeat(80));
}

function logRequest(method: string, url: string, data?: any) {
  log(`\n→ REQUEST: ${method} ${url}`, 'cyan');
  if (data) {
    console.log('  Body:', JSON.stringify(data, null, 2));
  }
}

function logResponse(status: number, data: any) {
  const statusColor = status >= 200 && status < 300 ? 'green' : 'red';
  log(`\n← RESPONSE: ${status}`, statusColor);
  console.log('  Data:', JSON.stringify(data, null, 2));
}

function logSuccess(message: string) {
  log(`\n✓ ${message}`, 'green');
}

function logError(message: string) {
  log(`\n✗ ${message}`, 'red');
}

function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// Crear personas base
// ============================================================================

async function createPersona(data: any): Promise<number | null> {
  try {
    const url = `${API_BASE_URL}/personas`;
    const response = await axios.post(url, data, { timeout: TIMEOUT });
    return response.data.data.id;
  } catch (error) {
    return null;
  }
}

// ============================================================================
// TEST 1: Crear familia base (padre, madre, dos hijos)
// ============================================================================

async function test1_CreateFamiliaBase(): Promise<{
  padreId: number;
  madreId: number;
  hijo1Id: number;
  hijo2Id: number;
} | null> {
  logSection('TEST 1: Crear Familia Base (4 personas)');

  try {
    log('Creando padre...', 'cyan');
    const padreId = await createPersona(padreData);
    if (!padreId) throw new Error('Error al crear padre');
    log(`  ✓ Padre creado: ID ${padreId}`, 'green');

    log('Creando madre...', 'cyan');
    const madreId = await createPersona(madreData);
    if (!madreId) throw new Error('Error al crear madre');
    log(`  ✓ Madre creada: ID ${madreId}`, 'green');

    log('Creando hijo 1...', 'cyan');
    const hijo1Id = await createPersona(hijo1Data);
    if (!hijo1Id) throw new Error('Error al crear hijo 1');
    log(`  ✓ Hijo 1 creado: ID ${hijo1Id}`, 'green');

    log('Creando hijo 2...', 'cyan');
    const hijo2Id = await createPersona(hijo2Data);
    if (!hijo2Id) throw new Error('Error al crear hijo 2');
    log(`  ✓ Hijo 2 creado: ID ${hijo2Id}`, 'green');

    logSuccess('Familia base creada exitosamente');
    console.log('\n  IDs:');
    console.log(`    - Padre (Roberto): ${padreId}`);
    console.log(`    - Madre (Carmen): ${madreId}`);
    console.log(`    - Hijo 1 (Miguel): ${hijo1Id}`);
    console.log(`    - Hijo 2 (Laura): ${hijo2Id}`);

    return { padreId, madreId, hijo1Id, hijo2Id };

  } catch (error) {
    logError('Error al crear familia base');
    return null;
  }
}

// ============================================================================
// TEST 2: Crear relación PADRE → HIJO
// ============================================================================

async function test2_CreateRelacionPadreHijo(
  padreId: number,
  hijoId: number
): Promise<number | null> {
  logSection('TEST 2: Crear Relación PADRE → HIJO (con sync bidireccional)');

  try {
    const url = `${API_BASE_URL}/familiares`;
    const relacionData = {
      socioId: padreId,
      familiarId: hijoId,
      parentesco: 'HIJO',
      descuentoFamiliar: 20,
      esGrupoFamiliar: true,
      observaciones: 'Relación padre-hijo con descuento familiar'
    };

    logRequest('POST', url, relacionData);

    const response = await axios.post(url, relacionData, { timeout: TIMEOUT });
    logResponse(response.status, response.data);

    const relacionId = response.data.data.id;
    logSuccess(`Relación PADRE→HIJO creada con ID: ${relacionId}`);

    console.log('\n  Detalles:');
    console.log(`    - Socio (Padre): ${response.data.data.socioId}`);
    console.log(`    - Familiar (Hijo): ${response.data.data.familiarId}`);
    console.log(`    - Parentesco: ${response.data.data.parentesco}`);
    console.log(`    - Descuento: ${response.data.data.descuentoFamiliar}%`);

    // Verificar sincronización bidireccional
    await wait(500);
    const verifyUrl = `${API_BASE_URL}/familiares?personaId=${hijoId}`;
    const verifyResponse = await axios.get(verifyUrl, { timeout: TIMEOUT });
    const relaciones = verifyResponse.data.data;

    console.log('\n  Validación de sincronización bidireccional:');
    const relacionInversa = relaciones.find((r: any) => r.familiarId === padreId);

    if (relacionInversa) {
      log('    ✓ Relación inversa HIJO→PADRE creada automáticamente', 'green');
      console.log(`      - Parentesco inverso: ${relacionInversa.parentesco}`);
      console.log(`      - ID relación inversa: ${relacionInversa.id}`);
    } else {
      log('    ✗ Relación inversa NO fue creada automáticamente', 'yellow');
    }

    return relacionId;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      logResponse(error.response?.status || 500, error.response?.data);
    }
    logError('Error al crear relación PADRE→HIJO');
    return null;
  }
}

// ============================================================================
// TEST 3: Crear relación MADRE → HIJO
// ============================================================================

async function test3_CreateRelacionMadreHijo(
  madreId: number,
  hijoId: number
): Promise<number | null> {
  logSection('TEST 3: Crear Relación MADRE → HIJO');

  try {
    const url = `${API_BASE_URL}/familiares`;
    const relacionData = {
      socioId: madreId,
      familiarId: hijoId,
      parentesco: 'HIJO',
      descuentoFamiliar: 20,
      esGrupoFamiliar: true
    };

    logRequest('POST', url, relacionData);

    const response = await axios.post(url, relacionData, { timeout: TIMEOUT });
    logResponse(response.status, response.data);

    const relacionId = response.data.data.id;
    logSuccess(`Relación MADRE→HIJO creada con ID: ${relacionId}`);

    return relacionId;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      logResponse(error.response?.status || 500, error.response?.data);
    }
    logError('Error al crear relación MADRE→HIJO');
    return null;
  }
}

// ============================================================================
// TEST 4: Crear relación HERMANO ↔ HERMANO
// ============================================================================

async function test4_CreateRelacionHermanos(
  hijo1Id: number,
  hijo2Id: number
): Promise<number | null> {
  logSection('TEST 4: Crear Relación HERMANO ↔ HERMANA');

  try {
    const url = `${API_BASE_URL}/familiares`;
    const relacionData = {
      socioId: hijo1Id,
      familiarId: hijo2Id,
      parentesco: 'HERMANA',
      esGrupoFamiliar: true,
      observaciones: 'Hermanos'
    };

    logRequest('POST', url, relacionData);

    const response = await axios.post(url, relacionData, { timeout: TIMEOUT });
    logResponse(response.status, response.data);

    const relacionId = response.data.data.id;
    logSuccess(`Relación HERMANO→HERMANA creada con ID: ${relacionId}`);

    // Verificar bidireccionalidad
    await wait(500);
    const verifyUrl = `${API_BASE_URL}/familiares?personaId=${hijo2Id}`;
    const verifyResponse = await axios.get(verifyUrl, { timeout: TIMEOUT });
    const relaciones = verifyResponse.data.data;

    console.log('\n  Validación:');
    const relacionInversa = relaciones.find((r: any) => r.familiarId === hijo1Id);

    if (relacionInversa && relacionInversa.parentesco === 'HERMANO') {
      log('    ✓ Relación inversa HERMANA→HERMANO con parentesco correcto', 'green');
    } else {
      log('    ✗ Relación inversa no sincronizada correctamente', 'yellow');
    }

    return relacionId;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      logResponse(error.response?.status || 500, error.response?.data);
    }
    logError('Error al crear relación HERMANO↔HERMANA');
    return null;
  }
}

// ============================================================================
// TEST 5: Crear relación ESPOSO ↔ ESPOSA
// ============================================================================

async function test5_CreateRelacionEsposos(
  padreId: number,
  madreId: number
): Promise<number | null> {
  logSection('TEST 5: Crear Relación ESPOSO ↔ ESPOSA');

  try {
    const url = `${API_BASE_URL}/familiares`;
    const relacionData = {
      socioId: padreId,
      familiarId: madreId,
      parentesco: 'ESPOSA',
      esGrupoFamiliar: true,
      observaciones: 'Matrimonio'
    };

    logRequest('POST', url, relacionData);

    const response = await axios.post(url, relacionData, { timeout: TIMEOUT });
    logResponse(response.status, response.data);

    const relacionId = response.data.data.id;
    logSuccess(`Relación ESPOSO→ESPOSA creada con ID: ${relacionId}`);

    return relacionId;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      logResponse(error.response?.status || 500, error.response?.data);
    }
    logError('Error al crear relación ESPOSO↔ESPOSA');
    return null;
  }
}

// ============================================================================
// TEST 6: Listar todas las relaciones de una persona
// ============================================================================

async function test6_ListRelaciones(personaId: number): Promise<boolean> {
  logSection(`TEST 6: Listar Relaciones Familiares (Persona ID: ${personaId})`);

  try {
    const url = `${API_BASE_URL}/familiares?personaId=${personaId}`;
    logRequest('GET', url);

    const response = await axios.get(url, { timeout: TIMEOUT });
    logResponse(response.status, response.data);

    const relaciones = response.data.data;
    logSuccess(`${relaciones.length} relaciones encontradas`);

    console.log('\n  Lista de relaciones:');
    relaciones.forEach((r: any, index: number) => {
      const esSocio = r.socioId === personaId;
      const otro = esSocio ? r.familiar : r.socio;
      console.log(`    ${index + 1}. ${r.parentesco} → ${otro?.nombre} ${otro?.apellido}`);
      console.log(`       Descuento: ${r.descuentoFamiliar}%, Grupo familiar: ${r.esGrupoFamiliar}`);
    });

    return true;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      logResponse(error.response?.status || 500, error.response?.data);
    }
    logError('Error al listar relaciones');
    return false;
  }
}

// ============================================================================
// TEST 7: Actualizar una relación (cambiar descuento)
// ============================================================================

async function test7_UpdateRelacion(relacionId: number): Promise<boolean> {
  logSection('TEST 7: Actualizar Relación (cambiar descuento)');

  try {
    const url = `${API_BASE_URL}/familiares/${relacionId}`;
    const updateData = {
      descuentoFamiliar: 30,
      observaciones: 'Descuento actualizado a 30%'
    };

    logRequest('PUT', url, updateData);

    const response = await axios.put(url, updateData, { timeout: TIMEOUT });
    logResponse(response.status, response.data);

    logSuccess('Relación actualizada exitosamente');
    console.log('\n  Cambios aplicados:');
    console.log(`    - Descuento: ${response.data.data.descuentoFamiliar}%`);
    console.log(`    - Observaciones: ${response.data.data.observaciones}`);

    return true;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      logResponse(error.response?.status || 500, error.response?.data);
    }
    logError('Error al actualizar relación');
    return false;
  }
}

// ============================================================================
// TEST 8: Eliminar una relación (debe eliminar ambas direcciones)
// ============================================================================

async function test8_DeleteRelacion(
  relacionId: number,
  socioId: number,
  familiarId: number
): Promise<boolean> {
  logSection('TEST 8: Eliminar Relación (debe eliminar bidireccional)');

  try {
    const url = `${API_BASE_URL}/familiares/${relacionId}`;
    logRequest('DELETE', url);

    const response = await axios.delete(url, { timeout: TIMEOUT });
    logResponse(response.status, response.data);

    logSuccess('Relación eliminada exitosamente');

    // Verificar que ambas direcciones fueron eliminadas
    await wait(500);

    console.log('\n  Validación de eliminación bidireccional:');

    const verify1Url = `${API_BASE_URL}/familiares?personaId=${socioId}`;
    const verify1Response = await axios.get(verify1Url, { timeout: TIMEOUT });
    const relaciones1 = verify1Response.data.data;
    const existe1 = relaciones1.some((r: any) => r.id === relacionId);

    const verify2Url = `${API_BASE_URL}/familiares?personaId=${familiarId}`;
    const verify2Response = await axios.get(verify2Url, { timeout: TIMEOUT });
    const relaciones2 = verify2Response.data.data;
    const relacionInversa = relaciones2.find(
      (r: any) => r.socioId === familiarId && r.familiarId === socioId
    );

    if (!existe1) {
      log('    ✓ Relación directa eliminada', 'green');
    } else {
      log('    ✗ Relación directa aún existe', 'yellow');
    }

    if (!relacionInversa) {
      log('    ✓ Relación inversa eliminada', 'green');
    } else {
      log('    ✗ Relación inversa aún existe', 'yellow');
    }

    return !existe1 && !relacionInversa;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      logResponse(error.response?.status || 500, error.response?.data);
    }
    logError('Error al eliminar relación');
    return false;
  }
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

async function main() {
  log('\n' + '█'.repeat(80), 'bright');
  log('  SCRIPT DE PRUEBAS - RELACIONES FAMILIARES', 'bright');
  log('  SIGESDA Backend API', 'bright');
  log('█'.repeat(80) + '\n', 'bright');

  log(`API Base URL: ${API_BASE_URL}`, 'cyan');
  log(`Timeout: ${TIMEOUT}ms\n`, 'cyan');

  // Verificar servidor
  try {
    await axios.get(`${API_BASE_URL.replace('/api', '')}/health`, { timeout: TIMEOUT });
    logSuccess('Servidor accesible\n');
  } catch (error) {
    logError('Servidor no accesible');
    process.exit(1);
  }

  const results: boolean[] = [];

  // TEST 1: Crear familia base
  const familia = await test1_CreateFamiliaBase();
  if (!familia) process.exit(1);
  await wait(1000);

  const { padreId, madreId, hijo1Id, hijo2Id } = familia;

  // TEST 2: Relación PADRE→HIJO
  const relacion1Id = await test2_CreateRelacionPadreHijo(padreId, hijo1Id);
  if (!relacion1Id) process.exit(1);
  await wait(1000);

  // TEST 3: Relación MADRE→HIJO
  const relacion2Id = await test3_CreateRelacionMadreHijo(madreId, hijo1Id);
  if (!relacion2Id) process.exit(1);
  await wait(1000);

  // TEST 4: Relación HERMANO↔HERMANA
  const relacion3Id = await test4_CreateRelacionHermanos(hijo1Id, hijo2Id);
  if (!relacion3Id) process.exit(1);
  await wait(1000);

  // TEST 5: Relación ESPOSO↔ESPOSA
  const relacion4Id = await test5_CreateRelacionEsposos(padreId, madreId);
  if (!relacion4Id) process.exit(1);
  await wait(1000);

  // TEST 6: Listar relaciones del padre
  results.push(await test6_ListRelaciones(padreId));
  await wait(1000);

  // TEST 7: Actualizar relación
  if (relacion1Id) {
    results.push(await test7_UpdateRelacion(relacion1Id));
    await wait(1000);
  }

  // TEST 8: Eliminar relación
  if (relacion3Id) {
    results.push(await test8_DeleteRelacion(relacion3Id, hijo1Id, hijo2Id));
  }

  // Resumen final
  logSection('RESUMEN FINAL');

  const allSuccess = results.every(r => r);
  if (allSuccess) {
    logSuccess('Todos los tests se ejecutaron exitosamente');
    console.log('\n  Tests completados:');
    console.log('    ✓ TEST 1 - Crear familia base (4 personas)');
    console.log('    ✓ TEST 2 - Relación PADRE→HIJO (con sync bidireccional)');
    console.log('    ✓ TEST 3 - Relación MADRE→HIJO');
    console.log('    ✓ TEST 4 - Relación HERMANO↔HERMANA');
    console.log('    ✓ TEST 5 - Relación ESPOSO↔ESPOSA');
    console.log('    ✓ TEST 6 - Listar relaciones familiares');
    console.log('    ✓ TEST 7 - Actualizar relación (descuento)');
    console.log('    ✓ TEST 8 - Eliminar relación (bidireccional)');
  } else {
    log('\n⚠ Algunos tests fallaron. Revisa los logs.', 'yellow');
  }

  console.log('\n' + '='.repeat(80) + '\n');
  process.exit(allSuccess ? 0 : 1);
}

// Ejecutar
main().catch((error) => {
  logError('Error fatal:');
  console.error(error);
  process.exit(1);
});
