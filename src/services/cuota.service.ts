// @ts-nocheck
import { Cuota, CategoriaSocio, TipoRecibo, PrismaClient } from '@prisma/client';
import { CuotaRepository } from '@/repositories/cuota.repository';
import { ReciboRepository } from '@/repositories/recibo.repository';
import { PersonaRepository } from '@/repositories/persona.repository';
import { ConfiguracionRepository } from '@/repositories/configuracion.repository';
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
  ReporteCuotasDto
} from '@/dto/cuota.dto';
import { logger } from '@/utils/logger';
import { prisma } from '@/config/database';
import { hasActiveTipo } from '@/utils/persona.helper';

export class CuotaService {
  constructor(
    private cuotaRepository: CuotaRepository,
    private reciboRepository: ReciboRepository,
    private personaRepository: PersonaRepository,
    private configuracionRepository: ConfiguracionRepository
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
    if (existingCuota.recibo.estado === 'PAGADO') {
      throw new Error(`No se puede modificar una cuota de un recibo pagado`);
    }

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

    // Validar que el recibo asociado no esté pagado
    if (existingCuota.recibo.estado === 'PAGADO') {
      throw new Error(`No se puede eliminar una cuota de un recibo pagado`);
    }

    // Validar que el recibo no tenga medios de pago
    if (existingCuota.recibo.mediosPago && existingCuota.recibo.mediosPago.length > 0) {
      throw new Error(`No se puede eliminar una cuota que tiene medios de pago registrados`);
    }

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

        // Crear recibo primero
        const numeroRecibo = await this.reciboRepository.getNextNumero();
        const recibo = await this.reciboRepository.create({
          numero: numeroRecibo,
          tipo: TipoRecibo.CUOTA,
          receptorId: socio.id,
          importe: montoCuota.montoTotal,
          concepto: `Cuota ${this.getNombreMes(data.mes)} ${data.anio} - ${socio.categoria}`,
          fechaVencimiento: this.calcularFechaVencimiento(data.mes, data.anio),
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

  private calcularFechaVencimiento(mes: number, anio: number): Date {
    // Vencimiento el día 15 del siguiente mes
    const fechaVencimiento = new Date(anio, mes, 15); // mes siguiente (0-indexed)
    return fechaVencimiento;
  }

  private getNombreMes(mes: number): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1] || 'Mes inválido';
  }
}