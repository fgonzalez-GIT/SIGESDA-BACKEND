// @ts-nocheck
import { PrismaClient, CategoriaSocio, Prisma } from '@prisma/client';
import {
  CreateCategoriaSocioDto,
  UpdateCategoriaSocioDto,
  CategoriaSocioQueryDto
} from '@/dto/categoria-socio.dto';

export class CategoriaSocioRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(query?: CategoriaSocioQueryDto): Promise<CategoriaSocio[]> {
    const where: Prisma.CategoriaSocioWhereInput = {};

    // Filtrar por activas/inactivas
    if (query && query.includeInactive === false) {
      where.activa = true;
    }

    // Búsqueda por código o nombre
    if (query?.search) {
      where.OR = [
        { codigo: { contains: query.search, mode: 'insensitive' } },
        { nombre: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    return this.prisma.categoriaSocio.findMany({
      where,
      orderBy: { orden: 'asc' }
    });
  }

  async findById(id: string): Promise<CategoriaSocio | null> {
    return this.prisma.categoriaSocio.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            personas: true,
            cuotas: true
          }
        }
      }
    });
  }

  async findByCodigo(codigo: string): Promise<CategoriaSocio | null> {
    return this.prisma.categoriaSocio.findUnique({
      where: { codigo: codigo.toUpperCase() }
    });
  }

  async create(data: CreateCategoriaSocioDto): Promise<CategoriaSocio> {
    return this.prisma.categoriaSocio.create({
      data: {
        ...data,
        montoCuota: new Prisma.Decimal(data.montoCuota),
        descuento: new Prisma.Decimal(data.descuento)
      }
    });
  }

  async update(id: string, data: UpdateCategoriaSocioDto): Promise<CategoriaSocio> {
    const updateData: any = { ...data };

    if (updateData.montoCuota !== undefined) {
      updateData.montoCuota = new Prisma.Decimal(updateData.montoCuota);
    }

    if (updateData.descuento !== undefined) {
      updateData.descuento = new Prisma.Decimal(updateData.descuento);
    }

    return this.prisma.categoriaSocio.update({
      where: { id },
      data: updateData
    });
  }

  async delete(id: string): Promise<CategoriaSocio> {
    // Verificar que no haya personas asociadas
    const personasCount = await this.prisma.persona.count({
      where: { categoriaId: id }
    });

    if (personasCount > 0) {
      throw new Error(`No se puede eliminar la categoría porque tiene ${personasCount} socios asociados`);
    }

    // Verificar que no haya cuotas asociadas
    const cuotasCount = await this.prisma.cuota.count({
      where: { categoriaId: id }
    });

    if (cuotasCount > 0) {
      throw new Error(`No se puede eliminar la categoría porque tiene ${cuotasCount} cuotas asociadas`);
    }

    return this.prisma.categoriaSocio.delete({
      where: { id }
    });
  }

  async getStats(id: string): Promise<{
    totalPersonas: number;
    totalCuotas: number;
    totalRecaudado: number;
  }> {
    const [personasCount, cuotasStats] = await Promise.all([
      this.prisma.persona.count({
        where: { categoriaId: id }
      }),
      this.prisma.cuota.aggregate({
        where: { categoriaId: id },
        _count: { id: true },
        _sum: { montoTotal: true }
      })
    ]);

    return {
      totalPersonas: personasCount,
      totalCuotas: cuotasStats._count.id,
      totalRecaudado: parseFloat(cuotasStats._sum.montoTotal?.toString() || '0')
    };
  }
}
