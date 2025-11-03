/**
 * Helpers para validación de reglas de negocio de Personas
 *
 * Este módulo proporciona utilidades para:
 * - Validar tipos de persona mutuamente excluyentes
 * - Validar combinaciones válidas de tipos
 */

/**
 * Tipos de persona mutuamente excluyentes
 *
 * SOCIO y NO_SOCIO son mutuamente excluyentes porque representan estados opuestos:
 * - SOCIO: Persona con membresía activa en la asociación
 * - NO_SOCIO: Persona registrada sin membresía
 *
 * Una persona puede tener múltiples tipos EXCEPTO SOCIO + NO_SOCIO simultáneamente.
 *
 * Combinaciones válidas:
 * ✅ SOCIO + DOCENTE + PROVEEDOR
 * ✅ NO_SOCIO + DOCENTE
 * ✅ NO_SOCIO + PROVEEDOR
 * ❌ SOCIO + NO_SOCIO (INVÁLIDO)
 */
export const TIPOS_MUTUAMENTE_EXCLUYENTES: Record<string, string[]> = {
  SOCIO: ['NO_SOCIO'],
  NO_SOCIO: ['SOCIO']
};

/**
 * Valida que los tipos de persona proporcionados no sean mutuamente excluyentes
 *
 * @param tiposCodigos - Array de códigos de tipos de persona
 * @returns Objeto con validación y mensaje de error si aplica
 *
 * @example
 * validateTiposMutuamenteExcluyentes(['SOCIO', 'DOCENTE'])
 * // Returns: { valid: true }
 *
 * @example
 * validateTiposMutuamenteExcluyentes(['SOCIO', 'NO_SOCIO'])
 * // Returns: { valid: false, error: 'SOCIO y NO_SOCIO son mutuamente excluyentes...' }
 */
export function validateTiposMutuamenteExcluyentes(tiposCodigos: string[]): {
  valid: boolean;
  error?: string;
} {
  // Verificar si tiene SOCIO y NO_SOCIO simultáneamente
  const tieneSocio = tiposCodigos.includes('SOCIO');
  const tieneNoSocio = tiposCodigos.includes('NO_SOCIO');

  if (tieneSocio && tieneNoSocio) {
    return {
      valid: false,
      error: 'SOCIO y NO_SOCIO son mutuamente excluyentes. Una persona no puede ser SOCIO y NO_SOCIO al mismo tiempo.'
    };
  }

  return { valid: true };
}

/**
 * Valida si se puede agregar un tipo nuevo a los tipos existentes de una persona
 *
 * @param tiposExistentes - Array de códigos de tipos que ya tiene la persona
 * @param nuevoTipo - Código del tipo que se desea agregar
 * @returns Objeto con validación y mensaje de error si aplica
 *
 * @example
 * canAgregarTipo(['NO_SOCIO'], 'DOCENTE')
 * // Returns: { valid: true }
 *
 * @example
 * canAgregarTipo(['SOCIO', 'DOCENTE'], 'NO_SOCIO')
 * // Returns: { valid: false, error: 'No se puede asignar NO_SOCIO...' }
 */
export function canAgregarTipo(
  tiposExistentes: string[],
  nuevoTipo: string
): {
  valid: boolean;
  error?: string;
} {
  // Obtener tipos excluyentes del nuevo tipo
  const tiposExcluyentes = TIPOS_MUTUAMENTE_EXCLUYENTES[nuevoTipo] || [];

  // Verificar si alguno de los tipos existentes es excluyente con el nuevo
  for (const tipoExistente of tiposExistentes) {
    if (tiposExcluyentes.includes(tipoExistente)) {
      return {
        valid: false,
        error: `No se puede asignar el tipo ${nuevoTipo} a una persona que ya tiene el tipo ${tipoExistente}. ` +
               `Estos tipos son mutuamente excluyentes. Primero debe desasignar el tipo ${tipoExistente}.`
      };
    }
  }

  return { valid: true };
}

/**
 * Obtiene los tipos que son mutuamente excluyentes con un tipo dado
 *
 * @param tipoCodigo - Código del tipo de persona
 * @returns Array de códigos de tipos excluyentes
 *
 * @example
 * getTiposExcluyentes('SOCIO')
 * // Returns: ['NO_SOCIO']
 */
export function getTiposExcluyentes(tipoCodigo: string): string[] {
  return TIPOS_MUTUAMENTE_EXCLUYENTES[tipoCodigo] || [];
}

/**
 * Verifica si dos tipos son mutuamente excluyentes
 *
 * @param tipo1 - Código del primer tipo
 * @param tipo2 - Código del segundo tipo
 * @returns true si son mutuamente excluyentes
 *
 * @example
 * sonTiposExcluyentes('SOCIO', 'NO_SOCIO')
 * // Returns: true
 *
 * @example
 * sonTiposExcluyentes('SOCIO', 'DOCENTE')
 * // Returns: false
 */
export function sonTiposExcluyentes(tipo1: string, tipo2: string): boolean {
  const excluyentesDeTipo1 = TIPOS_MUTUAMENTE_EXCLUYENTES[tipo1] || [];
  const excluyentesDeTipo2 = TIPOS_MUTUAMENTE_EXCLUYENTES[tipo2] || [];

  return excluyentesDeTipo1.includes(tipo2) || excluyentesDeTipo2.includes(tipo1);
}
