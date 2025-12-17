/**
 * Recibo Helper Utilities
 *
 * Funciones reutilizables para validaciones de recibos.
 */

import { Recibo, EstadoRecibo } from '@prisma/client';

/**
 * Valida que un recibo no esté pagado antes de permitir modificaciones
 *
 * @param recibo - Recibo a validar
 * @param operacion - Nombre de la operación que se intenta realizar
 * @throws Error si el recibo está pagado
 *
 * @example
 * validateReciboPagado(recibo, 'modificar')
 * // Throws: Error('No se puede modificar un recibo pagado')
 */
export function validateReciboPagado(recibo: Recibo, operacion: string): void {
  if (recibo.estado === EstadoRecibo.PAGADO) {
    throw new Error(`No se puede ${operacion} un recibo pagado`);
  }
}

/**
 * Valida que un recibo esté en estado editable
 *
 * Estados editables: PENDIENTE, VENCIDO
 * Estados NO editables: PAGADO, ANULADO
 *
 * @param recibo - Recibo a validar
 * @throws Error si el recibo no es editable
 *
 * @example
 * validateReciboEditable(recibo)
 * // No error si estado es PENDIENTE o VENCIDO
 * // Throws: Error('El recibo no es editable en su estado actual: PAGADO')
 */
export function validateReciboEditable(recibo: Recibo): void {
  const estadosEditables: EstadoRecibo[] = [EstadoRecibo.PENDIENTE, EstadoRecibo.VENCIDO];

  if (!estadosEditables.includes(recibo.estado)) {
    throw new Error(`El recibo no es editable en su estado actual: ${recibo.estado}`);
  }
}

/**
 * Verifica si un recibo puede ser eliminado
 *
 * Un recibo NO se puede eliminar si:
 * - Está pagado (estado PAGADO)
 * - Tiene medios de pago registrados
 *
 * @param recibo - Recibo a verificar (debe incluir mediosPago)
 * @returns Objeto con resultado de validación y motivo si no se puede eliminar
 *
 * @example
 * const result = canDeleteRecibo(recibo);
 * if (!result.canDelete) {
 *   console.log(result.reason);
 * }
 */
export function canDeleteRecibo(recibo: any): { canDelete: boolean; reason?: string } {
  // Verificar si está pagado
  if (recibo.estado === EstadoRecibo.PAGADO) {
    return {
      canDelete: false,
      reason: 'No se puede eliminar un recibo pagado'
    };
  }

  // Verificar si tiene medios de pago
  if (recibo.mediosPago && recibo.mediosPago.length > 0) {
    return {
      canDelete: false,
      reason: 'No se puede eliminar un recibo que tiene medios de pago registrados'
    };
  }

  return { canDelete: true };
}

/**
 * Valida que se pueda eliminar un recibo
 *
 * @param recibo - Recibo a validar
 * @throws Error si el recibo no puede ser eliminado
 *
 * @example
 * validateCanDeleteRecibo(recibo)
 * // Throws: Error('No se puede eliminar un recibo pagado')
 */
export function validateCanDeleteRecibo(recibo: any): void {
  const result = canDeleteRecibo(recibo);

  if (!result.canDelete) {
    throw new Error(result.reason || 'No se puede eliminar el recibo');
  }
}

/**
 * Verifica si un recibo está vencido
 *
 * @param recibo - Recibo a verificar
 * @param fechaReferencia - Fecha de referencia (default: ahora)
 * @returns true si el recibo está vencido
 *
 * @example
 * const vencido = isReciboVencido(recibo);
 * if (vencido) {
 *   console.log('El recibo está vencido');
 * }
 */
export function isReciboVencido(recibo: Recibo, fechaReferencia = new Date()): boolean {
  if (!recibo.fechaVencimiento) {
    return false; // Si no tiene fecha de vencimiento, no está vencido
  }

  if (recibo.estado === EstadoRecibo.PAGADO) {
    return false; // Los recibos pagados no están vencidos
  }

  return recibo.fechaVencimiento < fechaReferencia;
}

/**
 * Verifica si un recibo está pendiente de pago
 *
 * @param recibo - Recibo a verificar
 * @returns true si el recibo está pendiente
 *
 * @example
 * const pendiente = isReciboPendiente(recibo);
 */
export function isReciboPendiente(recibo: Recibo): boolean {
  return recibo.estado === EstadoRecibo.PENDIENTE || recibo.estado === EstadoRecibo.VENCIDO;
}

/**
 * Obtiene el estado que debería tener un recibo según su fecha de vencimiento
 *
 * @param recibo - Recibo a evaluar
 * @param fechaReferencia - Fecha de referencia (default: ahora)
 * @returns Estado sugerido del recibo
 *
 * @example
 * const estadoSugerido = getEstadoSugeridoRecibo(recibo);
 * // Returns: 'VENCIDO' si pasó la fecha de vencimiento
 */
export function getEstadoSugeridoRecibo(
  recibo: Recibo,
  fechaReferencia = new Date()
): EstadoRecibo {
  // Si ya está pagado, mantener ese estado
  if (recibo.estado === EstadoRecibo.PAGADO) {
    return EstadoRecibo.PAGADO;
  }

  // Verificar si está vencido
  if (isReciboVencido(recibo, fechaReferencia)) {
    return EstadoRecibo.VENCIDO;
  }

  // Por defecto, pendiente
  return EstadoRecibo.PENDIENTE;
}
