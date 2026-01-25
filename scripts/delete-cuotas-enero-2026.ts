import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function deleteCuotasEnero2026() {
  console.log('🔍 Buscando cuotas de Enero 2026...\n');

  try {
    // 1. Buscar cuotas del período
    const cuotas = await prisma.cuota.findMany({
      where: {
        mes: 1,
        anio: 2026
      },
      include: {
        recibo: {
          include: {
            mediosPago: true
          }
        },
        items: true
      }
    });

    console.log(`📊 Total encontradas: ${cuotas.length} cuotas\n`);

    if (cuotas.length === 0) {
      console.log('✅ No hay cuotas de Enero 2026 para eliminar');
      return;
    }

    // 2. Backup en JSON antes de eliminar
    const backup = {
      fecha: new Date().toISOString(),
      periodo: { mes: 1, anio: 2026 },
      totalCuotas: cuotas.length,
      cuotas: cuotas.map(c => ({
        ...c,
        items: c.items,
        recibo: c.recibo
      }))
    };

    const backupPath = `/tmp/backup-cuotas-enero-2026-${Date.now()}.json`;
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
    console.log(`💾 Backup guardado en: ${backupPath}\n`);

    // 3. Validar que se pueden eliminar
    const cuotasPagadas = cuotas.filter(c => c.recibo.estado === 'PAGADO');
    const cuotasConPagos = cuotas.filter(c => c.recibo.mediosPago.length > 0);

    if (cuotasPagadas.length > 0) {
      console.log(`⚠️  ADVERTENCIA: ${cuotasPagadas.length} cuotas están PAGADAS`);
      console.log(`   IDs: ${cuotasPagadas.map(c => c.id).join(', ')}\n`);
    }

    if (cuotasConPagos.length > 0) {
      console.log(`⚠️  ADVERTENCIA: ${cuotasConPagos.length} cuotas tienen medios de pago`);
      console.log(`   IDs: ${cuotasConPagos.map(c => c.id).join(', ')}\n`);
    }

    // 4. Filtrar solo cuotas eliminables
    const eliminables = cuotas.filter(c =>
      c.recibo.estado !== 'PAGADO' &&
      c.recibo.mediosPago.length === 0
    );

    console.log(`✅ Cuotas eliminables: ${eliminables.length}`);
    console.log(`❌ Cuotas NO eliminables: ${cuotas.length - eliminables.length}\n`);

    if (eliminables.length === 0) {
      console.log('❌ No hay cuotas para eliminar (todas están pagadas o tienen medios de pago)');
      return;
    }

    // 5. Mostrar resumen antes de eliminar
    console.log('📋 Resumen de eliminación:');
    console.log(`   Total cuotas encontradas: ${cuotas.length}`);
    console.log(`   Cuotas a eliminar: ${eliminables.length}`);
    console.log(`   Cuotas que se mantendrán: ${cuotas.length - eliminables.length}`);
    console.log(`   IDs a eliminar: ${eliminables.map(c => c.id).slice(0, 20).join(', ')}${eliminables.length > 20 ? '...' : ''}\n`);

    // 6. Ejecutar eliminación en transacción
    console.log('🗑️  Iniciando eliminación...\n');

    const resultado = await prisma.$transaction(async (tx) => {
      // Eliminar cuotas (cascada automática elimina recibos, items, etc.)
      const deleted = await tx.cuota.deleteMany({
        where: {
          id: {
            in: eliminables.map(c => c.id)
          }
        }
      });

      return deleted;
    });

    console.log(`\n✅ ELIMINACIÓN EXITOSA`);
    console.log(`   Cuotas eliminadas: ${resultado.count}`);
    console.log(`   Recibos eliminados: ${resultado.count} (cascada automática)`);
    console.log(`   Items eliminados: ~${eliminables.reduce((sum, c) => sum + c.items.length, 0)} (cascada automática)`);
    console.log(`   Backup disponible en: ${backupPath}\n`);

    // 7. Verificación post-eliminación
    const verificacion = await prisma.cuota.count({
      where: {
        mes: 1,
        anio: 2026
      }
    });

    console.log(`🔍 Verificación: ${verificacion} cuotas de Enero 2026 restantes`);

    if (verificacion === (cuotas.length - eliminables.length)) {
      console.log('✅ Verificación correcta: Solo quedaron las cuotas no eliminables\n');
    } else {
      console.log('⚠️  Discrepancia en verificación. Por favor revisa manualmente.\n');
    }

    console.log('🎉 Proceso completado. La base de datos está lista para ejecutar Test Case 2.1\n');

  } catch (error) {
    console.error('\n❌ ERROR durante la eliminación:', error);
    console.error('\n⚠️  La transacción fue revertida. No se eliminaron datos.\n');
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  Script de Eliminación de Cuotas - Enero 2026             ║');
console.log('║  SIGESDA - Sistema de Gestión de Actividades              ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

deleteCuotasEnero2026()
  .then(() => {
    console.log('✅ Script finalizado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script finalizado con errores');
    process.exit(1);
  });
