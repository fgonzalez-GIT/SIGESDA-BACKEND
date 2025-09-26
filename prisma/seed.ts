import { PrismaClient } from '@prisma/client';
import { TipoPersona, CategoriaSocio, TipoActividad, MedioPagoTipo, TipoParentesco } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de datos...');

  // Limpiar datos existentes (en orden de dependencias)
  await prisma.medioPago.deleteMany();
  await prisma.cuota.deleteMany();
  await prisma.recibo.deleteMany();
  await prisma.reservaAula.deleteMany();
  await prisma.participacionActividad.deleteMany();
  await prisma.familiar.deleteMany();
  await prisma.comisionDirectiva.deleteMany();
  await prisma.actividad.deleteMany();
  await prisma.persona.deleteMany();
  await prisma.aula.deleteMany();
  await prisma.configuracionSistema.deleteMany();

  // 1. Configuración del Sistema
  console.log('📋 Creando configuración del sistema...');
  await prisma.configuracionSistema.createMany({
    data: [
      {
        clave: 'CUOTA_SOCIO_ACTIVO',
        valor: '5000',
        descripcion: 'Cuota mensual para socio activo',
        tipo: 'NUMBER'
      },
      {
        clave: 'CUOTA_SOCIO_ESTUDIANTE',
        valor: '2500',
        descripcion: 'Cuota mensual para socio estudiante',
        tipo: 'NUMBER'
      },
      {
        clave: 'CUOTA_SOCIO_FAMILIAR',
        valor: '3000',
        descripcion: 'Cuota mensual para socio familiar',
        tipo: 'NUMBER'
      },
      {
        clave: 'CUOTA_SOCIO_JUBILADO',
        valor: '2000',
        descripcion: 'Cuota mensual para socio jubilado',
        tipo: 'NUMBER'
      },
      {
        clave: 'RECIBO_NUMERACION_ACTUAL',
        valor: '1000',
        descripcion: 'Último número de recibo utilizado',
        tipo: 'NUMBER'
      }
    ]
  });

  // 2. Aulas
  console.log('🏠 Creando aulas...');
  const aulas = await prisma.aula.createMany({
    data: [
      {
        nombre: 'Aula Principal',
        capacidad: 30,
        ubicacion: 'Planta Baja',
        equipamiento: 'Piano, sistema de sonido, pizarra'
      },
      {
        nombre: 'Aula de Instrumentos',
        capacidad: 15,
        ubicacion: 'Primer Piso',
        equipamiento: 'Guitarras, teclados, amplificadores'
      },
      {
        nombre: 'Sala de Ensayos',
        capacidad: 20,
        ubicacion: 'Sótano',
        equipamiento: 'Batería, micrófonos, mesa de mezclas'
      }
    ]
  });

  // 3. Personas - Docentes
  console.log('👩‍🏫 Creando docentes...');
  const docente1 = await prisma.persona.create({
    data: {
      tipo: TipoPersona.DOCENTE,
      nombre: 'María Elena',
      apellido: 'González',
      dni: '25123456',
      email: 'maria.gonzalez@sigesda.com',
      telefono: '351-1234567',
      direccion: 'Av. Colón 1234, Córdoba',
      especialidad: 'Canto lírico',
      honorariosPorHora: 3000
    }
  });

  const docente2 = await prisma.persona.create({
    data: {
      tipo: TipoPersona.DOCENTE,
      nombre: 'Carlos Roberto',
      apellido: 'Fernández',
      dni: '22987654',
      email: 'carlos.fernandez@sigesda.com',
      telefono: '351-7654321',
      direccion: 'San Martín 567, Córdoba',
      especialidad: 'Piano y armonía',
      honorariosPorHora: 3500
    }
  });

  const docente3 = await prisma.persona.create({
    data: {
      tipo: TipoPersona.DOCENTE,
      nombre: 'Ana Patricia',
      apellido: 'Morales',
      dni: '28456789',
      email: 'ana.morales@sigesda.com',
      telefono: '351-9876543',
      direccion: '9 de Julio 890, Córdoba',
      especialidad: 'Guitarra clásica',
      honorariosPorHora: 2800
    }
  });

  // 4. Personas - Socios
  console.log('🎭 Creando socios...');
  let numeroSocio = 1;

  const socio1 = await prisma.persona.create({
    data: {
      tipo: TipoPersona.SOCIO,
      nombre: 'Juan Carlos',
      apellido: 'Pérez',
      dni: '30123456',
      email: 'juan.perez@email.com',
      telefono: '351-1111111',
      direccion: 'Rivadavia 123, Córdoba',
      numeroSocio: numeroSocio++,
      categoria: CategoriaSocio.ACTIVO,
      fechaIngreso: new Date('2023-01-15')
    }
  });

  const socio2 = await prisma.persona.create({
    data: {
      tipo: TipoPersona.SOCIO,
      nombre: 'Laura Beatriz',
      apellido: 'Martínez',
      dni: '32456789',
      email: 'laura.martinez@email.com',
      telefono: '351-2222222',
      direccion: 'Belgrano 456, Córdoba',
      numeroSocio: numeroSocio++,
      categoria: CategoriaSocio.ESTUDIANTE,
      fechaIngreso: new Date('2023-02-01'),
      fechaNacimiento: new Date('2001-05-10')
    }
  });

  const socio3 = await prisma.persona.create({
    data: {
      tipo: TipoPersona.SOCIO,
      nombre: 'Roberto Miguel',
      apellido: 'Silva',
      dni: '18789123',
      email: 'roberto.silva@email.com',
      telefono: '351-3333333',
      direccion: 'Vélez Sársfield 789, Córdoba',
      numeroSocio: numeroSocio++,
      categoria: CategoriaSocio.JUBILADO,
      fechaIngreso: new Date('2022-08-10'),
      fechaNacimiento: new Date('1955-12-20')
    }
  });

  const socio4 = await prisma.persona.create({
    data: {
      tipo: TipoPersona.SOCIO,
      nombre: 'Carmen Rosa',
      apellido: 'Pérez',
      dni: '35555666',
      email: 'carmen.perez@email.com',
      telefono: '351-4444444',
      direccion: 'Rivadavia 123, Córdoba', // misma dirección que Juan Carlos
      numeroSocio: numeroSocio++,
      categoria: CategoriaSocio.FAMILIAR,
      fechaIngreso: new Date('2023-01-15')
    }
  });

  // 5. Personas - No Socios
  console.log('👤 Creando no socios...');
  const noSocio1 = await prisma.persona.create({
    data: {
      tipo: TipoPersona.NO_SOCIO,
      nombre: 'Sofía Alejandra',
      apellido: 'Torres',
      dni: '36789456',
      email: 'sofia.torres@email.com',
      telefono: '351-5555555',
      direccion: 'Independencia 321, Córdoba'
    }
  });

  // 6. Personas - Proveedores
  console.log('🏢 Creando proveedores...');
  const proveedor1 = await prisma.persona.create({
    data: {
      tipo: TipoPersona.PROVEEDOR,
      nombre: 'Instrumentos',
      apellido: 'Musicales SRL',
      dni: '20123456789',
      cuit: '20-12345678-9',
      razonSocial: 'Instrumentos Musicales SRL',
      email: 'ventas@instrumentosmusicales.com',
      telefono: '351-6666666',
      direccion: 'Av. General Paz 1500, Córdoba'
    }
  });

  // 7. Relaciones familiares
  console.log('👨‍👩‍👧‍👦 Creando relaciones familiares...');
  await prisma.familiar.create({
    data: {
      socioId: socio1.id,
      familiarId: socio4.id,
      parentesco: TipoParentesco.CONYUGE
    }
  });

  // 8. Comisión Directiva
  console.log('🏛️ Creando comisión directiva...');
  await prisma.comisionDirectiva.create({
    data: {
      socioId: socio1.id,
      cargo: 'Presidente',
      fechaInicio: new Date('2023-01-01')
    }
  });

  // 9. Actividades
  console.log('🎵 Creando actividades...');
  const coroAdultos = await prisma.actividad.create({
    data: {
      nombre: 'Coro de Adultos',
      tipo: TipoActividad.CORO,
      descripcion: 'Coro principal de la asociación para adultos',
      precio: 0, // Los coros no se cobran
      duracion: 120,
      capacidadMaxima: 40,
      docentes: {
        connect: [{ id: docente1.id }]
      }
    }
  });

  const clasePiano = await prisma.actividad.create({
    data: {
      nombre: 'Clases de Piano - Nivel Inicial',
      tipo: TipoActividad.CLASE_INSTRUMENTO,
      descripcion: 'Clases grupales de piano para principiantes',
      precio: 8000,
      duracion: 60,
      capacidadMaxima: 8,
      docentes: {
        connect: [{ id: docente2.id }]
      }
    }
  });

  const claseGuitarra = await prisma.actividad.create({
    data: {
      nombre: 'Clases de Guitarra Clásica',
      tipo: TipoActividad.CLASE_INSTRUMENTO,
      descripcion: 'Clases de guitarra clásica nivel intermedio',
      precio: 7000,
      duracion: 60,
      capacidadMaxima: 6,
      docentes: {
        connect: [{ id: docente3.id }]
      }
    }
  });

  const claseCanto = await prisma.actividad.create({
    data: {
      nombre: 'Técnica Vocal',
      tipo: TipoActividad.CLASE_CANTO,
      descripcion: 'Clases de técnica vocal y canto lírico',
      precio: 9000,
      duracion: 45,
      capacidadMaxima: 10,
      docentes: {
        connect: [{ id: docente1.id }]
      }
    }
  });

  // 10. Participaciones en actividades
  console.log('🎪 Creando participaciones en actividades...');

  // Socios en coro (gratis)
  await prisma.participacionActividad.createMany({
    data: [
      {
        personaId: socio1.id,
        actividadId: coroAdultos.id,
        fechaInicio: new Date('2023-02-01')
      },
      {
        personaId: socio2.id,
        actividadId: coroAdultos.id,
        fechaInicio: new Date('2023-02-01')
      },
      {
        personaId: socio3.id,
        actividadId: coroAdultos.id,
        fechaInicio: new Date('2023-02-15')
      }
    ]
  });

  // No socio en coro (gratis también)
  await prisma.participacionActividad.create({
    data: {
      personaId: noSocio1.id,
      actividadId: coroAdultos.id,
      fechaInicio: new Date('2023-03-01')
    }
  });

  // Socios en clases pagas
  await prisma.participacionActividad.createMany({
    data: [
      {
        personaId: socio2.id,
        actividadId: clasePiano.id,
        fechaInicio: new Date('2023-03-01')
      },
      {
        personaId: socio1.id,
        actividadId: claseCanto.id,
        fechaInicio: new Date('2023-02-15')
      },
      {
        personaId: socio4.id,
        actividadId: claseGuitarra.id,
        fechaInicio: new Date('2023-04-01')
      }
    ]
  });

  // No socio en clase (con precio especial)
  await prisma.participacionActividad.create({
    data: {
      personaId: noSocio1.id,
      actividadId: clasePiano.id,
      fechaInicio: new Date('2023-03-15'),
      precioEspecial: 10000 // Precio especial para no socios (más caro)
    }
  });

  console.log('✅ Seed completado exitosamente!');
  console.log(`
📊 Datos creados:
- ${await prisma.persona.count()} personas
- ${await prisma.actividad.count()} actividades
- ${await prisma.participacionActividad.count()} participaciones
- ${await prisma.aula.count()} aulas
- ${await prisma.configuracionSistema.count()} configuraciones
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });