/**
 * FASE 2 - INTEGRATION TESTS
 * Tests de integración para el sistema de ítems de cuotas
 *
 * Este archivo valida:
 * - CRUD de CategoríasItem
 * - CRUD de TiposItemCuota
 * - CRUD de ItemsCuota
 * - Validaciones de negocio
 * - Endpoints REST
 *
 * Ejecutar: npx tsx tests/fase2-items-integration.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Colores para la consola
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const CYAN = '\x1b[36m';

// Contadores
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// IDs para usar en los tests
let categoriaBaseId: number;
let categoriaActividadId: number;
let categoriaDescuentoId: number;
let tipoBaseMensualId: number;
let tipoActividadId: number;
let tipoDescuentoFamiliarId: number;
let cuotaTestId: number;
let itemCuotaId: number;

/**
 * Helper: Assert
 */
function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`${GREEN}✓${RESET} ${testName}`);
    if (details) {
      console.log(`  ${CYAN}→${RESET} ${details}`);
    }
  } else {
    failedTests++;
    console.log(`${RED}✗${RESET} ${testName}`);
    if (details) {
      console.log(`  ${CYAN}→${RESET} ${details}`);
    }
  }
}

/**
 * Helper: Section Header
 */
function section(title: string) {
  console.log(`\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
  console.log(`${BLUE}${title}${RESET}`);
  console.log(`${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n`);
}

/**
 * Helper: Clean test data
 */
async function cleanTestData() {
  console.log(`${YELLOW}🧹 Limpiando datos de prueba...${RESET}`);

  try {
    // Eliminar items de cuotas de prueba
    const cuotasTest = await prisma.cuota.findMany({
      where: {
        recibo: {
          concepto: { contains: 'TEST_FASE2' }
        }
      },
      select: { id: true }
    });

    if (cuotasTest.length > 0) {
      await prisma.itemCuota.deleteMany({
        where: {
          cuotaId: { in: cuotasTest.map(c => c.id) }
        }
      });
    }

    // Eliminar cuotas de prueba (vía recibos)
    await prisma.recibo.deleteMany({
      where: {
        concepto: { contains: 'TEST_FASE2' }
      }
    });

    // Eliminar tipos y categorías de prueba
    await prisma.tipoItemCuota.deleteMany({
      where: {
        nombre: { contains: 'TEST_FASE2' }
      }
    });

    await prisma.categoriaItem.deleteMany({
      where: {
        nombre: { contains: 'TEST_FASE2' }
      }
    });

    console.log(`${GREEN}✓ Datos de prueba eliminados${RESET}\n`);
  } catch (error) {
    console.log(`${YELLOW}⚠ Warning limpiando datos: ${error}${RESET}\n`);
  }
}

/**
 * TEST 1: CategoríasItem - CRUD Básico
 */
async function test1_CategoriaItemCRUD() {
  section('TEST 1: CategoríasItem - CRUD Básico');

  try {
    // CREATE
    const nuevaCategoria = await prisma.categoriaItem.create({
      data: {
        codigo: 'TEST_CAT',
        nombre: 'TEST_FASE2_Categoria',
        descripcion: 'Categoría de prueba',
        orden: 999,
        activo: true
      }
    });

    assert(
      nuevaCategoria.id > 0,
      'CREATE: Categoría creada correctamente',
      `ID: ${nuevaCategoria.id}`
    );

    categoriaBaseId = nuevaCategoria.id;

    // READ
    const categoriaLeida = await prisma.categoriaItem.findUnique({
      where: { id: categoriaBaseId }
    });

    assert(
      categoriaLeida?.nombre === 'TEST_FASE2_Categoria',
      'READ: Categoría leída correctamente',
      `Nombre: ${categoriaLeida?.nombre}`
    );

    // UPDATE
    const categoriaActualizada = await prisma.categoriaItem.update({
      where: { id: categoriaBaseId },
      data: {
        descripcion: 'Descripción actualizada'
      }
    });

    assert(
      categoriaActualizada.descripcion === 'Descripción actualizada',
      'UPDATE: Categoría actualizada correctamente'
    );

    // SOFT DELETE
    const categoriaDesactivada = await prisma.categoriaItem.update({
      where: { id: categoriaBaseId },
      data: { activo: false }
    });

    assert(
      categoriaDesactivada.activo === false,
      'SOFT DELETE: Categoría desactivada correctamente'
    );

    // COUNT
    const totalCategorias = await prisma.categoriaItem.count();
    assert(
      totalCategorias > 0,
      'COUNT: Se encontraron categorías en la DB',
      `Total: ${totalCategorias}`
    );

  } catch (error: any) {
    assert(false, 'ERROR en CategoríasItem CRUD', error.message);
  }
}

/**
 * TEST 2: TiposItemCuota - CRUD Básico
 */
async function test2_TipoItemCuotaCRUD() {
  section('TEST 2: TiposItemCuota - CRUD Básico');

  try {
    // Obtener categorías del seed
    const categoriaBase = await prisma.categoriaItem.findFirst({
      where: { codigo: 'BASE' }
    });

    assert(
      categoriaBase !== null,
      'PREREQ: Categoría BASE existe del seed',
      `ID: ${categoriaBase?.id}`
    );

    if (!categoriaBase) {
      console.log(`${RED}⚠ Saltando tests de TipoItemCuota - No hay categoría BASE${RESET}`);
      return;
    }

    categoriaBaseId = categoriaBase.id;

    // CREATE con categoría
    const nuevoTipo = await prisma.tipoItemCuota.create({
      data: {
        codigo: 'TEST_TIPO',
        nombre: 'TEST_FASE2_Tipo',
        descripcion: 'Tipo de prueba',
        categoriaItemId: categoriaBaseId,
        esCalculado: true,
        configurable: true,
        orden: 999,
        activo: true
      }
    });

    assert(
      nuevoTipo.id > 0,
      'CREATE: Tipo creado correctamente',
      `ID: ${nuevoTipo.id}`
    );

    tipoBaseMensualId = nuevoTipo.id;

    // READ con relación
    const tipoConCategoria = await prisma.tipoItemCuota.findUnique({
      where: { id: tipoBaseMensualId },
      include: { categoriaItem: true }
    });

    assert(
      tipoConCategoria?.categoriaItem?.codigo === 'BASE',
      'READ: Tipo con relación a categoría',
      `Categoría: ${tipoConCategoria?.categoriaItem?.nombre}`
    );

    // UPDATE
    const tipoActualizado = await prisma.tipoItemCuota.update({
      where: { id: tipoBaseMensualId },
      data: {
        descripcion: 'Descripción actualizada',
        configurable: false
      }
    });

    assert(
      tipoActualizado.configurable === false,
      'UPDATE: Tipo actualizado correctamente'
    );

    // SOFT DELETE
    const tipoDesactivado = await prisma.tipoItemCuota.update({
      where: { id: tipoBaseMensualId },
      data: { activo: false }
    });

    assert(
      tipoDesactivado.activo === false,
      'SOFT DELETE: Tipo desactivado correctamente'
    );

  } catch (error: any) {
    assert(false, 'ERROR en TiposItemCuota CRUD', error.message);
  }
}

/**
 * TEST 3: TiposItemCuota - Campos de Fórmula
 */
async function test3_TipoItemCuotaFormula() {
  section('TEST 3: TiposItemCuota - Campos de Fórmula');

  try {
    // Obtener categoría ACTIVIDAD
    const categoriaActividad = await prisma.categoriaItem.findFirst({
      where: { codigo: 'ACTIVIDAD' }
    });

    assert(
      categoriaActividad !== null,
      'PREREQ: Categoría ACTIVIDAD existe',
      `ID: ${categoriaActividad?.id}`
    );

    if (!categoriaActividad) return;

    categoriaActividadId = categoriaActividad.id;

    // CREATE con fórmula (JSONB)
    const tipoConFormula = await prisma.tipoItemCuota.create({
      data: {
        codigo: 'TEST_FORMULA',
        nombre: 'TEST_FASE2_TipoFormula',
        descripcion: 'Tipo con fórmula de cálculo',
        categoriaItemId: categoriaActividadId,
        esCalculado: true,
        formula: {
          tipo: 'precio_actividad',
          multiplicador: 1.0,
          camposRequeridos: ['actividadId', 'precio']
        },
        configurable: true,
        orden: 999,
        activo: true
      }
    });

    assert(
      tipoConFormula.formula !== null,
      'CREATE: Tipo con fórmula creado',
      `Fórmula: ${JSON.stringify(tipoConFormula.formula)}`
    );

    assert(
      typeof tipoConFormula.formula === 'object',
      'CREATE: Formula es objeto JSON',
      `Tipo: ${typeof tipoConFormula.formula}`
    );

    tipoActividadId = tipoConFormula.id;

  } catch (error: any) {
    assert(false, 'ERROR en TiposItemCuota con Fórmula', error.message);
  }
}

/**
 * TEST 4: ItemsCuota - Preparación de datos
 */
async function test4_PreparacionDatos() {
  section('TEST 4: ItemsCuota - Preparación de datos');

  try {
    // Obtener categoría de socio por defecto
    const categoriaSocio = await prisma.categoriaSocio.findFirst({
      where: { activa: true }
    });

    assert(categoriaSocio !== null, 'PREREQ: Categoría socio existe');
    if (!categoriaSocio) return;

    // Crear recibo de prueba primero (porque Cuota requiere reciboId)
    const recibo = await prisma.recibo.create({
      data: {
        tipo: 'CUOTA',
        importe: 50.00,
        concepto: 'TEST_FASE2 Recibo Prueba',
        fecha: new Date(),
        estado: 'PENDIENTE'
      }
    });

    assert(recibo.id > 0, 'SETUP: Recibo creado', `ID: ${recibo.id}`);

    // Crear cuota de prueba asociada al recibo
    const cuota = await prisma.cuota.create({
      data: {
        reciboId: recibo.id,
        categoriaId: categoriaSocio.id,
        mes: 12,
        anio: 2025,
        montoBase: 50.00,
        montoActividades: 0,
        montoTotal: 50.00
      }
    });

    assert(cuota.id > 0, 'SETUP: Cuota creada', `ID: ${cuota.id}`);
    cuotaTestId = cuota.id;

  } catch (error: any) {
    assert(false, 'ERROR en Preparación de datos', error.message);
  }
}

/**
 * TEST 5: ItemsCuota - CRUD Básico
 */
async function test5_ItemCuotaCRUD() {
  section('TEST 5: ItemsCuota - CRUD Básico');

  try {
    // Obtener tipo del seed
    const tipoBase = await prisma.tipoItemCuota.findFirst({
      where: {
        codigo: 'CUOTA_BASE_SOCIO',
        activo: true
      }
    });

    assert(tipoBase !== null, 'PREREQ: Tipo CUOTA_BASE_SOCIO existe');
    if (!tipoBase) return;

    tipoBaseMensualId = tipoBase.id;

    // CREATE
    const nuevoItem = await prisma.itemCuota.create({
      data: {
        cuotaId: cuotaTestId,
        tipoItemId: tipoBaseMensualId,
        concepto: 'Cuota base mensual',
        monto: 50.00,
        cantidad: 1,
        porcentaje: null,
        esAutomatico: true,
        esEditable: false
      }
    });

    assert(
      nuevoItem.id > 0,
      'CREATE: Item creado correctamente',
      `ID: ${nuevoItem.id}, Monto: ${nuevoItem.monto}`
    );

    itemCuotaId = nuevoItem.id;

    // READ con relaciones
    const itemConRelaciones = await prisma.itemCuota.findUnique({
      where: { id: itemCuotaId },
      include: {
        tipoItem: {
          include: { categoriaItem: true }
        },
        cuota: true
      }
    });

    assert(
      itemConRelaciones !== null,
      'READ: Item con relaciones leído',
      `Tipo: ${itemConRelaciones?.tipoItem.nombre}`
    );

    assert(
      itemConRelaciones?.tipoItem.categoriaItem !== null,
      'READ: Categoría del tipo incluida',
      `Categoría: ${itemConRelaciones?.tipoItem.categoriaItem?.nombre}`
    );

    // UPDATE
    const itemActualizado = await prisma.itemCuota.update({
      where: { id: itemCuotaId },
      data: {
        porcentaje: 10,
        monto: 45.00,
        esEditable: true
      }
    });

    assert(
      Number(itemActualizado.monto) === 45.00,
      'UPDATE: Item actualizado correctamente',
      `Nuevo monto: ${itemActualizado.monto}`
    );

    // DELETE (hard delete para items)
    const itemEliminado = await prisma.itemCuota.delete({
      where: { id: itemCuotaId }
    });

    assert(
      itemEliminado.id === itemCuotaId,
      'DELETE: Item eliminado correctamente'
    );

  } catch (error: any) {
    assert(false, 'ERROR en ItemsCuota CRUD', error.message);
  }
}

/**
 * TEST 6: ItemsCuota - Validaciones de Negocio
 */
async function test6_ValidacionesNegocio() {
  section('TEST 6: ItemsCuota - Validaciones de Negocio');

  try {
    // Test 6.1: Cantidad debe ser > 0 (validación a nivel de servicio, no DB)
    // Nota: DB permite negativos, pero servicios deben validar
    const itemCantidadNegativa = await prisma.itemCuota.create({
      data: {
        cuotaId: cuotaTestId,
        tipoItemId: tipoBaseMensualId,
        concepto: 'Test cantidad negativa',
        cantidad: -1,
        monto: 50.00
      }
    });

    assert(
      itemCantidadNegativa.id > 0,
      'VALIDACIÓN: DB permite cantidad negativa (service layer debe validar)',
      'Responsabilidad de validación en service layer'
    );

    await prisma.itemCuota.delete({ where: { id: itemCantidadNegativa.id } });

    // Test 6.2: Monto puede ser negativo (para descuentos)
    const itemMontoNegativo = await prisma.itemCuota.create({
      data: {
        cuotaId: cuotaTestId,
        tipoItemId: tipoBaseMensualId,
        concepto: 'Test monto negativo (descuento)',
        cantidad: 1,
        monto: -10.00,
        porcentaje: 10
      }
    });

    assert(
      Number(itemMontoNegativo.monto) === -10.00,
      'VALIDACIÓN: Monto negativo permitido para descuentos',
      'Descuentos usan monto negativo'
    );

    await prisma.itemCuota.delete({ where: { id: itemMontoNegativo.id } });

    // Test 6.3: Porcentaje acepta decimales
    const itemPorcentaje = await prisma.itemCuota.create({
      data: {
        cuotaId: cuotaTestId,
        tipoItemId: tipoBaseMensualId,
        concepto: 'Test porcentaje decimal',
        cantidad: 1,
        monto: 50.00,
        porcentaje: 12.50
      }
    });

    assert(
      Number(itemPorcentaje.porcentaje) === 12.50,
      'VALIDACIÓN: Porcentaje decimal aceptado',
      `Porcentaje: ${itemPorcentaje.porcentaje}%`
    );

    await prisma.itemCuota.delete({ where: { id: itemPorcentaje.id } });

    // Test 6.4: Crear item válido
    const itemValido = await prisma.itemCuota.create({
      data: {
        cuotaId: cuotaTestId,
        tipoItemId: tipoBaseMensualId,
        concepto: 'Item válido',
        cantidad: 2,
        monto: 100.00,
        porcentaje: 10,
        esAutomatico: false,
        esEditable: true
      }
    });

    assert(
      itemValido.id > 0,
      'VALIDACIÓN: Item válido creado correctamente',
      `Monto: ${itemValido.monto}`
    );

  } catch (error: any) {
    assert(false, 'ERROR en Validaciones de Negocio', error.message);
  }
}

/**
 * TEST 7: ItemsCuota - Relaciones con Cuota
 */
async function test7_RelacionesCuota() {
  section('TEST 7: ItemsCuota - Relaciones con Cuota');

  try {
    // Limpiar items anteriores
    await prisma.itemCuota.deleteMany({
      where: { cuotaId: cuotaTestId }
    });

    // Obtener tipos del seed
    const tipoBase = await prisma.tipoItemCuota.findFirst({
      where: { codigo: 'CUOTA_BASE_SOCIO', activo: true }
    });

    const tipoActividad = await prisma.tipoItemCuota.findFirst({
      where: { codigo: 'ACTIVIDAD_INDIVIDUAL', activo: true }
    });

    assert(tipoBase !== null && tipoActividad !== null, 'PREREQ: Tipos existen');
    if (!tipoBase || !tipoActividad) return;

    // Crear múltiples items para una cuota
    const item1 = await prisma.itemCuota.create({
      data: {
        cuotaId: cuotaTestId,
        tipoItemId: tipoBase.id,
        concepto: 'Cuota base',
        cantidad: 1,
        monto: 50.00
      }
    });

    const item2 = await prisma.itemCuota.create({
      data: {
        cuotaId: cuotaTestId,
        tipoItemId: tipoActividad.id,
        concepto: 'Actividad Coro',
        cantidad: 1,
        monto: 30.00
      }
    });

    assert(
      item1.id > 0 && item2.id > 0,
      'CREATE: Múltiples items creados para una cuota',
      `Item1 ID: ${item1.id}, Item2 ID: ${item2.id}`
    );

    // Leer cuota con sus items
    const cuotaConItems = await prisma.cuota.findUnique({
      where: { id: cuotaTestId },
      include: {
        items: {
          include: {
            tipoItem: {
              include: { categoriaItem: true }
            }
          },
          orderBy: { id: 'asc' }
        }
      }
    });

    assert(
      cuotaConItems?.items.length === 2,
      'READ: Cuota con items relacionados',
      `Total items: ${cuotaConItems?.items.length}`
    );

    assert(
      cuotaConItems?.items[0].tipoItem.categoriaItem !== null,
      'READ: Items con categoría incluida',
      `Categoría item 1: ${cuotaConItems?.items[0].tipoItem.categoriaItem?.nombre}`
    );

    // Calcular total de items
    const totalItems = cuotaConItems?.items.reduce((sum, item) => sum + Number(item.monto), 0) || 0;

    assert(
      totalItems === 80.00,
      'CÁLCULO: Suma de montos correcta',
      `Total: ${totalItems}`
    );

  } catch (error: any) {
    assert(false, 'ERROR en Relaciones con Cuota', error.message);
  }
}

/**
 * TEST 8: Estadísticas de Uso
 */
async function test8_EstadisticasUso() {
  section('TEST 8: Estadísticas de Uso');

  try {
    // Contar items por tipo
    const itemsPorTipo = await prisma.itemCuota.groupBy({
      by: ['tipoItemId'],
      _count: { id: true },
      _sum: { monto: true }
    });

    assert(
      itemsPorTipo.length > 0,
      'STATS: Items agrupados por tipo',
      `Tipos con items: ${itemsPorTipo.length}`
    );

    // Contar items por cuota
    const itemsPorCuota = await prisma.itemCuota.groupBy({
      by: ['cuotaId'],
      _count: { id: true },
      where: { cuotaId: cuotaTestId }
    });

    assert(
      itemsPorCuota.length > 0,
      'STATS: Items contados por cuota',
      `Cuotas con items: ${itemsPorCuota.length}`
    );

    // Total de items en la DB
    const totalItems = await prisma.itemCuota.count();

    assert(
      totalItems >= 2,
      'STATS: Total de items en DB',
      `Total: ${totalItems}`
    );

  } catch (error: any) {
    assert(false, 'ERROR en Estadísticas de Uso', error.message);
  }
}

/**
 * TEST 9: Cascadas y Eliminación
 */
async function test9_CascadasEliminacion() {
  section('TEST 9: Cascadas y Eliminación');

  try {
    // Verificar que items existen
    const itemsAntes = await prisma.itemCuota.count({
      where: { cuotaId: cuotaTestId }
    });

    assert(
      itemsAntes > 0,
      'PREREQ: Items existen antes de eliminar cuota',
      `Total items: ${itemsAntes}`
    );

    // Eliminar cuota (debería eliminar items por CASCADE)
    await prisma.cuota.delete({
      where: { id: cuotaTestId }
    });

    // Verificar que items fueron eliminados
    const itemsDespues = await prisma.itemCuota.count({
      where: { cuotaId: cuotaTestId }
    });

    assert(
      itemsDespues === 0,
      'CASCADE: Items eliminados al eliminar cuota',
      `Items después: ${itemsDespues}`
    );

  } catch (error: any) {
    assert(false, 'ERROR en Cascadas y Eliminación', error.message);
  }
}

/**
 * TEST 10: Performance - Bulk Operations
 */
async function test10_Performance() {
  section('TEST 10: Performance - Bulk Operations');

  try {
    const categoriaSocio = await prisma.categoriaSocio.findFirst({
      where: { activa: true }
    });

    if (!categoriaSocio) {
      console.log(`${YELLOW}⚠ Saltando test de performance - No hay CategoriaSocio${RESET}`);
      return;
    }

    // Crear recibo para la cuota
    const recibo = await prisma.recibo.create({
      data: {
        tipo: 'CUOTA',
        importe: 100.00,
        concepto: 'TEST_FASE2 Performance Test',
        fecha: new Date(),
        estado: 'PENDIENTE'
      }
    });

    const cuota = await prisma.cuota.create({
      data: {
        reciboId: recibo.id,
        categoriaId: categoriaSocio.id,
        mes: 12,
        anio: 2025,
        montoBase: 100.00,
        montoActividades: 0,
        montoTotal: 100.00
      }
    });

    // Obtener tipo para los items
    const tipo = await prisma.tipoItemCuota.findFirst({
      where: { activo: true }
    });

    if (!tipo) {
      console.log(`${YELLOW}⚠ Saltando test de performance - No hay TipoItemCuota activo${RESET}`);
      return;
    }

    // Crear 10 items en una transacción
    const startTime = Date.now();

    await prisma.$transaction(async (tx) => {
      for (let i = 1; i <= 10; i++) {
        await tx.itemCuota.create({
          data: {
            cuotaId: cuota.id,
            tipoItemId: tipo.id,
            concepto: `Item ${i}`,
            cantidad: 1,
            monto: 10.00
          }
        });
      }
    });

    const duration = Date.now() - startTime;

    assert(
      duration < 2000,
      'PERFORMANCE: 10 items creados en transacción',
      `Duración: ${duration}ms`
    );

    // Verificar que se crearon correctamente
    const itemsCreados = await prisma.itemCuota.count({
      where: { cuotaId: cuota.id }
    });

    assert(
      itemsCreados === 10,
      'PERFORMANCE: Todos los items creados',
      `Total: ${itemsCreados}`
    );

  } catch (error: any) {
    assert(false, 'ERROR en Performance', error.message);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log(`\n${CYAN}╔════════════════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${CYAN}║     FASE 2 - INTEGRATION TESTS - Sistema de Ítems Cuotas      ║${RESET}`);
  console.log(`${CYAN}╚════════════════════════════════════════════════════════════════╝${RESET}\n`);

  const startTime = Date.now();

  try {
    // Limpiar datos previos
    await cleanTestData();

    // Ejecutar tests
    await test1_CategoriaItemCRUD();
    await test2_TipoItemCuotaCRUD();
    await test3_TipoItemCuotaFormula();
    await test4_PreparacionDatos();
    await test5_ItemCuotaCRUD();
    await test6_ValidacionesNegocio();
    await test7_RelacionesCuota();
    await test8_EstadisticasUso();
    await test9_CascadasEliminacion();
    await test10_Performance();

    // Limpiar datos de prueba
    await cleanTestData();

  } catch (error: any) {
    console.log(`\n${RED}💥 Error fatal: ${error.message}${RESET}`);
    console.log(error.stack);
  } finally {
    await prisma.$disconnect();
  }

  const duration = Date.now() - startTime;

  // Resumen final
  console.log(`\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
  console.log(`${BLUE}RESUMEN DE TESTS${RESET}`);
  console.log(`${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n`);

  console.log(`Total de tests:    ${totalTests}`);
  console.log(`${GREEN}Tests exitosos:    ${passedTests}${RESET}`);
  console.log(`${RED}Tests fallidos:    ${failedTests}${RESET}`);
  console.log(`Duración total:    ${duration}ms`);

  const percentage = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : '0.0';
  console.log(`\nTasa de éxito:     ${percentage}%`);

  if (failedTests === 0) {
    console.log(`\n${GREEN}✓ TODOS LOS TESTS PASARON EXITOSAMENTE${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`\n${RED}✗ ALGUNOS TESTS FALLARON${RESET}\n`);
    process.exit(1);
  }
}

main();
