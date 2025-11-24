import { Request, Response, NextFunction } from 'express';
import { AulaService } from '@/services/aula.service';
import {
  createAulaSchema,
  updateAulaSchema,
  aulaQuerySchema,
  disponibilidadAulaSchema,
  estadisticasAulaSchema
} from '@/dto/aula.dto';
import { asignarEquipamientoAulaSchema, actualizarCantidadEquipamientoSchema } from '@/dto/equipamiento.dto';
import { ApiResponse } from '@/types/interfaces';
import { HttpStatus } from '@/types/enums';

export class AulaController {
  constructor(private aulaService: AulaService) {}

  async createAula(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('🔍 [DEBUG] POST /api/aulas - Request body:', JSON.stringify(req.body, null, 2));
      const validatedData = createAulaSchema.parse(req.body);
      console.log('✅ [DEBUG] Validation passed:', JSON.stringify(validatedData, null, 2));
      const aula = await this.aulaService.createAula(validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Aula creada exitosamente',
        data: aula
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getAulas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = aulaQuerySchema.parse(req.query);
      const result = await this.aulaService.getAulas(query);

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

  async getAulaById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const aula = await this.aulaService.getAulaById(id);

      if (!aula) {
        const response: ApiResponse = {
          success: false,
          error: 'Aula no encontrada'
        };
        res.status(HttpStatus.NOT_FOUND).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: aula
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateAula(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateAulaSchema.parse(req.body);
      const aula = await this.aulaService.updateAula(id, validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Aula actualizada exitosamente',
        data: aula
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteAula(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { hard } = req.query;
      const isHardDelete = hard === 'true';

      const aula = await this.aulaService.deleteAula(id, isHardDelete);

      const response: ApiResponse = {
        success: true,
        message: `Aula ${isHardDelete ? 'eliminada permanentemente' : 'dada de baja'}`,
        data: aula
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getAulasDisponibles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const aulas = await this.aulaService.getAulasDisponibles();

      const response: ApiResponse = {
        success: true,
        data: aulas
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async verificarDisponibilidad(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = disponibilidadAulaSchema.parse(req.body);

      const resultado = await this.aulaService.verificarDisponibilidad(id, validatedData);

      const response: ApiResponse = {
        success: true,
        data: resultado
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getEstadisticas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const estadisticas = await this.aulaService.getEstadisticas(id);

      const response: ApiResponse = {
        success: true,
        data: estadisticas
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getAulasConMenorUso(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const aulas = await this.aulaService.getAulasConMenorUso();

      const response: ApiResponse = {
        success: true,
        data: aulas
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async searchAulas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q: searchTerm } = req.query;

      if (!searchTerm || typeof searchTerm !== 'string') {
        const response: ApiResponse = {
          success: false,
          error: 'Parámetro de búsqueda "q" es requerido'
        };
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }

      const aulas = await this.aulaService.searchAulas(searchTerm);

      const response: ApiResponse = {
        success: true,
        data: aulas
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getAulasPorCapacidad(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { capacidad } = req.query;

      if (!capacidad || isNaN(Number(capacidad))) {
        const response: ApiResponse = {
          success: false,
          error: 'Parámetro de capacidad es requerido y debe ser un número'
        };
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }

      const aulas = await this.aulaService.getAulasPorCapacidad(Number(capacidad));

      const response: ApiResponse = {
        success: true,
        data: aulas
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getAulasConEquipamiento(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const aulas = await this.aulaService.getAulasConEquipamiento();

      const response: ApiResponse = {
        success: true,
        data: aulas
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getReservasDelAula(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { fechaDesde, fechaHasta } = req.query;

      // Validar fechas si se proporcionan
      let fechaDesdeStr: string | undefined;
      let fechaHastaStr: string | undefined;

      if (fechaDesde && typeof fechaDesde === 'string') {
        try {
          new Date(fechaDesde); // Validar formato
          fechaDesdeStr = fechaDesde;
        } catch {
          const response: ApiResponse = {
            success: false,
            error: 'Formato de fechaDesde inválido. Use formato ISO: YYYY-MM-DDTHH:mm:ss.sssZ'
          };
          res.status(HttpStatus.BAD_REQUEST).json(response);
          return;
        }
      }

      if (fechaHasta && typeof fechaHasta === 'string') {
        try {
          new Date(fechaHasta); // Validar formato
          fechaHastaStr = fechaHasta;
        } catch {
          const response: ApiResponse = {
            success: false,
            error: 'Formato de fechaHasta inválido. Use formato ISO: YYYY-MM-DDTHH:mm:ss.sssZ'
          };
          res.status(HttpStatus.BAD_REQUEST).json(response);
          return;
        }
      }

      const reservas = await this.aulaService.getReservasDelAula(id, fechaDesdeStr, fechaHastaStr);

      const response: ApiResponse = {
        success: true,
        data: reservas
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // MÉTODOS PARA GESTIÓN DE EQUIPAMIENTOS
  // ============================================================================

  async addEquipamientoToAula(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = asignarEquipamientoAulaSchema.parse(req.body);

      const aulaEquipamiento = await this.aulaService.addEquipamientoToAula(
        parseInt(id),
        validatedData.equipamientoId,
        validatedData.cantidad,
        validatedData.observaciones
      );

      const response: ApiResponse = {
        success: true,
        message: 'Equipamiento asignado al aula exitosamente',
        data: aulaEquipamiento
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  async removeEquipamientoFromAula(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, equipamientoId } = req.params;

      await this.aulaService.removeEquipamientoFromAula(parseInt(id), parseInt(equipamientoId));

      const response: ApiResponse = {
        success: true,
        message: 'Equipamiento removido del aula exitosamente'
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateEquipamientoCantidad(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, equipamientoId } = req.params;
      const validatedData = actualizarCantidadEquipamientoSchema.parse(req.body);

      const updated = await this.aulaService.updateEquipamientoCantidad(
        parseInt(id),
        parseInt(equipamientoId),
        validatedData.cantidad,
        validatedData.observaciones
      );

      const response: ApiResponse = {
        success: true,
        message: 'Cantidad de equipamiento actualizada exitosamente',
        data: updated
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getEquipamientosDeAula(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const equipamientos = await this.aulaService.getEquipamientosDeAula(parseInt(id));

      const response: ApiResponse = {
        success: true,
        data: equipamientos
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}