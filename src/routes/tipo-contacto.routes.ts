/**
 * Rutas para gestión del catálogo de tipos de contacto
 * Base path: /api/catalogos/tipos-contacto
 */

import { Router } from 'express';
import { TipoContactoController } from '@/controllers/tipo-contacto.controller';
import { TipoContactoService } from '@/services/tipo-contacto.service';
import { prisma } from '@/config/database';

const router = Router();

// Initialize dependencies
const tipoContactoService = new TipoContactoService(prisma);
const tipoContactoController = new TipoContactoController(tipoContactoService);

// ======================================================================
// RUTAS DE GESTIÓN DE TIPOS DE CONTACTO (CATÁLOGO)
// ======================================================================

/**
 * GET /api/catalogos/tipos-contacto/estadisticas/uso
 * Obtener estadísticas de uso de tipos de contacto
 * IMPORTANTE: Esta ruta debe ir ANTES de /:id para evitar conflictos
 */
router.get(
  '/estadisticas/uso',
  tipoContactoController.getEstadisticasUso.bind(tipoContactoController)
);

/**
 * POST /api/catalogos/tipos-contacto
 * Crear tipo de contacto
 */
router.post(
  '/',
  tipoContactoController.create.bind(tipoContactoController)
);

/**
 * GET /api/catalogos/tipos-contacto
 * Obtener todos los tipos de contacto
 */
router.get(
  '/',
  tipoContactoController.findAll.bind(tipoContactoController)
);

/**
 * GET /api/catalogos/tipos-contacto/:id
 * Obtener tipo de contacto por ID
 */
router.get(
  '/:id',
  tipoContactoController.findById.bind(tipoContactoController)
);

/**
 * PUT /api/catalogos/tipos-contacto/:id
 * Actualizar tipo de contacto
 */
router.put(
  '/:id',
  tipoContactoController.update.bind(tipoContactoController)
);

/**
 * DELETE /api/catalogos/tipos-contacto/:id
 * Eliminar tipo de contacto (hard delete)
 */
router.delete(
  '/:id',
  tipoContactoController.delete.bind(tipoContactoController)
);

/**
 * POST /api/catalogos/tipos-contacto/:id/desactivar
 * Desactivar tipo de contacto (soft delete)
 */
router.post(
  '/:id/desactivar',
  tipoContactoController.deactivate.bind(tipoContactoController)
);

/**
 * POST /api/catalogos/tipos-contacto/:id/activar
 * Activar tipo de contacto
 */
router.post(
  '/:id/activar',
  tipoContactoController.activate.bind(tipoContactoController)
);

export default router;
