import { PrismaClient, ExencionCuota, Prisma, TipoExencion, MotivoExencion, EstadoExencion } from '@prisma/client';
export declare class ExencionCuotaRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(data: Omit<Prisma.ExencionCuotaCreateInput, 'persona' | 'historial'> & {
        personaId: number;
    }, tx?: Prisma.TransactionClient): Promise<ExencionCuota>;
    findById(id: number): Promise<ExencionCuota | null>;
    findByPersonaId(personaId: number, soloActivas?: boolean): Promise<ExencionCuota[]>;
    findActiveByPersonaAndPeriodo(personaId: number, fecha: Date): Promise<ExencionCuota[]>;
    findAll(filters?: {
        personaId?: number;
        tipoExencion?: TipoExencion;
        motivoExencion?: MotivoExencion;
        estado?: EstadoExencion;
        activa?: boolean;
        fechaDesde?: Date;
        fechaHasta?: Date;
    }): Promise<ExencionCuota[]>;
    findPendientes(): Promise<ExencionCuota[]>;
    findVigentes(): Promise<ExencionCuota[]>;
    update(id: number, data: Partial<Prisma.ExencionCuotaUpdateInput>, tx?: Prisma.TransactionClient): Promise<ExencionCuota>;
    aprobar(id: number, aprobadoPor: string, observaciones?: string, tx?: Prisma.TransactionClient): Promise<ExencionCuota>;
    rechazar(id: number, motivoRechazo: string, tx?: Prisma.TransactionClient): Promise<ExencionCuota>;
    revocar(id: number, motivoRevocacion: string, tx?: Prisma.TransactionClient): Promise<ExencionCuota>;
    marcarVencida(id: number, tx?: Prisma.TransactionClient): Promise<ExencionCuota>;
    deactivate(id: number, tx?: Prisma.TransactionClient): Promise<ExencionCuota>;
    activate(id: number, tx?: Prisma.TransactionClient): Promise<ExencionCuota>;
    delete(id: number, tx?: Prisma.TransactionClient): Promise<ExencionCuota>;
    getStats(personaId?: number): Promise<{
        total: number;
        porEstado: Record<EstadoExencion, number>;
        porTipo: Record<TipoExencion, number>;
        porMotivo: Record<MotivoExencion, number>;
        vigentes: number;
        pendientes: number;
    }>;
    updateVencidas(): Promise<number>;
}
//# sourceMappingURL=exencion-cuota.repository.d.ts.map