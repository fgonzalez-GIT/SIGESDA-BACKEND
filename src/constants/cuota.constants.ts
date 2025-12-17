/**
 * Cuota Constants
 *
 * Constantes relacionadas con el sistema de cuotas.
 */

/**
 * Día del mes en que vencen las cuotas
 * Por defecto: día 15 del mes siguiente
 */
export const DIA_VENCIMIENTO_CUOTA = 15;

/**
 * Porcentaje máximo de descuento permitido en una cuota
 */
export const MAX_PORCENTAJE_DESCUENTO_CUOTA = 100;

/**
 * Límite global de descuentos acumulados
 * Ejemplo: No se pueden aplicar más del 80% de descuento total
 */
export const LIMITE_GLOBAL_DESCUENTOS = 80;

/**
 * Cantidad mínima de días de anticipación para generar cuotas
 */
export const DIAS_ANTICIPACION_GENERACION_CUOTAS = 0;

/**
 * Cantidad máxima de cuotas que se pueden generar en un lote
 */
export const MAX_CUOTAS_POR_LOTE = 1000;

/**
 * Estados de recibo que permiten modificaciones de cuota
 */
export const ESTADOS_RECIBO_EDITABLES = ['PENDIENTE', 'VENCIDO'];

/**
 * Estados de recibo que NO permiten modificaciones
 */
export const ESTADOS_RECIBO_NO_EDITABLES = ['PAGADO', 'ANULADO'];

/**
 * Precisión para comparación de montos decimales (0.01 = 1 centavo)
 */
export const PRECISION_MONTO_DECIMAL = 0.01;

/**
 * Monto mínimo permitido para una cuota
 */
export const MONTO_MINIMO_CUOTA = 0;

/**
 * Prefijo para el concepto de cuotas generadas automáticamente
 */
export const PREFIJO_CONCEPTO_CUOTA_AUTO = 'Cuota';

/**
 * Cantidad de meses hacia atrás permitidos para generar cuotas
 * (0 = solo mes actual y futuros)
 */
export const MESES_ATRAS_GENERACION_PERMITIDOS = 0;

/**
 * Cantidad de meses hacia adelante permitidos para generar cuotas
 * (12 = hasta 1 año adelante)
 */
export const MESES_ADELANTE_GENERACION_PERMITIDOS = 12;
