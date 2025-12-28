"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RollbackCuotaService = void 0;
const logger_1 = require("@/utils/logger");
const database_1 = require("@/config/database");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class RollbackCuotaService {
    get prisma() {
        return database_1.prisma;
    }
    async rollbackGeneracion(data) {
        logger_1.logger.info(`[ROLLBACK] Iniciando rollback de generación ${data.mes}/${data.anio} en modo ${data.modo}`);
        const cuotasAfectadas = await this.obtenerCuotasPeriodo(data);
        if (cuotasAfectadas.length === 0) {
            logger_1.logger.warn(`[ROLLBACK] No se encontraron cuotas para el período ${data.mes}/${data.anio}`);
            return {
                modo: data.modo,
                cuotasAfectadas: 0,
                cuotasEliminables: 0,
                cuotasBloqueadas: 0,
                recibosAfectados: 0,
                itemsAfectados: 0,
                montoTotalAfectado: 0,
                advertencias: ['No se encontraron cuotas para el período especificado'],
                errores: [],
                detalleCuotas: []
            };
        }
        logger_1.logger.debug(`[ROLLBACK] ${cuotasAfectadas.length} cuotas encontradas`);
        const clasificacion = this.clasificarCuotas(cuotasAfectadas, data.opciones);
        const errores = this.validarRollback(clasificacion, data);
        if (errores.length > 0 && data.modo === 'APLICAR') {
            logger_1.logger.error(`[ROLLBACK] Errores de validación: ${errores.join(', ')}`);
            return {
                modo: data.modo,
                cuotasAfectadas: cuotasAfectadas.length,
                cuotasEliminables: clasificacion.eliminables.length,
                cuotasBloqueadas: clasificacion.bloqueadas.length,
                recibosAfectados: 0,
                itemsAfectados: 0,
                montoTotalAfectado: 0,
                advertencias: [],
                errores,
                detalleCuotas: []
            };
        }
        const advertencias = this.generarAdvertencias(clasificacion, data);
        const estadisticas = this.calcularEstadisticas(clasificacion);
        let backupPath;
        if (data.modo === 'APLICAR') {
            if (data.opciones?.crearBackup !== false) {
                backupPath = await this.crearBackup(clasificacion.eliminables, data);
                logger_1.logger.info(`[ROLLBACK] Backup creado en: ${backupPath}`);
            }
            await this.ejecutarRollback(clasificacion.eliminables, data);
            logger_1.logger.info(`[ROLLBACK] Rollback aplicado: ${clasificacion.eliminables.length} cuotas eliminadas, ` +
                `${estadisticas.recibosAfectados} recibos, ${estadisticas.itemsAfectados} ítems`);
        }
        else {
            logger_1.logger.info(`[ROLLBACK] Preview generado: ${clasificacion.eliminables.length} cuotas serían eliminadas`);
        }
        return {
            modo: data.modo,
            cuotasAfectadas: cuotasAfectadas.length,
            cuotasEliminables: clasificacion.eliminables.length,
            cuotasBloqueadas: clasificacion.bloqueadas.length,
            recibosAfectados: estadisticas.recibosAfectados,
            itemsAfectados: estadisticas.itemsAfectados,
            montoTotalAfectado: estadisticas.montoTotal,
            advertencias,
            errores,
            backupPath,
            detalleCuotas: this.generarDetalleCuotas(clasificacion)
        };
    }
    async rollbackCuota(data) {
        logger_1.logger.info(`[ROLLBACK CUOTA] Iniciando rollback de cuota ${data.cuotaId} en modo ${data.modo}`);
        const cuota = await this.prisma.cuota.findUnique({
            where: { id: data.cuotaId },
            include: {
                recibo: true,
                items: true
            }
        });
        if (!cuota) {
            return {
                modo: data.modo,
                cuotaEliminada: false,
                reciboEliminado: false,
                itemsEliminados: 0,
                advertencias: [],
                errores: ['Cuota no encontrada'],
                detalle: null
            };
        }
        const errores = [];
        const advertencias = [];
        if (cuota.recibo.estado === 'PAGADO') {
            errores.push('No se puede eliminar una cuota con recibo PAGADO');
        }
        if (cuota.recibo.mediosPago && cuota.recibo.mediosPago.length > 0) {
            errores.push('No se puede eliminar una cuota con medios de pago asociados');
        }
        if (errores.length > 0 && data.modo === 'APLICAR') {
            return {
                modo: data.modo,
                cuotaEliminada: false,
                reciboEliminado: false,
                itemsEliminados: 0,
                advertencias,
                errores,
                detalle: null
            };
        }
        if (data.modo === 'APLICAR') {
            await this.prisma.$transaction(async (tx) => {
                if (data.eliminarItemsAsociados) {
                    await tx.itemCuota.deleteMany({
                        where: { cuotaId: data.cuotaId }
                    });
                }
                await tx.historialCuota.deleteMany({
                    where: { cuotaId: data.cuotaId }
                });
                await tx.cuota.delete({
                    where: { id: data.cuotaId }
                });
                if (data.eliminarRecibo) {
                    await tx.recibo.delete({
                        where: { id: cuota.reciboId }
                    });
                }
                logger_1.logger.info(`[ROLLBACK CUOTA] Cuota ${data.cuotaId} eliminada exitosamente`);
            });
        }
        return {
            modo: data.modo,
            cuotaEliminada: data.modo === 'APLICAR',
            reciboEliminado: data.modo === 'APLICAR' && data.eliminarRecibo,
            itemsEliminados: cuota.items.length,
            advertencias,
            errores,
            detalle: {
                cuotaId: cuota.id,
                reciboId: cuota.reciboId,
                mes: cuota.mes,
                anio: cuota.anio,
                montoTotal: cuota.montoTotal,
                estado: cuota.recibo.estado
            }
        };
    }
    async validarRollback(data) {
        const cuotas = await this.obtenerCuotasPeriodo({
            mes: data.mes,
            anio: data.anio,
            categoriaIds: data.categoriaIds,
            socioIds: data.socioIds,
            modo: 'PREVIEW'
        });
        const clasificacion = this.clasificarCuotas(cuotas, {
            eliminarCuotasPendientes: true,
            eliminarCuotasPagadas: false,
            restaurarRecibos: true,
            crearBackup: true
        });
        const errores = this.validarRollback(clasificacion, { modo: 'PREVIEW' });
        const advertencias = this.generarAdvertencias(clasificacion, { modo: 'PREVIEW' });
        return {
            puedeHacerRollback: errores.length === 0,
            cuotasTotal: cuotas.length,
            cuotasEliminables: clasificacion.eliminables.length,
            cuotasBloqueadas: clasificacion.bloqueadas.length,
            advertencias,
            errores
        };
    }
    async obtenerCuotasPeriodo(data) {
        const whereConditions = {
            mes: data.mes,
            anio: data.anio
        };
        if (data.categoriaIds && data.categoriaIds.length > 0) {
            whereConditions.categoriaId = { in: data.categoriaIds };
        }
        if (data.socioIds && data.socioIds.length > 0) {
            whereConditions.recibo = {
                receptorId: { in: data.socioIds }
            };
        }
        const cuotas = await this.prisma.cuota.findMany({
            where: whereConditions,
            include: {
                recibo: {
                    include: {
                        receptor: true,
                        mediosPago: true
                    }
                },
                items: true
            }
        });
        return cuotas;
    }
    clasificarCuotas(cuotas, opciones) {
        const eliminables = [];
        const bloqueadas = [];
        for (const cuota of cuotas) {
            let puedeEliminar = false;
            if (cuota.recibo.estado === 'PENDIENTE' && opciones?.eliminarCuotasPendientes) {
                puedeEliminar = true;
            }
            if (cuota.recibo.estado === 'PAGADO' && opciones?.eliminarCuotasPagadas) {
                puedeEliminar = true;
            }
            if (cuota.recibo.mediosPago && cuota.recibo.mediosPago.length > 0) {
                puedeEliminar = false;
            }
            if (puedeEliminar) {
                eliminables.push(cuota);
            }
            else {
                bloqueadas.push(cuota);
            }
        }
        return { eliminables, bloqueadas };
    }
    validarRollback(clasificacion, data) {
        const errores = [];
        if (clasificacion.bloqueadas.length > 0 && !data.opciones?.eliminarCuotasPagadas) {
            const cuotasPagadas = clasificacion.bloqueadas.filter((c) => c.recibo.estado === 'PAGADO').length;
            if (cuotasPagadas > 0) {
                errores.push(`${cuotasPagadas} cuotas tienen recibos PAGADOS. Active 'eliminarCuotasPagadas' para forzar eliminación (NO RECOMENDADO).`);
            }
        }
        if (data.modo === 'APLICAR' && !data.confirmarRollback) {
            errores.push('Debe confirmar el rollback para aplicar.');
        }
        if (data.modo === 'APLICAR' && !data.motivo) {
            errores.push('Debe proporcionar un motivo para el rollback.');
        }
        return errores;
    }
    generarAdvertencias(clasificacion, data) {
        const advertencias = [];
        if (clasificacion.eliminables.length > 50) {
            advertencias.push(`ADVERTENCIA: Se eliminarán ${clasificacion.eliminables.length} cuotas. Esta operación es IRREVERSIBLE.`);
        }
        if (clasificacion.bloqueadas.length > 0) {
            advertencias.push(`${clasificacion.bloqueadas.length} cuotas NO serán eliminadas (tienen pagos asociados o están pagadas).`);
        }
        const montoTotal = clasificacion.eliminables.reduce((sum, c) => sum + c.montoTotal, 0);
        if (montoTotal > 100000) {
            advertencias.push(`El monto total afectado es $${montoTotal.toFixed(2)}. Verifique que sea correcto.`);
        }
        return advertencias;
    }
    calcularEstadisticas(clasificacion) {
        const recibosAfectados = clasificacion.eliminables.length;
        const itemsAfectados = clasificacion.eliminables.reduce((sum, c) => sum + c.items.length, 0);
        const montoTotal = clasificacion.eliminables.reduce((sum, c) => sum + c.montoTotal, 0);
        return {
            recibosAfectados,
            itemsAfectados,
            montoTotal
        };
    }
    async crearBackup(cuotas, data) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(process.cwd(), 'backups', 'rollback-cuotas');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        const backupPath = path.join(backupDir, `rollback-${data.mes}-${data.anio}-${timestamp}.json`);
        const backupData = {
            timestamp: new Date().toISOString(),
            periodo: { mes: data.mes, anio: data.anio },
            motivo: data.motivo,
            cuotasCount: cuotas.length,
            cuotas: cuotas.map(c => ({
                id: c.id,
                reciboId: c.reciboId,
                categoria: c.categoria,
                mes: c.mes,
                anio: c.anio,
                montoBase: c.montoBase,
                montoActividades: c.montoActividades,
                montoTotal: c.montoTotal,
                recibo: {
                    id: c.recibo.id,
                    numero: c.recibo.numero,
                    tipo: c.recibo.tipo,
                    receptorId: c.recibo.receptorId,
                    importe: c.recibo.importe,
                    estado: c.recibo.estado,
                    fechaVencimiento: c.recibo.fechaVencimiento
                },
                items: c.items
            }))
        };
        fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf-8');
        return backupPath;
    }
    async ejecutarRollback(cuotas, data) {
        await this.prisma.$transaction(async (tx) => {
            for (const cuota of cuotas) {
                await tx.itemCuota.deleteMany({
                    where: { cuotaId: cuota.id }
                });
                await tx.historialCuota.deleteMany({
                    where: { cuotaId: cuota.id }
                });
                await tx.cuota.delete({
                    where: { id: cuota.id }
                });
                if (data.opciones?.restaurarRecibos !== false) {
                    await tx.recibo.delete({
                        where: { id: cuota.reciboId }
                    });
                }
            }
            logger_1.logger.info(`[ROLLBACK TRANSACTION] ${cuotas.length} cuotas eliminadas. Motivo: ${data.motivo}`);
        });
    }
    generarDetalleCuotas(clasificacion) {
        return clasificacion.eliminables.map((c) => ({
            cuotaId: c.id,
            reciboId: c.reciboId,
            socioId: c.recibo.receptorId,
            numeroSocio: c.recibo.receptor.numeroSocio,
            nombreCompleto: `${c.recibo.receptor.nombre} ${c.recibo.receptor.apellido}`,
            mes: c.mes,
            anio: c.anio,
            montoTotal: c.montoTotal,
            estado: c.recibo.estado,
            itemsCount: c.items.length,
            puedeEliminar: true
        })).concat(clasificacion.bloqueadas.map((c) => ({
            cuotaId: c.id,
            reciboId: c.reciboId,
            socioId: c.recibo.receptorId,
            numeroSocio: c.recibo.receptor.numeroSocio,
            nombreCompleto: `${c.recibo.receptor.nombre} ${c.recibo.receptor.apellido}`,
            mes: c.mes,
            anio: c.anio,
            montoTotal: c.montoTotal,
            estado: c.recibo.estado,
            itemsCount: c.items.length,
            puedeEliminar: false,
            razonBloqueo: c.recibo.mediosPago?.length > 0
                ? 'Tiene medios de pago asociados'
                : 'Recibo pagado'
        })));
    }
}
exports.RollbackCuotaService = RollbackCuotaService;
//# sourceMappingURL=rollback-cuota.service.js.map