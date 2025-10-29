import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Poblando tipos de persona...\n');

  console.log('👥 Tipos de Persona:');

  // 1. NO_SOCIO (predeterminado) - Orden 1 para que sea el primero
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
      descripcion: 'Miembro activo de la asociación con todos los derechos',
      orden: 2,
      activo: true,
      requiresCategoria: true,  // Los socios REQUIEREN categoría
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
      requiresEspecialidad: true,  // Los docentes REQUIEREN especialidad
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
      requiresCuit: true  // Los proveedores REQUIEREN CUIT
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
