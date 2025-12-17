/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FASE 2 - Task 2.4: Validación de Migración Cuotas → Ítems
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Valida que la migración de cuotas legacy al sistema de ítems se completó
 * correctamente verificando integridad de datos.
 *
 * Validaciones:
 * 1. No existen cuotas con campos legacy Y sin ítems
 * 2. Suma de ítems coincide con montoTotal
 * 3. Todos los ítems tienen referencias válidas
 * 4. Metadata de migración está presente
 *
 * Uso:
 *   npx tsx scripts/validate-migration-cuotas-items.ts
 *
 * @author SIGESDA Development Team
 * @date 2025-12-17
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalCuotas: number;
    cuotasConItems: number;
    cuotasLegacyPendientes: number;
    itemsMigrados: number;
    cuotasConDiscrepancia: number;
  };
}

/**
 * Main validation function
 */
async function validateMigration(): Promise<ValidationResult> {
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║    FASE 2 - Task 2.4: Validación de Migración Cuotas → Ítems     ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  const result: ValidationResult = {
    passed: true,
    errors: [],
    warnings: [],
    stats: {
      totalCuotas: 0,
      cuotasConItems: 0,
      cuotasLegacyPendientes: 0,
      itemsMigrados: 0,
      cuotasConDiscrepancia: 0
    }
  };

  try {
    // ══════════════════════════════════════════════════════════════════════
    // Validación 1: Cuotas con campos legacy sin ítems
    // ══════════════════════════════════════════════════════════════════════
    console.log('📋 Validación 1: Cuotas legacy pendientes de migración...');

    const cuotasLegacyPendientes = await prisma.cuota.findMany({
      where: {
        OR: [
          { montoBase: { not: null } },
          { montoActividades: { not: null } }
        ],
        items: {
          none: {}
        }
      },
      select: {
        id: true,
        montoBase: true,
        montoActividades: true,
        montoTotal: true
      }
    });

    result.stats.cuotasLegacyPendientes = cuotasLegacyPendientes.length;

    if (cuotasLegacyPendientes.length > 0) {
      result.errors.push(
        `Existen ${cuotasLegacyPendientes.length} cuotas con campos legacy sin migrar`
      );
      result.passed = false;

      console.log(`   ❌ FALLO: ${cuotasLegacyPendientes.length} cuotas pendientes`);
      console.log('   IDs:', cuotasLegacyPendientes.slice(0, 10).map(c => c.id).join(', '), '...\n');
    } else {
      console.log('   ✅ PASS: No hay cuotas legacy pendientes\n');
    }

    // ══════════════════════════════════════════════════════════════════════
    // Validación 2: Integridad de suma de ítems vs montoTotal
    // ══════════════════════════════════════════════════════════════════════
    console.log('🧮 Validación 2: Integridad montoTotal vs suma de ítems...');

    const cuotasConItems = await prisma.cuota.findMany({
      where: {
        items: {
          some: {}
        }
      },
      include: {
        items: {
          select: {
            id: true,
            monto: true,
            concepto: true
          }
        }
      }
    });

    result.stats.cuotasConItems = cuotasConItems.length;

    const discrepancias: Array<{
      cuotaId: number;
      montoTotal: number;
      sumaItems: number;
      diferencia: number;
    }> = [];

    for (const cuota of cuotasConItems) {
      const sumaItems = cuota.items.reduce((sum, item) => sum + Number(item.monto), 0);
      const montoTotal = Number(cuota.montoTotal);
      const diferencia = Math.abs(montoTotal - sumaItems);

      // Tolerancia de 0.01 (centavos) por redondeos
      if (diferencia > 0.01) {
        discrepancias.push({
          cuotaId: cuota.id,
          montoTotal,
          sumaItems,
          diferencia
        });
      }
    }

    result.stats.cuotasConDiscrepancia = discrepancias.length;

    if (discrepancias.length > 0) {
      result.warnings.push(
        `${discrepancias.length} cuotas tienen discrepancia entre montoTotal y suma de ítems`
      );

      console.log(`   ⚠️  ADVERTENCIA: ${discrepancias.length} discrepancias encontradas`);
      console.log('   Primeras 5:');
      discrepancias.slice(0, 5).forEach(d => {
        console.log(
          `      - Cuota ${d.cuotaId}: Total=$${d.montoTotal}, Items=$${d.sumaItems}, Diff=$${d.diferencia}`
        );
      });
      console.log();
    } else {
      console.log('   ✅ PASS: Todas las cuotas tienen suma correcta\n');
    }

    // ══════════════════════════════════════════════════════════════════════
    // Validación 3: Ítems con metadata de migración
    // ══════════════════════════════════════════════════════════════════════
    console.log('🏷️  Validación 3: Metadata de migración...');

    const itemsMigrados = await prisma.itemCuota.count({
      where: {
        metadata: {
          path: ['migratedFrom'],
          not: null
        }
      }
    });

    result.stats.itemsMigrados = itemsMigrados;

    console.log(`   📊 ${itemsMigrados} ítems tienen metadata de migración`);

    if (itemsMigrados > 0) {
      const tiposMigrados = await prisma.$queryRaw<Array<{ migratedFrom: string; count: bigint }>>`
        SELECT
          metadata->>'migratedFrom' as "migratedFrom",
          COUNT(*) as count
        FROM items_cuota
        WHERE metadata->>'migratedFrom' IS NOT NULL
        GROUP BY metadata->>'migratedFrom'
      `;

      console.log('   Desglose por tipo:');
      tiposMigrados.forEach(t => {
        console.log(`      - ${t.migratedFrom}: ${t.count} ítems`);
      });
      console.log();
    } else {
      console.log('   ℹ️  No hay ítems migrados con metadata\n');
    }

    // ══════════════════════════════════════════════════════════════════════
    // Validación 4: Integridad referencial
    // ══════════════════════════════════════════════════════════════════════
    console.log('🔗 Validación 4: Integridad referencial...');

    // Items huérfanos (cuota no existe)
    const itemsHuerfanos = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM items_cuota ic
      WHERE NOT EXISTS (
        SELECT 1 FROM cuotas c WHERE c.id = ic.cuota_id
      )
    `;

    const countHuerfanos = Number(itemsHuerfanos[0]?.count || 0);

    if (countHuerfanos > 0) {
      result.errors.push(`${countHuerfanos} ítems huérfanos (cuota no existe)`);
      result.passed = false;
      console.log(`   ❌ FALLO: ${countHuerfanos} ítems huérfanos\n`);
    } else {
      console.log('   ✅ PASS: No hay ítems huérfanos\n');
    }

    // Items sin tipo válido
    const itemsSinTipo = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM items_cuota ic
      WHERE NOT EXISTS (
        SELECT 1 FROM tipos_items_cuota tic WHERE tic.id = ic.tipo_item_id
      )
    `;

    const countSinTipo = Number(itemsSinTipo[0]?.count || 0);

    if (countSinTipo > 0) {
      result.errors.push(`${countSinTipo} ítems con tipo inválido`);
      result.passed = false;
      console.log(`   ❌ FALLO: ${countSinTipo} ítems sin tipo válido\n`);
    } else {
      console.log('   ✅ PASS: Todos los ítems tienen tipo válido\n');
    }

    // ══════════════════════════════════════════════════════════════════════
    // Validación 5: Estadísticas generales
    // ══════════════════════════════════════════════════════════════════════
    console.log('📊 Validación 5: Estadísticas generales...');

    result.stats.totalCuotas = await prisma.cuota.count();

    console.log(`   - Total de cuotas en sistema:        ${result.stats.totalCuotas}`);
    console.log(`   - Cuotas con ítems:                  ${result.stats.cuotasConItems}`);
    console.log(`   - Cuotas legacy pendientes:          ${result.stats.cuotasLegacyPendientes}`);
    console.log(`   - Ítems migrados:                    ${result.stats.itemsMigrados}`);
    console.log(`   - Cuotas con discrepancia de monto:  ${result.stats.cuotasConDiscrepancia}\n`);

    // ══════════════════════════════════════════════════════════════════════
    // Resumen final
    // ══════════════════════════════════════════════════════════════════════
    console.log('╔═══════════════════════════════════════════════════════════════════╗');
    console.log('║                    RESUMEN DE VALIDACIÓN                           ║');
    console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

    if (result.passed) {
      console.log('✅ VALIDACIÓN EXITOSA\n');
      console.log('   Todas las validaciones críticas pasaron correctamente.\n');
    } else {
      console.log('❌ VALIDACIÓN FALLIDA\n');
      console.log('   Errores encontrados:');
      result.errors.forEach(err => console.log(`      - ${err}`));
      console.log();
    }

    if (result.warnings.length > 0) {
      console.log('⚠️  ADVERTENCIAS:\n');
      result.warnings.forEach(warn => console.log(`   - ${warn}`));
      console.log();
    }

    return result;

  } catch (error) {
    console.error('\n❌ ERROR EN VALIDACIÓN:', error);
    result.passed = false;
    result.errors.push(`Error de ejecución: ${error}`);
    return result;
  } finally {
    await prisma.$disconnect();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Execution
// ═══════════════════════════════════════════════════════════════════════════

if (require.main === module) {
  validateMigration()
    .then((result) => {
      if (!result.passed) {
        process.exit(1);
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error fatal:', error);
      process.exit(1);
    });
}

export { validateMigration };
