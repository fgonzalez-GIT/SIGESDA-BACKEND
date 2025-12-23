// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import {
  CreateCategoriaActividadDto,
  UpdateCategoriaActividadDto,
  QueryTiposCatalogoDto,
  ReorderCatalogoDto
} from '@/dto/catalogos-actividades.dto';

export class CategoriasActividadRepository {
  constructor(private prisma: PrismaClient) { }

  /**
   * Crear nueva categoría de actividad
   */
  async create(data: CreateCategoriaActividadDto) {
    // 1. Verificar que el código no exista
    const existing = await this.prisma.categorias_actividades.findUnique({
      where: { codigo: data.codigo }
    });

    if (existing) {
      throw new Error(`Ya existe una categoría de actividad con código: ${data.codigo}`);
    }

    // 2. Si no se proporciona orden, usar el siguiente disponible
    let orden = data.orden;
    if (!orden || orden === 0) {
      const maxOrden = await this.prisma.categorias_actividades.findFirst({
        select: { orden: true },
        orderBy: { orden: 'desc' }
      });
      orden = (maxOrden?.orden ?? 0) + 1;
    }

    // 3. Crear la categoría
    return this.prisma.categorias_actividades.create({
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
  async findAll(query: QueryTiposCatalogoDto) {
    const where: any = {};

    // Filtro por activo/inactivo
    if (!query.includeInactive) {
      where.activo = true;
    }

    // Búsqueda
    if (query.search) {
      where.OR = [
        { codigo: { contains: query.search, mode: 'insensitive' } },
        { nombre: { contains: query.search, mode: 'insensitive' } },
        { descripcion: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    // Ordenamiento
    const orderBy: any = {};
    orderBy[query.orderBy] = query.orderDir;

    return this.prisma.categorias_actividades.findMany({
      where,
      orderBy
    });
  }

  /**
   * Obtener por ID
   */
  async findById(id: number) {
    const categoria = await this.prisma.categorias_actividades.findUnique({
      where: { id }
    });

    if (!categoria) {
      throw new Error(`Categoría de actividad con ID ${id} no encontrada`);
    }

    return categoria;
  }

  /**
   * Actualizar categoría
   */
  async update(id: number, data: UpdateCategoriaActividadDto) {
    // Verificar que existe
    await this.findById(id);

    // Si se cambia el código, verificar que no exista
    if (data.codigo) {
      const existing = await this.prisma.categorias_actividades.findFirst({
        where: {
          codigo: data.codigo,
          id: { not: id }
        }
      });

      if (existing) {
        throw new Error(`Ya existe una categoría de actividad con código: ${data.codigo}`);
      }
    }

    return this.prisma.categorias_actividades.update({
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

    // Verificar si tiene actividades activas
    const actividadesActivas = await this.prisma.actividades.count({
      where: {
        categoria_id: id,
        estado_id: { in: [1, 2, 3] } // ACTIVA, EN_CURSO, FINALIZADA (no CANCELADA)
      }
    });

    if (actividadesActivas > 0) {
      throw new Error(
        `No se puede desactivar la categoría "${categoria.nombre}" porque tiene ${actividadesActivas} actividad(es) activa(s)`
      );
    }

    // Soft delete
    return this.prisma.categorias_actividades.update({
      where: { id },
      data: { activo: false }
    });
  }

  /**
   * Reordenar categorías
   */
  async reorder(data: ReorderCatalogoDto) {
    const updates = data.ids.map((id, index) =>
      this.prisma.categorias_actividades.update({
        where: { id },
        data: { orden: index + 1 }
      })
    );

    await this.prisma.$transaction(updates);

    return { message: 'Orden actualizado exitosamente', count: updates.length };
  }
}
