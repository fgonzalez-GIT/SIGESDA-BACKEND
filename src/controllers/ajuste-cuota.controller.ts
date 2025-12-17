import { Request, Response, NextFunction } from 'express';
import { AjusteCuotaService } from '@/services/ajuste-cuota.service';
import { HistorialAjusteCuotaRepository } from '@/repositories/historial-ajuste-cuota.repository';
import {
  createAjusteCuotaSchema,
  updateAjusteCuotaSchema,
  queryAjusteCuotaSchema,
  queryHistorialAjusteCuotaSchema
} from '@/dto/ajuste-cuota.dto';
import { ApiResponse } from '@/types/interfaces';
import { HttpStatus } from '@/types/enums';

/**
 * Controller for managing manual adjustments to cuotas
 * FASE 4: Task 4.1 - Ajustes manuales por socio
 */
export class AjusteCuotaController {
  constructor(
    private service: AjusteCuotaService,
    private historialRepository: HistorialAjusteCuotaRepository
  ) {}

  /**
   * @swagger
   * /api/ajustes-cuota:
   *   post:
   *     summary: Crear ajuste manual a cuota ⭐ FASE 4
   *     description: |
   *       Crea un ajuste manual (descuento o recargo) que se aplicará a las cuotas de un socio.
   *       **Tipos de ajuste**:
   *       - DESCUENTO_FIJO: Monto fijo a descontar
   *       - DESCUENTO_PORCENTAJE: Porcentaje a descontar (0-100)
   *       - RECARGO_FIJO: Monto fijo a sumar
   *       - RECARGO_PORCENTAJE: Porcentaje a sumar
   *       **Rango de fechas**: Permite aplicar ajuste solo en un período específico
   *     tags: [Ajustes Manuales]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - personaId
   *               - tipoAjuste
   *               - valor
   *               - concepto
   *             properties:
   *               personaId:
   *                 type: integer
   *                 description: ID del socio
   *               tipoAjuste:
   *                 type: string
   *                 enum: [DESCUENTO_FIJO, DESCUENTO_PORCENTAJE, RECARGO_FIJO, RECARGO_PORCENTAJE]
   *                 description: Tipo de ajuste a aplicar
   *               valor:
   *                 type: number
   *                 description: Valor del ajuste (monto o porcentaje según tipo)
   *                 example: 500
   *               concepto:
   *                 type: string
   *                 description: Descripción/motivo del ajuste
   *                 example: "Descuento por situación económica familiar"
   *               fechaInicio:
   *                 type: string
   *                 format: date
   *                 description: Fecha inicio de aplicación (opcional, default = hoy)
   *               fechaFin:
   *                 type: string
   *                 format: date
   *                 description: Fecha fin de aplicación (opcional, sin límite si no se especifica)
   *               activo:
   *                 type: boolean
   *                 default: true
   *                 description: Si el ajuste está activo
   *               usuario:
   *                 type: string
   *                 description: Usuario que crea el ajuste (para auditoría)
   *     responses:
   *       201:
   *         description: Ajuste creado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/AjusteCuota'
   *       400:
   *         description: Datos inválidos
   *       404:
   *         description: Persona no encontrada
   */
  async createAjuste(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createAjusteCuotaSchema.parse(req.body);
      const usuario = req.body.usuario || 'sistema'; // TODO: Get from auth when implemented

      const ajuste = await this.service.createAjuste(validatedData, usuario);

      const response: ApiResponse = {
        success: true,
        message: 'Ajuste manual creado exitosamente',
        data: ajuste,
        meta: {
          ajusteId: ajuste.id,
          personaId: ajuste.personaId,
          tipoAjuste: ajuste.tipoAjuste
        }
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/ajustes-cuota/{id}:
   *   get:
   *     summary: Obtener ajuste por ID ⭐ FASE 4
   *     description: |
   *       Obtiene un ajuste manual específico por su ID.
   *       Incluye datos completos del ajuste con información de la persona asociada y historial reciente.
   *     tags: [Ajustes Manuales]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del ajuste
   *     responses:
   *       200:
   *         description: Ajuste encontrado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/AjusteCuota'
   *       404:
   *         description: Ajuste no encontrado
   */
  async getAjusteById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const ajuste = await this.service.getAjusteById(parseInt(id));

      if (!ajuste) {
        const response: ApiResponse = {
          success: false,
          error: `Ajuste con ID ${id} no encontrado`
        };
        res.status(HttpStatus.NOT_FOUND).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: ajuste
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/ajustes-cuota:
   *   get:
   *     summary: Obtener ajustes con filtros ⭐ FASE 4
   *     description: Lista todos los ajustes manuales con filtros opcionales (persona, activo, tipo)
   *     tags: [Ajustes Manuales]
   *     parameters:
   *       - in: query
   *         name: personaId
   *         schema:
   *           type: integer
   *         description: Filtrar por socio específico
   *       - in: query
   *         name: activo
   *         schema:
   *           type: boolean
   *         description: Filtrar solo ajustes activos/inactivos
   *       - in: query
   *         name: tipoAjuste
   *         schema:
   *           type: string
   *           enum: [DESCUENTO_FIJO, DESCUENTO_PORCENTAJE, RECARGO_FIJO, RECARGO_PORCENTAJE]
   *         description: Filtrar por tipo de ajuste
   *     responses:
   *       200:
   *         description: Lista de ajustes obtenida
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/AjusteCuota'
   */
  async getAjustes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = queryAjusteCuotaSchema.parse(req.query);
      const ajustes = await this.service.getAjustes(filters);

      const response: ApiResponse = {
        success: true,
        data: ajustes,
        meta: {
          total: ajustes.length,
          filters: filters
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/ajustes-cuota/persona/{personaId}:
   *   get:
   *     summary: Obtener ajustes de un socio ⭐ FASE 4
   *     description: |
   *       Obtiene todos los ajustes manuales de un socio específico.
   *       Permite filtrar solo ajustes activos o incluir también los inactivos.
   *     tags: [Ajustes Manuales]
   *     parameters:
   *       - in: path
   *         name: personaId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del socio
   *       - in: query
   *         name: soloActivos
   *         schema:
   *           type: boolean
   *           default: false
   *         description: Si true, retorna solo ajustes activos
   *     responses:
   *       200:
   *         description: Lista de ajustes del socio
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/AjusteCuota'
   *       404:
   *         description: Persona no encontrada
   */
  async getAjustesByPersona(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { personaId } = req.params;
      const { soloActivos } = req.query;

      const ajustes = await this.service.getAjustesByPersonaId(
        parseInt(personaId),
        soloActivos === 'true'
      );

      const response: ApiResponse = {
        success: true,
        data: ajustes,
        meta: {
          personaId: parseInt(personaId),
          total: ajustes.length,
          soloActivos: soloActivos === 'true'
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/ajustes-cuota/{id}:
   *   put:
   *     summary: Actualizar ajuste manual ⭐ FASE 4
   *     description: |
   *       Actualiza los datos de un ajuste manual existente.
   *       Permite modificar concepto, valor, fechas, scope y tipo de ajuste.
   *       Los cambios se registran automáticamente en el historial.
   *     tags: [Ajustes Manuales]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del ajuste a actualizar
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               tipoAjuste:
   *                 type: string
   *                 enum: [DESCUENTO_FIJO, DESCUENTO_PORCENTAJE, RECARGO_FIJO, RECARGO_PORCENTAJE]
   *               valor:
   *                 type: number
   *                 description: Nuevo valor del ajuste
   *               concepto:
   *                 type: string
   *                 description: Nueva descripción/motivo
   *               fechaInicio:
   *                 type: string
   *                 format: date
   *               fechaFin:
   *                 type: string
   *                 format: date
   *               scope:
   *                 type: string
   *                 enum: [MENSUAL, RANGO_FECHAS, PERMANENTE]
   *               usuario:
   *                 type: string
   *                 description: Usuario que realiza la actualización
   *     responses:
   *       200:
   *         description: Ajuste actualizado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/AjusteCuota'
   *       400:
   *         description: Datos inválidos
   *       404:
   *         description: Ajuste no encontrado
   */
  async updateAjuste(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateAjusteCuotaSchema.parse(req.body);
      const usuario = req.body.usuario || 'sistema';

      const ajuste = await this.service.updateAjuste(parseInt(id), validatedData, usuario);

      const response: ApiResponse = {
        success: true,
        message: 'Ajuste manual actualizado exitosamente',
        data: ajuste
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/ajustes-cuota/{id}/deactivate:
   *   post:
   *     summary: Desactivar ajuste (soft delete) ⭐ FASE 4
   *     description: |
   *       Desactiva un ajuste manual sin eliminarlo permanentemente.
   *       El ajuste deja de aplicarse a nuevas cuotas pero mantiene el historial.
   *       La acción se registra en el historial de cambios.
   *     tags: [Ajustes Manuales]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del ajuste a desactivar
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               usuario:
   *                 type: string
   *                 description: Usuario que desactiva el ajuste
   *               motivo:
   *                 type: string
   *                 description: Motivo de la desactivación
   *                 example: "Ya no aplica beneficio"
   *     responses:
   *       200:
   *         description: Ajuste desactivado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/AjusteCuota'
   *       404:
   *         description: Ajuste no encontrado
   */
  async deactivateAjuste(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { usuario, motivo } = req.body;

      const ajuste = await this.service.deactivateAjuste(parseInt(id), usuario, motivo);

      const response: ApiResponse = {
        success: true,
        message: 'Ajuste manual desactivado exitosamente',
        data: ajuste
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/ajustes-cuota/{id}/activate:
   *   post:
   *     summary: Reactivar ajuste ⭐ FASE 4
   *     description: |
   *       Reactiva un ajuste manual previamente desactivado.
   *       El ajuste vuelve a aplicarse a las cuotas futuras.
   *       La acción se registra en el historial de cambios.
   *     tags: [Ajustes Manuales]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del ajuste a reactivar
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               usuario:
   *                 type: string
   *                 description: Usuario que reactiva el ajuste
   *               motivo:
   *                 type: string
   *                 description: Motivo de la reactivación
   *                 example: "Se restablece beneficio"
   *     responses:
   *       200:
   *         description: Ajuste reactivado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/AjusteCuota'
   *       404:
   *         description: Ajuste no encontrado
   */
  async activateAjuste(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { usuario, motivo } = req.body;

      const ajuste = await this.service.activateAjuste(parseInt(id), usuario, motivo);

      const response: ApiResponse = {
        success: true,
        message: 'Ajuste manual reactivado exitosamente',
        data: ajuste
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/ajustes-cuota/{id}:
   *   delete:
   *     summary: Eliminar ajuste permanentemente ⭐ FASE 4
   *     description: |
   *       Elimina permanentemente un ajuste manual de la base de datos (hard delete).
   *       **PRECAUCIÓN**: Solo permitido si el ajuste NO ha sido aplicado a cuotas.
   *       Si el ajuste ya fue aplicado, se debe desactivar en lugar de eliminar.
   *       La eliminación se registra en el historial antes de borrarse.
   *     tags: [Ajustes Manuales]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del ajuste a eliminar
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               usuario:
   *                 type: string
   *                 description: Usuario que elimina el ajuste
   *               motivo:
   *                 type: string
   *                 description: Motivo de la eliminación
   *                 example: "Creado por error"
   *     responses:
   *       200:
   *         description: Ajuste eliminado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       400:
   *         description: No se puede eliminar (ya fue aplicado a cuotas)
   *       404:
   *         description: Ajuste no encontrado
   */
  async deleteAjuste(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { usuario, motivo } = req.body;

      await this.service.deleteAjuste(parseInt(id), usuario, motivo);

      const response: ApiResponse = {
        success: true,
        message: 'Ajuste manual eliminado permanentemente'
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/ajustes-cuota/stats:
   *   get:
   *     summary: Obtener estadísticas de ajustes ⭐ FASE 4
   *     description: |
   *       Obtiene estadísticas generales de los ajustes manuales.
   *       Incluye: total de ajustes, distribución por tipo, distribución por scope,
   *       montos totales de descuentos/recargos.
   *       Opcionalmente filtra por un socio específico.
   *     tags: [Ajustes Manuales]
   *     parameters:
   *       - in: query
   *         name: personaId
   *         schema:
   *           type: integer
   *         description: Filtrar estadísticas por socio específico (opcional)
   *     responses:
   *       200:
   *         description: Estadísticas obtenidas exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         totalAjustes:
   *                           type: integer
   *                         ajustesActivos:
   *                           type: integer
   *                         porTipo:
   *                           type: object
   *                           additionalProperties:
   *                             type: integer
   *                         porScope:
   *                           type: object
   *                           additionalProperties:
   *                             type: integer
   *                         montoTotalDescuentos:
   *                           type: number
   *                         montoTotalRecargos:
   *                           type: number
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
   * @swagger
   * /api/ajustes-cuota/calcular:
   *   post:
   *     summary: Calcular preview de ajuste ⭐ FASE 4
   *     description: |
   *       Simula cómo afectaría un ajuste a una cuota sin aplicarlo realmente.
   *       Útil para previsualizar el impacto antes de crear/modificar un ajuste.
   *       Retorna: monto original, monto con ajuste aplicado, y diferencia.
   *     tags: [Ajustes Manuales]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - ajusteId
   *               - montoOriginal
   *             properties:
   *               ajusteId:
   *                 type: integer
   *                 description: ID del ajuste a simular
   *               montoOriginal:
   *                 type: number
   *                 description: Monto base de la cuota
   *                 example: 5000
   *     responses:
   *       200:
   *         description: Cálculo realizado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         montoOriginal:
   *                           type: number
   *                           example: 5000
   *                         montoConAjuste:
   *                           type: number
   *                           example: 4250
   *                         diferencia:
   *                           type: number
   *                           example: -750
   *                         tipoAjuste:
   *                           type: string
   *                         valor:
   *                           type: number
   *       400:
   *         description: Faltan parámetros requeridos
   *       404:
   *         description: Ajuste no encontrado
   */
  async calcularAjuste(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ajusteId, montoOriginal } = req.body;

      if (!ajusteId || !montoOriginal) {
        const response: ApiResponse = {
          success: false,
          error: 'ajusteId y montoOriginal son requeridos'
        };
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }

      const ajuste = await this.service.getAjusteById(ajusteId);
      if (!ajuste) {
        const response: ApiResponse = {
          success: false,
          error: `Ajuste con ID ${ajusteId} no encontrado`
        };
        res.status(HttpStatus.NOT_FOUND).json(response);
        return;
      }

      const resultado = this.service.calcularAjuste(ajuste, montoOriginal);

      const response: ApiResponse = {
        success: true,
        data: resultado,
        meta: {
          ajusteId,
          montoOriginal
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/ajustes-cuota/{id}/historial:
   *   get:
   *     summary: Obtener historial de un ajuste ⭐ FASE 4
   *     description: |
   *       Obtiene el historial completo de cambios de un ajuste específico.
   *       Muestra todas las acciones: creación, modificaciones, activación/desactivación, eliminación.
   *       Incluye datos anteriores y nuevos de cada cambio, usuario responsable y observaciones.
   *     tags: [Ajustes Manuales]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del ajuste
   *     responses:
   *       200:
   *         description: Historial obtenido exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: integer
   *                           accion:
   *                             type: string
   *                             enum: [CREACION, MODIFICACION, ELIMINACION, ACTIVACION, DESACTIVACION]
   *                           datosAnteriores:
   *                             type: object
   *                           datosNuevos:
   *                             type: object
   *                           usuario:
   *                             type: string
   *                           observaciones:
   *                             type: string
   *                           createdAt:
   *                             type: string
   *                             format: date-time
   */
  async getHistorial(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const historial = await this.historialRepository.findByAjusteId(parseInt(id));

      const response: ApiResponse = {
        success: true,
        data: historial,
        meta: {
          ajusteId: parseInt(id),
          total: historial.length
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/historial-cuota:
   *   get:
   *     summary: Obtener historial global de ajustes ⭐ FASE 4
   *     description: |
   *       Obtiene el historial completo de todos los ajustes con filtros opcionales.
   *       Permite filtrar por persona, acción, rango de fechas.
   *       Soporta paginación (limit/offset).
   *     tags: [Ajustes Manuales]
   *     parameters:
   *       - in: query
   *         name: personaId
   *         schema:
   *           type: integer
   *         description: Filtrar por socio específico
   *       - in: query
   *         name: ajusteId
   *         schema:
   *           type: integer
   *         description: Filtrar por ajuste específico
   *       - in: query
   *         name: accion
   *         schema:
   *           type: string
   *           enum: [CREACION, MODIFICACION, ELIMINACION, ACTIVACION, DESACTIVACION]
   *         description: Filtrar por tipo de acción
   *       - in: query
   *         name: fechaDesde
   *         schema:
   *           type: string
   *           format: date
   *         description: Fecha inicio del rango
   *       - in: query
   *         name: fechaHasta
   *         schema:
   *           type: string
   *           format: date
   *         description: Fecha fin del rango
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 50
   *         description: Número de resultados por página
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           default: 0
   *         description: Desplazamiento para paginación
   *     responses:
   *       200:
   *         description: Historial obtenido exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: array
   *                       items:
   *                         type: object
   *                     meta:
   *                       type: object
   *                       properties:
   *                         total:
   *                           type: integer
   *                         limit:
   *                           type: integer
   *                         offset:
   *                           type: integer
   */
  async getAllHistorial(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = queryHistorialAjusteCuotaSchema.parse(req.query);

      const result = await this.historialRepository.findAll(filters);

      const response: ApiResponse = {
        success: true,
        data: result.data,
        meta: {
          total: result.total,
          limit: filters.limit,
          offset: filters.offset,
          filters: filters
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/historial-cuota/stats:
   *   get:
   *     summary: Obtener estadísticas del historial ⭐ FASE 4
   *     description: |
   *       Obtiene estadísticas del historial de cambios de ajustes.
   *       Incluye: total de acciones, distribución por tipo de acción,
   *       usuarios más activos, tendencias temporales.
   *       Permite filtrar por persona y rango de fechas.
   *     tags: [Ajustes Manuales]
   *     parameters:
   *       - in: query
   *         name: personaId
   *         schema:
   *           type: integer
   *         description: Filtrar estadísticas por socio específico
   *       - in: query
   *         name: fechaDesde
   *         schema:
   *           type: string
   *           format: date
   *         description: Fecha inicio del rango
   *       - in: query
   *         name: fechaHasta
   *         schema:
   *           type: string
   *           format: date
   *         description: Fecha fin del rango
   *     responses:
   *       200:
   *         description: Estadísticas obtenidas exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         totalAcciones:
   *                           type: integer
   *                         porAccion:
   *                           type: object
   *                           additionalProperties:
   *                             type: integer
   *                         usuariosMasActivos:
   *                           type: array
   *                           items:
   *                             type: object
   *                             properties:
   *                               usuario:
   *                                 type: string
   *                               cantidad:
   *                                 type: integer
   */
  async getHistorialStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { personaId, fechaDesde, fechaHasta } = req.query;

      const stats = await this.historialRepository.getStats({
        personaId: personaId ? parseInt(personaId as string) : undefined,
        fechaDesde: fechaDesde ? new Date(fechaDesde as string) : undefined,
        fechaHasta: fechaHasta ? new Date(fechaHasta as string) : undefined
      });

      const response: ApiResponse = {
        success: true,
        data: stats
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}
