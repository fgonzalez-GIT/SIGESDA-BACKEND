/**
 * ============================================================================
 * SCRIPT DE VALIDACIÓN: Migración Actividades
 * ============================================================================
 *
 * Este script valida que la migración de actividades se completó correctamente
 *
 * EJECUCIÓN:
 * npx ts-node scripts/validate-migration-actividades.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ValidationResult {
  passed: number;
  failed: number;
  warnings: number;
  errors: string[];
}

const result: ValidationResult = {
  passed: 0,
  failed: 0,
  warnings: 0,
  errors: []
};

function log(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warn: '\x1b[33m',
    reset: '\x1b[0m'
  };

  const icon = {
    info: 'ℹ',
    success: '✓',
    error: '✗',
    warn: '⚠'
  };

  console.log(`${colors[type]}${icon[type]} ${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log('\n' + '='.repeat(80));
  console.log(`  ${title}`);
  console.log('='.repeat(80) + '\n');
}

async function validarActividades() {
  logSection('VALIDACIÓN 1: Actividades con Catálogos');

  try {
    // 1. Todas las actividades tienen codigo_actividad
    const sinCodigo = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM actividades WHERE codigo_actividad IS NULL
    `;

    if (Number(sinCodigo[0].count) === 0) {
      log('Todas las actividades tienen codigo_actividad', 'success');
      result.passed++;
    } else {
      log(`${sinCodigo[0].count} actividades sin codigo_actividad`, 'error');
      result.failed++;
      result.errors.push('Actividades sin codigo_actividad');
    }

    // 2. Todas las actividades tienen tipo_actividad_id
    const sinTipo = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM actividades WHERE tipo_actividad_id IS NULL
    `;

    if (Number(sinTipo[0].count) === 0) {
      log('Todas las actividades tienen tipo_actividad_id', 'success');
      result.passed++;
    } else {
      log(`${sinTipo[0].count} actividades sin tipo_actividad_id`, 'error');
      result.failed++;
      result.errors.push('Actividades sin tipo_actividad_id');
    }

    // 3. Todas las actividades tienen categoria_id
    const sinCategoria = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM actividades WHERE categoria_id IS NULL
    `;

    if (Number(sinCategoria[0].count) === 0) {
      log('Todas las actividades tienen categoria_id', 'success');
      result.passed++;
    } else {
      log(`${sinCategoria[0].count} actividades sin categoria_id`, 'error');
      result.failed++;
      result.errors.push('Actividades sin categoria_id');
    }

    // 4. Todas las actividades tienen estado_id
    const sinEstado = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM actividades WHERE estado_id IS NULL
    `;

    if (Number(sinEstado[0].count) === 0) {
      log('Todas las actividades tienen estado_id', 'success');
      result.passed++;
    } else {
      log(`${sinEstado[0].count} actividades sin estado_id`, 'error');
      result.failed++;
      result.errors.push('Actividades sin estado_id');
    }

    // 5. No quedan campos legacy
    const conTipoEnum = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count
      FROM information_schema.columns
      WHERE table_name = 'actividades' AND column_name = 'tipo'
    `;

    if (Number(conTipoEnum[0].count) === 0) {
      log('Campo legacy "tipo" eliminado correctamente', 'success');
      result.passed++;
    } else {
      log('Campo legacy "tipo" aún existe', 'warn');
      result.warnings++;
    }

  } catch (error: any) {
    log(`Error al validar actividades: ${error.message}`, 'error');
    result.failed++;
    result.errors.push('Error en validación de actividades');
  }
}

async function validarHorarios() {
  logSection('VALIDACIÓN 2: Horarios con dias_semana FK');

  try {
    // 1. Todos los horarios tienen dia_semana_id
    const sinDia = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM horarios_actividades WHERE dia_semana_id IS NULL
    `;

    if (Number(sinDia[0].count) === 0) {
      log('Todos los horarios tienen dia_semana_id', 'success');
      result.passed++;
    } else {
      log(`${sinDia[0].count} horarios sin dia_semana_id`, 'error');
      result.failed++;
      result.errors.push('Horarios sin dia_semana_id');
    }

    // 2. No queda campo legacy diaSemana
    const conDiaEnum = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count
      FROM information_schema.columns
      WHERE table_name = 'horarios_actividades' AND column_name = 'diaSemana'
    `;

    if (Number(conDiaEnum[0].count) === 0) {
      log('Campo legacy "diaSemana" eliminado correctamente', 'success');
      result.passed++;
    } else {
      log('Campo legacy "diaSemana" aún existe', 'warn');
      result.warnings++;
    }

  } catch (error: any) {
    log(`Error al validar horarios: ${error.message}`, 'error');
    result.failed++;
    result.errors.push('Error en validación de horarios');
  }
}

async function validarIntegridadReferencial() {
  logSection('VALIDACIÓN 3: Integridad Referencial');

  try {
    // 1. Verificar FKs de actividades
    const actividadesHuerfanas = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count
      FROM actividades a
      LEFT JOIN tipos_actividades ta ON a.tipo_actividad_id = ta.id
      LEFT JOIN categorias_actividades ca ON a.categoria_id = ca.id
      LEFT JOIN estados_actividades ea ON a.estado_id = ea.id
      WHERE ta.id IS NULL OR ca.id IS NULL OR ea.id IS NULL
    `;

    if (Number(actividadesHuerfanas[0].count) === 0) {
      log('Todas las FKs de actividades son válidas', 'success');
      result.passed++;
    } else {
      log(`${actividadesHuerfanas[0].count} actividades con FKs inválidas`, 'error');
      result.failed++;
      result.errors.push('Actividades con FKs huérfanas');
    }

    // 2. Verificar FKs de horarios
    const horariosHuerfanos = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count
      FROM horarios_actividades h
      LEFT JOIN dias_semana ds ON h.dia_semana_id = ds.id
      WHERE ds.id IS NULL
    `;

    if (Number(horariosHuerfanos[0].count) === 0) {
      log('Todas las FKs de horarios son válidas', 'success');
      result.passed++;
    } else {
      log(`${horariosHuerfanos[0].count} horarios con FKs inválidas`, 'error');
      result.failed++;
      result.errors.push('Horarios con FKs huérfanas');
    }

  } catch (error: any) {
    log(`Error al validar integridad: ${error.message}`, 'error');
    result.failed++;
    result.errors.push('Error en validación de integridad');
  }
}

async function validarConstraints() {
  logSection('VALIDACIÓN 4: Constraints y Unique Keys');

  try {
    // 1. Verificar unique de codigo_actividad
    const duplicados = await prisma.$queryRaw<any[]>`
      SELECT codigo_actividad, COUNT(*) as count
      FROM actividades
      GROUP BY codigo_actividad
      HAVING COUNT(*) > 1
    `;

    if (duplicados.length === 0) {
      log('No hay códigos de actividad duplicados', 'success');
      result.passed++;
    } else {
      log(`${duplicados.length} códigos duplicados encontrados`, 'error');
      result.failed++;
      result.errors.push('Códigos de actividad duplicados');
    }

    // 2. Verificar unique de horarios
    const horariosDuplicados = await prisma.$queryRaw<any[]>`
      SELECT actividad_id, dia_semana_id, hora_inicio, COUNT(*) as count
      FROM horarios_actividades
      GROUP BY actividad_id, dia_semana_id, hora_inicio
      HAVING COUNT(*) > 1
    `;

    if (horariosDuplicados.length === 0) {
      log('No hay horarios duplicados', 'success');
      result.passed++;
    } else {
      log(`${horariosDuplicados.length} horarios duplicados encontrados`, 'warn');
      result.warnings++;
    }

  } catch (error: any) {
    log(`Error al validar constraints: ${error.message}`, 'error');
    result.failed++;
    result.errors.push('Error en validación de constraints');
  }
}

async function generarReporte() {
  logSection('VALIDACIÓN 5: Reporte de Datos');

  try {
    // Contar actividades por tipo
    const actividadesPorTipo = await prisma.$queryRaw<any[]>`
      SELECT
        ta.nombre as tipo,
        COUNT(a.id) as cantidad
      FROM actividades a
      JOIN tipos_actividades ta ON a.tipo_actividad_id = ta.id
      GROUP BY ta.id, ta.nombre
      ORDER BY cantidad DESC
    `;

    log('Actividades por tipo:', 'info');
    actividadesPorTipo.forEach(row => {
      log(`  - ${row.tipo}: ${row.cantidad}`, 'info');
    });

    // Contar horarios por día
    const horariosPorDia = await prisma.$queryRaw<any[]>`
      SELECT
        ds.nombre as dia,
        COUNT(h.id) as cantidad
      FROM horarios_actividades h
      JOIN dias_semana ds ON h.dia_semana_id = ds.id
      GROUP BY ds.id, ds.nombre, ds.orden
      ORDER BY ds.orden
    `;

    log('\nHorarios por día:', 'info');
    horariosPorDia.forEach(row => {
      log(`  - ${row.dia}: ${row.cantidad}`, 'info');
    });

  } catch (error: any) {
    log(`Error al generar reporte: ${error.message}`, 'error');
  }
}

async function main() {
  console.log('\n🔍 VALIDACIÓN DE MIGRACIÓN ACTIVIDADES\n');

  try {
    await validarActividades();
    await validarHorarios();
    await validarIntegridadReferencial();
    await validarConstraints();
    await generarReporte();

    // Resumen final
    logSection('RESUMEN DE VALIDACIÓN');

    log(`✓ Validaciones pasadas: ${result.passed}`, result.passed > 0 ? 'success' : 'warn');
    log(`✗ Validaciones fallidas: ${result.failed}`, result.failed > 0 ? 'error' : 'success');
    log(`⚠ Advertencias: ${result.warnings}`, result.warnings > 0 ? 'warn' : 'info');

    if (result.failed === 0 && result.warnings === 0) {
      log('\n✅ MIGRACIÓN VALIDADA EXITOSAMENTE', 'success');
      log('La migración se completó sin errores', 'success');
      process.exit(0);
    } else if (result.failed === 0 && result.warnings > 0) {
      log('\n⚠️  MIGRACIÓN COMPLETADA CON ADVERTENCIAS', 'warn');
      log('Revisar advertencias antes de continuar', 'warn');
      process.exit(0);
    } else {
      log('\n❌ MIGRACIÓN TIENE ERRORES', 'error');
      log('Errores encontrados:', 'error');
      result.errors.forEach(err => log(`  - ${err}`, 'error'));
      process.exit(1);
    }

  } catch (error: any) {
    log(`\n❌ ERROR FATAL: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
