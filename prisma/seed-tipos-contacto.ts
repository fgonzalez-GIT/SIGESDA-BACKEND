import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Tipos de contacto predefinidos (tabla catálogo)
 * Incluye validación de formato mediante regex patterns
 */
const tiposContactoDefault = [
  {
    codigo: 'EMAIL',
    nombre: 'Correo Electrónico',
    descripcion: 'Dirección de correo electrónico',
    icono: '📧',
    pattern: '^[^@]+@[^@]+\\.[^@]+$',  // Regex para validar email
    activo: true,
    orden: 1
  },
  {
    codigo: 'TELEFONO',
    nombre: 'Teléfono Fijo',
    descripcion: 'Número de teléfono fijo',
    icono: '☎️',
    pattern: '^\\+?[0-9\\s\\-\\(\\)]+$',  // Regex para validar teléfono
    activo: true,
    orden: 2
  },
  {
    codigo: 'CELULAR',
    nombre: 'Teléfono Celular',
    descripcion: 'Número de teléfono celular',
    icono: '📱',
    pattern: '^\\+?[0-9\\s\\-\\(\\)]+$',  // Regex para validar celular
    activo: true,
    orden: 3
  },
  {
    codigo: 'WHATSAPP',
    nombre: 'WhatsApp',
    descripcion: 'Número de WhatsApp',
    icono: '💬',
    pattern: '^\\+?[0-9\\s\\-\\(\\)]+$',  // Regex para validar WhatsApp
    activo: true,
    orden: 4
  },
  {
    codigo: 'TELEGRAM',
    nombre: 'Telegram',
    descripcion: 'Usuario de Telegram',
    icono: '✈️',
    pattern: null,  // Sin validación específica
    activo: true,
    orden: 5
  },
  {
    codigo: 'INSTAGRAM',
    nombre: 'Instagram',
    descripcion: 'Usuario de Instagram',
    icono: '📷',
    pattern: null,  // Sin validación específica
    activo: true,
    orden: 6
  },
  {
    codigo: 'FACEBOOK',
    nombre: 'Facebook',
    descripcion: 'Perfil de Facebook',
    icono: '👤',
    pattern: null,  // Sin validación específica
    activo: true,
    orden: 7
  },
  {
    codigo: 'X',
    nombre: 'X (Twitter)',
    descripcion: 'Usuario de X (anteriormente Twitter)',
    icono: '🐦',
    pattern: null,  // Sin validación específica
    activo: true,
    orden: 8
  },
  {
    codigo: 'TIKTOK',
    nombre: 'TikTok',
    descripcion: 'Usuario de TikTok',
    icono: '🎵',
    pattern: null,  // Sin validación específica
    activo: true,
    orden: 9
  },
  {
    codigo: 'LINKEDIN',
    nombre: 'LinkedIn',
    descripcion: 'Perfil de LinkedIn',
    icono: '💼',
    pattern: null,  // Sin validación específica
    activo: true,
    orden: 10
  },
  {
    codigo: 'OTRO',
    nombre: 'Otro',
    descripcion: 'Otro tipo de contacto',
    icono: '📞',
    pattern: null,  // Sin validación específica
    activo: true,
    orden: 99
  }
];

async function seedTiposContacto() {
  console.log('🌱 Iniciando seed de tipos de contacto...\n');

  try {
    // ========================================================================
    // Seed de Tipos de Contacto
    // ========================================================================
    console.log('📞 Creando tipos de contacto...');

    let tiposCreados = 0;
    let tiposActualizados = 0;

    for (const tipo of tiposContactoDefault) {
      const existente = await prisma.tipoContactoCatalogo.findUnique({
        where: { codigo: tipo.codigo }
      });

      if (existente) {
        await prisma.tipoContactoCatalogo.update({
          where: { codigo: tipo.codigo },
          data: tipo
        });
        tiposActualizados++;
        console.log(`   ♻️  ${tipo.icono} ${tipo.codigo} - ${tipo.nombre} (actualizado)`);
      } else {
        await prisma.tipoContactoCatalogo.create({
          data: tipo
        });
        tiposCreados++;
        console.log(`   ✅ ${tipo.icono} ${tipo.codigo} - ${tipo.nombre} (creado)`);
      }
    }

    console.log(`\n   📊 Tipos de contacto: ${tiposCreados} creados, ${tiposActualizados} actualizados`);

    // ========================================================================
    // Resumen Final
    // ========================================================================
    const totalTipos = await prisma.tipoContactoCatalogo.count();
    const totalTiposActivos = await prisma.tipoContactoCatalogo.count({
      where: { activo: true }
    });

    console.log('\n' + '═'.repeat(70));
    console.log('  📊 RESUMEN DEL SEED');
    console.log('═'.repeat(70));
    console.log(`  Tipos de contacto en DB:       ${totalTipos}`);
    console.log(`  Tipos de contacto activos:     ${totalTiposActivos}`);
    console.log(`  Tipos de contacto inactivos:   ${totalTipos - totalTiposActivos}`);
    console.log('═'.repeat(70));
    console.log('\n✅ Seed de tipos de contacto completado exitosamente\n');

  } catch (error) {
    console.error('❌ Error durante el seed de tipos de contacto:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si es el script principal
if (require.main === module) {
  seedTiposContacto()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedTiposContacto };
