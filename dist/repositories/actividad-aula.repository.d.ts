import { PrismaClient } from '@prisma/client';
import { CreateActividadAulaDto, QueryActividadesAulasDto } from '@/dto/actividad-aula.dto';
type ActividadAulaConRelaciones = {
    id: number;
    actividadId: number;
    aulaId: number;
    fechaAsignacion: Date;
    fechaDesasignacion: Date | null;
    activa: boolean;
    prioridad: number | null;
    observaciones: string | null;
    createdAt: Date;
    updatedAt: Date;
    actividades: {
        id: number;
        nombre: string;
        codigoActividad: string;
        capacidadMaxima: number | null;
        activa: boolean;
    };
    aulas: {
        id: number;
        nombre: string;
        capacidad: number;
        ubicacion: string | null;
        activa: boolean;
    };
};
export declare class ActividadAulaRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(data: CreateActividadAulaDto): Promise<ActividadAulaConRelaciones>;
    findAll(query: QueryActividadesAulasDto): Promise<{
        data: ActividadAulaConRelaciones[];
        total: number;
    }>;
    findById(id: number): Promise<ActividadAulaConRelaciones | null>;
    findByActividadId(actividadId: number, soloActivas?: boolean): Promise<ActividadAulaConRelaciones[]>;
    findByAulaId(aulaId: number, soloActivas?: boolean): Promise<ActividadAulaConRelaciones[]>;
    findByActividadAndAula(actividadId: number, aulaId: number): Promise<ActividadAulaConRelaciones | null>;
    update(id: number, data: Partial<CreateActividadAulaDto>): Promise<ActividadAulaConRelaciones>;
    delete(id: number): Promise<ActividadAulaConRelaciones>;
    desasignar(id: number, fechaDesasignacion?: Date, observaciones?: string): Promise<ActividadAulaConRelaciones>;
    reactivar(id: number): Promise<ActividadAulaConRelaciones>;
    countAsignacionesActivas(aulaId: number): Promise<number>;
    contarActividadesPorAula(aulaId: number): Promise<{
        total: number;
        activas: number;
        inactivas: number;
    }>;
    getActividadesEnAulaPorHorarios(aulaId: number, diaSemanaId: number, horaInicio: string, horaFin: string, excluirActividadId?: number): Promise<any[]>;
}
export {};
//# sourceMappingURL=actividad-aula.repository.d.ts.map