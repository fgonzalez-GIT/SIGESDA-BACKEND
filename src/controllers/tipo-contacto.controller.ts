/**
 * Controller para gestión del catálogo de tipos de contacto
 * Endpoints de administración para TipoContactoCatalogo
 */

import { Request, Response, NextFunction } from 'express';
import { TipoContactoService } from '@/services/tipo-contacto.service';
import {
  createTipoContactoSchema,
  updateTipoContactoSchema,
  getTiposContactoSchema
} from '@/dto/contacto.dto';
import { ApiResponse } from '@/types/interfaces';
import { HttpStatus } from '@/types/enums';
import { logger } from '@/utils/logger';

/**
 * Controller para gestión de tipos de contacto (catálogo)
 */
export class TipoContactoController {
  constructor(private tipoContactoService: TipoContactoService) {}

  /**
   * POST /api/catalogos/tipos-contacto
   * Crear tipo de contacto
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createTipoContactoSchema.parse(req.body);
      const tipo = await this.tipoContactoService.create(validatedData);

      const response: ApiResponse = {
        success: true,
        message: `Tipo de contacto '${tipo.nombre}' creado exitosamente`,
        data: tipo
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/catalogos/tipos-contacto
   * Obtener todos los tipos de contacto
   * Query params:
   * - soloActivos: boolean (default: true)
   * - ordenarPor: 'orden' | 'nombre' | 'codigo' (default: 'orden')
   */
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = getTiposContactoSchema.parse(req.query);
      const tipos = await this.tipoContactoService.findAll(params);

      const response: ApiResponse = {
        success: true,
        data: tipos,
        meta: {
          total: tipos.length
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/catalogos/tipos-contacto/:id
   * Obtener tipo de contacto por ID
   */
  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tipo = await this.tipoContactoService.findById(parseInt(id));

      if (!tipo) {
        const response: ApiResponse = {
          success: false,
          error: 'Tipo de contacto no encontrado'
        };
        res.status(HttpStatus.NOT_FOUND).json(response);
        return;
      }

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
   * PUT /api/catalogos/tipos-contacto/:id
   * Actualizar tipo de contacto
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateTipoContactoSchema.parse(req.body);

      const tipo = await this.tipoContactoService.update(parseInt(id), validatedData);

      const response: ApiResponse = {
        success: true,
        message: `Tipo de contacto '${tipo.nombre}' actualizado exitosamente`,
        data: tipo
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/catalogos/tipos-contacto/:id
   * Eliminar tipo de contacto (hard delete)
   * Solo si no tiene contactos asociados
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tipo = await this.tipoContactoService.delete(parseInt(id));

      const response: ApiResponse = {
        success: true,
        message: `Tipo de contacto '${tipo.nombre}' eliminado permanentemente`
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/catalogos/tipos-contacto/:id/desactivar
   * Desactivar tipo de contacto (soft delete)
   */
  async deactivate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tipo = await this.tipoContactoService.deactivate(parseInt(id));

      const response: ApiResponse = {
        success: true,
        message: `Tipo de contacto '${tipo.nombre}' desactivado exitosamente`,
        data: tipo
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/catalogos/tipos-contacto/:id/activar
   * Activar tipo de contacto
   */
  async activate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tipo = await this.tipoContactoService.activate(parseInt(id));

      const response: ApiResponse = {
        success: true,
        message: `Tipo de contacto '${tipo.nombre}' activado exitosamente`,
        data: tipo
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/catalogos/tipos-contacto/estadisticas/uso
   * Obtener estadísticas de uso de tipos de contacto
   */
  async getEstadisticasUso(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const estadisticas = await this.tipoContactoService.getEstadisticasUso();

      const response: ApiResponse = {
        success: true,
        data: estadisticas
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}
