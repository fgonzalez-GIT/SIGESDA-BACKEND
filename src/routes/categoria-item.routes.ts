import { Router } from 'express';
import { CategoriaItemController } from '@/controllers/categoria-item.controller';
import { CategoriaItemService } from '@/services/categoria-item.service';
import { CategoriaItemRepository } from '@/repositories/categoria-item.repository';

const router = Router();

// Initialize dependencies
const repository = new CategoriaItemRepository();
const service = new CategoriaItemService();
const controller = new CategoriaItemController(service);

// Specialized routes FIRST (before parameterized routes)
router.get('/resumen', controller.getSummary.bind(controller));
router.post('/reordenar', controller.reorder.bind(controller));

// Query routes
router.get('/codigo/:codigo', controller.getByCodigo.bind(controller));

// Status change routes
router.patch('/:id/desactivar', controller.deactivate.bind(controller));
router.patch('/:id/activar', controller.activate.bind(controller));

// Statistics routes
router.get('/:id/estadisticas', controller.getUsageStats.bind(controller));

// Basic CRUD routes
router.post('/', controller.create.bind(controller));
router.get('/', controller.getAll.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

export default router;
