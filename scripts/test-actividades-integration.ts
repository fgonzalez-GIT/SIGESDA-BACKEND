#!/usr/bin/env tsx
/**
 * Suite de Pruebas de Integración para Endpoints de Actividades
 *
 * Valida:
 * - Endpoints HTTP completos (GET, POST, PATCH, DELETE)
 * - Validación de DTOs y schemas
 * - Códigos de estado HTTP
 * - Manejo de errores
 * - Flujos de negocio completos
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:8000/api/actividades';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message?: string;
  duration: number;
}

const results: TestResult[] = [];
let createdActividadId: number;
let createdHorarioId: number;

function test(name: string, fn: () => Promise<void>) {
  return async () => {
    const start = Date.now();
    try {
      await fn();
      const duration = Date.now() - start;
      results.push({ name, status: 'PASS', duration });
      console.log(`✅ PASS: ${name} (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - start;
      const message = error instanceof Error ? error.message : String(error);
      results.push({ name, status: 'FAIL', message, duration });
      console.log(`❌ FAIL: ${name} (${duration}ms)`);
      console.log(`   Error: ${message}`);
    }
  };
}

async function fetchJSON(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data = await response.json();
  return { response, data };
}

// ==================== TESTS DE CATÁLOGOS ====================

const testGetCatalogosCompletos = test('GET /catalogos/todos - Obtener todos los catálogos', async () => {
  const { response, data } = await fetchJSON(`${BASE_URL}/catalogos/todos`);

  if (response.status !== 200) {
    throw new Error(`Status ${response.status} en lugar de 200`);
  }

  if (!data.success) {
    throw new Error('Response success es false');
  }

  const catalogos = data.data;
  if (!catalogos.tipos || !catalogos.categorias || !catalogos.estados || !catalogos.diasSemana || !catalogos.rolesDocentes) {
    throw new Error('Catálogos incompletos');
  }

  console.log(`   → Tipos: ${catalogos.tipos.length}, Categorías: ${catalogos.categorias.length}`);
});

const testGetTiposActividades = test('GET /catalogos/tipos - Obtener tipos de actividades', async () => {
  const { response, data } = await fetchJSON(`${BASE_URL}/catalogos/tipos`);

  if (response.status !== 200) {
    throw new Error(`Status ${response.status}`);
  }

  if (!Array.isArray(data.data) || data.data.length === 0) {
    throw new Error('No se encontraron tipos');
  }

  console.log(`   → ${data.data.length} tipos encontrados`);
});

const testGetCategoriasActividades = test('GET /catalogos/categorias - Obtener categorías', async () => {
  const { response, data } = await fetchJSON(`${BASE_URL}/catalogos/categorias`);

  if (response.status !== 200) {
    throw new Error(`Status ${response.status}`);
  }

  if (!Array.isArray(data.data) || data.data.length === 0) {
    throw new Error('No se encontraron categorías');
  }

  console.log(`   → ${data.data.length} categorías encontradas`);
});

const testGetEstadosActividades = test('GET /catalogos/estados - Obtener estados', async () => {
  const { response, data } = await fetchJSON(`${BASE_URL}/catalogos/estados`);

  if (response.status !== 200) {
    throw new Error(`Status ${response.status}`);
  }

  if (!Array.isArray(data.data) || data.data.length === 0) {
    throw new Error('No se encontraron estados');
  }

  console.log(`   → ${data.data.length} estados encontrados`);
});

const testGetDiasSemana = test('GET /catalogos/dias-semana - Obtener días', async () => {
  const { response, data } = await fetchJSON(`${BASE_URL}/catalogos/dias-semana`);

  if (response.status !== 200) {
    throw new Error(`Status ${response.status}`);
  }

  if (!Array.isArray(data.data) || data.data.length !== 7) {
    throw new Error(`Se esperaban 7 días, se encontraron ${data.data.length}`);
  }

  console.log(`   → ${data.data.length} días encontrados`);
});

const testGetRolesDocentes = test('GET /catalogos/roles-docentes - Obtener roles', async () => {
  const { response, data } = await fetchJSON(`${BASE_URL}/catalogos/roles-docentes`);

  if (response.status !== 200) {
    throw new Error(`Status ${response.status}`);
  }

  if (!Array.isArray(data.data) || data.data.length === 0) {
    throw new Error('No se encontraron roles');
  }

  console.log(`   → ${data.data.length} roles encontrados`);
});

// ==================== TESTS DE CRUD ====================

const testCreateActividad = test('POST / - Crear actividad con horarios', async () => {
  // Obtener catálogos primero
  const { data: tiposData } = await fetchJSON(`${BASE_URL}/catalogos/tipos`);
  const { data: categoriasData } = await fetchJSON(`${BASE_URL}/catalogos/categorias`);
  const { data: estadosData } = await fetchJSON(`${BASE_URL}/catalogos/estados`);
  const { data: diasData } = await fetchJSON(`${BASE_URL}/catalogos/dias-semana`);

  const tipos = tiposData.data;
  const categorias = categoriasData.data;
  const estados = estadosData.data;
  const dias = diasData.data;

  const payload = {
    codigoActividad: `TEST-INTEGRATION-${Date.now()}`,
    nombre: 'Actividad de Prueba Integración',
    tipoActividadId: tipos[0].id,
    categoriaId: categorias[0].id,
    estadoId: estados[0].id,
    descripcion: 'Actividad creada en prueba de integración',
    fechaDesde: new Date().toISOString(),
    cupoMaximo: 20,
    costo: 500,
    horarios: [
      {
        diaSemanaId: dias[0].id,
        horaInicio: '09:00',
        horaFin: '11:00',
        activo: true
      },
      {
        diaSemanaId: dias[2].id,
        horaInicio: '14:00',
        horaFin: '16:00',
        activo: true
      }
    ]
  };

  const { response, data } = await fetchJSON(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (response.status !== 201) {
    throw new Error(`Status ${response.status} en lugar de 201`);
  }

  if (!data.success || !data.data.id) {
    throw new Error('No se creó la actividad correctamente');
  }

  createdActividadId = data.data.id;
  console.log(`   → Actividad creada con ID: ${createdActividadId}`);
});

const testGetActividades = test('GET / - Listar actividades con paginación', async () => {
  const { response, data } = await fetchJSON(`${BASE_URL}?page=1&limit=10&incluirRelaciones=true`);

  if (response.status !== 200) {
    throw new Error(`Status ${response.status}`);
  }

  if (!data.success || !data.data.data || !Array.isArray(data.data.data)) {
    throw new Error('Formato de respuesta inválido');
  }

  console.log(`   → ${data.data.total} actividades encontradas`);
});

const testGetActividadById = test('GET /:id - Obtener actividad por ID', async () => {
  const { response, data } = await fetchJSON(`${BASE_URL}/${createdActividadId}`);

  if (response.status !== 200) {
    throw new Error(`Status ${response.status}`);
  }

  if (!data.success || data.data.id !== createdActividadId) {
    throw new Error('ID no coincide');
  }

  console.log(`   → Actividad encontrada: ${data.data.nombre}`);
});

const testGetActividadByIdInvalido = test('GET /:id - ID inválido debe retornar 400', async () => {
  const { response, data } = await fetchJSON(`${BASE_URL}/invalid-id`);

  if (response.status !== 400) {
    throw new Error(`Status ${response.status} en lugar de 400`);
  }

  if (data.success !== false) {
    throw new Error('Debería retornar success: false');
  }

  console.log(`   → Error manejado correctamente`);
});

const testGetActividadByIdNoExistente = test('GET /:id - ID no existente debe retornar 404', async () => {
  const { response, data } = await fetchJSON(`${BASE_URL}/999999`);

  if (response.status !== 404) {
    throw new Error(`Status ${response.status} en lugar de 404`);
  }

  if (data.success !== false) {
    throw new Error('Debería retornar success: false');
  }

  console.log(`   → Error 404 manejado correctamente`);
});

const testGetActividadByCodigo = test('GET /codigo/:codigo - Buscar por código', async () => {
  // Primero obtener el código de la actividad creada
  const { data: actividadData } = await fetchJSON(`${BASE_URL}/${createdActividadId}`);
  const codigo = actividadData.data.codigo_actividad;

  const { response, data } = await fetchJSON(`${BASE_URL}/codigo/${codigo}`);

  if (response.status !== 200) {
    throw new Error(`Status ${response.status}`);
  }

  if (!data.success || data.data.id !== createdActividadId) {
    throw new Error('No se encontró la actividad por código');
  }

  console.log(`   → Actividad encontrada por código: ${codigo}`);
});

const testUpdateActividad = test('PATCH /:id - Actualizar actividad', async () => {
  const payload = {
    nombre: 'Actividad de Prueba Integración ACTUALIZADA',
    descripcion: 'Descripción actualizada en integración',
    costo: 750
  };

  const { response, data } = await fetchJSON(`${BASE_URL}/${createdActividadId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  if (response.status !== 200) {
    throw new Error(`Status ${response.status}`);
  }

  if (!data.success || data.data.nombre !== payload.nombre) {
    throw new Error('No se actualizó correctamente');
  }

  console.log(`   → Actividad actualizada: ${data.data.nombre}`);
});

const testCreateActividadCodigoDuplicado = test('POST / - Código duplicado debe retornar 400', async () => {
  // Obtener el código de la actividad existente
  const { data: actividadData } = await fetchJSON(`${BASE_URL}/${createdActividadId}`);
  const codigoDuplicado = actividadData.data.codigo_actividad;

  const { data: tiposData } = await fetchJSON(`${BASE_URL}/catalogos/tipos`);
  const { data: categoriasData } = await fetchJSON(`${BASE_URL}/catalogos/categorias`);
  const { data: estadosData } = await fetchJSON(`${BASE_URL}/catalogos/estados`);

  const payload = {
    codigoActividad: codigoDuplicado, // Código duplicado
    nombre: 'Otra Actividad',
    tipoActividadId: tiposData.data[0].id,
    categoriaId: categoriasData.data[0].id,
    estadoId: estadosData.data[0].id,
    descripcion: 'Test duplicado',
    fechaDesde: new Date().toISOString(),
    cupoMaximo: 10,
    costo: 100
  };

  const { response, data } = await fetchJSON(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (response.status !== 400) {
    throw new Error(`Status ${response.status} en lugar de 400`);
  }

  if (data.success !== false) {
    throw new Error('Debería retornar success: false');
  }

  console.log(`   → Código duplicado rechazado correctamente`);
});

// ==================== TESTS DE HORARIOS ====================

const testGetHorariosByActividad = test('GET /:id/horarios - Obtener horarios de actividad', async () => {
  const { response, data } = await fetchJSON(`${BASE_URL}/${createdActividadId}/horarios`);

  if (response.status !== 200) {
    throw new Error(`Status ${response.status}`);
  }

  if (!data.success || !Array.isArray(data.data)) {
    throw new Error('Formato de respuesta inválido');
  }

  if (data.data.length < 2) {
    throw new Error(`Se esperaban al menos 2 horarios, se encontraron ${data.data.length}`);
  }

  // Guardar el ID del primer horario para tests posteriores
  createdHorarioId = data.data[0].id;

  console.log(`   → ${data.data.length} horarios encontrados`);
});

const testAgregarHorario = test('POST /:id/horarios - Agregar nuevo horario', async () => {
  const { data: diasData } = await fetchJSON(`${BASE_URL}/catalogos/dias-semana`);
  const dias = diasData.data;

  const payload = {
    diaSemanaId: dias[4].id, // Viernes
    horaInicio: '18:00',
    horaFin: '20:00',
    activo: true
  };

  const { response, data } = await fetchJSON(`${BASE_URL}/${createdActividadId}/horarios`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (response.status !== 201) {
    throw new Error(`Status ${response.status} en lugar de 201`);
  }

  if (!data.success || !data.data.id) {
    throw new Error('No se creó el horario');
  }

  console.log(`   → Horario agregado con ID: ${data.data.id}`);
});

const testUpdateHorario = test('PATCH /horarios/:horarioId - Actualizar horario', async () => {
  const payload = {
    horaInicio: '10:00',
    horaFin: '12:00'
  };

  const { response, data } = await fetchJSON(`${BASE_URL}/horarios/${createdHorarioId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  if (response.status !== 200) {
    throw new Error(`Status ${response.status}`);
  }

  if (!data.success) {
    throw new Error('No se actualizó el horario');
  }

  console.log(`   → Horario actualizado: ${createdHorarioId}`);
});

// ==================== TESTS DE ESTADÍSTICAS ====================

const testGetEstadisticas = test('GET /:id/estadisticas - Obtener estadísticas', async () => {
  const { response, data } = await fetchJSON(`${BASE_URL}/${createdActividadId}/estadisticas`);

  if (response.status !== 200) {
    throw new Error(`Status ${response.status}`);
  }

  if (!data.success || typeof data.data.totalParticipantes !== 'number') {
    throw new Error('Estadísticas incompletas');
  }

  console.log(`   → Participantes: ${data.data.totalParticipantes}, Horarios: ${data.data.totalHorarios}`);
});

// ==================== TESTS DE CAMBIO DE ESTADO ====================

const testCambiarEstado = test('PATCH /:id/estado - Cambiar estado de actividad', async () => {
  const { data: estadosData } = await fetchJSON(`${BASE_URL}/catalogos/estados`);
  const estados = estadosData.data;

  // Buscar estado diferente al actual
  const estadoInactivo = estados.find((e: any) => e.codigo === 'INACTIVA');

  if (!estadoInactivo) {
    throw new Error('No se encontró estado INACTIVA');
  }

  const payload = {
    nuevoEstadoId: estadoInactivo.id
  };

  const { response, data } = await fetchJSON(`${BASE_URL}/${createdActividadId}/estado`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  if (response.status !== 200) {
    throw new Error(`Status ${response.status}`);
  }

  if (!data.success) {
    throw new Error('No se cambió el estado');
  }

  console.log(`   → Estado cambiado a: ${estadoInactivo.nombre}`);
});

// ==================== TESTS DE REPORTES ====================

const testGetResumenPorTipo = test('GET /reportes/por-tipo - Resumen por tipo', async () => {
  const { response, data } = await fetchJSON(`${BASE_URL}/reportes/por-tipo`);

  if (response.status !== 200) {
    throw new Error(`Status ${response.status}`);
  }

  if (!data.success || !Array.isArray(data.data)) {
    throw new Error('Formato de respuesta inválido');
  }

  console.log(`   → ${data.data.length} tipos con actividades`);
});

const testGetHorarioSemanal = test('GET /reportes/horario-semanal - Horario semanal', async () => {
  const { response, data } = await fetchJSON(`${BASE_URL}/reportes/horario-semanal`);

  if (response.status !== 200) {
    throw new Error(`Status ${response.status}`);
  }

  if (!data.success || typeof data.data !== 'object') {
    throw new Error('Formato de respuesta inválido');
  }

  console.log(`   → Horario semanal obtenido correctamente`);
});

// ==================== CLEANUP ====================

const testDeleteHorario = test('DELETE /horarios/:horarioId - Eliminar horario', async () => {
  const { response, data } = await fetchJSON(`${BASE_URL}/horarios/${createdHorarioId}`, {
    method: 'DELETE',
  });

  if (response.status !== 200) {
    throw new Error(`Status ${response.status}`);
  }

  if (!data.success) {
    throw new Error('No se eliminó el horario');
  }

  console.log(`   → Horario eliminado: ${createdHorarioId}`);
});

const testDeleteActividad = test('DELETE /:id - Eliminar actividad', async () => {
  const { response, data } = await fetchJSON(`${BASE_URL}/${createdActividadId}`, {
    method: 'DELETE',
  });

  if (response.status !== 200) {
    throw new Error(`Status ${response.status}`);
  }

  if (!data.success) {
    throw new Error('No se eliminó la actividad');
  }

  // Verificar que realmente se eliminó
  const { response: getResponse } = await fetchJSON(`${BASE_URL}/${createdActividadId}`);

  if (getResponse.status !== 404) {
    throw new Error('La actividad no fue eliminada correctamente');
  }

  console.log(`   → Actividad eliminada: ${createdActividadId}`);
});

// ==================== EJECUCIÓN ====================

async function main() {
  console.log('\n🧪 SUITE DE PRUEBAS DE INTEGRACIÓN - ENDPOINTS DE ACTIVIDADES\n');
  console.log('═'.repeat(70));

  // Verificar que el servidor esté corriendo
  try {
    const response = await fetch(BASE_URL);
    if (!response.ok && response.status !== 404) {
      throw new Error('Servidor no responde');
    }
  } catch (error) {
    console.log('\n❌ ERROR: El servidor no está corriendo en ' + BASE_URL);
    console.log('   Por favor, inicia el servidor con: npm run dev\n');
    process.exit(1);
  }

  console.log('\n📦 TESTS DE CATÁLOGOS\n');

  await testGetCatalogosCompletos();
  await testGetTiposActividades();
  await testGetCategoriasActividades();
  await testGetEstadosActividades();
  await testGetDiasSemana();
  await testGetRolesDocentes();

  console.log('\n📝 TESTS DE CRUD\n');

  await testCreateActividad();
  await testGetActividades();
  await testGetActividadById();
  await testGetActividadByIdInvalido();
  await testGetActividadByIdNoExistente();
  await testGetActividadByCodigo();
  await testUpdateActividad();
  await testCreateActividadCodigoDuplicado();

  console.log('\n⏰ TESTS DE HORARIOS\n');

  await testGetHorariosByActividad();
  await testAgregarHorario();
  await testUpdateHorario();

  console.log('\n📊 TESTS DE ESTADÍSTICAS Y ESTADO\n');

  await testGetEstadisticas();
  await testCambiarEstado();

  console.log('\n📈 TESTS DE REPORTES\n');

  await testGetResumenPorTipo();
  await testGetHorarioSemanal();

  console.log('\n🧹 CLEANUP\n');

  await testDeleteHorario();
  await testDeleteActividad();

  console.log('\n' + '═'.repeat(70));

  // Resumen
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const total = results.length;
  const successRate = ((passed / total) * 100).toFixed(2);

  console.log('\n📊 RESUMEN DE PRUEBAS:\n');
  console.log(`  Total:    ${total}`);
  console.log(`  Pasadas:  ${passed} ✅`);
  console.log(`  Fallidas: ${failed} ❌`);
  console.log(`  Tasa de éxito: ${successRate}%`);

  if (failed > 0) {
    console.log('\n❌ PRUEBAS FALLIDAS:\n');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  - ${r.name}`);
      console.log(`    ${r.message}`);
    });
  }

  console.log();

  await prisma.$disconnect();

  if (failed > 0) {
    process.exit(1);
  }
}

main();
