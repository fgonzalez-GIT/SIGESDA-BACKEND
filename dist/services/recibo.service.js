"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReciboService = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("@/utils/logger");
const persona_helper_1 = require("@/utils/persona.helper");
class ReciboService {
    constructor(reciboRepository, personaRepository) {
        this.reciboRepository = reciboRepository;
        this.personaRepository = personaRepository;
    }
    async createRecibo(data) {
        if (data.emisorId) {
            const emisor = await this.personaRepository.findById(data.emisorId);
            if (!emisor) {
                throw new Error(`Emisor con ID ${data.emisorId} no encontrado`);
            }
            if (emisor.fechaBaja) {
                throw new Error(`El emisor ${emisor.nombre} ${emisor.apellido} está dado de baja`);
            }
        }
        if (data.receptorId) {
            const receptor = await this.personaRepository.findById(data.receptorId);
            if (!receptor) {
                throw new Error(`Receptor con ID ${data.receptorId} no encontrado`);
            }
            await this.validateReceptorByTipo(data.tipo, receptor);
        }
        await this.validateBusinessRules(data);
        const recibo = await this.reciboRepository.create(data);
        logger_1.logger.info(`Recibo creado: ${recibo.numero} - ${data.tipo} - $${data.importe} (ID: ${recibo.id})`);
        return recibo;
    }
    async getRecibos(query) {
        const result = await this.reciboRepository.findAll(query);
        const pages = Math.ceil(result.total / query.limit);
        return {
            ...result,
            pages
        };
    }
    async getReciboById(id) {
        return this.reciboRepository.findById(id);
    }
    async getReciboByNumero(numero) {
        return this.reciboRepository.findByNumero(numero);
    }
    async getRecibosByPersona(personaId, tipo) {
        const persona = await this.personaRepository.findById(personaId);
        if (!persona) {
            throw new Error(`Persona con ID ${personaId} no encontrada`);
        }
        return this.reciboRepository.findByPersonaId(personaId, tipo);
    }
    async updateRecibo(id, data) {
        const existingRecibo = await this.reciboRepository.findById(id);
        if (!existingRecibo) {
            throw new Error(`Recibo con ID ${id} no encontrado`);
        }
        if (existingRecibo.estado === client_1.EstadoRecibo.PAGADO || existingRecibo.estado === client_1.EstadoRecibo.CANCELADO) {
            throw new Error(`No se puede modificar un recibo en estado ${existingRecibo.estado}`);
        }
        if (data.emisorId !== undefined) {
            if (data.emisorId) {
                const emisor = await this.personaRepository.findById(data.emisorId);
                if (!emisor || emisor.fechaBaja) {
                    throw new Error(`Emisor con ID ${data.emisorId} no válido o inactivo`);
                }
            }
        }
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
        logger_1.logger.info(`Recibo actualizado: ${existingRecibo.numero} (ID: ${id})`);
        return updatedRecibo;
    }
    async changeEstado(id, data) {
        const existingRecibo = await this.reciboRepository.findById(id);
        if (!existingRecibo) {
            throw new Error(`Recibo con ID ${id} no encontrado`);
        }
        this.validateStateTransition(existingRecibo.estado, data.nuevoEstado);
        const updatedRecibo = await this.reciboRepository.updateEstado(id, data.nuevoEstado, data.observaciones);
        logger_1.logger.info(`Estado de recibo cambiado: ${existingRecibo.numero} de ${existingRecibo.estado} a ${data.nuevoEstado}`);
        return updatedRecibo;
    }
    async deleteRecibo(id) {
        const existingRecibo = await this.reciboRepository.findById(id);
        if (!existingRecibo) {
            throw new Error(`Recibo con ID ${id} no encontrado`);
        }
        if (existingRecibo.estado === client_1.EstadoRecibo.PAGADO) {
            throw new Error(`No se puede eliminar un recibo pagado`);
        }
        if (existingRecibo.mediosPago && existingRecibo.mediosPago.length > 0) {
            throw new Error(`No se puede eliminar un recibo que tiene medios de pago registrados`);
        }
        const deletedRecibo = await this.reciboRepository.delete(id);
        logger_1.logger.info(`Recibo eliminado: ${existingRecibo.numero} (ID: ${id})`);
        return deletedRecibo;
    }
    async createBulkRecibos(data) {
        const errors = [];
        const validRecibos = [];
        for (const recibo of data.recibos) {
            try {
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
                    }
                    catch (error) {
                        errors.push(`Receptor ${recibo.receptorId}: ${error}`);
                        continue;
                    }
                }
                try {
                    await this.validateBusinessRules(recibo);
                }
                catch (error) {
                    errors.push(`Validación de negocio: ${error}`);
                    continue;
                }
                validRecibos.push(recibo);
            }
            catch (error) {
                errors.push(`Error validando recibo: ${error}`);
            }
        }
        const result = validRecibos.length > 0
            ? await this.reciboRepository.createBulk(validRecibos)
            : { count: 0 };
        logger_1.logger.info(`Creación masiva de recibos: ${result.count} creados, ${errors.length} errores`);
        return {
            count: result.count,
            errors
        };
    }
    async deleteBulkRecibos(data) {
        const recibos = await Promise.all(data.ids.map(id => this.reciboRepository.findById(id)));
        const invalidIds = recibos
            .filter((recibo, index) => {
            if (!recibo)
                return true;
            if (recibo.estado === client_1.EstadoRecibo.PAGADO)
                return true;
            if (recibo.mediosPago && recibo.mediosPago.length > 0)
                return true;
            return false;
        })
            .map((_, index) => data.ids[index]);
        if (invalidIds.length > 0) {
            throw new Error(`No se pueden eliminar los siguientes recibos: ${invalidIds.join(', ')}`);
        }
        const result = await this.reciboRepository.deleteBulk(data.ids);
        logger_1.logger.info(`Eliminación masiva de recibos: ${result.count} eliminados`);
        return result;
    }
    async updateBulkEstados(data) {
        const recibos = await Promise.all(data.ids.map(id => this.reciboRepository.findById(id)));
        const invalidTransitions = recibos
            .filter((recibo, index) => {
            if (!recibo)
                return true;
            try {
                this.validateStateTransition(recibo.estado, data.nuevoEstado);
                return false;
            }
            catch {
                return true;
            }
        })
            .map((recibo, index) => ({ id: data.ids[index], numero: recibo?.numero }));
        if (invalidTransitions.length > 0) {
            const invalidList = invalidTransitions.map(r => r.numero || r.id).join(', ');
            throw new Error(`Transiciones de estado inválidas para: ${invalidList}`);
        }
        const result = await this.reciboRepository.updateBulkEstados(data.ids, data.nuevoEstado, data.observaciones);
        logger_1.logger.info(`Actualización masiva de estados: ${result.count} recibos actualizados a ${data.nuevoEstado}`);
        return result;
    }
    async searchRecibos(searchData) {
        return this.reciboRepository.search(searchData);
    }
    async getStatistics(statsData) {
        return this.reciboRepository.getStatistics(statsData);
    }
    async getVencidos() {
        return this.reciboRepository.getVencidos();
    }
    async getPendientes() {
        return this.reciboRepository.getPendientes();
    }
    async processVencidos() {
        const result = await this.reciboRepository.markVencidosAsVencido();
        logger_1.logger.info(`Procesamiento automático de vencidos: ${result.count} recibos marcados como vencidos`);
        return result;
    }
    async validateReceptorByTipo(tipo, receptor) {
        switch (tipo) {
            case client_1.TipoRecibo.CUOTA:
                const esSocio = await (0, persona_helper_1.hasActiveTipo)(receptor.id, 'SOCIO');
                if (!esSocio) {
                    throw new Error(`Las cuotas solo pueden ser emitidas a socios`);
                }
                if (!receptor.activo) {
                    throw new Error(`No se puede emitir cuota a socio inactivo`);
                }
                break;
            case client_1.TipoRecibo.SUELDO:
                const esDocente = await (0, persona_helper_1.hasActiveTipo)(receptor.id, 'DOCENTE');
                if (!esDocente) {
                    throw new Error(`Los sueldos solo pueden ser emitidos a docentes`);
                }
                if (!receptor.activo) {
                    throw new Error(`No se puede emitir sueldo a docente inactivo`);
                }
                break;
            case client_1.TipoRecibo.PAGO_ACTIVIDAD:
                if (!receptor.activo) {
                    throw new Error(`No se puede emitir pago de actividad a persona inactiva`);
                }
                break;
            case client_1.TipoRecibo.DEUDA:
                break;
            default:
                throw new Error(`Tipo de recibo no válido: ${tipo}`);
        }
    }
    validateStateTransition(currentState, newState) {
        const validTransitions = {
            [client_1.EstadoRecibo.PENDIENTE]: [client_1.EstadoRecibo.PAGADO, client_1.EstadoRecibo.VENCIDO, client_1.EstadoRecibo.CANCELADO],
            [client_1.EstadoRecibo.VENCIDO]: [client_1.EstadoRecibo.PAGADO, client_1.EstadoRecibo.CANCELADO],
            [client_1.EstadoRecibo.PAGADO]: [],
            [client_1.EstadoRecibo.CANCELADO]: []
        };
        if (!validTransitions[currentState].includes(newState)) {
            throw new Error(`Transición de estado inválida: de ${currentState} a ${newState}`);
        }
    }
    async validateBusinessRules(data) {
        if (data.importe > 1000000) {
            throw new Error(`El importe es excesivamente alto: $${data.importe}`);
        }
        if (data.fechaVencimiento) {
            const vencimiento = new Date(data.fechaVencimiento);
            const maxDate = new Date();
            maxDate.setFullYear(maxDate.getFullYear() + 2);
            if (vencimiento > maxDate) {
                throw new Error(`La fecha de vencimiento es demasiado lejana`);
            }
        }
        if (data.concepto.length < 5) {
            throw new Error(`El concepto debe ser más descriptivo`);
        }
    }
}
exports.ReciboService = ReciboService;
//# sourceMappingURL=recibo.service.js.map