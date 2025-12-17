"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExencionCuotaService = void 0;
const client_1 = require("@prisma/client");
const database_1 = require("@/config/database");
const logger_1 = require("@/utils/logger");
class ExencionCuotaService {
    constructor(exencionRepository, historialRepository, personaRepository) {
        this.exencionRepository = exencionRepository;
        this.historialRepository = historialRepository;
        this.personaRepository = personaRepository;
    }
    get prisma() {
        return database_1.prisma;
    }
    async createExencion(data, usuario) {
        const persona = await this.personaRepository.findById(data.personaId);
        if (!persona) {
            throw new Error(`Persona con ID ${data.personaId} no encontrada`);
        }
        if (!persona.activo) {
            throw new Error(`No se puede crear exención para persona inactiva (ID: ${data.personaId})`);
        }
        if (data.fechaFin && data.fechaFin < data.fechaInicio) {
            throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
        }
        if (data.tipoExencion === 'TOTAL' && data.porcentajeExencion !== 100) {
            throw new Error('Exención TOTAL debe tener porcentaje 100%');
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const exencion = await this.exencionRepository.create({
                ...data,
                porcentajeExencion: new client_1.Prisma.Decimal(data.porcentajeExencion || 100),
                solicitadoPor: data.solicitadoPor || usuario
            }, tx);
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
        logger_1.logger.info(`Exención creada: ${result.motivoExencion} (${result.tipoExencion}) para persona ${data.personaId} - ID: ${result.id}`);
        return result;
    }
    async aprobarExencion(id, data, usuario) {
        const exencion = await this.exencionRepository.findById(id);
        if (!exencion) {
            throw new Error(`Exención con ID ${id} no encontrada`);
        }
        if (exencion.estado !== 'PENDIENTE_APROBACION') {
            throw new Error(`Solo se pueden aprobar exenciones en estado PENDIENTE_APROBACION (estado actual: ${exencion.estado})`);
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const exencionAprobada = await this.exencionRepository.aprobar(id, data.aprobadoPor, data.observaciones, tx);
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
        logger_1.logger.info(`Exención aprobada: ID ${id} por ${data.aprobadoPor}`);
        return result;
    }
    async rechazarExencion(id, data, usuario) {
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
        logger_1.logger.info(`Exención rechazada: ID ${id} - ${data.motivoRechazo}`);
        return result;
    }
    async revocarExencion(id, data, usuario) {
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
        logger_1.logger.warn(`Exención revocada: ID ${id} - ${data.motivoRevocacion}`);
        return result;
    }
    async updateExencion(id, data, usuario) {
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
        logger_1.logger.info(`Exención modificada: ID ${id}`);
        return result;
    }
    async deleteExencion(id, usuario) {
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
        logger_1.logger.warn(`Exención eliminada: ID ${id}`);
    }
    async getExencionById(id) {
        return this.exencionRepository.findById(id);
    }
    async getExencionesByPersonaId(personaId, soloActivas = false) {
        return this.exencionRepository.findByPersonaId(personaId, soloActivas);
    }
    async getExenciones(filters) {
        return this.exencionRepository.findAll(filters);
    }
    async getPendientes() {
        return this.exencionRepository.findPendientes();
    }
    async getVigentes() {
        return this.exencionRepository.findVigentes();
    }
    async getStats(personaId) {
        return this.exencionRepository.getStats(personaId);
    }
    async checkExencionParaPeriodo(personaId, fecha) {
        const exenciones = await this.exencionRepository.findActiveByPersonaAndPeriodo(personaId, fecha);
        if (exenciones.length === 0) {
            return { tieneExencion: false, porcentaje: 0 };
        }
        const exencion = exenciones[0];
        return {
            tieneExencion: true,
            porcentaje: Number(exencion.porcentajeExencion),
            exencion
        };
    }
    async updateVencidas() {
        const count = await this.exencionRepository.updateVencidas();
        if (count > 0) {
            logger_1.logger.info(`${count} exenciones marcadas como vencidas`);
        }
        return count;
    }
}
exports.ExencionCuotaService = ExencionCuotaService;
//# sourceMappingURL=exencion-cuota.service.js.map