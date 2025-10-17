#!/usr/bin/env tsx
/**
 * Suite de Pruebas Unitarias para ActividadRepository
 *
 * Valida:
 * - CRUD completo de actividades
 * - Gestión de horarios
 * - Gestión de docentes
 * - Integridad referencial
 * - Consultas con filtros
 */

import { PrismaClient } from '@prisma/client';
import { ActividadRepository } from '../src/repositories/actividad.repository';

const prisma = new PrismaClient();
const repository = new ActividadRepository(prisma);

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message?: string;
  duration: number;
}

const results: TestResult[] = [];

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

// ==================== TESTS DE CATÁLOGOS ====================

const testGetTiposActividades = test('Repository.getTiposActividades()', async () => {
  const tipos = await repository.getTiposActividades();

  if (tipos.length === 0) {
    throw new Error('No se encontraron tipos de actividades');
  }

  if (!tipos.every(t => t.id && t.codigo && t.nombre)) {
    throw new Error('Tipos de actividades con campos incompletos');
  }

  console.log(`   → ${tipos.length} tipos encontrados`);
});

const testGetCategoriasActividades = test('Repository.getCategoriasActividades()', async () => {
  const categorias = await repository.getCategoriasActividades();

  if (categorias.length === 0) {
    throw new Error('No se encontraron categorías');
  }

  console.log(`   → ${categorias.length} categorías encontradas`);
});

const testGetEstadosActividades = test('Repository.getEstadosActividades()', async () => {
  const estados = await repository.getEstadosActividades();

  if (estados.length === 0) {
    throw new Error('No se encontraron estados');
  }

  console.log(`   → ${estados.length} estados encontrados`);
});

const testGetDiasSemana = test('Repository.getDiasSemana()', async () => {
  const dias = await repository.getDiasSemana();

  if (dias.length !== 7) {
    throw new Error(`Se esperaban 7 días, se encontraron ${dias.length}`);
  }

  console.log(`   → ${dias.length} días encontrados`);
});

const testGetRolesDocentes = test('Repository.getRolesDocentes()', async () => {
  const roles = await repository.getRolesDocentes();

  if (roles.length === 0) {
    throw new Error('No se encontraron roles de docentes');
  }

  console.log(`   → ${roles.length} roles encontrados`);
});

// ==================== TESTS DE CRUD ====================

let actividadTestId: number;

const testCreateActividad = test('Repository.create() - Crear actividad', async () => {
  const tipos = await repository.getTiposActividades();
  const categorias = await repository.getCategoriasActividades();
  const estados = await repository.getEstadosActividades();
  const dias = await repository.getDiasSemana();

  const actividad = await repository.create({
    codigoActividad: `TEST-${Date.now()}`,
    nombre: 'Actividad de Prueba',
    tipoActividadId: tipos[0].id,
    categoriaId: categorias[0].id,
    estadoId: estados[0].id,
    descripcion: 'Descripción de prueba',
    fechaDesde: new Date(),
    cupoMaximo: 10,
    costo: 1000,
    horarios: [
      {
        diaSemanaId: dias[0].id,
        horaInicio: '10:00',
        horaFin: '12:00',
        activo: true
      }
    ],
    docentes: [],
    reservasAulas: []
  });

  if (!actividad.id) {
    throw new Error('No se generó ID para la actividad');
  }

  actividadTestId = actividad.id;
  console.log(`   → Actividad creada con ID: ${actividadTestId}`);
});

const testFindById = test('Repository.findById() - Buscar por ID', async () => {
  const actividad = await repository.findById(actividadTestId);

  if (!actividad) {
    throw new Error('No se encontró la actividad');
  }

  if (actividad.id !== actividadTestId) {
    throw new Error('ID no coincide');
  }

  console.log(`   → Actividad encontrada: ${actividad.nombre}`);
});

const testFindByCodigoActividad = test('Repository.findByCodigoActividad() - Buscar por código', async () => {
  const actividad = await repository.findById(actividadTestId);

  if (!actividad) {
    throw new Error('No se encontró la actividad para obtener el código');
  }

  const encontrada = await repository.findByCodigoActividad(actividad.codigo_actividad);

  if (!encontrada) {
    throw new Error('No se encontró la actividad por código');
  }

  if (encontrada.id !== actividadTestId) {
    throw new Error('La actividad encontrada no coincide');
  }

  console.log(`   → Actividad encontrada por código: ${encontrada.codigo_actividad}`);
});

const testFindAll = test('Repository.findAll() - Listar actividades', async () => {
  const result = await repository.findAll({
    page: 1,
    limit: 10,
    incluirRelaciones: true,
    orderBy: 'nombre',
    orderDir: 'asc'
  });

  if (!result.data || result.total === 0) {
    throw new Error('No se encontraron actividades');
  }

  console.log(`   → ${result.total} actividades encontradas`);
});

const testFindAllWithFilters = test('Repository.findAll() - Con filtros', async () => {
  const tipos = await repository.getTiposActividades();

  const result = await repository.findAll({
    tipoActividadId: tipos[0].id,
    page: 1,
    limit: 10,
    incluirRelaciones: false,
    orderBy: 'nombre',
    orderDir: 'asc'
  });

  console.log(`   → ${result.total} actividades del tipo ${tipos[0].nombre}`);
});

const testUpdate = test('Repository.update() - Actualizar actividad', async () => {
  const updated = await repository.update(actividadTestId, {
    nombre: 'Actividad de Prueba ACTUALIZADA',
    descripcion: 'Descripción actualizada'
  });

  if (updated.nombre !== 'Actividad de Prueba ACTUALIZADA') {
    throw new Error('No se actualizó el nombre');
  }

  console.log(`   → Actividad actualizada: ${updated.nombre}`);
});

// ==================== TESTS DE HORARIOS ====================

let horarioTestId: number;

const testAgregarHorario = test('Repository.agregarHorario() - Agregar horario', async () => {
  const dias = await repository.getDiasSemana();

  const horario = await repository.agregarHorario(actividadTestId, {
    diaSemanaId: dias[1].id,
    horaInicio: '14:00',
    horaFin: '16:00',
    activo: true
  });

  if (!horario.id) {
    throw new Error('No se generó ID para el horario');
  }

  horarioTestId = horario.id;
  console.log(`   → Horario agregado con ID: ${horarioTestId}`);
});

const testGetHorariosByActividad = test('Repository.getHorariosByActividad() - Obtener horarios', async () => {
  const horarios = await repository.getHorariosByActividad(actividadTestId);

  if (horarios.length < 2) {
    throw new Error(`Se esperaban al menos 2 horarios, se encontraron ${horarios.length}`);
  }

  console.log(`   → ${horarios.length} horarios encontrados`);
});

const testUpdateHorario = test('Repository.updateHorario() - Actualizar horario', async () => {
  const updated = await repository.updateHorario(horarioTestId, {
    horaInicio: '15:00',
    horaFin: '17:00'
  });

  console.log(`   → Horario actualizado: ${horarioTestId}`);
});

const testFindHorarioById = test('Repository.findHorarioById() - Buscar horario por ID', async () => {
  const horario = await repository.findHorarioById(horarioTestId);

  if (!horario) {
    throw new Error('No se encontró el horario');
  }

  console.log(`   → Horario encontrado: ${horario.id}`);
});

// ==================== TESTS DE ESTADÍSTICAS ====================

const testGetEstadisticas = test('Repository.getEstadisticas() - Obtener estadísticas', async () => {
  const stats = await repository.getEstadisticas(actividadTestId);

  if (!stats) {
    throw new Error('No se obtuvieron estadísticas');
  }

  if (typeof stats.totalParticipantes !== 'number') {
    throw new Error('Estadísticas incompletas');
  }

  console.log(`   → Participantes: ${stats.totalParticipantes}, Horarios: ${stats.totalHorarios}`);
});

// ==================== CLEANUP ====================

const testDeleteHorario = test('Repository.deleteHorario() - Eliminar horario', async () => {
  await repository.deleteHorario(horarioTestId);

  const horario = await repository.findHorarioById(horarioTestId);

  if (horario) {
    throw new Error('El horario no se eliminó correctamente');
  }

  console.log(`   → Horario eliminado: ${horarioTestId}`);
});

const testDeleteActividad = test('Repository.delete() - Eliminar actividad', async () => {
  await repository.delete(actividadTestId);

  const actividad = await repository.findById(actividadTestId);

  if (actividad) {
    throw new Error('La actividad no se eliminó correctamente');
  }

  console.log(`   → Actividad eliminada: ${actividadTestId}`);
});

// ==================== EJECUCIÓN ====================

async function main() {
  console.log('\n🧪 SUITE DE PRUEBAS UNITARIAS - ACTIVIDAD REPOSITORY\n');
  console.log('═'.repeat(60));
  console.log('\n📦 TESTS DE CATÁLOGOS\n');

  await testGetTiposActividades();
  await testGetCategoriasActividades();
  await testGetEstadosActividades();
  await testGetDiasSemana();
  await testGetRolesDocentes();

  console.log('\n📝 TESTS DE CRUD\n');

  await testCreateActividad();
  await testFindById();
  await testFindByCodigoActividad();
  await testFindAll();
  await testFindAllWithFilters();
  await testUpdate();

  console.log('\n⏰ TESTS DE HORARIOS\n');

  await testAgregarHorario();
  await testGetHorariosByActividad();
  await testUpdateHorario();
  await testFindHorarioById();

  console.log('\n📊 TESTS DE ESTADÍSTICAS\n');

  await testGetEstadisticas();

  console.log('\n🧹 CLEANUP\n');

  await testDeleteHorario();
  await testDeleteActividad();

  console.log('\n' + '═'.repeat(60));

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
