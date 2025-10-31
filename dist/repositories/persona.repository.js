"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonaRepository = void 0;
class PersonaRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const { tipos = [], contactos = [], ...personaData } = data;
        const tiposFinales = tipos.length === 0
            ? [{ tipoPersonaCodigo: 'NO_SOCIO' }]
            : tipos;
        return this.prisma.persona.create({
            data: {
                ...personaData,
                fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : undefined,
                tipos: {
                    create: await Promise.all(tiposFinales.map(async (tipo) => {
                        let tipoPersonaId = tipo.tipoPersonaId;
                        if (!tipoPersonaId && tipo.tipoPersonaCodigo) {
                            const tipoCatalogo = await this.prisma.tipoPersonaCatalogo.findUnique({
                                where: { codigo: tipo.tipoPersonaCodigo }
                            });
                            if (!tipoCatalogo) {
                                throw new Error(`Tipo de persona '${tipo.tipoPersonaCodigo}' no encontrado`);
                            }
                            tipoPersonaId = tipoCatalogo.id;
                        }
                        const tipoData = {
                            tipoPersonaId: tipoPersonaId,
                            activo: true
                        };
                        if (tipo.categoriaId) {
                            tipoData.categoriaId = tipo.categoriaId;
                        }
                        if (tipo.numeroSocio) {
                            tipoData.numeroSocio = tipo.numeroSocio;
                        }
                        if (tipo.fechaIngreso) {
                            tipoData.fechaIngreso = new Date(tipo.fechaIngreso);
                        }
                        if (tipo.especialidadId) {
                            tipoData.especialidadId = tipo.especialidadId;
                        }
                        if (tipo.honorariosPorHora) {
                            tipoData.honorariosPorHora = tipo.honorariosPorHora;
                        }
                        if (tipo.cuit) {
                            tipoData.cuit = tipo.cuit;
                        }
                        if (tipo.razonSocial) {
                            tipoData.razonSocial = tipo.razonSocial;
                        }
                        return tipoData;
                    }))
                },
                contactos: {
                    create: contactos.map((contacto) => ({
                        tipoContacto: contacto.tipoContacto,
                        valor: contacto.valor,
                        principal: contacto.principal ?? false,
                        observaciones: contacto.observaciones,
                        activo: contacto.activo ?? true
                    }))
                }
            },
            include: {
                tipos: {
                    include: {
                        tipoPersona: true,
                        categoria: true,
                        especialidad: true
                    }
                },
                contactos: true
            }
        });
    }
    async findAll(query) {
        const where = {};
        if (query.tiposCodigos && query.tiposCodigos.length > 0) {
            where.tipos = {
                some: {
                    activo: true,
                    tipoPersona: {
                        codigo: { in: query.tiposCodigos }
                    }
                }
            };
        }
        if (query.categoriaId) {
            where.tipos = {
                some: {
                    activo: true,
                    categoriaId: query.categoriaId
                }
            };
        }
        if (query.especialidadId) {
            where.tipos = {
                some: {
                    activo: true,
                    especialidadId: query.especialidadId
                }
            };
        }
        if (query.activo !== undefined) {
            if (query.activo) {
                where.tipos = {
                    some: {
                        activo: true,
                        fechaDesasignacion: null
                    }
                };
            }
            else {
                where.tipos = {
                    every: {
                        OR: [
                            { activo: false },
                            { fechaDesasignacion: { not: null } }
                        ]
                    }
                };
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
        const include = {};
        if (query.includeTipos) {
            include.tipos = {
                where: { activo: true },
                include: {
                    tipoPersona: true,
                    categoria: true,
                    especialidad: true
                }
            };
        }
        if (query.includeContactos) {
            include.contactos = {
                where: { activo: true }
            };
        }
        const [data, total] = await Promise.all([
            this.prisma.persona.findMany({
                where,
                skip,
                take: query.limit,
                orderBy: [
                    { apellido: 'asc' },
                    { nombre: 'asc' }
                ],
                include
            }),
            this.prisma.persona.count({ where })
        ]);
        return { data, total };
    }
    async findById(id, includeRelations = true) {
        return this.prisma.persona.findUnique({
            where: { id },
            include: includeRelations ? {
                tipos: {
                    include: {
                        tipoPersona: true,
                        categoria: true,
                        especialidad: true
                    },
                    orderBy: { fechaAsignacion: 'desc' }
                },
                contactos: {
                    where: { activo: true },
                    orderBy: [
                        { principal: 'desc' },
                        { tipoContacto: 'asc' }
                    ]
                },
                participaciones_actividades: {
                    include: {
                        actividades: true
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
            } : undefined
        });
    }
    async findByDni(dni) {
        return this.prisma.persona.findUnique({
            where: { dni },
            include: {
                tipos: {
                    where: { activo: true },
                    include: {
                        tipoPersona: true
                    }
                }
            }
        });
    }
    async findByEmail(email) {
        return this.prisma.persona.findUnique({
            where: { email }
        });
    }
    async update(id, data) {
        const updateData = { ...data };
        if (updateData.fechaNacimiento) {
            updateData.fechaNacimiento = new Date(updateData.fechaNacimiento);
        }
        return this.prisma.persona.update({
            where: { id },
            data: updateData,
            include: {
                tipos: {
                    where: { activo: true },
                    include: {
                        tipoPersona: true,
                        categoria: true,
                        especialidad: true
                    }
                },
                contactos: {
                    where: { activo: true }
                }
            }
        });
    }
    async hardDelete(id) {
        return this.prisma.persona.delete({
            where: { id }
        });
    }
    async softDelete(id, motivo) {
        await this.prisma.personaTipo.updateMany({
            where: {
                personaId: id,
                activo: true
            },
            data: {
                activo: false,
                fechaDesasignacion: new Date(),
                motivoBaja: motivo
            }
        });
        return this.findById(id);
    }
    async findByTipo(tipoPersonaCodigo, soloActivos = true) {
        return this.prisma.persona.findMany({
            where: {
                tipos: {
                    some: {
                        activo: soloActivos ? true : undefined,
                        fechaDesasignacion: soloActivos ? null : undefined,
                        tipoPersona: {
                            codigo: tipoPersonaCodigo
                        }
                    }
                }
            },
            include: {
                tipos: {
                    where: {
                        activo: true,
                        tipoPersona: {
                            codigo: tipoPersonaCodigo
                        }
                    },
                    include: {
                        tipoPersona: true,
                        categoria: true,
                        especialidad: true
                    }
                }
            },
            orderBy: [
                { apellido: 'asc' },
                { nombre: 'asc' }
            ]
        });
    }
    async getSocios(params) {
        const where = {
            tipos: {
                some: {
                    tipoPersona: {
                        codigo: 'SOCIO'
                    }
                }
            }
        };
        if (params?.activos) {
            where.tipos.some.activo = true;
            where.tipos.some.fechaDesasignacion = null;
            where.tipos.some.fechaBaja = null;
        }
        if (params?.categoriaId) {
            where.tipos.some.categoriaId = params.categoriaId;
        }
        if (params?.conNumeroSocio) {
            where.tipos.some.numeroSocio = { not: null };
        }
        return this.prisma.persona.findMany({
            where,
            include: {
                tipos: {
                    where: {
                        tipoPersona: {
                            codigo: 'SOCIO'
                        },
                        activo: params?.activos ? true : undefined
                    },
                    include: {
                        tipoPersona: true,
                        categoria: true
                    }
                }
            },
            orderBy: [
                { apellido: 'asc' },
                { nombre: 'asc' }
            ]
        });
    }
    async getDocentes(params) {
        const where = {
            tipos: {
                some: {
                    tipoPersona: {
                        codigo: 'DOCENTE'
                    }
                }
            }
        };
        if (params?.activos) {
            where.tipos.some.activo = true;
            where.tipos.some.fechaDesasignacion = null;
        }
        if (params?.especialidadId) {
            where.tipos.some.especialidadId = params.especialidadId;
        }
        return this.prisma.persona.findMany({
            where,
            include: {
                tipos: {
                    where: {
                        tipoPersona: {
                            codigo: 'DOCENTE'
                        },
                        activo: params?.activos ? true : undefined
                    },
                    include: {
                        tipoPersona: true,
                        especialidad: true
                    }
                }
            },
            orderBy: [
                { apellido: 'asc' },
                { nombre: 'asc' }
            ]
        });
    }
    async getProveedores(activos = true) {
        return this.prisma.persona.findMany({
            where: {
                tipos: {
                    some: {
                        tipoPersona: {
                            codigo: 'PROVEEDOR'
                        },
                        activo: activos ? true : undefined,
                        fechaDesasignacion: activos ? null : undefined
                    }
                }
            },
            include: {
                tipos: {
                    where: {
                        tipoPersona: {
                            codigo: 'PROVEEDOR'
                        },
                        activo: activos ? true : undefined
                    },
                    include: {
                        tipoPersona: true
                    }
                }
            },
            orderBy: [
                { apellido: 'asc' },
                { nombre: 'asc' }
            ]
        });
    }
    async search(searchTerm, tipoPersonaCodigo, limit = 20) {
        const where = {
            OR: [
                { nombre: { contains: searchTerm, mode: 'insensitive' } },
                { apellido: { contains: searchTerm, mode: 'insensitive' } },
                { dni: { contains: searchTerm } },
                { email: { contains: searchTerm, mode: 'insensitive' } }
            ]
        };
        if (tipoPersonaCodigo) {
            where.tipos = {
                some: {
                    activo: true,
                    tipoPersona: {
                        codigo: tipoPersonaCodigo
                    }
                }
            };
        }
        return this.prisma.persona.findMany({
            where,
            take: limit,
            include: {
                tipos: {
                    where: { activo: true },
                    include: {
                        tipoPersona: true
                    }
                }
            },
            orderBy: [
                { apellido: 'asc' },
                { nombre: 'asc' }
            ]
        });
    }
    async hasTipoActivo(personaId, tipoPersonaCodigo) {
        const count = await this.prisma.personaTipo.count({
            where: {
                personaId,
                activo: true,
                fechaDesasignacion: null,
                tipoPersona: {
                    codigo: tipoPersonaCodigo
                }
            }
        });
        return count > 0;
    }
    async countTiposActivos(personaId) {
        return this.prisma.personaTipo.count({
            where: {
                personaId,
                activo: true,
                fechaDesasignacion: null
            }
        });
    }
    async isActiva(personaId) {
        const count = await this.countTiposActivos(personaId);
        return count > 0;
    }
}
exports.PersonaRepository = PersonaRepository;
//# sourceMappingURL=persona.repository.js.map