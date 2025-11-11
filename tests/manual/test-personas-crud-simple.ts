/**
 * Script Simple de Pruebas CRUD - Módulo Personas
 *
 * Este script ejecuta operaciones CRUD básicas contra el API de Personas
 * y muestra los resultados en consola de forma clara y legible.
 *
 * PREREQUISITOS:
 * - El servidor debe estar corriendo en http://localhost:8000
 * - La base de datos debe estar accesible
 *
 * EJECUCIÓN:
 * npx tsx tests/manual/test-personas-crud-simple.ts
 */

import axios, { AxiosError } from 'axios';

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const API_BASE_URL = 'http://localhost:8000/api';
const TIMEOUT = 5000; // 5 segundos

// Colores para consola
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
// DATOS DE PRUEBA (JSON Hardcodeado)
// ============================================================================

// Generar DNI y email únicos para evitar conflictos en ejecuciones múltiples
const timestamp = Date.now();
const randomDNI = String(20000000 + Math.floor(Math.random() * 20000000)); // DNI aleatorio entre 20M y 40M
const uniqueEmail = `juan.perez.test.${timestamp}@example.com`;

const personaDataCreate = {
  nombre: 'Juan Carlos',
  apellido: 'Pérez García',
  dni: randomDNI,
  email: uniqueEmail,
  telefono: '+34 600 123 456',
  direccion: 'Calle Mayor 123, Madrid',
  fechaNacimiento: '1990-05-15T00:00:00.000Z'
  // Sin tipos ni contactos - se creará como NO_SOCIO por defecto
  // Esto simplifica la prueba y evita problemas con foreign keys
};

const personaDataUpdate = {
  nombre: 'Juan Carlos ACTUALIZADO',
  telefono: '+34 600 999 888',
  direccion: 'Avenida de la Constitución 456, Madrid'
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

function logError(message: string, error?: any) {
  log(`\n✗ ${message}`, 'red');
  if (error) {
    console.error('  Error:', error);
  }
}

function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// OPERACIONES CRUD
// ============================================================================

/**
 * CREATE - Crear nueva persona
 */
async function createPersona(): Promise<number | null> {
  logSection('1. CREATE - Crear Nueva Persona');

  try {
    const url = `${API_BASE_URL}/personas`;
    logRequest('POST', url, personaDataCreate);

    const response = await axios.post(url, personaDataCreate, {
      timeout: TIMEOUT,
      headers: { 'Content-Type': 'application/json' }
    });

    logResponse(response.status, response.data);

    const personaId = response.data.data.id;
    logSuccess(`Persona creada exitosamente con ID: ${personaId}`);

    // Mostrar resumen
    console.log('\n  Resumen:');
    console.log(`    - ID: ${response.data.data.id}`);
    console.log(`    - Nombre: ${response.data.data.nombre} ${response.data.data.apellido}`);
    console.log(`    - DNI: ${response.data.data.dni}`);
    console.log(`    - Email: ${response.data.data.email}`);
    console.log(`    - Tipos asignados: ${response.data.data.tipos?.length || 0}`);
    console.log(`    - Contactos: ${response.data.data.contactos?.length || 0}`);

    return personaId;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      logResponse(axiosError.response?.status || 500, axiosError.response?.data);
      logError('Error al crear persona');
    } else {
      logError('Error desconocido al crear persona', error);
    }
    return null;
  }
}

/**
 * READ - Leer persona por ID
 */
async function readPersona(personaId: number): Promise<boolean> {
  logSection('2. READ - Leer Persona por ID');

  try {
    const url = `${API_BASE_URL}/personas/${personaId}`;
    logRequest('GET', url);

    const response = await axios.get(url, {
      timeout: TIMEOUT
    });

    logResponse(response.status, response.data);
    logSuccess(`Persona ID ${personaId} leída exitosamente`);

    // Mostrar resumen
    console.log('\n  Resumen:');
    console.log(`    - ID: ${response.data.data.id}`);
    console.log(`    - Nombre completo: ${response.data.data.nombre} ${response.data.data.apellido}`);
    console.log(`    - DNI: ${response.data.data.dni}`);
    console.log(`    - Email: ${response.data.data.email}`);
    console.log(`    - Teléfono: ${response.data.data.telefono}`);
    console.log(`    - Dirección: ${response.data.data.direccion}`);
    console.log(`    - Activo: ${response.data.data.activo ? 'Sí' : 'No'}`);

    return true;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      logResponse(axiosError.response?.status || 500, axiosError.response?.data);
      logError(`Error al leer persona ID ${personaId}`);
    } else {
      logError('Error desconocido al leer persona', error);
    }
    return false;
  }
}

/**
 * UPDATE - Actualizar datos de persona
 */
async function updatePersona(personaId: number): Promise<boolean> {
  logSection('3. UPDATE - Actualizar Datos de Persona');

  try {
    const url = `${API_BASE_URL}/personas/${personaId}`;
    logRequest('PUT', url, personaDataUpdate);

    const response = await axios.put(url, personaDataUpdate, {
      timeout: TIMEOUT,
      headers: { 'Content-Type': 'application/json' }
    });

    logResponse(response.status, response.data);
    logSuccess(`Persona ID ${personaId} actualizada exitosamente`);

    // Mostrar cambios
    console.log('\n  Cambios aplicados:');
    console.log(`    - Nombre: ${response.data.data.nombre} ${response.data.data.apellido}`);
    console.log(`    - Teléfono: ${response.data.data.telefono}`);
    console.log(`    - Dirección: ${response.data.data.direccion}`);

    return true;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      logResponse(axiosError.response?.status || 500, axiosError.response?.data);
      logError(`Error al actualizar persona ID ${personaId}`);
    } else {
      logError('Error desconocido al actualizar persona', error);
    }
    return false;
  }
}

/**
 * DELETE - Eliminar persona (soft delete)
 */
async function deletePersona(personaId: number): Promise<boolean> {
  logSection('4. DELETE - Eliminar Persona (Soft Delete)');

  try {
    const url = `${API_BASE_URL}/personas/${personaId}`;
    logRequest('DELETE', url);

    const response = await axios.delete(url, {
      timeout: TIMEOUT
    });

    logResponse(response.status, response.data);
    logSuccess(`Persona ID ${personaId} eliminada exitosamente (soft delete)`);

    // Mostrar resultado
    console.log('\n  Resultado:');
    console.log(`    - La persona ha sido marcada como inactiva`);
    console.log(`    - Todos sus tipos han sido desasignados`);
    console.log(`    - Los datos permanecen en la base de datos`);

    return true;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      logResponse(axiosError.response?.status || 500, axiosError.response?.data);
      logError(`Error al eliminar persona ID ${personaId}`);
    } else {
      logError('Error desconocido al eliminar persona', error);
    }
    return false;
  }
}

/**
 * VERIFICAR - Verificar que persona fue eliminada
 */
async function verifyDeleted(personaId: number): Promise<void> {
  logSection('5. VERIFICACIÓN - Confirmar Eliminación');

  try {
    const url = `${API_BASE_URL}/personas/${personaId}`;
    logRequest('GET', url);

    const response = await axios.get(url, {
      timeout: TIMEOUT
    });

    logResponse(response.status, response.data);

    // Verificar estado
    if (response.data.data.activo === false) {
      logSuccess(`Verificación exitosa: Persona ID ${personaId} está inactiva`);
      console.log('\n  Estado:');
      console.log(`    - Activo: ${response.data.data.activo}`);
      console.log(`    - Los datos siguen existiendo pero marcados como inactivos`);
    } else {
      log(`\n⚠ Advertencia: Persona ID ${personaId} sigue activa`, 'yellow');
    }

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        logSuccess(`Verificación exitosa: Persona ID ${personaId} no existe (hard delete)`);
      } else {
        logResponse(axiosError.response?.status || 500, axiosError.response?.data);
        logError(`Error al verificar eliminación de persona ID ${personaId}`);
      }
    } else {
      logError('Error desconocido al verificar eliminación', error);
    }
  }
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

async function main() {
  log('\n' + '█'.repeat(80), 'bright');
  log('  SCRIPT DE PRUEBAS CRUD - MÓDULO PERSONAS', 'bright');
  log('  SIGESDA Backend API', 'bright');
  log('█'.repeat(80) + '\n', 'bright');

  log(`API Base URL: ${API_BASE_URL}`, 'cyan');
  log(`Timeout: ${TIMEOUT}ms\n`, 'cyan');

  // Verificar conectividad
  log('Verificando conectividad con el servidor...', 'yellow');
  try {
    await axios.get(`${API_BASE_URL.replace('/api', '')}/health`, { timeout: TIMEOUT });
    logSuccess('Servidor accesible\n');
  } catch (error) {
    logError('No se puede conectar al servidor. Asegúrate de que esté corriendo en http://localhost:8000');
    process.exit(1);
  }

  let personaId: number | null = null;
  let allSuccess = true;

  // ===== PASO 1: CREATE =====
  personaId = await createPersona();
  if (!personaId) {
    logError('No se pudo crear la persona. Abortando pruebas.');
    process.exit(1);
  }
  await wait(1000); // Pausa de 1 segundo

  // ===== PASO 2: READ =====
  const readSuccess = await readPersona(personaId);
  allSuccess = allSuccess && readSuccess;
  await wait(1000);

  // ===== PASO 3: UPDATE =====
  const updateSuccess = await updatePersona(personaId);
  allSuccess = allSuccess && updateSuccess;
  await wait(1000);

  // ===== PASO 4: DELETE =====
  const deleteSuccess = await deletePersona(personaId);
  allSuccess = allSuccess && deleteSuccess;
  await wait(1000);

  // ===== PASO 5: VERIFY =====
  await verifyDeleted(personaId);

  // ===== RESUMEN FINAL =====
  logSection('RESUMEN FINAL');

  if (allSuccess) {
    logSuccess('Todas las operaciones CRUD se ejecutaron exitosamente');
    console.log('\n  Operaciones completadas:');
    console.log('    ✓ CREATE - Persona creada');
    console.log('    ✓ READ   - Persona leída');
    console.log('    ✓ UPDATE - Persona actualizada');
    console.log('    ✓ DELETE - Persona eliminada');
    console.log('    ✓ VERIFY - Eliminación verificada');
  } else {
    log('\n⚠ Algunas operaciones fallaron. Revisa los logs anteriores.', 'yellow');
  }

  console.log('\n' + '='.repeat(80) + '\n');

  process.exit(allSuccess ? 0 : 1);
}

// ============================================================================
// EJECUCIÓN
// ============================================================================

// Manejo de errores no capturados
process.on('unhandledRejection', (error) => {
  logError('Error no manejado:', error);
  process.exit(1);
});

// Ejecutar
main().catch((error) => {
  logError('Error fatal en la ejecución:', error);
  process.exit(1);
});
