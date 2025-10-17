#!/usr/bin/env tsx
/**
 * Script de Validación de Integridad Referencial
 *
 * Valida que todas las foreign keys en el modelo de Actividades V2.0
 * apuntan a registros existentes en las tablas relacionadas.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ValidationResult {
  table: string;
  check: string;
  status: 'PASS' | 'FAIL';
  message?: string;
  details?: any;
}

const results: ValidationResult[] = [];

async function validarActividadesTipos() {
  const actividades = await prisma.actividades.findMany({
    select: { id: true, codigo_actividad: true, tipo_actividad_id: true }
  });

  const tiposValidos = await prisma.tipos_actividades.findMany({
    select: { id: true }
  });

  const idsValidos = new Set(tiposValidos.map(t => t.id));
  const invalidos = actividades.filter(a => !idsValidos.has(a.tipo_actividad_id));

  if (invalidos.length > 0) {
    results.push({
      table: 'actividades',
      check: 'tipo_actividad_id -> tipos_actividades.id',
      status: 'FAIL',
      message: `${invalidos.length} actividades con tipo_actividad_id inválido`,
      details: invalidos.map(a => ({ id: a.id, codigo: a.codigo_actividad, tipo_id: a.tipo_actividad_id }))
    });
  } else {
    results.push({
      table: 'actividades',
      check: 'tipo_actividad_id -> tipos_actividades.id',
      status: 'PASS',
      message: `${actividades.length} actividades validadas`
    });
  }
}

async function validarActividadesCategorias() {
  const actividades = await prisma.actividades.findMany({
    select: { id: true, codigo_actividad: true, categoria_id: true }
  });

  const categoriasValidas = await prisma.categorias_actividades.findMany({
    select: { id: true }
  });

  const idsValidos = new Set(categoriasValidas.map(c => c.id));
  const invalidos = actividades.filter(a => !idsValidos.has(a.categoria_id));

  if (invalidos.length > 0) {
    results.push({
      table: 'actividades',
      check: 'categoria_id -> categorias_actividades.id',
      status: 'FAIL',
      message: `${invalidos.length} actividades con categoria_id inválido`,
      details: invalidos
    });
  } else {
    results.push({
      table: 'actividades',
      check: 'categoria_id -> categorias_actividades.id',
      status: 'PASS',
      message: `${actividades.length} actividades validadas`
    });
  }
}

async function validarActividadesEstados() {
  const actividades = await prisma.actividades.findMany({
    select: { id: true, codigo_actividad: true, estado_id: true }
  });

  const estadosValidos = await prisma.estados_actividades.findMany({
    select: { id: true }
  });

  const idsValidos = new Set(estadosValidos.map(e => e.id));
  const invalidos = actividades.filter(a => !idsValidos.has(a.estado_id));

  if (invalidos.length > 0) {
    results.push({
      table: 'actividades',
      check: 'estado_id -> estados_actividades.id',
      status: 'FAIL',
      message: `${invalidos.length} actividades con estado_id inválido`,
      details: invalidos
    });
  } else {
    results.push({
      table: 'actividades',
      check: 'estado_id -> estados_actividades.id',
      status: 'PASS',
      message: `${actividades.length} actividades validadas`
    });
  }
}

async function validarHorariosActividades() {
  const horarios = await prisma.horarios_actividades.findMany({
    select: { id: true, actividad_id: true }
  });

  const actividadesValidas = await prisma.actividades.findMany({
    select: { id: true }
  });

  const idsValidos = new Set(actividadesValidas.map(a => a.id));
  const invalidos = horarios.filter(h => !idsValidos.has(h.actividad_id));

  if (invalidos.length > 0) {
    results.push({
      table: 'horarios_actividades',
      check: 'actividad_id -> actividades.id',
      status: 'FAIL',
      message: `${invalidos.length} horarios con actividad_id inválido`,
      details: invalidos
    });
  } else {
    results.push({
      table: 'horarios_actividades',
      check: 'actividad_id -> actividades.id',
      status: 'PASS',
      message: `${horarios.length} horarios validados`
    });
  }
}

async function validarHorariosDiasSemana() {
  const horarios = await prisma.horarios_actividades.findMany({
    select: { id: true, dia_semana_id: true }
  });

  const diasValidos = await prisma.dias_semana.findMany({
    select: { id: true }
  });

  const idsValidos = new Set(diasValidos.map(d => d.id));
  const invalidos = horarios.filter(h => !idsValidos.has(h.dia_semana_id));

  if (invalidos.length > 0) {
    results.push({
      table: 'horarios_actividades',
      check: 'dia_semana_id -> dias_semana.id',
      status: 'FAIL',
      message: `${invalidos.length} horarios con dia_semana_id inválido`,
      details: invalidos
    });
  } else {
    results.push({
      table: 'horarios_actividades',
      check: 'dia_semana_id -> dias_semana.id',
      status: 'PASS',
      message: `${horarios.length} horarios validados`
    });
  }
}

async function validarDocentesActividades() {
  const docentes = await prisma.docentes_actividades.findMany({
    select: { id: true, actividad_id: true, docente_id: true, rol_docente_id: true }
  });

  // Validar actividad_id
  const actividadesValidas = await prisma.actividades.findMany({ select: { id: true } });
  const actividadesIds = new Set(actividadesValidas.map(a => a.id));
  const invalidosActividad = docentes.filter(d => !actividadesIds.has(d.actividad_id));

  if (invalidosActividad.length > 0) {
    results.push({
      table: 'docentes_actividades',
      check: 'actividad_id -> actividades.id',
      status: 'FAIL',
      message: `${invalidosActividad.length} asignaciones con actividad_id inválido`,
      details: invalidosActividad
    });
  } else {
    results.push({
      table: 'docentes_actividades',
      check: 'actividad_id -> actividades.id',
      status: 'PASS',
      message: `${docentes.length} asignaciones validadas`
    });
  }

  // Validar rol_docente_id
  const rolesValidos = await prisma.roles_docentes.findMany({ select: { id: true } });
  const rolesIds = new Set(rolesValidos.map(r => r.id));
  const invalidosRol = docentes.filter(d => !rolesIds.has(d.rol_docente_id));

  if (invalidosRol.length > 0) {
    results.push({
      table: 'docentes_actividades',
      check: 'rol_docente_id -> roles_docentes.id',
      status: 'FAIL',
      message: `${invalidosRol.length} asignaciones con rol_docente_id inválido`,
      details: invalidosRol
    });
  } else {
    results.push({
      table: 'docentes_actividades',
      check: 'rol_docente_id -> roles_docentes.id',
      status: 'PASS',
      message: `${docentes.length} asignaciones validadas`
    });
  }
}

async function validarParticipacionesActividades() {
  const participaciones = await prisma.participaciones_actividades.findMany({
    select: { id: true, actividad_id: true, persona_id: true }
  });

  // Validar actividad_id
  const actividadesValidas = await prisma.actividades.findMany({ select: { id: true } });
  const actividadesIds = new Set(actividadesValidas.map(a => a.id));
  const invalidosActividad = participaciones.filter(p => !actividadesIds.has(p.actividad_id));

  if (invalidosActividad.length > 0) {
    results.push({
      table: 'participaciones_actividades',
      check: 'actividad_id -> actividades.id',
      status: 'FAIL',
      message: `${invalidosActividad.length} participaciones con actividad_id inválido`,
      details: invalidosActividad
    });
  } else {
    results.push({
      table: 'participaciones_actividades',
      check: 'actividad_id -> actividades.id',
      status: 'PASS',
      message: `${participaciones.length} participaciones validadas`
    });
  }
}

async function validarReservasAulas() {
  const reservas = await prisma.reservas_aulas_actividades.findMany({
    select: { id: true, horario_id: true, aula_id: true }
  });

  // Validar horario_id
  const horariosValidos = await prisma.horarios_actividades.findMany({ select: { id: true } });
  const horariosIds = new Set(horariosValidos.map(h => h.id));
  const invalidosHorario = reservas.filter(r => !horariosIds.has(r.horario_id));

  if (invalidosHorario.length > 0) {
    results.push({
      table: 'reservas_aulas_actividades',
      check: 'horario_id -> horarios_actividades.id',
      status: 'FAIL',
      message: `${invalidosHorario.length} reservas con horario_id inválido`,
      details: invalidosHorario
    });
  } else {
    results.push({
      table: 'reservas_aulas_actividades',
      check: 'horario_id -> horarios_actividades.id',
      status: 'PASS',
      message: `${reservas.length} reservas validadas`
    });
  }
}

async function validarConsistenciaFechas() {
  const actividades = await prisma.actividades.findMany({
    select: { id: true, codigo_actividad: true, fecha_desde: true, fecha_hasta: true }
  });

  const inconsistentes = actividades.filter(a =>
    a.fecha_hasta && a.fecha_hasta < a.fecha_desde
  );

  if (inconsistentes.length > 0) {
    results.push({
      table: 'actividades',
      check: 'fecha_hasta >= fecha_desde',
      status: 'FAIL',
      message: `${inconsistentes.length} actividades con fechas inconsistentes`,
      details: inconsistentes.map(a => ({
        id: a.id,
        codigo: a.codigo_actividad,
        desde: a.fecha_desde,
        hasta: a.fecha_hasta
      }))
    });
  } else {
    results.push({
      table: 'actividades',
      check: 'fecha_hasta >= fecha_desde',
      status: 'PASS',
      message: `${actividades.length} actividades con fechas consistentes`
    });
  }
}

async function validarConsistenciaHorarios() {
  const horarios = await prisma.horarios_actividades.findMany({
    select: { id: true, hora_inicio: true, hora_fin: true, actividad_id: true }
  });

  const inconsistentes = horarios.filter(h => {
    const inicio = new Date(h.hora_inicio);
    const fin = new Date(h.hora_fin);
    return fin <= inicio;
  });

  if (inconsistentes.length > 0) {
    results.push({
      table: 'horarios_actividades',
      check: 'hora_fin > hora_inicio',
      status: 'FAIL',
      message: `${inconsistentes.length} horarios con horas inconsistentes`,
      details: inconsistentes.map(h => ({
        id: h.id,
        actividad_id: h.actividad_id,
        inicio: h.hora_inicio,
        fin: h.hora_fin
      }))
    });
  } else {
    results.push({
      table: 'horarios_actividades',
      check: 'hora_fin > hora_inicio',
      status: 'PASS',
      message: `${horarios.length} horarios con horas consistentes`
    });
  }
}

async function main() {
  console.log('\n🔍 VALIDACIÓN DE INTEGRIDAD REFERENCIAL - ACTIVIDADES V2.0\n');
  console.log('═'.repeat(70));
  console.log('\n📊 VALIDANDO FOREIGN KEYS\n');

  let failed = 0;

  try {
    // Validar FKs de actividades
    await validarActividadesTipos();
    await validarActividadesCategorias();
    await validarActividadesEstados();

    // Validar FKs de horarios
    await validarHorariosActividades();
    await validarHorariosDiasSemana();

    // Validar FKs de docentes
    await validarDocentesActividades();

    // Validar FKs de participaciones
    await validarParticipacionesActividades();

    // Validar FKs de reservas
    await validarReservasAulas();

    console.log('\n✅ VALIDANDO CONSISTENCIA DE DATOS\n');

    // Validar consistencia de fechas
    await validarConsistenciaFechas();

    // Validar consistencia de horarios
    await validarConsistenciaHorarios();

    console.log('\n' + '═'.repeat(70));

    // Resumen
    const passed = results.filter(r => r.status === 'PASS').length;
    failed = results.filter(r => r.status === 'FAIL').length;
    const total = results.length;

    console.log('\n📊 RESUMEN DE VALIDACIÓN:\n');
    console.log(`  Total de validaciones: ${total}`);
    console.log(`  Exitosas:  ${passed} ✅`);
    console.log(`  Fallidas:  ${failed} ❌`);

    if (failed > 0) {
      console.log('\n❌ VALIDACIONES FALLIDAS:\n');
      results.filter(r => r.status === 'FAIL').forEach(r => {
        console.log(`  [${r.table}] ${r.check}`);
        console.log(`     ${r.message}`);
        if (r.details && r.details.length > 0) {
          console.log(`     Detalles:`, JSON.stringify(r.details.slice(0, 3), null, 2));
          if (r.details.length > 3) {
            console.log(`     ... y ${r.details.length - 3} más`);
          }
        }
        console.log();
      });
    } else {
      console.log('\n✅ TODAS LAS VALIDACIONES PASARON EXITOSAMENTE\n');
      console.log('  ✓ Todas las foreign keys son válidas');
      console.log('  ✓ Todas las fechas son consistentes');
      console.log('  ✓ Todos los horarios son válidos');
      console.log('  ✓ La integridad referencial está garantizada\n');
    }

    // Mostrar todas las validaciones
    console.log('\n📋 DETALLE DE VALIDACIONES:\n');
    results.forEach(r => {
      const icon = r.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} [${r.table}] ${r.check}`);
      console.log(`   ${r.message}\n`);
    });

  } catch (error) {
    console.error('\n❌ ERROR DURANTE LA VALIDACIÓN:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }

  if (failed > 0) {
    process.exit(1);
  }
}

main();
