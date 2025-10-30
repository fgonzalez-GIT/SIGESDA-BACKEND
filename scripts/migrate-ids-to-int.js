#!/usr/bin/env node

/**
 * Script para migrar todos los IDs de String a Int en el schema de Prisma
 *
 * Este script:
 * 1. Lee el schema actual
 * 2. Identifica todas las tablas con ID String
 * 3. Convierte IDs a Int @default(autoincrement())
 * 4. Actualiza todas las Foreign Keys relacionadas
 * 5. Guarda el schema actualizado
 */

const fs = require('fs');
const path = require('path');

const SCHEMA_PATH = path.join(__dirname, '../prisma/schema.prisma');

// Tablas que NO deben cambiar (ya tienen Int)
const SKIP_MODELS = [
  'tipos_actividades',
  'categorias_actividades',
  'estados_actividades',
  'dias_semana',
  'roles_docentes',
  'tipos_persona'
];

// Mapeo de modelos y sus campos FK que apuntan a otros modelos
const FK_MAPPINGS = {
  'Persona': ['categoriaId'],
  'ComisionDirectiva': ['socioId'],
  'Familiar': ['socioId', 'familiarId'],
  'Recibo': ['emisorId', 'receptorId'],
  'participacion_actividades': ['personaId', 'actividadId'],
  'participaciones_secciones': ['personaId', 'seccionId'],
  'reserva_aulas': ['docenteId', 'aulaId', 'actividadId'],
  'reservas_aulas_secciones': ['seccionId', 'aulaId'],
  'horarios_actividades': ['actividadId'],
  'horarios_secciones': ['seccionId'],
  'Cuota': ['reciboId', 'socioId', 'categoriaId'],
  'MedioPago': ['reciboId'],
  'secciones_actividades': ['actividadId', 'docenteId'],
  'actividades': ['docenteId']
};

function migrateSchema() {
  console.log('🔄 Iniciando migración de IDs String → Int...\n');

  // Leer schema actual
  let schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  console.log('✅ Schema leído correctamente');

  // Contador de cambios
  let changes = {
    primaryKeys: 0,
    foreignKeys: 0
  };

  // Patrón para encontrar modelos
  const modelRegex = /model\s+(\w+)\s*\{([^}]+)\}/g;

  schema = schema.replace(modelRegex, (match, modelName, modelBody) => {
    // Saltar modelos que ya tienen Int
    if (SKIP_MODELS.includes(modelName)) {
      return match;
    }

    console.log(`\n📋 Procesando modelo: ${modelName}`);

    // Cambiar ID primario de String a Int
    const idPattern = /(\s+id\s+)String(\s+@id)/g;
    if (idPattern.test(modelBody)) {
      modelBody = modelBody.replace(idPattern, '$1Int$2 @default(autoincrement())');
      changes.primaryKeys++;
      console.log(`  ✓ ID primario cambiado a Int autoincremental`);
    }

    // Cambiar Foreign Keys relacionadas
    const fksToUpdate = FK_MAPPINGS[modelName] || [];
    fksToUpdate.forEach(fkField => {
      // Patrón para FK: nombre del campo seguido de String
      const fkPattern = new RegExp(`(\\s+${fkField}\\s+)String(\\??)(\\s)`, 'g');
      if (fkPattern.test(modelBody)) {
        modelBody = modelBody.replace(fkPattern, `$1Int$2$3`);
        changes.foreignKeys++;
        console.log(`  ✓ FK ${fkField} cambiada a Int`);
      }
    });

    return `model ${modelName} {${modelBody}}`;
  });

  // Guardar schema actualizado
  fs.writeFileSync(SCHEMA_PATH, schema, 'utf-8');

  console.log('\n' + '='.repeat(60));
  console.log('✅ Migración completada!');
  console.log('='.repeat(60));
  console.log(`📊 Resumen de cambios:`);
  console.log(`   - PKs migradas: ${changes.primaryKeys}`);
  console.log(`   - FKs actualizadas: ${changes.foreignKeys}`);
  console.log(`   - Total de cambios: ${changes.primaryKeys + changes.foreignKeys}`);
  console.log('\n💾 Schema actualizado guardado en:', SCHEMA_PATH);
  console.log('📋 Backup disponible en: prisma/schema.prisma.backup-*');
  console.log('\n⚠️  Próximos pasos:');
  console.log('   1. Revisar el schema actualizado');
  console.log('   2. Ejecutar: npx prisma format');
  console.log('   3. Verificar que no haya errores: npx prisma validate');
  console.log('   4. Crear migración SQL manual');
}

// Ejecutar migración
try {
  migrateSchema();
  process.exit(0);
} catch (error) {
  console.error('\n❌ Error durante la migración:', error.message);
  console.error('\n📋 Puedes restaurar el backup con:');
  console.error('   cp prisma/schema.prisma.backup-* prisma/schema.prisma');
  process.exit(1);
}
