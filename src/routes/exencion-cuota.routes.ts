import { Router } from 'express';
import { ExencionCuotaController } from '@/controllers/exencion-cuota.controller';
import { ExencionCuotaService } from '@/services/exencion-cuota.service';
import { ExencionCuotaRepository } from '@/repositories/exencion-cuota.repository';
import { HistorialAjusteCuotaRepository } from '@/repositories/historial-ajuste-cuota.repository';
import { PersonaRepository } from '@/repositories/persona.repository';
import { prisma } from '@/config/database';

const router = Router();

// Initialize dependencies
const exencionRepository = new ExencionCuotaRepository(prisma);
const historialRepository = new HistorialAjusteCuotaRepository(prisma);
const personaRepository = new PersonaRepository(prisma);

const exencionService = new ExencionCuotaService(exencionRepository, historialRepository, personaRepository);
const exencionController = new ExencionCuotaController(exencionService);

// ========================================
// CRUD Routes
// ========================================

/**
 * POST /api/exenciones-cuota
 * Create a new exemption
 */
router.post('/', exencionController.createExencion.bind(exencionController));

/**
 * GET /api/exenciones-cuota
 * Get all exemptions with filters
 */
router.get('/', exencionController.getExenciones.bind(exencionController));

/**
 * GET /api/exenciones-cuota/stats
 * Get statistics (before :id route)
 */
router.get('/stats', exencionController.getStats.bind(exencionController));

/**
 * GET /api/exenciones-cuota/pendientes
 * Get pending exemptions
 */
router.get('/pendientes', exencionController.getPendientes.bind(exencionController));

/**
 * GET /api/exenciones-cuota/vigentes
 * Get active exemptions
 */
router.get('/vigentes', exencionController.getVigentes.bind(exencionController));

/**
 * POST /api/exenciones-cuota/check-periodo
 * Check if persona has exemption for a period
 */
router.post('/check-periodo', exencionController.checkExencionParaPeriodo.bind(exencionController));

/**
 * GET /api/exenciones-cuota/persona/:personaId
 * Get all exemptions for a persona
 */
router.get('/persona/:personaId', exencionController.getExencionesByPersona.bind(exencionController));

/**
 * GET /api/exenciones-cuota/:id
 * Get exemption by ID
 */
router.get('/:id', exencionController.getExencionById.bind(exencionController));

/**
 * PUT /api/exenciones-cuota/:id
 * Update an exemption
 */
router.put('/:id', exencionController.updateExencion.bind(exencionController));

/**
 * DELETE /api/exenciones-cuota/:id
 * Delete an exemption
 */
router.delete('/:id', exencionController.deleteExencion.bind(exencionController));

// ========================================
// Workflow Routes (Approval/Rejection)
// ========================================

/**
 * POST /api/exenciones-cuota/:id/aprobar
 * Approve an exemption
 */
router.post('/:id/aprobar', exencionController.aprobarExencion.bind(exencionController));

/**
 * POST /api/exenciones-cuota/:id/rechazar
 * Reject an exemption
 */
router.post('/:id/rechazar', exencionController.rechazarExencion.bind(exencionController));

/**
 * POST /api/exenciones-cuota/:id/revocar
 * Revoke an exemption
 */
router.post('/:id/revocar', exencionController.revocarExencion.bind(exencionController));

export default router;
