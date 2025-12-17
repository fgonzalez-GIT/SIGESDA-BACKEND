/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FASE 2 - Task 2.4: Migración de Cuotas Legacy → Sistema de Ítems
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Convierte cuotas existentes que usan campos legacy (montoBase, montoActividades)
 * al nuevo sistema de ítems desagregados.
 *
 * Características:
 * - Dry-run mode (--dry-run): Preview sin modificar datos
 * - Transacciones atómicas por cuota
 * - Metadata de migración para rastreabilidad
 * - Validación post-migración
 * - Reporte detallado
 *
 * Uso:
 *   npx tsx scripts/migrate-cuotas-to-items.ts           # Migración real
 *   npx tsx scripts/migrate-cuotas-to-items.ts --dry-run # Preview
 *
 * @author SIGESDA Development Team
 * @date 2025-12-17
 */

import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface MigrationStats {
  total: number;
  migradas: number;
  errores: number;
  skipped: number;
  details: Array<{
    cuotaId: number;
    status: 'success' | 'error' | 'skipped';
    itemsCreated: number;
    montoBaseOriginal: number;
    montoActividadesOriginal: number;
    message?: string;
  }>;
}

/**
 * Main migration function
 */
async function migrateCuotasToItems(dryRun = false): Promise<MigrationStats> {
  const isDryRun = dryRun || process.argv.includes('--dry-run');
  const mode = isDryRun ? '🔍 DRY-RUN MODE' : '🔄 MIGRATION MODE';

  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║  FASE 2 - Task 2.4: Migración Cuotas Legacy → Sistema Ítems      ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');
  console.log(`${mode} - ${isDryRun ? 'No se modificarán datos' : 'Se modificarán datos reales'}\n`);

  const stats: MigrationStats = {
    total: 0,
    migradas: 0,
    errores: 0,
    skipped: 0,
    details: []
  };

  try {
    // ══════════════════════════════════════════════════════════════════════
    // 1. Verificar que existen los tipos de ítems necesarios
    // ══════════════════════════════════════════════════════════════════════
    console.log('📦 Verificando tipos de ítems...');

    const tipoCuotaBase = await prisma.tipoItemCuota.findUnique({
      where: { codigo: 'CUOTA_BASE_SOCIO' }
    });
    const tipoActividad = await prisma.tipoItemCuota.findUnique({
      where: { codigo: 'ACTIVIDAD_INDIVIDUAL' }
    });

    if (!tipoCuotaBase) {
      throw new Error('Tipo de ítem CUOTA_BASE_SOCIO no encontrado. Ejecute seed primero.');
    }
    if (!tipoActividad) {
      throw new Error('Tipo de ítem ACTIVIDAD_INDIVIDUAL no encontrado. Ejecute seed primero.');
    }

    console.log(`   ✅ Tipo CUOTA_BASE_SOCIO: ID ${tipoCuotaBase.id}`);
    console.log(`   ✅ Tipo ACTIVIDAD_INDIVIDUAL: ID ${tipoActividad.id}\n`);

    // ══════════════════════════════════════════════════════════════════════
    // 2. Buscar cuotas con campos legacy que NO tienen ítems
    // ══════════════════════════════════════════════════════════════════════
    console.log('🔍 Buscando cuotas legacy para migrar...');

    const cuotasLegacy = await prisma.cuota.findMany({
      where: {
        OR: [
          { montoBase: { not: null } },
          { montoActividades: { not: null } }
        ],
        items: {
          none: {}  // No tienen ítems todavía
        }
      },
      include: {
        categoria: true,
        recibo: {
          select: {
            id: true,
            estado: true
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    });

    stats.total = cuotasLegacy.length;

    console.log(`   📋 Encontradas ${cuotasLegacy.length} cuotas para migrar\n`);

    if (cuotasLegacy.length === 0) {
      console.log('✅ No hay cuotas legacy para migrar. Sistema ya actualizado.\n');
      return stats;
    }

    // ══════════════════════════════════════════════════════════════════════
    // 3. Migrar cada cuota
    // ══════════════════════════════════════════════════════════════════════
    console.log(`🚀 Iniciando migración de ${cuotasLegacy.length} cuotas...\n`);

    for (const cuota of cuotasLegacy) {
      try {
        const montoBaseNum = Number(cuota.montoBase || 0);
        const montoActividadesNum = Number(cuota.montoActividades || 0);

        // Skip cuotas con montos en 0
        if (montoBaseNum === 0 && montoActividadesNum === 0) {
          stats.skipped++;
          stats.details.push({
            cuotaId: cuota.id,
            status: 'skipped',
            itemsCreated: 0,
            montoBaseOriginal: 0,
            montoActividadesOriginal: 0,
            message: 'Ambos montos son 0'
          });
          continue;
        }

        if (isDryRun) {
          // DRY-RUN: Solo simular
          let itemsToCreate = 0;
          if (montoBaseNum > 0) itemsToCreate++;
          if (montoActividadesNum > 0) itemsToCreate++;

          console.log(`   [DRY-RUN] Cuota ID ${cuota.id}:`);
          console.log(`      - Recibo: ${cuota.recibo.id} (${cuota.recibo.estado})`);
          if (montoBaseNum > 0) {
            console.log(`      - Crear ítem CUOTA_BASE: $${montoBaseNum}`);
          }
          if (montoActividadesNum > 0) {
            console.log(`      - Crear ítem ACTIVIDAD: $${montoActividadesNum}`);
          }
          console.log(`      - Nullificar campos legacy\n`);

          stats.migradas++;
          stats.details.push({
            cuotaId: cuota.id,
            status: 'success',
            itemsCreated: itemsToCreate,
            montoBaseOriginal: montoBaseNum,
            montoActividadesOriginal: montoActividadesNum,
            message: 'Simulado en dry-run'
          });

        } else {
          // MIGRACIÓN REAL: Transacción atómica
          await prisma.$transaction(async (tx) => {
            const itemsToCreate: Prisma.ItemCuotaCreateManyInput[] = [];
            const migrationDate = new Date();

            // 3.1. Crear ítem de cuota base
            if (montoBaseNum > 0) {
              itemsToCreate.push({
                cuotaId: cuota.id,
                tipoItemId: tipoCuotaBase.id,
                concepto: `Cuota Base - ${cuota.categoria?.nombre || 'Socio'}`,
                monto: new Prisma.Decimal(montoBaseNum),
                cantidad: new Prisma.Decimal(1),
                porcentaje: null,
                esAutomatico: true,
                esEditable: false,
                observaciones: 'Migrado automáticamente desde campo legacy montoBase',
                metadata: {
                  migratedFrom: 'montoBase',
                  migrationDate: migrationDate.toISOString(),
                  originalValue: montoBaseNum
                }
              });
            }

            // 3.2. Crear ítem de actividades
            if (montoActividadesNum > 0) {
              itemsToCreate.push({
                cuotaId: cuota.id,
                tipoItemId: tipoActividad.id,
                concepto: 'Actividades (migrado desde monto_actividades)',
                monto: new Prisma.Decimal(montoActividadesNum),
                cantidad: new Prisma.Decimal(1),
                porcentaje: null,
                esAutomatico: true,
                esEditable: false,
                observaciones: 'Migrado automáticamente desde campo legacy montoActividades',
                metadata: {
                  migratedFrom: 'montoActividades',
                  migrationDate: migrationDate.toISOString(),
                  originalValue: montoActividadesNum
                }
              });
            }

            // 3.3. Crear ítems en batch
            if (itemsToCreate.length > 0) {
              await tx.itemCuota.createMany({
                data: itemsToCreate
              });
            }

            // 3.4. Nullificar campos legacy
            await tx.cuota.update({
              where: { id: cuota.id },
              data: {
                montoBase: null,
                montoActividades: null
              }
            });
          });

          stats.migradas++;
          stats.details.push({
            cuotaId: cuota.id,
            status: 'success',
            itemsCreated: (montoBaseNum > 0 ? 1 : 0) + (montoActividadesNum > 0 ? 1 : 0),
            montoBaseOriginal: montoBaseNum,
            montoActividadesOriginal: montoActividadesNum
          });

          if (stats.migradas % 50 === 0) {
            console.log(`   ⏳ Progreso: ${stats.migradas}/${cuotasLegacy.length} migradas...`);
          }
        }

      } catch (error: any) {
        console.error(`   ❌ Error migrando cuota ID ${cuota.id}:`, error.message);
        stats.errores++;
        stats.details.push({
          cuotaId: cuota.id,
          status: 'error',
          itemsCreated: 0,
          montoBaseOriginal: Number(cuota.montoBase || 0),
          montoActividadesOriginal: Number(cuota.montoActividades || 0),
          message: error.message
        });
      }
    }

    // ══════════════════════════════════════════════════════════════════════
    // 4. Validación post-migración (solo si no es dry-run)
    // ══════════════════════════════════════════════════════════════════════
    if (!isDryRun && stats.migradas > 0) {
      console.log('\n🔍 Validando migración...');

      const cuotasConCamposLegacy = await prisma.cuota.count({
        where: {
          OR: [
            { montoBase: { not: null } },
            { montoActividades: { not: null } }
          ],
          items: {
            none: {}
          }
        }
      });

      if (cuotasConCamposLegacy > 0) {
        console.log(`   ⚠️  ADVERTENCIA: Aún quedan ${cuotasConCamposLegacy} cuotas legacy sin migrar`);
      } else {
        console.log('   ✅ Validación OK: No quedan cuotas legacy sin migrar');
      }
    }

    // ══════════════════════════════════════════════════════════════════════
    // 5. Resumen final
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
    console.log('║                    RESUMEN DE MIGRACIÓN                            ║');
    console.log('╚═══════════════════════════════════════════════════════════════════╝\n');
    console.log(`   📊 Total de cuotas encontradas:  ${stats.total}`);
    console.log(`   ✅ Migradas exitosamente:        ${stats.migradas}`);
    console.log(`   ⏭️  Omitidas (montos en 0):      ${stats.skipped}`);
    console.log(`   ❌ Errores:                      ${stats.errores}`);
    console.log(`   📈 Tasa de éxito:                ${stats.total > 0 ? ((stats.migradas / stats.total) * 100).toFixed(2) : 0}%\n`);

    if (isDryRun) {
      console.log('🔍 DRY-RUN COMPLETADO - No se modificaron datos reales');
      console.log('   Para ejecutar la migración real, ejecute sin --dry-run\n');
    } else {
      console.log('✅ MIGRACIÓN COMPLETADA\n');
    }

    return stats;

  } catch (error) {
    console.error('\n❌ ERROR CRÍTICO EN MIGRACIÓN:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Execution
// ═══════════════════════════════════════════════════════════════════════════

if (require.main === module) {
  migrateCuotasToItems()
    .then((stats) => {
      if (stats.errores > 0) {
        console.error(`⚠️  Migración completada con ${stats.errores} errores`);
        process.exit(1);
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error fatal:', error);
      process.exit(1);
    });
}

export { migrateCuotasToItems };
