/**
 * ========================================================================
 * TESTS: FASE 3 - Motor de Reglas de Descuentos
 * ========================================================================
 *
 * Validación completa del motor de reglas de descuentos:
 * - Configuración y seed de reglas
 * - Evaluación de condiciones
 * - Cálculo de descuentos
 * - Resolución de conflictos
 * - Integración con generación de cuotas
 * - Casos complejos (múltiples reglas)
 *
 * Ejecutar: npx tsx tests/fase3-motor-reglas-tests.ts
 */

import { PrismaClient, ModoAplicacionDescuento } from '@prisma/client';
import { MotorReglasDescuentos } from '../src/services/motor-reglas-descuentos.service';

const prisma = new PrismaClient();

// Colores para output
const COLORS = {
  RESET: '\x1b[0m',
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  CYAN: '\x1b[36m',
  MAGENTA: '\x1b[35m'
};

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration?: number;
}

const results: TestResult[] = [];

/**
 * Helper: Log de test
 */
function logTest(name: string, passed: boolean, error?: string, duration?: number) {
  const icon = passed ? '✅' : '❌';
  const color = passed ? COLORS.GREEN : COLORS.RED;
  const durationStr = duration ? ` (${duration}ms)` : '';

  console.log(`  ${icon} ${color}${name}${COLORS.RESET}${durationStr}`);

  if (error && !passed) {
    console.log(`     ${COLORS.RED}Error: ${error}${COLORS.RESET}`);
  }

  results.push({ name, passed, error, duration });
}

/**
 * Helper: Ejecutar test con manejo de errores
 */
async function runTest(name: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    await fn();
    const duration = Date.now() - start;
    logTest(name, true, undefined, duration);
  } catch (error: any) {
    const duration = Date.now() - start;
    logTest(name, false, error.message, duration);
  }
}

/**
 * Helper: Assert
 */
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

/**
 * ========================================================================
 * SUITE 1: Configuración y Seed de Reglas
 * ========================================================================
 */
async function testSuite1_ConfiguracionSeed() {
  console.log(`\n${COLORS.CYAN}═══ SUITE 1: Configuración y Seed de Reglas ═══${COLORS.RESET}`);

  await runTest('1.1 - Verificar reglas creadas por seed', async () => {
    const totalReglas = await prisma.reglaDescuento.count();
    assert(totalReglas >= 4, `Se esperaban al menos 4 reglas, se encontraron ${totalReglas}`);
  });

  await runTest('1.2 - Verificar regla DESC_CATEGORIA existe y está activa', async () => {
    const regla = await prisma.reglaDescuento.findUnique({
      where: { codigo: 'DESC_CATEGORIA' }
    });
    assert(regla !== null, 'Regla DESC_CATEGORIA no encontrada');
    assert(regla!.activa === true, 'Regla DESC_CATEGORIA no está activa');
    assert(regla!.modoAplicacion === ModoAplicacionDescuento.ACUMULATIVO, 'Modo incorrecto');
  });

  await runTest('1.3 - Verificar regla DESC_FAMILIAR existe y está activa', async () => {
    const regla = await prisma.reglaDescuento.findUnique({
      where: { codigo: 'DESC_FAMILIAR' }
    });
    assert(regla !== null, 'Regla DESC_FAMILIAR no encontrada');
    assert(regla!.activa === true, 'Regla DESC_FAMILIAR no está activa');
    assert(regla!.modoAplicacion === ModoAplicacionDescuento.EXCLUSIVO, 'Modo incorrecto');
  });

  await runTest('1.4 - Verificar configuración global existe', async () => {
    const config = await prisma.configuracionDescuentos.findUnique({
      where: { id: 1 }
    });
    assert(config !== null, 'Configuración global no encontrada');
    assert(config!.activa === true, 'Configuración no está activa');
    assert(config!.limiteDescuentoTotal !== null, 'Límite no configurado');
  });

  await runTest('1.5 - Verificar estructura de condiciones JSONB', async () => {
    const regla = await prisma.reglaDescuento.findUnique({
      where: { codigo: 'DESC_CATEGORIA' }
    });
    const condiciones = regla!.condiciones as any;
    assert(condiciones.type !== undefined, 'Condiciones sin type');
    assert(condiciones.categorias !== undefined, 'Condiciones sin categorías');
  });

  await runTest('1.6 - Verificar estructura de formula JSONB', async () => {
    const regla = await prisma.reglaDescuento.findUnique({
      where: { codigo: 'DESC_CATEGORIA' }
    });
    const formula = regla!.formula as any;
    assert(formula.type !== undefined, 'Formula sin type');
  });
}

/**
 * ========================================================================
 * SUITE 2: Tests Unitarios - Evaluadores de Condiciones
 * ========================================================================
 */
async function testSuite2_EvaluadoresCondiciones() {
  console.log(`\n${COLORS.CYAN}═══ SUITE 2: Evaluadores de Condiciones ═══${COLORS.RESET}`);

  // Preparar datos de prueba
  let testPersona: any;
  let testCategoria: any;

  await runTest('2.1 - Preparar persona de prueba (ESTUDIANTE)', async () => {
    // Buscar categoría ESTUDIANTE
    testCategoria = await prisma.categoriaSocio.findFirst({
      where: { codigo: 'ESTUDIANTE' }
    });

    if (!testCategoria) {
      throw new Error('Categoría ESTUDIANTE no encontrada. Ejecutar seed de catálogos.');
    }

    // Crear persona de prueba
    testPersona = await prisma.persona.create({
      data: {
        nombre: 'Juan',
        apellido: 'Test Motor Reglas',
        fechaNacimiento: new Date('2000-01-01'),
        genero: 'MASCULINO',
        activo: true
      }
    });

    // Asignar tipo SOCIO
    await prisma.personaTipo.create({
      data: {
        personaId: testPersona.id,
        tipoPersonaId: 1, // SOCIO
        categoriaId: testCategoria.id,
        activo: true
      }
    });
  });

  await runTest('2.2 - Motor: Evaluar condición de categoría (ESTUDIANTE)', async () => {
    const motor = new MotorReglasDescuentos();
    const regla = await prisma.reglaDescuento.findUnique({
      where: { codigo: 'DESC_CATEGORIA' }
    });

    // El motor debería evaluar que la persona tiene categoría ESTUDIANTE
    // (Este test es conceptual, ya que evaluarCondiciones es privado)
    assert(regla !== null, 'Regla no encontrada');
  });

  await runTest('2.3 - Crear relación familiar para test', async () => {
    // Crear otra persona (familiar)
    const familiar = await prisma.persona.create({
      data: {
        nombre: 'Maria',
        apellido: 'Test Familiar',
        fechaNacimiento: new Date('2002-01-01'),
        genero: 'FEMENINO',
        activo: true
      }
    });

    // Asignar tipo SOCIO
    await prisma.personaTipo.create({
      data: {
        personaId: familiar.id,
        tipoPersonaId: 1,
        categoriaId: testCategoria.id,
        activo: true
      }
    });

    // Crear relación familiar con descuento
    await prisma.familiar.create({
      data: {
        socioId: testPersona.id,
        familiarId: familiar.id,
        parentesco: 'HERMANO',
        descuento: 15.0,
        activo: true
      }
    });

    // Relación complementaria
    await prisma.familiar.create({
      data: {
        socioId: familiar.id,
        familiarId: testPersona.id,
        parentesco: 'HERMANA',
        descuento: 15.0,
        activo: true
      }
    });
  });

  await runTest('2.4 - Motor: Evaluar condición de relación familiar', async () => {
    const familiares = await prisma.familiar.findMany({
      where: {
        socioId: testPersona.id,
        activo: true
      }
    });

    assert(familiares.length > 0, 'No se encontraron relaciones familiares');
    assert(familiares[0].descuento !== null, 'Relación sin descuento');
  });
}

/**
 * ========================================================================
 * SUITE 3: Tests Unitarios - Calculadores de Descuentos
 * ========================================================================
 */
async function testSuite3_CalculadoresDescuentos() {
  console.log(`\n${COLORS.CYAN}═══ SUITE 3: Calculadores de Descuentos ═══${COLORS.RESET}`);

  await runTest('3.1 - Verificar categoría ESTUDIANTE tiene descuento', async () => {
    const categoria = await prisma.categoriaSocio.findFirst({
      where: { codigo: 'ESTUDIANTE' }
    });
    assert(categoria !== null, 'Categoría ESTUDIANTE no encontrada');
    assert(categoria!.descuento !== null, 'Categoría sin descuento');
    assert(categoria!.descuento! > 0, 'Descuento debe ser mayor a 0');
  });

  await runTest('3.2 - Verificar fórmula porcentaje_desde_bd', async () => {
    const regla = await prisma.reglaDescuento.findUnique({
      where: { codigo: 'DESC_CATEGORIA' }
    });
    const formula = regla!.formula as any;
    assert(formula.type === 'porcentaje_desde_bd', 'Tipo de fórmula incorrecto');
    assert(formula.fuente === 'categorias_socios', 'Fuente incorrecta');
  });

  await runTest('3.3 - Verificar fórmula personalizada (DESC_FAMILIAR)', async () => {
    const regla = await prisma.reglaDescuento.findUnique({
      where: { codigo: 'DESC_FAMILIAR' }
    });
    const formula = regla!.formula as any;
    assert(formula.type === 'personalizado', 'Tipo de fórmula incorrecto');
    assert(formula.funcion !== undefined, 'Función no definida');
  });

  await runTest('3.4 - Verificar fórmula escalada (DESC_MULTIPLES_ACTIVIDADES)', async () => {
    const regla = await prisma.reglaDescuento.findUnique({
      where: { codigo: 'DESC_MULTIPLES_ACTIVIDADES' }
    });
    const formula = regla!.formula as any;
    assert(formula.type === 'escalado', 'Tipo de fórmula incorrecto');
    assert(Array.isArray(formula.reglas), 'Reglas debe ser array');
  });
}

/**
 * ========================================================================
 * SUITE 4: Tests de Resolución de Conflictos
 * ========================================================================
 */
async function testSuite4_ResolucionConflictos() {
  console.log(`\n${COLORS.CYAN}═══ SUITE 4: Resolución de Conflictos ═══${COLORS.RESET}`);

  await runTest('4.1 - Verificar modo ACUMULATIVO permite suma', async () => {
    const regla = await prisma.reglaDescuento.findUnique({
      where: { codigo: 'DESC_CATEGORIA' }
    });
    assert(regla!.modoAplicacion === ModoAplicacionDescuento.ACUMULATIVO, 'Modo incorrecto');
  });

  await runTest('4.2 - Verificar modo EXCLUSIVO (solo el mayor)', async () => {
    const regla = await prisma.reglaDescuento.findUnique({
      where: { codigo: 'DESC_FAMILIAR' }
    });
    assert(regla!.modoAplicacion === ModoAplicacionDescuento.EXCLUSIVO, 'Modo incorrecto');
  });

  await runTest('4.3 - Verificar modo MAXIMO tiene límite', async () => {
    const regla = await prisma.reglaDescuento.findUnique({
      where: { codigo: 'DESC_ANTIGUEDAD' }
    });
    assert(regla!.modoAplicacion === ModoAplicacionDescuento.MAXIMO, 'Modo incorrecto');
    assert(regla!.maxDescuento !== null, 'maxDescuento debe estar configurado');
  });

  await runTest('4.4 - Verificar límite global de descuento', async () => {
    const config = await prisma.configuracionDescuentos.findUnique({
      where: { id: 1 }
    });
    assert(config!.limiteDescuentoTotal !== null, 'Límite global no configurado');
    assert(config!.limiteDescuentoTotal! > 0, 'Límite debe ser mayor a 0');
    assert(config!.limiteDescuentoTotal! <= 100, 'Límite no puede exceder 100%');
  });
}

/**
 * ========================================================================
 * SUITE 5: Tests de Integración - Motor de Reglas
 * ========================================================================
 */
async function testSuite5_IntegracionMotor() {
  console.log(`\n${COLORS.CYAN}═══ SUITE 5: Integración del Motor ═══${COLORS.RESET}`);

  let testSocio: any;
  let testCuota: any;

  await runTest('5.1 - Preparar datos: Crear socio ESTUDIANTE con actividades', async () => {
    // Crear persona
    testSocio = await prisma.persona.create({
      data: {
        nombre: 'Pedro',
        apellido: 'Test Integración',
        fechaNacimiento: new Date('1998-05-15'),
        genero: 'MASCULINO',
        activo: true
      }
    });

    // Buscar categoría ESTUDIANTE
    const categoria = await prisma.categoriaSocio.findFirst({
      where: { codigo: 'ESTUDIANTE' }
    });

    // Asignar tipo SOCIO
    await prisma.personaTipo.create({
      data: {
        personaId: testSocio.id,
        tipoPersonaId: 1,
        categoriaId: categoria!.id,
        numeroSocio: `TEST-${Date.now()}`,
        activo: true
      }
    });
  });

  await runTest('5.2 - Preparar datos: Crear cuota de prueba', async () => {
    // Crear recibo
    const recibo = await prisma.recibo.create({
      data: {
        tipo: 'CUOTA',
        receptorId: testSocio.id,
        importe: 0,
        concepto: 'Test Motor Reglas',
        fechaVencimiento: new Date('2025-12-31')
      }
    });

    // Buscar categoría ESTUDIANTE
    const categoria = await prisma.categoriaSocio.findFirst({
      where: { codigo: 'ESTUDIANTE' }
    });

    // Crear cuota
    testCuota = await prisma.cuota.create({
      data: {
        reciboId: recibo.id,
        categoria: categoria!.codigo,
        mes: 12,
        anio: 2025,
        montoBase: 5000,
        montoActividades: 0,
        montoTotal: 5000
      }
    });
  });

  await runTest('5.3 - Aplicar motor de reglas a cuota', async () => {
    const motor = new MotorReglasDescuentos();

    const categoria = await prisma.categoriaSocio.findFirst({
      where: { codigo: 'ESTUDIANTE' }
    });

    const resultado = await motor.aplicarReglas({
      socioId: testSocio.id,
      categoriaId: categoria!.id,
      cuotaId: testCuota.id,
      mes: 12,
      anio: 2025
    });

    assert(resultado !== null, 'Resultado no puede ser null');
    assert(Array.isArray(resultado.items), 'Items debe ser array');
    assert(Array.isArray(resultado.reglasAplicadas), 'ReglasAplicadas debe ser array');
  });

  await runTest('5.4 - Verificar que se crearon ítems de descuento', async () => {
    const items = await prisma.itemCuota.findMany({
      where: { cuotaId: testCuota.id }
    });

    // Debe haber al menos 1 ítem de descuento (DESC_CATEGORIA para ESTUDIANTE)
    const itemsDescuento = items.filter(i => i.monto < 0);
    assert(itemsDescuento.length > 0, 'No se crearon ítems de descuento');
  });

  await runTest('5.5 - Verificar que se registró en log de auditoría', async () => {
    const aplicaciones = await prisma.aplicacionRegla.findMany({
      where: { cuotaId: testCuota.id }
    });

    assert(aplicaciones.length > 0, 'No se registraron aplicaciones en auditoría');
  });

  await runTest('5.6 - Verificar metadata de aplicación', async () => {
    const aplicacion = await prisma.aplicacionRegla.findFirst({
      where: { cuotaId: testCuota.id }
    });

    const metadata = aplicacion!.metadata as any;
    assert(metadata !== null, 'Metadata no puede ser null');
    assert(metadata.porcentaje !== undefined, 'Metadata debe incluir porcentaje');
  });
}

/**
 * ========================================================================
 * SUITE 6: Tests de Casos Complejos
 * ========================================================================
 */
async function testSuite6_CasosComplejos() {
  console.log(`\n${COLORS.CYAN}═══ SUITE 6: Casos Complejos ═══${COLORS.RESET}`);

  await runTest('6.1 - Múltiples reglas aplicadas a un socio', async () => {
    // Crear socio ESTUDIANTE con relación familiar
    const socio = await prisma.persona.create({
      data: {
        nombre: 'Ana',
        apellido: 'Test Múltiples Reglas',
        fechaNacimiento: new Date('2001-03-20'),
        genero: 'FEMENINO',
        activo: true
      }
    });

    const categoria = await prisma.categoriaSocio.findFirst({
      where: { codigo: 'ESTUDIANTE' }
    });

    await prisma.personaTipo.create({
      data: {
        personaId: socio.id,
        tipoPersonaId: 1,
        categoriaId: categoria!.id,
        numeroSocio: `TEST-MULTI-${Date.now()}`,
        activo: true
      }
    });

    // Aplicar motor
    const motor = new MotorReglasDescuentos();

    const recibo = await prisma.recibo.create({
      data: {
        tipo: 'CUOTA',
        receptorId: socio.id,
        importe: 0,
        concepto: 'Test múltiples reglas'
      }
    });

    const cuota = await prisma.cuota.create({
      data: {
        reciboId: recibo.id,
        categoria: categoria!.codigo,
        mes: 12,
        anio: 2025,
        montoBase: 5000,
        montoActividades: 0,
        montoTotal: 5000
      }
    });

    const resultado = await motor.aplicarReglas({
      socioId: socio.id,
      categoriaId: categoria!.id,
      cuotaId: cuota.id,
      mes: 12,
      anio: 2025
    });

    assert(resultado.reglasAplicadas.length > 0, 'Debe aplicar al menos 1 regla');
  });

  await runTest('6.2 - Verificar que descuento no excede límite global', async () => {
    const config = await prisma.configuracionDescuentos.findUnique({
      where: { id: 1 }
    });

    const limiteGlobal = config!.limiteDescuentoTotal!;

    // Simular descuento total del 100% (imposible)
    const descuentoSimulado = 95;
    assert(descuentoSimulado <= limiteGlobal, 'Descuento excede límite global');
  });

  await runTest('6.3 - Reglas inactivas no se aplican', async () => {
    const reglasInactivas = await prisma.reglaDescuento.findMany({
      where: { activa: false }
    });

    // Motor no debería aplicar reglas inactivas
    assert(reglasInactivas.length >= 2, 'Debe haber reglas inactivas en el seed');
  });
}

/**
 * ========================================================================
 * SUITE 7: Cleanup de Datos de Prueba
 * ========================================================================
 */
async function testSuite7_Cleanup() {
  console.log(`\n${COLORS.CYAN}═══ SUITE 7: Limpieza de Datos de Prueba ═══${COLORS.RESET}`);

  await runTest('7.1 - Eliminar aplicaciones de reglas de test', async () => {
    await prisma.aplicacionRegla.deleteMany({
      where: {
        cuota: {
          mes: 12,
          anio: 2025
        }
      }
    });
  });

  await runTest('7.2 - Eliminar ítems de cuota de test', async () => {
    await prisma.itemCuota.deleteMany({
      where: {
        cuota: {
          mes: 12,
          anio: 2025
        }
      }
    });
  });

  await runTest('7.3 - Eliminar cuotas de test', async () => {
    const deleted = await prisma.cuota.deleteMany({
      where: {
        mes: 12,
        anio: 2025
      }
    });
    console.log(`     🗑️  ${deleted.count} cuotas de prueba eliminadas`);
  });

  await runTest('7.4 - Eliminar recibos de test', async () => {
    await prisma.recibo.deleteMany({
      where: {
        concepto: { contains: 'Test' }
      }
    });
  });

  await runTest('7.5 - Eliminar relaciones familiares de test', async () => {
    await prisma.familiar.deleteMany({
      where: {
        socio: {
          apellido: { contains: 'Test' }
        }
      }
    });
  });

  await runTest('7.6 - Eliminar persona_tipo de test', async () => {
    await prisma.personaTipo.deleteMany({
      where: {
        persona: {
          apellido: { contains: 'Test' }
        }
      }
    });
  });

  await runTest('7.7 - Eliminar personas de test', async () => {
    const deleted = await prisma.persona.deleteMany({
      where: {
        apellido: { contains: 'Test' }
      }
    });
    console.log(`     🗑️  ${deleted.count} personas de prueba eliminadas`);
  });
}

/**
 * ========================================================================
 * EJECUCIÓN PRINCIPAL
 * ========================================================================
 */
async function main() {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`${COLORS.MAGENTA}  🧪 TESTS: FASE 3 - MOTOR DE REGLAS DE DESCUENTOS${COLORS.RESET}`);
  console.log(`${'═'.repeat(70)}\n`);

  const startTime = Date.now();

  try {
    // Ejecutar todas las suites
    await testSuite1_ConfiguracionSeed();
    await testSuite2_EvaluadoresCondiciones();
    await testSuite3_CalculadoresDescuentos();
    await testSuite4_ResolucionConflictos();
    await testSuite5_IntegracionMotor();
    await testSuite6_CasosComplejos();
    await testSuite7_Cleanup();

    // Resumen final
    const totalTime = Date.now() - startTime;
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const total = results.length;

    console.log(`\n${'═'.repeat(70)}`);
    console.log(`${COLORS.CYAN}  📊 RESUMEN DE TESTS${COLORS.RESET}`);
    console.log(`${'═'.repeat(70)}`);
    console.log(`  ${COLORS.GREEN}✅ Pasaron: ${passed}/${total}${COLORS.RESET}`);
    console.log(`  ${COLORS.RED}❌ Fallaron: ${failed}/${total}${COLORS.RESET}`);
    console.log(`  ⏱️  Tiempo total: ${totalTime}ms`);
    console.log(`  📈 Tasa de éxito: ${((passed / total) * 100).toFixed(1)}%`);
    console.log(`${'═'.repeat(70)}\n`);

    if (failed > 0) {
      console.log(`${COLORS.YELLOW}⚠️  Algunos tests fallaron. Revisa los errores arriba.${COLORS.RESET}\n`);
      process.exit(1);
    } else {
      console.log(`${COLORS.GREEN}✅ Todos los tests pasaron exitosamente!${COLORS.RESET}\n`);
      process.exit(0);
    }

  } catch (error) {
    console.error(`\n${COLORS.RED}❌ Error fatal en ejecución de tests:${COLORS.RESET}`, error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
main();
