"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreviewCuotaService = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("@/utils/logger");
class PreviewCuotaService {
    constructor(prismaClient) {
        this.prisma = prismaClient || new client_1.PrismaClient();
    }
    async previewCuota(data) {
        try {
            logger_1.logger.info('[PREVIEW SERVICE] Generando preview de cuota', { data });
            if (!data.cuotaId) {
                throw new Error('Solo se soporta preview de cuotas existentes (cuotaId requerido)');
            }
            const cuota = await this.prisma.cuota.findUnique({
                where: { id: data.cuotaId },
                include: {
                    recibo: {
                        include: {
                            receptor: {
                                select: {
                                    id: true,
                                    nombre: true,
                                    apellido: true,
                                    email: true,
                                    telefono: true
                                }
                            }
                        }
                    },
                    categoria: true,
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
            if (!cuota) {
                throw new Error(`Cuota con ID ${data.cuotaId} no encontrada`);
            }
            let historial = [];
            if (data.incluirHistorialCambios) {
                historial = await this.prisma.historialAjusteCuota.findMany({
                    where: { cuotaId: data.cuotaId },
                    orderBy: { createdAt: 'desc' },
                    take: 10
                });
            }
            let desglose = undefined;
            if (data.incluirDetalleItems) {
                desglose = this.generarDesglose(cuota);
            }
            let explicaciones = undefined;
            if (data.incluirExplicacionDescuentos) {
                explicaciones = this.generarExplicaciones(cuota, data.formato);
            }
            const resultado = {
                cuota: this.formatearCuota(cuota, data.formato),
                desglose,
                explicaciones
            };
            if (historial.length > 0) {
                resultado.historial = historial;
            }
            logger_1.logger.info('[PREVIEW SERVICE] Preview generado exitosamente', {
                cuotaId: cuota.id,
                itemsCount: cuota.items.length
            });
            return resultado;
        }
        catch (error) {
            logger_1.logger.error('[PREVIEW SERVICE] Error al generar preview', { error, data });
            throw error;
        }
    }
    async previewCuotasSocio(data) {
        try {
            logger_1.logger.info('[PREVIEW SERVICE] Generando preview de cuotas de socio', { data });
            const socio = await this.prisma.persona.findUnique({
                where: { id: data.socioId },
                select: {
                    id: true,
                    nombre: true,
                    apellido: true,
                    email: true,
                    telefono: true
                }
            });
            if (!socio) {
                throw new Error(`Socio con ID ${data.socioId} no encontrado`);
            }
            const recibos = await this.prisma.recibo.findMany({
                where: {
                    receptorId: data.socioId
                },
                include: {
                    cuota: {
                        include: {
                            categoria: true,
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
                    }
                }
            });
            const cuotasFiltradas = recibos
                .filter(r => r.cuota !== null)
                .map(r => r.cuota)
                .filter(c => {
                if (!c)
                    return false;
                const estaEnRango = this.estaEnRangoFecha(c.mes, c.anio, data.mesDesde, data.anioDesde, data.mesHasta || data.mesDesde, data.anioHasta || data.anioDesde);
                return estaEnRango;
            });
            const montoTotal = cuotasFiltradas.reduce((sum, c) => sum + Number(c.montoTotal), 0);
            const desglosePorMes = this.calcularDesglosePorMes(cuotasFiltradas);
            const cuotasFormateadas = cuotasFiltradas.map(cuota => this.formatearCuota(cuota, data.formato));
            logger_1.logger.info('[PREVIEW SERVICE] Preview de socio generado', {
                socioId: data.socioId,
                cuotasCount: cuotasFiltradas.length
            });
            return {
                socio: {
                    id: socio.id,
                    nombre: socio.nombre,
                    apellido: socio.apellido,
                    nombreCompleto: `${socio.nombre} ${socio.apellido}`,
                    email: socio.email,
                    telefono: socio.telefono
                },
                cuotas: cuotasFormateadas,
                resumen: {
                    totalCuotas: cuotasFiltradas.length,
                    montoTotal,
                    desglosePorMes
                }
            };
        }
        catch (error) {
            logger_1.logger.error('[PREVIEW SERVICE] Error al generar preview de socio', { error, data });
            throw error;
        }
    }
    async compararCuota(data) {
        try {
            logger_1.logger.info('[PREVIEW SERVICE] Comparando cuota', { data });
            const cuotaActual = await this.prisma.cuota.findUnique({
                where: { id: data.cuotaId },
                include: {
                    recibo: {
                        include: {
                            receptor: true
                        }
                    },
                    categoria: true,
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
            if (!cuotaActual) {
                throw new Error(`Cuota con ID ${data.cuotaId} no encontrada`);
            }
            const antes = {
                montoTotal: Number(cuotaActual.montoTotal),
                items: cuotaActual.items.map(item => ({
                    tipo: item.tipoItem.nombre,
                    monto: Number(item.monto),
                    descripcion: item.concepto
                }))
            };
            const despues = data.cambiosPropuestos
                ? this.calcularCuotaConCambios(cuotaActual, data.cambiosPropuestos)
                : { ...antes, itemsModificados: 0 };
            const diferencias = {
                montoTotal: despues.montoTotal - antes.montoTotal,
                itemsModificados: despues.itemsModificados || 0
            };
            const explicacion = this.generarExplicacionComparacion(antes, despues, diferencias);
            logger_1.logger.info('[PREVIEW SERVICE] Comparación generada', {
                cuotaId: data.cuotaId,
                diferenciaMonto: diferencias.montoTotal
            });
            return {
                antes,
                despues,
                diferencias,
                explicacion
            };
        }
        catch (error) {
            logger_1.logger.error('[PREVIEW SERVICE] Error al comparar cuota', { error, data });
            throw error;
        }
    }
    estaEnRangoFecha(mes, anio, mesDesde, anioDesde, mesHasta, anioHasta) {
        const fecha = anio * 12 + mes;
        const desde = anioDesde * 12 + mesDesde;
        const hasta = anioHasta * 12 + mesHasta;
        return fecha >= desde && fecha <= hasta;
    }
    calcularDesglosePorMes(cuotas) {
        const porMes = new Map();
        cuotas.forEach(cuota => {
            const key = `${cuota.anio}-${String(cuota.mes).padStart(2, '0')}`;
            const existing = porMes.get(key) || {
                mes: cuota.mes,
                anio: cuota.anio,
                monto: 0,
                cuotas: 0
            };
            existing.monto += Number(cuota.montoTotal);
            existing.cuotas += 1;
            porMes.set(key, existing);
        });
        return Array.from(porMes.values()).sort((a, b) => {
            if (a.anio !== b.anio)
                return a.anio - b.anio;
            return a.mes - b.mes;
        });
    }
    generarDesglose(cuota) {
        const itemsDesglosados = cuota.items.map((item) => ({
            id: item.id,
            tipo: item.tipoItem.nombre,
            categoriaItem: item.tipoItem.categoriaItem.nombre,
            monto: Number(item.monto),
            cantidad: item.cantidad || 1,
            subtotal: Number(item.monto) * (item.cantidad || 1),
            descripcion: item.concepto
        }));
        const calculoDetallado = {
            subtotalItems: itemsDesglosados.reduce((sum, item) => sum + item.subtotal, 0),
            montoBase: Number(cuota.montoBase || 0),
            montoActividades: Number(cuota.montoActividades || 0),
            montoFinal: Number(cuota.montoTotal)
        };
        return {
            items: itemsDesglosados,
            calculoDetallado
        };
    }
    generarExplicaciones(cuota, formato = 'COMPLETO') {
        const explicacionesItems = [];
        if (formato === 'COMPLETO' || formato === 'RESUMIDO') {
            cuota.items.forEach((item) => {
                const monto = Number(item.monto);
                const cantidad = item.cantidad || 1;
                const subtotal = monto * cantidad;
                if (formato === 'COMPLETO') {
                    explicacionesItems.push(`${item.tipoItem.nombre}: $${monto.toFixed(2)} × ${cantidad} = $${subtotal.toFixed(2)}`);
                }
                else {
                    explicacionesItems.push(`${item.tipoItem.nombre}: $${subtotal.toFixed(2)}`);
                }
            });
        }
        const montoTotal = Number(cuota.montoTotal);
        const subtotalItems = cuota.items.reduce((sum, item) => sum + Number(item.monto) * (item.cantidad || 1), 0);
        let resumen = `Cuota de ${cuota.categoriaItem?.nombre || 'N/A'} - ${this.getNombreMes(cuota.mes)} ${cuota.anio}\n`;
        resumen += `Subtotal ítems: $${subtotalItems.toFixed(2)}\n`;
        resumen += `TOTAL: $${montoTotal.toFixed(2)}`;
        return {
            items: explicacionesItems,
            resumen
        };
    }
    formatearCuota(cuota, formato = 'COMPLETO') {
        if (formato === 'SIMPLE') {
            return {
                id: cuota.id,
                periodo: `${this.getNombreMes(cuota.mes)} ${cuota.anio}`,
                monto: Number(cuota.montoTotal),
                montoBase: Number(cuota.montoBase || 0),
                montoActividades: Number(cuota.montoActividades || 0)
            };
        }
        if (formato === 'RESUMIDO') {
            return {
                id: cuota.id,
                mes: cuota.mes,
                anio: cuota.anio,
                periodo: `${this.getNombreMes(cuota.mes)} ${cuota.anio}`,
                categoriaItem: cuota.categoriaItem?.nombre || 'N/A',
                montoBase: Number(cuota.montoBase || 0),
                montoActividades: Number(cuota.montoActividades || 0),
                montoTotal: Number(cuota.montoTotal),
                itemsCount: cuota.items?.length || 0
            };
        }
        return {
            id: cuota.id,
            mes: cuota.mes,
            anio: cuota.anio,
            periodo: `${this.getNombreMes(cuota.mes)} ${cuota.anio}`,
            socio: cuota.recibo?.receptor ? {
                id: cuota.recibo.receptor.id,
                nombre: cuota.recibo.receptor.nombre,
                apellido: cuota.recibo.receptor.apellido,
                nombreCompleto: `${cuota.recibo.receptor.nombre} ${cuota.recibo.receptor.apellido}`
            } : null,
            categoriaItem: cuota.categoriaItem ? {
                id: cuota.categoriaItem.id,
                nombre: cuota.categoriaItem.nombre,
                descripcion: cuota.categoriaItem.descripcion
            } : null,
            montoBase: Number(cuota.montoBase || 0),
            montoActividades: Number(cuota.montoActividades || 0),
            montoTotal: Number(cuota.montoTotal),
            fechaCreacion: cuota.createdAt,
            itemsCount: cuota.items?.length || 0
        };
    }
    calcularCuotaConCambios(cuotaActual, cambios) {
        let montoTotal = Number(cuotaActual.montoTotal);
        let itemsModificados = 0;
        if (cambios.nuevoDescuento !== undefined) {
            const descuento = (montoTotal * cambios.nuevoDescuento) / 100;
            montoTotal -= descuento;
            itemsModificados++;
        }
        if (cambios.nuevosAjustes && cambios.nuevosAjustes.length > 0) {
            for (const ajuste of cambios.nuevosAjustes) {
                montoTotal += Number(ajuste.monto);
                itemsModificados++;
            }
        }
        if (cambios.nuevasExenciones && cambios.nuevasExenciones.length > 0) {
            for (const exencion of cambios.nuevasExenciones) {
                const item = cuotaActual.items.find((i) => i.tipoItemId === exencion.tipoItemCuotaId);
                if (item) {
                    const montoExencion = (Number(item.monto) * exencion.porcentaje) / 100;
                    montoTotal -= montoExencion;
                    itemsModificados++;
                }
            }
        }
        return {
            montoTotal,
            itemsModificados,
            items: cuotaActual.items
        };
    }
    generarExplicacionComparacion(antes, despues, diferencias) {
        let explicacion = '';
        if (diferencias.montoTotal === 0) {
            explicacion = 'Los cambios propuestos no modifican el monto total de la cuota.';
        }
        else if (diferencias.montoTotal > 0) {
            explicacion = `Los cambios propuestos AUMENTAN la cuota en $${diferencias.montoTotal.toFixed(2)}. `;
            explicacion += `Nuevo total: $${despues.montoTotal.toFixed(2)} (antes: $${antes.montoTotal.toFixed(2)}).`;
        }
        else {
            explicacion = `Los cambios propuestos REDUCEN la cuota en $${Math.abs(diferencias.montoTotal).toFixed(2)}. `;
            explicacion += `Nuevo total: $${despues.montoTotal.toFixed(2)} (antes: $${antes.montoTotal.toFixed(2)}).`;
        }
        if (diferencias.itemsModificados > 0) {
            explicacion += ` Se modificarán ${diferencias.itemsModificados} ítem(s).`;
        }
        return explicacion;
    }
    getNombreMes(mes) {
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return meses[mes - 1] || `Mes ${mes}`;
    }
}
exports.PreviewCuotaService = PreviewCuotaService;
//# sourceMappingURL=preview-cuota.service.js.map