import { TiposActividadRepository } from '@/repositories/tiposActividad.repository';
import {
  CreateTipoActividadDto,
  UpdateTipoActividadDto,
  QueryTiposCatalogoDto,
  ReorderCatalogoDto
} from '@/dto/catalogos-actividades.dto';
import { logger } from '@/utils/logger';

export class TiposActividadService {
  constructor(private repository: TiposActividadRepository) {}

  async create(data: CreateTipoActividadDto) {
    logger.info(`Creando tipo de actividad: ${data.codigo}`);

    // Convertir código a mayúsculas
    data.codigo = data.codigo.toUpperCase();

    const tipo = await this.repository.create(data);
    logger.info(`Tipo de actividad creado exitosamente: ${tipo.id}`);

    return tipo;
  }

  async findAll(query: QueryTiposCatalogoDto) {
    logger.info(`Listando tipos de actividad con filtros:`, query);
    return this.repository.findAll(query);
  }

  async findById(id: number) {
    logger.info(`Obteniendo tipo de actividad: ${id}`);
    return this.repository.findById(id);
  }

  async update(id: number, data: UpdateTipoActividadDto) {
    logger.info(`Actualizando tipo de actividad: ${id}`);

    // Convertir código a mayúsculas si se proporciona
    if (data.codigo) {
      data.codigo = data.codigo.toUpperCase();
    }

    const tipo = await this.repository.update(id, data);
    logger.info(`Tipo de actividad actualizado exitosamente: ${tipo.id}`);

    return tipo;
  }

  async delete(id: number) {
    logger.info(`Desactivando tipo de actividad: ${id}`);
    const tipo = await this.repository.delete(id);
    logger.info(`Tipo de actividad desactivado exitosamente: ${tipo.id}`);

    return tipo;
  }

  async reorder(data: ReorderCatalogoDto) {
    logger.info(`Reordenando ${data.ids.length} tipos de actividad`);
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
