import { PrismaClient, TipoActividad, DiaSemana } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de Actividades y Aulas...\n');

  // Limpiar datos
  console.log('🧹 Limpiando...');
  await prisma.reserva_aulas.deleteMany();
  await prisma.horarios_actividades.deleteMany();
  await prisma.participacion_actividades.deleteMany();
  await prisma.actividades.deleteMany();
  await prisma.aula.deleteMany();
  console.log('  ✓ Limpiado\n');

  // Aulas
  console.log('🏫 Creando Aulas...');
  const aulas = await prisma.aula.createMany({
    data: [
      {
        nombre: 'Aula Principal',
        capacidad: 40,
        ubicacion: 'Planta Baja',
        equipamiento: 'Piano de cola, sistema de sonido, pizarra musical, atriles (30)'
      },
      {
        nombre: 'Aula de Instrumentos',
        capacidad: 15,
        ubicacion: 'Primer Piso',
        equipamiento: 'Piano vertical, teclados (5), guitarras (6), amplificadores (3)'
      },
      {
        nombre: 'Sala de Ensayos',
        capacidad: 25,
        ubicacion: 'Sótano',
        equipamiento: 'Batería, micrófonos (8), mesa de mezclas, monitores'
      },
      {
        nombre: 'Estudio de Canto',
        capacidad: 8,
        ubicacion: 'Primer Piso',
        equipamiento: 'Piano, espejo, micrófono, aislación acústica'
      }
    ]
  });
  console.log(`  ✓ ${aulas.count} aulas creadas\n`);

  // Actividades
  console.log('🎵 Creando Actividades...');

  const coroAdultos = await prisma.actividades.create({
    data: {
      nombre: 'Coro de Adultos',
      tipo: TipoActividad.CORO,
      descripcion: 'Coro principal para adultos',
      precio: 0,
      duracion: 120,
      capacidadMaxima: 40
    }
  });

  const coroJuvenil = await prisma.actividades.create({
    data: {
      nombre: 'Coro Juvenil',
      tipo: TipoActividad.CORO,
      descripcion: 'Coro para jóvenes de 13 a 17 años',
      precio: 0,
      duracion: 90,
      capacidadMaxima: 30
    }
  });

  const tecnicaVocal = await prisma.actividades.create({
    data: {
      nombre: 'Técnica Vocal - Inicial',
      tipo: TipoActividad.CLASE_CANTO,
      descripcion: 'Técnica vocal para principiantes',
      precio: 9000,
      duracion: 60,
      capacidadMaxima: 10
    }
  });

  const cantoLirico = await prisma.actividades.create({
    data: {
      nombre: 'Canto Lírico - Avanzado',
      tipo: TipoActividad.CLASE_CANTO,
      descripcion: 'Canto lírico nivel avanzado',
      precio: 12000,
      duracion: 60,
      capacidadMaxima: 6
    }
  });

  const piano = await prisma.actividades.create({
    data: {
      nombre: 'Piano - Inicial',
      tipo: TipoActividad.CLASE_INSTRUMENTO,
      descripcion: 'Piano para principiantes',
      precio: 8500,
      duracion: 60,
      capacidadMaxima: 8
    }
  });

  const guitarra = await prisma.actividades.create({
    data: {
      nombre: 'Guitarra Clásica - Intermedio',
      tipo: TipoActividad.CLASE_INSTRUMENTO,
      descripcion: 'Guitarra clásica nivel intermedio',
      precio: 7500,
      duracion: 60,
      capacidadMaxima: 6
    }
  });

  const violin = await prisma.actividades.create({
    data: {
      nombre: 'Violín Infantil',
      tipo: TipoActividad.CLASE_INSTRUMENTO,
      descripcion: 'Violín para niños',
      precio: 8000,
      duracion: 45,
      capacidadMaxima: 8
    }
  });

  console.log(`  ✓ ${await prisma.actividades.count()} actividades creadas\n`);

  // Horarios
  console.log('📅 Creando Horarios...');

  await prisma.horarios_actividades.createMany({
    data: [
      // Coro Adultos: MA y JU 19-21
      { actividadId: coroAdultos.id, diaSemana: DiaSemana.MARTES, horaInicio: '19:00', horaFin: '21:00' },
      { actividadId: coroAdultos.id, diaSemana: DiaSemana.JUEVES, horaInicio: '19:00', horaFin: '21:00' },
      // Coro Juvenil: SA 15-16:30
      { actividadId: coroJuvenil.id, diaSemana: DiaSemana.SABADO, horaInicio: '15:00', horaFin: '16:30' },
      // Técnica Vocal: LU y MI 18-19
      { actividadId: tecnicaVocal.id, diaSemana: DiaSemana.LUNES, horaInicio: '18:00', horaFin: '19:00' },
      { actividadId: tecnicaVocal.id, diaSemana: DiaSemana.MIERCOLES, horaInicio: '18:00', horaFin: '19:00' },
      // Canto Lírico: VI 17-18
      { actividadId: cantoLirico.id, diaSemana: DiaSemana.VIERNES, horaInicio: '17:00', horaFin: '18:00' },
      // Piano: LU y MI 16-17
      { actividadId: piano.id, diaSemana: DiaSemana.LUNES, horaInicio: '16:00', horaFin: '17:00' },
      { actividadId: piano.id, diaSemana: DiaSemana.MIERCOLES, horaInicio: '16:00', horaFin: '17:00' },
      // Guitarra: MA y JU 17-18
      { actividadId: guitarra.id, diaSemana: DiaSemana.MARTES, horaInicio: '17:00', horaFin: '18:00' },
      { actividadId: guitarra.id, diaSemana: DiaSemana.JUEVES, horaInicio: '17:00', horaFin: '18:00' },
      // Violín: SA 10-10:45
      { actividadId: violin.id, diaSemana: DiaSemana.SABADO, horaInicio: '10:00', horaFin: '10:45' }
    ]
  });

  console.log(`  ✓ ${await prisma.horarios_actividades.count()} horarios creados\n`);

  // Resumen
  console.log('✅ Seed completado!\n');
  console.log('📊 RESUMEN:');
  console.log(`  - ${await prisma.aula.count()} aulas`);
  console.log(`  - ${await prisma.actividades.count()} actividades`);
  console.log(`  - ${await prisma.horarios_actividades.count()} horarios`);

  const porTipo = await prisma.actividades.groupBy({
    by: ['tipo'],
    _count: true
  });

  console.log('\n  Por tipo:');
  porTipo.forEach(g => console.log(`    - ${g.tipo}: ${g._count}`));
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
