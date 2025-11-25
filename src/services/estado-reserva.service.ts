// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import { EstadoReservaRepository } from '@/repositories/estado-reserva.repository';
import {
  CreateEstadoReservaDto,
  UpdateEstadoReservaDto,
  QueryEstadosReservasDto,
  ReorderEstadosReservasDto
} from '@/dto/estados-reserva.dto';

export class EstadoReservaService {
  private repository: EstadoReservaRepository;

  constructor(private prisma: PrismaClient) {
    this.repository = new EstadoReservaRepository(prisma);
  }

  async create(data: CreateEstadoReservaDto) {
    try {
      const estado = await this.repository.create(data);
      return {
        success: true,
        message: 'Estado de reserva creado exitosamente',
        data: estado
      };
    } catch (error: any) {
      throw new Error(`Error al crear estado de reserva: ${error.message}`);
    }
  }

  async findAll(query: QueryEstadosReservasDto) {
    try {
      const estados = await this.repository.findAll(query);
      return {
        success: true,
        data: estados,
        message: `Se encontraron ${estados.length} estado(s) de reserva`
      };
    } catch (error: any) {
      throw new Error(`Error al listar estados de reserva: ${error.message}`);
    }
  }

  async findById(id: number) {
    try {
      const estado = await this.repository.findById(id);
      return {
        success: true,
        data: estado
      };
    } catch (error: any) {
      throw new Error(`Error al obtener estado de reserva: ${error.message}`);
    }
  }

  async findByCodigo(codigo: string) {
    try {
      const estado = await this.repository.findByCodigo(codigo);
      return {
        success: true,
        data: estado
      };
    } catch (error: any) {
      throw new Error(`Error al obtener estado de reserva por código: ${error.message}`);
    }
  }

  async update(id: number, data: UpdateEstadoReservaDto) {
    try {
      const estado = await this.repository.update(id, data);
      return {
        success: true,
        message: 'Estado de reserva actualizado exitosamente',
        data: estado
      };
    } catch (error: any) {
      throw new Error(`Error al actualizar estado de reserva: ${error.message}`);
    }
  }

  async delete(id: number) {
    try {
      const estado = await this.repository.delete(id);
      return {
        success: true,
        message: `Estado de reserva "${estado.nombre}" desactivado exitosamente`,
        data: estado
      };
    } catch (error: any) {
      throw new Error(`Error al desactivar estado de reserva: ${error.message}`);
    }
  }

  async reorder(data: ReorderEstadosReservasDto) {
    try {
      const result = await this.repository.reorder(data);
      return {
        success: true,
        message: result.message,
        data: { count: result.count }
      };
    } catch (error: any) {
      throw new Error(`Error al reordenar estados de reserva: ${error.message}`);
    }
  }

  /**
   * Obtiene el estado inicial por defecto (PENDIENTE)
   * Útil para asignar estado inicial a nuevas reservas
   */
  async getEstadoInicial() {
    try {
      const estado = await this.repository.findByCodigo('PENDIENTE');
      return estado;
    } catch (error: any) {
      // Si no existe PENDIENTE, buscar el primer estado activo
      const estados = await this.repository.findAll({
        includeInactive: false,
        orderBy: 'orden',
        orderDir: 'asc',
        page: 1,
        limit: 1
      } as QueryEstadosReservasDto);

      if (estados.length === 0) {
        throw new Error('No hay estados de reserva activos en el sistema');
      }

      return estados[0];
    }
  }

  /**
   * Valida si un estado es válido para una operación
   */
  async validateEstado(estadoId: number): Promise<boolean> {
    try {
      const estado = await this.repository.findById(estadoId);
      return estado.activo;
    } catch (error) {
      return false;
    }
  }

  /**
   * Valida transiciones de estado permitidas
   * Workflow básico:
   * PENDIENTE -> CONFIRMADA | RECHAZADA
   * CONFIRMADA -> COMPLETADA | CANCELADA
   * COMPLETADA -> (final)
   * CANCELADA -> (final)
   * RECHAZADA -> (final)
   */
  async validateTransicion(estadoActualCodigo: string, nuevoEstadoCodigo: string): Promise<boolean> {
    const transicionesPermitidas: Record<string, string[]> = {
      'PENDIENTE': ['CONFIRMADA', 'RECHAZADA', 'CANCELADA'],
      'CONFIRMADA': ['COMPLETADA', 'CANCELADA'],
      'COMPLETADA': [], // Estado final
      'CANCELADA': [], // Estado final
      'RECHAZADA': [] // Estado final
    };

    const permitidas = transicionesPermitidas[estadoActualCodigo] || [];
    return permitidas.includes(nuevoEstadoCodigo);
  }

  /**
   * Obtiene estadísticas de uso de estados
   */
  async getEstadisticasUso() {
    try {
      const estados = await this.repository.findAll({
        includeInactive: false,
        orderBy: 'orden',
        orderDir: 'asc',
        page: 1,
        limit: 100
      } as QueryEstadosReservasDto);

      const estadisticas = estados.map((estado: any) => ({
        id: estado.id,
        codigo: estado.codigo,
        nombre: estado.nombre,
        totalReservas: estado._count.reservas,
        orden: estado.orden
      }));

      return {
        success: true,
        data: estadisticas,
        message: 'Estadísticas de uso de estados obtenidas exitosamente'
      };
    } catch (error: any) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }
}
