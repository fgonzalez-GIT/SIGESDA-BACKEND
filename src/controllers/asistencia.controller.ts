// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import { AsistenciaService } from '@/services/asistencia.service';
import {
  createAsistenciaSchema,
  registroAsistenciaMasivaSchema,
  updateAsistenciaSchema,
  asistenciaQuerySchema,
  reporteAsistenciasSchema,
  tasaAsistenciaSchema,
  alertasInasistenciasSchema
} from '@/dto/asistencia.dto';

/**
 * Controller para manejar las peticiones HTTP de asistencias
 */
export class AsistenciaController {
  constructor(private asistenciaService: AsistenciaService) {}

  /**
   * Crear un registro de asistencia individual
   * POST /api/asistencias
   */
  async createAsistencia(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createAsistenciaSchema.parse(req.body);
      const asistencia = await this.asistenciaService.create(validatedData);

      res.status(201).json({
        success: true,
        message: 'Asistencia registrada exitosamente',
        data: asistencia
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Registrar asistencias masivas para una sesión completa
   * POST /api/asistencias/registro-masivo
   */
  async registroMasivo(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = registroAsistenciaMasivaSchema.parse(req.body);
      const resultado = await this.asistenciaService.registroMasivo(validatedData);

      res.status(201).json({
        success: true,
        message: resultado.mensaje,
        data: resultado
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener asistencias con filtros y paginación
   * GET /api/asistencias
   */
  async getAsistencias(req: Request, res: Response, next: NextFunction) {
    try {
      const query = asistenciaQuerySchema.parse(req.query);
      const result = await this.asistenciaService.findAll(query);

      res.json({
        success: true,
        message: 'Asistencias obtenidas exitosamente',
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener una asistencia por ID
   * GET /api/asistencias/:id
   */
  async getAsistenciaById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de asistencia inválido'
        });
      }

      const asistencia = await this.asistenciaService.findById(id);

      res.json({
        success: true,
        message: 'Asistencia obtenida exitosamente',
        data: asistencia
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener asistencias de una participación
   * GET /api/asistencias/participacion/:participacionId
   */
  async getAsistenciasByParticipacion(req: Request, res: Response, next: NextFunction) {
    try {
      const participacionId = parseInt(req.params.participacionId);
      if (isNaN(participacionId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de participación inválido'
        });
      }

      const asistencias = await this.asistenciaService.findByParticipacion(participacionId);

      res.json({
        success: true,
        message: 'Asistencias de la participación obtenidas exitosamente',
        data: asistencias
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener asistencias de una actividad
   * GET /api/asistencias/actividad/:actividadId
   */
  async getAsistenciasByActividad(req: Request, res: Response, next: NextFunction) {
    try {
      const actividadId = parseInt(req.params.actividadId);
      if (isNaN(actividadId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de actividad inválido'
        });
      }

      const fechaDesde = req.query.fechaDesde ? new Date(req.query.fechaDesde as string) : undefined;
      const fechaHasta = req.query.fechaHasta ? new Date(req.query.fechaHasta as string) : undefined;

      const asistencias = await this.asistenciaService.findByActividad(
        actividadId,
        fechaDesde,
        fechaHasta
      );

      res.json({
        success: true,
        message: 'Asistencias de la actividad obtenidas exitosamente',
        data: asistencias
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener asistencias de una persona
   * GET /api/asistencias/persona/:personaId
   */
  async getAsistenciasByPersona(req: Request, res: Response, next: NextFunction) {
    try {
      const { personaId } = req.params;
      const fechaDesde = req.query.fechaDesde ? new Date(req.query.fechaDesde as string) : undefined;
      const fechaHasta = req.query.fechaHasta ? new Date(req.query.fechaHasta as string) : undefined;

      const asistencias = await this.asistenciaService.findByPersona(
        personaId,
        fechaDesde,
        fechaHasta
      );

      res.json({
        success: true,
        message: 'Asistencias de la persona obtenidas exitosamente',
        data: asistencias
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar un registro de asistencia
   * PATCH /api/asistencias/:id
   */
  async updateAsistencia(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de asistencia inválido'
        });
      }

      const validatedData = updateAsistenciaSchema.parse(req.body);
      const asistencia = await this.asistenciaService.update(id, validatedData);

      res.json({
        success: true,
        message: 'Asistencia actualizada exitosamente',
        data: asistencia
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar un registro de asistencia
   * DELETE /api/asistencias/:id
   */
  async deleteAsistencia(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de asistencia inválido'
        });
      }

      const asistencia = await this.asistenciaService.delete(id);

      res.json({
        success: true,
        message: 'Asistencia eliminada exitosamente',
        data: asistencia
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener tasa de asistencia de una participación
   * GET /api/asistencias/tasa/:participacionId
   */
  async getTasaAsistencia(req: Request, res: Response, next: NextFunction) {
    try {
      const participacionId = parseInt(req.params.participacionId);
      if (isNaN(participacionId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de participación inválido'
        });
      }

      const fechaDesde = req.query.fechaDesde as string | undefined;
      const fechaHasta = req.query.fechaHasta as string | undefined;

      const params = tasaAsistenciaSchema.parse({
        participacionId,
        fechaDesde,
        fechaHasta
      });

      const tasa = await this.asistenciaService.getTasaAsistencia(params);

      res.json({
        success: true,
        message: 'Tasa de asistencia calculada exitosamente',
        data: tasa
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener alertas de inasistencias consecutivas
   * GET /api/asistencias/alertas
   */
  async getAlertasInasistencias(req: Request, res: Response, next: NextFunction) {
    try {
      const params = alertasInasistenciasSchema.parse(req.query);
      const alertas = await this.asistenciaService.getAlertasInasistencias(params);

      res.json({
        success: true,
        message: 'Alertas de inasistencias obtenidas exitosamente',
        data: alertas
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generar reporte de asistencias
   * GET /api/asistencias/reporte
   */
  async getReporteAsistencias(req: Request, res: Response, next: NextFunction) {
    try {
      const params = reporteAsistenciasSchema.parse(req.query);
      const reporte = await this.asistenciaService.getReporteAsistencias(params);

      res.json({
        success: true,
        message: 'Reporte de asistencias generado exitosamente',
        data: reporte
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener estadísticas generales de asistencias
   * GET /api/asistencias/estadisticas
   */
  async getEstadisticasGenerales(req: Request, res: Response, next: NextFunction) {
    try {
      const actividadId = req.query.actividadId ? parseInt(req.query.actividadId as string) : undefined;
      const fechaDesde = req.query.fechaDesde ? new Date(req.query.fechaDesde as string) : undefined;
      const fechaHasta = req.query.fechaHasta ? new Date(req.query.fechaHasta as string) : undefined;

      const estadisticas = await this.asistenciaService.getEstadisticasGenerales(
        actividadId,
        fechaDesde,
        fechaHasta
      );

      res.json({
        success: true,
        message: 'Estadísticas generales obtenidas exitosamente',
        data: estadisticas
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener dashboard con métricas de asistencias
   * GET /api/asistencias/dashboard
   */
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const actividadId = req.query.actividadId ? parseInt(req.query.actividadId as string) : undefined;
      const dashboard = await this.asistenciaService.getDashboardAsistencias(actividadId);

      res.json({
        success: true,
        message: 'Dashboard de asistencias obtenido exitosamente',
        data: dashboard
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener resumen de asistencias de una persona
   * GET /api/asistencias/resumen/persona/:personaId
   */
  async getResumenPersona(req: Request, res: Response, next: NextFunction) {
    try {
      const { personaId } = req.params;
      const fechaDesde = req.query.fechaDesde ? new Date(req.query.fechaDesde as string) : undefined;
      const fechaHasta = req.query.fechaHasta ? new Date(req.query.fechaHasta as string) : undefined;

      const resumen = await this.asistenciaService.getResumenPersona(
        personaId,
        fechaDesde,
        fechaHasta
      );

      res.json({
        success: true,
        message: 'Resumen de asistencias de la persona obtenido exitosamente',
        data: resumen
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener resumen de asistencias de una actividad
   * GET /api/asistencias/resumen/actividad/:actividadId
   */
  async getResumenActividad(req: Request, res: Response, next: NextFunction) {
    try {
      const actividadId = parseInt(req.params.actividadId);
      if (isNaN(actividadId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de actividad inválido'
        });
      }

      const fechaDesde = req.query.fechaDesde ? new Date(req.query.fechaDesde as string) : undefined;
      const fechaHasta = req.query.fechaHasta ? new Date(req.query.fechaHasta as string) : undefined;

      const resumen = await this.asistenciaService.getResumenActividad(
        actividadId,
        fechaDesde,
        fechaHasta
      );

      res.json({
        success: true,
        message: 'Resumen de asistencias de la actividad obtenido exitosamente',
        data: resumen
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Corregir asistencia (crear o actualizar)
   * POST /api/asistencias/corregir
   */
  async corregirAsistencia(req: Request, res: Response, next: NextFunction) {
    try {
      const { participacionId, fechaSesion, asistio, justificada, observaciones } = req.body;

      if (!participacionId || !fechaSesion || asistio === undefined) {
        return res.status(400).json({
          success: false,
          message: 'participacionId, fechaSesion y asistio son campos requeridos'
        });
      }

      const asistencia = await this.asistenciaService.corregirAsistencia(
        parseInt(participacionId),
        new Date(fechaSesion),
        asistio,
        justificada,
        observaciones
      );

      res.json({
        success: true,
        message: 'Asistencia corregida exitosamente',
        data: asistencia
      });
    } catch (error) {
      next(error);
    }
  }
}
