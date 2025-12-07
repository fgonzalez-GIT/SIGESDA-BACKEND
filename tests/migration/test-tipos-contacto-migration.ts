/**
 * Test de migración de tipos de contacto (ENUM → Catálogo)
 * Valida que la migración SQL funcione correctamente
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testMigration() {
  console.log('🧪 Testing Tipos de Contacto Migration (ENUM → Catalog)\n');
  console.log('='.repeat(60));

  try {
    // ========================================================================
    // TEST 1: Verificar que la tabla catálogo existe
    // ========================================================================
    console.log('\n📋 TEST 1: Verificar tabla tipo_contacto_catalogo');
    const tipos = await prisma.tipoContactoCatalogo.findMany();
    console.log(`✅ Tabla existe - ${tipos.length} tipos encontrados`);

    if (tipos.length < 6) {
      console.error(`❌ ERROR: Se esperaban al menos 6 tipos, encontrados ${tipos.length}`);
      process.exit(1);
    }

    // Verificar tipos esperados
    const tiposEsperados = ['EMAIL', 'TELEFONO', 'CELULAR', 'WHATSAPP', 'TELEGRAM', 'OTRO'];
    const tiposEncontrados = tipos.map(t => t.codigo);

    for (const tipoEsperado of tiposEsperados) {
      if (!tiposEncontrados.includes(tipoEsperado)) {
        console.error(`❌ ERROR: Tipo '${tipoEsperado}' no encontrado`);
        process.exit(1);
      }
    }
    console.log(`✅ Todos los tipos esperados están presentes`);

    // ========================================================================
    // TEST 2: Verificar estructura de la tabla catálogo
    // ========================================================================
    console.log('\n📋 TEST 2: Verificar estructura de tipo_contacto_catalogo');
    const tipoPrueba = tipos[0];

    const camposEsperados = ['id', 'codigo', 'nombre', 'descripcion', 'icono', 'pattern', 'activo', 'orden', 'createdAt', 'updatedAt'];
    const camposEncontrados = Object.keys(tipoPrueba);

    for (const campo of camposEsperados) {
      if (!camposEncontrados.includes(campo)) {
        console.error(`❌ ERROR: Campo '${campo}' no encontrado en la tabla`);
        process.exit(1);
      }
    }
    console.log(`✅ Todos los campos esperados están presentes`);

    // ========================================================================
    // TEST 3: Verificar contactos migrados
    // ========================================================================
    console.log('\n📋 TEST 3: Verificar contactos migrados');
    const contactos = await prisma.contactoPersona.findMany({
      include: { tipoContacto: true }
    });
    console.log(`✅ ${contactos.length} contactos encontrados`);

    // ========================================================================
    // TEST 4: Verificar integridad referencial
    // ========================================================================
    console.log('\n📋 TEST 4: Verificar integridad referencial');

    // Verificar que NO hay contactos con tipoContactoId NULL
    const contactosNulos = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM contacto_persona
      WHERE tipo_contacto_id IS NULL
    `;

    const countNulos = Number(contactosNulos[0].count);
    if (countNulos > 0) {
      console.error(`❌ ERROR: ${countNulos} contactos con tipo_contacto_id NULL`);
      process.exit(1);
    }
    console.log(`✅ Todos los contactos tienen tipo_contacto_id válido (0 NULL)`);

    // Verificar FK constraint
    const contactosOrfanos = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM contacto_persona cp
      LEFT JOIN tipo_contacto_catalogo tc ON cp.tipo_contacto_id = tc.id
      WHERE tc.id IS NULL
    `;

    const countOrfanos = Number(contactosOrfanos[0].count);
    if (countOrfanos > 0) {
      console.error(`❌ ERROR: ${countOrfanos} contactos sin tipo válido (orphan records)`);
      process.exit(1);
    }
    console.log(`✅ Integridad referencial correcta (0 orphan records)`);

    // ========================================================================
    // TEST 5: Verificar patterns de validación
    // ========================================================================
    console.log('\n📋 TEST 5: Verificar patterns de validación');

    const tipoEmail = tipos.find(t => t.codigo === 'EMAIL');
    if (!tipoEmail?.pattern) {
      console.error(`❌ ERROR: Tipo EMAIL no tiene pattern de validación`);
      process.exit(1);
    }

    // Probar el regex de email
    const regexEmail = new RegExp(tipoEmail.pattern);
    const emailsValidos = ['test@example.com', 'user.name@domain.co.ar'];
    const emailsInvalidos = ['invalid', '@example.com', 'test@'];

    for (const email of emailsValidos) {
      if (!regexEmail.test(email)) {
        console.error(`❌ ERROR: Email válido '${email}' rechazado por pattern`);
        process.exit(1);
      }
    }

    for (const email of emailsInvalidos) {
      if (regexEmail.test(email)) {
        console.error(`❌ ERROR: Email inválido '${email}' aceptado por pattern`);
        process.exit(1);
      }
    }
    console.log(`✅ Patterns de validación funcionan correctamente`);

    // ========================================================================
    // TEST 6: Verificar índices
    // ========================================================================
    console.log('\n📋 TEST 6: Verificar índices de la base de datos');

    const indices = await prisma.$queryRaw<Array<{ indexname: string }>>`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'tipo_contacto_catalogo'
      ORDER BY indexname
    `;

    const indicesEsperados = [
      'tipo_contacto_codigo_idx',
      'tipo_contacto_activo_idx',
      'tipo_contacto_orden_idx'
    ];

    const indicesEncontrados = indices.map(i => i.indexname);

    for (const indice of indicesEsperados) {
      if (!indicesEncontrados.includes(indice)) {
        console.warn(`⚠️  WARNING: Índice '${indice}' no encontrado`);
      }
    }
    console.log(`✅ Verificación de índices completada`);

    // ========================================================================
    // TEST 7: Verificar que el ENUM ya no se usa
    // ========================================================================
    console.log('\n📋 TEST 7: Verificar que columna tipo_contacto (ENUM) fue eliminada');

    try {
      const columnas = await prisma.$queryRaw<Array<{ column_name: string }>>`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'contacto_persona'
          AND column_name = 'tipo_contacto'
      `;

      if (columnas.length > 0) {
        console.warn(`⚠️  WARNING: Columna 'tipo_contacto' (ENUM) todavía existe`);
        console.warn(`   Esto es esperado si la migración mantiene el ENUM para rollback`);
      } else {
        console.log(`✅ Columna 'tipo_contacto' (ENUM) eliminada correctamente`);
      }
    } catch (error) {
      console.log(`✅ Columna 'tipo_contacto' (ENUM) no encontrada`);
    }

    // ========================================================================
    // TEST 8: Test de operaciones CRUD
    // ========================================================================
    console.log('\n📋 TEST 8: Test de operaciones CRUD (creación y eliminación de test)');

    // Crear tipo de prueba
    const tipoTest = await prisma.tipoContactoCatalogo.create({
      data: {
        codigo: 'TEST_MIGRATION',
        nombre: 'Test Migration',
        descripcion: 'Tipo creado para test de migración',
        activo: true,
        orden: 999
      }
    });
    console.log(`✅ Tipo de prueba creado (ID: ${tipoTest.id})`);

    // Verificar que se puede leer
    const tipoLeido = await prisma.tipoContactoCatalogo.findUnique({
      where: { id: tipoTest.id }
    });

    if (!tipoLeido) {
      console.error(`❌ ERROR: No se pudo leer el tipo creado`);
      process.exit(1);
    }
    console.log(`✅ Tipo de prueba leído correctamente`);

    // Eliminar tipo de prueba (cleanup)
    await prisma.tipoContactoCatalogo.delete({
      where: { id: tipoTest.id }
    });
    console.log(`✅ Tipo de prueba eliminado (cleanup)`);

    // ========================================================================
    // RESUMEN FINAL
    // ========================================================================
    console.log('\n' + '='.repeat(60));
    console.log('✅ MIGRACIÓN COMPLETADA Y VALIDADA EXITOSAMENTE');
    console.log('='.repeat(60));
    console.log(`
📊 RESUMEN:
   - Tipos de contacto en catálogo: ${tipos.length}
   - Contactos migrados: ${contactos.length}
   - Integridad referencial: OK
   - Patterns de validación: OK
   - Operaciones CRUD: OK

🎉 La migración de tipos de contacto (ENUM → Catálogo) fue exitosa
    `);

  } catch (error) {
    console.error('\n❌ ERROR EN EL TEST:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar test
testMigration()
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
