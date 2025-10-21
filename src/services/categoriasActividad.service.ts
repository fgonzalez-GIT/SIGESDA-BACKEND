import { CategoriasActividadRepository } from '@/repositories/categoriasActividad.repository';
import {
  CreateCategoriaActividadDto,
  UpdateCategoriaActividadDto,
  QueryTiposCatalogoDto,
  ReorderCatalogoDto
} from '@/dto/catalogos-actividades.dto';
import { logger } from '@/utils/logger';

export class CategoriasActividadService {
  constructor(private repository: CategoriasActividadRepository) {}

  async create(data: CreateCategoriaActividadDto) {
    logger.info(`Creando categoría de actividad: ${data.codigo}`);

    // Convertir código a mayúsculas
    data.codigo = data.codigo.toUpperCase();

    const categoria = await this.repository.create(data);
    logger.info(`Categoría de actividad creada exitosamente: ${categoria.id}`);

    return categoria;
  }

  async findAll(query: QueryTiposCatalogoDto) {
    logger.info(`Listando categorías de actividad con filtros:`, query);
    return this.repository.findAll(query);
  }

  async findById(id: number) {
    logger.info(`Obteniendo categoría de actividad: ${id}`);
    return this.repository.findById(id);
  }

  async update(id: number, data: UpdateCategoriaActividadDto) {
    logger.info(`Actualizando categoría de actividad: ${id}`);

    // Convertir código a mayúsculas si se proporciona
    if (data.codigo) {
      data.codigo = data.codigo.toUpperCase();
    }

    const categoria = await this.repository.update(id, data);
    logger.info(`Categoría de actividad actualizada exitosamente: ${categoria.id}`);

    return categoria;
  }

  async delete(id: number) {
    logger.info(`Desactivando categoría de actividad: ${id}`);
    const categoria = await this.repository.delete(id);
    logger.info(`Categoría de actividad desactivada exitosamente: ${categoria.id}`);

    return categoria;
  }

  async reorder(data: ReorderCatalogoDto) {
    logger.info(`Reordenando ${data.ids.length} categorías de actividad`);
    return this.repository.reorder(data);
  }

  /**
   * Método de utilidad para obtener solo activas (compatible con código existente)
   */
  async getActivas() {
    return this.repository.findAll({
      includeInactive: false,
      orderBy: 'orden',
      orderDir: 'asc'
    });
  }
}
