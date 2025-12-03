// @ts-nocheck
import { PrismaClient, actividades_aulas, Prisma } from '@prisma/client';
import {
  CreateActividadAulaDto,
  QueryActividadesAulasDto
} from '@/dto/actividad-aula.dto';

type ActividadAulaConRelaciones = {
  id: number;
  actividadId: number;
  aulaId: number;
  fechaAsignacion: Date;
  fechaDesasignacion: Date | null;
  activa: boolean;
  prioridad: number | null;
  observaciones: string | null;
  createdAt: Date;
  updatedAt: Date;
  actividades: {
    id: number;
    nombre: string;
    codigoActividad: string;
    capacidadMaxima: number | null;
    activa: boolean;
  };
  aulas: {
    id: number;
    nombre: string;
    capacidad: number;
    ubicacion: string | null;
    activa: boolean;
  };
};

export class ActividadAulaRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateActividadAulaDto): Promise<ActividadAulaConRelaciones> {
    return this.prisma.actividades_aulas.create({
      data: {
        actividadId: data.actividadId,
        aulaId: data.aulaId,
        fechaAsignacion: data.fechaAsignacion ? new Date(data.fechaAsignacion) : new Date(),
        fechaDesasignacion: data.fechaDesasignacion ? new Date(data.fechaDesasignacion) : null,
        activa: data.activa !== undefined ? data.activa : true,
        prioridad: data.prioridad || 1,
        observaciones: data.observaciones || null
      },
      include: {
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigoActividad: true,
            capacidadMaxima: true,
            activa: true,
            descripcion: true
          }
        },
        aulas: {
          select: {
            id: true,
            nombre: true,
            capacidad: true,
            ubicacion: true,
            activa: true,
            tipoAulaId: true
          }
        }
      }
    });
  }

  async findAll(query: QueryActividadesAulasDto): Promise<{
    data: ActividadAulaConRelaciones[];
    total: number;
  }> {
    const where: Prisma.actividades_aulasWhereInput = {};

    // Filtros básicos
    if (query.actividadId) {
      where.actividadId = query.actividadId;
    }

    if (query.aulaId) {
      where.aulaId = query.aulaId;
    }

    if (query.activa !== undefined) {
      where.activa = query.activa;
    }

    const skip = (query.page - 1) * query.limit;

    const [data, total] = await Promise.all([
      this.prisma.actividades_aulas.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: [
          { activa: 'desc' }, // Activas primero
          { prioridad: 'asc' }, // Luego por prioridad
          { fechaAsignacion: 'desc' } // Más recientes primero
        ],
        include: query.incluirRelaciones
          ? {
              actividades: {
                select: {
                  id: true,
                  nombre: true,
                  codigoActividad: true,
                  capacidadMaxima: true,
                  activa: true,
                  descripcion: true
                }
              },
              aulas: {
                select: {
                  id: true,
                  nombre: true,
                  capacidad: true,
                  ubicacion: true,
                  activa: true,
                  tipoAulaId: true
                }
              }
            }
          : undefined
      }),
      this.prisma.actividades_aulas.count({ where })
    ]);

    return { data, total };
  }

  async findById(id: number): Promise<ActividadAulaConRelaciones | null> {
    return this.prisma.actividades_aulas.findUnique({
      where: { id },
      include: {
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigoActividad: true,
            capacidadMaxima: true,
            activa: true,
            descripcion: true
          }
        },
        aulas: {
          select: {
            id: true,
            nombre: true,
            capacidad: true,
            ubicacion: true,
            activa: true,
            tipoAulaId: true
          }
        }
      }
    });
  }

  async findByActividadId(actividadId: number, soloActivas: boolean = true): Promise<ActividadAulaConRelaciones[]> {
    const where: Prisma.actividades_aulasWhereInput = { actividadId };

    if (soloActivas) {
      where.activa = true;
      where.OR = [
        { fechaDesasignacion: null },
        { fechaDesasignacion: { gt: new Date() } }
      ];
    }

    return this.prisma.actividades_aulas.findMany({
      where,
      include: {
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigoActividad: true,
            capacidadMaxima: true,
            activa: true
          }
        },
        aulas: {
          select: {
            id: true,
            nombre: true,
            capacidad: true,
            ubicacion: true,
            activa: true
          }
        }
      },
      orderBy: [
        { prioridad: 'asc' },
        { fechaAsignacion: 'desc' }
      ]
    });
  }

  async findByAulaId(aulaId: number, soloActivas: boolean = true): Promise<ActividadAulaConRelaciones[]> {
    const where: Prisma.actividades_aulasWhereInput = { aulaId };

    if (soloActivas) {
      where.activa = true;
      where.OR = [
        { fechaDesasignacion: null },
        { fechaDesasignacion: { gt: new Date() } }
      ];
    }

    return this.prisma.actividades_aulas.findMany({
      where,
      include: {
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigoActividad: true,
            capacidadMaxima: true,
            activa: true,
            descripcion: true
          }
        },
        aulas: {
          select: {
            id: true,
            nombre: true,
            capacidad: true,
            ubicacion: true,
            activa: true
          }
        }
      },
      orderBy: [
        { fechaAsignacion: 'desc' }
      ]
    });
  }

  async findByActividadAndAula(actividadId: number, aulaId: number): Promise<ActividadAulaConRelaciones | null> {
    return this.prisma.actividades_aulas.findFirst({
      where: {
        actividadId,
        aulaId
      },
      include: {
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigoActividad: true,
            capacidadMaxima: true,
            activa: true
          }
        },
        aulas: {
          select: {
            id: true,
            nombre: true,
            capacidad: true,
            ubicacion: true,
            activa: true
          }
        }
      }
    });
  }

  async update(id: number, data: Partial<CreateActividadAulaDto>): Promise<ActividadAulaConRelaciones> {
    const updateData: any = {};

    if (data.prioridad !== undefined) updateData.prioridad = data.prioridad;
    if (data.fechaDesasignacion !== undefined) {
      updateData.fechaDesasignacion = data.fechaDesasignacion ? new Date(data.fechaDesasignacion) : null;
    }
    if (data.activa !== undefined) updateData.activa = data.activa;
    if (data.observaciones !== undefined) updateData.observaciones = data.observaciones || null;

    return this.prisma.actividades_aulas.update({
      where: { id },
      data: updateData,
      include: {
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigoActividad: true,
            capacidadMaxima: true,
            activa: true
          }
        },
        aulas: {
          select: {
            id: true,
            nombre: true,
            capacidad: true,
            ubicacion: true,
            activa: true
          }
        }
      }
    });
  }

  async delete(id: number): Promise<ActividadAulaConRelaciones> {
    return this.prisma.actividades_aulas.delete({
      where: { id },
      include: {
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigoActividad: true,
            capacidadMaxima: true,
            activa: true
          }
        },
        aulas: {
          select: {
            id: true,
            nombre: true,
            capacidad: true,
            ubicacion: true,
            activa: true
          }
        }
      }
    });
  }

  async desasignar(id: number, fechaDesasignacion?: Date, observaciones?: string): Promise<ActividadAulaConRelaciones> {
    const updateData: any = {
      activa: false,
      fechaDesasignacion: fechaDesasignacion || new Date()
    };

    if (observaciones) {
      updateData.observaciones = observaciones;
    }

    return this.prisma.actividades_aulas.update({
      where: { id },
      data: updateData,
      include: {
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigoActividad: true,
            capacidadMaxima: true,
            activa: true
          }
        },
        aulas: {
          select: {
            id: true,
            nombre: true,
            capacidad: true,
            ubicacion: true,
            activa: true
          }
        }
      }
    });
  }

  async reactivar(id: number): Promise<ActividadAulaConRelaciones> {
    return this.prisma.actividades_aulas.update({
      where: { id },
      data: {
        activa: true,
        fechaDesasignacion: null
      },
      include: {
        actividades: {
          select: {
            id: true,
            nombre: true,
            codigoActividad: true,
            capacidadMaxima: true,
            activa: true
          }
        },
        aulas: {
          select: {
            id: true,
            nombre: true,
            capacidad: true,
            ubicacion: true,
            activa: true
          }
        }
      }
    });
  }

  async countAsignacionesActivas(aulaId: number): Promise<number> {
    return this.prisma.actividades_aulas.count({
      where: {
        aulaId,
        activa: true,
        OR: [
          { fechaDesasignacion: null },
          { fechaDesasignacion: { gt: new Date() } }
        ]
      }
    });
  }

  async contarActividadesPorAula(aulaId: number): Promise<{
    total: number;
    activas: number;
    inactivas: number;
  }> {
    const [total, activas] = await Promise.all([
      this.prisma.actividades_aulas.count({
        where: { aulaId }
      }),
      this.prisma.actividades_aulas.count({
        where: { aulaId, activa: true }
      })
    ]);

    return {
      total,
      activas,
      inactivas: total - activas
    };
  }

  /**
   * Obtiene todas las actividades que usan el aula en días/horarios específicos
   * CRÍTICO para detección de conflictos
   */
  async getActividadesEnAulaPorHorarios(
    aulaId: number,
    diaSemanaId: number,
    horaInicio: string,
    horaFin: string,
    excluirActividadId?: number
  ): Promise<any[]> {
    // Obtener todas las actividades activas asignadas al aula
    const asignaciones = await this.prisma.actividades_aulas.findMany({
      where: {
        aulaId,
        activa: true,
        ...(excluirActividadId && {
          actividadId: { not: excluirActividadId }
        })
      },
      include: {
        actividades: {
          include: {
            horarios_actividades: {
              where: {
                activo: true,
                diaSemanaId: diaSemanaId
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

    // Filtrar por solapamiento de horarios
    const conflictos: any[] = [];
    const [horaInicioH, horaInicioM] = horaInicio.split(':').map(Number);
    const [horaFinH, horaFinM] = horaFin.split(':').map(Number);
    const inicioMinutos = horaInicioH * 60 + horaInicioM;
    const finMinutos = horaFinH * 60 + horaFinM;

    for (const asignacion of asignaciones) {
      for (const horario of asignacion.actividades.horarios_actividades) {
        const [hInicioH, hInicioM] = horario.horaInicio.split(':').map(Number);
        const [hFinH, hFinM] = horario.horaFin.split(':').map(Number);
        const hInicioMinutos = hInicioH * 60 + hInicioM;
        const hFinMinutos = hFinH * 60 + hFinM;

        // Verificar overlap: (inicio < horario.fin) AND (fin > horario.inicio)
        if (inicioMinutos < hFinMinutos && finMinutos > hInicioMinutos) {
          conflictos.push({
            tipo: 'ACTIVIDAD',
            asignacionId: asignacion.id,
            actividadId: asignacion.actividadId,
            actividadNombre: asignacion.actividades.nombre,
            aulaId: asignacion.aulaId,
            aulaNombre: asignacion.aulas.nombre,
            diaSemanaId: horario.diaSemanaId,
            horaInicio: horario.horaInicio,
            horaFin: horario.horaFin
          });
        }
      }
    }

    return conflictos;
  }
}
