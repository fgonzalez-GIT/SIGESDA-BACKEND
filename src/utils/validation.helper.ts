/**
 * Validation Helper Utilities
 *
 * Funciones reutilizables para validaciones comunes de negocio.
 */

/**
 * Valida que un porcentaje esté dentro del rango permitido
 *
 * @param valor - Valor del porcentaje a validar
 * @param max - Valor máximo permitido (default: 100)
 * @param min - Valor mínimo permitido (default: 0)
 * @throws Error si el porcentaje está fuera de rango
 *
 * @example
 * validatePorcentaje(50)
 * // No error
 *
 * @example
 * validatePorcentaje(150)
 * // Throws: Error('El porcentaje debe estar entre 0% y 100%')
 *
 * @example
 * validatePorcentaje(95, 80)
 * // Throws: Error('El porcentaje debe estar entre 0% y 80%')
 */
export function validatePorcentaje(valor: number, max = 100, min = 0): void {
  if (valor < min || valor > max) {
    throw new Error(`El porcentaje debe estar entre ${min}% y ${max}%`);
  }
}

/**
 * Valida que un monto sea positivo
 *
 * @param monto - Monto a validar
 * @param campoNombre - Nombre del campo (para el mensaje de error)
 * @throws Error si el monto es negativo
 *
 * @example
 * validateMontoPositivo(100, 'monto total')
 * // No error
 *
 * @example
 * validateMontoPositivo(-50, 'monto total')
 * // Throws: Error('El monto total debe ser positivo')
 */
export function validateMontoPositivo(monto: number, campoNombre = 'monto'): void {
  if (monto < 0) {
    throw new Error(`El ${campoNombre} debe ser positivo`);
  }
}

/**
 * Valida que un monto sea mayor que cero
 *
 * @param monto - Monto a validar
 * @param campoNombre - Nombre del campo (para el mensaje de error)
 * @throws Error si el monto es menor o igual a cero
 *
 * @example
 * validateMontoMayorCero(100, 'precio')
 * // No error
 *
 * @example
 * validateMontoMayorCero(0, 'precio')
 * // Throws: Error('El precio debe ser mayor que cero')
 */
export function validateMontoMayorCero(monto: number, campoNombre = 'monto'): void {
  if (monto <= 0) {
    throw new Error(`El ${campoNombre} debe ser mayor que cero`);
  }
}

/**
 * Valida que un array no esté vacío
 *
 * @param array - Array a validar
 * @param campoNombre - Nombre del campo (para el mensaje de error)
 * @throws Error si el array está vacío
 *
 * @example
 * validateArrayNoVacio([1, 2, 3], 'items')
 * // No error
 *
 * @example
 * validateArrayNoVacio([], 'items')
 * // Throws: Error('Debe proporcionar al menos un elemento en items')
 */
export function validateArrayNoVacio<T>(array: T[], campoNombre = 'array'): void {
  if (!array || array.length === 0) {
    throw new Error(`Debe proporcionar al menos un elemento en ${campoNombre}`);
  }
}

/**
 * Valida que un ID sea un número entero positivo
 *
 * @param id - ID a validar
 * @param campoNombre - Nombre del campo (para el mensaje de error)
 * @throws Error si el ID no es válido
 *
 * @example
 * validateId(123, 'personaId')
 * // No error
 *
 * @example
 * validateId(-1, 'personaId')
 * // Throws: Error('El personaId debe ser un número entero positivo')
 */
export function validateId(id: number, campoNombre = 'ID'): void {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(`El ${campoNombre} debe ser un número entero positivo`);
  }
}

/**
 * Valida que una cadena no esté vacía
 *
 * @param valor - Cadena a validar
 * @param campoNombre - Nombre del campo (para el mensaje de error)
 * @param minLength - Longitud mínima (default: 1)
 * @throws Error si la cadena está vacía o es muy corta
 *
 * @example
 * validateStringNoVacio('Hola', 'concepto')
 * // No error
 *
 * @example
 * validateStringNoVacio('', 'concepto')
 * // Throws: Error('El concepto no puede estar vacío')
 *
 * @example
 * validateStringNoVacio('AB', 'concepto', 3)
 * // Throws: Error('El concepto debe tener al menos 3 caracteres')
 */
export function validateStringNoVacio(
  valor: string | undefined | null,
  campoNombre = 'campo',
  minLength = 1
): void {
  if (!valor || valor.trim().length === 0) {
    throw new Error(`El ${campoNombre} no puede estar vacío`);
  }

  if (valor.trim().length < minLength) {
    throw new Error(`El ${campoNombre} debe tener al menos ${minLength} caracteres`);
  }
}

/**
 * Valida que un valor esté dentro de un rango numérico
 *
 * @param valor - Valor a validar
 * @param min - Valor mínimo
 * @param max - Valor máximo
 * @param campoNombre - Nombre del campo (para el mensaje de error)
 * @throws Error si el valor está fuera de rango
 *
 * @example
 * validateRango(50, 0, 100, 'descuento')
 * // No error
 *
 * @example
 * validateRango(150, 0, 100, 'descuento')
 * // Throws: Error('El descuento debe estar entre 0 y 100')
 */
export function validateRango(
  valor: number,
  min: number,
  max: number,
  campoNombre = 'valor'
): void {
  if (valor < min || valor > max) {
    throw new Error(`El ${campoNombre} debe estar entre ${min} y ${max}`);
  }
}

/**
 * Valida que dos valores numéricos coincidan
 *
 * @param valor1 - Primer valor
 * @param valor2 - Segundo valor
 * @param campo1Nombre - Nombre del primer campo
 * @param campo2Nombre - Nombre del segundo campo
 * @param tolerancia - Tolerancia para considerar iguales (default: 0.01 para decimales)
 * @throws Error si los valores no coinciden
 *
 * @example
 * validateValoresCoinciden(100.00, 100.00, 'monto esperado', 'monto actual')
 * // No error
 *
 * @example
 * validateValoresCoinciden(100.00, 105.00, 'monto esperado', 'monto actual')
 * // Throws: Error('El monto esperado y el monto actual no coinciden')
 */
export function validateValoresCoinciden(
  valor1: number,
  valor2: number,
  campo1Nombre = 'valor1',
  campo2Nombre = 'valor2',
  tolerancia = 0.01
): void {
  if (Math.abs(valor1 - valor2) > tolerancia) {
    throw new Error(`El ${campo1Nombre} y el ${campo2Nombre} no coinciden`);
  }
}
