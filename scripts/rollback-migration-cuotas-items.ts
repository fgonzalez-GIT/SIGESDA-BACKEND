/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FASE 2 - Task 2.4: Rollback de Migración Cuotas → Ítems
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Revierte la migración de cuotas del sistema de ítems al formato legacy
 * (montoBase + montoActividades).
 *
 * ⚠️  USO SOLO EN EMERGENCIA - Perderá desagregación de ítems
 *
 * Características:
 * - Solo revierte ítems creados por migración (con metadata.migratedFrom)
 * - Restaura campos legacy desde suma de ítems
 * - Transacciones atómicas
 * - Dry-run mode disponible
 *
 * Uso:
 *   npx tsx scripts/rollback-migration-cuotas-items.ts           # Rollback real
 *   npx tsx scripts/rollback-migration-cuotas-items.ts --dry-run # Preview
 *
 * @author SIGESDA Development Team
 * @date 2025-12-17
 */

import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface RollbackStats {
  total: number;
  revertidas: number;
  errores: number;
  details: Array<{
    cuotaId: number;
    status: 'success' | 'error';
    itemsEliminados: number;
    montoBaseRestaurado: number;
    montoActividadesRestaurado: number;
    message?: string;
  }>;
}

/**
 * Main rollback function
 */
async function rollbackMigration(dryRun = false): Promise<RollbackStats> {
  const isDryRun = dryRun || process.argv.includes('--dry-run');
  const mode = isDryRun ? '🔍 DRY-RUN MODE' : '⚠️  ROLLBACK MODE';

  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║      FASE 2 - Task 2.4: ROLLBACK Migración Cuotas → Ítems        ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');
  console.log(`${mode} - ${isDryRun ? 'No se modificarán datos' : '⚠️  SE MODIFICARÁN DATOS REALES'}\n`);

  if (!isDryRun) {
    console.log('⚠️  ⚠️  ⚠️  ADVERTENCIA  ⚠️  ⚠️  ⚠️');
    console.log('Este script REVERTIRÁ la migración y ELIMINARÁ ítems migrados.');
    console.log('Se perderá la desagregación de conceptos en ítems individuales.\n');
  }

  const stats: RollbackStats = {
    total: 0,
    revertidas: 0,
    errores: 0,
    details: []
  };

  try {
    // ══════════════════════════════════════════════════════════════════════
    // 1. Buscar cuotas con ítems migrados
    // ══════════════════════════════════════════════════════════════════════
    console.log('🔍 Buscando cuotas con ítems migrados...');

    const cuotasConItemsMigrados = await prisma.cuota.findMany({
      where: {
        items: {
          some: {
            metadata: {
              path: ['migratedFrom'],
              not: null
            }
          }
        }
      },
      include: {
        items: {
          where: {
            metadata: {
              path: ['migratedFrom'],
              not: null
            }
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    });

    stats.total = cuotasConItemsMigrados.length;

    console.log(`   📋 Encontradas ${cuotasConItemsMigrados.length} cuotas para revertir\n`);

    if (cuotasConItemsMigrados.length === 0) {
      console.log('✅ No hay cuotas migradas para revertir.\n');
      return stats;
    }

    // ══════════════════════════════════════════════════════════════════════
    // 2. Revertir cada cuota
    // ══════════════════════════════════════════════════════════════════════
    console.log(`🔄 Iniciando rollback de ${cuotasConItemsMigrados.length} cuotas...\n`);

    for (const cuota of cuotasConItemsMigrados) {
      try {
        // Calcular montos desde ítems migrados
        let montoBase = 0;
        let montoActividades = 0;
        const itemsAEliminar: number[] = [];

        for (const item of cuota.items) {
          const metadata = item.metadata as any;
          const migratedFrom = metadata?.migratedFrom;

          if (migratedFrom === 'montoBase') {
            montoBase += Number(item.monto);
            itemsAEliminar.push(item.id);
          } else if (migratedFrom === 'montoActividades') {
            montoActividades += Number(item.monto);
            itemsAEliminar.push(item.id);
          }
        }

        if (isDryRun) {
          // DRY-RUN: Solo simular
          console.log(`   [DRY-RUN] Cuota ID ${cuota.id}:`);
          console.log(`      - Restaurar montoBase: $${montoBase}`);
          console.log(`      - Restaurar montoActividades: $${montoActividades}`);
          console.log(`      - Eliminar ${itemsAEliminar.length} ítems\n`);

          stats.revertidas++;
          stats.details.push({
            cuotaId: cuota.id,
            status: 'success',
            itemsEliminados: itemsAEliminar.length,
            montoBaseRestaurado: montoBase,
            montoActividadesRestaurado: montoActividades,
            message: 'Simulado en dry-run'
          });

        } else {
          // ROLLBACK REAL: Transacción atómica
          await prisma.$transaction(async (tx) => {
            // 2.1. Restaurar campos legacy
            await tx.cuota.update({
              where: { id: cuota.id },
              data: {
                montoBase: montoBase > 0 ? new Prisma.Decimal(montoBase) : null,
                montoActividades: montoActividades > 0 ? new Prisma.Decimal(montoActividades) : null
              }
            });

            // 2.2. Eliminar ítems migrados
            if (itemsAEliminar.length > 0) {
              await tx.itemCuota.deleteMany({
                where: {
                  id: {
                    in: itemsAEliminar
                  }
                }
              });
            }
          });

          stats.revertidas++;
          stats.details.push({
            cuotaId: cuota.id,
            status: 'success',
            itemsEliminados: itemsAEliminar.length,
            montoBaseRestaurado: montoBase,
            montoActividadesRestaurado: montoActividades
          });

          if (stats.revertidas % 50 === 0) {
            console.log(`   ⏳ Progreso: ${stats.revertidas}/${cuotasConItemsMigrados.length} revertidas...`);
          }
        }

      } catch (error: any) {
        console.error(`   ❌ Error revirtiendo cuota ID ${cuota.id}:`, error.message);
        stats.errores++;
        stats.details.push({
          cuotaId: cuota.id,
          status: 'error',
          itemsEliminados: 0,
          montoBaseRestaurado: 0,
          montoActividadesRestaurado: 0,
          message: error.message
        });
      }
    }

    // ══════════════════════════════════════════════════════════════════════
    // 3. Validación post-rollback (solo si no es dry-run)
    // ══════════════════════════════════════════════════════════════════════
    if (!isDryRun && stats.revertidas > 0) {
      console.log('\n🔍 Validando rollback...');

      const itemsMigradosRestantes = await prisma.itemCuota.count({
        where: {
          metadata: {
            path: ['migratedFrom'],
            not: null
          }
        }
      });

      if (itemsMigradosRestantes > 0) {
        console.log(`   ⚠️  ADVERTENCIA: Aún quedan ${itemsMigradosRestantes} ítems migrados en sistema`);
      } else {
        console.log('   ✅ Validación OK: Todos los ítems migrados fueron eliminados');
      }

      const cuotasSinCamposLegacy = await prisma.cuota.count({
        where: {
          montoBase: null,
          montoActividades: null,
          items: {
            none: {}
          }
        }
      });

      if (cuotasSinCamposLegacy > 0) {
        console.log(`   ⚠️  ADVERTENCIA: ${cuotasSinCamposLegacy} cuotas sin campos legacy ni ítems`);
      }
    }

    // ══════════════════════════════════════════════════════════════════════
    // 4. Resumen final
    // ══════════════════════════════════════════════════════════════════════
    console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
    console.log('║                    RESUMEN DE ROLLBACK                             ║');
    console.log('╚═══════════════════════════════════════════════════════════════════╝\n');
    console.log(`   📊 Total de cuotas encontradas:  ${stats.total}`);
    console.log(`   ↩️  Revertidas exitosamente:     ${stats.revertidas}`);
    console.log(`   ❌ Errores:                      ${stats.errores}`);
    console.log(`   📈 Tasa de éxito:                ${stats.total > 0 ? ((stats.revertidas / stats.total) * 100).toFixed(2) : 0}%\n`);

    if (isDryRun) {
      console.log('🔍 DRY-RUN COMPLETADO - No se modificaron datos reales');
      console.log('   Para ejecutar el rollback real, ejecute sin --dry-run\n');
    } else {
      console.log('↩️  ROLLBACK COMPLETADO\n');
      console.log('⚠️  Las cuotas han sido revertidas al formato legacy.');
      console.log('   Los ítems migrados fueron eliminados.\n');
    }

    return stats;

  } catch (error) {
    console.error('\n❌ ERROR CRÍTICO EN ROLLBACK:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Execution
// ═══════════════════════════════════════════════════════════════════════════

if (require.main === module) {
  // Confirmación en modo real
  const isDryRun = process.argv.includes('--dry-run');

  if (!isDryRun) {
    console.log('\n⚠️  ⚠️  ⚠️  CONFIRMACIÓN REQUERIDA  ⚠️  ⚠️  ⚠️\n');
    console.log('Está a punto de REVERTIR la migración de cuotas.');
    console.log('Esta operación eliminará los ítems migrados y restaurará campos legacy.\n');
    console.log('Para continuar, ejecute nuevamente con confirmación:\n');
    console.log('   CONFIRM_ROLLBACK=yes npx tsx scripts/rollback-migration-cuotas-items.ts\n');

    if (process.env.CONFIRM_ROLLBACK !== 'yes') {
      console.log('❌ Rollback cancelado por falta de confirmación.\n');
      process.exit(1);
    }
  }

  rollbackMigration()
    .then((stats) => {
      if (stats.errores > 0) {
        console.error(`⚠️  Rollback completado con ${stats.errores} errores`);
        process.exit(1);
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error fatal:', error);
      process.exit(1);
    });
}

export { rollbackMigration };
