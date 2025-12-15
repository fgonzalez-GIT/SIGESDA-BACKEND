import { ExencionCuota, Prisma } from '@prisma/client';
import { ExencionCuotaRepository } from '@/repositories/exencion-cuota.repository';
import { HistorialAjusteCuotaRepository } from '@/repositories/historial-ajuste-cuota.repository';
import { PersonaRepository } from '@/repositories/persona.repository';
import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import {
  CreateExencionCuotaDto,
  UpdateExencionCuotaDto,
  AprobarExencionDto,
  RechazarExencionDto,
  RevocarExencionDto,
  QueryExencionCuotaDto
} from '@/dto/exencion-cuota.dto';

/**
 * Service for managing temporary exemptions from cuota payments
 * FASE 4 - Task 4.2: Exenciones Temporales
 *
 * Features:
 * - Create/update/delete exemptions with automatic history tracking
 * - Approval workflow (solicitud → aprobación/rechazo)
 * - Calculate if exemption applies to a cuota period
 * - Auto-expire exemptions (vencidas)
 * - Validate business rules
 */
export class ExencionCuotaService {
  constructor(
    private exencionRepository: ExencionCuotaRepository,
    private historialRepository: HistorialAjusteCuotaRepository,
    private personaRepository: PersonaRepository
  ) {}

  private get prisma() {
    return prisma;
  }

  /**
   * Create a new exemption (starts in PENDIENTE_APROBACION state)
   */
  async createExencion(data: CreateExencionCuotaDto, usuario?: string): Promise<ExencionCuota> {
    // Validate persona exists and is active
    const persona = await this.personaRepository.findById(data.personaId);
    if (!persona) {
      throw new Error(`Persona con ID ${data.personaId} no encontrada`);
    }

    if (!persona.activo) {
      throw new Error(`No se puede crear exención para persona inactiva (ID: ${data.personaId})`);
    }

    // Validate dates
    if (data.fechaFin && data.fechaFin < data.fechaInicio) {
      throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    // Validate tipo TOTAL has 100% exemption
    if (data.tipoExencion === 'TOTAL' && data.porcentajeExencion !== 100) {
      throw new Error('Exención TOTAL debe tener porcentaje 100%');
    }

    // Create exemption within transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const exencion = await this.exencionRepository.create({
        ...data,
        porcentajeExencion: new Prisma.Decimal(data.porcentajeExencion || 100),
        solicitadoPor: data.solicitadoPor || usuario
      }, tx);

      // Create history entry
      await this.historialRepository.create({
        exencionId: exencion.id,
        personaId: data.personaId,
        accion: 'CREAR_EXENCION',
        datosNuevos: {
          tipoExencion: exencion.tipoExencion,
          motivoExencion: exencion.motivoExencion,
          porcentajeExencion: exencion.porcentajeExencion.toString(),
          fechaInicio: exencion.fechaInicio,
          fechaFin: exencion.fechaFin,
          descripcion: exencion.descripcion
        },
        usuario: usuario || data.solicitadoPor,
        motivoCambio: 'Creación de nueva exención'
      }, tx);

      return exencion;
    });

    logger.info(
      `Exención creada: ${result.motivoExencion} (${result.tipoExencion}) para persona ${data.personaId} - ID: ${result.id}`
    );

    return result;
  }

  /**
   * Approve an exemption
   */
  async aprobarExencion(id: number, data: AprobarExencionDto, usuario?: string): Promise<ExencionCuota> {
    const exencion = await this.exencionRepository.findById(id);
    if (!exencion) {
      throw new Error(`Exención con ID ${id} no encontrada`);
    }

    if (exencion.estado !== 'PENDIENTE_APROBACION') {
      throw new Error(`Solo se pueden aprobar exenciones en estado PENDIENTE_APROBACION (estado actual: ${exencion.estado})`);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const exencionAprobada = await this.exencionRepository.aprobar(
        id,
        data.aprobadoPor,
        data.observaciones,
        tx
      );

      await this.historialRepository.create({
        exencionId: id,
        personaId: exencion.personaId,
        accion: 'MODIFICAR_EXENCION',
        datosPrevios: {
          estado: exencion.estado
        },
        datosNuevos: {
          estado: 'APROBADA',
          aprobadoPor: data.aprobadoPor,
          fechaAprobacion: new Date()
        },
        usuario: usuario || data.aprobadoPor,
        motivoCambio: 'Aprobación de exención'
      }, tx);

      return exencionAprobada;
    });

    logger.info(`Exención aprobada: ID ${id} por ${data.aprobadoPor}`);
    return result;
  }

  /**
   * Reject an exemption
   */
  async rechazarExencion(id: number, data: RechazarExencionDto, usuario?: string): Promise<ExencionCuota> {
    const exencion = await this.exencionRepository.findById(id);
    if (!exencion) {
      throw new Error(`Exención con ID ${id} no encontrada`);
    }

    if (exencion.estado !== 'PENDIENTE_APROBACION') {
      throw new Error(`Solo se pueden rechazar exenciones en estado PENDIENTE_APROBACION`);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const exencionRechazada = await this.exencionRepository.rechazar(id, data.motivoRechazo, tx);

      await this.historialRepository.create({
        exencionId: id,
        personaId: exencion.personaId,
        accion: 'MODIFICAR_EXENCION',
        datosPrevios: {
          estado: exencion.estado
        },
        datosNuevos: {
          estado: 'RECHAZADA',
          observaciones: data.motivoRechazo
        },
        usuario,
        motivoCambio: data.motivoRechazo
      }, tx);

      return exencionRechazada;
    });

    logger.info(`Exención rechazada: ID ${id} - ${data.motivoRechazo}`);
    return result;
  }

  /**
   * Revoke an approved exemption
   */
  async revocarExencion(id: number, data: RevocarExencionDto, usuario?: string): Promise<ExencionCuota> {
    const exencion = await this.exencionRepository.findById(id);
    if (!exencion) {
      throw new Error(`Exención con ID ${id} no encontrada`);
    }

    if (!['APROBADA', 'VIGENTE'].includes(exencion.estado)) {
      throw new Error(`Solo se pueden revocar exenciones aprobadas o vigentes`);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const exencionRevocada = await this.exencionRepository.revocar(id, data.motivoRevocacion, tx);

      await this.historialRepository.create({
        exencionId: id,
        personaId: exencion.personaId,
        accion: 'ELIMINAR_EXENCION',
        datosPrevios: {
          estado: exencion.estado,
          activa: exencion.activa
        },
        datosNuevos: {
          estado: 'REVOCADA',
          activa: false
        },
        usuario,
        motivoCambio: data.motivoRevocacion
      }, tx);

      return exencionRevocada;
    });

    logger.warn(`Exención revocada: ID ${id} - ${data.motivoRevocacion}`);
    return result;
  }

  /**
   * Update an exemption (only if PENDIENTE_APROBACION)
   */
  async updateExencion(id: number, data: UpdateExencionCuotaDto, usuario?: string): Promise<ExencionCuota> {
    const exencion = await this.exencionRepository.findById(id);
    if (!exencion) {
      throw new Error(`Exención con ID ${id} no encontrada`);
    }

    if (exencion.estado !== 'PENDIENTE_APROBACION') {
      throw new Error(`Solo se pueden modificar exenciones en estado PENDIENTE_APROBACION`);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const exencionActualizada = await this.exencionRepository.update(id, data, tx);

      await this.historialRepository.create({
        exencionId: id,
        personaId: exencion.personaId,
        accion: 'MODIFICAR_EXENCION',
        datosPrevios: {
          descripcion: exencion.descripcion,
          tipoExencion: exencion.tipoExencion,
          motivoExencion: exencion.motivoExencion,
          porcentajeExencion: exencion.porcentajeExencion.toString()
        },
        datosNuevos: data,
        usuario,
        motivoCambio: 'Modificación de exención pendiente'
      }, tx);

      return exencionActualizada;
    });

    logger.info(`Exención modificada: ID ${id}`);
    return result;
  }

  /**
   * Delete an exemption (only if PENDIENTE_APROBACION or RECHAZADA)
   */
  async deleteExencion(id: number, usuario?: string): Promise<void> {
    const exencion = await this.exencionRepository.findById(id);
    if (!exencion) {
      throw new Error(`Exención con ID ${id} no encontrada`);
    }

    if (!['PENDIENTE_APROBACION', 'RECHAZADA'].includes(exencion.estado)) {
      throw new Error(`Solo se pueden eliminar exenciones en estado PENDIENTE_APROBACION o RECHAZADA`);
    }

    await this.prisma.$transaction(async (tx) => {
      await this.historialRepository.create({
        exencionId: null,
        personaId: exencion.personaId,
        accion: 'ELIMINAR_EXENCION',
        datosPrevios: {
          id: exencion.id,
          estado: exencion.estado,
          descripcion: exencion.descripcion
        },
        datosNuevos: { deleted: true },
        usuario,
        motivoCambio: 'Eliminación de exención'
      }, tx);

      await this.exencionRepository.delete(id, tx);
    });

    logger.warn(`Exención eliminada: ID ${id}`);
  }

  /**
   * Get exemption by ID
   */
  async getExencionById(id: number): Promise<ExencionCuota | null> {
    return this.exencionRepository.findById(id);
  }

  /**
   * Get all exemptions for a persona
   */
  async getExencionesByPersonaId(personaId: number, soloActivas = false): Promise<ExencionCuota[]> {
    return this.exencionRepository.findByPersonaId(personaId, soloActivas);
  }

  /**
   * Get exemptions with filters
   */
  async getExenciones(filters?: QueryExencionCuotaDto): Promise<ExencionCuota[]> {
    return this.exencionRepository.findAll(filters);
  }

  /**
   * Get pending exemptions
   */
  async getPendientes(): Promise<ExencionCuota[]> {
    return this.exencionRepository.findPendientes();
  }

  /**
   * Get active exemptions
   */
  async getVigentes(): Promise<ExencionCuota[]> {
    return this.exencionRepository.findVigentes();
  }

  /**
   * Get statistics
   */
  async getStats(personaId?: number): Promise<any> {
    return this.exencionRepository.getStats(personaId);
  }

  /**
   * Check if a persona has active exemption for a period
   * Returns exemption details if applicable
   */
  async checkExencionParaPeriodo(
    personaId: number,
    fecha: Date
  ): Promise<{ tieneExencion: boolean; porcentaje: number; exencion?: ExencionCuota }> {
    const exenciones = await this.exencionRepository.findActiveByPersonaAndPeriodo(personaId, fecha);

    if (exenciones.length === 0) {
      return { tieneExencion: false, porcentaje: 0 };
    }

    // Take the highest percentage exemption
    const exencion = exenciones[0];

    return {
      tieneExencion: true,
      porcentaje: Number(exencion.porcentajeExencion),
      exencion
    };
  }

  /**
   * Update expired exemptions (cron job)
   */
  async updateVencidas(): Promise<number> {
    const count = await this.exencionRepository.updateVencidas();
    if (count > 0) {
      logger.info(`${count} exenciones marcadas como vencidas`);
    }
    return count;
  }
}
