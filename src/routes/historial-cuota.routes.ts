import { Router } from 'express';
import { AjusteCuotaController } from '@/controllers/ajuste-cuota.controller';
import { AjusteCuotaService } from '@/services/ajuste-cuota.service';
import { AjusteCuotaRepository } from '@/repositories/ajuste-cuota.repository';
import { HistorialAjusteCuotaRepository } from '@/repositories/historial-ajuste-cuota.repository';
import { PersonaRepository } from '@/repositories/persona.repository';
import { prisma } from '@/config/database';

const router = Router();

// Initialize dependencies (reuse same instances as ajuste-cuota routes)
const ajusteRepository = new AjusteCuotaRepository(prisma);
const historialRepository = new HistorialAjusteCuotaRepository(prisma);
const personaRepository = new PersonaRepository(prisma);

const ajusteService = new AjusteCuotaService(ajusteRepository, historialRepository, personaRepository);
const ajusteController = new AjusteCuotaController(ajusteService, historialRepository);

// ========================================
// History Query Routes
// ========================================

/**
 * GET /api/historial-cuota
 * Get all history entries with filters
 */
router.get('/', ajusteController.getAllHistorial.bind(ajusteController));

/**
 * GET /api/historial-cuota/stats
 * Get history statistics
 */
router.get('/stats', ajusteController.getHistorialStats.bind(ajusteController));

export default router;
