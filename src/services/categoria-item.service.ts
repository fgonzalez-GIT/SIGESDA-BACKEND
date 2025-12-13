import { CategoriaItemRepository } from '@/repositories/categoria-item.repository';
import { AppError } from '@/middleware/error.middleware';
import { Prisma } from '@prisma/client';

/**
 * Service para gestión de Categorías de Ítems de Cuota
 * Implementa validaciones de negocio y lógica compleja
 */
export class CategoriaItemService {
  private repository: CategoriaItemRepository;

  constructor() {
    this.repository = new CategoriaItemRepository();
  }

  /**
   * Obtener todas las categorías
   */
  async getAll(includeInactive: boolean = false) {
    return await this.repository.findAll({ includeInactive });
  }

  /**
   * Obtener categoría por ID
   */
  async getById(id: number) {
    const categoria = await this.repository.findById(id);

    if (!categoria) {
      throw new AppError('Categoría de ítem no encontrada', 404);
    }

    return categoria;
  }

  /**
   * Obtener categoría por código
   */
  async getByCodigo(codigo: string) {
    const categoria = await this.repository.findByCodigo(codigo);

    if (!categoria) {
      throw new AppError(`Categoría de ítem con código '${codigo}' no encontrada`, 404);
    }

    return categoria;
  }

  /**
   * Crear nueva categoría
   */
  async create(data: {
    codigo: string;
    nombre: string;
    descripcion?: string;
    icono?: string;
    color?: string;
    orden?: number;
  }) {
    // Validar que el código sea único
    const existente = await this.repository.findByCodigo(data.codigo);
    if (existente) {
      throw new AppError(`Ya existe una categoría con el código '${data.codigo}'`, 400);
    }

    // Validar formato del código (solo mayúsculas, números y guiones bajos)
    const codigoRegex = /^[A-Z0-9_]+$/;
    if (!codigoRegex.test(data.codigo)) {
      throw new AppError(
        'El código debe contener solo letras mayúsculas, números y guiones bajos',
        400
      );
    }

    // Validar longitud
    if (data.codigo.length < 2 || data.codigo.length > 50) {
      throw new AppError('El código debe tener entre 2 y 50 caracteres', 400);
    }

    if (data.nombre.length < 2 || data.nombre.length > 100) {
      throw new AppError('El nombre debe tener entre 2 y 100 caracteres', 400);
    }

    // Si no se especifica orden, usar el siguiente disponible
    if (data.orden === undefined) {
      const categorias = await this.repository.findAll({ includeInactive: true });
      const maxOrden = categorias.reduce((max, cat) => Math.max(max, cat.orden), 0);
      data.orden = maxOrden + 1;
    }

    return await this.repository.create({
      codigo: data.codigo,
      nombre: data.nombre,
      descripcion: data.descripcion,
      icono: data.icono,
      color: data.color,
      activo: true,
      orden: data.orden
    });
  }

  /**
   * Actualizar categoría existente
   */
  async update(id: number, data: {
    nombre?: string;
    descripcion?: string;
    icono?: string;
    color?: string;
    orden?: number;
    activo?: boolean;
  }) {
    // Verificar que la categoría existe
    const categoria = await this.repository.findById(id);
    if (!categoria) {
      throw new AppError('Categoría de ítem no encontrada', 404);
    }

    // Validar longitud del nombre si se proporciona
    if (data.nombre && (data.nombre.length < 2 || data.nombre.length > 100)) {
      throw new AppError('El nombre debe tener entre 2 y 100 caracteres', 400);
    }

    return await this.repository.update(id, data);
  }

  /**
   * Desactivar categoría (soft delete)
   */
  async deactivate(id: number) {
    const categoria = await this.repository.findById(id);
    if (!categoria) {
      throw new AppError('Categoría de ítem no encontrada', 404);
    }

    if (!categoria.activo) {
      throw new AppError('La categoría ya está inactiva', 400);
    }

    // Advertencia si tiene tipos de ítems activos asociados
    const tiposActivos = categoria.tiposItems.filter(t => t.activo).length;
    if (tiposActivos > 0) {
      // No bloqueamos, pero el cliente debería advertir al usuario
      console.warn(
        `⚠️  Desactivando categoría '${categoria.nombre}' que tiene ${tiposActivos} tipo(s) de ítem activo(s)`
      );
    }

    return await this.repository.softDelete(id);
  }

  /**
   * Activar categoría
   */
  async activate(id: number) {
    const categoria = await this.repository.findById(id);
    if (!categoria) {
      throw new AppError('Categoría de ítem no encontrada', 404);
    }

    if (categoria.activo) {
      throw new AppError('La categoría ya está activa', 400);
    }

    return await this.repository.update(id, { activo: true });
  }

  /**
   * Eliminar categoría físicamente
   * Solo si no tiene tipos de ítems asociados
   */
  async delete(id: number) {
    const categoria = await this.repository.findById(id);
    if (!categoria) {
      throw new AppError('Categoría de ítem no encontrada', 404);
    }

    // Verificar que no tenga tipos de ítems asociados
    const hasTipos = await this.repository.hasTiposItems(id);
    if (hasTipos) {
      throw new AppError(
        'No se puede eliminar la categoría porque tiene tipos de ítems asociados. Desactívela en su lugar.',
        400
      );
    }

    return await this.repository.delete(id);
  }

  /**
   * Obtener estadísticas de uso de una categoría
   */
  async getUsageStats(id: number) {
    const stats = await this.repository.getUsageStats(id);

    if (!stats) {
      throw new AppError('Categoría de ítem no encontrada', 404);
    }

    return stats;
  }

  /**
   * Reordenar categorías
   */
  async reorder(ordenamiento: Array<{ id: number; orden: number }>) {
    // Validar que no haya órdenes duplicados
    const ordenes = ordenamiento.map(o => o.orden);
    const ordenesUnicos = new Set(ordenes);
    if (ordenes.length !== ordenesUnicos.size) {
      throw new AppError('Los órdenes deben ser únicos', 400);
    }

    // Actualizar cada categoría
    const updates = ordenamiento.map(({ id, orden }) =>
      this.repository.update(id, { orden })
    );

    await Promise.all(updates);

    return { success: true, updated: ordenamiento.length };
  }

  /**
   * Validar si se puede usar una categoría
   * (debe estar activa y existir)
   */
  async validateForUse(id: number): Promise<boolean> {
    const categoria = await this.repository.findById(id);

    if (!categoria) {
      throw new AppError('Categoría de ítem no encontrada', 404);
    }

    if (!categoria.activo) {
      throw new AppError('La categoría de ítem está inactiva', 400);
    }

    return true;
  }

  /**
   * Obtener resumen de todas las categorías con contadores
   */
  async getSummary() {
    const categorias = await this.repository.findAll({ includeInactive: true });

    const summary = await Promise.all(
      categorias.map(async (cat) => {
        const stats = await this.repository.getUsageStats(cat.id);
        return {
          id: cat.id,
          codigo: cat.codigo,
          nombre: cat.nombre,
          icono: cat.icono,
          color: cat.color,
          activo: cat.activo,
          orden: cat.orden,
          totalTipos: stats?.totalTipos || 0,
          tiposActivos: stats?.tiposActivos || 0
        };
      })
    );

    return {
      categorias: summary,
      totalCategorias: categorias.length,
      categoriasActivas: categorias.filter(c => c.activo).length
    };
  }
}
