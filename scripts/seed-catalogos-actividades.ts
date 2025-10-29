import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Poblando catálogos de actividades...\n');

  // 1. Tipos de Actividades (las 3 predefinidas + extras)
  console.log('📚 Tipos de Actividades:');

  await prisma.tipos_actividades.upsert({
    where: { codigo: 'CORO' },
    update: {},
    create: {
      codigo: 'CORO',
      nombre: 'Coro',
      descripcion: 'Actividades corales',
      orden: 1,
      activo: true
    }
  });
  console.log('  ✓ CORO');

  await prisma.tipos_actividades.upsert({
    where: { codigo: 'CLASE_CANTO' },
    update: {},
    create: {
      codigo: 'CLASE_CANTO',
      nombre: 'Clase de Canto',
      descripcion: 'Clases de técnica vocal y canto',
      orden: 2,
      activo: true
    }
  });
  console.log('  ✓ CLASE_CANTO');

  await prisma.tipos_actividades.upsert({
    where: { codigo: 'CLASE_INSTRUMENTO' },
    update: {},
    create: {
      codigo: 'CLASE_INSTRUMENTO',
      nombre: 'Clase de Instrumento',
      descripcion: 'Clases de instrumentos musicales',
      orden: 3,
      activo: true
    }
  });
  console.log('  ✓ CLASE_INSTRUMENTO');

  await prisma.tipos_actividades.upsert({
    where: { codigo: 'TALLER' },
    update: {},
    create: {
      codigo: 'TALLER',
      nombre: 'Taller',
      descripcion: 'Talleres musicales',
      orden: 4,
      activo: true
    }
  });
  console.log('  ✓ TALLER');

  await prisma.tipos_actividades.upsert({
    where: { codigo: 'EVENTO' },
    update: {},
    create: {
      codigo: 'EVENTO',
      nombre: 'Evento',
      descripcion: 'Eventos y presentaciones',
      orden: 5,
      activo: true
    }
  });
  console.log('  ✓ EVENTO\n');

  // 2. Categorías de Actividades
  console.log('🎯 Categorías de Actividades:');

  await prisma.categorias_actividades.upsert({
    where: { codigo: 'INFANTIL' },
    update: {},
    create: {
      codigo: 'INFANTIL',
      nombre: 'Infantil',
      descripcion: 'Para niños de 6 a 12 años',
      orden: 1,
      activo: true
    }
  });
  console.log('  ✓ INFANTIL');

  await prisma.categorias_actividades.upsert({
    where: { codigo: 'JUVENIL' },
    update: {},
    create: {
      codigo: 'JUVENIL',
      nombre: 'Juvenil',
      descripcion: 'Para jóvenes de 13 a 17 años',
      orden: 2,
      activo: true
    }
  });
  console.log('  ✓ JUVENIL');

  await prisma.categorias_actividades.upsert({
    where: { codigo: 'ADULTO' },
    update: {},
    create: {
      codigo: 'ADULTO',
      nombre: 'Adultos',
      descripcion: 'Para adultos mayores de 18 años',
      orden: 3,
      activo: true
    }
  });
  console.log('  ✓ ADULTO');

  await prisma.categorias_actividades.upsert({
    where: { codigo: 'SENIOR' },
    update: {},
    create: {
      codigo: 'SENIOR',
      nombre: 'Adultos Mayores',
      descripcion: 'Para adultos mayores de 60 años',
      orden: 4,
      activo: true
    }
  });
  console.log('  ✓ SENIOR');

  await prisma.categorias_actividades.upsert({
    where: { codigo: 'FAMILIAR' },
    update: {},
    create: {
      codigo: 'FAMILIAR',
      nombre: 'Familiar',
      descripcion: 'Actividades para toda la familia',
      orden: 5,
      activo: true
    }
  });
  console.log('  ✓ FAMILIAR');

  await prisma.categorias_actividades.upsert({
    where: { codigo: 'GENERAL' },
    update: {},
    create: {
      codigo: 'GENERAL',
      nombre: 'General',
      descripcion: 'Sin restricción de edad',
      orden: 6,
      activo: true
    }
  });
  console.log('  ✓ GENERAL\n');

  // 3. Estados de Actividades
  console.log('📊 Estados de Actividades:');

  await prisma.estados_actividades.upsert({
    where: { codigo: 'ACTIVA' },
    update: {},
    create: {
      codigo: 'ACTIVA',
      nombre: 'Activa',
      descripcion: 'Actividad en inscripción o en curso',
      orden: 1,
      activo: true
    }
  });
  console.log('  ✓ ACTIVA');

  await prisma.estados_actividades.upsert({
    where: { codigo: 'EN_CURSO' },
    update: {},
    create: {
      codigo: 'EN_CURSO',
      nombre: 'En Curso',
      descripcion: 'Actividad iniciada',
      orden: 2,
      activo: true
    }
  });
  console.log('  ✓ EN_CURSO');

  await prisma.estados_actividades.upsert({
    where: { codigo: 'FINALIZADA' },
    update: {},
    create: {
      codigo: 'FINALIZADA',
      nombre: 'Finalizada',
      descripcion: 'Actividad terminada',
      orden: 3,
      activo: true
    }
  });
  console.log('  ✓ FINALIZADA');

  await prisma.estados_actividades.upsert({
    where: { codigo: 'CANCELADA' },
    update: {},
    create: {
      codigo: 'CANCELADA',
      nombre: 'Cancelada',
      descripcion: 'Actividad cancelada',
      orden: 4,
      activo: true
    }
  });
  console.log('  ✓ CANCELADA');

  await prisma.estados_actividades.upsert({
    where: { codigo: 'SUSPENDIDA' },
    update: {},
    create: {
      codigo: 'SUSPENDIDA',
      nombre: 'Suspendida',
      descripcion: 'Actividad temporalmente suspendida',
      orden: 5,
      activo: true
    }
  });
  console.log('  ✓ SUSPENDIDA\n');

  // 4. Días de la Semana
  console.log('📅 Días de la Semana:');

  const diasSemana = [
    { codigo: 'LUNES', nombre: 'Lunes', orden: 1 },
    { codigo: 'MARTES', nombre: 'Martes', orden: 2 },
    { codigo: 'MIERCOLES', nombre: 'Miércoles', orden: 3 },
    { codigo: 'JUEVES', nombre: 'Jueves', orden: 4 },
    { codigo: 'VIERNES', nombre: 'Viernes', orden: 5 },
    { codigo: 'SABADO', nombre: 'Sábado', orden: 6 },
    { codigo: 'DOMINGO', nombre: 'Domingo', orden: 7 }
  ];

  for (const dia of diasSemana) {
    await prisma.dias_semana.upsert({
      where: { codigo: dia.codigo },
      update: {},
      create: dia
    });
    console.log(`  ✓ ${dia.nombre}`);
  }
  console.log('');

  // 5. Roles de Docentes
  console.log('👨‍🏫 Roles de Docentes:');

  await prisma.roles_docentes.upsert({
    where: { codigo: 'TITULAR' },
    update: {},
    create: {
      codigo: 'TITULAR',
      nombre: 'Titular',
      descripcion: 'Docente titular de la actividad',
      orden: 1,
      activo: true
    }
  });
  console.log('  ✓ TITULAR');

  await prisma.roles_docentes.upsert({
    where: { codigo: 'ASISTENTE' },
    update: {},
    create: {
      codigo: 'ASISTENTE',
      nombre: 'Asistente',
      descripcion: 'Docente asistente',
      orden: 2,
      activo: true
    }
  });
  console.log('  ✓ ASISTENTE');

  await prisma.roles_docentes.upsert({
    where: { codigo: 'SUPLENTE' },
    update: {},
    create: {
      codigo: 'SUPLENTE',
      nombre: 'Suplente',
      descripcion: 'Docente suplente',
      orden: 3,
      activo: true
    }
  });
  console.log('  ✓ SUPLENTE');

  await prisma.roles_docentes.upsert({
    where: { codigo: 'INVITADO' },
    update: {},
    create: {
      codigo: 'INVITADO',
      nombre: 'Invitado',
      descripcion: 'Docente invitado especial',
      orden: 4,
      activo: true
    }
  });
  console.log('  ✓ INVITADO\n');

  console.log('✅ Catálogos de actividades poblados exitosamente!\n');
  console.log('📊 Resumen:');
  console.log(`  - ${await prisma.tipos_actividades.count()} tipos de actividades`);
  console.log(`  - ${await prisma.categorias_actividades.count()} categorías`);
  console.log(`  - ${await prisma.estados_actividades.count()} estados`);
  console.log(`  - ${await prisma.dias_semana.count()} días de la semana`);
  console.log(`  - ${await prisma.roles_docentes.count()} roles de docentes`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
