import { Equipamiento } from '@prisma/client';
import { EquipamientoRepository } from '@/repositories/equipamiento.repository';
import { CreateEquipamientoDto, UpdateEquipamientoDto, EquipamientoQueryDto } from '@/dto/equipamiento.dto';
import { logger } from '@/utils/logger';
import { ConflictError, NotFoundError, ValidationError } from '@/utils/errors';
import { prisma } from '@/config/database';

export class EquipamientoService {
  constructor(private equipamientoRepository: EquipamientoRepository) {}

  /**
   * Generar código automático para equipamiento
   * Patrón: CATEGORIA-XXX (ej: INST-001, MOB-001)
   */
  private async generateCodigoEquipamiento(categoriaEquipamientoId: number): Promise<string> {
    // Obtener la categoría para usar su código como prefijo
    const categoria = await prisma.categoriasEquipamiento.findUnique({
      where: { id: categoriaEquipamientoId }
    });

    if (!categoria) {
      throw new ValidationError(`Categoría de equipamiento con ID ${categoriaEquipamientoId} no encontrada`);
    }

    // Usar las primeras 4 letras del código de la categoría como prefijo
    const prefix = categoria.codigo.substring(0, 4).toUpperCase();

    // Obtener el último código con este prefijo
    const maxCodigo = await this.equipamientoRepository.findMaxCodigoByCategoriaPrefix(prefix);

    let nextNumber = 1;
    if (maxCodigo) {
      // Extraer el número del código (ej: "INST-005" → 5)
      const match = maxCodigo.match(/\d+$/);
      if (match) {
        nextNumber = parseInt(match[0]) + 1;
      }
    }

    // Generar código con padding de 3 dígitos (ej: INST-001, INST-002)
    return `${prefix}-${String(nextNumber).padStart(3, '0')}`;
  }

  async createEquipamiento(data: CreateEquipamientoDto): Promise<Equipamiento> {
    // 1. Validar que la categoría existe y está activa
    const categoria = await prisma.categoriasEquipamiento.findUnique({
      where: { id: data.categoriaEquipamientoId }
    });

    if (!categoria) {
      throw new NotFoundError(`Categoría de equipamiento con ID ${data.categoriaEquipamientoId} no encontrada`);
    }

    if (!categoria.activo) {
      throw new ValidationError(`La categoría "${categoria.nombre}" está inactiva`);
    }

    // 2. Validar estado si se proporciona
    if (data.estadoEquipamientoId) {
      const estado = await prisma.estadoEquipamiento.findUnique({
        where: { id: data.estadoEquipamientoId }
      });

      if (!estado) {
        throw new NotFoundError(`Estado de equipamiento con ID ${data.estadoEquipamientoId} no encontrado`);
      }

      if (!estado.activo) {
        throw new ValidationError(`El estado "${estado.nombre}" está inactivo`);
      }
    }

    // 3. Validar que la cantidad sea positiva
    if (data.cantidad !== undefined && data.cantidad < 1) {
      throw new ValidationError('La cantidad debe ser al menos 1');
    }

    // 4. Validar que el nombre sea único
    const existingNombre = await this.equipamientoRepository.findByNombre(data.nombre);
    if (existingNombre) {
      throw new ConflictError(`Ya existe un equipamiento con el nombre ${data.nombre}`);
    }

    // 5. Autogenerar código si no se proporciona
    if (!data.codigo) {
      data.codigo = await this.generateCodigoEquipamiento(data.categoriaEquipamientoId);
    } else {
      // Validar que el código proporcionado sea único
      const existingCodigo = await this.equipamientoRepository.findByCodigo(data.codigo);
      if (existingCodigo) {
        throw new ConflictError(`Ya existe un equipamiento con el código ${data.codigo}`);
      }
    }

    // 6. Crear el equipamiento
    const equipamiento = await this.equipamientoRepository.create(data);

    logger.info(`Equipamiento creado: ${equipamiento.codigo} - ${equipamiento.nombre} (ID: ${equipamiento.id}), Cantidad: ${equipamiento.cantidad}`);

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
    // 1. Verificar que el equipamiento existe
    const existingEquipamiento = await this.equipamientoRepository.findById(id);
    if (!existingEquipamiento) {
      throw new NotFoundError(`Equipamiento con ID ${id} no encontrado`);
    }

    // 2. Validar que NO se intenta modificar el código (doble verificación, aunque el DTO ya lo valida)
    if ('codigo' in data) {
      throw new ValidationError('El código no se puede modificar');
    }

    // 3. Validar nombre único si se está actualizando
    if (data.nombre && data.nombre !== existingEquipamiento.nombre) {
      const equipamientoWithSameName = await this.equipamientoRepository.findByNombre(data.nombre);
      if (equipamientoWithSameName) {
        throw new ConflictError(`Ya existe un equipamiento con el nombre ${data.nombre}`);
      }
    }

    // 4. Validar categoría si se está cambiando
    if (data.categoriaEquipamientoId && data.categoriaEquipamientoId !== (existingEquipamiento as any).categoriaEquipamientoId) {
      const categoria = await prisma.categoriasEquipamiento.findUnique({
        where: { id: data.categoriaEquipamientoId }
      });

      if (!categoria) {
        throw new NotFoundError(`Categoría de equipamiento con ID ${data.categoriaEquipamientoId} no encontrada`);
      }

      if (!categoria.activo) {
        throw new ValidationError(`La categoría "${categoria.nombre}" está inactiva`);
      }
    }

    // 5. Validar estado si se está cambiando
    if (data.estadoEquipamientoId && data.estadoEquipamientoId !== (existingEquipamiento as any).estadoEquipamientoId) {
      const estado = await prisma.estadoEquipamiento.findUnique({
        where: { id: data.estadoEquipamientoId }
      });

      if (!estado) {
        throw new NotFoundError(`Estado de equipamiento con ID ${data.estadoEquipamientoId} no encontrado`);
      }

      if (!estado.activo) {
        throw new ValidationError(`El estado "${estado.nombre}" está inactivo`);
      }
    }

    // 6. Validar cantidad si se está cambiando
    if (data.cantidad !== undefined && data.cantidad !== existingEquipamiento.cantidad) {
      if (data.cantidad < 0) {
        throw new ValidationError('La cantidad no puede ser negativa');
      }

      // Advertir si la nueva cantidad genera déficit de inventario
      const cantidadAsignada = await this.equipamientoRepository.getCantidadAsignada(id);
      if (data.cantidad < cantidadAsignada) {
        const deficit = cantidadAsignada - data.cantidad;
        logger.warn(
          `⚠️  Cantidad de equipamiento "${existingEquipamiento.nombre}" (ID: ${id}) reducida. ` +
          `Déficit de inventario: ${deficit} unidades. ` +
          `(Asignadas: ${cantidadAsignada}, Nueva cantidad: ${data.cantidad})`
        );
      }
    }

    // 7. Actualizar el equipamiento
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

  /**
   * Obtiene información de disponibilidad de un equipamiento
   */
  async getDisponibilidadEquipamiento(id: number): Promise<any> {
    const equipamiento = await this.equipamientoRepository.findByIdWithDisponibilidad(id);
    if (!equipamiento) {
      throw new NotFoundError(`Equipamiento con ID ${id} no encontrado`);
    }

    return equipamiento;
  }

  /**
   * Obtiene la cantidad disponible de un equipamiento
   */
  async getCantidadDisponible(id: number): Promise<number> {
    const equipamiento = await this.equipamientoRepository.findById(id);
    if (!equipamiento) {
      throw new NotFoundError(`Equipamiento con ID ${id} no encontrado`);
    }

    return this.equipamientoRepository.getCantidadDisponible(id);
  }
}
