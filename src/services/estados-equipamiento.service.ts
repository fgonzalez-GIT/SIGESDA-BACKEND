import { EstadosEquipamientoRepository } from '@/repositories/estados-equipamiento.repository';
import {
  CreateEstadoEquipamientoDto,
  UpdateEstadoEquipamientoDto,
  ReorderEstadoEquipamientoDto
} from '@/dto/estados-equipamiento.dto';
import { logger } from '@/utils/logger';

export class EstadosEquipamientoService {
  constructor(private repository: EstadosEquipamientoRepository) {}

  async create(data: CreateEstadoEquipamientoDto) {
    logger.info(`Creando estado de equipamiento: ${data.codigo}`);

    // Convertir código a mayúsculas
    data.codigo = data.codigo.toUpperCase();

    const estado = await this.repository.create(data);
    logger.info(`Estado de equipamiento creado exitosamente: ${estado.id}`);

    return estado;
  }

  async findAll(options?: {
    includeInactive?: boolean;
    search?: string;
    orderBy?: string;
    orderDir?: 'asc' | 'desc';
  }) {
    logger.info(`Listando estados de equipamiento con filtros:`, options);
    return this.repository.findAll(options);
  }

  async findById(id: number) {
    logger.info(`Obteniendo estado de equipamiento: ${id}`);
    return this.repository.findById(id);
  }

  async update(id: number, data: UpdateEstadoEquipamientoDto) {
    logger.info(`Actualizando estado de equipamiento: ${id}`);

    // Convertir código a mayúsculas si se proporciona
    if (data.codigo) {
      data.codigo = data.codigo.toUpperCase();
    }

    const estado = await this.repository.update(id, data);
    logger.info(`Estado de equipamiento actualizado exitosamente: ${estado.id}`);

    return estado;
  }

  async delete(id: number) {
    logger.info(`Desactivando estado de equipamiento: ${id}`);
    const estado = await this.repository.delete(id);
    logger.info(`Estado de equipamiento desactivado exitosamente: ${estado.id}`);

    return estado;
  }

  async reorder(data: ReorderEstadoEquipamientoDto) {
    logger.info(`Reordenando ${data.ids.length} estados de equipamiento`);
    return this.repository.reorder(data);
  }

  /**
   * Método de utilidad para obtener solo activos (compatible con código existente)
   */
  async getActivos() {
    return this.repository.findAll({
      includeInactive: false,
      orderBy: 'orden',
      orderDir: 'asc'
    });
  }
}
