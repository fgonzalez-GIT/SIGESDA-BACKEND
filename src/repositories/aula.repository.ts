// @ts-nocheck
import { PrismaClient, Aula } from '@prisma/client';
import { CreateAulaDto, AulaQueryDto } from '@/dto/aula.dto';

export class AulaRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateAulaDto): Promise<Aula> {
    const { nombre, capacidad, ubicacion, tipoAulaId, estadoAulaId, descripcion, observaciones, activa, equipamientos } = data;

    // Crear aula con sus equipamientos en una transacción
    return this.prisma.aula.create({
      data: {
        nombre,
        capacidad,
        ubicacion,
        tipoAulaId,
        estadoAulaId,
        descripcion,
        observaciones,
        activa: activa ?? true,
        // Crear relaciones con equipamientos si se proporcionan
        ...(equipamientos && equipamientos.length > 0 && {
          aulas_equipamientos: {
            create: equipamientos.map(eq => ({
              equipamientoId: eq.equipamientoId,
              cantidad: eq.cantidad || 1,
              observaciones: eq.observaciones
            }))
          }
        })
      },
      include: {
        tipoAula: true,
        estadoAula: true,
        aulas_equipamientos: {
          include: {
            equipamiento: true
          }
        }
      }
    });
  }

  async findAll(query: AulaQueryDto): Promise<{ data: Aula[]; total: number }> {
    const where: any = {};

    if (query.activa !== undefined) {
      where.activa = query.activa;
    }

    if (query.tipoAulaId !== undefined) {
      where.tipoAulaId = query.tipoAulaId;
    }

    if (query.estadoAulaId !== undefined) {
      where.estadoAulaId = query.estadoAulaId;
    }

    if (query.capacidadMinima !== undefined || query.capacidadMaxima !== undefined) {
      where.capacidad = {};
      if (query.capacidadMinima !== undefined) {
        where.capacidad.gte = query.capacidadMinima;
      }
      if (query.capacidadMaxima !== undefined) {
        where.capacidad.lte = query.capacidadMaxima;
      }
    }

    if (query.conEquipamiento !== undefined) {
      if (query.conEquipamiento) {
        where.aulas_equipamientos = {
          some: {} // Tiene al menos un equipamiento asignado
        };
      } else {
        where.aulas_equipamientos = {
          none: {} // No tiene equipamientos asignados
        };
      }
    }

    if (query.search) {
      where.OR = [
        { nombre: { contains: query.search, mode: 'insensitive' } },
        { ubicacion: { contains: query.search, mode: 'insensitive' } },
        { descripcion: { contains: query.search, mode: 'insensitive' } },
        { observaciones: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    const skip = (query.page - 1) * query.limit;

    const [data, total] = await Promise.all([
      this.prisma.aula.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: [
          { activa: 'desc' }, // Activas primero
          { nombre: 'asc' }
        ],
        include: {
          tipoAula: true,
          estadoAula: true,
          aulas_equipamientos: {
            include: {
              equipamiento: true
            }
          },
          _count: {
            select: {
              reserva_aulas: true,
              reservas_aulas_secciones: true,
              aulas_equipamientos: true
            }
          }
        }
      }),
      this.prisma.aula.count({ where })
    ]);

    return { data, total };
  }

  async findById(id: string): Promise<Aula | null> {
    return this.prisma.aula.findUnique({
      where: { id: parseInt(id) },
      include: {
        tipoAula: true,
        estadoAula: true,
        aulas_equipamientos: {
          include: {
            equipamiento: true
          },
          orderBy: {
            equipamiento: {
              nombre: 'asc'
            }
          }
        },
        reserva_aulas: {
          include: {
            actividades: {
              select: {
                id: true,
                nombre: true,
                tipoActividadId: true
              }
            }
          },
          orderBy: {
            fechaInicio: 'asc'
          }
        },
        _count: {
          select: {
            reserva_aulas: true,
            reservas_aulas_secciones: true,
            aulas_equipamientos: true
          }
        }
      }
    });
  }

  /**
   * Encuentra un aula por ID sin incluir relaciones (más rápido para validaciones)
   */
  async findByIdSimple(id: string): Promise<Aula | null> {
    return this.prisma.aula.findUnique({
      where: { id: parseInt(id) }
    });
  }

  async findByNombre(nombre: string): Promise<Aula | null> {
    return this.prisma.aula.findUnique({
      where: { nombre }
    });
  }

  async update(id: string, data: Partial<CreateAulaDto>): Promise<Aula> {
    const updateData: any = {};

    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.capacidad !== undefined) updateData.capacidad = data.capacidad;
    if (data.ubicacion !== undefined) updateData.ubicacion = data.ubicacion;
    if (data.tipoAulaId !== undefined) updateData.tipoAulaId = data.tipoAulaId;
    if (data.estadoAulaId !== undefined) updateData.estadoAulaId = data.estadoAulaId;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    if (data.observaciones !== undefined) updateData.observaciones = data.observaciones;
    if (data.activa !== undefined) updateData.activa = data.activa;

    return this.prisma.aula.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        tipoAula: true,
        estadoAula: true,
        aulas_equipamientos: {
          include: {
            equipamiento: true
          }
        }
      }
    });
  }

  async delete(id: string): Promise<Aula> {
    return this.prisma.aula.delete({
      where: { id: parseInt(id) }
    });
  }

  async softDelete(id: string): Promise<Aula> {
    return this.prisma.aula.update({
      where: { id: parseInt(id) },
      data: { activa: false }
    });
  }

  async getDisponibles(): Promise<Aula[]> {
    return this.prisma.aula.findMany({
      where: { activa: true },
      orderBy: [
        { capacidad: 'asc' },
        { nombre: 'asc' }
      ]
    });
  }

  async verificarDisponibilidad(
    aulaId: string,
    fechaInicio: Date,
    fechaFin: Date,
    excluirReservaId?: string
  ): Promise<boolean> {
    const where: any = {
      aula_id: aulaId,
      OR: [
        // Reserva que empieza durante el período solicitado
        {
          fecha_vigencia_desde: {
            gte: fechaInicio,
            lt: fechaFin
          }
        },
        // Reserva que termina durante el período solicitado (si tiene fecha de fin)
        {
          fecha_vigencia_hasta: {
            gt: fechaInicio,
            lte: fechaFin
          }
        },
        // Reserva que abarca todo el período solicitado
        {
          AND: [
            { fecha_vigencia_desde: { lte: fechaInicio } },
            {
              OR: [
                { fecha_vigencia_hasta: { gte: fechaFin } },
                { fecha_vigencia_hasta: null } // Sin fecha de fin significa vigencia indefinida
              ]
            }
          ]
        }
      ]
    };

    // Excluir una reserva específica (útil para editar reservas)
    if (excluirReservaId) {
      where.id = { not: parseInt(excluirReservaId) };
    }

    const conflictingReservations = await this.prisma.reserva_aulas.findFirst({
      where: {
        aulaId: parseInt(aulaId),
        OR: [
          {
            fechaInicio: {
              gte: fechaInicio,
              lt: fechaFin
            }
          },
          {
            fechaFin: {
              gt: fechaInicio,
              lte: fechaFin
            }
          },
          {
            AND: [
              { fechaInicio: { lte: fechaInicio } },
              { fechaFin: { gte: fechaFin } }
            ]
          }
        ]
      }
    });

    return !conflictingReservations; // true = disponible, false = ocupada
  }

  async getReservasEnPeriodo(
    aulaId: string,
    fechaInicio: Date,
    fechaFin: Date
  ): Promise<any[]> {
    return this.prisma.reserva_aulas.findMany({
      where: {
        aulaId: parseInt(aulaId),
        OR: [
          {
            fechaInicio: {
              gte: fechaInicio,
              lte: fechaFin
            }
          },
          {
            fechaFin: {
              gte: fechaInicio,
              lte: fechaFin
            }
          },
          {
            AND: [
              { fechaInicio: { lte: fechaInicio } },
              { fechaFin: { gte: fechaFin } }
            ]
          }
        ]
      },
      include: {
        actividades: {
          select: {
            id: true,
            nombre: true,
            tipoActividadId: true
          }
        }
      },
      orderBy: {
        fechaInicio: 'asc'
      }
    });
  }

  async getEstadisticas(aulaId: string): Promise<any> {
    const aula = await this.prisma.aula.findUnique({
      where: { id: parseInt(aulaId) },
      include: {
        _count: {
          select: {
            reserva_aulas: true,
            reservas_aulas_secciones: true
          }
        }
      }
    });

    if (!aula) return null;

    // Obtener reservas con sus actividades
    const reservasConActividades = await this.prisma.reserva_aulas.findMany({
      where: {
        aulaId: parseInt(aulaId)
      },
      include: {
        actividades: {
          select: {
            id: true,
            nombre: true,
            tipoActividadId: true
          }
        }
      }
    });

    // Agrupar por actividad
    const actividadMap = new Map<number, { actividad: any; count: number }>();
    reservasConActividades.forEach(reserva => {
      if (reserva.actividades) {
        const actividadId = reserva.actividades.id;
        if (!actividadMap.has(actividadId)) {
          actividadMap.set(actividadId, {
            actividad: reserva.actividades,
            count: 0
          });
        }
        actividadMap.get(actividadId)!.count++;
      }
    });

    const reservasPorActividadConNombre = Array.from(actividadMap.values());

    // Reservas del mes actual
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const finMes = new Date(inicioMes);
    finMes.setMonth(finMes.getMonth() + 1);
    finMes.setDate(0);
    finMes.setHours(23, 59, 59, 999);

    const reservasMesActual = await this.prisma.reserva_aulas.count({
      where: {
        aulaId: parseInt(aulaId),
        fechaInicio: {
          gte: inicioMes,
          lte: finMes
        }
      }
    });

    return {
      totalReservas: aula._count.reserva_aulas,
      capacidad: aula.capacidad,
      reservasPorActividad: reservasPorActividadConNombre,
      reservasMesActual,
      aulaInfo: {
        nombre: aula.nombre,
        ubicacion: aula.ubicacion,
        equipamiento: aula.equipamiento
      }
    };
  }

  async getAulasConMenorUso(): Promise<any[]> {
    const aulas = await this.prisma.aula.findMany({
      where: { activa: true },
      include: {
        _count: {
          select: {
            reserva_aulas: true
          }
        }
      },
      orderBy: {
        reserva_aulas: {
          _count: 'asc'
        }
      }
    });

    return aulas.map(aula => ({
      id: aula.id,
      nombre: aula.nombre,
      capacidad: aula.capacidad,
      ubicacion: aula.ubicacion,
      totalReservas: aula._count.reserva_aulas
    }));
  }

  // ============================================================================
  // MÉTODOS PARA GESTIÓN DE EQUIPAMIENTOS
  // ============================================================================

  async addEquipamiento(
    aulaId: number,
    equipamientoId: number,
    cantidad: number,
    observaciones?: string
  ): Promise<any> {
    return this.prisma.aulaEquipamiento.create({
      data: {
        aulaId,
        equipamientoId,
        cantidad,
        observaciones
      },
      include: {
        equipamiento: true,
        aula: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    });
  }

  async removeEquipamiento(aulaId: number, equipamientoId: number): Promise<any> {
    return this.prisma.aulaEquipamiento.delete({
      where: {
        aulaId_equipamientoId: {
          aulaId,
          equipamientoId
        }
      }
    });
  }

  async updateEquipamientoCantidad(
    aulaId: number,
    equipamientoId: number,
    cantidad: number,
    observaciones?: string
  ): Promise<any> {
    return this.prisma.aulaEquipamiento.update({
      where: {
        aulaId_equipamientoId: {
          aulaId,
          equipamientoId
        }
      },
      data: {
        cantidad,
        ...(observaciones !== undefined && { observaciones })
      },
      include: {
        equipamiento: true
      }
    });
  }

  async getEquipamientos(aulaId: number): Promise<any[]> {
    return this.prisma.aulaEquipamiento.findMany({
      where: { aulaId },
      include: {
        equipamiento: true
      },
      orderBy: {
        equipamiento: {
          nombre: 'asc'
        }
      }
    });
  }

  async checkEquipamientoExists(aulaId: number, equipamientoId: number): Promise<boolean> {
    const exists = await this.prisma.aulaEquipamiento.findUnique({
      where: {
        aulaId_equipamientoId: {
          aulaId,
          equipamientoId
        }
      }
    });
    return exists !== null;
  }
}