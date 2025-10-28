import { PrismaClient, Persona } from '@prisma/client';
import { CreatePersonaDto, PersonaQueryDto, UpdatePersonaDto } from '@/dto/persona.dto.new';

/**
 * Repository para gestión de Personas (modelo refactorizado)
 * Gestiona solo los datos base de la persona
 * Los tipos y contactos se gestionan con PersonaTipoRepository
 */
export class PersonaRepository {
  constructor(private prisma: PrismaClient) {}

  // ======================================================================
  // CRUD BÁSICO
  // ======================================================================

  /**
   * Crear persona con tipos y contactos
   */
  async create(data: CreatePersonaDto): Promise<Persona> {
    const { tipos = [], contactos = [], ...personaData } = data;

    // Si no se proporciona ningún tipo, asignar NO_SOCIO por defecto
    const tiposFinales = tipos.length === 0
      ? [{ tipoPersonaCodigo: 'NO_SOCIO' as const }]
      : tipos;

    return this.prisma.persona.create({
      data: {
        ...personaData,
        fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : undefined,

        // Crear tipos de persona
        tipos: {
          create: await Promise.all(tiposFinales.map(async (tipo) => {
            // Obtener ID del tipo si se proporcionó código
            let tipoPersonaId = tipo.tipoPersonaId;

            if (!tipoPersonaId && tipo.tipoPersonaCodigo) {
              const tipoCatalogo = await this.prisma.tipoPersonaCatalogo.findUnique({
                where: { codigo: tipo.tipoPersonaCodigo }
              });

              if (!tipoCatalogo) {
                throw new Error(`Tipo de persona '${tipo.tipoPersonaCodigo}' no encontrado`);
              }

              tipoPersonaId = tipoCatalogo.id;
            }

            // Preparar datos del tipo
            const tipoData: any = {
              tipoPersonaId: tipoPersonaId!,
              activo: true
            };

            // Agregar campos específicos según el tipo
            if (tipo.categoriaId) {
              tipoData.categoriaId = tipo.categoriaId;
            }

            if (tipo.numeroSocio) {
              tipoData.numeroSocio = tipo.numeroSocio;
            }

            if (tipo.fechaIngreso) {
              tipoData.fechaIngreso = new Date(tipo.fechaIngreso);
            }

            if (tipo.especialidadId) {
              tipoData.especialidadId = tipo.especialidadId;
            }

            if (tipo.honorariosPorHora) {
              tipoData.honorariosPorHora = tipo.honorariosPorHora;
            }

            if (tipo.cuit) {
              tipoData.cuit = tipo.cuit;
            }

            if (tipo.razonSocial) {
              tipoData.razonSocial = tipo.razonSocial;
            }

            return tipoData;
          }))
        },

        // Crear contactos
        contactos: {
          create: contactos.map((contacto) => ({
            tipoContacto: contacto.tipoContacto,
            valor: contacto.valor,
            principal: contacto.principal ?? false,
            observaciones: contacto.observaciones,
            activo: contacto.activo ?? true
          }))
        }
      },
      include: {
        tipos: {
          include: {
            tipoPersona: true,
            categoria: true,
            especialidad: true
          }
        },
        contactos: true
      }
    });
  }

  /**
   * Buscar todas las personas con filtros
   */
  async findAll(query: PersonaQueryDto): Promise<{ data: Persona[]; total: number }> {
    const where: any = {};

    // Filtro por tipos de persona
    if (query.tiposCodigos && query.tiposCodigos.length > 0) {
      where.tipos = {
        some: {
          activo: true,
          tipoPersona: {
            codigo: { in: query.tiposCodigos }
          }
        }
      };
    }

    // Filtro por categoría de socio
    if (query.categoriaId) {
      where.tipos = {
        some: {
          activo: true,
          categoriaId: query.categoriaId
        }
      };
    }

    // Filtro por especialidad de docente
    if (query.especialidadId) {
      where.tipos = {
        some: {
          activo: true,
          especialidadId: query.especialidadId
        }
      };
    }

    // Filtro por estado activo
    if (query.activo !== undefined) {
      if (query.activo) {
        // Persona activa = tiene al menos un tipo activo sin fecha de desasignación
        where.tipos = {
          some: {
            activo: true,
            fechaDesasignacion: null
          }
        };
      } else {
        // Persona inactiva = todos los tipos desasignados
        where.tipos = {
          every: {
            OR: [
              { activo: false },
              { fechaDesasignacion: { not: null } }
            ]
          }
        };
      }
    }

    // Búsqueda por texto
    if (query.search) {
      where.OR = [
        { nombre: { contains: query.search, mode: 'insensitive' } },
        { apellido: { contains: query.search, mode: 'insensitive' } },
        { dni: { contains: query.search } },
        { email: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    const skip = (query.page - 1) * query.limit;

    // Preparar includes
    const include: any = {};

    if (query.includeTipos) {
      include.tipos = {
        where: { activo: true },
        include: {
          tipoPersona: true,
          categoria: true,
          especialidad: true
        }
      };
    }

    if (query.includeContactos) {
      include.contactos = {
        where: { activo: true }
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.persona.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: [
          { apellido: 'asc' },
          { nombre: 'asc' }
        ],
        include
      }),
      this.prisma.persona.count({ where })
    ]);

    return { data, total };
  }

  /**
   * Buscar persona por ID
   */
  async findById(id: number, includeRelations = true): Promise<Persona | null> {
    return this.prisma.persona.findUnique({
      where: { id },
      include: includeRelations ? {
        tipos: {
          include: {
            tipoPersona: true,
            categoria: true,
            especialidad: true
          },
          orderBy: { fechaAsignacion: 'desc' }
        },
        contactos: {
          where: { activo: true },
          orderBy: [
            { principal: 'desc' },
            { tipoContacto: 'asc' }
          ]
        },
        participaciones_actividades: {
          include: {
            actividades: true
          }
        },
        familiares: {
          include: {
            familiar: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                dni: true
              }
            }
          }
        },
        comisionDirectiva: true
      } : undefined
    });
  }

  /**
   * Buscar persona por DNI
   */
  async findByDni(dni: string): Promise<Persona | null> {
    return this.prisma.persona.findUnique({
      where: { dni },
      include: {
        tipos: {
          where: { activo: true },
          include: {
            tipoPersona: true
          }
        }
      }
    });
  }

  /**
   * Buscar persona por email
   */
  async findByEmail(email: string): Promise<Persona | null> {
    return this.prisma.persona.findUnique({
      where: { email }
    });
  }

  /**
   * Actualizar datos base de persona
   */
  async update(id: number, data: UpdatePersonaDto): Promise<Persona> {
    const updateData: any = { ...data };

    if (updateData.fechaNacimiento) {
      updateData.fechaNacimiento = new Date(updateData.fechaNacimiento);
    }

    return this.prisma.persona.update({
      where: { id },
      data: updateData,
      include: {
        tipos: {
          where: { activo: true },
          include: {
            tipoPersona: true,
            categoria: true,
            especialidad: true
          }
        },
        contactos: {
          where: { activo: true }
        }
      }
    });
  }

  /**
   * Eliminar persona (hard delete)
   */
  async hardDelete(id: number): Promise<Persona> {
    return this.prisma.persona.delete({
      where: { id }
    });
  }

  /**
   * Desactivar todos los tipos de una persona (soft delete)
   */
  async softDelete(id: number, motivo?: string): Promise<Persona> {
    // Desactivar todos los tipos activos
    await this.prisma.personaTipo.updateMany({
      where: {
        personaId: id,
        activo: true
      },
      data: {
        activo: false,
        fechaDesasignacion: new Date(),
        motivoBaja: motivo
      }
    });

    return this.findById(id) as Promise<Persona>;
  }

  // ======================================================================
  // BÚSQUEDAS ESPECÍFICAS
  // ======================================================================

  /**
   * Obtener personas por tipo
   */
  async findByTipo(tipoPersonaCodigo: string, soloActivos = true): Promise<Persona[]> {
    return this.prisma.persona.findMany({
      where: {
        tipos: {
          some: {
            activo: soloActivos ? true : undefined,
            fechaDesasignacion: soloActivos ? null : undefined,
            tipoPersona: {
              codigo: tipoPersonaCodigo
            }
          }
        }
      },
      include: {
        tipos: {
          where: {
            activo: true,
            tipoPersona: {
              codigo: tipoPersonaCodigo
            }
          },
          include: {
            tipoPersona: true,
            categoria: true,
            especialidad: true
          }
        }
      },
      orderBy: [
        { apellido: 'asc' },
        { nombre: 'asc' }
      ]
    });
  }

  /**
   * Obtener socios (con filtros opcionales)
   */
  async getSocios(params?: {
    categoriaId?: number;
    activos?: boolean;
    conNumeroSocio?: boolean;
  }): Promise<Persona[]> {
    const where: any = {
      tipos: {
        some: {
          tipoPersona: {
            codigo: 'SOCIO'
          }
        }
      }
    };

    if (params?.activos) {
      where.tipos.some.activo = true;
      where.tipos.some.fechaDesasignacion = null;
      where.tipos.some.fechaBaja = null;
    }

    if (params?.categoriaId) {
      where.tipos.some.categoriaId = params.categoriaId;
    }

    if (params?.conNumeroSocio) {
      where.tipos.some.numeroSocio = { not: null };
    }

    return this.prisma.persona.findMany({
      where,
      include: {
        tipos: {
          where: {
            tipoPersona: {
              codigo: 'SOCIO'
            },
            activo: params?.activos ? true : undefined
          },
          include: {
            tipoPersona: true,
            categoria: true
          }
        }
      },
      orderBy: [
        { apellido: 'asc' },
        { nombre: 'asc' }
      ]
    });
  }

  /**
   * Obtener docentes
   */
  async getDocentes(params?: {
    especialidadId?: number;
    activos?: boolean;
  }): Promise<Persona[]> {
    const where: any = {
      tipos: {
        some: {
          tipoPersona: {
            codigo: 'DOCENTE'
          }
        }
      }
    };

    if (params?.activos) {
      where.tipos.some.activo = true;
      where.tipos.some.fechaDesasignacion = null;
    }

    if (params?.especialidadId) {
      where.tipos.some.especialidadId = params.especialidadId;
    }

    return this.prisma.persona.findMany({
      where,
      include: {
        tipos: {
          where: {
            tipoPersona: {
              codigo: 'DOCENTE'
            },
            activo: params?.activos ? true : undefined
          },
          include: {
            tipoPersona: true,
            especialidad: true
          }
        }
      },
      orderBy: [
        { apellido: 'asc' },
        { nombre: 'asc' }
      ]
    });
  }

  /**
   * Obtener proveedores
   */
  async getProveedores(activos = true): Promise<Persona[]> {
    return this.prisma.persona.findMany({
      where: {
        tipos: {
          some: {
            tipoPersona: {
              codigo: 'PROVEEDOR'
            },
            activo: activos ? true : undefined,
            fechaDesasignacion: activos ? null : undefined
          }
        }
      },
      include: {
        tipos: {
          where: {
            tipoPersona: {
              codigo: 'PROVEEDOR'
            },
            activo: activos ? true : undefined
          },
          include: {
            tipoPersona: true
          }
        }
      },
      orderBy: [
        { apellido: 'asc' },
        { nombre: 'asc' }
      ]
    });
  }

  /**
   * Buscar personas por texto (search)
   */
  async search(searchTerm: string, tipoPersonaCodigo?: string, limit = 20): Promise<Persona[]> {
    const where: any = {
      OR: [
        { nombre: { contains: searchTerm, mode: 'insensitive' } },
        { apellido: { contains: searchTerm, mode: 'insensitive' } },
        { dni: { contains: searchTerm } },
        { email: { contains: searchTerm, mode: 'insensitive' } }
      ]
    };

    if (tipoPersonaCodigo) {
      where.tipos = {
        some: {
          activo: true,
          tipoPersona: {
            codigo: tipoPersonaCodigo
          }
        }
      };
    }

    return this.prisma.persona.findMany({
      where,
      take: limit,
      include: {
        tipos: {
          where: { activo: true },
          include: {
            tipoPersona: true
          }
        }
      },
      orderBy: [
        { apellido: 'asc' },
        { nombre: 'asc' }
      ]
    });
  }

  // ======================================================================
  // UTILIDADES
  // ======================================================================

  /**
   * Verificar si persona tiene un tipo específico activo
   */
  async hasTipoActivo(personaId: number, tipoPersonaCodigo: string): Promise<boolean> {
    const count = await this.prisma.personaTipo.count({
      where: {
        personaId,
        activo: true,
        fechaDesasignacion: null,
        tipoPersona: {
          codigo: tipoPersonaCodigo
        }
      }
    });

    return count > 0;
  }

  /**
   * Obtener cantidad de tipos activos de una persona
   */
  async countTiposActivos(personaId: number): Promise<number> {
    return this.prisma.personaTipo.count({
      where: {
        personaId,
        activo: true,
        fechaDesasignacion: null
      }
    });
  }

  /**
   * Verificar si persona está activa (tiene al menos un tipo activo)
   */
  async isActiva(personaId: number): Promise<boolean> {
    const count = await this.countTiposActivos(personaId);
    return count > 0;
  }
}
