"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateContactoPersonaSchema = exports.createContactoPersonaSchema = exports.updatePersonaTipoSchema = exports.createPersonaTipoSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const personaTipoBaseSchema = zod_1.z.object({
    tipoPersonaId: zod_1.z.number().int().positive('ID de tipo de persona inválido').optional(),
    tipoPersonaCodigo: zod_1.z.string().min(1, 'Código de tipo es requerido').optional(),
    observaciones: zod_1.z.string().max(500).optional(),
    activo: zod_1.z.boolean().default(true)
});
const socioDataSchema = zod_1.z.object({
    categoriaId: zod_1.z.number().int().positive('ID de categoría inválido'),
    numeroSocio: zod_1.z.number().int().positive().optional(),
    fechaIngreso: zod_1.z.string().datetime().optional(),
    fechaBaja: zod_1.z.string().datetime().optional(),
    motivoBaja: zod_1.z.string().max(200).optional()
});
const docenteDataSchema = zod_1.z.object({
    especialidadId: zod_1.z.number().int().positive('ID de especialidad inválido'),
    honorariosPorHora: zod_1.z.number().positive().optional()
});
const proveedorDataSchema = zod_1.z.object({
    cuit: zod_1.z.string().min(11, 'CUIT debe tener 11 caracteres').max(11, 'CUIT debe tener 11 caracteres'),
    razonSocial: zod_1.z.string().min(1, 'Razón social es requerida').max(200)
});
exports.createPersonaTipoSchema = zod_1.z.object({
    ...personaTipoBaseSchema.shape,
    tipoPersonaId: zod_1.z.number().int().positive().optional(),
    tipoPersonaCodigo: zod_1.z.enum(['NO_SOCIO', 'SOCIO', 'DOCENTE', 'PROVEEDOR']).optional(),
    categoriaId: zod_1.z.number().int().positive().optional(),
    numeroSocio: zod_1.z.number().int().positive().optional(),
    fechaIngreso: zod_1.z.string().datetime().optional(),
    especialidadId: zod_1.z.number().int().positive().optional(),
    honorariosPorHora: zod_1.z.number().positive().optional(),
    cuit: zod_1.z.string().length(11).optional(),
    razonSocial: zod_1.z.string().max(200).optional()
}).refine((data) => {
    return data.tipoPersonaId !== undefined || data.tipoPersonaCodigo !== undefined;
}, {
    message: 'Debe proporcionar tipoPersonaId o tipoPersonaCodigo'
});
exports.updatePersonaTipoSchema = zod_1.z.object({
    activo: zod_1.z.boolean().optional(),
    fechaDesasignacion: zod_1.z.string().datetime().optional(),
    categoriaId: zod_1.z.number().int().positive().optional(),
    fechaIngreso: zod_1.z.string().datetime().optional(),
    fechaBaja: zod_1.z.string().datetime().optional(),
    motivoBaja: zod_1.z.string().max(200).optional(),
    especialidadId: zod_1.z.number().int().positive().optional(),
    honorariosPorHora: zod_1.z.number().positive().optional(),
    cuit: zod_1.z.string().length(11).optional(),
    razonSocial: zod_1.z.string().max(200).optional(),
    observaciones: zod_1.z.string().max(500).optional()
});
exports.createContactoPersonaSchema = zod_1.z.object({
    tipoContacto: zod_1.z.nativeEnum(client_1.TipoContacto, {
        errorMap: () => ({ message: 'Tipo de contacto inválido' })
    }),
    valor: zod_1.z.string().min(1, 'El valor del contacto es requerido').max(200),
    principal: zod_1.z.boolean().default(false),
    observaciones: zod_1.z.string().max(500).optional(),
    activo: zod_1.z.boolean().default(true)
});
exports.updateContactoPersonaSchema = zod_1.z.object({
    tipoContacto: zod_1.z.nativeEnum(client_1.TipoContacto).optional(),
    valor: zod_1.z.string().min(1).max(200).optional(),
    principal: zod_1.z.boolean().optional(),
    observaciones: zod_1.z.string().max(500).optional(),
    activo: zod_1.z.boolean().optional()
});
//# sourceMappingURL=persona-tipo.dto.js.map