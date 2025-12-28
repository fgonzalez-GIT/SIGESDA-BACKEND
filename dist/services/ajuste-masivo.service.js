"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AjusteMasivoService = void 0;
const logger_1 = require("@/utils/logger");
const database_1 = require("@/config/database");
const cuota_repository_1 = require("@/repositories/cuota.repository");
const item_cuota_repository_1 = require("@/repositories/item-cuota.repository");
const historial_ajuste_cuota_repository_1 = require("@/repositories/historial-ajuste-cuota.repository");
class AjusteMasivoService {
    constructor(cuotaRepository, itemCuotaRepository, historialRepository) {
        this.cuotaRepository = cuotaRepository || new cuota_repository_1.CuotaRepository();
        this.itemCuotaRepository = itemCuotaRepository || new item_cuota_repository_1.ItemCuotaRepository();
        this.historialRepository = historialRepository || new historial_ajuste_cuota_repository_1.HistorialAjusteCuotaRepository(database_1.prisma);
    }
    get prisma() {
        return database_1.prisma;
    }
    async aplicarAjusteMasivo(data) {
        logger_1.logger.info(`[AJUSTE MASIVO] Iniciando ajuste masivo en modo ${data.modo}`);
        const cuotasAfectadas = await this.obtenerCuotasConFiltros(data.filtros);
        if (cuotasAfectadas.length === 0) {
            logger_1.logger.warn(`[AJUSTE MASIVO] No se encontraron cuotas que coincidan con los filtros`);
            return {
                modo: data.modo,
                cuotasAfectadas: 0,
                itemsModificados: 0,
                montoTotalOriginal: 0,
                montoTotalNuevo: 0,
                impactoEconomico: 0,
                advertencias: ['No se encontraron cuotas que coincidan con los filtros'],
                errores: [],
                detalleCuotas: []
            };
        }
        logger_1.logger.debug(`[AJUSTE MASIVO] ${cuotasAfectadas.length} cuotas encontradas`);
        const cuotasElegibles = this.aplicarCondiciones(cuotasAfectadas, data.condiciones);
        logger_1.logger.debug(`[AJUSTE MASIVO] ${cuotasElegibles.length} cuotas elegibles después de aplicar condiciones`);
        const resultado = await this.calcularAjustes(cuotasElegibles, data);
        const advertencias = this.generarAdvertencias(resultado, data);
        const errores = this.validarAjustes(resultado, data);
        if (errores.length > 0 && data.modo === 'APLICAR') {
            logger_1.logger.error(`[AJUSTE MASIVO] Errores de validación encontrados: ${errores.join(', ')}`);
            return {
                ...resultado,
                errores,
                advertencias
            };
        }
        if (data.modo === 'APLICAR') {
            await this.persistirAjustes(resultado, data);
            logger_1.logger.info(`[AJUSTE MASIVO] Ajustes aplicados: ${resultado.cuotasAfectadas} cuotas, ` +
                `${resultado.itemsModificados} ítems, impacto: $${resultado.impactoEconomico.toFixed(2)}`);
        }
        else {
            logger_1.logger.info(`[AJUSTE MASIVO] Preview generado: ${resultado.cuotasAfectadas} cuotas afectadas`);
        }
        return {
            ...resultado,
            advertencias,
            errores
        };
    }
    async modificarItemsMasivo(data) {
        logger_1.logger.info(`[MODIFICAR ITEMS] Iniciando modificación masiva en modo ${data.modo}`);
        const itemsAfectados = await this.obtenerItemsConFiltros(data.filtros);
        if (itemsAfectados.length === 0) {
            return {
                modo: data.modo,
                itemsAfectados: 0,
                cuotasAfectadas: 0,
                montoTotalOriginal: 0,
                montoTotalNuevo: 0,
                impactoEconomico: 0,
                advertencias: ['No se encontraron ítems que coincidan con los filtros'],
                errores: [],
                detalleItems: []
            };
        }
        logger_1.logger.debug(`[MODIFICAR ITEMS] ${itemsAfectados.length} ítems encontrados`);
        const resultado = await this.calcularModificaciones(itemsAfectados, data);
        const errores = this.validarModificaciones(resultado, data);
        const advertencias = this.generarAdvertenciasItems(resultado, data);
        if (errores.length > 0 && data.modo === 'APLICAR') {
            return {
                ...resultado,
                errores,
                advertencias
            };
        }
        if (data.modo === 'APLICAR') {
            await this.persistirModificaciones(resultado, data);
            logger_1.logger.info(`[MODIFICAR ITEMS] Modificaciones aplicadas: ${resultado.itemsAfectados} ítems`);
        }
        return {
            ...resultado,
            advertencias,
            errores
        };
    }
    async aplicarDescuentoGlobal(data) {
        logger_1.logger.info(`[DESCUENTO GLOBAL] Aplicando descuento global ${data.tipoDescuento} ${data.valor} para ${data.mes}/${data.anio}`);
        const ajusteMasivo = {
            filtros: {
                mes: data.mes,
                anio: data.anio,
                categoriaIds: data.filtros?.categoriaIds,
                socioIds: data.filtros?.socioIds
            },
            tipoAjuste: data.tipoDescuento === 'PORCENTAJE' ? 'DESCUENTO_PORCENTAJE' : 'DESCUENTO_FIJO',
            valor: data.valor,
            motivo: data.motivo,
            condiciones: {
                montoMinimo: data.filtros?.montoMinimo
            },
            modo: data.modo,
            confirmarAplicacion: data.confirmarDescuento
        };
        const resultado = await this.aplicarAjusteMasivo(ajusteMasivo);
        return {
            modo: resultado.modo,
            cuotasAfectadas: resultado.cuotasAfectadas,
            montoTotalOriginal: resultado.montoTotalOriginal,
            montoTotalNuevo: resultado.montoTotalNuevo,
            descuentoTotal: Math.abs(resultado.impactoEconomico),
            advertencias: resultado.advertencias,
            errores: resultado.errores,
            detalleCuotas: resultado.detalleCuotas
        };
    }
    async obtenerCuotasConFiltros(filtros) {
        const whereConditions = {};
        if (filtros.mes)
            whereConditions.mes = filtros.mes;
        if (filtros.anio)
            whereConditions.anio = filtros.anio;
        if (filtros.categoriaIds && filtros.categoriaIds.length > 0) {
            whereConditions.categoriaId = { in: filtros.categoriaIds };
        }
        if (filtros.estadoCuota) {
            whereConditions.recibo = {
                estado: filtros.estadoCuota
            };
        }
        if (filtros.socioIds && filtros.socioIds.length > 0) {
            whereConditions.recibo = {
                ...whereConditions.recibo,
                receptorId: { in: filtros.socioIds }
            };
        }
        const cuotas = await this.prisma.cuota.findMany({
            where: whereConditions,
            include: {
                recibo: {
                    include: {
                        receptor: true
                    }
                },
                items: {
                    include: {
                        tipoItem: {
                            include: {
                                categoriaItem: true
                            }
                        }
                    }
                }
            }
        });
        return cuotas;
    }
    aplicarCondiciones(cuotas, condiciones) {
        if (!condiciones)
            return cuotas;
        return cuotas.filter(cuota => {
            if (condiciones.montoMinimo && cuota.montoTotal < condiciones.montoMinimo) {
                return false;
            }
            if (condiciones.montoMaximo && cuota.montoTotal > condiciones.montoMaximo) {
                return false;
            }
            if (condiciones.soloConDescuentos) {
                const tieneDescuentos = cuota.items.some((item) => item.monto < 0 || item.tipoItem.categoriaItem.codigo === 'DESCUENTO');
                if (!tieneDescuentos)
                    return false;
            }
            if (condiciones.soloSinExenciones) {
                const tieneExenciones = cuota.items.some((item) => item.tipoItem.categoriaItem.codigo === 'EXENCION');
                if (tieneExenciones)
                    return false;
            }
            return true;
        });
    }
    async calcularAjustes(cuotas, data) {
        let montoTotalOriginal = 0;
        let montoTotalNuevo = 0;
        let itemsModificados = 0;
        const detalleCuotas = [];
        for (const cuota of cuotas) {
            const montoOriginal = cuota.montoTotal;
            let montoNuevo = montoOriginal;
            switch (data.tipoAjuste) {
                case 'DESCUENTO_PORCENTAJE':
                    montoNuevo = montoOriginal * (1 - data.valor / 100);
                    break;
                case 'DESCUENTO_FIJO':
                    montoNuevo = Math.max(0, montoOriginal - data.valor);
                    break;
                case 'RECARGO_PORCENTAJE':
                    montoNuevo = montoOriginal * (1 + data.valor / 100);
                    break;
                case 'RECARGO_FIJO':
                    montoNuevo = montoOriginal + data.valor;
                    break;
                case 'MONTO_FIJO_TOTAL':
                    montoNuevo = data.valor;
                    break;
            }
            montoTotalOriginal += montoOriginal;
            montoTotalNuevo += montoNuevo;
            if (montoNuevo !== montoOriginal) {
                itemsModificados++;
            }
            detalleCuotas.push({
                cuotaId: cuota.id,
                socioId: cuota.recibo.receptorId,
                numeroSocio: cuota.recibo.receptor.numeroSocio,
                nombreCompleto: `${cuota.recibo.receptor.nombre} ${cuota.recibo.receptor.apellido}`,
                mes: cuota.mes,
                anio: cuota.anio,
                montoOriginal,
                montoNuevo,
                diferencia: montoNuevo - montoOriginal,
                ajusteAplicado: data.tipoAjuste,
                valorAjuste: data.valor
            });
        }
        return {
            modo: data.modo,
            cuotasAfectadas: cuotas.length,
            itemsModificados,
            montoTotalOriginal,
            montoTotalNuevo,
            impactoEconomico: montoTotalNuevo - montoTotalOriginal,
            detalleCuotas
        };
    }
    generarAdvertencias(resultado, data) {
        const advertencias = [];
        const porcentajeImpacto = resultado.montoTotalOriginal > 0
            ? Math.abs(resultado.impactoEconomico / resultado.montoTotalOriginal) * 100
            : 0;
        if (porcentajeImpacto > 20) {
            advertencias.push(`Impacto económico significativo: ${porcentajeImpacto.toFixed(1)}% (${resultado.impactoEconomico >= 0 ? '+' : ''}$${resultado.impactoEconomico.toFixed(2)})`);
        }
        if (resultado.cuotasAfectadas > 100) {
            advertencias.push(`Se modificarán ${resultado.cuotasAfectadas} cuotas. Considere realizar en horario de baja demanda.`);
        }
        const cuotasPagadas = resultado.detalleCuotas.filter((c) => c.estadoCuota === 'PAGADO').length;
        if (cuotasPagadas > 0) {
            advertencias.push(`ATENCIÓN: ${cuotasPagadas} cuotas ya están PAGADAS. Modificarlas puede generar inconsistencias.`);
        }
        return advertencias;
    }
    validarAjustes(resultado, data) {
        const errores = [];
        const montosNegativos = resultado.detalleCuotas.filter((c) => c.montoNuevo < 0);
        if (montosNegativos.length > 0) {
            errores.push(`${montosNegativos.length} cuotas quedarían con monto negativo. Ajuste el valor del ajuste.`);
        }
        if (data.modo === 'APLICAR' && !data.confirmarAplicacion) {
            errores.push('Debe confirmar la aplicación del ajuste masivo.');
        }
        return errores;
    }
    async persistirAjustes(resultado, data) {
        await this.prisma.$transaction(async (tx) => {
            for (const detalle of resultado.detalleCuotas) {
                if (detalle.montoOriginal === detalle.montoNuevo)
                    continue;
                await tx.cuota.update({
                    where: { id: detalle.cuotaId },
                    data: {
                        montoTotal: detalle.montoNuevo
                    }
                });
                const tipoItemAjuste = await tx.tipoItemCuota.findFirst({
                    where: {
                        codigo: 'AJUSTE_MANUAL'
                    }
                });
                if (tipoItemAjuste) {
                    await tx.itemCuota.create({
                        data: {
                            cuotaId: detalle.cuotaId,
                            tipoItemId: tipoItemAjuste.id,
                            concepto: `Ajuste masivo: ${data.motivo}`,
                            monto: detalle.diferencia,
                            cantidad: 1,
                            porcentaje: null,
                            esAutomatico: false,
                            esEditable: true,
                            metadata: {
                                tipoAjuste: data.tipoAjuste,
                                valorAjuste: data.valor,
                                fechaAjuste: new Date().toISOString()
                            }
                        }
                    });
                }
                await tx.historialCuota.create({
                    data: {
                        cuotaId: detalle.cuotaId,
                        accion: 'AJUSTE_MASIVO',
                        descripcion: `Ajuste masivo aplicado: ${data.tipoAjuste} ${data.valor}. Motivo: ${data.motivo}`,
                        montoAnterior: detalle.montoOriginal,
                        montoNuevo: detalle.montoNuevo,
                        metadata: {
                            tipoAjuste: data.tipoAjuste,
                            valorAjuste: data.valor
                        }
                    }
                });
            }
        });
    }
    async obtenerItemsConFiltros(filtros) {
        const whereConditions = {};
        if (filtros.categoriaItemId) {
            whereConditions.tipoItem = {
                categoriaItemId: filtros.categoriaItemId
            };
        }
        if (filtros.tipoItemId) {
            whereConditions.tipoItemId = filtros.tipoItemId;
        }
        if (filtros.conceptoContiene) {
            whereConditions.concepto = {
                contains: filtros.conceptoContiene,
                mode: 'insensitive'
            };
        }
        if (filtros.mes || filtros.anio) {
            whereConditions.cuota = {};
            if (filtros.mes)
                whereConditions.cuota.mes = filtros.mes;
            if (filtros.anio)
                whereConditions.cuota.anio = filtros.anio;
        }
        const items = await this.prisma.itemCuota.findMany({
            where: whereConditions,
            include: {
                cuota: {
                    include: {
                        recibo: true
                    }
                },
                tipoItem: {
                    include: {
                        categoriaItem: true
                    }
                }
            }
        });
        return items;
    }
    async calcularModificaciones(items, data) {
        let montoTotalOriginal = 0;
        let montoTotalNuevo = 0;
        const cuotasAfectadasSet = new Set();
        const detalleItems = [];
        for (const item of items) {
            const montoOriginal = item.monto;
            let montoNuevo = montoOriginal;
            let conceptoNuevo = item.concepto;
            if (data.modificaciones.nuevoConcepto) {
                conceptoNuevo = data.modificaciones.nuevoConcepto;
            }
            if (data.modificaciones.nuevoMonto !== undefined) {
                montoNuevo = data.modificaciones.nuevoMonto;
            }
            if (data.modificaciones.multiplicarMonto) {
                montoNuevo = montoOriginal * data.modificaciones.multiplicarMonto;
            }
            montoTotalOriginal += montoOriginal;
            montoTotalNuevo += montoNuevo;
            cuotasAfectadasSet.add(item.cuotaId);
            detalleItems.push({
                itemId: item.id,
                cuotaId: item.cuotaId,
                conceptoOriginal: item.concepto,
                conceptoNuevo,
                montoOriginal,
                montoNuevo,
                diferencia: montoNuevo - montoOriginal
            });
        }
        return {
            modo: data.modo,
            itemsAfectados: items.length,
            cuotasAfectadas: cuotasAfectadasSet.size,
            montoTotalOriginal,
            montoTotalNuevo,
            impactoEconomico: montoTotalNuevo - montoTotalOriginal,
            detalleItems
        };
    }
    validarModificaciones(resultado, data) {
        const errores = [];
        const montosInvalidos = resultado.detalleItems.filter((item) => item.montoNuevo < 0 && item.montoOriginal >= 0);
        if (montosInvalidos.length > 0) {
            errores.push(`${montosInvalidos.length} ítems tendrían monto negativo inválido.`);
        }
        return errores;
    }
    generarAdvertenciasItems(resultado, data) {
        const advertencias = [];
        if (resultado.itemsAfectados > 500) {
            advertencias.push(`Se modificarán ${resultado.itemsAfectados} ítems en ${resultado.cuotasAfectadas} cuotas. Esto puede tardar varios minutos.`);
        }
        return advertencias;
    }
    async persistirModificaciones(resultado, data) {
        await this.prisma.$transaction(async (tx) => {
            for (const detalle of resultado.detalleItems) {
                await tx.itemCuota.update({
                    where: { id: detalle.itemId },
                    data: {
                        concepto: detalle.conceptoNuevo,
                        monto: detalle.montoNuevo
                    }
                });
                const cuota = await tx.cuota.findUnique({
                    where: { id: detalle.cuotaId },
                    include: {
                        items: true
                    }
                });
                if (cuota) {
                    const nuevoMontoTotal = cuota.items.reduce((sum, item) => sum + item.monto, 0);
                    await tx.cuota.update({
                        where: { id: detalle.cuotaId },
                        data: { montoTotal: nuevoMontoTotal }
                    });
                    await tx.historialCuota.create({
                        data: {
                            cuotaId: detalle.cuotaId,
                            accion: 'MODIFICACION_MASIVA_ITEMS',
                            descripcion: `Modificación masiva de ítems. Motivo: ${data.motivo}`,
                            montoAnterior: cuota.montoTotal,
                            montoNuevo: nuevoMontoTotal,
                            metadata: {
                                itemId: detalle.itemId,
                                modificaciones: data.modificaciones
                            }
                        }
                    });
                }
            }
        });
    }
}
exports.AjusteMasivoService = AjusteMasivoService;
//# sourceMappingURL=ajuste-masivo.service.js.map