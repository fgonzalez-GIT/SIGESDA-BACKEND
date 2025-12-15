import {
  PrismaClient,
  ExencionCuota,
  Prisma,
  TipoExencion,
  MotivoExencion,
  EstadoExencion
} from '@prisma/client';

/**
 * Repository for managing temporary exemptions from cuota payments
 * FASE 4 - Task 4.2: Exenciones Temporales
 */
export class ExencionCuotaRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new exemption
   */
  async create(
    data: Omit<Prisma.ExencionCuotaCreateInput, 'persona' | 'historial'> & { personaId: number },
    tx?: Prisma.TransactionClient
  ): Promise<ExencionCuota> {
    const client = tx || this.prisma;

    return client.exencionCuota.create({
      data: {
        persona: { connect: { id: data.personaId } },
        tipoExencion: data.tipoExencion,
        motivoExencion: data.motivoExencion,
        estado: data.estado || 'PENDIENTE_APROBACION',
        porcentajeExencion: data.porcentajeExencion || new Prisma.Decimal(100),
        fechaInicio: data.fechaInicio,
        fechaFin: data.fechaFin,
        descripcion: data.descripcion,
        justificacion: data.justificacion,
        documentacionAdjunta: data.documentacionAdjunta,
        solicitadoPor: data.solicitadoPor,
        fechaSolicitud: data.fechaSolicitud || new Date(),
        aprobadoPor: data.aprobadoPor,
        fechaAprobacion: data.fechaAprobacion,
        observaciones: data.observaciones,
        activa: data.activa ?? true
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
   * Find exemption by ID
   */
  async findById(id: number): Promise<ExencionCuota | null> {
    return this.prisma.exencionCuota.findUnique({
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
   * Find all exemptions for a specific persona
   */
  async findByPersonaId(personaId: number, soloActivas = false): Promise<ExencionCuota[]> {
    const where: Prisma.ExencionCuotaWhereInput = { personaId };

    if (soloActivas) {
      where.activa = true;
    }

    return this.prisma.exencionCuota.findMany({
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
        { estado: 'asc' },
        { fechaInicio: 'desc' }
      ]
    });
  }

  /**
   * Find active exemptions for a persona within a date range
   * Used when generating cuotas to determine if exemption applies
   */
  async findActiveByPersonaAndPeriodo(
    personaId: number,
    fecha: Date
  ): Promise<ExencionCuota[]> {
    return this.prisma.exencionCuota.findMany({
      where: {
        personaId,
        activa: true,
        estado: { in: ['APROBADA', 'VIGENTE'] },
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
      orderBy: { porcentajeExencion: 'desc' }
    });
  }

  /**
   * Find all exemptions with filters
   */
  async findAll(filters?: {
    personaId?: number;
    tipoExencion?: TipoExencion;
    motivoExencion?: MotivoExencion;
    estado?: EstadoExencion;
    activa?: boolean;
    fechaDesde?: Date;
    fechaHasta?: Date;
  }): Promise<ExencionCuota[]> {
    const where: Prisma.ExencionCuotaWhereInput = {};

    if (filters?.personaId) {
      where.personaId = filters.personaId;
    }

    if (filters?.tipoExencion) {
      where.tipoExencion = filters.tipoExencion;
    }

    if (filters?.motivoExencion) {
      where.motivoExencion = filters.motivoExencion;
    }

    if (filters?.estado) {
      where.estado = filters.estado;
    }

    if (filters?.activa !== undefined) {
      where.activa = filters.activa;
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

    return this.prisma.exencionCuota.findMany({
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
        { estado: 'asc' },
        { fechaSolicitud: 'desc' }
      ]
    });
  }

  /**
   * Find pending exemptions (awaiting approval)
   */
  async findPendientes(): Promise<ExencionCuota[]> {
    return this.findAll({
      estado: 'PENDIENTE_APROBACION',
      activa: true
    });
  }

  /**
   * Find approved/active exemptions
   */
  async findVigentes(): Promise<ExencionCuota[]> {
    const now = new Date();

    return this.prisma.exencionCuota.findMany({
      where: {
        activa: true,
        estado: { in: ['APROBADA', 'VIGENTE'] },
        fechaInicio: { lte: now },
        OR: [
          { fechaFin: null },
          { fechaFin: { gte: now } }
        ]
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
      },
      orderBy: { fechaInicio: 'desc' }
    });
  }

  /**
   * Update an exemption
   */
  async update(
    id: number,
    data: Partial<Prisma.ExencionCuotaUpdateInput>,
    tx?: Prisma.TransactionClient
  ): Promise<ExencionCuota> {
    const client = tx || this.prisma;

    return client.exencionCuota.update({
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
   * Approve an exemption
   */
  async aprobar(
    id: number,
    aprobadoPor: string,
    observaciones?: string,
    tx?: Prisma.TransactionClient
  ): Promise<ExencionCuota> {
    return this.update(id, {
      estado: 'APROBADA',
      aprobadoPor,
      fechaAprobacion: new Date(),
      observaciones
    }, tx);
  }

  /**
   * Reject an exemption
   */
  async rechazar(
    id: number,
    motivoRechazo: string,
    tx?: Prisma.TransactionClient
  ): Promise<ExencionCuota> {
    return this.update(id, {
      estado: 'RECHAZADA',
      observaciones: motivoRechazo
    }, tx);
  }

  /**
   * Revoke an exemption
   */
  async revocar(
    id: number,
    motivoRevocacion: string,
    tx?: Prisma.TransactionClient
  ): Promise<ExencionCuota> {
    return this.update(id, {
      estado: 'REVOCADA',
      activa: false,
      observaciones: motivoRevocacion
    }, tx);
  }

  /**
   * Mark exemption as expired (vencida)
   */
  async marcarVencida(
    id: number,
    tx?: Prisma.TransactionClient
  ): Promise<ExencionCuota> {
    return this.update(id, {
      estado: 'VENCIDA',
      activa: false
    }, tx);
  }

  /**
   * Deactivate an exemption
   */
  async deactivate(id: number, tx?: Prisma.TransactionClient): Promise<ExencionCuota> {
    return this.update(id, { activa: false }, tx);
  }

  /**
   * Reactivate an exemption
   */
  async activate(id: number, tx?: Prisma.TransactionClient): Promise<ExencionCuota> {
    return this.update(id, { activa: true }, tx);
  }

  /**
   * Hard delete an exemption
   */
  async delete(id: number, tx?: Prisma.TransactionClient): Promise<ExencionCuota> {
    const client = tx || this.prisma;
    return client.exencionCuota.delete({ where: { id } });
  }

  /**
   * Get statistics
   */
  async getStats(personaId?: number): Promise<{
    total: number;
    porEstado: Record<EstadoExencion, number>;
    porTipo: Record<TipoExencion, number>;
    porMotivo: Record<MotivoExencion, number>;
    vigentes: number;
    pendientes: number;
  }> {
    const where: Prisma.ExencionCuotaWhereInput = personaId ? { personaId } : {};

    const [total, exenciones] = await Promise.all([
      this.prisma.exencionCuota.count({ where }),
      this.prisma.exencionCuota.findMany({
        where,
        select: {
          estado: true,
          tipoExencion: true,
          motivoExencion: true
        }
      })
    ]);

    const porEstado: Record<EstadoExencion, number> = {
      PENDIENTE_APROBACION: 0,
      APROBADA: 0,
      RECHAZADA: 0,
      VIGENTE: 0,
      VENCIDA: 0,
      REVOCADA: 0
    };

    const porTipo: Record<TipoExencion, number> = {
      TOTAL: 0,
      PARCIAL: 0
    };

    const porMotivo: Record<MotivoExencion, number> = {
      BECA: 0,
      SOCIO_FUNDADOR: 0,
      SOCIO_HONORARIO: 0,
      SITUACION_ECONOMICA: 0,
      SITUACION_SALUD: 0,
      INTERCAMBIO_SERVICIOS: 0,
      PROMOCION: 0,
      FAMILIAR_DOCENTE: 0,
      OTRO: 0
    };

    exenciones.forEach(e => {
      porEstado[e.estado]++;
      porTipo[e.tipoExencion]++;
      porMotivo[e.motivoExencion]++;
    });

    return {
      total,
      porEstado,
      porTipo,
      porMotivo,
      vigentes: porEstado.VIGENTE + porEstado.APROBADA,
      pendientes: porEstado.PENDIENTE_APROBACION
    };
  }

  /**
   * Update expired exemptions (cron job helper)
   * Marks exemptions as VENCIDA if fechaFin has passed
   */
  async updateVencidas(): Promise<number> {
    const now = new Date();

    const result = await this.prisma.exencionCuota.updateMany({
      where: {
        estado: { in: ['APROBADA', 'VIGENTE'] },
        fechaFin: { lt: now },
        activa: true
      },
      data: {
        estado: 'VENCIDA',
        activa: false
      }
    });

    return result.count;
  }
}
