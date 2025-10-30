import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Migrando datos de Persona a arquitectura V2...\n');

  // 1. Obtener ID de especialidad GENERAL
  const especialidadGeneral = await prisma.especialidadDocente.findUnique({
    where: { codigo: 'GENERAL' }
  });

  if (!especialidadGeneral) {
    throw new Error('Especialidad GENERAL no encontrada. Ejecute primero los seeds.');
  }

  console.log(`✅ Especialidad GENERAL encontrada (ID: ${especialidadGeneral.id})\n`);

  // 2. Obtener todas las personas existentes
  const personas = await prisma.persona.findMany();

  console.log(`📋 Encontradas ${personas.length} personas para migrar\n`);

  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  // 3. Migrar cada persona
  for (const persona of personas) {
    try {
      // Verificar si ya tiene un tipo asignado en V2
      const existingTipo = await prisma.personaTipo.findFirst({
        where: { personaId: persona.id }
      });

      if (existingTipo) {
        console.log(`⏭️  Persona ${persona.id} (${persona.nombre} ${persona.apellido}) ya migrada`);
        skippedCount++;
        continue;
      }

      // Obtener el catálogo de tipo
      const tipoCatalogo = await prisma.tipoPersonaCatalogo.findUnique({
        where: { codigo: persona.tipo }
      });

      if (!tipoCatalogo) {
        console.error(`❌ Tipo ${persona.tipo} no encontrado en catálogo`);
        errorCount++;
        continue;
      }

      // Preparar datos según el tipo
      const tipoData: any = {
        personaId: persona.id,
        tipoPersonaId: tipoCatalogo.id,
        activo: persona.fechaBaja === null,
        fechaAsignacion: persona.fechaIngreso || persona.createdAt
      };

      // Campos específicos de SOCIO
      if (persona.tipo === 'SOCIO') {
        tipoData.categoriaId = persona.categoriaId;
        tipoData.numeroSocio = persona.numeroSocio;
        tipoData.fechaIngreso = persona.fechaIngreso;
        tipoData.fechaBaja = persona.fechaBaja;
        tipoData.motivoBaja = persona.motivoBaja;
      }

      // Campos específicos de DOCENTE
      if (persona.tipo === 'DOCENTE') {
        tipoData.especialidadId = especialidadGeneral.id;
        tipoData.honorariosPorHora = persona.honorariosPorHora;
      }

      // Campos específicos de PROVEEDOR
      if (persona.tipo === 'PROVEEDOR') {
        tipoData.cuit = persona.cuit;
        tipoData.razonSocial = persona.razonSocial;
      }

      // Crear PersonaTipo
      await prisma.personaTipo.create({
        data: tipoData
      });

      console.log(`✅ Persona ${persona.id} (${persona.nombre} ${persona.apellido}) - Tipo: ${persona.tipo}`);
      migratedCount++;

      // Migrar contactos (email y teléfono)
      if (persona.email) {
        try {
          await prisma.contactoPersona.create({
            data: {
              personaId: persona.id,
              tipoContacto: 'EMAIL',
              valor: persona.email,
              principal: true,
              activo: true
            }
          });
          console.log(`   📧 Email migrado: ${persona.email}`);
        } catch (err) {
          console.log(`   ⚠️  Email ya existe`);
        }
      }

      if (persona.telefono) {
        try {
          await prisma.contactoPersona.create({
            data: {
              personaId: persona.id,
              tipoContacto: 'TELEFONO',
              valor: persona.telefono,
              principal: true,
              activo: true
            }
          });
          console.log(`   📱 Teléfono migrado: ${persona.telefono}`);
        } catch (err) {
          console.log(`   ⚠️  Teléfono ya existe`);
        }
      }
    } catch (error) {
      console.error(`❌ Error migrando persona ${persona.id}:`, error);
      errorCount++;
    }
  }

  console.log('\n======================================');
  console.log('📊 RESUMEN DE MIGRACIÓN');
  console.log('======================================');
  console.log(`✅ Migradas exitosamente: ${migratedCount}`);
  console.log(`⏭️  Ya existentes (saltadas): ${skippedCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  console.log(`📋 Total procesadas: ${personas.length}`);
  console.log('======================================\n');

  // Verificar resultados
  const totalPersonaTipos = await prisma.personaTipo.count();
  const totalContactos = await prisma.contactoPersona.count();

  console.log(`🎉 PersonaTipo en BD: ${totalPersonaTipos}`);
  console.log(`🎉 ContactoPersona en BD: ${totalContactos}\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error fatal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
