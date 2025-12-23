// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import {
  CreateTipoActividadDto,
  UpdateTipoActividadDto,
  QueryTiposCatalogoDto,
  ReorderCatalogoDto
} from '@/dto/catalogos-actividades.dto';

export class TiposActividadRepository {
  constructor(private prisma: PrismaClient) { }

  /**
   * Crear nuevo tipo de actividad
   */
  async create(data: CreateTipoActividadDto) {
    // 1. Verificar que el código no exista
    const existing = await this.prisma.tipos_actividades.findUnique({
      where: { codigo: data.codigo }
    });

    if (existing) {
      throw new Error(`Ya existe un tipo de actividad con código: ${data.codigo}`);
    }

    // 2. Si no se proporciona orden, usar el siguiente disponible
    let orden = data.orden;
    if (!orden || orden === 0) {
      const maxOrden = await this.prisma.tipos_actividades.findFirst({
        select: { orden: true },
        orderBy: { orden: 'desc' }
      });
      orden = (maxOrden?.orden ?? 0) + 1;
    }

    // 3. Crear el tipo
    return this.prisma.tipos_actividades.create({
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
   * Listar tipos con filtros
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

    return this.prisma.tipos_actividades.findMany({
      where,
      orderBy
    });
  }

  /**
   * Obtener por ID
   */
  async findById(id: number) {
    const tipo = await this.prisma.tipos_actividades.findUnique({
      where: { id }
    });

    if (!tipo) {
      throw new Error(`Tipo de actividad con ID ${id} no encontrado`);
    }

    return tipo;
  }

  /**
   * Actualizar tipo
   */
  async update(id: number, data: UpdateTipoActividadDto) {
    // Verificar que existe
    await this.findById(id);

    // Si se cambia el código, verificar que no exista
    if (data.codigo) {
      const existing = await this.prisma.tipos_actividades.findFirst({
        where: {
          codigo: data.codigo,
          id: { not: id }
        }
      });

      if (existing) {
        throw new Error(`Ya existe un tipo de actividad con código: ${data.codigo}`);
      }
    }

    return this.prisma.tipos_actividades.update({
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
    const tipo = await this.findById(id);

    // Verificar si tiene actividades activas
    // TODO: Restaurar esta validación cuando la relación esté implementada en el esquema.
    // Actualmente 'actividades' usa un enum y no tiene relación con 'tipos_actividades'.
    /*
    const actividadesActivas = await this.prisma.actividades.count({
      where: {
        tipo_actividad_id: id,
        estado_id: { in: [1, 2, 3] } // ACTIVA, EN_CURSO, FINALIZADA (no CANCELADA)
      }
    });

    if (actividadesActivas > 0) {
      throw new Error(
        `No se puede desactivar el tipo "${tipo.nombre}" porque tiene ${actividadesActivas} actividad(es) activa(s)`
      );
    }
    */

    // Soft delete
    return this.prisma.tipos_actividades.update({
      where: { id },
      data: { activo: false }
    });
  }

  /**
   * Reordenar tipos
   */
  async reorder(data: ReorderCatalogoDto) {
    const updates = data.ids.map((id, index) =>
      this.prisma.tipos_actividades.update({
        where: { id },
        data: { orden: index + 1 }
      })
    );

    await this.prisma.$transaction(updates);

    return { message: 'Orden actualizado exitosamente', count: updates.length };
  }
}
