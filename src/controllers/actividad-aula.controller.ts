// @ts-nocheck
import { Request, Response } from 'express';
import { ActividadAulaService } from '@/services/actividad-aula.service';
import { ActividadAulaRepository } from '@/repositories/actividad-aula.repository';
import { ActividadRepository } from '@/repositories/actividad.repository';
import { AulaRepository } from '@/repositories/aula.repository';
import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import {
  createActividadAulaSchema,
  updateActividadAulaSchema,
  queryActividadesAulasSchema,
  desasignarAulaSchema,
  verificarDisponibilidadSchema,
  asignarMultiplesAulasSchema,
  cambiarAulaSchema
} from '@/dto/actividad-aula.dto';

export class ActividadAulaController {
  private actividadAulaService: ActividadAulaService;

  constructor() {
    const actividadAulaRepository = new ActividadAulaRepository(prisma);
    const actividadRepository = new ActividadRepository(prisma);
    const aulaRepository = new AulaRepository(prisma);

    this.actividadAulaService = new ActividadAulaService(
      actividadAulaRepository,
      actividadRepository,
      aulaRepository,
      prisma
    );
  }

  /**
   * POST /api/actividades/:actividadId/aulas
   * Asigna un aula a una actividad
   */
  async asignarAula(req: Request, res: Response) {
    try {
      const actividadId = parseInt(req.params.actividadId);
      const validation = createActividadAulaSchema.safeParse({
        ...req.body,
        actividadId
      });

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: 'Datos de entrada inválidos',
          details: validation.error.errors
        });
      }

      const asignacion = await this.actividadAulaService.asignarAula(validation.data);

      return res.status(201).json({
        success: true,
        message: `Aula "${asignacion.aulas.nombre}" asignada exitosamente a actividad "${asignacion.actividades.nombre}"`,
        data: asignacion
      });
    } catch (error) {
      logger.error(`Error al asignar aula: ${error.message}`);
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/actividades-aulas
   * Lista todas las asignaciones con filtros
   */
  async findAll(req: Request, res: Response) {
    try {
      const validation = queryActividadesAulasSchema.safeParse(req.query);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: 'Parámetros de consulta inválidos',
          details: validation.error.errors
        });
      }

      const result = await this.actividadAulaService.findAll(validation.data);

      return res.json({
        success: true,
        ...result
      });
    } catch (error) {
      logger.error(`Error al obtener asignaciones: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/actividades-aulas/:id
   * Obtiene una asignación por ID
   */
  async findById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'ID inválido'
        });
      }

      const asignacion = await this.actividadAulaService.findById(id);

      if (!asignacion) {
        return res.status(404).json({
          success: false,
          error: 'Asignación no encontrada'
        });
      }

      return res.json({
        success: true,
        data: asignacion
      });
    } catch (error) {
      logger.error(`Error al obtener asignación: ${error.message}`);
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/actividades/:actividadId/aulas
   * Obtiene todas las aulas de una actividad
   */
  async getAulasByActividad(req: Request, res: Response) {
    try {
      const actividadId = parseInt(req.params.actividadId);
      const soloActivas = req.query.soloActivas === 'true';

      const aulas = await this.actividadAulaService.getAulasByActividad(actividadId, soloActivas);

      return res.json({
        success: true,
        data: aulas,
        total: aulas.length
      });
    } catch (error) {
      logger.error(`Error al obtener aulas de actividad: ${error.message}`);
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/aulas/:aulaId/actividades
   * Obtiene todas las actividades de un aula
   */
  async getActividadesByAula(req: Request, res: Response) {
    try {
      const aulaId = parseInt(req.params.aulaId);
      const soloActivas = req.query.soloActivas !== 'false'; // Por defecto true

      const actividades = await this.actividadAulaService.getActividadesByAula(aulaId, soloActivas);

      return res.json({
        success: true,
        data: actividades,
        total: actividades.length
      });
    } catch (error) {
      logger.error(`Error al obtener actividades de aula: ${error.message}`);
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * PUT /api/actividades-aulas/:id
   * Actualiza una asignación
   */
  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const validation = updateActividadAulaSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: 'Datos de entrada inválidos',
          details: validation.error.errors
        });
      }

      const asignacion = await this.actividadAulaService.update(id, validation.data);

      return res.json({
        success: true,
        message: 'Asignación actualizada exitosamente',
        data: asignacion
      });
    } catch (error) {
      logger.error(`Error al actualizar asignación: ${error.message}`);
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * DELETE /api/actividades-aulas/:id
   * Elimina permanentemente una asignación
   */
  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const asignacion = await this.actividadAulaService.delete(id);

      return res.json({
        success: true,
        message: 'Asignación eliminada exitosamente',
        data: asignacion
      });
    } catch (error) {
      logger.error(`Error al eliminar asignación: ${error.message}`);
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/actividades-aulas/:id/desasignar
   * Desasigna un aula de una actividad (soft delete)
   */
  async desasignarAula(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const validation = desasignarAulaSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: 'Datos de entrada inválidos',
          details: validation.error.errors
        });
      }

      const asignacion = await this.actividadAulaService.desasignarAula(id, validation.data);

      return res.json({
        success: true,
        message: 'Aula desasignada exitosamente',
        data: asignacion
      });
    } catch (error) {
      logger.error(`Error al desasignar aula: ${error.message}`);
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/actividades-aulas/:id/reactivar
   * Reactiva una asignación desactivada
   */
  async reactivarAsignacion(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const asignacion = await this.actividadAulaService.reactivarAsignacion(id);

      return res.json({
        success: true,
        message: 'Asignación reactivada exitosamente',
        data: asignacion
      });
    } catch (error) {
      logger.error(`Error al reactivar asignación: ${error.message}`);
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/actividades/:actividadId/aulas/verificar-disponibilidad
   * Verifica disponibilidad de un aula para una actividad
   */
  async verificarDisponibilidad(req: Request, res: Response) {
    try {
      const actividadId = parseInt(req.params.actividadId);
      const validation = verificarDisponibilidadSchema.safeParse({
        ...req.body,
        actividadId
      });

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: 'Datos de entrada inválidos',
          details: validation.error.errors
        });
      }

      const disponibilidad = await this.actividadAulaService.verificarDisponibilidad(validation.data);

      return res.json({
        success: true,
        data: disponibilidad
      });
    } catch (error) {
      logger.error(`Error al verificar disponibilidad: ${error.message}`);
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/actividades/:actividadId/aulas/sugerencias
   * Sugiere aulas disponibles para una actividad
   */
  async sugerirAulas(req: Request, res: Response) {
    try {
      const actividadId = parseInt(req.params.actividadId);
      const criterios = {
        capacidadMinima: req.query.capacidadMinima ? parseInt(req.query.capacidadMinima as string) : undefined,
        tipoAulaId: req.query.tipoAulaId ? parseInt(req.query.tipoAulaId as string) : undefined
      };

      const sugerencias = await this.actividadAulaService.sugerirAulasParaActividad(actividadId, criterios);

      return res.json({
        success: true,
        data: sugerencias,
        total: sugerencias.length
      });
    } catch (error) {
      logger.error(`Error al sugerir aulas: ${error.message}`);
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/actividades/:actividadId/aulas/multiple
   * Asigna múltiples aulas a una actividad
   */
  async asignarMultiplesAulas(req: Request, res: Response) {
    try {
      const actividadId = parseInt(req.params.actividadId);
      const validation = asignarMultiplesAulasSchema.safeParse({
        ...req.body,
        actividadId
      });

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: 'Datos de entrada inválidos',
          details: validation.error.errors
        });
      }

      const resultado = await this.actividadAulaService.asignarMultiplesAulas(validation.data);

      return res.status(201).json({
        success: true,
        message: `${resultado.totalCreadas} aula(s) asignada(s) exitosamente`,
        data: resultado
      });
    } catch (error) {
      logger.error(`Error al asignar múltiples aulas: ${error.message}`);
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * PUT /api/actividades/:actividadId/aulas/:aulaId/cambiar
   * Cambia el aula de una actividad
   */
  async cambiarAula(req: Request, res: Response) {
    try {
      const actividadId = parseInt(req.params.actividadId);
      const aulaIdActual = parseInt(req.params.aulaId);
      const validation = cambiarAulaSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: 'Datos de entrada inválidos',
          details: validation.error.errors
        });
      }

      const resultado = await this.actividadAulaService.cambiarAula(
        actividadId,
        aulaIdActual,
        validation.data
      );

      return res.json({
        success: true,
        message: 'Aula cambiada exitosamente',
        data: resultado
      });
    } catch (error) {
      logger.error(`Error al cambiar aula: ${error.message}`);
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/aulas/:aulaId/ocupacion
   * Obtiene resumen de ocupación de un aula
   */
  async getOcupacionAula(req: Request, res: Response) {
    try {
      const aulaId = parseInt(req.params.aulaId);
      const ocupacion = await this.actividadAulaService.getOcupacionAula(aulaId);

      return res.json({
        success: true,
        data: ocupacion
      });
    } catch (error) {
      logger.error(`Error al obtener ocupación de aula: ${error.message}`);
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }
}
