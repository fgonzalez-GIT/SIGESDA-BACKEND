// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import {
  AjusteMasivoDto,
  ModificarItemsMasivoDto,
  DescuentoGlobalDto
} from '@/dto/cuota.dto';
import { logger } from '@/utils/logger';
import { prisma } from '@/config/database';
import { CuotaRepository } from '@/repositories/cuota.repository';
import { ItemCuotaRepository } from '@/repositories/item-cuota.repository';
import { HistorialAjusteCuotaRepository } from '@/repositories/historial-ajuste-cuota.repository';

/**
 * AjusteMasivoService
 *
 * Servicio para aplicar modificaciones masivas a cuotas e ítems.
 * Útil para:
 * - Aplicar descuentos/recargos globales
 * - Modificar múltiples ítems en batch
 * - Ajustes masivos por categoría/período
 *
 * FASE 5 - Task 5.2: Herramienta de ajuste masivo
 */
export class AjusteMasivoService {
  private cuotaRepository: CuotaRepository;
  private itemCuotaRepository: ItemCuotaRepository;
  private historialRepository: HistorialAjusteCuotaRepository;

  constructor(
    cuotaRepository?: CuotaRepository,
    itemCuotaRepository?: ItemCuotaRepository,
    historialRepository?: HistorialAjusteCuotaRepository
  ) {
    this.cuotaRepository = cuotaRepository || new CuotaRepository();
    this.itemCuotaRepository = itemCuotaRepository || new ItemCuotaRepository();
    this.historialRepository = historialRepository || new HistorialAjusteCuotaRepository(prisma);
  }

  private get prisma() {
    return prisma;
  }

  /**
   * Aplica ajuste masivo a múltiples cuotas
   * Modo PREVIEW: Retorna vista previa sin persistir
   * Modo APLICAR: Persiste cambios en BD con auditoría
   */
  async aplicarAjusteMasivo(data: AjusteMasivoDto): Promise<{
    modo: 'PREVIEW' | 'APLICAR';
    cuotasAfectadas: number;
    itemsModificados: number;
    montoTotalOriginal: number;
    montoTotalNuevo: number;
    impactoEconomico: number;
    advertencias: string[];
    errores: string[];
    detalleCuotas: any[];
  }> {
    logger.info(
      `[AJUSTE MASIVO] Iniciando ajuste masivo en modo ${data.modo}`
    );

    // STEP 1: Obtener cuotas que coinciden con filtros
    const cuotasAfectadas = await this.obtenerCuotasConFiltros(data.filtros);

    if (cuotasAfectadas.length === 0) {
      logger.warn(`[AJUSTE MASIVO] No se encontraron cuotas que coincidan con los filtros`);
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

    logger.debug(`[AJUSTE MASIVO] ${cuotasAfectadas.length} cuotas encontradas`);

    // STEP 2: Filtrar por condiciones adicionales
    const cuotasElegibles = this.aplicarCondiciones(cuotasAfectadas, data.condiciones);

    logger.debug(`[AJUSTE MASIVO] ${cuotasElegibles.length} cuotas elegibles después de aplicar condiciones`);

    // STEP 3: Calcular ajustes
    const resultado = await this.calcularAjustes(cuotasElegibles, data);

    // STEP 4: Generar advertencias
    const advertencias = this.generarAdvertencias(resultado, data);

    // STEP 5: Validar (errores que bloquean la aplicación)
    const errores = this.validarAjustes(resultado, data);

    if (errores.length > 0 && data.modo === 'APLICAR') {
      logger.error(`[AJUSTE MASIVO] Errores de validación encontrados: ${errores.join(', ')}`);
      return {
        ...resultado,
        errores,
        advertencias
      };
    }

    // STEP 6: Si modo es APLICAR, persistir cambios
    if (data.modo === 'APLICAR') {
      await this.persistirAjustes(resultado, data);
      logger.info(
        `[AJUSTE MASIVO] Ajustes aplicados: ${resultado.cuotasAfectadas} cuotas, ` +
        `${resultado.itemsModificados} ítems, impacto: $${resultado.impactoEconomico.toFixed(2)}`
      );
    } else {
      logger.info(
        `[AJUSTE MASIVO] Preview generado: ${resultado.cuotasAfectadas} cuotas afectadas`
      );
    }

    return {
      ...resultado,
      advertencias,
      errores
    };
  }

  /**
   * Modifica múltiples ítems de cuotas en batch
   */
  async modificarItemsMasivo(data: ModificarItemsMasivoDto): Promise<{
    modo: 'PREVIEW' | 'APLICAR';
    itemsAfectados: number;
    cuotasAfectadas: number;
    montoTotalOriginal: number;
    montoTotalNuevo: number;
    impactoEconomico: number;
    advertencias: string[];
    errores: string[];
    detalleItems: any[];
  }> {
    logger.info(
      `[MODIFICAR ITEMS] Iniciando modificación masiva en modo ${data.modo}`
    );

    // STEP 1: Obtener ítems que coinciden con filtros
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

    logger.debug(`[MODIFICAR ITEMS] ${itemsAfectados.length} ítems encontrados`);

    // STEP 2: Calcular modificaciones
    const resultado = await this.calcularModificaciones(itemsAfectados, data);

    // STEP 3: Validar
    const errores = this.validarModificaciones(resultado, data);
    const advertencias = this.generarAdvertenciasItems(resultado, data);

    if (errores.length > 0 && data.modo === 'APLICAR') {
      return {
        ...resultado,
        errores,
        advertencias
      };
    }

    // STEP 4: Si modo es APLICAR, persistir
    if (data.modo === 'APLICAR') {
      await this.persistirModificaciones(resultado, data);
      logger.info(
        `[MODIFICAR ITEMS] Modificaciones aplicadas: ${resultado.itemsAfectados} ítems`
      );
    }

    return {
      ...resultado,
      advertencias,
      errores
    };
  }

  /**
   * Aplica descuento global a todas las cuotas de un período
   */
  async aplicarDescuentoGlobal(data: DescuentoGlobalDto): Promise<{
    modo: 'PREVIEW' | 'APLICAR';
    cuotasAfectadas: number;
    montoTotalOriginal: number;
    montoTotalNuevo: number;
    descuentoTotal: number;
    advertencias: string[];
    errores: string[];
    detalleCuotas: any[];
  }> {
    logger.info(
      `[DESCUENTO GLOBAL] Aplicando descuento global ${data.tipoDescuento} ${data.valor} para ${data.mes}/${data.anio}`
    );

    // Convertir a ajuste masivo
    const ajusteMasivo: AjusteMasivoDto = {
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

  // ═══════════════════════════════════════════════════════════════════════════
  // MÉTODOS PRIVADOS AUXILIARES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Obtiene cuotas que coinciden con los filtros
   */
  private async obtenerCuotasConFiltros(filtros: any): Promise<any[]> {
    const whereConditions: any = {};

    if (filtros.mes) whereConditions.mes = filtros.mes;
    if (filtros.anio) whereConditions.anio = filtros.anio;
    if (filtros.categoriaIds && filtros.categoriaIds.length > 0) {
      whereConditions.categoriaId = { in: filtros.categoriaIds };
    }
    if (filtros.estadoCuota) {
      whereConditions.recibo = {
        estado: filtros.estadoCuota
      };
    }

    // Si se especifican socios, filtrar por reciboId
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

  /**
   * Aplica condiciones adicionales de filtrado
   */
  private aplicarCondiciones(cuotas: any[], condiciones?: any): any[] {
    if (!condiciones) return cuotas;

    return cuotas.filter(cuota => {
      // Filtro por monto mínimo
      if (condiciones.montoMinimo && cuota.montoTotal < condiciones.montoMinimo) {
        return false;
      }

      // Filtro por monto máximo
      if (condiciones.montoMaximo && cuota.montoTotal > condiciones.montoMaximo) {
        return false;
      }

      // Filtro: solo cuotas con descuentos aplicados
      if (condiciones.soloConDescuentos) {
        const tieneDescuentos = cuota.items.some((item: any) =>
          item.monto < 0 || item.tipoItem.categoriaItem.codigo === 'DESCUENTO'
        );
        if (!tieneDescuentos) return false;
      }

      // Filtro: solo cuotas sin exenciones
      if (condiciones.soloSinExenciones) {
        const tieneExenciones = cuota.items.some((item: any) =>
          item.tipoItem.categoriaItem.codigo === 'EXENCION'
        );
        if (tieneExenciones) return false;
      }

      return true;
    });
  }

  /**
   * Calcula los ajustes a aplicar
   */
  private async calcularAjustes(cuotas: any[], data: AjusteMasivoDto): Promise<any> {
    let montoTotalOriginal = 0;
    let montoTotalNuevo = 0;
    let itemsModificados = 0;
    const detalleCuotas: any[] = [];

    for (const cuota of cuotas) {
      const montoOriginal = cuota.montoTotal;
      let montoNuevo = montoOriginal;

      // Aplicar ajuste según tipo
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

  /**
   * Genera advertencias basadas en el resultado
   */
  private generarAdvertencias(resultado: any, data: AjusteMasivoDto): string[] {
    const advertencias: string[] = [];

    // Advertencia si impacto es muy alto
    const porcentajeImpacto = resultado.montoTotalOriginal > 0
      ? Math.abs(resultado.impactoEconomico / resultado.montoTotalOriginal) * 100
      : 0;

    if (porcentajeImpacto > 20) {
      advertencias.push(
        `Impacto económico significativo: ${porcentajeImpacto.toFixed(1)}% (${resultado.impactoEconomico >= 0 ? '+' : ''}$${resultado.impactoEconomico.toFixed(2)})`
      );
    }

    // Advertencia si afecta muchas cuotas
    if (resultado.cuotasAfectadas > 100) {
      advertencias.push(
        `Se modificarán ${resultado.cuotasAfectadas} cuotas. Considere realizar en horario de baja demanda.`
      );
    }

    // Advertencia si incluye cuotas pagadas
    const cuotasPagadas = resultado.detalleCuotas.filter((c: any) =>
      c.estadoCuota === 'PAGADO'
    ).length;

    if (cuotasPagadas > 0) {
      advertencias.push(
        `ATENCIÓN: ${cuotasPagadas} cuotas ya están PAGADAS. Modificarlas puede generar inconsistencias.`
      );
    }

    return advertencias;
  }

  /**
   * Valida ajustes antes de aplicar
   */
  private validarAjustes(resultado: any, data: AjusteMasivoDto): string[] {
    const errores: string[] = [];

    // Error si monto final negativo
    const montosNegativos = resultado.detalleCuotas.filter((c: any) => c.montoNuevo < 0);
    if (montosNegativos.length > 0) {
      errores.push(
        `${montosNegativos.length} cuotas quedarían con monto negativo. Ajuste el valor del ajuste.`
      );
    }

    // Error si modo APLICAR sin confirmación
    if (data.modo === 'APLICAR' && !data.confirmarAplicacion) {
      errores.push('Debe confirmar la aplicación del ajuste masivo.');
    }

    return errores;
  }

  /**
   * Persiste los ajustes en la base de datos
   */
  private async persistirAjustes(resultado: any, data: AjusteMasivoDto): Promise<void> {
    // Usar transacción para garantizar atomicidad
    await this.prisma.$transaction(async (tx) => {
      for (const detalle of resultado.detalleCuotas) {
        if (detalle.montoOriginal === detalle.montoNuevo) continue;

        // Actualizar cuota
        await tx.cuota.update({
          where: { id: detalle.cuotaId },
          data: {
            montoTotal: detalle.montoNuevo
          }
        });

        // Crear ítem de ajuste
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

        // Registrar en historial
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

  /**
   * Obtiene ítems que coinciden con filtros
   */
  private async obtenerItemsConFiltros(filtros: any): Promise<any[]> {
    const whereConditions: any = {};

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

    // Filtrar por mes/año de la cuota
    if (filtros.mes || filtros.anio) {
      whereConditions.cuota = {};
      if (filtros.mes) whereConditions.cuota.mes = filtros.mes;
      if (filtros.anio) whereConditions.cuota.anio = filtros.anio;
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

  /**
   * Calcula modificaciones a aplicar a ítems
   */
  private async calcularModificaciones(items: any[], data: ModificarItemsMasivoDto): Promise<any> {
    let montoTotalOriginal = 0;
    let montoTotalNuevo = 0;
    const cuotasAfectadasSet = new Set<number>();
    const detalleItems: any[] = [];

    for (const item of items) {
      const montoOriginal = item.monto;
      let montoNuevo = montoOriginal;
      let conceptoNuevo = item.concepto;

      // Aplicar modificaciones
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

  /**
   * Valida modificaciones de ítems
   */
  private validarModificaciones(resultado: any, data: ModificarItemsMasivoDto): string[] {
    const errores: string[] = [];

    // Validar que no haya montos negativos (a menos que sea un descuento)
    const montosInvalidos = resultado.detalleItems.filter((item: any) =>
      item.montoNuevo < 0 && item.montoOriginal >= 0
    );

    if (montosInvalidos.length > 0) {
      errores.push(`${montosInvalidos.length} ítems tendrían monto negativo inválido.`);
    }

    return errores;
  }

  /**
   * Genera advertencias para modificación de ítems
   */
  private generarAdvertenciasItems(resultado: any, data: ModificarItemsMasivoDto): string[] {
    const advertencias: string[] = [];

    if (resultado.itemsAfectados > 500) {
      advertencias.push(
        `Se modificarán ${resultado.itemsAfectados} ítems en ${resultado.cuotasAfectadas} cuotas. Esto puede tardar varios minutos.`
      );
    }

    return advertencias;
  }

  /**
   * Persiste modificaciones de ítems
   */
  private async persistirModificaciones(resultado: any, data: ModificarItemsMasivoDto): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      for (const detalle of resultado.detalleItems) {
        await tx.itemCuota.update({
          where: { id: detalle.itemId },
          data: {
            concepto: detalle.conceptoNuevo,
            monto: detalle.montoNuevo
          }
        });

        // Actualizar monto total de la cuota
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

          // Historial
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
