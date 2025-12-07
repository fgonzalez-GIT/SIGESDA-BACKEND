"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePersonaTipoSchema = exports.createPersonaTipoSchema = void 0;
const zod_1 = require("zod");
const personaTipoBaseSchema = zod_1.z.object({
    tipoPersonaId: zod_1.z.number().int().positive('ID de tipo de persona inválido').optional(),
    tipoPersonaCodigo: zod_1.z.string().min(1, 'Código de tipo es requerido').optional(),
    observaciones: zod_1.z.string().max(500).optional(),
    activo: zod_1.z.boolean().default(true)
});
const socioDataSchema = zod_1.z.object({
    categoriaId: zod_1.z.number().int().positive('ID de categoría inválido'),
    numeroSocio: zod_1.z.number().int().positive().optional(),
    fechaIngreso: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, 'Fecha debe tener formato YYYY-MM-DD o ISO 8601').optional(),
    fechaBaja: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, 'Fecha debe tener formato YYYY-MM-DD o ISO 8601').optional(),
    motivoBaja: zod_1.z.string().max(200).optional()
});
const docenteDataSchema = zod_1.z.object({
    especialidadId: zod_1.z.number().int().positive('ID de especialidad inválido'),
    honorariosPorHora: zod_1.z.number().nonnegative('Honorarios deben ser 0 o mayor').optional()
});
const proveedorDataSchema = zod_1.z.object({
    cuit: zod_1.z.string().min(11, 'CUIT debe tener 11 caracteres').max(11, 'CUIT debe tener 11 caracteres'),
    razonSocialId: zod_1.z.number().int().positive('ID de razón social inválido')
});
exports.createPersonaTipoSchema = zod_1.z.object({
    ...personaTipoBaseSchema.shape,
    tipoPersonaId: zod_1.z.number().int().positive().optional(),
    tipoPersonaCodigo: zod_1.z.enum(['NO_SOCIO', 'SOCIO', 'DOCENTE', 'PROVEEDOR']).optional(),
    categoriaId: zod_1.z.number().int().positive().optional(),
    numeroSocio: zod_1.z.number().int().positive().optional(),
    fechaIngreso: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, 'Fecha debe tener formato YYYY-MM-DD o ISO 8601').optional(),
    especialidadId: zod_1.z.number().int().positive().optional(),
    honorariosPorHora: zod_1.z.number().nonnegative().optional(),
    cuit: zod_1.z.string().length(11).optional(),
    razonSocialId: zod_1.z.number().int().positive().optional()
}).refine((data) => {
    return data.tipoPersonaId !== undefined || data.tipoPersonaCodigo !== undefined;
}, {
    message: 'Debe proporcionar tipoPersonaId o tipoPersonaCodigo'
});
exports.updatePersonaTipoSchema = zod_1.z.object({
    activo: zod_1.z.boolean().optional(),
    fechaDesasignacion: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, 'Fecha debe tener formato YYYY-MM-DD o ISO 8601').optional(),
    categoriaId: zod_1.z.number().int().positive().optional(),
    fechaIngreso: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, 'Fecha debe tener formato YYYY-MM-DD o ISO 8601').optional(),
    fechaBaja: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, 'Fecha debe tener formato YYYY-MM-DD o ISO 8601').optional(),
    motivoBaja: zod_1.z.string().max(200).optional(),
    especialidadId: zod_1.z.number().int().positive().optional(),
    honorariosPorHora: zod_1.z.number().nonnegative().optional(),
    cuit: zod_1.z.string().length(11).optional(),
    razonSocialId: zod_1.z.number().int().positive().optional(),
    observaciones: zod_1.z.string().max(500).optional()
});
//# sourceMappingURL=persona-tipo.dto.js.map