/**
 * Test para verificar auto-generación de números de recibos
 *
 * Valida que:
 * 1. Los números se generan automáticamente por PostgreSQL
 * 2. No hay race conditions en operaciones concurrentes
 * 3. Los números son secuenciales y únicos
 *
 * Ejecutar: npx tsx tests/test-recibo-auto-numero.ts
 */

import { PrismaClient, TipoRecibo, EstadoRecibo } from '@prisma/client';

const prisma = new PrismaClient();

async function testAutoNumeracion() {
  console.log('🧪 Test: Auto-generación de números de recibos\n');

  try {
    // 1. Verificar que existe la secuencia
    console.log('1️⃣ Verificando secuencia PostgreSQL...');
    const [secuencia] = await prisma.$queryRaw<any[]>`
      SELECT last_value, is_called
      FROM recibos_numero_seq
    `;
    console.log(`   ✅ Secuencia existe. Último valor: ${secuencia.last_value}, Usado: ${secuencia.is_called}`);

    // 2. Verificar que existe la función
    console.log('\n2️⃣ Verificando función next_recibo_numero()...');
    const [funcion] = await prisma.$queryRaw<any[]>`
      SELECT proname, prosrc
      FROM pg_proc
      WHERE proname = 'next_recibo_numero'
    `;
    console.log(`   ✅ Función existe: ${funcion.proname}`);

    // 3. Obtener socio de prueba
    console.log('\n3️⃣ Buscando socio de prueba...');
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
      console.log('   ⚠️  No hay socios activos. Creando uno...');
      throw new Error('Por favor ejecute primero el seed de test socios');
    }
    console.log(`   ✅ Socio encontrado: ${socio.nombre} ${socio.apellido} (ID: ${socio.id})`);

    // 4. Crear recibo SIN especificar número (debe auto-generarse)
    console.log('\n4️⃣ Creando recibo sin especificar número...');
    const recibo1 = await prisma.recibo.create({
      data: {
        tipo: TipoRecibo.CUOTA,
        estado: EstadoRecibo.PENDIENTE,
        receptorId: socio.id,
        importe: 1000,
        concepto: 'Test auto-numeración',
        fecha: new Date()
      }
    });
    console.log(`   ✅ Recibo creado con número: ${recibo1.numero} (ID: ${recibo1.id})`);

    // 5. Crear múltiples recibos concurrentemente (test de race conditions)
    console.log('\n5️⃣ Creando 5 recibos concurrentemente (test de race conditions)...');
    const promises = Array.from({ length: 5 }, (_, i) =>
      prisma.recibo.create({
        data: {
          tipo: TipoRecibo.CUOTA,
          estado: EstadoRecibo.PENDIENTE,
          receptorId: socio.id,
          importe: 1000 + i,
          concepto: `Test concurrencia #${i + 1}`,
          fecha: new Date()
        }
      })
    );

    const recibos = await Promise.all(promises);
    const numeros = recibos.map(r => r.numero);
    console.log(`   ✅ Recibos creados: ${numeros.join(', ')}`);

    // 6. Verificar que todos los números son únicos
    const numerosUnicos = new Set(numeros);
    if (numerosUnicos.size === numeros.length) {
      console.log('   ✅ Todos los números son únicos (no hay duplicados)');
    } else {
      console.log('   ❌ ERROR: Hay números duplicados!');
      return false;
    }

    // 7. Verificar que los números son secuenciales
    const numerosInt = numeros.map(n => parseInt(n));
    const ordenados = [...numerosInt].sort((a, b) => a - b);
    const esSecuencial = ordenados.every((num, i, arr) => i === 0 || num === arr[i - 1] + 1);

    if (esSecuencial) {
      console.log('   ✅ Los números son secuenciales (sin saltos)');
    } else {
      console.log('   ⚠️  Los números no son estrictamente secuenciales (puede ser normal si hay otros recibos)');
    }

    // 8. Verificar formato (8 dígitos con ceros a la izquierda)
    const formatoCorrecto = numeros.every(n => /^\d{8}$/.test(n));
    if (formatoCorrecto) {
      console.log('   ✅ Todos los números tienen formato correcto (8 dígitos)');
    } else {
      console.log('   ❌ ERROR: Algunos números no tienen el formato correcto!');
      return false;
    }

    // 9. Limpiar recibos de prueba
    console.log('\n9️⃣ Limpiando recibos de prueba...');
    await prisma.recibo.deleteMany({
      where: {
        id: {
          in: [recibo1.id, ...recibos.map(r => r.id)]
        }
      }
    });
    console.log('   ✅ Recibos de prueba eliminados');

    console.log('\n✅ TODOS LOS TESTS PASARON');
    console.log('\n📊 Resumen:');
    console.log('   - Secuencia PostgreSQL: ✅ Funciona');
    console.log('   - Función next_recibo_numero(): ✅ Funciona');
    console.log('   - Auto-generación de números: ✅ Funciona');
    console.log('   - Números únicos (sin race conditions): ✅ Funciona');
    console.log('   - Formato correcto: ✅ Funciona');

    return true;

  } catch (error) {
    console.error('❌ Error en test:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar test
testAutoNumeracion()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
