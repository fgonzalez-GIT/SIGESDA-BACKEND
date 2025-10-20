"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FamiliarRepository = void 0;
class FamiliarRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.familiar.create({
            data,
            include: {
                socio: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        dni: true,
                        numeroSocio: true
                    }
                },
                familiar: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        dni: true,
                        numeroSocio: true
                    }
                }
            }
        });
    }
    async findAll(query) {
        const where = {};
        if (query.socioId) {
            where.socioId = query.socioId;
        }
        if (query.familiarId) {
            where.familiarId = query.familiarId;
        }
        if (query.parentesco) {
            where.parentesco = query.parentesco;
        }
        if (!query.includeInactivos) {
            where.AND = [
                {
                    socio: {
                        fechaBaja: null
                    }
                },
                {
                    familiar: {
                        fechaBaja: null
                    }
                }
            ];
        }
        const skip = (query.page - 1) * query.limit;
        const [data, total] = await Promise.all([
            this.prisma.familiar.findMany({
                where,
                skip,
                take: query.limit,
                include: {
                    socio: {
                        select: {
                            id: true,
                            nombre: true,
                            apellido: true,
                            dni: true,
                            numeroSocio: true,
                            fechaBaja: true
                        }
                    },
                    familiar: {
                        select: {
                            id: true,
                            nombre: true,
                            apellido: true,
                            dni: true,
                            numeroSocio: true,
                            fechaBaja: true
                        }
                    }
                },
                orderBy: [
                    { socio: { numeroSocio: 'asc' } },
                    { parentesco: 'asc' },
                    { familiar: { apellido: 'asc' } },
                    { familiar: { nombre: 'asc' } }
                ]
            }),
            this.prisma.familiar.count({ where })
        ]);
        return { data, total };
    }
    async findById(id) {
        return this.prisma.familiar.findUnique({
            where: { id },
            include: {
                socio: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        dni: true,
                        numeroSocio: true,
                        categoria: true,
                        fechaBaja: true
                    }
                },
                familiar: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        dni: true,
                        numeroSocio: true,
                        categoria: true,
                        fechaBaja: true
                    }
                }
            }
        });
    }
    async findBySocioId(socioId, includeInactivos = false) {
        const where = { socioId };
        if (!includeInactivos) {
            where.familiar = {
                fechaBaja: null
            };
        }
        return this.prisma.familiar.findMany({
            where,
            include: {
                familiar: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        dni: true,
                        numeroSocio: true,
                        categoria: true,
                        fechaBaja: true
                    }
                }
            },
            orderBy: [
                { parentesco: 'asc' },
                { familiar: { apellido: 'asc' } },
                { familiar: { nombre: 'asc' } }
            ]
        });
    }
    async findByFamiliarId(familiarId, includeInactivos = false) {
        const where = { familiarId };
        if (!includeInactivos) {
            where.socio = {
                fechaBaja: null
            };
        }
        return this.prisma.familiar.findMany({
            where,
            include: {
                socio: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        dni: true,
                        numeroSocio: true,
                        categoria: true,
                        fechaBaja: true
                    }
                }
            },
            orderBy: [
                { parentesco: 'asc' },
                { socio: { numeroSocio: 'asc' } }
            ]
        });
    }
    async findExistingRelation(socioId, familiarId) {
        return this.prisma.familiar.findUnique({
            where: {
                socioId_familiarId: {
                    socioId,
                    familiarId
                }
            }
        });
    }
    async update(id, data) {
        return this.prisma.familiar.update({
            where: { id },
            data,
            include: {
                socio: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        dni: true,
                        numeroSocio: true
                    }
                },
                familiar: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        dni: true,
                        numeroSocio: true
                    }
                }
            }
        });
    }
    async delete(id) {
        return this.prisma.familiar.delete({
            where: { id }
        });
    }
    async deleteBulk(ids) {
        return this.prisma.familiar.deleteMany({
            where: {
                id: {
                    in: ids
                }
            }
        });
    }
    async createBulk(familiares) {
        return this.prisma.familiar.createMany({
            data: familiares,
            skipDuplicates: true
        });
    }
    async search(searchData) {
        const { search, searchBy, parentesco, includeInactivos } = searchData;
        let searchConditions = [];
        if (searchBy === 'all' || searchBy === 'nombre') {
            searchConditions.push({ socio: { nombre: { contains: search, mode: 'insensitive' } } }, { socio: { apellido: { contains: search, mode: 'insensitive' } } }, { familiar: { nombre: { contains: search, mode: 'insensitive' } } }, { familiar: { apellido: { contains: search, mode: 'insensitive' } } });
        }
        if (searchBy === 'all' || searchBy === 'dni') {
            searchConditions.push({ socio: { dni: { contains: search } } }, { familiar: { dni: { contains: search } } });
        }
        if (searchBy === 'all' || searchBy === 'email') {
            searchConditions.push({ socio: { email: { contains: search, mode: 'insensitive' } } }, { familiar: { email: { contains: search, mode: 'insensitive' } } });
        }
        const where = {
            OR: searchConditions
        };
        if (parentesco) {
            where.parentesco = parentesco;
        }
        if (!includeInactivos) {
            where.AND = [
                { socio: { fechaBaja: null } },
                { familiar: { fechaBaja: null } }
            ];
        }
        return this.prisma.familiar.findMany({
            where,
            include: {
                socio: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        dni: true,
                        numeroSocio: true,
                        email: true,
                        fechaBaja: true
                    }
                },
                familiar: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        dni: true,
                        numeroSocio: true,
                        email: true,
                        fechaBaja: true
                    }
                }
            },
            orderBy: [
                { socio: { numeroSocio: 'asc' } },
                { parentesco: 'asc' }
            ]
        });
    }
    async getParentescoStats() {
        const stats = await this.prisma.familiar.groupBy({
            by: ['parentesco'],
            _count: {
                id: true
            },
            where: {
                AND: [
                    { socio: { fechaBaja: null } },
                    { familiar: { fechaBaja: null } }
                ]
            },
            orderBy: {
                _count: {
                    id: 'desc'
                }
            }
        });
        return stats.map(stat => ({
            parentesco: stat.parentesco,
            count: stat._count.id
        }));
    }
    async getFamilyTree(socioId) {
        const directFamily = await this.findBySocioId(socioId, false);
        const inverseFamily = await this.findByFamiliarId(socioId, false);
        return {
            socioId,
            familiaDirecta: directFamily,
            familiaInversa: inverseFamily,
            totalRelaciones: directFamily.length + inverseFamily.length
        };
    }
}
exports.FamiliarRepository = FamiliarRepository;
//# sourceMappingURL=familiar.repository.js.map