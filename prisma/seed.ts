import { PrismaClient, TipoPersona, TipoParentesco } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de datos...');

  // ============================================================================
  // CATÁLOGOS - Se crean/actualizan con upsert para idempotencia
  // ============================================================================

  console.log('📚 Creando catálogos del sistema...');

  // 1. Estados de Actividades (CRÍTICO - requerido por FK)
  console.log('  - Estados de actividades...');
  await prisma.estados_actividades.upsert({
    where: { codigo: 'ACTIVA' },
    update: {},
    create: {
      codigo: 'ACTIVA',
      nombre: 'Activa',
      descripcion: 'Actividad en inscripción o en curso',
      orden: 1,
      activo: true
    }
  });

  await prisma.estados_actividades.upsert({
    where: { codigo: 'EN_CURSO' },
    update: {},
    create: {
      codigo: 'EN_CURSO',
      nombre: 'En Curso',
      descripcion: 'Actividad iniciada',
      orden: 2,
      activo: true
    }
  });

  await prisma.estados_actividades.upsert({
    where: { codigo: 'FINALIZADA' },
    update: {},
    create: {
      codigo: 'FINALIZADA',
      nombre: 'Finalizada',
      descripcion: 'Actividad terminada',
      orden: 3,
      activo: true
    }
  });

  await prisma.estados_actividades.upsert({
    where: { codigo: 'CANCELADA' },
    update: {},
    create: {
      codigo: 'CANCELADA',
      nombre: 'Cancelada',
      descripcion: 'Actividad cancelada',
      orden: 4,
      activo: true
    }
  });

  await prisma.estados_actividades.upsert({
    where: { codigo: 'SUSPENDIDA' },
    update: {},
    create: {
      codigo: 'SUSPENDIDA',
      nombre: 'Suspendida',
      descripcion: 'Actividad temporalmente suspendida',
      orden: 5,
      activo: true
    }
  });

  // 2. Tipos de Actividades
  console.log('  - Tipos de actividades...');
  await prisma.tipos_actividades.upsert({
    where: { codigo: 'CORO' },
    update: {},
    create: {
      codigo: 'CORO',
      nombre: 'Coro',
      descripcion: 'Actividades corales',
      orden: 1,
      activo: true
    }
  });

  await prisma.tipos_actividades.upsert({
    where: { codigo: 'CLASE_CANTO' },
    update: {},
    create: {
      codigo: 'CLASE_CANTO',
      nombre: 'Clase de Canto',
      descripcion: 'Clases de técnica vocal y canto',
      orden: 2,
      activo: true
    }
  });

  await prisma.tipos_actividades.upsert({
    where: { codigo: 'CLASE_INSTRUMENTO' },
    update: {},
    create: {
      codigo: 'CLASE_INSTRUMENTO',
      nombre: 'Clase de Instrumento',
      descripcion: 'Clases de instrumentos musicales',
      orden: 3,
      activo: true
    }
  });

  await prisma.tipos_actividades.upsert({
    where: { codigo: 'TALLER' },
    update: {},
    create: {
      codigo: 'TALLER',
      nombre: 'Taller',
      descripcion: 'Talleres musicales',
      orden: 4,
      activo: true
    }
  });

  await prisma.tipos_actividades.upsert({
    where: { codigo: 'EVENTO' },
    update: {},
    create: {
      codigo: 'EVENTO',
      nombre: 'Evento',
      descripcion: 'Eventos y presentaciones',
      orden: 5,
      activo: true
    }
  });

  // 3. Categorías de Actividades
  console.log('  - Categorías de actividades...');
  await prisma.categorias_actividades.upsert({
    where: { codigo: 'INFANTIL' },
    update: {},
    create: {
      codigo: 'INFANTIL',
      nombre: 'Infantil',
      descripcion: 'Para niños de 6 a 12 años',
      orden: 1,
      activo: true
    }
  });

  await prisma.categorias_actividades.upsert({
    where: { codigo: 'JUVENIL' },
    update: {},
    create: {
      codigo: 'JUVENIL',
      nombre: 'Juvenil',
      descripcion: 'Para jóvenes de 13 a 17 años',
      orden: 2,
      activo: true
    }
  });

  await prisma.categorias_actividades.upsert({
    where: { codigo: 'ADULTO' },
    update: {},
    create: {
      codigo: 'ADULTO',
      nombre: 'Adultos',
      descripcion: 'Para adultos mayores de 18 años',
      orden: 3,
      activo: true
    }
  });

  await prisma.categorias_actividades.upsert({
    where: { codigo: 'SENIOR' },
    update: {},
    create: {
      codigo: 'SENIOR',
      nombre: 'Adultos Mayores',
      descripcion: 'Para adultos mayores de 60 años',
      orden: 4,
      activo: true
    }
  });

  await prisma.categorias_actividades.upsert({
    where: { codigo: 'FAMILIAR' },
    update: {},
    create: {
      codigo: 'FAMILIAR',
      nombre: 'Familiar',
      descripcion: 'Actividades para toda la familia',
      orden: 5,
      activo: true
    }
  });

  await prisma.categorias_actividades.upsert({
    where: { codigo: 'GENERAL' },
    update: {},
    create: {
      codigo: 'GENERAL',
      nombre: 'General',
      descripcion: 'Sin restricción de edad',
      orden: 6,
      activo: true
    }
  });

  // 4. Días de la Semana
  console.log('  - Días de la semana...');
  await prisma.dias_semana.upsert({
    where: { codigo: 'LUNES' },
    update: {},
    create: {
      codigo: 'LUNES',
      nombre: 'Lunes',
      orden: 1
    }
  });

  await prisma.dias_semana.upsert({
    where: { codigo: 'MARTES' },
    update: {},
    create: {
      codigo: 'MARTES',
      nombre: 'Martes',
      orden: 2
    }
  });

  await prisma.dias_semana.upsert({
    where: { codigo: 'MIERCOLES' },
    update: {},
    create: {
      codigo: 'MIERCOLES',
      nombre: 'Miércoles',
      orden: 3
    }
  });

  await prisma.dias_semana.upsert({
    where: { codigo: 'JUEVES' },
    update: {},
    create: {
      codigo: 'JUEVES',
      nombre: 'Jueves',
      orden: 4
    }
  });

  await prisma.dias_semana.upsert({
    where: { codigo: 'VIERNES' },
    update: {},
    create: {
      codigo: 'VIERNES',
      nombre: 'Viernes',
      orden: 5
    }
  });

  await prisma.dias_semana.upsert({
    where: { codigo: 'SABADO' },
    update: {},
    create: {
      codigo: 'SABADO',
      nombre: 'Sábado',
      orden: 6
    }
  });

  await prisma.dias_semana.upsert({
    where: { codigo: 'DOMINGO' },
    update: {},
    create: {
      codigo: 'DOMINGO',
      nombre: 'Domingo',
      orden: 7
    }
  });

  // 5. Roles de Docentes
  console.log('  - Roles de docentes...');
  await prisma.roles_docentes.upsert({
    where: { codigo: 'TITULAR' },
    update: {},
    create: {
      codigo: 'TITULAR',
      nombre: 'Titular',
      descripcion: 'Docente titular de la actividad',
      orden: 1,
      activo: true
    }
  });

  await prisma.roles_docentes.upsert({
    where: { codigo: 'ASISTENTE' },
    update: {},
    create: {
      codigo: 'ASISTENTE',
      nombre: 'Asistente',
      descripcion: 'Docente asistente',
      orden: 2,
      activo: true
    }
  });

  await prisma.roles_docentes.upsert({
    where: { codigo: 'SUPLENTE' },
    update: {},
    create: {
      codigo: 'SUPLENTE',
      nombre: 'Suplente',
      descripcion: 'Docente suplente',
      orden: 3,
      activo: true
    }
  });

  await prisma.roles_docentes.upsert({
    where: { codigo: 'INVITADO' },
    update: {},
    create: {
      codigo: 'INVITADO',
      nombre: 'Invitado',
      descripcion: 'Docente invitado especial',
      orden: 4,
      activo: true
    }
  });

  // 6. Categorías de Socios
  console.log('  - Categorías de socios...');
  await prisma.categoriaSocio.upsert({
    where: { codigo: 'SOCIO_ACTIVO' },
    update: {},
    create: {
      codigo: 'SOCIO_ACTIVO',
      nombre: 'Socio Activo',
      descripcion: 'Socio activo con todos los derechos',
      montoCuota: 5000,
      orden: 1,
      activa: true
    }
  });

  await prisma.categoriaSocio.upsert({
    where: { codigo: 'SOCIO_VITALICIO' },
    update: {},
    create: {
      codigo: 'SOCIO_VITALICIO',
      nombre: 'Socio Vitalicio',
      descripcion: 'Socio vitalicio sin cuota mensual',
      montoCuota: 0,
      orden: 2,
      activa: true
    }
  });

  await prisma.categoriaSocio.upsert({
    where: { codigo: 'SOCIO_HONORARIO' },
    update: {},
    create: {
      codigo: 'SOCIO_HONORARIO',
      nombre: 'Socio Honorario',
      descripcion: 'Socio honorario',
      montoCuota: 0,
      orden: 3,
      activa: true
    }
  });

  await prisma.categoriaSocio.upsert({
    where: { codigo: 'SOCIO_ADHERENTE' },
    update: {},
    create: {
      codigo: 'SOCIO_ADHERENTE',
      nombre: 'Socio Adherente',
      descripcion: 'Socio adherente con derechos limitados',
      montoCuota: 3000,
      orden: 4,
      activa: true
    }
  });

  console.log('✅ Catálogos creados/actualizados');
  console.log('');

  // ============================================================================
  // DATOS OPERACIONALES - Se limpian y recrean
  // ============================================================================

  console.log('🧹 Limpiando datos operacionales existentes...');

  // Limpiar datos existentes (en orden de dependencias)
  await prisma.medioPago.deleteMany();
  await prisma.cuota.deleteMany();
  await prisma.recibo.deleteMany();
  await prisma.reservas_aulas_actividades.deleteMany();
  await prisma.participaciones_actividades.deleteMany();
  await prisma.familiar.deleteMany();
  await prisma.comisionDirectiva.deleteMany();
  await prisma.actividades.deleteMany();
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

  // 4. Personas - Socios (obtener IDs de categorías primero)
  console.log('🎭 Creando socios...');
  let numeroSocio = 1;

  const categoriaActivo = await prisma.categoriaSocio.findUnique({ where: { codigo: 'SOCIO_ACTIVO' } });
  const categoriaEstudiante = await prisma.categoriaSocio.findUnique({ where: { codigo: 'SOCIO_ADHERENTE' } });
  const categoriaJubilado = await prisma.categoriaSocio.findUnique({ where: { codigo: 'SOCIO_VITALICIO' } });

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
      categoriaId: categoriaActivo!.id,
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
      categoriaId: categoriaEstudiante!.id,
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
      categoriaId: categoriaJubilado!.id,
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
      categoriaId: categoriaActivo!.id,
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

  // 9. Actividades (obtener IDs de catálogos)
  console.log('🎵 Creando actividades...');

  const tipoCoro = await prisma.tipos_actividades.findUnique({ where: { codigo: 'CORO' } });
  const tipoClaseInstrumento = await prisma.tipos_actividades.findUnique({ where: { codigo: 'CLASE_INSTRUMENTO' } });
  const tipoClaseCanto = await prisma.tipos_actividades.findUnique({ where: { codigo: 'CLASE_CANTO' } });
  const categoriaAdulto = await prisma.categorias_actividades.findUnique({ where: { codigo: 'ADULTO' } });
  const categoriaGeneral = await prisma.categorias_actividades.findUnique({ where: { codigo: 'GENERAL' } });
  const estadoActiva = await prisma.estados_actividades.findUnique({ where: { codigo: 'ACTIVA' } });

  const coroAdultos = await prisma.actividades.create({
    data: {
      codigo_actividad: 'CORO-2024-01',
      nombre: 'Coro de Adultos',
      tipo_actividad_id: tipoCoro!.id,
      categoria_id: categoriaAdulto!.id,
      estado_id: estadoActiva!.id,
      descripcion: 'Coro principal de la asociación para adultos',
      costo: 0, // Los coros no se cobran
      cupo_maximo: 40,
      fecha_desde: new Date('2024-03-01')
    }
  });

  const clasePiano = await prisma.actividades.create({
    data: {
      codigo_actividad: 'PIANO-2024-01',
      nombre: 'Clases de Piano - Nivel Inicial',
      tipo_actividad_id: tipoClaseInstrumento!.id,
      categoria_id: categoriaGeneral!.id,
      estado_id: estadoActiva!.id,
      descripcion: 'Clases grupales de piano para principiantes',
      costo: 8000,
      cupo_maximo: 8,
      fecha_desde: new Date('2024-03-01')
    }
  });

  const claseGuitarra = await prisma.actividades.create({
    data: {
      codigo_actividad: 'GUITARRA-2024-01',
      nombre: 'Clases de Guitarra Clásica',
      tipo_actividad_id: tipoClaseInstrumento!.id,
      categoria_id: categoriaAdulto!.id,
      estado_id: estadoActiva!.id,
      descripcion: 'Clases de guitarra clásica nivel intermedio',
      costo: 7000,
      cupo_maximo: 6,
      fecha_desde: new Date('2024-03-01')
    }
  });

  const claseCanto = await prisma.actividades.create({
    data: {
      codigo_actividad: 'CANTO-2024-01',
      nombre: 'Técnica Vocal',
      tipo_actividad_id: tipoClaseCanto!.id,
      categoria_id: categoriaGeneral!.id,
      estado_id: estadoActiva!.id,
      descripcion: 'Clases de técnica vocal y canto lírico',
      costo: 9000,
      cupo_maximo: 10,
      fecha_desde: new Date('2024-03-01')
    }
  });

  // 10. Participaciones en actividades
  console.log('🎪 Creando participaciones en actividades...');

  // Socios en coro (gratis)
  await prisma.participaciones_actividades.createMany({
    data: [
      {
        persona_id: socio1.id,
        actividad_id: coroAdultos.id,
        fecha_inicio: new Date('2024-02-01'),
        activo: true
      },
      {
        persona_id: socio2.id,
        actividad_id: coroAdultos.id,
        fecha_inicio: new Date('2024-02-01'),
        activo: true
      },
      {
        persona_id: socio3.id,
        actividad_id: coroAdultos.id,
        fecha_inicio: new Date('2024-02-15'),
        activo: true
      }
    ]
  });

  // No socio en coro (gratis también)
  await prisma.participaciones_actividades.create({
    data: {
      persona_id: noSocio1.id,
      actividad_id: coroAdultos.id,
      fecha_inicio: new Date('2024-03-01'),
      activo: true
    }
  });

  // Socios en clases pagas
  await prisma.participaciones_actividades.createMany({
    data: [
      {
        persona_id: socio2.id,
        actividad_id: clasePiano.id,
        fecha_inicio: new Date('2024-03-01'),
        activo: true
      },
      {
        persona_id: socio1.id,
        actividad_id: claseCanto.id,
        fecha_inicio: new Date('2024-02-15'),
        activo: true
      },
      {
        persona_id: socio4.id,
        actividad_id: claseGuitarra.id,
        fecha_inicio: new Date('2024-04-01'),
        activo: true
      }
    ]
  });

  // No socio en clase (con costo personalizado si aplica)
  await prisma.participaciones_actividades.create({
    data: {
      persona_id: noSocio1.id,
      actividad_id: clasePiano.id,
      fecha_inicio: new Date('2024-03-15'),
      activo: true
    }
  });

  console.log('✅ Seed completado exitosamente!');
  console.log(`
📊 Catálogos creados/actualizados:
- ${await prisma.estados_actividades.count()} estados de actividades
- ${await prisma.tipos_actividades.count()} tipos de actividades
- ${await prisma.categorias_actividades.count()} categorías de actividades
- ${await prisma.dias_semana.count()} días de semana
- ${await prisma.roles_docentes.count()} roles de docentes
- ${await prisma.categoriaSocio.count()} categorías de socios

📊 Datos operacionales:
- ${await prisma.persona.count()} personas
- ${await prisma.actividades.count()} actividades
- ${await prisma.participaciones_actividades.count()} participaciones
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