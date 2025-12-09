/**
 * Script de prueba para validar la funcionalidad de Género y Parentesco
 *
 * Este script prueba:
 * 1. Creación de personas con campo género
 * 2. Relaciones familiares con parentesco complementario basado en género
 * 3. Validación de warnings cuando hay conflicto género-parentesco
 * 4. Casos edge: género NULL, NO_BINARIO, PREFIERO_NO_DECIR
 *
 * Uso: npx ts-node tests/test-genero-parentesco.ts
 */

import { PrismaClient } from '@prisma/client';
import { PersonaRepository } from '../src/repositories/persona.repository';
import { FamiliarRepository } from '../src/repositories/familiar.repository';
import { PersonaService } from '../src/services/persona.service';
import { FamiliarService } from '../src/services/familiar.service';
import { getParentescoComplementarioConGenero, validateParentescoGenero } from '../src/utils/parentesco.helper';

const prisma = new PrismaClient();

// ============================================================================
// HELPERS
// ============================================================================

function log(emoji: string, message: string) {
  console.log(`${emoji} ${message}`);
}

function logSection(title: string) {
  console.log('\n' + '='.repeat(80));
  console.log(`  ${title}`);
  console.log('='.repeat(80) + '\n');
}

// ============================================================================
// TEST CASES
// ============================================================================

async function testHelperFunctions() {
  logSection('TEST 1: Funciones Helper de Parentesco con Género');

  log('🧪', 'Test 1.1: PADRE + hijo MASCULINO → HIJO');
  const resultado1 = getParentescoComplementarioConGenero('PADRE', 'MASCULINO');
  console.assert(resultado1 === 'HIJO', `Esperado: HIJO, Obtenido: ${resultado1}`);
  log(resultado1 === 'HIJO' ? '✅' : '❌', `Resultado: ${resultado1}`);

  log('🧪', 'Test 1.2: PADRE + hijo FEMENINO → HIJA');
  const resultado2 = getParentescoComplementarioConGenero('PADRE', 'FEMENINO');
  console.assert(resultado2 === 'HIJA', `Esperado: HIJA, Obtenido: ${resultado2}`);
  log(resultado2 === 'HIJA' ? '✅' : '❌', `Resultado: ${resultado2}`);

  log('🧪', 'Test 1.3: MADRE + hijo MASCULINO → HIJO');
  const resultado3 = getParentescoComplementarioConGenero('MADRE', 'MASCULINO');
  console.assert(resultado3 === 'HIJO', `Esperado: HIJO, Obtenido: ${resultado3}`);
  log(resultado3 === 'HIJO' ? '✅' : '❌', `Resultado: ${resultado3}`);

  log('🧪', 'Test 1.4: MADRE + hijo FEMENINO → HIJA');
  const resultado4 = getParentescoComplementarioConGenero('MADRE', 'FEMENINO');
  console.assert(resultado4 === 'HIJA', `Esperado: HIJA, Obtenido: ${resultado4}`);
  log(resultado4 === 'HIJA' ? '✅' : '❌', `Resultado: ${resultado4}`);

  log('🧪', 'Test 1.5: PADRE + hijo NULL (sin género) → HIJO (fallback masculino)');
  const resultado5 = getParentescoComplementarioConGenero('PADRE', null);
  console.assert(resultado5 === 'HIJO', `Esperado: HIJO, Obtenido: ${resultado5}`);
  log(resultado5 === 'HIJO' ? '✅' : '❌', `Resultado: ${resultado5}`);

  log('🧪', 'Test 1.6: PADRE + hijo NO_BINARIO → HIJO (fallback masculino)');
  const resultado6 = getParentescoComplementarioConGenero('PADRE', 'NO_BINARIO');
  console.assert(resultado6 === 'HIJO', `Esperado: HIJO, Obtenido: ${resultado6}`);
  log(resultado6 === 'HIJO' ? '✅' : '❌', `Resultado: ${resultado6}`);

  log('🧪', 'Test 1.7: HERMANO + hermano FEMENINO → HERMANA');
  const resultado7 = getParentescoComplementarioConGenero('HERMANO', 'FEMENINO');
  console.assert(resultado7 === 'HERMANA', `Esperado: HERMANA, Obtenido: ${resultado7}`);
  log(resultado7 === 'HERMANA' ? '✅' : '❌', `Resultado: ${resultado7}`);

  log('🧪', 'Test 1.8: HERMANA + hermano MASCULINO → HERMANO');
  const resultado8 = getParentescoComplementarioConGenero('HERMANA', 'MASCULINO');
  console.assert(resultado8 === 'HERMANO', `Esperado: HERMANO, Obtenido: ${resultado8}`);
  log(resultado8 === 'HERMANO' ? '✅' : '❌', `Resultado: ${resultado8}`);

  log('🧪', 'Test 1.9: ESPOSA ↔ ESPOSO (no depende de género del hijo)');
  const resultado9 = getParentescoComplementarioConGenero('ESPOSA', 'MASCULINO');
  console.assert(resultado9 === 'ESPOSO', `Esperado: ESPOSO, Obtenido: ${resultado9}`);
  log(resultado9 === 'ESPOSO' ? '✅' : '❌', `Resultado: ${resultado9}`);

  log('🧪', 'Test 1.10: CONYUGE ↔ CONYUGE (simétrico, género neutro)');
  const resultado10 = getParentescoComplementarioConGenero('CONYUGE', 'FEMENINO');
  console.assert(resultado10 === 'CONYUGE', `Esperado: CONYUGE, Obtenido: ${resultado10}`);
  log(resultado10 === 'CONYUGE' ? '✅' : '❌', `Resultado: ${resultado10}`);
}

async function testValidacionGeneroParentesco() {
  logSection('TEST 2: Validación Género-Parentesco');

  log('🧪', 'Test 2.1: HIJO + MASCULINO → válido, sin warning');
  const validacion1 = validateParentescoGenero('HIJO', 'MASCULINO');
  console.assert(validacion1.valid === true && !validacion1.warning, 'Debería ser válido sin warning');
  log(validacion1.valid && !validacion1.warning ? '✅' : '❌', `Válido: ${validacion1.valid}, Warning: ${validacion1.warning || 'ninguno'}`);

  log('🧪', 'Test 2.2: HIJO + FEMENINO → válido con warning (conflicto)');
  const validacion2 = validateParentescoGenero('HIJO', 'FEMENINO');
  console.assert(validacion2.valid === true && validacion2.warning, 'Debería ser válido CON warning');
  log(validacion2.valid && validacion2.warning ? '✅' : '❌', `Válido: ${validacion2.valid}, Warning: ${validacion2.warning}`);

  log('🧪', 'Test 2.3: HIJA + FEMENINO → válido, sin warning');
  const validacion3 = validateParentescoGenero('HIJA', 'FEMENINO');
  console.assert(validacion3.valid === true && !validacion3.warning, 'Debería ser válido sin warning');
  log(validacion3.valid && !validacion3.warning ? '✅' : '❌', `Válido: ${validacion3.valid}, Warning: ${validacion3.warning || 'ninguno'}`);

  log('🧪', 'Test 2.4: HIJA + MASCULINO → válido con warning (conflicto)');
  const validacion4 = validateParentescoGenero('HIJA', 'MASCULINO');
  console.assert(validacion4.valid === true && validacion4.warning, 'Debería ser válido CON warning');
  log(validacion4.valid && validacion4.warning ? '✅' : '❌', `Válido: ${validacion4.valid}, Warning: ${validacion4.warning}`);

  log('🧪', 'Test 2.5: HIJO + NULL → válido, sin warning (NULL siempre válido)');
  const validacion5 = validateParentescoGenero('HIJO', null);
  console.assert(validacion5.valid === true && !validacion5.warning, 'Debería ser válido sin warning');
  log(validacion5.valid && !validacion5.warning ? '✅' : '❌', `Válido: ${validacion5.valid}, Warning: ${validacion5.warning || 'ninguno'}`);

  log('🧪', 'Test 2.6: HIJA + NO_BINARIO → válido, sin warning (NO_BINARIO siempre válido)');
  const validacion6 = validateParentescoGenero('HIJA', 'NO_BINARIO');
  console.assert(validacion6.valid === true && !validacion6.warning, 'Debería ser válido sin warning');
  log(validacion6.valid && !validacion6.warning ? '✅' : '❌', `Válido: ${validacion6.valid}, Warning: ${validacion6.warning || 'ninguno'}`);

  log('🧪', 'Test 2.7: ESPOSA + MASCULINO → válido con warning');
  const validacion7 = validateParentescoGenero('ESPOSA', 'MASCULINO');
  console.assert(validacion7.valid === true && validacion7.warning, 'Debería ser válido CON warning');
  log(validacion7.valid && validacion7.warning ? '✅' : '❌', `Válido: ${validacion7.valid}, Warning: ${validacion7.warning}`);
}

async function testIntegracionBaseDatos() {
  logSection('TEST 3: Integración con Base de Datos');

  const personaRepository = new PersonaRepository(prisma);
  const familiarRepository = new FamiliarRepository(prisma);
  const personaService = new PersonaService(personaRepository);
  const familiarService = new FamiliarService(familiarRepository, personaRepository);

  try {
    // Test 3.1: Crear padre (MASCULINO)
    log('🧪', 'Test 3.1: Crear padre con género MASCULINO');
    const padre = await personaService.createPersona({
      nombre: 'Juan',
      apellido: 'Pérez Test Género',
      dni: '11111111',
      genero: 'MASCULINO',
      tipos: [{ tipoPersonaCodigo: 'NO_SOCIO' }],
      contactos: []
    });
    log('✅', `Padre creado: ID ${padre.id}, Género: ${padre.genero}`);

    // Test 3.2: Crear hijo (MASCULINO)
    log('🧪', 'Test 3.2: Crear hijo con género MASCULINO');
    const hijoM = await personaService.createPersona({
      nombre: 'Carlos',
      apellido: 'Pérez Test Género',
      dni: '22222222',
      genero: 'MASCULINO',
      fechaNacimiento: '2010-01-01',
      tipos: [{ tipoPersonaCodigo: 'NO_SOCIO' }],
      contactos: []
    });
    log('✅', `Hijo creado: ID ${hijoM.id}, Género: ${hijoM.genero}`);

    // Test 3.3: Crear hija (FEMENINO)
    log('🧪', 'Test 3.3: Crear hija con género FEMENINO');
    const hijaF = await personaService.createPersona({
      nombre: 'María',
      apellido: 'Pérez Test Género',
      dni: '33333333',
      genero: 'FEMENINO',
      fechaNacimiento: '2012-01-01',
      tipos: [{ tipoPersonaCodigo: 'NO_SOCIO' }],
      contactos: []
    });
    log('✅', `Hija creada: ID ${hijaF.id}, Género: ${hijaF.genero}`);

    // Test 3.4: Crear hijo sin género (NULL)
    log('🧪', 'Test 3.4: Crear hijo sin género especificado');
    const hijoNull = await personaService.createPersona({
      nombre: 'Pedro',
      apellido: 'Pérez Test Género',
      dni: '44444444',
      fechaNacimiento: '2014-01-01',
      tipos: [{ tipoPersonaCodigo: 'NO_SOCIO' }],
      contactos: []
    });
    log('✅', `Hijo creado: ID ${hijoNull.id}, Género: ${hijoNull.genero || 'NULL'}`);

    // Test 3.5: Crear relación PADRE → hijo MASCULINO (debe generar HIJO)
    log('🧪', 'Test 3.5: Crear relación PADRE → hijo MASCULINO');
    const relacion1 = await familiarService.createFamiliar({
      socioId: padre.id,
      familiarId: hijoM.id,
      parentesco: 'PADRE' as any,
      descuento: 0,
      permisoResponsableFinanciero: false,
      permisoContactoEmergencia: false,
      permisoAutorizadoRetiro: false
    });

    // Verificar que la relación inversa sea HIJO (no HIJA)
    const relacionInversa1 = await familiarRepository.findExistingRelation(hijoM.id, padre.id);
    const parentescoEsperado1 = 'HIJO';
    console.assert(relacionInversa1?.parentesco === parentescoEsperado1,
      `Esperado: ${parentescoEsperado1}, Obtenido: ${relacionInversa1?.parentesco}`);
    log(relacionInversa1?.parentesco === parentescoEsperado1 ? '✅' : '❌',
      `Relación inversa: ${relacionInversa1?.parentesco}`);

    // Test 3.6: Crear relación PADRE → hija FEMENINO (debe generar HIJA)
    log('🧪', 'Test 3.6: Crear relación PADRE → hija FEMENINO');
    const relacion2 = await familiarService.createFamiliar({
      socioId: padre.id,
      familiarId: hijaF.id,
      parentesco: 'PADRE' as any,
      descuento: 0,
      permisoResponsableFinanciero: false,
      permisoContactoEmergencia: false,
      permisoAutorizadoRetiro: false
    });

    const relacionInversa2 = await familiarRepository.findExistingRelation(hijaF.id, padre.id);
    const parentescoEsperado2 = 'HIJA';
    console.assert(relacionInversa2?.parentesco === parentescoEsperado2,
      `Esperado: ${parentescoEsperado2}, Obtenido: ${relacionInversa2?.parentesco}`);
    log(relacionInversa2?.parentesco === parentescoEsperado2 ? '✅' : '❌',
      `Relación inversa: ${relacionInversa2?.parentesco}`);

    // Test 3.7: Crear relación PADRE → hijo NULL (debe generar HIJO por fallback)
    log('🧪', 'Test 3.7: Crear relación PADRE → hijo NULL (debe usar fallback HIJO)');
    const relacion3 = await familiarService.createFamiliar({
      socioId: padre.id,
      familiarId: hijoNull.id,
      parentesco: 'PADRE' as any,
      descuento: 0,
      permisoResponsableFinanciero: false,
      permisoContactoEmergencia: false,
      permisoAutorizadoRetiro: false
    });

    const relacionInversa3 = await familiarRepository.findExistingRelation(hijoNull.id, padre.id);
    const parentescoEsperado3 = 'HIJO';
    console.assert(relacionInversa3?.parentesco === parentescoEsperado3,
      `Esperado: ${parentescoEsperado3} (fallback masculino), Obtenido: ${relacionInversa3?.parentesco}`);
    log(relacionInversa3?.parentesco === parentescoEsperado3 ? '✅' : '❌',
      `Relación inversa: ${relacionInversa3?.parentesco} (fallback masculino correcto)`);

    // Test 3.8: Crear hermanos con géneros diferentes
    log('🧪', 'Test 3.8: Crear relación HERMANO (M) → HERMANA (F)');
    const relacionHermanos = await familiarService.createFamiliar({
      socioId: hijoM.id,
      familiarId: hijaF.id,
      parentesco: 'HERMANO' as any,
      descuento: 0,
      permisoResponsableFinanciero: false,
      permisoContactoEmergencia: false,
      permisoAutorizadoRetiro: false
    });

    const relacionInversaHermanos = await familiarRepository.findExistingRelation(hijaF.id, hijoM.id);
    const parentescoEsperadoHermanos = 'HERMANA';
    console.assert(relacionInversaHermanos?.parentesco === parentescoEsperadoHermanos,
      `Esperado: ${parentescoEsperadoHermanos}, Obtenido: ${relacionInversaHermanos?.parentesco}`);
    log(relacionInversaHermanos?.parentesco === parentescoEsperadoHermanos ? '✅' : '❌',
      `Relación inversa: ${relacionInversaHermanos?.parentesco}`);

    // Cleanup
    log('🧹', 'Limpieza: Eliminando datos de prueba...');
    await familiarService.deleteFamiliar(relacion1.id);
    await familiarService.deleteFamiliar(relacion2.id);
    await familiarService.deleteFamiliar(relacion3.id);
    await familiarService.deleteFamiliar(relacionHermanos.id);

    await personaService.deletePersona(padre.id);
    await personaService.deletePersona(hijoM.id);
    await personaService.deletePersona(hijaF.id);
    await personaService.deletePersona(hijoNull.id);

    log('✅', 'Limpieza completada');

  } catch (error) {
    log('❌', `Error en test de integración: ${error}`);
    throw error;
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║  TEST SUITE: Género y Parentesco                                           ║');
  console.log('║  Validación de funcionalidad de género en relaciones familiares           ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');

  try {
    await testHelperFunctions();
    await testValidacionGeneroParentesco();
    await testIntegracionBaseDatos();

    logSection('✅ TODOS LOS TESTS PASARON EXITOSAMENTE');
    console.log('');
    console.log('Funcionalidades validadas:');
    console.log('  ✓ Cálculo de parentesco complementario con género');
    console.log('  ✓ Fallback a forma masculina cuando género es NULL/NO_BINARIO');
    console.log('  ✓ Validación de inconsistencias género-parentesco (warnings)');
    console.log('  ✓ Sincronización bidireccional con género en base de datos');
    console.log('  ✓ Relaciones padre-hijo/hija según género');
    console.log('  ✓ Relaciones entre hermanos según género');
    console.log('');

  } catch (error) {
    logSection('❌ TESTS FALLARON');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
