"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactoRepository = void 0;
const error_middleware_1 = require("@/middleware/error.middleware");
const enums_1 = require("@/types/enums");
class ContactoRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async agregarContacto(personaId, data) {
        const tipoContacto = await this.prisma.tipoContactoCatalogo.findUnique({
            where: { id: data.tipoContactoId }
        });
        if (!tipoContacto) {
            throw new error_middleware_1.AppError('Tipo de contacto no encontrado', enums_1.HttpStatus.NOT_FOUND);
        }
        if (!tipoContacto.activo) {
            throw new error_middleware_1.AppError('El tipo de contacto está inactivo', enums_1.HttpStatus.BAD_REQUEST);
        }
        if (tipoContacto.pattern) {
            try {
                const regex = new RegExp(tipoContacto.pattern);
                if (!regex.test(data.valor)) {
                    throw new error_middleware_1.AppError(`El formato del valor no es válido para ${tipoContacto.nombre}`, enums_1.HttpStatus.BAD_REQUEST);
                }
            }
            catch (error) {
                if (error instanceof error_middleware_1.AppError)
                    throw error;
                console.warn(`Pattern inválido en tipo ${tipoContacto.codigo}: ${tipoContacto.pattern}`);
            }
        }
        if (data.principal) {
            await this.prisma.contactoPersona.updateMany({
                where: {
                    personaId,
                    tipoContactoId: data.tipoContactoId,
                    principal: true
                },
                data: {
                    principal: false
                }
            });
        }
        return this.prisma.contactoPersona.create({
            data: {
                personaId,
                tipoContactoId: data.tipoContactoId,
                valor: data.valor,
                principal: data.principal ?? false,
                observaciones: data.observaciones,
                activo: data.activo ?? true
            },
            include: {
                tipoContacto: true
            }
        });
    }
    async getContactosByPersona(personaId, soloActivos = true) {
        return this.prisma.contactoPersona.findMany({
            where: {
                personaId,
                ...(soloActivos && { activo: true })
            },
            include: {
                tipoContacto: true
            },
            orderBy: [
                { principal: 'desc' },
                { tipoContacto: { orden: 'asc' } },
                { createdAt: 'desc' }
            ]
        });
    }
    async getContactoById(contactoId) {
        return this.prisma.contactoPersona.findUnique({
            where: { id: contactoId },
            include: {
                tipoContacto: true
            }
        });
    }
    async updateContacto(contactoId, data) {
        const contacto = await this.prisma.contactoPersona.findUnique({
            where: { id: contactoId },
            include: { tipoContacto: true }
        });
        if (!contacto) {
            throw new error_middleware_1.AppError('Contacto no encontrado', enums_1.HttpStatus.NOT_FOUND);
        }
        let tipoContactoNuevo = contacto.tipoContacto;
        if (data.tipoContactoId && data.tipoContactoId !== contacto.tipoContactoId) {
            const tipo = await this.prisma.tipoContactoCatalogo.findUnique({
                where: { id: data.tipoContactoId }
            });
            if (!tipo) {
                throw new error_middleware_1.AppError('Tipo de contacto no encontrado', enums_1.HttpStatus.NOT_FOUND);
            }
            if (!tipo.activo) {
                throw new error_middleware_1.AppError('El tipo de contacto está inactivo', enums_1.HttpStatus.BAD_REQUEST);
            }
            tipoContactoNuevo = tipo;
        }
        const valorFinal = data.valor ?? contacto.valor;
        if (tipoContactoNuevo.pattern) {
            try {
                const regex = new RegExp(tipoContactoNuevo.pattern);
                if (!regex.test(valorFinal)) {
                    throw new error_middleware_1.AppError(`El formato del valor no es válido para ${tipoContactoNuevo.nombre}`, enums_1.HttpStatus.BAD_REQUEST);
                }
            }
            catch (error) {
                if (error instanceof error_middleware_1.AppError)
                    throw error;
                console.warn(`Pattern inválido en tipo ${tipoContactoNuevo.codigo}: ${tipoContactoNuevo.pattern}`);
            }
        }
        if (data.principal) {
            const tipoId = data.tipoContactoId ?? contacto.tipoContactoId;
            await this.prisma.contactoPersona.updateMany({
                where: {
                    personaId: contacto.personaId,
                    tipoContactoId: tipoId,
                    principal: true,
                    NOT: { id: contactoId }
                },
                data: { principal: false }
            });
        }
        return this.prisma.contactoPersona.update({
            where: { id: contactoId },
            data,
            include: {
                tipoContacto: true
            }
        });
    }
    async eliminarContacto(contactoId) {
        const contacto = await this.getContactoById(contactoId);
        if (!contacto) {
            throw new error_middleware_1.AppError('Contacto no encontrado', enums_1.HttpStatus.NOT_FOUND);
        }
        return this.prisma.contactoPersona.update({
            where: { id: contactoId },
            data: { activo: false },
            include: {
                tipoContacto: true
            }
        });
    }
    async eliminarContactoPermanente(contactoId) {
        const contacto = await this.getContactoById(contactoId);
        if (!contacto) {
            throw new error_middleware_1.AppError('Contacto no encontrado', enums_1.HttpStatus.NOT_FOUND);
        }
        return this.prisma.contactoPersona.delete({
            where: { id: contactoId },
            include: {
                tipoContacto: true
            }
        });
    }
    async existeContactoDuplicado(personaId, valor, excludeId) {
        const count = await this.prisma.contactoPersona.count({
            where: {
                personaId,
                valor,
                activo: true,
                ...(excludeId && { NOT: { id: excludeId } })
            }
        });
        return count > 0;
    }
}
exports.ContactoRepository = ContactoRepository;
//# sourceMappingURL=contacto.repository.js.map