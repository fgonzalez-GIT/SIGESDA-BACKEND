"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CuotaService = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("@/utils/logger");
const database_1 = require("@/config/database");
const persona_helper_1 = require("@/utils/persona.helper");
class CuotaService {
    constructor(cuotaRepository, reciboRepository, personaRepository, configuracionRepository) {
        this.cuotaRepository = cuotaRepository;
        this.reciboRepository = reciboRepository;
        this.personaRepository = personaRepository;
        this.configuracionRepository = configuracionRepository;
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
        if (existingCuota.recibo.estado === 'PAGADO') {
            throw new Error(`No se puede modificar una cuota de un recibo pagado`);
        }
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
        if (existingCuota.recibo.estado === 'PAGADO') {
            throw new Error(`No se puede eliminar una cuota de un recibo pagado`);
        }
        if (existingCuota.recibo.mediosPago && existingCuota.recibo.mediosPago.length > 0) {
            throw new Error(`No se puede eliminar una cuota que tiene medios de pago registrados`);
        }
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
                    concepto: `Cuota ${this.getNombreMes(data.mes)} ${data.anio} - ${socio.categoria}`,
                    fechaVencimiento: this.calcularFechaVencimiento(data.mes, data.anio),
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
                nombreMes: this.getNombreMes(data.mes)
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
    calcularFechaVencimiento(mes, anio) {
        const fechaVencimiento = new Date(anio, mes, 15);
        return fechaVencimiento;
    }
    getNombreMes(mes) {
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return meses[mes - 1] || 'Mes inválido';
    }
}
exports.CuotaService = CuotaService;
//# sourceMappingURL=cuota.service.js.map