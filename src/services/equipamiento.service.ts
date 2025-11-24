import { Equipamiento } from '@prisma/client';
import { EquipamientoRepository } from '@/repositories/equipamiento.repository';
import { CreateEquipamientoDto, UpdateEquipamientoDto, EquipamientoQueryDto } from '@/dto/equipamiento.dto';
import { logger } from '@/utils/logger';
import { ConflictError, NotFoundError, ValidationError } from '@/utils/errors';

export class EquipamientoService {
  constructor(private equipamientoRepository: EquipamientoRepository) {}

  async createEquipamiento(data: CreateEquipamientoDto): Promise<Equipamiento> {
    // Validar que el nombre sea único
    const existingEquipamiento = await this.equipamientoRepository.findByNombre(data.nombre);
    if (existingEquipamiento) {
      throw new ConflictError(`Ya existe un equipamiento con el nombre ${data.nombre}`);
    }

    const equipamiento = await this.equipamientoRepository.create(data);

    logger.info(`Equipamiento creado: ${equipamiento.nombre} - ID: ${equipamiento.id}`);

    return equipamiento;
  }

  async getEquipamientos(query: EquipamientoQueryDto): Promise<{ data: Equipamiento[]; total: number; pages: number }> {
    const result = await this.equipamientoRepository.findAll(query);
    const pages = Math.ceil(result.total / query.limit);

    return {
      ...result,
      pages
    };
  }

  async getEquipamientoById(id: number): Promise<Equipamiento | null> {
    return this.equipamientoRepository.findById(id);
  }

  async updateEquipamiento(id: number, data: UpdateEquipamientoDto): Promise<Equipamiento> {
    // Verificar que el equipamiento existe
    const existingEquipamiento = await this.equipamientoRepository.findById(id);
    if (!existingEquipamiento) {
      throw new NotFoundError(`Equipamiento con ID ${id} no encontrado`);
    }

    // Validar nombre único si se está actualizando
    if (data.nombre && data.nombre !== existingEquipamiento.nombre) {
      const equipamientoWithSameName = await this.equipamientoRepository.findByNombre(data.nombre);
      if (equipamientoWithSameName) {
        throw new ConflictError(`Ya existe un equipamiento con el nombre ${data.nombre}`);
      }
    }

    const updatedEquipamiento = await this.equipamientoRepository.update(id, data);

    logger.info(`Equipamiento actualizado: ${updatedEquipamiento.nombre} (ID: ${id})`);

    return updatedEquipamiento;
  }

  async deleteEquipamiento(id: number, hard = false): Promise<Equipamiento> {
    const existingEquipamiento = await this.equipamientoRepository.findById(id);
    if (!existingEquipamiento) {
      throw new NotFoundError(`Equipamiento con ID ${id} no encontrado`);
    }

    // Verificar si está en uso en alguna aula
    const usageCount = await this.equipamientoRepository.checkUsageInAulas(id);

    if (usageCount > 0 && hard) {
      throw new ValidationError(
        `No se puede eliminar el equipamiento porque está asignado a ${usageCount} aula(s). ` +
        `Use soft delete o desasigne el equipamiento de todas las aulas primero.`
      );
    }

    let deletedEquipamiento: Equipamiento;

    if (hard && usageCount === 0) {
      deletedEquipamiento = await this.equipamientoRepository.delete(id);
      logger.info(`Equipamiento eliminado permanentemente: ${deletedEquipamiento.nombre} (ID: ${id})`);
    } else {
      deletedEquipamiento = await this.equipamientoRepository.softDelete(id);
      logger.info(`Equipamiento desactivado (soft delete): ${deletedEquipamiento.nombre} (ID: ${id})`);
    }

    return deletedEquipamiento;
  }

  async reactivateEquipamiento(id: number): Promise<Equipamiento> {
    const existingEquipamiento = await this.equipamientoRepository.findById(id);
    if (!existingEquipamiento) {
      throw new NotFoundError(`Equipamiento con ID ${id} no encontrado`);
    }

    if (existingEquipamiento.activo) {
      throw new ValidationError(`El equipamiento ${existingEquipamiento.nombre} ya está activo`);
    }

    const reactivatedEquipamiento = await this.equipamientoRepository.update(id, { activo: true });

    logger.info(`Equipamiento reactivado: ${reactivatedEquipamiento.nombre} (ID: ${id})`);

    return reactivatedEquipamiento;
  }

  async getEquipamientoStats(id: number): Promise<any> {
    const equipamiento = await this.equipamientoRepository.findById(id);
    if (!equipamiento) {
      throw new NotFoundError(`Equipamiento con ID ${id} no encontrado`);
    }

    const aulas_equipamientos = (equipamiento as any).aulas_equipamientos || [];
    const totalAulas = aulas_equipamientos.length;
    const totalCantidad = aulas_equipamientos.reduce((sum: number, ae: any) => sum + ae.cantidad, 0);

    const aulasList = aulas_equipamientos.map((ae: any) => ({
      aulaId: ae.aula.id,
      aulaNombre: ae.aula.nombre,
      cantidad: ae.cantidad,
      observaciones: ae.observaciones
    }));

    return {
      equipamiento: {
        id: equipamiento.id,
        nombre: equipamiento.nombre,
        descripcion: equipamiento.descripcion,
        activo: equipamiento.activo
      },
      totalAulas,
      totalCantidad,
      aulas: aulasList
    };
  }
}
