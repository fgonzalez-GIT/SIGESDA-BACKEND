import { PrismaClient, TipoActividad, DiaSemana } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed completo de Actividades y Aulas...\n');

  // ============================================================================
  // 1. LIMPIAR DATOS OPERACIONALES
  // ============================================================================
  console.log('🧹 Limpiando datos operacionales...');
  await prisma.reserva_aulas.deleteMany();
  await prisma.horarios_actividades.deleteMany();
  await prisma.participacion_actividades.deleteMany();
  await prisma.actividades.deleteMany();
  await prisma.aula.deleteMany();
  console.log('  ✓ Datos limpiados\n');

  // ============================================================================
  // 2. AULAS
  // ============================================================================
  console.log('🏫 Creando Aulas...\n');

  await prisma.aula.create({
    data: {
      nombre: 'Aula Principal',
      capacidad: 40,
      ubicacion: 'Planta Baja',
      equipamiento: 'Piano de cola, sistema de sonido profesional, pizarra musical, atriles (30), sillas (40)',
      activa: true
    }
  });
  console.log('  ✓ Aula Principal - Capacidad: 40');

  await prisma.aula.create({
    data: {
      nombre: 'Aula de Instrumentos',
      capacidad: 15,
      ubicacion: 'Primer Piso - Ala Norte',
      equipamiento: 'Piano vertical, teclados digitales (5), guitarras acústicas (6), amplificadores (3), atriles',
      activa: true
    }
  });
  console.log('  ✓ Aula de Instrumentos - Capacidad: 15');

  await prisma.aula.create({
    data: {
      nombre: 'Sala de Ensayos',
      capacidad: 25,
      ubicacion: 'Sótano',
      equipamiento: 'Batería completa, micrófonos (8), mesa de mezclas, monitores, teclado, bajo, guitarras',
      activa: true
    }
  });
  console.log('  ✓ Sala de Ensayos - Capacidad: 25');

  await prisma.aula.create({
    data: {
      nombre: 'Aula de Teoría Musical',
      capacidad: 20,
      ubicacion: 'Primer Piso - Ala Sur',
      equipamiento: 'Pizarra musical, proyector, computadora, teclado MIDI, sistema de audio, sillas con brazo',
      activa: true
    }
  });
  console.log('  ✓ Aula de Teoría Musical - Capacidad: 20');

  await prisma.aula.create({
    data: {
      nombre: 'Estudio de Canto',
      capacidad: 8,
      ubicacion: 'Primer Piso - Centro',
      equipamiento: 'Piano vertical, espejo de cuerpo completo, micrófono condensador, sistema de audio, aislación acústica',
      activa: true
    }
  });
  console.log('  ✓ Estudio de Canto - Capacidad: 8\n');

  // ============================================================================
  // 3. ACTIVIDADES CON HORARIOS
  // ============================================================================
  console.log('🎵 Creando Actividades con Horarios...\n');

  // ============================================================================
  // 3.1 COROS
  // ============================================================================
  console.log('  🔹 CORO:');

  await prisma.actividades.create({
    data: {
      nombre: 'Coro de Adultos',
      tipo: TipoActividad.CORO,
      descripcion: 'Coro principal de la asociación para adultos. Repertorio variado: clásico, folklore, tango y música contemporánea.',
      precio: 0,
      duracion: 120,
      capacidadMaxima: 40,
      activa: true,
      horarios_actividades: {
        createMany: {
          data: [
            {
              diaSemana: DiaSemana.MARTES,
              horaInicio: '19:00',
              horaFin: '21:00',
              activo: true,
              updatedAt: new Date()
            },
            {
              diaSemana: DiaSemana.JUEVES,
              horaInicio: '19:00',
              horaFin: '21:00',
              activo: true,
              updatedAt: new Date()
            }
          ]
        }
      }
    }
  });
  console.log('     ✓ Coro de Adultos - MARTES y JUEVES 19:00-21:00');

  await prisma.actividades.create({
    data: {
      nombre: 'Coro Juvenil',
      tipo: TipoActividad.CORO,
      descripcion: 'Coro para jóvenes de 13 a 17 años. Repertorio adaptado a la edad.',
      precio: 0,
      duracion: 90,
      capacidadMaxima: 30,
      activa: true,
      horarios_actividades: {
        create: {
          diaSemana: DiaSemana.SABADO,
          horaInicio: '15:00',
          horaFin: '16:30',
          activo: true
        }
      }
    }
  });
  console.log('     ✓ Coro Juvenil - SABADO 15:00-16:30');

  await prisma.actividades.create({
    data: {
      nombre: 'Coro Infantil',
      tipo: TipoActividad.CORO,
      descripcion: 'Coro para niños de 6 a 12 años. Canciones infantiles y folklore.',
      precio: 0,
      duracion: 60,
      capacidadMaxima: 25,
      activa: true,
      horarios_actividades: {
        create: {
          diaSemana: DiaSemana.SABADO,
          horaInicio: '14:00',
          horaFin: '15:00',
          activo: true
        }
      }
    }
  });
  console.log('     ✓ Coro Infantil - SABADO 14:00-15:00\n');

  // ============================================================================
  // 3.2 CLASES DE CANTO
  // ============================================================================
  console.log('  🔹 CLASE_CANTO:');

  await prisma.actividades.create({
    data: {
      nombre: 'Técnica Vocal - Nivel Inicial',
      tipo: TipoActividad.CLASE_CANTO,
      descripcion: 'Clases grupales de técnica vocal para principiantes. Respiración, emisión, resonancia y ejercicios de vocalización.',
      precio: 9000,
      duracion: 60,
      capacidadMaxima: 10,
      activa: true,
      horarios_actividades: {
        createMany: {
          data: [
            {
              diaSemana: DiaSemana.LUNES,
              horaInicio: '18:00',
              horaFin: '19:00',
              activo: true
            },
            {
              diaSemana: DiaSemana.MIERCOLES,
              horaInicio: '18:00',
              horaFin: '19:00',
              activo: true
            }
          ]
        }
      }
    }
  });
  console.log('     ✓ Técnica Vocal - Nivel Inicial - LUNES y MIERCOLES 18:00-19:00');

  await prisma.actividades.create({
    data: {
      nombre: 'Canto Lírico - Avanzado',
      tipo: TipoActividad.CLASE_CANTO,
      descripcion: 'Clases individuales o grupales (máx 6) de canto lírico para nivel avanzado.',
      precio: 12000,
      duracion: 60,
      capacidadMaxima: 6,
      activa: true,
      horarios_actividades: {
        create: {
          diaSemana: DiaSemana.VIERNES,
          horaInicio: '17:00',
          horaFin: '18:00',
          activo: true
        }
      }
    }
  });
  console.log('     ✓ Canto Lírico - Avanzado - VIERNES 17:00-18:00');

  await prisma.actividades.create({
    data: {
      nombre: 'Técnica Vocal - Intermedio',
      tipo: TipoActividad.CLASE_CANTO,
      descripcion: 'Clases de técnica vocal nivel intermedio. Ampliación de registro y repertorio.',
      precio: 10000,
      duracion: 60,
      capacidadMaxima: 8,
      activa: true,
      horarios_actividades: {
        createMany: {
          data: [
            {
              diaSemana: DiaSemana.MARTES,
              horaInicio: '18:00',
              horaFin: '19:00',
              activo: true
            },
            {
              diaSemana: DiaSemana.JUEVES,
              horaInicio: '18:00',
              horaFin: '19:00',
              activo: true
            }
          ]
        }
      }
    }
  });
  console.log('     ✓ Técnica Vocal - Intermedio - MARTES y JUEVES 18:00-19:00\n');

  // ============================================================================
  // 3.3 CLASES DE INSTRUMENTOS
  // ============================================================================
  console.log('  🔹 CLASE_INSTRUMENTO:');

  await prisma.actividades.create({
    data: {
      nombre: 'Piano - Nivel Inicial',
      tipo: TipoActividad.CLASE_INSTRUMENTO,
      descripcion: 'Clases grupales de piano para principiantes. Técnica básica, lectura musical y repertorio elemental.',
      precio: 8500,
      duracion: 60,
      capacidadMaxima: 8,
      activa: true,
      horarios_actividades: {
        createMany: {
          data: [
            {
              diaSemana: DiaSemana.LUNES,
              horaInicio: '16:00',
              horaFin: '17:00',
              activo: true
            },
            {
              diaSemana: DiaSemana.MIERCOLES,
              horaInicio: '16:00',
              horaFin: '17:00',
              activo: true
            }
          ]
        }
      }
    }
  });
  console.log('     ✓ Piano - Nivel Inicial - LUNES y MIERCOLES 16:00-17:00');

  await prisma.actividades.create({
    data: {
      nombre: 'Guitarra Clásica - Intermedio',
      tipo: TipoActividad.CLASE_INSTRUMENTO,
      descripcion: 'Clases de guitarra clásica nivel intermedio. Repertorio barroco, romántico y contemporáneo.',
      precio: 7500,
      duracion: 60,
      capacidadMaxima: 6,
      activa: true,
      horarios_actividades: {
        createMany: {
          data: [
            {
              diaSemana: DiaSemana.MARTES,
              horaInicio: '17:00',
              horaFin: '18:00',
              activo: true
            },
            {
              diaSemana: DiaSemana.JUEVES,
              horaInicio: '17:00',
              horaFin: '18:00',
              activo: true
            }
          ]
        }
      }
    }
  });
  console.log('     ✓ Guitarra Clásica - Intermedio - MARTES y JUEVES 17:00-18:00');

  await prisma.actividades.create({
    data: {
      nombre: 'Violín Infantil',
      tipo: TipoActividad.CLASE_INSTRUMENTO,
      descripcion: 'Clases de violín para niños de 6 a 12 años. Método Suzuki adaptado.',
      precio: 8000,
      duracion: 45,
      capacidadMaxima: 8,
      activa: true,
      horarios_actividades: {
        create: {
          diaSemana: DiaSemana.SABADO,
          horaInicio: '10:00',
          horaFin: '10:45',
          activo: true
        }
      }
    }
  });
  console.log('     ✓ Violín Infantil - SABADO 10:00-10:45');

  await prisma.actividades.create({
    data: {
      nombre: 'Piano - Nivel Avanzado',
      tipo: TipoActividad.CLASE_INSTRUMENTO,
      descripcion: 'Clases de piano nivel avanzado. Repertorio clásico de alta dificultad.',
      precio: 11000,
      duracion: 90,
      capacidadMaxima: 4,
      activa: true,
      horarios_actividades: {
        create: {
          diaSemana: DiaSemana.VIERNES,
          horaInicio: '18:00',
          horaFin: '19:30',
          activo: true
        }
      }
    }
  });
  console.log('     ✓ Piano - Nivel Avanzado - VIERNES 18:00-19:30');

  await prisma.actividades.create({
    data: {
      nombre: 'Guitarra Eléctrica',
      tipo: TipoActividad.CLASE_INSTRUMENTO,
      descripcion: 'Clases de guitarra eléctrica. Rock, blues, jazz y técnicas modernas.',
      precio: 8000,
      duracion: 60,
      capacidadMaxima: 6,
      activa: true,
      horarios_actividades: {
        create: {
          diaSemana: DiaSemana.SABADO,
          horaInicio: '16:00',
          horaFin: '17:00',
          activo: true
        }
      }
    }
  });
  console.log('     ✓ Guitarra Eléctrica - SABADO 16:00-17:00\n');

  // ============================================================================
  // RESUMEN FINAL
  // ============================================================================
  console.log('✅ Seed de Actividades y Aulas completado exitosamente!\n');
  console.log('📊 RESUMEN:\n');

  console.log('  🏫 Aulas creadas:');
  const aulas = await prisma.aula.findMany({ orderBy: { nombre: 'asc' } });
  aulas.forEach(aula => {
    console.log(`     - ${aula.nombre} (${aula.capacidad} personas) - ${aula.ubicacion}`);
  });

  console.log('');
  console.log('  🎵 Actividades por tipo:');

  const actividadesPorTipo = await prisma.actividades.groupBy({
    by: ['tipo'],
    _count: true
  });

  actividadesPorTipo.forEach(grupo => {
    console.log(`     - ${grupo.tipo}: ${grupo._count} actividades`);
  });

  console.log('');
  console.log('  📅 Estadísticas generales:');
  console.log(`     - ${await prisma.actividades.count()} actividades totales`);
  console.log(`     - ${await prisma.horarios_actividades.count()} horarios configurados`);
  console.log(`     - ${await prisma.aula.count()} aulas disponibles`);

  console.log('');
  console.log('💡 Datos listos para usar con la API de Actividades');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
