"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConciliacionBancariaSchema = exports.ValidarPagoCompletoSchema = exports.DeleteBulkMediosPagoSchema = exports.MedioPagoStatsSchema = exports.MedioPagoSearchSchema = exports.MedioPagoFilterSchema = exports.UpdateMedioPagoSchema = exports.CreateMedioPagoSchema = exports.MedioPagoTipoSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.MedioPagoTipoSchema = zod_1.z.nativeEnum(client_1.MedioPagoTipo);
exports.CreateMedioPagoSchema = zod_1.z.object({
    reciboId: zod_1.z.string().cuid("ID de recibo inválido"),
    tipo: exports.MedioPagoTipoSchema,
    importe: zod_1.z.number().positive("El importe debe ser positivo"),
    numero: zod_1.z.string().optional(),
    fecha: zod_1.z.string().datetime("Fecha inválida").optional(),
    banco: zod_1.z.string().optional(),
    observaciones: zod_1.z.string().max(500, "Las observaciones no pueden exceder 500 caracteres").optional(),
}).refine((data) => {
    if (data.tipo === client_1.MedioPagoTipo.CHEQUE) {
        if (!data.numero) {
            return false;
        }
        if (!data.banco) {
            return false;
        }
    }
    if (data.tipo === client_1.MedioPagoTipo.TRANSFERENCIA) {
        if (!data.numero) {
            return false;
        }
    }
    return true;
}, {
    message: "Datos requeridos según el tipo de medio de pago",
    path: ["tipo"]
}).refine((data) => {
    if (data.numero && data.numero.trim().length === 0) {
        return false;
    }
    return true;
}, {
    message: "El número de comprobante/cheque no puede estar vacío",
    path: ["numero"]
});
exports.UpdateMedioPagoSchema = zod_1.z.object({
    tipo: exports.MedioPagoTipoSchema.optional(),
    importe: zod_1.z.number().positive("El importe debe ser positivo").optional(),
    numero: zod_1.z.string().optional(),
    fecha: zod_1.z.string().datetime("Fecha inválida").optional(),
    banco: zod_1.z.string().optional(),
    observaciones: zod_1.z.string().max(500, "Las observaciones no pueden exceder 500 caracteres").optional(),
});
exports.MedioPagoFilterSchema = zod_1.z.object({
    reciboId: zod_1.z.string().cuid().optional(),
    tipo: exports.MedioPagoTipoSchema.optional(),
    importeMinimo: zod_1.z.number().min(0).optional(),
    importeMaximo: zod_1.z.number().min(0).optional(),
    fechaDesde: zod_1.z.string().datetime().optional(),
    fechaHasta: zod_1.z.string().datetime().optional(),
    banco: zod_1.z.string().optional(),
    numero: zod_1.z.string().optional(),
    page: zod_1.z.number().int().min(1).default(1),
    limit: zod_1.z.number().int().min(1).max(100).default(10),
    orderBy: zod_1.z.enum(['fecha', 'importe', 'tipo', 'numero']).default('fecha'),
    orderDirection: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
exports.MedioPagoSearchSchema = zod_1.z.object({
    search: zod_1.z.string().min(1, "El término de búsqueda es requerido"),
    searchBy: zod_1.z.enum(['numero', 'banco', 'recibo', 'all']).default('all'),
    tipo: exports.MedioPagoTipoSchema.optional(),
    fechaDesde: zod_1.z.string().datetime().optional(),
    fechaHasta: zod_1.z.string().datetime().optional(),
});
exports.MedioPagoStatsSchema = zod_1.z.object({
    fechaDesde: zod_1.z.string().datetime(),
    fechaHasta: zod_1.z.string().datetime(),
    agruparPor: zod_1.z.enum(['tipo', 'banco', 'mes', 'general']).default('tipo'),
    reciboId: zod_1.z.string().cuid().optional(),
}).refine((data) => {
    const desde = new Date(data.fechaDesde);
    const hasta = new Date(data.fechaHasta);
    return desde < hasta;
}, {
    message: "La fecha desde debe ser anterior a la fecha hasta",
    path: ["fechaHasta"]
});
exports.DeleteBulkMediosPagoSchema = zod_1.z.object({
    ids: zod_1.z.array(zod_1.z.string().cuid())
        .min(1, "Debe proporcionar al menos un ID")
        .max(50, "No se pueden eliminar más de 50 medios de pago a la vez"),
    confirmarEliminacion: zod_1.z.boolean()
        .refine(val => val === true, {
        message: "Debe confirmar la eliminación"
    })
});
exports.ValidarPagoCompletoSchema = zod_1.z.object({
    reciboId: zod_1.z.string().cuid("ID de recibo inválido"),
    tolerancia: zod_1.z.number().min(0).max(100).default(0.01),
});
exports.ConciliacionBancariaSchema = zod_1.z.object({
    banco: zod_1.z.string().min(1, "El banco es requerido"),
    fechaDesde: zod_1.z.string().datetime(),
    fechaHasta: zod_1.z.string().datetime(),
    tipo: zod_1.z.enum(['CHEQUE', 'TRANSFERENCIA']).optional(),
});
//# sourceMappingURL=medio-pago.dto.js.map