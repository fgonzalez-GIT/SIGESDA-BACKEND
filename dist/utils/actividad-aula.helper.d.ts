import { PrismaClient } from '@prisma/client';
export interface Horario {
    diaSemanaId: number;
    horaInicio: string;
    horaFin: string;
}
export interface ConflictoDetallado {
    tipo: 'ACTIVIDAD' | 'RESERVA' | 'SECCION';
    id: number;
    nombre: string;
    diaSemana: string;
    diaSemanaId: number;
    horaInicio: string;
    horaFin: string;
    aulaId: number;
    aulaNombre: string;
}
export declare function validarSolapamientoHorarios(horario1: Horario, horario2: Horario): boolean;
export declare function detectarConflictosHorarios(prisma: PrismaClient, aulaId: number, horariosActividad: Horario[], actividadIdExcluir?: number): Promise<ConflictoDetallado[]>;
export declare function sugerirAulasDisponibles(prisma: PrismaClient, actividadId: number, criterios?: {
    capacidadMinima?: number;
    tipoAulaId?: number;
    equipamientoRequerido?: number[];
}): Promise<any[]>;
export declare function actividadTieneHorarios(prisma: PrismaClient, actividadId: number): Promise<boolean>;
export declare function getResumenOcupacionAula(prisma: PrismaClient, aulaId: number): Promise<any>;
//# sourceMappingURL=actividad-aula.helper.d.ts.map