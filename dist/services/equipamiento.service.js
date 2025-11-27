"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipamientoService = void 0;
const logger_1 = require("@/utils/logger");
const errors_1 = require("@/utils/errors");
const database_1 = require("@/config/database");
class EquipamientoService {
    constructor(equipamientoRepository) {
        this.equipamientoRepository = equipamientoRepository;
    }
    async generateCodigoEquipamiento(categoriaEquipamientoId) {
        const categoria = await database_1.prisma.categoriasEquipamiento.findUnique({
            where: { id: categoriaEquipamientoId }
        });
        if (!categoria) {
            throw new errors_1.ValidationError(`Categoría de equipamiento con ID ${categoriaEquipamientoId} no encontrada`);
        }
        const prefix = categoria.codigo.substring(0, 4).toUpperCase();
        const maxCodigo = await this.equipamientoRepository.findMaxCodigoByCategoriaPrefix(prefix);
        let nextNumber = 1;
        if (maxCodigo) {
            const match = maxCodigo.match(/\d+$/);
            if (match) {
                nextNumber = parseInt(match[0]) + 1;
            }
        }
        return `${prefix}-${String(nextNumber).padStart(3, '0')}`;
    }
    async createEquipamiento(data) {
        const categoria = await database_1.prisma.categoriasEquipamiento.findUnique({
            where: { id: data.categoriaEquipamientoId }
        });
        if (!categoria) {
            throw new errors_1.NotFoundError(`Categoría de equipamiento con ID ${data.categoriaEquipamientoId} no encontrada`);
        }
        if (!categoria.activo) {
            throw new errors_1.ValidationError(`La categoría "${categoria.nombre}" está inactiva`);
        }
        const existingNombre = await this.equipamientoRepository.findByNombre(data.nombre);
        if (existingNombre) {
            throw new errors_1.ConflictError(`Ya existe un equipamiento con el nombre ${data.nombre}`);
        }
        if (!data.codigo) {
            data.codigo = await this.generateCodigoEquipamiento(data.categoriaEquipamientoId);
        }
        else {
            const existingCodigo = await this.equipamientoRepository.findByCodigo(data.codigo);
            if (existingCodigo) {
                throw new errors_1.ConflictError(`Ya existe un equipamiento con el código ${data.codigo}`);
            }
        }
        const equipamiento = await this.equipamientoRepository.create(data);
        logger_1.logger.info(`Equipamiento creado: ${equipamiento.codigo} - ${equipamiento.nombre} (ID: ${equipamiento.id})`);
        return equipamiento;
    }
    async getEquipamientos(query) {
        const result = await this.equipamientoRepository.findAll(query);
        const pages = Math.ceil(result.total / query.limit);
        return {
            ...result,
            pages
        };
    }
    async getEquipamientoById(id) {
        return this.equipamientoRepository.findById(id);
    }
    async updateEquipamiento(id, data) {
        const existingEquipamiento = await this.equipamientoRepository.findById(id);
        if (!existingEquipamiento) {
            throw new errors_1.NotFoundError(`Equipamiento con ID ${id} no encontrado`);
        }
        if ('codigo' in data) {
            throw new errors_1.ValidationError('El código no se puede modificar');
        }
        if (data.nombre && data.nombre !== existingEquipamiento.nombre) {
            const equipamientoWithSameName = await this.equipamientoRepository.findByNombre(data.nombre);
            if (equipamientoWithSameName) {
                throw new errors_1.ConflictError(`Ya existe un equipamiento con el nombre ${data.nombre}`);
            }
        }
        if (data.categoriaEquipamientoId && data.categoriaEquipamientoId !== existingEquipamiento.categoriaEquipamientoId) {
            const categoria = await database_1.prisma.categoriasEquipamiento.findUnique({
                where: { id: data.categoriaEquipamientoId }
            });
            if (!categoria) {
                throw new errors_1.NotFoundError(`Categoría de equipamiento con ID ${data.categoriaEquipamientoId} no encontrada`);
            }
            if (!categoria.activo) {
                throw new errors_1.ValidationError(`La categoría "${categoria.nombre}" está inactiva`);
            }
        }
        const updatedEquipamiento = await this.equipamientoRepository.update(id, data);
        logger_1.logger.info(`Equipamiento actualizado: ${updatedEquipamiento.nombre} (ID: ${id})`);
        return updatedEquipamiento;
    }
    async deleteEquipamiento(id, hard = false) {
        const existingEquipamiento = await this.equipamientoRepository.findById(id);
        if (!existingEquipamiento) {
            throw new errors_1.NotFoundError(`Equipamiento con ID ${id} no encontrado`);
        }
        const usageCount = await this.equipamientoRepository.checkUsageInAulas(id);
        if (usageCount > 0 && hard) {
            throw new errors_1.ValidationError(`No se puede eliminar el equipamiento porque está asignado a ${usageCount} aula(s). ` +
                `Use soft delete o desasigne el equipamiento de todas las aulas primero.`);
        }
        let deletedEquipamiento;
        if (hard && usageCount === 0) {
            deletedEquipamiento = await this.equipamientoRepository.delete(id);
            logger_1.logger.info(`Equipamiento eliminado permanentemente: ${deletedEquipamiento.nombre} (ID: ${id})`);
        }
        else {
            deletedEquipamiento = await this.equipamientoRepository.softDelete(id);
            logger_1.logger.info(`Equipamiento desactivado (soft delete): ${deletedEquipamiento.nombre} (ID: ${id})`);
        }
        return deletedEquipamiento;
    }
    async reactivateEquipamiento(id) {
        const existingEquipamiento = await this.equipamientoRepository.findById(id);
        if (!existingEquipamiento) {
            throw new errors_1.NotFoundError(`Equipamiento con ID ${id} no encontrado`);
        }
        if (existingEquipamiento.activo) {
            throw new errors_1.ValidationError(`El equipamiento ${existingEquipamiento.nombre} ya está activo`);
        }
        const reactivatedEquipamiento = await this.equipamientoRepository.update(id, { activo: true });
        logger_1.logger.info(`Equipamiento reactivado: ${reactivatedEquipamiento.nombre} (ID: ${id})`);
        return reactivatedEquipamiento;
    }
    async getEquipamientoStats(id) {
        const equipamiento = await this.equipamientoRepository.findById(id);
        if (!equipamiento) {
            throw new errors_1.NotFoundError(`Equipamiento con ID ${id} no encontrado`);
        }
        const aulas_equipamientos = equipamiento.aulas_equipamientos || [];
        const totalAulas = aulas_equipamientos.length;
        const totalCantidad = aulas_equipamientos.reduce((sum, ae) => sum + ae.cantidad, 0);
        const aulasList = aulas_equipamientos.map((ae) => ({
            aulaId: ae.aula.id,
            aulaNombre: ae.aula.nombre,
            cantidad: ae.cantidad,
            observaciones: ae.observaciones
        }));
        return {
            equipamiento: {
                id: equipamiento.id,
                nombre: equipamiento.nombre,
                descripcion: equipamiento.descripcion,
                activo: equipamiento.activo
            },
            totalAulas,
            totalCantidad,
            aulas: aulasList
        };
    }
}
exports.EquipamientoService = EquipamientoService;
//# sourceMappingURL=equipamiento.service.js.map