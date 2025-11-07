// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import { FamiliarService } from '@/services/familiar.service';
import {
  createFamiliarSchema,
  updateFamiliarSchema,
  familiarQuerySchema,
  createBulkFamiliaresSchema,
  deleteBulkFamiliaresSchema,
  familiarSearchSchema
} from '@/dto/familiar.dto';
import { ApiResponse } from '@/types/interfaces';
import { HttpStatus } from '@/types/enums';
import { logger } from '@/utils/logger';

export class FamiliarController {
  constructor(private familiarService: FamiliarService) {}

  async createFamiliar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createFamiliarSchema.parse(req.body);
      const familiar = await this.familiarService.createFamiliar(validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Relación familiar creada exitosamente',
        data: familiar
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getFamiliares(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = familiarQuerySchema.parse(req.query);
      const result = await this.familiarService.getFamiliares(query);

      const response: ApiResponse = {
        success: true,
        data: result.data,
        meta: {
          page: query.page,
          limit: query.limit,
          total: result.total,
          totalPages: result.pages
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getFamiliarById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const familiar = await this.familiarService.getFamiliarById(parseInt(id));

      if (!familiar) {
        const response: ApiResponse = {
          success: false,
          error: 'Relación familiar no encontrada'
        };
        res.status(HttpStatus.NOT_FOUND).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: familiar
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getFamiliarsBySocio(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { socioId } = req.params;
      const { includeInactivos } = req.query;
      const includeInactivosFlag = includeInactivos === 'true';

      const familiares = await this.familiarService.getFamiliarsBySocio(parseInt(socioId), includeInactivosFlag);

      const response: ApiResponse = {
        success: true,
        data: familiares,
        meta: {
          socioId,
          includeInactivos: includeInactivosFlag,
          total: familiares.length
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateFamiliar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateFamiliarSchema.parse(req.body);
      const familiar = await this.familiarService.updateFamiliar(parseInt(id), validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Relación familiar actualizada exitosamente',
        data: familiar
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteFamiliar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const familiar = await this.familiarService.deleteFamiliar(parseInt(id));

      const response: ApiResponse = {
        success: true,
        message: 'Relación familiar eliminada exitosamente',
        data: familiar
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async createBulkFamiliares(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createBulkFamiliaresSchema.parse(req.body);
      const result = await this.familiarService.createBulkFamiliares(validatedData);

      const response: ApiResponse = {
        success: true,
        message: `Creación masiva completada: ${result.count} relaciones creadas`,
        data: {
          created: result.count,
          errors: result.errors
        },
        meta: {
          totalAttempted: validatedData.familiares.length,
          successful: result.count,
          failed: result.errors.length
        }
      };

      // Return 207 Multi-Status if there were partial errors
      const statusCode = result.errors.length > 0 ? 207 : HttpStatus.CREATED;
      res.status(statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteBulkFamiliares(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = deleteBulkFamiliaresSchema.parse(req.body);
      const result = await this.familiarService.deleteBulkFamiliares(validatedData);

      const response: ApiResponse = {
        success: true,
        message: `${result.count} relaciones familiares eliminadas`,
        data: result
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async searchFamiliares(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const searchData = familiarSearchSchema.parse(req.query);
      const familiares = await this.familiarService.searchFamiliares(searchData);

      const response: ApiResponse = {
        success: true,
        data: familiares,
        meta: {
          searchTerm: searchData.search,
          searchBy: searchData.searchBy,
          total: familiares.length
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getParentescoStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await this.familiarService.getParentescoStats();

      const response: ApiResponse = {
        success: true,
        data: stats,
        meta: {
          totalTypes: stats.length,
          totalRelations: stats.reduce((sum, stat) => sum + stat.count, 0)
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getFamilyTree(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { socioId } = req.params;
      const familyTree = await this.familiarService.getFamilyTree(parseInt(socioId));

      const response: ApiResponse = {
        success: true,
        data: familyTree
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getTiposParentesco(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tipos = await this.familiarService.getTiposParentesco();

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

  // Endpoint para verificar si existe una relación
  async checkRelationExists(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { socioId, familiarId } = req.params;

      const existing = await this.familiarService.getFamiliares({
        socioId: parseInt(socioId),
        familiarId: parseInt(familiarId),
        page: 1,
        limit: 1,
        includeInactivos: false,
        soloActivos: true
      });

      const exists = existing.total > 0;

      const response: ApiResponse = {
        success: true,
        data: {
          exists,
          relation: exists ? existing.data[0] : null
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Endpoint para obtener familiares disponibles (socios que no son familiares del socio dado)
  async getAvailableFamiliares(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { socioId } = req.params;

      // Get all familiares of the socio
      const existingFamiliares = await this.familiarService.getFamiliarsBySocio(parseInt(socioId), false);
      const familiarIds = existingFamiliares.map(f => f.familiarId);

      // This would require a method in PersonaService to get socios excluding certain IDs
      // For now, we'll return a simple response
      const response: ApiResponse = {
        success: true,
        message: 'Para implementar: obtener socios disponibles excluyendo familiares existentes',
        data: {
          socioId,
          excludeIds: [...familiarIds, socioId] // Exclude self and existing familiares
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}