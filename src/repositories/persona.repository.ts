import { PrismaClient, Persona } from '@prisma/client';
import { TipoPersona } from '@/types/enums';
import { CreatePersonaDto, PersonaQueryDto } from '@/dto/persona.dto';

export class PersonaRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreatePersonaDto): Promise<Persona> {
    const { categoriaId, ...rest } = data as any;

    return this.prisma.persona.create({
      data: {
        ...rest,
        ...(categoriaId && {
          categoria: {
            connect: { id: categoriaId }
          }
        }),
        fechaIngreso: data.tipo === TipoPersona.SOCIO && data.fechaIngreso
          ? new Date(data.fechaIngreso)
          : data.tipo === TipoPersona.SOCIO
            ? new Date()
            : undefined,
        fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : undefined
      }
    });
  }

  async findAll(query: PersonaQueryDto): Promise<{ data: Persona[]; total: number }> {
    const where: any = {};

    if (query.tipo) {
      where.tipo = query.tipo;
    }

    if (query.categoriaId) {
      where.categoriaId = query.categoriaId;
    }

    if (query.activo !== undefined) {
      if (query.activo) {
        where.fechaBaja = null;
      } else {
        where.fechaBaja = { not: null };
      }
    }

    if (query.search) {
      where.OR = [
        { nombre: { contains: query.search, mode: 'insensitive' } },
        { apellido: { contains: query.search, mode: 'insensitive' } },
        { dni: { contains: query.search } },
        { email: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    const skip = (query.page - 1) * query.limit;

    const [data, total] = await Promise.all([
      this.prisma.persona.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: [
          { apellido: 'asc' },
          { nombre: 'asc' }
        ]
      }),
      this.prisma.persona.count({ where })
    ]);

    return { data, total };
  }

  async findById(id: number): Promise<Persona | null> {
    return this.prisma.persona.findUnique({
      where: { id },
      include: {
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
        comisionDirectiva: true,
        categoria: true
      }
    });
  }

  async findByDni(dni: string): Promise<Persona | null> {
    return this.prisma.persona.findUnique({
      where: { dni }
    });
  }

  async findByEmail(email: string): Promise<Persona | null> {
    return this.prisma.persona.findUnique({
      where: { email }
    });
  }

  async update(id: number, data: Partial<CreatePersonaDto>): Promise<Persona> {
    const { categoriaId, ...rest } = data as any;
    const updateData: any = { ...rest };

    if (categoriaId !== undefined) {
      if (categoriaId === null) {
        updateData.categoria = { disconnect: true };
      } else {
        updateData.categoria = { connect: { id: categoriaId } };
      }
    }

    if (updateData.fechaIngreso) {
      updateData.fechaIngreso = new Date(updateData.fechaIngreso);
    }

    if (updateData.fechaNacimiento) {
      updateData.fechaNacimiento = new Date(updateData.fechaNacimiento);
    }

    if (updateData.fechaBaja) {
      updateData.fechaBaja = new Date(updateData.fechaBaja);
    }

    return this.prisma.persona.update({
      where: { id },
      data: updateData
    });
  }

  async softDelete(id: number, motivo?: string): Promise<Persona> {
    return this.prisma.persona.update({
      where: { id },
      data: {
        fechaBaja: new Date(),
        motivoBaja: motivo
      }
    });
  }

  async hardDelete(id: number): Promise<Persona> {
    return this.prisma.persona.delete({
      where: { id }
    });
  }

  async getNextNumeroSocio(): Promise<number> {
    const lastSocio = await this.prisma.persona.findFirst({
      where: {
        tipo: TipoPersona.SOCIO,
        numeroSocio: { not: null }
      },
      orderBy: {
        numeroSocio: 'desc'
      }
    });

    return (lastSocio?.numeroSocio || 0) + 1;
  }

  async getSocios(categoria?: CategoriaSocio, activos = true): Promise<Persona[]> {
    const where: any = {
      tipo: TipoPersona.SOCIO
    };

    if (categoria) {
      where.categoria = categoria;
    }

    if (activos) {
      where.fechaBaja = null;
    }

    return this.prisma.persona.findMany({
      where,
      orderBy: [
        { numeroSocio: 'asc' }
      ]
    });
  }
}