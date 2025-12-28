"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CuotaBatchService = void 0;
const client_1 = require("@prisma/client");
const database_1 = require("@/config/database");
const logger_1 = require("@/utils/logger");
const date_helper_1 = require("@/utils/date.helper");
const categoria_helper_1 = require("@/utils/categoria.helper");
class CuotaBatchService {
    async generarCuotasBatch(data) {
        const startTime = Date.now();
        let queriesCount = 0;
        const errors = [];
        logger_1.logger.info(`[BATCH] Iniciando generación optimizada de cuotas - ${data.mes}/${data.anio}`);
        const sociosPorGenerar = await this._getSociosPorGenerar(data.mes, data.anio, data.categorias);
        queriesCount++;
        if (sociosPorGenerar.length === 0) {
            return {
                generated: 0,
                errors: ['No hay socios pendientes para generar cuotas en este período'],
                cuotas: [],
                performance: {
                    sociosProcesados: 0,
                    tiempoTotal: Date.now() - startTime,
                    queriesEjecutados: queriesCount
                }
            };
        }
        logger_1.logger.info(`[BATCH] ${sociosPorGenerar.length} socios por procesar`);
        const categoriaIds = [...new Set(sociosPorGenerar
                .map(s => s.tipos[0]?.categoriaId)
                .filter((id) => id !== null && id !== undefined))];
        const categorias = await database_1.prisma.categoriaSocio.findMany({
            where: { id: { in: categoriaIds } }
        });
        queriesCount++;
        const categoriasMap = new Map(categorias.map(c => [c.id, c]));
        const montosPorCategoria = new Map();
        for (const categoria of categorias) {
            montosPorCategoria.set(categoria.id, parseFloat(categoria.montoCuota.toString()));
        }
        const personaIds = sociosPorGenerar.map(s => s.id);
        const participaciones = await database_1.prisma.participacion_actividades.findMany({
            where: {
                personaId: { in: personaIds },
                activa: true
            },
            include: {
                actividades: true
            }
        });
        queriesCount++;
        const participacionesPorPersona = new Map();
        for (const participacion of participaciones) {
            if (!participacionesPorPersona.has(participacion.personaId)) {
                participacionesPorPersona.set(participacion.personaId, []);
            }
            participacionesPorPersona.get(participacion.personaId).push(participacion);
        }
        const recibosData = [];
        const sociosInfo = [];
        for (const socio of sociosPorGenerar) {
            try {
                const categoriaId = socio.tipos[0]?.categoriaId;
                if (!categoriaId) {
                    logger_1.logger.warn(`[BATCH] Socio ${socio.id} sin categoría, omitiendo`);
                    continue;
                }
                const montoBase = montosPorCategoria.get(categoriaId) || 0;
                const participacionesSocio = participacionesPorPersona.get(socio.id) || [];
                let montoActividades = 0;
                for (const participacion of participacionesSocio) {
                    const precioActividad = participacion.precioEspecial
                        ? parseFloat(participacion.precioEspecial.toString())
                        : parseFloat(participacion.actividades.precio.toString());
                    montoActividades += precioActividad;
                }
                const montoTotal = montoBase + montoActividades;
                const categoria = categoriasMap.get(categoriaId);
                recibosData.push({
                    tipo: client_1.TipoRecibo.CUOTA,
                    receptorId: socio.id,
                    importe: new client_1.Prisma.Decimal(montoTotal),
                    concepto: `Cuota ${(0, date_helper_1.getNombreMes)(data.mes)} ${data.anio} - ${categoria?.nombre || 'N/A'}`,
                    fechaVencimiento: (0, date_helper_1.calcularFechaVencimiento)(data.mes, data.anio),
                    observaciones: data.observaciones || null,
                    fecha: new Date()
                });
                sociosInfo.push({
                    socioId: socio.id,
                    categoriaId,
                    montoBase,
                    montoActividades,
                    montoTotal
                });
            }
            catch (error) {
                const errorMsg = `Error preparando datos para ${socio.nombre} ${socio.apellido}: ${error}`;
                errors.push(errorMsg);
                logger_1.logger.error(`[BATCH] ${errorMsg}`);
            }
        }
        logger_1.logger.info(`[BATCH] Preparados ${recibosData.length} recibos y ${sociosInfo.length} socios info para inserción`);
        if (recibosData.length === 0) {
            logger_1.logger.warn('[BATCH] No hay recibos para procesar');
            return {
                generated: 0,
                errors: errors.length > 0 ? errors : ['No hay datos para procesar'],
                cuotas: [],
                performance: {
                    sociosProcesados: sociosPorGenerar.length,
                    tiempoTotal: Date.now() - startTime,
                    queriesEjecutados: queriesCount
                }
            };
        }
        let cuotasCreadas = [];
        try {
            cuotasCreadas = await database_1.prisma.$transaction(async (tx) => {
                const recibos = [];
                for (const reciboData of recibosData) {
                    const recibo = await tx.recibo.create({ data: reciboData });
                    recibos.push(recibo);
                    queriesCount++;
                }
                const cuotasData = recibos.map((recibo, index) => ({
                    reciboId: recibo.id,
                    categoriaId: sociosInfo[index].categoriaId,
                    mes: data.mes,
                    anio: data.anio,
                    montoBase: new client_1.Prisma.Decimal(sociosInfo[index].montoBase),
                    montoActividades: new client_1.Prisma.Decimal(sociosInfo[index].montoActividades),
                    montoTotal: new client_1.Prisma.Decimal(sociosInfo[index].montoTotal)
                }));
                const cuotas = await Promise.all(cuotasData.map(data => {
                    queriesCount++;
                    return tx.cuota.create({ data });
                }));
                return cuotas;
            });
            logger_1.logger.info(`[BATCH] Generación completada: ${cuotasCreadas.length} cuotas creadas`);
        }
        catch (error) {
            const errorMsg = `Error en transacción batch: ${error}`;
            errors.push(errorMsg);
            logger_1.logger.error(`[BATCH] ${errorMsg}`);
        }
        const tiempoTotal = Date.now() - startTime;
        logger_1.logger.info(`[BATCH] Performance: ${queriesCount} queries, ${tiempoTotal}ms total`);
        return {
            generated: cuotasCreadas.length,
            errors,
            cuotas: cuotasCreadas,
            performance: {
                sociosProcesados: sociosPorGenerar.length,
                tiempoTotal,
                queriesEjecutados: queriesCount
            }
        };
    }
    async _getSociosPorGenerar(mes, anio, categorias) {
        const whereClause = {
            tipos: {
                some: {
                    tipoPersona: {
                        codigo: 'SOCIO'
                    },
                    activo: true
                }
            },
            activo: true
        };
        if (categorias && categorias.length > 0) {
            const categoriaIds = await Promise.all(categorias.map(codigo => (0, categoria_helper_1.getCategoriaIdByCodigo)(codigo)));
            whereClause.tipos = {
                some: {
                    tipoPersona: { codigo: 'SOCIO' },
                    activo: true,
                    categoriaId: { in: categoriaIds.filter(id => id !== null) }
                }
            };
        }
        const sociosConCuota = await database_1.prisma.cuota.findMany({
            where: { mes, anio },
            select: { recibo: { select: { receptorId: true } } }
        });
        const sociosConCuotaIds = sociosConCuota
            .map(c => c.recibo.receptorId)
            .filter(id => id !== null);
        if (sociosConCuotaIds.length > 0) {
            whereClause.id = { notIn: sociosConCuotaIds };
        }
        return await database_1.prisma.persona.findMany({
            where: whereClause,
            include: {
                tipos: {
                    where: {
                        tipoPersona: { codigo: 'SOCIO' },
                        activo: true
                    },
                    include: {
                        categoria: true
                    }
                }
            }
        });
    }
    async updateCuotasBatch(cuotaIds, updates) {
        logger_1.logger.info(`[BATCH] Actualizando ${cuotaIds.length} cuotas en batch`);
        const updateData = {};
        if (updates.montoBase !== undefined) {
            updateData.montoBase = new client_1.Prisma.Decimal(updates.montoBase);
        }
        if (updates.montoActividades !== undefined) {
            updateData.montoActividades = new client_1.Prisma.Decimal(updates.montoActividades);
        }
        if (updates.montoTotal !== undefined) {
            updateData.montoTotal = new client_1.Prisma.Decimal(updates.montoTotal);
        }
        const result = await database_1.prisma.cuota.updateMany({
            where: { id: { in: cuotaIds } },
            data: updateData
        });
        logger_1.logger.info(`[BATCH] ${result.count} cuotas actualizadas`);
        return { updated: result.count };
    }
}
exports.CuotaBatchService = CuotaBatchService;
exports.default = new CuotaBatchService();
//# sourceMappingURL=cuota-batch.service.js.map