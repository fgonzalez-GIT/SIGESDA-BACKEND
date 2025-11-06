import { Router } from 'express';
import { FamiliarController } from '@/controllers/familiar.controller';
import { FamiliarService } from '@/services/familiar.service';
import { FamiliarRepository } from '@/repositories/familiar.repository';
import { PersonaRepository } from '@/repositories/persona.repository';
import { prisma } from '@/config/database';

const router = Router();

// Initialize dependencies
const familiarRepository = new FamiliarRepository(prisma);
const personaRepository = new PersonaRepository(prisma);
const familiarService = new FamiliarService(familiarRepository, personaRepository);
const familiarController = new FamiliarController(familiarService);

// Specialized query routes (MUST be before parameterized routes to avoid conflicts)
router.get('/search/avanzada', familiarController.searchFamiliares.bind(familiarController));
router.get('/stats/parentesco', familiarController.getParentescoStats.bind(familiarController));
router.get('/tipos/parentesco', familiarController.getTiposParentesco.bind(familiarController));
router.get('/tipos-parentesco', familiarController.getTiposParentesco.bind(familiarController)); // Alias para compatibilidad

// Socio-specific routes
router.get('/socio/:socioId', familiarController.getFamiliarsBySocio.bind(familiarController));
router.get('/socio/:socioId/familiares', familiarController.getFamiliarsBySocio.bind(familiarController)); // Alias para compatibilidad
router.get('/socio/:socioId/arbol', familiarController.getFamilyTree.bind(familiarController)); // Alias para compatibilidad
router.get('/socio/:socioId/tree', familiarController.getFamilyTree.bind(familiarController));
router.get('/socio/:socioId/disponibles', familiarController.getAvailableFamiliares.bind(familiarController));

// Relationship verification
router.get('/verify/:socioId/:familiarId', familiarController.checkRelationExists.bind(familiarController));
router.get('/verificar/:socioId/:familiarId', familiarController.checkRelationExists.bind(familiarController)); // Alias para compatibilidad

// Bulk operations
router.post('/bulk/create', familiarController.createBulkFamiliares.bind(familiarController));
router.delete('/bulk/delete', familiarController.deleteBulkFamiliares.bind(familiarController));

// Basic CRUD Routes (parameterized routes MUST be last)
router.post('/', familiarController.createFamiliar.bind(familiarController));
router.get('/', familiarController.getFamiliares.bind(familiarController));
router.get('/:id', familiarController.getFamiliarById.bind(familiarController));
router.put('/:id', familiarController.updateFamiliar.bind(familiarController));
router.delete('/:id', familiarController.deleteFamiliar.bind(familiarController));

export default router;