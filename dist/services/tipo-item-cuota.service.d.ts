export declare class TipoItemCuotaService {
    private repository;
    private categoriaRepository;
    constructor();
    getAll(options?: {
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
        formula: import("@prisma/client/runtime/library").JsonValue | null;
        configurable: boolean;
    })[]>;
    getById(id: number): Promise<{
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
            cuotaId: number;
            cantidad: import("@prisma/client/runtime/library").Decimal;
            monto: import("@prisma/client/runtime/library").Decimal;
            tipoItemId: number;
            porcentaje: import("@prisma/client/runtime/library").Decimal | null;
            esAutomatico: boolean;
            esEditable: boolean;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
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
        formula: import("@prisma/client/runtime/library").JsonValue | null;
        configurable: boolean;
    }>;
    getByCodigo(codigo: string): Promise<{
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
        formula: import("@prisma/client/runtime/library").JsonValue | null;
        configurable: boolean;
    }>;
    getByCategoriaCodigo(categoriaCodigo: string, includeInactive?: boolean): Promise<({
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
        formula: import("@prisma/client/runtime/library").JsonValue | null;
        configurable: boolean;
    })[]>;
    getCalculados(includeInactive?: boolean): Promise<({
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
        formula: import("@prisma/client/runtime/library").JsonValue | null;
        configurable: boolean;
    })[]>;
    getManuales(includeInactive?: boolean): Promise<({
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
        formula: import("@prisma/client/runtime/library").JsonValue | null;
        configurable: boolean;
    })[]>;
    create(data: {
        codigo: string;
        nombre: string;
        descripcion?: string;
        categoriaItemId: number;
        esCalculado?: boolean;
        formula?: any;
        orden?: number;
        configurable?: boolean;
    }): Promise<{
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
        formula: import("@prisma/client/runtime/library").JsonValue | null;
        configurable: boolean;
    }>;
    update(id: number, data: {
        nombre?: string;
        descripcion?: string;
        categoriaItemId?: number;
        esCalculado?: boolean;
        formula?: any;
        orden?: number;
        configurable?: boolean;
        activo?: boolean;
    }): Promise<{
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
        formula: import("@prisma/client/runtime/library").JsonValue | null;
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
        formula: import("@prisma/client/runtime/library").JsonValue | null;
        configurable: boolean;
    }>;
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
        formula: import("@prisma/client/runtime/library").JsonValue | null;
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
        formula: import("@prisma/client/runtime/library").JsonValue | null;
        configurable: boolean;
    }>;
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
        formula: import("@prisma/client/runtime/library").JsonValue | null;
        configurable: boolean;
    }>;
    reorder(ordenamiento: Array<{
        id: number;
        orden: number;
    }>): Promise<{
        success: boolean;
        updated: number;
    }>;
    validateForUse(id: number): Promise<boolean>;
    getSummaryByCategoria(): Promise<{
        categorias: {
            categoria: {
                id: number;
                codigo: string;
                nombre: string;
                icono: string | null;
                color: string | null;
            };
            tipos: {
                id: number;
                codigo: string;
                nombre: string;
                esCalculado: boolean;
                orden: number;
            }[];
            totalTipos: number;
        }[];
        totalCategorias: number;
        totalTipos: number;
    }>;
    clone(id: number, nuevoCodigo: string, nuevoNombre: string): Promise<{
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
        formula: import("@prisma/client/runtime/library").JsonValue | null;
        configurable: boolean;
    }>;
}
//# sourceMappingURL=tipo-item-cuota.service.d.ts.map