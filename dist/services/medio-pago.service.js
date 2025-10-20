"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedioPagoService = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("@/utils/logger");
class MedioPagoService {
    constructor(medioPagoRepository, reciboRepository) {
        this.medioPagoRepository = medioPagoRepository;
        this.reciboRepository = reciboRepository;
    }
    async create(data) {
        const recibo = await this.reciboRepository.findById(data.reciboId);
        if (!recibo) {
            throw new Error('Recibo no encontrado');
        }
        if (recibo.estado === client_1.EstadoRecibo.CANCELADO) {
            throw new Error('No se puede agregar un medio de pago a un recibo cancelado');
        }
        const totalPagosExistentes = await this.medioPagoRepository.getTotalPagosByRecibo(data.reciboId);
        const saldoPendiente = Number(recibo.importe) - totalPagosExistentes;
        if (data.importe > saldoPendiente + 0.01) {
            throw new Error(`El importe (${data.importe}) excede el saldo pendiente (${saldoPendiente})`);
        }
        if (data.numero && (data.tipo === client_1.MedioPagoTipo.CHEQUE || data.tipo === client_1.MedioPagoTipo.TRANSFERENCIA)) {
            const isDuplicate = await this.medioPagoRepository.checkDuplicateNumber(data.numero, data.tipo);
            if (isDuplicate) {
                throw new Error(`Ya existe un ${data.tipo.toLowerCase()} con el número ${data.numero}`);
            }
        }
        await this.validateMedioPagoSpecific(data);
        const medioPago = await this.medioPagoRepository.create(data);
        await this.updateReciboEstado(data.reciboId);
        logger_1.logger.info(`Medio de pago creado: ${data.tipo} por $${data.importe} para recibo ${recibo.numero} (ID: ${medioPago.id})`);
        return medioPago;
    }
    async findAll(filters) {
        const result = await this.medioPagoRepository.findMany(filters);
        return {
            ...result,
            pages: result.totalPages
        };
    }
    async findById(id) {
        const medioPago = await this.medioPagoRepository.findById(id);
        if (!medioPago) {
            throw new Error('Medio de pago no encontrado');
        }
        return medioPago;
    }
    async findByReciboId(reciboId) {
        const recibo = await this.reciboRepository.findById(reciboId);
        if (!recibo) {
            throw new Error('Recibo no encontrado');
        }
        return this.medioPagoRepository.findByReciboId(reciboId);
    }
    async update(id, data) {
        const medioPagoExistente = await this.medioPagoRepository.findById(id);
        if (!medioPagoExistente) {
            throw new Error('Medio de pago no encontrado');
        }
        if (medioPagoExistente.recibo.estado === client_1.EstadoRecibo.PAGADO) {
            const mediosPagoDelRecibo = await this.medioPagoRepository.findByReciboId(medioPagoExistente.reciboId);
            if (mediosPagoDelRecibo.length > 1) {
                throw new Error('No se puede modificar un medio de pago de un recibo completamente pagado con múltiples medios de pago');
            }
        }
        if (data.numero && data.numero !== medioPagoExistente.numero) {
            const tipo = data.tipo || medioPagoExistente.tipo;
            if (tipo === client_1.MedioPagoTipo.CHEQUE || tipo === client_1.MedioPagoTipo.TRANSFERENCIA) {
                const isDuplicate = await this.medioPagoRepository.checkDuplicateNumber(data.numero, tipo, id);
                if (isDuplicate) {
                    throw new Error(`Ya existe un ${tipo.toLowerCase()} con el número ${data.numero}`);
                }
            }
        }
        if (data.importe !== undefined) {
            const totalOtrosPagos = await this.getOtrosPagosDelRecibo(medioPagoExistente.reciboId, id);
            const saldoDisponible = Number(medioPagoExistente.recibo.importe) - totalOtrosPagos;
            if (data.importe > saldoDisponible + 0.01) {
                throw new Error(`El nuevo importe (${data.importe}) excede el saldo disponible (${saldoDisponible})`);
            }
        }
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
        await this.updateReciboEstado(medioPagoExistente.reciboId);
        logger_1.logger.info(`Medio de pago actualizado: ${medioPagoExistente.tipo} (ID: ${id})`);
        return updatedMedioPago;
    }
    async delete(id) {
        const medioPago = await this.medioPagoRepository.findById(id);
        if (!medioPago) {
            throw new Error('Medio de pago no encontrado');
        }
        if (medioPago.recibo.estado === client_1.EstadoRecibo.PAGADO) {
            throw new Error('No se puede eliminar un medio de pago de un recibo pagado');
        }
        await this.medioPagoRepository.delete(id);
        await this.updateReciboEstado(medioPago.reciboId);
        logger_1.logger.info(`Medio de pago eliminado: ${medioPago.tipo} por $${medioPago.importe} (ID: ${id})`);
    }
    async deleteBulk(data) {
        const errores = [];
        let eliminados = 0;
        for (const id of data.ids) {
            try {
                const medioPago = await this.medioPagoRepository.findById(id);
                if (!medioPago) {
                    errores.push(`Medio de pago ${id} no encontrado`);
                    continue;
                }
                if (medioPago.recibo.estado === client_1.EstadoRecibo.PAGADO) {
                    errores.push(`Medio de pago ${id} no se puede eliminar - recibo pagado`);
                    continue;
                }
                await this.medioPagoRepository.delete(id);
                await this.updateReciboEstado(medioPago.reciboId);
                eliminados++;
            }
            catch (error) {
                errores.push(`Error eliminando medio de pago ${id}: ${error.message}`);
            }
        }
        return { eliminados, errores };
    }
    async search(data) {
        return this.medioPagoRepository.search(data);
    }
    async getStatistics(data) {
        return this.medioPagoRepository.getStats(data);
    }
    async validatePayment(data) {
        const validation = await this.medioPagoRepository.validatePayment(data.reciboId, data.tolerancia);
        const alertas = [];
        if (validation.estado === 'PARCIAL') {
            alertas.push(`Pago parcial: falta $${Math.abs(validation.diferencia).toFixed(2)}`);
        }
        else if (validation.estado === 'EXCEDIDO') {
            alertas.push(`Pago excedido: sobra $${validation.diferencia.toFixed(2)}`);
        }
        if (validation.mediosPago.length === 0) {
            alertas.push('No se han registrado medios de pago para este recibo');
        }
        validation.mediosPago.forEach(mp => {
            if (mp.tipo === client_1.MedioPagoTipo.CHEQUE && mp.fecha > new Date()) {
                alertas.push(`Cheque ${mp.numero} con fecha futura`);
            }
        });
        return {
            ...validation,
            alertas
        };
    }
    async getConciliacionBancaria(data) {
        const result = await this.medioPagoRepository.getConciliacionBancaria(data);
        const importes = result.operaciones.map(op => op.importe);
        const estadisticas = {
            promedioOperacion: importes.length > 0 ? importes.reduce((a, b) => a + b, 0) / importes.length : 0,
            operacionMayor: importes.length > 0 ? Math.max(...importes) : 0,
            operacionMenor: importes.length > 0 ? Math.min(...importes) : 0,
            diasConOperaciones: new Set(result.operaciones.map(op => op.fecha.toISOString().split('T')[0])).size
        };
        const tiposOperaciones = result.operaciones.reduce((acc, op) => {
            if (!acc[op.tipo]) {
                acc[op.tipo] = { cantidad: 0, importe: 0 };
            }
            acc[op.tipo].cantidad++;
            acc[op.tipo].importe += op.importe;
            return acc;
        }, {});
        return {
            banco: data.banco,
            periodo: {
                desde: new Date(data.fechaDesde),
                hasta: new Date(data.fechaHasta)
            },
            resumen: {
                ...result.resumen,
                tiposOperaciones: Object.entries(tiposOperaciones).map(([tipo, datos]) => ({
                    tipo: tipo,
                    cantidad: datos.cantidad,
                    importe: datos.importe
                }))
            },
            operaciones: result.operaciones,
            estadisticas
        };
    }
    async findByTipo(tipo, limit) {
        return this.medioPagoRepository.findByTipo(tipo, limit);
    }
    async getQuickStats() {
        return this.medioPagoRepository.getQuickStats();
    }
    async getDashboard() {
        const [quickStats, recientesPorTipo] = await Promise.all([
            this.medioPagoRepository.getQuickStats(),
            Promise.all(Object.values(client_1.MedioPagoTipo).map(async (tipo) => ({
                tipo,
                mediosPago: await this.medioPagoRepository.findByTipo(tipo, 5)
            })))
        ]);
        return {
            estadisticasHoy: quickStats,
            recientesPorTipo: recientesPorTipo.filter(item => item.mediosPago.length > 0)
        };
    }
    async validateMedioPagoSpecific(data) {
        if (data.tipo === client_1.MedioPagoTipo.CHEQUE) {
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
        if (data.tipo === client_1.MedioPagoTipo.TRANSFERENCIA) {
            if (!data.numero) {
                throw new Error('El número de comprobante es requerido para transferencias');
            }
            if (data.numero.length < 3) {
                throw new Error('El número de comprobante debe tener al menos 3 caracteres');
            }
        }
        if (data.tipo === client_1.MedioPagoTipo.EFECTIVO) {
            if (data.importe > 1000000) {
                throw new Error('El monto en efectivo no puede exceder $1,000,000');
            }
        }
        if (data.tipo === client_1.MedioPagoTipo.TARJETA_CREDITO || data.tipo === client_1.MedioPagoTipo.TARJETA_DEBITO) {
            if (data.numero && data.numero.length < 4) {
                throw new Error('El número de autorización debe tener al menos 4 caracteres');
            }
        }
    }
    async updateReciboEstado(reciboId) {
        const validation = await this.medioPagoRepository.validatePayment(reciboId, 0.01);
        let nuevoEstado;
        if (validation.esPagoCompleto) {
            nuevoEstado = client_1.EstadoRecibo.PAGADO;
        }
        else if (validation.importeTotalPagos > 0) {
            nuevoEstado = client_1.EstadoRecibo.PENDIENTE;
        }
        else {
            nuevoEstado = client_1.EstadoRecibo.PENDIENTE;
        }
        const recibo = await this.reciboRepository.findById(reciboId);
        if (recibo && recibo.estado !== nuevoEstado) {
            await this.reciboRepository.update(reciboId, { estado: nuevoEstado });
            logger_1.logger.info(`Estado del recibo ${recibo.numero} actualizado a ${nuevoEstado}`);
        }
    }
    async getOtrosPagosDelRecibo(reciboId, excludeId) {
        const mediosPago = await this.medioPagoRepository.findByReciboId(reciboId);
        return mediosPago
            .filter(mp => mp.id !== excludeId)
            .reduce((sum, mp) => sum + Number(mp.importe), 0);
    }
}
exports.MedioPagoService = MedioPagoService;
//# sourceMappingURL=medio-pago.service.js.map