/**
 * Tests para FASE 4 - Task 4.1: Ajustes Manuales por Socio
 *
 * Test suites:
 * 1. Setup y Teardown
 * 2. CRUD de Ajustes
 * 3. Validaciones de Negocio
 * 4. Cálculo de Ajustes
 * 5. Historial Automático
 * 6. Soft Delete
 * 7. Ajustes Múltiples Secuenciales
 * 8. Estadísticas
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { AjusteCuotaRepository } from '../src/repositories/ajuste-cuota.repository';
import { HistorialAjusteCuotaRepository } from '../src/repositories/historial-ajuste-cuota.repository';
import { PersonaRepository } from '../src/repositories/persona.repository';
import { AjusteCuotaService } from '../src/services/ajuste-cuota.service';

const prisma = new PrismaClient();

// Test data
let testPersona: any;
let testCategoria: any;
let testTipoSocio: any;
let ajusteRepository: AjusteCuotaRepository;
let historialRepository: HistorialAjusteCuotaRepository;
let personaRepository: PersonaRepository;
let ajusteService: AjusteCuotaService;

// Test results tracking
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [] as string[]
};

function assert(condition: boolean, message: string) {
  testResults.total++;
  if (condition) {
    testResults.passed++;
    console.log(`  ✅ ${message}`);
  } else {
    testResults.failed++;
    testResults.errors.push(message);
    console.log(`  ❌ ${message}`);
  }
}

// ══════════════════════════════════════════════════════════════════════
// 1. SETUP Y TEARDOWN
// ══════════════════════════════════════════════════════════════════════

async function setup() {
  console.log('\n🔧 Setup: Creando datos de prueba...\n');

  // Get TipoPersona SOCIO
  testTipoSocio = await prisma.tipoPersonaCatalogo.findFirst({
    where: { codigo: 'SOCIO' }
  });

  if (!testTipoSocio) {
    throw new Error('Tipo SOCIO no encontrado en catálogo');
  }

  // Create test categoria
  testCategoria = await prisma.categoriaSocio.create({
    data: {
      nombre: 'Test Categoria Ajustes',
      descripcion: 'Categoría para tests de ajustes manuales',
      codigo: `TEST-CAT-AJUSTES-${Date.now()}`,
      descuento: new Prisma.Decimal(0),
      montoCuota: new Prisma.Decimal(5000),
      activa: true,
      orden: 999
    }
  });

  // Create test persona
  testPersona = await prisma.persona.create({
    data: {
      dni: `TEST-DNI-AJUSTES-${Date.now()}`,
      nombre: 'Juan',
      apellido: 'Test Ajustes',
      fechaNacimiento: new Date('1990-01-01'),
      genero: 'MASCULINO',
      activo: true
    }
  });

  // Assign SOCIO type to persona
  await prisma.personaTipo.create({
    data: {
      personaId: testPersona.id,
      tipoPersonaId: testTipoSocio.id,
      categoriaId: testCategoria.id,
      numeroSocio: Math.floor(Date.now() / 1000),
      activo: true
    }
  });

  // Initialize repositories and service
  ajusteRepository = new AjusteCuotaRepository(prisma);
  historialRepository = new HistorialAjusteCuotaRepository(prisma);
  personaRepository = new PersonaRepository(prisma);
  ajusteService = new AjusteCuotaService(ajusteRepository, historialRepository, personaRepository);

  console.log('✅ Setup completado\n');
}

async function teardown() {
  console.log('\n🧹 Teardown: Limpiando datos de prueba...\n');

  // Delete in correct order (foreign keys)
  await prisma.historialAjusteCuota.deleteMany({
    where: { personaId: testPersona.id }
  });

  await prisma.ajusteCuotaSocio.deleteMany({
    where: { personaId: testPersona.id }
  });

  await prisma.personaTipo.deleteMany({
    where: { personaId: testPersona.id }
  });

  await prisma.persona.delete({
    where: { id: testPersona.id }
  });

  await prisma.categoriaSocio.delete({
    where: { id: testCategoria.id }
  });

  await prisma.$disconnect();

  console.log('✅ Teardown completado\n');
}

// ══════════════════════════════════════════════════════════════════════
// 2. CRUD DE AJUSTES
// ══════════════════════════════════════════════════════════════════════

async function testCRUDAjustes() {
  console.log('📦 Suite 2: CRUD de Ajustes\n');

  // Test 2.1: Crear ajuste descuento fijo
  const ajuste1 = await ajusteService.createAjuste({
    personaId: testPersona.id,
    tipoAjuste: 'DESCUENTO_FIJO',
    valor: 500,
    concepto: 'Descuento por situación económica',
    fechaInicio: new Date('2025-01-01'),
    fechaFin: new Date('2025-12-31'),
    activo: true,
    motivo: 'Aprobado por comisión',
    aplicaA: 'TODOS_ITEMS'
  }, 'test-user');

  assert(ajuste1.id > 0, 'Test 2.1: Crear ajuste descuento fijo');
  assert(ajuste1.tipoAjuste === 'DESCUENTO_FIJO', 'Test 2.1: Tipo de ajuste correcto');
  assert(Number(ajuste1.valor) === 500, 'Test 2.1: Valor correcto');

  // Test 2.2: Crear ajuste descuento porcentaje
  const ajuste2 = await ajusteService.createAjuste({
    personaId: testPersona.id,
    tipoAjuste: 'DESCUENTO_PORCENTAJE',
    valor: 15,
    concepto: 'Descuento porcentual',
    fechaInicio: new Date('2025-01-01'),
    activo: true,
    aplicaA: 'SOLO_BASE'
  }, 'test-user');

  assert(ajuste2.id > 0, 'Test 2.2: Crear ajuste descuento porcentaje');
  assert(Number(ajuste2.valor) === 15, 'Test 2.2: Porcentaje correcto');

  // Test 2.3: Obtener ajuste por ID
  const ajusteObtenido = await ajusteService.getAjusteById(ajuste1.id);
  assert(ajusteObtenido !== null, 'Test 2.3: Obtener ajuste por ID');
  assert(ajusteObtenido?.id === ajuste1.id, 'Test 2.3: ID coincide');

  // Test 2.4: Listar ajustes por persona
  const ajustesPersona = await ajusteService.getAjustesByPersonaId(testPersona.id);
  assert(ajustesPersona.length >= 2, 'Test 2.4: Listar ajustes por persona');

  // Test 2.5: Actualizar ajuste
  const ajusteActualizado = await ajusteService.updateAjuste(
    ajuste1.id,
    {
      valor: 600,
      concepto: 'Descuento actualizado'
    },
    'test-user'
  );
  assert(Number(ajusteActualizado.valor) === 600, 'Test 2.5: Actualizar valor de ajuste');
  assert(ajusteActualizado.concepto === 'Descuento actualizado', 'Test 2.5: Actualizar concepto');

  // Test 2.6: Filtrar ajustes por tipo
  const ajustesDescuento = await ajusteService.getAjustes({
    personaId: testPersona.id,
    tipoAjuste: 'DESCUENTO_FIJO'
  });
  assert(ajustesDescuento.length >= 1, 'Test 2.6: Filtrar por tipo de ajuste');

  console.log('');
}

// ══════════════════════════════════════════════════════════════════════
// 3. VALIDACIONES DE NEGOCIO
// ══════════════════════════════════════════════════════════════════════

async function testValidaciones() {
  console.log('🔒 Suite 3: Validaciones de Negocio\n');

  // Test 3.1: Validar porcentaje > 100
  try {
    await ajusteService.createAjuste({
      personaId: testPersona.id,
      tipoAjuste: 'DESCUENTO_PORCENTAJE',
      valor: 150, // Invalid!
      concepto: 'Descuento inválido',
      fechaInicio: new Date(),
      activo: true,
      aplicaA: 'TODOS_ITEMS'
    });
    assert(false, 'Test 3.1: Debe rechazar porcentaje > 100');
  } catch (error) {
    assert(true, 'Test 3.1: Rechaza porcentaje > 100');
  }

  // Test 3.2: Validar fechaFin < fechaInicio
  try {
    await ajusteService.createAjuste({
      personaId: testPersona.id,
      tipoAjuste: 'DESCUENTO_FIJO',
      valor: 100,
      concepto: 'Fechas inválidas',
      fechaInicio: new Date('2025-12-31'),
      fechaFin: new Date('2025-01-01'), // Before inicio!
      activo: true,
      aplicaA: 'TODOS_ITEMS'
    });
    assert(false, 'Test 3.2: Debe rechazar fechaFin < fechaInicio');
  } catch (error) {
    assert(true, 'Test 3.2: Rechaza fechaFin < fechaInicio');
  }

  // Test 3.3: Validar persona inexistente
  try {
    await ajusteService.createAjuste({
      personaId: 999999, // Non-existent
      tipoAjuste: 'DESCUENTO_FIJO',
      valor: 100,
      concepto: 'Persona inexistente',
      fechaInicio: new Date(),
      activo: true,
      aplicaA: 'TODOS_ITEMS'
    });
    assert(false, 'Test 3.3: Debe rechazar persona inexistente');
  } catch (error) {
    assert(true, 'Test 3.3: Rechaza persona inexistente');
  }

  // Test 3.4: Validar persona inactiva
  const personaInactiva = await prisma.persona.create({
    data: {
      dni: `INACTIVE-${Date.now()}`,
      nombre: 'Inactivo',
      apellido: 'Test',
      activo: false
    }
  });

  try {
    await ajusteService.createAjuste({
      personaId: personaInactiva.id,
      tipoAjuste: 'DESCUENTO_FIJO',
      valor: 100,
      concepto: 'Persona inactiva',
      fechaInicio: new Date(),
      activo: true,
      aplicaA: 'TODOS_ITEMS'
    });
    assert(false, 'Test 3.4: Debe rechazar persona inactiva');
  } catch (error) {
    assert(true, 'Test 3.4: Rechaza persona inactiva');
  } finally {
    await prisma.persona.delete({ where: { id: personaInactiva.id } });
  }

  console.log('');
}

// ══════════════════════════════════════════════════════════════════════
// 4. CÁLCULO DE AJUSTES
// ══════════════════════════════════════════════════════════════════════

async function testCalculoAjustes() {
  console.log('🧮 Suite 4: Cálculo de Ajustes\n');

  const montoOriginal = 5000;

  // Test 4.1: Descuento fijo
  const ajusteFijo = await ajusteService.createAjuste({
    personaId: testPersona.id,
    tipoAjuste: 'DESCUENTO_FIJO',
    valor: 500,
    concepto: 'Test descuento fijo',
    fechaInicio: new Date(),
    activo: true,
    aplicaA: 'TODOS_ITEMS'
  });

  const resultadoFijo = ajusteService.calcularAjuste(ajusteFijo, montoOriginal);
  assert(resultadoFijo.ajuste === -500, 'Test 4.1: Descuento fijo - ajuste correcto');
  assert(resultadoFijo.montoFinal === 4500, 'Test 4.1: Descuento fijo - monto final correcto');

  // Test 4.2: Descuento porcentaje
  const ajustePorcentaje = await ajusteService.createAjuste({
    personaId: testPersona.id,
    tipoAjuste: 'DESCUENTO_PORCENTAJE',
    valor: 20,
    concepto: 'Test descuento 20%',
    fechaInicio: new Date(),
    activo: true,
    aplicaA: 'TODOS_ITEMS'
  });

  const resultadoPorcentaje = ajusteService.calcularAjuste(ajustePorcentaje, montoOriginal);
  assert(resultadoPorcentaje.ajuste === -1000, 'Test 4.2: Descuento 20% - ajuste correcto');
  assert(resultadoPorcentaje.montoFinal === 4000, 'Test 4.2: Descuento 20% - monto final correcto');

  // Test 4.3: Recargo fijo
  const ajusteRecargoFijo = await ajusteService.createAjuste({
    personaId: testPersona.id,
    tipoAjuste: 'RECARGO_FIJO',
    valor: 300,
    concepto: 'Test recargo fijo',
    fechaInicio: new Date(),
    activo: true,
    aplicaA: 'TODOS_ITEMS'
  });

  const resultadoRecargoFijo = ajusteService.calcularAjuste(ajusteRecargoFijo, montoOriginal);
  assert(resultadoRecargoFijo.ajuste === 300, 'Test 4.3: Recargo fijo - ajuste correcto');
  assert(resultadoRecargoFijo.montoFinal === 5300, 'Test 4.3: Recargo fijo - monto final correcto');

  // Test 4.4: Recargo porcentaje
  const ajusteRecargoPorcentaje = await ajusteService.createAjuste({
    personaId: testPersona.id,
    tipoAjuste: 'RECARGO_PORCENTAJE',
    valor: 10,
    concepto: 'Test recargo 10%',
    fechaInicio: new Date(),
    activo: true,
    aplicaA: 'TODOS_ITEMS'
  });

  const resultadoRecargoPorcentaje = ajusteService.calcularAjuste(ajusteRecargoPorcentaje, montoOriginal);
  assert(resultadoRecargoPorcentaje.ajuste === 500, 'Test 4.4: Recargo 10% - ajuste correcto');
  assert(resultadoRecargoPorcentaje.montoFinal === 5500, 'Test 4.4: Recargo 10% - monto final correcto');

  // Test 4.5: Monto fijo total
  const ajusteMontoFijo = await ajusteService.createAjuste({
    personaId: testPersona.id,
    tipoAjuste: 'MONTO_FIJO_TOTAL',
    valor: 3000,
    concepto: 'Test monto fijo total',
    fechaInicio: new Date(),
    activo: true,
    aplicaA: 'TODOS_ITEMS'
  });

  const resultadoMontoFijo = ajusteService.calcularAjuste(ajusteMontoFijo, montoOriginal);
  assert(resultadoMontoFijo.ajuste === -2000, 'Test 4.5: Monto fijo - ajuste correcto');
  assert(resultadoMontoFijo.montoFinal === 3000, 'Test 4.5: Monto fijo - monto final correcto');

  console.log('');
}

// ══════════════════════════════════════════════════════════════════════
// 5. HISTORIAL AUTOMÁTICO
// ══════════════════════════════════════════════════════════════════════

async function testHistorial() {
  console.log('📜 Suite 5: Historial Automático\n');

  // Test 5.1: Crear ajuste genera historial
  const countBefore = await prisma.historialAjusteCuota.count({
    where: { personaId: testPersona.id, accion: 'CREAR_AJUSTE' }
  });

  const nuevoAjuste = await ajusteService.createAjuste({
    personaId: testPersona.id,
    tipoAjuste: 'DESCUENTO_FIJO',
    valor: 100,
    concepto: 'Test historial create',
    fechaInicio: new Date(),
    activo: true,
    aplicaA: 'TODOS_ITEMS'
  }, 'test-user-historial');

  const countAfter = await prisma.historialAjusteCuota.count({
    where: { personaId: testPersona.id, accion: 'CREAR_AJUSTE' }
  });

  assert(countAfter > countBefore, 'Test 5.1: Crear ajuste genera entrada en historial');

  // Test 5.2: Actualizar ajuste genera historial
  const countUpdateBefore = await prisma.historialAjusteCuota.count({
    where: { personaId: testPersona.id, accion: 'MODIFICAR_AJUSTE' }
  });

  await ajusteService.updateAjuste(nuevoAjuste.id, { valor: 200 }, 'test-user-update');

  const countUpdateAfter = await prisma.historialAjusteCuota.count({
    where: { personaId: testPersona.id, accion: 'MODIFICAR_AJUSTE' }
  });

  assert(countUpdateAfter > countUpdateBefore, 'Test 5.2: Actualizar ajuste genera entrada en historial');

  // Test 5.3: Historial contiene datos previos y nuevos
  const historial = await historialRepository.findByAjusteId(nuevoAjuste.id);
  const ultimaActualizacion = historial.find(h => h.accion === 'MODIFICAR_AJUSTE');

  assert(ultimaActualizacion !== undefined, 'Test 5.3: Historial contiene registro de actualización');
  assert(ultimaActualizacion?.datosPrevios !== null, 'Test 5.3: Historial contiene datos previos');
  assert(ultimaActualizacion?.datosNuevos !== null, 'Test 5.3: Historial contiene datos nuevos');

  // Test 5.4: Historial contiene usuario
  const ultimoRegistro = historial[0];
  assert(ultimoRegistro.usuario !== null, 'Test 5.4: Historial contiene usuario');

  console.log('');
}

// ══════════════════════════════════════════════════════════════════════
// 6. SOFT DELETE
// ══════════════════════════════════════════════════════════════════════

async function testSoftDelete() {
  console.log('🗑️  Suite 6: Soft Delete\n');

  // Test 6.1: Desactivar ajuste
  const ajuste = await ajusteService.createAjuste({
    personaId: testPersona.id,
    tipoAjuste: 'DESCUENTO_FIJO',
    valor: 100,
    concepto: 'Test soft delete',
    fechaInicio: new Date(),
    activo: true,
    aplicaA: 'TODOS_ITEMS'
  });

  assert(ajuste.activo === true, 'Test 6.1: Ajuste creado activo');

  const ajusteDesactivado = await ajusteService.deactivateAjuste(ajuste.id, 'test-user', 'Test');
  assert(ajusteDesactivado.activo === false, 'Test 6.1: Ajuste desactivado correctamente');

  // Test 6.2: Desactivar genera historial
  const historial = await historialRepository.findByAjusteId(ajuste.id);
  const registroEliminar = historial.find(h => h.accion === 'ELIMINAR_AJUSTE');
  assert(registroEliminar !== undefined, 'Test 6.2: Desactivar genera entrada ELIMINAR_AJUSTE en historial');

  // Test 6.3: Reactivar ajuste
  const ajusteReactivado = await ajusteService.activateAjuste(ajuste.id, 'test-user', 'Reactivación');
  assert(ajusteReactivado.activo === true, 'Test 6.3: Ajuste reactivado correctamente');

  // Test 6.4: Filtrar solo activos
  await ajusteService.deactivateAjuste(ajuste.id);
  const soloActivos = await ajusteService.getAjustesByPersonaId(testPersona.id, true);
  const ajusteEncontrado = soloActivos.find(a => a.id === ajuste.id);
  assert(ajusteEncontrado === undefined, 'Test 6.4: Filtro soloActivos excluye ajustes inactivos');

  console.log('');
}

// ══════════════════════════════════════════════════════════════════════
// 7. AJUSTES MÚLTIPLES SECUENCIALES
// ══════════════════════════════════════════════════════════════════════

async function testAjustesMultiples() {
  console.log('🔢 Suite 7: Ajustes Múltiples Secuenciales\n');

  const montoOriginal = 10000;

  // Create multiple adjustments
  const ajuste1 = await ajusteService.createAjuste({
    personaId: testPersona.id,
    tipoAjuste: 'DESCUENTO_PORCENTAJE',
    valor: 20,
    concepto: 'Descuento 20%',
    fechaInicio: new Date(),
    activo: true,
    aplicaA: 'TODOS_ITEMS'
  });

  const ajuste2 = await ajusteService.createAjuste({
    personaId: testPersona.id,
    tipoAjuste: 'DESCUENTO_FIJO',
    valor: 500,
    concepto: 'Descuento adicional $500',
    fechaInicio: new Date(),
    activo: true,
    aplicaA: 'TODOS_ITEMS'
  });

  // Test 7.1: Aplicar múltiples ajustes
  const resultado = ajusteService.calcularAjustesMultiples([ajuste1, ajuste2], montoOriginal);

  assert(resultado.montoOriginal === montoOriginal, 'Test 7.1: Monto original correcto');
  assert(resultado.ajustes.length === 2, 'Test 7.1: Se aplicaron 2 ajustes');

  // Test 7.2: Primer ajuste (20% descuento)
  const primerAjuste = resultado.ajustes[0];
  assert(primerAjuste.ajusteCalculado === -2000, 'Test 7.2: Primer ajuste 20% = -2000');
  assert(primerAjuste.montoIntermedio === 8000, 'Test 7.2: Monto después de 20% = 8000');

  // Test 7.3: Segundo ajuste (descuento fijo sobre monto ya reducido)
  const segundoAjuste = resultado.ajustes[1];
  assert(segundoAjuste.ajusteCalculado === -500, 'Test 7.3: Segundo ajuste fijo = -500');
  assert(segundoAjuste.montoIntermedio === 7500, 'Test 7.3: Monto final = 7500');

  // Test 7.4: Monto final y total de ajuste
  assert(resultado.montoFinal === 7500, 'Test 7.4: Monto final correcto (7500)');
  assert(resultado.totalAjuste === -2500, 'Test 7.4: Total de ajuste correcto (-2500)');

  console.log('');
}

// ══════════════════════════════════════════════════════════════════════
// 8. ESTADÍSTICAS
// ══════════════════════════════════════════════════════════════════════

async function testEstadisticas() {
  console.log('📊 Suite 8: Estadísticas\n');

  // Create various adjustments
  await ajusteService.createAjuste({
    personaId: testPersona.id,
    tipoAjuste: 'DESCUENTO_FIJO',
    valor: 100,
    concepto: 'Stats test 1',
    fechaInicio: new Date(),
    activo: true,
    aplicaA: 'TODOS_ITEMS'
  });

  await ajusteService.createAjuste({
    personaId: testPersona.id,
    tipoAjuste: 'DESCUENTO_PORCENTAJE',
    valor: 10,
    concepto: 'Stats test 2',
    fechaInicio: new Date(),
    activo: false,
    aplicaA: 'SOLO_BASE'
  });

  // Test 8.1: Estadísticas de ajustes
  const stats = await ajusteService.getStats(testPersona.id);

  assert(stats.total > 0, 'Test 8.1: Total de ajustes > 0');
  assert(typeof stats.activos === 'number', 'Test 8.1: Campo activos existe');
  assert(typeof stats.porTipo === 'object', 'Test 8.1: Campo porTipo existe');
  assert(typeof stats.porScope === 'object', 'Test 8.1: Campo porScope existe');

  // Test 8.2: Estadísticas de historial
  const historialStats = await historialRepository.getStats({
    personaId: testPersona.id
  });

  assert(historialStats.total > 0, 'Test 8.2: Total de registros de historial > 0');
  assert(typeof historialStats.porAccion === 'object', 'Test 8.2: Campo porAccion existe');
  assert(historialStats.ultimaModificacion !== undefined, 'Test 8.2: Campo ultimaModificacion existe');

  console.log('');
}

// ══════════════════════════════════════════════════════════════════════
// RUNNER
// ══════════════════════════════════════════════════════════════════════

async function runTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  FASE 4 - Task 4.1: Tests de Ajustes Manuales por Socio  ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    await setup();

    await testCRUDAjustes();
    await testValidaciones();
    await testCalculoAjustes();
    await testHistorial();
    await testSoftDelete();
    await testAjustesMultiples();
    await testEstadisticas();

    await teardown();

    // Print summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 RESUMEN DE TESTS');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Total:   ${testResults.total}`);
    console.log(`✅ Passed: ${testResults.passed} (${((testResults.passed / testResults.total) * 100).toFixed(1)}%)`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    if (testResults.failed > 0) {
      console.log('❌ ERRORES ENCONTRADOS:\n');
      testResults.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
      console.log('');
      process.exit(1);
    } else {
      console.log('✅ TODOS LOS TESTS PASARON!\n');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n💥 ERROR FATAL EN TESTS:\n', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Run tests
runTests();
