import { Router } from 'express';
import { RollbackCuotaController } from '@/controllers/rollback-cuota.controller';
import { RollbackCuotaService } from '@/services/rollback-cuota.service';

const router = Router();

// Inicializar servicio y controlador
const rollbackService = new RollbackCuotaService();
const rollbackController = new RollbackCuotaController(rollbackService);

/**
 * @route GET /api/rollback/cuotas/health
 * @desc Health check del servicio de rollback
 * @access Public
 */
router.get('/health', rollbackController.healthCheck);

/**
 * @route POST /api/rollback/cuotas/validar
 * @desc Valida si se puede hacer rollback de un período
 * @body {ValidarRollbackDto}
 * @access Private
 *
 * @example
 * {
 *   "mes": 12,
 *   "anio": 2025
 * }
 */
router.post('/validar', rollbackController.validarRollback);

/**
 * @route POST /api/rollback/cuotas/generacion
 * @desc Hace rollback de generación masiva de un período
 * @body {RollbackGeneracionDto}
 * @access Private
 *
 * @example Preview:
 * {
 *   "mes": 12,
 *   "anio": 2025,
 *   "modo": "PREVIEW"
 * }
 *
 * @example Aplicar:
 * {
 *   "mes": 12,
 *   "anio": 2025,
 *   "modo": "APLICAR",
 *   "confirmarRollback": true,
 *   "motivo": "Generación errónea, se debe regenerar",
 *   "opciones": {
 *     "eliminarCuotasPendientes": true,
 *     "eliminarCuotasPagadas": false,
 *     "crearBackup": true
 *   }
 * }
 */
router.post('/generacion', rollbackController.rollbackGeneracion);

/**
 * @route POST /api/rollback/cuotas/:id
 * @desc Hace rollback de una cuota individual
 * @param {number} id - ID de la cuota
 * @body {Partial<RollbackCuotaDto>}
 * @access Private
 *
 * @example Preview:
 * POST /api/rollback/cuotas/123
 * {
 *   "modo": "PREVIEW"
 * }
 *
 * @example Aplicar:
 * POST /api/rollback/cuotas/123
 * {
 *   "modo": "APLICAR",
 *   "confirmarRollback": true,
 *   "motivo": "Cuota generada con error",
 *   "eliminarRecibo": true
 * }
 */
router.post('/:id', rollbackController.rollbackCuota);

export default router;
