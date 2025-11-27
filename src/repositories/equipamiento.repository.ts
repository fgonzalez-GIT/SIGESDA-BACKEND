import { PrismaClient, Equipamiento } from '@prisma/client';
import { CreateEquipamientoDto, UpdateEquipamientoDto, EquipamientoQueryDto } from '@/dto/equipamiento.dto';

export class EquipamientoRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateEquipamientoDto): Promise<Equipamiento> {
    return this.prisma.equipamiento.create({
      data: {
        codigo: data.codigo!, // Código autogenerado en service
        nombre: data.nombre,
        categoriaEquipamientoId: data.categoriaEquipamientoId,
        descripcion: data.descripcion,
        observaciones: data.observaciones,
        activo: data.activo ?? true
      },
      include: {
        categoriaEquipamiento: true // Incluir la categoría en la respuesta
      }
    });
  }

  async findAll(query: EquipamientoQueryDto): Promise<{ data: Equipamiento[]; total: number }> {
    const where: any = {};

    if (query.activo !== undefined) {
      where.activo = query.activo;
    }

    if (query.search) {
      where.OR = [
        { nombre: { contains: query.search, mode: 'insensitive' } },
        { descripcion: { contains: query.search, mode: 'insensitive' } },
        { observaciones: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    const skip = (query.page - 1) * query.limit;

    const [data, total] = await Promise.all([
      this.prisma.equipamiento.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: [
          { activo: 'desc' }, // Activos primero
          { nombre: 'asc' }
        ],
        include: {
          categoriaEquipamiento: true, // Incluir categoría
          _count: {
            select: {
              aulas_equipamientos: true // Cantidad de aulas que usan este equipamiento
            }
          }
        }
      }),
      this.prisma.equipamiento.count({ where })
    ]);

    return { data, total };
  }

  async findById(id: number): Promise<Equipamiento | null> {
    return this.prisma.equipamiento.findUnique({
      where: { id },
      include: {
        categoriaEquipamiento: true, // Incluir categoría
        aulas_equipamientos: {
          include: {
            aula: {
              select: {
                id: true,
                nombre: true,
                capacidad: true,
                ubicacion: true,
                activa: true
              }
            }
          },
          orderBy: {
            aula: {
              nombre: 'asc'
            }
          }
        }
      }
    });
  }

  async findByNombre(nombre: string): Promise<Equipamiento | null> {
    return this.prisma.equipamiento.findUnique({
      where: { nombre }
    });
  }

  async findByCodigo(codigo: string): Promise<Equipamiento | null> {
    return this.prisma.equipamiento.findUnique({
      where: { codigo }
    });
  }

  async findMaxCodigoByCategoriaPrefix(prefix: string): Promise<string | null> {
    const result = await this.prisma.equipamiento.findFirst({
      where: {
        codigo: {
          startsWith: prefix
        }
      },
      orderBy: {
        codigo: 'desc'
      },
      select: {
        codigo: true
      }
    });

    return result?.codigo || null;
  }

  async update(id: number, data: UpdateEquipamientoDto): Promise<Equipamiento> {
    return this.prisma.equipamiento.update({
      where: { id },
      data: {
        nombre: data.nombre,
        categoriaEquipamientoId: data.categoriaEquipamientoId,
        descripcion: data.descripcion,
        observaciones: data.observaciones,
        activo: data.activo
      },
      include: {
        categoriaEquipamiento: true // Incluir categoría en la respuesta
      }
    });
  }

  async delete(id: number): Promise<Equipamiento> {
    return this.prisma.equipamiento.delete({
      where: { id }
    });
  }

  async softDelete(id: number): Promise<Equipamiento> {
    return this.prisma.equipamiento.update({
      where: { id },
      data: { activo: false }
    });
  }

  async checkUsageInAulas(id: number): Promise<number> {
    return this.prisma.aulaEquipamiento.count({
      where: { equipamientoId: id }
    });
  }
}
