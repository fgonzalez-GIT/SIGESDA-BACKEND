/**
 * Script para aplicar migración de ESPOSA y ESPOSO al enum TipoParentesco
 * Ejecuta el SQL de migración usando la conexión de Prisma
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function applyMigration() {
  try {
    console.log('🚀 Iniciando migración de enum TipoParentesco...\n');

    // Paso 1: Agregar valor ESPOSA
    console.log('📝 Agregando valor ESPOSA al enum...');
    await prisma.$executeRawUnsafe(`
      ALTER TYPE "TipoParentesco" ADD VALUE IF NOT EXISTS 'ESPOSA'
    `);
    console.log('✅ ESPOSA agregado exitosamente\n');

    // Paso 2: Agregar valor ESPOSO
    console.log('📝 Agregando valor ESPOSO al enum...');
    await prisma.$executeRawUnsafe(`
      ALTER TYPE "TipoParentesco" ADD VALUE IF NOT EXISTS 'ESPOSO'
    `);
    console.log('✅ ESPOSO agregado exitosamente\n');

    // Paso 3: Verificar valores del enum
    console.log('🔍 Verificando valores del enum...');
    const enumValues = await prisma.$queryRaw`
      SELECT unnest(enum_range(NULL::"TipoParentesco")) as valor
    `;
    console.log('📋 Valores del enum TipoParentesco:');
    enumValues.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.valor}`);
    });
    console.log('');

    // Paso 4: Crear índice para mejorar performance
    console.log('📝 Creando índice parcial para relaciones maritales...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_familiares_parentesco_marital
      ON familiares(parentesco)
      WHERE parentesco IN ('CONYUGE', 'ESPOSA', 'ESPOSO')
    `);
    console.log('✅ Índice creado exitosamente\n');

    // Paso 5: Agregar comentario a la columna
    console.log('📝 Actualizando comentario de columna...');
    await prisma.$executeRawUnsafe(`
      COMMENT ON COLUMN familiares.parentesco IS
      'Tipo de relación familiar. Valores maritales: CONYUGE (genérico neutro), ESPOSA (femenino), ESPOSO (masculino)'
    `);
    console.log('✅ Comentario actualizado\n');

    // Paso 6: Verificar que ESPOSA y ESPOSO existen
    const hasEsposa = enumValues.some(row => row.valor === 'ESPOSA');
    const hasEsposo = enumValues.some(row => row.valor === 'ESPOSO');

    if (hasEsposa && hasEsposo) {
      console.log('✅ MIGRACIÓN COMPLETADA EXITOSAMENTE');
      console.log('   - ESPOSA y ESPOSO agregados al enum TipoParentesco');
      console.log('   - Índice de performance creado');
      console.log('   - Total de valores en enum:', enumValues.length);
    } else {
      console.error('❌ ERROR: Los valores no fueron agregados correctamente');
      console.error('   ESPOSA:', hasEsposa ? '✅' : '❌');
      console.error('   ESPOSO:', hasEsposo ? '✅' : '❌');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ ERROR durante la migración:');
    console.error(error.message);

    if (error.code === 'P2010') {
      console.log('\n💡 Posible solución: Los valores ya existen en el enum (esto es normal si ya se ejecutó antes)');
    }

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar migración
applyMigration();
