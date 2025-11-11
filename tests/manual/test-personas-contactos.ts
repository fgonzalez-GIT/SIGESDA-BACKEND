/**
 * Script de Pruebas - Gestión de Contactos de Persona
 *
 * Prueba la creación, lectura, actualización y eliminación de contactos
 * Tipos de contacto: EMAIL, TELEFONO, CELULAR, WHATSAPP, OTRO
 *
 * PREREQUISITOS:
 * - El servidor debe estar corriendo en http://localhost:8000
 * - La base de datos debe estar con seed ejecutado
 *
 * EJECUCIÓN:
 * npx tsx tests/manual/test-personas-contactos.ts
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
const randomDNI = String(40000000 + Math.floor(Math.random() * 5000000));

const personaData = {
  nombre: 'Pedro',
  apellido: 'Fernández García',
  dni: randomDNI,
  email: `pedro.fernandez.${timestamp}@example.com`
};

const contacto1Data = {
  tipoContacto: 'EMAIL',
  valor: `pedro.work.${timestamp}@company.com`,
  principal: true,
  observaciones: 'Email de trabajo'
};

const contacto2Data = {
  tipoContacto: 'TELEFONO',
  valor: '+34 91 123 45 67',
  principal: false,
  observaciones: 'Teléfono fijo'
};

const contacto3Data = {
  tipoContacto: 'CELULAR',
  valor: '+34 600 777 888',
  principal: true,
  observaciones: 'Móvil personal'
};

const contacto4Data = {
  tipoContacto: 'WHATSAPP',
  valor: '+34 600 777 888',
  principal: false,
  observaciones: 'WhatsApp (mismo que móvil)'
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
// TEST 1: Crear persona base
// ============================================================================

async function test1_CreatePersona(): Promise<number | null> {
  logSection('TEST 1: Crear Persona Base (sin contactos)');

  try {
    const url = `${API_BASE_URL}/personas`;
    logRequest('POST', url, personaData);

    const response = await axios.post(url, personaData, { timeout: TIMEOUT });
    logResponse(response.status, response.data);

    const personaId = response.data.data.id;
    logSuccess(`Persona creada con ID: ${personaId}`);

    return personaId;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      logResponse(error.response?.status || 500, error.response?.data);
    }
    logError('Error al crear persona');
    return null;
  }
}

// ============================================================================
// TEST 2: Agregar contacto EMAIL
// ============================================================================

async function test2_AddContactoEmail(personaId: number): Promise<number | null> {
  logSection('TEST 2: Agregar Contacto EMAIL');

  try {
    const url = `${API_BASE_URL}/personas/${personaId}/contactos`;
    logRequest('POST', url, contacto1Data);

    const response = await axios.post(url, contacto1Data, { timeout: TIMEOUT });
    logResponse(response.status, response.data);

    const contactoId = response.data.data.id;
    logSuccess(`Contacto EMAIL creado con ID: ${contactoId}`);

    console.log('\n  Detalles:');
    console.log(`    - Tipo: ${response.data.data.tipoContacto}`);
    console.log(`    - Valor: ${response.data.data.valor}`);
    console.log(`    - Principal: ${response.data.data.principal}`);

    return contactoId;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      logResponse(error.response?.status || 500, error.response?.data);
    }
    logError('Error al agregar contacto EMAIL');
    return null;
  }
}

// ============================================================================
// TEST 3: Agregar contacto TELEFONO
// ============================================================================

async function test3_AddContactoTelefono(personaId: number): Promise<number | null> {
  logSection('TEST 3: Agregar Contacto TELEFONO');

  try {
    const url = `${API_BASE_URL}/personas/${personaId}/contactos`;
    logRequest('POST', url, contacto2Data);

    const response = await axios.post(url, contacto2Data, { timeout: TIMEOUT });
    logResponse(response.status, response.data);

    const contactoId = response.data.data.id;
    logSuccess(`Contacto TELEFONO creado con ID: ${contactoId}`);

    return contactoId;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      logResponse(error.response?.status || 500, error.response?.data);
    }
    logError('Error al agregar contacto TELEFONO');
    return null;
  }
}

// ============================================================================
// TEST 4: Agregar contacto CELULAR
// ============================================================================

async function test4_AddContactoCelular(personaId: number): Promise<number | null> {
  logSection('TEST 4: Agregar Contacto CELULAR');

  try {
    const url = `${API_BASE_URL}/personas/${personaId}/contactos`;
    logRequest('POST', url, contacto3Data);

    const response = await axios.post(url, contacto3Data, { timeout: TIMEOUT });
    logResponse(response.status, response.data);

    const contactoId = response.data.data.id;
    logSuccess(`Contacto CELULAR creado con ID: ${contactoId}`);

    return contactoId;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      logResponse(error.response?.status || 500, error.response?.data);
    }
    logError('Error al agregar contacto CELULAR');
    return null;
  }
}

// ============================================================================
// TEST 5: Agregar contacto WHATSAPP
// ============================================================================

async function test5_AddContactoWhatsApp(personaId: number): Promise<number | null> {
  logSection('TEST 5: Agregar Contacto WHATSAPP');

  try {
    const url = `${API_BASE_URL}/personas/${personaId}/contactos`;
    logRequest('POST', url, contacto4Data);

    const response = await axios.post(url, contacto4Data, { timeout: TIMEOUT });
    logResponse(response.status, response.data);

    const contactoId = response.data.data.id;
    logSuccess(`Contacto WHATSAPP creado con ID: ${contactoId}`);

    return contactoId;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      logResponse(error.response?.status || 500, error.response?.data);
    }
    logError('Error al agregar contacto WHATSAPP');
    return null;
  }
}

// ============================================================================
// TEST 6: Listar todos los contactos de la persona
// ============================================================================

async function test6_ListContactos(personaId: number): Promise<boolean> {
  logSection('TEST 6: Listar Todos los Contactos');

  try {
    const url = `${API_BASE_URL}/personas/${personaId}/contactos`;
    logRequest('GET', url);

    const response = await axios.get(url, { timeout: TIMEOUT });
    logResponse(response.status, response.data);

    const contactos = response.data.data;
    logSuccess(`${contactos.length} contactos encontrados`);

    console.log('\n  Lista de contactos:');
    contactos.forEach((c: any, index: number) => {
      console.log(`    ${index + 1}. [${c.tipoContacto}] ${c.valor}`);
      console.log(`       Principal: ${c.principal}, Activo: ${c.activo}`);
      if (c.observaciones) {
        console.log(`       Observaciones: ${c.observaciones}`);
      }
    });

    return true;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      logResponse(error.response?.status || 500, error.response?.data);
    }
    logError('Error al listar contactos');
    return false;
  }
}

// ============================================================================
// TEST 7: Actualizar un contacto
// ============================================================================

async function test7_UpdateContacto(personaId: number, contactoId: number): Promise<boolean> {
  logSection('TEST 7: Actualizar Contacto');

  try {
    const url = `${API_BASE_URL}/personas/${personaId}/contactos/${contactoId}`;
    const updateData = {
      valor: '+34 91 999 88 77',
      observaciones: 'Teléfono fijo actualizado',
      principal: true
    };

    logRequest('PUT', url, updateData);

    const response = await axios.put(url, updateData, { timeout: TIMEOUT });
    logResponse(response.status, response.data);

    logSuccess('Contacto actualizado exitosamente');
    console.log('\n  Cambios aplicados:');
    console.log(`    - Valor: ${response.data.data.valor}`);
    console.log(`    - Observaciones: ${response.data.data.observaciones}`);
    console.log(`    - Principal: ${response.data.data.principal}`);

    return true;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      logResponse(error.response?.status || 500, error.response?.data);
    }
    logError('Error al actualizar contacto');
    return false;
  }
}

// ============================================================================
// TEST 8: Eliminar un contacto
// ============================================================================

async function test8_DeleteContacto(personaId: number, contactoId: number): Promise<boolean> {
  logSection('TEST 8: Eliminar Contacto');

  try {
    const url = `${API_BASE_URL}/personas/${personaId}/contactos/${contactoId}`;
    logRequest('DELETE', url);

    const response = await axios.delete(url, { timeout: TIMEOUT });
    logResponse(response.status, response.data);

    logSuccess('Contacto eliminado exitosamente');

    // Verificar que fue eliminado
    await wait(500);
    const verifyUrl = `${API_BASE_URL}/personas/${personaId}/contactos`;
    const verifyResponse = await axios.get(verifyUrl, { timeout: TIMEOUT });
    const contactos = verifyResponse.data.data;
    const contactoEliminado = contactos.find((c: any) => c.id === contactoId);

    console.log('\n  Validación:');
    if (!contactoEliminado || !contactoEliminado.activo) {
      log('    ✓ Contacto eliminado o marcado como inactivo', 'green');
    } else {
      log('    ✗ Contacto aún aparece activo', 'yellow');
    }

    return true;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      logResponse(error.response?.status || 500, error.response?.data);
    }
    logError('Error al eliminar contacto');
    return false;
  }
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

async function main() {
  log('\n' + '█'.repeat(80), 'bright');
  log('  SCRIPT DE PRUEBAS - GESTIÓN DE CONTACTOS', 'bright');
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

  // TEST 1: Crear persona
  const personaId = await test1_CreatePersona();
  if (!personaId) process.exit(1);
  await wait(1000);

  // TEST 2: Agregar EMAIL
  const contacto1Id = await test2_AddContactoEmail(personaId);
  if (!contacto1Id) process.exit(1);
  await wait(1000);

  // TEST 3: Agregar TELEFONO
  const contacto2Id = await test3_AddContactoTelefono(personaId);
  if (!contacto2Id) process.exit(1);
  await wait(1000);

  // TEST 4: Agregar CELULAR
  const contacto3Id = await test4_AddContactoCelular(personaId);
  if (!contacto3Id) process.exit(1);
  await wait(1000);

  // TEST 5: Agregar WHATSAPP
  const contacto4Id = await test5_AddContactoWhatsApp(personaId);
  if (!contacto4Id) process.exit(1);
  await wait(1000);

  // TEST 6: Listar contactos
  results.push(await test6_ListContactos(personaId));
  await wait(1000);

  // TEST 7: Actualizar contacto
  if (contacto2Id) {
    results.push(await test7_UpdateContacto(personaId, contacto2Id));
    await wait(1000);
  }

  // TEST 8: Eliminar contacto
  if (contacto1Id) {
    results.push(await test8_DeleteContacto(personaId, contacto1Id));
  }

  // Resumen final
  logSection('RESUMEN FINAL');

  const allSuccess = results.every(r => r);
  if (allSuccess) {
    logSuccess('Todos los tests se ejecutaron exitosamente');
    console.log('\n  Tests completados:');
    console.log('    ✓ TEST 1 - Crear persona base');
    console.log('    ✓ TEST 2 - Agregar contacto EMAIL');
    console.log('    ✓ TEST 3 - Agregar contacto TELEFONO');
    console.log('    ✓ TEST 4 - Agregar contacto CELULAR');
    console.log('    ✓ TEST 5 - Agregar contacto WHATSAPP');
    console.log('    ✓ TEST 6 - Listar todos los contactos');
    console.log('    ✓ TEST 7 - Actualizar contacto');
    console.log('    ✓ TEST 8 - Eliminar contacto');
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
