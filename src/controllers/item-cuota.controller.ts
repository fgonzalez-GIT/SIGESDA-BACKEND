import { Request, Response, NextFunction } from 'express';
import { ItemCuotaService } from '@/services/item-cuota.service';
import {
  addManualItemSchema,
  updateItemCuotaSchema,
  regenerarItemsSchema,
  aplicarDescuentoGlobalSchema,
  queryItemsSchema
} from '@/dto/item-cuota.dto';
import { ApiResponse } from '@/types/interfaces';
import { HttpStatus } from '@/types/enums';

/**
 * Controller para gestión de Ítems de Cuota
 * Operaciones sobre ítems individuales que componen una cuota
 */
export class ItemCuotaController {
  constructor(private service: ItemCuotaService) {}

  /**
   * GET /api/cuotas/:cuotaId/items
   * Obtener todos los ítems de una cuota con resumen
   */
  async getItemsByCuotaId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cuotaId } = req.params;
      const result = await this.service.getItemsByCuotaId(parseInt(cuotaId));

      const response: ApiResponse = {
        success: true,
        data: result.items,
        meta: {
          cuotaId: parseInt(cuotaId),
          totalItems: result.items.length,
          summary: result.summary
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/cuotas/:cuotaId/items/desglose
   * Obtener desglose completo de una cuota
   */
  async getDesgloseByCuotaId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cuotaId } = req.params;
      const desglose = await this.service.getDesgloseByCuotaId(parseInt(cuotaId));

      const response: ApiResponse = {
        success: true,
        data: desglose
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/cuotas/:cuotaId/items/segmentados
   * Obtener ítems segmentados (automáticos vs manuales)
   */
  async getItemsSegmentados(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cuotaId } = req.params;
      const result = await this.service.getItemsSegmentadosByCuotaId(parseInt(cuotaId));

      const response: ApiResponse = {
        success: true,
        data: result
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/items-cuota/:id
   * Obtener ítem por ID
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.service.getById(parseInt(id));

      const response: ApiResponse = {
        success: true,
        data: item
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/cuotas/:cuotaId/items
   * Agregar ítem manual a una cuota
   */
  async addManualItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cuotaId } = req.params;
      const validatedData = addManualItemSchema.parse({
        ...req.body,
        cuotaId: parseInt(cuotaId)
      });

      const item = await this.service.addManualItem(validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Ítem agregado exitosamente',
        data: item
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/items-cuota/:id
   * Actualizar ítem editable
   */
  async updateItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateItemCuotaSchema.parse(req.body);
      const item = await this.service.updateItem(parseInt(id), validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Ítem actualizado exitosamente',
        data: item
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/items-cuota/:id
   * Eliminar ítem editable
   */
  async deleteItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.service.deleteItem(parseInt(id));

      const response: ApiResponse = {
        success: true,
        message: result.message
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/cuotas/:cuotaId/items/regenerar
   * Regenerar todos los ítems de una cuota
   */
  async regenerarItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cuotaId } = req.params;
      const validatedData = regenerarItemsSchema.parse(req.body);
      const result = await this.service.regenerarItems(parseInt(cuotaId), validatedData.items);

      const response: ApiResponse = {
        success: true,
        message: `${result.itemsCreados} ítems regenerados exitosamente`,
        data: result
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/items-cuota/:id/duplicar
   * Duplicar ítem (crear copia editable)
   */
  async duplicarItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.service.duplicarItem(parseInt(id));

      const response: ApiResponse = {
        success: true,
        message: 'Ítem duplicado exitosamente',
        data: item
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/cuotas/:cuotaId/items/descuento-global
   * Aplicar descuento porcentual global a la cuota
   */
  async aplicarDescuentoGlobal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cuotaId } = req.params;
      const validatedData = aplicarDescuentoGlobalSchema.parse(req.body);
      const item = await this.service.aplicarDescuentoGlobal(
        parseInt(cuotaId),
        validatedData.porcentaje,
        validatedData.concepto
      );

      const response: ApiResponse = {
        success: true,
        message: `Descuento del ${validatedData.porcentaje}% aplicado exitosamente`,
        data: item
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/items-cuota/estadisticas
   * Obtener estadísticas globales de ítems
   */
  async getGlobalStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await this.service.getGlobalStats();

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
   * GET /api/items-cuota/tipo/:codigo
   * Buscar ítems por tipo (código de tipo)
   */
  async findByTipoItemCodigo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { codigo } = req.params;
      const query = queryItemsSchema.parse(req.query);

      const items = await this.service.findByTipoItemCodigo(codigo, {
        limit: query.limit,
        offset: query.offset
      });

      const response: ApiResponse = {
        success: true,
        data: items,
        meta: {
          tipoItemCodigo: codigo,
          total: items.length,
          limit: query.limit,
          offset: query.offset
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/items-cuota/categoria/:codigo
   * Buscar ítems por categoría (código de categoría)
   */
  async findByCategoriaCodigo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { codigo } = req.params;
      const query = queryItemsSchema.parse(req.query);

      const items = await this.service.findByCategoriaCodigo(codigo, {
        limit: query.limit,
        offset: query.offset
      });

      const response: ApiResponse = {
        success: true,
        data: items,
        meta: {
          categoriaCodigo: codigo,
          total: items.length,
          limit: query.limit,
          offset: query.offset
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}
