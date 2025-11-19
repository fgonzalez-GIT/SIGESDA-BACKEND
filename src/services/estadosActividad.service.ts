import { EstadosActividadRepository } from '@/repositories/estadosActividad.repository';
import {
  CreateEstadoActividadDto,
  UpdateEstadoActividadDto,
  QueryTiposCatalogoDto,
  ReorderCatalogoDto
} from '@/dto/catalogos-actividades.dto';
import { logger } from '@/utils/logger';

export class EstadosActividadService {
  constructor(private repository: EstadosActividadRepository) {}

  async create(data: CreateEstadoActividadDto) {
    logger.info(`Creando estado de actividad: ${data.codigo}`);
    data.codigo = data.codigo.toUpperCase();
    const estado = await this.repository.create(data);
    logger.info(`Estado de actividad creado exitosamente: ${estado.id}`);
    return estado;
  }

  async findAll(query: QueryTiposCatalogoDto) {
    logger.info(`Listando estados de actividad con filtros:`, query);
    return this.repository.findAll(query);
  }

  async findById(id: number) {
    logger.info(`Obteniendo estado de actividad: ${id}`);
    return this.repository.findById(id);
  }

  async update(id: number, data: UpdateEstadoActividadDto) {
    logger.info(`Actualizando estado de actividad: ${id}`);
    if (data.codigo) {
      data.codigo = data.codigo.toUpperCase();
    }
    const estado = await this.repository.update(id, data);
    logger.info(`Estado de actividad actualizado exitosamente: ${estado.id}`);
    return estado;
  }

  async delete(id: number) {
    logger.info(`Desactivando estado de actividad: ${id}`);
    const estado = await this.repository.delete(id);
    logger.info(`Estado de actividad desactivado exitosamente: ${estado.id}`);
    return estado;
  }

  async reorder(data: ReorderCatalogoDto) {
    logger.info(`Reordenando ${data.ids.length} estados de actividad`);
    return this.repository.reorder(data);
  }

  async getActivos() {
    return this.repository.findAll({
      includeInactive: false,
      orderBy: 'orden',
      orderDir: 'asc'
    });
  }
}
