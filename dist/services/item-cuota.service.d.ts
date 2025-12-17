import { Prisma } from '@prisma/client';
export declare class ItemCuotaService {
    private repository;
    private tipoRepository;
    constructor();
    getItemsByCuotaId(cuotaId: number): Promise<{
        items: ({
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
        })[];
        summary: {
            base: number;
            actividades: number;
            descuentos: number;
            recargos: number;
            bonificaciones: number;
            otros: number;
            total: number;
            itemsCount: number;
        };
    }>;
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
    getById(id: number): Promise<{
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
    }>;
    addManualItem(data: {
        cuotaId: number;
        tipoItemCodigo: string;
        concepto?: string;
        monto: number;
        cantidad?: number;
        porcentaje?: number;
        observaciones?: string;
        metadata?: any;
    }): Promise<{
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
    updateItem(itemId: number, data: {
        monto?: number;
        cantidad?: number;
        porcentaje?: number;
        concepto?: string;
        observaciones?: string;
        metadata?: any;
    }): Promise<{
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
    deleteItem(itemId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    private recalcularTotalCuota;
    regenerarItems(cuotaId: number, newItems: Array<{
        tipoItemId: number;
        concepto: string;
        monto: number;
        cantidad?: number;
        porcentaje?: number;
        esAutomatico?: boolean;
        esEditable?: boolean;
        observaciones?: string;
        metadata?: any;
    }>): Promise<{
        success: boolean;
        itemsCreados: number;
        items: ({
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
        })[];
    }>;
    getItemsSegmentadosByCuotaId(cuotaId: number): Promise<{
        automaticos: ({
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
        })[];
        manuales: ({
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
        })[];
        totalAutomaticos: number;
        totalManuales: number;
    }>;
    duplicarItem(itemId: number): Promise<{
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
    getGlobalStats(): Promise<{
        totalItems: number;
        totalAutomaticos: number;
        totalManuales: number;
        montoTotal: number;
        promedioMonto: number;
        itemsPorTipo: number;
    }>;
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
    validateCuotaEditable(cuotaId: number): Promise<boolean>;
    aplicarDescuentoGlobal(cuotaId: number, porcentaje: number, concepto?: string): Promise<{
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
}
//# sourceMappingURL=item-cuota.service.d.ts.map