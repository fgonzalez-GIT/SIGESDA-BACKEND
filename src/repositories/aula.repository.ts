import { PrismaClient, Aula } from '@prisma/client';
import { CreateAulaDto, AulaQueryDto } from '@/dto/aula.dto';

export class AulaRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateAulaDto): Promise<Aula> {
    return this.prisma.aula.create({
      data
    });
  }

  async findAll(query: AulaQueryDto): Promise<{ data: Aula[]; total: number }> {
    const where: any = {};

    if (query.activa !== undefined) {
      where.activa = query.activa;
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
        where.equipamiento = {
          not: null
        };
      } else {
        where.equipamiento = null;
      }
    }

    if (query.search) {
      where.OR = [
        { nombre: { contains: query.search, mode: 'insensitive' } },
        { ubicacion: { contains: query.search, mode: 'insensitive' } },
        { equipamiento: { contains: query.search, mode: 'insensitive' } }
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
          _count: {
            select: {
              reservas: true
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
      where: { id },
      include: {
        reservas: {
          include: {
            actividad: {
              select: {
                id: true,
                nombre: true,
                tipo: true
              }
            },
            docente: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                especialidad: true
              }
            }
          },
          orderBy: {
            fechaInicio: 'asc'
          }
        }
      }
    });
  }

  async findByNombre(nombre: string): Promise<Aula | null> {
    return this.prisma.aula.findUnique({
      where: { nombre }
    });
  }

  async update(id: string, data: Partial<CreateAulaDto>): Promise<Aula> {
    return this.prisma.aula.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<Aula> {
    return this.prisma.aula.delete({
      where: { id }
    });
  }

  async softDelete(id: string): Promise<Aula> {
    return this.prisma.aula.update({
      where: { id },
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
      aulaId,
      OR: [
        // Reserva que empieza durante el período solicitado
        {
          fechaInicio: {
            gte: fechaInicio,
            lt: fechaFin
          }
        },
        // Reserva que termina durante el período solicitado
        {
          fechaFin: {
            gt: fechaInicio,
            lte: fechaFin
          }
        },
        // Reserva que abarca todo el período solicitado
        {
          AND: [
            { fechaInicio: { lte: fechaInicio } },
            { fechaFin: { gte: fechaFin } }
          ]
        }
      ]
    };

    // Excluir una reserva específica (útil para editar reservas)
    if (excluirReservaId) {
      where.id = { not: excluirReservaId };
    }

    const conflictingReservations = await this.prisma.reservaAula.findFirst({
      where
    });

    return !conflictingReservations; // true = disponible, false = ocupada
  }

  async getReservasEnPeriodo(
    aulaId: string,
    fechaInicio: Date,
    fechaFin: Date
  ): Promise<any[]> {
    return this.prisma.reservaAula.findMany({
      where: {
        aulaId,
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
        actividad: {
          select: {
            id: true,
            nombre: true,
            tipo: true
          }
        },
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true
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
      where: { id: aulaId },
      include: {
        _count: {
          select: {
            reservas: true
          }
        }
      }
    });

    if (!aula) return null;

    // Reservas por actividad
    const reservasPorActividad = await this.prisma.reservaAula.groupBy({
      by: ['actividadId'],
      where: {
        aulaId,
        actividadId: { not: null }
      },
      _count: true
    });

    // Obtener nombres de actividades
    const actividadIds = reservasPorActividad
      .map(r => r.actividadId)
      .filter(id => id !== null) as string[];

    const actividades = await this.prisma.actividad.findMany({
      where: { id: { in: actividadIds } },
      select: { id: true, nombre: true, tipo: true }
    });

    const reservasPorActividadConNombre = reservasPorActividad.map(reserva => {
      const actividad = actividades.find(a => a.id === reserva.actividadId);
      return {
        actividad: actividad || { nombre: 'Sin actividad', tipo: null },
        count: reserva._count
      };
    });

    // Reservas del mes actual
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const finMes = new Date(inicioMes);
    finMes.setMonth(finMes.getMonth() + 1);
    finMes.setDate(0);
    finMes.setHours(23, 59, 59, 999);

    const reservasMesActual = await this.prisma.reservaAula.count({
      where: {
        aulaId,
        fechaInicio: {
          gte: inicioMes,
          lte: finMes
        }
      }
    });

    return {
      totalReservas: aula._count.reservas,
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
            reservas: true
          }
        }
      },
      orderBy: {
        reservas: {
          _count: 'asc'
        }
      }
    });

    return aulas.map(aula => ({
      id: aula.id,
      nombre: aula.nombre,
      capacidad: aula.capacidad,
      ubicacion: aula.ubicacion,
      totalReservas: aula._count.reservas
    }));
  }
}