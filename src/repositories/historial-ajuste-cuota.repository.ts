import {
  PrismaClient,
  HistorialAjusteCuota,
  Prisma,
  AccionHistorialCuota
} from '@prisma/client';

/**
 * Repository for managing change history and audit log for cuotas
 * Tracks all modifications to cuotas and manual adjustments
 */
export class HistorialAjusteCuotaRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new history entry
   */
  async create(
    data: {
      ajusteId?: number;
      cuotaId?: number;
      personaId: number;
      accion: AccionHistorialCuota;
      datosPrevios?: any;
      datosNuevos: any;
      usuario?: string;
      motivoCambio?: string;
    },
    tx?: Prisma.TransactionClient
  ): Promise<HistorialAjusteCuota> {
    const client = tx || this.prisma;

    return client.historialAjusteCuota.create({
      data: {
        persona: { connect: { id: data.personaId } },
        ...(data.ajusteId && { ajuste: { connect: { id: data.ajusteId } } }),
        ...(data.cuotaId && { cuota: { connect: { id: data.cuotaId } } }),
        accion: data.accion,
        datosPrevios: data.datosPrevios || Prisma.JsonNull,
        datosNuevos: data.datosNuevos,
        usuario: data.usuario,
        motivoCambio: data.motivoCambio
      },
      include: {
        persona: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true
          }
        },
        ajuste: {
          select: {
            id: true,
            concepto: true,
            tipoAjuste: true
          }
        },
        cuota: {
          select: {
            id: true,
            mes: true,
            anio: true,
            montoTotal: true
          }
        }
      }
    });
  }

  /**
   * Find history entry by ID
   */
  async findById(id: number): Promise<HistorialAjusteCuota | null> {
    return this.prisma.historialAjusteCuota.findUnique({
      where: { id },
      include: {
        persona: true,
        ajuste: true,
        cuota: {
          include: {
            recibo: true
          }
        }
      }
    });
  }

  /**
   * Find all history entries for a specific ajuste
   */
  async findByAjusteId(ajusteId: number): Promise<HistorialAjusteCuota[]> {
    return this.prisma.historialAjusteCuota.findMany({
      where: { ajusteId },
      include: {
        persona: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Find all history entries for a specific cuota
   */
  async findByCuotaId(cuotaId: number): Promise<HistorialAjusteCuota[]> {
    return this.prisma.historialAjusteCuota.findMany({
      where: { cuotaId },
      include: {
        persona: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true
          }
        },
        ajuste: {
          select: {
            id: true,
            concepto: true,
            tipoAjuste: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Find all history entries for a specific persona
   */
  async findByPersonaId(
    personaId: number,
    filters?: {
      accion?: AccionHistorialCuota;
      fechaDesde?: Date;
      fechaHasta?: Date;
      limit?: number;
    }
  ): Promise<HistorialAjusteCuota[]> {
    const where: Prisma.HistorialAjusteCuotaWhereInput = {
      personaId
    };

    if (filters?.accion) {
      where.accion = filters.accion;
    }

    if (filters?.fechaDesde || filters?.fechaHasta) {
      where.createdAt = {};
      if (filters.fechaDesde) {
        where.createdAt.gte = filters.fechaDesde;
      }
      if (filters.fechaHasta) {
        where.createdAt.lte = filters.fechaHasta;
      }
    }

    return this.prisma.historialAjusteCuota.findMany({
      where,
      include: {
        persona: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true
          }
        },
        ajuste: {
          select: {
            id: true,
            concepto: true,
            tipoAjuste: true
          }
        },
        cuota: {
          select: {
            id: true,
            mes: true,
            anio: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: filters?.limit
    });
  }

  /**
   * Find all history entries with optional filters
   */
  async findAll(filters?: {
    accion?: AccionHistorialCuota;
    personaId?: number;
    cuotaId?: number;
    ajusteId?: number;
    fechaDesde?: Date;
    fechaHasta?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ data: HistorialAjusteCuota[]; total: number }> {
    const where: Prisma.HistorialAjusteCuotaWhereInput = {};

    if (filters?.accion) {
      where.accion = filters.accion;
    }

    if (filters?.personaId) {
      where.personaId = filters.personaId;
    }

    if (filters?.cuotaId) {
      where.cuotaId = filters.cuotaId;
    }

    if (filters?.ajusteId) {
      where.ajusteId = filters.ajusteId;
    }

    if (filters?.fechaDesde || filters?.fechaHasta) {
      where.createdAt = {};
      if (filters.fechaDesde) {
        where.createdAt.gte = filters.fechaDesde;
      }
      if (filters.fechaHasta) {
        where.createdAt.lte = filters.fechaHasta;
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.historialAjusteCuota.findMany({
        where,
        include: {
          persona: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              dni: true
            }
          },
          ajuste: {
            select: {
              id: true,
              concepto: true,
              tipoAjuste: true
            }
          },
          cuota: {
            select: {
              id: true,
              mes: true,
              anio: true,
              montoTotal: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: filters?.limit,
        skip: filters?.offset
      }),
      this.prisma.historialAjusteCuota.count({ where })
    ]);

    return { data, total };
  }

  /**
   * Get statistics about history entries
   */
  async getStats(filters?: {
    personaId?: number;
    fechaDesde?: Date;
    fechaHasta?: Date;
  }): Promise<{
    total: number;
    porAccion: Record<AccionHistorialCuota, number>;
    ultimaModificacion?: Date;
  }> {
    const where: Prisma.HistorialAjusteCuotaWhereInput = {};

    if (filters?.personaId) {
      where.personaId = filters.personaId;
    }

    if (filters?.fechaDesde || filters?.fechaHasta) {
      where.createdAt = {};
      if (filters.fechaDesde) {
        where.createdAt.gte = filters.fechaDesde;
      }
      if (filters.fechaHasta) {
        where.createdAt.lte = filters.fechaHasta;
      }
    }

    const [total, historial, ultimo] = await Promise.all([
      this.prisma.historialAjusteCuota.count({ where }),
      this.prisma.historialAjusteCuota.findMany({
        where,
        select: { accion: true }
      }),
      this.prisma.historialAjusteCuota.findFirst({
        where,
        select: { createdAt: true },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    const porAccion: Record<AccionHistorialCuota, number> = {
      CREAR_AJUSTE: 0,
      MODIFICAR_AJUSTE: 0,
      ELIMINAR_AJUSTE: 0,
      APLICAR_AJUSTE_MANUAL: 0,
      RECALCULAR_CUOTA: 0,
      REGENERAR_CUOTA: 0,
      CREAR_EXENCION: 0,
      MODIFICAR_EXENCION: 0,
      ELIMINAR_EXENCION: 0,
      APLICAR_EXENCION: 0
    };

    historial.forEach(h => {
      porAccion[h.accion]++;
    });

    return {
      total,
      porAccion,
      ultimaModificacion: ultimo?.createdAt
    };
  }

  /**
   * Delete old history entries (for cleanup/archiving)
   * Use with extreme caution - this is permanent deletion
   */
  async deleteOlderThan(date: Date): Promise<number> {
    const result = await this.prisma.historialAjusteCuota.deleteMany({
      where: {
        createdAt: { lt: date }
      }
    });

    return result.count;
  }
}
