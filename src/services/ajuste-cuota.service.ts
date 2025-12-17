import { AjusteCuotaSocio, HistorialAjusteCuota, Prisma, TipoAjusteCuota } from '@prisma/client';
import { AjusteCuotaRepository } from '@/repositories/ajuste-cuota.repository';
import { HistorialAjusteCuotaRepository } from '@/repositories/historial-ajuste-cuota.repository';
import { PersonaRepository } from '@/repositories/persona.repository';
import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import {
  CreateAjusteCuotaDto,
  UpdateAjusteCuotaDto,
  QueryAjusteCuotaDto,
  AplicarAjusteACuotaDto
} from '@/dto/ajuste-cuota.dto';
import { validateFechaRange } from '@/utils/date.helper';
import { validatePorcentaje } from '@/utils/validation.helper';

/**
 * Service for managing manual adjustments to cuotas
 * FASE 4: Task 4.1 - Ajustes manuales por socio
 *
 * Features:
 * - Create/update/delete adjustments with automatic history tracking
 * - Apply adjustments to cuotas (calculate adjusted amounts)
 * - Validate business rules (dates, percentages, persona exists, etc.)
 * - Generate detailed audit log
 */
export class AjusteCuotaService {
  constructor(
    private ajusteRepository: AjusteCuotaRepository,
    private historialRepository: HistorialAjusteCuotaRepository,
    private personaRepository: PersonaRepository
  ) {}

  private get prisma() {
    return prisma;
  }

  /**
   * Create a new manual adjustment with history tracking
   */
  async createAjuste(data: CreateAjusteCuotaDto, usuario?: string): Promise<AjusteCuotaSocio> {
    // Validate persona exists
    const persona = await this.personaRepository.findById(data.personaId);
    if (!persona) {
      throw new Error(`Persona con ID ${data.personaId} no encontrada`);
    }

    if (!persona.activo) {
      throw new Error(`No se puede crear ajuste para persona inactiva (ID: ${data.personaId})`);
    }

    // Validate dates
    validateFechaRange(data.fechaInicio, data.fechaFin);

    // Validate percentage values
    if (data.tipoAjuste === 'DESCUENTO_PORCENTAJE' || data.tipoAjuste === 'RECARGO_PORCENTAJE') {
      validatePorcentaje(data.valor);
    }

    // Validate items for ITEMS_ESPECIFICOS scope
    if (data.aplicaA === 'ITEMS_ESPECIFICOS' && (!data.itemsAfectados || data.itemsAfectados.length === 0)) {
      throw new Error('Debe especificar al menos un item cuando aplicaA es ITEMS_ESPECIFICOS');
    }

    // Create ajuste within transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create ajuste
      const ajuste = await this.ajusteRepository.create(data, tx);

      // Create history entry
      await this.historialRepository.create({
        ajusteId: ajuste.id,
        personaId: data.personaId,
        accion: 'CREAR_AJUSTE',
        datosNuevos: {
          tipoAjuste: ajuste.tipoAjuste,
          valor: ajuste.valor.toString(),
          concepto: ajuste.concepto,
          fechaInicio: ajuste.fechaInicio,
          fechaFin: ajuste.fechaFin,
          aplicaA: ajuste.aplicaA,
          itemsAfectados: ajuste.itemsAfectados,
          motivo: ajuste.motivo
        },
        usuario,
        motivoCambio: data.motivo || 'Creación de nuevo ajuste manual'
      }, tx);

      return ajuste;
    });

    logger.info(
      `Ajuste manual creado: ${result.concepto} (${result.tipoAjuste}) para persona ${data.personaId} - ID: ${result.id}`
    );

    return result;
  }

  /**
   * Update an existing adjustment with history tracking
   */
  async updateAjuste(
    id: number,
    data: UpdateAjusteCuotaDto,
    usuario?: string
  ): Promise<AjusteCuotaSocio> {
    // Get current ajuste
    const ajusteActual = await this.ajusteRepository.findById(id);
    if (!ajusteActual) {
      throw new Error(`Ajuste con ID ${id} no encontrado`);
    }

    // Validate dates if provided
    const fechaInicio = data.fechaInicio || ajusteActual.fechaInicio;
    const fechaFin = data.fechaFin !== undefined ? data.fechaFin : ajusteActual.fechaFin;

    validateFechaRange(fechaInicio, fechaFin);

    // Validate percentage if changing tipo or valor
    const tipoAjuste = data.tipoAjuste || ajusteActual.tipoAjuste;
    const valor = data.valor || Number(ajusteActual.valor);

    if (tipoAjuste === 'DESCUENTO_PORCENTAJE' || tipoAjuste === 'RECARGO_PORCENTAJE') {
      validatePorcentaje(valor);
    }

    // Update ajuste within transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const ajusteActualizado = await this.ajusteRepository.update(id, data, tx);

      // Create history entry
      await this.historialRepository.create({
        ajusteId: id,
        personaId: ajusteActual.personaId,
        accion: 'MODIFICAR_AJUSTE',
        datosPrevios: {
          tipoAjuste: ajusteActual.tipoAjuste,
          valor: ajusteActual.valor.toString(),
          concepto: ajusteActual.concepto,
          fechaInicio: ajusteActual.fechaInicio,
          fechaFin: ajusteActual.fechaFin,
          activo: ajusteActual.activo,
          aplicaA: ajusteActual.aplicaA
        },
        datosNuevos: {
          ...data,
          valor: data.valor?.toString()
        },
        usuario,
        motivoCambio: data.motivo || 'Modificación de ajuste manual'
      }, tx);

      return ajusteActualizado;
    });

    logger.info(`Ajuste manual actualizado: ID ${id} - ${result.concepto}`);

    return result;
  }

  /**
   * Deactivate (soft delete) an adjustment
   */
  async deactivateAjuste(id: number, usuario?: string, motivo?: string): Promise<AjusteCuotaSocio> {
    const ajuste = await this.ajusteRepository.findById(id);
    if (!ajuste) {
      throw new Error(`Ajuste con ID ${id} no encontrado`);
    }

    if (!ajuste.activo) {
      throw new Error(`El ajuste con ID ${id} ya está inactivo`);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const ajusteDesactivado = await this.ajusteRepository.deactivate(id, tx);

      await this.historialRepository.create({
        ajusteId: id,
        personaId: ajuste.personaId,
        accion: 'ELIMINAR_AJUSTE',
        datosPrevios: {
          activo: true,
          concepto: ajuste.concepto,
          tipoAjuste: ajuste.tipoAjuste,
          valor: ajuste.valor.toString()
        },
        datosNuevos: {
          activo: false
        },
        usuario,
        motivoCambio: motivo || 'Desactivación de ajuste manual'
      }, tx);

      return ajusteDesactivado;
    });

    logger.info(`Ajuste manual desactivado: ID ${id} - ${ajuste.concepto}`);

    return result;
  }

  /**
   * Reactivate an adjustment
   */
  async activateAjuste(id: number, usuario?: string, motivo?: string): Promise<AjusteCuotaSocio> {
    const ajuste = await this.ajusteRepository.findById(id);
    if (!ajuste) {
      throw new Error(`Ajuste con ID ${id} no encontrado`);
    }

    if (ajuste.activo) {
      throw new Error(`El ajuste con ID ${id} ya está activo`);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const ajusteActivado = await this.ajusteRepository.activate(id, tx);

      await this.historialRepository.create({
        ajusteId: id,
        personaId: ajuste.personaId,
        accion: 'MODIFICAR_AJUSTE',
        datosPrevios: {
          activo: false
        },
        datosNuevos: {
          activo: true
        },
        usuario,
        motivoCambio: motivo || 'Reactivación de ajuste manual'
      }, tx);

      return ajusteActivado;
    });

    logger.info(`Ajuste manual reactivado: ID ${id} - ${ajuste.concepto}`);

    return result;
  }

  /**
   * Hard delete an adjustment (use with caution)
   */
  async deleteAjuste(id: number, usuario?: string, motivo?: string): Promise<void> {
    const ajuste = await this.ajusteRepository.findById(id);
    if (!ajuste) {
      throw new Error(`Ajuste con ID ${id} no encontrado`);
    }

    await this.prisma.$transaction(async (tx) => {
      // Create final history entry before deletion
      await this.historialRepository.create({
        ajusteId: null, // Will be orphan after deletion
        personaId: ajuste.personaId,
        accion: 'ELIMINAR_AJUSTE',
        datosPrevios: {
          id: ajuste.id,
          concepto: ajuste.concepto,
          tipoAjuste: ajuste.tipoAjuste,
          valor: ajuste.valor.toString(),
          activo: ajuste.activo
        },
        datosNuevos: {
          deleted: true
        },
        usuario,
        motivoCambio: motivo || 'Eliminación permanente de ajuste manual'
      }, tx);

      await this.ajusteRepository.delete(id, tx);
    });

    logger.warn(`Ajuste manual eliminado permanentemente: ID ${id} - ${ajuste.concepto}`);
  }

  /**
   * Get adjustment by ID
   */
  async getAjusteById(id: number): Promise<AjusteCuotaSocio | null> {
    return this.ajusteRepository.findById(id);
  }

  /**
   * Get all adjustments for a persona
   */
  async getAjustesByPersonaId(personaId: number, soloActivos = false): Promise<AjusteCuotaSocio[]> {
    return this.ajusteRepository.findByPersonaId(personaId, soloActivos);
  }

  /**
   * Get active adjustments for a persona within a date period
   * Used during cuota generation to apply relevant adjustments
   */
  async getAjustesActivosParaPeriodo(personaId: number, fecha: Date): Promise<AjusteCuotaSocio[]> {
    return this.ajusteRepository.findActiveByPersonaAndPeriodo(personaId, fecha);
  }

  /**
   * Get all adjustments with filters
   */
  async getAjustes(filters?: QueryAjusteCuotaDto): Promise<AjusteCuotaSocio[]> {
    return this.ajusteRepository.findAll(filters);
  }

  /**
   * Get adjustment statistics
   */
  async getStats(personaId?: number): Promise<any> {
    return this.ajusteRepository.getStats(personaId);
  }

  /**
   * Apply an adjustment to a cuota and return the calculated adjustment
   * This is a helper method that calculates how much to adjust a given monto
   */
  calcularAjuste(ajuste: AjusteCuotaSocio, montoOriginal: number): {
    montoOriginal: number;
    ajuste: number;
    montoFinal: number;
    tipoAjuste: TipoAjusteCuota;
    concepto: string;
  } {
    const valor = Number(ajuste.valor);
    let ajusteCalculado = 0;

    switch (ajuste.tipoAjuste) {
      case 'DESCUENTO_FIJO':
        ajusteCalculado = -Math.min(valor, montoOriginal); // No negative final amount
        break;

      case 'DESCUENTO_PORCENTAJE':
        ajusteCalculado = -((montoOriginal * valor) / 100);
        break;

      case 'RECARGO_FIJO':
        ajusteCalculado = valor;
        break;

      case 'RECARGO_PORCENTAJE':
        ajusteCalculado = (montoOriginal * valor) / 100;
        break;

      case 'MONTO_FIJO_TOTAL':
        ajusteCalculado = valor - montoOriginal;
        break;

      default:
        throw new Error(`Tipo de ajuste desconocido: ${ajuste.tipoAjuste}`);
    }

    const montoFinal = Math.max(0, montoOriginal + ajusteCalculado);

    return {
      montoOriginal,
      ajuste: ajusteCalculado,
      montoFinal,
      tipoAjuste: ajuste.tipoAjuste,
      concepto: ajuste.concepto
    };
  }

  /**
   * Apply multiple adjustments to a monto in sequence
   * Returns detailed breakdown of each adjustment
   */
  calcularAjustesMultiples(
    ajustes: AjusteCuotaSocio[],
    montoOriginal: number
  ): {
    montoOriginal: number;
    ajustes: Array<{
      ajusteId: number;
      concepto: string;
      tipoAjuste: TipoAjusteCuota;
      valor: number;
      ajusteCalculado: number;
      montoIntermedio: number;
    }>;
    montoFinal: number;
    totalAjuste: number;
  } {
    let montoActual = montoOriginal;
    const ajustesDetalle: Array<any> = [];

    // Apply each adjustment sequentially
    for (const ajuste of ajustes) {
      const resultado = this.calcularAjuste(ajuste, montoActual);

      ajustesDetalle.push({
        ajusteId: ajuste.id,
        concepto: ajuste.concepto,
        tipoAjuste: ajuste.tipoAjuste,
        valor: Number(ajuste.valor),
        ajusteCalculado: resultado.ajuste,
        montoIntermedio: resultado.montoFinal
      });

      montoActual = resultado.montoFinal;
    }

    return {
      montoOriginal,
      ajustes: ajustesDetalle,
      montoFinal: montoActual,
      totalAjuste: montoActual - montoOriginal
    };
  }
}
