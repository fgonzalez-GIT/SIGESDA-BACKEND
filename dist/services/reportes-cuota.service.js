"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportesCuotaService = void 0;
const database_1 = require("@/config/database");
const logger_1 = require("@/utils/logger");
class ReportesCuotaService {
    get prisma() {
        return database_1.prisma;
    }
    async getDashboard(params) {
        const currentDate = new Date();
        const mes = params?.mes || currentDate.getMonth() + 1;
        const anio = params?.anio || currentDate.getFullYear();
        logger_1.logger.info(`[REPORTES] Generando dashboard para ${mes}/${anio}`);
        const cuotasDelPeriodo = await this.prisma.cuota.findMany({
            where: {
                mes,
                anio
            },
            include: {
                recibo: true,
                categoria: true,
                items: true
            }
        });
        const totalCuotas = cuotasDelPeriodo.length;
        const totalRecaudado = cuotasDelPeriodo
            .filter(c => c.recibo.estado === 'PAGADO')
            .reduce((sum, c) => sum + Number(c.montoTotal), 0);
        const totalPendiente = cuotasDelPeriodo
            .filter(c => c.recibo.estado === 'PENDIENTE')
            .reduce((sum, c) => sum + Number(c.montoTotal), 0);
        const totalVencido = cuotasDelPeriodo
            .filter(c => c.recibo.estado === 'VENCIDO')
            .reduce((sum, c) => sum + Number(c.montoTotal), 0);
        const cuotasPagadas = cuotasDelPeriodo.filter(c => c.recibo.estado === 'PAGADO').length;
        const cuotasPendientes = cuotasDelPeriodo.filter(c => c.recibo.estado === 'PENDIENTE').length;
        const cuotasVencidas = cuotasDelPeriodo.filter(c => c.recibo.estado === 'VENCIDO').length;
        const tasaPago = totalCuotas > 0 ? (cuotasPagadas / totalCuotas) * 100 : 0;
        const ajustesActivos = await this.prisma.ajusteCuotaSocio.count({
            where: {
                activo: true,
                OR: [
                    { fechaFin: null },
                    { fechaFin: { gte: new Date(anio, mes - 1, 1) } }
                ]
            }
        });
        const exencionesVigentes = await this.prisma.exencionCuota.count({
            where: {
                estado: 'VIGENTE',
                activa: true
            }
        });
        const porCategoria = await this.prisma.cuota.groupBy({
            by: ['categoriaId'],
            where: {
                mes,
                anio
            },
            _count: true,
            _sum: {
                montoTotal: true
            }
        });
        const categorias = await this.prisma.categoriaSocio.findMany({
            where: {
                id: { in: porCategoria.map(c => c.categoriaId) }
            }
        });
        const distribucionCategorias = porCategoria.map(cat => {
            const categoria = categorias.find(c => c.id === cat.categoriaId);
            return {
                categoriaId: cat.categoriaId,
                categoriaNombre: categoria?.nombre || 'Desconocida',
                categoriaCodigo: categoria?.codigo || 'UNKNOWN',
                cantidad: cat._count,
                montoTotal: cat._sum.montoTotal || 0
            };
        });
        return {
            periodo: {
                mes,
                anio,
                nombreMes: this.getNombreMes(mes)
            },
            metricas: {
                totalCuotas,
                cuotasPagadas,
                cuotasPendientes,
                cuotasVencidas,
                tasaPago: Math.round(tasaPago * 100) / 100,
                totalRecaudado,
                totalPendiente,
                totalVencido,
                ajustesActivos,
                exencionesVigentes
            },
            distribucionCategorias,
            generadoEn: new Date().toISOString()
        };
    }
    async getReportePorCategoria(params) {
        logger_1.logger.info(`[REPORTES] Reporte por categoría - ${params.mes}/${params.anio}`);
        const whereClause = {
            mes: params.mes,
            anio: params.anio
        };
        if (params.categoriaId) {
            whereClause.categoriaId = params.categoriaId;
        }
        const cuotas = await this.prisma.cuota.findMany({
            where: whereClause,
            include: {
                recibo: true,
                categoria: true,
                items: {
                    include: {
                        tipoItem: true
                    }
                }
            }
        });
        const categorias = new Map();
        for (const cuota of cuotas) {
            const catId = cuota.categoriaId;
            if (!categorias.has(catId)) {
                categorias.set(catId, {
                    categoriaId: catId,
                    categoriaNombre: cuota.categoria.nombre,
                    categoriaCodigo: cuota.categoria.codigo,
                    totalCuotas: 0,
                    cuotasPagadas: 0,
                    cuotasPendientes: 0,
                    cuotasVencidas: 0,
                    montoTotal: 0,
                    montoRecaudado: 0,
                    montoPendiente: 0,
                    montoVencido: 0,
                    promedioMonto: 0,
                    cuotas: []
                });
            }
            const cat = categorias.get(catId);
            cat.totalCuotas++;
            cat.montoTotal += Number(cuota.montoTotal);
            if (cuota.recibo.estado === 'PAGADO') {
                cat.cuotasPagadas++;
                cat.montoRecaudado += Number(cuota.montoTotal);
            }
            else if (cuota.recibo.estado === 'PENDIENTE') {
                cat.cuotasPendientes++;
                cat.montoPendiente += Number(cuota.montoTotal);
            }
            else if (cuota.recibo.estado === 'VENCIDO') {
                cat.cuotasVencidas++;
                cat.montoVencido += Number(cuota.montoTotal);
            }
            if (params.incluirDetalle) {
                cat.cuotas.push({
                    cuotaId: cuota.id,
                    reciboNumero: cuota.recibo.numero,
                    mes: cuota.mes,
                    anio: cuota.anio,
                    montoTotal: cuota.montoTotal,
                    estado: cuota.recibo.estado,
                    items: cuota.items.map(item => ({
                        tipoItem: item.tipoItem.nombre,
                        concepto: item.concepto,
                        monto: item.monto,
                        cantidad: item.cantidad
                    }))
                });
            }
        }
        const resultado = Array.from(categorias.values()).map(cat => ({
            ...cat,
            promedioMonto: cat.totalCuotas > 0 ? cat.montoTotal / cat.totalCuotas : 0,
            tasaPago: cat.totalCuotas > 0 ? (cat.cuotasPagadas / cat.totalCuotas) * 100 : 0
        }));
        return {
            periodo: {
                mes: params.mes,
                anio: params.anio,
                nombreMes: this.getNombreMes(params.mes)
            },
            categorias: resultado,
            resumen: {
                totalCategorias: resultado.length,
                totalCuotas: resultado.reduce((sum, c) => sum + c.totalCuotas, 0),
                montoTotal: resultado.reduce((sum, c) => sum + c.montoTotal, 0),
                montoRecaudado: resultado.reduce((sum, c) => sum + c.montoRecaudado, 0)
            },
            generadoEn: new Date().toISOString()
        };
    }
    async getAnalisisDescuentos(params) {
        logger_1.logger.info(`[REPORTES] Análisis de descuentos - ${params.mes}/${params.anio}`);
        const fechaPeriodo = new Date(params.anio, params.mes - 1, 1);
        const whereClause = {
            mes: params.mes,
            anio: params.anio
        };
        if (params.categoriaId) {
            whereClause.categoriaId = params.categoriaId;
        }
        const cuotas = await this.prisma.cuota.findMany({
            where: whereClause,
            include: {
                recibo: {
                    include: {
                        receptor: true
                    }
                }
            }
        });
        const analisis = {
            periodo: {
                mes: params.mes,
                anio: params.anio,
                nombreMes: this.getNombreMes(params.mes)
            },
            ajustesManuales: {
                total: 0,
                sociosAfectados: 0,
                montoTotalDescuento: 0,
                montoTotalRecargo: 0,
                detalle: []
            },
            reglasAutomaticas: {
                total: 0,
                sociosAfectados: 0,
                montoTotalDescuento: 0,
                detalle: []
            },
            exenciones: {
                total: 0,
                sociosAfectados: 0,
                montoTotalExento: 0,
                detalle: []
            },
            resumen: {
                totalDescuentos: 0,
                totalRecargos: 0,
                impactoNeto: 0
            }
        };
        if (params.tipoDescuento === 'ajustes' || params.tipoDescuento === 'todos') {
            const ajustes = await this.prisma.ajusteCuotaSocio.findMany({
                where: {
                    activo: true,
                    fechaInicio: { lte: fechaPeriodo },
                    OR: [
                        { fechaFin: null },
                        { fechaFin: { gte: fechaPeriodo } }
                    ]
                },
                include: {
                    persona: true
                }
            });
            analisis.ajustesManuales.total = ajustes.length;
            analisis.ajustesManuales.sociosAfectados = new Set(ajustes.map(a => a.personaId)).size;
            for (const ajuste of ajustes) {
                const valor = Number(ajuste.valor);
                if (ajuste.tipoAjuste.includes('DESCUENTO')) {
                    analisis.ajustesManuales.montoTotalDescuento += valor;
                }
                else if (ajuste.tipoAjuste.includes('RECARGO')) {
                    analisis.ajustesManuales.montoTotalRecargo += valor;
                }
                analisis.ajustesManuales.detalle.push({
                    ajusteId: ajuste.id,
                    concepto: ajuste.concepto,
                    tipoAjuste: ajuste.tipoAjuste,
                    valor,
                    personaId: ajuste.personaId,
                    personaNombre: `${ajuste.persona.nombre} ${ajuste.persona.apellido}`,
                    aplicaA: ajuste.aplicaA
                });
            }
        }
        if (params.tipoDescuento === 'reglas' || params.tipoDescuento === 'todos') {
            const aplicaciones = await this.prisma.aplicacionRegla.findMany({
                where: {
                    cuota: {
                        mes: params.mes,
                        anio: params.anio
                    }
                },
                include: {
                    regla: true,
                    cuota: {
                        include: {
                            recibo: {
                                include: {
                                    receptor: true
                                }
                            }
                        }
                    }
                }
            });
            analisis.reglasAutomaticas.total = aplicaciones.length;
            analisis.reglasAutomaticas.sociosAfectados = new Set(aplicaciones.map(a => a.cuota.recibo.receptorId)).size;
            analisis.reglasAutomaticas.montoTotalDescuento = aplicaciones.reduce((sum, a) => sum + Number(a.montoDescuento), 0);
            for (const aplicacion of aplicaciones) {
                analisis.reglasAutomaticas.detalle.push({
                    reglaId: aplicacion.reglaId,
                    reglaCodigo: aplicacion.regla.codigo,
                    reglaNombre: aplicacion.regla.nombre,
                    montoDescuento: aplicacion.montoDescuento,
                    personaId: aplicacion.cuota.recibo.receptorId,
                    personaNombre: `${aplicacion.cuota.recibo.receptor.nombre} ${aplicacion.cuota.recibo.receptor.apellido}`
                });
            }
        }
        if (params.tipoDescuento === 'exenciones' || params.tipoDescuento === 'todos') {
            const exenciones = await this.prisma.exencionCuota.findMany({
                where: {
                    estado: 'VIGENTE',
                    activa: true,
                    fechaInicio: { lte: fechaPeriodo },
                    OR: [
                        { fechaFin: null },
                        { fechaFin: { gte: fechaPeriodo } }
                    ]
                },
                include: {
                    persona: true
                }
            });
            analisis.exenciones.total = exenciones.length;
            analisis.exenciones.sociosAfectados = new Set(exenciones.map(e => e.personaId)).size;
            for (const exencion of exenciones) {
                const personaCuotas = cuotas.filter(c => c.recibo.receptorId === exencion.personaId);
                const montoExento = personaCuotas.reduce((sum, c) => {
                    return sum + (Number(c.montoTotal) * Number(exencion.porcentajeExencion)) / 100;
                }, 0);
                analisis.exenciones.montoTotalExento += montoExento;
                analisis.exenciones.detalle.push({
                    exencionId: exencion.id,
                    tipoExencion: exencion.tipoExencion,
                    motivoExencion: exencion.motivoExencion,
                    porcentaje: exencion.porcentajeExencion,
                    montoExento,
                    personaId: exencion.personaId,
                    personaNombre: `${exencion.persona.nombre} ${exencion.persona.apellido}`
                });
            }
        }
        analisis.resumen.totalDescuentos =
            analisis.ajustesManuales.montoTotalDescuento +
                analisis.reglasAutomaticas.montoTotalDescuento +
                analisis.exenciones.montoTotalExento;
        analisis.resumen.totalRecargos = analisis.ajustesManuales.montoTotalRecargo;
        analisis.resumen.impactoNeto =
            analisis.resumen.totalRecargos - analisis.resumen.totalDescuentos;
        analisis.generadoEn = new Date().toISOString();
        return analisis;
    }
    async getReporteExenciones(params) {
        logger_1.logger.info(`[REPORTES] Reporte de exenciones - Estado: ${params.estado}`);
        const whereClause = {
            activa: true
        };
        if (params.estado !== 'TODAS') {
            whereClause.estado = params.estado;
        }
        if (params.motivoExencion !== 'TODOS') {
            whereClause.motivoExencion = params.motivoExencion;
        }
        const exenciones = await this.prisma.exencionCuota.findMany({
            where: whereClause,
            include: {
                persona: {
                    include: {
                        tipos: {
                            where: { activo: true },
                            include: {
                                categoria: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        let exencionesFiltradas = exenciones;
        if (params.categoriaId) {
            exencionesFiltradas = exenciones.filter(e => e.persona.tipos.some(t => t.categoriaId === params.categoriaId));
        }
        const porEstado = exencionesFiltradas.reduce((acc, e) => {
            acc[e.estado] = (acc[e.estado] || 0) + 1;
            return acc;
        }, {});
        const porMotivo = exencionesFiltradas.reduce((acc, e) => {
            acc[e.motivoExencion] = (acc[e.motivoExencion] || 0) + 1;
            return acc;
        }, {});
        const impactoEstimado = exencionesFiltradas.reduce((sum, e) => {
            return sum + Number(e.porcentajeExencion);
        }, 0);
        const detalle = exencionesFiltradas.map(e => ({
            exencionId: e.id,
            personaId: e.personaId,
            personaNombre: `${e.persona.nombre} ${e.persona.apellido}`,
            categoria: e.persona.tipos[0]?.categoria?.nombre || 'Sin categoría',
            tipoExencion: e.tipoExencion,
            motivoExencion: e.motivoExencion,
            estado: e.estado,
            porcentajeExencion: e.porcentajeExencion,
            fechaInicio: e.fechaInicio,
            fechaFin: e.fechaFin,
            descripcion: e.descripcion,
            aprobadoPor: e.aprobadoPor,
            fechaAprobacion: e.fechaAprobacion
        }));
        return {
            filtros: {
                estado: params.estado,
                motivoExencion: params.motivoExencion,
                categoriaId: params.categoriaId
            },
            resumen: {
                totalExenciones: exencionesFiltradas.length,
                porEstado,
                porMotivo,
                impactoEstimado: `${Math.round(impactoEstimado / exencionesFiltradas.length || 0)}% promedio`
            },
            exenciones: detalle,
            generadoEn: new Date().toISOString()
        };
    }
    async getReporteComparativo(params) {
        logger_1.logger.info(`[REPORTES] Reporte comparativo - ` +
            `${params.mesInicio}/${params.anioInicio} vs ${params.mesFin}/${params.anioFin}`);
        const periodoInicio = await this.getDashboard({
            mes: params.mesInicio,
            anio: params.anioInicio
        });
        const periodoFin = await this.getDashboard({
            mes: params.mesFin,
            anio: params.anioFin
        });
        const variaciones = {
            totalCuotas: {
                inicio: periodoInicio.metricas.totalCuotas,
                fin: periodoFin.metricas.totalCuotas,
                diferencia: periodoFin.metricas.totalCuotas - periodoInicio.metricas.totalCuotas,
                porcentaje: this.calculatePercentageChange(periodoInicio.metricas.totalCuotas, periodoFin.metricas.totalCuotas)
            },
            totalRecaudado: {
                inicio: periodoInicio.metricas.totalRecaudado,
                fin: periodoFin.metricas.totalRecaudado,
                diferencia: periodoFin.metricas.totalRecaudado - periodoInicio.metricas.totalRecaudado,
                porcentaje: this.calculatePercentageChange(periodoInicio.metricas.totalRecaudado, periodoFin.metricas.totalRecaudado)
            },
            tasaPago: {
                inicio: periodoInicio.metricas.tasaPago,
                fin: periodoFin.metricas.tasaPago,
                diferencia: periodoFin.metricas.tasaPago - periodoInicio.metricas.tasaPago,
                puntos: periodoFin.metricas.tasaPago - periodoInicio.metricas.tasaPago
            }
        };
        return {
            periodoInicio: {
                mes: params.mesInicio,
                anio: params.anioInicio,
                nombreMes: this.getNombreMes(params.mesInicio),
                datos: periodoInicio.metricas
            },
            periodoFin: {
                mes: params.mesFin,
                anio: params.anioFin,
                nombreMes: this.getNombreMes(params.mesFin),
                datos: periodoFin.metricas
            },
            variaciones,
            tendencia: variaciones.totalRecaudado.porcentaje > 0 ? 'CRECIMIENTO' : 'DECRECIMIENTO',
            generadoEn: new Date().toISOString()
        };
    }
    async getEstadisticasRecaudacion(params) {
        logger_1.logger.info(`[REPORTES] Estadísticas de recaudación`);
        const whereClause = {};
        if (params?.mes) {
            whereClause.mes = params.mes;
        }
        if (params?.anio) {
            whereClause.anio = params.anio;
        }
        if (params?.categoriaId) {
            whereClause.categoriaId = params.categoriaId;
        }
        const cuotas = await this.prisma.cuota.findMany({
            where: whereClause,
            include: {
                recibo: true
            }
        });
        const totalCuotas = cuotas.length;
        const totalMonto = cuotas.reduce((sum, c) => sum + Number(c.montoTotal), 0);
        const estadoPagado = cuotas.filter(c => c.recibo.estado === 'PAGADO');
        const estadoPendiente = cuotas.filter(c => c.recibo.estado === 'PENDIENTE');
        const estadoVencido = cuotas.filter(c => c.recibo.estado === 'VENCIDO');
        const estadoCancelado = cuotas.filter(c => c.recibo.estado === 'CANCELADO');
        return {
            periodo: params?.mes && params?.anio
                ? {
                    mes: params.mes,
                    anio: params.anio,
                    nombreMes: this.getNombreMes(params.mes)
                }
                : 'TODOS',
            estadisticas: {
                totalCuotas,
                totalMonto,
                porEstado: {
                    PAGADO: {
                        cantidad: estadoPagado.length,
                        monto: estadoPagado.reduce((sum, c) => sum + Number(c.montoTotal), 0),
                        porcentaje: (estadoPagado.length / totalCuotas) * 100
                    },
                    PENDIENTE: {
                        cantidad: estadoPendiente.length,
                        monto: estadoPendiente.reduce((sum, c) => sum + Number(c.montoTotal), 0),
                        porcentaje: (estadoPendiente.length / totalCuotas) * 100
                    },
                    VENCIDO: {
                        cantidad: estadoVencido.length,
                        monto: estadoVencido.reduce((sum, c) => sum + Number(c.montoTotal), 0),
                        porcentaje: (estadoVencido.length / totalCuotas) * 100
                    },
                    CANCELADO: {
                        cantidad: estadoCancelado.length,
                        monto: estadoCancelado.reduce((sum, c) => sum + Number(c.montoTotal), 0),
                        porcentaje: (estadoCancelado.length / totalCuotas) * 100
                    }
                },
                tasaRecaudacion: totalCuotas > 0 ? (estadoPagado.length / totalCuotas) * 100 : 0,
                tasaMorosidad: totalCuotas > 0 ? (estadoVencido.length / totalCuotas) * 100 : 0
            },
            generadoEn: new Date().toISOString()
        };
    }
    getNombreMes(mes) {
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return meses[mes - 1] || 'Mes inválido';
    }
    calculatePercentageChange(old, nuevo) {
        if (old === 0)
            return nuevo > 0 ? 100 : 0;
        return ((nuevo - old) / old) * 100;
    }
}
exports.ReportesCuotaService = ReportesCuotaService;
//# sourceMappingURL=reportes-cuota.service.js.map