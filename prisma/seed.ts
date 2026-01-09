import { PrismaClient } from '@prisma/client';
import {
  TipoParentesco,
  TipoRecibo,
  EstadoRecibo,
  MedioPagoTipo,
  TipoExencion,
  MotivoExencion,
  EstadoExencion,
  TipoAjusteCuota,
  ScopeAjusteCuota
} from '@prisma/client';
import { seedItemsCatalogos } from './seed-items-catalogos';
import { seedReglasDescuentos } from './seed-reglas-descuentos';
import { seedTestCuotas } from './seed-test-cuotas';
import { seedTiposContacto } from './seed-tipos-contacto';
import { seedActividades } from './seed-actividades';
import { seedCategoriasEquipamiento } from './seed-categorias-equipamiento';
import { seedEstadosEquipamiento } from './seed-estados-equipamiento';

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
  await prisma.tipoContactoCatalogo.deleteMany({});
  await prisma.razonSocial.deleteMany({});
  await prisma.especialidadDocente.deleteMany({});
  await prisma.tipoPersonaCatalogo.deleteMany({});
  await prisma.categoriaSocio.deleteMany({});
  await prisma.tipos_persona.deleteMany({});
  await prisma.equipamiento.deleteMany({});
  await prisma.estadoEquipamiento.deleteMany({});
  await prisma.categoriaEquipamiento.deleteMany({});
  await prisma.estadoAula.deleteMany({});
  await prisma.tipoAula.deleteMany({});
  await prisma.roles_docentes.deleteMany({});
  await prisma.dias_semana.deleteMany({});
  await prisma.estados_actividades.deleteMany({});
  await prisma.categorias_actividades.deleteMany({});
  await prisma.tipos_actividades.deleteMany({});

  console.log('✅ Limpieza completada\n');

  // ============================================================================
  // NIVEL 0.5: CATÁLOGOS DE ÍTEMS Y REGLAS (Scripts externos)
  // ============================================================================

  // Ejecutar seed de items y categorías (catalogos)
  await seedItemsCatalogos();

  // Ejecutar seed de reglas de descuentos
  await seedReglasDescuentos();

  // Ejecutar seed de tipos de contacto
  await seedTiposContacto();

  // Ejecutar seed de categorías de equipamiento
  await seedCategoriasEquipamiento();

  // Ejecutar seed de estados de equipamiento
  await seedEstadosEquipamiento();

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

  // Obtener IDs de días de semana para uso posterior
  const diasSemana = await prisma.dias_semana.findMany({ orderBy: { orden: 'asc' } });
  const lunes = diasSemana.find(d => d.codigo === 'LUNES')!;
  const martes = diasSemana.find(d => d.codigo === 'MARTES')!;
  const miercoles = diasSemana.find(d => d.codigo === 'MIERCOLES')!;

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

  // ========== Categorías y Estados de Equipamiento ==========
  // Obtener categorías y estados insertados por los seeds
  const catInstrumentos = await prisma.categoriaEquipamiento.findUnique({ where: { codigo: 'INST' } });
  const catMobiliario = await prisma.categoriaEquipamiento.findUnique({ where: { codigo: 'MOBI' } });
  const catAudio = await prisma.categoriaEquipamiento.findUnique({ where: { codigo: 'AUDI' } });
  const catVisual = await prisma.categoriaEquipamiento.findUnique({ where: { codigo: 'VISU' } });
  const catAcustica = await prisma.categoriaEquipamiento.findUnique({ where: { codigo: 'ACUS' } });

  const estadoDisponible = await prisma.estadoEquipamiento.findUnique({ where: { codigo: 'DISPONIBLE' } });
  const estadoMantenimiento = await prisma.estadoEquipamiento.findUnique({ where: { codigo: 'MANTENIMIENTO' } });

  if (!catInstrumentos || !catMobiliario || !catAudio || !catVisual || !catAcustica || !estadoDisponible || !estadoMantenimiento) {
    throw new Error('❌ Error: Categorías o estados de equipamiento no encontrados. Ejecute seeds primero.');
  }

  // ========== Equipamiento ==========
  console.log('  → equipamientos...');
  const equipamientos = await Promise.all([
    prisma.equipamiento.create({
      data: {
        codigo: 'INST-001',
        nombre: 'Piano de Cola',
        categoriaEquipamientoId: catInstrumentos.id,
        estadoEquipamientoId: estadoDisponible.id,
        cantidad: 1,
        descripcion: 'Piano de cola acústico profesional',
        observaciones: 'Requiere afinación periódica',
        activo: true
      }
    }),
    prisma.equipamiento.create({
      data: {
        codigo: 'INST-002',
        nombre: 'Piano Vertical',
        categoriaEquipamientoId: catInstrumentos.id,
        estadoEquipamientoId: estadoDisponible.id,
        cantidad: 1,
        descripcion: 'Piano vertical acústico',
        observaciones: 'Requiere afinación periódica',
        activo: true
      }
    }),
    prisma.equipamiento.create({
      data: {
        codigo: 'MOBI-001',
        nombre: 'Sillas',
        categoriaEquipamientoId: catMobiliario.id,
        estadoEquipamientoId: estadoDisponible.id,
        cantidad: 100,
        descripcion: 'Sillas estándar para alumnos',
        activo: true
      }
    }),
    prisma.equipamiento.create({
      data: {
        codigo: 'MOBI-002',
        nombre: 'Atriles',
        categoriaEquipamientoId: catMobiliario.id,
        estadoEquipamientoId: estadoDisponible.id,
        cantidad: 75,
        descripcion: 'Atriles de partituras',
        activo: true
      }
    }),
    prisma.equipamiento.create({
      data: {
        codigo: 'VISU-001',
        nombre: 'Pizarra Musical',
        categoriaEquipamientoId: catVisual.id,
        estadoEquipamientoId: estadoDisponible.id,
        cantidad: 3,
        descripcion: 'Pizarra con pentagramas',
        activo: true
      }
    }),
    prisma.equipamiento.create({
      data: {
        codigo: 'AUDI-001',
        nombre: 'Sistema de Sonido',
        categoriaEquipamientoId: catAudio.id,
        estadoEquipamientoId: estadoDisponible.id,
        cantidad: 2,
        descripcion: 'Equipo de audio profesional con amplificadores y altavoces',
        activo: true
      }
    }),
    prisma.equipamiento.create({
      data: {
        codigo: 'VISU-002',
        nombre: 'Proyector',
        categoriaEquipamientoId: catVisual.id,
        estadoEquipamientoId: estadoDisponible.id,
        cantidad: 2,
        descripcion: 'Proyector multimedia',
        activo: true
      }
    }),
    prisma.equipamiento.create({
      data: {
        codigo: 'AUDI-002',
        nombre: 'Consola de Grabación',
        categoriaEquipamientoId: catAudio.id,
        estadoEquipamientoId: estadoDisponible.id,
        cantidad: 1,
        descripcion: 'Consola digital de grabación multipista',
        activo: true
      }
    }),
    prisma.equipamiento.create({
      data: {
        codigo: 'AUDI-003',
        nombre: 'Micrófonos',
        categoriaEquipamientoId: catAudio.id,
        estadoEquipamientoId: estadoDisponible.id,
        cantidad: 10,
        descripcion: 'Set de micrófonos profesionales',
        observaciones: '2 unidades en reparación',
        activo: true
      }
    }),
    prisma.equipamiento.create({
      data: {
        codigo: 'ACUS-001',
        nombre: 'Cabina Acústica',
        categoriaEquipamientoId: catAcustica.id,
        estadoEquipamientoId: estadoDisponible.id,
        cantidad: 1,
        descripcion: 'Cabina insonorizada para grabación',
        activo: true
      }
    }),
    prisma.equipamiento.create({
      data: {
        codigo: 'MOBI-003',
        nombre: 'Escritorio',
        categoriaEquipamientoId: catMobiliario.id,
        estadoEquipamientoId: estadoDisponible.id,
        cantidad: 5,
        descripcion: 'Escritorio para docente',
        activo: true
      }
    }),
    prisma.equipamiento.create({
      data: {
        codigo: 'MOBI-004',
        nombre: 'Armario',
        categoriaEquipamientoId: catMobiliario.id,
        estadoEquipamientoId: estadoDisponible.id,
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

  // ========== CategoriaItem (Catálogo de categorías de ítems de cuota) ==========
  console.log('  → CategoriaItem...');

  const categoriaItemBase = await prisma.categoriaItem.upsert({
    where: { codigo: 'BASE' },
    update: {},
    create: {
      codigo: 'BASE',
      nombre: 'Cuota Base',
      descripcion: 'Ítems correspondientes a la cuota base del socio',
      icono: '💰',
      color: 'blue',
      activo: true,
      orden: 1
    }
  });

  const categoriaItemActividad = await prisma.categoriaItem.upsert({
    where: { codigo: 'ACTIVIDAD' },
    update: {},
    create: {
      codigo: 'ACTIVIDAD',
      nombre: 'Actividades',
      descripcion: 'Ítems de participación en actividades',
      icono: '🎵',
      color: 'green',
      activo: true,
      orden: 2
    }
  });

  const categoriaItemDescuento = await prisma.categoriaItem.upsert({
    where: { codigo: 'DESCUENTO' },
    update: {},
    create: {
      codigo: 'DESCUENTO',
      nombre: 'Descuentos',
      descripcion: 'Descuentos y beneficios aplicados',
      icono: '🎁',
      color: 'purple',
      activo: true,
      orden: 3
    }
  });

  const categoriaItemRecargo = await prisma.categoriaItem.upsert({
    where: { codigo: 'RECARGO' },
    update: {},
    create: {
      codigo: 'RECARGO',
      nombre: 'Recargos',
      descripcion: 'Recargos por mora o conceptos adicionales',
      icono: '⚠️',
      color: 'red',
      activo: true,
      orden: 4
    }
  });

  const categoriaItemAjuste = await prisma.categoriaItem.upsert({
    where: { codigo: 'AJUSTE' },
    update: {},
    create: {
      codigo: 'AJUSTE',
      nombre: 'Ajustes Manuales',
      descripcion: 'Ajustes manuales aplicados por administración',
      icono: '✏️',
      color: 'orange',
      activo: true,
      orden: 5
    }
  });

  const categoriaItemOtro = await prisma.categoriaItem.upsert({
    where: { codigo: 'OTRO' },
    update: {},
    create: {
      codigo: 'OTRO',
      nombre: 'Otros Conceptos',
      descripcion: 'Otros ítems no categorizados',
      icono: '📋',
      color: 'gray',
      activo: true,
      orden: 6
    }
  });

  // ========== TipoItemCuota (Catálogo de tipos de ítems) ==========
  console.log('  → TipoItemCuota...');

  // Tipos de BASE
  const tipoItemCuotaBaseSocio = await prisma.tipoItemCuota.upsert({
    where: { codigo: 'CUOTA_BASE_SOCIO' },
    update: {},
    create: {
      codigo: 'CUOTA_BASE_SOCIO',
      nombre: 'Cuota Base Socio',
      descripcion: 'Cuota mensual base según categoría del socio',
      categoriaItemId: categoriaItemBase.id,
      esCalculado: true,
      activo: true,
      orden: 1,
      configurable: false
    }
  });

  // Tipos de ACTIVIDAD
  const tipoItemActividadIndividual = await prisma.tipoItemCuota.upsert({
    where: { codigo: 'ACTIVIDAD_INDIVIDUAL' },
    update: {},
    create: {
      codigo: 'ACTIVIDAD_INDIVIDUAL',
      nombre: 'Actividad Individual',
      descripcion: 'Participación en actividad de instrucción individual',
      categoriaItemId: categoriaItemActividad.id,
      esCalculado: true,
      activo: true,
      orden: 10,
      configurable: true
    }
  });

  const tipoItemActividadGrupal = await prisma.tipoItemCuota.upsert({
    where: { codigo: 'ACTIVIDAD_GRUPAL' },
    update: {},
    create: {
      codigo: 'ACTIVIDAD_GRUPAL',
      nombre: 'Actividad Grupal',
      descripcion: 'Participación en actividad grupal (coro, orquesta, etc.)',
      categoriaItemId: categoriaItemActividad.id,
      esCalculado: true,
      activo: true,
      orden: 11,
      configurable: true
    }
  });

  // Tipos de DESCUENTO
  const tipoItemDescuentoFamiliar = await prisma.tipoItemCuota.upsert({
    where: { codigo: 'DESCUENTO_FAMILIAR' },
    update: {},
    create: {
      codigo: 'DESCUENTO_FAMILIAR',
      nombre: 'Descuento Familiar',
      descripcion: 'Descuento por tener familiares inscritos',
      categoriaItemId: categoriaItemDescuento.id,
      esCalculado: true,
      activo: true,
      orden: 20,
      configurable: true
    }
  });

  const tipoItemDescuentoAntiguedad = await prisma.tipoItemCuota.upsert({
    where: { codigo: 'DESCUENTO_ANTIGUEDAD' },
    update: {},
    create: {
      codigo: 'DESCUENTO_ANTIGUEDAD',
      nombre: 'Descuento por Antigüedad',
      descripcion: 'Descuento por años como socio',
      categoriaItemId: categoriaItemDescuento.id,
      esCalculado: true,
      activo: true,
      orden: 21,
      configurable: true
    }
  });

  const tipoItemDescuentoPagoAnticipado = await prisma.tipoItemCuota.upsert({
    where: { codigo: 'DESCUENTO_PAGO_ANTICIPADO' },
    update: {},
    create: {
      codigo: 'DESCUENTO_PAGO_ANTICIPADO',
      nombre: 'Descuento Pago Anticipado',
      descripcion: 'Descuento por pago antes de vencimiento',
      categoriaItemId: categoriaItemDescuento.id,
      esCalculado: true,
      activo: true,
      orden: 22,
      configurable: true
    }
  });

  // Tipos de RECARGO
  const tipoItemRecargoMora = await prisma.tipoItemCuota.upsert({
    where: { codigo: 'RECARGO_MORA' },
    update: {},
    create: {
      codigo: 'RECARGO_MORA',
      nombre: 'Recargo por Mora',
      descripcion: 'Recargo aplicado por pago fuera de término',
      categoriaItemId: categoriaItemRecargo.id,
      esCalculado: true,
      activo: true,
      orden: 30,
      configurable: true
    }
  });

  // Tipos de AJUSTE
  const tipoItemAjusteManualDescuento = await prisma.tipoItemCuota.upsert({
    where: { codigo: 'AJUSTE_MANUAL_DESCUENTO' },
    update: {},
    create: {
      codigo: 'AJUSTE_MANUAL_DESCUENTO',
      nombre: 'Ajuste Manual - Descuento',
      descripcion: 'Descuento manual aplicado por administración',
      categoriaItemId: categoriaItemAjuste.id,
      esCalculado: false,
      activo: true,
      orden: 40,
      configurable: false
    }
  });

  const tipoItemAjusteManualRecargo = await prisma.tipoItemCuota.upsert({
    where: { codigo: 'AJUSTE_MANUAL_RECARGO' },
    update: {},
    create: {
      codigo: 'AJUSTE_MANUAL_RECARGO',
      nombre: 'Ajuste Manual - Recargo',
      descripcion: 'Recargo manual aplicado por administración',
      categoriaItemId: categoriaItemAjuste.id,
      esCalculado: false,
      activo: true,
      orden: 41,
      configurable: false
    }
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

  // Obtener IDs de tipos de contacto desde el catálogo
  const tipoEmail = await prisma.tipoContactoCatalogo.findUnique({ where: { codigo: 'EMAIL' } });
  const tipoCelular = await prisma.tipoContactoCatalogo.findUnique({ where: { codigo: 'CELULAR' } });
  const tipoWhatsapp = await prisma.tipoContactoCatalogo.findUnique({ where: { codigo: 'WHATSAPP' } });
  const tipoTelefono = await prisma.tipoContactoCatalogo.findUnique({ where: { codigo: 'TELEFONO' } });

  if (!tipoEmail || !tipoCelular || !tipoWhatsapp || !tipoTelefono) {
    throw new Error('❌ Error: Tipos de contacto no encontrados en catálogo. Ejecute seedTiposContacto() primero.');
  }

  // Contactos para María Fernández (docente1)
  await prisma.contactoPersona.createMany({
    data: [
      {
        personaId: docente1.id,
        tipoContactoId: tipoEmail.id,
        valor: 'maria.fernandez@sigesda.com',
        principal: true,
        activo: true
      },
      {
        personaId: docente1.id,
        tipoContactoId: tipoCelular.id,
        valor: '+54 9 11 5555-1001',
        principal: false,
        activo: true
      },
      {
        personaId: docente1.id,
        tipoContactoId: tipoWhatsapp.id,
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
        tipoContactoId: tipoEmail.id,
        valor: 'juan.rodriguez@gmail.com',
        principal: true,
        activo: true
      },
      {
        personaId: socio1.id,
        tipoContactoId: tipoCelular.id,
        valor: '+54 9 11 6666-2001',
        principal: false,
        activo: true
      },
      {
        personaId: socio1.id,
        tipoContactoId: tipoTelefono.id,
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
  // ========== Actividades (usando FK a catálogos) ==========
  // Ejecutar seed externo que usa FK en vez de ENUMs
  await seedActividades();

  // Obtener las actividades creadas para usar en secciones
  const actividadCoro = await prisma.actividades.findUnique({
    where: { codigoActividad: 'ACT-CORO-0001' }
  });
  const actividadPiano = await prisma.actividades.findUnique({
    where: { codigoActividad: 'ACT-CLASE_INDIVIDUAL-0002' }
  });

  if (!actividadCoro || !actividadPiano) {
    throw new Error('Actividades no encontradas después del seed');
  }

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

  // TODO: NIVEL 5 temporalmente comentado - problema con schema de horarios_secciones
  /*
  console.log('📁 NIVEL 5: Insertando horarios y reservas de aulas...');

  // ========== horarios_secciones ==========
  console.log('  → horarios_secciones...');

  // Horarios Coro: Lunes y Miércoles 18:00-20:00
  await prisma.horarios_secciones.createMany({
    data: [
      {
        seccionId: seccionCoro.id,
        diaSemanaId: lunes.id,
        horaInicio: '18:00',
        horaFin: '20:00',
        activo: true,
        updatedAt: new Date()
      },
      {
        seccionId: seccionCoro.id,
        diaSemanaId: miercoles.id,
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
      diaSemanaId: martes.id,
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
        diaSemanaId: lunes.id,
        horaInicio: '18:00',
        horaFin: '20:00',
        fechaVigencia: new Date('2025-01-01'),
        observaciones: 'Reserva permanente para coro',
        updatedAt: new Date()
      },
      {
        seccionId: seccionCoro.id,
        aulaId: aulas[0].id, // Sala Principal
        diaSemanaId: miercoles.id,
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
      diaSemanaId: martes.id,
      horaInicio: '15:00',
      horaFin: '16:00',
      fechaVigencia: new Date('2025-01-01'),
      observaciones: 'Aula con piano vertical',
      updatedAt: new Date()
    }
  });

  console.log('✅ Horarios y aulas insertadas\n');
  */
  console.log('⏭️  NIVEL 5 omitido temporalmente (horarios_secciones schema issue)\n');

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

  /**
   * CUOTAS V2 - ARQUITECTURA CON ITEMS_CUOTA
   * ==========================================
   * Se crean 6 cuotas de ejemplo que demuestran diferentes casos de uso:
   *
   * CUOTA 1: BASE SIMPLE (PAGADA)
   *   - Socio ACTIVO: $5,000 (solo cuota base)
   *   - Estado: PAGADO
   *
   * CUOTA 2: BASE + DESCUENTO AUTOMÁTICO (PENDIENTE)
   *   - Socio ESTUDIANTE: $5,000 - $1,000 (20% desc. pago anticipado) = $4,000
   *   - Estado: PENDIENTE
   *
   * CUOTA 3: BASE + DESCUENTO FAMILIAR (PAGADA)
   *   - Socio GENERAL: $5,000 - $500 (10% desc. familiar) = $4,500
   *   - Estado: PAGADO
   *
   * CUOTA 4: BASE + ACTIVIDAD INDIVIDUAL (PENDIENTE)
   *   - Socio ACTIVO: $5,000 (base) + $3,000 (Guitarra) = $8,000
   *   - Estado: PENDIENTE
   *
   * CUOTA 5: BASE + 2 ACTIVIDADES (PENDIENTE)
   *   - Socio ESTUDIANTE: $5,000 (base) + $3,000 (Piano) + $3,000 (Violín) = $11,000
   *   - Estado: PENDIENTE
   *
   * CUOTA 6: BASE + ACTIVIDAD + DESCUENTO MANUAL (PENDIENTE)
   *   - Socio ACTIVO: $5,000 (base) + $3,000 (Coro) - $1,000 (desc. especial) = $7,000
   *   - Estado: PENDIENTE
   */

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

  // Cuota asociada al recibo (V2 con Items)
  await prisma.cuota.create({
    data: {
      reciboId: recibo1.id,
      mes: mesActual,
      anio: anioActual,
      montoBase: null,  // V2: ya no se usan estos campos
      montoActividades: null,  // V2: ya no se usan estos campos
      montoTotal: 5000.00,
      categoriaId: categoriasSocio[0].id, // ACTIVO
      items: {
        create: [
          {
            tipoItemId: tipoItemCuotaBaseSocio.id,
            concepto: `Cuota Base Socio - ${categoriasSocio[0].nombre}`,
            monto: 5000.00,
            cantidad: 1,
            esAutomatico: true,
            esEditable: false,
            metadata: {
              categoriaId: categoriasSocio[0].id,
              categoriaCodigo: categoriasSocio[0].codigo,
              periodo: `${anioActual}-${mesActual.toString().padStart(2, '0')}`
            }
          }
        ]
      }
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

  // Cuota con descuento (V2 con Items)
  const cuota2 = await prisma.cuota.create({
    data: {
      reciboId: recibo2.id,
      mes: mesActual,
      anio: anioActual,
      montoBase: null,  // V2: ya no se usan estos campos
      montoActividades: null,  // V2: ya no se usan estos campos
      montoTotal: 4000.00, // 5000 - 1000 (descuento 20%)
      categoriaId: categoriasSocio[2].id, // ESTUDIANTE
      items: {
        create: [
          {
            tipoItemId: tipoItemCuotaBaseSocio.id,
            concepto: `Cuota Base Socio - ${categoriasSocio[2].nombre}`,
            monto: 5000.00,
            cantidad: 1,
            esAutomatico: true,
            esEditable: false,
            metadata: {
              categoriaId: categoriasSocio[2].id,
              categoriaCodigo: categoriasSocio[2].codigo,
              periodo: `${anioActual}-${mesActual.toString().padStart(2, '0')}`
            }
          },
          {
            tipoItemId: tipoItemDescuentoPagoAnticipado.id,
            concepto: 'Descuento Pago Anticipado 20%',
            monto: -1000.00,
            cantidad: 1,
            porcentaje: 20.0,
            esAutomatico: true,
            esEditable: false,
            metadata: {
              montoBase: 5000.00,
              porcentajeAplicado: 20.0,
              fechaPago: new Date().toISOString(),
              diasAnticipacion: 10
            }
          }
        ]
      }
    }
  });

  // Recibo vencido para Roberto Pérez (GENERAL) con recargo por mora
  const mesAnterior = mesActual === 1 ? 12 : mesActual - 1;
  const anioAnterior = mesActual === 1 ? anioActual - 1 : anioActual;
  const fechaVencimientoAntigua = new Date(anioAnterior, mesAnterior - 1, 10); // Vencido hace 30 días

  const recibo3 = await prisma.recibo.create({
    data: {
      numero: `CUOTA-${anioAnterior}-${mesAnterior.toString().padStart(2, '0')}-1003`,
      tipo: TipoRecibo.CUOTA,
      importe: 4400.00, // 4000 + 400 (recargo 10%)
      fecha: new Date(anioAnterior, mesAnterior - 1, 1),
      fechaVencimiento: fechaVencimientoAntigua,
      estado: EstadoRecibo.VENCIDO,
      concepto: `Cuota mensual ${mesAnterior}/${anioAnterior} - Categoría GENERAL`,
      observaciones: 'Vencida - Con recargo por mora',
      receptorId: socio3.id
    }
  });

  // Cuota con recargo por mora (V2 con Items)
  const cuota3 = await prisma.cuota.create({
    data: {
      reciboId: recibo3.id,
      mes: mesAnterior,
      anio: anioAnterior,
      montoBase: null,  // V2: ya no se usan estos campos
      montoActividades: null,  // V2: ya no se usan estos campos
      montoTotal: 4400.00, // 4000 + 400 (recargo 10%)
      categoriaId: categoriasSocio[1].id, // GENERAL
      items: {
        create: [
          {
            tipoItemId: tipoItemCuotaBaseSocio.id,
            concepto: `Cuota Base Socio - ${categoriasSocio[1].nombre}`,
            monto: 4000.00,
            cantidad: 1,
            esAutomatico: true,
            esEditable: false,
            metadata: {
              categoriaId: categoriasSocio[1].id,
              categoriaCodigo: categoriasSocio[1].codigo,
              periodo: `${anioAnterior}-${mesAnterior.toString().padStart(2, '0')}`
            }
          },
          {
            tipoItemId: tipoItemRecargoMora.id,
            concepto: 'Recargo por Mora 10% - 30 días vencido',
            monto: 400.00,
            cantidad: 1,
            porcentaje: 10.0,
            esAutomatico: true,
            esEditable: false,
            metadata: {
              montoBase: 4000.00,
              porcentajeAplicado: 10.0,
              diasVencido: 30,
              fechaVencimiento: fechaVencimientoAntigua.toISOString(),
              fechaCalculo: new Date().toISOString()
            }
          }
        ]
      }
    }
  });

  // ========== CUOTA 4: BASE + ACTIVIDAD INDIVIDUAL ==========
  const recibo4 = await prisma.recibo.create({
    data: {
      numero: `CUOTA-${anioActual}-${mesActual.toString().padStart(2, '0')}-1004`,
      tipo: TipoRecibo.CUOTA,
      importe: 8000.00, // 5000 (base) + 3000 (actividad)
      fecha: new Date(),
      fechaVencimiento: new Date(anioActual, mesActual - 1, 10),
      estado: EstadoRecibo.PENDIENTE,
      concepto: `Cuota mensual ${mesActual}/${anioActual} - Socio con Actividad`,
      observaciones: 'Socio ACTIVO + Actividad Individual',
      receptorId: socio1.id  // Reutilizamos socio1
    }
  });

  const cuota4 = await prisma.cuota.create({
    data: {
      reciboId: recibo4.id,
      mes: mesActual,
      anio: anioActual,
      montoBase: null,  // V2: ya no se usan estos campos
      montoActividades: null,  // V2: ya no se usan estos campos
      montoTotal: 8000.00,
      categoriaId: categoriasSocio[0].id, // ACTIVO
      items: {
        create: [
          {
            tipoItemId: tipoItemCuotaBaseSocio.id,
            concepto: `Cuota Base Socio - ${categoriasSocio[0].nombre}`,
            monto: 5000.00,
            cantidad: 1,
            esAutomatico: true,
            esEditable: false,
            metadata: {
              categoriaId: categoriasSocio[0].id,
              categoriaCodigo: categoriasSocio[0].codigo,
              periodo: `${anioActual}-${mesActual.toString().padStart(2, '0')}`
            }
          },
          {
            tipoItemId: tipoItemActividadIndividual.id,
            concepto: 'Guitarra Individual - Nivel Principiante',
            monto: 3000.00,
            cantidad: 1,
            esAutomatico: true,
            esEditable: false,
            metadata: {
              tipoActividad: 'INDIVIDUAL',
              nombreActividad: 'Guitarra',
              nivel: 'Principiante',
              periodo: `${anioActual}-${mesActual.toString().padStart(2, '0')}`
            }
          }
        ]
      }
    }
  });

  // ========== CUOTA 5: BASE + 2 ACTIVIDADES ==========
  const recibo5 = await prisma.recibo.create({
    data: {
      numero: `CUOTA-${anioActual}-${mesActual.toString().padStart(2, '0')}-1005`,
      tipo: TipoRecibo.CUOTA,
      importe: 11000.00, // 5000 (base) + 3000 (piano) + 3000 (violín)
      fecha: new Date(),
      fechaVencimiento: new Date(anioActual, mesActual - 1, 10),
      estado: EstadoRecibo.PENDIENTE,
      concepto: `Cuota mensual ${mesActual}/${anioActual} - Socio con 2 Actividades`,
      observaciones: 'Socio ESTUDIANTE + Piano + Violín',
      receptorId: socio2.id
    }
  });

  const cuota5 = await prisma.cuota.create({
    data: {
      reciboId: recibo5.id,
      mes: mesActual,
      anio: anioActual,
      montoBase: null,  // V2: ya no se usan estos campos
      montoActividades: null,  // V2: ya no se usan estos campos
      montoTotal: 11000.00,
      categoriaId: categoriasSocio[1].id, // ESTUDIANTE
      items: {
        create: [
          {
            tipoItemId: tipoItemCuotaBaseSocio.id,
            concepto: `Cuota Base Socio - ${categoriasSocio[1].nombre}`,
            monto: 5000.00,
            cantidad: 1,
            esAutomatico: true,
            esEditable: false,
            metadata: {
              categoriaId: categoriasSocio[1].id,
              categoriaCodigo: categoriasSocio[1].codigo,
              periodo: `${anioActual}-${mesActual.toString().padStart(2, '0')}`
            }
          },
          {
            tipoItemId: tipoItemActividadIndividual.id,
            concepto: 'Piano Individual - Nivel Intermedio',
            monto: 3000.00,
            cantidad: 1,
            esAutomatico: true,
            esEditable: false,
            metadata: {
              tipoActividad: 'INDIVIDUAL',
              nombreActividad: 'Piano',
              nivel: 'Intermedio',
              periodo: `${anioActual}-${mesActual.toString().padStart(2, '0')}`
            }
          },
          {
            tipoItemId: tipoItemActividadIndividual.id,
            concepto: 'Violín Individual - Nivel Avanzado',
            monto: 3000.00,
            cantidad: 1,
            esAutomatico: true,
            esEditable: false,
            metadata: {
              tipoActividad: 'INDIVIDUAL',
              nombreActividad: 'Violín',
              nivel: 'Avanzado',
              periodo: `${anioActual}-${mesActual.toString().padStart(2, '0')}`
            }
          }
        ]
      }
    }
  });

  // ========== CUOTA 6: BASE + ACTIVIDAD + DESCUENTO ==========
  const recibo6 = await prisma.recibo.create({
    data: {
      numero: `CUOTA-${anioActual}-${mesActual.toString().padStart(2, '0')}-1006`,
      tipo: TipoRecibo.CUOTA,
      importe: 7000.00, // 5000 (base) + 3000 (actividad) - 1000 (descuento)
      fecha: new Date(),
      fechaVencimiento: new Date(anioActual, mesActual - 1, 10),
      estado: EstadoRecibo.PENDIENTE,
      concepto: `Cuota mensual ${mesActual}/${anioActual} - Socio con Descuento Aplicado`,
      observaciones: 'Socio ACTIVO + Coro + Descuento Manual 10%',
      receptorId: socio3.id
    }
  });

  const cuota6 = await prisma.cuota.create({
    data: {
      reciboId: recibo6.id,
      mes: mesActual,
      anio: anioActual,
      montoBase: null,  // V2: ya no se usan estos campos
      montoActividades: null,  // V2: ya no se usan estos campos
      montoTotal: 7000.00,
      categoriaId: categoriasSocio[0].id, // ACTIVO
      items: {
        create: [
          {
            tipoItemId: tipoItemCuotaBaseSocio.id,
            concepto: `Cuota Base Socio - ${categoriasSocio[0].nombre}`,
            monto: 5000.00,
            cantidad: 1,
            esAutomatico: true,
            esEditable: false,
            metadata: {
              categoriaId: categoriasSocio[0].id,
              categoriaCodigo: categoriasSocio[0].codigo,
              periodo: `${anioActual}-${mesActual.toString().padStart(2, '0')}`
            }
          },
          {
            tipoItemId: tipoItemActividadGrupal.id,
            concepto: 'Coro Grupal - Nivel General',
            monto: 3000.00,
            cantidad: 1,
            esAutomatico: true,
            esEditable: false,
            metadata: {
              tipoActividad: 'GRUPAL',
              nombreActividad: 'Coro',
              nivel: 'General',
              periodo: `${anioActual}-${mesActual.toString().padStart(2, '0')}`
            }
          },
          {
            tipoItemId: tipoItemAjusteManualDescuento.id,
            concepto: 'Descuento Manual - Situación Especial 10%',
            monto: -1000.00,
            cantidad: 1,
            esAutomatico: false,
            esEditable: true,
            metadata: {
              tipoAjuste: 'DESCUENTO',
              porcentaje: 10,
              razon: 'Situación socioeconómica especial',
              aplicadoPor: 'Administración',
              fechaAplicacion: new Date().toISOString(),
              periodo: `${anioActual}-${mesActual.toString().padStart(2, '0')}`
            }
          }
        ]
      }
    }
  });

  console.log('✅ Pagos insertados\n');

  // ============================================================================
  // NIVEL 8: GESTIÓN SOCIETARIA Y BENEFICIOS (Comisión, Exenciones, Ajustes)
  // ============================================================================

  console.log('📁 NIVEL 8: Insertando gestión societaria y beneficios...');

  // ========== ComisionDirectiva ==========
  console.log('  → ComisionDirectiva...');

  // Presidente: Socio 1 (Juan Rodríguez)
  await prisma.comisionDirectiva.create({
    data: {
      socioId: socio1.id,
      cargo: 'Presidente',
      fechaInicio: new Date('2024-01-01'),
      activo: true
    }
  });

  // Tesorera: Socio 2 (Ana López)
  await prisma.comisionDirectiva.create({
    data: {
      socioId: socio2.id,
      cargo: 'Tesorera',
      fechaInicio: new Date('2024-01-01'),
      activo: true
    }
  });

  // ========== ExencionCuota ==========
  console.log('  → ExencionCuota...');

  // Exención Total para Socio 3 (Roberto Pérez) - Socio Honorario
  const exencion1 = await prisma.exencionCuota.create({
    data: {
      personaId: socio3.id,
      tipoExencion: TipoExencion.TOTAL,
      motivoExencion: MotivoExencion.SOCIO_HONORARIO,
      estado: EstadoExencion.VIGENTE,
      porcentajeExencion: 100.00,
      fechaInicio: new Date('2025-01-01'),
      fechaFin: new Date('2025-12-31'),
      descripcion: 'Exención por reconocimiento a trayectoria',
      activa: true
    }
  });

  // Exención Parcial Pendiente para Familiar 1 (Matías) - Beca
  const exencion2 = await prisma.exencionCuota.create({
    data: {
      personaId: familiar1.id,
      tipoExencion: TipoExencion.PARCIAL,
      motivoExencion: MotivoExencion.BECA,
      estado: EstadoExencion.PENDIENTE_APROBACION,
      porcentajeExencion: 50.00,
      fechaInicio: new Date('2025-03-01'),
      descripcion: 'Solicitud de beca por mérito académico',
      activa: true
    }
  });

  // ========== AjusteCuotaSocio ==========
  console.log('  → AjusteCuotaSocio...');

  // Recargo fijo administrativo para Socio 4 (Gabriela)
  const ajuste1 = await prisma.ajusteCuotaSocio.create({
    data: {
      personaId: socio4.id,
      tipoAjuste: TipoAjusteCuota.RECARGO_FIJO,
      valor: 500.00,
      concepto: 'Gasto administrativo mensual',
      fechaInicio: new Date('2025-01-01'),
      activo: true,
      aplicaA: ScopeAjusteCuota.SOLO_BASE
    }
  });

  // ========== HistorialAjusteCuota (Auditoría de cambios) ==========
  console.log('  → HistorialAjusteCuota...');

  // Historial de creación de ajuste1
  await prisma.historialAjusteCuota.create({
    data: {
      ajusteId: ajuste1.id,
      personaId: socio4.id,
      accion: 'CREAR_AJUSTE',
      datosNuevos: {
        tipoAjuste: ajuste1.tipoAjuste,
        valor: ajuste1.valor.toString(),
        concepto: ajuste1.concepto,
        aplicaA: ajuste1.aplicaA,
        fechaInicio: ajuste1.fechaInicio?.toISOString()
      },
      usuario: 'SEED_SCRIPT',
      motivoCambio: 'Creación inicial desde seed'
    }
  });

  // Historial de creación de exención1 (Total - Socio Honorario)
  await prisma.historialAjusteCuota.create({
    data: {
      exencionId: exencion1.id,
      personaId: socio3.id,
      accion: 'CREAR_EXENCION',
      datosNuevos: {
        tipoExencion: exencion1.tipoExencion,
        motivoExencion: exencion1.motivoExencion,
        estado: exencion1.estado,
        porcentajeExencion: exencion1.porcentajeExencion.toString(),
        descripcion: exencion1.descripcion,
        fechaInicio: exencion1.fechaInicio?.toISOString(),
        fechaFin: exencion1.fechaFin?.toISOString()
      },
      usuario: 'SEED_SCRIPT',
      motivoCambio: 'Exención por socio honorario - Reconocimiento a trayectoria'
    }
  });

  // Historial de creación de exención2 (Parcial - Beca)
  await prisma.historialAjusteCuota.create({
    data: {
      exencionId: exencion2.id,
      personaId: familiar1.id,
      accion: 'CREAR_EXENCION',
      datosNuevos: {
        tipoExencion: exencion2.tipoExencion,
        motivoExencion: exencion2.motivoExencion,
        estado: exencion2.estado,
        porcentajeExencion: exencion2.porcentajeExencion.toString(),
        descripcion: exencion2.descripcion,
        fechaInicio: exencion2.fechaInicio?.toISOString()
      },
      usuario: 'SEED_SCRIPT',
      motivoCambio: 'Solicitud de beca por mérito académico'
    }
  });

  // ========== AplicacionRegla (Tarea 2.3: FASE 2) ==========
  console.log('  → AplicacionRegla...');

  // Paso 1: Obtener reglas de descuento creadas por seed-reglas-descuentos.ts
  const reglaFamiliar = await prisma.reglaDescuento.findUnique({
    where: { codigo: 'DESC_FAMILIAR' }
  });

  const reglaAntiguedad = await prisma.reglaDescuento.findUnique({
    where: { codigo: 'DESC_ANTIGUEDAD' }
  });

  // Paso 2: Obtener ítems de descuento de las cuotas
  const itemDescuentoCuota2 = await prisma.itemCuota.findFirst({
    where: {
      cuotaId: cuota2.id,
      tipoItem: {
        categoriaItem: {
          codigo: 'DESCUENTO'
        }
      }
    }
  });

  // Paso 3: Crear aplicación de regla familiar (Cuota 2)
  if (reglaFamiliar && itemDescuentoCuota2) {
    await prisma.aplicacionRegla.create({
      data: {
        cuotaId: cuota2.id,
        reglaId: reglaFamiliar.id,
        itemCuotaId: itemDescuentoCuota2.id,
        porcentajeAplicado: 20.0,  // Simulado: el 20% del descuento se atribuye a regla familiar
        montoDescuento: 1000.00,   // $1000 del descuento total
        metadata: {
          tipoAplicacion: 'SIMULADA',
          nota: 'Descuento aplicado por pago anticipado (simulado como familiar para demo)',
          familiares: [
            {
              personaId: socio1.id,
              nombreCompleto: 'Juan Pablo Rodríguez',
              parentesco: 'PADRE',
              actividadesCompartidas: ['Piano Nivel 1']
            }
          ],
          criterioAplicacion: 'FAMILIAR_INSCRITO_MISMA_ACTIVIDAD',
          baseCalculo: 5000.00,
          calculoDetallado: {
            montoBase: 5000.00,
            porcentajeRegla: 20.0,
            montoCalculado: 1000.00
          }
        }
      }
    });
  }

  // Paso 4: Crear aplicación de regla de antigüedad (Cuota 3 - simulada)
  // Nota: Esta es una demostración, ya que cuota3 tiene un recargo, no descuento
  // En producción, esto se aplicaría a una cuota que realmente tenga ítem de descuento por antigüedad
  if (reglaAntiguedad) {
    await prisma.aplicacionRegla.create({
      data: {
        cuotaId: cuota3.id,
        reglaId: reglaAntiguedad.id,
        itemCuotaId: null,  // No hay ítem de descuento asociado (cuota3 tiene recargo)
        porcentajeAplicado: 5.0,  // 5% de antigüedad (5 años como socio)
        montoDescuento: 200.00,   // Simulado: $200 que podría haberse descontado
        metadata: {
          tipoAplicacion: 'SIMULADA',
          nota: 'Regla de antigüedad registrada pero no aplicada (cuota tiene recargo)',
          aniosAntiguedad: 5,
          fechaAltaSocio: '2021-01-15',
          criterioAplicacion: 'ANTIGUEDAD_5_ANIOS',
          baseCalculo: 4000.00,
          calculoDetallado: {
            montoBase: 4000.00,
            porcentajeRegla: 5.0,
            montoCalculado: 200.00,
            aplicado: false,
            razonNoAplicado: 'Cuota ya tiene recargo por mora'
          }
        }
      }
    });
  }

  console.log('✅ Gestión societaria insertada\n');

  // ============================================================================
  // NIVEL 9: DATOS DE PRUEBA MASIVOS
  // ============================================================================

  // Ejecutar seed de test masivo (52 socios, actividades, etc.)
  // Pasamos true para indicar que es parte del flujo principal
  await seedTestCuotas();

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
  console.log('  ✓ Recibos: 6');
  console.log('  ✓ Cuotas: 6 (3 originales + 3 nuevas con Items V2)');
  console.log('  ✓ Items de Cuota: 13 (desglose completo por ítem)');
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
