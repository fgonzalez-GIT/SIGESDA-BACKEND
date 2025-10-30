import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Poblando categorías de socios...\n');

  const categorias = [
    {
      codigo: 'ACTIVO',
      nombre: 'Socio Activo',
      descripcion: 'Socio activo con todos los beneficios',
      montoCuota: 25000,
      descuento: 0,
      orden: 1
    },
    {
      codigo: 'ESTUDIANTE',
      nombre: 'Estudiante',
      descripcion: 'Categoría para estudiantes con descuento',
      montoCuota: 15000,
      descuento: 40,
      orden: 2
    },
    {
      codigo: 'FAMILIAR',
      nombre: 'Familiar',
      descripcion: 'Familiar de socio activo',
      montoCuota: 20000,
      descuento: 20,
      orden: 3
    },
    {
      codigo: 'HONOR',
      nombre: 'Socio Honorario',
      descripcion: 'Socio honorario sin cargo de cuota',
      montoCuota: 0,
      descuento: 100,
      orden: 4
    }
  ];

  console.log('📋 Categorías de Socios:');
  for (const categoria of categorias) {
    await prisma.categoriaSocio.create({
      data: categoria
    });
    console.log(`  ✓ ${categoria.nombre} (${categoria.codigo})`);
  }

  console.log('\n✅ Categorías de socios pobladas exitosamente!\n');
  console.log('📊 Resumen:');
  console.log(`  - ${categorias.length} categorías creadas`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
