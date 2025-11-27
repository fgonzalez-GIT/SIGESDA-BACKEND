"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstadoReservaService = void 0;
const estado_reserva_repository_1 = require("@/repositories/estado-reserva.repository");
class EstadoReservaService {
    constructor(prisma) {
        this.prisma = prisma;
        this.repository = new estado_reserva_repository_1.EstadoReservaRepository(prisma);
    }
    async create(data) {
        try {
            const estado = await this.repository.create(data);
            return {
                success: true,
                message: 'Estado de reserva creado exitosamente',
                data: estado
            };
        }
        catch (error) {
            throw new Error(`Error al crear estado de reserva: ${error.message}`);
        }
    }
    async findAll(query) {
        try {
            const estados = await this.repository.findAll(query);
            return {
                success: true,
                data: estados,
                message: `Se encontraron ${estados.length} estado(s) de reserva`
            };
        }
        catch (error) {
            throw new Error(`Error al listar estados de reserva: ${error.message}`);
        }
    }
    async findById(id) {
        try {
            const estado = await this.repository.findById(id);
            return {
                success: true,
                data: estado
            };
        }
        catch (error) {
            throw new Error(`Error al obtener estado de reserva: ${error.message}`);
        }
    }
    async findByCodigo(codigo) {
        try {
            const estado = await this.repository.findByCodigo(codigo);
            return {
                success: true,
                data: estado
            };
        }
        catch (error) {
            throw new Error(`Error al obtener estado de reserva por código: ${error.message}`);
        }
    }
    async update(id, data) {
        try {
            const estado = await this.repository.update(id, data);
            return {
                success: true,
                message: 'Estado de reserva actualizado exitosamente',
                data: estado
            };
        }
        catch (error) {
            throw new Error(`Error al actualizar estado de reserva: ${error.message}`);
        }
    }
    async delete(id) {
        try {
            const estado = await this.repository.delete(id);
            return {
                success: true,
                message: `Estado de reserva "${estado.nombre}" desactivado exitosamente`,
                data: estado
            };
        }
        catch (error) {
            throw new Error(`Error al desactivar estado de reserva: ${error.message}`);
        }
    }
    async reorder(data) {
        try {
            const result = await this.repository.reorder(data);
            return {
                success: true,
                message: result.message,
                data: { count: result.count }
            };
        }
        catch (error) {
            throw new Error(`Error al reordenar estados de reserva: ${error.message}`);
        }
    }
    async getEstadoInicial() {
        try {
            const estado = await this.repository.findByCodigo('PENDIENTE');
            return estado;
        }
        catch (error) {
            const estados = await this.repository.findAll({
                includeInactive: false,
                orderBy: 'orden',
                orderDir: 'asc',
                page: 1,
                limit: 1
            });
            if (estados.length === 0) {
                throw new Error('No hay estados de reserva activos en el sistema');
            }
            return estados[0];
        }
    }
    async validateEstado(estadoId) {
        try {
            const estado = await this.repository.findById(estadoId);
            return estado.activo;
        }
        catch (error) {
            return false;
        }
    }
    async validateTransicion(estadoActualCodigo, nuevoEstadoCodigo) {
        const transicionesPermitidas = {
            'PENDIENTE': ['CONFIRMADA', 'RECHAZADA', 'CANCELADA'],
            'CONFIRMADA': ['COMPLETADA', 'CANCELADA'],
            'COMPLETADA': [],
            'CANCELADA': [],
            'RECHAZADA': []
        };
        const permitidas = transicionesPermitidas[estadoActualCodigo] || [];
        return permitidas.includes(nuevoEstadoCodigo);
    }
    async getEstadisticasUso() {
        try {
            const estados = await this.repository.findAll({
                includeInactive: false,
                orderBy: 'orden',
                orderDir: 'asc',
                page: 1,
                limit: 100
            });
            const estadisticas = estados.map((estado) => ({
                id: estado.id,
                codigo: estado.codigo,
                nombre: estado.nombre,
                totalReservas: estado._count.reservas,
                orden: estado.orden
            }));
            return {
                success: true,
                data: estadisticas,
                message: 'Estadísticas de uso de estados obtenidas exitosamente'
            };
        }
        catch (error) {
            throw new Error(`Error al obtener estadísticas: ${error.message}`);
        }
    }
}
exports.EstadoReservaService = EstadoReservaService;
//# sourceMappingURL=estado-reserva.service.js.map