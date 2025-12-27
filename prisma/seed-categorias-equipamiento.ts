import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Categorías de equipamiento predefinidas (tabla catálogo)
 * Clasifica equipamientos según su tipo y uso
 */
const categoriasEquipamientoDefault = [
  {
    codigo: 'INST',
    nombre: 'Instrumentos',
    descripcion: 'Instrumentos musicales (pianos, guitarras, percusión, vientos, cuerdas, etc.)',
    activo: true,
    orden: 1
  },
  {
    codigo: 'MOBI',
    nombre: 'Mobiliario',
    descripcion: 'Muebles y mobiliario (sillas, mesas, atriles, estantes, archivadores)',
    activo: true,
    orden: 2
  },
  {
    codigo: 'AUDI',
    nombre: 'Audio',
    descripcion: 'Equipamiento de sonido (amplificadores, micrófonos, altavoces, mezcladores)',
    activo: true,
    orden: 3
  },
  {
    codigo: 'VISU',
    nombre: 'Visual',
    descripcion: 'Equipamiento visual (proyectores, pantallas, pizarras, monitores)',
    activo: true,
    orden: 4
  },
  {
    codigo: 'ACUS',
    nombre: 'Acústica',
    descripcion: 'Material acústico (cabinas de ensayo, paneles acústicos, aislamiento)',
    activo: true,
    orden: 5
  },
  {
    codigo: 'INFO',
    nombre: 'Informática',
    descripcion: 'Equipamiento informático (computadoras, tablets, software, impresoras)',
    activo: true,
    orden: 6
  },
  {
    codigo: 'BIBL',
    nombre: 'Biblioteca',
    descripcion: 'Material bibliográfico (partituras, libros, métodos, material didáctico)',
    activo: true,
    orden: 7
  }
];

/**
 * Seed para categorías de equipamiento
 */
export async function seedCategoriasEquipamiento() {
  console.log('Seeding categorias_equipamiento...');

  for (const categoria of categoriasEquipamientoDefault) {
    await prisma.categoriaEquipamiento.upsert({
      where: { codigo: categoria.codigo },
      update: {}, // No actualiza si ya existe
      create: categoria
    });
  }

  const count = await prisma.categoriaEquipamiento.count();
  console.log(`  ✓ ${count} categorías de equipamiento creadas/verificadas`);
}

/**
 * Ejecución standalone del seed (para testing)
 */
if (require.main === module) {
  seedCategoriasEquipamiento()
    .catch((e) => {
      console.error('Error seeding categorias_equipamiento:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
