import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('========================================');
  console.log('VALIDACIÓN REDISEÑO ACTIVIDAD');
  console.log('========================================\n');

  try {
    // 1. Verificar actividades
    console.log('1. Actividades creadas:');
    const actividades = await prisma.actividades.findMany({
      include: {
        tipos_actividades: true,
        categorias_actividades: true,
        estados_actividades: true,
        horarios_actividades: {
          include: {
            dias_semana: true
          },
          orderBy: [
            { dias_semana: { orden: 'asc' } },
            { hora_inicio: 'asc' }
          ]
        }
      },
      orderBy: {
        codigo_actividad: 'asc'
      }
    });

    for (const act of actividades) {
      console.log(`\n  ✓ ${act.codigo_actividad} - ${act.nombre}`);
      console.log(`    Tipo: ${act.tipos_actividades.nombre}`);
      console.log(`    Categoría: ${act.categorias_actividades.nombre}`);
      console.log(`    Estado: ${act.estados_actividades.nombre}`);
      console.log(`    Cupo: ${act.cupo_maximo || 'Sin límite'}`);
      console.log(`    Costo: $${act.costo}`);
      console.log(`    Horarios (${act.horarios_actividades.length}):`);
      for (const horario of act.horarios_actividades) {
        console.log(`      - ${horario.dias_semana.nombre}: ${horario.hora_inicio.toISOString().slice(11, 16)} - ${horario.hora_fin.toISOString().slice(11, 16)}`);
      }
    }

    // 2. Verificar catálogos
    console.log('\n\n2. Catálogos poblados:');

    const tipos = await prisma.tipos_actividades.count();
    console.log(`  ✓ Tipos de Actividades: ${tipos}`);

    const categorias = await prisma.categorias_actividades.count();
    console.log(`  ✓ Categorías: ${categorias}`);

    const estados = await prisma.estados_actividades.count();
    console.log(`  ✓ Estados: ${estados}`);

    const dias = await prisma.dias_semana.count();
    console.log(`  ✓ Días de la Semana: ${dias}`);

    const roles = await prisma.roles_docentes.count();
    console.log(`  ✓ Roles de Docentes: ${roles}`);

    // 3. Verificar grupos paralelos
    console.log('\n\n3. Grupos paralelos (mismo horario):');

    // Buscar Piano Nivel 1 grupos paralelos
    const pianoGrupos = actividades.filter(a => a.codigo_actividad.startsWith('PIANO-NIV1'));
    if (pianoGrupos.length > 1) {
      console.log(`  ✓ Detectados ${pianoGrupos.length} grupos de Piano Nivel 1:`);
      for (const grupo of pianoGrupos) {
        const horario = grupo.horarios_actividades[0];
        console.log(`    - ${grupo.codigo_actividad}: ${horario.dias_semana.nombre} ${horario.hora_inicio.toISOString().slice(11, 16)}-${horario.hora_fin.toISOString().slice(11, 16)}`);
      }
    }

    // 4. Verificar actividad con múltiples días
    console.log('\n\n4. Actividades con múltiples días:');
    const multiDia = actividades.filter(a => a.horarios_actividades.length > 1);
    for (const act of multiDia) {
      console.log(`  ✓ ${act.codigo_actividad}: ${act.horarios_actividades.length} días`);
      const dias = act.horarios_actividades.map(h => h.dias_semana.nombre).join(', ');
      console.log(`    Días: ${dias}`);
    }

    console.log('\n========================================');
    console.log('VALIDACIÓN EXITOSA ✓');
    console.log('========================================');
    console.log(`\nTotal actividades: ${actividades.length}`);
    console.log(`Total horarios: ${actividades.reduce((sum, a) => sum + a.horarios_actividades.length, 0)}`);

  } catch (error) {
    console.error('\n❌ Error durante validación:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
