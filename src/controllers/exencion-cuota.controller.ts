import { Request, Response, NextFunction } from 'express';
import { ExencionCuotaService } from '@/services/exencion-cuota.service';
import {
  createExencionCuotaSchema,
  updateExencionCuotaSchema,
  queryExencionCuotaSchema,
  aprobarExencionSchema,
  rechazarExencionSchema,
  revocarExencionSchema
} from '@/dto/exencion-cuota.dto';
import { ApiResponse } from '@/types/interfaces';
import { HttpStatus } from '@/types/enums';

/**
 * Controller for managing temporary exemptions from cuota payments
 * FASE 4 - Task 4.2: Exenciones Temporales
 */
export class ExencionCuotaController {
  constructor(private service: ExencionCuotaService) {}

  /**
   * @swagger
   * /api/exenciones-cuota:
   *   post:
   *     summary: Solicitar exención de cuota ⭐ FASE 4
   *     description: |
   *       Crea una solicitud de exención temporal de pago de cuota.
   *       **Estado inicial**: PENDIENTE_APROBACION
   *       **Tipos de exención**:
   *       - TOTAL: 100% de exención
   *       - PARCIAL: Porcentaje personalizado (0-100%)
   *       **Motivos**: BECA, SOCIO_FUNDADOR, SITUACION_ECONOMICA, SITUACION_SALUD, etc.
   *       **Workflow**: Requiere aprobación posterior con endpoint /aprobar
   *     tags: [Exenciones]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - personaId
   *               - tipoExencion
   *               - motivoExencion
   *               - fechaInicio
   *             properties:
   *               personaId:
   *                 type: integer
   *                 description: ID del socio
   *               tipoExencion:
   *                 type: string
   *                 enum: [TOTAL, PARCIAL]
   *                 description: Tipo de exención
   *               motivoExencion:
   *                 type: string
   *                 enum: [BECA, SOCIO_FUNDADOR, SOCIO_HONORARIO, SITUACION_ECONOMICA, SITUACION_SALUD, INTERCAMBIO_SERVICIOS, PROMOCION, FAMILIAR_DOCENTE, OTRO]
   *                 description: Motivo de la exención
   *               porcentajeExencion:
   *                 type: number
   *                 minimum: 0
   *                 maximum: 100
   *                 description: Porcentaje (requerido si tipoExencion=PARCIAL, 100 si TOTAL)
   *                 example: 50
   *               fechaInicio:
   *                 type: string
   *                 format: date
   *                 description: Fecha inicio de vigencia
   *               fechaFin:
   *                 type: string
   *                 format: date
   *                 description: Fecha fin de vigencia (opcional, sin límite si no se especifica)
   *               observaciones:
   *                 type: string
   *                 description: Observaciones adicionales
   *               usuario:
   *                 type: string
   *                 description: Usuario que solicita (auditoría)
   *     responses:
   *       201:
   *         description: Exención solicitada exitosamente (PENDIENTE_APROBACION)
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/ExencionCuota'
   *       400:
   *         description: Datos inválidos
   *       404:
   *         description: Persona no encontrada
   *       409:
   *         description: Ya existe exención activa para el período
   */
  async createExencion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createExencionCuotaSchema.parse(req.body);
      const usuario = req.body.usuario || 'sistema';

      const exencion = await this.service.createExencion(validatedData, usuario);

      const response: ApiResponse = {
        success: true,
        message: 'Exención creada exitosamente',
        data: exencion,
        meta: {
          exencionId: exencion.id,
          personaId: exencion.personaId,
          estado: exencion.estado
        }
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/exenciones-cuota/:id
   * Get exemption by ID
   */
  async getExencionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const exencion = await this.service.getExencionById(parseInt(id));

      if (!exencion) {
        const response: ApiResponse = {
          success: false,
          error: `Exención con ID ${id} no encontrada`
        };
        res.status(HttpStatus.NOT_FOUND).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: exencion
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/exenciones-cuota
   * Get all exemptions with filters
   */
  async getExenciones(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = queryExencionCuotaSchema.parse(req.query);
      const exenciones = await this.service.getExenciones(filters);

      const response: ApiResponse = {
        success: true,
        data: exenciones,
        meta: {
          total: exenciones.length,
          filters
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/exenciones-cuota/persona/:personaId
   * Get all exemptions for a persona
   */
  async getExencionesByPersona(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { personaId } = req.params;
      const { soloActivas } = req.query;

      const exenciones = await this.service.getExencionesByPersonaId(
        parseInt(personaId),
        soloActivas === 'true'
      );

      const response: ApiResponse = {
        success: true,
        data: exenciones,
        meta: {
          personaId: parseInt(personaId),
          total: exenciones.length
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/exenciones-cuota/pendientes
   * Get pending exemptions
   */
  async getPendientes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const exenciones = await this.service.getPendientes();

      const response: ApiResponse = {
        success: true,
        data: exenciones,
        meta: {
          total: exenciones.length
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/exenciones-cuota/vigentes
   * Get active exemptions
   */
  async getVigentes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const exenciones = await this.service.getVigentes();

      const response: ApiResponse = {
        success: true,
        data: exenciones,
        meta: {
          total: exenciones.length
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/exenciones-cuota/:id
   * Update an exemption
   */
  async updateExencion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateExencionCuotaSchema.parse(req.body);
      const usuario = req.body.usuario || 'sistema';

      const exencion = await this.service.updateExencion(parseInt(id), validatedData, usuario);

      const response: ApiResponse = {
        success: true,
        message: 'Exención actualizada exitosamente',
        data: exencion
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/exenciones-cuota/:id/aprobar
   * Approve an exemption
   */
  async aprobarExencion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = aprobarExencionSchema.parse(req.body);
      const usuario = req.body.usuario || validatedData.aprobadoPor;

      const exencion = await this.service.aprobarExencion(parseInt(id), validatedData, usuario);

      const response: ApiResponse = {
        success: true,
        message: 'Exención aprobada exitosamente',
        data: exencion
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/exenciones-cuota/:id/rechazar
   * Reject an exemption
   */
  async rechazarExencion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = rechazarExencionSchema.parse(req.body);
      const usuario = req.body.usuario || 'sistema';

      const exencion = await this.service.rechazarExencion(parseInt(id), validatedData, usuario);

      const response: ApiResponse = {
        success: true,
        message: 'Exención rechazada',
        data: exencion
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/exenciones-cuota/:id/revocar
   * Revoke an exemption
   */
  async revocarExencion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = revocarExencionSchema.parse(req.body);
      const usuario = req.body.usuario || 'sistema';

      const exencion = await this.service.revocarExencion(parseInt(id), validatedData, usuario);

      const response: ApiResponse = {
        success: true,
        message: 'Exención revocada',
        data: exencion
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/exenciones-cuota/:id
   * Delete an exemption
   */
  async deleteExencion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const usuario = req.body.usuario || 'sistema';

      await this.service.deleteExencion(parseInt(id), usuario);

      const response: ApiResponse = {
        success: true,
        message: 'Exención eliminada'
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/exenciones-cuota/stats
   * Get statistics
   */
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { personaId } = req.query;

      const stats = await this.service.getStats(
        personaId ? parseInt(personaId as string) : undefined
      );

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
   * POST /api/exenciones-cuota/check-periodo
   * Check if persona has exemption for a period
   */
  async checkExencionParaPeriodo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { personaId, fecha } = req.body;

      if (!personaId || !fecha) {
        const response: ApiResponse = {
          success: false,
          error: 'personaId y fecha son requeridos'
        };
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }

      const resultado = await this.service.checkExencionParaPeriodo(
        personaId,
        new Date(fecha)
      );

      const response: ApiResponse = {
        success: true,
        data: resultado
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}
