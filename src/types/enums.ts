// Re-export Prisma enums for easier access
export {
  TipoPersona,
  CategoriaSocio,
  TipoActividad,
  TipoRecibo,
  MedioPagoTipo,
  TipoParentesco,
  EstadoRecibo
} from '@prisma/client';

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