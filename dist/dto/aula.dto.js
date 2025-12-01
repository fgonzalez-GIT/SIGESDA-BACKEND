"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.estadisticasAulaSchema = exports.disponibilidadAulaSchema = exports.aulaQuerySchema = exports.updateAulaSchema = exports.createAulaSchema = void 0;
const zod_1 = require("zod");
const database_1 = require("@/config/database");
let TIPO_AULA_MAP = {};
let ESTADO_AULA_MAP = {};
(async () => {
    try {
        const tipos = await database_1.prisma.tipoAula.findMany({ where: { activo: true }, select: { id: true, codigo: true } });
        const estados = await database_1.prisma.estadoAula.findMany({ where: { activo: true }, select: { id: true, codigo: true } });
        TIPO_AULA_MAP = tipos.reduce((acc, t) => ({ ...acc, [t.codigo.toLowerCase()]: t.id }), {});
        ESTADO_AULA_MAP = estados.reduce((acc, e) => ({ ...acc, [e.codigo.toLowerCase()]: e.id }), {});
    }
    catch (error) {
        console.warn('No se pudieron cargar los mapas de tipos/estados de aula:', error);
    }
})();
const aulaBaseSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1, 'Nombre es requerido').max(100),
    capacidad: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            const parsed = parseInt(val);
            return isNaN(parsed) ? val : parsed;
        }
        return val;
    }, zod_1.z.number().int().positive('La capacidad debe ser positiva')),
    ubicacion: zod_1.z.string().max(200).optional(),
    tipoAulaId: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            const parsed = parseInt(val);
            return isNaN(parsed) ? undefined : parsed;
        }
        return val;
    }, zod_1.z.number().int().positive('ID de tipo de aula inválido').optional()),
    estadoAulaId: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            const parsed = parseInt(val);
            return isNaN(parsed) ? undefined : parsed;
        }
        return val;
    }, zod_1.z.number().int().positive('ID de estado de aula inválido').optional()),
    descripcion: zod_1.z.string().max(1000).optional(),
    observaciones: zod_1.z.string().max(1000).optional(),
    activa: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            return val === 'true';
        }
        if (val === 'disponible')
            return true;
        if (val === 'no_disponible')
            return false;
        return val;
    }, zod_1.z.boolean().default(true)),
    equipamientos: zod_1.z.array(zod_1.z.object({
        equipamientoId: zod_1.z.number().int().positive('ID de equipamiento inválido'),
        cantidad: zod_1.z.number().int().positive('La cantidad debe ser positiva').default(1),
        observaciones: zod_1.z.string().max(500).optional()
    })).optional()
});
exports.createAulaSchema = zod_1.z.preprocess((data) => {
    if (!data)
        return data;
    if (data.equipamientoIds && Array.isArray(data.equipamientoIds)) {
        data.equipamientos = data.equipamientoIds.map((id) => ({
            equipamientoId: id,
            cantidad: 1
        }));
    }
    if (data.tipo && typeof data.tipo === 'string') {
        const tipoId = TIPO_AULA_MAP[data.tipo.toLowerCase()];
        if (tipoId) {
            data.tipoAulaId = tipoId;
        }
    }
    if (data.estado && typeof data.estado === 'string') {
        const estadoId = ESTADO_AULA_MAP[data.estado.toLowerCase()];
        if (estadoId) {
            data.estadoAulaId = estadoId;
        }
    }
    return data;
}, zod_1.z.object({
    ...aulaBaseSchema.shape
}));
exports.updateAulaSchema = zod_1.z.preprocess((data) => {
    if (!data)
        return data;
    if (data.equipamientoIds && Array.isArray(data.equipamientoIds)) {
        data.equipamientos = data.equipamientoIds.map((id) => ({
            equipamientoId: id,
            cantidad: 1
        }));
    }
    if (data.tipo && typeof data.tipo === 'string') {
        const tipoId = TIPO_AULA_MAP[data.tipo.toLowerCase()];
        if (tipoId) {
            data.tipoAulaId = tipoId;
        }
    }
    if (data.estado && typeof data.estado === 'string') {
        const estadoId = ESTADO_AULA_MAP[data.estado.toLowerCase()];
        if (estadoId) {
            data.estadoAulaId = estadoId;
        }
    }
    return data;
}, zod_1.z.object({
    ...aulaBaseSchema.partial().shape
}));
exports.aulaQuerySchema = zod_1.z.object({
    activa: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            return val === 'true';
        }
        return val;
    }, zod_1.z.boolean().optional()),
    tipoAulaId: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().positive().optional()),
    estadoAulaId: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().positive().optional()),
    capacidadMinima: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().positive().optional()),
    capacidadMaxima: zod_1.z.preprocess((val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? undefined : parsed;
    }, zod_1.z.number().int().positive().optional()),
    conEquipamiento: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            return val === 'true';
        }
        return val;
    }, zod_1.z.boolean().optional()),
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
exports.disponibilidadAulaSchema = zod_1.z.object({
    fechaInicio: zod_1.z.string().datetime('Fecha inicio inválida'),
    fechaFin: zod_1.z.string().datetime('Fecha fin inválida'),
    excluirReservaId: zod_1.z.string().cuid().optional()
}).refine((data) => {
    const inicio = new Date(data.fechaInicio);
    const fin = new Date(data.fechaFin);
    return inicio < fin;
}, {
    message: 'La fecha de inicio debe ser anterior a la fecha de fin',
    path: ['fechaFin']
});
exports.estadisticasAulaSchema = zod_1.z.object({
    incluirReservas: zod_1.z.boolean().default(true),
    fechaDesde: zod_1.z.string().datetime().optional(),
    fechaHasta: zod_1.z.string().datetime().optional()
});
//# sourceMappingURL=aula.dto.js.map