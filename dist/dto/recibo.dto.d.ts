import { z } from 'zod';
export declare const createReciboSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    tipo: z.ZodNativeEnum<{
        CUOTA: "CUOTA";
        SUELDO: "SUELDO";
        DEUDA: "DEUDA";
        PAGO_ACTIVIDAD: "PAGO_ACTIVIDAD";
    }>;
    importe: z.ZodNumber;
    fecha: z.ZodOptional<z.ZodString>;
    fechaVencimiento: z.ZodOptional<z.ZodString>;
    concepto: z.ZodString;
    observaciones: z.ZodOptional<z.ZodString>;
    emisorId: z.ZodOptional<z.ZodString>;
    receptorId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tipo: "CUOTA" | "SUELDO" | "DEUDA" | "PAGO_ACTIVIDAD";
    importe: number;
    concepto: string;
    observaciones?: string | undefined;
    fecha?: string | undefined;
    fechaVencimiento?: string | undefined;
    emisorId?: string | undefined;
    receptorId?: string | undefined;
}, {
    tipo: "CUOTA" | "SUELDO" | "DEUDA" | "PAGO_ACTIVIDAD";
    importe: number;
    concepto: string;
    observaciones?: string | undefined;
    fecha?: string | undefined;
    fechaVencimiento?: string | undefined;
    emisorId?: string | undefined;
    receptorId?: string | undefined;
}>, {
    tipo: "CUOTA" | "SUELDO" | "DEUDA" | "PAGO_ACTIVIDAD";
    importe: number;
    concepto: string;
    observaciones?: string | undefined;
    fecha?: string | undefined;
    fechaVencimiento?: string | undefined;
    emisorId?: string | undefined;
    receptorId?: string | undefined;
}, {
    tipo: "CUOTA" | "SUELDO" | "DEUDA" | "PAGO_ACTIVIDAD";
    importe: number;
    concepto: string;
    observaciones?: string | undefined;
    fecha?: string | undefined;
    fechaVencimiento?: string | undefined;
    emisorId?: string | undefined;
    receptorId?: string | undefined;
}>, {
    tipo: "CUOTA" | "SUELDO" | "DEUDA" | "PAGO_ACTIVIDAD";
    importe: number;
    concepto: string;
    observaciones?: string | undefined;
    fecha?: string | undefined;
    fechaVencimiento?: string | undefined;
    emisorId?: string | undefined;
    receptorId?: string | undefined;
}, {
    tipo: "CUOTA" | "SUELDO" | "DEUDA" | "PAGO_ACTIVIDAD";
    importe: number;
    concepto: string;
    observaciones?: string | undefined;
    fecha?: string | undefined;
    fechaVencimiento?: string | undefined;
    emisorId?: string | undefined;
    receptorId?: string | undefined;
}>;
export declare const updateReciboSchema: z.ZodEffects<z.ZodObject<{
    tipo: z.ZodOptional<z.ZodNativeEnum<{
        CUOTA: "CUOTA";
        SUELDO: "SUELDO";
        DEUDA: "DEUDA";
        PAGO_ACTIVIDAD: "PAGO_ACTIVIDAD";
    }>>;
    importe: z.ZodOptional<z.ZodNumber>;
    fecha: z.ZodOptional<z.ZodString>;
    fechaVencimiento: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    estado: z.ZodOptional<z.ZodNativeEnum<{
        PENDIENTE: "PENDIENTE";
        PAGADO: "PAGADO";
        VENCIDO: "VENCIDO";
        CANCELADO: "CANCELADO";
    }>>;
    concepto: z.ZodOptional<z.ZodString>;
    observaciones: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    emisorId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    receptorId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    observaciones?: string | null | undefined;
    tipo?: "CUOTA" | "SUELDO" | "DEUDA" | "PAGO_ACTIVIDAD" | undefined;
    importe?: number | undefined;
    fecha?: string | undefined;
    fechaVencimiento?: string | null | undefined;
    estado?: "PENDIENTE" | "PAGADO" | "VENCIDO" | "CANCELADO" | undefined;
    concepto?: string | undefined;
    emisorId?: string | null | undefined;
    receptorId?: string | null | undefined;
}, {
    observaciones?: string | null | undefined;
    tipo?: "CUOTA" | "SUELDO" | "DEUDA" | "PAGO_ACTIVIDAD" | undefined;
    importe?: number | undefined;
    fecha?: string | undefined;
    fechaVencimiento?: string | null | undefined;
    estado?: "PENDIENTE" | "PAGADO" | "VENCIDO" | "CANCELADO" | undefined;
    concepto?: string | undefined;
    emisorId?: string | null | undefined;
    receptorId?: string | null | undefined;
}>, {
    observaciones?: string | null | undefined;
    tipo?: "CUOTA" | "SUELDO" | "DEUDA" | "PAGO_ACTIVIDAD" | undefined;
    importe?: number | undefined;
    fecha?: string | undefined;
    fechaVencimiento?: string | null | undefined;
    estado?: "PENDIENTE" | "PAGADO" | "VENCIDO" | "CANCELADO" | undefined;
    concepto?: string | undefined;
    emisorId?: string | null | undefined;
    receptorId?: string | null | undefined;
}, {
    observaciones?: string | null | undefined;
    tipo?: "CUOTA" | "SUELDO" | "DEUDA" | "PAGO_ACTIVIDAD" | undefined;
    importe?: number | undefined;
    fecha?: string | undefined;
    fechaVencimiento?: string | null | undefined;
    estado?: "PENDIENTE" | "PAGADO" | "VENCIDO" | "CANCELADO" | undefined;
    concepto?: string | undefined;
    emisorId?: string | null | undefined;
    receptorId?: string | null | undefined;
}>;
export declare const changeEstadoReciboSchema: z.ZodObject<{
    nuevoEstado: z.ZodNativeEnum<{
        PENDIENTE: "PENDIENTE";
        PAGADO: "PAGADO";
        VENCIDO: "VENCIDO";
        CANCELADO: "CANCELADO";
    }>;
    observaciones: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    nuevoEstado: "PENDIENTE" | "PAGADO" | "VENCIDO" | "CANCELADO";
    observaciones?: string | undefined;
}, {
    nuevoEstado: "PENDIENTE" | "PAGADO" | "VENCIDO" | "CANCELADO";
    observaciones?: string | undefined;
}>;
export declare const reciboQuerySchema: z.ZodObject<{
    tipo: z.ZodOptional<z.ZodNativeEnum<{
        CUOTA: "CUOTA";
        SUELDO: "SUELDO";
        DEUDA: "DEUDA";
        PAGO_ACTIVIDAD: "PAGO_ACTIVIDAD";
    }>>;
    estado: z.ZodOptional<z.ZodNativeEnum<{
        PENDIENTE: "PENDIENTE";
        PAGADO: "PAGADO";
        VENCIDO: "VENCIDO";
        CANCELADO: "CANCELADO";
    }>>;
    emisorId: z.ZodOptional<z.ZodString>;
    receptorId: z.ZodOptional<z.ZodString>;
    fechaDesde: z.ZodOptional<z.ZodString>;
    fechaHasta: z.ZodOptional<z.ZodString>;
    vencidosOnly: z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, unknown>;
    pendientesOnly: z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, unknown>;
    importeMinimo: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    importeMaximo: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    page: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
    limit: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    vencidosOnly: boolean;
    pendientesOnly: boolean;
    tipo?: "CUOTA" | "SUELDO" | "DEUDA" | "PAGO_ACTIVIDAD" | undefined;
    estado?: "PENDIENTE" | "PAGADO" | "VENCIDO" | "CANCELADO" | undefined;
    emisorId?: string | undefined;
    receptorId?: string | undefined;
    fechaDesde?: string | undefined;
    fechaHasta?: string | undefined;
    importeMinimo?: number | undefined;
    importeMaximo?: number | undefined;
}, {
    page?: unknown;
    limit?: unknown;
    tipo?: "CUOTA" | "SUELDO" | "DEUDA" | "PAGO_ACTIVIDAD" | undefined;
    estado?: "PENDIENTE" | "PAGADO" | "VENCIDO" | "CANCELADO" | undefined;
    emisorId?: string | undefined;
    receptorId?: string | undefined;
    fechaDesde?: string | undefined;
    fechaHasta?: string | undefined;
    vencidosOnly?: unknown;
    pendientesOnly?: unknown;
    importeMinimo?: unknown;
    importeMaximo?: unknown;
}>;
export declare const createBulkRecibosSchema: z.ZodObject<{
    recibos: z.ZodArray<z.ZodEffects<z.ZodEffects<z.ZodObject<{
        tipo: z.ZodNativeEnum<{
            CUOTA: "CUOTA";
            SUELDO: "SUELDO";
            DEUDA: "DEUDA";
            PAGO_ACTIVIDAD: "PAGO_ACTIVIDAD";
        }>;
        importe: z.ZodNumber;
        fecha: z.ZodOptional<z.ZodString>;
        fechaVencimiento: z.ZodOptional<z.ZodString>;
        concepto: z.ZodString;
        observaciones: z.ZodOptional<z.ZodString>;
        emisorId: z.ZodOptional<z.ZodString>;
        receptorId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        tipo: "CUOTA" | "SUELDO" | "DEUDA" | "PAGO_ACTIVIDAD";
        importe: number;
        concepto: string;
        observaciones?: string | undefined;
        fecha?: string | undefined;
        fechaVencimiento?: string | undefined;
        emisorId?: string | undefined;
        receptorId?: string | undefined;
    }, {
        tipo: "CUOTA" | "SUELDO" | "DEUDA" | "PAGO_ACTIVIDAD";
        importe: number;
        concepto: string;
        observaciones?: string | undefined;
        fecha?: string | undefined;
        fechaVencimiento?: string | undefined;
        emisorId?: string | undefined;
        receptorId?: string | undefined;
    }>, {
        tipo: "CUOTA" | "SUELDO" | "DEUDA" | "PAGO_ACTIVIDAD";
        importe: number;
        concepto: string;
        observaciones?: string | undefined;
        fecha?: string | undefined;
        fechaVencimiento?: string | undefined;
        emisorId?: string | undefined;
        receptorId?: string | undefined;
    }, {
        tipo: "CUOTA" | "SUELDO" | "DEUDA" | "PAGO_ACTIVIDAD";
        importe: number;
        concepto: string;
        observaciones?: string | undefined;
        fecha?: string | undefined;
        fechaVencimiento?: string | undefined;
        emisorId?: string | undefined;
        receptorId?: string | undefined;
    }>, {
        tipo: "CUOTA" | "SUELDO" | "DEUDA" | "PAGO_ACTIVIDAD";
        importe: number;
        concepto: string;
        observaciones?: string | undefined;
        fecha?: string | undefined;
        fechaVencimiento?: string | undefined;
        emisorId?: string | undefined;
        receptorId?: string | undefined;
    }, {
        tipo: "CUOTA" | "SUELDO" | "DEUDA" | "PAGO_ACTIVIDAD";
        importe: number;
        concepto: string;
        observaciones?: string | undefined;
        fecha?: string | undefined;
        fechaVencimiento?: string | undefined;
        emisorId?: string | undefined;
        receptorId?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    recibos: {
        tipo: "CUOTA" | "SUELDO" | "DEUDA" | "PAGO_ACTIVIDAD";
        importe: number;
        concepto: string;
        observaciones?: string | undefined;
        fecha?: string | undefined;
        fechaVencimiento?: string | undefined;
        emisorId?: string | undefined;
        receptorId?: string | undefined;
    }[];
}, {
    recibos: {
        tipo: "CUOTA" | "SUELDO" | "DEUDA" | "PAGO_ACTIVIDAD";
        importe: number;
        concepto: string;
        observaciones?: string | undefined;
        fecha?: string | undefined;
        fechaVencimiento?: string | undefined;
        emisorId?: string | undefined;
        receptorId?: string | undefined;
    }[];
}>;
export declare const deleteBulkRecibosSchema: z.ZodObject<{
    ids: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    ids: string[];
}, {
    ids: string[];
}>;
export declare const updateBulkEstadosSchema: z.ZodObject<{
    ids: z.ZodArray<z.ZodString, "many">;
    nuevoEstado: z.ZodNativeEnum<{
        PENDIENTE: "PENDIENTE";
        PAGADO: "PAGADO";
        VENCIDO: "VENCIDO";
        CANCELADO: "CANCELADO";
    }>;
    observaciones: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    ids: string[];
    nuevoEstado: "PENDIENTE" | "PAGADO" | "VENCIDO" | "CANCELADO";
    observaciones?: string | undefined;
}, {
    ids: string[];
    nuevoEstado: "PENDIENTE" | "PAGADO" | "VENCIDO" | "CANCELADO";
    observaciones?: string | undefined;
}>;
export declare const reciboSearchSchema: z.ZodObject<{
    search: z.ZodString;
    searchBy: z.ZodDefault<z.ZodEnum<["numero", "concepto", "emisor", "receptor", "all"]>>;
    tipo: z.ZodOptional<z.ZodNativeEnum<{
        CUOTA: "CUOTA";
        SUELDO: "SUELDO";
        DEUDA: "DEUDA";
        PAGO_ACTIVIDAD: "PAGO_ACTIVIDAD";
    }>>;
    estado: z.ZodOptional<z.ZodNativeEnum<{
        PENDIENTE: "PENDIENTE";
        PAGADO: "PAGADO";
        VENCIDO: "VENCIDO";
        CANCELADO: "CANCELADO";
    }>>;
    fechaDesde: z.ZodOptional<z.ZodString>;
    fechaHasta: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    search: string;
    searchBy: "numero" | "concepto" | "emisor" | "receptor" | "all";
    tipo?: "CUOTA" | "SUELDO" | "DEUDA" | "PAGO_ACTIVIDAD" | undefined;
    estado?: "PENDIENTE" | "PAGADO" | "VENCIDO" | "CANCELADO" | undefined;
    fechaDesde?: string | undefined;
    fechaHasta?: string | undefined;
}, {
    search: string;
    tipo?: "CUOTA" | "SUELDO" | "DEUDA" | "PAGO_ACTIVIDAD" | undefined;
    estado?: "PENDIENTE" | "PAGADO" | "VENCIDO" | "CANCELADO" | undefined;
    fechaDesde?: string | undefined;
    fechaHasta?: string | undefined;
    searchBy?: "numero" | "concepto" | "emisor" | "receptor" | "all" | undefined;
}>;
export declare const reciboStatsSchema: z.ZodEffects<z.ZodObject<{
    fechaDesde: z.ZodString;
    fechaHasta: z.ZodString;
    agruparPor: z.ZodDefault<z.ZodEnum<["tipo", "estado", "mes", "persona"]>>;
}, "strip", z.ZodTypeAny, {
    fechaDesde: string;
    fechaHasta: string;
    agruparPor: "persona" | "tipo" | "estado" | "mes";
}, {
    fechaDesde: string;
    fechaHasta: string;
    agruparPor?: "persona" | "tipo" | "estado" | "mes" | undefined;
}>, {
    fechaDesde: string;
    fechaHasta: string;
    agruparPor: "persona" | "tipo" | "estado" | "mes";
}, {
    fechaDesde: string;
    fechaHasta: string;
    agruparPor?: "persona" | "tipo" | "estado" | "mes" | undefined;
}>;
export declare const processPaymentSchema: z.ZodEffects<z.ZodObject<{
    reciboId: z.ZodString;
    mediosPago: z.ZodArray<z.ZodObject<{
        tipo: z.ZodEnum<["EFECTIVO", "TRANSFERENCIA", "TARJETA_DEBITO", "TARJETA_CREDITO", "CHEQUE"]>;
        importe: z.ZodNumber;
        numero: z.ZodOptional<z.ZodString>;
        fecha: z.ZodOptional<z.ZodString>;
        banco: z.ZodOptional<z.ZodString>;
        observaciones: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        tipo: "EFECTIVO" | "TRANSFERENCIA" | "TARJETA_DEBITO" | "TARJETA_CREDITO" | "CHEQUE";
        importe: number;
        observaciones?: string | undefined;
        numero?: string | undefined;
        fecha?: string | undefined;
        banco?: string | undefined;
    }, {
        tipo: "EFECTIVO" | "TRANSFERENCIA" | "TARJETA_DEBITO" | "TARJETA_CREDITO" | "CHEQUE";
        importe: number;
        observaciones?: string | undefined;
        numero?: string | undefined;
        fecha?: string | undefined;
        banco?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    mediosPago: {
        tipo: "EFECTIVO" | "TRANSFERENCIA" | "TARJETA_DEBITO" | "TARJETA_CREDITO" | "CHEQUE";
        importe: number;
        observaciones?: string | undefined;
        numero?: string | undefined;
        fecha?: string | undefined;
        banco?: string | undefined;
    }[];
    reciboId: string;
}, {
    mediosPago: {
        tipo: "EFECTIVO" | "TRANSFERENCIA" | "TARJETA_DEBITO" | "TARJETA_CREDITO" | "CHEQUE";
        importe: number;
        observaciones?: string | undefined;
        numero?: string | undefined;
        fecha?: string | undefined;
        banco?: string | undefined;
    }[];
    reciboId: string;
}>, {
    mediosPago: {
        tipo: "EFECTIVO" | "TRANSFERENCIA" | "TARJETA_DEBITO" | "TARJETA_CREDITO" | "CHEQUE";
        importe: number;
        observaciones?: string | undefined;
        numero?: string | undefined;
        fecha?: string | undefined;
        banco?: string | undefined;
    }[];
    reciboId: string;
}, {
    mediosPago: {
        tipo: "EFECTIVO" | "TRANSFERENCIA" | "TARJETA_DEBITO" | "TARJETA_CREDITO" | "CHEQUE";
        importe: number;
        observaciones?: string | undefined;
        numero?: string | undefined;
        fecha?: string | undefined;
        banco?: string | undefined;
    }[];
    reciboId: string;
}>;
export declare const generateReportSchema: z.ZodObject<{
    tipo: z.ZodEnum<["resumen", "detallado", "vencimientos", "cobranzas"]>;
    fechaDesde: z.ZodString;
    fechaHasta: z.ZodString;
    filtros: z.ZodOptional<z.ZodObject<{
        tipos: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<{
            CUOTA: "CUOTA";
            SUELDO: "SUELDO";
            DEUDA: "DEUDA";
            PAGO_ACTIVIDAD: "PAGO_ACTIVIDAD";
        }>, "many">>;
        estados: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<{
            PENDIENTE: "PENDIENTE";
            PAGADO: "PAGADO";
            VENCIDO: "VENCIDO";
            CANCELADO: "CANCELADO";
        }>, "many">>;
        personas: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        tipos?: ("CUOTA" | "SUELDO" | "DEUDA" | "PAGO_ACTIVIDAD")[] | undefined;
        personas?: string[] | undefined;
        estados?: ("PENDIENTE" | "PAGADO" | "VENCIDO" | "CANCELADO")[] | undefined;
    }, {
        tipos?: ("CUOTA" | "SUELDO" | "DEUDA" | "PAGO_ACTIVIDAD")[] | undefined;
        personas?: string[] | undefined;
        estados?: ("PENDIENTE" | "PAGADO" | "VENCIDO" | "CANCELADO")[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    tipo: "resumen" | "detallado" | "vencimientos" | "cobranzas";
    fechaDesde: string;
    fechaHasta: string;
    filtros?: {
        tipos?: ("CUOTA" | "SUELDO" | "DEUDA" | "PAGO_ACTIVIDAD")[] | undefined;
        personas?: string[] | undefined;
        estados?: ("PENDIENTE" | "PAGADO" | "VENCIDO" | "CANCELADO")[] | undefined;
    } | undefined;
}, {
    tipo: "resumen" | "detallado" | "vencimientos" | "cobranzas";
    fechaDesde: string;
    fechaHasta: string;
    filtros?: {
        tipos?: ("CUOTA" | "SUELDO" | "DEUDA" | "PAGO_ACTIVIDAD")[] | undefined;
        personas?: string[] | undefined;
        estados?: ("PENDIENTE" | "PAGADO" | "VENCIDO" | "CANCELADO")[] | undefined;
    } | undefined;
}>;
export type CreateReciboDto = z.infer<typeof createReciboSchema>;
export type UpdateReciboDto = z.infer<typeof updateReciboSchema>;
export type ChangeEstadoReciboDto = z.infer<typeof changeEstadoReciboSchema>;
export type ReciboQueryDto = z.infer<typeof reciboQuerySchema>;
export type CreateBulkRecibosDto = z.infer<typeof createBulkRecibosSchema>;
export type DeleteBulkRecibosDto = z.infer<typeof deleteBulkRecibosSchema>;
export type UpdateBulkEstadosDto = z.infer<typeof updateBulkEstadosSchema>;
export type ReciboSearchDto = z.infer<typeof reciboSearchSchema>;
export type ReciboStatsDto = z.infer<typeof reciboStatsSchema>;
export type ProcessPaymentDto = z.infer<typeof processPaymentSchema>;
export type GenerateReportDto = z.infer<typeof generateReportSchema>;
//# sourceMappingURL=recibo.dto.d.ts.map