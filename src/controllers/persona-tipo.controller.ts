// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import { PersonaTipoService } from '@/services/persona-tipo.service';
import {
  createPersonaTipoSchema,
  updatePersonaTipoSchema,
  createContactoPersonaSchema,
  updateContactoPersonaSchema
} from '@/dto/persona-tipo.dto';
import { ApiResponse } from '@/types/interfaces';
import { HttpStatus } from '@/types/enums';
import { logger } from '@/utils/logger';

/**
 * Controller para gestión de tipos y contactos de personas
 */
export class PersonaTipoController {
  constructor(private personaTipoService: PersonaTipoService) {}

  // ======================================================================
  // GESTIÓN DE TIPOS DE PERSONA
  // ======================================================================

  /**
   * POST /api/personas/:personaId/tipos
   * Asignar un tipo a una persona
   */
  async asignarTipo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { personaId } = req.params;
      const validatedData = createPersonaTipoSchema.parse(req.body);

      const personaTipo = await this.personaTipoService.asignarTipo(
        parseInt(personaId),
        validatedData
      );

      const response: ApiResponse = {
        success: true,
        message: `Tipo ${personaTipo.tipoPersona.nombre} asignado exitosamente`,
        data: personaTipo
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/personas/:personaId/tipos
   * Obtener todos los tipos de una persona
   */
  async getTiposByPersona(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { personaId } = req.params;
      const { soloActivos } = req.query;

      const tipos = await this.personaTipoService.getTiposByPersona(
        parseInt(personaId),
        soloActivos === 'true'
      );

      const response: ApiResponse = {
        success: true,
        data: tipos
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/personas/:personaId/tipos/:tipoId
   * Actualizar datos de un tipo específico
   */
  async updateTipo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { personaId, tipoId } = req.params;
      const validatedData = updatePersonaTipoSchema.parse(req.body);

      const personaTipo = await this.personaTipoService.updateTipo(
        parseInt(tipoId),
        validatedData
      );

      const response: ApiResponse = {
        success: true,
        message: 'Tipo de persona actualizado exitosamente',
        data: personaTipo
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/personas/:personaId/tipos/:tipoPersonaId
   * Desasignar un tipo de persona
   * Query params: fechaDesasignacion (opcional, ISO string)
   */
  async desasignarTipo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { personaId, tipoPersonaId } = req.params;
      const { fechaDesasignacion } = req.query;

      const personaTipo = await this.personaTipoService.desasignarTipo(
        parseInt(personaId),
        parseInt(tipoPersonaId),
        fechaDesasignacion ? new Date(fechaDesasignacion as string) : undefined
      );

      const response: ApiResponse = {
        success: true,
        message: `Tipo ${personaTipo.tipoPersona.nombre} desasignado exitosamente`,
        data: personaTipo
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/personas/:personaId/tipos/:tipoPersonaId/hard
   * Eliminar completamente un tipo de persona (hard delete)
   */
  async eliminarTipo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { personaId, tipoPersonaId } = req.params;

      const personaTipo = await this.personaTipoService.eliminarTipo(
        parseInt(personaId),
        parseInt(tipoPersonaId)
      );

      const response: ApiResponse = {
        success: true,
        message: 'Tipo de persona eliminado permanentemente',
        data: personaTipo
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  // ======================================================================
  // GESTIÓN DE CONTACTOS
  // ======================================================================

  /**
   * POST /api/personas/:personaId/contactos
   * Agregar un contacto a una persona
   */
  async agregarContacto(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { personaId } = req.params;
      const validatedData = createContactoPersonaSchema.parse(req.body);

      const contacto = await this.personaTipoService.agregarContacto(
        parseInt(personaId),
        validatedData
      );

      const response: ApiResponse = {
        success: true,
        message: `Contacto ${contacto.tipoContacto} agregado exitosamente`,
        data: contacto
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/personas/:personaId/contactos
   * Obtener todos los contactos de una persona
   */
  async getContactosByPersona(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { personaId } = req.params;
      const { soloActivos } = req.query;

      const contactos = await this.personaTipoService.getContactosByPersona(
        parseInt(personaId),
        soloActivos === 'true'
      );

      const response: ApiResponse = {
        success: true,
        data: contactos
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/personas/:personaId/contactos/:contactoId
   * Actualizar un contacto
   */
  async updateContacto(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { contactoId } = req.params;
      const validatedData = updateContactoPersonaSchema.parse(req.body);

      const contacto = await this.personaTipoService.updateContacto(
        parseInt(contactoId),
        validatedData
      );

      const response: ApiResponse = {
        success: true,
        message: 'Contacto actualizado exitosamente',
        data: contacto
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/personas/:personaId/contactos/:contactoId
   * Eliminar un contacto
   */
  async eliminarContacto(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { contactoId } = req.params;

      const contacto = await this.personaTipoService.eliminarContacto(
        parseInt(contactoId)
      );

      const response: ApiResponse = {
        success: true,
        message: 'Contacto eliminado exitosamente',
        data: contacto
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  // ======================================================================
  // CATÁLOGOS
  // ======================================================================

  /**
   * GET /api/catalogos/tipos-persona
   * Obtener catálogo de tipos de persona
   */
  async getTiposPersona(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { soloActivos } = req.query;

      const tipos = await this.personaTipoService.getTiposPersona(
        soloActivos !== 'false'
      );

      const response: ApiResponse = {
        success: true,
        data: tipos
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/catalogos/tipos-persona/:codigo
   * Obtener tipo de persona por código
   */
  async getTipoPersonaByCodigo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { codigo } = req.params;

      const tipo = await this.personaTipoService.getTipoPersonaByCodigo(codigo);

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
   * GET /api/catalogos/especialidades-docentes
   * Obtener catálogo de especialidades de docentes
   */
  async getEspecialidadesDocentes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { soloActivas } = req.query;

      const especialidades = await this.personaTipoService.getEspecialidadesDocentes(
        soloActivas !== 'false'
      );

      const response: ApiResponse = {
        success: true,
        data: especialidades
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/catalogos/especialidades-docentes/:codigo
   * Obtener especialidad por código
   */
  async getEspecialidadByCodigo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { codigo } = req.params;

      const especialidad = await this.personaTipoService.getEspecialidadByCodigo(codigo);

      const response: ApiResponse = {
        success: true,
        data: especialidad
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}
