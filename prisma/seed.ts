import { PrismaClient } from '@prisma/client';
import {
  TipoParentesco,
  TipoRecibo,
  EstadoRecibo,
  MedioPagoTipo,
  TipoContacto
} from '@prisma/client';

const prisma = new PrismaClient();

/**
 * ============================================================================
 * SIGESDA - SCRIPT DE SEEDING COMPLETO
 * ============================================================================
 * Este archivo inicializa la base de datos con:
 * A. Datos de catálogo y configuración (esenciales)
 * B. Datos de ejemplo transaccionales (demostración de relaciones)
 * ============================================================================
 */

async function main() {
  console.log('🚀 Iniciando seeding de base de datos...\n');

  // ============================================================================
  // PASO 0: LIMPIEZA DE DATOS EXISTENTES
  // ============================================================================
  console.log('🧹 Limpiando datos existentes...');

  // Orden inverso para respetar foreign keys
  await prisma.medioPago.deleteMany({});
  await prisma.cuota.deleteMany({});
  await prisma.recibo.deleteMany({});
  await prisma.participaciones_secciones.deleteMany({});
  await prisma.participacion_actividades.deleteMany({});
  await prisma.docentes_actividades.deleteMany({});
  await prisma.reservas_aulas_secciones.deleteMany({});
  await prisma.reserva_aulas.deleteMany({});
  await prisma.estadoReserva.deleteMany({});
  await prisma.horarios_secciones.deleteMany({});
  await prisma.horarios_actividades.deleteMany({});
  await prisma.secciones_actividades.deleteMany({});
  await prisma.actividades.deleteMany({});
  await prisma.comisionDirectiva.deleteMany({});
  await prisma.familiar.deleteMany({});
  await prisma.contactoPersona.deleteMany({});
  await prisma.personaTipo.deleteMany({});
  await prisma.persona.deleteMany({});
  await prisma.aulaEquipamiento.deleteMany({});
  await prisma.aula.deleteMany({});
  await prisma.configuracionSistema.deleteMany({});
  await prisma.razonSocial.deleteMany({});
  await prisma.especialidadDocente.deleteMany({});
  await prisma.tipoPersonaCatalogo.deleteMany({});
  await prisma.categoriaSocio.deleteMany({});
  await prisma.tipos_persona.deleteMany({});
  await prisma.equipamiento.deleteMany({});
  await prisma.estadoAula.deleteMany({});
  await prisma.tipoAula.deleteMany({});
  await prisma.roles_docentes.deleteMany({});
  await prisma.dias_semana.deleteMany({});
  await prisma.estados_actividades.deleteMany({});
  await prisma.categorias_actividades.deleteMany({});
  await prisma.tipos_actividades.deleteMany({});

  console.log('✅ Limpieza completada\n');

  // ============================================================================
  // NIVEL 0: CATÁLOGOS BASE (Sin dependencias)
  // ============================================================================

  console.log('📁 NIVEL 0: Insertando catálogos base...');

  // ========== tipos_actividades ==========
  console.log('  → tipos_actividades...');
  const tiposCreadosActividades = await prisma.tipos_actividades.createMany({
    data: [
      {
        codigo: 'CORO',
        nombre: 'Coro',
        descripcion: 'Actividades de coro musical',
        activo: true,
        orden: 1
      },
      {
        codigo: 'CLASE_INDIVIDUAL',
        nombre: 'Clase Individual',
        descripcion: 'Clases individuales de instrumento o canto',
        activo: true,
        orden: 2
      },
      {
        codigo: 'CLASE_GRUPAL',
        nombre: 'Clase Grupal',
        descripcion: 'Clases grupales de instrumento o canto',
        activo: true,
        orden: 3
      }
    ]
  });

  // ========== categorias_actividades ==========
  console.log('  → categorias_actividades...');
  await prisma.categorias_actividades.createMany({
    data: [
      {
        codigo: 'MUSICA',
        nombre: 'Música',
        descripcion: 'Actividades musicales',
        activo: true,
        orden: 1
      },
      {
        codigo: 'DANZA',
        nombre: 'Danza',
        descripcion: 'Actividades de danza y ballet',
        activo: true,
        orden: 2
      },
      {
        codigo: 'TEATRO',
        nombre: 'Teatro',
        descripcion: 'Actividades teatrales y expresión corporal',
        activo: true,
        orden: 3
      }
    ]
  });

  // ========== estados_actividades ==========
  console.log('  → estados_actividades...');
  await prisma.estados_actividades.createMany({
    data: [
      {
        codigo: 'PLANIFICADA',
        nombre: 'Planificada',
        descripcion: 'Actividad en etapa de planificación',
        activo: true,
        orden: 1
      },
      {
        codigo: 'ACTIVA',
        nombre: 'Activa',
        descripcion: 'Actividad en curso',
        activo: true,
        orden: 2
      },
      {
        codigo: 'SUSPENDIDA',
        nombre: 'Suspendida',
        descripcion: 'Actividad temporalmente suspendida',
        activo: true,
        orden: 3
      },
      {
        codigo: 'FINALIZADA',
        nombre: 'Finalizada',
        descripcion: 'Actividad finalizada',
        activo: true,
        orden: 4
      }
    ]
  });

  // ========== dias_semana ==========
  console.log('  → dias_semana...');
  await prisma.dias_semana.createMany({
    data: [
      { codigo: 'LUNES', nombre: 'Lunes', orden: 1 },
      { codigo: 'MARTES', nombre: 'Martes', orden: 2 },
      { codigo: 'MIERCOLES', nombre: 'Miércoles', orden: 3 },
      { codigo: 'JUEVES', nombre: 'Jueves', orden: 4 },
      { codigo: 'VIERNES', nombre: 'Viernes', orden: 5 },
      { codigo: 'SABADO', nombre: 'Sábado', orden: 6 },
      { codigo: 'DOMINGO', nombre: 'Domingo', orden: 7 }
    ]
  });

  // ========== roles_docentes ==========
  console.log('  → roles_docentes...');
  const rolesDocentes = await Promise.all([
    prisma.roles_docentes.create({
      data: {
        codigo: 'TITULAR',
        nombre: 'Titular',
        descripcion: 'Docente titular de la actividad',
        activo: true,
        orden: 1
      }
    }),
    prisma.roles_docentes.create({
      data: {
        codigo: 'AUXILIAR',
        nombre: 'Auxiliar',
        descripcion: 'Docente auxiliar o asistente',
        activo: true,
        orden: 2
      }
    }),
    prisma.roles_docentes.create({
      data: {
        codigo: 'COORDINADOR',
        nombre: 'Coordinador',
        descripcion: 'Coordinador de área o disciplina',
        activo: true,
        orden: 3
      }
    })
  ]);

  // ========== tipos_persona (LEGACY) ==========
  console.log('  → tipos_persona (legacy)...');
  await prisma.tipos_persona.createMany({
    data: [
      {
        codigo: 'SOCIO',
        nombre: 'Socio',
        descripcion: 'Socio del club',
        activo: true,
        orden: 1,
        requiresCategoria: true,
        requiresEspecialidad: false,
        requiresCuit: false
      },
      {
        codigo: 'DOCENTE',
        nombre: 'Docente',
        descripcion: 'Docente de actividades',
        activo: true,
        orden: 2,
        requiresCategoria: false,
        requiresEspecialidad: true,
        requiresCuit: false
      },
      {
        codigo: 'PROVEEDOR',
        nombre: 'Proveedor',
        descripcion: 'Proveedor de servicios',
        activo: true,
        orden: 3,
        requiresCategoria: false,
        requiresEspecialidad: false,
        requiresCuit: true
      }
    ]
  });

  // ========== CategoriaSocio ==========
  console.log('  → CategoriaSocio...');
  const categoriasSocio = await Promise.all([
    prisma.categoriaSocio.create({
      data: {
        codigo: 'GENERAL',
        nombre: 'General',
        descripcion: 'Categoría general de socio sin especificación',
        montoCuota: 0.00,
        descuento: 0.00,
        activa: true,
        orden: 0
      }
    }),
    prisma.categoriaSocio.create({
      data: {
        codigo: 'ACTIVO',
        nombre: 'Activo',
        descripcion: 'Socio activo con cuota completa',
        montoCuota: 5000.00,
        descuento: 0.00,
        activa: true,
        orden: 1
      }
    }),
    prisma.categoriaSocio.create({
      data: {
        codigo: 'JUBILADO',
        nombre: 'Jubilado',
        descripcion: 'Socio jubilado con descuento',
        montoCuota: 5000.00,
        descuento: 30.00,
        activa: true,
        orden: 2
      }
    }),
    prisma.categoriaSocio.create({
      data: {
        codigo: 'ESTUDIANTE',
        nombre: 'Estudiante',
        descripcion: 'Socio estudiante con descuento',
        montoCuota: 5000.00,
        descuento: 20.00,
        activa: true,
        orden: 3
      }
    }),
    prisma.categoriaSocio.create({
      data: {
        codigo: 'FAMILIAR',
        nombre: 'Familiar',
        descripcion: 'Familiar de socio activo',
        montoCuota: 5000.00,
        descuento: 50.00,
        activa: true,
        orden: 4
      }
    })
  ]);

  // ========== TipoAula ==========
  console.log('  → tipos_aulas...');
  const tiposAulas = await Promise.all([
    prisma.tipoAula.create({
      data: {
        codigo: 'TEORIA',
        nombre: 'Aula de Teoría',
        descripcion: 'Aula destinada a clases teóricas de música',
        activo: true,
        orden: 1
      }
    }),
    prisma.tipoAula.create({
      data: {
        codigo: 'PRACTICA',
        nombre: 'Aula de Práctica',
        descripcion: 'Aula destinada a práctica individual o grupal',
        activo: true,
        orden: 2
      }
    }),
    prisma.tipoAula.create({
      data: {
        codigo: 'ESTUDIO',
        nombre: 'Estudio de Grabación',
        descripcion: 'Estudio profesional de grabación y producción',
        activo: true,
        orden: 3
      }
    }),
    prisma.tipoAula.create({
      data: {
        codigo: 'ENSAYO',
        nombre: 'Sala de Ensayo',
        descripcion: 'Sala amplia para ensayos grupales y orquestales',
        activo: true,
        orden: 4
      }
    }),
    prisma.tipoAula.create({
      data: {
        codigo: 'AUDITORIO',
        nombre: 'Auditorio',
        descripcion: 'Auditorio para conciertos y presentaciones',
        activo: true,
        orden: 5
      }
    })
  ]);

  // ========== EstadoAula ==========
  console.log('  → estados_aulas...');
  const estadosAulas = await Promise.all([
    prisma.estadoAula.create({
      data: {
        codigo: 'DISPONIBLE',
        nombre: 'Disponible',
        descripcion: 'Aula disponible para uso',
        activo: true,
        orden: 1
      }
    }),
    prisma.estadoAula.create({
      data: {
        codigo: 'EN_MANTENIMIENTO',
        nombre: 'En Mantenimiento',
        descripcion: 'Aula temporalmente fuera de servicio por mantenimiento',
        activo: true,
        orden: 2
      }
    }),
    prisma.estadoAula.create({
      data: {
        codigo: 'CERRADA',
        nombre: 'Cerrada',
        descripcion: 'Aula cerrada permanentemente',
        activo: true,
        orden: 3
      }
    }),
    prisma.estadoAula.create({
      data: {
        codigo: 'RESERVADA',
        nombre: 'Reservada',
        descripcion: 'Aula con reserva permanente',
        activo: true,
        orden: 4
      }
    })
  ]);

  // ========== EstadoReserva ==========
  console.log('  → estados_reservas...');
  const estadosReservas = await Promise.all([
    prisma.estadoReserva.create({
      data: {
        codigo: 'PENDIENTE',
        nombre: 'Pendiente',
        descripcion: 'Reserva creada, esperando aprobación',
        activo: true,
        orden: 1
      }
    }),
    prisma.estadoReserva.create({
      data: {
        codigo: 'CONFIRMADA',
        nombre: 'Confirmada',
        descripcion: 'Reserva aprobada y activa',
        activo: true,
        orden: 2
      }
    }),
    prisma.estadoReserva.create({
      data: {
        codigo: 'COMPLETADA',
        nombre: 'Completada',
        descripcion: 'Reserva finalizada (fecha fin pasada)',
        activo: true,
        orden: 3
      }
    }),
    prisma.estadoReserva.create({
      data: {
        codigo: 'CANCELADA',
        nombre: 'Cancelada',
        descripcion: 'Reserva cancelada por usuario o administrador',
        activo: true,
        orden: 4
      }
    }),
    prisma.estadoReserva.create({
      data: {
        codigo: 'RECHAZADA',
        nombre: 'Rechazada',
        descripcion: 'Reserva no aprobada por administrador',
        activo: true,
        orden: 5
      }
    })
  ]);

  // ========== Categorías de Equipamiento ==========
  console.log('  → categorias_equipamiento...');
  const categoriasEquipamiento = await Promise.all([
    prisma.categoriasEquipamiento.create({
      data: {
        codigo: 'INST_MUS',
        nombre: 'Instrumentos Musicales',
        descripcion: 'Pianos, guitarras, violines y otros instrumentos musicales',
        activo: true,
        orden: 1
      }
    }),
    prisma.categoriasEquipamiento.create({
      data: {
        codigo: 'MOB',
        nombre: 'Mobiliario',
        descripcion: 'Sillas, escritorios, atriles, armarios y otros muebles',
        activo: true,
        orden: 2
      }
    }),
    prisma.categoriasEquipamiento.create({
      data: {
        codigo: 'TEC_AUDIO',
        nombre: 'Tecnología y Audio',
        descripcion: 'Sistemas de sonido, micrófonos, consolas, proyectores',
        activo: true,
        orden: 3
      }
    }),
    prisma.categoriasEquipamiento.create({
      data: {
        codigo: 'INFRAEST',
        nombre: 'Infraestructura',
        descripcion: 'Cabinas acústicas, tratamiento acústico, instalaciones fijas',
        activo: true,
        orden: 4
      }
    }),
    prisma.categoriasEquipamiento.create({
      data: {
        codigo: 'DIDACT',
        nombre: 'Material Didáctico',
        descripcion: 'Pizarras musicales, material educativo, recursos pedagógicos',
        activo: true,
        orden: 5
      }
    })
  ]);

  // ========== Estados de Equipamiento ==========
  console.log('  → estados_equipamientos...');
  const estadosEquipamiento = await Promise.all([
    prisma.estadoEquipamiento.create({
      data: {
        codigo: 'NUEVO',
        nombre: 'Nuevo',
        descripcion: 'Equipamiento nuevo sin uso',
        activo: true,
        orden: 1
      }
    }),
    prisma.estadoEquipamiento.create({
      data: {
        codigo: 'USADO',
        nombre: 'Usado',
        descripcion: 'Equipamiento en buen estado con uso normal',
        activo: true,
        orden: 2
      }
    }),
    prisma.estadoEquipamiento.create({
      data: {
        codigo: 'EN_REPARACION',
        nombre: 'En Reparación',
        descripcion: 'Equipamiento temporalmente fuera de servicio por mantenimiento',
        activo: true,
        orden: 3
      }
    }),
    prisma.estadoEquipamiento.create({
      data: {
        codigo: 'ROTO',
        nombre: 'Roto',
        descripcion: 'Equipamiento averiado, no funcional',
        activo: true,
        orden: 4
      }
    }),
    prisma.estadoEquipamiento.create({
      data: {
        codigo: 'DADO_DE_BAJA',
        nombre: 'Dado de Baja',
        descripcion: 'Equipamiento eliminado del inventario',
        activo: true,
        orden: 5
      }
    })
  ]);

  // ========== Equipamiento ==========
  console.log('  → equipamientos...');
  const equipamientos = await Promise.all([
    prisma.equipamiento.create({
      data: {
        codigo: 'INST-001',
        nombre: 'Piano de Cola',
        categoriaEquipamientoId: categoriasEquipamiento[0].id, // INST_MUS
        estadoEquipamientoId: estadosEquipamiento[1].id, // USADO
        cantidad: 2,
        descripcion: 'Piano de cola acústico profesional',
        observaciones: 'Requiere afinación periódica',
        activo: true
      }
    }),
    prisma.equipamiento.create({
      data: {
        codigo: 'INST-002',
        nombre: 'Piano Vertical',
        categoriaEquipamientoId: categoriasEquipamiento[0].id, // INST_MUS
        estadoEquipamientoId: estadosEquipamiento[1].id, // USADO
        cantidad: 3,
        descripcion: 'Piano vertical acústico',
        observaciones: 'Requiere afinación periódica',
        activo: true
      }
    }),
    prisma.equipamiento.create({
      data: {
        codigo: 'MOB-001',
        nombre: 'Sillas',
        categoriaEquipamientoId: categoriasEquipamiento[1].id, // MOB
        estadoEquipamientoId: estadosEquipamiento[1].id, // USADO
        cantidad: 100,
        descripcion: 'Sillas estándar para alumnos',
        activo: true
      }
    }),
    prisma.equipamiento.create({
      data: {
        codigo: 'MOB-002',
        nombre: 'Atriles',
        categoriaEquipamientoId: categoriasEquipamiento[1].id, // MOB
        estadoEquipamientoId: estadosEquipamiento[1].id, // USADO
        cantidad: 80,
        descripcion: 'Atriles de partituras',
        activo: true
      }
    }),
    prisma.equipamiento.create({
      data: {
        codigo: 'DIDA-001',
        nombre: 'Pizarra Musical',
        categoriaEquipamientoId: categoriasEquipamiento[4].id, // DIDACT
        estadoEquipamientoId: estadosEquipamiento[1].id, // USADO
        cantidad: 5,
        descripcion: 'Pizarra con pentagramas',
        activo: true
      }
    }),
    prisma.equipamiento.create({
      data: {
        codigo: 'TEC_-001',
        nombre: 'Sistema de Sonido',
        categoriaEquipamientoId: categoriasEquipamiento[2].id, // TEC_AUDIO
        estadoEquipamientoId: estadosEquipamiento[1].id, // USADO
        cantidad: 3,
        descripcion: 'Equipo de audio profesional con amplificadores y altavoces',
        activo: true
      }
    }),
    prisma.equipamiento.create({
      data: {
        codigo: 'TEC_-002',
        nombre: 'Proyector',
        categoriaEquipamientoId: categoriasEquipamiento[2].id, // TEC_AUDIO
        estadoEquipamientoId: estadosEquipamiento[1].id, // USADO
        cantidad: 4,
        descripcion: 'Proyector multimedia',
        activo: true
      }
    }),
    prisma.equipamiento.create({
      data: {
        codigo: 'TEC_-003',
        nombre: 'Consola de Grabación',
        categoriaEquipamientoId: categoriasEquipamiento[2].id, // TEC_AUDIO
        estadoEquipamientoId: estadosEquipamiento[0].id, // NUEVO
        cantidad: 1,
        descripcion: 'Consola digital de grabación multipista',
        activo: true
      }
    }),
    prisma.equipamiento.create({
      data: {
        codigo: 'TEC_-004',
        nombre: 'Micrófonos',
        categoriaEquipamientoId: categoriasEquipamiento[2].id, // TEC_AUDIO
        estadoEquipamientoId: estadosEquipamiento[1].id, // USADO
        cantidad: 15,
        descripcion: 'Set de micrófonos profesionales',
        observaciones: '2 unidades en reparación',
        activo: true
      }
    }),
    prisma.equipamiento.create({
      data: {
        codigo: 'INFR-001',
        nombre: 'Cabina Acústica',
        categoriaEquipamientoId: categoriasEquipamiento[3].id, // INFRAEST
        estadoEquipamientoId: estadosEquipamiento[1].id, // USADO
        cantidad: 2,
        descripcion: 'Cabina insonorizada para grabación',
        activo: true
      }
    }),
    prisma.equipamiento.create({
      data: {
        codigo: 'MOB-003',
        nombre: 'Escritorio',
        categoriaEquipamientoId: categoriasEquipamiento[1].id, // MOB
        estadoEquipamientoId: estadosEquipamiento[1].id, // USADO
        cantidad: 10,
        descripcion: 'Escritorio para docente',
        activo: true
      }
    }),
    prisma.equipamiento.create({
      data: {
        codigo: 'MOB-004',
        nombre: 'Armario',
        categoriaEquipamientoId: categoriasEquipamiento[1].id, // MOB
        estadoEquipamientoId: estadosEquipamiento[1].id, // USADO
        cantidad: 8,
        descripcion: 'Armario para almacenamiento de materiales',
        activo: true
      }
    })
  ]);

  console.log('✅ Catálogos base insertados\n');

  // ============================================================================
  // NIVEL 1: CATÁLOGOS V2 (Nueva Arquitectura)
  // ============================================================================

  console.log('📁 NIVEL 1: Insertando catálogos V2...');

  // ========== TipoPersonaCatalogo ==========
  console.log('  → TipoPersonaCatalogo...');
  const tiposPersonaCatalogo = await Promise.all([
    prisma.tipoPersonaCatalogo.create({
      data: {
        codigo: 'SOCIO',
        nombre: 'Socio',
        descripcion: 'Socio del club con derechos y obligaciones',
        activo: true,
        orden: 1,
        requiresCategoria: true,
        requiresEspecialidad: false,
        requiresCuit: false
      }
    }),
    prisma.tipoPersonaCatalogo.create({
      data: {
        codigo: 'NO_SOCIO',
        nombre: 'No Socio',
        descripcion: 'Persona sin membresía del club',
        activo: true,
        orden: 2,
        requiresCategoria: false,
        requiresEspecialidad: false,
        requiresCuit: false
      }
    }),
    prisma.tipoPersonaCatalogo.create({
      data: {
        codigo: 'DOCENTE',
        nombre: 'Docente',
        descripcion: 'Instructor de actividades',
        activo: true,
        orden: 3,
        requiresCategoria: false,
        requiresEspecialidad: true,
        requiresCuit: false
      }
    }),
    prisma.tipoPersonaCatalogo.create({
      data: {
        codigo: 'PROVEEDOR',
        nombre: 'Proveedor',
        descripcion: 'Proveedor de bienes o servicios',
        activo: true,
        orden: 4,
        requiresCategoria: false,
        requiresEspecialidad: false,
        requiresCuit: true
      }
    })
  ]);

  // ========== EspecialidadDocente ==========
  console.log('  → EspecialidadDocente...');
  const especialidades = await Promise.all([
    prisma.especialidadDocente.create({
      data: {
        codigo: 'GENERAL',
        nombre: 'General',
        descripcion: 'Especialidad general para docentes sin especialización específica',
        activo: true,
        orden: 0
      }
    }),
    prisma.especialidadDocente.create({
      data: {
        codigo: 'CANTO',
        nombre: 'Canto',
        descripcion: 'Técnica vocal y canto',
        activo: true,
        orden: 1
      }
    }),
    prisma.especialidadDocente.create({
      data: {
        codigo: 'PIANO',
        nombre: 'Piano',
        descripcion: 'Instrumento: Piano',
        activo: true,
        orden: 2
      }
    }),
    prisma.especialidadDocente.create({
      data: {
        codigo: 'GUITARRA',
        nombre: 'Guitarra',
        descripcion: 'Instrumento: Guitarra clásica y moderna',
        activo: true,
        orden: 3
      }
    }),
    prisma.especialidadDocente.create({
      data: {
        codigo: 'VIOLIN',
        nombre: 'Violín',
        descripcion: 'Instrumento: Violín',
        activo: true,
        orden: 4
      }
    })
  ]);

  // ========== RazonSocial ==========
  console.log('  → RazonSocial...');
  const razonesSociales = await Promise.all([
    prisma.razonSocial.create({
      data: {
        codigo: 'SA',
        nombre: 'S.A. (Sociedad Anónima)',
        descripcion: 'Sociedad Anónima',
        activo: true,
        orden: 1
      }
    }),
    prisma.razonSocial.create({
      data: {
        codigo: 'SRL',
        nombre: 'S.R.L. (Sociedad de Responsabilidad Limitada)',
        descripcion: 'Sociedad de Responsabilidad Limitada',
        activo: true,
        orden: 2
      }
    }),
    prisma.razonSocial.create({
      data: {
        codigo: 'SAS',
        nombre: 'S.A.S. (Sociedad por Acciones Simplificada)',
        descripcion: 'Sociedad por Acciones Simplificada',
        activo: true,
        orden: 3
      }
    }),
    prisma.razonSocial.create({
      data: {
        codigo: 'SCS',
        nombre: 'S.C.S. (Sociedad en Comandita Simple)',
        descripcion: 'Sociedad en Comandita Simple',
        activo: true,
        orden: 4
      }
    }),
    prisma.razonSocial.create({
      data: {
        codigo: 'SCPA',
        nombre: 'S.C.P.A. (Sociedad en Comandita por Acciones)',
        descripcion: 'Sociedad en Comandita por Acciones',
        activo: true,
        orden: 5
      }
    }),
    prisma.razonSocial.create({
      data: {
        codigo: 'SC',
        nombre: 'S.C. (Sociedad Colectiva)',
        descripcion: 'Sociedad Colectiva',
        activo: true,
        orden: 6
      }
    }),
    prisma.razonSocial.create({
      data: {
        codigo: 'MONOTRIBUTO',
        nombre: 'Monotributo',
        descripcion: 'Régimen Simplificado - Monotributo',
        activo: true,
        orden: 7
      }
    }),
    prisma.razonSocial.create({
      data: {
        codigo: 'AUTONOMO',
        nombre: 'Autónomo / Responsable Inscripto',
        descripcion: 'Trabajador autónomo o responsable inscripto en IVA',
        activo: true,
        orden: 8
      }
    }),
    prisma.razonSocial.create({
      data: {
        codigo: 'COOP',
        nombre: 'Cooperativa',
        descripcion: 'Cooperativa de trabajo o servicios',
        activo: true,
        orden: 9
      }
    }),
    prisma.razonSocial.create({
      data: {
        codigo: 'MUTUAL',
        nombre: 'Mutual',
        descripcion: 'Asociación Mutual',
        activo: true,
        orden: 10
      }
    }),
    prisma.razonSocial.create({
      data: {
        codigo: 'FUNDACION',
        nombre: 'Fundación',
        descripcion: 'Fundación sin fines de lucro',
        activo: true,
        orden: 11
      }
    }),
    prisma.razonSocial.create({
      data: {
        codigo: 'ASOCIACION_CIVIL',
        nombre: 'Asociación Civil',
        descripcion: 'Asociación Civil sin fines de lucro',
        activo: true,
        orden: 12
      }
    }),
    prisma.razonSocial.create({
      data: {
        codigo: 'UTE',
        nombre: 'U.T.E. (Unión Transitoria de Empresas)',
        descripcion: 'Unión Transitoria de Empresas',
        activo: true,
        orden: 13
      }
    }),
    prisma.razonSocial.create({
      data: {
        codigo: 'ACE',
        nombre: 'A.C.E. (Agrupación de Colaboración Empresaria)',
        descripcion: 'Agrupación de Colaboración Empresaria',
        activo: true,
        orden: 14
      }
    }),
    prisma.razonSocial.create({
      data: {
        codigo: 'CONSORCIO',
        nombre: 'Consorcio de Cooperación',
        descripcion: 'Consorcio de Cooperación Empresaria',
        activo: true,
        orden: 15
      }
    }),
    prisma.razonSocial.create({
      data: {
        codigo: 'OTRO',
        nombre: 'Otro',
        descripcion: 'Otra forma jurídica no especificada',
        activo: true,
        orden: 99
      }
    })
  ]);

  // ========== ConfiguracionSistema ==========
  console.log('  → ConfiguracionSistema...');
  await prisma.configuracionSistema.createMany({
    data: [
      {
        clave: 'nombre_club',
        valor: 'Club Social y Deportivo SIGESDA',
        descripcion: 'Nombre oficial del club',
        tipo: 'STRING'
      },
      {
        clave: 'direccion_club',
        valor: 'Av. Principal 1234, Ciudad',
        descripcion: 'Dirección física del club',
        tipo: 'STRING'
      },
      {
        clave: 'tasa_iva',
        valor: '21.00',
        descripcion: 'Tasa de IVA aplicable (%)',
        tipo: 'DECIMAL'
      },
      {
        clave: 'monto_min_cuota',
        valor: '2500.00',
        descripcion: 'Monto mínimo de cuota mensual',
        tipo: 'DECIMAL'
      },
      {
        clave: 'email_contacto',
        valor: 'contacto@sigesda.com',
        descripcion: 'Email de contacto oficial',
        tipo: 'STRING'
      },
      {
        clave: 'telefono_contacto',
        valor: '+54 11 1234-5678',
        descripcion: 'Teléfono de contacto',
        tipo: 'STRING'
      }
    ]
  });

  console.log('✅ Catálogos V2 insertados\n');

  // ============================================================================
  // NIVEL 2: MAESTROS (Aula, Persona)
  // ============================================================================

  console.log('📁 NIVEL 2: Insertando maestros...');

  // ========== Aula ==========
  console.log('  → Aula...');
  const aulas = await Promise.all([
    prisma.aula.create({
      data: {
        nombre: 'Sala Principal',
        capacidad: 50,
        ubicacion: 'Planta Baja',
        tipoAulaId: tiposAulas[3].id, // ENSAYO
        estadoAulaId: estadosAulas[0].id, // DISPONIBLE
        descripcion: 'Sala principal para ensayos orquestales y presentaciones',
        observaciones: 'Espacio amplio con buena acústica',
        activa: true
      }
    }),
    prisma.aula.create({
      data: {
        nombre: 'Aula 101',
        capacidad: 20,
        ubicacion: 'Primer Piso',
        tipoAulaId: tiposAulas[1].id, // PRACTICA
        estadoAulaId: estadosAulas[0].id, // DISPONIBLE
        descripcion: 'Aula de práctica para clases grupales',
        observaciones: 'Incluye piano vertical',
        activa: true
      }
    }),
    prisma.aula.create({
      data: {
        nombre: 'Estudio de Grabación',
        capacidad: 10,
        ubicacion: 'Sótano',
        tipoAulaId: tiposAulas[2].id, // ESTUDIO
        estadoAulaId: estadosAulas[0].id, // DISPONIBLE
        descripcion: 'Estudio profesional de grabación y producción musical',
        observaciones: 'Equipamiento de alta calidad para grabaciones profesionales',
        activa: true
      }
    })
  ]);

  // ========== AulaEquipamiento (relación many-to-many) ==========
  console.log('  → AulaEquipamiento (asignación de equipamiento a aulas)...');

  // Sala Principal: Piano de Cola (1), Sistema de Sonido (1), Proyector (1), Sillas (50), Atriles (40)
  await prisma.aulaEquipamiento.createMany({
    data: [
      { aulaId: aulas[0].id, equipamientoId: equipamientos[0].id, cantidad: 1, observaciones: 'Piano de cola Yamaha' }, // Piano de Cola
      { aulaId: aulas[0].id, equipamientoId: equipamientos[5].id, cantidad: 1, observaciones: 'Sistema profesional' }, // Sistema de Sonido
      { aulaId: aulas[0].id, equipamientoId: equipamientos[6].id, cantidad: 1 }, // Proyector
      { aulaId: aulas[0].id, equipamientoId: equipamientos[2].id, cantidad: 50 }, // Sillas
      { aulaId: aulas[0].id, equipamientoId: equipamientos[3].id, cantidad: 40 } // Atriles
    ]
  });

  // Aula 101: Piano Vertical (1), Pizarra Musical (1), Sillas (20), Atriles (15), Escritorio (1)
  await prisma.aulaEquipamiento.createMany({
    data: [
      { aulaId: aulas[1].id, equipamientoId: equipamientos[1].id, cantidad: 1 }, // Piano Vertical
      { aulaId: aulas[1].id, equipamientoId: equipamientos[4].id, cantidad: 1 }, // Pizarra Musical
      { aulaId: aulas[1].id, equipamientoId: equipamientos[2].id, cantidad: 20 }, // Sillas
      { aulaId: aulas[1].id, equipamientoId: equipamientos[3].id, cantidad: 15 }, // Atriles
      { aulaId: aulas[1].id, equipamientoId: equipamientos[10].id, cantidad: 1 } // Escritorio
    ]
  });

  // Estudio de Grabación: Cabina Acústica (1), Consola (1), Micrófonos (8), Sillas (10)
  await prisma.aulaEquipamiento.createMany({
    data: [
      { aulaId: aulas[2].id, equipamientoId: equipamientos[9].id, cantidad: 1 }, // Cabina Acústica
      { aulaId: aulas[2].id, equipamientoId: equipamientos[7].id, cantidad: 1 }, // Consola de Grabación
      { aulaId: aulas[2].id, equipamientoId: equipamientos[8].id, cantidad: 8, observaciones: 'Incluye condensadores y dinámicos' }, // Micrófonos
      { aulaId: aulas[2].id, equipamientoId: equipamientos[2].id, cantidad: 10 }, // Sillas
      { aulaId: aulas[2].id, equipamientoId: equipamientos[11].id, cantidad: 2 } // Armarios
    ]
  });

  // ========== Persona ==========
  console.log('  → Persona...');

  /**
   * IMPORTANTE: En esta V2, los roles se asignan mediante PersonaTipo (tabla intermedia)
   * El campo "tipo" en Persona es legacy y puede ser null.
   * Crearemos personas base y luego les asignaremos tipos mediante PersonaTipo.
   */

  // 3 DOCENTES PUROS
  const docente1 = await prisma.persona.create({
    data: {
      nombre: 'María Eugenia',
      apellido: 'Fernández',
      dni: '28123456',
      email: 'maria.fernandez@sigesda.com',
      telefono: '11-5555-1001',
      direccion: 'Calle Falsa 123',
      fechaNacimiento: new Date('1985-03-15')
    }
  });

  const docente2 = await prisma.persona.create({
    data: {
      nombre: 'Carlos Alberto',
      apellido: 'Gómez',
      dni: '25987654',
      email: 'carlos.gomez@sigesda.com',
      telefono: '11-5555-1002',
      direccion: 'Av. Siempre Viva 742',
      fechaNacimiento: new Date('1982-07-22')
    }
  });

  const docente3 = await prisma.persona.create({
    data: {
      nombre: 'Laura Beatriz',
      apellido: 'Martínez',
      dni: '30456789',
      email: 'laura.martinez@sigesda.com',
      telefono: '11-5555-1003',
      direccion: 'Pasaje Los Músicos 456',
      fechaNacimiento: new Date('1988-11-30')
    }
  });

  // 4 SOCIOS PUROS
  const socio1 = await prisma.persona.create({
    data: {
      nombre: 'Juan Pablo',
      apellido: 'Rodríguez',
      dni: '32111222',
      email: 'juan.rodriguez@gmail.com',
      telefono: '11-6666-2001',
      direccion: 'Calle del Sol 789',
      fechaNacimiento: new Date('1990-05-10')
    }
  });

  const socio2 = await prisma.persona.create({
    data: {
      nombre: 'Ana María',
      apellido: 'López',
      dni: '35222333',
      email: 'ana.lopez@gmail.com',
      telefono: '11-6666-2002',
      direccion: 'Av. Libertad 321',
      fechaNacimiento: new Date('1992-08-18')
    }
  });

  const socio3 = await prisma.persona.create({
    data: {
      nombre: 'Roberto Carlos',
      apellido: 'Pérez',
      dni: '40333444',
      email: 'roberto.perez@gmail.com',
      telefono: '11-6666-2003',
      direccion: 'Calle La Paz 654',
      fechaNacimiento: new Date('1995-12-05')
    }
  });

  const socio4 = await prisma.persona.create({
    data: {
      nombre: 'Gabriela Susana',
      apellido: 'González',
      dni: '38444555',
      email: 'gabriela.gonzalez@gmail.com',
      telefono: '11-6666-2004',
      direccion: 'Pasaje Esperanza 987',
      fechaNacimiento: new Date('1994-02-20')
    }
  });

  // 1 SOCIO + DOCENTE (Roles múltiples)
  const socioDocente = await prisma.persona.create({
    data: {
      nombre: 'Fernando José',
      apellido: 'Silva',
      dni: '33555666',
      email: 'fernando.silva@sigesda.com',
      telefono: '11-7777-3001',
      direccion: 'Av. del Maestro 159',
      fechaNacimiento: new Date('1987-09-12')
    }
  });

  // 1 PROVEEDOR
  const proveedor1 = await prisma.persona.create({
    data: {
      nombre: 'Ricardo Daniel',
      apellido: 'Méndez',
      dni: '27666777',
      email: 'ricardo.mendez@instrumentos.com',
      telefono: '11-8888-4001',
      direccion: 'Calle Comercio 753',
      fechaNacimiento: new Date('1980-04-25')
    }
  });

  // 1 FAMILIAR (hijo de socio1)
  const familiar1 = await prisma.persona.create({
    data: {
      nombre: 'Matías Emiliano',
      apellido: 'Rodríguez',
      dni: '45777888',
      email: 'matias.rodriguez@gmail.com',
      telefono: '11-6666-2001', // mismo teléfono que el padre
      direccion: 'Calle del Sol 789', // misma dirección
      fechaNacimiento: new Date('2010-03-15')
    }
  });

  console.log('✅ Maestros insertados\n');

  // ============================================================================
  // NIVEL 3: RELACIONES PERSONA (PersonaTipo, ContactoPersona, Familiar)
  // ============================================================================

  console.log('📁 NIVEL 3: Insertando relaciones de persona...');

  // ========== PersonaTipo ==========
  console.log('  → PersonaTipo (Asignación de roles)...');

  /**
   * VALIDACIÓN IMPORTANTE: SOCIO y NO_SOCIO son MUTUAMENTE EXCLUYENTES
   * Una persona NO puede tener ambos tipos simultáneamente.
   *
   * Casos demostrados:
   * 1. Docentes puros (3) → DOCENTE (implica NO_SOCIO implícitamente)
   * 2. Socios puros (4) → SOCIO
   * 3. Socio + Docente (1) → SOCIO + DOCENTE (válido, no es NO_SOCIO)
   * 4. Proveedor (1) → PROVEEDOR (implica NO_SOCIO)
   */

  // DOCENTE 1: María Fernández (DOCENTE puro - especialidad CANTO)
  await prisma.personaTipo.create({
    data: {
      personaId: docente1.id,
      tipoPersonaId: tiposPersonaCatalogo[2].id, // DOCENTE
      activo: true,
      especialidadId: especialidades[0].id, // CANTO
      honorariosPorHora: 3500.00
    }
  });

  // DOCENTE 2: Carlos Gómez (DOCENTE puro - especialidad PIANO)
  await prisma.personaTipo.create({
    data: {
      personaId: docente2.id,
      tipoPersonaId: tiposPersonaCatalogo[2].id, // DOCENTE
      activo: true,
      especialidadId: especialidades[1].id, // PIANO
      honorariosPorHora: 4000.00
    }
  });

  // DOCENTE 3: Laura Martínez (DOCENTE puro - especialidad GUITARRA)
  await prisma.personaTipo.create({
    data: {
      personaId: docente3.id,
      tipoPersonaId: tiposPersonaCatalogo[2].id, // DOCENTE
      activo: true,
      especialidadId: especialidades[2].id, // GUITARRA
      honorariosPorHora: 3800.00
    }
  });

  // SOCIO 1: Juan Rodríguez (SOCIO - categoría ACTIVO)
  await prisma.personaTipo.create({
    data: {
      personaId: socio1.id,
      tipoPersonaId: tiposPersonaCatalogo[0].id, // SOCIO
      activo: true,
      categoriaId: categoriasSocio[0].id, // ACTIVO
      numeroSocio: 1001,
      fechaIngreso: new Date('2020-01-15')
    }
  });

  // SOCIO 2: Ana López (SOCIO - categoría ESTUDIANTE)
  await prisma.personaTipo.create({
    data: {
      personaId: socio2.id,
      tipoPersonaId: tiposPersonaCatalogo[0].id, // SOCIO
      activo: true,
      categoriaId: categoriasSocio[2].id, // ESTUDIANTE
      numeroSocio: 1002,
      fechaIngreso: new Date('2021-03-20')
    }
  });

  // SOCIO 3: Roberto Pérez (SOCIO - categoría ACTIVO)
  await prisma.personaTipo.create({
    data: {
      personaId: socio3.id,
      tipoPersonaId: tiposPersonaCatalogo[0].id, // SOCIO
      activo: true,
      categoriaId: categoriasSocio[0].id, // ACTIVO
      numeroSocio: 1003,
      fechaIngreso: new Date('2019-06-10')
    }
  });

  // SOCIO 4: Gabriela González (SOCIO - categoría JUBILADO)
  await prisma.personaTipo.create({
    data: {
      personaId: socio4.id,
      tipoPersonaId: tiposPersonaCatalogo[0].id, // SOCIO
      activo: true,
      categoriaId: categoriasSocio[1].id, // JUBILADO
      numeroSocio: 1004,
      fechaIngreso: new Date('2018-11-05')
    }
  });

  // SOCIO + DOCENTE: Fernando Silva (MÚLTIPLES ROLES)
  // Rol 1: SOCIO
  await prisma.personaTipo.create({
    data: {
      personaId: socioDocente.id,
      tipoPersonaId: tiposPersonaCatalogo[0].id, // SOCIO
      activo: true,
      categoriaId: categoriasSocio[0].id, // ACTIVO
      numeroSocio: 1005,
      fechaIngreso: new Date('2015-08-22')
    }
  });
  // Rol 2: DOCENTE
  await prisma.personaTipo.create({
    data: {
      personaId: socioDocente.id,
      tipoPersonaId: tiposPersonaCatalogo[2].id, // DOCENTE
      activo: true,
      especialidadId: especialidades[3].id, // VIOLIN
      honorariosPorHora: 4200.00
    }
  });

  // PROVEEDOR: Ricardo Méndez (PROVEEDOR puro)
  await prisma.personaTipo.create({
    data: {
      personaId: proveedor1.id,
      tipoPersonaId: tiposPersonaCatalogo[3].id, // PROVEEDOR
      activo: true,
      cuit: '20276667773',
      razonSocialId: razonesSociales[1].id // S.R.L.
    }
  });

  // FAMILIAR: Matías Rodríguez (SOCIO - categoría FAMILIAR)
  await prisma.personaTipo.create({
    data: {
      personaId: familiar1.id,
      tipoPersonaId: tiposPersonaCatalogo[0].id, // SOCIO
      activo: true,
      categoriaId: categoriasSocio[3].id, // FAMILIAR
      numeroSocio: 1006,
      fechaIngreso: new Date('2022-05-10')
    }
  });

  // ========== ContactoPersona ==========
  console.log('  → ContactoPersona (Múltiples contactos por persona)...');

  // Contactos para María Fernández (docente1)
  await prisma.contactoPersona.createMany({
    data: [
      {
        personaId: docente1.id,
        tipoContacto: TipoContacto.EMAIL,
        valor: 'maria.fernandez@sigesda.com',
        principal: true,
        activo: true
      },
      {
        personaId: docente1.id,
        tipoContacto: TipoContacto.CELULAR,
        valor: '+54 9 11 5555-1001',
        principal: false,
        activo: true
      },
      {
        personaId: docente1.id,
        tipoContacto: TipoContacto.WHATSAPP,
        valor: '+54 9 11 5555-1001',
        principal: false,
        activo: true
      }
    ]
  });

  // Contactos para Juan Rodríguez (socio1)
  await prisma.contactoPersona.createMany({
    data: [
      {
        personaId: socio1.id,
        tipoContacto: TipoContacto.EMAIL,
        valor: 'juan.rodriguez@gmail.com',
        principal: true,
        activo: true
      },
      {
        personaId: socio1.id,
        tipoContacto: TipoContacto.CELULAR,
        valor: '+54 9 11 6666-2001',
        principal: false,
        activo: true
      },
      {
        personaId: socio1.id,
        tipoContacto: TipoContacto.TELEFONO,
        valor: '11-4444-5678',
        principal: false,
        activo: true,
        observaciones: 'Teléfono laboral'
      }
    ]
  });

  // ========== Familiar (Relaciones familiares) ==========
  console.log('  → Familiar (Relaciones bidireccionales)...');

  /**
   * Demostración de relación familiar:
   * - Juan Rodríguez (socio1) es PADRE de Matías Rodríguez (familiar1)
   * - La relación bidireccional se debe crear en ambos sentidos
   */

  // Juan → Matías (HIJO)
  await prisma.familiar.create({
    data: {
      socioId: socio1.id,
      familiarId: familiar1.id,
      parentesco: TipoParentesco.HIJO,
      descripcion: 'Hijo menor de edad',
      permisoResponsableFinanciero: true,
      permisoContactoEmergencia: true,
      permisoAutorizadoRetiro: true,
      descuento: 50.00,
      activo: true
    }
  });

  // Matías → Juan (PADRE) - Relación bidireccional
  await prisma.familiar.create({
    data: {
      socioId: familiar1.id,
      familiarId: socio1.id,
      parentesco: TipoParentesco.PADRE,
      descripcion: 'Padre responsable',
      permisoResponsableFinanciero: false,
      permisoContactoEmergencia: true,
      permisoAutorizadoRetiro: false,
      activo: true
    }
  });

  console.log('✅ Relaciones de persona insertadas\n');

  // ============================================================================
  // NIVEL 4: ACTIVIDADES
  // ============================================================================

  console.log('📁 NIVEL 4: Insertando actividades...');

  // ========== actividades ==========
  console.log('  → actividades...');

  // Obtener tipos, categorías y estados de actividades
  const tiposCatalogoActividades = await prisma.tipos_actividades.findMany();
  const categoriasCatalogoActividades = await prisma.categorias_actividades.findMany();
  const estadosCatalogoActividades = await prisma.estados_actividades.findMany();

  const tipoCoro = tiposCatalogoActividades.find(t => t.codigo === 'CORO')!;
  const tipoClaseIndividual = tiposCatalogoActividades.find(t => t.codigo === 'CLASE_INDIVIDUAL')!;
  const categoriaMusica = categoriasCatalogoActividades.find(c => c.codigo === 'MUSICA')!;
  const estadoActiva = estadosCatalogoActividades.find(e => e.codigo === 'ACTIVA')!;

  const actividadCoro = await prisma.actividades.create({
    data: {
      codigoActividad: 'CORO-2025-01',
      nombre: 'Coro Municipal',
      tipoActividadId: tipoCoro.id,
      categoriaId: categoriaMusica.id,
      estadoId: estadoActiva.id,
      descripcion: 'Coro de voces mixtas para adultos',
      fechaDesde: new Date('2025-01-01'),
      fechaHasta: new Date('2025-12-31'),
      costo: 2000.00,
      capacidadMaxima: 30,
      activa: true
    }
  });

  const actividadPiano = await prisma.actividades.create({
    data: {
      codigoActividad: 'PIANO-IND-2025-01',
      nombre: 'Clase de Piano Individual',
      tipoActividadId: tipoClaseIndividual.id,
      categoriaId: categoriaMusica.id,
      estadoId: estadoActiva.id,
      descripcion: 'Clases personalizadas de piano nivel inicial a avanzado',
      fechaDesde: new Date('2025-01-01'),
      fechaHasta: new Date('2025-12-31'),
      costo: 3500.00,
      capacidadMaxima: 1,
      activa: true
    }
  });

  // ========== secciones_actividades ==========
  console.log('  → secciones_actividades...');

  const seccionCoro = await prisma.secciones_actividades.create({
    data: {
      actividadId: actividadCoro.id,
      nombre: 'Sección A',
      codigo: 'CORO-A-2025',
      capacidadMaxima: 30,
      activa: true,
      observaciones: 'Sección principal del coro',
      updatedAt: new Date()
    }
  });

  const seccionPiano = await prisma.secciones_actividades.create({
    data: {
      actividadId: actividadPiano.id,
      nombre: 'Sección Individual',
      codigo: 'PIANO-IND-2025',
      capacidadMaxima: 1,
      activa: true,
      observaciones: 'Clases individuales de piano',
      updatedAt: new Date()
    }
  });

  console.log('✅ Actividades insertadas\n');

  // ============================================================================
  // NIVEL 5: HORARIOS Y AULAS
  // ============================================================================

  console.log('📁 NIVEL 5: Insertando horarios y reservas de aulas...');

  // ========== horarios_secciones ==========
  console.log('  → horarios_secciones...');

  // Horarios Coro: Lunes y Miércoles 18:00-20:00
  await prisma.horarios_secciones.createMany({
    data: [
      {
        seccionId: seccionCoro.id,
        diaSemana: 'LUNES',
        horaInicio: '18:00',
        horaFin: '20:00',
        activo: true,
        updatedAt: new Date()
      },
      {
        seccionId: seccionCoro.id,
        diaSemana: 'MIERCOLES',
        horaInicio: '18:00',
        horaFin: '20:00',
        activo: true,
        updatedAt: new Date()
      }
    ]
  });

  // Horarios Piano: Martes 15:00-16:00
  await prisma.horarios_secciones.create({
    data: {
      seccionId: seccionPiano.id,
      diaSemana: 'MARTES',
      horaInicio: '15:00',
      horaFin: '16:00',
      activo: true,
      updatedAt: new Date()
    }
  });

  // ========== reservas_aulas_secciones ==========
  console.log('  → reservas_aulas_secciones...');

  // Coro → Sala Principal (Lunes y Miércoles)
  await prisma.reservas_aulas_secciones.createMany({
    data: [
      {
        seccionId: seccionCoro.id,
        aulaId: aulas[0].id, // Sala Principal
        diaSemana: 'LUNES',
        horaInicio: '18:00',
        horaFin: '20:00',
        fechaVigencia: new Date('2025-01-01'),
        observaciones: 'Reserva permanente para coro',
        updatedAt: new Date()
      },
      {
        seccionId: seccionCoro.id,
        aulaId: aulas[0].id, // Sala Principal
        diaSemana: 'MIERCOLES',
        horaInicio: '18:00',
        horaFin: '20:00',
        fechaVigencia: new Date('2025-01-01'),
        observaciones: 'Reserva permanente para coro',
        updatedAt: new Date()
      }
    ]
  });

  // Piano → Aula 101 (Martes)
  await prisma.reservas_aulas_secciones.create({
    data: {
      seccionId: seccionPiano.id,
      aulaId: aulas[1].id, // Aula 101
      diaSemana: 'MARTES',
      horaInicio: '15:00',
      horaFin: '16:00',
      fechaVigencia: new Date('2025-01-01'),
      observaciones: 'Aula con piano vertical',
      updatedAt: new Date()
    }
  });

  console.log('✅ Horarios y aulas insertadas\n');

  // ============================================================================
  // NIVEL 6: PARTICIPACIÓN Y DOCENTES
  // ============================================================================

  console.log('📁 NIVEL 6: Insertando participación y asignación de docentes...');

  // ========== docentes_actividades ==========
  console.log('  → docentes_actividades...');

  // María Fernández (CANTO) → Coro (TITULAR)
  await prisma.docentes_actividades.create({
    data: {
      actividadId: actividadCoro.id,
      docenteId: docente1.id,
      rolDocenteId: rolesDocentes[0].id, // TITULAR
      fechaAsignacion: new Date('2025-01-01'),
      activo: true,
      observaciones: 'Directora del coro'
    }
  });

  // Carlos Gómez (PIANO) → Piano (TITULAR)
  await prisma.docentes_actividades.create({
    data: {
      actividadId: actividadPiano.id,
      docenteId: docente2.id,
      rolDocenteId: rolesDocentes[0].id, // TITULAR
      fechaAsignacion: new Date('2025-01-01'),
      activo: true,
      observaciones: 'Profesor de piano individual'
    }
  });

  // Fernando Silva (SOCIO + DOCENTE VIOLIN) → Auxiliar en Coro
  await prisma.docentes_actividades.create({
    data: {
      actividadId: actividadCoro.id,
      docenteId: socioDocente.id,
      rolDocenteId: rolesDocentes[1].id, // AUXILIAR
      fechaAsignacion: new Date('2025-02-01'),
      activo: true,
      observaciones: 'Asistente de dirección coral'
    }
  });

  // ========== participaciones_secciones ==========
  console.log('  → participaciones_secciones...');

  /**
   * VALIDACIÓN DE CUPO:
   * - Coro tiene capacidadMaxima: 30
   * - Vamos a inscribir 3 socios
   */

  // Juan Rodríguez → Coro
  await prisma.participaciones_secciones.create({
    data: {
      personaId: socio1.id,
      seccionId: seccionCoro.id,
      fechaInicio: new Date('2025-01-15'),
      activa: true,
      observaciones: 'Voz: Tenor',
      updatedAt: new Date()
    }
  });

  // Ana López → Coro
  await prisma.participaciones_secciones.create({
    data: {
      personaId: socio2.id,
      seccionId: seccionCoro.id,
      fechaInicio: new Date('2025-01-20'),
      activa: true,
      observaciones: 'Voz: Soprano',
      updatedAt: new Date()
    }
  });

  // Roberto Pérez → Coro
  await prisma.participaciones_secciones.create({
    data: {
      personaId: socio3.id,
      seccionId: seccionCoro.id,
      fechaInicio: new Date('2025-01-22'),
      activa: true,
      observaciones: 'Voz: Barítono',
      updatedAt: new Date()
    }
  });

  // Gabriela González → Piano (con precio especial)
  await prisma.participaciones_secciones.create({
    data: {
      personaId: socio4.id,
      seccionId: seccionPiano.id,
      fechaInicio: new Date('2025-02-01'),
      precioEspecial: 3000.00, // precio especial por jubilada
      activa: true,
      observaciones: 'Descuento jubilado aplicado',
      updatedAt: new Date()
    }
  });

  console.log('✅ Participación y docentes insertados\n');

  // ============================================================================
  // NIVEL 7: PAGOS (Recibo, Cuota, MedioPago)
  // ============================================================================

  console.log('📁 NIVEL 7: Insertando pagos...');

  // ========== Recibo + Cuota ==========
  console.log('  → Recibo + Cuota...');

  const mesActual = new Date().getMonth() + 1;
  const anioActual = new Date().getFullYear();

  // Recibo para Juan Rodríguez (categoría ACTIVO)
  const recibo1 = await prisma.recibo.create({
    data: {
      numero: `CUOTA-${anioActual}-${mesActual.toString().padStart(2, '0')}-1001`,
      tipo: TipoRecibo.CUOTA,
      importe: 5000.00,
      fecha: new Date(),
      fechaVencimiento: new Date(anioActual, mesActual - 1, 10), // día 10 del mes actual
      estado: EstadoRecibo.PAGADO,
      concepto: `Cuota mensual ${mesActual}/${anioActual} - Categoría ACTIVO`,
      observaciones: 'Pago en término',
      receptorId: socio1.id
    }
  });

  // Cuota asociada al recibo
  await prisma.cuota.create({
    data: {
      reciboId: recibo1.id,
      mes: mesActual,
      anio: anioActual,
      montoBase: 5000.00,
      montoActividades: 0.00,
      montoTotal: 5000.00,
      categoriaId: categoriasSocio[0].id // ACTIVO
    }
  });

  // ========== MedioPago ==========
  console.log('  → MedioPago...');

  await prisma.medioPago.create({
    data: {
      reciboId: recibo1.id,
      tipo: MedioPagoTipo.EFECTIVO,
      importe: 5000.00,
      fecha: new Date(),
      observaciones: 'Pago en efectivo en secretaría'
    }
  });

  // Recibo pendiente para Ana López (ESTUDIANTE)
  const recibo2 = await prisma.recibo.create({
    data: {
      numero: `CUOTA-${anioActual}-${mesActual.toString().padStart(2, '0')}-1002`,
      tipo: TipoRecibo.CUOTA,
      importe: 4000.00, // 5000 - 20% descuento estudiante
      fecha: new Date(),
      fechaVencimiento: new Date(anioActual, mesActual - 1, 10),
      estado: EstadoRecibo.PENDIENTE,
      concepto: `Cuota mensual ${mesActual}/${anioActual} - Categoría ESTUDIANTE`,
      observaciones: 'Pendiente de pago',
      receptorId: socio2.id
    }
  });

  await prisma.cuota.create({
    data: {
      reciboId: recibo2.id,
      mes: mesActual,
      anio: anioActual,
      montoBase: 5000.00,
      montoActividades: 0.00,
      montoTotal: 4000.00, // con descuento
      categoriaId: categoriasSocio[2].id // ESTUDIANTE
    }
  });

  console.log('✅ Pagos insertados\n');

  // ============================================================================
  // RESUMEN FINAL
  // ============================================================================

  console.log('\n' + '='.repeat(80));
  console.log('✅ SEEDING COMPLETADO EXITOSAMENTE');
  console.log('='.repeat(80));
  console.log('\n📊 RESUMEN DE DATOS INSERTADOS:\n');

  console.log('📁 CATÁLOGOS:');
  console.log('  ✓ tipos_actividades: 3');
  console.log('  ✓ categorias_actividades: 3');
  console.log('  ✓ estados_actividades: 4');
  console.log('  ✓ dias_semana: 7');
  console.log('  ✓ roles_docentes: 3');
  console.log('  ✓ tipos_persona: 3 (legacy)');
  console.log('  ✓ CategoriaSocio: 5');
  console.log('  ✓ TipoPersonaCatalogo: 4');
  console.log('  ✓ EspecialidadDocente: 5');
  console.log('  ✓ RazonSocial: 16');
  console.log('  ✓ ConfiguracionSistema: 6\n');

  console.log('👥 PERSONAS:');
  console.log('  ✓ Docentes puros: 3');
  console.log('  ✓ Socios puros: 4');
  console.log('  ✓ Socio + Docente: 1');
  console.log('  ✓ Proveedor: 1');
  console.log('  ✓ Familiar: 1');
  console.log('  ✓ Total personas: 10\n');

  console.log('🔗 RELACIONES:');
  console.log('  ✓ PersonaTipo: 10 asignaciones de roles');
  console.log('  ✓ ContactoPersona: 6 contactos');
  console.log('  ✓ Familiar: 2 relaciones bidireccionales\n');

  console.log('🎭 ACTIVIDADES:');
  console.log('  ✓ Actividades: 2');
  console.log('  ✓ Secciones: 2');
  console.log('  ✓ Horarios: 3');
  console.log('  ✓ Aulas: 3');
  console.log('  ✓ Reservas de aulas: 3\n');

  console.log('👨‍🏫 PARTICIPACIÓN:');
  console.log('  ✓ Docentes asignados: 3');
  console.log('  ✓ Participaciones en secciones: 4\n');

  console.log('💰 PAGOS:');
  console.log('  ✓ Recibos: 2');
  console.log('  ✓ Cuotas: 2');
  console.log('  ✓ Medios de pago: 1\n');

  console.log('='.repeat(80));
  console.log('🎉 Base de datos lista para usar');
  console.log('='.repeat(80) + '\n');

  // ============================================================================
  // VALIDACIONES DEMOSTRADAS
  // ============================================================================

  console.log('✅ VALIDACIONES DEMOSTRADAS:\n');
  console.log('  1. ✓ Exclusión mutua SOCIO vs NO_SOCIO');
  console.log('  2. ✓ Múltiples roles por persona (Socio + Docente)');
  console.log('  3. ✓ Múltiples contactos por persona con principal');
  console.log('  4. ✓ Relaciones familiares bidireccionales');
  console.log('  5. ✓ Validación de capacidad en actividades');
  console.log('  6. ✓ Precio especial vs precio base en participaciones');
  console.log('  7. ✓ Docentes con múltiples roles en actividades');
  console.log('  8. ✓ Secciones con horarios y aulas asignadas');
  console.log('  9. ✓ Estados de recibo (PAGADO, PENDIENTE)');
  console.log('  10. ✓ Categorías de socio con descuentos\n');
}

// ============================================================================
// EJECUCIÓN
// ============================================================================

main()
  .catch((e) => {
    console.error('\n❌ ERROR EN SEEDING:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
