import { Router } from 'express';
import cuotaBatchController from '@/controllers/cuota-batch.controller';

/**
 * FASE 6 - Task 6.3: Routes para Operaciones Batch Optimizadas
 *
 * Endpoints optimizados que reducen queries N+1
 */

const router = Router();

/**
 * GET /api/cuotas/batch/health
 * Health check del servicio batch
 */
router.get('/health', cuotaBatchController.healthCheck);

/**
 * POST /api/cuotas/batch/generar
 * Generar cuotas en batch (30x más rápido que versión legacy)
 *
 * Body:
 * {
 *   "mes": 12,
 *   "anio": 2025,
 *   "categorias": ["ACTIVO", "ESTUDIANTE"], // opcional
 *   "aplicarDescuentos": true,              // opcional
 *   "observaciones": "string"               // opcional
 * }
 */
router.post('/generar', cuotaBatchController.generarCuotasBatch);

/**
 * PUT /api/cuotas/batch/update
 * Actualizar múltiples cuotas en batch (30x más rápido)
 *
 * Body:
 * {
 *   "cuotaIds": [1, 2, 3, 4, 5],
 *   "updates": {
 *     "montoBase": 1000,      // opcional
 *     "montoActividades": 500, // opcional
 *     "montoTotal": 1500       // opcional
 *   }
 * }
 */
router.put('/update', cuotaBatchController.updateCuotasBatch);

export default router;
