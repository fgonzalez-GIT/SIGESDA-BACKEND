import { EstadosAulaRepository } from '@/repositories/estados-aula.repository';
import {
  CreateEstadoAulaDto,
  UpdateEstadoAulaDto,
  ReorderEstadoAulaDto
} from '@/dto/estados-aula.dto';
import { logger } from '@/utils/logger';

export class EstadosAulaService {
  constructor(private repository: EstadosAulaRepository) {}

  async create(data: CreateEstadoAulaDto) {
    logger.info(`Creando estado de aula: ${data.codigo}`);

    // Convertir código a mayúsculas
    data.codigo = data.codigo.toUpperCase();

    const estado = await this.repository.create(data);
    logger.info(`Estado de aula creado exitosamente: ${estado.id}`);

    return estado;
  }

  async findAll(options?: {
    includeInactive?: boolean;
    search?: string;
    orderBy?: string;
    orderDir?: 'asc' | 'desc';
  }) {
    logger.info(`Listando estados de aula con filtros:`, options);
    return this.repository.findAll(options);
  }

  async findById(id: number) {
    logger.info(`Obteniendo estado de aula: ${id}`);
    return this.repository.findById(id);
  }

  async update(id: number, data: UpdateEstadoAulaDto) {
    logger.info(`Actualizando estado de aula: ${id}`);

    // Convertir código a mayúsculas si se proporciona
    if (data.codigo) {
      data.codigo = data.codigo.toUpperCase();
    }

    const estado = await this.repository.update(id, data);
    logger.info(`Estado de aula actualizado exitosamente: ${estado.id}`);

    return estado;
  }

  async delete(id: number) {
    logger.info(`Desactivando estado de aula: ${id}`);
    const estado = await this.repository.delete(id);
    logger.info(`Estado de aula desactivado exitosamente: ${estado.id}`);

    return estado;
  }

  async reorder(data: ReorderEstadoAulaDto) {
    logger.info(`Reordenando ${data.ids.length} estados de aula`);
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
