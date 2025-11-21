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
 * y retorna información sobre tipos que deben ser reemplazados automáticamente
 *
 * @param tiposExistentes - Array de códigos de tipos que ya tiene la persona
 * @param nuevoTipo - Código del tipo que se desea agregar
 * @returns Objeto con validación, tipos a reemplazar, y mensaje de error si aplica
 *
 * @example
 * canAgregarTipo(['NO_SOCIO'], 'DOCENTE')
 * // Returns: { valid: true, tiposAReemplazar: [] }
 *
 * @example
 * canAgregarTipo(['NO_SOCIO', 'DOCENTE'], 'SOCIO')
 * // Returns: { valid: true, tiposAReemplazar: ['NO_SOCIO'], requiresAutoReplace: true }
 */
export function canAgregarTipo(
  tiposExistentes: string[],
  nuevoTipo: string
): {
  valid: boolean;
  error?: string;
  tiposAReemplazar?: string[];
  requiresAutoReplace?: boolean;
} {
  // Obtener tipos excluyentes del nuevo tipo
  const tiposExcluyentes = TIPOS_MUTUAMENTE_EXCLUYENTES[nuevoTipo] || [];

  // Verificar si alguno de los tipos existentes es excluyente con el nuevo
  const tiposConflictivos: string[] = [];
  for (const tipoExistente of tiposExistentes) {
    if (tiposExcluyentes.includes(tipoExistente)) {
      tiposConflictivos.push(tipoExistente);
    }
  }

  // Si hay tipos conflictivos, marcar para auto-reemplazo
  if (tiposConflictivos.length > 0) {
    return {
      valid: true,
      tiposAReemplazar: tiposConflictivos,
      requiresAutoReplace: true
    };
  }

  return { valid: true, tiposAReemplazar: [] };
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

// ============================================================================
// HELPERS PARA VERIFICACIÓN DE TIPOS (Arquitectura V2)
// ============================================================================

import { PrismaClient } from '@prisma/client';

// Singleton de Prisma para evitar múltiples instancias
let prismaInstance: PrismaClient | null = null;

function getPrismaInstance(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient();
  }
  return prismaInstance;
}

/**
 * Verifica si una persona tiene un tipo específico activo
 *
 * @param personaId - ID de la persona
 * @param tipoCodigo - Código del tipo de persona (SOCIO, DOCENTE, etc.)
 * @param prisma - Instancia de PrismaClient (opcional)
 * @returns true si la persona tiene el tipo activo
 *
 * @example
 * await hasActiveTipo(1, 'DOCENTE')
 * // Returns: true si la persona ID 1 es docente activo
 */
export async function hasActiveTipo(
  personaId: number,
  tipoCodigo: string,
  prisma?: PrismaClient
): Promise<boolean> {
  const client = prisma || getPrismaInstance();

  const tipos = await client.personaTipo.count({
    where: {
      personaId,
      activo: true,
      tipoPersona: { codigo: tipoCodigo }
    }
  });

  return tipos > 0;
}

/**
 * Obtiene todos los tipos activos de una persona
 *
 * @param personaId - ID de la persona
 * @param prisma - Instancia de PrismaClient (opcional)
 * @returns Array de códigos de tipos activos
 *
 * @example
 * await getActiveTipos(1)
 * // Returns: ['SOCIO', 'DOCENTE']
 */
export async function getActiveTipos(
  personaId: number,
  prisma?: PrismaClient
): Promise<string[]> {
  const client = prisma || getPrismaInstance();

  const tipos = await client.personaTipo.findMany({
    where: {
      personaId,
      activo: true
    },
    include: {
      tipoPersona: true
    }
  });

  return tipos.map(t => t.tipoPersona.codigo);
}

/**
 * Verifica si una persona está activa en el sistema
 *
 * @param personaId - ID de la persona
 * @param prisma - Instancia de PrismaClient (opcional)
 * @returns true si la persona está activa
 *
 * @example
 * await isPersonaActiva(1)
 * // Returns: true si la persona está activa
 */
export async function isPersonaActiva(
  personaId: number,
  prisma?: PrismaClient
): Promise<boolean> {
  const client = prisma || getPrismaInstance();

  const persona = await client.persona.findUnique({
    where: { id: personaId },
    select: { activo: true }
  });

  return persona?.activo ?? false;
}

/**
 * Da de baja una persona (soft delete)
 *
 * @param personaId - ID de la persona
 * @param motivoBaja - Motivo de la baja
 * @param prisma - Instancia de PrismaClient (opcional)
 * @returns Persona actualizada
 *
 * @example
 * await darDeBajaPersona(1, 'Solicitud del socio')
 */
export async function darDeBajaPersona(
  personaId: number,
  motivoBaja?: string,
  prisma?: PrismaClient
) {
  const client = prisma || getPrismaInstance();

  return client.persona.update({
    where: { id: personaId },
    data: {
      activo: false,
      fechaBaja: new Date(),
      motivoBaja: motivoBaja || 'Sin especificar'
    }
  });
}

/**
 * Reactiva una persona previamente dada de baja
 *
 * @param personaId - ID de la persona
 * @param prisma - Instancia de PrismaClient (opcional)
 * @returns Persona actualizada
 *
 * @example
 * await reactivarPersona(1)
 */
export async function reactivarPersona(
  personaId: number,
  prisma?: PrismaClient
) {
  const client = prisma || getPrismaInstance();

  return client.persona.update({
    where: { id: personaId },
    data: {
      activo: true,
      fechaBaja: null,
      motivoBaja: null
    }
  });
}
