import { ItemCuotaRepository } from '@/repositories/item-cuota.repository';
import { TipoItemCuotaRepository } from '@/repositories/tipo-item-cuota.repository';
import { AppError } from '@/middleware/error.middleware';
import { Prisma } from '@prisma/client';
import { prisma } from '@/config/database';

/**
 * Service para gestión de Ítems de Cuota
 * Implementa validaciones de negocio y lógica compleja
 */
export class ItemCuotaService {
  private repository: ItemCuotaRepository;
  private tipoRepository: TipoItemCuotaRepository;

  constructor() {
    this.repository = new ItemCuotaRepository();
    this.tipoRepository = new TipoItemCuotaRepository();
  }

  /**
   * Obtener todos los ítems de una cuota con resumen
   */
  async getItemsByCuotaId(cuotaId: number) {
    const items = await this.repository.findByCuotaId(cuotaId);
    const summary = await this.repository.getSummaryByCuotaId(cuotaId);

    return {
      items,
      summary
    };
  }

  /**
   * Obtener desglose completo de una cuota
   */
  async getDesgloseByCuotaId(cuotaId: number) {
    return await this.repository.getDesgloseByCuotaId(cuotaId);
  }

  /**
   * Obtener ítem por ID
   */
  async getById(id: number) {
    const item = await this.repository.findById(id);

    if (!item) {
      throw new AppError('Ítem de cuota no encontrado', 404);
    }

    return item;
  }

  /**
   * Agregar ítem manual a una cuota existente
   */
  async addManualItem(data: {
    cuotaId: number;
    tipoItemCodigo: string;
    concepto?: string;
    monto: number;
    cantidad?: number;
    porcentaje?: number;
    observaciones?: string;
    metadata?: any;
  }) {
    // Validar que el tipo de ítem existe y está activo
    const tipoItem = await this.tipoRepository.findByCodigo(data.tipoItemCodigo);
    if (!tipoItem) {
      throw new AppError(`Tipo de ítem '${data.tipoItemCodigo}' no encontrado`, 404);
    }

    if (!tipoItem.activo) {
      throw new AppError('El tipo de ítem está inactivo', 400);
    }

    // Validar que la cuota existe
    const cuota = await prisma.cuota.findUnique({
      where: { id: data.cuotaId },
      include: { recibo: true }
    });

    if (!cuota) {
      throw new AppError('Cuota no encontrada', 404);
    }

    // No permitir modificar cuotas de recibos pagados
    if (cuota.recibo.estado === 'PAGADO') {
      throw new AppError('No se pueden agregar ítems a una cuota con recibo pagado', 400);
    }

    // Validaciones de negocio
    if (data.monto === 0) {
      throw new AppError('El monto no puede ser cero', 400);
    }

    if (data.cantidad !== undefined && data.cantidad <= 0) {
      throw new AppError('La cantidad debe ser mayor a cero', 400);
    }

    if (data.porcentaje !== undefined) {
      if (data.porcentaje < -100 || data.porcentaje > 100) {
        throw new AppError('El porcentaje debe estar entre -100 y 100', 400);
      }
    }

    // Crear el ítem
    const item = await this.repository.create({
      cuota: {
        connect: { id: data.cuotaId }
      },
      tipoItem: {
        connect: { id: tipoItem.id }
      },
      concepto: data.concepto || tipoItem.nombre,
      monto: data.monto,
      cantidad: data.cantidad || 1,
      porcentaje: data.porcentaje,
      esAutomatico: false,
      esEditable: true,
      observaciones: data.observaciones,
      metadata: data.metadata
    });

    // Recalcular total de la cuota
    await this.recalcularTotalCuota(data.cuotaId);

    return item;
  }

  /**
   * Actualizar ítem editable
   */
  async updateItem(itemId: number, data: {
    monto?: number;
    cantidad?: number;
    porcentaje?: number;
    concepto?: string;
    observaciones?: string;
    metadata?: any;
  }) {
    // Verificar que el ítem existe
    const item = await this.repository.findById(itemId);
    if (!item) {
      throw new AppError('Ítem de cuota no encontrado', 404);
    }

    // Verificar que el ítem es editable
    if (!item.esEditable) {
      throw new AppError('Este ítem no es editable', 403);
    }

    // Validar que la cuota no está pagada
    if (item.cuota.recibo.estado === 'PAGADO') {
      throw new AppError('No se pueden modificar ítems de una cuota con recibo pagado', 400);
    }

    // Validaciones de negocio
    if (data.monto !== undefined && data.monto === 0) {
      throw new AppError('El monto no puede ser cero', 400);
    }

    if (data.cantidad !== undefined && data.cantidad <= 0) {
      throw new AppError('La cantidad debe ser mayor a cero', 400);
    }

    if (data.porcentaje !== undefined) {
      if (data.porcentaje < -100 || data.porcentaje > 100) {
        throw new AppError('El porcentaje debe estar entre -100 y 100', 400);
      }
    }

    // Actualizar el ítem
    const updated = await this.repository.update(itemId, data);

    // Recalcular total de la cuota
    await this.recalcularTotalCuota(item.cuotaId);

    return updated;
  }

  /**
   * Eliminar ítem editable
   */
  async deleteItem(itemId: number) {
    const item = await this.repository.findById(itemId);
    if (!item) {
      throw new AppError('Ítem de cuota no encontrado', 404);
    }

    // Verificar que el ítem es editable
    if (!item.esEditable) {
      throw new AppError('Este ítem no puede ser eliminado', 403);
    }

    // Validar que la cuota no está pagada
    if (item.cuota.recibo.estado === 'PAGADO') {
      throw new AppError('No se pueden eliminar ítems de una cuota con recibo pagado', 400);
    }

    const cuotaId = item.cuotaId;

    // Eliminar el ítem
    await this.repository.delete(itemId);

    // Recalcular total de la cuota
    await this.recalcularTotalCuota(cuotaId);

    return { success: true, message: 'Ítem eliminado correctamente' };
  }

  /**
   * Recalcular total de una cuota basado en sus ítems
   * PRIVATE - uso interno
   */
  private async recalcularTotalCuota(cuotaId: number) {
    const total = await this.repository.calculateTotalByCuotaId(cuotaId);

    await prisma.cuota.update({
      where: { id: cuotaId },
      data: { montoTotal: total }
    });

    return total;
  }

  /**
   * Regenerar todos los ítems de una cuota
   * Útil para recalcular cuota completa con nuevas reglas
   */
  async regenerarItems(cuotaId: number, newItems: Array<{
    tipoItemId: number;
    concepto: string;
    monto: number;
    cantidad?: number;
    porcentaje?: number;
    esAutomatico?: boolean;
    esEditable?: boolean;
    observaciones?: string;
    metadata?: any;
  }>) {
    // Validar que la cuota existe
    const cuota = await prisma.cuota.findUnique({
      where: { id: cuotaId },
      include: { recibo: true }
    });

    if (!cuota) {
      throw new AppError('Cuota no encontrada', 404);
    }

    // No permitir modificar cuotas de recibos pagados
    if (cuota.recibo.estado === 'PAGADO') {
      throw new AppError('No se pueden regenerar ítems de una cuota con recibo pagado', 400);
    }

    // Validar que todos los tipos de ítems existen
    const tipoIds = newItems.map(i => i.tipoItemId);
    const tipos = await Promise.all(
      tipoIds.map(id => this.tipoRepository.findById(id))
    );

    if (tipos.some(t => !t)) {
      throw new AppError('Uno o más tipos de ítems no encontrados', 404);
    }

    if (tipos.some(t => !t!.activo)) {
      throw new AppError('Uno o más tipos de ítems están inactivos', 400);
    }

    // Preparar datos para batch insert
    const itemsData = newItems.map(item => ({
      cuotaId,
      tipoItemId: item.tipoItemId,
      concepto: item.concepto,
      monto: item.monto,
      cantidad: item.cantidad || 1,
      porcentaje: item.porcentaje,
      esAutomatico: item.esAutomatico ?? true,
      esEditable: item.esEditable ?? false,
      observaciones: item.observaciones,
      metadata: item.metadata
    }));

    // Reemplazar todos los ítems en una transacción
    const itemsCreados = await this.repository.replaceAllByCuotaId(cuotaId, itemsData);

    // Recalcular total
    await this.recalcularTotalCuota(cuotaId);

    return {
      success: true,
      itemsCreados: itemsCreados.length,
      items: itemsCreados
    };
  }

  /**
   * Obtener ítems automáticos vs manuales de una cuota
   */
  async getItemsSegmentadosByCuotaId(cuotaId: number) {
    const automaticos = await this.repository.findAutomaticosByCuotaId(cuotaId);
    const manuales = await this.repository.findManualesByCuotaId(cuotaId);

    return {
      automaticos,
      manuales,
      totalAutomaticos: automaticos.length,
      totalManuales: manuales.length
    };
  }

  /**
   * Duplicar ítem (crear copia editable)
   */
  async duplicarItem(itemId: number) {
    const item = await this.repository.findById(itemId);
    if (!item) {
      throw new AppError('Ítem de cuota no encontrado', 404);
    }

    // Validar que la cuota no está pagada
    if (item.cuota.recibo.estado === 'PAGADO') {
      throw new AppError('No se pueden duplicar ítems de una cuota con recibo pagado', 400);
    }

    // Crear copia editable
    const duplicado = await this.repository.create({
      cuota: {
        connect: { id: item.cuotaId }
      },
      tipoItem: {
        connect: { id: item.tipoItemId }
      },
      concepto: `${item.concepto} (copia)`,
      monto: item.monto,
      cantidad: item.cantidad,
      porcentaje: item.porcentaje,
      esAutomatico: false,
      esEditable: true,
      observaciones: item.observaciones,
      metadata: item.metadata || undefined
    });

    // Recalcular total
    await this.recalcularTotalCuota(item.cuotaId);

    return duplicado;
  }

  /**
   * Obtener estadísticas globales de ítems
   */
  async getGlobalStats() {
    return await this.repository.getGlobalStats();
  }

  /**
   * Buscar ítems por tipo (código de tipo)
   */
  async findByTipoItemCodigo(codigo: string, options?: {
    limit?: number;
    offset?: number;
  }) {
    return await this.repository.findByTipoItemCodigo(codigo, options);
  }

  /**
   * Buscar ítems por categoría (código de categoría)
   */
  async findByCategoriaCodigo(codigo: string, options?: {
    limit?: number;
    offset?: number;
  }) {
    return await this.repository.findByCategoriaCodigo(codigo, options);
  }

  /**
   * Validar si una cuota puede ser modificada
   * (recibo no pagado)
   */
  async validateCuotaEditable(cuotaId: number): Promise<boolean> {
    const cuota = await prisma.cuota.findUnique({
      where: { id: cuotaId },
      include: { recibo: true }
    });

    if (!cuota) {
      throw new AppError('Cuota no encontrada', 404);
    }

    if (cuota.recibo.estado === 'PAGADO') {
      throw new AppError('La cuota tiene un recibo pagado y no puede ser modificada', 400);
    }

    return true;
  }

  /**
   * Aplicar descuento porcentual a todos los ítems de una cuota
   * Crea un nuevo ítem de descuento
   */
  async aplicarDescuentoGlobal(cuotaId: number, porcentaje: number, concepto?: string) {
    // Validaciones
    await this.validateCuotaEditable(cuotaId);

    if (porcentaje <= 0 || porcentaje > 100) {
      throw new AppError('El porcentaje debe estar entre 0 y 100', 400);
    }

    // Calcular monto actual de la cuota
    const totalActual = await this.repository.calculateTotalByCuotaId(cuotaId);

    // Calcular descuento
    const montoDescuento = -(totalActual * (porcentaje / 100));

    // Buscar tipo de ítem de descuento general
    const tipoDescuento = await this.tipoRepository.findByCodigo('BONIFICACION_ESPECIAL');
    if (!tipoDescuento) {
      throw new AppError('Tipo de ítem de bonificación no encontrado', 500);
    }

    // Crear ítem de descuento
    const item = await this.repository.create({
      cuota: {
        connect: { id: cuotaId }
      },
      tipoItem: {
        connect: { id: tipoDescuento.id }
      },
      concepto: concepto || `Descuento ${porcentaje}%`,
      monto: montoDescuento,
      cantidad: 1,
      porcentaje,
      esAutomatico: false,
      esEditable: true,
      observaciones: `Descuento global del ${porcentaje}% sobre total de $${totalActual.toFixed(2)}`
    });

    // Recalcular total
    await this.recalcularTotalCuota(cuotaId);

    return item;
  }
}
