import { Request } from 'express';
import {
  Persona,
  Actividad,
  Recibo,
  SeccionActividad,
  HorarioSeccion,
  ParticipacionSeccion,
  ReservaAulaSeccion
} from '@prisma/client';

// Extended Request interface for authenticated routes (future use)
export interface AuthenticatedRequest extends Request {
  user?: Persona;
}

// Common API Response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// Pagination interface
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

// Common filter interface
export interface BaseFilter {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Specific entity filters
export interface PersonaFilter extends BaseFilter {
  tipo?: string;
  categoria?: string;
  activo?: boolean;
}

export interface ActividadFilter extends BaseFilter {
  tipo?: string;
  activa?: boolean;
  conDocente?: boolean;
}

export interface ReciboFilter extends BaseFilter {
  tipo?: string;
  estado?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  personaId?: string;
}

// Business logic interfaces
export interface CuotaCalculation {
  socioId: string;
  categoria: string;
  montoBase: number;
  actividades: {
    actividadId: string;
    nombre: string;
    precio: number;
  }[];
  montoActividades: number;
  montoTotal: number;
}

export interface ReservaConflict {
  aulaId: string;
  fechaInicio: Date;
  fechaFin: Date;
  conflictsWith: {
    reservaId: string;
    docente: string;
    actividad?: string;
  }[];
}

// ============================================================================
// INTERFACES PARA SISTEMA DE SECCIONES
// ============================================================================

export interface SeccionFilter extends BaseFilter {
  actividadId?: string;
  activa?: boolean;
  conDocente?: boolean;
}

export interface SeccionConHorarios extends SeccionActividad {
  horarios: HorarioSeccion[];
  docentes: Persona[];
  actividad: Actividad;
  _count?: {
    participaciones: number;
    reservasAula: number;
  };
}

export interface SeccionDetallada extends SeccionActividad {
  horarios: HorarioSeccion[];
  docentes: Persona[];
  actividad: Actividad;
  participaciones: ParticipacionSeccion[];
  reservasAula: ReservaAulaSeccion[];
  _count: {
    participaciones: number;
    horarios: number;
    reservasAula: number;
  };
}

export interface ConflictoSeccion {
  tipo: 'DOCENTE' | 'AULA' | 'HORARIO';
  mensaje: string;
  detalles: {
    seccionId: string;
    seccionNombre: string;
    actividadNombre: string;
    diaSemana: string;
    horaInicio: string;
    horaFin: string;
    docente?: string;
    aula?: string;
  };
}

export interface ParticipacionSeccionConRelaciones extends ParticipacionSeccion {
  persona: Persona;
  seccion: SeccionConHorarios;
}

export interface EstadisticasSeccion {
  seccion: string;
  actividad: string;
  participantes: {
    total: number;
    activos: number;
    socios: number;
    noSocios: number;
  };
  ocupacion: {
    porcentaje: number;
    disponibles: number;
  };
  docentes: string[];
  aulas: string[];
  horarios: {
    dia: string;
    horario: string;
  }[];
}

export interface CargaHorariaDocente {
  docenteId: string;
  docente: string;
  totalHorasSemana: number;
  secciones: {
    seccionId: string;
    actividad: string;
    seccion: string;
    horas: number;
    dia: string;
    horario: string;
  }[];
  alerta?: {
    tipo: 'SOBRECARGA' | 'NORMAL';
    mensaje: string;
  };
}

export interface HorarioSemanalSeccion {
  dia: string;
  secciones: {
    seccionId: string;
    actividadNombre: string;
    seccionNombre: string;
    codigo?: string;
    docentes: string[];
    aula?: string;
    horario: string;
    participantes: number;
    capacidad: number;
    ocupacion: number;
  }[];
}

export interface OcupacionSecciones {
  totalSecciones: number;
  ocupacionPromedio: number;
  seccionesLlenas: number;
  seccionesDisponibles: number;
  detalle: {
    seccionId: string;
    actividad: string;
    seccion: string;
    ocupacion: number;
    participantes: number;
    capacidad: number;
  }[];
}