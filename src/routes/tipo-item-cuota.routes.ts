import { Router } from 'express';
import { TipoItemCuotaController } from '@/controllers/tipo-item-cuota.controller';
import { TipoItemCuotaService } from '@/services/tipo-item-cuota.service';
import { TipoItemCuotaRepository } from '@/repositories/tipo-item-cuota.repository';
import { CategoriaItemRepository } from '@/repositories/categoria-item.repository';

const router = Router();

// Initialize dependencies
const tipoRepository = new TipoItemCuotaRepository();
const categoriaRepository = new CategoriaItemRepository();
const service = new TipoItemCuotaService();
const controller = new TipoItemCuotaController(service);

// Specialized routes FIRST (before parameterized routes)
router.get('/resumen-por-categoria', controller.getSummaryByCategoria.bind(controller));
router.get('/calculados', controller.getCalculados.bind(controller));
router.get('/manuales', controller.getManuales.bind(controller));
router.post('/reordenar', controller.reorder.bind(controller));

// Query routes
router.get('/codigo/:codigo', controller.getByCodigo.bind(controller));
router.get('/categoria/:categoriaCodigo', controller.getByCategoriaCodigo.bind(controller));

// Action routes (specific item operations)
router.post('/:id/clonar', controller.clone.bind(controller));
router.patch('/:id/formula', controller.updateFormula.bind(controller));
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
