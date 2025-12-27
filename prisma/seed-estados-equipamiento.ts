import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Estados de equipamiento predefinidos (tabla catálogo)
 * Define el estado operativo/disponibilidad del equipamiento
 */
const estadosEquipamientoDefault = [
  {
    codigo: 'DISPONIBLE',
    nombre: 'Disponible',
    descripcion: 'Equipamiento disponible para uso inmediato',
    activo: true,
    orden: 1
  },
  {
    codigo: 'EN_USO',
    nombre: 'En Uso',
    descripcion: 'Equipamiento actualmente asignado o en uso',
    activo: true,
    orden: 2
  },
  {
    codigo: 'RESERVADO',
    nombre: 'Reservado',
    descripcion: 'Equipamiento reservado para evento o actividad específica',
    activo: true,
    orden: 3
  },
  {
    codigo: 'MANTENIMIENTO',
    nombre: 'En Mantenimiento',
    descripcion: 'Equipamiento en reparación o mantenimiento preventivo',
    activo: true,
    orden: 4
  },
  {
    codigo: 'REPARACION',
    nombre: 'En Reparación',
    descripcion: 'Equipamiento averiado, en proceso de reparación',
    activo: true,
    orden: 5
  },
  {
    codigo: 'BAJA_TEMPORAL',
    nombre: 'Baja Temporal',
    descripcion: 'Equipamiento fuera de servicio temporalmente (obsolescencia, seguridad)',
    activo: true,
    orden: 6
  },
  {
    codigo: 'BAJA',
    nombre: 'Dado de Baja',
    descripcion: 'Equipamiento fuera de servicio permanente',
    activo: true,
    orden: 7
  },
  {
    codigo: 'EXTRAVIADO',
    nombre: 'Extraviado',
    descripcion: 'Equipamiento reportado como extraviado o perdido',
    activo: true,
    orden: 8
  }
];

/**
 * Seed para estados de equipamiento
 */
export async function seedEstadosEquipamiento() {
  console.log('Seeding estados_equipamiento...');

  for (const estado of estadosEquipamientoDefault) {
    await prisma.estadoEquipamiento.upsert({
      where: { codigo: estado.codigo },
      update: {}, // No actualiza si ya existe
      create: estado
    });
  }

  const count = await prisma.estadoEquipamiento.count();
  console.log(`  ✓ ${count} estados de equipamiento creados/verificados`);
}

/**
 * Ejecución standalone del seed (para testing)
 */
if (require.main === module) {
  seedEstadosEquipamiento()
    .catch((e) => {
      console.error('Error seeding estados_equipamiento:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
