"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonaRepository = void 0;
const client_1 = require("@prisma/client");
class PersonaRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.persona.create({
            data: {
                ...data,
                fechaIngreso: data.tipo === client_1.TipoPersona.SOCIO && data.fechaIngreso
                    ? new Date(data.fechaIngreso)
                    : data.tipo === client_1.TipoPersona.SOCIO
                        ? new Date()
                        : undefined,
                fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : undefined
            }
        });
    }
    async findAll(query) {
        const where = {};
        if (query.tipo) {
            where.tipo = query.tipo;
        }
        if (query.categoria) {
            where.categoria = query.categoria;
        }
        if (query.activo !== undefined) {
            if (query.activo) {
                where.fechaBaja = null;
            }
            else {
                where.fechaBaja = { not: null };
            }
        }
        if (query.search) {
            where.OR = [
                { nombre: { contains: query.search, mode: 'insensitive' } },
                { apellido: { contains: query.search, mode: 'insensitive' } },
                { dni: { contains: query.search } },
                { email: { contains: query.search, mode: 'insensitive' } }
            ];
        }
        const skip = (query.page - 1) * query.limit;
        const [data, total] = await Promise.all([
            this.prisma.persona.findMany({
                where,
                skip,
                take: query.limit,
                orderBy: [
                    { apellido: 'asc' },
                    { nombre: 'asc' }
                ]
            }),
            this.prisma.persona.count({ where })
        ]);
        return { data, total };
    }
    async findById(id) {
        return this.prisma.persona.findUnique({
            where: { id },
            include: {
                participaciones: {
                    include: {
                        actividad: true
                    }
                },
                familiares: {
                    include: {
                        familiar: {
                            select: {
                                id: true,
                                nombre: true,
                                apellido: true,
                                dni: true
                            }
                        }
                    }
                },
                comisionDirectiva: true
            }
        });
    }
    async findByDni(dni) {
        return this.prisma.persona.findUnique({
            where: { dni }
        });
    }
    async findByEmail(email) {
        return this.prisma.persona.findUnique({
            where: { email }
        });
    }
    async update(id, data) {
        const updateData = { ...data };
        if (updateData.fechaIngreso) {
            updateData.fechaIngreso = new Date(updateData.fechaIngreso);
        }
        if (updateData.fechaNacimiento) {
            updateData.fechaNacimiento = new Date(updateData.fechaNacimiento);
        }
        if (updateData.fechaBaja) {
            updateData.fechaBaja = new Date(updateData.fechaBaja);
        }
        return this.prisma.persona.update({
            where: { id },
            data: updateData
        });
    }
    async softDelete(id, motivo) {
        return this.prisma.persona.update({
            where: { id },
            data: {
                fechaBaja: new Date(),
                motivoBaja: motivo
            }
        });
    }
    async hardDelete(id) {
        return this.prisma.persona.delete({
            where: { id }
        });
    }
    async getNextNumeroSocio() {
        const lastSocio = await this.prisma.persona.findFirst({
            where: {
                tipo: client_1.TipoPersona.SOCIO,
                numeroSocio: { not: null }
            },
            orderBy: {
                numeroSocio: 'desc'
            }
        });
        return (lastSocio?.numeroSocio || 0) + 1;
    }
    async getSocios(categoria, activos = true) {
        const where = {
            tipo: client_1.TipoPersona.SOCIO
        };
        if (categoria) {
            where.categoria = categoria;
        }
        if (activos) {
            where.fechaBaja = null;
        }
        return this.prisma.persona.findMany({
            where,
            orderBy: [
                { numeroSocio: 'asc' }
            ]
        });
    }
}
exports.PersonaRepository = PersonaRepository;
//# sourceMappingURL=persona.repository.js.map