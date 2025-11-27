// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import {
  CreateTipoAulaDto,
  UpdateTipoAulaDto,
  ReorderTipoAulaDto
} from '@/dto/tipos-aula.dto';

export class TiposAulaRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Crear nuevo tipo de aula
   */
  async create(data: CreateTipoAulaDto) {
    // 1. Verificar que el código no exista
    const existing = await this.prisma.tipoAula.findUnique({
      where: { codigo: data.codigo }
    });

    if (existing) {
      throw new Error(`Ya existe un tipo de aula con código: ${data.codigo}`);
    }

    // 2. Si no se proporciona orden, usar el siguiente disponible
    let orden = data.orden;
    if (!orden || orden === 0) {
      const maxOrden = await this.prisma.tipoAula.findFirst({
        select: { orden: true },
        orderBy: { orden: 'desc' }
      });
      orden = (maxOrden?.orden ?? 0) + 1;
    }

    // 3. Crear el tipo
    return this.prisma.tipoAula.create({
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

    return this.prisma.tipoAula.findMany({
      where,
      orderBy,
      include: {
        _count: {
          select: { aulas: true }
        }
      }
    });
  }

  /**
   * Obtener por ID
   */
  async findById(id: number) {
    const tipo = await this.prisma.tipoAula.findUnique({
      where: { id },
      include: {
        _count: {
          select: { aulas: true }
        }
      }
    });

    if (!tipo) {
      throw new Error(`Tipo de aula con ID ${id} no encontrado`);
    }

    return tipo;
  }

  /**
   * Obtener por código
   */
  async findByCodigo(codigo: string) {
    return this.prisma.tipoAula.findUnique({
      where: { codigo }
    });
  }

  /**
   * Actualizar tipo
   */
  async update(id: number, data: UpdateTipoAulaDto) {
    // Verificar que existe
    await this.findById(id);

    // Si se cambia el código, verificar que no exista
    if (data.codigo) {
      const existing = await this.prisma.tipoAula.findFirst({
        where: {
          codigo: data.codigo,
          id: { not: id }
        }
      });

      if (existing) {
        throw new Error(`Ya existe un tipo de aula con código: ${data.codigo}`);
      }
    }

    return this.prisma.tipoAula.update({
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

    // Verificar si tiene aulas activas
    const aulasActivas = await this.prisma.aula.count({
      where: {
        tipoAulaId: id,
        activa: true
      }
    });

    if (aulasActivas > 0) {
      throw new Error(
        `No se puede desactivar el tipo "${tipo.nombre}" porque tiene ${aulasActivas} aula(s) activa(s)`
      );
    }

    // Soft delete
    return this.prisma.tipoAula.update({
      where: { id },
      data: { activo: false }
    });
  }

  /**
   * Reordenar tipos
   */
  async reorder(data: ReorderTipoAulaDto) {
    const updates = data.ids.map((id, index) =>
      this.prisma.tipoAula.update({
        where: { id },
        data: { orden: index + 1 }
      })
    );

    await this.prisma.$transaction(updates);

    return { message: 'Orden actualizado exitosamente', count: updates.length };
  }
}
