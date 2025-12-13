import { Prisma } from '@prisma/client';
export declare class CategoriaItemRepository {
    findAll(options?: {
        includeInactive?: boolean;
    }): Promise<{
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
    }[]>;
    findById(id: number): Promise<({
        tiposItems: {
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
        }[];
    } & {
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
    }) | null>;
    findByCodigo(codigo: string): Promise<({
        tiposItems: {
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
        }[];
    } & {
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
    }) | null>;
    create(data: Prisma.CategoriaItemCreateInput): Promise<{
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
    }>;
    update(id: number, data: Prisma.CategoriaItemUpdateInput): Promise<{
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
    }>;
    softDelete(id: number): Promise<{
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
    }>;
    delete(id: number): Promise<{
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
    }>;
    hasTiposItems(id: number): Promise<boolean>;
    countActive(): Promise<number>;
    getUsageStats(id: number): Promise<{
        categoria: {
            id: number;
            codigo: string;
            nombre: string;
        };
        totalTipos: number;
        tiposActivos: number;
        tiposInactivos: number;
        totalItemsGenerados: number;
    } | null>;
}
//# sourceMappingURL=categoria-item.repository.d.ts.map