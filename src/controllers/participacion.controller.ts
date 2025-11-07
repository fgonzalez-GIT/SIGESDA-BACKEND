// @ts-nocheck
import { Request, Response } from 'express';
import { ParticipacionService } from '@/services/participacion.service';
import {
  createParticipacionSchema,
  updateParticipacionSchema,
  participacionQuerySchema,
  inscripcionMasivaSchema,
  inscripcionMultiplePersonasSchema,
  desincripcionSchema,
  estadisticasParticipacionSchema,
  reporteInasistenciasSchema,
  verificarCuposSchema,
  transferirParticipacionSchema
} from '@/dto/participacion.dto';
import { z } from 'zod';

export class ParticipacionController {
  constructor(private participacionService: ParticipacionService) {}

  async createParticipacion(req: Request, res: Response) {
    try {
      const validatedData = createParticipacionSchema.parse(req.body);
      const participacion = await this.participacionService.create(validatedData);

      res.status(201).json({
        success: true,
        message: 'Participación creada exitosamente',
        data: participacion
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Error de validación',
          errors: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
      }

      const statusCode = error instanceof Error &&
        (error.message.includes('no encontrada') || error.message.includes('no encontrado')) ? 404 : 500;

      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async getParticipaciones(req: Request, res: Response) {
    try {
      const query = participacionQuerySchema.parse(req.query);
      const result = await this.participacionService.findAll(query);

      res.json({
        success: true,
        message: 'Participaciones obtenidas exitosamente',
        data: result.data,
        pagination: {
          page: result.page,
          limit: query.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Error de validación en parámetros de consulta',
          errors: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
      }

      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async getParticipacionById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }
      const participacion = await this.participacionService.findById(id);

      res.json({
        success: true,
        message: 'Participación obtenida exitosamente',
        data: participacion
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('no encontrada') ? 404 : 500;

      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async getParticipacionesByPersona(req: Request, res: Response) {
    try {
      const personaId = parseInt(req.params.personaId);
      if (isNaN(personaId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de persona inválido'
        });
      }
      const participaciones = await this.participacionService.findByPersonaId(personaId);

      res.json({
        success: true,
        message: 'Participaciones de la persona obtenidas exitosamente',
        data: participaciones
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('no encontrada') ? 404 : 500;

      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async getParticipacionesByActividad(req: Request, res: Response) {
    try {
      const actividadId = parseInt(req.params.actividadId);
      if (isNaN(actividadId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de actividad inválido'
        });
      }
      const participaciones = await this.participacionService.findByActividadId(actividadId);

      res.json({
        success: true,
        message: 'Participaciones de la actividad obtenidas exitosamente',
        data: participaciones
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('no encontrada') ? 404 : 500;

      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async updateParticipacion(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }
      const validatedData = updateParticipacionSchema.parse(req.body);

      const participacion = await this.participacionService.update(id, validatedData);

      res.json({
        success: true,
        message: 'Participación actualizada exitosamente',
        data: participacion
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Error de validación',
          errors: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
      }

      const statusCode = error instanceof Error && error.message.includes('no encontrada') ? 404 : 500;

      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async deleteParticipacion(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }
      const participacion = await this.participacionService.delete(id);

      res.json({
        success: true,
        message: 'Participación eliminada exitosamente',
        data: participacion
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('no encontrada') ? 404 : 500;

      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async inscripcionMasiva(req: Request, res: Response) {
    try {
      const validatedData = inscripcionMasivaSchema.parse(req.body);
      const resultado = await this.participacionService.inscripcionMasiva(validatedData);

      const statusCode = resultado.totalErrores > 0 ? 207 : 201; // 207 Multi-Status para éxito parcial

      res.status(statusCode).json({
        success: resultado.totalErrores === 0,
        message: `${resultado.totalCreadas} participaciones creadas exitosamente${resultado.totalErrores > 0 ? `, ${resultado.totalErrores} errores` : ''}`,
        data: {
          participacionesCreadas: resultado.participacionesCreadas,
          totalCreadas: resultado.totalCreadas,
          totalErrores: resultado.totalErrores,
          errores: resultado.errores
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Error de validación',
          errors: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
      }

      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async inscripcionMultiplePersonas(req: Request, res: Response) {
    try {
      const validatedData = inscripcionMultiplePersonasSchema.parse(req.body);
      const resultado = await this.participacionService.inscripcionMultiplePersonas(validatedData);

      const statusCode = resultado.totalErrores > 0 ? 207 : 201; // 207 Multi-Status para éxito parcial

      res.status(statusCode).json({
        success: resultado.totalErrores === 0,
        message: `${resultado.totalCreadas} personas inscritas exitosamente a ${resultado.actividadNombre}${resultado.totalErrores > 0 ? `, ${resultado.totalErrores} errores` : ''}`,
        data: {
          participacionesCreadas: resultado.participacionesCreadas,
          totalCreadas: resultado.totalCreadas,
          totalErrores: resultado.totalErrores,
          errores: resultado.errores,
          actividadNombre: resultado.actividadNombre
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Error de validación',
          errors: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
      }

      const statusCode = error instanceof Error &&
        (error.message.includes('no encontrada') || error.message.includes('no hay suficientes cupos')) ? 400 : 500;

      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async desinscribir(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      const validatedData = desincripcionSchema.parse(req.body);

      const participacion = await this.participacionService.desinscribir(id, validatedData);

      res.json({
        success: true,
        message: 'Participación finalizada exitosamente',
        data: participacion
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Error de validación',
          errors: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
      }

      let statusCode = 500;
      if (error instanceof Error) {
        if (error.message.includes('no encontrada')) {
          statusCode = 404;
        } else if (error.message.includes('ya está inactiv')) {
          statusCode = 400;
        }
      }

      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async reactivarParticipacion(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      const participacion = await this.participacionService.reactivar(id);

      res.json({
        success: true,
        message: 'Participación reactivada exitosamente',
        data: participacion
      });
    } catch (error) {
      const statusCode = error instanceof Error &&
        (error.message.includes('no encontrada') || error.message.includes('ya está activa') ||
         error.message.includes('no tiene cupos')) ? 400 : 500;

      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async transferirParticipacion(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }
      const validatedData = transferirParticipacionSchema.parse(req.body);

      const participacion = await this.participacionService.transferir(id, validatedData);

      res.json({
        success: true,
        message: 'Participación transferida exitosamente',
        data: participacion
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Error de validación',
          errors: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
      }

      const statusCode = error instanceof Error &&
        (error.message.includes('no encontrada') || error.message.includes('capacidad máxima')) ? 400 : 500;

      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async verificarCupos(req: Request, res: Response) {
    try {
      const validatedData = verificarCuposSchema.parse(req.body);
      const resultado = await this.participacionService.verificarCupos(validatedData);

      res.json({
        success: true,
        message: 'Verificación de cupos realizada exitosamente',
        data: resultado
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Error de validación',
          errors: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
      }

      const statusCode = error instanceof Error && error.message.includes('no encontrada') ? 404 : 500;

      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async getParticipacionesActivas(req: Request, res: Response) {
    try {
      const { personaId } = req.query;
      const personaIdNum = personaId ? parseInt(personaId as string) : undefined;
      const participaciones = await this.participacionService.getParticipacionesActivas(personaIdNum);

      res.json({
        success: true,
        message: 'Participaciones activas obtenidas exitosamente',
        data: participaciones
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async getParticipacionesPorVencer(req: Request, res: Response) {
    try {
      const { dias } = req.query;
      const diasNum = dias ? parseInt(dias as string) : 30;

      if (isNaN(diasNum) || diasNum < 1) {
        return res.status(400).json({
          success: false,
          message: 'El parámetro "dias" debe ser un número positivo'
        });
      }

      const participaciones = await this.participacionService.getParticipacionesPorVencer(diasNum);

      res.json({
        success: true,
        message: 'Participaciones próximas a vencer obtenidas exitosamente',
        data: participaciones
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async getEstadisticas(req: Request, res: Response) {
    try {
      const params = estadisticasParticipacionSchema.parse(req.query);
      const estadisticas = await this.participacionService.getEstadisticas(params);

      res.json({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: estadisticas
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Error de validación en parámetros',
          errors: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
      }

      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async getReporteInasistencias(req: Request, res: Response) {
    try {
      const params = reporteInasistenciasSchema.parse(req.query);
      const reporte = await this.participacionService.getReporteInasistencias(params);

      res.json({
        success: true,
        message: 'Reporte de inasistencias generado exitosamente',
        data: reporte
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Error de validación en parámetros',
          errors: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
      }

      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async getDashboard(req: Request, res: Response) {
    try {
      const dashboard = await this.participacionService.getDashboardParticipacion();

      res.json({
        success: true,
        message: 'Dashboard de participación obtenido exitosamente',
        data: dashboard
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }
}