/**
 * Motor de Reglas de Descuentos
 *
 * Sistema configurable para aplicar descuentos a cuotas según reglas definidas.
 * Soporta múltiples modos de aplicación, condiciones complejas y trazabilidad completa.
 */

import { PrismaClient, ReglaDescuento, ModoAplicacionDescuento } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

// ══════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ══════════════════════════════════════════════════════════════════════

interface ItemCuotaData {
  id: number;
  tipoItemId: number;
  concepto: string;
  monto: number;
  tipoItem: {
    codigo: string;
    categoriaItem: {
      codigo: string;
    };
  };
}

interface DescuentoAplicable {
  regla: ReglaDescuento;
  porcentaje: number;
  montoBase: number;
  montoCalculado: number;
  metadata: any;
}

interface DescuentoResuelto {
  reglaId: number;
  nombreRegla: string;
  porcentaje: number;
  monto: number;
  itemsAfectados: number[];
  metadata: any;
}

interface ResultadoAplicacion {
  itemsDescuento: ItemCuotaCreado[];
  aplicaciones: AplicacionReglaCreada[];
  totalDescuento: number;
  porcentajeTotalAplicado: number;
}

interface ItemCuotaCreado {
  tipoItemId: number;
  concepto: string;
  monto: number;
  cantidad: number;
  porcentaje: number | null;
  esAutomatico: boolean;
  esEditable: boolean;
  metadata: any;
}

interface AplicacionReglaCreada {
  reglaId: number;
  porcentajeAplicado: number;
  montoDescuento: number;
  metadata: any;
}

// ══════════════════════════════════════════════════════════════════════
// MOTOR DE REGLAS DE DESCUENTOS
// ══════════════════════════════════════════════════════════════════════

export class MotorReglasDescuentos {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || prisma;
  }

  /**
   * Aplica reglas de descuento a una cuota
   *
   * @param cuotaId - ID de la cuota
   * @param personaId - ID de la persona (socio)
   * @param itemsCuota - Items ya creados de la cuota
   * @returns Items de descuento + aplicaciones para log
   */
  async aplicarReglas(
    cuotaId: number,
    personaId: number,
    itemsCuota: ItemCuotaData[]
  ): Promise<ResultadoAplicacion> {
    // 1. Obtener configuración global
    const config = await this.getConfiguracionActiva();

    if (!config || !config.activa) {
      return {
        itemsDescuento: [],
        aplicaciones: [],
        totalDescuento: 0,
        porcentajeTotalAplicado: 0
      };
    }

    // 2. Obtener reglas activas ordenadas por prioridad
    const reglas = await this.getReglasActivas(config.prioridadReglas as number[]);

    if (reglas.length === 0) {
      return {
        itemsDescuento: [],
        aplicaciones: [],
        totalDescuento: 0,
        porcentajeTotalAplicado: 0
      };
    }

    // 3. Evaluar cada regla
    const descuentosAplicables: DescuentoAplicable[] = [];

    for (const regla of reglas) {
      const cumpleCondiciones = await this.evaluarCondiciones(regla, personaId);

      if (cumpleCondiciones) {
        const descuento = await this.calcularDescuento(regla, personaId, itemsCuota);

        if (descuento && descuento.porcentaje > 0) {
          descuentosAplicables.push(descuento);
        }
      }
    }

    if (descuentosAplicables.length === 0) {
      return {
        itemsDescuento: [],
        aplicaciones: [],
        totalDescuento: 0,
        porcentajeTotalAplicado: 0
      };
    }

    // 4. Resolver conflictos según modo de aplicación
    const descuentosResueltos = this.resolverConflictos(
      descuentosAplicables,
      Number(config.limiteDescuentoTotal),
      itemsCuota,
      config
    );

    // 5. Crear ítems de descuento
    const { itemsDescuento, aplicaciones, totalDescuento, porcentajeTotalAplicado } =
      await this.crearItemsDescuento(cuotaId, descuentosResueltos, itemsCuota);

    return {
      itemsDescuento,
      aplicaciones,
      totalDescuento,
      porcentajeTotalAplicado
    };
  }

  /**
   * Obtiene la configuración global activa
   */
  private async getConfiguracionActiva() {
    return await this.prisma.configuracionDescuentos.findFirst({
      where: { activa: true },
      orderBy: { id: 'asc' }
    });
  }

  /**
   * Obtiene reglas activas ordenadas por prioridad
   */
  private async getReglasActivas(prioridadReglas: number[]): Promise<ReglaDescuento[]> {
    // Si hay orden de prioridad definido, usarlo
    if (prioridadReglas && prioridadReglas.length > 0) {
      const reglas = await this.prisma.reglaDescuento.findMany({
        where: {
          id: { in: prioridadReglas },
          activa: true
        }
      });

      // Ordenar según prioridadReglas
      return reglas.sort((a, b) => {
        return prioridadReglas.indexOf(a.id) - prioridadReglas.indexOf(b.id);
      });
    }

    // Si no, ordenar por campo prioridad
    return await this.prisma.reglaDescuento.findMany({
      where: { activa: true },
      orderBy: { prioridad: 'asc' }
    });
  }

  /**
   * Evalúa si una regla aplica para un socio
   */
  private async evaluarCondiciones(
    regla: ReglaDescuento,
    personaId: number
  ): Promise<boolean> {
    const condiciones = regla.condiciones as any;

    switch (condiciones.type) {
      case 'categoria':
        return await this.evaluarCondicionCategoria(personaId, condiciones);

      case 'relacion_familiar':
        return await this.evaluarCondicionFamiliar(personaId, condiciones);

      case 'cantidad_actividades':
        return await this.evaluarCondicionActividades(personaId, condiciones);

      case 'antiguedad':
        return await this.evaluarCondicionAntiguedad(personaId, condiciones);

      case 'personalizado':
        return await this.evaluarCondicionPersonalizada(personaId, condiciones);

      default:
        console.warn(`Tipo de condición desconocido: ${condiciones.type}`);
        return false;
    }
  }

  /**
   * Evalúa condición: Categoría de socio
   */
  private async evaluarCondicionCategoria(
    personaId: number,
    condiciones: any
  ): Promise<boolean> {
    const personaTipo = await this.prisma.personaTipo.findFirst({
      where: {
        personaId,
        activo: true,
        tipoPersona: { codigo: 'SOCIO' }
      },
      include: {
        categoria: true
      }
    });

    if (!personaTipo || !personaTipo.categoria) {
      return false;
    }

    const categoriasPermitidas = condiciones.categorias || [];
    return categoriasPermitidas.includes(personaTipo.categoria.codigo);
  }

  /**
   * Evalúa condición: Relación familiar
   */
  private async evaluarCondicionFamiliar(
    personaId: number,
    condiciones: any
  ): Promise<boolean> {
    const count = await this.prisma.familiar.count({
      where: {
        socioId: personaId,
        activo: condiciones.activa !== false  // Por defecto true
      }
    });

    return count > 0;
  }

  /**
   * Evalúa condición: Cantidad de actividades
   */
  private async evaluarCondicionActividades(
    personaId: number,
    condiciones: any
  ): Promise<boolean> {
    const count = await this.prisma.participacion_actividades.count({
      where: {
        socioId: personaId,
        activa: true
      }
    });

    const minimo = condiciones.minimo || 0;
    const maximo = condiciones.maximo || Number.MAX_SAFE_INTEGER;

    return count >= minimo && count <= maximo;
  }

  /**
   * Evalúa condición: Antigüedad
   */
  private async evaluarCondicionAntiguedad(
    personaId: number,
    condiciones: any
  ): Promise<boolean> {
    const personaTipo = await this.prisma.personaTipo.findFirst({
      where: {
        personaId,
        activo: true,
        tipoPersona: { codigo: 'SOCIO' }
      }
    });

    if (!personaTipo || !personaTipo.fechaIngreso) {
      return false;
    }

    const fechaIngreso = new Date(personaTipo.fechaIngreso);
    const ahora = new Date();
    const mesesAntiguedad = this.calcularMesesEntreFechas(fechaIngreso, ahora);

    const mesesMinimo = condiciones.mesesMinimo || 0;

    return mesesAntiguedad >= mesesMinimo;
  }

  /**
   * Evalúa condición: Personalizada (placeholder)
   */
  private async evaluarCondicionPersonalizada(
    personaId: number,
    condiciones: any
  ): Promise<boolean> {
    // TODO: Implementar funciones personalizadas
    console.warn('Condiciones personalizadas no implementadas aún');
    return false;
  }

  /**
   * Calcula el descuento según la fórmula
   */
  private async calcularDescuento(
    regla: ReglaDescuento,
    personaId: number,
    itemsCuota: ItemCuotaData[]
  ): Promise<DescuentoAplicable | null> {
    const formula = regla.formula as any;

    let porcentaje = 0;
    let metadata: any = {};

    switch (formula.type) {
      case 'porcentaje_fijo':
        porcentaje = formula.porcentaje || 0;
        metadata = { tipo: 'fijo', valor: porcentaje };
        break;

      case 'porcentaje_desde_bd':
        porcentaje = await this.obtenerPorcentajeDesdeDB(personaId, formula);
        metadata = { tipo: 'desde_bd', fuente: formula.fuente, campo: formula.campo };
        break;

      case 'escalado':
        porcentaje = await this.calcularDescuentoEscalado(personaId, formula);
        metadata = { tipo: 'escalado', reglas: formula.reglas };
        break;

      case 'personalizado':
        porcentaje = await this.ejecutarFuncionPersonalizada(personaId, formula, itemsCuota);
        metadata = { tipo: 'personalizado', funcion: formula.funcion };
        break;

      default:
        console.warn(`Tipo de fórmula desconocido: ${formula.type}`);
        return null;
    }

    if (porcentaje <= 0) {
      return null;
    }

    // Calcular monto base (suma de items a los que aplica)
    const montoBase = this.calcularMontoBase(itemsCuota, regla);
    const montoCalculado = (montoBase * porcentaje) / 100;

    return {
      regla,
      porcentaje,
      montoBase,
      montoCalculado,
      metadata
    };
  }

  /**
   * Obtiene porcentaje desde la base de datos
   */
  private async obtenerPorcentajeDesdeDB(
    personaId: number,
    formula: any
  ): Promise<number> {
    if (formula.fuente === 'categorias_socios') {
      const personaTipo = await this.prisma.personaTipo.findFirst({
        where: {
          personaId,
          activo: true,
          tipoPersona: { codigo: 'SOCIO' }
        },
        include: {
          categoria: true
        }
      });

      if (!personaTipo || !personaTipo.categoria) {
        return 0;
      }

      return Number(personaTipo.categoria.descuento || 0);
    }

    return 0;
  }

  /**
   * Calcula descuento escalado
   */
  private async calcularDescuentoEscalado(
    personaId: number,
    formula: any
  ): Promise<number> {
    const count = await this.prisma.participacion_actividades.count({
      where: {
        socioId: personaId,
        activa: true
      }
    });

    const reglas = formula.reglas || [];

    for (const regla of reglas) {
      try {
        // Evaluar condición (ej: "actividades >= 2 && actividades < 3")
        const condicion = regla.condicion.replace(/actividades/g, count.toString());
        if (eval(condicion)) {
          return regla.descuento;
        }
      } catch (error) {
        console.error('Error evaluando condición escalada:', error);
      }
    }

    return 0;
  }

  /**
   * Ejecuta función personalizada
   */
  private async ejecutarFuncionPersonalizada(
    personaId: number,
    formula: any,
    itemsCuota: ItemCuotaData[]
  ): Promise<number> {
    const funcion = formula.funcion;

    switch (funcion) {
      case 'calcularMaximoDescuentoFamiliar':
        return await this.calcularMaximoDescuentoFamiliar(personaId);

      case 'calcularDescuentoPorAntiguedad':
        return await this.calcularDescuentoPorAntiguedad(personaId);

      default:
        console.warn(`Función personalizada desconocida: ${funcion}`);
        return 0;
    }
  }

  /**
   * Función personalizada: Máximo descuento familiar
   */
  private async calcularMaximoDescuentoFamiliar(personaId: number): Promise<number> {
    const familiares = await this.prisma.familiar.findMany({
      where: {
        socioId: personaId,
        activo: true
      }
    });

    if (familiares.length === 0) {
      return 0;
    }

    const descuentos = familiares.map(f => Number(f.descuento || 0));
    return Math.max(...descuentos);
  }

  /**
   * Función personalizada: Descuento por antigüedad
   */
  private async calcularDescuentoPorAntiguedad(personaId: number): Promise<number> {
    const personaTipo = await this.prisma.personaTipo.findFirst({
      where: {
        personaId,
        activo: true,
        tipoPersona: { codigo: 'SOCIO' }
      }
    });

    if (!personaTipo || !personaTipo.fechaIngreso) {
      return 0;
    }

    const fechaIngreso = new Date(personaTipo.fechaIngreso);
    const ahora = new Date();
    const anios = this.calcularAniosEntreFechas(fechaIngreso, ahora);

    // 1% por año, máximo 15%
    return Math.min(anios, 15);
  }

  /**
   * Calcula monto base de items a los que aplica la regla
   */
  private calcularMontoBase(itemsCuota: ItemCuotaData[], regla: ReglaDescuento): number {
    return itemsCuota
      .filter(item => {
        const esBase = item.tipoItem.categoriaItem.codigo === 'BASE';
        const esActividad = item.tipoItem.categoriaItem.codigo === 'ACTIVIDAD';

        if (esBase && !regla.aplicarABase) return false;
        if (esActividad && !regla.aplicarAActividades) return false;

        return true;
      })
      .reduce((sum, item) => sum + Number(item.monto), 0);
  }

  /**
   * Resuelve conflictos entre múltiples descuentos
   */
  private resolverConflictos(
    descuentos: DescuentoAplicable[],
    limiteGlobal: number,
    itemsCuota: ItemCuotaData[],
    config: any
  ): DescuentoResuelto[] {
    const resueltos: DescuentoResuelto[] = [];
    const grupos = this.agruparPorModo(descuentos);

    // ACUMULATIVOS: sumar todos
    const acumulativos = grupos.ACUMULATIVO || [];
    if (acumulativos.length > 0) {
      const porcentajeTotal = acumulativos.reduce((sum, d) => sum + d.porcentaje, 0);
      const montoTotal = acumulativos.reduce((sum, d) => sum + d.montoCalculado, 0);

      resueltos.push({
        reglaId: acumulativos[0].regla.id,
        nombreRegla: `Descuentos acumulativos (${acumulativos.length})`,
        porcentaje: Math.min(porcentajeTotal, limiteGlobal),
        monto: montoTotal,
        itemsAfectados: this.getItemsAfectados(itemsCuota, acumulativos[0].regla),
        metadata: {
          modo: 'ACUMULATIVO',
          reglasAplicadas: acumulativos.map(d => ({
            id: d.regla.id,
            codigo: d.regla.codigo,
            porcentaje: d.porcentaje
          }))
        }
      });
    }

    // EXCLUSIVOS: solo el mayor
    const exclusivos = grupos.EXCLUSIVO || [];
    if (exclusivos.length > 0) {
      const mayor = exclusivos.reduce((max, d) =>
        d.porcentaje > max.porcentaje ? d : max
      );

      resueltos.push({
        reglaId: mayor.regla.id,
        nombreRegla: mayor.regla.nombre,
        porcentaje: Math.min(mayor.porcentaje, limiteGlobal),
        monto: mayor.montoCalculado,
        itemsAfectados: this.getItemsAfectados(itemsCuota, mayor.regla),
        metadata: {
          modo: 'EXCLUSIVO',
          reglaAplicada: {
            id: mayor.regla.id,
            codigo: mayor.regla.codigo,
            porcentaje: mayor.porcentaje
          }
        }
      });
    }

    // MÁXIMO: hasta el límite de la regla
    const maximos = grupos.MAXIMO || [];
    for (const desc of maximos) {
      const limite = Number(desc.regla.maxDescuento) || limiteGlobal;

      resueltos.push({
        reglaId: desc.regla.id,
        nombreRegla: desc.regla.nombre,
        porcentaje: Math.min(desc.porcentaje, limite, limiteGlobal),
        monto: desc.montoCalculado,
        itemsAfectados: this.getItemsAfectados(itemsCuota, desc.regla),
        metadata: {
          modo: 'MAXIMO',
          limiteRegla: limite,
          reglaAplicada: {
            id: desc.regla.id,
            codigo: desc.regla.codigo,
            porcentaje: desc.porcentaje
          }
        }
      });
    }

    // PERSONALIZADOS: lógica específica
    const personalizados = grupos.PERSONALIZADO || [];
    for (const desc of personalizados) {
      resueltos.push({
        reglaId: desc.regla.id,
        nombreRegla: desc.regla.nombre,
        porcentaje: Math.min(desc.porcentaje, limiteGlobal),
        monto: desc.montoCalculado,
        itemsAfectados: this.getItemsAfectados(itemsCuota, desc.regla),
        metadata: {
          modo: 'PERSONALIZADO',
          reglaAplicada: {
            id: desc.regla.id,
            codigo: desc.regla.codigo,
            porcentaje: desc.porcentaje
          }
        }
      });
    }

    return resueltos;
  }

  /**
   * Agrupa descuentos por modo de aplicación
   */
  private agruparPorModo(descuentos: DescuentoAplicable[]): Record<string, DescuentoAplicable[]> {
    const grupos: Record<string, DescuentoAplicable[]> = {};

    for (const descuento of descuentos) {
      const modo = descuento.regla.modoAplicacion;

      if (!grupos[modo]) {
        grupos[modo] = [];
      }

      grupos[modo].push(descuento);
    }

    return grupos;
  }

  /**
   * Obtiene IDs de items afectados por una regla
   */
  private getItemsAfectados(itemsCuota: ItemCuotaData[], regla: ReglaDescuento): number[] {
    return itemsCuota
      .filter(item => {
        const esBase = item.tipoItem.categoriaItem.codigo === 'BASE';
        const esActividad = item.tipoItem.categoriaItem.codigo === 'ACTIVIDAD';

        if (esBase && regla.aplicarABase) return true;
        if (esActividad && regla.aplicarAActividades) return true;

        return false;
      })
      .map(item => item.id);
  }

  /**
   * Crea ítems de descuento y registros de aplicación
   */
  private async crearItemsDescuento(
    cuotaId: number,
    descuentos: DescuentoResuelto[],
    itemsCuota: ItemCuotaData[]
  ): Promise<ResultadoAplicacion> {
    const itemsDescuento: ItemCuotaCreado[] = [];
    const aplicaciones: AplicacionReglaCreada[] = [];

    // Obtener tipo de item de descuento
    const tipoDescuento = await this.prisma.tipoItemCuota.findFirst({
      where: {
        categoriaItem: { codigo: 'DESCUENTO' },
        activo: true
      }
    });

    if (!tipoDescuento) {
      console.warn('No se encontró tipo de item de descuento');
      return {
        itemsDescuento: [],
        aplicaciones: [],
        totalDescuento: 0,
        porcentajeTotalAplicado: 0
      };
    }

    let totalDescuento = 0;
    let totalPorcentaje = 0;

    for (const descuento of descuentos) {
      // Crear item de descuento
      itemsDescuento.push({
        tipoItemId: tipoDescuento.id,
        concepto: descuento.nombreRegla,
        monto: -Math.abs(descuento.monto),  // Negativo
        cantidad: 1,
        porcentaje: descuento.porcentaje,
        esAutomatico: true,
        esEditable: false,
        metadata: descuento.metadata
      });

      // Crear aplicación para log
      aplicaciones.push({
        reglaId: descuento.reglaId,
        porcentajeAplicado: descuento.porcentaje,
        montoDescuento: descuento.monto,
        metadata: descuento.metadata
      });

      totalDescuento += descuento.monto;
      totalPorcentaje += descuento.porcentaje;
    }

    return {
      itemsDescuento,
      aplicaciones,
      totalDescuento,
      porcentajeTotalAplicado: totalPorcentaje
    };
  }

  // ══════════════════════════════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════════════════════════════

  private calcularMesesEntreFechas(fecha1: Date, fecha2: Date): number {
    const diff = fecha2.getTime() - fecha1.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  }

  private calcularAniosEntreFechas(fecha1: Date, fecha2: Date): number {
    const diff = fecha2.getTime() - fecha1.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
  }
}

export default MotorReglasDescuentos;
