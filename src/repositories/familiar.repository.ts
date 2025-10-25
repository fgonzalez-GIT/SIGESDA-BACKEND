import { PrismaClient, Familiar, TipoParentesco } from '@prisma/client';
import { CreateFamiliarDto, FamiliarQueryDto, FamiliarSearchDto } from '@/dto/familiar.dto';

export class FamiliarRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateFamiliarDto): Promise<Familiar> {
    return this.prisma.familiar.create({
      data: {
        socioId: data.socioId,
        familiarId: data.familiarId,
        parentesco: data.parentesco,
        descripcion: data.descripcion,
        permisoResponsableFinanciero: data.permisoResponsableFinanciero ?? false,
        permisoContactoEmergencia: data.permisoContactoEmergencia ?? false,
        permisoAutorizadoRetiro: data.permisoAutorizadoRetiro ?? false,
        descuento: data.descuento ?? 0,
        activo: data.activo ?? true,
        grupoFamiliarId: data.grupoFamiliarId
      },
      include: {
        socio: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            numeroSocio: true,
            email: true,
            telefono: true
          }
        },
        familiar: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            numeroSocio: true,
            email: true,
            telefono: true
          }
        }
      }
    });
  }

  async findAll(query: FamiliarQueryDto): Promise<{ data: Familiar[]; total: number }> {
    const where: any = {};

    if (query.socioId) {
      where.socioId = query.socioId;
    }

    if (query.familiarId) {
      where.familiarId = query.familiarId;
    }

    if (query.parentesco) {
      where.parentesco = query.parentesco;
    }

    if (query.grupoFamiliarId) {
      where.grupoFamiliarId = query.grupoFamiliarId;
    }

    // Filter by activo status
    if (query.soloActivos) {
      where.activo = true;
    }

    // Filter by active socios only (unless explicitly including inactivos)
    if (!query.includeInactivos) {
      where.AND = [
        {
          socio: {
            fechaBaja: null
          }
        },
        {
          familiar: {
            fechaBaja: null
          }
        }
      ];
    }

    const skip = (query.page - 1) * query.limit;

    const [data, total] = await Promise.all([
      this.prisma.familiar.findMany({
        where,
        skip,
        take: query.limit,
        include: {
          socio: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              dni: true,
              numeroSocio: true,
              fechaBaja: true
            }
          },
          familiar: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              dni: true,
              numeroSocio: true,
              fechaBaja: true
            }
          }
        },
        orderBy: [
          { socio: { numeroSocio: 'asc' } },
          { parentesco: 'asc' },
          { familiar: { apellido: 'asc' } },
          { familiar: { nombre: 'asc' } }
        ]
      }),
      this.prisma.familiar.count({ where })
    ]);

    return { data, total };
  }

  async findById(id: number): Promise<Familiar | null> {
    return this.prisma.familiar.findUnique({
      where: { id },
      include: {
        socio: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            numeroSocio: true,
            categoria: true,
            fechaBaja: true
          }
        },
        familiar: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            numeroSocio: true,
            categoria: true,
            fechaBaja: true
          }
        }
      }
    });
  }

  async findBySocioId(socioId: number, includeInactivos = false): Promise<Familiar[]> {
    const where: any = { socioId };

    if (!includeInactivos) {
      where.familiar = {
        fechaBaja: null
      };
    }

    return this.prisma.familiar.findMany({
      where,
      include: {
        familiar: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            numeroSocio: true,
            categoria: true,
            fechaBaja: true
          }
        }
      },
      orderBy: [
        { parentesco: 'asc' },
        { familiar: { apellido: 'asc' } },
        { familiar: { nombre: 'asc' } }
      ]
    });
  }

  async findByFamiliarId(familiarId: number, includeInactivos = false): Promise<Familiar[]> {
    const where: any = { familiarId };

    if (!includeInactivos) {
      where.socio = {
        fechaBaja: null
      };
    }

    return this.prisma.familiar.findMany({
      where,
      include: {
        socio: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            numeroSocio: true,
            categoria: true,
            fechaBaja: true
          }
        }
      },
      orderBy: [
        { parentesco: 'asc' },
        { socio: { numeroSocio: 'asc' } }
      ]
    });
  }

  async findExistingRelation(socioId: number, familiarId: number): Promise<Familiar | null> {
    return this.prisma.familiar.findUnique({
      where: {
        socioId_familiarId: {
          socioId,
          familiarId
        }
      }
    });
  }

  async update(id: number, data: {
    parentesco?: TipoParentesco;
    descripcion?: string | null;
    permisoResponsableFinanciero?: boolean;
    permisoContactoEmergencia?: boolean;
    permisoAutorizadoRetiro?: boolean;
    descuento?: number;
    activo?: boolean;
    grupoFamiliarId?: number | null;
  }): Promise<Familiar> {
    return this.prisma.familiar.update({
      where: { id },
      data,
      include: {
        socio: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            numeroSocio: true,
            email: true,
            telefono: true
          }
        },
        familiar: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            numeroSocio: true,
            email: true,
            telefono: true
          }
        }
      }
    });
  }

  async delete(id: number): Promise<Familiar> {
    return this.prisma.familiar.delete({
      where: { id }
    });
  }

  async deleteBulk(ids: number[]): Promise<{ count: number }> {
    return this.prisma.familiar.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });
  }

  async createBulk(familiares: CreateFamiliarDto[]): Promise<{ count: number }> {
    return this.prisma.familiar.createMany({
      data: familiares,
      skipDuplicates: true
    });
  }

  async search(searchData: FamiliarSearchDto): Promise<Familiar[]> {
    const { search, searchBy, parentesco, includeInactivos } = searchData;

    let searchConditions: any[] = [];

    if (searchBy === 'all' || searchBy === 'nombre') {
      searchConditions.push(
        { socio: { nombre: { contains: search, mode: 'insensitive' } } },
        { socio: { apellido: { contains: search, mode: 'insensitive' } } },
        { familiar: { nombre: { contains: search, mode: 'insensitive' } } },
        { familiar: { apellido: { contains: search, mode: 'insensitive' } } }
      );
    }

    if (searchBy === 'all' || searchBy === 'dni') {
      searchConditions.push(
        { socio: { dni: { contains: search } } },
        { familiar: { dni: { contains: search } } }
      );
    }

    if (searchBy === 'all' || searchBy === 'email') {
      searchConditions.push(
        { socio: { email: { contains: search, mode: 'insensitive' } } },
        { familiar: { email: { contains: search, mode: 'insensitive' } } }
      );
    }

    const where: any = {
      OR: searchConditions
    };

    if (parentesco) {
      where.parentesco = parentesco;
    }

    if (!includeInactivos) {
      where.AND = [
        { socio: { fechaBaja: null } },
        { familiar: { fechaBaja: null } }
      ];
    }

    return this.prisma.familiar.findMany({
      where,
      include: {
        socio: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            numeroSocio: true,
            email: true,
            fechaBaja: true
          }
        },
        familiar: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            numeroSocio: true,
            email: true,
            fechaBaja: true
          }
        }
      },
      orderBy: [
        { socio: { numeroSocio: 'asc' } },
        { parentesco: 'asc' }
      ]
    });
  }

  async getParentescoStats(): Promise<Array<{ parentesco: TipoParentesco; count: number }>> {
    const stats = await this.prisma.familiar.groupBy({
      by: ['parentesco'],
      _count: {
        id: true
      },
      where: {
        AND: [
          { socio: { fechaBaja: null } },
          { familiar: { fechaBaja: null } }
        ]
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    return stats.map(stat => ({
      parentesco: stat.parentesco,
      count: stat._count.id
    }));
  }

  async getFamilyTree(socioId: number): Promise<any> {
    const directFamily = await this.findBySocioId(socioId, false);
    const inverseFamily = await this.findByFamiliarId(socioId, false);

    return {
      socioId,
      familiaDirecta: directFamily,
      familiaInversa: inverseFamily,
      totalRelaciones: directFamily.length + inverseFamily.length
    };
  }
}