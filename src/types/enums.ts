// Re-export Prisma enums for easier access
export {
  TipoRecibo,
  MedioPagoTipo,
  TipoParentesco,
  EstadoRecibo
} from '@prisma/client';

// Local enums that exist as enums in DB (not catalog tables)
export enum TipoPersona {
  SOCIO = 'SOCIO',
  NO_SOCIO = 'NO_SOCIO',
  DOCENTE = 'DOCENTE',
  PROVEEDOR = 'PROVEEDOR'
}

export enum TipoActividad {
  CORO = 'CORO',
  CLASE_CANTO = 'CLASE_CANTO',
  CLASE_INSTRUMENTO = 'CLASE_INSTRUMENTO'
}

export enum DiaSemana {
  LUNES = 'LUNES',
  MARTES = 'MARTES',
  MIERCOLES = 'MIERCOLES',
  JUEVES = 'JUEVES',
  VIERNES = 'VIERNES',
  SABADO = 'SABADO',
  DOMINGO = 'DOMINGO'
}

// Additional application enums
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500
}

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}