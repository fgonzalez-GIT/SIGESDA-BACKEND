import { CategoriasEquipamientoRepository } from '@/repositories/categorias-equipamiento.repository';
import {
  CreateCategoriaEquipamientoDto,
  UpdateCategoriaEquipamientoDto,
  ReorderCategoriaEquipamientoDto
} from '@/dto/categorias-equipamiento.dto';
import { logger } from '@/utils/logger';

export class CategoriasEquipamientoService {
  constructor(private repository: CategoriasEquipamientoRepository) {}

  async create(data: CreateCategoriaEquipamientoDto) {
    logger.info(`Creando categoría de equipamiento: ${data.codigo}`);

    // Convertir código a mayúsculas
    data.codigo = data.codigo.toUpperCase();

    const categoria = await this.repository.create(data);
    logger.info(`Categoría de equipamiento creada exitosamente: ${categoria.id}`);

    return categoria;
  }

  async findAll(options?: {
    includeInactive?: boolean;
    search?: string;
    orderBy?: string;
    orderDir?: 'asc' | 'desc';
  }) {
    logger.info(`Listando categorías de equipamiento con filtros:`, options);
    return this.repository.findAll(options);
  }

  async findById(id: number) {
    logger.info(`Obteniendo categoría de equipamiento: ${id}`);
    return this.repository.findById(id);
  }

  async update(id: number, data: UpdateCategoriaEquipamientoDto) {
    logger.info(`Actualizando categoría de equipamiento: ${id}`);

    // Convertir código a mayúsculas si se proporciona
    if (data.codigo) {
      data.codigo = data.codigo.toUpperCase();
    }

    const categoria = await this.repository.update(id, data);
    logger.info(`Categoría de equipamiento actualizada exitosamente: ${categoria.id}`);

    return categoria;
  }

  async delete(id: number) {
    logger.info(`Desactivando categoría de equipamiento: ${id}`);
    const categoria = await this.repository.delete(id);
    logger.info(`Categoría de equipamiento desactivada exitosamente: ${categoria.id}`);

    return categoria;
  }

  async reorder(data: ReorderCategoriaEquipamientoDto) {
    logger.info(`Reordenando ${data.ids.length} categorías de equipamiento`);
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
