import { Request, Response, NextFunction } from 'express';
import { ItemCuotaService } from '@/services/item-cuota.service';
import {
  addManualItemSchema,
  updateItemCuotaSchema,
  regenerarItemsSchema,
  aplicarDescuentoGlobalSchema,
  queryItemsSchema
} from '@/dto/item-cuota.dto';
import { ApiResponse } from '@/types/interfaces';
import { HttpStatus } from '@/types/enums';

/**
 * Controller para gestión de Ítems de Cuota
 * Operaciones sobre ítems individuales que componen una cuota
 */
export class ItemCuotaController {
  constructor(private service: ItemCuotaService) {}

  /**
   * @swagger
   * /api/cuotas/{cuotaId}/items:
   *   get:
   *     tags: [Items de Cuota]
   *     summary: Obtener todos los ítems de una cuota
   *     description: Retorna la lista completa de ítems de una cuota específica junto con un resumen que incluye montos totales y conteo por tipo de ítem (base, actividades, descuentos, recargos)
   *     parameters:
   *       - in: path
   *         name: cuotaId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de la cuota
   *     responses:
   *       200:
   *         description: Lista de ítems obtenida exitosamente
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
   *                         $ref: '#/components/schemas/ItemCuota'
   *                     meta:
   *                       type: object
   *                       properties:
   *                         cuotaId:
   *                           type: integer
   *                         totalItems:
   *                           type: integer
   *                         summary:
   *                           type: object
   *                           properties:
   *                             totalBase:
   *                               type: number
   *                             totalActividades:
   *                               type: number
   *                             totalDescuentos:
   *                               type: number
   *                             totalRecargos:
   *                               type: number
   *                             totalFinal:
   *                               type: number
   *                             conteoItems:
   *                               type: object
   *       404:
   *         description: Cuota no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async getItemsByCuotaId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cuotaId } = req.params;
      const result = await this.service.getItemsByCuotaId(parseInt(cuotaId));

      const response: ApiResponse = {
        success: true,
        data: result.items,
        meta: {
          cuotaId: parseInt(cuotaId),
          totalItems: result.items.length,
          summary: result.summary
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/cuotas/{cuotaId}/items/desglose:
   *   get:
   *     tags: [Items de Cuota]
   *     summary: Obtener desglose completo de una cuota
   *     description: Retorna un desglose detallado y categorizado de todos los ítems de la cuota, separados por categoría (cuota base, actividades, descuentos, recargos) con totales parciales y total final
   *     parameters:
   *       - in: path
   *         name: cuotaId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de la cuota
   *     responses:
   *       200:
   *         description: Desglose obtenido exitosamente
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
   *                         cuotaId:
   *                           type: integer
   *                         itemsBase:
   *                           type: array
   *                           items:
   *                             $ref: '#/components/schemas/ItemCuota'
   *                         itemsActividades:
   *                           type: array
   *                           items:
   *                             $ref: '#/components/schemas/ItemCuota'
   *                         itemsDescuentos:
   *                           type: array
   *                           items:
   *                             $ref: '#/components/schemas/ItemCuota'
   *                         itemsRecargos:
   *                           type: array
   *                           items:
   *                             $ref: '#/components/schemas/ItemCuota'
   *                         totales:
   *                           type: object
   *                           properties:
   *                             subtotalBase:
   *                               type: number
   *                             subtotalActividades:
   *                               type: number
   *                             totalDescuentos:
   *                               type: number
   *                             totalRecargos:
   *                               type: number
   *                             totalFinal:
   *                               type: number
   *       404:
   *         description: Cuota no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async getDesgloseByCuotaId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cuotaId } = req.params;
      const desglose = await this.service.getDesgloseByCuotaId(parseInt(cuotaId));

      const response: ApiResponse = {
        success: true,
        data: desglose
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/cuotas/{cuotaId}/items/segmentados:
   *   get:
   *     tags: [Items de Cuota]
   *     summary: Obtener ítems segmentados por origen
   *     description: Retorna los ítems de una cuota separados en dos grupos (automáticos y manuales) para identificar claramente qué ítems fueron generados automáticamente por el sistema y cuáles fueron agregados manualmente por usuarios
   *     parameters:
   *       - in: path
   *         name: cuotaId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de la cuota
   *     responses:
   *       200:
   *         description: Ítems segmentados obtenidos exitosamente
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
   *                         automaticos:
   *                           type: array
   *                           items:
   *                             $ref: '#/components/schemas/ItemCuota'
   *                           description: Ítems generados automáticamente por el sistema
   *                         manuales:
   *                           type: array
   *                           items:
   *                             $ref: '#/components/schemas/ItemCuota'
   *                           description: Ítems agregados manualmente por usuarios
   *                         conteo:
   *                           type: object
   *                           properties:
   *                             automaticos:
   *                               type: integer
   *                             manuales:
   *                               type: integer
   *                             total:
   *                               type: integer
   *       404:
   *         description: Cuota no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async getItemsSegmentados(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cuotaId } = req.params;
      const result = await this.service.getItemsSegmentadosByCuotaId(parseInt(cuotaId));

      const response: ApiResponse = {
        success: true,
        data: result
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/items-cuota/{id}:
   *   get:
   *     tags: [Items de Cuota]
   *     summary: Obtener ítem por ID
   *     description: Retorna la información completa de un ítem de cuota específico incluyendo todos sus datos (concepto, monto, cantidad, tipo, categoría, etc.)
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del ítem
   *     responses:
   *       200:
   *         description: Ítem obtenido exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/ItemCuota'
   *       404:
   *         description: Ítem no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.service.getById(parseInt(id));

      const response: ApiResponse = {
        success: true,
        data: item
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/cuotas/{cuotaId}/items:
   *   post:
   *     tags: [Items de Cuota]
   *     summary: Agregar ítem manual a una cuota
   *     description: Permite agregar un ítem manual personalizado a una cuota existente. Los ítems manuales son editables y pueden utilizarse para cargos adicionales, descuentos especiales u otros conceptos no contemplados en el sistema automático.
   *     parameters:
   *       - in: path
   *         name: cuotaId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de la cuota a la que se agregará el ítem
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - concepto
   *               - monto
   *               - tipoItemId
   *               - categoriaItemId
   *             properties:
   *               concepto:
   *                 type: string
   *                 description: Descripción del ítem
   *                 example: Cargo adicional por material didáctico
   *               monto:
   *                 type: number
   *                 description: Monto unitario del ítem
   *                 example: 25.50
   *               cantidad:
   *                 type: integer
   *                 description: Cantidad de unidades (default 1)
   *                 example: 1
   *               tipoItemId:
   *                 type: integer
   *                 description: ID del tipo de ítem (desde catálogo)
   *                 example: 1
   *               categoriaItemId:
   *                 type: integer
   *                 description: ID de la categoría de ítem (desde catálogo)
   *                 example: 2
   *               notas:
   *                 type: string
   *                 description: Observaciones adicionales (opcional)
   *                 example: Material para clase de piano
   *     responses:
   *       201:
   *         description: Ítem agregado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     message:
   *                       type: string
   *                       example: Ítem agregado exitosamente
   *                     data:
   *                       $ref: '#/components/schemas/ItemCuota'
   *       400:
   *         description: Datos inválidos o cuota no permite ítems manuales
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: Cuota no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async addManualItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cuotaId } = req.params;
      const validatedData = addManualItemSchema.parse({
        ...req.body,
        cuotaId: parseInt(cuotaId)
      });

      const item = await this.service.addManualItem(validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Ítem agregado exitosamente',
        data: item
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/items-cuota/{id}:
   *   put:
   *     tags: [Items de Cuota]
   *     summary: Actualizar ítem editable
   *     description: Permite modificar los datos de un ítem editable (ítems manuales). Los ítems automáticos no pueden ser editados directamente, deben regenerarse.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del ítem a actualizar
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               concepto:
   *                 type: string
   *                 description: Nueva descripción del ítem
   *                 example: Cargo modificado por material didáctico
   *               monto:
   *                 type: number
   *                 description: Nuevo monto unitario
   *                 example: 30.00
   *               cantidad:
   *                 type: integer
   *                 description: Nueva cantidad
   *                 example: 2
   *               tipoItemId:
   *                 type: integer
   *                 description: Nuevo ID del tipo de ítem
   *               categoriaItemId:
   *                 type: integer
   *                 description: Nuevo ID de la categoría de ítem
   *               notas:
   *                 type: string
   *                 description: Nuevas observaciones
   *     responses:
   *       200:
   *         description: Ítem actualizado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     message:
   *                       type: string
   *                       example: Ítem actualizado exitosamente
   *                     data:
   *                       $ref: '#/components/schemas/ItemCuota'
   *       400:
   *         description: Ítem no es editable o datos inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: Ítem no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async updateItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateItemCuotaSchema.parse(req.body);
      const item = await this.service.updateItem(parseInt(id), validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Ítem actualizado exitosamente',
        data: item
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/items-cuota/{id}:
   *   delete:
   *     tags: [Items de Cuota]
   *     summary: Eliminar ítem editable
   *     description: Permite eliminar un ítem editable (ítems manuales) de una cuota. Los ítems automáticos no pueden ser eliminados individualmente, deben regenerarse la cuota completa.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del ítem a eliminar
   *     responses:
   *       200:
   *         description: Ítem eliminado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     message:
   *                       type: string
   *                       example: Ítem eliminado exitosamente
   *       400:
   *         description: Ítem no es editable (es automático)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: Ítem no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async deleteItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.service.deleteItem(parseInt(id));

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
   * @swagger
   * /api/cuotas/{cuotaId}/items/regenerar:
   *   post:
   *     tags: [Items de Cuota]
   *     summary: Regenerar todos los ítems de una cuota
   *     description: Elimina todos los ítems existentes de una cuota y los regenera completamente según las reglas actuales del sistema. Útil cuando cambian configuraciones globales o datos de actividades/categorías que afectan el cálculo de cuotas.
   *     parameters:
   *       - in: path
   *         name: cuotaId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de la cuota cuyos ítems se regenerarán
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - items
   *             properties:
   *               items:
   *                 type: array
   *                 description: Lista de ítems a regenerar (estructura completa)
   *                 items:
   *                   type: object
   *                   properties:
   *                     concepto:
   *                       type: string
   *                     monto:
   *                       type: number
   *                     cantidad:
   *                       type: integer
   *                     tipoItemId:
   *                       type: integer
   *                     categoriaItemId:
   *                       type: integer
   *     responses:
   *       200:
   *         description: Ítems regenerados exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     message:
   *                       type: string
   *                       example: 5 ítems regenerados exitosamente
   *                     data:
   *                       type: object
   *                       properties:
   *                         itemsEliminados:
   *                           type: integer
   *                           description: Cantidad de ítems eliminados
   *                         itemsCreados:
   *                           type: integer
   *                           description: Cantidad de ítems nuevos creados
   *                         items:
   *                           type: array
   *                           items:
   *                             $ref: '#/components/schemas/ItemCuota'
   *       400:
   *         description: Datos inválidos o cuota no permite regeneración
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: Cuota no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async regenerarItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cuotaId } = req.params;
      const validatedData = regenerarItemsSchema.parse(req.body);
      const result = await this.service.regenerarItems(parseInt(cuotaId), validatedData.items);

      const response: ApiResponse = {
        success: true,
        message: `${result.itemsCreados} ítems regenerados exitosamente`,
        data: result
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/items-cuota/{id}/duplicar:
   *   post:
   *     tags: [Items de Cuota]
   *     summary: Duplicar ítem
   *     description: Crea una copia editable de un ítem existente. La copia se marca como manual (editable) aunque el ítem original sea automático. Útil para crear variaciones de ítems automáticos o copiar configuraciones de ítems existentes.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del ítem a duplicar
   *     responses:
   *       201:
   *         description: Ítem duplicado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     message:
   *                       type: string
   *                       example: Ítem duplicado exitosamente
   *                     data:
   *                       $ref: '#/components/schemas/ItemCuota'
   *       404:
   *         description: Ítem no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async duplicarItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.service.duplicarItem(parseInt(id));

      const response: ApiResponse = {
        success: true,
        message: 'Ítem duplicado exitosamente',
        data: item
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/cuotas/{cuotaId}/items/descuento-global:
   *   post:
   *     tags: [Items de Cuota]
   *     summary: Aplicar descuento porcentual global
   *     description: Aplica un descuento porcentual calculado sobre el total de la cuota y lo agrega como un ítem de descuento. El descuento se calcula sobre la suma de todos los ítems existentes (base + actividades + otros cargos).
   *     parameters:
   *       - in: path
   *         name: cuotaId
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
   *             required:
   *               - porcentaje
   *             properties:
   *               porcentaje:
   *                 type: number
   *                 description: Porcentaje de descuento a aplicar (0-100)
   *                 example: 15
   *                 minimum: 0
   *                 maximum: 100
   *               concepto:
   *                 type: string
   *                 description: Descripción del descuento (opcional)
   *                 example: Descuento por pronto pago
   *     responses:
   *       201:
   *         description: Descuento aplicado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     message:
   *                       type: string
   *                       example: Descuento del 15% aplicado exitosamente
   *                     data:
   *                       $ref: '#/components/schemas/ItemCuota'
   *       400:
   *         description: Porcentaje inválido o cuota sin ítems
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: Cuota no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async aplicarDescuentoGlobal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cuotaId } = req.params;
      const validatedData = aplicarDescuentoGlobalSchema.parse(req.body);
      const item = await this.service.aplicarDescuentoGlobal(
        parseInt(cuotaId),
        validatedData.porcentaje,
        validatedData.concepto
      );

      const response: ApiResponse = {
        success: true,
        message: `Descuento del ${validatedData.porcentaje}% aplicado exitosamente`,
        data: item
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/items-cuota/estadisticas:
   *   get:
   *     tags: [Items de Cuota]
   *     summary: Obtener estadísticas globales de ítems
   *     description: Retorna estadísticas agregadas de todos los ítems del sistema incluyendo conteos por tipo, categoría, montos totales, promedios y distribución de ítems automáticos vs manuales
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
   *                         totalItems:
   *                           type: integer
   *                           description: Total de ítems en el sistema
   *                         itemsAutomaticos:
   *                           type: integer
   *                         itemsManuales:
   *                           type: integer
   *                         montoTotal:
   *                           type: number
   *                           description: Suma total de todos los ítems
   *                         montoPromedio:
   *                           type: number
   *                           description: Monto promedio por ítem
   *                         porTipo:
   *                           type: object
   *                           description: Agrupación por tipo de ítem
   *                         porCategoria:
   *                           type: object
   *                           description: Agrupación por categoría de ítem
   *       200:
   *         description: Estadísticas obtenidas (sin errores)
   */
  async getGlobalStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await this.service.getGlobalStats();

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
   * /api/items-cuota/tipo/{codigo}:
   *   get:
   *     tags: [Items de Cuota]
   *     summary: Buscar ítems por tipo
   *     description: Retorna todos los ítems que pertenecen a un tipo específico (identificado por código de catálogo). Soporta paginación mediante query parameters limit y offset.
   *     parameters:
   *       - in: path
   *         name: codigo
   *         required: true
   *         schema:
   *           type: string
   *         description: Código del tipo de ítem (ej. BASE, ACTIVIDAD, DESCUENTO, RECARGO)
   *         example: BASE
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 50
   *         description: Cantidad máxima de resultados
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           default: 0
   *         description: Cantidad de resultados a omitir
   *     responses:
   *       200:
   *         description: Ítems encontrados exitosamente
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
   *                         $ref: '#/components/schemas/ItemCuota'
   *                     meta:
   *                       type: object
   *                       properties:
   *                         tipoItemCodigo:
   *                           type: string
   *                         total:
   *                           type: integer
   *                         limit:
   *                           type: integer
   *                         offset:
   *                           type: integer
   *       404:
   *         description: Tipo de ítem no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async findByTipoItemCodigo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { codigo } = req.params;
      const query = queryItemsSchema.parse(req.query);

      const items = await this.service.findByTipoItemCodigo(codigo, {
        limit: query.limit,
        offset: query.offset
      });

      const response: ApiResponse = {
        success: true,
        data: items,
        meta: {
          tipoItemCodigo: codigo,
          total: items.length,
          limit: query.limit,
          offset: query.offset
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/items-cuota/categoria/{codigo}:
   *   get:
   *     tags: [Items de Cuota]
   *     summary: Buscar ítems por categoría
   *     description: Retorna todos los ítems que pertenecen a una categoría específica (identificada por código de catálogo). Soporta paginación mediante query parameters limit y offset. Útil para filtrar ítems por naturaleza del cargo (ej. cuota_base, actividad_musical, descuento_familiar).
   *     parameters:
   *       - in: path
   *         name: codigo
   *         required: true
   *         schema:
   *           type: string
   *         description: Código de la categoría de ítem
   *         example: cuota_base
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 50
   *         description: Cantidad máxima de resultados
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           default: 0
   *         description: Cantidad de resultados a omitir
   *     responses:
   *       200:
   *         description: Ítems encontrados exitosamente
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
   *                         $ref: '#/components/schemas/ItemCuota'
   *                     meta:
   *                       type: object
   *                       properties:
   *                         categoriaCodigo:
   *                           type: string
   *                         total:
   *                           type: integer
   *                         limit:
   *                           type: integer
   *                         offset:
   *                           type: integer
   *       404:
   *         description: Categoría de ítem no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async findByCategoriaCodigo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { codigo } = req.params;
      const query = queryItemsSchema.parse(req.query);

      const items = await this.service.findByCategoriaCodigo(codigo, {
        limit: query.limit,
        offset: query.offset
      });

      const response: ApiResponse = {
        success: true,
        data: items,
        meta: {
          categoriaCodigo: codigo,
          total: items.length,
          limit: query.limit,
          offset: query.offset
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}
