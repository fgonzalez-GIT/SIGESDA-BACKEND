import { EstadoEquipamiento } from '@/types/enums';
import { Equipamiento, AulaEquipamiento } from '@prisma/client';

/**
 * Estados que bloquean la asignación de equipamiento a aulas
 */
export const ESTADOS_BLOQUEADOS = [
  'ROTO',
  'DADO_DE_BAJA',
  'EN_REPARACION'
];

/**
 * Verifica si un estado de equipamiento permite asignación a aulas
 * @param estadoCodigo - Código del estado del equipamiento
 * @returns true si el estado permite asignación, false si está bloqueado
 */
export function estadoPermiteAsignacion(estadoCodigo: string): boolean {
  return !ESTADOS_BLOQUEADOS.includes(estadoCodigo);
}

/**
 * Calcula la cantidad disponible de un equipamiento
 * @param equipamiento - Equipamiento con su cantidad total
 * @param asignaciones - Array de asignaciones del equipamiento a aulas
 * @returns Cantidad disponible (puede ser negativa si hay déficit)
 */
export function calcularCantidadDisponible(
  equipamiento: Equipamiento,
  asignaciones: AulaEquipamiento[]
): number {
  const cantidadTotal = equipamiento.cantidad;
  const cantidadAsignada = asignaciones.reduce((sum, asig) => sum + asig.cantidad, 0);
  return cantidadTotal - cantidadAsignada;
}

/**
 * Calcula información detallada de disponibilidad de un equipamiento
 * @param equipamiento - Equipamiento con su cantidad total y estado
 * @param asignaciones - Array de asignaciones del equipamiento a aulas
 * @returns Objeto con información de disponibilidad
 */
export function calcularDisponibilidad(
  equipamiento: Equipamiento & { estadoEquipamiento?: { codigo: string; nombre: string } | null },
  asignaciones: AulaEquipamiento[]
): {
  cantidadTotal: number;
  cantidadAsignada: number;
  cantidadDisponible: number;
  estadoCodigo: string | null;
  estadoNombre: string | null;
  estadoPermiteAsignacion: boolean;
  tieneDeficit: boolean;
  warnings: string[];
} {
  const cantidadTotal = equipamiento.cantidad;
  const cantidadAsignada = asignaciones.reduce((sum, asig) => sum + asig.cantidad, 0);
  const cantidadDisponible = cantidadTotal - cantidadAsignada;
  const estadoCodigo = equipamiento.estadoEquipamiento?.codigo || null;
  const estadoNombre = equipamiento.estadoEquipamiento?.nombre || null;
  const estadoPermite = estadoCodigo ? estadoPermiteAsignacion(estadoCodigo) : true;
  const tieneDeficit = cantidadDisponible < 0;

  const warnings: string[] = [];

  if (tieneDeficit) {
    warnings.push(
      `Déficit de inventario: ${Math.abs(cantidadDisponible)} unidades sobrepasadas del stock`
    );
  }

  if (!estadoPermite && estadoCodigo) {
    warnings.push(
      `Estado "${estadoNombre}" no permite asignación a aulas`
    );
  }

  if (cantidadDisponible === 0 && !tieneDeficit) {
    warnings.push('Stock agotado: todas las unidades están asignadas');
  }

  return {
    cantidadTotal,
    cantidadAsignada,
    cantidadDisponible,
    estadoCodigo,
    estadoNombre,
    estadoPermiteAsignacion: estadoPermite,
    tieneDeficit,
    warnings
  };
}

/**
 * Valida si se puede asignar una cantidad específica de equipamiento
 * @param equipamiento - Equipamiento a validar
 * @param cantidadSolicitada - Cantidad que se desea asignar
 * @param asignaciones - Asignaciones actuales del equipamiento
 * @returns Objeto con resultado de validación
 */
export function validarAsignacion(
  equipamiento: Equipamiento & { estadoEquipamiento?: { codigo: string; nombre: string } | null },
  cantidadSolicitada: number,
  asignaciones: AulaEquipamiento[]
): {
  esValido: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar que equipamiento esté activo
  if (!equipamiento.activo) {
    errors.push('El equipamiento no está activo');
  }

  // Validar estado
  const estadoCodigo = equipamiento.estadoEquipamiento?.codigo;
  if (estadoCodigo && !estadoPermiteAsignacion(estadoCodigo)) {
    errors.push(
      `No se puede asignar equipamiento en estado "${equipamiento.estadoEquipamiento?.nombre}"`
    );
  }

  // Validar cantidad disponible
  const disponibilidad = calcularDisponibilidad(equipamiento, asignaciones);
  const nuevaDisponible = disponibilidad.cantidadDisponible - cantidadSolicitada;

  if (nuevaDisponible < 0) {
    warnings.push(
      `La asignación generará un déficit de ${Math.abs(nuevaDisponible)} unidades. ` +
      `Disponible: ${disponibilidad.cantidadDisponible}, Solicitado: ${cantidadSolicitada}`
    );
  }

  return {
    esValido: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Obtiene el nombre descriptivo de un estado de equipamiento
 * @param estadoCodigo - Código del estado
 * @returns Nombre del estado o "Desconocido"
 */
export function getNombreEstado(estadoCodigo: string): string {
  const estados: Record<string, string> = {
    [EstadoEquipamiento.NUEVO]: 'Nuevo',
    [EstadoEquipamiento.USADO]: 'Usado',
    [EstadoEquipamiento.EN_REPARACION]: 'En Reparación',
    [EstadoEquipamiento.ROTO]: 'Roto',
    [EstadoEquipamiento.DADO_DE_BAJA]: 'Dado de Baja'
  };

  return estados[estadoCodigo] || 'Desconocido';
}

/**
 * Verifica si un estado está bloqueado para asignación
 * @param estadoCodigo - Código del estado
 * @returns true si está bloqueado, false si permite asignación
 */
export function estaEstadoBloqueado(estadoCodigo: string): boolean {
  return ESTADOS_BLOQUEADOS.includes(estadoCodigo);
}
