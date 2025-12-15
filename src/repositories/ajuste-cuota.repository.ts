import {
  PrismaClient,
  AjusteCuotaSocio,
  Prisma,
  TipoAjusteCuota,
  ScopeAjusteCuota
} from '@prisma/client';

/**
 * Repository for managing manual adjustments to cuotas per socio
 * Handles CRUD operations and queries for AjusteCuotaSocio model
 */
export class AjusteCuotaRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new manual adjustment
   */
  async create(
    data: Omit<Prisma.AjusteCuotaSocioCreateInput, 'persona' | 'historial'> & { personaId: number },
    tx?: Prisma.TransactionClient
  ): Promise<AjusteCuotaSocio> {
    const client = tx || this.prisma;

    return client.ajusteCuotaSocio.create({
      data: {
        persona: { connect: { id: data.personaId } },
        tipoAjuste: data.tipoAjuste,
        valor: new Prisma.Decimal(data.valor as any),
        concepto: data.concepto,
        fechaInicio: data.fechaInicio,
        fechaFin: data.fechaFin,
        activo: data.activo ?? true,
        motivo: data.motivo,
        observaciones: data.observaciones,
        aplicaA: data.aplicaA ?? 'TODOS_ITEMS',
        itemsAfectados: data.itemsAfectados,
        aprobadoPor: data.aprobadoPor
      },
      include: {
        persona: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            numeroSocio: true
          }
        }
      }
    });
  }

  /**
   * Find adjustment by ID
   */
  async findById(id: number): Promise<AjusteCuotaSocio | null> {
    return this.prisma.ajusteCuotaSocio.findUnique({
      where: { id },
      include: {
        persona: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            numeroSocio: true
          }
        },
        historial: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });
  }

  /**
   * Find all adjustments for a specific persona
   */
  async findByPersonaId(personaId: number, soloActivos = false): Promise<AjusteCuotaSocio[]> {
    const where: Prisma.AjusteCuotaSocioWhereInput = {
      personaId
    };

    if (soloActivos) {
      where.activo = true;
    }

    return this.prisma.ajusteCuotaSocio.findMany({
      where,
      include: {
        persona: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            numeroSocio: true
          }
        }
      },
      orderBy: [
        { activo: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }

  /**
   * Find active adjustments for a persona within a date range
   * Used when generating cuotas to apply relevant adjustments
   */
  async findActiveByPersonaAndPeriodo(
    personaId: number,
    fecha: Date
  ): Promise<AjusteCuotaSocio[]> {
    return this.prisma.ajusteCuotaSocio.findMany({
      where: {
        personaId,
        activo: true,
        fechaInicio: { lte: fecha },
        OR: [
          { fechaFin: null },
          { fechaFin: { gte: fecha } }
        ]
      },
      include: {
        persona: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  /**
   * Find all adjustments with optional filters
   */
  async findAll(filters?: {
    personaId?: number;
    tipoAjuste?: TipoAjusteCuota;
    activo?: boolean;
    aplicaA?: ScopeAjusteCuota;
    fechaDesde?: Date;
    fechaHasta?: Date;
  }): Promise<AjusteCuotaSocio[]> {
    const where: Prisma.AjusteCuotaSocioWhereInput = {};

    if (filters?.personaId) {
      where.personaId = filters.personaId;
    }

    if (filters?.tipoAjuste) {
      where.tipoAjuste = filters.tipoAjuste;
    }

    if (filters?.activo !== undefined) {
      where.activo = filters.activo;
    }

    if (filters?.aplicaA) {
      where.aplicaA = filters.aplicaA;
    }

    if (filters?.fechaDesde) {
      where.fechaInicio = { gte: filters.fechaDesde };
    }

    if (filters?.fechaHasta) {
      where.OR = [
        { fechaFin: null },
        { fechaFin: { lte: filters.fechaHasta } }
      ];
    }

    return this.prisma.ajusteCuotaSocio.findMany({
      where,
      include: {
        persona: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            numeroSocio: true
          }
        }
      },
      orderBy: [
        { activo: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }

  /**
   * Update an existing adjustment
   */
  async update(
    id: number,
    data: Partial<Prisma.AjusteCuotaSocioUpdateInput>,
    tx?: Prisma.TransactionClient
  ): Promise<AjusteCuotaSocio> {
    const client = tx || this.prisma;

    return client.ajusteCuotaSocio.update({
      where: { id },
      data,
      include: {
        persona: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            numeroSocio: true
          }
        }
      }
    });
  }

  /**
   * Deactivate an adjustment (soft delete)
   */
  async deactivate(id: number, tx?: Prisma.TransactionClient): Promise<AjusteCuotaSocio> {
    return this.update(id, { activo: false }, tx);
  }

  /**
   * Reactivate an adjustment
   */
  async activate(id: number, tx?: Prisma.TransactionClient): Promise<AjusteCuotaSocio> {
    return this.update(id, { activo: true }, tx);
  }

  /**
   * Hard delete an adjustment (use with caution)
   */
  async delete(id: number, tx?: Prisma.TransactionClient): Promise<AjusteCuotaSocio> {
    const client = tx || this.prisma;

    return client.ajusteCuotaSocio.delete({
      where: { id }
    });
  }

  /**
   * Get statistics about adjustments
   */
  async getStats(personaId?: number): Promise<{
    total: number;
    activos: number;
    porTipo: Record<TipoAjusteCuota, number>;
    porScope: Record<ScopeAjusteCuota, number>;
  }> {
    const where: Prisma.AjusteCuotaSocioWhereInput = personaId ? { personaId } : {};

    const [total, activos, ajustes] = await Promise.all([
      this.prisma.ajusteCuotaSocio.count({ where }),
      this.prisma.ajusteCuotaSocio.count({ where: { ...where, activo: true } }),
      this.prisma.ajusteCuotaSocio.findMany({ where, select: { tipoAjuste: true, aplicaA: true } })
    ]);

    const porTipo: Record<TipoAjusteCuota, number> = {
      DESCUENTO_FIJO: 0,
      DESCUENTO_PORCENTAJE: 0,
      RECARGO_FIJO: 0,
      RECARGO_PORCENTAJE: 0,
      MONTO_FIJO_TOTAL: 0
    };

    const porScope: Record<ScopeAjusteCuota, number> = {
      TODOS_ITEMS: 0,
      SOLO_BASE: 0,
      SOLO_ACTIVIDADES: 0,
      ITEMS_ESPECIFICOS: 0
    };

    ajustes.forEach(ajuste => {
      porTipo[ajuste.tipoAjuste]++;
      porScope[ajuste.aplicaA]++;
    });

    return { total, activos, porTipo, porScope };
  }
}
