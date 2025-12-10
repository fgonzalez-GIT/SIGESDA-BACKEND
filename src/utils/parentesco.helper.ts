/**
 * Helper para gestión de parentescos y sincronización bidireccional
 *
 * Este módulo proporciona utilidades para:
 * - Obtener el parentesco complementario/inverso
 * - Determinar si un parentesco es simétrico o asimétrico
 * - Clasificar parentescos por grado de cercanía
 * - Validar relaciones familiares
 */

import { TipoParentesco } from '@prisma/client';

/**
 * Mapa de parentescos complementarios
 * Define la relación inversa para cada tipo de parentesco
 */
export const PARENTESCO_COMPLEMENTARIO: Record<TipoParentesco, TipoParentesco> = {
  // === PRIMER GRADO: Relaciones directas (padres-hijos, cónyuges, hermanos) ===

  // Relaciones padre-hijo (directas verticales)
  [TipoParentesco.PADRE]: TipoParentesco.HIJO,    // Si A es padre de B → B es hijo de A
  [TipoParentesco.MADRE]: TipoParentesco.HIJA,    // Si A es madre de B → B es hija de A
  [TipoParentesco.HIJO]: TipoParentesco.PADRE,    // Si A es hijo de B → B es padre de A
  [TipoParentesco.HIJA]: TipoParentesco.MADRE,    // Si A es hija de B → B es madre de A

  // Relaciones horizontales de primer grado
  [TipoParentesco.HERMANO]: TipoParentesco.HERMANO,  // Si A es hermano de B → B es hermano de A
  [TipoParentesco.HERMANA]: TipoParentesco.HERMANA,  // Si A es hermana de B → B es hermana de A

  // Relaciones maritales (conyugales)
  [TipoParentesco.CONYUGE]: TipoParentesco.CONYUGE,  // Si A es cónyuge de B → B es cónyuge de A (simétrico, género neutro)
  [TipoParentesco.ESPOSA]: TipoParentesco.ESPOSO,    // Si A es esposa de B → B es esposo de A (asimétrico, género femenino)
  [TipoParentesco.ESPOSO]: TipoParentesco.ESPOSA,    // Si A es esposo de B → B es esposa de A (asimétrico, género masculino)

  // === SEGUNDO GRADO: Relaciones indirectas (abuelos, tíos, primos) ===

  // Relaciones abuelo-nieto (dos generaciones)
  [TipoParentesco.ABUELO]: TipoParentesco.NIETO,  // Si A es abuelo de B → B es nieto de A
  [TipoParentesco.ABUELA]: TipoParentesco.NIETA,  // Si A es abuela de B → B es nieta de A
  [TipoParentesco.NIETO]: TipoParentesco.ABUELO,  // Si A es nieto de B → B es abuelo de A
  [TipoParentesco.NIETA]: TipoParentesco.ABUELA,  // Si A es nieta de B → B es abuela de A

  // Relaciones tío-sobrino (colaterales de segundo grado)
  [TipoParentesco.TIO]: TipoParentesco.SOBRINO,   // Si A es tío de B → B es sobrino de A
  [TipoParentesco.TIA]: TipoParentesco.SOBRINA,   // Si A es tía de B → B es sobrina de A
  [TipoParentesco.SOBRINO]: TipoParentesco.TIO,   // Si A es sobrino de B → B es tío de A
  [TipoParentesco.SOBRINA]: TipoParentesco.TIA,   // Si A es sobrina de B → B es tía de A

  // Relaciones primos (colaterales de segundo grado horizontal)
  [TipoParentesco.PRIMO]: TipoParentesco.PRIMO,      // Si A es primo de B → B es primo de A
  [TipoParentesco.PRIMA]: TipoParentesco.PRIMA,      // Si A es prima de B → B es prima de A

  // Relación genérica (sin grado definido)
  [TipoParentesco.OTRO]: TipoParentesco.OTRO       // Relación no especificada
};

/**
 * Clasificación de parentescos por grado de cercanía
 */
export enum GradoParentesco {
  PRIMER_GRADO = 'PRIMER_GRADO',   // Padres, hijos, hermanos, cónyuge
  SEGUNDO_GRADO = 'SEGUNDO_GRADO', // Abuelos, nietos, tíos, sobrinos, primos
  OTRO = 'OTRO'                     // Sin clasificación específica
}

/**
 * Parentescos de primer grado (relaciones más cercanas)
 * - Línea directa ascendente/descendente: padres-hijos
 * - Línea colateral: hermanos
 * - Vínculo conyugal: cónyuge, esposa, esposo
 */
export const PARENTESCOS_PRIMER_GRADO: TipoParentesco[] = [
  TipoParentesco.PADRE,
  TipoParentesco.MADRE,
  TipoParentesco.HIJO,
  TipoParentesco.HIJA,
  TipoParentesco.HERMANO,
  TipoParentesco.HERMANA,
  TipoParentesco.CONYUGE,  // Género neutro (genérico)
  TipoParentesco.ESPOSA,   // Género femenino (específico)
  TipoParentesco.ESPOSO    // Género masculino (específico)
];

/**
 * Parentescos de segundo grado (relaciones más distantes)
 * - Línea directa: abuelos-nietos
 * - Línea colateral: tíos-sobrinos, primos
 */
export const PARENTESCOS_SEGUNDO_GRADO: TipoParentesco[] = [
  TipoParentesco.ABUELO,
  TipoParentesco.ABUELA,
  TipoParentesco.NIETO,
  TipoParentesco.NIETA,
  TipoParentesco.TIO,
  TipoParentesco.TIA,
  TipoParentesco.SOBRINO,
  TipoParentesco.SOBRINA,
  TipoParentesco.PRIMO,
  TipoParentesco.PRIMA
];

/**
 * Obtiene el grado de parentesco
 *
 * @param parentesco - El tipo de parentesco
 * @returns El grado de cercanía familiar
 *
 * @example
 * getGradoParentesco('PADRE') // Returns: GradoParentesco.PRIMER_GRADO
 * getGradoParentesco('ABUELO') // Returns: GradoParentesco.SEGUNDO_GRADO
 */
export function getGradoParentesco(parentesco: TipoParentesco): GradoParentesco {
  if (PARENTESCOS_PRIMER_GRADO.includes(parentesco)) {
    return GradoParentesco.PRIMER_GRADO;
  }
  if (PARENTESCOS_SEGUNDO_GRADO.includes(parentesco)) {
    return GradoParentesco.SEGUNDO_GRADO;
  }
  return GradoParentesco.OTRO;
}

/**
 * Lista de parentescos simétricos (donde A→B implica B→A con el mismo tipo)
 */
export const PARENTESCOS_SIMETRICOS: TipoParentesco[] = [
  TipoParentesco.HERMANO,
  TipoParentesco.HERMANA,
  TipoParentesco.PRIMO,
  TipoParentesco.PRIMA,
  TipoParentesco.CONYUGE,
  TipoParentesco.OTRO
];

/**
 * Lista de parentescos asimétricos (donde A→B implica B→A con tipo diferente)
 */
export const PARENTESCOS_ASIMETRICOS: TipoParentesco[] = [
  TipoParentesco.PADRE,
  TipoParentesco.MADRE,
  TipoParentesco.HIJO,
  TipoParentesco.HIJA,
  TipoParentesco.ABUELO,
  TipoParentesco.ABUELA,
  TipoParentesco.NIETO,
  TipoParentesco.NIETA,
  TipoParentesco.TIO,
  TipoParentesco.TIA,
  TipoParentesco.SOBRINO,
  TipoParentesco.SOBRINA,
  TipoParentesco.ESPOSA,   // Relación marital asimétrica (ESPOSA ↔ ESPOSO)
  TipoParentesco.ESPOSO    // Relación marital asimétrica (ESPOSO ↔ ESPOSA)
];

/**
 * Obtiene el parentesco complementario/inverso para un parentesco dado
 *
 * @param parentesco - El parentesco original
 * @returns El parentesco complementario
 *
 * @example
 * getParentescoComplementario('PADRE') // Returns: 'HIJO'
 * getParentescoComplementario('HERMANO') // Returns: 'HERMANO' (simétrico)
 */
export function getParentescoComplementario(parentesco: TipoParentesco): TipoParentesco {
  return PARENTESCO_COMPLEMENTARIO[parentesco];
}

/**
 * Determina si un parentesco es simétrico
 * Un parentesco simétrico es aquel donde la relación inversa es la misma
 *
 * @param parentesco - El parentesco a verificar
 * @returns true si el parentesco es simétrico
 *
 * @example
 * isParentescoSimetrico('HERMANO') // Returns: true
 * isParentescoSimetrico('PADRE') // Returns: false
 */
export function isParentescoSimetrico(parentesco: TipoParentesco): boolean {
  return PARENTESCO_COMPLEMENTARIO[parentesco] === parentesco;
}

/**
 * Valida que dos parentescos sean complementarios entre sí
 *
 * @param parentesco1 - Primer parentesco
 * @param parentesco2 - Segundo parentesco
 * @returns true si son complementarios
 *
 * @example
 * areParentescosComplementarios('PADRE', 'HIJO') // Returns: true
 * areParentescosComplementarios('PADRE', 'HERMANO') // Returns: false
 */
export function areParentescosComplementarios(
  parentesco1: TipoParentesco,
  parentesco2: TipoParentesco
): boolean {
  return PARENTESCO_COMPLEMENTARIO[parentesco1] === parentesco2 &&
         PARENTESCO_COMPLEMENTARIO[parentesco2] === parentesco1;
}

/**
 * Genera un mensaje descriptivo de una relación bidireccional
 *
 * @param nombreA - Nombre de la primera persona
 * @param parentescoAB - Parentesco de A hacia B
 * @param nombreB - Nombre de la segunda persona
 * @returns Mensaje descriptivo
 *
 * @example
 * getRelacionBidireccionalDescripcion('Juan', 'PADRE', 'María')
 * // Returns: "Juan es PADRE de María, y María es HIJA de Juan"
 */
export function getRelacionBidireccionalDescripcion(
  nombreA: string,
  parentescoAB: TipoParentesco,
  nombreB: string
): string {
  const parentescoBA = getParentescoComplementario(parentescoAB);

  return `${nombreA} es ${parentescoAB} de ${nombreB}, y ${nombreB} es ${parentescoBA} de ${nombreA}`;
}

/**
 * Valida que una relación bidireccional sea consistente
 *
 * @param relacion1 - Primera relación { parentesco, desde, hacia }
 * @param relacion2 - Segunda relación { parentesco, desde, hacia }
 * @returns { valid: boolean, error?: string }
 */
export function validateRelacionBidireccional(
  relacion1: { parentesco: TipoParentesco; desdeId: number; haciaId: number },
  relacion2: { parentesco: TipoParentesco; desdeId: number; haciaId: number }
): { valid: boolean; error?: string } {
  // Verificar que las personas están invertidas
  if (relacion1.desdeId !== relacion2.haciaId || relacion1.haciaId !== relacion2.desdeId) {
    return {
      valid: false,
      error: 'Las relaciones no son entre las mismas personas'
    };
  }

  // Verificar que los parentescos sean complementarios
  if (!areParentescosComplementarios(relacion1.parentesco, relacion2.parentesco)) {
    return {
      valid: false,
      error: `Los parentescos ${relacion1.parentesco} y ${relacion2.parentesco} no son complementarios`
    };
  }

  return { valid: true };
}

/**
 * Obtiene información resumida de un parentesco
 *
 * @param parentesco - El tipo de parentesco
 * @returns Información del parentesco
 */
export function getInfoParentesco(parentesco: TipoParentesco): {
  grado: GradoParentesco;
  complementario: TipoParentesco;
  simetrico: boolean;
} {
  return {
    grado: getGradoParentesco(parentesco),
    complementario: getParentescoComplementario(parentesco),
    simetrico: isParentescoSimetrico(parentesco)
  };
}

// ============================================================================
// LÓGICA CON GÉNERO (AGREGADO 2025-12-09)
// ============================================================================

/**
 * Tipo de género (debe coincidir con el enum Genero de Prisma)
 */
export type Genero = 'MASCULINO' | 'FEMENINO' | 'NO_BINARIO' | 'PREFIERO_NO_DECIR' | null;

/**
 * Obtiene el parentesco complementario considerando el género de la persona destino
 *
 * Esta función permite relaciones familiares asimétricas correctas basadas en género:
 * - PADRE + MASCULINO → HIJO (no HIJA)
 * - PADRE + FEMENINO → HIJA (no HIJO)
 * - MADRE + MASCULINO → HIJO (no HIJA)
 * - MADRE + FEMENINO → HIJA (no HIJO)
 *
 * **Fallback para género NULL/NO_BINARIO/PREFIERO_NO_DECIR:**
 * - Usa forma masculina por defecto (convención del español genérico)
 * - PADRE/MADRE → HIJO (no HIJA)
 * - HERMANO/HERMANA → HERMANO (no HERMANA)
 * - ABUELO/ABUELA → NIETO (no NIETA)
 *
 * **Para usuarios NO_BINARIO/PREFIERO_NO_DECIR:**
 * - La función retorna la forma masculina como sugerencia
 * - El service layer debe permitir override manual del parentesco
 * - Ver: familiar.service.ts para implementación de override
 *
 * @param parentesco - El parentesco original (de A hacia B)
 * @param generoDestino - Género de la persona A (quien recibirá el parentesco complementario en la relación inversa)
 * @returns El parentesco complementario (de B hacia A)
 *
 * @example
 * // Relación padre-hijo con género masculino
 * getParentescoComplementarioConGenero('PADRE', 'MASCULINO') // Returns: 'HIJO'
 *
 * @example
 * // Relación padre-hija con género femenino
 * getParentescoComplementarioConGenero('PADRE', 'FEMENINO') // Returns: 'HIJA'
 *
 * @example
 * // Relación sin género (fallback a masculino)
 * getParentescoComplementarioConGenero('PADRE', null) // Returns: 'HIJO'
 *
 * @example
 * // Relación con género no binario (fallback a masculino)
 * getParentescoComplementarioConGenero('MADRE', 'NO_BINARIO') // Returns: 'HIJO'
 *
 * @example
 * // Relación simétrica (género no importa)
 * getParentescoComplementarioConGenero('CONYUGE', 'MASCULINO') // Returns: 'CONYUGE'
 * getParentescoComplementarioConGenero('HERMANO', 'FEMENINO') // Returns: 'HERMANA'
 */
export function getParentescoComplementarioConGenero(
  parentesco: TipoParentesco,
  generoDestino?: Genero
): TipoParentesco {
  // Para relaciones simétricas y maritales asimétricas específicas,
  // usar el mapa original (no dependen del género del hijo/familiar)
  const relacionesSinGenero: TipoParentesco[] = [
    TipoParentesco.CONYUGE,  // Simétrico género neutro
    TipoParentesco.ESPOSA,   // Asimétrico marital (género del cónyuge, no del hijo)
    TipoParentesco.ESPOSO,   // Asimétrico marital (género del cónyuge, no del hijo)
    TipoParentesco.OTRO      // Genérico
  ];

  if (relacionesSinGenero.includes(parentesco)) {
    return PARENTESCO_COMPLEMENTARIO[parentesco];
  }

  // Normalizar género: NULL, NO_BINARIO, PREFIERO_NO_DECIR → usar masculino
  const usarMasculino = !generoDestino || generoDestino === 'NO_BINARIO' || generoDestino === 'PREFIERO_NO_DECIR';
  const esFemenino = generoDestino === 'FEMENINO';

  // === RELACIONES PADRE/MADRE → HIJO/HIJA ===
  if (parentesco === TipoParentesco.PADRE || parentesco === TipoParentesco.MADRE) {
    return esFemenino ? TipoParentesco.HIJA : TipoParentesco.HIJO;
  }

  // === RELACIONES HIJO/HIJA → PADRE/MADRE ===
  // Ahora usamos el género del progenitor (pasado como generoDestino) para determinar PADRE o MADRE
  // - Si hijo/hija tiene un progenitor FEMENINO → retorna MADRE
  // - Si hijo/hija tiene un progenitor MASCULINO → retorna PADRE
  // - Si género es NULL/NO_BINARIO/PREFIERO_NO_DECIR → retorna PADRE (fallback masculino)
  if (parentesco === TipoParentesco.HIJO || parentesco === TipoParentesco.HIJA) {
    return esFemenino ? TipoParentesco.MADRE : TipoParentesco.PADRE;
  }

  // === RELACIONES HERMANO/HERMANA ===
  // Si A es HERMANO/HERMANA de B, entonces B es HERMANO/HERMANA según su género
  if (parentesco === TipoParentesco.HERMANO || parentesco === TipoParentesco.HERMANA) {
    return esFemenino ? TipoParentesco.HERMANA : TipoParentesco.HERMANO;
  }

  // === RELACIONES ABUELO/ABUELA → NIETO/NIETA ===
  if (parentesco === TipoParentesco.ABUELO || parentesco === TipoParentesco.ABUELA) {
    return esFemenino ? TipoParentesco.NIETA : TipoParentesco.NIETO;
  }

  // === RELACIONES NIETO/NIETA → ABUELO/ABUELA ===
  // Similar a HIJO/HIJA, usamos el género del abuelo/a (pasado como generoDestino)
  if (parentesco === TipoParentesco.NIETO || parentesco === TipoParentesco.NIETA) {
    return esFemenino ? TipoParentesco.ABUELA : TipoParentesco.ABUELO;
  }

  // === RELACIONES TIO/TIA → SOBRINO/SOBRINA ===
  if (parentesco === TipoParentesco.TIO || parentesco === TipoParentesco.TIA) {
    return esFemenino ? TipoParentesco.SOBRINA : TipoParentesco.SOBRINO;
  }

  // === RELACIONES SOBRINO/SOBRINA → TIO/TIA ===
  // Usamos el género del tío/a (pasado como generoDestino)
  if (parentesco === TipoParentesco.SOBRINO || parentesco === TipoParentesco.SOBRINA) {
    return esFemenino ? TipoParentesco.TIA : TipoParentesco.TIO;
  }

  // === RELACIONES PRIMO/PRIMA ===
  // Si A es PRIMO/PRIMA de B, entonces B es PRIMO/PRIMA según su género
  if (parentesco === TipoParentesco.PRIMO || parentesco === TipoParentesco.PRIMA) {
    return esFemenino ? TipoParentesco.PRIMA : TipoParentesco.PRIMO;
  }

  // Fallback: usar mapa original si no se encuentra lógica específica
  return PARENTESCO_COMPLEMENTARIO[parentesco];
}

/**
 * Valida si un parentesco es consistente con el género de la persona
 *
 * Verifica si hay conflicto entre el parentesco asignado y el género de la persona:
 * - HIJO requiere género MASCULINO
 * - HIJA requiere género FEMENINO
 * - HERMANO requiere género MASCULINO
 * - HERMANA requiere género FEMENINO
 * - etc.
 *
 * **Política de validación:**
 * - NULL/NO_BINARIO/PREFIERO_NO_DECIR: SIEMPRE válido (no se fuerza género)
 * - Conflictos detectados generan WARNING (no error) según user requirements
 *
 * @param parentesco - El parentesco asignado
 * @param genero - El género de la persona
 * @returns { valid: boolean, warning?: string }
 *
 * @example
 * validateParentescoGenero('HIJO', 'MASCULINO') // { valid: true }
 * validateParentescoGenero('HIJO', 'FEMENINO')  // { valid: true, warning: "..." }
 * validateParentescoGenero('HIJO', null)        // { valid: true } (NULL siempre válido)
 */
export function validateParentescoGenero(
  parentesco: TipoParentesco,
  genero: Genero
): { valid: boolean; warning?: string } {
  // NULL, NO_BINARIO, PREFIERO_NO_DECIR: siempre válido
  if (!genero || genero === 'NO_BINARIO' || genero === 'PREFIERO_NO_DECIR') {
    return { valid: true };
  }

  // Definir parentescos que requieren género específico
  const parentescosMasculinos: TipoParentesco[] = [
    TipoParentesco.HIJO,
    TipoParentesco.PADRE,
    TipoParentesco.HERMANO,
    TipoParentesco.ABUELO,
    TipoParentesco.NIETO,
    TipoParentesco.TIO,
    TipoParentesco.SOBRINO,
    TipoParentesco.PRIMO,
    TipoParentesco.ESPOSO
  ];

  const parentescosFemeninos: TipoParentesco[] = [
    TipoParentesco.HIJA,
    TipoParentesco.MADRE,
    TipoParentesco.HERMANA,
    TipoParentesco.ABUELA,
    TipoParentesco.NIETA,
    TipoParentesco.TIA,
    TipoParentesco.SOBRINA,
    TipoParentesco.PRIMA,
    TipoParentesco.ESPOSA
  ];

  // Verificar conflictos
  if (genero === 'MASCULINO' && parentescosFemeninos.includes(parentesco)) {
    return {
      valid: true,  // Permitir operación (solo warning)
      warning: `Posible inconsistencia: persona con género MASCULINO asignada como ${parentesco} (parentesco femenino)`
    };
  }

  if (genero === 'FEMENINO' && parentescosMasculinos.includes(parentesco)) {
    return {
      valid: true,  // Permitir operación (solo warning)
      warning: `Posible inconsistencia: persona con género FEMENINO asignada como ${parentesco} (parentesco masculino)`
    };
  }

  return { valid: true };
}
