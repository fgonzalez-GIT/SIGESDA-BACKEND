/**
 * Script para aplicar la migración de género directamente usando Prisma Client
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('📦 Aplicando migración de género...\n');

  try {
    // Leer el archivo de migración SQL
    const migrationPath = path.join(__dirname, '..', 'prisma', 'migrations', '20251209_add_genero_to_persona', 'migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Archivo de migración cargado:');
    console.log('   Ruta:', migrationPath);
    console.log('   Tamaño:', migrationSQL.length, 'caracteres\n');

    // Dividir el SQL en statements individuales (por punto y coma)
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`🔧 Ejecutando ${statements.length} statements SQL...\n`);

    let successCount = 0;
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Saltar comentarios y statements vacíos
      if (statement.startsWith('--') || statement.length === 0) {
        continue;
      }

      try {
        console.log(`   [${i + 1}/${statements.length}] Ejecutando statement...`);
        await prisma.$executeRawUnsafe(statement + ';');
        successCount++;
      } catch (error) {
        // Si el error es porque el enum o columna ya existe, es seguro ignorarlo
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log(`   ⚠️  Ya existe (ignorado): ${error.message.substring(0, 100)}...`);
          successCount++;
        } else {
          console.error(`   ❌ Error: ${error.message}`);
          throw error;
        }
      }
    }

    console.log(`\n✅ Migración completada: ${successCount}/${statements.length} statements ejecutados con éxito\n`);

    // Verificar que el enum y la columna existen
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

    console.log('   Enum Genero existe:', enumCheck[0].enum_exists);
    console.log('   Columna personas.genero existe:', columnCheck[0].column_exists);

    if (enumCheck[0].enum_exists && columnCheck[0].column_exists) {
      console.log('\n✅ MIGRACIÓN VERIFICADA EXITOSAMENTE\n');
    } else {
      throw new Error('Migración no se aplicó correctamente');
    }

  } catch (error) {
    console.error('\n❌ Error aplicando migración:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
