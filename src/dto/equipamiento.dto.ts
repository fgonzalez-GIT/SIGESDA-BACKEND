import { z } from 'zod';

// Schema base para equipamientos
const equipamientoBaseSchema = z.object({
  nombre: z.string().min(1, 'Nombre es requerido').max(200),
  descripcion: z.string().max(1000).optional(),
  observaciones: z.string().max(1000).optional(),
  activo: z.preprocess((val) => {
    // Convert string to boolean if needed
    if (typeof val === 'string') {
      return val === 'true';
    }
    return val;
  }, z.boolean().default(true))
});

// DTO para crear equipamiento
export const createEquipamientoSchema = z.object({
  ...equipamientoBaseSchema.shape
});

// DTO para actualizar equipamiento
export const updateEquipamientoSchema = z.object({
  ...equipamientoBaseSchema.partial().shape
});

// Query filters para listar equipamientos
export const equipamientoQuerySchema = z.object({
  activo: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val === 'true';
    }
    return val;
  }, z.boolean().optional()),
  search: z.string().optional(), // Búsqueda por nombre, descripción u observaciones
  page: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? 1 : parsed;
  }, z.number().int().positive().default(1)),
  limit: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? 10 : parsed;
  }, z.number().int().positive().max(100).default(10))
});

// DTO para asignar equipamiento a aula (AulaEquipamiento)
export const asignarEquipamientoAulaSchema = z.object({
  equipamientoId: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? val : parsed;
  }, z.number().int().positive('ID de equipamiento inválido')),
  cantidad: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? 1 : parsed;
  }, z.number().int().positive('La cantidad debe ser positiva').default(1)),
  observaciones: z.string().max(500).optional()
});

// DTO para actualizar cantidad de equipamiento en aula
export const actualizarCantidadEquipamientoSchema = z.object({
  cantidad: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? val : parsed;
  }, z.number().int().positive('La cantidad debe ser positiva')),
  observaciones: z.string().max(500).optional()
});

// DTO para listar equipamientos de un aula
export const equipamientosAulaQuerySchema = z.object({
  incluirInactivos: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val === 'true';
    }
    return val;
  }, z.boolean().default(false))
});

export type CreateEquipamientoDto = z.infer<typeof createEquipamientoSchema>;
export type UpdateEquipamientoDto = z.infer<typeof updateEquipamientoSchema>;
export type EquipamientoQueryDto = z.infer<typeof equipamientoQuerySchema>;
export type AsignarEquipamientoAulaDto = z.infer<typeof asignarEquipamientoAulaSchema>;
export type ActualizarCantidadEquipamientoDto = z.infer<typeof actualizarCantidadEquipamientoSchema>;
export type EquipamientosAulaQueryDto = z.infer<typeof equipamientosAulaQuerySchema>;
