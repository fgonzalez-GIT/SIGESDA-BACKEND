"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ESPECIALIDADES_SISTEMA_PROTEGIDAS = exports.TIPOS_SISTEMA_PROTEGIDOS = exports.updateEspecialidadSchema = exports.createEspecialidadSchema = exports.toggleActivoSchema = exports.updateTipoPersonaSchema = exports.createTipoPersonaSchema = void 0;
const zod_1 = require("zod");
exports.createTipoPersonaSchema = zod_1.z.object({
    codigo: zod_1.z.string()
        .min(2, 'Código debe tener al menos 2 caracteres')
        .max(50, 'Código debe tener máximo 50 caracteres')
        .regex(/^[A-Z_]+$/, 'Código debe ser en MAYÚSCULAS y guiones bajos (ej: TIPO_NUEVO)'),
    nombre: zod_1.z.string()
        .min(1, 'Nombre es requerido')
        .max(100, 'Nombre debe tener máximo 100 caracteres'),
    descripcion: zod_1.z.string()
        .max(500, 'Descripción debe tener máximo 500 caracteres')
        .optional(),
    activo: zod_1.z.boolean().default(true),
    orden: zod_1.z.number().int().min(0).default(0),
    requiereCategoriaId: zod_1.z.boolean().default(false).optional(),
    requiereEspecialidadId: zod_1.z.boolean().default(false).optional(),
    requiereCuit: zod_1.z.boolean().default(false).optional(),
    requiereRazonSocial: zod_1.z.boolean().default(false).optional()
});
exports.updateTipoPersonaSchema = zod_1.z.object({
    nombre: zod_1.z.string()
        .min(1, 'Nombre es requerido')
        .max(100, 'Nombre debe tener máximo 100 caracteres')
        .optional(),
    descripcion: zod_1.z.string()
        .max(500, 'Descripción debe tener máximo 500 caracteres')
        .optional()
        .nullable(),
    activo: zod_1.z.boolean().optional(),
    orden: zod_1.z.number().int().min(0).optional(),
    requiereCategoriaId: zod_1.z.boolean().optional(),
    requiereEspecialidadId: zod_1.z.boolean().optional(),
    requiereCuit: zod_1.z.boolean().optional(),
    requiereRazonSocial: zod_1.z.boolean().optional()
});
exports.toggleActivoSchema = zod_1.z.object({
    activo: zod_1.z.boolean({
        required_error: 'El campo activo es requerido',
        invalid_type_error: 'El campo activo debe ser boolean'
    })
});
exports.createEspecialidadSchema = zod_1.z.object({
    codigo: zod_1.z.string()
        .min(2, 'Código debe tener al menos 2 caracteres')
        .max(50, 'Código debe tener máximo 50 caracteres')
        .regex(/^[A-Z_]+$/, 'Código debe ser en MAYÚSCULAS y guiones bajos (ej: ESPECIALIDAD_NUEVA)'),
    nombre: zod_1.z.string()
        .min(1, 'Nombre es requerido')
        .max(100, 'Nombre debe tener máximo 100 caracteres'),
    descripcion: zod_1.z.string()
        .max(500, 'Descripción debe tener máximo 500 caracteres')
        .optional(),
    activo: zod_1.z.boolean().default(true),
    orden: zod_1.z.number().int().min(0).default(0)
});
exports.updateEspecialidadSchema = zod_1.z.object({
    nombre: zod_1.z.string()
        .min(1, 'Nombre es requerido')
        .max(100, 'Nombre debe tener máximo 100 caracteres')
        .optional(),
    descripcion: zod_1.z.string()
        .max(500, 'Descripción debe tener máximo 500 caracteres')
        .optional()
        .nullable(),
    activo: zod_1.z.boolean().optional(),
    orden: zod_1.z.number().int().min(0).optional()
});
exports.TIPOS_SISTEMA_PROTEGIDOS = [
    'NO_SOCIO',
    'SOCIO',
    'DOCENTE',
    'PROVEEDOR'
];
exports.ESPECIALIDADES_SISTEMA_PROTEGIDAS = [
    'GENERAL'
];
//# sourceMappingURL=catalogo.dto.js.map