/**
 * Script para verificar datos de catálogos en la base de datos
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCatalogs() {
  console.log('\n🔍 Verificando catálogos en la base de datos...\n');

  try {
    // Check tipo_persona_catalogo
    console.log('📋 Tipos de Persona:');
    const tiposPersona = await prisma.tipoPersonaCatalogo.findMany({
      orderBy: { id: 'asc' }
    });

    if (tiposPersona.length === 0) {
      console.log('   ⚠️  No hay tipos de persona en la base de datos');
    } else {
      tiposPersona.forEach(tipo => {
        console.log(`   ${tipo.activo ? '✅' : '❌'} ID: ${tipo.id}, Código: ${tipo.codigo}, Nombre: ${tipo.nombre}`);
      });
    }

    // Check categoria_socio
    console.log('\n💳 Categorías de Socio:');
    const categorias = await prisma.categoriaSocio.findMany({
      orderBy: { id: 'asc' }
    });

    if (categorias.length === 0) {
      console.log('   ⚠️  No hay categorías de socio en la base de datos');
    } else {
      categorias.forEach(cat => {
        console.log(`   ${cat.activa ? '✅' : '❌'} ID: ${cat.id}, Código: ${cat.codigo}, Nombre: ${cat.nombre}, Monto: $${cat.montoCuota}`);
      });
    }

    // Check tipo_item_cuota
    console.log('\n📦 Tipos de Item de Cuota:');
    const tiposItem = await prisma.tipoItemCuota.findMany({
      orderBy: { id: 'asc' }
    });

    if (tiposItem.length === 0) {
      console.log('   ⚠️  No hay tipos de item de cuota en la base de datos');
    } else {
      tiposItem.forEach(tipo => {
        console.log(`   ${tipo.activo ? '✅' : '❌'} ID: ${tipo.id}, Código: ${tipo.codigo}, Nombre: ${tipo.nombre}`);
      });
    }

    console.log('\n✅ Verificación completada\n');

  } catch (error) {
    console.error('\n❌ Error al verificar catálogos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkCatalogs()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
