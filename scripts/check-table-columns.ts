import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkColumns() {
  try {
    // Check horarios_actividades columns
    const horariosColumns = await prisma.$queryRaw<any[]>`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'horarios_actividades'
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;

    console.log('\n📋 horarios_actividades columns:');
    horariosColumns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });

    // Check docentes_actividades columns
    const docentesColumns = await prisma.$queryRaw<any[]>`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'docentes_actividades'
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;

    console.log('\n📋 docentes_actividades columns:');
    docentesColumns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });

    // Check actividades columns
    const actividadesColumns = await prisma.$queryRaw<any[]>`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'actividades'
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;

    console.log('\n📋 actividades columns:');
    actividadesColumns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkColumns();
