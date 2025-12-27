import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed de Actividades (POST-MIGRACIÓN)
 *
 * Este seed crea actividades de ejemplo usando FK a tablas catálogo
 * en vez de ENUMs. Debe ejecutarse DESPUÉS de que los catálogos
 * estén poblados (tipos_actividades, categorias_actividades, etc.)
 */

export async function seedActividades() {
  console.log('🎭 Iniciando seed de actividades (FK-based)...\n');

  try {
    // ========================================================================
    // PASO 1: Obtener IDs de catálogos
    // ========================================================================
    console.log('📋 Obteniendo catálogos...');

    // Tipos de Actividades
    const tipoCoro = await prisma.tipos_actividades.findUnique({
      where: { codigo: 'CORO' }
    });
    const tipoClaseIndividual = await prisma.tipos_actividades.findUnique({
      where: { codigo: 'CLASE_INDIVIDUAL' }
    });
    const tipoClaseGrupal = await prisma.tipos_actividades.findUnique({
      where: { codigo: 'CLASE_GRUPAL' }
    });

    if (!tipoCoro || !tipoClaseIndividual || !tipoClaseGrupal) {
      throw new Error('Tipos de actividades no encontrados. Ejecutar seed principal primero.');
    }

    // Categorías
    const categoriaMusica = await prisma.categorias_actividades.findUnique({
      where: { codigo: 'MUSICA' }
    });

    if (!categoriaMusica) {
      throw new Error('Categoría MUSICA no encontrada. Ejecutar seed principal primero.');
    }

    // Estados
    const estadoActiva = await prisma.estados_actividades.findUnique({
      where: { codigo: 'ACTIVA' }
    });
    const estadoPlanificada = await prisma.estados_actividades.findUnique({
      where: { codigo: 'PLANIFICADA' }
    });

    if (!estadoActiva || !estadoPlanificada) {
      throw new Error('Estados de actividades no encontrados. Ejecutar seed principal primero.');
    }

    // Días de semana
    const diasSemana = await prisma.dias_semana.findMany({
      orderBy: { orden: 'asc' }
    });

    if (diasSemana.length === 0) {
      throw new Error('Días de semana no encontrados. Ejecutar seed principal primero.');
    }

    const lunes = diasSemana.find(d => d.codigo === 'LUNES');
    const martes = diasSemana.find(d => d.codigo === 'MARTES');
    const miercoles = diasSemana.find(d => d.codigo === 'MIERCOLES');
    const jueves = diasSemana.find(d => d.codigo === 'JUEVES');
    const viernes = diasSemana.find(d => d.codigo === 'VIERNES');
    const sabado = diasSemana.find(d => d.codigo === 'SABADO');

    console.log(`   ✅ Catálogos cargados:`);
    console.log(`      - Tipos: ${tipoCoro.nombre}, ${tipoClaseIndividual.nombre}, ${tipoClaseGrupal.nombre}`);
    console.log(`      - Categorías: ${categoriaMusica.nombre}`);
    console.log(`      - Estados: ${estadoActiva.nombre}, ${estadoPlanificada.nombre}`);
    console.log(`      - Días: ${diasSemana.length} cargados\n`);

    // ========================================================================
    // PASO 2: Crear Actividades usando FK IDs
    // ========================================================================
    console.log('🎭 Creando actividades...');

    // Actividad 1: Coro Municipal
    const actividadCoro = await prisma.actividades.create({
      data: {
        codigoActividad: 'ACT-CORO-0001',
        nombre: 'Coro Municipal',
        tipoActividadId: tipoCoro.id,
        categoriaId: categoriaMusica.id,
        estadoId: estadoActiva.id,
        descripcion: 'Coro de voces mixtas para adultos',
        fechaDesde: new Date('2025-01-01'),
        fechaHasta: new Date('2025-12-31'),
        costo: 2000.00,
        capacidadMaxima: 30,
        activa: true
      }
    });
    console.log(`   ✅ ${actividadCoro.codigoActividad} - ${actividadCoro.nombre}`);

    // Actividad 2: Clase de Piano Individual
    const actividadPiano = await prisma.actividades.create({
      data: {
        codigoActividad: 'ACT-CLASE_INDIVIDUAL-0002',
        nombre: 'Clase de Piano Individual',
        tipoActividadId: tipoClaseIndividual.id,
        categoriaId: categoriaMusica.id,
        estadoId: estadoActiva.id,
        descripcion: 'Clases personalizadas de piano nivel inicial a avanzado',
        fechaDesde: new Date('2025-01-15'),
        fechaHasta: new Date('2025-12-31'),
        costo: 3500.00,
        capacidadMaxima: 1,
        activa: true,
        observaciones: 'Requiere tener instrumento propio o acceso a sala de práctica'
      }
    });
    console.log(`   ✅ ${actividadPiano.codigoActividad} - ${actividadPiano.nombre}`);

    // Actividad 3: Clase de Guitarra Grupal
    const actividadGuitarra = await prisma.actividades.create({
      data: {
        codigoActividad: 'ACT-CLASE_GRUPAL-0003',
        nombre: 'Clase de Guitarra Grupal',
        tipoActividadId: tipoClaseGrupal.id,
        categoriaId: categoriaMusica.id,
        estadoId: estadoActiva.id,
        descripcion: 'Clases de guitarra en grupos reducidos (máximo 6 personas)',
        fechaDesde: new Date('2025-02-01'),
        fechaHasta: new Date('2025-11-30'),
        costo: 2500.00,
        capacidadMaxima: 6,
        activa: true
      }
    });
    console.log(`   ✅ ${actividadGuitarra.codigoActividad} - ${actividadGuitarra.nombre}`);

    // Actividad 4: Coro Infantil (Planificada)
    const actividadCoroInfantil = await prisma.actividades.create({
      data: {
        codigoActividad: 'ACT-CORO-0004',
        nombre: 'Coro Infantil',
        tipoActividadId: tipoCoro.id,
        categoriaId: categoriaMusica.id,
        estadoId: estadoPlanificada.id,
        descripcion: 'Coro para niños de 8 a 14 años',
        fechaDesde: new Date('2025-03-01'),
        fechaHasta: new Date('2025-12-31'),
        costo: 1500.00,
        capacidadMaxima: 25,
        activa: true,
        observaciones: 'Inicio previsto para marzo 2025'
      }
    });
    console.log(`   ✅ ${actividadCoroInfantil.codigoActividad} - ${actividadCoroInfantil.nombre}`);

    console.log(`\n   📊 Total actividades creadas: 4\n`);

    // ========================================================================
    // PASO 3: Crear Horarios usando FK IDs
    // ========================================================================
    console.log('🕐 Creando horarios...');

    let horariosCreados = 0;

    // Horarios Coro Municipal: Lunes y Miércoles 18:00-20:00
    if (lunes) {
      await prisma.horarios_actividades.create({
        data: {
          actividadId: actividadCoro.id,
          diaSemanaId: lunes.id,
          horaInicio: new Date('1970-01-01T18:00:00Z'),
          horaFin: new Date('1970-01-01T20:00:00Z'),
          activo: true
        }
      });
      horariosCreados++;
      console.log(`   ✅ Coro Municipal - ${lunes.nombre} 18:00-20:00`);
    }

    if (miercoles) {
      await prisma.horarios_actividades.create({
        data: {
          actividadId: actividadCoro.id,
          diaSemanaId: miercoles.id,
          horaInicio: new Date('1970-01-01T18:00:00Z'),
          horaFin: new Date('1970-01-01T20:00:00Z'),
          activo: true
        }
      });
      horariosCreados++;
      console.log(`   ✅ Coro Municipal - ${miercoles.nombre} 18:00-20:00`);
    }

    // Horarios Piano: Martes y Jueves (slots individuales)
    if (martes) {
      await prisma.horarios_actividades.create({
        data: {
          actividadId: actividadPiano.id,
          diaSemanaId: martes.id,
          horaInicio: new Date('1970-01-01T16:00:00Z'),
          horaFin: new Date('1970-01-01T17:00:00Z'),
          activo: true
        }
      });
      horariosCreados++;
      console.log(`   ✅ Piano Individual - ${martes.nombre} 16:00-17:00`);
    }

    if (jueves) {
      await prisma.horarios_actividades.create({
        data: {
          actividadId: actividadPiano.id,
          diaSemanaId: jueves.id,
          horaInicio: new Date('1970-01-01T16:00:00Z'),
          horaFin: new Date('1970-01-01T17:00:00Z'),
          activo: true
        }
      });
      horariosCreados++;
      console.log(`   ✅ Piano Individual - ${jueves.nombre} 16:00-17:00`);
    }

    // Horarios Guitarra Grupal: Viernes 17:00-18:30
    if (viernes) {
      await prisma.horarios_actividades.create({
        data: {
          actividadId: actividadGuitarra.id,
          diaSemanaId: viernes.id,
          horaInicio: new Date('1970-01-01T17:00:00Z'),
          horaFin: new Date('1970-01-01T18:30:00Z'),
          activo: true
        }
      });
      horariosCreados++;
      console.log(`   ✅ Guitarra Grupal - ${viernes.nombre} 17:00-18:30`);
    }

    // Horarios Coro Infantil: Sábados 10:00-11:30
    if (sabado) {
      await prisma.horarios_actividades.create({
        data: {
          actividadId: actividadCoroInfantil.id,
          diaSemanaId: sabado.id,
          horaInicio: new Date('1970-01-01T10:00:00Z'),
          horaFin: new Date('1970-01-01T11:30:00Z'),
          activo: true
        }
      });
      horariosCreados++;
      console.log(`   ✅ Coro Infantil - ${sabado.nombre} 10:00-11:30`);
    }

    console.log(`\n   📊 Total horarios creados: ${horariosCreados}\n`);

    // ========================================================================
    // PASO 4: Resumen Final
    // ========================================================================
    const totalActividades = await prisma.actividades.count();
    const totalHorarios = await prisma.horarios_actividades.count();

    console.log('═'.repeat(70));
    console.log('  📊 RESUMEN DEL SEED DE ACTIVIDADES');
    console.log('═'.repeat(70));
    console.log(`  Actividades en DB:       ${totalActividades}`);
    console.log(`  Horarios en DB:          ${totalHorarios}`);
    console.log(`  Tipos de actividades:    ${[tipoCoro, tipoClaseIndividual, tipoClaseGrupal].length}`);
    console.log(`  Categorías:              1 (${categoriaMusica.nombre})`);
    console.log(`  Estados:                 2 (${estadoActiva.nombre}, ${estadoPlanificada.nombre})`);
    console.log('═'.repeat(70));
    console.log('\n✅ Seed de actividades completado exitosamente\n');

  } catch (error) {
    console.error('❌ Error durante el seed de actividades:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si es el script principal
if (require.main === module) {
  seedActividades()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default seedActividades;
