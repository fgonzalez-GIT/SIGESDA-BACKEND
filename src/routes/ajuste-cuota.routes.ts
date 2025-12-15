import { Router } from 'express';
import { AjusteCuotaController } from '@/controllers/ajuste-cuota.controller';
import { AjusteCuotaService } from '@/services/ajuste-cuota.service';
import { AjusteCuotaRepository } from '@/repositories/ajuste-cuota.repository';
import { HistorialAjusteCuotaRepository } from '@/repositories/historial-ajuste-cuota.repository';
import { PersonaRepository } from '@/repositories/persona.repository';
import { prisma } from '@/config/database';

const router = Router();

// Initialize dependencies
const ajusteRepository = new AjusteCuotaRepository(prisma);
const historialRepository = new HistorialAjusteCuotaRepository(prisma);
const personaRepository = new PersonaRepository(prisma);

const ajusteService = new AjusteCuotaService(ajusteRepository, historialRepository, personaRepository);
const ajusteController = new AjusteCuotaController(ajusteService, historialRepository);

// ========================================
// CRUD Routes for Ajustes
// ========================================

/**
 * POST /api/ajustes-cuota
 * Create a new manual adjustment
 */
router.post('/', ajusteController.createAjuste.bind(ajusteController));

/**
 * GET /api/ajustes-cuota
 * Get all adjustments with optional filters
 */
router.get('/', ajusteController.getAjustes.bind(ajusteController));

/**
 * GET /api/ajustes-cuota/stats
 * Get adjustment statistics (before :id route)
 */
router.get('/stats', ajusteController.getStats.bind(ajusteController));

/**
 * POST /api/ajustes-cuota/calcular
 * Calculate adjustment preview without applying
 */
router.post('/calcular', ajusteController.calcularAjuste.bind(ajusteController));

/**
 * GET /api/ajustes-cuota/persona/:personaId
 * Get all adjustments for a specific persona
 */
router.get('/persona/:personaId', ajusteController.getAjustesByPersona.bind(ajusteController));

/**
 * GET /api/ajustes-cuota/:id
 * Get adjustment by ID
 */
router.get('/:id', ajusteController.getAjusteById.bind(ajusteController));

/**
 * PUT /api/ajustes-cuota/:id
 * Update an existing adjustment
 */
router.put('/:id', ajusteController.updateAjuste.bind(ajusteController));

/**
 * DELETE /api/ajustes-cuota/:id
 * Permanently delete an adjustment (use with caution)
 */
router.delete('/:id', ajusteController.deleteAjuste.bind(ajusteController));

// ========================================
// Activation/Deactivation Routes
// ========================================

/**
 * POST /api/ajustes-cuota/:id/deactivate
 * Deactivate an adjustment (soft delete)
 */
router.post('/:id/deactivate', ajusteController.deactivateAjuste.bind(ajusteController));

/**
 * POST /api/ajustes-cuota/:id/activate
 * Reactivate an adjustment
 */
router.post('/:id/activate', ajusteController.activateAjuste.bind(ajusteController));

// ========================================
// History Routes
// ========================================

/**
 * GET /api/ajustes-cuota/:id/historial
 * Get history for a specific adjustment
 */
router.get('/:id/historial', ajusteController.getHistorial.bind(ajusteController));

export default router;
