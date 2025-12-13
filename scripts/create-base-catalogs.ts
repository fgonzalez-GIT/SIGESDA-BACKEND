import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createBaseCatalogs() {
  try {
    console.log('🌱 Creando catálogos base...\n');

    // 1. Crear tipo SOCIO
    console.log('📋 Creando tipo SOCIO...');
    const tipoSocio = await prisma.tipoPersonaCatalogo.upsert({
      where: { codigo: 'SOCIO' },
      update: {},
      create: {
        codigo: 'SOCIO',
        nombre: 'Socio',
        descripcion: 'Socio de la asociación',
        activo: true,
        orden: 1
      }
    });
    console.log('   ✅ Tipo SOCIO creado/actualizado');

    // 2. Crear categorías de socio
    console.log('\n📋 Creando categorías de socio...');

    const categorias = [
      { codigo: 'ACTIVO', nombre: 'Activo', descripcion: 'Socio activo con cuota completa', montoCuota: 50.00, orden: 1 },
      { codigo: 'ESTUDIANTE', nombre: 'Estudiante', descripcion: 'Socio estudiante con descuento', montoCuota: 30.00, orden: 2 },
      { codigo: 'FAMILIAR', nombre: 'Familiar', descripcion: 'Familiar de socio con descuento', montoCuota: 25.00, orden: 3 },
      { codigo: 'JUBILADO', nombre: 'Jubilado', descripcion: 'Socio jubilado con descuento', montoCuota: 20.00, orden: 4 },
      { codigo: 'GENERAL', nombre: 'General', descripcion: 'Socio general sin categoría específica', montoCuota: 40.00, orden: 5 }
    ];

    for (const cat of categorias) {
      await prisma.categoriaSocio.upsert({
        where: { codigo: cat.codigo },
        update: {},
        create: {
          codigo: cat.codigo,
          nombre: cat.nombre,
          descripcion: cat.descripcion,
          montoCuota: cat.montoCuota,
          activa: true,
          orden: cat.orden
        }
      });
      console.log(`   ✅ ${cat.nombre}`);
    }

    console.log('\n✅ Catálogos base creados correctamente');

  } catch (error) {
    console.error('❌ Error creando catálogos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createBaseCatalogs()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
