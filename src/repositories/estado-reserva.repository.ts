// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import {
  CreateEstadoReservaDto,
  UpdateEstadoReservaDto,
  QueryEstadosReservasDto,
  ReorderEstadosReservasDto
} from '@/dto/estados-reserva.dto';

export class EstadoReservaRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateEstadoReservaDto) {
    const existing = await this.prisma.estadoReserva.findUnique({
      where: { codigo: data.codigo }
    });

    if (existing) {
      throw new Error(`Ya existe un estado de reserva con código: ${data.codigo}`);
    }

    let orden = data.orden;
    if (!orden || orden === 0) {
      const maxOrden = await this.prisma.estadoReserva.findFirst({
        select: { orden: true },
        orderBy: { orden: 'desc' }
      });
      orden = (maxOrden?.orden ?? 0) + 1;
    }

    return this.prisma.estadoReserva.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion ?? null,
        activo: data.activo ?? true,
        orden
      }
    });
  }

  async findAll(query: QueryEstadosReservasDto) {
    const where: any = {};

    if (!query.includeInactive) {
      where.activo = true;
    }

    if (query.search) {
      where.OR = [
        { codigo: { contains: query.search, mode: 'insensitive' } },
        { nombre: { contains: query.search, mode: 'insensitive' } },
        { descripcion: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    const orderBy: any = {};
    orderBy[query.orderBy] = query.orderDir;

    return this.prisma.estadoReserva.findMany({
      where,
      orderBy,
      include: {
        _count: {
          select: { reservas: true }
        }
      }
    });
  }

  async findById(id: number) {
    const estado = await this.prisma.estadoReserva.findUnique({
      where: { id },
      include: {
        _count: {
          select: { reservas: true }
        }
      }
    });

    if (!estado) {
      throw new Error(`Estado de reserva con ID ${id} no encontrado`);
    }

    return estado;
  }

  async findByCodigo(codigo: string) {
    const estado = await this.prisma.estadoReserva.findUnique({
      where: { codigo }
    });

    if (!estado) {
      throw new Error(`Estado de reserva con código ${codigo} no encontrado`);
    }

    return estado;
  }

  async update(id: number, data: UpdateEstadoReservaDto) {
    await this.findById(id);

    if (data.codigo) {
      const existing = await this.prisma.estadoReserva.findFirst({
        where: {
          codigo: data.codigo,
          id: { not: id }
        }
      });

      if (existing) {
        throw new Error(`Ya existe un estado de reserva con código: ${data.codigo}`);
      }
    }

    return this.prisma.estadoReserva.update({
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

  async delete(id: number) {
    const estado = await this.findById(id);

    const reservasActivas = await this.prisma.reserva_aulas.count({
      where: {
        estadoReservaId: id,
        activa: true
      }
    });

    if (reservasActivas > 0) {
      throw new Error(
        `No se puede desactivar el estado "${estado.nombre}" porque tiene ${reservasActivas} reserva(s) activa(s)`
      );
    }

    return this.prisma.estadoReserva.update({
      where: { id },
      data: { activo: false }
    });
  }

  async reorder(data: ReorderEstadosReservasDto) {
    const updates = data.ids.map((id, index) =>
      this.prisma.estadoReserva.update({
        where: { id },
        data: { orden: index + 1 }
      })
    );

    await this.prisma.$transaction(updates);

    return { message: 'Orden actualizado exitosamente', count: updates.length };
  }
}
