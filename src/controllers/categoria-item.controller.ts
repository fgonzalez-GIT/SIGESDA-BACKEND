import { Request, Response, NextFunction } from 'express';
import { CategoriaItemService } from '@/services/categoria-item.service';
import {
  createCategoriaItemSchema,
  updateCategoriaItemSchema,
  reorderCategoriasSchema
} from '@/dto/item-cuota.dto';
import { ApiResponse } from '@/types/interfaces';
import { HttpStatus } from '@/types/enums';

/**
 * Controller para gestión de Categorías de Ítems de Cuota
 * Catálogo 100% CRUD editable desde UI de admin
 */
export class CategoriaItemController {
  constructor(private service: CategoriaItemService) {}

  /**
   * GET /api/catalogos/categorias-items
   * Obtener todas las categorías (activas o todas)
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const categorias = await this.service.getAll(includeInactive);

      const response: ApiResponse = {
        success: true,
        data: categorias,
        meta: {
          total: categorias.length,
          includeInactive
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/catalogos/categorias-items/:id
   * Obtener categoría por ID
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const categoria = await this.service.getById(parseInt(id));

      const response: ApiResponse = {
        success: true,
        data: categoria
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/catalogos/categorias-items/codigo/:codigo
   * Obtener categoría por código
   */
  async getByCodigo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { codigo } = req.params;
      const categoria = await this.service.getByCodigo(codigo);

      const response: ApiResponse = {
        success: true,
        data: categoria
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/catalogos/categorias-items/resumen
   * Obtener resumen de categorías con contadores
   */
  async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await this.service.getSummary();

      const response: ApiResponse = {
        success: true,
        data: summary
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/catalogos/categorias-items/:id/estadisticas
   * Obtener estadísticas de uso de una categoría
   */
  async getUsageStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const stats = await this.service.getUsageStats(parseInt(id));

      const response: ApiResponse = {
        success: true,
        data: stats
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/catalogos/categorias-items
   * Crear nueva categoría
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createCategoriaItemSchema.parse(req.body);
      const categoria = await this.service.create(validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Categoría de ítem creada exitosamente',
        data: categoria
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/catalogos/categorias-items/:id
   * Actualizar categoría existente
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateCategoriaItemSchema.parse(req.body);
      const categoria = await this.service.update(parseInt(id), validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Categoría de ítem actualizada exitosamente',
        data: categoria
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/catalogos/categorias-items/:id/desactivar
   * Desactivar categoría (soft delete)
   */
  async deactivate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const categoria = await this.service.deactivate(parseInt(id));

      const response: ApiResponse = {
        success: true,
        message: 'Categoría de ítem desactivada exitosamente',
        data: categoria
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/catalogos/categorias-items/:id/activar
   * Activar categoría
   */
  async activate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const categoria = await this.service.activate(parseInt(id));

      const response: ApiResponse = {
        success: true,
        message: 'Categoría de ítem activada exitosamente',
        data: categoria
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/catalogos/categorias-items/:id
   * Eliminar categoría físicamente
   * Solo si no tiene tipos de ítems asociados
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.service.delete(parseInt(id));

      const response: ApiResponse = {
        success: true,
        message: 'Categoría de ítem eliminada exitosamente'
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/catalogos/categorias-items/reordenar
   * Reordenar categorías
   */
  async reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = reorderCategoriasSchema.parse(req.body);
      const result = await this.service.reorder(validatedData.ordenamiento);

      const response: ApiResponse = {
        success: true,
        message: `${result.updated} categorías reordenadas exitosamente`,
        data: result
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}
