import { z } from 'zod';
import { TipoPersona, CategoriaSocio, TipoActividad, TipoRecibo, MedioPagoTipo } from '@/types/enums';

// Common field validations
export const commonValidations = {
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().regex(/^\d{3}-\d{7}$/, 'Phone format: 351-1234567').optional(),
  dni: z.string().regex(/^\d{8}$/, 'DNI must be 8 digits'),
  cuit: z.string().regex(/^\d{2}-\d{8}-\d{1}$/, 'CUIT format: 20-12345678-9').optional(),
  decimal: z.number().or(z.string().transform(Number)).refine(val => val >= 0, 'Must be positive'),
  positiveInt: z.number().int().positive('Must be a positive integer'),
  dateString: z.string().datetime('Invalid date format')
};

// Persona validation schemas
export const personaSchemas = {
  create: z.object({
    tipo: z.nativeEnum(TipoPersona),
    nombre: z.string().min(2, 'Name must be at least 2 characters'),
    apellido: z.string().min(2, 'Last name must be at least 2 characters'),
    dni: commonValidations.dni,
    email: commonValidations.email,
    telefono: commonValidations.phone,
    direccion: z.string().optional(),
    fechaNacimiento: commonValidations.dateString.optional(),

    // Socio fields
    categoria: z.nativeEnum(CategoriaSocio).optional(),
    fechaIngreso: commonValidations.dateString.optional(),

    // Docente fields
    especialidad: z.string().optional(),
    honorariosPorHora: commonValidations.decimal.optional(),

    // Proveedor fields
    cuit: commonValidations.cuit,
    razonSocial: z.string().optional(),
  }).refine(data => {
    // Validate required fields based on tipo
    switch (data.tipo) {
      case TipoPersona.SOCIO:
        return data.categoria && data.fechaIngreso;
      case TipoPersona.DOCENTE:
        return data.especialidad;
      case TipoPersona.PROVEEDOR:
        return data.cuit && data.razonSocial;
      default:
        return true;
    }
  }, {
    message: 'Missing required fields for the selected person type'
  }),

  update: z.object({
    nombre: z.string().min(2).optional(),
    apellido: z.string().min(2).optional(),
    email: commonValidations.email,
    telefono: commonValidations.phone,
    direccion: z.string().optional(),
    fechaNacimiento: commonValidations.dateString.optional(),

    // Socio fields
    categoria: z.nativeEnum(CategoriaSocio).optional(),
    fechaBaja: commonValidations.dateString.optional(),
    motivoBaja: z.string().optional(),

    // Docente fields
    especialidad: z.string().optional(),
    honorariosPorHora: commonValidations.decimal.optional(),

    // Proveedor fields
    razonSocial: z.string().optional(),
  }),

  filter: z.object({
    tipo: z.nativeEnum(TipoPersona).optional(),
    categoria: z.nativeEnum(CategoriaSocio).optional(),
    activo: z.boolean().optional(),
    search: z.string().optional()
  })
};

// Actividad validation schemas
export const actividadSchemas = {
  create: z.object({
    nombre: z.string().min(3, 'Name must be at least 3 characters'),
    tipo: z.nativeEnum(TipoActividad),
    descripcion: z.string().optional(),
    precio: commonValidations.decimal.default(0),
    duracion: commonValidations.positiveInt.optional(),
    capacidadMaxima: commonValidations.positiveInt.optional(),
    docenteIds: z.array(z.string().cuid()).optional()
  }),

  update: z.object({
    nombre: z.string().min(3).optional(),
    descripcion: z.string().optional(),
    precio: commonValidations.decimal.optional(),
    duracion: commonValidations.positiveInt.optional(),
    capacidadMaxima: commonValidations.positiveInt.optional(),
    activa: z.boolean().optional(),
    docenteIds: z.array(z.string().cuid()).optional()
  }),

  filter: z.object({
    tipo: z.nativeEnum(TipoActividad).optional(),
    activa: z.boolean().optional(),
    conDocente: z.boolean().optional(),
    search: z.string().optional()
  })
};

// ParticipacionActividad validation schemas
export const participacionSchemas = {
  create: z.object({
    personaId: z.string().cuid(),
    actividadId: z.string().cuid(),
    fechaInicio: commonValidations.dateString,
    fechaFin: commonValidations.dateString.optional(),
    precioEspecial: commonValidations.decimal.optional(),
    observaciones: z.string().optional()
  }).refine(data => {
    if (data.fechaFin) {
      return new Date(data.fechaInicio) < new Date(data.fechaFin);
    }
    return true;
  }, {
    message: 'fechaInicio must be before fechaFin'
  }),

  update: z.object({
    fechaFin: commonValidations.dateString.optional(),
    precioEspecial: commonValidations.decimal.optional(),
    activa: z.boolean().optional(),
    observaciones: z.string().optional()
  })
};

// Recibo validation schemas
export const reciboSchemas = {
  create: z.object({
    tipo: z.nativeEnum(TipoRecibo),
    importe: commonValidations.decimal,
    fechaVencimiento: commonValidations.dateString.optional(),
    concepto: z.string().min(5, 'Concept must be descriptive'),
    observaciones: z.string().optional(),
    emisorId: z.string().cuid().optional(),
    receptorId: z.string().cuid().optional()
  }),

  update: z.object({
    fechaVencimiento: commonValidations.dateString.optional(),
    concepto: z.string().min(5).optional(),
    observaciones: z.string().optional()
  }),

  filter: z.object({
    tipo: z.nativeEnum(TipoRecibo).optional(),
    fechaDesde: commonValidations.dateString.optional(),
    fechaHasta: commonValidations.dateString.optional(),
    personaId: z.string().cuid().optional(),
    search: z.string().optional()
  })
};

// MedioPago validation schemas
export const medioPagoSchemas = {
  create: z.object({
    reciboId: z.string().cuid(),
    tipo: z.nativeEnum(MedioPagoTipo),
    importe: commonValidations.decimal,
    numero: z.string().optional(),
    banco: z.string().optional(),
    observaciones: z.string().optional()
  })
};

// Aula validation schemas
export const aulaSchemas = {
  create: z.object({
    nombre: z.string().min(3, 'Name must be at least 3 characters'),
    capacidad: commonValidations.positiveInt,
    ubicacion: z.string().optional(),
    equipamiento: z.string().optional()
  }),

  update: z.object({
    nombre: z.string().min(3).optional(),
    capacidad: commonValidations.positiveInt.optional(),
    ubicacion: z.string().optional(),
    equipamiento: z.string().optional(),
    activa: z.boolean().optional()
  })
};

// ReservaAula validation schemas
export const reservaSchemas = {
  create: z.object({
    aulaId: z.string().cuid(),
    actividadId: z.string().cuid().optional(),
    docenteId: z.string().cuid(),
    fechaInicio: commonValidations.dateString,
    fechaFin: commonValidations.dateString,
    observaciones: z.string().optional()
  }).refine(data => {
    return new Date(data.fechaInicio) < new Date(data.fechaFin);
  }, {
    message: 'fechaInicio must be before fechaFin'
  }).refine(data => {
    // Validar que la reserva no sea en el pasado
    return new Date(data.fechaInicio) > new Date();
  }, {
    message: 'Cannot create reservations in the past'
  })
};