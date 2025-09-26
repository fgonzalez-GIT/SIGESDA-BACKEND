"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.personaQuerySchema = exports.updatePersonaSchema = exports.createPersonaSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const personaBaseSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1, 'Nombre es requerido').max(50),
    apellido: zod_1.z.string().min(1, 'Apellido es requerido').max(50),
    dni: zod_1.z.string().min(7, 'DNI debe tener al menos 7 caracteres').max(8),
    email: zod_1.z.string().email('Email inválido').optional(),
    telefono: zod_1.z.string().max(20).optional(),
    direccion: zod_1.z.string().max(200).optional(),
    fechaNacimiento: zod_1.z.string().datetime().optional()
});
exports.createPersonaSchema = zod_1.z.discriminatedUnion('tipo', [
    zod_1.z.object({
        ...personaBaseSchema.shape,
        tipo: zod_1.z.literal(client_1.TipoPersona.SOCIO),
        categoria: zod_1.z.nativeEnum(client_1.CategoriaSocio),
        fechaIngreso: zod_1.z.string().datetime().optional(),
        numeroSocio: zod_1.z.number().int().positive().optional()
    }),
    zod_1.z.object({
        ...personaBaseSchema.shape,
        tipo: zod_1.z.literal(client_1.TipoPersona.NO_SOCIO)
    }),
    zod_1.z.object({
        ...personaBaseSchema.shape,
        tipo: zod_1.z.literal(client_1.TipoPersona.DOCENTE),
        especialidad: zod_1.z.string().min(1, 'Especialidad es requerida').max(100),
        honorariosPorHora: zod_1.z.number().positive().optional()
    }),
    zod_1.z.object({
        ...personaBaseSchema.shape,
        tipo: zod_1.z.literal(client_1.TipoPersona.PROVEEDOR),
        cuit: zod_1.z.string().min(11, 'CUIT debe tener 11 caracteres').max(11),
        razonSocial: zod_1.z.string().min(1, 'Razón social es requerida').max(100)
    })
]);
exports.updatePersonaSchema = zod_1.z.discriminatedUnion('tipo', [
    zod_1.z.object({
        tipo: zod_1.z.literal(client_1.TipoPersona.SOCIO),
        ...personaBaseSchema.partial().shape,
        categoria: zod_1.z.nativeEnum(client_1.CategoriaSocio).optional(),
        fechaIngreso: zod_1.z.string().datetime().optional(),
        fechaBaja: zod_1.z.string().datetime().optional(),
        motivoBaja: zod_1.z.string().max(200).optional()
    }),
    zod_1.z.object({
        tipo: zod_1.z.literal(client_1.TipoPersona.NO_SOCIO),
        ...personaBaseSchema.partial().shape
    }),
    zod_1.z.object({
        tipo: zod_1.z.literal(client_1.TipoPersona.DOCENTE),
        ...personaBaseSchema.partial().shape,
        especialidad: zod_1.z.string().max(100).optional(),
        honorariosPorHora: zod_1.z.number().positive().optional()
    }),
    zod_1.z.object({
        tipo: zod_1.z.literal(client_1.TipoPersona.PROVEEDOR),
        ...personaBaseSchema.partial().shape,
        cuit: zod_1.z.string().min(11).max(11).optional(),
        razonSocial: zod_1.z.string().max(100).optional()
    })
]);
exports.personaQuerySchema = zod_1.z.object({
    tipo: zod_1.z.nativeEnum(client_1.TipoPersona).optional(),
    categoria: zod_1.z.nativeEnum(client_1.CategoriaSocio).optional(),
    activo: zod_1.z.preprocess((val) => {
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
//# sourceMappingURL=persona.dto.js.map