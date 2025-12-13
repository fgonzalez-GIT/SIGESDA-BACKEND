"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemCuotaService = void 0;
const item_cuota_repository_1 = require("@/repositories/item-cuota.repository");
const tipo_item_cuota_repository_1 = require("@/repositories/tipo-item-cuota.repository");
const error_middleware_1 = require("@/middleware/error.middleware");
const database_1 = require("@/config/database");
class ItemCuotaService {
    constructor() {
        this.repository = new item_cuota_repository_1.ItemCuotaRepository();
        this.tipoRepository = new tipo_item_cuota_repository_1.TipoItemCuotaRepository();
    }
    async getItemsByCuotaId(cuotaId) {
        const items = await this.repository.findByCuotaId(cuotaId);
        const summary = await this.repository.getSummaryByCuotaId(cuotaId);
        return {
            items,
            summary
        };
    }
    async getDesgloseByCuotaId(cuotaId) {
        return await this.repository.getDesgloseByCuotaId(cuotaId);
    }
    async getById(id) {
        const item = await this.repository.findById(id);
        if (!item) {
            throw new error_middleware_1.AppError('Ítem de cuota no encontrado', 404);
        }
        return item;
    }
    async addManualItem(data) {
        const tipoItem = await this.tipoRepository.findByCodigo(data.tipoItemCodigo);
        if (!tipoItem) {
            throw new error_middleware_1.AppError(`Tipo de ítem '${data.tipoItemCodigo}' no encontrado`, 404);
        }
        if (!tipoItem.activo) {
            throw new error_middleware_1.AppError('El tipo de ítem está inactivo', 400);
        }
        const cuota = await database_1.prisma.cuota.findUnique({
            where: { id: data.cuotaId },
            include: { recibo: true }
        });
        if (!cuota) {
            throw new error_middleware_1.AppError('Cuota no encontrada', 404);
        }
        if (cuota.recibo.estado === 'PAGADO') {
            throw new error_middleware_1.AppError('No se pueden agregar ítems a una cuota con recibo pagado', 400);
        }
        if (data.monto === 0) {
            throw new error_middleware_1.AppError('El monto no puede ser cero', 400);
        }
        if (data.cantidad !== undefined && data.cantidad <= 0) {
            throw new error_middleware_1.AppError('La cantidad debe ser mayor a cero', 400);
        }
        if (data.porcentaje !== undefined) {
            if (data.porcentaje < -100 || data.porcentaje > 100) {
                throw new error_middleware_1.AppError('El porcentaje debe estar entre -100 y 100', 400);
            }
        }
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
        await this.recalcularTotalCuota(data.cuotaId);
        return item;
    }
    async updateItem(itemId, data) {
        const item = await this.repository.findById(itemId);
        if (!item) {
            throw new error_middleware_1.AppError('Ítem de cuota no encontrado', 404);
        }
        if (!item.esEditable) {
            throw new error_middleware_1.AppError('Este ítem no es editable', 403);
        }
        if (item.cuota.recibo.estado === 'PAGADO') {
            throw new error_middleware_1.AppError('No se pueden modificar ítems de una cuota con recibo pagado', 400);
        }
        if (data.monto !== undefined && data.monto === 0) {
            throw new error_middleware_1.AppError('El monto no puede ser cero', 400);
        }
        if (data.cantidad !== undefined && data.cantidad <= 0) {
            throw new error_middleware_1.AppError('La cantidad debe ser mayor a cero', 400);
        }
        if (data.porcentaje !== undefined) {
            if (data.porcentaje < -100 || data.porcentaje > 100) {
                throw new error_middleware_1.AppError('El porcentaje debe estar entre -100 y 100', 400);
            }
        }
        const updated = await this.repository.update(itemId, data);
        await this.recalcularTotalCuota(item.cuotaId);
        return updated;
    }
    async deleteItem(itemId) {
        const item = await this.repository.findById(itemId);
        if (!item) {
            throw new error_middleware_1.AppError('Ítem de cuota no encontrado', 404);
        }
        if (!item.esEditable) {
            throw new error_middleware_1.AppError('Este ítem no puede ser eliminado', 403);
        }
        if (item.cuota.recibo.estado === 'PAGADO') {
            throw new error_middleware_1.AppError('No se pueden eliminar ítems de una cuota con recibo pagado', 400);
        }
        const cuotaId = item.cuotaId;
        await this.repository.delete(itemId);
        await this.recalcularTotalCuota(cuotaId);
        return { success: true, message: 'Ítem eliminado correctamente' };
    }
    async recalcularTotalCuota(cuotaId) {
        const total = await this.repository.calculateTotalByCuotaId(cuotaId);
        await database_1.prisma.cuota.update({
            where: { id: cuotaId },
            data: { montoTotal: total }
        });
        return total;
    }
    async regenerarItems(cuotaId, newItems) {
        const cuota = await database_1.prisma.cuota.findUnique({
            where: { id: cuotaId },
            include: { recibo: true }
        });
        if (!cuota) {
            throw new error_middleware_1.AppError('Cuota no encontrada', 404);
        }
        if (cuota.recibo.estado === 'PAGADO') {
            throw new error_middleware_1.AppError('No se pueden regenerar ítems de una cuota con recibo pagado', 400);
        }
        const tipoIds = newItems.map(i => i.tipoItemId);
        const tipos = await Promise.all(tipoIds.map(id => this.tipoRepository.findById(id)));
        if (tipos.some(t => !t)) {
            throw new error_middleware_1.AppError('Uno o más tipos de ítems no encontrados', 404);
        }
        if (tipos.some(t => !t.activo)) {
            throw new error_middleware_1.AppError('Uno o más tipos de ítems están inactivos', 400);
        }
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
        const itemsCreados = await this.repository.replaceAllByCuotaId(cuotaId, itemsData);
        await this.recalcularTotalCuota(cuotaId);
        return {
            success: true,
            itemsCreados: itemsCreados.length,
            items: itemsCreados
        };
    }
    async getItemsSegmentadosByCuotaId(cuotaId) {
        const automaticos = await this.repository.findAutomaticosByCuotaId(cuotaId);
        const manuales = await this.repository.findManualesByCuotaId(cuotaId);
        return {
            automaticos,
            manuales,
            totalAutomaticos: automaticos.length,
            totalManuales: manuales.length
        };
    }
    async duplicarItem(itemId) {
        const item = await this.repository.findById(itemId);
        if (!item) {
            throw new error_middleware_1.AppError('Ítem de cuota no encontrado', 404);
        }
        if (item.cuota.recibo.estado === 'PAGADO') {
            throw new error_middleware_1.AppError('No se pueden duplicar ítems de una cuota con recibo pagado', 400);
        }
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
        await this.recalcularTotalCuota(item.cuotaId);
        return duplicado;
    }
    async getGlobalStats() {
        return await this.repository.getGlobalStats();
    }
    async findByTipoItemCodigo(codigo, options) {
        return await this.repository.findByTipoItemCodigo(codigo, options);
    }
    async findByCategoriaCodigo(codigo, options) {
        return await this.repository.findByCategoriaCodigo(codigo, options);
    }
    async validateCuotaEditable(cuotaId) {
        const cuota = await database_1.prisma.cuota.findUnique({
            where: { id: cuotaId },
            include: { recibo: true }
        });
        if (!cuota) {
            throw new error_middleware_1.AppError('Cuota no encontrada', 404);
        }
        if (cuota.recibo.estado === 'PAGADO') {
            throw new error_middleware_1.AppError('La cuota tiene un recibo pagado y no puede ser modificada', 400);
        }
        return true;
    }
    async aplicarDescuentoGlobal(cuotaId, porcentaje, concepto) {
        await this.validateCuotaEditable(cuotaId);
        if (porcentaje <= 0 || porcentaje > 100) {
            throw new error_middleware_1.AppError('El porcentaje debe estar entre 0 y 100', 400);
        }
        const totalActual = await this.repository.calculateTotalByCuotaId(cuotaId);
        const montoDescuento = -(totalActual * (porcentaje / 100));
        const tipoDescuento = await this.tipoRepository.findByCodigo('BONIFICACION_ESPECIAL');
        if (!tipoDescuento) {
            throw new error_middleware_1.AppError('Tipo de ítem de bonificación no encontrado', 500);
        }
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
        await this.recalcularTotalCuota(cuotaId);
        return item;
    }
}
exports.ItemCuotaService = ItemCuotaService;
//# sourceMappingURL=item-cuota.service.js.map