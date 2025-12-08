/**
 * ============================================================================
 * FIXTURES - Datos de prueba predefinidos
 * ============================================================================
 * Objetos de datos reutilizables para tests
 * ============================================================================
 */

import { TipoParentesco, TipoContacto, MedioPagoTipo, TipoRecibo, EstadoRecibo, TipoActividad, DiaSemana } from '@prisma/client';

/**
 * PERSONAS
 */
export const personaFixtures = {
  validPersona1: {
    nombre: 'Juan',
    apellido: 'Pérez',
    dni: '12345678',
    email: 'juan.perez@test.com',
    telefono: '1234567890',
    direccion: 'Calle Falsa 123',
    fechaNacimiento: new Date('1990-05-15')
  },
  validPersona2: {
    nombre: 'María',
    apellido: 'González',
    dni: '23456789',
    email: 'maria.gonzalez@test.com',
    telefono: '0987654321',
    direccion: 'Av. Siempre Viva 742',
    fechaNacimiento: new Date('1985-08-20')
  },
  validDocente: {
    nombre: 'Carlos',
    apellido: 'Rodríguez',
    dni: '34567890',
    email: 'carlos.rodriguez@test.com',
    telefono: '1122334455',
    direccion: 'Boulevard Música 456',
    fechaNacimiento: new Date('1980-03-10')
  },
  validProveedor: {
    nombre: 'Roberto',
    apellido: 'Martínez',
    dni: '45678901',
    email: 'roberto.martinez@proveedor.com',
    telefono: '5544332211',
    direccion: 'Calle Comercio 789',
    fechaNacimiento: new Date('1975-11-25')
  },
  invalidPersonaWithoutDNI: {
    nombre: 'Sin',
    apellido: 'DNI',
    email: 'sin.dni@test.com'
  },
  invalidPersonaWithoutNombre: {
    dni: '56789012',
    apellido: 'Sin Nombre',
    email: 'sin.nombre@test.com'
  }
};

/**
 * PERSONA TIPOS
 */
export const personaTipoFixtures = {
  socioData: (categoriaId: number) => ({
    categoriaId,
    numeroSocio: Math.floor(Math.random() * 10000) + 1000,
    fechaIngreso: new Date()
  }),
  docenteData: (especialidadId: number) => ({
    especialidadId,
    honorariosPorHora: 3500.00
  }),
  proveedorData: {
    cuit: '20123456783',
    razonSocial: 'Empresa de Prueba SRL'
  }
};

/**
 * CONTACTOS
 */
export const contactoFixtures = {
  emailPrincipal: {
    tipoContacto: TipoContacto.EMAIL,
    valor: 'contacto@test.com',
    principal: true,
    activo: true
  },
  celular: {
    tipoContacto: TipoContacto.CELULAR,
    valor: '+54 9 11 1234-5678',
    principal: false,
    activo: true
  },
  whatsapp: {
    tipoContacto: TipoContacto.WHATSAPP,
    valor: '+54 9 11 1234-5678',
    principal: false,
    activo: true
  },
  telefono: {
    tipoContacto: TipoContacto.TELEFONO,
    valor: '11-4444-5555',
    principal: false,
    activo: true
  }
};

/**
 * FAMILIARES
 */
export const familiarFixtures = {
  hijo: {
    parentesco: TipoParentesco.HIJO,
    descripcion: 'Hijo menor',
    permisoResponsableFinanciero: true,
    permisoContactoEmergencia: true,
    permisoAutorizadoRetiro: true,
    descuento: 50.00,
    activo: true
  },
  conyuge: {
    parentesco: TipoParentesco.CONYUGE,
    descripcion: 'Cónyuge (genérico)',
    permisoResponsableFinanciero: true,
    permisoContactoEmergencia: true,
    permisoAutorizadoRetiro: true,
    descuento: 30.00,
    activo: true
  },
  esposa: {
    parentesco: TipoParentesco.ESPOSA,
    descripcion: 'Esposa',
    permisoResponsableFinanciero: true,
    permisoContactoEmergencia: true,
    permisoAutorizadoRetiro: true,
    descuento: 30.00,
    activo: true
  },
  esposo: {
    parentesco: TipoParentesco.ESPOSO,
    descripcion: 'Esposo',
    permisoResponsableFinanciero: true,
    permisoContactoEmergencia: true,
    permisoAutorizadoRetiro: true,
    descuento: 30.00,
    activo: true
  },
  padre: {
    parentesco: TipoParentesco.PADRE,
    descripcion: 'Padre responsable',
    permisoResponsableFinanciero: false,
    permisoContactoEmergencia: true,
    permisoAutorizadoRetiro: false,
    activo: true
  }
};

/**
 * ACTIVIDADES
 */
export const actividadFixtures = {
  coroValido: {
    nombre: 'Coro Municipal Test',
    tipo: TipoActividad.CORO,
    descripcion: 'Coro para tests',
    precio: 2000.00,
    duracion: 120,
    capacidadMaxima: 30,
    activa: true
  },
  claseIndividual: {
    nombre: 'Clase Piano Test',
    tipo: TipoActividad.CLASE_INSTRUMENTO,
    descripcion: 'Clase individual de piano',
    precio: 3500.00,
    duracion: 60,
    capacidadMaxima: 1,
    activa: true
  },
  actividadSinCapacidad: {
    nombre: 'Actividad Sin Límite',
    tipo: TipoActividad.CORO,
    descripcion: 'Sin capacidad máxima',
    precio: 1500.00,
    activa: true
  }
};

/**
 * CUOTAS
 */
export const cuotaFixtures = {
  cuotaActual: (categoriaId: number, reciboId: number) => ({
    reciboId,
    categoriaId,
    mes: new Date().getMonth() + 1,
    anio: new Date().getFullYear(),
    montoBase: 5000.00,
    montoActividades: 0.00,
    montoTotal: 5000.00
  }),
  cuotaConActividades: (categoriaId: number, reciboId: number) => ({
    reciboId,
    categoriaId,
    mes: new Date().getMonth() + 1,
    anio: new Date().getFullYear(),
    montoBase: 5000.00,
    montoActividades: 2000.00,
    montoTotal: 7000.00
  }),
  cuotaConDescuento: (categoriaId: number, reciboId: number, descuento: number) => {
    const base = 5000.00;
    const total = base - (base * descuento / 100);
    return {
      reciboId,
      categoriaId,
      mes: new Date().getMonth() + 1,
      anio: new Date().getFullYear(),
      montoBase: base,
      montoActividades: 0.00,
      montoTotal: total
    };
  }
};

/**
 * RECIBOS
 */
export const reciboFixtures = {
  reciboCuotaPendiente: (receptorId: number) => ({
    numero: `TEST-CUOTA-${Date.now()}`,
    tipo: TipoRecibo.CUOTA,
    importe: 5000.00,
    fecha: new Date(),
    fechaVencimiento: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // +10 días
    estado: EstadoRecibo.PENDIENTE,
    concepto: 'Cuota mensual de prueba',
    receptorId
  }),
  reciboSueldoPagado: (receptorId: number) => ({
    numero: `TEST-SUELDO-${Date.now()}`,
    tipo: TipoRecibo.SUELDO,
    importe: 15000.00,
    fecha: new Date(),
    estado: EstadoRecibo.PAGADO,
    concepto: 'Pago sueldo docente',
    receptorId
  }),
  reciboVencido: (receptorId: number) => ({
    numero: `TEST-VENC-${Date.now()}`,
    tipo: TipoRecibo.CUOTA,
    importe: 5000.00,
    fecha: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // -30 días
    fechaVencimiento: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // -5 días
    estado: EstadoRecibo.VENCIDO,
    concepto: 'Cuota vencida',
    receptorId
  })
};

/**
 * MEDIOS DE PAGO
 */
export const medioPagoFixtures = {
  efectivo: (reciboId: number, importe: number) => ({
    reciboId,
    tipo: MedioPagoTipo.EFECTIVO,
    importe,
    fecha: new Date(),
    observaciones: 'Pago en efectivo'
  }),
  transferencia: (reciboId: number, importe: number) => ({
    reciboId,
    tipo: MedioPagoTipo.TRANSFERENCIA,
    importe,
    fecha: new Date(),
    numero: `TRANS-${Date.now()}`,
    observaciones: 'Transferencia bancaria'
  }),
  cheque: (reciboId: number, importe: number) => ({
    reciboId,
    tipo: MedioPagoTipo.CHEQUE,
    importe,
    fecha: new Date(),
    numero: `CH-${Date.now()}`,
    banco: 'Banco Nación',
    observaciones: 'Cheque al día'
  }),
  tarjetaDebito: (reciboId: number, importe: number) => ({
    reciboId,
    tipo: MedioPagoTipo.TARJETA_DEBITO,
    importe,
    fecha: new Date(),
    numero: `****1234`,
    observaciones: 'Tarjeta débito Visa'
  })
};

/**
 * AULAS
 */
export const aulaFixtures = {
  salaPrincipal: {
    nombre: 'Sala Principal Test',
    capacidad: 50,
    ubicacion: 'Planta Baja',
    equipamiento: 'Piano de cola, sistema de sonido',
    activa: true
  },
  aulaChica: {
    nombre: 'Aula Pequeña Test',
    capacidad: 10,
    ubicacion: 'Primer Piso',
    equipamiento: 'Pizarra, sillas',
    activa: true
  }
};

/**
 * HORARIOS
 */
export const horarioFixtures = {
  lunesTarde: {
    diaSemana: DiaSemana.LUNES,
    horaInicio: '18:00',
    horaFin: '20:00',
    activo: true
  },
  martesManana: {
    diaSemana: DiaSemana.MARTES,
    horaInicio: '09:00',
    horaFin: '11:00',
    activo: true
  },
  miercolesNoche: {
    diaSemana: DiaSemana.MIERCOLES,
    horaInicio: '20:00',
    horaFin: '22:00',
    activo: true
  }
};

/**
 * PARTICIPACIONES
 */
export const participacionFixtures = {
  participacionActiva: (personaId: number, actividadId: number) => ({
    personaId,
    actividadId,
    fechaInicio: new Date(),
    activa: true,
    observaciones: 'Participación de prueba'
  }),
  participacionConPrecioEspecial: (personaId: number, actividadId: number, precioEspecial: number) => ({
    personaId,
    actividadId,
    fechaInicio: new Date(),
    precioEspecial,
    activa: true,
    observaciones: 'Con precio especial'
  }),
  participacionInactiva: (personaId: number, actividadId: number) => ({
    personaId,
    actividadId,
    fechaInicio: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // -180 días
    fechaFin: new Date(),
    activa: false,
    observaciones: 'Participación finalizada'
  })
};

/**
 * Export de todos los fixtures
 */
export default {
  persona: personaFixtures,
  personaTipo: personaTipoFixtures,
  contacto: contactoFixtures,
  familiar: familiarFixtures,
  actividad: actividadFixtures,
  cuota: cuotaFixtures,
  recibo: reciboFixtures,
  medioPago: medioPagoFixtures,
  aula: aulaFixtures,
  horario: horarioFixtures,
  participacion: participacionFixtures
};
