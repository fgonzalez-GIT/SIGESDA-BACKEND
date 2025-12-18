#!/usr/bin/env tsx
/**
 * FASE 6 - Task 6.4: Script de Generación de Datos de Prueba
 *
 * Genera datos masivos para tests de carga:
 * - Socios (100, 500, 1000)
 * - Actividades
 * - Participaciones
 * - Categorías
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface GenerateOptions {
  socios: number;
  actividades: number;
  participacionesPorSocio: number;
}

async function generateTestData(options: GenerateOptions) {
  console.log('═══════════════════════════════════════════════════════');
  console.log('FASE 6 - Generación de Datos de Prueba para Carga');
  console.log('═══════════════════════════════════════════════════════\n');

  const startTime = Date.now();

  try {
    // ═══════════════════════════════════════════════════════════════
    // 1. Verificar catálogos base
    // ═══════════════════════════════════════════════════════════════

    console.log('[1/5] Verificando catálogos base...');

    const tipoSocio = await prisma.tipoPersonaCatalogo.findFirst({
      where: { codigo: 'SOCIO' }
    });

    if (!tipoSocio) {
      throw new Error('Tipo SOCIO no encontrado en catálogo');
    }

    const categoriaSocio = await prisma.categoriaSocio.findFirst({
      where: { activa: true }
    });

    if (!categoriaSocio) {
      throw new Error('No hay categorías de socio activas');
    }

    console.log(`✅ Tipo SOCIO: ${tipoSocio.nombre}`);
    console.log(`✅ Categoría: ${categoriaSocio.nombre}\n`);

    // ═══════════════════════════════════════════════════════════════
    // 2. Generar Socios
    // ═══════════════════════════════════════════════════════════════

    console.log(`[2/5] Generando ${options.socios} socios...`);

    const sociosCreados = [];
    for (let i = 0; i < options.socios; i++) {
      const numeroSocio = 10000 + i;

      const persona = await prisma.persona.create({
        data: {
          nombre: `TestSocio${i}`,
          apellido: `Apellido${i}`,
          dni: `${40000000 + i}`,
          email: `testsocio${i}@test.com`,
          numeroSocio,
          activo: true,
          tipos: {
            create: {
              tipoPersonaId: tipoSocio.id,
              categoriaId: categoriaSocio.id,
              numeroSocio,
              fechaIngreso: new Date(),
              activo: true
            }
          }
        }
      });

      sociosCreados.push(persona);

      if ((i + 1) % 100 === 0) {
        console.log(`   Progreso: ${i + 1}/${options.socios} socios creados`);
      }
    }

    console.log(`✅ ${sociosCreados.length} socios creados\n`);

    // ═══════════════════════════════════════════════════════════════
    // 3. Generar Actividades
    // ═══════════════════════════════════════════════════════════════

    console.log(`[3/5] Generando ${options.actividades} actividades...`);

    const actividadesCreadas = [];
    for (let i = 0; i < options.actividades; i++) {
      const actividad = await prisma.actividades.create({
        data: {
          nombre: `Actividad Test ${i}`,
          tipo: 'CLASE_INSTRUMENTO',
          descripcion: `Actividad de prueba para tests de carga`,
          precio: 500 + (i * 100),
          capacidadMaxima: 20,
          activa: true
        }
      });

      actividadesCreadas.push(actividad);
    }

    console.log(`✅ ${actividadesCreadas.length} actividades creadas\n`);

    // ═══════════════════════════════════════════════════════════════
    // 4. Generar Participaciones
    // ═══════════════════════════════════════════════════════════════

    console.log(`[4/5] Generando participaciones (${options.participacionesPorSocio} por socio)...`);

    let participacionesCreadas = 0;
    for (const socio of sociosCreados) {
      // Asignar N actividades aleatorias a cada socio
      const actividadesAsignadas = actividadesCreadas
        .sort(() => Math.random() - 0.5)
        .slice(0, options.participacionesPorSocio);

      for (const actividad of actividadesAsignadas) {
        await prisma.participacion_actividades.create({
          data: {
            personaId: socio.id,
            actividadId: actividad.id,
            fechaInicio: new Date(),
            activa: true
          }
        });

        participacionesCreadas++;
      }

      if (participacionesCreadas % 500 === 0) {
        console.log(`   Progreso: ${participacionesCreadas} participaciones creadas`);
      }
    }

    console.log(`✅ ${participacionesCreadas} participaciones creadas\n`);

    // ═══════════════════════════════════════════════════════════════
    // 5. Resumen
    // ═══════════════════════════════════════════════════════════════

    const tiempoTotal = Date.now() - startTime;

    console.log('═══════════════════════════════════════════════════════');
    console.log('RESUMEN DE DATOS GENERADOS');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`✅ Socios: ${sociosCreados.length}`);
    console.log(`✅ Actividades: ${actividadesCreadas.length}`);
    console.log(`✅ Participaciones: ${participacionesCreadas}`);
    console.log(`⏱️  Tiempo total: ${(tiempoTotal / 1000).toFixed(2)}s`);
    console.log('═══════════════════════════════════════════════════════\n');

    return {
      socios: sociosCreados.length,
      actividades: actividadesCreadas.length,
      participaciones: participacionesCreadas,
      tiempoMs: tiempoTotal
    };

  } catch (error) {
    console.error('❌ Error generando datos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// ═══════════════════════════════════════════════════════════════════
// Ejecución con argumentos de línea de comandos
// ═══════════════════════════════════════════════════════════════════

const args = process.argv.slice(2);
const preset = args[0] || 'small';

const presets: Record<string, GenerateOptions> = {
  small: {
    socios: 100,
    actividades: 10,
    participacionesPorSocio: 2
  },
  medium: {
    socios: 500,
    actividades: 20,
    participacionesPorSocio: 3
  },
  large: {
    socios: 1000,
    actividades: 30,
    participacionesPorSocio: 3
  }
};

const options = presets[preset] || presets.small;

console.log(`\n🚀 Preset seleccionado: ${preset.toUpperCase()}\n`);

generateTestData(options)
  .then((result) => {
    console.log('✅ Datos de prueba generados exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
