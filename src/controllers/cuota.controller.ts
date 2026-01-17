// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import { CuotaService } from '@/services/cuota.service';
import {
  createCuotaSchema,
  updateCuotaSchema,
  cuotaQuerySchema,
  generarCuotasSchema,
  cuotaSearchSchema,
  cuotaStatsSchema,
  deleteBulkCuotasSchema,
  calcularCuotaSchema,
  recalcularCuotasSchema,
  reporteCuotasSchema,
  recalcularCuotaSchema,
  regenerarCuotasSchema,
  previewRecalculoSchema,
  compararCuotaSchema
} from '@/dto/cuota.dto';
import { ApiResponse } from '@/types/interfaces';
import { HttpStatus } from '@/types/enums';
import { logger } from '@/utils/logger';

export class CuotaController {
  constructor(private cuotaService: CuotaService) {}

  /**
   * @swagger
   * /api/cuotas:
   *   post:
   *     summary: Crear una nueva cuota
   *     description: Crea una cuota individual para un socio en un período específico
   *     tags: [Cuotas]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - reciboId
   *               - categoriaId
   *               - mes
   *               - anio
   *             properties:
   *               reciboId:
   *                 type: integer
   *                 description: ID del recibo asociado
   *               categoriaId:
   *                 type: integer
   *                 description: ID de la categoría del socio
   *               mes:
   *                 type: integer
   *                 minimum: 1
   *                 maximum: 12
   *                 description: Mes de la cuota (1-12)
   *               anio:
   *                 type: integer
   *                 minimum: 2020
   *                 description: Año de la cuota
   *               montoBase:
   *                 type: number
   *                 description: Monto base de la cuota
   *               montoActividades:
   *                 type: number
   *                 description: Monto por actividades adicionales
   *     responses:
   *       201:
   *         description: Cuota creada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       400:
   *         description: Datos inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async createCuota(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createCuotaSchema.parse(req.body);
      const cuota = await this.cuotaService.createCuota(validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Cuota creada exitosamente',
        data: cuota
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/cuotas:
   *   get:
   *     summary: Obtener lista de cuotas con paginación
   *     description: Retorna lista paginada de cuotas con filtros opcionales
   *     tags: [Cuotas]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Número de página
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *         description: Elementos por página
   *       - in: query
   *         name: mes
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 12
   *         description: Filtrar por mes
   *       - in: query
   *         name: anio
   *         schema:
   *           type: integer
   *         description: Filtrar por año
   *       - in: query
   *         name: categoria
   *         schema:
   *           type: string
   *         description: Filtrar por categoría de socio
   *     responses:
   *       200:
   *         description: Lista de cuotas obtenida exitosamente
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
   *                         $ref: '#/components/schemas/Cuota'
   *                     meta:
   *                       type: object
   *                       properties:
   *                         page:
   *                           type: integer
   *                         limit:
   *                           type: integer
   *                         total:
   *                           type: integer
   *                         totalPages:
   *                           type: integer
   */
  async getCuotas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = cuotaQuerySchema.parse(req.query);
      const result = await this.cuotaService.getCuotas(query);

      // Calcular metadata de paginación mejorada
      const isUnlimited = query.limit >= 999999;
      const hasNextPage = !isUnlimited && (query.page < result.pages);
      const hasPreviousPage = !isUnlimited && (query.page > 1);

      const response: ApiResponse = {
        success: true,
        data: result.data,
        meta: {
          page: query.page,
          limit: query.limit,
          total: result.total,
          totalRecords: result.total, // Alias más claro
          totalPages: result.pages,
          recordsInPage: result.data.length,
          hasNextPage,
          hasPreviousPage,
          isUnlimited
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/cuotas/export:
   *   get:
   *     summary: Exportar todas las cuotas sin paginación
   *     description: Retorna todas las cuotas que coincidan con los filtros, sin límite de paginación. Útil para exportación a Excel, reportes o análisis completo.
   *     tags: [Cuotas]
   *     parameters:
   *       - in: query
   *         name: mes
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 12
   *         description: Filtrar por mes
   *       - in: query
   *         name: anio
   *         schema:
   *           type: integer
   *           minimum: 2020
   *           maximum: 2030
   *         description: Filtrar por año
   *       - in: query
   *         name: categoriaId
   *         schema:
   *           type: integer
   *         description: Filtrar por ID de categoría de socio
   *       - in: query
   *         name: ordenarPor
   *         schema:
   *           type: string
   *           enum: [fecha, monto, categoria, vencimiento]
   *           default: fecha
   *         description: Campo por el cual ordenar
   *       - in: query
   *         name: orden
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *           default: desc
   *         description: Orden ascendente o descendente
   *     responses:
   *       200:
   *         description: Lista completa de cuotas exportadas
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Cuotas exportadas exitosamente"
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Cuota'
   *                 meta:
   *                   type: object
   *                   properties:
   *                     total:
   *                       type: integer
   *                       description: Total de cuotas exportadas
   *                       example: 350
   *       400:
   *         description: Parámetros de consulta inválidos
   */
  async exportCuotas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Parsear query params (sin page ni limit)
      const { mes, anio, categoriaId, ordenarPor, orden, ...otherFilters } = req.query;

      const queryFilters: any = {
        ...otherFilters,
        ordenarPor: ordenarPor || 'fecha',
        orden: orden || 'desc'
      };

      // Agregar filtros opcionales si están presentes
      if (mes) queryFilters.mes = parseInt(mes as string);
      if (anio) queryFilters.anio = parseInt(anio as string);
      if (categoriaId) queryFilters.categoriaId = parseInt(categoriaId as string);

      const result = await this.cuotaService.exportAll(queryFilters);

      const response: ApiResponse = {
        success: true,
        message: `Cuotas exportadas exitosamente`,
        data: result.data,
        meta: {
          total: result.total,
          exportedAt: new Date().toISOString()
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/cuotas/{id}:
   *   get:
   *     summary: Obtener cuota por ID
   *     description: Retorna los detalles completos de una cuota específica incluyendo ítems y descuentos aplicados
   *     tags: [Cuotas]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de la cuota
   *     responses:
   *       200:
   *         description: Cuota encontrada
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/Cuota'
   *       404:
   *         description: Cuota no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async getCuotaById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const cuota = await this.cuotaService.getCuotaById(parseInt(id));

      if (!cuota) {
        const response: ApiResponse = {
          success: false,
          error: 'Cuota no encontrada'
        };
        res.status(HttpStatus.NOT_FOUND).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: cuota
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/cuotas/recibo/{reciboId}:
   *   get:
   *     summary: Obtener cuota por ID de recibo
   *     description: Busca la cuota asociada a un recibo específico
   *     tags: [Cuotas]
   *     parameters:
   *       - in: path
   *         name: reciboId
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Cuota encontrada
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/Cuota'
   *       404:
   *         description: Cuota no encontrada para el recibo
   */
  async getCuotaByReciboId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { reciboId } = req.params;
      const cuota = await this.cuotaService.getCuotaByReciboId(reciboId);

      if (!cuota) {
        const response: ApiResponse = {
          success: false,
          error: 'Cuota no encontrada para el recibo especificado'
        };
        res.status(HttpStatus.NOT_FOUND).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: cuota
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/cuotas/periodo/{mes}/{anio}:
   *   get:
   *     summary: Obtener cuotas por período
   *     description: Retorna todas las cuotas de un mes/año específico
   *     tags: [Cuotas]
   *     parameters:
   *       - in: path
   *         name: mes
   *         required: true
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 12
   *       - in: path
   *         name: anio
   *         required: true
   *         schema:
   *           type: integer
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *       - in: query
   *         name: categoriaId
   *         schema:
   *           type: integer
   *         description: Filtrar por categoría
   *     responses:
   *       200:
   *         description: Cuotas del período
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
   *                         $ref: '#/components/schemas/Cuota'
   *                     meta:
   *                       type: object
   *                       properties:
   *                         total:
   *                           type: integer
   *                         page:
   *                           type: integer
   *                         totalPages:
   *                           type: integer
   */
  async getCuotasPorPeriodo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { mes, anio } = req.params;
      const { categoria } = req.query;

      const cuotas = await this.cuotaService.getCuotasPorPeriodo(
        parseInt(mes),
        parseInt(anio),
        categoria as any
      );

      const response: ApiResponse = {
        success: true,
        data: cuotas,
        meta: {
          periodo: `${mes}/${anio}`,
          categoria: categoria || 'todas',
          total: cuotas.length
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/cuotas/socio/{socioId}:
   *   get:
   *     summary: Obtener cuotas de un socio
   *     description: Retorna todas las cuotas de un socio específico
   *     tags: [Cuotas]
   *     parameters:
   *       - in: path
   *         name: socioId
   *         required: true
   *         schema:
   *           type: integer
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *       - in: query
   *         name: anio
   *         schema:
   *           type: integer
   *         description: Filtrar por año
   *     responses:
   *       200:
   *         description: Cuotas del socio
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
   *                         $ref: '#/components/schemas/Cuota'
   */
  async getCuotasBySocio(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { socioId } = req.params;
      const { limit } = req.query;

      const cuotas = await this.cuotaService.getCuotasBySocio(
        socioId,
        limit ? parseInt(limit as string) : undefined
      );

      const response: ApiResponse = {
        success: true,
        data: cuotas,
        meta: {
          socioId,
          total: cuotas.length
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/cuotas/{id}:
   *   put:
   *     summary: Actualizar una cuota existente
   *     description: Modifica los datos de una cuota (montos, estado, etc.)
   *     tags: [Cuotas]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de la cuota
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               montoBase:
   *                 type: number
   *                 description: Nuevo monto base
   *               montoActividades:
   *                 type: number
   *                 description: Nuevo monto de actividades
   *               montoTotal:
   *                 type: number
   *                 description: Nuevo monto total
   *     responses:
   *       200:
   *         description: Cuota actualizada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       404:
   *         description: Cuota no encontrada
   *       400:
   *         description: Datos inválidos
   */
  async updateCuota(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateCuotaSchema.parse(req.body);
      const cuota = await this.cuotaService.updateCuota(parseInt(id), validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Cuota actualizada exitosamente',
        data: cuota
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/cuotas/{id}:
   *   delete:
   *     summary: Eliminar una cuota
   *     description: Elimina una cuota del sistema (solo si no está pagada)
   *     tags: [Cuotas]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de la cuota a eliminar
   *     responses:
   *       200:
   *         description: Cuota eliminada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       404:
   *         description: Cuota no encontrada
   *       409:
   *         description: No se puede eliminar (cuota pagada)
   */
  async deleteCuota(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const cuota = await this.cuotaService.deleteCuota(parseInt(id));

      const response: ApiResponse = {
        success: true,
        message: 'Cuota eliminada exitosamente',
        data: cuota
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/cuotas/generar/masiva:
   *   post:
   *     summary: Generar cuotas masivamente (LEGACY)
   *     description: |
   *       **DEPRECATED**: Use /generar-v2 en su lugar.
   *       Genera cuotas para todos los socios activos de un período.
   *       No incluye sistema de ítems ni motor de reglas.
   *     tags: [Cuotas]
   *     deprecated: true
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - mes
   *               - anio
   *             properties:
   *               mes:
   *                 type: integer
   *                 minimum: 1
   *                 maximum: 12
   *               anio:
   *                 type: integer
   *                 minimum: 2020
   *               categorias:
   *                 type: array
   *                 items:
   *                   type: string
   *     responses:
   *       201:
   *         description: Cuotas generadas
   *       207:
   *         description: Generación parcial (algunos errores)
   */
  async generarCuotas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = generarCuotasSchema.parse(req.body);
      const result = await this.cuotaService.generarCuotas(validatedData);

      const response: ApiResponse = {
        success: true,
        message: `Generación de cuotas completada: ${result.generated} cuotas creadas`,
        data: {
          generated: result.generated,
          errors: result.errors,
          cuotas: result.cuotas
        },
        meta: {
          periodo: `${validatedData.mes}/${validatedData.anio}`,
          totalGeneradas: result.generated,
          errores: result.errors.length
        }
      };

      // Retornar 207 Multi-Status si hubo errores parciales
      const statusCode = result.errors.length > 0 ? 207 : HttpStatus.CREATED;
      res.status(statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/cuotas/generar-v2:
   *   post:
   *     summary: Generar cuotas con sistema de ítems + motor de descuentos (V2) ⭐
   *     description: |
   *       **NUEVO ENDPOINT** que reemplaza /generar con enfoque moderno:
   *       - Genera cuotas usando sistema de ítems configurables (FASE 2)
   *       - Integra motor de reglas de descuentos (FASE 3)
   *       - Aplica ajustes manuales y exenciones automáticamente
   *       - Retorna estadísticas detalladas de descuentos aplicados
   *       - Provee auditoría completa de reglas aplicadas
   *     tags: [Cuotas]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - mes
   *               - anio
   *             properties:
   *               mes:
   *                 type: integer
   *                 minimum: 1
   *                 maximum: 12
   *                 description: Mes para el que se generan las cuotas
   *                 example: 12
   *               anio:
   *                 type: integer
   *                 minimum: 2020
   *                 description: Año para el que se generan las cuotas
   *                 example: 2025
   *               categorias:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: Categorías de socios a incluir (opcional, todas por defecto)
   *                 example: ["SOCIO_ACTIVO", "SOCIO_MENOR"]
   *               aplicarDescuentos:
   *                 type: boolean
   *                 default: true
   *                 description: Aplicar motor de reglas de descuentos
   *               incluirInactivos:
   *                 type: boolean
   *                 default: false
   *                 description: Incluir socios inactivos en la generación
   *     responses:
   *       201:
   *         description: Cuotas generadas exitosamente
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
   *                         generated:
   *                           type: integer
   *                           description: Número de cuotas generadas
   *                         errors:
   *                           type: array
   *                           items:
   *                             type: object
   *                         cuotas:
   *                           type: array
   *                           items:
   *                             $ref: '#/components/schemas/Cuota'
   *                         descuentos:
   *                           type: object
   *                           description: Resumen de descuentos aplicados
   *                           properties:
   *                             totalSociosConDescuento:
   *                               type: integer
   *                             montoTotalDescuentos:
   *                               type: number
   *                             reglasAplicadas:
   *                               type: object
   *       207:
   *         description: Generación parcial (algunas cuotas fallaron)
   *       400:
   *         description: Datos de entrada inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async generarCuotasConItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = generarCuotasSchema.parse(req.body);

      logger.info(`[CONTROLLER] Iniciando generación de cuotas V2 - ${validatedData.mes}/${validatedData.anio}`);

      const result = await this.cuotaService.generarCuotasConItems(validatedData);

      const response: ApiResponse = {
        success: true,
        message: `Generación de cuotas V2 completada: ${result.generated} cuotas creadas con sistema de ítems`,
        data: {
          generated: result.generated,
          errors: result.errors,
          cuotas: result.cuotas,
          descuentos: result.resumenDescuentos
        },
        meta: {
          periodo: `${validatedData.mes}/${validatedData.anio}`,
          totalGeneradas: result.generated,
          errores: result.errors.length,
          aplicarDescuentos: validatedData.aplicarDescuentos || true,
          // Estadísticas de descuentos (si aplicó)
          ...(result.resumenDescuentos && {
            sociosConDescuento: result.resumenDescuentos.totalSociosConDescuento,
            montoTotalDescuentos: result.resumenDescuentos.montoTotalDescuentos,
            reglasUtilizadas: Object.keys(result.resumenDescuentos.reglasAplicadas).length
          })
        }
      };

      // Retornar 207 Multi-Status si hubo errores parciales
      const statusCode = result.errors.length > 0 ? 207 : HttpStatus.CREATED;

      logger.info(
        `[CONTROLLER] Generación completada - ${result.generated} cuotas creadas, ` +
        `${result.errors.length} errores${
          result.resumenDescuentos ? `, ${result.resumenDescuentos.totalSociosConDescuento} con descuentos` : ''
        }`
      );

      res.status(statusCode).json(response);
    } catch (error) {
      logger.error('[CONTROLLER] Error en generación de cuotas V2:', error);
      next(error);
    }
  }

  /**
   * @swagger
   * /api/cuotas/calcular/monto:
   *   post:
   *     summary: Calcular monto de cuota (preview)
   *     description: Calcula el monto de una cuota sin crearla en la base de datos
   *     tags: [Cuotas]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - categoriaId
   *               - mes
   *               - anio
   *             properties:
   *               categoriaId:
   *                 type: integer
   *               mes:
   *                 type: integer
   *               anio:
   *                 type: integer
   *               personaId:
   *                 type: integer
   *                 description: Para calcular con actividades del socio
   *     responses:
   *       200:
   *         description: Monto calculado
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
   *                         montoBase:
   *                           type: number
   *                         montoActividades:
   *                           type: number
   *                         montoTotal:
   *                           type: number
   *                         desglose:
   *                           type: object
   */
  async calcularMontoCuota(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = calcularCuotaSchema.parse(req.body);
      const calculo = await this.cuotaService.calcularMontoCuota(validatedData);

      const response: ApiResponse = {
        success: true,
        data: calculo,
        meta: {
          categoria: validatedData.categoria,
          periodo: `${validatedData.mes}/${validatedData.anio}`
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/cuotas/search/avanzada:
   *   get:
   *     summary: Búsqueda avanzada de cuotas
   *     description: Permite búsqueda con múltiples filtros combinados
   *     tags: [Cuotas]
   *     parameters:
   *       - in: query
   *         name: mes
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 12
   *         description: Filtrar por mes
   *       - in: query
   *         name: anio
   *         schema:
   *           type: integer
   *         description: Filtrar por año
   *       - in: query
   *         name: categoriaId
   *         schema:
   *           type: integer
   *         description: Filtrar por categoría
   *       - in: query
   *         name: montoMin
   *         schema:
   *           type: number
   *         description: Monto mínimo
   *       - in: query
   *         name: montoMax
   *         schema:
   *           type: number
   *         description: Monto máximo
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *     responses:
   *       200:
   *         description: Resultados de búsqueda
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
   *                         $ref: '#/components/schemas/Cuota'
   *                     meta:
   *                       type: object
   *                       properties:
   *                         total:
   *                           type: integer
   *                         page:
   *                           type: integer
   *                         totalPages:
   *                           type: integer
   */
  async searchCuotas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const searchData = cuotaSearchSchema.parse(req.query);
      const cuotas = await this.cuotaService.searchCuotas(searchData);

      const response: ApiResponse = {
        success: true,
        data: cuotas,
        meta: {
          searchTerm: searchData.search,
          searchBy: searchData.searchBy,
          total: cuotas.length
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/cuotas/stats/resumen:
   *   get:
   *     summary: Estadísticas generales de cuotas
   *     description: Retorna métricas agregadas del sistema de cuotas
   *     tags: [Cuotas]
   *     parameters:
   *       - in: query
   *         name: mes
   *         schema:
   *           type: integer
   *         description: Filtrar por mes (opcional)
   *       - in: query
   *         name: anio
   *         schema:
   *           type: integer
   *         description: Filtrar por año (opcional)
   *     responses:
   *       200:
   *         description: Estadísticas obtenidas
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
   *                         totalCuotas:
   *                           type: integer
   *                         montoTotal:
   *                           type: number
   *                         promedio:
   *                           type: number
   *                         porEstado:
   *                           type: object
   */
  async getStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const statsData = cuotaStatsSchema.parse(req.query);

      // Asignar valores por defecto para las fechas si no se proporcionan
      if (!statsData.fechaDesde) {
        const now = new Date();
        const startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        statsData.fechaDesde = startDate.toISOString();
      }

      if (!statsData.fechaHasta) {
        statsData.fechaHasta = new Date().toISOString();
      }

      const stats = await this.cuotaService.getStatistics(statsData);

      const response: ApiResponse = {
        success: true,
        data: stats,
        meta: {
          period: `${statsData.fechaDesde} - ${statsData.fechaHasta}`,
          groupBy: statsData.agruparPor
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/cuotas/vencidas/listado:
   *   get:
   *     summary: Listar cuotas vencidas
   *     description: Retorna todas las cuotas con estado VENCIDA
   *     tags: [Cuotas]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *       - in: query
   *         name: diasVencimiento
   *         schema:
   *           type: integer
   *         description: Filtrar por días de vencimiento (mayor a X días)
   *     responses:
   *       200:
   *         description: Lista de cuotas vencidas
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  async getVencidas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cuotas = await this.cuotaService.getVencidas();

      const response: ApiResponse = {
        success: true,
        data: cuotas,
        meta: {
          total: cuotas.length,
          timestamp: new Date().toISOString()
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/cuotas/pendientes/listado:
   *   get:
   *     summary: Listar cuotas pendientes de pago
   *     description: Retorna todas las cuotas con estado PENDIENTE
   *     tags: [Cuotas]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *       - in: query
   *         name: mes
   *         schema:
   *           type: integer
   *       - in: query
   *         name: anio
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Lista de cuotas pendientes
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  async getPendientes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cuotas = await this.cuotaService.getPendientes();

      const response: ApiResponse = {
        success: true,
        data: cuotas,
        meta: {
          total: cuotas.length,
          timestamp: new Date().toISOString()
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/cuotas/bulk/eliminar:
   *   delete:
   *     summary: Eliminar múltiples cuotas
   *     description: Elimina varias cuotas por sus IDs (solo no pagadas)
   *     tags: [Cuotas]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - ids
   *             properties:
   *               ids:
   *                 type: array
   *                 items:
   *                   type: integer
   *                 description: Array de IDs de cuotas a eliminar
   *     responses:
   *       200:
   *         description: Cuotas eliminadas
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
   *                         eliminadas:
   *                           type: integer
   *                         errors:
   *                           type: array
   */
  async deleteBulkCuotas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = deleteBulkCuotasSchema.parse(req.body);
      const result = await this.cuotaService.deleteBulkCuotas(validatedData);

      const response: ApiResponse = {
        success: true,
        message: `${result.count} cuotas eliminadas exitosamente`,
        data: result
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/cuotas/recalcular/periodo:
   *   post:
   *     summary: Recalcular cuotas de un período
   *     description: Recalcula todas las cuotas de un mes/año específico
   *     tags: [Cuotas]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - mes
   *               - anio
   *             properties:
   *               mes:
   *                 type: integer
   *                 minimum: 1
   *                 maximum: 12
   *               anio:
   *                 type: integer
   *               aplicarAjustes:
   *                 type: boolean
   *                 default: true
   *               aplicarExenciones:
   *                 type: boolean
   *                 default: true
   *     responses:
   *       200:
   *         description: Cuotas recalculadas exitosamente
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
   *                         recalculadas:
   *                           type: integer
   *                         errors:
   *                           type: array
   */
  async recalcularCuotas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = recalcularCuotasSchema.parse(req.body);
      const result = await this.cuotaService.recalcularCuotas(validatedData);

      const response: ApiResponse = {
        success: true,
        message: `Recálculo completado: ${result.updated} cuotas actualizadas`,
        data: {
          updated: result.updated,
          errors: result.errors
        },
        meta: {
          periodo: `${validatedData.mes}/${validatedData.anio}`,
          categoria: validatedData.categoria,
          errores: result.errors.length
        }
      };

      // Retornar 207 Multi-Status si hubo errores parciales
      const statusCode = result.errors.length > 0 ? 207 : HttpStatus.OK;
      res.status(statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/cuotas/resumen/{mes}/{anio}:
   *   get:
   *     summary: Obtener resumen mensual de cuotas
   *     description: Retorna resumen con totales y estadísticas del período
   *     tags: [Cuotas]
   *     parameters:
   *       - in: path
   *         name: mes
   *         required: true
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 12
   *       - in: path
   *         name: anio
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Resumen obtenido
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
   *                         periodo:
   *                           type: string
   *                         totalCuotas:
   *                           type: integer
   *                         montoTotal:
   *                           type: number
   *                         pagadas:
   *                           type: integer
   *                         pendientes:
   *                           type: integer
   *                         vencidas:
   *                           type: integer
   */
  async getResumenMensual(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { mes, anio } = req.params;
      const resumen = await this.cuotaService.getResumenMensual(parseInt(mes), parseInt(anio));

      const response: ApiResponse = {
        success: true,
        data: resumen,
        meta: {
          periodo: `${mes}/${anio}`,
          timestamp: new Date().toISOString()
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/cuotas/reporte/{mes}/{anio}:
   *   get:
   *     summary: Generar reporte de cuotas del período
   *     description: Retorna reporte detallado de cuotas de un mes/año
   *     tags: [Cuotas]
   *     parameters:
   *       - in: path
   *         name: mes
   *         required: true
   *         schema:
   *           type: integer
   *       - in: path
   *         name: anio
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Reporte generado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  async generarReporte(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = reporteCuotasSchema.parse({ ...req.params, ...req.query });
      const reporte = await this.cuotaService.generarReporte(validatedData);

      const response: ApiResponse = {
        success: true,
        data: reporte,
        meta: {
          formato: validatedData.formato,
          periodo: `${validatedData.mes}/${validatedData.anio}`,
          generadoEn: reporte.generadoEn
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/cuotas/dashboard:
   *   get:
   *     summary: Dashboard de cuotas del mes actual
   *     description: |
   *       Retorna un resumen ejecutivo con métricas clave del mes actual:
   *       - Primeras 10 cuotas pendientes
   *       - Primeras 10 cuotas vencidas
   *       - Resumen mensual (totales, montos, estadísticas)
   *       **Uso**: Pantalla principal del módulo de cuotas.
   *     tags: [Cuotas]
   *     responses:
   *       200:
   *         description: Dashboard obtenido exitosamente
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
   *                         pendientes:
   *                           type: array
   *                           maxItems: 10
   *                           items:
   *                             $ref: '#/components/schemas/Cuota'
   *                         vencidas:
   *                           type: array
   *                           maxItems: 10
   *                           items:
   *                             $ref: '#/components/schemas/Cuota'
   *                         resumenMesActual:
   *                           type: object
   *                           properties:
   *                             totalCuotas:
   *                               type: integer
   *                             montosTotal:
   *                               type: number
   *                             pagadas:
   *                               type: integer
   *                             pendientes:
   *                               type: integer
   *                             vencidas:
   *                               type: integer
   *                     meta:
   *                       type: object
   *                       properties:
   *                         pendientesCount:
   *                           type: integer
   *                           description: Total de cuotas pendientes
   *                         vencidasCount:
   *                           type: integer
   *                           description: Total de cuotas vencidas
   *                         mesActual:
   *                           type: string
   *                           example: "12/2025"
   *                         timestamp:
   *                           type: string
   *                           format: date-time
   */
  // Dashboard endpoint para cuotas
  async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      const [pendientes, vencidas, resumenActual] = await Promise.all([
        this.cuotaService.getPendientes(),
        this.cuotaService.getVencidas(),
        this.cuotaService.getResumenMensual(currentMonth, currentYear)
      ]);

      const response: ApiResponse = {
        success: true,
        data: {
          pendientes: pendientes.slice(0, 10), // Primeras 10 pendientes
          vencidas: vencidas.slice(0, 10), // Primeras 10 vencidas
          resumenMesActual: resumenActual
        },
        meta: {
          pendientesCount: pendientes.length,
          vencidasCount: vencidas.length,
          mesActual: `${currentMonth}/${currentYear}`,
          timestamp: new Date().toISOString()
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/cuotas/periodos/disponibles:
   *   get:
   *     summary: Obtener períodos disponibles
   *     description: Retorna lista de períodos (mes/año) con cuotas generadas
   *     tags: [Cuotas]
   *     responses:
   *       200:
   *         description: Lista de períodos
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
   *                           mes:
   *                             type: integer
   *                           anio:
   *                             type: integer
   *                           totalCuotas:
   *                             type: integer
   *                           displayName:
   *                             type: string
   *                             example: "Diciembre 2025"
   */
  // Endpoint para obtener períodos disponibles
  async getPeriodosDisponibles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      const periodos = [];

      // Generar periodos desde enero del año actual hasta 2 meses en el futuro
      for (let year = currentYear - 1; year <= currentYear + 1; year++) {
        for (let month = 1; month <= 12; month++) {
          const periodDate = new Date(year, month - 1, 1);
          const maxDate = new Date(currentYear, currentMonth + 1, 1);

          if (periodDate <= maxDate) {
            periodos.push({
              mes: month,
              anio: year,
              display: `${this.getNombreMes(month)} ${year}`,
              value: `${month}/${year}`
            });
          }
        }
      }

      const response: ApiResponse = {
        success: true,
        data: periodos.reverse(), // Más recientes primero
        meta: {
          total: periodos.length
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/cuotas/validar/{mes}/{anio}/generacion:
   *   get:
   *     summary: Validar si se pueden generar cuotas
   *     description: Verifica prerequisitos antes de generar cuotas del período
   *     tags: [Cuotas]
   *     parameters:
   *       - in: path
   *         name: mes
   *         required: true
   *         schema:
   *           type: integer
   *       - in: path
   *         name: anio
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Validación completada
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
   *                         puedeGenerar:
   *                           type: boolean
   *                         razon:
   *                           type: string
   *                         advertencias:
   *                           type: array
   *                           items:
   *                             type: string
   */
  // Endpoint para validar si se pueden generar cuotas
  async validarGeneracionCuotas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { mes, anio } = req.params;
      const { categoria } = req.query;

      // Verificar cuotas existentes
      const cuotasExistentes = await this.cuotaService.getCuotasPorPeriodo(
        parseInt(mes),
        parseInt(anio),
        categoria as any
      );

      // Obtener socios pendientes
      const sociosPendientes = await this.cuotaService['cuotaRepository'].getCuotasPorGenerar(
        parseInt(mes),
        parseInt(anio),
        categoria ? [categoria as any] : undefined
      );

      const response: ApiResponse = {
        success: true,
        data: {
          puedeGenerar: sociosPendientes.length > 0,
          cuotasExistentes: cuotasExistentes.length,
          sociosPendientes: sociosPendientes.length,
          detallesSocios: sociosPendientes.map(s => ({
            id: s.id,
            nombre: `${s.nombre} ${s.apellido}`,
            numeroSocio: s.numeroSocio,
            categoria: s.categoria
          }))
        },
        meta: {
          periodo: `${mes}/${anio}`,
          categoria: categoria || 'todas'
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // FASE 4 - Task 4.3: Recálculo y Regeneración de Cuotas
  // ══════════════════════════════════════════════════════════════════════

  /**
   * @swagger
   * /api/cuotas/{id}/recalcular:
   *   post:
   *     summary: Recalcular cuota individual ⭐ FASE 4
   *     description: |
   *       Recalcula una cuota existente aplicando ajustes, exenciones y descuentos actuales.
   *       Útil cuando se agregan/modifican ajustes manuales o exenciones después de generar la cuota.
   *       **Validación**: No permite recalcular cuotas ya pagadas.
   *     tags: [Cuotas]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de la cuota a recalcular
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               aplicarAjustes:
   *                 type: boolean
   *                 default: true
   *                 description: Aplicar ajustes manuales del socio
   *               aplicarExenciones:
   *                 type: boolean
   *                 default: true
   *                 description: Aplicar exenciones vigentes
   *               aplicarDescuentos:
   *                 type: boolean
   *                 default: true
   *                 description: Aplicar reglas de descuento automáticas
   *               usuario:
   *                 type: string
   *                 description: Usuario que ejecuta el recálculo (para auditoría)
   *     responses:
   *       200:
   *         description: Cuota recalculada exitosamente
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
   *                         cuota:
   *                           $ref: '#/components/schemas/Cuota'
   *                         cambios:
   *                           type: object
   *                           description: Detalle de cambios aplicados
   *                           properties:
   *                             montoBase:
   *                               type: object
   *                               properties:
   *                                 anterior:
   *                                   type: number
   *                                 nuevo:
   *                                   type: number
   *                                 diferencia:
   *                                   type: number
   *                             montoTotal:
   *                               type: object
   *                               properties:
   *                                 anterior:
   *                                   type: number
   *                                 nuevo:
   *                                   type: number
   *                                 diferencia:
   *                                   type: number
   *                             ajustesAplicados:
   *                               type: array
   *                               items:
   *                                 type: object
   *                             exencionesAplicadas:
   *                               type: array
   *                               items:
   *                                 type: object
   *       400:
   *         description: Cuota no puede ser recalculada (ej. ya pagada)
   *       404:
   *         description: Cuota no encontrada
   */
  async recalcularCuotaById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cuotaId = parseInt(req.params.id);
      const body = req.body || {};

      const validatedData = recalcularCuotaSchema.parse({
        cuotaId,
        aplicarAjustes: body.aplicarAjustes ?? true,
        aplicarExenciones: body.aplicarExenciones ?? true,
        aplicarDescuentos: body.aplicarDescuentos ?? true,
        usuario: body.usuario
      });

      logger.info(`[CONTROLLER] Recalculando cuota ID ${cuotaId}`);

      const result = await this.cuotaService.recalcularCuota(validatedData);

      const response: ApiResponse = {
        success: true,
        message: result.cambios.montoTotal.diferencia !== 0
          ? `Cuota recalculada con éxito. Cambio: $${result.cambios.montoTotal.diferencia.toFixed(2)}`
          : 'Cuota recalculada sin cambios en el monto',
        data: result,
        meta: {
          cuotaId,
          cambioMontoTotal: result.cambios.montoTotal.diferencia,
          ajustesAplicados: result.cambios.ajustesAplicados.length,
          exencionesAplicadas: result.cambios.exencionesAplicadas.length
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('[CONTROLLER] Error recalculando cuota:', error);
      next(error);
    }
  }

  /**
   * @swagger
   * /api/cuotas/regenerar:
   *   post:
   *     summary: Regenerar cuotas de un período ⭐ FASE 4
   *     description: |
   *       Elimina y regenera cuotas de un período completo o filtrado.
   *       **Casos de uso**: Cambios masivos en configuración, corrección de errores de generación.
   *       **Validación**: No permite regenerar cuotas pagadas (protección de datos).
   *       **Puede filtrar por**: categoría, persona, o período completo.
   *     tags: [Cuotas]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - mes
   *               - anio
   *             properties:
   *               mes:
   *                 type: integer
   *                 minimum: 1
   *                 maximum: 12
   *                 description: Mes a regenerar
   *                 example: 12
   *               anio:
   *                 type: integer
   *                 minimum: 2020
   *                 description: Año a regenerar
   *                 example: 2025
   *               categoriaId:
   *                 type: integer
   *                 description: Regenerar solo cuotas de esta categoría (opcional)
   *               personaId:
   *                 type: integer
   *                 description: Regenerar solo cuotas de esta persona (opcional)
   *               forzar:
   *                 type: boolean
   *                 default: false
   *                 description: Forzar regeneración incluso si hay advertencias
   *               usuario:
   *                 type: string
   *                 description: Usuario que ejecuta la regeneración (auditoría)
   *     responses:
   *       200:
   *         description: Cuotas regeneradas exitosamente
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
   *                         eliminadas:
   *                           type: integer
   *                           description: Número de cuotas eliminadas
   *                         generadas:
   *                           type: integer
   *                           description: Número de cuotas regeneradas
   *                         advertencias:
   *                           type: array
   *                           items:
   *                             type: string
   *       400:
   *         description: Período contiene cuotas pagadas o datos inválidos
   *       409:
   *         description: Conflicto - operación no permitida
   */
  async regenerarCuotasDelPeriodo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = regenerarCuotasSchema.parse(req.body);

      logger.info(`[CONTROLLER] Regenerando cuotas - ${validatedData.mes}/${validatedData.anio}`);

      const result = await this.cuotaService.regenerarCuotas(validatedData);

      const response: ApiResponse = {
        success: true,
        message: `${result.generadas} cuotas regeneradas exitosamente (${result.eliminadas} eliminadas)`,
        data: result,
        meta: {
          periodo: `${validatedData.mes}/${validatedData.anio}`,
          categoriaId: validatedData.categoriaId,
          personaId: validatedData.personaId,
          eliminadas: result.eliminadas,
          generadas: result.generadas
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('[CONTROLLER] Error regenerando cuotas:', error);
      next(error);
    }
  }

  /**
   * @swagger
   * /api/cuotas/preview-recalculo:
   *   post:
   *     summary: Preview de recálculo (sin aplicar cambios) ⭐ FASE 4
   *     description: |
   *       Simula el recálculo de una o más cuotas SIN aplicar cambios a la base de datos.
   *       Permite visualizar el impacto antes de ejecutar un recálculo real.
   *       **Modos de operación**:
   *       - Individual: Por cuotaId
   *       - Masivo por período: mes + anio
   *       - Filtrado: Por categoría o persona
   *     tags: [Cuotas]
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               cuotaId:
   *                 type: integer
   *                 description: ID de cuota individual para preview
   *               mes:
   *                 type: integer
   *                 minimum: 1
   *                 maximum: 12
   *                 description: Mes para preview masivo
   *               anio:
   *                 type: integer
   *                 minimum: 2020
   *                 description: Año para preview masivo
   *               categoriaId:
   *                 type: integer
   *                 description: Filtrar por categoría
   *               personaId:
   *                 type: integer
   *                 description: Filtrar por persona
   *     responses:
   *       200:
   *         description: Preview completado exitosamente
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
   *                         resumen:
   *                           type: object
   *                           properties:
   *                             totalCuotas:
   *                               type: integer
   *                               description: Total de cuotas analizadas
   *                             conCambios:
   *                               type: integer
   *                               description: Cuotas que tendrían cambios
   *                             sinCambios:
   *                               type: integer
   *                               description: Cuotas que permanecen igual
   *                             montoTotalCambios:
   *                               type: number
   *                               description: Diferencia total en montos
   *                         cuotas:
   *                           type: array
   *                           description: Detalle de cada cuota con cambios
   *                           items:
   *                             type: object
   *                             properties:
   *                               cuotaId:
   *                                 type: integer
   *                               actual:
   *                                 type: object
   *                               recalculada:
   *                                 type: object
   *                               diferencias:
   *                                 type: object
   *       400:
   *         description: Parámetros inválidos
   */
  async previewRecalculoCuotas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = previewRecalculoSchema.parse(req.body);

      logger.info(`[CONTROLLER] Preview de recálculo - cuotaId: ${validatedData.cuotaId}, periodo: ${validatedData.mes}/${validatedData.anio}`);

      const result = await this.cuotaService.previewRecalculo(validatedData);

      const response: ApiResponse = {
        success: true,
        message: `Preview completado: ${result.resumen.conCambios} cuotas con cambios de ${result.resumen.totalCuotas} analizadas`,
        data: result,
        meta: {
          cuotaId: validatedData.cuotaId,
          periodo: validatedData.mes && validatedData.anio ? `${validatedData.mes}/${validatedData.anio}` : null,
          categoriaId: validatedData.categoriaId,
          personaId: validatedData.personaId,
          ...result.resumen
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('[CONTROLLER] Error en preview de recálculo:', error);
      next(error);
    }
  }

  /**
   * @swagger
   * /api/cuotas/{id}/comparar:
   *   get:
   *     summary: Comparar cuota actual vs recalculada ⭐ FASE 4
   *     description: |
   *       Compara el estado actual de una cuota con cómo quedaría si se recalculara ahora.
   *       **Útil para**: Detectar diferencias antes de aplicar recálculo, auditoría de cambios.
   *       **No modifica datos**: Solo lectura y comparación.
   *     tags: [Cuotas]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de la cuota a comparar
   *     responses:
   *       200:
   *         description: Comparación completada
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
   *                         actual:
   *                           type: object
   *                           description: Estado actual de la cuota
   *                           properties:
   *                             montoBase:
   *                               type: number
   *                             montoTotal:
   *                               type: number
   *                             ajustes:
   *                               type: array
   *                               items:
   *                                 type: object
   *                         recalculada:
   *                           type: object
   *                           description: Como quedaría si se recalcula
   *                           properties:
   *                             montoBase:
   *                               type: number
   *                             montoTotal:
   *                               type: number
   *                             ajustesAplicados:
   *                               type: array
   *                               items:
   *                                 type: object
   *                             exencionesAplicadas:
   *                               type: array
   *                               items:
   *                                 type: object
   *                         diferencias:
   *                           type: object
   *                           properties:
   *                             esSignificativo:
   *                               type: boolean
   *                               description: Si la diferencia supera umbral (5%)
   *                             montoBase:
   *                               type: number
   *                               description: Diferencia en monto base
   *                             montoTotal:
   *                               type: number
   *                               description: Diferencia en monto total
   *                             porcentajeDiferencia:
   *                               type: number
   *                               description: Porcentaje de diferencia
   *       404:
   *         description: Cuota no encontrada
   */
  async compararCuotaConRecalculo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cuotaId = parseInt(req.params.id);

      const validatedData = compararCuotaSchema.parse({ cuotaId });

      logger.info(`[CONTROLLER] Comparando cuota ID ${cuotaId}`);

      const result = await this.cuotaService.compararCuota(cuotaId);

      const response: ApiResponse = {
        success: true,
        message: result.diferencias.esSignificativo
          ? `Diferencia significativa encontrada: $${result.diferencias.montoTotal.toFixed(2)} (${result.diferencias.porcentajeDiferencia.toFixed(2)}%)`
          : 'Sin diferencias significativas',
        data: result,
        meta: {
          cuotaId,
          esSignificativo: result.diferencias.esSignificativo,
          diferenciaMonto: result.diferencias.montoTotal,
          diferenciaPorcentaje: result.diferencias.porcentajeDiferencia,
          ajustesDisponibles: result.recalculada.ajustesAplicados.length,
          exencionesDisponibles: result.recalculada.exencionesAplicadas.length
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('[CONTROLLER] Error comparando cuota:', error);
      next(error);
    }
  }

  // Método auxiliar privado
  private getNombreMes(mes: number): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1] || 'Mes inválido';
  }
}