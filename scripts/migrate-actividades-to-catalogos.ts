/**
 * ============================================================================
 * SCRIPT DE MIGRACIÓN: Actividades ENUM → Catálogos
 * ============================================================================
 *
 * Este script migra los datos de actividades desde ENUMs legacy a IDs de catálogos:
 * - TipoActividad ENUM → tipos_actividades.id
 * - DiaSemana ENUM → dias_semana.id
 * - Genera códigos únicos para actividades
 * - Asigna valores por defecto para categoría y estado
 *
 * PREREQUISITOS:
 * 1. Ejecutar migration-actividades-step1.sql primero
 * 2. Tener catálogos poblados (tipos_actividades, categorias_actividades, etc.)
 *
 * EJECUCIÓN:
 * npx ts-node scripts/migrate-actividades-to-catalogos.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// MAPEO ENUM → CATÁLOGO
// ============================================================================

const MAPEO_TIPOS: Record<string, string> = {
  'CORO': 'CORO',
  'CLASE_CANTO': 'CLASE_INDIVIDUAL',
  'CLASE_INSTRUMENTO': 'CLASE_INDIVIDUAL'
};

const MAPEO_DIAS: Record<string, string> = {
  'LUNES': 'LUNES',
  'MARTES': 'MARTES',
  'MIERCOLES': 'MIERCOLES',
  'JUEVES': 'JUEVES',
  'VIERNES': 'VIERNES',
  'SABADO': 'SABADO',
  'DOMINGO': 'DOMINGO'
};

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

function log(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warn: '\x1b[33m',    // Yellow
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

// ============================================================================
// PASO 1: MIGRAR ACTIVIDADES
// ============================================================================

async function migrateActividades() {
  logSection('PASO 1: Migrar Actividades (ENUM → Catálogo IDs)');

  try {
    // Obtener catálogos
    const tiposActividades = await prisma.tipos_actividades.findMany();
    const categoriasActividades = await prisma.categorias_actividades.findMany();
    const estadosActividades = await prisma.estados_actividades.findMany();

    log(`Catálogos cargados:`, 'info');
    log(`  - Tipos: ${tiposActividades.length}`, 'info');
    log(`  - Categorías: ${categoriasActividades.length}`, 'info');
    log(`  - Estados: ${estadosActividades.length}`, 'info');

    // Obtener actividades existentes
    const actividades = await prisma.$queryRaw<any[]>`
      SELECT id, nombre, tipo, precio, "capacidadMaxima", "createdAt"
      FROM actividades
      WHERE tipo_actividad_id IS NULL
    `;

    log(`\nActividades a migrar: ${actividades.length}`, 'info');

    if (actividades.length === 0) {
      log('No hay actividades para migrar', 'warn');
      return;
    }

    // Valores por defecto
    const categoriaDefaultId = categoriasActividades.find(c => c.codigo === 'MUSICA')?.id || 1;
    const estadoDefaultId = estadosActividades.find(e => e.codigo === 'ACTIVA')?.id || 2;

    let migradas = 0;
    let errores = 0;

    for (const actividad of actividades) {
      try {
        // Mapear tipo ENUM a ID de catálogo
        const codigoCatalogo = MAPEO_TIPOS[actividad.tipo];
        if (!codigoCatalogo) {
          log(`  ✗ Actividad ${actividad.id}: tipo desconocido '${actividad.tipo}'`, 'error');
          errores++;
          continue;
        }

        const tipoCatalogo = tiposActividades.find(t => t.codigo === codigoCatalogo);
        if (!tipoCatalogo) {
          log(`  ✗ Actividad ${actividad.id}: catálogo '${codigoCatalogo}' no encontrado`, 'error');
          errores++;
          continue;
        }

        // Generar código único
        const codigoActividad = `ACT-${codigoCatalogo}-${actividad.id.toString().padStart(4, '0')}`;

        // Actualizar actividad
        await prisma.$executeRaw`
          UPDATE actividades
          SET
            codigo_actividad = ${codigoActividad},
            tipo_actividad_id = ${tipoCatalogo.id},
            categoria_id = ${categoriaDefaultId},
            estado_id = ${estadoDefaultId},
            fecha_desde = ${actividad.createdAt || new Date()},
            costo = ${actividad.precio || 0}
          WHERE id = ${actividad.id}
        `;

        log(`  ✓ Actividad ${actividad.id} (${actividad.nombre}): ${actividad.tipo} → ${codigoCatalogo} (ID: ${tipoCatalogo.id})`, 'success');
        migradas++;

      } catch (error: any) {
        log(`  ✗ Error al migrar actividad ${actividad.id}: ${error.message}`, 'error');
        errores++;
      }
    }

    log(`\n📊 Resumen Actividades:`, 'info');
    log(`  ✓ Migradas: ${migradas}`, 'success');
    if (errores > 0) {
      log(`  ✗ Errores: ${errores}`, 'error');
    }

  } catch (error: any) {
    log(`Error al migrar actividades: ${error.message}`, 'error');
    throw error;
  }
}

// ============================================================================
// PASO 2: MIGRAR HORARIOS_ACTIVIDADES
// ============================================================================

async function migrateHorarios() {
  logSection('PASO 2: Migrar Horarios (DiaSemana ENUM → dias_semana ID)');

  try {
    // Obtener catálogo de días
    const diasSemana = await prisma.dias_semana.findMany();
    log(`Días de semana cargados: ${diasSemana.length}`, 'info');

    // Obtener horarios existentes
    const horarios = await prisma.$queryRaw<any[]>`
      SELECT id, "actividadId", "diaSemana", "horaInicio", "horaFin"
      FROM horarios_actividades
      WHERE dia_semana_id IS NULL
    `;

    log(`Horarios a migrar: ${horarios.length}`, 'info');

    if (horarios.length === 0) {
      log('No hay horarios para migrar', 'warn');
      return;
    }

    let migrados = 0;
    let errores = 0;

    for (const horario of horarios) {
      try {
        // Mapear día ENUM a ID de catálogo
        const codigoDia = MAPEO_DIAS[horario.diaSemana];
        if (!codigoDia) {
          log(`  ✗ Horario ${horario.id}: día desconocido '${horario.diaSemana}'`, 'error');
          errores++;
          continue;
        }

        const diaCatalogo = diasSemana.find(d => d.codigo === codigoDia);
        if (!diaCatalogo) {
          log(`  ✗ Horario ${horario.id}: catálogo día '${codigoDia}' no encontrado`, 'error');
          errores++;
          continue;
        }

        // Formatear horas (extraer solo HH:MM de TIME si es necesario)
        const horaInicio = typeof horario.horaInicio === 'string'
          ? horario.horaInicio
          : horario.horaInicio.toString().substring(0, 5);

        const horaFin = typeof horario.horaFin === 'string'
          ? horario.horaFin
          : horario.horaFin.toString().substring(0, 5);

        // Actualizar horario
        await prisma.$executeRaw`
          UPDATE horarios_actividades
          SET
            dia_semana_id = ${diaCatalogo.id},
            hora_inicio = ${horaInicio},
            hora_fin = ${horaFin},
            actividad_id = ${horario.actividadId}
          WHERE id = ${horario.id}
        `;

        log(`  ✓ Horario ${horario.id}: ${horario.diaSemana} → ${codigoDia} (ID: ${diaCatalogo.id})`, 'success');
        migrados++;

      } catch (error: any) {
        log(`  ✗ Error al migrar horario ${horario.id}: ${error.message}`, 'error');
        errores++;
      }
    }

    log(`\n📊 Resumen Horarios:`, 'info');
    log(`  ✓ Migrados: ${migrados}`, 'success');
    if (errores > 0) {
      log(`  ✗ Errores: ${errores}`, 'error');
    }

  } catch (error: any) {
    log(`Error al migrar horarios: ${error.message}`, 'error');
    throw error;
  }
}

// ============================================================================
// PASO 3: VALIDACIÓN
// ============================================================================

async function validarMigracion() {
  logSection('PASO 3: Validar Migración');

  try {
    // Verificar actividades migradas
    const actividadesMigradas = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as total
      FROM actividades
      WHERE tipo_actividad_id IS NOT NULL
        AND categoria_id IS NOT NULL
        AND estado_id IS NOT NULL
        AND codigo_actividad IS NOT NULL
    `;

    const actividadesTotal = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as total FROM actividades
    `;

    log(`Actividades migradas: ${actividadesMigradas[0].total} / ${actividadesTotal[0].total}`, 'info');

    // Verificar horarios migrados
    const horariosMigrados = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as total
      FROM horarios_actividades
      WHERE dia_semana_id IS NOT NULL
    `;

    const horariosTotal = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as total FROM horarios_actividades
    `;

    log(`Horarios migrados: ${horariosMigrados[0].total} / ${horariosTotal[0].total}`, 'info');

    // Verificar integridad referencial
    const actividadesSinTipo = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as total
      FROM actividades
      WHERE tipo_actividad_id IS NULL
    `;

    const horariosSinDia = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as total
      FROM horarios_actividades
      WHERE dia_semana_id IS NULL
    `;

    if (Number(actividadesSinTipo[0].total) > 0) {
      log(`⚠ ${actividadesSinTipo[0].total} actividades sin tipo_actividad_id`, 'warn');
    }

    if (Number(horariosSinDia[0].total) > 0) {
      log(`⚠ ${horariosSinDia[0].total} horarios sin dia_semana_id`, 'warn');
    }

    if (Number(actividadesSinTipo[0].total) === 0 && Number(horariosSinDia[0].total) === 0) {
      log('\n✅ MIGRACIÓN COMPLETADA EXITOSAMENTE', 'success');
      log('Todos los registros tienen referencias a catálogos', 'success');
      return true;
    } else {
      log('\n⚠️  MIGRACIÓN INCOMPLETA', 'warn');
      log('Algunos registros no fueron migrados', 'warn');
      return false;
    }

  } catch (error: any) {
    log(`Error al validar migración: ${error.message}`, 'error');
    return false;
  }
}

// ============================================================================
// EJECUCIÓN PRINCIPAL
// ============================================================================

async function main() {
  console.log('\n🚀 INICIANDO MIGRACIÓN ACTIVIDADES ENUM → CATÁLOGOS\n');

  try {
    // Ejecutar migraciones en orden
    await migrateActividades();
    await migrateHorarios();

    // Validar resultados
    const exito = await validarMigracion();

    if (exito) {
      logSection('PRÓXIMOS PASOS');
      log('1. Ejecutar: migration-actividades-step2.sql (agregar constraints)', 'info');
      log('2. Actualizar schema Prisma (eliminar campos legacy)', 'info');
      log('3. Ejecutar: npx prisma generate', 'info');
      log('4. Ejecutar: npx ts-node tests/test-actividades-crud.ts', 'info');
    } else {
      log('❌ MIGRACIÓN FALLÓ - Revisar errores arriba', 'error');
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

// Ejecutar
main();
