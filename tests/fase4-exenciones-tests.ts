/**
 * Tests para FASE 4 - Task 4.2: Exenciones Temporales
 *
 * Test suites:
 * 1. Setup y Teardown
 * 2. CRUD de Exenciones
 * 3. Workflow de Aprobación
 * 4. Validaciones de Negocio
 * 5. Check Exención para Período
 * 6. Estados y Transiciones
 * 7. Estadísticas
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { ExencionCuotaRepository } from '../src/repositories/exencion-cuota.repository';
import { HistorialAjusteCuotaRepository } from '../src/repositories/historial-ajuste-cuota.repository';
import { PersonaRepository } from '../src/repositories/persona.repository';
import { ExencionCuotaService } from '../src/services/exencion-cuota.service';

const prisma = new PrismaClient();

// Test data
let testPersona: any;
let testCategoria: any;
let testTipoSocio: any;
let exencionRepository: ExencionCuotaRepository;
let historialRepository: HistorialAjusteCuotaRepository;
let personaRepository: PersonaRepository;
let exencionService: ExencionCuotaService;

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
      nombre: 'Test Categoria Exenciones',
      descripcion: 'Categoría para tests de exenciones',
      codigo: `TEST-CAT-EXENC-${Date.now()}`,
      descuento: new Prisma.Decimal(0),
      montoCuota: new Prisma.Decimal(5000),
      activa: true,
      orden: 999
    }
  });

  // Create test persona
  testPersona = await prisma.persona.create({
    data: {
      dni: `TEST-DNI-EXENC-${Date.now()}`,
      nombre: 'Maria',
      apellido: 'Test Exenciones',
      fechaNacimiento: new Date('1995-05-15'),
      genero: 'FEMENINO',
      activo: true
    }
  });

  // Assign SOCIO type
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
  exencionRepository = new ExencionCuotaRepository(prisma);
  historialRepository = new HistorialAjusteCuotaRepository(prisma);
  personaRepository = new PersonaRepository(prisma);
  exencionService = new ExencionCuotaService(exencionRepository, historialRepository, personaRepository);

  console.log('✅ Setup completado\n');
}

async function teardown() {
  console.log('\n🧹 Teardown: Limpiando datos de prueba...\n');

  await prisma.historialAjusteCuota.deleteMany({
    where: { personaId: testPersona.id }
  });

  await prisma.exencionCuota.deleteMany({
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
// 2. CRUD DE EXENCIONES
// ══════════════════════════════════════════════════════════════════════

async function testCRUDExenciones() {
  console.log('📦 Suite 2: CRUD de Exenciones\n');

  // Test 2.1: Crear exención total
  const exencion1 = await exencionService.createExencion({
    personaId: testPersona.id,
    tipoExencion: 'TOTAL',
    motivoExencion: 'BECA',
    porcentajeExencion: 100,
    fechaInicio: new Date('2025-01-01'),
    fechaFin: new Date('2025-12-31'),
    descripcion: 'Beca completa por mérito académico',
    justificacion: 'Promedio 9.5',
    solicitadoPor: 'test-user'
  }, 'test-user');

  assert(exencion1.id > 0, 'Test 2.1: Crear exención total');
  assert(exencion1.estado === 'PENDIENTE_APROBACION', 'Test 2.1: Estado inicial PENDIENTE_APROBACION');
  assert(Number(exencion1.porcentajeExencion) === 100, 'Test 2.1: Porcentaje 100%');

  // Test 2.2: Crear exención parcial
  const exencion2 = await exencionService.createExencion({
    personaId: testPersona.id,
    tipoExencion: 'PARCIAL',
    motivoExencion: 'SITUACION_ECONOMICA',
    porcentajeExencion: 50,
    fechaInicio: new Date('2025-01-01'),
    descripcion: 'Exención parcial por situación económica',
    solicitadoPor: 'test-user'
  });

  assert(exencion2.id > 0, 'Test 2.2: Crear exención parcial');
  assert(Number(exencion2.porcentajeExencion) === 50, 'Test 2.2: Porcentaje 50%');

  // Test 2.3: Obtener exención por ID
  const exencionObtenida = await exencionService.getExencionById(exencion1.id);
  assert(exencionObtenida !== null, 'Test 2.3: Obtener exención por ID');
  assert(exencionObtenida?.id === exencion1.id, 'Test 2.3: ID coincide');

  // Test 2.4: Listar exenciones por persona
  const exencionesPersona = await exencionService.getExencionesByPersonaId(testPersona.id);
  assert(exencionesPersona.length >= 2, 'Test 2.4: Listar exenciones por persona');

  // Test 2.5: Actualizar exención (solo PENDIENTE_APROBACION)
  const exencionActualizada = await exencionService.updateExencion(
    exencion1.id,
    {
      descripcion: 'Beca completa actualizada',
      justificacion: 'Promedio 10.0'
    },
    'test-user'
  );
  assert(exencionActualizada.descripcion === 'Beca completa actualizada', 'Test 2.5: Actualizar descripción');

  // Test 2.6: Filtrar exenciones por motivo
  const exencionesBeca = await exencionService.getExenciones({
    personaId: testPersona.id,
    motivoExencion: 'BECA'
  });
  assert(exencionesBeca.length >= 1, 'Test 2.6: Filtrar por motivo BECA');

  console.log('');
}

// ══════════════════════════════════════════════════════════════════════
// 3. WORKFLOW DE APROBACIÓN
// ══════════════════════════════════════════════════════════════════════

async function testWorkflowAprobacion() {
  console.log('✅ Suite 3: Workflow de Aprobación\n');

  // Create exención for approval tests
  const exencion = await exencionService.createExencion({
    personaId: testPersona.id,
    tipoExencion: 'TOTAL',
    motivoExencion: 'SOCIO_FUNDADOR',
    porcentajeExencion: 100,
    fechaInicio: new Date('2025-01-01'),
    descripcion: 'Exención por socio fundador',
    solicitadoPor: 'test-user'
  });

  // Test 3.1: Aprobar exención
  const exencionAprobada = await exencionService.aprobarExencion(exencion.id, {
    aprobadoPor: 'director@example.com',
    observaciones: 'Aprobado por mérito'
  }, 'director');

  assert(exencionAprobada.estado === 'APROBADA', 'Test 3.1: Estado cambia a APROBADA');
  assert(exencionAprobada.aprobadoPor === 'director@example.com', 'Test 3.1: aprobadoPor registrado');
  assert(exencionAprobada.fechaAprobacion !== null, 'Test 3.1: fechaAprobacion registrada');

  // Test 3.2: Rechazar exención
  const exencionRechazar = await exencionService.createExencion({
    personaId: testPersona.id,
    tipoExencion: 'PARCIAL',
    motivoExencion: 'OTRO',
    porcentajeExencion: 30,
    fechaInicio: new Date('2025-01-01'),
    descripcion: 'Test rechazo',
    solicitadoPor: 'test-user'
  });

  const exencionRechazada = await exencionService.rechazarExencion(exencionRechazar.id, {
    motivoRechazo: 'No cumple requisitos'
  }, 'director');

  assert(exencionRechazada.estado === 'RECHAZADA', 'Test 3.2: Estado cambia a RECHAZADA');
  assert(exencionRechazada.observaciones === 'No cumple requisitos', 'Test 3.2: Motivo rechazo registrado');

  // Test 3.3: Revocar exención aprobada
  const exencionRevocada = await exencionService.revocarExencion(exencionAprobada.id, {
    motivoRevocacion: 'Situación cambió'
  }, 'director');

  assert(exencionRevocada.estado === 'REVOCADA', 'Test 3.3: Estado cambia a REVOCADA');
  assert(exencionRevocada.activa === false, 'Test 3.3: Exención desactivada');

  // Test 3.4: No se puede aprobar si no está PENDIENTE
  try {
    await exencionService.aprobarExencion(exencionRechazada.id, {
      aprobadoPor: 'test'
    });
    assert(false, 'Test 3.4: Debe rechazar aprobar exención ya rechazada');
  } catch (error) {
    assert(true, 'Test 3.4: Rechaza aprobar exención ya rechazada');
  }

  console.log('');
}

// ══════════════════════════════════════════════════════════════════════
// 4. VALIDACIONES DE NEGOCIO
// ══════════════════════════════════════════════════════════════════════

async function testValidaciones() {
  console.log('🔒 Suite 4: Validaciones de Negocio\n');

  // Test 4.1: Validar persona inexistente
  try {
    await exencionService.createExencion({
      personaId: 999999,
      tipoExencion: 'TOTAL',
      motivoExencion: 'BECA',
      porcentajeExencion: 100,
      fechaInicio: new Date(),
      descripcion: 'Test persona inexistente'
    });
    assert(false, 'Test 4.1: Debe rechazar persona inexistente');
  } catch (error) {
    assert(true, 'Test 4.1: Rechaza persona inexistente');
  }

  // Test 4.2: Validar persona inactiva
  const personaInactiva = await prisma.persona.create({
    data: {
      dni: `INACTIVE-EXENC-${Date.now()}`,
      nombre: 'Inactivo',
      apellido: 'Test',
      activo: false
    }
  });

  try {
    await exencionService.createExencion({
      personaId: personaInactiva.id,
      tipoExencion: 'TOTAL',
      motivoExencion: 'BECA',
      porcentajeExencion: 100,
      fechaInicio: new Date(),
      descripcion: 'Test persona inactiva'
    });
    assert(false, 'Test 4.2: Debe rechazar persona inactiva');
  } catch (error) {
    assert(true, 'Test 4.2: Rechaza persona inactiva');
  } finally {
    await prisma.persona.delete({ where: { id: personaInactiva.id } });
  }

  // Test 4.3: Validar fechaFin < fechaInicio
  try {
    await exencionService.createExencion({
      personaId: testPersona.id,
      tipoExencion: 'TOTAL',
      motivoExencion: 'BECA',
      porcentajeExencion: 100,
      fechaInicio: new Date('2025-12-31'),
      fechaFin: new Date('2025-01-01'),
      descripcion: 'Fechas inválidas'
    });
    assert(false, 'Test 4.3: Debe rechazar fechaFin < fechaInicio');
  } catch (error) {
    assert(true, 'Test 4.3: Rechaza fechaFin < fechaInicio');
  }

  // Test 4.4: Exención TOTAL debe tener 100%
  try {
    await exencionService.createExencion({
      personaId: testPersona.id,
      tipoExencion: 'TOTAL',
      motivoExencion: 'BECA',
      porcentajeExencion: 80, // Invalid!
      fechaInicio: new Date(),
      descripcion: 'Test TOTAL con porcentaje inválido'
    });
    assert(false, 'Test 4.4: Debe rechazar TOTAL con porcentaje != 100');
  } catch (error) {
    assert(true, 'Test 4.4: Rechaza TOTAL con porcentaje != 100');
  }

  console.log('');
}

// ══════════════════════════════════════════════════════════════════════
// 5. CHECK EXENCIÓN PARA PERÍODO
// ══════════════════════════════════════════════════════════════════════

async function testCheckExencionPeriodo() {
  console.log('📅 Suite 5: Check Exención para Período\n');

  // Create approved exemption for period testing
  const exencion = await exencionService.createExencion({
    personaId: testPersona.id,
    tipoExencion: 'PARCIAL',
    motivoExencion: 'BECA',
    porcentajeExencion: 75,
    fechaInicio: new Date('2025-01-01'),
    fechaFin: new Date('2025-06-30'),
    descripcion: 'Beca primer semestre'
  });

  await exencionService.aprobarExencion(exencion.id, {
    aprobadoPor: 'test-director'
  });

  // Test 5.1: Check dentro del período
  const checkDentro = await exencionService.checkExencionParaPeriodo(
    testPersona.id,
    new Date('2025-03-15')
  );

  assert(checkDentro.tieneExencion === true, 'Test 5.1: Detecta exención dentro del período');
  assert(checkDentro.porcentaje === 75, 'Test 5.1: Porcentaje correcto (75%)');
  assert(checkDentro.exencion !== undefined, 'Test 5.1: Exención incluida en respuesta');

  // Test 5.2: Check fuera del período (antes)
  const checkAntes = await exencionService.checkExencionParaPeriodo(
    testPersona.id,
    new Date('2024-12-15')
  );

  assert(checkAntes.tieneExencion === false, 'Test 5.2: No detecta exención antes del período');
  assert(checkAntes.porcentaje === 0, 'Test 5.2: Porcentaje 0% fuera del período');

  // Test 5.3: Check fuera del período (después)
  const checkDespues = await exencionService.checkExencionParaPeriodo(
    testPersona.id,
    new Date('2025-07-15')
  );

  assert(checkDespues.tieneExencion === false, 'Test 5.3: No detecta exención después del período');

  // Test 5.4: Exención sin fecha fin (permanente)
  const exencionPermanente = await exencionService.createExencion({
    personaId: testPersona.id,
    tipoExencion: 'TOTAL',
    motivoExencion: 'SOCIO_HONORARIO',
    porcentajeExencion: 100,
    fechaInicio: new Date('2025-01-01'),
    descripcion: 'Socio honorario permanente'
  });

  await exencionService.aprobarExencion(exencionPermanente.id, {
    aprobadoPor: 'test-director'
  });

  const checkPermanente = await exencionService.checkExencionParaPeriodo(
    testPersona.id,
    new Date('2030-12-31')
  );

  assert(checkPermanente.tieneExencion === true, 'Test 5.4: Detecta exención permanente');
  assert(checkPermanente.porcentaje === 100, 'Test 5.4: Exención permanente 100%');

  console.log('');
}

// ══════════════════════════════════════════════════════════════════════
// 6. ESTADOS Y TRANSICIONES
// ══════════════════════════════════════════════════════════════════════

async function testEstadosTransiciones() {
  console.log('🔄 Suite 6: Estados y Transiciones\n');

  // Test 6.1: Solo se puede modificar PENDIENTE_APROBACION
  const exencion = await exencionService.createExencion({
    personaId: testPersona.id,
    tipoExencion: 'TOTAL',
    motivoExencion: 'BECA',
    porcentajeExencion: 100,
    fechaInicio: new Date('2025-01-01'),
    descripcion: 'Test estados'
  });

  await exencionService.aprobarExencion(exencion.id, {
    aprobadoPor: 'test-director'
  });

  try {
    await exencionService.updateExencion(exencion.id, {
      descripcion: 'Intento modificar aprobada'
    });
    assert(false, 'Test 6.1: No debe permitir modificar exención APROBADA');
  } catch (error) {
    assert(true, 'Test 6.1: Rechaza modificar exención APROBADA');
  }

  // Test 6.2: Solo se puede eliminar PENDIENTE o RECHAZADA
  try {
    await exencionService.deleteExencion(exencion.id);
    assert(false, 'Test 6.2: No debe permitir eliminar exención APROBADA');
  } catch (error) {
    assert(true, 'Test 6.2: Rechaza eliminar exención APROBADA');
  }

  // Test 6.3: Eliminar exención PENDIENTE
  const exencionPendiente = await exencionService.createExencion({
    personaId: testPersona.id,
    tipoExencion: 'PARCIAL',
    motivoExencion: 'OTRO',
    porcentajeExencion: 20,
    fechaInicio: new Date('2025-01-01'),
    descripcion: 'Test eliminación pendiente'
  });

  await exencionService.deleteExencion(exencionPendiente.id);

  const deleted = await exencionService.getExencionById(exencionPendiente.id);
  assert(deleted === null, 'Test 6.3: Exención PENDIENTE eliminada correctamente');

  // Test 6.4: Obtener pendientes
  await exencionService.createExencion({
    personaId: testPersona.id,
    tipoExencion: 'TOTAL',
    motivoExencion: 'BECA',
    porcentajeExencion: 100,
    fechaInicio: new Date('2025-01-01'),
    descripcion: 'Otra pendiente'
  });

  const pendientes = await exencionService.getPendientes();
  assert(pendientes.length > 0, 'Test 6.4: Obtener exenciones pendientes');

  console.log('');
}

// ══════════════════════════════════════════════════════════════════════
// 7. ESTADÍSTICAS
// ══════════════════════════════════════════════════════════════════════

async function testEstadisticas() {
  console.log('📊 Suite 7: Estadísticas\n');

  // Create various exemptions for stats
  await exencionService.createExencion({
    personaId: testPersona.id,
    tipoExencion: 'TOTAL',
    motivoExencion: 'BECA',
    porcentajeExencion: 100,
    fechaInicio: new Date('2025-01-01'),
    descripcion: 'Stats test 1'
  });

  const ex2 = await exencionService.createExencion({
    personaId: testPersona.id,
    tipoExencion: 'PARCIAL',
    motivoExencion: 'SITUACION_ECONOMICA',
    porcentajeExencion: 50,
    fechaInicio: new Date('2025-01-01'),
    descripcion: 'Stats test 2'
  });

  await exencionService.aprobarExencion(ex2.id, {
    aprobadoPor: 'test-director'
  });

  // Test 7.1: Estadísticas generales
  const stats = await exencionService.getStats(testPersona.id);

  assert(stats.total > 0, 'Test 7.1: Total de exenciones > 0');
  assert(typeof stats.porEstado === 'object', 'Test 7.1: Campo porEstado existe');
  assert(typeof stats.porTipo === 'object', 'Test 7.1: Campo porTipo existe');
  assert(typeof stats.porMotivo === 'object', 'Test 7.1: Campo porMotivo existe');
  assert(typeof stats.vigentes === 'number', 'Test 7.1: Campo vigentes existe');
  assert(typeof stats.pendientes === 'number', 'Test 7.1: Campo pendientes existe');

  // Test 7.2: Obtener vigentes
  const vigentes = await exencionService.getVigentes();
  assert(Array.isArray(vigentes), 'Test 7.2: getVigentes retorna array');

  console.log('');
}

// ══════════════════════════════════════════════════════════════════════
// RUNNER
// ══════════════════════════════════════════════════════════════════════

async function runTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  FASE 4 - Task 4.2: Tests de Exenciones Temporales       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    await setup();

    await testCRUDExenciones();
    await testWorkflowAprobacion();
    await testValidaciones();
    await testCheckExencionPeriodo();
    await testEstadosTransiciones();
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
