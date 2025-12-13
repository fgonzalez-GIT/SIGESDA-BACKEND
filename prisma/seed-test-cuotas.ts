import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Nombres y apellidos para generar datos realistas
const nombres = [
  'Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Elena', 'Pedro', 'Laura',
  'José', 'Carmen', 'Miguel', 'Rosa', 'Antonio', 'Isabel', 'Francisco',
  'Dolores', 'Manuel', 'Teresa', 'Javier', 'Patricia', 'Rafael', 'Lucía',
  'Andrés', 'Marta', 'Diego', 'Sofía', 'Pablo', 'Beatriz', 'Alberto',
  'Cristina', 'Fernando', 'Gloria', 'Raúl', 'Pilar', 'Sergio', 'Silvia',
  'Jorge', 'Rocío', 'Víctor', 'Marina', 'Óscar', 'Natalia', 'Rubén',
  'Verónica', 'Iván', 'Alicia', 'Adrián', 'Julia', 'Daniel', 'Eva'
];

const apellidos = [
  'García', 'Rodríguez', 'Martínez', 'López', 'González', 'Pérez',
  'Sánchez', 'Fernández', 'Díaz', 'Torres', 'Ramírez', 'Flores',
  'Rivera', 'Gómez', 'Morales', 'Jiménez', 'Castro', 'Ortiz',
  'Romero', 'Ruiz', 'Vargas', 'Herrera', 'Mendoza', 'Silva'
];

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateDNI(index: number): string {
  return (40000000 + index).toString();
}

function generateEmail(nombre: string, apellido: string, index: number): string {
  return `${nombre.toLowerCase()}.${apellido.toLowerCase()}.${index}@test.com`;
}

async function seedTestCuotas() {
  console.log('🌱 Iniciando seed de datos de prueba para cuotas...\n');

  let participacionesCreadas = 0;

  try {
    // 1. Obtener próximo número de socio disponible
    const ultimoSocio = await prisma.persona.findFirst({
      where: { numeroSocio: { not: null } },
      orderBy: { numeroSocio: 'desc' },
      select: { numeroSocio: true }
    });

    const proximoNumeroSocio = (ultimoSocio?.numeroSocio || 0) + 100;
    console.log(`📋 Próximo número de socio: ${proximoNumeroSocio}\n`);

    // 2. Obtener catálogos
    console.log('📋 Obteniendo catálogos...');
    const tipoSocio = await prisma.tipoPersonaCatalogo.findUnique({
      where: { codigo: 'SOCIO' }
    });

    const categorias = {
      ACTIVO: await prisma.categoriaSocio.findUnique({ where: { codigo: 'ACTIVO' } }),
      ESTUDIANTE: await prisma.categoriaSocio.findUnique({ where: { codigo: 'ESTUDIANTE' } }),
      FAMILIAR: await prisma.categoriaSocio.findUnique({ where: { codigo: 'FAMILIAR' } }),
      JUBILADO: await prisma.categoriaSocio.findUnique({ where: { codigo: 'JUBILADO' } }),
      GENERAL: await prisma.categoriaSocio.findUnique({ where: { codigo: 'GENERAL' } })
    };

    if (!tipoSocio) {
      throw new Error('Tipo SOCIO no encontrado');
    }

    // 2. Crear socios
    console.log('\n👥 Creando 52 socios de prueba...');

    const distribuciones = [
      { categoria: categorias.ACTIVO!, cantidad: 25, prefix: 'ACT' },
      { categoria: categorias.ESTUDIANTE!, cantidad: 15, prefix: 'EST' },
      { categoria: categorias.FAMILIAR!, cantidad: 7, prefix: 'FAM' },
      { categoria: categorias.JUBILADO!, cantidad: 3, prefix: 'JUB' },
      { categoria: categorias.GENERAL!, cantidad: 2, prefix: 'GEN' }
    ];

    let index = proximoNumeroSocio;
    const sociosCreados = [];

    for (const dist of distribuciones) {
      console.log(`   - Creando ${dist.cantidad} socios ${dist.categoria.nombre}...`);

      for (let i = 0; i < dist.cantidad; i++) {
        const nombre = randomElement(nombres);
        const apellido = randomElement(apellidos);
        const dni = generateDNI(index);
        const email = generateEmail(nombre, apellido, index);

        const persona = await prisma.persona.create({
          data: {
            nombre,
            apellido,
            dni,
            email,
            telefono: `+54 9 11 ${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`,
            direccion: `Calle ${randomElement(['San Martín', 'Belgrano', 'Mitre', 'Rivadavia'])} ${randomInt(100, 999)}`,
            fechaNacimiento: new Date(randomInt(1950, 2010), randomInt(0, 11), randomInt(1, 28)),
            genero: randomElement(['MASCULINO', 'FEMENINO']),
            numeroSocio: index,
            fechaIngreso: new Date(randomInt(2020, 2024), randomInt(0, 11), randomInt(1, 28)),
            activo: true,
            categoriaId: dist.categoria.id,
            tipos: {
              create: {
                tipoPersonaId: tipoSocio.id,
                categoriaId: dist.categoria.id,
                activo: true
              }
            }
          }
        });

        sociosCreados.push(persona);
        index++;
      }
    }

    console.log(`✅ ${sociosCreados.length} socios creados exitosamente\n`);

    // 3. Crear actividades de prueba
    console.log('🎵 Creando actividades de prueba...');

    const tipoActividad = await prisma.tipos_actividades.findFirst();
    const categoriaActividad = await prisma.categorias_actividades.findFirst();
    const estadoActividad = await prisma.estados_actividades.findFirst();

    if (!tipoActividad || !categoriaActividad || !estadoActividad) {
      console.log('⚠️  No hay catálogos de actividades, saltando creación de actividades');
    } else {
      const actividades = [
        { nombre: 'Guitarra Individual', costo: 2500 },
        { nombre: 'Piano Individual', costo: 3000 },
        { nombre: 'Violín Individual', costo: 2800 },
        { nombre: 'Canto Grupal', costo: 1500 }
      ];

      for (const act of actividades) {
        await prisma.actividades.create({
          data: {
            codigoActividad: `ACT-TEST-${act.nombre.substring(0, 4).toUpperCase()}`,
            nombre: act.nombre,
            tipoActividadId: tipoActividad.id,
            categoriaId: categoriaActividad.id,
            estadoId: estadoActividad.id,
            descripcion: `Actividad de prueba: ${act.nombre}`,
            fechaDesde: new Date('2025-01-01'),
            capacidadMaxima: 20,
            costo: act.costo,
            activa: true
          }
        });
      }

      console.log('✅ 4 actividades creadas\n');

      // 4. Crear participaciones de prueba (20 socios con actividades)
      console.log('🎯 Creando participaciones en actividades...');

      const actividadesCreadas = await prisma.actividades.findMany({
        where: {
          codigoActividad: { startsWith: 'ACT-TEST-' }
        }
      });

      const sociosParaActividades = sociosCreados.slice(0, 20);
      let participacionesCreadas = 0;

      for (const socio of sociosParaActividades) {
        const cantActividades = randomInt(1, 3);
        const actividadesSeleccionadas = actividadesCreadas
          .sort(() => 0.5 - Math.random())
          .slice(0, cantActividades);

        for (const actividad of actividadesSeleccionadas) {
          await prisma.participacion_actividades.create({
            data: {
              personaId: socio.id,
              actividadId: actividad.id,
              fechaInicio: new Date('2025-01-01'),
              precioEspecial: Math.random() > 0.7 ? Number(actividad.costo) * 0.9 : null,
              activa: true
            }
          });
          participacionesCreadas++;
        }
      }

      console.log(`✅ ${participacionesCreadas} participaciones creadas\n`);
    }

    // 5. Crear relaciones familiares
    console.log('👨‍👩‍👧‍👦 Creando relaciones familiares...');

    const sociosParaFamilias = sociosCreados.slice(0, 30);
    let relacionesCreadas = 0;

    for (let i = 0; i < sociosParaFamilias.length - 1; i += 2) {
      const socio1 = sociosParaFamilias[i];
      const socio2 = sociosParaFamilias[i + 1];

      if (socio1 && socio2) {
        await prisma.familiar.create({
          data: {
            socioId: socio1.id,
            familiarId: socio2.id,
            parentesco: randomElement(['CONYUGE', 'HERMANO', 'PADRE']),
            descuento: randomInt(0, 1) > 0 ? randomInt(10, 25) : 0,
            activo: true
          }
        });
        relacionesCreadas++;
      }
    }

    console.log(`✅ ${relacionesCreadas} relaciones familiares creadas\n`);

    // 6. Resumen final
    console.log('📊 RESUMEN DEL SEED:');
    console.log('━'.repeat(50));
    console.log(`Total de socios creados: ${sociosCreados.length}`);
    console.log('  - ACTIVO: 25');
    console.log('  - ESTUDIANTE: 15');
    console.log('  - FAMILIAR: 7');
    console.log('  - JUBILADO: 3');
    console.log('  - GENERAL: 2');
    console.log(`Total de actividades: 4`);
    console.log(`Total de participaciones: ${participacionesCreadas}`);
    console.log(`Total de relaciones familiares: ${relacionesCreadas}`);
    console.log('━'.repeat(50));

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedTestCuotas()
  .then(() => {
    console.log('\n🎉 Seed completado con éxito!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal durante el seed:', error);
    process.exit(1);
  });
