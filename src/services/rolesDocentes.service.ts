import { RolesDocentesRepository } from '@/repositories/rolesDocentes.repository';
import {
  CreateRolDocenteDto,
  UpdateRolDocenteDto,
  QueryTiposCatalogoDto,
  ReorderCatalogoDto
} from '@/dto/catalogos-actividades.dto';
import { logger } from '@/utils/logger';

export class RolesDocentesService {
  constructor(private repository: RolesDocentesRepository) {}

  async create(data: CreateRolDocenteDto) {
    logger.info(`Creando rol de docente: ${data.codigo}`);
    data.codigo = data.codigo.toUpperCase();
    const rol = await this.repository.create(data);
    logger.info(`Rol de docente creado exitosamente: ${rol.id}`);
    return rol;
  }

  async findAll(query: QueryTiposCatalogoDto) {
    logger.info(`Listando roles de docentes con filtros:`, query);
    return this.repository.findAll(query);
  }

  async findById(id: number) {
    logger.info(`Obteniendo rol de docente: ${id}`);
    return this.repository.findById(id);
  }

  async update(id: number, data: UpdateRolDocenteDto) {
    logger.info(`Actualizando rol de docente: ${id}`);
    if (data.codigo) {
      data.codigo = data.codigo.toUpperCase();
    }
    const rol = await this.repository.update(id, data);
    logger.info(`Rol de docente actualizado exitosamente: ${rol.id}`);
    return rol;
  }

  async delete(id: number) {
    logger.info(`Desactivando rol de docente: ${id}`);
    const rol = await this.repository.delete(id);
    logger.info(`Rol de docente desactivado exitosamente: ${rol.id}`);
    return rol;
  }

  async reorder(data: ReorderCatalogoDto) {
    logger.info(`Reordenando ${data.ids.length} roles de docentes`);
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
