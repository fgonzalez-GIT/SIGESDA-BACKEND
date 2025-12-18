// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import {
  RollbackGeneracionDto,
  RollbackCuotaDto,
  ValidarRollbackDto
} from '@/dto/cuota.dto';
import { logger } from '@/utils/logger';
import { prisma } from '@/config/database';
import * as fs from 'fs';
import * as path from 'path';

/**
 * RollbackCuotaService
 *
 * Servicio para deshacer generaciones de cuotas con seguridad.
 * Útil para:
 * - Deshacer generaciones masivas erróneas
 * - Restaurar estado anterior de cuotas
 * - Validar integridad antes de rollback
 *
 * FASE 5 - Task 5.3: Rollback de generación
 */
export class RollbackCuotaService {
  private get prisma() {
    return prisma;
  }

  /**
   * Hace rollback de generación masiva de cuotas para un período
   * Modo PREVIEW: Muestra qué se eliminaría sin hacerlo
   * Modo APLICAR: Elimina cuotas y restaura estado con backup
   */
  async rollbackGeneracion(data: RollbackGeneracionDto): Promise<{
    modo: 'PREVIEW' | 'APLICAR';
    cuotasAfectadas: number;
    cuotasEliminables: number;
    cuotasBloqueadas: number;
    recibosAfectados: number;
    itemsAfectados: number;
    montoTotalAfectado: number;
    advertencias: string[];
    errores: string[];
    backupPath?: string;
    detalleCuotas: any[];
  }> {
    logger.info(
      `[ROLLBACK] Iniciando rollback de generación ${data.mes}/${data.anio} en modo ${data.modo}`
    );

    // STEP 1: Obtener cuotas del período
    const cuotasAfectadas = await this.obtenerCuotasPeriodo(data);

    if (cuotasAfectadas.length === 0) {
      logger.warn(`[ROLLBACK] No se encontraron cuotas para el período ${data.mes}/${data.anio}`);
      return {
        modo: data.modo,
        cuotasAfectadas: 0,
        cuotasEliminables: 0,
        cuotasBloqueadas: 0,
        recibosAfectados: 0,
        itemsAfectados: 0,
        montoTotalAfectado: 0,
        advertencias: ['No se encontraron cuotas para el período especificado'],
        errores: [],
        detalleCuotas: []
      };
    }

    logger.debug(`[ROLLBACK] ${cuotasAfectadas.length} cuotas encontradas`);

    // STEP 2: Clasificar cuotas (eliminables vs bloqueadas)
    const clasificacion = this.clasificarCuotas(cuotasAfectadas, data.opciones);

    // STEP 3: Validar si hay errores que bloquean el rollback
    const errores = this.validarRollback(clasificacion, data);

    if (errores.length > 0 && data.modo === 'APLICAR') {
      logger.error(`[ROLLBACK] Errores de validación: ${errores.join(', ')}`);
      return {
        modo: data.modo,
        cuotasAfectadas: cuotasAfectadas.length,
        cuotasEliminables: clasificacion.eliminables.length,
        cuotasBloqueadas: clasificacion.bloqueadas.length,
        recibosAfectados: 0,
        itemsAfectados: 0,
        montoTotalAfectado: 0,
        advertencias: [],
        errores,
        detalleCuotas: []
      };
    }

    // STEP 4: Generar advertencias
    const advertencias = this.generarAdvertencias(clasificacion, data);

    // STEP 5: Calcular estadísticas
    const estadisticas = this.calcularEstadisticas(clasificacion);

    // STEP 6: Si modo es APLICAR, ejecutar rollback
    let backupPath: string | undefined;
    if (data.modo === 'APLICAR') {
      // Crear backup si está habilitado
      if (data.opciones?.crearBackup !== false) {
        backupPath = await this.crearBackup(clasificacion.eliminables, data);
        logger.info(`[ROLLBACK] Backup creado en: ${backupPath}`);
      }

      // Ejecutar rollback en transacción
      await this.ejecutarRollback(clasificacion.eliminables, data);

      logger.info(
        `[ROLLBACK] Rollback aplicado: ${clasificacion.eliminables.length} cuotas eliminadas, ` +
        `${estadisticas.recibosAfectados} recibos, ${estadisticas.itemsAfectados} ítems`
      );
    } else {
      logger.info(
        `[ROLLBACK] Preview generado: ${clasificacion.eliminables.length} cuotas serían eliminadas`
      );
    }

    return {
      modo: data.modo,
      cuotasAfectadas: cuotasAfectadas.length,
      cuotasEliminables: clasificacion.eliminables.length,
      cuotasBloqueadas: clasificacion.bloqueadas.length,
      recibosAfectados: estadisticas.recibosAfectados,
      itemsAfectados: estadisticas.itemsAfectados,
      montoTotalAfectado: estadisticas.montoTotal,
      advertencias,
      errores,
      backupPath,
      detalleCuotas: this.generarDetalleCuotas(clasificacion)
    };
  }

  /**
   * Hace rollback de una cuota individual
   */
  async rollbackCuota(data: RollbackCuotaDto): Promise<{
    modo: 'PREVIEW' | 'APLICAR';
    cuotaEliminada: boolean;
    reciboEliminado: boolean;
    itemsEliminados: number;
    advertencias: string[];
    errores: string[];
    detalle: any;
  }> {
    logger.info(`[ROLLBACK CUOTA] Iniciando rollback de cuota ${data.cuotaId} en modo ${data.modo}`);

    // STEP 1: Obtener cuota
    const cuota = await this.prisma.cuota.findUnique({
      where: { id: data.cuotaId },
      include: {
        recibo: true,
        items: true
      }
    });

    if (!cuota) {
      return {
        modo: data.modo,
        cuotaEliminada: false,
        reciboEliminado: false,
        itemsEliminados: 0,
        advertencias: [],
        errores: ['Cuota no encontrada'],
        detalle: null
      };
    }

    // STEP 2: Validar si se puede eliminar
    const errores: string[] = [];
    const advertencias: string[] = [];

    if (cuota.recibo.estado === 'PAGADO') {
      errores.push('No se puede eliminar una cuota con recibo PAGADO');
    }

    if (cuota.recibo.mediosPago && cuota.recibo.mediosPago.length > 0) {
      errores.push('No se puede eliminar una cuota con medios de pago asociados');
    }

    if (errores.length > 0 && data.modo === 'APLICAR') {
      return {
        modo: data.modo,
        cuotaEliminada: false,
        reciboEliminado: false,
        itemsEliminados: 0,
        advertencias,
        errores,
        detalle: null
      };
    }

    // STEP 3: Si modo es APLICAR, eliminar
    if (data.modo === 'APLICAR') {
      await this.prisma.$transaction(async (tx) => {
        // Eliminar ítems
        if (data.eliminarItemsAsociados) {
          await tx.itemCuota.deleteMany({
            where: { cuotaId: data.cuotaId }
          });
        }

        // Eliminar historial
        await tx.historialCuota.deleteMany({
          where: { cuotaId: data.cuotaId }
        });

        // Eliminar cuota
        await tx.cuota.delete({
          where: { id: data.cuotaId }
        });

        // Eliminar recibo si está habilitado
        if (data.eliminarRecibo) {
          await tx.recibo.delete({
            where: { id: cuota.reciboId }
          });
        }

        logger.info(`[ROLLBACK CUOTA] Cuota ${data.cuotaId} eliminada exitosamente`);
      });
    }

    return {
      modo: data.modo,
      cuotaEliminada: data.modo === 'APLICAR',
      reciboEliminado: data.modo === 'APLICAR' && data.eliminarRecibo,
      itemsEliminados: cuota.items.length,
      advertencias,
      errores,
      detalle: {
        cuotaId: cuota.id,
        reciboId: cuota.reciboId,
        mes: cuota.mes,
        anio: cuota.anio,
        montoTotal: cuota.montoTotal,
        estado: cuota.recibo.estado
      }
    };
  }

  /**
   * Valida si se puede hacer rollback de un período
   */
  async validarRollback(data: ValidarRollbackDto): Promise<{
    puedeHacerRollback: boolean;
    cuotasTotal: number;
    cuotasEliminables: number;
    cuotasBloqueadas: number;
    advertencias: string[];
    errores: string[];
  }> {
    const cuotas = await this.obtenerCuotasPeriodo({
      mes: data.mes,
      anio: data.anio,
      categoriaIds: data.categoriaIds,
      socioIds: data.socioIds,
      modo: 'PREVIEW'
    });

    const clasificacion = this.clasificarCuotas(cuotas, {
      eliminarCuotasPendientes: true,
      eliminarCuotasPagadas: false,
      restaurarRecibos: true,
      crearBackup: true
    });

    const errores = this.validarRollback(clasificacion, { modo: 'PREVIEW' } as any);
    const advertencias = this.generarAdvertencias(clasificacion, { modo: 'PREVIEW' } as any);

    return {
      puedeHacerRollback: errores.length === 0,
      cuotasTotal: cuotas.length,
      cuotasEliminables: clasificacion.eliminables.length,
      cuotasBloqueadas: clasificacion.bloqueadas.length,
      advertencias,
      errores
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MÉTODOS PRIVADOS AUXILIARES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Obtiene cuotas del período con filtros
   */
  private async obtenerCuotasPeriodo(data: any): Promise<any[]> {
    const whereConditions: any = {
      mes: data.mes,
      anio: data.anio
    };

    if (data.categoriaIds && data.categoriaIds.length > 0) {
      whereConditions.categoriaId = { in: data.categoriaIds };
    }

    if (data.socioIds && data.socioIds.length > 0) {
      whereConditions.recibo = {
        receptorId: { in: data.socioIds }
      };
    }

    const cuotas = await this.prisma.cuota.findMany({
      where: whereConditions,
      include: {
        recibo: {
          include: {
            receptor: true,
            mediosPago: true
          }
        },
        items: true
      }
    });

    return cuotas;
  }

  /**
   * Clasifica cuotas en eliminables vs bloqueadas
   */
  private clasificarCuotas(cuotas: any[], opciones: any): {
    eliminables: any[];
    bloqueadas: any[];
  } {
    const eliminables: any[] = [];
    const bloqueadas: any[] = [];

    for (const cuota of cuotas) {
      let puedeEliminar = false;

      // Reglas de eliminación
      if (cuota.recibo.estado === 'PENDIENTE' && opciones?.eliminarCuotasPendientes) {
        puedeEliminar = true;
      }

      if (cuota.recibo.estado === 'PAGADO' && opciones?.eliminarCuotasPagadas) {
        puedeEliminar = true;
      }

      // Bloqueos absolutos
      if (cuota.recibo.mediosPago && cuota.recibo.mediosPago.length > 0) {
        puedeEliminar = false;
      }

      if (puedeEliminar) {
        eliminables.push(cuota);
      } else {
        bloqueadas.push(cuota);
      }
    }

    return { eliminables, bloqueadas };
  }

  /**
   * Valida errores que bloquean el rollback
   */
  private validarRollback(clasificacion: any, data: any): string[] {
    const errores: string[] = [];

    // Error si hay cuotas bloqueadas y no se permiten
    if (clasificacion.bloqueadas.length > 0 && !data.opciones?.eliminarCuotasPagadas) {
      const cuotasPagadas = clasificacion.bloqueadas.filter(
        (c: any) => c.recibo.estado === 'PAGADO'
      ).length;

      if (cuotasPagadas > 0) {
        errores.push(
          `${cuotasPagadas} cuotas tienen recibos PAGADOS. Active 'eliminarCuotasPagadas' para forzar eliminación (NO RECOMENDADO).`
        );
      }
    }

    // Error si modo APLICAR sin confirmación
    if (data.modo === 'APLICAR' && !data.confirmarRollback) {
      errores.push('Debe confirmar el rollback para aplicar.');
    }

    // Error si modo APLICAR sin motivo
    if (data.modo === 'APLICAR' && !data.motivo) {
      errores.push('Debe proporcionar un motivo para el rollback.');
    }

    return errores;
  }

  /**
   * Genera advertencias
   */
  private generarAdvertencias(clasificacion: any, data: any): string[] {
    const advertencias: string[] = [];

    if (clasificacion.eliminables.length > 50) {
      advertencias.push(
        `ADVERTENCIA: Se eliminarán ${clasificacion.eliminables.length} cuotas. Esta operación es IRREVERSIBLE.`
      );
    }

    if (clasificacion.bloqueadas.length > 0) {
      advertencias.push(
        `${clasificacion.bloqueadas.length} cuotas NO serán eliminadas (tienen pagos asociados o están pagadas).`
      );
    }

    const montoTotal = clasificacion.eliminables.reduce(
      (sum: number, c: any) => sum + c.montoTotal,
      0
    );

    if (montoTotal > 100000) {
      advertencias.push(
        `El monto total afectado es $${montoTotal.toFixed(2)}. Verifique que sea correcto.`
      );
    }

    return advertencias;
  }

  /**
   * Calcula estadísticas del rollback
   */
  private calcularEstadisticas(clasificacion: any): {
    recibosAfectados: number;
    itemsAfectados: number;
    montoTotal: number;
  } {
    const recibosAfectados = clasificacion.eliminables.length;
    const itemsAfectados = clasificacion.eliminables.reduce(
      (sum: number, c: any) => sum + c.items.length,
      0
    );
    const montoTotal = clasificacion.eliminables.reduce(
      (sum: number, c: any) => sum + c.montoTotal,
      0
    );

    return {
      recibosAfectados,
      itemsAfectados,
      montoTotal
    };
  }

  /**
   * Crea backup de las cuotas antes de eliminar
   */
  private async crearBackup(cuotas: any[], data: any): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(process.cwd(), 'backups', 'rollback-cuotas');

    // Crear directorio si no existe
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupPath = path.join(
      backupDir,
      `rollback-${data.mes}-${data.anio}-${timestamp}.json`
    );

    const backupData = {
      timestamp: new Date().toISOString(),
      periodo: { mes: data.mes, anio: data.anio },
      motivo: data.motivo,
      cuotasCount: cuotas.length,
      cuotas: cuotas.map(c => ({
        id: c.id,
        reciboId: c.reciboId,
        categoria: c.categoria,
        mes: c.mes,
        anio: c.anio,
        montoBase: c.montoBase,
        montoActividades: c.montoActividades,
        montoTotal: c.montoTotal,
        recibo: {
          id: c.recibo.id,
          numero: c.recibo.numero,
          tipo: c.recibo.tipo,
          receptorId: c.recibo.receptorId,
          importe: c.recibo.importe,
          estado: c.recibo.estado,
          fechaVencimiento: c.recibo.fechaVencimiento
        },
        items: c.items
      }))
    };

    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf-8');

    return backupPath;
  }

  /**
   * Ejecuta el rollback en transacción
   */
  private async ejecutarRollback(cuotas: any[], data: any): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      for (const cuota of cuotas) {
        // Eliminar ítems
        await tx.itemCuota.deleteMany({
          where: { cuotaId: cuota.id }
        });

        // Eliminar historial
        await tx.historialCuota.deleteMany({
          where: { cuotaId: cuota.id }
        });

        // Eliminar cuota
        await tx.cuota.delete({
          where: { id: cuota.id }
        });

        // Eliminar recibo si está habilitado
        if (data.opciones?.restaurarRecibos !== false) {
          await tx.recibo.delete({
            where: { id: cuota.reciboId }
          });
        }
      }

      // Registrar rollback en log (si existiera tabla de auditoría global)
      logger.info(
        `[ROLLBACK TRANSACTION] ${cuotas.length} cuotas eliminadas. Motivo: ${data.motivo}`
      );
    });
  }

  /**
   * Genera detalle de cuotas para response
   */
  private generarDetalleCuotas(clasificacion: any): any[] {
    return clasificacion.eliminables.map((c: any) => ({
      cuotaId: c.id,
      reciboId: c.reciboId,
      socioId: c.recibo.receptorId,
      numeroSocio: c.recibo.receptor.numeroSocio,
      nombreCompleto: `${c.recibo.receptor.nombre} ${c.recibo.receptor.apellido}`,
      mes: c.mes,
      anio: c.anio,
      montoTotal: c.montoTotal,
      estado: c.recibo.estado,
      itemsCount: c.items.length,
      puedeEliminar: true
    })).concat(
      clasificacion.bloqueadas.map((c: any) => ({
        cuotaId: c.id,
        reciboId: c.reciboId,
        socioId: c.recibo.receptorId,
        numeroSocio: c.recibo.receptor.numeroSocio,
        nombreCompleto: `${c.recibo.receptor.nombre} ${c.recibo.receptor.apellido}`,
        mes: c.mes,
        anio: c.anio,
        montoTotal: c.montoTotal,
        estado: c.recibo.estado,
        itemsCount: c.items.length,
        puedeEliminar: false,
        razonBloqueo: c.recibo.mediosPago?.length > 0
          ? 'Tiene medios de pago asociados'
          : 'Recibo pagado'
      }))
    );
  }
}
