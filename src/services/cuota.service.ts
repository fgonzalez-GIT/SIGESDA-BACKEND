// @ts-nocheck
import { Cuota, CategoriaSocio, TipoRecibo, PrismaClient } from '@prisma/client';
import { CuotaRepository } from '@/repositories/cuota.repository';
import { ReciboRepository } from '@/repositories/recibo.repository';
import { PersonaRepository } from '@/repositories/persona.repository';
import { ConfiguracionRepository } from '@/repositories/configuracion.repository';
import { TipoItemCuotaRepository } from '@/repositories/tipo-item-cuota.repository';
import { ItemCuotaRepository } from '@/repositories/item-cuota.repository';
import {
  CreateCuotaDto,
  UpdateCuotaDto,
  CuotaQueryDto,
  GenerarCuotasDto,
  CuotaSearchDto,
  CuotaStatsDto,
  DeleteBulkCuotasDto,
  CalcularCuotaDto,
  RecalcularCuotasDto,
  ReporteCuotasDto,
  RecalcularCuotaDto,
  RegenerarCuotasDto,
  PreviewRecalculoDto,
  CompararCuotaDto
} from '@/dto/cuota.dto';
import { logger } from '@/utils/logger';
import { prisma } from '@/config/database';
import { hasActiveTipo } from '@/utils/persona.helper';
import { MotorReglasDescuentos } from './motor-reglas-descuentos.service';
import {
  getNombreMes,
  calcularFechaVencimiento
} from '@/utils/date.helper';
import {
  getCategoriaIdByCodigo,
  getCategoriaCodigoByCategoriaId
} from '@/utils/categoria.helper';
import { validateReciboPagado, validateCanDeleteRecibo } from '@/utils/recibo.helper';
import { DIA_VENCIMIENTO_CUOTA } from '@/constants/cuota.constants';

export class CuotaService {
  constructor(
    private cuotaRepository: CuotaRepository,
    private reciboRepository: ReciboRepository,
    private personaRepository: PersonaRepository,
    private configuracionRepository: ConfiguracionRepository,
    private ajusteService?: any, // Will be AjusteCuotaService
    private exencionService?: any // Will be ExencionCuotaService
  ) {}

  private get prisma() {
    return prisma;
  }

  async createCuota(data: CreateCuotaDto): Promise<Cuota> {
    // Validar que el recibo existe y es de tipo CUOTA
    const recibo = await this.reciboRepository.findById(data.reciboId);
    if (!recibo) {
      throw new Error(`Recibo con ID ${data.reciboId} no encontrado`);
    }

    if (recibo.tipo !== TipoRecibo.CUOTA) {
      throw new Error(`El recibo debe ser de tipo CUOTA para asociar una cuota`);
    }

    // Validar que no existe ya una cuota para este recibo
    const cuotaExistente = await this.cuotaRepository.findByReciboId(data.reciboId);
    if (cuotaExistente) {
      throw new Error(`Ya existe una cuota asociada al recibo ${recibo.numero}`);
    }

    // Validar que el período y categoría sean consistentes
    const periodoExistente = await this.cuotaRepository.checkExistePeriodo(
      data.mes,
      data.anio,
      data.categoria
    );

    if (periodoExistente) {
      logger.warn(`Ya existen cuotas para ${data.categoria} en ${data.mes}/${data.anio}`);
    }

    const cuota = await this.cuotaRepository.create(data);

    logger.info(`Cuota creada: ${data.categoria} ${data.mes}/${data.anio} - $${data.montoTotal} (ID: ${cuota.id})`);

    return cuota;
  }

  async getCuotas(query: CuotaQueryDto): Promise<{ data: Cuota[]; total: number; pages: number }> {
    const result = await this.cuotaRepository.findAll(query);
    const pages = Math.ceil(result.total / query.limit);

    return {
      ...result,
      pages
    };
  }

  /**
   * Exporta todas las cuotas sin paginación
   * Optimizado para exportación con formato simplificado
   * @param query - Filtros de consulta (limit se fuerza a 'all')
   */
  async exportAll(query: Omit<CuotaQueryDto, 'page' | 'limit'>): Promise<{ data: Cuota[]; total: number }> {
    // Forzar limit=all (999999) y page=1 para obtener todos los registros
    const exportQuery: CuotaQueryDto = {
      ...query,
      page: 1,
      limit: 999999, // Esto se interpreta como "all" en el repository
      ordenarPor: query.ordenarPor || 'fecha',
      orden: query.orden || 'desc'
    };

    const result = await this.cuotaRepository.findAll(exportQuery);

    logger.info(`Exportadas ${result.total} cuotas con filtros aplicados`);

    return result;
  }

  async getCuotaById(id: number): Promise<Cuota | null> {
    return this.cuotaRepository.findById(id);
  }

  async getCuotaByReciboId(reciboId: number): Promise<Cuota | null> {
    return this.cuotaRepository.findByReciboId(reciboId);
  }

  async getCuotasPorPeriodo(mes: number, anio: number, categoria?: CategoriaSocio): Promise<Cuota[]> {
    return this.cuotaRepository.findByPeriodo(mes, anio, categoria);
  }

  async getCuotasBySocio(socioId: number, limit?: number): Promise<Cuota[]> {
    // Validar que la persona existe y es socio
    const persona = await this.personaRepository.findById(socioId);
    if (!persona) {
      throw new Error(`Persona con ID ${socioId} no encontrada`);
    }

    // Verificar que la persona tiene tipo SOCIO activo
    const esSocio = await hasActiveTipo(socioId, 'SOCIO');
    if (!esSocio) {
      throw new Error(`La persona debe ser de tipo SOCIO`);
    }

    return this.cuotaRepository.findBySocio(socioId, limit);
  }

  async updateCuota(id: number, data: UpdateCuotaDto): Promise<Cuota> {
    const existingCuota = await this.cuotaRepository.findById(id);
    if (!existingCuota) {
      throw new Error(`Cuota con ID ${id} no encontrada`);
    }

    // Validar que el recibo asociado no esté pagado
    validateReciboPagado(existingCuota.recibo, 'modificar');

    // Si se cambia algún monto, recalcular el total
    if (data.montoBase !== undefined || data.montoActividades !== undefined) {
      const nuevoMontoBase = data.montoBase ?? parseFloat(existingCuota.montoBase.toString());
      const nuevoMontoActividades = data.montoActividades ?? parseFloat(existingCuota.montoActividades.toString());

      data.montoTotal = nuevoMontoBase + nuevoMontoActividades;
    }

    const updatedCuota = await this.cuotaRepository.update(id, data);

    // Si se cambió el monto total, actualizar el recibo asociado
    if (data.montoTotal !== undefined && data.montoTotal !== parseFloat(existingCuota.montoTotal.toString())) {
      await this.reciboRepository.update(existingCuota.reciboId, {
        importe: data.montoTotal
      });

      logger.info(`Recibo ${existingCuota.recibo.numero} actualizado con nuevo importe: $${data.montoTotal}`);
    }

    logger.info(`Cuota actualizada: ${existingCuota.categoria} ${existingCuota.mes}/${existingCuota.anio} (ID: ${id})`);

    return updatedCuota;
  }

  async deleteCuota(id: number): Promise<Cuota> {
    const existingCuota = await this.cuotaRepository.findById(id);
    if (!existingCuota) {
      throw new Error(`Cuota con ID ${id} no encontrada`);
    }

    // Validar que el recibo se puede eliminar (no pagado, sin medios de pago)
    validateCanDeleteRecibo(existingCuota.recibo);

    const deletedCuota = await this.cuotaRepository.delete(id);

    logger.info(`Cuota eliminada: ${existingCuota.categoria} ${existingCuota.mes}/${existingCuota.anio} (ID: ${id})`);

    return deletedCuota;
  }

  async generarCuotas(data: GenerarCuotasDto): Promise<{ generated: number; errors: string[]; cuotas: Cuota[] }> {
    const errors: string[] = [];
    const cuotasCreadas: Cuota[] = [];

    // Obtener socios para generar cuotas
    const sociosPorGenerar = await this.cuotaRepository.getCuotasPorGenerar(
      data.mes,
      data.anio,
      data.categorias
    );

    if (sociosPorGenerar.length === 0) {
      return {
        generated: 0,
        errors: ['No hay socios pendientes para generar cuotas en este período'],
        cuotas: []
      };
    }

    logger.info(`Iniciando generación de cuotas para ${sociosPorGenerar.length} socios - ${data.mes}/${data.anio}`);

    for (const socio of sociosPorGenerar) {
      try {
        // Calcular montos de cuota
        const montoCuota = await this.calcularMontoCuota({
          categoria: socio.categoria,
          mes: data.mes,
          anio: data.anio,
          socioId: socio.id,
          incluirActividades: true,
          aplicarDescuentos: data.aplicarDescuentos
        });

        // Crear recibo primero (numero auto-generado por PostgreSQL)
        const recibo = await this.reciboRepository.create({
          tipo: TipoRecibo.CUOTA,
          receptorId: socio.id,
          importe: montoCuota.montoTotal,
          concepto: `Cuota ${getNombreMes(data.mes)} ${data.anio} - ${socio.categoria}`,
          fechaVencimiento: calcularFechaVencimiento(data.mes, data.anio),
          observaciones: data.observaciones
        });

        // Crear cuota asociada
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

      } catch (error) {
        const errorMsg = `Error generando cuota para ${socio.nombre} ${socio.apellido} (${socio.numeroSocio}): ${error}`;
        errors.push(errorMsg);
        logger.error(errorMsg);
      }
    }

    logger.info(`Generación de cuotas completada: ${cuotasCreadas.length} creadas, ${errors.length} errores`);

    return {
      generated: cuotasCreadas.length,
      errors,
      cuotas: cuotasCreadas
    };
  }

  async calcularMontoCuota(data: CalcularCuotaDto): Promise<{
    montoBase: number;
    montoActividades: number;
    montoTotal: number;
    descuentos: number;
    detalleCalculo: any;
  }> {
    // Obtener monto base por categoría
    let montoBase = await this.cuotaRepository.getMontoBasePorCategoria(data.categoriaId);

    // Aplicar configuración de precios si existe
    try {
      const configPrecio = await this.configuracionRepository.findByClave(`CUOTA_${data.categoriaId}`);
      if (configPrecio && configPrecio.valor) {
        montoBase = parseFloat(configPrecio.valor);
      }
    } catch (error) {
      logger.warn(`No se pudo obtener configuración de precio para categoría ${data.categoriaId}, usando valor por defecto`);
    }

    let montoActividades = 0;
    let descuentos = 0;
    const detalleCalculo: any = {
      categoriaId: data.categoriaId,
      montoBaseCatalogo: montoBase,
      actividades: [],
      descuentosAplicados: []
    };

    // Calcular costo de actividades si se incluyen
    if (data.incluirActividades && data.socioId) {
      try {
        const participaciones = await this.personaRepository.findById(data.socioId);
        if (participaciones) {
          // Aquí se calcularía el costo de actividades del socio
          // Por ahora, un cálculo básico
          const costoActividades = await this.calcularCostoActividades(data.socioId, data.mes, data.anio);
          montoActividades = costoActividades.total;
          detalleCalculo.actividades = costoActividades.detalle;
        }
      } catch (error) {
        logger.warn(`Error calculando actividades para socio ${data.socioId}: ${error}`);
      }
    }

    // Aplicar descuentos si corresponde
    if (data.aplicarDescuentos) {
      const descuentosCalculados = await this.calcularDescuentos(
        data.categoriaId,
        montoBase,
        data.socioId
      );
      descuentos = descuentosCalculados.total;
      detalleCalculo.descuentosAplicados = descuentosCalculados.detalle;
    }

    const montoTotal = montoBase + montoActividades - descuentos;

    return {
      montoBase,
      montoActividades,
      montoTotal: Math.max(0, montoTotal), // No permitir montos negativos
      descuentos,
      detalleCalculo
    };
  }

  async searchCuotas(searchData: CuotaSearchDto): Promise<Cuota[]> {
    return this.cuotaRepository.search(searchData);
  }

  async getStatistics(statsData: CuotaStatsDto): Promise<any> {
    return this.cuotaRepository.getStatistics(statsData);
  }

  async getVencidas(): Promise<Cuota[]> {
    return this.cuotaRepository.getVencidas();
  }

  async getPendientes(): Promise<Cuota[]> {
    return this.cuotaRepository.getPendientes();
  }

  async deleteBulkCuotas(data: DeleteBulkCuotasDto): Promise<{ count: number }> {
    // Validar que todas las cuotas se pueden eliminar
    const cuotas = await Promise.all(
      data.ids.map(id => this.cuotaRepository.findById(id))
    );

    const invalidIds = cuotas
      .filter((cuota, index) => {
        if (!cuota) return true;
        if (cuota.recibo.estado === 'PAGADO') return true;
        if (cuota.recibo.mediosPago && cuota.recibo.mediosPago.length > 0) return true;
        return false;
      })
      .map((_, index) => data.ids[index]);

    if (invalidIds.length > 0) {
      throw new Error(`No se pueden eliminar las siguientes cuotas: ${invalidIds.join(', ')}`);
    }

    const result = await this.cuotaRepository.deleteBulk(data.ids);

    logger.info(`Eliminación masiva de cuotas: ${result.count} eliminadas`);

    return result;
  }

  async recalcularCuotas(data: RecalcularCuotasDto): Promise<{ updated: number; errors: string[] }> {
    const errors: string[] = [];
    let updated = 0;

    // Obtener cuotas del período
    const cuotas = await this.cuotaRepository.findByPeriodo(data.mes, data.anio, data.categoria);

    for (const cuota of cuotas) {
      try {
        // Solo recalcular cuotas no pagadas
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

        // Actualizar si hay diferencias
        const montoActual = parseFloat(cuota.montoTotal.toString());
        if (Math.abs(nuevoCalculo.montoTotal - montoActual) > 0.01) {
          await this.cuotaRepository.update(cuota.id, {
            montoBase: nuevoCalculo.montoBase,
            montoActividades: nuevoCalculo.montoActividades,
            montoTotal: nuevoCalculo.montoTotal
          });

          // Actualizar recibo si se solicita
          if (data.actualizarRecibos) {
            await this.reciboRepository.update(cuota.reciboId, {
              importe: nuevoCalculo.montoTotal
            });
          }

          updated++;
        }

      } catch (error) {
        errors.push(`Error recalculando cuota ${cuota.id}: ${error}`);
      }
    }

    logger.info(`Recálculo de cuotas completado: ${updated} actualizadas, ${errors.length} errores`);

    return { updated, errors };
  }

  async getResumenMensual(mes: number, anio: number): Promise<any> {
    return this.cuotaRepository.getResumenMensual(mes, anio);
  }

  async generarReporte(data: ReporteCuotasDto): Promise<any> {
    const cuotas = await this.cuotaRepository.findByPeriodo(data.mes, data.anio, data.categoria);
    const resumen = await this.cuotaRepository.getResumenMensual(data.mes, data.anio);

    const reporte: any = {
      periodo: {
        mes: data.mes,
        anio: data.anio,
        nombreMes: getNombreMes(data.mes)
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

  // Métodos auxiliares privados

  private async calcularCostoActividades(socioId: string, mes: number, anio: number): Promise<{
    total: number;
    detalle: any[];
  }> {
    // Implementar lógica para calcular costo de actividades
    // Por ahora retorna un valor básico
    return {
      total: 0,
      detalle: []
    };
  }

  private async calcularDescuentos(categoriaId: number, montoBase: number, socioId?: number): Promise<{
    total: number;
    detalle: any[];
  }> {
    const descuentos: any[] = [];
    let total = 0;

    // Obtener el código de la categoría desde la DB
    const categoria = await this.prisma.categoriaSocio.findUnique({
      where: { id: categoriaId },
      select: { codigo: true }
    });

    if (!categoria) {
      return { total: 0, detalle: [] };
    }

    // Descuento por categoría estudiante
    if (categoria.codigo === 'ESTUDIANTE') {
      const descuento = montoBase * 0.4; // 40% descuento
      descuentos.push({
        tipo: 'Descuento estudiante',
        porcentaje: 40,
        monto: descuento
      });
      total += descuento;
    }

    // Descuento por categoría jubilado
    if (categoria.codigo === 'JUBILADO') {
      const descuento = montoBase * 0.25; // 25% descuento
      descuentos.push({
        tipo: 'Descuento jubilado',
        porcentaje: 25,
        monto: descuento
      });
      total += descuento;
    }

    return { total, detalle: descuentos };
  }

  /**
   * ========================================================================
   * NUEVO MÉTODO: Generación de Cuotas con Sistema de Ítems + Motor de Reglas
   * ========================================================================
   *
   * Reemplaza el método legacy generarCuotas() con un enfoque moderno que:
   * - Usa el sistema de ítems configurables
   * - Integra el motor de reglas de descuentos
   * - Registra auditoría de aplicaciones de reglas
   * - Permite flexibilidad total en la configuración
   *
   * @param data - Parámetros de generación (mes, año, categorías, descuentos)
   * @returns Resultado de generación con cuotas creadas y errores
   */
  async generarCuotasConItems(data: GenerarCuotasDto): Promise<{
    generated: number;
    errors: string[];
    cuotas: any[];
    resumenDescuentos?: any;
  }> {
    const errors: string[] = [];
    const cuotasCreadas: any[] = [];

    // Repositorios necesarios
    const tipoItemRepo = new TipoItemCuotaRepository();
    const itemRepo = new ItemCuotaRepository();
    const motorDescuentos = new MotorReglasDescuentos();

    logger.info(`[GENERACIÓN CUOTAS] Iniciando generación con items - ${data.mes}/${data.anio}`);

    try {
      // ====================================================================
      // PASO 1: Obtener socios para generar cuotas
      // ====================================================================
      const sociosPorGenerar = await this.cuotaRepository.getCuotasPorGenerar(
        data.mes,
        data.anio,
        data.categoriaIds
      );

      if (sociosPorGenerar.length === 0) {
        logger.warn('[GENERACIÓN CUOTAS] No hay socios pendientes para generar cuotas');
        return {
          generated: 0,
          errors: ['No hay socios pendientes para generar cuotas en este período'],
          cuotas: []
        };
      }

      logger.info(`[GENERACIÓN CUOTAS] ${sociosPorGenerar.length} socios a procesar`);

      // ====================================================================
      // PASO 2: Obtener tipos de ítems necesarios
      // ====================================================================
      const tipoCuotaBase = await tipoItemRepo.findByCodigo('CUOTA_BASE_SOCIO');
      const tipoActividad = await tipoItemRepo.findByCodigo('ACTIVIDAD_INDIVIDUAL');

      if (!tipoCuotaBase) {
        throw new Error('Tipo de ítem CUOTA_BASE_SOCIO no encontrado. Ejecutar seed: npx tsx prisma/seed-items-catalogos.ts');
      }

      if (!tipoActividad) {
        logger.warn('[GENERACIÓN CUOTAS] Tipo de ítem ACTIVIDAD_INDIVIDUAL no encontrado. Actividades no se incluirán.');
      }

      // ====================================================================
      // PASO 3: Procesar cada socio
      // ====================================================================
      let descuentosGlobales = {
        totalSociosConDescuento: 0,
        montoTotalDescuentos: 0,
        reglasAplicadas: {} as Record<string, number>
      };

      for (const socio of sociosPorGenerar) {
        try {
          await this.prisma.$transaction(async (tx) => {
            // ============================================================
            // 3.1: Crear recibo (número auto-generado por DB sequence)
            // ============================================================
            const recibo = await tx.recibo.create({
              data: {
                tipo: TipoRecibo.CUOTA,
                receptorId: socio.id,
                importe: 0, // Se actualizará al final
                concepto: `Cuota ${getNombreMes(data.mes)} ${data.anio}`,
                fechaVencimiento: calcularFechaVencimiento(data.mes, data.anio),
                observaciones: data.observaciones
              }
            });

            logger.debug(`[GENERACIÓN CUOTAS] Recibo ${recibo.numero} creado para socio ${socio.numeroSocio}`);

            // ============================================================
            // 3.2: Crear cuota (montos se calcularán desde items)
            // ============================================================
            const cuota = await tx.cuota.create({
              data: {
                recibo: { connect: { id: recibo.id } },
                categoria: { connect: { id: socio.categoria.id } },
                mes: data.mes,
                anio: data.anio,
                montoBase: 0, // Legacy, se mantendrá para compatibilidad
                montoActividades: 0,
                montoTotal: 0 // Se calculará automáticamente desde items
              }
            });

            logger.debug(`[GENERACIÓN CUOTAS] Cuota ID ${cuota.id} creada`);

            // ============================================================
            // 3.3: Crear ítem BASE (cuota mensual según categoría)
            // ============================================================
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

            logger.debug(`[GENERACIÓN CUOTAS] Ítem base creado: $${montoBaseSocio}`);

            // ============================================================
            // 3.4: Crear ítems de ACTIVIDADES (si tiene participaciones)
            // ============================================================
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

              logger.debug(`[GENERACIÓN CUOTAS] ${participaciones.length} actividades agregadas: $${montoActividades}`);
            }

            // ============================================================
            // 3.5: INTEGRACIÓN CON MOTOR DE REGLAS DE DESCUENTOS
            // ============================================================
            if (data.aplicarDescuentos) {
              try {
                // Obtener items creados hasta el momento
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

                // Llamar al motor con la firma correcta: (cuotaId, personaId, itemsCuota[])
                const resultadoDescuentos = await motorDescuentos.aplicarReglas(
                  cuota.id,
                  socio.id,
                  itemsActuales as any
                );

                // Actualizar estadísticas globales
                if (resultadoDescuentos.itemsDescuento.length > 0) {
                  descuentosGlobales.totalSociosConDescuento++;
                  descuentosGlobales.montoTotalDescuentos += resultadoDescuentos.totalDescuento;

                  // Contar reglas aplicadas
                  resultadoDescuentos.aplicaciones.forEach((aplicacion: any) => {
                    const codigo = `REGLA_${aplicacion.reglaId}`;
                    if (!descuentosGlobales.reglasAplicadas[codigo]) {
                      descuentosGlobales.reglasAplicadas[codigo] = 0;
                    }
                    descuentosGlobales.reglasAplicadas[codigo]++;
                  });
                }

                logger.debug(
                  `[GENERACIÓN CUOTAS] Descuentos aplicados: ${resultadoDescuentos.itemsDescuento.length} ítems, ` +
                  `total descuento: $${resultadoDescuentos.totalDescuento.toFixed(2)}`
                );

              } catch (errorDescuento) {
                logger.error(
                  `[GENERACIÓN CUOTAS] Error aplicando descuentos para socio ${socio.numeroSocio}:`,
                  errorDescuento instanceof Error ? errorDescuento.message : JSON.stringify(errorDescuento),
                  errorDescuento instanceof Error ? errorDescuento.stack : ''
                );
                // No fallar la transacción, solo log del error
              }
            }

            // ============================================================
            // 3.6: Recalcular total de la cuota desde items
            // ============================================================
            const totalItems = await tx.itemCuota.aggregate({
              where: { cuotaId: cuota.id },
              _sum: { monto: true }
            });

            const montoTotal = totalItems._sum.monto || 0;

            // Actualizar cuota con totales
            await tx.cuota.update({
              where: { id: cuota.id },
              data: {
                montoBase: montoBaseSocio,
                montoActividades,
                montoTotal
              }
            });

            // Actualizar recibo con importe final
            await tx.recibo.update({
              where: { id: recibo.id },
              data: { importe: montoTotal }
            });

            logger.info(
              `[GENERACIÓN CUOTAS] ✅ Cuota generada para ${socio.nombre} ${socio.apellido} (${socio.numeroSocio}) - ` +
              `Base: $${montoBaseSocio}, Actividades: $${montoActividades}, Total: $${montoTotal}`
            );

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

          }); // Fin de transacción

        } catch (error: any) {
          const errorMsg = `Error generando cuota para ${socio.nombre} ${socio.apellido} (${socio.numeroSocio}): ${error.message}`;
          errors.push(errorMsg);
          logger.error(`[GENERACIÓN CUOTAS] ${errorMsg}`);
        }
      } // Fin de loop de socios

      // ====================================================================
      // PASO 4: Resumen final
      // ====================================================================
      logger.info(
        `[GENERACIÓN CUOTAS] ✅ Completada - ${cuotasCreadas.length} cuotas creadas, ${errors.length} errores`
      );

      if (data.aplicarDescuentos && descuentosGlobales.totalSociosConDescuento > 0) {
        logger.info(
          `[GENERACIÓN CUOTAS] 📊 Descuentos aplicados: ${descuentosGlobales.totalSociosConDescuento} socios, ` +
          `monto total: $${descuentosGlobales.montoTotalDescuentos.toFixed(2)}`
        );
      }

      return {
        generated: cuotasCreadas.length,
        errors,
        cuotas: cuotasCreadas,
        resumenDescuentos: data.aplicarDescuentos ? descuentosGlobales : undefined
      };

    } catch (error: any) {
      logger.error('[GENERACIÓN CUOTAS] Error fatal en generación:', error);
      throw new Error(`Error generando cuotas: ${error.message}`);
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // FASE 4 - Task 4.3: Recálculo y Regeneración de Cuotas
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Recalculate an existing cuota with current adjustments/exemptions
   *
   * Applies:
   * - Manual adjustments (AjusteCuotaSocio)
   * - Temporary exemptions (ExencionCuota)
   * - Discount rules (MotorReglasDescuentos)
   *
   * Returns comparison between original and recalculated amounts
   */
  async recalcularCuota(data: RecalcularCuotaDto): Promise<{
    cuotaOriginal: any;
    cuotaRecalculada: any;
    cambios: {
      montoBase: { antes: number; despues: number; diferencia: number };
      montoActividades: { antes: number; despues: number; diferencia: number };
      montoTotal: { antes: number; despues: number; diferencia: number };
      ajustesAplicados: any[];
      exencionesAplicadas: any[];
    };
  }> {
    // Get existing cuota
    const cuota = await this.cuotaRepository.findById(data.cuotaId);
    if (!cuota) {
      throw new Error(`Cuota con ID ${data.cuotaId} no encontrada`);
    }

    // Prevent recalculation of paid cuotas
    validateReciboPagado(cuota.recibo, 'recalcular');

    logger.info(`[RECALCULAR CUOTA] Iniciando recálculo de cuota ID ${data.cuotaId}`);

    // Store original values
    const montoBaseOriginal = Number(cuota.montoBase);
    const montoActividadesOriginal = Number(cuota.montoActividades);
    const montoTotalOriginal = Number(cuota.montoTotal);

    // ====================================================================
    // STEP 1-3: Calculate base amounts using helper
    // ====================================================================
    const montosCalculados = await this.calcularMontosCuota(cuota);
    const montoBase = montosCalculados.montoBase;
    const montoActividades = montosCalculados.montoActividades;

    // ====================================================================
    // STEP 4-6: Apply adjustments, exemptions, and discounts using helper
    // ====================================================================
    const categoriaId = cuota.categoriaId;
    const resultado = await this.aplicarAjustesYExenciones(
      cuota.recibo.receptorId,
      cuota.mes,
      cuota.anio,
      montosCalculados.subtotal,
      {
        aplicarAjustes: data.aplicarAjustes,
        aplicarExenciones: data.aplicarExenciones,
        aplicarDescuentos: data.aplicarDescuentos,
        categoriaId,
        montoBase
      }
    );

    const montoTotalRecalculado = resultado.subtotal;
    const ajustesAplicados = resultado.ajustesAplicados;
    const exencionesAplicadas = resultado.exencionesAplicadas;

    // ====================================================================
    // STEP 7: Update cuota if confirmed (not preview)
    // ====================================================================
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

    // Only update if there are actual changes
    if (Math.abs(cambiosDiferencia.montoTotal.diferencia) > 0.01) {
      await this.prisma.$transaction(async (tx) => {
        // Update cuota
        await tx.cuota.update({
          where: { id: data.cuotaId },
          data: {
            montoBase,
            montoActividades,
            montoTotal: montoTotalRecalculado
          }
        });

        // Update recibo
        await tx.recibo.update({
          where: { id: cuota.reciboId },
          data: {
            importe: montoTotalRecalculado
          }
        });

        // Create history entry if HistorialAjusteCuotaRepository is available
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
          } catch (histError) {
            logger.warn(`[RECALCULAR CUOTA] No se pudo crear entrada de historial: ${histError}`);
          }
        }
      });

      logger.info(
        `[RECALCULAR CUOTA] ✅ Cuota ${data.cuotaId} recalculada - ` +
        `Antes: $${montoTotalOriginal.toFixed(2)}, Después: $${montoTotalRecalculado.toFixed(2)}, ` +
        `Diferencia: $${cambiosDiferencia.montoTotal.diferencia.toFixed(2)}`
      );
    } else {
      logger.info(`[RECALCULAR CUOTA] Sin cambios para cuota ${data.cuotaId}`);
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

  /**
   * Regenerate cuotas for a period (delete and recreate)
   *
   * WARNING: This deletes existing cuotas for the period!
   * Use with caution and only for unpaid cuotas.
   */
  async regenerarCuotas(data: RegenerarCuotasDto): Promise<{
    eliminadas: number;
    generadas: number;
    cuotas: any[];
  }> {
    logger.info(`[REGENERAR CUOTAS] Iniciando regeneración - ${data.mes}/${data.anio}`);

    // ====================================================================
    // STEP 1: Find existing cuotas for the period
    // ====================================================================
    const cuotasExistentes = await this.cuotaRepository.findByPeriodo(
      data.mes,
      data.anio,
      data.categoriaId ? await getCategoriaCodigoByCategoriaId(data.categoriaId, this.prisma) : undefined
    );

    // Filter by personaId if specified
    let cuotasPorEliminar = cuotasExistentes;
    if (data.personaId) {
      cuotasPorEliminar = cuotasExistentes.filter(c => c.recibo.receptorId === data.personaId);
    }

    // ====================================================================
    // STEP 2: Validate that all cuotas can be deleted
    // ====================================================================
    const cuotasPagadas = cuotasPorEliminar.filter(c => c.recibo.estado === 'PAGADO');
    if (cuotasPagadas.length > 0) {
      throw new Error(
        `No se pueden regenerar cuotas pagadas. ${cuotasPagadas.length} cuotas del período ya están pagadas.`
      );
    }

    // ====================================================================
    // STEP 3: Delete existing cuotas (within transaction)
    // ====================================================================
    let cuotasGeneradas: any[] = [];
    const cuotasEliminadas = cuotasPorEliminar.length;

    await this.prisma.$transaction(async (tx) => {
      // Delete cuotas and their recibos
      for (const cuota of cuotasPorEliminar) {
        await tx.cuota.delete({
          where: { id: cuota.id }
        });

        await tx.recibo.delete({
          where: { id: cuota.reciboId }
        });

        logger.debug(`[REGENERAR CUOTAS] Cuota ${cuota.id} y recibo ${cuota.recibo.numero} eliminados`);
      }

      // Create history entry
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
        } catch (histError) {
          logger.warn(`[REGENERAR CUOTAS] No se pudo crear entrada de historial: ${histError}`);
        }
      }
    });

    logger.info(`[REGENERAR CUOTAS] ${cuotasEliminadas} cuotas eliminadas`);

    // ====================================================================
    // STEP 4: Generate new cuotas
    // ====================================================================
    const generarResult = await this.generarCuotasConItems({
      mes: data.mes,
      anio: data.anio,
      categoriaIds: data.categoriaId ? [data.categoriaId] : undefined,
      incluirInactivos: false,
      aplicarDescuentos: data.aplicarDescuentos,
      observaciones: 'Cuotas regeneradas automáticamente'
    });

    cuotasGeneradas = generarResult.cuotas;

    logger.info(
      `[REGENERAR CUOTAS] ✅ Regeneración completada - ` +
      `${cuotasEliminadas} eliminadas, ${generarResult.generated} generadas`
    );

    return {
      eliminadas: cuotasEliminadas,
      generadas: generarResult.generated,
      cuotas: cuotasGeneradas
    };
  }

  /**
   * Preview recalculation without applying changes
   *
   * Shows how cuotas would look after recalculation
   */
  async previewRecalculo(data: PreviewRecalculoDto): Promise<{
    cuotas: any[];
    cambios: any[];
    resumen: {
      totalCuotas: number;
      conCambios: number;
      sinCambios: number;
      totalAjuste: number;
    };
  }> {
    let cuotas: any[] = [];
    const cambios: any[] = [];

    // ====================================================================
    // OPTION A: Single cuota recalculation preview
    // ====================================================================
    if (data.cuotaId) {
      const cuota = await this.cuotaRepository.findById(data.cuotaId);
      if (!cuota) {
        throw new Error(`Cuota con ID ${data.cuotaId} no encontrada`);
      }

      cuotas = [cuota];
    }
    // ====================================================================
    // OPTION B: Period-based recalculation preview
    // ====================================================================
    else if (data.mes && data.anio) {
      cuotas = await this.cuotaRepository.findByPeriodo(
        data.mes,
        data.anio,
        data.categoriaId ? await getCategoriaCodigoByCategoriaId(data.categoriaId, this.prisma) : undefined
      );

      // Filter by personaId if specified
      if (data.personaId) {
        cuotas = cuotas.filter(c => c.recibo.receptorId === data.personaId);
      }
    } else {
      throw new Error('Debe proporcionar cuotaId o (mes + anio)');
    }

    // ====================================================================
    // Calculate preview for each cuota
    // ====================================================================
    let conCambios = 0;
    let totalAjuste = 0;

    for (const cuota of cuotas) {
      // Skip paid cuotas
      if (cuota.recibo.estado === 'PAGADO') {
        continue;
      }

      const montoOriginal = Number(cuota.montoTotal);

      // Simulate recalculation using helpers (without actually updating)
      const montosCalculados = await this.calcularMontosCuota(cuota);
      const montoBase = montosCalculados.montoBase;
      const montoActividades = montosCalculados.montoActividades;

      const categoriaId = await getCategoriaIdByCodigo(cuota.categoria, this.prisma);
      const resultado = await this.aplicarAjustesYExenciones(
        cuota.recibo.receptorId,
        cuota.mes,
        cuota.anio,
        montosCalculados.subtotal,
        {
          aplicarAjustes: data.aplicarAjustes,
          aplicarExenciones: data.aplicarExenciones,
          aplicarDescuentos: data.aplicarDescuentos,
          categoriaId,
          montoBase
        }
      );

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

    logger.info(
      `[PREVIEW RECALCULO] ${cambios.length} cuotas analizadas - ` +
      `${conCambios} con cambios, ajuste total: $${totalAjuste.toFixed(2)}`
    );

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

  /**
   * Compare current cuota state with recalculated state
   *
   * Similar to recalcularCuota but doesn't update, only shows comparison
   */
  async compararCuota(cuotaId: number): Promise<{
    actual: any;
    recalculada: any;
    diferencias: any;
  }> {
    const cuota = await this.cuotaRepository.findById(cuotaId);
    if (!cuota) {
      throw new Error(`Cuota con ID ${cuotaId} no encontrada`);
    }

    logger.info(`[COMPARAR CUOTA] Comparando cuota ID ${cuotaId}`);

    // Get current state
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

    // Calculate recalculated state using helpers
    const montosCalculados = await this.calcularMontosCuota(cuota);
    const montoBase = montosCalculados.montoBase;
    const montoActividades = montosCalculados.montoActividades;

    const categoriaId = await getCategoriaIdByCodigo(cuota.categoria, this.prisma);
    const resultado = await this.aplicarAjustesYExenciones(
      cuota.recibo.receptorId,
      cuota.mes,
      cuota.anio,
      montosCalculados.subtotal,
      {
        aplicarAjustes: true,  // Always check for adjustments in comparison
        aplicarExenciones: true,  // Always check for exemptions in comparison
        aplicarDescuentos: false,  // Don't apply discounts in comparison by default
        categoriaId,
        montoBase
      }
    );

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

    logger.info(
      `[COMPARAR CUOTA] Comparación completada - ` +
      `Actual: $${actual.montoTotal.toFixed(2)}, ` +
      `Recalculada: $${montoTotalRecalculado.toFixed(2)}, ` +
      `Diferencia: $${diferencias.montoTotal.toFixed(2)}`
    );

    return {
      actual,
      recalculada,
      diferencias
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE HELPER METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Calcula los montos base y actividades para una cuota
   * @private
   */
  private async calcularMontosCuota(cuota: any): Promise<{
    montoBase: number;
    montoActividades: number;
    subtotal: number;
  }> {
    // Calculate base amount from categoria
    const categoriaId = cuota.categoriaId;
    const montoBase = await this.cuotaRepository.getMontoBasePorCategoria(categoriaId);

    // Calculate activities cost
    const montoActividades = await this.calcularCostoActividades(
      cuota.recibo.receptorId.toString(),
      cuota.mes,
      cuota.anio
    ).then(result => result.total);

    const subtotal = montoBase + montoActividades;

    return {
      montoBase,
      montoActividades,
      subtotal
    };
  }

  /**
   * Aplica ajustes manuales y exenciones a un subtotal
   * @private
   */
  private async aplicarAjustesYExenciones(
    receptorId: number,
    mes: number,
    anio: number,
    subtotal: number,
    options: {
      aplicarAjustes?: boolean;
      aplicarExenciones?: boolean;
      aplicarDescuentos?: boolean;
      categoriaId?: number;
      montoBase?: number;
    }
  ): Promise<{
    subtotal: number;
    ajustesAplicados: any[];
    exencionesAplicadas: any[];
  }> {
    let montoActual = subtotal;
    const ajustesAplicados: any[] = [];
    const exencionesAplicadas: any[] = [];

    // Apply manual adjustments
    if (options.aplicarAjustes && this.ajusteService) {
      const fechaCuota = new Date(anio, mes - 1, 1);
      const ajustes = await this.ajusteService.getAjustesActivosParaPeriodo(
        receptorId,
        fechaCuota
      );

      if (ajustes.length > 0) {
        const resultadoAjustes = this.ajusteService.calcularAjustesMultiples(ajustes, montoActual);
        montoActual = resultadoAjustes.montoFinal;
        ajustesAplicados.push(...resultadoAjustes.ajustes);

        logger.debug(
          `[APLICAR AJUSTES] ${ajustes.length} ajustes aplicados, ` +
          `ajuste total: $${resultadoAjustes.totalAjuste.toFixed(2)}`
        );
      }
    }

    // Apply exemptions
    if (options.aplicarExenciones && this.exencionService) {
      const fechaCuota = new Date(anio, mes - 1, 1);
      const exencionCheck = await this.exencionService.checkExencionParaPeriodo(
        receptorId,
        fechaCuota
      );

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

        logger.debug(
          `[APLICAR EXENCIONES] Exención aplicada: ${exencionCheck.porcentaje}%, ` +
          `descuento: $${montoExencion.toFixed(2)}`
        );
      }
    }

    // Apply discount rules
    if (options.aplicarDescuentos && options.categoriaId && options.montoBase !== undefined) {
      const descuentos = await this.calcularDescuentos(
        options.categoriaId,
        options.montoBase,
        receptorId
      );
      montoActual = Math.max(0, montoActual - descuentos.total);
    }

    return {
      subtotal: Math.max(0, montoActual),
      ajustesAplicados,
      exencionesAplicadas
    };
  }

}