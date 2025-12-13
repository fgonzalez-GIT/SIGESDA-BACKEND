import { PrismaClient, Prisma } from '@prisma/client';
import { prisma } from '@/config/database';

/**
 * Repository para gestión de Tipos de Ítems de Cuota
 * Catálogo 100% editable vía CRUD desde UI de admin
 */
export class TipoItemCuotaRepository {
  /**
   * Buscar todos los tipos de ítems
   */
  async findAll(options?: {
    includeInactive?: boolean;
    categoriaItemId?: number;
  }) {
    const where: Prisma.TipoItemCuotaWhereInput = {};

    if (!options?.includeInactive) {
      where.activo = true;
    }

    if (options?.categoriaItemId) {
      where.categoriaItemId = options.categoriaItemId;
    }

    return await prisma.tipoItemCuota.findMany({
      where,
      include: {
        categoriaItem: true
      },
      orderBy: { orden: 'asc' }
    });
  }

  /**
   * Buscar tipo de ítem por ID
   */
  async findById(id: number) {
    return await prisma.tipoItemCuota.findUnique({
      where: { id },
      include: {
        categoriaItem: true,
        itemsCuota: {
          take: 5, // Solo últimos 5 para preview
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }

  /**
   * Buscar tipo de ítem por código
   */
  async findByCodigo(codigo: string) {
    return await prisma.tipoItemCuota.findUnique({
      where: { codigo },
      include: {
        categoriaItem: true
      }
    });
  }

  /**
   * Buscar tipos de ítems por categoría (código de categoría)
   */
  async findByCategoriaCodigo(categoriaCodigo: string, options?: { includeInactive?: boolean }) {
    const where: Prisma.TipoItemCuotaWhereInput = {
      categoriaItem: {
        codigo: categoriaCodigo
      }
    };

    if (!options?.includeInactive) {
      where.activo = true;
    }

    return await prisma.tipoItemCuota.findMany({
      where,
      include: {
        categoriaItem: true
      },
      orderBy: { orden: 'asc' }
    });
  }

  /**
   * Buscar tipos de ítems calculados (automáticos)
   */
  async findCalculados(options?: { includeInactive?: boolean }) {
    const where: Prisma.TipoItemCuotaWhereInput = {
      esCalculado: true
    };

    if (!options?.includeInactive) {
      where.activo = true;
    }

    return await prisma.tipoItemCuota.findMany({
      where,
      include: {
        categoriaItem: true
      },
      orderBy: { orden: 'asc' }
    });
  }

  /**
   * Buscar tipos de ítems manuales
   */
  async findManuales(options?: { includeInactive?: boolean }) {
    const where: Prisma.TipoItemCuotaWhereInput = {
      esCalculado: false
    };

    if (!options?.includeInactive) {
      where.activo = true;
    }

    return await prisma.tipoItemCuota.findMany({
      where,
      include: {
        categoriaItem: true
      },
      orderBy: { orden: 'asc' }
    });
  }

  /**
   * Crear nuevo tipo de ítem
   */
  async create(data: Prisma.TipoItemCuotaCreateInput) {
    return await prisma.tipoItemCuota.create({
      data,
      include: {
        categoriaItem: true
      }
    });
  }

  /**
   * Actualizar tipo de ítem existente
   */
  async update(id: number, data: Prisma.TipoItemCuotaUpdateInput) {
    return await prisma.tipoItemCuota.update({
      where: { id },
      data,
      include: {
        categoriaItem: true
      }
    });
  }

  /**
   * Soft delete - marcar como inactivo
   */
  async softDelete(id: number) {
    return await prisma.tipoItemCuota.update({
      where: { id },
      data: { activo: false }
    });
  }

  /**
   * Hard delete - eliminar físicamente
   * CUIDADO: Solo si no tiene ítems de cuota asociados
   */
  async delete(id: number) {
    return await prisma.tipoItemCuota.delete({
      where: { id }
    });
  }

  /**
   * Verificar si un tipo de ítem tiene ítems de cuota asociados
   */
  async hasItemsCuota(id: number): Promise<boolean> {
    const count = await prisma.itemCuota.count({
      where: { tipoItemId: id }
    });
    return count > 0;
  }

  /**
   * Contar tipos de ítems activos
   */
  async countActive(): Promise<number> {
    return await prisma.tipoItemCuota.count({
      where: { activo: true }
    });
  }

  /**
   * Contar tipos de ítems por categoría
   */
  async countByCategoria(categoriaItemId: number): Promise<number> {
    return await prisma.tipoItemCuota.count({
      where: {
        categoriaItemId,
        activo: true
      }
    });
  }

  /**
   * Obtener estadísticas de uso de un tipo de ítem
   */
  async getUsageStats(id: number) {
    const tipo = await prisma.tipoItemCuota.findUnique({
      where: { id },
      include: {
        categoriaItem: true,
        itemsCuota: {
          include: {
            cuota: true
          }
        }
      }
    });

    if (!tipo) return null;

    const totalItems = tipo.itemsCuota.length;
    const montoTotal = tipo.itemsCuota.reduce(
      (sum, item) => sum + Number(item.monto),
      0
    );

    // Cuotas únicas que usan este tipo
    const cuotasUnicas = new Set(tipo.itemsCuota.map(i => i.cuotaId));

    return {
      tipo: {
        id: tipo.id,
        codigo: tipo.codigo,
        nombre: tipo.nombre,
        categoria: tipo.categoriaItem.nombre
      },
      totalItemsGenerados: totalItems,
      cuotasAfectadas: cuotasUnicas.size,
      montoTotalAcumulado: montoTotal,
      promedioMonto: totalItems > 0 ? montoTotal / totalItems : 0
    };
  }

  /**
   * Activar tipo de ítem
   */
  async activate(id: number) {
    return await prisma.tipoItemCuota.update({
      where: { id },
      data: { activo: true }
    });
  }

  /**
   * Desactivar tipo de ítem
   */
  async deactivate(id: number) {
    return await prisma.tipoItemCuota.update({
      where: { id },
      data: { activo: false }
    });
  }

  /**
   * Actualizar orden de visualización
   */
  async updateOrden(id: number, orden: number) {
    return await prisma.tipoItemCuota.update({
      where: { id },
      data: { orden }
    });
  }

  /**
   * Actualizar fórmula de cálculo
   */
  async updateFormula(id: number, formula: any) {
    return await prisma.tipoItemCuota.update({
      where: { id },
      data: { formula }
    });
  }
}
