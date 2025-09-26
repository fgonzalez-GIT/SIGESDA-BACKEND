import { Request, Response, NextFunction } from 'express';
import { ActividadService } from '@/services/actividad.service';
import {
  createActividadSchema,
  updateActividadSchema,
  actividadQuerySchema,
  asignarDocenteSchema,
  estadisticasActividadSchema
} from '@/dto/actividad.dto';
import { ApiResponse } from '@/types/interfaces';
import { HttpStatus } from '@/types/enums';
import { TipoActividad } from '@prisma/client';

export class ActividadController {
  constructor(private actividadService: ActividadService) {}

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

  async getActividades(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = actividadQuerySchema.parse(req.query);
      const result = await this.actividadService.getActividades(query);

      const response: ApiResponse = {
        success: true,
        data: result.data,
        meta: {
          page: query.page,
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

  async getActividadById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const actividad = await this.actividadService.getActividadById(id);

      if (!actividad) {
        const response: ApiResponse = {
          success: false,
          error: 'Actividad no encontrada'
        };
        res.status(HttpStatus.NOT_FOUND).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: actividad
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateActividad(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
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

  async deleteActividad(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { hard } = req.query;
      const isHardDelete = hard === 'true';

      const actividad = await this.actividadService.deleteActividad(id, isHardDelete);

      const response: ApiResponse = {
        success: true,
        message: `Actividad ${isHardDelete ? 'eliminada permanentemente' : 'dada de baja'}`,
        data: actividad
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getCoros(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const coros = await this.actividadService.getCoros();

      const response: ApiResponse = {
        success: true,
        data: coros
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getClasesInstrumento(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clases = await this.actividadService.getClasesInstrumento();

      const response: ApiResponse = {
        success: true,
        data: clases
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getClasesCanto(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clases = await this.actividadService.getClasesCanto();

      const response: ApiResponse = {
        success: true,
        data: clases
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async asignarDocente(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: actividadId } = req.params;
      const { docenteId } = asignarDocenteSchema.parse({
        actividadId,
        docenteId: req.body.docenteId
      });

      const actividad = await this.actividadService.asignarDocente(actividadId, docenteId);

      const response: ApiResponse = {
        success: true,
        message: 'Docente asignado exitosamente',
        data: actividad
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async desasignarDocente(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: actividadId, docenteId } = req.params;

      const actividad = await this.actividadService.desasignarDocente(actividadId, docenteId);

      const response: ApiResponse = {
        success: true,
        message: 'Docente desasignado exitosamente',
        data: actividad
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getParticipantes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const participantes = await this.actividadService.getParticipantes(id);

      const response: ApiResponse = {
        success: true,
        data: participantes
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getEstadisticas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const estadisticas = await this.actividadService.getEstadisticas(id);

      const response: ApiResponse = {
        success: true,
        data: estadisticas
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

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

  async searchActividades(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q: searchTerm, tipo } = req.query;

      if (!searchTerm || typeof searchTerm !== 'string') {
        const response: ApiResponse = {
          success: false,
          error: 'Parámetro de búsqueda "q" es requerido'
        };
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }

      // Validar tipo si se proporciona
      let tipoActividad: TipoActividad | undefined;
      if (tipo) {
        if (Object.values(TipoActividad).includes(tipo as TipoActividad)) {
          tipoActividad = tipo as TipoActividad;
        } else {
          const response: ApiResponse = {
            success: false,
            error: `Tipo de actividad inválido. Valores válidos: ${Object.values(TipoActividad).join(', ')}`
          };
          res.status(HttpStatus.BAD_REQUEST).json(response);
          return;
        }
      }

      const actividades = await this.actividadService.searchActividades(searchTerm, tipoActividad);

      const response: ApiResponse = {
        success: true,
        data: actividades
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}