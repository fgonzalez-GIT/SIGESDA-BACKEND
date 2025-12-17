import { Prisma } from '@prisma/client';
export declare class ItemCuotaRepository {
    findByCuotaId(cuotaId: number): Promise<({
        tipoItem: {
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
        };
    } & {
        observaciones: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        concepto: string;
        cuotaId: number;
        cantidad: Prisma.Decimal;
        monto: Prisma.Decimal;
        tipoItemId: number;
        porcentaje: Prisma.Decimal | null;
        esAutomatico: boolean;
        esEditable: boolean;
        metadata: Prisma.JsonValue | null;
    })[]>;
    findById(id: number): Promise<({
        cuota: {
            recibo: {
                observaciones: string | null;
                tipo: import(".prisma/client").$Enums.TipoRecibo;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                numero: string;
                importe: Prisma.Decimal;
                fecha: Date;
                fechaVencimiento: Date | null;
                estado: import(".prisma/client").$Enums.EstadoRecibo;
                concepto: string;
                emisorId: number | null;
                receptorId: number | null;
            };
            categoria: {
                codigo: string;
                nombre: string;
                descripcion: string | null;
                orden: number;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                descuento: Prisma.Decimal;
                activa: boolean;
                montoCuota: Prisma.Decimal;
            };
        } & {
            categoriaId: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            mes: number;
            reciboId: number;
            anio: number;
            montoBase: Prisma.Decimal | null;
            montoActividades: Prisma.Decimal | null;
            montoTotal: Prisma.Decimal;
        };
        tipoItem: {
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
        };
    } & {
        observaciones: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        concepto: string;
        cuotaId: number;
        cantidad: Prisma.Decimal;
        monto: Prisma.Decimal;
        tipoItemId: number;
        porcentaje: Prisma.Decimal | null;
        esAutomatico: boolean;
        esEditable: boolean;
        metadata: Prisma.JsonValue | null;
    }) | null>;
    create(data: Prisma.ItemCuotaCreateInput): Promise<{
        tipoItem: {
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
        };
    } & {
        observaciones: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        concepto: string;
        cuotaId: number;
        cantidad: Prisma.Decimal;
        monto: Prisma.Decimal;
        tipoItemId: number;
        porcentaje: Prisma.Decimal | null;
        esAutomatico: boolean;
        esEditable: boolean;
        metadata: Prisma.JsonValue | null;
    }>;
    createMany(items: Prisma.ItemCuotaCreateManyInput[]): Promise<Prisma.BatchPayload>;
    update(id: number, data: Prisma.ItemCuotaUpdateInput): Promise<{
        tipoItem: {
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
        };
    } & {
        observaciones: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        concepto: string;
        cuotaId: number;
        cantidad: Prisma.Decimal;
        monto: Prisma.Decimal;
        tipoItemId: number;
        porcentaje: Prisma.Decimal | null;
        esAutomatico: boolean;
        esEditable: boolean;
        metadata: Prisma.JsonValue | null;
    }>;
    delete(id: number): Promise<{
        observaciones: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        concepto: string;
        cuotaId: number;
        cantidad: Prisma.Decimal;
        monto: Prisma.Decimal;
        tipoItemId: number;
        porcentaje: Prisma.Decimal | null;
        esAutomatico: boolean;
        esEditable: boolean;
        metadata: Prisma.JsonValue | null;
    }>;
    deleteByCuotaId(cuotaId: number): Promise<Prisma.BatchPayload>;
    countByCuotaId(cuotaId: number): Promise<number>;
    getSummaryByCuotaId(cuotaId: number): Promise<{
        base: number;
        actividades: number;
        descuentos: number;
        recargos: number;
        bonificaciones: number;
        otros: number;
        total: number;
        itemsCount: number;
    }>;
    findAutomaticosByCuotaId(cuotaId: number): Promise<({
        tipoItem: {
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
        };
    } & {
        observaciones: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        concepto: string;
        cuotaId: number;
        cantidad: Prisma.Decimal;
        monto: Prisma.Decimal;
        tipoItemId: number;
        porcentaje: Prisma.Decimal | null;
        esAutomatico: boolean;
        esEditable: boolean;
        metadata: Prisma.JsonValue | null;
    })[]>;
    findManualesByCuotaId(cuotaId: number): Promise<({
        tipoItem: {
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
        };
    } & {
        observaciones: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        concepto: string;
        cuotaId: number;
        cantidad: Prisma.Decimal;
        monto: Prisma.Decimal;
        tipoItemId: number;
        porcentaje: Prisma.Decimal | null;
        esAutomatico: boolean;
        esEditable: boolean;
        metadata: Prisma.JsonValue | null;
    })[]>;
    findEditablesByCuotaId(cuotaId: number): Promise<({
        tipoItem: {
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
        };
    } & {
        observaciones: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        concepto: string;
        cuotaId: number;
        cantidad: Prisma.Decimal;
        monto: Prisma.Decimal;
        tipoItemId: number;
        porcentaje: Prisma.Decimal | null;
        esAutomatico: boolean;
        esEditable: boolean;
        metadata: Prisma.JsonValue | null;
    })[]>;
    findByTipoItemCodigo(codigo: string, options?: {
        limit?: number;
        offset?: number;
    }): Promise<({
        cuota: {
            recibo: {
                observaciones: string | null;
                tipo: import(".prisma/client").$Enums.TipoRecibo;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                numero: string;
                importe: Prisma.Decimal;
                fecha: Date;
                fechaVencimiento: Date | null;
                estado: import(".prisma/client").$Enums.EstadoRecibo;
                concepto: string;
                emisorId: number | null;
                receptorId: number | null;
            };
        } & {
            categoriaId: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            mes: number;
            reciboId: number;
            anio: number;
            montoBase: Prisma.Decimal | null;
            montoActividades: Prisma.Decimal | null;
            montoTotal: Prisma.Decimal;
        };
        tipoItem: {
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
        };
    } & {
        observaciones: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        concepto: string;
        cuotaId: number;
        cantidad: Prisma.Decimal;
        monto: Prisma.Decimal;
        tipoItemId: number;
        porcentaje: Prisma.Decimal | null;
        esAutomatico: boolean;
        esEditable: boolean;
        metadata: Prisma.JsonValue | null;
    })[]>;
    findByCategoriaCodigo(codigo: string, options?: {
        limit?: number;
        offset?: number;
    }): Promise<({
        cuota: {
            categoriaId: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            mes: number;
            reciboId: number;
            anio: number;
            montoBase: Prisma.Decimal | null;
            montoActividades: Prisma.Decimal | null;
            montoTotal: Prisma.Decimal;
        };
        tipoItem: {
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
        };
    } & {
        observaciones: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        concepto: string;
        cuotaId: number;
        cantidad: Prisma.Decimal;
        monto: Prisma.Decimal;
        tipoItemId: number;
        porcentaje: Prisma.Decimal | null;
        esAutomatico: boolean;
        esEditable: boolean;
        metadata: Prisma.JsonValue | null;
    })[]>;
    calculateTotalByCuotaId(cuotaId: number): Promise<number>;
    replaceAllByCuotaId(cuotaId: number, newItems: Prisma.ItemCuotaCreateManyInput[]): Promise<({
        tipoItem: {
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
        };
    } & {
        observaciones: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        concepto: string;
        cuotaId: number;
        cantidad: Prisma.Decimal;
        monto: Prisma.Decimal;
        tipoItemId: number;
        porcentaje: Prisma.Decimal | null;
        esAutomatico: boolean;
        esEditable: boolean;
        metadata: Prisma.JsonValue | null;
    })[]>;
    getGlobalStats(): Promise<{
        totalItems: number;
        totalAutomaticos: number;
        totalManuales: number;
        montoTotal: number;
        promedioMonto: number;
        itemsPorTipo: number;
    }>;
    hasItems(cuotaId: number): Promise<boolean>;
    getDesgloseByCuotaId(cuotaId: number): Promise<{
        cuotaId: number;
        items: {
            id: number;
            tipo: string;
            nombre: string;
            categoria: string;
            categoriaIcono: string | null;
            concepto: string;
            monto: number;
            cantidad: number;
            porcentaje: number | null;
            esAutomatico: boolean;
            esEditable: boolean;
            observaciones: string | null;
            metadata: Prisma.JsonValue;
        }[];
        resumen: {
            base: number;
            actividades: number;
            descuentos: number;
            recargos: number;
            bonificaciones: number;
            otros: number;
            total: number;
            itemsCount: number;
        };
        totalItems: number;
    }>;
}
//# sourceMappingURL=item-cuota.repository.d.ts.map