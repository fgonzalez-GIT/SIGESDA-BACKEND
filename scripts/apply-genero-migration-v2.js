/**
 * Script para aplicar la migración de género directamente
 * Ejecuta cada statement SQL individualmente
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('📦 Aplicando migración de género...\n');

  try {
    // Step 1: Create Genero enum
    console.log('   [1/4] Creando enum Genero...');
    try {
      await prisma.$executeRaw`
        CREATE TYPE "Genero" AS ENUM (
          'MASCULINO',
          'FEMENINO',
          'NO_BINARIO',
          'PREFIERO_NO_DECIR'
        )
      `;
      console.log('   ✅ Enum Genero creado');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('   ⚠️  Enum Genero ya existe (OK)');
      } else {
        throw error;
      }
    }

    // Step 2: Add genero column
    console.log('   [2/4] Agregando columna genero a tabla personas...');
    try {
      await prisma.$executeRaw`
        ALTER TABLE "personas"
        ADD COLUMN "genero" "Genero"
      `;
      console.log('   ✅ Columna genero agregada');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('   ⚠️  Columna genero ya existe (OK)');
      } else {
        throw error;
      }
    }

    // Step 3: Create index
    console.log('   [3/4] Creando índice en columna genero...');
    try {
      await prisma.$executeRaw`
        CREATE INDEX "personas_genero_idx" ON "personas"("genero")
      `;
      console.log('   ✅ Índice creado');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('   ⚠️  Índice ya existe (OK)');
      } else {
        throw error;
      }
    }

    // Step 4: Add comment
    console.log('   [4/4] Agregando comentario a columna...');
    try {
      await prisma.$executeRaw`
        COMMENT ON COLUMN "personas"."genero" IS
        'Género de la persona. Usado para determinar relaciones familiares asimétricas (ej: PADRE->HIJO/HIJA según género del hijo). Opcional para mantener retrocompatibilidad.'
      `;
      console.log('   ✅ Comentario agregado');
    } catch (error) {
      console.log('   ⚠️  Error agregando comentario (no crítico):', error.message.substring(0, 100));
    }

    console.log('\n✅ Migración completada exitosamente\n');

    // Verificar
    console.log('🔍 Verificando migración...');

    const enumCheck = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'Genero'
      ) as enum_exists
    `;

    const columnCheck = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'personas' AND column_name = 'genero'
      ) as column_exists
    `;

    const indexCheck = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'personas' AND indexname = 'personas_genero_idx'
      ) as index_exists
    `;

    console.log('   ✓ Enum Genero existe:', enumCheck[0].enum_exists);
    console.log('   ✓ Columna personas.genero existe:', columnCheck[0].column_exists);
    console.log('   ✓ Índice personas_genero_idx existe:', indexCheck[0].index_exists);

    if (enumCheck[0].enum_exists && columnCheck[0].column_exists) {
      console.log('\n✅ MIGRACIÓN VERIFICADA EXITOSAMENTE\n');

      // Mostrar estadísticas
      const stats = await prisma.$queryRaw`
        SELECT
          COUNT(*) as total_personas,
          COUNT(genero) as personas_con_genero,
          COUNT(*) - COUNT(genero) as personas_sin_genero
        FROM personas
      `;

      console.log('📊 Estadísticas:');
      console.log('   Total personas:', stats[0].total_personas);
      console.log('   Con género:', stats[0].personas_con_genero);
      console.log('   Sin género:', stats[0].personas_sin_genero);
      console.log('');
    } else {
      throw new Error('Migración no se aplicó correctamente');
    }

  } catch (error) {
    console.error('\n❌ Error aplicando migración:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
