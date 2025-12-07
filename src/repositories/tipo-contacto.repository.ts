/**
 * Repository para gestión del catálogo de tipos de contacto
 * Implementa el patrón Repository para TipoContactoCatalogo
 */

import { PrismaClient, TipoContactoCatalogo } from '@prisma/client';
import { CreateTipoContactoDto, UpdateTipoContactoDto } from '@/dto/contacto.dto';
import { AppError } from '@/middleware/error.middleware';
import { HttpStatus } from '@/types/enums';

export class TipoContactoRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Crear tipo de contacto
   * Valida que el código no exista
   */
  async create(data: CreateTipoContactoDto): Promise<TipoContactoCatalogo> {
    // Verificar que el código no exista
    const exists = await this.prisma.tipoContactoCatalogo.findUnique({
      where: { codigo: data.codigo }
    });

    if (exists) {
      throw new AppError(
        `Ya existe un tipo de contacto con el código '${data.codigo}'`,
        HttpStatus.CONFLICT
      );
    }

    return this.prisma.tipoContactoCatalogo.create({ data });
  }

  /**
   * Obtener todos los tipos de contacto
   * @param soloActivos Si true, solo devuelve tipos activos
   * @param ordenarPor Campo por el cual ordenar
   */
  async findAll(
    soloActivos: boolean = true,
    ordenarPor: 'orden' | 'nombre' | 'codigo' = 'orden'
  ): Promise<TipoContactoCatalogo[]> {
    return this.prisma.tipoContactoCatalogo.findMany({
      where: soloActivos ? { activo: true } : undefined,
      orderBy: { [ordenarPor]: 'asc' }
    });
  }

  /**
   * Obtener tipo de contacto por ID
   */
  async findById(id: number): Promise<TipoContactoCatalogo | null> {
    return this.prisma.tipoContactoCatalogo.findUnique({
      where: { id }
    });
  }

  /**
   * Obtener tipo de contacto por código
   */
  async findByCodigo(codigo: string): Promise<TipoContactoCatalogo | null> {
    return this.prisma.tipoContactoCatalogo.findUnique({
      where: { codigo }
    });
  }

  /**
   * Actualizar tipo de contacto
   */
  async update(id: number, data: UpdateTipoContactoDto): Promise<TipoContactoCatalogo> {
    const exists = await this.findById(id);
    if (!exists) {
      throw new AppError('Tipo de contacto no encontrado', HttpStatus.NOT_FOUND);
    }

    // Si cambia código, verificar que el nuevo código no exista
    if (data.codigo && data.codigo !== exists.codigo) {
      const codigoExists = await this.findByCodigo(data.codigo);
      if (codigoExists) {
        throw new AppError(
          `Ya existe un tipo de contacto con el código '${data.codigo}'`,
          HttpStatus.CONFLICT
        );
      }
    }

    return this.prisma.tipoContactoCatalogo.update({
      where: { id },
      data
    });
  }

  /**
   * Eliminar tipo de contacto (hard delete)
   * Verifica que no tenga contactos asociados antes de eliminar
   */
  async delete(id: number): Promise<TipoContactoCatalogo> {
    const tipo = await this.findById(id);
    if (!tipo) {
      throw new AppError('Tipo de contacto no encontrado', HttpStatus.NOT_FOUND);
    }

    // Verificar si hay contactos usando este tipo
    const contactosCount = await this.prisma.contactoPersona.count({
      where: { tipoContactoId: id }
    });

    if (contactosCount > 0) {
      throw new AppError(
        `No se puede eliminar el tipo de contacto porque tiene ${contactosCount} contacto(s) asociado(s). Desactívelo en su lugar.`,
        HttpStatus.CONFLICT
      );
    }

    return this.prisma.tipoContactoCatalogo.delete({
      where: { id }
    });
  }

  /**
   * Desactivar tipo de contacto (soft delete)
   */
  async deactivate(id: number): Promise<TipoContactoCatalogo> {
    const exists = await this.findById(id);
    if (!exists) {
      throw new AppError('Tipo de contacto no encontrado', HttpStatus.NOT_FOUND);
    }

    return this.prisma.tipoContactoCatalogo.update({
      where: { id },
      data: { activo: false }
    });
  }

  /**
   * Activar tipo de contacto
   */
  async activate(id: number): Promise<TipoContactoCatalogo> {
    const exists = await this.findById(id);
    if (!exists) {
      throw new AppError('Tipo de contacto no encontrado', HttpStatus.NOT_FOUND);
    }

    return this.prisma.tipoContactoCatalogo.update({
      where: { id },
      data: { activo: true }
    });
  }

  /**
   * Contar contactos asociados a un tipo
   */
  async contarContactosAsociados(id: number): Promise<number> {
    return this.prisma.contactoPersona.count({
      where: { tipoContactoId: id }
    });
  }

  /**
   * Obtener estadísticas de uso de tipos de contacto
   */
  async getEstadisticasUso(): Promise<Array<{
    tipo: TipoContactoCatalogo;
    totalContactos: number;
    contactosActivos: number;
  }>> {
    const tipos = await this.findAll(false);

    const estadisticas = await Promise.all(
      tipos.map(async (tipo) => {
        const totalContactos = await this.prisma.contactoPersona.count({
          where: { tipoContactoId: tipo.id }
        });

        const contactosActivos = await this.prisma.contactoPersona.count({
          where: {
            tipoContactoId: tipo.id,
            activo: true
          }
        });

        return {
          tipo,
          totalContactos,
          contactosActivos
        };
      })
    );

    return estadisticas;
  }
}
