"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimuladorCuotaService = void 0;
const logger_1 = require("@/utils/logger");
const database_1 = require("@/config/database");
const persona_helper_1 = require("@/utils/persona.helper");
const date_helper_1 = require("@/utils/date.helper");
class SimuladorCuotaService {
    constructor(cuotaService, motorReglasDescuentos, ajusteService, exencionService) {
        this.cuotaService = cuotaService;
        this.motorReglasDescuentos = motorReglasDescuentos;
        this.ajusteService = ajusteService;
        this.exencionService = exencionService;
    }
    get prisma() {
        return database_1.prisma;
    }
    async simularGeneracion(data) {
        logger_1.logger.info(`[SIMULADOR] Iniciando simulación de generación para ${data.mes}/${data.anio}`);
        const sociosElegibles = await this.obtenerSociosElegibles(data);
        if (sociosElegibles.length === 0) {
            logger_1.logger.warn(`[SIMULADOR] No se encontraron socios elegibles para el período`);
            return {
                cuotasSimuladas: [],
                resumen: {
                    totalCuotas: 0,
                    montoTotal: 0,
                    montoPorCategoria: {},
                    sociosAfectados: 0,
                    descuentosAplicados: 0,
                    ajustesAplicados: 0,
                    exencionesAplicadas: 0
                },
                detalleCalculo: []
            };
        }
        logger_1.logger.debug(`[SIMULADOR] ${sociosElegibles.length} socios elegibles encontrados`);
        const cuotasSimuladas = [];
        const detalleCalculo = [];
        const resumen = {
            totalCuotas: 0,
            montoTotal: 0,
            montoPorCategoria: {},
            sociosAfectados: 0,
            descuentosAplicados: 0,
            ajustesAplicados: 0,
            exencionesAplicadas: 0
        };
        for (const socio of sociosElegibles) {
            try {
                const calculoCuota = await this.calcularCuotaSimulada({
                    socioId: socio.id,
                    categoriaId: socio.categoriaId,
                    mes: data.mes,
                    anio: data.anio,
                    aplicarDescuentos: data.aplicarDescuentos,
                    aplicarAjustes: data.aplicarAjustes,
                    aplicarExenciones: data.aplicarExenciones
                });
                const cuotaSimulada = {
                    socioId: socio.id,
                    numeroSocio: socio.numeroSocio,
                    nombreCompleto: `${socio.nombre} ${socio.apellido}`,
                    categoria: socio.categoria,
                    mes: data.mes,
                    anio: data.anio,
                    montoBase: calculoCuota.montoBase,
                    montoActividades: calculoCuota.montoActividades,
                    montoTotal: calculoCuota.montoTotal,
                    descuentosAplicados: calculoCuota.descuentos,
                    ajustesAplicados: calculoCuota.ajustes,
                    exencionesAplicadas: calculoCuota.exenciones,
                    fechaVencimiento: (0, date_helper_1.calcularFechaVencimiento)(data.mes, data.anio),
                    concepto: `Cuota ${(0, date_helper_1.getNombreMes)(data.mes)} ${data.anio} - ${socio.categoria}`,
                    detalleCalculo: calculoCuota.detalle
                };
                cuotasSimuladas.push(cuotaSimulada);
                resumen.totalCuotas++;
                resumen.montoTotal += calculoCuota.montoTotal;
                resumen.sociosAfectados++;
                if (!resumen.montoPorCategoria[socio.categoria]) {
                    resumen.montoPorCategoria[socio.categoria] = 0;
                }
                resumen.montoPorCategoria[socio.categoria] += calculoCuota.montoTotal;
                if (calculoCuota.descuentos > 0)
                    resumen.descuentosAplicados++;
                if (calculoCuota.ajustes.length > 0)
                    resumen.ajustesAplicados++;
                if (calculoCuota.exenciones.length > 0)
                    resumen.exencionesAplicadas++;
                detalleCalculo.push({
                    socioId: socio.id,
                    numeroSocio: socio.numeroSocio,
                    pasos: calculoCuota.detalle
                });
            }
            catch (error) {
                logger_1.logger.error(`[SIMULADOR] Error simulando cuota para socio ${socio.numeroSocio}: ${error}`);
            }
        }
        logger_1.logger.info(`[SIMULADOR] Simulación completada: ${resumen.totalCuotas} cuotas, ` +
            `monto total: $${resumen.montoTotal.toFixed(2)}`);
        return {
            cuotasSimuladas,
            resumen,
            detalleCalculo
        };
    }
    async simularReglaDescuento(data) {
        logger_1.logger.info(`[SIMULADOR] Simulando impacto de reglas de descuento para ${data.mes}/${data.anio}`);
        const impactoActual = await this.simularGeneracion({
            mes: data.mes,
            anio: data.anio,
            socioIds: data.socioIds,
            categoriaIds: data.categoriaIds,
            aplicarDescuentos: true,
            aplicarAjustes: false,
            aplicarExenciones: false,
            incluirInactivos: false
        });
        const reglasTemporales = [
            ...data.reglasModificadas,
            ...(data.reglasNuevas || [])
        ];
        const impactoNuevo = await this.simularGeneracionConReglas({
            mes: data.mes,
            anio: data.anio,
            socioIds: data.socioIds,
            categoriaIds: data.categoriaIds,
            reglas: reglasTemporales
        });
        const diferencia = {
            montoTotal: impactoNuevo.resumen.montoTotal - impactoActual.resumen.montoTotal,
            porcentaje: impactoActual.resumen.montoTotal > 0
                ? ((impactoNuevo.resumen.montoTotal - impactoActual.resumen.montoTotal) /
                    impactoActual.resumen.montoTotal) * 100
                : 0,
            sociosAfectados: Math.abs(impactoNuevo.resumen.descuentosAplicados -
                impactoActual.resumen.descuentosAplicados)
        };
        const detalleComparacion = impactoActual.cuotasSimuladas.map((cuotaActual) => {
            const cuotaNueva = impactoNuevo.cuotasSimuladas.find((c) => c.socioId === cuotaActual.socioId);
            return {
                socioId: cuotaActual.socioId,
                numeroSocio: cuotaActual.numeroSocio,
                nombreCompleto: cuotaActual.nombreCompleto,
                montoActual: cuotaActual.montoTotal,
                montoNuevo: cuotaNueva?.montoTotal || 0,
                diferencia: (cuotaNueva?.montoTotal || 0) - cuotaActual.montoTotal,
                descuentoActual: cuotaActual.descuentosAplicados,
                descuentoNuevo: cuotaNueva?.descuentosAplicados || 0
            };
        });
        logger_1.logger.info(`[SIMULADOR] Impacto calculado: diferencia de $${diferencia.montoTotal.toFixed(2)} ` +
            `(${diferencia.porcentaje.toFixed(2)}%)`);
        return {
            impactoActual,
            impactoNuevo,
            diferencia,
            detalleComparacion
        };
    }
    async compararEscenarios(data) {
        logger_1.logger.info(`[SIMULADOR] Comparando ${data.escenarios.length} escenarios para ${data.mes}/${data.anio}`);
        const resultadosEscenarios = [];
        for (const escenario of data.escenarios) {
            const resultado = await this.simularGeneracion({
                mes: data.mes,
                anio: data.anio,
                socioIds: data.socioIds,
                categoriaIds: data.categoriaIds,
                aplicarDescuentos: escenario.aplicarDescuentos,
                aplicarAjustes: escenario.aplicarAjustes,
                aplicarExenciones: escenario.aplicarExenciones,
                incluirInactivos: false
            });
            let montoTotalAjustado = resultado.resumen.montoTotal;
            if (escenario.porcentajeDescuentoGlobal) {
                const descuento = (montoTotalAjustado * escenario.porcentajeDescuentoGlobal) / 100;
                montoTotalAjustado -= descuento;
            }
            if (escenario.montoFijoDescuento) {
                montoTotalAjustado -= escenario.montoFijoDescuento;
            }
            resultadosEscenarios.push({
                nombre: escenario.nombre,
                descripcion: escenario.descripcion,
                configuracion: escenario,
                resultado: resultado.resumen,
                montoTotalAjustado,
                cuotasSimuladas: resultado.cuotasSimuladas
            });
        }
        const montosTotal = resultadosEscenarios.map(e => e.montoTotalAjustado);
        const mayorRecaudacion = Math.max(...montosTotal);
        const menorRecaudacion = Math.min(...montosTotal);
        const mejorEscenario = resultadosEscenarios.find(e => e.montoTotalAjustado === mayorRecaudacion)?.nombre || '';
        const comparacion = {
            mejorEscenario,
            mayorRecaudacion,
            menorRecaudacion,
            diferenciaMaxima: mayorRecaudacion - menorRecaudacion
        };
        const recomendacion = this.generarRecomendacion(resultadosEscenarios, comparacion);
        logger_1.logger.info(`[SIMULADOR] Comparación completada. Mejor escenario: ${mejorEscenario} ` +
            `($${mayorRecaudacion.toFixed(2)})`);
        return {
            escenarios: resultadosEscenarios,
            comparacion,
            recomendacion
        };
    }
    async simularImpactoMasivo(data) {
        logger_1.logger.info(`[SIMULADOR] Simulando impacto masivo para ${data.mes}/${data.anio}`);
        const actual = await this.simularGeneracion({
            mes: data.mes,
            anio: data.anio,
            aplicarDescuentos: true,
            aplicarAjustes: true,
            aplicarExenciones: true,
            incluirInactivos: false
        });
        const conCambios = await this.simularGeneracionConCambios({
            mes: data.mes,
            anio: data.anio,
            cambios: data.cambios
        });
        const diferenciaTotal = conCambios.resumen.montoTotal - actual.resumen.montoTotal;
        const porcentajeCambio = actual.resumen.montoTotal > 0
            ? (diferenciaTotal / actual.resumen.montoTotal) * 100
            : 0;
        let proyeccion;
        let impactoAnual;
        if (data.incluirProyeccion && data.mesesProyeccion) {
            proyeccion = [];
            impactoAnual = 0;
            for (let i = 1; i <= data.mesesProyeccion; i++) {
                const mesProyeccion = ((data.mes + i - 1) % 12) + 1;
                const anioProyeccion = data.anio + Math.floor((data.mes + i - 1) / 12);
                const proyeccionMes = await this.simularGeneracionConCambios({
                    mes: mesProyeccion,
                    anio: anioProyeccion,
                    cambios: data.cambios
                });
                proyeccion.push({
                    mes: mesProyeccion,
                    anio: anioProyeccion,
                    montoTotal: proyeccionMes.resumen.montoTotal
                });
                impactoAnual += proyeccionMes.resumen.montoTotal;
            }
        }
        logger_1.logger.info(`[SIMULADOR] Impacto masivo calculado: $${diferenciaTotal.toFixed(2)} ` +
            `(${porcentajeCambio.toFixed(2)}%)`);
        return {
            impactoInmediato: {
                actual: actual.resumen,
                conCambios: conCambios.resumen,
                diferencia: diferenciaTotal
            },
            proyeccion,
            resumen: {
                diferenciaTotal,
                porcentajeCambio,
                sociosAfectados: actual.resumen.sociosAfectados,
                impactoAnual
            }
        };
    }
    async obtenerSociosElegibles(data) {
        const whereConditions = {};
        if (data.socioIds && data.socioIds.length > 0) {
            whereConditions.id = { in: data.socioIds };
        }
        if (data.categoriaIds && data.categoriaIds.length > 0) {
            whereConditions.categoriaId = { in: data.categoriaIds };
        }
        if (!data.incluirInactivos) {
            whereConditions.activo = true;
        }
        const socios = await this.prisma.persona.findMany({
            where: whereConditions,
            include: {
                personaTipo: {
                    where: { activo: true },
                    include: {
                        tipo: true
                    }
                },
                categoriaSocio: true
            }
        });
        const sociosValidos = socios.filter(persona => (0, persona_helper_1.hasActiveTipo)(persona, 'SOCIO'));
        return sociosValidos.map(socio => ({
            id: socio.id,
            numeroSocio: socio.numeroSocio,
            nombre: socio.nombre,
            apellido: socio.apellido,
            categoriaId: socio.categoriaId,
            categoria: socio.categoriaSocio?.codigo || 'GENERAL'
        }));
    }
    async calcularCuotaSimulada(params) {
        const resultado = await this.cuotaService.calcularMontoCuota({
            categoriaId: params.categoriaId,
            mes: params.mes,
            anio: params.anio,
            socioId: params.socioId,
            incluirActividades: true,
            aplicarDescuentos: params.aplicarDescuentos
        });
        let montoTotal = resultado.montoTotal;
        const ajustes = [];
        const exenciones = [];
        if (params.aplicarAjustes && this.ajusteService) {
            const fechaCuota = new Date(params.anio, params.mes - 1, 1);
            const ajustesActivos = await this.ajusteService.getAjustesActivosParaPeriodo(params.socioId, fechaCuota);
            if (ajustesActivos.length > 0) {
                const resultadoAjustes = this.ajusteService.calcularAjustesMultiples(ajustesActivos, montoTotal);
                montoTotal = resultadoAjustes.montoFinal;
                ajustes.push(...resultadoAjustes.ajustes);
            }
        }
        if (params.aplicarExenciones && this.exencionService) {
            const fechaCuota = new Date(params.anio, params.mes - 1, 1);
            const exencionCheck = await this.exencionService.checkExencionParaPeriodo(params.socioId, fechaCuota);
            if (exencionCheck.tieneExencion) {
                const montoExencion = (montoTotal * exencionCheck.porcentaje) / 100;
                montoTotal -= montoExencion;
                exenciones.push({
                    exencionId: exencionCheck.exencion?.id,
                    porcentaje: exencionCheck.porcentaje,
                    montoExencion
                });
            }
        }
        return {
            montoBase: resultado.montoBase,
            montoActividades: resultado.montoActividades,
            montoTotal: Math.max(0, montoTotal),
            descuentos: resultado.descuentos,
            ajustes,
            exenciones,
            detalle: resultado.detalleCalculo
        };
    }
    async simularGeneracionConReglas(params) {
        return this.simularGeneracion({
            mes: params.mes,
            anio: params.anio,
            socioIds: params.socioIds,
            categoriaIds: params.categoriaIds,
            aplicarDescuentos: true,
            aplicarAjustes: false,
            aplicarExenciones: false,
            incluirInactivos: false
        });
    }
    async simularGeneracionConCambios(params) {
        return this.simularGeneracion({
            mes: params.mes,
            anio: params.anio,
            aplicarDescuentos: true,
            aplicarAjustes: true,
            aplicarExenciones: true,
            incluirInactivos: false
        });
    }
    generarRecomendacion(escenarios, comparacion) {
        const diferencia = comparacion.diferenciaMaxima;
        const porcentaje = (diferencia / comparacion.mayorRecaudacion) * 100;
        if (porcentaje < 5) {
            return `Los escenarios son muy similares (diferencia <5%). Recomendamos ${comparacion.mejorEscenario} por recaudación máxima.`;
        }
        else if (porcentaje < 15) {
            return `Existe diferencia moderada (${porcentaje.toFixed(1)}%). Recomendamos ${comparacion.mejorEscenario}, pero considere impacto en socios.`;
        }
        else {
            return `Diferencia significativa (${porcentaje.toFixed(1)}%). Recomendamos ${comparacion.mejorEscenario}, pero evalúe impacto social antes de aplicar.`;
        }
    }
}
exports.SimuladorCuotaService = SimuladorCuotaService;
//# sourceMappingURL=simulador-cuota.service.js.map