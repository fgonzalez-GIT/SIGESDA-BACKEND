"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesDocentesService = void 0;
const logger_1 = require("@/utils/logger");
class RolesDocentesService {
    constructor(repository) {
        this.repository = repository;
    }
    async create(data) {
        logger_1.logger.info(`Creando rol de docente: ${data.codigo}`);
        data.codigo = data.codigo.toUpperCase();
        const rol = await this.repository.create(data);
        logger_1.logger.info(`Rol de docente creado exitosamente: ${rol.id}`);
        return rol;
    }
    async findAll(query) {
        logger_1.logger.info(`Listando roles de docentes con filtros:`, query);
        return this.repository.findAll(query);
    }
    async findById(id) {
        logger_1.logger.info(`Obteniendo rol de docente: ${id}`);
        return this.repository.findById(id);
    }
    async update(id, data) {
        logger_1.logger.info(`Actualizando rol de docente: ${id}`);
        if (data.codigo) {
            data.codigo = data.codigo.toUpperCase();
        }
        const rol = await this.repository.update(id, data);
        logger_1.logger.info(`Rol de docente actualizado exitosamente: ${rol.id}`);
        return rol;
    }
    async delete(id) {
        logger_1.logger.info(`Desactivando rol de docente: ${id}`);
        const rol = await this.repository.delete(id);
        logger_1.logger.info(`Rol de docente desactivado exitosamente: ${rol.id}`);
        return rol;
    }
    async reorder(data) {
        logger_1.logger.info(`Reordenando ${data.ids.length} roles de docentes`);
        return this.repository.reorder(data);
    }
    async getActivos() {
        return this.repository.findAll({
            includeInactive: false,
            orderBy: 'orden',
            orderDir: 'asc'
        });
    }
}
exports.RolesDocentesService = RolesDocentesService;
//# sourceMappingURL=rolesDocentes.service.js.map