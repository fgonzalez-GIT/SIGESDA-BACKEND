import { DiasSemanaRepository } from '@/repositories/diasSemana.repository';
import { logger } from '@/utils/logger';

export class DiasSemanaService {
  constructor(private repository: DiasSemanaRepository) {}

  async findAll() {
    logger.info(`Listando días de la semana`);
    return this.repository.findAll();
  }

  async findById(id: number) {
    logger.info(`Obteniendo día de la semana: ${id}`);
    return this.repository.findById(id);
  }

  async findByCodigo(codigo: string) {
    logger.info(`Obteniendo día de la semana por código: ${codigo}`);
    return this.repository.findByCodigo(codigo);
  }
}
