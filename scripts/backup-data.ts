import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function createDataBackup() {
  console.log('🔄 Iniciando backup de datos...');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupDir = path.join(__dirname, '..', 'backups');
  const backupFile = path.join(backupDir, `data_backup_${timestamp}.json`);

  try {
    // Obtener conteo de registros de tablas principales
    const counts = {
      personas: await prisma.persona.count(),
      personaTipo: await prisma.personaTipo.count(),
      actividades: await prisma.actividades.count(),
      participaciones: await prisma.participacion_actividades.count(),
      cuotas: await prisma.cuota.count(),
      recibos: await prisma.recibo.count(),
      familiares: await prisma.familiar.count(),
      categoriasSocios: await prisma.categoriaSocio.count(),
    };

    console.log('📊 Conteo de registros:');
    console.log(JSON.stringify(counts, null, 2));

    // Exportar datos críticos
    const backup = {
      metadata: {
        timestamp: new Date().toISOString(),
        counts,
        version: '1.0'
      },
      data: {
        // Catálogos (siempre se incluyen)
        categoriasSocios: await prisma.categoriaSocio.findMany(),
        tipoPersonaCatalogo: await prisma.tipoPersonaCatalogo.findMany(),
        tiposActividades: await prisma.tipos_actividades.findMany(),
        categoriasActividades: await prisma.categorias_actividades.findMany(),
        estadosActividades: await prisma.estados_actividades.findMany(),

        // Datos principales (solo si hay registros)
        personas: counts.personas > 0 ? await prisma.persona.findMany({
          include: {
            tipos: {
              include: {
                tipoPersona: true,
                categoria: true,
                especialidad: true
              }
            }
          }
        }) : [],

        cuotas: counts.cuotas > 0 ? await prisma.cuota.findMany({
          include: {
            recibo: true,
            categoria: true
          }
        }) : [],

        recibos: counts.recibos > 0 ? await prisma.recibo.findMany({
          include: {
            mediosPago: true
          }
        }) : [],
      }
    };

    // Escribir archivo JSON
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));

    console.log(`✅ Backup creado exitosamente: ${backupFile}`);
    console.log(`📦 Tamaño del archivo: ${(fs.statSync(backupFile).size / 1024).toFixed(2)} KB`);

    return backupFile;

  } catch (error) {
    console.error('❌ Error al crear backup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createDataBackup()
  .then((file) => {
    console.log('\n🎉 Backup completado con éxito');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error durante el backup:', error);
    process.exit(1);
  });
