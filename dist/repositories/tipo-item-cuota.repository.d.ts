import { Prisma } from '@prisma/client';
export declare class TipoItemCuotaRepository {
    findAll(options?: {
        includeInactive?: boolean;
        categoriaItemId?: number;
    }): Promise<({
        categoriaItem: {
            activo: boolean;
            codigo: string;
            nombre: string;
            descripcion: string | null;
            icono: string | null;
            orden: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            color: string | null;
        };
    } & {
        activo: boolean;
        codigo: string;
        nombre: string;
        descripcion: string | null;
        orden: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        categoriaItemId: number;
        esCalculado: boolean;
        formula: Prisma.JsonValue | null;
        configurable: boolean;
    })[]>;
    findById(id: number): Promise<({
        categoriaItem: {
            activo: boolean;
            codigo: string;
            nombre: string;
            descripcion: string | null;
            icono: string | null;
            orden: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            color: string | null;
        };
        itemsCuota: {
            observaciones: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            concepto: string;
            cantidad: Prisma.Decimal;
            monto: Prisma.Decimal;
            cuotaId: number;
            tipoItemId: number;
            porcentaje: Prisma.Decimal | null;
            esAutomatico: boolean;
            esEditable: boolean;
            metadata: Prisma.JsonValue | null;
        }[];
    } & {
        activo: boolean;
        codigo: string;
        nombre: string;
        descripcion: string | null;
        orden: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        categoriaItemId: number;
        esCalculado: boolean;
        formula: Prisma.JsonValue | null;
        configurable: boolean;
    }) | null>;
    findByCodigo(codigo: string): Promise<({
        categoriaItem: {
            activo: boolean;
            codigo: string;
            nombre: string;
            descripcion: string | null;
            icono: string | null;
            orden: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            color: string | null;
        };
    } & {
        activo: boolean;
        codigo: string;
        nombre: string;
        descripcion: string | null;
        orden: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        categoriaItemId: number;
        esCalculado: boolean;
        formula: Prisma.JsonValue | null;
        configurable: boolean;
    }) | null>;
    findByCategoriaCodigo(categoriaCodigo: string, options?: {
        includeInactive?: boolean;
    }): Promise<({
        categoriaItem: {
            activo: boolean;
            codigo: string;
            nombre: string;
            descripcion: string | null;
            icono: string | null;
            orden: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            color: string | null;
        };
    } & {
        activo: boolean;
        codigo: string;
        nombre: string;
        descripcion: string | null;
        orden: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        categoriaItemId: number;
        esCalculado: boolean;
        formula: Prisma.JsonValue | null;
        configurable: boolean;
    })[]>;
    findCalculados(options?: {
        includeInactive?: boolean;
    }): Promise<({
        categoriaItem: {
            activo: boolean;
            codigo: string;
            nombre: string;
            descripcion: string | null;
            icono: string | null;
            orden: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            color: string | null;
        };
    } & {
        activo: boolean;
        codigo: string;
        nombre: string;
        descripcion: string | null;
        orden: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        categoriaItemId: number;
        esCalculado: boolean;
        formula: Prisma.JsonValue | null;
        configurable: boolean;
    })[]>;
    findManuales(options?: {
        includeInactive?: boolean;
    }): Promise<({
        categoriaItem: {
            activo: boolean;
            codigo: string;
            nombre: string;
            descripcion: string | null;
            icono: string | null;
            orden: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            color: string | null;
        };
    } & {
        activo: boolean;
        codigo: string;
        nombre: string;
        descripcion: string | null;
        orden: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        categoriaItemId: number;
        esCalculado: boolean;
        formula: Prisma.JsonValue | null;
        configurable: boolean;
    })[]>;
    create(data: Prisma.TipoItemCuotaCreateInput): Promise<{
        categoriaItem: {
            activo: boolean;
            codigo: string;
            nombre: string;
            descripcion: string | null;
            icono: string | null;
            orden: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            color: string | null;
        };
    } & {
        activo: boolean;
        codigo: string;
        nombre: string;
        descripcion: string | null;
        orden: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        categoriaItemId: number;
        esCalculado: boolean;
        formula: Prisma.JsonValue | null;
        configurable: boolean;
    }>;
    update(id: number, data: Prisma.TipoItemCuotaUpdateInput): Promise<{
        categoriaItem: {
            activo: boolean;
            codigo: string;
            nombre: string;
            descripcion: string | null;
            icono: string | null;
            orden: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            color: string | null;
        };
    } & {
        activo: boolean;
        codigo: string;
        nombre: string;
        descripcion: string | null;
        orden: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        categoriaItemId: number;
        esCalculado: boolean;
        formula: Prisma.JsonValue | null;
        configurable: boolean;
    }>;
    softDelete(id: number): Promise<{
        activo: boolean;
        codigo: string;
        nombre: string;
        descripcion: string | null;
        orden: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        categoriaItemId: number;
        esCalculado: boolean;
        formula: Prisma.JsonValue | null;
        configurable: boolean;
    }>;
    delete(id: number): Promise<{
        activo: boolean;
        codigo: string;
        nombre: string;
        descripcion: string | null;
        orden: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        categoriaItemId: number;
        esCalculado: boolean;
        formula: Prisma.JsonValue | null;
        configurable: boolean;
    }>;
    hasItemsCuota(id: number): Promise<boolean>;
    countActive(): Promise<number>;
    countByCategoria(categoriaItemId: number): Promise<number>;
    getUsageStats(id: number): Promise<{
        tipo: {
            id: number;
            codigo: string;
            nombre: string;
            categoria: string;
        };
        totalItemsGenerados: number;
        cuotasAfectadas: number;
        montoTotalAcumulado: number;
        promedioMonto: number;
    } | null>;
    activate(id: number): Promise<{
        activo: boolean;
        codigo: string;
        nombre: string;
        descripcion: string | null;
        orden: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        categoriaItemId: number;
        esCalculado: boolean;
        formula: Prisma.JsonValue | null;
        configurable: boolean;
    }>;
    deactivate(id: number): Promise<{
        activo: boolean;
        codigo: string;
        nombre: string;
        descripcion: string | null;
        orden: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        categoriaItemId: number;
        esCalculado: boolean;
        formula: Prisma.JsonValue | null;
        configurable: boolean;
    }>;
    updateOrden(id: number, orden: number): Promise<{
        activo: boolean;
        codigo: string;
        nombre: string;
        descripcion: string | null;
        orden: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        categoriaItemId: number;
        esCalculado: boolean;
        formula: Prisma.JsonValue | null;
        configurable: boolean;
    }>;
    updateFormula(id: number, formula: any): Promise<{
        activo: boolean;
        codigo: string;
        nombre: string;
        descripcion: string | null;
        orden: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        categoriaItemId: number;
        esCalculado: boolean;
        formula: Prisma.JsonValue | null;
        configurable: boolean;
    }>;
}
//# sourceMappingURL=tipo-item-cuota.repository.d.ts.map