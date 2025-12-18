// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import { CuotaService } from './cuota.service';
import { MotorReglasDescuentos } from './motor-reglas-descuentos.service';
import { AjusteCuotaService } from './ajuste-cuota.service';
import { ExencionCuotaService } from './exencion-cuota.service';
import {
  SimularGeneracionDto,
  SimularReglaDescuentoDto,
  CompararEscenariosDto,
  SimularImpactoMasivoDto
} from '@/dto/cuota.dto';
import { logger } from '@/utils/logger';
import { prisma } from '@/config/database';
import { hasActiveTipo } from '@/utils/persona.helper';
import {
  getCategoriaIdByCodigo,
  getCategoriaCodigoByCategoriaId
} from '@/utils/categoria.helper';
import {
  getNombreMes,
  calcularFechaVencimiento
} from '@/utils/date.helper';

/**
 * SimuladorCuotaService
 *
 * Servicio para simular generación y cálculo de cuotas sin persistir en BD.
 * Útil para:
 * - Preview de cuotas antes de generar
 * - Simulación de cambios en reglas de descuento
 * - Comparación de diferentes escenarios
 * - Cálculo de impacto de cambios de configuración
 *
 * FASE 5 - Task 5.1: Simulador de impacto
 */
export class SimuladorCuotaService {
  private cuotaService: CuotaService;
  private motorReglasDescuentos: MotorReglasDescuentos;
  private ajusteService?: AjusteCuotaService;
  private exencionService?: ExencionCuotaService;

  constructor(
    cuotaService: CuotaService,
    motorReglasDescuentos: MotorReglasDescuentos,
    ajusteService?: AjusteCuotaService,
    exencionService?: ExencionCuotaService
  ) {
    this.cuotaService = cuotaService;
    this.motorReglasDescuentos = motorReglasDescuentos;
    this.ajusteService = ajusteService;
    this.exencionService = exencionService;
  }

  private get prisma() {
    return prisma;
  }

  /**
   * Simula la generación de cuotas para un período sin persistir en BD
   * Retorna preview de cuotas que se crearían
   */
  async simularGeneracion(data: SimularGeneracionDto): Promise<{
    cuotasSimuladas: any[];
    resumen: {
      totalCuotas: number;
      montoTotal: number;
      montoPorCategoria: Record<string, number>;
      sociosAfectados: number;
      descuentosAplicados: number;
      ajustesAplicados: number;
      exencionesAplicadas: number;
    };
    detalleCalculo: any[];
  }> {
    logger.info(
      `[SIMULADOR] Iniciando simulación de generación para ${data.mes}/${data.anio}`
    );

    // STEP 1: Obtener socios elegibles
    const sociosElegibles = await this.obtenerSociosElegibles(data);

    if (sociosElegibles.length === 0) {
      logger.warn(`[SIMULADOR] No se encontraron socios elegibles para el período`);
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

    logger.debug(
      `[SIMULADOR] ${sociosElegibles.length} socios elegibles encontrados`
    );

    // STEP 2: Simular cálculo de cuota para cada socio
    const cuotasSimuladas: any[] = [];
    const detalleCalculo: any[] = [];
    const resumen = {
      totalCuotas: 0,
      montoTotal: 0,
      montoPorCategoria: {} as Record<string, number>,
      sociosAfectados: 0,
      descuentosAplicados: 0,
      ajustesAplicados: 0,
      exencionesAplicadas: 0
    };

    for (const socio of sociosElegibles) {
      try {
        // Calcular monto de cuota sin persistir
        const calculoCuota = await this.calcularCuotaSimulada({
          socioId: socio.id,
          categoriaId: socio.categoriaId,
          mes: data.mes,
          anio: data.anio,
          aplicarDescuentos: data.aplicarDescuentos,
          aplicarAjustes: data.aplicarAjustes,
          aplicarExenciones: data.aplicarExenciones
        });

        // Crear objeto simulado de cuota (no se persiste)
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
          fechaVencimiento: calcularFechaVencimiento(data.mes, data.anio),
          concepto: `Cuota ${getNombreMes(data.mes)} ${data.anio} - ${socio.categoria}`,
          detalleCalculo: calculoCuota.detalle
        };

        cuotasSimuladas.push(cuotaSimulada);

        // Actualizar resumen
        resumen.totalCuotas++;
        resumen.montoTotal += calculoCuota.montoTotal;
        resumen.sociosAfectados++;

        if (!resumen.montoPorCategoria[socio.categoria]) {
          resumen.montoPorCategoria[socio.categoria] = 0;
        }
        resumen.montoPorCategoria[socio.categoria] += calculoCuota.montoTotal;

        if (calculoCuota.descuentos > 0) resumen.descuentosAplicados++;
        if (calculoCuota.ajustes.length > 0) resumen.ajustesAplicados++;
        if (calculoCuota.exenciones.length > 0) resumen.exencionesAplicadas++;

        // Agregar detalle de cálculo
        detalleCalculo.push({
          socioId: socio.id,
          numeroSocio: socio.numeroSocio,
          pasos: calculoCuota.detalle
        });

      } catch (error) {
        logger.error(
          `[SIMULADOR] Error simulando cuota para socio ${socio.numeroSocio}: ${error}`
        );
      }
    }

    logger.info(
      `[SIMULADOR] Simulación completada: ${resumen.totalCuotas} cuotas, ` +
      `monto total: $${resumen.montoTotal.toFixed(2)}`
    );

    return {
      cuotasSimuladas,
      resumen,
      detalleCalculo
    };
  }

  /**
   * Simula el impacto de cambios en reglas de descuento
   * Compara montos actuales vs. montos con nuevas reglas
   */
  async simularReglaDescuento(data: SimularReglaDescuentoDto): Promise<{
    impactoActual: any;
    impactoNuevo: any;
    diferencia: {
      montoTotal: number;
      porcentaje: number;
      sociosAfectados: number;
    };
    detalleComparacion: any[];
  }> {
    logger.info(
      `[SIMULADOR] Simulando impacto de reglas de descuento para ${data.mes}/${data.anio}`
    );

    // STEP 1: Calcular con reglas actuales
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

    // STEP 2: Aplicar reglas modificadas/nuevas (simulación en memoria)
    const reglasTemporales = [
      ...data.reglasModificadas,
      ...(data.reglasNuevas || [])
    ];

    // STEP 3: Calcular con nuevas reglas (sin persistir)
    const impactoNuevo = await this.simularGeneracionConReglas({
      mes: data.mes,
      anio: data.anio,
      socioIds: data.socioIds,
      categoriaIds: data.categoriaIds,
      reglas: reglasTemporales
    });

    // STEP 4: Calcular diferencias
    const diferencia = {
      montoTotal: impactoNuevo.resumen.montoTotal - impactoActual.resumen.montoTotal,
      porcentaje: impactoActual.resumen.montoTotal > 0
        ? ((impactoNuevo.resumen.montoTotal - impactoActual.resumen.montoTotal) /
           impactoActual.resumen.montoTotal) * 100
        : 0,
      sociosAfectados: Math.abs(
        impactoNuevo.resumen.descuentosAplicados -
        impactoActual.resumen.descuentosAplicados
      )
    };

    // STEP 5: Comparación detallada por socio
    const detalleComparacion = impactoActual.cuotasSimuladas.map((cuotaActual: any) => {
      const cuotaNueva = impactoNuevo.cuotasSimuladas.find(
        (c: any) => c.socioId === cuotaActual.socioId
      );

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

    logger.info(
      `[SIMULADOR] Impacto calculado: diferencia de $${diferencia.montoTotal.toFixed(2)} ` +
      `(${diferencia.porcentaje.toFixed(2)}%)`
    );

    return {
      impactoActual,
      impactoNuevo,
      diferencia,
      detalleComparacion
    };
  }

  /**
   * Compara múltiples escenarios de generación
   * Permite evaluar diferentes configuraciones
   */
  async compararEscenarios(data: CompararEscenariosDto): Promise<{
    escenarios: any[];
    comparacion: {
      mejorEscenario: string;
      mayorRecaudacion: number;
      menorRecaudacion: number;
      diferenciaMaxima: number;
    };
    recomendacion: string;
  }> {
    logger.info(
      `[SIMULADOR] Comparando ${data.escenarios.length} escenarios para ${data.mes}/${data.anio}`
    );

    const resultadosEscenarios: any[] = [];

    // Simular cada escenario
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

      // Aplicar ajustes adicionales del escenario
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

    // Análisis comparativo
    const montosTotal = resultadosEscenarios.map(e => e.montoTotalAjustado);
    const mayorRecaudacion = Math.max(...montosTotal);
    const menorRecaudacion = Math.min(...montosTotal);
    const mejorEscenario = resultadosEscenarios.find(
      e => e.montoTotalAjustado === mayorRecaudacion
    )?.nombre || '';

    const comparacion = {
      mejorEscenario,
      mayorRecaudacion,
      menorRecaudacion,
      diferenciaMaxima: mayorRecaudacion - menorRecaudacion
    };

    // Generar recomendación
    const recomendacion = this.generarRecomendacion(resultadosEscenarios, comparacion);

    logger.info(
      `[SIMULADOR] Comparación completada. Mejor escenario: ${mejorEscenario} ` +
      `($${mayorRecaudacion.toFixed(2)})`
    );

    return {
      escenarios: resultadosEscenarios,
      comparacion,
      recomendacion
    };
  }

  /**
   * Simula el impacto masivo de cambios en configuración
   * Incluye proyección a futuro (opcional)
   */
  async simularImpactoMasivo(data: SimularImpactoMasivoDto): Promise<{
    impactoInmediato: any;
    proyeccion?: any[];
    resumen: {
      diferenciaTotal: number;
      porcentajeCambio: number;
      sociosAfectados: number;
      impactoAnual?: number;
    };
  }> {
    logger.info(
      `[SIMULADOR] Simulando impacto masivo para ${data.mes}/${data.anio}`
    );

    // STEP 1: Calcular situación actual
    const actual = await this.simularGeneracion({
      mes: data.mes,
      anio: data.anio,
      aplicarDescuentos: true,
      aplicarAjustes: true,
      aplicarExenciones: true,
      incluirInactivos: false
    });

    // STEP 2: Simular con cambios propuestos
    const conCambios = await this.simularGeneracionConCambios({
      mes: data.mes,
      anio: data.anio,
      cambios: data.cambios
    });

    // STEP 3: Calcular diferencia
    const diferenciaTotal = conCambios.resumen.montoTotal - actual.resumen.montoTotal;
    const porcentajeCambio = actual.resumen.montoTotal > 0
      ? (diferenciaTotal / actual.resumen.montoTotal) * 100
      : 0;

    // STEP 4: Proyección a futuro (opcional)
    let proyeccion: any[] | undefined;
    let impactoAnual: number | undefined;

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

    logger.info(
      `[SIMULADOR] Impacto masivo calculado: $${diferenciaTotal.toFixed(2)} ` +
      `(${porcentajeCambio.toFixed(2)}%)`
    );

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

  // ═══════════════════════════════════════════════════════════════════════════
  // MÉTODOS PRIVADOS AUXILIARES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Obtiene socios elegibles según criterios
   */
  private async obtenerSociosElegibles(data: SimularGeneracionDto): Promise<any[]> {
    const whereConditions: any = {};

    // Filtrar por socios específicos
    if (data.socioIds && data.socioIds.length > 0) {
      whereConditions.id = { in: data.socioIds };
    }

    // Filtrar por categorías
    if (data.categoriaIds && data.categoriaIds.length > 0) {
      whereConditions.categoriaId = { in: data.categoriaIds };
    }

    // Filtrar solo activos (a menos que se incluyan inactivos)
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

    // Filtrar solo personas que son SOCIO
    const sociosValidos = socios.filter(persona =>
      hasActiveTipo(persona, 'SOCIO')
    );

    return sociosValidos.map(socio => ({
      id: socio.id,
      numeroSocio: socio.numeroSocio,
      nombre: socio.nombre,
      apellido: socio.apellido,
      categoriaId: socio.categoriaId,
      categoria: socio.categoriaSocio?.codigo || 'GENERAL'
    }));
  }

  /**
   * Calcula una cuota simulada (sin persistir)
   */
  private async calcularCuotaSimulada(params: {
    socioId: number;
    categoriaId: number;
    mes: number;
    anio: number;
    aplicarDescuentos: boolean;
    aplicarAjustes: boolean;
    aplicarExenciones: boolean;
  }): Promise<{
    montoBase: number;
    montoActividades: number;
    montoTotal: number;
    descuentos: number;
    ajustes: any[];
    exenciones: any[];
    detalle: any;
  }> {
    // Reutilizar lógica del CuotaService
    const resultado = await this.cuotaService.calcularMontoCuota({
      categoriaId: params.categoriaId,
      mes: params.mes,
      anio: params.anio,
      socioId: params.socioId,
      incluirActividades: true,
      aplicarDescuentos: params.aplicarDescuentos
    });

    let montoTotal = resultado.montoTotal;
    const ajustes: any[] = [];
    const exenciones: any[] = [];

    // Aplicar ajustes si corresponde
    if (params.aplicarAjustes && this.ajusteService) {
      const fechaCuota = new Date(params.anio, params.mes - 1, 1);
      const ajustesActivos = await this.ajusteService.getAjustesActivosParaPeriodo(
        params.socioId,
        fechaCuota
      );

      if (ajustesActivos.length > 0) {
        const resultadoAjustes = this.ajusteService.calcularAjustesMultiples(
          ajustesActivos,
          montoTotal
        );
        montoTotal = resultadoAjustes.montoFinal;
        ajustes.push(...resultadoAjustes.ajustes);
      }
    }

    // Aplicar exenciones si corresponde
    if (params.aplicarExenciones && this.exencionService) {
      const fechaCuota = new Date(params.anio, params.mes - 1, 1);
      const exencionCheck = await this.exencionService.checkExencionParaPeriodo(
        params.socioId,
        fechaCuota
      );

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

  /**
   * Simula generación con reglas personalizadas (en memoria)
   */
  private async simularGeneracionConReglas(params: {
    mes: number;
    anio: number;
    socioIds?: number[];
    categoriaIds?: number[];
    reglas: any[];
  }): Promise<any> {
    // TODO: Implementar motor de reglas temporal
    // Por ahora, retorna simulación estándar
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

  /**
   * Simula generación con cambios de configuración
   */
  private async simularGeneracionConCambios(params: {
    mes: number;
    anio: number;
    cambios: any;
  }): Promise<any> {
    // TODO: Implementar aplicación de cambios
    // Por ahora, retorna simulación estándar
    return this.simularGeneracion({
      mes: params.mes,
      anio: params.anio,
      aplicarDescuentos: true,
      aplicarAjustes: true,
      aplicarExenciones: true,
      incluirInactivos: false
    });
  }

  /**
   * Genera recomendación basada en resultados de escenarios
   */
  private generarRecomendacion(escenarios: any[], comparacion: any): string {
    const diferencia = comparacion.diferenciaMaxima;
    const porcentaje = (diferencia / comparacion.mayorRecaudacion) * 100;

    if (porcentaje < 5) {
      return `Los escenarios son muy similares (diferencia <5%). Recomendamos ${comparacion.mejorEscenario} por recaudación máxima.`;
    } else if (porcentaje < 15) {
      return `Existe diferencia moderada (${porcentaje.toFixed(1)}%). Recomendamos ${comparacion.mejorEscenario}, pero considere impacto en socios.`;
    } else {
      return `Diferencia significativa (${porcentaje.toFixed(1)}%). Recomendamos ${comparacion.mejorEscenario}, pero evalúe impacto social antes de aplicar.`;
    }
  }
}
