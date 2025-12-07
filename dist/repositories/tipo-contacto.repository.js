"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TipoContactoRepository = void 0;
const error_middleware_1 = require("@/middleware/error.middleware");
const enums_1 = require("@/types/enums");
class TipoContactoRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const exists = await this.prisma.tipoContactoCatalogo.findUnique({
            where: { codigo: data.codigo }
        });
        if (exists) {
            throw new error_middleware_1.AppError(`Ya existe un tipo de contacto con el código '${data.codigo}'`, enums_1.HttpStatus.CONFLICT);
        }
        return this.prisma.tipoContactoCatalogo.create({ data });
    }
    async findAll(soloActivos = true, ordenarPor = 'orden') {
        return this.prisma.tipoContactoCatalogo.findMany({
            where: soloActivos ? { activo: true } : undefined,
            orderBy: { [ordenarPor]: 'asc' }
        });
    }
    async findById(id) {
        return this.prisma.tipoContactoCatalogo.findUnique({
            where: { id }
        });
    }
    async findByCodigo(codigo) {
        return this.prisma.tipoContactoCatalogo.findUnique({
            where: { codigo }
        });
    }
    async update(id, data) {
        const exists = await this.findById(id);
        if (!exists) {
            throw new error_middleware_1.AppError('Tipo de contacto no encontrado', enums_1.HttpStatus.NOT_FOUND);
        }
        if (data.codigo && data.codigo !== exists.codigo) {
            const codigoExists = await this.findByCodigo(data.codigo);
            if (codigoExists) {
                throw new error_middleware_1.AppError(`Ya existe un tipo de contacto con el código '${data.codigo}'`, enums_1.HttpStatus.CONFLICT);
            }
        }
        return this.prisma.tipoContactoCatalogo.update({
            where: { id },
            data
        });
    }
    async delete(id) {
        const tipo = await this.findById(id);
        if (!tipo) {
            throw new error_middleware_1.AppError('Tipo de contacto no encontrado', enums_1.HttpStatus.NOT_FOUND);
        }
        const contactosCount = await this.prisma.contactoPersona.count({
            where: { tipoContactoId: id }
        });
        if (contactosCount > 0) {
            throw new error_middleware_1.AppError(`No se puede eliminar el tipo de contacto porque tiene ${contactosCount} contacto(s) asociado(s). Desactívelo en su lugar.`, enums_1.HttpStatus.CONFLICT);
        }
        return this.prisma.tipoContactoCatalogo.delete({
            where: { id }
        });
    }
    async deactivate(id) {
        const exists = await this.findById(id);
        if (!exists) {
            throw new error_middleware_1.AppError('Tipo de contacto no encontrado', enums_1.HttpStatus.NOT_FOUND);
        }
        return this.prisma.tipoContactoCatalogo.update({
            where: { id },
            data: { activo: false }
        });
    }
    async activate(id) {
        const exists = await this.findById(id);
        if (!exists) {
            throw new error_middleware_1.AppError('Tipo de contacto no encontrado', enums_1.HttpStatus.NOT_FOUND);
        }
        return this.prisma.tipoContactoCatalogo.update({
            where: { id },
            data: { activo: true }
        });
    }
    async contarContactosAsociados(id) {
        return this.prisma.contactoPersona.count({
            where: { tipoContactoId: id }
        });
    }
    async getEstadisticasUso() {
        const tipos = await this.findAll(false);
        const estadisticas = await Promise.all(tipos.map(async (tipo) => {
            const totalContactos = await this.prisma.contactoPersona.count({
                where: { tipoContactoId: tipo.id }
            });
            const contactosActivos = await this.prisma.contactoPersona.count({
                where: {
                    tipoContactoId: tipo.id,
                    activo: true
                }
            });
            return {
                tipo,
                totalContactos,
                contactosActivos
            };
        }));
        return estadisticas;
    }
}
exports.TipoContactoRepository = TipoContactoRepository;
//# sourceMappingURL=tipo-contacto.repository.js.map