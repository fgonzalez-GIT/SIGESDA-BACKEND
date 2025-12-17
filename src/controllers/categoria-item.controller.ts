import { Request, Response, NextFunction } from 'express';
import { CategoriaItemService } from '@/services/categoria-item.service';
import {
  createCategoriaItemSchema,
  updateCategoriaItemSchema,
  reorderCategoriasSchema
} from '@/dto/item-cuota.dto';
import { ApiResponse } from '@/types/interfaces';
import { HttpStatus } from '@/types/enums';

/**
 * Controller para gestión de Categorías de Ítems de Cuota
 * Catálogo 100% CRUD editable desde UI de admin
 */
export class CategoriaItemController {
  constructor(private service: CategoriaItemService) {}

  /**
   * @swagger
   * /api/catalogos/categorias-items:
   *   get:
   *     tags: [Catálogos]
   *     summary: Listar todas las categorías de ítems
   *     description: Obtiene todas las categorías de ítems, con opción de incluir inactivas
   *     parameters:
   *       - in: query
   *         name: includeInactive
   *         schema:
   *           type: boolean
   *           default: false
   *         description: Si es true, incluye categorías inactivas
   *     responses:
   *       200:
   *         description: Lista de categorías obtenida exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                         example: 1
   *                       codigo:
   *                         type: string
   *                         example: "BASE"
   *                       nombre:
   *                         type: string
   *                         example: "Cuota Base"
   *                       descripcion:
   *                         type: string
   *                         nullable: true
   *                         example: "Categoría para cuota base mensual"
   *                       color:
   *                         type: string
   *                         example: "#3B82F6"
   *                       icono:
   *                         type: string
   *                         example: "receipt"
   *                       activo:
   *                         type: boolean
   *                         example: true
   *                       orden:
   *                         type: integer
   *                         example: 1
   *                       createdAt:
   *                         type: string
   *                         format: date-time
   *                       updatedAt:
   *                         type: string
   *                         format: date-time
   *                 meta:
   *                   type: object
   *                   properties:
   *                     total:
   *                       type: integer
   *                       example: 6
   *                     includeInactive:
   *                       type: boolean
   *                       example: false
   *       500:
   *         description: Error interno del servidor
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const categorias = await this.service.getAll(includeInactive);

      const response: ApiResponse = {
        success: true,
        data: categorias,
        meta: {
          total: categorias.length,
          includeInactive
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/catalogos/categorias-items/{id}:
   *   get:
   *     tags: [Catálogos]
   *     summary: Obtener categoría de ítem por ID
   *     description: Obtiene los detalles de una categoría de ítem específica
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de la categoría
   *     responses:
   *       200:
   *         description: Categoría encontrada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 1
   *                     codigo:
   *                       type: string
   *                       example: "BASE"
   *                     nombre:
   *                       type: string
   *                       example: "Cuota Base"
   *                     descripcion:
   *                       type: string
   *                       nullable: true
   *                       example: "Categoría para cuota base mensual"
   *                     color:
   *                       type: string
   *                       example: "#3B82F6"
   *                     icono:
   *                       type: string
   *                       example: "receipt"
   *                     activo:
   *                       type: boolean
   *                       example: true
   *                     orden:
   *                       type: integer
   *                       example: 1
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                     updatedAt:
   *                       type: string
   *                       format: date-time
   *       404:
   *         description: Categoría no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const categoria = await this.service.getById(parseInt(id));

      const response: ApiResponse = {
        success: true,
        data: categoria
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/catalogos/categorias-items/codigo/{codigo}:
   *   get:
   *     tags: [Catálogos]
   *     summary: Obtener categoría de ítem por código
   *     description: Obtiene los detalles de una categoría de ítem usando su código único (ej. BASE, ACTIVIDAD)
   *     parameters:
   *       - in: path
   *         name: codigo
   *         required: true
   *         schema:
   *           type: string
   *         description: Código único de la categoría (mayúsculas)
   *         example: "BASE"
   *     responses:
   *       200:
   *         description: Categoría encontrada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 1
   *                     codigo:
   *                       type: string
   *                       example: "BASE"
   *                     nombre:
   *                       type: string
   *                       example: "Cuota Base"
   *                     descripcion:
   *                       type: string
   *                       nullable: true
   *                     color:
   *                       type: string
   *                       example: "#3B82F6"
   *                     icono:
   *                       type: string
   *                       example: "receipt"
   *                     activo:
   *                       type: boolean
   *                       example: true
   *                     orden:
   *                       type: integer
   *                       example: 1
   *       404:
   *         description: Categoría no encontrada con ese código
   *       500:
   *         description: Error interno del servidor
   */
  async getByCodigo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { codigo } = req.params;
      const categoria = await this.service.getByCodigo(codigo);

      const response: ApiResponse = {
        success: true,
        data: categoria
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/catalogos/categorias-items/resumen:
   *   get:
   *     tags: [Catálogos]
   *     summary: Obtener resumen de categorías de ítems
   *     description: Retorna estadísticas generales del catálogo de categorías (total, activos, inactivos)
   *     responses:
   *       200:
   *         description: Resumen obtenido exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     total:
   *                       type: integer
   *                       description: Total de categorías (activas + inactivas)
   *                       example: 6
   *                     activos:
   *                       type: integer
   *                       description: Número de categorías activas
   *                       example: 5
   *                     inactivos:
   *                       type: integer
   *                       description: Número de categorías inactivas
   *                       example: 1
   *       500:
   *         description: Error interno del servidor
   */
  async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await this.service.getSummary();

      const response: ApiResponse = {
        success: true,
        data: summary
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/catalogos/categorias-items/{id}/estadisticas:
   *   get:
   *     tags: [Catálogos]
   *     summary: Obtener estadísticas de uso de una categoría
   *     description: Retorna cuántos tipos de ítems e ítems activos están asociados a esta categoría
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de la categoría
   *     responses:
   *       200:
   *         description: Estadísticas obtenidas exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     categoriaId:
   *                       type: integer
   *                       example: 1
   *                     totalTiposItem:
   *                       type: integer
   *                       description: Número de tipos de ítems que usan esta categoría
   *                       example: 3
   *                     totalItems:
   *                       type: integer
   *                       description: Número de ítems activos asociados a esta categoría
   *                       example: 12
   *       404:
   *         description: Categoría no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async getUsageStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const stats = await this.service.getUsageStats(parseInt(id));

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
   * /api/catalogos/categorias-items:
   *   post:
   *     tags: [Catálogos]
   *     summary: Crear nueva categoría de ítem
   *     description: Crea una nueva categoría de ítem en el catálogo
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - codigo
   *               - nombre
   *               - color
   *               - icono
   *               - orden
   *             properties:
   *               codigo:
   *                 type: string
   *                 description: Código único (será convertido a mayúsculas)
   *                 example: "DESCUENTO"
   *               nombre:
   *                 type: string
   *                 description: Nombre descriptivo de la categoría
   *                 example: "Descuento"
   *               descripcion:
   *                 type: string
   *                 nullable: true
   *                 description: Descripción opcional
   *                 example: "Categoría para descuentos aplicables"
   *               color:
   *                 type: string
   *                 description: Código hexadecimal de color para UI
   *                 example: "#10B981"
   *               icono:
   *                 type: string
   *                 description: Nombre de icono (ej. material-icons)
   *                 example: "discount"
   *               orden:
   *                 type: integer
   *                 description: Orden de visualización
   *                 example: 3
   *     responses:
   *       201:
   *         description: Categoría creada exitosamente
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
   *                   example: "Categoría de ítem creada exitosamente"
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 3
   *                     codigo:
   *                       type: string
   *                       example: "DESCUENTO"
   *                     nombre:
   *                       type: string
   *                       example: "Descuento"
   *                     descripcion:
   *                       type: string
   *                       nullable: true
   *                     color:
   *                       type: string
   *                       example: "#10B981"
   *                     icono:
   *                       type: string
   *                       example: "discount"
   *                     activo:
   *                       type: boolean
   *                       example: true
   *                     orden:
   *                       type: integer
   *                       example: 3
   *       400:
   *         description: Error de validación (campos inválidos)
   *       409:
   *         description: Conflicto - código duplicado
   *       500:
   *         description: Error interno del servidor
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createCategoriaItemSchema.parse(req.body);
      const categoria = await this.service.create(validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Categoría de ítem creada exitosamente',
        data: categoria
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/catalogos/categorias-items/{id}:
   *   put:
   *     tags: [Catálogos]
   *     summary: Actualizar categoría de ítem
   *     description: Actualiza una categoría existente (no permite cambiar el código)
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de la categoría
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               nombre:
   *                 type: string
   *                 description: Nombre descriptivo de la categoría
   *                 example: "Cuota Base Mensual"
   *               descripcion:
   *                 type: string
   *                 nullable: true
   *                 description: Descripción opcional
   *                 example: "Categoría actualizada para cuota base"
   *               color:
   *                 type: string
   *                 description: Código hexadecimal de color para UI
   *                 example: "#3B82F6"
   *               icono:
   *                 type: string
   *                 description: Nombre de icono
   *                 example: "receipt"
   *               orden:
   *                 type: integer
   *                 description: Orden de visualización
   *                 example: 1
   *     responses:
   *       200:
   *         description: Categoría actualizada exitosamente
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
   *                   example: "Categoría de ítem actualizada exitosamente"
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 1
   *                     codigo:
   *                       type: string
   *                       example: "BASE"
   *                     nombre:
   *                       type: string
   *                       example: "Cuota Base Mensual"
   *                     descripcion:
   *                       type: string
   *                       nullable: true
   *                     color:
   *                       type: string
   *                       example: "#3B82F6"
   *                     icono:
   *                       type: string
   *                       example: "receipt"
   *                     activo:
   *                       type: boolean
   *                       example: true
   *                     orden:
   *                       type: integer
   *                       example: 1
   *       400:
   *         description: Error de validación
   *       404:
   *         description: Categoría no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateCategoriaItemSchema.parse(req.body);
      const categoria = await this.service.update(parseInt(id), validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Categoría de ítem actualizada exitosamente',
        data: categoria
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/catalogos/categorias-items/{id}/desactivar:
   *   patch:
   *     tags: [Catálogos]
   *     summary: Desactivar categoría de ítem
   *     description: Desactiva una categoría (soft delete, marca activo=false)
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de la categoría
   *     responses:
   *       200:
   *         description: Categoría desactivada exitosamente
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
   *                   example: "Categoría de ítem desactivada exitosamente"
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 1
   *                     codigo:
   *                       type: string
   *                       example: "BASE"
   *                     nombre:
   *                       type: string
   *                       example: "Cuota Base"
   *                     activo:
   *                       type: boolean
   *                       example: false
   *       404:
   *         description: Categoría no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async deactivate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const categoria = await this.service.deactivate(parseInt(id));

      const response: ApiResponse = {
        success: true,
        message: 'Categoría de ítem desactivada exitosamente',
        data: categoria
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/catalogos/categorias-items/{id}/activar:
   *   patch:
   *     tags: [Catálogos]
   *     summary: Activar categoría de ítem
   *     description: Activa una categoría desactivada (marca activo=true)
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de la categoría
   *     responses:
   *       200:
   *         description: Categoría activada exitosamente
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
   *                   example: "Categoría de ítem activada exitosamente"
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 1
   *                     codigo:
   *                       type: string
   *                       example: "BASE"
   *                     nombre:
   *                       type: string
   *                       example: "Cuota Base"
   *                     activo:
   *                       type: boolean
   *                       example: true
   *       404:
   *         description: Categoría no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async activate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const categoria = await this.service.activate(parseInt(id));

      const response: ApiResponse = {
        success: true,
        message: 'Categoría de ítem activada exitosamente',
        data: categoria
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/catalogos/categorias-items/{id}:
   *   delete:
   *     tags: [Catálogos]
   *     summary: Eliminar categoría de ítem
   *     description: Elimina físicamente una categoría (hard delete). Solo permitido si no tiene tipos de ítems o ítems asociados
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de la categoría
   *     responses:
   *       200:
   *         description: Categoría eliminada exitosamente
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
   *                   example: "Categoría de ítem eliminada exitosamente"
   *       404:
   *         description: Categoría no encontrada
   *       409:
   *         description: Conflicto - La categoría tiene tipos de ítems o ítems asociados
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 error:
   *                   type: string
   *                   example: "No se puede eliminar la categoría porque tiene 3 tipos de ítems asociados"
   *       500:
   *         description: Error interno del servidor
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.service.delete(parseInt(id));

      const response: ApiResponse = {
        success: true,
        message: 'Categoría de ítem eliminada exitosamente'
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/catalogos/categorias-items/reordenar:
   *   post:
   *     tags: [Catálogos]
   *     summary: Reordenar categorías de ítems
   *     description: Actualiza el orden de visualización de múltiples categorías en lote
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - ordenamiento
   *             properties:
   *               ordenamiento:
   *                 type: array
   *                 description: Array de objetos con ID y nuevo orden
   *                 items:
   *                   type: object
   *                   required:
   *                     - id
   *                     - orden
   *                   properties:
   *                     id:
   *                       type: integer
   *                       description: ID de la categoría
   *                       example: 1
   *                     orden:
   *                       type: integer
   *                       description: Nuevo orden de visualización
   *                       example: 2
   *                 example:
   *                   - id: 1
   *                     orden: 2
   *                   - id: 2
   *                     orden: 1
   *                   - id: 3
   *                     orden: 3
   *     responses:
   *       200:
   *         description: Categorías reordenadas exitosamente
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
   *                   example: "3 categorías reordenadas exitosamente"
   *                 data:
   *                   type: object
   *                   properties:
   *                     updated:
   *                       type: integer
   *                       description: Número de categorías actualizadas
   *                       example: 3
   *       400:
   *         description: Error de validación (formato incorrecto del array)
   *       500:
   *         description: Error interno del servidor
   */
  async reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = reorderCategoriasSchema.parse(req.body);
      const result = await this.service.reorder(validatedData.ordenamiento);

      const response: ApiResponse = {
        success: true,
        message: `${result.updated} categorías reordenadas exitosamente`,
        data: result
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}
