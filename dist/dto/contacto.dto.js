"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTiposContactoSchema = exports.updateTipoContactoSchema = exports.createTipoContactoSchema = exports.updateContactoPersonaSchema = exports.createContactoPersonaSchema = void 0;
const zod_1 = require("zod");
exports.createContactoPersonaSchema = zod_1.z.object({
    tipoContactoId: zod_1.z.number().int().positive({
        message: 'El tipo de contacto es requerido y debe ser un número positivo'
    }),
    valor: zod_1.z.string().min(1, 'El valor del contacto es requerido').max(200, 'El valor no puede exceder 200 caracteres'),
    principal: zod_1.z.boolean().default(false),
    observaciones: zod_1.z.string().max(500, 'Las observaciones no pueden exceder 500 caracteres').optional(),
    activo: zod_1.z.boolean().default(true)
});
exports.updateContactoPersonaSchema = zod_1.z.object({
    tipoContactoId: zod_1.z.number().int().positive().optional(),
    valor: zod_1.z.string().min(1).max(200).optional(),
    principal: zod_1.z.boolean().optional(),
    observaciones: zod_1.z.string().max(500).optional().nullable(),
    activo: zod_1.z.boolean().optional()
});
exports.createTipoContactoSchema = zod_1.z.object({
    codigo: zod_1.z.string()
        .min(1, 'El código es requerido')
        .max(50, 'El código no puede exceder 50 caracteres')
        .toUpperCase()
        .regex(/^[A-Z_]+$/, 'El código debe contener solo letras mayúsculas y guiones bajos'),
    nombre: zod_1.z.string()
        .min(1, 'El nombre es requerido')
        .max(100, 'El nombre no puede exceder 100 caracteres'),
    descripcion: zod_1.z.string()
        .max(500, 'La descripción no puede exceder 500 caracteres')
        .optional()
        .nullable(),
    icono: zod_1.z.string()
        .max(50, 'El icono no puede exceder 50 caracteres')
        .optional()
        .nullable(),
    pattern: zod_1.z.string()
        .max(500, 'El patrón de validación no puede exceder 500 caracteres')
        .optional()
        .nullable()
        .refine((val) => {
        if (!val)
            return true;
        try {
            new RegExp(val);
            return true;
        }
        catch {
            return false;
        }
    }, { message: 'El patrón debe ser una expresión regular válida' }),
    activo: zod_1.z.boolean().default(true),
    orden: zod_1.z.number().int().min(0, 'El orden debe ser un número positivo o cero').default(0)
});
exports.updateTipoContactoSchema = exports.createTipoContactoSchema.partial();
exports.getTiposContactoSchema = zod_1.z.object({
    soloActivos: zod_1.z.boolean().default(true).optional(),
    ordenarPor: zod_1.z.enum(['orden', 'nombre', 'codigo']).default('orden').optional()
});
//# sourceMappingURL=contacto.dto.js.map