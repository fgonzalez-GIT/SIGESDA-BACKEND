"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AjusteCuotaRepository = void 0;
const client_1 = require("@prisma/client");
class AjusteCuotaRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data, tx) {
        const client = tx || this.prisma;
        return client.ajusteCuotaSocio.create({
            data: {
                persona: { connect: { id: data.personaId } },
                tipoAjuste: data.tipoAjuste,
                valor: new client_1.Prisma.Decimal(data.valor),
                concepto: data.concepto,
                fechaInicio: data.fechaInicio,
                fechaFin: data.fechaFin,
                activo: data.activo ?? true,
                motivo: data.motivo,
                observaciones: data.observaciones,
                aplicaA: data.aplicaA ?? 'TODOS_ITEMS',
                itemsAfectados: data.itemsAfectados,
                aprobadoPor: data.aprobadoPor
            },
            include: {
                persona: {
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
    async findById(id) {
        return this.prisma.ajusteCuotaSocio.findUnique({
            where: { id },
            include: {
                persona: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        dni: true,
                        numeroSocio: true
                    }
                },
                historial: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            }
        });
    }
    async findByPersonaId(personaId, soloActivos = false) {
        const where = {
            personaId
        };
        if (soloActivos) {
            where.activo = true;
        }
        return this.prisma.ajusteCuotaSocio.findMany({
            where,
            include: {
                persona: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        dni: true,
                        numeroSocio: true
                    }
                }
            },
            orderBy: [
                { activo: 'desc' },
                { createdAt: 'desc' }
            ]
        });
    }
    async findActiveByPersonaAndPeriodo(personaId, fecha) {
        return this.prisma.ajusteCuotaSocio.findMany({
            where: {
                personaId,
                activo: true,
                fechaInicio: { lte: fecha },
                OR: [
                    { fechaFin: null },
                    { fechaFin: { gte: fecha } }
                ]
            },
            include: {
                persona: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });
    }
    async findAll(filters) {
        const where = {};
        if (filters?.personaId) {
            where.personaId = filters.personaId;
        }
        if (filters?.tipoAjuste) {
            where.tipoAjuste = filters.tipoAjuste;
        }
        if (filters?.activo !== undefined) {
            where.activo = filters.activo;
        }
        if (filters?.aplicaA) {
            where.aplicaA = filters.aplicaA;
        }
        if (filters?.fechaDesde) {
            where.fechaInicio = { gte: filters.fechaDesde };
        }
        if (filters?.fechaHasta) {
            where.OR = [
                { fechaFin: null },
                { fechaFin: { lte: filters.fechaHasta } }
            ];
        }
        return this.prisma.ajusteCuotaSocio.findMany({
            where,
            include: {
                persona: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        dni: true,
                        numeroSocio: true
                    }
                }
            },
            orderBy: [
                { activo: 'desc' },
                { createdAt: 'desc' }
            ]
        });
    }
    async update(id, data, tx) {
        const client = tx || this.prisma;
        return client.ajusteCuotaSocio.update({
            where: { id },
            data,
            include: {
                persona: {
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
    async deactivate(id, tx) {
        return this.update(id, { activo: false }, tx);
    }
    async activate(id, tx) {
        return this.update(id, { activo: true }, tx);
    }
    async delete(id, tx) {
        const client = tx || this.prisma;
        return client.ajusteCuotaSocio.delete({
            where: { id }
        });
    }
    async getStats(personaId) {
        const where = personaId ? { personaId } : {};
        const [total, activos, ajustes] = await Promise.all([
            this.prisma.ajusteCuotaSocio.count({ where }),
            this.prisma.ajusteCuotaSocio.count({ where: { ...where, activo: true } }),
            this.prisma.ajusteCuotaSocio.findMany({ where, select: { tipoAjuste: true, aplicaA: true } })
        ]);
        const porTipo = {
            DESCUENTO_FIJO: 0,
            DESCUENTO_PORCENTAJE: 0,
            RECARGO_FIJO: 0,
            RECARGO_PORCENTAJE: 0,
            MONTO_FIJO_TOTAL: 0
        };
        const porScope = {
            TODOS_ITEMS: 0,
            SOLO_BASE: 0,
            SOLO_ACTIVIDADES: 0,
            ITEMS_ESPECIFICOS: 0
        };
        ajustes.forEach(ajuste => {
            porTipo[ajuste.tipoAjuste]++;
            porScope[ajuste.aplicaA]++;
        });
        return { total, activos, porTipo, porScope };
    }
}
exports.AjusteCuotaRepository = AjusteCuotaRepository;
//# sourceMappingURL=ajuste-cuota.repository.js.map