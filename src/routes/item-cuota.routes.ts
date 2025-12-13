import { Router } from 'express';
import { ItemCuotaController } from '@/controllers/item-cuota.controller';
import { ItemCuotaService } from '@/services/item-cuota.service';
import { ItemCuotaRepository } from '@/repositories/item-cuota.repository';
import { TipoItemCuotaRepository } from '@/repositories/tipo-item-cuota.repository';

const router = Router();

// Initialize dependencies
const itemRepository = new ItemCuotaRepository();
const tipoRepository = new TipoItemCuotaRepository();
const service = new ItemCuotaService();
const controller = new ItemCuotaController(service);

// Global statistics routes (no params)
router.get('/estadisticas', controller.getGlobalStats.bind(controller));

// Search routes by criteria
router.get('/tipo/:codigo', controller.findByTipoItemCodigo.bind(controller));
router.get('/categoria/:codigo', controller.findByCategoriaCodigo.bind(controller));

// Individual item operations (must be before /cuotas/:cuotaId)
router.get('/:id', controller.getById.bind(controller));
router.put('/:id', controller.updateItem.bind(controller));
router.delete('/:id', controller.deleteItem.bind(controller));
router.post('/:id/duplicar', controller.duplicarItem.bind(controller));

export default router;
