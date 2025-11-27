import { TiposAulaRepository } from '@/repositories/tipos-aula.repository';
import {
  CreateTipoAulaDto,
  UpdateTipoAulaDto,
  ReorderTipoAulaDto
} from '@/dto/tipos-aula.dto';
import { logger } from '@/utils/logger';

export class TiposAulaService {
  constructor(private repository: TiposAulaRepository) {}

  async create(data: CreateTipoAulaDto) {
    logger.info(`Creando tipo de aula: ${data.codigo}`);

    // Convertir código a mayúsculas
    data.codigo = data.codigo.toUpperCase();

    const tipo = await this.repository.create(data);
    logger.info(`Tipo de aula creado exitosamente: ${tipo.id}`);

    return tipo;
  }

  async findAll(options?: {
    includeInactive?: boolean;
    search?: string;
    orderBy?: string;
    orderDir?: 'asc' | 'desc';
  }) {
    logger.info(`Listando tipos de aula con filtros:`, options);
    return this.repository.findAll(options);
  }

  async findById(id: number) {
    logger.info(`Obteniendo tipo de aula: ${id}`);
    return this.repository.findById(id);
  }

  async update(id: number, data: UpdateTipoAulaDto) {
    logger.info(`Actualizando tipo de aula: ${id}`);

    // Convertir código a mayúsculas si se proporciona
    if (data.codigo) {
      data.codigo = data.codigo.toUpperCase();
    }

    const tipo = await this.repository.update(id, data);
    logger.info(`Tipo de aula actualizado exitosamente: ${tipo.id}`);

    return tipo;
  }

  async delete(id: number) {
    logger.info(`Desactivando tipo de aula: ${id}`);
    const tipo = await this.repository.delete(id);
    logger.info(`Tipo de aula desactivado exitosamente: ${tipo.id}`);

    return tipo;
  }

  async reorder(data: ReorderTipoAulaDto) {
    logger.info(`Reordenando ${data.ids.length} tipos de aula`);
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
