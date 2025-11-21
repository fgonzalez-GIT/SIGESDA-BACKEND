// @ts-nocheck
import { Recibo, TipoRecibo, EstadoRecibo } from '@prisma/client';
import { ReciboRepository } from '@/repositories/recibo.repository';
import { PersonaRepository } from '@/repositories/persona.repository';
import {
  CreateReciboDto,
  UpdateReciboDto,
  ChangeEstadoReciboDto,
  ReciboQueryDto,
  CreateBulkRecibosDto,
  DeleteBulkRecibosDto,
  UpdateBulkEstadosDto,
  ReciboSearchDto,
  ReciboStatsDto,
  ProcessPaymentDto
} from '@/dto/recibo.dto';
import { logger } from '@/utils/logger';
import { hasActiveTipo } from '@/utils/persona.helper';

export class ReciboService {
  constructor(
    private reciboRepository: ReciboRepository,
    private personaRepository: PersonaRepository
  ) {}

  async createRecibo(data: CreateReciboDto): Promise<Recibo> {
    // Validate emisor if provided
    if (data.emisorId) {
      const emisor = await this.personaRepository.findById(data.emisorId);
      if (!emisor) {
        throw new Error(`Emisor con ID ${data.emisorId} no encontrado`);
      }
      // Business rule: Only active personas can be emisor
      if (emisor.fechaBaja) {
        throw new Error(`El emisor ${emisor.nombre} ${emisor.apellido} está dado de baja`);
      }
    }

    // Validate receptor if provided
    if (data.receptorId) {
      const receptor = await this.personaRepository.findById(data.receptorId);
      if (!receptor) {
        throw new Error(`Receptor con ID ${data.receptorId} no encontrado`);
      }

      // Business rules for different receipt types
      await this.validateReceptorByTipo(data.tipo, receptor);
    }

    // Generate unique receipt number
    const numero = await this.reciboRepository.getNextNumero();

    // Validate business rules
    await this.validateBusinessRules(data);

    const recibo = await this.reciboRepository.create({ ...data, numero });

    logger.info(`Recibo creado: ${numero} - ${data.tipo} - $${data.importe} (ID: ${recibo.id})`);

    return recibo;
  }

  async getRecibos(query: ReciboQueryDto): Promise<{ data: Recibo[]; total: number; pages: number }> {
    const result = await this.reciboRepository.findAll(query);
    const pages = Math.ceil(result.total / query.limit);

    return {
      ...result,
      pages
    };
  }

  async getReciboById(id: string): Promise<Recibo | null> {
    return this.reciboRepository.findById(id);
  }

  async getReciboByNumero(numero: string): Promise<Recibo | null> {
    return this.reciboRepository.findByNumero(numero);
  }

  async getRecibosByPersona(personaId: string, tipo?: 'emisor' | 'receptor'): Promise<Recibo[]> {
    // Validate persona exists
    const persona = await this.personaRepository.findById(personaId);
    if (!persona) {
      throw new Error(`Persona con ID ${personaId} no encontrada`);
    }

    return this.reciboRepository.findByPersonaId(personaId, tipo);
  }

  async updateRecibo(id: string, data: UpdateReciboDto): Promise<Recibo> {
    const existingRecibo = await this.reciboRepository.findById(id);
    if (!existingRecibo) {
      throw new Error(`Recibo con ID ${id} no encontrado`);
    }

    // Business rule: Can't modify paid or cancelled receipts
    if (existingRecibo.estado === EstadoRecibo.PAGADO || existingRecibo.estado === EstadoRecibo.CANCELADO) {
      throw new Error(`No se puede modificar un recibo en estado ${existingRecibo.estado}`);
    }

    // Validate emisor if being updated
    if (data.emisorId !== undefined) {
      if (data.emisorId) {
        const emisor = await this.personaRepository.findById(data.emisorId);
        if (!emisor || emisor.fechaBaja) {
          throw new Error(`Emisor con ID ${data.emisorId} no válido o inactivo`);
        }
      }
    }

    // Validate receptor if being updated
    if (data.receptorId !== undefined) {
      if (data.receptorId) {
        const receptor = await this.personaRepository.findById(data.receptorId);
        if (!receptor) {
          throw new Error(`Receptor con ID ${data.receptorId} no encontrado`);
        }

        const tipoRecibo = data.tipo || existingRecibo.tipo;
        await this.validateReceptorByTipo(tipoRecibo, receptor);
      }
    }

    const updatedRecibo = await this.reciboRepository.update(id, data);

    logger.info(`Recibo actualizado: ${existingRecibo.numero} (ID: ${id})`);

    return updatedRecibo;
  }

  async changeEstado(id: string, data: ChangeEstadoReciboDto): Promise<Recibo> {
    const existingRecibo = await this.reciboRepository.findById(id);
    if (!existingRecibo) {
      throw new Error(`Recibo con ID ${id} no encontrado`);
    }

    // Validate state transition
    this.validateStateTransition(existingRecibo.estado, data.nuevoEstado);

    const updatedRecibo = await this.reciboRepository.updateEstado(id, data.nuevoEstado, data.observaciones);

    logger.info(`Estado de recibo cambiado: ${existingRecibo.numero} de ${existingRecibo.estado} a ${data.nuevoEstado}`);

    return updatedRecibo;
  }

  async deleteRecibo(id: string): Promise<Recibo> {
    const existingRecibo = await this.reciboRepository.findById(id);
    if (!existingRecibo) {
      throw new Error(`Recibo con ID ${id} no encontrado`);
    }

    // Business rule: Can't delete paid receipts
    if (existingRecibo.estado === EstadoRecibo.PAGADO) {
      throw new Error(`No se puede eliminar un recibo pagado`);
    }

    // Business rule: Can't delete receipts with payments
    if (existingRecibo.mediosPago && existingRecibo.mediosPago.length > 0) {
      throw new Error(`No se puede eliminar un recibo que tiene medios de pago registrados`);
    }

    const deletedRecibo = await this.reciboRepository.delete(id);

    logger.info(`Recibo eliminado: ${existingRecibo.numero} (ID: ${id})`);

    return deletedRecibo;
  }

  async createBulkRecibos(data: CreateBulkRecibosDto): Promise<{ count: number; errors: string[] }> {
    const errors: string[] = [];
    const validRecibos: (CreateReciboDto & { numero: string })[] = [];

    // Pre-generate all numbers to avoid conflicts
    let currentNumber = parseInt(await this.reciboRepository.getNextNumero());

    // Validate each receipt
    for (const recibo of data.recibos) {
      try {
        // Validate emisor and receptor
        if (recibo.emisorId) {
          const emisor = await this.personaRepository.findById(recibo.emisorId);
          if (!emisor || emisor.fechaBaja) {
            errors.push(`Emisor ${recibo.emisorId} no válido`);
            continue;
          }
        }

        if (recibo.receptorId) {
          const receptor = await this.personaRepository.findById(recibo.receptorId);
          if (!receptor) {
            errors.push(`Receptor ${recibo.receptorId} no encontrado`);
            continue;
          }

          try {
            await this.validateReceptorByTipo(recibo.tipo, receptor);
          } catch (error) {
            errors.push(`Receptor ${recibo.receptorId}: ${error}`);
            continue;
          }
        }

        // Business rules validation
        try {
          await this.validateBusinessRules(recibo);
        } catch (error) {
          errors.push(`Validación de negocio: ${error}`);
          continue;
        }

        // Assign number and add to valid list
        const numero = currentNumber.toString().padStart(6, '0');
        validRecibos.push({ ...recibo, numero });
        currentNumber++;

      } catch (error) {
        errors.push(`Error validando recibo: ${error}`);
      }
    }

    // Create valid receipts
    const result = validRecibos.length > 0
      ? await this.reciboRepository.createBulk(validRecibos)
      : { count: 0 };

    logger.info(`Creación masiva de recibos: ${result.count} creados, ${errors.length} errores`);

    return {
      count: result.count,
      errors
    };
  }

  async deleteBulkRecibos(data: DeleteBulkRecibosDto): Promise<{ count: number }> {
    // Validate that all receipts can be deleted
    const recibos = await Promise.all(
      data.ids.map(id => this.reciboRepository.findById(id))
    );

    const invalidIds = recibos
      .filter((recibo, index) => {
        if (!recibo) return true;
        if (recibo.estado === EstadoRecibo.PAGADO) return true;
        if (recibo.mediosPago && recibo.mediosPago.length > 0) return true;
        return false;
      })
      .map((_, index) => data.ids[index]);

    if (invalidIds.length > 0) {
      throw new Error(`No se pueden eliminar los siguientes recibos: ${invalidIds.join(', ')}`);
    }

    const result = await this.reciboRepository.deleteBulk(data.ids);

    logger.info(`Eliminación masiva de recibos: ${result.count} eliminados`);

    return result;
  }

  async updateBulkEstados(data: UpdateBulkEstadosDto): Promise<{ count: number }> {
    // Validate state transitions for all receipts
    const recibos = await Promise.all(
      data.ids.map(id => this.reciboRepository.findById(id))
    );

    const invalidTransitions = recibos
      .filter((recibo, index) => {
        if (!recibo) return true;
        try {
          this.validateStateTransition(recibo.estado, data.nuevoEstado);
          return false;
        } catch {
          return true;
        }
      })
      .map((recibo, index) => ({ id: data.ids[index], numero: recibo?.numero }));

    if (invalidTransitions.length > 0) {
      const invalidList = invalidTransitions.map(r => r.numero || r.id).join(', ');
      throw new Error(`Transiciones de estado inválidas para: ${invalidList}`);
    }

    const result = await this.reciboRepository.updateBulkEstados(data.ids, data.nuevoEstado, data.observaciones);

    logger.info(`Actualización masiva de estados: ${result.count} recibos actualizados a ${data.nuevoEstado}`);

    return result;
  }

  async searchRecibos(searchData: ReciboSearchDto): Promise<Recibo[]> {
    return this.reciboRepository.search(searchData);
  }

  async getStatistics(statsData: ReciboStatsDto): Promise<any> {
    return this.reciboRepository.getStatistics(statsData);
  }

  async getVencidos(): Promise<Recibo[]> {
    return this.reciboRepository.getVencidos();
  }

  async getPendientes(): Promise<Recibo[]> {
    return this.reciboRepository.getPendientes();
  }

  async processVencidos(): Promise<{ count: number }> {
    const result = await this.reciboRepository.markVencidosAsVencido();

    logger.info(`Procesamiento automático de vencidos: ${result.count} recibos marcados como vencidos`);

    return result;
  }

  // Helper method to validate receptor by receipt type
  private async validateReceptorByTipo(tipo: TipoRecibo, receptor: any): Promise<void> {
    switch (tipo) {
      case TipoRecibo.CUOTA:
        const esSocio = await hasActiveTipo(receptor.id, 'SOCIO');
        if (!esSocio) {
          throw new Error(`Las cuotas solo pueden ser emitidas a socios`);
        }
        if (!receptor.activo) {
          throw new Error(`No se puede emitir cuota a socio inactivo`);
        }
        break;

      case TipoRecibo.SUELDO:
        const esDocente = await hasActiveTipo(receptor.id, 'DOCENTE');
        if (!esDocente) {
          throw new Error(`Los sueldos solo pueden ser emitidos a docentes`);
        }
        if (!receptor.activo) {
          throw new Error(`No se puede emitir sueldo a docente inactivo`);
        }
        break;

      case TipoRecibo.PAGO_ACTIVIDAD:
        // Activity payments can be to any active person
        if (!receptor.activo) {
          throw new Error(`No se puede emitir pago de actividad a persona inactiva`);
        }
        break;

      case TipoRecibo.DEUDA:
        // Debt receipts can be to any person
        break;

      default:
        throw new Error(`Tipo de recibo no válido: ${tipo}`);
    }
  }

  // Helper method to validate state transitions
  private validateStateTransition(currentState: EstadoRecibo, newState: EstadoRecibo): void {
    const validTransitions: Record<EstadoRecibo, EstadoRecibo[]> = {
      [EstadoRecibo.PENDIENTE]: [EstadoRecibo.PAGADO, EstadoRecibo.VENCIDO, EstadoRecibo.CANCELADO],
      [EstadoRecibo.VENCIDO]: [EstadoRecibo.PAGADO, EstadoRecibo.CANCELADO],
      [EstadoRecibo.PAGADO]: [], // Paid receipts can't change state
      [EstadoRecibo.CANCELADO]: [] // Cancelled receipts can't change state
    };

    if (!validTransitions[currentState].includes(newState)) {
      throw new Error(`Transición de estado inválida: de ${currentState} a ${newState}`);
    }
  }

  // Helper method to validate business rules
  private async validateBusinessRules(data: CreateReciboDto): Promise<void> {
    // Validate amount is reasonable
    if (data.importe > 1000000) {
      throw new Error(`El importe es excesivamente alto: $${data.importe}`);
    }

    // Validate due date is not too far in the future
    if (data.fechaVencimiento) {
      const vencimiento = new Date(data.fechaVencimiento);
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 2); // Max 2 years in future

      if (vencimiento > maxDate) {
        throw new Error(`La fecha de vencimiento es demasiado lejana`);
      }
    }

    // Validate concept is meaningful
    if (data.concepto.length < 5) {
      throw new Error(`El concepto debe ser más descriptivo`);
    }

    // Additional business rules can be added here
  }
}