// @ts-nocheck
import { PrismaClient, ReservaAula, Prisma } from '@prisma/client';
import {
  CreateReservaAulaDto,
  ReservaAulaQueryDto,
  ConflictDetectionDto,
  ReservaSearchDto,
  ReservaStatsDto
} from '@/dto/reserva-aula.dto';

export class ReservaAulaRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateReservaAulaDto): Promise<ReservaAula> {
    return this.prisma.reserva_aulas.create({
      data: {
        ...data,
        fechaInicio: new Date(data.fechaInicio),
        fechaFin: new Date(data.fechaFin)
      },
      include: {
        aulas: {
          select: {
            id: true,
            nombre: true,
            capacidad: true,
            ubicacion: true,
            activa: true
          }
        },
        actividades: {
          select: {
            id: true,
            nombre: true,
            descripcion: true
          }
        },
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            especialidad: true
          }
        },
        estadoReserva: {
          select: {
            id: true,
            codigo: true,
            nombre: true
          }
        },
        canceladoPor: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        },
        aprobadoPor: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        }
      }
    });
  }

  async findAll(query: ReservaAulaQueryDto): Promise<{ data: ReservaAula[]; total: number }> {
    const where: Prisma.ReservaAulaWhereInput = {};

    if (query.aulaId) {
      where.aulaId = query.aulaId;
    }

    if (query.actividadId) {
      where.actividadId = query.actividadId;
    }

    if (query.docenteId) {
      where.docenteId = query.docenteId;
    }

    if (query.estadoReservaId) {
      where.estadoReservaId = query.estadoReservaId;
    }

    // Solo activas por defecto
    if (query.soloActivas) {
      where.activa = true;
    }

    // Date range filtering
    if (query.fechaDesde || query.fechaHasta) {
      where.fechaInicio = {};
      if (query.fechaDesde) {
        where.fechaInicio.gte = new Date(query.fechaDesde);
      }
      if (query.fechaHasta) {
        where.fechaInicio.lte = new Date(query.fechaHasta);
      }
    }

    // Filter out past reservations by default
    if (!query.incluirPasadas) {
      const now = new Date();
      if (!where.fechaFin) {
        where.fechaFin = {};
      }
      where.fechaFin.gte = now;
    }

    const skip = (query.page - 1) * query.limit;

    const [data, total] = await Promise.all([
      this.prisma.reserva_aulas.findMany({
        where,
        skip,
        take: query.limit,
        include: {
          aula: {
            select: {
              id: true,
              nombre: true,
              capacidad: true,
              ubicacion: true,
              activa: true
            }
          },
          actividad: {
            select: {
              id: true,
              nombre: true,
              descripcion: true,
              activa: true
            }
          },
          docente: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              dni: true,
              especialidad: true,
              fechaBaja: true
            }
          },
          estadoReserva: {
            select: {
              id: true,
              codigo: true,
              nombre: true
            }
          },
          canceladoPor: {
            select: {
              id: true,
              nombre: true,
              apellido: true
            }
          },
          aprobadoPor: {
            select: {
              id: true,
              nombre: true,
              apellido: true
            }
          }
        },
        orderBy: [
          { fechaInicio: 'asc' },
          { aulas: { nombre: 'asc' } }
        ]
      }),
      this.prisma.reserva_aulas.count({ where })
    ]);

    return { data, total };
  }

  async findById(id: number): Promise<ReservaAula | null> {
    return this.prisma.reserva_aulas.findUnique({
      where: { id },
      include: {
        aulas: {
          select: {
            id: true,
            nombre: true,
            capacidad: true,
            ubicacion: true,
            equipamiento: true,
            activa: true
          }
        },
        actividades: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            activa: true
          }
        },
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            especialidad: true,
            fechaBaja: true,
            email: true,
            telefono: true
          }
        },
        estadoReserva: {
          select: {
            id: true,
            codigo: true,
            nombre: true
          }
        },
        canceladoPor: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        },
        aprobadoPor: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        }
      }
    });
  }

  async findByAulaId(aulaId: string, incluirPasadas = false): Promise<ReservaAula[]> {
    const where: Prisma.ReservaAulaWhereInput = { aulaId };

    if (!incluirPasadas) {
      const now = new Date();
      where.fechaFin = { gte: now };
    }

    return this.prisma.reserva_aulas.findMany({
      where,
      include: {
        actividades: {
          select: {
            id: true,
            nombre: true
          }
        },
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            especialidad: true
          }
        },
        estadoReserva: {
          select: {
            id: true,
            codigo: true,
            nombre: true
          }
        }
      },
      orderBy: { fechaInicio: 'asc' }
    });
  }

  async findByDocenteId(docenteId: string, incluirPasadas = false): Promise<ReservaAula[]> {
    const where: Prisma.ReservaAulaWhereInput = { docenteId };

    if (!incluirPasadas) {
      const now = new Date();
      where.fechaFin = { gte: now };
    }

    return this.prisma.reserva_aulas.findMany({
      where,
      include: {
        aulas: {
          select: {
            id: true,
            nombre: true,
            ubicacion: true
          }
        },
        actividades: {
          select: {
            id: true,
            nombre: true
          }
        },
        estadoReserva: {
          select: {
            id: true,
            codigo: true,
            nombre: true
          }
        }
      },
      orderBy: { fechaInicio: 'asc' }
    });
  }

  async findByActividadId(actividadId: string, incluirPasadas = false): Promise<ReservaAula[]> {
    const where: Prisma.ReservaAulaWhereInput = { actividadId };

    if (!incluirPasadas) {
      const now = new Date();
      where.fechaFin = { gte: now };
    }

    return this.prisma.reserva_aulas.findMany({
      where,
      include: {
        aulas: {
          select: {
            id: true,
            nombre: true,
            ubicacion: true
          }
        },
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        },
        estadoReserva: {
          select: {
            id: true,
            codigo: true,
            nombre: true
          }
        }
      },
      orderBy: { fechaInicio: 'asc' }
    });
  }

  async detectConflicts(conflictData: ConflictDetectionDto): Promise<ReservaAula[]> {
    const { aulaId, fechaInicio, fechaFin, excludeReservaId } = conflictData;

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    const where: Prisma.ReservaAulaWhereInput = {
      aulaId,
      OR: [
        // Overlap scenarios:
        // 1. New reservation starts before existing ends and ends after existing starts
        {
          AND: [
            { fechaInicio: { lt: fin } },
            { fechaFin: { gt: inicio } }
          ]
        }
      ]
    };

    // Exclude current reservation when updating
    if (excludeReservaId) {
      where.id = { not: excludeReservaId };
    }

    return this.prisma.reserva_aulas.findMany({
      where,
      include: {
        aulas: {
          select: {
            id: true,
            nombre: true
          }
        },
        actividades: {
          select: {
            id: true,
            nombre: true
          }
        },
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        }
      },
      orderBy: { fechaInicio: 'asc' }
    });
  }

  async update(id: number, data: Partial<CreateReservaAulaDto>): Promise<ReservaAula> {
    const updateData: any = { ...data };

    if (updateData.fechaInicio) {
      updateData.fechaInicio = new Date(updateData.fechaInicio);
    }

    if (updateData.fechaFin) {
      updateData.fechaFin = new Date(updateData.fechaFin);
    }

    return this.prisma.reserva_aulas.update({
      where: { id },
      data: updateData,
      include: {
        aulas: {
          select: {
            id: true,
            nombre: true,
            capacidad: true,
            ubicacion: true
          }
        },
        actividades: {
          select: {
            id: true,
            nombre: true
          }
        },
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            especialidad: true
          }
        },
        estadoReserva: {
          select: {
            id: true,
            codigo: true,
            nombre: true
          }
        },
        canceladoPor: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        },
        aprobadoPor: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        }
      }
    });
  }

  async delete(id: number): Promise<ReservaAula> {
    return this.prisma.reserva_aulas.delete({
      where: { id }
    });
  }

  async deleteBulk(ids: number[]): Promise<{ count: number }> {
    return this.prisma.reserva_aulas.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });
  }

  async createBulk(reservas: CreateReservaAulaDto[]): Promise<{ count: number }> {
    const data = reservas.map(reserva => ({
      ...reserva,
      fechaInicio: new Date(reserva.fechaInicio),
      fechaFin: new Date(reserva.fechaFin)
    }));

    return this.prisma.reserva_aulas.createMany({
      data,
      skipDuplicates: false // We want to catch conflicts
    });
  }

  async search(searchData: ReservaSearchDto): Promise<ReservaAula[]> {
    const { search, searchBy, fechaDesde, fechaHasta, incluirPasadas } = searchData;

    let searchConditions: Prisma.ReservaAulaWhereInput[] = [];

    if (searchBy === 'all' || searchBy === 'aula') {
      searchConditions.push({
        aulas: {
          nombre: { contains: search, mode: 'insensitive' }
        }
      });
    }

    if (searchBy === 'all' || searchBy === 'docente') {
      searchConditions.push({
        personas: {
          OR: [
            { nombre: { contains: search, mode: 'insensitive' } },
            { apellido: { contains: search, mode: 'insensitive' } }
          ]
        }
      });
    }

    if (searchBy === 'all' || searchBy === 'actividad') {
      searchConditions.push({
        actividades: {
          nombre: { contains: search, mode: 'insensitive' }
        }
      });
    }

    if (searchBy === 'all' || searchBy === 'observaciones') {
      searchConditions.push({
        observaciones: { contains: search, mode: 'insensitive' }
      });
    }

    const where: Prisma.ReservaAulaWhereInput = {
      OR: searchConditions
    };

    // Date range filtering
    if (fechaDesde || fechaHasta) {
      where.fechaInicio = {};
      if (fechaDesde) {
        where.fechaInicio.gte = new Date(fechaDesde);
      }
      if (fechaHasta) {
        where.fechaInicio.lte = new Date(fechaHasta);
      }
    }

    // Filter past reservations
    if (!incluirPasadas) {
      const now = new Date();
      if (!where.fechaFin) {
        where.fechaFin = {};
      }
      where.fechaFin.gte = now;
    }

    return this.prisma.reserva_aulas.findMany({
      where,
      include: {
        aulas: {
          select: {
            id: true,
            nombre: true,
            ubicacion: true
          }
        },
        actividades: {
          select: {
            id: true,
            nombre: true
          }
        },
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            especialidad: true
          }
        },
        estadoReserva: {
          select: {
            id: true,
            codigo: true,
            nombre: true
          }
        }
      },
      orderBy: { fechaInicio: 'asc' }
    });
  }

  async getStatistics(statsData: ReservaStatsDto): Promise<any> {
    const { fechaDesde, fechaHasta, agruparPor } = statsData;

    const where: Prisma.ReservaAulaWhereInput = {
      fechaInicio: {
        gte: new Date(fechaDesde),
        lte: new Date(fechaHasta)
      }
    };

    switch (agruparPor) {
      case 'aula':
        return this.prisma.reserva_aulas.groupBy({
          by: ['aulaId'],
          where,
          _count: {
            id: true
          },
          orderBy: {
            _count: {
              id: 'desc'
            }
          }
        });

      case 'docente':
        return this.prisma.reserva_aulas.groupBy({
          by: ['docenteId'],
          where,
          _count: {
            id: true
          },
          orderBy: {
            _count: {
              id: 'desc'
            }
          }
        });

      case 'actividad':
        return this.prisma.reserva_aulas.groupBy({
          by: ['actividadId'],
          where,
          _count: {
            id: true
          },
          orderBy: {
            _count: {
              id: 'desc'
            }
          }
        });

      default:
        // General statistics
        return this.prisma.reserva_aulas.aggregate({
          where,
          _count: {
            id: true
          }
        });
    }
  }

  async getUpcomingReservations(limit = 10): Promise<ReservaAula[]> {
    const now = new Date();

    return this.prisma.reserva_aulas.findMany({
      where: {
        fechaInicio: {
          gte: now
        }
      },
      include: {
        aulas: {
          select: {
            id: true,
            nombre: true,
            ubicacion: true
          }
        },
        actividades: {
          select: {
            id: true,
            nombre: true
          }
        },
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        },
        estadoReserva: {
          select: {
            id: true,
            codigo: true,
            nombre: true
          }
        }
      },
      orderBy: { fechaInicio: 'asc' },
      take: limit
    });
  }

  async getCurrentReservations(): Promise<ReservaAula[]> {
    const now = new Date();

    return this.prisma.reserva_aulas.findMany({
      where: {
        fechaInicio: {
          lte: now
        },
        fechaFin: {
          gte: now
        }
      },
      include: {
        aulas: {
          select: {
            id: true,
            nombre: true,
            ubicacion: true
          }
        },
        actividades: {
          select: {
            id: true,
            nombre: true
          }
        },
        personas: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        },
        estadoReserva: {
          select: {
            id: true,
            codigo: true,
            nombre: true
          }
        }
      },
      orderBy: { fechaInicio: 'asc' }
    });
  }

  /**
   * Detecta conflictos con reservas recurrentes de secciones
   * CRÍTICO: Esta función cierra el GAP identificado donde el sistema
   * NO validaba conflictos con reservas_aulas_secciones
   */
  async detectRecurrentConflicts(conflictData: ConflictDetectionDto): Promise<any[]> {
    const { aulaId, fechaInicio, fechaFin } = conflictData;
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    // Obtener el día de la semana (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
    const diaSemana = inicio.getDay();

    // Map JavaScript day to DIA_SEMANA enum
    const DIAS_MAP = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    const diaEnum = DIAS_MAP[diaSemana];

    // Buscar reservas recurrentes de secciones del mismo aula y día de la semana
    const recurrentReservations = await this.prisma.reservas_aulas_secciones.findMany({
      where: {
        aulaId,
        diaSemana: diaEnum,
        // La reserva recurrente debe estar vigente en la fecha de la reserva puntual
        fechaVigencia: { lte: inicio },
        OR: [
          { fechaFin: null }, // Sin fecha fin = vigente indefinidamente
          { fechaFin: { gte: inicio } } // O vigente hasta después del inicio de la reserva
        ]
      },
      include: {
        secciones_actividades: {
          select: {
            id: true,
            nombre: true,
            actividades: {
              select: {
                id: true,
                nombre: true
              }
            }
          }
        },
        aulas: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    });

    // Filtrar por overlap de horas
    const conflicts: any[] = [];
    const horaInicio = inicio.getHours() * 60 + inicio.getMinutes();
    const horaFin = fin.getHours() * 60 + fin.getMinutes();

    for (const reserva of recurrentReservations) {
      // Convertir horaInicio/horaFin de la reserva recurrente a minutos
      const [reservaHoraInicioH, reservaHoraInicioM] = reserva.horaInicio.split(':').map(Number);
      const [reservaHoraFinH, reservaHoraFinM] = reserva.horaFin.split(':').map(Number);

      const reservaHoraInicioMinutos = reservaHoraInicioH * 60 + reservaHoraInicioM;
      const reservaHoraFinMinutos = reservaHoraFinH * 60 + reservaHoraFinM;

      // Verificar overlap: (inicio < reserva.fin) AND (fin > reserva.inicio)
      if (horaInicio < reservaHoraFinMinutos && horaFin > reservaHoraInicioMinutos) {
        conflicts.push({
          tipo: 'RECURRENTE',
          seccionId: reserva.seccionId,
          aulaId: reserva.aulaId,
          diaSemana: reserva.diaSemana,
          horaInicio: reserva.horaInicio,
          horaFin: reserva.horaFin,
          seccion: reserva.secciones_actividades,
          aula: reserva.aulas
        });
      }
    }

    return conflicts;
  }
}