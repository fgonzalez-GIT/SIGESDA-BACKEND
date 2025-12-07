/**
 * Controller para gestión de contactos de personas
 * Endpoints para ContactoPersona
 */

import { Request, Response, NextFunction } from 'express';
import { ContactoService } from '@/services/contacto.service';
import {
  createContactoPersonaSchema,
  updateContactoPersonaSchema
} from '@/dto/contacto.dto';
import { ApiResponse } from '@/types/interfaces';
import { HttpStatus } from '@/types/enums';
import { logger } from '@/utils/logger';

/**
 * Controller para gestión de contactos de personas
 */
export class ContactoPersonaController {
  constructor(private contactoService: ContactoService) {}

  /**
   * POST /api/personas/:personaId/contactos
   * Agregar un contacto a una persona
   */
  async agregarContacto(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { personaId } = req.params;
      const validatedData = createContactoPersonaSchema.parse(req.body);

      const contacto = await this.contactoService.agregarContacto(
        parseInt(personaId),
        validatedData
      );

      const response: ApiResponse = {
        success: true,
        message: `Contacto ${contacto.tipoContacto.nombre} agregado exitosamente`,
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
   * Query params:
   * - soloActivos: boolean (default: true)
   */
  async getContactosByPersona(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { personaId } = req.params;
      const { soloActivos } = req.query;

      const contactos = await this.contactoService.getContactosByPersona(
        parseInt(personaId),
        soloActivos === 'true'
      );

      const response: ApiResponse = {
        success: true,
        data: contactos,
        meta: {
          total: contactos.length
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/personas/:personaId/contactos/:contactoId
   * Obtener un contacto específico
   */
  async getContactoById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { contactoId } = req.params;

      const contacto = await this.contactoService.getContactoById(parseInt(contactoId));

      const response: ApiResponse = {
        success: true,
        data: contacto
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

      const contacto = await this.contactoService.updateContacto(
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
   * Eliminar un contacto (soft delete)
   */
  async eliminarContacto(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { contactoId } = req.params;

      const contacto = await this.contactoService.eliminarContacto(
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

  /**
   * DELETE /api/personas/:personaId/contactos/:contactoId/permanente
   * Eliminar un contacto permanentemente (hard delete)
   * Solo para administración
   */
  async eliminarContactoPermanente(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { contactoId } = req.params;

      const contacto = await this.contactoService.eliminarContactoPermanente(
        parseInt(contactoId)
      );

      const response: ApiResponse = {
        success: true,
        message: 'Contacto eliminado PERMANENTEMENTE',
        data: contacto
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}
