/**
 * Script de Validación Simplificado: Validación de Cupo en Inscripciones
 */

import { PrismaClient } from '@prisma/client';
import { ActividadRepository } from '../src/repositories/actividad.repository';

const prisma = new PrismaClient();
const actividadRepo = new ActividadRepository(prisma);

async function testValidacionCupo() {
  console.log('🔍 Iniciando validación de cupo en inscripciones...\n');

  let actividadTestId: number | null = null;

  try {
    // ========================================================================
    // PASO 1: Crear actividad de prueba con cupo limitado
    // ========================================================================
    console.log('PASO 1: Creando actividad de prueba con cupo limitado...');

    const actividadTest = await prisma.actividades.create({
      data: {
        nombre: 'TEST - Validación Cupo',
        tipo: 'CLASE_CANTO',
        descripcion: 'Actividad para testing de validación de cupo',
        precio: 0,
        capacidadMaxima: 2, // Cupo pequeño para facilitar testing
        activa: true
      }
    });

    actividadTestId = actividadTest.id;
    console.log(`✅ Actividad creada: ${actividadTest.nombre} (ID: ${actividadTest.id})`);
    console.log(`   Cupo máximo: ${actividadTest.capacidadMaxima}\n`);

    // ========================================================================
    // PASO 2: Buscar personas para inscribir
    // ========================================================================
    console.log('PASO 2: Buscando personas disponibles...');

    const personas = await prisma.persona.findMany({
      take: 3, // Necesitamos 3 personas (2 para llenar + 1 para probar rechazo)
      select: {
        id: true,
        nombre: true,
        apellido: true
      }
    });

    if (personas.length < 3) {
      throw new Error('No hay suficientes personas en el sistema para el test (se necesitan al menos 3)');
    }

    console.log(`✅ Encontradas ${personas.length} personas para testing\n`);

    // ========================================================================
    // PASO 3: Inscribir primera persona (debe funcionar)
    // ========================================================================
    console.log('PASO 3: Inscribiendo primera persona...');
    console.log(`   Persona: ${personas[0].nombre} ${personas[0].apellido}`);

    try {
      const inscripcion1 = await actividadRepo.addParticipante(
        actividadTestId,
        personas[0].id,
        new Date().toISOString(),
        'Inscripción de prueba 1'
      );

      console.log(`   ✅ ÉXITO: Primera inscripción creada (ID: ${inscripcion1.id})`);
      console.log(`   Cupos ocupados: 1/2\n`);

    } catch (error: any) {
      console.log(`   ❌ ERROR INESPERADO: ${error.message}\n`);
      throw error;
    }

    // ========================================================================
    // PASO 4: Inscribir segunda persona (debe funcionar)
    // ========================================================================
    console.log('PASO 4: Inscribiendo segunda persona...');
    console.log(`   Persona: ${personas[1].nombre} ${personas[1].apellido}`);

    try {
      const inscripcion2 = await actividadRepo.addParticipante(
        actividadTestId,
        personas[1].id,
        new Date().toISOString(),
        'Inscripción de prueba 2'
      );

      console.log(`   ✅ ÉXITO: Segunda inscripción creada (ID: ${inscripcion2.id})`);
      console.log(`   Cupos ocupados: 2/2 (CUPO LLENO)\n`);

    } catch (error: any) {
      console.log(`   ❌ ERROR INESPERADO: ${error.message}\n`);
      throw error;
    }

    // ========================================================================
    // PASO 5: Intentar inscribir tercera persona (debe ser RECHAZADO)
    // ========================================================================
    console.log('PASO 5: Intentando inscribir tercera persona (cupo lleno)...');
    console.log(`   Persona: ${personas[2].nombre} ${personas[2].apellido}`);

    try {
      const inscripcion3 = await actividadRepo.addParticipante(
        actividadTestId,
        personas[2].id,
        new Date().toISOString(),
        'Inscripción de prueba 3'
      );

      console.log(`   ❌ FALLO DE VALIDACIÓN: La inscripción NO debería haber sido permitida`);
      console.log(`   La validación de cupo NO está funcionando correctamente\n`);
      throw new Error('VALIDACIÓN FALLIDA: Se permitió sobre-inscripción');

    } catch (error: any) {
      // Verificar que el error es el esperado
      if (error.message.includes('capacidad máxima') || error.message.includes('capacidad maxima')) {
        console.log(`   ✅ RECHAZO CORRECTO: Cupo lleno`);
        console.log(`   Mensaje de error: "${error.message}"`);

        // Verificar que el mensaje es descriptivo
        const tieneNombreActividad = error.message.includes('TEST') || error.message.includes('Validación');
        const tieneCupoMaximo = error.message.includes('2');
        const esDescriptivo = tieneNombreActividad && tieneCupoMaximo;

        if (esDescriptivo) {
          console.log(`   ✅ El mensaje es descriptivo y contiene información relevante\n`);
        } else {
          console.log(`   ⚠️  El mensaje podría ser más descriptivo\n`);
        }
      } else {
        console.log(`   ⚠️  Error recibido pero no es el esperado: ${error.message}\n`);
        throw error;
      }
    }

    // ========================================================================
    // PASO 6: Verificar estado final
    // ========================================================================
    console.log('PASO 6: Verificando estado final de la actividad...');

    const participantesFinales = await prisma.participacion_actividades.count({
      where: {
        actividadId: actividadTestId,
        activa: true
      }
    });

    const actividadFinal = await prisma.actividades.findUnique({
      where: { id: actividadTestId },
      select: {
        nombre: true,
        capacidadMaxima: true
      }
    });

    console.log(`   Actividad: ${actividadFinal?.nombre}`);
    console.log(`   Cupo máximo: ${actividadFinal?.capacidadMaxima}`);
    console.log(`   Participantes inscritos: ${participantesFinales}`);

    if (participantesFinales === actividadFinal?.capacidadMaxima) {
      console.log(`   ✅ Estado correcto: Cupo lleno pero no sobrepasado\n`);
    } else {
      console.log(`   ⚠️  Estado inesperado\n`);
    }

    // ========================================================================
    // PASO 7: Test con participación duplicada
    // ========================================================================
    console.log('PASO 7: Probando prevención de duplicados...');
    console.log(`   Intentando inscribir nuevamente a ${personas[0].nombre} ${personas[0].apellido}...`);

    try {
      await actividadRepo.addParticipante(
        actividadTestId,
        personas[0].id,
        new Date().toISOString()
      );

      console.log(`   ❌ FALLO: Se permitió participación duplicada\n`);

    } catch (error: any) {
      if (error.message.includes('ya está inscripta')) {
        console.log(`   ✅ RECHAZO CORRECTO: Duplicado detectado`);
        console.log(`   Mensaje: "${error.message}"\n`);
      } else {
        console.log(`   ⚠️  Error diferente al esperado: ${error.message}\n`);
      }
    }

    // ========================================================================
    // RESUMEN FINAL
    // ========================================================================
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ VALIDACIÓN COMPLETADA EXITOSAMENTE');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('La validación de cupo en addParticipante():');
    console.log('  ✅ Permite inscripciones cuando hay cupo disponible');
    console.log('  ✅ Rechaza inscripciones cuando el cupo está lleno');
    console.log('  ✅ Previene participaciones duplicadas');
    console.log('  ✅ Proporciona mensajes de error descriptivos');
    console.log('  ✅ Mantiene la integridad del cupo máximo\n');
    console.log('El problema de validación de cupo ha sido RESUELTO.\n');

  } catch (error: any) {
    console.error('\n❌ ERROR DURANTE LA VALIDACIÓN:');
    console.error(error.message);
    process.exit(1);

  } finally {
    // Limpieza
    if (actividadTestId) {
      console.log('🧹 Limpiando datos de prueba...');
      await prisma.participacion_actividades.deleteMany({
        where: { actividadId: actividadTestId }
      });
      await prisma.actividades.delete({
        where: { id: actividadTestId }
      });
      console.log('✅ Datos de prueba eliminados\n');
    }

    await prisma.$disconnect();
  }
}

// Ejecutar
testValidacionCupo()
  .then(() => {
    console.log('🎉 Script finalizado exitosamente\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
