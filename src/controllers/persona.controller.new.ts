import { Request, Response, NextFunction } from 'express';
import { PersonaService } from '@/services/persona.service.new';
import { createPersonaSchema, updatePersonaSchema, personaQuerySchema } from '@/dto/persona.dto.new';
import { ApiResponse } from '@/types/interfaces';
import { HttpStatus } from '@/types/enums';
import { logger } from '@/utils/logger';

/**
 * Controller para gestión de Personas (modelo refactorizado)
 * Gestiona endpoints para CRUD de personas base
 */
export class PersonaController {
  constructor(private personaService: PersonaService) {}

  /**
   * POST /api/personas
   * Crear nueva persona
   */
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

  /**
   * GET /api/personas
   * Obtener lista de personas con filtros
   */
  async getPersonas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = personaQuerySchema.parse(req.query);
      const result = await this.personaService.getPersonas(query);

      const response: ApiResponse = {
        success: true,
        data: result.data,
        meta: {
          page: result.page,
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

  /**
   * GET /api/personas/:id
   * Obtener persona por ID
   */
  async getPersonaById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { includeRelations } = req.query;

      const persona = await this.personaService.getPersonaById(
        parseInt(id),
        includeRelations !== 'false'
      );

      const response: ApiResponse = {
        success: true,
        data: persona
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/personas/:id
   * Actualizar datos base de persona
   */
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

  /**
   * DELETE /api/personas/:id
   * Eliminar persona (soft o hard delete)
   * Query params: hard=true/false, motivo=string
   */
  async deletePersona(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { hard, motivo } = req.query;
      const isHardDelete = hard === 'true';

      const persona = await this.personaService.deletePersona(
        parseInt(id),
        isHardDelete,
        motivo as string
      );

      const response: ApiResponse = {
        success: true,
        message: isHardDelete
          ? 'Persona eliminada permanentemente'
          : 'Persona desactivada (todos los tipos desasignados)',
        data: persona
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/personas/socios
   * Obtener lista de socios
   */
  async getSocios(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { categoriaId, activos, conNumeroSocio } = req.query;

      const socios = await this.personaService.getSocios({
        categoriaId: categoriaId ? parseInt(categoriaId as string) : undefined,
        activos: activos !== 'false',
        conNumeroSocio: conNumeroSocio === 'true'
      });

      const response: ApiResponse = {
        success: true,
        data: socios
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/personas/docentes
   * Obtener lista de docentes
   */
  async getDocentes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { especialidadId, activos } = req.query;

      const docentes = await this.personaService.getDocentes({
        especialidadId: especialidadId ? parseInt(especialidadId as string) : undefined,
        activos: activos !== 'false'
      });

      const response: ApiResponse = {
        success: true,
        data: docentes
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/personas/proveedores
   * Obtener lista de proveedores
   */
  async getProveedores(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { activos } = req.query;

      const proveedores = await this.personaService.getProveedores(activos !== 'false');

      const response: ApiResponse = {
        success: true,
        data: proveedores
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/personas/search
   * Buscar personas por texto
   * Query params: q (searchTerm), tipo (opcional), limit (opcional)
   */
  async searchPersonas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q: searchTerm, tipo, limit } = req.query;

      if (!searchTerm || typeof searchTerm !== 'string') {
        const response: ApiResponse = {
          success: false,
          error: 'Parámetro de búsqueda "q" es requerido'
        };
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }

      const personas = await this.personaService.searchPersonas(
        searchTerm,
        tipo as string,
        limit ? parseInt(limit as string) : 20
      );

      const response: ApiResponse = {
        success: true,
        data: personas
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/personas/dni/:dni/check
   * Verificar si existe persona con DNI
   */
  async checkDni(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dni } = req.params;

      // Validar formato DNI
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

  /**
   * POST /api/personas/:id/reactivate
   * Reactivar persona inactiva
   */
  async reactivatePersona(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = req.body && Object.keys(req.body).length > 0
        ? updatePersonaSchema.parse(req.body)
        : undefined;

      const persona = await this.personaService.reactivatePersona(
        parseInt(id),
        validatedData
      );

      const response: ApiResponse = {
        success: true,
        message: 'Persona reactivada exitosamente (tipo NO_SOCIO asignado)',
        data: persona
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/personas/:id/estado
   * Obtener estado de persona (activa/inactiva, tipos activos/inactivos)
   */
  async getEstadoPersona(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const estado = await this.personaService.getEstadoPersona(parseInt(id));

      const response: ApiResponse = {
        success: true,
        data: estado
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/personas/:id/tipos/:tipoCodigo/check
   * Verificar si persona tiene tipo específico activo
   */
  async checkTipoActivo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, tipoCodigo } = req.params;

      const tieneTipo = await this.personaService.hasTipoActivo(
        parseInt(id),
        tipoCodigo
      );

      const response: ApiResponse = {
        success: true,
        data: {
          personaId: parseInt(id),
          tipoPersonaCodigo: tipoCodigo,
          tieneActivo: tieneTipo
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}
