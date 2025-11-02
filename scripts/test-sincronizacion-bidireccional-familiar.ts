/**
 * Script de Validación: Sincronización Bidireccional de Relaciones Familiares
 *
 * Este script valida que la sincronización bidireccional funciona correctamente:
 * 1. CREATE: Al crear A→B, se crea automáticamente B→A con parentesco complementario
 * 2. UPDATE: Al actualizar A→B, se actualiza automáticamente B→A
 * 3. DELETE: Al eliminar A→B, se elimina automáticamente B→A
 * 4. Validación de parentescos complementarios correctos
 * 5. Validación de sincronización de permisos, descuentos y grupo familiar
 */

import { PrismaClient, TipoParentesco } from '@prisma/client';
import { FamiliarRepository } from '../src/repositories/familiar.repository';
import { FamiliarService } from '../src/services/familiar.service';
import { PersonaRepository } from '../src/repositories/persona.repository';
import { getParentescoComplementario } from '../src/utils/parentesco.helper';

const prisma = new PrismaClient();
const familiarRepo = new FamiliarRepository(prisma);
const personaRepo = new PersonaRepository(prisma);
const familiarService = new FamiliarService(familiarRepo, personaRepo);

interface TestResult {
  nombre: string;
  pasado: boolean;
  mensaje: string;
}

const resultados: TestResult[] = [];

function addResultado(nombre: string, pasado: boolean, mensaje: string) {
  resultados.push({ nombre, pasado, mensaje });
  const icono = pasado ? '✅' : '❌';
  console.log(`${icono} ${nombre}: ${mensaje}`);
}

async function testSincronizacionBidireccional() {
  console.log('🔍 Iniciando validación de sincronización bidireccional de relaciones familiares...\n');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');

  let relacionPrincipalId: number | null = null;
  let relacionInversaId: number | null = null;
  let persona1Id: number | null = null;
  let persona2Id: number | null = null;

  try {
    // ========================================================================
    // PASO 1: Buscar dos personas para testing
    // ========================================================================
    console.log('PASO 1: Buscando personas para testing...\n');

    const personas = await prisma.persona.findMany({
      where: {
        fechaBaja: null // Solo personas activas
      },
      take: 2,
      select: {
        id: true,
        nombre: true,
        apellido: true,
        tipo: true,
        fechaNacimiento: true
      }
    });

    if (personas.length < 2) {
      throw new Error('Se necesitan al menos 2 personas activas en el sistema para el test');
    }

    persona1Id = personas[0].id;
    persona2Id = personas[1].id;

    console.log(`   Persona 1: ${personas[0].nombre} ${personas[0].apellido} (ID: ${persona1Id}) [${personas[0].tipo}]`);
    console.log(`   Persona 2: ${personas[1].nombre} ${personas[1].apellido} (ID: ${persona2Id}) [${personas[1].tipo}]`);
    console.log('');

    // ========================================================================
    // TEST 1: CREATE - Creación Bidireccional Automática
    // ========================================================================
    console.log('TEST 1: Validando creación bidireccional automática...\n');

    const parentescoOriginal = TipoParentesco.PADRE;
    const parentescoEsperado = getParentescoComplementario(parentescoOriginal);

    console.log(`   Creando relación: ${personas[0].nombre} es ${parentescoOriginal} de ${personas[1].nombre}`);
    console.log(`   Parentesco complementario esperado: ${parentescoEsperado}\n`);

    const relacionCreada = await familiarService.createFamiliar({
      socioId: persona1Id,
      familiarId: persona2Id,
      parentesco: parentescoOriginal,
      descuento: 10,
      permisoResponsableFinanciero: true,
      permisoContactoEmergencia: true,
      permisoAutorizadoRetiro: false,
      descripcion: 'Relación de prueba para testing de sincronización bidireccional'
    });

    relacionPrincipalId = relacionCreada.id;
    console.log(`   ✓ Relación principal creada: ID ${relacionPrincipalId}`);

    // Buscar la relación inversa
    const relacionInversa = await familiarRepo.findExistingRelation(persona2Id, persona1Id);

    if (!relacionInversa) {
      addResultado('TEST 1.1: Relación inversa creada', false, 'No se creó la relación inversa automáticamente');
    } else {
      relacionInversaId = relacionInversa.id;
      console.log(`   ✓ Relación inversa encontrada: ID ${relacionInversaId}`);

      // Validar parentesco complementario
      if (relacionInversa.parentesco === parentescoEsperado) {
        addResultado('TEST 1.1: Parentesco complementario', true, `Correcto: ${relacionInversa.parentesco}`);
      } else {
        addResultado('TEST 1.1: Parentesco complementario', false, `Esperado: ${parentescoEsperado}, Obtenido: ${relacionInversa.parentesco}`);
      }

      // Validar sincronización de descuento
      if (relacionInversa.descuento === 10) {
        addResultado('TEST 1.2: Sincronización de descuento', true, 'Descuento sincronizado correctamente (10%)');
      } else {
        addResultado('TEST 1.2: Sincronización de descuento', false, `Esperado: 10, Obtenido: ${relacionInversa.descuento}`);
      }

      // Validar sincronización de permisos
      const permisosCorrectos =
        relacionInversa.permisoResponsableFinanciero === true &&
        relacionInversa.permisoContactoEmergencia === true &&
        relacionInversa.permisoAutorizadoRetiro === false;

      if (permisosCorrectos) {
        addResultado('TEST 1.3: Sincronización de permisos', true, 'Permisos sincronizados correctamente');
      } else {
        addResultado('TEST 1.3: Sincronización de permisos', false, 'Permisos no coinciden');
      }

      // Validar que la descripción indica relación complementaria
      const tieneReferenciaComplementaria = relacionInversa.descripcion?.includes('complementaria') || false;
      if (tieneReferenciaComplementaria) {
        addResultado('TEST 1.4: Descripción de relación inversa', true, 'Descripción indica relación complementaria');
      } else {
        addResultado('TEST 1.4: Descripción de relación inversa', false, 'Descripción no indica relación complementaria');
      }
    }

    console.log('');

    // ========================================================================
    // TEST 2: UPDATE - Actualización Bidireccional
    // ========================================================================
    console.log('TEST 2: Validando actualización bidireccional...\n');

    if (!relacionPrincipalId || !relacionInversaId) {
      addResultado('TEST 2: UPDATE bidireccional', false, 'No se pueden realizar tests de UPDATE sin relaciones creadas');
    } else {
      // Actualizar descuento y permisos
      console.log('   Actualizando relación principal:');
      console.log('   - Nuevo descuento: 15%');
      console.log('   - Cambiar permisoAutorizadoRetiro: true');
      console.log('');

      await familiarService.updateFamiliar(relacionPrincipalId, {
        descuento: 15,
        permisoAutorizadoRetiro: true
      });

      // Verificar sincronización en relación inversa
      const relacionInversaActualizada = await familiarRepo.findById(relacionInversaId);

      if (!relacionInversaActualizada) {
        addResultado('TEST 2.1: Relación inversa existe después de UPDATE', false, 'Relación inversa no encontrada');
      } else {
        // Validar descuento actualizado
        if (relacionInversaActualizada.descuento === 15) {
          addResultado('TEST 2.1: UPDATE de descuento sincronizado', true, 'Descuento actualizado en relación inversa (15%)');
        } else {
          addResultado('TEST 2.1: UPDATE de descuento sincronizado', false, `Esperado: 15, Obtenido: ${relacionInversaActualizada.descuento}`);
        }

        // Validar permiso actualizado
        if (relacionInversaActualizada.permisoAutorizadoRetiro === true) {
          addResultado('TEST 2.2: UPDATE de permiso sincronizado', true, 'Permiso actualizado en relación inversa');
        } else {
          addResultado('TEST 2.2: UPDATE de permiso sincronizado', false, 'Permiso no sincronizado');
        }
      }

      // Test de actualización de parentesco
      console.log('\n   Actualizando parentesco a HERMANO...\n');

      await familiarService.updateFamiliar(relacionPrincipalId, {
        parentesco: TipoParentesco.HERMANO
      });

      const relacionInversaConNuevoParentesco = await familiarRepo.findById(relacionInversaId);

      if (!relacionInversaConNuevoParentesco) {
        addResultado('TEST 2.3: UPDATE de parentesco sincronizado', false, 'Relación inversa no encontrada');
      } else {
        const parentescoComplementarioHermano = getParentescoComplementario(TipoParentesco.HERMANO);
        if (relacionInversaConNuevoParentesco.parentesco === parentescoComplementarioHermano) {
          addResultado('TEST 2.3: UPDATE de parentesco sincronizado', true, `Parentesco complementario actualizado a ${parentescoComplementarioHermano}`);
        } else {
          addResultado('TEST 2.3: UPDATE de parentesco sincronizado', false, `Esperado: ${parentescoComplementarioHermano}, Obtenido: ${relacionInversaConNuevoParentesco.parentesco}`);
        }
      }
    }

    console.log('');

    // ========================================================================
    // TEST 3: DELETE - Eliminación Bidireccional
    // ========================================================================
    console.log('TEST 3: Validando eliminación bidireccional...\n');

    if (!relacionPrincipalId || !relacionInversaId) {
      addResultado('TEST 3: DELETE bidireccional', false, 'No se pueden realizar tests de DELETE sin relaciones creadas');
    } else {
      console.log(`   Eliminando relación principal (ID: ${relacionPrincipalId})...\n`);

      await familiarService.deleteFamiliar(relacionPrincipalId);

      // Verificar que ambas relaciones fueron eliminadas
      const relacionPrincipalEliminada = await familiarRepo.findById(relacionPrincipalId);
      const relacionInversaEliminada = await familiarRepo.findById(relacionInversaId);

      if (relacionPrincipalEliminada === null) {
        addResultado('TEST 3.1: Relación principal eliminada', true, 'Relación principal eliminada correctamente');
      } else {
        addResultado('TEST 3.1: Relación principal eliminada', false, 'Relación principal aún existe');
      }

      if (relacionInversaEliminada === null) {
        addResultado('TEST 3.2: Relación inversa eliminada', true, 'Relación inversa eliminada automáticamente');
      } else {
        addResultado('TEST 3.2: Relación inversa eliminada', false, 'Relación inversa NO fue eliminada (sincronización fallida)');
      }

      // Marcar IDs como null para indicar que fueron eliminadas
      relacionPrincipalId = null;
      relacionInversaId = null;
    }

    console.log('');

    // ========================================================================
    // TEST 4: Prevención de duplicados bidireccionales
    // ========================================================================
    console.log('TEST 4: Validando prevención de duplicados bidireccionales...\n');

    // Crear una relación nueva
    const nuevaRelacion = await familiarService.createFamiliar({
      socioId: persona1Id,
      familiarId: persona2Id,
      parentesco: TipoParentesco.PRIMO,
      descuento: 0
    });

    relacionPrincipalId = nuevaRelacion.id;
    const nuevaRelacionInversa = await familiarRepo.findExistingRelation(persona2Id, persona1Id);
    relacionInversaId = nuevaRelacionInversa?.id || null;

    console.log(`   Relación creada: ${personas[0].nombre} es PRIMO de ${personas[1].nombre}`);
    console.log(`   Intentando crear relación duplicada en sentido inverso...\n`);

    try {
      await familiarService.createFamiliar({
        socioId: persona2Id,
        familiarId: persona1Id,
        parentesco: TipoParentesco.PRIMO,
        descuento: 0
      });

      addResultado('TEST 4.1: Prevención de duplicados bidireccionales', false, 'Se permitió crear relación duplicada');
    } catch (error: any) {
      if (error.message.includes('Ya existe una relación familiar')) {
        addResultado('TEST 4.1: Prevención de duplicados bidireccionales', true, 'Duplicado detectado correctamente');
      } else {
        addResultado('TEST 4.1: Prevención de duplicados bidireccionales', false, `Error inesperado: ${error.message}`);
      }
    }

    console.log('');

    // ========================================================================
    // TEST 5: Validación de parentescos complementarios de todo el catálogo
    // ========================================================================
    console.log('TEST 5: Validando mapa completo de parentescos complementarios...\n');

    const parentescosAValidar: Array<{ original: TipoParentesco; complementario: TipoParentesco }> = [
      { original: TipoParentesco.PADRE, complementario: TipoParentesco.HIJO },
      { original: TipoParentesco.MADRE, complementario: TipoParentesco.HIJA },
      { original: TipoParentesco.HIJO, complementario: TipoParentesco.PADRE },
      { original: TipoParentesco.HIJA, complementario: TipoParentesco.MADRE },
      { original: TipoParentesco.HERMANO, complementario: TipoParentesco.HERMANO },
      { original: TipoParentesco.HERMANA, complementario: TipoParentesco.HERMANA },
      { original: TipoParentesco.ABUELO, complementario: TipoParentesco.NIETO },
      { original: TipoParentesco.ABUELA, complementario: TipoParentesco.NIETA },
      { original: TipoParentesco.TIO, complementario: TipoParentesco.SOBRINO },
      { original: TipoParentesco.TIA, complementario: TipoParentesco.SOBRINA },
      { original: TipoParentesco.PRIMO, complementario: TipoParentesco.PRIMO },
      { original: TipoParentesco.PRIMA, complementario: TipoParentesco.PRIMA },
      { original: TipoParentesco.CONYUGE, complementario: TipoParentesco.CONYUGE }
    ];

    let parentescosCorrectos = 0;
    let parentescosIncorrectos = 0;

    for (const { original, complementario } of parentescosAValidar) {
      const resultado = getParentescoComplementario(original);
      if (resultado === complementario) {
        parentescosCorrectos++;
        console.log(`   ✓ ${original} → ${resultado} (correcto)`);
      } else {
        parentescosIncorrectos++;
        console.log(`   ✗ ${original} → ${resultado} (esperado: ${complementario})`);
      }
    }

    if (parentescosIncorrectos === 0) {
      addResultado('TEST 5.1: Mapa de parentescos complementarios', true, `Todos los ${parentescosCorrectos} parentescos validados correctamente`);
    } else {
      addResultado('TEST 5.1: Mapa de parentescos complementarios', false, `${parentescosIncorrectos} de ${parentescosAValidar.length} parentescos incorrectos`);
    }

    console.log('');

    // ========================================================================
    // RESUMEN FINAL
    // ========================================================================
    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log('                        RESUMEN DE VALIDACIÓN                              ');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

    const testsPasados = resultados.filter(r => r.pasado).length;
    const testsTotales = resultados.length;
    const porcentajeExito = ((testsPasados / testsTotales) * 100).toFixed(1);

    console.log(`Tests ejecutados: ${testsTotales}`);
    console.log(`Tests pasados: ${testsPasados}`);
    console.log(`Tests fallidos: ${testsTotales - testsPasados}`);
    console.log(`Porcentaje de éxito: ${porcentajeExito}%\n`);

    if (testsPasados === testsTotales) {
      console.log('✅ TODOS LOS TESTS PASARON EXITOSAMENTE\n');
      console.log('La sincronización bidireccional de relaciones familiares está:');
      console.log('  ✅ CREATE: Crea automáticamente relación inversa con parentesco complementario');
      console.log('  ✅ UPDATE: Sincroniza cambios a relación inversa (descuentos, permisos, parentesco)');
      console.log('  ✅ DELETE: Elimina automáticamente relación inversa');
      console.log('  ✅ Previene duplicados bidireccionales');
      console.log('  ✅ Mapa de parentescos complementarios completo y correcto\n');
      console.log('El problema de sincronización bidireccional ha sido RESUELTO.\n');
    } else {
      console.log('❌ ALGUNOS TESTS FALLARON\n');
      console.log('Tests fallidos:');
      resultados.filter(r => !r.pasado).forEach(r => {
        console.log(`  ❌ ${r.nombre}: ${r.mensaje}`);
      });
      console.log('');
      process.exit(1);
    }

  } catch (error: any) {
    console.error('\n❌ ERROR DURANTE LA VALIDACIÓN:');
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);

  } finally {
    // Limpieza: Eliminar relaciones de prueba si aún existen
    if (relacionPrincipalId || relacionInversaId) {
      console.log('🧹 Limpiando datos de prueba...');
      try {
        if (relacionPrincipalId) {
          await familiarRepo.delete(relacionPrincipalId).catch(() => {});
        }
        if (relacionInversaId) {
          await familiarRepo.delete(relacionInversaId).catch(() => {});
        }
        console.log('✅ Datos de prueba eliminados\n');
      } catch (cleanupError) {
        console.log('⚠️  Error durante limpieza (no crítico)\n');
      }
    }

    await prisma.$disconnect();
  }
}

// Ejecutar validación
testSincronizacionBidireccional()
  .then(() => {
    console.log('🎉 Script finalizado exitosamente\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
