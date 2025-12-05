import { Request, Response, NextFunction } from 'express';
import { CatalogoService } from '@/services/catalogo.service';
import {
  createTipoPersonaSchema,
  updateTipoPersonaSchema,
  createEspecialidadSchema,
  updateEspecialidadSchema,
  toggleActivoSchema
} from '@/dto/catalogo.dto';
import { ApiResponse } from '@/types/interfaces';
import { HttpStatus } from '@/types/enums';
import { logger } from '@/utils/logger';

/**
 * Controller para gestión administrativa de catálogos
 * Endpoints protegidos que solo deben ser accesibles por administradores
 */
export class CatalogoAdminController {
  constructor(private catalogoService: CatalogoService) {}

  // ======================================================================
  // GESTIÓN DE TIPOS DE PERSONA
  // ======================================================================

  /**
   * POST /api/admin/catalogos/tipos-persona
   * Crear un nuevo tipo de persona
   */
  async createTipoPersona(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createTipoPersonaSchema.parse(req.body);
      const tipo = await this.catalogoService.createTipoPersona(validatedData);

      const response: ApiResponse = {
        success: true,
        message: `Tipo de persona '${tipo.nombre}' creado exitosamente`,
        data: tipo
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/catalogos/tipos-persona
   * Listar todos los tipos con estadísticas de uso
   */
  async getAllTiposPersonaWithStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tipos = await this.catalogoService.getAllTiposPersonaWithStats();

      const response: ApiResponse = {
        success: true,
        data: tipos.map(tipo => ({
          ...tipo,
          personasActivas: tipo._count.personasTipo,
          esProtegido: ['NO_SOCIO', 'SOCIO', 'DOCENTE', 'PROVEEDOR'].includes(tipo.codigo)
        }))
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/catalogos/tipos-persona/:id
   * Obtener un tipo de persona por ID
   */
  async getTipoPersonaById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tipo = await this.catalogoService.getTipoPersonaById(parseInt(id));

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
   * PUT /api/admin/catalogos/tipos-persona/:id
   * Actualizar un tipo de persona
   */
  async updateTipoPersona(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateTipoPersonaSchema.parse(req.body);
      const tipo = await this.catalogoService.updateTipoPersona(parseInt(id), validatedData);

      const response: ApiResponse = {
        success: true,
        message: `Tipo de persona '${tipo.nombre}' actualizado exitosamente`,
        data: tipo
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/admin/catalogos/tipos-persona/:id
   * Eliminar un tipo de persona
   */
  async deleteTipoPersona(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tipo = await this.catalogoService.deleteTipoPersona(parseInt(id));

      const response: ApiResponse = {
        success: true,
        message: `Tipo de persona '${tipo.nombre}' eliminado exitosamente`,
        data: tipo
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/admin/catalogos/tipos-persona/:id/toggle
   * Activar/Desactivar un tipo de persona
   */
  async toggleActivoTipoPersona(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { activo } = toggleActivoSchema.parse(req.body);
      const tipo = await this.catalogoService.toggleActivoTipoPersona(parseInt(id), activo);

      const response: ApiResponse = {
        success: true,
        message: `Tipo de persona '${tipo.nombre}' ${activo ? 'activado' : 'desactivado'} exitosamente`,
        data: tipo
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  // ======================================================================
  // GESTIÓN DE ESPECIALIDADES DOCENTES
  // ======================================================================

  /**
   * POST /api/admin/catalogos/especialidades-docentes
   * Crear una nueva especialidad docente
   */
  async createEspecialidad(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createEspecialidadSchema.parse(req.body);
      const especialidad = await this.catalogoService.createEspecialidad(validatedData);

      const response: ApiResponse = {
        success: true,
        message: `Especialidad '${especialidad.nombre}' creada exitosamente`,
        data: especialidad
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/catalogos/especialidades-docentes
   * Listar todas las especialidades con estadísticas de uso
   */
  async getAllEspecialidadesWithStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const especialidades = await this.catalogoService.getAllEspecialidadesWithStats();

      const response: ApiResponse = {
        success: true,
        data: especialidades.map(esp => ({
          ...esp,
          docentesActivos: esp._count.personaTipos,
          esProtegida: esp.codigo === 'GENERAL'
        }))
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/catalogos/especialidades-docentes/:id
   * Obtener una especialidad por ID
   */
  async getEspecialidadById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const especialidad = await this.catalogoService.getEspecialidadById(parseInt(id));

      const response: ApiResponse = {
        success: true,
        data: especialidad
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/admin/catalogos/especialidades-docentes/:id
   * Actualizar una especialidad
   */
  async updateEspecialidad(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateEspecialidadSchema.parse(req.body);
      const especialidad = await this.catalogoService.updateEspecialidad(parseInt(id), validatedData);

      const response: ApiResponse = {
        success: true,
        message: `Especialidad '${especialidad.nombre}' actualizada exitosamente`,
        data: especialidad
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/admin/catalogos/especialidades-docentes/:id
   * Eliminar una especialidad
   */
  async deleteEspecialidad(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const especialidad = await this.catalogoService.deleteEspecialidad(parseInt(id));

      const response: ApiResponse = {
        success: true,
        message: `Especialidad '${especialidad.nombre}' eliminada exitosamente`,
        data: especialidad
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/admin/catalogos/especialidades-docentes/:id/toggle
   * Activar/Desactivar una especialidad
   */
  async toggleActivoEspecialidad(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { activo } = toggleActivoSchema.parse(req.body);
      const especialidad = await this.catalogoService.toggleActivoEspecialidad(parseInt(id), activo);

      const response: ApiResponse = {
        success: true,
        message: `Especialidad '${especialidad.nombre}' ${activo ? 'activada' : 'desactivada'} exitosamente`,
        data: especialidad
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}
