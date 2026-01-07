/**
 * Script para verificar las cuotas V2 con ítems creadas en FASE 2
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n📊 VERIFICACIÓN FASE 2: Cuotas V2 con Ítems\n');
  console.log('═'.repeat(70));

  // 1. Verificar catálogos creados
  const categorias = await prisma.categoriaItem.findMany({
    orderBy: { orden: 'asc' }
  });

  const tipos = await prisma.tipoItemCuota.findMany({
    orderBy: { orden: 'asc' },
    include: {
      categoriaItem: true
    }
  });

  console.log('\n✅ CATÁLOGOS CREADOS:');
  console.log(`   CategoriaItem: ${categorias.length} registros`);
  categorias.forEach(cat => {
    console.log(`      - ${cat.codigo}: ${cat.nombre}`);
  });

  console.log(`\n   TipoItemCuota: ${tipos.length} registros`);
  tipos.forEach(tipo => {
    console.log(`      - ${tipo.codigo}: ${tipo.nombre} (${tipo.categoriaItem.nombre})`);
  });

  // 2. Verificar cuotas creadas
  const cuotas = await prisma.cuota.findMany({
    include: {
      items: {
        include: {
          tipoItem: {
            include: {
              categoriaItem: true
            }
          }
        },
        orderBy: {
          id: 'asc'
        }
      },
      recibo: {
        include: {
          receptor: true
        }
      },
      categoria: true
    },
    orderBy: {
      id: 'asc'
    }
  });

  console.log('\n═'.repeat(70));
  console.log(`\n✅ CUOTAS V2 CREADAS: ${cuotas.length} registros\n`);

  cuotas.forEach((cuota, index) => {
    console.log(`\n📄 CUOTA #${index + 1} (ID: ${cuota.id})`);
    console.log(`   Receptor: ${cuota.recibo.receptor.nombre} ${cuota.recibo.receptor.apellido}`);
    console.log(`   Período: ${cuota.mes}/${cuota.anio}`);
    console.log(`   Categoría: ${cuota.categoria?.nombre || 'N/A'}`);
    console.log(`   Total: $${cuota.montoTotal}`);
    console.log(`   V1 Fields: montoBase=${cuota.montoBase}, montoActividades=${cuota.montoActividades}`);

    if (cuota.items && cuota.items.length > 0) {
      console.log(`\n   📋 ÍTEMS (${cuota.items.length}):`);
      cuota.items.forEach((item, idx) => {
        const simbolo = item.monto >= 0 ? '+' : '';
        console.log(`      ${idx + 1}. [${item.tipoItem.categoriaItem.codigo}] ${item.tipoItem.nombre}`);
        console.log(`         Concepto: ${item.concepto}`);
        console.log(`         Monto: ${simbolo}$${item.monto}`);
        if (item.porcentaje) {
          console.log(`         Porcentaje: ${item.porcentaje}%`);
        }
        if (item.metadata) {
          console.log(`         Metadata: ${JSON.stringify(item.metadata)}`);
        }
      });

      // Verificar suma de ítems
      const sumaItems = cuota.items.reduce((sum, item) => sum + parseFloat(item.monto), 0);
      const montoTotal = parseFloat(cuota.montoTotal);
      const match = Math.abs(sumaItems - montoTotal) < 0.01;

      console.log(`\n   💰 Suma de ítems: $${sumaItems.toFixed(2)}`);
      console.log(`   💰 Monto total: $${montoTotal.toFixed(2)}`);
      console.log(`   ${match ? '✅' : '❌'} Integridad: ${match ? 'OK' : 'INCONSISTENTE'}`);
    } else {
      console.log(`\n   ⚠️  SIN ÍTEMS (V1 Legacy)`);
    }

    console.log('   ' + '-'.repeat(65));
  });

  // 3. Verificar historial de ajustes
  const historial = await prisma.historialAjusteCuota.findMany({
    include: {
      persona: true,
      ajuste: true,
      exencion: true
    }
  });

  console.log('\n═'.repeat(70));
  console.log(`\n✅ HISTORIAL DE AJUSTES/EXENCIONES: ${historial.length} registros\n`);

  historial.forEach((h, idx) => {
    console.log(`   ${idx + 1}. ${h.accion} - ${h.persona.nombre} ${h.persona.apellido}`);
    console.log(`      Motivo: ${h.motivoCambio}`);
    console.log(`      Usuario: ${h.usuario}`);
    if (h.ajuste) {
      console.log(`      Tipo ajuste: ${h.ajuste.tipoAjuste}`);
    }
    if (h.exencion) {
      console.log(`      Tipo exención: ${h.exencion.tipoExencion}`);
    }
  });

  console.log('\n═'.repeat(70));
  console.log('\n🎉 VERIFICACIÓN COMPLETADA\n');

  // Resumen final
  console.log('📊 RESUMEN FASE 2:');
  console.log(`   ✅ CategoriaItem: ${categorias.length}/6`);
  console.log(`   ✅ TipoItemCuota: ${tipos.length}/9`);
  console.log(`   ✅ Cuotas con Items V2: ${cuotas.filter(c => c.items.length > 0).length}`);
  console.log(`   ✅ Historial: ${historial.length}/3`);

  const todasCuotasV2 = cuotas.every(c => c.items.length > 0 && c.montoBase === null && c.montoActividades === null);
  console.log(`   ${todasCuotasV2 ? '✅' : '⚠️ '} Todas las cuotas son V2: ${todasCuotasV2 ? 'SÍ' : 'NO'}`);

  console.log('\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
