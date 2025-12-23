import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * PASO 1: Categorías de ítems predefinidas (tabla catálogo)
 */
const categoriasItemsDefault = [
  {
    codigo: 'BASE',
    nombre: 'Cuota Base',
    descripcion: 'Cuota mensual base según categoría de socio',
    icono: '💰',
    color: 'blue',
    activo: true,
    orden: 1
  },
  {
    codigo: 'ACTIVIDAD',
    nombre: 'Actividad',
    descripcion: 'Costo de participación en actividades',
    icono: '🎵',
    color: 'green',
    activo: true,
    orden: 2
  },
  {
    codigo: 'DESCUENTO',
    nombre: 'Descuento',
    descripcion: 'Descuentos (familiar, categoría, múltiples actividades)',
    icono: '🎁',
    color: 'orange',
    activo: true,
    orden: 3
  },
  {
    codigo: 'RECARGO',
    nombre: 'Recargo',
    descripcion: 'Recargos (mora, administrativos)',
    icono: '⚠️',
    color: 'red',
    activo: true,
    orden: 4
  },
  {
    codigo: 'BONIFICACION',
    nombre: 'Bonificación',
    descripcion: 'Bonificaciones especiales',
    icono: '⭐',
    color: 'purple',
    activo: true,
    orden: 5
  },
  {
    codigo: 'OTRO',
    nombre: 'Otro',
    descripcion: 'Otros conceptos',
    icono: '📝',
    color: 'gray',
    activo: true,
    orden: 6
  }
];

/**
 * PASO 2: Tipos de ítems predefinidos (referencia a categorías por código)
 */
const tiposItemsDefault = [
  {
    codigo: 'CUOTA_BASE_SOCIO',
    nombre: 'Cuota Base Socio',
    descripcion: 'Cuota mensual base según categoría de socio',
    categoriaCodigo: 'BASE',
    esCalculado: true,
    formula: {
      type: 'categoria_monto',
      source: 'categorias_socios.montoCuota',
      description: 'Toma el monto de la categoría del socio'
    },
    activo: true,
    orden: 1,
    configurable: true
  },
  {
    codigo: 'CUOTA_FAMILIAR',
    nombre: 'Cuota Familiar',
    descripcion: 'Cuota mensual del grupo familiar (solo responsable)',
    categoriaCodigo: 'BASE',
    esCalculado: true,
    formula: {
      type: 'grupo_familiar',
      source: 'grupos_familiares.montoCuotaFamiliar',
      description: 'Aplica solo al responsable financiero del grupo'
    },
    activo: false,  // Se activa en Fase 4 cuando se implemente cuota familiar
    orden: 2,
    configurable: true
  },
  {
    codigo: 'ACTIVIDAD_INDIVIDUAL',
    nombre: 'Actividad Individual',
    descripcion: 'Costo de actividad individual (instrumento, taller, etc.)',
    categoriaCodigo: 'ACTIVIDAD',
    esCalculado: true,
    formula: {
      type: 'participacion',
      source: 'participacion_actividades.precioEspecial ?? actividades.costo',
      description: 'Usa precio especial si existe, sino costo de la actividad'
    },
    activo: true,
    orden: 10,
    configurable: true
  },
  {
    codigo: 'DESCUENTO_CATEGORIA',
    nombre: 'Descuento por Categoría',
    descripcion: 'Descuento aplicado según categoría de socio (ESTUDIANTE, JUBILADO, etc.)',
    categoriaCodigo: 'DESCUENTO',
    esCalculado: true,
    formula: {
      type: 'porcentaje_categoria',
      source: 'categorias_socios.descuento',
      description: 'Aplica porcentaje de descuento de la categoría'
    },
    activo: true,
    orden: 20,
    configurable: true
  },
  {
    codigo: 'DESCUENTO_FAMILIAR',
    nombre: 'Descuento Familiar',
    descripcion: 'Descuento por relación familiar activa',
    categoriaCodigo: 'DESCUENTO',
    esCalculado: true,
    formula: {
      type: 'maximo_descuento',
      source: 'familiares.descuento',
      description: 'Aplica el máximo descuento de relaciones familiares activas'
    },
    activo: true,
    orden: 21,
    configurable: true
  },
  {
    codigo: 'DESCUENTO_MULTIPLES_ACTIVIDADES',
    nombre: 'Descuento Múltiples Actividades',
    descripcion: 'Descuento por participar en 2 o más actividades',
    categoriaCodigo: 'DESCUENTO',
    esCalculado: true,
    formula: {
      type: 'escalado',
      rules: [
        { condition: 'actividades >= 2', descuento: 10 },
        { condition: 'actividades >= 3', descuento: 20 }
      ],
      description: 'Descuento escalado según cantidad de actividades'
    },
    activo: false,  // Se activa con configuración del admin
    orden: 22,
    configurable: true
  },
  {
    codigo: 'RECARGO_MORA',
    nombre: 'Recargo por Mora',
    descripcion: 'Recargo por pago fuera de término',
    categoriaCodigo: 'RECARGO',
    esCalculado: true,
    formula: {
      type: 'porcentaje_fijo',
      porcentaje: 10,
      aplicaSi: 'estado = VENCIDO',
      description: 'Aplica 10% de recargo si el recibo está vencido'
    },
    activo: false,  // Desactivado por default
    orden: 30,
    configurable: true
  },
  {
    codigo: 'BONIFICACION_ESPECIAL',
    nombre: 'Bonificación Especial',
    descripcion: 'Bonificación manual por decisión administrativa',
    categoriaCodigo: 'BONIFICACION',
    esCalculado: false,  // Manual, no se calcula automáticamente
    formula: Prisma.DbNull,
    activo: true,
    orden: 40,
    configurable: true
  }
];

async function seedItemsCatalogos() {
  console.log('🌱 Iniciando seed de catálogos de ítems de cuota...\n');

  try {
    // ========================================================================
    // PASO 1: Seed de Categorías de Ítems
    // ========================================================================
    console.log('📋 PASO 1: Creando categorías de ítems...');

    let categoriasCreadas = 0;
    let categoriasActualizadas = 0;

    for (const categoria of categoriasItemsDefault) {
      const existente = await prisma.categoriaItem.findUnique({
        where: { codigo: categoria.codigo }
      });

      if (existente) {
        await prisma.categoriaItem.update({
          where: { codigo: categoria.codigo },
          data: categoria
        });
        categoriasActualizadas++;
        console.log(`   ♻️  ${categoria.codigo} - ${categoria.nombre} (actualizado)`);
      } else {
        await prisma.categoriaItem.create({
          data: categoria
        });
        categoriasCreadas++;
        console.log(`   ✅ ${categoria.codigo} - ${categoria.nombre} (creado)`);
      }
    }

    console.log(`\n   📊 Categorías: ${categoriasCreadas} creadas, ${categoriasActualizadas} actualizadas`);

    // ========================================================================
    // PASO 2: Seed de Tipos de Ítems
    // ========================================================================
    console.log('\n📋 PASO 2: Creando tipos de ítems...');

    let tiposCreados = 0;
    let tiposActualizados = 0;

    for (const tipo of tiposItemsDefault) {
      // Obtener ID de la categoría por código
      const categoria = await prisma.categoriaItem.findUnique({
        where: { codigo: tipo.categoriaCodigo }
      });

      if (!categoria) {
        console.error(`   ❌ Error: Categoría ${tipo.categoriaCodigo} no encontrada para tipo ${tipo.codigo}`);
        continue;
      }

      const existente = await prisma.tipoItemCuota.findUnique({
        where: { codigo: tipo.codigo }
      });

      const tipoData = {
        codigo: tipo.codigo,
        nombre: tipo.nombre,
        descripcion: tipo.descripcion,
        categoriaItemId: categoria.id,
        esCalculado: tipo.esCalculado,
        formula: tipo.formula,
        activo: tipo.activo,
        orden: tipo.orden,
        configurable: tipo.configurable
      };

      if (existente) {
        await prisma.tipoItemCuota.update({
          where: { codigo: tipo.codigo },
          data: tipoData
        });
        tiposActualizados++;
        console.log(`   ♻️  ${tipo.codigo} - ${tipo.nombre} (actualizado)`);
      } else {
        await prisma.tipoItemCuota.create({
          data: tipoData
        });
        tiposCreados++;
        console.log(`   ✅ ${tipo.codigo} - ${tipo.nombre} (creado)`);
      }
    }

    console.log(`\n   📊 Tipos de ítems: ${tiposCreados} creados, ${tiposActualizados} actualizados`);

    // ========================================================================
    // PASO 3: Resumen Final
    // ========================================================================
    const totalCategorias = await prisma.categoriaItem.count();
    const totalTipos = await prisma.tipoItemCuota.count();
    const totalTiposActivos = await prisma.tipoItemCuota.count({
      where: { activo: true }
    });

    console.log('\n' + '═'.repeat(70));
    console.log('  📊 RESUMEN DEL SEED');
    console.log('═'.repeat(70));
    console.log(`  Categorías de ítems en DB:     ${totalCategorias}`);
    console.log(`  Tipos de ítems en DB:          ${totalTipos}`);
    console.log(`  Tipos de ítems activos:        ${totalTiposActivos}`);
    console.log(`  Tipos de ítems inactivos:      ${totalTipos - totalTiposActivos}`);
    console.log('═'.repeat(70));
    console.log('\n✅ Seed de catálogos de ítems completado exitosamente\n');

  } catch (error) {
    console.error('❌ Error durante el seed de catálogos de ítems:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si es el script principal
if (require.main === module) {
  seedItemsCatalogos()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedItemsCatalogos };
