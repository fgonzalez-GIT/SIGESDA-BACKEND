import { PrismaClient, AjusteCuotaSocio, Prisma, TipoAjusteCuota, ScopeAjusteCuota } from '@prisma/client';
export declare class AjusteCuotaRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(data: Omit<Prisma.AjusteCuotaSocioCreateInput, 'persona' | 'historial'> & {
        personaId: number;
    }, tx?: Prisma.TransactionClient): Promise<AjusteCuotaSocio>;
    findById(id: number): Promise<AjusteCuotaSocio | null>;
    findByPersonaId(personaId: number, soloActivos?: boolean): Promise<AjusteCuotaSocio[]>;
    findActiveByPersonaAndPeriodo(personaId: number, fecha: Date): Promise<AjusteCuotaSocio[]>;
    findAll(filters?: {
        personaId?: number;
        tipoAjuste?: TipoAjusteCuota;
        activo?: boolean;
        aplicaA?: ScopeAjusteCuota;
        fechaDesde?: Date;
        fechaHasta?: Date;
    }): Promise<AjusteCuotaSocio[]>;
    update(id: number, data: Partial<Prisma.AjusteCuotaSocioUpdateInput>, tx?: Prisma.TransactionClient): Promise<AjusteCuotaSocio>;
    deactivate(id: number, tx?: Prisma.TransactionClient): Promise<AjusteCuotaSocio>;
    activate(id: number, tx?: Prisma.TransactionClient): Promise<AjusteCuotaSocio>;
    delete(id: number, tx?: Prisma.TransactionClient): Promise<AjusteCuotaSocio>;
    getStats(personaId?: number): Promise<{
        total: number;
        activos: number;
        porTipo: Record<TipoAjusteCuota, number>;
        porScope: Record<ScopeAjusteCuota, number>;
    }>;
}
//# sourceMappingURL=ajuste-cuota.repository.d.ts.map