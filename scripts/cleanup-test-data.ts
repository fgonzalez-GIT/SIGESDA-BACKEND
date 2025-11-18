import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupTestData() {
  console.log('🧹 Limpiando datos de prueba...\n');

  try {
    // 1. Eliminar actividades de prueba (CASCADE eliminará horarios, docentes, participaciones)
    const deletedActividades = await prisma.actividades.deleteMany({
      where: {
        codigoActividad: {
          contains: 'TEST-ACT'
        }
      }
    });
    console.log(`✓ Eliminadas ${deletedActividades.count} actividades de prueba`);

    // 2. Eliminar personas de prueba creadas en tests
    const deletedPersonas = await prisma.persona.deleteMany({
      where: {
        OR: [
          { nombre: { contains: 'ParticipanteTest' } },
          { nombre: { contains: 'SinTipoDocente' } },
          { apellido: { contains: 'ParticipanteTest' } },
          { apellido: { contains: 'SinTipoDocente' } }
        ]
      }
    });
    console.log(`✓ Eliminadas ${deletedPersonas.count} personas de prueba`);

    // 3. Las participaciones se eliminan automáticamente por CASCADE

    console.log('\n✅ Limpieza completada exitosamente\n');
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanupTestData();
