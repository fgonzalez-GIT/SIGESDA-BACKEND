"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistorialAjusteCuotaRepository = void 0;
const client_1 = require("@prisma/client");
class HistorialAjusteCuotaRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data, tx) {
        const client = tx || this.prisma;
        return client.historialAjusteCuota.create({
            data: {
                persona: { connect: { id: data.personaId } },
                ...(data.ajusteId && { ajuste: { connect: { id: data.ajusteId } } }),
                ...(data.cuotaId && { cuota: { connect: { id: data.cuotaId } } }),
                accion: data.accion,
                datosPrevios: data.datosPrevios || client_1.Prisma.JsonNull,
                datosNuevos: data.datosNuevos,
                usuario: data.usuario,
                motivoCambio: data.motivoCambio
            },
            include: {
                persona: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        dni: true
                    }
                },
                ajuste: {
                    select: {
                        id: true,
                        concepto: true,
                        tipoAjuste: true
                    }
                },
                cuota: {
                    select: {
                        id: true,
                        mes: true,
                        anio: true,
                        montoTotal: true
                    }
                }
            }
        });
    }
    async findById(id) {
        return this.prisma.historialAjusteCuota.findUnique({
            where: { id },
            include: {
                persona: true,
                ajuste: true,
                cuota: {
                    include: {
                        recibo: true
                    }
                }
            }
        });
    }
    async findByAjusteId(ajusteId) {
        return this.prisma.historialAjusteCuota.findMany({
            where: { ajusteId },
            include: {
                persona: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        dni: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findByCuotaId(cuotaId) {
        return this.prisma.historialAjusteCuota.findMany({
            where: { cuotaId },
            include: {
                persona: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        dni: true
                    }
                },
                ajuste: {
                    select: {
                        id: true,
                        concepto: true,
                        tipoAjuste: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findByPersonaId(personaId, filters) {
        const where = {
            personaId
        };
        if (filters?.accion) {
            where.accion = filters.accion;
        }
        if (filters?.fechaDesde || filters?.fechaHasta) {
            where.createdAt = {};
            if (filters.fechaDesde) {
                where.createdAt.gte = filters.fechaDesde;
            }
            if (filters.fechaHasta) {
                where.createdAt.lte = filters.fechaHasta;
            }
        }
        return this.prisma.historialAjusteCuota.findMany({
            where,
            include: {
                persona: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        dni: true
                    }
                },
                ajuste: {
                    select: {
                        id: true,
                        concepto: true,
                        tipoAjuste: true
                    }
                },
                cuota: {
                    select: {
                        id: true,
                        mes: true,
                        anio: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: filters?.limit
        });
    }
    async findAll(filters) {
        const where = {};
        if (filters?.accion) {
            where.accion = filters.accion;
        }
        if (filters?.personaId) {
            where.personaId = filters.personaId;
        }
        if (filters?.cuotaId) {
            where.cuotaId = filters.cuotaId;
        }
        if (filters?.ajusteId) {
            where.ajusteId = filters.ajusteId;
        }
        if (filters?.fechaDesde || filters?.fechaHasta) {
            where.createdAt = {};
            if (filters.fechaDesde) {
                where.createdAt.gte = filters.fechaDesde;
            }
            if (filters.fechaHasta) {
                where.createdAt.lte = filters.fechaHasta;
            }
        }
        const [data, total] = await Promise.all([
            this.prisma.historialAjusteCuota.findMany({
                where,
                include: {
                    persona: {
                        select: {
                            id: true,
                            nombre: true,
                            apellido: true,
                            dni: true
                        }
                    },
                    ajuste: {
                        select: {
                            id: true,
                            concepto: true,
                            tipoAjuste: true
                        }
                    },
                    cuota: {
                        select: {
                            id: true,
                            mes: true,
                            anio: true,
                            montoTotal: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: filters?.limit,
                skip: filters?.offset
            }),
            this.prisma.historialAjusteCuota.count({ where })
        ]);
        return { data, total };
    }
    async getStats(filters) {
        const where = {};
        if (filters?.personaId) {
            where.personaId = filters.personaId;
        }
        if (filters?.fechaDesde || filters?.fechaHasta) {
            where.createdAt = {};
            if (filters.fechaDesde) {
                where.createdAt.gte = filters.fechaDesde;
            }
            if (filters.fechaHasta) {
                where.createdAt.lte = filters.fechaHasta;
            }
        }
        const [total, historial, ultimo] = await Promise.all([
            this.prisma.historialAjusteCuota.count({ where }),
            this.prisma.historialAjusteCuota.findMany({
                where,
                select: { accion: true }
            }),
            this.prisma.historialAjusteCuota.findFirst({
                where,
                select: { createdAt: true },
                orderBy: { createdAt: 'desc' }
            })
        ]);
        const porAccion = {
            CREAR_AJUSTE: 0,
            MODIFICAR_AJUSTE: 0,
            ELIMINAR_AJUSTE: 0,
            APLICAR_AJUSTE_MANUAL: 0,
            RECALCULAR_CUOTA: 0,
            REGENERAR_CUOTA: 0,
            CREAR_EXENCION: 0,
            MODIFICAR_EXENCION: 0,
            ELIMINAR_EXENCION: 0,
            APLICAR_EXENCION: 0
        };
        historial.forEach(h => {
            porAccion[h.accion]++;
        });
        return {
            total,
            porAccion,
            ultimaModificacion: ultimo?.createdAt
        };
    }
    async deleteOlderThan(date) {
        const result = await this.prisma.historialAjusteCuota.deleteMany({
            where: {
                createdAt: { lt: date }
            }
        });
        return result.count;
    }
}
exports.HistorialAjusteCuotaRepository = HistorialAjusteCuotaRepository;
//# sourceMappingURL=historial-ajuste-cuota.repository.js.map