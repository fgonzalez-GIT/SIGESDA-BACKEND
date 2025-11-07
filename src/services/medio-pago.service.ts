// @ts-nocheck
import { MedioPagoRepository } from '@/repositories/medio-pago.repository';
import { ReciboRepository } from '@/repositories/recibo.repository';
import { MedioPago, EstadoRecibo, MedioPagoTipo } from '@prisma/client';
import {
  CreateMedioPagoDto,
  UpdateMedioPagoDto,
  MedioPagoFilterDto,
  MedioPagoSearchDto,
  MedioPagoStatsDto,
  DeleteBulkMediosPagoDto,
  ValidarPagoCompletoDto,
  ConciliacionBancariaDto,
} from '@/dto/medio-pago.dto';
import { logger } from '@/utils/logger';

export class MedioPagoService {
  constructor(
    private medioPagoRepository: MedioPagoRepository,
    private reciboRepository: ReciboRepository
  ) {}

  // Crear un medio de pago
  async create(data: CreateMedioPagoDto): Promise<MedioPago> {
    // Validar que el recibo existe
    const recibo = await this.reciboRepository.findById(data.reciboId);
    if (!recibo) {
      throw new Error('Recibo no encontrado');
    }

    // Validar que el recibo no esté cancelado
    if (recibo.estado === EstadoRecibo.CANCELADO) {
      throw new Error('No se puede agregar un medio de pago a un recibo cancelado');
    }

    // Validar que el importe no exceda el saldo pendiente
    const totalPagosExistentes = await this.medioPagoRepository.getTotalPagosByRecibo(data.reciboId);
    const saldoPendiente = Number(recibo.importe) - totalPagosExistentes;

    if (data.importe > saldoPendiente + 0.01) { // Tolerancia de 1 centavo
      throw new Error(`El importe (${data.importe}) excede el saldo pendiente (${saldoPendiente})`);
    }

    // Validar duplicados para cheques y transferencias
    if (data.numero && (data.tipo === MedioPagoTipo.CHEQUE || data.tipo === MedioPagoTipo.TRANSFERENCIA)) {
      const isDuplicate = await this.medioPagoRepository.checkDuplicateNumber(data.numero, data.tipo);
      if (isDuplicate) {
        throw new Error(`Ya existe un ${data.tipo.toLowerCase()} con el número ${data.numero}`);
      }
    }

    // Validaciones específicas por tipo
    await this.validateMedioPagoSpecific(data);

    const medioPago = await this.medioPagoRepository.create(data);

    // Actualizar estado del recibo si corresponde
    await this.updateReciboEstado(data.reciboId);

    logger.info(`Medio de pago creado: ${data.tipo} por $${data.importe} para recibo ${recibo.numero} (ID: ${medioPago.id})`);

    return medioPago;
  }

  // Obtener todos los medios de pago con filtros
  async findAll(filters: MedioPagoFilterDto) {
    const result = await this.medioPagoRepository.findMany(filters);
    return {
      ...result,
      pages: result.totalPages
    };
  }

  // Obtener medio de pago por ID
  async findById(id: string): Promise<MedioPago | null> {
    const medioPago = await this.medioPagoRepository.findById(id);
    if (!medioPago) {
      throw new Error('Medio de pago no encontrado');
    }
    return medioPago;
  }

  // Obtener medios de pago por recibo
  async findByReciboId(reciboId: string): Promise<MedioPago[]> {
    const recibo = await this.reciboRepository.findById(reciboId);
    if (!recibo) {
      throw new Error('Recibo no encontrado');
    }

    return this.medioPagoRepository.findByReciboId(reciboId);
  }

  // Actualizar medio de pago
  async update(id: string, data: UpdateMedioPagoDto): Promise<MedioPago> {
    const medioPagoExistente = await this.medioPagoRepository.findById(id);
    if (!medioPagoExistente) {
      throw new Error('Medio de pago no encontrado');
    }

    // Validar que el recibo no esté pagado completo (excepto si es el único medio de pago)
    if (medioPagoExistente.recibo.estado === EstadoRecibo.PAGADO) {
      const mediosPagoDelRecibo = await this.medioPagoRepository.findByReciboId(medioPagoExistente.reciboId);
      if (mediosPagoDelRecibo.length > 1) {
        throw new Error('No se puede modificar un medio de pago de un recibo completamente pagado con múltiples medios de pago');
      }
    }

    // Validar duplicados si se cambia el número
    if (data.numero && data.numero !== medioPagoExistente.numero) {
      const tipo = data.tipo || medioPagoExistente.tipo;
      if (tipo === MedioPagoTipo.CHEQUE || tipo === MedioPagoTipo.TRANSFERENCIA) {
        const isDuplicate = await this.medioPagoRepository.checkDuplicateNumber(data.numero, tipo, id);
        if (isDuplicate) {
          throw new Error(`Ya existe un ${tipo.toLowerCase()} con el número ${data.numero}`);
        }
      }
    }

    // Validar que el nuevo importe no exceda el saldo disponible
    if (data.importe !== undefined) {
      const totalOtrosPagos = await this.getOtrosPagosDelRecibo(medioPagoExistente.reciboId, id);
      const saldoDisponible = Number(medioPagoExistente.recibo.importe) - totalOtrosPagos;

      if (data.importe > saldoDisponible + 0.01) {
        throw new Error(`El nuevo importe (${data.importe}) excede el saldo disponible (${saldoDisponible})`);
      }
    }

    // Validaciones específicas por tipo
    if (data.tipo || data.numero || data.banco) {
      const validationData = {
        tipo: data.tipo || medioPagoExistente.tipo,
        numero: data.numero || medioPagoExistente.numero,
        banco: data.banco || medioPagoExistente.banco,
        importe: data.importe || Number(medioPagoExistente.importe),
        reciboId: medioPagoExistente.reciboId
      };
      await this.validateMedioPagoSpecific(validationData);
    }

    const updatedMedioPago = await this.medioPagoRepository.update(id, data);

    // Actualizar estado del recibo
    await this.updateReciboEstado(medioPagoExistente.reciboId);

    logger.info(`Medio de pago actualizado: ${medioPagoExistente.tipo} (ID: ${id})`);

    return updatedMedioPago;
  }

  // Eliminar medio de pago
  async delete(id: string): Promise<void> {
    const medioPago = await this.medioPagoRepository.findById(id);
    if (!medioPago) {
      throw new Error('Medio de pago no encontrado');
    }

    // Validar que el recibo no esté pagado
    if (medioPago.recibo.estado === EstadoRecibo.PAGADO) {
      throw new Error('No se puede eliminar un medio de pago de un recibo pagado');
    }

    await this.medioPagoRepository.delete(id);

    // Actualizar estado del recibo
    await this.updateReciboEstado(medioPago.reciboId);

    logger.info(`Medio de pago eliminado: ${medioPago.tipo} por $${medioPago.importe} (ID: ${id})`);
  }

  // Eliminar múltiples medios de pago
  async deleteBulk(data: DeleteBulkMediosPagoDto): Promise<{ eliminados: number; errores: string[] }> {
    const errores: string[] = [];
    let eliminados = 0;

    for (const id of data.ids) {
      try {
        const medioPago = await this.medioPagoRepository.findById(id);
        if (!medioPago) {
          errores.push(`Medio de pago ${id} no encontrado`);
          continue;
        }

        if (medioPago.recibo.estado === EstadoRecibo.PAGADO) {
          errores.push(`Medio de pago ${id} no se puede eliminar - recibo pagado`);
          continue;
        }

        await this.medioPagoRepository.delete(id);
        await this.updateReciboEstado(medioPago.reciboId);
        eliminados++;
      } catch (error) {
        errores.push(`Error eliminando medio de pago ${id}: ${error.message}`);
      }
    }

    return { eliminados, errores };
  }

  // Buscar medios de pago
  async search(data: MedioPagoSearchDto) {
    return this.medioPagoRepository.search(data);
  }

  // Obtener estadísticas
  async getStatistics(data: MedioPagoStatsDto) {
    return this.medioPagoRepository.getStats(data);
  }

  // Validar pago completo
  async validatePayment(data: ValidarPagoCompletoDto) {
    const validation = await this.medioPagoRepository.validatePayment(data.reciboId, data.tolerancia);

    // Generar alertas
    const alertas: string[] = [];

    if (validation.estado === 'PARCIAL') {
      alertas.push(`Pago parcial: falta $${Math.abs(validation.diferencia).toFixed(2)}`);
    } else if (validation.estado === 'EXCEDIDO') {
      alertas.push(`Pago excedido: sobra $${validation.diferencia.toFixed(2)}`);
    }

    if (validation.mediosPago.length === 0) {
      alertas.push('No se han registrado medios de pago para este recibo');
    }

    // Verificar fechas de cheques
    validation.mediosPago.forEach(mp => {
      if (mp.tipo === MedioPagoTipo.CHEQUE && mp.fecha > new Date()) {
        alertas.push(`Cheque ${mp.numero} con fecha futura`);
      }
    });

    return {
      ...validation,
      alertas
    };
  }

  // Conciliación bancaria
  async getConciliacionBancaria(data: ConciliacionBancariaDto) {
    const result = await this.medioPagoRepository.getConciliacionBancaria(data);

    // Calcular estadísticas adicionales
    const importes = result.operaciones.map(op => op.importe);
    const estadisticas = {
      promedioOperacion: importes.length > 0 ? importes.reduce((a, b) => a + b, 0) / importes.length : 0,
      operacionMayor: importes.length > 0 ? Math.max(...importes) : 0,
      operacionMenor: importes.length > 0 ? Math.min(...importes) : 0,
      diasConOperaciones: new Set(result.operaciones.map(op =>
        op.fecha.toISOString().split('T')[0]
      )).size
    };

    // Agrupar por tipo
    const tiposOperaciones = result.operaciones.reduce((acc, op) => {
      if (!acc[op.tipo]) {
        acc[op.tipo] = { cantidad: 0, importe: 0 };
      }
      acc[op.tipo].cantidad++;
      acc[op.tipo].importe += op.importe;
      return acc;
    }, {} as Record<MedioPagoTipo, { cantidad: number; importe: number }>);

    return {
      banco: data.banco,
      periodo: {
        desde: new Date(data.fechaDesde),
        hasta: new Date(data.fechaHasta)
      },
      resumen: {
        ...result.resumen,
        tiposOperaciones: Object.entries(tiposOperaciones).map(([tipo, datos]) => ({
          tipo: tipo as MedioPagoTipo,
          cantidad: datos.cantidad,
          importe: datos.importe
        }))
      },
      operaciones: result.operaciones,
      estadisticas
    };
  }

  // Obtener medios de pago por tipo
  async findByTipo(tipo: MedioPagoTipo, limit?: number) {
    return this.medioPagoRepository.findByTipo(tipo, limit);
  }

  // Obtener estadísticas rápidas
  async getQuickStats() {
    return this.medioPagoRepository.getQuickStats();
  }

  // Dashboard de medios de pago
  async getDashboard() {
    const [quickStats, recientesPorTipo] = await Promise.all([
      this.medioPagoRepository.getQuickStats(),
      Promise.all(Object.values(MedioPagoTipo).map(async tipo => ({
        tipo,
        mediosPago: await this.medioPagoRepository.findByTipo(tipo, 5)
      })))
    ]);

    return {
      estadisticasHoy: quickStats,
      recientesPorTipo: recientesPorTipo.filter(item => item.mediosPago.length > 0)
    };
  }

  // Métodos auxiliares privados
  private async validateMedioPagoSpecific(data: {
    tipo: MedioPagoTipo;
    numero?: string | null;
    banco?: string | null;
    importe: number;
    reciboId: string;
  }): Promise<void> {
    // Validaciones específicas por tipo
    if (data.tipo === MedioPagoTipo.CHEQUE) {
      if (!data.numero) {
        throw new Error('El número de cheque es requerido');
      }
      if (!data.banco) {
        throw new Error('El banco es requerido para cheques');
      }
      if (data.numero.length < 3) {
        throw new Error('El número de cheque debe tener al menos 3 caracteres');
      }
    }

    if (data.tipo === MedioPagoTipo.TRANSFERENCIA) {
      if (!data.numero) {
        throw new Error('El número de comprobante es requerido para transferencias');
      }
      if (data.numero.length < 3) {
        throw new Error('El número de comprobante debe tener al menos 3 caracteres');
      }
    }

    if (data.tipo === MedioPagoTipo.EFECTIVO) {
      if (data.importe > 1000000) { // Límite de $1,000,000 para efectivo
        throw new Error('El monto en efectivo no puede exceder $1,000,000');
      }
    }

    if (data.tipo === MedioPagoTipo.TARJETA_CREDITO || data.tipo === MedioPagoTipo.TARJETA_DEBITO) {
      if (data.numero && data.numero.length < 4) {
        throw new Error('El número de autorización debe tener al menos 4 caracteres');
      }
    }
  }

  private async updateReciboEstado(reciboId: string): Promise<void> {
    const validation = await this.medioPagoRepository.validatePayment(reciboId, 0.01);

    let nuevoEstado: EstadoRecibo;
    if (validation.esPagoCompleto) {
      nuevoEstado = EstadoRecibo.PAGADO;
    } else if (validation.importeTotalPagos > 0) {
      nuevoEstado = EstadoRecibo.PENDIENTE; // Pago parcial
    } else {
      nuevoEstado = EstadoRecibo.PENDIENTE; // Sin pagos
    }

    // Solo actualizar si el estado cambió
    const recibo = await this.reciboRepository.findById(reciboId);
    if (recibo && recibo.estado !== nuevoEstado) {
      await this.reciboRepository.update(reciboId, { estado: nuevoEstado });
      logger.info(`Estado del recibo ${recibo.numero} actualizado a ${nuevoEstado}`);
    }
  }

  private async getOtrosPagosDelRecibo(reciboId: string, excludeId: string): Promise<number> {
    const mediosPago = await this.medioPagoRepository.findByReciboId(reciboId);
    return mediosPago
      .filter(mp => mp.id !== excludeId)
      .reduce((sum, mp) => sum + Number(mp.importe), 0);
  }
}