/**
 * ============================================================================
 * SCRIPT DE RESETEO: AULAS, EQUIPAMIENTOS Y RESERVAS
 * ============================================================================
 * Este script elimina TODOS los datos relacionados con:
 * - Aulas y Equipamientos
 * - Reservas de Aulas
 * - Catálogos relacionados (Tipos, Estados, Categorías)
 *
 * ADVERTENCIA: Esta operación es IRREVERSIBLE. Se perderán todos los datos.
 * ============================================================================
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetAulasEquipamientosReservas() {
  console.log('🧹 Iniciando reseteo de Aulas, Equipamientos y Reservas...\n');

  try {
    // ========================================================================
    // NIVEL 1: ELIMINAR DATOS TRANSACCIONALES (Dependencias más altas)
    // ========================================================================

    console.log('📁 NIVEL 1: Eliminando datos transaccionales...');

    console.log('  → Eliminando reservas_aulas_secciones...');
    const deletedReservasSeccion = await prisma.reservas_aulas_secciones.deleteMany({});
    console.log(`     ✓ Eliminados: ${deletedReservasSeccion.count} registros`);

    console.log('  → Eliminando reserva_aulas...');
    const deletedReservasAulas = await prisma.reserva_aulas.deleteMany({});
    console.log(`     ✓ Eliminados: ${deletedReservasAulas.count} registros`);

    console.log('  → Eliminando aulas_equipamientos...');
    const deletedAulasEquipamientos = await prisma.aulaEquipamiento.deleteMany({});
    console.log(`     ✓ Eliminados: ${deletedAulasEquipamientos.count} registros`);

    console.log('✅ Datos transaccionales eliminados\n');

    // ========================================================================
    // NIVEL 2: ELIMINAR MAESTROS (Aulas, Equipamientos)
    // ========================================================================

    console.log('📁 NIVEL 2: Eliminando maestros...');

    console.log('  → Eliminando aulas...');
    const deletedAulas = await prisma.aula.deleteMany({});
    console.log(`     ✓ Eliminados: ${deletedAulas.count} registros`);

    console.log('  → Eliminando equipamientos...');
    const deletedEquipamientos = await prisma.equipamiento.deleteMany({});
    console.log(`     ✓ Eliminados: ${deletedEquipamientos.count} registros`);

    console.log('✅ Maestros eliminados\n');

    // ========================================================================
    // NIVEL 3: ELIMINAR CATÁLOGOS
    // ========================================================================

    console.log('📁 NIVEL 3: Eliminando catálogos...');

    console.log('  → Eliminando estados_reservas...');
    const deletedEstadosReservas = await prisma.estadoReserva.deleteMany({});
    console.log(`     ✓ Eliminados: ${deletedEstadosReservas.count} registros`);

    console.log('  → Eliminando estados_aulas...');
    const deletedEstadosAulas = await prisma.estadoAula.deleteMany({});
    console.log(`     ✓ Eliminados: ${deletedEstadosAulas.count} registros`);

    console.log('  → Eliminando tipos_aulas...');
    const deletedTiposAulas = await prisma.tipoAula.deleteMany({});
    console.log(`     ✓ Eliminados: ${deletedTiposAulas.count} registros`);

    console.log('  → Eliminando categorias_equipamiento...');
    const deletedCategoriasEquipamiento = await prisma.categoriasEquipamiento.deleteMany({});
    console.log(`     ✓ Eliminados: ${deletedCategoriasEquipamiento.count} registros`);

    console.log('✅ Catálogos eliminados\n');

    // ========================================================================
    // RESETEO DE SECUENCIAS (AUTO_INCREMENT)
    // ========================================================================

    console.log('📁 Reseteando secuencias de autoincrement...');

    await prisma.$executeRaw`ALTER SEQUENCE aulas_id_seq RESTART WITH 1`;
    console.log('  ✓ aulas_id_seq → 1');

    await prisma.$executeRaw`ALTER SEQUENCE equipamientos_id_seq RESTART WITH 1`;
    console.log('  ✓ equipamientos_id_seq → 1');

    await prisma.$executeRaw`ALTER SEQUENCE aulas_equipamientos_id_seq RESTART WITH 1`;
    console.log('  ✓ aulas_equipamientos_id_seq → 1');

    await prisma.$executeRaw`ALTER SEQUENCE reserva_aulas_id_seq RESTART WITH 1`;
    console.log('  ✓ reserva_aulas_id_seq → 1');

    await prisma.$executeRaw`ALTER SEQUENCE reservas_aulas_secciones_id_seq RESTART WITH 1`;
    console.log('  ✓ reservas_aulas_secciones_id_seq → 1');

    await prisma.$executeRaw`ALTER SEQUENCE tipos_aulas_id_seq RESTART WITH 1`;
    console.log('  ✓ tipos_aulas_id_seq → 1');

    await prisma.$executeRaw`ALTER SEQUENCE estados_aulas_id_seq RESTART WITH 1`;
    console.log('  ✓ estados_aulas_id_seq → 1');

    await prisma.$executeRaw`ALTER SEQUENCE estados_reservas_id_seq RESTART WITH 1`;
    console.log('  ✓ estados_reservas_id_seq → 1');

    await prisma.$executeRaw`ALTER SEQUENCE categorias_equipamiento_id_seq RESTART WITH 1`;
    console.log('  ✓ categorias_equipamiento_id_seq → 1');

    console.log('✅ Secuencias reseteadas\n');

    // ========================================================================
    // RESUMEN FINAL
    // ========================================================================

    console.log('\n' + '='.repeat(80));
    console.log('✅ RESETEO COMPLETADO EXITOSAMENTE');
    console.log('='.repeat(80));
    console.log('\n📊 RESUMEN DE OPERACIÓN:\n');

    console.log('📁 REGISTROS ELIMINADOS:');
    console.log(`  ✓ reservas_aulas_secciones: ${deletedReservasSeccion.count}`);
    console.log(`  ✓ reserva_aulas: ${deletedReservasAulas.count}`);
    console.log(`  ✓ aulas_equipamientos: ${deletedAulasEquipamientos.count}`);
    console.log(`  ✓ aulas: ${deletedAulas.count}`);
    console.log(`  ✓ equipamientos: ${deletedEquipamientos.count}`);
    console.log(`  ✓ estados_reservas: ${deletedEstadosReservas.count}`);
    console.log(`  ✓ estados_aulas: ${deletedEstadosAulas.count}`);
    console.log(`  ✓ tipos_aulas: ${deletedTiposAulas.count}`);
    console.log(`  ✓ categorias_equipamiento: ${deletedCategoriasEquipamiento.count}\n`);

    const totalRegistrosEliminados =
      deletedReservasSeccion.count +
      deletedReservasAulas.count +
      deletedAulasEquipamientos.count +
      deletedAulas.count +
      deletedEquipamientos.count +
      deletedEstadosReservas.count +
      deletedEstadosAulas.count +
      deletedTiposAulas.count +
      deletedCategoriasEquipamiento.count;

    console.log(`📊 TOTAL REGISTROS ELIMINADOS: ${totalRegistrosEliminados}`);
    console.log('📊 TABLAS AFECTADAS: 9');
    console.log('📊 SECUENCIAS RESETEADAS: 9\n');

    console.log('='.repeat(80));
    console.log('🎯 PRÓXIMO PASO: Ejecutar el seed para recargar datos');
    console.log('   Comando: npm run db:seed');
    console.log('   O: npx ts-node prisma/seed.ts');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ ERROR EN RESETEO:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecución
resetAulasEquipamientosReservas()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
