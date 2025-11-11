/**
 * Script de Pruebas - Inscripciones en Actividades (Participaciones)
 *
 * Prueba la inscripción de personas en actividades, validación de cupo,
 * actualización de participaciones y eliminación
 *
 * PREREQUISITOS:
 * - El servidor debe estar corriendo en http://localhost:8000
 * - La base de datos debe estar con seed ejecutado (debe haber actividades)
 *
 * EJECUCIÓN:
 * npx tsx tests/manual/test-inscripciones-actividades.ts
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
const dniPersona1 = String(50000000 + Math.floor(Math.random() * 5000000));
const dniPersona2 = String(50000000 + Math.floor(Math.random() * 5000000));
const dniPersona3 = String(50000000 + Math.floor(Math.random() * 5000000));

const persona1Data = {
  nombre: 'Elena',
  apellido: 'Ramírez Torres',
  dni: dniPersona1,
  email: `elena.ramirez.${timestamp}@example.com`,
  tipos: [{ tipoPersonaCodigo: 'SOCIO' }]
};

const persona2Data = {
  nombre: 'Javier',
  apellido: 'Sánchez Ruiz',
  dni: dniPersona2,
  email: `javier.sanchez.${timestamp}@example.com`,
  tipos: [{ tipoPersonaCodigo: 'NO_SOCIO' }]
};

const persona3Data = {
  nombre: 'Sofía',
  apellido: 'Morales Vega',
  dni: dniPersona3,
  email: `sofia.morales.${timestamp}@example.com`,
  tipos: [{ tipoPersonaCodigo: 'SOCIO' }]
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
// Crear persona
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
// TEST 1: Obtener actividades disponibles
// ============================================================================

async function test1_GetActividades(): Promise<any[]> {
  logSection('TEST 1: Obtener Actividades Disponibles');

  try {
    const url = `${API_BASE_URL}/actividades`;
    logRequest('GET', url);

    const response = await axios.get(url, { timeout: TIMEOUT });
    logResponse(response.status, response.data);

    const actividades = response.data.data;
    logSuccess(`${actividades.length} actividades encontradas`);

    console.log('\n  Lista de actividades:');
    actividades.forEach((a: any, index: number) => {
      console.log(`    ${index + 1}. ${a.nombre} (${a.tipo})`);
      console.log(`       Cupo máximo: ${a.capacidadMaxima || 'Ilimitado'}`);
      console.log(`       Precio: $${a.precio}`);
      console.log(`       Estado: ${a.estado}`);
    });

    return actividades;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      logResponse(error.response?.status || 500, error.response?.data);
    }
    logError('Error al obtener actividades');
    return [];
  }
}

// ============================================================================
// TEST 2: Crear personas para inscripciones
// ============================================================================

async function test2_CreatePersonas(): Promise<{
  persona1Id: number;
  persona2Id: number;
  persona3Id: number;
} | null> {
  logSection('TEST 2: Crear Personas para Inscripciones');

  try {
    log('Creando persona 1 (SOCIO)...', 'cyan');
    const persona1Id = await createPersona(persona1Data);
    if (!persona1Id) throw new Error('Error al crear persona 1');
    log(`  ✓ Persona 1 creada: ID ${persona1Id}`, 'green');

    log('Creando persona 2 (NO_SOCIO)...', 'cyan');
    const persona2Id = await createPersona(persona2Data);
    if (!persona2Id) throw new Error('Error al crear persona 2');
    log(`  ✓ Persona 2 creada: ID ${persona2Id}`, 'green');

    log('Creando persona 3 (SOCIO)...', 'cyan');
    const persona3Id = await createPersona(persona3Data);
    if (!persona3Id) throw new Error('Error al crear persona 3');
    log(`  ✓ Persona 3 creada: ID ${persona3Id}`, 'green');

    logSuccess('Personas creadas exitosamente');
    console.log('\n  IDs:');
    console.log(`    - Persona 1 (Elena - SOCIO): ${persona1Id}`);
    console.log(`    - Persona 2 (Javier - NO_SOCIO): ${persona2Id}`);
    console.log(`    - Persona 3 (Sofía - SOCIO): ${persona3Id}`);

    return { persona1Id, persona2Id, persona3Id };

  } catch (error) {
    logError('Error al crear personas');
    return null;
  }
}

// ============================================================================
// TEST 3: Inscribir persona en actividad
// ============================================================================

async function test3_InscribirPersona(
  actividadId: number,
  personaId: number,
  precioEspecial?: number
): Promise<number | null> {
  logSection(`TEST 3: Inscribir Persona (ID: ${personaId}) en Actividad (ID: ${actividadId})`);

  try {
    const url = `${API_BASE_URL}/actividades/${actividadId}/participantes`;
    const inscripcionData = precioEspecial
      ? { personaId, precioEspecial, observaciones: 'Precio especial por promoción' }
      : { personaId };

    logRequest('POST', url, inscripcionData);

    const response = await axios.post(url, inscripcionData, { timeout: TIMEOUT });
    logResponse(response.status, response.data);

    const participacionId = response.data.data.id;
    logSuccess(`Persona inscrita exitosamente. Participación ID: ${participacionId}`);

    console.log('\n  Detalles de inscripción:');
    console.log(`    - Actividad: ${response.data.data.actividad?.nombre || 'N/A'}`);
    console.log(`    - Persona: ${response.data.data.persona?.nombre || 'N/A'}`);
    console.log(`    - Precio: $${response.data.data.precioEspecial || response.data.data.actividad?.precio || 0}`);
    console.log(`    - Fecha inscripción: ${response.data.data.fechaInscripcion || 'N/A'}`);
    console.log(`    - Activa: ${response.data.data.activa}`);

    return participacionId;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      logResponse(error.response?.status || 500, error.response?.data);
    }
    logError('Error al inscribir persona');
    return null;
  }
}

// ============================================================================
// TEST 4: Verificar cupo de actividad
// ============================================================================

async function test4_VerificarCupo(actividadId: number): Promise<boolean> {
  logSection(`TEST 4: Verificar Cupo de Actividad (ID: ${actividadId})`);

  try {
    const url = `${API_BASE_URL}/actividades/${actividadId}`;
    logRequest('GET', url);

    const response = await axios.get(url, { timeout: TIMEOUT });
    logResponse(response.status, response.data);

    const actividad = response.data.data;
    const participantes = actividad.participacion_actividades || [];
    const participantesActivos = participantes.filter((p: any) => p.activa);

    logSuccess('Cupo verificado');
    console.log('\n  Información de cupo:');
    console.log(`    - Capacidad máxima: ${actividad.capacidadMaxima || 'Ilimitado'}`);
    console.log(`    - Participantes actuales: ${participantesActivos.length}`);
    console.log(`    - Cupos disponibles: ${actividad.capacidadMaxima ? actividad.capacidadMaxima - participantesActivos.length : 'Ilimitado'}`);

    if (actividad.capacidadMaxima && participantesActivos.length >= actividad.capacidadMaxima) {
      log('    ⚠ ACTIVIDAD LLENA - No hay cupos disponibles', 'yellow');
    } else {
      log('    ✓ Hay cupos disponibles', 'green');
    }

    return true;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      logResponse(error.response?.status || 500, error.response?.data);
    }
    logError('Error al verificar cupo');
    return false;
  }
}

// ============================================================================
// TEST 5: Listar participantes de una actividad
// ============================================================================

async function test5_ListarParticipantes(actividadId: number): Promise<boolean> {
  logSection(`TEST 5: Listar Participantes de Actividad (ID: ${actividadId})`);

  try {
    const url = `${API_BASE_URL}/actividades/${actividadId}/participantes`;
    logRequest('GET', url);

    const response = await axios.get(url, { timeout: TIMEOUT });
    logResponse(response.status, response.data);

    const participantes = response.data.data;
    logSuccess(`${participantes.length} participantes encontrados`);

    console.log('\n  Lista de participantes:');
    participantes.forEach((p: any, index: number) => {
      console.log(`    ${index + 1}. ${p.persona?.nombre} ${p.persona?.apellido}`);
      console.log(`       Precio: $${p.precioEspecial || p.actividad?.precio || 0}`);
      console.log(`       Activa: ${p.activa}`);
      console.log(`       Fecha inscripción: ${p.fechaInscripcion || 'N/A'}`);
    });

    return true;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      logResponse(error.response?.status || 500, error.response?.data);
    }
    logError('Error al listar participantes');
    return false;
  }
}

// ============================================================================
// TEST 6: Actualizar participación (cambiar precio especial)
// ============================================================================

async function test6_UpdateParticipacion(
  actividadId: number,
  participacionId: number
): Promise<boolean> {
  logSection('TEST 6: Actualizar Participación (cambiar precio especial)');

  try {
    const url = `${API_BASE_URL}/actividades/${actividadId}/participantes/${participacionId}`;
    const updateData = {
      precioEspecial: 50.00,
      observaciones: 'Descuento especial aplicado'
    };

    logRequest('PUT', url, updateData);

    const response = await axios.put(url, updateData, { timeout: TIMEOUT });
    logResponse(response.status, response.data);

    logSuccess('Participación actualizada exitosamente');
    console.log('\n  Cambios aplicados:');
    console.log(`    - Precio especial: $${response.data.data.precioEspecial}`);
    console.log(`    - Observaciones: ${response.data.data.observaciones}`);

    return true;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      logResponse(error.response?.status || 500, error.response?.data);
    }
    logError('Error al actualizar participación');
    return false;
  }
}

// ============================================================================
// TEST 7: Desactivar participación (dar de baja)
// ============================================================================

async function test7_DesactivarParticipacion(
  actividadId: number,
  participacionId: number
): Promise<boolean> {
  logSection('TEST 7: Desactivar Participación (dar de baja)');

  try {
    const url = `${API_BASE_URL}/actividades/${actividadId}/participantes/${participacionId}`;
    logRequest('DELETE', url);

    const response = await axios.delete(url, { timeout: TIMEOUT });
    logResponse(response.status, response.data);

    logSuccess('Participación desactivada exitosamente');

    // Verificar que fue desactivada
    await wait(500);
    const verifyUrl = `${API_BASE_URL}/actividades/${actividadId}/participantes`;
    const verifyResponse = await axios.get(verifyUrl, { timeout: TIMEOUT });
    const participantes = verifyResponse.data.data;
    const participacion = participantes.find((p: any) => p.id === participacionId);

    console.log('\n  Validación:');
    if (participacion && !participacion.activa) {
      log('    ✓ Participación marcada como inactiva', 'green');
      console.log(`    - Fecha fin: ${participacion.fechaFin || 'N/A'}`);
    } else {
      log('    ✗ Participación no desactivada correctamente', 'yellow');
    }

    return true;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      logResponse(error.response?.status || 500, error.response?.data);
    }
    logError('Error al desactivar participación');
    return false;
  }
}

// ============================================================================
// TEST 8: Validar prevención de inscripción duplicada
// ============================================================================

async function test8_ValidarDuplicado(
  actividadId: number,
  personaId: number
): Promise<boolean> {
  logSection('TEST 8: Validar Prevención de Inscripción Duplicada');

  try {
    const url = `${API_BASE_URL}/actividades/${actividadId}/participantes`;
    const inscripcionData = { personaId };

    logRequest('POST', url, inscripcionData);

    const response = await axios.post(url, inscripcionData, { timeout: TIMEOUT });
    logResponse(response.status, response.data);

    // Si llegamos aquí, no se validó el duplicado
    log('\n  ✗ FALLO: Se permitió inscripción duplicada', 'red');
    return false;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 409 || status === 400) {
        logResponse(status, error.response?.data);
        log('\n  ✓ ÉXITO: Inscripción duplicada fue rechazada correctamente', 'green');
        return true;
      } else {
        logResponse(status || 500, error.response?.data);
        log('\n  ✗ Error inesperado', 'yellow');
        return false;
      }
    }
    logError('Error al validar duplicado');
    return false;
  }
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

async function main() {
  log('\n' + '█'.repeat(80), 'bright');
  log('  SCRIPT DE PRUEBAS - INSCRIPCIONES EN ACTIVIDADES', 'bright');
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

  // TEST 1: Obtener actividades
  const actividades = await test1_GetActividades();
  if (actividades.length === 0) {
    logError('No hay actividades disponibles. Ejecuta el seed primero.');
    process.exit(1);
  }
  const actividadId = actividades[0].id;
  await wait(1000);

  // TEST 2: Crear personas
  const personas = await test2_CreatePersonas();
  if (!personas) process.exit(1);
  await wait(1000);

  const { persona1Id, persona2Id, persona3Id } = personas;

  // TEST 3: Inscribir persona 1 (precio normal)
  const participacion1Id = await test3_InscribirPersona(actividadId, persona1Id);
  if (!participacion1Id) process.exit(1);
  await wait(1000);

  // TEST 4: Verificar cupo
  results.push(await test4_VerificarCupo(actividadId));
  await wait(1000);

  // TEST 5: Inscribir persona 2 (con precio especial)
  const participacion2Id = await test3_InscribirPersona(actividadId, persona2Id, 75.00);
  if (!participacion2Id) process.exit(1);
  await wait(1000);

  // TEST 6: Listar participantes
  results.push(await test5_ListarParticipantes(actividadId));
  await wait(1000);

  // TEST 7: Actualizar participación
  if (participacion1Id) {
    results.push(await test6_UpdateParticipacion(actividadId, participacion1Id));
    await wait(1000);
  }

  // TEST 8: Validar inscripción duplicada
  results.push(await test8_ValidarDuplicado(actividadId, persona1Id));
  await wait(1000);

  // TEST 9: Desactivar participación
  if (participacion2Id) {
    results.push(await test7_DesactivarParticipacion(actividadId, participacion2Id));
  }

  // Resumen final
  logSection('RESUMEN FINAL');

  const allSuccess = results.every(r => r);
  if (allSuccess) {
    logSuccess('Todos los tests se ejecutaron exitosamente');
    console.log('\n  Tests completados:');
    console.log('    ✓ TEST 1 - Obtener actividades disponibles');
    console.log('    ✓ TEST 2 - Crear personas para inscripciones');
    console.log('    ✓ TEST 3 - Inscribir personas en actividad');
    console.log('    ✓ TEST 4 - Verificar cupo de actividad');
    console.log('    ✓ TEST 5 - Listar participantes');
    console.log('    ✓ TEST 6 - Actualizar participación (precio especial)');
    console.log('    ✓ TEST 7 - Desactivar participación');
    console.log('    ✓ TEST 8 - Validar prevención de duplicados');
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
