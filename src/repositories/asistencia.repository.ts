// @ts-nocheck
import { PrismaClient, asistencias, Prisma } from '@prisma/client';
import {
  CreateAsistenciaDto,
  RegistroAsistenciaMasivaDto,
  UpdateAsistenciaDto,
  AsistenciaQueryDto,
  ReporteAsistenciasDto,
  TasaAsistenciaDto,
  AlertasInasistenciasDto
} from '@/dto/asistencia.dto';

/**
 * Tipo de asistencia con todas sus relaciones
 */
type AsistenciaConRelaciones = asistencias & {
  participacion: {
    id: number;
    personaId: string;
    actividadId: number;
    persona: {
      id: string;
      nombre: string;
      apellido: string;
      tipo: string;
    };
    actividad: {
      id: number;
      nombre: string;
      tipo: string;
    };
  };
};

/**
 * Repository para manejar operaciones de asistencias a sesiones de actividades
 */
export class AsistenciaRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Crear un registro de asistencia individual
   */
  async create(data: CreateAsistenciaDto): Promise<AsistenciaConRelaciones> {
    return this.prisma.asistencias.create({
      data: {
        participacion_id: data.participacionId,
        fecha_sesion: new Date(data.fechaSesion),
        asistio: data.asistio,
        justificada: data.justificada ?? false,
        observaciones: data.observaciones
      },
      include: {
        participacion: {
          include: {
            persona: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                tipos: {
                  where: { activo: true },
                  include: {
                    tipoPersona: {
                      select: {
                        id: true,
                        codigo: true,
                        nombre: true
                      }
                    }
                  }
                }
              }
            },
            actividad: {
              select: {
                id: true,
                nombre: true,
                tipo: true
              }
            }
          }
        }
      }
    });
  }

  /**
   * Registrar asistencias masivas para una sesión completa de una actividad
   */
  async bulkCreate(data: RegistroAsistenciaMasivaDto): Promise<number> {
    const asistenciasData = data.asistencias.map(a => ({
      participacion_id: a.participacionId,
      fecha_sesion: new Date(data.fechaSesion),
      asistio: a.asistio,
      justificada: a.justificada ?? false,
      observaciones: a.observaciones
    }));

    // Usar createMany para inserción bulk eficiente
    const result = await this.prisma.asistencias.createMany({
      data: asistenciasData,
      skipDuplicates: true // Evitar errores si ya existe el registro
    });

    return result.count;
  }

  /**
   * Obtener todas las asistencias con filtros y paginación
   */
  async findAll(query: AsistenciaQueryDto): Promise<{
    data: AsistenciaConRelaciones[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const where: any = {};

    // Filtro por participación
    if (query.participacionId) {
      where.participacion_id = query.participacionId;
    }

    // Filtro por actividad (requiere join)
    if (query.actividadId) {
      where.participacion = {
        actividadId: query.actividadId
      };
    }

    // Filtro por persona (requiere join)
    if (query.personaId) {
      where.participacion = {
        ...where.participacion,
        personaId: query.personaId
      };
    }

    // Filtro por rango de fechas
    if (query.fechaDesde || query.fechaHasta) {
      where.fecha_sesion = {};
      if (query.fechaDesde) {
        where.fecha_sesion.gte = new Date(query.fechaDesde);
      }
      if (query.fechaHasta) {
        where.fecha_sesion.lte = new Date(query.fechaHasta);
      }
    }

    // Filtro solo inasistencias
    if (query.soloInasistencias) {
      where.asistio = false;
    }

    // Filtro solo justificadas
    if (query.soloJustificadas) {
      where.justificada = true;
    }

    const skip = (query.page - 1) * query.limit;

    const [data, total] = await Promise.all([
      this.prisma.asistencias.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { fecha_sesion: 'desc' },
        include: {
          participacion: {
            include: {
              persona: {
                select: {
                  id: true,
                  nombre: true,
                  apellido: true,
                  tipo: true
                }
              },
              actividad: {
                select: {
                  id: true,
                  nombre: true,
                  tipo: true
                }
              }
            }
          }
        }
      }),
      this.prisma.asistencias.count({ where })
    ]);

    return {
      data,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit)
    };
  }

  /**
   * Obtener una asistencia por ID
   */
  async findById(id: number): Promise<AsistenciaConRelaciones | null> {
    return this.prisma.asistencias.findUnique({
      where: { id },
      include: {
        participacion: {
          include: {
            persona: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                dni: true,
                email: true,
                tipos: {
                  where: { activo: true },
                  include: {
                    tipoPersona: {
                      select: {
                        id: true,
                        codigo: true,
                        nombre: true
                      }
                    }
                  }
                }
              }
            },
            actividad: {
              select: {
                id: true,
                nombre: true,
                tipo: true,
                descripcion: true
              }
            }
          }
        }
      }
    });
  }

  /**
   * Obtener asistencias de una participación específica
   */
  async findByParticipacion(participacionId: number): Promise<AsistenciaConRelaciones[]> {
    return this.prisma.asistencias.findMany({
      where: { participacion_id: participacionId },
      orderBy: { fecha_sesion: 'desc' },
      include: {
        participacion: {
          include: {
            persona: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                tipos: {
                  where: { activo: true },
                  include: {
                    tipoPersona: {
                      select: {
                        id: true,
                        codigo: true,
                        nombre: true
                      }
                    }
                  }
                }
              }
            },
            actividad: {
              select: {
                id: true,
                nombre: true,
                tipo: true
              }
            }
          }
        }
      }
    });
  }

  /**
   * Obtener asistencias de una actividad en un rango de fechas
   */
  async findByActividad(
    actividadId: number,
    fechaDesde?: Date,
    fechaHasta?: Date
  ): Promise<AsistenciaConRelaciones[]> {
    const where: any = {
      participacion: {
        actividadId
      }
    };

    if (fechaDesde || fechaHasta) {
      where.fecha_sesion = {};
      if (fechaDesde) where.fecha_sesion.gte = fechaDesde;
      if (fechaHasta) where.fecha_sesion.lte = fechaHasta;
    }

    return this.prisma.asistencias.findMany({
      where,
      orderBy: [{ fecha_sesion: 'desc' }, { participacion_id: 'asc' }],
      include: {
        participacion: {
          include: {
            persona: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                tipos: {
                  where: { activo: true },
                  include: {
                    tipoPersona: {
                      select: {
                        id: true,
                        codigo: true,
                        nombre: true
                      }
                    }
                  }
                }
              }
            },
            actividad: {
              select: {
                id: true,
                nombre: true,
                tipo: true
              }
            }
          }
        }
      }
    });
  }

  /**
   * Obtener asistencias de una persona en todas sus participaciones
   */
  async findByPersona(
    personaId: string,
    fechaDesde?: Date,
    fechaHasta?: Date
  ): Promise<AsistenciaConRelaciones[]> {
    const where: any = {
      participacion: {
        personaId
      }
    };

    if (fechaDesde || fechaHasta) {
      where.fecha_sesion = {};
      if (fechaDesde) where.fecha_sesion.gte = fechaDesde;
      if (fechaHasta) where.fecha_sesion.lte = fechaHasta;
    }

    return this.prisma.asistencias.findMany({
      where,
      orderBy: [{ fecha_sesion: 'desc' }],
      include: {
        participacion: {
          include: {
            persona: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                tipos: {
                  where: { activo: true },
                  include: {
                    tipoPersona: {
                      select: {
                        id: true,
                        codigo: true,
                        nombre: true
                      }
                    }
                  }
                }
              }
            },
            actividad: {
              select: {
                id: true,
                nombre: true,
                tipo: true
              }
            }
          }
        }
      }
    });
  }

  /**
   * Actualizar un registro de asistencia
   */
  async update(id: number, data: UpdateAsistenciaDto): Promise<AsistenciaConRelaciones> {
    return this.prisma.asistencias.update({
      where: { id },
      data: {
        asistio: data.asistio,
        justificada: data.justificada,
        observaciones: data.observaciones
      },
      include: {
        participacion: {
          include: {
            persona: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                tipos: {
                  where: { activo: true },
                  include: {
                    tipoPersona: {
                      select: {
                        id: true,
                        codigo: true,
                        nombre: true
                      }
                    }
                  }
                }
              }
            },
            actividad: {
              select: {
                id: true,
                nombre: true,
                tipo: true
              }
            }
          }
        }
      }
    });
  }

  /**
   * Eliminar un registro de asistencia
   */
  async delete(id: number): Promise<AsistenciaConRelaciones> {
    return this.prisma.asistencias.delete({
      where: { id },
      include: {
        participacion: {
          include: {
            persona: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                tipos: {
                  where: { activo: true },
                  include: {
                    tipoPersona: {
                      select: {
                        id: true,
                        codigo: true,
                        nombre: true
                      }
                    }
                  }
                }
              }
            },
            actividad: {
              select: {
                id: true,
                nombre: true,
                tipo: true
              }
            }
          }
        }
      }
    });
  }

  /**
   * Calcular tasa de asistencia de una participación
   */
  async getTasaAsistencia(params: TasaAsistenciaDto): Promise<{
    participacionId: number;
    totalSesiones: number;
    asistencias: number;
    inasistencias: number;
    inasistenciasJustificadas: number;
    tasaAsistencia: number;
  }> {
    const where: any = {
      participacion_id: params.participacionId
    };

    if (params.fechaDesde || params.fechaHasta) {
      where.fecha_sesion = {};
      if (params.fechaDesde) where.fecha_sesion.gte = new Date(params.fechaDesde);
      if (params.fechaHasta) where.fecha_sesion.lte = new Date(params.fechaHasta);
    }

    const [totalSesiones, asistencias, inasistenciasJustificadas] = await Promise.all([
      this.prisma.asistencias.count({ where }),
      this.prisma.asistencias.count({ where: { ...where, asistio: true } }),
      this.prisma.asistencias.count({ where: { ...where, asistio: false, justificada: true } })
    ]);

    const inasistencias = totalSesiones - asistencias;
    const tasaAsistencia = totalSesiones > 0 ? (asistencias / totalSesiones) * 100 : 0;

    return {
      participacionId: params.participacionId,
      totalSesiones,
      asistencias,
      inasistencias,
      inasistenciasJustificadas,
      tasaAsistencia: Math.round(tasaAsistencia * 100) / 100 // 2 decimales
    };
  }

  /**
   * Obtener participaciones con inasistencias consecutivas (alertas)
   */
  async getAlertasInasistencias(params: AlertasInasistenciasDto): Promise<any[]> {
    // Query SQL para detectar inasistencias consecutivas
    const umbral = params.umbral;

    // Construir WHERE clause dinámicamente
    const whereConditions = [
      Prisma.sql`a.asistio = false`,
      Prisma.sql`a.justificada = false`
    ];

    if (params.actividadId) {
      whereConditions.push(Prisma.sql`pa.actividad_id = ${params.actividadId}`);
    }

    if (params.soloActivas) {
      whereConditions.push(Prisma.sql`pa.activo = true`);
    }

    const whereClause = Prisma.join(whereConditions, ' AND ');

    const result = await this.prisma.$queryRaw`
      WITH asistencias_ordenadas AS (
        SELECT
          a.id,
          a.participacion_id,
          a.fecha_sesion,
          a.asistio,
          a.justificada,
          pa.persona_id,
          pa.actividad_id,
          ROW_NUMBER() OVER (PARTITION BY a.participacion_id ORDER BY a.fecha_sesion) as sesion_num,
          ROW_NUMBER() OVER (
            PARTITION BY a.participacion_id, a.asistio
            ORDER BY a.fecha_sesion
          ) as grupo_num
        FROM asistencias a
        JOIN participaciones_actividades pa ON a.participacion_id = pa.id
        WHERE ${whereClause}
      ),
      inasistencias_consecutivas AS (
        SELECT
          participacion_id,
          COUNT(*) as inasistencias_consecutivas,
          MIN(fecha_sesion) as fecha_inicio,
          MAX(fecha_sesion) as fecha_ultima
        FROM asistencias_ordenadas
        GROUP BY participacion_id, (sesion_num - grupo_num)
        HAVING COUNT(*) >= ${umbral}
      )
      SELECT DISTINCT
        ic.participacion_id,
        ic.inasistencias_consecutivas,
        ic.fecha_inicio,
        ic.fecha_ultima,
        pa.persona_id,
        p.nombre,
        p.apellido,
        pa.actividad_id,
        ac.nombre as actividad_nombre
      FROM inasistencias_consecutivas ic
      JOIN participaciones_actividades pa ON ic.participacion_id = pa.id
      JOIN personas p ON pa.persona_id = p.id
      JOIN actividades ac ON pa.actividad_id = ac.id
      ORDER BY ic.inasistencias_consecutivas DESC, ic.fecha_ultima DESC
    ` as any[];

    return result;
  }

  /**
   * Generar reporte de asistencias agrupadas
   */
  async getReporteAsistencias(params: ReporteAsistenciasDto): Promise<any[]> {
    const fechaDesde = new Date(params.fechaDesde);
    const fechaHasta = new Date(params.fechaHasta);

    // Construir WHERE clause dinámicamente
    const whereConditions = [
      Prisma.sql`a.fecha_sesion >= ${fechaDesde}::timestamp`,
      Prisma.sql`a.fecha_sesion <= ${fechaHasta}::timestamp`
    ];

    if (params.actividadId) {
      whereConditions.push(Prisma.sql`pa.actividad_id = ${params.actividadId}`);
    }

    if (params.personaId) {
      whereConditions.push(Prisma.sql`pa.persona_id = ${params.personaId}`);
    }

    const whereClause = Prisma.join(whereConditions, ' AND ');

    switch (params.agruparPor) {
      case 'persona':
        return this.prisma.$queryRaw`
          SELECT
            pa.persona_id,
            p.nombre,
            p.apellido,
            COUNT(*) as total_sesiones,
            SUM(CASE WHEN a.asistio = true THEN 1 ELSE 0 END) as asistencias,
            SUM(CASE WHEN a.asistio = false THEN 1 ELSE 0 END) as inasistencias,
            SUM(CASE WHEN a.asistio = false AND a.justificada = true THEN 1 ELSE 0 END) as justificadas,
            ROUND((SUM(CASE WHEN a.asistio = true THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100), 2) as tasa_asistencia
          FROM asistencias a
          JOIN participaciones_actividades pa ON a.participacion_id = pa.id
          JOIN personas p ON pa.persona_id = p.id
          WHERE ${whereClause}
          GROUP BY pa.persona_id, p.nombre, p.apellido
          ORDER BY tasa_asistencia DESC
        ` as any[];

      case 'actividad':
        return this.prisma.$queryRaw`
          SELECT
            pa.actividad_id,
            ac.nombre as actividad_nombre,
            ac.tipo as actividad_tipo,
            COUNT(*) as total_sesiones,
            SUM(CASE WHEN a.asistio = true THEN 1 ELSE 0 END) as asistencias,
            SUM(CASE WHEN a.asistio = false THEN 1 ELSE 0 END) as inasistencias,
            SUM(CASE WHEN a.asistio = false AND a.justificada = true THEN 1 ELSE 0 END) as justificadas,
            ROUND((SUM(CASE WHEN a.asistio = true THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100), 2) as tasa_asistencia
          FROM asistencias a
          JOIN participaciones_actividades pa ON a.participacion_id = pa.id
          JOIN actividades ac ON pa.actividad_id = ac.id
          WHERE ${whereClause}
          GROUP BY pa.actividad_id, ac.nombre, ac.tipo
          ORDER BY tasa_asistencia DESC
        ` as any[];

      case 'mes':
        return this.prisma.$queryRaw`
          SELECT
            DATE_TRUNC('month', a.fecha_sesion) as mes,
            COUNT(*) as total_sesiones,
            SUM(CASE WHEN a.asistio = true THEN 1 ELSE 0 END) as asistencias,
            SUM(CASE WHEN a.asistio = false THEN 1 ELSE 0 END) as inasistencias,
            SUM(CASE WHEN a.asistio = false AND a.justificada = true THEN 1 ELSE 0 END) as justificadas,
            ROUND((SUM(CASE WHEN a.asistio = true THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100), 2) as tasa_asistencia
          FROM asistencias a
          JOIN participaciones_actividades pa ON a.participacion_id = pa.id
          WHERE ${whereClause}
          GROUP BY DATE_TRUNC('month', a.fecha_sesion)
          ORDER BY mes DESC
        ` as any[];

      case 'dia':
      default:
        return this.prisma.$queryRaw`
          SELECT
            DATE(a.fecha_sesion) as dia,
            COUNT(*) as total_sesiones,
            SUM(CASE WHEN a.asistio = true THEN 1 ELSE 0 END) as asistencias,
            SUM(CASE WHEN a.asistio = false THEN 1 ELSE 0 END) as inasistencias,
            SUM(CASE WHEN a.asistio = false AND a.justificada = true THEN 1 ELSE 0 END) as justificadas,
            ROUND((SUM(CASE WHEN a.asistio = true THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100), 2) as tasa_asistencia
          FROM asistencias a
          JOIN participaciones_actividades pa ON a.participacion_id = pa.id
          WHERE ${whereClause}
          GROUP BY DATE(a.fecha_sesion)
          ORDER BY dia DESC
        ` as any[];
    }
  }

  /**
   * Verificar si existe una asistencia para una participación en una fecha específica
   */
  async existeAsistencia(participacionId: number, fechaSesion: Date): Promise<boolean> {
    const count = await this.prisma.asistencias.count({
      where: {
        participacion_id: participacionId,
        fecha_sesion: fechaSesion
      }
    });

    return count > 0;
  }

  /**
   * Obtener estadísticas generales de asistencias
   */
  async getEstadisticasGenerales(actividadId?: number, fechaDesde?: Date, fechaHasta?: Date): Promise<{
    totalSesiones: number;
    totalAsistencias: number;
    totalInasistencias: number;
    totalJustificadas: number;
    tasaAsistenciaGeneral: number;
  }> {
    const where: any = {};

    if (actividadId) {
      where.participacion = { actividadId };
    }

    if (fechaDesde || fechaHasta) {
      where.fecha_sesion = {};
      if (fechaDesde) where.fecha_sesion.gte = fechaDesde;
      if (fechaHasta) where.fecha_sesion.lte = fechaHasta;
    }

    const [totalSesiones, totalAsistencias, totalJustificadas] = await Promise.all([
      this.prisma.asistencias.count({ where }),
      this.prisma.asistencias.count({ where: { ...where, asistio: true } }),
      this.prisma.asistencias.count({ where: { ...where, asistio: false, justificada: true } })
    ]);

    const totalInasistencias = totalSesiones - totalAsistencias;
    const tasaAsistenciaGeneral = totalSesiones > 0 ? (totalAsistencias / totalSesiones) * 100 : 0;

    return {
      totalSesiones,
      totalAsistencias,
      totalInasistencias,
      totalJustificadas,
      tasaAsistenciaGeneral: Math.round(tasaAsistenciaGeneral * 100) / 100
    };
  }
}
