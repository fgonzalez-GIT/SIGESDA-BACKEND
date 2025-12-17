import { PrismaClient, HistorialAjusteCuota, Prisma, AccionHistorialCuota } from '@prisma/client';
export declare class HistorialAjusteCuotaRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(data: {
        ajusteId?: number;
        cuotaId?: number;
        personaId: number;
        accion: AccionHistorialCuota;
        datosPrevios?: any;
        datosNuevos: any;
        usuario?: string;
        motivoCambio?: string;
    }, tx?: Prisma.TransactionClient): Promise<HistorialAjusteCuota>;
    findById(id: number): Promise<HistorialAjusteCuota | null>;
    findByAjusteId(ajusteId: number): Promise<HistorialAjusteCuota[]>;
    findByCuotaId(cuotaId: number): Promise<HistorialAjusteCuota[]>;
    findByPersonaId(personaId: number, filters?: {
        accion?: AccionHistorialCuota;
        fechaDesde?: Date;
        fechaHasta?: Date;
        limit?: number;
    }): Promise<HistorialAjusteCuota[]>;
    findAll(filters?: {
        accion?: AccionHistorialCuota;
        personaId?: number;
        cuotaId?: number;
        ajusteId?: number;
        fechaDesde?: Date;
        fechaHasta?: Date;
        limit?: number;
        offset?: number;
    }): Promise<{
        data: HistorialAjusteCuota[];
        total: number;
    }>;
    getStats(filters?: {
        personaId?: number;
        fechaDesde?: Date;
        fechaHasta?: Date;
    }): Promise<{
        total: number;
        porAccion: Record<AccionHistorialCuota, number>;
        ultimaModificacion?: Date;
    }>;
    deleteOlderThan(date: Date): Promise<number>;
}
//# sourceMappingURL=historial-ajuste-cuota.repository.d.ts.map