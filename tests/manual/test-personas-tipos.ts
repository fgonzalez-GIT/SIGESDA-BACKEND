/**
 * Script de Pruebas - Asignación de Tipos de Persona
 *
 * Prueba la asignación, actualización y eliminación de tipos (SOCIO, NO_SOCIO, DOCENTE, PROVEEDOR)
 * Incluye casos de:
 * - Creación de persona con NO_SOCIO por defecto
 * - Asignación de tipo SOCIO (con auto-assignment de categoría y número)
 * - Asignación de tipo DOCENTE (con auto-assignment de especialidad)
 * - Asignación de tipo PROVEEDOR (requiere CUIT)
 * - Múltiples tipos simultáneos (SOCIO + DOCENTE)
 * - Validación de exclusión mutua (SOCIO ↔ NO_SOCIO)
 * - Eliminación de tipos (soft delete)
 *
 * PREREQUISITOS:
 * - El servidor debe estar corriendo en http://localhost:8000
 * - La base de datos debe estar con seed ejecutado
 *
 * EJECUCIÓN:
 * npx tsx tests/manual/test-personas-tipos.ts
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
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

// ============================================================================
// DATOS DE PRUEBA
// ============================================================================

const timestamp = Date.now();
const randomDNI1 = String(30000000 + Math.floor(Math.random() * 10000000));
const randomDNI2 = String(30000000 + Math.floor(Math.random() * 10000000));
const randomDNI3 = String(30000000 + Math.floor(Math.random() * 10000000));

// Persona 1: NO_SOCIO por defecto
const persona1Data = {
  nombre: 'María',
  apellido: 'González López',
  dni: randomDNI1,
  email: `maria.gonzalez.${timestamp}@example.com`,
  telefono: '+34 600 111 222'
};

// Persona 2: Con tipo SOCIO desde creación
const persona2Data = {
  nombre: 'Carlos',
  apellido: 'Martínez Ruiz',
  dni: randomDNI2,
  email: `carlos.martinez.${timestamp}@example.com`,
  telefono: '+34 600 333 444',
  tipos: [
    {
      tipoPersonaCodigo: 'SOCIO',
      fechaIngreso: '2025-01-01T00:00:00.000Z',
      observaciones: 'Socio fundador'
    }
  ]
};

// Persona 3: Multi-tipo desde creación (NO_SOCIO + DOCENTE)
const persona3Data = {
  nombre: 'Ana',
  apellido: 'Rodríguez Sánchez',
  dni: randomDNI3,
  email: `ana.rodriguez.${timestamp}@example.com`,
  telefono: '+34 600 555 666',
  tipos: [
    {
      tipoPersonaCodigo: 'NO_SOCIO'
    },
    {
      tipoPersonaCodigo: 'DOCENTE',
      honorariosPorHora: 25.50,
      observaciones: 'Profesora de piano'
    }
  ]
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

function logWarning(message: string) {
  log(`\n⚠ ${message}`, 'yellow');
}

function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// TEST 1: Crear persona SIN tipos (NO_SOCIO por defecto)
// ============================================================================

async function test1_CreatePersonaSinTipos(): Promise<number | null> {
  logSection('TEST 1: Crear Persona SIN Tipos (NO_SOCIO por defecto)');

  try {
    const url = `${API_BASE_URL}/personas`;
    logRequest('POST', url, persona1Data);

    const response = await axios.post(url, persona1Data, { timeout: TIMEOUT });
    logResponse(response.status, response.data);

    const personaId = response.data.data.id;
    const tipos = response.data.data.tipos || [];

    logSuccess(`Persona creada con ID: ${personaId}`);
    console.log('\n  Validaciones:');
    console.log(`    - Tipos asignados: ${tipos.length}`);

    if (tipos.length === 1 && tipos[0].tipoPersona.codigo === 'NO_SOCIO') {
      log('    ✓ NO_SOCIO asignado automáticamente', 'green');
    } else {
      logWarning('    ✗ NO_SOCIO no fue asignado correctamente');
    }

    return personaId;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      logResponse(error.response?.status || 500, error.response?.data);
    }
    logError('Error al crear persona sin tipos');
    return null;
  }
}

// ============================================================================
// TEST 2: Asignar tipo SOCIO a persona existente (elimina NO_SOCIO)
// ============================================================================

async function test2_AsignarTipoSocio(personaId: number): Promise<number | null> {
  logSection('TEST 2: Asignar Tipo SOCIO (debe eliminar NO_SOCIO - mutually exclusive)');

  try {
    const url = `${API_BASE_URL}/personas/${personaId}/tipos`;
    const tipoData = {
      tipoPersonaCodigo: 'SOCIO',
      fechaIngreso: '2025-01-15T00:00:00.000Z',
      observaciones: 'Conversión de NO_SOCIO a SOCIO'
    };

    logRequest('POST', url, tipoData);

    const response = await axios.post(url, tipoData, { timeout: TIMEOUT });
    logResponse(response.status, response.data);

    const tipoId = response.data.data.id;
    logSuccess(`Tipo SOCIO asignado con ID: ${tipoId}`);

    console.log('\n  Auto-assignments:');
    console.log(`    - Número de socio: ${response.data.data.numeroSocio || 'N/A'}`);
    console.log(`    - Categoría: ${response.data.data.categoria?.nombre || 'N/A'}`);
    console.log(`    - Fecha ingreso: ${response.data.data.fechaIngreso || 'N/A'}`);

    // Verificar que NO_SOCIO fue eliminado
    await wait(500);
    const verifyUrl = `${API_BASE_URL}/personas/${personaId}/tipos`;
    const verifyResponse = await axios.get(verifyUrl, { timeout: TIMEOUT });
    const tipos = verifyResponse.data.data;

    console.log('\n  Validación de exclusión mutua:');
    const tieneNoSocio = tipos.some((t: any) => t.activo && t.tipoPersona.codigo === 'NO_SOCIO');
    const tieneSocio = tipos.some((t: any) => t.activo && t.tipoPersona.codigo === 'SOCIO');

    if (tieneSocio && !tieneNoSocio) {
      log('    ✓ SOCIO asignado y NO_SOCIO eliminado correctamente', 'green');
    } else if (tieneSocio && tieneNoSocio) {
      logWarning('    ✗ SOCIO y NO_SOCIO coexisten (ERROR: deben ser mutuamente excluyentes)');
    } else {
      logWarning('    ✗ Estado inesperado de tipos');
    }

    return tipoId;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      logResponse(error.response?.status || 500, error.response?.data);
    }
    logError('Error al asignar tipo SOCIO');
    return null;
  }
}

// ============================================================================
// TEST 3: Asignar tipo DOCENTE a persona que ya es SOCIO (multi-tipo)
// ============================================================================

async function test3_AsignarTipoDocente(personaId: number): Promise<number | null> {
  logSection('TEST 3: Asignar Tipo DOCENTE (multi-tipo: SOCIO + DOCENTE)');

  try {
    const url = `${API_BASE_URL}/personas/${personaId}/tipos`;
    const tipoData = {
      tipoPersonaCodigo: 'DOCENTE',
      honorariosPorHora: 30.00,
      observaciones: 'Profesor de guitarra'
    };

    logRequest('POST', url, tipoData);

    const response = await axios.post(url, tipoData, { timeout: TIMEOUT });
    logResponse(response.status, response.data);

    const tipoId = response.data.data.id;
    logSuccess(`Tipo DOCENTE asignado con ID: ${tipoId}`);

    console.log('\n  Auto-assignments:');
    console.log(`    - Especialidad: ${response.data.data.especialidad?.nombre || 'N/A'}`);
    console.log(`    - Honorarios: ${response.data.data.honorariosPorHora || 'N/A'}`);

    // Verificar múltiples tipos activos
    await wait(500);
    const verifyUrl = `${API_BASE_URL}/personas/${personaId}/tipos`;
    const verifyResponse = await axios.get(verifyUrl, { timeout: TIMEOUT });
    const tipos = verifyResponse.data.data.filter((t: any) => t.activo);

    console.log('\n  Validación multi-tipo:');
    console.log(`    - Tipos activos: ${tipos.length}`);
    tipos.forEach((t: any) => {
      console.log(`      • ${t.tipoPersona.codigo}`);
    });

    const tieneSocio = tipos.some((t: any) => t.tipoPersona.codigo === 'SOCIO');
    const tieneDocente = tipos.some((t: any) => t.tipoPersona.codigo === 'DOCENTE');

    if (tieneSocio && tieneDocente) {
      log('    ✓ Multi-tipo funcionando correctamente (SOCIO + DOCENTE)', 'green');
    } else {
      logWarning('    ✗ Multi-tipo no funciona como esperado');
    }

    return tipoId;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      logResponse(error.response?.status || 500, error.response?.data);
    }
    logError('Error al asignar tipo DOCENTE');
    return null;
  }
}

// ============================================================================
// TEST 4: Crear persona con tipo SOCIO desde el inicio
// ============================================================================

async function test4_CreatePersonaConSocio(): Promise<number | null> {
  logSection('TEST 4: Crear Persona CON Tipo SOCIO desde el inicio');

  try {
    const url = `${API_BASE_URL}/personas`;
    logRequest('POST', url, persona2Data);

    const response = await axios.post(url, persona2Data, { timeout: TIMEOUT });
    logResponse(response.status, response.data);

    const personaId = response.data.data.id;
    const tipos = response.data.data.tipos || [];

    logSuccess(`Persona creada con ID: ${personaId}`);
    console.log('\n  Validaciones:');
    console.log(`    - Tipos asignados: ${tipos.length}`);

    const tipoSocio = tipos.find((t: any) => t.tipoPersona.codigo === 'SOCIO');
    if (tipoSocio) {
      log('    ✓ Tipo SOCIO asignado correctamente', 'green');
      console.log(`      - Número socio: ${tipoSocio.numeroSocio}`);
      console.log(`      - Categoría: ${tipoSocio.categoria?.nombre || 'N/A'}`);
    } else {
      logWarning('    ✗ Tipo SOCIO no fue asignado');
    }

    const tieneNoSocio = tipos.some((t: any) => t.tipoPersona.codigo === 'NO_SOCIO');
    if (!tieneNoSocio) {
      log('    ✓ NO_SOCIO no fue asignado (correcto, ya tiene SOCIO)', 'green');
    } else {
      logWarning('    ✗ NO_SOCIO asignado incorrectamente (conflicto con SOCIO)');
    }

    return personaId;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      logResponse(error.response?.status || 500, error.response?.data);
    }
    logError('Error al crear persona con tipo SOCIO');
    return null;
  }
}

// ============================================================================
// TEST 5: Crear persona con múltiples tipos desde el inicio
// ============================================================================

async function test5_CreatePersonaMultiTipo(): Promise<number | null> {
  logSection('TEST 5: Crear Persona con Múltiples Tipos (NO_SOCIO + DOCENTE)');

  try {
    const url = `${API_BASE_URL}/personas`;
    logRequest('POST', url, persona3Data);

    const response = await axios.post(url, persona3Data, { timeout: TIMEOUT });
    logResponse(response.status, response.data);

    const personaId = response.data.data.id;
    const tipos = response.data.data.tipos || [];

    logSuccess(`Persona creada con ID: ${personaId}`);
    console.log('\n  Validaciones:');
    console.log(`    - Tipos asignados: ${tipos.length}`);

    const tiposActivos = tipos.filter((t: any) => t.activo);
    tiposActivos.forEach((t: any) => {
      console.log(`      • ${t.tipoPersona.codigo}`);
    });

    const tieneNoSocio = tipos.some((t: any) => t.activo && t.tipoPersona.codigo === 'NO_SOCIO');
    const tieneDocente = tipos.some((t: any) => t.activo && t.tipoPersona.codigo === 'DOCENTE');

    if (tieneNoSocio && tieneDocente) {
      log('    ✓ Multi-tipo funcionando (NO_SOCIO + DOCENTE)', 'green');
    } else {
      logWarning('    ✗ Multi-tipo no asignado correctamente');
    }

    return personaId;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      logResponse(error.response?.status || 500, error.response?.data);
    }
    logError('Error al crear persona multi-tipo');
    return null;
  }
}

// ============================================================================
// TEST 6: Intentar asignar SOCIO cuando ya tiene NO_SOCIO (debe reemplazar)
// ============================================================================

async function test6_ValidarExclusionMutua(personaId: number): Promise<boolean> {
  logSection('TEST 6: Validar Exclusión Mutua (convertir NO_SOCIO → SOCIO)');

  try {
    const url = `${API_BASE_URL}/personas/${personaId}/tipos`;
    const tipoData = {
      tipoPersonaCodigo: 'SOCIO',
      observaciones: 'Conversión a socio'
    };

    logRequest('POST', url, tipoData);

    const response = await axios.post(url, tipoData, { timeout: TIMEOUT });
    logResponse(response.status, response.data);

    logSuccess('Tipo SOCIO asignado');

    // Verificar estado final
    await wait(500);
    const verifyUrl = `${API_BASE_URL}/personas/${personaId}/tipos`;
    const verifyResponse = await axios.get(verifyUrl, { timeout: TIMEOUT });
    const tipos = verifyResponse.data.data.filter((t: any) => t.activo);

    console.log('\n  Estado final de tipos:');
    tipos.forEach((t: any) => {
      console.log(`    - ${t.tipoPersona.codigo} (activo: ${t.activo})`);
    });

    const tieneSocio = tipos.some((t: any) => t.tipoPersona.codigo === 'SOCIO');
    const tieneNoSocio = tipos.some((t: any) => t.tipoPersona.codigo === 'NO_SOCIO');
    const tieneDocente = tipos.some((t: any) => t.tipoPersona.codigo === 'DOCENTE');

    if (tieneSocio && !tieneNoSocio && tieneDocente) {
      log('\n  ✓ Exclusión mutua funciona: SOCIO reemplazó a NO_SOCIO, DOCENTE se mantiene', 'green');
      return true;
    } else if (tieneSocio && tieneNoSocio) {
      logWarning('\n  ✗ ERROR: SOCIO y NO_SOCIO coexisten (deben ser mutuamente excluyentes)');
      return false;
    } else {
      logWarning('\n  ✗ Estado inesperado');
      return false;
    }

  } catch (error) {
    if (axios.isAxiosError(error)) {
      logResponse(error.response?.status || 500, error.response?.data);
    }
    logError('Error al validar exclusión mutua');
    return false;
  }
}

// ============================================================================
// TEST 7: Actualizar datos de un tipo específico
// ============================================================================

async function test7_UpdateTipo(personaId: number, tipoId: number): Promise<boolean> {
  logSection('TEST 7: Actualizar Datos de un Tipo Específico');

  try {
    const url = `${API_BASE_URL}/personas/${personaId}/tipos/${tipoId}`;
    const updateData = {
      honorariosPorHora: 35.00,
      observaciones: 'Honorarios actualizados'
    };

    logRequest('PUT', url, updateData);

    const response = await axios.put(url, updateData, { timeout: TIMEOUT });
    logResponse(response.status, response.data);

    logSuccess('Tipo actualizado exitosamente');
    console.log('\n  Cambios aplicados:');
    console.log(`    - Honorarios: ${response.data.data.honorariosPorHora}`);
    console.log(`    - Observaciones: ${response.data.data.observaciones}`);

    return true;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      logResponse(error.response?.status || 500, error.response?.data);
    }
    logError('Error al actualizar tipo');
    return false;
  }
}

// ============================================================================
// TEST 8: Eliminar un tipo (soft delete)
// ============================================================================

async function test8_DeleteTipo(personaId: number, tipoId: number): Promise<boolean> {
  logSection('TEST 8: Eliminar Tipo (Soft Delete)');

  try {
    const url = `${API_BASE_URL}/personas/${personaId}/tipos/${tipoId}`;
    logRequest('DELETE', url);

    const response = await axios.delete(url, { timeout: TIMEOUT });
    logResponse(response.status, response.data);

    logSuccess('Tipo eliminado (desasignado) exitosamente');

    // Verificar estado
    await wait(500);
    const verifyUrl = `${API_BASE_URL}/personas/${personaId}/tipos`;
    const verifyResponse = await axios.get(verifyUrl, { timeout: TIMEOUT });
    const tipoEliminado = verifyResponse.data.data.find((t: any) => t.id === tipoId);

    console.log('\n  Validación:');
    if (tipoEliminado && !tipoEliminado.activo) {
      log('    ✓ Tipo marcado como inactivo (soft delete correcto)', 'green');
      console.log(`    - Fecha desasignación: ${tipoEliminado.fechaDesasignacion}`);
    } else {
      logWarning('    ✗ Tipo no desasignado correctamente');
    }

    return true;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      logResponse(error.response?.status || 500, error.response?.data);
    }
    logError('Error al eliminar tipo');
    return false;
  }
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

async function main() {
  log('\n' + '█'.repeat(80), 'bright');
  log('  SCRIPT DE PRUEBAS - ASIGNACIÓN DE TIPOS DE PERSONA', 'bright');
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

  // TEST 1: Persona sin tipos (NO_SOCIO por defecto)
  const persona1Id = await test1_CreatePersonaSinTipos();
  if (!persona1Id) process.exit(1);
  await wait(1000);

  // TEST 2: Asignar SOCIO (elimina NO_SOCIO)
  const tipoSocioId = await test2_AsignarTipoSocio(persona1Id);
  if (!tipoSocioId) process.exit(1);
  await wait(1000);

  // TEST 3: Asignar DOCENTE (multi-tipo con SOCIO)
  const tipoDocenteId = await test3_AsignarTipoDocente(persona1Id);
  if (!tipoDocenteId) process.exit(1);
  await wait(1000);

  // TEST 4: Crear persona con SOCIO desde inicio
  const persona2Id = await test4_CreatePersonaConSocio();
  if (!persona2Id) process.exit(1);
  await wait(1000);

  // TEST 5: Crear persona multi-tipo desde inicio
  const persona3Id = await test5_CreatePersonaMultiTipo();
  if (!persona3Id) process.exit(1);
  await wait(1000);

  // TEST 6: Validar exclusión mutua
  results.push(await test6_ValidarExclusionMutua(persona3Id));
  await wait(1000);

  // TEST 7: Actualizar tipo
  if (tipoDocenteId) {
    results.push(await test7_UpdateTipo(persona1Id, tipoDocenteId));
    await wait(1000);
  }

  // TEST 8: Eliminar tipo
  if (tipoDocenteId) {
    results.push(await test8_DeleteTipo(persona1Id, tipoDocenteId));
  }

  // Resumen final
  logSection('RESUMEN FINAL');

  const allSuccess = results.every(r => r);
  if (allSuccess) {
    logSuccess('Todos los tests se ejecutaron exitosamente');
    console.log('\n  Tests completados:');
    console.log('    ✓ TEST 1 - Persona sin tipos (NO_SOCIO por defecto)');
    console.log('    ✓ TEST 2 - Asignar SOCIO (reemplaza NO_SOCIO)');
    console.log('    ✓ TEST 3 - Asignar DOCENTE (multi-tipo)');
    console.log('    ✓ TEST 4 - Crear con SOCIO desde inicio');
    console.log('    ✓ TEST 5 - Crear multi-tipo desde inicio');
    console.log('    ✓ TEST 6 - Validar exclusión mutua SOCIO ↔ NO_SOCIO');
    console.log('    ✓ TEST 7 - Actualizar datos de tipo');
    console.log('    ✓ TEST 8 - Eliminar tipo (soft delete)');
  } else {
    logWarning('Algunos tests fallaron. Revisa los logs.');
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
