import { Request, Response, NextFunction } from 'express';
import { PersonaService } from '@/services/persona.service';
import { createPersonaSchema, updatePersonaSchema, personaQuerySchema } from '@/dto/persona.dto';
import { ApiResponse } from '@/types/interfaces';
import { HttpStatus } from '@/types/enums';
import { logger } from '@/utils/logger';

export class PersonaController {
  constructor(private personaService: PersonaService) {}

  async createPersona(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createPersonaSchema.parse(req.body);
      const persona = await this.personaService.createPersona(validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Persona creada exitosamente',
        data: persona
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getPersonas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = personaQuerySchema.parse(req.query);
      const result = await this.personaService.getPersonas(query);

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

  async getPersonaById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const persona = await this.personaService.getPersonaById(parseInt(id));

      if (!persona) {
        const response: ApiResponse = {
          success: false,
          error: 'Persona no encontrada'
        };
        res.status(HttpStatus.NOT_FOUND).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: persona
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updatePersona(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updatePersonaSchema.parse(req.body);
      const persona = await this.personaService.updatePersona(parseInt(id), validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Persona actualizada exitosamente',
        data: persona
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deletePersona(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { hard, motivo } = req.query;
      const isHardDelete = hard === 'true';

      const persona = await this.personaService.deletePersona(parseInt(id), isHardDelete, motivo as string);

      const response: ApiResponse = {
        success: true,
        message: `Persona ${isHardDelete ? 'eliminada permanentemente' : 'dada de baja'}`,
        data: persona
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getSocios(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { categoria, activos } = req.query;
      const isActivos = activos !== 'false';

      const socios = await this.personaService.getSocios(categoria as string, isActivos);

      const response: ApiResponse = {
        success: true,
        data: socios
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getDocentes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const docentes = await this.personaService.getDocentes();

      const response: ApiResponse = {
        success: true,
        data: docentes
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getProveedores(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const proveedores = await this.personaService.getProveedores();

      const response: ApiResponse = {
        success: true,
        data: proveedores
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async searchPersonas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q: searchTerm, tipo } = req.query;

      if (!searchTerm || typeof searchTerm !== 'string') {
        const response: ApiResponse = {
          success: false,
          error: 'Parámetro de búsqueda "q" es requerido'
        };
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }

      const personas = await this.personaService.searchPersonas(searchTerm, tipo as any);

      const response: ApiResponse = {
        success: true,
        data: personas
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async checkDni(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dni } = req.params;

      // Validate DNI format
      if (!/^\d{7,8}$/.test(dni)) {
        const response: ApiResponse = {
          success: false,
          error: 'DNI inválido',
          message: 'El DNI debe contener entre 7 y 8 dígitos numéricos'
        };
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }

      const result = await this.personaService.checkDniExists(dni);

      const response: ApiResponse = {
        success: true,
        data: result
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async reactivatePersona(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updatePersonaSchema.parse(req.body);

      const persona = await this.personaService.reactivatePersona(parseInt(id), validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Persona reactivada exitosamente',
        data: persona
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene el catálogo de tipos de persona
   * GET /api/personas/catalogos/tipos-persona
   */
  async getTiposPersona(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tiposPersona = await this.personaService.getTiposPersona();

      const response: ApiResponse = {
        success: true,
        data: tiposPersona
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}