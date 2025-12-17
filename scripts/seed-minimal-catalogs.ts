/**
 * Seed minimal catalogs for E2E tests
 * Populates only the essential catalogs needed for tests to run
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMinimalCatalogs() {
  console.log('\n🌱 Seeding minimal catalogs...\n');

  try {
    // ════════════════════════════════════════════════════════════════════════
    // 1. Tipo Persona Catálogo (CRITICAL)
    // ════════════════════════════════════════════════════════════════════════
    console.log('📋 Seeding tipo_persona_catalogo...');

    const tiposPersona = [
      {
        codigo: 'SOCIO',
        nombre: 'Socio',
        descripcion: 'Socio activo de la asociación',
        requiresCategoria: true,
        requiresEspecialidad: false,
        requiresCuit: false,
        activo: true,
        orden: 1
      },
      {
        codigo: 'NO_SOCIO',
        nombre: 'No Socio',
        descripcion: 'Persona no asociada',
        requiresCategoria: false,
        requiresEspecialidad: false,
        requiresCuit: false,
        activo: true,
        orden: 2
      },
      {
        codigo: 'DOCENTE',
        nombre: 'Docente',
        descripcion: 'Profesor o instructor',
        requiresCategoria: false,
        requiresEspecialidad: true,
        requiresCuit: true,
        activo: true,
        orden: 3
      },
      {
        codigo: 'PROVEEDOR',
        nombre: 'Proveedor',
        descripcion: 'Proveedor de servicios o productos',
        requiresCategoria: false,
        requiresEspecialidad: false,
        requiresCuit: true,
        activo: true,
        orden: 4
      }
    ];

    for (const tipo of tiposPersona) {
      await prisma.tipoPersonaCatalogo.upsert({
        where: { codigo: tipo.codigo },
        update: tipo,
        create: tipo
      });
    }
    console.log(`   ✅ ${tiposPersona.length} tipos de persona creados\n`);

    // ════════════════════════════════════════════════════════════════════════
    // 2. Categoría Item (REQUIRED for TipoItemCuota)
    // ════════════════════════════════════════════════════════════════════════
    console.log('📂 Seeding categoria_item...');

    const categoriasItem = [
      {
        codigo: 'CUOTA',
        nombre: 'Cuota',
        descripcion: 'Items relacionados con cuotas mensuales',
        icono: '💰',
        color: '#4CAF50',
        activo: true,
        orden: 1
      },
      {
        codigo: 'ACTIVIDAD',
        nombre: 'Actividad',
        descripcion: 'Items relacionados con actividades',
        icono: '🎵',
        color: '#2196F3',
        activo: true,
        orden: 2
      },
      {
        codigo: 'AJUSTE',
        nombre: 'Ajuste',
        descripcion: 'Ajustes y descuentos',
        icono: '⚙️',
        color: '#FF9800',
        activo: true,
        orden: 3
      }
    ];

    const createdCategoriasItem: any[] = [];
    for (const cat of categoriasItem) {
      const created = await prisma.categoriaItem.upsert({
        where: { codigo: cat.codigo },
        update: cat,
        create: cat
      });
      createdCategoriasItem.push(created);
    }
    console.log(`   ✅ ${categoriasItem.length} categorías de item creadas\n`);

    // ════════════════════════════════════════════════════════════════════════
    // 3. Tipo Item Cuota (CRITICAL for tests)
    // ════════════════════════════════════════════════════════════════════════
    console.log('📦 Seeding tipo_item_cuota...');

    const categoriaCuota = createdCategoriasItem.find(c => c.codigo === 'CUOTA')!;
    const categoriaActividad = createdCategoriasItem.find(c => c.codigo === 'ACTIVIDAD')!;
    const categoriaAjuste = createdCategoriasItem.find(c => c.codigo === 'AJUSTE')!;

    const tiposItem = [
      {
        codigo: 'CUOTA_BASE',
        nombre: 'Cuota Base',
        descripcion: 'Cuota mensual base según categoría de socio',
        categoriaItemId: categoriaCuota.id,
        esCalculado: true,
        activo: true,
        orden: 1
      },
      {
        codigo: 'ACTIVIDAD',
        nombre: 'Actividad',
        descripcion: 'Cargo por participación en actividad',
        categoriaItemId: categoriaActividad.id,
        esCalculado: true,
        activo: true,
        orden: 2
      },
      {
        codigo: 'AJUSTE_MANUAL',
        nombre: 'Ajuste Manual',
        descripcion: 'Ajuste manual aplicado por administrador',
        categoriaItemId: categoriaAjuste.id,
        esCalculado: false,
        activo: true,
        orden: 3
      }
    ];

    for (const tipo of tiposItem) {
      await prisma.tipoItemCuota.upsert({
        where: { codigo: tipo.codigo },
        update: tipo,
        create: tipo
      });
    }
    console.log(`   ✅ ${tiposItem.length} tipos de item de cuota creados\n`);

    // ════════════════════════════════════════════════════════════════════════
    // 4. Configuración de Descuentos (OPTIONAL - schema may vary)
    // ════════════════════════════════════════════════════════════════════════
    // Note: Commented out as schema fields may differ. Tests will work without this.
    /*
    console.log('⚙️  Seeding configuracion_descuentos...');
    await prisma.configuracionDescuentos.upsert({
      where: { id: 1 },
      update: { activa: true },
      create: { activa: true }
    });
    console.log('   ✅ Configuración de descuentos creada\n');
    */

    console.log('✅ Minimal catalogs seeded successfully\n');

  } catch (error) {
    console.error('\n❌ Error seeding catalogs:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedMinimalCatalogs()
  .then(() => {
    console.log('✅ Seed completed successfully\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  });
