"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.estadisticasActividadSchema = exports.asignarDocenteSchema = exports.actividadQuerySchema = exports.updateActividadSchema = exports.createActividadSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const actividadBaseSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1, 'Nombre es requerido').max(100),
    tipo: zod_1.z.nativeEnum(client_1.TipoActividad),
    descripcion: zod_1.z.string().max(500).optional(),
    precio: zod_1.z.number().min(0, 'El precio no puede ser negativo').default(0),
    duracion: zod_1.z.number().int().positive('La duración debe ser positiva').optional(),
    capacidadMaxima: zod_1.z.number().int().positive('La capacidad debe ser positiva').optional(),
    activa: zod_1.z.boolean().default(true)
});
exports.createActividadSchema = zod_1.z.object({
    ...actividadBaseSchema.shape,
    docenteIds: zod_1.z.array(zod_1.z.string().cuid()).optional().default([])
});
exports.updateActividadSchema = zod_1.z.object({
    ...actividadBaseSchema.partial().shape,
    docenteIds: zod_1.z.array(zod_1.z.string().cuid()).optional()
});
exports.actividadQuerySchema = zod_1.z.object({
    tipo: zod_1.z.nativeEnum(client_1.TipoActividad).optional(),
    activa: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            return val === 'true';
        }
        return val;
    }, zod_1.z.boolean().optional()),
    conDocentes: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            return val === 'true';
        }
        return val;
    }, zod_1.z.boolean().optional()),
    precioDesde: zod_1.z.preprocess((val) => {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().min(0).optional()),
    precioHasta: zod_1.z.preprocess((val) => {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().min(0).optional()),
    search: zod_1.z.string().optional(),
    page: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? 1 : parsed;
    }, zod_1.z.number().int().positive().default(1)),
    limit: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? 10 : parsed;
    }, zod_1.z.number().int().positive().max(100).default(10))
});
exports.asignarDocenteSchema = zod_1.z.object({
    docenteId: zod_1.z.string().cuid('ID de docente inválido'),
    actividadId: zod_1.z.string().cuid('ID de actividad inválido')
});
exports.estadisticasActividadSchema = zod_1.z.object({
    incluirParticipaciones: zod_1.z.boolean().default(true),
    incluirReservas: zod_1.z.boolean().default(false),
    fechaDesde: zod_1.z.string().datetime().optional(),
    fechaHasta: zod_1.z.string().datetime().optional()
});
//# sourceMappingURL=actividad.dto.js.map