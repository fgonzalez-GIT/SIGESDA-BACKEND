import { Prisma } from '@prisma/client';
export declare class CategoriaItemService {
    private repository;
    constructor();
    getAll(includeInactive?: boolean): Promise<{
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
    getById(id: number): Promise<{
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
    }>;
    getByCodigo(codigo: string): Promise<{
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
    }>;
    create(data: {
        codigo: string;
        nombre: string;
        descripcion?: string;
        icono?: string;
        color?: string;
        orden?: number;
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
    }>;
    update(id: number, data: {
        nombre?: string;
        descripcion?: string;
        icono?: string;
        color?: string;
        orden?: number;
        activo?: boolean;
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
    }>;
    deactivate(id: number): Promise<{
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
    activate(id: number): Promise<{
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
    }>;
    reorder(ordenamiento: Array<{
        id: number;
        orden: number;
    }>): Promise<{
        success: boolean;
        updated: number;
    }>;
    validateForUse(id: number): Promise<boolean>;
    getSummary(): Promise<{
        categorias: {
            id: number;
            codigo: string;
            nombre: string;
            icono: string | null;
            color: string | null;
            activo: boolean;
            orden: number;
            totalTipos: number;
            tiposActivos: number;
        }[];
        totalCategorias: number;
        categoriasActivas: number;
    }>;
}
//# sourceMappingURL=categoria-item.service.d.ts.map