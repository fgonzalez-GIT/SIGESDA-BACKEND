import { PrismaClient, Persona } from '@prisma/client';
import { CreatePersonaDto, PersonaQueryDto, UpdatePersonaDto } from '@/dto/persona.dto';

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
            // Obtener ID y código del tipo
            let tipoPersonaId = 'tipoPersonaId' in tipo ? tipo.tipoPersonaId : undefined;
            let tipoPersonaCodigo = 'tipoPersonaCodigo' in tipo ? tipo.tipoPersonaCodigo : undefined;

            if (!tipoPersonaId && tipoPersonaCodigo) {
              const tipoCatalogo = await this.prisma.tipoPersonaCatalogo.findUnique({
                where: { codigo: tipoPersonaCodigo }
              });

              if (!tipoCatalogo) {
                throw new Error(`Tipo de persona '${tipoPersonaCodigo}' no encontrado`);
              }

              tipoPersonaId = tipoCatalogo.id;
            }

            // Preparar datos del tipo
            const tipoData: any = {
              tipoPersonaId: tipoPersonaId!,
              activo: true
            };

            // Agregar campos específicos SOLO si corresponden al tipo de persona
            // Esto evita que campos de un tipo contaminen a otro cuando se crean múltiples tipos

            // Campos de SOCIO
            if (tipoPersonaCodigo === 'SOCIO') {
              if ('categoriaId' in tipo && tipo.categoriaId !== undefined) {
                tipoData.categoriaId = tipo.categoriaId;
              }
              if ('numeroSocio' in tipo && tipo.numeroSocio !== undefined) {
                tipoData.numeroSocio = tipo.numeroSocio;
              }
              if ('fechaIngreso' in tipo && tipo.fechaIngreso !== undefined) {
                tipoData.fechaIngreso = new Date(tipo.fechaIngreso);
              }
            }

            // Campos de DOCENTE
            if (tipoPersonaCodigo === 'DOCENTE') {
              if ('especialidadId' in tipo && tipo.especialidadId !== undefined) {
                tipoData.especialidadId = tipo.especialidadId;
              }
              if ('honorariosPorHora' in tipo && tipo.honorariosPorHora !== undefined) {
                tipoData.honorariosPorHora = tipo.honorariosPorHora;
              }
            }

            // Campos de PROVEEDOR
            if (tipoPersonaCodigo === 'PROVEEDOR') {
              if ('cuit' in tipo && tipo.cuit !== undefined) {
                tipoData.cuit = tipo.cuit;
              }
              if ('razonSocialId' in tipo && tipo.razonSocialId !== undefined) {
                tipoData.razonSocialId = tipo.razonSocialId;
              }
            }

            // Observaciones (común para todos los tipos)
            if ('observaciones' in tipo && tipo.observaciones !== undefined) {
              tipoData.observaciones = tipo.observaciones;
            }

            return tipoData;
          }))
        },

        // Crear contactos
        contactos: {
          create: contactos.map((contacto) => ({
            tipoContactoId: contacto.tipoContactoId,
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
            especialidad: true,
            razonSocial: true
          }
        },
        contactos: true
      }
    });
  }

  /**
   * Buscar todas las personas con filtros
   * Por defecto solo muestra personas activas (activo = true)
   */
  async findAll(query: PersonaQueryDto): Promise<{ data: Persona[]; total: number }> {
    const where: any = {};

    // Por defecto filtrar solo personas activas, a menos que se pida explícitamente inactivas
    if (query.activo === false) {
      where.activo = false;
    } else {
      where.activo = true; // Default: solo activas
    }

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

    // Búsqueda por texto
    if (query.search) {
      where.OR = [
        { nombre: { contains: query.search, mode: 'insensitive' } },
        { apellido: { contains: query.search, mode: 'insensitive' } },
        { dni: { contains: query.search } },
        { email: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    // Paginación condicional (solo si page y limit están definidos)
    const skip = query.page && query.limit ? (query.page - 1) * query.limit : undefined;
    const take = query.limit || undefined;

    // Preparar includes - SIEMPRE incluir TODAS las relaciones
    const include: any = {};

    if (query.includeTipos) {
      include.tipos = {
        where: { activo: true },
        include: {
          tipoPersona: true,
          categoria: true,
          especialidad: true,
          razonSocial: true // ✅ AGREGADO: Razón Social para proveedores
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
        take,
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
          where: { activo: true },
          include: {
            tipoPersona: true,
            categoria: true,
            especialidad: true,
            razonSocial: true
          }
        },
        contactos: {
          where: { activo: true }
        },
        participacion_actividades: {
          include: {
            actividades: true
          }
        },
        parentescos: {
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
        comision_directiva: true
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
   * Actualizar persona (datos base, tipos y contactos)
   */
  async update(id: number, data: UpdatePersonaDto): Promise<Persona> {
    const { tipos, contactos, ...personaData } = data;
    const updateData: any = { ...personaData };

    if (updateData.fechaNacimiento) {
      updateData.fechaNacimiento = new Date(updateData.fechaNacimiento);
    }

    // Si se envían tipos o contactos, hacer sincronización completa en una transacción
    if (tipos || contactos) {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Actualizar datos base de persona
        await tx.persona.update({
          where: { id },
          data: updateData
        });

        // 2. Sincronizar tipos si se envían
        if (tipos && tipos.length > 0) {
          // Eliminar todos los tipos actuales (reemplazo completo)
          await tx.personaTipo.deleteMany({
            where: { personaId: id }
          });

          // Crear nuevos tipos (reutilizar lógica de create)
          const tiposData = await Promise.all(tipos.map(async (tipo) => {
            let tipoPersonaId = 'tipoPersonaId' in tipo ? tipo.tipoPersonaId : undefined;
            let tipoPersonaCodigo = 'tipoPersonaCodigo' in tipo ? tipo.tipoPersonaCodigo : undefined;

            if (!tipoPersonaId && tipoPersonaCodigo) {
              const tipoCatalogo = await tx.tipoPersonaCatalogo.findUnique({
                where: { codigo: tipoPersonaCodigo }
              });

              if (!tipoCatalogo) {
                throw new Error(`Tipo de persona '${tipoPersonaCodigo}' no encontrado`);
              }

              tipoPersonaId = tipoCatalogo.id;
            }

            const tipoData: any = {
              personaId: id,
              tipoPersonaId: tipoPersonaId!,
              activo: true
            };

            // Agregar campos específicos SOLO si corresponden al tipo
            if (tipoPersonaCodigo === 'SOCIO') {
              if ('categoriaId' in tipo && tipo.categoriaId !== undefined) {
                tipoData.categoriaId = tipo.categoriaId;
              }
              if ('numeroSocio' in tipo && tipo.numeroSocio !== undefined) {
                tipoData.numeroSocio = tipo.numeroSocio;
              }
              if ('fechaIngreso' in tipo && tipo.fechaIngreso !== undefined) {
                tipoData.fechaIngreso = new Date(tipo.fechaIngreso);
              }
            }

            if (tipoPersonaCodigo === 'DOCENTE') {
              if ('especialidadId' in tipo && tipo.especialidadId !== undefined) {
                tipoData.especialidadId = tipo.especialidadId;
              }
              if ('honorariosPorHora' in tipo && tipo.honorariosPorHora !== undefined) {
                tipoData.honorariosPorHora = tipo.honorariosPorHora;
              }
            }

            if (tipoPersonaCodigo === 'PROVEEDOR') {
              if ('cuit' in tipo && tipo.cuit !== undefined) {
                tipoData.cuit = tipo.cuit;
              }
              if ('razonSocialId' in tipo && tipo.razonSocialId !== undefined) {
                tipoData.razonSocialId = tipo.razonSocialId;
              }
            }

            if ('observaciones' in tipo && tipo.observaciones !== undefined) {
              tipoData.observaciones = tipo.observaciones;
            }

            return tipoData;
          }));

          // Crear todos los nuevos tipos
          await tx.personaTipo.createMany({
            data: tiposData
          });
        }

        // 3. Sincronizar contactos si se envían
        if (contactos && contactos.length > 0) {
          // Eliminar todos los contactos actuales (reemplazo completo)
          await tx.contactoPersona.deleteMany({
            where: { personaId: id }
          });

          // Crear nuevos contactos
          await tx.contactoPersona.createMany({
            data: contactos.map((contacto) => ({
              personaId: id,
              tipoContactoId: contacto.tipoContactoId,
              valor: contacto.valor,
              principal: contacto.principal ?? false,
              observaciones: contacto.observaciones,
              activo: contacto.activo ?? true
            }))
          });
        }

        // 4. Retornar persona actualizada con todas las relaciones
        return await tx.persona.findUnique({
          where: { id },
          include: {
            tipos: {
              where: { activo: true },
              include: {
                tipoPersona: true,
                categoria: true,
                especialidad: true,
                razonSocial: true
              }
            },
            contactos: {
              where: { activo: true }
            }
          }
        }) as Persona;
      });
    }

    // Si NO se envían tipos ni contactos, solo actualizar datos base
    return this.prisma.persona.update({
      where: { id },
      data: updateData,
      include: {
        tipos: {
          where: { activo: true },
          include: {
            tipoPersona: true,
            categoria: true,
            especialidad: true,
            razonSocial: true
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
   * Soft delete de persona (marca activo = false)
   * Los tipos NO se desactivan, se mantienen como registro histórico
   */
  async softDelete(id: number, motivo?: string): Promise<Persona> {
    return this.prisma.persona.update({
      where: { id },
      data: {
        activo: false,
        fechaBaja: new Date(),
        motivoBaja: motivo || 'Eliminación de persona'
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
