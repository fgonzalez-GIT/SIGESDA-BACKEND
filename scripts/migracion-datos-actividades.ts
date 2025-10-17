#!/usr/bin/env tsx
/**
 * Script de migración de datos para el módulo de Actividades V2.0
 *
 * Este script:
 * 1. Verifica la existencia de datos en las tablas de catálogos
 * 2. Crea datos de ejemplo si no existen
 * 3. Valida la integridad referencial
 * 4. Genera reporte de migración
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MigrationReport {
  success: boolean;
  timestamp: Date;
  steps: {
    step: string;
    status: 'success' | 'skipped' | 'error';
    message: string;
    recordsAffected?: number;
  }[];
  summary: {
    totalTables: number;
    tablesWithData: number;
    totalRecords: number;
  };
}

const report: MigrationReport = {
  success: true,
  timestamp: new Date(),
  steps: [],
  summary: {
    totalTables: 0,
    tablesWithData: 0,
    totalRecords: 0
  }
};

function addStep(step: string, status: 'success' | 'skipped' | 'error', message: string, recordsAffected?: number) {
  report.steps.push({ step, status, message, recordsAffected });
  console.log(`[${status.toUpperCase()}] ${step}: ${message}`);
  if (recordsAffected !== undefined) {
    console.log(`  → Registros afectados: ${recordsAffected}`);
  }
}

async function verificarCatalogos() {
  console.log('\n=== VERIFICANDO CATÁLOGOS ===\n');

  // Tipos de Actividades
  const tiposCount = await prisma.tipos_actividades.count();
  if (tiposCount === 0) {
    await prisma.tipos_actividades.createMany({
      data: [
        { codigo: 'CORO', nombre: 'Coro', descripcion: 'Actividad coral grupal', activo: true, orden: 1 },
        { codigo: 'CLASE_CANTO', nombre: 'Clase de Canto', descripcion: 'Clases individuales o grupales de canto', activo: true, orden: 2 },
        { codigo: 'CLASE_INSTRUMENTO', nombre: 'Clase de Instrumento', descripcion: 'Clases de instrumentos musicales', activo: true, orden: 3 }
      ]
    });
    addStep('Tipos de Actividades', 'success', 'Catálogo creado', 3);
  } else {
    addStep('Tipos de Actividades', 'skipped', `Ya existen ${tiposCount} registros`);
  }

  // Categorías de Actividades
  const categoriasCount = await prisma.categorias_actividades.count();
  if (categoriasCount === 0) {
    await prisma.categorias_actividades.createMany({
      data: [
        { codigo: 'CORO_ADULTOS', nombre: 'Coro Adultos', descripcion: 'Coro principal de adultos', activo: true, orden: 1 },
        { codigo: 'CORO_JUVENIL', nombre: 'Coro Juvenil', descripcion: 'Coro de jóvenes y adolescentes', activo: true, orden: 2 },
        { codigo: 'CORO_INFANTIL', nombre: 'Coro Infantil', descripcion: 'Coro de niños', activo: true, orden: 3 },
        { codigo: 'PIANO_INICIAL', nombre: 'Piano Inicial', descripcion: 'Piano nivel principiante', activo: true, orden: 4 },
        { codigo: 'PIANO_INTERMEDIO', nombre: 'Piano Intermedio', descripcion: 'Piano nivel intermedio', activo: true, orden: 5 },
        { codigo: 'PIANO_AVANZADO', nombre: 'Piano Avanzado', descripcion: 'Piano nivel avanzado', activo: true, orden: 6 },
        { codigo: 'CANTO_INICIAL', nombre: 'Canto Inicial', descripcion: 'Canto nivel inicial', activo: true, orden: 7 },
        { codigo: 'CANTO_INTERMEDIO', nombre: 'Canto Intermedio', descripcion: 'Canto nivel intermedio', activo: true, orden: 8 },
        { codigo: 'CANTO_AVANZADO', nombre: 'Canto Avanzado', descripcion: 'Canto nivel avanzado', activo: true, orden: 9 },
        { codigo: 'GUITARRA_INICIAL', nombre: 'Guitarra Inicial', descripcion: 'Guitarra nivel inicial', activo: true, orden: 10 },
        { codigo: 'GUITARRA_INTERMEDIO', nombre: 'Guitarra Intermedio', descripcion: 'Guitarra nivel intermedio', activo: true, orden: 11 },
        { codigo: 'VIOLIN_INICIAL', nombre: 'Violín Inicial', descripcion: 'Violín nivel inicial', activo: true, orden: 12 },
        { codigo: 'VIOLIN_INTERMEDIO', nombre: 'Violín Intermedio', descripcion: 'Violín nivel intermedio', activo: true, orden: 13 },
        { codigo: 'FLAUTA_INICIAL', nombre: 'Flauta Inicial', descripcion: 'Flauta nivel inicial', activo: true, orden: 14 },
        { codigo: 'TEORIA_MUSICAL', nombre: 'Teoría Musical', descripcion: 'Clases de teoría y solfeo', activo: true, orden: 15 },
        { codigo: 'GENERAL', nombre: 'General', descripcion: 'Categoría general', activo: true, orden: 99 }
      ]
    });
    addStep('Categorías de Actividades', 'success', 'Catálogo creado', 16);
  } else {
    addStep('Categorías de Actividades', 'skipped', `Ya existen ${categoriasCount} registros`);
  }

  // Estados de Actividades
  const estadosCount = await prisma.estados_actividades.count();
  if (estadosCount === 0) {
    await prisma.estados_actividades.createMany({
      data: [
        { codigo: 'ACTIVA', nombre: 'Activa', descripcion: 'Actividad en curso', activo: true, orden: 1 },
        { codigo: 'INACTIVA', nombre: 'Inactiva', descripcion: 'Actividad temporalmente inactiva', activo: true, orden: 2 },
        { codigo: 'FINALIZADA', nombre: 'Finalizada', descripcion: 'Actividad terminada', activo: true, orden: 3 },
        { codigo: 'CANCELADA', nombre: 'Cancelada', descripcion: 'Actividad cancelada', activo: true, orden: 4 }
      ]
    });
    addStep('Estados de Actividades', 'success', 'Catálogo creado', 4);
  } else {
    addStep('Estados de Actividades', 'skipped', `Ya existen ${estadosCount} registros`);
  }

  // Días de la Semana
  const diasCount = await prisma.dias_semana.count();
  if (diasCount === 0) {
    await prisma.dias_semana.createMany({
      data: [
        { codigo: 'LUNES', nombre: 'Lunes', orden: 1 },
        { codigo: 'MARTES', nombre: 'Martes', orden: 2 },
        { codigo: 'MIERCOLES', nombre: 'Miércoles', orden: 3 },
        { codigo: 'JUEVES', nombre: 'Jueves', orden: 4 },
        { codigo: 'VIERNES', nombre: 'Viernes', orden: 5 },
        { codigo: 'SABADO', nombre: 'Sábado', orden: 6 },
        { codigo: 'DOMINGO', nombre: 'Domingo', orden: 7 }
      ]
    });
    addStep('Días de la Semana', 'success', 'Catálogo creado', 7);
  } else {
    addStep('Días de la Semana', 'skipped', `Ya existen ${diasCount} registros`);
  }

  // Roles de Docentes
  const rolesCount = await prisma.roles_docentes.count();
  if (rolesCount === 0) {
    await prisma.roles_docentes.createMany({
      data: [
        { codigo: 'TITULAR', nombre: 'Titular', descripcion: 'Docente titular de la actividad', activo: true, orden: 1 },
        { codigo: 'SUPLENTE', nombre: 'Suplente', descripcion: 'Docente suplente', activo: true, orden: 2 },
        { codigo: 'AUXILIAR', nombre: 'Auxiliar', descripcion: 'Docente auxiliar o asistente', activo: true, orden: 3 },
        { codigo: 'COORDINADOR', nombre: 'Coordinador', descripcion: 'Coordinador de la actividad', activo: true, orden: 4 }
      ]
    });
    addStep('Roles de Docentes', 'success', 'Catálogo creado', 4);
  } else {
    addStep('Roles de Docentes', 'skipped', `Ya existen ${rolesCount} registros`);
  }
}

async function crearActividadesEjemplo() {
  console.log('\n=== CREANDO ACTIVIDADES DE EJEMPLO ===\n');

  const actividadesCount = await prisma.actividades.count();

  if (actividadesCount > 0) {
    addStep('Actividades de Ejemplo', 'skipped', `Ya existen ${actividadesCount} actividades`);
    return;
  }

  // Obtener IDs de catálogos
  const tipoCoro = await prisma.tipos_actividades.findFirst({ where: { codigo: 'CORO' } });
  const tipoClaseInstrumento = await prisma.tipos_actividades.findFirst({ where: { codigo: 'CLASE_INSTRUMENTO' } });
  const tipoClaseCanto = await prisma.tipos_actividades.findFirst({ where: { codigo: 'CLASE_CANTO' } });

  const catCoroAdultos = await prisma.categorias_actividades.findFirst({ where: { codigo: 'CORO_ADULTOS' } });
  const catPianoInicial = await prisma.categorias_actividades.findFirst({ where: { codigo: 'PIANO_INICIAL' } });
  const catCantoIntermedio = await prisma.categorias_actividades.findFirst({ where: { codigo: 'CANTO_INTERMEDIO' } });

  const estadoActiva = await prisma.estados_actividades.findFirst({ where: { codigo: 'ACTIVA' } });

  const lunes = await prisma.dias_semana.findFirst({ where: { codigo: 'LUNES' } });
  const miercoles = await prisma.dias_semana.findFirst({ where: { codigo: 'MIERCOLES' } });
  const viernes = await prisma.dias_semana.findFirst({ where: { codigo: 'VIERNES' } });
  const martes = await prisma.dias_semana.findFirst({ where: { codigo: 'MARTES' } });
  const jueves = await prisma.dias_semana.findFirst({ where: { codigo: 'JUEVES' } });

  if (!tipoCoro || !catCoroAdultos || !estadoActiva || !lunes) {
    addStep('Actividades de Ejemplo', 'error', 'Faltan catálogos necesarios');
    report.success = false;
    return;
  }

  // Actividad 1: Coro Adultos 2025
  await prisma.actividades.create({
    data: {
      codigo_actividad: 'CORO-ADU-2025-A',
      nombre: 'Coro Adultos 2025',
      tipo_actividad_id: tipoCoro.id,
      categoria_id: catCoroAdultos.id,
      estado_id: estadoActiva.id,
      descripcion: 'Coro principal de adultos - Temporada 2025',
      fecha_desde: new Date('2025-01-01'),
      fecha_hasta: new Date('2025-12-31'),
      cupo_maximo: 40,
      costo: 0,
      observaciones: 'Actividad gratuita para socios',
      horarios_actividades: {
        create: [
          {
            dia_semana_id: lunes!.id,
            hora_inicio: new Date('1970-01-01T18:00:00Z'),
            hora_fin: new Date('1970-01-01T20:00:00Z'),
            activo: true
          },
          {
            dia_semana_id: miercoles!.id,
            hora_inicio: new Date('1970-01-01T18:00:00Z'),
            hora_fin: new Date('1970-01-01T20:00:00Z'),
            activo: true
          },
          {
            dia_semana_id: viernes!.id,
            hora_inicio: new Date('1970-01-01T18:00:00Z'),
            hora_fin: new Date('1970-01-01T20:00:00Z'),
            activo: true
          }
        ]
      }
    }
  });

  // Actividad 2: Piano Nivel 1 - Grupo 1
  if (tipoClaseInstrumento && catPianoInicial) {
    await prisma.actividades.create({
      data: {
        codigo_actividad: 'PIANO-NIV1-2025-G1',
        nombre: 'Piano Nivel 1 - Grupo 1',
        tipo_actividad_id: tipoClaseInstrumento.id,
        categoria_id: catPianoInicial.id,
        estado_id: estadoActiva.id,
        descripcion: 'Clases de piano para principiantes - Grupo 1',
        fecha_desde: new Date('2025-01-01'),
        fecha_hasta: new Date('2025-12-31'),
        cupo_maximo: 4,
        costo: 5000,
        horarios_actividades: {
          create: [
            {
              dia_semana_id: lunes!.id,
              hora_inicio: new Date('1970-01-01T18:00:00Z'),
              hora_fin: new Date('1970-01-01T19:00:00Z'),
              activo: true
            }
          ]
        }
      }
    });
  }

  // Actividad 3: Piano Nivel 1 - Grupo 2 (mismo horario, grupo paralelo)
  if (tipoClaseInstrumento && catPianoInicial) {
    await prisma.actividades.create({
      data: {
        codigo_actividad: 'PIANO-NIV1-2025-G2',
        nombre: 'Piano Nivel 1 - Grupo 2',
        tipo_actividad_id: tipoClaseInstrumento.id,
        categoria_id: catPianoInicial.id,
        estado_id: estadoActiva.id,
        descripcion: 'Clases de piano para principiantes - Grupo 2',
        fecha_desde: new Date('2025-01-01'),
        fecha_hasta: new Date('2025-12-31'),
        cupo_maximo: 4,
        costo: 5000,
        horarios_actividades: {
          create: [
            {
              dia_semana_id: lunes!.id,
              hora_inicio: new Date('1970-01-01T18:00:00Z'),
              hora_fin: new Date('1970-01-01T19:00:00Z'),
              activo: true
            }
          ]
        }
      }
    });
  }

  // Actividad 4: Canto Intermedio 2025
  if (tipoClaseCanto && catCantoIntermedio && martes && jueves) {
    await prisma.actividades.create({
      data: {
        codigo_actividad: 'CANTO-INT-2025-A',
        nombre: 'Canto Intermedio 2025',
        tipo_actividad_id: tipoClaseCanto.id,
        categoria_id: catCantoIntermedio.id,
        estado_id: estadoActiva.id,
        descripcion: 'Clases de canto nivel intermedio',
        fecha_desde: new Date('2025-01-01'),
        fecha_hasta: new Date('2025-12-31'),
        cupo_maximo: 6,
        costo: 4500,
        horarios_actividades: {
          create: [
            {
              dia_semana_id: martes.id,
              hora_inicio: new Date('1970-01-01T15:00:00Z'),
              hora_fin: new Date('1970-01-01T16:30:00Z'),
              activo: true
            },
            {
              dia_semana_id: jueves.id,
              hora_inicio: new Date('1970-01-01T15:00:00Z'),
              hora_fin: new Date('1970-01-01T16:30:00Z'),
              activo: true
            }
          ]
        }
      }
    });
  }

  const actividadesCreadas = await prisma.actividades.count();
  addStep('Actividades de Ejemplo', 'success', 'Actividades creadas', actividadesCreadas);
}

async function validarIntegridadReferencial() {
  console.log('\n=== VALIDANDO INTEGRIDAD REFERENCIAL ===\n');

  // Validar que todas las actividades tienen referencias válidas
  const actividadesInvalidas = await prisma.$queryRaw`
    SELECT a.id, a.codigo_actividad, a.nombre
    FROM actividades a
    LEFT JOIN tipos_actividades ta ON ta.id = a.tipo_actividad_id
    LEFT JOIN categorias_actividades ca ON ca.id = a.categoria_id
    LEFT JOIN estados_actividades ea ON ea.id = a.estado_id
    WHERE ta.id IS NULL OR ca.id IS NULL OR ea.id IS NULL
  `;

  if (Array.isArray(actividadesInvalidas) && actividadesInvalidas.length > 0) {
    addStep('Integridad: Actividades', 'error', `${actividadesInvalidas.length} actividades con referencias inválidas`);
    report.success = false;
  } else {
    addStep('Integridad: Actividades', 'success', 'Todas las actividades tienen referencias válidas');
  }

  // Validar horarios
  const horariosInvalidos = await prisma.$queryRaw`
    SELECT h.id
    FROM horarios_actividades h
    LEFT JOIN actividades a ON a.id = h.actividad_id
    LEFT JOIN dias_semana d ON d.id = h.dia_semana_id
    WHERE a.id IS NULL OR d.id IS NULL
  `;

  if (Array.isArray(horariosInvalidos) && horariosInvalidos.length > 0) {
    addStep('Integridad: Horarios', 'error', `${horariosInvalidos.length} horarios con referencias inválidas`);
    report.success = false;
  } else {
    addStep('Integridad: Horarios', 'success', 'Todos los horarios tienen referencias válidas');
  }

  // Validar docentes_actividades
  const docentesInvalidos = await prisma.$queryRaw`
    SELECT da.id
    FROM docentes_actividades da
    LEFT JOIN actividades a ON a.id = da.actividad_id
    LEFT JOIN personas p ON p.id = da.docente_id
    LEFT JOIN roles_docentes r ON r.id = da.rol_docente_id
    WHERE a.id IS NULL OR p.id IS NULL OR r.id IS NULL
  `;

  if (Array.isArray(docentesInvalidos) && docentesInvalidos.length > 0) {
    addStep('Integridad: Docentes', 'error', `${docentesInvalidos.length} asignaciones con referencias inválidas`);
    report.success = false;
  } else {
    const totalDocentes = await prisma.docentes_actividades.count();
    addStep('Integridad: Docentes', 'success', `Todas las asignaciones (${totalDocentes}) tienen referencias válidas`);
  }
}

async function generarResumen() {
  console.log('\n=== GENERANDO RESUMEN ===\n');

  const counts = {
    actividades: await prisma.actividades.count(),
    tipos: await prisma.tipos_actividades.count(),
    categorias: await prisma.categorias_actividades.count(),
    estados: await prisma.estados_actividades.count(),
    dias: await prisma.dias_semana.count(),
    roles: await prisma.roles_docentes.count(),
    horarios: await prisma.horarios_actividades.count(),
    docentes: await prisma.docentes_actividades.count(),
    participaciones: await prisma.participaciones_actividades.count(),
    reservas: await prisma.reservas_aulas_actividades.count()
  };

  report.summary.totalTables = 10;
  report.summary.tablesWithData = Object.values(counts).filter(c => c > 0).length;
  report.summary.totalRecords = Object.values(counts).reduce((sum, c) => sum + c, 0);

  console.log('\n📊 RESUMEN DE DATOS:\n');
  console.log(`  Actividades:                ${counts.actividades}`);
  console.log(`  Tipos de Actividades:       ${counts.tipos}`);
  console.log(`  Categorías de Actividades:  ${counts.categorias}`);
  console.log(`  Estados de Actividades:     ${counts.estados}`);
  console.log(`  Días de la Semana:          ${counts.dias}`);
  console.log(`  Roles de Docentes:          ${counts.roles}`);
  console.log(`  Horarios:                   ${counts.horarios}`);
  console.log(`  Docentes Asignados:         ${counts.docentes}`);
  console.log(`  Participaciones:            ${counts.participaciones}`);
  console.log(`  Reservas de Aulas:          ${counts.reservas}`);
  console.log(`\n  TOTAL DE REGISTROS:         ${report.summary.totalRecords}`);
}

async function main() {
  console.log('\n🚀 INICIANDO MIGRACIÓN DE DATOS - MÓDULO ACTIVIDADES V2.0\n');
  console.log('═'.repeat(60));

  try {
    await verificarCatalogos();
    await crearActividadesEjemplo();
    await validarIntegridadReferencial();
    await generarResumen();

    console.log('\n' + '═'.repeat(60));

    if (report.success) {
      console.log('\n✅ MIGRACIÓN COMPLETADA EXITOSAMENTE\n');
    } else {
      console.log('\n⚠️  MIGRACIÓN COMPLETADA CON ERRORES\n');
      process.exit(1);
    }

    // Guardar reporte
    const reportPath = './migration-report.json';
    const fs = await import('fs/promises');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Reporte guardado en: ${reportPath}\n`);

  } catch (error) {
    console.error('\n❌ ERROR DURANTE LA MIGRACIÓN:', error);
    report.success = false;
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
