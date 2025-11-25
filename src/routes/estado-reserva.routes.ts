import { Router } from 'express';
import { EstadoReservaController } from '@/controllers/estado-reserva.controller';
import { EstadoReservaService } from '@/services/estado-reserva.service';
import { EstadoReservaRepository } from '@/repositories/estado-reserva.repository';
import { prisma } from '@/config/database';

const router = Router();

// Initialize dependencies
const repository = new EstadoReservaRepository(prisma);
const service = new EstadoReservaService(prisma);
const controller = new EstadoReservaController(service);

// Reorder endpoint (must be before /:id routes)
router.patch('/reorder', controller.reorder.bind(controller));

// Get statistics
router.get('/estadisticas/uso', controller.getEstadisticas.bind(controller));

// CRUD endpoints
router.post('/', controller.create.bind(controller));
router.get('/', controller.getAll.bind(controller));
router.get('/codigo/:codigo', controller.getByCodigo.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

export default router;
