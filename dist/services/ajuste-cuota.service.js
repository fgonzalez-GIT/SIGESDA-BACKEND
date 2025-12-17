"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AjusteCuotaService = void 0;
const database_1 = require("@/config/database");
const logger_1 = require("@/utils/logger");
const date_helper_1 = require("@/utils/date.helper");
const validation_helper_1 = require("@/utils/validation.helper");
class AjusteCuotaService {
    constructor(ajusteRepository, historialRepository, personaRepository) {
        this.ajusteRepository = ajusteRepository;
        this.historialRepository = historialRepository;
        this.personaRepository = personaRepository;
    }
    get prisma() {
        return database_1.prisma;
    }
    async createAjuste(data, usuario) {
        const persona = await this.personaRepository.findById(data.personaId);
        if (!persona) {
            throw new Error(`Persona con ID ${data.personaId} no encontrada`);
        }
        if (!persona.activo) {
            throw new Error(`No se puede crear ajuste para persona inactiva (ID: ${data.personaId})`);
        }
        (0, date_helper_1.validateFechaRange)(data.fechaInicio, data.fechaFin);
        if (data.tipoAjuste === 'DESCUENTO_PORCENTAJE' || data.tipoAjuste === 'RECARGO_PORCENTAJE') {
            (0, validation_helper_1.validatePorcentaje)(data.valor);
        }
        if (data.aplicaA === 'ITEMS_ESPECIFICOS' && (!data.itemsAfectados || data.itemsAfectados.length === 0)) {
            throw new Error('Debe especificar al menos un item cuando aplicaA es ITEMS_ESPECIFICOS');
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const ajuste = await this.ajusteRepository.create(data, tx);
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
        logger_1.logger.info(`Ajuste manual creado: ${result.concepto} (${result.tipoAjuste}) para persona ${data.personaId} - ID: ${result.id}`);
        return result;
    }
    async updateAjuste(id, data, usuario) {
        const ajusteActual = await this.ajusteRepository.findById(id);
        if (!ajusteActual) {
            throw new Error(`Ajuste con ID ${id} no encontrado`);
        }
        const fechaInicio = data.fechaInicio || ajusteActual.fechaInicio;
        const fechaFin = data.fechaFin !== undefined ? data.fechaFin : ajusteActual.fechaFin;
        (0, date_helper_1.validateFechaRange)(fechaInicio, fechaFin);
        const tipoAjuste = data.tipoAjuste || ajusteActual.tipoAjuste;
        const valor = data.valor || Number(ajusteActual.valor);
        if (tipoAjuste === 'DESCUENTO_PORCENTAJE' || tipoAjuste === 'RECARGO_PORCENTAJE') {
            (0, validation_helper_1.validatePorcentaje)(valor);
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const ajusteActualizado = await this.ajusteRepository.update(id, data, tx);
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
        logger_1.logger.info(`Ajuste manual actualizado: ID ${id} - ${result.concepto}`);
        return result;
    }
    async deactivateAjuste(id, usuario, motivo) {
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
        logger_1.logger.info(`Ajuste manual desactivado: ID ${id} - ${ajuste.concepto}`);
        return result;
    }
    async activateAjuste(id, usuario, motivo) {
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
        logger_1.logger.info(`Ajuste manual reactivado: ID ${id} - ${ajuste.concepto}`);
        return result;
    }
    async deleteAjuste(id, usuario, motivo) {
        const ajuste = await this.ajusteRepository.findById(id);
        if (!ajuste) {
            throw new Error(`Ajuste con ID ${id} no encontrado`);
        }
        await this.prisma.$transaction(async (tx) => {
            await this.historialRepository.create({
                ajusteId: null,
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
        logger_1.logger.warn(`Ajuste manual eliminado permanentemente: ID ${id} - ${ajuste.concepto}`);
    }
    async getAjusteById(id) {
        return this.ajusteRepository.findById(id);
    }
    async getAjustesByPersonaId(personaId, soloActivos = false) {
        return this.ajusteRepository.findByPersonaId(personaId, soloActivos);
    }
    async getAjustesActivosParaPeriodo(personaId, fecha) {
        return this.ajusteRepository.findActiveByPersonaAndPeriodo(personaId, fecha);
    }
    async getAjustes(filters) {
        return this.ajusteRepository.findAll(filters);
    }
    async getStats(personaId) {
        return this.ajusteRepository.getStats(personaId);
    }
    calcularAjuste(ajuste, montoOriginal) {
        const valor = Number(ajuste.valor);
        let ajusteCalculado = 0;
        switch (ajuste.tipoAjuste) {
            case 'DESCUENTO_FIJO':
                ajusteCalculado = -Math.min(valor, montoOriginal);
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
    calcularAjustesMultiples(ajustes, montoOriginal) {
        let montoActual = montoOriginal;
        const ajustesDetalle = [];
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
exports.AjusteCuotaService = AjusteCuotaService;
//# sourceMappingURL=ajuste-cuota.service.js.map