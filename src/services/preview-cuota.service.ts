import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';
import {
  PreviewCuotaDto,
  PreviewCuotasSocioDto,
  CompararCuotaDto
} from '@/dto/cuota.dto';

/**
 * PreviewCuotaService
 *
 * Servicio para generar vistas previas detalladas de cuotas
 * FASE 5 - Task 5.4: Preview en UI
 *
 * Funcionalidades:
 * - Vista previa de cuota individual con desglose de ítems
 * - Vista previa de múltiples cuotas de un socio
 * - Formato human-readable para UI
 * - Cálculos detallados y explicaciones
 */
export class PreviewCuotaService {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || new PrismaClient();
  }

  /**
   * Genera preview de una cuota existente
   */
  async previewCuota(data: PreviewCuotaDto): Promise<{
    cuota: any;
    desglose?: {
      items: any[];
      calculoDetallado: any;
    };
    explicaciones?: {
      items: string[];
      resumen: string;
    };
    historial?: any[];
  }> {
    try {
      logger.info('[PREVIEW SERVICE] Generando preview de cuota', { data });

      if (!data.cuotaId) {
        throw new Error('Solo se soporta preview de cuotas existentes (cuotaId requerido)');
      }

      // Obtener cuota con todas sus relaciones
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

      // Obtener historial si se solicita
      let historial: any[] = [];
      if (data.incluirHistorialCambios) {
        historial = await this.prisma.historialAjusteCuota.findMany({
          where: { cuotaId: data.cuotaId },
          orderBy: { createdAt: 'desc' },
          take: 10
        });
      }

      // Generar desglose detallado si se solicita
      let desglose: any = undefined;
      if (data.incluirDetalleItems) {
        desglose = this.generarDesglose(cuota);
      }

      // Generar explicaciones si se solicita
      let explicaciones: any = undefined;
      if (data.incluirExplicacionDescuentos) {
        explicaciones = this.generarExplicaciones(cuota, data.formato);
      }

      const resultado: any = {
        cuota: this.formatearCuota(cuota, data.formato),
        desglose,
        explicaciones
      };

      if (historial.length > 0) {
        resultado.historial = historial;
      }

      logger.info('[PREVIEW SERVICE] Preview generado exitosamente', {
        cuotaId: cuota.id,
        itemsCount: cuota.items.length
      });

      return resultado;
    } catch (error) {
      logger.error('[PREVIEW SERVICE] Error al generar preview', { error, data });
      throw error;
    }
  }

  /**
   * Genera preview de múltiples cuotas de un socio
   */
  async previewCuotasSocio(data: PreviewCuotasSocioDto): Promise<{
    socio: any;
    cuotas: any[];
    resumen: {
      totalCuotas: number;
      montoTotal: number;
      desglosePorMes: any[];
    };
  }> {
    try {
      logger.info('[PREVIEW SERVICE] Generando preview de cuotas de socio', { data });

      // Obtener datos del socio
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

      // Obtener recibos del socio en el rango de fechas
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

      // Filtrar cuotas por rango de mes/año
      const cuotasFiltradas = recibos
        .filter(r => r.cuota !== null)
        .map(r => r.cuota)
        .filter(c => {
          if (!c) return false;
          const estaEnRango = this.estaEnRangoFecha(
            c.mes,
            c.anio,
            data.mesDesde,
            data.anioDesde,
            data.mesHasta || data.mesDesde,
            data.anioHasta || data.anioDesde
          );
          return estaEnRango;
        });

      // Calcular resumen
      const montoTotal = cuotasFiltradas.reduce(
        (sum, c) => sum + Number(c!.montoTotal),
        0
      );

      // Desglose por mes
      const desglosePorMes = this.calcularDesglosePorMes(cuotasFiltradas);

      // Formatear cuotas según formato solicitado
      const cuotasFormateadas = cuotasFiltradas.map(cuota =>
        this.formatearCuota(cuota!, data.formato)
      );

      logger.info('[PREVIEW SERVICE] Preview de socio generado', {
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
    } catch (error) {
      logger.error('[PREVIEW SERVICE] Error al generar preview de socio', { error, data });
      throw error;
    }
  }

  /**
   * Compara cuota antes/después de aplicar cambios (simplificado)
   */
  async compararCuota(data: CompararCuotaDto): Promise<{
    antes: any;
    despues: any;
    diferencias: {
      montoTotal: number;
      itemsModificados: number;
    };
    explicacion: string;
  }> {
    try {
      logger.info('[PREVIEW SERVICE] Comparando cuota', { data });

      // Obtener cuota actual
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

      // Estado "ANTES"
      const antes = {
        montoTotal: Number(cuotaActual.montoTotal),
        items: cuotaActual.items.map(item => ({
          tipo: item.tipoItem.nombre,
          monto: Number(item.monto),
          descripcion: item.concepto
        }))
      };

      // Estado "DESPUÉS" (sin cambios si no se proporcionan)
      const despues = data.cambiosPropuestos
        ? this.calcularCuotaConCambios(cuotaActual, data.cambiosPropuestos)
        : { ...antes, itemsModificados: 0 };

      // Diferencias
      const diferencias = {
        montoTotal: despues.montoTotal - antes.montoTotal,
        itemsModificados: despues.itemsModificados || 0
      };

      // Explicación
      const explicacion = this.generarExplicacionComparacion(antes, despues, diferencias);

      logger.info('[PREVIEW SERVICE] Comparación generada', {
        cuotaId: data.cuotaId,
        diferenciaMonto: diferencias.montoTotal
      });

      return {
        antes,
        despues,
        diferencias,
        explicacion
      };
    } catch (error) {
      logger.error('[PREVIEW SERVICE] Error al comparar cuota', { error, data });
      throw error;
    }
  }

  // ========================================
  // MÉTODOS PRIVADOS - HELPERS
  // ========================================

  /**
   * Verifica si una fecha (mes/año) está en un rango
   */
  private estaEnRangoFecha(
    mes: number,
    anio: number,
    mesDesde: number,
    anioDesde: number,
    mesHasta: number,
    anioHasta: number
  ): boolean {
    const fecha = anio * 12 + mes;
    const desde = anioDesde * 12 + mesDesde;
    const hasta = anioHasta * 12 + mesHasta;
    return fecha >= desde && fecha <= hasta;
  }

  /**
   * Calcula desglose por mes
   */
  private calcularDesglosePorMes(cuotas: any[]): any[] {
    const porMes = new Map<string, { mes: number; anio: number; monto: number; cuotas: number }>();

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
      if (a.anio !== b.anio) return a.anio - b.anio;
      return a.mes - b.mes;
    });
  }

  /**
   * Genera desglose detallado de la cuota
   */
  private generarDesglose(cuota: any): any {
    const itemsDesglosados = cuota.items.map((item: any) => ({
      id: item.id,
      tipo: item.tipoItem.nombre,
      categoriaItem: item.tipoItem.categoriaItem.nombre,
      monto: Number(item.monto),
      cantidad: item.cantidad || 1,
      subtotal: Number(item.monto) * (item.cantidad || 1),
      descripcion: item.concepto
    }));

    const calculoDetallado = {
      subtotalItems: itemsDesglosados.reduce((sum: number, item: any) => sum + item.subtotal, 0),
      montoBase: Number(cuota.montoBase || 0),
      montoActividades: Number(cuota.montoActividades || 0),
      montoFinal: Number(cuota.montoTotal)
    };

    return {
      items: itemsDesglosados,
      calculoDetallado
    };
  }

  /**
   * Genera explicaciones human-readable
   */
  private generarExplicaciones(cuota: any, formato: 'COMPLETO' | 'RESUMIDO' | 'SIMPLE' = 'COMPLETO'): any {
    const explicacionesItems: string[] = [];

    // Explicar items
    if (formato === 'COMPLETO' || formato === 'RESUMIDO') {
      cuota.items.forEach((item: any) => {
        const monto = Number(item.monto);
        const cantidad = item.cantidad || 1;
        const subtotal = monto * cantidad;

        if (formato === 'COMPLETO') {
          explicacionesItems.push(
            `${item.tipoItem.nombre}: $${monto.toFixed(2)} × ${cantidad} = $${subtotal.toFixed(2)}`
          );
        } else {
          explicacionesItems.push(`${item.tipoItem.nombre}: $${subtotal.toFixed(2)}`);
        }
      });
    }

    // Generar resumen
    const montoTotal = Number(cuota.montoTotal);
    const subtotalItems = cuota.items.reduce(
      (sum: number, item: any) => sum + Number(item.monto) * (item.cantidad || 1),
      0
    );

    let resumen = `Cuota de ${cuota.categoriaItem?.nombre || 'N/A'} - ${this.getNombreMes(cuota.mes)} ${cuota.anio}\n`;
    resumen += `Subtotal ítems: $${subtotalItems.toFixed(2)}\n`;
    resumen += `TOTAL: $${montoTotal.toFixed(2)}`;

    return {
      items: explicacionesItems,
      resumen
    };
  }

  /**
   * Formatea cuota según formato solicitado
   */
  private formatearCuota(cuota: any, formato: 'COMPLETO' | 'RESUMIDO' | 'SIMPLE' = 'COMPLETO'): any {
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

    // COMPLETO
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

  /**
   * Calcula cuota con cambios propuestos (sin persistir)
   */
  private calcularCuotaConCambios(cuotaActual: any, cambios: any): any {
    let montoTotal = Number(cuotaActual.montoTotal);
    let itemsModificados = 0;

    // Aplicar nuevo descuento si se proporciona
    if (cambios.nuevoDescuento !== undefined) {
      const descuento = (montoTotal * cambios.nuevoDescuento) / 100;
      montoTotal -= descuento;
      itemsModificados++;
    }

    // Aplicar nuevos ajustes
    if (cambios.nuevosAjustes && cambios.nuevosAjustes.length > 0) {
      for (const ajuste of cambios.nuevosAjustes) {
        montoTotal += Number(ajuste.monto);
        itemsModificados++;
      }
    }

    // Aplicar nuevas exenciones
    if (cambios.nuevasExenciones && cambios.nuevasExenciones.length > 0) {
      for (const exencion of cambios.nuevasExenciones) {
        // Buscar item correspondiente
        const item = cuotaActual.items.find(
          (i: any) => i.tipoItemId === exencion.tipoItemCuotaId
        );
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

  /**
   * Genera explicación de comparación
   */
  private generarExplicacionComparacion(antes: any, despues: any, diferencias: any): string {
    let explicacion = '';

    if (diferencias.montoTotal === 0) {
      explicacion = 'Los cambios propuestos no modifican el monto total de la cuota.';
    } else if (diferencias.montoTotal > 0) {
      explicacion = `Los cambios propuestos AUMENTAN la cuota en $${diferencias.montoTotal.toFixed(2)}. `;
      explicacion += `Nuevo total: $${despues.montoTotal.toFixed(2)} (antes: $${antes.montoTotal.toFixed(2)}).`;
    } else {
      explicacion = `Los cambios propuestos REDUCEN la cuota en $${Math.abs(diferencias.montoTotal).toFixed(2)}. `;
      explicacion += `Nuevo total: $${despues.montoTotal.toFixed(2)} (antes: $${antes.montoTotal.toFixed(2)}).`;
    }

    if (diferencias.itemsModificados > 0) {
      explicacion += ` Se modificarán ${diferencias.itemsModificados} ítem(s).`;
    }

    return explicacion;
  }

  /**
   * Obtiene nombre del mes en español
   */
  private getNombreMes(mes: number): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1] || `Mes ${mes}`;
  }
}
