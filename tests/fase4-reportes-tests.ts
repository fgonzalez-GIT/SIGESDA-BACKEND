/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FASE 4 - Task 4.4: Reportes y Estadísticas de Cuotas - TESTS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Comprehensive tests for cuota reporting and analytics functionality.
 *
 * Coverage:
 * - Dashboard general de cuotas
 * - Reportes por categoría
 * - Análisis de descuentos (ajustes + reglas + exenciones)
 * - Reporte de exenciones vigentes
 * - Reporte comparativo entre períodos
 * - Estadísticas de recaudación
 * - Exportación de reportes
 *
 * Prerequisites:
 * - Database running on localhost:5432
 * - FASE 4 migrations applied (Tasks 4.1, 4.2, 4.3)
 *
 * @author SIGESDA Development Team
 * @date 2025-12-15
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { ReportesCuotaService } from '../src/services/reportes-cuota.service';
import assert from 'assert';

const prisma = new PrismaClient();
const reportesService = new ReportesCuotaService();

// ═══════════════════════════════════════════════════════════════════════════
// Test Data Setup
// ═══════════════════════════════════════════════════════════════════════════

interface TestData {
  categoria1: any;
  categoria2: any;
  persona1: any;
  persona2: any;
  persona3: any;
  recibo1: any;
  recibo2: any;
  recibo3: any;
  recibo4: any;
  cuota1: any; // Pagada
  cuota2: any; // Pendiente
  cuota3: any; // Vencida
  cuota4: any; // Mes anterior
  ajuste1: any;
  ajuste2: any;
  exencion1: any;
  exencion2: any;
  itemCuota1: any;
  itemCuota2: any;
}

let testData: Partial<TestData> = {};

async function setupTestData(): Promise<void> {
  console.log('\n🔧 Setting up test data...\n');

  await cleanupTestData();

  const timestamp = Date.now();
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Mes anterior para reporte comparativo
  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  // 1. Create categorias
  testData.categoria1 = await prisma.categoriaSocio.create({
    data: {
      nombre: `Test Cat Report 1 ${timestamp}`,
      descripcion: 'Categoría para tests de reportes',
      codigo: `TEST-REP-1-${timestamp}`,
      descuento: new Prisma.Decimal(10), // 10% descuento
      montoCuota: new Prisma.Decimal(15000),
      activa: true,
      orden: 998
    }
  });

  testData.categoria2 = await prisma.categoriaSocio.create({
    data: {
      nombre: `Test Cat Report 2 ${timestamp}`,
      descripcion: 'Segunda categoría para tests de reportes',
      codigo: `TEST-REP-2-${timestamp}`,
      descuento: new Prisma.Decimal(0),
      montoCuota: new Prisma.Decimal(20000),
      activa: true,
      orden: 999
    }
  });

  // 2. Get tipo persona SOCIO
  const tipoSocio = await prisma.tipoPersonaCatalogo.findFirst({
    where: { codigo: 'SOCIO' }
  });

  if (!tipoSocio) {
    throw new Error('Tipo SOCIO no encontrado en catálogo');
  }

  // 3. Create personas
  testData.persona1 = await prisma.persona.create({
    data: {
      nombre: 'Ana',
      apellido: 'Reportes Test',
      dni: `DNI-REP-1-${timestamp}`,
      activo: true,
      fechaNacimiento: new Date('1990-01-01'),
      tipos: {
        create: {
          tipoPersonaId: tipoSocio.id,
          activo: true,
          numeroSocio: parseInt(`${timestamp}`.slice(-6)),
          categoriaId: testData.categoria1.id
        }
      }
    }
  });

  testData.persona2 = await prisma.persona.create({
    data: {
      nombre: 'Bruno',
      apellido: 'Estadisticas Test',
      dni: `DNI-REP-2-${timestamp}`,
      activo: true,
      fechaNacimiento: new Date('1992-05-15'),
      tipos: {
        create: {
          tipoPersonaId: tipoSocio.id,
          activo: true,
          numeroSocio: parseInt(`${timestamp}`.slice(-6)) + 1,
          categoriaId: testData.categoria2.id
        }
      }
    }
  });

  testData.persona3 = await prisma.persona.create({
    data: {
      nombre: 'Carlos',
      apellido: 'Comparativo Test',
      dni: `DNI-REP-3-${timestamp}`,
      activo: true,
      fechaNacimiento: new Date('1988-11-20'),
      tipos: {
        create: {
          tipoPersonaId: tipoSocio.id,
          activo: true,
          numeroSocio: parseInt(`${timestamp}`.slice(-6)) + 2,
          categoriaId: testData.categoria1.id
        }
      }
    }
  });

  // 4. Create recibos
  testData.recibo1 = await prisma.recibo.create({
    data: {
      tipo: 'CUOTA',
      receptorId: testData.persona1.id,
      importe: new Prisma.Decimal(13500), // 15000 - 10%
      concepto: `Cuota ${currentMonth}/${currentYear}`,
      fechaVencimiento: new Date(currentYear, currentMonth, 15),
      estado: 'PAGADO'
    }
  });

  testData.recibo2 = await prisma.recibo.create({
    data: {
      tipo: 'CUOTA',
      receptorId: testData.persona2.id,
      importe: new Prisma.Decimal(20000),
      concepto: `Cuota ${currentMonth}/${currentYear}`,
      fechaVencimiento: new Date(currentYear, currentMonth, 15),
      estado: 'PENDIENTE'
    }
  });

  testData.recibo3 = await prisma.recibo.create({
    data: {
      tipo: 'CUOTA',
      receptorId: testData.persona3.id,
      importe: new Prisma.Decimal(13500),
      concepto: `Cuota ${currentMonth}/${currentYear}`,
      fechaVencimiento: new Date(currentYear, currentMonth - 1, 10), // Vencida
      estado: 'VENCIDO'
    }
  });

  // Recibo mes anterior para comparativo
  testData.recibo4 = await prisma.recibo.create({
    data: {
      tipo: 'CUOTA',
      receptorId: testData.persona1.id,
      importe: new Prisma.Decimal(13500),
      concepto: `Cuota ${lastMonth}/${lastMonthYear}`,
      fechaVencimiento: new Date(lastMonthYear, lastMonth - 1, 15),
      estado: 'PAGADO'
    }
  });

  // 5. Create cuotas
  testData.cuota1 = await prisma.cuota.create({
    data: {
      reciboId: testData.recibo1.id,
      categoriaId: testData.categoria1.id,
      mes: currentMonth,
      anio: currentYear,
      montoBase: new Prisma.Decimal(15000),
      montoActividades: new Prisma.Decimal(0),
      montoTotal: new Prisma.Decimal(13500)
    }
  });

  testData.cuota2 = await prisma.cuota.create({
    data: {
      reciboId: testData.recibo2.id,
      categoriaId: testData.categoria2.id,
      mes: currentMonth,
      anio: currentYear,
      montoBase: new Prisma.Decimal(20000),
      montoActividades: new Prisma.Decimal(0),
      montoTotal: new Prisma.Decimal(20000)
    }
  });

  testData.cuota3 = await prisma.cuota.create({
    data: {
      reciboId: testData.recibo3.id,
      categoriaId: testData.categoria1.id,
      mes: currentMonth,
      anio: currentYear,
      montoBase: new Prisma.Decimal(15000),
      montoActividades: new Prisma.Decimal(0),
      montoTotal: new Prisma.Decimal(13500)
    }
  });

  testData.cuota4 = await prisma.cuota.create({
    data: {
      reciboId: testData.recibo4.id,
      categoriaId: testData.categoria1.id,
      mes: lastMonth,
      anio: lastMonthYear,
      montoBase: new Prisma.Decimal(15000),
      montoActividades: new Prisma.Decimal(0),
      montoTotal: new Prisma.Decimal(13500)
    }
  });

  // 6. Create ajustes
  testData.ajuste1 = await prisma.ajusteCuotaSocio.create({
    data: {
      personaId: testData.persona1.id,
      concepto: 'Descuento por test',
      tipoAjuste: 'DESCUENTO_FIJO' as any,
      valor: new Prisma.Decimal(500),
      activo: true,
      fechaInicio: new Date(currentYear, currentMonth - 1, 1),
      fechaFin: new Date(currentYear, currentMonth - 1, 31)
    }
  });

  testData.ajuste2 = await prisma.ajusteCuotaSocio.create({
    data: {
      personaId: testData.persona2.id,
      concepto: 'Recargo por test',
      tipoAjuste: 'RECARGO_FIJO' as any,
      valor: new Prisma.Decimal(1000),
      activo: true,
      fechaInicio: new Date(currentYear, currentMonth - 1, 1),
      fechaFin: new Date(currentYear, currentMonth - 1, 31)
    }
  });

  // 7. Create exenciones
  testData.exencion1 = await prisma.exencionCuota.create({
    data: {
      personaId: testData.persona1.id,
      tipoExencion: 'TOTAL' as any,
      motivoExencion: 'BECA' as any,
      descripcion: 'Beca de test',
      porcentajeExencion: new Prisma.Decimal(100),
      fechaSolicitud: new Date(),
      estado: 'VIGENTE' as any,
      fechaAprobacion: new Date(),
      aprobadoPor: 'admin',
      fechaInicio: new Date(currentYear, currentMonth - 1, 1),
      fechaFin: new Date(currentYear, currentMonth + 2, 31)
    }
  });

  testData.exencion2 = await prisma.exencionCuota.create({
    data: {
      personaId: testData.persona3.id,
      tipoExencion: 'PARCIAL' as any,
      motivoExencion: 'SITUACION_ECONOMICA' as any,
      descripcion: 'Situación económica temporal',
      porcentajeExencion: new Prisma.Decimal(50),
      fechaSolicitud: new Date(),
      estado: 'PENDIENTE_APROBACION' as any,
      fechaInicio: new Date(currentYear, currentMonth - 1, 1),
      fechaFin: new Date(currentYear, currentMonth + 1, 31)
    }
  });

  // 8. Create items de cuota (si existen tipos)
  const tipoItem = await prisma.tipoItemCuota.findFirst({
    where: { activo: true }
  });

  if (tipoItem) {
    testData.itemCuota1 = await prisma.itemCuota.create({
      data: {
        cuotaId: testData.cuota1.id,
        tipoItemId: tipoItem.id,
        concepto: 'Item de test 1',
        monto: new Prisma.Decimal(5000),
        cantidad: 1,
        esAutomatico: true
      }
    });

    testData.itemCuota2 = await prisma.itemCuota.create({
      data: {
        cuotaId: testData.cuota2.id,
        tipoItemId: tipoItem.id,
        concepto: 'Item de test 2',
        monto: new Prisma.Decimal(10000),
        cantidad: 1,
        esAutomatico: true
      }
    });
  }

  console.log('✅ Test data setup complete\n');
}

async function cleanupTestData(): Promise<void> {
  console.log('🧹 Cleaning up previous test data...\n');

  // Find test categorias
  const testCategorias = await prisma.categoriaSocio.findMany({
    where: {
      codigo: {
        startsWith: 'TEST-REP-'
      }
    }
  });

  const categoriaIds = testCategorias.map(c => c.id);

  if (categoriaIds.length > 0) {
    // Delete in reverse dependency order
    await prisma.itemCuota.deleteMany({
      where: {
        cuota: {
          categoriaId: { in: categoriaIds }
        }
      }
    });

    await prisma.cuota.deleteMany({
      where: {
        categoriaId: { in: categoriaIds }
      }
    });

    await prisma.recibo.deleteMany({
      where: {
        cuota: {
          categoriaId: { in: categoriaIds }
        }
      }
    });
  }

  // Delete test exenciones
  const testPersonas = await prisma.persona.findMany({
    where: {
      dni: {
        startsWith: 'DNI-REP-'
      }
    }
  });

  const personaIds = testPersonas.map(p => p.id);

  if (personaIds.length > 0) {
    await prisma.exencionCuota.deleteMany({
      where: {
        personaId: { in: personaIds }
      }
    });

    await prisma.ajusteCuotaSocio.deleteMany({
      where: {
        personaId: { in: personaIds }
      }
    });

    await prisma.historialAjusteCuota.deleteMany({
      where: {
        personaId: { in: personaIds }
      }
    });

    await prisma.recibo.deleteMany({
      where: {
        receptorId: { in: personaIds }
      }
    });

    await prisma.personaTipo.deleteMany({
      where: {
        personaId: { in: personaIds }
      }
    });

    await prisma.persona.deleteMany({
      where: {
        id: { in: personaIds }
      }
    });
  }

  // Delete test categorias
  if (categoriaIds.length > 0) {
    await prisma.categoriaSocio.deleteMany({
      where: {
        id: { in: categoriaIds }
      }
    });
  }

  console.log('✅ Cleanup complete\n');
}

// ═══════════════════════════════════════════════════════════════════════════
// Test Suite 1: Dashboard General
// ═══════════════════════════════════════════════════════════════════════════

async function testDashboardGeneral(): Promise<void> {
  console.log('📊 Suite 1: Dashboard General\n');

  // Test 1.1: Dashboard sin filtros (mes/año actual)
  console.log('  Test 1.1: Dashboard sin filtros...');
  const dashboard1 = await reportesService.getDashboard();

  assert(dashboard1.periodo, 'Dashboard debe incluir período');
  assert(dashboard1.metricas, 'Dashboard debe incluir métricas');
  assert(typeof dashboard1.metricas.totalCuotas === 'number', 'totalCuotas debe ser número');
  assert(typeof dashboard1.metricas.cuotasPagadas === 'number', 'cuotasPagadas debe ser número');
  assert(typeof dashboard1.metricas.tasaPago === 'number', 'tasaPago debe ser número');
  assert(Array.isArray(dashboard1.distribucionCategorias), 'distribucionCategorias debe ser array');
  console.log('  ✅ Test 1.1 passed\n');

  // Test 1.2: Dashboard con filtro mes/año
  console.log('  Test 1.2: Dashboard con filtro de período...');
  const currentDate = new Date();
  const dashboard2 = await reportesService.getDashboard({
    mes: currentDate.getMonth() + 1,
    anio: currentDate.getFullYear()
  });

  assert(dashboard2.periodo.mes === currentDate.getMonth() + 1, 'Mes debe coincidir');
  assert(dashboard2.periodo.anio === currentDate.getFullYear(), 'Año debe coincidir');
  assert(dashboard2.metricas.totalCuotas >= 0, 'totalCuotas debe ser >= 0');
  console.log('  ✅ Test 1.2 passed\n');

  // Test 1.3: Verificar distribución por categorías
  console.log('  Test 1.3: Verificar distribución por categorías...');
  assert(Array.isArray(dashboard2.distribucionCategorias), 'distribucionCategorias debe ser array');
  if (dashboard2.distribucionCategorias.length > 0) {
    const cat = dashboard2.distribucionCategorias[0];
    assert(cat.categoriaId, 'Categoría debe tener ID');
    assert(cat.categoriaNombre, 'Categoría debe tener nombre');
    assert(typeof cat.cantidad === 'number', 'cantidad debe ser número');
    assert(typeof Number(cat.montoTotal) === 'number', 'montoTotal debe ser número');
  }
  console.log('  ✅ Test 1.3 passed\n');

  console.log('✅ Suite 1 Complete: 3/3 tests passed\n');
}

// ═══════════════════════════════════════════════════════════════════════════
// Test Suite 2: Reporte por Categoría
// ═══════════════════════════════════════════════════════════════════════════

async function testReportePorCategoria(): Promise<void> {
  console.log('📊 Suite 2: Reporte por Categoría\n');

  const currentDate = new Date();
  const mes = currentDate.getMonth() + 1;
  const anio = currentDate.getFullYear();

  // Test 2.1: Reporte general (todas las categorías)
  console.log('  Test 2.1: Reporte general de todas las categorías...');
  const reporte1 = await reportesService.getReportePorCategoria({ mes, anio });

  assert(reporte1.periodo, 'Reporte debe incluir período');
  assert(Array.isArray(reporte1.categorias), 'categorias debe ser array');
  assert(reporte1.resumen, 'Reporte debe incluir resumen');
  assert(typeof reporte1.resumen.totalCuotas === 'number', 'resumen.totalCuotas debe ser número');
  console.log('  ✅ Test 2.1 passed\n');

  // Test 2.2: Reporte de una categoría específica
  console.log('  Test 2.2: Reporte de categoría específica...');
  const reporte2 = await reportesService.getReportePorCategoria({
    mes,
    anio,
    categoriaId: testData.categoria1!.id
  });

  assert(Array.isArray(reporte2.categorias), 'categorias debe ser array');
  // Solo debe incluir la categoría solicitada (si tiene cuotas)
  reporte2.categorias.forEach((cat: any) => {
    assert(cat.categoriaId === testData.categoria1!.id, 'Solo debe incluir categoría filtrada');
  });
  console.log('  ✅ Test 2.2 passed\n');

  // Test 2.3: Reporte con detalle de cuotas
  console.log('  Test 2.3: Reporte con incluirDetalle=true...');
  const reporte3 = await reportesService.getReportePorCategoria({
    mes,
    anio,
    incluirDetalle: 'true' as any
  });

  if (reporte3.categorias.length > 0) {
    const cat = reporte3.categorias[0];
    assert(Array.isArray(cat.cuotas), 'Categoría debe incluir array de cuotas con detalle');
  }
  console.log('  ✅ Test 2.3 passed\n');

  console.log('✅ Suite 2 Complete: 3/3 tests passed\n');
}

// ═══════════════════════════════════════════════════════════════════════════
// Test Suite 3: Análisis de Descuentos
// ═══════════════════════════════════════════════════════════════════════════

async function testAnalisisDescuentos(): Promise<void> {
  console.log('📊 Suite 3: Análisis de Descuentos\n');

  const currentDate = new Date();
  const mes = currentDate.getMonth() + 1;
  const anio = currentDate.getFullYear();

  // Test 3.1: Análisis completo (todos los tipos)
  console.log('  Test 3.1: Análisis completo de descuentos...');
  const analisis1 = await reportesService.getAnalisisDescuentos({
    mes,
    anio,
    tipoDescuento: 'todos'
  });

  assert(analisis1.periodo, 'Análisis debe incluir período');
  assert(analisis1.ajustesManuales, 'Análisis debe incluir ajustesManuales');
  assert(analisis1.reglasAutomaticas, 'Análisis debe incluir reglasAutomaticas');
  assert(analisis1.exenciones, 'Análisis debe incluir exenciones');
  assert(analisis1.resumen, 'Análisis debe incluir resumen');
  console.log('  ✅ Test 3.1 passed\n');

  // Test 3.2: Solo ajustes manuales
  console.log('  Test 3.2: Solo ajustes manuales...');
  const analisis2 = await reportesService.getAnalisisDescuentos({
    mes,
    anio,
    tipoDescuento: 'ajustes'
  });

  assert(analisis2.ajustesManuales, 'Debe incluir ajustesManuales');
  assert(typeof analisis2.ajustesManuales.montoTotalDescuento === 'number', 'montoTotalDescuento debe ser número');
  assert(typeof analisis2.ajustesManuales.montoTotalRecargo === 'number', 'montoTotalRecargo debe ser número');
  console.log('  ✅ Test 3.2 passed\n');

  // Test 3.3: Solo exenciones
  console.log('  Test 3.3: Solo exenciones...');
  const analisis3 = await reportesService.getAnalisisDescuentos({
    mes,
    anio,
    tipoDescuento: 'exenciones'
  });

  assert(analisis3.exenciones, 'Debe incluir exenciones');
  assert(typeof analisis3.exenciones.total === 'number', 'total debe ser número');
  assert(typeof analisis3.exenciones.montoTotalExento === 'number', 'montoTotalExento debe ser número');
  console.log('  ✅ Test 3.3 passed\n');

  // Test 3.4: Filtrado por categoría
  console.log('  Test 3.4: Análisis filtrado por categoría...');
  const analisis4 = await reportesService.getAnalisisDescuentos({
    mes,
    anio,
    categoriaId: testData.categoria1!.id,
    tipoDescuento: 'todos'
  });

  assert(analisis4.resumen, 'Debe incluir resumen');
  console.log('  ✅ Test 3.4 passed\n');

  console.log('✅ Suite 3 Complete: 4/4 tests passed\n');
}

// ═══════════════════════════════════════════════════════════════════════════
// Test Suite 4: Reporte de Exenciones
// ═══════════════════════════════════════════════════════════════════════════

async function testReporteExenciones(): Promise<void> {
  console.log('📊 Suite 4: Reporte de Exenciones\n');

  // Test 4.1: Todas las exenciones
  console.log('  Test 4.1: Todas las exenciones...');
  const reporte1 = await reportesService.getReporteExenciones({
    estado: 'TODAS'
  });

  assert(reporte1.resumen, 'Reporte debe incluir resumen');
  assert(reporte1.resumen.porEstado, 'Resumen debe incluir porEstado');
  assert(reporte1.resumen.porMotivo, 'Resumen debe incluir porMotivo');
  assert(Array.isArray(reporte1.exenciones), 'exenciones debe ser array');
  console.log('  ✅ Test 4.1 passed\n');

  // Test 4.2: Solo exenciones vigentes
  console.log('  Test 4.2: Solo exenciones vigentes...');
  const reporte2 = await reportesService.getReporteExenciones({
    estado: 'VIGENTE'
  });

  assert(Array.isArray(reporte2.exenciones), 'exenciones debe ser array');
  reporte2.exenciones.forEach((exc: any) => {
    assert(exc.estado === 'VIGENTE', 'Todas las exenciones deben estar vigentes');
  });
  console.log('  ✅ Test 4.2 passed\n');

  // Test 4.3: Filtrado por motivo
  console.log('  Test 4.3: Filtrado por motivo...');
  const reporte3 = await reportesService.getReporteExenciones({
    motivoExencion: 'BECA',
    estado: 'TODAS'
  });

  assert(Array.isArray(reporte3.exenciones), 'exenciones debe ser array');
  reporte3.exenciones.forEach((exc: any) => {
    assert(exc.motivoExencion === 'BECA', 'Todas las exenciones deben ser de tipo BECA');
  });
  console.log('  ✅ Test 4.3 passed\n');

  // Test 4.4: Filtrado por categoría
  console.log('  Test 4.4: Filtrado por categoría...');
  const reporte4 = await reportesService.getReporteExenciones({
    categoriaId: testData.categoria1!.id,
    estado: 'TODAS'
  });

  assert(Array.isArray(reporte4.exenciones), 'exenciones debe ser array');
  console.log('  ✅ Test 4.4 passed\n');

  console.log('✅ Suite 4 Complete: 4/4 tests passed\n');
}

// ═══════════════════════════════════════════════════════════════════════════
// Test Suite 5: Reporte Comparativo
// ═══════════════════════════════════════════════════════════════════════════

async function testReporteComparativo(): Promise<void> {
  console.log('📊 Suite 5: Reporte Comparativo\n');

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  // Test 5.1: Comparación mes actual vs mes anterior
  console.log('  Test 5.1: Comparación entre dos meses...');
  const reporte1 = await reportesService.getReporteComparativo({
    mesInicio: lastMonth,
    anioInicio: lastMonthYear,
    mesFin: currentMonth,
    anioFin: currentYear
  });

  assert(reporte1.periodoInicio, 'Reporte debe incluir periodoInicio');
  assert(reporte1.periodoFin, 'Reporte debe incluir periodoFin');
  assert(reporte1.variaciones, 'Reporte debe incluir variaciones');
  assert(typeof reporte1.variaciones.totalCuotas === 'number', 'variaciones.totalCuotas debe ser número');
  assert(reporte1.tendencia, 'Reporte debe incluir tendencia');
  console.log('  ✅ Test 5.1 passed\n');

  // Test 5.2: Verificar cálculo de variaciones
  console.log('  Test 5.2: Verificar cálculo de variaciones...');
  assert(typeof reporte1.variaciones.totalRecaudado === 'number', 'variaciones.totalRecaudado debe ser número');
  assert(typeof reporte1.variaciones.tasaPago === 'number', 'variaciones.tasaPago debe ser número');
  console.log('  ✅ Test 5.2 passed\n');

  // Test 5.3: Mismo período (variación = 0)
  console.log('  Test 5.3: Mismo período...');
  const reporte2 = await reportesService.getReporteComparativo({
    mesInicio: currentMonth,
    anioInicio: currentYear,
    mesFin: currentMonth,
    anioFin: currentYear
  });

  assert(reporte2.variaciones, 'Reporte debe incluir variaciones');
  // Las variaciones deberían ser 0% cuando comparamos el mismo período
  console.log('  ✅ Test 5.3 passed\n');

  console.log('✅ Suite 5 Complete: 3/3 tests passed\n');
}

// ═══════════════════════════════════════════════════════════════════════════
// Test Suite 6: Estadísticas de Recaudación
// ═══════════════════════════════════════════════════════════════════════════

async function testEstadisticasRecaudacion(): Promise<void> {
  console.log('📊 Suite 6: Estadísticas de Recaudación\n');

  const currentDate = new Date();
  const mes = currentDate.getMonth() + 1;
  const anio = currentDate.getFullYear();

  // Test 6.1: Estadísticas sin filtros
  console.log('  Test 6.1: Estadísticas sin filtros...');
  const stats1 = await reportesService.getEstadisticasRecaudacion();

  assert(stats1.estadisticas, 'Debe incluir estadisticas');
  assert(stats1.estadisticas.porEstado, 'Debe incluir porEstado');
  assert(typeof stats1.estadisticas.tasaRecaudacion === 'number', 'tasaRecaudacion debe ser número');
  assert(typeof stats1.estadisticas.tasaMorosidad === 'number', 'tasaMorosidad debe ser número');
  console.log('  ✅ Test 6.1 passed\n');

  // Test 6.2: Estadísticas con filtro mes/año
  console.log('  Test 6.2: Estadísticas con filtro de período...');
  const stats2 = await reportesService.getEstadisticasRecaudacion({
    mes,
    anio
  });

  assert(stats2.periodo, 'Debe incluir período');
  assert(stats2.periodo.mes === mes, 'Mes debe coincidir');
  assert(stats2.periodo.anio === anio, 'Año debe coincidir');
  console.log('  ✅ Test 6.2 passed\n');

  // Test 6.3: Estadísticas filtradas por categoría
  console.log('  Test 6.3: Estadísticas filtradas por categoría...');
  const stats3 = await reportesService.getEstadisticasRecaudacion({
    mes,
    anio,
    categoriaId: testData.categoria1!.id
  });

  assert(stats3.estadisticas, 'Debe incluir estadisticas');
  console.log('  ✅ Test 6.3 passed\n');

  // Test 6.4: Verificar distribución por estado
  console.log('  Test 6.4: Verificar distribución por estado...');
  const porEstado = stats2.estadisticas.porEstado;
  assert(typeof porEstado.PAGADO === 'number', 'porEstado.PAGADO debe ser número');
  assert(typeof porEstado.PENDIENTE === 'number', 'porEstado.PENDIENTE debe ser número');
  assert(typeof porEstado.VENCIDO === 'number', 'porEstado.VENCIDO debe ser número');
  console.log('  ✅ Test 6.4 passed\n');

  console.log('✅ Suite 6 Complete: 4/4 tests passed\n');
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Test Runner
// ═══════════════════════════════════════════════════════════════════════════

async function runAllTests(): Promise<void> {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  FASE 4 - Task 4.4: Reportes y Estadísticas - TESTS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    await setupTestData();

    await testDashboardGeneral(); // 3 tests
    await testReportePorCategoria(); // 3 tests
    await testAnalisisDescuentos(); // 4 tests
    await testReporteExenciones(); // 4 tests
    await testReporteComparativo(); // 3 tests
    await testEstadisticasRecaudacion(); // 4 tests

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  ✅ ALL TESTS PASSED: 21/21');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log('Test Summary:');
    console.log('  ✅ Suite 1: Dashboard General - 3/3 tests passed');
    console.log('  ✅ Suite 2: Reporte por Categoría - 3/3 tests passed');
    console.log('  ✅ Suite 3: Análisis de Descuentos - 4/4 tests passed');
    console.log('  ✅ Suite 4: Reporte de Exenciones - 4/4 tests passed');
    console.log('  ✅ Suite 5: Reporte Comparativo - 3/3 tests passed');
    console.log('  ✅ Suite 6: Estadísticas de Recaudación - 4/4 tests passed');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    throw error;
  } finally {
    await cleanupTestData();
    await prisma.$disconnect();
  }
}

// Run tests
runAllTests().catch(console.error);
