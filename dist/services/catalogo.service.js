"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogoService = void 0;
const catalogo_dto_1 = require("@/dto/catalogo.dto");
const logger_1 = require("@/utils/logger");
const error_middleware_1 = require("@/middleware/error.middleware");
const enums_1 = require("@/types/enums");
class CatalogoService {
    constructor(catalogoRepository) {
        this.catalogoRepository = catalogoRepository;
    }
    async createTipoPersona(data) {
        const existingCodigo = await this.catalogoRepository.getTipoPersonaByCodigo(data.codigo);
        if (existingCodigo) {
            throw new error_middleware_1.AppError(`Ya existe un tipo de persona con código '${data.codigo}'`, enums_1.HttpStatus.CONFLICT);
        }
        if (catalogo_dto_1.TIPOS_SISTEMA_PROTEGIDOS.includes(data.codigo)) {
            throw new error_middleware_1.AppError(`El código '${data.codigo}' está reservado para tipos del sistema`, enums_1.HttpStatus.BAD_REQUEST);
        }
        const tipo = await this.catalogoRepository.createTipoPersona(data);
        logger_1.logger.info(`Tipo de persona creado: ${tipo.codigo} - ${tipo.nombre} (ID: ${tipo.id})`);
        return tipo;
    }
    async updateTipoPersona(id, data) {
        const existing = await this.catalogoRepository.getTipoPersonaById(id);
        if (!existing) {
            throw new error_middleware_1.AppError(`Tipo de persona con ID ${id} no encontrado`, enums_1.HttpStatus.NOT_FOUND);
        }
        if (data.activo === false) {
            const count = await this.catalogoRepository.countPersonasConTipo(id, true);
            if (count > 0) {
                throw new error_middleware_1.AppError(`No se puede desactivar el tipo. Hay ${count} persona(s) con este tipo asignado activamente`, enums_1.HttpStatus.BAD_REQUEST);
            }
        }
        const updated = await this.catalogoRepository.updateTipoPersona(id, data);
        logger_1.logger.info(`Tipo de persona actualizado: ${updated.codigo} - ${updated.nombre} (ID: ${id})`);
        return updated;
    }
    async deleteTipoPersona(id) {
        const tipo = await this.catalogoRepository.getTipoPersonaById(id);
        if (!tipo) {
            throw new error_middleware_1.AppError(`Tipo de persona con ID ${id} no encontrado`, enums_1.HttpStatus.NOT_FOUND);
        }
        if (catalogo_dto_1.TIPOS_SISTEMA_PROTEGIDOS.includes(tipo.codigo)) {
            throw new error_middleware_1.AppError(`No se puede eliminar el tipo '${tipo.codigo}' porque es un tipo del sistema`, enums_1.HttpStatus.BAD_REQUEST);
        }
        const count = await this.catalogoRepository.countPersonasConTipo(id, false);
        if (count > 0) {
            throw new error_middleware_1.AppError(`No se puede eliminar el tipo. Hay ${count} persona(s) con este tipo asignado. ` +
                `Considere desactivarlo en lugar de eliminarlo.`, enums_1.HttpStatus.BAD_REQUEST);
        }
        const deleted = await this.catalogoRepository.deleteTipoPersona(id);
        logger_1.logger.info(`Tipo de persona eliminado: ${deleted.codigo} - ${deleted.nombre} (ID: ${id})`);
        return deleted;
    }
    async toggleActivoTipoPersona(id, activo) {
        const tipo = await this.catalogoRepository.getTipoPersonaById(id);
        if (!tipo) {
            throw new error_middleware_1.AppError(`Tipo de persona con ID ${id} no encontrado`, enums_1.HttpStatus.NOT_FOUND);
        }
        if (tipo.activo === activo) {
            return tipo;
        }
        if (!activo) {
            const count = await this.catalogoRepository.countPersonasConTipo(id, true);
            if (count > 0) {
                throw new error_middleware_1.AppError(`No se puede desactivar el tipo. Hay ${count} persona(s) con este tipo asignado activamente`, enums_1.HttpStatus.BAD_REQUEST);
            }
        }
        const updated = await this.catalogoRepository.toggleActivoTipoPersona(id, activo);
        logger_1.logger.info(`Tipo de persona ${activo ? 'activado' : 'desactivado'}: ${updated.codigo} (ID: ${id})`);
        return updated;
    }
    async getAllTiposPersonaWithStats() {
        return this.catalogoRepository.getAllTiposPersonaWithStats();
    }
    async getTipoPersonaById(id) {
        const tipo = await this.catalogoRepository.getTipoPersonaById(id);
        if (!tipo) {
            throw new error_middleware_1.AppError(`Tipo de persona con ID ${id} no encontrado`, enums_1.HttpStatus.NOT_FOUND);
        }
        return tipo;
    }
    async createEspecialidad(data) {
        const existingCodigo = await this.catalogoRepository.getEspecialidadByCodigo(data.codigo);
        if (existingCodigo) {
            throw new error_middleware_1.AppError(`Ya existe una especialidad con código '${data.codigo}'`, enums_1.HttpStatus.CONFLICT);
        }
        if (catalogo_dto_1.ESPECIALIDADES_SISTEMA_PROTEGIDAS.includes(data.codigo)) {
            throw new error_middleware_1.AppError(`El código '${data.codigo}' está reservado para especialidades del sistema`, enums_1.HttpStatus.BAD_REQUEST);
        }
        const especialidad = await this.catalogoRepository.createEspecialidad(data);
        logger_1.logger.info(`Especialidad docente creada: ${especialidad.codigo} - ${especialidad.nombre} (ID: ${especialidad.id})`);
        return especialidad;
    }
    async updateEspecialidad(id, data) {
        const existing = await this.catalogoRepository.getEspecialidadById(id);
        if (!existing) {
            throw new error_middleware_1.AppError(`Especialidad con ID ${id} no encontrada`, enums_1.HttpStatus.NOT_FOUND);
        }
        if (data.activo === false) {
            const count = await this.catalogoRepository.countDocentesConEspecialidad(id, true);
            if (count > 0) {
                throw new error_middleware_1.AppError(`No se puede desactivar la especialidad. Hay ${count} docente(s) con esta especialidad asignada`, enums_1.HttpStatus.BAD_REQUEST);
            }
        }
        const updated = await this.catalogoRepository.updateEspecialidad(id, data);
        logger_1.logger.info(`Especialidad actualizada: ${updated.codigo} - ${updated.nombre} (ID: ${id})`);
        return updated;
    }
    async deleteEspecialidad(id) {
        const especialidad = await this.catalogoRepository.getEspecialidadById(id);
        if (!especialidad) {
            throw new error_middleware_1.AppError(`Especialidad con ID ${id} no encontrada`, enums_1.HttpStatus.NOT_FOUND);
        }
        if (catalogo_dto_1.ESPECIALIDADES_SISTEMA_PROTEGIDAS.includes(especialidad.codigo)) {
            throw new error_middleware_1.AppError(`No se puede eliminar la especialidad '${especialidad.codigo}' porque es una especialidad del sistema`, enums_1.HttpStatus.BAD_REQUEST);
        }
        const count = await this.catalogoRepository.countDocentesConEspecialidad(id, false);
        if (count > 0) {
            throw new error_middleware_1.AppError(`No se puede eliminar la especialidad. Hay ${count} docente(s) con esta especialidad asignada. ` +
                `Considere desactivarla en lugar de eliminarla.`, enums_1.HttpStatus.BAD_REQUEST);
        }
        const deleted = await this.catalogoRepository.deleteEspecialidad(id);
        logger_1.logger.info(`Especialidad eliminada: ${deleted.codigo} - ${deleted.nombre} (ID: ${id})`);
        return deleted;
    }
    async toggleActivoEspecialidad(id, activo) {
        const especialidad = await this.catalogoRepository.getEspecialidadById(id);
        if (!especialidad) {
            throw new error_middleware_1.AppError(`Especialidad con ID ${id} no encontrada`, enums_1.HttpStatus.NOT_FOUND);
        }
        if (especialidad.activo === activo) {
            return especialidad;
        }
        if (!activo) {
            const count = await this.catalogoRepository.countDocentesConEspecialidad(id, true);
            if (count > 0) {
                throw new error_middleware_1.AppError(`No se puede desactivar la especialidad. Hay ${count} docente(s) con esta especialidad asignada activamente`, enums_1.HttpStatus.BAD_REQUEST);
            }
        }
        const updated = await this.catalogoRepository.toggleActivoEspecialidad(id, activo);
        logger_1.logger.info(`Especialidad ${activo ? 'activada' : 'desactivada'}: ${updated.codigo} (ID: ${id})`);
        return updated;
    }
    async getAllEspecialidadesWithStats() {
        return this.catalogoRepository.getAllEspecialidadesWithStats();
    }
    async getEspecialidadById(id) {
        const especialidad = await this.catalogoRepository.getEspecialidadById(id);
        if (!especialidad) {
            throw new error_middleware_1.AppError(`Especialidad con ID ${id} no encontrada`, enums_1.HttpStatus.NOT_FOUND);
        }
        return especialidad;
    }
}
exports.CatalogoService = CatalogoService;
//# sourceMappingURL=catalogo.service.js.map