"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExencionCuotaRepository = void 0;
const client_1 = require("@prisma/client");
class ExencionCuotaRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data, tx) {
        const client = tx || this.prisma;
        return client.exencionCuota.create({
            data: {
                persona: { connect: { id: data.personaId } },
                tipoExencion: data.tipoExencion,
                motivoExencion: data.motivoExencion,
                estado: data.estado || 'PENDIENTE_APROBACION',
                porcentajeExencion: data.porcentajeExencion || new client_1.Prisma.Decimal(100),
                fechaInicio: data.fechaInicio,
                fechaFin: data.fechaFin,
                descripcion: data.descripcion,
                justificacion: data.justificacion,
                documentacionAdjunta: data.documentacionAdjunta,
                solicitadoPor: data.solicitadoPor,
                fechaSolicitud: data.fechaSolicitud || new Date(),
                aprobadoPor: data.aprobadoPor,
                fechaAprobacion: data.fechaAprobacion,
                observaciones: data.observaciones,
                activa: data.activa ?? true
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
        return this.prisma.exencionCuota.findUnique({
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
    async findByPersonaId(personaId, soloActivas = false) {
        const where = { personaId };
        if (soloActivas) {
            where.activa = true;
        }
        return this.prisma.exencionCuota.findMany({
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
                { estado: 'asc' },
                { fechaInicio: 'desc' }
            ]
        });
    }
    async findActiveByPersonaAndPeriodo(personaId, fecha) {
        return this.prisma.exencionCuota.findMany({
            where: {
                personaId,
                activa: true,
                estado: { in: ['APROBADA', 'VIGENTE'] },
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
            orderBy: { porcentajeExencion: 'desc' }
        });
    }
    async findAll(filters) {
        const where = {};
        if (filters?.personaId) {
            where.personaId = filters.personaId;
        }
        if (filters?.tipoExencion) {
            where.tipoExencion = filters.tipoExencion;
        }
        if (filters?.motivoExencion) {
            where.motivoExencion = filters.motivoExencion;
        }
        if (filters?.estado) {
            where.estado = filters.estado;
        }
        if (filters?.activa !== undefined) {
            where.activa = filters.activa;
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
        return this.prisma.exencionCuota.findMany({
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
                { estado: 'asc' },
                { fechaSolicitud: 'desc' }
            ]
        });
    }
    async findPendientes() {
        return this.findAll({
            estado: 'PENDIENTE_APROBACION',
            activa: true
        });
    }
    async findVigentes() {
        const now = new Date();
        return this.prisma.exencionCuota.findMany({
            where: {
                activa: true,
                estado: { in: ['APROBADA', 'VIGENTE'] },
                fechaInicio: { lte: now },
                OR: [
                    { fechaFin: null },
                    { fechaFin: { gte: now } }
                ]
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
            },
            orderBy: { fechaInicio: 'desc' }
        });
    }
    async update(id, data, tx) {
        const client = tx || this.prisma;
        return client.exencionCuota.update({
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
    async aprobar(id, aprobadoPor, observaciones, tx) {
        return this.update(id, {
            estado: 'APROBADA',
            aprobadoPor,
            fechaAprobacion: new Date(),
            observaciones
        }, tx);
    }
    async rechazar(id, motivoRechazo, tx) {
        return this.update(id, {
            estado: 'RECHAZADA',
            observaciones: motivoRechazo
        }, tx);
    }
    async revocar(id, motivoRevocacion, tx) {
        return this.update(id, {
            estado: 'REVOCADA',
            activa: false,
            observaciones: motivoRevocacion
        }, tx);
    }
    async marcarVencida(id, tx) {
        return this.update(id, {
            estado: 'VENCIDA',
            activa: false
        }, tx);
    }
    async deactivate(id, tx) {
        return this.update(id, { activa: false }, tx);
    }
    async activate(id, tx) {
        return this.update(id, { activa: true }, tx);
    }
    async delete(id, tx) {
        const client = tx || this.prisma;
        return client.exencionCuota.delete({ where: { id } });
    }
    async getStats(personaId) {
        const where = personaId ? { personaId } : {};
        const [total, exenciones] = await Promise.all([
            this.prisma.exencionCuota.count({ where }),
            this.prisma.exencionCuota.findMany({
                where,
                select: {
                    estado: true,
                    tipoExencion: true,
                    motivoExencion: true
                }
            })
        ]);
        const porEstado = {
            PENDIENTE_APROBACION: 0,
            APROBADA: 0,
            RECHAZADA: 0,
            VIGENTE: 0,
            VENCIDA: 0,
            REVOCADA: 0
        };
        const porTipo = {
            TOTAL: 0,
            PARCIAL: 0
        };
        const porMotivo = {
            BECA: 0,
            SOCIO_FUNDADOR: 0,
            SOCIO_HONORARIO: 0,
            SITUACION_ECONOMICA: 0,
            SITUACION_SALUD: 0,
            INTERCAMBIO_SERVICIOS: 0,
            PROMOCION: 0,
            FAMILIAR_DOCENTE: 0,
            OTRO: 0
        };
        exenciones.forEach(e => {
            porEstado[e.estado]++;
            porTipo[e.tipoExencion]++;
            porMotivo[e.motivoExencion]++;
        });
        return {
            total,
            porEstado,
            porTipo,
            porMotivo,
            vigentes: porEstado.VIGENTE + porEstado.APROBADA,
            pendientes: porEstado.PENDIENTE_APROBACION
        };
    }
    async updateVencidas() {
        const now = new Date();
        const result = await this.prisma.exencionCuota.updateMany({
            where: {
                estado: { in: ['APROBADA', 'VIGENTE'] },
                fechaFin: { lt: now },
                activa: true
            },
            data: {
                estado: 'VENCIDA',
                activa: false
            }
        });
        return result.count;
    }
}
exports.ExencionCuotaRepository = ExencionCuotaRepository;
//# sourceMappingURL=exencion-cuota.repository.js.map