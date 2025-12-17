/**
 * Descuentos Constants
 *
 * Constantes relacionadas con el sistema de descuentos.
 *
 * NOTA IMPORTANTE:
 * Estos descuentos legacy están deprecados y deben migrarse al
 * sistema de Motor de Reglas de Descuentos (tabla reglas_descuentos).
 *
 * Se mantienen temporalmente para backward compatibility.
 */

/**
 * @deprecated Usar Motor de Reglas de Descuentos
 * Porcentaje de descuento para estudiantes
 */
export const DESCUENTO_ESTUDIANTE = 0.40; // 40%

/**
 * @deprecated Usar Motor de Reglas de Descuentos
 * Porcentaje de descuento para jubilados
 */
export const DESCUENTO_JUBILADO = 0.25; // 25%

/**
 * Máximo de años de antigüedad considerados para descuento
 * Ejemplo: Máximo 15 años = 15% de descuento (1% por año)
 */
export const MAX_ANIOS_ANTIGUEDAD_DESCUENTO = 15;

/**
 * Porcentaje de descuento por cada año de antigüedad
 */
export const PORCENTAJE_DESCUENTO_POR_ANIO = 1; // 1% por año

/**
 * Límite global de descuentos acumulados (porcentaje)
 * Ejemplo: No se pueden aplicar más del 80% de descuento total
 */
export const LIMITE_GLOBAL_DESCUENTOS_PORCENTAJE = 80;

/**
 * Mínimo porcentaje de descuento aplicable
 */
export const MIN_PORCENTAJE_DESCUENTO = 0;

/**
 * Máximo porcentaje de descuento aplicable (individual)
 */
export const MAX_PORCENTAJE_DESCUENTO = 100;

/**
 * Códigos de categorías que tienen descuentos legacy
 *
 * @deprecated Migrar a Motor de Reglas de Descuentos
 */
export const CATEGORIAS_CON_DESCUENTO_LEGACY = {
  ESTUDIANTE: {
    codigo: 'ESTUDIANTE',
    porcentaje: 40,
    descripcion: 'Descuento para estudiantes'
  },
  JUBILADO: {
    codigo: 'JUBILADO',
    porcentaje: 25,
    descripcion: 'Descuento para jubilados'
  }
} as const;

/**
 * Tipos de descuento soportados por el sistema
 */
export const TIPOS_DESCUENTO = {
  PORCENTAJE: 'PORCENTAJE',
  FIJO: 'FIJO',
  FORMULA: 'FORMULA'
} as const;

/**
 * Prioridad de aplicación de descuentos cuando hay múltiples
 * (menor número = mayor prioridad)
 */
export const PRIORIDAD_DESCUENTOS = {
  EXENCION: 1, // Exenciones tienen máxima prioridad
  AJUSTE_MANUAL: 2, // Ajustes manuales
  REGLA_AUTOMATICA: 3, // Reglas del motor
  DESCUENTO_CATEGORIA: 4 // Descuentos por categoría (legacy)
} as const;
