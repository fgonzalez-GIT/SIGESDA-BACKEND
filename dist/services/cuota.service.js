"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CuotaService = void 0;
const client_1 = require("@prisma/client");
const tipo_item_cuota_repository_1 = require("@/repositories/tipo-item-cuota.repository");
const item_cuota_repository_1 = require("@/repositories/item-cuota.repository");
const logger_1 = require("@/utils/logger");
const database_1 = require("@/config/database");
const persona_helper_1 = require("@/utils/persona.helper");
const motor_reglas_descuentos_service_1 = require("./motor-reglas-descuentos.service");
const date_helper_1 = require("@/utils/date.helper");
const categoria_helper_1 = require("@/utils/categoria.helper");
const recibo_helper_1 = require("@/utils/recibo.helper");
class CuotaService {
    constructor(cuotaRepository, reciboRepository, personaRepository, configuracionRepository, ajusteService, exencionService) {
        this.cuotaRepository = cuotaRepository;
        this.reciboRepository = reciboRepository;
        this.personaRepository = personaRepository;
        this.configuracionRepository = configuracionRepository;
        this.ajusteService = ajusteService;
        this.exencionService = exencionService;
    }
    get prisma() {
        return database_1.prisma;
    }
    async createCuota(data) {
        const recibo = await this.reciboRepository.findById(data.reciboId);
        if (!recibo) {
            throw new Error(`Recibo con ID ${data.reciboId} no encontrado`);
        }
        if (recibo.tipo !== client_1.TipoRecibo.CUOTA) {
            throw new Error(`El recibo debe ser de tipo CUOTA para asociar una cuota`);
        }
        const cuotaExistente = await this.cuotaRepository.findByReciboId(data.reciboId);
        if (cuotaExistente) {
            throw new Error(`Ya existe una cuota asociada al recibo ${recibo.numero}`);
        }
        const periodoExistente = await this.cuotaRepository.checkExistePeriodo(data.mes, data.anio, data.categoria);
        if (periodoExistente) {
            logger_1.logger.warn(`Ya existen cuotas para ${data.categoria} en ${data.mes}/${data.anio}`);
        }
        const cuota = await this.cuotaRepository.create(data);
        logger_1.logger.info(`Cuota creada: ${data.categoria} ${data.mes}/${data.anio} - $${data.montoTotal} (ID: ${cuota.id})`);
        return cuota;
    }
    async getCuotas(query) {
        const result = await this.cuotaRepository.findAll(query);
        const pages = Math.ceil(result.total / query.limit);
        return {
            ...result,
            pages
        };
    }
    async exportAll(query) {
        const exportQuery = {
            ...query,
            page: 1,
            limit: 999999,
            ordenarPor: query.ordenarPor || 'fecha',
            orden: query.orden || 'desc'
        };
        const result = await this.cuotaRepository.findAll(exportQuery);
        logger_1.logger.info(`Exportadas ${result.total} cuotas con filtros aplicados`);
        return result;
    }
    async getCuotaById(id) {
        return this.cuotaRepository.findById(id);
    }
    async getCuotaByReciboId(reciboId) {
        return this.cuotaRepository.findByReciboId(reciboId);
    }
    async getCuotasPorPeriodo(mes, anio, categoria) {
        return this.cuotaRepository.findByPeriodo(mes, anio, categoria);
    }
    async getCuotasBySocio(socioId, limit) {
        const persona = await this.personaRepository.findById(socioId);
        if (!persona) {
            throw new Error(`Persona con ID ${socioId} no encontrada`);
        }
        const esSocio = await (0, persona_helper_1.hasActiveTipo)(socioId, 'SOCIO');
        if (!esSocio) {
            throw new Error(`La persona debe ser de tipo SOCIO`);
        }
        return this.cuotaRepository.findBySocio(socioId, limit);
    }
    async updateCuota(id, data) {
        const existingCuota = await this.cuotaRepository.findById(id);
        if (!existingCuota) {
            throw new Error(`Cuota con ID ${id} no encontrada`);
        }
        (0, recibo_helper_1.validateReciboPagado)(existingCuota.recibo, 'modificar');
        if (data.montoBase !== undefined || data.montoActividades !== undefined) {
            const nuevoMontoBase = data.montoBase ?? parseFloat(existingCuota.montoBase.toString());
            const nuevoMontoActividades = data.montoActividades ?? parseFloat(existingCuota.montoActividades.toString());
            data.montoTotal = nuevoMontoBase + nuevoMontoActividades;
        }
        const updatedCuota = await this.cuotaRepository.update(id, data);
        if (data.montoTotal !== undefined && data.montoTotal !== parseFloat(existingCuota.montoTotal.toString())) {
            await this.reciboRepository.update(existingCuota.reciboId, {
                importe: data.montoTotal
            });
            logger_1.logger.info(`Recibo ${existingCuota.recibo.numero} actualizado con nuevo importe: $${data.montoTotal}`);
        }
        logger_1.logger.info(`Cuota actualizada: ${existingCuota.categoria} ${existingCuota.mes}/${existingCuota.anio} (ID: ${id})`);
        return updatedCuota;
    }
    async deleteCuota(id) {
        const existingCuota = await this.cuotaRepository.findById(id);
        if (!existingCuota) {
            throw new Error(`Cuota con ID ${id} no encontrada`);
        }
        (0, recibo_helper_1.validateCanDeleteRecibo)(existingCuota.recibo);
        const deletedCuota = await this.cuotaRepository.delete(id);
        logger_1.logger.info(`Cuota eliminada: ${existingCuota.categoria} ${existingCuota.mes}/${existingCuota.anio} (ID: ${id})`);
        return deletedCuota;
    }
    async generarCuotas(data) {
        const errors = [];
        const cuotasCreadas = [];
        const sociosPorGenerar = await this.cuotaRepository.getCuotasPorGenerar(data.mes, data.anio, data.categorias);
        if (sociosPorGenerar.length === 0) {
            return {
                generated: 0,
                errors: ['No hay socios pendientes para generar cuotas en este período'],
                cuotas: []
            };
        }
        logger_1.logger.info(`Iniciando generación de cuotas para ${sociosPorGenerar.length} socios - ${data.mes}/${data.anio}`);
        for (const socio of sociosPorGenerar) {
            try {
                const montoCuota = await this.calcularMontoCuota({
                    categoria: socio.categoria,
                    mes: data.mes,
                    anio: data.anio,
                    socioId: socio.id,
                    incluirActividades: true,
                    aplicarDescuentos: data.aplicarDescuentos
                });
                const recibo = await this.reciboRepository.create({
                    tipo: client_1.TipoRecibo.CUOTA,
                    receptorId: socio.id,
                    importe: montoCuota.montoTotal,
                    concepto: `Cuota ${(0, date_helper_1.getNombreMes)(data.mes)} ${data.anio} - ${socio.categoria}`,
                    fechaVencimiento: (0, date_helper_1.calcularFechaVencimiento)(data.mes, data.anio),
                    observaciones: data.observaciones
                });
                const cuota = await this.cuotaRepository.create({
                    reciboId: recibo.id,
                    categoria: socio.categoria,
                    mes: data.mes,
                    anio: data.anio,
                    montoBase: montoCuota.montoBase,
                    montoActividades: montoCuota.montoActividades,
                    montoTotal: montoCuota.montoTotal
                });
                cuotasCreadas.push(cuota);
            }
            catch (error) {
                const errorMsg = `Error generando cuota para ${socio.nombre} ${socio.apellido} (${socio.numeroSocio}): ${error}`;
                errors.push(errorMsg);
                logger_1.logger.error(errorMsg);
            }
        }
        logger_1.logger.info(`Generación de cuotas completada: ${cuotasCreadas.length} creadas, ${errors.length} errores`);
        return {
            generated: cuotasCreadas.length,
            errors,
            cuotas: cuotasCreadas
        };
    }
    async calcularMontoCuota(data) {
        let montoBase = await this.cuotaRepository.getMontoBasePorCategoria(data.categoriaId);
        try {
            const configPrecio = await this.configuracionRepository.findByClave(`CUOTA_${data.categoriaId}`);
            if (configPrecio && configPrecio.valor) {
                montoBase = parseFloat(configPrecio.valor);
            }
        }
        catch (error) {
            logger_1.logger.warn(`No se pudo obtener configuración de precio para categoría ${data.categoriaId}, usando valor por defecto`);
        }
        let montoActividades = 0;
        let descuentos = 0;
        const detalleCalculo = {
            categoriaId: data.categoriaId,
            montoBaseCatalogo: montoBase,
            actividades: [],
            descuentosAplicados: []
        };
        if (data.incluirActividades && data.socioId) {
            try {
                const participaciones = await this.personaRepository.findById(data.socioId);
                if (participaciones) {
                    const costoActividades = await this.calcularCostoActividades(data.socioId, data.mes, data.anio);
                    montoActividades = costoActividades.total;
                    detalleCalculo.actividades = costoActividades.detalle;
                }
            }
            catch (error) {
                logger_1.logger.warn(`Error calculando actividades para socio ${data.socioId}: ${error}`);
            }
        }
        if (data.aplicarDescuentos) {
            const descuentosCalculados = await this.calcularDescuentos(data.categoriaId, montoBase, data.socioId);
            descuentos = descuentosCalculados.total;
            detalleCalculo.descuentosAplicados = descuentosCalculados.detalle;
        }
        const montoTotal = montoBase + montoActividades - descuentos;
        return {
            montoBase,
            montoActividades,
            montoTotal: Math.max(0, montoTotal),
            descuentos,
            detalleCalculo
        };
    }
    async searchCuotas(searchData) {
        return this.cuotaRepository.search(searchData);
    }
    async getStatistics(statsData) {
        return this.cuotaRepository.getStatistics(statsData);
    }
    async getVencidas() {
        return this.cuotaRepository.getVencidas();
    }
    async getPendientes() {
        return this.cuotaRepository.getPendientes();
    }
    async deleteBulkCuotas(data) {
        const cuotas = await Promise.all(data.ids.map(id => this.cuotaRepository.findById(id)));
        const invalidIds = cuotas
            .filter((cuota, index) => {
            if (!cuota)
                return true;
            if (cuota.recibo.estado === 'PAGADO')
                return true;
            if (cuota.recibo.mediosPago && cuota.recibo.mediosPago.length > 0)
                return true;
            return false;
        })
            .map((_, index) => data.ids[index]);
        if (invalidIds.length > 0) {
            throw new Error(`No se pueden eliminar las siguientes cuotas: ${invalidIds.join(', ')}`);
        }
        const result = await this.cuotaRepository.deleteBulk(data.ids);
        logger_1.logger.info(`Eliminación masiva de cuotas: ${result.count} eliminadas`);
        return result;
    }
    async recalcularCuotas(data) {
        const errors = [];
        let updated = 0;
        const cuotas = await this.cuotaRepository.findByPeriodo(data.mes, data.anio, data.categoria);
        for (const cuota of cuotas) {
            try {
                if (cuota.recibo.estado === 'PAGADO') {
                    continue;
                }
                const nuevoCalculo = await this.calcularMontoCuota({
                    categoria: cuota.categoria,
                    mes: data.mes,
                    anio: data.anio,
                    socioId: cuota.recibo.receptorId,
                    incluirActividades: true,
                    aplicarDescuentos: data.aplicarDescuentos
                });
                const montoActual = parseFloat(cuota.montoTotal.toString());
                if (Math.abs(nuevoCalculo.montoTotal - montoActual) > 0.01) {
                    await this.cuotaRepository.update(cuota.id, {
                        montoBase: nuevoCalculo.montoBase,
                        montoActividades: nuevoCalculo.montoActividades,
                        montoTotal: nuevoCalculo.montoTotal
                    });
                    if (data.actualizarRecibos) {
                        await this.reciboRepository.update(cuota.reciboId, {
                            importe: nuevoCalculo.montoTotal
                        });
                    }
                    updated++;
                }
            }
            catch (error) {
                errors.push(`Error recalculando cuota ${cuota.id}: ${error}`);
            }
        }
        logger_1.logger.info(`Recálculo de cuotas completado: ${updated} actualizadas, ${errors.length} errores`);
        return { updated, errors };
    }
    async getResumenMensual(mes, anio) {
        return this.cuotaRepository.getResumenMensual(mes, anio);
    }
    async generarReporte(data) {
        const cuotas = await this.cuotaRepository.findByPeriodo(data.mes, data.anio, data.categoria);
        const resumen = await this.cuotaRepository.getResumenMensual(data.mes, data.anio);
        const reporte = {
            periodo: {
                mes: data.mes,
                anio: data.anio,
                nombreMes: (0, date_helper_1.getNombreMes)(data.mes)
            },
            formato: data.formato,
            generadoEn: new Date().toISOString()
        };
        if (data.incluirDetalle) {
            reporte.cuotas = cuotas;
        }
        if (data.incluirEstadisticas) {
            reporte.estadisticas = resumen;
        }
        return reporte;
    }
    async calcularCostoActividades(socioId, mes, anio) {
        return {
            total: 0,
            detalle: []
        };
    }
    async calcularDescuentos(categoriaId, montoBase, socioId) {
        const descuentos = [];
        let total = 0;
        const categoria = await this.prisma.categoriaSocio.findUnique({
            where: { id: categoriaId },
            select: { codigo: true }
        });
        if (!categoria) {
            return { total: 0, detalle: [] };
        }
        if (categoria.codigo === 'ESTUDIANTE') {
            const descuento = montoBase * 0.4;
            descuentos.push({
                tipo: 'Descuento estudiante',
                porcentaje: 40,
                monto: descuento
            });
            total += descuento;
        }
        if (categoria.codigo === 'JUBILADO') {
            const descuento = montoBase * 0.25;
            descuentos.push({
                tipo: 'Descuento jubilado',
                porcentaje: 25,
                monto: descuento
            });
            total += descuento;
        }
        return { total, detalle: descuentos };
    }
    async generarCuotasConItems(data) {
        const errors = [];
        const cuotasCreadas = [];
        const tipoItemRepo = new tipo_item_cuota_repository_1.TipoItemCuotaRepository();
        const itemRepo = new item_cuota_repository_1.ItemCuotaRepository();
        const motorDescuentos = new motor_reglas_descuentos_service_1.MotorReglasDescuentos();
        logger_1.logger.info(`[GENERACIÓN CUOTAS] Iniciando generación con items - ${data.mes}/${data.anio}`);
        try {
            const sociosPorGenerar = await this.cuotaRepository.getCuotasPorGenerar(data.mes, data.anio, data.categoriaIds);
            if (sociosPorGenerar.length === 0) {
                logger_1.logger.warn('[GENERACIÓN CUOTAS] No hay socios pendientes para generar cuotas');
                return {
                    generated: 0,
                    errors: ['No hay socios pendientes para generar cuotas en este período'],
                    cuotas: []
                };
            }
            logger_1.logger.info(`[GENERACIÓN CUOTAS] ${sociosPorGenerar.length} socios a procesar`);
            const tipoCuotaBase = await tipoItemRepo.findByCodigo('CUOTA_BASE_SOCIO');
            const tipoActividad = await tipoItemRepo.findByCodigo('ACTIVIDAD_INDIVIDUAL');
            if (!tipoCuotaBase) {
                throw new Error('Tipo de ítem CUOTA_BASE_SOCIO no encontrado. Ejecutar seed: npx tsx prisma/seed-items-catalogos.ts');
            }
            if (!tipoActividad) {
                logger_1.logger.warn('[GENERACIÓN CUOTAS] Tipo de ítem ACTIVIDAD_INDIVIDUAL no encontrado. Actividades no se incluirán.');
            }
            let descuentosGlobales = {
                totalSociosConDescuento: 0,
                montoTotalDescuentos: 0,
                reglasAplicadas: {}
            };
            for (const socio of sociosPorGenerar) {
                try {
                    await this.prisma.$transaction(async (tx) => {
                        const recibo = await tx.recibo.create({
                            data: {
                                tipo: client_1.TipoRecibo.CUOTA,
                                receptorId: socio.id,
                                importe: 0,
                                concepto: `Cuota ${(0, date_helper_1.getNombreMes)(data.mes)} ${data.anio}`,
                                fechaVencimiento: (0, date_helper_1.calcularFechaVencimiento)(data.mes, data.anio),
                                observaciones: data.observaciones
                            }
                        });
                        logger_1.logger.debug(`[GENERACIÓN CUOTAS] Recibo ${recibo.numero} creado para socio ${socio.numeroSocio}`);
                        const cuota = await tx.cuota.create({
                            data: {
                                recibo: { connect: { id: recibo.id } },
                                categoria: { connect: { id: socio.categoria.id } },
                                mes: data.mes,
                                anio: data.anio,
                                montoBase: 0,
                                montoActividades: 0,
                                montoTotal: 0
                            }
                        });
                        logger_1.logger.debug(`[GENERACIÓN CUOTAS] Cuota ID ${cuota.id} creada`);
                        const montoBaseSocio = socio.categoria?.montoCuota || 0;
                        await tx.itemCuota.create({
                            data: {
                                cuotaId: cuota.id,
                                tipoItemId: tipoCuotaBase.id,
                                concepto: `Cuota base ${socio.categoria?.nombre || socio.categoria?.codigo || 'Sin categoría'}`,
                                monto: montoBaseSocio,
                                cantidad: 1,
                                esAutomatico: true,
                                esEditable: false,
                                metadata: {
                                    categoriaId: socio.categoriaId,
                                    categoriaCodigo: socio.categoria
                                }
                            }
                        });
                        logger_1.logger.debug(`[GENERACIÓN CUOTAS] Ítem base creado: $${montoBaseSocio}`);
                        let montoActividades = 0;
                        if (tipoActividad) {
                            const participaciones = await tx.participacion_actividades.findMany({
                                where: {
                                    personaId: socio.id,
                                    activa: true,
                                    actividades: {
                                        estado: {
                                            codigo: { in: ['EN_CURSO', 'PROXIMAMENTE'] }
                                        }
                                    }
                                },
                                include: {
                                    actividades: true
                                }
                            });
                            for (const participacion of participaciones) {
                                const costoActividad = participacion.precioEspecial || participacion.actividades.costo || 0;
                                await tx.itemCuota.create({
                                    data: {
                                        cuotaId: cuota.id,
                                        tipoItemId: tipoActividad.id,
                                        concepto: participacion.actividades.nombre,
                                        monto: costoActividad,
                                        cantidad: 1,
                                        esAutomatico: true,
                                        esEditable: false,
                                        metadata: {
                                            actividadId: participacion.actividadId,
                                            participacionId: participacion.id,
                                            precioEspecial: participacion.precioEspecial !== null
                                        }
                                    }
                                });
                                montoActividades += costoActividad;
                            }
                            logger_1.logger.debug(`[GENERACIÓN CUOTAS] ${participaciones.length} actividades agregadas: $${montoActividades}`);
                        }
                        if (data.aplicarDescuentos) {
                            try {
                                const itemsActuales = await tx.itemCuota.findMany({
                                    where: { cuotaId: cuota.id },
                                    include: {
                                        tipoItem: {
                                            include: {
                                                categoriaItem: true
                                            }
                                        }
                                    }
                                });
                                const resultadoDescuentos = await motorDescuentos.aplicarReglas(cuota.id, socio.id, itemsActuales);
                                if (resultadoDescuentos.itemsDescuento.length > 0) {
                                    descuentosGlobales.totalSociosConDescuento++;
                                    descuentosGlobales.montoTotalDescuentos += resultadoDescuentos.totalDescuento;
                                    resultadoDescuentos.aplicaciones.forEach((aplicacion) => {
                                        const codigo = `REGLA_${aplicacion.reglaId}`;
                                        if (!descuentosGlobales.reglasAplicadas[codigo]) {
                                            descuentosGlobales.reglasAplicadas[codigo] = 0;
                                        }
                                        descuentosGlobales.reglasAplicadas[codigo]++;
                                    });
                                }
                                logger_1.logger.debug(`[GENERACIÓN CUOTAS] Descuentos aplicados: ${resultadoDescuentos.itemsDescuento.length} ítems, ` +
                                    `total descuento: $${resultadoDescuentos.totalDescuento.toFixed(2)}`);
                            }
                            catch (errorDescuento) {
                                logger_1.logger.error(`[GENERACIÓN CUOTAS] Error aplicando descuentos para socio ${socio.numeroSocio}:`, errorDescuento instanceof Error ? errorDescuento.message : JSON.stringify(errorDescuento), errorDescuento instanceof Error ? errorDescuento.stack : '');
                            }
                        }
                        const totalItems = await tx.itemCuota.aggregate({
                            where: { cuotaId: cuota.id },
                            _sum: { monto: true }
                        });
                        const montoTotal = totalItems._sum.monto || 0;
                        await tx.cuota.update({
                            where: { id: cuota.id },
                            data: {
                                montoBase: montoBaseSocio,
                                montoActividades,
                                montoTotal
                            }
                        });
                        await tx.recibo.update({
                            where: { id: recibo.id },
                            data: { importe: montoTotal }
                        });
                        logger_1.logger.info(`[GENERACIÓN CUOTAS] ✅ Cuota generada para ${socio.nombre} ${socio.apellido} (${socio.numeroSocio}) - ` +
                            `Base: $${montoBaseSocio}, Actividades: $${montoActividades}, Total: $${montoTotal}`);
                        cuotasCreadas.push({
                            cuotaId: cuota.id,
                            reciboId: recibo.id,
                            reciboNumero: recibo.numero,
                            socioId: socio.id,
                            socioNumero: socio.numeroSocio,
                            socioNombre: `${socio.nombre} ${socio.apellido}`,
                            categoria: socio.categoria,
                            montoBase: montoBaseSocio,
                            montoActividades,
                            montoTotal,
                            descuentoAplicado: data.aplicarDescuentos
                        });
                    });
                }
                catch (error) {
                    const errorMsg = `Error generando cuota para ${socio.nombre} ${socio.apellido} (${socio.numeroSocio}): ${error.message}`;
                    errors.push(errorMsg);
                    logger_1.logger.error(`[GENERACIÓN CUOTAS] ${errorMsg}`);
                }
            }
            logger_1.logger.info(`[GENERACIÓN CUOTAS] ✅ Completada - ${cuotasCreadas.length} cuotas creadas, ${errors.length} errores`);
            if (data.aplicarDescuentos && descuentosGlobales.totalSociosConDescuento > 0) {
                logger_1.logger.info(`[GENERACIÓN CUOTAS] 📊 Descuentos aplicados: ${descuentosGlobales.totalSociosConDescuento} socios, ` +
                    `monto total: $${descuentosGlobales.montoTotalDescuentos.toFixed(2)}`);
            }
            return {
                generated: cuotasCreadas.length,
                errors,
                cuotas: cuotasCreadas,
                resumenDescuentos: data.aplicarDescuentos ? descuentosGlobales : undefined
            };
        }
        catch (error) {
            logger_1.logger.error('[GENERACIÓN CUOTAS] Error fatal en generación:', error);
            throw new Error(`Error generando cuotas: ${error.message}`);
        }
    }
    async recalcularCuota(data) {
        const cuota = await this.cuotaRepository.findById(data.cuotaId);
        if (!cuota) {
            throw new Error(`Cuota con ID ${data.cuotaId} no encontrada`);
        }
        (0, recibo_helper_1.validateReciboPagado)(cuota.recibo, 'recalcular');
        logger_1.logger.info(`[RECALCULAR CUOTA] Iniciando recálculo de cuota ID ${data.cuotaId}`);
        const montoBaseOriginal = Number(cuota.montoBase);
        const montoActividadesOriginal = Number(cuota.montoActividades);
        const montoTotalOriginal = Number(cuota.montoTotal);
        const montosCalculados = await this.calcularMontosCuota(cuota);
        const montoBase = montosCalculados.montoBase;
        const montoActividades = montosCalculados.montoActividades;
        const categoriaId = await (0, categoria_helper_1.getCategoriaIdByCodigo)(cuota.categoria, this.prisma);
        const resultado = await this.aplicarAjustesYExenciones(cuota.recibo.receptorId, cuota.mes, cuota.anio, montosCalculados.subtotal, {
            aplicarAjustes: data.aplicarAjustes,
            aplicarExenciones: data.aplicarExenciones,
            aplicarDescuentos: data.aplicarDescuentos,
            categoriaId,
            montoBase
        });
        const montoTotalRecalculado = resultado.subtotal;
        const ajustesAplicados = resultado.ajustesAplicados;
        const exencionesAplicadas = resultado.exencionesAplicadas;
        const cambiosDiferencia = {
            montoBase: {
                antes: montoBaseOriginal,
                despues: montoBase,
                diferencia: montoBase - montoBaseOriginal
            },
            montoActividades: {
                antes: montoActividadesOriginal,
                despues: montoActividades,
                diferencia: montoActividades - montoActividadesOriginal
            },
            montoTotal: {
                antes: montoTotalOriginal,
                despues: montoTotalRecalculado,
                diferencia: montoTotalRecalculado - montoTotalOriginal
            },
            ajustesAplicados,
            exencionesAplicadas
        };
        if (Math.abs(cambiosDiferencia.montoTotal.diferencia) > 0.01) {
            await this.prisma.$transaction(async (tx) => {
                await tx.cuota.update({
                    where: { id: data.cuotaId },
                    data: {
                        montoBase,
                        montoActividades,
                        montoTotal: montoTotalRecalculado
                    }
                });
                await tx.recibo.update({
                    where: { id: cuota.reciboId },
                    data: {
                        importe: montoTotalRecalculado
                    }
                });
                if (this.ajusteService) {
                    try {
                        await tx.historialAjusteCuota.create({
                            data: {
                                personaId: cuota.recibo.receptorId,
                                accion: 'RECALCULAR_CUOTA',
                                datosPrevios: {
                                    cuotaId: cuota.id,
                                    montoBase: montoBaseOriginal,
                                    montoActividades: montoActividadesOriginal,
                                    montoTotal: montoTotalOriginal
                                },
                                datosNuevos: {
                                    cuotaId: cuota.id,
                                    montoBase,
                                    montoActividades,
                                    montoTotal: montoTotalRecalculado
                                },
                                usuario: data.usuario || 'SISTEMA',
                                motivoCambio: `Recálculo automático - ${ajustesAplicados.length} ajustes, ${exencionesAplicadas.length} exenciones`
                            }
                        });
                    }
                    catch (histError) {
                        logger_1.logger.warn(`[RECALCULAR CUOTA] No se pudo crear entrada de historial: ${histError}`);
                    }
                }
            });
            logger_1.logger.info(`[RECALCULAR CUOTA] ✅ Cuota ${data.cuotaId} recalculada - ` +
                `Antes: $${montoTotalOriginal.toFixed(2)}, Después: $${montoTotalRecalculado.toFixed(2)}, ` +
                `Diferencia: $${cambiosDiferencia.montoTotal.diferencia.toFixed(2)}`);
        }
        else {
            logger_1.logger.info(`[RECALCULAR CUOTA] Sin cambios para cuota ${data.cuotaId}`);
        }
        return {
            cuotaOriginal: {
                id: cuota.id,
                montoBase: montoBaseOriginal,
                montoActividades: montoActividadesOriginal,
                montoTotal: montoTotalOriginal
            },
            cuotaRecalculada: {
                id: cuota.id,
                montoBase,
                montoActividades,
                montoTotal: montoTotalRecalculado
            },
            cambios: cambiosDiferencia
        };
    }
    async regenerarCuotas(data) {
        logger_1.logger.info(`[REGENERAR CUOTAS] Iniciando regeneración - ${data.mes}/${data.anio}`);
        const cuotasExistentes = await this.cuotaRepository.findByPeriodo(data.mes, data.anio, data.categoriaId ? await (0, categoria_helper_1.getCategoriaCodigoByCategoriaId)(data.categoriaId, this.prisma) : undefined);
        let cuotasPorEliminar = cuotasExistentes;
        if (data.personaId) {
            cuotasPorEliminar = cuotasExistentes.filter(c => c.recibo.receptorId === data.personaId);
        }
        const cuotasPagadas = cuotasPorEliminar.filter(c => c.recibo.estado === 'PAGADO');
        if (cuotasPagadas.length > 0) {
            throw new Error(`No se pueden regenerar cuotas pagadas. ${cuotasPagadas.length} cuotas del período ya están pagadas.`);
        }
        let cuotasGeneradas = [];
        const cuotasEliminadas = cuotasPorEliminar.length;
        await this.prisma.$transaction(async (tx) => {
            for (const cuota of cuotasPorEliminar) {
                await tx.cuota.delete({
                    where: { id: cuota.id }
                });
                await tx.recibo.delete({
                    where: { id: cuota.reciboId }
                });
                logger_1.logger.debug(`[REGENERAR CUOTAS] Cuota ${cuota.id} y recibo ${cuota.recibo.numero} eliminados`);
            }
            if (this.ajusteService) {
                try {
                    await tx.historialAjusteCuota.create({
                        data: {
                            personaId: data.personaId || null,
                            accion: 'REGENERAR_CUOTA',
                            datosPrevios: {
                                periodo: `${data.mes}/${data.anio}`,
                                cuotasEliminadas,
                                categoriaId: data.categoriaId,
                                personaId: data.personaId
                            },
                            datosNuevos: {
                                confirmado: true
                            },
                            usuario: 'SISTEMA',
                            motivoCambio: 'Regeneración de cuotas del período'
                        }
                    });
                }
                catch (histError) {
                    logger_1.logger.warn(`[REGENERAR CUOTAS] No se pudo crear entrada de historial: ${histError}`);
                }
            }
        });
        logger_1.logger.info(`[REGENERAR CUOTAS] ${cuotasEliminadas} cuotas eliminadas`);
        const generarResult = await this.generarCuotasConItems({
            mes: data.mes,
            anio: data.anio,
            categoriaIds: data.categoriaId ? [data.categoriaId] : undefined,
            incluirInactivos: false,
            aplicarDescuentos: data.aplicarDescuentos,
            observaciones: 'Cuotas regeneradas automáticamente'
        });
        cuotasGeneradas = generarResult.cuotas;
        logger_1.logger.info(`[REGENERAR CUOTAS] ✅ Regeneración completada - ` +
            `${cuotasEliminadas} eliminadas, ${generarResult.generated} generadas`);
        return {
            eliminadas: cuotasEliminadas,
            generadas: generarResult.generated,
            cuotas: cuotasGeneradas
        };
    }
    async previewRecalculo(data) {
        let cuotas = [];
        const cambios = [];
        if (data.cuotaId) {
            const cuota = await this.cuotaRepository.findById(data.cuotaId);
            if (!cuota) {
                throw new Error(`Cuota con ID ${data.cuotaId} no encontrada`);
            }
            cuotas = [cuota];
        }
        else if (data.mes && data.anio) {
            cuotas = await this.cuotaRepository.findByPeriodo(data.mes, data.anio, data.categoriaId ? await (0, categoria_helper_1.getCategoriaCodigoByCategoriaId)(data.categoriaId, this.prisma) : undefined);
            if (data.personaId) {
                cuotas = cuotas.filter(c => c.recibo.receptorId === data.personaId);
            }
        }
        else {
            throw new Error('Debe proporcionar cuotaId o (mes + anio)');
        }
        let conCambios = 0;
        let totalAjuste = 0;
        for (const cuota of cuotas) {
            if (cuota.recibo.estado === 'PAGADO') {
                continue;
            }
            const montoOriginal = Number(cuota.montoTotal);
            const montosCalculados = await this.calcularMontosCuota(cuota);
            const montoBase = montosCalculados.montoBase;
            const montoActividades = montosCalculados.montoActividades;
            const categoriaId = await (0, categoria_helper_1.getCategoriaIdByCodigo)(cuota.categoria, this.prisma);
            const resultado = await this.aplicarAjustesYExenciones(cuota.recibo.receptorId, cuota.mes, cuota.anio, montosCalculados.subtotal, {
                aplicarAjustes: data.aplicarAjustes,
                aplicarExenciones: data.aplicarExenciones,
                aplicarDescuentos: data.aplicarDescuentos,
                categoriaId,
                montoBase
            });
            const montoRecalculado = resultado.subtotal;
            const ajustesAplicados = resultado.ajustesAplicados;
            const exencionesAplicadas = resultado.exencionesAplicadas;
            const diferencia = montoRecalculado - montoOriginal;
            if (Math.abs(diferencia) > 0.01) {
                conCambios++;
                totalAjuste += diferencia;
            }
            cambios.push({
                cuotaId: cuota.id,
                reciboNumero: cuota.recibo.numero,
                socioId: cuota.recibo.receptorId,
                categoria: cuota.categoria,
                periodo: `${cuota.mes}/${cuota.anio}`,
                montoActual: montoOriginal,
                montoRecalculado,
                diferencia,
                ajustesAplicados,
                exencionesAplicadas,
                tieneCambios: Math.abs(diferencia) > 0.01
            });
        }
        logger_1.logger.info(`[PREVIEW RECALCULO] ${cambios.length} cuotas analizadas - ` +
            `${conCambios} con cambios, ajuste total: $${totalAjuste.toFixed(2)}`);
        return {
            cuotas: cambios,
            cambios: cambios.filter(c => c.tieneCambios),
            resumen: {
                totalCuotas: cambios.length,
                conCambios,
                sinCambios: cambios.length - conCambios,
                totalAjuste
            }
        };
    }
    async compararCuota(cuotaId) {
        const cuota = await this.cuotaRepository.findById(cuotaId);
        if (!cuota) {
            throw new Error(`Cuota con ID ${cuotaId} no encontrada`);
        }
        logger_1.logger.info(`[COMPARAR CUOTA] Comparando cuota ID ${cuotaId}`);
        const actual = {
            id: cuota.id,
            reciboNumero: cuota.recibo.numero,
            categoria: cuota.categoria,
            periodo: `${cuota.mes}/${cuota.anio}`,
            montoBase: Number(cuota.montoBase),
            montoActividades: Number(cuota.montoActividades),
            montoTotal: Number(cuota.montoTotal),
            estadoRecibo: cuota.recibo.estado
        };
        const montosCalculados = await this.calcularMontosCuota(cuota);
        const montoBase = montosCalculados.montoBase;
        const montoActividades = montosCalculados.montoActividades;
        const categoriaId = await (0, categoria_helper_1.getCategoriaIdByCodigo)(cuota.categoria, this.prisma);
        const resultado = await this.aplicarAjustesYExenciones(cuota.recibo.receptorId, cuota.mes, cuota.anio, montosCalculados.subtotal, {
            aplicarAjustes: true,
            aplicarExenciones: true,
            aplicarDescuentos: false,
            categoriaId,
            montoBase
        });
        const montoTotalRecalculado = resultado.subtotal;
        const recalculada = {
            id: cuota.id,
            montoBase,
            montoActividades,
            montoTotal: montoTotalRecalculado,
            ajustesAplicados: resultado.ajustesAplicados,
            exencionesAplicadas: resultado.exencionesAplicadas
        };
        const diferencias = {
            montoBase: montoBase - actual.montoBase,
            montoActividades: montoActividades - actual.montoActividades,
            montoTotal: montoTotalRecalculado - actual.montoTotal,
            esSignificativo: Math.abs(montoTotalRecalculado - actual.montoTotal) > 0.01,
            porcentajeDiferencia: actual.montoTotal > 0
                ? ((montoTotalRecalculado - actual.montoTotal) / actual.montoTotal) * 100
                : 0
        };
        logger_1.logger.info(`[COMPARAR CUOTA] Comparación completada - ` +
            `Actual: $${actual.montoTotal.toFixed(2)}, ` +
            `Recalculada: $${montoTotalRecalculado.toFixed(2)}, ` +
            `Diferencia: $${diferencias.montoTotal.toFixed(2)}`);
        return {
            actual,
            recalculada,
            diferencias
        };
    }
    async calcularMontosCuota(cuota) {
        const categoriaId = await (0, categoria_helper_1.getCategoriaIdByCodigo)(cuota.categoria, this.prisma);
        const montoBase = await this.cuotaRepository.getMontoBasePorCategoria(categoriaId);
        const montoActividades = await this.calcularCostoActividades(cuota.recibo.receptorId.toString(), cuota.mes, cuota.anio).then(result => result.total);
        const subtotal = montoBase + montoActividades;
        return {
            montoBase,
            montoActividades,
            subtotal
        };
    }
    async aplicarAjustesYExenciones(receptorId, mes, anio, subtotal, options) {
        let montoActual = subtotal;
        const ajustesAplicados = [];
        const exencionesAplicadas = [];
        if (options.aplicarAjustes && this.ajusteService) {
            const fechaCuota = new Date(anio, mes - 1, 1);
            const ajustes = await this.ajusteService.getAjustesActivosParaPeriodo(receptorId, fechaCuota);
            if (ajustes.length > 0) {
                const resultadoAjustes = this.ajusteService.calcularAjustesMultiples(ajustes, montoActual);
                montoActual = resultadoAjustes.montoFinal;
                ajustesAplicados.push(...resultadoAjustes.ajustes);
                logger_1.logger.debug(`[APLICAR AJUSTES] ${ajustes.length} ajustes aplicados, ` +
                    `ajuste total: $${resultadoAjustes.totalAjuste.toFixed(2)}`);
            }
        }
        if (options.aplicarExenciones && this.exencionService) {
            const fechaCuota = new Date(anio, mes - 1, 1);
            const exencionCheck = await this.exencionService.checkExencionParaPeriodo(receptorId, fechaCuota);
            if (exencionCheck.tieneExencion) {
                const montoExencion = (montoActual * exencionCheck.porcentaje) / 100;
                montoActual = montoActual - montoExencion;
                exencionesAplicadas.push({
                    exencionId: exencionCheck.exencion?.id,
                    tipoExencion: exencionCheck.exencion?.tipoExencion,
                    motivoExencion: exencionCheck.exencion?.motivoExencion,
                    porcentaje: exencionCheck.porcentaje,
                    montoExencion
                });
                logger_1.logger.debug(`[APLICAR EXENCIONES] Exención aplicada: ${exencionCheck.porcentaje}%, ` +
                    `descuento: $${montoExencion.toFixed(2)}`);
            }
        }
        if (options.aplicarDescuentos && options.categoriaId && options.montoBase !== undefined) {
            const descuentos = await this.calcularDescuentos(options.categoriaId, options.montoBase, receptorId);
            montoActual = Math.max(0, montoActual - descuentos.total);
        }
        return {
            subtotal: Math.max(0, montoActual),
            ajustesAplicados,
            exencionesAplicadas
        };
    }
}
exports.CuotaService = CuotaService;
//# sourceMappingURL=cuota.service.js.map