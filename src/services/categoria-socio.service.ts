import { CategoriaSocio } from '@prisma/client';
import { CategoriaSocioRepository } from '@/repositories/categoria-socio.repository';
import {
  CreateCategoriaSocioDto,
  UpdateCategoriaSocioDto,
  CategoriaSocioQueryDto
} from '@/dto/categoria-socio.dto';
import { logger } from '@/utils/logger';

export class CategoriaSocioService {
  constructor(
    private categoriaSocioRepository: CategoriaSocioRepository
  ) {}

  async getCategorias(query?: CategoriaSocioQueryDto): Promise<CategoriaSocio[]> {
    return this.categoriaSocioRepository.findAll(query);
  }

  async getCategoriaById(id: string): Promise<CategoriaSocio> {
    const categoria = await this.categoriaSocioRepository.findById(id);

    if (!categoria) {
      throw new Error(`Categoría con ID ${id} no encontrada`);
    }

    return categoria;
  }

  async getCategoriaByCodigo(codigo: string): Promise<CategoriaSocio> {
    const categoria = await this.categoriaSocioRepository.findByCodigo(codigo);

    if (!categoria) {
      throw new Error(`Categoría con código ${codigo} no encontrada`);
    }

    return categoria;
  }

  async createCategoria(data: CreateCategoriaSocioDto): Promise<CategoriaSocio> {
    // Validar que el código no exista
    const existingCodigo = await this.categoriaSocioRepository.findByCodigo(data.codigo);

    if (existingCodigo) {
      throw new Error(`Ya existe una categoría con el código ${data.codigo}`);
    }

    const categoria = await this.categoriaSocioRepository.create(data);

    logger.info(`Categoría creada: ${categoria.nombre} (${categoria.codigo}) - ID: ${categoria.id}`);

    return categoria;
  }

  async updateCategoria(id: string, data: UpdateCategoriaSocioDto): Promise<CategoriaSocio> {
    // Verificar que la categoría existe
    await this.getCategoriaById(id);

    // Si se cambia el código, validar que no exista
    if (data.codigo) {
      const existing = await this.categoriaSocioRepository.findByCodigo(data.codigo);

      if (existing && existing.id !== id) {
        throw new Error(`Ya existe una categoría con el código ${data.codigo}`);
      }
    }

    const updatedCategoria = await this.categoriaSocioRepository.update(id, data);

    logger.info(`Categoría actualizada: ${updatedCategoria.nombre} (${updatedCategoria.codigo}) - ID: ${id}`);

    return updatedCategoria;
  }

  async deleteCategoria(id: string): Promise<void> {
    // Verificar que la categoría existe
    const categoria = await this.getCategoriaById(id);

    // El repository ya valida que no tenga socios o cuotas asociadas
    await this.categoriaSocioRepository.delete(id);

    logger.info(`Categoría eliminada: ${categoria.nombre} (${categoria.codigo}) - ID: ${id}`);
  }

  async getStats(id: string): Promise<{
    categoria: CategoriaSocio;
    stats: {
      totalPersonas: number;
      totalCuotas: number;
      totalRecaudado: number;
    };
  }> {
    const categoria = await this.getCategoriaById(id);
    const stats = await this.categoriaSocioRepository.getStats(id);

    return {
      categoria,
      stats
    };
  }

  async toggleActive(id: string): Promise<CategoriaSocio> {
    const categoria = await this.getCategoriaById(id);

    return this.categoriaSocioRepository.update(id, {
      activa: !categoria.activa
    });
  }

  async reorder(categoriaIds: string[]): Promise<void> {
    // Actualizar el orden de cada categoría según su posición en el array
    const updatePromises = categoriaIds.map((id, index) =>
      this.categoriaSocioRepository.update(id, { orden: index + 1 })
    );

    await Promise.all(updatePromises);

    logger.info(`Orden de categorías actualizado: ${categoriaIds.length} categorías reordenadas`);
  }
}
