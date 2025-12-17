import { Request, Response, NextFunction } from 'express';
import { TipoItemCuotaService } from '@/services/tipo-item-cuota.service';
import {
  createTipoItemCuotaSchema,
  updateTipoItemCuotaSchema,
  updateFormulaSchema,
  cloneTipoItemSchema,
  reorderTiposItemSchema
} from '@/dto/item-cuota.dto';
import { ApiResponse } from '@/types/interfaces';
import { HttpStatus } from '@/types/enums';

/**
 * Controller para gestión de Tipos de Ítems de Cuota
 * Catálogo 100% CRUD editable desde UI de admin
 */
export class TipoItemCuotaController {
  constructor(private service: TipoItemCuotaService) {}

  /**
   * @swagger
   * /api/catalogos/tipos-items-cuota:
   *   get:
   *     tags: [Catálogos]
   *     summary: Listar todos los tipos de ítems de cuota
   *     description: Obtiene todos los tipos de ítems, con opción de incluir inactivos y filtrar por categoría
   *     parameters:
   *       - in: query
   *         name: includeInactive
   *         schema:
   *           type: boolean
   *           default: false
   *         description: Si es true, incluye tipos inactivos
   *       - in: query
   *         name: categoriaItemId
   *         schema:
   *           type: integer
   *         description: Filtrar por ID de categoría de ítem
   *     responses:
   *       200:
   *         description: Lista de tipos obtenida exitosamente
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
   *                         example: "CUOTA_BASE_SOCIO"
   *                       nombre:
   *                         type: string
   *                         example: "Cuota Base de Socio"
   *                       descripcion:
   *                         type: string
   *                         nullable: true
   *                         example: "Cuota mensual base según categoría"
   *                       categoriaItemId:
   *                         type: integer
   *                         example: 1
   *                       esCalculado:
   *                         type: boolean
   *                         example: true
   *                       formula:
   *                         type: object
   *                         nullable: true
   *                         example: {"tipo": "porcentaje_desde_bd", "tabla": "categorias_socios", "campo": "cuota_base"}
   *                       montoDefault:
   *                         type: number
   *                         nullable: true
   *                         example: 50.00
   *                       aplicaDescuentos:
   *                         type: boolean
   *                         example: true
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
   *                       example: 12
   *                     includeInactive:
   *                       type: boolean
   *                       example: false
   *                     categoriaItemId:
   *                       type: integer
   *                       nullable: true
   *                       example: 1
   *       500:
   *         description: Error interno del servidor
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const categoriaItemId = req.query.categoriaItemId
        ? parseInt(req.query.categoriaItemId as string)
        : undefined;

      const tipos = await this.service.getAll({
        includeInactive,
        categoriaItemId
      });

      const response: ApiResponse = {
        success: true,
        data: tipos,
        meta: {
          total: tipos.length,
          includeInactive,
          categoriaItemId
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/catalogos/tipos-items-cuota/{id}:
   *   get:
   *     tags: [Catálogos]
   *     summary: Obtener tipo de ítem de cuota por ID
   *     description: Obtiene los detalles de un tipo de ítem específico con su categoría y fórmula
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del tipo de ítem
   *     responses:
   *       200:
   *         description: Tipo de ítem encontrado exitosamente
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
   *                       example: "CUOTA_BASE_SOCIO"
   *                     nombre:
   *                       type: string
   *                       example: "Cuota Base de Socio"
   *                     descripcion:
   *                       type: string
   *                       nullable: true
   *                     categoriaItemId:
   *                       type: integer
   *                       example: 1
   *                     esCalculado:
   *                       type: boolean
   *                       example: true
   *                     formula:
   *                       type: object
   *                       nullable: true
   *                       example: {"tipo": "porcentaje_desde_bd", "tabla": "categorias_socios", "campo": "cuota_base"}
   *                     montoDefault:
   *                       type: number
   *                       nullable: true
   *                       example: 50.00
   *                     aplicaDescuentos:
   *                       type: boolean
   *                       example: true
   *                     activo:
   *                       type: boolean
   *                       example: true
   *                     orden:
   *                       type: integer
   *                       example: 1
   *       404:
   *         description: Tipo de ítem no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tipo = await this.service.getById(parseInt(id));

      const response: ApiResponse = {
        success: true,
        data: tipo
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/catalogos/tipos-items-cuota/codigo/{codigo}:
   *   get:
   *     tags: [Catálogos]
   *     summary: Obtener tipo de ítem de cuota por código
   *     description: Obtiene los detalles de un tipo de ítem usando su código único (ej. CUOTA_BASE_SOCIO)
   *     parameters:
   *       - in: path
   *         name: codigo
   *         required: true
   *         schema:
   *           type: string
   *         description: Código único del tipo de ítem (mayúsculas)
   *         example: "CUOTA_BASE_SOCIO"
   *     responses:
   *       200:
   *         description: Tipo de ítem encontrado exitosamente
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
   *                       example: "CUOTA_BASE_SOCIO"
   *                     nombre:
   *                       type: string
   *                       example: "Cuota Base de Socio"
   *                     esCalculado:
   *                       type: boolean
   *                       example: true
   *                     formula:
   *                       type: object
   *                       nullable: true
   *       404:
   *         description: Tipo de ítem no encontrado con ese código
   *       500:
   *         description: Error interno del servidor
   */
  async getByCodigo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { codigo } = req.params;
      const tipo = await this.service.getByCodigo(codigo);

      const response: ApiResponse = {
        success: true,
        data: tipo
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/catalogos/tipos-items-cuota/categoria/{categoriaCodigo}:
   *   get:
   *     tags: [Catálogos]
   *     summary: Obtener tipos de ítems por código de categoría
   *     description: Filtra tipos de ítems por código de categoría (ej. BASE, DESCUENTO, ACTIVIDAD)
   *     parameters:
   *       - in: path
   *         name: categoriaCodigo
   *         required: true
   *         schema:
   *           type: string
   *         description: Código de la categoría de ítem
   *         example: "BASE"
   *       - in: query
   *         name: includeInactive
   *         schema:
   *           type: boolean
   *           default: false
   *         description: Si es true, incluye tipos inactivos
   *     responses:
   *       200:
   *         description: Lista de tipos obtenida exitosamente
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
   *                       codigo:
   *                         type: string
   *                       nombre:
   *                         type: string
   *                       categoriaItemId:
   *                         type: integer
   *                 meta:
   *                   type: object
   *                   properties:
   *                     categoriaCodigo:
   *                       type: string
   *                       example: "BASE"
   *                     total:
   *                       type: integer
   *                       example: 3
   *       500:
   *         description: Error interno del servidor
   */
  async getByCategoriaCodigo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { categoriaCodigo } = req.params;
      const includeInactive = req.query.includeInactive === 'true';

      const tipos = await this.service.getByCategoriaCodigo(categoriaCodigo, includeInactive);

      const response: ApiResponse = {
        success: true,
        data: tipos,
        meta: {
          categoriaCodigo,
          total: tipos.length
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/catalogos/tipos-items-cuota/calculados:
   *   get:
   *     tags: [Catálogos]
   *     summary: Obtener tipos de ítems calculados
   *     description: Retorna solo los tipos de ítems con esCalculado=true (tienen fórmula automática)
   *     parameters:
   *       - in: query
   *         name: includeInactive
   *         schema:
   *           type: boolean
   *           default: false
   *         description: Si es true, incluye tipos inactivos
   *     responses:
   *       200:
   *         description: Lista de tipos calculados obtenida exitosamente
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
   *                       codigo:
   *                         type: string
   *                       nombre:
   *                         type: string
   *                       esCalculado:
   *                         type: boolean
   *                         example: true
   *                       formula:
   *                         type: object
   *                         example: {"tipo": "porcentaje_fijo", "valor": 10.5}
   *                 meta:
   *                   type: object
   *                   properties:
   *                     total:
   *                       type: integer
   *                       example: 5
   *                     tipo:
   *                       type: string
   *                       example: "calculados"
   *       500:
   *         description: Error interno del servidor
   */
  async getCalculados(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const tipos = await this.service.getCalculados(includeInactive);

      const response: ApiResponse = {
        success: true,
        data: tipos,
        meta: {
          total: tipos.length,
          tipo: 'calculados'
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/catalogos/tipos-items-cuota/manuales:
   *   get:
   *     tags: [Catálogos]
   *     summary: Obtener tipos de ítems manuales
   *     description: Retorna solo los tipos de ítems con esCalculado=false (monto ingresado manualmente)
   *     parameters:
   *       - in: query
   *         name: includeInactive
   *         schema:
   *           type: boolean
   *           default: false
   *         description: Si es true, incluye tipos inactivos
   *     responses:
   *       200:
   *         description: Lista de tipos manuales obtenida exitosamente
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
   *                       codigo:
   *                         type: string
   *                       nombre:
   *                         type: string
   *                       esCalculado:
   *                         type: boolean
   *                         example: false
   *                       montoDefault:
   *                         type: number
   *                         nullable: true
   *                         example: 50.00
   *                 meta:
   *                   type: object
   *                   properties:
   *                     total:
   *                       type: integer
   *                       example: 7
   *                     tipo:
   *                       type: string
   *                       example: "manuales"
   *       500:
   *         description: Error interno del servidor
   */
  async getManuales(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const tipos = await this.service.getManuales(includeInactive);

      const response: ApiResponse = {
        success: true,
        data: tipos,
        meta: {
          total: tipos.length,
          tipo: 'manuales'
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/catalogos/tipos-items-cuota/resumen-por-categoria:
   *   get:
   *     tags: [Catálogos]
   *     summary: Obtener resumen agrupado por categoría
   *     description: Retorna estadísticas de tipos de ítems agrupadas por categoría (conteo por categoría)
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
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       categoriaId:
   *                         type: integer
   *                         example: 1
   *                       categoriaCodigo:
   *                         type: string
   *                         example: "BASE"
   *                       categoriaNombre:
   *                         type: string
   *                         example: "Cuota Base"
   *                       totalTipos:
   *                         type: integer
   *                         description: Cantidad de tipos en esta categoría
   *                         example: 3
   *                       tiposActivos:
   *                         type: integer
   *                         description: Cantidad de tipos activos
   *                         example: 2
   *       500:
   *         description: Error interno del servidor
   */
  async getSummaryByCategoria(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await this.service.getSummaryByCategoria();

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
   * /api/catalogos/tipos-items-cuota/{id}/estadisticas:
   *   get:
   *     tags: [Catálogos]
   *     summary: Obtener estadísticas de uso de un tipo de ítem
   *     description: Retorna cuántos ítems de cuota activos están asociados a este tipo
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del tipo de ítem
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
   *                     tipoItemId:
   *                       type: integer
   *                       example: 1
   *                     codigo:
   *                       type: string
   *                       example: "CUOTA_BASE_SOCIO"
   *                     nombre:
   *                       type: string
   *                       example: "Cuota Base de Socio"
   *                     totalItems:
   *                       type: integer
   *                       description: Número de ítems activos que usan este tipo
   *                       example: 45
   *                     cuotasAfectadas:
   *                       type: integer
   *                       description: Número de cuotas que contienen ítems de este tipo
   *                       example: 38
   *       404:
   *         description: Tipo de ítem no encontrado
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
   * /api/catalogos/tipos-items-cuota:
   *   post:
   *     tags: [Catálogos]
   *     summary: Crear nuevo tipo de ítem de cuota
   *     description: Crea un nuevo tipo de ítem en el catálogo (puede ser calculado o manual)
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - codigo
   *               - nombre
   *               - categoriaItemId
   *               - esCalculado
   *               - aplicaDescuentos
   *               - orden
   *             properties:
   *               codigo:
   *                 type: string
   *                 description: Código único (será convertido a mayúsculas)
   *                 example: "CUOTA_BASE_SOCIO"
   *               nombre:
   *                 type: string
   *                 description: Nombre descriptivo del tipo
   *                 example: "Cuota Base de Socio"
   *               descripcion:
   *                 type: string
   *                 nullable: true
   *                 description: Descripción opcional
   *                 example: "Cuota mensual según categoría de socio"
   *               categoriaItemId:
   *                 type: integer
   *                 description: ID de la categoría de ítem
   *                 example: 1
   *               esCalculado:
   *                 type: boolean
   *                 description: Si es true, requiere fórmula. Si es false, requiere montoDefault
   *                 example: true
   *               formula:
   *                 type: object
   *                 nullable: true
   *                 description: Fórmula de cálculo automático (requerido si esCalculado=true)
   *                 example: {"tipo": "porcentaje_desde_bd", "tabla": "categorias_socios", "campo": "cuota_base"}
   *               montoDefault:
   *                 type: number
   *                 nullable: true
   *                 description: Monto por defecto (requerido si esCalculado=false)
   *                 example: 50.00
   *               aplicaDescuentos:
   *                 type: boolean
   *                 description: Si acepta descuentos aplicables
   *                 example: true
   *               orden:
   *                 type: integer
   *                 description: Orden de visualización
   *                 example: 1
   *     responses:
   *       201:
   *         description: Tipo de ítem creado exitosamente
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
   *                   example: "Tipo de ítem creado exitosamente"
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 1
   *                     codigo:
   *                       type: string
   *                       example: "CUOTA_BASE_SOCIO"
   *                     nombre:
   *                       type: string
   *                       example: "Cuota Base de Socio"
   *                     esCalculado:
   *                       type: boolean
   *                       example: true
   *                     formula:
   *                       type: object
   *                       nullable: true
   *                     activo:
   *                       type: boolean
   *                       example: true
   *       400:
   *         description: Error de validación (campos inválidos, fórmula inválida)
   *       409:
   *         description: Conflicto - código duplicado
   *       500:
   *         description: Error interno del servidor
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createTipoItemCuotaSchema.parse(req.body);
      const tipo = await this.service.create(validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Tipo de ítem creado exitosamente',
        data: tipo
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/catalogos/tipos-items-cuota/{id}:
   *   put:
   *     tags: [Catálogos]
   *     summary: Actualizar tipo de ítem de cuota
   *     description: Actualiza un tipo existente (no permite cambiar el código)
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del tipo de ítem
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               nombre:
   *                 type: string
   *                 description: Nombre descriptivo del tipo
   *                 example: "Cuota Base Mensual de Socio"
   *               descripcion:
   *                 type: string
   *                 nullable: true
   *                 description: Descripción opcional
   *               categoriaItemId:
   *                 type: integer
   *                 description: ID de la categoría de ítem
   *                 example: 1
   *               esCalculado:
   *                 type: boolean
   *                 description: Si es calculado (requiere fórmula) o manual (requiere montoDefault)
   *                 example: true
   *               formula:
   *                 type: object
   *                 nullable: true
   *                 description: Fórmula de cálculo (requerido si esCalculado=true)
   *               montoDefault:
   *                 type: number
   *                 nullable: true
   *                 description: Monto por defecto (requerido si esCalculado=false)
   *               aplicaDescuentos:
   *                 type: boolean
   *                 description: Si acepta descuentos
   *               orden:
   *                 type: integer
   *                 description: Orden de visualización
   *     responses:
   *       200:
   *         description: Tipo de ítem actualizado exitosamente
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
   *                   example: "Tipo de ítem actualizado exitosamente"
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 1
   *                     codigo:
   *                       type: string
   *                       example: "CUOTA_BASE_SOCIO"
   *                     nombre:
   *                       type: string
   *                       example: "Cuota Base Mensual de Socio"
   *                     activo:
   *                       type: boolean
   *                       example: true
   *       400:
   *         description: Error de validación
   *       404:
   *         description: Tipo de ítem no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateTipoItemCuotaSchema.parse(req.body);
      const tipo = await this.service.update(parseInt(id), validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Tipo de ítem actualizado exitosamente',
        data: tipo
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/catalogos/tipos-items-cuota/{id}/formula:
   *   patch:
   *     tags: [Catálogos]
   *     summary: Actualizar solo la fórmula de cálculo
   *     description: Endpoint especializado para modificar únicamente la fórmula JSONB de un tipo calculado
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del tipo de ítem
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - formula
   *             properties:
   *               formula:
   *                 type: object
   *                 description: Nueva fórmula de cálculo
   *                 example: {"tipo": "porcentaje_fijo", "valor": 15.5}
   *     responses:
   *       200:
   *         description: Fórmula actualizada exitosamente
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
   *                   example: "Fórmula actualizada exitosamente"
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 1
   *                     codigo:
   *                       type: string
   *                       example: "DESC_CATEGORIA"
   *                     formula:
   *                       type: object
   *                       example: {"tipo": "porcentaje_fijo", "valor": 15.5}
   *       400:
   *         description: Error de validación (fórmula inválida o tipo no es calculado)
   *       404:
   *         description: Tipo de ítem no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  async updateFormula(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateFormulaSchema.parse(req.body);
      const tipo = await this.service.updateFormula(parseInt(id), validatedData.formula);

      const response: ApiResponse = {
        success: true,
        message: 'Fórmula actualizada exitosamente',
        data: tipo
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/catalogos/tipos-items-cuota/{id}/desactivar:
   *   patch:
   *     tags: [Catálogos]
   *     summary: Desactivar tipo de ítem de cuota
   *     description: Desactiva un tipo de ítem (soft delete, marca activo=false)
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del tipo de ítem
   *     responses:
   *       200:
   *         description: Tipo de ítem desactivado exitosamente
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
   *                   example: "Tipo de ítem desactivado exitosamente"
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 1
   *                     codigo:
   *                       type: string
   *                       example: "CUOTA_BASE_SOCIO"
   *                     activo:
   *                       type: boolean
   *                       example: false
   *       404:
   *         description: Tipo de ítem no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  async deactivate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tipo = await this.service.deactivate(parseInt(id));

      const response: ApiResponse = {
        success: true,
        message: 'Tipo de ítem desactivado exitosamente',
        data: tipo
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/catalogos/tipos-items-cuota/{id}/activar:
   *   patch:
   *     tags: [Catálogos]
   *     summary: Activar tipo de ítem de cuota
   *     description: Activa un tipo de ítem desactivado (marca activo=true)
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del tipo de ítem
   *     responses:
   *       200:
   *         description: Tipo de ítem activado exitosamente
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
   *                   example: "Tipo de ítem activado exitosamente"
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 1
   *                     codigo:
   *                       type: string
   *                       example: "CUOTA_BASE_SOCIO"
   *                     activo:
   *                       type: boolean
   *                       example: true
   *       404:
   *         description: Tipo de ítem no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  async activate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tipo = await this.service.activate(parseInt(id));

      const response: ApiResponse = {
        success: true,
        message: 'Tipo de ítem activado exitosamente',
        data: tipo
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/catalogos/tipos-items-cuota/{id}:
   *   delete:
   *     tags: [Catálogos]
   *     summary: Eliminar tipo de ítem de cuota
   *     description: Elimina físicamente un tipo de ítem (hard delete). Solo permitido si no tiene ítems de cuota asociados
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del tipo de ítem
   *     responses:
   *       200:
   *         description: Tipo de ítem eliminado exitosamente
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
   *                   example: "Tipo de ítem eliminado exitosamente"
   *       404:
   *         description: Tipo de ítem no encontrado
   *       409:
   *         description: Conflicto - El tipo tiene ítems de cuota asociados
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
   *                   example: "No se puede eliminar el tipo porque tiene 12 ítems de cuota asociados"
   *       500:
   *         description: Error interno del servidor
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.service.delete(parseInt(id));

      const response: ApiResponse = {
        success: true,
        message: 'Tipo de ítem eliminado exitosamente'
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/catalogos/tipos-items-cuota/{id}/clonar:
   *   post:
   *     tags: [Catálogos]
   *     summary: Clonar tipo de ítem de cuota
   *     description: Crea una copia de un tipo existente con nuevo código y nombre (útil para crear variantes)
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del tipo de ítem a clonar
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - nuevoCodigo
   *               - nuevoNombre
   *             properties:
   *               nuevoCodigo:
   *                 type: string
   *                 description: Código único para el tipo clonado (será convertido a mayúsculas)
   *                 example: "CUOTA_BASE_SOCIO_V2"
   *               nuevoNombre:
   *                 type: string
   *                 description: Nombre para el tipo clonado
   *                 example: "Cuota Base de Socio V2"
   *     responses:
   *       201:
   *         description: Tipo de ítem clonado exitosamente
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
   *                   example: "Tipo de ítem clonado exitosamente"
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       description: ID del nuevo tipo clonado
   *                       example: 13
   *                     codigo:
   *                       type: string
   *                       example: "CUOTA_BASE_SOCIO_V2"
   *                     nombre:
   *                       type: string
   *                       example: "Cuota Base de Socio V2"
   *                     esCalculado:
   *                       type: boolean
   *                       description: Copiado del tipo original
   *                       example: true
   *                     formula:
   *                       type: object
   *                       nullable: true
   *                       description: Copiada del tipo original
   *       400:
   *         description: Error de validación
   *       404:
   *         description: Tipo de ítem original no encontrado
   *       409:
   *         description: Conflicto - El nuevo código ya existe
   *       500:
   *         description: Error interno del servidor
   */
  async clone(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = cloneTipoItemSchema.parse(req.body);
      const tipo = await this.service.clone(
        parseInt(id),
        validatedData.nuevoCodigo,
        validatedData.nuevoNombre
      );

      const response: ApiResponse = {
        success: true,
        message: 'Tipo de ítem clonado exitosamente',
        data: tipo
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/catalogos/tipos-items-cuota/reordenar:
   *   post:
   *     tags: [Catálogos]
   *     summary: Reordenar tipos de ítems de cuota
   *     description: Actualiza el orden de visualización de múltiples tipos de ítems en lote
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
   *                       description: ID del tipo de ítem
   *                       example: 1
   *                     orden:
   *                       type: integer
   *                       description: Nuevo orden de visualización
   *                       example: 2
   *                 example:
   *                   - id: 1
   *                     orden: 3
   *                   - id: 2
   *                     orden: 1
   *                   - id: 3
   *                     orden: 2
   *     responses:
   *       200:
   *         description: Tipos de ítems reordenados exitosamente
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
   *                   example: "3 tipos de ítem reordenados exitosamente"
   *                 data:
   *                   type: object
   *                   properties:
   *                     updated:
   *                       type: integer
   *                       description: Número de tipos actualizados
   *                       example: 3
   *       400:
   *         description: Error de validación (formato incorrecto del array)
   *       500:
   *         description: Error interno del servidor
   */
  async reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = reorderTiposItemSchema.parse(req.body);
      const result = await this.service.reorder(validatedData.ordenamiento);

      const response: ApiResponse = {
        success: true,
        message: `${result.updated} tipos de ítem reordenados exitosamente`,
        data: result
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}
