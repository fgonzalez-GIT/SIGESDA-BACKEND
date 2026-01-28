import { PrismaClient, Prisma } from '@prisma/client';
import { prisma } from '@/config/database';

/**
 * Repository para gestión de Ítems de Cuota
 * Ítems individuales que componen una cuota (base, actividades, descuentos, etc.)
 */
export class ItemCuotaRepository {
  /**
   * Buscar ítems por ID de cuota
   */
  async findByCuotaId(cuotaId: number) {
    return await prisma.itemCuota.findMany({
      where: { cuotaId },
      include: {
        tipoItem: {
          include: {
            categoriaItem: true
          }
        }
      },
      orderBy: [
        { tipoItem: { orden: 'asc' } },
        { createdAt: 'asc' }
      ]
    });
  }

  /**
   * Buscar ítem por ID
   */
  async findById(id: number) {
    return await prisma.itemCuota.findUnique({
      where: { id },
      include: {
        tipoItem: {
          include: {
            categoriaItem: true
          }
        },
        cuota: {
          include: {
            categoria: true,
            recibo: true
          }
        }
      }
    });
  }

  /**
   * Crear ítem individual
   */
  async create(data: Prisma.ItemCuotaCreateInput) {
    return await prisma.itemCuota.create({
      data,
      include: {
        tipoItem: {
          include: {
            categoriaItem: true
          }
        }
      }
    });
  }

  /**
   * Crear múltiples ítems en batch (transacción)
   */
  async createMany(items: Prisma.ItemCuotaCreateManyInput[]) {
    return await prisma.itemCuota.createMany({
      data: items,
      skipDuplicates: false
    });
  }

  /**
   * Actualizar ítem individual
   */
  async update(id: number, data: Prisma.ItemCuotaUpdateInput) {
    return await prisma.itemCuota.update({
      where: { id },
      data,
      include: {
        tipoItem: {
          include: {
            categoriaItem: true
          }
        }
      }
    });
  }

  /**
   * Eliminar ítem individual
   */
  async delete(id: number) {
    return await prisma.itemCuota.delete({
      where: { id }
    });
  }

  /**
   * Eliminar todos los ítems de una cuota
   */
  async deleteByCuotaId(cuotaId: number) {
    return await prisma.itemCuota.deleteMany({
      where: { cuotaId }
    });
  }

  /**
   * Contar ítems de una cuota
   */
  async countByCuotaId(cuotaId: number): Promise<number> {
    return await prisma.itemCuota.count({
      where: { cuotaId }
    });
  }

  /**
   * Obtener resumen de ítems por categoría para una cuota
   */
  async getSummaryByCuotaId(cuotaId: number) {
    const items = await this.findByCuotaId(cuotaId);

    const summary = {
      base: 0,
      actividades: 0,
      descuentos: 0,
      recargos: 0,
      bonificaciones: 0,
      otros: 0,
      total: 0,
      itemsCount: items.length
    };

    for (const item of items) {
      const monto = Number(item.monto);
      const categoria = item.tipoItem.categoriaItem.codigo;

      // Categorías que SUMAN al total: BASE, ACTIVIDAD, RECARGO, OTRO
      // Categorías que RESTAN del total: DESCUENTO, BONIFICACION, AJUSTE
      const categoriasQueRestan = ['DESCUENTO', 'BONIFICACION', 'AJUSTE'];

      if (categoriasQueRestan.includes(categoria)) {
        summary.total -= monto;  // RESTAR descuentos, bonificaciones y ajustes
      } else {
        summary.total += monto;  // SUMAR base, actividades, recargos y otros
      }

      // Acumular subtotales por categoría (siempre positivos para visualización)
      switch (categoria) {
        case 'BASE':
          summary.base += monto;
          break;
        case 'ACTIVIDAD':
          summary.actividades += monto;
          break;
        case 'DESCUENTO':
          summary.descuentos += monto;
          break;
        case 'RECARGO':
          summary.recargos += monto;
          break;
        case 'BONIFICACION':
          summary.bonificaciones += monto;
          break;
        case 'OTRO':
          summary.otros += monto;
          break;
      }
    }

    return summary;
  }

  /**
   * Buscar ítems automáticos de una cuota
   */
  async findAutomaticosByCuotaId(cuotaId: number) {
    return await prisma.itemCuota.findMany({
      where: {
        cuotaId,
        esAutomatico: true
      },
      include: {
        tipoItem: {
          include: {
            categoriaItem: true
          }
        }
      },
      orderBy: [
        { tipoItem: { orden: 'asc' } },
        { createdAt: 'asc' }
      ]
    });
  }

  /**
   * Buscar ítems manuales de una cuota
   */
  async findManualesByCuotaId(cuotaId: number) {
    return await prisma.itemCuota.findMany({
      where: {
        cuotaId,
        esAutomatico: false
      },
      include: {
        tipoItem: {
          include: {
            categoriaItem: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Buscar ítems editables de una cuota
   */
  async findEditablesByCuotaId(cuotaId: number) {
    return await prisma.itemCuota.findMany({
      where: {
        cuotaId,
        esEditable: true
      },
      include: {
        tipoItem: {
          include: {
            categoriaItem: true
          }
        }
      }
    });
  }

  /**
   * Buscar ítems por tipo (código de tipo de ítem)
   */
  async findByTipoItemCodigo(codigo: string, options?: {
    limit?: number;
    offset?: number;
  }) {
    return await prisma.itemCuota.findMany({
      where: {
        tipoItem: {
          codigo
        }
      },
      include: {
        tipoItem: {
          include: {
            categoriaItem: true
          }
        },
        cuota: {
          include: {
            recibo: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit,
      skip: options?.offset
    });
  }

  /**
   * Buscar ítems por categoría (código de categoría)
   */
  async findByCategoriaCodigo(codigo: string, options?: {
    limit?: number;
    offset?: number;
  }) {
    return await prisma.itemCuota.findMany({
      where: {
        tipoItem: {
          categoriaItem: {
            codigo
          }
        }
      },
      include: {
        tipoItem: {
          include: {
            categoriaItem: true
          }
        },
        cuota: true
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit,
      skip: options?.offset
    });
  }

  /**
   * Calcular total de una cuota basado en sus ítems
   */
  async calculateTotalByCuotaId(cuotaId: number): Promise<number> {
    const items = await prisma.itemCuota.findMany({
      where: { cuotaId },
      select: { monto: true }
    });

    return items.reduce((sum, item) => sum + Number(item.monto), 0);
  }

  /**
   * Reemplazar todos los ítems de una cuota (transacción)
   * Útil para regenerar cuota completa
   */
  async replaceAllByCuotaId(
    cuotaId: number,
    newItems: Prisma.ItemCuotaCreateManyInput[]
  ) {
    return await prisma.$transaction(async (tx) => {
      // 1. Eliminar ítems existentes
      await tx.itemCuota.deleteMany({
        where: { cuotaId }
      });

      // 2. Crear nuevos ítems
      await tx.itemCuota.createMany({
        data: newItems
      });

      // 3. Retornar ítems creados
      return await tx.itemCuota.findMany({
        where: { cuotaId },
        include: {
          tipoItem: {
            include: {
              categoriaItem: true
            }
          }
        },
        orderBy: [
          { tipoItem: { orden: 'asc' } },
          { createdAt: 'asc' }
        ]
      });
    });
  }

  /**
   * Obtener estadísticas globales de ítems
   */
  async getGlobalStats() {
    const totalItems = await prisma.itemCuota.count();
    const totalAutomaticos = await prisma.itemCuota.count({
      where: { esAutomatico: true }
    });
    const totalManuales = await prisma.itemCuota.count({
      where: { esAutomatico: false }
    });

    // Suma total de montos (considerando categorías que restan)
    const items = await prisma.itemCuota.findMany({
      select: {
        monto: true,
        tipoItem: {
          select: {
            categoriaItem: {
              select: {
                codigo: true
              }
            }
          }
        }
      }
    });

    const montoTotal = items.reduce((sum, item) => {
      const monto = Number(item.monto);
      const categoria = item.tipoItem.categoriaItem.codigo;
      const categoriasQueRestan = ['DESCUENTO', 'BONIFICACION', 'AJUSTE'];

      return categoriasQueRestan.includes(categoria)
        ? sum - monto  // RESTAR descuentos, bonificaciones y ajustes
        : sum + monto; // SUMAR base, actividades, recargos y otros
    }, 0);

    // Ítems por categoría
    const itemsPorCategoria = await prisma.itemCuota.groupBy({
      by: ['tipoItemId'],
      _count: true,
      _sum: {
        monto: true
      }
    });

    return {
      totalItems,
      totalAutomaticos,
      totalManuales,
      montoTotal,
      promedioMonto: totalItems > 0 ? montoTotal / totalItems : 0,
      itemsPorTipo: itemsPorCategoria.length
    };
  }

  /**
   * Verificar si una cuota tiene ítems
   */
  async hasItems(cuotaId: number): Promise<boolean> {
    const count = await this.countByCuotaId(cuotaId);
    return count > 0;
  }

  /**
   * Obtener desglose detallado de una cuota
   */
  async getDesgloseByCuotaId(cuotaId: number) {
    const items = await this.findByCuotaId(cuotaId);
    const summary = await this.getSummaryByCuotaId(cuotaId);

    const desglose = {
      cuotaId,
      items: items.map(item => ({
        id: item.id,
        tipo: item.tipoItem.codigo,
        nombre: item.tipoItem.nombre,
        categoria: item.tipoItem.categoriaItem.codigo,
        categoriaIcono: item.tipoItem.categoriaItem.icono,
        concepto: item.concepto,
        monto: Number(item.monto),
        cantidad: Number(item.cantidad),
        porcentaje: item.porcentaje ? Number(item.porcentaje) : null,
        esAutomatico: item.esAutomatico,
        esEditable: item.esEditable,
        observaciones: item.observaciones,
        metadata: item.metadata
      })),
      resumen: summary,
      totalItems: items.length
    };

    return desglose;
  }
}
