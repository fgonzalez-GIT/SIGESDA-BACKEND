// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import {
  CreateCategoriaEquipamientoDto,
  UpdateCategoriaEquipamientoDto,
  ReorderCategoriaEquipamientoDto
} from '@/dto/categorias-equipamiento.dto';

export class CategoriasEquipamientoRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Crear nueva categoría de equipamiento
   */
  async create(data: CreateCategoriaEquipamientoDto) {
    // 1. Verificar que el código no exista
    const existing = await this.prisma.categoriaEquipamiento.findUnique({
      where: { codigo: data.codigo }
    });

    if (existing) {
      throw new Error(`Ya existe una categoría de equipamiento con código: ${data.codigo}`);
    }

    // 2. Si no se proporciona orden, usar el siguiente disponible
    let orden = data.orden;
    if (!orden || orden === 0) {
      const maxOrden = await this.prisma.categoriaEquipamiento.findFirst({
        select: { orden: true },
        orderBy: { orden: 'desc' }
      });
      orden = (maxOrden?.orden ?? 0) + 1;
    }

    // 3. Crear la categoría
    return this.prisma.categoriaEquipamiento.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion ?? null,
        activo: data.activo ?? true,
        orden
      }
    });
  }

  /**
   * Listar categorías con filtros
   */
  async findAll(options?: {
    includeInactive?: boolean;
    search?: string;
    orderBy?: string;
    orderDir?: 'asc' | 'desc';
  }) {
    const where: any = {};

    // Filtro por activo/inactivo
    if (!options?.includeInactive) {
      where.activo = true;
    }

    // Búsqueda
    if (options?.search) {
      where.OR = [
        { codigo: { contains: options.search, mode: 'insensitive' } },
        { nombre: { contains: options.search, mode: 'insensitive' } },
        { descripcion: { contains: options.search, mode: 'insensitive' } }
      ];
    }

    // Ordenamiento
    const orderBy: any = {};
    orderBy[options?.orderBy || 'orden'] = options?.orderDir || 'asc';

    return this.prisma.categoriaEquipamiento.findMany({
      where,
      orderBy,
      include: {
        _count: {
          select: { equipamientos: true }
        }
      }
    });
  }

  /**
   * Obtener por ID
   */
  async findById(id: number) {
    const categoria = await this.prisma.categoriaEquipamiento.findUnique({
      where: { id },
      include: {
        _count: {
          select: { equipamientos: true }
        }
      }
    });

    if (!categoria) {
      throw new Error(`Categoría de equipamiento con ID ${id} no encontrada`);
    }

    return categoria;
  }

  /**
   * Obtener por código
   */
  async findByCodigo(codigo: string) {
    return this.prisma.categoriaEquipamiento.findUnique({
      where: { codigo }
    });
  }

  /**
   * Actualizar categoría
   */
  async update(id: number, data: UpdateCategoriaEquipamientoDto) {
    // Verificar que existe
    await this.findById(id);

    // Si se cambia el código, verificar que no exista
    if (data.codigo) {
      const existing = await this.prisma.categoriaEquipamiento.findFirst({
        where: {
          codigo: data.codigo,
          id: { not: id }
        }
      });

      if (existing) {
        throw new Error(`Ya existe una categoría de equipamiento con código: ${data.codigo}`);
      }
    }

    return this.prisma.categoriaEquipamiento.update({
      where: { id },
      data: {
        ...(data.codigo && { codigo: data.codigo }),
        ...(data.nombre && { nombre: data.nombre }),
        ...(data.descripcion !== undefined && { descripcion: data.descripcion }),
        ...(data.activo !== undefined && { activo: data.activo }),
        ...(data.orden !== undefined && { orden: data.orden })
      }
    });
  }

  /**
   * Soft delete (desactivar)
   */
  async delete(id: number) {
    // Verificar que existe
    const categoria = await this.findById(id);

    // Verificar si tiene equipamientos activos
    const equipamientosActivos = await this.prisma.equipamiento.count({
      where: {
        categoriaEquipamientoId: id,
        activo: true
      }
    });

    if (equipamientosActivos > 0) {
      throw new Error(
        `No se puede desactivar la categoría "${categoria.nombre}" porque tiene ${equipamientosActivos} equipamiento(s) activo(s)`
      );
    }

    // Soft delete
    return this.prisma.categoriaEquipamiento.update({
      where: { id },
      data: { activo: false }
    });
  }

  /**
   * Reordenar categorías
   */
  async reorder(data: ReorderCategoriaEquipamientoDto) {
    const updates = data.ids.map((id, index) =>
      this.prisma.categoriaEquipamiento.update({
        where: { id },
        data: { orden: index + 1 }
      })
    );

    await this.prisma.$transaction(updates);

    return { message: 'Orden actualizado exitosamente', count: updates.length };
  }
}
