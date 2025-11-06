import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Limpiando datos de test...\n');

  // Eliminar personas con DNIs de test
  const testDnis = ['99999999', '88888888'];

  for (const dni of testDnis) {
    const persona = await prisma.persona.findFirst({
      where: { dni }
    });

    if (persona) {
      console.log(`  ❌ Eliminando persona con DNI ${dni} (ID: ${persona.id})...`);

      // Eliminar relaciones familiares donde esta persona es socio o familiar
      await prisma.familiar.deleteMany({
        where: {
          OR: [
            { socioId: persona.id },
            { familiarId: persona.id }
          ]
        }
      });

      // Eliminar participaciones en actividades
      await prisma.participacion_actividades.deleteMany({
        where: { personaId: persona.id }
      });

      // Eliminar tipos de persona
      await prisma.personaTipo.deleteMany({
        where: { personaId: persona.id }
      });

      // Eliminar contactos
      await prisma.contactoPersona.deleteMany({
        where: { personaId: persona.id }
      });

      // Eliminar la persona
      await prisma.persona.delete({
        where: { id: persona.id }
      });

      console.log(`  ✅ Persona con DNI ${dni} eliminada exitosamente\n`);
    } else {
      console.log(`  ℹ️  No se encontró persona con DNI ${dni}\n`);
    }
  }

  console.log('✅ Limpieza completada!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error durante la limpieza:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
