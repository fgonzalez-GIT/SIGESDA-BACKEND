import { PrismaClient, Prisma } from '@prisma/client';
import { prisma } from '@/config/database';

/**
 * Repository para gestión de Categorías de Ítems de Cuota
 * Catálogo 100% editable vía CRUD desde UI de admin
 */
export class CategoriaItemRepository {
  /**
   * Buscar todas las categorías
   */
  async findAll(options?: { includeInactive?: boolean }) {
    const where: Prisma.CategoriaItemWhereInput = {};

    if (!options?.includeInactive) {
      where.activo = true;
    }

    return await prisma.categoriaItem.findMany({
      where,
      orderBy: { orden: 'asc' }
    });
  }

  /**
   * Buscar categoría por ID
   */
  async findById(id: number) {
    return await prisma.categoriaItem.findUnique({
      where: { id },
      include: {
        tiposItems: true
      }
    });
  }

  /**
   * Buscar categoría por código
   */
  async findByCodigo(codigo: string) {
    return await prisma.categoriaItem.findUnique({
      where: { codigo },
      include: {
        tiposItems: true
      }
    });
  }

  /**
   * Crear nueva categoría
   */
  async create(data: Prisma.CategoriaItemCreateInput) {
    return await prisma.categoriaItem.create({
      data
    });
  }

  /**
   * Actualizar categoría existente
   */
  async update(id: number, data: Prisma.CategoriaItemUpdateInput) {
    return await prisma.categoriaItem.update({
      where: { id },
      data
    });
  }

  /**
   * Soft delete - marcar como inactiva
   */
  async softDelete(id: number) {
    return await prisma.categoriaItem.update({
      where: { id },
      data: { activo: false }
    });
  }

  /**
   * Hard delete - eliminar físicamente
   * CUIDADO: Solo si no tiene tipos de ítems asociados
   */
  async delete(id: number) {
    return await prisma.categoriaItem.delete({
      where: { id }
    });
  }

  /**
   * Verificar si una categoría tiene tipos de ítems asociados
   */
  async hasTiposItems(id: number): Promise<boolean> {
    const count = await prisma.tipoItemCuota.count({
      where: { categoriaItemId: id }
    });
    return count > 0;
  }

  /**
   * Contar categorías activas
   */
  async countActive(): Promise<number> {
    return await prisma.categoriaItem.count({
      where: { activo: true }
    });
  }

  /**
   * Obtener estadísticas de uso
   */
  async getUsageStats(id: number) {
    const categoria = await prisma.categoriaItem.findUnique({
      where: { id },
      include: {
        tiposItems: {
          include: {
            itemsCuota: true
          }
        }
      }
    });

    if (!categoria) return null;

    const totalTipos = categoria.tiposItems.length;
    const tiposActivos = categoria.tiposItems.filter(t => t.activo).length;
    const totalItems = categoria.tiposItems.reduce(
      (sum, tipo) => sum + tipo.itemsCuota.length,
      0
    );

    return {
      categoria: {
        id: categoria.id,
        codigo: categoria.codigo,
        nombre: categoria.nombre
      },
      totalTipos,
      tiposActivos,
      tiposInactivos: totalTipos - tiposActivos,
      totalItemsGenerados: totalItems
    };
  }
}
