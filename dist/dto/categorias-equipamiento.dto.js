"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderCategoriaEquipamientoSchema = exports.updateCategoriaEquipamientoSchema = exports.createCategoriaEquipamientoSchema = void 0;
const zod_1 = require("zod");
exports.createCategoriaEquipamientoSchema = zod_1.z.object({
    codigo: zod_1.z.string()
        .min(1, 'El código es requerido')
        .max(50, 'El código no puede exceder 50 caracteres')
        .regex(/^[A-Z_]+$/, 'El código debe estar en mayúsculas y usar guiones bajos'),
    nombre: zod_1.z.string()
        .min(1, 'El nombre es requerido')
        .max(100, 'El nombre no puede exceder 100 caracteres'),
    descripcion: zod_1.z.string()
        .max(500, 'La descripción no puede exceder 500 caracteres')
        .optional()
        .nullable(),
    activo: zod_1.z.boolean().default(true),
    orden: zod_1.z.number().int().nonnegative().default(0)
});
exports.updateCategoriaEquipamientoSchema = exports.createCategoriaEquipamientoSchema.partial();
exports.reorderCategoriaEquipamientoSchema = zod_1.z.object({
    ids: zod_1.z.array(zod_1.z.number().int().positive()).min(1, 'Se requiere al menos un ID')
});
//# sourceMappingURL=categorias-equipamiento.dto.js.map