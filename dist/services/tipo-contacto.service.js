"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TipoContactoService = void 0;
const tipo_contacto_repository_1 = require("@/repositories/tipo-contacto.repository");
const logger_1 = require("@/utils/logger");
class TipoContactoService {
    constructor(prisma) {
        this.tipoContactoRepository = new tipo_contacto_repository_1.TipoContactoRepository(prisma);
    }
    async create(data) {
        const tipo = await this.tipoContactoRepository.create(data);
        logger_1.logger.info(`Tipo de contacto creado`, {
            id: tipo.id,
            codigo: tipo.codigo,
            nombre: tipo.nombre
        });
        return tipo;
    }
    async findAll(params) {
        const soloActivos = params?.soloActivos ?? true;
        const ordenarPor = params?.ordenarPor ?? 'orden';
        return this.tipoContactoRepository.findAll(soloActivos, ordenarPor);
    }
    async findById(id) {
        return this.tipoContactoRepository.findById(id);
    }
    async findByCodigo(codigo) {
        return this.tipoContactoRepository.findByCodigo(codigo);
    }
    async update(id, data) {
        const tipo = await this.tipoContactoRepository.update(id, data);
        logger_1.logger.info(`Tipo de contacto actualizado`, {
            id: tipo.id,
            codigo: tipo.codigo
        });
        return tipo;
    }
    async delete(id) {
        const tipo = await this.tipoContactoRepository.delete(id);
        logger_1.logger.warn(`Tipo de contacto eliminado PERMANENTEMENTE`, {
            id: tipo.id,
            codigo: tipo.codigo
        });
        return tipo;
    }
    async deactivate(id) {
        const tipo = await this.tipoContactoRepository.deactivate(id);
        logger_1.logger.info(`Tipo de contacto desactivado`, {
            id: tipo.id,
            codigo: tipo.codigo
        });
        return tipo;
    }
    async activate(id) {
        const tipo = await this.tipoContactoRepository.activate(id);
        logger_1.logger.info(`Tipo de contacto activado`, {
            id: tipo.id,
            codigo: tipo.codigo
        });
        return tipo;
    }
    async getEstadisticasUso() {
        return this.tipoContactoRepository.getEstadisticasUso();
    }
}
exports.TipoContactoService = TipoContactoService;
//# sourceMappingURL=tipo-contacto.service.js.map