import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { SeccionService } from '@/services/seccion.service';
import {
  createSeccionSchema,
  updateSeccionSchema,
  createHorarioSeccionSchema,
  updateHorarioSeccionSchema,
  addDocenteSeccionSchema,
  removeDocenteSeccionSchema,
  createParticipacionSeccionSchema,
  updateParticipacionSeccionSchema,
  createReservaAulaSeccionSchema,
  updateReservaAulaSeccionSchema,
  querySeccionesSchema,
  verificarConflictoSeccionSchema
} from '@/dto/seccion.dto';
import { ApiResponse, PaginationParams } from '@/types/interfaces';
import { logger } from '@/utils/logger';

export class SeccionController {
  private service: SeccionService;

  constructor(prisma: PrismaClient) {
    this.service = new SeccionService(prisma);
  }

  // ============================================================================
  // CRUD DE SECCIONES
  // ============================================================================

  /**
   * POST /api/secciones
   * Crear nueva sección
   */
  createSeccion = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = createSeccionSchema.parse(req.body);
      const seccion = await this.service.createSeccion(validatedData);

      logger.info(`Sección creada: ${seccion.nombre} (${seccion.id})`, {
        seccionId: seccion.id,
        actividadId: seccion.actividadId
      });

      const response: ApiResponse = {
        success: true,
        data: seccion,
        message: 'Sección creada exitosamente'
      };

      res.status(201).json(response);
    } catch (error: any) {
      logger.error('Error al crear sección:', error);
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Error al crear sección'
      };
      res.status(400).json(response);
    }
  };

  /**
   * GET /api/secciones/:id
   * Obtener sección por ID
   */
  getSeccionById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { detallada } = req.query;

      const seccion = detallada === 'true'
        ? await this.service.getSeccionDetallada(id)
        : await this.service.getSeccionById(id);

      const response: ApiResponse = {
        success: true,
        data: seccion
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error(`Error al obtener sección ${req.params.id}:`, error);
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Error al obtener sección'
      };
      res.status(404).json(response);
    }
  };

  /**
   * GET /api/secciones
   * Listar secciones con filtros
   */
  listSecciones = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters = querySeccionesSchema.parse(req.query);

      const pagination: PaginationParams = {
        page: filters.page,
        limit: filters.limit,
        offset: (filters.page - 1) * filters.limit
      };

      const result = await this.service.listSecciones(filters, pagination);

      const response: ApiResponse = {
        success: true,
        data: result.secciones,
        meta: {
          page: filters.page,
          limit: filters.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Error al listar secciones:', error);
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Error al listar secciones'
      };
      res.status(400).json(response);
    }
  };

  /**
   * PUT /api/secciones/:id
   * Actualizar sección
   */
  updateSeccion = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const validatedData = updateSeccionSchema.parse(req.body);

      const seccion = await this.service.updateSeccion(id, validatedData);

      logger.info(`Sección actualizada: ${seccion.nombre} (${id})`);

      const response: ApiResponse = {
        success: true,
        data: seccion,
        message: 'Sección actualizada exitosamente'
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error(`Error al actualizar sección ${req.params.id}:`, error);
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Error al actualizar sección'
      };
      res.status(400).json(response);
    }
  };

  /**
   * DELETE /api/secciones/:id
   * Eliminar sección
   */
  deleteSeccion = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      await this.service.deleteSeccion(id);

      logger.info(`Sección eliminada: ${id}`);

      const response: ApiResponse = {
        success: true,
        message: 'Sección eliminada exitosamente'
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error(`Error al eliminar sección ${req.params.id}:`, error);
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Error al eliminar sección'
      };
      res.status(400).json(response);
    }
  };

  // ============================================================================
  // GESTIÓN DE HORARIOS
  // ============================================================================

  /**
   * POST /api/secciones/:id/horarios
   * Agregar horario a sección
   */
  addHorario = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const validatedData = createHorarioSeccionSchema.parse({
        ...req.body,
        seccionId: id
      });

      const horario = await this.service.addHorario(validatedData);

      logger.info(`Horario agregado a sección ${id}: ${horario.diaSemana} ${horario.horaInicio}-${horario.horaFin}`);

      const response: ApiResponse = {
        success: true,
        data: horario,
        message: 'Horario agregado exitosamente'
      };

      res.status(201).json(response);
    } catch (error: any) {
      logger.error(`Error al agregar horario a sección ${req.params.id}:`, error);
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Error al agregar horario'
      };
      res.status(400).json(response);
    }
  };

  /**
   * PUT /api/secciones/horarios/:horarioId
   * Actualizar horario
   */
  updateHorario = async (req: Request, res: Response): Promise<void> => {
    try {
      const { horarioId } = req.params;
      const validatedData = updateHorarioSeccionSchema.parse(req.body);

      const horario = await this.service.updateHorario(horarioId, validatedData);

      logger.info(`Horario actualizado: ${horarioId}`);

      const response: ApiResponse = {
        success: true,
        data: horario,
        message: 'Horario actualizado exitosamente'
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error(`Error al actualizar horario ${req.params.horarioId}:`, error);
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Error al actualizar horario'
      };
      res.status(400).json(response);
    }
  };

  /**
   * DELETE /api/secciones/horarios/:horarioId
   * Eliminar horario
   */
  deleteHorario = async (req: Request, res: Response): Promise<void> => {
    try {
      const { horarioId } = req.params;

      await this.service.deleteHorario(horarioId);

      logger.info(`Horario eliminado: ${horarioId}`);

      const response: ApiResponse = {
        success: true,
        message: 'Horario eliminado exitosamente'
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error(`Error al eliminar horario ${req.params.horarioId}:`, error);
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Error al eliminar horario'
      };
      res.status(400).json(response);
    }
  };

  // ============================================================================
  // GESTIÓN DE DOCENTES
  // ============================================================================

  /**
   * POST /api/secciones/:id/docentes
   * Asignar docente a sección
   */
  addDocente = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { docenteId } = addDocenteSeccionSchema.parse(req.body);

      const seccion = await this.service.addDocente(id, docenteId);

      logger.info(`Docente ${docenteId} asignado a sección ${id}`);

      const response: ApiResponse = {
        success: true,
        data: seccion,
        message: 'Docente asignado exitosamente'
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error(`Error al asignar docente a sección ${req.params.id}:`, error);
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Error al asignar docente'
      };
      res.status(400).json(response);
    }
  };

  /**
   * DELETE /api/secciones/:id/docentes/:docenteId
   * Remover docente de sección
   */
  removeDocente = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, docenteId } = req.params;

      const seccion = await this.service.removeDocente(id, docenteId);

      logger.info(`Docente ${docenteId} removido de sección ${id}`);

      const response: ApiResponse = {
        success: true,
        data: seccion,
        message: 'Docente removido exitosamente'
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error(`Error al remover docente de sección ${req.params.id}:`, error);
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Error al remover docente'
      };
      res.status(400).json(response);
    }
  };

  // ============================================================================
  // GESTIÓN DE PARTICIPACIONES
  // ============================================================================

  /**
   * POST /api/secciones/:id/participantes
   * Inscribir participante en sección
   */
  inscribirParticipante = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const validatedData = createParticipacionSeccionSchema.parse({
        ...req.body,
        seccionId: id
      });

      const participacion = await this.service.inscribirParticipante(validatedData);

      logger.info(`Participante inscrito en sección ${id}`, {
        personaId: participacion.personaId
      });

      const response: ApiResponse = {
        success: true,
        data: participacion,
        message: 'Participante inscrito exitosamente'
      };

      res.status(201).json(response);
    } catch (error: any) {
      logger.error(`Error al inscribir participante en sección ${req.params.id}:`, error);
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Error al inscribir participante'
      };
      res.status(400).json(response);
    }
  };

  /**
   * GET /api/secciones/:id/participantes
   * Listar participantes de sección
   */
  listarParticipantes = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { activas } = req.query;
      const soloActivas = activas !== 'false';

      const participantes = await this.service.listarParticipantes(id, soloActivas);

      const response: ApiResponse = {
        success: true,
        data: participantes
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error(`Error al listar participantes de sección ${req.params.id}:`, error);
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Error al listar participantes'
      };
      res.status(400).json(response);
    }
  };

  /**
   * PUT /api/secciones/participaciones/:participacionId
   * Actualizar participación
   */
  updateParticipacion = async (req: Request, res: Response): Promise<void> => {
    try {
      const { participacionId } = req.params;
      const validatedData = updateParticipacionSeccionSchema.parse(req.body);

      const participacion = await this.service.updateParticipacion(participacionId, validatedData);

      logger.info(`Participación actualizada: ${participacionId}`);

      const response: ApiResponse = {
        success: true,
        data: participacion,
        message: 'Participación actualizada exitosamente'
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error(`Error al actualizar participación ${req.params.participacionId}:`, error);
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Error al actualizar participación'
      };
      res.status(400).json(response);
    }
  };

  /**
   * POST /api/secciones/participaciones/:participacionId/baja
   * Dar de baja participación
   */
  bajaParticipacion = async (req: Request, res: Response): Promise<void> => {
    try {
      const { participacionId } = req.params;
      const { fechaFin } = req.body;

      const participacion = await this.service.bajaParticipacion(
        participacionId,
        fechaFin ? new Date(fechaFin) : undefined
      );

      logger.info(`Participación dada de baja: ${participacionId}`);

      const response: ApiResponse = {
        success: true,
        data: participacion,
        message: 'Participación dada de baja exitosamente'
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error(`Error al dar de baja participación ${req.params.participacionId}:`, error);
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Error al dar de baja participación'
      };
      res.status(400).json(response);
    }
  };

  /**
   * GET /api/personas/:personaId/secciones
   * Listar secciones de una persona
   */
  listarSeccionesPersona = async (req: Request, res: Response): Promise<void> => {
    try {
      const { personaId } = req.params;
      const { activas } = req.query;
      const soloActivas = activas !== 'false';

      const secciones = await this.service.listarSeccionesPersona(personaId, soloActivas);

      const response: ApiResponse = {
        success: true,
        data: secciones
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error(`Error al listar secciones de persona ${req.params.personaId}:`, error);
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Error al listar secciones'
      };
      res.status(400).json(response);
    }
  };

  // ============================================================================
  // GESTIÓN DE RESERVAS DE AULAS
  // ============================================================================

  /**
   * POST /api/secciones/:id/reservas-aulas
   * Crear reserva de aula para sección
   */
  createReservaAula = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const validatedData = createReservaAulaSeccionSchema.parse({
        ...req.body,
        seccionId: id
      });

      const reserva = await this.service.createReservaAula(validatedData);

      logger.info(`Reserva de aula creada para sección ${id}`, {
        aulaId: reserva.aulaId
      });

      const response: ApiResponse = {
        success: true,
        data: reserva,
        message: 'Reserva de aula creada exitosamente'
      };

      res.status(201).json(response);
    } catch (error: any) {
      logger.error(`Error al crear reserva de aula para sección ${req.params.id}:`, error);
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Error al crear reserva de aula'
      };
      res.status(400).json(response);
    }
  };

  /**
   * PUT /api/secciones/reservas-aulas/:reservaId
   * Actualizar reserva de aula
   */
  updateReservaAula = async (req: Request, res: Response): Promise<void> => {
    try {
      const { reservaId } = req.params;
      const validatedData = updateReservaAulaSeccionSchema.parse(req.body);

      const reserva = await this.service.updateReservaAula(reservaId, validatedData);

      logger.info(`Reserva de aula actualizada: ${reservaId}`);

      const response: ApiResponse = {
        success: true,
        data: reserva,
        message: 'Reserva de aula actualizada exitosamente'
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error(`Error al actualizar reserva de aula ${req.params.reservaId}:`, error);
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Error al actualizar reserva de aula'
      };
      res.status(400).json(response);
    }
  };

  /**
   * DELETE /api/secciones/reservas-aulas/:reservaId
   * Eliminar reserva de aula
   */
  deleteReservaAula = async (req: Request, res: Response): Promise<void> => {
    try {
      const { reservaId } = req.params;

      await this.service.deleteReservaAula(reservaId);

      logger.info(`Reserva de aula eliminada: ${reservaId}`);

      const response: ApiResponse = {
        success: true,
        message: 'Reserva de aula eliminada exitosamente'
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error(`Error al eliminar reserva de aula ${req.params.reservaId}:`, error);
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Error al eliminar reserva de aula'
      };
      res.status(400).json(response);
    }
  };

  // ============================================================================
  // VALIDACIONES
  // ============================================================================

  /**
   * POST /api/secciones/verificar-conflictos
   * Verificar conflictos de horarios
   */
  verificarConflictos = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = verificarConflictoSeccionSchema.parse(req.body);

      const conflictos = await this.service.verificarConflictos(validatedData);

      const response: ApiResponse = {
        success: true,
        data: {
          tieneConflictos: conflictos.length > 0,
          conflictos
        }
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Error al verificar conflictos:', error);
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Error al verificar conflictos'
      };
      res.status(400).json(response);
    }
  };

  // ============================================================================
  // REPORTES Y ESTADÍSTICAS
  // ============================================================================

  /**
   * GET /api/secciones/:id/estadisticas
   * Obtener estadísticas de una sección
   */
  getEstadisticas = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const estadisticas = await this.service.getEstadisticasSeccion(id);

      const response: ApiResponse = {
        success: true,
        data: estadisticas
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error(`Error al obtener estadísticas de sección ${req.params.id}:`, error);
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Error al obtener estadísticas'
      };
      res.status(400).json(response);
    }
  };

  /**
   * GET /api/docentes/:docenteId/carga-horaria
   * Obtener carga horaria de un docente
   */
  getCargaHorariaDocente = async (req: Request, res: Response): Promise<void> => {
    try {
      const { docenteId } = req.params;

      const cargaHoraria = await this.service.getCargaHorariaDocente(docenteId);

      const response: ApiResponse = {
        success: true,
        data: cargaHoraria
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error(`Error al obtener carga horaria del docente ${req.params.docenteId}:`, error);
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Error al obtener carga horaria'
      };
      res.status(400).json(response);
    }
  };

  /**
   * GET /api/secciones/horario-semanal
   * Obtener horario semanal de todas las secciones
   */
  getHorarioSemanal = async (req: Request, res: Response): Promise<void> => {
    try {
      const horarioSemanal = await this.service.getHorarioSemanal();

      const response: ApiResponse = {
        success: true,
        data: horarioSemanal
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Error al obtener horario semanal:', error);
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Error al obtener horario semanal'
      };
      res.status(500).json(response);
    }
  };

  /**
   * GET /api/secciones/ocupacion
   * Obtener ocupación global de secciones
   */
  getOcupacionSecciones = async (req: Request, res: Response): Promise<void> => {
    try {
      const ocupacion = await this.service.getOcupacionSecciones();

      const response: ApiResponse = {
        success: true,
        data: ocupacion
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Error al obtener ocupación de secciones:', error);
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Error al obtener ocupación'
      };
      res.status(500).json(response);
    }
  };

  /**
   * GET /api/actividades/:actividadId/secciones
   * Obtener secciones de una actividad
   */
  getSeccionesByActividad = async (req: Request, res: Response): Promise<void> => {
    try {
      const { actividadId } = req.params;

      const secciones = await this.service.getSeccionesByActividad(actividadId);

      const response: ApiResponse = {
        success: true,
        data: secciones
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error(`Error al obtener secciones de actividad ${req.params.actividadId}:`, error);
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Error al obtener secciones'
      };
      res.status(400).json(response);
    }
  };
}
