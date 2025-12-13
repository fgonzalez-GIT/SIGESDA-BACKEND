import { Request, Response, NextFunction } from 'express';
import { TipoItemCuotaService } from '@/services/tipo-item-cuota.service';
import {
  createTipoItemCuotaSchema,
  updateTipoItemCuotaSchema,
  updateFormulaSchema,
  cloneTipoItemSchema,
  reorderTiposItemSchema
} from '@/dto/item-cuota.dto';
import { ApiResponse } from '@/types/interfaces';
import { HttpStatus } from '@/types/enums';

/**
 * Controller para gestión de Tipos de Ítems de Cuota
 * Catálogo 100% CRUD editable desde UI de admin
 */
export class TipoItemCuotaController {
  constructor(private service: TipoItemCuotaService) {}

  /**
   * GET /api/catalogos/tipos-items-cuota
   * Obtener todos los tipos de ítems (activos o todos)
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const categoriaItemId = req.query.categoriaItemId
        ? parseInt(req.query.categoriaItemId as string)
        : undefined;

      const tipos = await this.service.getAll({
        includeInactive,
        categoriaItemId
      });

      const response: ApiResponse = {
        success: true,
        data: tipos,
        meta: {
          total: tipos.length,
          includeInactive,
          categoriaItemId
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/catalogos/tipos-items-cuota/:id
   * Obtener tipo de ítem por ID
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tipo = await this.service.getById(parseInt(id));

      const response: ApiResponse = {
        success: true,
        data: tipo
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/catalogos/tipos-items-cuota/codigo/:codigo
   * Obtener tipo de ítem por código
   */
  async getByCodigo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { codigo } = req.params;
      const tipo = await this.service.getByCodigo(codigo);

      const response: ApiResponse = {
        success: true,
        data: tipo
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/catalogos/tipos-items-cuota/categoria/:categoriaCodigo
   * Obtener tipos de ítems por código de categoría
   */
  async getByCategoriaCodigo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { categoriaCodigo } = req.params;
      const includeInactive = req.query.includeInactive === 'true';

      const tipos = await this.service.getByCategoriaCodigo(categoriaCodigo, includeInactive);

      const response: ApiResponse = {
        success: true,
        data: tipos,
        meta: {
          categoriaCodigo,
          total: tipos.length
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/catalogos/tipos-items-cuota/calculados
   * Obtener tipos de ítems calculados (automáticos)
   */
  async getCalculados(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const tipos = await this.service.getCalculados(includeInactive);

      const response: ApiResponse = {
        success: true,
        data: tipos,
        meta: {
          total: tipos.length,
          tipo: 'calculados'
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/catalogos/tipos-items-cuota/manuales
   * Obtener tipos de ítems manuales
   */
  async getManuales(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const tipos = await this.service.getManuales(includeInactive);

      const response: ApiResponse = {
        success: true,
        data: tipos,
        meta: {
          total: tipos.length,
          tipo: 'manuales'
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/catalogos/tipos-items-cuota/resumen-por-categoria
   * Obtener resumen agrupado por categoría
   */
  async getSummaryByCategoria(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await this.service.getSummaryByCategoria();

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
   * GET /api/catalogos/tipos-items-cuota/:id/estadisticas
   * Obtener estadísticas de uso de un tipo de ítem
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
   * POST /api/catalogos/tipos-items-cuota
   * Crear nuevo tipo de ítem
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createTipoItemCuotaSchema.parse(req.body);
      const tipo = await this.service.create(validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Tipo de ítem creado exitosamente',
        data: tipo
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/catalogos/tipos-items-cuota/:id
   * Actualizar tipo de ítem existente
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateTipoItemCuotaSchema.parse(req.body);
      const tipo = await this.service.update(parseInt(id), validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Tipo de ítem actualizado exitosamente',
        data: tipo
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/catalogos/tipos-items-cuota/:id/formula
   * Actualizar solo la fórmula de cálculo
   */
  async updateFormula(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateFormulaSchema.parse(req.body);
      const tipo = await this.service.updateFormula(parseInt(id), validatedData.formula);

      const response: ApiResponse = {
        success: true,
        message: 'Fórmula actualizada exitosamente',
        data: tipo
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/catalogos/tipos-items-cuota/:id/desactivar
   * Desactivar tipo de ítem (soft delete)
   */
  async deactivate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tipo = await this.service.deactivate(parseInt(id));

      const response: ApiResponse = {
        success: true,
        message: 'Tipo de ítem desactivado exitosamente',
        data: tipo
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/catalogos/tipos-items-cuota/:id/activar
   * Activar tipo de ítem
   */
  async activate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tipo = await this.service.activate(parseInt(id));

      const response: ApiResponse = {
        success: true,
        message: 'Tipo de ítem activado exitosamente',
        data: tipo
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/catalogos/tipos-items-cuota/:id
   * Eliminar tipo de ítem físicamente
   * Solo si no tiene ítems de cuota asociados
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.service.delete(parseInt(id));

      const response: ApiResponse = {
        success: true,
        message: 'Tipo de ítem eliminado exitosamente'
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/catalogos/tipos-items-cuota/:id/clonar
   * Clonar tipo de ítem
   */
  async clone(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = cloneTipoItemSchema.parse(req.body);
      const tipo = await this.service.clone(
        parseInt(id),
        validatedData.nuevoCodigo,
        validatedData.nuevoNombre
      );

      const response: ApiResponse = {
        success: true,
        message: 'Tipo de ítem clonado exitosamente',
        data: tipo
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/catalogos/tipos-items-cuota/reordenar
   * Reordenar tipos de ítems
   */
  async reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = reorderTiposItemSchema.parse(req.body);
      const result = await this.service.reorder(validatedData.ordenamiento);

      const response: ApiResponse = {
        success: true,
        message: `${result.updated} tipos de ítem reordenados exitosamente`,
        data: result
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}
