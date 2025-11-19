// @ts-nocheck
import { PrismaClient } from '@prisma/client';

export class DiasSemanaRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll() {
    return this.prisma.dias_semana.findMany({
      orderBy: { orden: 'asc' }
    });
  }

  async findById(id: number) {
    const dia = await this.prisma.dias_semana.findUnique({
      where: { id }
    });

    if (!dia) {
      throw new Error(`Día de la semana con ID ${id} no encontrado`);
    }

    return dia;
  }

  async findByCodigo(codigo: string) {
    const dia = await this.prisma.dias_semana.findUnique({
      where: { codigo }
    });

    if (!dia) {
      throw new Error(`Día de la semana con código ${codigo} no encontrado`);
    }

    return dia;
  }
}
