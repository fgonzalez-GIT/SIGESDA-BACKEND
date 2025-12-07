/**
 * Service para gestión del catálogo de tipos de contacto
 * Capa de lógica de negocio para TipoContactoCatalogo
 */

import { TipoContactoRepository } from '@/repositories/tipo-contacto.repository';
import { CreateTipoContactoDto, UpdateTipoContactoDto, GetTiposContactoDto } from '@/dto/contacto.dto';
import { TipoContactoCatalogo } from '@prisma/client';
import { logger } from '@/utils/logger';
import { PrismaClient } from '@prisma/client';

export class TipoContactoService {
  private tipoContactoRepository: TipoContactoRepository;

  constructor(prisma: PrismaClient) {
    this.tipoContactoRepository = new TipoContactoRepository(prisma);
  }

  /**
   * Crear tipo de contacto
   */
  async create(data: CreateTipoContactoDto): Promise<TipoContactoCatalogo> {
    const tipo = await this.tipoContactoRepository.create(data);

    logger.info(`Tipo de contacto creado`, {
      id: tipo.id,
      codigo: tipo.codigo,
      nombre: tipo.nombre
    });

    return tipo;
  }

  /**
   * Obtener todos los tipos de contacto
   */
  async findAll(params?: GetTiposContactoDto): Promise<TipoContactoCatalogo[]> {
    const soloActivos = params?.soloActivos ?? true;
    const ordenarPor = params?.ordenarPor ?? 'orden';

    return this.tipoContactoRepository.findAll(soloActivos, ordenarPor);
  }

  /**
   * Obtener tipo de contacto por ID
   */
  async findById(id: number): Promise<TipoContactoCatalogo | null> {
    return this.tipoContactoRepository.findById(id);
  }

  /**
   * Obtener tipo de contacto por código
   */
  async findByCodigo(codigo: string): Promise<TipoContactoCatalogo | null> {
    return this.tipoContactoRepository.findByCodigo(codigo);
  }

  /**
   * Actualizar tipo de contacto
   */
  async update(id: number, data: UpdateTipoContactoDto): Promise<TipoContactoCatalogo> {
    const tipo = await this.tipoContactoRepository.update(id, data);

    logger.info(`Tipo de contacto actualizado`, {
      id: tipo.id,
      codigo: tipo.codigo
    });

    return tipo;
  }

  /**
   * Eliminar tipo de contacto
   */
  async delete(id: number): Promise<TipoContactoCatalogo> {
    const tipo = await this.tipoContactoRepository.delete(id);

    logger.warn(`Tipo de contacto eliminado PERMANENTEMENTE`, {
      id: tipo.id,
      codigo: tipo.codigo
    });

    return tipo;
  }

  /**
   * Desactivar tipo de contacto (soft delete)
   */
  async deactivate(id: number): Promise<TipoContactoCatalogo> {
    const tipo = await this.tipoContactoRepository.deactivate(id);

    logger.info(`Tipo de contacto desactivado`, {
      id: tipo.id,
      codigo: tipo.codigo
    });

    return tipo;
  }

  /**
   * Activar tipo de contacto
   */
  async activate(id: number): Promise<TipoContactoCatalogo> {
    const tipo = await this.tipoContactoRepository.activate(id);

    logger.info(`Tipo de contacto activado`, {
      id: tipo.id,
      codigo: tipo.codigo
    });

    return tipo;
  }

  /**
   * Obtener estadísticas de uso de tipos de contacto
   */
  async getEstadisticasUso() {
    return this.tipoContactoRepository.getEstadisticasUso();
  }
}
