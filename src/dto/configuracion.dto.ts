import { z } from 'zod';

// Enum para tipos de configuración
export enum TipoConfiguracion {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  JSON = 'JSON'
}

// Schema base para configuración
const configuracionBaseSchema = z.object({
  clave: z.string().min(1, 'Clave es requerida').max(100)
    .regex(/^[A-Z_][A-Z0-9_]*$/, 'Clave debe estar en MAYÚSCULAS y usar guiones bajos'),
  valor: z.string().min(1, 'Valor es requerido'),
  descripcion: z.string().max(500).optional(),
  tipo: z.nativeEnum(TipoConfiguracion).default(TipoConfiguracion.STRING)
});

// Validador personalizado para valores según tipo
const validarValorPorTipo = (data: any) => {
  switch (data.tipo) {
    case TipoConfiguracion.NUMBER:
      const num = parseFloat(data.valor);
      if (isNaN(num)) {
        throw new Error('El valor debe ser un número válido para tipo NUMBER');
      }
      break;

    case TipoConfiguracion.BOOLEAN:
      if (!['true', 'false'].includes(data.valor.toLowerCase())) {
        throw new Error('El valor debe ser "true" o "false" para tipo BOOLEAN');
      }
      break;

    case TipoConfiguracion.JSON:
      try {
        JSON.parse(data.valor);
      } catch {
        throw new Error('El valor debe ser un JSON válido para tipo JSON');
      }
      break;

    case TipoConfiguracion.STRING:
    default:
      // STRING es siempre válido
      break;
  }
  return true;
};

// DTO para crear configuración
export const createConfiguracionSchema = configuracionBaseSchema
  .refine(validarValorPorTipo, {
    message: 'Valor inválido para el tipo especificado',
    path: ['valor']
  });

// DTO para actualizar configuración
export const updateConfiguracionSchema = z.object({
  valor: z.string().min(1, 'Valor es requerido').optional(),
  descripcion: z.string().max(500).optional(),
  tipo: z.nativeEnum(TipoConfiguracion).optional()
}).refine((data) => {
  // Si se actualiza valor y tipo, validar compatibilidad
  if (data.valor && data.tipo) {
    return validarValorPorTipo(data);
  }
  return true;
}, {
  message: 'Valor inválido para el tipo especificado',
  path: ['valor']
});

// Query filters para listar configuraciones
export const configuracionQuerySchema = z.object({
  tipo: z.nativeEnum(TipoConfiguracion).optional(),
  search: z.string().optional(), // Búsqueda por clave o descripción
  page: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? 1 : parsed;
  }, z.number().int().positive().default(1)),
  limit: z.preprocess((val) => {
    const parsed = parseInt(val as string);
    return isNaN(parsed) ? 10 : parsed;
  }, z.number().int().positive().max(100).default(10))
});

// DTO para obtener configuraciones por categoría (prefijo de clave)
export const configuracionCategoriaSchema = z.object({
  categoria: z.string().min(1, 'Categoría es requerida')
    .regex(/^[A-Z_][A-Z0-9_]*$/, 'Categoría debe estar en MAYÚSCULAS'),
  incluirDescripciones: z.boolean().default(false)
});

// DTO para importar/exportar configuraciones
export const importarConfiguracionesSchema = z.object({
  configuraciones: z.array(z.object({
    clave: z.string().min(1).max(100),
    valor: z.string().min(1),
    descripcion: z.string().max(500).optional(),
    tipo: z.nativeEnum(TipoConfiguracion).default(TipoConfiguracion.STRING)
  })),
  sobrescribir: z.boolean().default(false) // Si sobrescribir configuraciones existentes
});

// Tipos auxiliares para valores tipados
export type ValorConfiguracion = {
  STRING: string;
  NUMBER: number;
  BOOLEAN: boolean;
  JSON: any;
};

// Función helper para parsear valores según tipo
export const parsearValor = <T extends keyof ValorConfiguracion>(
  valor: string,
  tipo: T
): ValorConfiguracion[T] => {
  switch (tipo) {
    case TipoConfiguracion.NUMBER:
      return parseFloat(valor) as ValorConfiguracion[T];
    case TipoConfiguracion.BOOLEAN:
      return (valor.toLowerCase() === 'true') as ValorConfiguracion[T];
    case TipoConfiguracion.JSON:
      return JSON.parse(valor) as ValorConfiguracion[T];
    case TipoConfiguracion.STRING:
    default:
      return valor as ValorConfiguracion[T];
  }
};

// Claves de configuración predefinidas del sistema
export const CLAVES_SISTEMA = {
  // Cuotas por categoría
  CUOTA_SOCIO_ACTIVO: 'CUOTA_SOCIO_ACTIVO',
  CUOTA_SOCIO_ESTUDIANTE: 'CUOTA_SOCIO_ESTUDIANTE',
  CUOTA_SOCIO_FAMILIAR: 'CUOTA_SOCIO_FAMILIAR',
  CUOTA_SOCIO_JUBILADO: 'CUOTA_SOCIO_JUBILADO',

  // Configuraciones generales
  NOMBRE_ASOCIACION: 'NOMBRE_ASOCIACION',
  EMAIL_CONTACTO: 'EMAIL_CONTACTO',
  TELEFONO_CONTACTO: 'TELEFONO_CONTACTO',
  DIRECCION_ASOCIACION: 'DIRECCION_ASOCIACION',

  // Configuraciones de negocio
  DIAS_VENCIMIENTO_CUOTA: 'DIAS_VENCIMIENTO_CUOTA',
  DESCUENTO_FAMILIAR: 'DESCUENTO_FAMILIAR',
  ACTIVIDADES_GRATIS_SOCIOS: 'ACTIVIDADES_GRATIS_SOCIOS',

  // Configuraciones técnicas
  BACKUP_AUTOMATICO: 'BACKUP_AUTOMATICO',
  ENVIO_RECORDATORIOS: 'ENVIO_RECORDATORIOS',
  FORMATO_RECIBO: 'FORMATO_RECIBO'
} as const;

export type CreateConfiguracionDto = z.infer<typeof createConfiguracionSchema>;
export type UpdateConfiguracionDto = z.infer<typeof updateConfiguracionSchema>;
export type ConfiguracionQueryDto = z.infer<typeof configuracionQuerySchema>;
export type ConfiguracionCategoriaDto = z.infer<typeof configuracionCategoriaSchema>;
export type ImportarConfiguracionesDto = z.infer<typeof importarConfiguracionesSchema>;