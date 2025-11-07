// @ts-nocheck
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
              reservas_aulas_actividades: true
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
        reservas_aulas_actividades: {
          include: {
            horarios_actividades: {
              include: {
                actividades: {
                  select: {
                    id: true,
                    nombre: true,
                    tipo_actividad_id: true
                  }
                },
                dias_semana: {
                  select: {
                    id: true,
                    nombre: true,
                    codigo: true
                  }
                }
              }
            }
          },
          orderBy: {
            fecha_vigencia_desde: 'asc'
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

    const conflictingReservations = await this.prisma.reservas_aulas_actividades.findFirst({
      where
    });

    return !conflictingReservations; // true = disponible, false = ocupada
  }

  async getReservasEnPeriodo(
    aulaId: string,
    fechaInicio: Date,
    fechaFin: Date
  ): Promise<any[]> {
    return this.prisma.reservas_aulas_actividades.findMany({
      where: {
        aula_id: aulaId,
        OR: [
          {
            fecha_vigencia_desde: {
              gte: fechaInicio,
              lte: fechaFin
            }
          },
          {
            fecha_vigencia_hasta: {
              gte: fechaInicio,
              lte: fechaFin
            }
          },
          {
            AND: [
              { fecha_vigencia_desde: { lte: fechaInicio } },
              {
                OR: [
                  { fecha_vigencia_hasta: { gte: fechaFin } },
                  { fecha_vigencia_hasta: null }
                ]
              }
            ]
          }
        ]
      },
      include: {
        horarios_actividades: {
          include: {
            actividades: {
              select: {
                id: true,
                nombre: true,
                tipo_actividad_id: true
              }
            },
            dias_semana: {
              select: {
                nombre: true,
                codigo: true
              }
            }
          }
        }
      },
      orderBy: {
        fecha_vigencia_desde: 'asc'
      }
    });
  }

  async getEstadisticas(aulaId: string): Promise<any> {
    const aula = await this.prisma.aula.findUnique({
      where: { id: aulaId },
      include: {
        _count: {
          select: {
            reservas_aulas_actividades: true
          }
        }
      }
    });

    if (!aula) return null;

    // Obtener reservas con sus horarios y actividades
    const reservasConActividades = await this.prisma.reservas_aulas_actividades.findMany({
      where: {
        aula_id: aulaId
      },
      include: {
        horarios_actividades: {
          include: {
            actividades: {
              select: {
                id: true,
                nombre: true,
                tipo_actividad_id: true
              }
            }
          }
        }
      }
    });

    // Agrupar por actividad
    const actividadMap = new Map<number, { actividad: any; count: number }>();
    reservasConActividades.forEach(reserva => {
      const actividadId = reserva.horarios_actividades.actividades.id;
      if (!actividadMap.has(actividadId)) {
        actividadMap.set(actividadId, {
          actividad: reserva.horarios_actividades.actividades,
          count: 0
        });
      }
      actividadMap.get(actividadId)!.count++;
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

    const reservasMesActual = await this.prisma.reservas_aulas_actividades.count({
      where: {
        aula_id: aulaId,
        fecha_vigencia_desde: {
          gte: inicioMes,
          lte: finMes
        }
      }
    });

    return {
      totalReservas: aula._count.reservas_aulas_actividades,
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
            reservas_aulas_actividades: true
          }
        }
      },
      orderBy: {
        reservas_aulas_actividades: {
          _count: 'asc'
        }
      }
    });

    return aulas.map(aula => ({
      id: aula.id,
      nombre: aula.nombre,
      capacidad: aula.capacidad,
      ubicacion: aula.ubicacion,
      totalReservas: aula._count.reservas_aulas_actividades
    }));
  }
}