/**
 * SEED: Reglas de Descuentos Predefinidas
 *
 * Este seed crea las reglas de descuento iniciales del sistema.
 * Se ejecuta automáticamente después de aplicar las migraciones.
 *
 * Ejecutar manualmente: npx tsx prisma/seed-reglas-descuentos.ts
 */

import { PrismaClient, ModoAplicacionDescuento } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Reglas de descuento predefinidas
 */
const reglasDefault = [
  {
    codigo: 'DESC_CATEGORIA',
    nombre: 'Descuento por Categoría',
    descripcion: 'Aplica descuento según categoría de socio (ESTUDIANTE, JUBILADO, etc.)',
    prioridad: 10,
    modoAplicacion: ModoAplicacionDescuento.ACUMULATIVO,
    maxDescuento: null,
    condiciones: {
      type: 'categoria',
      categorias: ['ESTUDIANTE', 'JUBILADO', 'FAMILIAR']
    },
    formula: {
      type: 'porcentaje_desde_bd',
      fuente: 'categorias_socios',
      campo: 'descuento'
    },
    aplicarABase: true,
    aplicarAActividades: true,
    activa: true
  },
  {
    codigo: 'DESC_FAMILIAR',
    nombre: 'Descuento Familiar',
    descripcion: 'Aplica descuento por relación familiar activa (máximo de todas las relaciones)',
    prioridad: 20,
    modoAplicacion: ModoAplicacionDescuento.EXCLUSIVO,
    maxDescuento: null,
    condiciones: {
      type: 'relacion_familiar',
      activa: true
    },
    formula: {
      type: 'personalizado',
      funcion: 'calcularMaximoDescuentoFamiliar'
    },
    aplicarABase: true,
    aplicarAActividades: false,
    activa: true
  },
  {
    codigo: 'DESC_MULTIPLES_ACTIVIDADES',
    nombre: 'Descuento Múltiples Actividades',
    descripcion: 'Descuento escalonado según cantidad de actividades (2 act = 10%, 3+ = 20%)',
    prioridad: 30,
    modoAplicacion: ModoAplicacionDescuento.PERSONALIZADO,
    maxDescuento: 20.00,
    condiciones: {
      type: 'cantidad_actividades',
      minimo: 2
    },
    formula: {
      type: 'escalado',
      reglas: [
        { condicion: 'actividades >= 2 && actividades < 3', descuento: 10 },
        { condicion: 'actividades >= 3', descuento: 20 }
      ]
    },
    aplicarABase: false,
    aplicarAActividades: true,
    activa: false  // Desactivada por default (admin debe activar)
  },
  {
    codigo: 'DESC_ANTIGUEDAD',
    nombre: 'Descuento por Antigüedad',
    descripcion: 'Descuento por años de antigüedad como socio (1% por año, máx 15%)',
    prioridad: 15,
    modoAplicacion: ModoAplicacionDescuento.MAXIMO,
    maxDescuento: 15.00,
    condiciones: {
      type: 'antiguedad',
      mesesMinimo: 12
    },
    formula: {
      type: 'personalizado',
      funcion: 'calcularDescuentoPorAntiguedad'
    },
    aplicarABase: true,
    aplicarAActividades: false,
    activa: false  // Desactivada por default
  }
];

/**
 * Configuración global default
 */
const configDefault = {
  limiteDescuentoTotal: 80.00,  // Máximo 80% de descuento total
  aplicarDescuentosABase: true,
  aplicarDescuentosAActividades: true,
  prioridadReglas: [] as number[],  // Se llena después de crear las reglas
  activa: true
};

/**
 * Función principal de seed
 */
async function seedReglasDescuentos() {
  console.log('🌱 Iniciando seed de reglas de descuentos...\n');

  try {
    // ========================================================================
    // PASO 1: Seed de Reglas de Descuentos
    // ========================================================================
    console.log('📋 PASO 1: Creando reglas de descuentos...');

    let reglasCreadas = 0;
    let reglasActualizadas = 0;
    const idsReglas: number[] = [];

    for (const regla of reglasDefault) {
      const existente = await prisma.reglaDescuento.findUnique({
        where: { codigo: regla.codigo }
      });

      if (existente) {
        await prisma.reglaDescuento.update({
          where: { codigo: regla.codigo },
          data: regla
        });
        reglasActualizadas++;
        idsReglas.push(existente.id);
        console.log(`   ♻️  ${regla.codigo} - ${regla.nombre} (actualizada)`);
      } else {
        const nuevaRegla = await prisma.reglaDescuento.create({
          data: regla
        });
        reglasCreadas++;
        idsReglas.push(nuevaRegla.id);
        console.log(`   ✅ ${regla.codigo} - ${regla.nombre} (creada)`);
      }
    }

    console.log(`\n   📊 Reglas: ${reglasCreadas} creadas, ${reglasActualizadas} actualizadas`);

    // ========================================================================
    // PASO 2: Seed de Configuración Global
    // ========================================================================
    console.log('\n📋 PASO 2: Creando configuración global...');

    // Establecer prioridad de reglas (IDs en orden de prioridad)
    configDefault.prioridadReglas = idsReglas;

    const configExistente = await prisma.configuracionDescuentos.findUnique({
      where: { id: 1 }
    });

    if (configExistente) {
      await prisma.configuracionDescuentos.update({
        where: { id: 1 },
        data: configDefault
      });
      console.log('   ♻️  Configuración global actualizada');
    } else {
      await prisma.configuracionDescuentos.create({
        data: {
          id: 1,
          ...configDefault
        }
      });
      console.log('   ✅ Configuración global creada');
    }

    // ========================================================================
    // PASO 3: Resumen Final
    // ========================================================================
    const totalReglas = await prisma.reglaDescuento.count();
    const totalReglasActivas = await prisma.reglaDescuento.count({
      where: { activa: true }
    });
    const config = await prisma.configuracionDescuentos.findUnique({
      where: { id: 1 }
    });

    console.log('\n' + '═'.repeat(70));
    console.log('  📊 RESUMEN DEL SEED');
    console.log('═'.repeat(70));
    console.log(`  Reglas de descuento en DB:     ${totalReglas}`);
    console.log(`  Reglas activas:                ${totalReglasActivas}`);
    console.log(`  Reglas inactivas:              ${totalReglas - totalReglasActivas}`);
    console.log(`  Límite descuento global:       ${config?.limiteDescuentoTotal}%`);
    console.log(`  Sistema de descuentos:         ${config?.activa ? 'ACTIVO' : 'INACTIVO'}`);
    console.log('═'.repeat(70));
    console.log('\n✅ Seed de reglas de descuentos completado exitosamente\n');

    // ========================================================================
    // PASO 4: Mostrar Detalles de Reglas
    // ========================================================================
    console.log('📋 REGLAS CREADAS:\n');

    const reglas = await prisma.reglaDescuento.findMany({
      orderBy: { prioridad: 'asc' }
    });

    for (const regla of reglas) {
      const estado = regla.activa ? '🟢 ACTIVA' : '🔴 INACTIVA';
      console.log(`${estado} - ${regla.codigo}`);
      console.log(`   Nombre:      ${regla.nombre}`);
      console.log(`   Prioridad:   ${regla.prioridad}`);
      console.log(`   Modo:        ${regla.modoAplicacion}`);
      console.log(`   Max desc:    ${regla.maxDescuento ? regla.maxDescuento + '%' : 'Sin límite'}`);
      console.log(`   Aplica a:    ${regla.aplicarABase ? 'BASE' : ''} ${regla.aplicarAActividades ? 'ACTIVIDADES' : ''}`);
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error durante el seed de reglas de descuentos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si es el script principal
if (require.main === module) {
  seedReglasDescuentos()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedReglasDescuentos };
