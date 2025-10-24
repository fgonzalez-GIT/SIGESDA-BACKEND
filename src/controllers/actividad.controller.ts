import { Request, Response, NextFunction } from 'express';
import { ActividadService } from '@/services/actividad.service';
import {
  createActividadSchema,
  updateActividadSchema,
  queryActividadesSchema,
  cambiarEstadoActividadSchema,
  duplicarActividadSchema
} from '@/dto/actividad-v2.dto';
import { ApiResponse } from '@/types/interfaces';
import { HttpStatus } from '@/types/enums';

/**
 * Controller para manejo de endpoints de Actividades V2.0
 */
export class ActividadController {
  constructor(private actividadService: ActividadService) {}

  /**
   * POST /api/actividades
   * Crea una nueva actividad
   */
  async createActividad(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createActividadSchema.parse(req.body);
      const actividad = await this.actividadService.createActividad(validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Actividad creada exitosamente',
        data: actividad
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/actividades
   * Obtiene todas las actividades con filtros y paginación
   */
  async getActividades(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = queryActividadesSchema.parse(req.query);
      const result = await this.actividadService.getActividades(query);

      const response: ApiResponse = {
        success: true,
        data: {
          data: result.data,
          total: result.total,
          page: query.page,
          limit: query.limit,
          pages: result.pages
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/actividades/:id
   * Obtiene una actividad por ID
   */
  async getActividadById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        const response: ApiResponse = {
          success: false,
          error: 'ID de actividad inválido'
        };
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }

      const actividad = await this.actividadService.getActividadById(id);

      const response: ApiResponse = {
        success: true,
        data: actividad
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/actividades/codigo/:codigo
   * Obtiene una actividad por código
   */
  async getActividadByCodigo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { codigo } = req.params;
      const actividad = await this.actividadService.getActividadByCodigo(codigo);

      const response: ApiResponse = {
        success: true,
        data: actividad
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/actividades/:id
   * Actualiza una actividad
   */
  async updateActividad(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        const response: ApiResponse = {
          success: false,
          error: 'ID de actividad inválido'
        };
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }

      const validatedData = updateActividadSchema.parse(req.body);
      const actividad = await this.actividadService.updateActividad(id, validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Actividad actualizada exitosamente',
        data: actividad
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/actividades/:id
   * Elimina una actividad
   */
  async deleteActividad(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        const response: ApiResponse = {
          success: false,
          error: 'ID de actividad inválido'
        };
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }

      const result = await this.actividadService.deleteActividad(id);

      const response: ApiResponse = {
        success: true,
        message: result.message
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/actividades/:id/estado
   * Cambia el estado de una actividad
   */
  async cambiarEstado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        const response: ApiResponse = {
          success: false,
          error: 'ID de actividad inválido'
        };
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }

      const validatedData = cambiarEstadoActividadSchema.parse(req.body);
      const actividad = await this.actividadService.cambiarEstado(
        id,
        validatedData.nuevoEstadoId,
        validatedData.observaciones ?? undefined
      );

      const response: ApiResponse = {
        success: true,
        message: 'Estado de actividad cambiado exitosamente',
        data: actividad
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  // ==================== HORARIOS ====================

  /**
   * POST /api/actividades/:id/horarios
   * Agrega un horario a una actividad
   */
  async agregarHorario(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actividadId = parseInt(req.params.id);

      if (isNaN(actividadId)) {
        const response: ApiResponse = {
          success: false,
          error: 'ID de actividad inválido'
        };
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }

      const horario = await this.actividadService.agregarHorario(actividadId, req.body);

      const response: ApiResponse = {
        success: true,
        message: 'Horario agregado exitosamente',
        data: horario
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/actividades/:id/horarios
   * Obtiene todos los horarios de una actividad
   */
  async getHorariosByActividad(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actividadId = parseInt(req.params.id);

      if (isNaN(actividadId)) {
        const response: ApiResponse = {
          success: false,
          error: 'ID de actividad inválido'
        };
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }

      const horarios = await this.actividadService.getHorariosByActividad(actividadId);

      const response: ApiResponse = {
        success: true,
        data: horarios
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/actividades/horarios/:horarioId
   * Actualiza un horario
   */
  async actualizarHorario(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const horarioId = parseInt(req.params.horarioId);

      if (isNaN(horarioId)) {
        const response: ApiResponse = {
          success: false,
          error: 'ID de horario inválido'
        };
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }

      const horario = await this.actividadService.actualizarHorario(horarioId, req.body);

      const response: ApiResponse = {
        success: true,
        message: 'Horario actualizado exitosamente',
        data: horario
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/actividades/horarios/:horarioId
   * Elimina un horario
   */
  async eliminarHorario(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const horarioId = parseInt(req.params.horarioId);

      if (isNaN(horarioId)) {
        const response: ApiResponse = {
          success: false,
          error: 'ID de horario inválido'
        };
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }

      const result = await this.actividadService.eliminarHorario(horarioId);

      const response: ApiResponse = {
        success: true,
        message: result.message
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  // ==================== DOCENTES ====================

  /**
   * POST /api/actividades/:id/docentes
   * Asigna un docente a una actividad
   */
  async asignarDocente(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actividadId = parseInt(req.params.id);

      if (isNaN(actividadId)) {
        const response: ApiResponse = {
          success: false,
          error: 'ID de actividad inválido'
        };
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }

      const { docenteId, rolDocenteId, observaciones } = req.body;

      if (!docenteId || !rolDocenteId) {
        const response: ApiResponse = {
          success: false,
          error: 'docenteId y rolDocenteId son requeridos'
        };
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }

      const docenteIdParsed = parseInt(docenteId);
      const rolDocenteIdParsed = parseInt(rolDocenteId);

      if (isNaN(docenteIdParsed) || isNaN(rolDocenteIdParsed)) {
        const response: ApiResponse = {
          success: false,
          error: 'docenteId y rolDocenteId deben ser números válidos'
        };
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }

      const asignacion = await this.actividadService.asignarDocente(
        actividadId,
        docenteIdParsed,
        rolDocenteIdParsed,
        observaciones
      );

      const response: ApiResponse = {
        success: true,
        message: 'Docente asignado exitosamente',
        data: asignacion
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/actividades/:id/docentes/:docenteId/rol/:rolDocenteId
   * Desasigna un docente de una actividad
   */
  async desasignarDocente(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actividadId = parseInt(req.params.id);
      const docenteId = parseInt(req.params.docenteId);
      const rolDocenteId = parseInt(req.params.rolDocenteId);

      if (isNaN(actividadId) || isNaN(docenteId) || isNaN(rolDocenteId)) {
        const response: ApiResponse = {
          success: false,
          error: 'IDs inválidos'
        };
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }

      const desasignacion = await this.actividadService.desasignarDocente(
        actividadId,
        docenteId,
        rolDocenteId
      );

      const response: ApiResponse = {
        success: true,
        message: 'Docente desasignado exitosamente',
        data: desasignacion
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/actividades/:id/docentes
   * Obtiene docentes de una actividad
   */
  async getDocentesByActividad(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actividadId = parseInt(req.params.id);

      if (isNaN(actividadId)) {
        const response: ApiResponse = {
          success: false,
          error: 'ID de actividad inválido'
        };
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }

      const docentes = await this.actividadService.getDocentesByActividad(actividadId);

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
   * GET /api/actividades/docentes/disponibles
   * Obtiene docentes disponibles
   */
  async getDocentesDisponibles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const docentes = await this.actividadService.getDocentesDisponibles();

      const response: ApiResponse = {
        success: true,
        data: docentes
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  // ==================== PARTICIPACIONES ====================

  /**
   * GET /api/actividades/:id/participantes
   * Obtiene participantes de una actividad
   */
  async getParticipantes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actividadId = parseInt(req.params.id);

      if (isNaN(actividadId)) {
        const response: ApiResponse = {
          success: false,
          error: 'ID de actividad inválido'
        };
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }

      const participantes = await this.actividadService.getParticipantes(actividadId);

      const response: ApiResponse = {
        success: true,
        data: participantes
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/actividades/:id/participantes
   * Inscribe un participante a una actividad
   */
  async addParticipante(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actividadId = parseInt(req.params.id);

      if (isNaN(actividadId)) {
        const response: ApiResponse = {
          success: false,
          error: 'ID de actividad inválido'
        };
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }

      const { persona_id, fecha_inicio, observaciones } = req.body;

      if (!persona_id || !fecha_inicio) {
        const response: ApiResponse = {
          success: false,
          error: 'persona_id y fecha_inicio son requeridos'
        };
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }

      const personaIdParsed = parseInt(persona_id);

      if (isNaN(personaIdParsed)) {
        const response: ApiResponse = {
          success: false,
          error: 'persona_id debe ser un número válido'
        };
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }

      const participacion = await this.actividadService.addParticipante(
        actividadId,
        personaIdParsed,
        fecha_inicio,
        observaciones
      );

      const response: ApiResponse = {
        success: true,
        message: 'Participante inscrito exitosamente',
        data: participacion
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/actividades/:id/participantes/:participanteId
   * Elimina un participante de una actividad
   */
  async deleteParticipante(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actividadId = parseInt(req.params.id);
      const participanteId = parseInt(req.params.participanteId);

      if (isNaN(actividadId) || isNaN(participanteId)) {
        const response: ApiResponse = {
          success: false,
          error: 'IDs inválidos'
        };
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }

      const participacion = await this.actividadService.deleteParticipante(
        actividadId,
        participanteId
      );

      const response: ApiResponse = {
        success: true,
        message: 'Participante eliminado exitosamente',
        data: participacion
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/actividades/:id/estadisticas
   * Obtiene estadísticas de una actividad
   */
  async getEstadisticas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actividadId = parseInt(req.params.id);

      if (isNaN(actividadId)) {
        const response: ApiResponse = {
          success: false,
          error: 'ID de actividad inválido'
        };
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }

      const estadisticas = await this.actividadService.getEstadisticas(actividadId);

      const response: ApiResponse = {
        success: true,
        data: estadisticas
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  // ==================== CATÁLOGOS ====================

  /**
   * GET /api/actividades/catalogos/todos
   * Obtiene todos los catálogos necesarios
   */
  async getCatalogos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const catalogos = await this.actividadService.getCatalogos();

      const response: ApiResponse = {
        success: true,
        data: catalogos
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/actividades/catalogos/tipos
   * Obtiene tipos de actividades
   */
  async getTiposActividades(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tipos = await this.actividadService.getTiposActividades();

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
   * GET /api/actividades/catalogos/categorias
   * Obtiene categorías de actividades
   */
  async getCategoriasActividades(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categorias = await this.actividadService.getCategoriasActividades();

      const response: ApiResponse = {
        success: true,
        data: categorias
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/actividades/catalogos/estados
   * Obtiene estados de actividades
   */
  async getEstadosActividades(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const estados = await this.actividadService.getEstadosActividades();

      const response: ApiResponse = {
        success: true,
        data: estados
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/actividades/catalogos/dias-semana
   * Obtiene días de la semana
   */
  async getDiasSemana(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dias = await this.actividadService.getDiasSemana();

      const response: ApiResponse = {
        success: true,
        data: dias
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/actividades/catalogos/roles-docentes
   * Obtiene roles de docentes
   */
  async getRolesDocentes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const roles = await this.actividadService.getRolesDocentes();

      const response: ApiResponse = {
        success: true,
        data: roles
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  // ==================== CONSULTAS ESPECIALES ====================

  /**
   * POST /api/actividades/:id/duplicar
   * Duplica una actividad
   */
  async duplicarActividad(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idOriginal = parseInt(req.params.id);

      if (isNaN(idOriginal)) {
        const response: ApiResponse = {
          success: false,
          error: 'ID de actividad inválido'
        };
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }

      const validatedData = duplicarActividadSchema.parse(req.body);

      const nuevaActividad = await this.actividadService.duplicarActividad(
        idOriginal,
        validatedData.nuevoCodigoActividad,
        validatedData.nuevoNombre,
        validatedData.nuevaFechaDesde,
        validatedData.nuevaFechaHasta,
        validatedData.copiarHorarios,
        validatedData.copiarDocentes
      );

      const response: ApiResponse = {
        success: true,
        message: 'Actividad duplicada exitosamente',
        data: nuevaActividad
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/actividades/reportes/por-tipo
   * Obtiene resumen de actividades agrupadas por tipo
   */
  async getResumenPorTipo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resumen = await this.actividadService.getResumenPorTipo();

      const response: ApiResponse = {
        success: true,
        data: resumen
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/actividades/reportes/horario-semanal
   * Obtiene horario semanal completo
   */
  async getHorarioSemanal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const horarioSemanal = await this.actividadService.getHorarioSemanal();

      const response: ApiResponse = {
        success: true,
        data: horarioSemanal
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}
