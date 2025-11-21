const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyMigration() {
  console.log('🔍 Verificando migración...\n');

  try {
    // Test 1: Verificar que el campo activo existe
    const personas = await prisma.persona.findMany({
      select: {
        id: true,
        nombre: true,
        apellido: true,
        activo: true,
        fechaBaja: true
      },
      take: 5
    });

    console.log('✅ Campo "activo" está disponible');
    console.log('📊 Primeras 5 personas:');
    personas.forEach(p => {
      console.log(`  - ${p.nombre} ${p.apellido}: activo=${p.activo}, fechaBaja=${p.fechaBaja ? 'Sí' : 'No'}`);
    });

    // Test 2: Contar personas activas vs inactivas
    const totalActivas = await prisma.persona.count({ where: { activo: true } });
    const totalInactivas = await prisma.persona.count({ where: { activo: false } });

    console.log('\n📈 Estadísticas:');
    console.log(`  - Personas activas: ${totalActivas}`);
    console.log(`  - Personas inactivas: ${totalInactivas}`);

    // Test 3: Verificar que el campo tipo ya no existe (esto causará error si no se eliminó)
    try {
      await prisma.$queryRaw`SELECT tipo FROM personas LIMIT 1`;
      console.log('\n⚠️  ADVERTENCIA: El campo "tipo" todavía existe en la base de datos');
    } catch (error) {
      if (error.message.includes('column "tipo" does not exist')) {
        console.log('\n✅ Campo "tipo" fue eliminado correctamente');
      } else {
        throw error;
      }
    }

    console.log('\n✅ Migración verificada exitosamente!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyMigration();
