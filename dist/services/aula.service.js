"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AulaService = void 0;
const equipamiento_repository_1 = require("@/repositories/equipamiento.repository");
const logger_1 = require("@/utils/logger");
const errors_1 = require("@/utils/errors");
const equipamiento_helper_1 = require("@/utils/equipamiento.helper");
const database_1 = require("@/config/database");
class AulaService {
    constructor(aulaRepository) {
        this.aulaRepository = aulaRepository;
        this.equipamientoRepository = new equipamiento_repository_1.EquipamientoRepository(database_1.prisma);
    }
    async createAula(data) {
        const existingAula = await this.aulaRepository.findByNombre(data.nombre);
        if (existingAula) {
            throw new errors_1.ConflictError(`Ya existe un aula con el nombre ${data.nombre}`);
        }
        if (data.capacidad < 1) {
            throw new errors_1.ValidationError('La capacidad debe ser al menos 1 persona');
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
        const existingAula = await this.aulaRepository.findByIdSimple(id);
        if (!existingAula) {
            throw new errors_1.NotFoundError(`Aula con ID ${id} no encontrada`);
        }
        if (data.nombre && data.nombre !== existingAula.nombre) {
            const aulaWithSameName = await this.aulaRepository.findByNombre(data.nombre);
            if (aulaWithSameName) {
                throw new errors_1.ConflictError(`Ya existe un aula con el nombre ${data.nombre}`);
            }
        }
        if (data.capacidad !== undefined && data.capacidad < 1) {
            throw new errors_1.ValidationError('La capacidad debe ser al menos 1 persona');
        }
        const updatedAula = await this.aulaRepository.update(id, data);
        logger_1.logger.info(`Aula actualizada: ${updatedAula.nombre} (ID: ${id})`);
        return updatedAula;
    }
    async deleteAula(id, hard = false) {
        const existingAula = await this.aulaRepository.findById(id);
        if (!existingAula) {
            throw new errors_1.NotFoundError(`Aula con ID ${id} no encontrada`);
        }
        const reservas = existingAula.reserva_aulas || [];
        const ahora = new Date();
        const reservasActivas = reservas.filter((reserva) => {
            return new Date(reserva.fechaFin) > ahora;
        });
        if (reservasActivas.length > 0) {
            if (hard) {
                throw new errors_1.ValidationError('No se puede eliminar permanentemente un aula con reservas activas. Use eliminación lógica.');
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
            throw new errors_1.NotFoundError(`Aula con ID ${aulaId} no encontrada`);
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
            throw new errors_1.ValidationError('La fecha de inicio debe ser futura');
        }
        const disponible = await this.aulaRepository.verificarDisponibilidad(aulaId, fechaInicio, fechaFin, data.excluirReservaId);
        if (!disponible) {
            const conflictos = await this.aulaRepository.getReservasEnPeriodo(aulaId, fechaInicio, fechaFin);
            return {
                disponible: false,
                conflictos: conflictos.map(reserva => ({
                    id: reserva.id,
                    fechaInicio: reserva.fecha_vigencia_desde,
                    fechaFin: reserva.fecha_vigencia_hasta,
                    actividad: reserva.horarios_actividades?.actividades?.nombre || 'Sin actividad',
                    dia: reserva.horarios_actividades?.dias_semana?.nombre || 'N/A',
                    horario: `${reserva.horarios_actividades?.hora_inicio || ''} - ${reserva.horarios_actividades?.hora_fin || ''}`
                }))
            };
        }
        return { disponible: true };
    }
    async getEstadisticas(aulaId) {
        const aula = await this.aulaRepository.findById(aulaId);
        if (!aula) {
            throw new errors_1.NotFoundError(`Aula con ID ${aulaId} no encontrada`);
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
            throw new errors_1.NotFoundError(`Aula con ID ${aulaId} no encontrada`);
        }
        if (fechaDesde && fechaHasta) {
            return this.aulaRepository.getReservasEnPeriodo(aulaId, new Date(fechaDesde), new Date(fechaHasta));
        }
        const ahora = new Date();
        const enUnMes = new Date();
        enUnMes.setMonth(enUnMes.getMonth() + 1);
        return this.aulaRepository.getReservasEnPeriodo(aulaId, ahora, enUnMes);
    }
    async addEquipamientoToAula(aulaId, equipamientoId, cantidad, observaciones) {
        const aula = await this.aulaRepository.findByIdSimple(aulaId.toString());
        if (!aula) {
            throw new errors_1.NotFoundError(`Aula con ID ${aulaId} no encontrada`);
        }
        const equipamiento = await this.equipamientoRepository.findById(equipamientoId);
        if (!equipamiento) {
            throw new errors_1.NotFoundError(`Equipamiento con ID ${equipamientoId} no encontrado`);
        }
        const exists = await this.aulaRepository.checkEquipamientoExists(aulaId, equipamientoId);
        if (exists) {
            throw new errors_1.ConflictError(`El equipamiento con ID ${equipamientoId} ya está asignado a esta aula`);
        }
        if (cantidad < 1) {
            throw new errors_1.ValidationError('La cantidad debe ser al menos 1');
        }
        const asignaciones = await database_1.prisma.aulaEquipamiento.findMany({
            where: { equipamientoId }
        });
        const validacion = (0, equipamiento_helper_1.validarAsignacion)(equipamiento, cantidad, asignaciones);
        if (!validacion.esValido) {
            throw new errors_1.ValidationError(validacion.errors.join('; '));
        }
        const aulaEquipamiento = await this.aulaRepository.addEquipamiento(aulaId, equipamientoId, cantidad, observaciones);
        if (validacion.warnings.length > 0) {
            logger_1.logger.warn(`⚠️  Equipamiento ${equipamientoId} agregado al aula ${aulaId} con advertencias: ${validacion.warnings.join('; ')}`);
        }
        else {
            logger_1.logger.info(`Equipamiento ${equipamientoId} agregado al aula ${aulaId} (cantidad: ${cantidad})`);
        }
        return {
            ...aulaEquipamiento,
            warnings: validacion.warnings.length > 0 ? validacion.warnings : undefined
        };
    }
    async removeEquipamientoFromAula(aulaId, equipamientoId) {
        const aula = await this.aulaRepository.findByIdSimple(aulaId.toString());
        if (!aula) {
            throw new errors_1.NotFoundError(`Aula con ID ${aulaId} no encontrada`);
        }
        const exists = await this.aulaRepository.checkEquipamientoExists(aulaId, equipamientoId);
        if (!exists) {
            throw new errors_1.NotFoundError(`El equipamiento con ID ${equipamientoId} no está asignado a esta aula`);
        }
        const removed = await this.aulaRepository.removeEquipamiento(aulaId, equipamientoId);
        logger_1.logger.info(`Equipamiento ${equipamientoId} removido del aula ${aulaId}`);
        return removed;
    }
    async updateEquipamientoCantidad(aulaId, equipamientoId, cantidad, observaciones) {
        const aula = await this.aulaRepository.findByIdSimple(aulaId.toString());
        if (!aula) {
            throw new errors_1.NotFoundError(`Aula con ID ${aulaId} no encontrada`);
        }
        const exists = await this.aulaRepository.checkEquipamientoExists(aulaId, equipamientoId);
        if (!exists) {
            throw new errors_1.NotFoundError(`El equipamiento con ID ${equipamientoId} no está asignado a esta aula`);
        }
        if (cantidad < 1) {
            throw new errors_1.ValidationError('La cantidad debe ser al menos 1');
        }
        const updated = await this.aulaRepository.updateEquipamientoCantidad(aulaId, equipamientoId, cantidad, observaciones);
        logger_1.logger.info(`Cantidad de equipamiento ${equipamientoId} actualizada en aula ${aulaId} (nueva cantidad: ${cantidad})`);
        return updated;
    }
    async getEquipamientosDeAula(aulaId) {
        const aula = await this.aulaRepository.findByIdSimple(aulaId.toString());
        if (!aula) {
            throw new errors_1.NotFoundError(`Aula con ID ${aulaId} no encontrada`);
        }
        return this.aulaRepository.getEquipamientos(aulaId);
    }
}
exports.AulaService = AulaService;
//# sourceMappingURL=aula.service.js.map