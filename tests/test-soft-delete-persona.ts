/**
 * Test de Soft Delete para Personas
 *
 * Este script prueba la funcionalidad de soft delete implementada
 * con el campo 'activo' en la tabla personas.
 */

import { PrismaClient } from '@prisma/client';
import { darDeBajaPersona, reactivarPersona, isPersonaActiva } from '../src/utils/persona.helper';

const prisma = new PrismaClient();

async function testSoftDelete() {
  console.log('🧪 Test de Soft Delete - Personas\n');

  try {
    // 1. Crear una persona de prueba
    console.log('1️⃣ Creando persona de prueba...');
    const dniUnico = `${Date.now()}`.slice(-8); // Usar timestamp como DNI único
    const persona = await prisma.persona.create({
      data: {
        nombre: 'Test',
        apellido: 'Soft Delete',
        dni: dniUnico,
        activo: true,
        tipos: {
          create: {
            tipoPersona: {
              connect: { codigo: 'NO_SOCIO' }
            },
            activo: true
          }
        }
      }
    });
    console.log(`   ✅ Persona creada: ID ${persona.id}, activo=${persona.activo}\n`);

    // 2. Verificar que la persona está activa
    console.log('2️⃣ Verificando que la persona está activa...');
    const estaActiva1 = await isPersonaActiva(persona.id);
    console.log(`   ✅ Estado activo: ${estaActiva1}\n`);

    if (!estaActiva1) {
      throw new Error('La persona debería estar activa');
    }

    // 3. Dar de baja la persona
    console.log('3️⃣ Dando de baja la persona...');
    const personaBaja = await darDeBajaPersona(persona.id, 'Prueba de soft delete');
    console.log(`   ✅ Persona dada de baja: activo=${personaBaja.activo}`);
    console.log(`   📅 Fecha baja: ${personaBaja.fechaBaja}`);
    console.log(`   📝 Motivo: ${personaBaja.motivoBaja}\n`);

    // 4. Verificar que la persona está inactiva
    console.log('4️⃣ Verificando que la persona está inactiva...');
    const estaActiva2 = await isPersonaActiva(persona.id);
    console.log(`   ✅ Estado activo: ${estaActiva2}\n`);

    if (estaActiva2) {
      throw new Error('La persona no debería estar activa');
    }

    // 5. Verificar que no aparece en listado de activos
    console.log('5️⃣ Verificando que no aparece en listado de personas activas...');
    const personasActivas = await prisma.persona.count({
      where: { activo: true, id: persona.id }
    });
    console.log(`   ✅ Personas activas con ID ${persona.id}: ${personasActivas}\n`);

    if (personasActivas !== 0) {
      throw new Error('La persona no debería aparecer en el listado de activos');
    }

    // 6. Reactivar la persona
    console.log('6️⃣ Reactivando la persona...');
    const personaReactivada = await reactivarPersona(persona.id);
    console.log(`   ✅ Persona reactivada: activo=${personaReactivada.activo}`);
    console.log(`   📅 Fecha baja: ${personaReactivada.fechaBaja}`);
    console.log(`   📝 Motivo: ${personaReactivada.motivoBaja}\n`);

    // 7. Verificar que la persona está activa nuevamente
    console.log('7️⃣ Verificando que la persona está activa nuevamente...');
    const estaActiva3 = await isPersonaActiva(persona.id);
    console.log(`   ✅ Estado activo: ${estaActiva3}\n`);

    if (!estaActiva3) {
      throw new Error('La persona debería estar activa nuevamente');
    }

    // 8. Limpiar: eliminar persona de prueba
    console.log('8️⃣ Limpiando: eliminando persona de prueba...');
    await prisma.personaTipo.deleteMany({
      where: { personaId: persona.id }
    });
    await prisma.persona.delete({
      where: { id: persona.id }
    });
    console.log(`   ✅ Persona de prueba eliminada\n`);

    console.log('✅ ¡TODOS LOS TESTS PASARON CORRECTAMENTE!\n');

  } catch (error) {
    console.error('\n❌ ERROR EN LOS TESTS:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar tests
testSoftDelete().catch(console.error);
