"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfiguracionRepository = void 0;
const configuracion_dto_1 = require("@/dto/configuracion.dto");
class ConfiguracionRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.configuracionSistema.create({
            data
        });
    }
    async findAll(query) {
        const where = {};
        if (query.tipo) {
            where.tipo = query.tipo;
        }
        if (query.search) {
            where.OR = [
                { clave: { contains: query.search, mode: 'insensitive' } },
                { descripcion: { contains: query.search, mode: 'insensitive' } }
            ];
        }
        const skip = (query.page - 1) * query.limit;
        const [data, total] = await Promise.all([
            this.prisma.configuracionSistema.findMany({
                where,
                skip,
                take: query.limit,
                orderBy: [
                    { clave: 'asc' }
                ]
            }),
            this.prisma.configuracionSistema.count({ where })
        ]);
        return { data, total };
    }
    async findById(id) {
        return this.prisma.configuracionSistema.findUnique({
            where: { id }
        });
    }
    async findByClave(clave) {
        return this.prisma.configuracionSistema.findUnique({
            where: { clave }
        });
    }
    async findByTipo(tipo) {
        return this.prisma.configuracionSistema.findMany({
            where: { tipo },
            orderBy: { clave: 'asc' }
        });
    }
    async findByCategoria(categoria) {
        return this.prisma.configuracionSistema.findMany({
            where: {
                clave: {
                    startsWith: categoria
                }
            },
            orderBy: { clave: 'asc' }
        });
    }
    async update(id, data) {
        return this.prisma.configuracionSistema.update({
            where: { id },
            data
        });
    }
    async updateByClave(clave, data) {
        return this.prisma.configuracionSistema.update({
            where: { clave },
            data
        });
    }
    async delete(id) {
        return this.prisma.configuracionSistema.delete({
            where: { id }
        });
    }
    async deleteByClave(clave) {
        return this.prisma.configuracionSistema.delete({
            where: { clave }
        });
    }
    async upsert(clave, data) {
        return this.prisma.configuracionSistema.upsert({
            where: { clave },
            create: data,
            update: {
                valor: data.valor,
                descripcion: data.descripcion,
                tipo: data.tipo
            }
        });
    }
    async bulkUpsert(configuraciones) {
        let count = 0;
        await this.prisma.$transaction(async (prisma) => {
            for (const config of configuraciones) {
                await prisma.configuracionSistema.upsert({
                    where: { clave: config.clave },
                    create: config,
                    update: {
                        valor: config.valor,
                        descripcion: config.descripcion,
                        tipo: config.tipo
                    }
                });
                count++;
            }
        });
        return count;
    }
    async getConfiguracionesPorPrefijo(prefijo) {
        return this.prisma.configuracionSistema.findMany({
            where: {
                clave: {
                    startsWith: prefijo
                }
            },
            orderBy: { clave: 'asc' }
        });
    }
    async exportarTodas() {
        return this.prisma.configuracionSistema.findMany({
            orderBy: { clave: 'asc' }
        });
    }
    async contarPorTipo() {
        const result = await this.prisma.configuracionSistema.groupBy({
            by: ['tipo'],
            _count: {
                tipo: true
            }
        });
        return result.map(item => ({
            tipo: item.tipo,
            count: item._count.tipo
        }));
    }
    async buscarPorValor(valor) {
        return this.prisma.configuracionSistema.findMany({
            where: {
                valor: {
                    contains: valor,
                    mode: 'insensitive'
                }
            },
            orderBy: { clave: 'asc' }
        });
    }
    async getConfiguracionesModificadasRecientmente(dias = 7) {
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - dias);
        return this.prisma.configuracionSistema.findMany({
            where: {
                updatedAt: {
                    gte: fechaLimite
                }
            },
            orderBy: { updatedAt: 'desc' }
        });
    }
    async validarIntegridad() {
        const todasConfiguraciones = await this.exportarTodas();
        const porTipo = await this.contarPorTipo();
        const clavesConflictivas = [];
        const valoresInvalidos = [];
        for (const config of todasConfiguraciones) {
            try {
                switch (config.tipo) {
                    case configuracion_dto_1.TipoConfiguracion.NUMBER:
                        const num = parseFloat(config.valor);
                        if (isNaN(num)) {
                            valoresInvalidos.push({
                                clave: config.clave,
                                error: 'Valor no es un número válido'
                            });
                        }
                        break;
                    case configuracion_dto_1.TipoConfiguracion.BOOLEAN:
                        if (!['true', 'false'].includes(config.valor.toLowerCase())) {
                            valoresInvalidos.push({
                                clave: config.clave,
                                error: 'Valor no es un booleano válido (true/false)'
                            });
                        }
                        break;
                    case configuracion_dto_1.TipoConfiguracion.JSON:
                        try {
                            JSON.parse(config.valor);
                        }
                        catch {
                            valoresInvalidos.push({
                                clave: config.clave,
                                error: 'Valor no es un JSON válido'
                            });
                        }
                        break;
                }
            }
            catch (error) {
                valoresInvalidos.push({
                    clave: config.clave,
                    error: `Error de validación: ${error}`
                });
            }
        }
        return {
            totalConfiguraciones: todasConfiguraciones.length,
            porTipo: porTipo.reduce((acc, item) => {
                acc[item.tipo] = item.count;
                return acc;
            }, {}),
            clavesConflictivas,
            valoresInvalidos
        };
    }
}
exports.ConfiguracionRepository = ConfiguracionRepository;
//# sourceMappingURL=configuracion.repository.js.map