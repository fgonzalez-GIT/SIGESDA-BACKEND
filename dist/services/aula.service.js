"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AulaService = void 0;
const logger_1 = require("@/utils/logger");
class AulaService {
    constructor(aulaRepository) {
        this.aulaRepository = aulaRepository;
    }
    async createAula(data) {
        const existingAula = await this.aulaRepository.findByNombre(data.nombre);
        if (existingAula) {
            throw new Error(`Ya existe un aula con el nombre ${data.nombre}`);
        }
        if (data.capacidad < 1) {
            throw new Error('La capacidad debe ser al menos 1 persona');
        }
        const aula = await this.aulaRepository.create(data);
        logger_1.logger.info(`Aula creada: ${aula.nombre} (Capacidad: ${aula.capacidad}) - ID: ${aula.id}`);
        return aula;
    }
    async getAulas(query) {
        const result = await this.aulaRepository.findAll(query);
        const pages = Math.ceil(result.total / query.limit);
        return {
            ...result,
            pages
        };
    }
    async getAulaById(id) {
        return this.aulaRepository.findById(id);
    }
    async updateAula(id, data) {
        const existingAula = await this.aulaRepository.findById(id);
        if (!existingAula) {
            throw new Error(`Aula con ID ${id} no encontrada`);
        }
        if (data.nombre && data.nombre !== existingAula.nombre) {
            const aulaWithSameName = await this.aulaRepository.findByNombre(data.nombre);
            if (aulaWithSameName) {
                throw new Error(`Ya existe un aula con el nombre ${data.nombre}`);
            }
        }
        if (data.capacidad !== undefined && data.capacidad < 1) {
            throw new Error('La capacidad debe ser al menos 1 persona');
        }
        const updatedAula = await this.aulaRepository.update(id, data);
        logger_1.logger.info(`Aula actualizada: ${updatedAula.nombre} (ID: ${id})`);
        return updatedAula;
    }
    async deleteAula(id, hard = false) {
        const existingAula = await this.aulaRepository.findById(id);
        if (!existingAula) {
            throw new Error(`Aula con ID ${id} no encontrada`);
        }
        const reservas = existingAula.reservas || [];
        const reservasActivas = reservas.filter((reserva) => new Date(reserva.fechaFin) > new Date());
        if (reservasActivas.length > 0) {
            if (hard) {
                throw new Error('No se puede eliminar permanentemente un aula con reservas activas. Use eliminación lógica.');
            }
            const deletedAula = await this.aulaRepository.softDelete(id);
            logger_1.logger.info(`Aula dada de baja: ${deletedAula.nombre} (ID: ${id}) - Tenía ${reservasActivas.length} reservas activas`);
            return deletedAula;
        }
        let deletedAula;
        if (hard) {
            deletedAula = await this.aulaRepository.delete(id);
            logger_1.logger.info(`Aula eliminada permanentemente: ${deletedAula.nombre} (ID: ${id})`);
        }
        else {
            deletedAula = await this.aulaRepository.softDelete(id);
            logger_1.logger.info(`Aula dada de baja: ${deletedAula.nombre} (ID: ${id})`);
        }
        return deletedAula;
    }
    async getAulasDisponibles() {
        return this.aulaRepository.getDisponibles();
    }
    async verificarDisponibilidad(aulaId, data) {
        const aula = await this.aulaRepository.findById(aulaId);
        if (!aula) {
            throw new Error(`Aula con ID ${aulaId} no encontrada`);
        }
        if (!aula.activa) {
            return {
                disponible: false,
                conflictos: [{ mensaje: 'El aula no está activa' }]
            };
        }
        const fechaInicio = new Date(data.fechaInicio);
        const fechaFin = new Date(data.fechaFin);
        const ahora = new Date();
        if (fechaInicio <= ahora) {
            throw new Error('La fecha de inicio debe ser futura');
        }
        const disponible = await this.aulaRepository.verificarDisponibilidad(aulaId, fechaInicio, fechaFin, data.excluirReservaId);
        if (!disponible) {
            const conflictos = await this.aulaRepository.getReservasEnPeriodo(aulaId, fechaInicio, fechaFin);
            return {
                disponible: false,
                conflictos: conflictos.map(reserva => ({
                    id: reserva.id,
                    fechaInicio: reserva.fechaInicio,
                    fechaFin: reserva.fechaFin,
                    actividad: reserva.actividad?.nombre || 'Sin actividad',
                    docente: `${reserva.docente.nombre} ${reserva.docente.apellido}`
                }))
            };
        }
        return { disponible: true };
    }
    async getEstadisticas(aulaId) {
        const aula = await this.aulaRepository.findById(aulaId);
        if (!aula) {
            throw new Error(`Aula con ID ${aulaId} no encontrada`);
        }
        return this.aulaRepository.getEstadisticas(aulaId);
    }
    async getAulasConMenorUso() {
        return this.aulaRepository.getAulasConMenorUso();
    }
    async searchAulas(searchTerm) {
        const result = await this.aulaRepository.findAll({
            search: searchTerm,
            page: 1,
            limit: 20
        });
        return result.data;
    }
    async getAulasPorCapacidad(capacidadMinima) {
        const result = await this.aulaRepository.findAll({
            capacidadMinima,
            activa: true,
            page: 1,
            limit: 100
        });
        return result.data;
    }
    async getAulasConEquipamiento() {
        const result = await this.aulaRepository.findAll({
            conEquipamiento: true,
            activa: true,
            page: 1,
            limit: 100
        });
        return result.data;
    }
    async getReservasDelAula(aulaId, fechaDesde, fechaHasta) {
        const aula = await this.aulaRepository.findById(aulaId);
        if (!aula) {
            throw new Error(`Aula con ID ${aulaId} no encontrada`);
        }
        if (fechaDesde && fechaHasta) {
            return this.aulaRepository.getReservasEnPeriodo(aulaId, new Date(fechaDesde), new Date(fechaHasta));
        }
        const ahora = new Date();
        const enUnMes = new Date();
        enUnMes.setMonth(enUnMes.getMonth() + 1);
        return this.aulaRepository.getReservasEnPeriodo(aulaId, ahora, enUnMes);
    }
}
exports.AulaService = AulaService;
//# sourceMappingURL=aula.service.js.map