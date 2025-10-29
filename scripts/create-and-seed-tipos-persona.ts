import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Creando tabla tipos_persona...\n');

  // Crear la tabla usando SQL directo
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS tipos_persona (
      id SERIAL PRIMARY KEY,
      codigo VARCHAR(50) UNIQUE NOT NULL,
      nombre VARCHAR(100) NOT NULL,
      descripcion TEXT,
      activo BOOLEAN DEFAULT TRUE NOT NULL,
      orden INTEGER DEFAULT 0 NOT NULL,
      requires_categoria BOOLEAN DEFAULT FALSE NOT NULL,
      requires_especialidad BOOLEAN DEFAULT FALSE NOT NULL,
      requires_cuit BOOLEAN DEFAULT FALSE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS idx_tipos_persona_codigo ON tipos_persona(codigo);
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS idx_tipos_persona_activo ON tipos_persona(activo);
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS idx_tipos_persona_orden ON tipos_persona(orden);
  `);

  // Crear trigger para updated_at
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION update_tipos_persona_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  await prisma.$executeRawUnsafe(`
    DROP TRIGGER IF EXISTS update_tipos_persona_updated_at ON tipos_persona;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TRIGGER update_tipos_persona_updated_at
    BEFORE UPDATE ON tipos_persona
    FOR EACH ROW EXECUTE FUNCTION update_tipos_persona_updated_at();
  `);

  console.log('✅ Tabla tipos_persona creada exitosamente!\n');

  console.log('🌱 Poblando tipos de persona...\n');
  console.log('👥 Tipos de Persona:');

  // 1. NO_SOCIO (predeterminado)
  await prisma.tipos_persona.upsert({
    where: { codigo: 'NO_SOCIO' },
    update: {},
    create: {
      codigo: 'NO_SOCIO',
      nombre: 'No Socio',
      descripcion: 'Persona sin membresía de socio (valor predeterminado)',
      orden: 1,
      activo: true,
      requiresCategoria: false,
      requiresEspecialidad: false,
      requiresCuit: false
    }
  });
  console.log('  ✓ NO_SOCIO (predeterminado)');

  // 2. SOCIO
  await prisma.tipos_persona.upsert({
    where: { codigo: 'SOCIO' },
    update: {},
    create: {
      codigo: 'SOCIO',
      nombre: 'Socio',
      descripcion: 'Miembro activo de la asociación',
      orden: 2,
      activo: true,
      requiresCategoria: true,
      requiresEspecialidad: false,
      requiresCuit: false
    }
  });
  console.log('  ✓ SOCIO');

  // 3. DOCENTE
  await prisma.tipos_persona.upsert({
    where: { codigo: 'DOCENTE' },
    update: {},
    create: {
      codigo: 'DOCENTE',
      nombre: 'Docente',
      descripcion: 'Profesor o instructor de actividades',
      orden: 3,
      activo: true,
      requiresCategoria: false,
      requiresEspecialidad: true,
      requiresCuit: false
    }
  });
  console.log('  ✓ DOCENTE');

  // 4. PROVEEDOR
  await prisma.tipos_persona.upsert({
    where: { codigo: 'PROVEEDOR' },
    update: {},
    create: {
      codigo: 'PROVEEDOR',
      nombre: 'Proveedor',
      descripcion: 'Proveedor de bienes o servicios',
      orden: 4,
      activo: true,
      requiresCategoria: false,
      requiresEspecialidad: false,
      requiresCuit: true
    }
  });
  console.log('  ✓ PROVEEDOR\n');

  console.log('✅ Tipos de persona poblados exitosamente!\n');
  console.log('📊 Resumen:');
  console.log(`  - ${await prisma.tipos_persona.count()} tipos de persona`);
  console.log('\n💡 Nota: "NO_SOCIO" está configurado como el tipo predeterminado (orden 1)');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
