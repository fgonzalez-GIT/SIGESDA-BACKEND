import { Request } from 'express';
import { Persona } from '@prisma/client';
export interface AuthenticatedRequest extends Request {
    user?: Persona;
}
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
        [key: string]: any;
    };
}
export interface PaginationParams {
    page: number;
    limit: number;
    offset: number;
}
export interface BaseFilter {
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
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
//# sourceMappingURL=interfaces.d.ts.map