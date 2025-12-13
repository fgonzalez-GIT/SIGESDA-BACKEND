import { TipoItemCuotaRepository } from '@/repositories/tipo-item-cuota.repository';
import { CategoriaItemRepository } from '@/repositories/categoria-item.repository';
import { AppError } from '@/middleware/error.middleware';

/**
 * Service para gestión de Tipos de Ítems de Cuota
 * Implementa validaciones de negocio y lógica compleja
 */
export class TipoItemCuotaService {
  private repository: TipoItemCuotaRepository;
  private categoriaRepository: CategoriaItemRepository;

  constructor() {
    this.repository = new TipoItemCuotaRepository();
    this.categoriaRepository = new CategoriaItemRepository();
  }

  /**
   * Obtener todos los tipos de ítems
   */
  async getAll(options?: {
    includeInactive?: boolean;
    categoriaItemId?: number;
  }) {
    return await this.repository.findAll(options);
  }

  /**
   * Obtener tipo de ítem por ID
   */
  async getById(id: number) {
    const tipo = await this.repository.findById(id);

    if (!tipo) {
      throw new AppError('Tipo de ítem no encontrado', 404);
    }

    return tipo;
  }

  /**
   * Obtener tipo de ítem por código
   */
  async getByCodigo(codigo: string) {
    const tipo = await this.repository.findByCodigo(codigo);

    if (!tipo) {
      throw new AppError(`Tipo de ítem con código '${codigo}' no encontrado`, 404);
    }

    return tipo;
  }

  /**
   * Obtener tipos de ítems por categoría (código de categoría)
   */
  async getByCategoriaCodigo(categoriaCodigo: string, includeInactive: boolean = false) {
    return await this.repository.findByCategoriaCodigo(categoriaCodigo, { includeInactive });
  }

  /**
   * Obtener tipos de ítems calculados (automáticos)
   */
  async getCalculados(includeInactive: boolean = false) {
    return await this.repository.findCalculados({ includeInactive });
  }

  /**
   * Obtener tipos de ítems manuales
   */
  async getManuales(includeInactive: boolean = false) {
    return await this.repository.findManuales({ includeInactive });
  }

  /**
   * Crear nuevo tipo de ítem
   */
  async create(data: {
    codigo: string;
    nombre: string;
    descripcion?: string;
    categoriaItemId: number;
    esCalculado?: boolean;
    formula?: any;
    orden?: number;
    configurable?: boolean;
  }) {
    // Validar que el código sea único
    const existente = await this.repository.findByCodigo(data.codigo);
    if (existente) {
      throw new AppError(`Ya existe un tipo de ítem con el código '${data.codigo}'`, 400);
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
    if (data.codigo.length < 2 || data.codigo.length > 100) {
      throw new AppError('El código debe tener entre 2 y 100 caracteres', 400);
    }

    if (data.nombre.length < 2 || data.nombre.length > 200) {
      throw new AppError('El nombre debe tener entre 2 y 200 caracteres', 400);
    }

    // Validar que la categoría exista y esté activa
    const categoria = await this.categoriaRepository.findById(data.categoriaItemId);
    if (!categoria) {
      throw new AppError('Categoría de ítem no encontrada', 404);
    }

    if (!categoria.activo) {
      throw new AppError('La categoría de ítem está inactiva', 400);
    }

    // Si es calculado, debe tener fórmula
    if (data.esCalculado && !data.formula) {
      throw new AppError('Los tipos calculados deben tener una fórmula', 400);
    }

    // Si no se especifica orden, usar el siguiente disponible
    if (data.orden === undefined) {
      const tipos = await this.repository.findAll({ includeInactive: true });
      const maxOrden = tipos.reduce((max, tipo) => Math.max(max, tipo.orden), 0);
      data.orden = maxOrden + 1;
    }

    return await this.repository.create({
      codigo: data.codigo,
      nombre: data.nombre,
      descripcion: data.descripcion,
      categoriaItem: {
        connect: { id: data.categoriaItemId }
      },
      esCalculado: data.esCalculado ?? true,
      formula: data.formula,
      activo: true,
      orden: data.orden,
      configurable: data.configurable ?? true
    });
  }

  /**
   * Actualizar tipo de ítem existente
   */
  async update(id: number, data: {
    nombre?: string;
    descripcion?: string;
    categoriaItemId?: number;
    esCalculado?: boolean;
    formula?: any;
    orden?: number;
    configurable?: boolean;
    activo?: boolean;
  }) {
    // Verificar que el tipo existe
    const tipo = await this.repository.findById(id);
    if (!tipo) {
      throw new AppError('Tipo de ítem no encontrado', 404);
    }

    // Validar longitud del nombre si se proporciona
    if (data.nombre && (data.nombre.length < 2 || data.nombre.length > 200)) {
      throw new AppError('El nombre debe tener entre 2 y 200 caracteres', 400);
    }

    // Si se cambia la categoría, validar que exista y esté activa
    if (data.categoriaItemId) {
      const categoria = await this.categoriaRepository.findById(data.categoriaItemId);
      if (!categoria) {
        throw new AppError('Categoría de ítem no encontrada', 404);
      }

      if (!categoria.activo) {
        throw new AppError('La categoría de ítem está inactiva', 400);
      }
    }

    // Si se cambia a calculado, debe tener fórmula
    if (data.esCalculado === true && !data.formula && !tipo.formula) {
      throw new AppError('Los tipos calculados deben tener una fórmula', 400);
    }

    const updateData: any = {
      nombre: data.nombre,
      descripcion: data.descripcion,
      esCalculado: data.esCalculado,
      formula: data.formula,
      orden: data.orden,
      configurable: data.configurable,
      activo: data.activo
    };

    if (data.categoriaItemId) {
      updateData.categoriaItem = {
        connect: { id: data.categoriaItemId }
      };
    }

    return await this.repository.update(id, updateData);
  }

  /**
   * Desactivar tipo de ítem (soft delete)
   */
  async deactivate(id: number) {
    const tipo = await this.repository.findById(id);
    if (!tipo) {
      throw new AppError('Tipo de ítem no encontrado', 404);
    }

    if (!tipo.activo) {
      throw new AppError('El tipo de ítem ya está inactivo', 400);
    }

    // Advertencia si tiene ítems de cuota asociados
    const hasItems = await this.repository.hasItemsCuota(id);
    if (hasItems) {
      console.warn(
        `⚠️  Desactivando tipo '${tipo.nombre}' que tiene ítems de cuota asociados`
      );
    }

    return await this.repository.deactivate(id);
  }

  /**
   * Activar tipo de ítem
   */
  async activate(id: number) {
    const tipo = await this.repository.findById(id);
    if (!tipo) {
      throw new AppError('Tipo de ítem no encontrado', 404);
    }

    if (tipo.activo) {
      throw new AppError('El tipo de ítem ya está activo', 400);
    }

    // Validar que la categoría asociada esté activa
    if (!tipo.categoriaItem.activo) {
      throw new AppError(
        'No se puede activar el tipo porque su categoría está inactiva',
        400
      );
    }

    return await this.repository.activate(id);
  }

  /**
   * Eliminar tipo de ítem físicamente
   * Solo si no tiene ítems de cuota asociados
   */
  async delete(id: number) {
    const tipo = await this.repository.findById(id);
    if (!tipo) {
      throw new AppError('Tipo de ítem no encontrado', 404);
    }

    // Verificar que no tenga ítems de cuota asociados
    const hasItems = await this.repository.hasItemsCuota(id);
    if (hasItems) {
      throw new AppError(
        'No se puede eliminar el tipo porque tiene ítems de cuota asociados. Desactívelo en su lugar.',
        400
      );
    }

    return await this.repository.delete(id);
  }

  /**
   * Obtener estadísticas de uso de un tipo de ítem
   */
  async getUsageStats(id: number) {
    const stats = await this.repository.getUsageStats(id);

    if (!stats) {
      throw new AppError('Tipo de ítem no encontrado', 404);
    }

    return stats;
  }

  /**
   * Actualizar fórmula de cálculo
   */
  async updateFormula(id: number, formula: any) {
    const tipo = await this.repository.findById(id);
    if (!tipo) {
      throw new AppError('Tipo de ítem no encontrado', 404);
    }

    if (!tipo.esCalculado) {
      throw new AppError('No se puede asignar fórmula a un tipo manual', 400);
    }

    // Aquí se podría agregar validación del formato de la fórmula
    // Por ahora solo validamos que sea un objeto
    if (typeof formula !== 'object' || formula === null) {
      throw new AppError('La fórmula debe ser un objeto JSON válido', 400);
    }

    return await this.repository.updateFormula(id, formula);
  }

  /**
   * Reordenar tipos de ítems
   */
  async reorder(ordenamiento: Array<{ id: number; orden: number }>) {
    // Validar que no haya órdenes duplicados
    const ordenes = ordenamiento.map(o => o.orden);
    const ordenesUnicos = new Set(ordenes);
    if (ordenes.length !== ordenesUnicos.size) {
      throw new AppError('Los órdenes deben ser únicos', 400);
    }

    // Actualizar cada tipo
    const updates = ordenamiento.map(({ id, orden }) =>
      this.repository.updateOrden(id, orden)
    );

    await Promise.all(updates);

    return { success: true, updated: ordenamiento.length };
  }

  /**
   * Validar si se puede usar un tipo de ítem
   * (debe estar activo y su categoría también)
   */
  async validateForUse(id: number): Promise<boolean> {
    const tipo = await this.repository.findById(id);

    if (!tipo) {
      throw new AppError('Tipo de ítem no encontrado', 404);
    }

    if (!tipo.activo) {
      throw new AppError('El tipo de ítem está inactivo', 400);
    }

    if (!tipo.categoriaItem.activo) {
      throw new AppError('La categoría del tipo de ítem está inactiva', 400);
    }

    return true;
  }

  /**
   * Obtener resumen agrupado por categoría
   */
  async getSummaryByCategoria() {
    const categorias = await this.categoriaRepository.findAll({ includeInactive: false });

    const summary = await Promise.all(
      categorias.map(async (cat) => {
        const tipos = await this.repository.findAll({
          includeInactive: false,
          categoriaItemId: cat.id
        });

        return {
          categoria: {
            id: cat.id,
            codigo: cat.codigo,
            nombre: cat.nombre,
            icono: cat.icono,
            color: cat.color
          },
          tipos: tipos.map(t => ({
            id: t.id,
            codigo: t.codigo,
            nombre: t.nombre,
            esCalculado: t.esCalculado,
            orden: t.orden
          })),
          totalTipos: tipos.length
        };
      })
    );

    return {
      categorias: summary,
      totalCategorias: summary.length,
      totalTipos: summary.reduce((sum, cat) => sum + cat.totalTipos, 0)
    };
  }

  /**
   * Clonar tipo de ítem
   */
  async clone(id: number, nuevoCodigo: string, nuevoNombre: string) {
    const tipoOriginal = await this.repository.findById(id);
    if (!tipoOriginal) {
      throw new AppError('Tipo de ítem no encontrado', 404);
    }

    // Validar que el nuevo código no exista
    const existente = await this.repository.findByCodigo(nuevoCodigo);
    if (existente) {
      throw new AppError(`Ya existe un tipo de ítem con el código '${nuevoCodigo}'`, 400);
    }

    // Crear clon
    return await this.create({
      codigo: nuevoCodigo,
      nombre: nuevoNombre,
      descripcion: tipoOriginal.descripcion || undefined,
      categoriaItemId: tipoOriginal.categoriaItemId,
      esCalculado: tipoOriginal.esCalculado,
      formula: tipoOriginal.formula,
      configurable: tipoOriginal.configurable
    });
  }
}
