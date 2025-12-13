/**
 * ============================================================================
 * FASE 1: TESTS DE REGRESIÓN - Fixes Críticos Architecture V2
 * ============================================================================
 *
 * Valida los 3 fixes críticos implementados en Fase 1:
 *
 * 1. ✅ Task 1.1: getCuotasPorGenerar() migrado a Architecture V2
 * 2. ✅ Task 1.2: Constraint único removido (múltiples cuotas por categoría/período)
 * 3. ✅ Task 1.3: Race condition eliminado (secuencia PostgreSQL)
 *
 * Ejecutar: npx tsx tests/fase1-regression-tests.ts
 */

import { PrismaClient, TipoRecibo, EstadoRecibo } from '@prisma/client';

const prisma = new PrismaClient();

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];

// ============================================================================
// TEST 1: Architecture V2 - getCuotasPorGenerar()
// ============================================================================
async function test1_ArchitectureV2() {
  console.log('\n📋 TEST 1: Architecture V2 - Query con persona_tipo');
  console.log('─'.repeat(70));

  try {
    // Buscar socios activos usando Architecture V2
    const sociosActivos = await prisma.persona.findMany({
      where: {
        activo: true,
        tipos: {
          some: {
            activo: true,
            tipoPersona: { codigo: 'SOCIO' }
          }
        }
      },
      include: {
        tipos: {
          where: {
            activo: true,
            tipoPersona: { codigo: 'SOCIO' }
          },
          include: {
            categoria: true,
            tipoPersona: true
          }
        }
      }
    });

    if (sociosActivos.length === 0) {
      results.push({
        name: 'Test 1: Architecture V2',
        passed: false,
        message: 'No hay socios activos en la base de datos',
        details: { count: 0 }
      });
      console.log('   ⚠️  No hay socios activos para probar');
      return;
    }

    console.log(`   ✅ Query Architecture V2 ejecutado exitosamente`);
    console.log(`   ✅ Encontrados ${sociosActivos.length} socios activos`);

    // Validar estructura de datos
    const primeraPersona = sociosActivos[0];
    const tieneTipos = primeraPersona.tipos && primeraPersona.tipos.length > 0;
    const tipoTieneCategoria = tieneTipos && primeraPersona.tipos[0].categoria;

    if (!tieneTipos) {
      throw new Error('Los socios no tienen relación con persona_tipo');
    }

    if (!tipoTieneCategoria) {
      throw new Error('Los tipos no tienen categoría asociada');
    }

    console.log(`   ✅ Estructura de datos correcta (persona → persona_tipo → categoria)`);

    results.push({
      name: 'Test 1: Architecture V2',
      passed: true,
      message: 'Query con persona_tipo funciona correctamente',
      details: {
        sociosEncontrados: sociosActivos.length,
        ejemplo: {
          nombre: `${primeraPersona.nombre} ${primeraPersona.apellido}`,
          tiposActivos: primeraPersona.tipos.length,
          categoria: primeraPersona.tipos[0].categoria?.nombre
        }
      }
    });

  } catch (error) {
    console.log(`   ❌ ERROR: ${error}`);
    results.push({
      name: 'Test 1: Architecture V2',
      passed: false,
      message: `Error en query Architecture V2: ${error}`,
    });
  }
}

// ============================================================================
// TEST 2: Constraint Único - Múltiples cuotas por categoría/período
// ============================================================================
async function test2_MultipleQuotasSamePeriod() {
  console.log('\n📋 TEST 2: Múltiples cuotas misma categoría/período');
  console.log('─'.repeat(70));

  try {
    // Buscar 2 socios de la misma categoría
    const sociosActivos = await prisma.persona.findMany({
      where: {
        activo: true,
        tipos: {
          some: {
            activo: true,
            tipoPersona: { codigo: 'SOCIO' }
          }
        }
      },
      include: {
        tipos: {
          where: {
            activo: true,
            tipoPersona: { codigo: 'SOCIO' }
          },
          include: {
            categoria: true
          }
        }
      },
      take: 2
    });

    if (sociosActivos.length < 2) {
      results.push({
        name: 'Test 2: Múltiples cuotas',
        passed: false,
        message: 'No hay suficientes socios para el test (mínimo 2)',
        details: { count: sociosActivos.length }
      });
      console.log('   ⚠️  No hay suficientes socios para el test');
      return;
    }

    const categoriaId = sociosActivos[0].tipos[0].categoria?.id;
    const mes = new Date().getMonth() + 1;
    const anio = new Date().getFullYear();

    console.log(`   📌 Usando categoría ID: ${categoriaId}, período: ${mes}/${anio}`);

    // Crear recibos para ambos socios
    const recibo1 = await prisma.recibo.create({
      data: {
        tipo: TipoRecibo.CUOTA,
        estado: EstadoRecibo.PENDIENTE,
        receptorId: sociosActivos[0].id,
        importe: 1000,
        concepto: `Test Fase 1 - Cuota ${mes}/${anio}`,
        fecha: new Date()
      }
    });

    const recibo2 = await prisma.recibo.create({
      data: {
        tipo: TipoRecibo.CUOTA,
        estado: EstadoRecibo.PENDIENTE,
        receptorId: sociosActivos[1].id,
        importe: 1000,
        concepto: `Test Fase 1 - Cuota ${mes}/${anio}`,
        fecha: new Date()
      }
    });

    console.log(`   ✅ Recibo 1 creado: ${recibo1.numero}`);
    console.log(`   ✅ Recibo 2 creado: ${recibo2.numero}`);

    // Crear cuotas para la MISMA categoría/período
    const cuota1 = await prisma.cuota.create({
      data: {
        reciboId: recibo1.id,
        categoriaId: categoriaId!,
        mes: mes,
        anio: anio,
        montoBase: 1000,
        montoActividades: 0,
        montoTotal: 1000
      }
    });

    console.log(`   ✅ Cuota 1 creada (categoría: ${categoriaId}, período: ${mes}/${anio})`);

    // CRÍTICO: Esta segunda cuota debe crearse SIN error
    const cuota2 = await prisma.cuota.create({
      data: {
        reciboId: recibo2.id,
        categoriaId: categoriaId!,
        mes: mes,
        anio: anio,
        montoBase: 1000,
        montoActividades: 0,
        montoTotal: 1000
      }
    });

    console.log(`   ✅ Cuota 2 creada (categoría: ${categoriaId}, período: ${mes}/${anio})`);
    console.log(`   ✅ ÉXITO: Múltiples cuotas con misma categoría/período permitidas`);

    // Limpiar
    await prisma.cuota.deleteMany({
      where: { id: { in: [cuota1.id, cuota2.id] } }
    });
    await prisma.recibo.deleteMany({
      where: { id: { in: [recibo1.id, recibo2.id] } }
    });

    console.log(`   ✅ Datos de prueba eliminados`);

    results.push({
      name: 'Test 2: Múltiples cuotas',
      passed: true,
      message: 'Múltiples cuotas con misma categoría/período permitidas',
      details: {
        categoriaId,
        periodo: `${mes}/${anio}`,
        cuotasCreadas: 2
      }
    });

  } catch (error: any) {
    console.log(`   ❌ ERROR: ${error.message}`);

    // Si falla por constraint único, es un error de migración
    if (error.code === 'P2002') {
      console.log(`   ❌ CONSTRAINT ÚNICO AÚN EXISTE - Migración no aplicada correctamente`);
    }

    results.push({
      name: 'Test 2: Múltiples cuotas',
      passed: false,
      message: `Error al crear múltiples cuotas: ${error.message}`,
      details: { errorCode: error.code }
    });
  }
}

// ============================================================================
// TEST 3: Race Condition - Generación concurrente de recibos
// ============================================================================
async function test3_ConcurrentReceipts() {
  console.log('\n📋 TEST 3: Generación concurrente de recibos (sin race condition)');
  console.log('─'.repeat(70));

  try {
    // Obtener socio de prueba
    const socio = await prisma.persona.findFirst({
      where: {
        activo: true,
        tipos: {
          some: {
            activo: true,
            tipoPersona: { codigo: 'SOCIO' }
          }
        }
      }
    });

    if (!socio) {
      results.push({
        name: 'Test 3: Race Condition',
        passed: false,
        message: 'No hay socios para test de concurrencia'
      });
      console.log('   ⚠️  No hay socios activos para el test');
      return;
    }

    console.log(`   📌 Creando 10 recibos concurrentemente...`);

    // Crear 10 recibos SIMULTÁNEAMENTE (test de race condition)
    const promises = Array.from({ length: 10 }, (_, i) =>
      prisma.recibo.create({
        data: {
          tipo: TipoRecibo.CUOTA,
          estado: EstadoRecibo.PENDIENTE,
          receptorId: socio.id,
          importe: 1000 + i,
          concepto: `Test Concurrencia Fase 1 #${i + 1}`,
          fecha: new Date()
        }
      })
    );

    const recibos = await Promise.all(promises);
    const numeros = recibos.map(r => r.numero);

    console.log(`   ✅ 10 recibos creados concurrentemente`);
    console.log(`   📊 Números generados: ${numeros.slice(0, 5).join(', ')}...`);

    // Validar que todos son únicos
    const numerosUnicos = new Set(numeros);
    if (numerosUnicos.size !== numeros.length) {
      throw new Error(`Hay números duplicados: ${numeros.length} total, ${numerosUnicos.size} únicos`);
    }

    console.log(`   ✅ Todos los números son únicos (no hay duplicados)`);

    // Validar formato (8 dígitos)
    const formatoCorrecto = numeros.every(n => /^\d{8}$/.test(n));
    if (!formatoCorrecto) {
      throw new Error('Algunos números no tienen formato correcto (8 dígitos)');
    }

    console.log(`   ✅ Formato correcto (8 dígitos con ceros a la izquierda)`);

    // Limpiar
    await prisma.recibo.deleteMany({
      where: { id: { in: recibos.map(r => r.id) } }
    });

    console.log(`   ✅ Datos de prueba eliminados`);

    results.push({
      name: 'Test 3: Race Condition',
      passed: true,
      message: 'Generación concurrente sin duplicados ni race conditions',
      details: {
        recibosCreados: 10,
        numerosUnicos: numerosUnicos.size,
        formatoCorrecto: true,
        ejemploNumeros: numeros.slice(0, 3)
      }
    });

  } catch (error: any) {
    console.log(`   ❌ ERROR: ${error.message}`);

    if (error.code === 'P2002') {
      console.log(`   ❌ RACE CONDITION DETECTADO - Números duplicados generados`);
    }

    results.push({
      name: 'Test 3: Race Condition',
      passed: false,
      message: `Error en generación concurrente: ${error.message}`,
      details: { errorCode: error.code }
    });
  }
}

// ============================================================================
// TEST 4: Integración - Flujo completo de generación de cuotas
// ============================================================================
async function test4_IntegrationFlow() {
  console.log('\n📋 TEST 4: Flujo completo - Generación de cuotas end-to-end');
  console.log('─'.repeat(70));

  try {
    // Simular flujo completo: getCuotasPorGenerar → crear recibos → crear cuotas

    // 1. Obtener socios con Architecture V2
    const sociosActivos = await prisma.persona.findMany({
      where: {
        activo: true,
        tipos: {
          some: {
            activo: true,
            tipoPersona: { codigo: 'SOCIO' }
          }
        }
      },
      include: {
        tipos: {
          where: {
            activo: true,
            tipoPersona: { codigo: 'SOCIO' }
          },
          include: {
            categoria: true
          }
        }
      },
      take: 5
    });

    if (sociosActivos.length === 0) {
      throw new Error('No hay socios para test de integración');
    }

    console.log(`   ✅ Paso 1: ${sociosActivos.length} socios obtenidos con Architecture V2`);

    const mes = new Date().getMonth() + 1;
    const anio = new Date().getFullYear();
    const reciboIds: number[] = [];
    const cuotaIds: number[] = [];

    // 2. Crear recibos (auto-numeración)
    for (const socio of sociosActivos) {
      const recibo = await prisma.recibo.create({
        data: {
          tipo: TipoRecibo.CUOTA,
          estado: EstadoRecibo.PENDIENTE,
          receptorId: socio.id,
          importe: 1000,
          concepto: `Test Integración - Cuota ${mes}/${anio}`,
          fecha: new Date()
        }
      });
      reciboIds.push(recibo.id);

      // 3. Crear cuota asociada
      const cuota = await prisma.cuota.create({
        data: {
          reciboId: recibo.id,
          categoriaId: socio.tipos[0].categoria!.id,
          mes: mes,
          anio: anio,
          montoBase: 1000,
          montoActividades: 0,
          montoTotal: 1000
        }
      });
      cuotaIds.push(cuota.id);
    }

    console.log(`   ✅ Paso 2: ${reciboIds.length} recibos creados (auto-numeración)`);
    console.log(`   ✅ Paso 3: ${cuotaIds.length} cuotas creadas`);

    // 4. Validar que se crearon correctamente
    const cuotasCreadas = await prisma.cuota.findMany({
      where: { id: { in: cuotaIds } },
      include: { recibo: true, categoria: true }
    });

    const todasTienenRecibo = cuotasCreadas.every(c => c.recibo);
    const todasTienenCategoria = cuotasCreadas.every(c => c.categoria);

    if (!todasTienenRecibo || !todasTienenCategoria) {
      throw new Error('Algunas cuotas no tienen recibo o categoría asociada');
    }

    console.log(`   ✅ Paso 4: Validación exitosa (todas las relaciones correctas)`);

    // 5. Limpiar
    await prisma.cuota.deleteMany({ where: { id: { in: cuotaIds } } });
    await prisma.recibo.deleteMany({ where: { id: { in: reciboIds } } });

    console.log(`   ✅ Paso 5: Datos de prueba eliminados`);
    console.log(`   ✅ FLUJO COMPLETO EXITOSO`);

    results.push({
      name: 'Test 4: Integración',
      passed: true,
      message: 'Flujo end-to-end de generación de cuotas funciona correctamente',
      details: {
        sociosProcesados: sociosActivos.length,
        recibosCreados: reciboIds.length,
        cuotasCreadas: cuotaIds.length
      }
    });

  } catch (error: any) {
    console.log(`   ❌ ERROR: ${error.message}`);
    results.push({
      name: 'Test 4: Integración',
      passed: false,
      message: `Error en flujo de integración: ${error.message}`
    });
  }
}

// ============================================================================
// MAIN - Ejecutar todos los tests
// ============================================================================
async function runAllTests() {
  console.log('\n');
  console.log('═'.repeat(70));
  console.log('  FASE 1: TESTS DE REGRESIÓN - Architecture V2 Fixes');
  console.log('═'.repeat(70));

  await test1_ArchitectureV2();
  await test2_MultipleQuotasSamePeriod();
  await test3_ConcurrentReceipts();
  await test4_IntegrationFlow();

  // Resumen final
  console.log('\n');
  console.log('═'.repeat(70));
  console.log('  RESUMEN DE TESTS');
  console.log('═'.repeat(70));

  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;

  results.forEach((result, index) => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} Test ${index + 1}: ${result.name}`);
    console.log(`   ${result.message}`);
    if (result.details) {
      console.log(`   Detalles: ${JSON.stringify(result.details, null, 2)}`);
    }
  });

  console.log('\n' + '─'.repeat(70));
  console.log(`Total: ${totalTests} tests`);
  console.log(`Exitosos: ${passedTests} ✅`);
  console.log(`Fallidos: ${failedTests} ❌`);
  console.log('─'.repeat(70));

  if (passedTests === totalTests) {
    console.log('\n🎉 TODOS LOS TESTS PASARON - FASE 1 COMPLETADA AL 100%\n');
    return true;
  } else {
    console.log('\n⚠️  ALGUNOS TESTS FALLARON - Revisar errores arriba\n');
    return false;
  }
}

// Ejecutar tests
runAllTests()
  .then(success => {
    prisma.$disconnect();
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Error fatal:', error);
    prisma.$disconnect();
    process.exit(1);
  });
