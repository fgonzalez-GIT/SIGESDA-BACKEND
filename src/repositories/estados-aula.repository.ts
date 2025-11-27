// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import {
  CreateEstadoAulaDto,
  UpdateEstadoAulaDto,
  ReorderEstadoAulaDto
} from '@/dto/estados-aula.dto';

export class EstadosAulaRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Crear nuevo estado de aula
   */
  async create(data: CreateEstadoAulaDto) {
    // 1. Verificar que el código no exista
    const existing = await this.prisma.estadoAula.findUnique({
      where: { codigo: data.codigo }
    });

    if (existing) {
      throw new Error(`Ya existe un estado de aula con código: ${data.codigo}`);
    }

    // 2. Si no se proporciona orden, usar el siguiente disponible
    let orden = data.orden;
    if (!orden || orden === 0) {
      const maxOrden = await this.prisma.estadoAula.findFirst({
        select: { orden: true },
        orderBy: { orden: 'desc' }
      });
      orden = (maxOrden?.orden ?? 0) + 1;
    }

    // 3. Crear el estado
    return this.prisma.estadoAula.create({
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
   * Listar estados con filtros
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

    return this.prisma.estadoAula.findMany({
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
    const estado = await this.prisma.estadoAula.findUnique({
      where: { id },
      include: {
        _count: {
          select: { aulas: true }
        }
      }
    });

    if (!estado) {
      throw new Error(`Estado de aula con ID ${id} no encontrado`);
    }

    return estado;
  }

  /**
   * Obtener por código
   */
  async findByCodigo(codigo: string) {
    return this.prisma.estadoAula.findUnique({
      where: { codigo }
    });
  }

  /**
   * Actualizar estado
   */
  async update(id: number, data: UpdateEstadoAulaDto) {
    // Verificar que existe
    await this.findById(id);

    // Si se cambia el código, verificar que no exista
    if (data.codigo) {
      const existing = await this.prisma.estadoAula.findFirst({
        where: {
          codigo: data.codigo,
          id: { not: id }
        }
      });

      if (existing) {
        throw new Error(`Ya existe un estado de aula con código: ${data.codigo}`);
      }
    }

    return this.prisma.estadoAula.update({
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
    const estado = await this.findById(id);

    // Verificar si tiene aulas activas
    const aulasActivas = await this.prisma.aula.count({
      where: {
        estadoAulaId: id,
        activa: true
      }
    });

    if (aulasActivas > 0) {
      throw new Error(
        `No se puede desactivar el estado "${estado.nombre}" porque tiene ${aulasActivas} aula(s) activa(s)`
      );
    }

    // Soft delete
    return this.prisma.estadoAula.update({
      where: { id },
      data: { activo: false }
    });
  }

  /**
   * Reordenar estados
   */
  async reorder(data: ReorderEstadoAulaDto) {
    const updates = data.ids.map((id, index) =>
      this.prisma.estadoAula.update({
        where: { id },
        data: { orden: index + 1 }
      })
    );

    await this.prisma.$transaction(updates);

    return { message: 'Orden actualizado exitosamente', count: updates.length };
  }
}
